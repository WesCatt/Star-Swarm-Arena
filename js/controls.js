import { Vector2 } from './utils.js';

export class Controls {
  constructor(canvas) {
    this.canvas = canvas;
    this.mode = 'local';
    this.keys = new Set();
    this.codes = new Set();
    this.touchBoost = {
      blue: false,
      red: false,
      online: false,
    };
    this.touchSkills = {
      repair: false,
      arc: false,
    };
    this.touchState = {
      blue: this.createTouchSlot(),
      red: this.createTouchSlot(),
      online: this.createTouchSlot(),
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

  setMode(mode) {
    this.mode = mode === 'online' ? 'online' : 'local';
    this.touchBoost.online = false;
    this.touchBoost.blue = false;
    this.touchBoost.red = false;
    this.touchSkills.repair = false;
    this.touchSkills.arc = false;
    this.touchState.blue = this.createTouchSlot();
    this.touchState.red = this.createTouchSlot();
    this.touchState.online = this.createTouchSlot();
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

    this.bindHoldButton(document.getElementById('blue-boost-button'), {
      activate: () => {
        this.touchBoost.blue = true;
      },
      deactivate: () => {
        this.touchBoost.blue = false;
      },
    });
    this.bindHoldButton(document.getElementById('red-boost-button'), {
      activate: () => {
        this.touchBoost.red = true;
      },
      deactivate: () => {
        this.touchBoost.red = false;
      },
    });
    this.bindHoldButton(document.getElementById('online-boost-button'), {
      activate: () => {
        this.touchBoost.online = true;
      },
      deactivate: () => {
        this.touchBoost.online = false;
      },
    });
    this.bindHoldButton(document.getElementById('online-repair-button'), {
      activate: () => {
        this.touchSkills.repair = true;
      },
      deactivate: () => {
        this.touchSkills.repair = false;
      },
    });
    this.bindHoldButton(document.getElementById('online-arc-button'), {
      activate: () => {
        this.touchSkills.arc = true;
      },
      deactivate: () => {
        this.touchSkills.arc = false;
      },
    });
  }

  bindHoldButton(element, handlers) {
    if (!element) return;

    const activate = (event) => {
      event.preventDefault();
      element.classList.remove('tap-pulse');
      void element.offsetWidth;
      element.classList.add('tap-pulse');
      if (element._tapPulseTimer) {
        window.clearTimeout(element._tapPulseTimer);
      }
      element._tapPulseTimer = window.setTimeout(() => {
        element.classList.remove('tap-pulse');
        element._tapPulseTimer = null;
      }, 520);
      handlers.activate();
      if (typeof element.setPointerCapture === 'function' && event.pointerId != null) {
        element.setPointerCapture(event.pointerId);
      }
    };

    const deactivate = (event) => {
      event.preventDefault();
      handlers.deactivate();
    };

    element.addEventListener('pointerdown', activate);
    element.addEventListener('pointerup', deactivate);
    element.addEventListener('pointerleave', deactivate);
    element.addEventListener('pointercancel', deactivate);
    element.addEventListener('lostpointercapture', deactivate);
  }

  handleTouchStart(event) {
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const midpoint = rect.left + rect.width * 0.5;

    for (const touch of event.changedTouches) {
      if (this.mode === 'online') {
        if (touch.clientX >= midpoint || this.touchState.online.active) continue;
        this.activateTouchSlot(this.touchState.online, touch);
        continue;
      }

      const side = touch.clientX < midpoint ? 'blue' : 'red';
      if (this.touchState[side].active) continue;
      this.activateTouchSlot(this.touchState[side], touch);
    }
  }

  activateTouchSlot(slot, touch) {
    slot.active = true;
    slot.id = touch.identifier;
    slot.startX = touch.clientX;
    slot.startY = touch.clientY;
    slot.currentX = touch.clientX;
    slot.currentY = touch.clientY;
    slot.vector.set(0, 0);
  }

  handleTouchMove(event) {
    event.preventDefault();

    for (const touch of event.changedTouches) {
      const side = this.findTouchSide(touch.identifier);
      if (!side) continue;

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
      if (!side) continue;
      this.touchState[side] = this.createTouchSlot();
    }
  }

  findTouchSide(identifier) {
    for (const side of ['blue', 'red', 'online']) {
      if (this.touchState[side].id === identifier) {
        return side;
      }
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

  getOnlineInput() {
    const vector = new Vector2();
    if (this.keys.has('w')) vector.y -= 1;
    if (this.keys.has('s')) vector.y += 1;
    if (this.keys.has('a')) vector.x -= 1;
    if (this.keys.has('d')) vector.x += 1;

    vector.x += this.touchState.online.vector.x;
    vector.y += this.touchState.online.vector.y;
    if (vector.length() > 1) {
      vector.normalize();
    }

    return {
      x: vector.x,
      y: vector.y,
      boost: this.codes.has('Space') || this.touchBoost.online,
      repair: this.keys.has('h') || this.touchSkills.repair,
      arc: this.keys.has('k') || this.touchSkills.arc,
    };
  }

  getJoystickState(team) {
    const slot = this.touchState[team];
    if (!slot?.active) return null;
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
    this.touchBoost.online = false;
    this.touchSkills.repair = false;
    this.touchSkills.arc = false;
    this.touchState.blue = this.createTouchSlot();
    this.touchState.red = this.createTouchSlot();
    this.touchState.online = this.createTouchSlot();
  }
}
