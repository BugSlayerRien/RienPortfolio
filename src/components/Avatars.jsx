/**
 * Avatar heads for the comment wall.
 *
 * Original designs in a spiky-hair / large-eye JRPG idiom — tapered chins,
 * oversized highlighted eyes, layered asymmetric fringes that break the circle
 * of the frame. Nobody in here is a copy of an existing character; the look is
 * the influence, not the cast.
 *
 * One 64-unit square each so the set stays consistent, and every colour comes
 * from `PALETTES` so the whole thing reads as one pastel purple family.
 */

const PALETTES = {
  lilac: { hair: '#b9a0ee', dark: '#8464c9', skin: '#f8efff', shade: '#e3d0f7', disc: '#3a2c60', lite: '#f0e4ff' },
  orchid: { hair: '#d9bef5', dark: '#a888d4', skin: '#fdf4ff', shade: '#eeddfa', disc: '#43305f', lite: '#fbeeff' },
  peri: { hair: '#aeb2f2', dark: '#7b80cf', skin: '#f3f0ff', shade: '#dcdcf9', disc: '#2f3063', lite: '#e8e9ff' },
  plum: { hair: '#9b7fd4', dark: '#6b53a6', skin: '#f2e7fd', shade: '#ddccf3', disc: '#33235a', lite: '#e7d9fb' },
  blush: { hair: '#e7c8f2', dark: '#b48ac9', skin: '#fff6fe', shade: '#f6e3fb', disc: '#4a3163', lite: '#ffeffd' },
  mauve: { hair: '#a98ee0', dark: '#775bb4', skin: '#f5ecff', shade: '#e2d2f8', disc: '#372a5c', lite: '#ecdfff' },
  frost: { hair: '#d3c4f7', dark: '#9c86cf', skin: '#fcf8ff', shade: '#eee7fb', disc: '#2b2750', lite: '#f6f0ff' },
  dusk: { hair: '#8168c0', dark: '#57408e', skin: '#eee2fb', shade: '#d6c3ee', disc: '#241a45', lite: '#dcc9f5' },
};

const LINE = '#241a42';

