import { FlavorProvider } from './context/FlavorContext.jsx';
import { Nav } from './components/Nav.jsx';
import { Hero } from './components/Hero.jsx';
import { MeetLucy } from './components/MeetLucy.jsx';
import { WhatWeDo } from './components/WhatWeDo.jsx';
import { IngredientsDrawer } from './components/IngredientsDrawer.jsx';
import { WhyChooseUs } from './components/WhyChooseUs.jsx';
import { Products } from './components/Products.jsx';
import { Recipes } from './components/Recipes.jsx';
import { TrustStrip } from './components/TrustStrip.jsx';
import { Newsletter } from './components/Newsletter.jsx';
import { Footer } from './components/Footer.jsx';

export default function App() {
  return (
    <FlavorProvider>
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Nav />
      <main id="main-content">
        <Hero />
        <MeetLucy />
        <WhatWeDo />
        <IngredientsDrawer />
        <WhyChooseUs />
        <Products />
        <Recipes />
        <TrustStrip />
        <Newsletter />
      </main>
      <Footer />
    </FlavorProvider>
  );
}
