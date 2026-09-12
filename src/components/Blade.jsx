import { useEffect, useRef } from 'react';
import Icon from './Icon';
import useReveal from '../hooks/useReveal';
import useKeyScroll from '../hooks/useKeyScroll';
import './Blade.css';

/**
 * The content panel docked beside the bar.
 *
 * It is not something you open — it simply shows whatever the cursor is
 * sitting on, so moving along the bar is enough to read an item. The bar stays
 * lit and live next to it, which is the point: you can see where you are and
 * what is there at the same time.
 *
 * `reading` is the second gear. Confirming an item dims the bar and hands the
 * panel the keyboard so the arrows scroll the article instead of walking the
 * cursor; Escape gives the bar back.
 *
 * Its body is the one scrolling surface in the app, so this is where the
 * scroll-driven work happens: children marked `data-reveal` rise into place as
 * they enter view, and the panel publishes `--scroll-p` (0 to 1) for the header
 * rule and the ambient tint to track.
 */
export default function Blade({ open, reading, category, title, subtitle, onClose, children }) {
  const bodyRef = useReveal([title]);
  const panelRef = useRef(null);

  // The body is an inner scroll box that never takes focus, so the browser
  // will not scroll it from the keyboard on its own. Only bind the keys while
  // reading — otherwise the panel would swallow the arrows that drive the bar.
  useKeyScroll(bodyRef, open && reading);

  // A new item starts at the top; the previous one may have been scrolled deep.
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [bodyRef, title]);

  // Focus follows the gear: into the panel to read, back out to the bar.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (reading) panel.focus({ preventScroll: true });
    else if (document.activeElement === panel) panel.blur();
  }, [reading]);

  return (
    <div
      className="blade"
      data-open={open || undefined}
      data-reading={reading || undefined}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="blade__scrim"
        onClick={onClose}
        tabIndex={-1}
        aria-label="Back to the bar"
      />

      <section
        className="blade__panel pearl-panel grain"
        ref={panelRef}
        data-scroll-scope=""
        tabIndex={-1}
        role={reading ? 'dialog' : 'region'}
        aria-modal={reading || undefined}
        aria-label={title}
      >
        <span className="blade__edge" aria-hidden="true" />

        <header className="blade__head">
          <div className="blade__head-text">
            <p className="eyebrow">{category}</p>
            <h2 className="blade__title holo-text">{title}</h2>
            {subtitle && <p className="blade__subtitle">{subtitle}</p>}
          </div>

          {reading && (
            <button type="button" className="blade__close" onClick={onClose} aria-label="Back (Esc)">
              <Icon name="close" size={18} />
            </button>
          )}

          <span className="blade__progress" aria-hidden="true" />
        </header>

        <div className="blade__body" ref={bodyRef}>
          <div className="blade__inner">{children}</div>
        </div>
      </section>
    </div>
  );
}
