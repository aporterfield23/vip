/* Main tabs: Schedule, Assignment Details, Time Off */
const isEnded = (a) => ['ended', 'done'].includes(a.step);
const complete = (a) => isEnded(a) && a.photos === 'done' && a.ts;
const timeRange = (a) => { const s = clock(a.start), e = clock(a.end); return s.slice(0, -3) === e.slice(0, -3) || s.slice(-2) === e.slice(-2) ? s.slice(0, -3) + ' – ' + e : s + ' – ' + e; };
const chipsFor = (a) => {
  if (['traveling', 'arrived', 'active'].includes(a.step)) return chip('In progress', 'accent');
  if (!isEnded(a)) return '';
  if (a.photos === 'uploading') return chip('Uploading', 'accent');
  const c = []; if (a.photos !== 'done') c.push(chip('Upload photos', 'orange')); if (!a.ts) c.push(chip('Submit timesheet', 'orange'));
  return c.length ? c.join('') : chip('Complete', 'green');
};
const statusLabel = (a) => a.step === 'scheduled' ? 'Scheduled' : !isEnded(a) ? 'Active' : complete(a) ? 'Completed' : a.ts ? 'Processing' : a.photos === 'done' ? 'Uploaded' : 'Active';
const seq = () => {
  const items = S.asg.filter((a) => a.date >= addDays(TODAY, -5)).map((a) => ({ k: 'asg', id: a.id, date: a.date, t: a.start }));
  S.off.filter((o) => o.status === 'Approved').forEach((o) => { for (let d = o.start; d <= o.end; d = addDays(d, 1)) items.push({ k: 'off', id: o.id, date: d, t: 0 }); });
  return items.sort((x, y) => x.date.localeCompare(y.date) || x.t - y.t);
};
const asgEntry = (a) => `<button class="entry" data-act="openAsg" data-arg="${a.id}"><div class="top"><div><div class="t-head">${timeRange(a)}</div><div class="t-sub sec">${esc(a.type)}</div><div class="t-sub sec">${esc(a.org)} · ${esc(a.city.split(',')[0])}</div></div>${I.chev}</div>${chipsFor(a) ? `<div class="chips">${chipsFor(a)}</div>` : ''}</button>`;
const offEntry = (o) => `<button class="entry" data-act="openOff" data-arg="${o.id}"><div class="top"><div><div class="t-head">Time Off</div><div class="t-sub sec">${esc(o.part)}</div></div>${I.chev}</div><div class="chips">${chip('Approved', 'green')}</div></button>`;

SCREENS.schedule = () => {
  const past = S.asg.some((a) => a.date < TODAY && isEnded(a) && !complete(a));
  let list = '';
  if (S.schedSeg === 'Upcoming') {
    const days = []; for (let i = 0; i < 14; i++) days.push(addDays(TODAY, i));
    let any = false;
    days.forEach((d, i) => {
      const as = S.asg.filter((a) => a.date === d).sort((x, y) => x.start - y.start);
      const offs = S.off.filter((o) => o.status === 'Approved' && o.start <= d && d <= o.end);
      if (!as.length && !offs.length && i > 0) return; any = true;
      list += `<div class="day">${fmtLong(d)}${d === TODAY ? ' · Today' : ''}</div>` + (as.map(asgEntry).join('') + offs.map(offEntry).join('') || '<div class="empty" style="padding:16px">No assignments</div>');
    });
    if (!any) list = '<div class="empty">Nothing scheduled</div>';
  } else {
    for (let i = 1; i <= 5; i++) {
      const d = addDays(TODAY, -i); const as = S.asg.filter((a) => a.date === d);
      list += `<div class="day">${fmtLong(d)}</div>` + (as.map(asgEntry).join('') || '<div class="empty" style="padding:16px">No assignments</div>');
    }
  }
  return `${toolbar({})}<div class="largetitle t-large">Schedule</div>${seg('schedSeg', ['Upcoming', 'Past 5 days'], S.schedSeg, '', past ? 'Past 5 days' : null)}<div class="page">${list}</div>`;
};

