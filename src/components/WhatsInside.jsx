import './WhatsInside.css';
import { useFlavor } from '../context/FlavorContext.jsx';
import { PlaceholderBlock } from './PlaceholderBlock.jsx';
import { MadeInGhanaSeal } from './MadeInGhanaSeal.jsx';

export function WhatsInside() {
  const { flavors, activeFlavorId, activeFlavor, setActiveFlavorId } =
    useFlavor();

  return (
    <section id="ingredients" className="whats-inside" data-flavor={activeFlavorId}>
      <div className="container whats-inside__row">
        <div className="whats-inside__side">
          <h3 className="whats-inside__heading">
            what&apos;s
            <br />
            inside
          </h3>
          <div className="dotted-line whats-inside__dotted" />

          <p className="whats-inside__desc">
            Every flavor starts the same way: real cassava, farmed and
            fermented by Lucy herself, then infused with a single real
            superfood.
          </p>

          <div
            className="whats-inside__tabs"
            role="tablist"
            aria-label="Flavor ingredients"
          >
            {flavors.map((flavor) => (
              <button
                key={flavor.id}
                type="button"
                role="tab"
                aria-selected={flavor.id === activeFlavorId}
                className={`whats-inside__tab${
                  flavor.id === activeFlavorId ? ' is-active' : ''
                }`}
                onClick={() => setActiveFlavorId(flavor.id)}
              >
                {flavor.label}
              </button>
            ))}
          </div>

          <ul className="whats-inside__list" role="tabpanel">
            {activeFlavor.ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
          {!activeFlavor.ingredientsConfirmed && (
            <p className="whats-inside__note">
              Exact wording pending confirmation — shown here following the
              established cassava-dough-plus-flavor pattern.
            </p>
          )}

          <div className="whats-inside__seal">
            <MadeInGhanaSeal size={80} />
          </div>
        </div>

        <div className="whats-inside__side">
          <PlaceholderBlock
            label={`${activeFlavor.label} ingredients — photo coming soon`}
            aspect="4 / 5"
            icon="🌾"
          />
        </div>
      </div>

      <div className="container whats-inside__row whats-inside__row--reverse">
        <div className="whats-inside__side">
          <PlaceholderBlock
            label="Lucy's hands, farm-to-sachet — photo coming soon"
            aspect="4 / 5"
            icon="🤲🏾"
          />
        </div>
        <div className="whats-inside__side whats-inside__statement">
          <p className="whats-inside__md">No Fillers.</p>
          <p className="whats-inside__md">No Shortcuts.</p>
          <p className="whats-inside__bold">
            100% natural, locally sourced, and free of artificial
            preservatives — real gari, made the hard way.
          </p>
        </div>
      </div>
    </section>
  );
}
