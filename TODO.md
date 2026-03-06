# Amiga Nexus — TODO & Feature Ideas

Current phase: **Phase 1 complete** — static site live at amiganexus.com

---

## Immediate / Known

- [ ] Error pages for other Commodore Universe properties (Caverns, Universe hub)
- [ ] Galactic Map mobile touch support (pan/zoom without hover dependency)
- [ ] Verify all 37 Warp Terminal external links are live
- [ ] Add `<meta>` OG/Twitter cards to all 10 section pages
- [ ] Add `sitemap.xml` and `robots.txt`
- [ ] Add canonical URLs across all pages

---

## Phase 2 — Backend Foundation

- [ ] Set up `server/` directory — Bun + Hono
- [ ] nginx reverse proxy config (or confirm Apache proxy setup) to `localhost:3000`
- [ ] Create Supabase project — Auth + Postgres + Storage
- [ ] DB schema: `users`, `spacepack_items`, `discovery_events`, `warp_logs`, `admin_settings`
- [ ] Signal Tower admin API — POST new news entries via authenticated endpoint
- [ ] Warp counter — log warp events to `warp_logs` (anonymous, no PII)
- [ ] GitHub Actions update — rsync + PM2 restart
- [ ] Environment variable management — `.env` on server, secrets in GitHub Actions
- [ ] Health check endpoint — `GET /health` returns 200 + uptime
- [ ] Basic rate limiting on all API routes (Hono middleware)
- [ ] Request logging middleware (structured JSON logs)
- [ ] PM2 ecosystem config — auto-restart, log rotation

---

## Phase 3 — Auth, NexusID & Spacepack

### Authentication
- [ ] Supabase Auth integration — Google OAuth
- [ ] Supabase Auth integration — GitHub OAuth
- [ ] Supabase Auth integration — Apple OAuth (capture display name on first sign-in — Apple only sends it once)
- [ ] "Request Clearance" button in Workbench menu bar
- [ ] Login modal — Workbench-style dialog, not full-page redirect
- [ ] Post-login redirect back to the page the user came from
- [ ] Logout — clear session, return to index
- [ ] Anonymous session → migrate to authenticated on signup (preserve pre-auth discoveries)
- [ ] Session persistence — remember login across tabs/sessions
- [ ] Auth error states — provider failed, popup blocked, network error
- [ ] Terms / privacy acknowledgement on first login (checkbox in clearance modal)

### NexusID
- [ ] C=ID assignment — sequential from C=10000, issued by Commodore Universe auth layer (format: `C=10427`)
- [ ] NexusID card component — renders in Mission Control with live user data
- [ ] Assigned Amiga model — cosmetic choice at signup (A500, A1200, A2000, A4000, CD32, CDTV, A600, A3000, Amiga 1000)
- [ ] Avatar initials — derived from display name, rendered in seafoam circle
- [ ] NexusID shared across Commodore Universe properties (same UUID)
- [ ] "Assigned Amiga" selector — dropdown with Amiga model art/icons
- [ ] Profile edit — change display name, assigned Amiga, sector affiliation
- [ ] Sector affiliation — cosmetic: Boing Sector, Lorraine Cluster, Jay Miner Reach, AGA Nebula, Deep Orbit Zone

### Spacepack
- [ ] Spacepack schema — `spacepack_items` table with user_id, item_id, found_at, location
- [ ] Spacepack display in Mission Control — list of found items with timestamps
- [ ] Item detail view — name, flavour text, station found, discovery date
- [ ] Supabase RLS — user can only read/write their own spacepack rows
- [ ] Empty state — "No items found. Explore the Nexus." with station hints
- [ ] Item count shown in NexusID card
- [ ] Spacepack renders as Commodore Universe Satchel cross-reference

