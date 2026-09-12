import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import WaveField from './components/WaveField';
import Xmb from './components/Xmb';
import Hud from './components/Hud';
import Boot from './components/Boot';
import Blade from './components/Blade';
import BladeContent from './components/blades/BladeContent';
import useIdle from './hooks/useIdle';
import useReducedMotion from './hooks/useReducedMotion';
import useRoute from './hooks/useRoute';
import DeepPage from './deep/DeepPage';
import psp from './audio/psp';
import { categories } from './data/content';
import './App.css';

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export default function App() {
  const [booted, setBooted] = useState(false);
  const [catIndex, setCatIndex] = useState(1); // open on Profile, not Settings
  const [itemIndex, setItemIndex] = useState(0);
  const [settled, setSettled] = useState({ ci: 1, ii: 0 }); // what the panel is showing
  const [reading, setReading] = useState(false); // panel has the keyboard
  const [dropping, setDropping] = useState(false); // the fall into /deep

  const [soundOn, setSoundOnState] = useState(true);
  const [volume, setVolumeState] = useState(0.55);
  const [motionOn, setMotionOn] = useState(true);

  const { go, back, isDeep } = useRoute();

  const systemReduced = useReducedMotion();
  const reduced = systemReduced || !motionOn;
  const idle = useIdle(6500) && !reading;

  const category = categories[catIndex];
  const item = category.items[clamp(itemIndex, 0, category.items.length - 1)];

  /**
   * The panel follows the cursor with no confirm step — landing on an item is
   * enough to read it. It lags the cursor by a beat so holding a direction down
   * does not tear through a dozen panels on the way past.
   */
  useEffect(() => {
    if (settled.ci === catIndex && settled.ii === itemIndex) return undefined;
    const id = setTimeout(() => setSettled({ ci: catIndex, ii: itemIndex }), 180);
    return () => clearTimeout(id);
  }, [catIndex, itemIndex, settled]);

  const panelCategory = categories[settled.ci];
  const panelItem = panelCategory.items[settled.ii];
  // Socials fans out on the bar itself, so it has nothing to show here.
  const panelOpen = booted && !isDeep && !dropping && panelCategory.mode !== 'burst';

  /* ---------- audio plumbing ---------- */

  useEffect(() => {
    psp.setEnabled(soundOn);
    if (soundOn && booted) psp.startAmbient();
  }, [soundOn, booted]);

  useEffect(() => {
    psp.setVolume(volume);
  }, [volume]);

  const setSoundOn = useCallback((on) => {
    setSoundOnState(on);
    if (on) {
      psp.setEnabled(true);
      psp.play('toggle');
    } else {
      psp.play('back');
      // Let the cancel blip finish before the graph goes quiet.
      setTimeout(() => psp.setEnabled(false), 260);
    }
  }, []);

  const setVolume = useCallback((v) => {
    setVolumeState(v);
    psp.setVolume(v);
  }, []);

  /* ---------- navigation ---------- */

  const moveCategory = useCallback(
    (delta) => {
      setCatIndex((ci) => {
        const next = clamp(ci + delta, 0, categories.length - 1);
        if (next !== ci) {
          setItemIndex(0);
          psp.play('sweep');
        }
        return next;
      });
    },
    [],
  );

  const moveItem = useCallback(
    (delta) => {
      setItemIndex((ii) => {
        const max = categories[catIndex].items.length - 1;
        const next = clamp(ii + delta, 0, max);
        if (next !== ii) psp.play('cursor');
        return next;
      });
    },
    [catIndex],
  );

  const hoverCategory = useCallback(
    (ci) => {
      if (ci === catIndex) return;
      setCatIndex(ci);
      setItemIndex(0);
      psp.play('sweep');
    },
    [catIndex],
  );

  const hoverItem = useCallback(
    (ci, ii) => {
      if (ci !== catIndex) {
        setCatIndex(ci);
        setItemIndex(ii);
        psp.play('sweep');
        return;
      }
      if (ii === itemIndex) return;
      setItemIndex(ii);
      psp.play('cursor');
    },
    [catIndex, itemIndex],
  );

  /**
   * Confirm. The panel is already showing, so this hands it the keyboard for
   * reading rather than opening it.
   *
   * A burst column (Socials) has no panel — its entries are links. A real click
   * on the anchor navigates on its own, so we only open the URL ourselves when
   * the press came from the keyboard.
   */
  const activate = useCallback((ci, ii, fromKeyboard = false) => {
    const cat = categories[ci];
    const item = cat.items[ii];

    setCatIndex(ci);
    setItemIndex(ii);

    if (cat.mode === 'burst') {
      psp.play(item?.href ? 'enter' : 'error');
      if (fromKeyboard && item?.href) {
        if (item.href.startsWith('mailto:')) window.location.href = item.href;
        else window.open(item.href, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    // Confirming skips the settle delay — you asked for this one.
    setSettled({ ci, ii });
    setReading(true);
    psp.play('enter');
  }, []);

  const close = useCallback(() => {
    setReading((r) => {
      if (r) psp.play('back');
      return false;
    });
  }, []);

  /* ---------- keyboard: WASD + arrows + PlayStation-style confirm ---------- */

  useEffect(() => {
    if (!booted || isDeep) return undefined;

    const onKey = (e) => {
      // Never hijack typing.
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const k = e.key.toLowerCase();

      if (reading) {
        // The panel owns the arrows in here (useKeyScroll); we own the way out.
        if (k === 'escape' || k === 'backspace' || k === 'o') {
          e.preventDefault();
          close();
        }
        return;
      }

      switch (k) {
        case 'arrowleft':
        case 'a':
          e.preventDefault();
          moveCategory(-1);
          break;
        case 'arrowright':
        case 'd':
          e.preventDefault();
          moveCategory(1);
          break;
        case 'arrowup':
        case 'w':
          e.preventDefault();
          moveItem(-1);
          break;
        case 'arrowdown':
        case 's':
          e.preventDefault();
          moveItem(1);
          break;
        case 'enter':
        case ' ':
        case 'x':
          e.preventDefault();
          activate(catIndex, itemIndex, true);
          break;
        case 'm':
          e.preventDefault();
          setSoundOn(!soundOn);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [booted, isDeep, reading, catIndex, itemIndex, soundOn, moveCategory, moveItem, activate, close, setSoundOn]);

  /* ---------- wheel drives the cursor, unless it is over the panel ---------- */

  const wheelLock = useRef(0);

  useEffect(() => {
    if (!booted || reading || isDeep) return undefined;

    const onWheel = (e) => {
      // The panel is always on screen now, so scrolling it must stay scrolling
      // it rather than walking the cursor down the bar underneath.
      if (e.target?.closest?.('.blade__panel')) return;

      const now = performance.now();
      if (now - wheelLock.current < 190) return;

      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const amount = horizontal ? e.deltaX : e.deltaY;
      if (Math.abs(amount) < 4) return;

      wheelLock.current = now;
      if (horizontal) moveCategory(Math.sign(amount));
      else moveItem(Math.sign(amount));
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [booted, isDeep, reading, moveCategory, moveItem]);

  /* ---------- touch: swipe the bar ---------- */

  useEffect(() => {
    if (!booted || reading || isDeep) return undefined;
    let sx = 0;
    let sy = 0;
    let onPanel = false;

    const start = (e) => {
      onPanel = Boolean(e.target?.closest?.('.blade__panel'));
      sx = e.changedTouches[0].clientX;
      sy = e.changedTouches[0].clientY;
    };

    const end = (e) => {
      if (onPanel) return;
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 42) return;
      if (Math.abs(dx) > Math.abs(dy)) moveCategory(dx < 0 ? 1 : -1);
      else moveItem(dy < 0 ? 1 : -1);
    };

    window.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('touchend', end, { passive: true });
    return () => {
      window.removeEventListener('touchstart', start);
      window.removeEventListener('touchend', end);
    };
  }, [booted, isDeep, reading, moveCategory, moveItem]);

  /* ---------- boot ---------- */

  const onBootStart = useCallback(() => {
    psp.unlock();
    psp.setVolume(volume);
    psp.play('boot');
  }, [volume]);

  const onBootFinish = useCallback(() => {
    setBooted(true);
    psp.startAmbient();
  }, []);

  /**
   * The cat. Down we go — but not instantly: the interface collapses like a
   * CRT losing power first, down to a scan line and then to a point. The
   * route only changes once that point has all but gone.
   */
  const dive = useCallback(() => {
    if (dropping) return;
    psp.play('drop');
    psp.stopAmbient();
    setReading(false);
    setDropping(true);
    setTimeout(() => {
      go('/deep');
      setDropping(false);
    }, 500);
  }, [go, dropping]);

  const surface = useCallback(() => {
    back();
    psp.play('back');
    if (soundOn) psp.startAmbient();
  }, [back, soundOn]);

  /** Settings -> Power Off. Winds the console back to the start screen. */
  const powerOff = useCallback(() => {
    psp.play('back');
    setReading(false);
    psp.stopAmbient();
    // Let the cancel blip land before the screen goes dark.
    setTimeout(() => {
      setBooted(false);
      setCatIndex(1);
      setItemIndex(0);
      setSettled({ ci: 1, ii: 0 });
    }, 260);
  }, []);

  const settings = useMemo(
    () => ({ soundOn, setSoundOn, volume, setVolume, motionOn, setMotionOn, onPowerOff: powerOff }),
    [soundOn, setSoundOn, volume, setVolume, motionOn, powerOff],
  );

  const columns = categories.length > 1 ? catIndex / (categories.length - 1) : 0;

  return (
    <div
      className="app"
      data-booted={booted || undefined}
      data-dropping={dropping || undefined}
      data-panel={panelOpen || undefined}
      data-reading={reading || undefined}
    >
      <WaveField
        columns={columns}
        intensity={reduced ? 0.55 : 1}
        idle={idle && !reduced}
        reduced={reduced}
      />

      <Xmb
        categories={categories}
        catIndex={catIndex}
        itemIndex={itemIndex}
        onHoverCategory={hoverCategory}
        onHoverItem={hoverItem}
        onActivate={activate}
        dimmed={reading}
        idle={idle && !reduced}
      />

      <Hud
        breadcrumb={{ category: category.label, item: item.title }}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn(!soundOn)}
        bladeOpen={reading}
        onBack={close}
        onCat={dive}
      />

      <Blade
        open={panelOpen}
        reading={reading}
        category={panelCategory.label}
        title={panelItem.title}
        subtitle={panelItem.subtitle}
        onClose={close}
      >
        <BladeContent item={panelItem} settings={settings} />
      </Blade>

      {!booted && <Boot onStart={onBootStart} onFinish={onBootFinish} reduced={systemReduced} />}

      {isDeep && <DeepPage onExit={surface} />}
    </div>
  );
}
