/**
 * All portfolio content lives here.
 *
 * The XMB is built from `categories`: each category is a horizontal column,
 * each item inside it is a vertical entry. Selecting an item opens its blade.
 * A category with `mode: 'burst'` skips the blade entirely and fans its items
 * out around the cross point the moment you arrive.
 */

export const profile = {
  name: 'Rien',
  fullName: 'Rien Miro Gappi',
  occupation: 'Web Developer & Designer',
  tagline: '4th year BSIT student',
  avatar: '/img/rien-photo.webp',
  cv: '/cv/Rien-Miro-Gappi-CV.pdf',
  cvFileName: 'Rien-Miro-Gappi-CV.pdf',
};

export const categories = [
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    items: [
      { id: 'sound', title: 'Sound Settings', subtitle: 'XMB navigation audio', icon: 'sound', blade: 'settings' },
      { id: 'display', title: 'Display Settings', subtitle: 'Motion and shimmer', icon: 'display', blade: 'settings' },
      { id: 'system', title: 'System Information', subtitle: 'About this build', icon: 'info', blade: 'system' },
      { id: 'power', title: 'Power Off', subtitle: 'Return to the start screen', icon: 'power', blade: 'power' },
    ],
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: 'user',
    items: [
      { id: 'about', title: 'About Me', subtitle: 'Who is behind the terminal', icon: 'user', blade: 'about' },
      { id: 'education', title: 'Education Timeline', subtitle: 'St. Paul to STI to NU Baliuag', icon: 'timeline', blade: 'education' },
      { id: 'location', title: 'Campus Location', subtitle: 'National University Baliwag', icon: 'map', blade: 'location' },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: 'folder',
    items: [
      { id: 'barberya', title: 'Barberya ni Tatis', subtitle: 'Barbershop system · AI haircut scan', icon: 'folder', logo: '/img/barberya.png', blade: 'project' },
      // The GoCollab artwork carries a wide transparent margin of its own, so it
      // needs scaling up to sit at the same visual weight as the other marks.
      { id: 'gocollab', title: 'GoCollab', subtitle: 'Community management platform', icon: 'folder', logo: '/img/gocollab.webp', logoScale: 1.55, blade: 'project' },
      { id: 'asknu', title: 'AskNU', subtitle: 'AI image analysis app', icon: 'folder', blade: 'project' },
      { id: 'medeasyna', title: 'MedEasyna', subtitle: 'Clinic scheduling system', icon: 'folder', logo: '/img/medeasyna.png', blade: 'project' },
      { id: 'ckresort', title: 'CK Resort', subtitle: 'Resort booking and operations', icon: 'folder', blade: 'project' },
      { id: 'readthat', title: 'ReadThat', subtitle: 'Book discovery and reviews', icon: 'folder', blade: 'project' },
    ],
  },
  {
    id: 'credentials',
    label: 'Credentials',
    icon: 'trophy',
    items: [
      { id: 'honors', title: 'Academic Honors', subtitle: 'Dean’s List and awards', icon: 'medal', blade: 'honors' },
      { id: 'gdg-secretary', title: 'GDG Secretary — Recognition', subtitle: 'Recognition · Jun 2026', icon: 'award', blade: 'certificate' },
      { id: 'deans-list', title: 'Dean’s List Awards', subtitle: '2 certificates · 2023–2024', icon: 'medal', blade: 'certificateSet' },
      { id: 'memberships', title: 'GDG & GDSC Memberships', subtitle: '3 terms · 2023–2026', icon: 'users', blade: 'certificateSet' },
      { id: 'infosession-2026', title: 'InfoSession 2026', subtitle: 'Participation · Jul 2026', icon: 'certificate', blade: 'certificate' },
      { id: 'gem-in-ai', title: 'Gem in AI: A Gemini Workshop', subtitle: 'Appreciation · Mar 2026', icon: 'certificate', blade: 'certificate' },
      { id: 'gather-2025', title: 'GATHER 2025', subtitle: 'Appreciation · Nov 2025', icon: 'certificate', blade: 'certificate' },
      { id: 'stug-flutter', title: 'StuG! Flutter & Firebase', subtitle: 'Participation · Dec 2023', icon: 'certificate', blade: 'certificate' },
      { id: 'study-jam', title: 'Study Jam — Resource Speaker', subtitle: 'Appreciation · Sep 2023', icon: 'certificate', blade: 'certificate' },
    ],
  },
  {
    id: 'experience',
    label: 'Experience',
    icon: 'briefcase',
    items: [
      { id: 'gdg', title: 'GDG on Campus', subtitle: 'NU Baliwag · 2 roles', icon: 'portal', blade: 'experience' },
      { id: 'literates', title: 'NU Literates Community', subtitle: '3 roles · 2023 to 2026', icon: 'users', blade: 'experience' },
      { id: 'gdsc', title: 'Google Developer Student Clubs', subtitle: 'Event Lead · 2024', icon: 'star', blade: 'experience' },
    ],
  },
  // Hidden for now. Paste this category back in above Socials to bring the
  // comment wall back; CommentBlade and src/data/comments.js are untouched.
  // {
  //   id: 'comments',
  //   label: 'Comments',
  //   icon: 'chat',
  //   items: [
  //     { id: 'wall', title: 'Leave a Comment', subtitle: 'Sign the wall', icon: 'chat', blade: 'comments' },
  //   ],
  // },
  {
    id: 'socials',
    label: 'Socials',
    icon: 'network',
    // No blade — arriving here fans the nodes out on their own. Items are
    // filled in from `contacts` below so the cursor and breadcrumb still work.
    mode: 'burst',
    items: [],
  },
];

