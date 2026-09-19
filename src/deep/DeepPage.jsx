import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon';
import psp from '../audio/psp';
import useReducedMotion from '../hooks/useReducedMotion';
import useKeyScroll from '../hooks/useKeyScroll';
import Vault from './Vault';
import { intro, strata, outro, sealed, sealedOutro } from './deepContent';
import './DeepPage.css';

const VAULT_KEY = 'xmb:vault-open';

function readUnlocked() {
  try {
    return sessionStorage.getItem(VAULT_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * The deep dive — the page behind the cat.
 *
 * One continuous scroll that starts in the XMB's own palette and drains it as
 * you go: the surface layer fades out, the abyss fades in, and the iridescence
 * survives all the way down as oil on black rather than light on colour. That
 * gradient is driven entirely by `--dive` (0 to 1) published on scroll.
 *
 * Crossing into a new stratum lights that stratum's header: it slides into
 * place, its rule sweeps with iridescence, and its heading fills with the oil
 * gradient and stays that way while you are inside it. The gauge flares too.
 *
 * There used to be a screen-wide crack and a full-page shake here. Both were
 * dropped for a real reason: the shake transformed the ground layer, and that
 * layer holds two viewport-sized conic gradients under a 70-90px blur — a
 * transform on the parent forces those to re-rasterise every single frame. The
 * shards compounded it by animating `box-shadow`, which repaints instead of
 * compositing. It read well and ran badly. Everything now animates only
 * `transform` and `opacity`, on small elements.
 */
export default function DeepPage({ onExit }) {
  const scrollRef = useRef(null);
  const [level, setLevel] = useState(0);
  const [depth, setDepth] = useState(0);
  const [breaking, setBreaking] = useState(false);
  const [unlocked, setUnlocked] = useState(readUnlocked);
  const lastLevel = useRef(0);
  const breakTimer = useRef(null);
  const diveTimer = useRef(null);
  const reduced = useReducedMotion();

  // The vault lets the page go further down: the sealed strata join the
  // gauge and the scroll the moment it opens.
  const visible = unlocked ? [...strata, ...sealed] : strata;
  const maxDepth = visible[visible.length - 1].depth;

  // Descend with the keyboard as well as the wheel.
  useKeyScroll(scrollRef, true, { step: 120 });

  useEffect(
    () => () => {
      clearTimeout(breakTimer.current);
      clearTimeout(diveTimer.current);
    },
    [],
  );

  const unlock = useCallback(() => {
    setUnlocked(true);
    try {
      sessionStorage.setItem(VAULT_KEY, '1');
    } catch {
      // Private mode: it just will not be remembered.
    }
    // Let the cube burst before the page carries you away from it.
    diveTimer.current = setTimeout(
      () => {
        scrollRef.current
          ?.querySelector(`[data-stratum="${sealed[0].id}"]`)
          ?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      },
      reduced ? 0 : 1300,
    );
  }, [reduced]);

  const surfaceBreak = useCallback(() => {
    psp.play('impact');
    if (reduced) return;
    // Re-trigger cleanly if two boundaries land close together.
    setBreaking(false);
    requestAnimationFrame(() => setBreaking(true));
    clearTimeout(breakTimer.current);
    breakTimer.current = setTimeout(() => setBreaking(false), 1000);
  }, [reduced]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return undefined;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const sections = Array.from(root.querySelectorAll('[data-stratum]'));
        const mid = root.clientHeight * 0.42;

        let current = 0;
        sections.forEach((el, i) => {
          if (el.getBoundingClientRect().top <= mid) current = i;
        });

        const max = root.scrollHeight - root.clientHeight;
        const p = max > 0 ? root.scrollTop / max : 0;
        // On the element, so every layer and the gauge can read it.
        root.parentElement.style.setProperty('--dive', p.toFixed(4));
        setDepth(Math.round(p * maxDepth));

        if (current !== lastLevel.current) {
          if (current > lastLevel.current) surfaceBreak();
          lastLevel.current = current;
          setLevel(current);
        }
      });
    };

    root.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      root.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [surfaceBreak, maxDepth]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onExit]);

  const stratum = visible[level];

  return (
    <div className="deep" data-breaking={breaking || undefined} data-level={level}>
      {/* Ground: the surface palette crossfading into the abyss. */}
      <div className="deep__ground" aria-hidden="true">
        <span className="deep__surface-layer" />
        <span className="deep__abyss-layer" />
        <span className="deep__oil" />
        <span className="deep__oil-deep" />
        <span className="deep__silt" />
        <span className="deep__grain" />
        <span className="deep__vignette" />
      </div>

      <button type="button" className="deep__surface-btn" onClick={onExit}>
        <Icon name="arrowLeft" size={14} />
        <span className="mono">Surface</span>
      </button>

      <aside className="deep__gauge" data-flare={breaking || undefined} aria-hidden="true">
        <span className="deep__gauge-rail">
          <span className="deep__gauge-fill" />
          {visible.map((s, i) => (
            <span
              key={s.id}
              className="deep__gauge-tick"
              data-passed={i <= level || undefined}
              data-current={i === level || undefined}
              style={{ '--tp': i / (visible.length - 1) }}
            />
          ))}
        </span>
        <span className="deep__gauge-read mono">
          <b>{depth}</b>m
        </span>
        <span className="deep__gauge-label mono">{stratum.label}</span>
      </aside>

      <div className="deep__scroll" ref={scrollRef}>
        <section className="deep__intro">
          <p className="deep__kicker mono">{intro.kicker}</p>
          <h1 className="deep__title">{intro.title}</h1>
          <p className="deep__lede">{intro.lede}</p>
          <span className="deep__hint mono">
            {intro.hint}
            <i />
          </span>
        </section>

        {strata.map((s, i) => (
          <Stratum key={s.id} s={s} i={i} active={i === level} />
        ))}

        <section className="deep__outro">
          <h2 className="deep__h2">{outro.title}</h2>
          <p className="deep__lede">{outro.body}</p>
          <Vault unlocked={unlocked} onUnlock={unlock} />
          {!unlocked && (
            <button type="button" className="deep__rise" onClick={onExit}>
              <Icon name="power" size={15} />
              <span className="mono">{outro.back}</span>
            </button>
          )}
        </section>

        {unlocked && (
          <>
            {sealed.map((s, j) => (
              <Stratum
                key={s.id}
                s={s}
                i={strata.length + j}
                active={strata.length + j === level}
              />
            ))}

            <section className="deep__outro">
              <h2 className="deep__h2">{sealedOutro.title}</h2>
              <p className="deep__lede">{sealedOutro.body}</p>
              <button type="button" className="deep__rise" onClick={onExit}>
                <Icon name="power" size={15} />
                <span className="mono">{sealedOutro.back}</span>
              </button>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

/** One full-height stratum. Renders whichever content blocks it carries. */
function Stratum({ s, i, active }) {
  return (
    <section
      className="deep__stratum"
      data-stratum={s.id}
      data-align={s.align}
      data-active={active || undefined}
      style={{ '--si': i }}
    >
      <div className="deep__block">
        <header className="deep__head">
          <span className="deep__depth mono">{String(s.depth).padStart(3, '0')}m</span>
          <span className="deep__rule" />
          <span className="deep__label mono">{s.label}</span>
        </header>

        <h2 className="deep__h2">{s.title}</h2>
        <p className="deep__lede">{s.lede}</p>
        {s.updated && <p className="deep__updated mono">Last updated {s.updated}</p>}

        {s.paragraphs && (
          <div className="deep__prose">
            {s.paragraphs.map((t) => (
              <p key={t.slice(0, 26)}>{t}</p>
            ))}
          </div>
        )}

        {s.facts && (
          <dl className="deep__facts">
            {s.facts.map(([k, v]) => (
              <div key={k}>
                <dt className="mono">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {/* /now */}
        {s.now && (
          <div className="deep__now">
            {s.now.map((n) => (
              <article className="deep__now-row" key={n.label}>
                <span className="deep__now-icon">
                  <Icon name={n.icon} size={17} />
                </span>
                <span className="deep__now-label mono">{n.label}</span>
                <p className="deep__now-body">{n.body}</p>
              </article>
            ))}
          </div>
        )}

        {/* hobbies */}
        {s.items && (
          <div className="deep__grid">
            {s.items.map((it) => (
              <article className="deep__card" key={it.name}>
                <span className="deep__card-icon">
                  <Icon name={it.icon} size={20} />
                </span>
                <h3>{it.name}</h3>
                <p>{it.body}</p>
              </article>
            ))}
          </div>
        )}

        {/* /uses */}
        {s.groups && (
          <div className="deep__kit">
            {s.groups.map((g) => (
              <article className="deep__kit-col" key={g.name}>
                <h3 className="mono">{g.name}</h3>
                <ul>
                  {g.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}

        {/* the vault */}
        {s.logs && (
          <div className="deep__logs">
            {s.logs.map((l) => (
              <article className="deep__log" key={l.title} data-tag={l.tag}>
                <header>
                  <span className="deep__log-tag mono">{l.tag}</span>
                  <time className="deep__log-date mono">{l.date}</time>
                </header>
                <h3>{l.title}</h3>
                <p>{l.body}</p>
                <span className="deep__log-edge" aria-hidden="true" />
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
