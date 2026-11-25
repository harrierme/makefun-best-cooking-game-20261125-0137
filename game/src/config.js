// Rasa Rush: Dapur Kilat — configuration.
// Every tunable number, colour, recipe and station of the game lives here
// so the rest of the code reads like the kitchen it describes.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const HUD_HEIGHT = 92;
export const KITCHEN_TOP = 100;
export const KITCHEN_BOTTOM = 712;
export const KITCHEN_LEFT = 8;
export const KITCHEN_RIGHT = 1272;

export const SHIFT_SECONDS = 180;
export const MAX_ACTIVE_ORDERS = 4;
export const MAX_HEARTS = 3;
export const CARRY_LIMIT = 3;
export const PLATE_LIMIT = 3;
export const CHEF_SPEED = 265;
export const CHEF_RADIUS = 26;
export const INTERACT_RANGE = 52;
export const RUSH_SECONDS = 30;

export const PALETTE = {
  floorA: '#e8c9a0',
  floorB: '#dfb98d',
  floorEdge: '#c99a68',
  wall: '#f7ead6',
  hud: '#3b2a1e',
  hudSoft: '#5a4232',
  cream: '#fff6e8',
  ink: '#2e2118',
  tomato: '#d95f43',
  leaf: '#5f9153',
  gold: '#f2b544',
  sky: '#7fb3d5',
  wood: '#a9713f',
  woodDark: '#7d4f27',
  steel: '#b9c4cc',
  danger: '#d9382b',
  ok: '#58a34a',
};

// --- Ingredients -----------------------------------------------------------
// Every ingredient id the game knows. `label` is what the player reads,
// `color` is its accent in the tray and on tickets.

export const INGREDIENTS = {
  'ayam-mentah':   { label: 'Ayam Mentah',   color: '#e89aa0', raw: true },
  'telur':         { label: 'Telur',         color: '#f6e3a1', raw: true },
  'sayur':         { label: 'Sayur',         color: '#7cb35a', raw: true },
  'nasi':          { label: 'Nasi',          color: '#fdf6e3', raw: false },
  'mie-mentah':    { label: 'Mie Mentah',    color: '#f2c94c', raw: true },
  'bumbu-kacang':  { label: 'Bumbu Kacang',  color: '#a5672f', raw: false },
  'sayur-cincang': { label: 'Sayur Cincang', color: '#5f9153', raw: false },
  'ayam-bakar':    { label: 'Ayam Bakar',    color: '#b0522f', raw: false },
  'telur-goreng':  { label: 'Telur Goreng',  color: '#f2a93b', raw: false },
  'mie-rebus':     { label: 'Mie Rebus',     color: '#eab543', raw: false },
  'gosong':        { label: 'Gosong!',       color: '#2b2b2b', raw: false },
};

// Chopping turns one raw ingredient into its chopped form.
export const CHOP_RECIPES = {
  'sayur': { result: 'sayur-cincang', seconds: 1.6 },
};

// The stove turns a raw ingredient into its cooked form over time.
// `burnSeconds` after it is done, the food burns and must be trashed.
export const COOK_RECIPES = {
  'ayam-mentah': { result: 'ayam-bakar',   seconds: 4.0, burnSeconds: 7 },
  'telur':       { result: 'telur-goreng', seconds: 3.0, burnSeconds: 7 },
  'mie-mentah':  { result: 'mie-rebus',    seconds: 3.5, burnSeconds: 7 },
};

// --- Recipes (the order board) ----------------------------------------------

export const RECIPES = [
  {
    id: 'nasi-goreng',
    name: 'Nasi Goreng',
    items: ['nasi', 'telur-goreng', 'sayur-cincang'],
    price: 22,
    color: '#e07840',
  },
  {
    id: 'mie-ayam',
    name: 'Mie Ayam',
    items: ['mie-rebus', 'ayam-bakar', 'sayur-cincang'],
    price: 26,
    color: '#d9a441',
  },
  {
    id: 'sate-madura',
    name: 'Sate Madura',
    items: ['ayam-bakar', 'ayam-bakar', 'bumbu-kacang'],
    price: 30,
    color: '#b0522f',
  },
  {
    id: 'gado-gado',
    name: 'Gado-Gado',
    items: ['sayur-cincang', 'telur-goreng', 'bumbu-kacang'],
    price: 24,
    color: '#5f9153',
  },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id);
}

// --- Stations ---------------------------------------------------------------
// A station is a counter the chef walks up to. `gives` hands out an
// ingredient instantly, `action` names its special behaviour.

export const STATIONS = [
  { id: 'kulkas',      name: 'KULKAS',       kind: 'give', gives: 'ayam-mentah', x: 16,  y: 104, w: 150, h: 80, color: '#9fc3d8' },
  { id: 'telur',       name: 'TELUR',        kind: 'give', gives: 'telur',       x: 182, y: 104, w: 150, h: 80, color: '#f2d492' },
  { id: 'sayur',       name: 'PETI SAYUR',   kind: 'give', gives: 'sayur',       x: 348, y: 104, w: 150, h: 80, color: '#8fbf6f' },
  { id: 'nasi',        name: 'PANCI NASI',   kind: 'give', gives: 'nasi',        x: 514, y: 104, w: 150, h: 80, color: '#e8e0cc' },
  { id: 'mie',         name: 'KOTAK MIE',    kind: 'give', gives: 'mie-mentah',  x: 680, y: 104, w: 150, h: 80, color: '#f2c94c' },
  { id: 'bumbu',       name: 'RAK BUMBU',    kind: 'give', gives: 'bumbu-kacang', x: 846, y: 104, w: 150, h: 80, color: '#c98d4b' },
  { id: 'talenan',     name: 'TALENAN',      kind: 'chop',                       x: 16,  y: 290, w: 170, h: 110, color: '#caa06a' },
  { id: 'kompor',      name: 'KOMPOR',       kind: 'stove',                      x: 16,  y: 470, w: 170, h: 130, color: '#5a5f66' },
  { id: 'saji',        name: 'JENDELA SAJI', kind: 'serve',                      x: 1094, y: 104, w: 170, h: 150, color: '#d95f43' },
  { id: 'plating',     name: 'MEJA PLATING', kind: 'plate',                      x: 1094, y: 300, w: 170, h: 130, color: '#e8d9bd' },
  { id: 'sampah',      name: 'SAMPAH',       kind: 'trash',                      x: 1094, y: 560, w: 170, h: 110, color: '#7a7f7a' },
];

export function stationById(id) {
  return STATIONS.find((s) => s.id === id);
}

// Two burners on the stove, positioned inside the stove station rect.
export const BURNERS = [
  { x: 52, y: 516 },
  { x: 128, y: 516 },
];
export const BURNER_RADIUS = 30;