function actionsFor(a) {
  const sec = [], todayDay = a.date === TODAY; let primary = null;
  const cant = { label: 'Can’t attend', act: 'cantAttend' }, rep = { label: 'Report issue', act: 'report' }, tsb = { label: 'Timesheet', act: 'tsSheet', arg: a.id };
  const note = a.lead ? { label: 'Add note', act: 'noteSheet' } : null, qr = a.qr ? { label: 'QR code', act: 'qrSheet' } : null;
  if (a.step === 'scheduled') { if (todayDay) primary = { label: 'Start Travel', act: 'startTravel' }; sec.push(cant, rep, note, qr); }
  else if (a.step === 'traveling') { primary = { label: 'Arrived', act: 'arrived' }; sec.push(cant, rep, tsb, note, qr); }
  else if (a.step === 'arrived') { primary = { label: 'Start Assignment', act: 'startAsg' }; sec.push(cant, rep, tsb, note, qr); }
  else if (a.step === 'active') { primary = { label: 'End Assignment', act: 'endAsg' }; sec.push(rep, tsb, note, qr); }
  else if (isEnded(a)) {
    if (a.photos === 'uploading') { primary = { label: 'Uploading photos…', act: '', disabled: true }; if (!a.ts) sec.push(tsb); }
    else if (a.photos !== 'done') { primary = { label: a.upFailed ? 'Upload again' : 'Upload Photos', act: 'upload' }; sec.push({ ...tsb, label: a.ts ? 'Timesheet (view)' : 'Timesheet' }); }
    else if (!a.ts) primary = { label: 'Submit Timesheet', act: 'tsSheet', arg: a.id };
    sec.push(note, qr);
  }
  return { primary, sec: sec.filter(Boolean) };
}
function qrSvg(seed) {
  const n = 25; let s = 0; for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0; const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  let r = ''; const fin = (x, y) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { if (fin(x, y)) continue; if (rnd() > 0.52) r += `<rect x="${x}" y="${y}" width="1" height="1"/>`; }
  const f = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  return `<svg viewBox="0 0 ${n} ${n}" width="100%" height="100%" role="img" aria-label="Assignment QR code" shape-rendering="crispEdges">${r}${f(0, 0)}${f(n - 7, 0)}${f(0, n - 7)}</svg>`;
}
SCREENS.assignment = (c) => {
  const a = asgOf(c.id); const q = seq(); const i = q.findIndex((x) => x.k === 'asg' && x.id === a.id);
  const { primary, sec } = actionsFor(a);
  const detailRows = () => {
    const tel = (n, p) => row({ title: esc(n), sub: 'Phone', trail: `<a class="link" href="tel:${p.replace(/\D/g, '')}" style="text-decoration:none">${p}</a>` });
    let h = '';
    if (a.qr) h += `<div class="sectionhead" style="margin-top:6px">QR code</div>` + card(`<button class="row" data-act="qrSheet"><span style="width:56px;height:56px;background:#fff;border-radius:8px;padding:4px;flex:none">${S.qrFail ? '' : qrSvg(a.id)}</span><span class="grow"><span class="ttl" style="display:block">Assignment QR code</span><span class="sub" style="display:block">Tap to enlarge and scan with the tablet</span></span></button>`);
    h += `<div class="sectionhead">When and where</div>` + card(row({ title: esc(a.org), sub: 'Client' }), row({ title: fmtLong(a.date), sub: 'Date' }), row({ title: timeRange(a), sub: 'Times' }),
      row({ title: esc(a.address), sub: 'Location', trail: I.chev, act: 'mapPick' }), row({ title: a.meet, sub: 'Meeting location' }));
    h += `<div class="sectionhead">Team</div>` + card(tel(PEOPLE.leadName, PEOPLE.leadPhone).replace('Phone', 'Lead photographer'), ...PEOPLE.others.map(([n, p]) => tel(n, p).replace('Phone', 'Photographer')));
    h += `<div class="sectionhead">Contacts</div>` + card(tel(PEOPLE.client[0], PEOPLE.client[1]).replace('Phone', 'Client contact'), tel(PEOPLE.manager[0], PEOPLE.manager[1]).replace('Phone', 'Account manager'));
    const L = a.log || {}; const logs = [];
    if (L.travelStart != null) logs.push(['Start Travel', clock(L.travelStart)]); if (L.arrived != null) logs.push(['Arrived', clock(L.arrived)]);
    if (L.startAsg != null) logs.push(['Start Assignment', clock(L.startAsg)]); if (L.endAsg != null) logs.push(['End Assignment', clock(L.endAsg)]);
    if (logs.length) h += `<div class="sectionhead">Logged times</div>` + card(...logs.map(([k, v]) => row({ title: k, trail: v })));
    return h;
  };
  const notes = () => `<div class="sectionhead" style="margin-top:6px">Notes</div>` + ((a.notes || [{ who: PEOPLE.leadName, when: 'Oct 7', text: 'Park behind the building. Check in at the front office and ask for the gym door key.' }]).map((n) => card(row({ title: esc(n.text), sub: `${esc(n.who)} · ${esc(n.when)}` })) + '<div style="height:8px"></div>').join('')) + (a.lead ? '' : '<p class="note">Only lead photographers can add notes.</p>');
  const sched = () => `<div class="sectionhead" style="margin-top:6px">Shoot schedule</div>` + card(...a.schedule.map(([t, team, n]) => row({ title: `${t} · ${esc(team)}`, sub: esc(n) })));
  const body = S.detailSeg === 'Details' ? detailRows() : S.detailSeg === 'Notes' ? notes() : sched();
  const failNote = a.upFailed ? `<p class="note" style="color:var(--color-destructive)">Upload didn’t finish. Check your connection and try again. Your timesheet isn’t affected.</p>` : '';
  const remind = isEnded(a) && a.photos !== 'done' && a.photos !== 'uploading' ? '<p class="note">Reminder: upload your photos within 5 days of the assignment.</p>' : '';
  return `${toolbar({ back: true, title: a.org, sub: fmtShortDate(a) + ' · ' + timeRange(a), trail: pair('prevAsg', 'nextAsg', i <= 0, i >= q.length - 1) })}
  <div class="page"><div style="display:flex;gap:8px;align-items:center;margin:8px 0 12px;flex-wrap:wrap">${chip(a.kind, '')}${chip(statusLabel(a), statusLabel(a) === 'Completed' ? 'green' : 'accent')}</div>
  ${primary ? btn(primary.label, { act: primary.act, arg: primary.arg, disabled: primary.disabled }) : ''}
  ${a.photos === 'uploading' ? `<div class="progress"><i style="width:${S.upload ? S.upload.pct : 0}%"></i></div>` : ''}${failNote}${remind}
  ${sec.length ? `<div class="pillrow" style="margin-top:14px">${sec.map((s) => `<button data-act="${s.act}" data-arg="${s.arg || ''}">${s.label}</button>`).join('')}</div>` : ''}</div>
  ${seg('detailSeg', ['Details', 'Notes', 'Schedule'], S.detailSeg)}<div class="page">${body}</div>`;
};
const fmtShortDate = (a) => WD[dt(a.date).getUTCDay()] + ', ' + fmtShort(a.date);

