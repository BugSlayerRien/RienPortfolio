import { useEffect } from 'react';

const RADIUS = 240; // how close the pointer must get before an element reacts
const PUSH = 46; // furthest an element is shoved, in px
const STIFF = 0.12; // spring pull back to the resting place
const DAMP = 0.78;
const LAG = 0.12; // how lazily the trailing point catches up

/**
 * The start screen's pointer field.
 *
 * Two jobs, one rAF loop. Every element marked `data-repel` is shoved aside as
 * the pointer passes and springs back once it has gone — nothing is displaced
 * permanently. And the pointer position is published on the root as CSS
 * variables, so the background can paint against it without a React render:
 *
 *   --mx / --my   where the pointer is now
 *   --tx / --ty   a trailing point that eases after it
 *   --speed       0 to 1, how fast it is travelling
 *
 * The loop parks itself once everything has settled.
 */
export default function usePointerField(rootRef, { enabled = true } = {}) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return undefined;
    if (window.matchMedia('(hover: none)').matches) return undefined;

    const targets = Array.from(root.querySelectorAll('[data-repel]')).map((el) => ({
      el,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      cx: 0,
      cy: 0,
    }));

    let px = -9999;
    let py = -9999;
    let tx = -9999;
    let ty = -9999;
    let seen = false;
    let raf = 0;

    // Measured from the untransformed box, so a shoved element does not drift.
    const measure = () => {
      targets.forEach((t) => {
        const prev = t.el.style.transform;
        t.el.style.transform = 'none';
        const r = t.el.getBoundingClientRect();
        t.cx = r.left + r.width / 2;
        t.cy = r.top + r.height / 2;
        t.el.style.transform = prev;
      });
    };

    measure();

    const onMove = (e) => {
      px = e.clientX;
      py = e.clientY;
      if (!seen) {
        seen = true;
        tx = px;
        ty = py;
        root.dataset.pointer = 'on';
      }
      if (!raf) raf = requestAnimationFrame(frame);
    };

    // The loop parks itself when everything is still, so leaving the window has
    // to wake it up or the elements stay where they were shoved.
    const onLeave = () => {
      px = -9999;
      py = -9999;
      delete root.dataset.pointer;
      if (!raf) raf = requestAnimationFrame(frame);
    };

    function frame() {
      raf = 0;
      let busy = false;

      if (seen) {
        const dx = px - tx;
        const dy = py - ty;
        tx += dx * LAG;
        ty += dy * LAG;
        const speed = Math.min(Math.hypot(dx, dy) / 40, 1);

        root.style.setProperty('--mx', `${px.toFixed(1)}px`);
        root.style.setProperty('--my', `${py.toFixed(1)}px`);
        root.style.setProperty('--tx', `${tx.toFixed(1)}px`);
        root.style.setProperty('--ty', `${ty.toFixed(1)}px`);
        root.style.setProperty('--speed', speed.toFixed(3));

        if (Math.abs(dx) + Math.abs(dy) > 0.4) busy = true;
      }

      targets.forEach((t) => {
        const dx = t.cx - px;
        const dy = t.cy - py;
        const dist = Math.hypot(dx, dy);

        let gx = 0;
        let gy = 0;
        if (dist < RADIUS && dist > 0.001) {
          const force = (1 - dist / RADIUS) ** 2;
          gx = (dx / dist) * force * PUSH;
          gy = (dy / dist) * force * PUSH;
        }

        t.vx = (t.vx + (gx - t.x) * STIFF) * DAMP;
        t.vy = (t.vy + (gy - t.y) * STIFF) * DAMP;
        t.x += t.vx;
        t.y += t.vy;

        if (Math.abs(t.x) + Math.abs(t.y) + Math.abs(t.vx) + Math.abs(t.vy) > 0.05) {
          busy = true;
          // A little lean and squash, so it reads as pushed rather than slid.
          t.el.style.transform =
            `translate3d(${t.x.toFixed(2)}px, ${t.y.toFixed(2)}px, 0) rotate(${(t.x * 0.12).toFixed(2)}deg) skewX(${(-t.x * 0.1).toFixed(2)}deg)`;
        } else {
          t.x = 0;
          t.y = 0;
          t.el.style.transform = '';
        }
      });

      if (busy) raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(measure);
    ro.observe(root);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      targets.forEach((t) => {
        t.el.style.transform = '';
      });
    };
  }, [rootRef, enabled]);
}
