import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TEAM_COLORS, WORLD } from '../config.js';
import { MODEL_URLS, getPlanetTexture } from '../assets.js';

function worldXToScene(x) {
  return x - WORLD.width * 0.5;
}

function worldYToScene(y) {
  return y - WORLD.height * 0.5;
}

function makeColorMaterial(hex, options = {}) {
  return new THREE.MeshStandardMaterial({
    color: hex,
    emissive: hex,
    emissiveIntensity: options.emissiveIntensity ?? 0.35,
    roughness: options.roughness ?? 0.55,
    metalness: options.metalness ?? 0.08,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    side: options.side,
  });
}

function planetModelScale(radius) {
  return radius * 0.68;
}

function shipModelScale() {
  return 22;
}

function droneModelScale(radius) {
  return radius * 0.52;
}

function smoothAngle(current, target, alpha) {
  const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + delta * alpha;
}

function visibilityScale(zoom, minBoost = 1, maxBoost = 1.9) {
  return THREE.MathUtils.clamp(1 + (1 - zoom) * 1.15, minBoost, maxBoost);
}

function bodyVisibilityScale(zoom, minBoost = 1, maxBoost = 1.12) {
  return THREE.MathUtils.clamp(1 + (1 - zoom) * 0.18, minBoost, maxBoost);
}

function planetOwnershipColor(team, palette) {
  if (team === 'neutral') return 0xb8c0cf;
  return new THREE.Color(palette.primary).lerp(new THREE.Color(palette.secondary), 0.58);
}

