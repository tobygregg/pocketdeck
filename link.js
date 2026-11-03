/*!
 * PocketDeck Link — the connection between your phone and your Mac.
 *
 * How it works (only ever uses normal HTTPS on port 443, so no network blocks it):
 *  - Your Mac opens an outbound Cloudflare tunnel and gets a secure https:// address.
 *  - It posts that address, ENCRYPTED, to endpoint.json in your own GitHub repo (the "address book").
 *    If the address ever changes (Mac restart), your phone just looks it up again.
 *  - Every request + reply is end-to-end encrypted with AES-256-GCM using the 256-bit key that only
 *    your Mac and your paired phones have. Cloudflare and GitHub only ever see scrambled bytes.
 *  - Live updates use long-polling (a request the Mac answers the moment something happens).
 *
 * Runs in the browser and in Node 22+ (WebCrypto + fetch).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PDLink = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const MAX_AGE = 5 * 60 * 1000;   // reject anything older than 5 minutes (replay protection)
  const te = new TextEncoder(), td = new TextDecoder();
  const C = globalThis.crypto;
  const rnd = n => C.getRandomValues(new Uint8Array(n));
  const hex = b => Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
  const rid = () => hex(rnd(8));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const online = () => typeof navigator === 'undefined' || navigator.onLine !== false;

  function concat(...arrs) {
    let n = 0; for (const a of arrs) n += a.length;
    const out = new Uint8Array(n); let o = 0;
    for (const a of arrs) { out.set(a, o); o += a.length; }
    return out;
  }
  function b64u(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function unb64u(str) {
    str = String(str).trim().replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    const s = atob(str); const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }

  /* ---------------- crypto ---------------- */
  async function derive(secretBytes) {
    if (!C || !C.subtle) throw new Error('This page needs HTTPS for encryption.');
    const room = hex(new Uint8Array(await C.subtle.digest('SHA-256', concat(te.encode('pocketdeck/room/v1:'), secretBytes)))).slice(0, 32);
    const raw = new Uint8Array(await C.subtle.digest('SHA-256', concat(te.encode('pocketdeck/key/v1:'), secretBytes)));
    const key = await C.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
    return { room, key };
  }
  async function seal(key, obj) {
    const iv = rnd(12);
    const ct = new Uint8Array(await C.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(JSON.stringify(obj))));
    return b64u(concat(iv, ct));
  }
  async function unseal(key, text) {
    const bytes = unb64u(text);
    const pt = await C.subtle.decrypt({ name: 'AES-GCM', iv: bytes.subarray(0, 12) }, key, bytes.subarray(12));
    return JSON.parse(td.decode(pt));
  }
  const fresh = msg => msg && typeof msg.t === 'number' && Math.abs(Date.now() - msg.t) < MAX_AGE;

  /* ---------------- pairing codes ---------------- */
  const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L mix-ups
  function newCode() { return Array.from(rnd(8), b => CODE_ALPHABET[b % CODE_ALPHABET.length]).join(''); }
  const normCode = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const prettyCode = c => normCode(c).replace(/^(.{4})(.{4})$/, '$1-$2');
  const codeSecret = code => te.encode('pocketdeck/code/v1:' + normCode(code));

  /* ---------------- address book (encrypted file in your GitHub repo) ---------------- */
  async function fetchText(url, opts = {}, ms = 8000) {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), ms);
    try {
      const r = await fetch(url, { cache: 'no-store', ...opts, signal: ctrl.signal });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.text();
    } finally { clearTimeout(t); }
  }
  /** Looks the file up in a few places at once, decrypts it, returns the newest { url, t, ... } */
  async function lookup(repo, file, key) {
    if (!repo) return null;
    const tries = [];
    if (repo.raw) tries.push(() => fetchText(`${repo.raw}${file}?t=${Date.now()}`));
    if (repo.api) tries.push(() => fetchText(`${repo.api}${file}?ref=${repo.branch || 'main'}&t=${Date.now()}`, { headers: { accept: 'application/vnd.github.raw+json' } }));
    if (repo.pages) tries.push(() => fetchText(`${repo.pages}${file}?t=${Date.now()}`));
    const results = await Promise.all(tries.map(async f => {
      try {
        const doc = JSON.parse(await f());
        const inner = await unseal(key, doc.d);
        return { ...inner, t: doc.t };
      } catch (e) { return null; }
    }));
    return results.filter(Boolean).sort((a, b) => b.t - a.t)[0] || null;
  }

  /* ---------------- the link ---------------- */
  class Link {
    /**
     * opts.secret   base64url pairing key
     * opts.repo     { raw, api, pages, branch } where endpoint.json lives
     * opts.url      last known Mac address (optional — speeds up startup)
     * opts.onUrl    (url) when the Mac's address changes, so you can remember it
     * opts.onEvent  (event, data) live events from the Mac
     * opts.onState  ('ok' | 'mac' | 'offline' | 'revoked' | 'connecting')
     */
    constructor(opts) {
      this.o = opts; this.url = opts.url || null; this.since = 0; this.state = 'connecting';
      this.stopped = false; this.watch = true; this.lastLookup = 0;
    }
    async start() {
      const { key } = await derive(unb64u(this.o.secret));
      this.key = key;
      if (!this.url) await this.discover(true);
      this.loop();
    }
    setState(s) { if (s !== this.state) { this.state = s; if (this.o.onState) this.o.onState(s); } }

    async discover(force) {
      if (!force && Date.now() - this.lastLookup < 4000) return this.url;  // don't hammer GitHub
      this.lastLookup = Date.now();
      const found = await lookup(this.o.repo, 'endpoint.json', this.key);
      if (found && found.url && found.url !== this.url) {
        this.url = found.url;
        if (this.o.onUrl) this.o.onUrl(found.url);
      }
      return this.url;
    }

    async post(path, obj, ms) {
      if (!this.url) throw new Error('no-address');
      obj.t = Date.now();
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), ms);
      if (path === '/x/poll') this.pollCtrl = ctrl;
      try {
        const res = await fetch(this.url + path, { method: 'POST', body: await seal(this.key, obj), headers: { 'content-type': 'text/plain' }, signal: ctrl.signal, cache: 'no-store' });
        if (res.status === 403) { this.setState('revoked'); throw new Error('revoked'); }
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const msg = await unseal(this.key, await res.text());
        if (!fresh(msg)) throw new Error('stale reply');
        return msg;
      } finally { clearTimeout(timer); }
    }

    /** Ask the Mac to do something. Retries (with a fresh address lookup) until timeout. */
    async request(method, path, body, timeout = 12000) {
      const msg = { k: 'req', id: rid(), method, path, body: body || {} };
      const deadline = Date.now() + timeout;
      let delay = 300;
      for (;;) {
        try {
          const r = await this.post('/x', msg, Math.max(1500, Math.min(10000, deadline - Date.now())));
          this.setState('ok');
          return r;
        } catch (e) {
          if (this.state === 'revoked') throw new Error('This phone was unpaired');
          this.setState(online() ? 'mac' : 'offline');
          if (Date.now() + delay > deadline) throw new Error(online() ? 'Your Mac didn’t answer. Is it awake with PocketDeck running?' : 'No internet connection right now');
          await this.discover();
          await sleep(delay); delay = Math.min(delay * 2, 2000);
        }
      }
    }

    /** Long-poll loop: the Mac replies the instant there's news (or after ~25s with nothing) */
    async loop() {
      let backoff = 500;
      while (!this.stopped) {
        if (this.state === 'revoked') return;
        try {
          if (!this.url) { await this.discover(true); if (!this.url) throw new Error('no-address'); }
          const r = await this.post('/x/poll', { k: 'poll', since: this.since, watch: this.watch }, 32000);
          this.setState('ok'); backoff = 500;
          if (r.reset || r.seq < this.since) this.since = r.seq;
          for (const ev of r.events || []) {
            if (ev.seq <= this.since) continue;
            this.since = ev.seq;
            if (this.o.onEvent) this.o.onEvent(ev.event, ev.data);
          }
        } catch (e) {
          if (this.stopped || this.state === 'revoked') return;
          if (e.name === 'AbortError' && this.woken) { this.woken = false; continue; }
          this.setState(online() ? 'mac' : 'offline');
          await this.discover().catch(() => {});
          await sleep(backoff); backoff = Math.min(backoff * 2, 8000);
        }
      }
    }
    /** Call when the app comes back to the foreground: restart the live connection immediately */
    wake() { this.woken = true; try { this.pollCtrl && this.pollCtrl.abort(); } catch (e) {} }
    setWatching(on) { this.watch = on; }
    stop() { this.stopped = true; try { this.pollCtrl && this.pollCtrl.abort(); } catch (e) {} }
  }

  /** Pair using the 8-character code shown on the Mac */
  async function pairWithCode(repo, code) {
    const { key } = await derive(codeSecret(code));
    let ep = null;
    for (let i = 0; i < 6 && !ep; i++) {           // the Mac may have only just published it
      ep = await lookup(repo, 'pair.json', key);
      if (!ep) await sleep(1500);
    }
    if (!ep || !ep.url) throw new Error('That code didn’t work. Check it on your Mac (codes change every 10 min and work once).');
    const r = await fetch(ep.url + '/x/pair', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: await seal(key, { k: 'pair', t: Date.now(), id: rid() }) });
    if (!r.ok) throw new Error('That code has expired. Use the new one on your Mac.');
    const res = await unseal(key, await r.text());
    if (!fresh(res) || !res.secret) throw new Error('Pairing failed — try again');
    return { secret: res.secret, url: ep.url };
  }

  return { Link, pairWithCode, derive, seal, unseal, fresh, b64u, unb64u, rnd, rid, newCode, normCode, prettyCode, codeSecret };
});
