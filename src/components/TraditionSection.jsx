import './TraditionSection.css';
import { Photo } from './Photo.jsx';

// `image`/`alt` are optional: a step without one still renders its labeled
// placeholder, so a photo is a line each when it arrives. Every card crops to
// the same 4/3 box from a differently framed source, so each also names the
// class that positions its crop — see TraditionSection.css.
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
    image: '/assets/tradition-02-cultivated.webp',
    alt: 'A farmer in a green Lucy Perfect shirt and hairnet loading freshly harvested cassava roots into a metal basin at the edge of the farm',
  },
  {
    number: '03',
    caption: 'Hand-fermented, roasted, and infused with real superfoods',
    image: '/assets/tradition-03-hand-fermented.webp',
    alt: 'A woman in a green Lucy Perfect shirt spreading fermented cassava across a wide steel roasting pan set over an open fire',
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
                // Three across above 760px (the grid's auto-fit lands there
                // at a 220px minimum), one across below it.
                sizes="(max-width: 760px) 92vw, 33vw"
                className={`tradition__photo tradition__photo--${step.number}`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
