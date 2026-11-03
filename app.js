/* PocketDeck — phone app. Vanilla JS, no build step. */
(() => {
'use strict';

/* ================= helpers ================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') { for (const [sk, sv] of Object.entries(v)) sk.startsWith('--') ? el.style.setProperty(sk, sv) : (el.style[sk] = sv); }
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'value') el.value = v;
    else if (k === 'checked') el.checked = !!v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}
const svg = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const I = {
  logo: `<svg viewBox="0 0 24 24" fill="#fff"><rect x="3" y="3" width="8" height="8" rx="2.4"/><rect x="13" y="3" width="8" height="8" rx="2.4" opacity=".7"/><rect x="3" y="13" width="8" height="8" rx="2.4" opacity=".7"/><rect x="13" y="13" width="8" height="8" rx="2.4" opacity=".45"/></svg>`,
  edit: svg('<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  x: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  trash: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  copy: svg('<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>'),
  play: svg('<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>'),
  pause: svg('<rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor"/><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor"/>'),
  next: svg('<path d="M5 5v14l10-7z" fill="currentColor"/><path d="M19 5v14"/>'),
  prev: svg('<path d="M19 5v14L9 12z" fill="currentColor"/><path d="M5 5v14"/>'),
  chev: svg('<path d="M9 6l6 6-6 6"/>'),
  left: svg('<path d="M15 6l-6 6 6 6"/>'),
  up: svg('<path d="M6 15l6-6 6 6"/>'),
  down: svg('<path d="M6 9l6 6 6-6"/>'),
  run: svg('<path d="M7 4.5v15l12-7.5z"/>'),
  dup: svg('<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M4 16V6a2 2 0 0 1 2-2h10"/>'),
};

const PALETTE = {
  claude: ['#E8845C', '#B9512C'], red: ['#ff6b6b', '#c9213d'], orange: ['#ffa24c', '#e25a12'], amber: ['#ffcf5a', '#e08b00'],
  lime: ['#b5ec4f', '#4f9a0c'], green: ['#3ee0a1', '#0a8a58'], teal: ['#36dccb', '#0a7b73'], cyan: ['#3fd9f5', '#0a7fac'],
  sky: ['#62bdff', '#1d6ae0'], blue: ['#5b84ff', '#2235d4'], indigo: ['#8a8fff', '#4235c9'], violet: ['#b089ff', '#6a28d6'],
  fuchsia: ['#f37cff', '#a118ad'], pink: ['#ff79b6', '#d41e68'], rose: ['#ff8495', '#bd1340'], slate: ['#6c7a92', '#2a3344'],
  zinc: ['#5f5f6b', '#23232a'], white: ['#ffffff', '#cdcdd8'],
};
const EMOJI = '✳️ 🤖 💬 🚀 🌐 🔒 📸 ✂️ 👀 ☕ 🌗 🎧 🎵 ⏯️ ⏭️ ⏮️ 🔊 🔉 🔇 🎚️ 💻 ⌨️ 🧠 🛠️ 🐙 ☁️ 🧪 📁 📂 🗂️ 📝 📋 📤 📥 🔔 🗣️ ⏱️ 🍅 🎯 🙈 🫣 🚨 🧹 👻 💡 🏠 🌙 ☀️ 🔥 ⚡️ ✨ 💎 🎮 🎸 🎹 🥁 🎙️ 📹 🎬 🖥️ 🔍 🧩 🪄 🛰️ 💚 ❤️ 👍 😎 🫡 💀 🗿 📈 💸 🛒 📦 ✈️ 🚗 🏋️ 🍕'.split(' ');

const LS = {
  get(k, d) { try { const v = localStorage.getItem('pd.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('pd.' + k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem('pd.' + k); } catch {} },
};
const uid = p => p + '_' + Math.random().toString(36).slice(2, 9);
const clone = o => JSON.parse(JSON.stringify(o));
const fmtTime = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); const m = Math.floor(s / 60); return m >= 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}` : `${m}:${String(s % 60).padStart(2, '0')}`; };

/* ================= state ================= */
const S = {
  token: null, config: null, actions: [], actionMap: {}, server: {}, status: null, skew: 0,
  page: LS.get('page', 0), edit: false, connected: false, latency: null, sheets: 0, pendingConfig: null, es: null,
};
const root = $('#app');

/* ================= haptics ================= */
const hapticLabel = $('#hapticLabel');
function haptic() {
  if (!LS.get('haptics', true)) return;
  try { if (navigator.vibrate) navigator.vibrate(8); else hapticLabel.click(); } catch {}
}

/* ================= the link to your Mac (encrypted, over normal HTTPS) ================= */
const REPO = window.PD_REPO || null;   // where your Mac publishes its (encrypted) address — from deck-config.js

async function api(method, path, body) {
  if (!S.link || !S.link.key) throw new Error('Still connecting…');
  const res = await S.link.request(method, path.replace(/^\/api/, ''), body || {});
  const d = res.data || {};
  if (res.status >= 400 || d.ok === false) throw new Error(d.error || `Error ${res.status}`);
  return d;
}

/* ================= boot & pairing ================= */
function hashSecret() { const m = location.hash.match(/#pd1\.([A-Za-z0-9_-]{40,})/); return m ? m[1] : null; }
// "Add to Home Screen" saves the current address, so keeping the key in the #hash makes the icon stay paired.
// (#hash parts never leave your phone — web servers don't see them.)
function keepHash() { if (S.secret && location.hash !== '#pd1.' + S.secret) history.replaceState(null, '', location.pathname + location.search + '#pd1.' + S.secret); }

async function boot() {
  if (!window.isSecureContext || !(window.crypto && crypto.subtle)) {
    return showMessage('Open the https:// link 🔐', 'PocketDeck encrypts everything, which only works on secure pages. Scan the QR code in the PocketDeck app on your Mac.');
  }
  const fromHash = hashSecret();
  if (fromHash && fromHash !== LS.get('secret', null)) { LS.set('secret', fromHash); LS.del('config'); LS.del('url'); }
  S.secret = LS.get('secret', null);
  if (!S.secret) return showPair();
  keepHash();
  const cached = LS.get('config', null);
  if (cached) { S.config = cached; S.actions = LS.get('actions', []); indexActions(); render(); }
  await connect();
  loadDeck();
}
async function loadDeck() {
  try {
    const d = await api('GET', '/bootstrap');
    S.config = d.config; S.actions = d.actions; S.server = d.server || {};
    LS.set('config', d.config); LS.set('actions', d.actions);
    indexActions(); render();
    if (d.status) onStatus(d.status);
    maybeTip(); measure();
  } catch (e) {
    if (!S.secret) return;
    if (!S.config) showOffline();
    setTimeout(loadDeck, 2500);
  }
}
function indexActions() { S.actionMap = Object.fromEntries(S.actions.map(a => [a.type, a])); }

async function pairWithCode(code) {
  const clean = PDLink.normCode(code);
  if (clean.length !== 8) throw new Error('The code is 8 characters');
  const r = await PDLink.pairWithCode(REPO, clean);
  LS.set('secret', r.secret); LS.set('url', r.url); LS.del('config');
  S.secret = r.secret; keepHash();
}

function unpair(msg) {
  S.secret = null; LS.del('secret'); LS.del('config'); LS.del('url');
  if (S.link) { S.link.stop(); S.link = null; }
  history.replaceState(null, '', location.pathname + location.search);
  showPair(msg);
}

function showPair(msg) {
  document.body.className = '';
  root.innerHTML = '';
  const inp = h('input', { class: 'pin code', autocapitalize: 'characters', autocomplete: 'off', autocorrect: 'off', spellcheck: 'false', maxlength: '9', placeholder: 'XXXX-XXXX', 'aria-label': 'Pairing code' });
  const m = h('div', { class: 'msg' }, msg || '');
  const btn = h('button', { class: 'btn primary' }, 'Pair ✨');
  let busy = false;
  const go = async () => {
    if (busy) return;
    const v = PDLink.normCode(inp.value);
    if (v.length !== 8) { m.textContent = 'The code is 8 characters'; return; }
    busy = true; m.textContent = ''; btn.textContent = 'Finding your Mac…'; haptic();
    try { await pairWithCode(v); boot(); }
    catch (e) { m.textContent = e.message; btn.textContent = 'Pair ✨'; busy = false; inp.select(); }
  };
  btn.addEventListener('click', go);
  inp.addEventListener('input', () => {
    const v = PDLink.normCode(inp.value).slice(0, 8);
    inp.value = v.length > 4 ? v.slice(0, 4) + '-' + v.slice(4) : v;
    if (v.length === 8) go();
  });
  root.append(h('div', { class: 'pair' },
    h('div', { class: 'logo', html: I.logo }),
    h('h1', {}, 'Pair with your Mac'),
    h('p', {}, 'Easiest: open PocketDeck on your Mac and point your camera at the QR code. Or type the 8-character code shown there:'),
    inp, btn, m,
    h('p', { class: 'fine' }, 'Works from anywhere once paired: home Wi-Fi, 4G, school. Everything is end-to-end encrypted.')));
}

function showMessage(title, text, ...buttons) {
  root.innerHTML = '';
  root.append(h('div', { class: 'pair' }, h('div', { class: 'logo', html: I.logo }), h('h1', {}, title), h('p', {}, text), buttons));
}
function showOffline() {
  showMessage('Can’t reach your Mac 😵‍💫',
    S.linkState === 'offline' ? 'Looks like your phone has no internet right now. Retrying automatically…'
      : 'Your Mac isn’t answering. Is it awake, online and running PocketDeck? Retrying automatically…',
    h('button', { class: 'btn', onclick: () => location.reload() }, 'Try again'),
    h('button', { class: 'btn', onclick: () => unpair() }, 'Pair again'));
}

function maybeTip() {
  if (navigator.standalone || matchMedia('(display-mode: standalone)').matches || LS.get('tipShown')) return;
  LS.set('tipShown', true);
  dialog({ title: 'Make it an app 📲', text: 'Tap Share in Safari, then “Add to Home Screen”. It opens full-screen like a real app, already paired, and works from anywhere.', ok: 'Got it' });
}

/* ================= live connection ================= */
async function connect() {
  if (S.link) S.link.stop();
  S.linkState = 'connecting';
  S.link = new PDLink.Link({
    secret: S.secret, repo: REPO, url: LS.get('url', null),
    onUrl: u => LS.set('url', u),
    onEvent: onEvent,
    onState: st => {
      S.linkState = st;
      if (st === 'revoked') return unpair('Your Mac unpaired this phone. Scan the QR code again to reconnect.');
      updateConnState();
    },
  });
  S.link.setWatching(document.visibilityState === 'visible');
  await S.link.start();
}
function onEvent(ev, data) {
  if (ev === 'status') onStatus(data);
  else if (ev === 'config') onRemoteConfig(data);
  else if (ev === 'toast') toast(data.text, data.kind);
}
function updateConnState() {
  S.connWhy = S.linkState === 'ok' ? 'ok' : S.linkState === 'offline' ? 'offline' : S.linkState === 'connecting' ? 'connecting' : 'mac';
  const on = S.connWhy === 'ok';
  if (on && !S.connected) setTimeout(() => { S.latency = null; measure(); }, 400); // just came back: fresh measurement
  S.connected = on;
  const dot = $('.live-dot'); if (dot) dot.classList.toggle('on', on);
  if (S.config) banner(!on && S.connWhy !== 'connecting', S.connWhy === 'offline' ? 'No internet — reconnecting' : 'Waiting for your Mac…');
  updateSubtitle();
}
/* latency: a full encrypted round trip phone → Mac → phone */
async function measure() {
  if (!S.link || document.visibilityState !== 'visible') return;
  const t0 = performance.now();
  try {
    await api('GET', '/ping');
    const ms = Math.round(performance.now() - t0);
    S.latency = ms < 2500 ? ms : null;
  } catch { S.latency = null; }
  updateSubtitle();
}
setInterval(measure, 20000);
// Wi-Fi ↔ 4G switches and iOS backgrounding silently kill connections — reconnect immediately
let hiddenAt = 0;
window.addEventListener('online', () => { if (S.link) { S.link.wake(); setTimeout(measure, 800); } });
window.addEventListener('pageshow', e => { if (e.persisted && S.link) S.link.wake(); });
document.addEventListener('visibilitychange', () => {
  const visible = document.visibilityState === 'visible';
  if (S.link) S.link.setWatching(visible);
  if (!visible) { hiddenAt = Date.now(); return; }
  if (!S.link) return;
  if (Date.now() - hiddenAt > 3000) S.link.wake();
  setTimeout(measure, 600);
  if (LS.get('wake', false)) wake(true);
});

function onStatus(s) {
  S.status = s; S.skew = (s.now || Date.now()) - Date.now();
  updateLive(); updateSubtitle();
}
function onRemoteConfig(c) {
  LS.set('config', c);
  if (JSON.stringify(c) === JSON.stringify(S.config)) return;
  if (S.sheets || S.dragging) { S.pendingConfig = c; return; }
  S.config = c; render();
}

/* ================= config save ================= */
let saveTimer = null;
function saveConfig(now) {
  LS.set('config', S.config);
  clearTimeout(saveTimer);
  const go = () => api('PUT', '/api/config', { config: S.config }).catch(e => toast('Couldn’t save: ' + e.message, 'err'));
  if (now) return go();
  saveTimer = setTimeout(go, 250);
}
const pages = () => S.config.pages;
const allButtons = () => pages().flatMap(p => p.buttons.map(b => ({ ...b, _page: p })));
function locate(id) { for (const p of pages()) { const i = p.buttons.findIndex(b => b.id === id); if (i >= 0) return { page: p, index: i, button: p.buttons[i] }; } return null; }

/* ================= render ================= */
function applyTheme() {
  const st = S.config.settings || {};
  const [a1, a2] = PALETTE[st.accent] || PALETTE.violet;
  document.documentElement.style.setProperty('--accent', a1);
  document.documentElement.style.setProperty('--accent-2', a2);
  document.body.classList.toggle('glass', st.tileStyle === 'glass');
  document.body.classList.toggle('nolabels', st.showLabels === false);
  document.body.classList.toggle('oled', !!LS.get('oled', false));
  document.body.classList.toggle('editing', S.edit);
}

function render() {
  if (!S.config) return;
  applyTheme();
  S.page = Math.min(S.page, pages().length - 1);
  root.innerHTML = '';
  const cols = Math.max(2, Math.min(8, Number(S.config.settings.columns) || 4));

  const header = h('header', { class: 'top' },
    h('div', { class: 'brand' },
      h('div', { class: 'logo', html: I.logo }),
      h('div', { class: 'brand-text' },
        h('b', {}, S.config.settings.deckName || 'PocketDeck'),
        h('small', {}, h('span', { class: 'live-dot' + (S.connected ? ' on' : '') }), h('span', { class: 'sub' }, '')))),
    h('button', { class: 'icon-btn' + (S.edit ? ' active' : ''), 'aria-label': 'Edit', html: S.edit ? I.check : I.edit, onclick: () => setEdit(!S.edit) }),
    h('button', { class: 'icon-btn', 'aria-label': 'Settings', html: I.gear, onclick: openSettings }));

  const tabs = h('nav', { class: 'tabs' }, pages().map((p, i) => {
    const t = h('button', { class: 'tab' + (i === S.page ? ' active' : ''), 'data-i': i },
      p.icon ? h('span', {}, p.icon) : null, p.name, h('span', { class: 'pencil', html: I.edit }));
    t.addEventListener('click', () => { haptic(); if (S.edit && i === S.page) openPageEditor(p.id); else goPage(i); });
    return t;
  }), S.edit ? h('button', { class: 'tab add', onclick: addPage }, '+ Page') : null);

  const pagesEl = h('main', { class: 'pages' }, pages().map(p => {
    const grid = h('div', { class: 'grid', style: { '--cols': cols } }, p.buttons.map(b => tileEl(b, p)));
    if (S.edit) grid.append(h('button', { class: 'tile add', html: I.plus, 'aria-label': 'Add button', onclick: () => openButtonEditor(null, p.id) }));
    const kids = [grid];
    if (!p.buttons.length && !S.edit) kids.unshift(h('div', { class: 'empty' }, h('b', {}, '🫥'), 'This page is empty.', h('br'), 'Tap ✏️ up top, then + to add buttons.'));
    return h('section', { class: 'page' }, kids);
  }));
  let scrollRaf = 0;
  pagesEl.addEventListener('scroll', () => {
    cancelAnimationFrame(scrollRaf);
    scrollRaf = requestAnimationFrame(() => {
      const i = Math.round(pagesEl.scrollLeft / pagesEl.clientWidth);
      if (i !== S.page) { S.page = i; LS.set('page', i); updatePageUI(); }
    });
  }, { passive: true });

  const dots = h('div', { class: 'dots' }, pages().length > 1 ? pages().map((_, i) => h('i', { class: i === S.page ? 'on' : '' })) : null);
  const editbar = h('div', { class: 'editbar' },
    h('button', { onclick: () => openButtonEditor(null, pages()[S.page].id), html: I.plus + 'Button' }),
    h('button', { onclick: addPage, html: I.plus + 'Page' }),
    h('button', { class: 'done', onclick: () => setEdit(false), html: I.check + 'Done' }));

  root.append(header, tabs, pagesEl, dots, editbar);
  layout();
  pagesEl.scrollLeft = S.page * pagesEl.clientWidth;
  updateLive(); updateSubtitle();
}

function layout() {
  const cols = Math.max(2, Math.min(8, Number(S.config.settings.columns) || 4));
  const w = Math.min(window.innerWidth, 900) - 32;
  const gap = w < 400 ? 11 : 14;
  const cell = Math.min(Math.floor((w - gap * (cols - 1)) / cols), 150);
  document.documentElement.style.setProperty('--cell', cell + 'px');
  document.documentElement.style.setProperty('--gap', gap + 'px');
}
let resizeT; window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { if (S.config) { layout(); const pe = $('.pages'); if (pe) pe.scrollLeft = S.page * pe.clientWidth; } }, 120); });

function updatePageUI() {
  $$('.tab[data-i]').forEach(t => t.classList.toggle('active', +t.dataset.i === S.page));
  $$('.dots i').forEach((d, i) => d.classList.toggle('on', i === S.page));
  const t = $(`.tab[data-i="${S.page}"]`); if (t) t.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
}
function goPage(i) {
  const pe = $('.pages'); if (!pe) return;
  S.page = i; LS.set('page', i);
  pe.scrollTo({ left: i * pe.clientWidth, behavior: 'smooth' });
  updatePageUI();
}
function setEdit(on) {
  S.edit = on; haptic();
  render();
  if (on) toast('Edit mode — tap to edit, hold & drag to reorder');
}
function updateSubtitle() {
  const el = $('.brand-text .sub'); if (!el) return;
  if (!S.connected) { el.textContent = S.connWhy === 'offline' ? 'No internet…' : S.connWhy === 'mac' ? 'Waiting for your Mac…' : 'Connecting…'; return; }
  const host = ((S.server && S.server.host) || 'your Mac').replace(/\.local$/, '').replace(/-/g, ' ');
  const front = S.status && S.status.frontApp;
  const ms = S.latency != null ? ` · ⚡${S.latency}ms` : '';
  el.textContent = (front ? `${host} · ${front}` : host) + ms;
}

/* ================= tiles ================= */
function iconEl(btn) {
  const ic = (btn.icon || '').trim();
  if (!ic && btn.type === 'app' && btn.params.app) return appImg(btn.params.app, '🚀');
  if (ic.startsWith('app:')) return appImg(ic.slice(4), '🚀');
  if (/^(https?:|data:|\/)/.test(ic)) return h('img', { class: 'ico', src: ic, alt: '', draggable: 'false' });
  return h('span', { class: 'ico' }, ic || (S.actionMap[btn.type] && S.actionMap[btn.type].icon) || '⬜️');
}
/* App icons come from your Mac (encrypted), then stay cached on the phone. */
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const iconMem = new Map();
let iconQueue = Promise.resolve();
function loadIcon(name) {
  if (iconMem.has(name)) return iconMem.get(name);
  const cached = LS.get('icon.' + name, null);
  const p = cached ? Promise.resolve(cached)
    : (iconQueue = iconQueue.catch(() => {}).then(() => api('GET', '/icon', { app: name })).then(d => { LS.set('icon.' + name, d.url); return d.url; }, () => null));
  p.then(u => { if (!u) setTimeout(() => iconMem.delete(name), 60000); });
  iconMem.set(name, p);
  return p;
}
function iconImg(name, props, fallback) {
  const img = h('img', { alt: '', draggable: 'false', src: BLANK, ...props });
  loadIcon(name).then(u => { if (u) img.src = u; else if (fallback) img.replaceWith(fallback()); else img.remove(); });
  return img;
}
function appImg(name, fallback) {
  return iconImg(name, { class: 'ico' }, () => h('span', { class: 'ico' }, fallback));
}

function tileEl(btn, page, preview) {
  const pal = PALETTE[btn.color] || PALETTE.slate;
  const size = btn.size || '1x1';
  const [w, hgt] = size.split('x').map(Number);
  const cols = Number(S.config.settings.columns) || 4;
  const isWidget = btn.type === 'widget';
  const el = h('button', {
    class: `tile type-${btn.type} size-${size}` + (btn.color === 'white' ? ' light' : '') + (isWidget ? ` widget w-${btn.params.kind}` : ''),
    'data-id': btn.id, 'data-type': btn.type,
    style: { '--c1': pal[0], '--c2': pal[1], gridColumn: `span ${Math.min(w, cols)}`, gridRow: `span ${hgt}` },
  });
  if (preview) { el.style.width = `calc(var(--cell) * ${w} + var(--gap) * ${w - 1})`; el.style.height = `calc(var(--cell) * ${hgt} + var(--gap) * ${hgt - 1})`; }

  if (isWidget) el.append(h('div', { class: 'w-body' }));
  else {
    el.append(iconEl(btn));
    if (btn.type === 'timer') {
      el.append(h('span', { class: 'tleft' }, ''));
      el.insertAdjacentHTML('beforeend', '<svg class="tring" preserveAspectRatio="none"><rect x="1.5" y="1.5" rx="16" ry="16" pathLength="100" stroke-dasharray="100"/></svg>');
    }
    el.append(h('span', { class: 'lbl' }, btn.label || ''));
    if (btn.type === 'toggle') el.append(h('span', { class: 'pill' }, '…'));
  }
  el.append(h('span', { class: 'spin' }));
  if (!preview) {
    const del = h('span', { class: 'del', html: I.x });
    del.addEventListener('pointerdown', e => e.stopPropagation());
    del.addEventListener('click', e => { e.stopPropagation(); deleteButton(btn.id); });
    el.append(del);
    bindTile(el, btn, page);
  }
  if (isWidget || btn.type === 'toggle' || btn.type === 'timer') updateTile(el, btn);
  return el;
}

function bindTile(el, btn, page) {
  let timer = null, start = null, long = false, moved = false;
  el.addEventListener('pointerdown', e => {
    if (e.button > 0) return;
    start = { x: e.clientX, y: e.clientY }; long = false; moved = false;
    el.classList.add('pressed');
    if (S.edit) timer = setTimeout(() => { long = true; beginDrag(el, page, start); }, 230);
    else timer = setTimeout(() => { long = true; el.classList.remove('pressed'); haptic(); openButtonEditor(btn.id); }, 600);
  });
  el.addEventListener('pointermove', e => {
    if (!start || long) return;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) { clearTimeout(timer); moved = true; el.classList.remove('pressed'); }
  });
  const end = () => { clearTimeout(timer); el.classList.remove('pressed'); start = null; };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', () => { end(); moved = true; });
  el.addEventListener('contextmenu', e => e.preventDefault());
  el.addEventListener('click', e => {
    if (long || moved) { e.preventDefault(); return; }
    if (S.edit) { haptic(); openButtonEditor(btn.id); return; }
    const cmd = e.target.closest('[data-cmd]');
    if (cmd) { haptic(); quick({ type: 'media', params: { command: cmd.dataset.cmd } }); return; }
    runButton(btn, el);
  });
}