### Discovery System
- [ ] `discoverable_items` table — id, name, description, location_pool (JSON array of slugs)
- [ ] `discoveries` table — user_id, item_id, assigned_location, discovered_at (null = unfound)
- [ ] Discovery seed per user — `user.discovery_seed` randomly assigned at account creation
- [ ] Deterministic location assignment — `pool[seed % pool.length]`
- [ ] Discoveries generated at account creation (all items assigned, none yet found)
- [ ] Admin generosity setting — global knob controlling discovery frequency (`admin_settings` table)
- [ ] Discovery claim flow — "SIGNAL DETECTED — [item]. Claim transmission?" overlay
- [ ] Claim animation — item flies into Spacepack in status bar
- [ ] Discovery events logged to `discovery_events` (for admin analytics)
- [ ] Per-page discovery check — server-side: does this user have an undiscovered item here?

### Signal Beacon (first discoverable item)
- [ ] Signal Beacon item in `discoverable_items` — location_pool covers all 10 station slugs + map
- [ ] Signal Beacon discovery unlocks ambient MOD audio
- [ ] Signal Beacon discovery triggers visual "FREQUENCY UNLOCKED" overlay
- [ ] Signal Beacon shown as special first item in empty Spacepack ("Find it to unlock audio")

### Preferences
- [ ] Preferences schema — `user_preferences` table: sound, palette_id, text_size, interaction_mode
- [ ] LocalStorage preferences pre-auth (sound on/off, text size)
- [ ] Migrate localStorage prefs to Supabase on login
- [ ] Palette selector in Mission Control (within unlocked tier)
- [ ] Text size selector — three sizes: STANDARD / EXPANDED / LARGE
- [ ] Preferences sync across devices via Supabase

### Clearance Levels
- [ ] EXPLORER clearance — granted at signup; unlocks Spacepack, Tier 1 palette
- [ ] PILOT clearance — upgrade trigger TBD; unlocks Tier 2 palette, Log Book, Lounge post access
- [ ] COMMANDER clearance — unlocks Tier 3 palette, extended Log Book, Warp submission
- [ ] ADMIRAL clearance — full access, admin capabilities where applicable
- [ ] Clearance upgrade logic — criteria to be defined (activity-based, manual, or time-gated)
- [ ] Clearance badge shown in Workbench menu bar when logged in
- [ ] Clearance upgrade notification — "CLEARANCE UPGRADED: PILOT" overlay

---

## Phase 4 — Adventure Layer

### Discovery Events (Zork-style)
- [ ] Adventure overlay component — slides in from bottom, Workbench terminal style
- [ ] Per-station flavour text for each discoverable item's location
- [ ] Discovery event only fires once per user per item
- [ ] Discovery check on page load — server call, only shows if item assigned here and unfound
- [ ] "Claim transmission" → POST to `/api/discover` → marks `discovered_at`
- [ ] Dismiss without claiming — item remains undiscovered (can return later)
- [ ] Discovery cooldown — don't check on every page load, use session flag
- [ ] Admin tool — view all discoverable items, edit location pools, add new items
- [ ] Item types — Standard / Rare / Legendary (cosmetic rarity tier)
- [ ] Rare item discovery animation — more dramatic reveal sequence

### Signal Beacon Audio
- [ ] Web Audio API integration — play .MOD files via PT-clone or similar library
- [ ] .MOD file sourcing from Aminet — curated list, credited per track
- [ ] Audio player UI — floating Workbench-style panel: track name, group, year, controls
- [ ] Audio controls — play/pause, next track, volume slider
- [ ] Track playlist — 10–20 curated ambient Amiga MOD tracks
- [ ] Persistent audio across page navigation (no re-init on each load)
- [ ] Audio state saved to localStorage (on/off, volume)
- [ ] "Signal Beacon required" state — audio player shows locked until beacon found
- [ ] Track attribution display — "TRACK: [name] by [group] — Amiga MOD [year]"
- [ ] Keyboard shortcut — `M` to toggle audio mute

