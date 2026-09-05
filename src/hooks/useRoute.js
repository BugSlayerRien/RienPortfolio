import { useCallback, useEffect, useState } from 'react';

/**
 * A two-page router in twenty lines.
 *
 * There are exactly two destinations — the XMB at `/` and the deep dive at
 * `/deep` — so pulling in react-router would cost more than it explains.
 * `vercel.json` already rewrites every path to index.html, so a real URL works
 * on a hard refresh and can be shared.
 */
export default function useRoute() {
  const [path, setPath] = useState(() =>
    typeof window === 'undefined' ? '/' : window.location.pathname,
  );

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const go = useCallback((next) => {
    if (window.location.pathname === next) return;
    window.history.pushState({}, '', next);
    setPath(next);
  }, []);

  const back = useCallback(() => {
    // Prefer real history so the browser's back button stays honest, but fall
    // back to a push when the deep page was opened directly.
    if (window.history.length > 1) window.history.back();
    else {
      window.history.pushState({}, '', '/');
      setPath('/');
    }
  }, []);

  return { path, go, back, isDeep: path.replace(/\/+$/, '') === '/deep' };
}
