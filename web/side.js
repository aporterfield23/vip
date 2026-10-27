/* Left-hand section note. Titles and descriptions are the cover-screen text from the Figma prototype; the note follows the screen the demo is showing. */
const SECTIONS = {
  auth: ['Sign in & Register', 'First-time setup for an invited photographer.'],
  schedule: ['Schedule', 'Your upcoming assignments at a glance. Browse the schedule and open an assignment to see its details.'],
  details: ['Assignment Details', 'The information on an assignment, without the journey: the Details tab, Schedule, Report issue and Equipment issue.'],
  data: ['Student / Athlete Data', 'Capture who was photographed: the QR code and its sheet, QR unavailable, clients with no QR code, and the manual team log with its edit sheet and help.'],
  start: ['Start Assignment', 'Get to the assignment: scheduled, start travel, travel to the assignment, arrive with the travel log, and Start Assignment.'],
  next: ['Next Assignment Same Day', 'Finish the assignment and head to the next one the same day: in progress, End Assignment, skip or start the upload, and the travel to the next assignment.'],
  submit: ['Review & Submit Timesheet', 'After the shoot: upload status and travel while uploading, upload failed, photos uploaded, review and submit the timesheet, and complete.'],
  note: ['Add a note', 'As lead photographer, add notes and describe what colleagues should plan for next time.'],
  timeoff: ['Time Off', 'Request time off up to 14 days ahead, then withdraw a pending request or cancel an approved one.'],
  timesheets: ['All Timesheets', 'Review your hours and miles, edit entries until they are paid, and check what has been paid.'],
  account: ['Account', 'Your profile and app settings.'],
  notifications: ['Notifications', 'Push notifications, in-app alerts and settings.'],
};
const OVERLAY_SECTION = { startTravel: 'start', travelLog: 'start', mapPick: 'start', qr: 'data', note: 'note', tsSheet: 'submit', equip: 'details', equipSent: 'details', report: 'details', cantAttend: 'details', reqTO: 'timeoff', cancelTO: 'timeoff', withdrawTO: 'timeoff', periodSheet: 'timesheets', rangeSheet: 'timesheets', payRates: 'timesheets', editTs: 'timesheets', editField: 'account', photoSheet: 'account', signOutAlert: 'account' };
const SCREEN_SECTION = { schedule: 'schedule', timeoff: 'timeoff', offDetail: 'timeoff', timesheets: 'timesheets', tsEntry: 'timesheets', statement: 'timesheets', ytd: 'timesheets', account: 'account', pw: 'account', pwDone: 'account', notif: 'notifications' };
const STEP_SECTION = { scheduled: 'details', traveling: 'start', arrived: 'start', active: 'next', ended: 'submit', done: 'submit' };

function sectionKey() {
  if (!S.authed) return 'auth';
  if (S.overlay && OVERLAY_SECTION[S.overlay.n]) return OVERLAY_SECTION[S.overlay.n];
  const c = cur();
  if (c.n === 'assignment') { const a = ASSIGNMENTS.find((x) => x.id === c.id); return (a && STEP_SECTION[a.step]) || 'details'; }
  return SCREEN_SECTION[c.n] || 'schedule';
}
function sideNote() {
  const el = document.getElementById('side'); if (!el) return;
  const [title, text] = SECTIONS[sectionKey()];
  if (el.dataset.k === title) return; el.dataset.k = title;
  el.innerHTML = `<p class="kicker">Section</p><h2>${esc(title)}</h2><p>${esc(text)}</p>`;
}
