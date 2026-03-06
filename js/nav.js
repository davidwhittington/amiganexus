/* ============================================================
   AMIGA NEXUS — Navigation & Environment Init
   Injects Workbench nav, generates stars, starts clock
   ============================================================ */

(function () {
  'use strict';

  const NAV = [
    { label: 'NEXUS MAP',  href: '/map.html',           key: 'map' },
    { label: 'HARDWARE',   href: '/hardware/',           key: 'hardware' },
    { label: 'EMULATION',  href: '/emulation/',          key: 'emulation' },
    { label: 'FPGA',       href: '/fpga/',               key: 'fpga' },
    { label: 'COMMUNITY',  href: '/community/',          key: 'community' },
    { label: 'ARCHIVES',   href: '/archives/',           key: 'archives' },
    { label: 'WORKBENCH',  href: '/workbench/',          key: 'workbench' },
    { label: 'SIGNALS',    href: '/signals/',            key: 'signals' },
    { label: 'LOUNGE',     href: '/lounge/',             key: 'lounge' },
    { label: 'MISSION',    href: '/mission-control/',    key: 'mission-control' },
    { label: 'WARP OUT',   href: '/warp-terminal/',      key: 'warp-terminal' },
  ];

  function currentKey() {
    const p = window.location.pathname;
    if (p === '/map.html' || p === '/map') return 'map';
    const m = p.match(/^\/([^\/]+)\/?/);
    return m ? m[1] : '';
  }

  function buildNav() {
    const el = document.getElementById('wb-nav');
    if (!el) return;
    const cur = currentKey();
    el.innerHTML = NAV.map(n =>
      `<a class="wb-menu-item${n.key === cur ? ' active' : ''}" href="${n.href}">${n.label}</a>`
    ).join('');
  }

  function clock() {
    const el = document.getElementById('wb-clock');
    if (!el) return;
    const tick = () => {
      const d = new Date();
      el.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()]
        .map(v => String(v).padStart(2, '0')).join(':');
    };
    tick();
    setInterval(tick, 1000);
  }

  function stars() {
    const el = document.getElementById('stars');
    if (!el) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 190; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const sz = Math.random() < 0.65 ? 1 : Math.random() < 0.75 ? 2 : 3;
      s.style.cssText = `left:${(Math.random()*100).toFixed(2)}%;top:${(Math.random()*100).toFixed(2)}%;`
        + `width:${sz}px;height:${sz}px;`
        + `--t:${(2+Math.random()*4).toFixed(1)}s;`
        + `--d:${(Math.random()*6).toFixed(2)}s;`
        + `--o:${(0.25+Math.random()*0.75).toFixed(2)};`;
      frag.appendChild(s);
    }
    el.appendChild(frag);
  }

  function init() {
    stars();
    buildNav();
    clock();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
