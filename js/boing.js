/* ============================================================
   AMIGA NEXUS — Boing Ball Easter Egg
   Physics reference: GLFW boing.c (faithful Amiga port)
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
  let overlay    = null;
  let mainCanvas = null;
  let animId     = null;

  // Physics (all per-frame at 60fps, scaled with viewport)
  let bx, by, vx, vy, spin;
  let G, R, FLOOR_Y, BASE_VY, BASE_VX;

  function computePhysics(W, H) {
    R       = Math.floor(H * 0.17);              // ball radius ~17% of height
    FLOOR_Y = H * 0.86;                          // floor position
    // Gravity tuned for ~2.5s full bounce cycle at target height of ~68% of FLOOR_Y
    G       = (2 * FLOOR_Y * 0.68) / (75 * 75); // px/frame², 75 frames = 1.25s half-cycle
    BASE_VY = Math.sqrt(2 * G * FLOOR_Y * 0.68); // vy needed to reach target height
    BASE_VX = W / 260;                           // horizontal: ~4.3s to cross at 60fps
  }

  function launch() {
    if (overlay) { dismiss(); return; }

    const W = window.innerWidth;
    const H = window.innerHeight;
    computePhysics(W, H);

    overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:9999;overflow:hidden;cursor:pointer;';

    mainCanvas = document.createElement('canvas');
    mainCanvas.width  = W;
    mainCanvas.height = H;
    mainCanvas.style.cssText = 'position:absolute;inset:0;display:block;';

    // Labels
    const label = document.createElement('div');
    label.style.cssText =
      'position:absolute;top:18px;left:50%;transform:translateX(-50%);' +
      'font-family:"Share Tech Mono",monospace;font-size:11px;letter-spacing:5px;' +
      'color:rgba(94,203,170,0.35);pointer-events:none;white-space:nowrap;';
    label.textContent = 'BOING BALL — AMIGA 1984';

    const hint = document.createElement('div');
    hint.style.cssText =
      'position:absolute;bottom:24px;left:50%;transform:translateX(-50%);' +
      'font-family:"Share Tech Mono",monospace;font-size:9px;letter-spacing:4px;' +
      'color:rgba(255,136,0,0.4);pointer-events:none;white-space:nowrap;';
    hint.textContent = 'ESC TO DISMISS';

    // CRT scanlines
    const scan = document.createElement('div');
    scan.style.cssText =
      'position:absolute;inset:0;pointer-events:none;' +
      'background:repeating-linear-gradient(0deg,transparent,transparent 3px,' +
      'rgba(0,0,0,0.07) 3px,rgba(0,0,0,0.07) 4px);';

    overlay.appendChild(mainCanvas);
    overlay.appendChild(scan);
    overlay.appendChild(label);
    overlay.appendChild(hint);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', dismiss);

    // Init: start near floor, first bounce already underway
    bx   = W * 0.35;
    by   = FLOOR_Y - R;
    vx   = BASE_VX * (0.9 + Math.random() * 0.2);
    vy   = -(BASE_VY * (0.95 + Math.random() * 0.1)); // heading up
    spin = 0;

    animate(W, H);
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
  function animate(W, H) {
    const ctx = mainCanvas.getContext('2d', { alpha: false });

    // Background: dark navy gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#08101E');
    bg.addColorStop(0.6, '#050C18');
    bg.addColorStop(1, '#030609');

    // Perspective grid (drawn once into an offscreen canvas for speed)
    const gridCanvas = buildGrid(W, H, FLOOR_Y);

    // Spin rate: ~1.5°/frame = 0.0262 rad/frame (matches GLFW boing.c at 60fps)
    const SPIN_INC = 0.0262;

    function frame() {
      // ── Physics (GLFW boing.c style) ─────────────────────
      vy += G;
      bx += vx;
      by += vy;
      spin += SPIN_INC;

      // Wall bounce — GLFW approach: reset vx with small random variation
      if (bx + R >= W) {
        bx = W - R;
        vx = -(BASE_VX * (0.85 + Math.random() * 0.30));
      }
      if (bx - R <= 0) {
        bx = R;
        vx =  (BASE_VX * (0.85 + Math.random() * 0.30));
      }

      // Floor bounce — GLFW approach: reset vy to consistent height, not true damping
      if (by + R >= FLOOR_Y) {
        by = FLOOR_Y - R;
        vy = -(BASE_VY * (0.92 + Math.random() * 0.10));
      }

      // ── Draw ─────────────────────────────────────────────
      // Background
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Perspective grid
      ctx.drawImage(gridCanvas, 0, 0);

      // Shadow
      const floorDist = FLOOR_Y - (by + R);
      const t         = Math.max(0, 1 - floorDist / (H * 0.8));
      if (t > 0.02) {
        const sW = R * (0.3 + 0.65 * t);
        const sH = R * (0.04 + 0.08 * t);
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(bx, FLOOR_Y + R * 0.04, sW, sH, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,' + (0.55 * t).toFixed(2) + ')';
        ctx.fill();
        ctx.restore();
      }

      drawBall(ctx, bx, by, R, spin);

      animId = requestAnimationFrame(frame);
    }
    animId = requestAnimationFrame(frame);
  }

  // ── Perspective floor grid ───────────────────────────────
  // Matches the characteristic Amiga Boing Ball grid floor
  function buildGrid(W, H, floorY) {
    const gc   = document.createElement('canvas');
    gc.width   = W;
    gc.height  = H;
    const gx   = gc.getContext('2d');
    const COLS = 12;
    const ROWS = 8;
    const vp   = { x: W / 2, y: floorY * 0.1 }; // vanishing point

    gx.strokeStyle = 'rgba(94,203,170,0.09)';
    gx.lineWidth = 1;

    // Horizontal grid lines (receding toward vanishing point)
    for (let r = 0; r <= ROWS; r++) {
      const t  = r / ROWS;
      const y  = floorY + (H - floorY) * t * 1.5;
      if (y > H) break;
      const xL = lerp(vp.x, 0, t);
      const xR = lerp(vp.x, W, t);
      gx.beginPath();
      gx.moveTo(xL, y);
      gx.lineTo(xR, y);
      gx.stroke();
    }

    // Vertical grid lines (radiating from vanishing point)
    for (let c = 0; c <= COLS; c++) {
      const xBase = (c / COLS) * W;
      gx.beginPath();
      gx.moveTo(vp.x, floorY);
      gx.lineTo(xBase, H * 1.8);
      gx.stroke();
    }

    // Subtle back-wall horizontal lines above floor
    gx.strokeStyle = 'rgba(94,203,170,0.05)';
    for (let r = 1; r <= 6; r++) {
      const y = floorY - (floorY * 0.12 * r);
      if (y < 0) break;
      gx.beginPath();
      gx.moveTo(0, y);
      gx.lineTo(W, y);
      gx.stroke();
    }

    // Floor line itself
    gx.strokeStyle = 'rgba(94,203,170,0.18)';
    gx.lineWidth = 1.5;
    gx.beginPath();
    gx.moveTo(0, floorY);
    gx.lineTo(W, floorY);
    gx.stroke();

    return gc;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  // ── Sphere renderer ──────────────────────────────────────
  const CHECKER_DIVS = 8;

  let ballCanvas = null;
  let ballCtx    = null;
  let ballImg    = null;
  let ballR      = 0;
  let preLatV    = null;

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
      preLatV[py] = Math.floor((Math.asin(ny) * INV_PI + 0.5) * CHECKER_DIVS) & 1;
    }
  }

  function drawBall(ctx, cx, cy, r, spinAngle) {
    const ir      = Math.max(1, Math.floor(r));
    ensureBallCanvas(ir);

    const size    = ir * 2;
    const d       = ballImg.data;
    const r2      = ir * ir;
    const INV_2PI = 1 / (Math.PI * 2);
    const cosSpin = Math.cos(spinAngle);
    const sinSpin = Math.sin(spinAngle);

    let idx = 0;
    for (let py = 0; py < size; py++) {
      const dy  = py - ir;
      const dy2 = dy * dy;
      const cv  = preLatV[py];

      for (let px = 0; px < size; px++, idx += 4) {
        const dx    = px - ir;
        const dist2 = dx * dx + dy2;

        if (dist2 > r2 || cv === -1) {
          d[idx] = d[idx+1] = d[idx+2] = d[idx+3] = 0;
          continue;
        }

        const nx   = dx / ir;
        const ny   = dy / ir;
        const nzSq = 1 - nx * nx - ny * ny;
        if (nzSq <= 0) { d[idx] = d[idx+1] = d[idx+2] = d[idx+3] = 0; continue; }
        const nz = Math.sqrt(nzSq);

        // Y-axis rotation
        const nxR = nx * cosSpin + nz * sinSpin;
        const nzR = -nx * sinSpin + nz * cosSpin;

        const lon = Math.atan2(nxR, nzR);
        const u   = ((lon * INV_2PI) % 1 + 1.5) % 1;
        const cu  = Math.floor(u * CHECKER_DIVS * 2) & 1;
        const isRed = (cu ^ cv) === 0;

        // Diffuse shading: light from upper-left-front
        const light = Math.max(0.15, 0.18 + 0.82 * (nz * 0.82 - ny * 0.32 + nx * -0.12));

        d[idx+3] = 255;
        if (isRed) {
          d[idx]   = Math.min(255, (215 * light) | 0);
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
