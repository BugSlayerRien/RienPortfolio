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
  title: 'Want to know more about me?',
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
      'My favourite part of building something is when it starts to feel alive: when a layout stops being a bunch of boxes, or an interaction finally feels right instead of just working. I spend a lot of time on that last ten percent that nobody asked for.',
      'Helping run GDG turned out to be the same thing, just with people instead of pixels. Figure out what the room needs, then quietly sort it out before anyone has to ask.',
      // TODO(rien): replace with the real thing.
    ],
    facts: [
      ['Most at home in', 'Front-end'],
      ['Works best', 'Late at night, with music on'],
      ['Biggest weakness', 'Rewriting things that already worked'],
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
    updated: 'September 2026',
    now: [
      { icon: 'briefcase', label: 'Building', body: 'Barberya ni Tatis. The face scan works now; the admin side is next.' },
      { icon: 'star', label: 'Learning', body: 'Getting properly good at animation timing instead of just guessing at easing curves.' },
      { icon: 'users', label: 'Organising', body: 'GDG on Campus NU Baliwag as Co-Chapter Organizer. The next event is still in the works.' },
      { icon: 'music', label: 'On repeat', body: 'TODO(rien): whatever is actually on repeat this month.' },
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
        body: 'Something is always playing. The right album can turn a four-hour coding session into one long thought.',
      },
      {
        icon: 'gamepad',
        name: 'League of Legends',
        body: 'I play as 엄마Shyvana. Mostly for the thrill of watching a plan fall apart because four other people never agreed to it.',
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
  {
    /**
     * A /uses section. Low-maintenance, genuinely useful, and the thing other
     * students actually ask about. Update it once a year and it stays true.
     */
    id: 'setup',
    depth: 220,
    label: 'Setup',
    align: 'wide',
    title: 'What I build with',
    lede: 'The short answer to something people ask me a lot.',
    // TODO(rien): correct these — they are guesses from the projects.
    groups: [
      { name: 'Editor', items: ['VS Code', 'Android Studio (Flutter)'] },
      { name: 'Everyday stack', items: ['React + Vite', 'Flutter / Dart', 'Supabase', 'PHP + MySQL'] },
      { name: 'Design', items: ['Figma', 'Pen and paper first'] },
      { name: 'Ship it', items: ['Git + GitHub', 'Vercel'] },
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
  note: 'you may ask directly to me for the passcode :)',
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
    lede: 'Little notes and logs I kept because they might matter later.',
    // TODO(rien): the real notes go here.
    logs: [
      {
        tag: 'LOG',
        date: '2026-07-29',
        title: 'InfoSession, afterwards',
        body: 'I ran the room this time instead of sitting in it. A different kind of tired: the kind where you replay the first ten minutes on the ride home.',
      },
      {
        tag: 'NOTE',
        date: '2026-03-25',
        title: 'On demoing AI to a room',
        body: 'Everyone wants to see it fail first. So build the demo where the failure is the interesting part, and you get to keep the room.',
      },
      {
        tag: 'LOG',
        date: '2026-02-02',
        title: 'The face scan finally worked',
        body: 'MediaPipe mesh into a heuristic into a ranked list. Three weeks of nonsense, then one afternoon it just worked, and I honestly could not tell you what I changed.',
      },
      {
        tag: 'NOTE',
        date: '2025-11-15',
        title: 'GATHER',
        body: 'The first event where I knew everyone in the room by name. Worth writing down, because it will not always be like that.',
      },
      {
        tag: 'IDEA',
        date: '2025-08-04',
        title: 'Portfolio as an XMB',
        body: 'Nobody remembers a portfolio that looks like a portfolio. They remember the one that looks like a PSP.',
      },
      {
        tag: 'LOG',
        date: '2023-09-24',
        title: 'First time speaking',
        body: 'I was a resource speaker for a freshman review session, a year into being a freshman myself. I was terrified. I did it anyway.',
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
      'TODO(rien): the unpolished version. What you are actually proud of, what you are still unsure about, what you would say if nobody were grading it.',
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
      ['After graduation', 'TODO(rien)'],
      ['Want to get good at', 'TODO(rien)'],
      ['Would build if I had a year', 'TODO(rien)'],
    ],
  },
];

export const sealedOutro = {
  title: 'This time it really is the bottom',
  body: 'Seriously, that is everything. Not many people get this far down, so thanks for sticking around.',
  back: 'Surface',
};
