// Rasa Rush: Dapur Kilat — screenshot staging.
// `?shot=1..4` starts the game in a hand-set state so the screenshots show
// the kitchen at its busiest. Every staged state is built only from the
// game's own state (orders, plate, burners, chef, timer) and rendered by
// the same draw code the player sees — nothing is drawn for the camera.

import { createOrder, resetOrderCounter } from './orders.js';
import { recipeById } from './config.js';
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function orderWith(state, recipeId, patience, maxPatience) {
  const order = createOrder(state.elapsed, rng(7));
  order.recipe = recipeById(recipeId);
  order.patience = patience;
  order.maxPatience = maxPatience;
  return order;
}

function baseState(state) {
  state.screen = 'playing';
  state.elapsed = 0;
  state.coins = 0;
  state.combo = 0;
  state.hearts = 3;
  state.orders = [];
  state.carry = [];
  state.plate = [];
  state.burners = [
    { item: null, raw: null, progress: 0, done: false, burned: false },
    { item: null, raw: null, progress: 0, done: false, burned: false },
  ];
  state.chopping = null;
  state.particles = [];
  state.floaters = [];
  state.toast = null;
}

// Shot 1 — the cover: three tickets, a dish mid-assembly on the plate,
// the chef carrying ingredients, timer running.
function stageCover(state) {
  baseState(state);
  state.elapsed = 62;
  state.coins = 74;
  state.combo = 2;
  state.orders = [
    orderWith(state, 'nasi-goreng', 58, 80),
    orderWith(state, 'mie-ayam', 34, 85),
    orderWith(state, 'sate-madura', 71, 90),
  ];
  state.plate = ['nasi', 'telur-goreng'];
  state.carry = ['sayur-cincang'];
  state.chef.x = 1010;
  state.chef.y = 380;
  state.burners[0] = { item: 'ayam-mentah', raw: 'ayam-mentah', progress: 2.4, done: false, burned: false };
  state.burners[1] = { item: 'telur-goreng', raw: 'telur', progress: 3.0, done: true, burned: false };
  state.toast = 'Piring hampir jadi — 1 bahan lagi!';
  state.toastLife = 1;
}

// Shot 2 — chopping at the board while the stove works: ingredients on
// the counters, steam, a fresh ticket arriving.
function stageChopping(state) {
  baseState(state);
  state.elapsed = 30;
  state.coins = 26;
  state.combo = 1;
  state.orders = [
    orderWith(state, 'gado-gado', 66, 88),
    orderWith(state, 'nasi-goreng', 44, 80),
  ];
  state.chopping = { raw: 'sayur', progress: 0.9, x: 101, y: 345 };
  state.chef.x = 210;
  state.chef.y = 345;
  state.burners[0] = { item: 'ayam-mentah', raw: 'ayam-mentah', progress: 3.1, done: false, burned: false };
  state.burners[1] = { item: 'mie-mentah', raw: 'mie-mentah', progress: 1.2, done: false, burned: false };
  state.carry = ['telur'];
  state.hint = 'Mencincang sayur… tahan posisi!';
}

// Shot 3 — a finished plate glowing "ready to serve" at the pass, with a
// matching ticket and a combo running.
function stageReadyToServe(state) {
  baseState(state);
  state.elapsed = 105;
  state.coins = 128;
  state.combo = 3;
  state.orders = [
    orderWith(state, 'mie-ayam', 52, 85),
    orderWith(state, 'sate-madura', 40, 90),
    orderWith(state, 'gado-gado', 75, 88),
  ];
  state.plate = ['mie-rebus', 'ayam-bakar', 'sayur-cincang'];
  state.chef.x = 1050;
  state.chef.y = 200;
  state.chef.walkPhase = 0.4;
  state.toast = 'Mie Ayam siap — antar ke Jendela Saji!';
  state.toastLife = 1;
}

// Shot 4 — rush hour: four tickets, one nearly expired, burners full,
// the chef hauling a full tray.
function stageRushHour(state) {
  baseState(state);
  state.elapsed = 158;
  state.coins = 210;
  state.combo = 4;
  state.orders = [
    orderWith(state, 'nasi-goreng', 9, 80),
    orderWith(state, 'mie-ayam', 41, 85),
    orderWith(state, 'sate-madura', 62, 90),
    orderWith(state, 'gado-gado', 28, 88),
  ];
  state.carry = ['ayam-bakar', 'bumbu-kacang', 'sayur-cincang'];
  state.chef.x = 640;
  state.chef.y = 470;
  state.burners[0] = { item: 'ayam-bakar', raw: 'ayam-mentah', progress: 4.0, done: true, burned: false };
  state.burners[1] = { item: 'mie-mentah', raw: 'mie-mentah', progress: 2.8, done: false, burned: false };
  state.hint = 'RUSH HOUR — satu pesanan hampir hangus!';
}

const STAGES = { 1: stageCover, 2: stageChopping, 3: stageReadyToServe, 4: stageRushHour };

// Apply `?shot=N` staging, if present. Returns true when a shot staged.
export function applyShot(state, searchParams) {
  const n = Number(searchParams.get('shot'));
  if (!STAGES[n]) return false;
  resetOrderCounter();
  STAGES[n](state);
  return true;
}
