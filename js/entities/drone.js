import { BALANCE, TEAM_COLORS } from '../config.js';
import { Vector2, rand } from '../utils.js';

export class Drone {
  constructor(team, x, y) {
    this.team = team;
    this.color = TEAM_COLORS[team];
    this.pos = new Vector2(x, y);
    this.vel = Vector2.fromAngle(rand(0, Math.PI * 2), rand(0.2, 1.2));
    this.radius = BALANCE.drone.radius;
    this.baseRadius = BALANCE.drone.radius;
    this.maxHealth = BALANCE.drone.health;
    this.health = this.maxHealth;
    this.senseRange = BALANCE.drone.senseRange;
    this.attackCooldown = rand(0, BALANCE.drone.attackCooldown);
    this.heading = rand(0, Math.PI * 2);
    this.orbitSeed = rand(0, Math.PI * 2);
  }

  calculateForces(allies, enemies, mothership, enemyMothership, planets, world, time) {
    const separation = new Vector2();
    const alignment = new Vector2();
    const cohesion = new Vector2();
    let closeAllies = 0;
    let farAllies = 0;

    for (const ally of allies) {
      if (ally === this) continue;
      const dx = this.pos.x - ally.pos.x;
      const dy = this.pos.y - ally.pos.y;
      const dist = Math.hypot(dx, dy) || 0.001;

      if (dist < 18) {
        separation.x += dx / dist;
        separation.y += dy / dist;
        closeAllies += 1;
      }

      if (dist < 70) {
        alignment.add(ally.vel);
        cohesion.add(ally.pos);
        farAllies += 1;
      }
    }

    if (closeAllies > 0) {
      separation.scale(1 / closeAllies).normalize().scale(0.62);
    }

    if (farAllies > 0) {
      alignment.scale(1 / farAllies).normalize().scale(0.22);
      cohesion.scale(1 / farAllies).subtract(this.pos).normalize().scale(0.2);
    }

    let target = null;
    let targetDistance = Infinity;

    for (const enemy of enemies) {
      const dist = this.pos.distanceTo(enemy.pos);
      if (dist < Math.max(this.senseRange, 150) && dist < targetDistance) {
        target = enemy;
        targetDistance = dist;
      }
    }

    const enemyShipDistance = this.pos.distanceTo(enemyMothership.pos);
    if (enemyShipDistance < 220 && enemyShipDistance < targetDistance) {
      target = enemyMothership;
      targetDistance = enemyShipDistance;
    }

    for (const planet of planets) {
      if (planet.owner === this.team) continue;
      const dist = this.pos.distanceTo(planet.pos);
      if (dist < 260 && dist < targetDistance) {
        target = planet;
        targetDistance = dist;
      }
    }

    const targetForce = new Vector2();
    if (target) {
      targetForce.set(target.pos.x - this.pos.x, target.pos.y - this.pos.y).normalize().scale(target.kind === 'planet' ? 0.48 : 0.56);
    } else {
      const orbitRadius = 74 + (this.orbitSeed % 1) * 44;
      const orbitTarget = mothership.pos.clone().add(Vector2.fromAngle(this.orbitSeed + time * 0.002, orbitRadius));
      targetForce.set(orbitTarget.x - this.pos.x, orbitTarget.y - this.pos.y).normalize().scale(0.3);
    }

    const edgeForce = new Vector2();
    if (this.pos.x < 120) edgeForce.x += 1;
    if (this.pos.x > world.width - 120) edgeForce.x -= 1;
    if (this.pos.y < 120) edgeForce.y += 1;
    if (this.pos.y > world.height - 120) edgeForce.y -= 1;
    edgeForce.normalize().scale(0.42);

    return { separation, alignment, cohesion, targetForce, edgeForce, target };
  }

  flock(allies, enemies, mothership, enemyMothership, planets, world, tick, time) {
    const forces = this.calculateForces(allies, enemies, mothership, enemyMothership, planets, world, time);
    const modifiers = mothership.getDroneModifiers();
    this.radius = this.baseRadius * modifiers.size;
    const maxSpeed = BALANCE.drone.maxSpeed * modifiers.speed;

    this.vel
      .add(forces.separation.scale(tick))
      .add(forces.alignment.scale(tick))
      .add(forces.cohesion.scale(tick))
      .add(forces.targetForce.scale(tick))
      .add(forces.edgeForce.scale(tick))
      .limit(maxSpeed);

    this.update(tick);
    this.tryAttack(forces.target, modifiers);
  }

  tryAttack(target, modifiers) {
    this.attackCooldown = Math.max(0, this.attackCooldown - 1);
    if (!target || this.attackCooldown > 0) return;

    const attackRange = this.radius + target.radius + 10;
    if (this.pos.distanceTo(target.pos) > attackRange) return;

    this.attackCooldown = BALANCE.drone.attackCooldown;
    const damageScale = modifiers.damage;

    if (target.kind === 'mothership') {
      target.takeDamage(BALANCE.drone.shipDamage * damageScale);
      this.takeDamage(1.5);
      return;
    }

    if (target.kind === 'planet') {
      target.takeDamage(BALANCE.drone.planetDamage * damageScale, this.team);
      this.takeDamage(0.7);
      return;
    }

    target.takeDamage(BALANCE.drone.attackDamage * damageScale);
  }

  update(tick) {
    this.pos.add(this.vel.clone().scale(tick));
    this.heading = this.vel.length() > 0.01 ? this.vel.angle() : this.heading;
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
  }

  draw(ctx) {
    const { primary, secondary, glow } = this.color;

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.heading);

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.moveTo(-this.radius * 1.1, 0);
    ctx.lineTo(-this.radius * 2.3, 0);
    ctx.lineTo(-this.radius * 1.8, this.radius * 0.7);
    ctx.lineTo(-this.radius * 1.4, 0);
    ctx.lineTo(-this.radius * 1.8, -this.radius * 0.7);
    ctx.closePath();
    ctx.fill();

    const bodyGradient = ctx.createLinearGradient(-this.radius, -this.radius, this.radius, this.radius);
    bodyGradient.addColorStop(0, primary);
    bodyGradient.addColorStop(1, secondary);
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(this.radius * 1.45, 0);
    ctx.lineTo(-this.radius * 0.7, this.radius * 0.82);
    ctx.lineTo(-this.radius * 0.5, 0);
    ctx.lineTo(-this.radius * 0.7, -this.radius * 0.82);
    ctx.closePath();
    ctx.fill();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.86)';
    ctx.stroke();
    ctx.restore();
  }
}
