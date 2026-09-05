# RIEN — XMB Portfolio

Rien Miro Gappi's portfolio, presented as a PlayStation Portable style Cross
Media Bar. React + Vite + plain CSS, no backend, deploys as a static site.

This replaces the old PHP portfolio in `../Portfolio`. All of that content
carried over — the PHP itself was doing nothing (login/register/logout were bare
redirects, the DB helpers were never imported, and the chat replied from a
hardcoded array), so nothing was lost in the port.

---

## Running it

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

`npm run preview` serves the production build locally.

---

## Deploying to Vercel

The repo is a stock Vite app, so Vercel auto-detects everything.

1. Push this folder to GitHub as its own repository.
2. On vercel.com, **Add New → Project**, and import that repo.
3. Accept the detected settings — Framework `Vite`, build `npm run build`,
   output `dist`. No environment variables, no serverless functions.
4. Deploy.

`vercel.json` adds a catch-all rewrite to `index.html`. There is only one route
today, but it means any path someone types still lands on the app instead of a
404.

To deploy from the terminal instead:

```bash
npx vercel --prod
```

---

## Controls

| Input | Action |
| --- | --- |
| `←` `→` or `A` `D` | Move between categories |
| `↑` `↓` or `W` `S` | Move between items in a category |
| `Enter`, `Space`, or `X` | Open the selected item |
| `Esc`, `Backspace`, or `O` | Close the panel |
| `M` | Mute / unmute |
| Click the cat (top right) | Opens the deep dive |
| Mouse hover | Moves the cursor (plays the tick) |
| Mouse click | Opens the item |
| Scroll wheel | Moves the cursor vertically; horizontal scroll changes category |
| Swipe | Same, on touch devices |
| `↑` `↓` / `W` `S` **inside a panel** | Scrolls the panel |
| `PgUp` `PgDn` `Home` `End` | Page and jump, inside a panel or the deep page |

Inside an open panel the arrow keys, WASD and the wheel scroll the content, and
typing in a text field never drives the bar. That scrolling is wired by hand in
`useKeyScroll` — the panels are inner `overflow-y` boxes that never take focus,
so the browser will not scroll them from the keyboard on its own.

**Socials is different.** It is the last column and it has no panel — arriving
there detonates it, and the six nodes fly out from the cursor already open.
Enter (or a click) follows the highlighted link.

---

## How it is put together

```
src/
  data/content.js        Every piece of copy on the site. Edit this, not the JSX.
  audio/psp.js           Web Audio sound engine (see below).
  hooks/
    useIdle.js           Fires after 6.5s of no input — drives the idle animations.
    useReducedMotion.js  Tracks the OS reduced-motion setting.
    useReveal.js         Reveal-on-scroll + publishes --scroll-p for the panel.
    useParallax.js       Publishes pointer position as --px/--py/--tilt-x/--tilt-y.
    useSystemStatus.js   Real battery and connection readouts for the status bar.
    useKeyScroll.js      Binds arrows/WASD to scroll a specific element.
    useRoute.js          Two-page router: / and /deep.
  components/
    WaveField.jsx        The iridescent wave, on canvas.
    Xmb.jsx              The cross media bar itself.
    Blade.jsx            The sliding content panel.
    Hud.jsx              Status bar, clock, breadcrumb, button legend.
    Boot.jsx             Startup screen (and the gesture that unlocks audio).
    Icon.jsx             The whole icon set, one file.
    blades/              Panel bodies, one per content type.
  styles/
    tokens.css           Colours, type, geometry, motion — change the look here.
    global.css           Reset plus the shared holographic utilities.
scripts/
  build_cv.py            Regenerates public/cv/*.pdf. Edit the data block, re-run.
public/
  cv/                    The generated CV PDF.
  certificates/          Certificate PDFs, plus thumbs/ page renders.
```

### The bar

| Column | What is in it |
| --- | --- |
| Settings | Sound, display, system info, power off |
| Profile | About, education, campus map |
| Projects | The six repos, importance-ranked |
| Credentials | Academic honors, then every certificate newest-first |
| Experience | Positions, grouped by organisation |
| Comments | The visitor comment wall |
| Socials | Burst column — no panel, fans open on arrival |

### The comment wall — read this before shipping it

`src/data/comments.js` has two backends behind one interface, and which one is
live decides whether the wall actually works:

- **`local` (default)** — comments go into that visitor's own `localStorage`.
  Zero setup, but **a comment is only ever visible to the person who wrote it.**
  The panel says so in plain words rather than pretending otherwise.
