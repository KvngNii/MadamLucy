import './Products.css';
import { useFlavor } from '../context/FlavorContext.jsx';
import { ProductCard } from './ProductCard.jsx';

export function Products() {
  const { flavors } = useFlavor();

  return (
    <section id="flavors" className="section products">
      <div className="container">
        <p className="section-eyebrow">Our Products</p>
        <h2>Five flavors, one better gari</h2>
        <div className="products__grid">
          {flavors.map((flavor) => (
            <ProductCard key={flavor.id} flavor={flavor} />
          ))}
        </div>
      </div>
    </section>
  );
}
