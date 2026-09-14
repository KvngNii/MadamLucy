#!/usr/bin/env node
// What a phone actually pays for this page, measured rather than estimated.
//
//   npm run build && npx vite preview --port 4180 &
//   node tests/mobile-audit.mjs
//
// (set PLAYWRIGHT=/path/to/playwright/index.js if it is not installed here)
//
// Needs Playwright's Chromium. It is a measuring instrument, not a pass/fail
// suite — the assertions at the end cover the things that have a right answer
// (no sideways scroll, no 40px tap targets, the phone never touching the
// desktop frame set); everything else it prints for a person to read.
//
// Baseline before the mobile pass, at 390x844: 9.69 MB transferred, 9.18 MB of
// it pour frames; 16 tap targets under 44px; two text sizes under 12px.

// Playwright is not a dependency of this project — it is a tool you point at
// the built site, not something the site needs to run. Set PLAYWRIGHT to an
// install elsewhere if it is not resolvable from here.
const pkg = await import(process.env.PLAYWRIGHT || 'playwright');
const { chromium } = pkg.default ?? pkg;

const URL = process.env.AUDIT_URL || 'http://localhost:4180/';
const VIEWPORTS = [
  ['iPhone 14 / Pixel', 390, 844, 3],
  ['small Android', 360, 800, 3],
  ['iPhone SE', 320, 568, 2],
];

let failures = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

const browser = await chromium.launch();

for (const [label, width, height, dpr] of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: dpr,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  const net = [];
  page.on('response', (r) =>
    net.push({
      url: r.url().replace(URL, '/'),
      type: r.request().resourceType(),
      bytes: Number(r.headers()['content-length'] || 0),
    }),
  );

  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(8000); // let the deferred fine pass finish

  const sum = (f) => net.filter(f).reduce((a, r) => a + r.bytes, 0);
  const total = sum(() => true);
  const smallFrames = net.filter((r) => r.url.includes('/frames/pour-sm/'));
  const fullFrames = net.filter((r) => /\/frames\/pour\//.test(r.url));

  console.log(`\n${'='.repeat(62)}\n${label}  ${width}x${height} @${dpr}x\n${'='.repeat(62)}`);
  console.log(`  transferred        ${(total / 1048576).toFixed(2)} MB  (${net.length} requests)`);
  console.log(`    phone frames     ${(sum((r) => r.url.includes('/frames/pour-sm/')) / 1024).toFixed(0)} KB  (${smallFrames.length} req)`);
  console.log(`    desktop frames   ${(sum((r) => /\/frames\/pour\//.test(r.url)) / 1024).toFixed(0)} KB  (${fullFrames.length} req)`);
  console.log(`    other images     ${(sum((r) => r.type === 'image' && !r.url.includes('/frames/')) / 1024).toFixed(0)} KB`);
  console.log(`    fonts            ${(sum((r) => r.type === 'font') / 1024).toFixed(0)} KB`);

  const layout = await page.evaluate(() => {
    const de = document.documentElement;
    const vw = de.clientWidth;
    const out = { overflow: de.scrollWidth - de.clientWidth, small: [], taps: [], over: [] };
    for (const el of document.querySelectorAll('p, li, span, a, button, label, small')) {
      if (!el.textContent.trim() || el.children.length) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 12) out.small.push(`${fs.toFixed(1)}px ${el.className || el.tagName}`);
    }
    for (const el of document.querySelectorAll('a, button, input, [role="button"], [role="tab"]')) {
      const r = el.getBoundingClientRect();
      // Skip what nobody can tap: zero-sized, and the off-screen honeypot.
      if (r.width === 0 || r.height === 0 || r.right < 0) continue;
      if (r.height < 44 || r.width < 44) {
        out.taps.push(`${Math.round(r.width)}x${Math.round(r.height)} ${el.className || el.tagName}`);
      }
    }
    for (const img of document.querySelectorAll('img')) {
      const r = img.getBoundingClientRect();
      if (!img.naturalWidth || r.width === 0) continue;
      // The logo is one fixed-size file cut for its largest slot — 48px at 3x,
      // so 144. On a 2x phone with the 40px nav slot that reads as 1.8x
      // oversampled and always will: one file cannot be exact for both. It is
      // 4.6 KB. This check is here for photographs, where the ratio means real
      // bytes; a srcset for a logo this size would cost more than it saves.
      if (img.currentSrc.includes('Logo.webp')) continue;
      const ratio = img.naturalWidth / (r.width * devicePixelRatio);
      if (ratio > 1.5) out.over.push(`${ratio.toFixed(1)}x ${img.currentSrc.split('/').pop()}`);
    }
    return out;
  });

  console.log('');
  check('no sideways scroll', layout.overflow <= 0, `${layout.overflow}px`);
  check('phone gets the small frame set', smallFrames.length > 0, `${smallFrames.length} requests`);
  check(
    'phone never touches the desktop set',
    fullFrames.length === 0,
    `${fullFrames.length} requests`,
  );
  check('under 2 MB', total < 2 * 1048576, `${(total / 1048576).toFixed(2)} MB`);
  check('no tap target under 44px', layout.taps.length === 0, layout.taps.slice(0, 6).join(', '));
  check('no text under 12px', layout.small.length === 0, layout.small.slice(0, 4).join(', '));
  check(
    'no image over 1.5x oversampled',
    layout.over.length === 0,
    layout.over.slice(0, 4).join(', '),
  );

  await ctx.close();
}

// The desktop side of the gate: the full set is still what a laptop gets.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const net = [];
  page.on('response', (r) => net.push(r.url()));
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(6000);
  console.log(`\n${'='.repeat(62)}\ndesktop 1280x900\n${'='.repeat(62)}`);
  check(
    'desktop gets the full frame set',
    net.some((u) => /\/frames\/pour\/\d+\.webp/.test(u)),
  );
  check(
    'desktop never touches the phone set',
    !net.some((u) => u.includes('/frames/pour-sm/')),
  );
  await ctx.close();
}

// Save-Data: the sequence is skipped entirely and the poster carries the stage.
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    extraHTTPHeaders: { 'Save-Data': 'on' },
  });
  const page = await ctx.newPage();
  // Chromium does not set navigator.connection.saveData from the header, so
  // stub the property the code actually reads. Testing the real branch, not a
  // convenient proxy for it.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      get: () => ({ saveData: true, effectiveType: '4g' }),
    });
  });
  const net = [];
  page.on('response', (r) => net.push(r.url()));
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(5000);
  const frames = net.filter((u) => /\/frames\/[^/]+\/\d+\.webp/.test(u));
  const poster = await page.evaluate(() => {
    const el = document.querySelector('.frame-seq__poster');
    return el ? { shown: el.getBoundingClientRect().height > 0, src: el.currentSrc.split('/').pop() } : null;
  });
  console.log(`\n${'='.repeat(62)}\nSave-Data on, 390x844\n${'='.repeat(62)}`);
  check('no frames downloaded at all', frames.length === 0, `${frames.length} frames`);
  check('the poster still fills the stage', Boolean(poster?.shown), JSON.stringify(poster));
  await ctx.close();
}

await browser.close();
console.log(failures ? `\n${failures} FAILING` : '\nall pass');
process.exit(failures ? 1 : 0);
