import { useEffect, useState } from 'react';
import Icon from './Icon';
import useSystemStatus from '../hooks/useSystemStatus';
import { profile } from '../data/content';
import './Hud.css';

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const pad = (n) => String(n).padStart(2, '0');

/**
 * The console furniture: brand, CV download and real device status along the
 * top; the current breadcrumb and button legend along the bottom.
 *
 * Everything in the status cluster reports something true — battery from the
 * Battery Status API where it exists, connection from `navigator.onLine` plus
 * the Network Information API, and the clock. Where the battery API is missing
 * (Firefox, Safari) the slot shows the date instead of faking a charge level.
 */
export default function Hud({ breadcrumb, soundOn, onToggleSound, bladeOpen, onBack, onCat }) {
  const now = useClock();
  const { battery, network, bars } = useSystemStatus();

  const hh = now.getHours();
  const clock = `${pad(hh % 12 || 12)}:${pad(now.getMinutes())}`;
  const meridiem = hh < 12 ? 'AM' : 'PM';
  const dateLabel = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const pct = battery.supported ? Math.round(battery.level * 100) : null;
  const netLabel = network.online ? (network.effectiveType || 'online').toUpperCase() : 'OFFLINE';

  return (
    <div className="hud" data-blade={bladeOpen || undefined}>
      <header className="hud__top">
        <div className="hud__brand">
          <span className="hud__brand-mark holo-text">RIEN</span>
          <span className="hud__brand-sub mono">XMB PORTFOLIO</span>
        </div>

        <div className="hud__status">
          <a
            className="hud__cv"
            href={profile.cv}
            download={profile.cvFileName}
            title="Download CV (PDF)"
          >
            <span className="hud__cv-ring" aria-hidden="true" />
            <Icon name="download" size={14} />
            <span className="mono">Download CV</span>
          </a>

          <button
            type="button"
            className="hud__chip"
            onClick={onToggleSound}
            aria-pressed={soundOn}
            title={soundOn ? 'Mute navigation sound' : 'Unmute navigation sound'}
          >
            <Icon name="sound" size={15} />
            <span className="mono">{soundOn ? 'ON' : 'OFF'}</span>
          </button>

          {/* Real connection state. */}
          <span
            className="hud__signal"
            data-offline={!network.online || undefined}
            title={network.online ? `Connection: ${netLabel}` : 'Offline'}
            aria-label={network.online ? `Connection ${netLabel}` : 'Offline'}
          >
            {network.online ? (
              <>
                <i data-on={bars >= 1 || undefined} />
                <i data-on={bars >= 2 || undefined} />
                <i data-on={bars >= 3 || undefined} />
              </>
            ) : (
              <Icon name="wifiOff" size={14} />
            )}
          </span>

          {/* Real battery where the API exists; the date where it does not. */}
          {battery.supported ? (
            <span
              className="hud__battery"
              data-charging={battery.charging || undefined}
              data-low={pct <= 20 || undefined}
              title={`Battery ${pct}%${battery.charging ? ' — charging' : ''}`}
              aria-label={`Battery ${pct} percent`}
            >
              <span className="hud__battery-cell" style={{ width: `${Math.max(pct, 4)}%` }} />
              <span className="hud__battery-pct mono">{pct}</span>
            </span>
          ) : (
            <span className="hud__date mono" title="Today">
              {dateLabel}
            </span>
          )}

          <span className="hud__clock mono">
            {clock}
            <em>{meridiem}</em>
          </span>

          {/* The way down. Deliberately not styled as a button — it reads as
              one more status glyph until you hover it. */}
          <button
            type="button"
            className="hud__cat"
            onClick={onCat}
            aria-label="There is something else here"
          >
            <Icon name="cat" size={17} strokeWidth={1.4} />
          </button>
        </div>
      </header>

      <footer className="hud__bottom">
        <nav className="hud__crumbs mono" aria-live="polite">
          <span className="hud__crumb-cat">{breadcrumb.category}</span>
          <Icon name="arrowRight" size={13} className="hud__crumb-sep" />
          <span className="hud__crumb-item">{breadcrumb.item}</span>
        </nav>

        <div className="hud__legend">
          {bladeOpen ? (
            <button type="button" className="hud__key" onClick={onBack}>
              <kbd className="hud__kbd mono" aria-hidden="true">Esc</kbd>
              <span className="mono">Back</span>
            </button>
          ) : (
            <>
              <span className="hud__key">
                <span className="hud__glyph hud__glyph--dpad" aria-hidden="true">
                  <Icon name="arrowLeft" size={11} />
                  <Icon name="arrowRight" size={11} />
                </span>
                <span className="mono">Arrows / WASD</span>
              </span>
              <span className="hud__key">
                <kbd className="hud__kbd" aria-hidden="true">
                  <Icon name="enter" size={12} strokeWidth={2} />
                </kbd>
                <span className="mono">Enter to read</span>
              </span>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
