# Working notes for Claude

## Preferences

- **Merge my own fixes by default.** Once the direction is agreed, open the PR
  and merge it without asking each time. Still ask before anything genuinely
  one-way — deleting data, rotating credentials, changing the brand palette.
- **Author commits as KvngNii <barneyhamms77@gmail.com>**, with
  `Co-Authored-By: Claude` retained so the involvement is still on the record.
  That address is the account's primary, verified against commit `e653201`, and
  the one to author as. sediham77@gmail.com — the address in session context —
  is now a verified secondary, so it links too; it is simply not the one to use,
  and seeing barneyhamms77 on the history is not a mistake to correct.
  Set it with `git config --local user.name/user.email` at the start of a
  session; `.git/config` does not survive a fresh clone.

## Deploys

Vercel builds **`main`**. A branch alone changes nothing on the live site, and
this has caused confusion more than once — twice the reported bug was simply
"the fix isn't on main yet". Merging a PR freezes what goes in at that SHA:
commits pushed afterwards need a new PR.

## Traps this codebase has actually sprung

- **Equal-specificity CSS collisions — four times now.** Two single-class rules
  means source order decides, and `global.css` usually wins. It has hit
  `.hero__inner`, `.story__stage`, `.tradition__why` and `.recipes__eyebrow`.
  Worse, a partial loss is possible: a component's `opacity` can land while its
  `color` loses. Scope to `.section .element` rather than trusting order. The
  durable fix — a deliberate CSS import order in `main.jsx` — is still open.
- **Contrast: measure, never eyeball.** Every single contrast bug here looked
  fine on screen: flavour accents 2.94:1, the primary button 2.70:1 site-wide,
  the Unlock heading 1.66:1, the recipes eyebrow 2.65:1. Sample computed styles
  and composite any `opacity` over the real parent background.
- **Lenis owns scrolling.** `body { overflow: hidden }` does nothing — Lenis
  drives scroll in JS and ignores the property. `lenis.stop()` locks the page
  but `preventDefault`s every wheel/touch event, so any panel that must still
  scroll needs `data-lenis-prevent`. See `src/hooks/useScrollLock.js`.
- **Tests that assert the wrong thing.** A modal scroll test set `scrollTop`
  directly and passed while wheeling over the modal did nothing. Drive real
  input, and assert both halves — the thing that should move *and* the thing
  that should not.

## Still outstanding

- Buy a domain and verify it in Resend. Signup collection works; **sending is
  blocked on it**, and two things now wait on that: the launch email and the
  thank-you (`RESEND_FROM` is the single switch for both). A `*.vercel.app`
  subdomain cannot work — its DNS is not yours, so SPF/DKIM can never be
  added.
- `RESEND_API_KEY` needs **Full access**, not Sending access — Sending cannot
  manage contacts. `GET /api/subscribe?probe=1` reports whether the credentials
  actually work.
- Per-flavour hex codes in `src/styles/flavors.css` are estimates from
  packaging renders, not the source design files.
- Placeholders awaiting real content: the Instagram handle, contact / FDA /
  batch numbers.
