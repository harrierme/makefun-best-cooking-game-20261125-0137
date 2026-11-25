// Rasa Rush: Dapur Kilat — rendering.
// One function draws the whole scene from the game state: floor, stations,
// order board, chef, particles and screens. Nothing here mutates state
// except the animation clock it keeps for steam and bobbing.

import {
  CANVAS_WIDTH, CANVAS_HEIGHT, HUD_HEIGHT, PALETTE, STATIONS,
  INGREDIENTS, COOK_RECIPES, CHOP_RECIPES, BURNERS, recipeById,
} from './config.js';
import { drawIngredient, drawChef, drawPlate } from './sprites.js';
import { stationCenter, burnerLabel } from './kitchen.js';
import { formatClock, isRushHour, starRating } from './orders.js';

let animTime = 0;

export function drawScene(ctx, state, input) {
  animTime += 1 / 60;
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawFloor(ctx);
  drawStations(ctx, state, input);
  drawRugAndPlant(ctx);
  drawPlateOnCounter(ctx, state);
  drawChefSprite(ctx, state);
  drawParticles(ctx, state);
  drawFloatingTexts(ctx, state);
  drawHud(ctx, state);
  if (state.screen === 'title') drawTitle(ctx, state);
  if (state.screen === 'paused') drawPaused(ctx);
  if (state.screen === 'over') drawGameOver(ctx, state);
  if (state.screen === 'playing' && isRushHour(state)) drawRushBanner(ctx, state);
  drawHint(ctx, state);
}

function drawFloor(ctx) {
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // checkerboard tile floor below the HUD
  const tile = 64;
  for (let ty = HUD_HEIGHT + 8; ty < CANVAS_HEIGHT; ty += tile) {
    for (let tx = 0; tx < CANVAS_WIDTH; tx += tile) {
      const even = ((tx / tile) + (ty / tile)) % 2 === 0;
      ctx.fillStyle = even ? PALETTE.floorA : PALETTE.floorB;
      ctx.fillRect(tx, ty, tile, tile);
    }
  }
  // grout lines
  ctx.strokeStyle = 'rgba(120,85,50,0.18)';
  ctx.lineWidth = 1;
  for (let tx = 0; tx <= CANVAS_WIDTH; tx += tile) {
    ctx.beginPath(); ctx.moveTo(tx, HUD_HEIGHT + 8); ctx.lineTo(tx, CANVAS_HEIGHT); ctx.stroke();
  }
  for (let ty = HUD_HEIGHT + 8; ty <= CANVAS_HEIGHT; ty += tile) {
    ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(CANVAS_WIDTH, ty); ctx.stroke();
  }
  // wall trim between HUD and floor
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(0, HUD_HEIGHT, CANVAS_WIDTH, 8);
}

function drawRugAndPlant(ctx) {
  // woven rug in the middle of the floor
  ctx.fillStyle = '#c65b4e';
  ctx.beginPath();
  ctx.roundRect(520, 520, 260, 110, 14);
  ctx.fill();
  ctx.fillStyle = '#e8b04b';
  ctx.beginPath();
  ctx.roundRect(534, 534, 232, 82, 10);
  ctx.fill();
  ctx.fillStyle = '#c65b4e';
  ctx.beginPath();
  ctx.roundRect(548, 548, 204, 54, 8);
  ctx.fill();
  // potted herb plant, bottom right corner
  ctx.fillStyle = '#b0522f';
  ctx.beginPath();
  ctx.moveTo(1000, 660);
  ctx.lineTo(1040, 660);
  ctx.lineTo(1034, 690);
  ctx.lineTo(1006, 690);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5f9153';
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.35;
    ctx.beginPath();
    ctx.ellipse(1020 + Math.cos(a) * 14, 648 + Math.sin(a) * 16, 7, 16, a, 0, Math.PI * 2);
    ctx.fill();
  }
}