export class SpaceRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.45;

    this.scene = new THREE.Scene();
    this.scene.fog = null;

    this.camera = new THREE.PerspectiveCamera(42, 1, 1, 9000);
    this.clock = new THREE.Clock();

    this.planetObjects = new Map();
    this.droneObjects = new Map();
    this.itemObjects = new Map();
    this.shipObjects = new Map();
    this.particleObjects = [];
    this.planetTextures = new Map();
    this.particleTextures = {
      spark: this.createParticleTexture(false),
      ring: this.createParticleTexture(true),
    };
    this.gltfLoader = new GLTFLoader();
    this.basePlanetModel = null;
    this.baseShipModel = null;
    this.baseDroneModel = null;
    this.planetModelPromise = this.loadPlanetModel();
    this.shipModelPromise = this.loadShipModel();
    this.droneModelPromise = this.loadDroneModel();

    this.initScene();
  }

  createParticleTexture(isRing = false) {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const center = size * 0.5;

    if (isRing) {
      const gradient = ctx.createRadialGradient(center, center, size * 0.18, center, center, size * 0.5);
      gradient.addColorStop(0, 'rgba(255,255,255,0)');
      gradient.addColorStop(0.55, 'rgba(255,255,255,0)');
      gradient.addColorStop(0.7, 'rgba(255,255,255,0.95)');
      gradient.addColorStop(0.84, 'rgba(255,255,255,0.28)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    } else {
      const gradient = ctx.createRadialGradient(center, center, 0, center, center, size * 0.5);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.18, 'rgba(255,255,255,0.95)');
      gradient.addColorStop(0.45, 'rgba(255,255,255,0.3)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  createParticleSprite(type) {
    const material = new THREE.SpriteMaterial({
      map: this.particleTextures[type === 'ring' ? 'ring' : 'spark'],
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
    });
    const sprite = new THREE.Sprite(material);
    sprite.renderOrder = 12;
    sprite.userData.type = type;
    this.scene.add(sprite);
    return sprite;
  }

  createOwnerBadgeSprite() {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const center = size * 0.5;

    ctx.clearRect(0, 0, size, size);
    const glow = ctx.createRadialGradient(center, center, 0, center, center, size * 0.48);
    glow.addColorStop(0, 'rgba(255,255,255,1)');
    glow.addColorStop(0.26, 'rgba(255,255,255,0.95)');
    glow.addColorStop(0.56, 'rgba(255,255,255,0.2)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(center, center, size * 0.48, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,1)';
    ctx.beginPath();
    ctx.moveTo(center, size * 0.16);
    ctx.lineTo(size * 0.84, center);
    ctx.lineTo(center, size * 0.84);
    ctx.lineTo(size * 0.16, center);
    ctx.closePath();
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.SpriteMaterial({
      map: texture,
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const sprite = new THREE.Sprite(material);
    sprite.renderOrder = 20;
    return sprite;
  }

  createFlatSprite(color, opacity = 1) {
    const material = new THREE.SpriteMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NormalBlending,
    });
    const sprite = new THREE.Sprite(material);
    sprite.renderOrder = 18;
    return sprite;
  }

  loadPlanetModel() {
    return new Promise((resolve) => {
      this.gltfLoader.load(
        MODEL_URLS.planet,
        (gltf) => {
          this.basePlanetModel = gltf.scene;
          this.basePlanetModel.traverse((child) => {
            if (!child.isMesh) return;
            child.castShadow = false;
            child.receiveShadow = false;
          });

          for (const group of this.planetObjects.values()) {
            this.attachPlanetModel(group);
          }
          resolve(gltf.scene);
        },
        undefined,
        () => resolve(null),
      );
    });
  }

  loadShipModel() {
    return new Promise((resolve) => {
      this.gltfLoader.load(
        MODEL_URLS.ship,
        (gltf) => {
          this.baseShipModel = gltf.scene;
          this.baseShipModel.traverse((child) => {
            if (!child.isMesh) return;
            child.castShadow = false;
            child.receiveShadow = false;
          });

          for (const group of this.shipObjects.values()) {
            this.attachShipModel(group);
          }
          resolve(gltf.scene);
        },
        undefined,
        () => resolve(null),
      );
    });
  }

  loadDroneModel() {
    return new Promise((resolve) => {
      this.gltfLoader.load(
        MODEL_URLS.drone,
        (gltf) => {
          this.baseDroneModel = gltf.scene;
          this.baseDroneModel.traverse((child) => {
            if (!child.isMesh) return;
            child.castShadow = false;
            child.receiveShadow = false;
          });

          for (const group of this.droneObjects.values()) {
            this.attachDroneModel(group);
          }
          resolve(gltf.scene);
        },
        undefined,
        () => resolve(null),
      );
    });
  }

  initScene() {
    this.scene.background = new THREE.Color(0x08131f);

    const ambient = new THREE.HemisphereLight(0xe8f3ff, 0x16304d, 2.35);
    this.scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xf8fbff, 1.95);
    keyLight.position.set(420, 880, 520);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffd9ba, 1.25);
    rimLight.position.set(-460, 640, -420);
    this.scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x9cc8ff, 0.9, 3200, 2);
    fillLight.position.set(0, 520, 180);
    this.scene.add(fillLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(WORLD.width + 500, WORLD.height + 500, 1, 1),
      new THREE.MeshStandardMaterial({
        color: 0x102033,
        emissive: 0x10253d,
        emissiveIntensity: 0.36,
        roughness: 1,
        metalness: 0,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -20;
    this.scene.add(floor);

    const grid = new THREE.GridHelper(WORLD.width, WORLD.width / WORLD.grid, 0x63a8e8, 0x30557d);
    grid.position.y = -18;
    grid.material.opacity = 0.3;
    grid.material.transparent = true;
    this.scene.add(grid);

    const starGeo = new THREE.BufferGeometry();
    const starCount = 700;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * (WORLD.width + 2400);
      positions[i * 3 + 1] = 300 + Math.random() * 1200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * (WORLD.height + 2400);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xd9f0ff, size: 8, sizeAttenuation: true, transparent: true, opacity: 0.8 }),
    );
    this.scene.add(stars);

    this.worldBorder = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(WORLD.width, 10, WORLD.height)),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 }),
    );
    this.worldBorder.position.y = -14;
    this.scene.add(this.worldBorder);
  }

  resize(width, height) {
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
  }

  getPlanetMap(team) {
    if (this.planetTextures.has(team)) return this.planetTextures.get(team);
    const image = getPlanetTexture(team);
    if (!image) return null;
    const texture = new THREE.Texture(image);
    texture.needsUpdate = true;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.planetTextures.set(team, texture);
    return texture;
  }

  createPlanetObject(planet) {
    const group = new THREE.Group();

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(planet.radius, 36, 36),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.75,
        metalness: 0.05,
        emissive: 0x1c2636,
        emissiveIntensity: 0.4,
      }),
    );
    group.add(sphere);

    const ownerRing = new THREE.Mesh(
      new THREE.TorusGeometry(planet.radius * 1.15, 3.2, 12, 56),
      new THREE.MeshBasicMaterial({ color: 0xd6d8de, transparent: true, opacity: 0.85 }),
    );
    ownerRing.rotation.x = Math.PI / 2;
    ownerRing.position.y = 6;
    group.add(ownerRing);

    const healthRing = new THREE.Mesh(
      new THREE.RingGeometry(planet.radius * 1.28, planet.radius * 1.4, 64, 1, 0, Math.PI * 2),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.92, side: THREE.DoubleSide }),
    );
    healthRing.rotation.x = -Math.PI / 2;
    healthRing.position.y = 10;
    group.add(healthRing);

    const healthBarBg = this.createFlatSprite(0x0f1722, 0.86);
    healthBarBg.center.set(0.5, 0.5);
    healthBarBg.position.set(0, -planet.radius - 8, 0);
    healthBarBg.scale.set(planet.radius * 1.78, 10, 1);
    healthBarBg.userData.baseWidth = planet.radius * 1.78;
    healthBarBg.userData.baseHeight = 10;
    group.add(healthBarBg);

    const healthBarFill = this.createFlatSprite(0x8dffb2, 0.98);
    healthBarFill.center.set(0, 0.5);
    healthBarFill.position.set(-(planet.radius * 1.66) * 0.5, -planet.radius - 8, 1);
    healthBarFill.scale.set(planet.radius * 1.66, 6, 1);
    healthBarFill.userData.baseWidth = planet.radius * 1.66;
    healthBarFill.userData.baseHeight = 6;
    group.add(healthBarFill);

    const orbitRing = new THREE.Mesh(
      new THREE.TorusGeometry(planet.radius * 1.72, 1.4, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0xbfd8ee, transparent: true, opacity: 0.42 }),
    );
    orbitRing.rotation.x = Math.PI / 2 - 0.55;
    group.add(orbitRing);

    const ownerColumn = new THREE.Mesh(
      new THREE.CylinderGeometry(planet.radius * 0.72, planet.radius * 1.02, 150, 20, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xd6d8de,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    ownerColumn.position.y = 76;
    group.add(ownerColumn);

    const ownerBadge = this.createOwnerBadgeSprite();
    ownerBadge.position.y = 138;
    group.add(ownerBadge);

    const glowShell = new THREE.Mesh(
      new THREE.SphereGeometry(planet.radius * 1.22, 28, 28),
      new THREE.MeshBasicMaterial({
        color: 0xd6d8de,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide,
      }),
    );
    group.add(glowShell);

    const beacon = new THREE.PointLight(0xd6d8de, 1.25, 420, 2);
    beacon.position.set(0, 46, 0);
    group.add(beacon);

    group.userData = { sphere, model: null, ownerRing, healthRing, healthBarBg, healthBarFill, orbitRing, ownerColumn, ownerBadge, glowShell, beacon };
    this.attachPlanetModel(group);
    this.scene.add(group);
    return group;
  }

  attachPlanetModel(group) {
    if (!this.basePlanetModel || group.userData.model) return;

    const model = this.basePlanetModel.clone(true);
    model.rotation.x = 0;
    model.rotation.y = 0;
    model.rotation.z = 0;
    model.scale.setScalar(planetModelScale(group.userData.sphere.geometry.parameters.radius));
    model.visible = true;

    model.traverse((child) => {
      if (!child.isMesh) return;
      child.material = child.material.clone();
      child.material.transparent = true;
      child.material.opacity = 1;
      child.material.toneMapped = true;
    });

    group.add(model);
    group.userData.model = model;
    group.userData.sphere.visible = false;
  }

  createShipObject(team) {
    const color = TEAM_COLORS[team];
    const group = new THREE.Group();

    const hull = new THREE.Mesh(
      new THREE.ConeGeometry(34, 84, 7),
      makeColorMaterial(color.primary, { emissiveIntensity: 0.55, roughness: 0.4 }),
    );
    hull.rotation.z = Math.PI / 2;
    hull.position.y = 24;
    group.add(hull);

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(18, 18, 18),
      makeColorMaterial(color.secondary, { emissiveIntensity: 0.7, roughness: 0.3 }),
    );
    group.add(core);

    const aura = new THREE.Mesh(
      new THREE.TorusGeometry(44, 2.2, 12, 60),
      new THREE.MeshBasicMaterial({ color: color.primary, transparent: true, opacity: 0.4 }),
    );
    aura.rotation.x = Math.PI / 2;
    group.add(aura);

    const teamHalo = new THREE.Mesh(
      new THREE.CylinderGeometry(34, 54, 26, 24, 1, true),
      new THREE.MeshBasicMaterial({
        color: color.primary,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    teamHalo.position.y = 12;
    group.add(teamHalo);

    const teamMarker = new THREE.Mesh(
      new THREE.RingGeometry(30, 37, 40),
      new THREE.MeshBasicMaterial({ color: color.primary, transparent: true, opacity: 0.42, side: THREE.DoubleSide }),
    );
    teamMarker.rotation.x = -Math.PI / 2;
    teamMarker.position.y = -2;
    group.add(teamMarker);

    const teamLight = new THREE.PointLight(color.primary, 1.8, 340, 2);
    teamLight.position.set(0, 32, 0);
    group.add(teamLight);

    group.userData = { aura, hull, core, teamHalo, teamMarker, teamLight, model: null, team };
    this.attachShipModel(group);
    this.scene.add(group);
    return group;
  }

  attachShipModel(group) {
    if (!this.baseShipModel || group.userData.model) return;

    const model = this.baseShipModel.clone(true);
    model.rotation.x = Math.PI;
    model.rotation.y = Math.PI / 2;
    model.rotation.z = Math.PI;
    model.scale.setScalar(shipModelScale());

    model.traverse((child) => {
      if (!child.isMesh) return;
      child.material = child.material.clone();
      child.material.transparent = true;
      child.material.opacity = 1;
    });

    group.add(model);
    group.userData.model = model;
    group.userData.hull.visible = false;
    group.userData.core.visible = false;
  }

  createDroneObject(team) {
    const color = TEAM_COLORS[team];
    const group = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.ConeGeometry(7, 22, 5),
      makeColorMaterial(color.primary, { emissiveIntensity: 0.75, roughness: 0.35 }),
    );
    body.rotation.z = Math.PI / 2;
    group.add(body);

    const trail = new THREE.Mesh(
      new THREE.SphereGeometry(4.5, 10, 10),
      makeColorMaterial(color.secondary, { emissiveIntensity: 0.45, roughness: 0.5 }),
    );
    trail.position.x = -8;
    group.add(trail);

    const marker = new THREE.Mesh(
      new THREE.RingGeometry(8, 11, 28),
      new THREE.MeshBasicMaterial({ color: color.primary, transparent: true, opacity: 0.24, side: THREE.DoubleSide }),
    );
    marker.rotation.x = -Math.PI / 2;
    marker.position.y = -1;
    group.add(marker);

    group.userData = { body, trail, marker, model: null, team };
    this.attachDroneModel(group);
    this.scene.add(group);
    return group;
  }

  attachDroneModel(group) {
    if (!this.baseDroneModel || group.userData.model) return;

    const model = this.baseDroneModel.clone(true);
    model.rotation.x = Math.PI;
    model.rotation.y = Math.PI / 2;
    model.rotation.z = Math.PI;
    model.scale.setScalar(droneModelScale(8));

    model.traverse((child) => {
      if (!child.isMesh) return;
      child.material = child.material.clone();
      child.material.transparent = true;
      child.material.opacity = 1;
    });

    group.add(model);
    group.userData.model = model;
    group.userData.body.visible = false;
    group.userData.trail.visible = false;
  }

  createItemObject(item) {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(item.radius, 0),
      makeColorMaterial(item.type.accent, { emissiveIntensity: 0.75, roughness: 0.28, metalness: 0.18 }),
    );
    group.add(mesh);

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(item.radius * 1.1, 1.3, 8, 36),
      new THREE.MeshBasicMaterial({ color: item.type.accent, transparent: true, opacity: 0.35 }),
    );
    halo.rotation.x = Math.PI / 2;
    group.add(halo);

    group.userData = { halo };
    this.scene.add(group);
    return group;
  }

  ensureObjects(game) {
    for (const planet of game.planets) {
      if (!this.planetObjects.has(planet)) {
        this.planetObjects.set(planet, this.createPlanetObject(planet));
      }
    }

    for (const team of ['blue', 'red']) {
      if (!this.shipObjects.has(team)) {
        this.shipObjects.set(team, this.createShipObject(team));
      }
    }

    const liveDrones = new Set(game.drones);
    for (const drone of game.drones) {
      if (!this.droneObjects.has(drone)) {
        this.droneObjects.set(drone, this.createDroneObject(drone.team));
      }
    }
    for (const [drone, object] of this.droneObjects.entries()) {
      if (liveDrones.has(drone)) continue;
      this.scene.remove(object);
      this.droneObjects.delete(drone);
    }

    const liveItems = new Set(game.items);
    for (const item of game.items) {
      if (!this.itemObjects.has(item)) {
        this.itemObjects.set(item, this.createItemObject(item));
      }
    }
    for (const [item, object] of this.itemObjects.entries()) {
      if (liveItems.has(item)) continue;
      this.scene.remove(object);
      this.itemObjects.delete(item);
    }
  }

  syncCamera(game) {
    const spanX = Math.abs(game.blue.pos.x - game.red.pos.x) + 640;
    const spanZ = Math.abs(game.blue.pos.y - game.red.pos.y) + 560;
    const verticalFov = THREE.MathUtils.degToRad(this.camera.fov);
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * this.camera.aspect);
    const fitHeight = spanZ / (2 * Math.tan(verticalFov / 2));
    const fitWidth = spanX / (2 * Math.tan(horizontalFov / 2));
    const distance = Math.max(fitHeight, fitWidth, 720);
    const camX = worldXToScene(game.camera.position.x - game.camera.shakeOffset.x);
    const camZ = worldYToScene(game.camera.position.y - game.camera.shakeOffset.y);
    this.camera.position.set(camX, distance * 0.9, camZ + distance * 0.82);
    this.camera.lookAt(camX, 0, camZ - distance * 0.12);
  }

  updatePlanets(game) {
    for (const planet of game.planets) {
      const group = this.planetObjects.get(planet);
      const { sphere, model, ownerRing, healthRing, healthBarBg, healthBarFill, orbitRing, ownerColumn, ownerBadge, glowShell, beacon } = group.userData;
      const team = planet.pendingOwner || planet.owner || 'neutral';
      const palette = TEAM_COLORS[team];
      const readableScale = visibilityScale(game.camera.zoom, 1, 2.15);
      const planetBodyScale = bodyVisibilityScale(game.camera.zoom, 1, 1.08);
      const texture = this.getPlanetMap(team);
      if (texture && sphere.material.map !== texture) {
        sphere.material.map = texture;
        sphere.material.needsUpdate = true;
      }

      group.position.set(worldXToScene(planet.pos.x), 0, worldYToScene(planet.pos.y));
      sphere.rotation.y += 0.003;
      sphere.position.y = planet.rebuildTimer > 0 ? -8 + planet.getRebuildProgress() * 10 : 0;
      sphere.scale.setScalar((planet.rebuildTimer > 0 ? Math.max(0.12, planet.getRebuildProgress()) : 1) * planetBodyScale);
      sphere.visible = !model;
      sphere.material.emissive.set(0x000000);
      sphere.material.emissiveIntensity = 0;

      const ownershipColor = planetOwnershipColor(team, palette);
      ownerRing.material.color.set(ownershipColor);
      ownerRing.material.opacity = planet.pendingOwner ? 1 : 0.96;
      ownerRing.scale.setScalar(planetBodyScale * 1.02);
      ownerRing.rotation.z += 0.003;

      const healthRatio = THREE.MathUtils.clamp(planet.health / planet.maxHealth, 0, 1);
      healthRing.visible = false;
      healthBarBg.visible = true;
      healthBarBg.position.set(0, -planet.radius - 18, 0);
      healthBarBg.scale.set(
        healthBarBg.userData.baseWidth * readableScale,
        healthBarBg.userData.baseHeight * readableScale,
        1,
      );
      healthBarFill.visible = true;
      healthBarFill.material.color.set(healthRatio > 0.55 ? 0x8dffb2 : healthRatio > 0.25 ? 0xffd36a : 0xff7b7b);
      healthBarFill.position.set(
        (-healthBarFill.userData.baseWidth * 0.5) * readableScale,
        -planet.radius - 18,
        1,
      );
      healthBarFill.scale.set(
        healthBarFill.userData.baseWidth * Math.max(healthRatio, 0.02) * readableScale,
        healthBarFill.userData.baseHeight * readableScale,
        1,
      );

      orbitRing.visible = false;

      ownerColumn.visible = false;

      ownerBadge.material.color.set(team === 'neutral' ? 0xe7ebf3 : ownershipColor);
      ownerBadge.material.opacity = team === 'neutral' ? 0.78 : 1;
      ownerBadge.position.y = 138 + Math.sin(game.time * 0.003 + planet.pulse) * 6;
      ownerBadge.scale.setScalar((planet.radius * 0.78) * readableScale);

      glowShell.visible = false;

      beacon.intensity = 0;
      beacon.distance = 0;

      if (model) {
        model.visible = true;
        model.position.y = planet.rebuildTimer > 0 ? -12 + planet.getRebuildProgress() * 14 : 0;
        model.rotation.y += 0.003;
        model.scale.setScalar(planetModelScale(planet.radius) * (planet.rebuildTimer > 0 ? Math.max(0.12, planet.getRebuildProgress()) : 1) * planetBodyScale);
        model.traverse((child) => {
          if (!child.isMesh) return;
          if ('emissive' in child.material) {
            child.material.emissive.set(0x000000);
            child.material.emissiveIntensity = 0;
          }
          if ('metalness' in child.material) child.material.metalness = Math.min(child.material.metalness ?? 0, 0.18);
          if ('roughness' in child.material) child.material.roughness = Math.min(child.material.roughness ?? 1, 0.92);
          child.material.opacity = planet.rebuildTimer > 0 ? 0.22 + planet.getRebuildProgress() * 0.78 : 1;
        });
      }
    }
  }

  updateShips(game) {
    for (const team of ['blue', 'red']) {
      const ship = team === 'blue' ? game.blue : game.red;
      const group = this.shipObjects.get(team);
      const palette = TEAM_COLORS[team];
      const readableScale = visibilityScale(game.camera.zoom, 1, 1.8);
      const shipBodyScale = bodyVisibilityScale(game.camera.zoom, 1, 1.06);
      group.position.set(worldXToScene(ship.pos.x), 12, worldYToScene(ship.pos.y));
      const targetYaw = -ship.angle;
      group.rotation.y = smoothAngle(group.rotation.y, targetYaw, 0.14);
      group.userData.aura.rotation.z += 0.01;
      group.scale.setScalar((1 + Math.sin(game.time * 0.004 + (team === 'blue' ? 0 : 1.5)) * 0.015) * shipBodyScale);
      group.userData.aura.visible = !group.userData.model;
      group.userData.aura.material.color.set(palette.primary);
      group.userData.aura.material.opacity = 0.28;
      group.userData.teamHalo.material.color.set(palette.primary);
      group.userData.teamHalo.material.opacity = 0.18 + Math.sin(game.time * 0.005 + (team === 'blue' ? 0 : 1.5)) * 0.03;
      group.userData.teamMarker.material.color.set(palette.primary);
      group.userData.teamMarker.material.opacity = 0.54;
      group.userData.teamMarker.scale.setScalar(readableScale * 1.08);
      group.userData.teamLight.color.set(palette.primary);
      group.userData.teamLight.intensity = 2.4;
      group.userData.teamLight.distance = 420 * readableScale;

      if (group.userData.model) {
        group.userData.model.position.y = 0;
        group.userData.model.traverse((child) => {
          if (!child.isMesh) return;
          if ('emissive' in child.material) {
            child.material.emissive.set(0x11161d);
            child.material.emissiveIntensity = 0.05;
          }
        });
      }
    }
  }

  updateDrones(game) {
    for (const drone of game.drones) {
      const group = this.droneObjects.get(drone);
      const palette = TEAM_COLORS[drone.team];
      const readableScale = visibilityScale(game.camera.zoom, 1, 1.5);
      const droneBodyScale = bodyVisibilityScale(game.camera.zoom, 1, 1.04);
      group.position.set(worldXToScene(drone.pos.x), 8, worldYToScene(drone.pos.y));
      group.rotation.y = -drone.heading;
      group.scale.setScalar((drone.radius / drone.baseRadius) * droneBodyScale);
      group.userData.marker.material.color.set(palette.primary);
      group.userData.marker.scale.setScalar(readableScale);

      if (group.userData.model) {
        group.userData.model.scale.setScalar(droneModelScale(drone.baseRadius) * (drone.radius / drone.baseRadius));
        group.userData.model.traverse((child) => {
          if (!child.isMesh) return;
          if ('emissive' in child.material) {
            child.material.emissive.set(0x11161d);
            child.material.emissiveIntensity = 0.04;
          }
        });
      }
    }
  }

  updateItems(game) {
    for (const item of game.items) {
      const group = this.itemObjects.get(item);
      group.position.set(worldXToScene(item.pos.x), 18 + Math.sin(item.pulse) * 4, worldYToScene(item.pos.y));
      group.rotation.y += 0.02;
      group.rotation.x += 0.01;
      group.userData.halo.rotation.z += 0.018;
    }
  }

  syncParticles(game) {
    const particles = game.particles;
    while (this.particleObjects.length < particles.length) {
      this.particleObjects.push(this.createParticleSprite('spark'));
    }
    while (this.particleObjects.length > particles.length) {
      const sprite = this.particleObjects.pop();
      sprite.material.dispose();
      this.scene.remove(sprite);
    }

    for (let i = 0; i < particles.length; i += 1) {
      const particle = particles[i];
      let sprite = this.particleObjects[i];
      if (sprite.userData.type !== particle.type) {
        sprite.material.dispose();
        this.scene.remove(sprite);
        sprite = this.createParticleSprite(particle.type);
        this.particleObjects[i] = sprite;
      }
      const maxLife = particle.maxLife || 42;
      const alpha = Math.max(0, particle.life / maxLife);
      const height = particle.height || 0;
      const wobbleX = Math.cos((particle.wobble || 0) + i * 0.7) * (particle.type === 'ring' ? 0 : 4);
      const wobbleZ = Math.sin((particle.wobble || 0) + i * 0.5) * (particle.type === 'ring' ? 0 : 4);
      sprite.visible = true;
      sprite.position.set(
        worldXToScene(particle.x) + wobbleX,
        8 + height + alpha * (particle.type === 'ring' ? 8 : 14),
        worldYToScene(particle.y) + wobbleZ,
      );
      sprite.material.color.set(particle.color);
      sprite.material.opacity = particle.type === 'ring' ? alpha * 0.34 : alpha * 0.72;
      const scale = particle.type === 'ring' ? particle.size * 0.6 : particle.size * 1.55;
      sprite.scale.set(scale, scale, 1);
    }
  }

  render(game) {
    this.ensureObjects(game);
    this.syncCamera(game);
    this.updatePlanets(game);
    this.updateShips(game);
    this.updateDrones(game);
    this.updateItems(game);
    this.syncParticles(game);
    this.renderer.render(this.scene, this.camera);
  }
}
