/**
 * AIM Media — Core Chrome
 * Preloader, cursor, spotlight, nav, hero entrance, ambient audio, particles,
 * GSAP/Lenis motion, drag-scroll cards, founder canvas.
 * Shared across every page. Every DOM lookup that isn't guaranteed to exist
 * on every page is null-guarded so this file runs safely site-wide.
 */
(function () {
'use strict';

// ── PRELOADER ─────────────────────────────────────────────────
const preloader = document.getElementById('preloader');
let preloaderDone = false;

function exitPreloader() {
  if (preloaderDone) return;
  preloaderDone = true;
  if (preloader) preloader.classList.add('exit');
  setTimeout(() => {
    if (preloader) preloader.style.display = 'none';
    startHeroAnimation();
  }, 850);
}
// Exit after 2.5s regardless
setTimeout(exitPreloader, 2500);

// ── CURSOR + SPOTLIGHT ────────────────────────────────────────
const cursor    = document.getElementById('cursor');
const ring      = document.getElementById('cursor-ring');
const spotlight = document.getElementById('spotlight');
let mx = 0, my = 0, rx = 0, ry = 0, sx = window.innerWidth/2, sy = window.innerHeight/2;

if (cursor && ring && spotlight) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
    spotlight.style.opacity = '1';
  });

  document.addEventListener('mouseleave', () => { spotlight.style.opacity = '0'; });

  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

  (function animCursor() {
    rx += (mx - rx) * 0.065;
    ry += (my - ry) * 0.065;
    sx += (mx - sx) * 0.045;
    sy += (my - sy) * 0.045;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    spotlight.style.background = `radial-gradient(ellipse 420px 420px at ${sx}px ${sy}px, rgba(217,119,87,0.055) 0%, transparent 70%)`;
    requestAnimationFrame(animCursor);
  })();
}

