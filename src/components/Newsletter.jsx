import { useState } from 'react';
import './Newsletter.css';
import { PlaceholderBlock } from './PlaceholderBlock.jsx';
import { MadeInGhanaSeal } from './MadeInGhanaSeal.jsx';

// Product shot for the right-hand panel. Drop the file in at this path and
// it appears; until then the onError below degrades to a labeled
// placeholder rather than a broken image.
const PACK_IMAGE = '/assets/product-coconut.jpg';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// No backend yet — this is the single place to wire a real endpoint later
// (Mailchimp, Formspree, Netlify Forms, a custom API route, etc.). For now
// it simulates a network call and logs the payload.
async function submitNewsletterSignup({ name, email }) {
  console.info('[newsletter] signup captured (stub):', { name, email });
  await new Promise((resolve) => setTimeout(resolve, 400));
}

export function Newsletter() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const [imageFailed, setImageFailed] = useState(false);

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
      await submitNewsletterSignup({ name: name.trim(), email: email.trim() });
      setStatus('success');
      setName('');
      setEmail('');
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again in a moment.');
    }
  };

  return (
    <section id="notify-me" className="newsletter">
      <div className="newsletter__panel">
        <div className="newsletter__panel-inner">
          <p className="section-eyebrow">Coming Soon</p>
          <h2 className="display-2 on-dark newsletter__headline">
            Be the first to try Lucy&apos;s Gari
          </h2>
          <div className="dotted-line newsletter__rule" />
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
            </form>
          )}
        </div>
      </div>

      {/* data-flavor tints the stand-in placeholder golden rather than the
          default beetroot pink, so it sits closer to the coconut pack's
          warm background until the real photo lands. */}
      <div className="newsletter__media" data-flavor="coconut">
        {imageFailed ? (
          <PlaceholderBlock
            label="Coconut Gari Mix pack, photo coming soon"
            icon="📸"
            fill
          />
        ) : (
          <img
            className="newsletter__image"
            src={PACK_IMAGE}
            alt="Lucy's Coconut Gari Mix pack"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>
    </section>
  );
}
