const PLANET_IMAGE_URLS = {
  blue: new URL('../assets/planets/planet-blue.svg', import.meta.url).href,
  red: new URL('../assets/planets/planet-red.svg', import.meta.url).href,
  neutral: new URL('../assets/planets/planet-neutral.svg', import.meta.url).href,
};

export const MODEL_URLS = {
  planet: new URL('../assets/models/stylized_planet.glb', import.meta.url).href,
  ship: new URL('../assets/models/spaceship.glb', import.meta.url).href,
  drone: new URL('../assets/models/drone.glb', import.meta.url).href,
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
  const entries = Object.entries(PLANET_IMAGE_URLS);
  await Promise.all(entries.map(async ([key, url]) => {
    const image = await loadImage(url);
    imageCache.set(key, image);
  }));
}

export function getPlanetTexture(team) {
  return imageCache.get(team) || null;
}
