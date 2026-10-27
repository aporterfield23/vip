/* Timesheets, Account, Notifications */
const periodObj = () => PERIODS.find((p) => p.id === S.period);
const rangeLabel = () => (S.range ? fmtRange(S.range.from, S.range.to) : periodObj().label);
const periodEntries = () => { const r = S.range || periodObj(); return S.ts.filter((e) => e.status === 'Paid' && e.date >= r.from && e.date <= r.to); };
const entryCard = (e, pen) => `<button class="entry" data-act="openTs" data-arg="${e.id}"><div class="top"><div><div class="t-head">${esc(e.org)}</div><div class="t-sub sec">${esc(e.sub.split(' · ')[0])} · ${esc(e.place)}</div><div class="t-sub sec">${hrs(e.photo + e.drive)} · ${e.miles} mi</div></div>${pen ? I.pen : I.chev}</div><div class="chips">${statusChip(e.status)}${e.status === 'Paid' ? `<span class="t-foot sec">Paid ${fmtShort(e.paid)}</span>` : ''}</div></button>`;
const groupByDate = (es) => { const ds = [...new Set(es.map((e) => e.date))].sort().reverse(); return ds.map((d) => `<div class="day">${fmtDay(d)}${d === TODAY ? ' · Today' : ''}</div>` + es.filter((e) => e.date === d).map((e) => entryCard(e, e.status === 'Pending')).join('')).join(''); };

