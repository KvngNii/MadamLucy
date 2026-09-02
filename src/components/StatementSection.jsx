import { useRef } from 'react';
import './StatementSection.css';
import { ScrollHighlightText } from './ScrollHighlightText.jsx';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { useScrollHighlightText } from '../hooks/useScrollHighlightText.js';

export function StatementSection() {
  const headlineRef = useRef(null);
  const reducedMotion = useReducedMotion();
  useScrollHighlightText(headlineRef, { reducedMotion });

  return (
    <section className="section section--tight statement">
      <div className="container statement__inner">
        <ScrollHighlightText
          ref={headlineRef}
          as="h2"
          text="A Bolder Kind of Gari"
          className="display-2 statement__headline"
        />
        <p className="statement__body">
          More than just food packed with carbs — a healthier, more
          flavorful experience, infused with powerful superfoods chosen for
          their health-boosting properties, rich nutrients, and unique
          taste.
        </p>
      </div>
    </section>
  );
}
