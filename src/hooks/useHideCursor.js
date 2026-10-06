import { useEffect } from 'react';

/**
 * Hides the mouse cursor after `delay` ms without the mouse moving, and brings
 * it back the moment it does. Only the mouse counts — typing and scrolling with
 * the wheel leave it hidden, since the point is a clean screen while you read.
 *
 * Browsers fire a synthetic mousemove when the page scrolls or re-lays out under
 * a stationary cursor, so a move only counts if the position really changed.
 */
export default function useHideCursor(delay = 5000) {
  useEffect(() => {
    const root = document.documentElement;
    let timer = 0;
    let x = -1;
    let y = -1;

    const hide = () => root.classList.add('cursor-idle');

    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(hide, delay);
    };

    const onMove = (e) => {
      if (e.clientX === x && e.clientY === y) return;
      x = e.clientX;
      y = e.clientY;
      root.classList.remove('cursor-idle');
      arm();
    };

    const onDown = () => {
      root.classList.remove('cursor-idle');
      arm();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    arm();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      root.classList.remove('cursor-idle');
    };
  }, [delay]);
}
