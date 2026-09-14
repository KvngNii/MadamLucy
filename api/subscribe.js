import { Resend } from 'resend';
import { welcomeEmail } from './lib/welcome-email.js';

// Launch-list signup endpoint.
//
// The form posts here rather than straight to Resend, for three reasons:
//   1. The site's CSP is `connect-src 'self'` — a same-origin POST needs no
//      widening, where a direct browser call to api.resend.com would.
//   2. The API key stays server-side. A browser-side integration ships a
//      writable credential to every visitor.
//   3. Validation, the honeypot and the rate limit run somewhere a bot cannot
//      simply skip.
//
// Swapping providers means replacing `store()` below and nothing else.

// Read per request, not once at module scope. A warm serverless instance that
// booted before a config change would otherwise hold the stale snapshot for
// its whole life, which turns "I set the variable and nothing happened" into a
// mystery. Reading process.env per call costs nothing.
function config() {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  // Resend renamed Audiences to Segments; `audience_id` still works but is on
  // the way out, so prefer the new name and accept the old one.
  const segmentId = (
    process.env.RESEND_SEGMENT_ID ||
    process.env.RESEND_AUDIENCE_ID ||
    ''
  ).trim();
  // Optional, and deliberately not in `missing`: signups work without it.
  // It gates the thank-you email only, and it cannot be set correctly until a
  // domain is verified in Resend — sending from an unverified domain fails.
  // So collecting stays switched on and sending stays switched off until the
  // day that variable appears, with nothing to remember to turn on but this.
  const from = (process.env.RESEND_FROM || '').trim();
  const replyTo = (process.env.RESEND_REPLY_TO || '').trim() || addressOf(from);
  const missing = [];
  if (!apiKey) missing.push('RESEND_API_KEY');
  if (!segmentId) missing.push('RESEND_SEGMENT_ID');
  return {
    apiKey,
    segmentId,
    from,
    replyTo,
    sends: Boolean(from),
    missing,
    configured: missing.length === 0,
  };
}

