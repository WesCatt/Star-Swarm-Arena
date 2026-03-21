function createNoiseBuffer(ctx) {
  const length = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * 0.18;
  }
  return buffer;
}

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.padMix = null;
    this.pulseBus = null;
    this.noiseBus = null;
    this.padOscillators = [];
    this.padGains = [];
    this.padFilter = null;
    this.noiseSource = null;
    this.noiseFilter = null;
    this.noiseLfo = null;
    this.noiseLfoDepth = null;
    this.started = false;
    this.enabled = true;
    this.scene = 'start';
    this.button = null;
    this.nextPulseAt = 0;
    this.nextChordAt = 0;
    this.currentChord = [55, 82.41, 123.47];
    this.chordIndex = 0;
    this.lastSceneApplied = '';
  }

  attachButton(button) {
    this.button = button;
    if (!this.button) return;
    this.button.addEventListener('click', async () => {
      const wasStarted = this.started;
      await this.ensureStarted();
      if (!wasStarted) {
        this.syncButton();
        return;
      }
      this.enabled = !this.enabled;
      this.applySceneMix(true);
      this.syncButton();
    });
    this.syncButton();
  }

  syncButton() {
    if (!this.button) return;
    this.button.setAttribute('aria-pressed', String(this.enabled));
    this.button.classList.toggle('is-muted', !this.enabled);
    this.button.textContent = this.enabled ? 'BGM' : 'MUTE';
  }

  async ensureStarted() {
    if (!this.ctx) {
      this.createEngine();
    }
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
    if (!this.started) {
      this.started = true;
      this.nextPulseAt = this.ctx.currentTime + 0.35;
      this.nextChordAt = this.ctx.currentTime + 8;
      this.applySceneMix(true);
      this.schedulePulse(this.ctx.currentTime + 0.08, 0.82);
      this.scheduleShimmer(this.ctx.currentTime + 0.22, 1.15);
    }
  }

  createEngine() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);

    this.padMix = this.ctx.createGain();
    this.padMix.gain.value = 0.0001;
    this.padMix.connect(this.master);

    this.pulseBus = this.ctx.createGain();
    this.pulseBus.gain.value = 0.0001;
    this.pulseBus.connect(this.master);

    this.noiseBus = this.ctx.createGain();
    this.noiseBus.gain.value = 0.0001;
    this.noiseBus.connect(this.master);

    this.padFilter = this.ctx.createBiquadFilter();
    this.padFilter.type = 'lowpass';
    this.padFilter.frequency.value = 920;
    this.padFilter.Q.value = 0.2;
    this.padFilter.connect(this.padMix);

    const padWaveforms = ['triangle', 'sine', 'sawtooth'];
    this.currentChord.forEach((frequency, index) => {
      const osc = this.ctx.createOscillator();
      osc.type = padWaveforms[index] || 'sine';
      osc.frequency.value = frequency;

      const gain = this.ctx.createGain();
      gain.gain.value = index === 0 ? 0.1 : index === 1 ? 0.065 : 0.03;

      osc.connect(gain);
      gain.connect(this.padFilter);
      osc.start();

      this.padOscillators.push(osc);
      this.padGains.push(gain);
    });

    const driftLfo = this.ctx.createOscillator();
    const driftDepth = this.ctx.createGain();
    driftLfo.type = 'sine';
    driftLfo.frequency.value = 0.045;
    driftDepth.gain.value = 140;
    driftLfo.connect(driftDepth);
    driftDepth.connect(this.padFilter.frequency);
    driftLfo.start();

    const noise = this.ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(this.ctx);
    noise.loop = true;

    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noiseFilter.frequency.value = 960;
    this.noiseFilter.Q.value = 0.18;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.028;

    noise.connect(this.noiseFilter);
    this.noiseFilter.connect(noiseGain);
    noiseGain.connect(this.noiseBus);
    noise.start();

    this.noiseLfo = this.ctx.createOscillator();
    this.noiseLfoDepth = this.ctx.createGain();
    this.noiseLfo.frequency.value = 0.09;
    this.noiseLfoDepth.gain.value = 260;
    this.noiseLfo.connect(this.noiseLfoDepth);
    this.noiseLfoDepth.connect(this.noiseFilter.frequency);
    this.noiseLfo.start();

    this.noiseSource = noise;
  }

  setScene(scene) {
    this.scene = scene;
    this.applySceneMix();
  }

  applySceneMix(immediate = false) {
    if (!this.ctx || !this.master) return;

    const now = this.ctx.currentTime;
    const ramp = immediate ? 0.01 : 1.6;
    const sceneMix = this.enabled
      ? this.scene === 'playing'
        ? { master: 0.56, pad: 0.92, pulse: 0.64, noise: 0.28, filter: 1280 }
        : this.scene === 'victory'
          ? { master: 0.4, pad: 0.66, pulse: 0.18, noise: 0.12, filter: 920 }
          : { master: 0.48, pad: 0.84, pulse: 0.24, noise: 0.2, filter: 840 }
      : { master: 0.0001, pad: 0.0001, pulse: 0.0001, noise: 0.0001, filter: 720 };

    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(sceneMix.master, now + ramp);

    this.padMix.gain.cancelScheduledValues(now);
    this.padMix.gain.linearRampToValueAtTime(sceneMix.pad, now + ramp);

    this.pulseBus.gain.cancelScheduledValues(now);
    this.pulseBus.gain.linearRampToValueAtTime(sceneMix.pulse, now + ramp);

    this.noiseBus.gain.cancelScheduledValues(now);
    this.noiseBus.gain.linearRampToValueAtTime(sceneMix.noise, now + ramp);

    this.padFilter.frequency.cancelScheduledValues(now);
    this.padFilter.frequency.linearRampToValueAtTime(sceneMix.filter, now + ramp);

    this.lastSceneApplied = this.scene;
  }

  advanceChord(time) {
    const chords = [
      [55, 82.41, 123.47],
      [58.27, 87.31, 130.81],
      [49, 73.42, 110],
      [65.41, 98, 146.83],
    ];
    this.chordIndex = (this.chordIndex + 1) % chords.length;
    this.currentChord = chords[this.chordIndex];
    this.padOscillators.forEach((osc, index) => {
      osc.frequency.cancelScheduledValues(time);
      osc.frequency.exponentialRampToValueAtTime(this.currentChord[index], time + 2.8);
    });
  }

  schedulePulse(time, strength = 1) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(55, time + 1.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, time);
    filter.Q.value = 0.8;

    const attack = 0.015;
    const peak = 0.22 * strength;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 2.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.pulseBus);

    osc.start(time);
    osc.stop(time + 2.2);
  }

  scheduleShimmer(time, peak = 1) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const notes = [220, 246.94, 293.66, 329.63];
    const pick = notes[Math.floor(Math.random() * notes.length)];

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pick, time);
    osc.frequency.exponentialRampToValueAtTime(pick * 1.5, time + 1.4);

    filter.type = 'highpass';
    filter.frequency.value = 420;

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.065 * peak, time + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 3.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);

    osc.start(time);
    osc.stop(time + 4);
  }

  tick() {
    if (!this.ctx || !this.started) return;

    if (this.lastSceneApplied !== this.scene) {
      this.applySceneMix();
    }

    const now = this.ctx.currentTime;
    const lookAhead = now + 0.8;
    const pulseSpacing = this.scene === 'playing' ? 1.55 : this.scene === 'victory' ? 2.8 : 3.6;
    const pulseStrength = this.scene === 'playing' ? 1 : this.scene === 'victory' ? 0.55 : 0.42;

    while (this.nextPulseAt < lookAhead) {
      this.schedulePulse(this.nextPulseAt, pulseStrength);
      if (this.scene === 'playing' && Math.random() > 0.55) {
        this.scheduleShimmer(this.nextPulseAt + 0.45 + Math.random() * 0.35);
      }
      this.nextPulseAt += pulseSpacing;
    }

    while (this.nextChordAt < now + 3.2) {
      this.advanceChord(this.nextChordAt);
      this.nextChordAt += 8;
    }
  }
}
