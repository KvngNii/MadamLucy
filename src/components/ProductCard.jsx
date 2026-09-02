import './ProductCard.css';
import { PlaceholderBlock } from './PlaceholderBlock.jsx';

export function ProductCard({ flavor }) {
  return (
    <article className="product-card" data-flavor={flavor.id}>
      <PlaceholderBlock
        label={`${flavor.productName} pack — photo coming soon`}
        aspect="1 / 1"
        icon="🥤"
        className="product-card__image"
      />
      <div className="product-card__body">
        <p className="product-card__tagline">{flavor.productTagline}</p>
        <h3>{flavor.productName}</h3>
        <p className="product-card__blurb">{flavor.productBlurb}</p>
      </div>
    </article>
  );
}