const hoverTargets = 'a, button, .bcard, .ccase, .stat-card, .btn-primary, .btn-ghost';
document.querySelectorAll(hoverTargets).forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ── MAGNETIC BUTTONS ─────────────────────────────────────────
document.querySelectorAll('.btn-primary').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width  / 2) * 0.22;
    const y = (e.clientY - r.top  - r.height / 2) * 0.22;
    btn.style.transform = `translate(${x}px, ${y}px) scale(1.04)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
    btn.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s';
  });
  btn.addEventListener('mouseenter', () => {
    btn.style.transition = 'transform 0.12s ease, box-shadow 0.35s';
  });
});

// ── SCROLL PROGRESS ──────────────────────────────────────────
const progressBar = document.getElementById('progress');
function updateProgress() {
  if (!progressBar) return;
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  progressBar.style.width = Math.min(pct, 100) + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });

// ── NAV — scroll shading (active state is rendered per-page) ─
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ── MOBILE NAV + DROPDOWNS ────────────────────────────────────
(function () {
  const burger = document.getElementById('nav-burger');
  const mobile = document.getElementById('nav-mobile');
  if (burger && mobile) {
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      mobile.classList.toggle('open', !open);
      mobile.setAttribute('aria-hidden', String(open));
      document.body.classList.toggle('nav-open', !open);
    });
    mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      burger.setAttribute('aria-expanded', 'false');
      mobile.classList.remove('open');
      mobile.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('nav-open');
    }));
  }

  // Desktop dropdowns — click/tap toggle (works alongside CSS :hover for mouse users)
  document.querySelectorAll('.nav-drop').forEach(drop => {
    const trigger = drop.querySelector('.nav-drop-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', e => {
      if (window.matchMedia('(hover: none)').matches) {
        e.preventDefault();
        const open = drop.classList.contains('open');
        document.querySelectorAll('.nav-drop.open').forEach(d => d.classList.remove('open'));
        drop.classList.toggle('open', !open);
      }
    });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-drop')) {
      document.querySelectorAll('.nav-drop.open').forEach(d => d.classList.remove('open'));
    }
  });
})();

// ── HERO VIDEO (home page only) ───────────────────────────────
const heroVid = document.getElementById('hero-video');
let videoActivated = false;
if (heroVid) {
  function activateVideo() {
    if (videoActivated) return;
    videoActivated = true;
    heroVid.classList.add('ready');
    heroVid.play().catch(() => {});
  }
  heroVid.addEventListener('canplay',       activateVideo, { once: true });
  heroVid.addEventListener('loadeddata',    activateVideo, { once: true });
  heroVid.addEventListener('loadedmetadata',activateVideo, { once: true });
  // Force visible after 4s in case events don't fire
  setTimeout(() => heroVid.classList.add('ready'), 4000);
  heroVid.addEventListener('error', () => { heroVid.style.display = 'none'; });
  // Kick off load
  if (heroVid.readyState >= 2) activateVideo();
  else heroVid.load();
}

// ── AMBIENT AUDIO ENGINE (procedural — never loops) ──────────
(function() {
  const soundBtn = document.getElementById('sound-btn');
  if (!soundBtn) return;
  if (heroVid) heroVid.muted = true; // keep video audio silent; engine replaces it
  let engine = null, on = false;

  class Ambient {
    constructor() {
      this.ac  = new (window.AudioContext || window.webkitAudioContext)();
      this.out = this.ac.createGain();
      this.out.gain.value = 0;
      this.out.connect(this.ac.destination);
      this.nodes = [];
      this._build();
    }

    _build() {
      const ac = this.ac;

      /* ── Brown noise (city rumble / room tone) ── */
      const SECS = 8;
      const buf  = ac.createBuffer(2, ac.sampleRate * SECS, ac.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        let last = 0;
        for (let i = 0; i < d.length; i++) {
          const w = Math.random() * 2 - 1;
          d[i] = (last + 0.02 * w) / 1.02;
          last = d[i];
          d[i] *= 3.5;
        }
      }
      const noise = ac.createBufferSource();
      noise.buffer = buf; noise.loop = true;
      // Crossfade loop point to hide seam
      noise.loopStart = 0.05;
      noise.loopEnd   = SECS - 0.05;

      const lpf = ac.createBiquadFilter();
      lpf.type = 'lowpass'; lpf.frequency.value = 160; lpf.Q.value = 0.5;
      const ng  = ac.createGain(); ng.gain.value = 0.20;
      noise.connect(lpf); lpf.connect(ng); ng.connect(this.out);
      noise.start();

      /* Slow LFO on lpf cutoff — 28-second period, never feels repetitive */
      const lfo = ac.createOscillator(); lfo.frequency.value = 0.036;
      const lg  = ac.createGain(); lg.gain.value = 65;
      lfo.connect(lg); lg.connect(lpf.frequency); lfo.start();

      /* ── 40 Hz sub-bass hum (infrastructure/depth) ── */
      const sub = ac.createOscillator();
      sub.type = 'sine'; sub.frequency.value = 40;
      const sg = ac.createGain(); sg.gain.value = 0.032;
      sub.connect(sg); sg.connect(this.out); sub.start();

      /* ── Detuned tonal pair — 520 / 526 Hz, slow beating (6Hz beat) ── */
      [[520, -0.3], [526, 0.3]].forEach(([freq, pan]) => {
        const osc = ac.createOscillator();
        osc.type = 'sine'; osc.frequency.value = freq;
        const g  = ac.createGain(); g.gain.value = 0.007;
        const sp = ac.createStereoPanner(); sp.pan.value = pan;
        osc.connect(g); g.connect(sp); sp.connect(this.out);
        osc.start();
        this.nodes.push(osc);
      });

      /* ── Breath LFO on master (0.05 Hz — 20-second swell) ── */
      const blfo = ac.createOscillator(); blfo.frequency.value = 0.05;
      const bg   = ac.createGain(); bg.gain.value = 0.05;
      blfo.connect(bg); bg.connect(this.out.gain); blfo.start();

      this.nodes.push(noise, lfo, sub, blfo);
    }

    fadeIn(sec = 2.8) {
      this.ac.resume();
      const g = this.out.gain;
      g.cancelScheduledValues(this.ac.currentTime);
      g.setValueAtTime(g.value, this.ac.currentTime);
      g.linearRampToValueAtTime(0.65, this.ac.currentTime + sec);
    }
    fadeOut(sec = 2.0) {
      const g = this.out.gain;
      g.cancelScheduledValues(this.ac.currentTime);
      g.setValueAtTime(g.value, this.ac.currentTime);
      g.linearRampToValueAtTime(0, this.ac.currentTime + sec);
    }
    destroy() {
      this.nodes.forEach(n => { try { n.stop(); } catch(e) {} });
      this.ac.close();
    }
  }

  soundBtn.onclick = () => {
    on = !on;
    if (on) {
      if (!engine) engine = new Ambient();
      engine.fadeIn();
    } else {
      if (engine) engine.fadeOut();
    }
    soundBtn.textContent = on ? '🔊' : '🔇';
    soundBtn.classList.toggle('active', on);
  };
})();

// ── PARTICLES ────────────────────────────────────────────────
(function () {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resizeCanvas() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const COLORS = [[217,119,87],[180,85,50],[200,130,70],[240,170,90]];
  const PCOUNT = 70;
  const pts = Array.from({ length: PCOUNT }, () => resetPt({}));

  function resetPt(p) {
    p.x = Math.random() * W;
    p.y = Math.random() * H;
    p.r = Math.random() * 1.4 + 0.3;
    p.speed = Math.random() * 0.25 + 0.05;
    p.drift = (Math.random() - 0.5) * 0.3;
    p.life = Math.floor(Math.random() * 400);
    p.maxLife = Math.floor(Math.random() * 300 + 180);
    p.c = COLORS[Math.floor(Math.random() * COLORS.length)];
    return p;
  }

  (function animParticles() {
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      p.y -= p.speed;
      p.x += p.drift;
      p.life++;
      const prog = (p.life % p.maxLife) / p.maxLife;
      const alpha = Math.sin(prog * Math.PI) * 0.38;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${alpha})`;
      ctx.fill();
      if (p.y < -5 || p.life >= p.maxLife * 4) resetPt(p);
    }
    requestAnimationFrame(animParticles);
  })();
})();

