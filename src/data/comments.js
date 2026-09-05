/**
 * Comment wall storage.
 *
 * Two backends behind one interface:
 *
 *   local     (default) — this browser's localStorage. Works with zero setup,
 *                         but a comment is only ever visible to the person who
 *                         wrote it. The UI says so out loud rather than
 *                         pretending to be a public wall.
 *
 *   supabase  — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and the wall
 *               becomes real and shared. Plain REST via fetch, so there is no
 *               extra dependency to install. Schema and policies are in the
 *               README.
 *
 * `MODE` tells the UI which one is live so it can label itself honestly.
 */

const URL_BASE = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const MODE = URL_BASE && ANON_KEY ? 'supabase' : 'local';

const LS_KEY = 'rien.xmb.comments.v1';
const TABLE = 'comments';

export const LIMITS = { name: 40, body: 500 };

/** Trim and cap, so neither backend can be handed something oversized. */
function clean(raw) {
  return {
    name: String(raw.name || '').trim().slice(0, LIMITS.name),
    body: String(raw.body || '').trim().slice(0, LIMITS.body),
    avatar: String(raw.avatar || 'spike').slice(0, 24),
  };
}

/* ---------------------------------------------------------- local */

function localLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function localSave(list) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list.slice(0, 200)));
  } catch {
    /* private mode, quota, blocked storage — the wall just will not persist */
  }
}

/* ------------------------------------------------------- supabase */

async function rest(path, init = {}) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

/* ---------------------------------------------------------- public */

/** Newest first. Never throws — a dead backend returns an empty wall. */
export async function loadComments() {
  if (MODE === 'local') return localLoad();
  try {
    return await rest(`${TABLE}?select=*&order=created_at.desc&limit=100`);
  } catch (err) {
    console.error('[comments] load failed', err);
    return [];
  }
}

/**
 * Adds one comment and returns it. Throws on a rejected write so the form can
 * say something useful instead of silently dropping what someone typed.
 */
export async function addComment(raw) {
  const c = clean(raw);
  if (!c.name || !c.body) throw new Error('Name and comment are both required.');

  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...c,
    created_at: new Date().toISOString(),
  };

  if (MODE === 'local') {
    localSave([entry, ...localLoad()]);
    return entry;
  }

  const [saved] = await rest(TABLE, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify([c]),
  });
  return saved;
}

/** Only meaningful in local mode — lets someone clear their own wall. */
export function clearLocalComments() {
  if (MODE !== 'local') return;
  localSave([]);
}

/** "3 minutes ago" style stamp, falling back to a date for anything old. */
export function timeAgo(iso) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const secs = Math.max(0, Math.round((Date.now() - then) / 1000));

  if (secs < 45) return 'just now';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
