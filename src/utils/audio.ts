// Web Audio API custom synthesizer chip
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a beautiful electronic sonar pulse chime
 */
export function playSonarPulse() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Sub sine wave
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(520, now); // C5 principal
    osc1.frequency.exponentialRampToValueAtTime(1040, now + 0.15); // Ramp up

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(520, now);
    osc2.frequency.setValueAtTime(783.99, now + 0.08); // G5 harmony

    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.8);
    osc2.stop(now + 0.8);
  } catch (err) {
    console.warn("Audio Context could not start:", err);
  }
}

/**
 * Play a warning alarm for significant seismic events
 */
export function playSeismicWarning() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Double detuned oscillator for heavy warning tone
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(220, now); // A3 low
    osc1.frequency.linearRampToValueAtTime(165, now + 0.2); // Pitch sweep
    osc1.frequency.linearRampToValueAtTime(220, now + 0.4);

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(223, now); // Slightly detuned
    osc2.frequency.linearRampToValueAtTime(168, now + 0.2);
    osc2.frequency.linearRampToValueAtTime(223, now + 0.4);

    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.setValueAtTime(0.15, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  } catch (err) {
    console.warn("Warning Audio Context could not start:", err);
  }
}

/**
 * Play general micro-interaction tactile sound
 */
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, now);
    gainNode.gain.setValueAtTime(0.02, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch (err) {
    // Fail silently
  }
}
