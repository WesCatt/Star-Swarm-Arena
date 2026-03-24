import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import url from 'node:url';
import { Server } from 'socket.io';
import { BALANCE, ITEM_TYPES } from './shared/config.js';
import {
  ONLINE_DRONE_BASE_CAP,
  ONLINE_DRONE_HEALTH,
  ONLINE_DRONE_PLANET_BONUS,
  ONLINE_DRONE_RADIUS,
  ONLINE_DRONE_SPEED,
  ONLINE_REPAIR_COOLDOWN,
  ONLINE_ARC_STRIKE_COOLDOWN,
  ONLINE_ARC_HOLD_THRESHOLD,
  ONLINE_ARC_CHARGE_MAX,
  ONLINE_ARC_STRIKE_DAMAGE,
  ONLINE_ARC_STRIKE_LENGTH,
  ONLINE_ARC_STRIKE_ORBIT_RADIUS,
  ONLINE_ARC_STRIKE_ORBIT_SPEED,
  ONLINE_ARC_STRIKE_ORBIT_TURNS,
  ONLINE_ARC_STRIKE_SPEED,
  ONLINE_ARC_STRIKE_WIDTH,
  ONLINE_ARC_ORB_BASE_COOLDOWN,
  ONLINE_ARC_ORB_BONUS_COOLDOWN,
  ONLINE_ARC_ORB_PAUSE,
  ONLINE_ARC_ORB_HEAD_OFFSET,
  ONLINE_ARC_ORB_MIN_RADIUS,
  ONLINE_ARC_ORB_MAX_RADIUS,
  ONLINE_ARC_ORB_MIN_SPEED,
  ONLINE_ARC_ORB_MAX_SPEED,
  ONLINE_ARC_ORB_MIN_DAMAGE,
  ONLINE_ARC_ORB_MAX_DAMAGE,
  ONLINE_ARC_ORB_MAX_TRAVEL,
  ONLINE_MAX_ENERGY,
  ONLINE_MAX_HEALTH,
  ONLINE_PLANET_LAYOUT,
  ONLINE_PLANET_DRONE_SPAWN_RATE,
  ONLINE_ROOM_CAPACITY,
  ONLINE_SHIP_RADIUS,
  ONLINE_SHIP_DRONE_SPAWN_RATE,
  ONLINE_SLOT_THEMES,
  ONLINE_WORLD,
  getOnlineSpawnPoint,
  getOnlineTheme,
} from './shared/online-constants.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 3001);
const tickRate = 20;
const tickFactor = 60 / tickRate;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.map': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
};

const rooms = new Map();
let roomSequence = 1;
let droneSequence = 1;
let itemSequence = 1;
let skillEffectSequence = 1;
let pickupSequence = 1;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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

function getLanAddress() {
  const interfaces = os.networkInterfaces();
  for (const values of Object.values(interfaces)) {
    for (const details of values || []) {
      if (details.family === 'IPv4' && !details.internal && details.address.startsWith('192.168.')) {
        return details.address;
      }
    }
  }
  return 'localhost';
}

function resolveRequestPath(requestUrl) {
  const requestPath = decodeURIComponent(new URL(requestUrl, `http://${host}:${port}`).pathname);
  const safePath = path.normalize(requestPath).replace(/^(\.\.[\\/])+/, '');
  let filePath = path.join(distDir, safePath === path.sep ? 'index.html' : safePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    filePath = path.join(distDir, 'index.html');
  }

  return filePath;
}

function createPlanetState(definition) {
  return {
    ...definition,
    maxHealth: BALANCE.planet.health,
    health: BALANCE.planet.health,
    ownerSlotId: null,
    pendingOwnerSlotId: null,
    captureSlotId: null,
    captureProgress: 0,
    supportAccumulator: 0,
    recoverCooldown: 0,
    impactHeat: 0,
    rebuildTimer: 0,
    rebuildDuration: 68,
    revealTimer: 0,
    revealDuration: 18,
  };
}

function createShipState(theme, index) {
  const spawn = getOnlineSpawnPoint(index);
  return {
    slotId: theme.slotId,
    badge: theme.badge,
    callsign: theme.callsign,
    primary: theme.primary,
    secondary: theme.secondary,
    glow: theme.glow,
    name: `${theme.callsign} Bot`,
    socketId: null,
    sessionId: null,
    isBot: true,
    x: spawn.x,
    y: spawn.y,
    vx: 0,
    vy: 0,
    angle: index === 0 ? 0 : (Math.PI * 2 * index) / ONLINE_ROOM_CAPACITY,
    radius: ONLINE_SHIP_RADIUS,
    health: ONLINE_MAX_HEALTH,
    maxHealth: ONLINE_MAX_HEALTH,
    energy: ONLINE_MAX_ENERGY,
    maxEnergy: ONLINE_MAX_ENERGY,
    resources: 28,
    score: 0,
    planets: 0,
    eliminations: 0,
    droneCap: ONLINE_DRONE_BASE_CAP,
    respawnFrames: 0,
    boostBlend: 0,
    turnSpeed: BALANCE.mothership.turnSpeed ?? 0.16,
    turnAcceleration: BALANCE.mothership.turnAcceleration ?? 0.03,
    turnDrag: BALANCE.mothership.turnDrag ?? 0.84,
    angularVelocity: 0,
    spawnAccumulator: 0,
    buffs: [],
    repairCooldown: 0,
    arcCooldown: 0,
    arcHoldFrames: 0,
    arcChargeLevel: 0,
    repairFlash: 0,
    repairHeld: false,
    arcHeld: false,
    input: { x: 0, y: 0, boost: false, repair: false, arc: false },
    botTargetId: null,
    botTargetType: null,
    botDecisionTimer: 0,
    botStrafePhase: Math.random() * Math.PI * 2,
    lastDamagedBy: null,
  };
}

function createRoom() {
  const room = {
    id: `room-${roomSequence++}`,
    createdAt: Date.now(),
    time: 0,
    playerCount: 0,
    lastHumanAt: Date.now(),
    ships: ONLINE_SLOT_THEMES.map((theme, index) => createShipState(theme, index)),
    planets: ONLINE_PLANET_LAYOUT.map(createPlanetState),
    drones: [],
    items: [],
    itemAccumulator: 0,
    pickupEvents: [],
    delayedEffects: [],
    skillEffects: [],
  };

  rooms.set(room.id, room);
  return room;
}

function getOrCreateRoom() {
  for (const room of rooms.values()) {
    if (room.playerCount < ONLINE_ROOM_CAPACITY) {
      return room;
    }
  }
  return createRoom();
}

function getShipBySocketId(socketId) {
  for (const room of rooms.values()) {
    const ship = room.ships.find((entry) => entry.socketId === socketId);
    if (ship) return { room, ship };
  }
  return null;
}

function getShipBySessionId(sessionId) {
  if (!sessionId) return null;
  for (const room of rooms.values()) {
    const ship = room.ships.find((entry) => entry.sessionId === sessionId);
    if (ship) return { room, ship };
  }
  return null;
}

function syncPlayerCount(room) {
  room.playerCount = room.ships.filter((ship) => !ship.isBot).length;
}

function getShipSpawnIndex(slotId) {
  return Math.max(0, ONLINE_SLOT_THEMES.findIndex((theme) => theme.slotId === slotId));
}

function getShipSpawnPoint(slotId) {
  return getOnlineSpawnPoint(getShipSpawnIndex(slotId));
}

function respawnShipNow(ship) {
  const spawn = getShipSpawnPoint(ship.slotId);
  const spawnIndex = getShipSpawnIndex(ship.slotId);
  ship.x = spawn.x;
  ship.y = spawn.y;
  ship.vx = 0;
  ship.vy = 0;
  ship.angle = spawnIndex === 0
    ? 0
    : (Math.PI * 2 * spawnIndex) / ONLINE_ROOM_CAPACITY;
  ship.health = ship.maxHealth;
  ship.energy = ship.maxEnergy;
  ship.boostBlend = 0;
  ship.angularVelocity = 0;
  ship.spawnAccumulator = 0;
  ship.respawnFrames = 0;
  ship.botTargetId = null;
  ship.botTargetType = null;
  ship.botDecisionTimer = 0;
  ship.lastDamagedBy = null;
  ship.repairHeld = false;
  ship.arcHeld = false;
  ship.arcHoldFrames = 0;
  ship.arcChargeLevel = 0;
  ship.repairFlash = 0;
  ship.input = { x: 0, y: 0, boost: false, repair: false, arc: false };
}

