/**
 * AIM Media — Static Page Generator
 *
 * Assembles every route from a shared head/nav/footer/chrome template plus
 * per-page body content defined below, and writes the result as static
 * index.html files (clean-URL folder structure) so the site works as plain
 * static HTML on Vercel with zero server-side dependency.
 *
 * Run: node scripts/build-pages.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const EMAIL = 'kaushikkrish831@gmail.com';
const YEAR = new Date().getFullYear();

// ── NAV DATA ─────────────────────────────────────────────────────
const SERVICES_SUB = [
  { key: 'svd',  href: '/services/voice-system-design',       label: 'Voice System Design' },
  { key: 'iaas', href: '/services/infra-as-a-service',         label: 'Infra-as-a-Service' },
  { key: 'mvo',  href: '/services/managed-voice-operations',   label: 'Managed Voice Operations' },
];
const USECASE_SUB = [
  { key: 'front-desk',        href: '/use-cases/front-desk',        label: 'Front Desk' },
  { key: 'customer-support',  href: '/use-cases/customer-support',  label: 'Customer Support' },
  { key: 'intake',            href: '/use-cases/intake',            label: 'Intake' },
  { key: 'call-center',       href: '/use-cases/call-center',       label: 'Call Center' },
];
const SERVICES_KEYS = SERVICES_SUB.map(s => s.key);
const USECASE_KEYS  = USECASE_SUB.map(s => s.key);

function cls(key, current, extra) {
  const c = (extra ? extra + ' ' : '') + (key === current ? 'active' : '');
  return c.trim() ? ` class="${c.trim()}"` : '';
}

function renderNav(current) {
  const svcOpen = SERVICES_KEYS.includes(current);
  const ucOpen  = USECASE_KEYS.includes(current);
  return `
<!-- ── NAV ────────────────────────────────────────────── -->
<nav id="nav">
  <a href="/" class="nav-logo">AIM Media</a>
  <ul class="nav-links">
    <li><a href="/"${cls('home', current)}>Home</a></li>
    <li class="nav-drop">
      <a href="/services/voice-system-design" class="nav-drop-trigger${svcOpen ? ' active' : ''}">Services</a>
      <ul class="nav-drop-menu">
        ${SERVICES_SUB.map(s => `<li><a href="${s.href}"${cls(s.key, current)}>${s.label}</a></li>`).join('\n        ')}
      </ul>
    </li>
    <li class="nav-drop">
      <a href="/use-cases/front-desk" class="nav-drop-trigger${ucOpen ? ' active' : ''}">Use Cases</a>
      <ul class="nav-drop-menu">
        ${USECASE_SUB.map(s => `<li><a href="${s.href}"${cls(s.key, current)}>${s.label}</a></li>`).join('\n        ')}
      </ul>
    </li>
    <li><a href="/demos"${cls('demos', current)}>Demos</a></li>
    <li><a href="/pricing"${cls('pricing', current)}>Pricing</a></li>
    <li><a href="/resources/process"${cls('process', current)}>Process</a></li>
    <li><a href="/resources/about"${cls('about', current)}>About</a></li>
    <li><a href="mailto:${EMAIL}">Contact</a></li>
  </ul>
  <div class="mode-btn" id="mode-btn" role="button" tabindex="0" aria-label="Explore industry modes" aria-haspopup="listbox" aria-expanded="false">
    <span class="mode-label-txt">MODES</span>
    <span class="mode-btn-chev"><svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 3L4.5 6L7.5 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    <div class="mode-dropdown" id="mode-dropdown" role="listbox">
      <div class="mode-opt" data-mode="realtor" role="option"><span class="mode-dot" style="background:#3D6CC0"></span>Real Estate</div>
      <div class="mode-opt" data-mode="cafe" role="option"><span class="mode-dot" style="background:#D4956A"></span>Hospitality</div>
      <div class="mode-opt" data-mode="corporate" role="option"><span class="mode-dot" style="background:#4A9EDB"></span>Enterprise</div>
      <div class="mode-opt" data-mode="dealership" role="option"><span class="mode-dot" style="background:#C0C0C0"></span>Dealership</div>
    </div>
  </div>
  <button id="nav-burger" class="nav-burger" aria-label="Open menu" aria-expanded="false" aria-controls="nav-mobile">
    <span></span><span></span><span></span>
  </button>
</nav>

<div id="nav-mobile" class="nav-mobile" aria-hidden="true">
  <a href="/"${cls('home', current)}>Home</a>
  <div class="nav-mobile-group-label">Services</div>
  <div class="nav-mobile-sub">
    ${SERVICES_SUB.map(s => `<a href="${s.href}"${cls(s.key, current)}>${s.label}</a>`).join('\n    ')}
  </div>
  <div class="nav-mobile-group-label">Use Cases</div>
  <div class="nav-mobile-sub">
    ${USECASE_SUB.map(s => `<a href="${s.href}"${cls(s.key, current)}>${s.label}</a>`).join('\n    ')}
  </div>
  <a href="/demos"${cls('demos', current)}>Demos</a>
  <a href="/pricing"${cls('pricing', current)}>Pricing</a>
  <a href="/resources/process"${cls('process', current)}>Process</a>
  <a href="/resources/about"${cls('about', current)}>About</a>
  <a href="mailto:${EMAIL}">Contact</a>
</div>`;
}

function renderFooter() {
  return `
<!-- ── FOOTER ──────────────────────────────────────────── -->
<footer>
  <div class="ft-top">
    <div class="ft-brand">
      <div class="ft-logo">AIM Media</div>
      <div class="ft-tag">"Intelligence. Automated."</div>
      <div class="ft-r" style="text-align:left"><a href="mailto:${EMAIL}">${EMAIL}</a></div>
    </div>
    <div class="ft-sitemap">
      <div class="ft-col">
        <div class="ft-col-title">Site</div>
        <a href="/">Home</a>
        <a href="/demos">Demos</a>
        <a href="/pricing">Pricing</a>
      </div>
      <div class="ft-col">
        <div class="ft-col-title">Services</div>
        ${SERVICES_SUB.map(s => `<a href="${s.href}">${s.label}</a>`).join('\n        ')}
      </div>
      <div class="ft-col">
        <div class="ft-col-title">Use Cases</div>
        ${USECASE_SUB.map(s => `<a href="${s.href}">${s.label}</a>`).join('\n        ')}
      </div>
      <div class="ft-col">
        <div class="ft-col-title">Company</div>
        <a href="/resources/about">About</a>
        <a href="/resources/process">Process</a>
        <a href="/resources/vision">Vision</a>
        <a href="mailto:${EMAIL}">Contact</a>
      </div>
    </div>
  </div>
  <div class="ft-bottom">
    <span>&copy; ${YEAR} AIM Media. All rights reserved.</span>
    <div class="ft-legal-links">
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </div>
  </div>
</footer>

<div id="spotlight" aria-hidden="true"></div>

<!-- ── EXPANDING CARD MODAL ────────────────────────────────── -->
<div id="cs-modal" aria-hidden="true" role="dialog" aria-modal="true">
  <button id="cs-close" aria-label="Close">✕</button>
  <div id="cs-m-bg"></div>
  <div class="cs-m-ov"></div>
  <div class="cs-m-body">
    <div class="cs-m-tag-el" id="cs-m-tag"></div>
    <div class="cs-m-name-el" id="cs-m-name"><span></span></div>
    <div class="cs-m-result-el" id="cs-m-result"></div>
  </div>
  <div class="cs-m-swipe">↓ swipe down to close</div>
</div>

<!-- ── CINEMATIC FLASH ────────────────────────────────────── -->
<div id="mode-flash"></div>

<!-- ── INDUSTRY MODE OVERLAY ────────────────────────────── -->
<div id="mode-overlay" data-mode="">
  <canvas id="mode-canvas"></canvas>
  <div class="mode-vignette"></div>
  <div class="mode-topbar">
    <div class="mode-topbar-logo">AIM Media</div>
    <div class="mode-badge-lbl" id="mode-badge-lbl"></div>
    <button class="mode-exit-btn" id="mode-exit-btn">✕ EXIT</button>
  </div>
  <div class="mode-hud-hl" id="mode-hud-hl">
    <div class="mode-eyebrow" id="mode-eyebrow"></div>
    <h2 class="mode-headline" id="mode-headline"></h2>
    <ul class="mode-svcs" id="mode-svcs"></ul>
  </div>
  <div class="mode-hud-case" id="mode-hud-case">
    <div class="mode-case">
      <div class="mode-case-tag" id="mode-case-tag"></div>
      <div class="mode-case-stat" id="mode-case-stat"></div>
      <div class="mode-case-name" id="mode-case-name"></div>
      <div class="mode-case-desc" id="mode-case-desc"></div>
    </div>
  </div>
  <div class="mode-hint">Move cursor to explore</div>
</div>`;
}

function renderHead(title, desc) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${desc}" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="/assets/css/site.css" />

  <!-- GSAP ecosystem -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <!-- Lenis smooth scroll -->
  <script src="https://unpkg.com/lenis@1.1.14/dist/lenis.min.js"></script>
  <!-- Three.js — loaded eagerly so mode scenes are always ready -->
  <script src="https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/loaders/GLTFLoader.js"></script>
</head>`;
}

function renderChromeTop() {
  return `
<!-- ── GRAIN ──────────────────────────────────────────── -->
<div class="grain" aria-hidden="true"></div>

<!-- ── PROGRESS ───────────────────────────────────────── -->
<div id="progress" aria-hidden="true"></div>

<!-- ── PRELOADER ──────────────────────────────────────── -->
<div id="preloader" aria-hidden="true">
  <div class="pre-wordmark">
    <span class="pre-char" style="animation-delay:0.0s">A</span>
    <span class="pre-char" style="animation-delay:0.08s">I</span>
    <span class="pre-char" style="animation-delay:0.16s">M</span>
    <span class="pre-char space" style="animation-delay:0.24s">&nbsp;</span>
    <span class="pre-char" style="animation-delay:0.30s">M</span>
    <span class="pre-char" style="animation-delay:0.38s">E</span>
    <span class="pre-char" style="animation-delay:0.46s">D</span>
    <span class="pre-char" style="animation-delay:0.54s">I</span>
    <span class="pre-char" style="animation-delay:0.62s">A</span>
  </div>
  <div class="pre-tagline">Intelligence. Automated.</div>
  <div class="pre-line"></div>
</div>

<!-- ── CURSOR ─────────────────────────────────────────── -->
<div id="cursor" aria-hidden="true"></div>
<div id="cursor-ring" aria-hidden="true"></div>

<!-- ── SOUND TOGGLE ───────────────────────────────────── -->
<button id="sound-btn" aria-label="Toggle sound">🔇</button>`;
}

function renderScripts() {
  return `
<script src="/assets/js/core.js"></script>
<script src="/assets/js/modes.js"></script>`;
}

function page({ file, navKey, title, desc, body }) {
  const html = `${renderHead(title, desc)}
<body>
${renderChromeTop()}
${renderNav(navKey)}
${body}
${renderFooter()}
${renderScripts()}
</body>
</html>
`;
  const outPath = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log('  ✓ ' + file);
}

// ── SHARED FRAGMENTS ──────────────────────────────────────────────

function innerHero({ crumbLabel, bgNum, eyebrow, h1a, h1b, sub, cta, tight }) {
  return `
<!-- ── HERO ───────────────────────────────────────────── -->
<section id="hero" class="hero-inner${tight ? ' hero-tight' : ''}">
  <canvas id="particles" aria-hidden="true"></canvas>
  <div class="hero-bg" aria-hidden="true"></div>
  <div class="hero-vignette" aria-hidden="true"></div>
  <div class="hero-bg-num" aria-hidden="true">${bgNum}</div>
  <div class="hero-content">
    <div class="crumb"><a href="/">Home</a><span>/</span><span>${crumbLabel}</span></div>
    <div class="hero-eyebrow">${eyebrow}</div>
    <h1 class="hero-headline">
      <span class="hero-line hero-line-italic"><span>${h1a}</span></span>
      <span class="hero-line hero-line-bold"><span>${h1b}</span></span>
    </h1>
    <p class="hero-sub">${sub}</p>
    ${cta ? `<div class="hero-cta">${cta}</div>` : ''}
  </div>
</section>`;
}

function ctaSection({ eyebrow, h1, sub, btn }) {
  return `
<!-- ── CTA ─────────────────────────────────────────────── -->
<section id="cta">
  <div class="cta-orb-1" aria-hidden="true"></div>
  <div class="cta-orb-2" aria-hidden="true"></div>
  <div class="cta-inner">
    <div class="cta-eye rev">${eyebrow}</div>
    <h2 class="cta-headline rev">${h1}</h2>
    <p class="cta-sub rev">${sub}</p>
    <a href="mailto:${EMAIL}" class="btn-primary rev">${btn || 'Design Your Voice System →'}</a>
  </div>
</section>`;
}

function useCaseBody({ hero, challenge, augment, tasks, integrations, scenarios, impact, cta }) {
  return `
${innerHero(hero)}

<section class="sect">
  <div class="container">
    <div class="s-tag rev">The Operational Challenge</div>
    <h2 class="s-title rev" style="margin-bottom:1.5rem">${challenge.title}</h2>
    <p class="sect-lead rev">${challenge.body}</p>
  </div>
</section>

<section class="sect">
  <div class="container">
    <div class="s-tag rev">How AI Voice Augments Your Team</div>
    <h2 class="s-title rev" style="margin-bottom:1.5rem">${augment.title}</h2>
    <p class="sect-lead rev">${augment.body}</p>
  </div>
</section>

<section class="sect">
  <div class="container">
    <div class="s-tag rev">What The AI Handles</div>
    <h2 class="s-title rev" style="margin-bottom:1.5rem">${tasks.title}</h2>
    <div class="chk-grid rev">
      ${tasks.items.map(t => `<div class="chk-item"><div class="chk-mark">✓</div><div class="chk-text"><strong>${t[0]}</strong> — ${t[1]}</div></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="sect">
  <div class="container">
    <div class="s-tag rev">Integrations</div>
    <h2 class="s-title rev" style="margin-bottom:1.5rem">${integrations.title}</h2>
    <div class="chip-row rev">
      ${integrations.items.map(i => `<span class="chip">${i}</span>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="sect">
  <div class="container">
    <div class="s-tag rev">Common Deployment Scenarios</div>
    <h2 class="s-title rev" style="margin-bottom:1.5rem">${scenarios.title}</h2>
    <div class="num-list rev">
      ${scenarios.items.map((s, i) => `<div class="num-item"><div class="num-item-n">${String(i + 1).padStart(2, '0')}</div><div><div class="num-item-title">${s[0]}</div><div class="num-item-desc">${s[1]}</div></div></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="sect">
  <div class="container">
    <div class="s-tag rev">Business Impact</div>
    <h2 class="s-title rev" style="margin-bottom:1.5rem">${impact.title}</h2>
    <p class="sect-lead rev">${impact.body}</p>
  </div>
</section>

${ctaSection(cta)}
`;
}

function servicePageBody({ hero, intro, coverage, quote, secondary, cta }) {
  return `
${innerHero(hero)}

<section class="sect">
  <div class="container">
    <div class="s-tag rev">Overview</div>
    <h2 class="s-title rev" style="margin-bottom:1.5rem">${intro.title}</h2>
    <p class="sect-lead rev">${intro.body}</p>
  </div>
</section>

<section class="sect">
  <div class="container">
    <div class="s-tag rev">What's Covered</div>
    <h2 class="s-title rev" style="margin-bottom:1.5rem">${coverage.title}</h2>
    <div class="chk-grid rev">
      ${coverage.items.map(t => `<div class="chk-item"><div class="chk-mark">✓</div><div class="chk-text"><strong>${t[0]}</strong> — ${t[1]}</div></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="sect">
  <div class="container">
    <div class="about-quote rev" style="max-width:820px;font-size:1.35rem">${quote}</div>
  </div>
</section>

<section class="sect">
  <div class="container">
    <div class="s-tag rev">${secondary.tag}</div>
    <h2 class="s-title rev" style="margin-bottom:1.5rem">${secondary.title}</h2>
    <p class="sect-lead rev">${secondary.body}</p>
  </div>
</section>

${ctaSection(cta)}
`;
}

// ═══════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════

// ── HOME ──────────────────────────────────────────────────────────
page({
  file: 'index.html',
  navKey: 'home',
  title: 'AIM Media — AI Voice Infrastructure · Managed Operations',
  desc: 'AIM Media designs, deploys, and manages AI voice systems for businesses that run on calls — answering, qualifying, scheduling, routing, and following up inside the tools your team already uses.',
  body: `
<!-- ── HERO ───────────────────────────────────────────── -->
<section id="hero">
  <video id="hero-video" autoplay muted loop playsinline preload="auto">
    <source src="/assets/hero.mp4" type="video/mp4" />
  </video>
  <canvas id="particles" aria-hidden="true"></canvas>
  <div class="hero-bg" aria-hidden="true"></div>
  <div class="hero-visual-wrap" aria-hidden="true">
    <img class="hero-visual-img" id="hero-visual-img" src="/assets/hero-right.jpg" alt="" />
  </div>
  <div class="hero-vignette" aria-hidden="true"></div>
  <div class="hero-bg-num" aria-hidden="true">AI</div>

  <div class="hero-content">
    <div class="hero-eyebrow">AI Voice Infrastructure · Managed Operations</div>
    <h1 class="hero-headline">
      <span class="hero-line hero-line-italic"><span>Intelligence.</span></span>
      <span class="hero-line hero-line-bold"><span>Automated.</span></span>
    </h1>
    <p class="hero-sub">AIM Media designs, deploys, and manages AI voice systems for businesses that run on calls. Answer, qualify, schedule, route, and follow up inside the tools your team already uses.</p>
    <div class="hero-cta">
      <a href="mailto:${EMAIL}" class="btn-primary" id="cta-btn-hero">Design Your Voice System →</a>
      <a href="/services/infra-as-a-service" class="btn-ghost">Explore the Infrastructure</a>
    </div>
  </div>

  <div class="hero-scroll">
    <div class="scroll-line"></div>
    <span>Scroll</span>
  </div>
</section>

<!-- ── STATS TICKER ────────────────────────────────────── -->
<div id="stats">
  <div class="ticker-wrap">
    <div class="ticker-row row-1">
      <div class="t-item"><span class="t-num">24/7</span><span class="t-lbl">Call Coverage</span></div>
      <div class="t-item"><span class="t-num">Every Call</span><span class="t-lbl">Structured Capture</span></div>
      <div class="t-item"><span class="t-num">One Layer</span><span class="t-lbl">Voice + CRM + Calendar</span></div>
      <div class="t-item"><span class="t-num">Managed</span><span class="t-lbl">Monitor + Improve</span></div>
      <div class="t-item"><span class="t-num">Scalable</span><span class="t-lbl">More Volume, No New Headcount</span></div>
      <!-- duplicate for loop -->
      <div class="t-item"><span class="t-num">24/7</span><span class="t-lbl">Call Coverage</span></div>
      <div class="t-item"><span class="t-num">Every Call</span><span class="t-lbl">Structured Capture</span></div>
      <div class="t-item"><span class="t-num">One Layer</span><span class="t-lbl">Voice + CRM + Calendar</span></div>
      <div class="t-item"><span class="t-num">Managed</span><span class="t-lbl">Monitor + Improve</span></div>
      <div class="t-item"><span class="t-num">Scalable</span><span class="t-lbl">More Volume, No New Headcount</span></div>
    </div>
    <div class="ticker-row row-2">
      <div class="t-item"><span class="t-num">AI Voice Agents</span><span class="t-lbl">Core Offering</span></div>
      <div class="t-item"><span class="t-num">Front Desk</span><span class="t-lbl">Use Case</span></div>
      <div class="t-item"><span class="t-num">Customer Support</span><span class="t-lbl">Use Case</span></div>
      <div class="t-item"><span class="t-num">Intake Operations</span><span class="t-lbl">Use Case</span></div>
      <div class="t-item"><span class="t-num">Call Centers</span><span class="t-lbl">Use Case</span></div>
      <div class="t-item"><span class="t-num">CRM Integrations</span><span class="t-lbl">Integration</span></div>
      <div class="t-item"><span class="t-num">Workflow Automation</span><span class="t-lbl">Integration</span></div>
      <!-- duplicate -->
      <div class="t-item"><span class="t-num">AI Voice Agents</span><span class="t-lbl">Core Offering</span></div>
      <div class="t-item"><span class="t-num">Front Desk</span><span class="t-lbl">Use Case</span></div>
      <div class="t-item"><span class="t-num">Customer Support</span><span class="t-lbl">Use Case</span></div>
      <div class="t-item"><span class="t-num">Intake Operations</span><span class="t-lbl">Use Case</span></div>
      <div class="t-item"><span class="t-num">Call Centers</span><span class="t-lbl">Use Case</span></div>
    </div>
  </div>
</div>

<!-- ── PROBLEM ─────────────────────────────────────────── -->
<section id="problem">
  <div class="container">
    <div class="about-grid">
      <div>
        <div class="s-tag rev">The Problem</div>
        <h2 class="s-title rev">Calls are still<br><em>where deals slip.</em></h2>
        <p class="about-text rev" style="margin-top:1.75rem">Every missed call is a customer who called a competitor next. Every inconsistent answer is a caller who got a different experience than the one before them. Manual intake, long hold times, after-hours gaps, and systems that don't talk to each other turn ordinary call volume into lost revenue and daily operational friction.</p>
        <p class="about-text rev">Most call-driven businesses feel this every week — not as one big failure, but as a hundred small ones. A voicemail that doesn't get returned. A lead that sits in a notepad instead of the CRM. A queue that backs up the moment two calls land at once.</p>
        <div class="about-quote rev">"The phone is still the front door for most call-driven businesses. Most of them are leaving it unattended."</div>
      </div>
      <div class="stat-grid rev">
        <div class="stat-card"><div class="stat-n">Missed</div><div class="stat-l">Calls that go to voicemail become calls to a competitor.</div></div>
        <div class="stat-card"><div class="stat-n">Inconsistent</div><div class="stat-l">Every caller gets a different answer, depending on who picks up.</div></div>
        <div class="stat-card"><div class="stat-n">After-Hours</div><div class="stat-l">The phone stops working the moment your team goes home.</div></div>
        <div class="stat-card"><div class="stat-n">Disconnected</div><div class="stat-l">Call notes that never make it into the CRM or the calendar.</div></div>
      </div>
    </div>
  </div>
</section>

<!-- ── SOLUTION ────────────────────────────────────────── -->
<section id="solution" class="sect">
  <div class="container">
    <div class="s-tag rev">The AIM Media Solution</div>
    <h2 class="s-title rev">Managed voice<br><em>infrastructure.</em></h2>
    <p class="sect-lead rev">AIM Media isn't a chatbot vendor and it isn't a piece of software you have to configure yourself. We design, deploy, and manage the AI voice systems that answer, qualify, schedule, route, and follow up on every call — then we operate that infrastructure for you, the same way a utility keeps the lights on.</p>
    <div class="about-quote rev" style="max-width:820px">"We don't sell you a voice agent. We operate your voice infrastructure — design, integrations, monitoring, and improvement, on an ongoing basis."</div>
  </div>
</section>

<!-- ── WHAT WE BUILD ───────────────────────────────────── -->
<section id="build" class="sect">
  <div class="container">
    <div class="s-tag rev">What We Build</div>
    <h2 class="s-title rev" style="margin-bottom:3.5rem">One system.<br><em>Every call handled.</em></h2>
    <div class="bento">
      <div class="bcard rev"><canvas class="bcard-anim" id="bc-nn"></canvas><span class="bcard-icon">☎</span><div class="bcard-num">01</div><div class="bcard-title">AI Voice Agents</div><div class="bcard-desc">Conversational agents that answer inbound calls, qualify the caller, and carry a natural conversation instead of a rigid phone tree.</div></div>
      <div class="bcard rev"><canvas class="bcard-anim" id="bc-wave"></canvas><span class="bcard-icon">📞</span><div class="bcard-num">02</div><div class="bcard-title">Call Handling Automation</div><div class="bcard-desc">Inbound answering, intelligent routing, escalation to a human, and after-hours or overflow coverage built into every deployment.</div></div>
      <div class="bcard rev"><canvas class="bcard-anim" id="bc-flow"></canvas><span class="bcard-icon">🔗</span><div class="bcard-num">03</div><div class="bcard-title">CRM, Calendar &amp; Dispatch Integrations</div><div class="bcard-desc">Every call becomes a structured record across your CRM, calendar, dispatch, ticketing, and notification tools — automatically.</div></div>
      <div class="bcard rev"><canvas class="bcard-anim" id="bc-chart"></canvas><span class="bcard-icon">⚙</span><div class="bcard-num">04</div><div class="bcard-title">Workflow Orchestration</div><div class="bcard-desc">Call outcomes trigger the next action automatically, across the systems your team already runs the business on.</div></div>
      <div class="bcard rev"><canvas class="bcard-anim" id="bc-scan"></canvas><span class="bcard-icon">📡</span><div class="bcard-num">05</div><div class="bcard-title">Monitoring &amp; Multi-Location Operations</div><div class="bcard-desc">Live monitoring and reliability checks that scale across every location and call volume without adding headcount.</div></div>
    </div>
  </div>
</section>

<!-- ── MANAGED INFRASTRUCTURE ──────────────────────────── -->
<section id="infra" class="sect">
  <div class="container">
    <div class="s-tag rev">Managed Infrastructure</div>
    <h2 class="s-title rev">We operate it.<br><em>You run the business.</em></h2>
    <p class="sect-lead rev">A voice agent is only as good as the system behind it. AIM Media handles the full stack — system design, deployment, integrations, monitoring, maintenance, routing logic, and continuous improvement — so your team never has to become telephony engineers.</p>
    <div class="chk-grid rev">
      <div class="chk-item"><div class="chk-mark">✓</div><div class="chk-text"><strong>System design</strong> — call flows, agent roles, and escalation rules mapped to how your business actually operates.</div></div>
      <div class="chk-item"><div class="chk-mark">✓</div><div class="chk-text"><strong>Deployment &amp; integration</strong> — connected to your CRM, calendar, dispatch, and ticketing tools from day one.</div></div>
      <div class="chk-item"><div class="chk-mark">✓</div><div class="chk-text"><strong>Monitoring &amp; reliability</strong> — call quality and uptime checked on an ongoing basis, not left to chance.</div></div>
      <div class="chk-item"><div class="chk-mark">✓</div><div class="chk-text"><strong>Routing logic</strong> — the right call reaches the right person, department, or queue every time.</div></div>
      <div class="chk-item"><div class="chk-mark">✓</div><div class="chk-text"><strong>Maintenance</strong> — updates, fixes, and adjustments handled as your business and call volume change.</div></div>
      <div class="chk-item"><div class="chk-mark">✓</div><div class="chk-text"><strong>Continuous improvement</strong> — conversations, routing, and workflows refined on a recurring basis.</div></div>
    </div>
  </div>
</section>

<!-- ── OPERATING ENVIRONMENTS ──────────────────────────── -->
<section id="environments" class="sect" style="padding-left:0;padding-right:0">
  <div class="work-header container">
    <div>
      <div class="s-tag rev">Where It Runs</div>
      <h2 class="s-title rev">Built for the businesses<br><em>that live on the phone.</em></h2>
    </div>
    <div class="work-hint rev">Drag to explore</div>
  </div>
  <div class="cases-track" id="envTrack">
    <div class="ccase e08" role="button" tabindex="0" data-key="e08" aria-label="Open Real Estate environment"><div class="ccase-bg" id="img-kris-ramotar"></div><div class="ccase-ov"></div><div class="ccase-expand" aria-hidden="true">⤢</div><div class="ccase-body"><div class="ccase-tag">Real Estate</div><div class="ccase-name">Real Estate</div><div class="ccase-result">Qualifies buyer and seller leads, books showings, and updates the CRM the moment a call ends.</div></div></div>
    <div class="ccase e09" role="button" tabindex="0" data-key="e09" aria-label="Open Automotive environment"><div class="ccase-bg" id="img-vip-motors"></div><div class="ccase-ov"></div><div class="ccase-expand" aria-hidden="true">⤢</div><div class="ccase-body"><div class="ccase-tag">Automotive</div><div class="ccase-name">Automotive</div><div class="ccase-result">Handles inventory questions, books service appointments, and captures every sales lead.</div></div></div>
    <div class="ccase e10" role="button" tabindex="0" data-key="e10" aria-label="Open Hospitality environment"><div class="ccase-bg" id="img-coffee-exchange"></div><div class="ccase-ov"></div><div class="ccase-expand" aria-hidden="true">⤢</div><div class="ccase-body"><div class="ccase-tag">Hospitality</div><div class="ccase-name">Hospitality</div><div class="ccase-result">Takes reservations, answers hours and menu questions, and covers overflow and after-hours calls.</div></div></div>
    <div class="ccase e04" role="button" tabindex="0" data-key="e04" aria-label="Open Call Centers environment"><div class="ccase-bg" id="img-wetech"></div><div class="ccase-ov"></div><div class="ccase-expand" aria-hidden="true">⤢</div><div class="ccase-body"><div class="ccase-tag">Call Centers</div><div class="ccase-name">Call Centers</div><div class="ccase-result">Triages high call volume and hands off complex calls to an agent with full context.</div></div></div>
    <div class="ccase e11" role="button" tabindex="0" data-key="e11" aria-label="Open Logistics environment"><div class="ccase-bg" id="img-tdottruck"></div><div class="ccase-ov"></div><div class="ccase-expand" aria-hidden="true">⤢</div><div class="ccase-body"><div class="ccase-tag">Logistics</div><div class="ccase-name">Logistics</div><div class="ccase-result">Routes dispatch calls and status inquiries across a moving fleet and multiple terminals.</div></div></div>
    <div class="ccase e05" role="button" tabindex="0" data-key="e05" aria-label="Open Service Businesses environment"><div class="ccase-bg" id="img-ram-bharose"></div><div class="ccase-ov"></div><div class="ccase-expand" aria-hidden="true">⤢</div><div class="ccase-body"><div class="ccase-tag">Service Businesses</div><div class="ccase-name">Service Businesses</div><div class="ccase-result">Covers scheduling, quotes, and follow-up for trades and local service operations.</div></div></div>
    <div class="ccase e01 ccase-flat" role="button" tabindex="0" data-key="e01" aria-label="Open Front Desk environment"><div class="ccase-bg"></div><div class="ccase-ov"></div><div class="ccase-expand" aria-hidden="true">⤢</div><div class="ccase-body"><div class="ccase-tag">Front Desk</div><div class="ccase-name">Front Desk Operations</div><div class="ccase-result">Answers every inbound call, books appointments, and routes to the right department.</div></div></div>
    <div class="ccase e02 ccase-flat" role="button" tabindex="0" data-key="e02" aria-label="Open Customer Support environment"><div class="ccase-bg"></div><div class="ccase-ov"></div><div class="ccase-expand" aria-hidden="true">⤢</div><div class="ccase-body"><div class="ccase-tag">Customer Support</div><div class="ccase-name">Customer Support</div><div class="ccase-result">Handles account questions and opens tickets with full context when a human is needed.</div></div></div>
    <div class="ccase e03 ccase-flat" role="button" tabindex="0" data-key="e03" aria-label="Open Intake Operations environment"><div class="ccase-bg"></div><div class="ccase-ov"></div><div class="ccase-expand" aria-hidden="true">⤢</div><div class="ccase-body"><div class="ccase-tag">Intake</div><div class="ccase-name">Intake Operations</div><div class="ccase-result">Captures and qualifies every lead, then routes it to the right person automatically.</div></div></div>
    <div class="ccase e06 ccase-flat" role="button" tabindex="0" data-key="e06" aria-label="Open Healthcare environment"><div class="ccase-bg"></div><div class="ccase-ov"></div><div class="ccase-expand" aria-hidden="true">⤢</div><div class="ccase-body"><div class="ccase-tag">Healthcare</div><div class="ccase-name">Healthcare</div><div class="ccase-result">Manages appointment scheduling and intake questions alongside the systems your practice runs on.</div></div></div>
    <div class="ccase e07 ccase-flat" role="button" tabindex="0" data-key="e07" aria-label="Open Legal environment"><div class="ccase-bg"></div><div class="ccase-ov"></div><div class="ccase-expand" aria-hidden="true">⤢</div><div class="ccase-body"><div class="ccase-tag">Legal</div><div class="ccase-name">Legal</div><div class="ccase-result">Captures new-matter intake and routine questions, then routes qualified inquiries to your team.</div></div></div>
    <div class="ccase e12 ccase-flat" role="button" tabindex="0" data-key="e12" aria-label="Open Property Management environment"><div class="ccase-bg"></div><div class="ccase-ov"></div><div class="ccase-expand" aria-hidden="true">⤢</div><div class="ccase-body"><div class="ccase-tag">Property Management</div><div class="ccase-name">Property Management</div><div class="ccase-result">Fields maintenance requests and after-hours emergencies, routed to the right on-call contact.</div></div></div>
  </div>
</section>

${ctaSection({
  eyebrow: 'Your voice infrastructure, designed and managed',
  h1: 'Ready to put your<br><strong>calls to work?</strong>',
  sub: 'AI Voice Infrastructure · Managed Operations',
})}
`,
});

// ── DEMOS ─────────────────────────────────────────────────────────
page({
  file: 'demos/index.html',
  navKey: 'demos',
  title: 'Demos — AIM Media',
  desc: 'Interactive demonstrations of AIM Media\'s AI voice infrastructure across real estate, hospitality, enterprise, and dealership operating environments.',
  body: `
${innerHero({
  crumbLabel: 'Demos',
  bgNum: 'DEMO',
  eyebrow: 'Interactive Demos',
  h1a: 'See the',
  h1b: 'infrastructure.',
  sub: 'Four operating environments, one voice infrastructure. Explore how AIM Media\'s AI voice agents answer, qualify, route, and update your systems inside a live, interactive demonstration.',
  cta: '<a href="#modes-grid" class="btn-primary">Explore the Modes</a>',
  tight: true,
})}

<section id="modes-grid" class="sect">
  <div class="container">
    <div class="s-tag rev">Try It Live</div>
    <h2 class="s-title rev" style="margin-bottom:1.5rem">Four modes.<br><em>One infrastructure.</em></h2>
    <p class="sect-lead rev">Every demo runs on the same underlying system — only the call flow, vocabulary, and integrations change to match the operating environment. Click a card, or use the <strong>Modes</strong> control in the navigation, to launch the full-screen demonstration.</p>
    <div class="demo-grid">
      <div class="demo-card rev" data-mode-trigger="realtor" role="button" tabindex="0" aria-label="Launch Real Estate Mode demo">
        <div class="demo-card-bg" id="img-kris-ramotar"></div>
        <div class="demo-card-ov"></div>
        <div class="demo-card-body">
          <div class="demo-card-tag">Real Estate Mode</div>
          <div class="demo-card-title">Real Estate</div>
          <ul class="demo-card-list"><li>Lead intake</li><li>Qualification</li><li>Appointment booking</li><li>CRM follow-up</li></ul>
          <span class="demo-card-cta">Launch Demo →</span>
        </div>
      </div>
      <div class="demo-card rev" data-mode-trigger="cafe" role="button" tabindex="0" aria-label="Launch Hospitality Mode demo">
        <div class="demo-card-bg" id="img-coffee-exchange"></div>
        <div class="demo-card-ov"></div>
        <div class="demo-card-body">
          <div class="demo-card-tag">Hospitality Mode</div>
          <div class="demo-card-title">Hospitality</div>
          <ul class="demo-card-list"><li>Reservations</li><li>Hours &amp; FAQ handling</li><li>Customer inquiries</li><li>Overflow &amp; after-hours</li></ul>
          <span class="demo-card-cta">Launch Demo →</span>
        </div>
      </div>
      <div class="demo-card rev" data-mode-trigger="corporate" role="button" tabindex="0" aria-label="Launch Enterprise Mode demo">
        <div class="demo-card-bg" id="img-wetech"></div>
        <div class="demo-card-ov"></div>
        <div class="demo-card-body">
          <div class="demo-card-tag">Enterprise Mode</div>
          <div class="demo-card-title">Enterprise</div>
          <ul class="demo-card-list"><li>Customer support</li><li>Internal routing</li><li>CRM updates</li><li>Ticketing &amp; escalation</li></ul>
          <span class="demo-card-cta">Launch Demo →</span>
        </div>
      </div>
      <div class="demo-card rev" data-mode-trigger="dealership" role="button" tabindex="0" aria-label="Launch Dealership Mode demo">
        <div class="demo-card-bg" id="img-vip-motors"></div>
        <div class="demo-card-ov"></div>
        <div class="demo-card-body">
          <div class="demo-card-tag">Dealership Mode</div>
          <div class="demo-card-title">Dealership</div>
          <ul class="demo-card-list"><li>Lead capture</li><li>Inventory inquiries</li><li>Service booking</li><li>Follow-up workflows</li></ul>
          <span class="demo-card-cta">Launch Demo →</span>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="sect">
  <div class="container">
    <div class="s-tag rev">How The Demo Works</div>
    <h2 class="s-title rev" style="margin-bottom:1.5rem">A cinematic look<br><em>at a real system.</em></h2>
    <p class="sect-lead rev">Each mode drops you into a rendered operating environment tuned to that vertical, with the call flow, coverage, and a typical deployment snapshot laid over the scene. It's a demonstration of the underlying infrastructure — the same voice system design, integration architecture, and managed operations described throughout this site — not a separate product.</p>
  </div>
</section>

${ctaSection({
  eyebrow: 'Want to see your own environment',
  h1: 'Let\'s design the mode<br><strong>built for your business.</strong>',
  sub: 'AI Voice Infrastructure · Managed Operations',
})}
`,
});

// ── PRICING ───────────────────────────────────────────────────────
page({
  file: 'pricing/index.html',
  navKey: 'pricing',
  title: 'Pricing & Engagement Model — AIM Media',
  desc: 'AIM Media prices AI voice infrastructure around your call volume and scope, not a one-size-fits-all plan. Here is how an engagement is structured, from discovery to managed operations.',
  body: `
${innerHero({
  crumbLabel: 'Pricing',
  bgNum: '$',
  eyebrow: 'Pricing · Engagement Model',
  h1a: 'Built for your',
  h1b: 'call volume.',
  sub: 'AI voice infrastructure isn\'t a shelf product, so we don\'t price it like one. Every engagement is scoped around your call volume, departments, and integrations — here is exactly how that scoping works.',
  cta: '<a href="mailto:' + EMAIL + '" class="btn-primary">Request a Quote →</a>',
  tight: true,
})}

<section class="sect">
  <div class="container">
    <div class="s-tag rev">How Engagements Are Scoped</div>
    <h2 class="s-title rev" style="margin-bottom:1.5rem">Six stages.<br><em>One managed system.</em></h2>
    <p class="sect-lead rev">Every engagement moves through the same stages, whether you're a single front desk or a multi-location operation. What changes is scope — how many departments, integrations, and call flows are in play.</p>
    <div class="engage-flow rev">
      <div class="engage-node"><div class="engage-node-n">01</div><div class="engage-node-t">Discovery &amp; Call-Operations Mapping</div></div>
      <div class="engage-node"><div class="engage-node-n">02</div><div class="engage-node-t">System Design</div></div>
      <div class="engage-node"><div class="engage-node-n">03</div><div class="engage-node-t">Build &amp; Integration</div></div>
      <div class="engage-node"><div class="engage-node-n">04</div><div class="engage-node-t">Deployment</div></div>
      <div class="engage-node"><div class="engage-node-n">05</div><div class="engage-node-t">Managed Operations</div></div>
      <div class="engage-node"><div class="engage-node-n">06</div><div class="engage-node-t">Continuous Improvement</div></div>
    </div>
  </div>
</section>

<section class="sect">
  <div class="container">
    <div class="s-tag rev">Scope Guide</div>
    <h2 class="s-title rev" style="margin-bottom:1.5rem">Three shapes of<br><em>engagement.</em></h2>
    <p class="sect-lead rev">These aren't fixed price tiers — they're a starting point for a conversation. Every quote is tailored to your call volume, department count, and integration list after a discovery call.</p>
    <div class="pricing-grid">
      <div class="price-card rev">
        <div class="price-tier-label">Single Location</div>
        <div class="price-tier-name">Front Desk Deployment</div>
        <p class="price-tier-desc">One voice agent covering inbound answering, scheduling, and after-hours coverage for a single location or department.</p>
        <ul class="price-tier-list">
          <li>Inbound call answering</li>
          <li>Appointment scheduling</li>
          <li>One CRM or calendar integration</li>
          <li>After-hours &amp; overflow coverage</li>
          <li>Standard monitoring</li>
        </ul>
      </div>
      <div class="price-card price-featured rev">
        <div class="price-tier-label">Growing Operations</div>
        <div class="price-tier-name">Multi-Department Voice System</div>
        <p class="price-tier-desc">A voice system spanning several departments or call types, with structured routing and multiple integrations.</p>
        <ul class="price-tier-list">
          <li>Everything in Front Desk Deployment</li>
          <li>Multiple call flows &amp; departments</li>
          <li>CRM, calendar, and ticketing integrations</li>
          <li>Escalation &amp; handoff logic</li>
          <li>Recurring conversation optimization</li>
        </ul>
      </div>
      <div class="price-card rev">
        <div class="price-tier-label">Multi-Location / High Volume</div>
        <div class="price-tier-name">Enterprise Managed Infrastructure</div>
        <p class="price-tier-desc">Full managed voice infrastructure across multiple locations, departments, and high call volume, with dedicated monitoring.</p>
        <ul class="price-tier-list">
          <li>Everything in Multi-Department Voice System</li>
          <li>Multi-location routing &amp; reporting</li>
          <li>Dispatch, billing &amp; notification integrations</li>
          <li>Priority monitoring &amp; reliability review</li>
          <li>Ongoing scaling support</li>
        </ul>
      </div>
    </div>
  </div>
</section>

${ctaSection({
  eyebrow: 'Every engagement starts with one conversation',
  h1: 'Talk to us about<br><strong>your call volume.</strong>',
  sub: 'Discovery call · Tailored quote · No fixed shelf pricing',
  btn: 'Book a Discovery Call →',
})}
`,
});

// ── USE CASE: FRONT DESK ────────────────────────────────────────────
page({
  file: 'use-cases/front-desk/index.html',
  navKey: 'front-desk',
  title: 'Front Desk — Use Cases — AIM Media',
  desc: 'AI voice infrastructure for front desk operations: answering, scheduling, department routing, and after-hours coverage, connected to the calendar and CRM your team already uses.',
  body: useCaseBody({
    hero: {
      crumbLabel: 'Front Desk',
      bgNum: 'FD',
      eyebrow: 'Use Case · Front Desk',
      h1a: 'Every call,',
      h1b: 'answered.',
      sub: 'A front desk can\'t be in two places at once. AIM Media\'s voice infrastructure answers every inbound call, handles the routine questions, and keeps the calendar current — even when your team is busy with the person standing in front of them.',
      cta: '<a href="mailto:' + EMAIL + '" class="btn-primary">Design Your Front Desk System →</a>',
    },
    challenge: {
      title: 'The front desk can\'t be everywhere at once.',
      body: 'A ringing phone competes with the walk-in at the counter, the call already on hold, and the dozen small tasks that make a front desk run. The result is predictable: calls that go to voicemail during busy stretches, business-hours questions answered inconsistently depending on who picks up, appointment changes that don\'t make it into the calendar cleanly, and a phone that stops working entirely after hours or during overflow.',
    },
    augment: {
      title: 'An AI voice agent that works the desk alongside your team.',
      body: 'AIM Media\'s front desk agent answers every call in a natural conversation, handles the questions it can resolve on its own, and hands off anything that needs a human — with full context already captured. Your team keeps ownership of the relationship; the agent keeps the phone from ever going unanswered.',
    },
    tasks: {
      title: 'What the AI handles at the front desk.',
      items: [
        ['Answering inbound calls', 'every call is picked up immediately, day or night.'],
        ['Business-hours questions', 'hours, location, pricing, and general FAQs answered consistently.'],
        ['Appointment scheduling', 'new bookings placed directly into your calendar.'],
        ['Appointment changes', 'reschedules and cancellations handled without a callback.'],
        ['Caller information capture', 'name, contact details, and reason for the call logged automatically.'],
        ['Department routing', 'calls sent to the right person, extension, or queue.'],
        ['After-hours coverage', 'the phone keeps working after your team goes home.'],
        ['Overflow handling', 'calls covered automatically when every line is already busy.'],
      ],
    },
    integrations: {
      title: 'Connected to the tools your front desk already runs on.',
      items: ['Calendar & scheduling platforms', 'CRM systems', 'Practice / business management software', 'Ticketing tools', 'SMS & email notifications', 'Call routing & PBX systems'],
    },
    scenarios: {
      title: 'Where a front desk deployment shows up.',
      items: [
        ['Single-location reception', 'A clinic, studio, or office where one line handles every inbound call and the front desk is often mid-conversation with someone in person.'],
        ['Multi-department routing', 'A business with several departments or extensions, where calls need to reach the right team without a caller getting bounced around.'],
        ['After-hours & overflow', 'Coverage for the hours and burst-volume moments a front desk staff simply can\'t be at the phone.'],
      ],
    },
    impact: {
      title: 'What changes when the front desk never misses a call.',
      body: 'Callers get a consistent answer every time, appointments land in the calendar without a manual step, and your team stops splitting attention between the phone and the person in front of them. The front desk becomes a system your business can rely on, not a bottleneck that depends on who happens to answer.',
    },
    cta: {
      eyebrow: 'Front Desk · AI Voice Infrastructure',
      h1: 'Let\'s design your<br><strong>front desk system.</strong>',
      sub: 'Answering · Scheduling · Routing · After-Hours Coverage',
    },
  }),
});

// ── USE CASE: CUSTOMER SUPPORT ──────────────────────────────────────
page({
  file: 'use-cases/customer-support/index.html',
  navKey: 'customer-support',
  title: 'Customer Support — Use Cases — AIM Media',
  desc: 'AI voice infrastructure for customer support: order and account questions, troubleshooting, ticket creation, and escalation with full context, day and night.',
  body: useCaseBody({
    hero: {
      crumbLabel: 'Customer Support',
      bgNum: 'CS',
      eyebrow: 'Use Case · Customer Support',
      h1a: 'Support that',
      h1b: 'never queues.',
      sub: 'Long hold times and inconsistent answers cost trust as fast as they cost time. AIM Media\'s voice infrastructure resolves the routine questions immediately and escalates the rest with full context already attached.',
      cta: '<a href="mailto:' + EMAIL + '" class="btn-primary">Design Your Support System →</a>',
    },
    challenge: {
      title: 'Hold times and inconsistent answers erode trust.',
      body: 'Support lines get the same handful of questions on repeat — order status, account details, basic troubleshooting — but every caller still waits in the same queue as the complex case ahead of them. Answers vary by agent, tickets get created after the fact instead of during the call, and after-hours callers get nothing at all.',
    },
    augment: {
      title: 'A voice agent that clears the routine so your team can own the complex.',
      body: 'AIM Media\'s support agent resolves the questions it can handle immediately and in a consistent way every time, opens a ticket the moment a case needs a human, and hands it off with the full conversation attached — no re-explaining, no lost context.',
    },
    tasks: {
      title: 'What the AI handles in customer support.',
      items: [
        ['Order & account questions', 'status checks and account details answered directly.'],
        ['FAQ handling', 'the recurring questions resolved consistently, every time.'],
        ['Troubleshooting', 'guided first-line troubleshooting before an issue needs an agent.'],
        ['Ticket creation', 'a ticket opened automatically the moment escalation is needed.'],
        ['Escalation with context', 'the full call transcript and details handed to your team.'],
        ['After-hours support', 'coverage continues after your support team logs off.'],
        ['Reduced hold times', 'routine calls resolved instantly instead of queued.'],
        ['Consistent responses', 'the same accurate answer regardless of who — or what — picks up.'],
      ],
    },
    integrations: {
      title: 'Connected to your support stack.',
      items: ['Helpdesk & ticketing platforms', 'CRM systems', 'Order & account management systems', 'Knowledge bases', 'Live-agent handoff tools', 'SMS & email notifications'],
    },
    scenarios: {
      title: 'Where a support deployment shows up.',
      items: [
        ['High-repeat question volume', 'A support line where the same handful of questions make up most of the call volume.'],
        ['After-hours coverage gap', 'A team that supports customers only during business hours but receives calls around the clock.'],
        ['Escalation with continuity', 'A support desk where callers currently have to re-explain their issue every time they\'re transferred.'],
      ],
    },
    impact: {
      title: 'What changes when support stops queuing.',
      body: 'Routine questions get resolved the moment they\'re asked, tickets arrive with full context instead of a secondhand summary, and your support team spends its time on the cases that actually need a person — not the ones that just needed an answer.',
    },
    cta: {
      eyebrow: 'Customer Support · AI Voice Infrastructure',
      h1: 'Let\'s design your<br><strong>support system.</strong>',
      sub: 'Resolution · Ticketing · Escalation · After-Hours Coverage',
    },
  }),
});

// ── USE CASE: INTAKE ─────────────────────────────────────────────────
page({
  file: 'use-cases/intake/index.html',
  navKey: 'intake',
  title: 'Intake — Use Cases — AIM Media',
  desc: 'AI voice infrastructure for intake operations: structured lead and inquiry capture, qualification, CRM records, routing, and priority alerts.',
  body: useCaseBody({
    hero: {
      crumbLabel: 'Intake',
      bgNum: 'IN',
      eyebrow: 'Use Case · Intake',
      h1a: 'Every inquiry,',
      h1b: 'structured.',
      sub: 'A lead scribbled on a sticky note is a lead that goes nowhere. AIM Media\'s voice infrastructure captures, qualifies, and routes every inbound inquiry into a structured record the moment the call ends.',
      cta: '<a href="mailto:' + EMAIL + '" class="btn-primary">Design Your Intake System →</a>',
    },
    challenge: {
      title: 'Unstructured intake loses leads before they\'re ever qualified.',
      body: 'When intake happens by hand, the details that matter — service type, urgency, geography, budget — depend entirely on what the person answering thought to ask. Inquiries sit in a notepad instead of the CRM, follow-up gets delayed, and the leads that needed a fast response look identical to the ones that didn\'t.',
    },
    augment: {
      title: 'A voice agent that qualifies every inquiry the same way, every time.',
      body: 'AIM Media\'s intake agent asks the same structured questions on every call, captures the answers directly into your CRM or case-management system, and flags the inquiries that need immediate attention — so your team spends its time on qualified leads, not data entry.',
    },
    tasks: {
      title: 'What the AI handles during intake.',
      items: [
        ['Lead & inquiry capture', 'every inbound inquiry recorded in full, automatically.'],
        ['Structured qualification', 'consistent questions asked on every single call.'],
        ['Service type', 'the specific service or product the caller needs.'],
        ['Urgency', 'how time-sensitive the inquiry is, captured upfront.'],
        ['Geography', 'location details recorded for routing and service-area fit.'],
        ['Budget', 'budget range captured where relevant to qualification.'],
        ['CRM or case-management records', 'a structured record created without manual entry.'],
        ['Lead routing', 'qualified inquiries sent to the right person or team.'],
        ['Confirmation messages', 'the caller receives confirmation their inquiry was received.'],
        ['Priority alerts', 'urgent inquiries flagged to your team immediately.'],
      ],
    },
    integrations: {
      title: 'Connected to your intake and records systems.',
      items: ['CRM systems', 'Case-management software', 'Lead routing tools', 'Calendar & scheduling platforms', 'SMS & email notifications', 'Internal alerting tools'],
    },
    scenarios: {
      title: 'Where an intake deployment shows up.',
      items: [
        ['New client / new matter intake', 'A business where every new relationship starts with a phone call that needs to be qualified and logged consistently.'],
        ['High-volume inquiry lines', 'A marketing or referral line generating more inbound inquiries than a team can qualify by hand.'],
        ['Time-sensitive routing', 'An operation where some inquiries need an immediate response and others can wait — and today, that distinction depends on guesswork.'],
      ],
    },
    impact: {
      title: 'What changes when intake becomes structured.',
      body: 'Every inquiry arrives in the CRM the same way, qualified the same way, with nothing lost between the call and the record. Your team spends its time working qualified leads instead of chasing down the details that should have been captured on the first call.',
    },
    cta: {
      eyebrow: 'Intake · AI Voice Infrastructure',
      h1: 'Let\'s design your<br><strong>intake system.</strong>',
      sub: 'Capture · Qualification · Routing · Priority Alerts',
    },
  }),
});

// ── USE CASE: CALL CENTER ────────────────────────────────────────────
page({
  file: 'use-cases/call-center/index.html',
  navKey: 'call-center',
  title: 'Call Center — Use Cases — AIM Media',
  desc: 'AI voice infrastructure for call centers: high-volume intent triage, queue and overflow management, routine resolution, and agent handoff with full context.',
  body: useCaseBody({
    hero: {
      crumbLabel: 'Call Center',
      bgNum: 'CC',
      eyebrow: 'Use Case · Call Center',
      h1a: 'Volume without',
      h1b: 'the wait.',
      sub: 'High call volume shouldn\'t mean a longer queue. AIM Media\'s voice infrastructure triages intent, resolves routine issues on the spot, and hands the rest to an agent with the full call context already attached.',
      cta: '<a href="mailto:' + EMAIL + '" class="btn-primary">Design Your Call Center System →</a>',
    },
    challenge: {
      title: 'High call volume strains queues and consistency at the same time.',
      body: 'A call center built around fixed headcount hits a ceiling fast: queues back up during peak volume, routine issues eat the same agent time as complex ones, and multi-location operations struggle to handle calls the same way across every site. Every added call is added strain, not added capacity.',
    },
    augment: {
      title: 'A voice layer that triages and resolves before an agent is needed.',
      body: 'AIM Media\'s call center agent identifies caller intent immediately, resolves the issues it can handle without a human, and manages queue and overflow so agents are only pulled in for the calls that need them — with the conversation history handed off in full.',
    },
    tasks: {
      title: 'What the AI handles in a call center.',
      items: [
        ['High-volume inbound calls', 'every call answered regardless of how many arrive at once.'],
        ['Intent triage', 'the reason for the call identified in the first exchange.'],
        ['Queue & overflow management', 'volume spikes absorbed without a caller ever hearing a busy signal.'],
        ['Routine issue resolution', 'common requests resolved without agent involvement.'],
        ['Agent handoff', 'complex calls routed to the right available agent.'],
        ['Call context transfer', 'agents receive the full conversation, not a cold transfer.'],
        ['Consistent handling', 'every caller gets the same standard of service.'],
        ['Multi-location operations', 'the same call standards applied across every site.'],
        ['Call analytics', 'call volume and outcomes tracked for ongoing review.'],
      ],
    },
    integrations: {
      title: 'Connected to your call center stack.',
      items: ['ACD / call routing systems', 'CRM systems', 'Ticketing platforms', 'Workforce & queue management tools', 'Reporting & analytics dashboards', 'SMS & email notifications'],
    },
    scenarios: {
      title: 'Where a call center deployment shows up.',
      items: [
        ['Peak-volume absorption', 'A center where call spikes routinely overwhelm available agents, causing long queues or abandoned calls.'],
        ['Multi-location consistency', 'An operation running several sites or brands that each need to handle calls to the same standard.'],
        ['Tiered support', 'A center that wants routine issues resolved automatically so agent time goes toward the calls that actually need a person.'],
      ],
    },
    impact: {
      title: 'What changes when volume stops meaning wait time.',
      body: 'Callers get answered immediately regardless of volume, agents spend their time on calls that need judgment instead of repetition, and every location handles calls to the same standard — with the reporting to prove it.',
    },
    cta: {
      eyebrow: 'Call Center · AI Voice Infrastructure',
      h1: 'Let\'s design your<br><strong>call center system.</strong>',
      sub: 'Triage · Resolution · Handoff · Multi-Location Consistency',
    },
  }),
});

// ── SERVICE: VOICE SYSTEM DESIGN ────────────────────────────────────
page({
  file: 'services/voice-system-design/index.html',
  navKey: 'svd',
  title: 'Voice System Design — Services — AIM Media',
  desc: 'AIM Media designs AI-powered voice systems around how your business actually handles calls — call mapping, agent roles, conversation architecture, and integration planning.',
  body: servicePageBody({
    hero: {
      crumbLabel: 'Voice System Design',
      bgNum: '01',
      eyebrow: 'Service · Voice System Design',
      h1a: 'Designed around',
      h1b: 'how you take calls.',
      sub: 'AI-powered communications systems designed around how a business actually handles calls — not a generic script bolted onto a phone number.',
      cta: '<a href="mailto:' + EMAIL + '" class="btn-primary">Start Your Design →</a>',
    },
    intro: {
      title: 'The blueprint before the build.',
      body: 'Before any voice agent goes live, AIM Media maps how your business actually handles calls today — who answers what, where calls get stuck, and what a caller needs to hear at each step. That map becomes the architecture for the system: agent roles, conversation flow, escalation rules, and the integrations that turn a conversation into a completed task.',
    },
    coverage: {
      title: 'What voice system design covers.',
      items: [
        ['Operational call mapping', 'documenting how calls move through your business today, end to end.'],
        ['Agent roles', 'defining what each voice agent is responsible for, and where a human takes over.'],
        ['Conversation architecture', 'structuring the call flow so it feels natural, not scripted.'],
        ['Intent recognition', 'designing how the system identifies what a caller actually needs.'],
        ['Information capture', 'specifying exactly what details get captured on every call.'],
        ['Handoff logic', 'defining when and how a call moves from AI to a human.'],
        ['Escalation rules', 'building the conditions that trigger a priority response.'],
        ['Workflow triggers', 'mapping which call outcomes should kick off which downstream action.'],
        ['CRM & scheduling integration planning', 'planning exactly how the system writes into your existing tools.'],
      ],
    },
    quote: '"A voice agent is only as good as the map it was built from. We design the system around your business, not the other way around."',
    secondary: {
      tag: 'From Design To Build',
      title: 'A design that becomes the deployed system.',
      body: 'Voice system design isn\'t a slide deck — it\'s the working specification our team builds directly from. Once the call flows, agent roles, and integration plan are locked, the same design carries into build, testing, and deployment, detailed further on our <a href="/resources/process" style="color:var(--accent)">process page</a>.',
    },
    cta: {
      eyebrow: 'Voice System Design',
      h1: 'Let\'s map how your<br><strong>business takes calls.</strong>',
      sub: 'Call Mapping · Conversation Architecture · Integration Planning',
    },
  }),
});

// ── SERVICE: INFRA-AS-A-SERVICE ─────────────────────────────────────
page({
  file: 'services/infra-as-a-service/index.html',
  navKey: 'iaas',
  title: 'Infra-as-a-Service — Services — AIM Media',
  desc: 'AIM Media manages the voice platforms, AI models, telephony, and integration architecture behind your voice system as one operational layer, so your team never has to become telephony engineers.',
  body: servicePageBody({
    hero: {
      crumbLabel: 'Infra-as-a-Service',
      bgNum: '02',
      eyebrow: 'Service · Infra-as-a-Service',
      h1a: 'One layer.',
      h1b: 'Every piece managed.',
      sub: 'Behind every AI voice agent sits a stack of platforms, models, and providers. AIM Media selects, connects, and manages all of it as a single operational layer — so your team deals with one partner, not five vendors.',
      cta: '<a href="mailto:' + EMAIL + '" class="btn-primary">Talk Infrastructure →</a>',
    },
    intro: {
      title: 'The complexity behind the conversation.',
      body: 'A working voice system depends on a voice platform, an AI model, a telephony provider, speech-to-text and text-to-speech engines, and the APIs that connect them all to your business tools. Most businesses shouldn\'t have to evaluate and manage that stack themselves — AIM Media selects the right technology for the job and operates it as one managed layer.',
    },
    coverage: {
      title: 'What the infrastructure layer covers.',
      items: [
        ['Voice platforms', 'selecting and configuring the platform that runs the conversation.'],
        ['AI models', 'choosing the language models that power recognition and response.'],
        ['Telephony providers', 'connecting the carrier infrastructure that routes the actual calls.'],
        ['Speech technologies', 'speech-to-text and text-to-speech tuned for clarity and speed.'],
        ['APIs', 'the connective layer linking voice, data, and your business tools.'],
        ['Workflow automation', 'the logic that turns a call outcome into a completed action.'],
        ['Integration architecture', 'how every system in the stack talks to every other system.'],
        ['Flexible technology selection', 'choosing and swapping providers as your needs change, not locking you in.'],
        ['One managed operational layer', 'a single point of accountability instead of a stack of vendors.'],
      ],
    },
    quote: '"You shouldn\'t need to become a telephony engineer to run a reliable phone line. We manage the complexity so you don\'t have to."',
    secondary: {
      tag: 'Built To Adapt',
      title: 'Technology-agnostic by design.',
      body: 'AIM Media isn\'t tied to a single voice platform, model provider, or telephony vendor. Infrastructure decisions are made around what fits your call volume and budget today, with room to change providers as better options emerge — without disrupting the system your team relies on.',
    },
    cta: {
      eyebrow: 'Infra-as-a-Service',
      h1: 'Let\'s manage the stack<br><strong>behind your voice system.</strong>',
      sub: 'Voice Platforms · AI Models · Telephony · Integration Architecture',
    },
  }),
});

// ── SERVICE: MANAGED VOICE OPERATIONS ───────────────────────────────
page({
  file: 'services/managed-voice-operations/index.html',
  navKey: 'mvo',
  title: 'Managed Voice Operations — Services — AIM Media',
  desc: 'Ongoing monitoring, maintenance, and optimization of your AI voice infrastructure — call quality, uptime, integrations, routing, and continuous improvement, managed by AIM Media.',
  body: servicePageBody({
    hero: {
      crumbLabel: 'Managed Voice Operations',
      bgNum: '03',
      eyebrow: 'Service · Managed Voice Operations',
      h1a: 'You run the business.',
      h1b: 'We run the system.',
      sub: 'Your team operates the business. AIM Media operates the communications infrastructure — monitoring, maintaining, and improving it long after deployment day.',
      cta: '<a href="mailto:' + EMAIL + '" class="btn-primary">Talk Managed Operations →</a>',
    },
    intro: {
      title: 'Deployment is day one, not the finish line.',
      body: 'A voice system that isn\'t watched drifts — call quality slips, integrations break quietly, and routing logic stops matching how the business actually operates. Managed Voice Operations keeps the system healthy on an ongoing basis, so reliability doesn\'t depend on someone noticing a problem after the fact.',
    },
    coverage: {
      title: 'What managed operations covers.',
      items: [
        ['System monitoring', 'ongoing visibility into how the voice system is performing.'],
        ['Call quality monitoring', 'reviewing real conversations to catch drift early.'],
        ['Uptime monitoring', 'watching for outages and failures before they affect callers.'],
        ['Integration maintenance', 'keeping CRM, calendar, and ticketing connections working as those tools change.'],
        ['Conversation improvements', 'refining prompts and flows based on real call outcomes.'],
        ['Routing optimization', 'adjusting routing logic as your departments and volume evolve.'],
        ['Workflow refinement', 'tightening the automations triggered by call outcomes.'],
        ['Scaling to new departments and locations', 'extending the system as the business grows.'],
        ['Ongoing performance management', 'a recurring review cadence, not a one-time handoff.'],
      ],
    },
    quote: '"Your team operates the business. AIM Media operates the communications infrastructure."',
    secondary: {
      tag: 'A Recurring Relationship',
      title: 'Improvement is scheduled, not incidental.',
      body: 'Managed Voice Operations runs on a recurring review cadence — call quality, integration health, and routing performance checked on a regular basis, with adjustments made proactively. It\'s the same discipline described in stage six of our <a href="/resources/process" style="color:var(--accent)">build process</a>, carried on indefinitely.',
    },
    cta: {
      eyebrow: 'Managed Voice Operations',
      h1: 'Let us operate the<br><strong>system you rely on.</strong>',
      sub: 'Monitoring · Maintenance · Optimization · Scaling',
    },
  }),
});

// ── ABOUT ─────────────────────────────────────────────────────────
page({
  file: 'resources/about/index.html',
  navKey: 'about',
  title: 'About — AIM Media',
  desc: 'AIM Media designs and manages AI voice infrastructure for call-driven businesses, working alongside human teams instead of replacing them.',
  body: `
${innerHero({
    crumbLabel: 'About',
    bgNum: 'AM',
    eyebrow: 'About AIM Media',
    h1a: 'Infrastructure,',
    h1b: 'not novelty.',
    sub: 'AIM Media designs, deploys, and manages the AI voice infrastructure that call-driven businesses run on — built to be reliable first, and impressive second.',
    tight: true,
  })}

<section id="about" class="sect">
  <div class="container">
    <div class="s-tag rev">Why We Exist</div>
    <h2 class="s-title rev" style="margin-bottom:2rem">Calls are infrastructure.<br><em>We treat them that way.</em></h2>
    <div class="prose-block rev">
      <p>AIM Media focuses on one thing: AI communications infrastructure for businesses that run on calls. Not marketing content, not paid ads, not a general automation grab-bag — the voice system that answers, qualifies, schedules, routes, and follows up on every call a business receives.</p>
      <p>Call-driven businesses can't afford a system that works most of the time. A missed call is a missed customer, an inconsistent answer is a damaged first impression, and a dropped integration is a lead that never reaches the CRM. That's why we build for reliability first — designed around how a business actually handles calls, then monitored and improved on an ongoing basis.</p>
      <p>Our systems are built to work alongside your team, not replace it. The AI handles the structured, repeatable parts of a call — answering, qualifying, capturing details, routing — and hands off to a human the moment a conversation needs judgment, empathy, or a decision only your team can make.</p>
      <p>Disconnected tools — a voicemail system here, a scheduling app there, a CRM nobody updates — create as much friction as no system at all. Managed infrastructure means one partner is accountable for the whole call, from the first ring to the CRM record it produces.</p>
    </div>
    <div class="chk-grid rev" style="margin-top:3rem">
      <div class="chk-item"><div class="chk-mark">✓</div><div class="chk-text"><strong>Reliability over novelty</strong> — a voice system that works the same way on day 400 as it did on day one.</div></div>
      <div class="chk-item"><div class="chk-mark">✓</div><div class="chk-text"><strong>One partner, not a stack of tools</strong> — a single team accountable for the whole call.</div></div>
      <div class="chk-item"><div class="chk-mark">✓</div><div class="chk-text"><strong>Human teams stay in charge</strong> — AI handles the structured work, people handle judgment.</div></div>
      <div class="chk-item"><div class="chk-mark">✓</div><div class="chk-text"><strong>Improvement doesn't stop at launch</strong> — the system is reviewed and refined on an ongoing basis.</div></div>
    </div>
  </div>
</section>

<!-- ── FOUNDERS ────────────────────────────────────────── -->
<section id="founders">
  <div class="founder-panel fp-left rev-l">
    <div class="fp-bg" id="img-krish"></div>
    <div class="fp-vignette"></div>
    <canvas class="founder-hover-canvas" id="fc-krish"></canvas>
    <div class="fp-divider"></div>
    <div class="fp-content">
      <div class="fp-role">Systems Architect</div>
      <div class="fp-name">Krish<br>Kaushik</div>
      <div class="fp-school">Odette School of Business · University of Windsor</div>
      <div class="fp-bio">Designs and builds the voice infrastructure — call flows, routing logic, and the integrations that connect a conversation to a CRM record. Finance major, 85%+ average, with 7 months as a Financial Analyst at a student-managed investment fund before turning that analytical rigor toward how businesses run their phone lines.</div>
    </div>
  </div>
  <div class="founder-panel fp-right rev-r">
    <div class="fp-bg" id="img-kartik"></div>
    <div class="fp-vignette"></div>
    <canvas class="founder-hover-canvas" id="fc-kartik"></canvas>
    <div class="fp-content">
      <div class="fp-role">Operations Strategist</div>
      <div class="fp-name">Kartik<br>Garg</div>
      <div class="fp-school">Odette School of Business · University of Windsor</div>
      <div class="fp-bio">Owns how a voice system fits the business it serves — mapping call operations, defining escalation rules, and making sure every deployment is measured by operational outcomes, not novelty. The strategist behind how each engagement is scoped and run.</div>
    </div>
  </div>
</section>

${ctaSection({
    eyebrow: 'Built by people who answer to the outcome',
    h1: 'Let\'s talk about<br><strong>your call operations.</strong>',
    sub: 'AI Voice Infrastructure · Managed Operations',
  })}
`,
});

// ── PROCESS ───────────────────────────────────────────────────────
page({
  file: 'resources/process/index.html',
  navKey: 'process',
  title: 'Process — AIM Media',
  desc: 'How AIM Media builds and manages an AI voice system, from discovery and system design through deployment and continuous improvement.',
  body: `
${innerHero({
    crumbLabel: 'Process',
    bgNum: '06',
    eyebrow: 'How We Work',
    h1a: 'Six stages.',
    h1b: 'One system.',
    sub: 'Every engagement moves through the same six stages, whether it\'s a single front desk or a multi-location operation — from understanding how you take calls today to improving the system for as long as we manage it.',
    tight: true,
  })}

<section class="sect">
  <div class="container">
    <div class="process-list">
      <div class="p-step rev">
        <div class="p-step-n">01</div>
        <div>
          <div class="p-step-title">Discovery</div>
          <div class="p-step-desc">Understand call volume, departments, tools, workflows, and bottlenecks — the operational reality the system has to fit.</div>
        </div>
      </div>
      <div class="p-step rev">
        <div class="p-step-n">02</div>
        <div>
          <div class="p-step-title">System Design</div>
          <div class="p-step-desc">Define agent roles, call flows, routing logic, integrations, and escalation rules — the blueprint for the deployed system.</div>
        </div>
      </div>
      <div class="p-step rev">
        <div class="p-step-n">03</div>
        <div>
          <div class="p-step-title">Build + Integration</div>
          <div class="p-step-desc">Connect voice platforms, CRM systems, calendars, ticketing tools, dispatch systems, and notifications into one working system.</div>
        </div>
      </div>
      <div class="p-step rev">
        <div class="p-step-n">04</div>
        <div>
          <div class="p-step-title">Testing + Optimization</div>
          <div class="p-step-desc">Test real conversations, refine responses, validate automations, and improve handoffs before anything goes live.</div>
        </div>
      </div>
      <div class="p-step rev">
        <div class="p-step-n">05</div>
        <div>
          <div class="p-step-title">Deployment</div>
          <div class="p-step-desc">Launch the production system with monitoring, reliability, and operational safeguards already in place.</div>
        </div>
      </div>
      <div class="p-step rev">
        <div class="p-step-n">06</div>
        <div>
          <div class="p-step-title">Continuous Improvement</div>
          <div class="p-step-desc">Improve conversation quality, routing, workflows, and system performance over time — described further under <a href="/services/managed-voice-operations" style="color:var(--accent)">Managed Voice Operations</a>.</div>
        </div>
      </div>
    </div>
  </div>
</section>

${ctaSection({
    eyebrow: 'Start with stage one',
    h1: 'Let\'s start with<br><strong>discovery.</strong>',
    sub: 'Discovery · System Design · Build · Deployment · Managed Operations',
  })}
`,
});

// ── VISION ────────────────────────────────────────────────────────
page({
  file: 'resources/vision/index.html',
  navKey: 'vision',
  title: 'Vision — AIM Media',
  desc: 'AIM Media\'s thesis: business communications are becoming AI-native, and voice should operate as reliable infrastructure, not a novelty.',
  body: `
${innerHero({
    crumbLabel: 'Vision',
    bgNum: '∞',
    eyebrow: 'Our Vision',
    h1a: 'Voice becomes',
    h1b: 'infrastructure.',
    sub: 'Business communications are becoming AI-native. We think voice should be treated like the infrastructure it already is — not a novelty bolted onto a phone number.',
    tight: true,
  })}

<section class="sect">
  <div class="container">
    <div class="prose-block rev">
      <p>Business communications are becoming AI-native. The businesses that get ahead of that shift won't be the ones with the flashiest demo — they'll be the ones whose voice systems are reliable enough to disappear into the background of daily operations, the way electricity or internet connectivity already have.</p>
      <p>That means AI voice has to be treated as operational infrastructure, not a novelty. A voice agent that impresses in a demo but breaks under real call volume, or that can't tell a CRM system what just happened on a call, hasn't solved the actual problem. Businesses need reliable systems — not another disconnected tool bolted onto the ones they already have.</p>
      <p>We also believe AI should augment human teams, not attempt to replace them. The judgment, empathy, and relationship-building that make a business worth calling still belong to people. AI's job is to handle the structured, repeatable work around every call so people can spend their time on what actually needs them.</p>
      <p>Voice agents should coordinate work across departments, not operate as an isolated feature. A call about a service issue should be able to trigger a ticket, update a CRM record, and notify the right person — automatically, without someone manually relaying the information afterward. Call outcomes should trigger useful action across the systems a business already runs on.</p>
      <p>AIM Media exists to manage that complexity so businesses can focus on their customers and their operations — not on stitching together voice platforms, AI models, and integrations themselves.</p>
    </div>
  </div>
</section>

${ctaSection({
    eyebrow: 'Building toward AI-native communications',
    h1: 'Let\'s build the system<br><strong>your business runs on.</strong>',
    sub: 'AI Voice Infrastructure · Managed Operations',
  })}
`,
});

// ── PRIVACY ───────────────────────────────────────────────────────
page({
  file: 'privacy/index.html',
  navKey: 'privacy',
  title: 'Privacy Policy — AIM Media',
  desc: 'How AIM Media collects, uses, and protects information in the course of designing and managing AI voice infrastructure.',
  body: `
${innerHero({
    crumbLabel: 'Privacy',
    bgNum: '§',
    eyebrow: 'Legal',
    h1a: 'Privacy',
    h1b: 'Policy.',
    sub: 'How we handle information in the course of designing, deploying, and managing AI voice infrastructure.',
    tight: true,
  })}

<section class="sect">
  <div class="container">
    <div class="legal-content">
      <span class="legal-updated">Last updated · August 2026</span>

      <h2>Overview</h2>
      <p>This policy describes how AIM Media collects, uses, and protects information when we design, deploy, and manage AI voice infrastructure for our clients, and when visitors use this website. It applies to AIM Media directly — it does not describe the privacy practices of the individual businesses we build voice systems for, who remain responsible for their own compliance obligations.</p>

      <h2>Information We Collect</h2>
      <p>Depending on the engagement, we may collect or process:</p>
      <ul>
        <li>Contact information you provide to us directly, such as your name, email, and phone number.</li>
        <li>Call audio, transcripts, and caller-provided details processed by a voice system we design or manage on behalf of a client.</li>
        <li>Operational information shared during discovery, such as call flows, workflows, and the tools a business uses.</li>
        <li>Basic website usage information collected through standard web technologies.</li>
      </ul>

      <h2>How We Use Information</h2>
      <p>Information is used to design, build, test, deploy, and improve voice systems; to respond to inquiries; to maintain and monitor deployed infrastructure; and to communicate with clients and prospective clients about our services. Call data processed by a deployed voice system is used to operate that system and, with client authorization, to improve conversation quality and system performance.</p>

      <h2>Third-Party Processors</h2>
      <p>Delivering AI voice infrastructure requires working with third-party providers — including telephony carriers, AI model providers, speech-recognition and speech-synthesis services, and the CRM, calendar, dispatch, or ticketing platforms a client already uses. These providers process data as part of operating the system; we select and manage them as part of our infra-as-a-service work.</p>

      <h2>Data Retention</h2>
      <p>We retain information for as long as needed to provide our services, maintain a deployed system, and meet legitimate business or legal requirements. Retention periods for call data are agreed with each client based on their own operational and regulatory needs.</p>

      <h2>Regulated Industries</h2>
      <p>Some clients operate in regulated industries such as healthcare, legal, or financial services. AIM Media does not independently claim any specific regulatory certification, and clients in regulated industries remain responsible for confirming that a deployed system meets the compliance obligations applicable to their business. We work with clients to configure systems appropriately for their regulatory context.</p>

      <h2>Security</h2>
      <p>We take reasonable administrative and technical measures to protect information we handle, and we work with infrastructure and technology providers that maintain their own security practices. No system can be guaranteed to be completely secure, and we encourage clients to discuss specific security requirements with us directly.</p>

      <h2>Your Choices</h2>
      <p>You can contact us at any time to ask what information we hold about you, request a correction, or request deletion where applicable, subject to any retention obligations tied to an active engagement.</p>

      <h2>Changes To This Policy</h2>
      <p>We may update this policy from time to time. The date at the top of this page reflects the most recent revision.</p>

      <h2>Contact</h2>
      <p>Questions about this policy can be directed to <a href="mailto:${EMAIL}" style="color:var(--accent)">${EMAIL}</a>.</p>
    </div>
  </div>
</section>
`,
});

// ── TERMS ─────────────────────────────────────────────────────────
page({
  file: 'terms/index.html',
  navKey: 'terms',
  title: 'Terms of Service — AIM Media',
  desc: 'The terms that govern engagements with AIM Media for the design, deployment, and management of AI voice infrastructure.',
  body: `
${innerHero({
    crumbLabel: 'Terms',
    bgNum: '§',
    eyebrow: 'Legal',
    h1a: 'Terms of',
    h1b: 'Service.',
    sub: 'The terms that govern engagements with AIM Media for the design, deployment, and management of AI voice infrastructure.',
    tight: true,
  })}

<section class="sect">
  <div class="container">
    <div class="legal-content">
      <span class="legal-updated">Last updated · August 2026</span>

      <h2>Agreement To Terms</h2>
      <p>These terms govern your use of this website and any engagement with AIM Media for voice system design, infrastructure management, or related services. By engaging AIM Media or using this site, you agree to these terms.</p>

      <h2>Description Of Services</h2>
      <p>AIM Media designs, deploys, and manages AI voice infrastructure for call-driven businesses, including voice system design, infrastructure management, and ongoing managed operations as described on this site. The specific scope of any engagement is defined in a separate proposal or agreement between AIM Media and the client.</p>

      <h2>Client Responsibilities</h2>
      <p>Clients are responsible for providing accurate operational information during discovery, for securing any rights needed to connect AIM Media's systems to their existing tools, and for confirming that their use of a deployed voice system complies with laws and regulations applicable to their industry and jurisdiction, including any obligations related to call recording or caller consent.</p>

      <h2>No Guaranteed Outcomes</h2>
      <p>AI voice systems augment a business's operations; they do not guarantee specific business results, call volume, or revenue outcomes. AIM Media works to design, deploy, and maintain a reliable system, but outcomes depend on factors outside our control, including a client's own operations, market conditions, and third-party service availability.</p>

      <h2>Intellectual Property</h2>
      <p>Each party retains ownership of its own pre-existing intellectual property. Ownership of custom configurations, integrations, and materials developed specifically for a client engagement is addressed in that engagement's agreement.</p>

      <h2>Third-Party Services</h2>
      <p>Our services rely on third-party voice platforms, AI models, telephony carriers, and integration partners. AIM Media is not responsible for outages, changes, or limitations originating from third-party providers, though we work to select reliable providers and to respond promptly when issues arise.</p>

      <h2>Limitation Of Liability</h2>
      <p>To the maximum extent permitted by law, AIM Media is not liable for indirect, incidental, or consequential damages arising from the use of a deployed voice system or this website. Nothing in these terms limits liability that cannot be limited under applicable law.</p>

      <h2>Changes To These Terms</h2>
      <p>We may update these terms from time to time. Continued use of our services after an update constitutes acceptance of the revised terms.</p>

      <h2>Governing Law</h2>
      <p>These terms are governed by the laws of the Province of Ontario, Canada, without regard to conflict-of-law principles.</p>

      <h2>Contact</h2>
      <p>Questions about these terms can be directed to <a href="mailto:${EMAIL}" style="color:var(--accent)">${EMAIL}</a>.</p>
    </div>
  </div>
</section>
`,
});

console.log('\\nAll pages generated.\\n');

