import './IngredientsDrawer.css';
import { useFlavor } from '../context/FlavorContext.jsx';
import { MadeInGhanaSeal } from './MadeInGhanaSeal.jsx';

export function IngredientsDrawer() {
  const { flavors, activeFlavorId, activeFlavor, setActiveFlavorId } =
    useFlavor();

  return (
    <section
      id="ingredients"
      className="section ingredients"
      data-flavor={activeFlavorId}
    >
      <div className="container ingredients__inner">
        <div className="ingredients__content">
          <p className="section-eyebrow">Ingredients &amp; Nutrition</p>
          <h2>What&apos;s actually in it</h2>

          <div className="ingredients__tabs" role="tablist" aria-label="Flavor ingredients">
            {flavors.map((flavor) => (
              <button
                key={flavor.id}
                type="button"
                role="tab"
                aria-selected={flavor.id === activeFlavorId}
                className={`ingredients__tab${
                  flavor.id === activeFlavorId ? ' is-active' : ''
                }`}
                onClick={() => setActiveFlavorId(flavor.id)}
              >
                {flavor.label}
              </button>
            ))}
          </div>

          <div className="ingredients__panel" role="tabpanel">
            <ul className="ingredients__list">
              {activeFlavor.ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>
            {!activeFlavor.ingredientsConfirmed && (
              <p className="ingredients__note">
                Exact wording pending confirmation — shown here following the
                established cassava-dough-plus-flavor pattern.
              </p>
            )}
          </div>
        </div>

        <div className="ingredients__seal">
          <MadeInGhanaSeal size={140} />
        </div>
      </div>
    </section>
  );
}