function stationIcon(ctx, station) {
  const c = stationCenter(station);
  switch (station.id) {
    case 'kulkas':
      ctx.fillStyle = '#eef4f7';
      ctx.beginPath(); ctx.roundRect(c.x - 22, c.y - 20, 44, 40, 6); ctx.fill();
      ctx.strokeStyle = '#7d9db0'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(c.x - 22, c.y - 20, 44, 40, 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(c.x - 22, c.y - 2); ctx.lineTo(c.x + 22, c.y - 2); ctx.stroke();
      break;
    case 'telur': drawIngredient(ctx, 'telur', c.x, c.y, 40); break;
    case 'sayur': drawIngredient(ctx, 'sayur', c.x, c.y, 44); break;
    case 'nasi': drawIngredient(ctx, 'nasi', c.x, c.y, 44); break;
    case 'mie': drawIngredient(ctx, 'mie-mentah', c.x, c.y, 44); break;
    case 'bumbu': drawIngredient(ctx, 'bumbu-kacang', c.x, c.y, 40); break;
    case 'talenan':
      drawChoppingBoard(ctx, c.x, c.y);
      break;
    case 'kompor':
      drawStove(ctx, c.x, c.y);
      break;
    case 'saji':
      ctx.fillStyle = '#fff6e8';
      ctx.beginPath(); ctx.roundRect(c.x - 52, c.y - 26, 104, 52, 8); ctx.fill();
      ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(c.x - 52, c.y - 26, 104, 52, 8); ctx.stroke();
      ctx.fillStyle = '#d95f43';
      ctx.font = 'bold 15px Trebuchet MS, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SAJI', c.x, c.y + 5);
      break;
    case 'plating':
      ctx.fillStyle = '#fff6e8';
      ctx.beginPath(); ctx.roundRect(c.x - 58, c.y - 24, 116, 48, 8); ctx.fill();
      ctx.strokeStyle = '#cbb98f'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(c.x - 58, c.y - 24, 116, 48, 8); ctx.stroke();
      break;
    case 'sampah':
      ctx.fillStyle = '#5a5f5a';
      ctx.beginPath();
      ctx.moveTo(c.x - 20, c.y - 18); ctx.lineTo(c.x + 20, c.y - 18);
      ctx.lineTo(c.x + 16, c.y + 18); ctx.lineTo(c.x - 16, c.y + 18);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8a8f8a';
      ctx.fillRect(c.x - 24, c.y - 23, 48, 6);
      break;
    default:
      break;
  }
}

function drawChoppingBoard(ctx, x, y) {
  ctx.fillStyle = '#e8d9bd';
  ctx.beginPath(); ctx.roundRect(x - 46, y - 22, 92, 44, 8); ctx.fill();
  ctx.strokeStyle = '#a98a5f'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x - 46, y - 22, 92, 44, 8); ctx.stroke();
  // knife
  ctx.fillStyle = '#c8ccd2';
  ctx.beginPath();
  ctx.moveTo(x + 8, y - 12); ctx.lineTo(x + 40, y - 12);
  ctx.lineTo(x + 40, y - 4); ctx.lineTo(x + 8, y - 4);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5a4232';
  ctx.fillRect(x + 40, y - 11, 10, 6);
}

