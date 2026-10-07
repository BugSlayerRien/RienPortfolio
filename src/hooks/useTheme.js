import { useCallback, useEffect, useState } from 'react';

const KEY = 'xmb:theme';

/**
 * The colour themes, in the order the switch cycles through them.
 *
 * `palette` is for the wave, which is a canvas and cannot read CSS tokens —
 * keep each one in step with its block in tokens.css. `label` is what the HUD
 * shows, so it has to stay short.
 */
export const THEMES = [
  {
    id: 'holo',
    label: 'Iris',
    palette: [
      [255, 143, 209],
      [183, 156, 255],
      [111, 220, 255],
      [138, 255, 214],
      [255, 232, 154],
    ],
  },
  {
    id: 'malevolent',
    label: 'Noir',
    palette: [
      [255, 90, 102],
      [194, 32, 63],
      [122, 16, 48],
      [224, 122, 60],
      [240, 200, 154],
    ],
  },
  {
    id: 'mono',
    label: 'Mono',
    palette: [
      [255, 255, 255],
      [201, 201, 208],
      [141, 141, 150],
      [237, 237, 241],
      [168, 168, 177],
    ],
  },
];

const indexOf = (id) => Math.max(THEMES.findIndex((t) => t.id === id), 0);

function stored() {
  try {
    return indexOf(localStorage.getItem(KEY));
  } catch {
    return 0;
  }
}

/**
 * Colour theme, kept on <html> so the boot screen and the deep page follow it
 * too, and remembered between visits.
 *
 * Three themes on one button: pressing it steps to the next and wraps around.
 * The button shows the theme you are in and names the next one in its tooltip,
 * which keeps the status bar to a single control.
 */
export default function useTheme() {
  const [index, setIndex] = useState(stored);
  const theme = THEMES[index];
  const next = THEMES[(index + 1) % THEMES.length];

  useEffect(() => {
    document.documentElement.dataset.theme = theme.id;
    try {
      localStorage.setItem(KEY, theme.id);
    } catch {
      // Private mode: it just will not be remembered.
    }
  }, [theme.id]);

  const cycleTheme = useCallback(() => {
    setIndex((i) => (i + 1) % THEMES.length);
  }, []);

  return { theme, next, cycleTheme, palette: theme.palette };
}