/* Time Off */
SCREENS.timeoff = () => {
  const groups = ['Pending', 'Approved', 'Denied', 'Cancelled'];
  const list = groups.map((g) => { const es = S.off.filter((o) => o.status === g); if (!es.length) return ''; return `<div class="day">${g}</div>` + es.sort((x, y) => x.start.localeCompare(y.start)).map((o) => `<button class="entry" data-act="openOff" data-arg="${o.id}"><div class="top"><div><div class="t-head">${fmtRange(o.start, o.end)}</div><div class="t-sub sec">${o.hours} hours · ${o.part}</div><div class="t-foot sec">${o.status === 'Pending' ? 'Requested ' + o.requested : o.status + ' ' + (o.decided || '')}</div></div>${I.chev}</div><div class="chips">${statusChip(o.status)}</div></button>`).join(''); }).join('');
  return `${toolbar({})}<div class="largetitle t-large">Time Off</div><div class="page" style="padding-top:8px">${btn('Request Time Off', { act: 'reqTO' })}${list}</div>`;
};
SCREENS.offDetail = (c) => {
  const o = toOf(c.id); const q = seq().filter((x) => x.k === 'off' || x.k === 'asg'); const idx = q.findIndex((x) => x.k === 'off' && x.id === o.id);
  const trail = o.status === 'Approved' ? pair('prevAsg', 'nextAsg', false, false) : '';
  const canCancel = o.status === 'Approved' && diffDays(TODAY, o.start) >= 1;
  return `${toolbar({ back: true, title: 'Time Off', sub: fmtRange(o.start, o.end), trail })}<div class="page"><div style="display:flex;gap:8px;margin:8px 0 14px">${chip('Time Off')}${statusChip(o.status)}</div>
  ${card(row({ title: fmtRange(o.start, o.end), sub: 'Date' }), row({ title: o.part, sub: 'Time of day' }), row({ title: o.hours + ' hours', sub: 'Total time off' }), row({ title: o.requested, sub: 'Requested' }), o.decided ? row({ title: o.decided, sub: o.status === 'Approved' ? 'Approved' : o.status }) : '')}
  <p class="note">${o.status === 'Approved' ? 'Approved by your scheduler. You can cancel until the day before. Your scheduler will be notified.' : o.status === 'Pending' ? 'Your scheduler will approve or deny this request.' : o.status === 'Denied' ? 'Your scheduler denied this request. You may still be scheduled on these dates.' : 'This request was cancelled.'}</p>
  <div style="margin-top:20px">${o.status === 'Pending' ? btn('Withdraw request', { kind: 'destructive', act: 'withdrawTO', arg: o.id }) : ''}${canCancel ? btn('Cancel Time Off', { kind: 'destructive', act: 'cancelTO', arg: o.id }) : ''}</div></div>`;
};
