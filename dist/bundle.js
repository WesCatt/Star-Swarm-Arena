/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/planets/Planets/planet00.png"
/*!*********************************************!*\
  !*** ./assets/planets/Planets/planet00.png ***!
  \*********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

module.exports = __webpack_require__.p + "6130d658fa08519167dc.png";

/***/ },

/***/ "./assets/planets/Planets/planet04.png"
/*!*********************************************!*\
  !*** ./assets/planets/Planets/planet04.png ***!
  \*********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

module.exports = __webpack_require__.p + "4af4c00eb4888baa06e0.png";

/***/ },

/***/ "./assets/planets/Planets/planet08.png"
/*!*********************************************!*\
  !*** ./assets/planets/Planets/planet08.png ***!
  \*********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

module.exports = __webpack_require__.p + "9b60f350be03bb11f738.png";

/***/ },

/***/ "./assets/planets/Ships/ship_0000.png"
/*!********************************************!*\
  !*** ./assets/planets/Ships/ship_0000.png ***!
  \********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

module.exports = __webpack_require__.p + "e8b3fe7d920eeb192a11.png";

/***/ },

/***/ "./assets/planets/Ships/ship_0012.png"
/*!********************************************!*\
  !*** ./assets/planets/Ships/ship_0012.png ***!
  \********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

module.exports = __webpack_require__.p + "6f193a8b8f6e32760091.png";

/***/ },

/***/ "./js/assets.js"
/*!**********************!*\
  !*** ./js/assets.js ***!
  \**********************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getPlanetTexture: () => (/* binding */ getPlanetTexture),
/* harmony export */   getShipTexture: () => (/* binding */ getShipTexture),
/* harmony export */   loadAssets: () => (/* binding */ loadAssets)
/* harmony export */ });
const PLANET_IMAGE_URLS = {
  base: new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Planets/planet04.png */ "./assets/planets/Planets/planet04.png"), __webpack_require__.b).href,
  rebuiltBlue: new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Planets/planet00.png */ "./assets/planets/Planets/planet00.png"), __webpack_require__.b).href,
  rebuiltRed: new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Planets/planet08.png */ "./assets/planets/Planets/planet08.png"), __webpack_require__.b).href,
};

const SHIP_IMAGE_URLS = {
  blue: new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Ships/ship_0000.png */ "./assets/planets/Ships/ship_0000.png"), __webpack_require__.b).href,
  red: new URL(/* asset import */ __webpack_require__(/*! ../assets/planets/Ships/ship_0012.png */ "./assets/planets/Ships/ship_0012.png"), __webpack_require__.b).href,
};

const imageCache = new Map();

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadAssets() {
  const entries = [
    ...Object.entries(PLANET_IMAGE_URLS).map(([key, url]) => [`planet:${key}`, url]),
    ...Object.entries(SHIP_IMAGE_URLS).map(([key, url]) => [`ship:${key}`, url]),
  ];
  await Promise.all(entries.map(async ([key, url]) => {
    const image = await loadImage(url);
    imageCache.set(key, image);
  }));
}

function getPlanetTexture(key = 'base') {
  return imageCache.get(`planet:${key}`) || imageCache.get('planet:base') || null;
}

function getShipTexture(team) {
  return imageCache.get(`ship:${team}`) || null;
}


/***/ },

/***/ "./js/audio.js"
/*!*********************!*\
  !*** ./js/audio.js ***!
  \*********************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AudioManager: () => (/* binding */ AudioManager)
/* harmony export */ });
function createNoiseBuffer(ctx) {
  const length = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * 0.18;
  }
  return buffer;
}

class AudioManager {
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


/***/ },

/***/ "./js/camera.js"
/*!**********************!*\
  !*** ./js/camera.js ***!
  \**********************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Camera: () => (/* binding */ Camera)
/* harmony export */ });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils.js */ "./js/utils.js");
/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./config.js */ "./js/config.js");



class Camera {
  constructor() {
    this.position = new _utils_js__WEBPACK_IMPORTED_MODULE_0__.Vector2(_config_js__WEBPACK_IMPORTED_MODULE_1__.WORLD.width * 0.5, _config_js__WEBPACK_IMPORTED_MODULE_1__.WORLD.height * 0.5);
    this.zoom = 1;
    this.minZoom = 0.5;
    this.maxZoom = 1.2;
    this.zoomSmooth = 0.05;
    this.posSmooth = 0.1;
    this.shakeTime = 0;
    this.shakeStrength = 0;
    this.shakeOffset = new _utils_js__WEBPACK_IMPORTED_MODULE_0__.Vector2();
  }

  update(p1, p2, viewportWidth, viewportHeight, tick = 1) {
    const midX = (p1.pos.x + p2.pos.x) * 0.5;
    const midY = (p1.pos.y + p2.pos.y) * 0.5;
    const spanX = Math.abs(p1.pos.x - p2.pos.x) + 420;
    const spanY = Math.abs(p1.pos.y - p2.pos.y) + 320;
    const targetZoom = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.clamp)(
      Math.min(viewportWidth / spanX, viewportHeight / spanY),
      this.minZoom,
      this.maxZoom,
    );

    this.zoom = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.lerp)(this.zoom, targetZoom, 1 - Math.pow(1 - this.zoomSmooth, tick));
    this.position.x = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.lerp)(this.position.x, midX, 1 - Math.pow(1 - this.posSmooth, tick));
    this.position.y = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.lerp)(this.position.y, midY, 1 - Math.pow(1 - this.posSmooth, tick));

    const halfWidth = viewportWidth / this.zoom / 2;
    const halfHeight = viewportHeight / this.zoom / 2;

    this.position.x = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.clamp)(this.position.x, halfWidth, _config_js__WEBPACK_IMPORTED_MODULE_1__.WORLD.width - halfWidth);
    this.position.y = (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.clamp)(this.position.y, halfHeight, _config_js__WEBPACK_IMPORTED_MODULE_1__.WORLD.height - halfHeight);

    if (this.shakeTime > 0) {
      this.shakeTime = Math.max(0, this.shakeTime - tick);
      const intensity = this.shakeStrength * (this.shakeTime / Math.max(this.shakeTime + tick, 0.001));
      this.shakeOffset.set((Math.random() * 2 - 1) * intensity, (Math.random() * 2 - 1) * intensity);
    } else {
      this.shakeOffset.set(0, 0);
    }
  }

  apply(ctx, canvas) {
    ctx.save();
    ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.position.x + this.shakeOffset.x, -this.position.y + this.shakeOffset.y);
  }

  restore(ctx) {
    ctx.restore();
  }

  worldToScreen(x, y, canvas) {
    return {
      x: (x - this.position.x) * this.zoom + canvas.width * 0.5,
      y: (y - this.position.y) * this.zoom + canvas.height * 0.5,
    };
  }

  screenToWorld(x, y, canvas) {
    return {
      x: (x - canvas.width * 0.5) / this.zoom + this.position.x,
      y: (y - canvas.height * 0.5) / this.zoom + this.position.y,
    };
  }

  shake(strength = 10, duration = 10) {
    this.shakeStrength = Math.max(this.shakeStrength, strength);
    this.shakeTime = Math.max(this.shakeTime, duration);
  }
}


/***/ },

/***/ "./js/collision.js"
/*!*************************!*\
  !*** ./js/collision.js ***!
  \*************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   overlapsCircle: () => (/* binding */ overlapsCircle),
/* harmony export */   resolveCircleCollision: () => (/* binding */ resolveCircleCollision)
/* harmony export */ });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils.js */ "./js/utils.js");


function overlapsCircle(a, b, padding = 0) {
  const radius = (a.radius || 0) + (b.radius || 0) + padding;
  return (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__.distance)(a, b) < radius;
}

function resolveCircleCollision(a, b, push = 0.5) {
  const dx = b.pos.x - a.pos.x;
  const dy = b.pos.y - a.pos.y;
  const dist = Math.hypot(dx, dy) || 0.001;
  const minDist = a.radius + b.radius;
  const overlap = minDist - dist;

  if (overlap <= 0) {
    return;
  }

  const nx = dx / dist;
  const ny = dy / dist;
  const offset = overlap * push;

  a.pos.x -= nx * offset;
  a.pos.y -= ny * offset;
  b.pos.x += nx * offset;
  b.pos.y += ny * offset;

  a.vel.x -= nx * 0.08;
  a.vel.y -= ny * 0.08;
  b.vel.x += nx * 0.08;
  b.vel.y += ny * 0.08;
}


/***/ },

/***/ "./js/config.js"
/*!**********************!*\
  !*** ./js/config.js ***!
  \**********************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BALANCE: () => (/* binding */ BALANCE),
/* harmony export */   BUFF_LABELS: () => (/* binding */ BUFF_LABELS),
/* harmony export */   ITEM_TYPES: () => (/* binding */ ITEM_TYPES),
/* harmony export */   TEAM_COLORS: () => (/* binding */ TEAM_COLORS),
/* harmony export */   WORLD: () => (/* binding */ WORLD)
/* harmony export */ });
const WORLD = {
  width: 2000,
  height: 2000,
  stars: 150,
  grid: 100,
  planets: 6,
};

const TEAM_COLORS = {
  blue: {
    primary: '#4fd4ff',
    secondary: '#128be6',
    glow: 'rgba(79, 212, 255, 0.32)',
    text: 'Blue Fleet',
  },
  red: {
    primary: '#ff8a7a',
    secondary: '#ef4747',
    glow: 'rgba(255, 138, 122, 0.32)',
    text: 'Red Fleet',
  },
  neutral: {
    primary: '#d6d8de',
    secondary: '#79859a',
    glow: 'rgba(214, 216, 222, 0.18)',
    text: 'Neutral',
  },
};

const BALANCE = {
  mothership: {
    radius: 28,
    health: 100,
    acceleration: 0.2,
    maxSpeed: 3,
    friction: 0.95,
    boostMultiplier: 1.75,
    boostTransition: 0.18,
    turnSpeed: 0.12,
    turnAcceleration: 0.028,
    turnDrag: 0.82,
    spawnRate: 30,
    baseCap: 30,
  },
  drone: {
    radius: 8,
    health: 30,
    maxSpeed: 2.8,
    senseRange: 80,
    attackCooldown: 18,
    attackDamage: 6,
    shipDamage: 3.5,
    planetDamage: 4.5,
  },
  planet: {
    radius: 48,
    health: 200,
    captureRestore: 0.2,
    recoverPerFrame: 0.06,
    recoverDelay: 180,
    supportSpawnRate: 240,
    supportThreshold: 0.3,
  },
  item: {
    radius: 20,
    maxActive: 3,
    spawnRate: 600,
  },
};

const ITEM_TYPES = [
  { id: 'ship-speed', icon: 'thruster', name: 'Ship Speed', description: 'Mothership speed +50% for 3 seconds.', duration: 3, accent: '#75f2ff' },
  { id: 'production', icon: 'factory', name: 'Production', description: 'Drone output doubles for 3 seconds.', duration: 3, accent: '#ffd95a' },
  { id: 'drone-size', icon: 'expand', name: 'Drone Size', description: 'Drone body size +80% for 3 seconds.', duration: 3, accent: '#ffb05c' },
  { id: 'drone-speed', icon: 'bolt', name: 'Drone Speed', description: 'Drone speed +50% for 3 seconds.', duration: 3, accent: '#7cffd8' },
  { id: 'drone-attack', icon: 'crosshair', name: 'Attack x2', description: 'Drone damage doubles for 3 seconds.', duration: 3, accent: '#ff8a7a' },
  { id: 'neutralize', icon: 'eclipse', name: 'Neutralize', description: 'One enemy planet is reset to neutral instantly.', duration: 0, accent: '#c8d1ff' },
  { id: 'autocapture', icon: 'flag', name: 'Auto Capture', description: 'Claims the nearest planet after 3 seconds.', duration: 3, accent: '#b2ff8e' },
];

const BUFF_LABELS = {
  shipSpeed: 'Ship Speed',
  production: 'Production',
  droneSize: 'Drone Size',
  droneSpeed: 'Drone Speed',
  droneDamage: 'Attack x2',
  autocapture: 'Auto Capture',
};


/***/ },

/***/ "./js/controls.js"
/*!************************!*\
  !*** ./js/controls.js ***!
  \************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Controls: () => (/* binding */ Controls)
/* harmony export */ });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils.js */ "./js/utils.js");


