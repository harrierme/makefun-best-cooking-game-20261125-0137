// Rasa Rush: Dapur Kilat — kitchen model.
// Stations, the stove's burners, the chopping board and the plating
// counter. This file owns "what happens when the chef uses a station";
// main.js owns when the chef may use one.

import {
  STATIONS, BURNERS, BURNER_RADIUS, CHOP_RECIPES, COOK_RECIPES,
  INGREDIENTS, CARRY_LIMIT, PLATE_LIMIT, INTERACT_RANGE,
} from './config.js';

export function stationCenter(station) {
  return { x: station.x + station.w / 2, y: station.y + station.h / 2 };
}

// Distance from the chef to a station's edge (0 when overlapping it).
export function distanceToStation(chef, station) {
  const cx = Math.max(station.x, Math.min(chef.x, station.x + station.w));
  const cy = Math.max(station.y, Math.min(chef.y, station.y + station.h));
  return Math.hypot(chef.x - cx, chef.y - cy);
}

// The closest station the chef can reach, or null.
export function nearestStation(chef) {
  let best = null;
  let bestDist = Infinity;
  for (const station of STATIONS) {
    const d = distanceToStation(chef, station);
    if (d < bestDist) {
      bestDist = d;
      best = station;
    }
  }
  return bestDist <= INTERACT_RANGE ? best : null;
}

// True when a point (a mouse click) lands inside a station's rect.
export function stationAtPoint(x, y) {
  return STATIONS.find((s) => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) || null;
}

function carryingCount(state) {
  return state.carry.length;
}

function canCarryMore(state) {
  return carryingCount(state) < CARRY_LIMIT;
}

// --- Burner helpers ---------------------------------------------------------

export function burnerState(state, index) {
  return state.burners[index];
}

export function freeBurnerIndex(state) {
  return state.burners.findIndex((b) => !b.item);
}

// A burner cooks its item; returns 'done' the moment it finishes,
// 'burned' once it has sat too long, or null while it still cooks.
export function tickBurner(burner, dt) {
  if (!burner.item) return null;
  const recipe = COOK_RECIPES[burner.raw];
  if (!recipe) return null;
  burner.progress += dt;
  if (!burner.done && burner.progress >= recipe.seconds) {
    burner.done = true;
    burner.item = recipe.result;
    return 'done';
  }
  if (burner.done && burner.progress >= recipe.seconds + recipe.burnSeconds) {
    burner.item = 'gosong';
    burner.done = false;
    burner.burned = true;
    return 'burned';
  }
  return null;
}

export function burnerLabel(burner) {
  if (!burner.item) return null;
  if (burner.burned) return 'GOSONG!';
  if (burner.done) return INGREDIENTS[burner.item].label + ' SIAP';
  const recipe = COOK_RECIPES[burner.raw];
  const pct = recipe ? Math.min(1, burner.progress / recipe.seconds) : 0;
  return INGREDIENTS[burner.raw].label + ' ' + Math.round(pct * 100) + '%';
}

// --- Chopping ----------------------------------------------------------------

export function tickChopping(state, dt) {
  if (!state.chopping) return null;
  const recipe = CHOP_RECIPES[state.chopping.raw];
  state.chopping.progress += dt;
  if (state.chopping.progress >= recipe.seconds) {
    const result = recipe.result;
    state.chopping = null;
    return result;
  }
  return null;
}

// --- Interactions ------------------------------------------------------------
// `useStation` runs the chef's action at a station and returns a short
// event object the caller turns into feedback (sound, floating text).
// Possible results: { ok, event, message } where event is one of
// 'give' | 'chop-start' | 'stove-place' | 'stove-take' | 'plate-add' |
// 'plate-full' | 'serve' | 'serve-no-match' | 'trash' | 'busy' | 'full'.

export function useStation(state, station) {
  const chef = state.chef;
  switch (station.kind) {
    case 'give': {
      if (!canCarryMore(state)) return { ok: false, event: 'full', message: 'Tangan penuh!' };
      state.carry.push(station.gives);
      return { ok: true, event: 'give', message: INGREDIENTS[station.gives].label };
    }
    case 'chop': {
      if (state.chopping) return { ok: false, event: 'busy', message: 'Masih mencincang…' };
      const idx = state.carry.indexOf('sayur');
      if (idx === -1) return { ok: false, event: 'need', message: 'Butuh Sayur!' };
      state.carry.splice(idx, 1);
      state.chopping = { raw: 'sayur', progress: 0, x: station.x + station.w / 2, y: station.y + station.h / 2 };
      return { ok: true, event: 'chop-start', message: 'Cincang…' };
    }
    case 'stove': {
      // Take a finished burner first.
      const doneIdx = state.burners.findIndex((b) => b.item && (b.done || b.burned));
      if (doneIdx !== -1) {
        if (!canCarryMore(state)) return { ok: false, event: 'full', message: 'Tangan penuh!' };
        const taken = state.burners[doneIdx].item;
        state.burners[doneIdx] = { item: null, raw: null, progress: 0, done: false, burned: false };
        state.carry.push(taken);
        return { ok: true, event: 'stove-take', message: INGREDIENTS[taken].label };
      }
      // Otherwise place a cookable carried item on a free burner.
      const free = freeBurnerIndex(state);
      if (free === -1) return { ok: false, event: 'busy', message: 'Kompor penuh!' };
      const cookIdx = state.carry.findIndex((item) => COOK_RECIPES[item]);
      if (cookIdx === -1) return { ok: false, event: 'need', message: 'Bawa bahan mentah!' };
      const raw = state.carry.splice(cookIdx, 1)[0];
      state.burners[free] = { item: raw, raw, progress: 0, done: false, burned: false };
      return { ok: true, event: 'stove-place', message: 'Memasak ' + INGREDIENTS[raw].label };
    }
    case 'plate': {
      if (!state.carry.length) return { ok: false, event: 'need', message: 'Tangan kosong!' };
      if (state.plate.length >= PLATE_LIMIT) return { ok: false, event: 'plate-full', message: 'Piring penuh!' };
      const item = state.carry.pop();
      state.plate.push(item);
      return { ok: true, event: 'plate-add', message: INGREDIENTS[item].label + ' ke piring' };
    }
    case 'serve': {
      if (!state.plate.length) return { ok: false, event: 'need', message: 'Piring kosong!' };
      const match = findMatchingOrder(state);
      if (!match) return { ok: false, event: 'serve-no-match', message: 'Tidak ada pesanan cocok!' };
      return { ok: true, event: 'serve', order: match, message: 'Disajikan!' };
    }
    case 'trash': {
      if (state.carry.length) {
        state.carry.length = 0;
        return { ok: true, event: 'trash', message: 'Dibuang' };
      }
      if (state.plate.length) {
        state.plate.length = 0;
        return { ok: true, event: 'trash', message: 'Piring dikosongkan' };
      }
      return { ok: false, event: 'need', message: 'Tidak ada yang dibuang' };
    }
    default:
      return { ok: false, event: 'need', message: '' };
  }
}

// The first active order whose recipe matches the plate exactly
// (same multiset of ingredients, order-insensitive).
export function findMatchingOrder(state) {
  const plateSorted = [...state.plate].sort().join('|');
  return state.orders.find((o) => [...o.recipe.items].sort().join('|') === plateSorted) || null;
}

// Burner screen positions, for drawing and for the click target.
export function burnerPosition(index) {
  return BURNERS[index];
}

export function burnerRadius() {
  return BURNER_RADIUS;
}
