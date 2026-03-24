import { clamp, lerp, Vector2 } from './utils.js';
import { WORLD } from './config.js';

export class Camera {
  constructor() {
    this.position = new Vector2(WORLD.width * 0.5, WORLD.height * 0.5);
    this.zoom = 1;
    this.minZoom = 0.5;
    this.maxZoom = 1.2;
    this.zoomSmooth = 0.05;
    this.posSmooth = 0.1;
    this.shakeTime = 0;
    this.shakeStrength = 0;
    this.impactShakeMultiplier = 0;
    this.shakeOffset = new Vector2();
  }

  update(p1, p2, viewportWidth, viewportHeight, tick = 1) {
    const midX = (p1.pos.x + p2.pos.x) * 0.5;
    const midY = (p1.pos.y + p2.pos.y) * 0.5;
    const spanX = Math.abs(p1.pos.x - p2.pos.x) + 420;
    const spanY = Math.abs(p1.pos.y - p2.pos.y) + 320;
    const targetZoom = clamp(
      Math.min(viewportWidth / spanX, viewportHeight / spanY),
      this.minZoom,
      this.maxZoom,
    );

    this.zoom = lerp(this.zoom, targetZoom, 1 - Math.pow(1 - this.zoomSmooth, tick));
    this.position.x = lerp(this.position.x, midX, 1 - Math.pow(1 - this.posSmooth, tick));
    this.position.y = lerp(this.position.y, midY, 1 - Math.pow(1 - this.posSmooth, tick));

    const halfWidth = viewportWidth / this.zoom / 2;
    const halfHeight = viewportHeight / this.zoom / 2;

    this.position.x = clamp(this.position.x, halfWidth, WORLD.width - halfWidth);
    this.position.y = clamp(this.position.y, halfHeight, WORLD.height - halfHeight);

    this.updateShake(tick);
  }

  updateShake(tick = 1) {
    this.impactShakeMultiplier = Math.max(0, this.impactShakeMultiplier - 0.03 * tick);

    if (this.shakeTime > 0 || this.shakeStrength > 0.01) {
      this.shakeTime = Math.max(0, this.shakeTime - tick);
      const activeDamping = Math.pow(0.9, tick);
      const idleDamping = Math.pow(0.62, tick);
      this.shakeStrength *= this.shakeTime > 0 ? activeDamping : idleDamping;
      if (this.shakeStrength < 0.01) this.shakeStrength = 0;
      const intensity = this.shakeStrength;
      this.shakeOffset.set((Math.random() * 2 - 1) * intensity, (Math.random() * 2 - 1) * intensity);
    } else {
      this.shakeStrength = 0;
      this.shakeOffset.set(0, 0);
    }
  }

  apply(ctx, canvas) {
    ctx.save();
    ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.position.x + this.shakeOffset.x, -this.position.y + this.shakeOffset.y);
  }

  restore(ctx) {
    ctx.restore();
  }

  worldToScreen(x, y, canvas) {
    return {
      x: (x - this.position.x) * this.zoom + canvas.width * 0.5,
      y: (y - this.position.y) * this.zoom + canvas.height * 0.5,
    };
  }

  screenToWorld(x, y, canvas) {
    return {
      x: (x - canvas.width * 0.5) / this.zoom + this.position.x,
      y: (y - canvas.height * 0.5) / this.zoom + this.position.y,
    };
  }

  shake(strength = 10, duration = 10, { progressive = false } = {}) {
    let appliedStrength = strength;
    if (progressive) {
      this.impactShakeMultiplier = clamp(this.impactShakeMultiplier + 0.18, 0, 1);
      appliedStrength *= 0.35 + this.impactShakeMultiplier * 0.65;
    }

    this.shakeStrength = Math.max(this.shakeStrength * 0.72, appliedStrength);
    this.shakeTime = Math.max(this.shakeTime, duration);
  }

  resetShake() {
    this.shakeTime = 0;
    this.shakeStrength = 0;
    this.impactShakeMultiplier = 0;
    this.shakeOffset.set(0, 0);
  }
}
