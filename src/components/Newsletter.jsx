import { useState } from 'react';
import './Newsletter.css';

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
      setErrorMessage('Something went wrong — please try again in a moment.');
    }
  };

  return (
    <section id="notify-me" className="section newsletter">
      <div className="container newsletter__inner">
        <p className="section-eyebrow">Coming Soon</p>
        <h2>Be the first to try Lucy&apos;s Gari</h2>
        <p className="newsletter__subhead">
          Sign up for launch updates — no spam, just word the moment it&apos;s
          ready to ship.
        </p>

        {status === 'success' ? (
          <p className="newsletter__success" role="status">
            You&apos;re on the list! We&apos;ll email you the moment Lucy&apos;s
            Gari launches.
          </p>
        ) : (
          <form className="newsletter__form" onSubmit={handleSubmit} noValidate>
            <div className="newsletter__fields">
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
              <button
                type="submit"
                className="btn btn-primary"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Signing up…' : 'Notify Me'}
              </button>
            </div>
            {status === 'error' && (
              <p className="newsletter__error" role="alert">
                {errorMessage}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
