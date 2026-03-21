export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  scale(s) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  length() {
    return Math.hypot(this.x, this.y);
  }

  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }

  normalize() {
    const len = this.length();
    if (len > 0) {
      this.x /= len;
      this.y /= len;
    }
    return this;
  }

  limit(max) {
    const lenSq = this.lengthSq();
    if (lenSq > max * max) {
      this.normalize().scale(max);
    }
    return this;
  }

  distanceTo(v) {
    return Math.hypot(this.x - v.x, this.y - v.y);
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  static fromAngle(angle, length = 1) {
    return new Vector2(Math.cos(angle) * length, Math.sin(angle) * length);
  }
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(start, end, alpha) {
  return start + (end - start) * alpha;
}

export function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getPoint(entity) {
  if (entity && typeof entity.x === 'number' && typeof entity.y === 'number') {
    return entity;
  }
  if (entity && entity.pos && typeof entity.pos.x === 'number' && typeof entity.pos.y === 'number') {
    return entity.pos;
  }
  return { x: 0, y: 0 };
}

export function distance(a, b) {
  const pointA = getPoint(a);
  const pointB = getPoint(b);
  return Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y);
}

export function padTime(frames) {
  return (frames / 60).toFixed(1) + 's';
}