function assignHumanToShip(room, ship, socket, sessionId) {
  const previousSocketId = ship.socketId;
  if (previousSocketId && previousSocketId !== socket.id) {
    const previousSocket = io.sockets.sockets.get(previousSocketId);
    previousSocket?.leave(room.id);
    previousSocket?.disconnect(true);
  }

  ship.isBot = false;
  ship.socketId = socket.id;
  ship.sessionId = sessionId || ship.sessionId;
  ship.name = ship.callsign + ' Pilot';
  ship.input = { x: 0, y: 0, boost: false, repair: false, arc: false };
  ship.repairHeld = false;
  ship.arcHeld = false;
  ship.arcHoldFrames = 0;
  ship.arcChargeLevel = 0;
  if (ship.respawnFrames > 0 || ship.health <= 0) {
    respawnShipNow(ship);
  }
  syncPlayerCount(room);
}

function releaseShipToBot(room, ship, { clearSession = false } = {}) {
  ship.isBot = true;
  ship.socketId = null;
  if (clearSession) {
    ship.sessionId = null;
  }
  ship.name = ship.callsign + ' Bot';
  ship.input = { x: 0, y: 0, boost: false, repair: false, arc: false };
  ship.repairHeld = false;
  ship.arcHeld = false;
  ship.arcHoldFrames = 0;
  ship.arcChargeLevel = 0;
  ship.botTargetId = null;
  ship.botTargetType = null;
  ship.botDecisionTimer = 0;
  syncPlayerCount(room);
}

function pickOpenShip(room) {
  return room.ships.find((ship) => ship.isBot) || null;
}

function normalizeInput(input = {}) {
  const x = Number.isFinite(input.x) ? input.x : 0;
  const y = Number.isFinite(input.y) ? input.y : 0;
  const repair = Boolean(input.repair);
  const arc = Boolean(input.arc);
  const length = Math.hypot(x, y);
  if (length > 1) {
    return { x: x / length, y: y / length, boost: Boolean(input.boost), repair, arc };
  }
  return { x, y, boost: Boolean(input.boost), repair, arc };
}

function decrementShipAbilityCooldowns(ship, tick) {
  ship.repairCooldown = Math.max(0, ship.repairCooldown - tick);
  ship.arcCooldown = Math.max(0, ship.arcCooldown - tick);
  ship.repairFlash = Math.max(0, ship.repairFlash - tick);
}

function getAbilityCooldownMultiplier(ship) {
  return getBuffMultiplier(ship, 'cooldownHaste', 1);
}

function activateRepairSkill(ship) {
  if (ship.respawnFrames > 0 || ship.health <= 0 || ship.repairCooldown > 0) return false;
  ship.health = ship.maxHealth;
  ship.repairCooldown = ONLINE_REPAIR_COOLDOWN * getAbilityCooldownMultiplier(ship);
  ship.repairFlash = 26;
  return true;
}

function hasOwnedArcEffect(room, ownerSlotId) {
  return room.skillEffects.some((effect) => effect.ownerSlotId === ownerSlotId);
}

function canActivateArcSkill(room, ship) {
  return ship.respawnFrames <= 0 && ship.health > 0 && ship.arcCooldown <= 0 && !hasOwnedArcEffect(room, ship.slotId);
}

function findNearestArcTarget(room, ownerSlotId, x, y) {
  let bestTarget = null;
  let bestDistance = Infinity;
  for (const ship of room.ships) {
    if (ship.slotId === ownerSlotId || ship.respawnFrames > 0 || ship.health <= 0) continue;
    const distance = Math.hypot(ship.x - x, ship.y - y);
    if (distance >= bestDistance) continue;
    bestDistance = distance;
    bestTarget = ship;
  }
  return bestTarget;
}

function resolveArcTarget(room, ownerSlotId, effect) {
  if (effect.targetSlotId) {
    const current = room.ships.find((ship) => (
      ship.slotId === effect.targetSlotId
      && ship.slotId !== ownerSlotId
      && ship.respawnFrames <= 0
      && ship.health > 0
    ));
    if (current) return current;
  }

  const fallback = findNearestArcTarget(room, ownerSlotId, effect.x, effect.y);
  effect.targetSlotId = fallback?.slotId || null;
  return fallback;
}

function getArcChargeRatio(holdFrames) {
  const chargeWindow = Math.max(1, ONLINE_ARC_CHARGE_MAX - ONLINE_ARC_HOLD_THRESHOLD);
  return clamp((holdFrames - ONLINE_ARC_HOLD_THRESHOLD) / chargeWindow, 0, 1);
}

function getShipHeadPosition(ship, extraOffset = 0) {
  const offset = ship.radius + extraOffset;
  return {
    x: ship.x + Math.cos(ship.angle) * offset,
    y: ship.y + Math.sin(ship.angle) * offset,
  };
}

function activateArcStrike(room, ship) {
  if (!canActivateArcSkill(room, ship)) return false;

  room.skillEffects.push({
    id: 'arc-' + (skillEffectSequence++),
    type: 'arc-strike',
    ownerSlotId: ship.slotId,
    phase: 'orbit',
    angle: ship.angle,
    orbitProgress: 0,
    radius: ONLINE_ARC_STRIKE_ORBIT_RADIUS,
    length: ONLINE_ARC_STRIKE_LENGTH,
    width: ONLINE_ARC_STRIKE_WIDTH,
    x: ship.x + Math.cos(ship.angle) * ONLINE_ARC_STRIKE_ORBIT_RADIUS,
    y: ship.y + Math.sin(ship.angle) * ONLINE_ARC_STRIKE_ORBIT_RADIUS,
    dx: Math.cos(ship.angle),
    dy: Math.sin(ship.angle),
    vx: 0,
    vy: 0,
    targetSlotId: null,
    travel: 0,
  });

  ship.arcCooldown = ONLINE_ARC_STRIKE_COOLDOWN * getAbilityCooldownMultiplier(ship);
  return true;
}

function activateChargedArcOrb(room, ship, holdFrames) {
  if (!canActivateArcSkill(room, ship)) return false;

  const chargeRatio = getArcChargeRatio(holdFrames);
  const spawn = getShipHeadPosition(ship, ONLINE_ARC_ORB_HEAD_OFFSET);
  const target = findNearestArcTarget(room, ship.slotId, spawn.x, spawn.y);
  const orbRadius = ONLINE_ARC_ORB_MIN_RADIUS + (ONLINE_ARC_ORB_MAX_RADIUS - ONLINE_ARC_ORB_MIN_RADIUS) * chargeRatio;
  const orbDamage = ONLINE_ARC_ORB_MIN_DAMAGE + (ONLINE_ARC_ORB_MAX_DAMAGE - ONLINE_ARC_ORB_MIN_DAMAGE) * chargeRatio;
  const orbSpeed = ONLINE_ARC_ORB_MIN_SPEED + (ONLINE_ARC_ORB_MAX_SPEED - ONLINE_ARC_ORB_MIN_SPEED) * chargeRatio;
  const cooldown = (ONLINE_ARC_ORB_BASE_COOLDOWN + ONLINE_ARC_ORB_BONUS_COOLDOWN * chargeRatio) * getAbilityCooldownMultiplier(ship);

  room.skillEffects.push({
    id: 'orb-' + (skillEffectSequence++),
    type: 'arc-orb',
    ownerSlotId: ship.slotId,
    targetSlotId: target?.slotId || null,
    phase: 'pause',
    x: spawn.x,
    y: spawn.y,
    anchorX: spawn.x,
    anchorY: spawn.y,
    dx: Math.cos(ship.angle),
    dy: Math.sin(ship.angle),
    vx: 0,
    vy: 0,
    radius: orbRadius,
    width: orbRadius * 0.8,
    length: orbRadius * 2.2,
    chargeRatio,
    damage: orbDamage,
    speed: orbSpeed,
    pauseFrames: ONLINE_ARC_ORB_PAUSE,
    hoverPhase: Math.random() * Math.PI * 2,
    travel: 0,
    maxTravel: ONLINE_ARC_ORB_MAX_TRAVEL,
  });

  ship.arcCooldown = cooldown;
  return true;
}

