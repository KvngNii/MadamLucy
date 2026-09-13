import { useState } from 'react';
import './Newsletter.css';
import { Photo } from './Photo.jsx';
import { MadeInGhanaSeal } from './MadeInGhanaSeal.jsx';

const PACK_IMAGE = '/assets/product-coconut.jpg';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Posts to our own /api/subscribe (see api/subscribe.js), which holds the
// Resend key server-side and adds the checks a bot could otherwise skip.
// Same-origin, so the site's `connect-src 'self'` CSP needs no widening.
//
// Throws with a message meant for the visitor: the endpoint returns a usable
// sentence for every failure it knows about, and this falls back to a generic
// one when the request never arrived at all.
async function submitNewsletterSignup({ name, email, company }) {
  let res;
  try {
    res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, company }),
    });
  } catch {
    throw new Error('Could not reach the server. Please check your connection.');
  }

  let payload = {};
  try {
    payload = await res.json();
  } catch {
    /* a proxy or error page returned something that is not JSON */
  }

  if (!res.ok || !payload.ok) {
    throw new Error(payload.error || 'Something went wrong. Please try again in a moment.');
  }
}

export function Newsletter() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // Honeypot. Real people never see this field, so anything in it is a bot.
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setStatus('error');
      setErrorMessage('Please tell us your name.');
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    try {
      await submitNewsletterSignup({ name: name.trim(), email: email.trim(), company });
      setStatus('success');
      setName('');
      setEmail('');
    } catch (err) {
      setStatus('error');
      // The endpoint's own wording, which is specific to what actually failed.
      setErrorMessage(err.message);
    }
  };

  return (
    <section id="notify-me" className="newsletter">
      <div className="newsletter__panel brand-bg">
        <div className="newsletter__panel-inner">
          <p className="section-eyebrow">Coming Soon</p>
          <h2 className="display-2 on-dark newsletter__headline">
            Be the first to try Lucy&apos;s Gari
          </h2>
          <span className="newsletter__seal" aria-hidden="true">
            <MadeInGhanaSeal size={92} />
          </span>
          <p className="newsletter__subhead">
            Sign up for launch updates. No spam, just word the moment
            it&apos;s ready to ship.
          </p>

          {status === 'success' ? (
            <p className="newsletter__success" role="status">
              You&apos;re on the list! We&apos;ll email you the moment
              Lucy&apos;s Gari launches.
            </p>
          ) : (
            <form className="newsletter__form" onSubmit={handleSubmit} noValidate>
              <div className="newsletter__inputs">
                <label className="visually-hidden" htmlFor="newsletter-name">
                  Name
                </label>
                <input
                  id="newsletter-name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
                <label className="visually-hidden" htmlFor="newsletter-email">
                  Email
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              {/* Not display:none — some bots skip hidden fields. Off-screen,
                  out of the tab order, and hidden from assistive tech, so no
                  real visitor can reach it but a form-filling script will. */}
              <div className="newsletter__hp" aria-hidden="true">
                <label htmlFor="newsletter-company">Company</label>
                <input
                  id="newsletter-company"
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary newsletter__submit"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Signing up…' : 'Notify Me'}
              </button>
              {status === 'error' && (
                <p className="newsletter__error" role="alert">
                  {errorMessage}
                </p>
              )}
              <p className="newsletter__consent">
                We&apos;ll only email you about the launch, and you can
                unsubscribe from any message.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* data-flavor tints the stand-in placeholder golden rather than the
          default beetroot pink, so it sits closer to the coconut pack's
          warm background until the real photo lands. */}
      <div className="newsletter__media" data-flavor="coconut">
        <Photo
          className="newsletter__image"
          src={PACK_IMAGE}
          alt="Lucy's Coconut Gari Mix pack"
          label="Coconut Gari Mix pack, photo coming soon"
          fill
        />
      </div>
    </section>
  );
}
