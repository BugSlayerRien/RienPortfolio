/**
 * Content for the deep dive — the hidden page behind the cat.
 *
 * Each stratum is one full-height section. `depth` is the number on the gauge;
 * `label` is the stratum name. `align` decides whether the block hugs the left
 * rail, the right, or runs wide — the page is deliberately not a centred
 * column.
 *
 * NOTE: much of what follows is scaffolding, seeded from what the portfolio
 * already knew. Everything marked TODO(rien) needs replacing with the real
 * thing — this page only works if it is actually personal.
 */

export const intro = {
  kicker: 'Unlisted',
  title: 'Want to know more about me?',
  lede: 'The front page is the professional one. This one goes down.',
  hint: 'Keep scrolling',
};

export const strata = [
  {
    id: 'surface',
    depth: 0,
    label: 'Surface',
    align: 'left',
    title: 'Past the résumé',
    lede: 'The version of me that does not fit on a CV.',
    paragraphs: [
      'The portfolio out front is accurate but flattened — projects, certificates, roles. It is the version built to be read in ninety seconds by someone deciding whether to reply to an email.',
      'This is the longer version. It is slower, darker, and nobody is grading it.',
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
    lede: 'What actually occupies the hours.',
    paragraphs: [
      'I like the part of building where the thing starts responding — when a layout stops being boxes and starts having weight, when an interaction finally feels right instead of merely working. Most of my time goes into that last ten percent nobody is asked to notice.',
      'Organising for GDG turned out to be the same instinct pointed at people instead of pixels: work out what the room actually needs, then quietly make it happen before anyone has to ask.',
      // TODO(rien): replace with the real thing.
    ],
    facts: [
      ['Most at home in', 'Front-end'],
      ['Works best', 'Late, with music on'],
      ['Weakness', 'Rewriting things that already worked'],
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
    title: 'What I am doing now',
    lede: 'Updated by hand. If the date below is stale, so is this.',
    updated: 'September 2026',
    now: [
      { icon: 'briefcase', label: 'Building', body: 'Barberya ni Tatis — the face-scan pipeline is working, the admin side is not.' },
      { icon: 'star', label: 'Learning', body: 'Getting properly good at animation timing instead of guessing at easing curves.' },
      { icon: 'users', label: 'Organising', body: 'GDG on Campus NU Baliwag as Co-Chapter Organizer. Next event is in planning.' },
      { icon: 'music', label: 'On repeat', body: 'TODO(rien): whatever is actually on repeat this month.' },
    ],
  },
  {
    id: 'hobbies',
    depth: 150,
    label: 'Off Hours',
    align: 'wide',
    title: 'Hobbies',
    lede: 'The things that are not for a grade.',
    // TODO(rien): placeholders seeded from the portfolio. Rewrite.
    items: [
      {
        icon: 'music',
        name: 'Music while building',
        body: 'Something is always playing. Less background noise than a metronome — the right album turns a four-hour session into one long thought.',
      },
      {
        icon: 'gamepad',
        name: 'League of Legends',
        body: 'Playing as 엄마Shyvana. Mostly for the part where a plan survives contact with four other people who did not agree to it.',
      },
      {
        icon: 'display',
        name: 'Interface archaeology',
        body: 'Old console UIs, the PSP XMB above all. This whole portfolio started as an excuse to rebuild one from memory.',
      },
      {
        icon: 'folder',
        name: 'Projects that go nowhere',
        body: 'Half-finished repos are a hobby, not a failure state. Most of what I know came from something I abandoned.',
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
    lede: 'The boring answer to a question I get asked a lot.',
    // TODO(rien): correct these — they are guesses from the projects.
    groups: [
      { name: 'Editor', items: ['VS Code', 'Android Studio (Flutter)'] },
      { name: 'Everyday stack', items: ['React + Vite', 'Flutter / Dart', 'Supabase', 'PHP + MySQL'] },
      { name: 'Design', items: ['Figma', 'Pen and paper first'] },
      { name: 'Ship it', items: ['Git + GitHub', 'Vercel'] },
    ],
  },
  {
    id: 'vault',
    depth: 320,
    label: 'The Vault',
    align: 'wide',
    title: 'Notes & logs',
    lede: 'Things kept because they might matter later.',
    // TODO(rien): the real notes go here.
    logs: [
      {
        tag: 'LOG',
        date: '2026-07-29',
        title: 'InfoSession, afterwards',
        body: 'Ran the room instead of sitting in it this time. Different kind of tired — the kind where you replay the first ten minutes on the ride home.',
      },
      {
        tag: 'NOTE',
        date: '2026-03-25',
        title: 'On demoing AI to a room',
        body: 'Everyone wants to see it fail first. So build the demo where the failure is the interesting part, and you keep the room instead of losing it.',
      },
      {
        tag: 'LOG',
        date: '2026-02-02',
        title: 'The face scan finally worked',
        body: 'MediaPipe mesh into a heuristic into a ranked list. Three weeks of it returning nonsense, then one afternoon where it did not, and I could not tell you what I changed.',
      },
      {
        tag: 'NOTE',
        date: '2025-11-15',
        title: 'GATHER',
        body: 'First event where I knew everyone in the room by name. Worth writing down, because it will not stay that way.',
      },
      {
        tag: 'IDEA',
        date: '2025-08-04',
        title: 'Portfolio as an XMB',
        body: 'Nobody remembers a portfolio that looks like a portfolio. They remember one that looks like a PSP.',
      },
      {
        tag: 'LOG',
        date: '2023-09-24',
        title: 'First time speaking',
        body: 'Resource speaker for a freshman review session, one year into being a freshman myself. Terrified. Did it anyway.',
      },
    ],
  },
];

export const outro = {
  title: 'Bottom',
  body: 'That is as deep as it goes. Thanks for scrolling all the way down — most people do not.',
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

/** What the vault opens onto. Same shape as `strata`. */
// TODO(rien): all of this is scaffolding. It is the part only people who asked
// get to read, so it should be the most personal thing on the site.
export const sealed = [
  {
    id: 'trench',
    depth: 480,
    label: 'The Trench',
    align: 'left',
    title: 'You asked',
    lede: 'Which already says something. Thanks for that.',
    paragraphs: [
      'Everything above the vault is written for anyone. This part is written for people who bothered to message me first — so it gets to be less tidy.',
      'TODO(rien): the unpolished version. What you are actually proud of, what you are still unsure about, what you would say if nobody were grading it.',
    ],
  },
  {
    id: 'hadal',
    depth: 700,
    label: 'Hadal',
    align: 'right',
    title: 'Still figuring out',
    lede: 'Open questions, kept honest.',
    facts: [
      ['After graduation', 'TODO(rien)'],
      ['Want to get good at', 'TODO(rien)'],
      ['Would build if I had a year', 'TODO(rien)'],
    ],
  },
];

export const sealedOutro = {
  title: 'Actual bottom',
  body: 'This time it really is. You are one of very few people who have seen this far down.',
  back: 'Surface',
};
