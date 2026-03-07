/* ─────────────────────────────────────────────────────────────────
   Amiga Nexus — The Spacepack
   Personal identity + inventory + preferences panel.
   Self-contained: injects HTML + CSS, persists to localStorage.
   Mirrors the Commodore Caverns Satchel — shared C=ID system.
───────────────────────────────────────────────────────────────── */
(function () {
  var KEY   = 'an_spacepack';
  var SIZES = { sm: '13px', md: '15px', lg: '17px', xl: '20px' };

  function load()  { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(p) { localStorage.setItem(KEY, JSON.stringify(p)); }

  /* Apply text size before paint */
  function applySize(id) {
    document.documentElement.style.fontSize = SIZES[id] || SIZES.md;
  }
  applySize(load().textSize || 'md');

  /* ── Styles ─────────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = [

    /* Toggle button */
    '#an-pack-btn {',
    '  position: fixed;',
    '  bottom: 1.25rem;',
    '  right: 1.25rem;',
    '  z-index: 900;',
    '  width: 2.6rem;',
    '  height: 2.6rem;',
    '  border-radius: 0;',
    '  border: 1px solid rgba(94,203,170,0.35);',
    '  background: rgba(6,8,16,0.92);',
    '  color: rgba(94,203,170,0.65);',
    '  font-family: "Orbitron", sans-serif;',
    '  font-size: 0.55rem;',
    '  font-weight: 700;',
    '  letter-spacing: 0.05em;',
    '  cursor: pointer;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  box-shadow: 0 2px 14px rgba(0,0,0,0.7), 0 0 8px rgba(94,203,170,0.06);',
    '  transition: color 0.2s, border-color 0.2s, box-shadow 0.2s;',
    '  backdrop-filter: blur(6px);',
    '}',
    '#an-pack-btn:hover {',
    '  color: #5ECBAA;',
    '  border-color: rgba(94,203,170,0.7);',
    '  box-shadow: 0 0 14px rgba(94,203,170,0.2), 0 2px 14px rgba(0,0,0,0.7);',
    '}',
    '#an-pack-btn.open {',
    '  color: #5ECBAA;',
    '  border-color: rgba(94,203,170,0.8);',
    '  background: rgba(0,55,120,0.5);',
    '}',

    /* Panel */
    '#an-pack-panel {',
    '  position: fixed;',
    '  bottom: 4.5rem;',
    '  right: 1.25rem;',
    '  z-index: 899;',
    '  width: 280px;',
    '  border: 1px solid rgba(94,203,170,0.3);',
    '  border-top: 3px solid #5ECBAA;',
    '  box-shadow: 0 16px 56px rgba(0,0,0,0.8), 0 0 20px rgba(94,203,170,0.07);',
    '  overflow: hidden;',
    '  transform: translateY(12px) scale(0.96);',
    '  opacity: 0;',
    '  pointer-events: none;',
    '  transition: transform 0.22s cubic-bezier(0.22,1,0.36,1), opacity 0.16s ease;',
    '}',
    '#an-pack-panel.open {',
    '  transform: translateY(0) scale(1);',
    '  opacity: 1;',
    '  pointer-events: all;',
    '}',

    /* Panel header — Workbench titlebar style */
    '.an-pack-hdr {',
    '  background: #0055AA;',
    '  padding: 0 10px;',
    '  height: 28px;',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 6px;',
    '}',
    '.an-pack-hdr-gadget {',
    '  width: 16px; height: 16px;',
    '  border: 2px solid #AAAAAA;',
    '  background: #AAAAAA;',
    '  flex-shrink: 0;',
    '}',
    '.an-pack-hdr-title {',
    '  font-family: "Orbitron", sans-serif;',
    '  font-size: 0.6rem;',
    '  font-weight: 700;',
    '  color: #fff;',
    '  letter-spacing: 0.15em;',
    '  flex: 1;',
    '  text-align: center;',
    '}',
    '.an-pack-hdr-tip {',
    '  position: relative;',
    '  display: flex;',
    '  align-items: center;',
    '  flex-shrink: 0;',
    '}',
    '.an-pack-hdr-tip-icon {',
    '  width: 1rem; height: 1rem;',
    '  border-radius: 50%;',
    '  border: 1px solid rgba(255,255,255,0.3);',
    '  color: rgba(255,255,255,0.4);',
    '  font-size: 0.5rem;',
    '  font-weight: 700;',
    '  font-family: "Share Tech Mono", monospace;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  cursor: default;',
    '  transition: color 0.2s, border-color 0.2s;',
    '}',
    '.an-pack-hdr-tip:hover .an-pack-hdr-tip-icon {',
    '  color: rgba(255,255,255,0.85);',
    '  border-color: rgba(255,255,255,0.6);',
    '}',
    '.an-pack-tip-text {',
    '  position: absolute;',
    '  bottom: calc(100% + 0.5rem);',
    '  right: 0;',
    '  width: 210px;',
    '  background: rgba(6,8,16,0.97);',
    '  border: 1px solid rgba(94,203,170,0.35);',
    '  padding: 0.6rem 0.75rem;',
    '  font-family: "Aldrich", sans-serif;',
    '  font-size: 0.62rem;',
    '  font-style: italic;',
    '  line-height: 1.6;',
    '  color: #AAAAAA;',
    '  box-shadow: 0 8px 28px rgba(0,0,0,0.7);',
    '  pointer-events: none;',
    '  opacity: 0;',
    '  transform: translateY(5px);',
    '  transition: opacity 0.16s ease, transform 0.16s ease;',
    '  z-index: 10;',
    '}',
    '.an-pack-hdr-tip:hover .an-pack-tip-text {',
    '  opacity: 1;',
    '  transform: translateY(0);',
    '}',

    /* Panel body */
    '.an-pack-body {',
    '  background: #0A0E1A;',
    '}',

    /* Sections */
    '.an-pack-section {',
    '  padding: 0.7rem 0.9rem;',
    '  display: flex;',
    '  flex-direction: column;',
    '  gap: 0.6rem;',
    '}',
    '.an-pack-section + .an-pack-section {',
    '  border-top: 1px solid rgba(94,203,170,0.08);',
    '}',
    '.an-pack-section-label {',
    '  font-family: "Share Tech Mono", monospace;',
    '  font-size: 0.48rem;',
    '  font-weight: 700;',
    '  letter-spacing: 0.3em;',
    '  text-transform: uppercase;',
    '  color: rgba(94,203,170,0.45);',
    '  margin-bottom: 0.1rem;',
    '}',

    /* Locked rows */
    '.an-pack-locked {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 0.55rem;',
    '  opacity: 0.45;',
    '}',
    '.an-pack-locked-icon {',
    '  font-size: 0.95rem;',
    '  line-height: 1;',
    '  flex-shrink: 0;',
    '}',
    '.an-pack-locked-text {',
    '  font-family: "Aldrich", sans-serif;',
    '  font-size: 0.62rem;',
    '  color: #CCCCCC;',
    '  flex: 1;',
    '}',
    '.an-pack-locked-text small {',
    '  display: block;',
    '  font-family: "Share Tech Mono", monospace;',
    '  font-size: 0.5rem;',
    '  letter-spacing: 0.1em;',
    '  text-transform: uppercase;',
    '  color: rgba(170,170,170,0.55);',
    '  margin-top: 0.1rem;',
    '}',
    '.an-lock {',
    '  font-size: 0.65rem;',
    '  flex-shrink: 0;',
    '  opacity: 0.4;',
    '}',

    /* Pref rows */
    '.an-pref-row {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 0.55rem;',
    '}',
    '.an-pref-label {',
    '  font-family: "Share Tech Mono", monospace;',
    '  font-size: 0.6rem;',
    '  letter-spacing: 0.08em;',
    '  text-transform: uppercase;',
    '  color: #CCCCCC;',
    '  flex: 1;',
    '}',
    '.an-pref-label.dim { color: rgba(170,170,170,0.35); }',

    /* Toggle */
    '.an-toggle {',
    '  position: relative;',
    '  width: 2.2rem;',
    '  height: 1.15rem;',
    '  flex-shrink: 0;',
    '}',
    '.an-toggle input { position: absolute; opacity: 0; width: 0; height: 0; }',
    '.an-toggle-track {',
    '  position: absolute;',
    '  inset: 0;',
    '  background: rgba(255,255,255,0.06);',
    '  border: 1px solid rgba(255,255,255,0.1);',
    '  cursor: not-allowed;',
    '}',
    '.an-toggle-track::after {',
    '  content: "";',
    '  position: absolute;',
    '  top: 2px; left: 2px;',
    '  width: calc(1.15rem - 6px);',
    '  height: calc(1.15rem - 6px);',
    '  background: rgba(255,255,255,0.2);',
    '  transition: left 0.18s;',
    '}',

    /* Soon badge */
    '.an-soon {',
    '  font-family: "Share Tech Mono", monospace;',
    '  font-size: 0.45rem;',
    '  letter-spacing: 0.1em;',
    '  text-transform: uppercase;',
    '  color: rgba(255,136,0,0.6);',
    '  background: rgba(255,136,0,0.07);',
    '  border: 1px solid rgba(255,136,0,0.2);',
    '  padding: 0.05em 0.4em;',
    '  flex-shrink: 0;',
    '}',

    /* Text size buttons */
    '.an-sizes { display: flex; gap: 0.3rem; flex-shrink: 0; }',
    '.an-size-btn {',
    '  width: 1.75rem;',
    '  height: 1.75rem;',
    '  border: 1px solid rgba(94,203,170,0.2);',
    '  background: rgba(94,203,170,0.04);',
    '  color: rgba(94,203,170,0.4);',
    '  font-family: "Share Tech Mono", monospace;',
    '  font-size: 0.55rem;',
    '  font-weight: 700;',
    '  cursor: pointer;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  transition: background 0.15s, color 0.15s, border-color 0.15s;',
    '}',
    '.an-size-btn:hover {',
    '  background: rgba(94,203,170,0.1);',
    '  border-color: rgba(94,203,170,0.45);',
    '  color: #5ECBAA;',
    '}',
    '.an-size-btn.active {',
    '  background: rgba(94,203,170,0.14);',
    '  border-color: rgba(94,203,170,0.65);',
    '  color: #5ECBAA;',
    '  box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);',
    '}',

  ].join('\n');
  document.head.appendChild(style);

  /* ── HTML ────────────────────────────────────────────────────── */
  var wrap = document.createElement('div');
  wrap.innerHTML = [
    '<button id="an-pack-btn" aria-label="Open Spacepack" title="The Spacepack">PACK</button>',

    '<div id="an-pack-panel" aria-hidden="true" role="dialog" aria-label="The Spacepack">',

      /* Workbench titlebar */
      '<div class="an-pack-hdr">',
        '<div class="an-pack-hdr-gadget"></div>',
        '<div class="an-pack-hdr-gadget"></div>',
        '<span class="an-pack-hdr-title">THE SPACEPACK</span>',
        '<span class="an-pack-hdr-tip">',
          '<span class="an-pack-hdr-tip-icon">?</span>',
          '<span class="an-pack-tip-text">The Spacepack holds your C=ID, discovered items, and preferences. Syncs with your Commodore Universe identity across all 4 properties.</span>',
        '</span>',
      '</div>',

      '<div class="an-pack-body">',

        /* C=ID — locked */
        '<div class="an-pack-section">',
          '<div class="an-pack-section-label">Identity</div>',
          '<div class="an-pack-locked">',
            '<span class="an-pack-locked-icon">&#x1FAA6;</span>',
            '<div class="an-pack-locked-text">',
              'C=ID',
              '<small>Request clearance to unlock</small>',
            '</div>',
            '<span class="an-lock">&#x1F512;</span>',
          '</div>',
        '</div>',

        /* Spacepack items — locked */
        '<div class="an-pack-section">',
          '<div class="an-pack-section-label">Spacepack Items</div>',
          '<div class="an-pack-locked">',
            '<span class="an-pack-locked-icon">&#x2728;</span>',
            '<div class="an-pack-locked-text">',
              'No items yet',
              '<small>Explore the Nexus to find things</small>',
            '</div>',
            '<span class="an-lock">&#x1F512;</span>',
          '</div>',
        '</div>',

        /* Preferences */
        '<div class="an-pack-section">',
          '<div class="an-pack-section-label">Preferences &nbsp;&middot;&nbsp; <span style="letter-spacing:0.04em;text-transform:none;font-style:italic;font-family:\'Aldrich\',sans-serif;">syncs with C=ID</span></div>',

          '<div class="an-pref-row">',
            '<span class="an-pref-label dim">Sound Effects</span>',
            '<label class="an-toggle">',
              '<input type="checkbox" disabled>',
              '<span class="an-toggle-track"></span>',
            '</label>',
            '<span class="an-soon">Phase 4</span>',
          '</div>',

          '<div class="an-pref-row">',
            '<span class="an-pref-label dim">MOD Audio</span>',
            '<label class="an-toggle">',
              '<input type="checkbox" disabled>',
              '<span class="an-toggle-track"></span>',
            '</label>',
            '<span class="an-soon">Phase 4</span>',
          '</div>',

          '<div class="an-pref-row">',
            '<span class="an-pref-label">Text Size</span>',
            '<div class="an-sizes" id="an-sizes">',
              '<button class="an-size-btn" data-size="sm">S</button>',
              '<button class="an-size-btn" data-size="md">M</button>',
              '<button class="an-size-btn" data-size="lg">L</button>',
              '<button class="an-size-btn" data-size="xl">XL</button>',
            '</div>',
          '</div>',

        '</div>',

      '</div>',
    '</div>',
  ].join('');
  document.body.appendChild(wrap);

  var btn   = document.getElementById('an-pack-btn');
  var panel = document.getElementById('an-pack-panel');

  function openPanel()  {
    panel.classList.add('open');
    btn.classList.add('open');
    panel.removeAttribute('aria-hidden');
  }
  function closePanel() {
    panel.classList.remove('open');
    btn.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  }
  function toggle() {
    panel.classList.contains('open') ? closePanel() : openPanel();
  }

  btn.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
  document.addEventListener('click', function (e) {
    if (!panel.contains(e.target) && e.target !== btn) closePanel();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePanel();
  });

  /* Text size */
  var prefs      = load();
  var activeSize = prefs.textSize || 'md';
  document.querySelectorAll('.an-size-btn').forEach(function (b) {
    b.classList.toggle('active', b.dataset.size === activeSize);
    b.addEventListener('click', function () {
      document.querySelectorAll('.an-size-btn').forEach(function (x) {
        x.classList.remove('active');
      });
      b.classList.add('active');
      applySize(b.dataset.size);
      var p = load();
      p.textSize = b.dataset.size;
      save(p);
    });
  });

}());
