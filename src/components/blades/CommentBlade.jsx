import { useEffect, useRef, useState } from 'react';
import Icon from '../Icon';
import Avatar, { AVATARS } from '../Avatars';
import psp from '../../audio/psp';
import { loadComments, addComment, clearLocalComments, timeAgo, MODE, LIMITS } from '../../data/comments';

/**
 * The comment wall: pick a face, leave a name and a note.
 *
 * Reads its storage mode from the data layer and labels itself accordingly —
 * on localStorage it says plainly that the note stays on this device, because
 * a guestbook that quietly drops everything would be worse than no guestbook.
 */
export default function CommentBlade() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0].id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    loadComments().then((rows) => {
      if (!alive.current) return;
      setList(rows);
      setLoading(false);
    });
    return () => {
      alive.current = false;
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');

    if (!name.trim() || !body.trim()) {
      setError('Both a name and a comment, please.');
      psp.play('error');
      return;
    }

    setBusy(true);
    try {
      const saved = await addComment({ name, body, avatar });
      setList((l) => [saved, ...l]);
      setName('');
      setBody('');
      psp.play('enter');
    } catch (err) {
      setError(err.message || 'That did not save. Try again in a moment.');
      psp.play('error');
    } finally {
      setBusy(false);
    }
  };

  const pick = (id) => {
    setAvatar(id);
    psp.play('cursor');
  };

  const wipe = () => {
    clearLocalComments();
    setList([]);
    psp.play('back');
  };

  return (
    <div className="wall" data-reveal>
      <form className="wall__form" onSubmit={submit}>
        <fieldset className="wall__picker">
          <legend className="row__label mono">Pick a face</legend>
          <div className="wall__faces">
            {AVATARS.map((a) => (
              <button
                type="button"
                key={a.id}
                className="wall__face"
                data-selected={avatar === a.id || undefined}
                onClick={() => pick(a.id)}
                aria-pressed={avatar === a.id}
                title={a.label}
              >
                <Avatar id={a.id} size={46} />
                <span className="wall__face-name mono">{a.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="wall__fields">
          <label className="wall__field">
            <span className="row__label mono">Name</span>
            <input
              className="chat__input"
              value={name}
              maxLength={LIMITS.name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Who is this?"
            />
          </label>

          <label className="wall__field">
            <span className="row__label mono">
              Comment <em className="wall__count">{body.length}/{LIMITS.body}</em>
            </span>
            <textarea
              className="chat__input"
              rows={3}
              value={body}
              maxLength={LIMITS.body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Say something…"
            />
          </label>
        </div>

        {error && <p className="wall__error mono">{error}</p>}

        <div className="btn-row">
          <button type="submit" className="btn" disabled={busy}>
            <Icon name="chat" size={14} /> {busy ? 'Posting…' : 'Post comment'}
          </button>
          {MODE === 'local' && list.length > 0 && (
            <button type="button" className="btn btn--ghost" onClick={wipe}>
              Clear
            </button>
          )}
        </div>
      </form>

      <div className="wall__list">
        <h3 className="bsection__title">
          {loading ? 'Loading…' : `${list.length} comment${list.length === 1 ? '' : 's'}`}
        </h3>

        {!loading && list.length === 0 && (
          <p className="bsection__note">Nothing here yet. Be the first.</p>
        )}

        {list.map((c) => (
          <article className="wall__item" key={c.id}>
            <Avatar id={c.avatar} size={42} className="wall__item-face" />
            <div className="wall__item-body">
              <header className="wall__item-head">
                <span className="wall__item-name">{c.name}</span>
                <span className="wall__item-when mono">{timeAgo(c.created_at)}</span>
              </header>
              <p className="wall__item-text">{c.body}</p>
            </div>
          </article>
        ))}
      </div>

      <p className="notice">
        {MODE === 'local' ? (
          <>
            <strong>Heads up:</strong> this wall is stored in your own browser, so your comment stays
            on this device and nobody else can see it. Making it a real shared wall needs a database —
            see the README for the ten-minute Supabase setup.
          </>
        ) : (
          <>Comments are public. Be kind, and do not post anything you would not want indexed.</>
        )}
      </p>
    </div>
  );
}
