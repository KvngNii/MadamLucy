#!/usr/bin/env node
// Create (or find) the Resend segment the signup form writes into, and print
// the id to paste into Vercel as RESEND_SEGMENT_ID.
//
//   RESEND_API_KEY=re_... node scripts/resend-segment.mjs
//   RESEND_API_KEY=re_... node scripts/resend-segment.mjs "Launch list"
//
// With no name it lists what already exists. With a name it reuses a segment
// of that name if there is one, so running it twice cannot leave you with two
// lists collecting half your signups each.
//
// The dashboard can do this too; this exists because it is exact, repeatable,
// and does not change when the dashboard does.

import { Resend } from 'resend';

const KEY = process.env.RESEND_API_KEY;
const name = process.argv[2];

if (!KEY) {
  console.error('Set RESEND_API_KEY first:\n  RESEND_API_KEY=re_... node scripts/resend-segment.mjs "Launch list"');
  process.exit(1);
}

const resend = new Resend(KEY);

const { data: list, error: listErr } = await resend.segments.list();
if (listErr) {
  console.error(`Could not read segments: ${listErr.name} — ${listErr.message}`);
  if (listErr.name === 'invalid_api_key' || listErr.name === 'restricted_api_key') {
    console.error('The key must have Sending access (Resend → Settings → API Keys).');
  }
  process.exit(1);
}

const existing = list?.data ?? [];

if (!name) {
  if (!existing.length) {
    console.log('No segments yet. Create one:\n  RESEND_API_KEY=re_... node scripts/resend-segment.mjs "Launch list"');
  } else {
    console.log('Segments on this account:\n');
    for (const s of existing) console.log(`  ${s.id}   ${s.name}`);
    console.log('\nPut the id you want in Vercel as RESEND_SEGMENT_ID.');
  }
  process.exit(0);
}

const match = existing.find((s) => s.name.toLowerCase() === name.toLowerCase());
if (match) {
  console.log(`A segment named "${match.name}" already exists — reusing it, not making a second one.\n`);
  report(match.id);
  process.exit(0);
}

const { data, error } = await resend.segments.create({ name });
if (error) {
  console.error(`Could not create the segment: ${error.name} — ${error.message}`);
  process.exit(1);
}
console.log(`Created segment "${name}".\n`);
report(data.id);

function report(id) {
  console.log(`  RESEND_SEGMENT_ID = ${id}`);
  console.log('\nAdd that to Vercel → Settings → Environment Variables for both');
  console.log('Production and Preview, alongside RESEND_API_KEY, then redeploy.');
}
