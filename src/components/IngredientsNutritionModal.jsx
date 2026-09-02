import { useEffect, useRef, useState } from 'react';
import './IngredientsNutritionModal.css';
import { useFlavor } from '../context/FlavorContext.jsx';

export function IngredientsNutritionModal({ onClose }) {
  const { flavors, activeFlavorId, activeFlavor, setActiveFlavorId } =
    useFlavor();
  const [tab, setTab] = useState('ingredients');
  const closeButtonRef = useRef(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div
      className="ingredients-modal__overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="ingredients-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ingredients-modal-title"
        data-flavor={activeFlavorId}
      >
        <button
          type="button"
          className="ingredients-modal__close"
          onClick={onClose}
          ref={closeButtonRef}
          aria-label="Close"
        >
          ✕
        </button>

        <h2 id="ingredients-modal-title" className="ingredients-modal__title">
          what makes
          <br />
          it better
        </h2>

        <div className="ingredients-modal__flavor-tabs" role="tablist" aria-label="Flavor">
          {flavors.map((flavor) => (
            <button
              key={flavor.id}
              type="button"
              role="tab"
              aria-selected={flavor.id === activeFlavorId}
              className={`ingredients-modal__flavor-tab${
                flavor.id === activeFlavorId ? ' is-active' : ''
              }`}
              onClick={() => setActiveFlavorId(flavor.id)}
            >
              {flavor.label}
            </button>
          ))}
        </div>

        <div className="ingredients-modal__tabs">
          <button
            type="button"
            className={`ingredients-modal__tab${tab === 'ingredients' ? ' is-active' : ''}`}
            onClick={() => setTab('ingredients')}
          >
            ingredients
          </button>
          <button
            type="button"
            className={`ingredients-modal__tab${tab === 'nutrition' ? ' is-active' : ''}`}
            onClick={() => setTab('nutrition')}
          >
            nutrition facts
          </button>
        </div>

        {tab === 'ingredients' ? (
          <div>
            <p className="ingredients-modal__desc">
              Nothing to hide — just real cassava and one real superfood per
              flavor.
            </p>
            <ul className="ingredients-modal__list">
              {activeFlavor.ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>
            {!activeFlavor.ingredientsConfirmed && (
              <p className="ingredients-modal__note">
                Exact wording pending confirmation for this flavor.
              </p>
            )}
          </div>
        ) : (
          <div className="ingredients-modal__nutrition-pending">
            <p>
              <strong>Nutrition facts panel — pending lab analysis.</strong>
            </p>
            <p>
              We&apos;ll publish exact per-serving values here once official
              lab testing is complete, ahead of launch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
