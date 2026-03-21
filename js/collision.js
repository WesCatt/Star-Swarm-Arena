import { distance } from './utils.js';

export function overlapsCircle(a, b, padding = 0) {
  const radius = (a.radius || 0) + (b.radius || 0) + padding;
  return distance(a, b) < radius;
}

export function resolveCircleCollision(a, b, push = 0.5) {
  const dx = b.pos.x - a.pos.x;
  const dy = b.pos.y - a.pos.y;
  const dist = Math.hypot(dx, dy) || 0.001;
  const minDist = a.radius + b.radius;
  const overlap = minDist - dist;

  if (overlap <= 0) {
    return;
  }

  const nx = dx / dist;
  const ny = dy / dist;
  const offset = overlap * push;

  a.pos.x -= nx * offset;
  a.pos.y -= ny * offset;
  b.pos.x += nx * offset;
  b.pos.y += ny * offset;

  a.vel.x -= nx * 0.08;
  a.vel.y -= ny * 0.08;
  b.vel.x += nx * 0.08;
  b.vel.y += ny * 0.08;
}
