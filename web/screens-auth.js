/* Sign in and Register (invite-only first-time flow) */
const SCREENS = {};
const OVERLAYS = {};
const authBack = () => (S.auth.length > 1 ? `<button class="circle-btn" data-act="authBack" aria-label="Back">${I.back}</button>` : '<span class="spacer"></span>');
const authBar = () => `<div class="toolbar">${authBack()}<span class="spacer"></span></div>`;
const authPage = (inner, foot) => `<div class="col">${authBar()}<div class="pagetop" style="flex:1">${inner}</div>${foot ? `<div class="footer"><div class="stack">${foot}</div></div>` : ''}</div>`;
const pwChecks = (v = '') => [[v.length >= 12, 'At least 12 characters'], [/\d/.test(v), 'A number'], [/[^A-Za-z0-9]/.test(v), 'A symbol']];
const pwList = (v) => `<div class="req" aria-live="polite">${pwChecks(v).map(([m, l]) => `<div class="${m ? 'met' : 'unmet'}">${m ? I.ok : I.no}<span>${l}</span></div>`).join('')}</div>`;

SCREENS.welcome = () => `<div class="col"><div style="flex:1;padding:0 16px"><div class="logo" role="img" aria-label="VIP logo placeholder">VIP</div>
  <h1 class="t-title1 center">VIP Photographer</h1><p class="t-body sec center" style="margin:8px 0 0">Your schedule, time tracking and photo upload in one place. This app is by invitation only.</p></div>
  <div class="footer"><div class="stack">${btn('Enter invite code', { act: 'toInvite' })}${btn('I already have an account', { kind: 'plain', act: 'toSignin' })}</div></div></div>`;

SCREENS.invite = () => {
  const bad = F.inviteErr; const v = (F.invite || '').trim();
  return authPage(`<h1 class="t-title1">Enter your invite code</h1><p class="t-body sec" style="margin:8px 0 20px">Your scheduler sent it by email or text.</p>
    ${field('invite', 'Invite code', { ph: 'VIP-0000-XX', err: bad ? 'That invite code isn’t valid. Check it and try again, or ask your scheduler for a new one.' : '', attrs: 'autocapitalize="characters"' })}
    <p class="note">Demo: use ${INVITE}</p>`, btn('Continue', { act: 'checkInvite', disabled: !v }));
};
SCREENS.createAccount = () => authPage(`<span class="chip accent" style="margin-bottom:14px"><i></i>Invite verified</span><h1 class="t-title1">Welcome, Jordan</h1><p class="t-body sec" style="margin:8px 0 20px">Confirm your details to create your account.</p>
  ${field('acName', 'Name')}${field('acEmail', 'Email', { type: 'email' })}${field('acPhone', 'Mobile phone', { type: 'tel' })}
  <p class="note">By continuing you agree to the VIP Terms of Use and Privacy Policy.</p>`, btn('Continue', { act: 'toPassword', disabled: !(F.acName && F.acEmail && F.acPhone) }));
SCREENS.password = () => { const ok = pwChecks(F.pw || '').every((c) => c[0]); return authPage(`<h1 class="t-title1">Create a password</h1><p class="t-body sec" style="margin:8px 0 20px">You’ll use it with a verification code to sign in.</p>${field('pw', 'Password', { type: 'password' })}${pwList(F.pw || '')}`, btn('Continue', { act: 'toMfa', disabled: !ok })); };
SCREENS.mfa = () => authPage(`<h1 class="t-title1">Verify it’s you</h1><p class="t-body sec" style="margin:8px 0 20px">We’ll text a verification code to your mobile phone each time you sign in on a new device.</p>
  ${card(row({ title: 'Text message', sub: maskPhone(), trail: I.check }))}`, btn('Send code', { act: 'toCode' }));
SCREENS.code = () => { const d = (F.code || '').padEnd(6, ' ').split(''); return authPage(`<h1 class="t-title1">Enter the code</h1><p class="t-body sec" style="margin:8px 0 8px">We sent a 6-digit code to ${maskPhone()}.</p>
  <div class="codeboxes">${d.map((c, i) => `<input data-bind="c${i}" inputmode="numeric" maxlength="1" value="${c.trim()}" aria-label="Digit ${i + 1}">`).join('')}</div>
  <button class="btn plain small" data-act="resend" style="padding:0">Resend code</button><p class="note">Demo: any 6 digits work.</p>`, btn(S.signingIn ? 'Sign in' : 'Verify', { act: 'verify', disabled: (F.code || '').length < 6 })); };
SCREENS.notifprime = () => authPage(`<div class="iconTile">${I.bell.replace('<svg', '<svg')}</div><h1 class="t-title1">Stay up to date</h1><p class="t-body sec" style="margin:8px 0 20px">Turn on notifications so you don’t miss changes to your schedule.</p>
  ${card(row({ title: 'New or changed assignments' }), row({ title: 'Assignment starting soon' }), row({ title: 'Photo upload reminders' }), row({ title: 'Timesheet approved' }))}`,
  btn('Turn on notifications', { act: 'askNotif' }) + btn('Not now', { kind: 'plain', act: 'skipNotif' }));
SCREENS.allset = () => `<div class="col"><div style="flex:1" class="hero"><div class="iconTile">${I.tick}</div><h1 class="t-title1">You’re all set</h1><p class="t-body sec" style="margin:8px 0 0">Your schedule shows your upcoming assignments as soon as your scheduler publishes them. ${S.notif.on ? 'We’ll notify you about changes.' : 'You can turn notifications on any time in Account.'}</p></div><div class="footer">${btn('Go to Schedule', { act: 'enter' })}</div></div>`;
SCREENS.signin = () => authPage(`<h1 class="t-title1">Sign in</h1><p class="t-body sec" style="margin:8px 0 20px">Use the email and password for your VIP account.</p>${field('siEmail', 'Email', { type: 'email' })}${field('siPw', 'Password', { type: 'password' })}<p class="note">Demo: any email and password.</p>`, btn('Continue', { act: 'signinNext', disabled: !(F.siEmail && F.siPw) }));
const maskPhone = () => '(312) •••-' + (S.profile.phone.replace(/\D/g, '').slice(-4) || '0148');

OVERLAYS.iosPerm = () => alertBox('“VIP” Would Like to Send You Notifications', 'Notifications may include alerts, sounds and icon badges. These can be configured in Settings.', [{ label: 'Don’t Allow', act: 'permDeny' }, { label: 'Allow', act: 'permAllow' }]);