class Controls {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.codes = new Set();
    this.touchBoost = {
      blue: false,
      red: false,
    };
    this.touchState = {
      blue: this.createTouchSlot(),
      red: this.createTouchSlot(),
    };
    this.bind();
  }

  createTouchSlot() {
    return {
      active: false,
      id: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      vector: new _utils_js__WEBPACK_IMPORTED_MODULE_0__.Vector2(),
    };
  }

  bind() {
    window.addEventListener('keydown', (event) => {
      this.keys.add(event.key.toLowerCase());
      this.codes.add(event.code);
    });

    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.key.toLowerCase());
      this.codes.delete(event.code);
    });

    this.canvas.addEventListener('touchstart', (event) => this.handleTouchStart(event), { passive: false });
    this.canvas.addEventListener('touchmove', (event) => this.handleTouchMove(event), { passive: false });
    this.canvas.addEventListener('touchend', (event) => this.handleTouchEnd(event), { passive: false });
    this.canvas.addEventListener('touchcancel', (event) => this.handleTouchEnd(event), { passive: false });

    this.bindBoostButton('blue', document.getElementById('blue-boost-button'));
    this.bindBoostButton('red', document.getElementById('red-boost-button'));
  }

  bindBoostButton(team, element) {
    if (!element) {
      return;
    }

    const activate = (event) => {
      event.preventDefault();
      this.touchBoost[team] = true;
    };

    const deactivate = (event) => {
      event.preventDefault();
      this.touchBoost[team] = false;
    };

    element.addEventListener('pointerdown', activate);
    element.addEventListener('pointerup', deactivate);
    element.addEventListener('pointerleave', deactivate);
    element.addEventListener('pointercancel', deactivate);
  }

  handleTouchStart(event) {
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const midX = rect.left + rect.width * 0.5;

    for (const touch of event.changedTouches) {
      const side = touch.clientX < midX ? 'blue' : 'red';
      const slot = this.touchState[side];

      if (slot.active) {
        continue;
      }

      slot.active = true;
      slot.id = touch.identifier;
      slot.startX = touch.clientX;
      slot.startY = touch.clientY;
      slot.currentX = touch.clientX;
      slot.currentY = touch.clientY;
      slot.vector.set(0, 0);
    }
  }

  handleTouchMove(event) {
    event.preventDefault();
    for (const touch of event.changedTouches) {
      const side = this.findTouchSide(touch.identifier);
      if (!side) {
        continue;
      }
      const slot = this.touchState[side];
      slot.currentX = touch.clientX;
      slot.currentY = touch.clientY;
      const dx = slot.currentX - slot.startX;
      const dy = slot.currentY - slot.startY;
      slot.vector.set(dx / 60, dy / 60);
      if (slot.vector.length() > 1) {
        slot.vector.normalize();
      }
    }
  }

  handleTouchEnd(event) {
    event.preventDefault();
    for (const touch of event.changedTouches) {
      const side = this.findTouchSide(touch.identifier);
      if (!side) {
        continue;
      }
      this.touchState[side] = this.createTouchSlot();
    }
  }

  findTouchSide(identifier) {
    if (this.touchState.blue.id === identifier) {
      return 'blue';
    }
    if (this.touchState.red.id === identifier) {
      return 'red';
    }
    return null;
  }

  getMoveVector(team) {
    const vector = new _utils_js__WEBPACK_IMPORTED_MODULE_0__.Vector2();

    if (team === 'blue') {
      if (this.keys.has('w')) vector.y -= 1;
      if (this.keys.has('s')) vector.y += 1;
      if (this.keys.has('a')) vector.x -= 1;
      if (this.keys.has('d')) vector.x += 1;
    } else {
      if (this.keys.has('arrowup')) vector.y -= 1;
      if (this.keys.has('arrowdown')) vector.y += 1;
      if (this.keys.has('arrowleft')) vector.x -= 1;
      if (this.keys.has('arrowright')) vector.x += 1;
    }

    const slot = this.touchState[team];
    vector.x += slot.vector.x;
    vector.y += slot.vector.y;
    if (vector.length() > 1) {
      vector.normalize();
    }
    return vector;
  }

  getJoystickState(team) {
    const slot = this.touchState[team];
    if (!slot.active) {
      return null;
    }
    return {
      startX: slot.startX,
      startY: slot.startY,
      currentX: slot.startX + slot.vector.x * 60,
      currentY: slot.startY + slot.vector.y * 60,
    };
  }

  getBoostHeld(team) {
    if (team === 'blue') {
      return this.codes.has('Space') || this.touchBoost.blue;
    }
    return this.codes.has('NumpadEnter') || this.touchBoost.red;
  }

  reset() {
    this.keys.clear();
    this.codes.clear();
    this.touchBoost.blue = false;
    this.touchBoost.red = false;
    this.touchState.blue = this.createTouchSlot();
    this.touchState.red = this.createTouchSlot();
  }
}


/***/ },

/***/ "./js/entities/drone.js"
/*!******************************!*\
  !*** ./js/entities/drone.js ***!
  \******************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Drone: () => (/* binding */ Drone)
/* harmony export */ });
/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config.js */ "./js/config.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils.js */ "./js/utils.js");



class Drone {
  constructor(team, x, y) {
    this.team = team;
    this.color = _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[team];
    this.pos = new _utils_js__WEBPACK_IMPORTED_MODULE_1__.Vector2(x, y);
    this.vel = _utils_js__WEBPACK_IMPORTED_MODULE_1__.Vector2.fromAngle((0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.rand)(0, Math.PI * 2), (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.rand)(0.2, 1.2));
    this.radius = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.drone.radius;
    this.baseRadius = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.drone.radius;
    this.maxHealth = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.drone.health;
    this.health = this.maxHealth;
    this.senseRange = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.drone.senseRange;
    this.attackCooldown = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.rand)(0, _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.drone.attackCooldown);
    this.heading = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.rand)(0, Math.PI * 2);
    this.orbitSeed = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.rand)(0, Math.PI * 2);
    this.destroyedByImpact = false;
  }

  calculateForces(allies, enemies, mothership, enemyMothership, planets, world, time) {
    const separation = new _utils_js__WEBPACK_IMPORTED_MODULE_1__.Vector2();
    const alignment = new _utils_js__WEBPACK_IMPORTED_MODULE_1__.Vector2();
    const cohesion = new _utils_js__WEBPACK_IMPORTED_MODULE_1__.Vector2();
    let closeAllies = 0;
    let farAllies = 0;

    for (const ally of allies) {
      if (ally === this) continue;
      const dx = this.pos.x - ally.pos.x;
      const dy = this.pos.y - ally.pos.y;
      const dist = Math.hypot(dx, dy) || 0.001;

      if (dist < 18) {
        separation.x += dx / dist;
        separation.y += dy / dist;
        closeAllies += 1;
      }

      if (dist < 70) {
        alignment.add(ally.vel);
        cohesion.add(ally.pos);
        farAllies += 1;
      }
    }

    if (closeAllies > 0) {
      separation.scale(1 / closeAllies).normalize().scale(0.62);
    }

    if (farAllies > 0) {
      alignment.scale(1 / farAllies).normalize().scale(0.22);
      cohesion.scale(1 / farAllies).subtract(this.pos).normalize().scale(0.2);
    }

    let target = null;
    let targetDistance = Infinity;

    for (const enemy of enemies) {
      const dist = this.pos.distanceTo(enemy.pos);
      if (dist < Math.max(this.senseRange, 150) && dist < targetDistance) {
        target = enemy;
        targetDistance = dist;
      }
    }

    const enemyShipDistance = this.pos.distanceTo(enemyMothership.pos);
    if (enemyShipDistance < 220 && enemyShipDistance < targetDistance) {
      target = enemyMothership;
      targetDistance = enemyShipDistance;
    }

    for (const planet of planets) {
      if (planet.owner === this.team) continue;
      const dist = this.pos.distanceTo(planet.pos);
      if (dist < 260 && dist < targetDistance) {
        target = planet;
        targetDistance = dist;
      }
    }

    const targetForce = new _utils_js__WEBPACK_IMPORTED_MODULE_1__.Vector2();
    if (target) {
      targetForce.set(target.pos.x - this.pos.x, target.pos.y - this.pos.y).normalize().scale(target.kind === 'planet' ? 0.48 : 0.56);
    } else {
      const orbitRadius = 74 + (this.orbitSeed % 1) * 44;
      const orbitTarget = mothership.pos.clone().add(_utils_js__WEBPACK_IMPORTED_MODULE_1__.Vector2.fromAngle(this.orbitSeed + time * 0.002, orbitRadius));
      targetForce.set(orbitTarget.x - this.pos.x, orbitTarget.y - this.pos.y).normalize().scale(0.3);
    }

    const edgeForce = new _utils_js__WEBPACK_IMPORTED_MODULE_1__.Vector2();
    if (this.pos.x < 120) edgeForce.x += 1;
    if (this.pos.x > world.width - 120) edgeForce.x -= 1;
    if (this.pos.y < 120) edgeForce.y += 1;
    if (this.pos.y > world.height - 120) edgeForce.y -= 1;
    edgeForce.normalize().scale(0.42);

    return { separation, alignment, cohesion, targetForce, edgeForce, target };
  }

  flock(allies, enemies, mothership, enemyMothership, planets, world, tick, time) {
    const forces = this.calculateForces(allies, enemies, mothership, enemyMothership, planets, world, time);
    const modifiers = mothership.getDroneModifiers();
    this.radius = this.baseRadius * modifiers.size;
    const maxSpeed = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.drone.maxSpeed * modifiers.speed;

    this.vel
      .add(forces.separation.scale(tick))
      .add(forces.alignment.scale(tick))
      .add(forces.cohesion.scale(tick))
      .add(forces.targetForce.scale(tick))
      .add(forces.edgeForce.scale(tick))
      .limit(maxSpeed);

    this.update(tick);
    this.tryAttack(forces.target, modifiers, mothership);
  }

  tryAttack(target, modifiers, mothership) {
    this.attackCooldown = Math.max(0, this.attackCooldown - 1);
    if (!target || this.attackCooldown > 0) return;

    const attackRange = this.radius + target.radius + 10;
    if (this.pos.distanceTo(target.pos) > attackRange) return;

    this.attackCooldown = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.drone.attackCooldown;
    const damageScale = modifiers.damage;
    const impactEffect = mothership?.onDroneImpact;

    if (target.kind === 'mothership') {
      target.takeDamage(_config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.drone.shipDamage * damageScale);
      impactEffect?.(this, target);
      return;
    }

    if (target.kind === 'planet') {
      target.takeDamage(_config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.drone.planetDamage * damageScale, this.team);
      impactEffect?.(this, target);
      return;
    }

    target.takeDamage(_config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.drone.attackDamage * damageScale);
    impactEffect?.(this, target);
  }

  update(tick) {
    this.pos.add(this.vel.clone().scale(tick));
    this.heading = this.vel.length() > 0.01 ? this.vel.angle() : this.heading;
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
  }

  draw(ctx) {
    const { primary, secondary, glow } = this.color;

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.heading);

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.moveTo(-this.radius * 1.1, 0);
    ctx.lineTo(-this.radius * 2.3, 0);
    ctx.lineTo(-this.radius * 1.8, this.radius * 0.7);
    ctx.lineTo(-this.radius * 1.4, 0);
    ctx.lineTo(-this.radius * 1.8, -this.radius * 0.7);
    ctx.closePath();
    ctx.fill();

    const bodyGradient = ctx.createLinearGradient(-this.radius, -this.radius, this.radius, this.radius);
    bodyGradient.addColorStop(0, primary);
    bodyGradient.addColorStop(1, secondary);
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(this.radius * 1.45, 0);
    ctx.lineTo(-this.radius * 0.7, this.radius * 0.82);
    ctx.lineTo(-this.radius * 0.5, 0);
    ctx.lineTo(-this.radius * 0.7, -this.radius * 0.82);
    ctx.closePath();
    ctx.fill();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.86)';
    ctx.stroke();
    ctx.restore();
  }
}


/***/ },

/***/ "./js/entities/item.js"
/*!*****************************!*\
  !*** ./js/entities/item.js ***!
  \*****************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Item: () => (/* binding */ Item)
/* harmony export */ });
/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config.js */ "./js/config.js");
/* harmony import */ var _item_icons_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../item-icons.js */ "./js/item-icons.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils.js */ "./js/utils.js");




class Item {
  constructor(x, y, type = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.pick)(_config_js__WEBPACK_IMPORTED_MODULE_0__.ITEM_TYPES)) {
    this.pos = new _utils_js__WEBPACK_IMPORTED_MODULE_2__.Vector2(x, y);
    this.radius = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.item.radius;
    this.type = type;
    this.pulse = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0, Math.PI * 2);
  }

  static random(x, y) {
    return new Item(x, y, (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.pick)(_config_js__WEBPACK_IMPORTED_MODULE_0__.ITEM_TYPES));
  }

  update(tick) {
    this.pulse += 0.05 * tick;
  }

  applyEffect(mothership, game) {
    switch (this.type.id) {
      case 'ship-speed':
        mothership.applyBuff('shipSpeed', { multiplier: 1.5, duration: this.type.duration });
        break;
      case 'production':
        mothership.applyBuff('production', { multiplier: 2, duration: this.type.duration });
        break;
      case 'drone-size':
        mothership.applyBuff('droneSize', { multiplier: 1.8, duration: this.type.duration });
        break;
      case 'drone-speed':
        mothership.applyBuff('droneSpeed', { multiplier: 1.5, duration: this.type.duration });
        break;
      case 'drone-attack':
        mothership.applyBuff('droneDamage', { multiplier: 2, duration: this.type.duration });
        break;
      case 'neutralize':
        game.neutralizeRandomEnemyPlanet(mothership.team);
        break;
      case 'autocapture':
        mothership.applyBuff('autocapture', { multiplier: 1, duration: this.type.duration });
        game.queueAutocapture(mothership.team, this.type.duration);
        break;
      default:
        break;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    const size = this.radius + Math.sin(this.pulse) * 2;
    const glow = size + 12;

    ctx.fillStyle = `${this.type.accent}24`;
    ctx.beginPath();
    ctx.arc(0, 0, glow, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `${this.type.accent}aa`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, size + 4, 0, Math.PI * 2);
    ctx.stroke();

    const plateGradient = ctx.createLinearGradient(-size, -size, size, size);
    plateGradient.addColorStop(0, '#102131');
    plateGradient.addColorStop(1, '#07111a');
    ctx.fillStyle = plateGradient;
    ctx.beginPath();
    ctx.roundRect(-size, -size, size * 2, size * 2, 12);
    ctx.fill();

    ctx.strokeStyle = `${this.type.accent}88`;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(-size + 3, -size + 3, size * 2 - 6, size * 0.8, 9);
    ctx.fill();

    (0,_item_icons_js__WEBPACK_IMPORTED_MODULE_1__.drawItemIcon)(ctx, this.type, size * 1.1);
    ctx.restore();
  }
}


