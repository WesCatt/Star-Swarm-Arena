import { BALANCE, ITEM_TYPES, TEAM_COLORS, WORLD } from './config.js';
import { Camera } from './camera.js';
import { resolveCircleCollision, overlapsCircle } from './collision.js';
import { Controls } from './controls.js';
import { Drone } from './entities/drone.js';
import { Item } from './entities/item.js';
import { Mothership } from './entities/mothership.js';
import { Planet } from './entities/planet.js';
import { NetworkClient } from './network-client.js';
import {
  ONLINE_CAMERA_VIEW,
  ONLINE_CHUNK_SIZE,
  ONLINE_WORLD,
  getOnlinePlanetTextureForOwner,
  getOnlineSpawnPoint,
  getOnlineTheme,
} from './online-constants.js';
import { UI } from './ui.js';
import { Vector2, clamp, distance, lerp, pick, rand } from './utils.js';

function lerpAngle(from, to, amount) {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + delta * amount;
}

function normalizeAngle(angle) {
  let wrapped = angle;
  while (wrapped > Math.PI) wrapped -= Math.PI * 2;
  while (wrapped < -Math.PI) wrapped += Math.PI * 2;
  return wrapped;
}

function getStableMoveAngle(x, y, currentAngle = 0) {
  const rawAngle = Math.atan2(y, x);
  if (x >= -0.001 || Math.abs(y) > 0.12) {
    return rawAngle;
  }

  const positivePi = Math.PI;
  const negativePi = -Math.PI;
  return Math.abs(normalizeAngle(positivePi - currentAngle)) <= Math.abs(normalizeAngle(negativePi - currentAngle))
    ? positivePi
    : negativePi;
}

function easeOutCubic(value) {
  const t = clamp(value, 0, 1);
  return 1 - ((1 - t) ** 3);
}