### NPC Crew Interactions
- [ ] NPC crew card click → terminal dialogue sequence in overlay
- [ ] ZORA-7 dialogue — FPGA/MiSTer expertise, hints at FPGA Foundry discoveries
- [ ] MIRA-12 dialogue — archive knowledge, hints at Archive Vault items
- [ ] FELIX-9 dialogue — scout pilot, hints at Warp Terminal destinations
- [ ] NPC dialogue trees — 3–5 messages per NPC, rotates on repeat visits
- [ ] NPC hint system — contextual hints based on user's Spacepack progress
- [ ] New NPC — DUKE-3: Mission Control officer, helps with NexusID questions
- [ ] New NPC — PETRA-6: Signal Tower operator, drops news lore
- [ ] New NPC — CAIRO-1: Warp Terminal navigator, knows all external destinations
- [ ] NPC "last seen" timestamp — "FELIX-9 last spotted in Jay Miner Reach 2h ago"

### Galactic Map Easter Eggs
- [ ] Hidden station appears on map after finding Signal Beacon
- [ ] Hidden sector unlocks after COMMANDER clearance
- [ ] Map transmission — clicking certain nebula areas triggers a cryptic message
- [ ] Station pulse rate changes based on how recently you visited it
- [ ] "You are here" marker on map based on current page
- [ ] Warp Gate animation — clicking external destination triggers star-stretch before new tab opens
- [ ] Sector lore panel — clicking sector labels shows lore sidebar
- [ ] Map zoom levels — overview / sector / station detail
- [ ] Mini-map in corner of section pages
- [ ] Easter egg coordinates — hidden numbers in map SVG that decode to a secret page

---

## Phase 5 — Community & Realtime

### Nexus Lounge Live
- [ ] Supabase Realtime — presence channel for `/lounge/`
- [ ] Live crew count — "3 crew members aboard" updates in real time
- [ ] WHO command live output — list of online NexusIDs (display names)
- [ ] Terminal-style chat — SAY command broadcasts to all connected crew
- [ ] WHISPER command — private message between two online crew members
- [ ] Chat message persistence — last 50 messages stored, shown on join
- [ ] Chat moderation — admin can delete messages, ban users
- [ ] Rate limiting on chat — max 1 message per 2 seconds per user
- [ ] Chat profanity filter — basic word filter, replaceable with `[REDACTED]`
- [ ] Presence timeout — user marked offline after 5 min of inactivity
- [ ] Interaction mode — SOLO (no presence shown), NPC_ONLY, EXPLORERS_ONLY, FULL
- [ ] MODE command — set interaction mode from the terminal
- [ ] System messages — "[ZORA-7 joins the lounge]" style NPC ambient events
- [ ] Lounge history — LOG command shows last 20 lines of chat
- [ ] Ping command — PING shows your current latency to the Supabase Realtime server

### Transmission Board
- [ ] Transmission Board section — community-submitted news/finds
- [ ] Submit form — title, body (limited to 500 chars), link (optional), category tag
- [ ] Moderation queue — admin approves before display (Phase 5 launch: manual)
- [ ] Transmission display in Signal Tower — separate "Community Transmissions" tab
- [ ] Upvote transmissions — thumbs up, limited to 1 per user per post
- [ ] Report transmission — flag for mod review
- [ ] Author NexusID shown on each transmission
- [ ] Transmission count shown on submitter's NexusID card

### Warp Terminal Community
- [ ] User-submittable Warp destinations — form with URL, name, description, category
- [ ] Submission moderation queue — admin review before live
- [ ] Warp count per destination — incremented each time a user initiates the Warp
- [ ] "Most warped" ranking — top destinations by warp count
- [ ] Live uptime check on major community sites (EAB, Amibay) shown in Warp Terminal
- [ ] Last checked timestamp on each Warp destination
- [ ] Dead link detection — automated check, flag for admin review

### Notifications & Comms
- [ ] Email notifications via Resend or Postmark
- [ ] Email on: Clearance upgrade, new Spacepack item found, Transmission Board reply
- [ ] Email preference management — opt out per notification type
- [ ] In-app notification bell — Workbench-style, shows unread count
- [ ] Notification types: clearance upgrade, discovery, lounge mention, admin message
- [ ] NEXUS BROADCAST — admin can send a message to all users (shown in Lounge on next visit)

