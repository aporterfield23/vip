/* Actions, events and start-up */
const authPush = (n) => { S.auth.push(n); render(); document.getElementById('screen').scrollTop = 0; };
const curAsgId = () => cur().id;
const stepTo = (dir) => {
  const q = seq(); const c = cur(); const kind = c.n === 'offDetail' ? 'off' : 'asg';
  let i = q.findIndex((x) => x.k === kind && x.id === c.id); if (i < 0) return;
  // from a multi-day Time Off, step past all of its days
  let j = i + dir; while (j >= 0 && j < q.length && kind === 'off' && q[j].k === 'off' && q[j].id === c.id) j += dir;
  const t = q[j]; if (!t) return; const st = S.stacks[S.tab]; st[st.length - 1] = t.k === 'asg' ? { n: 'assignment', id: t.id } : { n: 'offDetail', id: t.id }; S.detailSeg = 'Details'; render();
};
const finishUpload = (a) => { a.photos = 'done'; a.upFailed = false; S.upload = null; if (a.ts) a.step = 'done'; if (S.notif.on && S.notif.types.photos) flash('Photos uploaded', a.org + ' is ready.'); else render(); };
const ACT = {
  // sign in
  toInvite: () => authPush('invite'), toSignin: () => { S.signingIn = true; authPush('signin'); },
  authBack: () => { S.auth.pop(); if (S.auth.length === 1) S.signingIn = false; render(); },
  checkInvite: () => { if ((F.invite || '').trim().toUpperCase() === INVITE) { F.inviteErr = false; F.acName = F.acName ?? 'Jordan Ellis'; F.acEmail = F.acEmail ?? 'jordan.ellis@example.com'; F.acPhone = F.acPhone ?? '(312) 555-0148'; authPush('createAccount'); } else { F.inviteErr = true; render(); } },
  toPassword: () => { S.profile.name = F.acName; S.profile.email = F.acEmail; S.profile.phone = F.acPhone; authPush('password'); },
  toMfa: () => authPush('mfa'), toCode: () => { F.code = ''; authPush('code'); setTimeout(() => document.querySelector('[data-bind="c0"]')?.focus(), 50); },
  resend: () => flash('Code sent', 'A new code is on its way.'),
  signinNext: () => { S.profile.email = F.siEmail; authPush('mfa'); },
  verify: () => { if (S.signingIn) { S.authed = true; S.tab = 'Schedule'; render(); afterEnter(); } else authPush('notifprime'); },
  askNotif: () => open('iosPerm'), skipNotif: () => { S.notif.on = false; S.overlay = null; authPush('allset'); },
  permAllow: () => { S.notif.on = true; S.notif.denied = false; S.overlay = null; authPush('allset'); },
  permDeny: () => { S.notif.on = false; S.notif.denied = true; S.overlay = null; authPush('allset'); },
  enter: () => { S.authed = true; S.tab = 'Schedule'; S.overlay = null; render(); afterEnter(); },
  // shell
  back: () => { const st = S.stacks[S.tab]; if (st.length > 1) st.pop(); S.detailSeg = 'Details'; render(); },
  tab: (t) => { if (S.tab === t) { S.stacks[t].length = 1; } S.tab = t; S.overlay = null; render(); },
  close: () => closeOverlay(), toast: () => { const t = S.toast; S.toast = null; if (t && t.act !== 'none') { S.tab = 'Schedule'; S.stacks.Schedule = [{ n: 'schedule' }]; S.schedSeg = 'Upcoming'; } render(); },
  schedSeg: (v) => { S.schedSeg = v; render(); }, tsSeg: (v) => { S.tsSeg = v; render(); }, detailSeg: (v) => { S.detailSeg = v; render(); }, toPart: (v) => { F.toPart = v; render(); },
  prevAsg: () => stepTo(-1), nextAsg: () => stepTo(1),
  openAsg: (id) => { S.tab = 'Schedule'; S.detailSeg = 'Details'; S.stacks.Schedule = [{ n: 'schedule' }, { n: 'assignment', id }]; S.overlay = null; render(); },
  openOff: (id) => push('offDetail', { id }), openTs: (id) => push('tsEntry', { id }),
  // journey
  startTravel: () => { F.startAddr = S.profile.address; open('startTravel', { id: curAsgId() }); },
  doStartTravel: () => { const a = asgOf(curAsgId()); a.log = a.log || {}; a.log.travelStart = a.start - 55; a.log.startAddr = F.startAddr; a.step = 'traveling'; closeOverlay(); },
  arrived: () => { const a = asgOf(curAsgId()); const mins = 28 + (a.id.charCodeAt(1) % 9) * 2; a.log.tmp = { start: a.log.travelStart, end: a.log.travelStart + mins, mins, miles: Math.round(estMiles(a)) }; open('travelLog', { id: a.id }); },
  tlEdit: () => { const a = asgOf(curAsgId()); F.tlHrs = String(roundUp15(a.log.tmp.mins) / 60); F.tlMiles = String(a.log.tmp.miles); F.tlReason = ''; S.overlay.edit = true; render(); },
  tlSave: () => { const a = asgOf(curAsgId()); const t = a.log.tmp; t.mins = Math.round(parseFloat(F.tlHrs || '0') * 60); t.miles = Math.round(parseFloat(F.tlMiles || '0')); t.flag = true; t.reason = F.tlReason; S.overlay.edit = false; render(); },
  tlConfirm: () => { const a = asgOf(curAsgId()); const t = a.log.tmp; a.log.arrived = t.end; a.log.travelHrs = roundUp15(t.mins) / 60; a.log.miles = t.miles; if (t.flag) a.log.flag = true; a.step = 'arrived'; closeOverlay(); },
  startAsg: () => { const a = asgOf(curAsgId()); a.log.startAsg = a.start + 2; a.step = 'active'; render(); },
  endAsg: () => { const a = asgOf(curAsgId()); a.log.endAsg = a.end + 4; a.step = 'ended'; if (S.notif.on && S.notif.types.photos) setTimeout(() => { if (asgOf(a.id).photos === 'none') flash('Upload your photos', 'Photos from ' + a.org + ' are ready to upload.', 'none'); }, 12000); render(); },
  upload: () => { const a = asgOf(curAsgId()); a.photos = 'uploading'; a.upFailed = false; S.upload = { id: a.id, pct: 0 }; render(); clearInterval(S.upT); S.upT = setInterval(() => { if (!S.upload) return clearInterval(S.upT); S.upload.pct = Math.min(100, S.upload.pct + 9); if (S.upload.pct >= 100) { clearInterval(S.upT); finishUpload(a); } else render(); }, 260); },
  tsSheet: (id) => { F.toll = ''; open('tsSheet', { id: id || curAsgId() }); },
  addToll: () => { const a = asgOf(S.overlay.id); a.log = a.log || {}; (a.log.tolls = a.log.tolls || []).push(parseFloat(F.toll)); F.toll = ''; render(); },
  submitTs: (id) => { const a = asgOf(id); const d = tsData(a); a.ts = true; if (a.photos === 'done') a.step = 'done';
    S.ts.push({ id: 'n' + a.id, org: a.org, sub: `${a.type} · ${fmtShortDate(a)}`, place: a.city, date: a.date, photo: d.assign, miles: d.miles, drive: d.trav, tolls: d.tolls.reduce((t, x) => t + x, 0), status: 'Pending' }); closeOverlay(); },
  qrSheet: () => open('qr', { id: curAsgId() }), noteSheet: () => { F.noteText = ''; open('note', { id: curAsgId() }); },
  addNote: (id) => { const a = asgOf(id); (a.notes = a.notes || [{ who: PEOPLE.leadName, when: fmtShort(rel(-1)), text: 'Park behind the building. Check in at the front office and ask for the gym door key.' }]).unshift({ who: S.profile.name + ' (you)', when: 'Today', text: F.noteText.trim() }); S.detailSeg = 'Notes'; closeOverlay(); },
  report: () => open('report'), cantAttend: () => open('cantAttend'), mapPick: () => open('mapPick'),
  call: (n) => { S.overlay = null; render(); location.href = phoneLink(n); },
  openMap: (w) => { const a = asgOf(curAsgId()); const q = encodeURIComponent(a.address); window.open(w === 'apple' ? `https://maps.apple.com/?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`, '_blank', 'noopener'); closeOverlay(); },
  equip: () => { F.eqDesc = ''; F.eqType = 'Camera'; F.photoCount = 0; F.photoMB = 0; open('equip'); },
  eqType: (t) => { F.eqType = t; render(); }, eqClear: () => { F.photoCount = 0; F.photoMB = 0; render(); },
  eqPhotos: () => document.getElementById('eqFile').click(),
  sendEquip: () => open('equipSent'),
  // time off
  reqTO: () => { F.toStart = ''; F.toEnd = ''; F.toPart = 'All Day'; open('reqTO'); },
  submitTO: () => { const s = F.toStart, e = F.toEnd || s; const single = s === e; const part = single ? F.toPart || 'All Day' : 'All Day'; const hours = single ? (part === 'All Day' ? 8 : 4) : (diffDays(s, e) + 1) * 8; S.off.push({ id: 't' + (S.off.length + 1), start: s, end: e, part, hours, status: 'Pending', requested: fmtShort(TODAY) }); closeOverlay(); },
  withdrawTO: (id) => open('withdrawTO', { id }), cancelTO: (id) => open('cancelTO', { id }),
  doWithdrawTO: (id) => { const o = toOf(id); o.status = 'Cancelled'; o.decided = fmtShort(TODAY); S.overlay = null; render(); }, doCancelTO: (id) => { const o = toOf(id); o.status = 'Cancelled'; o.decided = fmtShort(TODAY); S.overlay = null; render(); },
  // timesheets
  periodSheet: () => open('periodSheet'), setPeriod: (id) => { S.period = id; S.range = null; closeOverlay(); },
  rangeSheet: () => { F.rgFrom = ''; F.rgTo = ''; open('rangeSheet'); }, applyRange: () => { S.range = { from: F.rgFrom, to: F.rgTo }; closeOverlay(); },
  payRates: () => open('payRates'), openStatement: (id) => push('statement', { id }), ytd: (id) => push('ytd', { id }),
  savePdf: () => flash('Payment statement', 'PDF saved to Files (demo).', 'none'),
  editTs: (k) => { const e = tsOf(cur().id); const c = cur(); F.et = String((c.draft && c.draft[k] != null) ? c.draft[k] : e[k]); open('editTs', { k }); },
  saveEditTs: (k) => { const c = cur(); c.draft = c.draft || {}; c.draft[k] = parseFloat(F.et); closeOverlay(); },
  saveTs: () => { const c = cur(); const e = tsOf(c.id); Object.assign(e, c.draft); c.draft = {}; flash('Changes saved', 'Sent for approval again.', 'none'); },
  // account
  editField: (k) => { F.ef = S.profile[k]; open('editField', { k }); }, saveField: (k) => { S.profile[k] = F.ef.trim(); closeOverlay(); },
  photoSheet: () => open('photoSheet'), photoDone: (m) => { S.overlay = null; flash(m, 'Your profile photo was updated.', 'none'); },
  toPw: () => { F.opw = F.npw = F.cpw = ''; push('pw'); }, updatePw: () => { const st = S.stacks[S.tab]; st[st.length - 1] = { n: 'pwDone' }; render(); }, pwDone: () => { S.stacks.Account = [{ n: 'account' }]; render(); },
  toNotif: () => push('notif'), notifMaster: () => { S.notif.on = !S.notif.on; render(); }, notifType: (k) => { S.notif.types[k] = !S.notif.types[k]; render(); },
  openSettings: () => { S.notif.denied = false; S.notif.on = true; render(); flash('Notifications on', 'Turned on in iPhone Settings (demo).', 'none'); },
  appear: (t) => { S.appearance = t; if (t === 'System default') S.demoMode = null; setMode(); render(); },
  signOut: () => open('signOutAlert'), doSignOut: () => resetApp({ signedOut: true }),
};
function afterEnter() { clearTimeout(S.bannerT); if (S.notif.on && S.notif.types.assignments) S.bannerT = setTimeout(() => { if (S.authed) flash('Schedule updated', 'Lincoln High School now starts at 7:30 AM.'); }, 3500); }
function resetApp(o = {}) {
  clearInterval(S.upT); clearTimeout(S.bannerT); clearTimeout(flash.t);
  const keep = { appearance: S.appearance, demoMode: S.demoMode };
  Object.keys(F).forEach((k) => delete F[k]);
  Object.assign(S, { authed: false, auth: ['welcome'], signingIn: false, tab: 'Schedule', stacks: { Schedule: [{ n: 'schedule' }], 'Time Off': [{ n: 'timeoff' }], Timesheets: [{ n: 'timesheets' }], Account: [{ n: 'account' }] },
    schedSeg: 'Upcoming', tsSeg: 'Open', period: 'p1', range: null, detailSeg: 'Details', notif: { on: true, denied: false, types: { assignments: true, soon: true, photos: true, approved: true, timeoff: true } },
    profile: { name: 'Jordan Ellis', title: 'Event Photographer', phone: '(312) 555-0148', email: 'jordan.ellis@example.com', address: '2418 N Lincoln Ave, Chicago, IL 60614' },
    asg: JSON.parse(JSON.stringify(ASSIGNMENTS)), off: JSON.parse(JSON.stringify(TIMEOFF)), ts: JSON.parse(JSON.stringify(TS)), overlay: null, toast: null, upload: null }, keep);
  if (o.signedOut) { S.signingIn = true; S.auth = ['welcome']; }
  setMode(); render();
}
function jump(v) {
  if (v === 'auth') return resetApp();
  if (!S.authed) { resetApp(); S.authed = true; S.signingIn = false; }
  S.overlay = null;
  const m = { schedule: () => { S.tab = 'Schedule'; S.stacks.Schedule = [{ n: 'schedule' }]; }, today: () => ACT.openAsg('a1'), lead: () => ACT.openAsg('a3'), past: () => { S.schedSeg = 'Past 5 days'; S.tab = 'Schedule'; S.stacks.Schedule = [{ n: 'schedule' }]; },
    timeoff: () => { S.tab = 'Time Off'; S.stacks['Time Off'] = [{ n: 'timeoff' }]; }, timesheets: () => { S.tab = 'Timesheets'; S.stacks.Timesheets = [{ n: 'timesheets' }]; }, account: () => { S.tab = 'Account'; S.stacks.Account = [{ n: 'account' }]; },
    notif: () => { S.tab = 'Account'; S.stacks.Account = [{ n: 'account' }, { n: 'notif' }]; } };
  (m[v] || m.schedule)(); render();
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act]'); if (!t || t.disabled) return; const act = t.dataset.act; if (!act) return;
  if (!t.closest('#phone') && !t.closest('.controls')) return; const fn = ACT[act]; if (fn) { e.preventDefault(); fn(t.dataset.arg); }
});
document.addEventListener('input', (e) => {
  const t = e.target; if (t.id === 'eqFile') return; const b = t.dataset && t.dataset.bind; if (!b) return;
  if (/^c\d$/.test(b)) { const i = +b[1]; const d = t.value.replace(/\D/g, '').slice(-1); const cur = (F.code || '').padEnd(6, ' ').split(''); cur[i] = d || ' '; F.code = cur.join('').replace(/ +$/, ''); S.focusNext = d && i < 5 ? 'c' + (i + 1) : b; render(); return; }
  F[b] = t.value; render();
});
document.addEventListener('change', (e) => { const t = e.target; if (t.id === 'eqFile') { F.photoCount = (F.photoCount || 0) + t.files.length; F.photoMB = (F.photoMB || 0) + [...t.files].reduce((s, f) => s + f.size, 0) / 1048576; render(); } });
document.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && /^c\d$/.test(e.target.dataset?.bind || '') && !e.target.value) { const i = +e.target.dataset.bind[1]; if (i > 0) { S.focusNext = 'c' + (i - 1); render(); } } });

