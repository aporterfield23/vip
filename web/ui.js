/* UI helpers: icons, small components, state and rendering. */
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const I = {
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  up: '<svg viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="M5 9l7 7 7-7"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 8 13"><path d="M1.5 1.5l5 5-5 5"/></svg>',
  pen: '<svg class="pen" viewBox="0 0 24 24"><path d="M4 20l1-4L17 4l3 3L8 19z"/><path d="M14 7l3 3"/></svg>',
  check: '<svg class="check" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg>',
  ok: '<svg viewBox="0 0 22 22"><path d="M4.5 11.5l4.5 4.5 9-10"/></svg>',
  no: '<svg viewBox="0 0 22 22"><circle cx="11" cy="11" r="8"/></svg>',
  cal: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  person: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.5 18c1.5-2.5 3.2-3.5 5.5-3.5s4 1 5.5 3.5"/></svg>',
  bell: '<svg viewBox="0 0 24 24"><path d="M6 17V11a6 6 0 0112 0v6l1.5 2h-15z"/><path d="M10 21h4"/></svg>',
  doc: '<svg viewBox="0 0 24 24" style="width:24px;height:24px;stroke:var(--color-text-primary);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 13h6M9 17h4"/></svg>',
  tick: '<svg viewBox="0 0 40 40"><path d="M9 21l8 8 14-17"/></svg>',
};
const ICON_PDF = '<span style="border:1px solid var(--color-text-secondary);color:var(--color-text-secondary);border-radius:5px;font-size:11px;font-weight:600;padding:2px 6px">PDF</span>';
const docTile = '<span style="width:44px;height:44px;border-radius:22px;background:color-mix(in srgb,var(--color-text-primary) 8%,transparent);display:grid;place-items:center;flex:none">' + I.doc + '</span>';

const chip = (label, kind = '') => `<span class="chip ${kind}"><i></i>${esc(label)}</span>`;
const statusChip = (s) => chip(s, { Pending: 'orange', Approved: 'green', Paid: 'green', Denied: 'red', Cancelled: 'red', New: 'accent', Complete: 'green' }[s] || '');
const btn = (label, o = {}) => `<button class="btn ${o.kind || 'primary'} ${o.small ? 'small' : ''}" ${o.act ? `data-act="${o.act}"` : ''} ${o.arg != null ? `data-arg="${esc(o.arg)}"` : ''} ${o.disabled ? 'disabled' : ''}>${esc(label)}</button>`;
const row = (o) => {
  const tag = o.act ? 'button' : 'div';
  return `<${tag} class="row" ${o.act ? `data-act="${o.act}" data-arg="${esc(o.arg ?? '')}"` : ''}><div class="grow"><div class="ttl ${o.cls || ''}">${o.title}</div>${o.sub != null ? `<div class="sub">${o.sub}</div>` : ''}</div>${o.trail != null ? `<div class="trail">${o.trail}</div>` : ''}</${tag}>`;
};
const card = (...rows) => `<div class="card">${rows.join('')}</div>`;
const toggle = (on, act, arg, disabled) => `<button class="toggle" role="switch" aria-checked="${!!on}" data-act="${act}" data-arg="${esc(arg ?? '')}" ${disabled ? 'disabled' : ''}></button>`;
const seg = (act, opts, sel, cls = '', dot) => `<div class="seg ${cls}" role="tablist">${opts.map((o) => `<button role="tab" aria-selected="${o === sel}" data-act="${act}" data-arg="${esc(o)}">${esc(o)}${dot === o ? '<span class="dotbadge"></span>' : ''}</button>`).join('')}</div>`;
const field = (key, label, o = {}) => `<label class="field ${o.err ? 'error' : ''}"><span>${esc(label)}</span>${o.area ? `<textarea data-bind="${key}" placeholder="${esc(o.ph || '')}">${esc(F[key] ?? '')}</textarea>` : `<input data-bind="${key}" type="${o.type || 'text'}" value="${esc(F[key] ?? '')}" placeholder="${esc(o.ph || '')}" ${o.attrs || ''} autocomplete="off">`}${o.err ? `<span class="err">${esc(o.err)}</span>` : ''}</label>`;
const toolbar = (o = {}) => `<div class="toolbar">${o.back ? `<button class="circle-btn" data-act="back" aria-label="Back">${I.back}</button>` : o.cancel ? `<button class="text-btn" data-act="${o.cancel}">Cancel</button>` : '<span class="spacer"></span>'}
  <div class="mid"><div class="t">${esc(o.title || '')}</div>${o.sub ? `<div class="s">${esc(o.sub)}</div>` : ''}</div>${o.trail || '<span class="spacer"></span>'}</div>`;
