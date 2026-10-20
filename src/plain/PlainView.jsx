import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon';
import WaveField from '../components/WaveField';
import TechChips from '../components/blades/TechChips';
import ShotCarousel from '../components/blades/ShotCarousel';
import { RoleBadge } from '../components/blades/BladeContent';
import useKeyScroll from '../hooks/useKeyScroll';
import {
  profile,
  about,
  stack,
  categories,
  projects,
  experience,
  education,
  certificates,
  certificateSets,
  contacts,
} from '../data/content';
import './PlainView.css';

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'credentials', label: 'Credentials' },
  { id: 'contact', label: 'Contact' },
];

const itemsOf = (id) => categories.find((c) => c.id === id)?.items ?? [];

// Same order and the same visibility as the XMB: hiding an item there hides it here.
const PROJECT_ITEMS = itemsOf('projects');
const EXPERIENCE_IDS = itemsOf('experience').map((i) => i.id);
const CERT_LIST = (() => {
  const seen = new Set();
  const out = [];
  itemsOf('credentials').forEach((item) => {
    const ids = item.blade === 'certificateSet' ? certificateSets[item.id]?.members ?? [] : [item.id];
    ids.forEach((id) => {
      if (certificates[id] && !seen.has(id)) {
        seen.add(id);
        out.push({ id, ...certificates[id] });
      }
    });
  });
  return out;
})();

/** "Rien Miro Gappi" with the middle name set in italic, the way the hero does it. */
function Name({ as: Tag = 'span', className }) {
  const [first, ...rest] = profile.fullName.split(' ');
  return (
    <Tag className={className}>
      <em>{first}</em> {rest.join(' ')}
    </Tag>
  );
}

/* A ribbon down each margin, flowing slowly out of frame. Two copies of the
   same wave stacked head to tail, so the loop never shows a seam. */
