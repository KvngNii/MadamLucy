import { Resend } from 'resend';

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
  const missing = [];
  if (!apiKey) missing.push('RESEND_API_KEY');
  if (!segmentId) missing.push('RESEND_SEGMENT_ID');
  return { apiKey, segmentId, missing, configured: missing.length === 0 };
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
    return res.status(200).json({
      ok: cfg.configured,
      configured: cfg.configured,
      missing: cfg.missing,
    });
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

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (overLimit(ip)) {
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

  try {
    const { error } = await store({ email, ...splitName(name) }, cfg);
    if (error) {
      // Someone signing up twice is a success from their side, not an error.
      if (/already|exists|duplicate/i.test(error.message || '')) {
        return res.status(200).json({ ok: true });
      }
      // Log the provider's reason, never the person's details.
      console.error('subscribe: resend rejected', error.name, error.message);
      return res.status(502).json({ ok: false, error: "We couldn't save that just now. Please try again." });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('subscribe: unexpected', err?.name, err?.message);
    return res.status(502).json({ ok: false, error: "We couldn't save that just now. Please try again." });
  }
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
