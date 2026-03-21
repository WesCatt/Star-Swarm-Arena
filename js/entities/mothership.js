import { BALANCE, BUFF_LABELS, TEAM_COLORS } from '../config.js';
import { Vector2, clamp, rand } from '../utils.js';

export class Mothership {
  constructor(team, x, y) {
    this.kind = 'mothership';
    this.team = team;
    this.color = TEAM_COLORS[team];
    this.pos = new Vector2(x, y);
    this.vel = new Vector2();
    this.radius = BALANCE.mothership.radius;
    this.maxHealth = BALANCE.mothership.health;
    this.health = this.maxHealth;
    this.acceleration = BALANCE.mothership.acceleration;
    this.maxSpeed = BALANCE.mothership.maxSpeed;
    this.friction = BALANCE.mothership.friction;
    this.spawnAccumulator = 0;
    this.auraRotationA = rand(0, Math.PI * 2);
    this.auraRotationB = rand(0, Math.PI * 2);
    this.angle = team === 'blue' ? 0 : Math.PI;
    this.buffs = new Map();
  }

  update(input, tick, world) {
    this.updateBuffs(tick);

    if (input.length() > 0.01) {
      const thrust = input.clone().normalize().scale(this.acceleration * this.getShipSpeedMultiplier() * tick);
      this.vel.add(thrust);
      this.angle = Math.atan2(input.y, input.x);
    }

    this.vel.scale(Math.pow(this.friction, tick));
    this.vel.limit(this.maxSpeed * this.getShipSpeedMultiplier());
    this.pos.add(this.vel.clone().scale(tick));

    this.pos.x = clamp(this.pos.x, this.radius, world.width - this.radius);
    this.pos.y = clamp(this.pos.y, this.radius, world.height - this.radius);

    this.spawnAccumulator += tick;
    this.auraRotationA += 0.015 * tick;
    this.auraRotationB -= 0.011 * tick;

    let ready = 0;
    const actualRate = this.getActualSpawnRate();
    while (this.spawnAccumulator >= actualRate) {
      this.spawnAccumulator -= actualRate;
      ready += 1;
      if (ready >= 4) {
        break;
      }
    }

    return ready;
  }

  getSpawnPosition() {
    const offset = Vector2.fromAngle(this.angle + rand(-0.8, 0.8), this.radius + rand(8, 20));
    return this.pos.clone().add(offset);
  }

  getSpawnRate() {
    return BALANCE.mothership.spawnRate;
  }

  getActualSpawnRate() {
    return this.getSpawnRate() / this.getBuffMultiplier('production', 1);
  }

  applyBuff(type, data) {
    this.buffs.set(type, {
      ...data,
      remaining: data.duration * 60,
      total: data.duration * 60,
      label: BUFF_LABELS[type] || type,
    });
  }

  updateBuffs(tick) {
    for (const [key, buff] of this.buffs.entries()) {
      buff.remaining -= tick;
      if (buff.remaining <= 0) {
        this.buffs.delete(key);
      }
    }
  }

  getBuffMultiplier(type, fallback = 1) {
    return this.buffs.get(type)?.multiplier ?? fallback;
  }

  getShipSpeedMultiplier() {
    return this.getBuffMultiplier('shipSpeed', 1);
  }

  getDroneModifiers() {
    return {
      size: this.getBuffMultiplier('droneSize', 1),
      speed: this.getBuffMultiplier('droneSpeed', 1),
      damage: this.getBuffMultiplier('droneDamage', 1),
    };
  }

  getActiveBuffs() {
    return [...this.buffs.values()].map((buff) => ({
      label: buff.label,
      remaining: buff.remaining,
      total: buff.total,
    }));
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
  }

  draw(ctx) {
    const { primary, secondary, glow } = this.color;

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.angle);

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 16, 0, Math.PI * 2);
    ctx.fill();

    if (this.vel.length() > 0.25) {
      ctx.fillStyle = 'rgba(255, 216, 136, 0.72)';
      ctx.beginPath();
      ctx.moveTo(-this.radius + 2, 0);
      ctx.lineTo(-this.radius - 22 - this.vel.length() * 2.6, 8);
      ctx.lineTo(-this.radius - 8, 0);
      ctx.lineTo(-this.radius - 22 - this.vel.length() * 2.6, -8);
      ctx.closePath();
      ctx.fill();
    }

    const hullGradient = ctx.createLinearGradient(-this.radius, -this.radius, this.radius, this.radius);
    hullGradient.addColorStop(0, primary);
    hullGradient.addColorStop(1, secondary);
    ctx.fillStyle = hullGradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.moveTo(this.radius - 2, 0);
    ctx.lineTo(-8, -14);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-8, 14);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 10, this.auraRotationA, this.auraRotationA + Math.PI * 1.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 17, this.auraRotationB, this.auraRotationB + Math.PI * 1.45);
    ctx.stroke();

    let offset = -0.8;
    for (const buff of this.getActiveBuffs()) {
      const progress = buff.remaining / buff.total;
      ctx.strokeStyle = 'rgba(255, 213, 116, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 24 + offset * 2, offset, offset + Math.PI * 0.9 * progress);
      ctx.stroke();
      offset += 0.72;
    }
    ctx.restore();
  }
}
