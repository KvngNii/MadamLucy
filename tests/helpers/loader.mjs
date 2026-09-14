// Module resolution hook: rewrites `import { Resend } from 'resend'` to the
// stub next door. Registered before api/subscribe.js is imported, so the
// endpoint's own code runs unmodified — the test never reimplements the
// control flow it is checking.

import { pathToFileURL } from 'node:url';

const STUB = pathToFileURL(new URL('./resend-stub.mjs', import.meta.url).pathname).href;

export async function resolve(specifier, context, next) {
  if (specifier === 'resend') return next(STUB, context);
  return next(specifier, context);
}