/** One eye. `x` is the centre; `flip` mirrors it for the other side. */
function Eye({ x, flip, p, style }) {
  const t = `translate(${x} 29.5) scale(${flip ? -1 : 1} 1)`;

  if (style === 'closed') {
    return (
      <g transform={t}>
        <path d="M-4 -0.6c1.7 2.6 5 2.8 7.4.4" stroke={LINE} strokeWidth="1.7" fill="none" strokeLinecap="round" />
      </g>
    );
  }

  // Narrower and more angled for 'sharp'; rounder and taller for 'soft'.
  const body =
    style === 'sharp'
      ? 'M-4.1 -0.9c1-2.6 4.4-3.4 6.6-1.5 1.1 1 1.6 2 1.7 2.9-1.7 2.3-6 2.6-8 .7-.5-.5-.6-1.4-.3-2.1z'
      : style === 'soft'
        ? 'M-4 -0.4c0-3 1.9-4.6 4.1-4.6s4.1 1.6 4.1 4.6c0 2.9-1.9 4.4-4.1 4.4S-4 2.5-4 -0.4z'
        : 'M-4.2 -0.8c.9-2.9 4.5-3.8 6.9-1.7 1.1 1 1.6 2.1 1.6 3.1-1.8 2.6-6.3 2.8-8.3.7-.5-.6-.5-1.4-.2-2.1z';

  // A solid dark almond reads as sunglasses at 44px. Coloured iris, small
  // pupil, big highlight — that is what makes it an eye and not a lens.
  return (
    <g transform={t}>
      <g transform="scale(0.88)">
        <path d={body} fill={p.dark} />
        <path d={body} fill="none" stroke={LINE} strokeWidth="1.1" strokeLinejoin="round" />
        <circle cx="0" cy="0.1" r="1.5" fill={LINE} />
        <circle cx="-1.1" cy="-1.2" r="1.5" fill={p.lite} />
        <circle cx="1.7" cy="1.4" r="0.7" fill={p.lite} opacity="0.8" />
      </g>
      {/* upper lash — thick, and it overshoots the outer corner */}
      <path
        d={style === 'soft' ? 'M-3.7 -1.6c.6-2.3 2.1-3.3 3.8-3.3 1.8 0 3.3 1.1 3.8 3.4' : 'M-4.3 -1.7c.9-2.7 4.4-3.7 6.8-1.7l1.9-1.2-1.1 2.2'}
        stroke={LINE}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

/** Shared head: shoulders, tapered face, brows, eyes, mouth. */
function Face({ p, eye = 'calm' }) {
  return (
    <>
      {/* shoulders + neck */}
      <path d="M27 42h10v6.5c6.4 1.2 10.8 4.6 12.6 9.5H14.4c1.8-4.9 6.2-8.3 12.6-9.5z" fill={p.skin} />
      <path d="M27 45.4c2.4 2.4 7.6 2.4 10 0V42H27z" fill={p.shade} />

      {/* face — wide at the temples, hard taper to a pointed chin */}
      <path
        d="M32 12.6c7.9 0 12.2 5.4 12.2 13.6 0 6.1-2.2 11.9-5.1 15.6-2 2.5-4.4 4-7.1 4s-5.1-1.5-7.1-4c-2.9-3.7-5.1-9.5-5.1-15.6 0-8.2 4.3-13.6 12.2-13.6z"
        fill={p.skin}
      />
      {/* cheek shading keeps the taper readable at 40px */}
      <path d="M24.6 33c1.2 4 3 7.2 5 9.2-3.4-1-6.2-4.4-7.4-8.6zM39.4 33c-1.2 4-3 7.2-5 9.2 3.4-1 6.2-4.4 7.4-8.6z" fill={p.shade} opacity="0.55" />

      {/* brows */}
      <path d="M22.6 24.4c1.8-1.5 4.6-1.7 6.6-.6M41.4 24.4c-1.8-1.5-4.6-1.7-6.6-.6" stroke={p.dark} strokeWidth="1.4" fill="none" strokeLinecap="round" />

      <Eye x={26.6} p={p} style={eye} />
      <Eye x={37.4} p={p} style={eye} flip />

      {/* nose + mouth */}
      <path d="M32 34.4l1.1 1.6h-2.2z" fill={p.shade} />
      <path d="M30.4 38.8c1 .9 2.2.9 3.2 0" stroke={LINE} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7" />
    </>
  );
}

/* ------------------------------------------------------------------ */

export const AVATARS = [
  {
    id: 'spike',
    label: 'Spike',
    pal: 'lilac',
    eye: 'sharp',
    back: (p) => <path d="M20 30c-2-12 3-20 12-20s14 8 12 20c-.6-7-3-11.6-6-13.4-4.4 3.4-11 3.4-14.4-.4-2 2.4-3.2 7-3.6 13.8z" fill={p.dark} />,
    front: (p) => (
      <path
        d="M19.8 27.4 22.4 8l2.4 9.6L30.2 6l1.2 11.4L37.6 7l.4 10.6L44 9.8l1.2 17.6c-1.4-6.4-3.6-10.4-6.6-11.8-4.6 4-13.6 4.2-18-.4-2.2 1.8-3.8 5.6-4.8 12.2z"
        fill={p.hair}
      />
    ),
  },
  {
    id: 'drift',
    label: 'Drift',
    pal: 'orchid',
    eye: 'calm',
    back: (p) => <path d="M18.6 34c-2-14 4.4-23 13.4-23s15.4 9 13.4 23c-.6 4.6-1.6 8.4-2.8 11.4-.2-9-1.4-15.2-3.4-19-5.4 2.6-11.6 2.6-17 0-2 3.8-3.2 10-3.4 19-1.2-3-2.2-6.8-2.8-11.4z" fill={p.dark} />,
    front: (p) => (
      <>
        <path d="M19.6 28c-.4-10.4 5-17.2 12.4-17.2S44.8 17.6 44.4 28c-1.2-6-3.2-9.8-5.6-11.2-4 5.2-14.4 6.6-18.6 2.6-.6.8-1.4 3.6-.6 8.6z" fill={p.hair} />
        {/* the long sweep that hides one eye */}
        <path d="M39.6 15.4c3 2.4 4.6 7 4.8 13.4.2 6-.8 11.4-3 16.2l-4.4-1.4c2.6-5.4 3.6-11.4 2.8-17.8z" fill={p.hair} />
        <path d="M40.4 18.2c1.6 2.4 2.4 6 2.4 10.6l-1.8-.4c.2-4.4-.2-7.8-1.4-10z" fill={p.lite} opacity="0.35" />
      </>
    ),
  },
  {
    id: 'bolt',
    label: 'Bolt',
    pal: 'peri',
    eye: 'sharp',
    back: (p) => <path d="M20 30c-2-12 3-20 12-20s14 8 12 20c-.8-6.6-3-11-6-12.8-4.4 3.2-11 3.2-14.2-.2-2 2.4-3.2 6.6-3.8 13z" fill={p.dark} />,
    front: (p) => (
      <path
        d="M19.4 28 17 15.6l4.4 5.2-.6-9.4 4.6 6.6 1-9.6 4 7.6 2.6-8.4 3 8.2 3.8-6.6.6 8.6 4.6-5-1 11.4c-1.6-5.2-4-8.4-7-9.4-4.4 3.6-12.6 3.6-17 0-2 1.2-3.8 4.4-4.6 9.2z"
        fill={p.hair}
      />
    ),
  },
  {
    id: 'veil',
    label: 'Veil',
    pal: 'blush',
    eye: 'soft',
    back: (p) => (
      <path
        d="M17.6 36c-2-15 5.6-25 14.4-25s16.4 10 14.4 25c-.8 8-2 15-3.6 21l-5-1.4c2.6-8.4 3.6-17 2.6-25.6-5.6 3-11.2 3-16.8 0-1 8.6 0 17.2 2.6 25.6l-5 1.4c-1.6-6-2.8-13-3.6-21z"
        fill={p.dark}
      />
    ),
    front: (p) => (
      <>
        <path d="M19.8 27.6c-.4-10.6 5.2-17.2 12.2-17.2s12.6 6.6 12.2 17.2c-1-6-2.6-9.8-4.6-11.4-2.4 3.6-4.8 5.8-7.6 6.8L32 17l-2 5.8c-2.8-1-5.2-3.2-7.6-6.8-2 1.6-3.6 5.4-4.6 11.4z" fill={p.hair} />
        <path d="M22.6 17.2c-1.6 2.8-2.4 7.2-2.4 12.6l-2.2-.4c-.4-6.4 1-11.2 3.2-13.6zM41.4 17.2c1.6 2.8 2.4 7.2 2.4 12.6l2.2-.4c.4-6.4-1-11.2-3.2-13.6z" fill={p.hair} />
        <path d="M30.4 16.4 32 19l1.6-2.6-1.6-2z" fill={p.lite} opacity="0.4" />
      </>
    ),
  },
  {
    id: 'crest',
    label: 'Crest',
    pal: 'plum',
    eye: 'sharp',
    back: (p) => (
      <>
        {/* high tail whipping back */}
        <path d="M34 9c2.4-5 8-7.6 13.4-5.6-3.8.8-6.2 2.6-7.4 5.2 4.2-2 8 -.6 10 2.6-3.4-1.4-6.4-1.2-8.8.4 3.4.4 5.6 2 6.6 4.6-3-1.8-6.2-2.2-9.4-1.2z" fill={p.dark} />
        <path d="M20.4 30c-2-12 3-20 11.6-20s13.6 8 11.6 20c-.8-6.6-3-11-6-12.8-4.2 3.2-10.6 3.2-13.8-.2-2 2.4-3 6.6-3.4 13z" fill={p.dark} />
      </>
    ),
    front: (p) => (
      <path
        d="M20 27.2 22 12l3.4 6.6.8-8.4 4 7 2.6-7.8 3 8 3.4-6.6 1 8.2 3.8-5.6 1 13.8c-1.4-6-3.6-9.8-6.4-11-4.4 3.4-12.4 3.4-16.6 0-1.8 1.4-3.2 4.8-4 10z"
        fill={p.hair}
      />
    ),
  },
  {
    id: 'ember',
    label: 'Ember',
    pal: 'mauve',
    eye: 'calm',
    back: (p) => <path d="M19 33c-2-13.6 4.6-22.4 13-22.4S47 19.4 45 33c-.6 4.4-1.6 7.8-2.8 10.4-.2-8.2-1.4-14-3.4-17.6-4.6 2.6-9.2 2.6-13.6 0-2 3.6-3.2 9.4-3.4 17.6C20.6 40.8 19.6 37.4 19 33z" fill={p.dark} />,
    front: (p) => (
      <>
        <path d="M19.8 27.6c-.4-10.2 5-17 12.2-17s12.6 6.8 12.2 17c-1.2-6-3.2-9.8-5.6-11.2-4.4 4.6-9 5-13.2 1-2 1.8-3.6 5-5.6 10.2z" fill={p.hair} />
        {/* two long face-framing strands, cut on a diagonal */}
        <path d="M22.6 20.6c-1.2 6.6-1.2 14 .2 21.6l-4.4 1.4c-1.6-8.4-1.4-16.6.6-24z" fill={p.hair} />
        <path d="M41.4 20.6c1.2 6.6 1.2 14-.2 21.6l4.4 1.4c1.6-8.4 1.4-16.6-.6-24z" fill={p.hair} />
      </>
    ),
  },
  {
    id: 'halo',
    label: 'Halo',
    pal: 'frost',
    eye: 'closed',
    back: (p) => <path d="M18.6 34c-2-14.6 5-23.4 13.4-23.4S47.4 19.4 45.4 34c-.4 4.2-1.4 7.4-2.8 9.8l-3.2-1.8c1.4-2.6 2.2-5.8 2.4-9.6-6 3-13.6 3-19.6 0 .2 3.8 1 7 2.4 9.6l-3.2 1.8c-1.4-2.4-2.4-5.6-2.8-9.8z" fill={p.dark} />,
    front: (p) => (
      <>
        <path d="M19.8 28c-.4-10.6 5.2-17.4 12.2-17.4S44.6 17.4 44.2 28c-1.2-6.2-3-10-5.2-11.4-4 4.6-12.4 5-16.4.6-2 1.8-3.6 5.4-4.8 10.8z" fill={p.hair} />
        {/* flicked ends */}
        <path d="M20.4 31.6 16 43l5.4-7.2 1 6.4 2.6-8.4zM43.6 31.6 48 43l-5.4-7.2-1 6.4-2.6-8.4z" fill={p.hair} />
      </>
    ),
  },
  {
    id: 'nyx',
    label: 'Nyx',
    pal: 'dusk',
    eye: 'soft',
    back: (p) => (
      <>
        <path d="M19 33.6c-2-13.8 4.6-22.6 13-22.6s15 8.8 13 22.6c-.6 4.2-1.4 7.4-2.6 9.8-.2-7.8-1.2-13.4-3-16.8-4.6 2.6-10.8 2.6-15.4 0-1.8 3.4-2.8 9-3 16.8-1.6-2.4-2.4-5.6-3-9.8z" fill={p.dark} />
        {/* braid down the right, beads on it */}
        <path d="M43.4 25.6c2.8 4.2 3.8 10.6 2.8 18.6l-4.2-.8c1-6.8.2-12.2-1.8-15.8z" fill={p.dark} />
        <circle cx="44.6" cy="33.4" r="1.5" fill={p.lite} opacity="0.85" />
        <circle cx="45" cy="38.6" r="1.3" fill={p.lite} opacity="0.6" />
      </>
    ),
    front: (p) => (
      <>
        <path d="M19.8 28c-.4-10.6 5.2-17.4 12.2-17.4S44.6 17.4 44.2 28c-1.6-6.6-4-10.4-6.8-11.6-4 5-13.2 5.4-17 .8-2.2 1.8-4 5.2-6.6 10.8z" fill={p.hair} />
        {/* the long fall on the shaved-opposite side */}
        <path d="M21.6 18.4c-2.8 4.6-4 12-3.6 22.4l-4.6 1c-.8-10.8.8-19 4.8-24.6z" fill={p.hair} />
      </>
    ),
  },
];

/** Renders one avatar by id. Unknown ids fall back to the first design. */
export default function Avatar({ id, size = 44, className = '', ...rest }) {
  const a = AVATARS.find((x) => x.id === id) || AVATARS[0];
  const p = PALETTES[a.pal];

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={`${a.label} avatar`}
      {...rest}
    >
      <defs>
        <clipPath id={`clip-${a.id}`}>
          <circle cx="32" cy="32" r="31" />
        </clipPath>
        <linearGradient id={`disc-${a.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.disc} />
          <stop offset="100%" stopColor="#140e29" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#clip-${a.id})`}>
        <circle cx="32" cy="32" r="31" fill={`url(#disc-${a.id})`} />
        <circle cx="32" cy="27" r="20" fill={p.hair} opacity="0.16" />
        {a.back(p)}
        <Face p={p} eye={a.eye} />
        {a.front(p)}
      </g>
      <circle cx="32" cy="32" r="30.5" fill="none" stroke={p.hair} strokeOpacity="0.45" />
    </svg>
  );
}
