const SVG_VIEWBOX = '0 0 24 24';

function iconSvg(inner) {
  return `<svg viewBox="${SVG_VIEWBOX}" aria-hidden="true" focusable="false">${inner}</svg>`;
}

export function getItemIconMarkup(item) {
  switch (item.icon) {
    case 'thruster':
      return iconSvg('<path d="M7 14L12 4l5 10"/><path d="M12 10v8"/><path d="M9 18l3 2 3-2"/>');
    case 'factory':
      return iconSvg('<path d="M5 19V9l5 3V9l4 3V7l5 3v9Z"/><path d="M9 19v-3"/><path d="M13 19v-4"/><path d="M17 19v-2"/>');
    case 'expand':
      return iconSvg('<path d="M9 9L5 5"/><path d="M15 9l4-4"/><path d="M9 15l-4 4"/><path d="M15 15l4 4"/><path d="M5 9V5h4"/><path d="M19 9V5h-4"/><path d="M5 15v4h4"/><path d="M19 15v4h-4"/>');
    case 'bolt':
      return iconSvg('<path class="icon-solid" d="M13 2L6 13h4l-1 9 7-11h-4l1-9Z"/>');
    case 'crosshair':
      return iconSvg('<circle cx="12" cy="12" r="5"/><path d="M12 3v3"/><path d="M12 18v3"/><path d="M3 12h3"/><path d="M18 12h3"/><circle class="icon-solid" cx="12" cy="12" r="1.4"/>');
    case 'eclipse':
      return iconSvg('<circle cx="10.5" cy="12" r="5.5"/><path d="M13.5 6.8a5.8 5.8 0 1 1 0 10.4"/><circle class="icon-solid" cx="17.8" cy="7.2" r="1.3"/>');
    case 'flag':
      return iconSvg('<path d="M7 20V4"/><path d="M8 5h8l-2.4 3 2.4 3H8Z"/><path d="M7 20h10"/>');
    default:
      return iconSvg('<circle cx="12" cy="12" r="5"/>');
  }
}

export function drawItemIcon(ctx, type, size) {
  ctx.save();
  ctx.strokeStyle = '#07121b';
  ctx.fillStyle = '#07121b';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const s = size / 12;

  switch (type.icon) {
    case 'thruster':
      ctx.beginPath();
      ctx.moveTo(-5 * s, 2 * s);
      ctx.lineTo(0, -8 * s);
      ctx.lineTo(5 * s, 2 * s);
      ctx.moveTo(0, -2 * s);
      ctx.lineTo(0, 7 * s);
      ctx.moveTo(-3 * s, 7 * s);
      ctx.lineTo(0, 9 * s);
      ctx.lineTo(3 * s, 7 * s);
      ctx.stroke();
      break;
    case 'factory':
      ctx.beginPath();
      ctx.moveTo(-7 * s, 8 * s);
      ctx.lineTo(-7 * s, -3 * s);
      ctx.lineTo(-2 * s, 0);
      ctx.lineTo(-2 * s, -3 * s);
      ctx.lineTo(2 * s, 0);
      ctx.lineTo(2 * s, -5 * s);
      ctx.lineTo(7 * s, -2 * s);
      ctx.lineTo(7 * s, 8 * s);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-3 * s, 8 * s);
      ctx.lineTo(-3 * s, 4 * s);
      ctx.moveTo(1 * s, 8 * s);
      ctx.lineTo(1 * s, 2 * s);
      ctx.moveTo(5 * s, 8 * s);
      ctx.lineTo(5 * s, 5 * s);
      ctx.stroke();
      break;
    case 'expand':
      ctx.beginPath();
      ctx.moveTo(-3 * s, -3 * s);
      ctx.lineTo(-8 * s, -8 * s);
      ctx.moveTo(3 * s, -3 * s);
      ctx.lineTo(8 * s, -8 * s);
      ctx.moveTo(-3 * s, 3 * s);
      ctx.lineTo(-8 * s, 8 * s);
      ctx.moveTo(3 * s, 3 * s);
      ctx.lineTo(8 * s, 8 * s);
      ctx.moveTo(-8 * s, -3 * s);
      ctx.lineTo(-8 * s, -8 * s);
      ctx.lineTo(-3 * s, -8 * s);
      ctx.moveTo(8 * s, -3 * s);
      ctx.lineTo(8 * s, -8 * s);
      ctx.lineTo(3 * s, -8 * s);
      ctx.moveTo(-8 * s, 3 * s);
      ctx.lineTo(-8 * s, 8 * s);
      ctx.lineTo(-3 * s, 8 * s);
      ctx.moveTo(8 * s, 3 * s);
      ctx.lineTo(8 * s, 8 * s);
      ctx.lineTo(3 * s, 8 * s);
      ctx.stroke();
      break;
    case 'bolt':
      ctx.beginPath();
      ctx.moveTo(1 * s, -9 * s);
      ctx.lineTo(-5 * s, 1 * s);
      ctx.lineTo(-1 * s, 1 * s);
      ctx.lineTo(-2 * s, 9 * s);
      ctx.lineTo(5 * s, -1 * s);
      ctx.lineTo(1 * s, -1 * s);
      ctx.closePath();
      ctx.fill();
      break;
    case 'crosshair':
      ctx.beginPath();
      ctx.arc(0, 0, 5 * s, 0, Math.PI * 2);
      ctx.moveTo(0, -9 * s);
      ctx.lineTo(0, -6 * s);
      ctx.moveTo(0, 6 * s);
      ctx.lineTo(0, 9 * s);
      ctx.moveTo(-9 * s, 0);
      ctx.lineTo(-6 * s, 0);
      ctx.moveTo(6 * s, 0);
      ctx.lineTo(9 * s, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 1.6 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'eclipse':
      ctx.beginPath();
      ctx.arc(-1.5 * s, 0, 5.5 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(2 * s, 0, 5.8 * s, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(6.8 * s, -4.8 * s, 1.3 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'flag':
      ctx.beginPath();
      ctx.moveTo(-5 * s, 9 * s);
      ctx.lineTo(-5 * s, -8 * s);
      ctx.moveTo(-4.5 * s, -7 * s);
      ctx.lineTo(5 * s, -7 * s);
      ctx.lineTo(2 * s, -3 * s);
      ctx.lineTo(5 * s, 1 * s);
      ctx.lineTo(-4.5 * s, 1 * s);
      ctx.moveTo(-5 * s, 9 * s);
      ctx.lineTo(5 * s, 9 * s);
      ctx.stroke();
      break;
    default:
      ctx.beginPath();
      ctx.arc(0, 0, 5 * s, 0, Math.PI * 2);
      ctx.stroke();
      break;
  }

  ctx.restore();
}