function drawStove(ctx, x, y) {
  ctx.fillStyle = '#3d4148';
  ctx.beginPath(); ctx.roundRect(x - 62, y - 30, 124, 60, 10); ctx.fill();
  for (const burner of BURNERS) {
    const bx = burner.x;
    const by = burner.y;
    ctx.fillStyle = '#22252a';
    ctx.beginPath(); ctx.arc(bx, by, 28, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#6a7076'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(bx, by, 22, 0, Math.PI * 2); ctx.stroke();
  }
}

function drawStations(ctx, state, input) {
  for (const station of STATIONS) {
    const isNear = state.nearStation && state.nearStation.id === station.id;
    const isHover = input && input.mouse.x >= station.x && input.mouse.x <= station.x + station.w
      && input.mouse.y >= station.y && input.mouse.y <= station.y + station.h;
    // counter body
    ctx.fillStyle = station.color;
    ctx.beginPath(); ctx.roundRect(station.x, station.y, station.w, station.h, 12); ctx.fill();
    ctx.strokeStyle = 'rgba(46,33,24,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(station.x, station.y, station.w, station.h, 12); ctx.stroke();
    // top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath(); ctx.roundRect(station.x + 4, station.y + 4, station.w - 8, 10, 6); ctx.fill();
    stationIcon(ctx, station);
    // label under the icon
    ctx.fillStyle = 'rgba(46,33,24,0.85)';
    ctx.font = 'bold 12px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(station.name, station.x + station.w / 2, station.y + station.h - 6);
    // interaction highlight
    if (isNear || isHover) {
      ctx.strokeStyle = isNear ? '#ffd94d' : 'rgba(255,217,77,0.5)';
      ctx.lineWidth = isNear ? 4 : 2;
      ctx.beginPath(); ctx.roundRect(station.x - 4, station.y - 4, station.w + 8, station.h + 8, 14); ctx.stroke();
      if (isNear) {
        const c = stationCenter(station);
        const bounce = Math.sin(animTime * 5) * 3;
        ctx.fillStyle = '#2e2118';
        ctx.beginPath(); ctx.roundRect(c.x - 14, station.y - 30 + bounce, 28, 20, 6); ctx.fill();
        ctx.fillStyle = '#fff6e8';
        ctx.font = 'bold 13px Trebuchet MS, sans-serif';
        ctx.fillText('E', c.x, station.y - 15 + bounce);
      }
    }
    // stove burners: food + progress rings
    if (station.id === 'kompor') drawBurnerContents(ctx, state);
    // chopping progress
    if (station.id === 'talenan' && state.chopping) drawChopProgress(ctx, state);
  }
}

function drawBurnerContents(ctx, state) {
  state.burners.forEach((burner, i) => {
    const pos = BURNERS[i];
    if (!burner.item) return;
    drawIngredient(ctx, burner.item, pos.x, pos.y - 2, 34);
    const recipe = COOK_RECIPES[burner.raw];
    const total = recipe ? recipe.seconds : 1;
    const pct = Math.min(1, burner.progress / total);
    ctx.strokeStyle = burner.burned ? '#d9382b' : burner.done ? '#58a34a' : '#ffd94d';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 33, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
    ctx.stroke();
    if (burner.done || burner.burned) {
      const pulse = 0.7 + Math.sin(animTime * 6) * 0.3;
      ctx.fillStyle = burner.burned ? `rgba(217,56,43,${pulse})` : `rgba(88,163,74,${pulse})`;
      ctx.font = 'bold 11px Trebuchet MS, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(burner.burned ? 'GOSONG!' : 'SIAP!', pos.x, pos.y - 40);
    }
  });
}

function drawChopProgress(ctx, state) {
  const chop = state.chopping;
  const recipe = CHOP_RECIPES[chop.raw];
  const pct = Math.min(1, chop.progress / recipe.seconds);
  drawIngredient(ctx, 'sayur', chop.x, chop.y - 4, 34);
  ctx.fillStyle = 'rgba(46,33,24,0.7)';
  ctx.beginPath(); ctx.roundRect(chop.x - 40, chop.y + 26, 80, 10, 5); ctx.fill();
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath(); ctx.roundRect(chop.x - 38, chop.y + 28, 76 * pct, 6, 3); ctx.fill();
  // knife chop animation: small white slashes
  if (Math.floor(animTime * 8) % 2 === 0) {
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(chop.x - 14, chop.y - 22);
    ctx.lineTo(chop.x + 6, chop.y - 2);
    ctx.stroke();
  }
}

function drawPlateOnCounter(ctx, state) {
  const station = STATIONS.find((s) => s.id === 'plating');
  const cx = station.x + station.w / 2;
  const cy = station.y + station.h / 2 + 6;
  drawPlate(ctx, cx, cy, 86, state.plate);
  if (state.plate.length) {
    const ready = state.orders.some((o) => {
      const sorted = [...o.recipe.items].sort().join('|');
      return sorted === [...state.plate].sort().join('|');
    });
    ctx.font = 'bold 13px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    if (ready) {
      const pulse = 0.75 + Math.sin(animTime * 6) * 0.25;
      ctx.fillStyle = `rgba(88,163,74,${pulse})`;
      ctx.fillText('SIAP DISAJIKAN!', cx, station.y + station.h + 18);
    } else {
      ctx.fillStyle = 'rgba(46,33,24,0.75)';
      ctx.fillText(state.plate.length + ' / 3 bahan di piring', cx, station.y + station.h + 18);
    }
  }
}

