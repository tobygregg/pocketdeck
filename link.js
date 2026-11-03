/*!
 * PocketDeck Link — the realtime connection between your phone and your Mac.
 *
 * How it works:
 *  - Both sides connect OUT to free public MQTT relays over secure WebSockets.
 *    No accounts, no VPN, no port forwarding, works on any network.
 *  - We talk to 3 relays at once. Any one of them being up is enough.
 *  - Every message is end-to-end encrypted with AES-256-GCM using a 256-bit key
 *    that only your Mac and your paired phones know. The relays only ever see
 *    random-looking bytes on a random-looking topic name.
 *  - Messages carry a timestamp + id, so old/replayed messages are thrown away.
 *
 * Runs unchanged in the browser and in Node 22+ (uses built-in WebSocket + WebCrypto).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PDLink = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_BROKERS = [
    'wss://broker.hivemq.com:8884/mqtt',
    'wss://broker.emqx.io:8084/mqtt',
    'wss://test.mosquitto.org:8081/mqtt',
  ];
  const PREFIX = 'pocketdeck/v1/';
  const CHUNK = 12000;              // characters per encrypted piece (relays limit message size)
  const MAX_AGE = 5 * 60 * 1000;    // ignore anything older than 5 minutes (replay protection)

  const te = new TextEncoder(), td = new TextDecoder();
  const C = globalThis.crypto;
  const rnd = n => C.getRandomValues(new Uint8Array(n));
  const hex = b => Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
  const rid = () => hex(rnd(8));

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
    str = String(str).replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    const s = atob(str); const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }

  /* ---------------- crypto ---------------- */
  async function derive(secretBytes) {
    if (!C || !C.subtle) throw new Error('This page needs HTTPS (secure context) for encryption.');
    const room = hex(new Uint8Array(await C.subtle.digest('SHA-256', concat(te.encode('pocketdeck/room/v1:'), secretBytes)))).slice(0, 32);
    const raw = new Uint8Array(await C.subtle.digest('SHA-256', concat(te.encode('pocketdeck/key/v1:'), secretBytes)));
    const key = await C.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
    return { room, key };
  }
  async function seal(key, obj) {
    const iv = rnd(12);
    const ct = new Uint8Array(await C.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(JSON.stringify(obj))));
    return concat(iv, ct);
  }
  async function unseal(key, bytes) {
    const pt = await C.subtle.decrypt({ name: 'AES-GCM', iv: bytes.subarray(0, 12) }, key, bytes.subarray(12));
    return JSON.parse(td.decode(pt));
  }

  /* ---------------- pairing codes ---------------- */
  const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L confusion
  function newCode() { return Array.from(rnd(8), b => CODE_ALPHABET[b % CODE_ALPHABET.length]).join(''); }
  const normCode = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const prettyCode = c => normCode(c).replace(/^(.{4})(.{4})$/, '$1-$2');
  const codeSecret = code => te.encode('pocketdeck/code/v1:' + normCode(code));

  /* ---------------- tiny MQTT 3.1.1 client over WebSocket ---------------- */
  function str16(s) { const b = te.encode(s); return concat(new Uint8Array([b.length >> 8, b.length & 255]), b); }
  function packet(type, body) {
    const len = []; let n = body.length;
    do { let d = n % 128; n = Math.floor(n / 128); if (n > 0) d |= 128; len.push(d); } while (n > 0);
    return concat(new Uint8Array([type].concat(len)), body);
  }

  class Mqtt {
    constructor(url, h) {
      this.url = url; this.h = h; this.subs = new Set(); this.ok = false;
      this.buf = new Uint8Array(0); this.backoff = 800; this.pid = 1; this.closed = false;
      this.connect();
    }
    connect() {
      if (this.closed) return;
      let ws;
      try { ws = new WebSocket(this.url, ['mqtt']); } catch (e) { return this.retry(); }
      this.ws = ws; this.buf = new Uint8Array(0);
      ws.binaryType = 'arraybuffer';
      const guard = setTimeout(() => { if (!this.ok) try { ws.close(); } catch (e) {} }, 9000);
      ws.onopen = () => {
        const body = concat(str16('MQTT'), new Uint8Array([4, 0x02, 0, 60]), str16('pd' + hex(rnd(8))));
        try { ws.send(packet(0x10, body)); } catch (e) {}
      };
      ws.onmessage = ev => { if (ev.data instanceof ArrayBuffer) this.feed(new Uint8Array(ev.data)); };
      const gone = () => { clearTimeout(guard); if (this.ws !== ws) return; this.ws = null; this.down(); };
      ws.onclose = gone; ws.onerror = gone;
    }
    down() {
      const was = this.ok; this.ok = false; clearInterval(this.pinger); this.awaitPing = 0;
      if (was) this.h.onState();
      this.retry();
    }
    retry() {
      if (this.closed) return;
      clearTimeout(this.rt);
      this.rt = setTimeout(() => this.connect(), this.backoff);
      this.backoff = Math.min(this.backoff * 2, 15000);
    }
    /** Reconnect right now (e.g. phone switched from Wi-Fi to 4G) */
    kick() {
      if (this.closed) return;
      this.backoff = 800;
      if (this.ws) { try { this.ws.close(); } catch (e) {} } else { clearTimeout(this.rt); this.connect(); }
    }
    feed(chunk) {
      this.buf = this.buf.length ? concat(this.buf, chunk) : chunk;
      for (;;) {
        if (this.buf.length < 2) return;
        let mult = 1, len = 0, i = 1, d;
        do { if (i >= this.buf.length) return; d = this.buf[i++]; len += (d & 127) * mult; mult *= 128; } while (d & 128);
        if (this.buf.length < i + len) return;
        const type = this.buf[0] >> 4, flags = this.buf[0] & 15;
        const body = this.buf.slice(i, i + len);
        this.buf = this.buf.slice(i + len);
        this.handle(type, flags, body);
      }
    }
    handle(type, flags, body) {
      if (type === 2) {                      // CONNACK
        if (body[1] !== 0) { try { this.ws.close(); } catch (e) {} return; }
        this.ok = true; this.backoff = 800;
        for (const t of this.subs) this.sendSub(t);
        clearInterval(this.pinger);
        this.pinger = setInterval(() => {
          if (this.awaitPing && Date.now() - this.awaitPing > 12000) { try { this.ws.close(); } catch (e) {} return; }
          this.awaitPing = Date.now(); this.raw(new Uint8Array([0xC0, 0]));
        }, 20000);
        this.h.onState();
      } else if (type === 3) {               // PUBLISH
        const tl = (body[0] << 8) | body[1];
        const topic = td.decode(body.subarray(2, 2 + tl));
        let off = 2 + tl; if ((flags >> 1) & 3) off += 2;
        this.h.onMessage(topic, body.slice(off));
      } else if (type === 13) this.awaitPing = 0; // PINGRESP
    }
    raw(bytes) {
      try { if (this.ws && this.ws.readyState === 1) { this.ws.send(bytes); return true; } } catch (e) {}
      return false;
    }
    nextId() { this.pid = (this.pid % 65535) + 1; return new Uint8Array([this.pid >> 8, this.pid & 255]); }
    sendSub(t) { this.raw(packet(0x82, concat(this.nextId(), str16(t), new Uint8Array([0])))); }
    subscribe(t) { this.subs.add(t); if (this.ok) this.sendSub(t); }
    unsubscribe(t) { this.subs.delete(t); if (this.ok) this.raw(packet(0xA2, concat(this.nextId(), str16(t)))); }
    publish(t, payload) { return this.ok && this.raw(packet(0x30, concat(str16(t), payload))); }
    close() {
      this.closed = true; clearInterval(this.pinger); clearTimeout(this.rt);
      if (this.ok) this.raw(new Uint8Array([0xE0, 0]));
      try { this.ws && this.ws.close(); } catch (e) {}
      this.ok = false;
    }
  }

  /* ---------------- Link: encrypted rooms over several relays ---------------- */
  class Link {
    /**
     * opts.brokers   array of wss:// URLs (defaults to 3 public relays)
     * opts.onMessage (roomName, msg) for every decrypted message
     * opts.onState   (relaysUp, relaysTotal)
     */
    constructor(opts = {}) {
      this.o = opts;
      this.me = rid();
      this.rooms = new Map();   // name -> { room, key, inbound, outbound }
      this.seen = new Map();    // dedupe key -> time
      this.parts = new Map();   // chunk id -> { at, n, got, list }
      this.pending = new Map(); // request id -> resolve
      const urls = opts.brokers && opts.brokers.length ? opts.brokers : DEFAULT_BROKERS;
      this.relays = urls.map(u => new Mqtt(u, {
        onMessage: (t, p) => this.incoming(t, p),
        onState: () => {
          // a relay just (re)connected: re-send waiting requests straight away instead of waiting for the retry timer
          setTimeout(() => { for (const p of this.pending.values()) p.fire(); }, 60);
          if (this.o.onState) this.o.onState(this.up(), this.relays.length);
        },
      }));
      this.gc = setInterval(() => this.prune(), 30000);
      if (this.gc.unref) this.gc.unref();
    }
    up() { return this.relays.filter(r => r.ok).length; }
    relayStatus() { return this.relays.map(r => ({ url: r.url, ok: r.ok })); }
    /** Reconnect relays now. force=true also resets ones that *look* connected (after iOS backgrounding). */
    kick(force) { for (const r of this.relays) if (force || !r.ok) r.kick(); }

    /** side 'mac' listens on /m and talks on /p, side 'phone' the other way round */
    async join(name, secretBytes, side) {
      const { room, key } = await derive(secretBytes);
      this.leave(name);
      const inbound = PREFIX + room + (side === 'mac' ? '/m' : '/p');
      const outbound = PREFIX + room + (side === 'mac' ? '/p' : '/m');
      this.rooms.set(name, { room, key, inbound, outbound });
      for (const r of this.relays) r.subscribe(inbound);
      return room;
    }
    leave(name) {
      const r = this.rooms.get(name);
      if (!r) return;
      this.rooms.delete(name);
      for (const x of this.relays) x.unsubscribe(r.inbound);
    }

    async send(name, obj) {
      const r = this.rooms.get(name);
      if (!r) return false;
      obj.id = obj.id || rid(); obj.n = obj.n || 1; obj.t = Date.now(); obj.from = this.me;
      const text = JSON.stringify(obj);
      const pieces = [];
      if (text.length <= CHUNK) pieces.push(obj);
      else {
        const cid = rid(), n = Math.ceil(text.length / CHUNK);
        for (let i = 0; i < n; i++) pieces.push({ k: 'chunk', id: cid + '.' + i, n: 1, t: obj.t, from: this.me, cid, i, of: n, d: text.slice(i * CHUNK, (i + 1) * CHUNK) });
      }
      let sent = false;
      for (const p of pieces) {
        const bytes = await seal(r.key, p);
        for (const relay of this.relays) if (relay.publish(r.outbound, bytes)) sent = true;
      }
      return sent;
    }

    async incoming(topic, payload) {
      let name = null, room = null;
      for (const [n, r] of this.rooms) if (r.inbound === topic) { name = n; room = r; break; }
      if (!room) return;
      let msg;
      try { msg = await unseal(room.key, payload); } catch (e) { return; } // not ours / tampered
      if (!msg || msg.from === this.me) return;
      if (Math.abs(Date.now() - msg.t) > MAX_AGE) return;
      const dk = name + ':' + msg.id + ':' + msg.n;
      if (this.seen.has(dk)) return;            // same message via another relay
      this.seen.set(dk, Date.now());
      if (msg.k === 'chunk') {
        let p = this.parts.get(msg.cid);
        if (!p) { p = { at: Date.now(), got: 0, list: new Array(msg.of) }; this.parts.set(msg.cid, p); }
        if (p.list[msg.i] == null) { p.list[msg.i] = msg.d; p.got++; }
        if (p.got < msg.of) return;
        this.parts.delete(msg.cid);
        try { msg = JSON.parse(p.list.join('')); } catch (e) { return; }
        const dk2 = name + ':' + msg.id + ':' + msg.n;
        if (this.seen.has(dk2)) return;
        this.seen.set(dk2, Date.now());
      }
      if (msg.k === 'res' && this.pending.has(msg.re)) this.pending.get(msg.re).done(msg);
      if (this.o.onMessage) this.o.onMessage(name, msg);
    }

    /** Phone → Mac request with automatic retries; resolves with the Mac's reply */
    request(name, method, path, body, timeout = 12000) {
      return new Promise((resolve, reject) => {
        const id = rid(); let n = 0;
        const fire = () => { n++; this.send(name, { k: 'req', id, n, method, path, body }); };
        const again = setInterval(fire, 1600);
        const timer = setTimeout(() => {
          clearInterval(again); this.pending.delete(id);
          reject(new Error(this.up() ? 'Your Mac didn’t answer. Is it awake with PocketDeck running?' : 'No internet connection right now'));
        }, timeout);
        this.pending.set(id, { fire, done: msg => { clearTimeout(timer); clearInterval(again); this.pending.delete(id); resolve(msg); } });
        fire();
      });
    }

    prune() {
      const now = Date.now();
      for (const [k, t] of this.seen) if (now - t > MAX_AGE + 60000) this.seen.delete(k);
      for (const [k, p] of this.parts) if (now - p.at > 60000) this.parts.delete(k);
    }
    close() { clearInterval(this.gc); for (const r of this.relays) r.close(); this.rooms.clear(); }
  }

  return { Link, DEFAULT_BROKERS, b64u, unb64u, rnd, rid, newCode, normCode, prettyCode, codeSecret };
});
