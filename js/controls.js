import { Vector2 } from './utils.js';

export class Controls {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.codes = new Set();
    this.touchBoost = {
      blue: false,
      red: false,
    };
    this.touchState = {
      blue: this.createTouchSlot(),
      red: this.createTouchSlot(),
    };
    this.bind();
  }

  createTouchSlot() {
    return {
      active: false,
      id: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      vector: new Vector2(),
    };
  }

  bind() {
    window.addEventListener('keydown', (event) => {
      this.keys.add(event.key.toLowerCase());
      this.codes.add(event.code);
    });

    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.key.toLowerCase());
      this.codes.delete(event.code);
    });

    this.canvas.addEventListener('touchstart', (event) => this.handleTouchStart(event), { passive: false });
    this.canvas.addEventListener('touchmove', (event) => this.handleTouchMove(event), { passive: false });
    this.canvas.addEventListener('touchend', (event) => this.handleTouchEnd(event), { passive: false });
    this.canvas.addEventListener('touchcancel', (event) => this.handleTouchEnd(event), { passive: false });

    this.bindBoostButton('blue', document.getElementById('blue-boost-button'));
    this.bindBoostButton('red', document.getElementById('red-boost-button'));
  }

  bindBoostButton(team, element) {
    if (!element) {
      return;
    }

    const activate = (event) => {
      event.preventDefault();
      this.touchBoost[team] = true;
    };

    const deactivate = (event) => {
      event.preventDefault();
      this.touchBoost[team] = false;
    };

    element.addEventListener('pointerdown', activate);
    element.addEventListener('pointerup', deactivate);
    element.addEventListener('pointerleave', deactivate);
    element.addEventListener('pointercancel', deactivate);
  }

  handleTouchStart(event) {
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const midX = rect.left + rect.width * 0.5;

    for (const touch of event.changedTouches) {
      const side = touch.clientX < midX ? 'blue' : 'red';
      const slot = this.touchState[side];

      if (slot.active) {
        continue;
      }

      slot.active = true;
      slot.id = touch.identifier;
      slot.startX = touch.clientX;
      slot.startY = touch.clientY;
      slot.currentX = touch.clientX;
      slot.currentY = touch.clientY;
      slot.vector.set(0, 0);
    }
  }

  handleTouchMove(event) {
    event.preventDefault();
    for (const touch of event.changedTouches) {
      const side = this.findTouchSide(touch.identifier);
      if (!side) {
        continue;
      }
      const slot = this.touchState[side];
      slot.currentX = touch.clientX;
      slot.currentY = touch.clientY;
      const dx = slot.currentX - slot.startX;
      const dy = slot.currentY - slot.startY;
      slot.vector.set(dx / 60, dy / 60);
      if (slot.vector.length() > 1) {
        slot.vector.normalize();
      }
    }
  }

  handleTouchEnd(event) {
    event.preventDefault();
    for (const touch of event.changedTouches) {
      const side = this.findTouchSide(touch.identifier);
      if (!side) {
        continue;
      }
      this.touchState[side] = this.createTouchSlot();
    }
  }

  findTouchSide(identifier) {
    if (this.touchState.blue.id === identifier) {
      return 'blue';
    }
    if (this.touchState.red.id === identifier) {
      return 'red';
    }
    return null;
  }

  getMoveVector(team) {
    const vector = new Vector2();

    if (team === 'blue') {
      if (this.keys.has('w')) vector.y -= 1;
      if (this.keys.has('s')) vector.y += 1;
      if (this.keys.has('a')) vector.x -= 1;
      if (this.keys.has('d')) vector.x += 1;
    } else {
      if (this.keys.has('arrowup')) vector.y -= 1;
      if (this.keys.has('arrowdown')) vector.y += 1;
      if (this.keys.has('arrowleft')) vector.x -= 1;
      if (this.keys.has('arrowright')) vector.x += 1;
    }

    const slot = this.touchState[team];
    vector.x += slot.vector.x;
    vector.y += slot.vector.y;
    if (vector.length() > 1) {
      vector.normalize();
    }
    return vector;
  }

  getJoystickState(team) {
    const slot = this.touchState[team];
    if (!slot.active) {
      return null;
    }
    return {
      startX: slot.startX,
      startY: slot.startY,
      currentX: slot.startX + slot.vector.x * 60,
      currentY: slot.startY + slot.vector.y * 60,
    };
  }

  getBoostHeld(team) {
    if (team === 'blue') {
      return this.codes.has('Space') || this.touchBoost.blue;
    }
    return this.codes.has('NumpadEnter') || this.touchBoost.red;
  }

  reset() {
    this.keys.clear();
    this.codes.clear();
    this.touchBoost.blue = false;
    this.touchBoost.red = false;
    this.touchState.blue = this.createTouchSlot();
    this.touchState.red = this.createTouchSlot();
  }
}
