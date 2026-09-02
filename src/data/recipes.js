// Structured as data so new recipes can be added without touching the
// Recipes/RecipeModal components. prep/cook/serves/total are reasonable
// editorial time estimates based on the steps below — not lab-measured
// nutrition data, so there's no fabrication risk in stating them.
export const recipes = [
  {
    id: 'gari-soakings',
    title: 'Gari Soakings',
    teaser: 'A quick, refreshing snack or breakfast option.',
    prep: '5 min',
    cook: '—',
    serves: '1',
    total: '5 min',
    tip: 'Chill the water or milk beforehand for the most refreshing texture.',
    ingredients: [
      "Lucy's Gari Mix (any flavor)",
      'Cold water or milk',
      'Peanuts or fruit for topping',
    ],
    steps: [
      { title: 'Measure the gari', desc: 'Add 2-3 tbsp gari mix to a bowl.' },
      {
        title: 'Soak',
        desc: 'Pour cold water or milk over it until fully soaked.',
      },
      {
        title: 'Sweeten',
        desc: 'Sweeten with sugar or honey if desired.',
      },
      {
        title: 'Top it off',
        desc: 'Top with peanuts or fruit for extra flavor and crunch.',
      },
      { title: 'Enjoy', desc: 'Stir and enjoy.' },
    ],
  },
  {
    id: 'eba',
    title: 'Ɛba',
    teaser: 'A hearty swallow dish perfect for lunch or dinner.',
    prep: '5 min',
    cook: '10 min',
    serves: '2',
    total: '15 min',
    tip: 'Stir continuously while adding gari to avoid lumps — a smooth ball is the goal.',
    ingredients: [
      "Lucy's Gari Mix (any flavor)",
      'Water',
      'Soup or stew of choice',
    ],
    steps: [
      { title: 'Boil the water', desc: 'Boil water and pour into a bowl.' },
      {
        title: 'Form the dough',
        desc: 'Gradually add gari while stirring until it forms a smooth, dough-like consistency.',
      },
      {
        title: 'Shape & serve',
        desc: 'Mold into balls and serve as a side with your favorite soup or stew.',
      },
      {
        title: 'Pair it',
        desc: 'Pair with a protein like fish, meat, or beans for a complete meal.',
      },
    ],
  },
  {
    id: 'gari-foto',
    title: 'Gari Fɔtɔ',
    teaser: "A spicy, flavorful dish that's quick to prepare.",
    prep: '10 min',
    cook: '10 min',
    serves: '2',
    total: '20 min',
    tip: 'Use day-old gari mix for a firmer texture that holds its shape.',
    ingredients: [
      "Lucy's Gari Mix (any flavor)",
      'Fresh vegetables (onions, bell peppers, cabbage, or any of choice)',
      'A protein of choice (chicken, smoked fish, minced beef)',
      'Stew or pepper sauce (shito)',
      'Oil (optional)',
    ],
    steps: [
      {
        title: 'Mix the base',
        desc: 'Mix gari (wet or dry) with a generous amount of stew or pepper sauce.',
      },
      {
        title: 'Prep the veggies',
        desc: 'Chop vegetables and sauté them.',
      },
      {
        title: 'Combine',
        desc: 'Add the veggies to the gari mixture.',
      },
      { title: 'Add protein', desc: 'Add your choice of protein.' },
      { title: 'Serve', desc: 'Serve.' },
    ],
  },
];
