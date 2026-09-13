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
   **Sending access** (Settings → API Keys).
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
5. Sign up through the live form once and confirm the contact appears in the
   Resend dashboard.

Never commit these values. They belong in Vercel's environment, not in the
repo — anything in `public/` or imported from `src/` reaches the browser.

### Sending the launch email

Collecting works as soon as the variables are set. *Sending* needs a verified
domain (Resend → Domains), which involves adding DNS records and is worth
doing before launch day rather than on it.

### Changing provider

`store()` in `api/subscribe.js` is the only function that knows about Resend.
Everything else — validation, the honeypot, the rate limit, the response
shape the form expects — is provider-agnostic.
