import './Footer.css';
import { LogoMark } from './LogoMark.jsx';
import { MadeInGhanaSeal } from './MadeInGhanaSeal.jsx';

const LINKS = [
  { href: '#flavors', label: 'Flavors' },
  { href: '#about-lucy', label: 'About Lucy' },
  { href: '#recipes', label: 'Recipes' },
  { href: '#why-us', label: 'Why Us' },
  { href: '#notify-me', label: 'Notify Me' },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <LogoMark variant="reversed" size={48} />
          <p className="footer__tagline">Gari, but better.</p>
        </div>

        <nav className="footer__links" aria-label="Footer">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="footer__contact">
          <p className="footer__heading">Contact</p>
          <p>
            Instagram:{' '}
            <span className="footer__tbd">handle coming soon</span>
          </p>
          <p>
            Phone: <span className="footer__tbd">TBD — pending confirmation</span>
          </p>
          <p>
            <a href="#" className="footer__legal-link" onClick={(e) => e.preventDefault()}>
              Privacy Policy — coming soon
            </a>
          </p>
          <p>
            <a href="#" className="footer__legal-link" onClick={(e) => e.preventDefault()}>
              Terms of Service — coming soon
            </a>
          </p>
        </div>

        <div className="footer__seal">
          <MadeInGhanaSeal size={90} />
        </div>
      </div>

      <div className="container footer__bottom">
        <p>© {new Date().getFullYear()} Lucy Perfect Enterprise. All rights reserved.</p>
      </div>
    </footer>
  );
}
