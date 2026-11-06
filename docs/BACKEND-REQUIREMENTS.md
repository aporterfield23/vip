# VIP Photographer App: backend requirements (draft for engineering)

**Purpose.** To list what the app needs from the backend, screen by screen, so the backend team can tell us which existing API covers each need and what is missing. This is a requirements draft, not an API contract: it has no endpoint names, field names or error formats. Those have to come from the real API.

**Status: first draft, written from the PRD and the demo's placeholder data.** Nothing here has been checked against an existing backend. We do not know whether `sv2.vipis.com` is that backend, so it is not assumed.

Sources: the PRD ([web/prd.html](../web/prd.html), section numbers below refer to it), the demo data model (`web/data.js`) and the decision pages. All names, rates and amounts in the demo are placeholders.

## 1. What we need from the backend team

1. API documentation (OpenAPI/Swagger or a Postman collection) for everything in section 4.
2. How sign-in works: invite codes, passwords, MFA by text message, sessions, token lifetime, revocation.
3. Example responses for an assignment, a timesheet entry, a time-off request and a notification.
4. The assignment status model and which transitions the server performs (section 5).
5. The photo upload SDK or adapter documentation, and where uploaded files and note images are stored.
6. Answers to the open questions in section 7.

## 2. Assumptions to confirm

- The backend is an existing system (the scheduler-facing system and the VIP Staff web Timesheet page are mentioned in the PRD). The app reads and writes through its API; it does not hold the source of truth.
- Schedulers create assignments, assign photographers and decide time off in the scheduler-facing system. The app never does (PRD Non-Goals, 8.13).
- Platforms: iOS and Android (8.1). One API for both.
- Times, rates and pay rules are applied by the backend, not the app (8.6).
- US only: phone numbers are 10 digits, addresses are US.

## 3. Data the app reads and writes

Field names are descriptive. "Source" says who owns the value.

### 3.1 Photographer (account)
Name, job title, mobile phone, email, home address (used as the default travel start), profile photo, appearance preference (kept on the device or the account: to decide), notification settings (master on/off plus five types). Source: backend. The photographer edits phone, email, address, password and photo (8.15).

### 3.2 Assignment
- Identity: id, date, scheduled start and end (the demo stores minutes from midnight), type (for example School Pictures, Sports Portraits), organization, city, full address, meeting point.
- Role: whether this photographer is the lead (controls Add note), and whether it is a Sports assignment (controls the QR code).
- People on the assignment: lead (name, phone), other photographers (name, phone), client contact, account manager. Used for call actions.
- Status (section 5) and the journey step reached.
- Event timestamps: travel-to start, arrival, assignment start, assignment end, and the same for the trip after the assignment.
- Per trip: system travel time and distance, the photographer's edited values if any, and the reason for each edit. A timesheet with any edit carries a flag for payroll review.
- Tolls (amounts) and parking receipt images.
- Photos: upload state (not started, uploading, failed, confirmed), file count, confirmation from the SDK adapter.
- Notes: author, timestamp, text, optional image. Lead photographers add; everyone on the assignment reads.
- The app needs a **Past 5 days** window plus **upcoming** assignments in schedule order, including approved Time Off entries.

### 3.3 Timesheet entry
Id, client or description, department/type, location, date, hours entered (photography, driving), miles, tolls, status (New, Pending, Approved, Paid), paid-on date, linked payment statement. Entries cover the last two years and also non-assignment paid work (meetings, vacation) per 8.6. The backend returns pay itemized by category. Assignment time and travel time are never combined.

Pay rates (photography, driving, mileage) come from the backend and may vary by photographer or organization (open question).

### 3.4 Time-off request
Id, start and end dates, time of day (All Day, Before Noon, Afternoon; the two half-day options only for a single date), hours (8 a day, 4 for a half day), status (Pending, Approved, Denied, Cancelled), requested, decided and cancelled timestamps.

### 3.5 Payment statement
A downloadable document per paid period, with a PDF view. Whether photographers receive these is still open in the design notes.

### 3.6 Notifications
Push for: new or changed assignments, approaching start, upload reminder, timesheet approved, time-off decision. Needs a device token registration and per-type settings stored per photographer.

