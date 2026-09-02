import { useState } from 'react';
import './Recipes.css';
import { recipes } from '../data/recipes.js';
import { RecipeModal } from './RecipeModal.jsx';

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
              <div className="recipe-card__tags">
                <span className="recipe-card__tag">recipe</span>
                <span className="recipe-card__tag">{recipe.total}</span>
              </div>
              <span className="recipe-card__icon" aria-hidden="true">
                🍲
              </span>
              <h3>{recipe.title}</h3>
              <p>{recipe.teaser}</p>
              <span className="recipe-card__cta">View recipe →</span>
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
