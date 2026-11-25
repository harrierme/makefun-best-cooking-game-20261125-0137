// Rasa Rush: Dapur Kilat — keyboard and mouse input.
// One object holds the live input state; the game loop reads it each
// frame. Keys are tracked by code so layouts do not matter.

export function createInput() {
  return {
    keys: new Set(),
    // Edge-triggered presses consumed once by the game loop.
    pressed: new Set(),
    mouse: { x: 0, y: 0, clicked: false, down: false },
  };
}

const GAME_KEYS = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'KeyE', 'Space', 'Enter', 'KeyR', 'KeyP', 'KeyM', 'Escape',
]);

export function attachInput(input, canvas) {
  window.addEventListener('keydown', (event) => {
    if (GAME_KEYS.has(event.code)) event.preventDefault();
    if (!event.repeat) input.pressed.add(event.code);
    input.keys.add(event.code);
  });
  window.addEventListener('keyup', (event) => {
    input.keys.delete(event.code);
  });
  window.addEventListener('blur', () => {
    input.keys.clear();
  });
  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    input.mouse.x = (event.clientX - rect.left) * scaleX;
    input.mouse.y = (event.clientY - rect.top) * scaleY;
  });
  canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    input.mouse.x = (event.clientX - rect.left) * scaleX;
    input.mouse.y = (event.clientY - rect.top) * scaleY;
    input.mouse.down = true;
    input.mouse.clicked = true;
  });
  window.addEventListener('mouseup', () => {
    input.mouse.down = false;
  });
}

// Movement vector from the held keys, normalised.
export function moveVector(input) {
  let x = 0;
  let y = 0;
  if (input.keys.has('KeyA') || input.keys.has('ArrowLeft')) x -= 1;
  if (input.keys.has('KeyD') || input.keys.has('ArrowRight')) x += 1;
  if (input.keys.has('KeyW') || input.keys.has('ArrowUp')) y -= 1;
  if (input.keys.has('KeyS') || input.keys.has('ArrowDown')) y += 1;
  if (x !== 0 && y !== 0) {
    const len = Math.hypot(x, y);
    x /= len;
    y /= len;
  }
  return { x, y };
}

export function wasPressed(input, code) {
  return input.pressed.has(code);
}

export function consumePressed(input) {
  input.pressed.clear();
  input.mouse.clicked = false;
}
