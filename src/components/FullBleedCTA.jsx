import './FullBleedCTA.css';

export function FullBleedCTA() {
  return (
    <section className="fullbleed-cta grain-overlay brand-bg">
      {/* A real <img> rather than a CSS background so the browser can defer
          it — this band sits well below the fold. alt="" because the photo is
          decoration behind the headline, not content of its own. */}
      <img
        className="fullbleed-cta__photo"
        src="/assets/unlock.webp"
        alt=""
        loading="lazy"
        aria-hidden="true"
      />
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
    </section>
  );
}
