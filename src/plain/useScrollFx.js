import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll choreography for the plain view, on GSAP's ScrollTrigger.
 *
 * The page scrolls inside `.plain__scroll` rather than the window, so every
 * trigger is told to watch that element — ScrollTrigger cannot infer a custom
 * scroller. Everything is built inside a `gsap.context` bound to that root, so
 * one `revert()` cleans up every tween and trigger when the view unmounts.
 *
 * This layer handles movement that depends on *where* you are in the page:
 * parallax, rules that draw themselves, shots that hold while text moves.
 * The plain fade-in-when-visible of `[data-pv]` stays on its own
 * IntersectionObserver in PlainView — cheaper, and it already works.
 */
export default function useScrollFx(scrollRef, ready) {
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !ready) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const ctx = gsap.context(() => {
      const st = (vars) => ({ scroller: root, ...vars });

      /* ---- Billboard: the name lifts and the whole block recedes as the
         page leaves it, so the hero reads as a layer above the content. ---- */
      gsap.to('.pv-bill--hero .pv-bill__name', {
        y: () => -0.18 * window.innerHeight,
        ease: 'none',
        scrollTrigger: st({ trigger: '.pv-bill--hero', start: 'top top', end: 'bottom top', scrub: 0.4 }),
      });

      gsap.to('.pv-bill--hero', {
        opacity: 0.08,
        ease: 'none',
        scrollTrigger: st({ trigger: '.pv-bill--hero', start: 'center top', end: 'bottom top', scrub: 0.4 }),
      });

      /* ---- Section rules draw themselves across as the head arrives. ---- */
      gsap.utils.toArray('.pv-head__rule').forEach((rule) => {
        gsap.fromTo(
          rule,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: st({ trigger: rule, start: 'top 88%', once: true }),
          },
        );
      });

      /* ---- Section numbers count up out of the gutter. ---- */
      gsap.utils.toArray('.pv-head__num').forEach((num) => {
        gsap.fromTo(
          num,
          { yPercent: 120, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: st({ trigger: num, start: 'top 92%', once: true }),
          },
        );
      });

      /* ---- Project shots hold still while their text scrolls past. Only
         worth doing where there is room for it: on one column, or where the
         row is no taller than the shots, pinning would fight the reader. ---- */
      if (window.innerWidth >= 900) {
        gsap.utils.toArray('.pv-project').forEach((row) => {
          const media = row.querySelector('.pv-project__media');
          const body = row.querySelector('.pv-project__body');
          if (!media || !body) return;
          /* Only where there is real travel to hold through: a row whose two
             columns are nearly the same height has nothing to pin against. */
          if (media.offsetHeight < body.offsetHeight + 240) return;
          ScrollTrigger.create({
            scroller: root,
            trigger: body,
            start: 'center center',
            endTrigger: row,
            end: () => `bottom ${Math.round(root.clientHeight / 2 + body.offsetHeight / 2)}px`,
            pin: body,
            pinSpacing: false,
            invalidateOnRefresh: true,
          });
        });
      }

      /* ---- Tech chips deal themselves in. ---- */
      gsap.utils.toArray('.pv-tags, .tchips').forEach((list) => {
        gsap.fromTo(
          list.children,
          { y: 14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.035,
            ease: 'power2.out',
            scrollTrigger: st({ trigger: list, start: 'top 92%', once: true }),
          },
        );
      });

      /* ---- Closing line rises as the footer comes into reach. ---- */
      gsap.fromTo(
        '.pv-contact__big',
        { yPercent: 12 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: st({ trigger: '.pv-contact', start: 'top bottom', end: 'bottom bottom', scrub: 0.4 }),
        },
      );
    }, root);

    /* Images settle after the triggers are built, which would leave every
       start/end measured against the wrong page height. */
    const refresh = () => ScrollTrigger.refresh();
    const imgs = Array.from(root.querySelectorAll('img')).filter((i) => !i.complete);
    imgs.forEach((i) => i.addEventListener('load', refresh, { once: true }));
    const t = setTimeout(refresh, 400);

    return () => {
      clearTimeout(t);
      imgs.forEach((i) => i.removeEventListener('load', refresh));
      ctx.revert();
    };
  }, [scrollRef, ready]);
}
