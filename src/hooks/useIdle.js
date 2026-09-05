import { useEffect, useRef, useState } from 'react';

const EVENTS = ['keydown', 'pointerdown', 'pointermove', 'wheel', 'touchstart'];

/**
 * True once the user has not interacted for `delay` ms.
 * Drives the deepening idle animations (drift, shimmer, glow).
 */
export default function useIdle(delay = 6000) {
  const [idle, setIdle] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    const arm = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setIdle(true), delay);
    };

    const wake = () => {
      setIdle((was) => (was ? false : was));
      arm();
    };

    EVENTS.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    arm();

    return () => {
      clearTimeout(timer.current);
      EVENTS.forEach((e) => window.removeEventListener(e, wake));
    };
  }, [delay]);

  return idle;
}
