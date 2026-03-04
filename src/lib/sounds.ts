const STORAGE_KEY = "draw-her-story-sound";

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== "off";
}

export function setSoundEnabled(enabled: boolean) {
  localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.15,
  delay = 0,
) {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

// Correct guess — cheerful rising arpeggio C5-E5-G5
export function playCorrectGuess() {
  playTone(523, 0.15, "sine", 0.12, 0);
  playTone(659, 0.15, "sine", 0.12, 0.08);
  playTone(784, 0.2, "sine", 0.15, 0.16);
}

// Close guess — two-note "almost" (A4 up, then F#4 down)
export function playCloseGuess() {
  playTone(440, 0.12, "sine", 0.08, 0);
  playTone(370, 0.15, "sine", 0.08, 0.1);
}

// Timer tick — short high click
export function playTick() {
  playTone(800, 0.03, "square", 0.06);
}

// Timer expired — low descending tone
export function playTimerExpired() {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.5);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
}

// Round start — quick ascending chime
export function playRoundStart() {
  playTone(523, 0.1, "sine", 0.1, 0);
  playTone(659, 0.1, "sine", 0.1, 0.06);
  playTone(784, 0.15, "sine", 0.12, 0.12);
}

// Reveal card — shimmer sweep
export function playReveal() {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.6);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.6);
}

// Victory fanfare — C-E-G-C chord, staggered
export function playVictory() {
  playTone(523, 0.5, "sine", 0.1, 0);
  playTone(659, 0.45, "sine", 0.1, 0.1);
  playTone(784, 0.4, "sine", 0.1, 0.2);
  playTone(1047, 0.5, "sine", 0.12, 0.3);
}

// Button click — soft pop
export function playClick() {
  playTone(600, 0.04, "sine", 0.08);
}
