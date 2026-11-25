// Rasa Rush: Dapur Kilat — procedural sprites.
// All art is drawn with canvas paths at run time: no image files, no
// downloads. Each ingredient has one small drawing so the counters, the
// tray, the tickets and the plate all read at a glance.

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

// Draw one ingredient centred at (x, y), fitting in a box of size `s`.
export function drawIngredient(ctx, kind, x, y, s) {
  const r = s / 2;
  ctx.save();
  ctx.translate(x, y);
  switch (kind) {
    case 'ayam-mentah': {
      // pink drumstick
      ctx.rotate(-0.5);
      ellipse(ctx, 0, 0, r * 0.62, r * 0.5, '#f2a0a8');
      circle(ctx, r * 0.55, -r * 0.35, r * 0.16, '#fdf6e3');
      circle(ctx, r * 0.68, -r * 0.5, r * 0.14, '#fdf6e3');
      ctx.strokeStyle = '#d97b84';
      ctx.lineWidth = Math.max(1.5, s * 0.05);
      ctx.beginPath();
      ctx.moveTo(r * 0.3, r * 0.2);
      ctx.lineTo(-r * 0.4, -r * 0.1);
      ctx.stroke();
      break;
    }
    case 'ayam-bakar': {
      // browned drumstick with grill marks
      ctx.rotate(-0.5);
      ellipse(ctx, 0, 0, r * 0.62, r * 0.5, '#b0522f');
      circle(ctx, r * 0.55, -r * 0.35, r * 0.16, '#fdf6e3');
      circle(ctx, r * 0.68, -r * 0.5, r * 0.14, '#fdf6e3');
      ctx.strokeStyle = '#7d3517';
      ctx.lineWidth = Math.max(1.5, s * 0.06);
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(-r * 0.35 + i * r * 0.25, -r * 0.35);
        ctx.lineTo(-r * 0.15 + i * r * 0.25, r * 0.3);
        ctx.stroke();
      }
      break;
    }
    case 'telur': {
      ellipse(ctx, 0, 0, r * 0.55, r * 0.7, '#fdf6e3');
      ctx.strokeStyle = '#e0cfa8';
      ctx.lineWidth = Math.max(1, s * 0.04);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.55, r * 0.7, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'telur-goreng': {
      // sunny-side-up egg
      ellipse(ctx, 0, 0, r * 0.85, r * 0.7, '#fffdf4');
      circle(ctx, r * 0.1, -r * 0.05, r * 0.42, '#f2a93b');
      circle(ctx, -r * 0.05, r * 0.08, r * 0.18, '#f7c65c');
      break;
    }
    case 'sayur': {
      // leafy greens
      ctx.fillStyle = '#5f9153';
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * r * 0.35, Math.sin(a) * r * 0.35, r * 0.42, r * 0.2, a, 0, Math.PI * 2);
        ctx.fill();
      }
      circle(ctx, 0, 0, r * 0.3, '#7cb35a');
      break;
    }
    case 'sayur-cincang': {
      // chopped shreds
      ctx.strokeStyle = '#5f9153';
      ctx.lineCap = 'round';
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        ctx.lineWidth = Math.max(2, s * 0.09);
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r * 0.2, Math.sin(a) * r * 0.2);
        ctx.lineTo(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85);
        ctx.stroke();
      }
      ctx.strokeStyle = '#8fbf6f';
      ctx.lineWidth = Math.max(2, s * 0.07);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r * 0.1, Math.sin(a) * r * 0.1);
        ctx.lineTo(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6);
        ctx.stroke();
      }
      break;
    }
    case 'nasi': {
      // bowl of steamed rice
      ellipse(ctx, 0, r * 0.25, r * 0.85, r * 0.45, '#c94f38');
      ellipse(ctx, 0, -r * 0.1, r * 0.7, r * 0.5, '#fdf6e3');
      circle(ctx, -r * 0.25, -r * 0.3, r * 0.16, '#ffffff');
      circle(ctx, r * 0.2, -r * 0.35, r * 0.14, '#ffffff');
      circle(ctx, 0, -r * 0.45, r * 0.13, '#ffffff');
      break;
    }
    case 'mie-mentah': {
      // dry noodle block
      roundRect(ctx, -r * 0.8, -r * 0.55, r * 1.6, r * 1.1, r * 0.2, '#f2c94c');
      ctx.strokeStyle = '#d9a441';
      ctx.lineWidth = Math.max(1.5, s * 0.05);
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(-r * 0.65, i * r * 0.2);
        ctx.quadraticCurveTo(0, i * r * 0.2 + r * 0.18, r * 0.65, i * r * 0.2);
        ctx.stroke();
      }
      break;
    }
    case 'mie-rebus': {
      // noodle swirl
      ctx.strokeStyle = '#eab543';
      ctx.lineWidth = Math.max(2, s * 0.1);
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 4.5; a += 0.25) {
        const rr = r * 0.15 + (a / (Math.PI * 4.5)) * r * 0.65;
        const px = Math.cos(a) * rr;
        const py = Math.sin(a) * rr * 0.8;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      break;
    }
    case 'bumbu-kacang': {
      // small bowl of peanut sauce
      ellipse(ctx, 0, r * 0.3, r * 0.8, r * 0.42, '#8a5a2b');
      ellipse(ctx, 0, r * 0.05, r * 0.65, r * 0.4, '#a5672f');
      ctx.strokeStyle = '#d9a441';
      ctx.lineWidth = Math.max(1.5, s * 0.06);
      ctx.beginPath();
      ctx.moveTo(-r * 0.4, -r * 0.1);
      ctx.quadraticCurveTo(0, r * 0.25, r * 0.4, -r * 0.15);
      ctx.stroke();
      break;
    }
    case 'gosong': {
      // burnt lump with smoke curl
      circle(ctx, 0, r * 0.15, r * 0.6, '#1d1d1d');
      circle(ctx, -r * 0.3, r * 0.3, r * 0.35, '#333333');
      ctx.strokeStyle = '#9aa0a6';
      ctx.lineWidth = Math.max(1.5, s * 0.05);
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.4);
      ctx.quadraticCurveTo(r * 0.3, -r * 0.7, 0, -r * 0.95);
      ctx.stroke();
      break;
    }
    default: {
      circle(ctx, 0, 0, r * 0.6, '#cccccc');
    }
  }
  ctx.restore();
}

