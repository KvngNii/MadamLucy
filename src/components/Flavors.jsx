import { useRef } from "react";
import "./Flavors.css";
import { useFlavor } from "../context/FlavorContext.jsx";
import { Photo } from "./Photo.jsx";
import { MadeInGhanaSeal } from "./MadeInGhanaSeal.jsx";

// The flavor range and what goes into each one, in one section: they were
// two ("Our Products" and "What's Inside") saying the same thing from
// either end. Picking a tab swaps the whole panel — the pack shot, the
// product copy and the ingredient list — and repaints the section in that
// flavor's accent via data-flavor.

export function Flavors() {
  const { flavors, activeFlavorId, activeFlavor, setActiveFlavorId } =
    useFlavor();
  const tabsRef = useRef(null);

  // Arrow keys move between tabs, the ARIA tabs pattern. Without this the
  // only way through five tabs is a mouse.
  const handleKeyDown = (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[
      e.key
    ];
    if (!step) return;
    e.preventDefault();
    const i = flavors.findIndex((f) => f.id === activeFlavorId);
    const next = flavors[(i + step + flavors.length) % flavors.length];
    setActiveFlavorId(next.id);
    tabsRef.current?.querySelector(`#flavor-tab-${next.id}`)?.focus();
  };

  return (
    <section
      id="flavors"
      className="flavors brand-bg brand-bg--light"
      data-flavor={activeFlavorId}
    >
      {/* The grid lives here, not on the panel below, so the pack shot is a
          sibling of the header and starts level with the "Our Flavors"
          eyebrow. Inside a row beneath the tabs it could never reach that
          high, whatever it was aligned to. */}
      <div className="container flavors__top">
        <div className="flavors__lead">
          <p className="section-eyebrow">Our Flavors</p>
          <h2 className="flavors__heading">Five flavors, one better gari</h2>
          <p className="flavors__desc">
            Every flavor starts the same way: real cassava, farmed and fermented
            by Lucy herself, then infused with a single real superfood.
          </p>

          <div
            className="flavors__tabs"
            role="tablist"
            aria-label="Flavors"
            ref={tabsRef}
            onKeyDown={handleKeyDown}
          >
            {flavors.map((flavor) => {
              const selected = flavor.id === activeFlavorId;
              return (
                <button
                  key={flavor.id}
                  id={`flavor-tab-${flavor.id}`}
                  type="button"
                  role="tab"
                  data-flavor={flavor.id}
                  aria-selected={selected}
                  aria-controls="flavor-panel"
                  tabIndex={selected ? 0 : -1}
                  className={`flavors__tab${selected ? " is-active" : ""}`}
                  onClick={() => setActiveFlavorId(flavor.id)}
                >
                  {flavor.label}
                </button>
              );
            })}
          </div>

          {/* role/id live on the detail now that the wrapper is gone, so the
            tabs' aria-controls still resolves. */}
          <div
            className="flavors__detail"
            id="flavor-panel"
            role="tabpanel"
            aria-labelledby={`flavor-tab-${activeFlavorId}`}
            tabIndex={-1}
          >
            <p className="flavors__tagline">{activeFlavor.productTagline}</p>
            <h3 className="flavors__name">{activeFlavor.productName}</h3>
            <p className="flavors__blurb">{activeFlavor.productBlurb}</p>

            <p className="flavors__label">What&apos;s inside</p>
            <ul className="flavors__list">
              {activeFlavor.ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>

            <div className="flavors__seal">
              <MadeInGhanaSeal size={80} />
            </div>
          </div>
        </div>

        {/* 4/5 is the pack shots' own aspect (1122x1402), so they fill this
            box exactly and every flavor occupies the same footprint. */}
        <div className="flavors__media">
          <Photo
            src={activeFlavor.image}
            alt={activeFlavor.alt}
            label={`${activeFlavor.productName} pack, photo coming soon`}
            aspect="4 / 5"
            className="flavors__pack"
          />
        </div>
      </div>

      <div className="container flavors__statement">
        <div className="flavors__statement-media">
          <Photo
            src="/assets/no-fillers.webp"
            alt="Lucy sitting among freshly harvested cassava, peeling a root by hand"
            label="Lucy's hands, farm-to-sachet, photo coming soon"
            aspect="4 / 5"
            className="flavors__statement-img"
          />
        </div>
        <div className="flavors__statement-copy">
          <p className="flavors__md">No Fillers.</p>
          <p className="flavors__md">No Shortcuts.</p>
          <p className="flavors__bold">
            100% natural, locally sourced, and free of artificial preservatives.
            Real gari, made the hard way.
          </p>
        </div>
      </div>
    </section>
  );
}
