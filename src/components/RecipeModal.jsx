import { useEffect, useRef } from 'react';
import './RecipeModal.css';

export function RecipeModal({ recipe, onClose }) {
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
      className="recipe-modal__overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="recipe-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-modal-title"
      >
        <button
          type="button"
          className="recipe-modal__close"
          onClick={onClose}
          ref={closeButtonRef}
          aria-label="Close recipe"
        >
          ✕
        </button>

        <h2 id="recipe-modal-title">{recipe.title}</h2>
        <p className="recipe-modal__teaser">{recipe.teaser}</p>

        <h3>Ingredients</h3>
        <ul className="recipe-modal__ingredients">
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient}>{ingredient}</li>
          ))}
        </ul>

        <h3>Steps</h3>
        <ol className="recipe-modal__steps">
          {recipe.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
