# Lucy Perfect Enterprise

Pre-launch marketing site. Vite + React, deployed as a static build on Vercel
with one serverless function.

```
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
```

## Launch-list signups

The "Notify Me" form posts to `api/subscribe.js`, a Vercel serverless
function that adds the contact to a Resend segment.

The form posts to our own endpoint rather than straight to Resend so that the
API key stays server-side, the site's `connect-src 'self'` CSP needs no
widening, and the validation, honeypot and rate limit run somewhere a bot
cannot skip.

### Switching it on

**Until the two environment variables below exist, the endpoint returns 503
and the form tells the visitor signups are not switched on yet.** It never
claims success for a signup it did not store.

1. Create a Resend account at <https://resend.com> and add an API key with
   **Full access** (Settings → API Keys).

   It has to be Full access, not Sending access: Sending access can only send
   email and cannot create or update contacts, which is what a signup does.
   Be aware of what that key can do — Full access can create, read, update and
   delete anything on the account, including domains and other API keys. It is
   broader than this site needs, and Resend offers nothing narrower for contact
   management. It stays server-side (nothing in `src/` imports the SDK) and
   lives in Vercel's environment, never the repo.
2. Create a segment (Audiences were renamed Segments) and copy its id. Either
   in the dashboard under **Contacts → Segments → Create**, or with the helper
   in this repo, which is exact and safe to run twice:

   ```
   RESEND_API_KEY=re_... node scripts/resend-segment.mjs "Launch list"
   ```

   It prints the id to paste below. With no name it lists what already exists.
   If a segment of that name is already there it reuses it rather than making
   a second one, so your signups cannot end up split across two lists.
3. In the Vercel project, Settings → Environment Variables, add both for
   Production *and* Preview:

   | name | value |
   |---|---|
   | `RESEND_API_KEY` | `re_…` from step 1 |
   | `RESEND_SEGMENT_ID` | the segment id from step 2 |

   `RESEND_AUDIENCE_ID` is accepted as a fallback for the old name.
4. Redeploy. Environment variables are only read at boot, so an existing
   deployment will not pick them up.
5. Check the endpoint can see them. `GET /api/subscribe` is a health check
   that reports which names are set — never their values:

   ```
   curl -s https://YOUR-DOMAIN/api/subscribe
   ```

   `{"configured":true,"missing":[]}` means it is wired up.
   `{"configured":false,"missing":["RESEND_SEGMENT_ID"]}` names what is absent.
   A 404 means the deployment does not have this code yet.

   If a variable you have set shows as missing, it is almost always scoped to
   the wrong environment (Vercel keeps Production, Preview and Development
   separate) or the deployment predates it — use **Redeploy**, since variables
   are captured per deployment.

   Add `?probe=1` to check the credentials actually *work*, not just that they
   are present. It makes one read-only call to Resend:

   ```
   curl -s "https://YOUR-DOMAIN/api/subscribe?probe=1"
   ```

   ```jsonc
   {"provider":{"reachable":true,"segment":"Launch list"}}   // good
   {"provider":{"reachable":false,"reason":"restricted_api_key"}}  // key lacks Full access
   {"provider":{"reachable":false,"reason":"not_found"}}     // wrong segment id
   {"provider":{"reachable":false,"reason":"invalid_api_key"}} // wrong key
   ```

   It reports Resend's own error identifiers and never a key or segment id.
   The probe is opt-in and rate-limited so the endpoint cannot be used to burn
   your Resend quota.
6. Sign up through the live form once and confirm the contact appears in the
   Resend dashboard.

Never commit these values. They belong in Vercel's environment, not in the
repo — anything in `public/` or imported from `src/` reaches the browser.

### The thank-you email

Every new signup gets a short thank-you: what they'll receive, roughly when,
and nothing in between. The message itself is `api/lib/welcome-email.js`.

**It stays switched off until you set `RESEND_FROM`**, and it cannot be set
correctly until a domain is verified (below). Until then signups are stored as
normal and nothing is sent — collecting and sending are deliberately separate
switches.

| name | value |
|---|---|
| `RESEND_FROM` | `Lucy Perfect <hello@yourdomain>` — an address at a **verified** domain |
| `RESEND_REPLY_TO` | optional; defaults to the address inside `RESEND_FROM` |

`GET /api/subscribe` reports `"sendsWelcome": true` once it is on, so you can
check without a test signup.

A failed send can never fail a signup. If Resend rejects the message or is
unreachable, the contact is still stored and the visitor still sees success —
they *are* on the list. The reason is logged (the provider's error name, never
anyone's address).

A repeat signup is not thanked twice.

Unsubscribing is a `List-Unsubscribe` header plus a line in the message asking
people to reply — honest and immediate at this list size, with nothing to
maintain. Resend **Topics** is the managed version when the list is big enough
to want it.

### Thanking the people who signed up earlier

Anyone who joined before the automatic email existed gets nothing from it. For
them:

```
RESEND_API_KEY=re_... RESEND_SEGMENT_ID=seg_... \
RESEND_FROM="Lucy Perfect <hello@yourdomain>" \
  node scripts/welcome-broadcast.mjs
```

That creates a Resend **draft** and stops — it prints the link and sends
nothing. Open it, read it, send yourself a test from the dashboard, then press
Send. Broadcasts carry Resend's own unsubscribe link, so that is handled for
you. Safe to run twice: it reuses a draft of the same name rather than making a
second one.

### Sending needs a verified domain

Both of the above need one. Resend will not send from a domain it has not
verified (Resend → Domains, add the DNS records, wait for Verified).

A `*.vercel.app` subdomain **cannot** work — its DNS is not yours, so the SPF
and DKIM records can never be added. It has to be a domain you own.

### Tests

```
npm test
```

Drives `api/subscribe.js` end to end with the Resend SDK stubbed — no key, no
network. It exists mainly to hold one line: a broken mailer must never turn a
successful signup into an error on screen. Every case asserts both what should
happen and what should not.

### Mobile audit

```
npm run build
npx vite preview --port 4180 &
npm run audit:mobile          # needs Playwright; PLAYWRIGHT=<path> if not local
```

Measures what a phone actually pays: bytes transferred at three widths, tap
targets under 44px, text under 12px, oversampled images, and that the frame-set
gate holds in both directions (a phone never fetches the desktop sequence, a
desktop never fetches the phone one). Run it after anything that touches
assets, layout or the pour.

Before the mobile pass it reported 9.69 MB at 390x844, 16 tap targets under
44px, and two text sizes under 12px. It now reports 0.97 MB and zero of each.

### Changing provider

`store()` in `api/subscribe.js` is the only function that knows about Resend.
Everything else — validation, the honeypot, the rate limit, the response
shape the form expects — is provider-agnostic.