export const about = {
  heading: 'About_Me',
  intro: 'I am Rien, a 4th year BSIT student.',
  body: [
    'I build web interfaces and spend most of my time somewhere between the design file and the browser devtools. Front-end is where I am most at home, but I have shipped full stacks for coursework and client-shaped projects alike.',
    'Outside the editor I help run Google Developer Groups on Campus at NU Baliwag, where I organise workshops and developer sessions for other students.',
  ],
};

/**
 * What I can build with, compiled from the stacks of my project repos. They
 * are private, so this is a hand-kept summary rather than a live GitHub pull.
 */
export const stack = [
  { group: 'Languages', items: ['JavaScript', 'Dart', 'PHP', 'Python', 'SQL', 'HTML', 'CSS'] },
  { group: 'Frameworks', items: ['React', 'Flutter', 'Vite', 'React Router'] },
  { group: 'Data', items: ['Supabase', 'PostgreSQL', 'MySQL'] },
  { group: 'AI & services', items: ['Gemini API', 'MediaPipe', 'PayMongo', 'Google OAuth'] },
  { group: 'Ship it', items: ['Git', 'GitHub', 'Vercel'] },
];

export const education = [
  { id: 'stpaul', period: 'Elementary & Junior High School', institution: 'St. Paul College' },
  { id: 'sti', period: 'Senior High School', institution: 'STI Baliuag' },
  { id: 'nu', period: 'College (Present)', institution: 'National University Baliuag' },
];

export const location = {
  title: 'My Campus Location',
  name: 'National University, Baliwag',
  embed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3854.598415899306!2d120.88736047412341!3d14.95945048557055!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3396ff70f7e3806f%3A0xbe45933e9b4502c!2sNational%20University-Baliwag!5e0!3m2!1sen!2sph!4v1744370611758!5m2!1sen!2sph',
};

/**
 * Projects, ordered by how much they matter. `roles` is what I did on each and
 * keys into `roleBadges`. `repo` is the GitHub URL and
 * `repoPrivate` controls whether the portfolio renders a link or a
 * "private repository" note — flip it to false once a repo goes public.
 */