function processShipAbilityInput(room, ship, tick) {
  decrementShipAbilityCooldowns(ship, tick);
  const wantsRepair = Boolean(ship.input.repair);
  if (wantsRepair && !ship.repairHeld) {
    activateRepairSkill(ship);
  }
  ship.repairHeld = wantsRepair;

  const wantsArc = Boolean(ship.input.arc);
  const wasHoldingArc = ship.arcHeld;
  if (wantsArc && canActivateArcSkill(room, ship)) {
    ship.arcHoldFrames = Math.min(ONLINE_ARC_CHARGE_MAX, (ship.arcHoldFrames || 0) + tick);
    ship.arcChargeLevel = clamp(ship.arcHoldFrames / ONLINE_ARC_CHARGE_MAX, 0, 1);
  } else if (!wantsArc) {
    if (wasHoldingArc) {
      if ((ship.arcHoldFrames || 0) >= ONLINE_ARC_HOLD_THRESHOLD) activateChargedArcOrb(room, ship, ship.arcHoldFrames || 0);
      else if ((ship.arcHoldFrames || 0) > 0) activateArcStrike(room, ship);
    }
    ship.arcHoldFrames = 0;
    ship.arcChargeLevel = 0;
  } else {
    ship.arcHoldFrames = 0;
    ship.arcChargeLevel = 0;
  }
  ship.arcHeld = wantsArc;
}

function updateSkillEffects(room, tick) {
  room.skillEffects = room.skillEffects.filter((effect) => {
    const owner = room.ships.find((ship) => ship.slotId === effect.ownerSlotId);
    if (!owner || owner.health <= 0 || owner.respawnFrames > 0) return false;

    if (effect.type === 'arc-strike') {
      if (effect.phase === 'orbit') {
        effect.orbitProgress += ONLINE_ARC_STRIKE_ORBIT_SPEED * tick;
        effect.angle += ONLINE_ARC_STRIKE_ORBIT_SPEED * tick;
        effect.dx = Math.cos(effect.angle);
        effect.dy = Math.sin(effect.angle);
        effect.x = owner.x + effect.dx * effect.radius;
        effect.y = owner.y + effect.dy * effect.radius;

        if (effect.orbitProgress < Math.PI * 2 * ONLINE_ARC_STRIKE_ORBIT_TURNS) {
          return true;
        }

        const target = findNearestArcTarget(room, owner.slotId, effect.x, effect.y);
        if (!target) return false;

        const distance = Math.hypot(target.x - effect.x, target.y - effect.y) || 1;
        effect.phase = 'seek';
        effect.targetSlotId = target.slotId;
        effect.dx = (target.x - effect.x) / distance;
        effect.dy = (target.y - effect.y) / distance;
        effect.vx = effect.dx * ONLINE_ARC_STRIKE_SPEED;
        effect.vy = effect.dy * ONLINE_ARC_STRIKE_SPEED;
        effect.travel = 0;
        return true;
      }

      effect.x += effect.vx * tick;
      effect.y += effect.vy * tick;
      effect.travel += Math.hypot(effect.vx, effect.vy) * tick;

      const hitTarget = room.ships.find((ship) => (
        ship.slotId !== owner.slotId
        && ship.respawnFrames <= 0
        && ship.health > 0
        && Math.hypot(ship.x - effect.x, ship.y - effect.y) <= ship.radius + 18
      ));

      if (hitTarget) {
        hitTarget.health = Math.max(0, hitTarget.health - ONLINE_ARC_STRIKE_DAMAGE);
        hitTarget.lastDamagedBy = owner.slotId;
        return false;
      }

      return (
        effect.x > 0
        && effect.x < ONLINE_WORLD.width
        && effect.y > 0
        && effect.y < ONLINE_WORLD.height
      );
    }

    if (effect.type !== 'arc-orb') return false;

    if (effect.phase === 'pause') {
      effect.hoverPhase = (effect.hoverPhase || 0) + 0.22 * tick;
      const sway = (4 + effect.chargeRatio * 8) * Math.sin(effect.hoverPhase);
      const normalX = -(effect.dy || 0);
      const normalY = effect.dx || 0;
      effect.x = effect.anchorX + normalX * sway;
      effect.y = effect.anchorY + normalY * sway;
      effect.pauseFrames = Math.max(0, (effect.pauseFrames || 0) - tick);
      if (effect.pauseFrames > 0) {
        return true;
      }
      effect.phase = 'seek';
    }

    const target = resolveArcTarget(room, owner.slotId, effect);
    if (target) {
      const distance = Math.hypot(target.x - effect.x, target.y - effect.y) || 1;
      const desiredDx = (target.x - effect.x) / distance;
      const desiredDy = (target.y - effect.y) / distance;
      const turnEase = 0.18 + effect.chargeRatio * 0.18;
      const nextDx = effect.dx + (desiredDx - effect.dx) * turnEase;
      const nextDy = effect.dy + (desiredDy - effect.dy) * turnEase;
      const directionLength = Math.hypot(nextDx, nextDy) || 1;
      effect.dx = nextDx / directionLength;
      effect.dy = nextDy / directionLength;
    }

    effect.vx = effect.dx * effect.speed;
    effect.vy = effect.dy * effect.speed;
    effect.x += effect.vx * tick;
    effect.y += effect.vy * tick;
    effect.travel += Math.hypot(effect.vx, effect.vy) * tick;

    const hitRadius = (effect.radius || 14) + 12;
    const hitTarget = room.ships.find((ship) => (
      ship.slotId !== owner.slotId
      && ship.respawnFrames <= 0
      && ship.health > 0
      && Math.hypot(ship.x - effect.x, ship.y - effect.y) <= ship.radius + hitRadius
    ));

    if (hitTarget) {
      hitTarget.health = Math.max(0, hitTarget.health - effect.damage);
      hitTarget.lastDamagedBy = owner.slotId;
      effect.targetSlotId = hitTarget.slotId;
      return false;
    }

    return (
      effect.travel < (effect.maxTravel || ONLINE_ARC_ORB_MAX_TRAVEL)
      && effect.x > 0
      && effect.x < ONLINE_WORLD.width
      && effect.y > 0
      && effect.y < ONLINE_WORLD.height
    );
  });
}
function pickRandomItemType() {
  return ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)] || ITEM_TYPES[0];
}

function createItemState(x, y, type = pickRandomItemType()) {
  return {
    id: `item-${itemSequence++}`,
    x,
    y,
    radius: BALANCE.item.radius,
    typeId: type.id,
  };
}

function getShipBuff(ship, type) {
  return ship.buffs.find((buff) => buff.type === type) || null;
}

function getBuffMultiplier(ship, type, fallback = 1) {
  return getShipBuff(ship, type)?.multiplier ?? fallback;
}

function applyBuff(ship, type, multiplier, durationSeconds) {
  const remaining = durationSeconds * 60;
  const current = getShipBuff(ship, type);
  if (current) {
    current.multiplier = multiplier;
    current.remaining = remaining;
    current.total = remaining;
    return;
  }
  ship.buffs.push({
    type,
    multiplier,
    remaining,
    total: remaining,
  });
}

function updateShipBuffs(ship, tick) {
  ship.buffs = ship.buffs.filter((buff) => {
    buff.remaining -= tick;
    return buff.remaining > 0;
  });
}

function getShipSpeedMultiplier(ship) {
  return getBuffMultiplier(ship, 'shipSpeed', 1);
}

function getProductionMultiplier(ship) {
  return getBuffMultiplier(ship, 'production', 1);
}

function getDroneModifiers(ship) {
  return {
    size: getBuffMultiplier(ship, 'droneSize', 1),
    speed: getBuffMultiplier(ship, 'droneSpeed', 1),
    damage: getBuffMultiplier(ship, 'droneDamage', 1),
  };
}

function createDroneState(ownerSlotId, x, y) {
  const angle = Math.random() * Math.PI * 2;
  return {
    id: `drone-${droneSequence++}`,
    ownerSlotId,
    x,
    y,
    vx: Math.cos(angle) * 0.8,
    vy: Math.sin(angle) * 0.8,
    radius: ONLINE_DRONE_RADIUS,
    health: ONLINE_DRONE_HEALTH,
    maxHealth: ONLINE_DRONE_HEALTH,
    heading: angle,
    attackCooldown: Math.random() * BALANCE.drone.attackCooldown,
    orbitSeed: Math.random() * Math.PI * 2,
  };
}

function getDroneCount(room, ownerSlotId) {
  return room.drones.filter((drone) => drone.ownerSlotId === ownerSlotId && drone.health > 0).length;
}

function getDroneCap(ship) {
  return ONLINE_DRONE_BASE_CAP + ship.planets * ONLINE_DRONE_PLANET_BONUS;
}

