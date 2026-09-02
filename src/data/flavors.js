// Central flavor registry — every themed section (hero, product cards,
// ingredients drawer) reads from this single source so adding/adjusting a
// flavor never requires touching layout code.
export const flavors = [
  {
    id: 'beetroot',
    label: 'Beetroot',
    videoSrc: '/assets/pour-beetroot.mp4',
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
    videoSrc: '/assets/pour-ginger.mp4',
    productName: 'Ginger Gari Mix',
    productTagline: 'Spicy Warmth',
    productBlurb: 'Peppery, zesty and ready to spice up your life!',
    ingredients: ['Cassava dough', 'Ginger powder'],
    ingredientsConfirmed: true,
  },
  {
    id: 'turmeric',
    label: 'Turmeric',
    videoSrc: '/assets/pour-turmeric.mp4',
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
    videoSrc: '/assets/pour-coconut.mp4',
    productName: 'Coconut Gari Mix',
    productTagline: 'Creamy Richness',
    productBlurb: 'Creamy and coconutty, taste the magic in the crunch!',
    ingredients: ['Cassava dough', 'Coconut'],
    ingredientsConfirmed: false,
  },
  {
    id: 'garlic',
    label: 'Garlic',
    videoSrc: '/assets/pour-garlic.mp4',
    productName: 'Garlic Gari Mix',
    productTagline: 'Aromatic Strength',
    productBlurb:
      'Savory, rich with garlicky goodness. This gari is anything but average!',
    ingredients: ['Cassava dough', 'Garlic powder'],
    ingredientsConfirmed: false,
  },
];

export const getFlavor = (id) => flavors.find((f) => f.id === id) ?? flavors[0];

export const DEFAULT_FLAVOR_ID = 'beetroot';