function drawChefSprite(ctx, state) {
  const chef = state.chef;
  drawChef(ctx, chef.x, chef.y, chef.walkPhase, chef.moving, state.carry);
  // carry tray label under the chef when hands are full of raw food
  if (state.carry.length) {
    ctx.font = 'bold 11px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(46,33,24,0.7)';
    const names = state.carry.map((k) => INGREDIENTS[k].label).join(' + ');
    ctx.fillText(names, chef.x, chef.y + 42);
  }
}

function drawParticles(ctx, state) {
  for (const p of state.particles) {
    const life = p.life / p.maxLife;
    ctx.globalAlpha = Math.max(0, life);
    if (p.kind === 'steam') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1.6 - life * 0.6), 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'sparkle') {
      ctx.fillStyle = '#ffd94d';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * life, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'chopbit') {
      ctx.fillStyle = '#5f9153';
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    } else if (p.kind === 'heart') {
      ctx.fillStyle = '#d9382b';
      ctx.font = 'bold 16px Trebuchet MS, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('♥', p.x, p.y);
    }
    ctx.globalAlpha = 1;
  }
}

function drawFloatingTexts(ctx, state) {
  for (const t of state.floaters) {
    const life = t.life / t.maxLife;
    ctx.globalAlpha = Math.min(1, life * 2);
    ctx.font = 'bold 20px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = t.color || '#ffd94d';
    ctx.strokeStyle = 'rgba(46,33,24,0.8)';
    ctx.lineWidth = 4;
    ctx.strokeText(t.text, t.x, t.y);
    ctx.fillText(t.text, t.x, t.y);
    ctx.globalAlpha = 1;
  }
}

// --- HUD: order board, timer, coins, hearts --------------------------------

function drawHud(ctx, state) {
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(0, 0, CANVAS_WIDTH, HUD_HEIGHT);
  ctx.fillStyle = PALETTE.hudSoft;
  ctx.fillRect(0, HUD_HEIGHT - 4, CANVAS_WIDTH, 4);
  // title
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 22px Trebuchet MS, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('RASA RUSH', 16, 30);
  ctx.fillStyle = '#fff6e8';
  ctx.font = '13px Trebuchet MS, sans-serif';
  ctx.fillText('Dapur Kilat', 16, 50);
  // order tickets
  drawOrderBoard(ctx, state);
  // right cluster: timer, coins, hearts, combo
  const rightX = CANVAS_WIDTH - 16;
  ctx.textAlign = 'right';
  ctx.fillStyle = '#fff6e8';
  ctx.font = 'bold 26px Trebuchet MS, sans-serif';
  const timeLeft = state.timeLeft;
  ctx.fillStyle = timeLeft <= 30 ? '#ff6b5e' : '#fff6e8';
  ctx.fillText('⏱ ' + formatClock(timeLeft), rightX, 32);
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 20px Trebuchet MS, sans-serif';
  ctx.fillText('🪙 ' + state.coins, rightX, 60);
  ctx.fillStyle = '#ff8f8f';
  ctx.font = 'bold 18px Trebuchet MS, sans-serif';
  ctx.fillText('♥'.repeat(Math.max(0, state.hearts)) + '♡'.repeat(Math.max(0, 3 - state.hearts)), rightX, 82);
  if (state.combo >= 2) {
    ctx.fillStyle = '#ffd94d';
    ctx.font = 'bold 18px Trebuchet MS, sans-serif';
    ctx.fillText('COMBO x' + state.combo, rightX - 170, 60);
  }
  // mute state lives in the page footer; the HUD keeps tickets and timer only.
}

