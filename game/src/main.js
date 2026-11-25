// Rasa Rush: Dapur Kilat — game loop and state machine.
// Owns the mutable game state, the update tick, chef movement, station
// use, particles and screen flow (title → playing → paused → over).
// Rendering lives in render.js, rules in kitchen.js and orders.js.

import {
  CANVAS_WIDTH, CANVAS_HEIGHT, CHEF_SPEED, CHEF_RADIUS, SHIFT_SECONDS,
  KITCHEN_LEFT, KITCHEN_RIGHT, KITCHEN_TOP, KITCHEN_BOTTOM, STATIONS,
  INGREDIENTS, COOK_RECIPES,
} from './config.js';
import { createInput, attachInput, moveVector, wasPressed, consumePressed } from './input.js';
import { nearestStation, stationAtPoint, useStation, tickBurner, tickChopping, distanceToStation } from './kitchen.js';
import {
  createOrder, tickOrders, serveOrder, expirePenalty, nextSpawnDelay,
  shiftTimeLeft, resetOrderCounter,
} from './orders.js';
import { drawScene } from './render.js';
import { sfx, toggleMute, isMuted } from './audio.js';
import { applyShot } from './shots.js';

function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export function createGameState() {
  return {
    screen: 'title', // 'title' | 'playing' | 'paused' | 'over'
    elapsed: 0,
    timeLeft: SHIFT_SECONDS,
    coins: 0,
    served: 0,
    expired: 0,
    combo: 0,
    bestCombo: 0,
    hearts: 3,
    orders: [],
    spawnIn: 1.5,
    carry: [],
    plate: [],
    burners: [
      { item: null, raw: null, progress: 0, done: false, burned: false },
      { item: null, raw: null, progress: 0, done: false, burned: false },
    ],
    chopping: null,
    chef: { x: 640, y: 430, walkPhase: 0, moving: false },
    moveTarget: null,
    nearStation: null,
    particles: [],
    floaters: [],
    hint: null,
    toast: null,
    toastLife: 0,
    muted: false,
    rng: makeRng((Date.now() % 2147483647) || 1),
  };
}

function resetGame(state) {
  const fresh = createGameState();
  fresh.muted = state.muted;
  Object.assign(state, fresh);
  resetOrderCounter();
  state.screen = 'playing';
  state.spawnIn = 1.0;
  state.orders.push(createOrder(0, state.rng));
}

function addFloater(state, text, x, y, color) {
  state.floaters.push({ text, x, y, life: 1.4, maxLife: 1.4, color: color || '#ffd94d' });
}

function spawnParticles(state, kind, x, y, count, spread) {
  for (let i = 0; i < count; i++) {
    state.particles.push({
      kind,
      x: x + (state.rng() - 0.5) * (spread || 30),
      y: y + (state.rng() - 0.5) * (spread || 16),
      vx: (state.rng() - 0.5) * 24,
      vy: -18 - state.rng() * 26,
      size: 3 + state.rng() * 5,
      life: 0.9 + state.rng() * 0.5,
      maxLife: 1.4,
    });
  }
}

function collideStations(chef) {
  for (const station of STATIONS) {
    const cx = Math.max(station.x, Math.min(chef.x, station.x + station.w));
    const cy = Math.max(station.y, Math.min(chef.y, station.y + station.h));
    const dx = chef.x - cx;
    const dy = chef.y - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < CHEF_RADIUS && dist > 0.001) {
      chef.x = cx + (dx / dist) * CHEF_RADIUS;
      chef.y = cy + (dy / dist) * CHEF_RADIUS;
    }
  }
  chef.x = Math.max(KITCHEN_LEFT + CHEF_RADIUS, Math.min(KITCHEN_RIGHT - CHEF_RADIUS, chef.x));
  chef.y = Math.max(KITCHEN_TOP + CHEF_RADIUS, Math.min(KITCHEN_BOTTOM - CHEF_RADIUS, chef.y));
}

function moveChef(state, dt, input) {
  const chef = state.chef;
  const vec = moveVector(input);
  let vx = vec.x;
  let vy = vec.y;
  if (vx === 0 && vy === 0 && state.moveTarget) {
    const dx = state.moveTarget.x - chef.x;
    const dy = state.moveTarget.y - chef.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 8) {
      state.moveTarget = null;
    } else {
      vx = dx / dist;
      vy = dy / dist;
    }
  }
  if (vx !== 0 || vy !== 0) {
    chef.x += vx * CHEF_SPEED * dt;
    chef.y += vy * CHEF_SPEED * dt;
    chef.walkPhase += dt;
    chef.moving = true;
    state.moveTarget = null;
  } else {
    chef.moving = false;
  }
  collideStations(chef);
}

function handleInteract(state) {
  const station = state.nearStation;
  if (!station) return;
  const result = useStation(state, station);
  if (!result.ok) {
    if (result.message) {
      state.toast = result.message;
      state.toastLife = 1;
    }
    if (result.event === 'serve-no-match' || result.event === 'plate-full') sfx.error();
    return;
  }
  const c = stationCenterOf(station);
  switch (result.event) {
    case 'give':
      sfx.pickup();
      break;
    case 'chop-start':
      sfx.chop();
      state.hint = 'Mencincang sayur…';
      break;
    case 'stove-place':
      sfx.place();
      sfx.sizzle();
      break;
    case 'stove-take':
      sfx.pickup();
      break;
    case 'plate-add':
      sfx.plateAdd();
      break;
    case 'serve': {
      const coins = serveOrder(state, result.order);
      sfx.serve();
      spawnParticles(state, 'sparkle', c.x, c.y, 16, 60);
      addFloater(state, '+' + coins + ' koin!', c.x, c.y - 30, '#ffd94d');
      state.toast = result.order.recipe.name + ' disajikan! +' + coins;
      state.toastLife = 1.4;
      break;
    }
    case 'trash':
      sfx.trash();
      break;
    default:
      break;
  }
}