function SideFrame() {
  const wave =
    'M30 0 C8 42 52 84 30 126 C8 168 52 210 30 252 C8 294 52 336 30 378 C8 420 52 462 30 504';
  return (
    <div className="pv-frame" aria-hidden="true">
      {['left', 'right'].map((side) => (
        <span className="pv-frame__edge" data-side={side} key={side}>
          <svg viewBox="0 0 60 504" preserveAspectRatio="none" focusable="false">
            <defs>
              <linearGradient id={`pv-ribbon-${side}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--iri-3)" stopOpacity="0" />
                <stop offset="18%" stopColor="var(--iri-2)" stopOpacity="0.9" />
                <stop offset="50%" stopColor="var(--iri-1)" stopOpacity="0.75" />
                <stop offset="82%" stopColor="var(--iri-4)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="var(--iri-5)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g className="pv-frame__flow">
              <path d={wave} />
              <path d={wave} transform="translate(0 504)" />
            </g>
          </svg>
        </span>
      ))}
    </div>
  );
}

function SectionHead({ n, title, note }) {
  return (
    <header className="pv-head" data-pv>
      <span className="pv-head__num">{String(n).padStart(2, '0')}</span>
      <h2 className="pv-head__title">{title}</h2>
      <span className="pv-head__rule" aria-hidden="true" />
      {note && <p className="pv-head__note">{note}</p>}
    </header>
  );
}

/**
 * The plain view: everything in the XMB as one scrolling page, for people who
 * would rather read than play.
 *
 * It is themed by the same tokens as the XMB, so Iris / Noir / Mono carry over,
 * and the wave runs behind it at low intensity so it still feels like the same
 * site. Content eases in as it crosses into the middle of the viewport and eases
 * back out as it leaves through the top — see the IntersectionObserver below.
 */
export default function PlainView({ theme, nextTheme, onCycleTheme, palette, reduced, onExit }) {
  const scrollRef = useRef(null);
  const [active, setActive] = useState('');
  const [leaving, setLeaving] = useState(false);

  useKeyScroll(scrollRef, true, { step: 120 });

  // Content eases in when it enters the middle band of the viewport, and eases
  // out through the top when it leaves it. The band is inset 10% top and bottom
  // so the exit happens while the element is still on screen and visible.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return undefined;
    const els = Array.from(root.querySelectorAll('[data-pv]'));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.dataset.pv = 'in';
          else e.target.dataset.pv = e.boundingClientRect.top < (e.rootBounds?.top ?? 0) ? 'above' : 'below';
        });
      },
      { root, rootMargin: '-8% 0px -6% 0px', threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Reading progress and the current section, in one rAF-throttled handler.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return undefined;
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const max = root.scrollHeight - root.clientHeight;
        root.parentElement.style.setProperty('--pv-progress', max > 0 ? (root.scrollTop / max).toFixed(4) : '0');
        root.parentElement.style.setProperty('--pv-scroll', `${Math.round(root.scrollTop)}px`);

        const probe = root.clientHeight * 0.35;
        let current = '';
        SECTIONS.forEach((s) => {
          const el = root.querySelector(`#pv-${s.id}`);
          if (el && el.getBoundingClientRect().top - root.getBoundingClientRect().top <= probe) current = s.id;
        });
        setActive(current);
      });
    };

    root.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      root.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const scrollTo = useCallback(
    (id) => {
      const root = scrollRef.current;
      const el = id ? root?.querySelector(`#pv-${id}`) : null;
      root?.scrollTo({ top: el ? el.offsetTop - 72 : 0, behavior: reduced ? 'auto' : 'smooth' });
    },
    [reduced],
  );

  // Ease the page out before handing back to the XMB.
  const exit = useCallback(() => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(onExit, reduced ? 0 : 380);
  }, [leaving, onExit, reduced]);

  const email = contacts.find((c) => c.id === 'email');

  return (
    <div className="plain" data-leaving={leaving || undefined}>
      <WaveField palette={palette} columns={0.5} intensity={reduced ? 0.4 : 0.6} reduced={reduced} />
      <div className="plain__veil" aria-hidden="true" />
      <SideFrame />

      <div className="plain__scroll" ref={scrollRef} tabIndex={-1}>
        <header className="pv-bar">
          <button type="button" className="pv-bar__brand" onClick={() => scrollTo('')}>
            <Name />
          </button>

          <nav className="pv-nav" aria-label="Sections">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className="pv-nav__link"
                data-active={active === s.id || undefined}
                onClick={() => scrollTo(s.id)}
              >
                {s.label}
              </button>
            ))}
          </nav>

          <div className="pv-bar__actions">
            <button
              type="button"
              className="pv-chip"
              onClick={onCycleTheme}
              title={`Theme: ${theme.label} — switch to ${nextTheme.label}`}
            >
              <span className="pv-chip__dot" aria-hidden="true" />
              <span>{theme.label}</span>
            </button>
            <a className="pv-btn pv-btn--solid" href={profile.cv} download={profile.cvFileName}>
              <Icon name="download" size={14} />
              <span>Download CV</span>
            </a>
            <button type="button" className="pv-btn" onClick={exit} title="Back to the interactive XMB view">
              <Icon name="gamepad" size={15} />
              <span>XMB view</span>
            </button>
          </div>

          <span className="pv-bar__progress" aria-hidden="true" />
        </header>

        <main className="pv-main">
          {/* ---------- Hero ---------- */}
          <section className="pv-hero">
            <div className="pv-hero__text">
              <p className="pv-kicker pv-rise" style={{ '--d': 0 }}>
                Portfolio · {profile.tagline}
              </p>
              <h1 className="pv-hero__name" aria-label={profile.fullName}>
                {profile.fullName.split(' ').map((w, i) => (
                  <span className="pv-word" key={w} aria-hidden="true">
                    <span style={{ '--d': i + 1 }}>{i === 0 ? <em>{w}</em> : w}</span>
                  </span>
                ))}
              </h1>
              <p className="pv-hero__lede pv-rise" style={{ '--d': 5 }}>
                {about.body[0]}
              </p>
              <div className="pv-hero__cta pv-rise" style={{ '--d': 6 }}>
                <a className="pv-btn pv-btn--solid pv-btn--lg" href={profile.cv} download={profile.cvFileName}>
                  <Icon name="download" size={15} />
                  <span>Download CV</span>
                </a>
                <button type="button" className="pv-btn pv-btn--lg" onClick={() => scrollTo('projects')}>
                  <span>See projects</span>
                  <Icon name="arrowRight" size={14} />
                </button>
              </div>
            </div>

            <figure className="pv-hero__photo pv-rise" style={{ '--d': 3 }}>
              <span className="pv-hero__ring" aria-hidden="true" />
              <img src={profile.avatar} alt={profile.fullName} width="320" height="320" />
            </figure>

            <span className="pv-hero__hint" aria-hidden="true">
              Scroll
              <i />
            </span>
          </section>

          {/* ---------- About ---------- */}
          <section className="pv-section" id="pv-about">
            <SectionHead n={1} title="About" />
            <div className="pv-about">
              <div className="pv-prose">
                <p className="pv-prose__intro" data-pv>
                  {about.intro}
                </p>
                {about.body.slice(1).map((p, i) => (
                  <p key={p.slice(0, 20)} data-pv style={{ '--pv-i': i + 1 }}>
                    {p}
                  </p>
                ))}
              </div>
              <div className="pv-stack">
                {stack.map((g, i) => (
                  <div className="pv-stack__row" key={g.group} data-pv style={{ '--pv-i': i }}>
                    <span className="pv-label">{g.group}</span>
                    <TechChips items={g.items} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ---------- Projects ---------- */}
          <section className="pv-section" id="pv-projects">
            <SectionHead n={2} title="Projects" />
            <div className="pv-projects">
              {PROJECT_ITEMS.map((item, i) => {
                const p = projects[item.id];
                if (!p) return null;
                const showRepo = p.repo && !p.repoPrivate;
                // One unlabelled carousel, or several labelled ones for a project
                // with more than one client. Empty sets are dropped.
                const sets = p.shotSets
                  ? p.shotSets.filter((set) => set.shots.length > 0)
                  : p.shots?.length
                    ? [{ id: 'shots', shots: p.shots, fit: p.shotsFit }]
                    : [];
                return (
                  <article className="pv-project" key={item.id} data-pv data-flip={i % 2 ? '' : undefined}>
                    <div className="pv-project__media">
                      {sets.length > 0 ? (
                        sets.map((set) => (
                          <figure className="pv-shotset" key={set.id}>
                            {set.label && (
                              <figcaption className="pv-shotset__cap">
                                <span className="pv-label">{set.label}</span>
                                {set.note && <span className="pv-shotset__note">{set.note}</span>}
                              </figcaption>
                            )}
                            <ShotCarousel
                              key={`${item.id}-${set.id}`}
                              shots={set.shots}
                              fit={set.fit}
                              label={`${p.title}${set.label ? ` — ${set.label}` : ' screenshots'}`}
                            />
                          </figure>
                        ))
                      ) : (
                        <div className="pv-project__tile">
                          <Icon name={item.icon} size={64} strokeWidth={1.2} />
                        </div>
                      )}
                    </div>

                    <div className="pv-project__body">
                      <span className="pv-project__index">{String(i + 1).padStart(2, '0')}</span>
                      <h3 className="pv-project__title">{p.title}</h3>
                      <p className="pv-project__tagline">{p.tagline}</p>
                      <div className="status-row">
                        <span className="status" data-state={p.status}>
                          {p.status}
                        </span>
                        {p.roles?.map((r, n) => (
                          <RoleBadge key={r} role={r} n={n} />
                        ))}
                      </div>
                      <p className="pv-project__desc">{p.description}</p>
                      {p.tech.length > 0 && (
                        <ul className="pv-tags">
                          {p.tech.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      )}
                      <div className="pv-project__links">
                        {showRepo && (
                          <a className="pv-link" href={p.repo} target="_blank" rel="noreferrer">
                            <Icon name="github" size={15} /> View repository
                          </a>
                        )}
                        {p.repo && p.repoPrivate && <span className="pv-link pv-link--muted">Private repository</span>}
                        {p.demoUrl && (
                          <a className="pv-link" href={p.demoUrl} target="_blank" rel="noreferrer">
                            <Icon name="play" size={13} /> Live demo
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* ---------- Experience ---------- */}
          <section className="pv-section" id="pv-experience">
            <SectionHead n={3} title="Experience" note="Leadership and organising, on campus" />
            <div className="pv-orgs">
              {EXPERIENCE_IDS.map((id, i) => {
                const e = experience[id];
                if (!e) return null;
                return (
                  <article className="pv-org" key={id} data-pv style={{ '--pv-i': i }}>
                    <header className="pv-org__head">
                      <h3>{e.org}</h3>
                      <p className="pv-label">
                        {e.where} · {e.span}
                      </p>
                    </header>
                    <ol className="pv-roles">
                      {e.roles.map((r) => (
                        <li className="pv-role" key={r.title} data-current={r.current || undefined}>
                          <div className="pv-role__top">
                            <h4>{r.title}</h4>
                            <span className="pv-label">
                              {r.period}
                              {r.duration && ` · ${r.duration}`}
                            </span>
                          </div>
                          <ul>
                            {r.notes.map((n) => (
                              <li key={n.slice(0, 24)}>{n}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ol>
                  </article>
                );
              })}
            </div>
          </section>

          {/* ---------- Credentials & education ---------- */}
          <section className="pv-section" id="pv-credentials">
            <SectionHead n={4} title="Credentials" note="Click any certificate to open it" />
            <div className="pv-certs">
              {CERT_LIST.map((c, i) => (
                <a
                  className="pv-cert"
                  key={c.id}
                  href={c.file}
                  target="_blank"
                  rel="noreferrer"
                  data-pv
                  style={{ '--pv-i': i % 3 }}
                >
                  <span className="pv-cert__thumb">
                    <img src={c.thumb} alt="" loading="lazy" />
                  </span>
                  <span className="pv-cert__text">
                    <span className="pv-label">{c.kind}</span>
                    <span className="pv-cert__title">{c.title}</span>
                    <span className="pv-cert__meta">
                      {c.issuer} · {c.dateLabel}
                    </span>
                  </span>
                </a>
              ))}
            </div>

            <div className="pv-edu" data-pv>
              <h3 className="pv-edu__title">Education</h3>
              <ol>
                {[...education].reverse().map((e) => (
                  <li key={e.id}>
                    <span className="pv-edu__place">{e.institution}</span>
                    <span className="pv-label">{e.period}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* ---------- Contact ---------- */}
          <section className="pv-section pv-contact" id="pv-contact">
            <SectionHead n={5} title="Contact" />
            <h2 className="pv-contact__big" data-pv>
              {profile.quote.split(/(systems)/).map((part, i) =>
                part === 'systems' ? <em key={i}>{part}</em> : part,
              )}
            </h2>
            {email && (
              <a className="pv-contact__mail" href={email.href} data-pv>
                {email.value}
              </a>
            )}
            <div className="pv-contact__links" data-pv>
              {contacts
                .filter((c) => c.href && c.id !== 'email')
                .map((c) => (
                  <a className="pv-btn" key={c.id} href={c.href} target="_blank" rel="noreferrer">
                    <Icon name={c.icon} size={15} />
                    <span>{c.label}</span>
                  </a>
                ))}
            </div>
          </section>
        </main>

        <footer className="pv-foot">
          <span>
            © {new Date().getFullYear()} <Name />
          </span>
          <button type="button" className="pv-link" onClick={exit}>
            Prefer the interactive version? Open the XMB view
            <Icon name="arrowRight" size={13} />
          </button>
        </footer>
      </div>
    </div>
  );
}
