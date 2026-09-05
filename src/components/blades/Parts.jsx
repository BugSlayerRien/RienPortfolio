import Icon from '../Icon';
import useParallax from '../../hooks/useParallax';
import './blades.css';

/** A titled block inside a blade. Reveals as a unit. */
export function Section({ title, note, children }) {
  return (
    <section className="bsection" data-reveal>
      {(title || note) && (
        <header className="bsection__head">
          {title && <h3 className="bsection__title">{title}</h3>}
          {note && <p className="bsection__note">{note}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

/**
 * Pearlescent card with cursor-tracked depth. The sheen and the tilt both read
 * from the same pointer vector, so the surface behaves like a physical
 * holographic panel catching a light.
 */
export function Card({ children, className = '', tilt = true, ...rest }) {
  const ref = useParallax({ strength: tilt ? 5 : 0, disabled: !tilt });
  return (
    <article
      ref={ref}
      className={`bcard pearl-panel ${tilt ? 'bcard--tilt' : ''} ${className}`}
      data-reveal
      {...rest}
    >
      <span className="bcard__sheen" aria-hidden="true" />
      <div className="bcard__content">{children}</div>
    </article>
  );
}

export function Chips({ items }) {
  return (
    <ul className="chips">
      {items.map((t) => (
        <li key={t} className="chip mono">
          {t}
        </li>
      ))}
    </ul>
  );
}

export function Prose({ children }) {
  return <div className="prose">{children}</div>;
}

/** Label / value row, PSP settings-screen style. */
export function Row({ label, value, icon }) {
  return (
    <div className="row">
      <span className="row__label mono">
        {icon && <Icon name={icon} size={15} />}
        {label}
      </span>
      <span className="row__dots" aria-hidden="true" />
      <span className="row__value">{value}</span>
    </div>
  );
}
