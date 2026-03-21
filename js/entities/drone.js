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
    this.destroyedByImpact = false;
    this.currentTarget = null;
    this.targetLock = 0;
  }

  isTargetValid(target, enemies, enemyMothership, planets) {
    if (!target || target.health <= 0) return false;

    if (target.kind === 'planet') {
      return (
        planets.includes(target)
        && target.owner !== this.team
        && target.pendingOwner !== this.team
        && target.rebuildTimer <= 0
        && this.pos.distanceTo(target.pos) < 1200
      );
    }

    if (target.kind === 'mothership') {
      return target === enemyMothership && target.health > 0 && this.pos.distanceTo(target.pos) < 280;
    }

    return enemies.includes(target) && target.health > 0 && this.pos.distanceTo(target.pos) < Math.max(this.senseRange * 2.1, 180);
  }

  pickTarget(enemies, enemyMothership, planets) {
    if (this.targetLock > 0 && this.isTargetValid(this.currentTarget, enemies, enemyMothership, planets)) {
      return this.currentTarget;
    }

    let target = null;
    let bestScore = Infinity;
    let nearestPlanet = null;
    let nearestPlanetDistance = Infinity;
    let globalPlanet = null;
    let globalPlanetScore = Infinity;

    for (const planet of planets) {
      if (planet.owner === this.team || planet.pendingOwner === this.team || planet.rebuildTimer > 0) continue;
      const dist = this.pos.distanceTo(planet.pos);
      if (dist < nearestPlanetDistance) {
        nearestPlanet = planet;
        nearestPlanetDistance = dist;
      }
      const captureBias = planet.owner ? 0.92 : 1;
      const score = dist * 0.68 * captureBias;
      if (score < globalPlanetScore) {
        globalPlanet = planet;
        globalPlanetScore = score;
      }
      if (dist > 520) continue;
      if (score < bestScore) {
        target = planet;
        bestScore = score;
      }
    }

    if (nearestPlanet && nearestPlanetDistance < 360) {
      this.currentTarget = nearestPlanet;
      this.targetLock = 40;
      return nearestPlanet;
    }

    if (globalPlanet) {
      this.currentTarget = globalPlanet;
      this.targetLock = 24;
      return globalPlanet;
    }

    for (const enemy of enemies) {
      if (enemy.health <= 0) continue;
      const dist = this.pos.distanceTo(enemy.pos);
      if (dist > Math.max(this.senseRange, 125)) continue;
      const score = dist * 1.08;
      if (score < bestScore) {
        target = enemy;
        bestScore = score;
      }
    }

    const enemyShipDistance = this.pos.distanceTo(enemyMothership.pos);
    if (enemyMothership.health > 0 && enemyShipDistance < 230) {
      const score = enemyShipDistance * 0.94;
      if (score < bestScore) {
        target = enemyMothership;
      }
    }

    this.currentTarget = target;
    this.targetLock = target?.kind === 'planet' ? 28 : target ? 12 : 0;
    return target;
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

    const target = this.pickTarget(enemies, enemyMothership, planets);
    const lockedOnPlanet = target?.kind === 'planet';
    if (lockedOnPlanet) {
      alignment.scale(0.35);
      cohesion.scale(0.25);
    }

    const targetForce = new Vector2();
    if (target) {
      const baseForce = target.kind === 'planet' ? 1.22 : target.kind === 'mothership' ? 0.58 : 0.52;
      const lockBoost = target === this.currentTarget ? 0.12 : 0;
      targetForce.set(target.pos.x - this.pos.x, target.pos.y - this.pos.y).normalize().scale(baseForce + lockBoost);
    } else {
      this.currentTarget = null;
      this.targetLock = 0;
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
    this.targetLock = Math.max(0, this.targetLock - tick);

    this.vel
      .add(forces.separation.scale(tick))
      .add(forces.alignment.scale(tick))
      .add(forces.cohesion.scale(tick))
      .add(forces.targetForce.scale(tick))
      .add(forces.edgeForce.scale(tick))
      .limit(maxSpeed);

    if (forces.target?.kind === 'planet') {
      const attackVector = new Vector2(forces.target.pos.x - this.pos.x, forces.target.pos.y - this.pos.y);
      const planetDistance = attackVector.length() || 1;
      attackVector.normalize();
      const homingStrength = planetDistance > 280 ? 0.62 : 0.4;
      this.vel.scale(0.88).add(attackVector.scale(homingStrength * tick)).limit(maxSpeed);
    }

    this.update(tick);
    this.tryAttack(forces.target, modifiers, mothership);
  }

  tryAttack(target, modifiers, mothership) {
    this.attackCooldown = Math.max(0, this.attackCooldown - 1);
    if (!target || this.attackCooldown > 0) return;

    const attackRange = this.radius + target.radius + (target.kind === 'planet' ? 34 : 10);
    if (this.pos.distanceTo(target.pos) > attackRange) return;

    this.attackCooldown = BALANCE.drone.attackCooldown;
    const damageScale = modifiers.damage;
    const impactEffect = mothership?.onDroneImpact;

    if (target.kind === 'mothership') {
      target.takeDamage(BALANCE.drone.shipDamage * damageScale);
      impactEffect?.(this, target);
      return;
    }

    if (target.kind === 'planet') {
      target.takeDamage(BALANCE.drone.planetDamage * damageScale, this.team);
      impactEffect?.(this, target);
      return;
    }

    target.takeDamage(BALANCE.drone.attackDamage * damageScale);
    impactEffect?.(this, target);
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