export const projects = {
  barberya: {
    title: 'Barberya ni Tatis',
    tagline: 'Barbershop Management System with AI-Powered Haircut and Styling Recommendation',
    description:
      'A full barbershop system built around a face scan. A customer photographs themselves in the mobile app, a Python computer-vision pipeline runs MediaPipe face detection and face mesh to derive face shape and hair attributes, and that reading is ranked by an LLM into the top five hairstyle suggestions with front, side and back previews. From there the customer picks a barber and a time slot and books. Separate portals cover the receptionist desk, walk-ins, an in-store kiosk, and an admin view with analytics and an audit log.',
    tech: ['Flutter', 'Dart', 'PHP', 'MySQL', 'Python', 'MediaPipe', 'Gemini API'],
    status: 'In development',
    roles: ['fullstack', 'capstone'],
    repo: 'https://github.com/BugSlayerRien/barberyanitatis',
    repoPrivate: true,
    demoUrl: '',
  },
  gocollab: {
    title: 'GoCollab',
    tagline: 'A Community Management Platform',
    description:
      'Writeup pending. Replace this entry in src/data/content.js — what it does, who it is for, and what you built it with.',
    tech: [],
    status: 'In development',
    roles: ['frontend', 'backend'],
    repo: 'https://github.com/BugSlayerRien/GoCollab',
    repoPrivate: true,
    demoUrl: '',
  },
  asknu: {
    title: 'AskNU',
    tagline: 'AI-Powered Image Analysis App Built on Google Gemini',
    description:
      'A Flutter app that sends an image to Google Gemini and reads back a description of what is in it. Pick a photo from the gallery or shoot one on the spot, and the analyzer returns the model output in the app. The Gemini key is loaded from a local env file rather than compiled into the build.',
    tech: ['Flutter', 'Dart', 'Google Gemini API'],
    status: 'Shipped',
    roles: ['frontend', 'backend'],
    repo: 'https://github.com/BugSlayerRien/AskNU',
    repoPrivate: true,
    demoUrl: '',
  },
  medeasyna: {
    title: 'MedEasyna',
    tagline: 'Clinic Appointment and Patient Scheduling System',
    description:
      'A clinic appointment and scheduling platform built to cut down the paper trail in small practices. Patients book slots, staff manage the day at a glance, and the whole schedule stays in one place instead of a notebook behind the counter. Includes Google sign-in and email-based password recovery.',
    tech: ['PHP', 'MySQL', 'JavaScript', 'HTML', 'CSS', 'Google OAuth'],
    status: 'Shipped',
    roles: ['frontend', 'backend'],
    repo: 'https://github.com/BugSlayerRien/Medeasyna',
    repoPrivate: true,
    demoUrl: '',
  },
  ckresort: {
    title: 'CK Resort',
    tagline: 'Resort Booking and Operations Management System',
    description:
      'A resort platform with a portal for each role: guests book rooms, day tours and events; the front desk takes payments and reconciles proof-of-payment uploads; operations staff track room status and dispatch; and a manager view handles rates, tiers and users. Payments run through PayMongo, and the whole data layer is Supabase with row-level security separating what each role can see.',
    tech: ['React', 'Vite', 'Supabase', 'PostgreSQL', 'PayMongo'],
    status: 'In development',
    roles: ['backend'],
    repo: 'https://github.com/BugSlayerRien/CKResort',
    repoPrivate: true,
    demoUrl: '',
  },
  readthat: {
    title: 'ReadThat',
    tagline: 'Book Discovery Platform with Reviews and Reading Progress Tracking',
    description:
      'A web app for finding books and keeping track of what you have read. Readers browse titles, leave ratings and reviews with spoiler flags and helpful votes, and move books through a wishlist, currently-reading, finished or did-not-finish state. An admin dashboard handles the catalogue, review moderation, user roles and site settings.',
    tech: ['React', 'Vite', 'React Router', 'Supabase', 'PostgreSQL'],
    status: 'Shipped',
    roles: ['frontend', 'backend'],
    repo: 'https://github.com/BugSlayerRien/ReadThat',
    repoPrivate: true,
    demoUrl: '',
  },
};

