import { useState } from 'react';
import './Recipes.css';
import { recipes } from '../data/recipes.js';
import { RecipeModal } from './RecipeModal.jsx';
import { Photo } from './Photo.jsx';

export function Recipes() {
  const [activeRecipeId, setActiveRecipeId] = useState(null);
  const activeRecipe = recipes.find((r) => r.id === activeRecipeId) ?? null;

  return (
    <section id="recipes" className="section recipes">
      <div className="container">
        <p className="section-eyebrow">How to Enjoy It</p>
        <h2>Three ways to eat Lucy&apos;s gari</h2>
        <div className="recipes__grid">
          {recipes.map((recipe) => (
            <button
              key={recipe.id}
              type="button"
              className="recipe-card"
              onClick={() => setActiveRecipeId(recipe.id)}
            >
              {/* 4/3 is the shots' own aspect, so nothing is cropped away and
                  all three cards occupy the same footprint. */}
              <div className="recipe-card__media">
                <Photo
                  src={recipe.image}
                  alt={recipe.alt}
                  label={`${recipe.title}, photo coming soon`}
                  aspect="4 / 3"
                  className="recipe-card__img"
                />
              </div>
              {/* The padding lives here, not on the card, so the photo can sit
                  flush against the card's rounded top corners. */}
              <div className="recipe-card__body">
                <div className="recipe-card__tags">
                  <span className="recipe-card__tag">recipe</span>
                  <span className="recipe-card__tag">{recipe.total}</span>
                </div>
                <h3>{recipe.title}</h3>
                <p>{recipe.teaser}</p>
                <span className="recipe-card__cta">View recipe →</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeRecipe && (
        <RecipeModal
          recipe={activeRecipe}
          onClose={() => setActiveRecipeId(null)}
        />
      )}
    </section>
  );
}
