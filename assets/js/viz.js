/**
 * AIM Media — Infographics & Motion Graphics
 *
 * Replaces long-form copy with animated, self-explanatory visuals.
 * Every viz plays once when scrolled into view, then settles into a
 * low-cost idle state. Honours prefers-reduced-motion by rendering the
 * final frame immediately with no animation.
 */
(function () {
'use strict';

const ACCENT = [217, 119, 87];
const CREAM  = [245, 240, 235];
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const clamp01 = t => Math.max(0, Math.min(1, t));

/** Run `fn` once the element is meaningfully on screen. */
function onEnter(el, fn) {
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { io.disconnect(); fn(); }
  }, { threshold: 0.3 });
  io.observe(el);
}

/** Size a canvas to its CSS box at device pixel ratio. Returns {w,h} in CSS px. */
function fitCanvas(canvas, ctx) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.offsetWidth, h = canvas.offsetHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

// ── COUNTERS ──────────────────────────────────────────────────
// <span class="viz-num" data-count="80" data-suffix="%">
(function initCounters() {
  document.querySelectorAll('.viz-num[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const dur = 1400;
    el.textContent = prefix + '0' + suffix;
    if (REDUCED) { el.textContent = prefix + target + suffix; return; }
    onEnter(el, () => {
      const start = performance.now();
      (function step(now) {
        const p = clamp01((now - start) / dur);
        el.textContent = prefix + Math.round(target * easeOut(p)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(start);
    });
  });
})();

// ── STAGGERED REVEAL for DOM-based viz (flow, cost, steps) ────
// Adds .on to the container, CSS handles the choreography.
(function initDomViz() {
  document.querySelectorAll('[data-viz-dom]').forEach(el => {
    if (REDUCED) { el.classList.add('on'); return; }
    onEnter(el, () => el.classList.add('on'));
  });
})();

// ── 1. VOICEMAIL LEAK ─────────────────────────────────────────
// 50 dots = 50 callers who reach voicemail. The first 10 stay lit
// (they leave a message); the other 40 slump and dim — so the 80/20
// split stays legible as a still frame, not just as an animation.
function vizLeak(canvas) {
  const ctx = canvas.getContext('2d');
  const TOTAL = 50, KEPT = 10;
  let W, H, dots = [], raf = null, t0 = 0, playing = false;

  function build() {
    const s = fitCanvas(canvas, ctx); W = s.w; H = s.h;
    const cols = Math.max(5, Math.min(10, Math.floor(W / 40)));
    const rows = Math.ceil(TOTAL / cols);
    const cw = W / cols, ch = Math.min(H / (rows + 0.4), 34);
    const top = (H - (rows - 1) * ch) / 2;
    dots = Array.from({ length: TOTAL }, (_, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      return {
        x: cw * (c + 0.5),
        y: top + r * ch,
        lost: i >= KEPT,
        delay: c * 0.02 + r * 0.06,
        drift: (Math.random() - 0.5) * 7,
        fall: 7 + Math.random() * 9,
      };
    });
  }

  function paint(t) {
    ctx.clearRect(0, 0, W, H);
    dots.forEach(d => {
      const app = clamp01((t - d.delay) / 0.45);
      if (app <= 0) return;
      const a0 = easeOut(app);
      // lost dots slump + dim between 1.1s and 2.4s, settling at 12% opacity
      const e = d.lost ? easeOut(clamp01((t - 1.1 - d.delay * 0.4) / 1.3)) : 0;
      const x = d.x + d.drift * e;
      const y = d.y + d.fall * e;
      if (d.lost) {
        ctx.fillStyle = rgba(CREAM, a0 * (0.32 - 0.16 * e));
        ctx.beginPath(); ctx.arc(x, y, 3.4 * a0 * (1 - 0.2 * e), 0, Math.PI * 2); ctx.fill();
      } else {
        const pulse = t > 2 ? 0.8 + 0.2 * Math.sin((t - 2) * 2 + d.x * 0.05) : 0.8;
        ctx.fillStyle = rgba(ACCENT, a0 * pulse);
        ctx.shadowColor = rgba(ACCENT, 0.55); ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(x, y, 4.4 * a0, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
  }

  function frame(now) {
    const t = (now - t0) / 1000;
    paint(t);
    if (t < 24) raf = requestAnimationFrame(frame);
    else { playing = false; raf = null; paint(24); }
  }

  build();
  new ResizeObserver(() => { build(); if (!playing) paint(99); }).observe(canvas);

  if (REDUCED) paint(99);
  else {
    paint(0);
    onEnter(canvas, () => {
      if (playing) return;
      playing = true; t0 = performance.now();
      raf = requestAnimationFrame(frame);
    });
  }
}

// ── 2. COVERAGE CLOCK ─────────────────────────────────────────
// 24h ring: staffed hours vs the gap AIM Media closes.
function vizClock(canvas) {
  const ctx = canvas.getContext('2d');
  const OPEN = 9, CLOSE = 17;                 // 8 staffed hours
  const staffedFrac = (CLOSE - OPEN) / 24;
  let W, H, cx, cy, R, raf = null, t0 = 0;

  const ang = f => -Math.PI / 2 + f * Math.PI * 2;

  function build() {
    const s = fitCanvas(canvas, ctx); W = s.w; H = s.h;
    cx = W / 2; cy = H / 2;
    R = Math.min(W, H) / 2 - 26;
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const lw = Math.max(9, R * 0.14);

    // track
    ctx.lineWidth = lw; ctx.lineCap = 'butt';
    ctx.strokeStyle = 'rgba(245,240,235,0.06)';
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();

    // hour ticks
    for (let h = 0; h < 24; h++) {
      const a = ang(h / 24);
      const major = h % 6 === 0;
      const r1 = R + lw / 2 + 4, r2 = r1 + (major ? 7 : 4);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      ctx.strokeStyle = `rgba(245,240,235,${major ? 0.3 : 0.12})`;
      ctx.lineWidth = 1; ctx.stroke();
    }

    // phase 1 (0–1.2s): staffed arc draws in cream
    const p1 = easeOut(clamp01(t / 1.2));
    ctx.lineWidth = lw; ctx.lineCap = 'round';
    ctx.strokeStyle = rgba(CREAM, 0.5);
    ctx.beginPath();
    ctx.arc(cx, cy, R, ang(OPEN / 24), ang(OPEN / 24 + staffedFrac * p1));
    ctx.stroke();

    // phase 2 (1.5–3.3s): AIM closes the remaining 16 hours in accent
    const p2 = easeOut(clamp01((t - 1.5) / 1.8));
    if (p2 > 0) {
      ctx.strokeStyle = rgba(ACCENT, 0.95);
      ctx.shadowColor = rgba(ACCENT, 0.55); ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(cx, cy, R, ang(CLOSE / 24), ang(CLOSE / 24 + (1 - staffedFrac) * p2));
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // leading dot on the active edge
    if (p2 > 0 && p2 < 1) {
      const a = ang(CLOSE / 24 + (1 - staffedFrac) * p2);
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, lw * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = rgba(CREAM, 0.95); ctx.fill();
    }

    // centre readout
    const covered = Math.round(8 + 16 * clamp01((t - 1.5) / 1.8));
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = rgba(ACCENT, 1);
    ctx.font = `900 ${Math.round(R * 0.5)}px 'Playfair Display', Georgia, serif`;
    ctx.fillText(covered === 24 ? '24/7' : covered + 'h', cx, cy - R * 0.06);
    ctx.fillStyle = 'rgba(245,240,235,0.45)';
    ctx.font = `600 ${Math.round(Math.max(8, R * 0.115))}px Inter, system-ui, sans-serif`;
    ctx.fillText(covered === 24 ? 'COVERED' : 'STAFFED', cx, cy + R * 0.32);
  }

  function frame(now) {
    const t = (now - t0) / 1000;
    draw(t);
    if (t < 4) raf = requestAnimationFrame(frame); else raf = null;
  }

  build();
  new ResizeObserver(() => { build(); draw(REDUCED || raf === null ? 99 : 0); }).observe(canvas);

  if (REDUCED) draw(99);
  else { draw(0); onEnter(canvas, () => { t0 = performance.now(); raf = requestAnimationFrame(frame); }); }
}

// ── BOOT ──────────────────────────────────────────────────────
const BUILDERS = { leak: vizLeak, clock: vizClock };
document.querySelectorAll('canvas[data-viz]').forEach(c => {
  const fn = BUILDERS[c.dataset.viz];
  if (fn) { try { fn(c); } catch (e) { /* a viz must never break the page */ } }
});

})();