/***/ },

/***/ "./js/entities/mothership.js"
/*!***********************************!*\
  !*** ./js/entities/mothership.js ***!
  \***********************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Mothership: () => (/* binding */ Mothership)
/* harmony export */ });
/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config.js */ "./js/config.js");
/* harmony import */ var _assets_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../assets.js */ "./js/assets.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils.js */ "./js/utils.js");




function normalizeAngle(angle) {
  let wrapped = angle;
  while (wrapped > Math.PI) wrapped -= Math.PI * 2;
  while (wrapped < -Math.PI) wrapped += Math.PI * 2;
  return wrapped;
}

class Mothership {
  constructor(team, x, y) {
    this.kind = 'mothership';
    this.team = team;
    this.color = _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[team];
    this.pos = new _utils_js__WEBPACK_IMPORTED_MODULE_2__.Vector2(x, y);
    this.vel = new _utils_js__WEBPACK_IMPORTED_MODULE_2__.Vector2();
    this.radius = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.radius;
    this.maxHealth = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.health;
    this.health = this.maxHealth;
    this.acceleration = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.acceleration;
    this.maxSpeed = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.maxSpeed;
    this.friction = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.friction;
    this.boostMultiplier = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.boostMultiplier ?? 1.7;
    this.boostTransition = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.boostTransition ?? 0.16;
    this.boostBlend = 0;
    this.spawnAccumulator = 0;
    this.auraRotationA = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0, Math.PI * 2);
    this.auraRotationB = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0, Math.PI * 2);
    this.angle = team === 'blue' ? 0 : Math.PI;
    this.turnSpeed = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.turnSpeed ?? 0.16;
    this.turnAcceleration = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.turnAcceleration ?? 0.03;
    this.turnDrag = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.turnDrag ?? 0.84;
    this.angularVelocity = 0;
    this.thrusterPulse = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0, Math.PI * 2);
    this.buffs = new Map();
    this.onDroneImpact = null;
  }

  update(input, boosting, tick, world) {
    this.updateBuffs(tick);
    const boostEase = 1 - Math.pow(1 - this.boostTransition, tick);
    this.boostBlend += ((boosting ? 1 : 0) - this.boostBlend) * boostEase;
    this.boostBlend = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.clamp)(this.boostBlend, 0, 1);
    const driveMultiplier = this.getShipSpeedMultiplier() * (1 + this.boostBlend * (this.boostMultiplier - 1));

    if (input.length() > 0.01) {
      const thrust = input.clone().normalize().scale(this.acceleration * driveMultiplier * tick);
      this.vel.add(thrust);
      const targetAngle = Math.atan2(input.y, input.x);
      const angleDelta = normalizeAngle(targetAngle - this.angle);
      const turnBoost = driveMultiplier;
      const steerForce = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.clamp)(angleDelta * this.turnAcceleration * turnBoost, -this.turnAcceleration * 2.2, this.turnAcceleration * 2.2);
      this.angularVelocity += steerForce * tick;
      const maxTurn = this.turnSpeed * turnBoost;
      this.angularVelocity = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.clamp)(this.angularVelocity, -maxTurn, maxTurn);
    }

    this.angle += this.angularVelocity * tick;
    this.angularVelocity *= Math.pow(this.turnDrag, tick);
    this.angle = normalizeAngle(this.angle);

    this.vel.scale(Math.pow(this.friction, tick));
    this.vel.limit(this.maxSpeed * driveMultiplier);
    this.pos.add(this.vel.clone().scale(tick));

    this.pos.x = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.clamp)(this.pos.x, this.radius, world.width - this.radius);
    this.pos.y = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.clamp)(this.pos.y, this.radius, world.height - this.radius);

    this.spawnAccumulator += tick;
    this.auraRotationA += 0.015 * tick;
    this.auraRotationB -= 0.011 * tick;
    this.thrusterPulse += 0.18 * tick;

    let ready = 0;
    const actualRate = this.getActualSpawnRate();
    while (this.spawnAccumulator >= actualRate) {
      this.spawnAccumulator -= actualRate;
      ready += 1;
      if (ready >= 4) {
        break;
      }
    }

    return ready;
  }

  getSpawnPosition() {
    const offset = _utils_js__WEBPACK_IMPORTED_MODULE_2__.Vector2.fromAngle(this.angle + (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(-0.8, 0.8), this.radius + (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(8, 20));
    return this.pos.clone().add(offset);
  }

  getSpawnRate() {
    return _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.spawnRate;
  }

  getActualSpawnRate() {
    return this.getSpawnRate() / this.getBuffMultiplier('production', 1);
  }

  applyBuff(type, data) {
    this.buffs.set(type, {
      type,
      ...data,
      remaining: data.duration * 60,
      total: data.duration * 60,
      label: _config_js__WEBPACK_IMPORTED_MODULE_0__.BUFF_LABELS[type] || type,
    });
  }

  updateBuffs(tick) {
    for (const [key, buff] of this.buffs.entries()) {
      buff.remaining -= tick;
      if (buff.remaining <= 0) {
        this.buffs.delete(key);
      }
    }
  }

  getBuffMultiplier(type, fallback = 1) {
    return this.buffs.get(type)?.multiplier ?? fallback;
  }

  getShipSpeedMultiplier() {
    return this.getBuffMultiplier('shipSpeed', 1);
  }

  getDroneModifiers() {
    return {
      size: this.getBuffMultiplier('droneSize', 1),
      speed: this.getBuffMultiplier('droneSpeed', 1),
      damage: this.getBuffMultiplier('droneDamage', 1),
    };
  }

  getActiveBuffs() {
    return [...this.buffs.values()].map((buff) => ({
      type: buff.type,
      label: buff.label,
      remaining: buff.remaining,
      total: buff.total,
    }));
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
  }

  draw(ctx) {
    const { glow } = this.color;
    const shipTexture = (0,_assets_js__WEBPACK_IMPORTED_MODULE_1__.getShipTexture)(this.team);

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.angle);

    const speed = this.vel.length();
    if (speed > 0.18 || this.boostBlend > 0.05) {
      const boostFlare = this.boostBlend * 32;
      const flameLength = 26 + speed * 5.8 + Math.sin(this.thrusterPulse) * (5.2 + this.boostBlend * 5.8) + boostFlare;
      const flameWidth = 11 + this.boostBlend * 8.5;
      ctx.fillStyle = `rgba(255, 214, 132, ${0.82 + this.boostBlend * 0.18})`;
      ctx.beginPath();
      ctx.moveTo(-this.radius + 3, 0);
      ctx.lineTo(-this.radius - flameLength * (0.94 + this.boostBlend * 0.08), flameWidth * 1.28);
      ctx.lineTo(-this.radius - 11, 0);
      ctx.lineTo(-this.radius - flameLength * (0.94 + this.boostBlend * 0.08), -flameWidth * 1.28);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = `rgba(255, 120, 72, ${0.18 + this.boostBlend * 0.24})`;
      ctx.beginPath();
      ctx.moveTo(-this.radius + 2, 0);
      ctx.lineTo(-this.radius - flameLength, flameWidth);
      ctx.lineTo(-this.radius - 6, 0);
      ctx.lineTo(-this.radius - flameLength, -flameWidth);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = `rgba(255, 248, 230, ${0.74 + this.boostBlend * 0.2})`;
      ctx.beginPath();
      ctx.moveTo(-this.radius + 1, 0);
      ctx.lineTo(-this.radius - flameLength * 0.72, 5.4 + this.boostBlend * 3.8);
      ctx.lineTo(-this.radius - 7, 0);
      ctx.lineTo(-this.radius - flameLength * 0.72, -5.4 - this.boostBlend * 3.8);
      ctx.closePath();
      ctx.fill();

      if (this.boostBlend > 0.12) {
        ctx.fillStyle = `rgba(123, 223, 255, ${0.28 + this.boostBlend * 0.34})`;
        ctx.beginPath();
        ctx.moveTo(-this.radius - 8, 0);
        ctx.lineTo(-this.radius - flameLength * 0.52, 3.2 + this.boostBlend * 2.8);
        ctx.lineTo(-this.radius - flameLength * 1.02, 0);
        ctx.lineTo(-this.radius - flameLength * 0.52, -3.2 - this.boostBlend * 2.8);
        ctx.closePath();
        ctx.fill();
      }
    }

    if (shipTexture) {
      const shipWidth = this.radius * 2.5;
      const shipHeight = this.radius * 1.7;

      ctx.save();
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(shipTexture, -shipWidth * 0.5, -shipHeight * 0.5, shipWidth, shipHeight);
      ctx.restore();

      ctx.strokeStyle = glow;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 2, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(235, 242, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.moveTo(this.radius - 2, 0);
      ctx.lineTo(-8, -14);
      ctx.lineTo(-2, 0);
      ctx.lineTo(-8, 14);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 10, this.auraRotationA, this.auraRotationA + Math.PI * 1.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 17, this.auraRotationB, this.auraRotationB + Math.PI * 1.45);
    ctx.stroke();

    let offset = -0.8;
    for (const buff of this.getActiveBuffs()) {
      const progress = buff.remaining / buff.total;
      ctx.strokeStyle = 'rgba(255, 213, 116, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 24 + offset * 2, offset, offset + Math.PI * 0.9 * progress);
      ctx.stroke();
      offset += 0.72;
    }
    ctx.restore();
  }
}


/***/ },

/***/ "./js/entities/planet.js"
/*!*******************************!*\
  !*** ./js/entities/planet.js ***!
  \*******************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Planet: () => (/* binding */ Planet)
/* harmony export */ });
/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config.js */ "./js/config.js");
/* harmony import */ var _assets_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../assets.js */ "./js/assets.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils.js */ "./js/utils.js");