const pair = (upAct, downAct, upOff, downOff) => `<div class="pair"><button class="circle-btn" data-act="${upAct}" aria-label="Previous assignment" ${upOff ? 'disabled' : ''}>${I.up}</button><button class="circle-btn" data-act="${downAct}" aria-label="Next assignment" ${downOff ? 'disabled' : ''}>${I.down}</button></div>`;

// ---------- state ----------
const F = {}; // form values
const S = {
  mode: 'light', appearance: 'System default', authed: false, auth: ['welcome'], tab: 'Schedule',
  stacks: { Schedule: [{ n: 'schedule' }], 'Time Off': [{ n: 'timeoff' }], Timesheets: [{ n: 'timesheets' }], Account: [{ n: 'account' }] },
  schedSeg: 'Upcoming', tsSeg: 'Open', period: 'p1', range: null, detailSeg: 'Details',
  notif: { on: true, denied: false, types: { assignments: true, soon: true, photos: true, approved: true, timeoff: true } },
  profile: { name: 'Jordan Ellis', title: 'Event Photographer', phone: '(312) 555-0148', email: 'jordan.ellis@example.com', address: '2418 N Lincoln Ave, Chicago, IL 60614' },
  asg: JSON.parse(JSON.stringify(ASSIGNMENTS)), off: JSON.parse(JSON.stringify(TIMEOFF)), ts: JSON.parse(JSON.stringify(TS)),
  clock: 6 * 60 + 52, overlay: null, toast: null, upload: null, log: {}, qrFail: false,
};
const phone = () => document.getElementById('phone');
const cur = () => { const st = S.stacks[S.tab]; return st[st.length - 1]; };
const asgOf = (id) => S.asg.find((a) => a.id === id);
const tsOf = (id) => S.ts.find((e) => e.id === id);
const toOf = (id) => S.off.find((e) => e.id === id);
const tick = (min) => { S.clock += min; return S.clock; };

function statusbar() {
  return `<div class="statusbar"><span>9:41</span><span class="island"></span><span class="sig"><svg viewBox="0 0 19 12"><rect x="0" y="8" width="3" height="4" rx=".6"/><rect x="5" y="5.5" width="3" height="6.5" rx=".6"/><rect x="10" y="3" width="3" height="9" rx=".6"/><rect x="15" y="0" width="3" height="12" rx=".6"/></svg><svg viewBox="0 0 17 12"><path d="M8.5 2.4c2.3 0 4.4.9 6 2.4l1.2-1.3A10.5 10.5 0 008.5.6 10.5 10.5 0 001.3 3.5l1.2 1.3a8.7 8.7 0 016-2.4zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.2-1.3A7 7 0 008.5 4.2a7 7 0 00-4.6 1.8l1.2 1.3c.9-.8 2.1-1.3 3.4-1.3zM8.5 9.4c.6 0 1.1.2 1.5.6L8.5 11.6 7 10c.4-.4.9-.6 1.5-.6z"/></svg><svg viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2.2"/><rect x="25" y="4.5" width="1.5" height="4" rx=".7" opacity=".5"/></svg></span></div>`;
}
const TABS = [['Schedule', I.cal], ['Time Off', I.sun], ['Timesheets', I.clock], ['Account', I.person]];
function tabbar() { return `<nav class="tabbar" aria-label="Tabs">${TABS.map(([t, ic]) => `<button data-act="tab" data-arg="${t}" ${S.tab === t ? 'aria-current="true"' : ''}>${ic}${t}</button>`).join('')}</nav>`; }

