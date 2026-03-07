# Amiga Nexus

A retro-futurist Amiga resource hub — hardware, emulation, FPGA, community, and the Amiga cultural record. Aesthetic: Amiga Workbench 1.3 floating in deep space. Live at [amiganexus.com](https://amiganexus.com).

Part of the [Commodore Universe](https://commodoreuniverse.com) network. Shares C=ID identity with Commodore Caverns, PETSCII Bedrock, and the Commodore Universe hub.

## Status

| Phase | Status |
|-------|--------|
| Phase 0 — Coming soon / preflight | Complete |
| Phase 1 — Full static site (10 sections + Galactic Map) | Complete — live |
| Phase 2 — Backend (Bun/Hono + Supabase) | Scaffolded, in progress |
| Phase 3 — Auth, NexusID, Spacepack | Planned |

## Deployment

Push to `main` triggers GitHub Actions rsync deploy to the VPS (`amiganexus.com`).

```bash
# Local preview — any static server works
npx serve .
python3 -m http.server 8080
```

## Project Structure

```
amiganexus/
├── index.html              # Landing page (cinematic approach sequence)
├── map.html                # Galactic Map — primary nav hub (11 stations)
├── game/                   # Nexus Protocol strategy game (Station 11)
├── hardware/               # Procurement Station
├── emulation/              # Emulation Lab
├── fpga/                   # FPGA Foundry
├── community/              # Community Transmissions
├── archives/               # Archive Vault
├── workbench/              # Workbench Workshop
├── signals/                # Signal Tower
├── lounge/                 # Nexus Lounge
├── mission-control/        # Mission Control
├── warp-terminal/          # Warp Terminal (curated external links)
├── css/
│   └── main.css            # Shared design system
├── js/
│   ├── warp.js             # Warp Drive modal system (all external links)
│   ├── nav.js              # Workbench nav injection + stars + clock
│   ├── spacepack.js        # Spacepack panel (C=ID, prefs, items)
│   ├── boing.js            # Boing Ball easter egg (type BOING)
│   └── nexus-protocol.js   # Nexus Protocol game engine
├── server/                 # Phase 2 backend (Bun/Hono)
├── docs/
│   ├── amiga-nexus-architecture-v1.1.md
│   └── game-and-easter-egg-plan.md
├── ecosystem.config.cjs    # PM2 config
└── TODO.md                 # Full feature backlog and phase roadmap
```

## Development Roadmap

See [TODO.md](./TODO.md) for the full phased feature backlog.

## Changelog

### 2026-03-07
- **Nexus Protocol** — turn-based sector control strategy game (`game/`, `js/nexus-protocol.js`). 3 asymmetric factions (OCS Command, AGA Imperium, FPGA Collective), 5-sector Galactic Map, full turn loop with AI opponent, 10 random event cards, 3 victory conditions
- **Boing Ball easter egg** — type "BOING" on any page; full-browser-window canvas recreation of the 1984 Amiga demo. Physics based on GLFW boing.c reference (authentic bounce timing, spin rate, perspective floor grid)
- **Station 11** added to Galactic Map — Nexus Protocol game entry point
- **Spacepack panel** — Workbench-chrome identity/preferences panel (C=ID, Spacepack items, text size), loaded on all pages

### 2026-03-06
- Phase 1 full static site launched — all 10 sections live
- Galactic Map (`map.html`) — SVG star-sector chart with 10 stations, hover panels, Warp Gates
- Themed error pages (403, 404, 500)
- TODO.md — full phased feature backlog
- NexusID aligned with C=ID format (`C=10427`)
- Phase 2 backend scaffolded — Bun/Hono server, Supabase schema, PM2 config
- C=ID confirmed as shared identity across all 4 Commodore Universe properties

### 2026-03-05
- Initial commit — coming soon teaser page
- GitHub Actions deploy workflow (rsync to VPS)
- Emoji favicon
