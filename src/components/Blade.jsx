import { useEffect, useRef } from 'react';
import Icon from './Icon';
import useReveal from '../hooks/useReveal';
import useKeyScroll from '../hooks/useKeyScroll';
import './Blade.css';

/**
 * A content panel launched from the bar.
 *
 * It slides in over the dimmed XMB and takes keyboard focus. Its body is the
 * one scrolling surface in the app, so this is where the scroll-driven work
 * happens: children marked `data-reveal` rise into place as they enter view,
 * and the panel publishes `--scroll-p` (0 to 1) for the header rule and the
 * ambient tint to track.
 */
export default function Blade({ open, category, title, subtitle, onClose, children }) {
  const bodyRef = useReveal([title]);
  const panelRef = useRef(null);

  // The body is an inner scroll box that never takes focus, so the browser
  // will not scroll it from the keyboard on its own.
  useKeyScroll(bodyRef, open);

  // Move focus into the panel so Escape and arrow keys land here.
  useEffect(() => {
    if (open && panelRef.current) panelRef.current.focus({ preventScroll: true });
  }, [open, title]);

  return (
    <div className="blade" data-open={open || undefined} aria-hidden={!open}>
      <button
        type="button"
        className="blade__scrim"
        onClick={onClose}
        tabIndex={-1}
        aria-label="Close panel"
      />

      <section
        className="blade__panel pearl-panel grain"
        ref={panelRef}
        data-scroll-scope=""
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <span className="blade__edge" aria-hidden="true" />

        <header className="blade__head">
          <div className="blade__head-text">
            <p className="eyebrow">{category}</p>
            <h2 className="blade__title holo-text">{title}</h2>
            {subtitle && <p className="blade__subtitle">{subtitle}</p>}
          </div>

          <button type="button" className="blade__close" onClick={onClose} aria-label="Close (Esc)">
            <Icon name="close" size={18} />
          </button>

          <span className="blade__progress" aria-hidden="true" />
        </header>

        <div className="blade__body" ref={bodyRef}>
          <div className="blade__inner">{children}</div>
        </div>
      </section>
    </div>
  );
}
