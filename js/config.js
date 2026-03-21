export const WORLD = {
  width: 2000,
  height: 2000,
  stars: 150,
  grid: 100,
  planets: 6,
};

export const TEAM_COLORS = {
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

export const BALANCE = {
  mothership: {
    radius: 28,
    health: 100,
    acceleration: 0.2,
    maxSpeed: 3,
    friction: 0.95,
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

export const ITEM_TYPES = [
  { id: 'ship-speed', icon: 'thruster', name: 'Ship Speed', description: 'Mothership speed +50% for 3 seconds.', duration: 3, accent: '#75f2ff' },
  { id: 'production', icon: 'factory', name: 'Production', description: 'Drone output doubles for 3 seconds.', duration: 3, accent: '#ffd95a' },
  { id: 'drone-size', icon: 'expand', name: 'Drone Size', description: 'Drone body size +80% for 3 seconds.', duration: 3, accent: '#ffb05c' },
  { id: 'drone-speed', icon: 'bolt', name: 'Drone Speed', description: 'Drone speed +50% for 3 seconds.', duration: 3, accent: '#7cffd8' },
  { id: 'drone-attack', icon: 'crosshair', name: 'Attack x2', description: 'Drone damage doubles for 3 seconds.', duration: 3, accent: '#ff8a7a' },
  { id: 'neutralize', icon: 'eclipse', name: 'Neutralize', description: 'One enemy planet is reset to neutral instantly.', duration: 0, accent: '#c8d1ff' },
  { id: 'autocapture', icon: 'flag', name: 'Auto Capture', description: 'Claims the nearest planet after 3 seconds.', duration: 3, accent: '#b2ff8e' },
];

export const BUFF_LABELS = {
  shipSpeed: 'Ship Speed',
  production: 'Production',
  droneSize: 'Drone Size',
  droneSpeed: 'Drone Speed',
  droneDamage: 'Attack x2',
  autocapture: 'Auto Capture',
};
