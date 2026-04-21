let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function beep(freq: number, type: OscillatorType, duration: number, gain: number): void {
  const ac  = getCtx();
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.connect(env);
  env.connect(ac.destination);
  osc.type      = type;
  osc.frequency.value = freq;
  env.gain.setValueAtTime(gain, ac.currentTime);
  env.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + duration);
}

export function playConfirm(): void {
  beep(440, 'sine', 0.12, 0.18);
}

export function playScoreHigh(): void {
  // two ascending tones
  const ac = getCtx();
  const t  = ac.currentTime;
  [523, 784].forEach((f, i) => {
    const osc = ac.createOscillator();
    const env = ac.createGain();
    osc.connect(env); env.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.value = f;
    const start = t + i * 0.1;
    env.gain.setValueAtTime(0.18, start);
    env.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
    osc.start(start); osc.stop(start + 0.18);
  });
}

export function playScoreLow(): void {
  beep(220, 'sine', 0.25, 0.15);
}

export function playPerfect(): void {
  // C5 – E5 – G5 – C6 ascending arpeggio
  const ac = getCtx();
  const t  = ac.currentTime;
  [523, 659, 784, 1047].forEach((f, i) => {
    const osc = ac.createOscillator();
    const env = ac.createGain();
    osc.connect(env); env.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.value = f;
    const s = t + i * 0.09;
    env.gain.setValueAtTime(0.22, s);
    env.gain.exponentialRampToValueAtTime(0.001, s + 0.22);
    osc.start(s); osc.stop(s + 0.22);
  });
}