function drawOrderBoard(ctx, state) {
  const startX = 170;
  const ticketW = 196;
  const ticketH = 72;
  const gap = 10;
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,246,232,0.55)';
  ctx.font = 'bold 11px Trebuchet MS, sans-serif';
  ctx.fillText('PESANAN', startX, 16);
  if (!state.orders.length) {
    ctx.fillStyle = 'rgba(255,246,232,0.4)';
    ctx.font = '13px Trebuchet MS, sans-serif';
    ctx.fillText('Belum ada pesanan — bersiap!', startX, 48);
    return;
  }
  state.orders.forEach((order, i) => {
    const x = startX + i * (ticketW + gap);
    const y = 20;
    const urgency = order.patience / order.maxPatience;
    const bg = urgency < 0.25 ? '#7d2d24' : '#fff6e8';
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.roundRect(x, y, ticketW, ticketH, 8); ctx.fill();
    ctx.strokeStyle = order.recipe.color;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(x, y, ticketW, ticketH, 8); ctx.stroke();
    const textColor = urgency < 0.25 ? '#ffe9e5' : '#2e2118';
    ctx.fillStyle = textColor;
    ctx.font = 'bold 14px Trebuchet MS, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(order.recipe.name, x + 10, y + 20);
    ctx.fillStyle = order.recipe.color;
    ctx.font = 'bold 12px Trebuchet MS, sans-serif';
    ctx.fillText('$' + order.recipe.price, x + ticketW - 40, y + 20);
    // ingredient icons
    order.recipe.items.forEach((item, j) => {
      drawIngredient(ctx, item, x + 24 + j * 34, y + 44, 26);
    });
    // patience bar
    ctx.fillStyle = 'rgba(46,33,24,0.25)';
    ctx.beginPath(); ctx.roundRect(x + 10, y + ticketH - 12, ticketW - 20, 6, 3); ctx.fill();
    ctx.fillStyle = urgency > 0.5 ? '#58a34a' : urgency > 0.25 ? '#f2b544' : '#d9382b';
    ctx.beginPath(); ctx.roundRect(x + 10, y + ticketH - 12, (ticketW - 20) * Math.max(0, urgency), 6, 3); ctx.fill();
  });
}

function drawRushBanner(ctx, state) {
  const pulse = 0.6 + Math.sin(animTime * 8) * 0.4;
  ctx.fillStyle = `rgba(217,56,43,${0.85 * pulse})`;
  ctx.beginPath(); ctx.roundRect(CANVAS_WIDTH / 2 - 130, 200, 260, 34, 17); ctx.fill();
  ctx.fillStyle = '#fff6e8';
  ctx.font = 'bold 17px Trebuchet MS, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🔥 RUSH HOUR! 🔥', CANVAS_WIDTH / 2, 223);
}

function drawHint(ctx, state) {
  if (state.screen !== 'playing') return;
  if (state.hint) {
    ctx.fillStyle = 'rgba(46,33,24,0.85)';
    ctx.beginPath(); ctx.roundRect(CANVAS_WIDTH / 2 - 190, CANVAS_HEIGHT - 44, 380, 30, 15); ctx.fill();
    ctx.fillStyle = '#fff6e8';
    ctx.font = 'bold 14px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.hint, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 24);
  }
  if (state.toast) {
    ctx.globalAlpha = Math.min(1, state.toastLife);
    ctx.fillStyle = 'rgba(46,33,24,0.85)';
    ctx.beginPath(); ctx.roundRect(CANVAS_WIDTH / 2 - 150, 636, 300, 30, 15); ctx.fill();
    ctx.fillStyle = '#ffd94d';
    ctx.font = 'bold 14px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.toast, CANVAS_WIDTH / 2, 656);
    ctx.globalAlpha = 1;
  }
}

// --- Screens -----------------------------------------------------------------

