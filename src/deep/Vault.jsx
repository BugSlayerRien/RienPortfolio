import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon';
import psp from '../audio/psp';
import { vault } from './deepContent';
import './Vault.css';

async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * The sealed cube at the bottom of the deep page.
 *
 * Three states. `sealed`: a tilted cube with a lock on its face. Clicking it
 * turns the cube a quarter to bring round the face that holds the passcode
 * field — `open`. The right code bursts the faces outward and leaves the core
 * glowing — `unlocked` — and the parent appends the sealed strata below.
 */
export default function Vault({ unlocked, onUnlock }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [wrong, setWrong] = useState(false);
  const [checking, setChecking] = useState(false);
  const inputRef = useRef(null);

  const state = unlocked ? 'unlocked' : open ? 'open' : 'sealed';

  // Focus once the input face has swung round to the front.
  useEffect(() => {
    if (state !== 'open') return undefined;
    const id = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 480);
    return () => clearTimeout(id);
  }, [state]);

  const reveal = () => {
    psp.play('enter');
    setOpen(true);
  };

  const seal = () => {
    psp.play('back');
    setOpen(false);
    setCode('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (checking || !code.trim()) return;

    setChecking(true);
    const match = (await sha256(code.trim().toLowerCase())) === vault.hash;
    setChecking(false);

    if (match) {
      psp.play('impact');
      onUnlock();
      return;
    }

    psp.play('error');
    setCode('');
    // Re-trigger the shake even on back-to-back misses.
    setWrong(false);
    requestAnimationFrame(() => setWrong(true));
  };

  return (
    <div className="vault" data-state={state} data-wrong={wrong || undefined}>
      <div
        className="vault__stage"
        onAnimationEnd={(e) => e.animationName === 'vault-shake' && setWrong(false)}
      >
        <div className="vault__cube">
          <div className="vault__face vault__face--front">
            <Icon name="lock" size={34} strokeWidth={1.3} />
          </div>

          <div className="vault__face vault__face--right">
            <form className="vault__form" onSubmit={submit}>
              <label className="vault__label mono" htmlFor="vault-code">
                Passcode
              </label>
              <span className="vault__field">
                <input
                  id="vault-code"
                  ref={inputRef}
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
                    // Escape closes the cube, not the whole deep page.
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      e.stopPropagation();
                      seal();
                    }
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={64}
                  disabled={state !== 'open'}
                  aria-invalid={wrong || undefined}
                />
                <button
                  type="submit"
                  className="vault__go"
                  disabled={state !== 'open'}
                  aria-label="Unlock"
                >
                  <Icon name="arrowRight" size={14} strokeWidth={2} />
                </button>
              </span>
            </form>
          </div>

          <div className="vault__face vault__face--back" aria-hidden="true" />
          <div className="vault__face vault__face--left" aria-hidden="true" />
          <div className="vault__face vault__face--top" aria-hidden="true" />
          <div className="vault__face vault__face--bottom" aria-hidden="true" />
        </div>

        <span className="vault__core" aria-hidden="true" />

        {state === 'sealed' && (
          <button type="button" className="vault__trigger" onClick={reveal} aria-label="Open the vault" />
        )}
      </div>

      {state === 'unlocked' ? (
        <p className="vault__note vault__note--open mono">Unsealed — keep going</p>
      ) : (
        <p className="vault__note mono">{vault.note}</p>
      )}
    </div>
  );
}
