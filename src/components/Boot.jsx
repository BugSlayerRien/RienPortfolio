import { useEffect, useRef, useState } from 'react';
import usePointerField from '../hooks/usePointerField';
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
const LOGO = ['R', 'I', 'E', 'N'];

export default function Boot({ onStart, onFinish, reduced, onPlain }) {
  const [phase, setPhase] = useState('prompt');
  const timers = useRef([]);
  const rootRef = useRef(null);

  // Only while the screen is waiting — once it is booting, nothing should
  // be dragging the logo around.
  usePointerField(rootRef, { enabled: phase === 'prompt' && !reduced });

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const begin = () => {
    if (phase !== 'prompt') return;
    setPhase('booting');
    onStart();

    const wait = reduced ? 300 : 1250;
    timers.current.push(setTimeout(() => setPhase('done'), wait));
    timers.current.push(setTimeout(onFinish, wait + 420));
  };

  useEffect(() => {
    if (phase !== 'prompt') return undefined;
    const onKey = (e) => {
      if (e.key === 'Tab') return; // let keyboard users reach the button
      if (e.target?.closest?.('.boot__plain')) return; // Enter on that link means the link
      begin();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <div className="boot" data-phase={phase} ref={rootRef}>
      {/* Scanner furniture: a fixed frame, and a grid the cursor uncovers. */}
      <div className="boot__frame" aria-hidden="true">
        <span /><span /><span /><span />
      </div>
      <div className="boot__scan" aria-hidden="true">
        <span className="boot__scan-grid" />
        <span className="boot__scan-wake" />
        <span className="boot__scan-x" />
        <span className="boot__scan-y" />
        <span className="boot__scan-ring" />
      </div>

      <div className="boot__field" aria-hidden="true">
        <span className="boot__line" />
        <span className="boot__ripple" style={{ '--d': '0s' }} />
        <span className="boot__ripple" style={{ '--d': '0.12s' }} />
        <span className="boot__ripple" style={{ '--d': '0.24s' }} />
        <span className="boot__bloom" />
      </div>

      {phase === 'prompt' && (
        <button type="button" className="boot__plain" onClick={onPlain}>
          Skip to plain view
        </button>
      )}

      <div className="boot__center">
        <h1 className="boot__logo" aria-label="RIEN">
          <span className="boot__logo-text">
            {LOGO.map((ch, i) => (
              <span
                className="boot__ch holo-text"
                key={ch}
                data-repel
                style={{ '--ci': i / (LOGO.length - 1) }}
                aria-hidden="true"
              >
                {ch}
              </span>
            ))}
          </span>
          <span className="boot__logo-sheen" aria-hidden="true" />
        </h1>
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
      <li className="ctl ctl--desk" data-repel aria-label="Arrow keys or W A S D to move">
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

      <li className="ctl ctl--desk" data-repel aria-label="Enter to read">
        <kbd className="ctl__key ctl__key--wide ctl__key--pulse" aria-hidden="true">
          <Icon name="enter" size={13} strokeWidth={2} />
        </kbd>
        <span className="ctl__label mono" aria-hidden="true">Read</span>
      </li>

      <li className="ctl ctl--desk" data-repel aria-label="Escape to go back">
        <kbd className="ctl__key ctl__key--wide mono" aria-hidden="true">Esc</kbd>
        <span className="ctl__label mono" aria-hidden="true">Back</span>
      </li>

      <li className="ctl ctl--desk" data-repel aria-label="Mouse wheel to scroll">
        <span className="ctl__mouse" aria-hidden="true">
          <i />
        </span>
        <span className="ctl__label mono" aria-hidden="true">Scroll</span>
      </li>

      <li className="ctl ctl--touch" data-repel aria-label="Swipe to move">
        <span className="ctl__swipe" aria-hidden="true">
          <i />
        </span>
        <span className="ctl__label mono" aria-hidden="true">Swipe</span>
      </li>

      <li className="ctl ctl--touch" data-repel aria-label="Tap to read">
        <span className="ctl__tap" aria-hidden="true">
          <i />
        </span>
        <span className="ctl__label mono" aria-hidden="true">Tap</span>
      </li>
    </ul>
  );
}
