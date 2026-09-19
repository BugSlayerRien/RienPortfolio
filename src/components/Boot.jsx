import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import './Boot.css';

/**
 * Startup screen.
 *
 * Two phases. `prompt` waits for a gesture — browsers will not let the audio
 * context start without one, so the console cannot chime until the user
 * touches something. `booting` then runs the ripple-and-logo swell before
 * handing the viewport to the XMB.
 */
export default function Boot({ onStart, onFinish, reduced }) {
  const [phase, setPhase] = useState('prompt');
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const begin = () => {
    if (phase !== 'prompt') return;
    setPhase('booting');
    onStart();

    const wait = reduced ? 300 : 3200;
    timers.current.push(setTimeout(() => setPhase('done'), wait));
    timers.current.push(setTimeout(onFinish, wait + 700));
  };

  useEffect(() => {
    if (phase !== 'prompt') return undefined;
    const onKey = (e) => {
      if (e.key === 'Tab') return; // let keyboard users reach the button
      begin();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <div className="boot" data-phase={phase}>
      <div className="boot__field" aria-hidden="true">
        <span className="boot__line" />
        <span className="boot__ripple" style={{ '--d': '0s' }} />
        <span className="boot__ripple" style={{ '--d': '0.35s' }} />
        <span className="boot__ripple" style={{ '--d': '0.7s' }} />
        <span className="boot__bloom" />
      </div>

      <div className="boot__center">
        <h1 className="boot__logo">
          <span className="boot__logo-text holo-text">RIEN</span>
          <span className="boot__logo-sheen" aria-hidden="true" />
        </h1>
        <p className="boot__tagline mono">Cross Media Bar Portfolio</p>
      </div>

      {phase === 'prompt' && (
        <div className="boot__dock">
          <Controls />
          <button type="button" className="boot__prompt" onClick={begin} autoFocus>
            <span className="boot__prompt-ring" aria-hidden="true" />
            <span className="boot__prompt-label mono">Press any key to start</span>
            <span className="boot__prompt-note mono">Sound on — navigation audio is synthesized</span>
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * The controls legend, shown as the inputs themselves rather than sentences:
 * keycaps that light up in turn, a mouse whose wheel rolls. Touch screens get
 * a swipe and a tap instead — the keyboard set is hidden there by CSS.
 */
function Controls() {
  return (
    <ul className="ctls" aria-label="Controls">
      <li className="ctl ctl--desk" aria-label="Arrow keys or W A S D to move">
        <span className="ctl__pad" aria-hidden="true">
          <kbd className="ctl__key" data-dir="up" style={{ '--k': 0 }}>
            <Icon name="arrowRight" size={12} strokeWidth={2} />
          </kbd>
          <kbd className="ctl__key" data-dir="left" style={{ '--k': 3 }}>
            <Icon name="arrowRight" size={12} strokeWidth={2} />
          </kbd>
          <kbd className="ctl__key" data-dir="down" style={{ '--k': 1 }}>
            <Icon name="arrowRight" size={12} strokeWidth={2} />
          </kbd>
          <kbd className="ctl__key" data-dir="right" style={{ '--k': 2 }}>
            <Icon name="arrowRight" size={12} strokeWidth={2} />
          </kbd>
        </span>
        <span className="ctl__label mono" aria-hidden="true">Move</span>
      </li>

      <li className="ctl ctl--desk" aria-label="Enter to read">
        <kbd className="ctl__key ctl__key--wide ctl__key--pulse" aria-hidden="true">
          <Icon name="enter" size={13} strokeWidth={2} />
        </kbd>
        <span className="ctl__label mono" aria-hidden="true">Read</span>
      </li>

      <li className="ctl ctl--desk" aria-label="Escape to go back">
        <kbd className="ctl__key ctl__key--wide mono" aria-hidden="true">Esc</kbd>
        <span className="ctl__label mono" aria-hidden="true">Back</span>
      </li>

      <li className="ctl ctl--desk" aria-label="Mouse wheel to scroll">
        <span className="ctl__mouse" aria-hidden="true">
          <i />
        </span>
        <span className="ctl__label mono" aria-hidden="true">Scroll</span>
      </li>

      <li className="ctl ctl--touch" aria-label="Swipe to move">
        <span className="ctl__swipe" aria-hidden="true">
          <i />
        </span>
        <span className="ctl__label mono" aria-hidden="true">Swipe</span>
      </li>

      <li className="ctl ctl--touch" aria-label="Tap to read">
        <span className="ctl__tap" aria-hidden="true">
          <i />
        </span>
        <span className="ctl__label mono" aria-hidden="true">Tap</span>
      </li>
    </ul>
  );
}
