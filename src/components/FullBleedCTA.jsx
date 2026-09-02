import './FullBleedCTA.css';

export function FullBleedCTA() {
  return (
    <section className="fullbleed-cta grain-overlay">
      <div className="fullbleed-cta__overlay" />
      <div className="container fullbleed-cta__content">
        <h2 className="display-1 on-dark">
          Unlock the
          <br />
          Magic of Gari
        </h2>
        <a href="#notify-me" className="btn btn-primary fullbleed-cta__btn">
          Notify Me at Launch
        </a>
      </div>
      <p className="fullbleed-cta__photo-note">
        Full-bleed lifestyle photography — coming soon
      </p>
    </section>
  );
}
