import Icon from '../Icon';
import { Section, Card, Chips, Prose, Row } from './Parts';
import CommentBlade from './CommentBlade';
import {
  profile,
  about,
  education,
  location as campus,
  projects,
  certificates,
  honors,
  experience,
  system,
} from '../../data/content';

/* ---------------------------------------------------------- */

function AboutBlade() {
  return (
    <>
      <Card tilt={false}>
        <div className="hero">
          <div className="hero__portrait">
            <img src={profile.avatar} alt="" width="136" height="136" />
          </div>
          <div className="hero__meta">
            <p className="hero__name holo-text">{profile.fullName}</p>
            <p className="hero__role">{profile.occupation}</p>
            <p className="hero__tag">{profile.tagline}</p>
          </div>
        </div>
      </Card>

      <Section>
        <Prose>
          <p>
            <strong>{about.intro}</strong>
          </p>
          {about.body.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </Prose>
      </Section>

      <Section>
        <div className="btn-row">
          <a className="btn" href={profile.cv} download={profile.cvFileName}>
            <Icon name="download" size={14} /> Download CV
          </a>
        </div>
      </Section>

      <Section title="Education">
        <div className="timeline">
          {education.map((e) => (
            <div className="tnode" key={e.id} data-reveal>
              <p className="tnode__period">{e.period}</p>
              <p className="tnode__place">{e.institution}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function EducationBlade() {
  return (
    <>
      <Section note="Where the last decade and a bit went.">
        <div className="timeline">
          {education.map((e) => (
            <div className="tnode" key={e.id} data-reveal>
              <p className="tnode__period">{e.period}</p>
              <p className="tnode__place">{e.institution}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Current">
        <Card>
          <p className="node__label">Enrolled</p>
          <p className="node__value">{education[education.length - 1].institution}</p>
          <Chips items={['Information Technology', '4th Year']} />
        </Card>
      </Section>
    </>
  );
}

function LocationBlade() {
  return (
    <Section title={campus.title} note={campus.name}>
      <div className="embed embed--map" data-reveal>
        <iframe
          src={campus.embed}
          title={`Map of ${campus.name}`}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </Section>
  );
}

function ProjectBlade({ id }) {
  const p = projects[id];
  if (!p) return null;

  // A private repo link would 404 for every visitor, so it stays a plain note
  // until `repoPrivate` is flipped to false.
  const showRepoLink = p.repo && !p.repoPrivate;

  return (
    <>
      <Section>
        <span className="status" data-state={p.status}>
          {p.status}
        </span>
        <Prose>
          <p>
            <strong>{p.tagline}</strong>
          </p>
          <p>{p.description}</p>
        </Prose>
      </Section>

      {p.tech.length > 0 && (
        <Section title="Stack">
          <Chips items={p.tech} />
        </Section>
      )}

      <Section>
        <div className="btn-row">
          {p.demoUrl && (
            <a className="btn" href={p.demoUrl} target="_blank" rel="noreferrer">
              <Icon name="play" size={14} /> Live demo
            </a>
          )}
          {showRepoLink && (
            <a className="btn btn--ghost" href={p.repo} target="_blank" rel="noreferrer">
              <Icon name="github" size={14} /> View code
            </a>
          )}
          {p.repo && p.repoPrivate && (
            <span className="btn btn--muted" aria-disabled="true">
              <Icon name="github" size={14} /> Private repository
            </span>
          )}
        </div>
      </Section>

      <Section title="Other projects">
        <div className="grid-2">
          {Object.entries(projects)
            .filter(([key]) => key !== id)
            .map(([key, other]) => (
              <Card key={key}>
                <p className="node__label">{other.status}</p>
                <p className="node__value">{other.title}</p>
                {other.tech.length > 0 && <Chips items={other.tech.slice(0, 3)} />}
              </Card>
            ))}
        </div>
      </Section>
    </>
  );
}

/** One certificate: the real page render, then the details and the PDF. */
function CertificateBlade({ id }) {
  const c = certificates[id];
  if (!c) return null;

  return (
    <>
      <Section>
        <a className="certframe" href={c.file} target="_blank" rel="noreferrer" data-reveal>
          <img src={c.thumb} alt={`${c.kind} — ${c.title}`} loading="lazy" />
          <span className="certframe__glare" aria-hidden="true" />
          <span className="certframe__open mono">
            <Icon name="play" size={12} /> Open full size
          </span>
        </a>
      </Section>

      <Section>
        <Card tilt={false}>
          <Row label="Type" value={c.kind} />
          <Row label="Issued by" value={c.issuer} />
          <Row label="Date" value={c.dateLabel} />
        </Card>
        <p className="bsection__note">{c.note}</p>
      </Section>

      <Section>
        <div className="btn-row">
          <a className="btn" href={c.file} target="_blank" rel="noreferrer">
            <Icon name="certificate" size={14} /> View PDF
          </a>
          <a className="btn btn--ghost" href={c.file} download>
            <Icon name="download" size={14} /> Download
          </a>
        </div>
      </Section>

      <Section title="Other credentials">
        <div className="grid-2">
          {Object.entries(certificates)
            .filter(([key]) => key !== id)
            .slice(0, 4)
            .map(([key, other]) => (
              <Card key={key}>
                <p className="node__label">{other.dateLabel}</p>
                <p className="node__value">{other.title}</p>
                <p className="bsection__note">{other.kind}</p>
              </Card>
            ))}
        </div>
      </Section>
    </>
  );
}

const HONOR_ICONS = ['award', 'medal', 'star', 'trophy', 'users', 'code'];

function HonorsBlade() {
  return (
    <>
      <Section note={honors.note} />
      {honors.groups.map((g) => (
        <Section key={g.institution} title={g.institution} note={g.period}>
          <Card tilt={false}>
            <ul className="achievements">
              {g.items.map((a, i) => (
                <li className="ach" key={a}>
                  <Icon name={HONOR_ICONS[i % HONOR_ICONS.length]} size={18} className="ach__icon" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      ))}
    </>
  );
}

/** One organisation and every role held inside it. */
function ExperienceBlade({ id }) {
  const e = experience[id];
  if (!e) return null;

  return (
    <>
      <Section>
        <Card tilt={false}>
          <p className="node__label">{e.where}</p>
          <p className="hero__name holo-text">{e.org}</p>
          <Chips items={[e.span, `${e.roles.length} ${e.roles.length === 1 ? 'role' : 'roles'}`]} />
        </Card>
      </Section>

      <Section title="Roles">
        <div className="roles">
          {e.roles.map((r) => (
            <article className="role" key={r.title} data-current={r.current || undefined} data-reveal>
              <header className="role__head">
                <h4 className="role__title">{r.title}</h4>
                <span className="role__period mono">
                  {r.period}
                  <em>{r.duration}</em>
                </span>
              </header>
              <ul className="role__notes">
                {r.notes.map((n) => (
                  <li key={n.slice(0, 28)}>{n}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Elsewhere">
        <div className="grid-2">
          {Object.entries(experience)
            .filter(([key]) => key !== id)
            .map(([key, other]) => (
              <Card key={key}>
                <p className="node__label">{other.span}</p>
                <p className="node__value">{other.org}</p>
                <p className="bsection__note">
                  {other.roles.length} {other.roles.length === 1 ? 'role' : 'roles'}
                </p>
              </Card>
            ))}
        </div>
      </Section>
    </>
  );
}

function SettingsBlade({ settings }) {
  const { soundOn, setSoundOn, volume, setVolume, motionOn, setMotionOn } = settings;

  return (
    <>
      <Section title="Sound">
        <button
          type="button"
          className="toggle"
          aria-pressed={soundOn}
          onClick={() => setSoundOn(!soundOn)}
        >
          <span className="toggle__text">
            <span className="toggle__name">Navigation audio</span>
            <span className="toggle__desc">Cursor ticks, confirms, and the ambient wave</span>
          </span>
          <span className="toggle__switch" />
        </button>

        <div className="slider">
          <label className="row__label mono" htmlFor="vol">
            <Icon name="sound" size={15} /> Volume — {Math.round(volume * 100)}%
          </label>
          <input
            id="vol"
            type="range"
            min="0"
            max="100"
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
      </Section>

      <Section title="Display">
        <button
          type="button"
          className="toggle"
          aria-pressed={motionOn}
          onClick={() => setMotionOn(!motionOn)}
        >
          <span className="toggle__text">
            <span className="toggle__name">Ambient motion</span>
            <span className="toggle__desc">Floating motes, shimmer, and the drifting wave</span>
          </span>
          <span className="toggle__switch" />
        </button>
      </Section>

      <p className="notice">
        These settings live in this browser only and reset on a hard refresh. If your system asks for
        reduced motion, ambient animation is switched off automatically.
      </p>
    </>
  );
}

/** Power off — winds the console back to the start screen. */
function PowerBlade({ settings }) {
  return (
    <>
      <Section>
        <Prose>
          <p>
            <strong>Shut the terminal down?</strong>
          </p>
          <p>
            The interface powers off and returns to the start screen. Nothing is lost — press any key
            there to boot it back up.
          </p>
        </Prose>
      </Section>

      <Section>
        <div className="btn-row">
          <button type="button" className="btn btn--danger" onClick={settings.onPowerOff}>
            <Icon name="power" size={14} /> Power off
          </button>
        </div>
      </Section>
    </>
  );
}

function SystemBlade() {
  return (
    <>
      {/* No section title — the blade header already says it. */}
      <Section>
        <Card tilt={false}>
          {system.rows.map(([label, value]) => (
            <Row key={label} label={label} value={value} />
          ))}
        </Card>
      </Section>

      <p className="notice">{system.note}</p>
    </>
  );
}

/* ---------------------------------------------------------- */

/** Picks the panel body for the selected item. */
export default function BladeContent({ item, settings }) {
  if (!item) return null;

  switch (item.blade) {
    case 'about':
      return <AboutBlade />;
    case 'education':
      return <EducationBlade />;
    case 'location':
      return <LocationBlade />;
    case 'project':
      return <ProjectBlade id={item.id} />;
    case 'certificate':
      return <CertificateBlade id={item.id} />;
    case 'honors':
      return <HonorsBlade />;
    case 'experience':
      return <ExperienceBlade id={item.id} />;
    case 'comments':
      return <CommentBlade />;
    case 'settings':
      return <SettingsBlade settings={settings} />;
    case 'power':
      return <PowerBlade settings={settings} />;
    case 'system':
      return <SystemBlade />;
    default:
      return null;
  }
}