/* ---------- drag to reorder (edit mode) ---------- */
document.addEventListener('touchmove', e => { if (S.dragging) e.preventDefault(); }, { passive: false });
function beginDrag(el, page, start) {
  S.dragging = true; haptic();
  const grid = el.parentElement;
  const r = el.getBoundingClientRect();
  const ghost = el.cloneNode(true);
  ghost.classList.add('ghost'); ghost.classList.remove('pressed');
  Object.assign(ghost.style, { width: r.width + 'px', height: r.height + 'px', left: r.left + 'px', top: r.top + 'px' });
  document.body.append(ghost);
  el.classList.add('placeholder'); el.classList.remove('pressed');
  const ox = start.x - r.left, oy = start.y - r.top;
  const move = ev => {
    ghost.style.left = (ev.clientX - ox) + 'px'; ghost.style.top = (ev.clientY - oy) + 'px';
    const t = document.elementFromPoint(ev.clientX, ev.clientY);
    const target = t && t.closest('.tile');
    if (target && target !== el && target.parentElement === grid && !target.classList.contains('add')) {
      const kids = [...grid.children];
      if (kids.indexOf(el) < kids.indexOf(target)) target.after(el); else target.before(el);
      haptic();
    }
  };
  const up = () => {
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerup', up);
    document.removeEventListener('pointercancel', up);
    ghost.remove(); el.classList.remove('placeholder');
    S.dragging = false;
    const order = $$('.tile[data-id]', grid).map(t => t.dataset.id);
    page.buttons.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    saveConfig();
    if (S.pendingConfig) { S.config = S.pendingConfig; S.pendingConfig = null; render(); }
  };
  document.addEventListener('pointermove', move);
  document.addEventListener('pointerup', up);
  document.addEventListener('pointercancel', up);
}

