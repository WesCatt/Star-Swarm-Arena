export const ONLINE_ROOM_CAPACITY = 6;
export const ONLINE_WORLD = {
  width: 3200,
  height: 2200,
};
export const ONLINE_CAMERA_VIEW = {
  width: 1760,
  height: 990,
};

export const ONLINE_SOCKET_PORT = 3001;
export const ONLINE_SHIP_RADIUS = 28;
export const ONLINE_MAX_HEALTH = 100;
export const ONLINE_MAX_ENERGY = 100;
export const ONLINE_CHUNK_SIZE = 768;
export const ONLINE_DRONE_RADIUS = 8;
export const ONLINE_DRONE_HEALTH = 30;
export const ONLINE_DRONE_SPEED = 2.8;
export const ONLINE_DRONE_BASE_CAP = 30;
export const ONLINE_DRONE_PLANET_BONUS = 10;
export const ONLINE_SHIP_DRONE_SPAWN_RATE = 30;
export const ONLINE_PLANET_DRONE_SPAWN_RATE = 240;
export const ONLINE_REPAIR_COOLDOWN = 18 * 60;
export const ONLINE_ARC_STRIKE_COOLDOWN = 6 * 60;
export const ONLINE_ARC_HOLD_THRESHOLD = 20;
export const ONLINE_ARC_CHARGE_MAX = 140;
export const ONLINE_ARC_STRIKE_ORBIT_TURNS = 3;
export const ONLINE_ARC_STRIKE_ORBIT_SPEED = 0.22;
export const ONLINE_ARC_STRIKE_ORBIT_RADIUS = 88;
export const ONLINE_ARC_STRIKE_LENGTH = 126;
export const ONLINE_ARC_STRIKE_WIDTH = 7;
export const ONLINE_ARC_STRIKE_SPEED = 10.5;
export const ONLINE_ARC_STRIKE_DAMAGE = 34;
export const ONLINE_ARC_STRIKE_MAX_TRAVEL = 860;
export const ONLINE_ARC_LASER_BASE_COOLDOWN = 18 * 60;
export const ONLINE_ARC_LASER_BONUS_COOLDOWN = 10 * 60;
export const ONLINE_ARC_LASER_MIN_LENGTH = 220;
export const ONLINE_ARC_LASER_MAX_LENGTH = 560;
export const ONLINE_ARC_LASER_MIN_WIDTH = 12;
export const ONLINE_ARC_LASER_MAX_WIDTH = 28;
export const ONLINE_ARC_LASER_MIN_DAMAGE = 26;
export const ONLINE_ARC_LASER_MAX_DAMAGE = 76;
export const ONLINE_ARC_LASER_LIFE = 18;
export const ONLINE_ARC_ORB_BASE_COOLDOWN = 18 * 60;
export const ONLINE_ARC_ORB_BONUS_COOLDOWN = 10 * 60;
export const ONLINE_ARC_ORB_PAUSE = 14;
export const ONLINE_ARC_ORB_HEAD_OFFSET = 18;
export const ONLINE_ARC_ORB_MIN_RADIUS = 12;
export const ONLINE_ARC_ORB_MAX_RADIUS = 24;
export const ONLINE_ARC_ORB_MIN_SPEED = 9.5;
export const ONLINE_ARC_ORB_MAX_SPEED = 18.5;
export const ONLINE_ARC_ORB_MIN_DAMAGE = 28;
export const ONLINE_ARC_ORB_MAX_DAMAGE = 78;
export const ONLINE_ARC_ORB_MAX_TRAVEL = 3600;

export const ONLINE_SLOT_THEMES = [
  { slotId: 'slot-1', badge: 'P1', callsign: 'Azure', primary: '#4fd4ff', secondary: '#0f6cdd', glow: 'rgba(79, 212, 255, 0.28)' },
  { slotId: 'slot-2', badge: 'P2', callsign: 'Ember', primary: '#ff8a7a', secondary: '#e14d55', glow: 'rgba(255, 138, 122, 0.28)' },
  { slotId: 'slot-3', badge: 'P3', callsign: 'Solar', primary: '#ffd36f', secondary: '#d6861b', glow: 'rgba(255, 211, 111, 0.26)' },
  { slotId: 'slot-4', badge: 'P4', callsign: 'Mint', primary: '#7cffd8', secondary: '#14b88e', glow: 'rgba(124, 255, 216, 0.24)' },
  { slotId: 'slot-5', badge: 'P5', callsign: 'Nova', primary: '#8fb7ff', secondary: '#4268ff', glow: 'rgba(143, 183, 255, 0.26)' },
  { slotId: 'slot-6', badge: 'P6', callsign: 'Flare', primary: '#ffb46b', secondary: '#ff6d3a', glow: 'rgba(255, 180, 107, 0.26)' },
];

const ONLINE_LAYOUT_REFERENCE = {
  width: 2600,
  height: 1800,
};

function scaleOnlinePlanet(id, x, y, radius) {
  return {
    id,
    x: ONLINE_WORLD.width * (x / ONLINE_LAYOUT_REFERENCE.width),
    y: ONLINE_WORLD.height * (y / ONLINE_LAYOUT_REFERENCE.height),
    radius: radius * 1.08,
  };
}

export const ONLINE_PLANET_LAYOUT = [
  scaleOnlinePlanet('planet-a', 430, 430, 72),
  scaleOnlinePlanet('planet-b', 1300, 280, 66),
  scaleOnlinePlanet('planet-c', 2170, 430, 72),
  scaleOnlinePlanet('planet-d', 560, 930, 70),
  scaleOnlinePlanet('planet-e', 1300, 900, 86),
  scaleOnlinePlanet('planet-f', 2040, 930, 70),
  scaleOnlinePlanet('planet-g', 430, 1420, 72),
  scaleOnlinePlanet('planet-h', 1300, 1540, 68),
  scaleOnlinePlanet('planet-i', 2170, 1420, 72),
];

export const ONLINE_SHIP_TEXTURES = {
  'slot-1': 'online-1',
  'slot-2': 'online-2',
  'slot-3': 'online-3',
  'slot-4': 'online-4',
  'slot-5': 'online-5',
  'slot-6': 'online-6',
};

export const ONLINE_PLANET_TEXTURES = [
  'online-1',
  'online-2',
  'online-3',
  'online-4',
  'online-5',
  'online-6',
  'online-7',
  'online-8',
  'online-9',
];

export const ONLINE_OWNER_PLANET_TEXTURES = {
  'slot-1': 'online-1',
  'slot-2': 'online-2',
  'slot-3': 'online-3',
  'slot-4': 'online-4',
  'slot-5': 'online-5',
  'slot-6': 'online-6',
};

export function getOnlineTheme(slotId) {
  return ONLINE_SLOT_THEMES.find((theme) => theme.slotId === slotId) || ONLINE_SLOT_THEMES[0];
}

export function getOnlinePlanetTextureForOwner(slotId) {
  return ONLINE_OWNER_PLANET_TEXTURES[slotId] || 'base';
}

export function getOnlineSpawnPoint(index) {
  const angle = (-Math.PI / 2) + (Math.PI * 2 * index) / ONLINE_ROOM_CAPACITY;
  const radius = 690;
  return {
    x: ONLINE_WORLD.width * 0.5 + Math.cos(angle) * radius,
    y: ONLINE_WORLD.height * 0.5 + Math.sin(angle) * radius,
  };
}