// A white serving plate with the dish's ingredients arranged on it.
export function drawPlate(ctx, x, y, size, items) {
  ellipse(ctx, x, y, size * 0.55, size * 0.42, '#ffffff');
  ellipse(ctx, x, y, size * 0.55, size * 0.42, 'rgba(0,0,0,0)');
  ctx.strokeStyle = '#d8cbb2';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.55, size * 0.42, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.4, size * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();
  const n = items.length;
  items.forEach((kind, i) => {
    const angle = n === 1 ? -Math.PI / 2 : -Math.PI / 2 + (i - (n - 1) / 2) * 0.9;
    const px = x + Math.cos(angle) * size * 0.2;
    const py = y + Math.sin(angle) * size * 0.12 - size * 0.05;
    drawIngredient(ctx, kind, px, py, size * 0.34);
  });
}

// The chef: white coat, tall toque, warm skin, apron. `walkPhase` animates
// a small bob while moving; `facing` flips the body slightly.
export function drawChef(ctx, x, y, walkPhase, moving, carrying) {
  ctx.save();
  ctx.translate(x, y);
  const bob = moving ? Math.sin(walkPhase * 10) * 2 : 0;
  // shadow
  ellipse(ctx, 0, 24, 24, 8, 'rgba(46,33,24,0.25)');
  // legs
  ctx.fillStyle = '#3b3b46';
  roundRect(ctx, -13, 8 + bob * 0.4, 10, 16, 4, '#3b3b46');
  roundRect(ctx, 3, 8 - bob * 0.4, 10, 16, 4, '#3b3b46');
  // coat
  roundRect(ctx, -20, -14 + bob * 0.3, 40, 30, 12, '#fdfdf8');
  // apron
  roundRect(ctx, -12, -8 + bob * 0.3, 24, 20, 6, '#d95f43');
  ctx.fillStyle = '#d95f43';
  ctx.beginPath();
  ctx.moveTo(-12, -8 + bob * 0.3);
  ctx.lineTo(12, -8 + bob * 0.3);
  ctx.lineTo(8, -14 + bob * 0.3);
  ctx.lineTo(-8, -14 + bob * 0.3);
  ctx.closePath();
  ctx.fill();
  // arms
  ctx.fillStyle = '#fdfdf8';
  roundRect(ctx, -26, -10 + bob * 0.3, 9, 20, 4, '#fdfdf8');
  roundRect(ctx, 17, -10 - bob * 0.3, 9, 20, 4, '#fdfdf8');
  // head
  circle(ctx, 0, -26 + bob * 0.3, 14, '#f2c89b');
  // eyes + smile
  ctx.fillStyle = '#2e2118';
  circle(ctx, -5, -28 + bob * 0.3, 1.8, '#2e2118');
  circle(ctx, 5, -28 + bob * 0.3, 1.8, '#2e2118');
  ctx.strokeStyle = '#2e2118';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -24 + bob * 0.3, 4, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  // toque
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(0, -40 + bob * 0.3, 15, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  roundRect(ctx, -13, -44 + bob * 0.3, 26, 8, 4, '#ffffff');
  // carried tray above the head
  if (carrying && carrying.length) {
    const trayY = -58 + bob * 0.3;
    roundRect(ctx, -24, trayY - 4, 48, 8, 4, '#a9713f');
    carrying.forEach((kind, i) => {
      const cx = (i - (carrying.length - 1) / 2) * 15;
      drawIngredient(ctx, kind, cx, trayY - 12, 13);
    });
  }
  ctx.restore();
}
