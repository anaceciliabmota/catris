const MUTE_KEY = 'tetris-muted';

let audioCtx = null;
let bgmInterval = null;
let muted = false;
let initialized = false;

const BGM_NOTES = [262, 294, 330, 349, 392, 330, 294, 262];
let bgmStep = 0;

function loadMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === 'true';
  } catch {
    return false;
  }
}

function saveMuted() {
  try {
    localStorage.setItem(MUTE_KEY, String(muted));
  } catch {
    // ignore
  }
}

function ensureContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, duration, type = 'sine', volume = 0.15, when = 0) {
  if (muted || !audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, audioCtx.currentTime + when);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + when + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(audioCtx.currentTime + when);
  osc.stop(audioCtx.currentTime + when + duration);
}

const SFX = {
  lineClear: () => {
    playTone(523, 0.08, 'square', 0.12);
    playTone(659, 0.08, 'square', 0.1, 0.06);
    playTone(784, 0.12, 'square', 0.08, 0.12);
  },
  tetris: () => {
    playTone(523, 0.1, 'square', 0.14);
    playTone(659, 0.1, 'square', 0.12, 0.08);
    playTone(784, 0.1, 'square', 0.12, 0.16);
    playTone(1047, 0.2, 'square', 0.1, 0.24);
  },
  levelUp: () => {
    playTone(440, 0.1, 'triangle', 0.14);
    playTone(554, 0.1, 'triangle', 0.14, 0.1);
    playTone(659, 0.15, 'triangle', 0.12, 0.2);
    playTone(880, 0.25, 'triangle', 0.1, 0.32);
  },
  lock: () => playTone(180, 0.06, 'triangle', 0.08),
  rotate: () => playTone(330, 0.04, 'sine', 0.06),
  gameOver: () => {
    playTone(220, 0.2, 'sawtooth', 0.1);
    playTone(165, 0.3, 'sawtooth', 0.08, 0.15);
    playTone(110, 0.4, 'sawtooth', 0.06, 0.35);
  },
  menuSelect: () => playTone(392, 0.08, 'sine', 0.1),
};

function playBgmStep() {
  if (muted || !audioCtx) return;
  const freq = BGM_NOTES[bgmStep % BGM_NOTES.length];
  playTone(freq, 0.18, 'triangle', 0.06);
  bgmStep++;
}

export function initAudio() {
  if (initialized) return;
  muted = loadMuted();
  ensureContext();
  initialized = true;
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  saveMuted();
  if (muted) {
    stopBgm();
  } else if (initialized) {
    startBgm();
  }
  updateMuteButton();
  return muted;
}

export function setMuted(value) {
  muted = value;
  saveMuted();
  if (muted) stopBgm();
  updateMuteButton();
}

let muteButtonEl = null;

export function bindMuteButton(el) {
  muteButtonEl = el;
  updateMuteButton();
}

function updateMuteButton() {
  if (!muteButtonEl) return;
  muteButtonEl.textContent = muted ? '🔇 Som off' : '🔊 Som on';
  muteButtonEl.setAttribute('aria-pressed', String(!muted));
}

export function playSfx(name) {
  if (!initialized) initAudio();
  if (muted) return;
  ensureContext();
  const fn = SFX[name];
  if (fn) fn();
}

export function startBgm() {
  if (muted) return;
  if (!initialized) initAudio();
  ensureContext();
  stopBgm();
  playBgmStep();
  bgmInterval = setInterval(playBgmStep, 450);
}

export function stopBgm() {
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
}

export function onUserGesture() {
  initAudio();
  if (!muted) {
    ensureContext();
  }
}
