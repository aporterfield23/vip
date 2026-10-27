/* Demo data. All names, numbers, rates and amounts are placeholders. "Today" is fixed so the demo always opens on the same day. */
const TODAY = '2026-10-08';
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const WDL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const dt = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (s, n) => { const d = dt(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
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
  { id: 'a7', date: '2026-10-05', start: 450, end: 660, kind: 'School', type: 'School Pictures', org: 'Elk Grove High School', city: 'Elk Grove Village, IL', address: '500 W Elk Grove Blvd, Elk Grove Village, IL 60007', meet: 'Main Entrance', lead: false, step: 'done', photos: 'done', ts: true, schedule: [['8:00 AM', 'Freshmen', '120 students']] },
  { id: 'a6', date: '2026-10-06', start: 480, end: 720, kind: 'School', type: 'School Pictures', org: 'St. Ignatius College Prep', city: 'Chicago, IL', address: '1076 W Roosevelt Rd, Chicago, IL 60608', meet: 'Gym Lobby', lead: false, step: 'ended', photos: 'done', ts: false, schedule: [['8:00 AM', 'Seniors', '210 students']] },
  { id: 'a5', date: '2026-10-07', start: 480, end: 690, kind: 'School', type: 'School Pictures', org: 'Rich Township High School', city: 'Olympia Fields, IL', address: '20000 Governors Hwy, Olympia Fields, IL 60461', meet: 'Front Office', lead: false, step: 'ended', photos: 'none', ts: true, schedule: [['8:00 AM', 'Juniors', '180 students']] },
  { id: 'a1', date: '2026-10-08', start: 450, end: 660, kind: 'School', type: 'School Pictures', org: 'Lincoln High School', city: 'Chicago, IL', address: '1400 W Foster Ave, Chicago, IL 60640', meet: 'Main Entrance', lead: false, step: 'scheduled', photos: 'none', ts: false, schedule: [['7:30 AM', 'Freshmen', '140 students'], ['9:00 AM', 'Sophomores', '155 students']] },
  { id: 'a2', date: '2026-10-08', start: 780, end: 960, kind: 'School', type: 'School Pictures', org: 'Maple Elementary', city: 'Skokie, IL', address: '8000 Lincoln Ave, Skokie, IL 60077', meet: 'Cafeteria', lead: true, step: 'scheduled', photos: 'none', ts: false, schedule: [['1:00 PM', 'Kindergarten', '60 students'], ['2:30 PM', 'Grade 1', '72 students']] },
  { id: 'a3', date: '2026-10-09', start: 1050, end: 1200, kind: 'Sports', type: 'Sports Portraits', org: 'Saint Viator Lion’s Hockey Club', city: 'Palatine, IL', address: '1213 E Oakton St, Arlington Heights, IL 60004', meet: 'Rink Lobby', lead: true, qr: true, records: 188, step: 'scheduled', photos: 'none', ts: false, schedule: [['5:30 PM', 'Varsity', '22 athletes'], ['6:30 PM', 'Junior Varsity', '20 athletes'], ['7:15 PM', 'Squirts', '18 athletes']] },
  { id: 'a4', date: '2026-10-12', start: 480, end: 720, kind: 'School', type: 'School Pictures', org: 'Townhall Elementary', city: 'Oak Park, IL', address: '325 Lake St, Oak Park, IL 60302', meet: 'Front Office', lead: false, step: 'scheduled', photos: 'none', ts: false, schedule: [['8:00 AM', 'Grades 1–3', '150 students']] },
];
const PEOPLE = { leadName: 'Priya Raman', leadPhone: '(312) 555-0161', others: [['Marcus Lee', '(312) 555-0187']], client: ['Dana Whitfield', '(773) 555-0129'], manager: ['Chris Alvarez', '(312) 555-0102'] };

const TIMEOFF = [
  { id: 't1', start: '2026-10-15', end: '2026-10-16', part: 'All Day', hours: 16, status: 'Approved', requested: 'Oct 2', decided: 'Oct 3' },
  { id: 't2', start: '2026-10-19', end: '2026-10-19', part: 'Afternoon', hours: 4, status: 'Pending', requested: 'Oct 7' },
  { id: 't3', start: '2026-10-12', end: '2026-10-12', part: 'All Day', hours: 8, status: 'Denied', requested: 'Oct 1', decided: 'Oct 2' },
  { id: 't4', start: '2026-10-13', end: '2026-10-14', part: 'All Day', hours: 16, status: 'Cancelled', requested: 'Sep 29', decided: 'Oct 6' },
];

// Timesheet entries. period: pay period start of the week (Mon-based demo periods run Sep 28 – Oct 4)
const TS = [
  { id: 's1', org: 'Saint Viator Lion’s Hockey Club', sub: 'School Sports · Thu, Oct 8', place: 'Palatine, IL', date: '2026-10-08', photo: 4.0, miles: 37, drive: 0.75, tolls: 0, status: 'Pending' },
  { id: 's2', org: 'Maple Elementary', sub: 'School Pictures · Wed, Oct 7', place: 'Skokie, IL', date: '2026-10-07', photo: 6.5, miles: 22, drive: 0.5, tolls: 0, status: 'Approved', approved: 'Oct 9' },
  { id: 's3', org: 'Lincoln High School', sub: 'School Pictures · Tue, Oct 6', place: 'Chicago, IL', date: '2026-10-06', photo: 5.25, miles: 18, drive: 0.5, tolls: 0, status: 'Approved', approved: 'Oct 9' },
  { id: 's4', org: 'Elk Grove High School', sub: 'School Pictures · Fri, Oct 2', place: 'Elk Grove Village, IL', date: '2026-10-02', photo: 10.25, miles: 40, drive: 1.25, tolls: 4.8, status: 'Paid', paid: '2026-10-07' },
  { id: 's5', org: 'St. Ignatius College Prep', sub: 'School Sports · Thu, Oct 1', place: 'Chicago, IL', date: '2026-10-01', photo: 3.25, miles: 14, drive: 0.75, tolls: 0, status: 'Paid', paid: '2026-10-07' },
  { id: 's6', org: 'Townhall Elementary', sub: 'School Pictures · Wed, Sep 30', place: 'Oak Park, IL', date: '2026-09-30', photo: 5.0, miles: 16, drive: 0.5, tolls: 0, status: 'Paid', paid: '2026-10-07' },
  { id: 's7', org: 'Rich Township High School', sub: 'School Pictures · Tue, Sep 29', place: 'Olympia Fields, IL', date: '2026-09-29', photo: 6.0, miles: 31, drive: 1.0, tolls: 2.4, status: 'Paid', paid: '2026-10-07' },
  { id: 's8', org: 'Lincoln High School', sub: 'School Pictures · Fri, Sep 25', place: 'Chicago, IL', date: '2026-09-25', photo: 7.0, miles: 18, drive: 0.5, tolls: 0, status: 'Paid', paid: '2026-09-30' },
  { id: 's9', org: 'Maple Elementary', sub: 'School Pictures · Wed, Sep 23', place: 'Skokie, IL', date: '2026-09-23', photo: 6.5, miles: 22, drive: 0.5, tolls: 0, status: 'Paid', paid: '2026-09-30' },
  { id: 's10', org: 'Elk Grove High School', sub: 'School Sports · Thu, Sep 17', place: 'Elk Grove Village, IL', date: '2026-09-17', photo: 4.0, miles: 40, drive: 1.25, tolls: 4.8, status: 'Paid', paid: '2026-09-23' },
  { id: 's11', org: 'Townhall Elementary', sub: 'School Pictures · Tue, Sep 8', place: 'Oak Park, IL', date: '2026-09-08', photo: 5.5, miles: 16, drive: 0.5, tolls: 0, status: 'Paid', paid: '2026-09-16' },
  { id: 's12', org: 'Rich Township High School', sub: 'School Pictures · Fri, Aug 21', place: 'Olympia Fields, IL', date: '2026-08-21', photo: 6.0, miles: 31, drive: 1.0, tolls: 2.4, status: 'Paid', paid: '2026-08-26' },
];
const PERIODS = [
  { id: 'p1', label: 'Sep 28 – Oct 4', from: '2026-09-28', to: '2026-10-04', paid: '2026-10-07' },
  { id: 'p2', label: 'Sep 21 – Sep 27', from: '2026-09-21', to: '2026-09-27', paid: '2026-09-30' },
  { id: 'p3', label: 'Sep 14 – Sep 20', from: '2026-09-14', to: '2026-09-20', paid: '2026-09-23' },
  { id: 'month', label: 'Last month', from: '2026-09-01', to: '2026-09-30' },
  { id: 'ytd', label: 'Year to date', from: '2026-01-01', to: '2026-10-08' },
];
const earn = (e) => ({ photo: e.photo * RATES.photo, drive: e.drive * RATES.drive, miles: e.miles * RATES.mile, tolls: e.tolls });
const total = (e) => { const x = earn(e); return x.photo + x.drive + x.miles + x.tolls; };
const INVITE = 'VIP-4829-KQ';
