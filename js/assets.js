const PLANET_IMAGE_URLS = {
  base: new URL('../assets/planets/Planets/planet04.png', import.meta.url).href,
  rebuiltBlue: new URL('../assets/planets/Planets/planet00.png', import.meta.url).href,
  rebuiltRed: new URL('../assets/planets/Planets/planet08.png', import.meta.url).href,
};

const SHIP_IMAGE_URLS = {
  blue: new URL('../assets/planets/Ships/ship_0000.png', import.meta.url).href,
  red: new URL('../assets/planets/Ships/ship_0012.png', import.meta.url).href,
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
  return imageCache.get(`ship:${team}`) || null;
}
