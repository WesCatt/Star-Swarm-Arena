export const ONLINE_ROOM_CAPACITY = 6;
export const ONLINE_WORLD = {
  width: 2600,
  height: 1800,
};

export const ONLINE_SOCKET_PORT = 3001;
export const ONLINE_SHIP_RADIUS = 28;
export const ONLINE_MAX_HEALTH = 100;
export const ONLINE_MAX_ENERGY = 100;
export const ONLINE_CHUNK_SIZE = 512;
export const ONLINE_DRONE_RADIUS = 8;
export const ONLINE_DRONE_HEALTH = 30;
export const ONLINE_DRONE_SPEED = 2.8;
export const ONLINE_DRONE_BASE_CAP = 30;
export const ONLINE_DRONE_PLANET_BONUS = 10;
export const ONLINE_SHIP_DRONE_SPAWN_RATE = 30;
export const ONLINE_PLANET_DRONE_SPAWN_RATE = 240;

export const ONLINE_SLOT_THEMES = [
  { slotId: 'slot-1', badge: 'P1', callsign: 'Azure', primary: '#4fd4ff', secondary: '#0f6cdd', glow: 'rgba(79, 212, 255, 0.28)' },
  { slotId: 'slot-2', badge: 'P2', callsign: 'Ember', primary: '#ff8a7a', secondary: '#e14d55', glow: 'rgba(255, 138, 122, 0.28)' },
  { slotId: 'slot-3', badge: 'P3', callsign: 'Solar', primary: '#ffd36f', secondary: '#d6861b', glow: 'rgba(255, 211, 111, 0.26)' },
  { slotId: 'slot-4', badge: 'P4', callsign: 'Mint', primary: '#7cffd8', secondary: '#14b88e', glow: 'rgba(124, 255, 216, 0.24)' },
  { slotId: 'slot-5', badge: 'P5', callsign: 'Nova', primary: '#8fb7ff', secondary: '#4268ff', glow: 'rgba(143, 183, 255, 0.26)' },
  { slotId: 'slot-6', badge: 'P6', callsign: 'Flare', primary: '#ffb46b', secondary: '#ff6d3a', glow: 'rgba(255, 180, 107, 0.26)' },
];

export const ONLINE_PLANET_LAYOUT = [
  { id: 'planet-a', x: 430, y: 430, radius: 72 },
  { id: 'planet-b', x: 1300, y: 280, radius: 66 },
  { id: 'planet-c', x: 2170, y: 430, radius: 72 },
  { id: 'planet-d', x: 560, y: 930, radius: 70 },
  { id: 'planet-e', x: 1300, y: 900, radius: 86 },
  { id: 'planet-f', x: 2040, y: 930, radius: 70 },
  { id: 'planet-g', x: 430, y: 1420, radius: 72 },
  { id: 'planet-h', x: 1300, y: 1540, radius: 68 },
  { id: 'planet-i', x: 2170, y: 1420, radius: 72 },
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
  const radius = 560;
  return {
    x: ONLINE_WORLD.width * 0.5 + Math.cos(angle) * radius,
    y: ONLINE_WORLD.height * 0.5 + Math.sin(angle) * radius,
  };
}
