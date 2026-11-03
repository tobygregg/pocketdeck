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
/* ---- icons: clean line icons, no emoji anywhere ---- */
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  headphones: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
  sparkles: '<path d="M12 3l1.8 4.9L19 9.7l-5.2 1.8L12 16.5l-1.8-5L5 9.7l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  message: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z"/>',
  'message-plus': '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z"/><path d="M13 9v6M10 12h6"/>',
  send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  'sun-dim': '<circle cx="12" cy="12" r="4"/><path d="M12 4h.01M20 12h.01M12 20h.01M4 12h.01M17.7 6.3h.01M17.7 17.7h.01M6.3 17.7h.01M6.3 6.3h.01"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a10 10 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  coffee: '<path d="M17 8h1a3 3 0 0 1 0 6h-1"/><path d="M3 8h14v6a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z"/><path d="M7 2v2M11 2v2M15 2v2"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  monitor: '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  laptop: '<rect x="4" y="4" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
  smartphone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  upload: '<path d="M12 15V3M7 8l5-5 5 5M5 21h14"/>',
  play: '<path d="M7 4.5v15l12.5-7.5z" fill="currentColor" stroke="none"/>',
  'play-outline': '<path d="M7 4.5v15l12.5-7.5z"/>',
  pause: '<rect x="6" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none"/><rect x="14" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none"/>',
  'skip-forward': '<path d="M5 5v14l10-7z" fill="currentColor" stroke="none"/><rect x="16.5" y="5" width="2.5" height="14" rx="1" fill="currentColor" stroke="none"/>',
  'skip-back': '<path d="M19 5v14L9 12z" fill="currentColor" stroke="none"/><rect x="5" y="5" width="2.5" height="14" rx="1" fill="currentColor" stroke="none"/>',
  volume: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
  'volume-low': '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>',
  'volume-x': '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/>',
  heart: '<path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z"/>',
  radio: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19.1 4.9a10 10 0 0 1 0 14.2M4.9 19.1a10 10 0 0 1 0-14.2"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v4"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  power: '<path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.8 0"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  'app-window': '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 9h20M6 6.5h.01M9 6.5h.01"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  cpu: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
  battery: '<rect x="2" y="7" width="17" height="10" rx="2.5"/><path d="M22 11v2"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
  command: '<path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  terminal: '<path d="m4 17 6-6-6-6M12 19h8"/>',
  'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  wand: '<path d="m15 4 5 5L8 21l-5-5z"/><path d="M15 9l-3-3"/>',
  school: '<path d="M22 9 12 4 2 9l10 5z"/><path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>',
  toggle: '<rect x="2" y="6" width="20" height="12" rx="6"/><circle cx="16" cy="12" r="3"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  'chevron-right': '<path d="M9 6l6 6-6 6"/>',
  'chevron-left': '<path d="M15 6l-6 6 6 6"/>',
  'chevron-up': '<path d="M6 15l6-6 6 6"/>',
  'chevron-down': '<path d="M6 9l6 6 6-6"/>',
  square: '<rect x="4" y="4" width="16" height="16" rx="3"/>',
  wifi: '<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a15 15 0 0 1 20 0"/><path d="M12 19.5h.01"/>',
  'wifi-off': '<path d="M2 2l20 20M8.5 16a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 4.7-2.6M2 9a15 15 0 0 1 4.2-2.8M14 10.1a10 10 0 0 1 5 2.4M17.7 6.9A15 15 0 0 1 22 9"/><path d="M12 19.5h.01"/>',
  bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9z" fill="currentColor" stroke="none"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  shuffle: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
};
const ico = (name, cls = '') => `<svg class="i${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.square}</svg>`;
const I = {
  logo: `<svg viewBox="0 0 24 24" fill="#fff"><rect x="3" y="3" width="8" height="8" rx="2.4"/><rect x="13" y="3" width="8" height="8" rx="2.4" opacity=".7"/><rect x="3" y="13" width="8" height="8" rx="2.4" opacity=".7"/><rect x="13" y="13" width="8" height="8" rx="2.4" opacity=".45"/></svg>`,
  edit: ico('edit'), gear: ico('settings'), plus: ico('plus'), x: ico('x'), check: ico('check'), trash: ico('trash'), copy: ico('copy'),
  play: ico('play'), pause: ico('pause'), next: ico('skip-forward'), prev: ico('skip-back'), chev: ico('chevron-right'), left: ico('chevron-left'),
  up: ico('chevron-up'), down: ico('chevron-down'), run: ico('play-outline'), dup: ico('copy'),
};
const ICON_CHOICES = ['sparkles', 'message', 'message-plus', 'send', 'camera', 'scissors', 'image', 'globe', 'search', 'folder', 'file-text', 'music', 'headphones', 'radio', 'heart', 'volume', 'volume-x', 'mic', 'lock', 'power', 'moon', 'sun', 'sun-dim', 'contrast', 'eye', 'eye-off', 'coffee', 'timer', 'clock', 'target', 'bell', 'monitor', 'laptop', 'smartphone', 'grid', 'layers', 'app-window', 'command', 'keyboard', 'clipboard', 'download', 'upload', 'link', 'code', 'terminal', 'wand', 'zap', 'activity', 'cpu', 'battery', 'sliders', 'star', 'school', 'home', 'user', 'briefcase', 'list', 'refresh'];
const TYPE_ICON = { app: 'app-window', url: 'globe', open: 'folder', shortcut: 'wand', shell: 'terminal', applescript: 'code', macro: 'layers', http: 'link', hotkey: 'command', type: 'keyboard', media: 'music', volume: 'volume', say: 'mic', system: 'monitor', toggle: 'toggle', timer: 'timer', clipboard: 'clipboard', notify: 'bell', page: 'grid', widget: 'activity', chrome: 'globe', claude: 'sparkles' };
const EMOJI_RE = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}\u{20E3}]/gu;
const clean = s => String(s == null ? '' : s).replace(EMOJI_RE, '').replace(/\s{2,}/g, ' ').trim();
const pageIcon = p => P[p.icon] ? p.icon : 'grid';