function spawnDrone(room, ownerSlotId, source) {
  const sourceRadius = source.radius || ONLINE_SHIP_RADIUS;
  const angle = Math.random() * Math.PI * 2;
  const distance = sourceRadius + 14 + Math.random() * 10;
  room.drones.push(
    createDroneState(
      ownerSlotId,
      source.x + Math.cos(angle) * distance,
      source.y + Math.sin(angle) * distance,
    ),
  );
}

function canPlanetSupport(planet) {
  return Boolean(
    planet.ownerSlotId
    && planet.rebuildTimer <= 0
    && planet.health / planet.maxHealth > BALANCE.planet.supportThreshold
  );
}

function shatterPlanet(planet, team) {
  planet.ownerSlotId = null;
  planet.pendingOwnerSlotId = team;
  planet.captureSlotId = team;
  planet.captureProgress = 100;
  planet.health = 0;
  planet.supportAccumulator = 0;
  planet.rebuildTimer = planet.rebuildDuration;
  planet.revealTimer = 0;
  planet.impactHeat = 8;
}

function completePlanetCapture(planet) {
  if (!planet.pendingOwnerSlotId) return null;
  const ownerSlotId = planet.pendingOwnerSlotId;
  planet.ownerSlotId = ownerSlotId;
  planet.pendingOwnerSlotId = null;
  planet.captureSlotId = null;
  planet.captureProgress = 0;
  planet.health = planet.maxHealth * BALANCE.planet.captureRestore;
  planet.supportAccumulator = 120;
  planet.revealTimer = planet.revealDuration;
  planet.impactHeat = 0;
  return ownerSlotId;
}

function takePlanetDamage(planet, amount, team) {
  if (planet.rebuildTimer > 0) return false;
  planet.health -= amount;
  planet.recoverCooldown = BALANCE.planet.recoverDelay;
  planet.impactHeat = Math.min(8, planet.impactHeat + 1);

  if (planet.health > 0) {
    return false;
  }

  shatterPlanet(planet, team);
  return true;
}

function neutralizeRandomEnemyPlanet(room, slotId) {
  const candidates = room.planets.filter((planet) => planet.ownerSlotId && planet.ownerSlotId !== slotId);
  if (!candidates.length) return;
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  chosen.ownerSlotId = null;
  chosen.pendingOwnerSlotId = null;
  chosen.captureSlotId = null;
  chosen.captureProgress = 0;
  chosen.health = chosen.maxHealth * 0.45;
  chosen.supportAccumulator = 0;
  chosen.rebuildTimer = 0;
  chosen.revealTimer = 0;
  chosen.impactHeat = 2.5;
}

function autoCaptureNearestPlanet(room, slotId) {
  const ship = room.ships.find((entry) => entry.slotId === slotId);
  if (!ship) return;
  const candidates = room.planets.filter((planet) => planet.ownerSlotId !== slotId);
  if (!candidates.length) return;
  candidates.sort((a, b) => Math.hypot(ship.x - a.x, ship.y - a.y) - Math.hypot(ship.x - b.x, ship.y - b.y));
  shatterPlanet(candidates[0], slotId);
}

function applyItemEffect(room, ship, item) {
  switch (item.typeId) {
    case 'ship-speed':
      applyBuff(ship, 'shipSpeed', 1.5, 3);
      break;
    case 'production':
      applyBuff(ship, 'production', 2, 3);
      break;
    case 'drone-size':
      applyBuff(ship, 'droneSize', 1.8, 3);
      break;
    case 'drone-speed':
      applyBuff(ship, 'droneSpeed', 1.5, 3);
      break;
    case 'drone-attack':
      applyBuff(ship, 'droneDamage', 2, 3);
      break;
    case 'neutralize':
      neutralizeRandomEnemyPlanet(room, ship.slotId);
      break;
    case 'autocapture':
      room.delayedEffects.push({
        type: 'autocapture',
        slotId: ship.slotId,
        remaining: 3 * 60,
      });
      break;
    case 'cooldown-haste': {
      const duration = ITEM_TYPES.find((type) => type.id === item.typeId)?.duration || 6;
      ship.repairCooldown *= 0.5;
      ship.arcCooldown *= 0.5;
      applyBuff(ship, 'cooldownHaste', 0.5, duration);
      break;
    }
    default:
      break;
  }
}

function getBotTargetEntity(room, ship) {
  if (ship.botTargetType === 'ship') {
    return room.ships.find((entry) => entry.slotId === ship.botTargetId) || null;
  }
  if (ship.botTargetType === 'planet') {
    return room.planets.find((planet) => planet.id === ship.botTargetId) || null;
  }
  if (ship.botTargetType === 'item') {
    return room.items.find((item) => item.id === ship.botTargetId) || null;
  }
  if (ship.botTargetType === 'spawn') {
    return getShipSpawnPoint(ship.slotId);
  }
  return null;
}

function shouldBotDefendOwnedPlanet(room, ship, planet) {
  if (!planet || planet.ownerSlotId !== ship.slotId) return false;
  if (ship.health < 42) return true;

  const nearbyEnemyShip = room.ships.some((enemy) => (
    enemy.slotId !== ship.slotId
    && enemy.respawnFrames <= 0
    && enemy.health > 0
    && Math.hypot(enemy.x - planet.x, enemy.y - planet.y) < 280
  ));

  const nearbyEnemyDrones = room.drones.filter((drone) => (
    drone.ownerSlotId !== ship.slotId
    && drone.health > 0
    && Math.hypot(drone.x - planet.x, drone.y - planet.y) < 220
  )).length;

  return planet.health / planet.maxHealth < 0.68 && (nearbyEnemyShip || nearbyEnemyDrones >= 3);
}

function isBotTargetValid(room, ship) {
  const target = getBotTargetEntity(room, ship);
  if (!target) return false;
  if (ship.botTargetType === 'ship') {
    return target.slotId !== ship.slotId && target.respawnFrames <= 0 && target.health > 0;
  }
  if (ship.botTargetType === 'planet') {
    if (target.rebuildTimer > 0) return false;
    if (target.ownerSlotId === ship.slotId) {
      return shouldBotDefendOwnedPlanet(room, ship, target);
    }
    return true;
  }
  if (ship.botTargetType === 'item') {
    return room.items.some((item) => item.id === target.id);
  }
  return true;
}

function getNearbyDronePressure(room, ship, range = 260) {
  let friendly = 0;
  let enemy = 0;
  for (const drone of room.drones) {
    if (drone.health <= 0) continue;
    if (Math.hypot(drone.x - ship.x, drone.y - ship.y) > range) continue;
    if (drone.ownerSlotId === ship.slotId) {
      friendly += 1;
    } else {
      enemy += 1;
    }
  }
  return { friendly, enemy };
}