SCREENS.timesheets = () => {
  const s = S.tsSeg; let es, note, extra = '';
  if (s === 'Open') { es = S.ts.filter((e) => e.status === 'Pending'); note = 'You can change a timesheet until it is paid.'; }
  else if (s === 'Approved') { es = S.ts.filter((e) => e.status === 'Approved'); note = 'Approved timesheets are locked until they are paid.'; }
  else {
    es = periodEntries(); note = 'Approved and paid timesheets can’t be changed.';
    const single = !S.range && ['p1', 'p2', 'p3'].includes(S.period); const pr = periodObj();
    if (single) extra = card(`<button class="row" data-act="openStatement" data-arg="${pr.id}">${docTile}<span class="grow"><span class="ttl" style="display:block">Payment statement · ${fmtShort(pr.paid)}</span><span class="sub" style="display:block">${pr.label} · PDF</span></span>${ICON_PDF}</button>`) + '<div style="height:4px"></div>';
    if (S.period === 'ytd' && !S.range) extra = card(row({ title: 'Year to date summary', sub: `${es.length} paid entries`, trail: I.chev, act: 'ytd' }));
  }
  const filters = s === 'Paid' ? `<div class="filters"><button class="btn bordered small" data-act="periodSheet">${esc(rangeLabel())} ⌄</button><button class="btn bordered small" data-act="payRates">Pay rates</button></div>` : `<div class="filters"><button class="btn bordered small" data-act="payRates">Pay rates</button></div>`;
  return `${toolbar({})}<div class="largetitle t-large">Timesheets</div>${seg('tsSeg', ['Open', 'Approved', 'Paid'], S.tsSeg)}<p class="t-sub sec" style="margin:6px 16px 10px">${note}</p>${filters}
  <div class="page" style="padding-top:8px">${extra}${es.length ? groupByDate(es) : '<div class="empty">No timesheets here yet</div>'}</div>`;
};
SCREENS.tsEntry = (c) => {
  const e = tsOf(c.id); const edit = e.status === 'Pending'; const draft = c.draft || {};
  const v = (k) => (draft[k] != null ? draft[k] : e[k]);
  const rows = [['photo', 'Photography time', hrs(v('photo'))], ['miles', 'Driving miles', v('miles') + ' mi'], ['drive', 'Driving time', hrs(v('drive'))], ['tolls', 'Tolls', money(+v('tolls'))]];
  const titles = { Pending: 'Open entry', Approved: 'Approved entry', Paid: 'Paid entry' };
  const sub = { Pending: 'Pending approval', Approved: 'Approved ' + (e.approved || ''), Paid: 'Paid ' + fmtShort(e.paid || TODAY) }[e.status];
  const changed = Object.keys(draft).length > 0;
  const stmt = e.status === 'Paid' ? (() => { const p = PERIODS.find((p) => p.paid === e.paid && e.date >= p.from && e.date <= p.to); return p ? '<div style="height:12px"></div>' + card(`<button class="row" data-act="openStatement" data-arg="${p.id}">${docTile}<span class="grow"><span class="ttl" style="display:block">In payment statement · ${fmtShort(p.paid)}</span><span class="sub" style="display:block">${p.label} · PDF</span></span>${ICON_PDF}</button>`) : ''; })() : '';
  return `${toolbar({ back: true, title: titles[e.status], sub })}<div class="page" style="padding-top:12px">
  ${card(row({ title: esc(e.org), sub: esc(e.sub) }), ...rows.map(([k, l, val]) => row({ title: val, sub: l, trail: edit ? I.pen : '', act: edit ? 'editTs' : '', arg: edit ? k : '' })))}
  <p class="note">${edit ? 'Tap a value to edit it. Changes are sent for approval again.' : e.status === 'Approved' ? 'Approved entries are locked. Contact your scheduler to request a change.' : 'Paid entries can’t be changed.'}</p>${stmt}</div>
  ${edit ? `<div class="footer" style="position:sticky;bottom:96px">${btn('Save changes', { act: 'saveTs', disabled: !changed })}</div>` : ''}`;
};
SCREENS.statement = (c) => {
  const p = PERIODS.find((x) => x.id === c.id); const es = S.ts.filter((e) => e.status === 'Paid' && e.date >= p.from && e.date <= p.to);
  const sum = (f) => es.reduce((t, e) => t + f(e), 0);
  const lines = [['Photography time', sum((e) => earn(e).photo)], ['Driving time', sum((e) => earn(e).drive)], ['Mileage', sum((e) => earn(e).miles)], ['Tolls', sum((e) => e.tolls)]];
  return `${toolbar({ back: true, title: 'Payment statement', sub: p.label })}<div class="pdf" role="document"><h3>VIP</h3><div>Payment statement · paid ${fmtShort(p.paid)}</div><div>${esc(S.profile.name)} · ${p.label}</div>
  <table>${es.map((e) => `<tr><td>${fmtShort(e.date)} · ${esc(e.org)}</td><td>${money(total(e))}</td></tr>`).join('')}</table>
  <table><tr><td colspan="2" style="font-weight:700;border-bottom:1px solid #999">Summary</td></tr>${lines.map(([k, v]) => `<tr><td>${k}</td><td>${money(v)}</td></tr>`).join('')}<tr class="tot"><td>Total</td><td>${money(lines.reduce((t, l) => t + l[1], 0))}</td></tr></table>
  <p style="color:#666;margin:12px 0 0">Placeholder rates. Amounts are for demonstration only.</p></div><div class="page">${btn('Share or save PDF', { act: 'savePdf' })}</div>`;
};
SCREENS.ytd = () => {
  const es = S.ts.filter((e) => e.status === 'Paid' && e.date >= '2026-01-01'); const sum = (f) => es.reduce((t, e) => t + f(e), 0);
  return `${toolbar({ back: true, title: 'Year to date', sub: 'Jan 1 – Oct 8' })}<div class="page" style="padding-top:12px">${card(row({ title: String(es.length), sub: 'Paid entries' }), row({ title: hrs(sum((e) => e.photo)), sub: 'Photography time' }), row({ title: hrs(sum((e) => e.drive)), sub: 'Driving time' }), row({ title: sum((e) => e.miles) + ' mi', sub: 'Driving miles' }), row({ title: money(sum((e) => e.tolls)), sub: 'Tolls' }), row({ title: money(sum(total)), sub: 'Total paid' }))}<p class="note">Totals include paid entries only. Rates are placeholders.</p></div>`;
};

