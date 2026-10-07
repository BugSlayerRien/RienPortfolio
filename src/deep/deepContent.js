/**
 * Content for the deep dive — the hidden page behind the cat.
 *
 * Each stratum is one full-height section. `depth` is the number on the gauge;
 * `label` is the stratum name. `align` decides whether the block hugs the left
 * rail, the right, or runs wide — the page is deliberately not a centred
 * column.
 *
 * Layout of the file: `strata` is everything anyone can scroll to; `vault` is
 * the locked cube at the bottom; `sealed` is what the cube opens onto (the
 * notes and logs first, then the deeper strata).
 *
 * NOTE: much of what follows is scaffolding, seeded from what the portfolio
 * already knew. Everything marked TODO(rien) needs replacing with the real
 * thing — this page only works if it is actually personal.
 */

export const intro = {
  kicker: 'Unlisted',
  title: 'Welcome, still looking for more?',
  lede: 'The front page is the professional one. This one is just me, going a bit deeper.',
  hint: 'Keep scrolling',
};

export const strata = [
  {
    id: 'surface',
    depth: 0,
    label: 'Surface',
    align: 'left',
    title: 'Past the résumé',
    lede: 'The stuff that does not fit on a CV.',
    paragraphs: [
      'The portfolio out front is the quick version: projects, certificates, roles. It is made to be skimmed in a minute and a half by someone deciding whether to reply to an email.',
      'This is the longer, more relaxed version. No one is grading it, so feel free to take your time.',
    ],
    facts: [
      ['Goes by', 'Rien'],
      ['Currently', '4th year BSIT, NU Baliwag'],
      ['Reachable at', 'gappirien@gmail.com'],
    ],
  },
  {
    id: 'about',
    depth: 40,
    label: 'The Person',
    align: 'right',
    title: 'More about me',
    lede: 'What I actually spend my time on.',
    paragraphs: [
      'My favourite part of building something is when it starts to feel ALIVE: when a layout stops being a bunch of boxes, or an interaction finally feels right instead of just working. I spend a lot of time on that last ten percent that nobody asked for.',
      // TODO(rien): replace with the real thing.
    ],
    facts: [
      ['Most at home in', 'Front-end, Back-end'],
      ['Works best', 'Late at night, with music on'],
      ['Biggest weakness', 'Doubting too much'],
    ],
  },
  {
    /**
     * A /now section — the single most useful thing to keep on a personal page
     * and the easiest to maintain. Change the four lines and the date; that is
     * the whole update. Anyone checking whether you are still active reads this.
     */
    id: 'now',
    depth: 90,
    label: 'Now',
    align: 'wide',
    title: 'What I am up to lately',
    lede: 'I update this by hand, so if the date below looks old, so is this.',
    updated: 'October 2026',
    now: [
      { icon: 'briefcase', label: 'Building', body: 'Brilyantis. My final project before graduation, almost done.' },
      { icon: 'star', label: 'Learning', body: '...' },
      { icon: 'users', label: 'Organising', body: 'GDG on Campus NU Baliwag as Co-Chapter Organizer. The next event is still in the works.' },
      { icon: 'music', label: 'On repeat', body: 'Aries, Quadeca, and Brakence are currently on repeat.' },
    ],
  },
  {
    id: 'hobbies',
    depth: 150,
    label: 'Off Hours',
    align: 'wide',
    title: 'Things I do for fun',
    lede: 'None of this is for a grade.',
    // TODO(rien): placeholders seeded from the portfolio. Rewrite.
    items: [
      {
        icon: 'music',
        name: 'Music while building',
        body: 'Something is always playing.',
      },
      {
        icon: 'display',
        name: 'Old console menus',
        body: 'The PSP XMB most of all. This whole portfolio started as an excuse to rebuild one from memory.',
      },
      {
        icon: 'folder',
        name: 'Projects that go nowhere',
        body: 'Half-finished repos are a hobby, not a failure. Most of what I know came from something I abandoned.',
      },
    ],
  },
];

/** The text above the vault cube. */
export const outro = {
  title: 'You made it to the bottom',
  body: 'That is everything out in the open. The locked box below has the rest: my notes, my logs, and the messier stuff I do not put on the front page.',
  back: 'Surface',
};

/**
 * The vault at the bottom. Only the SHA-256 of the passcode is stored, so the
 * word itself is not sitting in the bundle — but this is a gate, not security:
 * the sealed strata below ship to every visitor either way.
 *
 * Input is trimmed and lower-cased before hashing. To change the passcode:
 *   node -e "console.log(require('crypto').createHash('sha256').update('newcode').digest('hex'))"
 * TODO(rien): the current passcode is a placeholder — "abyss".
 */
export const vault = {
  hash: '0e062e4c2ee475679d9cfd9cd30c295dec2a0eb7a02ffb0c5b239d2617022a8a',
  note: 'you may ask me directly for the passcode =)',
};

/**
 * What the vault opens onto. Same shape as `strata`; the gauge and scroll
 * pick these up the moment the vault opens.
 */
// TODO(rien): the notes are seeded and the last two sections are scaffolding.
// This is the part only people who asked get to read, so it should be the most
// personal thing on the site.
export const sealed = [
  {
    id: 'vault',
    depth: 320,
    label: 'Notes & Logs',
    align: 'wide',
    title: 'Stuff I wrote down',
    lede: 'Little notes and logs I kept',
    // TODO(rien): the real notes go here.
    logs: [
      {
        tag: 'LOG',
        date: '2026-07-29',
        title: 'Music',
        body: 'I really love listening to tunes, makes everything more alive',
      },
      {
        tag: 'NOTE',
        date: '2026-08-25',
        title: 'project',
        body: 'Im really tired but my ego says otherwise',
      },
      {
        tag: 'NOTE',
        date: '2026-9-9',
        title: '',
        body: 'I have so many wasted thoughts, and nothing comes up when actually writing something.',
      },
      {
        tag: 'IDEA',
        date: '2025-08-04',
        title: 'Portfolio as an XMB',
        body: 'Nobody remembers a portfolio that looks like a portfolio. They remember the one that looks like a PSP.',
      },
    ],
  },
  {
    id: 'trench',
    depth: 480,
    label: 'The Trench',
    align: 'left',
    title: 'You asked, so here you go',
    lede: 'Thanks for actually messaging me. That already says something.',
    paragraphs: [
      'Everything above the vault is written for anyone. This part is for people who bothered to ask first, so it gets to be a bit messier and a lot more honest.',
    ],
  },
  {
    id: 'hadal',
    depth: 700,
    label: 'Hadal',
    align: 'right',
    title: 'Still figuring it out',
    lede: 'Some open questions, kept honest.',
    facts: [
      ['After graduation', 'Create Content'],
      ['Want to get good at', 'Everything that catches my interest'],
      ['Would build if I had a year', 'similar game to boshy'],
    ],
  },
];

export const sealedOutro = {
  title: 'This time it really is the bottom',
  body: 'Seriously, that is everything. Not many people get this far down, so thanks for sticking around!',
  back: 'Surface',
};