// ── SCRAMBLE TEXT ─────────────────────────────────────────────
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%!';
function scramble(el, final, duration = 1000) {
  let start;
  function frame(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    const resolved = Math.floor(p * final.length);
    el.textContent = final.split('').map((ch, i) => {
      if (ch === ' ' || ch === '.' || ch === '+') return ch;
      if (i < resolved) return ch;
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join('');
    if (p < 1) requestAnimationFrame(frame);
    else el.textContent = final;
  }
  requestAnimationFrame(frame);
}

// ── 3D TILT ──────────────────────────────────────────────────
function applyTilt(selector, depth = 8) {
  document.querySelectorAll(selector).forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.style.transition = 'transform 0.15s ease';
    });
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${x * depth}deg) rotateX(${-y * depth}deg) scale(1.02)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
      el.style.transform = '';
    });
  });
}
applyTilt('.bcard', 7);
applyTilt('.ccase', 5);

// ── GSAP + LENIS ─────────────────────────────────────────────
let gsapReady = false;

function initMotion() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (gsapReady) return;
  gsapReady = true;

  gsap.registerPlugin(ScrollTrigger);

  // Lenis smooth scroll
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Generic reveal
  gsap.utils.toArray('.rev').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 36, scale: 0.97 },
      { opacity: 1, y: 0,  scale: 1,
        duration: 0.95, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 87%', once: true }
      }
    );
  });

  // Split-panel slide in (founders, and any other .rev-l / .rev-r panel pair)
  gsap.utils.toArray('.rev-l').forEach(el => {
    gsap.fromTo(el, { opacity: 0, x: -80 }, {
      opacity: 1, x: 0, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 78%', once: true }
    });
  });
  gsap.utils.toArray('.rev-r').forEach(el => {
    gsap.fromTo(el, { opacity: 0, x: 80 }, {
      opacity: 1, x: 0, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 78%', once: true }
    });
  });

  // Draggable card stagger (any .cases-track section)
  gsap.utils.toArray('.ccase').forEach((c, i) => {
    gsap.fromTo(c, { opacity: 0, y: 70 }, {
      opacity: 1, y: 0, duration: 0.85, delay: i * 0.06, ease: 'power3.out',
      scrollTrigger: { trigger: c.closest('.cases-track') || c, start: 'top 85%', once: true }
    });
  });

  // Bento stagger
  gsap.utils.toArray('.bcard').forEach((c, i) => {
    gsap.fromTo(c, { opacity: 0, y: 30, scale: 0.96 }, {
      opacity: 1, y: 0, scale: 1, duration: 0.7, delay: i * 0.09, ease: 'power3.out',
      scrollTrigger: { trigger: c.closest('.bento') || c, start: 'top 78%', once: true }
    });
  });

  // Scramble s-tags on entry
  document.querySelectorAll('.s-tag').forEach(el => {
    const orig = el.textContent.trim();
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => scramble(el, orig, 700)
    });
  });

  // Hero parallax
  gsap.to('#hero .hero-bg', {
    yPercent: 18,
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.to('#hero-video', {
    yPercent: 12,
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  // Hero right visual — slower parallax for depth layering
  gsap.to('#hero-visual-img', {
    yPercent: 22,
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.utils.toArray('.moment-ghost').forEach(el => {
    gsap.to(el, {
      scale: 1.08,
      ease: 'none',
      scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });
}

// Poll for GSAP
const gsapPoll = setInterval(() => {
  if (typeof gsap !== 'undefined') { clearInterval(gsapPoll); initMotion(); }
}, 80);

// Safety net: .rev elements start at opacity 0 and rely on GSAP to reveal them.
// If the CDN is blocked or slow, show everything rather than ship a blank page.
setTimeout(() => {
  clearInterval(gsapPoll);
  if (gsapReady) return;
  document.querySelectorAll('.rev, .rev-l, .rev-r').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}, 3000);

// ── HERO ENTRANCE (after preloader) ─────────────────────────
function startHeroAnimation() {
  const eyebrow = document.querySelector('.hero-eyebrow');
  const lines   = document.querySelectorAll('.hero-line span');
  const sub     = document.querySelector('.hero-sub');
  const cta     = document.querySelector('.hero-cta');
  const scroll  = document.querySelector('.hero-scroll');
  if (!eyebrow && !lines.length) return;

  if (eyebrow) eyebrow.style.opacity = '0';
  lines.forEach(l => { l.style.transform = 'translateY(110%)'; });

  const delay = (fn, ms) => setTimeout(fn, ms);

  if (eyebrow) delay(() => { eyebrow.style.transition = 'opacity 0.7s ease'; eyebrow.style.opacity = '1'; scramble(eyebrow, eyebrow.textContent.trim(), 700); }, 100);
  delay(() => {
    lines.forEach((l, i) => {
      l.style.transition = `transform 1.1s cubic-bezier(0.16,1,0.3,1) ${i * 0.18}s`;
      l.style.transform  = 'translateY(0)';
    });
  }, 350);
  if (sub)    delay(() => { sub.style.transition = 'opacity 1s ease, transform 1s cubic-bezier(0.16,1,0.3,1)'; sub.style.opacity = '1'; sub.style.transform = 'translateY(0)'; }, 750);
  if (cta)    delay(() => { cta.style.transition = 'opacity 0.9s ease, transform 0.9s cubic-bezier(0.16,1,0.3,1)'; cta.style.opacity = '1'; cta.style.transform = 'translateY(0)'; }, 950);
  if (scroll) delay(() => { scroll.style.transition = 'opacity 0.7s ease'; scroll.style.opacity = '1'; }, 1200);
}

// ── HERO MOUSE PARALLAX ──────────────────────────────────────
(function() {
  const heroSec = document.getElementById('hero');
  const heroContent = document.querySelector('.hero-content');
  const heroVidEl   = document.getElementById('hero-video');
  if (!heroSec || !heroContent) return;
  let hx = 0, hy = 0, px = 0, py = 0;
  heroSec.addEventListener('mousemove', e => {
    hx = (e.clientX - window.innerWidth  / 2) * 0.018;
    hy = (e.clientY - window.innerHeight / 2) * 0.012;
  });
  heroSec.addEventListener('mouseleave', () => { hx = 0; hy = 0; });
  (function tick() {
    px += (hx - px) * 0.055;
    py += (hy - py) * 0.055;
    heroContent.style.transform = `translate(${px}px, ${py}px)`;
    if (heroVidEl) heroVidEl.style.transform = `translate(${-px * 0.4}px, ${-py * 0.4}px) scale(1.04)`;
    requestAnimationFrame(tick);
  })();
})();

// ── DRAG SCROLL — horizontal card tracks (momentum) ───────────
(function() {
  const track = document.querySelector('.cases-track');
  if (!track) return;
  let down = false, startX, startScroll, velX = 0, lastX, raf;
  track.addEventListener('pointerdown', e => {
    down = true; startX = e.pageX; startScroll = track.scrollLeft; lastX = e.pageX; velX = 0;
    cancelAnimationFrame(raf);
    track.setPointerCapture(e.pointerId);
    track.style.scrollSnapType = 'none';
  });
  track.addEventListener('pointermove', e => {
    if (!down) return;
    velX = e.pageX - lastX; lastX = e.pageX;
    track.scrollLeft = startScroll - (e.pageX - startX) * 1.3;
  });
  function endDrag() {
    if (!down) return;
    down = false;
    track.style.scrollSnapType = '';
    (function coast() {
      velX *= 0.92;
      track.scrollLeft -= velX * 1.6;
      if (Math.abs(velX) > 0.4) raf = requestAnimationFrame(coast);
    })();
  }
  track.addEventListener('pointerup',     endDrag);
  track.addEventListener('pointercancel', endDrag);
})();

// ── AMBIENT SECTION GLOW ─────────────────────────────────────
(function() {
  const sections = [
    { id: 'problem',      color: 'rgba(217,119,87,0.07)'  },
    { id: 'solution',     color: 'rgba(217,119,87,0.08)'  },
    { id: 'build',        color: 'rgba(217,119,87,0.08)'  },
    { id: 'infra',        color: 'rgba(180,100,60,0.06)'  },
    { id: 'environments', color: 'rgba(217,119,87,0.10)'  },
    { id: 'founders',     color: 'rgba(140,90,70,0.07)'   },
    { id: 'cta',          color: 'rgba(217,119,87,0.09)'  },
  ];
  const glow = document.createElement('div');
  glow.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;transition:background 1.8s ease,opacity 1.8s;opacity:0;';
  document.body.appendChild(glow);
  let lastSection = '';
  function onScroll() {
    const midY = window.scrollY + window.innerHeight * 0.5;
    let active = null;
    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el && midY >= el.offsetTop && midY < el.offsetTop + el.offsetHeight) active = s;
    });
    if (active && active.id !== lastSection) {
      lastSection = active.id;
      glow.style.opacity = '1';
      glow.style.background = `radial-gradient(ellipse 70% 60% at 50% 50%, ${active.color} 0%, transparent 75%)`;
    } else if (!active && lastSection) {
      lastSection = '';
      glow.style.opacity = '0';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ── LOAD AI IMAGES ───────────────────────────────────────────
const imageMap = {
  'img-ram-bharose':     '/assets/ram-bharose.jpg',
  'img-kris-ramotar':    '/assets/kris-ramotar.jpg',
  'img-wetech':          '/assets/wetech.jpg',
  'img-vip-motors':      '/assets/vip-motors.jpg',
  'img-coffee-exchange': '/assets/coffee-exchange.jpg',
  'img-krish':           '/assets/krish.jpg',
  'img-kartik':          '/assets/kartik.jpg',
  'img-atiyas':          '/assets/atiyas.jpg',
  'img-tdottruck':       '/assets/tdottruck.jpg',
};
Object.entries(imageMap).forEach(([id, src]) => {
  const els = document.querySelectorAll('#' + id);
  if (!els.length) return;
  const img = new Image();
  img.onload = () => {
    els.forEach(el => { el.style.backgroundImage = `url('${src}')`; el.style.transition = 'opacity 1.2s ease'; });
  };
  img.src = src;
});

// ── BCARD CANVAS ANIMATIONS (hover-only) ─────────────────────
(function initBcardAnims() {
  const AC = 'rgba(217,119,87,';

  const isTouch = window.matchMedia('(hover: none)').matches;

  // Wire a canvas: hover-gated on desktop, IntersectionObserver on mobile
  function hoverGate(canvas, startFn) {
    const card = canvas.closest('.bcard');
    if (!card) return;
    let raf = null;
    const stop = () => {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    };
    const start = () => { if (!raf) raf = startFn(() => { raf = null; }); };

    if (isTouch) {
      const io = new IntersectionObserver(entries => {
        entries[0].isIntersecting ? start() : stop();
      }, { threshold: 0.35 });
      io.observe(card);
    } else {
      card.addEventListener('mouseenter', start);
      card.addEventListener('mouseleave', stop);
    }
  }

  /* ── 1. NEURAL NETWORK (AI Voice Agents) ── */
  (function() {
    const canvas = document.getElementById('bc-nn');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, nodes, edges, pulses;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      build();
    }
    function build() {
      nodes = []; edges = []; pulses = [];
      for (let i = 0; i < 18; i++) {
        nodes.push({ x: Math.random()*W, y: Math.random()*H, vx:(Math.random()-0.5)*0.22, vy:(Math.random()-0.5)*0.22, r:Math.random()*1.8+1, alpha:Math.random()*0.4+0.3 });
      }
      rebuildEdges();
    }
    function rebuildEdges() {
      edges = [];
      const thresh = Math.min(W,H)*0.42;
      for (let i = 0; i < nodes.length; i++)
        for (let j = i+1; j < nodes.length; j++) {
          const dx=nodes[i].x-nodes[j].x, dy=nodes[i].y-nodes[j].y;
          if (Math.sqrt(dx*dx+dy*dy) < thresh) edges.push([i,j]);
        }
    }

    resize();
    new ResizeObserver(resize).observe(canvas);

    hoverGate(canvas, (done) => {
      build();
      let raf;
      function draw() {
        ctx.clearRect(0,0,W,H);
        edges.forEach(([i,j]) => {
          const dx=nodes[i].x-nodes[j].x, dy=nodes[i].y-nodes[j].y;
          const a = Math.max(0, 0.18-Math.sqrt(dx*dx+dy*dy)/(Math.min(W,H)*2.5));
          ctx.beginPath(); ctx.moveTo(nodes[i].x,nodes[i].y); ctx.lineTo(nodes[j].x,nodes[j].y);
          ctx.strokeStyle=AC+a+')'; ctx.lineWidth=0.7; ctx.stroke();
        });
        pulses = pulses.filter(p => {
          p.t += p.speed; if (p.t>=1) return false;
          const nx=nodes[p.a].x+(nodes[p.b].x-nodes[p.a].x)*p.t, ny=nodes[p.a].y+(nodes[p.b].y-nodes[p.a].y)*p.t;
          const g=ctx.createRadialGradient(nx,ny,0,nx,ny,5);
          g.addColorStop(0,AC+'0.9)'); g.addColorStop(1,AC+'0)');
          ctx.beginPath(); ctx.arc(nx,ny,5,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
          return true;
        });
        nodes.forEach(n => {
          ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fillStyle=AC+n.alpha+')'; ctx.fill();
          n.x+=n.vx; n.y+=n.vy;
          if(n.x<0||n.x>W) n.vx*=-1; if(n.y<0||n.y>H) n.vy*=-1;
        });
        if (Math.random()<0.04 && edges.length) {
          const e=edges[Math.floor(Math.random()*edges.length)];
          pulses.push({a:e[0],b:e[1],t:0,speed:Math.random()*0.008+0.006});
        }
        raf = requestAnimationFrame(draw);
        return raf;
      }
      raf = draw(); return raf;
    });
  })();

  /* ── 2. WAVEFORM EQ (Call Handling) ── */
  (function() {
    const canvas = document.getElementById('bc-wave');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H; const BAR_COUNT = 32;
    function resize() { W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight; }
    resize(); new ResizeObserver(resize).observe(canvas);

    hoverGate(canvas, (done) => {
      let t = 0, raf;
      function draw() {
        ctx.clearRect(0,0,W,H); t+=0.022;
        const gap=4, barW=(W-gap*(BAR_COUNT-1))/BAR_COUNT, maxH=H*0.55, baseY=H*0.72;
        for (let i=0; i<BAR_COUNT; i++) {
          const ph=i*0.42+t;
          const h=maxH*(0.35+0.30*Math.sin(ph)+0.20*Math.sin(ph*2.1+1.3)+0.15*Math.sin(ph*3.7+2.0));
          const x=i*(barW+gap), a=0.18+0.35*(h/maxH);
          const g=ctx.createLinearGradient(0,baseY-h,0,baseY);
          g.addColorStop(0,AC+(a+0.3)+')'); g.addColorStop(1,AC+'0.04)');
          ctx.fillStyle=g; ctx.beginPath(); ctx.roundRect(x,baseY-h,barW,h,2); ctx.fill();
        }
        raf=requestAnimationFrame(draw); return raf;
      }
      raf=draw(); return raf;
    });
  })();

  /* ── 3. ANIMATED LINE CHART (Workflow Orchestration) ── */
  (function() {
    const canvas = document.getElementById('bc-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H; const POINTS=[0.58,0.42,0.65,0.38,0.55,0.28,0.45,0.20,0.32,0.12,0.22,0.06];
    function resize() { W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight; }
    function getY(v) { return H*0.78-v*H*0.55; }
    function getX(i) { return W*0.08+i*(W*0.84/(POINTS.length-1)); }
    resize(); new ResizeObserver(resize).observe(canvas);

    hoverGate(canvas, (done) => {
      let phase=0, progress=0, raf;
      function draw() {
        ctx.clearRect(0,0,W,H); phase+=0.008;
        if (phase<Math.PI) progress=(1-Math.cos(phase))/2;
        else if (phase<Math.PI*1.8) progress=1;
        else { progress=0; phase=0; }
        const total=POINTS.length-1, drawn=progress*total, fullIdx=Math.floor(drawn), frac=drawn-fullIdx;
        for (let g=0;g<4;g++) {
          const gy=H*0.18+g*H*0.18;
          ctx.beginPath(); ctx.moveTo(W*0.08,gy); ctx.lineTo(W*0.92,gy);
          ctx.strokeStyle='rgba(245,240,235,0.05)'; ctx.lineWidth=1; ctx.stroke();
        }
        if (fullIdx>=1) {
          ctx.beginPath(); ctx.moveTo(getX(0),H*0.78); ctx.lineTo(getX(0),getY(POINTS[0]));
          for (let i=1;i<=Math.min(fullIdx,total);i++) ctx.lineTo(getX(i),getY(POINTS[i]));
          if (fullIdx<total) { const px=getX(fullIdx)+frac*(getX(fullIdx+1)-getX(fullIdx)), py=getY(POINTS[fullIdx])+frac*(getY(POINTS[fullIdx+1])-getY(POINTS[fullIdx])); ctx.lineTo(px,py); }
          ctx.lineTo(getX(Math.min(fullIdx,total)),H*0.78); ctx.closePath();
          const fill=ctx.createLinearGradient(0,0,0,H); fill.addColorStop(0,AC+'0.15)'); fill.addColorStop(1,AC+'0)');
          ctx.fillStyle=fill; ctx.fill();
          ctx.beginPath(); ctx.moveTo(getX(0),getY(POINTS[0]));
          for (let i=1;i<=Math.min(fullIdx,total);i++) ctx.lineTo(getX(i),getY(POINTS[i]));
          if (fullIdx<total) { const px=getX(fullIdx)+frac*(getX(fullIdx+1)-getX(fullIdx)), py=getY(POINTS[fullIdx])+frac*(getY(POINTS[fullIdx+1])-getY(POINTS[fullIdx])); ctx.lineTo(px,py); }
          ctx.strokeStyle=AC+'0.7)'; ctx.lineWidth=1.5; ctx.lineJoin='round'; ctx.stroke();
          for (let i=0;i<=Math.min(fullIdx,total);i++) { ctx.beginPath(); ctx.arc(getX(i),getY(POINTS[i]),3,0,Math.PI*2); ctx.fillStyle=AC+'0.85)'; ctx.fill(); }
        }
        raf=requestAnimationFrame(draw); return raf;
      }
      raf=draw(); return raf;
    });
  })();

  /* ── 4. PIPELINE FLOW (CRM, Calendar & Dispatch Integrations) ── */
  (function() {
    const canvas = document.getElementById('bc-flow');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, nodes2, edges2;
    function resize() {
      W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight;
      const rows=3,cols=4; nodes2=[]; edges2=[];
      for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) nodes2.push({x:W*(0.14+c*0.24),y:H*(0.25+r*0.24)});
      for(let r=0;r<rows;r++) for(let c=0;c<cols-1;c++) edges2.push([r*cols+c,r*cols+c+1]);
      for(let r=0;r<rows-1;r++) { edges2.push([r*cols+1,(r+1)*cols+2]); edges2.push([r*cols+3,(r+1)*cols+3]); }
    }
    resize(); new ResizeObserver(resize).observe(canvas);

    hoverGate(canvas, (done) => {
      let t=0, packets=[], raf;
      function draw() {
        ctx.clearRect(0,0,W,H); t+=0.016;
        ctx.setLineDash([3,5]); ctx.lineDashOffset=-t*18;
        edges2.forEach(([i,j]) => {
          ctx.beginPath(); ctx.moveTo(nodes2[i].x,nodes2[i].y); ctx.lineTo(nodes2[j].x,nodes2[j].y);
          ctx.strokeStyle=AC+'0.18)'; ctx.lineWidth=1; ctx.stroke();
        });
        ctx.setLineDash([]);
        nodes2.forEach(n => {
          ctx.beginPath(); ctx.arc(n.x,n.y,4.5,0,Math.PI*2); ctx.fillStyle=AC+'0.22)'; ctx.fill();
          ctx.beginPath(); ctx.arc(n.x,n.y,2,0,Math.PI*2); ctx.fillStyle=AC+'0.6)'; ctx.fill();
        });
        packets=packets.filter(p => {
          p.t+=p.speed; if(p.t>=1) return false;
          const nx=nodes2[p.a].x+(nodes2[p.b].x-nodes2[p.a].x)*p.t, ny=nodes2[p.a].y+(nodes2[p.b].y-nodes2[p.a].y)*p.t;
          const g=ctx.createRadialGradient(nx,ny,0,nx,ny,7); g.addColorStop(0,AC+'1)'); g.addColorStop(1,AC+'0)');
          ctx.beginPath(); ctx.arc(nx,ny,7,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
          return true;
        });
        if(Math.random()<0.06&&edges2.length){const e=edges2[Math.floor(Math.random()*edges2.length)];packets.push({a:e[0],b:e[1],t:0,speed:Math.random()*0.012+0.008});}
        raf=requestAnimationFrame(draw); return raf;
      }
      raf=draw(); return raf;
    });
  })();

  /* ── 5. MONITOR / SCAN (Monitoring & Multi-Location Ops) ── */
  (function() {
    const canvas = document.getElementById('bc-scan');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, grain=[];
    function resize() {
      W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight;
      grain=[]; for(let i=0;i<60;i++) grain.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*0.8+0.2,a:Math.random()*0.25});
    }
    resize(); new ResizeObserver(resize).observe(canvas);

    hoverGate(canvas, (done) => {
      let scanY=0, blink=0, raf;
      function draw() {
        ctx.clearRect(0,0,W,H); blink++; scanY=(scanY+0.8)%H;
        const vig=ctx.createRadialGradient(W/2,H/2,H*0.1,W/2,H/2,H*0.7);
        vig.addColorStop(0,'transparent'); vig.addColorStop(1,'rgba(28,25,23,0.45)');
        ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
        const sg=ctx.createLinearGradient(0,scanY-22,0,scanY+8);
        sg.addColorStop(0,AC+'0)'); sg.addColorStop(0.5,AC+'0.18)'); sg.addColorStop(1,AC+'0)');
        ctx.fillStyle=sg; ctx.fillRect(0,scanY-22,W,30);
        const bx=W*0.08,by=H*0.10,bw=W*0.84,bh=H*0.80,arm=Math.min(W,H)*0.09;
        ctx.strokeStyle=AC+'0.55)'; ctx.lineWidth=1.5;
        [[[bx,by+arm],[bx,by],[bx+arm,by]],[[bx+bw-arm,by],[bx+bw,by],[bx+bw,by+arm]],
         [[bx,by+bh-arm],[bx,by+bh],[bx+arm,by+bh]],[[bx+bw-arm,by+bh],[bx+bw,by+bh],[bx+bw,by+bh-arm]]
        ].forEach(pts=>{ctx.beginPath();pts.forEach(([x,y],i)=>i===0?ctx.moveTo(x,y):ctx.lineTo(x,y));ctx.stroke();});
        const recOn=Math.floor(blink/35)%2===0;
        if(recOn){ctx.beginPath();ctx.arc(bx+arm*0.5,by+arm*0.55,3.5,0,Math.PI*2);ctx.fillStyle=AC+'0.9)';ctx.fill();}
        ctx.font=`500 9px var(--sans)`;ctx.fillStyle=AC+(recOn?'0.7)':'0.3)');ctx.fillText('LIVE',bx+arm*0.5+8,by+arm*0.55+3.5);
        const fr=Math.floor(blink*0.6)%24,sc=Math.floor(blink*0.6/24)%60;
        ctx.font=`300 8px var(--sans)`;ctx.fillStyle=AC+'0.35)';
        ctx.fillText(`UPTIME 00:${String(sc).padStart(2,'0')}:${String(fr).padStart(2,'0')}`,bx+bw-96,by+arm*0.55+3.5);
        grain.forEach(g=>{g.x=(g.x+(Math.random()-0.5)*1.5+W)%W;g.y=(g.y+(Math.random()-0.5)*1.5+H)%H;ctx.beginPath();ctx.arc(g.x,g.y,g.r,0,Math.PI*2);ctx.fillStyle=`rgba(245,240,235,${g.a*0.6})`;ctx.fill();});
        raf=requestAnimationFrame(draw); return raf;
      }
      raf=draw(); return raf;
    });
  })();
})();

// ── CURSOR TRAIL ─────────────────────────────────────────────
(function() {
  if (window.matchMedia('(hover: none)').matches) return;
  const TRAIL_COUNT = 5;
  const trails = Array.from({ length: TRAIL_COUNT }, (_, i) => {
    const el = document.createElement('div');
    el.className = 'c-trail';
    const size = 5 - i * 0.6;
    el.style.cssText = `width:${size}px;height:${size}px;`;
    document.body.appendChild(el);
    return { el, x: 0, y: 0, lag: 0.08 + i * 0.04 };
  });
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function tick() {
    trails.forEach((t, i) => {
      const prev = i === 0 ? { x: mx, y: my } : trails[i - 1];
      t.x += (prev.x - t.x) * t.lag;
      t.y += (prev.y - t.y) * t.lag;
      t.el.style.left  = t.x + 'px';
      t.el.style.top   = t.y + 'px';
      t.el.style.opacity = Math.max(0, 0.35 - i * 0.07);
    });
    requestAnimationFrame(tick);
  })();
})();

// ── TOUCH RIPPLE ─────────────────────────────────────────────
(function() {
  if (!window.matchMedia('(hover: none)').matches) return;
  document.addEventListener('touchstart', e => {
    const t = e.touches[0];
    const el = document.createElement('div');
    el.className = 't-ripple';
    el.style.left = t.clientX + 'px';
    el.style.top  = t.clientY + 'px';
    el.style.width = el.style.height = '28px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 750);
  }, { passive: true });
})();

// ── STATS COUNTER ─────────────────────────────────────────────
(function() {
  const statEls = document.querySelectorAll('.stat-n');
  function animCounter(el) {
    const raw = el.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').trim();
    const m = raw.match(/^([\d,.]+)([^\d]*)$/);
    if (!m) return;
    const num = parseFloat(m[1].replace(/,/g, ''));
    const suffix = m[2] || '';
    if (!num) return;
    const isMillions = num >= 1000000;
    const isThousands = !isMillions && num >= 1000;
    const format = v => {
      if (isMillions)   return Math.round(v / 1000000) + 'M';
      if (isThousands)  return Math.round(v / 1000) + 'K';
      return Math.round(v).toString();
    };
    const dur = 1600, start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = format(num * ease) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = format(num) + suffix;
    })(start);
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      animCounter(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.7 });
  statEls.forEach(el => io.observe(el));
})();

// ── HERO VISUAL LOAD ─────────────────────────────────────────
(function() {
  const img = document.getElementById('hero-visual-img');
  if (!img) return;
  const show = () => img.classList.add('vis');
  if (img.complete && img.naturalWidth) show();
  else img.addEventListener('load', show);
  img.addEventListener('error', () => { img.style.display = 'none'; });
})();

// ── FOUNDER CANVAS — gravity orbit ────────────────────────────
(function() {
  function initFounderCanvas(canvasId, panelSel) {
    const canvas = document.getElementById(canvasId);
    const panel  = document.querySelector(panelSel);
    if (!canvas || !panel) return;
    const ctx = canvas.getContext('2d');
    let W, H, pts = [], mx = -9999, my = -9999, raf = null;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    new ResizeObserver(resize).observe(canvas);

    function spawn() {
      pts = Array.from({ length: 48 }, () => {
        const a = Math.random() * Math.PI * 2, spd = Math.random() * 0.22 + 0.05;
        return { x: Math.random() * W, y: Math.random() * H,
                 vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
                 r: Math.random() * 1.4 + 0.5,
                 alpha: Math.random() * 0.18 + 0.07 };
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const live = mx > -999;

      /* ── Cursor glow ── */
      if (live) {
        const cg = ctx.createRadialGradient(mx, my, 0, mx, my, 170);
        cg.addColorStop(0, 'rgba(217,119,87,0.14)');
        cg.addColorStop(1, 'rgba(217,119,87,0)');
        ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H);
      }

      const GRAV = 210;
      /* ── Orbiting particles near cursor ── */
      const orbiters = live ? pts.filter(p => {
        const dx = p.x - mx, dy = p.y - my;
        return dx * dx + dy * dy < GRAV * GRAV;
      }) : [];

      /* ── Web: orbiter ↔ orbiter lines ── */
      orbiters.forEach((a, i) => {
        orbiters.slice(i + 1).forEach(b => {
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 140) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(217,119,87,${(1 - d / 140) * 0.18})`;
            ctx.lineWidth = 0.75; ctx.stroke();
          }
        });
        /* Thread from cursor to each orbiter */
        const dx = a.x - mx, dy = a.y - my;
        const d  = Math.sqrt(dx * dx + dy * dy);
        ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(a.x, a.y);
        ctx.strokeStyle = `rgba(217,119,87,${(1 - d / GRAV) * 0.10})`;
        ctx.lineWidth = 0.5; ctx.stroke();
      });

      /* ── Update + draw each particle ── */
      pts.forEach(p => {
        if (live) {
          const dx = mx - p.x, dy = my - p.y;
          const d2 = dx * dx + dy * dy;
          const d  = Math.sqrt(d2);

          if (d < GRAV && d > 1) {
            /* Gravity toward cursor */
            const gs = (1 - d / GRAV) * 0.030;
            p.vx += (dx / d) * gs;
            p.vy += (dy / d) * gs;
            /* Tangential force → elliptical orbit */
            const ts = (1 - d / GRAV) * 0.022;
            p.vx += (-dy / d) * ts;
            p.vy += ( dx / d) * ts;
          }
        }

        p.vx += (Math.random() - 0.5) * 0.005;
        p.vy += (Math.random() - 0.5) * 0.005;
        p.vx *= 0.952; p.vy *= 0.952;
        p.x  += p.vx;  p.y  += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        const d    = live ? Math.sqrt((p.x - mx) ** 2 + (p.y - my) ** 2) : 999;
        const prox = Math.max(0, 1 - d / GRAV);
        const a    = p.alpha + prox * 0.55;
        const r    = p.r    + prox * 2.2;

        /* Glow halo for orbiting particles */
        if (prox > 0.25) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4.5);
          g.addColorStop(0, `rgba(217,119,87,${prox * 0.28})`);
          g.addColorStop(1, 'rgba(217,119,87,0)');
          ctx.beginPath(); ctx.arc(p.x, p.y, r * 4.5, 0, Math.PI * 2);
          ctx.fillStyle = g; ctx.fill();
        }

        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(217,119,87,${a})`; ctx.fill();
      });

      /* ── Centre dot at cursor ── */
      if (live) {
        ctx.beginPath(); ctx.arc(mx, my, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(217,119,87,0.65)'; ctx.fill();
        ctx.beginPath(); ctx.arc(mx, my, 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(217,119,87,0.20)'; ctx.lineWidth = 1; ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    }

    panel.addEventListener('mouseenter', () => { spawn(); if (!raf) draw(); });
    panel.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
    });
    panel.addEventListener('mouseleave', () => {
      mx = -9999; my = -9999;
      cancelAnimationFrame(raf); raf = null;
      ctx.clearRect(0, 0, W, H);
    });
  }

  initFounderCanvas('fc-krish',  '.fp-left');
  initFounderCanvas('fc-kartik', '.fp-right');
})();

})(); // end IIFE
