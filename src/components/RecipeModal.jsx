import { useEffect, useRef } from 'react';
import { useScrollLock } from '../hooks/useScrollLock.js';
import './RecipeModal.css';
import { Icon } from './Icon.jsx';
import { Photo } from './Photo.jsx';

export function RecipeModal({ recipe, onClose }) {
  const closeButtonRef = useRef(null);

  useScrollLock();

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="recipe-modal__overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* data-lenis-prevent is what lets this panel scroll while the page is
          locked. Lenis checks it BEFORE its isStopped branch and returns early,
          so wheel and touch inside here never reach the preventDefault that
          stop() applies to everything else. Without it, stop() freezes the
          modal too — which it did. */}
      <div
        className="recipe-modal"
        data-lenis-prevent
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
          <Icon name="close" size={20} />
        </button>

        <span className="recipe-modal__tag">recipe</span>
        <h2 id="recipe-modal-title">{recipe.title}</h2>
        <p className="recipe-modal__teaser">{recipe.teaser}</p>

        {/* The data has carried `image` since the recipe photos landed; the
            modal simply never showed it. Photo so a missing shot degrades the
            same way it does everywhere else on the site. */}
        <div className="recipe-modal__media">
          <Photo
            src={recipe.image}
            alt={recipe.alt}
            label={`${recipe.title}, photo coming soon`}
            aspect="16 / 9"
            className="recipe-modal__image"
          />
        </div>

        <h3 className="recipe-modal__section-title recipe-modal__section-title--center">
          The Breakdown
        </h3>
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

        <h3 className="recipe-modal__section-title">Ingredients</h3>
        <ul className="recipe-modal__ingredients">
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient}>{ingredient}</li>
          ))}
        </ul>

        {recipe.tip && (
          <div className="recipe-modal__tip">
            <span className="recipe-modal__tip-icon" aria-hidden="true">
              <Icon name="lightbulb" size={20} />
            </span>
            {/* The icon is decorative, so the label it replaces still has to
                exist for anyone not seeing it. */}
            <p>
              <span className="visually-hidden">Tip: </span>
              {recipe.tip}
            </p>
          </div>
        )}

        <div className="recipe-modal__divider" />

        <h3 className="recipe-modal__section-title">Instructions</h3>
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
