import './WhyChooseUs.css';

const POINTS = [
  { icon: '🌱', label: 'Farm-to-Table Freshness, Hand-Processed with Care' },
  { icon: '❤️', label: 'Made with Your Health in Mind' },
  { icon: '🍃', label: '100% Natural & Locally Sourced' },
  { icon: '🚫', label: 'No Artificial Preservatives' },
  { icon: '✨', label: 'Flavors That Elevate Every Bite' },
];

export function WhyChooseUs() {
  return (
    <section id="why-us" className="section why-us">
      <div className="container">
        <p className="section-eyebrow">Why Choose Us</p>
        <h2>Five reasons Lucy&apos;s gari is different</h2>
        <div className="why-us__grid">
          {POINTS.map((point) => (
            <div className="why-us__card" key={point.label}>
              <span className="why-us__icon" aria-hidden="true">
                {point.icon}
              </span>
              <p>{point.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
