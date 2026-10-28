import { useSyncExternalStore } from 'react';

/**
 * Small synthesized cues for the auction, in the spirit of the TK7 beep: no audio files,
 * just Web Audio. Each note is a sine with a quiet octave on top (a soft bell), a 6 ms
 * attack and an exponential fade, kept well below a notification's loudness.
 */

export type SoundCue = 'bid' | 'myBid' | 'outbid';

interface Note {
  /** Seconds after the cue starts. */
  at: number;
  frequency: number;
  duration: number;
  gain: number;
}

const cues: Record<SoundCue, Note[]> = {
  // Someone else raised a paddle in the room: a single soft tick.
  bid: [{ at: 0, frequency: 880, duration: 0.09, gain: 0.025 }],
  // Your bid was accepted: two short notes going up (E5, B5).
  myBid: [
    { at: 0, frequency: 659.25, duration: 0.16, gain: 0.045 },
    { at: 0.08, frequency: 987.77, duration: 0.24, gain: 0.045 },
  ],
  // You lost the lead: two notes going down (D5, A4), noticeable without alarming.
  outbid: [
    { at: 0, frequency: 587.33, duration: 0.2, gain: 0.06 },
    { at: 0.13, frequency: 440, duration: 0.34, gain: 0.06 },
  ],
};

const STORAGE_KEY = 'pregao.sound';
const listeners = new Set<() => void>();
let context: AudioContext | null = null;

function readEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

let enabled = readEnabled();

/** Browsers only allow audio after a gesture: create or resume the context on the first one. */
export function unlockAudioOnFirstGesture(): void {
  const unlock = () => {
    context ??= new AudioContext();
    void context.resume();
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
}

function playNote(audio: AudioContext, { at, frequency, duration, gain }: Note): void {
  const start = audio.currentTime + at;
  const envelope = audio.createGain();
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.linearRampToValueAtTime(gain, start + 0.006);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  envelope.connect(audio.destination);

  for (const [multiple, level] of [
    [1, 1],
    [2, 0.25],
  ] as const) {
    const voice = audio.createGain();
    voice.gain.value = level;
    voice.connect(envelope);
    const oscillator = audio.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency * multiple;
    oscillator.connect(voice);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }
}

/** Plays a cue if sounds are on and the browser has unlocked audio; silent otherwise. */
export function playSound(cue: SoundCue): void {
  if (!enabled || !context || context.state !== 'running') return;
  for (const note of cues[cue]) playNote(context, note);
}

function setEnabled(next: boolean): void {
  enabled = next;
  try {
    localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
  } catch {
    // The choice just won't persist.
  }
  listeners.forEach((notify) => notify());
  if (next) playSound('bid');
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSoundSetting(): { soundOn: boolean; toggleSound: () => void } {
  const soundOn = useSyncExternalStore(subscribe, () => enabled);
  return { soundOn, toggleSound: () => setEnabled(!enabled) };
}
