#!/usr/bin/env node
// Build the thank-you as a Resend broadcast DRAFT, for the people who signed
// up before the automatic one existed.
//
//   RESEND_API_KEY=re_... RESEND_SEGMENT_ID=seg_... RESEND_FROM="Lucy Perfect <hello@yourdomain>" \
//     node scripts/welcome-broadcast.mjs
//
// It creates a draft and stops. Nothing is sent: you open it in the Resend
// dashboard, read it, and press Send yourself. That is deliberate — a script
// that mails a real list the moment you run it is one typo away from being
// unrecallable, and there is no undo on delivered email.
//
// Safe to run twice. It looks for a draft of the same name first and points
// you at it rather than leaving you with three near-identical drafts and no
// way to tell which one you edited.
//
// The message body comes from api/lib/welcome-email.js, the same module the
// signup endpoint sends, so the two cannot drift.

import { Resend } from 'resend';
import { welcomeEmail } from '../api/lib/welcome-email.js';

const KEY = process.env.RESEND_API_KEY;
const SEGMENT = (process.env.RESEND_SEGMENT_ID || process.env.RESEND_AUDIENCE_ID || '').trim();
const FROM = (process.env.RESEND_FROM || '').trim();
const REPLY_TO = (process.env.RESEND_REPLY_TO || '').trim();
const NAME = process.argv[2] || 'Launch list thank-you';

const missing = [
  !KEY && 'RESEND_API_KEY',
  !SEGMENT && 'RESEND_SEGMENT_ID',
  !FROM && 'RESEND_FROM',
].filter(Boolean);

if (missing.length) {
  console.error(`Missing ${missing.join(', ')}.\n`);
  console.error('  RESEND_API_KEY=re_... RESEND_SEGMENT_ID=seg_... \\');
  console.error('  RESEND_FROM="Lucy Perfect <hello@yourdomain>" \\');
  console.error('    node scripts/welcome-broadcast.mjs\n');
  if (!FROM) {
    console.error('RESEND_FROM must be an address at a domain you have verified in Resend');
    console.error('(Resend → Domains). Sending from an unverified domain is rejected, and a');
    console.error('*.vercel.app subdomain can never be verified — its DNS is not yours.');
  }
  process.exit(1);
}

const resend = new Resend(KEY);

// Don't make a second draft of a mail you already have open in another tab.
const { data: existing, error: listErr } = await resend.broadcasts.list();
if (listErr) {
  console.error(`Could not read broadcasts: ${listErr.name} — ${listErr.message}`);
  if (listErr.name === 'invalid_api_key' || listErr.name === 'restricted_api_key') {
    console.error('The key needs Full access (Resend → Settings → API Keys).');
  }
  process.exit(1);
}

const match = (existing?.data ?? []).find(
  (b) => b.name?.toLowerCase() === NAME.toLowerCase(),
);
if (match) {
  console.log(`A broadcast named "${match.name}" already exists (status: ${match.status}).`);
  console.log('Not creating a second one. Open the existing draft:\n');
  console.log(`  https://resend.com/broadcasts/${match.id}\n`);
  console.log('To start over, delete it in the dashboard and run this again.');
  process.exit(0);
}

// No firstName: a broadcast goes to everyone at once, so there is no one name
// to greet. welcomeEmail falls back to a plain "Thank you." for exactly this.
// unsubscribe: 'footer' drops our own reply-to-unsubscribe line, because
// Resend appends a real unsubscribe link to every broadcast — one is helpful,
// two in the same email is clutter.
const { subject, previewText, html, text } = welcomeEmail({ unsubscribe: 'footer' });

// No `send` key, and no flag that adds one: broadcasts.create leaves the
// broadcast a draft unless send:true is passed. (Checked against
// SendBroadcastOnCreationOptions in the installed SDK's type definitions.)
const { data, error } = await resend.broadcasts.create({
  name: NAME,
  segmentId: SEGMENT,
  from: FROM,
  ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
  subject,
  previewText,
  html,
  text,
});

if (error) {
  console.error(`Could not create the broadcast: ${error.name} — ${error.message}`);
  if (/domain/i.test(error.message || '')) {
    console.error('\nThat usually means RESEND_FROM is not at a verified domain.');
    console.error('Resend → Domains, add the DNS records it gives you, wait for Verified.');
  }
  process.exit(1);
}

console.log(`Created the draft "${NAME}".\n`);
console.log(`  https://resend.com/broadcasts/${data.id}\n`);
console.log('Nothing has been sent. Open it, read it top to bottom, send yourself a');
console.log('test from the dashboard, and press Send when you are happy with it.');
