import { useEffect, useRef, useState } from 'react';
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
        <button type="button" className="boot__prompt" onClick={begin} autoFocus>
          <span className="boot__prompt-ring" aria-hidden="true" />
          <span className="boot__prompt-label mono">Press any key to start</span>
          <span className="boot__prompt-note mono">Sound on — navigation audio is synthesized</span>
        </button>
      )}
    </div>
  );
}
