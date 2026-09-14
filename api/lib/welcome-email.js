// The thank-you sent when someone joins the launch list.
//
// One module, two send paths: api/subscribe.js sends it to each new signup,
// and scripts/welcome-broadcast.mjs builds the same message as a Resend
// broadcast draft for the people who signed up before this existed. Keeping
// the copy in one place is the whole point — two hand-maintained versions of
// the same email drift, and the drift shows up in someone's inbox.
//
// Three constraints shape the markup, and all three are worth knowing before
// editing it:
//
//   Tables, not divs. Outlook renders through Word's HTML engine, which has
//   no meaningful float or flex. A single-column table is the one layout every
//   client agrees on.
//
//   Inline styles, not a <style> block. Gmail strips <head> entirely when it
//   clips a message; several clients strip <style> outright. Anything that
//   matters has to live on the element.
//
//   No remote images. The site has no fixed domain yet, so an absolute URL
//   would break — and most clients block images until the reader allows them,
//   so a design that leans on them arrives as a column of grey boxes. This is
//   type and colour only, which also keeps it under Gmail's 102 KB clip limit
//   with room to spare.

// Straight from src/styles/global.css. Literal hex rather than custom
// properties: var() has no support worth relying on in email.
const INK = '#22291f';
const GREEN_DARK = '#1d421d';
const PALE = '#e8f187';
// The brand orange, darkened. #e48700 itself is 2.65:1 on this cream and
// 2.70:1 on white — the same failure the recipes eyebrow and the primary
// button each shipped with once. These dashes are a list marker carrying the
// structure of the section, so they are held to text contrast, not the 3:1
// graphical floor: 70% of the brand orange clears it at 4.99:1 and still
// reads unmistakably orange. Measured, not judged by eye.
const ORANGE = '#a05f00';
const CREAM = '#fffdf4';
const MUTED = '#5c6b55';

// The display face is a webfont the site self-hosts; email cannot rely on one,
// so this is a stack that degrades through what desktop and mobile clients
// actually ship.
const FONT = "'Nunito Sans', 'Segoe UI', Helvetica, Arial, sans-serif";

// The name comes from a form, so it reaches the HTML as untrusted input.
// Escaped even though the endpoint validates length — validation is not
// encoding, and the one place this is interpolated is inside an element.
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// "Thank you, Kwame." reads warmer than "Thank you." — but only when there is
// a real first name to use. A blank or whitespace-only one falls back rather
// than rendering "Thank you, ." at the top of the message.
function greeting(firstName) {
  const name = typeof firstName === 'string' ? firstName.trim() : '';
  return name ? `Thank you, ${name}.` : 'Thank you.';
}

/**
 * Build the message.
 *
 * @param {object}  opts
 * @param {string}  [opts.firstName]   Greets by name when present.
 * @param {'reply'|'footer'} [opts.unsubscribe]
 *   How the reader is told they can leave. 'reply' writes the line ourselves,
 *   for the one-to-one send — resend.emails.send adds no footer of its own.
 *   'footer' omits it, for the broadcast, which Resend appends its own
 *   unsubscribe link to. Saying it twice in one email is worse than either.
 * @returns {{subject: string, previewText: string, html: string, text: string}}
 */