function hexToRgba(color, alpha = 1) {
  if (!color || typeof color !== 'string') return `rgba(255, 255, 255, ${alpha})`;
  if (color.startsWith('rgba(') || color.startsWith('rgb(')) return color;
  if (!color.startsWith('#')) return color;
  const hex = color.slice(1);
  const normalized = hex.length === 3
    ? hex.split('').map((char) => `${char}${char}`).join('')
    : hex.slice(0, 6);
  const value = Number.parseInt(normalized, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

const PLANET_IMPACT_FX_COOLDOWN_MS = 180;
const ONLINE_LOCKED_TARGET_HOLD_FRAMES = 42;
const ONLINE_LOCKED_TARGET_FADE_FRAMES = 24;

export class Game {
  constructor(canvas, audio = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.audio = audio;
    this.ui = new UI();
    this.controls = new Controls(canvas);
    this.camera = new Camera();
    this.mode = 'local';
    this.state = 'start';
    this.lastTime = performance.now();
    this.time = 0;
    this.fpsSampleAt = 0;
    this.fpsFrameCount = 0;
    this.isCoarsePointer = false;
    this.stars = this.createStars();
    this.delayedEffects = [];
    this.particles = [];
    this.localPlanetImpactFxAt = new WeakMap();
    this.online = {
      client: null,
      slotId: null,
      snapshot: null,
      previousSnapshot: null,
      renderedShips: new Map(),
      renderedPlanets: new Map(),
      renderedDrones: new Map(),
      renderedItems: new Map(),
      renderedSkillEffects: new Map(),
      visualShips: new Map(),
      visualPlanets: new Map(),
      visualDrones: new Map(),
      visualItems: new Map(),
      backgroundChunks: new Map(),
      particles: [],
      inputTimer: 0,
      lastInput: { x: 0, y: 0, boost: false, repair: false, arc: false },
      hudTimer: 0,
      rosterSignature: '',
      planetImpactFxAt: new Map(),
    };

    this.ui.bindCallbacks({
      onStart: () => this.beginMatch(),
      onOnlineStart: () => this.beginOnlineMatch(),
      onOnlineMenuToggle: () => this.ui.toggleOnlineMenu(),
      onOnlineMenuContinue: () => this.ui.hideOnlineMenu(),
      onOnlineMenuLeave: () => this.returnToHome(),
      onRestart: () => this.restartMatch(),
      onHome: () => this.returnToHome(),
      onOnlineHome: () => this.returnToHome(),
    });

    this.resize();
    window.addEventListener('resize', this.resize);
    window.visualViewport?.addEventListener('resize', this.resize);
    window.visualViewport?.addEventListener('scroll', this.resize);

    this.setupMatch();
  }

  createStars() {
    return Array.from({ length: 170 }, () => ({
      x: rand(0, ONLINE_WORLD.width),
      y: rand(0, ONLINE_WORLD.height),
      size: rand(1, 3),
      depth: rand(0.3, 1),
      alpha: rand(0.35, 0.95),
    }));
  }

  resize = () => {
    const deviceDpr = window.devicePixelRatio || 1;
    const viewport = window.visualViewport;
    const width = viewport?.width || document.documentElement.clientWidth || window.innerWidth;
    const height = viewport?.height || document.documentElement.clientHeight || window.innerHeight;
    this.isCoarsePointer = window.matchMedia?.('(hover: none) and (pointer: coarse)').matches || false;
    const onlineDprCap = this.isMobilePerformanceMode() ? 1 : 1.5;
    const dpr = Math.min(deviceDpr, this.mode === 'online' ? onlineDprCap : 2);
    this.viewportWidth = Math.round(width);
    this.viewportHeight = Math.round(height);
    this.canvas.width = Math.round(this.viewportWidth * dpr);
    this.canvas.height = Math.round(this.viewportHeight * dpr);
    this.canvas.style.width = `${this.viewportWidth}px`;
    this.canvas.style.height = `${this.viewportHeight}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = true;
  };

  isMobilePerformanceMode() {
    return this.isCoarsePointer && this.mode === 'online';
  }

  isWithinBounds(entity, bounds, padding = 0) {
    if (!bounds || !entity) return true;
    const radius = (entity.radius || 0) + padding;
    return !(
      entity.x + radius < bounds.left
      || entity.x - radius > bounds.right
      || entity.y + radius < bounds.top
      || entity.y - radius > bounds.bottom
    );
  }

  setupMatch() {
    this.blue = new Mothership('blue', 300, WORLD.height * 0.5);
    this.red = new Mothership('red', WORLD.width - 300, WORLD.height * 0.5);
    this.drones = [];
    this.items = [];
    this.particles = [];
    this.delayedEffects = [];
    this.itemAccumulator = 0;
    this.localPlanetImpactFxAt = new WeakMap();
    this.camera.resetShake();

    this.planets = [];
    while (this.planets.length < WORLD.planets) {
      const pos = new Vector2(rand(360, WORLD.width - 360), rand(260, WORLD.height - 260));
      if (distance(pos, this.blue.pos) < 240 || distance(pos, this.red.pos) < 240) continue;
      if (this.planets.some((planet) => distance(pos, planet.pos) < 210)) continue;
      this.planets.push(new Planet(pos.x, pos.y));
    }

    for (const planet of this.planets) {
      planet.onDamaged = (damagedPlanet, team, info) => {
        if (info.willCapture) return;
        if (!this.consumePlanetImpactFxCooldown(this.localPlanetImpactFxAt, damagedPlanet)) return;
        const accent = TEAM_COLORS[team]?.primary || TEAM_COLORS[damagedPlanet.pendingOwner || damagedPlanet.owner]?.primary || TEAM_COLORS.neutral.primary;
        const shockwave = this.getPlanetImpactShockwave(damagedPlanet, info.impactHeat);
        this.spawnShockwave(
          damagedPlanet.pos.x,
          damagedPlanet.pos.y,
          accent,
          shockwave.radius,
          shockwave.scale,
        );
        this.camera.shake(clamp((info.impactHeat - 1.6) * 0.85, 0.28, 3.2), 3.5, { progressive: true });
        this.audio?.playPlanetImpact();
      };
      planet.onShattered = (capturedPlanet, team) => {
        this.spawnBurst(capturedPlanet.pos.x, capturedPlanet.pos.y, TEAM_COLORS[team].primary, 42, 3.2);
        this.spawnShockwave(capturedPlanet.pos.x, capturedPlanet.pos.y, TEAM_COLORS[team].primary, capturedPlanet.radius * 0.55, 2);
        this.camera.shake(30, 15);
        this.audio?.playPlanetShatter();
      };
      planet.onCaptured = (capturedPlanet, team) => {
        this.spawnBurst(capturedPlanet.pos.x, capturedPlanet.pos.y, TEAM_COLORS[team].primary, 18, 1.35);
      };
    }

    this.camera.position.set(WORLD.width * 0.5, WORLD.height * 0.5);
    this.camera.zoom = 0.9;
    this.controls.reset();
    this.controls.setMode('local');
  }

  beginMatch() {
    this.disconnectOnline();
    this.mode = 'local';
    this.resize();
    this.setupMatch();
    this.state = 'playing';
    this.ui.showPlaying();
  }

  beginOnlineMatch() {
    this.mode = 'online';
    this.resize();
    this.state = 'connecting';
    this.online.planetImpactFxAt.clear();
    this.controls.reset();
    this.controls.setMode('online');
    this.camera.position.set(ONLINE_WORLD.width * 0.5, ONLINE_WORLD.height * 0.5);
    this.camera.zoom = this.getOnlineCameraTargetZoom();
    this.ui.showOnlineStatus();
    this.ensureOnlineClient();
  }

  restartMatch() {
    if (this.mode === 'online') {
      this.beginOnlineMatch();
      return;
    }
    this.beginMatch();
  }

  returnToHome() {
    this.disconnectOnline();
    this.mode = 'local';
    this.resize();
    this.setupMatch();
    this.state = 'start';
    this.ui.showStart();
  }

  ensureOnlineClient() {
    if (this.online.client) return;
    this.online.client = new NetworkClient({
      onConnection: (state, detail) => {
        if (this.mode !== 'online') return;
        if (state === 'connected') {
          this.ui.showOnlineStatus({ meta: 'Connected. Reserving a room slot...' });
        } else if (state === 'disconnected') {
          this.state = 'connecting';
          this.ui.showOnlineStatus({
            title: 'Connection Lost',
            subtitle: 'Trying to reconnect to your room slot.',
            meta: detail || 'Reconnecting...',
          });
        } else if (state === 'error') {
          this.ui.showOnlineStatus({
            title: 'Unable To Reach Server',
            subtitle: 'Start the multiplayer server and try again.',
            meta: detail || 'No Socket.IO server response.',
          });
        }
      },
      onJoined: (payload) => {
        this.online.slotId = payload.slotId;
        this.ui.showOnlineStatus({
          meta: `${payload.roomId} 闂?${payload.playerCount}/${payload.capacity}`,
        });
      },
      onSnapshot: (payload) => {
        this.handleOnlineSnapshotEffects(this.online.snapshot, payload);
        this.online.previousSnapshot = this.online.snapshot;
        this.online.snapshot = payload;
        this.syncOnlineRenderState(payload);
        if (this.mode === 'online' && this.online.slotId) {
          this.state = 'playing';
          this.ui.showOnlinePlaying();
          this.ui.updateOnlineHud(payload, this.online.slotId);
        }
      },
    });
    this.online.client.connect();
  }

  handleOnlineSnapshotEffects(previousSnapshot, nextSnapshot) {
    if (!previousSnapshot || !nextSnapshot) return;
    const perfMode = this.isMobilePerformanceMode();
    const effectBounds = perfMode ? this.getVisibleWorldBounds(ONLINE_WORLD) : null;
    const previousShips = new Map(previousSnapshot.ships.map((entry) => [entry.slotId, entry]));
    const previousPlanets = new Map(previousSnapshot.planets.map((entry) => [entry.id, entry]));
    const nextDroneIds = new Set((nextSnapshot.drones || []).map((drone) => drone.id));
    const nextItemIds = new Set((nextSnapshot.items || []).map((item) => item.id));

    for (const ship of nextSnapshot.ships) {
      const prevShip = previousShips.get(ship.slotId);
      if (!prevShip) continue;
      const accent = ship.theme?.primary || TEAM_COLORS[ship.slotId]?.primary || '#ffffff';
      const shipVisible = !perfMode
        || ship.slotId === this.online.slotId
        || this.isWithinBounds(ship, effectBounds, 220);

      if (shipVisible && ship.health < prevShip.health - 0.9) {
        this.spawnBurst(ship.x, ship.y, accent, 12, 1.35);
        if (ship.lastDamagedBy === this.online.slotId && ship.slotId !== this.online.slotId) {
          this.online.lockedTargetHud = {
            slotId: ship.slotId,
            holdFrames: ONLINE_LOCKED_TARGET_HOLD_FRAMES,
            fadeFrames: ONLINE_LOCKED_TARGET_FADE_FRAMES,
            fadeMax: ONLINE_LOCKED_TARGET_FADE_FRAMES,
          };
        }
        if (ship.slotId === this.online.slotId) {
          this.camera.shake(clamp((prevShip.health - ship.health) * 0.12, 2, 10), 5, { progressive: true });
        }
      }

      if (shipVisible && prevShip.respawnFrames <= 0 && ship.respawnFrames > 0) {
        this.spawnBurst(prevShip.x, prevShip.y, accent, 34, 2.8);
        this.spawnShockwave(prevShip.x, prevShip.y, accent, ship.radius * 0.52, 1.55);
        if (ship.slotId === this.online.slotId) {
          this.camera.shake(16, 8);
        }
      }

      if (shipVisible && prevShip.respawnFrames > 0 && ship.respawnFrames <= 0) {
        this.spawnBurst(ship.x, ship.y, accent, 22, 1.8);
        this.spawnShockwave(ship.x, ship.y, accent, ship.radius * 0.36, 0.95);
      }
    }

    for (const planet of nextSnapshot.planets) {
      const prevPlanet = previousPlanets.get(planet.id);
      if (!prevPlanet) continue;
      const planetVisible = !perfMode || this.isWithinBounds(planet, effectBounds, 260);

      if (planetVisible && planet.health < prevPlanet.health - 0.3 && planet.rebuildTimer <= 0) {
        if (!this.consumePlanetImpactFxCooldown(this.online.planetImpactFxAt, planet.id)) continue;
        const accent = planet.pendingOwnerSlotId
          ? TEAM_COLORS[planet.pendingOwnerSlotId]?.primary || '#d6d8de'
          : planet.ownerSlotId
            ? TEAM_COLORS[planet.ownerSlotId]?.primary || '#d6d8de'
            : TEAM_COLORS.neutral.primary;
        const shockwave = this.getPlanetImpactShockwave(planet, planet.impactHeat || 0);
        this.spawnBurst(planet.x, planet.y, accent, 8, 0.9);
        this.spawnShockwave(
          planet.x,
          planet.y,
          accent,
          shockwave.radius,
          shockwave.scale,
        );
        this.camera.shake(2.4, 4, { progressive: true });
        this.audio?.playPlanetImpact();
      }

      if (planetVisible && prevPlanet.rebuildTimer <= 0 && planet.rebuildTimer > 0 && planet.pendingOwnerSlotId) {
        const accent = TEAM_COLORS[planet.pendingOwnerSlotId]?.primary || '#d6d8de';
        this.spawnBurst(planet.x, planet.y, accent, 42, 3.2);
        this.spawnShockwave(planet.x, planet.y, accent, planet.radius * 0.55, 2);
        this.camera.shake(30, 15);
        this.audio?.playPlanetShatter();
      }

      if (planetVisible && prevPlanet.rebuildTimer > 0 && planet.rebuildTimer <= 0 && planet.ownerSlotId) {
        const accent = TEAM_COLORS[planet.ownerSlotId]?.primary || '#d6d8de';
        this.spawnBurst(planet.x, planet.y, accent, 24, 1.8);
        this.spawnShockwave(planet.x, planet.y, accent, planet.radius * 0.28, 0.9);
      }
    }

    for (const prevDrone of previousSnapshot.drones || []) {
      if (nextDroneIds.has(prevDrone.id)) continue;
      if (perfMode && !this.isWithinBounds(prevDrone, effectBounds, 180)) continue;
      const accent = prevDrone.theme?.primary || TEAM_COLORS[prevDrone.ownerSlotId]?.primary || '#ffffff';
      this.spawnBurst(prevDrone.x, prevDrone.y, accent, 10, 1.1);
    }

    for (const prevItem of previousSnapshot.items || []) {
      if (nextItemIds.has(prevItem.id)) continue;
      if (perfMode && !this.isWithinBounds(prevItem, effectBounds, 160)) continue;
      const type = this.getItemTypeById(prevItem.typeId);
      this.spawnBurst(prevItem.x, prevItem.y, type.accent, 14, 1.4);
      this.spawnShockwave(prevItem.x, prevItem.y, type.accent, prevItem.radius * 0.6, 0.7);
    }
  }

  disconnectOnline() {
    this.online.client?.disconnect();
    this.online.client = null;
    this.online.slotId = null;
    this.online.previousSnapshot = null;
    this.online.snapshot = null;
    this.online.renderedShips.clear();
    this.online.renderedPlanets.clear();
    this.online.renderedDrones.clear();
    this.online.renderedItems.clear();
    this.online.renderedSkillEffects.clear();
    this.online.visualShips.clear();
    this.online.visualPlanets.clear();
    this.online.visualDrones.clear();
    this.online.visualItems.clear();
    this.online.backgroundChunks.clear();
    this.online.planetImpactFxAt.clear();
    this.online.particles = [];
    this.particles = [];
    this.online.inputTimer = 0;
    this.online.lastInput = { x: 0, y: 0, boost: false, repair: false, arc: false };
    this.online.hudTimer = 0;
    this.online.rosterSignature = '';
  }

  queueAutocapture(team, seconds) {
    this.delayedEffects.push({ type: 'autocapture', team, remaining: seconds * 60 });
  }

  neutralizeRandomEnemyPlanet(team) {
    const candidates = this.planets.filter((planet) => planet.owner && planet.owner !== team);
    if (candidates.length) pick(candidates).setNeutral();
  }

  autoCaptureNearestPlanet(team) {
    const mothership = team === 'blue' ? this.blue : this.red;
    const candidates = this.planets.filter((planet) => planet.owner !== team);
    if (!candidates.length) return;
    candidates.sort((a, b) => distance(a.pos, mothership.pos) - distance(b.pos, mothership.pos));
    candidates[0].shatter(team);
  }

  getDroneCount(team) {
    return this.drones.filter((drone) => drone.team === team).length;
  }

  getPlanetCount(team) {
    return this.planets.filter((planet) => planet.owner === team).length;
  }

  getDroneCap(team) {
    return BALANCE.mothership.baseCap + this.getPlanetCount(team) * 10;
  }

  spawnDrone(team, source) {
    const spawnPos = source.getSpawnPosition
      ? source.getSpawnPosition()
      : source.pos.clone().add(Vector2.fromAngle(rand(0, Math.PI * 2), source.radius + 14));
    this.drones.push(new Drone(team, spawnPos.x, spawnPos.y));
    this.spawnBurst(spawnPos.x, spawnPos.y, TEAM_COLORS[team].primary, 6, 1.2);
  }

  spawnItems(tick) {
    this.itemAccumulator += tick;
    if (this.itemAccumulator < BALANCE.item.spawnRate || this.items.length >= BALANCE.item.maxActive) return;
    this.itemAccumulator = 0;
    this.items.push(Item.random(rand(220, WORLD.width - 220), rand(220, WORLD.height - 220)));
  }

  getItemTypeById(itemId) {
    return ITEM_TYPES.find((item) => item.id === itemId) || ITEM_TYPES[0];
  }

  spawnBurst(x, y, color, count, scale = 1) {
    const perfScale = this.isMobilePerformanceMode() ? 0.55 : 1;
    const burstCount = Math.max(3, Math.round(count * perfScale));
    const speedScale = this.isMobilePerformanceMode() ? 0.82 : 1;
    const sizeScale = this.isMobilePerformanceMode() ? 0.84 : 1;
    const maxLife = this.isMobilePerformanceMode() ? 30 : 42;
    for (let i = 0; i < burstCount; i += 1) {
      this.particles.push({
        type: 'spark',
        x,
        y,
        vx: Math.cos((Math.PI * 2 * i) / burstCount + rand(-0.4, 0.4)) * rand(0.4, 2.8) * scale * speedScale,
        vy: Math.sin((Math.PI * 2 * i) / burstCount + rand(-0.4, 0.4)) * rand(0.4, 2.8) * scale * speedScale,
        life: rand(14, maxLife),
        maxLife,
        size: rand(1.5, 4.5) * scale * sizeScale,
        color,
        drag: rand(0.9, 0.95),
      });
    }
  }

  spawnShockwave(x, y, color, radius = 14, scale = 1) {
    const perfScale = this.isMobilePerformanceMode() ? 0.82 : 1;
    this.particles.push({
      type: 'ring',
      x,
      y,
      life: 20 * scale * perfScale,
      maxLife: 20 * scale * perfScale,
      size: radius,
      color,
      growth: 5.5 * scale * perfScale,
      lineWidth: 3.5 * scale * (this.isMobilePerformanceMode() ? 0.8 : 1),
    });
  }

  getPlanetImpactShockwave(planet, impactHeat = 0) {
    const heat = clamp(impactHeat, 0, 8);
    return {
      radius: planet.radius * (0.42 + heat * 0.012),
      scale: 1.18 + heat * 0.055,
    };
  }

  consumePlanetImpactFxCooldown(store, key, cooldownMs = PLANET_IMPACT_FX_COOLDOWN_MS) {
    const lastAt = store.get(key) ?? -Infinity;
    if (this.time - lastAt < cooldownMs) return false;
    store.set(key, this.time);
    return true;
  }

  spawnShipTrail(ship, tick, targetParticles = this.particles, options = {}) {
    const {
      cap = 0,
      intensity = 1,
      countScale = 1,
      shockwave = true,
    } = options;
    const x = ship.pos?.x ?? ship.x ?? 0;
    const y = ship.pos?.y ?? ship.y ?? 0;
    const vx = ship.vel?.x ?? ship.vx ?? 0;
    const vy = ship.vel?.y ?? ship.vy ?? 0;
    const speed = Math.hypot(vx, vy);
    const boostIntensity = ship.boostBlend || 0;

    if (speed < 0.08 && boostIntensity < 0.02) return;

    const angle = ship.angle || 0;
    const radius = ship.radius || BALANCE.mothership.radius;
    const exhaustOffset = radius + 2 + boostIntensity * 6;
    const exhaustX = x - Math.cos(angle) * exhaustOffset;
    const exhaustY = y - Math.sin(angle) * exhaustOffset;
    const laneX = -Math.sin(angle);
    const laneY = Math.cos(angle);
    const plumePower = (1.4 + speed * 0.78 + boostIntensity * 4.4) * intensity;
    const count = Math.min(10, Math.max(1, Math.round(plumePower * tick * countScale)));
    const speedCarry = 0.28 + boostIntensity * 0.12;
    const lifeBonus = boostIntensity * 10 + speed * 2.2;
    const teamColor = ship.color?.primary || TEAM_COLORS[ship.team]?.primary || TEAM_COLORS[ship.slotId]?.primary || '#ffffff';
    const trailTint = hexToRgba(teamColor, 0.78 + boostIntensity * 0.12);

    for (let i = 0; i < count; i += 1) {
      const laneOffset = rand(-6.4, 6.4) * (1 + boostIntensity * 0.55);
      const baseLife = rand(16, 28 + lifeBonus);
      const warmCore = i % 3 === 0;
      const ionPulse = boostIntensity > 0.18 && i % 2 === 1;

      targetParticles.push({
        type: 'spark',
        x: exhaustX + laneX * laneOffset + rand(-2.2, 2.2),
        y: exhaustY + laneY * laneOffset + rand(-2.2, 2.2),
        vx: -Math.cos(angle) * rand(1.8, 4.4 + boostIntensity * 2.8) - vx * speedCarry + laneX * rand(-0.72, 0.72),
        vy: -Math.sin(angle) * rand(1.8, 4.4 + boostIntensity * 2.8) - vy * speedCarry + laneY * rand(-0.72, 0.72),
        life: baseLife,
        maxLife: baseLife,
        size: rand(2.1, 5.8) * (1 + boostIntensity * 0.65) * intensity,
        color: ionPulse
          ? 'rgba(123, 223, 255, 0.88)'
          : warmCore
            ? 'rgba(255, 247, 232, 0.94)'
            : trailTint,
        drag: rand(0.86, 0.94),
      });
    }

    if (shockwave && boostIntensity > 0.28) {
      const shockLife = rand(10, 16);
      targetParticles.push({
        type: 'spark',
        x: exhaustX + rand(-3.5, 3.5),
        y: exhaustY + rand(-3.5, 3.5),
        vx: -Math.cos(angle) * rand(2.8, 5.8 + boostIntensity * 3.2) - vx * 0.16,
        vy: -Math.sin(angle) * rand(2.8, 5.8 + boostIntensity * 3.2) - vy * 0.16,
        life: shockLife,
        maxLife: shockLife,
        size: rand(4.2, 7.4) * (1 + boostIntensity * 0.32) * intensity,
        color: 'rgba(255, 180, 112, 0.42)',
        drag: rand(0.9, 0.95),
      });
    }

    if (cap > 0 && targetParticles.length > cap) {
      targetParticles.splice(0, targetParticles.length - cap);
    }
  }

  drawParticleLayer(ctx, particles, bounds = null) {
    for (const particle of particles) {
      if (bounds && (
        particle.x + (particle.size || 0) < bounds.left
        || particle.x - (particle.size || 0) > bounds.right
        || particle.y + (particle.size || 0) < bounds.top
        || particle.y - (particle.size || 0) > bounds.bottom
      )) {
        continue;
      }

      const alpha = clamp(particle.life / (particle.maxLife || 42), 0, 1);
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
  }

  updateParticleBuffer(buffer, tick, hardCap = 0) {
    let writeIndex = 0;
    for (let readIndex = 0; readIndex < buffer.length; readIndex += 1) {
      const particle = buffer[readIndex];
      particle.x += (particle.vx || 0) * tick;
      particle.y += (particle.vy || 0) * tick;
      if (particle.drag) {
        particle.vx *= Math.pow(particle.drag, tick);
        particle.vy *= Math.pow(particle.drag, tick);
      }
      if (particle.type === 'ring') particle.size += particle.growth * tick;
      particle.life -= tick;
      if (particle.life <= 0) continue;
      buffer[writeIndex] = particle;
      writeIndex += 1;
    }
    buffer.length = writeIndex;
    if (hardCap > 0 && buffer.length > hardCap) {
      buffer.splice(0, buffer.length - hardCap);
    }
  }

  updateParticles(tick) {
    this.updateParticleBuffer(this.particles, tick, this.isMobilePerformanceMode() ? 90 : 280);
  }

  updateStart() {
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
        if (a.team === b.team || !overlapsCircle(a, b)) continue;
        resolveCircleCollision(a, b, 0.5);
        a.takeDamage(0.14 * tick);
        b.takeDamage(0.14 * tick);
      }
    }

    for (const drone of this.drones) {
      const enemyShip = drone.team === 'blue' ? this.red : this.blue;
      if (overlapsCircle(drone, enemyShip, 2)) {
        drone.takeDamage(0.5 * tick);
        enemyShip.takeDamage(0.22 * tick);
      }

      for (const planet of this.planets) {
        if (planet.owner === drone.team) continue;
        if (!overlapsCircle(drone, planet, 2)) continue;
        drone.takeDamage(0.16 * tick);
        planet.takeDamage(0.22 * tick, drone.team);
      }
    }
  }

  handleItems() {
    this.items = this.items.filter((item) => {
      const collector = overlapsCircle(item, this.blue) ? this.blue : overlapsCircle(item, this.red) ? this.red : null;
      if (!collector) return true;
      item.applyEffect(collector, this);
      this.spawnBurst(item.pos.x, item.pos.y, item.type.accent, 16, 1.6);
      this.ui.showPickupNotice?.(collector.team, item.type);
      return false;
    });
  }

  shatterDrone(drone) {
    if (!drone || drone.health <= 0) return;
    drone.destroyedByImpact = true;
    drone.health = 0;
    this.spawnBurst(drone.pos.x, drone.pos.y, TEAM_COLORS[drone.team].primary, 24, 2.1);
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
    this.drones = this.drones.filter((drone) => {
      if (drone.health > 0) return true;
      if (!drone.destroyedByImpact) this.spawnBurst(drone.pos.x, drone.pos.y, TEAM_COLORS[drone.team].primary, 8);
      return false;
    });
  }

  updatePlaying(tick) {
    const blueInput = this.controls.getMoveVector('blue');
    const redInput = this.controls.getMoveVector('red');
    const blueBoost = this.controls.getBoostHeld('blue');
    const redBoost = this.controls.getBoostHeld('red');
    this.blue.onDroneImpact = (drone) => this.shatterDrone(drone);
    this.red.onDroneImpact = (drone) => this.shatterDrone(drone);

    const blueReady = this.blue.update(blueInput, blueBoost, tick, WORLD);
    const redReady = this.red.update(redInput, redBoost, tick, WORLD);
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
        drone.flock(blueDrones, redDrones, this.blue, this.red, this.planets, WORLD, tick, this.time);
      } else {
        drone.flock(redDrones, blueDrones, this.red, this.blue, this.planets, WORLD, tick, this.time);
      }
      drone.pos.x = clamp(drone.pos.x, drone.radius, WORLD.width - drone.radius);
      drone.pos.y = clamp(drone.pos.y, drone.radius, WORLD.height - drone.radius);
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
    }
  }

  syncOnlineRenderState(snapshot) {
    const snapshotItems = snapshot.items || [];
    const snapshotDrones = snapshot.drones || [];
    const snapshotEffects = snapshot.skillEffects || [];
    const activeDroneIds = new Set();
    const activeItemIds = new Set();
    const activeEffectIds = new Set();
    for (const ship of snapshot.ships) {
      const current = this.online.renderedShips.get(ship.slotId);
      if (!current) {
        this.online.renderedShips.set(ship.slotId, {
          ...ship,
          targetX: ship.x,
          targetY: ship.y,
          targetAngle: ship.angle,
          targetVx: ship.vx || 0,
          targetVy: ship.vy || 0,
          turnSpeed: BALANCE.mothership.turnSpeed ?? 0.16,
          turnAcceleration: BALANCE.mothership.turnAcceleration ?? 0.03,
          turnDrag: BALANCE.mothership.turnDrag ?? 0.84,
          angularVelocity: 0,
        });
      } else {
        const isSelf = ship.slotId === this.online.slotId;
        Object.assign(current, ship, isSelf
          ? {
            x: current.x,
            y: current.y,
            angle: current.angle,
            vx: current.vx ?? ship.vx ?? 0,
            vy: current.vy ?? ship.vy ?? 0,
            targetX: ship.x,
            targetY: ship.y,
            targetAngle: ship.angle,
            targetVx: ship.vx || 0,
            targetVy: ship.vy || 0,
            angularVelocity: current.angularVelocity ?? 0,
            turnSpeed: current.turnSpeed ?? BALANCE.mothership.turnSpeed ?? 0.16,
            turnAcceleration: current.turnAcceleration ?? BALANCE.mothership.turnAcceleration ?? 0.03,
            turnDrag: current.turnDrag ?? BALANCE.mothership.turnDrag ?? 0.84,
          }
          : {
            x: current.x,
            y: current.y,
            angle: current.angle,
            targetX: ship.x,
            targetY: ship.y,
            targetAngle: ship.angle,
            targetVx: ship.vx || 0,
            targetVy: ship.vy || 0,
          });
      }
    }
    for (const planet of snapshot.planets) {
      this.online.renderedPlanets.set(planet.id, { ...planet });
    }

    for (const item of snapshotItems) {
      activeItemIds.add(item.id);
      this.online.renderedItems.set(item.id, { ...item });
    }

    for (const drone of snapshotDrones) {
      activeDroneIds.add(drone.id);
      const current = this.online.renderedDrones.get(drone.id);
      if (!current) {
        this.online.renderedDrones.set(drone.id, {
          ...drone,
          targetX: drone.x,
          targetY: drone.y,
          targetHeading: drone.heading,
        });
      } else {
        Object.assign(current, drone, {
          x: current.x,
          y: current.y,
          heading: current.heading,
          targetX: drone.x,
          targetY: drone.y,
          targetHeading: drone.heading,
        });
      }
    }

    for (const effect of snapshotEffects) {
      activeEffectIds.add(effect.id);
      const current = this.online.renderedSkillEffects.get(effect.id);
      if (!current) {
        this.online.renderedSkillEffects.set(effect.id, {
          ...effect,
          targetX: effect.x,
          targetY: effect.y,
          transitionProgress: effect.type === 'arc-strike' && effect.phase === 'seek' ? 1 : 0,
        });
      } else {
        if (effect.type === 'arc-strike' && current.phase !== effect.phase && effect.phase === 'seek') {
          const owner = this.online.renderedShips.get(effect.ownerSlotId);
          current.transitionProgress = 0;
          current.transitionCenterX = owner?.x ?? current.x;
          current.transitionCenterY = owner?.y ?? current.y;
          current.transitionRadius = Math.max(
            24,
            Math.hypot((current.x ?? effect.x) - (owner?.x ?? current.x), (current.y ?? effect.y) - (owner?.y ?? current.y)),
          );
          current.transitionAngle = Math.atan2(
            (current.y ?? effect.y) - (owner?.y ?? current.y),
            (current.x ?? effect.x) - (owner?.x ?? current.x),
          );
        }
        Object.assign(current, effect, {
          x: current.x,
          y: current.y,
          targetX: effect.x,
          targetY: effect.y,
        });
      }
    }

    for (const droneId of this.online.renderedDrones.keys()) {
      if (!activeDroneIds.has(droneId)) {
        this.online.renderedDrones.delete(droneId);
      }
    }

    for (const itemId of this.online.renderedItems.keys()) {
      if (!activeItemIds.has(itemId)) {
        this.online.renderedItems.delete(itemId);
      }
    }

    for (const effectId of this.online.renderedSkillEffects.keys()) {
      if (!activeEffectIds.has(effectId)) {
        this.online.renderedSkillEffects.delete(effectId);
      }
    }
  }
  syncOnlineVisuals() {
    const perfMode = this.isMobilePerformanceMode();
    const syncBounds = perfMode ? this.getVisibleWorldBounds(ONLINE_WORLD) : null;
    for (const ship of this.online.renderedShips.values()) {
      if (perfMode && ship.slotId !== this.online.slotId && !this.isWithinBounds(ship, syncBounds, 280)) {
        this.online.visualShips.delete(ship.slotId);
        continue;
      }
      let visual = this.online.visualShips.get(ship.slotId);
      if (!visual) {
        visual = new Mothership(ship.slotId, ship.x, ship.y);
        this.online.visualShips.set(ship.slotId, visual);
      }
      visual.pos.set(ship.x, ship.y);
      visual.vel.set(ship.vx || 0, ship.vy || 0);
      visual.angle = ship.angle || 0;
      visual.health = ship.health;
      visual.maxHealth = ship.maxHealth;
      visual.radius = ship.radius;
      visual.boostBlend = ship.boostBlend || 0;
      visual.team = ship.slotId;
      visual.color = TEAM_COLORS[ship.slotId];
      visual.auraRotationA += 0.015;
      visual.auraRotationB -= 0.011;
      visual.thrusterPulse += 0.18;
    }

    for (const slotId of this.online.visualShips.keys()) {
      if (!this.online.renderedShips.has(slotId)) this.online.visualShips.delete(slotId);
    }

    for (const planet of this.online.renderedPlanets.values()) {
      if (perfMode && !this.isWithinBounds(planet, syncBounds, 360)) {
        this.online.visualPlanets.delete(planet.id);
        continue;
      }
      let visual = this.online.visualPlanets.get(planet.id);
      if (!visual) {
        visual = new Planet(planet.x, planet.y, planet.radius);
        visual.fragments = visual.fragments.slice(0, 18);
        this.online.visualPlanets.set(planet.id, visual);
      }
      visual.pos.set(planet.x, planet.y);
      visual.radius = planet.radius;
      visual.owner = planet.ownerSlotId;
      visual.pendingOwner = planet.pendingOwnerSlotId;
      visual.maxHealth = planet.maxHealth;
      visual.health = planet.health;
      visual.impactHeat = planet.impactHeat;
      visual.rebuildTimer = planet.rebuildTimer;
      visual.rebuildDuration = planet.rebuildDuration;
      visual.revealTimer = planet.revealTimer;
      visual.revealDuration = planet.revealDuration;
      visual.texturePhase = planet.pendingOwnerSlotId
        ? 'base'
        : planet.ownerSlotId
          ? getOnlinePlanetTextureForOwner(planet.ownerSlotId)
          : 'base';
      visual.ringAngle += 0.0045;
      visual.ringTiltPhase += 0.011;
      visual.pulse += 0.02;
    }

    for (const planetId of this.online.visualPlanets.keys()) {
      if (!this.online.renderedPlanets.has(planetId)) this.online.visualPlanets.delete(planetId);
    }

    for (const drone of this.online.renderedDrones.values()) {
      if (perfMode && !this.isWithinBounds(drone, syncBounds, 180)) {
        this.online.visualDrones.delete(drone.id);
        continue;
      }
      let visual = this.online.visualDrones.get(drone.id);
      if (!visual) {
        visual = new Drone(drone.ownerSlotId, drone.x, drone.y);
        this.online.visualDrones.set(drone.id, visual);
      }
      visual.pos.set(drone.x, drone.y);
      visual.vel.set(drone.vx || 0, drone.vy || 0);
      visual.heading = drone.heading || 0;
      visual.health = drone.health;
      visual.maxHealth = drone.maxHealth;
      visual.radius = drone.radius;
      visual.baseRadius = drone.radius;
      visual.team = drone.ownerSlotId;
      visual.color = TEAM_COLORS[drone.ownerSlotId];
    }

    for (const droneId of this.online.visualDrones.keys()) {
      if (!this.online.renderedDrones.has(droneId)) this.online.visualDrones.delete(droneId);
    }

    for (const item of this.online.renderedItems.values()) {
      if (perfMode && !this.isWithinBounds(item, syncBounds, 140)) {
        this.online.visualItems.delete(item.id);
        continue;
      }
      let visual = this.online.visualItems.get(item.id);
      if (!visual) {
        visual = new Item(item.x, item.y, this.getItemTypeById(item.typeId));
        this.online.visualItems.set(item.id, visual);
      }
      visual.pos.set(item.x, item.y);
      visual.radius = item.radius;
      visual.type = this.getItemTypeById(item.typeId);
      visual.pulse += 0.05;
    }

    for (const itemId of this.online.visualItems.keys()) {
      if (!this.online.renderedItems.has(itemId)) this.online.visualItems.delete(itemId);
    }
  }

  spawnOnlineShipTrail(ship, tick, bounds = null) {
    if (ship.respawnFrames > 0) return;
    if (this.isMobilePerformanceMode() && !this.isWithinBounds(ship, bounds, 180)) return;
    this.spawnShipTrail(ship, tick, this.online.particles, {
      cap: this.isMobilePerformanceMode() ? 80 : 300,
      intensity: this.isMobilePerformanceMode() ? 0.68 : 1.08,
      countScale: this.isMobilePerformanceMode() ? 0.3 : 1,
      shockwave: !this.isMobilePerformanceMode(),
    });
  }

  getOnlineShipSpeedMultiplier(ship) {
    if (!(ship.buffs || []).some((buff) => buff.type === 'shipSpeed')) return 1;
    return 1.5;
  }

  predictOnlineControlledShip(ship, input, tick) {
    ship.turnSpeed ??= BALANCE.mothership.turnSpeed ?? 0.16;
    ship.turnAcceleration ??= BALANCE.mothership.turnAcceleration ?? 0.03;
    ship.turnDrag ??= BALANCE.mothership.turnDrag ?? 0.84;
    ship.angularVelocity ??= 0;
    ship.vx ??= 0;
    ship.vy ??= 0;

    const moving = Math.hypot(input.x, input.y) > 0.08;
    const boosting = input.boost && moving;
    const boostEase = 1 - Math.pow(1 - 0.18, tick);
    ship.boostBlend = clamp((ship.boostBlend || 0) + ((boosting ? 1 : 0) - (ship.boostBlend || 0)) * boostEase, 0, 1);

    const driveMultiplier = this.getOnlineShipSpeedMultiplier(ship) * (1 + ship.boostBlend * 0.78);
    if (moving) {
      ship.vx += input.x * 0.2 * driveMultiplier * tick;
      ship.vy += input.y * 0.2 * driveMultiplier * tick;
      const targetAngle = getStableMoveAngle(input.x, input.y, ship.angle || 0);
      const angleDelta = normalizeAngle(targetAngle - (ship.angle || 0));
      const steerForce = clamp(
        angleDelta * ship.turnAcceleration * driveMultiplier,
        -ship.turnAcceleration * 2.2,
        ship.turnAcceleration * 2.2,
      );
      ship.angularVelocity += steerForce * tick;
      const maxTurn = ship.turnSpeed * driveMultiplier;
      ship.angularVelocity = clamp(ship.angularVelocity, -maxTurn, maxTurn);
    }

    ship.angle += ship.angularVelocity * tick;
    ship.angularVelocity *= Math.pow(ship.turnDrag, tick);
    ship.angle = normalizeAngle(ship.angle);
    ship.vx *= Math.pow(0.95, tick);
    ship.vy *= Math.pow(0.95, tick);

    const speedLimit = 3.1 * driveMultiplier;
    const speed = Math.hypot(ship.vx, ship.vy);
    if (speed > speedLimit) {
      ship.vx = (ship.vx / speed) * speedLimit;
      ship.vy = (ship.vy / speed) * speedLimit;
    }

    ship.x = clamp(ship.x + ship.vx * tick, ship.radius, ONLINE_WORLD.width - ship.radius);
    ship.y = clamp(ship.y + ship.vy * tick, ship.radius, ONLINE_WORLD.height - ship.radius);
  }

  reconcileOnlineControlledShip(ship) {
    const errorX = (ship.targetX ?? ship.x) - ship.x;
    const errorY = (ship.targetY ?? ship.y) - ship.y;
    const errorDistance = Math.hypot(errorX, errorY);
    const correction = errorDistance > 220 ? 0.24 : errorDistance > 90 ? 0.14 : 0.08;
    ship.x += errorX * correction;
    ship.y += errorY * correction;
    ship.vx = lerp(ship.vx || 0, ship.targetVx ?? ship.vx ?? 0, correction * 0.85);
    ship.vy = lerp(ship.vy || 0, ship.targetVy ?? ship.vy ?? 0, correction * 0.85);
    ship.angle = normalizeAngle(lerpAngle(ship.angle, ship.targetAngle ?? ship.angle, correction * 0.45));
  }

  updateOnlineParticles(tick) {
    this.updateParticleBuffer(this.online.particles, tick, this.isMobilePerformanceMode() ? 80 : 300);
  }

  updateOnline(delta) {
    const tick = Math.min(2.5, delta / (1000 / 60));
    const input = this.controls.getOnlineInput();
    const snapshot = this.online.snapshot;
    if (snapshot) {
      const perfMode = this.isMobilePerformanceMode();
      const updateBounds = perfMode ? this.getVisibleWorldBounds(ONLINE_WORLD) : null;
      for (const ship of snapshot.ships) {
        const rendered = this.online.renderedShips.get(ship.slotId);
        if (!rendered) continue;
        const isSelf = ship.slotId === this.online.slotId;
        if (isSelf && rendered.respawnFrames <= 0) {
          Object.assign(rendered, ship, {
            x: rendered.x,
            y: rendered.y,
            angle: rendered.angle,
            vx: rendered.vx ?? 0,
            vy: rendered.vy ?? 0,
            targetX: rendered.targetX ?? ship.x,
            targetY: rendered.targetY ?? ship.y,
            targetAngle: rendered.targetAngle ?? ship.angle,
            targetVx: rendered.targetVx ?? ship.vx ?? 0,
            targetVy: rendered.targetVy ?? ship.vy ?? 0,
            angularVelocity: rendered.angularVelocity ?? 0,
          });
          this.predictOnlineControlledShip(rendered, input, tick);
          this.reconcileOnlineControlledShip(rendered);
        } else if (perfMode && !this.isWithinBounds(ship, updateBounds, 240)) {
          Object.assign(rendered, ship, {
            x: ship.x,
            y: ship.y,
            angle: ship.angle,
            vx: ship.vx || 0,
            vy: ship.vy || 0,
            targetX: ship.x,
            targetY: ship.y,
            targetAngle: ship.angle,
            targetVx: ship.vx || 0,
            targetVy: ship.vy || 0,
          });
        } else {
          rendered.x = lerp(rendered.x, rendered.targetX ?? ship.x, 0.18);
          rendered.y = lerp(rendered.y, rendered.targetY ?? ship.y, 0.18);
          rendered.angle = lerpAngle(rendered.angle, rendered.targetAngle ?? ship.angle, 0.18);
          Object.assign(rendered, ship, {
            x: rendered.x,
            y: rendered.y,
            angle: rendered.angle,
            targetX: rendered.targetX ?? ship.x,
            targetY: rendered.targetY ?? ship.y,
            targetAngle: rendered.targetAngle ?? ship.angle,
          });
        }
        this.spawnOnlineShipTrail(rendered, tick, updateBounds);
      }

      for (const drone of snapshot.drones || []) {
        const renderedDrone = this.online.renderedDrones.get(drone.id);
        if (!renderedDrone) continue;
        if (perfMode && !this.isWithinBounds(drone, updateBounds, 180)) {
          Object.assign(renderedDrone, drone, {
            x: drone.x,
            y: drone.y,
            heading: drone.heading,
            targetX: drone.x,
            targetY: drone.y,
            targetHeading: drone.heading,
          });
          continue;
        }
        renderedDrone.x = lerp(renderedDrone.x, renderedDrone.targetX ?? drone.x, 0.35);
        renderedDrone.y = lerp(renderedDrone.y, renderedDrone.targetY ?? drone.y, 0.35);
        renderedDrone.heading = lerp(renderedDrone.heading, renderedDrone.targetHeading ?? drone.heading, 0.35);
        Object.assign(renderedDrone, drone, {
          x: renderedDrone.x,
          y: renderedDrone.y,
          heading: renderedDrone.heading,
          targetX: renderedDrone.targetX ?? drone.x,
          targetY: renderedDrone.targetY ?? drone.y,
          targetHeading: renderedDrone.targetHeading ?? drone.heading,
        });
      }

      for (const effect of snapshot.skillEffects || []) {
        const renderedEffect = this.online.renderedSkillEffects.get(effect.id);
        if (!renderedEffect) continue;
        if (effect.type !== 'arc-strike') {
          Object.assign(renderedEffect, effect, {
            x: effect.x,
            y: effect.y,
            targetX: effect.x,
            targetY: effect.y,
            transitionProgress: 0,
          });
          continue;
        }
        if (perfMode && !this.isWithinBounds(effect, updateBounds, 220)) {
          Object.assign(renderedEffect, effect, {
            x: effect.x,
            y: effect.y,
            targetX: effect.x,
            targetY: effect.y,
          });
          renderedEffect.transitionProgress = effect.phase === 'seek' ? 1 : 0;
          continue;
        }
        renderedEffect.x = lerp(renderedEffect.x, renderedEffect.targetX ?? effect.x, 0.32);
        renderedEffect.y = lerp(renderedEffect.y, renderedEffect.targetY ?? effect.y, 0.32);
        if (renderedEffect.phase === 'seek') {
          renderedEffect.transitionProgress = Math.min(1, (renderedEffect.transitionProgress ?? 0) + tick / 18);
        } else {
          renderedEffect.transitionProgress = 0;
        }
        Object.assign(renderedEffect, effect, {
          x: renderedEffect.x,
          y: renderedEffect.y,
          targetX: renderedEffect.targetX ?? effect.x,
          targetY: renderedEffect.targetY ?? effect.y,
        });
      }

      this.updateParticles(tick);
      this.updateOnlineParticles(tick);
      this.syncOnlineVisuals();
      this.updateOnlineCamera(tick);
      this.online.hudTimer += delta;
      if (this.online.hudTimer >= (perfMode ? 260 : 180)) {
        this.online.hudTimer = 0;
        this.ui.updateOnlineHud(snapshot, this.online.slotId);
      }
    }

    this.online.inputTimer += delta;
    const changed = Math.abs(input.x - this.online.lastInput.x) > 0.02
      || Math.abs(input.y - this.online.lastInput.y) > 0.02
      || input.boost !== this.online.lastInput.boost
      || input.repair !== this.online.lastInput.repair
      || input.arc !== this.online.lastInput.arc;
    if (this.online.client && (changed || this.online.inputTimer > 60)) {
      this.online.lastInput = { ...input };
      this.online.inputTimer = 0;
      this.online.client.sendInput({
        x: Number(input.x.toFixed(3)),
        y: Number(input.y.toFixed(3)),
        boost: input.boost,
        repair: input.repair,
        arc: input.arc,
      });
    }
  }

  getOnlineCameraTargetZoom() {
    return Math.max(
      this.viewportWidth / ONLINE_CAMERA_VIEW.width,
      this.viewportHeight / ONLINE_CAMERA_VIEW.height,
    );
  }

  updateOnlineCamera(tick) {
    const target = this.online.renderedShips.get(this.online.slotId) || this.online.renderedShips.values().next().value;
    if (!target) {
      this.camera.updateShake(tick);
      return;
    }
    const focus = target.respawnFrames > 0 && target.slotId
      ? getOnlineSpawnPoint(Number.parseInt(target.slotId.split('-')[1], 10) - 1)
      : target;
    const followEase = 1 - Math.pow(1 - 0.2, tick);
    this.camera.position.x = lerp(this.camera.position.x, focus.x, followEase);
    this.camera.position.y = lerp(this.camera.position.y, focus.y, followEase);
    this.camera.zoom = lerp(this.camera.zoom, this.getOnlineCameraTargetZoom(), 1 - Math.pow(1 - 0.12, tick));
    const halfWidth = this.viewportWidth / this.camera.zoom / 2;
    const halfHeight = this.viewportHeight / this.camera.zoom / 2;
    const safeOffsetX = Math.max(36, halfWidth * 0.2);
    const safeOffsetY = Math.max(36, halfHeight * 0.2);
    this.camera.position.x = clamp(this.camera.position.x, focus.x - safeOffsetX, focus.x + safeOffsetX);
    this.camera.position.y = clamp(this.camera.position.y, focus.y - safeOffsetY, focus.y + safeOffsetY);
    this.camera.position.x = clamp(this.camera.position.x, halfWidth, ONLINE_WORLD.width - halfWidth);
    this.camera.position.y = clamp(this.camera.position.y, halfHeight, ONLINE_WORLD.height - halfHeight);
    this.camera.updateShake(tick);
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
      itemCap: BALANCE.item.maxActive,
    };
  }

  getVisibleWorldBounds(world) {
    const halfWidth = this.viewportWidth / this.camera.zoom / 2;
    const halfHeight = this.viewportHeight / this.camera.zoom / 2;
    return {
      left: clamp(this.camera.position.x - halfWidth - 96, 0, world.width),
      right: clamp(this.camera.position.x + halfWidth + 96, 0, world.width),
      top: clamp(this.camera.position.y - halfHeight - 96, 0, world.height),
      bottom: clamp(this.camera.position.y + halfHeight + 96, 0, world.height),
    };
  }

  getOnlineBackgroundChunk(chunkX, chunkY) {
    const key = `${chunkX}:${chunkY}`;
    const cached = this.online.backgroundChunks.get(key);
    if (cached) return cached;

    const chunkCanvas = document.createElement('canvas');
    chunkCanvas.width = ONLINE_CHUNK_SIZE;
    chunkCanvas.height = ONLINE_CHUNK_SIZE;
    const chunkCtx = chunkCanvas.getContext('2d');
    const worldX = chunkX * ONLINE_CHUNK_SIZE;
    const worldY = chunkY * ONLINE_CHUNK_SIZE;

    chunkCtx.fillStyle = 'rgba(5, 12, 20, 0.92)';
    chunkCtx.fillRect(0, 0, ONLINE_CHUNK_SIZE, ONLINE_CHUNK_SIZE);

    const glow = chunkCtx.createRadialGradient(
      ONLINE_CHUNK_SIZE * 0.35,
      ONLINE_CHUNK_SIZE * 0.35,
      0,
      ONLINE_CHUNK_SIZE * 0.35,
      ONLINE_CHUNK_SIZE * 0.35,
      ONLINE_CHUNK_SIZE * 0.75,
    );
    glow.addColorStop(0, 'rgba(79, 212, 255, 0.05)');
    glow.addColorStop(1, 'rgba(79, 212, 255, 0)');
    chunkCtx.fillStyle = glow;
    chunkCtx.fillRect(0, 0, ONLINE_CHUNK_SIZE, ONLINE_CHUNK_SIZE);

    chunkCtx.strokeStyle = 'rgba(126, 184, 227, 0.06)';
    chunkCtx.lineWidth = 1;

    const startGridX = Math.floor(worldX / 120) * 120;
    for (let x = startGridX; x <= worldX + ONLINE_CHUNK_SIZE; x += 120) {
      const localX = x - worldX;
      chunkCtx.beginPath();
      chunkCtx.moveTo(localX, 0);
      chunkCtx.lineTo(localX, ONLINE_CHUNK_SIZE);
      chunkCtx.stroke();
    }

    const startGridY = Math.floor(worldY / 120) * 120;
    for (let y = startGridY; y <= worldY + ONLINE_CHUNK_SIZE; y += 120) {
      const localY = y - worldY;
      chunkCtx.beginPath();
      chunkCtx.moveTo(0, localY);
      chunkCtx.lineTo(ONLINE_CHUNK_SIZE, localY);
      chunkCtx.stroke();
    }

    this.online.backgroundChunks.set(key, chunkCanvas);
    return chunkCanvas;
  }

  drawOnlineChunkedBackground(ctx) {
    const bounds = this.getVisibleWorldBounds(ONLINE_WORLD);
    const startChunkX = Math.floor(bounds.left / ONLINE_CHUNK_SIZE);
    const endChunkX = Math.floor(bounds.right / ONLINE_CHUNK_SIZE);
    const startChunkY = Math.floor(bounds.top / ONLINE_CHUNK_SIZE);
    const endChunkY = Math.floor(bounds.bottom / ONLINE_CHUNK_SIZE);

    for (let chunkY = startChunkY; chunkY <= endChunkY; chunkY += 1) {
      for (let chunkX = startChunkX; chunkX <= endChunkX; chunkX += 1) {
        const canvas = this.getOnlineBackgroundChunk(chunkX, chunkY);
        ctx.drawImage(canvas, chunkX * ONLINE_CHUNK_SIZE, chunkY * ONLINE_CHUNK_SIZE);
      }
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, ONLINE_WORLD.width, ONLINE_WORLD.height);
  }

  renderBackground(focusA, focusB) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);
    const sky = ctx.createLinearGradient(0, 0, this.viewportWidth, this.viewportHeight);
    sky.addColorStop(0, '#010204');
    sky.addColorStop(0.5, '#07111a');
    sky.addColorStop(1, '#04070d');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);

    for (const target of [focusA, focusB].filter(Boolean)) {
      const glow = this.camera.worldToScreen(target.x, target.y, { width: this.viewportWidth, height: this.viewportHeight });
      const bloom = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, this.viewportWidth * 0.24);
      bloom.addColorStop(0, `${target.color}22`);
      bloom.addColorStop(1, `${target.color}00`);
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);
    }

    const starStep = this.isMobilePerformanceMode() ? 3 : 1;
    for (let index = 0; index < this.stars.length; index += starStep) {
      const star = this.stars[index];
      const x = (star.x - this.camera.position.x) * star.depth * this.camera.zoom + this.viewportWidth * 0.5;
      const y = (star.y - this.camera.position.y) * star.depth * this.camera.zoom + this.viewportHeight * 0.5;
      if (x < -10 || x > this.viewportWidth + 10 || y < -10 || y > this.viewportHeight + 10) continue;
      ctx.fillStyle = `rgba(219, 240, 255, ${star.alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, star.size * star.depth, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderLocalWorld() {
    const ctx = this.ctx;
    this.camera.apply(ctx, { width: this.viewportWidth, height: this.viewportHeight });
    ctx.fillStyle = 'rgba(5, 12, 20, 0.92)';
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    ctx.strokeStyle = 'rgba(126, 184, 227, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= WORLD.width; x += WORLD.grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, WORLD.height);
      ctx.stroke();
    }
    for (let y = 0; y <= WORLD.height; y += WORLD.grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WORLD.width, y);
      ctx.stroke();
    }
    this.planets.forEach((planet) => planet.draw(ctx));
    this.items.forEach((item) => item.draw(ctx));
    this.drones.forEach((drone) => drone.draw(ctx));
    this.blue.draw(ctx);
    this.red.draw(ctx);
    this.drawParticleLayer(ctx, this.particles);
    this.camera.restore(ctx);
  }

  renderOnlineWorld() {
    const ctx = this.ctx;
    this.camera.apply(ctx, { width: this.viewportWidth, height: this.viewportHeight });
    const bounds = this.getVisibleWorldBounds(ONLINE_WORLD);
    this.drawOnlineChunkedBackground(ctx);

    for (const planet of this.online.renderedPlanets.values()) {
      if (
        planet.x + planet.radius < bounds.left
        || planet.x - planet.radius > bounds.right
        || planet.y + planet.radius < bounds.top
        || planet.y - planet.radius > bounds.bottom
      ) {
        continue;
      }

      const visualPlanet = this.online.visualPlanets.get(planet.id);
      if (visualPlanet) {
        visualPlanet.draw(ctx);
      }
    }

    for (const item of this.online.renderedItems.values()) {
      if (
        item.x + item.radius < bounds.left
        || item.x - item.radius > bounds.right
        || item.y + item.radius < bounds.top
        || item.y - item.radius > bounds.bottom
      ) {
        continue;
      }

      const visualItem = this.online.visualItems.get(item.id);
      if (visualItem) visualItem.draw(ctx);
    }

    for (const drone of this.online.renderedDrones.values()) {
      if (
        drone.x + drone.radius < bounds.left
        || drone.x - drone.radius > bounds.right
        || drone.y + drone.radius < bounds.top
        || drone.y - drone.radius > bounds.bottom
      ) {
        continue;
      }
      const visualDrone = this.online.visualDrones.get(drone.id);
      if (visualDrone) visualDrone.draw(ctx);
    }

    for (const ship of this.online.renderedShips.values()) {
      if (
        ship.x + ship.radius < bounds.left
        || ship.x - ship.radius > bounds.right
        || ship.y + ship.radius < bounds.top
        || ship.y - ship.radius > bounds.bottom
      ) {
        continue;
      }
      const visualShip = this.online.visualShips.get(ship.slotId);
      if (visualShip && ship.respawnFrames <= 0) {
        if ((ship.arcChargeLevel || 0) > 0.02) {
          this.drawOnlineArcCharge(ctx, ship);
        }
        visualShip.draw(ctx);
        if ((ship.repairFlash || 0) > 0) {
          this.drawOnlineRepairFlash(ctx, ship);
        }
        if (ship.slotId === this.online.slotId) {
          ctx.save();
          ctx.translate(ship.x, ship.y);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, ship.radius + 14, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
          ctx.font = '700 14px Aptos, Segoe UI, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('YOU', 0, -ship.radius - 22);
          ctx.restore();
        }
      }
    }

    this.drawOnlineLockedTargetHud(ctx, bounds);
    this.drawOnlineSkillEffects(ctx, bounds);
    this.renderOnlineRespawnIndicators(ctx, bounds);
    this.drawParticleLayer(ctx, this.particles, bounds);
    this.drawParticleLayer(ctx, this.online.particles, bounds);
    this.camera.restore(ctx);
  }

  drawOnlineArcCharge(ctx, ship) {
    const level = clamp(ship.arcChargeLevel || 0, 0, 1);
    if (level <= 0) return;

    const accent = ship.theme?.primary || TEAM_COLORS[ship.slotId]?.primary || '#8de0ff';
    const orbCount = 2 + Math.round(level * 7);
    const orbitRadius = ship.radius + 12 + level * 22;
    const spin = this.time * (0.004 + level * 0.0035);

    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.strokeStyle = hexToRgba(accent, 0.18 + level * 0.2);
    ctx.lineWidth = 1.5 + level * 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, orbitRadius * (0.92 + level * 0.08), 0, Math.PI * 2);
    ctx.stroke();

    for (let index = 0; index < orbCount; index += 1) {
      const angle = spin + (Math.PI * 2 * index) / orbCount;
      const pulse = 0.82 + (Math.sin(spin * 3.4 + index * 1.7) + 1) * 0.12;
      const x = Math.cos(angle) * orbitRadius * pulse;
      const y = Math.sin(angle) * orbitRadius * pulse;
      const size = 2.8 + level * 4.8 + (index % 2) * 0.7;
      ctx.fillStyle = hexToRgba(accent, 0.22 + level * 0.2);
      ctx.beginPath();
      ctx.arc(x, y, size * 1.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawOnlineRepairFlash(ctx, ship) {
    const accent = ship.theme?.primary || TEAM_COLORS[ship.slotId]?.primary || '#8de0ff';
    const alpha = clamp((ship.repairFlash || 0) / 26, 0, 1);
    const pulse = 1 + (1 - alpha) * 0.55;
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.strokeStyle = hexToRgba(accent, 0.92 * alpha);
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, (ship.radius + 18) * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = hexToRgba(accent, 0.22 * alpha);
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.arc(0, 0, (ship.radius + 18) * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawOnlineLockedTargetHud(ctx, bounds) {
    let activeEffect = null;
    for (const entry of this.online.renderedSkillEffects.values()) {
      if ((entry.type === 'arc-strike' || entry.type === 'arc-orb') && entry.ownerSlotId === this.online.slotId && entry.targetSlotId) {
        activeEffect = entry;
        break;
      }
    }

    let target = null;
    let alpha = 1;

    if (activeEffect) {
      const activeTarget = this.online.renderedShips.get(activeEffect.targetSlotId);
      if (activeTarget && activeTarget.respawnFrames <= 0 && activeTarget.health > 0) {
        this.online.lockedTargetHud = {
          slotId: activeTarget.slotId,
          holdFrames: ONLINE_LOCKED_TARGET_HOLD_FRAMES,
          fadeFrames: ONLINE_LOCKED_TARGET_FADE_FRAMES,
          fadeMax: ONLINE_LOCKED_TARGET_FADE_FRAMES,
        };
        target = activeTarget;
      }
    }

    if (!target && this.online.lockedTargetHud) {
      const cached = this.online.lockedTargetHud;
      const cachedTarget = this.online.renderedShips.get(cached.slotId);
      if (!cachedTarget || cachedTarget.respawnFrames > 0 || cachedTarget.health <= 0) {
        this.online.lockedTargetHud = null;
        return;
      }
      if (cached.holdFrames > 0) cached.holdFrames -= 1;
      else cached.fadeFrames = Math.max(0, cached.fadeFrames - 1);
      if (cached.holdFrames <= 0 && cached.fadeFrames <= 0) {
        this.online.lockedTargetHud = null;
        return;
      }
      alpha = cached.holdFrames > 0 ? 1 : clamp(cached.fadeFrames / (cached.fadeMax || ONLINE_LOCKED_TARGET_FADE_FRAMES), 0, 1);
      target = cachedTarget;
    }

    if (!target) return;
    if (
      target.x + target.radius < bounds.left
      || target.x - target.radius > bounds.right
      || target.y + target.radius < bounds.top
      || target.y - target.radius > bounds.bottom
    ) {
      return;
    }

    const accent = target.theme?.primary || TEAM_COLORS[target.slotId]?.primary || '#ff8a7a';
    const barWidth = 84;
    const barHeight = 8;
    const y = target.y - target.radius - 34;
    const healthRatio = clamp(target.health / target.maxHealth, 0, 1);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(target.x, y);

    ctx.fillStyle = 'rgba(5, 10, 16, 0.82)';
    ctx.strokeStyle = hexToRgba(accent, 0.7);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(-52, -20, 104, 16, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = hexToRgba(accent, 0.94);
    ctx.font = '700 9px Trebuchet MS, Aptos, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`LOCK ${target.badge}`, 0, -9);

    ctx.fillStyle = 'rgba(6, 12, 20, 0.9)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-barWidth * 0.5, 0, barWidth, barHeight, 999);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.roundRect(-barWidth * 0.5, 0, Math.max(0, barWidth * healthRatio), barHeight, 999);
    ctx.fill();

    ctx.fillStyle = 'rgba(247, 251, 255, 0.96)';
    ctx.font = '700 10px Trebuchet MS, Aptos, sans-serif';
    ctx.fillText(`${Math.ceil(target.health)}/${target.maxHealth}`, 0, 22);

    ctx.strokeStyle = hexToRgba(accent, 0.92);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-target.radius - 10, 2);
    ctx.lineTo(-target.radius - 3, 2);
    ctx.moveTo(target.radius + 10, 2);
    ctx.lineTo(target.radius + 3, 2);
    ctx.stroke();

    ctx.restore();
  }
  drawOnlineSkillEffects(ctx, bounds) {
    for (const effect of this.online.renderedSkillEffects.values()) {
      const owner = this.online.renderedShips.get(effect.ownerSlotId);
      const accent = owner?.theme?.primary || TEAM_COLORS[effect.ownerSlotId]?.primary || '#ffffff';

      if (effect.type === 'arc-orb') {
        const orbRadius = Math.max(10, effect.radius || effect.width || 12);
        const tailLength = effect.phase === 'seek'
          ? orbRadius * (2.6 + (effect.chargeRatio || 0) * 2.2)
          : orbRadius * 1.3;
        const tailX = effect.x - (effect.dx || 0) * tailLength;
        const tailY = effect.y - (effect.dy || 0) * tailLength;
        const minX = Math.min(effect.x, tailX) - orbRadius * 3;
        const maxX = Math.max(effect.x, tailX) + orbRadius * 3;
        const minY = Math.min(effect.y, tailY) - orbRadius * 3;
        const maxY = Math.max(effect.y, tailY) + orbRadius * 3;
        if (maxX < bounds.left || minX > bounds.right || maxY < bounds.top || minY > bounds.bottom) continue;

        ctx.save();
        ctx.globalAlpha = effect.phase === 'pause' ? 0.94 : 1;

        if (effect.phase === 'seek') {
          const trail = ctx.createLinearGradient(tailX, tailY, effect.x, effect.y);
          trail.addColorStop(0, hexToRgba(accent, 0));
          trail.addColorStop(0.45, hexToRgba(accent, 0.22));
          trail.addColorStop(1, hexToRgba(accent, 0.92));
          ctx.strokeStyle = trail;
          ctx.lineCap = 'round';
          ctx.lineWidth = orbRadius * 1.25;
          ctx.shadowBlur = 18 + orbRadius * 1.6;
          ctx.shadowColor = hexToRgba(accent, 0.58);
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(effect.x, effect.y);
          ctx.stroke();
        }

        ctx.translate(effect.x, effect.y);
        const pulse = 0.9 + Math.sin(this.time * 0.015 + (effect.chargeRatio || 0) * Math.PI) * 0.08;
        const glowRadius = orbRadius * (1.8 + (effect.phase === 'pause' ? 0.35 : 0));
        ctx.fillStyle = hexToRgba(accent, 0.2);
        ctx.beginPath();
        ctx.arc(0, 0, glowRadius * pulse, 0, Math.PI * 2);
        ctx.fill();

        if (effect.phase === 'pause') {
          ctx.strokeStyle = hexToRgba(accent, 0.42);
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(0, 0, orbRadius * (1.8 + (effect.chargeRatio || 0) * 0.4), 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.shadowBlur = 24 + orbRadius * 1.8;
        ctx.shadowColor = hexToRgba(accent, 0.72);
        ctx.fillStyle = hexToRgba(accent, 0.9);
        ctx.beginPath();
        ctx.arc(0, 0, orbRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
        ctx.beginPath();
        ctx.arc(-orbRadius * 0.25, -orbRadius * 0.28, Math.max(2.5, orbRadius * 0.34), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        continue;
      }

      if (!owner) continue;
      const orbitRadius = Math.max(
        24,
        effect.phase === 'orbit'
          ? Math.hypot(effect.x - owner.x, effect.y - owner.y)
          : effect.transitionRadius || Math.hypot(effect.x - owner.x, effect.y - owner.y),
      );
      const maxRadius = effect.phase === 'orbit'
        ? orbitRadius * 1.45
        : Math.max(effect.length, orbitRadius * 1.3, 18);
      if (
        effect.x + maxRadius < bounds.left
        || effect.x - maxRadius > bounds.right
        || effect.y + maxRadius < bounds.top
        || effect.y - maxRadius > bounds.bottom
      ) {
        continue;
      }

      const orbitAngle = Math.atan2(
        effect.phase === 'orbit' ? effect.y - owner.y : effect.dy || 0,
        effect.phase === 'orbit' ? effect.x - owner.x : effect.dx || 1,
      );
      const orbitSpan = Math.PI * 0.92;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.shadowBlur = effect.phase === 'seek' ? 26 : 18;
      ctx.shadowColor = hexToRgba(accent, 0.72);
      ctx.strokeStyle = hexToRgba(accent, effect.phase === 'seek' ? 0.96 : 0.82);
      ctx.lineWidth = (effect.width || 6) + (effect.phase === 'seek' ? 1.4 : 0);
      ctx.beginPath();
      if (effect.phase === 'orbit') {
        ctx.arc(owner.x, owner.y, orbitRadius, orbitAngle - orbitSpan, orbitAngle);
      } else {
        const transition = easeOutCubic(effect.transitionProgress ?? 1);
        const transitionCenterX = effect.transitionCenterX ?? owner.x;
        const transitionCenterY = effect.transitionCenterY ?? owner.y;
        const transitionRadius = effect.transitionRadius || orbitRadius;
        const transitionAngle = effect.transitionAngle ?? orbitAngle;
        const orbitTailAngle = transitionAngle - orbitSpan;
        const orbitMidAngle = transitionAngle - orbitSpan * 0.5;
        const orbitTailX = transitionCenterX + Math.cos(orbitTailAngle) * transitionRadius;
        const orbitTailY = transitionCenterY + Math.sin(orbitTailAngle) * transitionRadius;
        const orbitControlX = transitionCenterX + Math.cos(orbitMidAngle) * transitionRadius * 1.28;
        const orbitControlY = transitionCenterY + Math.sin(orbitMidAngle) * transitionRadius * 1.28;
        const lineTailX = effect.x - (effect.dx || 0) * (effect.length || 110);
        const lineTailY = effect.y - (effect.dy || 0) * (effect.length || 110);
        const lineControlX = (lineTailX + effect.x) * 0.5;
        const lineControlY = (lineTailY + effect.y) * 0.5;
        const tailX = lerp(orbitTailX, lineTailX, transition);
        const tailY = lerp(orbitTailY, lineTailY, transition);
        const controlX = lerp(orbitControlX, lineControlX, transition);
        const controlY = lerp(orbitControlY, lineControlY, transition);
        ctx.moveTo(tailX, tailY);
        ctx.quadraticCurveTo(controlX, controlY, effect.x, effect.y);
      }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.lineWidth = Math.max(2, (effect.width || 6) * 0.28);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, Math.max(3.2, (effect.width || 6) * 0.42), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  renderOnlineRespawnIndicators(ctx, bounds) {
    for (const ship of this.online.renderedShips.values()) {
      if (ship.respawnFrames <= 0) continue;
      const spawn = getOnlineSpawnPoint(Number.parseInt(ship.slotId.split('-')[1], 10) - 1);
      if (
        spawn.x < bounds.left
        || spawn.x > bounds.right
        || spawn.y < bounds.top
        || spawn.y > bounds.bottom
      ) {
        continue;
      }

      const accent = ship.theme?.primary || TEAM_COLORS[ship.slotId]?.primary || '#ffffff';
      const countdown = Math.max(1, Math.ceil(ship.respawnFrames / 60));
      const pulse = (Math.sin(this.time * 0.01 + countdown) + 1) * 0.5;

      ctx.save();
      ctx.translate(spawn.x, spawn.y);
      ctx.strokeStyle = hexToRgba(accent, 0.92);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, ship.radius + 18 + pulse * 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = hexToRgba(accent, 0.3);
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(0, 0, ship.radius + 18 + pulse * 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.font = '700 20px Aptos, Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(countdown), 0, 7);
      ctx.font = '700 10px Aptos, Segoe UI, sans-serif';
      ctx.fillStyle = hexToRgba(accent, 0.96);
      ctx.fillText('RESPAWN', 0, ship.radius + 34);
      ctx.restore();
    }
  }

  renderTouchUi() {
    const ctx = this.ctx;
    const team = this.mode === 'online' ? 'online' : null;
    ctx.save();
    if (team) {
      const state = this.controls.getJoystickState(team);
      if (state) {
        ctx.strokeStyle = 'rgba(91, 228, 213, 0.72)';
        ctx.fillStyle = 'rgba(91, 228, 213, 0.12)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(state.startX, state.startY, 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(91, 228, 213, 0.78)';
        ctx.beginPath();
        ctx.arc(state.currentX, state.currentY, 18, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    for (const side of ['blue', 'red']) {
      const state = this.controls.getJoystickState(side);
      if (!state) continue;
      const color = TEAM_COLORS[side].primary;
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
    if (this.mode === 'online') {
      this.updateOnline(delta);
      return;
    }
    if (this.state === 'start') this.updateStart(delta);
    else if (this.state === 'playing') this.updatePlaying(tick);
    else if (this.state === 'victory') this.updateParticles(tick);
    this.ui.updateHUD(this.buildSnapshot());
  }

  render() {
    if (this.mode === 'online') {
      const self = this.online.renderedShips.get(this.online.slotId);
      const focus = self?.respawnFrames > 0
        ? getOnlineSpawnPoint(Number.parseInt(self.slotId.split('-')[1], 10) - 1)
        : self;
      this.renderBackground(focus ? { x: focus.x, y: focus.y, color: self?.theme.primary || TEAM_COLORS[self?.slotId]?.primary || '#4fd4ff' } : null, null);
      this.renderOnlineWorld();
      if (this.state === 'playing') this.renderTouchUi();
      return;
    }

    this.renderBackground(
      { x: this.blue.pos.x, y: this.blue.pos.y, color: TEAM_COLORS.blue.primary },
      { x: this.red.pos.x, y: this.red.pos.y, color: TEAM_COLORS.red.primary },
    );
    this.renderLocalWorld();
    if (this.state === 'playing') this.renderTouchUi();
  }

  frame = (now) => {
    const delta = Math.min(48, now - this.lastTime);
    this.lastTime = now;
    this.fpsFrameCount += 1;
    if (!this.fpsSampleAt) this.fpsSampleAt = now;
    if (now - this.fpsSampleAt >= 500) {
      const fps = (this.fpsFrameCount * 1000) / (now - this.fpsSampleAt);
      this.ui.setOnlineFps?.(fps);
      this.fpsSampleAt = now;
      this.fpsFrameCount = 0;
    }
    this.update(delta);
    this.render();
    requestAnimationFrame(this.frame);
  };

  start() {
    this.ui.showStart();
    requestAnimationFrame(this.frame);
  }
}