/** Role badges on project pages. `tone` picks the finish; `special` adds the shimmer. */
export const roleBadges = {
  fullstack: { label: 'Full Stack', tone: 'gold', special: true },
  capstone: { label: 'Capstone', tone: 'red', special: true },
  frontend: { label: 'Frontend', tone: 'white' },
  backend: { label: 'Backend', tone: 'black' },
};

/**
 * Certificates, newest first. Most `file`s are PDFs with a JPEG `thumb` of the
 * first page; the ones that only exist as photos use the photo for both.
 */
export const certificates = {
  'gdg-secretary': {
    title: 'GDG on Campus — Secretary',
    kind: 'Certificate of Recognition',
    issuer: 'National University Baliwag',
    dateLabel: 'June 29, 2026',
    date: '2026-06-29',
    note: 'Recognised for leadership and service as Secretary of Google Developer Group on Campus — NU Baliwag Chapter.',
    file: '/certificates/thumbs/2026-06-29-gdg-secretary-recognition.webp',
    thumb: '/certificates/thumbs/2026-06-29-gdg-secretary-recognition.webp',
  },
  'infosession-2026': {
    title: 'InfoSession 2026',
    kind: 'Certificate of Participation',
    issuer: 'Google Developer Groups on Campus — NU Baliwag',
    dateLabel: 'July 29, 2026',
    date: '2026-07-29',
    note: 'Active participation in InfoSession 2026.',
    file: '/certificates/2026-07-29-infosession-2026.pdf',
    thumb: '/certificates/thumbs/2026-07-29-infosession-2026.jpg',
  },
  'gem-in-ai': {
    title: 'Gem in AI: A Gemini Workshop',
    kind: 'Certificate of Appreciation',
    issuer: 'Google Developer Groups on Campus — NU Baliwag',
    dateLabel: 'March 25, 2026',
    date: '2026-03-25',
    note: 'Recognised as an active volunteer for the workshop.',
    file: '/certificates/2026-03-25-gem-in-ai-workshop.pdf',
    thumb: '/certificates/thumbs/2026-03-25-gem-in-ai-workshop.jpg',
  },
  'gdg-term-2': {
    title: 'GDG Membership — Second Term',
    kind: 'Certificate of Membership',
    issuer: 'Google Developer Groups on Campus — NU Baliwag',
    dateLabel: 'March 2, 2026',
    date: '2026-03-02',
    note: 'Official member for the Second Term of AY 2025–2026.',
    file: '/certificates/2026-03-02-gdg-membership-term-2.pdf',
    thumb: '/certificates/thumbs/2026-03-02-gdg-membership-term-2.jpg',
  },
  'gdg-term-1': {
    title: 'GDG Membership — First Term',
    kind: 'Certificate of Membership',
    issuer: 'Google Developer Groups on Campus — NU Baliwag',
    dateLabel: 'January 2, 2026',
    date: '2026-01-02',
    note: 'Official member for the First Term of AY 2025–2026.',
    file: '/certificates/2026-01-02-gdg-membership-term-1.pdf',
    thumb: '/certificates/thumbs/2026-01-02-gdg-membership-term-1.jpg',
  },
  'gather-2025': {
    title: 'GATHER 2025: Google Developers Assembly',
    kind: 'Certificate of Appreciation',
    issuer: 'Google Developer Groups on Campus — NU Baliwag',
    dateLabel: 'November 15, 2025',
    date: '2025-11-15',
    note: 'Recognised as an active volunteer for the assembly.',
    file: '/certificates/2025-11-15-gather-2025.pdf',
    thumb: '/certificates/thumbs/2025-11-15-gather-2025.jpg',
  },
  'stug-flutter': {
    title: 'StuG! a Flutter and Firebase Workshop',
    kind: 'Certificate of Participation',
    issuer: 'Google Developer Student Clubs — NU Baliwag',
    dateLabel: 'December 9, 2023',
    date: '2023-12-09',
    note: 'Active participant in the Flutter and Firebase workshop.',
    file: '/certificates/2023-12-09-stug-flutter-firebase-workshop.pdf',
    thumb: '/certificates/thumbs/2023-12-09-stug-flutter-firebase-workshop.jpg',
  },
  'study-jam': {
    title: 'Study Jam: A Midterm Review Session',
    kind: 'Certificate of Appreciation',
    issuer: 'NU Literates Community',
    dateLabel: 'September 24, 2023',
    date: '2023-09-24',
    note: 'Resource speaker for the ITE233 freshman review session.',
    file: '/certificates/2023-09-24-study-jam-resource-speaker.pdf',
    thumb: '/certificates/thumbs/2023-09-24-study-jam-resource-speaker.jpg',
  },
  'deans-list-2324-t2': {
    title: 'Dean’s List — Second Honors',
    kind: 'Certificate of Academic Excellence',
    issuer: 'National University Baliwag',
    dateLabel: 'April 24, 2024',
    date: '2024-04-24',
    note: 'Second Term, AY 2023–2024 — GWA of 3.33.',
    file: '/certificates/thumbs/2024-04-24-deans-list-ay2023-2024-t2.webp',
    thumb: '/certificates/thumbs/2024-04-24-deans-list-ay2023-2024-t2.webp',
  },
  'deans-list-2223-t1': {
    title: 'Dean’s List — Second Honors',
    kind: 'Certificate of Academic Excellence',
    issuer: 'National University Baliwag',
    dateLabel: 'November 29, 2023',
    date: '2023-11-29',
    note: 'First Term, AY 2022–2023 — GWA of 3.25.',
    file: '/certificates/thumbs/2023-11-29-deans-list-ay2022-2023-t1.webp',
    thumb: '/certificates/thumbs/2023-11-29-deans-list-ay2022-2023-t1.webp',
  },
  'gdsc-membership-2324': {
    title: 'GDSC Membership — First Term',
    kind: 'Certificate of Membership',
    issuer: 'Google Developer Student Clubs — NU Baliwag',
    dateLabel: 'October 25, 2023',
    date: '2023-10-25',
    note: 'Recognised member for the First Term of AY 2023–2024.',
    file: '/certificates/thumbs/2023-10-25-gdsc-membership-ay2023-2024.webp',
    thumb: '/certificates/thumbs/2023-10-25-gdsc-membership-ay2023-2024.webp',
  },
};

