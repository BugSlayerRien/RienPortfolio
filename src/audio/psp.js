/**
 * PSP-alike XMB sound engine.
 *
 * Every sound is synthesized live with the Web Audio API — oscillators, noise
 * bursts and envelopes. Nothing is sampled from console firmware, so there are
 * no audio files in the repo and no licensing exposure.
 *
 * The palette mirrors the shapes of the real thing:
 *   cursor   soft wooden "tok" for vertical moves
 *   sweep    same tok plus an airy swoosh for horizontal column changes
 *   enter    bright rising two-tone confirm
 *   back     softer falling cancel
 *   error    two low buzzes
 *   toggle   tiny neutral click for settings
 *   boot     long shimmering chord swell for the startup screen
 *   ambient  near-inaudible drone that breathes under the whole interface
 */

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

class PspAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.reverb = null;
    this.reverbGain = null;
    this.ambient = null;
    this.enabled = true;
    this.volume = 0.55;
    this.unlocked = false;
  }

  /** Build the graph on first use. Safe to call repeatedly. */
  ensure() {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;

    const ctx = new AC();
    this.ctx = ctx;

    // Master chain: gain -> soft limiter -> destination
    const master = ctx.createGain();
    master.gain.value = this.volume;

    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -8;
    limiter.knee.value = 12;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.18;

    master.connect(limiter);
    limiter.connect(ctx.destination);
    this.master = master;

    // A small generated plate reverb keeps the UI sounds from feeling dry.
    const reverb = ctx.createConvolver();
    reverb.buffer = this._impulse(1.35, 2.6);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.32;
    reverbGain.connect(reverb);
    reverb.connect(master);
    this.reverb = reverb;
    this.reverbGain = reverbGain;

    return ctx;
  }

  /** Browsers require a user gesture before audio can start. */
  unlock() {
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    this.unlocked = true;
  }

  setEnabled(on) {
    this.enabled = on;
    if (!on) this.stopAmbient();
  }

  setVolume(v) {
    this.volume = clamp(v, 0, 1);
    if (this.master) {
      this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.02);
    }
  }

  /** Decaying white-noise impulse response — cheap, convincing room. */
  _impulse(seconds, decay) {
    const ctx = this.ctx;
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch += 1) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** decay;
      }
    }
    return buf;
  }

  /** A short burst of white noise as a source node. */
  _noise(seconds = 0.25) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    return src;
  }

  /**
   * One enveloped oscillator voice.
   * `wet` sends a copy into the reverb bus.
   */
  _voice({ type = 'sine', freq, to, gain = 0.2, attack = 0.002, decay = 0.14, at = 0, wet = 0.25 }) {
    const ctx = this.ctx;
    const t = ctx.currentTime + at;

    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (to && to !== freq) osc.frequency.exponentialRampToValueAtTime(to, t + decay * 0.85);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(gain, t + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);

    osc.connect(env);
    env.connect(this.master);
    if (wet > 0) {
      const send = ctx.createGain();
      send.gain.value = wet;
      env.connect(send);
      send.connect(this.reverbGain);
    }

    osc.start(t);
    osc.stop(t + attack + decay + 0.05);
  }

  /** Filtered noise transient — the woody "click" edge of the cursor tick. */
  _tick({ at = 0, freq = 2200, q = 1.1, gain = 0.16, decay = 0.045 }) {
    const ctx = this.ctx;
    const t = ctx.currentTime + at;
    const src = this._noise(decay + 0.02);

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq;
    bp.Q.value = q;

    const env = ctx.createGain();
    env.gain.setValueAtTime(gain, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + decay);

    src.connect(bp);
    bp.connect(env);
    env.connect(this.master);
    src.start(t);
    src.stop(t + decay + 0.02);
  }

  play(name) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    switch (name) {
      // Vertical cursor move: soft, dry, close-mic'd tok.
      case 'cursor':
        this._voice({ type: 'triangle', freq: 1180, to: 980, gain: 0.13, decay: 0.055, wet: 0.1 });
        this._voice({ type: 'sine', freq: 2360, gain: 0.045, decay: 0.035, wet: 0.08 });
        this._tick({ freq: 2600, gain: 0.1, decay: 0.035 });
        break;

      // Horizontal column change: same tok with air moving behind it.
      case 'sweep': {
        this._voice({ type: 'triangle', freq: 1320, to: 1050, gain: 0.12, decay: 0.06, wet: 0.16 });
        this._tick({ freq: 3000, gain: 0.09, decay: 0.04 });
        const t = ctx.currentTime;
        const src = this._noise(0.3);
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.Q.value = 2.4;
        bp.frequency.setValueAtTime(700, t);
        bp.frequency.exponentialRampToValueAtTime(4200, t + 0.22);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.exponentialRampToValueAtTime(0.05, t + 0.04);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
        src.connect(bp);
        bp.connect(env);
        env.connect(this.master);
        const send = ctx.createGain();
        send.gain.value = 0.4;
        env.connect(send);
        send.connect(this.reverbGain);
        src.start(t);
        src.stop(t + 0.3);
        break;
      }

      // Confirm: bright rising major-third pair.
      case 'enter':
        this._voice({ type: 'sine', freq: 880, gain: 0.16, decay: 0.1, wet: 0.35 });
        this._voice({ type: 'sine', freq: 1318.5, gain: 0.14, decay: 0.24, at: 0.055, wet: 0.5 });
        this._voice({ type: 'triangle', freq: 2637, gain: 0.05, decay: 0.2, at: 0.055, wet: 0.5 });
        this._tick({ freq: 4200, gain: 0.06, decay: 0.03 });
        break;

      // Cancel: the same shape falling, and softer.
      case 'back':
        this._voice({ type: 'sine', freq: 1046.5, gain: 0.13, decay: 0.09, wet: 0.3 });
        this._voice({ type: 'sine', freq: 698.5, gain: 0.11, decay: 0.2, at: 0.05, wet: 0.4 });
        break;

      case 'error':
        this._voice({ type: 'square', freq: 165, gain: 0.07, decay: 0.09, wet: 0.15 });
        this._voice({ type: 'square', freq: 165, gain: 0.07, decay: 0.11, at: 0.14, wet: 0.15 });
        break;

      case 'toggle':
        this._voice({ type: 'sine', freq: 1600, gain: 0.1, decay: 0.04, wet: 0.12 });
        this._tick({ freq: 3400, gain: 0.07, decay: 0.025 });
        break;

      // The cat. A cartoon slide-whistle fall with a wobble and a boing at
      // the bottom — the one deliberately silly sound in the whole set.
      case 'drop': {
        const t = ctx.currentTime;

        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1250, t);
        osc.frequency.exponentialRampToValueAtTime(150, t + 0.72);

        // Wobble on the way down. This is what makes it read as goofy.
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(11, t);
        lfo.frequency.exponentialRampToValueAtTime(26, t + 0.72);
        const lfoAmt = ctx.createGain();
        lfoAmt.gain.setValueAtTime(70, t);
        lfoAmt.gain.exponentialRampToValueAtTime(9, t + 0.72);
        lfo.connect(lfoAmt);
        lfoAmt.connect(osc.frequency);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.2, t + 0.03);
        g.gain.setValueAtTime(0.2, t + 0.6);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);

        osc.connect(g);
        g.connect(this.master);
        const send = ctx.createGain();
        send.gain.value = 0.35;
        g.connect(send);
        send.connect(this.reverbGain);

        osc.start(t);
        lfo.start(t);
        osc.stop(t + 0.85);
        lfo.stop(t + 0.85);

        // ...and the landing.
        this._voice({ type: 'sine', freq: 190, to: 62, gain: 0.34, decay: 0.4, at: 0.76, wet: 0.5 });
        break;
      }

      // Breaking through a stratum on the deep page: a low body-hit plus a
      // short crack of noise on top.
      case 'impact': {
        const t = ctx.currentTime;

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(32, t + 0.42);
        const og = ctx.createGain();
        og.gain.setValueAtTime(0.0001, t);
        og.gain.exponentialRampToValueAtTime(0.5, t + 0.012);
        og.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
        osc.connect(og);
        og.connect(this.master);
        osc.start(t);
        osc.stop(t + 0.6);

        const crack = this._noise(0.35);
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(2400, t);
        hp.frequency.exponentialRampToValueAtTime(500, t + 0.3);
        const cg = ctx.createGain();
        cg.gain.setValueAtTime(0.22, t);
        cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
        crack.connect(hp);
        hp.connect(cg);
        cg.connect(this.master);
        const send = ctx.createGain();
        send.gain.value = 0.7;
        cg.connect(send);
        send.connect(this.reverbGain);
        crack.start(t);
        crack.stop(t + 0.36);
        break;
      }

      // Startup: a slow shimmering chord that blooms open.
      case 'boot': {
        const t = ctx.currentTime;
        const chord = [220, 329.6, 440, 554.4, 659.3, 880];
        const bus = ctx.createGain();
        bus.gain.setValueAtTime(0.0001, t);
        bus.gain.exponentialRampToValueAtTime(0.22, t + 0.5);
        bus.gain.exponentialRampToValueAtTime(0.0001, t + 2.0);

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(300, t);
        lp.frequency.exponentialRampToValueAtTime(7000, t + 0.9);
        lp.Q.value = 0.7;

        bus.connect(lp);
        lp.connect(this.master);
        const send = ctx.createGain();
        send.gain.value = 0.85;
        lp.connect(send);
        send.connect(this.reverbGain);

        chord.forEach((f, i) => {
          [-4, 4].forEach((cents) => {
            const osc = ctx.createOscillator();
            osc.type = i > 3 ? 'sine' : 'triangle';
            osc.frequency.value = f * 2 ** (cents / 1200);
            const g = ctx.createGain();
            g.gain.value = 0.16 / (i + 1.4);
            osc.connect(g);
            g.connect(bus);
            osc.start(t + i * 0.05);
            osc.stop(t + 2.2);
          });
        });

        // Rising air behind the chord.
        const air = this._noise(1.4);
        const abp = ctx.createBiquadFilter();
        abp.type = 'bandpass';
        abp.Q.value = 1.6;
        abp.frequency.setValueAtTime(400, t);
        abp.frequency.exponentialRampToValueAtTime(6000, t + 0.9);
        const aenv = ctx.createGain();
        aenv.gain.setValueAtTime(0.0001, t);
        aenv.gain.exponentialRampToValueAtTime(0.035, t + 0.5);
        aenv.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
        air.connect(abp);
        abp.connect(aenv);
        aenv.connect(this.master);
        air.start(t);
        air.stop(t + 2.7);
        break;
      }

      default:
        break;
    }
  }

  /** Low breathing drone that sits under the XMB while it idles. */
  startAmbient() {
    if (!this.enabled || this.ambient) return;
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const t = ctx.currentTime;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.055, t + 4);
    out.connect(this.master);

    const nodes = [out];

    // Two quiet low sines a fifth apart.
    [55, 82.4].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 0.5 : 0.28;

      // Slow amplitude drift so it never sits perfectly still.
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.023;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.16;
      lfo.connect(lfoGain);
      lfoGain.connect(g.gain);

      osc.connect(g);
      g.connect(out);
      osc.start(t);
      lfo.start(t);
      nodes.push(osc, lfo);
    });

    // A wash of filtered noise for the "wave" behind the bar.
    const wash = this._noise(8);
    wash.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 420;
    lp.Q.value = 0.6;
    const wg = ctx.createGain();
    wg.gain.value = 0.05;
    const sweep = ctx.createOscillator();
    sweep.frequency.value = 0.037;
    const sweepGain = ctx.createGain();
    sweepGain.gain.value = 220;
    sweep.connect(sweepGain);
    sweepGain.connect(lp.frequency);
    wash.connect(lp);
    lp.connect(wg);
    wg.connect(out);
    wash.start(t);
    sweep.start(t);
    nodes.push(wash, sweep);

    this.ambient = { out, nodes };
  }

  stopAmbient() {
    if (!this.ambient || !this.ctx) return;
    const { out, nodes } = this.ambient;
    const t = this.ctx.currentTime;
    out.gain.cancelScheduledValues(t);
    out.gain.setValueAtTime(Math.max(out.gain.value, 0.0001), t);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    nodes.forEach((n) => {
      if (typeof n.stop === 'function') {
        try {
          n.stop(t + 1.3);
        } catch {
          /* already stopped */
        }
      }
    });
    this.ambient = null;
  }
}

const psp = new PspAudio();
export default psp;
