import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../Icon';
import psp from '../../audio/psp';

/**
 * A photo shown large over everything. Portalled to <body> because the blade
 * is transformed, which would otherwise trap a fixed overlay inside the panel.
 *
 * While it is open it owns the keyboard: Escape, Enter or Space close it, and
 * every other key is swallowed so the arrows do not walk the bar underneath.
 */
export default function PhotoLightbox({ src, alt, onClose }) {
  useEffect(() => {
    psp.play('enter');

    const onKey = (e) => {
      e.stopImmediatePropagation();
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        psp.play('back');
        onClose();
      }
    };

    // Capture phase on window, so it runs before the app's own key handlers.
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={alt} onClick={onClose}>
      <figure className="lightbox__frame" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={alt} />
        <figcaption className="lightbox__cap mono">{alt}</figcaption>
      </figure>
      <button type="button" className="lightbox__close" onClick={onClose} aria-label="Close (Esc)" autoFocus>
        <Icon name="close" size={18} />
      </button>
    </div>,
    document.body,
  );
}
