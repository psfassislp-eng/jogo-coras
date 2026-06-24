/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

/**
 * Initializes the AudioContext lazily on user interaction.
 */
function getAudioContext(): AudioContext | null {
  if (!soundEnabled) return null;
  
  if (!audioCtx) {
    try {
      // Support standard and legacy webkit audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioContextClass();
    } catch (e) {
      console.warn('Web Audio API is not supported in this browser.', e);
    }
  }

  // Resume context if suspended (browser security policy)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  return audioCtx;
}

/**
 * Configure the sound system enabled state.
 */
export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  if (!enabled && audioCtx) {
    audioCtx.close().then(() => {
      audioCtx = null;
    }).catch(() => {
      audioCtx = null;
    });
  }
}

/**
 * Play a synthesized sound effect using Web Audio API.
 * This is 100% offline and requires no static asset files!
 */
export function playSound(type: 'click' | 'drag' | 'victory' | 'complete' | 'error'): void {
  if (!soundEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  try {
    switch (type) {
      case 'click': {
        // Short snappy high-frequency pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      case 'drag': {
        // Very low subtle bass pop when beginning to drag
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }

      case 'complete': {
        // Happy, rising major triad arpeggio (C4, E4, G4, C5)
        const notes = [261.63, 329.63, 392.00, 523.25];
        const noteDuration = 0.08;
        const noteGap = 0.06;

        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * noteGap);

          // Smooth envelope
          gain.gain.setValueAtTime(0, now + idx * noteGap);
          gain.gain.linearRampToValueAtTime(0.12, now + idx * noteGap + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.005, now + idx * noteGap + noteDuration + 0.1);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * noteGap);
          osc.stop(now + idx * noteGap + noteDuration + 0.15);
        });
        break;
      }

      case 'victory': {
        // Triumphant, longer retro fanfarre chord
        // Plays an arpeggio first, then holds a major chord with a vibrato
        const chordFreqs = [261.63, 329.63, 392.00, 523.25, 659.25];
        const startTimeOffset = 0.07;

        chordFreqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * startTimeOffset);
          
          // Add a tiny bit of vibrato
          if (idx === chordFreqs.length - 1) {
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            lfo.frequency.setValueAtTime(8, now); // 8 Hz vibrato
            lfoGain.gain.setValueAtTime(3, now); // 3 Hz amplitude of vibration
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start(now);
            lfo.stop(now + 1.2);
          }

          gain.gain.setValueAtTime(0, now + idx * startTimeOffset);
          gain.gain.linearRampToValueAtTime(0.08, now + idx * startTimeOffset + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.005, now + idx * startTimeOffset + 0.8);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * startTimeOffset);
          osc.stop(now + idx * startTimeOffset + 1.0);
        });
        break;
      }

      case 'error': {
        // Short low flat buzz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(120, now + 0.15);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
    }
  } catch (error) {
    console.warn('Error playing synthesized sound:', error);
  }
}
