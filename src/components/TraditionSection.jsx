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
    number: '01',
    title: 'She grows the cassava',
    body: "Every sachet starts on Lucy's own farm in the Eastern Region.",
  },
  {
    number: '02',
    title: 'Fermented and roasted by hand',
    body: 'Small batches, turned by hand, the way she has done it for over ten years.',
  },
  {
    number: '03',
    title: 'One superfood per flavor',
    body: 'Beetroot paste, ginger, turmeric. Nothing else goes in.',
  },
];

const TAGS = ['no preservatives', 'nothing artificial', 'made in ghana'];

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
                className="tradition__photo"
              />
            </div>
          ))}
        </div>
      </div>

      <div id="why-us" className="container tradition__why">
        <div className="tradition__why-head">
          <h2 className="display-2 on-dark">
            How She
            <br />
            Makes It
          </h2>
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
              <span className="tradition__why-number" aria-hidden="true">
                {card.number}
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