/** Groups of certificates shown as one auto-advancing carousel. */
export const certificateSets = {
  'deans-list': {
    title: 'Dean’s List Awards',
    note: 'Second Honors, twice — NU Baliwag, BSIT.',
    members: ['deans-list-2324-t2', 'deans-list-2223-t1'],
  },
  memberships: {
    title: 'GDG & GDSC Memberships',
    note: 'A member of the campus Google developer community every term since 2023.',
    members: ['gdg-term-2', 'gdg-term-1', 'gdsc-membership-2324'],
  },
};

export const honors = {
  title: 'Academic Honors',
  note: 'Recognition earned across school.',
  groups: [
    {
      institution: 'National University Baliuag',
      period: 'College, present',
      items: ['1st Year — Dean’s Lister (2 Terms)', '2nd Year — Dean’s Lister', 'Outstanding Programming Project'],
    },
    {
      institution: 'STI Baliuag',
      period: 'Senior High School',
      items: [
        'Graduated With High Honors',
        'Outstanding Student Award',
        'Led multiple group projects in Entrepreneurship and Programming',
      ],
    },
  ],
};

/** Positions and roles, grouped by organisation, newest first. */
export const experience = {
  gdg: {
    org: 'Google Developer Groups on Campus',
    where: 'National University — Baliwag',
    span: '10 mos',
    roles: [
      {
        title: 'Co-Chapter Organizer',
        period: 'Jun 2026 — Present',
        duration: '4 mos',
        current: true,
        notes: [
          'Co-lead the campus chapter: plan the term’s technical events, coordinate the core team, and represent the chapter to student organisations and faculty.',
          'Ran developer sessions including InfoSession 2026 and Gem in AI, a hands-on Gemini workshop.',
        ],
      },
      {
        title: 'Executive Secretary',
        period: 'Dec 2025 — May 2026',
        duration: '6 mos',
        notes: [
          'Owned chapter documentation, meeting minutes, and member records across the academic year.',
          'Volunteered on chapter events including GATHER 2025: Google Developers Assembly.',
        ],
      },
    ],
  },
  literates: {
    org: 'NU Literates Community',
    where: 'National University — Baliwag',
    span: '2023 — 2026',
    roles: [
      {
        title: '3rd Year Batch Delegate',
        period: 'Jul 2025 — May 2026',
        duration: '11 mos',
        notes: [
          'Represented the third-year batch to the organisation; carried student concerns into planning and relayed decisions back to the batch.',
        ],
      },
      {
        title: '2nd Year Batch Delegate',
        period: 'Jul 2024 — May 2025',
        duration: '11 mos',
        notes: ['Second consecutive term as batch representative, coordinating academic and community activities.'],
      },
      {
        title: 'Class Representative — 1st Year',
        period: 'Aug 2023 — May 2024',
        duration: '10 mos',
        notes: [
          'First elected role; the point of contact between the class and the organisation.',
          'Resource speaker for Study Jam: A Midterm Review Session (ITE233).',
        ],
      },
    ],
  },
  gdsc: {
    org: 'Google Developer Student Clubs',
    where: 'National University — Baliwag',
    span: '2 mos',
    roles: [
      {
        title: 'Event Lead',
        period: 'May 2024 — Jun 2024',
        duration: '2 mos',
        notes: ['Led planning and day-of execution for a campus developer event.'],
      },
    ],
  },
};

