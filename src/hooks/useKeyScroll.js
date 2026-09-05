import { useEffect } from 'react';

/**
 * Arrow keys / WASD scroll a specific element.
 *
 * Native keyboard scrolling only works on whatever the browser considers the
 * scrolling focus, and in this app the panels are inner `overflow-y` boxes that
 * never hold focus — so pressing Down inside an open blade did nothing at all.
 * This binds the keys to the element explicitly.
 *
 * Held keys jump instantly rather than queueing a smooth scroll per repeat,
 * which is what makes holding Down feel stuck instead of fast.
 */
export default function useKeyScroll(ref, active = true, { step = 96, page = 0.86 } = {}) {
  useEffect(() => {
    if (!active) return undefined;

    const onKey = (e) => {
      const el = ref.current;
      if (!el) return;

      // Never fight with a text field.
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const behavior = e.repeat ? 'auto' : 'smooth';
      let dy = 0;

      switch (e.key.toLowerCase()) {
        case 'arrowdown':
        case 's':
          dy = step;
          break;
        case 'arrowup':
        case 'w':
          dy = -step;
          break;
        case 'pagedown':
          dy = el.clientHeight * page;
          break;
        case 'pageup':
          dy = -el.clientHeight * page;
          break;
        case ' ':
          dy = (e.shiftKey ? -1 : 1) * el.clientHeight * page;
          break;
        case 'home':
          e.preventDefault();
          el.scrollTo({ top: 0, behavior });
          return;
        case 'end':
          e.preventDefault();
          el.scrollTo({ top: el.scrollHeight, behavior });
          return;
        default:
          return;
      }

      e.preventDefault();
      el.scrollBy({ top: dy, behavior });
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ref, active, step, page]);
}
