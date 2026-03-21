import { BALANCE, TEAM_COLORS } from '../config.js';
import { Vector2, rand } from '../utils.js';

export class Planet {
  constructor(x, y, radius = BALANCE.planet.radius) {
    this.kind = 'planet';
    this.pos = new Vector2(x, y);
    this.radius = radius;
    this.maxHealth = BALANCE.planet.health;
    this.health = this.maxHealth;
    this.owner = null;
    this.pulse = rand(0, Math.PI * 2);
    this.recoverCooldown = 0;
    this.spawnAccumulator = rand(0, BALANCE.planet.supportSpawnRate);
  }

  update(tick) {
    this.pulse += 0.02 * tick;
    this.recoverCooldown = Math.max(0, this.recoverCooldown - tick);

    if (this.recoverCooldown <= 0) {
      this.health = Math.min(this.maxHealth, this.health + BALANCE.planet.recoverPerFrame * tick);
    }

    if (!this.owner || this.health / this.maxHealth <= BALANCE.planet.supportThreshold) {
      return 0;
    }

    this.spawnAccumulator += tick;
    let ready = 0;
    while (this.spawnAccumulator >= BALANCE.planet.supportSpawnRate) {
      this.spawnAccumulator -= BALANCE.planet.supportSpawnRate;
      ready += 1;
    }
    return ready;
  }

  takeDamage(amount, team) {
    this.health -= amount;
    this.recoverCooldown = BALANCE.planet.recoverDelay;
    if (this.health <= 0) {
      this.onDeath(team);
    }
  }

  onDeath(team) {
    this.owner = team;
    this.health = this.maxHealth * BALANCE.planet.captureRestore;
    this.spawnAccumulator = 120;
  }

  shouldSupport(target) {
    return Boolean(this.owner && target && target.team === this.owner);
  }

  setNeutral() {
    this.owner = null;
    this.health = this.maxHealth * 0.45;
    this.spawnAccumulator = 0;
  }

  draw(ctx) {
    const palette = this.owner ? TEAM_COLORS[this.owner] : TEAM_COLORS.neutral;
    const glowRadius = this.radius + 20 + Math.sin(this.pulse) * 4;

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);

    ctx.fillStyle = palette.glow;
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    const gradient = ctx.createRadialGradient(-12, -12, 8, 0, 0, this.radius);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.14, palette.primary);
    gradient.addColorStop(1, palette.secondary);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = palette.primary;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (this.health / this.maxHealth));
    ctx.stroke();
    ctx.restore();
  }
}
