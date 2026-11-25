// Rasa Rush: Dapur Kilat — orders and scoring.
// The order board: spawning, patience, serving, combos and the shift clock.
// Nothing here draws; render.js reads this state.

import { RECIPES, SHIFT_SECONDS, MAX_ACTIVE_ORDERS, RUSH_SECONDS } from './config.js';

let nextOrderId = 1;

export function resetOrderCounter() {
  nextOrderId = 1;
}

function randomRecipe(rng) {
  return RECIPES[Math.floor(rng() * RECIPES.length)];
}

// A new order ticket: its patience shrinks as the shift goes on, so the
// late game presses harder than the early game.
export function createOrder(elapsedSeconds, rng) {
  const pressure = Math.min(1, elapsedSeconds / SHIFT_SECONDS);
  const maxPatience = 95 - pressure * 30;
  return {
    id: nextOrderId++,
    recipe: randomRecipe(rng),
    patience: maxPatience,
    maxPatience,
    fresh: true,
  };
}

// How long until the next order appears. Rush hour spawns faster.
export function nextSpawnDelay(elapsedSeconds, rng) {
  const rush = elapsedSeconds >= SHIFT_SECONDS - RUSH_SECONDS;
  const base = rush ? 8 : 13;
  return base + rng() * 5;
}

// Tick every active order's patience. Returns the orders that expired
// this tick so the caller can penalise them.
export function tickOrders(state, dt) {
  const expired = [];
  for (const order of state.orders) {
    order.patience -= dt;
    order.fresh = false;
    if (order.patience <= 0) expired.push(order);
  }
  if (expired.length) {
    state.orders = state.orders.filter((o) => o.patience > 0);
  }
  return expired;
}

export function isRushHour(state) {
  return state.timeLeft <= RUSH_SECONDS;
}

// Serving an order: coins grow with the patience still left and with the
// current combo. Returns the coins earned.
export function serveOrder(state, order) {
  const patienceShare = Math.max(0, order.patience / order.maxPatience);
  const tip = Math.round(patienceShare * 15);
  const comboBonus = state.combo * 2;
  const coins = order.recipe.price + tip + comboBonus;
  state.coins += coins;
  state.served += 1;
  state.combo += 1;
  if (state.combo > state.bestCombo) state.bestCombo = state.combo;
  state.orders = state.orders.filter((o) => o.id !== order.id);
  state.plate.length = 0;
  return coins;
}

export function expirePenalty(state) {
  state.hearts -= 1;
  state.combo = 0;
  state.expired += 1;
}

// Seconds left on the shift clock.
export function shiftTimeLeft(state) {
  return Math.max(0, SHIFT_SECONDS - state.elapsed);
}

export function formatClock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

// Star rating from the final coin total, for the end screen.
export function starRating(state) {
  if (state.coins >= 320) return 3;
  if (state.coins >= 200) return 2;
  if (state.coins >= 100) return 1;
  return 0;
}