### RSS & Feeds
- [ ] RSS feed for Signal Tower — `/feed.xml`
- [ ] RSS feed for Transmission Board — `/transmissions.xml`
- [ ] JSON Feed alternative — `/feed.json`
- [ ] Atom feed — `/atom.xml`

---

## Phase 6 — Commodore Universe Integration

- [ ] Shared Supabase project across all Commodore Universe properties
- [ ] Same users table — one account for Nexus, Caverns, and Universe hub
- [ ] C=ID rendered in Commodore Caverns as Satchel; in Amiga Nexus as Spacepack — same data
- [ ] Cross-universe Insignia — earn at one site, displayed everywhere
- [ ] Clearance Level feeds back into Commodore Universe rank display
- [ ] "Nexus Veteran" insignia — awarded for completing Phase 1 exploration (all 10 stations visited)
- [ ] "Pioneer" insignia — first 100 users to register on Amiga Nexus
- [ ] Universe hub profile page — shows NexusID, Caverns Satchel, and other property identities
- [ ] Cross-property navigation — quick switch between Nexus / Caverns / Universe hub
- [ ] Unified announcement system — admin post appears on all properties simultaneously
- [ ] Shared admin panel — manage users, discoveries, and content across all properties

---

## Content Enhancements

### Signal Tower
- [ ] News category filtering — FPGA / Hardware / OS / Scene / Community / Events
- [ ] Date-sorted news feed (newest first)
- [ ] Search within Signal Tower
- [ ] "Share this transmission" — copy link or post to Mastodon/Bluesky
- [ ] Bookmarked transmissions — save to Spacepack / Log Book
- [ ] Transmission archive — paginated back-catalogue
- [ ] News post detail page — full article with related links
- [ ] News source attribution — link to original announcement
- [ ] Auto-fetch Amiga Bill YouTube latest video metadata (YouTube Data API v3)
- [ ] Auto-fetch EAB recent threads (RSS if available)

### Hardware / Procurement Station
- [ ] Price guide table — community-sourced median prices per model
- [ ] Price guide submission form — submit recent sale price with link evidence
- [ ] Vendor uptime check — show if AmigaKit, icomp.de etc are reachable
- [ ] "I have one to sell" link — directs to Amibay with Warp
- [ ] Model comparison table — A500 vs A1200 vs A4000 vs CD32
- [ ] Capacitor lists per model — A500, A600, A1200, A2000, A3000, A4000, CD32
- [ ] Recapping guides with difficulty rating
- [ ] PSU safety guide — which power supplies are dangerous, which replacements to use
- [ ] Floppy drive compatibility matrix
- [ ] Gotek/HxC floppy emulator setup guide
- [ ] RAM expansion guide by model
- [ ] Where to buy RAM — sourcing guide with links (Warps)
- [ ] Compatible monitor guide — which VGA/HDMI adapters work with which models

### FPGA Foundry
- [ ] MiSTer core changelog — track updates to the Amiga core
- [ ] MiSTer hardware shopping list — DE10-Nano + I/O board + RAM, with current prices and sources
- [ ] MiSTer setup wizard — step-by-step interactive guide (no backend, JS-driven)
- [ ] Vampire V4 model comparison — V4 SA+ vs V4 for A500 vs V4 for A1200 vs V4 for A600
- [ ] FPGA vs original Amiga — in-depth editorial
- [ ] MiSTer Amiga core game compatibility list (top 100 titles tested)
- [ ] Replay / FPGAArcade deep-dive section
- [ ] Natami project history editorial