function chooseBotTarget(room, ship) {
  const ownedPlanets = room.planets.filter((planet) => planet.ownerSlotId === ship.slotId && planet.rebuildTimer <= 0);
  const attackablePlanets = room.planets.filter((planet) => planet.ownerSlotId !== ship.slotId && planet.rebuildTimer <= 0);
  const liveEnemies = room.ships.filter((entry) => entry.slotId !== ship.slotId && entry.respawnFrames <= 0 && entry.health > 0);
  const nearestEnemy = liveEnemies
    .slice()
    .sort((a, b) => Math.hypot(a.x - ship.x, a.y - ship.y) - Math.hypot(b.x - ship.x, b.y - ship.y))[0] || null;
  const weakestEnemy = liveEnemies
    .slice()
    .sort((a, b) => (a.health + a.resources * 0.08) - (b.health + b.resources * 0.08))[0] || null;
  const pressure = getNearbyDronePressure(room, ship);
  const threatened = pressure.enemy > pressure.friendly + 4
    || (nearestEnemy && Math.hypot(nearestEnemy.x - ship.x, nearestEnemy.y - ship.y) < 240 && nearestEnemy.health > ship.health + 10);

  if (ship.health < 28 || (ship.health < 44 && threatened)) {
    const retreatPlanet = ownedPlanets
      .slice()
      .sort((a, b) => Math.hypot(a.x - ship.x, a.y - ship.y) - Math.hypot(b.x - ship.x, b.y - ship.y))[0];
    if (retreatPlanet) return { type: 'planet', id: retreatPlanet.id, decisionTime: 18 };
    return { type: 'spawn', id: ship.slotId, decisionTime: 18 };
  }

  let bestItem = null;
  let bestItemScore = -Infinity;
  for (const item of room.items) {
    const dist = Math.hypot(item.x - ship.x, item.y - ship.y);
    const score = 250 - dist
      + (ship.energy < 50 ? 18 : 0)
      + (ship.health < 55 ? 10 : 0)
      - Math.max(0, pressure.enemy - pressure.friendly) * 10;
    if (score > bestItemScore) {
      bestItemScore = score;
      bestItem = item;
    }
  }
  if (bestItem && bestItemScore > 35) {
    return { type: 'item', id: bestItem.id, decisionTime: 14 };
  }

  let bestPlanet = null;
  let bestPlanetScore = -Infinity;
  for (const planet of attackablePlanets) {
    const dist = Math.hypot(planet.x - ship.x, planet.y - ship.y);
    const neutralBonus = planet.ownerSlotId ? 0 : 24;
    const weakBonus = (1 - planet.health / planet.maxHealth) * 40;
    const centralBonus = 32 - Math.abs(planet.x - ONLINE_WORLD.width * 0.5) * 0.015 - Math.abs(planet.y - ONLINE_WORLD.height * 0.5) * 0.015;
    const score = 170 + neutralBonus + weakBonus + centralBonus - dist * 0.22;
    if (score > bestPlanetScore) {
      bestPlanetScore = score;
      bestPlanet = planet;
    }
  }

  let bestShip = null;
  let bestShipScore = -Infinity;
  for (const enemy of liveEnemies) {
    const dist = Math.hypot(enemy.x - ship.x, enemy.y - ship.y);
    const advantage = (ship.health - enemy.health) * 1.35 + (ship.resources - enemy.resources) * 0.08;
    const nearbyBonus = Math.max(0, 300 - dist) * 0.24;
    const score = 90 + advantage + nearbyBonus + ship.planets * 7 - enemy.planets * 10;
    if (score > bestShipScore) {
      bestShipScore = score;
      bestShip = enemy;
    }
  }

  if (bestShip && (bestShipScore > bestPlanetScore + 16 || (!bestPlanet && bestShipScore > 70))) {
    return { type: 'ship', id: bestShip.id || bestShip.slotId, decisionTime: 16 };
  }

  if (bestPlanet) {
    return { type: 'planet', id: bestPlanet.id, decisionTime: 24 };
  }

  if (weakestEnemy) {
    return { type: 'ship', id: weakestEnemy.id || weakestEnemy.slotId, decisionTime: 18 };
  }

  return { type: 'spawn', id: ship.slotId, decisionTime: 18 };
}

function chooseBotInput(room, ship) {
  if (ship.respawnFrames > 0) {
    return { x: 0, y: 0, boost: false };
  }

  ship.botDecisionTimer = Math.max(0, (ship.botDecisionTimer || 0) - tickFactor);
  if (ship.botDecisionTimer <= 0 || !isBotTargetValid(room, ship)) {
    const nextTarget = chooseBotTarget(room, ship);
    ship.botTargetType = nextTarget.type;
    ship.botTargetId = nextTarget.id;
    ship.botDecisionTimer = nextTarget.decisionTime + Math.random() * 6;
  }

  const target = getBotTargetEntity(room, ship) || getShipSpawnPoint(ship.slotId);
  const pressure = getNearbyDronePressure(room, ship);
  const nearestEnemy = room.ships
    .filter((entry) => entry.slotId !== ship.slotId && entry.respawnFrames <= 0 && entry.health > 0)
    .slice()
    .sort((a, b) => Math.hypot(a.x - ship.x, a.y - ship.y) - Math.hypot(b.x - ship.x, b.y - ship.y))[0] || null;

  const retreating = ship.health < 32
    || (ship.health < 48 && pressure.enemy > pressure.friendly + 4);
  let dx = target.x - ship.x;
  let dy = target.y - ship.y;

  if (ship.botTargetType === 'ship') {
    const orbitAngle = room.time * 0.018 + ship.botStrafePhase;
    dx += Math.cos(orbitAngle) * 48;
    dy += Math.sin(orbitAngle) * 48;
  } else if (ship.botTargetType === 'planet') {
    const approachAngle = room.time * 0.014 + ship.botStrafePhase * 0.6;
    dx += Math.cos(approachAngle) * 22;
    dy += Math.sin(approachAngle) * 22;
  }

  if (nearestEnemy) {
    const threatDistance = Math.hypot(nearestEnemy.x - ship.x, nearestEnemy.y - ship.y);
    if (retreating && threatDistance < 260) {
      dx += (ship.x - nearestEnemy.x) * 1.35;
      dy += (ship.y - nearestEnemy.y) * 1.35;
    }
  }

  if (ship.x < 140) dx += 90;
  if (ship.x > ONLINE_WORLD.width - 140) dx -= 90;
  if (ship.y < 140) dy += 90;
  if (ship.y > ONLINE_WORLD.height - 140) dy -= 90;

  const distanceToTarget = Math.hypot(dx, dy) || 1;
  const input = {
    x: dx / distanceToTarget,
    y: dy / distanceToTarget,
    boost: false,
  };

  if (retreating) {
    input.boost = distanceToTarget > 110 && ship.energy > 16;
  } else if (ship.botTargetType === 'item') {
    input.boost = distanceToTarget > 100 && ship.energy > 18;
  } else if (ship.botTargetType === 'ship') {
    input.boost = distanceToTarget > 220 && distanceToTarget < 620 && ship.energy > 30;
  } else {
    input.boost = distanceToTarget > 280 && ship.energy > 42 && pressure.enemy <= pressure.friendly + 3;
  }

  return normalizeInput(input);
}

