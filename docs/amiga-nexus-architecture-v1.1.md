# Amiga Nexus — Architecture Guide (v1.1)

Last updated: 2026-03-05

## 1. Purpose
Amiga Nexus is the retro-future world in the Commodore ecosystem. It serves as:

- a network operations and research station hub
- an early-internet flavored interface (Gopher-style)
- a higher-tier community space with expanded capabilities unlocked via participation

---

## 2. Core Concepts

### 2.1 Identity Rendering
Amiga Nexus consumes Commodore Universe identity and renders it as:

- NexusID (derived from C=ID)
- Spacepack (inventory rendering)
- Log Book (journal rendering)

Canonical → Nexus mapping:

- C=ID → NexusID
- Inventory → Spacepack
- Journal → Log Book
- Rank → Clearance Level
- Badges → Insignia

Example:

```
AMIGA NEXUS
NexusID: C8472
Clearance: EXPLORER

Spacepack:
 • illumination module
 • data disk
 • audio processor

Log Book: 12 entries
```

---

## 3. System Architecture

### 3.1 High-Level Components
- Universe Identity Service (commodoreuniverse.com)
  - C=ID registry, Passport, trophies, visited worlds
- Amiga Nexus Web App
  - Workbench-inspired UI and terminal windows
- Nexus Gopher Layer
  - menu-driven archive index and world portals
- Content/Archive Store
  - timeline nodes, curated resources, media
- Realtime Layer (optional)
  - presence, chat in Nexus Lounge, NPCs depending on interaction mode

### 3.2 Data Flow
1. User opens Amiga Nexus
2. Nexus requests Passport via Universe API
3. Nexus renders Workbench UI and identity panels
4. Nexus loads Gopher menu index
5. User navigates to archives, logs, or portals (including Caverns terminal)

---

## 4. Nexus Gopher (BBS as Gopher Node)

### 4.1 Menu Model
Nexus presents a Gopher-like menu (even if implemented as HTML). Example:

```
COMMODORE UNIVERSE GOPHER
1. Caverns Terminal (C64 BBS)
2. Archive Registry (BBS lists, museums, groups)
3. Explorer Log Books (public entries)
4. Artifact Index (chips, manuals, demos)
5. System Status
6. Exit
Select >
```

### 4.2 Caverns Portal
Selecting Caverns Terminal launches the Caverns experience (embedded emulator or dedicated route). Narrative framing: Nexus indexes legacy terminals.

---

## 5. UI/UX: Workbench-Inspired

### 5.1 Window Types
- Identity Window (NexusID, clearance, badges)
- Gopher Terminal Window (menu navigation)
- Spacepack Window (inventory)
- Log Book Window (journal)
- Archive Windows (resources, docs, exhibits)

### 5.2 Interaction Modes
Respect global setting (from Universe), with optional Nexus override:

- SOLO
- NPC_ONLY
- EXPLORERS_ONLY
- FULL

Recommended defaults:
- Nexus: EXPLORERS_ONLY or FULL (depending on moderation and load)

---

## 6. Color System (Participation-Gated Amiga Palettes)

### 6.1 Rules
Amiga Nexus unlocks richer palettes as participation increases, mirroring increasing graphics capability through the Amiga lineage.

### 6.2 Palette Tiers (Proposed)
- Tier 1: Workbench Classic limited palette
- Tier 2: Expanded palette (more accents)
- Tier 3: Advanced palette (full selection for supported UI elements)

Implementation notes:
- Store palette selection using palette_id and color indices
- Gate palette availability by participation tier or trophy attainment

---

## 7. Social: Nexus Lounge
Nexus includes a station lounge concept that can act as:

- real-time chat room
- presence hub (Active Nodes)
- announcement board

Terminal-style commands:
- WHO
- SAY <message>
- WHISPER <user> <message>
- MODE <solo|npc|explorers|full>

---

## 8. Archives: External Networks
Nexus hosts an External Networks section that links to:
- active user groups
- museums
- events
- software archives

Curate and frame these as network nodes, not generic link lists.

---

## 9. Definition of Done (v1.1)
- Workbench-style shell
- Reads Passport, renders NexusID, Spacepack, Log Book
- Provides Gopher-like menu navigation
- Implements palette tier gating
- Provides at least one social hub route (can be read-only initially)