### Emulation Lab
- [ ] WinUAE configuration presets — downloadable `.uae` config files for common setups
- [ ] FS-UAE ready-to-use configs — per emulator preset packs
- [ ] vAmiga guide — macOS-native, best settings walkthrough
- [ ] AmiBerry Pi model comparison — Pi 4 vs Pi 5 vs Pi Zero 2W
- [ ] Kickstart ROM version comparison table — 1.2 / 1.3 / 2.0 / 3.0 / 3.1 / 3.2
- [ ] WHDLoad game list — curated top 100 WHDLoad titles
- [ ] Amiga Forever review and setup guide
- [ ] AROS setup guide — native and hosted variants
- [ ] MorphOS overview (non-Amiga hardware variant)
- [ ] Amiga emulation on iOS — what works and what doesn't
- [ ] Amiga emulation on Android — RetroArch setup guide
- [ ] Emulation on Apple Silicon — native performance notes

### Archive Vault
- [ ] Demo scene hall of fame — top 20 OCS demos, top 20 AGA demos
- [ ] Demo scene editorial — what makes Amiga demos unique technically
- [ ] Amiga games editorial — landmark games with brief reviews (not a database, curated picks)
- [ ] Magazine timeline — chronological list of all major Amiga magazines
- [ ] History timeline interactive — CSS/JS timeline, no backend needed
- [ ] Jay Miner biography section
- [ ] Commodore's acquisition of Amiga — editorial with key dates
- [ ] Amiga's post-Commodore history — Escom, Gateway 2000, Amiga Inc., Hyperion
- [ ] Custom chip technical explainer — Agnus, Denise, Paula deep dives
- [ ] OCS/ECS/AGA differences — visual comparison where possible
- [ ] Scene group hall of fame — Fairlight, Kefrens, Red Sector Inc., Spaceballs, Cryptoburners
- [ ] Classic production spotlights — Hardwired, 9 Fingers, Desert Dream with context

### Workbench Workshop
- [ ] AmigaOS 3.2 vs 3.1 comparison — what changed, is it worth upgrading?
- [ ] AmigaOS 4.1 FE feature overview — for Sam460 / AmigaOne owners
- [ ] AROS installation guide — native and hosted
- [ ] MUI setup guide with recommended settings
- [ ] Directory Opus 4 vs 5 comparison
- [ ] Scalos WB replacement guide
- [ ] Ambient (OS4) customisation guide
- [ ] Icon pack recommendations with screenshot previews
- [ ] startup-sequence template — optimised for A1200 with 8MB fast RAM
- [ ] AMOS tutorial links and setup guide
- [ ] BLITZ Basic 2 guide and where to download
- [ ] VBCC cross-compiler setup (on macOS/Linux for Amiga dev)
- [ ] GCC for AmigaOS — setup on modern host
- [ ] Assembly resources — DevPac, SNASM, and modern toolchains
- [ ] Plipbox build guide — parallel port Ethernet
- [ ] X-Surf 100 setup — ISA Ethernet for big-box Amiga
- [ ] Roadshow TCP/IP stack configuration guide
- [ ] SSH on classic Amiga — AmiSSH setup
- [ ] FTP client options — AmiFTP, AmiTradeCenter
- [ ] HTTP browsing on classic Amiga — IBrowse, AWeb, Voyager

### Community Transmissions
- [ ] Amiga Bill video embed (YouTube iframe, no JS tracking, `youtube-nocookie.com`)
- [ ] Amiga Bill latest video auto-pull via YouTube RSS
- [ ] Community calendar — list of upcoming events (hand-curated, static initially)
- [ ] Discord server directory — name, focus, member count (manually updated)
- [ ] Podcast listing — Amiga-related podcast episodes with descriptions
- [ ] Newsletter directory — who's publishing, how to subscribe

---

## UI & Design

### Galactic Map
- [ ] Zoom in/out controls — `+` / `-` buttons, mouse wheel
- [ ] Station visited state — dim glow for stations you've been to
- [ ] Station active state — animated ring for current station
- [ ] Warp Gate jump animation — stars stretch to lines when departing
- [ ] Sector name hover tooltip
- [ ] Map legend panel — explains icons, station types, Warp Gates
- [ ] Mobile: full-screen map mode with touch pan/pinch-zoom
- [ ] Map screenshot export — "Save chart as PNG" button
- [ ] Map print stylesheet

