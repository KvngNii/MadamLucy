// Central flavor registry. Every themed section (products grid, What's
// Inside, the ingredients modal) reads from this single source so
// adjusting a flavor never requires touching layout code. `image`/`alt`
// are optional: a flavor without a pack shot yet falls back to a labeled
// placeholder in the same box. There is one
// pour clip for the whole site (see HeroStory), not one per flavor.
export const flavors = [
  {
    id: 'beetroot',
    image: '/assets/flavor-beetroot.webp',
    alt: 'A pouch of Lucy’s Beetroot Gari Mix on a wooden table, beside whole beetroot and fresh cassava',
    label: 'Beetroot',
    productName: 'Beetroot Gari Mix',
    productTagline: 'Purple Vitality',
    productBlurb:
      'Beet the ordinary with rich, earthy sweetness and a pop of purple!',
    ingredients: ['Cassava dough', 'Beetroot paste'],
  },
  {
    id: 'ginger',
    image: '/assets/flavor-ginger.webp',
    alt: 'A pouch of Lucy’s Ginger Gari Mix on a wooden table, beside fresh ginger root and cassava',
    label: 'Ginger',
    productName: 'Ginger Gari Mix',
    productTagline: 'Spicy Warmth',
    productBlurb: 'Peppery, zesty and ready to spice up your life!',
    ingredients: ['Cassava dough', 'Ginger powder'],
  },
  {
    id: 'turmeric',
    image: '/assets/flavor-turmeric.webp',
    alt: 'A pouch of Lucy’s Turmeric Gari Mix on a wooden table, beside fresh turmeric and cassava',
    label: 'Turmeric',
    productName: 'Turmeric Gari Mix',
    productTagline: 'Golden Goodness',
    productBlurb:
      "Deep, rich flavor and a hint of spice. There's sunshine in every bite!",
    ingredients: ['Cassava dough', 'Turmeric powder'],
  },
  {
    id: 'coconut',
    image: '/assets/flavor-coconut.webp',
    alt: 'A pouch of Lucy’s Coconut Gari Mix on a wooden table, beside fresh coconut and cassava',
    label: 'Coconut',
    productName: 'Coconut Gari Mix',
    productTagline: 'Creamy Richness',
    productBlurb: 'Creamy and coconutty, taste the magic in the crunch!',
    ingredients: ['Cassava dough', 'Coconut'],
  },
  {
    id: 'garlic',
    label: 'Garlic',
    productName: 'Garlic Gari Mix',
    productTagline: 'Aromatic Strength',
    productBlurb:
      'Savory, rich with garlicky goodness. This gari is anything but average!',
    ingredients: ['Cassava dough', 'Garlic powder'],
  },
];

export const getFlavor = (id) => flavors.find((f) => f.id === id) ?? flavors[0];

// Coconut leads: it's the pack in the hero's pour clip.
export const DEFAULT_FLAVOR_ID = 'coconut';
