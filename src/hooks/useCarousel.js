import { useEffect, useState } from 'react';
import useReducedMotion from './useReducedMotion';

export const DWELL = 4200;

/**
 * Shared state for the auto-advancing carousels: the current index, a hold flag
 * (set while hovered or focused), and the advance timer. With reduced motion,
 * or a single slide, it never moves on its own.
 */
export default function useCarousel(count) {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const reduced = useReducedMotion();
  const auto = !reduced && count > 1;

  useEffect(() => {
    if (!auto || held) return undefined;
    const id = setTimeout(() => setIndex((n) => (n + 1) % count), DWELL);
    return () => clearTimeout(id);
  }, [auto, held, index, count]);

  const go = (n) => setIndex((n + count) % count);

  const holdProps = {
    onMouseEnter: () => setHeld(true),
    onMouseLeave: () => setHeld(false),
    onFocus: () => setHeld(true),
    onBlur: (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setHeld(false);
    },
  };

  return { index, go, held, auto, holdProps };
}
