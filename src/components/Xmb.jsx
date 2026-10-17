import { useLayoutEffect, useRef } from 'react';
import Icon from './Icon';
import { profile } from '../data/content';
import './Xmb.css';

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
}) {
  const railRef = useRef(null);

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
      data-dimmed={dimmed || undefined}
      data-idle={idle || undefined}
      style={{ '--cat': catIndex, '--item': itemIndex }}
    >
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

      {/* The cross point itself — a soft holographic focus ring. */}
      <div className="xmb__focus" aria-hidden="true">
        <span className="xmb__focus-ring" />
        <span className="xmb__focus-core" />
      </div>
    </div>
  );
}