function stationCenterOf(station) {
  return { x: station.x + station.w / 2, y: station.y + station.h / 2 };
}

function updatePlaying(state, dt, input) {
  state.elapsed += dt;
  state.timeLeft = shiftTimeLeft(state);
  if (state.timeLeft <= 0 || state.hearts <= 0) {
    state.screen = 'over';
    sfx.gameOver();
    return;
  }
  // order spawning
  state.spawnIn -= dt;
  if (state.spawnIn <= 0 && state.orders.length < 4) {
    state.orders.push(createOrder(state.elapsed, state.rng));
    state.spawnIn = nextSpawnDelay(state.elapsed, state.rng);
  }
  // patience
  const expired = tickOrders(state, dt);
  for (const order of expired) {
    expirePenalty(state);
    sfx.expire();
    spawnParticles(state, 'heart', 640, 120, 6, 40);
    addFloater(state, order.recipe.name + ' hangus!', 640, 160, '#ff6b5e');
    state.toast = 'Pesanan hangus — pelanggan pergi!';
    state.toastLife = 1.4;
  }
  // stove
  state.burners.forEach((burner, i) => {
    const event = tickBurner(burner, dt);
    const pos = { x: [52, 128][i], y: 516 };
    if (event === 'done') {
      sfx.cookDone();
      spawnParticles(state, 'steam', pos.x, pos.y - 20, 8, 24);
      addFloater(state, INGREDIENTS[burner.item].label + ' matang!', pos.x, pos.y - 44, '#9ed48a');
    } else if (event === 'burned') {
      sfx.expire();
      addFloater(state, 'GOSONG! Buang ke sampah', pos.x, pos.y - 44, '#ff6b5e');
    } else if (burner.item && !burner.done && state.rng() < dt * 2) {
      spawnParticles(state, 'steam', pos.x, pos.y - 16, 1, 18);
    }
  });
  // chopping
  if (state.chopping) {
    if (state.rng() < dt * 10) {
      spawnParticles(state, 'chopbit', state.chopping.x, state.chopping.y, 1, 30);
    }
    if (Math.floor(state.elapsed * 6) !== Math.floor((state.elapsed - dt) * 6)) sfx.chop();
    const done = tickChopping(state, dt);
    if (done) {
      state.carry.push(done);
      sfx.chopDone();
      state.hint = null;
      addFloater(state, INGREDIENTS[done].label + ' siap!', 101, 300, '#9ed48a');
    }
    // walking away cancels the chop (the veg stays on the board, lost)
    const board = STATIONS.find((s) => s.id === 'talenan');
    if (state.chopping && distanceToStation(state.chef, board) > 90) {
      state.chopping = null;
      state.hint = null;
    }
  }
  // movement + interaction
  moveChef(state, dt, input);
  state.nearStation = nearestStation(state.chef);
  if (wasPressed(input, 'KeyE') || wasPressed(input, 'Space')) handleInteract(state);
  if (input.mouse.clicked) {
    const station = stationAtPoint(input.mouse.x, input.mouse.y);
    if (station && state.nearStation && state.nearStation.id === station.id) {
      handleInteract(state);
    } else if (!station) {
      state.moveTarget = { x: input.mouse.x, y: input.mouse.y };
    }
  }
  // low patience warning tick
  const urgent = state.orders.some((o) => o.patience < 12 && o.patience > 0);
  if (urgent && Math.floor(state.elapsed * 2) !== Math.floor((state.elapsed - dt) * 2)) sfx.tick();
  // particles + floaters
  for (const p of state.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
  }
  state.particles = state.particles.filter((p) => p.life > 0);
  for (const t of state.floaters) {
    t.y -= 30 * dt;
    t.life -= dt;
  }
  state.floaters = state.floaters.filter((t) => t.life > 0);
  if (state.toastLife > 0) state.toastLife -= dt * 0.8;
  if (state.toastLife <= 0) state.toast = null;
}

function updateTitle(state, dt, input) {
  if (wasPressed(input, 'Enter') || wasPressed(input, 'Space')) {
    resetGame(state);
    sfx.start();
  }
}

export function startGame() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const input = createInput();
  attachInput(input, canvas);
  const state = createGameState();
  window.__game = state; // exposed for play-testing and debugging

  const params = new URLSearchParams(window.location.search);
  const staged = applyShot(state, params);
  if (staged) {
    // staged shots render the live game; keep the clock running slowly
    state.screen = 'playing';
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (wasPressed(input, 'KeyM')) {
      state.muted = toggleMute();
    }
    if (state.screen === 'title') updateTitle(state, dt, input);
    else if (state.screen === 'playing') updatePlaying(state, dt, input);
    else if (state.screen === 'paused') {
      if (wasPressed(input, 'KeyP') || wasPressed(input, 'Escape')) state.screen = 'playing';
    } else if (state.screen === 'over') {
      if (wasPressed(input, 'KeyR') || wasPressed(input, 'Enter')) {
        resetGame(state);
        sfx.start();
      }
    }
    if (state.screen === 'playing' && wasPressed(input, 'KeyP')) state.screen = 'paused';
    if (state.screen === 'playing' && wasPressed(input, 'KeyR')) {
      resetGame(state);
      sfx.start();
    }
    drawScene(ctx, state, input);
    consumePressed(input);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