### 3.7 Call log
Each tap on a Call action (Can't attend, Call scheduler, Call account coordinator) records photographer, assignment, action, journey step and timestamp.

### 3.8 Equipment issue
Equipment type, description, up to 4 photos, timestamp, assignment, photographer. Goes to the equipment coordinator.

## 4. Capabilities by screen

| Screen | Reads | Writes | Notes |
|---|---|---|---|
| Sign in, Register (8.1) | Invite validity, prefilled name, email, mobile | Account creation with invite code, password, MFA code verification | Invite-only; no valid invite, no account. MFA by text message only, on every new device or sign-in. |
| Schedule (8.2) | Upcoming assignments, Past 5 days, approved Time Off | None | Draft assignments never reach the app. |
| Assignment Details (8.3) | Full assignment, people, notes, status | Start Travel, Arrived, Start Assignment, End Assignment events; Can't attend call log | Status shown must be the authoritative current status. Actions depend on journey step, role and type. |
| Start travel and Arrived sheets (8.4) | Default start address, system travel time and distance | Edited start address, edited distance with reason, trip record | Needs a distance source (open question). |
| Timesheet sheet (8.5) | Captured times, tolls | Edited travel time and distance with required reason, tolls, receipt photos, Submit Timesheet | Submit must work whether or not photos are uploaded. Edits flag the timesheet for payroll. |
| Upload photos (8.8) | Upload state | Photo files via the SDK adapter, resumable | Available from End Assignment until 5 days after the assignment date. Resuming must not duplicate files. Confirmation moves status. |
| Notes (8.10) | Notes | New note (lead only) | Note image storage and size limits open. |
| Report issue, Call actions (8.9) | Contact numbers | Equipment issue report; call log entries | Phone numbers are placeholders in the designs. |
| Time Off (8.13) | Requests | Submit, withdraw a Pending request, cancel an Approved request | See section 6 for the rules. |
| Timesheets (8.6) | Entries, rates, statements, year to date totals | Edits to Open entries | Approved and Paid entries are locked. |
| Account (8.15) | Profile | Edit phone, email (both confirmed by a code or link), password (signs out other devices), photo | Sign out ends the session. |
| Notifications (8.11) | Settings | Settings, device token | |

## 5. Assignment status model

Draft (scheduler only, never sent to the app), Scheduled, Active, Processing, Uploaded, Completed, Cancelled (PRD section 6).

- Scheduled → Active when the photographer logs Start Travel.
- Active stays until travel time and distance are submitted with the timesheet.
- Timesheet submitted and photos not yet confirmed → Processing.
- Photos confirmed uploaded → Uploaded. If the upload finishes while Active, the status does not change until the timesheet is submitted.
- Completed when the timesheet is approved. Cancelled is reachable from Scheduled or Active.
- **Engineering to confirm** who performs each transition (app request or server rule) and the Processing → Uploaded rule.

## 6. Business rules the backend must enforce

The app also applies these for good screens, but the server is the authority.

- No account without a valid invite. Login needs the second factor. A revoked photographer is disabled centrally and loses access at the next auth check.
- Start Travel is not available before midnight on the assignment day.
- Can't attend is available only until Start Assignment is logged.
- Add note is allowed for lead photographers only. The QR code is for Sports assignments only.
- Timesheet: time and distance edits need a reason. The assignment time is captured by the app and is not editable. Tolls and receipts attach to the specific assignment.
- Time off: a request must start from tomorrow and fall within the next 14 days. A request is cancelled whole, never in part. A Pending request can be withdrawn at any time. An Approved request can be cancelled only if its first day is at least a day away. Cancelling takes effect at once, without scheduler approval, and notifies the scheduler.
- Time off is a flag for the scheduler, not a block: the scheduler can still assign that photographer.
- Approved and Paid timesheet entries are locked.

## 7. Open questions for engineering and product

From the PRD, still open:
1. Distance source: a distance-only API with a manual fallback. Which provider, and at what cost?
2. How the app knows the photographer is at an assignment (to default the start address), and how the destination after an assignment is chosen (next assignment that day, otherwise home).
3. Is the rounded-up 15-minute travel time what is paid?
4. Does a distance edit also need a reason, and is the scheduler alerted to an edit or only sees both values at review?
5. The Processing and Uploaded transition (section 5).
6. Upload reminder: how long after End Assignment, and whether it repeats.
7. Where note images are stored and the size limits.
8. Re-authentication policy for MFA (how often).
9. Pay rates by photographer or organization, and whether photographers receive payment statements.

New from this draft:
10. Is there one existing API for the app, or does it combine several systems (scheduler, VIP Staff Timesheet, photo storage)?
11. Real-time or polling: does the schedule update by push, or does the app refresh? What does it do when offline (assignments on a shoot with poor signal)?
12. Idempotency: can the app safely retry a journey event or a timesheet submit after a lost connection?
13. Time zone: are all times server-stored in one zone, and does the 14-day time-off window and the midnight rule use the assignment's zone or the photographer's?
14. Account email and phone changes: who sends the code or link, and what happens to a pending change?
15. Is `sv2.vipis.com` the backend for this app? We have not confirmed it.

## 8. When the API docs arrive

Check each row in section 4 and each rule in section 6 against the docs, and mark it: covered, partly covered, or missing. Also compare the field list in section 3 against the real response shapes and the demo's `web/data.js`. Anything missing is either a backend task or a design change; log it in the project's change list.