export const contacts = [
  { id: 'email', label: 'Email', value: 'gappirien@gmail.com', href: 'mailto:gappirien@gmail.com', icon: 'mail' },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    value: 'Rien Miro Gappi',
    href: 'https://www.linkedin.com/in/rien-miro-gappi-82bb95389/',
    icon: 'linkedin',
  },
  { id: 'github', label: 'GitHub', value: 'BugSlayerRien', href: 'https://github.com/BugSlayerRien', icon: 'github' },
  // Hidden for now; uncomment to show them in the Socials burst again.
  // { id: 'facebook', label: 'Facebook', value: 'Rien Miro Gappi', href: '', icon: 'facebook' },
  // { id: 'instagram', label: 'Instagram', value: '@4mrrien', href: 'https://instagram.com/4mrrien', icon: 'instagram' },
  // { id: 'league', label: 'League', value: '엄마Shyvana #1213', href: '', icon: 'gamepad' },
];

// The Socials column is the contact list — same data, rendered as a burst.
categories.find((c) => c.id === 'socials').items = contacts.map((c) => ({
  id: c.id,
  title: c.label,
  subtitle: c.value,
  icon: c.icon,
  href: c.href,
}));


export const system = {
  title: 'System Information',
  rows: [
    ['System Software', 'XMB Portfolio 1.20'],
    ['Model', 'RIEN-1000 (Iridescent)'],
    ['Built with', 'React + Vite'],
    ['Renderer', 'Canvas 2D + CSS'],
    ['Audio', 'Web Audio API (synthesized)'],
    ['MAC Address', '00:1A:RI:EN:00:01'],
  ],
  note:
    'This interface is an original tribute to the PlayStation Portable XMB. All navigation sounds are synthesized in-browser with the Web Audio API. No sampled console audio is used or distributed.',
};