function updateShipMotion(ship, tick) {
  updateShipBuffs(ship, tick);

  if (ship.respawnFrames > 0) {
    ship.respawnFrames = Math.max(0, ship.respawnFrames - tick);
    if (ship.respawnFrames <= 0) {
      respawnShipNow(ship);
    }
    return;
  }

  const input = normalizeInput(ship.input);
  const moving = Math.hypot(input.x, input.y) > 0.08;
  const hasUnlimitedPlayerBoost = !ship.isBot;
  const boostThreshold = ship.maxEnergy * 0.08;
  const boosting = input.boost && moving && (hasUnlimitedPlayerBoost || ship.energy > boostThreshold);
  const boostEase = 1 - Math.pow(1 - 0.18, tick);
  ship.boostBlend += ((boosting ? 1 : 0) - ship.boostBlend) * boostEase;
  ship.boostBlend = clamp(ship.boostBlend, 0, 1);

  if (hasUnlimitedPlayerBoost) {
    ship.energy = ship.maxEnergy;
  } else if (boosting) {
    ship.energy = Math.max(0, ship.energy - 1.1 * tick);
  } else {
    ship.energy = Math.min(ship.maxEnergy, ship.energy + 0.5 * tick);
  }

  if (hasUnlimitedPlayerBoost) {
    ship.energy = ship.maxEnergy;
  } else if (ship.energy <= 0.5) {
    ship.energy = 0;
    ship.boostBlend *= Math.pow(0.4, tick);
  } else if (ship.energy < boostThreshold) {
    const remainingEnergyRatio = clamp(ship.energy / boostThreshold, 0, 1);
    ship.boostBlend = Math.min(ship.boostBlend, remainingEnergyRatio);
  }

  const driveMultiplier = getShipSpeedMultiplier(ship) * (1 + ship.boostBlend * 0.78);
  if (moving) {
    ship.vx += input.x * 0.2 * driveMultiplier * tick;
    ship.vy += input.y * 0.2 * driveMultiplier * tick;
    const targetAngle = getStableMoveAngle(input.x, input.y, ship.angle);
    const angleDelta = normalizeAngle(targetAngle - ship.angle);
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
  ship.spawnAccumulator += tick;
}

function updateDroneCaps(room) {
  for (const ship of room.ships) {
    ship.droneCap = getDroneCap(ship);
  }
}

function fillShipDroneSpawns(room) {
  for (const ship of room.ships) {
    if (ship.respawnFrames > 0) continue;
    const currentCount = getDroneCount(room, ship.slotId);
    if (currentCount >= ship.droneCap) continue;
    const spawnRate = ONLINE_SHIP_DRONE_SPAWN_RATE / getProductionMultiplier(ship);
    let ready = 0;

    while (ship.spawnAccumulator >= spawnRate && getDroneCount(room, ship.slotId) < ship.droneCap) {
      ship.spawnAccumulator -= spawnRate;
      spawnDrone(room, ship.slotId, ship);
      ready += 1;
      if (ready >= 4) break;
    }
  }
}

function fillPlanetDroneSpawns(room, tick) {
  for (const planet of room.planets) {
    if (!canPlanetSupport(planet)) continue;
    const owner = room.ships.find((ship) => ship.slotId === planet.ownerSlotId);
    if (!owner || owner.respawnFrames > 0) continue;
    if (getDroneCount(room, owner.slotId) >= owner.droneCap) continue;

    planet.supportAccumulator += tick;
    while (planet.supportAccumulator >= ONLINE_PLANET_DRONE_SPAWN_RATE && getDroneCount(room, owner.slotId) < owner.droneCap) {
      planet.supportAccumulator -= ONLINE_PLANET_DRONE_SPAWN_RATE;
      spawnDrone(room, owner.slotId, planet);
    }
  }
}

function circlesOverlap(a, b, padding = 0) {
  return Math.hypot(a.x - b.x, a.y - b.y) <= a.radius + b.radius + padding;
}

function findDroneTarget(room, drone, ownerShip, allies, enemies) {
  let bestTarget = null;
  let bestDistance = Infinity;
  let targetType = 'orbit';

  for (const enemy of enemies) {
    if (enemy.id === drone.id || enemy.health <= 0) continue;
    const dist = Math.hypot(enemy.x - drone.x, enemy.y - drone.y);
    if (dist < Math.max(BALANCE.drone.senseRange, 150) && dist < bestDistance) {
      bestDistance = dist;
      bestTarget = enemy;
      targetType = 'drone';
    }
  }

  for (const ship of room.ships) {
    if (ship.slotId === drone.ownerSlotId || ship.respawnFrames > 0 || ship.health <= 0) continue;
    const dist = Math.hypot(ship.x - drone.x, ship.y - drone.y);
    if (dist < 220 && dist < bestDistance) {
      bestDistance = dist;
      bestTarget = ship;
      targetType = 'ship';
    }
  }

  if (!bestTarget) {
    for (const planet of room.planets) {
      if (planet.ownerSlotId === drone.ownerSlotId || planet.rebuildTimer > 0) continue;
      const dist = Math.hypot(planet.x - drone.x, planet.y - drone.y);
      if (dist < 260 && dist < bestDistance) {
        bestDistance = dist;
        bestTarget = planet;
        targetType = 'planet';
      }
    }
  }

  if (!bestTarget) {
    const orbitRadius = 74 + ((drone.orbitSeed || 0) % 1) * 44;
    const orbitTarget = {
      x: ownerShip.x + Math.cos((drone.orbitSeed || 0) + room.time * 0.002) * orbitRadius,
      y: ownerShip.y + Math.sin((drone.orbitSeed || 0) + room.time * 0.002) * orbitRadius,
      radius: ownerShip.radius,
    };
    return {
      target: orbitTarget,
      targetType,
      targetDistance: Math.hypot(orbitTarget.x - drone.x, orbitTarget.y - drone.y),
      allies,
    };
  }

  return { target: bestTarget, targetType, targetDistance: bestDistance, allies };
}

function calculateDroneForces(room, drone, ownerShip, allies, enemies) {
  let separationX = 0;
  let separationY = 0;
  let alignmentX = 0;
  let alignmentY = 0;
  let cohesionX = 0;
  let cohesionY = 0;
  let closeAllies = 0;
  let farAllies = 0;

  for (const ally of allies) {
    if (ally.id === drone.id || ally.health <= 0) continue;
    const dx = drone.x - ally.x;
    const dy = drone.y - ally.y;
    const dist = Math.hypot(dx, dy) || 0.001;

    if (dist < 18) {
      separationX += dx / dist;
      separationY += dy / dist;
      closeAllies += 1;
    }

    if (dist < 70) {
      alignmentX += ally.vx;
      alignmentY += ally.vy;
      cohesionX += ally.x;
      cohesionY += ally.y;
      farAllies += 1;
    }
  }

  if (closeAllies > 0) {
    separationX /= closeAllies;
    separationY /= closeAllies;
    const separationLength = Math.hypot(separationX, separationY) || 1;
    separationX = (separationX / separationLength) * 0.62;
    separationY = (separationY / separationLength) * 0.62;
  }

  if (farAllies > 0) {
    alignmentX /= farAllies;
    alignmentY /= farAllies;
    const alignmentLength = Math.hypot(alignmentX, alignmentY) || 1;
    alignmentX = (alignmentX / alignmentLength) * 0.22;
    alignmentY = (alignmentY / alignmentLength) * 0.22;

    cohesionX = cohesionX / farAllies - drone.x;
    cohesionY = cohesionY / farAllies - drone.y;
    const cohesionLength = Math.hypot(cohesionX, cohesionY) || 1;
    cohesionX = (cohesionX / cohesionLength) * 0.2;
    cohesionY = (cohesionY / cohesionLength) * 0.2;
  }

  const targetInfo = findDroneTarget(room, drone, ownerShip, allies, enemies);
  let targetForceX = targetInfo.target.x - drone.x;
  let targetForceY = targetInfo.target.y - drone.y;
  const targetForceLength = Math.hypot(targetForceX, targetForceY) || 1;
  const targetScale = targetInfo.targetType === 'planet' ? 0.48 : targetInfo.targetType === 'orbit' ? 0.3 : 0.56;
  targetForceX = (targetForceX / targetForceLength) * targetScale;
  targetForceY = (targetForceY / targetForceLength) * targetScale;

  let edgeForceX = 0;
  let edgeForceY = 0;
  if (drone.x < 120) edgeForceX += 1;
  if (drone.x > ONLINE_WORLD.width - 120) edgeForceX -= 1;
  if (drone.y < 120) edgeForceY += 1;
  if (drone.y > ONLINE_WORLD.height - 120) edgeForceY -= 1;
  const edgeLength = Math.hypot(edgeForceX, edgeForceY);
  if (edgeLength > 0) {
    edgeForceX = (edgeForceX / edgeLength) * 0.42;
    edgeForceY = (edgeForceY / edgeLength) * 0.42;
  }

  return {
    targetInfo,
    separationX,
    separationY,
    alignmentX,
    alignmentY,
    cohesionX,
    cohesionY,
    targetForceX,
    targetForceY,
    edgeForceX,
    edgeForceY,
  };
}

function resolveDroneCollisions(room, tick) {
  for (let i = 0; i < room.drones.length; i += 1) {
    const a = room.drones[i];
    if (a.health <= 0) continue;

    for (let j = i + 1; j < room.drones.length; j += 1) {
      const b = room.drones[j];
      if (b.health <= 0 || a.ownerSlotId === b.ownerSlotId || !circlesOverlap(a, b)) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const overlap = a.radius + b.radius - dist;
      const normalX = dx / dist;
      const normalY = dy / dist;
      a.x -= normalX * overlap * 0.5;
      a.y -= normalY * overlap * 0.5;
      b.x += normalX * overlap * 0.5;
      b.y += normalY * overlap * 0.5;
      a.health = Math.max(0, a.health - 0.14 * tick);
      b.health = Math.max(0, b.health - 0.14 * tick);
    }
  }

  for (const drone of room.drones) {
    if (drone.health <= 0) continue;

    for (const ship of room.ships) {
      if (ship.slotId === drone.ownerSlotId || ship.respawnFrames > 0 || ship.health <= 0) continue;
      if (!circlesOverlap(drone, ship, 2)) continue;
      drone.health = Math.max(0, drone.health - 0.5 * tick);
      ship.health = Math.max(0, ship.health - 0.22 * tick);
      ship.lastDamagedBy = drone.ownerSlotId;
    }

    for (const planet of room.planets) {
      if (planet.ownerSlotId === drone.ownerSlotId || planet.rebuildTimer > 0) continue;
      if (!circlesOverlap(drone, planet, 2)) continue;
      drone.health = Math.max(0, drone.health - 0.16 * tick);
      takePlanetDamage(planet, 0.22 * tick, drone.ownerSlotId);
    }
  }
}

function updateDrones(room, tick) {
  const activeDrones = room.drones.filter((drone) => drone.health > 0);
  const dronesByOwner = new Map();
  for (const drone of activeDrones) {
    if (!dronesByOwner.has(drone.ownerSlotId)) {
      dronesByOwner.set(drone.ownerSlotId, []);
    }
    dronesByOwner.get(drone.ownerSlotId).push(drone);
  }

  for (const drone of activeDrones) {
    const ownerShip = room.ships.find((ship) => ship.slotId === drone.ownerSlotId);
    if (!ownerShip || ownerShip.respawnFrames > 0 || ownerShip.health <= 0) {
      drone.health = 0;
      continue;
    }

    const modifiers = getDroneModifiers(ownerShip);
    drone.radius = ONLINE_DRONE_RADIUS * modifiers.size;
    const allies = dronesByOwner.get(drone.ownerSlotId) || [];
    const enemies = activeDrones.filter((candidate) => candidate.ownerSlotId !== drone.ownerSlotId && candidate.health > 0);
    const forces = calculateDroneForces(room, drone, ownerShip, allies, enemies);
    const maxSpeed = ONLINE_DRONE_SPEED * modifiers.speed;

    drone.vx += (
      forces.separationX
      + forces.alignmentX
      + forces.cohesionX
      + forces.targetForceX
      + forces.edgeForceX
    ) * tick;
    drone.vy += (
      forces.separationY
      + forces.alignmentY
      + forces.cohesionY
      + forces.targetForceY
      + forces.edgeForceY
    ) * tick;

    const speed = Math.hypot(drone.vx, drone.vy);
    if (speed > maxSpeed) {
      drone.vx = (drone.vx / speed) * maxSpeed;
      drone.vy = (drone.vy / speed) * maxSpeed;
    }

    drone.x = clamp(drone.x + drone.vx * tick, drone.radius, ONLINE_WORLD.width - drone.radius);
    drone.y = clamp(drone.y + drone.vy * tick, drone.radius, ONLINE_WORLD.height - drone.radius);
    drone.heading = speed > 0.01 ? Math.atan2(drone.vy, drone.vx) : drone.heading;
    drone.attackCooldown = Math.max(0, drone.attackCooldown - tick);

    if (!forces.targetInfo.target || forces.targetInfo.targetType === 'orbit' || drone.attackCooldown > 0) {
      continue;
    }

    const targetDistance = Math.hypot(forces.targetInfo.target.x - drone.x, forces.targetInfo.target.y - drone.y);
    const attackRange = drone.radius + (forces.targetInfo.target.radius || ONLINE_SHIP_RADIUS) + 10;
    if (targetDistance > attackRange) continue;

    drone.attackCooldown = BALANCE.drone.attackCooldown;
    drone.health = 0;

    if (forces.targetInfo.targetType === 'planet') {
      takePlanetDamage(forces.targetInfo.target, BALANCE.drone.planetDamage * modifiers.damage, drone.ownerSlotId);
      continue;
    }

    if (forces.targetInfo.targetType === 'ship') {
      forces.targetInfo.target.health = Math.max(0, forces.targetInfo.target.health - BALANCE.drone.shipDamage * modifiers.damage);
      forces.targetInfo.target.lastDamagedBy = drone.ownerSlotId;
      continue;
    }

    forces.targetInfo.target.health = Math.max(0, forces.targetInfo.target.health - BALANCE.drone.attackDamage * modifiers.damage);
  }

  resolveDroneCollisions(room, tick);
  room.drones = room.drones.filter((drone) => drone.health > 0);
}

function resolveShipCollisions(room, tick) {
  for (let i = 0; i < room.ships.length; i += 1) {
    const a = room.ships[i];
    if (a.respawnFrames > 0) continue;

    for (let j = i + 1; j < room.ships.length; j += 1) {
      const b = room.ships[j];
      if (b.respawnFrames > 0) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.hypot(dx, dy) || 0.0001;
      const minimum = a.radius + b.radius + 2;
      if (distance >= minimum) continue;

      const overlap = minimum - distance;
      const normalX = dx / distance;
      const normalY = dy / distance;
      a.x -= normalX * overlap * 0.5;
      a.y -= normalY * overlap * 0.5;
      b.x += normalX * overlap * 0.5;
      b.y += normalY * overlap * 0.5;

      const relativeSpeed = Math.hypot(a.vx - b.vx, a.vy - b.vy);
      const impact = (0.15 + relativeSpeed * 0.06 + (a.boostBlend + b.boostBlend) * 0.12) * tick;
      a.health = Math.max(0, a.health - impact);
      b.health = Math.max(0, b.health - impact);
      a.lastDamagedBy = b.slotId;
      b.lastDamagedBy = a.slotId;
      a.vx -= normalX * 0.2 * tick;
      a.vy -= normalY * 0.2 * tick;
      b.vx += normalX * 0.2 * tick;
      b.vy += normalY * 0.2 * tick;
    }
  }
}

function updateItems(room, tick) {
  room.pickupEvents = room.pickupEvents.filter((event) => {
    event.life -= tick;
    return event.life > 0;
  });

  room.itemAccumulator += tick;
  if (room.itemAccumulator >= BALANCE.item.spawnRate && room.items.length < BALANCE.item.maxActive) {
    room.itemAccumulator = 0;
    room.items.push(
      createItemState(
        220 + Math.random() * (ONLINE_WORLD.width - 440),
        220 + Math.random() * (ONLINE_WORLD.height - 440),
      ),
    );
  }

  room.items = room.items.filter((item) => {
    const collector = room.ships.find((ship) => (
      ship.respawnFrames <= 0
      && Math.hypot(ship.x - item.x, ship.y - item.y) <= ship.radius + item.radius
    ));
    if (!collector) return true;
    applyItemEffect(room, collector, item);
    collector.resources += 6;
    collector.score += 8;
    room.pickupEvents.push({
      id: `pickup-${pickupSequence++}`,
      collectorSlotId: collector.slotId,
      itemTypeId: item.typeId,
      accent: ITEM_TYPES.find((type) => type.id === item.typeId)?.accent || '#d6d8de',
      life: 48,
    });
    return false;
  });
}

function updateDelayedEffects(room, tick) {
  room.delayedEffects = room.delayedEffects.filter((effect) => {
    effect.remaining -= tick;
    if (effect.remaining > 0) return true;
    if (effect.type === 'autocapture') {
      autoCaptureNearestPlanet(room, effect.slotId);
    }
    return false;
  });
}

function updatePlanets(room, tick) {
  const capturedCounts = new Map(room.ships.map((ship) => [ship.slotId, 0]));

  for (const planet of room.planets) {
    planet.impactHeat = Math.max(0, planet.impactHeat - 0.18 * tick);
    planet.recoverCooldown = Math.max(0, planet.recoverCooldown - tick);

    if (planet.rebuildTimer > 0) {
      planet.rebuildTimer = Math.max(0, planet.rebuildTimer - tick);
      if (planet.rebuildTimer <= 0 && planet.pendingOwnerSlotId) {
        const ownerSlotId = completePlanetCapture(planet);
        const ownerShip = room.ships.find((ship) => ship.slotId === ownerSlotId);
        if (ownerShip) {
          ownerShip.resources += 10;
          ownerShip.score += 15;
        }
      }
    } else {
      if (planet.revealTimer > 0) {
        planet.revealTimer = Math.max(0, planet.revealTimer - tick);
      }

      if (planet.recoverCooldown <= 0) {
        planet.health = Math.min(planet.maxHealth, planet.health + BALANCE.planet.recoverPerFrame * tick);
      }
    }

    if (planet.ownerSlotId) {
      capturedCounts.set(planet.ownerSlotId, (capturedCounts.get(planet.ownerSlotId) || 0) + 1);
    }
  }

  for (const ship of room.ships) {
    const planets = capturedCounts.get(ship.slotId) || 0;
    ship.planets = planets;
    if (ship.respawnFrames > 0) continue;
    ship.resources += planets * 0.09 * tick;
    ship.score += planets * 0.06 * tick;
  }
}

function resolveKnockouts(room) {
  for (const ship of room.ships) {
    if (ship.respawnFrames > 0 || ship.health > 0) continue;

    ship.health = 0;
    ship.respawnFrames = 240;
    ship.vx = 0;
    ship.vy = 0;
    ship.boostBlend = 0;
    ship.angularVelocity = 0;
    ship.spawnAccumulator = 0;
    ship.energy = 0;
    ship.buffs = [];
    ship.repairFlash = 0;
    ship.repairHeld = false;
    ship.arcHeld = false;
    ship.arcHoldFrames = 0;
    ship.arcChargeLevel = 0;
    ship.input = { x: 0, y: 0, boost: false, repair: false, arc: false };
    ship.resources = Math.max(12, ship.resources * 0.72);
    room.drones = room.drones.filter((drone) => drone.ownerSlotId !== ship.slotId);
    room.skillEffects = room.skillEffects.filter((effect) => effect.ownerSlotId !== ship.slotId && effect.targetSlotId !== ship.slotId);

    const killer = room.ships.find((candidate) => candidate.slotId === ship.lastDamagedBy);
    if (killer) {
      killer.resources += 16;
      killer.score += 20;
      killer.eliminations += 1;
    }
  }
}

function cleanupEmptyRooms() {
  const now = Date.now();
  for (const [roomId, room] of rooms.entries()) {
    if (room.playerCount > 0) continue;
    if (now - room.lastHumanAt < 180000) continue;
    rooms.delete(roomId);
  }
}

function stepRoom(room) {
  room.time += tickFactor;
  for (const ship of room.ships) {
    ship.input = ship.isBot ? chooseBotInput(room, ship) : normalizeInput(ship.input);
    processShipAbilityInput(room, ship, tickFactor);
    updateShipMotion(ship, tickFactor);
  }

  updateSkillEffects(room, tickFactor);
  updateDroneCaps(room);
  fillShipDroneSpawns(room);
  fillPlanetDroneSpawns(room, tickFactor);
  updateDrones(room, tickFactor);
  resolveShipCollisions(room, tickFactor);
  updateItems(room, tickFactor);
  updateDelayedEffects(room, tickFactor);
  updatePlanets(room, tickFactor);
  resolveKnockouts(room);
}

function serializeSnapshot(room) {
  const leaderboard = room.ships
    .map((ship) => ({
      slotId: ship.slotId,
      badge: ship.badge,
      name: ship.name,
      isBot: ship.isBot,
      health: Math.round(ship.health),
      energy: Math.round(ship.energy),
      resources: Math.round(ship.resources),
      planets: ship.planets,
      eliminations: ship.eliminations,
      active: ship.respawnFrames <= 0,
      score: Math.round(ship.score),
      theme: getOnlineTheme(ship.slotId),
    }))
    .sort((a, b) => (b.planets * 100 + b.resources + b.eliminations * 40) - (a.planets * 100 + a.resources + a.eliminations * 40));

  return {
    roomId: room.id,
    playerCount: room.playerCount,
    capacity: ONLINE_ROOM_CAPACITY,
    world: ONLINE_WORLD,
    ships: room.ships.map((ship) => ({
      slotId: ship.slotId,
      badge: ship.badge,
      name: ship.name,
      isBot: ship.isBot,
      x: ship.x,
      y: ship.y,
      vx: ship.vx,
      vy: ship.vy,
      angle: ship.angle,
      radius: ship.radius,
      health: ship.health,
      maxHealth: ship.maxHealth,
      energy: ship.energy,
      maxEnergy: ship.maxEnergy,
      repairCooldown: ship.repairCooldown,
      arcCooldown: ship.arcCooldown,
      arcChargeLevel: ship.arcChargeLevel || 0,
      arcHoldFrames: ship.arcHoldFrames || 0,
      repairFlash: ship.repairFlash,
      lastDamagedBy: ship.lastDamagedBy,
      resources: ship.resources,
      planets: ship.planets,
      eliminations: ship.eliminations,
      boostBlend: ship.boostBlend,
      respawnFrames: ship.respawnFrames,
      buffs: ship.buffs.map((buff) => ({
        type: buff.type,
        remaining: Math.round(buff.remaining),
        total: Math.round(buff.total),
      })),
      theme: getOnlineTheme(ship.slotId),
    })),
    planets: room.planets.map((planet) => ({
      id: planet.id,
      x: planet.x,
      y: planet.y,
      radius: planet.radius,
      health: planet.health,
      maxHealth: planet.maxHealth,
      ownerSlotId: planet.ownerSlotId,
      pendingOwnerSlotId: planet.pendingOwnerSlotId,
      captureSlotId: planet.captureSlotId,
      captureProgress: planet.captureProgress,
      impactHeat: planet.impactHeat,
      rebuildTimer: planet.rebuildTimer,
      rebuildDuration: planet.rebuildDuration,
      revealTimer: planet.revealTimer,
      revealDuration: planet.revealDuration,
    })),
    drones: room.drones.map((drone) => ({
      id: drone.id,
      ownerSlotId: drone.ownerSlotId,
      x: drone.x,
      y: drone.y,
      vx: drone.vx,
      vy: drone.vy,
      radius: drone.radius,
      heading: drone.heading,
      health: drone.health,
      maxHealth: drone.maxHealth,
      theme: getOnlineTheme(drone.ownerSlotId),
    })),
    items: room.items.map((item) => ({
      id: item.id,
      x: item.x,
      y: item.y,
      radius: item.radius,
      typeId: item.typeId,
    })),
    pickupEvents: room.pickupEvents.map((event) => ({
      id: event.id,
      collectorSlotId: event.collectorSlotId,
      itemTypeId: event.itemTypeId,
      accent: event.accent,
    })),
    skillEffects: room.skillEffects.map((effect) => ({
      id: effect.id,
      type: effect.type,
      ownerSlotId: effect.ownerSlotId,
      targetSlotId: effect.targetSlotId,
      phase: effect.phase,
      x: effect.x,
      y: effect.y,
      dx: effect.dx,
      dy: effect.dy,
      length: effect.length,
      width: effect.width,
      radius: effect.radius || 0,
      chargeRatio: effect.chargeRatio || 0,
      life: effect.life || 0,
      maxLife: effect.maxLife || 0,
    })),
    leaderboard,
  };
}

function broadcastRoom(io, room) {
  io.to(room.id).emit('match:snapshot', serializeSnapshot(room));
}

if (!fs.existsSync(distDir)) {
  console.error('dist folder is missing. Run `npm run build` first.');
  process.exit(1);
}

const httpServer = http.createServer((req, res) => {
  const filePath = resolveRequestPath(req.url || '/');
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Server error');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.emit('match:status', { state: 'connected' });

  socket.on('match:join', (payload = {}) => {
    const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId : null;
    const current = getShipBySocketId(socket.id);
    if (current) {
      socket.emit('match:joined', {
        roomId: current.room.id,
        slotId: current.ship.slotId,
        badge: current.ship.badge,
      });
      broadcastRoom(io, current.room);
      return;
    }

    const reclaimed = getShipBySessionId(sessionId);
    if (reclaimed && reclaimed.ship.socketId !== socket.id) {
      assignHumanToShip(reclaimed.room, reclaimed.ship, socket, sessionId);
      socket.join(reclaimed.room.id);
      socket.emit('match:joined', {
        roomId: reclaimed.room.id,
        slotId: reclaimed.ship.slotId,
        badge: reclaimed.ship.badge,
        playerCount: reclaimed.room.playerCount,
        capacity: ONLINE_ROOM_CAPACITY,
      });
      broadcastRoom(io, reclaimed.room);
      return;
    }

    const room = getOrCreateRoom();
    const ship = pickOpenShip(room);
    if (!ship) {
      socket.emit('match:status', { state: 'full' });
      return;
    }

    assignHumanToShip(room, ship, socket, sessionId);
    room.lastHumanAt = Date.now();

    socket.join(room.id);
    socket.emit('match:joined', {
      roomId: room.id,
      slotId: ship.slotId,
      badge: ship.badge,
      playerCount: room.playerCount,
      capacity: ONLINE_ROOM_CAPACITY,
    });
    broadcastRoom(io, room);
  });

  socket.on('match:input', (payload) => {
    const current = getShipBySocketId(socket.id);
    if (!current) return;
    current.ship.input = normalizeInput(payload);
  });

  socket.on('match:leave', () => {
    const current = getShipBySocketId(socket.id);
    if (!current) return;
    releaseShipToBot(current.room, current.ship, { clearSession: false });
    current.room.lastHumanAt = Date.now();
    socket.leave(current.room.id);
    broadcastRoom(io, current.room);
  });

  socket.on('disconnect', () => {
    const current = getShipBySocketId(socket.id);
    if (!current) return;

    releaseShipToBot(current.room, current.ship, { clearSession: false });
    current.room.lastHumanAt = Date.now();
    broadcastRoom(io, current.room);
  });
});

setInterval(() => {
  for (const room of rooms.values()) {
    stepRoom(room);
    broadcastRoom(io, room);
  }
  cleanupEmptyRooms();
}, 1000 / tickRate);

httpServer.listen(port, host, () => {
  const lanAddress = getLanAddress();
  console.log(`Multiplayer server: http://localhost:${port}`);
  console.log(`LAN multiplayer:   http://${lanAddress}:${port}`);
});