### Workbench UI
- [ ] Workbench menu bar dropdowns — each nav item has a sub-menu on hover
- [ ] "About AmigaNexus" Workbench dialog — version, credits, phase
- [ ] Keyboard shortcuts — `G` for Galactic Map, `M` for audio toggle, `?` for help
- [ ] Help overlay — keyboard shortcuts listed in a Workbench requester dialog
- [ ] Amiga Workbench boot sequence — optional, toggleable easter egg on first visit
- [ ] Workbench "bouncing ball" easter egg — hidden interaction triggers Boing demo animation
- [ ] Screen mode selector — switch between Workbench 1.3 / 2.x / 3.x chrome variants
- [ ] Dark mode already is the mode — but a "high contrast" accessibility mode
- [ ] Reduced motion support — `prefers-reduced-motion` media query for all animations
- [ ] Focus ring styles — keyboard-navigable with visible focus indicators
- [ ] Skip to content link — hidden until focused, for screen reader users

### Palette Tiers (UI unlock)
- [ ] Tier 1 (OCS) — 4-colour Workbench classic: blue, orange, grey, white (default)
- [ ] Tier 2 (ECS) — expanded: adds seafoam and sky blue accents
- [ ] Tier 3 (AGA) — full: all accent colours, custom background gradient choice
- [ ] Palette preview in Mission Control before selecting
- [ ] Apply palette — CSS custom property swap, stored in preferences
- [ ] Custom background — Tier 3 unlocks: nebula colour picker (HSL within preset ranges)

### Typography
- [ ] Text size preference — three sizes apply via CSS class on `<html>`
- [ ] Monospace option — switch body text to Share Tech Mono for terminal purists
- [ ] Line height preference — comfortable / compact

---

## Performance & Technical

- [ ] Lazy-load images across all section pages
- [ ] Preload critical fonts (Orbitron, Share Tech Mono subset)
- [ ] Service worker — cache all static assets for offline reading
- [ ] Offline page — themed "OUT OF SIGNAL RANGE" page served from cache
- [ ] `manifest.json` — PWA installable, with Amiga Nexus icon
- [ ] Core Web Vitals pass — LCP < 2.5s, CLS < 0.1, FID < 100ms
- [ ] Image format — WebP with PNG fallback for any future images
- [ ] CSS minification — manual or lightweight build step pre-deploy
- [ ] JS minification — same
- [ ] HTTP/2 confirm on Apache
- [ ] Gzip/Brotli compression confirm on Apache
- [ ] Cache-Control headers — long cache for hashed assets, no-cache for HTML
- [ ] Security headers — CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy
- [ ] HSTS header — enforce HTTPS
- [ ] Subresource integrity — SRI hashes on Google Fonts `<link>`
- [ ] `preconnect` to Supabase origin once backend is live

---

## SEO & Discoverability

- [ ] `sitemap.xml` — all 12 pages (index, map, 10 sections)
- [ ] `robots.txt` — allow all, point to sitemap
- [ ] OG meta tags on all pages — title, description, image, type
- [ ] Twitter card meta tags
- [ ] Structured data — `WebSite` JSON-LD on index, `Article` on Signal Tower posts
- [ ] Canonical URL on every page
- [ ] Descriptive `alt` on all images and SVG elements
- [ ] Page titles reviewed — all unique and descriptive
- [ ] Meta descriptions reviewed — all 12 pages have unique descriptions
- [ ] Google Search Console submission
- [ ] Bing Webmaster submission

---

## Admin & Analytics

