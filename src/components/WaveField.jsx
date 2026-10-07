import { useEffect, useRef } from 'react';
import './WaveField.css';

/**
 * The iridescent XMB wave.
 *
 * Layers, back to front:
 *   1. a slow-drifting radial light that tracks the selected column
 *   2. six additive ribbons, each a sum of three sines, stroked with a
 *      hue-rotating gradient — the oil-slick sheen
 *   3. floating motes that drift upward and brighten while idle
 *
 * `columns` is the normalised XMB position (0 to 1). Moving along the bar
 * slides the light source and rotates the palette, so the whole background
 * reacts to navigation.
 */

const RIBBONS = 6;
const MOTES = 46;
const FALLBACK_HUES = [
  [255, 143, 209],
  [183, 156, 255],
  [111, 220, 255],
  [138, 255, 214],
  [255, 232, 154],
];

const lerp = (a, b, t) => a + (b - a) * t;

export default function WaveField({
  columns = 0,
  intensity = 1,
  idle = false,
  reduced = false,
  palette,
}) {
  const canvasRef = useRef(null);
  // Live values the animation loop reads without re-subscribing.
  const live = useRef({ columns, intensity, idle, reduced, palette });
  live.current = { columns, intensity, idle, reduced, palette };

  // Reads the palette live, so switching theme recolours the wave in place
  // rather than restarting the animation.
  const mixHue = (t) => {
    const hues = live.current.palette || FALLBACK_HUES;
    const scaled = ((t % 1) + 1) % 1;
    const span = scaled * hues.length;
    const i = Math.floor(span);
    const f = span - i;
    const a = hues[i % hues.length];
    const b = hues[(i + 1) % hues.length];
    return [
      Math.round(lerp(a[0], b[0], f)),
      Math.round(lerp(a[1], b[1], f)),
      Math.round(lerp(a[2], b[2], f)),
    ];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let t = 0;
    let lightX = 0.5;
    let glow = 0;

    const motes = Array.from({ length: MOTES }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.9 + 0.5,
      v: Math.random() * 0.00016 + 0.00004,
      drift: Math.random() * Math.PI * 2,
      hue: Math.random(),
      a: Math.random() * 0.5 + 0.2,
    }));

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /** One ribbon: three stacked sines swept across the viewport. */
    const ribbon = (index, time, cols, energy) => {
      const phase = index * 0.72;
      const baseY = h * (0.46 + index * 0.045) + Math.sin(time * 0.18 + phase) * h * 0.045;
      const amp = h * (0.055 + index * 0.016) * energy;
      const thickness = lerp(h * 0.05, h * 0.012, index / RIBBONS);

      const [r, g, b] = mixHue(cols * 0.55 + index * 0.11 + time * 0.012);
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
      grad.addColorStop(0.22, `rgba(${r},${g},${b},${0.3 * energy})`);
      const [r2, g2, b2] = mixHue(cols * 0.55 + index * 0.11 + time * 0.012 + 0.28);
      grad.addColorStop(0.55, `rgba(${r2},${g2},${b2},${0.42 * energy})`);
      const [r3, g3, b3] = mixHue(cols * 0.55 + index * 0.11 + time * 0.012 + 0.55);
      grad.addColorStop(0.82, `rgba(${r3},${g3},${b3},${0.26 * energy})`);
      grad.addColorStop(1, `rgba(${r3},${g3},${b3},0)`);

      const yAt = (x) => {
        const n = x / w;
        return (
          baseY +
          Math.sin(n * 3.1 + time * 0.6 + phase) * amp +
          Math.sin(n * 6.7 - time * 0.42 + phase * 1.7) * amp * 0.45 +
          Math.sin(n * 11.3 + time * 0.27 + phase * 0.6) * amp * 0.2
        );
      };

      ctx.beginPath();
      ctx.moveTo(0, yAt(0));
      for (let x = 0; x <= w; x += 12) ctx.lineTo(x, yAt(x));
      for (let x = w; x >= 0; x -= 12) ctx.lineTo(x, yAt(x) + thickness);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // A brighter hairline riding the top edge catches the eye.
      ctx.beginPath();
      ctx.moveTo(0, yAt(0));
      for (let x = 0; x <= w; x += 10) ctx.lineTo(x, yAt(x));
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.3;
      ctx.globalAlpha = 0.85;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const frame = () => {
      const { columns: cols, intensity: ints, idle: isIdle, reduced: isReduced } = live.current;

      // Ease the light toward the selected column and the idle energy up.
      lightX += (0.16 + cols * 0.68 - lightX) * 0.045;
      const targetGlow = isIdle ? 1 : 0;
      glow += (targetGlow - glow) * 0.02;

      t += isReduced ? 0 : 0.0075;
      const energy = ints * (0.86 + glow * 0.22);

      ctx.clearRect(0, 0, w, h);

      // 1 — travelling light source
      const lx = w * lightX;
      const ly = h * (0.42 + Math.sin(t * 0.23) * 0.08);
      const [lr, lg, lb] = mixHue(cols * 0.55 + t * 0.012 + 0.15);
      const halo = ctx.createRadialGradient(lx, ly, 0, lx, ly, Math.max(w, h) * 0.62);
      halo.addColorStop(0, `rgba(${lr},${lg},${lb},${0.15 + glow * 0.06})`);
      halo.addColorStop(0.4, `rgba(${lr},${lg},${lb},0.045)`);
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      // 2 — additive ribbons
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < RIBBONS; i += 1) ribbon(i, t, cols, energy);

      // 3 — motes
      motes.forEach((m) => {
        if (!isReduced) {
          m.y -= m.v * (1 + glow * 0.7);
          m.drift += 0.004;
          if (m.y < -0.05) {
            m.y = 1.05;
            m.x = Math.random();
          }
        }
        const x = (m.x + Math.sin(m.drift) * 0.012) * w;
        const y = m.y * h;
        const [mr, mg, mb] = mixHue(m.hue + t * 0.02);
        const alpha = m.a * (0.5 + glow * 0.5) * ints;
        const dot = ctx.createRadialGradient(x, y, 0, x, y, m.r * 5);
        dot.addColorStop(0, `rgba(${mr},${mg},${mb},${alpha})`);
        dot.addColorStop(1, `rgba(${mr},${mg},${mb},0)`);
        ctx.fillStyle = dot;
        ctx.beginPath();
        ctx.arc(x, y, m.r * 5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div className="wavefield" data-idle={idle || undefined}>
      <div className="wavefield__ground" />
      <canvas ref={canvasRef} className="wavefield__canvas" />
      <div className="wavefield__film" />
      <div className="wavefield__grain" />
      <div className="wavefield__vignette" />
    </div>
  );
}