const PALETTE = {
  white: ['#ffffff', '#d8d8d8'], green: ['#1ed760', '#169c46'], claude: ['#e8845c', '#b9512c'], red: ['#ff5c6c', '#c9213d'],
  orange: ['#ff9f43', '#e25a12'], amber: ['#ffc94d', '#e08b00'], lime: ['#b5ec4f', '#4f9a0c'], teal: ['#36dccb', '#0a7b73'],
  cyan: ['#3fd9f5', '#0a7fac'], sky: ['#62bdff', '#1d6ae0'], blue: ['#5b84ff', '#2235d4'], indigo: ['#8a8fff', '#4235c9'],
  violet: ['#b089ff', '#6a28d6'], pink: ['#ff79b6', '#d41e68'], slate: ['#9aa3b2', '#2a3344'], zinc: ['#a1a1aa', '#26262c'],
};

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

/* ================= the link to your Mac (encrypted, via relays on the normal web port) ================= */
const brokers = () => LS.get('brokers', null) || undefined;   // advanced/testing override

async function api(method, path, body) {
  if (!S.link) throw new Error('Still connecting…');
  const res = await S.link.request('main', method, path.replace(/^\/api/, ''), body || {});
  S.macSeen = Date.now(); updateConnState();
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
    return showMessage('Open the https:// link', 'PocketDeck encrypts everything, which only works on secure pages. Scan the QR code in the PocketDeck app on your Mac.');
  }
  const fromHash = hashSecret();
  if (fromHash && fromHash !== LS.get('secret', null)) { LS.set('secret', fromHash); LS.del('config'); }
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
    if (!S.config) showOffline(e.message);
    setTimeout(loadDeck, 2500);
  }
}
function indexActions() { S.actionMap = Object.fromEntries(S.actions.map(a => [a.type, a])); }

async function pairWithCode(code) {
  const clean = PDLink.normCode(code);
  if (clean.length !== 8) throw new Error('The code is 8 characters');
  const tmp = new PDLink.Link({ brokers: brokers() });
  try {
    await tmp.join('code', PDLink.codeSecret(clean), 'phone');
    const res = await tmp.request('code', 'POST', '/pair', { device: 'iPhone' }, 15000);
    if (!res.data || !res.data.secret) throw new Error('Pairing failed — try again');
    LS.set('secret', res.data.secret); LS.del('config');
    S.secret = res.data.secret; keepHash();
  } catch (e) {
    throw new Error(/answer/.test(e.message) ? 'That code didn’t work. Check it on your Mac (codes change every 10 min and work once).' : e.message);
  } finally { tmp.close(); }
}

function unpair(msg) {
  S.secret = null; LS.del('secret'); LS.del('config');
  if (S.link) { S.link.close(); S.link = null; }
  history.replaceState(null, '', location.pathname + location.search);
  showPair(msg);
}