- **`supabase`** — set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` and the
  wall becomes real and shared. Plain REST over `fetch`, no extra dependency.

**A shared wall means this is no longer a static site.** That is the trade. If
you want it, the table is:

```sql
create table comments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  body text not null,
  avatar text not null,
  created_at timestamptz not null default now()
);

alter table comments enable row level security;

create policy comments_read on comments
  for select to anon using (true);

create policy comments_insert on comments
  for insert to anon with check (
    char_length(name) between 1 and 40
    and char_length(body) between 1 and 500
  );
```

Add the two env vars in Vercel → Settings → Environment Variables and redeploy.

Two things worth knowing before you turn it on: a public write endpoint **will**
eventually get spam, and there is no delete button in the UI — you moderate from
the Supabase table editor. If that is more than you want to run, leaving it on
`local` is a perfectly reasonable answer.

### The avatars

`src/components/Avatars.jsx` holds eight original heads drawn as inline SVG in a
spiky-hair / large-eye JRPG idiom, all from one pastel purple palette. They are
original designs, not copies of any existing character. Add one by appending to
`AVATARS` — a palette key, an eye style, and back/front hair paths on the shared
64-unit head.

### The deep dive

The cat glyph beside the clock opens `/deep` — a separate, unlisted page for the
personal side. It is deliberately understated: no border, no hover cursor at
rest, just a dim glyph that lives among the status icons and only comes alive
when someone hovers it. `Escape` or the Surface button comes back.

Getting there is deliberately silly: the whole bar squats, springs, then tumbles
through the floor with a slide-whistle while the deep page rises to catch it.

**The page starts in the XMB's own palette and drains as you descend.** A
`--dive` value (0 to 1, published on scroll) crossfades a bright surface layer
into a near-black abyss, closes the vignette, and greys the ink via `color-mix`.
The iridescence never leaves — it just gets darker and oilier.

That last part needs two layers, and it is worth knowing why before you touch
them. `.deep__oil` is `mix-blend-mode: overlay`, which looks right over the
lit surface but renders as **black over black** — so it dies out exactly where
you still want colour. `.deep__oil-deep` is `screen`, which *adds* light rather
than modulating it, and fades in as `--dive` climbs. Together they keep an
iridescent sheen at every depth. Drop the second one and the bottom goes flat.

Reaching a stratum lights **its header**: the header slides into place, the
rule sweeps with iridescence, the depth number pops, and the heading fills with
the oil gradient and stays that way while you are inside it. Everything above
and below stays plain, so the live section is always obvious. The depth gauge
flares at the same moment — the fill glows, the reached tick doubles, the metre
reading jumps.

There used to be a screen-wide crack and a full-page shake here, and they were
removed for a concrete reason worth remembering: the shake transformed
`.deep__ground`, and that element holds two viewport-sized conic gradients under
a 64-80px blur. Transforming the parent forces those to re-rasterise **every
frame**, which is what made the trigger stutter. The five shards compounded it
by animating `box-shadow`, which repaints instead of compositing. Everything
now animates only `transform` and `opacity`, on small elements, and the ground
layers are promoted once with `translateZ(0)` so `--dive` only ever flips their
opacity. If you add an effect here, keep to those two properties.

Six strata, laid out asymmetrically on purpose — `align: 'left' | 'right' |
'wide'` per stratum, so nothing is stuck in a centred column:

| Stratum | What it is |
| --- | --- |
| Surface | Past the résumé |
| The Person | The longer about |
| **Now** | What you are doing this month — the highest-value, lowest-effort thing on the page. Change four lines and the date. |
| Off Hours | Hobbies |
| **Setup** | A /uses page. Update once a year and it stays true. |
| The Vault | Notes and logs, as a card grid |

Content lives in `src/deep/deepContent.js`. **Most of it is scaffolding** —
the hobbies, the Now entries, the Setup list and the log entries were seeded
from what the portfolio already knew and are marked `TODO(rien)`. This page only
works if it is genuinely personal, so rewrite them.

### The CV

`public/cv/Rien-Miro-Gappi-CV.pdf` is generated, not hand-made. To change it,
edit the `DATA` block at the top of `scripts/build_cv.py` and run:

```bash
python scripts/build_cv.py
```

It needs `reportlab` (`pip install reportlab`). The layout is single-column and
text-based on purpose so applicant tracking systems can parse it.

**It is one page, and that is enforced.** The script counts pages after building
and exits non-zero if the content has spilled onto a second one. Skills sit high
because that is the section that gets scanned; every role and project is a
single line; the seven certificates are folded into two runs rather than seven
stanzas. If you add something, cut something.

### Certificates

Each entry in `certificates` (in `content.js`) points at a real PDF in
`public/certificates/` and a JPEG render of its first page in
`public/certificates/thumbs/`. To add one, drop the PDF in, render a thumbnail,
then add the entry plus a matching item in the `credentials` category.

### The status bar is real

The battery and signal readouts report actual device state — battery via the
Battery Status API, connection via `navigator.onLine` plus the Network
Information API. The Battery Status API is Chromium-only; where it is missing
(Firefox, Safari) that slot shows the date rather than inventing a charge level.

### Adding or editing content

Everything lives in `src/data/content.js`.

- **A new project**: add an entry to `projects`, then add a matching item to the
  `projects` category in `categories` with `blade: 'project'`. The `id` must
  match on both sides. Fill in `demoUrl` and the button appears on its own.
- **A new category**: add an object to `categories`. Each item's `blade` field
  picks which panel body renders it — the switch is at the bottom of
  `src/components/blades/BladeContent.jsx`.
- **Milestones** and **contacts** work the same way.

### Repo links and `repoPrivate`

Every project carries a `repo` URL and a `repoPrivate` flag. While
`repoPrivate: true`, the panel shows a dimmed "Private repository" label instead
of a link — a link to a private repo 404s for every visitor, which looks worse
than saying nothing. **When you make a repo public, flip that project's
`repoPrivate` to `false`** and the "View code" button appears.

All six are private as of this writing.

### Still to do

- **GoCollab has no writeup.** There was no local clone to read and the repo is
  private, so its description is a placeholder. Fill it in.
- `demoUrl` is empty on every project — add any that are deployed.
- **The deep page content is placeholder.** Rewrite the hobbies and vault logs
  in `src/deep/deepContent.js` — everything marked `TODO(rien)`.
- Decide whether the comment wall stays local or gets a Supabase backend.
- The CV lists **Bulacan, Philippines** and **Expected 2027** — both inferred.
  Correct them in `scripts/build_cv.py` if wrong, and add a phone number if you
  want one on there.

### The look

`src/styles/tokens.css` holds the five iridescent hues (`--iri-1` … `--iri-5`)
that every gradient is built from, plus the rail geometry. Two rules matter if
you change sizes: `--row-gap` must stay larger than `--icon-sel` or the tiles
collide, and `--col-gap` sets the horizontal rhythm of the bar.

Motion comes in two flavours. **Navigation-driven**: columns slide, the
background light source tracks the selected column, the palette rotates with
your position on the bar, and tiles scale and glow on selection. **Idle**: after
6.5 seconds the wave speeds up, motes brighten and drift, and the selected tile
breathes with a shimmer sweep. Inside a panel, scrolling reveals sections in
sequence, cards tilt toward the cursor with a specular highlight that follows
it, and a holographic rule tracks reading progress.

Everything respects `prefers-reduced-motion`, and Settings → Display can switch
ambient motion off manually.

---

## About the sound

Every navigation sound is **synthesized in the browser** by `src/audio/psp.js` —
oscillators, filtered noise bursts, envelopes, and a generated convolution
reverb. There are no audio files in this repo.

That is a deliberate choice. The PSP's actual XMB sounds are copyrighted Sony
assets; shipping ripped audio would put your portfolio at legal risk for no real
benefit. The synthesized versions match the *shapes* of the originals — a soft
wooden tick for the cursor, a bright rising two-tone confirm, a softer falling
cancel, a swoosh under horizontal moves, a slow shimmering chord at startup, and
a near-inaudible drone underneath — and they load instantly because there is
nothing to download.

Browsers will not start audio without a user gesture, which is why the boot
screen waits for a key or a click before the startup chime plays.

If you later want to use your own recordings, `public/sounds/README.md` explains
where to hook them in. Only use audio you have the rights to distribute.

---

## Security note

Before publishing any of these repos, see `SECURITY-FINDINGS.md` in this folder.
Two projects have live credentials committed and must not go public until those
are rotated.

---

## Notes

- The Google Maps embed is the same one from the old site. The Music column and
  its Spotify embed were removed; Projects took that slot.
- Sound and motion settings live in memory only and reset on refresh.
