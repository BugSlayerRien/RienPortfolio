import { useEffect, useState } from 'react';

/**
 * Which of a set of photographs is showing, advanced on a timer.
 *
 * Both the plain view's hero and the XMB's About card run the same pair of
 * portraits, so they share the beat from here rather than each keeping their
 * own. Nothing ticks while the tab is in the background, and nothing ticks at
 * all for anyone who has asked for reduced motion — an image that changes
 * itself is exactly what that setting is for.
 */
export default function useShotCycle(count, ms = 6500) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (count < 2) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const id = setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % count);
    }, ms);
    return () => clearInterval(id);
  }, [count, ms]);

  return index;
}
