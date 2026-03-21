import { BALANCE, ITEM_TYPES } from '../config.js';
import { drawItemIcon } from '../item-icons.js';
import { Vector2, pick, rand } from '../utils.js';

export class Item {
  constructor(x, y, type = pick(ITEM_TYPES)) {
    this.pos = new Vector2(x, y);
    this.radius = BALANCE.item.radius;
    this.type = type;
    this.pulse = rand(0, Math.PI * 2);
  }

  static random(x, y) {
    return new Item(x, y, pick(ITEM_TYPES));
  }

  update(tick) {
    this.pulse += 0.05 * tick;
  }

  applyEffect(mothership, game) {
    switch (this.type.id) {
      case 'ship-speed':
        mothership.applyBuff('shipSpeed', { multiplier: 1.5, duration: this.type.duration });
        break;
      case 'production':
        mothership.applyBuff('production', { multiplier: 2, duration: this.type.duration });
        break;
      case 'drone-size':
        mothership.applyBuff('droneSize', { multiplier: 1.8, duration: this.type.duration });
        break;
      case 'drone-speed':
        mothership.applyBuff('droneSpeed', { multiplier: 1.5, duration: this.type.duration });
        break;
      case 'drone-attack':
        mothership.applyBuff('droneDamage', { multiplier: 2, duration: this.type.duration });
        break;
      case 'neutralize':
        game.neutralizeRandomEnemyPlanet(mothership.team);
        break;
      case 'autocapture':
        mothership.applyBuff('autocapture', { multiplier: 1, duration: this.type.duration });
        game.queueAutocapture(mothership.team, this.type.duration);
        break;
      default:
        break;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    const size = this.radius + Math.sin(this.pulse) * 2;
    const glow = size + 12;

    ctx.fillStyle = `${this.type.accent}24`;
    ctx.beginPath();
    ctx.arc(0, 0, glow, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `${this.type.accent}aa`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, size + 4, 0, Math.PI * 2);
    ctx.stroke();

    const plateGradient = ctx.createLinearGradient(-size, -size, size, size);
    plateGradient.addColorStop(0, '#102131');
    plateGradient.addColorStop(1, '#07111a');
    ctx.fillStyle = plateGradient;
    ctx.beginPath();
    ctx.roundRect(-size, -size, size * 2, size * 2, 12);
    ctx.fill();

    ctx.strokeStyle = `${this.type.accent}88`;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(-size + 3, -size + 3, size * 2 - 6, size * 0.8, 9);
    ctx.fill();

    drawItemIcon(ctx, this.type, size * 1.1);
    ctx.restore();
  }
}