export function welcomeEmail({ firstName = '', unsubscribe = 'reply' } = {}) {
  const hello = greeting(firstName);
  const showReplyLine = unsubscribe === 'reply';

  const subject = "Thank you — you're on the list";

  // The line inboxes show next to the subject. Left unset, clients fill it
  // with whatever text comes first, which is usually the greeting repeated.
  const previewText =
    "We'll email you the moment Lucy's Gari is ready to ship — and nothing in between.";

  const text = [
    hello,
    '',
    "You're on the launch list for Lucy's Gari, and that genuinely means a lot.",
    "We're a small Ghanaian family business, and every person who signs up",
    "before we've sold a single sachet is taking a chance on us. Thank you for",
    'being one of them.',
    '',
    'WHAT HAPPENS NEXT',
    '',
    "  One email when Lucy's Gari is ready to ship — the flavours, the price,",
    '  and where to get it.',
    '',
    '  Nothing in between. No weekly newsletter, no offers you did not ask for.',
    '',
    'Until then: every sachet starts on Lucy\'s own farm in the Eastern Region,',
    'is hand-fermented and roasted in small batches, and is infused with real',
    'superfoods — beetroot, ginger, turmeric, coconut, garlic. No fillers.',
    '',
    'Thank you for the support.',
    'Lucy and the team',
    'Lucy Perfect Enterprise — Made in Ghana',
    ...(showReplyLine
      ? ['', "Don't want launch emails? Reply with \"unsubscribe\" and we'll take you off the list."]
      : []),
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:${CREAM};">
<!-- Shown in the inbox list beside the subject, never on the page. The
     non-breaking spaces stop clients from pulling body copy in after it. -->
<div style="display:none;font-size:1px;color:${CREAM};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
${escapeHtml(previewText)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${CREAM};">
<tr>
<td align="center" style="padding:32px 16px;">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:20px;overflow:hidden;">

  <!-- Masthead. The wordmark is set, not drawn, for the same reason there are
       no images anywhere else in here. -->
  <tr>
    <td style="background-color:${GREEN_DARK};padding:32px 32px 28px;">
      <p style="margin:0 0 6px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${PALE};">
        Lucy Perfect Enterprise
      </p>
      <p style="margin:0;font-family:${FONT};font-size:28px;line-height:1.15;font-weight:700;color:#ffffff;">
        ${escapeHtml(hello)}
      </p>
    </td>
  </tr>

  <tr>
    <td style="padding:32px 32px 8px;">
      <p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.6;color:${INK};">
        You&rsquo;re on the launch list for Lucy&rsquo;s Gari, and that genuinely means a lot.
      </p>
      <p style="margin:0 0 28px;font-family:${FONT};font-size:16px;line-height:1.6;color:${INK};">
        We&rsquo;re a small Ghanaian family business, and every person who signs up
        before we&rsquo;ve sold a single sachet is taking a chance on us. Thank you
        for being one of them.
      </p>
    </td>
  </tr>

  <!-- What they actually get. This is the part that earns the signup: it sets
       the expectation the form promised, so the launch email months from now
       arrives as something they agreed to rather than a surprise. -->
  <tr>
    <td style="padding:0 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${CREAM};border-radius:16px;">
        <tr>
          <td style="padding:24px 24px 8px;">
            <p style="margin:0 0 16px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${MUTED};">
              What happens next
            </p>
            <p style="margin:0 0 14px;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK};">
              <span style="color:${ORANGE};font-weight:700;">&mdash;</span>
              One email when Lucy&rsquo;s Gari is ready to ship: the flavours, the
              price, and where to get it.
            </p>
            <p style="margin:0 0 24px;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK};">
              <span style="color:${ORANGE};font-weight:700;">&mdash;</span>
              Nothing in between. No weekly newsletter, no offers you didn&rsquo;t
              ask for.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="padding:28px 32px 0;">
      <p style="margin:0 0 28px;font-family:${FONT};font-size:15px;line-height:1.6;color:${MUTED};">
        Until then: every sachet starts on Lucy&rsquo;s own farm in the Eastern
        Region, is hand-fermented and roasted in small batches, and is infused
        with real superfoods &mdash; beetroot, ginger, turmeric, coconut, garlic.
        No fillers.
      </p>
    </td>
  </tr>

  <tr>
    <td style="padding:0 32px 32px;">
      <p style="margin:0 0 4px;font-family:${FONT};font-size:16px;line-height:1.6;font-weight:700;color:${GREEN_DARK};">
        Thank you for the support.
      </p>
      <p style="margin:0;font-family:${FONT};font-size:16px;line-height:1.6;color:${INK};">
        Lucy and the team
      </p>
    </td>
  </tr>

  <tr>
    <td style="background-color:${GREEN_DARK};padding:20px 32px;">
      <p style="margin:0;font-family:${FONT};font-size:12px;line-height:1.6;color:${PALE};">
        Lucy Perfect Enterprise &middot; Made in Ghana
      </p>
    </td>
  </tr>

</table>
${
  showReplyLine
    ? `
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
  <tr>
    <td style="padding:16px 32px 0;" align="center">
      <p style="margin:0;font-family:${FONT};font-size:12px;line-height:1.6;color:${MUTED};">
        You&rsquo;re getting this because you signed up for launch updates.
        Don&rsquo;t want them? Reply with &ldquo;unsubscribe&rdquo; and we&rsquo;ll
        take you off the list.
      </p>
    </td>
  </tr>
</table>`
    : ''
}

</td>
</tr>
</table>
</body>
</html>`;

  return { subject, previewText, html, text };
}