const fitPhone = () => { const p = phone(); if (!p) return; const z = document.body.classList.contains('full') || innerWidth <= 440 ? 1 : Math.max(0.6, Math.min(1, (innerHeight - 88) / 872)); p.style.zoom = z; };
function setFull(on) {
  document.body.classList.toggle('full', on); const b = document.getElementById('full');
  b.textContent = on ? '✕ Exit full screen' : '⤢ View full screen'; b.setAttribute('aria-pressed', on); fitPhone();
  try { if (on && document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}); else if (!on && document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
}
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && document.body.classList.contains('full')) setFull(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('full')) setFull(false); });
addEventListener('resize', fitPhone);
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('full').onclick = () => setFull(!document.body.classList.contains('full'));
  document.getElementById('light').onclick = () => { S.appearance = 'System default'; S.demoMode = 'light'; setMode(); render(); };
  document.getElementById('dark').onclick = () => { S.appearance = 'System default'; S.demoMode = 'dark'; setMode(); render(); };
  document.getElementById('restart').onclick = () => resetApp();
  document.getElementById('jump').onchange = (e) => { if (e.target.value) jump(e.target.value); };
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { setMode(); render(); });
  if (location.hash === '#dark') S.demoMode = 'dark';
  setMode(); render(); fitPhone();
  if (location.hash.startsWith('#go=')) jump(location.hash.slice(4));
});
