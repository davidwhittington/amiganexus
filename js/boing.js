/* ============================================================
   AMIGA NEXUS — Boing Ball Easter Egg
   Trigger: type "BOING" anywhere (2s inactivity resets buffer)
   Dismiss: Escape key or click anywhere
   ============================================================ */
(function () {
  'use strict';

  // ── Keypress accumulator ─────────────────────────────────
  const TARGET = 'BOING';
  let buf = '';
  let resetTimer;

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { dismiss(); return; }
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

    clearTimeout(resetTimer);
    if (e.key.length !== 1) { buf = ''; return; }
    buf += e.key.toUpperCase();
    if (!TARGET.startsWith(buf)) { buf = e.key.toUpperCase(); if (!TARGET.startsWith(buf)) buf = ''; return; }
    if (buf === TARGET) { buf = ''; launch(); return; }
    resetTimer = setTimeout(function () { buf = ''; }, 2000);
  });

  // ── State ────────────────────────────────────────────────
  let overlay  = null;
  let mainCanvas = null;
  let animId   = null;

  // Physics
  let bx, by, vx, vy, spin;
  const GRAVITY    = 0.38;
  const FLOOR_DAMP = 0.76;
  const SPIN_RATE  = 0.034;

  function launch() {
    if (overlay) { dismiss(); return; }

    overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:9999;background:rgba(2,4,14,0.95);' +
      'display:flex;align-items:center;justify-content:center;' +
      'overflow:hidden;cursor:pointer;';

    // CRT scanline texture
    const scan = document.createElement('div');
    scan.style.cssText =
      'position:absolute;inset:0;pointer-events:none;' +
      'background:repeating-linear-gradient(0deg,transparent,transparent 3px,' +
      'rgba(0,0,0,0.09) 3px,rgba(0,0,0,0.09) 4px);';

    // Corner labels — Amiga Workbench aesthetic
    const label = document.createElement('div');
    label.style.cssText =
      'position:absolute;top:16px;left:50%;transform:translateX(-50%);' +
      'font-family:"Share Tech Mono",monospace;font-size:10px;letter-spacing:4px;' +
      'color:rgba(94,203,170,0.4);pointer-events:none;white-space:nowrap;';
    label.textContent = 'BOING BALL — AMIGA 1984';

    const hint = document.createElement('div');
    hint.style.cssText =
      'position:absolute;bottom:28px;left:50%;transform:translateX(-50%);' +
      'font-family:"Share Tech Mono",monospace;font-size:9px;letter-spacing:3px;' +
      'color:rgba(255,136,0,0.45);pointer-events:none;white-space:nowrap;';
    hint.textContent = 'ESC TO DISMISS';

    mainCanvas = document.createElement('canvas');
    const W = Math.min(600, window.innerWidth  - 40);
    const H = Math.min(500, window.innerHeight - 100);
    mainCanvas.width  = W;
    mainCanvas.height = H;
    mainCanvas.style.cssText = 'display:block;';

    const R = Math.floor(Math.min(W, H) * 0.36);

    // Init physics: start mid-upper area, moving diagonally
    bx   = W * 0.4;
    by   = R + 8;
    vx   = 3.2;
    vy   = 0;
    spin = 0;

    overlay.appendChild(scan);
    overlay.appendChild(mainCanvas);
    overlay.appendChild(label);
    overlay.appendChild(hint);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', dismiss);

    animate(R, W, H);
  }

  function dismiss() {
    if (!overlay) return;
    cancelAnimationFrame(animId);
    overlay.remove();
    overlay = null;
    mainCanvas = null;
    ballCanvas = null;
    ballR = 0;
  }

  // ── Animation loop ───────────────────────────────────────
  function animate(R, W, H) {
    const ctx   = mainCanvas.getContext('2d', { alpha: false });
    const FLOOR = H - 12;

    // Background gradient (computed once)
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#080C1A');
    bg.addColorStop(1, '#030507');

    function frame() {
      // Physics
      vy += GRAVITY;
      bx += vx;
      by += vy;
      spin += SPIN_RATE;

      // Walls
      if (bx - R < 0)  { bx = R;     vx =  Math.abs(vx); }
      if (bx + R > W)  { bx = W - R; vx = -Math.abs(vx); }

      // Floor
      if (by + R >= FLOOR) {
        by = FLOOR - R;
        vy = -Math.abs(vy) * FLOOR_DAMP;
        if (Math.abs(vy) < 0.8) vy = -(R * 0.055); // keep bouncing
      }

      // Background
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Floor line
      ctx.strokeStyle = 'rgba(94,203,170,0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, FLOOR + R * 0.15);
      ctx.lineTo(W, FLOOR + R * 0.15);
      ctx.stroke();

      // Shadow: grows as ball approaches floor
      const floorDist = FLOOR - (by + R);
      const maxDist   = H;
      const t         = Math.max(0, 1 - floorDist / maxDist);
      const sAlpha    = 0.6 * t;
      const sW        = R * (0.35 + 0.55 * t);
      const sH        = R * (0.05 + 0.1 * t);
      if (sAlpha > 0.02) {
        ctx.beginPath();
        ctx.ellipse(bx, FLOOR + R * 0.08, sW, sH, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,' + sAlpha.toFixed(2) + ')';
        ctx.fill();
      }

      drawBall(ctx, bx, by, R, spin);

      animId = requestAnimationFrame(frame);
    }
    animId = requestAnimationFrame(frame);
  }

  // ── Sphere renderer ──────────────────────────────────────
  const CHECKER_DIVS = 8;

  let ballCanvas = null;
  let ballCtx    = null;
  let ballImg    = null;
  let ballR      = 0;

  // Precomputed per-row latitude checker band (avoids asin in inner loop)
  let preLatV = null;

  function ensureBallCanvas(ir) {
    if (ballR === ir) return;
    ballR = ir;
    const size  = ir * 2;
    ballCanvas  = document.createElement('canvas');
    ballCanvas.width = ballCanvas.height = size;
    ballCtx     = ballCanvas.getContext('2d');
    ballImg     = ballCtx.createImageData(size, size);
    preLatV     = new Int8Array(size);
    const INV_PI = 1 / Math.PI;
    for (let py = 0; py < size; py++) {
      const ny = (py - ir) / ir;
      if (ny < -1 || ny > 1) { preLatV[py] = -1; continue; }
      const lat = Math.asin(ny);
      preLatV[py] = Math.floor((lat * INV_PI + 0.5) * CHECKER_DIVS) & 1;
    }
  }

  function drawBall(ctx, cx, cy, r, spinAngle) {
    const ir = Math.max(1, Math.floor(r));
    ensureBallCanvas(ir);

    const size    = ir * 2;
    const d       = ballImg.data;
    const r2      = ir * ir;
    const INV_2PI = 1 / (Math.PI * 2);
    const cosSpin = Math.cos(spinAngle);
    const sinSpin = Math.sin(spinAngle);

    // Clear alpha to transparent first pass isn't needed — we set every pixel

    let idx = 0;
    for (let py = 0; py < size; py++) {
      const dy  = py - ir;
      const dy2 = dy * dy;
      const cv  = preLatV[py]; // latitude checker band for this row (-1 if outside sphere)

      for (let px = 0; px < size; px++, idx += 4) {
        const dx    = px - ir;
        const dist2 = dx * dx + dy2;

        if (dist2 > r2 || cv === -1) {
          // Outside sphere — transparent
          d[idx] = d[idx+1] = d[idx+2] = d[idx+3] = 0;
          continue;
        }

        const nx = dx / ir;
        const ny = dy / ir;
        const nzSq = 1 - nx * nx - ny * ny;
        if (nzSq <= 0) { d[idx] = d[idx+1] = d[idx+2] = d[idx+3] = 0; continue; }
        const nz = Math.sqrt(nzSq);

        // Y-axis rotation: rotate (nx, nz) by spinAngle
        const nxR = nx * cosSpin + nz * sinSpin;
        const nzR = -nx * sinSpin + nz * cosSpin;

        const lon = Math.atan2(nxR, nzR);
        const u   = ((lon * INV_2PI) % 1 + 1.5) % 1;
        const cu  = Math.floor(u * CHECKER_DIVS * 2) & 1;

        const isRed = (cu ^ cv) === 0;

        // Diffuse shading — light from upper-left
        const light = Math.max(0.12, 0.2 + 0.8 * (nz * 0.85 - ny * 0.3 + nx * -0.1));

        d[idx+3] = 255;
        if (isRed) {
          d[idx]   = Math.min(255, (210 * light) | 0);
          d[idx+1] = 0;
          d[idx+2] = 0;
        } else {
          const w  = Math.min(255, (255 * light) | 0);
          d[idx]   = d[idx+1] = d[idx+2] = w;
        }
      }
    }

    ballCtx.putImageData(ballImg, 0, 0);
    ctx.drawImage(ballCanvas, Math.floor(cx - ir), Math.floor(cy - ir));
  }

})();
