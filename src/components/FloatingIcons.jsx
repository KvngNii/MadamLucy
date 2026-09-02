import { useState } from 'react';
import './FloatingIcons.css';
import { IngredientsNutritionModal } from './IngredientsNutritionModal.jsx';
import { scrollToEl } from '../lib/lenis.js';

export function FloatingIcons() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="floating-icons">
        <button
          type="button"
          className="floating-icons__btn"
          onClick={() => setModalOpen(true)}
          aria-haspopup="dialog"
          aria-label="View ingredients and nutrition facts"
          title="Ingredients & Nutrition"
        >
          🌿
        </button>
        <button
          type="button"
          className="floating-icons__btn floating-icons__btn--primary"
          onClick={() => {
            const target = document.getElementById('notify-me');
            if (target) scrollToEl(target);
          }}
          aria-label="Jump to Notify Me signup"
          title="Notify Me"
        >
          🔔
        </button>
      </div>

      {modalOpen && (
        <IngredientsNutritionModal onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
