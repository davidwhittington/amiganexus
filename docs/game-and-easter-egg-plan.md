# Amiga Nexus — Game & Easter Egg Plan

## Status: IMPLEMENTED (2026-03-07)

### Files Created
- `js/boing.js` — Boing Ball easter egg (self-contained, added to all pages)
- `js/nexus-protocol.js` — Game logic, AI, rendering
- `game/index.html` — Nexus Protocol game page (Station 11)

### Files Modified
- `map.html` — Station 11 (Nexus Protocol) added; boing.js loaded
- `js/nav.js` — `⚔ COMMAND` nav entry added for `/game/`
- `index.html` — boing.js script tag added

---

## Feature 1: Boing Ball Easter Egg (`js/boing.js`)

### Trigger
Type **"BOING"** on any page. Keypress accumulator listens globally; resets after 2s inactivity.
No visible hint — discovery is the reward.

### Visual
- Fullscreen overlay: `position:fixed`, dark space background, CRT scanline texture
- `<canvas>` centred, sized to viewport
- **Ball**: checkerboard sphere via Canvas 2D ImageData — polar projection (lat/lon → checker band)
  - Per-row latitude checker band precomputed (avoids `asin` in inner loop)
  - Y-axis spin via coordinate rotation before `atan2`
  - Diffuse shading: Phong-style light from upper-left
- **Physics**: gravity (`vy += 0.38`), floor bounce with damping (`vy *= 0.76`), wall bounce
- **Shadow**: ellipse below ball, opacity and size scale with height above floor
- **Dismiss**: Escape key or click anywhere

---

## Feature 2: Nexus Protocol Strategy Game

### Concept
Turn-based faction strategy on a 5-sector Amiga Galaxy map.
Stripped-down **Twilight Imperium meets FTL** — emergent from simple rules, no trivia, no text adventure.

### Contrast with Caverns Trivia
| Caverns Trivia | Nexus Protocol |
|---|---|
| Knowledge recall | Strategic decision-making |
| Single player, linear tiers | Faction choice, asymmetric play |
| Quiz format | Turn-based map control |
| No opponent | AI opponent |

### Factions
| Faction | Style | Bonus | Unique Unit |
|---|---|---|---|
| OCS Command | Balanced | +2 signal | Copper Shield (DEF 4) |
| AGA Imperium | Heavy hitter | +1 Fighter | Blitter Cannon (ATK 5) |
| FPGA Collective | Swarm/fast | +2 Scouts | Adaptive Core (SPD 2) |

### Map — 5 Sectors
| Sector | Signal | Defence | Notes |
|---|---|---|---|
| Jay Miner Reach | +2 | 1 | Player HQ (start) |
| Boing Sector | +4 | 2 | Central, highest value |
| Lorraine Cluster | +3 | 3 | Most defensible |
| AGA Nebula | +3 | 2 | AI HQ (start) |
| Deep Orbit Zone | +1 | 1 | Neutral buffer |

### Adjacency
- Boing: all 4 others
- Jay Miner: Boing, Lorraine, AGA
- Lorraine: Jay Miner, Boing, Deep Orbit
- AGA: Jay Miner, Boing, Deep Orbit
- Deep Orbit: Boing, Lorraine, AGA

### Turn Loop
1. **COLLECT** — auto-gather signal from owned sectors
2. **BUILD** — deploy units to owned sectors (spend signal)
3. **MOVE** — move units to adjacent sectors
4. **RESOLVE** — auto-combat in contested sectors (dice roll + unit strength)
5. **EVENT** — random event card drawn and applied
6. **AI TURN** — AI collects, builds, moves, resolves (same rules)

### Units
| Unit | Cost | ATK | DEF | Notes |
|---|---|---|---|---|
| Scout | 1 | 1 | 1 | Speed 2 |
| Fighter | 2 | 2 | 1 | Reliable |
| Cruiser | 4 | 3 | 3 | Heavy |
| Carrier | 6 | 2 | 4 | Deploys 2 Fighters |
| Signal Jammer | 3 | 0 | 0 | Cuts enemy signal |

### Victory Conditions
1. **Sector Dominance** — control 4 of 5 sectors simultaneously
2. **Decisive Strike** — capture enemy HQ sector
3. **Strategic Victory** — more sectors after 20 turns

### Technology
- Vanilla JS, single file `js/nexus-protocol.js` + `game/index.html`
- SVG map (5 nodes, hyperspace lanes, animated)
- Workbench chrome UI (titlebar, menubar, statusbar)
- `localStorage` not yet wired (future: save state, faction preference)

---

## Galactic Map Addition

Station 11 — **NEXUS PROTOCOL** added to `map.html`:
- Position: (570, 160) — between FPGA Foundry and Lounge
- Visual: game-controller icon with coloured buttons (red/teal/blue)
- Faster pulse animation (1.8s vs 2.5s standard)
- Hyperspace lanes to FPGA Foundry and Nexus Lounge
- Status: `GAME ACTIVE`

---

## Event Cards (10 total)
- Supply Drop — +3 signal
- Static Burst — jammers offline this turn
- Reinforcements — +2 scouts at HQ
- Compute Surge — build cost -1 this turn
- Sector Anomaly — all units +1 speed
- Pirate Raid — Deep Orbit loses 1 unit
- Signal Storm — 1 random sector blocked
- AI Intel — AI skips move phase
- All Quiet — no effect
- Tech Cache — +2 signal

---

## Deferred / Phase 2+
- `localStorage` save state (mid-game save, faction preference, high score)
- Sound effects (Amiga SFX aesthetic)
- Warp links from game map sectors to actual site sections
- vAmigaWeb emulator embed on Emulation Lab page (ROM licensing consideration)
- Multi-sector unit moves for Speed 2 units (Scout, Adaptive Core)
- Jammer effect fully implemented in combat resolution
- Mobile-optimised layout (current layout works but side panel collapses)