class Planet {
  constructor(x, y, radius = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.planet.radius) {
    this.kind = 'planet';
    this.pos = new _utils_js__WEBPACK_IMPORTED_MODULE_2__.Vector2(x, y);
    this.radius = radius;
    this.maxHealth = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.planet.health;
    this.health = this.maxHealth;
    this.owner = null;
    this.pulse = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0, Math.PI * 2);
    this.ringAngle = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0, Math.PI * 2);
    this.ringTilt = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0.22, 0.42);
    this.ringTiltPhase = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0, Math.PI * 2);
    this.ringOffset = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(-4, 4);
    this.recoverCooldown = 0;
    this.spawnAccumulator = (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0, _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.planet.supportSpawnRate);
    this.impactHeat = 0;
    this.onDamaged = null;
    this.onShattered = null;
    this.onCaptured = null;
    this.pendingOwner = null;
    this.rebuildTimer = 0;
    this.rebuildDuration = 68;
    this.revealTimer = 0;
    this.revealDuration = 18;
    this.texturePhase = 'base';
    this.fragments = Array.from({ length: 28 }, (_, index) => ({
      angle: (Math.PI * 2 * index) / 28 + (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(-0.22, 0.22),
      orbit: (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(this.radius * 1.35, this.radius * 2.35),
      size: (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(1.8, 5.5),
      drift: (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(-12, 12),
      phase: (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0, Math.PI * 2),
      swirl: (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0.55, 1.35),
      inwardOffset: (0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.rand)(0.15, 0.95),
    }));
  }

  update(tick) {
    this.pulse += 0.02 * tick;
    this.ringAngle += 0.0045 * tick;
    this.ringTiltPhase += 0.011 * tick;
    this.recoverCooldown = Math.max(0, this.recoverCooldown - tick);
    this.impactHeat = Math.max(0, this.impactHeat - 0.18 * tick);

    if (this.rebuildTimer > 0) {
      this.rebuildTimer = Math.max(0, this.rebuildTimer - tick);
      if (this.rebuildTimer <= 0 && this.pendingOwner) {
        this.completeCapture();
      }
      return 0;
    }

    if (this.revealTimer > 0) {
      this.revealTimer = Math.max(0, this.revealTimer - tick);
    }

    if (this.recoverCooldown <= 0) {
      this.health = Math.min(this.maxHealth, this.health + _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.planet.recoverPerFrame * tick);
    }

    if (!this.owner || this.health / this.maxHealth <= _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.planet.supportThreshold) {
      return 0;
    }

    this.spawnAccumulator += tick;
    let ready = 0;
    while (this.spawnAccumulator >= _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.planet.supportSpawnRate) {
      this.spawnAccumulator -= _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.planet.supportSpawnRate;
      ready += 1;
    }
    return ready;
  }

  takeDamage(amount, team) {
    if (this.rebuildTimer > 0) return;
    this.health -= amount;
    this.recoverCooldown = _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.planet.recoverDelay;
    this.impactHeat = Math.min(8, this.impactHeat + 1);
    this.onDamaged?.(this, team, {
      amount,
      impactHeat: this.impactHeat,
      willCapture: this.health <= 0,
    });
    if (this.health <= 0) {
      this.shatter(team);
    }
  }

  shatter(team) {
    const previousOwner = this.owner;
    this.owner = null;
    this.pendingOwner = team;
    this.health = 0;
    this.spawnAccumulator = 0;
    this.rebuildTimer = this.rebuildDuration;
    this.revealTimer = 0;
    this.onShattered?.(this, team, previousOwner);
  }

  completeCapture() {
    const team = this.pendingOwner;
    const previousOwner = this.owner;
    this.pendingOwner = null;
    this.owner = team;
    this.texturePhase = team === 'blue' ? 'rebuiltBlue' : team === 'red' ? 'rebuiltRed' : 'base';
    this.revealTimer = this.revealDuration;
    this.health = this.maxHealth * _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.planet.captureRestore;
    this.spawnAccumulator = 120;
    this.onCaptured?.(this, team, previousOwner);
  }

  shouldSupport(target) {
    return Boolean(this.owner && target && target.team === this.owner);
  }

  setNeutral() {
    this.owner = null;
    this.pendingOwner = null;
    this.health = this.maxHealth * 0.45;
    this.spawnAccumulator = 0;
    this.rebuildTimer = 0;
  }

  getDisplayPalette() {
    if (this.pendingOwner) return _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[this.pendingOwner];
    return this.owner ? _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[this.owner] : _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS.neutral;
  }

  getRebuildProgress() {
    if (this.rebuildTimer <= 0) return 1;
    return 1 - this.rebuildTimer / this.rebuildDuration;
  }

  getRevealProgress() {
    if (this.revealTimer <= 0) return 1;
    return 1 - this.revealTimer / this.revealDuration;
  }

  draw(ctx) {
    const palette = this.getDisplayPalette();
    const texture = (0,_assets_js__WEBPACK_IMPORTED_MODULE_1__.getPlanetTexture)(this.texturePhase);
    const glowRadius = this.radius + 20 + Math.sin(this.pulse) * 4;
    const ringRadiusX = this.radius + 22;
    const ringTiltWave = 0.2 + Math.abs(Math.sin(this.ringTiltPhase)) * 0.34;
    const ringRadiusY = ringRadiusX * (this.ringTilt * 0.45 + ringTiltWave * 0.55);
    const ringDrift = Math.sin(this.pulse * 0.8) * 1.8 + Math.cos(this.ringTiltPhase * 0.9) * 1.6;
    const ringShear = Math.sin(this.ringTiltPhase) * 0.08;
    const ringGlow = `${palette.primary}66`;
    const ringCore = `${palette.primary}dd`;
    const ringEdge = `${palette.secondary}7a`;
    const rebuildProgress = this.getRebuildProgress();
    const revealProgress = this.getRevealProgress();
    const isRebuilding = this.rebuildTimer > 0;

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);

    const drawRingBand = (isFront) => {
      ctx.save();
      ctx.rotate(this.ringAngle);
      ctx.transform(1, 0, ringShear, 1, 0, this.ringOffset + ringDrift);
      ctx.beginPath();
      ctx.rect(-ringRadiusX - 30, isFront ? 0 : -ringRadiusX, ringRadiusX * 2 + 60, ringRadiusX);
      ctx.clip();

      const ringGradient = ctx.createLinearGradient(-ringRadiusX, 0, ringRadiusX, 0);
      ringGradient.addColorStop(0, isFront ? ringEdge : `${palette.secondary}36`);
      ringGradient.addColorStop(0.5, isFront ? ringCore : ringGlow);
      ringGradient.addColorStop(1, isFront ? ringEdge : `${palette.secondary}36`);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadiusX + 2, ringRadiusY + 1.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = ringGradient;
      ctx.lineWidth = isFront ? 7 : 6;
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadiusX, ringRadiusY, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = isFront ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadiusX + 5, ringRadiusY + 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    if (!isRebuilding || rebuildProgress > 0.28) {
      drawRingBand(false);
    }

    ctx.fillStyle = palette.glow;
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    if (!isRebuilding) {
      ctx.fill();
    } else {
      ctx.globalAlpha = 0.1 + rebuildProgress * 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    const gradient = ctx.createRadialGradient(-12, -12, 8, 0, 0, this.radius);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.14, palette.primary);
    gradient.addColorStop(1, palette.secondary);
    ctx.fillStyle = gradient;
    if (isRebuilding) {
      const spreadPhase = Math.min(1, rebuildProgress / 0.42);
      const gatherPhase = rebuildProgress < 0.42 ? 0 : (rebuildProgress - 0.42) / 0.58;
      const coreRadius = this.radius * Math.max(0, (gatherPhase - 0.28) / 0.72);

      ctx.globalAlpha = 0.08 + gatherPhase * 0.55;
      ctx.beginPath();
      ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      for (const fragment of this.fragments) {
        const reactionBurst = 0.45 + Math.sin(spreadPhase * Math.PI) * 1.1;
        const gatherPull = 1 - gatherPhase;
        const radius = fragment.orbit * (gatherPhase > 0 ? gatherPull * (0.45 + fragment.inwardOffset) : reactionBurst);
        const angle = fragment.angle
          + this.ringAngle * fragment.swirl
          + spreadPhase * (1.8 + fragment.swirl)
          - gatherPhase * (0.9 + fragment.swirl * 0.4);
        const wobble = Math.sin(this.pulse * 1.3 + fragment.phase + rebuildProgress * 10) * (6 + fragment.drift * 0.3);
        const x = Math.cos(angle) * radius + Math.cos(fragment.phase + rebuildProgress * 8) * wobble * 0.22;
        const y = Math.sin(angle) * radius * 0.72 + fragment.drift * (gatherPhase > 0 ? gatherPull : 1) + wobble * 0.16;
        const particleSize = fragment.size * (gatherPhase > 0 ? 0.65 + gatherPhase * 0.75 : 0.85 + Math.sin(spreadPhase * Math.PI) * 0.2);

        const fragmentGradient = ctx.createRadialGradient(x - particleSize * 0.3, y - particleSize * 0.3, 0, x, y, particleSize * 1.8);
        fragmentGradient.addColorStop(0, '#ffffff');
        fragmentGradient.addColorStop(0.32, palette.primary);
        fragmentGradient.addColorStop(1, `${palette.secondary}00`);
        ctx.fillStyle = fragmentGradient;
        ctx.globalAlpha = 0.2 + Math.sin(rebuildProgress * Math.PI) * 0.25 + gatherPhase * 0.45;
        ctx.beginPath();
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 0.14 + gatherPhase * 0.36;
      ctx.strokeStyle = palette.primary;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * (0.22 + gatherPhase * 0.5), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else {
      if (texture) {
        const revealScale = 0.92 + revealProgress * 0.08;

        ctx.save();
        ctx.globalAlpha = revealProgress;
        ctx.scale(revealScale, revealScale);
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(texture, -this.radius, -this.radius, this.radius * 2, this.radius * 2);

        // Keep the new planet art, but lightly tint it so team ownership still reads quickly.
        const tintGradient = ctx.createLinearGradient(-this.radius, -this.radius, this.radius, this.radius);
        tintGradient.addColorStop(0, `${palette.primary}18`);
        tintGradient.addColorStop(0.55, 'rgba(255, 255, 255, 0.04)');
        tintGradient.addColorStop(1, `${palette.secondary}3a`);
        ctx.fillStyle = tintGradient;
        ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);

        const shadowGradient = ctx.createRadialGradient(this.radius * 0.15, this.radius * 0.2, this.radius * 0.1, 0, 0, this.radius * 1.15);
        shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        shadowGradient.addColorStop(1, 'rgba(3, 10, 20, 0.26)');
        ctx.fillStyle = shadowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (revealProgress < 1) {
          ctx.save();
          ctx.globalAlpha = (1 - revealProgress) * 0.35;
          ctx.strokeStyle = palette.primary;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(0, 0, this.radius * (0.88 + revealProgress * 0.2), 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 3;
    if (this.rebuildTimer <= 0) {
      ctx.stroke();
    }

    if (!isRebuilding || rebuildProgress > 0.62) {
      drawRingBand(true);
    }

    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 2);
    if (this.rebuildTimer <= 0) {
      ctx.stroke();
    }

    ctx.strokeStyle = palette.primary;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (this.health / this.maxHealth));
    if (this.rebuildTimer <= 0) {
      ctx.stroke();
    }
    ctx.restore();
  }
}


/***/ },

/***/ "./js/game.js"
/*!********************!*\
  !*** ./js/game.js ***!
  \********************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Game: () => (/* binding */ Game)
/* harmony export */ });
/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config.js */ "./js/config.js");
/* harmony import */ var _camera_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./camera.js */ "./js/camera.js");
/* harmony import */ var _collision_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./collision.js */ "./js/collision.js");
/* harmony import */ var _controls_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./controls.js */ "./js/controls.js");
/* harmony import */ var _entities_drone_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./entities/drone.js */ "./js/entities/drone.js");
/* harmony import */ var _entities_item_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./entities/item.js */ "./js/entities/item.js");
/* harmony import */ var _entities_mothership_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./entities/mothership.js */ "./js/entities/mothership.js");
/* harmony import */ var _entities_planet_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./entities/planet.js */ "./js/entities/planet.js");
/* harmony import */ var _ui_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./ui.js */ "./js/ui.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./utils.js */ "./js/utils.js");











