/* ============================================================
   AMIGA NEXUS — Nexus Protocol
   Turn-based sector control strategy game.
   Factions: OCS Command · AGA Imperium · FPGA Collective
   ============================================================ */
(function () {
  'use strict';

  // ── DATA TABLES ──────────────────────────────────────────

  const SECTORS = {
    jminer:   { name: 'Jay Miner Reach',   short: 'JAY MINER',  signal: 2, compute: 1, defence: 1, x: 320, y: 90  },
    boing:    { name: 'Boing Sector',       short: 'BOING',      signal: 4, compute: 2, defence: 2, x: 310, y: 230 },
    lorraine: { name: 'Lorraine Cluster',  short: 'LORRAINE',   signal: 3, compute: 1, defence: 3, x: 120, y: 320 },
    aga:      { name: 'AGA Nebula',        short: 'AGA NEBULA', signal: 3, compute: 3, defence: 2, x: 510, y: 200 },
    deep:     { name: 'Deep Orbit Zone',   short: 'DEEP ORBIT', signal: 1, compute: 0, defence: 1, x: 330, y: 380 },
  };

  const ADJACENCY = {
    jminer:   ['boing', 'lorraine', 'aga'],
    boing:    ['jminer', 'lorraine', 'aga', 'deep'],
    lorraine: ['jminer', 'boing', 'deep'],
    aga:      ['jminer', 'boing', 'deep'],
    deep:     ['boing', 'lorraine', 'aga'],
  };

  const UNITS = {
    scout:   { name: 'Scout',          cost: 1, atk: 1, def: 1, speed: 2, desc: 'Fast — moves 2 sectors' },
    fighter: { name: 'Fighter',        cost: 2, atk: 2, def: 1, speed: 1, desc: 'Reliable all-rounder' },
    cruiser: { name: 'Cruiser',        cost: 4, atk: 3, def: 3, speed: 1, desc: 'Heavy frontline unit' },
    carrier: { name: 'Carrier',        cost: 6, atk: 2, def: 4, speed: 1, desc: 'Deploys 2 fighters on arrival' },
    jammer:  { name: 'Signal Jammer',  cost: 3, atk: 0, def: 0, speed: 1, desc: 'Cuts enemy signal from 1 sector' },
  };

  const FACTION_UNITS = {
    ocs:  { copper_shield: { name: 'Copper Shield',  cost: 3, atk: 1, def: 4, speed: 1, desc: 'Doubles sector defence' } },
    aga:  { blitter_cannon: { name: 'Blitter Cannon', cost: 5, atk: 5, def: 1, speed: 1, desc: 'Area attack — hits all enemies' } },
    fpga: { adaptive_core: { name: 'Adaptive Core',  cost: 3, atk: 2, def: 2, speed: 2, desc: 'Copies strongest enemy unit' } },
  };

  const FACTIONS = {
    ocs:  {
      name: 'OCS Command',
      tagline: 'Classic chipset. Balanced, reliable, zero weaknesses.',
      color: '#5ECBAA', border: 'rgba(94,203,170,0.6)',
      startBonus: { signal: 2 }, // starts with extra signal
    },
    aga:  {
      name: 'AGA Imperium',
      tagline: 'Maximum firepower. High risk, devastating payoff.',
      color: '#FFD166', border: 'rgba(255,209,102,0.6)',
      startBonus: { units: [{ type: 'fighter', sectorKey: null }] }, // extra fighter
    },
    fpga: {
      name: 'FPGA Collective',
      tagline: 'Adaptive swarm. Fast deployment, evolves mid-game.',
      color: '#68B4D4', border: 'rgba(104,180,212,0.6)',
      startBonus: { units: [{ type: 'scout', sectorKey: null }, { type: 'scout', sectorKey: null }] },
    },
  };

  const EVENTS = [
    { id: 'supply_drop',     text: 'SUPPLY DROP — Emergency signal cache discovered. +3 signal.',       effect: (s) => { s.playerSignal += 3; } },
    { id: 'static_burst',   text: 'STATIC BURST — All jammers offline this turn.',                    effect: (s) => { s.jammerSuppressed = true; } },
    { id: 'reinforcements', text: 'REINFORCEMENTS — Reserve scouts answer the call. Gain 2 Scouts in HQ.', effect: (s) => { addUnitsToSector(s, 'player', s.playerHQ, [{type:'scout'},{type:'scout'}]); } },
    { id: 'compute_surge',  text: 'COMPUTE SURGE — Processing capacity peaks. Build cost -1 this turn (min 1).', effect: (s) => { s.buildDiscount = 1; } },
    { id: 'anomaly',        text: 'SECTOR ANOMALY — Gravity fluctuation. All unit movement +1 sector this turn.', effect: (s) => { s.speedBoost = 1; } },
    { id: 'pirate_raid',    text: 'PIRATE RAID — Deep Orbit pirates strike. Sector DEEP ORBIT loses 1 random unit.', effect: (s) => { raidSector(s, 'deep'); } },
    { id: 'signal_storm',   text: 'SIGNAL STORM — Communication disrupted. No signal collected from 1 random sector.', effect: (s) => { s.blockedSector = randomKey(Object.keys(SECTORS)); } },
    { id: 'ai_intel',       text: 'INTELLIGENCE REPORT — Enemy movements detected. AI skips move phase.',             effect: (s) => { s.aiSkipMove = true; } },
    { id: 'all_quiet',      text: 'ALL QUIET — No anomalies detected. Sector status nominal.',                        effect: () => {} },
    { id: 'tech_cache',     text: 'TECH CACHE — Salvaged computing cores found. +2 compute cycles.',                  effect: (s) => { s.playerSignal += 2; } },
  ];

  // ── STATE ────────────────────────────────────────────────

  let G = null; // global game state

  function newGame(faction) {
    const playerStart = 'jminer';
    const aiStart     = 'aga';

    G = {
      turn:          1,
      maxTurns:      20,
      phase:         'collect',  // collect|build|move|ai|event|win
      playerFaction: faction,
      playerHQ:      playerStart,
      aiHQ:          aiStart,
      playerSignal:  4,
      aiSignal:      4,
      // Sector control: 'player'|'ai'|'neutral'
      control: {
        jminer:   'player',
        boing:    'neutral',
        lorraine: 'neutral',
        aga:      'ai',
        deep:     'neutral',
      },
      // Units per sector per side
      units: {
        jminer:   { player: [{ type: 'scout' }],   ai: [] },
        boing:    { player: [],                     ai: [] },
        lorraine: { player: [],                     ai: [] },
        aga:      { player: [],                     ai: [{ type: 'scout' }] },
        deep:     { player: [],                     ai: [] },
      },
      // Jammers active this turn (sectorKey → side)
      jammers: {},
      // Turn-scoped flags (reset each turn)
      jammerSuppressed: false,
      buildDiscount:    0,
      speedBoost:       0,
      blockedSector:    null,
      aiSkipMove:       false,
      // UI state
      selectedSector:   null,
      moveSrc:          null,
      moveUnits:        [],
      log:              [],
      winReason:        null,
      lastEvent:        null,
    };

    // Faction bonuses
    const bonus = FACTIONS[faction].startBonus;
    if (bonus.signal) G.playerSignal += bonus.signal;
    if (bonus.units)  bonus.units.forEach(u => addUnitsToSector(G, 'player', playerStart, [{ type: u.type }]));

    log('NEXUS PROTOCOL INITIATED — FACTION: ' + FACTIONS[faction].name.toUpperCase());
    log('Sector ' + SECTORS[playerStart].name + ' designated as your HQ.');
    log('Turn 1 begins. Collecting signal from controlled sectors...');

    collectPhase();
  }

  // ── PHASE LOGIC ──────────────────────────────────────────

  function collectPhase() {
    G.phase           = 'collect';
    G.jammerSuppressed = false;
    G.buildDiscount    = 0;
    G.speedBoost       = 0;
    G.blockedSector    = null;
    G.aiSkipMove       = false;
    G.jammers          = {};

    // Collect player signal
    let earned = 0;
    Object.keys(SECTORS).forEach(key => {
      if (G.control[key] === 'player' && key !== G.blockedSector) {
        earned += SECTORS[key].signal;
      }
    });
    G.playerSignal += earned;
    log('Collected ' + earned + ' signal. Total: ' + G.playerSignal + '. Phase: BUILD.');
    G.phase = 'build';
    render();
  }

  function endBuildPhase() {
    G.phase = 'move';
    G.moveSrc   = null;
    G.moveUnits = [];
    log('Build phase complete. Select units to move, or advance turn.');
    render();
  }

  function endMovePhase() {
    // Resolve combat in all contested sectors
    let combatOccurred = false;
    Object.keys(SECTORS).forEach(key => {
      const sec = G.units[key];
      if (sec.player.length > 0 && sec.ai.length > 0) {
        combatOccurred = true;
        resolveCombat(key);
      }
    });
    if (!combatOccurred) log('No combat this turn.');

    // Draw event
    G.lastEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    G.lastEvent.effect(G);
    log('EVENT: ' + G.lastEvent.text);

    // Check win before AI
    if (checkVictory()) return;

    // AI turn
    aiTurn();

    // Check win after AI
    if (checkVictory()) return;

    // Next turn
    G.turn++;
    if (G.turn > G.maxTurns) {
      strategicVictory();
      return;
    }

    log('--- Turn ' + G.turn + ' ---');
    collectPhase();
  }

  // ── COMBAT ───────────────────────────────────────────────

  function totalStrength(units) {
    return units.reduce((sum, u) => {
      const ut = UNITS[u.type] || FACTION_UNITS.ocs[u.type] || FACTION_UNITS.aga[u.type] || FACTION_UNITS.fpga[u.type] || { atk: 0, def: 0 };
      return sum + ut.atk;
    }, 0);
  }

  function totalDefence(units, sectorKey) {
    const sec     = SECTORS[sectorKey];
    const baseAtk = units.reduce((s, u) => {
      const ut = allUnits()[u.type] || { def: 0 };
      return s + ut.def;
    }, 0);
    return baseAtk + sec.defence;
  }

  function resolveCombat(sectorKey) {
    const sec = G.units[sectorKey];
    const pStr = totalStrength(sec.player) + rollD6();
    const aStr = totalStrength(sec.ai)     + rollD6();

    if (pStr >= aStr) {
      // Player wins
      const losses = Math.max(1, Math.floor(sec.player.length * 0.3));
      const aiLoss = Math.ceil(sec.ai.length * 0.6);
      sec.player = sec.player.slice(0, Math.max(0, sec.player.length - losses));
      sec.ai     = [];
      G.control[sectorKey] = sec.player.length > 0 ? 'player' : 'neutral';
      log('COMBAT at ' + SECTORS[sectorKey].short + ': PLAYER wins! AI forces routed. Losses: ' + losses + ' unit(s).');
    } else {
      // AI wins
      const aiLoss = Math.max(1, Math.floor(sec.ai.length * 0.3));
      sec.player   = [];
      sec.ai       = sec.ai.slice(0, Math.max(0, sec.ai.length - aiLoss));
      G.control[sectorKey] = sec.ai.length > 0 ? 'ai' : 'neutral';
      log('COMBAT at ' + SECTORS[sectorKey].short + ': AI wins. Your forces expelled. AI losses: ' + aiLoss + '.');
    }
  }

  // ── AI ───────────────────────────────────────────────────

  function aiCollect() {
    let earned = 0;
    Object.keys(SECTORS).forEach(key => {
      if (G.control[key] === 'ai') earned += SECTORS[key].signal;
    });
    G.aiSignal += earned;
  }

  function aiBuild() {
    // Simple: build a fighter in the sector with most AI units
    let bestSector = null;
    let bestCount  = -1;
    Object.keys(SECTORS).forEach(key => {
      if (G.control[key] === 'ai' && G.units[key].ai.length >= bestCount) {
        bestCount = G.units[key].ai.length;
        bestSector = key;
      }
    });
    if (!bestSector) return;

    while (G.aiSignal >= 2) {
      const type = G.aiSignal >= 4 ? 'fighter' : 'scout';
      G.units[bestSector].ai.push({ type });
      G.aiSignal -= UNITS[type].cost;
    }
  }

  function aiMove() {
    if (G.aiSkipMove) { log('AI move suppressed by event.'); return; }

    // Strategy: expand to adjacent neutral sectors; attack if stronger
    Object.keys(SECTORS).forEach(srcKey => {
      if (G.control[srcKey] !== 'ai') return;
      if (G.units[srcKey].ai.length < 2) return; // keep at least 1 home

      const adj = ADJACENCY[srcKey];
      // Priority: neutral first, then player
      const targets = [
        ...adj.filter(k => G.control[k] === 'neutral'),
        ...adj.filter(k => G.control[k] === 'player'),
      ];
      if (targets.length === 0) return;

      const target = targets[0];
      const send   = G.units[srcKey].ai.splice(1); // leave 1 behind
      G.units[target].ai.push(...send);
      if (G.control[target] === 'neutral') G.control[target] = 'ai';
    });

    // Resolve combat after AI move
    Object.keys(SECTORS).forEach(key => {
      if (G.units[key].player.length > 0 && G.units[key].ai.length > 0) {
        resolveCombat(key);
      }
    });
  }

  function aiTurn() {
    aiCollect();
    aiBuild();
    aiMove();

    // Reclaim neutral sectors where AI units moved but control not updated
    Object.keys(SECTORS).forEach(key => {
      if (G.units[key].ai.length > 0 && G.control[key] === 'neutral') {
        G.control[key] = 'ai';
      }
      if (G.units[key].player.length > 0 && G.control[key] === 'neutral') {
        G.control[key] = 'player';
      }
    });
  }

  // ── VICTORY CHECK ────────────────────────────────────────

  function checkVictory() {
    const playerSectors = Object.keys(SECTORS).filter(k => G.control[k] === 'player');
    const aiSectors     = Object.keys(SECTORS).filter(k => G.control[k] === 'ai');

    if (playerSectors.length >= 4) {
      victory('SECTOR DOMINANCE — You control ' + playerSectors.length + ' of 5 sectors. The Nexus bows to your command.');
      return true;
    }
    if (aiSectors.length >= 4) {
      defeat('The enemy controls ' + aiSectors.length + ' sectors. Strategic position is untenable.');
      return true;
    }
    if (G.control[G.aiHQ] === 'player') {
      victory('DECISIVE STRIKE — Enemy HQ at ' + SECTORS[G.aiHQ].name + ' has fallen. War is over.');
      return true;
    }
    if (G.control[G.playerHQ] === 'ai') {
      defeat('Your HQ at ' + SECTORS[G.playerHQ].name + ' has been captured. Mission failed.');
      return true;
    }
    return false;
  }

  function strategicVictory() {
    const pCount = Object.keys(SECTORS).filter(k => G.control[k] === 'player').length;
    const aCount = Object.keys(SECTORS).filter(k => G.control[k] === 'ai').length;
    if (pCount > aCount) {
      victory('STRATEGIC VICTORY — After 20 turns you hold ' + pCount + ' sectors to the enemy\'s ' + aCount + '.');
    } else if (aCount > pCount) {
      defeat('Time expired. Enemy holds ' + aCount + ' sectors to your ' + pCount + '. Strategic failure.');
    } else {
      victory('STALEMATE — Equal sectors after 20 turns. A costly draw — survival counts.');
    }
  }

  function victory(reason) {
    G.phase     = 'win';
    G.winReason = reason;
    G.won       = true;
    render();
  }

  function defeat(reason) {
    G.phase     = 'win';
    G.winReason = reason;
    G.won       = false;
    render();
  }

  // ── PLAYER ACTIONS ───────────────────────────────────────

  function playerBuild(type) {
    if (G.phase !== 'build') return;
    const ut   = allUnits()[type];
    if (!ut) return;
    const cost = Math.max(1, ut.cost - (G.buildDiscount || 0));
    if (G.playerSignal < cost) { log('Insufficient signal to build ' + ut.name + '.'); return; }
    if (!G.selectedSector || G.control[G.selectedSector] !== 'player') {
      log('Select a sector you control to build units.'); return;
    }
    G.playerSignal -= cost;
    G.units[G.selectedSector].player.push({ type });
    log('Built ' + ut.name + ' at ' + SECTORS[G.selectedSector].short + '. Signal remaining: ' + G.playerSignal + '.');

    // Carrier deploys 2 fighters on arrival (handle at build time for simplicity)
    if (type === 'carrier') {
      G.units[G.selectedSector].player.push({ type: 'fighter' });
      G.units[G.selectedSector].player.push({ type: 'fighter' });
      log('Carrier deployed 2 Fighters.');
    }
    render();
  }

  function playerSelectSector(key) {
    if (G.phase === 'move' && G.moveSrc === null && G.control[key] === 'player') {
      G.moveSrc   = key;
      G.moveUnits = [...G.units[key].player];
      log('Select destination for units from ' + SECTORS[key].short + '.');
    } else if (G.phase === 'move' && G.moveSrc !== null) {
      if (key === G.moveSrc) {
        G.moveSrc = null; G.moveUnits = [];
        log('Move cancelled.');
      } else if (ADJACENCY[G.moveSrc].includes(key)) {
        executeMove(G.moveSrc, key, G.moveUnits);
        G.moveSrc = null; G.moveUnits = [];
      } else {
        log(SECTORS[key].short + ' is not adjacent to ' + SECTORS[G.moveSrc].short + '.');
      }
    } else {
      G.selectedSector = key;
    }
    render();
  }

  function executeMove(src, dest, units) {
    if (units.length === 0) { log('No units to move.'); return; }

    const speedBoost = G.speedBoost || 0;
    // Speed 2 units can move 2 sectors (for now: allow if ≥1 adj link)
    G.units[src].player = G.units[src].player.filter(u => !units.includes(u));
    G.units[dest].player.push(...units);

    // Update control
    if (G.units[src].player.length === 0 && G.units[src].ai.length === 0) {
      // keep existing controller
    }
    if (G.control[dest] === 'neutral') G.control[dest] = 'player';

    const uNames = [...new Set(units.map(u => allUnits()[u.type].name))].join(', ');
    log('Moved ' + units.length + ' unit(s) (' + uNames + ') from ' + SECTORS[src].short + ' → ' + SECTORS[dest].short + '.');
  }

  // ── HELPERS ──────────────────────────────────────────────

  function allUnits() {
    const base = { ...UNITS };
    if (G) Object.assign(base, FACTION_UNITS[G.playerFaction] || {});
    return base;
  }

  function addUnitsToSector(state, side, sectorKey, units) {
    units.forEach(u => state.units[sectorKey][side].push({ type: u.type }));
  }

  function raidSector(state, sectorKey) {
    const sec = state.units[sectorKey];
    if (sec.player.length > 0) sec.player.pop();
    else if (sec.ai.length > 0) sec.ai.pop();
  }

  function rollD6() { return Math.ceil(Math.random() * 6); }
  function randomKey(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function log(msg) {
    if (!G) return;
    G.log.unshift(msg);
    if (G.log.length > 40) G.log.pop();
  }

  // ── RENDER ───────────────────────────────────────────────

  const OWNER_COLORS = {
    player:  '#5ECBAA',
    ai:      '#FF5E5B',
    neutral: '#555577',
  };

  function render() {
    if (!G) return;
    renderHUD();
    renderMap();
    renderSidePanel();
    renderLog();
    if (G.phase === 'win') renderWinScreen();
    else document.getElementById('np-win-screen').style.display = 'none';
  }

  function renderHUD() {
    const fac = FACTIONS[G.playerFaction];
    setText('np-turn-label',   'TURN ' + G.turn + ' / ' + G.maxTurns);
    setText('np-phase-label',  G.phase.toUpperCase());
    setText('np-signal-label', G.playerSignal + ' SIG');
    setText('np-faction-label', fac.name.toUpperCase());

    const phaseBtn = document.getElementById('np-phase-btn');
    if (phaseBtn) {
      if (G.phase === 'build') { phaseBtn.textContent = 'END BUILD ›'; phaseBtn.disabled = false; }
      else if (G.phase === 'move') { phaseBtn.textContent = 'END TURN ›'; phaseBtn.disabled = false; }
      else { phaseBtn.textContent = G.phase.toUpperCase(); phaseBtn.disabled = true; }
    }
    setText('np-statusbar-left', 'Signal: ' + G.playerSignal + '  |  Turn: ' + G.turn + ' / ' + G.maxTurns);
    setText('np-statusbar-right', 'Phase: ' + G.phase.toUpperCase() + (G.selectedSector ? '  |  Selected: ' + SECTORS[G.selectedSector].short : ''));
  }

  function renderMap() {
    const svg = document.getElementById('np-map-svg');
    if (!svg) return;

    // Update sector nodes
    Object.keys(SECTORS).forEach(key => {
      const node    = svg.querySelector('[data-sector="' + key + '"]');
      if (!node) return;
      const owner   = G.control[key];
      const color   = OWNER_COLORS[owner];
      const pUnits  = G.units[key].player.length;
      const aUnits  = G.units[key].ai.length;
      const isHQ    = key === G.playerHQ || key === G.aiHQ;
      const isSel   = G.selectedSector === key;
      const isMvSrc = G.moveSrc === key;
      const isAdj   = G.moveSrc && ADJACENCY[G.moveSrc].includes(key);

      const circle = node.querySelector('circle.sector-node');
      if (circle) {
        circle.style.stroke     = isMvSrc ? '#FFD166' : isSel ? '#FFFFFF' : color;
        circle.style.strokeWidth = (isSel || isMvSrc) ? '3' : '2';
        circle.style.fill       = owner === 'neutral' ? 'rgba(10,14,26,0.9)' : (owner === 'player' ? 'rgba(94,203,170,0.15)' : 'rgba(255,94,91,0.15)');
      }

      // Adjacent highlight in move phase
      const adjCircle = node.querySelector('circle.adj-ring');
      if (adjCircle) adjCircle.style.opacity = (G.phase === 'move' && isAdj) ? '0.8' : '0';

      const unitText = node.querySelector('text.unit-count');
      if (unitText) {
        const total = pUnits + aUnits;
        unitText.textContent  = total > 0 ? total : '';
        unitText.style.fill   = pUnits > aUnits ? '#5ECBAA' : (aUnits > 0 ? '#FF5E5B' : '#AAA');
      }

      const ownerDot = node.querySelector('circle.owner-dot');
      if (ownerDot) { ownerDot.style.fill = color; ownerDot.style.stroke = color; }
    });
  }

  function renderSidePanel() {
    const panel = document.getElementById('np-side-panel');
    if (!panel) return;

    if (!G.selectedSector) {
      panel.innerHTML = '<div class="np-panel-hint">Click a sector on the map to inspect it.</div>';
      return;
    }

    const key   = G.selectedSector;
    const sec   = SECTORS[key];
    const owner = G.control[key];
    const pU    = G.units[key].player;
    const aU    = G.units[key].ai;

    let html = '<div class="np-panel-section-name">' + sec.name + '</div>';
    html += '<div class="np-panel-meta">';
    html += '<span class="np-tag" style="color:' + OWNER_COLORS[owner] + '">' + owner.toUpperCase() + '</span> ';
    html += '<span class="np-tag">SIG +' + sec.signal + '</span> ';
    html += '<span class="np-tag">DEF ' + sec.defence + '</span>';
    if (key === G.playerHQ) html += ' <span class="np-tag np-tag-orange">YOUR HQ</span>';
    if (key === G.aiHQ)     html += ' <span class="np-tag np-tag-red">ENEMY HQ</span>';
    html += '</div>';

    html += '<div class="np-panel-label">YOUR FORCES (' + pU.length + ')</div>';
    if (pU.length === 0) {
      html += '<div class="np-panel-empty">— None —</div>';
    } else {
      const grouped = groupUnits(pU);
      html += '<div class="np-unit-list">';
      Object.keys(grouped).forEach(type => {
        const ut = allUnits()[type] || {};
        html += '<div class="np-unit-row"><span class="np-unit-count">' + grouped[type] + 'x</span>';
        html += '<span class="np-unit-name">' + (ut.name || type) + '</span>';
        html += '<span class="np-unit-stats">ATK ' + (ut.atk || 0) + ' DEF ' + (ut.def || 0) + '</span></div>';
      });
      html += '</div>';
    }

    html += '<div class="np-panel-label">ENEMY FORCES (' + aU.length + ')</div>';
    if (aU.length === 0) {
      html += '<div class="np-panel-empty">— None —</div>';
    } else {
      const grouped = groupUnits(aU);
      html += '<div class="np-unit-list np-unit-list-enemy">';
      Object.keys(grouped).forEach(type => {
        const ut = UNITS[type] || {};
        html += '<div class="np-unit-row"><span class="np-unit-count">' + grouped[type] + 'x</span>';
        html += '<span class="np-unit-name">' + (ut.name || type) + '</span>';
        html += '<span class="np-unit-stats">ATK ' + (ut.atk || 0) + ' DEF ' + (ut.def || 0) + '</span></div>';
      });
      html += '</div>';
    }

    // Build panel (only in build phase, player-owned sector)
    if (G.phase === 'build' && owner === 'player') {
      html += '<div class="np-panel-label">BUILD UNITS</div>';
      html += '<div class="np-build-list">';
      Object.keys(allUnits()).forEach(type => {
        const ut   = allUnits()[type];
        const cost = Math.max(1, ut.cost - (G.buildDiscount || 0));
        const can  = G.playerSignal >= cost;
        html += '<div class="np-build-row' + (can ? '' : ' np-build-disabled') + '">';
        html += '<span class="np-build-name">' + ut.name + '</span>';
        html += '<span class="np-build-cost">' + cost + ' sig</span>';
        html += '<button class="np-build-btn" onclick="NexusProtocol.build(\'' + type + '\')" ' + (can ? '' : 'disabled') + '>BUILD</button>';
        html += '</div>';
      });
      html += '</div>';
    }

    // Move instructions
    if (G.phase === 'move' && owner === 'player' && pU.length > 0) {
      if (G.moveSrc === key) {
        html += '<div class="np-panel-hint np-panel-hint-active">Select adjacent sector to move ' + pU.length + ' unit(s) there. Click here to cancel.</div>';
      } else {
        html += '<div class="np-panel-hint">Click again to select as move source, then pick destination.</div>';
      }
    }

    panel.innerHTML = html;
  }

  function renderLog() {
    const el = document.getElementById('np-log');
    if (!el || !G) return;
    el.innerHTML = G.log.slice(0, 12).map(l => '<div class="np-log-line">› ' + l + '</div>').join('');
  }

  function renderWinScreen() {
    const el = document.getElementById('np-win-screen');
    if (!el) return;
    el.style.display = 'flex';
    const fac = FACTIONS[G.playerFaction];
    el.innerHTML =
      '<div class="np-win-box">' +
      '<div class="np-win-title">' + (G.won ? 'VICTORY' : 'DEFEAT') + '</div>' +
      '<div class="np-win-faction">' + fac.name.toUpperCase() + '</div>' +
      '<div class="np-win-reason">' + G.winReason + '</div>' +
      '<div class="np-win-stats">Turn ' + G.turn + ' / ' + G.maxTurns + ' &nbsp;|&nbsp; Signal: ' + G.playerSignal + '</div>' +
      '<button class="np-win-btn" onclick="NexusProtocol.restart()">PLAY AGAIN</button>' +
      '</div>';
  }

  function groupUnits(units) {
    const g = {};
    units.forEach(u => { g[u.type] = (g[u.type] || 0) + 1; });
    return g;
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ── PUBLIC API ───────────────────────────────────────────

  window.NexusProtocol = {
    start:   function (faction) { newGame(faction); showGame(); },
    build:   function (type)    { playerBuild(type); },
    select:  function (key)     { playerSelectSector(key); },
    endPhase: function () {
      if (G.phase === 'build') endBuildPhase();
      else if (G.phase === 'move') endMovePhase();
    },
    restart: function () {
      document.getElementById('np-game').style.display     = 'none';
      document.getElementById('np-faction-select').style.display = 'flex';
    },
  };

  function showGame() {
    document.getElementById('np-faction-select').style.display = 'none';
    document.getElementById('np-game').style.display           = 'block';
    render();
  }

})();
