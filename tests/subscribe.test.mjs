// Signup endpoint, end to end with the Resend SDK stubbed.
//
//   npm test
//
// No framework and no dependency — node's own module hook swaps `resend` for
// a recording stub, and api/subscribe.js runs exactly as deployed.
//
// What it is really guarding: the welcome email must never be able to break a
// signup. A mailer that is misconfigured, rejecting, or simply down has to
// leave the visitor with the same "you're on the list" they would have had
// before the email existed — because they are. Every case below asserts both
// halves: what should happen AND what should not. A test that only checked the
// happy path would pass while a broken mailer turned every signup into an
// error on screen.

import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register(pathToFileURL(new URL('./helpers/loader.mjs', import.meta.url).pathname));

const stub = await import('./helpers/resend-stub.mjs');
const { default: handler } = await import('../api/subscribe.js');

let failures = 0;
function check(name, condition, detail = '') {
  if (!condition) failures++;
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
}

function mockRes() {
  const res = { statusCode: 0, body: null, headers: {} };
  res.setHeader = (k, v) => {
    res.headers[k] = v;
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  return res;
}

// A fresh IP each time: the endpoint's burst limiter is per-IP and would
// otherwise start 429-ing partway through the run and fail the later cases for
// the wrong reason.
let ip = 0;
const post = (body) => ({
  method: 'POST',
  body,
  headers: { 'x-forwarded-for': `10.0.0.${(ip += 1)}` },
  query: {},
});

process.env.RESEND_API_KEY = 're_test';
process.env.RESEND_SEGMENT_ID = 'seg_test';

console.log('\n--- gate closed: no RESEND_FROM ---');
delete process.env.RESEND_FROM;
stub.reset();
stub.setMode('ok', 'ok');
let res = mockRes();
await handler(post({ name: 'Ama Boateng', email: 'ama@example.com' }), res);
check('visitor gets success', res.statusCode === 200 && res.body.ok === true);
check('contact still stored', stub.calls.contacts.length === 1);
check('nothing sent', stub.calls.emails.length === 0, `${stub.calls.emails.length} sends`);

console.log('\n--- gate open: new signup ---');
process.env.RESEND_FROM = 'Lucy Perfect <hello@lucyperfect.test>';
stub.reset();
stub.setMode('ok', 'ok');
res = mockRes();
await handler(post({ name: 'Kwame Mensah', email: 'kwame@example.com' }), res);
const sent = stub.calls.emails[0] ?? {};
check('visitor gets success', res.statusCode === 200 && res.body.ok === true);
check('exactly one send', stub.calls.emails.length === 1);
check('addressed to the signup', sent.to === 'kwame@example.com');
check('greets by first name', (sent.html || '').includes('Thank you, Kwame.'));
check('has a plain-text part', typeof sent.text === 'string' && sent.text.length > 200);
check(
  'List-Unsubscribe points at the from address',
  /mailto:hello@lucyperfect\.test/.test(sent.headers?.['List-Unsubscribe'] || ''),
  sent.headers?.['List-Unsubscribe'],
);
check(
  'one-click unsubscribe header',
  sent.headers?.['List-Unsubscribe-Post'] === 'List-Unsubscribe=One-Click',
);
check('replyTo derived from From', sent.replyTo === 'hello@lucyperfect.test', String(sent.replyTo));

console.log('\n--- duplicate signup ---');
stub.reset();
stub.setMode('duplicate', 'ok');
res = mockRes();
await handler(post({ name: 'Kwame Mensah', email: 'kwame@example.com' }), res);
check('visitor still gets success', res.statusCode === 200 && res.body.ok === true);
check('no second thank-you', stub.calls.emails.length === 0, `${stub.calls.emails.length} sends`);

console.log('\n--- mailer rejects the send ---');
stub.reset();
stub.setMode('ok', 'reject');
res = mockRes();
await handler(post({ name: 'Esi Owusu', email: 'esi@example.com' }), res);
check('contact stored', stub.calls.contacts.length === 1);
check(
  'visitor still gets success',
  res.statusCode === 200 && res.body.ok === true,
  `${res.statusCode} ${JSON.stringify(res.body)}`,
);

console.log('\n--- mailer throws ---');
stub.reset();
stub.setMode('ok', 'throw');
res = mockRes();
await handler(post({ name: 'Yaw Antwi', email: 'yaw@example.com' }), res);
check('contact stored', stub.calls.contacts.length === 1);
check(
  'visitor still gets success',
  res.statusCode === 200 && res.body.ok === true,
  `${res.statusCode} ${JSON.stringify(res.body)}`,
);

console.log('\n--- store itself fails ---');
stub.reset();
stub.setMode('reject', 'ok');
res = mockRes();
await handler(post({ name: 'Nana Adu', email: 'nana@example.com' }), res);
check('visitor is told', res.statusCode === 502 && res.body.ok === false);
check('no thank-you for a signup that did not save', stub.calls.emails.length === 0);

console.log('\n--- honeypot ---');
stub.reset();
stub.setMode('ok', 'ok');
res = mockRes();
await handler(post({ name: 'Bot', email: 'bot@example.com', company: 'spam co' }), res);
check('looks like success to the bot', res.statusCode === 200 && res.body.ok === true);
check('stores nothing', stub.calls.contacts.length === 0);
check('sends nothing', stub.calls.emails.length === 0);

console.log('\n--- health check ---');
res = mockRes();
await handler({ method: 'GET', headers: {}, query: {} }, res);
check('reports sendsWelcome true', res.body.sendsWelcome === true, JSON.stringify(res.body));
delete process.env.RESEND_FROM;
res = mockRes();
await handler({ method: 'GET', headers: {}, query: {} }, res);
check('reports sendsWelcome false', res.body.sendsWelcome === false, JSON.stringify(res.body));
check('signups still count as configured without it', res.body.configured === true);

console.log(failures ? `\n${failures} FAILING` : '\nall pass');
process.exit(failures ? 1 : 0);
