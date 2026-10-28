import { useEffect, useLayoutEffect, useRef } from 'react';
import Icon from './Icon';
import TempleIdol, { MOUTH_DROP, MOUTH_SIZE } from './TempleIdol';
import { profile } from '../data/content';
import './Xmb.css';

/* ---------- Temple: the spiral track ----------
   One spiral, worked out in pixels for the current screen. It is drawn as the
   groove the orbs run in, and handed to CSS as `--track` for every item's
   offset-path, so what you see is exactly the line the orbs follow.

   It runs clockwise and inward: it enters at six o'clock on the outer ring and
   ends in a hole beside the idol. The cursor's orb always sits at three
   o'clock, three quarters of a turn in, where its label has open ground to the
   right; the items before it trail back up the ring and the items after it
   carry on round and down towards the hole. */

const clampN = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

function templeGeometry(w, h, icon, iconSel, count) {
  // Below 900px the panel is a bottom sheet, so the stage keeps the top half.
  const sheet = w <= 900;
  const reserve = sheet ? 0 : Math.min(620, w * 0.46) + clampN(w * 0.03, 18, 44);
  const availW = w - reserve;
  const availH = sheet ? h * 0.48 : h;

  // Neighbouring rings sit one orb apart plus a ridge of stone.
  const gap = icon + (sheet ? 12 : 14);
  // The track ends just clear of the frog: its legs reach the edge of its
  // box, then half an orb and a sliver of stone.
  const idol = sheet ? 72 : clampN(w * 0.085, 110, 140);
  const rIn = idol * 0.5 + icon / 2 + 4;

  const friezeY = sheet ? 78 : 120;
  const friezeStep = clampN((availW - 40) / count, 54, 100);
  const friezeX = availW / 2 - ((count - 1) / 2) * friezeStep;

  let R;
  let cy;
  if (sheet) {
    const room = availH - (friezeY + 62) - 8;
    R = Math.max(Math.min(w * 0.27, room / 2, 140), rIn + gap);
    cy = friezeY + 62 + R;
  } else {
    R = Math.max(clampN(Math.min(w * 0.135, h * 0.27), 150, 215), rIn + 1.25 * gap);
    cy = clampN(h * 0.55, friezeY + 70 + R, h - 70 - R);
  }
  const cx = (sheet ? 14 : clampN(w * 0.05, 36, 90)) + R;

  // r(phi) shrinks by one gap per turn, from R at the entry down to rIn.
  const phi0 = -1.5 * Math.PI;
  const phi1 = phi0 + (2 * Math.PI * (R - rIn)) / gap;
  const xs = [];
  const ys = [];
  const cum = [];
  let aimD = 0;
  for (let phi = phi0, i = 0; ; phi += 0.04, i += 1) {
    const p = Math.min(phi, phi1);
    const r = R - (gap * (p - phi0)) / (2 * Math.PI);
    xs.push(cx + r * Math.cos(p));
    ys.push(cy + r * Math.sin(p));
    cum.push(i ? cum[i - 1] + Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]) : 0);
    if (p <= 0) aimD = cum[i];
    if (p >= phi1) break;
  }
  const L = cum[cum.length - 1];

  const pointAt = (d) => {
    const t = clampN(d, 0, L);
    let lo = 0;
    let hi = cum.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] <= t) lo = mid;
      else hi = mid;
    }
    const seg = cum[hi] - cum[lo] || 1;
    const k = (t - cum[lo]) / seg;
    return [xs[lo] + (xs[hi] - xs[lo]) * k, ys[lo] + (ys[hi] - ys[lo]) * k];
  };

  const d = xs.map((x, i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
  const [ax, ay] = pointAt(aimD);
  // The selected label may run from the orb's right edge to the panel.
  const labelMax = Math.max(availW - (ax + iconSel / 2 + 16) - (sheet ? 14 : 42), 96);

  return {
    d,
    L,
    aimD,
    slot: gap,
    cx,
    cy,
    ax,
    ay,
    availW,
    idol,
    icon,
    iconSel,
    groove: icon + 4,
    labelMax,
    friezeX,
    friezeY,
    friezeStep,
    pointAt,
  };
}

/**
 * The cross media bar.
 *
 * Geometry follows the real thing: every category is a vertical column laid
 * out along a horizontal rail. The bar slides left/right so the active column
 * sits on the "cross point"; the active column slides up/down so the selected
 * item sits on that same point. The category icon lives one row above item 0,
 * so it scrolls away as you move down the list — exactly like the console.
 *
 * Mouse mirrors the d-pad: hovering moves the cursor, clicking confirms.
 *
 * An item carrying a `logo` shows that brand mark in place of the line icon.
 * Those marks are drawn for light backgrounds, so their tile swaps the dark
 * glass for a pearl plate rather than losing the artwork into the background.
 *
 * One category breaks the pattern. A category with `mode: 'burst'` — Socials,
 * the last stop on the bar — has no blade. Landing on it detonates the column:
 * the nodes fly out from the cross point into a legible cluster, already open,
 * so reaching the end of the bar *is* the reveal.
 */
export default function Xmb({
  categories,
  catIndex,
  itemIndex,
  onHoverCategory,
  onHoverItem,
  onActivate,
  dimmed = false,
  idle = false,
  coach = false,
  theme,
}) {
  const railRef = useRef(null);
  const rootRef = useRef(null);
  const grooveRef = useRef(null);
  const holeRef = useRef(null);
  const geoRef = useRef(null);
  const angleRef = useRef(90);
  const stageRef = useRef(null);
  const loadRef = useRef(null);
  const firedRef = useRef({ cat: -1, upTo: -1 });
  // Resizes re-place the chain from an older closure, so read the cursor here.
  const navRef = useRef({ catIndex, itemIndex });
  navRef.current = { catIndex, itemIndex };
  const temple = theme === 'temple';
  const burstOn = categories[catIndex]?.mode === 'burst';

  /* Turn the idol to face a screen point, the short way round: the angle is
     kept as a running total so 170° to -170° is a 20° turn, not 340°. */
  const aimAt = (x, y) => {
    const g = geoRef.current;
    const root = rootRef.current;
    if (!g || !root) return;
    const target = (Math.atan2(x - g.cx, g.cy - y) * 180) / Math.PI;
    let a = target;
    while (a - angleRef.current > 180) a -= 360;
    while (a - angleRef.current < -180) a += 360;
    angleRef.current = a;
    root.style.setProperty('--aim-angle', `${a.toFixed(1)}deg`);
  };

  /* Place the active chain: each orb's way back to the idol's mouth (--fx /
     --fy, for the shot that fires it) and whether it has run off either end
     of the track.

     Orbs are fired one at a time, as the cursor first reaches them: entering
     a category fires only its first orb, and each step further down fires
     the next. `data-fired` marks the ones already out — adding it is what
     starts an orb's shot — and a jump of several items fires each one it
     skipped, in order (--fire-rank). Leaving the category reloads it. */
  const placeChain = () => {
    const g = geoRef.current;
    const rail = railRef.current;
    if (!g || !rail) return;
    aimAt(g.ax, g.ay);
    const rad = (angleRef.current * Math.PI) / 180;
    const mx = g.cx + Math.sin(rad) * g.idol * MOUTH_DROP;
    const my = g.cy - Math.cos(rad) * g.idol * MOUTH_DROP;
    const mouth = g.idol * MOUTH_SIZE;

    const { catIndex, itemIndex } = navRef.current;
    const fired = firedRef.current;
    if (fired.cat !== catIndex) {
      rail.querySelectorAll('.xmb__item[data-fired]').forEach((n) => n.removeAttribute('data-fired'));
      fired.cat = catIndex;
      fired.upTo = -1;
    }
    const from = fired.upTo + 1;
    fired.upTo = Math.max(fired.upTo, itemIndex);

    const col = rail.querySelector('.xmb__col[data-active]');
    if (!col) return;
    const items = col.querySelectorAll('.xmb__item');
    items.forEach((node, ii) => {
      const off = parseFloat(node.style.getPropertyValue('--off')) || 0;
      const dist = g.aimD + off * g.slot;
      const [px, py] = g.pointAt(dist);
      node.style.setProperty('--fx', `${(mx - px).toFixed(1)}px`);
      node.style.setProperty('--fy', `${(my - py).toFixed(1)}px`);
      node.toggleAttribute('data-sunk', dist < 0 || dist > g.L);
      // A shot leaves the mouth the size of the ball that was sitting in it.
      const size = ii === itemIndex ? g.iconSel : g.icon;
      node.style.setProperty('--fire-scale', (mouth / size).toFixed(3));
      if (ii >= from && ii <= fired.upTo) {
        node.style.setProperty('--fire-rank', ii - from);
        node.setAttribute('data-fired', '');
      }
    });

    /* The next orb waits in the frog's mouth, in its own colour, so every shot
       visibly comes out of it. Once the whole chain is out the mouth is empty. */
    const stage = stageRef.current;
    const load = loadRef.current;
    const next = items[fired.upTo + 1];
    stage?.toggleAttribute('data-empty', !next);
    if (load && next) {
      load.dataset.orb = String((fired.upTo + 1) % 5);
      load.toggleAttribute('data-logo', !!next.querySelector('.xmb__item-glyph[data-logo]'));
    }

    // A shot: the frog kicks back, away from its mouth, and reloads.
    const shots = fired.upTo - from + 1;
    if (shots > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      stage?.querySelector('.temple__body')?.animate(
        [
          { transform: 'translateY(0) scale(1)' },
          { transform: 'translateY(-6%) scale(0.94)', offset: 0.25 },
          { transform: 'translateY(0) scale(1)' },
        ],
        { duration: 520, easing: 'cubic-bezier(0.2, 0.75, 0.25, 1)' },
      );
      load?.animate(
        [
          { transform: 'scale(0)', opacity: 0 },
          { transform: 'scale(0)', opacity: 0, offset: 0.4 },
          { transform: 'scale(1)', opacity: 1 },
        ],
        { duration: 380 + shots * 90, easing: 'cubic-bezier(0.2, 0.75, 0.25, 1)' },
      );
    }
  };

  /* Temple geometry: worked out on mount and on every resize, then published
     as custom properties so the stylesheet can place everything from it. */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!temple || !root) return undefined;

    const layout = () => {
      const cs = getComputedStyle(root);
      const icon = parseFloat(cs.getPropertyValue('--icon')) || 48;
      const iconSel = parseFloat(cs.getPropertyValue('--icon-sel')) || 70;
      const g = templeGeometry(root.clientWidth, root.clientHeight, icon, iconSel, categories.length);
      geoRef.current = g;
      const set = (k, v) => root.style.setProperty(k, v);
      set('--track', `path("${g.d}")`);
      set('--aim', `${g.aimD.toFixed(1)}px`);
      set('--slot', `${g.slot}px`);
      set('--cross-x', `${g.ax.toFixed(1)}px`);
      set('--cross-y', `${g.ay.toFixed(1)}px`);
      set('--label-max', `${g.labelMax.toFixed(0)}px`);
      set('--frieze-x', `${g.friezeX.toFixed(1)}px`);
      set('--frieze-y', `${g.friezeY}px`);
      set('--frieze-step', `${g.friezeStep.toFixed(1)}px`);
      set('--idol-x', `${g.cx.toFixed(1)}px`);
      set('--idol-y', `${g.cy.toFixed(1)}px`);
      set('--idol-size', `${g.idol.toFixed(1)}px`);
      set('--groove', `${g.groove}px`);
      grooveRef.current?.querySelectorAll('path').forEach((p) => p.setAttribute('d', g.d));
      const [hx, hy] = g.pointAt(g.L);
      holeRef.current?.setAttribute('cx', hx.toFixed(1));
      holeRef.current?.setAttribute('cy', hy.toFixed(1));
      placeChain();
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(root);
    window.addEventListener('resize', layout);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', layout);
      [
        '--track', '--aim', '--slot', '--cross-x', '--cross-y', '--label-max', '--frieze-x',
        '--frieze-y', '--frieze-step', '--idol-x', '--idol-y', '--idol-size', '--groove', '--aim-angle',
      ].forEach((k) => root.style.removeProperty(k));
      geoRef.current = null;
      // Coming back to Temple fires the chain afresh.
      firedRef.current = { cat: -1, upTo: -1 };
    };
    // placeChain reads refs only, so it does not need to be a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temple, categories.length]);

  // Every move re-places the chain and swings the idol back onto the cursor.
  useLayoutEffect(() => {
    if (temple) placeChain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temple, catIndex, itemIndex, categories]);

  /* With a mouse, the idol watches the pointer while it is over the stage, and
     settles back on the cursor's orb when the pointer leaves for the panel. */
  useEffect(() => {
    if (!temple) return undefined;
    let raf = 0;
    let last = null;
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      last = e;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const g = geoRef.current;
        if (!g || !last) return;
        if (last.clientX > g.availW) aimAt(g.ax, g.ay);
        else aimAt(last.clientX, last.clientY);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temple]);

  /* The burst should read as coming out of the category globe, which sits one
     row above the cross point. Cards are laid out by a grid, so CSS cannot know
     where each one lands; measure it instead and hand every card the offset
     from its own spot back to the globe (--fx / --fy). offsetLeft / offsetTop
     are layout positions, so the running animation does not skew them. */
  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;

    const place = () => {
      rail.querySelectorAll('.xmb__burst').forEach((burst) => {
        const rowGap = parseFloat(getComputedStyle(burst).getPropertyValue('--row-gap')) || 104;
        const globeX = 0;
        const globeY = burst.offsetHeight / 2 - rowGap;
        burst.querySelectorAll('.xmb__node, .xmb__quote').forEach((node) => {
          const cx = node.offsetLeft + node.offsetWidth / 2;
          const cy = node.offsetTop + node.offsetHeight / 2;
          node.style.setProperty('--fx', `${(globeX - cx).toFixed(1)}px`);
          node.style.setProperty('--fy', `${(globeY - cy).toFixed(1)}px`);
        });
      });
    };

    place();
    const ro = new ResizeObserver(place);
    rail.querySelectorAll('.xmb__burst').forEach((b) => ro.observe(b));
    window.addEventListener('resize', place);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', place);
    };
  }, [categories]);

  return (
    <div
      className="xmb"
      ref={rootRef}
      data-dimmed={dimmed || undefined}
      data-idle={idle || undefined}
      data-burst-on={burstOn || undefined}
      style={{ '--cat': catIndex, '--item': itemIndex }}
    >
      {/* Temple only: the carved track and the idol at its heart. */}
      {temple && (
        <div className="temple" aria-hidden="true" ref={stageRef}>
          <svg className="temple__track" ref={grooveRef}>
            <path className="temple__groove-cut" />
            <path className="temple__groove" />
            <path className="temple__groove-line" />
            <circle className="temple__hole" ref={holeRef} r="0" />
          </svg>
          <div className="temple__idol">
            <div className="temple__body">
              <TempleIdol />
              <span className="temple__load" ref={loadRef} />
            </div>
          </div>
        </div>
      )}

      <div className="xmb__rail" ref={railRef}>
        {categories.map((cat, ci) => {
          const active = ci === catIndex;
          const distance = ci - catIndex;
          const burst = cat.mode === 'burst';

          return (
            <div
              key={cat.id}
              className="xmb__col"
              data-active={active || undefined}
              data-burst={burst || undefined}
              data-distance={Math.min(Math.abs(distance), 4)}
              style={{ '--ci': ci, '--dist': distance }}
            >
              {/* Category head — one row above item 0. */}
              <button
                type="button"
                className="xmb__cat"
                onMouseEnter={() => onHoverCategory(ci)}
                onFocus={() => onHoverCategory(ci)}
                onClick={() => onHoverCategory(ci)}
                aria-label={`${cat.label} category`}
                aria-current={active ? 'true' : undefined}
                tabIndex={active ? 0 : -1}
              >
                <span className="xmb__cat-slot">
                  <span className="xmb__cat-glyph">
                    <Icon name={cat.icon} size={40} strokeWidth={1.3} />
                  </span>
                </span>
                <span className="xmb__cat-label">{cat.label}</span>
              </button>

              {burst ? (
                /* ---- Socials: detonates on arrival, no blade ---- */
                <div className="xmb__burst" aria-hidden={!active}>
                  <span className="xmb__burst-flash" aria-hidden="true" />
                  {cat.items.map((item, ii) => {
                    const selected = active && ii === itemIndex;
                    const Tag = item.href ? 'a' : 'button';
                    const linkProps = item.href
                      ? {
                          href: item.href,
                          target: item.href.startsWith('mailto:') ? undefined : '_blank',
                          rel: 'noreferrer',
                        }
                      : { type: 'button' };

                    return (
                      <Tag
                        key={item.id}
                        className="xmb__node"
                        data-selected={selected || undefined}
                        style={{ '--bi': ii }}
                        tabIndex={active ? 0 : -1}
                        onMouseEnter={() => onHoverItem(ci, ii)}
                        onFocus={() => onHoverItem(ci, ii)}
                        onClick={() => onActivate(ci, ii)}
                        {...linkProps}
                      >
                        <span className="xmb__node-glyph">
                          <Icon name={item.icon} size={30} strokeWidth={1.5} />
                        </span>
                        <span className="xmb__node-text">
                          <span className="xmb__node-label">{item.title}</span>
                          <span className="xmb__node-value">{item.subtitle}</span>
                        </span>
                      </Tag>
                    );
                  })}

                  <p className="xmb__quote" aria-label={profile.quote}>
                    <span className="xmb__quote-body" aria-hidden="true">
                      {/* Two lines, split at the first full stop. */}
                      {profile.quote.split(/(?<=\.)\s+/).map((line) => (
                        <span className="xmb__quote-line" key={line}>
                          {line}
                        </span>
                      ))}
                    </span>
                  </p>
                </div>
              ) : (
                /* ---- Ordinary column ---- */
                <ul className="xmb__items" aria-hidden={!active}>
                  {cat.items.map((item, ii) => {
                    const selected = active && ii === itemIndex;
                    const offset = ii - (active ? itemIndex : 0);

                    return (
                      <li
                        key={item.id}
                        className="xmb__item"
                        data-selected={selected || undefined}
                        data-offset={Math.min(Math.abs(offset), 4)}
                        style={{ '--ii': ii, '--off': offset }}
                      >
                        <button
                          type="button"
                          className="xmb__item-btn"
                          tabIndex={selected ? 0 : -1}
                          onMouseEnter={() => onHoverItem(ci, ii)}
                          onFocus={() => onHoverItem(ci, ii)}
                          onClick={() => onActivate(ci, ii)}
                        >
                          {/* Fixed-width slot keeps the tile centred on the
                              cross point even as it grows on selection. */}
                          <span className="xmb__item-slot">
                            <span
                              className="xmb__item-glyph"
                              data-logo={item.logo ? item.logoFit || 'plate' : undefined}
                            >
                              {item.logo ? (
                                <img
                                  className="xmb__item-logo"
                                  style={{
                                    '--logo-scale': item.logoScale ?? item.logoZoom,
                                    objectPosition: item.logoFocus,
                                    transformOrigin: item.logoFocus,
                                  }}
                                  src={item.logo}
                                  alt=""
                                  loading="lazy"
                                />
                              ) : (
                                <Icon name={item.icon} size={30} strokeWidth={1.4} />
                              )}
                              <span className="xmb__item-sheen" aria-hidden="true" />
                            </span>
                          </span>
                          <span className="xmb__item-text">
                            <span className="xmb__item-title">{item.title}</span>
                            <span className="xmb__item-sub">{item.subtitle}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* First-visit cues. Drawn, not written: chevrons that nudge toward the
          neighbouring icons and items, and a pill showing the wheel and keys.
          They vanish the moment someone has found their way around. */}
      <div className="xmb__coach" data-on={coach || undefined} aria-hidden="true">
        <span className="xmb__coach-chev xmb__coach-chev--l">
          <Icon name="arrowLeft" size={18} strokeWidth={2.2} />
        </span>
        <span className="xmb__coach-chev xmb__coach-chev--r">
          <Icon name="arrowRight" size={18} strokeWidth={2.2} />
        </span>
        <span className="xmb__coach-chev xmb__coach-chev--u">
          <Icon name="arrowRight" size={18} strokeWidth={2.2} />
        </span>
        <span className="xmb__coach-chev xmb__coach-chev--d">
          <Icon name="arrowRight" size={18} strokeWidth={2.2} />
        </span>

        <div className="xmb__coach-pill">
          <span className="xmb__coach-mouse">
            <i />
          </span>
          <span className="xmb__coach-keys">
            <kbd data-d="up">
              <Icon name="arrowRight" size={11} strokeWidth={2.4} />
            </kbd>
            <kbd data-d="left">
              <Icon name="arrowRight" size={11} strokeWidth={2.4} />
            </kbd>
            <kbd data-d="down">
              <Icon name="arrowRight" size={11} strokeWidth={2.4} />
            </kbd>
            <kbd data-d="right">
              <Icon name="arrowRight" size={11} strokeWidth={2.4} />
            </kbd>
          </span>
          <span className="xmb__coach-text mono">
            <b className="xmb__coach-desk">Scroll or use arrow keys</b>
            <b className="xmb__coach-touch">Swipe to move</b>
          </span>
        </div>
      </div>

      {/* The cross point itself — a soft holographic focus ring. */}
      <div className="xmb__focus" aria-hidden="true">
        <span className="xmb__focus-ring" />
        <span className="xmb__focus-core" />
      </div>
    </div>
  );
}
