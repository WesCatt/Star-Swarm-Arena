import { BALANCE, TEAM_COLORS } from '../config.js';
import { getPlanetTexture } from '../assets.js';
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
    this.ringAngle = rand(0, Math.PI * 2);
    this.ringTilt = rand(0.22, 0.42);
    this.ringTiltPhase = rand(0, Math.PI * 2);
    this.ringOffset = rand(-4, 4);
    this.recoverCooldown = 0;
    this.spawnAccumulator = rand(0, BALANCE.planet.supportSpawnRate);
    this.impactHeat = 0;
    this.onDamaged = null;
    this.onShattered = null;
    this.onCaptured = null;
    this.pendingOwner = null;
    this.rebuildTimer = 0;
    this.rebuildDuration = 68;
    this.revealTimer = 0;
    this.revealDuration = 18;
    this.texturePhase = 'base';
    this.fragments = Array.from({ length: 28 }, (_, index) => ({
      angle: (Math.PI * 2 * index) / 28 + rand(-0.22, 0.22),
      orbit: rand(this.radius * 1.35, this.radius * 2.35),
      size: rand(1.8, 5.5),
      drift: rand(-12, 12),
      phase: rand(0, Math.PI * 2),
      swirl: rand(0.55, 1.35),
      inwardOffset: rand(0.15, 0.95),
    }));
  }

  update(tick) {
    this.pulse += 0.02 * tick;
    this.ringAngle += 0.0045 * tick;
    this.ringTiltPhase += 0.011 * tick;
    this.recoverCooldown = Math.max(0, this.recoverCooldown - tick);
    this.impactHeat = Math.max(0, this.impactHeat - 0.18 * tick);

    if (this.rebuildTimer > 0) {
      this.rebuildTimer = Math.max(0, this.rebuildTimer - tick);
      if (this.rebuildTimer <= 0 && this.pendingOwner) {
        this.completeCapture();
      }
      return 0;
    }

    if (this.revealTimer > 0) {
      this.revealTimer = Math.max(0, this.revealTimer - tick);
    }

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
    if (this.rebuildTimer > 0) return;
    this.health -= amount;
    this.recoverCooldown = BALANCE.planet.recoverDelay;
    this.impactHeat = Math.min(8, this.impactHeat + 1);
    this.onDamaged?.(this, team, {
      amount,
      impactHeat: this.impactHeat,
      willCapture: this.health <= 0,
    });
    if (this.health <= 0) {
      this.shatter(team);
    }
  }

  shatter(team) {
    const previousOwner = this.owner;
    this.owner = null;
    this.pendingOwner = team;
    this.health = 0;
    this.spawnAccumulator = 0;
    this.rebuildTimer = this.rebuildDuration;
    this.revealTimer = 0;
    this.onShattered?.(this, team, previousOwner);
  }

  completeCapture() {
    const team = this.pendingOwner;
    const previousOwner = this.owner;
    this.pendingOwner = null;
    this.owner = team;
    this.texturePhase = team === 'blue' ? 'rebuiltBlue' : team === 'red' ? 'rebuiltRed' : 'base';
    this.revealTimer = this.revealDuration;
    this.health = this.maxHealth * BALANCE.planet.captureRestore;
    this.spawnAccumulator = 120;
    this.onCaptured?.(this, team, previousOwner);
  }

  shouldSupport(target) {
    return Boolean(this.owner && target && target.team === this.owner);
  }

  setNeutral() {
    this.owner = null;
    this.pendingOwner = null;
    this.health = this.maxHealth * 0.45;
    this.spawnAccumulator = 0;
    this.rebuildTimer = 0;
  }

  getDisplayPalette() {
    if (this.pendingOwner) return TEAM_COLORS[this.pendingOwner];
    return this.owner ? TEAM_COLORS[this.owner] : TEAM_COLORS.neutral;
  }

  getRebuildProgress() {
    if (this.rebuildTimer <= 0) return 1;
    return 1 - this.rebuildTimer / this.rebuildDuration;
  }

  getRevealProgress() {
    if (this.revealTimer <= 0) return 1;
    return 1 - this.revealTimer / this.revealDuration;
  }

  draw(ctx) {
    const palette = this.getDisplayPalette();
    const texture = getPlanetTexture(this.texturePhase);
    const glowRadius = this.radius + 20 + Math.sin(this.pulse) * 4;
    const ringRadiusX = this.radius + 22;
    const ringTiltWave = 0.2 + Math.abs(Math.sin(this.ringTiltPhase)) * 0.34;
    const ringRadiusY = ringRadiusX * (this.ringTilt * 0.45 + ringTiltWave * 0.55);
    const ringDrift = Math.sin(this.pulse * 0.8) * 1.8 + Math.cos(this.ringTiltPhase * 0.9) * 1.6;
    const ringShear = Math.sin(this.ringTiltPhase) * 0.08;
    const ringGlow = `${palette.primary}66`;
    const ringCore = `${palette.primary}dd`;
    const ringEdge = `${palette.secondary}7a`;
    const rebuildProgress = this.getRebuildProgress();
    const revealProgress = this.getRevealProgress();
    const isRebuilding = this.rebuildTimer > 0;

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);

    const drawRingBand = (isFront) => {
      ctx.save();
      ctx.rotate(this.ringAngle);
      ctx.transform(1, 0, ringShear, 1, 0, this.ringOffset + ringDrift);
      ctx.beginPath();
      ctx.rect(-ringRadiusX - 30, isFront ? 0 : -ringRadiusX, ringRadiusX * 2 + 60, ringRadiusX);
      ctx.clip();

      const ringGradient = ctx.createLinearGradient(-ringRadiusX, 0, ringRadiusX, 0);
      ringGradient.addColorStop(0, isFront ? ringEdge : `${palette.secondary}36`);
      ringGradient.addColorStop(0.5, isFront ? ringCore : ringGlow);
      ringGradient.addColorStop(1, isFront ? ringEdge : `${palette.secondary}36`);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadiusX + 2, ringRadiusY + 1.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = ringGradient;
      ctx.lineWidth = isFront ? 7 : 6;
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadiusX, ringRadiusY, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = isFront ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadiusX + 5, ringRadiusY + 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    if (!isRebuilding || rebuildProgress > 0.28) {
      drawRingBand(false);
    }

    ctx.fillStyle = palette.glow;
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    if (!isRebuilding) {
      ctx.fill();
    } else {
      ctx.globalAlpha = 0.1 + rebuildProgress * 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    const gradient = ctx.createRadialGradient(-12, -12, 8, 0, 0, this.radius);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.14, palette.primary);
    gradient.addColorStop(1, palette.secondary);
    ctx.fillStyle = gradient;
    if (isRebuilding) {
      const spreadPhase = Math.min(1, rebuildProgress / 0.42);
      const gatherPhase = rebuildProgress < 0.42 ? 0 : (rebuildProgress - 0.42) / 0.58;
      const coreRadius = this.radius * Math.max(0, (gatherPhase - 0.28) / 0.72);

      ctx.globalAlpha = 0.08 + gatherPhase * 0.55;
      ctx.beginPath();
      ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      for (const fragment of this.fragments) {
        const reactionBurst = 0.45 + Math.sin(spreadPhase * Math.PI) * 1.1;
        const gatherPull = 1 - gatherPhase;
        const radius = fragment.orbit * (gatherPhase > 0 ? gatherPull * (0.45 + fragment.inwardOffset) : reactionBurst);
        const angle = fragment.angle
          + this.ringAngle * fragment.swirl
          + spreadPhase * (1.8 + fragment.swirl)
          - gatherPhase * (0.9 + fragment.swirl * 0.4);
        const wobble = Math.sin(this.pulse * 1.3 + fragment.phase + rebuildProgress * 10) * (6 + fragment.drift * 0.3);
        const x = Math.cos(angle) * radius + Math.cos(fragment.phase + rebuildProgress * 8) * wobble * 0.22;
        const y = Math.sin(angle) * radius * 0.72 + fragment.drift * (gatherPhase > 0 ? gatherPull : 1) + wobble * 0.16;
        const particleSize = fragment.size * (gatherPhase > 0 ? 0.65 + gatherPhase * 0.75 : 0.85 + Math.sin(spreadPhase * Math.PI) * 0.2);

        const fragmentGradient = ctx.createRadialGradient(x - particleSize * 0.3, y - particleSize * 0.3, 0, x, y, particleSize * 1.8);
        fragmentGradient.addColorStop(0, '#ffffff');
        fragmentGradient.addColorStop(0.32, palette.primary);
        fragmentGradient.addColorStop(1, `${palette.secondary}00`);
        ctx.fillStyle = fragmentGradient;
        ctx.globalAlpha = 0.2 + Math.sin(rebuildProgress * Math.PI) * 0.25 + gatherPhase * 0.45;
        ctx.beginPath();
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 0.14 + gatherPhase * 0.36;
      ctx.strokeStyle = palette.primary;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * (0.22 + gatherPhase * 0.5), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else {
      if (texture) {
        const revealScale = 0.92 + revealProgress * 0.08;

        ctx.save();
        ctx.globalAlpha = revealProgress;
        ctx.scale(revealScale, revealScale);
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(texture, -this.radius, -this.radius, this.radius * 2, this.radius * 2);

        // Keep the new planet art, but lightly tint it so team ownership still reads quickly.
        const tintGradient = ctx.createLinearGradient(-this.radius, -this.radius, this.radius, this.radius);
        tintGradient.addColorStop(0, `${palette.primary}18`);
        tintGradient.addColorStop(0.55, 'rgba(255, 255, 255, 0.04)');
        tintGradient.addColorStop(1, `${palette.secondary}3a`);
        ctx.fillStyle = tintGradient;
        ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);

        const shadowGradient = ctx.createRadialGradient(this.radius * 0.15, this.radius * 0.2, this.radius * 0.1, 0, 0, this.radius * 1.15);
        shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        shadowGradient.addColorStop(1, 'rgba(3, 10, 20, 0.26)');
        ctx.fillStyle = shadowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (revealProgress < 1) {
          ctx.save();
          ctx.globalAlpha = (1 - revealProgress) * 0.35;
          ctx.strokeStyle = palette.primary;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(0, 0, this.radius * (0.88 + revealProgress * 0.2), 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 3;
    if (this.rebuildTimer <= 0) {
      ctx.stroke();
    }

    if (!isRebuilding || rebuildProgress > 0.62) {
      drawRingBand(true);
    }

    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 2);
    if (this.rebuildTimer <= 0) {
      ctx.stroke();
    }

    ctx.strokeStyle = palette.primary;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (this.health / this.maxHealth));
    if (this.rebuildTimer <= 0) {
      ctx.stroke();
    }
    ctx.restore();
  }
}
