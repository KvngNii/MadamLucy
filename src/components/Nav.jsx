import { useRef, useState } from 'react';
import './Nav.css';
import { LogoMark } from './LogoMark.jsx';
import { useNavOverStory } from '../hooks/useNavOverStory.js';

const LINKS = [
  { href: '#flavors', label: 'Flavors' },
  { href: '#about-lucy', label: 'About Lucy' },
  { href: '#recipes', label: 'Recipes' },
  { href: '#why-us', label: 'Why Us' },
];

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);
  useNavOverStory(navRef);

  return (
    <header className="nav" ref={navRef}>
      <div className="container nav__inner">
        <a href="#top" className="nav__brand">
          <LogoMark variant="light" size={40} />
          <span className="nav__wordmark">Lucy Perfect</span>
        </a>
        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="nav__link">
              {link.label}
            </a>
          ))}
        </nav>
        <a href="#notify-me" className="btn btn-primary nav__cta">
          Notify Me
        </a>
        <button
          type="button"
          className="nav__menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
        </button>
      </div>
      {menuOpen && (
        <nav
          id="mobile-nav-menu"
          className="nav__mobile-menu"
          aria-label="Primary, mobile"
        >
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="nav__mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
