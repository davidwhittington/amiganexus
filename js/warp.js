/* ============================================================
   AMIGA NEXUS — Warp Drive System
   Intercepts external links and runs a jump-drive sequence
   ============================================================ */

(function () {
  'use strict';

  const STATUSES = [
    'CALCULATING JUMP VECTOR...',
    'ENGAGING HYPERDRIVE...',
    'FOLDING SPACE-TIME...',
    'JUMP COORDINATES LOCKED...',
    'EMERGING FROM HYPERSPACE...',
  ];

  function createModal() {
    if (document.getElementById('warp-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'warp-modal';
    modal.className = 'warp-modal';
    modal.innerHTML = `
      <div class="warp-modal-window">
        <div class="warp-modal-titlebar">
          <div class="warp-modal-gadget"></div>
          <div class="warp-modal-title">WARP DRIVE — ENGAGING</div>
          <div class="warp-modal-gadget"></div>
        </div>
        <div class="warp-modal-body">
          <div class="warp-dest-label">JUMP DESTINATION</div>
          <div class="warp-dest-name" id="warp-dest-name">—</div>
          <div class="warp-progress-track">
            <div class="warp-progress-fill" id="warp-progress"></div>
          </div>
          <div class="warp-status-line" id="warp-status">${STATUSES[0]}</div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function warp(url, name) {
    createModal();
    const modal    = document.getElementById('warp-modal');
    const destName = document.getElementById('warp-dest-name');
    const progress = document.getElementById('warp-progress');
    const status   = document.getElementById('warp-status');

    destName.textContent = name || new URL(url).hostname;
    progress.style.transition = 'none';
    progress.style.width = '0%';
    status.textContent = STATUSES[0];

    modal.classList.add('active');

    // Animate progress bar over 1.9s
    requestAnimationFrame(() => requestAnimationFrame(() => {
      progress.style.transition = 'width 1.9s linear';
      progress.style.width = '100%';
    }));

    // Cycle status messages
    let si = 1;
    const iv = setInterval(() => {
      if (si < STATUSES.length) status.textContent = STATUSES[si++];
    }, 400);

    setTimeout(() => {
      clearInterval(iv);
      window.open(url, '_blank', 'noopener,noreferrer');
      modal.classList.remove('active');
    }, 2100);
  }

  // Expose for inline usage
  window.warp = warp;

  function init() {
    createModal();

    // Intercept .warp-link anchors and [data-warp] elements
    document.addEventListener('click', function (e) {
      const link = e.target.closest('.warp-link, [data-warp]');
      if (!link) return;
      e.preventDefault();
      const url  = link.dataset.warpUrl || link.getAttribute('href') || '#';
      const name = link.dataset.warp || link.dataset.name || '';
      warp(url, name);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
