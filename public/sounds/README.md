# Sounds

This folder is intentionally empty.

Every navigation sound is synthesized at runtime by `src/audio/psp.js` using the
Web Audio API — oscillators, filtered noise bursts and envelopes. Nothing is
sampled from console firmware, so there is no audio to ship and no licensing
question to answer.

If you later want to swap in your own recordings, add a loader to `psp.js` that
prefers a file here and falls back to `play()` when it is missing. Only use
audio you have the rights to distribute.
