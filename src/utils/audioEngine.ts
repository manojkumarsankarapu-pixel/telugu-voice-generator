/**
 * Web Audio Ambient Soundscapes & Visualizer Utilities
 */

export interface AmbientTrack {
  id: string;
  name: string;
  teluguName: string;
  icon: string;
  description: string;
  type: 'rain' | 'train' | 'chords' | 'cafe' | 'crickets';
}

export const AMBIENT_PRESETS: AmbientTrack[] = [
  {
    id: 'rain',
    name: 'Monsoon Rain & Thunder',
    teluguName: 'వాన జల్లు & ఉరుములు',
    icon: 'CloudRain',
    description: 'Nostalgic Hyderabad monsoon rain against window glass with distant thunder',
    type: 'rain',
  },
  {
    id: 'train',
    name: 'Night Train Nostalgia',
    teluguName: 'రాత్రి రైలు ప్రయాణం',
    icon: 'Train',
    description: 'Rhythmic click-clack of a late night sleeper journey through quiet fields',
    type: 'train',
  },
  {
    id: 'chords',
    name: 'Melancholic Piano Pads',
    teluguName: 'జ్ఞాపకాల రాగం',
    icon: 'Music',
    description: 'Soulful cinematic emotional chords inspired by vintage Telugu cinema',
    type: 'chords',
  },
  {
    id: 'cafe',
    name: 'Warm Midnight Ambience',
    teluguName: 'నిశ్శబ్ద రాత్రి',
    icon: 'Coffee',
    description: 'Soft warm room tone with gentle vinyl crackle and distant soft breezes',
    type: 'cafe',
  },
];

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private activeGenerators: { stop: () => void }[] = [];
  private currentTrackId: string | null = null;
  private volume: number = 0.25;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.ambientGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.1);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentTrack(): string | null {
    return this.currentTrackId;
  }

  public stopAmbient() {
    this.activeGenerators.forEach((gen) => {
      try {
        gen.stop();
      } catch (e) {
        // ignore
      }
    });
    this.activeGenerators = [];
    this.currentTrackId = null;
  }

  public playAmbient(trackId: string) {
    this.initContext();
    this.stopAmbient();
    if (!this.ctx || !this.ambientGain) return;

    this.currentTrackId = trackId;

    if (trackId === 'rain') {
      this.startRainSound();
    } else if (trackId === 'train') {
      this.startTrainSound();
    } else if (trackId === 'chords') {
      this.startChordsSound();
    } else if (trackId === 'cafe') {
      this.startCafeSound();
    }
  }

  private startRainSound() {
    if (!this.ctx || !this.ambientGain) return;
    const ctx = this.ctx;

    // Pink / Brown noise buffer for steady rain
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Filter towards brown noise
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Filter to sound like rain on window
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.5, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.ambientGain);

    noiseSource.start();

    // Sporadic distant thunder
    let thunderTimer: any = null;
    const scheduleThunder = () => {
      const nextDelay = 7000 + Math.random() * 9000;
      thunderTimer = setTimeout(() => {
        if (!this.ctx || !this.ambientGain || this.currentTrackId !== 'rain') return;
        try {
          const osc = this.ctx.createOscillator();
          const tGain = this.ctx.createGain();
          const tFilter = this.ctx.createBiquadFilter();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(55, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 3.0);

          tFilter.type = 'lowpass';
          tFilter.frequency.setValueAtTime(120, this.ctx.currentTime);

          tGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
          tGain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 0.8);
          tGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.5);

          osc.connect(tFilter);
          tFilter.connect(tGain);
          tGain.connect(this.ambientGain);

          osc.start();
          osc.stop(this.ctx.currentTime + 3.6);
        } catch (e) {
          // ignore
        }
        scheduleThunder();
      }, nextDelay);
    };
    scheduleThunder();

    this.activeGenerators.push({
      stop: () => {
        try {
          noiseSource.stop();
          noiseSource.disconnect();
          clearTimeout(thunderTimer);
        } catch (e) {}
      },
    });
  }

  private startTrainSound() {
    if (!this.ctx || !this.ambientGain) return;
    const ctx = this.ctx;

    // Rhythmic rail pulse
    let isRunning = true;
    let timer: any = null;

    const playClickClack = () => {
      if (!isRunning || !this.ctx || !this.ambientGain) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(220, ctx.currentTime);
        filter.Q.setValueAtTime(3, ctx.currentTime);

        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambientGain);

        osc.start();
        osc.stop(ctx.currentTime + 0.13);

        // Echo tap (second wheel)
        setTimeout(() => {
          if (!isRunning || !this.ctx || !this.ambientGain) return;
          try {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.frequency.setValueAtTime(95, ctx.currentTime);
            gain2.gain.setValueAtTime(0.12, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc2.connect(gain2);
            gain2.connect(this.ambientGain);
            osc2.start();
            osc2.stop(ctx.currentTime + 0.11);
          } catch (e) {}
        }, 110);
      } catch (e) {}

      timer = setTimeout(playClickClack, 620);
    };

    playClickClack();

    this.activeGenerators.push({
      stop: () => {
        isRunning = false;
        clearTimeout(timer);
      },
    });
  }

  private startChordsSound() {
    if (!this.ctx || !this.ambientGain) return;
    const ctx = this.ctx;

    // Cinematic minor chords (D minor / F maj9 / Bb)
    // Notes in Hz: D3 (146.8), F3 (174.6), A3 (220), C4 (261.6), E4 (329.6)
    const chordFrequencies = [
      [146.83, 220.0, 261.63, 329.63], // Dm9
      [130.81, 196.0, 261.63, 329.63], // C add9
      [116.54, 174.61, 220.0, 293.66], // Bb maj7
      [146.83, 174.61, 220.0, 261.63], // Dm7
    ];

    let chordIdx = 0;
    let isRunning = true;
    let chordTimer: any = null;
    let currentOscs: OscillatorNode[] = [];

    const playChord = () => {
      if (!isRunning || !this.ctx || !this.ambientGain) return;

      const freqs = chordFrequencies[chordIdx % chordFrequencies.length];
      chordIdx++;

      freqs.forEach((freq) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(450, ctx.currentTime);

          gain.gain.setValueAtTime(0.0001, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1.8);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 6.0);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ambientGain!);

          osc.start();
          osc.stop(ctx.currentTime + 6.2);
          currentOscs.push(osc);
        } catch (e) {}
      });

      chordTimer = setTimeout(playChord, 5200);
    };

    playChord();

    this.activeGenerators.push({
      stop: () => {
        isRunning = false;
        clearTimeout(chordTimer);
        currentOscs.forEach((o) => {
          try {
            o.stop();
          } catch (e) {}
        });
      },
    });
  }

  private startCafeSound() {
    if (!this.ctx || !this.ambientGain) return;
    const ctx = this.ctx;

    // Gentle vinyl crackle + low warm room hum
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      if (Math.random() < 0.002) {
        data[i] = (Math.random() * 2 - 1) * 0.4;
      } else {
        data[i] = (Math.random() * 2 - 1) * 0.015;
      }
    }

    const vinylSource = ctx.createBufferSource();
    vinylSource.buffer = buffer;
    vinylSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);

    vinylSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGain);

    vinylSource.start();

    this.activeGenerators.push({
      stop: () => {
        try {
          vinylSource.stop();
          vinylSource.disconnect();
        } catch (e) {}
      },
    });
  }
}

export const soundscape = new SoundscapeEngine();