- [ ] Admin dashboard — Workbench-styled, protected route
- [ ] Admin: post new Signal Tower news entries
- [ ] Admin: manage discoverable items (add, edit, retire)
- [ ] Admin: view discovery stats — how many users found each item
- [ ] Admin: moderation queue for Transmission Board and Warp submissions
- [ ] Admin: user list — NexusID, clearance, join date, last seen
- [ ] Admin: manually upgrade user clearance
- [ ] Admin: send NEXUS BROADCAST to all users
- [ ] Admin: ban/suspend user
- [ ] Analytics: privacy-first, self-hosted (Umami or Plausible on same VPS)
- [ ] Analytics: page views per station
- [ ] Analytics: most-initiated Warp destinations
- [ ] Analytics: discovery rate per item
- [ ] Analytics: clearance level distribution
- [ ] Analytics: daily active users, weekly retention

---

## Future / Speculative (Parking Lot)

- [ ] Amiga game library browser — searchable, filterable, with cover art
- [ ] Game compatibility matrix — which games run on which hardware configs
- [ ] ROM/disk browser — ADF, LHA, DMS format info and metadata display
- [ ] Spacepack item trading — crew-to-crew item gifting
- [ ] Collaborative Log Book entries — crew logs visible to all with FULL interaction mode
- [ ] Live BBS terminal — Telnet-accessible within the Lounge (WebSocket → Telnet proxy)
- [ ] Amiga MOD tracker embedded player with custom playlist builder
- [ ] Full hardware compatibility matrix — what accelerator works with what
- [ ] Repair guides with full capacitor lists per model
- [ ] 3D Galactic Map — Three.js / WebGL opt-in mode
- [ ] Amiga Nexus CLI — a real terminal interface accessible via SSH (`nexus@amiganexus.com`)
- [ ] WHO command accessible to non-logged-in users (shows NPC crew only)
- [ ] Leaderboard — top discoverers, most transmissions submitted
- [ ] Amiga Nexus app — PWA installable with push notifications for new Signal Tower posts
- [ ] Amiga emulator embedded in-page — WebAssembly UAE instance, runs curated demo
- [ ] "Run in your browser" — one-click UAE + pre-loaded disk image for landmark demos
- [ ] Amiga pixel art creator — in-browser 32-colour art tool constrained to OCS palette
- [ ] Chipset palette visualiser — interactive OCS/ECS/AGA palette display
- [ ] HAM mode explainer — interactive: shows how HAM encoding works pixel by pixel
- [ ] Copper list visualiser — see what a copper list does interactively
- [ ] Blitter explainer — interactive diagram of the blitter chip's operation
- [ ] Paula audio visualiser — frequency/channel breakdown of a .MOD track
- [ ] Amiga boot sequence emulation — browser-rendered Kickstart / Workbench boot animation
- [ ] Amiga Guru Meditation generator — enter any error code, get styled Guru Meditation screen
- [ ] Workbench Prefs panel — actual preference editing within the Nexus UI
- [ ] Amiga BASIC in-browser — simple BASIC interpreter, OCS colour output
- [ ] Community-contributed lore — crew members can write station lore entries
- [ ] NexusID QR code — generate a printable card with your NexusID and Clearance
- [ ] Amiga Nexus Discord bot — bot posts Signal Tower updates to a Discord server
- [ ] Amiga Nexus Mastodon account — auto-posts Signal Tower news
- [ ] Amiga Nexus newsletter — monthly digest of Signal Tower posts via Resend
- [ ] Merch — Amiga Nexus patches, stickers, prints (Printful or similar)
- [ ] "Vintage hardware wall" — user-submitted photos of their Amiga setups (moderated gallery)
- [ ] Live hardware auctions — eBay API integration showing active Amiga auctions in Warp Terminal
- [ ] Amiga price alert — subscribe to be notified when a specific model appears under a price threshold
- [ ] Crowdsourced repair log — community-maintained capacitor replacement records per serial number range
- [ ] Amiga clock demo — browser-rendered Workbench clock, accurate to the real Amiga display
- [ ] Nexus time zone — "Station time" displayed as UTC but rendered in Amiga font
- [ ] Cross-Nexus scavenger hunt — clues hidden across Nexus AND Commodore Caverns
- [ ] Annual Amiga Nexus Day — special event page, exclusive Spacepack item, once per year
