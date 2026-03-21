const SVG_VIEWBOX = '0 0 24 24';

function iconSvg(inner) {
  return `<svg viewBox="${SVG_VIEWBOX}" aria-hidden="true" focusable="false">${inner}</svg>`;
}

export function getItemIconMarkup(item) {
  switch (item.icon) {
    case 'thruster':
      return iconSvg(`
        <path class="icon-fill-soft" d="M12 3.4 16.9 10v3.8L12 18.8 7.1 13.8V10Z"/>
        <path d="M12 4.2 16 10v3.2L12 16.8 8 13.2V10Z"/>
        <path d="M9.1 12.2h5.8"/>
        <path d="M10.2 17.1 8.7 20.1l3.3-1.2 3.3 1.2-1.5-3"/>
      `);
    case 'factory':
      return iconSvg(`
        <path class="icon-fill-soft" d="M4.5 19.5V9.1l4.5 2.4V8.7l4 2.2V7.5l6.5 3.4v8.6Z"/>
        <path d="M5 19V9.8l4.5 2.3V9.4l4 2.2V8.2l5.5 2.9V19Z"/>
        <path d="M8.2 19v-3.2"/>
        <path d="M11.9 19v-5.2"/>
        <path d="M15.8 19v-2.8"/>
        <path d="M7.2 7.2h2.6"/>
      `);
    case 'expand':
      return iconSvg(`
        <rect class="icon-fill-soft" x="9" y="9" width="6" height="6" rx="1.4"/>
        <rect x="9.3" y="9.3" width="5.4" height="5.4" rx="1.2"/>
        <path d="M8.2 8.2 5 5"/>
        <path d="M15.8 8.2 19 5"/>
        <path d="M8.2 15.8 5 19"/>
        <path d="M15.8 15.8 19 19"/>
        <path d="M5 8V5h3"/>
        <path d="M19 8V5h-3"/>
        <path d="M5 16v3h3"/>
        <path d="M19 16v3h-3"/>
      `);
    case 'bolt':
      return iconSvg(`
        <path class="icon-fill-strong" d="M13.1 2.7 6.8 12.3h3.8L9.8 21.3l7.4-11H13l.1-7.6Z"/>
        <path d="M13.1 2.7 6.8 12.3h3.8L9.8 21.3l7.4-11H13l.1-7.6Z"/>
        <path d="M6 6.1 8 7.3"/>
        <path d="m16.4 17.5 2.2 1.3"/>
      `);
    case 'crosshair':
      return iconSvg(`
        <circle class="icon-fill-soft" cx="12" cy="12" r="5.6"/>
        <circle cx="12" cy="12" r="5.1"/>
        <path d="M12 3.2v3.1"/>
        <path d="M12 17.7v3.1"/>
        <path d="M3.2 12h3.1"/>
        <path d="M17.7 12h3.1"/>
        <circle class="icon-fill-strong" cx="12" cy="12" r="1.6"/>
      `);
    case 'eclipse':
      return iconSvg(`
        <circle class="icon-fill-soft" cx="10.7" cy="12" r="5.6"/>
        <path class="icon-fill-strong" d="M13.7 6.4a5.9 5.9 0 1 0 0 11.2 6.7 6.7 0 0 1-2.8.6 6.2 6.2 0 1 1 2.8-11.8Z"/>
        <circle cx="17.6" cy="7.4" r="1.2"/>
        <path d="m19.4 5.6.8-.8"/>
        <path d="m18.9 9.4.8.8"/>
      `);
    case 'flag':
      return iconSvg(`
        <path d="M7 20V4"/>
        <path class="icon-fill-soft" d="M8.2 5.2h8.2L14.1 8l2.3 2.8H8.2Z"/>
        <path d="M8.2 5.2h8.2L14.1 8l2.3 2.8H8.2Z"/>
        <path d="M7 20h10"/>
        <path d="M10.1 13.8c1.2-.8 2.5-.8 3.8 0"/>
      `);
    default:
      return iconSvg('<circle cx="12" cy="12" r="5"/><circle class="icon-fill-strong" cx="12" cy="12" r="1.8"/>');
  }
}

