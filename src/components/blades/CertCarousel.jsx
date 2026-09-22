import { useEffect, useState } from 'react';
import Icon from '../Icon';
import { Card, Row } from './Parts';
import useReducedMotion from '../../hooks/useReducedMotion';
import { certificates } from '../../data/content';

const DWELL = 4200;

/**
 * Several certificates in one slot, advancing on their own.
 *
 * The strip slides one frame every DWELL ms; the active dot fills over that
 * same span so the timing is visible. Hovering or focusing anything inside
 * holds it still, and a manual step restarts the clock. With reduced motion
 * it never advances by itself.
 */
export default function CertCarousel({ ids }) {
  const items = ids.map((id) => ({ id, ...certificates[id] }));
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const reduced = useReducedMotion();
  const auto = !reduced && items.length > 1;

  useEffect(() => {
    if (!auto || held) return undefined;
    const id = setTimeout(() => setIndex((n) => (n + 1) % items.length), DWELL);
    return () => clearTimeout(id);
  }, [auto, held, index, items.length]);

  const go = (n) => setIndex((n + items.length) % items.length);
  const current = items[index];

  return (
    <div
      className="ccar"
      role="group"
      aria-roledescription="carousel"
      aria-label={`${items.length} certificates`}
      data-held={held || undefined}
      style={{ '--dwell': `${DWELL}ms` }}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHeld(false)}
    >
      <div className="ccar__viewport">
        <div className="ccar__track" style={{ '--i': index }}>
          {items.map((c, n) => (
            <a
              key={c.id}
              className="certframe ccar__slide"
              href={c.file}
              target="_blank"
              rel="noreferrer"
              aria-hidden={n !== index}
              tabIndex={n === index ? 0 : -1}
            >
              <img src={c.thumb} alt={`${c.kind} — ${c.title}`} loading="lazy" />
              <span className="certframe__glare" aria-hidden="true" />
              <span className="certframe__open mono">
                <Icon name="play" size={12} /> Open full size
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="ccar__bar">
        <button type="button" className="ccar__step" onClick={() => go(index - 1)} aria-label="Previous">
          <Icon name="arrowLeft" size={14} strokeWidth={2} />
        </button>

        <div className="ccar__dots">
          {items.map((c, n) => (
            <button
              key={c.id}
              type="button"
              className="ccar__dot"
              data-active={n === index || undefined}
              onClick={() => go(n)}
              aria-label={`Show ${c.title}, ${c.dateLabel}`}
              aria-current={n === index || undefined}
            >
              {/* Keyed on index so the fill restarts with every frame. */}
              {n === index && auto && <i key={index} />}
            </button>
          ))}
        </div>

        <button type="button" className="ccar__step" onClick={() => go(index + 1)} aria-label="Next">
          <Icon name="arrowRight" size={14} strokeWidth={2} />
        </button>
      </div>

      <Card tilt={false} aria-live="polite">
        <p className="node__value">{current.title}</p>
        <Row label="Type" value={current.kind} />
        <Row label="Issued by" value={current.issuer} />
        <Row label="Date" value={current.dateLabel} />
        <p className="bsection__note">{current.note}</p>
      </Card>
    </div>
  );
}