function dim(ctx) {
  ctx.fillStyle = 'rgba(30,20,12,0.72)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawTitle(ctx, state) {
  dim(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 64px Trebuchet MS, sans-serif';
  ctx.fillText('RASA RUSH', CANVAS_WIDTH / 2, 190);
  ctx.fillStyle = '#fff6e8';
  ctx.font = 'bold 30px Trebuchet MS, sans-serif';
  ctx.fillText('— Dapur Kilat —', CANVAS_WIDTH / 2, 232);
  ctx.font = '17px Trebuchet MS, sans-serif';
  ctx.fillText('Masak, rakit, sajikan — sebelum pelanggan kehilangan sabar!', CANVAS_WIDTH / 2, 272);
  // recipe book
  ctx.fillStyle = 'rgba(255,246,232,0.12)';
  ctx.beginPath(); ctx.roundRect(CANVAS_WIDTH / 2 - 330, 300, 660, 150, 14); ctx.fill();
  ctx.fillStyle = '#fff6e8';
  ctx.font = 'bold 16px Trebuchet MS, sans-serif';
  ctx.fillText('BUKU RESEP', CANVAS_WIDTH / 2, 326);
  ctx.font = '15px Trebuchet MS, sans-serif';
  const lines = [
    'Nasi Goreng  —  Nasi + Telur Goreng + Sayur Cincang',
    'Mie Ayam  —  Mie Rebus + Ayam Bakar + Sayur Cincang',
    'Sate Madura  —  Ayam Bakar + Ayam Bakar + Bumbu Kacang',
    'Gado-Gado  —  Sayur Cincang + Telur Goreng + Bumbu Kacang',
  ];
  lines.forEach((line, i) => ctx.fillText(line, CANVAS_WIDTH / 2, 352 + i * 24));
  ctx.font = '15px Trebuchet MS, sans-serif';
  ctx.fillStyle = '#ffd94d';
  ctx.fillText('WASD / Panah: jalan   ·   E / Klik: pakai stasiun   ·   R: ulang', CANVAS_WIDTH / 2, 486);
  ctx.fillText('Cincang sayur di talenan · Masak di kompor · Rakit di meja plating', CANVAS_WIDTH / 2, 512);
  const blink = 0.6 + Math.sin(animTime * 4) * 0.4;
  ctx.fillStyle = `rgba(255,246,232,${blink})`;
  ctx.font = 'bold 22px Trebuchet MS, sans-serif';
  ctx.fillText('Tekan ENTER untuk mulai masak!', CANVAS_WIDTH / 2, 570);
}

function drawPaused(ctx) {
  dim(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff6e8';
  ctx.font = 'bold 44px Trebuchet MS, sans-serif';
  ctx.fillText('JEDA', CANVAS_WIDTH / 2, 340);
  ctx.font = '18px Trebuchet MS, sans-serif';
  ctx.fillText('Tekan P untuk lanjut', CANVAS_WIDTH / 2, 380);
}

function drawGameOver(ctx, state) {
  dim(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 52px Trebuchet MS, sans-serif';
  ctx.fillText('SHIFT SELESAI!', CANVAS_WIDTH / 2, 200);
  const stars = starRating(state);
  ctx.font = '44px Trebuchet MS, sans-serif';
  ctx.fillStyle = '#ffd94d';
  ctx.fillText('★'.repeat(stars) + '☆'.repeat(3 - stars), CANVAS_WIDTH / 2, 260);
  ctx.fillStyle = '#fff6e8';
  ctx.font = '22px Trebuchet MS, sans-serif';
  ctx.fillText('Koin: ' + state.coins + '   ·   Hidangan disajikan: ' + state.served, CANVAS_WIDTH / 2, 310);
  ctx.fillText('Kombo terbaik: x' + state.bestCombo + '   ·   Pesanan hangus: ' + state.expired, CANVAS_WIDTH / 2, 344);
  ctx.font = '17px Trebuchet MS, sans-serif';
  ctx.fillStyle = 'rgba(255,246,232,0.8)';
  const verdict = stars === 3
    ? 'Koki bintang tiga! Dapur ini milikmu.'
    : stars === 2
      ? 'Masakan mantap — sekali lagi untuk bintang tiga!'
      : 'Shift yang berat — coba lagi, koki!';
  ctx.fillText(verdict, CANVAS_WIDTH / 2, 390);
  const blink = 0.6 + Math.sin(animTime * 4) * 0.4;
  ctx.fillStyle = `rgba(255,246,232,${blink})`;
  ctx.font = 'bold 20px Trebuchet MS, sans-serif';
  ctx.fillText('Tekan R untuk masak lagi', CANVAS_WIDTH / 2, 450);
}
