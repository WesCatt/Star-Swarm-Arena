import { BALANCE, TEAM_COLORS, WORLD } from './config.js';
import { Camera } from './camera.js';
import { resolveCircleCollision, overlapsCircle } from './collision.js';
import { Controls } from './controls.js';
import { Drone } from './entities/drone.js';
import { Item } from './entities/item.js';
import { Mothership } from './entities/mothership.js';
import { Planet } from './entities/planet.js';
import { UI } from './ui.js';
import { Vector2, clamp, distance, pick, rand } from './utils.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ui = new UI();
    this.controls = new Controls(canvas);
    this.camera = new Camera();
    this.state = 'start';
    this.lastTime = performance.now();
    this.time = 0;
    this.stars = this.createStars();
    this.delayedEffects = [];
    this.particles = [];

    this.ui.bindCallbacks({
      onStart: () => this.beginMatch(),
      onRestart: () => this.restartMatch(),
    });

    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.setupMatch();
  }

  createStars() {
    return Array.from({ length: WORLD.stars }, () => ({
      x: rand(0, WORLD.width),
      y: rand(0, WORLD.height),
      size: rand(1, 3.2),
      depth: rand(0.3, 1),
      alpha: rand(0.35, 0.95),
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
    this.blue = new Mothership('blue', 300, WORLD.height * 0.5);
    this.red = new Mothership('red', WORLD.width - 300, WORLD.height * 0.5);
    this.drones = [];
    this.items = [];
    this.particles = [];
    this.delayedEffects = [];
    this.itemAccumulator = 0;

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
        const strength = clamp((info.impactHeat - 1.6) * 0.85, 0.28, 3.2);
        const duration = clamp(2.2 + (info.impactHeat - 1) * 0.5, 2.2, 5.4);
        this.camera.shake(strength, duration);
      };
      planet.onShattered = (capturedPlanet, team) => {
        this.spawnBurst(capturedPlanet.pos.x, capturedPlanet.pos.y, TEAM_COLORS[team].primary, 42, 3.2);
        this.spawnShockwave(capturedPlanet.pos.x, capturedPlanet.pos.y, TEAM_COLORS[team].primary, capturedPlanet.radius * 0.55, 2);
        this.camera.shake(30, 15);
      };
      planet.onCaptured = (capturedPlanet, team) => {
        this.spawnBurst(capturedPlanet.pos.x, capturedPlanet.pos.y, TEAM_COLORS[team].primary, 18, 1.35);
        this.spawnShockwave(capturedPlanet.pos.x, capturedPlanet.pos.y, TEAM_COLORS[team].primary, capturedPlanet.radius * 0.28, 0.9);
      };
    }

    this.camera.position.set(WORLD.width * 0.5, WORLD.height * 0.5);
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

  queueAutocapture(team, seconds) {
    this.delayedEffects.push({ type: 'autocapture', team, remaining: seconds * 60 });
  }

  neutralizeRandomEnemyPlanet(team) {
    const candidates = this.planets.filter((planet) => planet.owner && planet.owner !== team);
    if (!candidates.length) return;
    pick(candidates).setNeutral();
  }

  autoCaptureNearestPlanet(team) {
    const mothership = team === 'blue' ? this.blue : this.red;
    const candidates = this.planets.filter((planet) => planet.owner !== team);
    if (!candidates.length) return;
    candidates.sort((a, b) => distance(a.pos, mothership.pos) - distance(b.pos, mothership.pos));
    candidates[0].shatter(team);
    this.spawnBurst(candidates[0].pos.x, candidates[0].pos.y, TEAM_COLORS[team].primary, 20);
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

  spawnBurst(x, y, color, count, scale = 1) {
    for (let i = 0; i < count; i += 1) {
      this.particles.push({
        type: 'spark',
        x,
        y,
        vx: Math.cos((Math.PI * 2 * i) / count + rand(-0.4, 0.4)) * rand(0.4, 2.8) * scale,
        vy: Math.sin((Math.PI * 2 * i) / count + rand(-0.4, 0.4)) * rand(0.4, 2.8) * scale,
        life: rand(18, 42),
        maxLife: 42,
        size: rand(1.5, 4.5) * scale,
        color,
        drag: rand(0.9, 0.95),
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
      return false;
    });
  }

  shatterDrone(drone, target = null) {
    if (!drone || drone.health <= 0) return;

    drone.destroyedByImpact = true;
    drone.health = 0;
    this.spawnBurst(drone.pos.x, drone.pos.y, TEAM_COLORS[drone.team].primary, 24, 2.1);
    this.spawnShockwave(drone.pos.x, drone.pos.y, TEAM_COLORS[drone.team].primary, 10, 0.9);

    if (!target?.pos) return;

    const impactColor = target.team ? TEAM_COLORS[target.team].primary : target.owner ? TEAM_COLORS[target.owner].primary : TEAM_COLORS.neutral.primary;
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
        this.spawnBurst(drone.pos.x, drone.pos.y, TEAM_COLORS[drone.team].primary, 8);
      }
    }
    this.drones = alive;
  }

  updatePlaying(tick) {
    const blueInput = this.controls.getMoveVector('blue');
    const redInput = this.controls.getMoveVector('red');
    this.blue.onDroneImpact = (drone, target) => this.shatterDrone(drone, target);
    this.red.onDroneImpact = (drone, target) => this.shatterDrone(drone, target);

    const blueReady = this.blue.update(blueInput, tick, WORLD);
    const redReady = this.red.update(redInput, tick, WORLD);
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
      this.spawnBurst(
        winner === 'blue' ? this.red.pos.x : this.blue.pos.x,
        winner === 'blue' ? this.red.pos.y : this.blue.pos.y,
        TEAM_COLORS[winner].primary,
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
      stateLabel: this.state === 'playing' ? 'Battle Live' : this.state === 'victory' ? 'Awaiting Restart' : 'Stand By',
      tip: `${this.planets.filter((planet) => !planet.owner).length} neutral planets remain. Item cap: ${BALANCE.item.maxActive}.`,
    };
  }

  renderBackground() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);

    const sky = ctx.createLinearGradient(0, 0, 0, this.viewportHeight);
    sky.addColorStop(0, '#05111d');
    sky.addColorStop(1, '#091a2a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);

    for (const star of this.stars) {
      const x = (star.x - this.camera.position.x) * star.depth * this.camera.zoom + this.viewportWidth * 0.5;
      const y = (star.y - this.camera.position.y) * star.depth * this.camera.zoom + this.viewportHeight * 0.5;
      if (x < -10 || x > this.viewportWidth + 10 || y < -10 || y > this.viewportHeight + 10) continue;
      ctx.fillStyle = `rgba(219, 240, 255, ${star.alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, star.size * star.depth, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderWorld() {
    const ctx = this.ctx;
    this.camera.apply(ctx, { width: this.viewportWidth, height: this.viewportHeight });

    const worldGradient = ctx.createLinearGradient(0, 0, WORLD.width, WORLD.height);
    worldGradient.addColorStop(0, 'rgba(15, 32, 54, 0.45)');
    worldGradient.addColorStop(1, 'rgba(5, 12, 24, 0.9)');
    ctx.fillStyle = worldGradient;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    ctx.strokeStyle = 'rgba(126, 184, 227, 0.08)';
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

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, WORLD.width, WORLD.height);

    this.planets.forEach((planet) => planet.draw(ctx));
    this.items.forEach((item) => item.draw(ctx));
    this.drones.forEach((drone) => drone.draw(ctx));
    this.blue.draw(ctx);
    this.red.draw(ctx);

    for (const particle of this.particles) {
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

    this.camera.restore(ctx);
  }

  renderTouchUi() {
    const ctx = this.ctx;
    ctx.save();

    for (const team of ['blue', 'red']) {
      const state = this.controls.getJoystickState(team);
      if (!state) continue;
      const color = TEAM_COLORS[team].primary;
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
