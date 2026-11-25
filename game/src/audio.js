// Rasa Rush: Dapur Kilat — sound effects.
// Every sound is synthesised with the Web Audio API at run time; the game
// ships no audio files and makes no network request. Sounds start only
// after the player's first key or click, when the browser allows audio.

let audioContext = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function ensureContext() {
  if (!audioContext) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioContext = new AC();
    } catch (err) {
      return null;
    }
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

// A short oscillator blip: the building block of most effects.
function blip(freq, duration, type, volume, slideTo) {
  if (muted) return;
  const ctx = ensureContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + duration);
    gain.gain.setValueAtTime(volume || 0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
  } catch (err) {
    /* audio is decoration; never break the game */
  }
}

// Filtered noise burst: chopping, sizzling, trash.
function noiseBurst(duration, volume, lowFreq) {
  if (muted) return;
  const ctx = ensureContext();
  if (!ctx) return;
  try {
    const len = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowFreq || 1800;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume || 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  } catch (err) {
    /* audio is decoration; never break the game */
  }
}

export const sfx = {
  pickup() { blip(520, 0.08, 'triangle', 0.10, 760); },
  place() { blip(300, 0.09, 'triangle', 0.10, 210); },
  chop() { noiseBurst(0.07, 0.22, 900); blip(140, 0.06, 'square', 0.06, 90); },
  chopDone() { blip(660, 0.10, 'triangle', 0.12, 880); blip(990, 0.12, 'triangle', 0.08, 990); },
  sizzle() { noiseBurst(0.35, 0.07, 3200); },
  cookDone() { blip(880, 0.12, 'sine', 0.12, 880); blip(1174, 0.16, 'sine', 0.10, 1174); },
  plateAdd() { blip(440, 0.07, 'triangle', 0.10, 580); },
  serve() {
    blip(523, 0.12, 'sine', 0.14);
    setTimeout(() => blip(659, 0.12, 'sine', 0.14), 90);
    setTimeout(() => blip(784, 0.22, 'sine', 0.16), 180);
  },
  error() { blip(180, 0.18, 'sawtooth', 0.08, 120); },
  expire() { blip(320, 0.25, 'sawtooth', 0.10, 140); },
  tick() { blip(980, 0.05, 'square', 0.05, 980); },
  trash() { noiseBurst(0.18, 0.14, 500); },
  click() { blip(700, 0.05, 'triangle', 0.07, 700); },
  start() {
    blip(392, 0.12, 'triangle', 0.12);
    setTimeout(() => blip(523, 0.12, 'triangle', 0.12), 110);
    setTimeout(() => blip(659, 0.2, 'triangle', 0.12), 220);
  },
  gameOver() {
    blip(392, 0.2, 'triangle', 0.12, 370);
    setTimeout(() => blip(330, 0.2, 'triangle', 0.12, 310), 200);
    setTimeout(() => blip(262, 0.4, 'triangle', 0.12, 240), 400);
  },
};