function showPair(msg) {
  document.body.className = '';
  root.innerHTML = '';
  const inp = h('input', { class: 'pin code', autocapitalize: 'characters', autocomplete: 'off', autocorrect: 'off', spellcheck: 'false', maxlength: '9', placeholder: 'XXXX-XXXX', 'aria-label': 'Pairing code' });
  const m = h('div', { class: 'msg' }, msg || '');
  const btn = h('button', { class: 'btn primary' }, 'Pair');
  let busy = false;
  const go = async () => {
    if (busy) return;
    const v = PDLink.normCode(inp.value);
    if (v.length !== 8) { m.textContent = 'The code is 8 characters'; return; }
    busy = true; m.textContent = ''; btn.textContent = 'Pairing…'; haptic();
    try { await pairWithCode(v); boot(); }
    catch (e) { m.textContent = e.message; btn.textContent = 'Pair'; busy = false; inp.select(); }
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
function showOffline(why) {
  showMessage('Can’t reach your Mac',
    S.relaysUp ? 'Your phone is connected, but your Mac isn’t answering. Is it awake, online and running PocketDeck? Retrying automatically…'
               : 'Can’t reach the relays from this network yet. Retrying automatically…',
    h('button', { class: 'btn', onclick: () => location.reload() }, 'Try again'),
    h('button', { class: 'btn', onclick: () => unpair() }, 'Pair again'));
}

function maybeTip() {
  if (navigator.standalone || matchMedia('(display-mode: standalone)').matches || LS.get('tipShown')) return;
  LS.set('tipShown', true);
  dialog({ title: 'Make it an app', text: 'Tap Share in Safari, then “Add to Home Screen”. It opens full-screen like a real app, already paired, and works from anywhere.', ok: 'Got it' });
}

/* ================= live connection ================= */
async function connect() {
  if (S.link) S.link.close();
  S.relaysUp = 0;
  S.link = new PDLink.Link({
    brokers: brokers(),
    onState: (up, total) => { S.relaysUp = up; S.relaysTotal = total; if (up) watch(); updateConnState(); },
    onMessage: (room, msg) => {
      if (room !== 'main') return;
      S.macSeen = Date.now(); updateConnState();
      if (msg.k === 'evt') onEvent(msg.event, msg.data);
    },
  });
  S.relaysTotal = S.link.relays.length;
  await S.link.join('main', PDLink.unb64u(S.secret), 'phone');
}
// tell the Mac someone's looking, so it streams live status
function watch() { if (S.link && document.visibilityState === 'visible') S.link.send('main', { k: 'watch' }); }
setInterval(watch, 15000);
function onEvent(ev, data) {
  if (ev === 'status') onStatus(data);
  else if (ev === 'config') onRemoteConfig(data);
  else if (ev === 'toast') toast(data.text, data.kind);
  else if (ev === 'revoked') unpair('Your Mac unpaired this phone. Scan the QR code again to reconnect.');
}
function updateConnState() {
  const macOk = Date.now() - (S.macSeen || 0) < 9000;
  S.connWhy = !S.relaysUp ? 'offline' : macOk ? 'ok' : 'mac';
  const on = S.connWhy === 'ok';
  if (on && !S.connected) setTimeout(() => { S.latency = null; measure(); }, 400); // just came back: fresh measurement
  S.connected = on;
  const dot = $('.live-dot'); if (dot) dot.classList.toggle('on', on);
  if (S.config) banner(!on, S.connWhy === 'offline' ? 'No internet — reconnecting' : 'Waiting for your Mac…');
  updateSubtitle();
}
setInterval(updateConnState, 3000);
/* latency: a full round trip phone → relay → Mac → relay → phone */
async function measure() {
  if (!S.link || document.visibilityState !== 'visible') return;
  const t0 = performance.now();
  try {
    await api('GET', '/ping');
    const ms = Math.round(performance.now() - t0);
    S.latency = ms < 2500 ? ms : null;   // ignore pings that sat in a queue while the Mac was asleep
  } catch { S.latency = null; }
  updateSubtitle();
}
setInterval(measure, 15000);
// Wi-Fi ↔ 4G switches and iOS backgrounding silently kill sockets — reconnect immediately
let hiddenAt = 0;
window.addEventListener('online', () => { if (S.link) { S.link.kick(true); setTimeout(measure, 800); } });
window.addEventListener('pageshow', e => { if (e.persisted && S.link) S.link.kick(true); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') { hiddenAt = Date.now(); return; }
  if (!S.link) return;
  if (Date.now() - hiddenAt > 4000) S.link.kick(true);
  watch(); setTimeout(measure, 600);
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
  const [a1, a2] = PALETTE[st.accent] || PALETTE.green;
  document.documentElement.style.setProperty('--accent', a1);
  document.documentElement.style.setProperty('--accent-2', a2);
  document.body.classList.toggle('vivid', st.tileStyle === 'vivid');
  document.body.classList.toggle('nolabels', st.showLabels === false);
  document.body.classList.toggle('editing', S.edit);
}

function render() {
  if (!S.config) return;
  applyTheme();
  S.page = Math.max(0, Math.min(S.page, pages().length - 1));
  root.innerHTML = '';
  const cols = Math.max(2, Math.min(8, Number(S.config.settings.columns) || 4));

  const header = h('header', { class: 'top' },
    h('div', { class: 'clock' }, h('div', { class: 'time' }, ''), h('div', { class: 'date' }, '')),
    h('div', { class: 'top-right' },
      h('div', { class: 'chips' },
        h('span', { class: 'chip conn' }, h('i', { class: 'live-dot' }), h('span', { class: 'conn-t' }, '')),
        h('span', { class: 'chip batt', hidden: true })),
      h('div', { class: 'top-btns' },
        h('button', { class: 'icon-btn' + (S.edit ? ' active' : ''), 'aria-label': 'Edit', html: S.edit ? I.check : I.edit, onclick: () => setEdit(!S.edit) }),
        h('button', { class: 'icon-btn', 'aria-label': 'Settings', html: I.gear, onclick: openSettings }))));

  const pagesEl = h('main', { class: 'pages' }, pages().map(p => {
    const grid = h('div', { class: 'grid', style: { '--cols': cols } }, p.buttons.map(b => tileEl(b, p)));
    if (S.edit) grid.append(h('button', { class: 'tile add', html: I.plus, 'aria-label': 'Add button', onclick: () => openButtonEditor(null, p.id) }));
    const kids = [grid];
    if (!p.buttons.length && !S.edit) kids.unshift(h('div', { class: 'empty' }, h('div', { class: 'empty-ico', html: ico('grid') }), 'This page is empty', h('small', {}, 'Tap the pencil up top, then + to add buttons')));
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

  const tabbar = h('nav', { class: 'tabbar' }, pages().map((p, i) => {
    const t = h('button', { class: 'tabbtn' + (i === S.page ? ' active' : ''), 'data-i': i, html: ico(pageIcon(p)) }, h('span', {}, clean(p.name)));
    t.addEventListener('click', () => { haptic(); if (S.edit && i === S.page) openPageEditor(p.id); else goPage(i); });
    return t;
  }), S.edit ? h('button', { class: 'tabbtn', onclick: addPage, html: ico('plus') }, h('span', {}, 'Page')) : null);

  const editbar = h('div', { class: 'editbar' },
    h('button', { onclick: () => openButtonEditor(null, pages()[S.page].id), html: I.plus + 'Button' }),
    h('button', { onclick: () => openPageEditor(pages()[S.page].id), html: I.edit + 'Page' }),
    h('button', { class: 'done', onclick: () => setEdit(false), html: I.check + 'Done' }));

  root.append(header, pagesEl, editbar, tabbar);
  layout();
  pagesEl.scrollLeft = S.page * pagesEl.clientWidth;
  updateLive(); updateHeader();
}

function layout() {
  const cols = Math.max(2, Math.min(8, Number(S.config.settings.columns) || 4));
  const w = Math.min(window.innerWidth, 760) - 32;
  const gap = 10;
  const cell = Math.min(Math.floor((w - gap * (cols - 1)) / cols), 140);
  document.documentElement.style.setProperty('--cell', cell + 'px');
  document.documentElement.style.setProperty('--gap', gap + 'px');
}
let resizeT; window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { if (S.config) { layout(); const pe = $('.pages'); if (pe) pe.scrollLeft = S.page * pe.clientWidth; } }, 120); });

function updatePageUI() {
  $$('.tabbtn[data-i]').forEach(t => t.classList.toggle('active', +t.dataset.i === S.page));
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
  if (on) toast('Edit mode: tap a tile to edit, hold and drag to move');
}
/* header: time, date, connection + battery */
function updateHeader() {
  const now = new Date();
  const t = $('.top .time'); if (!t) return;
  t.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  $('.top .date').textContent = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  const dot = $('.live-dot'); if (dot) dot.classList.toggle('on', !!S.connected);
  const ct = $('.conn-t');
  if (ct) ct.textContent = !S.connected ? (S.connWhy === 'offline' ? 'Offline' : S.connWhy === 'mac' ? 'Mac asleep?' : 'Connecting') : (S.latency != null ? `${S.latency} ms` : 'Live');
  const bt = $('.chip.batt'), b = S.status && S.status.battery;
  if (bt) {
    bt.hidden = !b;
    if (b) {
      bt.innerHTML = `<span class="bico${b.pct <= 20 && !b.charging ? ' low' : ''}"><i style="width:${Math.max(4, b.pct)}%"></i></span>${b.pct}%${b.charging ? ico('bolt', 'chg') : ''}`;
    }
  }
}
const updateSubtitle = updateHeader;

/* ================= tiles ================= */
function iconEl(btn) {
  const ic = (btn.icon || '').trim();
  if (ic.startsWith('i:')) return h('span', { class: 'ico svg', html: ico(ic.slice(2)) });
  if (ic.startsWith('app:')) return appImg(ic.slice(4));
  if (/^(https?:|data:|\/)/.test(ic)) return h('img', { class: 'ico', src: ic, alt: '', draggable: 'false' });
  if (!ic && btn.type === 'app' && btn.params.app) return appImg(btn.params.app);
  return h('span', { class: 'ico svg', html: ico(TYPE_ICON[btn.type] || 'square') });   // emoji icons are ignored on purpose
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
function appImg(name) {
  return iconImg(name, { class: 'ico app' }, () => h('span', { class: 'ico svg', html: ico('app-window') }));
}

function tileEl(btn, page, preview) {
  const pal = PALETTE[btn.color] || PALETTE.white;
  const size = btn.size || '1x1';
  const [w, hgt] = size.split('x').map(Number);
  const cols = Number(S.config.settings.columns) || 4;
  const isWidget = btn.type === 'widget';
  const split = btn.type === 'chrome' && btn.params.profileB;
  const el = h('button', {
    class: `tile type-${btn.type} size-${size}` + (w >= 2 ? ' wide' : '') + (hgt >= 2 ? ' tall' : '') + (isWidget ? ` widget w-${btn.params.kind}` : '') + (split ? ' split' : ''),
    'data-id': btn.id, 'data-type': btn.type,
    style: { '--c1': pal[0], '--c2': pal[1], gridColumn: `span ${Math.min(w, cols)}`, gridRow: `span ${hgt}` },
  });
  if (preview) { el.style.width = `calc(var(--cell) * ${w} + var(--gap) * ${w - 1})`; el.style.height = `calc(var(--cell) * ${hgt} + var(--gap) * ${hgt - 1})`; }

  if (isWidget) el.append(h('div', { class: 'w-body' }));
  else if (split) {
    const half = (k, label, icon) => h('span', { class: 'half', 'data-half': k }, icon, h('span', { class: 'lbl' }, clean(label)));
    const chromeIco = () => btn.icon ? iconEl(btn) : appImg('Google Chrome');
    el.append(half('a', btn.params.labelA || 'Home', chromeIco()), h('span', { class: 'divider' }), half('b', btn.params.labelB || 'School', chromeIco()));
  } else {
    el.append(h('span', { class: 'ico-wrap' }, iconEl(btn)));
    if (btn.type === 'timer') {
      el.append(h('span', { class: 'tleft' }, ''));
      el.insertAdjacentHTML('beforeend', '<svg class="tring" preserveAspectRatio="none"><rect x="1.5" y="1.5" rx="14" ry="14" pathLength="100" stroke-dasharray="100"/></svg>');
    }
    el.append(h('span', { class: 'lbl' }, clean(btn.label || '')));
    if (btn.type === 'toggle') el.append(h('span', { class: 'state' }, ''));
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
    if (e.button > 0 || e.target.closest('.vol-track')) return;
    start = { x: e.clientX, y: e.clientY }; long = false; moved = false;
    const half = e.target.closest('.half');
    (half || el).classList.add('pressed');
    if (S.edit) timer = setTimeout(() => { long = true; beginDrag(el, page, start); }, 230);
    else timer = setTimeout(() => { long = true; $$('.pressed', el).concat([el]).forEach(x => x.classList.remove('pressed')); haptic(); openButtonEditor(btn.id); }, 600);
  });
  el.addEventListener('pointermove', e => {
    if (!start || long) return;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) { clearTimeout(timer); moved = true; $$('.pressed', el).concat([el]).forEach(x => x.classList.remove('pressed')); }
  });
  const end = () => { clearTimeout(timer); $$('.pressed', el).concat([el]).forEach(x => x.classList.remove('pressed')); start = null; };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', () => { end(); moved = true; });
  el.addEventListener('contextmenu', e => e.preventDefault());
  el.addEventListener('click', e => {
    if (long || moved) { e.preventDefault(); return; }
    if (S.edit) { haptic(); openButtonEditor(btn.id); return; }
    if (e.target.closest('.vol')) return;                       // the volume slider handles itself
    const cmd = e.target.closest('[data-cmd]');
    if (cmd) { haptic(); quick({ type: 'media', params: { command: cmd.dataset.cmd } }); nudgePlaying(cmd.dataset.cmd); return; }
    const open = e.target.closest('[data-open]');
    if (open) { haptic(); quick({ type: 'app', params: { app: open.dataset.open } }); return; }
    const half = e.target.closest('[data-half]');
    if (half) { runButton(btn, el, { half: half.dataset.half }); return; }
    if (btn.type === 'widget' && (btn.params.kind === 'nowplaying' || btn.params.kind === 'stats' || btn.params.kind === 'volume')) return;
    runButton(btn, el);
  });
}
/* make play/pause feel instant: flip the icon before the Mac confirms */
function nudgePlaying(cmd) {
  if (cmd !== 'playpause' || !S.status || !S.status.nowPlaying) return;
  const np = S.status.nowPlaying;
  np.position = (np.position || 0) + (np.state === 'playing' && S.status.now ? (Date.now() + S.skew - S.status.now) / 1000 : 0);
  S.status.now = Date.now() + S.skew;
  np.state = np.state === 'playing' ? 'paused' : 'playing';
  updateLive();
}

/* ---------- drag to reorder (edit mode) ---------- */
document.addEventListener('touchmove', e => { if (S.dragging || S.sliding) e.preventDefault(); }, { passive: false });
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
  updateHeader();
}
const mmss = s => { s = Math.max(0, Math.floor(s || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

function updateTile(el, btn) {
  const st = S.status || {};
  if (btn.type === 'toggle') {
    const v = st.actions && st.actions.toggle ? st.actions.toggle[btn.params.which] : undefined;
    el.classList.toggle('on', v === true);
    const st2 = $('.state', el); if (st2) st2.textContent = v == null ? '' : v ? 'On' : 'Off';
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
        rect.setAttribute('width', Math.max(0, r.width - 3)); rect.setAttribute('height', Math.max(0, r.height - 3));
        rect.style.strokeDashoffset = String(100 - (left / t.total) * 100);
      }
    }
    return;
  }
  const body = $('.w-body', el); if (!body) return;
  const kind = btn.params.kind || 'nowplaying';
  if (kind === 'nowplaying') return nowPlaying(el, body, st);
  if (kind === 'volume') return volumeSlider(el, body, st);
  if (kind === 'stats') return statsStrip(body, st);
  if (kind === 'clock') {
    const d = new Date();
    body.innerHTML = `<div class="w-lbl">${d.toLocaleDateString(undefined, { weekday: 'long' })}</div><div class="w-big">${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div><div class="w-sub">${d.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}</div>`;
    return;
  }
  const meter = (label, pct, sub) => {
    body.innerHTML = `<div class="w-lbl">${label}</div><div class="w-big">${pct == null ? '—' : pct + '<small>%</small>'}</div><div class="meter"><i style="width:${pct || 0}%"></i></div><div class="w-sub">${sub || ''}</div>`;
  };
  if (kind === 'cpu') meter('CPU', st.cpu, 'Processor load');
  else if (kind === 'ram') meter('Memory', st.ram && st.ram.pct, st.ram ? `${st.ram.usedGB} of ${st.ram.totalGB} GB` : '');
  else if (kind === 'battery') { const b = st.battery; meter('Battery', b ? b.pct : null, b ? (b.charging ? (b.state === 'charged' ? 'Fully charged' : 'Charging') : b.remaining ? `${b.remaining} left` : 'On battery') : 'No battery'); }
}

/* ---------- now playing: the big Spotify-style card ---------- */
function nowPlaying(el, body, st) {
  const np = st.nowPlaying;
  const playing = !!(np && np.state === 'playing');
  el.classList.toggle('idle', !np);
  el.classList.toggle('paused', !playing);
  const key = np ? `${np.title}|${np.artist}|${np.art}` : 'none';
  if (body.dataset.key !== key) {
    body.dataset.key = key;
    if (!np) {
      body.innerHTML = `<div class="np-bg"></div><div class="np-shade"></div>
        <div class="np-idle"><div class="np-cover ph">${ico('music')}</div>
        <div class="np-meta"><div class="np-src">Nothing playing</div><div class="np-title">Your Mac is quiet</div><div class="np-artist">Start some music from here</div></div></div>
        <div class="np-ctrls"><button class="pill-btn" data-open="Spotify">${ico('play')}Open Spotify</button></div>`;
    } else {
      const art = np.art ? `url('${String(np.art).replace(/['"()\\\s]/g, encodeURIComponent)}')` : 'none';
      body.innerHTML = `<div class="np-bg" style="background-image:${art}"></div><div class="np-shade"></div>
        <div class="np-top"><div class="np-cover${np.art ? '' : ' ph'}" style="background-image:${art}">${np.art ? '' : ico('music')}</div>
        <div class="np-meta"><div class="np-src"><span class="eq"><i></i><i></i><i></i></span><span class="np-state"></span></div>
        <div class="np-title"></div><div class="np-artist"></div></div></div>
        <div class="np-prog"><div class="np-bar"><i></i></div><div class="np-times"><span class="np-cur">0:00</span><span class="np-dur">0:00</span></div></div>
        <div class="np-ctrls"><button class="np-btn" data-cmd="previous" aria-label="Previous">${ico('skip-back')}</button>
        <button class="np-btn main" data-cmd="playpause" aria-label="Play or pause"></button>
        <button class="np-btn" data-cmd="next" aria-label="Next">${ico('skip-forward')}</button></div>`;
      $('.np-title', body).textContent = np.title || '';
      $('.np-artist', body).textContent = np.artist || '';
    }
  }
  if (!np) return;
  const main = $('.np-btn.main', body);
  if (main && main.dataset.p !== String(playing)) { main.dataset.p = String(playing); main.innerHTML = playing ? ico('pause') : ico('play'); }
  const state = $('.np-state', body); if (state) state.textContent = `${np.player || 'Spotify'} · ${playing ? 'Playing' : 'Paused'}`;
  if (np.duration) {
    const pos = Math.min(np.duration, (np.position || 0) + (playing && st.now ? (Date.now() + S.skew - st.now) / 1000 : 0));
    $('.np-bar i', body).style.width = (pos / np.duration * 100) + '%';
    $('.np-cur', body).textContent = mmss(pos);
    $('.np-dur', body).textContent = mmss(np.duration);
  }
}

/* ---------- volume: a slim slider you can drag ---------- */
function volumeSlider(el, body, st) {
  const v = st.volume || {};
  const vertical = el.classList.contains('tall') && !el.classList.contains('wide');
  el.classList.toggle('vertical', vertical);
  if (!body.dataset.built) {
    body.dataset.built = '1';
    body.innerHTML = `<div class="vol"><div class="vol-track"><div class="vol-fill"></div></div><div class="vol-pct"></div><button class="vol-mute" aria-label="Mute"></button></div>`;
    const track = $('.vol-track', body);
    let lastSent = 0, sendT = null;
    const setFrom = e => {
      const r = track.getBoundingClientRect();
      const f = vertical ? 1 - (e.clientY - r.top) / r.height : (e.clientX - r.left) / r.width;
      const lvl = Math.round(Math.max(0, Math.min(1, f)) * 100);
      body.dataset.local = lvl; body.dataset.until = Date.now() + 2500;
      drawVol(body, lvl, false, vertical);
      const send = () => { lastSent = Date.now(); quietQuick({ type: 'volume', params: { command: 'set', level: lvl } }); };
      clearTimeout(sendT);
      if (Date.now() - lastSent > 140) send(); else sendT = setTimeout(send, 140);
    };
    track.addEventListener('pointerdown', e => { if (S.edit) return; e.stopPropagation(); S.sliding = true; track.setPointerCapture(e.pointerId); haptic(); setFrom(e); });
    track.addEventListener('pointermove', e => { if (S.sliding && track.hasPointerCapture(e.pointerId)) setFrom(e); });
    const up = e => { if (!S.sliding) return; S.sliding = false; try { track.releasePointerCapture(e.pointerId); } catch {} };
    track.addEventListener('pointerup', up); track.addEventListener('pointercancel', up);
    $('.vol-mute', body).addEventListener('click', e => { e.stopPropagation(); if (S.edit) return; haptic(); quietQuick({ type: 'volume', params: { command: 'togglemute' } }); });
  }
  if (Date.now() < Number(body.dataset.until || 0)) return;   // you're dragging: don't fight your finger
  drawVol(body, v.level, v.muted, vertical);
}
function drawVol(body, level, muted, vertical) {
  const pct = level == null ? 0 : level;
  const fill = $('.vol-fill', body);
  if (vertical) { fill.style.height = (muted ? 0 : pct) + '%'; fill.style.width = ''; } else { fill.style.width = (muted ? 0 : pct) + '%'; fill.style.height = ''; }
  $('.vol-pct', body).textContent = level == null ? '—' : muted ? 'Muted' : pct + '%';
  $('.vol-mute', body).innerHTML = ico(muted || pct === 0 ? 'volume-x' : pct < 45 ? 'volume-low' : 'volume');
}
async function quietQuick(button) { try { await api('POST', '/test', { button }); } catch (e) { toast(e.message, 'err'); } }

/* ---------- stats strip: battery · CPU · memory · current app ---------- */
function statsStrip(body, st) {
  const b = st.battery, r = st.ram;
  const cell = (label, value, pct, sub) => `<div class="st"><div class="w-lbl">${label}</div><div class="st-v">${value}</div>${pct == null ? `<div class="w-sub">${sub || ''}</div>` : `<div class="meter"><i style="width:${pct}%"></i></div>`}</div>`;
  const app = st.frontApp ? String(st.frontApp).replace(/[<>&]/g, '') : '—';
  body.innerHTML = '<div class="stats">'
    + (b ? cell('Battery', `${b.pct}%${b.charging ? ico('bolt', 'chg') : ''}`, b.pct) : '')
    + cell('CPU', st.cpu == null ? '—' : st.cpu + '%', st.cpu || 0)
    + cell('Memory', r ? r.pct + '%' : '—', r ? r.pct : 0)
    + cell('Using', `<span class="st-app">${app}</span>`, null, '')
    + '</div>';
}
setInterval(() => {
  updateHeader();
  $$('.tile.w-clock, .tile.type-timer, .tile.w-nowplaying').forEach(el => { const l = locate(el.dataset.id); if (l) updateTile(el, l.button); });
}, 1000);

/* ================= running buttons ================= */
async function runButton(btn, el, extra) {
  haptic();
  if (btn.type === 'page') {
    const i = pages().findIndex(p => p.id === btn.params.target);
    if (i >= 0) goPage(i); else toast('That page doesn’t exist any more', 'err');
    return;
  }
  if (btn.type === 'widget' && btn.params.kind === 'clock') return;
  if (btn.confirm && !(await confirmBox(`Run “${btn.label || 'this'}”?`, 'Just making sure'))) return;
  const asked = await askFields(btn);
  if (asked === null) return;
  const runtime = { ...asked, ...(extra || {}) };
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
  try { const res = await api('POST', '/api/test', { button: draft, params: runtime }); handleResult(res); if (!res.message && !res.show && !res.image) toast('Worked'); }
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
  const t = h('div', { class: 'toast' + (kind === 'err' ? ' err' : '') }, h('span', { class: 'tdot' }), h('span', {}, clean(text)));
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
  if (!ok && navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast('Copied'), () => toast('Long-press the text to copy', 'err'));
  else toast(ok ? 'Copied to your phone' : 'Long-press the text to copy', ok ? '' : 'err');
}
function outputBox({ title, text, mono }) {
  const content = mono ? h('pre', {}, text) : h('div', { class: 'out' }, text);
  const copyBtn = h('button', { class: 'btn small', style: { marginTop: '10px' }, onclick: () => copyText(text), html: I.copy + ' Copy' });
  dialog({ title, body: h('div', {}, content, copyBtn), ok: 'Done' });
}
function imageBox(title, src) {
  dialog({ title, text: 'Long-press the image to save it', body: h('img', { src, alt: 'Mac screen' }), ok: 'Close', wide: true });
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
  const sh = sheet({ title: isNew ? 'New button' : 'Edit button', tall: true });

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
        h('span', { class: 'type-ico', html: ico(TYPE_ICON[draft.type] || 'square') }),
        h('div', { class: 'rl' }, clean(def.name), h('div', { class: 'hint' }, clean(def.description || ''))),
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
    const appForIcon = draft.params.app || (draft.type === 'chrome' ? 'Google Chrome' : '');
    const iconGrid = h('div', { class: 'icon-grid' });
    const markIcons = () => $$('button', iconGrid).forEach(b => b.classList.toggle('on', b.dataset.v === (draft.icon || '')));
    const pickIcon = v => { draft.icon = v; markIcons(); refreshPreview(); haptic(); };
    iconGrid.append(h('button', { 'data-v': '', class: 'auto', onclick: () => pickIcon('') }, appForIcon ? 'App' : 'Auto'));
    for (const n of ICON_CHOICES) iconGrid.append(h('button', { 'data-v': 'i:' + n, html: ico(n), 'aria-label': n, onclick: () => pickIcon('i:' + n) }));
    markIcons();
    const sws = h('div', { class: 'swatches' }, colors.map(c => {
      const [c1, c2] = PALETTE[c];
      return h('button', { class: 'sw' + (draft.color === c ? ' on' : ''), style: { '--c1': c1, '--c2': c2 }, 'aria-label': c, onclick: e => { draft.color = c; $$('.sw', sws).forEach(s => s.classList.remove('on')); e.currentTarget.classList.add('on'); refreshPreview(); haptic(); } });
    }));
    sh.body.append(sec('Looks'), group(
      h('div', { class: 'row col' }, h('div', { class: 'rl' }, 'Label'), labelInp),
      h('div', { class: 'row col' }, h('div', { class: 'rl' }, 'Icon'), iconGrid,
        h('div', { class: 'chips' },
          h('button', { class: 'btn small', onclick: () => pickApp(name => { pickIcon('app:' + name); }) }, 'Use an app’s icon'),
          h('button', { class: 'btn small', onclick: async () => { const u = await promptBox('Image icon', 'Paste an image URL', false, /^https?:/.test(draft.icon) ? draft.icon : ''); if (u != null && u.trim()) pickIcon(u.trim()); } }, 'Image URL'))),
      h('div', { class: 'row col' }, h('div', { class: 'rl' }, 'Colour'), sws),
      h('div', { class: 'row col' }, h('div', { class: 'rl' }, 'Size'),
        segEl([['1x1', '1×1'], ['2x1', '2×1'], ['1x2', '1×2'], ['2x2', '2×2'], ['4x1', 'Wide']], draft.size || '1x1', v => { draft.size = v; refreshPreview(); }))));

    // ---- behaviour ----
    const pageSel = h('select', { class: 'inp' }, pages().map(p => h('option', { value: p.id, selected: p.id === targetPage }, clean(p.name))));
    pageSel.addEventListener('change', () => { targetPage = pageSel.value; });
    sh.body.append(sec('Behaviour'), group(
      h('div', { class: 'row' }, h('div', { class: 'rl' }, 'Ask before running', h('div', { class: 'hint' }, 'Good for sleep, restart, kill commands')), switchEl(!!draft.confirm, v => { draft.confirm = v; })),
      h('div', { class: 'row col' }, h('div', { class: 'rl' }, 'Lives on page'), pageSel)));

    // ---- footer ----
    sh.foot.innerHTML = '';
    if (!isNew) sh.foot.append(
      h('button', { class: 'btn icon danger', 'aria-label': 'Delete', html: I.trash, onclick: () => { sh.close(); deleteButton(draft.id); } }),
      h('button', { class: 'btn icon', 'aria-label': 'Duplicate', html: I.dup, onclick: () => { const copy = clone(draft); copy.id = uid('b'); copy.label = (copy.label || '') + ' copy'; const p = pages().find(p => p.id === targetPage); p.buttons.splice(p.buttons.findIndex(b => b.id === draft.id) + 1, 0, copy); saveConfig(); sh.close(); render(); toast('Duplicated'); } }));
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
    toast(isNew ? 'Button added' : 'Saved');
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
  if (sel) { const opt = (sel.options || []).find(o => o[0] === p[sel.key]); if (opt) return clean(opt[1]).replace(/\s*\(.*\)$/, ''); }
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
      const sel = h('select', { class: 'inp' }, (f.options || []).map(([v, l]) => h('option', { value: v, selected: v === val }, clean(l))));
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
    case 'chrome-profile': {
      const none = f.key === 'profileB' ? 'None (one big button)' : 'Choose…';
      const sel = h('select', { class: 'inp' }, h('option', { value: val }, val ? clean(val) : none));
      if (f.key === 'profileB' && val) sel.append(h('option', { value: '' }, none));
      api('GET', '/chrome-profiles').then(d => {
        for (const p of d.profiles || []) if (p.name !== val && p.dir !== val) sel.append(h('option', { value: p.name }, p.email ? `${p.name} · ${p.email}` : p.name));
      }).catch(() => {});
      sel.addEventListener('change', () => { set(sel.value); refreshPreview(); });
      return h('div', { class: 'row col' }, lbl, sel, f.key === 'profileA' ? h('div', { class: 'hint' }, 'Tip: “Home” and “School” are matched to your profiles automatically') : null);
    }
    case 'page': {
      const sel = h('select', { class: 'inp' }, h('option', { value: '' }, 'Choose a page…'), pages().map(p => h('option', { value: p.id, selected: p.id === val }, clean(p.name))));
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
    if (s.button) { const l = locate(s.button); return l ? `Run: ${clean(l.button.label || l.button.type)}` : 'Missing button'; }
    if (s.action) { const d = S.actionMap[s.action.type]; return `${d ? clean(d.name) : s.action.type}${s.action.params && s.action.params.command ? ' · ' + s.action.params.command : ''}`; }
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
      h('span', { class: 'e', html: ico(TYPE_ICON[a.type] || 'square') }), h('b', {}, clean(a.name)), h('small', {}, clean(a.description || ''))))));
  }
  sh.foot.remove();
}
let appsCache = null;
async function pickApp(cb, allowNone) {
  const sh = sheet({ title: 'Pick an app', tall: true });
  sh.foot.remove();
  const search = h('input', { class: 'inp', placeholder: 'Search apps', autocapitalize: 'off', autocorrect: 'off' });
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
    loadIcon(name).then(u => { if (u) img.src = u; else img.replaceWith(h('span', { class: 'ph', html: ico('app-window') })); });
  }), { root: sh.body }) : null;
  const draw = () => {
    const q = search.value.trim().toLowerCase();
    list.innerHTML = '';
    const hits = appsCache.filter(a => a.toLowerCase().includes(q));
    if (q && !hits.some(a => a.toLowerCase() === q)) list.append(h('button', { class: 'pick', onclick: () => { sh.close(); cb(search.value.trim()); } }, h('span', { class: 'ph', html: ico('edit') }), `Use “${search.value.trim()}”`));
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
    if (!d.shortcuts.length) wrap.append(h('div', { class: 'list-btn' }, d.error ? d.error : 'No Shortcuts found — make one in the Shortcuts app on your Mac!'));
    for (const s of d.shortcuts) wrap.append(h('button', { class: 'list-btn', onclick: () => { haptic(); sh.close(); cb(s); } }, h('span', { class: 'li', html: ico('wand') }), s));
  } catch (e) { wrap.innerHTML = ''; wrap.append(h('div', { class: 'list-btn' }, e.message)); }
}
function pickButton(excludeId, cb) {
  const sh = sheet({ title: 'Which button?', tall: true });
  sh.foot.remove();
  for (const p of pages()) {
    const list = p.buttons.filter(b => b.id !== excludeId);
    if (!list.length) continue;
    sh.body.append(sec(clean(p.name)), h('div', { class: 'group' }, list.map(b => h('button', { class: 'list-btn', onclick: () => { haptic(); sh.close(); cb(b.id); } },
      h('span', { class: 'li', html: ico(b.icon && b.icon.startsWith('i:') ? b.icon.slice(2) : TYPE_ICON[b.type] || 'square') }), clean(b.label || b.type)))));
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
  const p = { id: uid('p'), name: `Page ${pages().length + 1}`, icon: 'grid', buttons: [] };
  pages().push(p); S.page = pages().length - 1;
  saveConfig(); render(); openPageEditor(p.id);
}
function openPageEditor(id) {
  const idx = pages().findIndex(p => p.id === id); if (idx < 0) return;
  const page = pages()[idx];
  const sh = sheet({ title: 'Edit page' });
  const name = h('input', { class: 'inp', value: page.name, placeholder: 'Page name' });
  let chosen = pageIcon(page);
  const icon = h('div', { class: 'icon-grid' }, ICON_CHOICES.map(n => h('button', { 'data-v': n, class: n === chosen ? 'on' : '', html: ico(n), onclick: e => { chosen = n; $$('button', icon).forEach(b => b.classList.toggle('on', b.dataset.v === n)); haptic(); } })));
  sh.body.append(group(
    h('div', { class: 'row col' }, h('div', { class: 'rl' }, 'Name'), name),
    h('div', { class: 'row col' }, h('div', { class: 'rl' }, 'Icon'), icon),
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
    h('button', { class: 'btn primary', html: I.check + 'Save', onclick: () => { page.name = name.value.trim() || 'Page'; page.icon = chosen; saveConfig(); sh.close(); render(); } }));
}

/* ================= settings ================= */
function openSettings() {
  haptic();
  const st = S.config.settings;
  const sh = sheet({ title: 'Settings', tall: true });
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
      h('div', { class: 'row col' }, h('div', { class: 'rl' }, 'Tile style'), segEl([['dark', 'Dark'], ['vivid', 'Colour']], st.tileStyle === 'vivid' ? 'vivid' : 'dark', v => upd('tileStyle', v))),
      h('div', { class: 'row' }, h('div', { class: 'rl' }, 'Show labels'), switchEl(st.showLabels !== false, v => upd('showLabels', v))),
      h('div', { class: 'row col' }, h('div', { class: 'rl' }, 'Accent colour'), accentSw)),
    sec('This phone'), group(
      h('div', { class: 'row' }, h('div', { class: 'rl' }, 'Haptics', h('div', { class: 'hint' }, 'Tiny taps on press (iOS 18+)')), switchEl(LS.get('haptics', true), v => LS.set('haptics', v))),
      h('div', { class: 'row' }, h('div', { class: 'rl' }, 'Keep screen on', h('div', { class: 'hint' }, 'Great when your phone sits on a stand as a deck')), switchEl(LS.get('wake', false), v => { LS.set('wake', v); wake(v); })),
      h('div', { class: 'row' }, h('div', { class: 'rl' }, 'Pure black (OLED)'), switchEl(LS.get('oled', false), v => { LS.set('oled', v); applyTheme(); }))),
    sec('Your deck'), group(
      h('div', { class: 'row tap', onclick: exportConfig }, h('div', { class: 'rl' }, 'Export config'), h('span', { class: 'val', html: I.chev })),
      h('div', { class: 'row tap', onclick: importConfig }, h('div', { class: 'rl' }, 'Import config'), h('span', { class: 'val', html: I.chev })),
      h('div', { class: 'row tap', onclick: resetConfig }, h('div', { class: 'rl', style: { color: 'var(--err)' } }, 'Reset to the starter deck'), h('span', { class: 'val', html: I.chev }))),
    sec('Connection'), group(
      h('div', { class: 'row' }, h('div', { class: 'rl' }, 'Your Mac', h('div', { class: 'hint' }, (srv.host || '').replace(/\.local$/, ''))), h('span', { class: 'val' }, S.connWhy === 'ok' ? 'Online' : S.connWhy === 'offline' ? 'No internet' : 'Not answering')),
      h('div', { class: 'row' }, h('div', { class: 'rl' }, 'Speed', h('div', { class: 'hint' }, 'Phone → relay → Mac → back')), h('span', { class: 'val' }, S.latency != null ? `${S.latency} ms` : '—')),
      h('div', { class: 'row' }, h('div', { class: 'rl' }, 'Relays', h('div', { class: 'hint' }, 'One runs on the normal web port, so strict Wi-Fi can’t block it. Any one is enough.')), h('span', { class: 'val' }, `${S.relaysUp || 0}/${S.relaysTotal || 4} connected`)),
      h('div', { class: 'row' }, h('div', { class: 'rl' }, 'Encryption', h('div', { class: 'hint' }, 'AES-256, end to end. Relays can’t read or fake anything.')), h('span', { class: 'val' }, 'On')),
      h('div', { class: 'row' }, h('div', { class: 'rl' }, 'Version'), h('span', { class: 'val' }, srv.version || '—')),
      h('div', { class: 'row tap', onclick: async () => { if (await confirmBox('Unpair this phone?', 'You’ll need to scan the QR (or type a code) to connect again.', 'Unpair', true)) { sh.close(); unpair(); } } }, h('div', { class: 'rl' }, 'Unpair this phone')),
      h('div', { class: 'row tap', onclick: async () => { if (await confirmBox('Unpair every phone?', 'Your Mac makes a brand-new key and every phone (this one too) gets kicked out. Use it if you lose a phone.', 'Unpair all', true)) { try { await api('POST', '/rotate'); } catch {} sh.close(); unpair('All phones unpaired. Scan the new QR on your Mac.'); } } }, h('div', { class: 'rl', style: { color: 'var(--err)' } }, 'Unpair all phones'))),
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
    S.config = saved.config; S.page = 0; render(); toast('Imported');
  } catch (e) { toast(e.message, 'err'); }
}
async function resetConfig() {
  if (!(await confirmBox('Reset everything?', 'Your current deck gets replaced with the starter deck (a backup is kept on your Mac as config.backup.json).', 'Reset', true))) return;
  try {
    const d = await api('GET', '/api/defaults');
    const saved = await api('PUT', '/api/config', { config: d.config });
    S.config = saved.config; S.page = 0; $$('.sheet-back').forEach(b => b.remove()); S.sheets = 0; render(); toast('Fresh start');
  } catch (e) { toast(e.message, 'err'); }
}

/* ================= go ================= */
if (LS.get('wake', false)) wake(true);
if ('serviceWorker' in navigator && window.isSecureContext && location.hostname !== 'localhost') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
boot();
})();
