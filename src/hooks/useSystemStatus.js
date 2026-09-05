import { useEffect, useState } from 'react';

/**
 * Real device readouts for the status bar.
 *
 * The bar used to draw a battery hardcoded at 78% and three signal bars that
 * were pure decoration. These are the genuine article:
 *
 *   battery  — Battery Status API. Chromium-only, so `supported` says whether
 *              there is anything real to show; render something else when not.
 *   network  — `navigator.onLine` works everywhere, so the online/offline state
 *              is always truthful. Network Information API adds the effective
 *              connection type (4g / 3g / 2g) on Chromium, which sets the bar
 *              count; elsewhere it stays null and we show full bars for online.
 */
export default function useSystemStatus() {
  const [battery, setBattery] = useState({ supported: false, level: null, charging: false });
  const [network, setNetwork] = useState(() => ({
    online: typeof navigator === 'undefined' ? true : navigator.onLine,
    effectiveType: null,
  }));

  // --- battery -------------------------------------------------------
  useEffect(() => {
    if (typeof navigator === 'undefined' || typeof navigator.getBattery !== 'function') return undefined;

    let cancelled = false;
    let batteryRef = null;

    const read = (b) => {
      if (cancelled) return;
      setBattery({ supported: true, level: b.level, charging: b.charging });
    };

    navigator
      .getBattery()
      .then((b) => {
        if (cancelled) return;
        batteryRef = b;
        read(b);
        const onChange = () => read(b);
        b.addEventListener('levelchange', onChange);
        b.addEventListener('chargingchange', onChange);
        batteryRef._onChange = onChange;
      })
      .catch(() => {
        /* some browsers reject in insecure contexts — stay unsupported */
      });

    return () => {
      cancelled = true;
      if (batteryRef && batteryRef._onChange) {
        batteryRef.removeEventListener('levelchange', batteryRef._onChange);
        batteryRef.removeEventListener('chargingchange', batteryRef._onChange);
      }
    };
  }, []);

  // --- network -------------------------------------------------------
  useEffect(() => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    const read = () => {
      setNetwork({
        online: navigator.onLine,
        effectiveType: conn && conn.effectiveType ? conn.effectiveType : null,
      });
    };

    read();
    window.addEventListener('online', read);
    window.addEventListener('offline', read);
    if (conn) conn.addEventListener('change', read);

    return () => {
      window.removeEventListener('online', read);
      window.removeEventListener('offline', read);
      if (conn) conn.removeEventListener('change', read);
    };
  }, []);

  // 0 bars offline, otherwise 1-3 from the effective type (3 when unknown).
  let bars = 0;
  if (network.online) {
    switch (network.effectiveType) {
      case 'slow-2g':
      case '2g':
        bars = 1;
        break;
      case '3g':
        bars = 2;
        break;
      default:
        bars = 3;
    }
  }

  return { battery, network, bars };
}
