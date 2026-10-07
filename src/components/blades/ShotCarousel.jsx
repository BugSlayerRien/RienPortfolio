import Icon from '../Icon';
import useCarousel, { DWELL } from '../../hooks/useCarousel';

/**
 * Screenshots in one frame, advancing on their own. Same behaviour and styling
 * as the certificate carousel (`ccar`), with a caption in place of the details
 * card. Clicking a frame opens the full image.
 *
 * `fit="contain"` is for portrait screenshots: the whole shot is shown inside a
 * wide frame over a blurred copy of itself, instead of being cropped to fit.
 */
export default function ShotCarousel({ shots, label, fit = 'cover' }) {
  const { index, go, held, auto, holdProps } = useCarousel(shots.length);

  return (
    <div
      className="ccar ccar--shots"
      data-fit={fit}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      data-held={held || undefined}
      style={{ '--dwell': `${DWELL}ms` }}
      {...holdProps}
    >
      <div className="ccar__viewport">
        <div className="ccar__track" style={{ '--i': index }}>
          {shots.map((s, n) => (
            <a
              key={s.src}
              className="certframe ccar__slide"
              href={s.src}
              style={{ '--bg': `url(${s.src})` }}
              target="_blank"
              rel="noreferrer"
              aria-hidden={n !== index}
              tabIndex={n === index ? 0 : -1}
            >
              <img src={s.src} alt={s.alt} loading={n === 0 ? 'eager' : 'lazy'} />
              <span className="certframe__glare" aria-hidden="true" />
              <span className="certframe__open mono">
                <Icon name="play" size={12} /> Open full size
              </span>
            </a>
          ))}
        </div>
      </div>

      {shots.length > 1 && (
        <div className="ccar__bar">
          <button type="button" className="ccar__step" onClick={() => go(index - 1)} aria-label="Previous">
            <Icon name="arrowLeft" size={14} strokeWidth={2} />
          </button>

          <div className="ccar__dots">
            {shots.map((s, n) => (
              <button
                key={s.src}
                type="button"
                className="ccar__dot"
                data-active={n === index || undefined}
                onClick={() => go(n)}
                aria-label={`Show ${s.alt}`}
                aria-current={n === index || undefined}
              >
                {n === index && auto && <i key={index} />}
              </button>
            ))}
          </div>

          <button type="button" className="ccar__step" onClick={() => go(index + 1)} aria-label="Next">
            <Icon name="arrowRight" size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      <p className="ccar__caption mono" aria-live="polite">
        {shots[index].alt}
      </p>
    </div>
  );
}
