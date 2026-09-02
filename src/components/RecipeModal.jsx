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

        <span className="recipe-modal__tag">recipe</span>
        <h2 id="recipe-modal-title">{recipe.title}</h2>
        <p className="recipe-modal__teaser">{recipe.teaser}</p>

        <div className="recipe-modal__breakdown">
          <div>
            <span className="recipe-modal__breakdown-label">prep time</span>
            <span className="recipe-modal__breakdown-value">{recipe.prep}</span>
          </div>
          <div>
            <span className="recipe-modal__breakdown-label">cook time</span>
            <span className="recipe-modal__breakdown-value">{recipe.cook}</span>
          </div>
          <div>
            <span className="recipe-modal__breakdown-label">serves</span>
            <span className="recipe-modal__breakdown-value">{recipe.serves}</span>
          </div>
          <div>
            <span className="recipe-modal__breakdown-label">total</span>
            <span className="recipe-modal__breakdown-value">{recipe.total}</span>
          </div>
        </div>

        <h3>Ingredients</h3>
        <ul className="recipe-modal__ingredients">
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient}>{ingredient}</li>
          ))}
        </ul>

        {recipe.tip && (
          <div className="recipe-modal__tip">
            <span aria-hidden="true">💡</span>
            <p>{recipe.tip}</p>
          </div>
        )}

        <div className="dotted-line recipe-modal__divider" />

        <h3>Instructions</h3>
        <ol className="recipe-modal__steps">
          {recipe.steps.map((step, i) => (
            <li key={step.title}>
              <span className="recipe-modal__step-number">{i + 1}</span>
              <span>
                <span className="recipe-modal__step-title">{step.title}</span>
                <span className="recipe-modal__step-desc">{step.desc}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