class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ui = new _ui_js__WEBPACK_IMPORTED_MODULE_8__.UI();
    this.controls = new _controls_js__WEBPACK_IMPORTED_MODULE_3__.Controls(canvas);
    this.camera = new _camera_js__WEBPACK_IMPORTED_MODULE_1__.Camera();
    this.state = 'start';
    this.lastTime = performance.now();
    this.time = 0;
    this.stars = this.createStars();
    this.delayedEffects = [];
    this.particles = [];

    this.ui.bindCallbacks({
      onStart: () => this.beginMatch(),
      onRestart: () => this.restartMatch(),
      onHome: () => this.returnToHome(),
    });

    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.setupMatch();
  }

  createStars() {
    return Array.from({ length: _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.stars }, () => ({
      x: (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(0, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width),
      y: (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(0, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height),
      size: (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(1, 3.2),
      depth: (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(0.3, 1),
      alpha: (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(0.35, 0.95),
      drift: (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(0.4, 1.3),
    }));
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
    this.canvas.width = Math.round(this.viewportWidth * dpr);
    this.canvas.height = Math.round(this.viewportHeight * dpr);
    this.canvas.style.width = `${this.viewportWidth}px`;
    this.canvas.style.height = `${this.viewportHeight}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = true;
  }

  setupMatch() {
    this.blue = new _entities_mothership_js__WEBPACK_IMPORTED_MODULE_6__.Mothership('blue', 300, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height * 0.5);
    this.red = new _entities_mothership_js__WEBPACK_IMPORTED_MODULE_6__.Mothership('red', _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width - 300, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height * 0.5);
    this.drones = [];
    this.items = [];
    this.particles = [];
    this.delayedEffects = [];
    this.itemAccumulator = 0;

    this.planets = [];
    while (this.planets.length < _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.planets) {
      const pos = new _utils_js__WEBPACK_IMPORTED_MODULE_9__.Vector2((0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(360, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width - 360), (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(260, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height - 260));
      if ((0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.distance)(pos, this.blue.pos) < 240 || (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.distance)(pos, this.red.pos) < 240) continue;
      if (this.planets.some((planet) => (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.distance)(pos, planet.pos) < 210)) continue;
      this.planets.push(new _entities_planet_js__WEBPACK_IMPORTED_MODULE_7__.Planet(pos.x, pos.y));
    }

    for (const planet of this.planets) {
      planet.onDamaged = (damagedPlanet, team, info) => {
        if (info.willCapture) return;
        const strength = (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.clamp)((info.impactHeat - 1.6) * 0.85, 0.28, 3.2);
        const duration = (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.clamp)(2.2 + (info.impactHeat - 1) * 0.5, 2.2, 5.4);
        this.camera.shake(strength, duration);
      };
      planet.onShattered = (capturedPlanet, team) => {
        this.spawnBurst(capturedPlanet.pos.x, capturedPlanet.pos.y, _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[team].primary, 42, 3.2);
        this.spawnShockwave(capturedPlanet.pos.x, capturedPlanet.pos.y, _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[team].primary, capturedPlanet.radius * 0.55, 2);
        this.camera.shake(30, 15);
      };
      planet.onCaptured = (capturedPlanet, team) => {
        this.spawnBurst(capturedPlanet.pos.x, capturedPlanet.pos.y, _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[team].primary, 18, 1.35);
        this.spawnShockwave(capturedPlanet.pos.x, capturedPlanet.pos.y, _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[team].primary, capturedPlanet.radius * 0.28, 0.9);
      };
    }

    this.camera.position.set(_config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width * 0.5, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height * 0.5);
    this.camera.zoom = 0.9;
    this.controls.reset();
  }

  beginMatch() {
    this.setupMatch();
    this.state = 'playing';
    this.ui.showPlaying();
  }

  restartMatch() {
    this.beginMatch();
  }

  returnToHome() {
    this.setupMatch();
    this.state = 'start';
    this.ui.showStart();
  }

  queueAutocapture(team, seconds) {
    this.delayedEffects.push({ type: 'autocapture', team, remaining: seconds * 60 });
  }

  neutralizeRandomEnemyPlanet(team) {
    const candidates = this.planets.filter((planet) => planet.owner && planet.owner !== team);
    if (!candidates.length) return;
    (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.pick)(candidates).setNeutral();
  }

  autoCaptureNearestPlanet(team) {
    const mothership = team === 'blue' ? this.blue : this.red;
    const candidates = this.planets.filter((planet) => planet.owner !== team);
    if (!candidates.length) return;
    candidates.sort((a, b) => (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.distance)(a.pos, mothership.pos) - (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.distance)(b.pos, mothership.pos));
    candidates[0].shatter(team);
    this.spawnBurst(candidates[0].pos.x, candidates[0].pos.y, _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[team].primary, 20);
  }

  getDroneCount(team) {
    return this.drones.filter((drone) => drone.team === team).length;
  }

  getPlanetCount(team) {
    return this.planets.filter((planet) => planet.owner === team).length;
  }

  getDroneCap(team) {
    return _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.mothership.baseCap + this.getPlanetCount(team) * 10;
  }

  spawnDrone(team, source) {
    const spawnPos = source.getSpawnPosition
      ? source.getSpawnPosition()
      : source.pos.clone().add(_utils_js__WEBPACK_IMPORTED_MODULE_9__.Vector2.fromAngle((0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(0, Math.PI * 2), source.radius + 14));
    this.drones.push(new _entities_drone_js__WEBPACK_IMPORTED_MODULE_4__.Drone(team, spawnPos.x, spawnPos.y));
    this.spawnBurst(spawnPos.x, spawnPos.y, _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[team].primary, 6, 1.2);
  }

  spawnItems(tick) {
    this.itemAccumulator += tick;
    if (this.itemAccumulator < _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.item.spawnRate || this.items.length >= _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.item.maxActive) return;
    this.itemAccumulator = 0;
    this.items.push(_entities_item_js__WEBPACK_IMPORTED_MODULE_5__.Item.random((0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(220, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width - 220), (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(220, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height - 220)));
  }

  spawnBurst(x, y, color, count, scale = 1) {
    for (let i = 0; i < count; i += 1) {
      this.particles.push({
        type: 'spark',
        x,
        y,
        vx: Math.cos((Math.PI * 2 * i) / count + (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(-0.4, 0.4)) * (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(0.4, 2.8) * scale,
        vy: Math.sin((Math.PI * 2 * i) / count + (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(-0.4, 0.4)) * (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(0.4, 2.8) * scale,
        life: (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(18, 42),
        maxLife: 42,
        size: (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(1.5, 4.5) * scale,
        color,
        drag: (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(0.9, 0.95),
      });
    }
  }

  spawnShockwave(x, y, color, radius = 14, scale = 1) {
    this.particles.push({
      type: 'ring',
      x,
      y,
      vx: 0,
      vy: 0,
      life: 20 * scale,
      maxLife: 20 * scale,
      size: radius,
      color,
      growth: 5.5 * scale,
      lineWidth: 3.5 * scale,
    });
  }

  spawnShipTrail(ship, tick) {
    const speed = ship.vel.length();
    if (speed < 0.24) return;

    const exhaustDirection = _utils_js__WEBPACK_IMPORTED_MODULE_9__.Vector2.fromAngle(ship.angle + Math.PI, 1);
    const sideDirection = _utils_js__WEBPACK_IMPORTED_MODULE_9__.Vector2.fromAngle(ship.angle + Math.PI * 0.5, 1);
    const boostIntensity = ship.boostBlend ?? 0;
    const intensity = (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.clamp)(speed / (ship.maxSpeed * ship.getShipSpeedMultiplier()), 0.28, 1) * (1 + boostIntensity * 0.55);
    const burstCount = Math.max(1, Math.round((1.6 + intensity * 2.6 + boostIntensity * 3.4) * tick));

    for (let i = 0; i < burstCount; i += 1) {
      const sideOffset = (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(-ship.radius * (0.22 + boostIntensity * 0.12), ship.radius * (0.22 + boostIntensity * 0.12));
      const spawnX = ship.pos.x + exhaustDirection.x * (ship.radius - 4) + sideDirection.x * sideOffset;
      const spawnY = ship.pos.y + exhaustDirection.y * (ship.radius - 4) + sideDirection.y * sideOffset;
      const drift = (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(-0.55, 0.55);

      this.particles.push({
        type: 'spark',
        x: spawnX,
        y: spawnY,
        vx: exhaustDirection.x * (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(1.8, 3.8 + boostIntensity * 1.8) - ship.vel.x * (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(0.18, 0.38) + sideDirection.x * drift,
        vy: exhaustDirection.y * (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(1.8, 3.8 + boostIntensity * 1.8) - ship.vel.y * (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(0.18, 0.38) + sideDirection.y * drift,
        life: (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(12, 22 + boostIntensity * 7),
        maxLife: 24,
        size: (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(2.1, 4.8) * (0.88 + intensity * 0.92 + boostIntensity * 0.5),
        color: i % 3 === 0 ? 'rgba(255, 248, 230, 0.98)' : i % 2 === 0 ? 'rgba(255, 177, 112, 0.92)' : ship.color.primary,
        drag: (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(0.88, 0.94),
      });
    }

    if (speed > ship.maxSpeed * 0.62 || boostIntensity > 0.35) {
      const slipSide = Math.sign(ship.vel.x * sideDirection.x + ship.vel.y * sideDirection.y) || 1;
      this.particles.push({
        type: 'spark',
        x: ship.pos.x - exhaustDirection.x * (ship.radius * 0.3) + sideDirection.x * ship.radius * slipSide * 0.85,
        y: ship.pos.y - exhaustDirection.y * (ship.radius * 0.3) + sideDirection.y * ship.radius * slipSide * 0.85,
        vx: -ship.vel.x * (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(0.16, 0.28) + sideDirection.x * slipSide * (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(0.6, 1.2 + boostIntensity * 0.6),
        vy: -ship.vel.y * (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(0.16, 0.28) + sideDirection.y * slipSide * (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(0.6, 1.2 + boostIntensity * 0.6),
        life: (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(10, 18),
        maxLife: 18,
        size: (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(1.8, 3.6),
        color: boostIntensity > 0.25 ? 'rgba(123, 223, 255, 0.88)' : 'rgba(255, 255, 255, 0.8)',
        drag: (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.rand)(0.86, 0.92),
      });
    }
  }

  updateParticles(tick) {
    this.particles = this.particles.filter((particle) => {
      particle.x += (particle.vx || 0) * tick;
      particle.y += (particle.vy || 0) * tick;
      if (particle.drag) {
        particle.vx *= Math.pow(particle.drag, tick);
        particle.vy *= Math.pow(particle.drag, tick);
      }
      if (particle.type === 'ring') {
        particle.size += particle.growth * tick;
      }
      particle.life -= tick;
      return particle.life > 0;
    });
  }

  updateStart(delta) {
    this.ui.updateDualHold(delta, () => this.beginMatch());
    this.planets.forEach((planet) => planet.update(1));
    this.camera.update(this.blue, this.red, this.viewportWidth, this.viewportHeight, 1);
  }

  fillDroneSpawns(team, ready, source) {
    for (let i = 0; i < ready; i += 1) {
      if (this.getDroneCount(team) >= this.getDroneCap(team)) return;
      this.spawnDrone(team, source);
    }
  }

  handleDroneCollisions(tick) {
    for (let i = 0; i < this.drones.length; i += 1) {
      for (let j = i + 1; j < this.drones.length; j += 1) {
        const a = this.drones[i];
        const b = this.drones[j];
        if (a.team === b.team || !(0,_collision_js__WEBPACK_IMPORTED_MODULE_2__.overlapsCircle)(a, b)) continue;
        (0,_collision_js__WEBPACK_IMPORTED_MODULE_2__.resolveCircleCollision)(a, b, 0.5);
        a.takeDamage(0.14 * tick);
        b.takeDamage(0.14 * tick);
      }
    }

    for (const drone of this.drones) {
      const enemyShip = drone.team === 'blue' ? this.red : this.blue;
      if ((0,_collision_js__WEBPACK_IMPORTED_MODULE_2__.overlapsCircle)(drone, enemyShip, 2)) {
        drone.takeDamage(0.5 * tick);
        enemyShip.takeDamage(0.22 * tick);
      }

      for (const planet of this.planets) {
        if (planet.owner === drone.team) continue;
        if (!(0,_collision_js__WEBPACK_IMPORTED_MODULE_2__.overlapsCircle)(drone, planet, 2)) continue;
        drone.takeDamage(0.16 * tick);
        planet.takeDamage(0.22 * tick, drone.team);
      }
    }
  }

  handleItems() {
    this.items = this.items.filter((item) => {
      const collector = (0,_collision_js__WEBPACK_IMPORTED_MODULE_2__.overlapsCircle)(item, this.blue) ? this.blue : (0,_collision_js__WEBPACK_IMPORTED_MODULE_2__.overlapsCircle)(item, this.red) ? this.red : null;
      if (!collector) return true;
      item.applyEffect(collector, this);
      this.spawnBurst(item.pos.x, item.pos.y, item.type.accent, 16, 1.6);
      return false;
    });
  }

  shatterDrone(drone, target = null) {
    if (!drone || drone.health <= 0) return;

    drone.destroyedByImpact = true;
    drone.health = 0;
    this.spawnBurst(drone.pos.x, drone.pos.y, _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[drone.team].primary, 24, 2.1);
    this.spawnShockwave(drone.pos.x, drone.pos.y, _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[drone.team].primary, 10, 0.9);

    if (!target?.pos) return;

    const impactColor = target.team ? _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[target.team].primary : target.owner ? _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[target.owner].primary : _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS.neutral.primary;
    if (target.kind === 'planet') {
      this.spawnBurst(target.pos.x, target.pos.y, impactColor, 34, 2.7);
      this.spawnShockwave(target.pos.x, target.pos.y, impactColor, target.radius * 0.35, 1.5);
    } else if (target.kind === 'mothership') {
      this.spawnBurst(target.pos.x, target.pos.y, impactColor, 22, 1.8);
      this.spawnShockwave(target.pos.x, target.pos.y, impactColor, target.radius * 0.3, 1.1);
    } else {
      this.spawnBurst(target.pos.x, target.pos.y, impactColor, 16, 1.2);
    }
  }

  handleDelayedEffects(tick) {
    this.delayedEffects = this.delayedEffects.filter((effect) => {
      effect.remaining -= tick;
      if (effect.remaining > 0) return true;
      if (effect.type === 'autocapture') this.autoCaptureNearestPlanet(effect.team);
      return false;
    });
  }

  removeDestroyed() {
    const alive = [];
    for (const drone of this.drones) {
      if (drone.health > 0) {
        alive.push(drone);
        continue;
      }
      if (!drone.destroyedByImpact) {
        this.spawnBurst(drone.pos.x, drone.pos.y, _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[drone.team].primary, 8);
      }
    }
    this.drones = alive;
  }

  updatePlaying(tick) {
    const blueInput = this.controls.getMoveVector('blue');
    const redInput = this.controls.getMoveVector('red');
    const blueBoost = this.controls.getBoostHeld('blue');
    const redBoost = this.controls.getBoostHeld('red');
    this.blue.onDroneImpact = (drone, target) => this.shatterDrone(drone, target);
    this.red.onDroneImpact = (drone, target) => this.shatterDrone(drone, target);

    const blueReady = this.blue.update(blueInput, blueBoost, tick, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD);
    const redReady = this.red.update(redInput, redBoost, tick, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD);
    this.spawnShipTrail(this.blue, tick);
    this.spawnShipTrail(this.red, tick);
    this.fillDroneSpawns('blue', blueReady, this.blue);
    this.fillDroneSpawns('red', redReady, this.red);

    for (const planet of this.planets) {
      const ready = planet.update(tick);
      if (planet.owner) this.fillDroneSpawns(planet.owner, ready, planet);
    }

    this.spawnItems(tick);
    this.items.forEach((item) => item.update(tick));

    const blueDrones = this.drones.filter((drone) => drone.team === 'blue');
    const redDrones = this.drones.filter((drone) => drone.team === 'red');

    for (const drone of this.drones) {
      if (drone.team === 'blue') {
        drone.flock(blueDrones, redDrones, this.blue, this.red, this.planets, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD, tick, this.time);
      } else {
        drone.flock(redDrones, blueDrones, this.red, this.blue, this.planets, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD, tick, this.time);
      }

      drone.pos.x = (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.clamp)(drone.pos.x, drone.radius, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width - drone.radius);
      drone.pos.y = (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.clamp)(drone.pos.y, drone.radius, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height - drone.radius);
    }

    this.handleDroneCollisions(tick);
    this.handleItems();
    this.handleDelayedEffects(tick);
    this.removeDestroyed();
    this.camera.update(this.blue, this.red, this.viewportWidth, this.viewportHeight, tick);
    this.updateParticles(tick);

    const winner = this.blue.health <= 0 ? 'red' : this.red.health <= 0 ? 'blue' : null;
    if (winner) {
      this.state = 'victory';
      this.ui.showVictory(winner);
      this.spawnBurst(
        winner === 'blue' ? this.red.pos.x : this.blue.pos.x,
        winner === 'blue' ? this.red.pos.y : this.blue.pos.y,
        _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[winner].primary,
        40,
        2.4,
      );
    }
  }

  buildSnapshot() {
    return {
      blue: {
        health: this.blue.health,
        maxHealth: this.blue.maxHealth,
        healthRatio: this.blue.health / this.blue.maxHealth,
        drones: this.getDroneCount('blue'),
        cap: this.getDroneCap('blue'),
        planets: this.getPlanetCount('blue'),
        buffs: this.blue.getActiveBuffs(),
      },
      red: {
        health: this.red.health,
        maxHealth: this.red.maxHealth,
        healthRatio: this.red.health / this.red.maxHealth,
        drones: this.getDroneCount('red'),
        cap: this.getDroneCap('red'),
        planets: this.getPlanetCount('red'),
        buffs: this.red.getActiveBuffs(),
      },
      stateKey: this.state === 'playing' ? 'battleLive' : this.state === 'victory' ? 'awaitingRestart' : 'standBy',
      neutralPlanets: this.planets.filter((planet) => !planet.owner).length,
      itemCap: _config_js__WEBPACK_IMPORTED_MODULE_0__.BALANCE.item.maxActive,
    };
  }

  renderBackground() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);

    const sky = ctx.createLinearGradient(0, 0, this.viewportWidth, this.viewportHeight);
    sky.addColorStop(0, '#010204');
    sky.addColorStop(0.52, '#07111a');
    sky.addColorStop(1, '#04070d');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);

    const blueGlow = this.camera.worldToScreen(this.blue.pos.x, this.blue.pos.y, { width: this.viewportWidth, height: this.viewportHeight });
    const redGlow = this.camera.worldToScreen(this.red.pos.x, this.red.pos.y, { width: this.viewportWidth, height: this.viewportHeight });

    const blueBloom = ctx.createRadialGradient(blueGlow.x, blueGlow.y, 0, blueGlow.x, blueGlow.y, this.viewportWidth * 0.24);
    blueBloom.addColorStop(0, 'rgba(79, 212, 255, 0.18)');
    blueBloom.addColorStop(1, 'rgba(79, 212, 255, 0)');
    ctx.fillStyle = blueBloom;
    ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);

    const redBloom = ctx.createRadialGradient(redGlow.x, redGlow.y, 0, redGlow.x, redGlow.y, this.viewportWidth * 0.24);
    redBloom.addColorStop(0, 'rgba(255, 138, 122, 0.18)');
    redBloom.addColorStop(1, 'rgba(255, 138, 122, 0)');
    ctx.fillStyle = redBloom;
    ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1.2;
    for (let i = -2; i < 7; i += 1) {
      const offset = ((this.time * 0.03) + i * 180) % (this.viewportWidth + 220) - 110;
      ctx.beginPath();
      ctx.moveTo(offset, -40);
      ctx.lineTo(offset + this.viewportWidth * 0.38, this.viewportHeight + 40);
      ctx.stroke();
    }

    const averageVelocity = this.blue.vel.clone().add(this.red.vel).scale(0.5);
    const starBoost = Math.min(1, (this.blue.vel.length() + this.red.vel.length()) / 5.5);
    const starDriftX = averageVelocity.x * (12 + starBoost * 22);
    const starDriftY = averageVelocity.y * (12 + starBoost * 22);

    for (const star of this.stars) {
      const x = (star.x - this.camera.position.x) * star.depth * this.camera.zoom + this.viewportWidth * 0.5 - starDriftX * star.depth * star.drift;
      const y = (star.y - this.camera.position.y) * star.depth * this.camera.zoom + this.viewportHeight * 0.5 - starDriftY * star.depth * star.drift;
      if (x < -10 || x > this.viewportWidth + 10 || y < -10 || y > this.viewportHeight + 10) continue;
      const streakLength = starBoost * (6 + star.depth * 14) * star.drift;
      const streakX = averageVelocity.x * streakLength * 0.14;
      const streakY = averageVelocity.y * streakLength * 0.14;

      if (starBoost > 0.08) {
        ctx.strokeStyle = `rgba(219, 240, 255, ${star.alpha * 0.55})`;
        ctx.lineWidth = Math.max(1, star.size * star.depth * 0.9);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - streakX, y - streakY);
        ctx.stroke();
      }

      ctx.fillStyle = `rgba(219, 240, 255, ${Math.min(1, star.alpha + starBoost * 0.15)})`;
      ctx.beginPath();
      ctx.arc(x, y, star.size * star.depth * (1 + starBoost * 0.18), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderWorld() {
    const ctx = this.ctx;
    this.camera.apply(ctx, { width: this.viewportWidth, height: this.viewportHeight });

    const worldGradient = ctx.createLinearGradient(0, 0, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height);
    worldGradient.addColorStop(0, 'rgba(5, 12, 20, 0.82)');
    worldGradient.addColorStop(0.45, 'rgba(8, 18, 28, 0.72)');
    worldGradient.addColorStop(1, 'rgba(4, 8, 14, 0.92)');
    ctx.fillStyle = worldGradient;
    ctx.fillRect(0, 0, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height);

    const blueField = ctx.createRadialGradient(this.blue.pos.x, this.blue.pos.y, 0, this.blue.pos.x, this.blue.pos.y, 360);
    blueField.addColorStop(0, 'rgba(79, 212, 255, 0.08)');
    blueField.addColorStop(1, 'rgba(79, 212, 255, 0)');
    ctx.fillStyle = blueField;
    ctx.fillRect(0, 0, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height);

    const redField = ctx.createRadialGradient(this.red.pos.x, this.red.pos.y, 0, this.red.pos.x, this.red.pos.y, 360);
    redField.addColorStop(0, 'rgba(255, 138, 122, 0.08)');
    redField.addColorStop(1, 'rgba(255, 138, 122, 0)');
    ctx.fillStyle = redField;
    ctx.fillRect(0, 0, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height);

    ctx.strokeStyle = 'rgba(126, 184, 227, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width; x += _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height);
      ctx.stroke();
    }
    for (let y = 0; y <= _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height; y += _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(_config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width, y);
      ctx.stroke();
    }

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 2;
    for (let i = -4; i <= 8; i += 1) {
      const offset = (this.time * 0.9 + i * 260) % (_config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width + _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height * 0.25);
      ctx.beginPath();
      ctx.moveTo(offset - _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height * 0.2, 0);
      ctx.lineTo(offset + _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height * 0.8, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height);
      ctx.stroke();
    }
    ctx.restore();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.width, _config_js__WEBPACK_IMPORTED_MODULE_0__.WORLD.height);

    this.planets.forEach((planet) => planet.draw(ctx));
    this.items.forEach((item) => item.draw(ctx));
    this.drones.forEach((drone) => drone.draw(ctx));
    this.blue.draw(ctx);
    this.red.draw(ctx);

    for (const particle of this.particles) {
      const alpha = (0,_utils_js__WEBPACK_IMPORTED_MODULE_9__.clamp)(particle.life / (particle.maxLife || 42), 0, 1);
      ctx.globalAlpha = alpha;
      if (particle.type === 'ring') {
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = particle.lineWidth;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    this.camera.restore(ctx);
  }

  renderTouchUi() {
    const ctx = this.ctx;
    ctx.save();

    for (const team of ['blue', 'red']) {
      const state = this.controls.getJoystickState(team);
      if (!state) continue;
      const color = _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[team].primary;
      ctx.strokeStyle = `${color}99`;
      ctx.fillStyle = `${color}22`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(state.startX, state.startY, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = `${color}bb`;
      ctx.beginPath();
      ctx.arc(state.currentX, state.currentY, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  update(delta) {
    this.time += delta;
    const tick = Math.min(2.5, delta / (1000 / 60));

    if (this.state === 'start') {
      this.updateStart(delta);
    } else if (this.state === 'playing') {
      this.updatePlaying(tick);
    } else if (this.state === 'victory') {
      this.updateParticles(tick);
      this.camera.update(this.blue, this.red, this.viewportWidth, this.viewportHeight, tick);
    }

    this.ui.updateHUD(this.buildSnapshot());
  }

  render() {
    this.renderBackground();
    this.renderWorld();
    if (this.state === 'playing') this.renderTouchUi();
  }

  frame = (now) => {
    const delta = Math.min(48, now - this.lastTime);
    this.lastTime = now;
    this.update(delta);
    this.render();
    requestAnimationFrame(this.frame);
  };

  start() {
    this.ui.showStart();
    requestAnimationFrame(this.frame);
  }
}


/***/ },

/***/ "./js/item-icons.js"
/*!**************************!*\
  !*** ./js/item-icons.js ***!
  \**************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   drawItemIcon: () => (/* binding */ drawItemIcon),
/* harmony export */   getItemIconMarkup: () => (/* binding */ getItemIconMarkup)
/* harmony export */ });
const SVG_VIEWBOX = '0 0 24 24';

function iconSvg(inner) {
  return `<svg viewBox="${SVG_VIEWBOX}" aria-hidden="true" focusable="false">${inner}</svg>`;
}

function getItemIconMarkup(item) {
  switch (item.icon) {
    case 'thruster':
      return iconSvg(`
        <path class="icon-fill-soft" d="M12 3.4 16.9 10v3.8L12 18.8 7.1 13.8V10Z"/>
        <path d="M12 4.2 16 10v3.2L12 16.8 8 13.2V10Z"/>
        <path d="M9.1 12.2h5.8"/>
        <path d="M10.2 17.1 8.7 20.1l3.3-1.2 3.3 1.2-1.5-3"/>
      `);
    case 'factory':
      return iconSvg(`
        <path class="icon-fill-soft" d="M4.5 19.5V9.1l4.5 2.4V8.7l4 2.2V7.5l6.5 3.4v8.6Z"/>
        <path d="M5 19V9.8l4.5 2.3V9.4l4 2.2V8.2l5.5 2.9V19Z"/>
        <path d="M8.2 19v-3.2"/>
        <path d="M11.9 19v-5.2"/>
        <path d="M15.8 19v-2.8"/>
        <path d="M7.2 7.2h2.6"/>
      `);
    case 'expand':
      return iconSvg(`
        <rect class="icon-fill-soft" x="9" y="9" width="6" height="6" rx="1.4"/>
        <rect x="9.3" y="9.3" width="5.4" height="5.4" rx="1.2"/>
        <path d="M8.2 8.2 5 5"/>
        <path d="M15.8 8.2 19 5"/>
        <path d="M8.2 15.8 5 19"/>
        <path d="M15.8 15.8 19 19"/>
        <path d="M5 8V5h3"/>
        <path d="M19 8V5h-3"/>
        <path d="M5 16v3h3"/>
        <path d="M19 16v3h-3"/>
      `);
    case 'bolt':
      return iconSvg(`
        <path class="icon-fill-strong" d="M13.1 2.7 6.8 12.3h3.8L9.8 21.3l7.4-11H13l.1-7.6Z"/>
        <path d="M13.1 2.7 6.8 12.3h3.8L9.8 21.3l7.4-11H13l.1-7.6Z"/>
        <path d="M6 6.1 8 7.3"/>
        <path d="m16.4 17.5 2.2 1.3"/>
      `);
    case 'crosshair':
      return iconSvg(`
        <circle class="icon-fill-soft" cx="12" cy="12" r="5.6"/>
        <circle cx="12" cy="12" r="5.1"/>
        <path d="M12 3.2v3.1"/>
        <path d="M12 17.7v3.1"/>
        <path d="M3.2 12h3.1"/>
        <path d="M17.7 12h3.1"/>
        <circle class="icon-fill-strong" cx="12" cy="12" r="1.6"/>
      `);
    case 'eclipse':
      return iconSvg(`
        <circle class="icon-fill-soft" cx="10.7" cy="12" r="5.6"/>
        <path class="icon-fill-strong" d="M13.7 6.4a5.9 5.9 0 1 0 0 11.2 6.7 6.7 0 0 1-2.8.6 6.2 6.2 0 1 1 2.8-11.8Z"/>
        <circle cx="17.6" cy="7.4" r="1.2"/>
        <path d="m19.4 5.6.8-.8"/>
        <path d="m18.9 9.4.8.8"/>
      `);
    case 'flag':
      return iconSvg(`
        <path d="M7 20V4"/>
        <path class="icon-fill-soft" d="M8.2 5.2h8.2L14.1 8l2.3 2.8H8.2Z"/>
        <path d="M8.2 5.2h8.2L14.1 8l2.3 2.8H8.2Z"/>
        <path d="M7 20h10"/>
        <path d="M10.1 13.8c1.2-.8 2.5-.8 3.8 0"/>
      `);
    default:
      return iconSvg('<circle cx="12" cy="12" r="5"/><circle class="icon-fill-strong" cx="12" cy="12" r="1.8"/>');
  }
}

function drawItemIcon(ctx, type, size) {
  ctx.save();
  ctx.strokeStyle = '#ecf7ff';
  ctx.fillStyle = '#ecf7ff';
  ctx.lineWidth = Math.max(1.6, size * 0.08);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const s = size / 24;

  switch (type.icon) {
    case 'thruster':
      ctx.beginPath();
      ctx.moveTo(0, -8.5 * s);
      ctx.lineTo(4.7 * s, -2.1 * s);
      ctx.lineTo(4.7 * s, 1.8 * s);
      ctx.lineTo(0, 6.4 * s);
      ctx.lineTo(-4.7 * s, 1.8 * s);
      ctx.lineTo(-4.7 * s, -2.1 * s);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-2.2 * s, 0.2 * s);
      ctx.lineTo(2.2 * s, 0.2 * s);
      ctx.moveTo(-2.2 * s, 6 * s);
      ctx.lineTo(0, 9.2 * s);
      ctx.lineTo(2.2 * s, 6 * s);
      ctx.stroke();
      break;
    case 'factory':
      ctx.beginPath();
      ctx.moveTo(-8 * s, 8.5 * s);
      ctx.lineTo(-8 * s, -2 * s);
      ctx.lineTo(-3.5 * s, 0.3 * s);
      ctx.lineTo(-3.5 * s, -2.5 * s);
      ctx.lineTo(0.3 * s, -0.4 * s);
      ctx.lineTo(0.3 * s, -3.8 * s);
      ctx.lineTo(7.3 * s, -0.2 * s);
      ctx.lineTo(7.3 * s, 8.5 * s);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-4.8 * s, 8.5 * s);
      ctx.lineTo(-4.8 * s, 3.8 * s);
      ctx.moveTo(-0.9 * s, 8.5 * s);
      ctx.lineTo(-0.9 * s, 2.2 * s);
      ctx.moveTo(3 * s, 8.5 * s);
      ctx.lineTo(3 * s, 5.2 * s);
      ctx.stroke();
      break;
    case 'expand':
      ctx.strokeRect(-3.6 * s, -3.6 * s, 7.2 * s, 7.2 * s);
      ctx.beginPath();
      ctx.moveTo(-4.8 * s, -4.8 * s);
      ctx.lineTo(-8.7 * s, -8.7 * s);
      ctx.moveTo(4.8 * s, -4.8 * s);
      ctx.lineTo(8.7 * s, -8.7 * s);
      ctx.moveTo(-4.8 * s, 4.8 * s);
      ctx.lineTo(-8.7 * s, 8.7 * s);
      ctx.moveTo(4.8 * s, 4.8 * s);
      ctx.lineTo(8.7 * s, 8.7 * s);
      ctx.moveTo(-8.7 * s, -4.2 * s);
      ctx.lineTo(-8.7 * s, -8.7 * s);
      ctx.lineTo(-4.2 * s, -8.7 * s);
      ctx.moveTo(8.7 * s, -4.2 * s);
      ctx.lineTo(8.7 * s, -8.7 * s);
      ctx.lineTo(4.2 * s, -8.7 * s);
      ctx.moveTo(-8.7 * s, 4.2 * s);
      ctx.lineTo(-8.7 * s, 8.7 * s);
      ctx.lineTo(-4.2 * s, 8.7 * s);
      ctx.moveTo(8.7 * s, 4.2 * s);
      ctx.lineTo(8.7 * s, 8.7 * s);
      ctx.lineTo(4.2 * s, 8.7 * s);
      ctx.stroke();
      break;
    case 'bolt':
      ctx.beginPath();
      ctx.moveTo(1.5 * s, -9.3 * s);
      ctx.lineTo(-4.8 * s, 0.1 * s);
      ctx.lineTo(-1.2 * s, 0.1 * s);
      ctx.lineTo(-2.7 * s, 9.2 * s);
      ctx.lineTo(5.6 * s, -1.2 * s);
      ctx.lineTo(1.9 * s, -1.2 * s);
      ctx.closePath();
      ctx.fill();
      break;
    case 'crosshair':
      ctx.beginPath();
      ctx.arc(0, 0, 5.2 * s, 0, Math.PI * 2);
      ctx.moveTo(0, -9 * s);
      ctx.lineTo(0, -6.1 * s);
      ctx.moveTo(0, 6.1 * s);
      ctx.lineTo(0, 9 * s);
      ctx.moveTo(-9 * s, 0);
      ctx.lineTo(-6.1 * s, 0);
      ctx.moveTo(6.1 * s, 0);
      ctx.lineTo(9 * s, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 1.7 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'eclipse':
      ctx.beginPath();
      ctx.arc(-1.8 * s, 0, 5.5 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(2 * s, 0, 5.8 * s, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(6.6 * s, -4.8 * s, 1.2 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'flag':
      ctx.beginPath();
      ctx.moveTo(-5.3 * s, 9 * s);
      ctx.lineTo(-5.3 * s, -8.6 * s);
      ctx.moveTo(-4.4 * s, -7 * s);
      ctx.lineTo(5.4 * s, -7 * s);
      ctx.lineTo(2.4 * s, -3 * s);
      ctx.lineTo(5.4 * s, 0.8 * s);
      ctx.lineTo(-4.4 * s, 0.8 * s);
      ctx.moveTo(-5.3 * s, 9 * s);
      ctx.lineTo(5.3 * s, 9 * s);
      ctx.stroke();
      break;
    default:
      ctx.beginPath();
      ctx.arc(0, 0, 5 * s, 0, Math.PI * 2);
      ctx.stroke();
      break;
  }

  ctx.restore();
}


/***/ },

/***/ "./js/ui.js"
/*!******************!*\
  !*** ./js/ui.js ***!
  \******************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UI: () => (/* binding */ UI)
/* harmony export */ });
/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config.js */ "./js/config.js");
/* harmony import */ var _item_icons_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./item-icons.js */ "./js/item-icons.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils.js */ "./js/utils.js");




const TRANSLATIONS = {
  en: {
    langButton: 'EN',
    pageTitle: 'Star Swarm Arena',
    blueFleet: 'Blue Fleet',
    redFleet: 'Red Fleet',
    mothershipCommand: 'Mothership Command',
    strikeFormation: 'Strike Formation',
    arenaStatus: 'Arena Status',
    velocitySystem: 'Velocity Duel System',
    logoTitle: 'Star Swarm Arena',
    startOverline: 'Local Split-Screen Battle',
    startTitle: 'Break Formation. Seize The Arena.',
    startDescription: 'Two rival flagships tear through a shared battlefield, racing for planets, fleet growth, and the final collapse.',
    startBattle: 'Start Battle',
    settings: 'Settings',
    quickSetup: 'Quick Setup',
    touch: 'Touch',
    touchMode: 'Left / Right Screen',
    boost: 'Boost',
    arrowKeys: 'Arrow Keys',
    settingsNote: 'Capture planets, raise your drone cap, and destroy the enemy mothership first.',
    matchComplete: 'Match Complete',
    runItBack: 'Run It Back',
    backToHome: 'Back To Home',
    noBuffs: 'No buffs',
    planetsSuffix: 'planets',
    battleLive: 'Battle Live',
    awaitingRestart: 'Awaiting Restart',
    standBy: 'Stand By',
    neutralTip: (count, cap) => `${count} neutral planets remain. Item cap: ${cap}.`,
    victoryTitle: (winner) => `${winner} Victory`,
    victorySubtitle: (winner) => `The enemy flagship is down. ${winner} now controls the arena.`,
    items: {
      'ship-speed': { name: 'Ship Speed', description: 'Mothership speed +50% for 3 seconds.' },
      production: { name: 'Production', description: 'Drone output doubles for 3 seconds.' },
      'drone-size': { name: 'Drone Size', description: 'Drone body size +80% for 3 seconds.' },
      'drone-speed': { name: 'Drone Speed', description: 'Drone speed +50% for 3 seconds.' },
      'drone-attack': { name: 'Attack x2', description: 'Drone damage doubles for 3 seconds.' },
      neutralize: { name: 'Neutralize', description: 'One enemy planet is reset to neutral instantly.' },
      autocapture: { name: 'Auto Capture', description: 'Claims the nearest planet after 3 seconds.' },
    },
    buffs: {
      shipSpeed: 'Ship Speed',
      production: 'Production',
      droneSize: 'Drone Size',
      droneSpeed: 'Drone Speed',
      droneDamage: 'Attack x2',
      autocapture: 'Auto Capture',
    },
    teams: {
      blue: 'Blue Fleet',
      red: 'Red Fleet',
    },
  },
  zh: {
    langButton: '中文',
    pageTitle: '星群竞技场',
    blueFleet: '蓝方舰队',
    redFleet: '红方舰队',
    mothershipCommand: '母舰指挥',
    strikeFormation: '突击编队',
    arenaStatus: '战场状态',
    velocitySystem: '高速对决系统',
    logoTitle: '星群竞技场',
    startOverline: '本地双人同屏对战',
    startTitle: '突破防线，夺取战场。',
    startDescription: '两艘敌对旗舰在同一片战场上高速缠斗，争夺星球、舰群规模与最终胜利。',
    startBattle: '开始战斗',
    settings: '设置',
    quickSetup: '快速设置',
    touch: '触控',
    touchMode: '屏幕左侧 / 右侧',
    boost: '加速',
    arrowKeys: '方向键',
    settingsNote: '占领星球，提升无人机上限，并率先摧毁敌方母舰。',
    matchComplete: '对局结束',
    runItBack: '再来一局',
    backToHome: '返回主页',
    noBuffs: '暂无增益',
    planetsSuffix: '颗星球',
    battleLive: '战斗进行中',
    awaitingRestart: '等待重新开始',
    standBy: '待命中',
    neutralTip: (count, cap) => `剩余中立星球 ${count} 颗。道具上限：${cap}。`,
    victoryTitle: (winner) => `${winner} 胜利`,
    victorySubtitle: (winner) => `敌方母舰已被摧毁，现在由${winner}掌控整片战场。`,
    items: {
      'ship-speed': { name: '战舰加速', description: '母舰移动速度提升 50%，持续 3 秒。' },
      production: { name: '产能翻倍', description: '无人机产出速度翻倍，持续 3 秒。' },
      'drone-size': { name: '无人机增幅', description: '无人机体积提升 80%，持续 3 秒。' },
      'drone-speed': { name: '无人机加速', description: '无人机速度提升 50%，持续 3 秒。' },
      'drone-attack': { name: '攻击翻倍', description: '无人机伤害翻倍，持续 3 秒。' },
      neutralize: { name: '中立化', description: '立即将一颗敌方星球重置为中立。' },
      autocapture: { name: '自动占领', description: '3 秒后自动夺取最近的一颗星球。' },
    },
    buffs: {
      shipSpeed: '战舰加速',
      production: '产能翻倍',
      droneSize: '无人机增幅',
      droneSpeed: '无人机加速',
      droneDamage: '攻击翻倍',
      autocapture: '自动占领',
    },
    teams: {
      blue: '蓝方舰队',
      red: '红方舰队',
    },
  },
};

class UI {
  constructor() {
    this.appShell = document.querySelector('.app-shell');
    this.hud = document.getElementById('top-hud');
    this.startScreen = document.getElementById('start-screen');
    this.victoryScreen = document.getElementById('victory-screen');
    this.legend = document.getElementById('item-legend');
    this.startButton = document.getElementById('start-button');
    this.settingsButton = document.getElementById('settings-button');
    this.settingsPanel = document.getElementById('settings-panel');
    this.languageButton = document.getElementById('language-button');
    this.restartButton = document.getElementById('restart-button');
    this.homeButton = document.getElementById('home-button');
    this.blueBoostButton = document.getElementById('blue-boost-button');
    this.redBoostButton = document.getElementById('red-boost-button');
    this.blueHold = document.getElementById('blue-hold');
    this.redHold = document.getElementById('red-hold');
    this.victoryTitle = document.getElementById('victory-title');
    this.victorySubtitle = document.getElementById('victory-subtitle');
    this.hudState = document.getElementById('hud-state');
    this.hudTip = document.getElementById('hud-tip');
    this.currentLanguage = 'en';
    this.lastWinner = null;
    this.dualHold = { blue: false, red: false, progress: 0 };

    this.textRefs = {
      html: document.documentElement,
      title: document.querySelector('title'),
      blueName: document.querySelector('.hud-panel.blue .hud-name'),
      blueSubname: document.querySelector('.hud-panel.blue .hud-subname'),
      redName: document.querySelector('.hud-panel.red .hud-name'),
      redSubname: document.querySelector('.hud-panel.red .hud-subname'),
      arenaStatus: document.querySelector('.hud-center .eyebrow'),
      logoKicker: document.querySelector('.start-logo-kicker'),
      logoTitle: document.querySelector('.start-logo-title'),
      startOverline: document.querySelector('.start-overline'),
      startTitle: document.querySelector('.start-copy h1'),
      startDescription: document.querySelector('.start-description'),
      settingsTitle: document.querySelector('.settings-title'),
      settingsBlueLabel: document.querySelector('#settings-panel .settings-row:nth-child(2) span'),
      settingsRedLabel: document.querySelector('#settings-panel .settings-row:nth-child(3) span'),
      settingsRedValue: document.querySelector('#settings-panel .settings-row:nth-child(3) strong'),
      settingsTouchLabel: document.querySelector('#settings-panel .settings-row:nth-child(4) span'),
      settingsTouchValue: document.querySelector('#settings-panel .settings-row:nth-child(4) strong'),
      settingsNote: document.querySelector('.settings-note'),
      victoryEyebrow: document.querySelector('.victory-panel .eyebrow'),
    };

    this.refs = {
      blue: {
        bar: document.getElementById('blue-health-bar'),
        health: document.getElementById('blue-health-text'),
        drones: document.getElementById('blue-drone-text'),
        planets: document.getElementById('blue-planet-text'),
        buffs: document.getElementById('blue-buffs'),
      },
      red: {
        bar: document.getElementById('red-health-bar'),
        health: document.getElementById('red-health-text'),
        drones: document.getElementById('red-drone-text'),
        planets: document.getElementById('red-planet-text'),
        buffs: document.getElementById('red-buffs'),
      },
    };

    this.populateLegend();
    this.bindHoldButtons();
    this.bindSettings();
    this.bindLanguage();
    this.applyTranslations();
    this.setVisualState('start');
  }

  populateLegend() {
    if (!this.legend) return;
    const t = TRANSLATIONS[this.currentLanguage];
    this.legend.innerHTML = _config_js__WEBPACK_IMPORTED_MODULE_0__.ITEM_TYPES.map((item) => `
      <article class="legend-item">
        <div class="legend-icon" style="--icon-accent:${item.accent}">
          ${(0,_item_icons_js__WEBPACK_IMPORTED_MODULE_1__.getItemIconMarkup)(item)}
        </div>
        <div class="legend-name">${t.items[item.id]?.name || item.name}</div>
        <div class="legend-desc">${t.items[item.id]?.description || item.description}</div>
      </article>
    `).join('');
  }

  bindCallbacks(callbacks) {
    this.startButton?.addEventListener('click', callbacks.onStart);
    this.restartButton?.addEventListener('click', callbacks.onRestart);
    this.homeButton?.addEventListener('click', callbacks.onHome);
  }

  bindHoldButtons() {
    if (!this.blueHold || !this.redHold) return;

    const bind = (element, key) => {
      const down = () => {
        this.dualHold[key] = true;
      };
      const up = () => {
        this.dualHold[key] = false;
      };

      element.addEventListener('pointerdown', down);
      element.addEventListener('pointerup', up);
      element.addEventListener('pointerleave', up);
      element.addEventListener('pointercancel', up);
    };

    bind(this.blueHold, 'blue');
    bind(this.redHold, 'red');
  }

  bindSettings() {
    if (!this.settingsButton || !this.settingsPanel) return;

    this.settingsButton.addEventListener('click', () => {
      const open = this.settingsPanel.classList.toggle('is-open');
      this.settingsPanel.classList.toggle('hidden', !open);
      this.settingsButton.setAttribute('aria-expanded', String(open));
    });
  }

  bindLanguage() {
    if (!this.languageButton) return;
    this.languageButton.addEventListener('click', () => {
      this.currentLanguage = this.currentLanguage === 'en' ? 'zh' : 'en';
      this.applyTranslations();
    });
  }

  applyTranslations() {
    const t = TRANSLATIONS[this.currentLanguage];
    this.textRefs.html?.setAttribute('lang', this.currentLanguage === 'en' ? 'en' : 'zh-CN');
    if (this.textRefs.title) this.textRefs.title.textContent = t.pageTitle;
    if (this.languageButton) this.languageButton.textContent = t.langButton;
    if (this.textRefs.blueName) this.textRefs.blueName.textContent = t.blueFleet;
    if (this.textRefs.blueSubname) this.textRefs.blueSubname.textContent = t.mothershipCommand;
    if (this.textRefs.redName) this.textRefs.redName.textContent = t.redFleet;
    if (this.textRefs.redSubname) this.textRefs.redSubname.textContent = t.strikeFormation;
    if (this.textRefs.arenaStatus) this.textRefs.arenaStatus.textContent = t.arenaStatus;
    if (this.textRefs.logoKicker) this.textRefs.logoKicker.textContent = t.velocitySystem;
    if (this.textRefs.logoTitle) this.textRefs.logoTitle.textContent = t.logoTitle;
    if (this.textRefs.startOverline) this.textRefs.startOverline.textContent = t.startOverline;
    if (this.textRefs.startTitle) this.textRefs.startTitle.textContent = t.startTitle;
    if (this.textRefs.startDescription) this.textRefs.startDescription.textContent = t.startDescription;
    if (this.startButton) this.startButton.textContent = t.startBattle;
    if (this.settingsButton) this.settingsButton.textContent = t.settings;
    if (this.textRefs.settingsTitle) this.textRefs.settingsTitle.textContent = t.quickSetup;
    if (this.textRefs.settingsBlueLabel) this.textRefs.settingsBlueLabel.textContent = t.blueFleet;
    if (this.textRefs.settingsRedLabel) this.textRefs.settingsRedLabel.textContent = t.redFleet;
    if (this.textRefs.settingsRedValue) this.textRefs.settingsRedValue.textContent = t.arrowKeys;
    if (this.textRefs.settingsTouchLabel) this.textRefs.settingsTouchLabel.textContent = t.touch;
    if (this.textRefs.settingsTouchValue) this.textRefs.settingsTouchValue.textContent = t.touchMode;
    if (this.textRefs.settingsNote) this.textRefs.settingsNote.textContent = t.settingsNote;
    if (this.textRefs.victoryEyebrow) this.textRefs.victoryEyebrow.textContent = t.matchComplete;
    if (this.restartButton) this.restartButton.textContent = t.runItBack;
    if (this.homeButton) this.homeButton.textContent = t.backToHome;
    if (this.blueBoostButton) this.blueBoostButton.textContent = t.boost;
    if (this.redBoostButton) this.redBoostButton.textContent = t.boost;
    this.populateLegend();
    if (this.lastWinner) {
      this.setVictoryText(this.lastWinner);
    }
  }

  setVictoryText(team) {
    const t = TRANSLATIONS[this.currentLanguage];
    const winner = t.teams[team] || _config_js__WEBPACK_IMPORTED_MODULE_0__.TEAM_COLORS[team].text;
    this.victoryTitle.textContent = t.victoryTitle(winner);
    this.victorySubtitle.textContent = t.victorySubtitle(winner);
  }

  updateDualHold(delta, onReady) {
    if (!this.blueHold || !this.redHold) return;

    if (this.dualHold.blue && this.dualHold.red) {
      this.dualHold.progress = Math.min(1, this.dualHold.progress + delta / 900);
    } else {
      this.dualHold.progress = Math.max(0, this.dualHold.progress - delta / 250);
    }

    const degrees = `${this.dualHold.progress * 360}deg`;
    this.blueHold.style.setProperty('--progress', degrees);
    this.redHold.style.setProperty('--progress', degrees);

    if (this.dualHold.progress >= 1) {
      this.dualHold.progress = 0;
      this.dualHold.blue = false;
      this.dualHold.red = false;
      this.blueHold.style.setProperty('--progress', '0deg');
      this.redHold.style.setProperty('--progress', '0deg');
      onReady();
    }
  }

  showStart() {
    this.setVisualState('start');
    this.hud.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.startScreen.classList.remove('hidden');
    if (this.settingsPanel) {
      this.settingsPanel.classList.add('hidden');
      this.settingsPanel.classList.remove('is-open');
    }
    if (this.settingsButton) {
      this.settingsButton.setAttribute('aria-expanded', 'false');
    }
  }

  showPlaying() {
    this.setVisualState('playing');
    this.startScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.hud.classList.remove('hidden');
  }

  showVictory(team) {
    this.setVisualState('victory');
    this.hud.classList.remove('hidden');
    this.victoryScreen.classList.remove('hidden');
    this.lastWinner = team;
    this.setVictoryText(team);
  }

  setVisualState(state) {
    if (!this.appShell) return;
    this.appShell.classList.toggle('state-start', state === 'start');
    this.appShell.classList.toggle('state-playing', state === 'playing');
    this.appShell.classList.toggle('state-victory', state === 'victory');
  }

  updateHUD(snapshot) {
    for (const team of ['blue', 'red']) {
      const entry = snapshot[team];
      const refs = this.refs[team];

      refs.bar.style.width = `${entry.healthRatio * 100}%`;
      refs.health.textContent = `${Math.ceil(entry.health)} / ${entry.maxHealth}`;
      refs.drones.textContent = `${entry.drones} / ${entry.cap}`;
      refs.planets.textContent = this.currentLanguage === 'en'
        ? `${entry.planets} ${TRANSLATIONS.en.planetsSuffix}`
        : `${entry.planets}${TRANSLATIONS.zh.planetsSuffix}`;
      refs.buffs.innerHTML = entry.buffs.length
        ? entry.buffs.map((buff) => `<span class="buff-pill">${TRANSLATIONS[this.currentLanguage].buffs[buff.type] || buff.label}<small>${(0,_utils_js__WEBPACK_IMPORTED_MODULE_2__.padTime)(buff.remaining)}</small></span>`).join('')
        : `<span class="buff-pill">${TRANSLATIONS[this.currentLanguage].noBuffs}</span>`;
    }

    this.hudState.textContent = TRANSLATIONS[this.currentLanguage][snapshot.stateKey] || snapshot.stateKey;
    this.hudTip.textContent = TRANSLATIONS[this.currentLanguage].neutralTip(snapshot.neutralPlanets, snapshot.itemCap);
  }
}


/***/ },

/***/ "./js/utils.js"
/*!*********************!*\
  !*** ./js/utils.js ***!
  \*********************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Vector2: () => (/* binding */ Vector2),
/* harmony export */   clamp: () => (/* binding */ clamp),
/* harmony export */   distance: () => (/* binding */ distance),
/* harmony export */   lerp: () => (/* binding */ lerp),
/* harmony export */   padTime: () => (/* binding */ padTime),
/* harmony export */   pick: () => (/* binding */ pick),
/* harmony export */   rand: () => (/* binding */ rand)
/* harmony export */ });
class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  scale(s) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  length() {
    return Math.hypot(this.x, this.y);
  }

  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }

  normalize() {
    const len = this.length();
    if (len > 0) {
      this.x /= len;
      this.y /= len;
    }
    return this;
  }

  limit(max) {
    const lenSq = this.lengthSq();
    if (lenSq > max * max) {
      this.normalize().scale(max);
    }
    return this;
  }

  distanceTo(v) {
    return Math.hypot(this.x - v.x, this.y - v.y);
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  static fromAngle(angle, length = 1) {
    return new Vector2(Math.cos(angle) * length, Math.sin(angle) * length);
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(start, end, alpha) {
  return start + (end - start) * alpha;
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getPoint(entity) {
  if (entity && typeof entity.x === 'number' && typeof entity.y === 'number') {
    return entity;
  }
  if (entity && entity.pos && typeof entity.pos.x === 'number' && typeof entity.pos.y === 'number') {
    return entity.pos;
  }
  return { x: 0, y: 0 };
}

function distance(a, b) {
  const pointA = getPoint(a);
  const pointB = getPoint(b);
  return Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y);
}

function padTime(frames) {
  return (frames / 60).toFixed(1) + 's';
}


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "/";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = (typeof document !== 'undefined' && document.baseURI) || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no jsonp function
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!********************!*\
  !*** ./js/main.js ***!
  \********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _game_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./game.js */ "./js/game.js");
/* harmony import */ var _audio_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./audio.js */ "./js/audio.js");
/* harmony import */ var _assets_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./assets.js */ "./js/assets.js");




window.addEventListener('DOMContentLoaded', async () => {
  await (0,_assets_js__WEBPACK_IMPORTED_MODULE_2__.loadAssets)();
  const canvas = document.getElementById('game-canvas');
  const game = new _game_js__WEBPACK_IMPORTED_MODULE_0__.Game(canvas);
  const audio = new _audio_js__WEBPACK_IMPORTED_MODULE_1__.AudioManager();
  audio.attachButton(document.getElementById('audio-button'));

  const unlockAudio = async () => {
    await audio.ensureStarted();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('mousedown', unlockAudio);
  };

  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio);
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('mousedown', unlockAudio, { passive: true });

  const syncAudio = () => {
    audio.setScene(game.state);
    audio.tick();
    requestAnimationFrame(syncAudio);
  };

  game.start();
  syncAudio();
});

})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map