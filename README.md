# makefun-best-cooking-game-20261125-0137

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/harrierme/makefun-best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/harrierme/makefun-best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Rasa Rush: Dapur Kilat** — a complete original cooking game for make.fun's "Make the best cooking game" bounty. You are the chef of a small Indonesian warung kitchen: take orders from the board, gather ingredients from the counters, chop vegetables on the board, cook on the two-burner stove, assemble dishes on the plating counter, and serve them at the window before patience runs out. Four original recipes (Nasi Goreng, Mie Ayam, Sate Madura, Gado-Gado), a 3-minute shift with a rush hour finale, combos, hearts, and a star rating.

## Run it

```sh
node serve.ts
# open http://localhost:8080 — no build step, no network requests
```

Play with WASD / arrow keys to walk, **E** or click to use a station, **P** to pause, **M** to mute, **R** to restart. All art is drawn in code and all sounds are synthesised with the Web Audio API — the game ships no image or audio files.

## Layout

- `game/` — the static game: `index.html` plus `src/` modules (`config`, `kitchen`, `orders`, `render`, `sprites`, `audio`, `input`, `shots`, `main`)
- `screenshots/` — 4 real renders of the game running in desktop Chrome
- `main.ts` — the make.fun entrypoint: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
- `serve.ts` — tiny static server for local play-testing

---

<sub>Entered on [make.fun](https://make.fun/?ref=efmrhagc&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
