import './TraditionSection.css';
import { Photo } from './Photo.jsx';

// `image`/`alt` are optional: a step without one still renders its labeled
// placeholder, so photos 02 and 03 are a one-line addition each when they
// arrive.
const STEPS = [
  {
    number: '01',
    caption: 'Rooted in over a decade of Ghanaian gari-making tradition',
    image: '/assets/tradition-01-rooted.webp',
    alt: 'Hands turning freshly roasted gari across a wide metal pan set over a wood fire in a traditional clay hearth',
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

export function TraditionSection() {
  return (
    <section id="tradition" className="tradition grain-overlay brand-bg">
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
              <Photo
                src={step.image}
                alt={step.alt}
                label="Photo coming soon"
                aspect="4 / 3"
                className="tradition__photo"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
