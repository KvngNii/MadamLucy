import './UnwrapSection.css';

const ICONS = [
  { icon: '🫚', label: 'Ginger' },
  { icon: '🟣', label: 'Beetroot' },
  { icon: '🟡', label: 'Turmeric' },
];

export function UnwrapSection() {
  return (
    <section className="section section--tight unwrap">
      <div className="container unwrap__inner">
        <h2 className="display-2 unwrap__headline">Unwrap the Goodness</h2>
        <div className="unwrap__icons">
          {ICONS.map((item) => (
            <span className="unwrap__icon-circle" key={item.label} title={item.label}>
              <span aria-hidden="true">{item.icon}</span>
            </span>
          ))}
        </div>
        <p className="unwrap__body">
          Tear open a sachet of Lucy&apos;s Gari and you&apos;re met with
          vivid color and bold aroma — earthy beetroot, warm ginger, golden
          turmeric. Rich, fragrant, and ready to transform any meal.
        </p>
      </div>
    </section>
  );
}
