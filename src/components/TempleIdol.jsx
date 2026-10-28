/**
 * The Temple theme's idol: the frog, cut out of its white background
 * (public/temple/frog.png).
 *
 * The artwork faces the viewer, so its mouth is at the bottom of the box. The
 * bar turns it with `--aim-angle` plus half a turn, so the mouth leads.
 *
 * Measured from the artwork, for anything that has to line up with the mouth:
 * the ball in it sits MOUTH_DROP of the box's width below the centre, and is
 * MOUTH_SIZE of the width across.
 */
export const MOUTH_DROP = 0.275;
export const MOUTH_SIZE = 0.225;

export default function TempleIdol({ className = '' }) {
  return <img className={`idol ${className}`} src="/temple/frog.png" alt="" draggable="false" />;
}