/* Account */
const initials = () => S.profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2);
SCREENS.account = () => {
  const p = S.profile; const pr = [['name', p.name, 'Name'], ['title', p.title, 'Job title'], ['phone', p.phone, 'Phone number'], ['email', p.email, 'Email'], ['address', p.address, 'Address']];
  return `${toolbar({})}<div class="largetitle t-large">Account</div><div class="page" style="padding-top:0">
  <div class="sectionhead" style="margin-top:4px">Profile</div>${card(...pr.map(([k, v, l]) => row({ title: esc(v), sub: l, trail: I.pen, act: 'editField', arg: k })))}
  <div class="sectionhead">Profile Image</div>${card(`<div class="row" style="align-items:center"><span style="width:72px;height:72px;border-radius:36px;background:color-mix(in srgb,var(--color-text-primary) 8%,transparent);display:grid;place-items:center;font:700 24px var(--font-family-display);flex:none">${initials()}</span><span class="grow"><span class="t-sub sec" style="display:block;font-weight:600;margin-bottom:8px">Shown to your schedulers and team</span><button class="btn bordered small" data-act="photoSheet">Update photo</button></span></div>`)}
  <div class="sectionhead">Password</div>${card(row({ title: '••••••••••', sub: 'Password', trail: I.pen, act: 'toPw' }))}
  <div class="sectionhead">Notifications</div>${card(row({ title: 'Alerts and reminders', sub: S.notif.denied ? 'Off in iPhone Settings' : S.notif.on ? 'Notification settings' : 'Off', trail: I.chev, act: 'toNotif' }))}
  <div class="sectionhead">Appearance</div>${card(...[['System default', 'Match your iPhone setting'], ['Light', 'Always use light'], ['Dark', 'Always use dark']].map(([t, s]) => row({ title: t, sub: s, trail: S.appearance === t ? I.check : '', act: 'appear', arg: t })))}
  <div style="height:16px"></div>${card(`<button class="row" data-act="signOut"><span class="ttl danger">Sign out</span></button>`)}</div>`;
};
SCREENS.pw = () => { const ok = pwChecks(F.npw || '').every((c) => c[0]) && F.npw === F.cpw && F.opw; return `${toolbar({ back: true, title: 'Change password' })}<div class="page" style="padding-top:12px"><h1 class="t-title1" style="margin-bottom:6px">Change password</h1><p class="t-body sec" style="margin:0 0 18px">Choose a new password you don’t use anywhere else.</p>${field('opw', 'Current password', { type: 'password' })}${field('npw', 'New password', { type: 'password' })}${field('cpw', 'Confirm new password', { type: 'password', err: F.cpw && F.cpw !== F.npw ? 'Passwords don’t match.' : '' })}${pwList(F.npw || '')}</div>
  <div class="footer" style="position:sticky;bottom:96px">${btn('Update password', { act: 'updatePw', disabled: !ok })}</div>`; };
SCREENS.pwDone = () => `<div class="hero" style="padding-top:48px"><div class="iconTile">${I.tick}</div><h1 class="t-title1">Password updated</h1><p class="t-body sec" style="margin:8px 0 24px">You’ve been signed out on your other devices. Use your new password next time you sign in.</p>${btn('Done', { act: 'pwDone' })}</div>`;
SCREENS.notif = () => {
  const n = S.notif; const dis = !n.on || n.denied;
  const types = [['assignments', 'New or changed assignments', 'Schedule changes and new assignments'], ['soon', 'Assignment starting soon', 'Before you need to travel'], ['photos', 'Photo upload reminders', 'After you log End Assignment'], ['approved', 'Timesheet approved', 'When time and mileage are approved'], ['timeoff', 'Time off decisions', 'Approved or denied requests']];
  return `${toolbar({ back: true, title: 'Notifications' })}<div class="page" style="padding-top:12px">
  ${n.denied ? `<div class="card" style="padding:16px;margin-bottom:16px"><div class="t-head">Notifications are off for VIP</div><p class="t-sub sec" style="margin:4px 0 12px">You won’t get schedule changes or reminders. Turn notifications on in iPhone Settings.</p><button class="btn bordered small" data-act="openSettings">Open Settings</button></div>` : ''}
  ${card(row({ title: 'Allow notifications', trail: toggle(n.on && !n.denied, 'notifMaster', '', n.denied) }))}
  <div class="sectionhead">What to notify me about</div><div class="${dis ? 'dim' : ''}">${card(...types.map(([k, t, s]) => row({ title: t, sub: s, trail: toggle(n.types[k], 'notifType', k, dis) })))}</div>
  <p class="note">${n.denied ? 'Turn notifications on in iPhone Settings to choose what you’re notified about.' : 'Notifications are sent only for your own assignments and requests. You can change this any time.'}</p></div>`;
};
