# Story Studio

Automated 3D Roblox-style story shorts ("In this world…" format), rendered with three.js in headless Chrome,
narrated with a local Kokoro TTS voice. One new episode per day.

- `RUNBOOK.md` — the daily procedure (start here).
- `KIT.md` — toolkit API for writing shots.
- `engine/` — renderer (main.html, render.py), narration (voice.py), captions/bubbles (captions.py), characters (avatar.js), sets (sets.js, sets2.js), shared helpers (kit.js), faces.
- `episodes/NNN-slug/` — script.txt, bubbles.json, notes.md, shots.js (+ parts). `out/` is generated and not committed.
- `episodes/INDEX.md` — every episode so far.

Quick start: `./setup.sh && python3 engine/voice.py episodes/001-shadow && python3 engine/render.py episodes/001-shadow stills 1 2 3`
