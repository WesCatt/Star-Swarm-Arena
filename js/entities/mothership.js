import { BALANCE, BUFF_LABELS, TEAM_COLORS } from '../config.js';
import { getShipTexture } from '../assets.js';
import { Vector2, clamp, rand } from '../utils.js';

function normalizeAngle(angle) {
  let wrapped = angle;
  while (wrapped > Math.PI) wrapped -= Math.PI * 2;
  while (wrapped < -Math.PI) wrapped += Math.PI * 2;
  return wrapped;
}

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
    this.boostMultiplier = BALANCE.mothership.boostMultiplier ?? 1.7;
    this.boostTransition = BALANCE.mothership.boostTransition ?? 0.16;
    this.boostBlend = 0;
    this.spawnAccumulator = 0;
    this.auraRotationA = rand(0, Math.PI * 2);
    this.auraRotationB = rand(0, Math.PI * 2);
    this.angle = team === 'blue' ? 0 : Math.PI;
    this.turnSpeed = BALANCE.mothership.turnSpeed ?? 0.16;
    this.turnAcceleration = BALANCE.mothership.turnAcceleration ?? 0.03;
    this.turnDrag = BALANCE.mothership.turnDrag ?? 0.84;
    this.angularVelocity = 0;
    this.thrusterPulse = rand(0, Math.PI * 2);
    this.buffs = new Map();
    this.onDroneImpact = null;
  }

  update(input, boosting, tick, world) {
    this.updateBuffs(tick);
    const boostEase = 1 - Math.pow(1 - this.boostTransition, tick);
    this.boostBlend += ((boosting ? 1 : 0) - this.boostBlend) * boostEase;
    this.boostBlend = clamp(this.boostBlend, 0, 1);
    const driveMultiplier = this.getShipSpeedMultiplier() * (1 + this.boostBlend * (this.boostMultiplier - 1));

    if (input.length() > 0.01) {
      const thrust = input.clone().normalize().scale(this.acceleration * driveMultiplier * tick);
      this.vel.add(thrust);
      const targetAngle = Math.atan2(input.y, input.x);
      const angleDelta = normalizeAngle(targetAngle - this.angle);
      const turnBoost = driveMultiplier;
      const steerForce = clamp(angleDelta * this.turnAcceleration * turnBoost, -this.turnAcceleration * 2.2, this.turnAcceleration * 2.2);
      this.angularVelocity += steerForce * tick;
      const maxTurn = this.turnSpeed * turnBoost;
      this.angularVelocity = clamp(this.angularVelocity, -maxTurn, maxTurn);
    }

    this.angle += this.angularVelocity * tick;
    this.angularVelocity *= Math.pow(this.turnDrag, tick);
    this.angle = normalizeAngle(this.angle);

    this.vel.scale(Math.pow(this.friction, tick));
    this.vel.limit(this.maxSpeed * driveMultiplier);
    this.pos.add(this.vel.clone().scale(tick));

    this.pos.x = clamp(this.pos.x, this.radius, world.width - this.radius);
    this.pos.y = clamp(this.pos.y, this.radius, world.height - this.radius);

    this.spawnAccumulator += tick;
    this.auraRotationA += 0.015 * tick;
    this.auraRotationB -= 0.011 * tick;
    this.thrusterPulse += 0.18 * tick;

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
      type,
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
      type: buff.type,
      label: buff.label,
      remaining: buff.remaining,
      total: buff.total,
    }));
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
  }

  draw(ctx) {
    const { glow } = this.color;
    const shipTexture = getShipTexture(this.team);

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.angle);

    const speed = this.vel.length();
    if (speed > 0.18 || this.boostBlend > 0.05) {
      const boostFlare = this.boostBlend * 32;
      const flameLength = 26 + speed * 5.8 + Math.sin(this.thrusterPulse) * (5.2 + this.boostBlend * 5.8) + boostFlare;
      const flameWidth = 11 + this.boostBlend * 8.5;
      ctx.fillStyle = `rgba(255, 214, 132, ${0.82 + this.boostBlend * 0.18})`;
      ctx.beginPath();
      ctx.moveTo(-this.radius + 3, 0);
      ctx.lineTo(-this.radius - flameLength * (0.94 + this.boostBlend * 0.08), flameWidth * 1.28);
      ctx.lineTo(-this.radius - 11, 0);
      ctx.lineTo(-this.radius - flameLength * (0.94 + this.boostBlend * 0.08), -flameWidth * 1.28);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = `rgba(255, 120, 72, ${0.18 + this.boostBlend * 0.24})`;
      ctx.beginPath();
      ctx.moveTo(-this.radius + 2, 0);
      ctx.lineTo(-this.radius - flameLength, flameWidth);
      ctx.lineTo(-this.radius - 6, 0);
      ctx.lineTo(-this.radius - flameLength, -flameWidth);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = `rgba(255, 248, 230, ${0.74 + this.boostBlend * 0.2})`;
      ctx.beginPath();
      ctx.moveTo(-this.radius + 1, 0);
      ctx.lineTo(-this.radius - flameLength * 0.72, 5.4 + this.boostBlend * 3.8);
      ctx.lineTo(-this.radius - 7, 0);
      ctx.lineTo(-this.radius - flameLength * 0.72, -5.4 - this.boostBlend * 3.8);
      ctx.closePath();
      ctx.fill();

      if (this.boostBlend > 0.12) {
        ctx.fillStyle = `rgba(123, 223, 255, ${0.28 + this.boostBlend * 0.34})`;
        ctx.beginPath();
        ctx.moveTo(-this.radius - 8, 0);
        ctx.lineTo(-this.radius - flameLength * 0.52, 3.2 + this.boostBlend * 2.8);
        ctx.lineTo(-this.radius - flameLength * 1.02, 0);
        ctx.lineTo(-this.radius - flameLength * 0.52, -3.2 - this.boostBlend * 2.8);
        ctx.closePath();
        ctx.fill();
      }
    }

    if (shipTexture) {
      const shipWidth = this.radius * 2.5;
      const shipHeight = this.radius * 1.7;

      ctx.save();
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(shipTexture, -shipWidth * 0.5, -shipHeight * 0.5, shipWidth, shipHeight);
      ctx.restore();

      ctx.strokeStyle = glow;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 2, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(235, 242, 255, 0.95)';
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
    }
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
