// Central flavor registry. Every themed section (products grid, What's
// Inside, the ingredients modal) reads from this single source so
// adjusting a flavor never requires touching layout code. There is one
// pour clip for the whole site (see HeroStory), not one per flavor.
export const flavors = [
  {
    id: 'beetroot',
    label: 'Beetroot',
    productName: 'Beetroot Gari Mix',
    productTagline: 'Purple Vitality',
    productBlurb:
      'Beet the ordinary with rich, earthy sweetness and a pop of purple!',
    ingredients: ['Cassava dough', 'Beetroot paste'],
    ingredientsConfirmed: true,
  },
  {
    id: 'ginger',
    label: 'Ginger',
    productName: 'Ginger Gari Mix',
    productTagline: 'Spicy Warmth',
    productBlurb: 'Peppery, zesty and ready to spice up your life!',
    ingredients: ['Cassava dough', 'Ginger powder'],
    ingredientsConfirmed: true,
  },
  {
    id: 'turmeric',
    label: 'Turmeric',
    productName: 'Turmeric Gari Mix',
    productTagline: 'Golden Goodness',
    productBlurb:
      "Deep, rich flavor and a hint of spice. There's sunshine in every bite!",
    ingredients: ['Cassava dough', 'Turmeric powder'],
    ingredientsConfirmed: true,
  },
  {
    id: 'coconut',
    label: 'Coconut',
    productName: 'Coconut Gari Mix',
    productTagline: 'Creamy Richness',
    productBlurb: 'Creamy and coconutty, taste the magic in the crunch!',
    ingredients: ['Cassava dough', 'Coconut'],
    ingredientsConfirmed: false,
  },
  {
    id: 'garlic',
    label: 'Garlic',
    productName: 'Garlic Gari Mix',
    productTagline: 'Aromatic Strength',
    productBlurb:
      'Savory, rich with garlicky goodness. This gari is anything but average!',
    ingredients: ['Cassava dough', 'Garlic powder'],
    ingredientsConfirmed: false,
  },
];

export const getFlavor = (id) => flavors.find((f) => f.id === id) ?? flavors[0];

// Coconut leads: it's the pack in the hero's pour clip.
export const DEFAULT_FLAVOR_ID = 'coconut';