export function drawItemIcon(ctx, type, size) {
  ctx.save();
  ctx.strokeStyle = '#ecf7ff';
  ctx.fillStyle = '#ecf7ff';
  ctx.lineWidth = Math.max(1.6, size * 0.08);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const s = size / 24;

  switch (type.icon) {
    case 'thruster':
      ctx.beginPath();
      ctx.moveTo(0, -8.5 * s);
      ctx.lineTo(4.7 * s, -2.1 * s);
      ctx.lineTo(4.7 * s, 1.8 * s);
      ctx.lineTo(0, 6.4 * s);
      ctx.lineTo(-4.7 * s, 1.8 * s);
      ctx.lineTo(-4.7 * s, -2.1 * s);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-2.2 * s, 0.2 * s);
      ctx.lineTo(2.2 * s, 0.2 * s);
      ctx.moveTo(-2.2 * s, 6 * s);
      ctx.lineTo(0, 9.2 * s);
      ctx.lineTo(2.2 * s, 6 * s);
      ctx.stroke();
      break;
    case 'factory':
      ctx.beginPath();
      ctx.moveTo(-8 * s, 8.5 * s);
      ctx.lineTo(-8 * s, -2 * s);
      ctx.lineTo(-3.5 * s, 0.3 * s);
      ctx.lineTo(-3.5 * s, -2.5 * s);
      ctx.lineTo(0.3 * s, -0.4 * s);
      ctx.lineTo(0.3 * s, -3.8 * s);
      ctx.lineTo(7.3 * s, -0.2 * s);
      ctx.lineTo(7.3 * s, 8.5 * s);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-4.8 * s, 8.5 * s);
      ctx.lineTo(-4.8 * s, 3.8 * s);
      ctx.moveTo(-0.9 * s, 8.5 * s);
      ctx.lineTo(-0.9 * s, 2.2 * s);
      ctx.moveTo(3 * s, 8.5 * s);
      ctx.lineTo(3 * s, 5.2 * s);
      ctx.stroke();
      break;
    case 'expand':
      ctx.strokeRect(-3.6 * s, -3.6 * s, 7.2 * s, 7.2 * s);
      ctx.beginPath();
      ctx.moveTo(-4.8 * s, -4.8 * s);
      ctx.lineTo(-8.7 * s, -8.7 * s);
      ctx.moveTo(4.8 * s, -4.8 * s);
      ctx.lineTo(8.7 * s, -8.7 * s);
      ctx.moveTo(-4.8 * s, 4.8 * s);
      ctx.lineTo(-8.7 * s, 8.7 * s);
      ctx.moveTo(4.8 * s, 4.8 * s);
      ctx.lineTo(8.7 * s, 8.7 * s);
      ctx.moveTo(-8.7 * s, -4.2 * s);
      ctx.lineTo(-8.7 * s, -8.7 * s);
      ctx.lineTo(-4.2 * s, -8.7 * s);
      ctx.moveTo(8.7 * s, -4.2 * s);
      ctx.lineTo(8.7 * s, -8.7 * s);
      ctx.lineTo(4.2 * s, -8.7 * s);
      ctx.moveTo(-8.7 * s, 4.2 * s);
      ctx.lineTo(-8.7 * s, 8.7 * s);
      ctx.lineTo(-4.2 * s, 8.7 * s);
      ctx.moveTo(8.7 * s, 4.2 * s);
      ctx.lineTo(8.7 * s, 8.7 * s);
      ctx.lineTo(4.2 * s, 8.7 * s);
      ctx.stroke();
      break;
    case 'bolt':
      ctx.beginPath();
      ctx.moveTo(1.5 * s, -9.3 * s);
      ctx.lineTo(-4.8 * s, 0.1 * s);
      ctx.lineTo(-1.2 * s, 0.1 * s);
      ctx.lineTo(-2.7 * s, 9.2 * s);
      ctx.lineTo(5.6 * s, -1.2 * s);
      ctx.lineTo(1.9 * s, -1.2 * s);
      ctx.closePath();
      ctx.fill();
      break;
    case 'crosshair':
      ctx.beginPath();
      ctx.arc(0, 0, 5.2 * s, 0, Math.PI * 2);
      ctx.moveTo(0, -9 * s);
      ctx.lineTo(0, -6.1 * s);
      ctx.moveTo(0, 6.1 * s);
      ctx.lineTo(0, 9 * s);
      ctx.moveTo(-9 * s, 0);
      ctx.lineTo(-6.1 * s, 0);
      ctx.moveTo(6.1 * s, 0);
      ctx.lineTo(9 * s, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 1.7 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'eclipse':
      ctx.beginPath();
      ctx.arc(-1.8 * s, 0, 5.5 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(2 * s, 0, 5.8 * s, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(6.6 * s, -4.8 * s, 1.2 * s, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'flag':
      ctx.beginPath();
      ctx.moveTo(-5.3 * s, 9 * s);
      ctx.lineTo(-5.3 * s, -8.6 * s);
      ctx.moveTo(-4.4 * s, -7 * s);
      ctx.lineTo(5.4 * s, -7 * s);
      ctx.lineTo(2.4 * s, -3 * s);
      ctx.lineTo(5.4 * s, 0.8 * s);
      ctx.lineTo(-4.4 * s, 0.8 * s);
      ctx.moveTo(-5.3 * s, 9 * s);
      ctx.lineTo(5.3 * s, 9 * s);
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
