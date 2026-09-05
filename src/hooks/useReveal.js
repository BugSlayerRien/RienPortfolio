import { useEffect, useRef } from 'react';

/**
 * Reveal-on-scroll for content inside a blade.
 *
 * Attach the returned ref to a scroll container. Every descendant carrying
 * `data-reveal` starts hidden and gets `.is-revealed` when it crosses into
 * view, with a stagger index exposed as `--reveal-i`.
 *
 * Scroll progress is published as `--scroll-p` (0 to 1) on the nearest
 * `[data-scroll-scope]` ancestor — custom properties only inherit downward, so
 * writing it on the scope lets siblings of the scroller (a header rule, an
 * ambient tint) react to scroll position too.
 */
export default function useReveal(deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    const targets = Array.from(root.querySelectorAll('[data-reveal]'));
    targets.forEach((el, i) => {
      el.style.setProperty('--reveal-i', i);
      el.classList.remove('is-revealed');
    });

    // No IntersectionObserver (or no motion budget) — just show everything.
    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.classList.add('is-revealed'));
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { root, rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );

    // Anything already on screen is revealed synchronously. Waiting on the
    // observer's first callback means waiting on a frame, and a backgrounded
    // or throttled tab may not paint one for seconds.
    const box = root.getBoundingClientRect();
    targets.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < box.bottom && r.bottom > box.top) el.classList.add('is-revealed');
      else io.observe(el);
    });

    const scope = root.closest('[data-scroll-scope]') || root;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const max = root.scrollHeight - root.clientHeight;
        const p = max > 0 ? root.scrollTop / max : 0;
        scope.style.setProperty('--scroll-p', p.toFixed(4));
        scope.style.setProperty('--scroll-px', `${Math.round(root.scrollTop)}px`);
      });
    };

    root.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      root.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