function render() {
  const p = phone(); if (!p) return;
  const active = document.activeElement; const bind = active && active.dataset && active.dataset.bind; const selStart = bind ? active.selectionStart : null;
  const prevScroll = p.querySelector('.screen') ? p.querySelector('.screen').scrollTop : 0; const prevKey = p.dataset.screenKey;
  let body = '', tabs = false, key;
  if (!S.authed) { const n = S.auth[S.auth.length - 1]; key = 'auth-' + n; body = SCREENS[n](); }
  else { const c = cur(); key = S.tab + '-' + c.n + '-' + (c.id || ''); body = SCREENS[c.n](c); tabs = true; }
  p.dataset.screenKey = key;
  p.innerHTML = statusbar() + `<div class="screen ${tabs ? 'pad-tab' : ''}" id="screen">${body}</div>` + (tabs ? tabbar() + uploadBar() : '') + overlayHtml() + toastHtml() + '<div class="home-indicator"></div>';
  const sc = p.querySelector('.screen'); if (prevKey === key) sc.scrollTop = prevScroll;
  if (bind) { const el = p.querySelector(`[data-bind="${bind}"]`); if (el) { el.focus(); try { el.setSelectionRange(selStart, selStart); } catch (e) {} } }
  if (S.focusNext) { const el = p.querySelector(`[data-bind="${S.focusNext}"]`); if (el) { el.focus(); el.select && el.select(); } S.focusNext = null; }
  p.setAttribute('data-mode', S.mode);
  navTitle();
  const dd = document.getElementById('jump'); if (dd) dd.value = '';
}
// iOS large-title behaviour: once the large title scrolls under the toolbar, its text fades into the navigation bar and the bar gains a hairline.
function navTitle() {
  const sc = document.getElementById('screen'); if (!sc) return;
  const lt = sc.querySelector('.largetitle'), tb = sc.querySelector('.toolbar'); if (!lt || !tb) return;
  const t = tb.querySelector('.mid .t'); if (t && !t.textContent) t.textContent = lt.textContent.trim();
  const end = lt.offsetTop + lt.offsetHeight - tb.offsetHeight; // scroll position where the large title is fully under the bar
  const k = Math.max(0, Math.min(1, (sc.scrollTop - (end - 14)) / 14));
  tb.style.setProperty('--nav-k', k.toFixed(2)); tb.classList.toggle('collapsed', k >= 1);
}
document.addEventListener('scroll', (e) => { if (e.target && e.target.id === 'screen') navTitle(); }, true);
function setMode() {
  const sys = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  S.mode = S.appearance === 'Dark' ? 'dark' : S.appearance === 'Light' ? 'light' : (S.demoMode || sys);
  document.querySelectorAll('.controls [data-mode]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.mode === S.mode));
}
function uploadBar() {
  if (!S.upload) return '';
  return `<button class="upbar" data-act="openAsg" data-arg="${S.upload.id}"><div class="t-sub" style="font-weight:600">${S.upload.failed ? 'Upload failed · tap to try again' : 'Uploading photos'}</div><div class="progress"><i style="width:${S.upload.pct}%"></i></div></button>`;
}
function toastHtml() { return S.toast ? `<button class="toast" data-act="toast"><span class="app">VIP</span><span style="flex:1"><div class="t-sub" style="font-weight:600">${esc(S.toast.title)}</div><div class="t-foot sec">${esc(S.toast.body)}</div></span><span class="t-foot sec">now</span></button>` : ''; }
function overlayHtml() { return S.overlay ? OVERLAYS[S.overlay.n](S.overlay) : ''; }
const open = (n, o = {}) => { S.overlay = { n, ...o }; render(); };
const closeOverlay = () => { S.overlay = null; render(); };
const push = (n, o = {}) => { S.stacks[S.tab].push({ n, ...o }); S.overlay = null; render(); document.getElementById('screen').scrollTop = 0; };
const goTab = (t) => { S.tab = t; S.overlay = null; render(); };
function sheet(title, body, o = {}) {
  return `<div class="scrim" data-act="${o.dismiss === false ? '' : 'close'}"></div><div class="sheet ${o.short ? 'short' : ''}" role="dialog" aria-label="${esc(title)}">
  <div class="sh-bar">${o.noCancel ? '<span class="spacer" style="width:60px"></span>' : `<button class="text-btn" data-act="close">${o.cancelLabel || 'Cancel'}</button>`}<div class="t">${esc(title)}</div>${o.trail || '<span style="width:60px"></span>'}</div>
  <div class="sh-body">${body}</div>${o.foot ? `<div class="sh-foot">${o.foot}</div>` : ''}</div>`;
}
function actionSheet(title, msg, items, keepLabel) {
  return `<div class="scrim" data-act="close"></div><div class="asheet" role="dialog"><div class="grp">${title ? `<div class="h"><b>${esc(title)}</b>${esc(msg || '')}</div>` : ''}${items.map((i) => `<button class="${i.d ? 'd' : ''}" data-act="${i.act}" data-arg="${esc(i.arg ?? '')}">${esc(i.label)}${i.sub ? `<small>${esc(i.sub)}</small>` : ''}</button>`).join('')}</div><button class="cancel" data-act="close">${keepLabel || 'Cancel'}</button></div>`;
}
function alertBox(title, msg, acts) {
  return `<div class="scrim"></div><div class="alert" role="alertdialog"><div class="b"><h4>${esc(title)}</h4><p>${esc(msg)}</p></div><div class="acts">${acts.map((a) => `<button class="${a.d ? 'd' : ''}" data-act="${a.act}" data-arg="${esc(a.arg ?? '')}">${esc(a.label)}</button>`).join('')}</div></div>`;
}
function flash(title, body, act) { S.toast = { title, body, act }; render(); clearTimeout(flash.t); flash.t = setTimeout(() => { S.toast = null; render(); }, 6000); }
