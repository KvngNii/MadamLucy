import './TraditionSection.css';
import { PlaceholderBlock } from './PlaceholderBlock.jsx';

const STEPS = [
  {
    number: '01',
    caption: 'Rooted in over a decade of Ghanaian gari-making tradition',
  },
  {
    number: '02',
    caption: "Cultivated and harvested on Lucy's own farm in the Eastern Region",
  },
  {
    number: '03',
    caption: 'Hand-fermented, roasted, and infused with real superfoods',
  },
];

const WHY_CARDS = [
  {
    icon: '🌱',
    title: 'Farm-to-Table Freshness',
    body: 'Hand-processed with care, from Lucy’s own cassava farm straight to your sachet.',
  },
  {
    icon: '❤️',
    title: 'Made with Your Health in Mind',
    body: 'Every flavor is built around a real superfood, chosen for its nutrients, not just its color.',
  },
  {
    icon: '🍃',
    title: '100% Natural & Locally Sourced',
    body: 'No artificial preservatives, no shortcuts — just cassava, superfoods, and time.',
  },
];

const TAGS = ['farm fresh', 'hand roasted', 'superfood-infused'];

export function TraditionSection() {
  return (
    <section id="tradition" className="tradition grain-overlay">
      <div className="container">
        <h2 className="display-2 on-dark tradition__headline">
          Tradition
          <br />
          &amp; Creation
        </h2>
        <p className="tradition__intro on-dark">
          From handpicked superfoods to small-batch roasting, every sachet
          carries the real taste of tradition.
        </p>

        <div className="tradition__grid">
          {STEPS.map((step) => (
            <div className="tradition__item" key={step.number}>
              <div className="tradition__number">{step.number}</div>
              <p className="tradition__caption on-dark">{step.caption}</p>
              <PlaceholderBlock
                label="Photo coming soon"
                aspect="4 / 3"
                icon="📷"
                className="tradition__photo"
              />
            </div>
          ))}
        </div>
      </div>

      <div id="why-us" className="container tradition__why">
        <div className="tradition__why-head">
          <h2 className="display-2 on-dark">
            Why It
            <br />
            Matters
          </h2>
          <p className="tradition__why-copy on-dark">
            The sealed sachet keeps every batch fresh and ready to use,
            whenever you need it.
          </p>
          <div className="tradition__tags">
            {TAGS.map((tag) => (
              <span className="tradition__tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="tradition__why-grid">
          {WHY_CARDS.map((card) => (
            <div className="tradition__why-card" key={card.title}>
              <span className="tradition__why-icon" aria-hidden="true">
                {card.icon}
              </span>
              <h3 className="on-dark">{card.title}</h3>
              <p className="on-dark">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
