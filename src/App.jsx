import { FlavorProvider } from './context/FlavorContext.jsx';
import { useLenisScroll } from './hooks/useLenisScroll.js';
import { Nav } from './components/Nav.jsx';
import { HeroStory } from './components/HeroStory.jsx';
import { Flavors } from './components/Flavors.jsx';
import { MeetLucy } from './components/MeetLucy.jsx';
import { TraditionSection } from './components/TraditionSection.jsx';
import { FullBleedCTA } from './components/FullBleedCTA.jsx';
import { Recipes } from './components/Recipes.jsx';
import { TrustStrip } from './components/TrustStrip.jsx';
import { Newsletter } from './components/Newsletter.jsx';
import { Footer } from './components/Footer.jsx';
import { FloatingIcons } from './components/FloatingIcons.jsx';

function LenisRoot() {
  useLenisScroll();
  return null;
}

export default function App() {
  return (
    <FlavorProvider>
      <LenisRoot />
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Nav />
      <main id="main-content">
        {/* Pinned pour story (hero + angle + unwrap + pour panels), then
            Flavors curtains up over its frozen last frame. */}
        <HeroStory />
        <Flavors />
        <MeetLucy />
        <TraditionSection />
        <FullBleedCTA />
        <Recipes />
        <TrustStrip />
        <Newsletter />
      </main>
      <Footer />
      <FloatingIcons />
    </FlavorProvider>
  );
}
