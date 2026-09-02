import { FlavorProvider } from './context/FlavorContext.jsx';
import { useLenisScroll } from './hooks/useLenisScroll.js';
import { Nav } from './components/Nav.jsx';
import { Hero } from './components/Hero.jsx';
import { MeetLucy } from './components/MeetLucy.jsx';
import { StatementSection } from './components/StatementSection.jsx';
import { UnwrapSection } from './components/UnwrapSection.jsx';
import { WhatsInside } from './components/WhatsInside.jsx';
import { TraditionSection } from './components/TraditionSection.jsx';
import { Products } from './components/Products.jsx';
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
        <Hero />
        <MeetLucy />
        <StatementSection />
        <UnwrapSection />
        <WhatsInside />
        <TraditionSection />
        <Products />
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
