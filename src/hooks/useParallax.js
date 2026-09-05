import { useEffect, useRef } from 'react';

/**
 * Publishes normalised pointer position on an element as `--px` / `--py`
 * (-1 to 1, eased), plus `--tilt-x` / `--tilt-y` in degrees.
 *
 * Cards use it for depth: the holographic sheen and the card's own transform
 * both track the cursor, which is what sells the "pearlescent surface under a
 * moving light" effect.
 */
export default function useParallax({ strength = 6, disabled = false } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return undefined;

    let frame = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const tick = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      el.style.setProperty('--px', cx.toFixed(4));
      el.style.setProperty('--py', cy.toFixed(4));
      el.style.setProperty('--tilt-x', `${(-cy * strength).toFixed(2)}deg`);
      el.style.setProperty('--tilt-y', `${(cx * strength).toFixed(2)}deg`);

      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
      }
    };

    const start = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      start();
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
      start();
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);

    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [strength, disabled]);

  return ref;
}
