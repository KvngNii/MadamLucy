import { useRef } from 'react';
import './MeetLucy.css';
import { ScrollHighlightText } from './ScrollHighlightText.jsx';
import { PlaceholderBlock } from './PlaceholderBlock.jsx';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { useScrollHighlightText } from '../hooks/useScrollHighlightText.js';

const BIO =
  "Lucy is a visionary entrepreneur, dedicated farmer, and skilled gari maker with over a decade of experience. She cultivates her own cassava on her farm in the Eastern Region of Ghana and is involved in every stage of the process, from harvesting to fermentation and roasting. Recognizing the Ghanaian perception that gari is overly starchy, she took a bold step: infusing it with superfoods, redefining gari as colorful, flavorful, and packed with health benefits.";

export function MeetLucy() {
  const textRef = useRef(null);
  const reducedMotion = useReducedMotion();
  useScrollHighlightText(textRef, { reducedMotion });

  return (
    <section id="about-lucy" className="section meet-lucy">
      <div className="container meet-lucy__inner">
        <div className="meet-lucy__photo">
          <PlaceholderBlock
            label="Photo of Lucy on her farm — coming soon"
            aspect="4 / 5"
            icon="👩🏾‍🌾"
          />
        </div>
        <div className="meet-lucy__copy">
          <p className="section-eyebrow">Meet Lucy</p>
          <h2>A decade of farming, fermenting, and reimagining gari.</h2>
          <ScrollHighlightText ref={textRef} text={BIO} />
        </div>
      </div>
    </section>
  );
}