// `Lucy Perfect <hello@example.com>` -> `hello@example.com`; a bare address is
// returned as-is. Used for the List-Unsubscribe header, which takes an address
// and not a display name.
function addressOf(from) {
  const angled = from.match(/<([^>]+)>/);
  return (angled ? angled[1] : from).trim();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 100;
const MAX_EMAIL = 254; // RFC 5321

// Best-effort burst check. Serverless instances are ephemeral and there may be
// many of them, so this catches a hammering script hitting one warm instance
// and nothing more — it is a speed bump, not a rate limiter. The honeypot and
// Resend's own deduplication do the real work. A durable limit would need
// shared state (Vercel KV), which is not worth a dependency for a launch list.
const hits = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function overLimit(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // crude cap so a long-lived instance cannot grow unbounded
  return recent.length > MAX_PER_WINDOW;
}

// "Kwame Mensah" -> { firstName: 'Kwame', lastName: 'Mensah' }. Split on the
// first space only, so the two fields always rejoin to exactly what was typed
// and nothing is lost for people whose name is one word or four.
function splitName(full) {
  const trimmed = full.trim().replace(/\s+/g, ' ');
  const cut = trimmed.indexOf(' ');
  if (cut === -1) return { firstName: trimmed, lastName: '' };
  return { firstName: trimmed.slice(0, cut), lastName: trimmed.slice(cut + 1) };
}

async function store({ email, firstName, lastName }, { apiKey, segmentId }) {
  const resend = new Resend(apiKey);
  return resend.contacts.create({
    email,
    firstName,
    lastName,
    unsubscribed: false,
    segments: [{ id: segmentId }],
  });
}

// The thank-you, sent once, to someone who has just joined the list for the
// first time.
//
// Awaited rather than fired and forgotten: Vercel freezes the function the
// moment the response is returned, so a promise left running is killed
// mid-flight — reliably enough that it would look like an intermittent failure
// to send. One extra round trip on a request that already shows "Signing up…"
// is the cheaper trade.
//
// Never throws. The caller's job is to tell the visitor whether they are on
// the list, and they are, whether or not the mail went out. A send that fails
// is ours to see in the logs, not theirs to see on the page.
async function sendWelcome({ email, firstName }, cfg) {
  const { subject, previewText, html, text } = welcomeEmail({ firstName });
  const resend = new Resend(cfg.apiKey);
  try {
    const { error } = await resend.emails.send({
      from: cfg.from,
      to: email,
      replyTo: cfg.replyTo,
      subject,
      html,
      text,
      headers: {
        // resend.emails.send adds no unsubscribe footer of its own — that is a
        // broadcast feature — and the form promises "you can unsubscribe from
        // any message". So the header is on us. mailto rather than a URL
        // because it needs no endpoint, no token and no database to honour,
        // and Gmail and Apple Mail both surface it as a one-tap Unsubscribe.
        'List-Unsubscribe': `<mailto:${cfg.replyTo}?subject=unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      // headers are echoed in the message; the tag is for Resend's own
      // filtering, and carries nothing about the person.
      tags: [{ name: 'type', value: 'welcome' }],
    });
    if (error) {
      // Provider's identifier and message only. Never the address — a log line
      // is the easiest place for a signup list to leak out of.
      console.error('subscribe: welcome email rejected', error.name, error.message);
    }
  } catch (err) {
    console.error('subscribe: welcome email failed', err?.name, err?.message);
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const cfg = config();

  // GET is a health check rather than a 405: without it, a 503 from the form
  // gives no way to tell which variable is missing short of guessing and
  // redeploying. Reports only whether each name is set — never a value, a
  // length or a prefix. The names are already public in the README, and the
  // 503 body already says the endpoint is unconfigured, so this discloses
  // nothing new.
  if (req.method === 'GET') {
    const body = {
      ok: cfg.configured,
      configured: cfg.configured,
      missing: cfg.missing,
      // Whether the thank-you email is switched on. Separate from `configured`
      // because signups work without it, and reported at all so "did my
      // RESEND_FROM take?" is one curl rather than a test signup.
      sendsWelcome: cfg.sends,
    };

    // ?probe=1 additionally checks the credentials actually WORK, which the
    // presence check above cannot tell you: a key with Sending access, or a
    // segment id from another account, both look perfectly configured and
    // then fail at signup time. segments.get is read-only and writes nothing.
    //
    // Opt-in rather than on by default: a public endpoint that calls an
    // upstream on every hit is a free way for anyone to burn the Resend rate
    // limit. Same reason it shares the POST rate limiter.
    if (cfg.configured && req.query?.probe) {
      if (overLimit(clientIp(req))) {
        return res.status(429).json({ ...body, error: 'Too many probes. Try again in a minute.' });
      }
      const resend = new Resend(cfg.apiKey);
      try {
        const { data, error } = await resend.segments.get(cfg.segmentId);
        body.provider = error
          // The provider's own error identifier — restricted_api_key,
          // not_found — never a key, a segment id, or any part of either.
          ? { reachable: false, reason: error.name || 'unknown' }
          : { reachable: true, segment: data?.name ?? null };
      } catch (err) {
        body.provider = { reachable: false, reason: err?.name || 'unreachable' };
      }
      body.ok = body.provider.reachable === true;
    }

    return res.status(200).json(body);
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};

  // Honeypot: a field no human sees, so anything in it is a bot. Answer 200 so
  // it learns nothing about why it failed, and store nothing.
  if (typeof body.company === 'string' && body.company.trim() !== '') {
    return res.status(200).json({ ok: true });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!name) return res.status(400).json({ ok: false, error: 'Please tell us your name.' });
  if (name.length > MAX_NAME) return res.status(400).json({ ok: false, error: 'That name is too long.' });
  if (!EMAIL_RE.test(email) || email.length > MAX_EMAIL) {
    return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
  }

  if (overLimit(clientIp(req))) {
    return res.status(429).json({ ok: false, error: 'Too many attempts. Please try again in a minute.' });
  }

  // Unconfigured is a 503, not a silent success. The old stub claimed people
  // were on a list that did not exist; never do that again.
  if (!cfg.configured) {
    console.error(`subscribe: not configured — missing ${cfg.missing.join(' and ')}`);
    return res.status(503).json({
      ok: false,
      error: 'Signups are not switched on yet. Please try again shortly.',
    });
  }

  const { firstName, lastName } = splitName(name);

  try {
    const { error } = await store({ email, firstName, lastName }, cfg);
    if (error) {
      // Someone signing up twice is a success from their side, not an error.
      // No thank-you here: they had one the first time, and a welcome that
      // arrives again every time someone resubmits the form is just spam.
      if (/already|exists|duplicate/i.test(error.message || '')) {
        return res.status(200).json({ ok: true });
      }
      // Log the provider's reason, never the person's details.
      console.error('subscribe: resend rejected', error.name, error.message);
      return res.status(502).json({ ok: false, error: "We couldn't save that just now. Please try again." });
    }

    // Stored. Everything past this point is a courtesy, and none of it can
    // change the answer the visitor gets.
    if (cfg.sends) {
      await sendWelcome({ email, firstName }, cfg);
    } else {
      console.warn('subscribe: stored, no welcome email — RESEND_FROM is not set');
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('subscribe: unexpected', err?.name, err?.message);
    return res.status(502).json({ ok: false, error: "We couldn't save that just now. Please try again." });
  }
}

function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
