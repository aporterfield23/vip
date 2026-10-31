/* Demo data. All names, numbers, rates and amounts are placeholders. "Today" is fixed so the demo always opens on the same day. */
const _n = new Date();
const TODAY = _n.getFullYear() + '-' + String(_n.getMonth() + 1).padStart(2, '0') + '-' + String(_n.getDate()).padStart(2, '0'); // device date; every other date is relative to it
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const WDL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const dt = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (s, n) => { const d = dt(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
const rel = (n) => addDays(TODAY, n);
const fmtShort = (s) => { const d = dt(s); return MON[d.getUTCMonth()] + ' ' + d.getUTCDate(); };
const fmtDay = (s) => { const d = dt(s); return WD[d.getUTCDay()] + ' ' + fmtShort(s); };
const fmtLong = (s) => { const d = dt(s); return WDL[d.getUTCDay()] + ', ' + fmtShort(s); };
const fmtRange = (a, b) => a === b ? fmtShort(a) : fmtShort(a) + ' – ' + fmtShort(b);
const diffDays = (a, b) => Math.round((dt(b) - dt(a)) / 864e5);
const money = (n) => '$' + n.toFixed(2);
const hrs = (n) => (Math.round(n * 100) / 100).toString().replace(/(\.\d)$/, '$10') + ' h';
const clock = (m) => { m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m / 60), mm = m % 60; return ((h + 11) % 12 + 1) + ':' + String(mm).padStart(2, '0') + ' ' + (h < 12 ? 'AM' : 'PM'); };

const RATES = { photo: 28, drive: 18, mile: 0.67 }; // placeholders until Finance confirms

const ASSIGNMENTS = [
  { id: 'a7', date: rel(-3), start: 450, end: 660, kind: 'School', type: 'School Pictures', org: 'Elk Grove High School', city: 'Elk Grove Village, IL', address: '500 W Elk Grove Blvd, Elk Grove Village, IL 60007', meet: 'Main Entrance', lead: false, step: 'done', photos: 'done', ts: true, schedule: [['8:00 AM', 'Freshmen', '120 students']] },
  { id: 'a6', date: rel(-2), start: 480, end: 720, kind: 'School', type: 'School Pictures', org: 'St. Ignatius College Prep', city: 'Chicago, IL', address: '1076 W Roosevelt Rd, Chicago, IL 60608', meet: 'Gym Lobby', lead: false, step: 'ended', photos: 'done', ts: false, schedule: [['8:00 AM', 'Seniors', '210 students']] },
  { id: 'a5', date: rel(-1), start: 480, end: 690, kind: 'School', type: 'School Pictures', org: 'Rich Township High School', city: 'Olympia Fields, IL', address: '20000 Governors Hwy, Olympia Fields, IL 60461', meet: 'Front Office', lead: false, step: 'ended', photos: 'none', ts: true, schedule: [['8:00 AM', 'Juniors', '180 students']] },
  { id: 'a1', date: rel(0), start: 450, end: 660, kind: 'School', type: 'School Pictures', org: 'Lincoln High School', city: 'Chicago, IL', address: '1400 W Foster Ave, Chicago, IL 60640', meet: 'Main Entrance', lead: false, step: 'scheduled', photos: 'none', ts: false, schedule: [['7:30 AM', 'Freshmen', '140 students'], ['9:00 AM', 'Sophomores', '155 students']] },
  { id: 'a2', date: rel(0), start: 780, end: 960, kind: 'School', type: 'School Pictures', org: 'Maple Elementary', city: 'Skokie, IL', address: '8000 Lincoln Ave, Skokie, IL 60077', meet: 'Cafeteria', lead: true, step: 'scheduled', photos: 'none', ts: false, schedule: [['1:00 PM', 'Kindergarten', '60 students'], ['2:30 PM', 'Grade 1', '72 students']] },
  { id: 'a3', date: rel(1), start: 1050, end: 1200, kind: 'Sports', type: 'Sports Portraits', org: 'Saint Viator Lion’s Hockey Club', city: 'Palatine, IL', address: '1213 E Oakton St, Arlington Heights, IL 60004', meet: 'Rink Lobby', lead: true, qr: true, records: 188, step: 'scheduled', photos: 'none', ts: false, schedule: [['5:30 PM', 'Varsity', '22 athletes'], ['6:30 PM', 'Junior Varsity', '20 athletes'], ['7:15 PM', 'Squirts', '18 athletes']] },
  { id: 'a4', date: rel(4), start: 480, end: 720, kind: 'School', type: 'School Pictures', org: 'Townhall Elementary', city: 'Oak Park, IL', address: '325 Lake St, Oak Park, IL 60302', meet: 'Front Office', lead: false, step: 'scheduled', photos: 'none', ts: false, schedule: [['8:00 AM', 'Grades 1–3', '150 students']] },
];
const PEOPLE = { leadName: 'Priya Raman', leadPhone: '(312) 555-0161', others: [['Marcus Lee', '(312) 555-0187']], client: ['Dana Whitfield', '(773) 555-0129'], manager: ['Chris Alvarez', '(312) 555-0102'] };

const TIMEOFF = [
  { id: 't1', start: rel(7), end: rel(8), part: 'All Day', hours: 16, status: 'Approved', requested: fmtShort(rel(-6)), decided: fmtShort(rel(-5)) },
  { id: 't2', start: rel(11), end: rel(11), part: 'Afternoon', hours: 4, status: 'Pending', requested: fmtShort(rel(-1)) },
  { id: 't3', start: rel(4), end: rel(4), part: 'All Day', hours: 8, status: 'Denied', requested: fmtShort(rel(-7)), decided: fmtShort(rel(-6)) },
  { id: 't4', start: rel(5), end: rel(6), part: 'All Day', hours: 16, status: 'Cancelled', requested: fmtShort(rel(-9)), decided: fmtShort(rel(-2)) },
];

// Pay periods are Monday to Sunday weeks, worked out from today. Paid entries are placed by week and weekday so they always fall in the right period.
const _dow = (dt(TODAY).getUTCDay() + 6) % 7; // Monday = 0
const MONDAY = addDays(TODAY, -_dow);
const _pm = dt(TODAY); const PREV_MONTH_START = iso(new Date(Date.UTC(_pm.getUTCFullYear(), _pm.getUTCMonth() - 1, 1)));
const PREV_MONTH_END = iso(new Date(Date.UTC(_pm.getUTCFullYear(), _pm.getUTCMonth(), 0)));
const _period = (k) => { const from = addDays(MONDAY, -7 * k), to = addDays(from, 6); const paid = addDays(to, 3) > TODAY ? TODAY : addDays(to, 3); return { id: 'p' + k, label: fmtRange(from, to), name: k === 1 ? 'Current pay period' : k === 2 ? 'Previous pay period' : undefined, from, to, paid }; };
const LAST_YEAR = Number(TODAY.slice(0, 4)) - 1;
const PERIODS = [_period(1), _period(2), _period(3),
  { id: 'month', label: 'Last month', from: PREV_MONTH_START, to: PREV_MONTH_END },
  { id: 'ytd', label: 'Year to date', from: TODAY.slice(0, 4) + '-01-01', to: TODAY },
  { id: 'lastyear', label: 'Last year', from: LAST_YEAR + '-01-01', to: LAST_YEAR + '-12-31' }];
const _sub = (type, d) => type + ' · ' + WD[dt(d).getUTCDay()] + ', ' + fmtShort(d);
const _paidEntry = (id, org, type, place, period, dow, photo, miles, drive, tolls) => { const p = PERIODS[period - 1]; const date = addDays(p.from, dow); return { id, org, sub: _sub(type, date), place, date, photo, miles, drive, tolls, status: 'Paid', paid: p.paid }; };
const _openEntry = (id, org, type, place, n, status, photo, miles, drive) => { const date = rel(n); return { id, org, sub: _sub(type, date), place, date, photo, miles, drive, tolls: 0, status, approved: status === 'Approved' ? fmtShort(rel(Math.min(0, n + 2))) : undefined }; };
const TS = [
  _openEntry('s1', 'Saint Viator Lion’s Hockey Club', 'School Sports', 'Palatine, IL', 0, 'Pending', 4.0, 37, 0.75),
  _openEntry('s2', 'Maple Elementary', 'School Pictures', 'Skokie, IL', -1, 'Approved', 6.5, 22, 0.5),
  _openEntry('s3', 'Lincoln High School', 'School Pictures', 'Chicago, IL', -2, 'Approved', 5.25, 18, 0.5),
  _paidEntry('s4', 'Elk Grove High School', 'School Pictures', 'Elk Grove Village, IL', 1, 4, 10.25, 40, 1.25, 4.8),
  _paidEntry('s5', 'St. Ignatius College Prep', 'School Sports', 'Chicago, IL', 1, 3, 3.25, 14, 0.75, 0),
  _paidEntry('s6', 'Townhall Elementary', 'School Pictures', 'Oak Park, IL', 1, 2, 5.0, 16, 0.5, 0),
  _paidEntry('s7', 'Rich Township High School', 'School Pictures', 'Olympia Fields, IL', 1, 1, 6.0, 31, 1.0, 2.4),
  _paidEntry('s8', 'Lincoln High School', 'School Pictures', 'Chicago, IL', 2, 4, 7.0, 18, 0.5, 0),
  _paidEntry('s9', 'Maple Elementary', 'School Pictures', 'Skokie, IL', 2, 2, 6.5, 22, 0.5, 0),
  _paidEntry('s10', 'Elk Grove High School', 'School Sports', 'Elk Grove Village, IL', 3, 3, 4.0, 40, 1.25, 4.8),
  { id: 's11', org: 'Townhall Elementary', sub: _sub('School Pictures', addDays(PREV_MONTH_START, 8)), place: 'Oak Park, IL', date: addDays(PREV_MONTH_START, 8), photo: 5.5, miles: 16, drive: 0.5, tolls: 0, status: 'Paid', paid: addDays(PREV_MONTH_START, 15) },
  { id: 's12', org: 'Rich Township High School', sub: _sub('School Pictures', addDays(PREV_MONTH_START, -10)), place: 'Olympia Fields, IL', date: addDays(PREV_MONTH_START, -10), photo: 6.0, miles: 31, drive: 1.0, tolls: 2.4, status: 'Paid', paid: addDays(PREV_MONTH_START, -5) },
  ...[['s13', 'Elk Grove High School', 'School Pictures', 'Elk Grove Village, IL', '-03-14', 6.5, 40, 1.25, 4.8], ['s14', 'Maple Elementary', 'School Pictures', 'Skokie, IL', '-06-09', 6.0, 22, 0.5, 0], ['s15', 'Townhall Elementary', 'School Pictures', 'Oak Park, IL', '-11-04', 5.5, 16, 0.5, 0]].map(([id, org, type, place, md, photo, miles, drive, tolls]) => { const date = LAST_YEAR + md; return { id, org, sub: _sub(type, date), place, date, photo, miles, drive, tolls, status: 'Paid', paid: addDays(date, 7) }; }),
];
const earn = (e) => ({ photo: e.photo * RATES.photo, drive: e.drive * RATES.drive, miles: e.miles * RATES.mile, tolls: e.tolls });
const total = (e) => { const x = earn(e); return x.photo + x.drive + x.miles + x.tolls; };
const INVITE = 'VIP-4829-KQ';
