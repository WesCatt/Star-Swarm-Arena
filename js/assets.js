const PLANET_IMAGE_URLS = {
  base: new URL('../assets/planets/Planets/planet04.png', import.meta.url).href,
  rebuiltBlue: new URL('../assets/planets/Planets/planet00.png', import.meta.url).href,
  rebuiltRed: new URL('../assets/planets/Planets/planet08.png', import.meta.url).href,
  'online-1': new URL('../assets/planets/Planets/planet00.png', import.meta.url).href,
  'online-2': new URL('../assets/planets/Planets/planet01.png', import.meta.url).href,
  'online-3': new URL('../assets/planets/Planets/planet02.png', import.meta.url).href,
  'online-4': new URL('../assets/planets/Planets/planet03.png', import.meta.url).href,
  'online-5': new URL('../assets/planets/Planets/planet05.png', import.meta.url).href,
  'online-6': new URL('../assets/planets/Planets/planet06.png', import.meta.url).href,
  'online-7': new URL('../assets/planets/Planets/planet07.png', import.meta.url).href,
  'online-8': new URL('../assets/planets/Planets/planet08.png', import.meta.url).href,
  'online-9': new URL('../assets/planets/Planets/planet09.png', import.meta.url).href,
};

const SHIP_IMAGE_URLS = {
  blue: new URL('../assets/planets/Ships/ship_0000.png', import.meta.url).href,
  red: new URL('../assets/planets/Ships/ship_0012.png', import.meta.url).href,
  'slot-1': new URL('../assets/planets/Ships/ship_0000.png', import.meta.url).href,
  'slot-2': new URL('../assets/planets/Ships/ship_0004.png', import.meta.url).href,
  'slot-3': new URL('../assets/planets/Ships/ship_0008.png', import.meta.url).href,
  'slot-4': new URL('../assets/planets/Ships/ship_0012.png', import.meta.url).href,
  'slot-5': new URL('../assets/planets/Ships/ship_0016.png', import.meta.url).href,
  'slot-6': new URL('../assets/planets/Ships/ship_0020.png', import.meta.url).href,
  'online-1': new URL('../assets/planets/Ships/ship_0000.png', import.meta.url).href,
  'online-2': new URL('../assets/planets/Ships/ship_0004.png', import.meta.url).href,
  'online-3': new URL('../assets/planets/Ships/ship_0008.png', import.meta.url).href,
  'online-4': new URL('../assets/planets/Ships/ship_0012.png', import.meta.url).href,
  'online-5': new URL('../assets/planets/Ships/ship_0016.png', import.meta.url).href,
  'online-6': new URL('../assets/planets/Ships/ship_0020.png', import.meta.url).href,
};

const ONLINE_SHIP_ALIAS = {
  'slot-1': 'online-1',
  'slot-2': 'online-2',
  'slot-3': 'online-3',
  'slot-4': 'online-4',
  'slot-5': 'online-5',
  'slot-6': 'online-6',
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

export async function loadAssets() {
  const entries = [
    ...Object.entries(PLANET_IMAGE_URLS).map(([key, url]) => [`planet:${key}`, url]),
    ...Object.entries(SHIP_IMAGE_URLS).map(([key, url]) => [`ship:${key}`, url]),
  ];
  await Promise.all(entries.map(async ([key, url]) => {
    const image = await loadImage(url);
    imageCache.set(key, image);
  }));
}

export function getPlanetTexture(key = 'base') {
  return imageCache.get(`planet:${key}`) || imageCache.get('planet:base') || null;
}

export function getShipTexture(team) {
  return imageCache.get(`ship:${team}`) || imageCache.get(`ship:${ONLINE_SHIP_ALIAS[team]}`) || null;
}

export function getOnlineShipTexture(key) {
  return imageCache.get(`ship:${key}`) || imageCache.get('ship:online-1') || getShipTexture('blue');
}

export function getOnlinePlanetTexture(key) {
  return imageCache.get(`planet:${key}`) || imageCache.get('planet:base') || null;
}
