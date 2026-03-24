const BGM_TRACK_URL = new URL('../assets/audio/space-bgm.mp3', import.meta.url).href;
const IMPACT_SHARED_URL = new URL('../assets/audio/impact-shared.mp3', import.meta.url).href;

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicBus = null;
    this.sfxBus = null;
    this.track = null;
    this.trackSource = null;
    this.buffers = new Map();
    this.loadingBuffers = new Map();
    this.lastSfxAt = new Map();
    this.started = false;
    this.enabled = true;
    this.scene = 'start';
    this.button = null;
    this.lastSceneApplied = '';
    this.playPromise = null;
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
      if (this.enabled) {
        this.tryPlayTrack();
      } else {
        this.track?.pause();
      }
      this.syncButton();
    });
    this.syncButton();
  }

  syncButton() {
    if (!this.button) return;
    this.button.setAttribute('aria-pressed', String(this.enabled));
    this.button.classList.toggle('is-muted', !this.enabled);
    this.button.textContent = this.enabled ? 'AUDIO' : 'MUTE';
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
      this.applySceneMix(true);
    }
    if (this.enabled) {
      await this.tryPlayTrack();
    }
  }

  createEngine() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);

    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = 0.0001;
    this.musicBus.connect(this.master);

    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = 0.82;
    this.sfxBus.connect(this.master);

    this.track = new Audio(BGM_TRACK_URL);
    this.track.loop = true;
    this.track.preload = 'auto';

    this.trackSource = this.ctx.createMediaElementSource(this.track);
    this.trackSource.connect(this.musicBus);
  }

  async loadBuffer(key, url) {
    if (!this.ctx) return null;
    if (this.buffers.has(key)) return this.buffers.get(key);
    if (this.loadingBuffers.has(key)) return this.loadingBuffers.get(key);

    const pending = fetch(url)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => this.ctx.decodeAudioData(arrayBuffer))
      .then((buffer) => {
        this.buffers.set(key, buffer);
        return buffer;
      })
      .catch(() => null)
      .finally(() => {
        this.loadingBuffers.delete(key);
      });

    this.loadingBuffers.set(key, pending);
    return pending;
  }

  playBuffer(buffer, { gain = 1, playbackRate = 1 } = {}) {
    if (!this.ctx || !this.sfxBus || !buffer || !this.enabled) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = gain;

    source.connect(gainNode);
    gainNode.connect(this.sfxBus);
    source.start();
  }

  canPlaySfx(key, cooldownMs) {
    const now = performance.now();
    const lastPlayedAt = this.lastSfxAt.get(key) || 0;
    if (now - lastPlayedAt < cooldownMs) return false;
    this.lastSfxAt.set(key, now);
    return true;
  }

  async playPlanetImpact() {
    if (!this.started || !this.enabled) return;
    if (!this.canPlaySfx('planet-impact', 90)) return;
    const buffer = await this.loadBuffer('impact-shared', IMPACT_SHARED_URL);
    if (!buffer) return;
    this.playBuffer(buffer, {
      gain: 0.24 + Math.random() * 0.05,
      playbackRate: 1.14 + Math.random() * 0.14,
    });
  }

  async playPlanetShatter() {
    if (!this.started || !this.enabled) return;
    const buffer = await this.loadBuffer('impact-shared', IMPACT_SHARED_URL);
    if (!buffer) return;
    this.playBuffer(buffer, {
      gain: 0.88 + Math.random() * 0.08,
      playbackRate: 0.72 + Math.random() * 0.06,
    });
  }

  setScene(scene) {
    this.scene = scene;
    this.applySceneMix();
  }

  applySceneMix(immediate = false) {
    if (!this.ctx || !this.master || !this.musicBus) return;

    const now = this.ctx.currentTime;
    const ramp = immediate ? 0.01 : 0.9;
    const sceneMix = this.enabled
      ? this.scene === 'playing'
        ? { master: 0.76, music: 0.92 }
        : this.scene === 'victory'
          ? { master: 0.58, music: 0.76 }
          : { master: 0.68, music: 0.84 }
      : { master: 0.0001, music: 0.0001 };

    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(sceneMix.master, now + ramp);

    this.musicBus.gain.cancelScheduledValues(now);
    this.musicBus.gain.linearRampToValueAtTime(sceneMix.music, now + ramp);

    this.lastSceneApplied = this.scene;
  }

  async tryPlayTrack() {
    if (!this.track || !this.enabled) return;
    if (!this.track.paused) return;
    if (this.playPromise) return this.playPromise;

    this.playPromise = this.track.play()
      .catch(() => {})
      .finally(() => {
        this.playPromise = null;
      });

    return this.playPromise;
  }

  tick() {
    if (!this.ctx || !this.started) return;

    if (this.lastSceneApplied !== this.scene) {
      this.applySceneMix();
    }

    if (this.enabled && this.ctx.state === 'running' && this.track?.paused) {
      this.tryPlayTrack();
    }
  }
}