/* ---------- live tile updates ---------- */
function updateLive() {
  $$('.tile[data-id]').forEach(el => {
    const t = el.dataset.type;
    if (t !== 'widget' && t !== 'toggle' && t !== 'timer') return;
    const loc = locate(el.dataset.id);
    if (loc) updateTile(el, loc.button);
  });
}

function updateTile(el, btn) {
  const st = S.status || {};
  if (btn.type === 'toggle') {
    const v = st.actions && st.actions.toggle ? st.actions.toggle[btn.params.which] : undefined;
    el.classList.toggle('on', v === true); el.classList.toggle('off', v === false);
    const pill = $('.pill', el); if (pill) pill.textContent = v == null ? '…' : v ? 'ON' : 'OFF';
    return;
  }
  if (btn.type === 'timer') {
    const t = st.actions && st.actions.timer ? st.actions.timer[btn.id] : null;
    const running = t && t.endsAt > Date.now() + S.skew;
    el.classList.toggle('running', !!running);
    if (running) {
      const left = t.endsAt - (Date.now() + S.skew);
      $('.tleft', el).textContent = fmtTime(left);
      const rect = $('.tring rect', el);
      if (rect) {
        const r = el.getBoundingClientRect();
        rect.setAttribute('width', Math.max(0, r.width - 13)); rect.setAttribute('height', Math.max(0, r.height - 13));
        rect.style.strokeDashoffset = String(100 - (left / t.total) * 100);
      }
    }
    return;
  }
  const body = $('.w-body', el); if (!body) return;
  const kind = btn.params.kind || 'nowplaying';
  const label = btn.label;
  el.classList.toggle('np', kind === 'nowplaying');
  if (kind === 'clock') {
    const d = new Date();
    body.innerHTML = '';
    body.append(h('div', { class: 'w-head' }, label || d.toLocaleDateString(undefined, { weekday: 'long' })),
      (() => {
        const parts = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).formatToParts(d);
        const main = parts.filter(p => p.type !== 'dayPeriod').map(p => p.value).join('').trim();
        const period = (parts.find(p => p.type === 'dayPeriod') || {}).value;
        return h('div', { class: 'clock-time' }, main, period ? h('small', {}, period) : null);
      })(),
      h('div', { class: 'w-sub' }, d.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })));
  } else if (kind === 'cpu' || kind === 'ram') {
    const pct = kind === 'cpu' ? st.cpu : st.ram && st.ram.pct;
    const sub = kind === 'cpu' ? 'processor' : st.ram ? `${st.ram.usedGB} / ${st.ram.totalGB} GB` : '';
    gauge(body, label || (kind === 'cpu' ? '🧠 CPU' : '💾 Memory'), pct, sub);
  } else if (kind === 'battery') {
    const b = st.battery;
    gauge(body, label || '🔋 Battery', b ? b.pct : null, b ? (b.charging ? '⚡️ ' + (b.state === 'charged' ? 'Full' : 'Charging') : b.remaining ? b.remaining + ' left' : 'On battery') : 'No battery');
  } else if (kind === 'volume') {
    const v = st.volume;
    body.innerHTML = '';
    body.append(h('div', { class: 'w-head' }, label || (v && v.muted ? '🔇 Muted' : '🔊 Volume')),
      h('div', { class: 'w-big' }, v && v.level != null ? v.level + '%' : '—'),
      h('div', { class: 'bar' }, h('i', { style: { width: (v && !v.muted ? v.level : 0) + '%' } })));
  } else if (kind === 'nowplaying') {
    const np = st.nowPlaying;
    const playing = np && np.state === 'playing';
    el.classList.toggle('paused', !playing);
    const key = np ? `${np.title}|${np.art}|${np.state}|${el.className.includes('size-2x2')}` : 'none';
    if (body.dataset.key !== key) {
      body.dataset.key = key;
      body.innerHTML = '';
      body.append(h('div', { class: 'np-art', style: np && np.art ? { backgroundImage: `url("${np.art}")` } : {} }),
        h('div', { class: 'np-in' },
          h('div', { class: 'w-head' }, h('span', { class: 'eq' }, h('i'), h('i'), h('i')), np ? np.player : (label || 'Now playing')),
          h('div', { class: 'np-title' }, np ? np.title : 'Nothing playing'),
          h('div', { class: 'np-artist' }, np ? np.artist : 'Tap to play'),
          h('div', { class: 'bar' }, h('i', { class: 'npbar' })),
          h('div', { class: 'np-ctrls' },
            h('button', { 'data-cmd': 'previous', html: I.prev }),
            h('button', { class: 'main', 'data-cmd': 'playpause', html: playing ? I.pause : I.play }),
            h('button', { 'data-cmd': 'next', html: I.next }))));
    }
    const bar = $('.npbar', body);
    if (bar && np && np.duration) {
      const elapsed = playing && S.status.now ? (Date.now() + S.skew - S.status.now) / 1000 : 0;
      bar.style.width = Math.min(100, ((np.position || 0) + elapsed) / np.duration * 100) + '%';
    }
  }
}
function gauge(body, title, pct, sub) {
  const c = 2 * Math.PI * 30;
  body.innerHTML = '';
  body.append(h('div', { class: 'w-head' }, title));
  const g = h('div', { class: 'gauge' });
  g.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="30"/><circle cx="36" cy="36" r="30" stroke-dasharray="${c}" stroke-dashoffset="${c - (pct || 0) / 100 * c}"/></svg>`);
  g.append(h('div', {}, h('div', { class: 'w-big' }, pct == null ? '—' : pct + '%'), h('div', { class: 'w-sub' }, sub || '')));
  body.append(g);
}
setInterval(() => {
  $$('.tile.w-clock, .tile.type-timer, .tile.w-nowplaying').forEach(el => { const l = locate(el.dataset.id); if (l) updateTile(el, l.button); });
}, 1000);

/* ================= running buttons ================= */
async function runButton(btn, el) {
  haptic();
  if (btn.type === 'page') {
    const i = pages().findIndex(p => p.id === btn.params.target);
    if (i >= 0) goPage(i); else toast('That page doesn’t exist any more', 'err');
    return;
  }
  if (btn.type === 'widget' && btn.params.kind === 'clock') return;
  if (btn.confirm && !(await confirmBox(`Run “${btn.label || 'this'}”?`, 'Just making sure 👀'))) return;
  const runtime = await askFields(btn);
  if (runtime === null) return;
  const busyT = setTimeout(() => el && el.classList.add('busy'), 250);
  try {
    const res = await api('POST', '/api/run', { id: btn.id, params: runtime });
    flash(el, 'ok'); handleResult(res);
  } catch (e) {
    if (e.message !== 'Not paired') { flash(el, 'err'); toast(e.message, 'err'); }
  } finally { clearTimeout(busyT); el && el.classList.remove('busy'); }
}
async function quick(button) {
  try { handleResult(await api('POST', '/api/test', { button })); } catch (e) { toast(e.message, 'err'); }
}
async function testDraft(draft) {
  const runtime = await askFields(draft); if (runtime === null) return;
  try { const res = await api('POST', '/api/test', { button: draft, params: runtime }); handleResult(res); if (!res.message && !res.show && !res.image) toast('✅ Worked'); }
  catch (e) { toast(e.message, 'err'); }
}
function flash(el, kind) {
  if (!el) return;
  el.classList.remove('ok', 'err'); void el.offsetWidth; el.classList.add(kind);
  setTimeout(() => el.classList.remove(kind), 700);
}
function handleResult(res) {
  if (!res) return;
  if (res.image) return imageBox(res.title || 'Screen', res.image);
  if (res.show) return outputBox(res.show);
  if (res.message) toast(res.message);
}
async function askFields(btn) {
  const def = S.actionMap[btn.type]; if (!def) return {};
  const out = {};
  for (const f of def.fields || []) {
    if (!f.ask) continue;
    if (f.showIf && !Object.entries(f.showIf).every(([k, v]) => (btn.params[k] ?? fieldDefault(def, k)) === v)) continue;
    if (btn.params[f.key]) continue;
    const v = await promptBox(btn.label || def.name, f.label, f.type === 'textarea');
    if (v === null) return null;
    out[f.key] = v;
  }
  return out;
}
const fieldDefault = (def, key) => { const f = (def.fields || []).find(x => x.key === key); return f ? f.default : undefined; };

/* ================= toasts, dialogs, banner ================= */
let toastsEl;
function toast(text, kind, action) {
  if (!toastsEl) { toastsEl = h('div', { class: 'toasts' }); document.body.append(toastsEl); }
  const t = h('div', { class: 'toast' + (kind === 'err' ? ' err' : '') }, h('span', {}, text));
  if (action) t.append(h('button', { onclick: () => { action.fn(); kill(); } }, action.label));
  toastsEl.append(t);
  while (toastsEl.children.length > 3) toastsEl.firstChild.remove();
  const kill = () => { t.classList.add('out'); setTimeout(() => t.remove(), 260); };
  setTimeout(kill, action ? 4500 : kind === 'err' ? 3800 : 2200);
}
let bannerEl;
function banner(show, text) {
  if (!bannerEl) { bannerEl = h('div', { class: 'banner' }, h('span', { class: 'sp' }), h('span', {})); document.body.append(bannerEl); }
  bannerEl.lastChild.textContent = text || '';
  clearTimeout(banner.t);
  if (show) banner.t = setTimeout(() => bannerEl.classList.add('show'), 1200); else bannerEl.classList.remove('show');
}
function dialog({ title, text, body, ok = 'OK', cancel, danger, wide }) {
  return new Promise(resolve => {
    S.sheets++;
    const back = h('div', { class: 'dialog-back' });
    const close = v => { back.classList.remove('open'); setTimeout(() => back.remove(), 220); S.sheets--; flushPending(); resolve(v); };
    const box = h('div', { class: 'dialog' + (wide ? ' wide' : '') },
      title ? h('h3', {}, title) : null, text ? h('p', {}, text) : null, body || null,
      h('div', { class: 'btns' },
        cancel ? h('button', { class: 'btn', onclick: () => close(false) }, cancel) : null,
        ok ? h('button', { class: 'btn ' + (danger ? 'danger' : 'primary'), onclick: () => close(true) }, ok) : null));
    back.append(box);
    back.addEventListener('click', e => { if (e.target === back) close(false); });
    document.body.append(back);
    requestAnimationFrame(() => back.classList.add('open'));
    const inp = $('input, textarea', box); if (inp) setTimeout(() => inp.focus(), 250);
  });
}
const confirmBox = (title, text, ok = 'Do it', danger) => dialog({ title, text, ok, cancel: 'Cancel', danger });
async function promptBox(title, label, multiline, value = '') {
  const inp = multiline ? h('textarea', { class: 'inp', placeholder: label, value }) : h('input', { class: 'inp', placeholder: label, value });
  const ok = await dialog({ title, text: label, body: inp, ok: 'Send', cancel: 'Cancel' });
  return ok ? inp.value : null;
}
function copyText(text) {
  const ta = h('textarea', { value: text, style: { position: 'fixed', top: '-1000px' } });
  document.body.append(ta); ta.select(); ta.setSelectionRange(0, text.length);
  let ok = false; try { ok = document.execCommand('copy'); } catch {}
  ta.remove();
  if (!ok && navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast('📋 Copied'), () => toast('Long-press the text to copy', 'err'));
  else toast(ok ? '📋 Copied to your phone' : 'Long-press the text to copy', ok ? '' : 'err');
}
function outputBox({ title, text, mono }) {
  const content = mono ? h('pre', {}, text) : h('div', { class: 'out' }, text);
  const copyBtn = h('button', { class: 'btn small', style: { marginTop: '10px' }, onclick: () => copyText(text), html: I.copy + ' Copy' });
  dialog({ title, body: h('div', {}, content, copyBtn), ok: 'Done' });
}
function imageBox(title, src) {
  dialog({ title, text: 'Long-press the image to save it 📲', body: h('img', { src, alt: 'Mac screen' }), ok: 'Close', wide: true });
}
function flushPending() {
  if (!S.sheets && S.pendingConfig) { S.config = S.pendingConfig; S.pendingConfig = null; render(); }
}

/* ================= sheets ================= */
function sheet({ title, tall, onClose }) {
  S.sheets++;
  const body = h('div', { class: 'sheet-body' });
  const foot = h('div', { class: 'sheet-foot' });
  const head = h('div', { class: 'sheet-head' }, h('h2', {}, title), h('button', { class: 'icon-btn', html: I.x, 'aria-label': 'Close', onclick: () => close() }));
  const panel = h('div', { class: 'sheet' + (tall ? ' tall' : '') }, h('div', { class: 'grabber' }), head, body, foot);
  const back = h('div', { class: 'sheet-back' }, panel);
  back.addEventListener('click', e => { if (e.target === back) close(); });
  // swipe down on the header to dismiss
  let sy = null;
  head.addEventListener('touchstart', e => { sy = e.touches[0].clientY; panel.style.transition = 'none'; }, { passive: true });
  head.addEventListener('touchmove', e => { if (sy == null) return; const d = Math.max(0, e.touches[0].clientY - sy); panel.style.transform = `translateY(${d}px)`; }, { passive: true });
  head.addEventListener('touchend', e => {
    panel.style.transition = ''; const d = (e.changedTouches[0].clientY - (sy || 0)); sy = null;
    if (d > 110) close(); else panel.style.transform = '';
  });
  document.body.append(back);
  requestAnimationFrame(() => back.classList.add('open'));
  let closed = false;
  function close() {
    if (closed) return; closed = true;
    panel.style.transform = ''; back.classList.remove('open');
    setTimeout(() => back.remove(), 380);
    S.sheets--; onClose && onClose(); flushPending();
  }
  return { body, foot, close, panel, setTitle: t => { $('h2', head).textContent = t; } };
}
const sec = t => h('div', { class: 'sec' }, t);
const group = (...rows) => h('div', { class: 'group' }, rows);
function switchEl(checked, onchange) {
  const inp = h('input', { type: 'checkbox', checked });
  inp.addEventListener('change', () => { haptic(); onchange(inp.checked); });
  return h('label', { class: 'switch' }, inp, h('span'));
}
function segEl(options, value, onchange) {
  const wrap = h('div', { class: 'seg' });
  for (const [v, label] of options) {
    const b = h('button', { class: v === value ? 'on' : '' }, label);
    b.addEventListener('click', () => { haptic(); $$('button', wrap).forEach(x => x.classList.remove('on')); b.classList.add('on'); onchange(v); });
    wrap.append(b);
  }
  return wrap;
}

/* ================= button editor ================= */
function openButtonEditor(id, pageId) {
  const loc = id ? locate(id) : null;
  const isNew = !loc;
  const colors = Object.keys(PALETTE);
  const draft = loc ? clone(loc.button) : {
    id: uid('b'), label: '', icon: '', color: colors[Math.floor(Math.random() * 15)], size: '1x1', type: 'app', params: {},
  };
  if (isNew) applyDefaults(draft);
  let targetPage = loc ? loc.page.id : (pageId || pages()[S.page].id);
  const sh = sheet({ title: isNew ? 'New button ✨' : 'Edit button', tall: true });

  const preview = h('div', { class: 'preview' });
  const refreshPreview = () => { preview.innerHTML = ''; preview.append(tileEl(draft, null, true)); };

  function build() {
    const def = S.actionMap[draft.type] || { name: draft.type, fields: [] };
    sh.body.innerHTML = '';
    refreshPreview();
    sh.body.append(preview);

    // ---- action ----
    sh.body.append(sec('What it does'),
      group(h('div', { class: 'row tap', onclick: () => pickType(draft.type, t => { if (t !== draft.type) { const keepApp = draft.params.app; draft.type = t; draft.params = {}; applyDefaults(draft); if (keepApp && (S.actionMap[t].fields || []).some(f => f.key === 'app')) draft.params.app = keepApp; if (t === 'widget' && draft.size === '1x1') draft.size = '2x1'; } build(); }) },
        h('span', { style: { fontSize: '24px' } }, def.icon || '⬜️'),
        h('div', { class: 'rl' }, def.name, h('div', { class: 'hint' }, def.description || '')),
        h('span', { class: 'val', html: I.chev }))));

    const fieldsWrap = h('div', { class: 'group' });
    for (const f of def.fields || []) {
      if (f.showIf && !Object.entries(f.showIf).every(([k, v]) => (draft.params[k] ?? fieldDefault(def, k)) === v)) continue;
      fieldsWrap.append(fieldRow(f, draft, build, refreshPreview));
    }
    if ((def.fields || []).length) sh.body.append(sec('Settings'), fieldsWrap);

    // ---- look ----
    const labelInp = h('input', { class: 'inp', placeholder: 'Label', value: draft.label || '' });
    labelInp.addEventListener('input', () => { draft.label = labelInp.value; refreshPreview(); });
    const iconInp = h('input', { class: 'inp', placeholder: '🙂', value: draft.icon || '' });
    iconInp.addEventListener('input', () => { draft.icon = iconInp.value; refreshPreview(); });
    const emojis = h('div', { class: 'emojis' }, EMOJI.map(e => h('button', { class: draft.icon === e ? 'on' : '', onclick: () => { draft.icon = e; iconInp.value = e; refreshPreview(); haptic(); } }, e)));
    const appForIcon = draft.params.app;
    const sws = h('div', { class: 'swatches' }, colors.map(c => {
      const [c1, c2] = PALETTE[c];
      return h('button', { class: 'sw' + (draft.color === c ? ' on' : ''), style: { '--c1': c1, '--c2': c2 }, 'aria-label': c, onclick: e => { draft.color = c; $$('.sw', sws).forEach(s => s.classList.remove('on')); e.currentTarget.classList.add('on'); refreshPreview(); haptic(); } });
    }));
    sh.body.append(sec('Looks'), group(
      h('div', { class: 'row col' }, h('div', { class: 'rl' }, 'Label'), labelInp),
      h('div', { class: 'row col' }, h('div', { class: 'rl' }, 'Icon'),
        h('div', { class: 'icon-row' }, iconInp,
          appForIcon ? h('button', { class: 'btn small', onclick: () => { draft.icon = ''; iconInp.value = ''; refreshPreview(); } }, 'App icon') : null,
          h('button', { class: 'btn small', onclick: async () => { const u = await promptBox('Image icon', 'Paste an image URL, or app:Safari for any app’s icon', false, draft.icon); if (u != null) { draft.icon = u.trim(); iconInp.value = draft.icon; refreshPreview(); } } }, 'Image')),
        emojis,
        h('div', { class: 'hint' }, draft.type === 'app' ? 'Leave empty to use the real app icon 🔥' : 'Tip: type “app:Spotify” to use any app’s icon')),
      h('div', { class: 'row col' }, h('div', { class: 'rl' }, 'Colour'), sws),
      h('div', { class: 'row col' }, h('div', { class: 'rl' }, 'Size'),
        segEl([['1x1', '1×1'], ['2x1', '2×1'], ['1x2', '1×2'], ['2x2', '2×2'], ['4x1', 'Wide']], draft.size || '1x1', v => { draft.size = v; refreshPreview(); }))));

    // ---- behaviour ----
    const pageSel = h('select', { class: 'inp' }, pages().map(p => h('option', { value: p.id, selected: p.id === targetPage }, `${p.icon || ''} ${p.name}`)));
    pageSel.addEventListener('change', () => { targetPage = pageSel.value; });
    sh.body.append(sec('Behaviour'), group(
      h('div', { class: 'row' }, h('div', { class: 'rl' }, 'Ask before running', h('div', { class: 'hint' }, 'Good for sleep, restart, kill commands')), switchEl(!!draft.confirm, v => { draft.confirm = v; })),
      h('div', { class: 'row col' }, h('div', { class: 'rl' }, 'Lives on page'), pageSel)));

    // ---- footer ----
    sh.foot.innerHTML = '';
    if (!isNew) sh.foot.append(
      h('button', { class: 'btn icon danger', 'aria-label': 'Delete', html: I.trash, onclick: () => { sh.close(); deleteButton(draft.id); } }),
      h('button', { class: 'btn icon', 'aria-label': 'Duplicate', html: I.dup, onclick: () => { const copy = clone(draft); copy.id = uid('b'); copy.label = (copy.label || '') + ' copy'; const p = pages().find(p => p.id === targetPage); p.buttons.splice(p.buttons.findIndex(b => b.id === draft.id) + 1, 0, copy); saveConfig(); sh.close(); render(); toast('Duplicated 👯'); } }));
    sh.foot.append(
      h('button', { class: 'btn', html: I.run + 'Test', onclick: () => { haptic(); testDraft(draft); } }),
      h('button', { class: 'btn primary', html: I.check + 'Save', onclick: save }));
  }

  function save() {
    const def = S.actionMap[draft.type];
    const missing = (def && def.fields || []).find(f => f.required && !(draft.params[f.key] || '').toString().trim());
    if (missing) { toast(`Fill in “${missing.label}” first`, 'err'); return; }
    if (!draft.label) draft.label = autoLabel(draft);
    const target = pages().find(p => p.id === targetPage);
    if (loc) {
      if (loc.page.id === targetPage) loc.page.buttons[loc.index] = draft;
      else { loc.page.buttons.splice(loc.index, 1); target.buttons.push(draft); }
    } else target.buttons.push(draft);
    saveConfig(true); haptic(); sh.close(); render();
    toast(isNew ? '✨ Button added' : '💾 Saved');
  }
  build();
}

function applyDefaults(btn) {
  const def = S.actionMap[btn.type]; if (!def) return;
  for (const f of def.fields || []) if (f.default !== undefined && btn.params[f.key] === undefined) btn.params[f.key] = clone(f.default);
}
function autoLabel(b) {
  const p = b.params, def = S.actionMap[b.type];
  if (b.type === 'app') return p.app;
  if (b.type === 'shortcut') return p.name;
  if (b.type === 'url') { try { return new URL(/^[a-z]+:/i.test(p.url) ? p.url : 'https://' + p.url).hostname.replace(/^www\./, ''); } catch { return 'Link'; } }
  if (b.type === 'page') { const pg = pages().find(x => x.id === p.target); return pg ? pg.name : 'Page'; }
  const sel = (def.fields || []).find(f => f.type === 'select');
  if (sel) { const opt = (sel.options || []).find(o => o[0] === p[sel.key]); if (opt) return opt[1].replace(/^\S+\s/, '').replace(/\s*\(.*\)$/, ''); }
  return def ? def.name : 'Button';
}

function fieldRow(f, draft, rebuild, refreshPreview) {
  const val = draft.params[f.key] ?? f.default ?? '';
  const set = v => { draft.params[f.key] = v; };
  const lbl = h('div', { class: 'rl' }, f.label, f.ask ? h('div', { class: 'hint' }, 'Leave empty and your phone will ask each time') : null);
  switch (f.type) {
    case 'bool':
      return h('div', { class: 'row' }, lbl, switchEl(!!val, v => set(v)));
    case 'select': {
      const sel = h('select', { class: 'inp' }, (f.options || []).map(([v, l]) => h('option', { value: v, selected: v === val }, l)));
      sel.addEventListener('change', () => { set(sel.value); refreshPreview(); if (S.actionMap[draft.type].fields.some(x => x.showIf)) rebuild(); });
      return h('div', { class: 'row col' }, lbl, sel);
    }
    case 'number': {
      const inp = h('input', { class: 'inp', type: 'number', inputmode: 'decimal', value: val, placeholder: f.placeholder || '' });
      inp.addEventListener('input', () => set(inp.value === '' ? '' : Number(inp.value)));
      return h('div', { class: 'row col' }, lbl, inp);
    }
    case 'textarea': case 'code': {
      const ta = h('textarea', { class: 'inp' + (f.type === 'code' ? ' mono' : ''), placeholder: f.placeholder || '', value: val, autocapitalize: f.type === 'code' ? 'off' : 'sentences', autocorrect: f.type === 'code' ? 'off' : 'on', spellcheck: f.type === 'code' ? 'false' : 'true' });
      ta.addEventListener('input', () => set(ta.value));
      return h('div', { class: 'row col' }, lbl, ta);
    }
    case 'keys': {
      const inp = h('input', { class: 'inp mono', placeholder: f.placeholder || 'cmd+shift+4', value: val, autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false' });
      inp.addEventListener('input', () => set(inp.value));
      const add = t => { const cur = inp.value; inp.value = /[+,\s]$|^$/.test(cur) ? cur + t : cur + (t.endsWith('+') ? ', ' + t : '+' + t); set(inp.value); inp.focus(); };
      const chips = h('div', { class: 'chips' }, ['cmd+', 'shift+', 'alt+', 'ctrl+', 'space', 'return', 'tab', 'esc', 'left', 'right', 'up', 'down', 'f1'].map(t => h('button', { class: 'chip', onclick: () => add(t) }, t)),
        h('button', { class: 'chip', onclick: () => { inp.value = ''; set(''); } }, 'clear'));
      return h('div', { class: 'row col' }, lbl, inp, chips, h('div', { class: 'hint' }, 'Chain combos with commas: cmd+c, cmd+tab, cmd+v'));
    }
    case 'app': {
      const shown = h('span', { class: 'val' }, val || f.placeholder || 'Choose…');
      shown.insertAdjacentHTML('beforeend', I.chev);
      const row = h('div', { class: 'row tap', onclick: () => pickApp(name => { set(name); if (draft.type === 'app' && (!draft.label || draft.label === val)) draft.label = name; rebuild(); }, !f.required) }, val ? appMini(val) : null, lbl, shown);
      return row;
    }
    case 'shortcut': {
      const shown = h('span', { class: 'val' }, val || 'Choose…'); shown.insertAdjacentHTML('beforeend', I.chev);
      return h('div', { class: 'row tap', onclick: () => pickShortcut(name => { set(name); if (!draft.label) draft.label = name; rebuild(); }) }, lbl, shown);
    }
    case 'page': {
      const sel = h('select', { class: 'inp' }, h('option', { value: '' }, 'Choose a page…'), pages().map(p => h('option', { value: p.id, selected: p.id === val }, `${p.icon || ''} ${p.name}`)));
      sel.addEventListener('change', () => set(sel.value));
      return h('div', { class: 'row col' }, lbl, sel);
    }
    case 'steps': return stepsEditor(f, draft, rebuild);
    default: {
      const inp = h('input', { class: 'inp', placeholder: f.placeholder || '', value: val, autocapitalize: 'off', autocorrect: 'off' });
      inp.addEventListener('input', () => set(inp.value));
      return h('div', { class: 'row col' }, lbl, inp);
    }
  }
}
function appMini(name) {
  return iconImg(name, { style: { width: '30px', height: '30px', borderRadius: '8px' } });
}

function stepsEditor(f, draft, rebuild) {
  const steps = draft.params[f.key] = Array.isArray(draft.params[f.key]) ? draft.params[f.key] : [];
  const nameOf = s => {
    if (s.button) { const l = locate(s.button); return l ? `▶︎ ${l.button.icon && !/^(app:|http|\/|data:)/.test(l.button.icon) ? l.button.icon + ' ' : ''}${l.button.label || l.button.type}` : '⚠️ missing button'; }
    if (s.action) { const d = S.actionMap[s.action.type]; return `${d ? d.icon : '⚙️'} ${d ? d.name : s.action.type}${s.action.params && s.action.params.command ? ' · ' + s.action.params.command : ''}`; }
    return null;
  };
  const wrap = h('div', { class: 'steps' });
  steps.forEach((s, i) => {
    const move = d => { const j = i + d; if (j < 0 || j >= steps.length) return; [steps[i], steps[j]] = [steps[j], steps[i]]; rebuild(); };
    let main;
    if (s.wait != null) {
      const inp = h('input', { class: 'inp', type: 'number', value: s.wait, inputmode: 'numeric' });
      inp.addEventListener('input', () => { s.wait = Number(inp.value) || 0; });
      main = h('div', { class: 't' }, '⏳ Wait ', inp, ' ms');
      main.style.display = 'flex'; main.style.alignItems = 'center'; main.style.gap = '6px';
    } else main = h('div', { class: 't' }, nameOf(s));
    wrap.append(h('div', { class: 'step' }, h('span', { class: 'n' }, i + 1), main,
      h('button', { class: 'mini', html: I.up, onclick: () => move(-1) }),
      h('button', { class: 'mini', html: I.down, onclick: () => move(1) }),
      h('button', { class: 'mini', html: I.x, onclick: () => { steps.splice(i, 1); rebuild(); } })));
  });
  if (!steps.length) wrap.append(h('div', { class: 'step' }, h('div', { class: 't', style: { color: 'var(--muted)' } }, 'No steps yet — add buttons to run in order')));
  return h('div', { class: 'row col' }, h('div', { class: 'rl' }, f.label), wrap,
    h('div', { class: 'chips' },
      h('button', { class: 'btn small', onclick: () => pickButton(draft.id, id => { steps.push({ button: id }); rebuild(); }), html: I.plus + 'Run a button' }),
      h('button', { class: 'btn small', onclick: () => { steps.push({ wait: 500 }); rebuild(); }, html: I.plus + 'Wait' })));
}

/* ---------- pickers ---------- */
function pickType(current, cb) {
  const sh = sheet({ title: 'Pick an action', tall: true });
  const groups = {};
  for (const a of S.actions) (groups[a.group || 'More'] = groups[a.group || 'More'] || []).push(a);
  for (const [g, list] of Object.entries(groups)) {
    sh.body.append(sec(g), h('div', { class: 'type-grid' }, list.map(a => h('button', { class: 'type-card' + (a.type === current ? ' on' : ''), onclick: () => { haptic(); sh.close(); cb(a.type); } },
      h('span', { class: 'e' }, a.icon), h('b', {}, a.name), h('small', {}, a.description || '')))));
  }
  sh.foot.remove();
}
let appsCache = null;
async function pickApp(cb, allowNone) {
  const sh = sheet({ title: 'Pick an app', tall: true });
  sh.foot.remove();
  const search = h('input', { class: 'inp', placeholder: '🔍 Search apps…', autocapitalize: 'off', autocorrect: 'off' });
  const list = h('div', { class: 'picker-list' });
  sh.body.append(h('div', { class: 'search' }, search), list);
  if (allowNone) sh.body.prepend(h('button', { class: 'btn small', style: { marginBottom: '10px' }, onclick: () => { sh.close(); cb(''); } }, 'None (use default)'));
  list.append(h('div', { class: 'hint' }, 'Loading your apps…'));
  try { appsCache = appsCache || (await api('GET', '/api/apps')).apps; }
  catch (e) { list.innerHTML = ''; list.append(h('div', { class: 'hint' }, e.message)); return; }
  // only fetch icons for apps you can actually see
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    const img = e.target, name = img.dataset.app;
    loadIcon(name).then(u => { if (u) img.src = u; else img.replaceWith(h('span', { class: 'ph' }, '🚀')); });
  }), { root: sh.body }) : null;
  const draw = () => {
    const q = search.value.trim().toLowerCase();
    list.innerHTML = '';
    const hits = appsCache.filter(a => a.toLowerCase().includes(q));
    if (q && !hits.some(a => a.toLowerCase() === q)) list.append(h('button', { class: 'pick', onclick: () => { sh.close(); cb(search.value.trim()); } }, h('span', { class: 'ph' }, '✍️'), `Use “${search.value.trim()}”`));
    for (const a of hits.slice(0, 160)) {
      const img = h('img', { alt: '', src: LS.get('icon.' + a, null) || BLANK, 'data-app': a });
      if (img.src === BLANK && io) io.observe(img); else if (img.src === BLANK) loadIcon(a).then(u => { if (u) img.src = u; });
      list.append(h('button', { class: 'pick', onclick: () => { haptic(); sh.close(); cb(a); } }, img, a));
    }
  };
  search.addEventListener('input', draw);
  draw();
}
async function pickShortcut(cb) {
  const sh = sheet({ title: 'Pick a Shortcut', tall: true });
  sh.foot.remove();
  const manual = h('input', { class: 'inp', placeholder: 'Or type a Shortcut name…' });
  const wrap = h('div', { class: 'group' }, h('div', { class: 'list-btn' }, 'Loading your Shortcuts…'));
  sh.body.append(h('div', { class: 'search' }, h('div', { class: 'icon-row' }, manual, h('button', { class: 'btn small', onclick: () => { if (manual.value.trim()) { sh.close(); cb(manual.value.trim()); } } }, 'Use'))), wrap);
  try {
    const d = await api('GET', '/api/shortcuts');
    wrap.innerHTML = '';
    if (!d.shortcuts.length) wrap.append(h('div', { class: 'list-btn' }, d.error ? '⚠️ ' + d.error : 'No Shortcuts found — make one in the Shortcuts app on your Mac!'));
    for (const s of d.shortcuts) wrap.append(h('button', { class: 'list-btn', onclick: () => { haptic(); sh.close(); cb(s); } }, '🪄', s));
  } catch (e) { wrap.innerHTML = ''; wrap.append(h('div', { class: 'list-btn' }, e.message)); }
}
function pickButton(excludeId, cb) {
  const sh = sheet({ title: 'Which button?', tall: true });
  sh.foot.remove();
  for (const p of pages()) {
    const list = p.buttons.filter(b => b.id !== excludeId);
    if (!list.length) continue;
    sh.body.append(sec(`${p.icon || ''} ${p.name}`), h('div', { class: 'group' }, list.map(b => h('button', { class: 'list-btn', onclick: () => { haptic(); sh.close(); cb(b.id); } },
      h('span', {}, b.icon && !/^(app:|http|\/|data:)/.test(b.icon) ? b.icon : (S.actionMap[b.type] || {}).icon || '⬜️'), b.label || b.type))));
  }
}

/* ================= delete / pages ================= */
function deleteButton(id) {
  const loc = locate(id); if (!loc) return;
  const [removed] = loc.page.buttons.splice(loc.index, 1);
  haptic(); saveConfig(); render();
  toast(`Deleted “${removed.label || 'button'}”`, '', { label: 'Undo', fn: () => { loc.page.buttons.splice(loc.index, 0, removed); saveConfig(); render(); } });
}
function addPage() {
  haptic();
  const p = { id: uid('p'), name: `Page ${pages().length + 1}`, icon: '✨', buttons: [] };
  pages().push(p); S.page = pages().length - 1;
  saveConfig(); render(); openPageEditor(p.id);
}
function openPageEditor(id) {
  const idx = pages().findIndex(p => p.id === id); if (idx < 0) return;
  const page = pages()[idx];
  const sh = sheet({ title: 'Edit page' });
  const name = h('input', { class: 'inp', value: page.name, placeholder: 'Page name' });
  const icon = h('input', { class: 'inp', value: page.icon || '', placeholder: '🙂', style: { fontSize: '22px', textAlign: 'center' } });
  const emojis = h('div', { class: 'emojis' }, EMOJI.map(e => h('button', { onclick: () => { icon.value = e; haptic(); } }, e)));
  sh.body.append(group(
    h('div', { class: 'row col' }, h('div', { class: 'rl' }, 'Name'), name),
    h('div', { class: 'row col' }, h('div', { class: 'rl' }, 'Icon'), icon, emojis),
    h('div', { class: 'row' }, h('div', { class: 'rl' }, 'Position'),
      h('button', { class: 'btn small', html: I.left, onclick: () => movePage(-1) }),
      h('button', { class: 'btn small', html: I.chev, onclick: () => movePage(1) }))));
  function movePage(d) {
    const i = pages().indexOf(page), j = i + d;
    if (j < 0 || j >= pages().length) return;
    [pages()[i], pages()[j]] = [pages()[j], pages()[i]]; S.page = j; saveConfig(); render(); haptic();
  }
  sh.foot.append(
    h('button', { class: 'btn icon danger', html: I.trash, onclick: async () => {
      if (pages().length === 1) return toast('You need at least one page', 'err');
      if (page.buttons.length && !(await confirmBox(`Delete “${page.name}”?`, `Its ${page.buttons.length} button(s) go too.`, 'Delete', true))) return;
      pages().splice(pages().indexOf(page), 1); S.page = Math.max(0, S.page - 1); saveConfig(); sh.close(); render();
    } }),
    h('button', { class: 'btn primary', html: I.check + 'Save', onclick: () => { page.name = name.value.trim() || 'Page'; page.icon = icon.value.trim(); saveConfig(); sh.close(); render(); } }));
}

/* ================= settings ================= */
function openSettings() {
  haptic();
  const st = S.config.settings;
  const sh = sheet({ title: 'Settings ⚙️', tall: true });
  const upd = (k, v) => { st[k] = v; saveConfig(); applyTheme(); render(); };
  const deckName = h('input', { class: 'inp', value: st.deckName || 'PocketDeck' });
  deckName.addEventListener('change', () => upd('deckName', deckName.value.trim() || 'PocketDeck'));
  const accentSw = h('div', { class: 'swatches' }, Object.keys(PALETTE).filter(c => c !== 'white').map(c => h('button', {
    class: 'sw' + (st.accent === c ? ' on' : ''), style: { '--c1': PALETTE[c][0], '--c2': PALETTE[c][1] },
    onclick: e => { $$('.sw', accentSw).forEach(s => s.classList.remove('on')); e.currentTarget.classList.add('on'); upd('accent', c); haptic(); } })));
  const srv = S.server || {};

  sh.body.append(
    sec('Layout'), group(
      h('div', { class: 'row col' }, h('div', { class: 'rl' }, 'Deck name'), deckName),
      h('div', { class: 'row col' }, h('div', { class: 'rl' }, 'Columns'), segEl([[3, '3'], [4, '4'], [5, '5'], [6, '6']], Number(st.columns) || 4, v => upd('columns', v))),
      h('div', { class: 'row col' }, h('div', { class: 'rl' }, 'Tile style'), segEl([['vivid', '🍬 Vivid'], ['glass', '🧊 Glass']], st.tileStyle || 'vivid', v => upd('tileStyle', v))),
      h('div', { class: 'row' }, h('div', { class: 'rl' }, 'Show labels'), switchEl(st.showLabels !== false, v => upd('showLabels', v))),
      h('div', { class: 'row col' }, h('div', { class: 'rl' }, 'Accent colour'), accentSw)),
    sec('This phone'), group(
      h('div', { class: 'row' }, h('div', { class: 'rl' }, 'Haptics', h('div', { class: 'hint' }, 'Tiny taps on press (iOS 18+)')), switchEl(LS.get('haptics', true), v => LS.set('haptics', v))),
      h('div', { class: 'row' }, h('div', { class: 'rl' }, 'Keep screen on', h('div', { class: 'hint' }, 'Great when your phone sits on a stand as a deck')), switchEl(LS.get('wake', false), v => { LS.set('wake', v); wake(v); })),
      h('div', { class: 'row' }, h('div', { class: 'rl' }, 'Pure black (OLED)'), switchEl(LS.get('oled', false), v => { LS.set('oled', v); applyTheme(); }))),
    sec('Your deck'), group(
      h('div', { class: 'row tap', onclick: exportConfig }, h('div', { class: 'rl' }, '📤 Export config'), h('span', { class: 'val', html: I.chev })),
      h('div', { class: 'row tap', onclick: importConfig }, h('div', { class: 'rl' }, '📥 Import config'), h('span', { class: 'val', html: I.chev })),
      h('div', { class: 'row tap', onclick: resetConfig }, h('div', { class: 'rl', style: { color: 'var(--err)' } }, '♻️ Reset to the starter deck'), h('span', { class: 'val', html: I.chev }))),
    sec('Connection'), group(
      h('div', { class: 'row' }, h('div', { class: 'rl' }, 'Your Mac', h('div', { class: 'hint' }, (srv.host || '').replace(/\.local$/, ''))), h('span', { class: 'val' }, S.connWhy === 'ok' ? '🟢 Online' : S.connWhy === 'offline' ? '⚪️ No internet' : '🟠 Not answering')),
      h('div', { class: 'row' }, h('div', { class: 'rl' }, 'Speed', h('div', { class: 'hint' }, 'Phone → Mac → back, encrypted')), h('span', { class: 'val' }, S.latency != null ? `⚡ ${S.latency}ms` : '—')),
      h('div', { class: 'row' }, h('div', { class: 'rl' }, 'Route', h('div', { class: 'hint' }, 'Normal HTTPS through Cloudflare. Works on any network.')), h('span', { class: 'val' }, S.link && S.link.url ? '🌍 Connected' : '—')),
      h('div', { class: 'row' }, h('div', { class: 'rl' }, 'Encryption', h('div', { class: 'hint' }, 'AES-256, end to end. Nobody in the middle can read or fake anything.')), h('span', { class: 'val' }, '🔐 On')),
      h('div', { class: 'row' }, h('div', { class: 'rl' }, 'Version'), h('span', { class: 'val' }, srv.version || '—')),
      h('div', { class: 'row tap', onclick: async () => { if (await confirmBox('Unpair this phone?', 'You’ll need to scan the QR (or type a code) to connect again.', 'Unpair', true)) { sh.close(); unpair(); } } }, h('div', { class: 'rl' }, '🔌 Unpair this phone')),
      h('div', { class: 'row tap', onclick: async () => { if (await confirmBox('Unpair every phone?', 'Your Mac makes a brand-new key and every phone (this one too) gets kicked out. Use it if you lose a phone.', 'Unpair all', true)) { try { await api('POST', '/rotate'); } catch {} sh.close(); unpair('All phones unpaired. Scan the new QR on your Mac.'); } } }, h('div', { class: 'rl', style: { color: 'var(--err)' } }, '🔐 Unpair all phones'))),
    h('div', { class: 'hint', style: { textAlign: 'center', padding: '22px 10px 6px', color: 'var(--dim)', fontSize: '12.5px', lineHeight: 1.5 } },
      'Hold any button to edit it. Edit mode lets you drag to reorder.', h('br'), 'Your config lives in config.json on your Mac — edit it there too, changes appear live.'));
  sh.foot.remove();
}
let wakeLock = null;
async function wake(on) {
  try {
    if (on && 'wakeLock' in navigator) { wakeLock = await navigator.wakeLock.request('screen'); }
    else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch {}
}
function exportConfig() {
  const text = JSON.stringify(S.config, null, 2);
  outputBox({ title: 'Your config', text, mono: true });
}
async function importConfig() {
  const json = await promptBox('Import config', 'Paste a PocketDeck config (JSON). It replaces your current deck.', true);
  if (json == null) return;
  try {
    const c = JSON.parse(json);
    if (!Array.isArray(c.pages)) throw new Error('That doesn’t look like a PocketDeck config');
    const saved = await api('PUT', '/api/config', { config: c });
    S.config = saved.config; S.page = 0; render(); toast('📥 Imported!');
  } catch (e) { toast(e.message, 'err'); }
}
async function resetConfig() {
  if (!(await confirmBox('Reset everything?', 'Your current deck gets replaced with the starter deck (a backup is kept on your Mac as config.backup.json).', 'Reset', true))) return;
  try {
    const d = await api('GET', '/api/defaults');
    const saved = await api('PUT', '/api/config', { config: d.config });
    S.config = saved.config; S.page = 0; $$('.sheet-back').forEach(b => b.remove()); S.sheets = 0; render(); toast('♻️ Fresh start');
  } catch (e) { toast(e.message, 'err'); }
}

/* ================= go ================= */
if (LS.get('wake', false)) wake(true);
if ('serviceWorker' in navigator && window.isSecureContext && location.hostname !== 'localhost') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
boot();
})();
