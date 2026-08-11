/**
 * AIM Media — Static Page Generator
 *
 * Assembles every route from a shared head/nav/footer/chrome template plus
 * per-page body content defined below, and writes the result as static
 * index.html files (clean-URL folder structure) so the site works as plain
 * static HTML on Vercel with zero server-side dependency.
 *
 * Editorial rule: carry the message with numbers, motion and diagrams.
 * Prose is a last resort — if a section needs more than ~40 words, it
 * should be a viz instead.
 *
 * Run: node scripts/build-pages.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const EMAIL = 'krish@theaimmedia.ca';
const YEAR = new Date().getFullYear();

// ── NAV DATA ─────────────────────────────────────────────────────
const SERVICES_SUB = [
  { key: 'svd',  href: '/services/voice-system-design',     label: 'Voice System Design' },
  { key: 'iaas', href: '/services/infra-as-a-service',      label: 'Infra-as-a-Service' },
  { key: 'mvo',  href: '/services/managed-voice-operations', label: 'Managed Voice Operations' },
];
const USECASE_SUB = [
  { key: 'front-desk',       href: '/use-cases/front-desk',       label: 'Front Desk' },
  { key: 'customer-support', href: '/use-cases/customer-support', label: 'Customer Support' },
  { key: 'intake',           href: '/use-cases/intake',           label: 'Intake' },
  { key: 'call-center',      href: '/use-cases/call-center',      label: 'Call Center' },
];
const COMPANY_SUB = [
  { key: 'about',   href: '/resources/about',   label: 'About' },
  { key: 'process', href: '/resources/process', label: 'Process' },
  { key: 'vision',  href: '/resources/vision',  label: 'Vision' },
];
const SOLUTIONS_SUB = [
  { key: 'digital-marketing', href: '/digital-marketing', label: 'Digital Marketing' },
  { key: 'content',           href: '/content',           label: 'Content' },
  { key: 'ai-automations',    href: '/ai-automations',    label: 'AI Automations' },
];
const KEYS = a => a.map(s => s.key);

function cls(key, current, extra) {
  const c = (extra ? extra + ' ' : '') + (key === current ? 'active' : '');
  return c.trim() ? ` class="${c.trim()}"` : '';
}

function dropdown(label, items, current, fallbackHref) {
  const open = KEYS(items).includes(current);
  return `<li class="nav-drop">
      <a href="${fallbackHref}" class="nav-drop-trigger${open ? ' active' : ''}">${label}</a>
      <ul class="nav-drop-menu">
        ${items.map(s => `<li><a href="${s.href}"${cls(s.key, current)}>${s.label}</a></li>`).join('\n        ')}
      </ul>
    </li>`;
}

function renderNav(current) {
  return `
<!-- ── NAV ────────────────────────────────────────────── -->
<nav id="nav">
  <a href="/" class="nav-logo">AIM Media</a>
  <ul class="nav-links">
    <li><a href="/"${cls('home', current)}>Home</a></li>
    ${dropdown('Solutions', SOLUTIONS_SUB, current, '/digital-marketing')}
    ${dropdown('Services', SERVICES_SUB, current, '/services/voice-system-design')}
    ${dropdown('Use Cases', USECASE_SUB, current, '/use-cases/front-desk')}
    <li><a href="/pricing"${cls('pricing', current)}>Pricing</a></li>
    ${dropdown('Company', COMPANY_SUB, current, '/resources/about')}
    <li><a href="/book" class="nav-cta${current === 'demo' || current === 'book' ? ' active' : ''}">Hear a Demo</a></li>
  </ul>
  <button id="nav-burger" class="nav-burger" aria-label="Open menu" aria-expanded="false" aria-controls="nav-mobile">
    <span></span><span></span><span></span>
  </button>
</nav>

<div id="nav-mobile" class="nav-mobile" aria-hidden="true">
  <a href="/"${cls('home', current)}>Home</a>
  <div class="nav-mobile-group-label">Solutions</div>
  <div class="nav-mobile-sub">
    ${SOLUTIONS_SUB.map(s => `<a href="${s.href}"${cls(s.key, current)}>${s.label}</a>`).join('\n    ')}
  </div>
  <div class="nav-mobile-group-label">Services</div>
  <div class="nav-mobile-sub">
    ${SERVICES_SUB.map(s => `<a href="${s.href}"${cls(s.key, current)}>${s.label}</a>`).join('\n    ')}
  </div>
  <div class="nav-mobile-group-label">Use Cases</div>
  <div class="nav-mobile-sub">
    ${USECASE_SUB.map(s => `<a href="${s.href}"${cls(s.key, current)}>${s.label}</a>`).join('\n    ')}
  </div>
  <a href="/pricing"${cls('pricing', current)}>Pricing</a>
  <div class="nav-mobile-group-label">Company</div>
  <div class="nav-mobile-sub">
    ${COMPANY_SUB.map(s => `<a href="${s.href}"${cls(s.key, current)}>${s.label}</a>`).join('\n    ')}
  </div>
  <a href="/book"${cls('book', current)}>Hear a Demo</a>
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
      <div class="ft-r" style="text-align:left">Ontario, Canada<br><a href="mailto:${EMAIL}">${EMAIL}</a></div>
    </div>
    <div class="ft-sitemap">
      <div class="ft-col">
        <div class="ft-col-title">Site</div>
        <a href="/">Home</a>
        <a href="/book">Hear a Demo</a>
        <a href="/pricing">Pricing</a>
      </div>
      <div class="ft-col">
        <div class="ft-col-title">Solutions</div>
        ${SOLUTIONS_SUB.map(s => `<a href="${s.href}">${s.label}</a>`).join('\n        ')}
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
        ${COMPANY_SUB.map(s => `<a href="${s.href}">${s.label}</a>`).join('\n        ')}
        <a href="mailto:${EMAIL}">Contact</a>
      </div>
    </div>
  </div>
  <div class="ft-bottom">
    <span>&copy; ${YEAR} AIM Media. Serving businesses across Ontario, Canada.</span>
    <div class="ft-legal-links">
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </div>
  </div>
</footer>

<div id="spotlight" aria-hidden="true"></div>`;
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
<script src="/assets/js/viz.js"></script>
<script src="/assets/js/quiz.js"></script>`;
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

function innerHero({ crumb, bgNum, eyebrow, h1a, h1b, sub, cta }) {
  return `
<section id="hero" class="hero-inner">
  <canvas id="particles" aria-hidden="true"></canvas>
  <div class="hero-bg" aria-hidden="true"></div>
  <div class="hero-vignette" aria-hidden="true"></div>
  <div class="hero-bg-num" aria-hidden="true">${bgNum}</div>
  <div class="hero-content">
    <div class="crumb"><a href="/">Home</a><span>/</span><span>${crumb}</span></div>
    <div class="hero-eyebrow">${eyebrow}</div>
    <h1 class="hero-headline">
      <span class="hero-line hero-line-italic"><span>${h1a}</span></span>
      <span class="hero-line hero-line-bold"><span>${h1b}</span></span>
    </h1>
    <p class="hero-sub">${sub}</p>
    <div class="hero-cta">${cta || `<a href="/demo" class="btn-primary">Hear a Demo →</a>`}</div>
  </div>
</section>`;
}

function ctaSection({ eyebrow, h1, sub, btn, href }) {
  return `
<section id="cta">
  <div class="cta-orb-1" aria-hidden="true"></div>
  <div class="cta-orb-2" aria-hidden="true"></div>
  <div class="cta-inner">
    <div class="cta-eye rev">${eyebrow}</div>
    <h2 class="cta-headline rev">${h1}</h2>
    <p class="cta-sub rev">${sub}</p>
    <a href="${href || '/demo'}" class="btn-primary rev">${btn || 'Hear a Demo →'}</a>
  </div>
</section>`;
}

/** Animated 5-node call pipeline. */
function flow(nodes) {
  return `<ol class="flow" data-viz-dom>
      ${nodes.map(n => `<li class="flow-node"><span class="flow-dot"></span><span class="flow-k">${n[0]}</span><span class="flow-v">${n[1]}</span></li>`).join('\n      ')}
    </ol>`;
}

/** Tag pills — replaces bulleted prose lists. */
function tags(items) {
  return `<div class="tags rev">${items.map(t => `<span class="tag">${t}</span>`).join('')}</div>`;
}

/** Three number-led cards. */
function facts(items) {
  return `<div class="facts rev">
      ${items.map(f => `<div class="fact"><div class="fact-n">${f[0]}</div><div class="fact-l">${f[1]}</div></div>`).join('\n      ')}
    </div>`;
}

/** Numbered rail with a progress line that fills on scroll. */
function steps(items) {
  return `<div class="steps" data-viz-dom>
      ${items.map((s, i) => `<div class="step"><span class="step-n">${String(i + 1).padStart(2, '0')}</span><div class="step-t">${s[0]}</div><div class="step-d">${s[1]}</div></div>`).join('\n      ')}
    </div>`;
}

/** The voicemail-leak stat: big number + dot animation. */
const LEAK_VIZ = `
<section class="sect">
  <div class="container">
    <div class="split">
      <div class="split-copy">
        <div class="s-tag rev">The Leak</div>
        <div class="viz-figure rev"><span class="viz-num" data-count="80">0</span><span class="viz-unit">%</span></div>
        <p class="viz-cap rev">of callers who reach a voicemail hang up without leaving a message. Most of them call <strong>the next company on the list</strong>.</p>
      </div>
      <canvas class="viz-canvas viz-leak-canvas rev" data-viz="leak" role="img" aria-label="Fifty dots representing callers who reach voicemail; forty of them fall away, leaving ten."></canvas>
    </div>
  </div>
</section>`;

/** The coverage clock. */
const CLOCK_VIZ = `
<section class="sect">
  <div class="container">
    <div class="split split-narrow">
      <canvas class="viz-canvas viz-clock-canvas rev" data-viz="clock" role="img" aria-label="A 24-hour ring showing eight staffed hours, with the remaining sixteen hours filled in by AIM Media."></canvas>
      <div class="split-copy">
        <div class="s-tag rev">The Gap</div>
        <h2 class="s-title rev">Open eight hours.<br><em>Called twenty-four.</em></h2>
        <p class="viz-cap rev">Nights, weekends, lunch rushes and the three calls that land while you are already on one. That is the gap we cover.</p>
      </div>
    </div>
  </div>
</section>`;

/** Cost comparison bars — market rate vs our position. Never invents a price. */
const COST_VIZ = `
    <div class="cost" data-viz-dom>
      <div class="cost-row">
        <div class="cost-head">
          <span class="cost-label">Traditional answering service</span>
          <span class="cost-val">$750–$800 / mo</span>
        </div>
        <div class="cost-bar"><span class="cost-fill cost-fill-them" style="--w:100%"></span></div>
      </div>
      <div class="cost-row cost-row-us">
        <div class="cost-head">
          <span class="cost-label">AIM Media voice agent</span>
          <span class="cost-val">60–70% less</span>
        </div>
        <div class="cost-bar"><span class="cost-fill cost-fill-us" style="--w:33%"></span></div>
      </div>
      <p class="cost-note">Typical quotes our Ontario clients were paying before switching. Your price depends on call volume — ask us for a number.</p>
    </div>`;

// ═══════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════

// ── HOME ──────────────────────────────────────────────────────────
page({
  file: 'index.html',
  navKey: 'home',
  title: 'AIM Media — AI Voice Agents for Ontario Businesses',
  desc: 'AIM Media builds AI voice agents that answer the calls your team misses — after hours and during overflow. Every caller is answered, qualified and logged. Serving Ontario, Canada.',
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
    <div class="hero-eyebrow">AI Voice Agents · Ontario, Canada</div>
    <h1 class="hero-headline">
      <span class="hero-line hero-line-italic"><span>Intelligence.</span></span>
      <span class="hero-line hero-line-bold"><span>Automated.</span></span>
    </h1>
    <p class="hero-sub">Your phone stops working at 5pm. Ours doesn't. AIM Media builds AI voice agents that answer your after-hours and overflow calls, qualify the caller, and send you the summary.</p>
    <div class="hero-cta">
      <a href="/demo" class="btn-primary" id="cta-btn-hero">Hear a Demo →</a>
      <a href="/pricing" class="btn-ghost">See pricing</a>
    </div>
  </div>

  <div class="hero-scroll">
    <div class="scroll-line"></div>
    <span>Scroll</span>
  </div>
</section>

<!-- ── TICKER ──────────────────────────────────────────── -->
<div id="stats">
  <div class="ticker-wrap">
    <div class="ticker-row row-1">
      <div class="t-item"><span class="t-num">24/7</span><span class="t-lbl">Call Coverage</span></div>
      <div class="t-item"><span class="t-num">Every Call</span><span class="t-lbl">Answered + Logged</span></div>
      <div class="t-item"><span class="t-num">No Contract</span><span class="t-lbl">Month to Month</span></div>
      <div class="t-item"><span class="t-num">Live in Days</span><span class="t-lbl">Not Months</span></div>
      <div class="t-item"><span class="t-num">Ontario</span><span class="t-lbl">Canada</span></div>
      <div class="t-item"><span class="t-num">24/7</span><span class="t-lbl">Call Coverage</span></div>
      <div class="t-item"><span class="t-num">Every Call</span><span class="t-lbl">Answered + Logged</span></div>
      <div class="t-item"><span class="t-num">No Contract</span><span class="t-lbl">Month to Month</span></div>
      <div class="t-item"><span class="t-num">Live in Days</span><span class="t-lbl">Not Months</span></div>
      <div class="t-item"><span class="t-num">Ontario</span><span class="t-lbl">Canada</span></div>
    </div>
    <div class="ticker-row row-2">
      <div class="t-item"><span class="t-num">After Hours</span><span class="t-lbl">Covered</span></div>
      <div class="t-item"><span class="t-num">Overflow</span><span class="t-lbl">Covered</span></div>
      <div class="t-item"><span class="t-num">Intake</span><span class="t-lbl">Structured</span></div>
      <div class="t-item"><span class="t-num">Booking</span><span class="t-lbl">Automatic</span></div>
      <div class="t-item"><span class="t-num">CRM Sync</span><span class="t-lbl">Every Call</span></div>
      <div class="t-item"><span class="t-num">After Hours</span><span class="t-lbl">Covered</span></div>
      <div class="t-item"><span class="t-num">Overflow</span><span class="t-lbl">Covered</span></div>
      <div class="t-item"><span class="t-num">Intake</span><span class="t-lbl">Structured</span></div>
      <div class="t-item"><span class="t-num">Booking</span><span class="t-lbl">Automatic</span></div>
      <div class="t-item"><span class="t-num">CRM Sync</span><span class="t-lbl">Every Call</span></div>
    </div>
  </div>
</div>

<!-- ── WHAT WE DO — VERTICALS ───────────────────────────── -->
<section id="services" class="sect">
  <div class="container">
    <div class="s-tag rev">What We Do</div>
    <h2 class="s-title rev">One consultancy.<br><em>Four ways in.</em></h2>
  </div>
  <div class="container">
    <div class="bento">
      <a href="/services/voice-system-design" class="bcard rev">
        <div class="bcard-num">01 · Flagship</div>
        <div class="bcard-title">Voice Agents</div>
        <div class="bcard-desc">AI agents that answer, qualify and book your calls, 24/7. Our first product, and where most of our work happens today.</div>
      </a>
      <a href="/digital-marketing" class="bcard rev">
        <div class="bcard-num">02</div>
        <div class="bcard-title">Digital Marketing</div>
        <div class="bcard-desc">Paid search, paid social and SEO built to bring in the calls your voice agent then answers.</div>
      </a>
      <a href="/content" class="bcard rev">
        <div class="bcard-num">03</div>
        <div class="bcard-title">Content</div>
        <div class="bcard-desc">Short-form video, written content and social calendars, produced on a system instead of ad hoc.</div>
      </a>
      <a href="/ai-automations" class="bcard rev">
        <div class="bcard-num">04</div>
        <div class="bcard-title">AI Automations</div>
        <div class="bcard-desc">Custom workflows, internal tools and reporting that remove manual work outside the phone line.</div>
      </a>
    </div>
  </div>
</section>

${LEAK_VIZ}
${CLOCK_VIZ}

<!-- ── WHAT HAPPENS ON A CALL ──────────────────────────── -->
<section class="sect">
  <div class="container">
    <div class="s-tag rev">On Every Call</div>
    <h2 class="s-title rev">Ring to record<br><em>in one pass.</em></h2>
    ${flow([
      ['Ring', 'Answered on the first ring, day or night'],
      ['Answer', 'A natural voice, not a phone tree'],
      ['Qualify', 'Job type, urgency, location, contact'],
      ['Book', 'Straight into your calendar'],
      ['Sync', 'Summary to your inbox and CRM'],
    ])}
  </div>
</section>

<!-- ── VS ANSWERING SERVICE ────────────────────────────── -->
<section class="sect">
  <div class="container">
    <div class="s-tag rev">The Alternative</div>
    <h2 class="s-title rev">Same coverage.<br><em>A fraction of the bill.</em></h2>
    ${COST_VIZ}
    ${facts([
      ['Month&nbsp;to&nbsp;month', 'No long-term agreement. Cancel before your next billing period.'],
      ['Sounds human', 'Built to hold a real conversation — most callers never clock it.'],
      ['Backup, not replacement', 'Your team still picks up first. The agent catches what they cannot.'],
    ])}
  </div>
</section>

<!-- ── WHERE IT WORKS ──────────────────────────────────── -->
<section class="sect" style="padding-left:0;padding-right:0">
  <div class="work-header container">
    <div>
      <div class="s-tag rev">Where It Works</div>
      <h2 class="s-title rev">Built for businesses<br><em>that run on the phone.</em></h2>
    </div>
    <div class="work-hint rev">Drag to explore</div>
  </div>
  <div class="cases-track">
    <div class="ccase"><div class="ccase-bg" id="img-tdottruck"></div><div class="ccase-ov"></div><div class="ccase-label"><div class="ccase-name">Towing &amp; Logistics</div><div class="ccase-line">Emergency calls answered at 2am.</div></div></div>
    <div class="ccase"><div class="ccase-bg" id="img-kris-ramotar"></div><div class="ccase-ov"></div><div class="ccase-label"><div class="ccase-name">Real Estate</div><div class="ccase-line">Leads qualified and showings booked.</div></div></div>
    <div class="ccase"><div class="ccase-bg" id="img-vip-motors"></div><div class="ccase-ov"></div><div class="ccase-label"><div class="ccase-name">Dealerships</div><div class="ccase-line">Inventory questions and service bookings.</div></div></div>
    <div class="ccase"><div class="ccase-bg" id="img-atiyas"></div><div class="ccase-ov"></div><div class="ccase-label"><div class="ccase-name">Home &amp; Field Services</div><div class="ccase-line">Quotes, dispatch and scheduling.</div></div></div>
    <div class="ccase"><div class="ccase-bg" id="img-coffee-exchange"></div><div class="ccase-ov"></div><div class="ccase-label"><div class="ccase-name">Hospitality</div><div class="ccase-line">Reservations and hours, around the clock.</div></div></div>
    <div class="ccase"><div class="ccase-bg" id="img-wetech"></div><div class="ccase-ov"></div><div class="ccase-label"><div class="ccase-name">Professional Services</div><div class="ccase-line">New-client intake, captured properly.</div></div></div>
    <div class="ccase"><div class="ccase-bg" id="img-ram-bharose"></div><div class="ccase-ov"></div><div class="ccase-label"><div class="ccase-name">Restaurants</div><div class="ccase-line">Takeout and booking calls, never missed.</div></div></div>
  </div>
  <div class="container">
    ${tags(['Junk removal', 'Dumpster rental', 'Towing', 'Locksmiths', 'HVAC &amp; plumbing', 'Restoration', 'Cleaning', 'Medical &amp; dental', 'Law firms', 'Property management', 'Real estate', 'Dealerships'])}
  </div>
</section>

${ctaSection({
  eyebrow: 'Built for your business, before you pay anything',
  h1: 'Hear it answer<br><strong>your phone.</strong>',
  sub: 'We build a demo agent for your business, then call you so you can hear it live.',
})}
`,
});

// ── DEMO ──────────────────────────────────────────────────────────
page({
  file: 'demo/index.html',
  navKey: 'demo',
  title: 'Hear a Demo — AIM Media',
  desc: 'We build a working AI voice agent for your business, then call you so you can hear it live on a three-way call. No computer, no sales pitch, no cost.',
  body: `
${innerHero({
  crumb: 'Hear a Demo',
  bgNum: '☎',
  eyebrow: 'Free Custom Demo',
  h1a: 'Do not take',
  h1b: 'our word.',
  sub: 'We build a working agent for your business, then call you so you can hear it handle a real conversation. Takes about five minutes.',
  cta: `<a href="/book" class="btn-primary">Start My Demo →</a>`,
})}

<section class="sect">
  <div class="container">
    <div class="s-tag rev">How It Works</div>
    <h2 class="s-title rev">Three steps.<br><em>No computer needed.</em></h2>
    ${steps([
      ['You tell us what you do', 'A few details about your business, your hours and the calls you get. That is all we need to build it.'],
      ['We build your agent', 'A real voice agent trained on your services, your pricing questions and your booking rules.'],
      ['We call you', 'A normal phone call. We conference in the agent, you talk to it, and you hear exactly what your callers would hear.'],
    ])}
  </div>
</section>

<section class="sect">
  <div class="container">
    <div class="s-tag rev">After The Call</div>
    <h2 class="s-title rev" style="margin-bottom:1rem">You get the paperwork<br><em>your callers would generate.</em></h2>
    ${facts([
      ['Summary', 'The call summary notification lands in your inbox, exactly as it would in production.'],
      ['Transcript', 'Every word captured, so you can see what the agent heard and what it recorded.'],
      ['No pitch', 'If it is not a fit, we will say so. Most of our clients use it purely as a backup line.'],
    ])}
  </div>
</section>

${ctaSection({
  eyebrow: 'Free · No obligation · About five minutes',
  h1: 'Request your<br><strong>demo agent.</strong>',
  sub: 'Serving businesses across Ontario, Canada.',
  btn: 'Start My Demo →',
  href: '/book',
})}
`,
});

// ── BOOK (interactive funnel) ───────────────────────────────────────
function qzOptions(field, items, auto = true) {
  return `<div class="qz-options" data-field="${field}" data-type="single" data-auto="${auto}">
      ${items.map(v => `<button type="button" class="qz-option" data-value="${v}">${v}</button>`).join('\n      ')}
    </div>`;
}

function renderQuiz() {
  return `
<section id="quiz-app" data-endpoint="/api/book">
  <div class="qz-head container">
    <div class="crumb"><a href="/">Home</a><span>/</span><span>Hear a Demo</span></div>
    <div class="hero-eyebrow">Free Consult · About 60 Seconds</div>
    <h1 class="qz-title">Let's get this<br><em>moving.</em></h1>
  </div>

  <div class="qz-wrap">
    <div class="qz-progress"><span class="qz-progress-fill"></span></div>
    <div class="qz-progress-label"><span class="qz-step-current">1</span> / <span class="qz-step-total">8</span></div>

    <div class="qz-stage">

      <div class="qz-step qz-active" data-step="1">
        <div class="qz-eyebrow">Quick Start</div>
        <h2 class="qz-question">What do you need help with?</h2>
        ${qzOptions('interest', [
          'Voice Agents — stop missing calls',
          'Digital Marketing',
          'Content',
          'AI Automations',
          'Not sure yet — exploring',
        ])}
      </div>

      <div class="qz-step" data-step="2">
        <div class="qz-eyebrow">About You</div>
        <h2 class="qz-question">What's the business called?</h2>
        <div class="qz-fields">
          <input class="qz-input" type="text" data-field="business" placeholder="Business name" required autocomplete="organization" />
        </div>
      </div>

      <div class="qz-step" data-step="3">
        <div class="qz-eyebrow">Industry</div>
        <h2 class="qz-question">What industry are you in?</h2>
        ${qzOptions('industry', [
          'Towing &amp; Logistics', 'Dealership', 'Restaurant', 'HVAC &amp; Plumbing',
          'Real Estate', 'Law Firm', 'Medical &amp; Dental', 'Property Management',
          'Cleaning', 'Junk Removal &amp; Dumpster', 'Locksmith', 'Other',
        ])}
      </div>

      <div class="qz-step" data-step="4">
        <div class="qz-eyebrow">The Gap</div>
        <h2 class="qz-question">What's the biggest gap right now?</h2>
        ${qzOptions('pain', [
          'Calls go to voicemail after hours',
          "We're too busy to answer everything",
          'Repetitive questions eat up our time',
          'Following up with leads takes too long',
          'Not sure yet',
        ])}
      </div>

      <div class="qz-step" data-step="5">
        <div class="qz-eyebrow">Scale</div>
        <h2 class="qz-question">Roughly how many calls or leads do you get weekly?</h2>
        ${qzOptions('volume', ['Under 20', '20–50', '50–150', '150+'])}
      </div>

      <div class="qz-step" data-step="6">
        <div class="qz-eyebrow">Timeline</div>
        <h2 class="qz-question">When do you want this live?</h2>
        ${qzOptions('timeline', ['ASAP', 'This month', 'Just exploring'])}
      </div>

      <div class="qz-step" data-step="7">
        <div class="qz-eyebrow">Contact</div>
        <h2 class="qz-question">Where should we reach you?</h2>
        <div class="qz-fields qz-fields-stack">
          <input class="qz-input" type="text" data-field="name" placeholder="Your name" required autocomplete="name" />
          <input class="qz-input" type="tel" data-field="phone" placeholder="Phone number" required autocomplete="tel" />
          <input class="qz-input" type="email" data-field="email" placeholder="Email (optional)" autocomplete="email" />
        </div>
      </div>

      <div class="qz-step" data-step="8">
        <div class="qz-eyebrow">Almost Done</div>
        <h2 class="qz-question">Pick up to 2 times that usually work</h2>
        <div class="qz-slots" id="qz-slots" data-field="slots" data-max="2"></div>
        <textarea class="qz-input qz-textarea" data-field="notes" placeholder="Anything else we should know? (optional)"></textarea>
        <input type="text" class="qz-hp" id="qz-hp" name="company_website" tabindex="-1" autocomplete="off" aria-hidden="true" />
      </div>

    </div>

    <div class="qz-nav">
      <button type="button" class="qz-back btn-ghost" id="qz-back">← Back</button>
      <button type="button" class="qz-next btn-primary" id="qz-next">Next →</button>
    </div>

    <div class="qz-panel qz-done" id="qz-done">
      <div class="qz-done-check">✓</div>
      <h2 class="qz-question">Got it<span id="qz-done-name"></span>.</h2>
      <p class="qz-done-sub">We'll call you within one business day to talk it through. Prefer email? Write to <a href="mailto:${EMAIL}">${EMAIL}</a> instead.</p>
    </div>

    <div class="qz-panel qz-error" id="qz-error">
      <h2 class="qz-question">Something went wrong.</h2>
      <p class="qz-done-sub">Your details weren't saved. Please email us directly at <a href="mailto:${EMAIL}">${EMAIL}</a> and we'll take it from there.</p>
    </div>
  </div>
</section>`;
}

page({
  file: 'book/index.html',
  navKey: 'book',
  title: 'Hear a Demo — AIM Media',
  desc: 'Answer a few quick questions and get a free consult on voice agents, digital marketing, content or AI automation. Takes about a minute.',
  body: renderQuiz(),
});

// ── PRICING ───────────────────────────────────────────────────────
page({
  file: 'pricing/index.html',
  navKey: 'pricing',
  title: 'Pricing — AIM Media',
  desc: 'AI voice agents priced on call volume, typically 60 to 70 percent less than a traditional answering service. Month to month, no long-term agreement.',
  body: `
${innerHero({
  crumb: 'Pricing',
  bgNum: '$',
  eyebrow: 'Pricing',
  h1a: 'Priced on',
  h1b: 'call volume.',
  sub: 'You pay for a minute package that includes building, maintaining and improving your agent. No setup trap, no lock-in.',
  cta: `<a href="/book" class="btn-primary">Get a Quote →</a>`,
})}

<section class="sect">
  <div class="container">
    <div class="s-tag rev">The Comparison</div>
    <h2 class="s-title rev">What you would<br><em>otherwise pay.</em></h2>
    ${COST_VIZ}
  </div>
</section>

<section class="sect">
  <div class="container">
    <div class="s-tag rev">What Is Included</div>
    <h2 class="s-title rev" style="margin-bottom:1rem">Everything except<br><em>the lock-in.</em></h2>
    ${tags(['Agent build', 'Ongoing maintenance', 'Conversation tuning', 'Call summaries', 'CRM &amp; calendar sync', 'Call forwarding setup', 'Routing changes', 'Support'])}
    ${facts([
      ['Month&nbsp;to&nbsp;month', 'Cancel before your next billing period. That is the whole process.'],
      ['Minute packages', 'Priced to your actual call volume, not a headcount you do not have.'],
      ['Days to live', 'Build, test on a forwarding number, then switch it on.'],
    ])}
  </div>
</section>

<section class="sect">
  <div class="container">
    <div class="s-tag rev">Getting Started</div>
    <h2 class="s-title rev">From call to live<br><em>in four moves.</em></h2>
    ${steps([
      ['Demo', 'We build an agent for your business and call you so you can hear it.'],
      ['Tune', 'We adjust the script, the questions and the booking rules until it sounds right.'],
      ['Test', 'You get a forwarding number to call as much as you like before anything goes live.'],
      ['Switch on', 'We walk you through call forwarding. Usually a few days end to end.'],
    ])}
  </div>
</section>

${ctaSection({
  eyebrow: 'Tell us your call volume, we will tell you the number',
  h1: 'Get your<br><strong>quote.</strong>',
  sub: 'Month to month · No long-term agreement · Ontario, Canada',
  btn: 'Get a Quote →',
  href: '/book',
})}
`,
});

// ── USE CASE TEMPLATE ─────────────────────────────────────────────
function useCase({ file, navKey, title, desc, crumb, bgNum, eyebrow, h1a, h1b, sub, tagline, nodes, handles, factList, ctaH1 }) {
  page({
    file, navKey, title, desc,
    body: `
${innerHero({ crumb, bgNum, eyebrow, h1a, h1b, sub })}

<section class="sect">
  <div class="container">
    <div class="s-tag rev">The Call</div>
    <h2 class="s-title rev">${tagline}</h2>
    ${flow(nodes)}
  </div>
</section>

<section class="sect">
  <div class="container">
    <div class="s-tag rev">What It Handles</div>
    <h2 class="s-title rev" style="margin-bottom:0.5rem">No script required.</h2>
    ${tags(handles)}
  </div>
</section>

<section class="sect">
  <div class="container">
    ${facts(factList)}
  </div>
</section>

${ctaSection({
  eyebrow: 'Hear it handle one of your calls',
  h1: ctaH1,
  sub: 'Free custom demo · Ontario, Canada',
})}
`,
  });
}

useCase({
  file: 'use-cases/front-desk/index.html',
  navKey: 'front-desk',
  title: 'Front Desk — AIM Media',
  desc: 'An AI voice agent for front desk teams: answers every call, books and moves appointments, routes to the right person, and covers after hours and overflow.',
  crumb: 'Front Desk',
  bgNum: 'FD',
  eyebrow: 'Use Case · Front Desk',
  h1a: 'Two callers.',
  h1b: 'One of you.',
  sub: 'Your front desk cannot answer the phone and the person at the counter at the same time. The agent takes whichever call you cannot.',
  tagline: 'Answered while you are<br><em>already talking.</em>',
  nodes: [
    ['Ring', 'Line is busy or after hours'],
    ['Answer', 'Greeted in your business name'],
    ['Handle', 'Hours, location, or a booking'],
    ['Route', 'To the right person if needed'],
    ['Sync', 'Calendar updated, summary sent'],
  ],
  handles: ['Inbound answering', 'Business hours &amp; location', 'New bookings', 'Reschedules &amp; cancellations', 'Caller details captured', 'Department routing', 'After-hours coverage', 'Overflow calls'],
  factList: [
    ['Never busy', 'Ten calls at once are ten calls answered, not nine voicemails.'],
    ['Same answer', 'Every caller gets the same hours, the same pricing, the same tone.'],
    ['In your calendar', 'Bookings land where your team already looks. No re-entry.'],
  ],
  ctaH1: 'Hear it work<br><strong>your front desk.</strong>',
});

useCase({
  file: 'use-cases/customer-support/index.html',
  navKey: 'customer-support',
  title: 'Customer Support — AIM Media',
  desc: 'An AI voice agent for support lines: resolves the repeat questions instantly, opens a ticket with full context when a human is needed, and covers after hours.',
  crumb: 'Customer Support',
  bgNum: 'CS',
  eyebrow: 'Use Case · Customer Support',
  h1a: 'The same question,',
  h1b: 'the tenth time.',
  sub: 'Most support calls are the same handful of questions. The agent clears those instantly so your team gets the ones that actually need a person.',
  tagline: 'Resolved, or escalated<br><em>with the context attached.</em>',
  nodes: [
    ['Ring', 'Queue is full or it is after hours'],
    ['Identify', 'What the caller actually needs'],
    ['Resolve', 'Order status, account, basic fixes'],
    ['Escalate', 'Ticket opened if a human is needed'],
    ['Sync', 'Full transcript attached, nothing repeated'],
  ],
  handles: ['Order &amp; account questions', 'FAQ handling', 'First-line troubleshooting', 'Ticket creation', 'Escalation with context', 'After-hours support', 'Callback requests', 'Consistent answers'],
  factList: [
    ['No hold music', 'Routine calls get answered instead of queued behind a complex one.'],
    ['Full context', 'Your team opens the ticket already knowing the whole story.'],
    ['Off the clock', 'Support keeps running after your team logs off.'],
  ],
  ctaH1: 'Hear it clear<br><strong>your queue.</strong>',
});

useCase({
  file: 'use-cases/intake/index.html',
  navKey: 'intake',
  title: 'Intake — AIM Media',
  desc: 'An AI voice agent for intake: captures and qualifies every inbound lead the same way, records it in your CRM, and flags the urgent ones immediately.',
  crumb: 'Intake',
  bgNum: 'IN',
  eyebrow: 'Use Case · Intake',
  h1a: 'A lead on a',
  h1b: 'sticky note.',
  sub: 'Whoever answers decides what gets asked. The agent asks the same qualifying questions every time and writes the answers straight into your CRM.',
  tagline: 'Qualified before<br><em>you pick up the file.</em>',
  nodes: [
    ['Ring', 'A new enquiry comes in'],
    ['Qualify', 'Service, urgency, location, budget'],
    ['Record', 'Structured entry in your CRM'],
    ['Route', 'To the right person on your team'],
    ['Alert', 'Urgent jobs flagged immediately'],
  ],
  handles: ['Lead capture', 'Structured qualification', 'Service type', 'Urgency', 'Service area', 'Budget range', 'CRM records', 'Lead routing', 'Caller confirmation', 'Priority alerts'],
  factList: [
    ['Same questions', 'Every lead qualified identically, regardless of who was on shift.'],
    ['Straight to CRM', 'No transcribing a notepad at the end of the day.'],
    ['Urgent first', 'Emergency jobs get flagged the moment the call ends.'],
  ],
  ctaH1: 'Hear it qualify<br><strong>a real lead.</strong>',
});

useCase({
  file: 'use-cases/call-center/index.html',
  navKey: 'call-center',
  title: 'Call Center — AIM Media',
  desc: 'An AI voice agent for high-volume call centers: triages intent, absorbs peak volume and overflow, resolves routine calls, and hands off with full context.',
  crumb: 'Call Center',
  bgNum: 'CC',
  eyebrow: 'Use Case · Call Center',
  h1a: 'Peak volume,',
  h1b: 'flat headcount.',
  sub: 'When the queue spikes, callers hang up. The agent absorbs the overflow, resolves what it can, and passes the rest to an agent with the call already summarised.',
  tagline: 'Triaged before it<br><em>reaches a person.</em>',
  nodes: [
    ['Ring', 'Volume spike or overflow'],
    ['Triage', 'Intent identified in seconds'],
    ['Resolve', 'Routine requests handled outright'],
    ['Hand off', 'Complex calls to an available agent'],
    ['Sync', 'Context transferred, nothing repeated'],
  ],
  handles: ['High-volume inbound', 'Intent triage', 'Queue &amp; overflow', 'Routine resolution', 'Agent handoff', 'Context transfer', 'Multi-location', 'Call reporting'],
  factList: [
    ['No abandons', 'Spikes get absorbed instead of turning into hang-ups.'],
    ['Agents on hard calls', 'Human time goes to the calls that need judgment.'],
    ['Every location', 'One standard of handling across every site you run.'],
  ],
  ctaH1: 'Hear it absorb<br><strong>a volume spike.</strong>',
});

// ── SERVICE TEMPLATE ──────────────────────────────────────────────
function service({ file, navKey, title, desc, crumb, bgNum, eyebrow, h1a, h1b, sub, sectionTag, sectionTitle, covers, factList, ctaH1 }) {
  page({
    file, navKey, title, desc,
    body: `
${innerHero({ crumb, bgNum, eyebrow, h1a, h1b, sub })}

<section class="sect">
  <div class="container">
    <div class="s-tag rev">${sectionTag}</div>
    <h2 class="s-title rev" style="margin-bottom:0.5rem">${sectionTitle}</h2>
    ${tags(covers)}
  </div>
</section>

<section class="sect">
  <div class="container">
    ${facts(factList)}
  </div>
</section>

${ctaSection({
  eyebrow: 'See it applied to your business',
  h1: ctaH1,
  sub: 'Free custom demo · Ontario, Canada',
})}
`,
  });
}

service({
  file: 'services/voice-system-design/index.html',
  navKey: 'svd',
  title: 'Voice System Design — AIM Media',
  desc: 'We map how your business actually handles calls, then design the agent around it — questions, routing, escalation and booking rules.',
  crumb: 'Voice System Design',
  bgNum: '01',
  eyebrow: 'Service · Voice System Design',
  h1a: 'Designed around',
  h1b: 'your calls.',
  sub: 'We map how your calls actually run today, then build the agent around that — not a generic script pointed at your number.',
  sectionTag: 'What We Design',
  sectionTitle: 'The blueprint<br><em>before the build.</em>',
  covers: ['Call mapping', 'Agent role', 'Conversation flow', 'Qualifying questions', 'Information captured', 'Handoff rules', 'Escalation triggers', 'Booking rules', 'Integration plan'],
  factList: [
    ['Your words', 'The agent uses your service names, your pricing answers, your policies.'],
    ['Your rules', 'You decide what it books, what it escalates and what it never promises.'],
    ['Tuned live', 'You test it on a forwarding number and we adjust until it sounds right.'],
  ],
  ctaH1: 'Design your<br><strong>voice system.</strong>',
});

service({
  file: 'services/infra-as-a-service/index.html',
  navKey: 'iaas',
  title: 'Infra-as-a-Service — AIM Media',
  desc: 'The voice platform, AI model, telephony and integrations behind your agent, selected and managed by AIM Media as one operational layer.',
  crumb: 'Infra-as-a-Service',
  bgNum: '02',
  eyebrow: 'Service · Infra-as-a-Service',
  h1a: 'One partner.',
  h1b: 'Not five vendors.',
  sub: 'A working voice agent sits on a stack of platforms, models and carriers. We pick them, connect them and run them, so you deal with one bill and one phone number.',
  sectionTag: 'What We Run',
  sectionTitle: 'The stack<br><em>you never see.</em>',
  covers: ['Voice platform', 'AI models', 'Telephony &amp; numbers', 'Speech recognition', 'Speech synthesis', 'Call forwarding', 'APIs &amp; webhooks', 'CRM integration', 'Calendar integration', 'Notifications'],
  factList: [
    ['No lock-in', 'We are not tied to one provider. If something better appears, we move you.'],
    ['One number to call', 'When something needs fixing, you call us, not four support desks.'],
    ['Your tools stay', 'The agent plugs into the CRM and calendar you already use.'],
  ],
  ctaH1: 'Let us run<br><strong>the stack.</strong>',
});

service({
  file: 'services/managed-voice-operations/index.html',
  navKey: 'mvo',
  title: 'Managed Voice Operations — AIM Media',
  desc: 'Ongoing monitoring, tuning and maintenance of your AI voice agent — call quality, uptime, integrations and conversation improvements.',
  crumb: 'Managed Voice Operations',
  bgNum: '03',
  eyebrow: 'Service · Managed Voice Operations',
  h1a: 'You run the business.',
  h1b: 'We run the phone.',
  sub: 'Going live is day one. We keep listening to real calls and tightening the agent for as long as you are with us.',
  sectionTag: 'What We Manage',
  sectionTitle: 'Watched, tuned,<br><em>kept honest.</em>',
  covers: ['Call quality review', 'Uptime monitoring', 'Conversation tuning', 'Routing changes', 'Integration upkeep', 'New services added', 'Seasonal script changes', 'New locations', 'Reporting'],
  factList: [
    ['Included', 'Maintenance and optimisation come with your minute package, not as an add-on.'],
    ['Real calls', 'We tune against what your actual callers say, not a test script.'],
    ['It grows', 'Add services, departments or locations without starting over.'],
  ],
  ctaH1: 'Hand us<br><strong>the phone line.</strong>',
});

// ── SOLUTIONS (other verticals) ───────────────────────────────────
// Same shape as service(), but the CTA goes straight to /book — /demo
// is a voice-agent-specific explainer and doesn't fit these verticals.
function vertical({ file, navKey, title, desc, crumb, bgNum, eyebrow, h1a, h1b, sub, sectionTag, sectionTitle, covers, factList, ctaH1 }) {
  page({
    file, navKey, title, desc,
    body: `
${innerHero({ crumb, bgNum, eyebrow, h1a, h1b, sub, cta: '<a href="/book" class="btn-primary">Start the Conversation →</a>' })}

<section class="sect">
  <div class="container">
    <div class="s-tag rev">${sectionTag}</div>
    <h2 class="s-title rev" style="margin-bottom:0.5rem">${sectionTitle}</h2>
    ${tags(covers)}
  </div>
</section>

<section class="sect">
  <div class="container">
    ${facts(factList)}
  </div>
</section>

${ctaSection({
  eyebrow: 'Tell us what you are working with',
  h1: ctaH1,
  sub: 'Free consult · Ontario, Canada',
  href: '/book',
})}
`,
  });
}

vertical({
  file: 'digital-marketing/index.html',
  navKey: 'digital-marketing',
  title: 'Digital Marketing — AIM Media',
  desc: 'AIM Media runs digital marketing built to bring in the calls and leads your business (and your voice agent) can actually convert.',
  crumb: 'Digital Marketing',
  bgNum: 'DM',
  eyebrow: 'Solutions · Digital Marketing',
  h1a: 'Traffic that',
  h1b: 'earns the call.',
  sub: 'Campaigns and search presence built to bring in leads worth answering, not just clicks.',
  sectionTag: 'What We Run',
  sectionTitle: 'Built to convert,<br><em>not just to click.</em>',
  covers: ['Paid search', 'Paid social', 'SEO', 'Local &amp; Google Business Profile', 'Landing pages', 'Retargeting', 'Conversion tracking', 'Reporting &amp; dashboards'],
  factList: [
    ['No vanity metrics', 'We report on calls and leads booked, not impressions.'],
    ['Built for local', 'Campaigns tuned to the service areas your business actually covers.'],
    ['Works with the rest', 'Feeds straight into the voice agent and CRM you already run.'],
  ],
  ctaH1: 'See what we would<br><strong>run for you.</strong>',
});

vertical({
  file: 'content/index.html',
  navKey: 'content',
  title: 'Content — AIM Media',
  desc: 'AIM Media produces short-form video, written content and social content on a system, so it goes out every week instead of whenever there is time.',
  crumb: 'Content',
  bgNum: 'CO',
  eyebrow: 'Solutions · Content',
  h1a: 'Content that',
  h1b: 'shows up on schedule.',
  sub: 'Short-form video, written content and social, produced on a system instead of ad hoc.',
  sectionTag: 'What We Produce',
  sectionTitle: 'Made to run<br><em>every week, not once.</em>',
  covers: ['Short-form video', 'Blog &amp; SEO writing', 'Social content calendars', 'Photography direction', 'Email newsletters', 'Case studies', 'Repurposing &amp; editing', 'Brand voice &amp; guidelines'],
  factList: [
    ['A real calendar', 'Content planned and produced on a schedule, not whenever there is time.'],
    ['Built to convert', 'Every piece points somewhere: a call, a form, a booked demo.'],
    ['One brand voice', 'Consistent across video, writing and social, however many people touch it.'],
  ],
  ctaH1: 'See what we would<br><strong>create for you.</strong>',
});

vertical({
  file: 'ai-automations/index.html',
  navKey: 'ai-automations',
  title: 'AI Automations — AIM Media',
  desc: 'AIM Media builds custom AI workflows and internal tools that take repetitive manual work off your team, beyond the phone line.',
  crumb: 'AI Automations',
  bgNum: 'AA',
  eyebrow: 'Solutions · AI Automations',
  h1a: 'The busywork,',
  h1b: 'automated.',
  sub: 'Custom workflows and internal tools that take repetitive work off your team, wherever it happens.',
  sectionTag: 'What We Build',
  sectionTitle: 'Automations that<br><em>run without you.</em>',
  covers: ['Workflow automation', 'Internal chatbots &amp; tools', 'Data entry &amp; sync', 'Reporting &amp; dashboards', 'Email &amp; CRM automation', 'Document processing', 'API integrations', 'Custom scripts &amp; tooling'],
  factList: [
    ['Built around your tools', 'Automations connect to the software you already run your business on.'],
    ['Not just a chatbot', 'Anywhere your team does the same task by hand is worth automating.'],
    ['Maintained, not abandoned', 'We keep watching and adjusting automations after they go live, same as the voice agent.'],
  ],
  ctaH1: 'See what we would<br><strong>automate for you.</strong>',
});

// ── ABOUT ─────────────────────────────────────────────────────────
page({
  file: 'resources/about/index.html',
  navKey: 'about',
  title: 'About — AIM Media',
  desc: 'AIM Media builds and manages AI voice agents for call-driven businesses across Ontario, Canada.',
  body: `
${innerHero({
  crumb: 'About',
  bgNum: 'AM',
  eyebrow: 'About AIM Media',
  h1a: 'We answer',
  h1b: 'what you miss.',
  sub: 'AIM Media builds and runs AI voice agents for call-driven businesses across Ontario. One thing, done properly.',
})}

<section class="sect">
  <div class="container">
    ${facts([
      ['Ontario', 'We work with call-driven businesses across the province, from single trucks to multi-location operations.'],
      ['One product', 'Voice agents. Not ads, not content, not a general automation shop.'],
      ['Backup, not replacement', 'We say this to every prospect: humans still handle calls better. We catch the ones nobody was there for.'],
    ])}
    <div class="about-quote rev" style="max-width:820px;margin-top:3.5rem">"We are in the AI space and we still think a person handles a call better. This replaces your voicemail, not your team."</div>
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
      <div class="fp-role">Builds</div>
      <div class="fp-name">Krish<br>Kaushik</div>
      <div class="fp-school">Odette School of Business · University of Windsor</div>
      <div class="fp-bio">Builds and tunes the agents — call flows, qualifying questions, and the integrations that put a call into your CRM.</div>
    </div>
  </div>
  <div class="founder-panel fp-right rev-r">
    <div class="fp-bg" id="img-kartik"></div>
    <div class="fp-vignette"></div>
    <canvas class="founder-hover-canvas" id="fc-kartik"></canvas>
    <div class="fp-content">
      <div class="fp-role">Operates</div>
      <div class="fp-name">Kartik<br>Garg</div>
      <div class="fp-school">Odette School of Business · University of Windsor</div>
      <div class="fp-bio">Runs the client side — mapping how each business takes calls, and making sure the agent earns its place on the phone line.</div>
    </div>
  </div>
</section>

${ctaSection({
  eyebrow: 'Talk to the people who build it',
  h1: 'Hear what we<br><strong>would build you.</strong>',
  sub: 'Free custom demo · Ontario, Canada',
})}
`,
});

// ── PROCESS ───────────────────────────────────────────────────────
page({
  file: 'resources/process/index.html',
  navKey: 'process',
  title: 'Process — AIM Media',
  desc: 'How AIM Media takes an AI voice agent from first call to live on your phone line, usually in a matter of days.',
  body: `
${innerHero({
  crumb: 'Process',
  bgNum: '06',
  eyebrow: 'How We Work',
  h1a: 'Six steps.',
  h1b: 'Usually days.',
  sub: 'Most of the work sits on our side. Here is the whole thing, start to finish.',
})}

<section class="sect">
  <div class="container">
    ${steps([
      ['Demo', 'We build an agent for your business and call you so you can hear it handle a real conversation.'],
      ['Map', 'We work out your hours, your call types, your booking rules and where calls should go.'],
      ['Build', 'The agent is trained on your services and connected to your CRM, calendar and notifications.'],
      ['Test', 'You get a forwarding number. Call it as often as you like and tell us what to change.'],
      ['Go live', 'We walk you through call forwarding and switch it on.'],
      ['Tune', 'We keep reviewing real calls and tightening the agent. Included, ongoing.'],
    ])}
  </div>
</section>

${ctaSection({
  eyebrow: 'Step one costs nothing',
  h1: 'Start with<br><strong>the demo.</strong>',
  sub: 'Free custom demo · Ontario, Canada',
})}
`,
});

// ── VISION ────────────────────────────────────────────────────────
page({
  file: 'resources/vision/index.html',
  navKey: 'vision',
  title: 'Vision — AIM Media',
  desc: 'What AIM Media believes about AI voice: it should be reliable infrastructure that backs up human teams, not a novelty that replaces them.',
  body: `
${innerHero({
  crumb: 'Vision',
  bgNum: '∞',
  eyebrow: 'What We Believe',
  h1a: 'A backup line',
  h1b: 'that never sleeps.',
  sub: 'Four things we tell every business that asks us what this is actually for.',
})}

<section class="sect">
  <div class="container">
    ${steps([
      ['Voicemail is a leak, not a safety net', 'Four out of five callers who hit it hang up and dial someone else. A recording is not coverage.'],
      ['AI should back up people, not replace them', 'Your team handles a call better. The agent exists for the hours and the moments nobody is free.'],
      ['A call is only useful if it becomes a record', 'An answered call that never reaches your CRM or calendar has solved nothing.'],
      ['Reliability beats novelty', 'A voice agent that impresses once and breaks under real volume is worse than no agent at all.'],
    ])}
  </div>
</section>

${ctaSection({
  eyebrow: 'See what that looks like on your line',
  h1: 'Hear the<br><strong>difference.</strong>',
  sub: 'Free custom demo · Ontario, Canada',
})}
`,
});

// ── PRIVACY ───────────────────────────────────────────────────────
page({
  file: 'privacy/index.html',
  navKey: 'privacy',
  title: 'Privacy Policy — AIM Media',
  desc: 'How AIM Media collects, uses and protects information while building and running AI voice agents.',
  body: `
${innerHero({
  crumb: 'Privacy',
  bgNum: '§',
  eyebrow: 'Legal',
  h1a: 'Privacy',
  h1b: 'Policy.',
  sub: 'How we handle information while building and running voice agents.',
  cta: ' ',
})}

<section class="sect">
  <div class="container">
    <div class="legal-content">
      <span class="legal-updated">Last updated · August 2026</span>

      <h2>Overview</h2>
      <p>This policy describes how AIM Media collects, uses and protects information when we build and operate AI voice agents for clients, and when visitors use this website. It covers AIM Media only — the businesses we build agents for remain responsible for their own compliance obligations.</p>

      <h2>What We Collect</h2>
      <ul>
        <li>Contact details you give us directly, such as your name, business name, email and phone number.</li>
        <li>Call audio, transcripts and caller-provided details processed by an agent we operate for a client.</li>
        <li>Operational information shared while scoping an agent, such as your hours, services and booking rules.</li>
        <li>Standard website usage information.</li>
      </ul>

      <h2>How We Use It</h2>
      <p>To build, test, run, maintain and improve voice agents; to respond to enquiries; and to communicate with clients and prospective clients. Call data from a live agent is used to operate that agent and, with the client's authorisation, to improve how it handles conversations.</p>

      <h2>Third-Party Providers</h2>
      <p>Running a voice agent requires third-party providers — telephony carriers, AI model providers, speech recognition and synthesis services, and whichever CRM, calendar or ticketing platform a client already uses. These providers process data as part of operating the system. We select and manage them on the client's behalf.</p>

      <h2>Call Recording</h2>
      <p>Where an agent records or transcribes calls, the client is responsible for meeting the notice and consent requirements that apply to their business and jurisdiction. We configure agents to support those requirements and will advise on them, but we do not provide legal advice.</p>

      <h2>Retention</h2>
      <p>We keep information for as long as needed to run the service and meet legitimate business or legal requirements. Retention periods for call data are agreed with each client.</p>

      <h2>Regulated Industries</h2>
      <p>Some clients operate in regulated sectors such as healthcare or legal services. AIM Media does not claim any specific regulatory certification. Clients in those sectors remain responsible for confirming that a deployed agent meets the obligations that apply to them, and we will work with them to configure it appropriately.</p>

      <h2>Security</h2>
      <p>We take reasonable administrative and technical measures to protect the information we handle, and work with providers that maintain their own security practices. No system can be guaranteed completely secure. Clients with specific security requirements should raise them with us directly.</p>

      <h2>Your Choices</h2>
      <p>Contact us at any time to ask what information we hold about you, to correct it, or to request deletion where applicable and not subject to a retention obligation.</p>

      <h2>Changes</h2>
      <p>We may update this policy. The date at the top of this page reflects the most recent revision.</p>

      <h2>Contact</h2>
      <p>Questions can be sent to <a href="mailto:${EMAIL}" style="color:var(--accent)">${EMAIL}</a>.</p>
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
  desc: 'The terms that govern engagements with AIM Media for building and running AI voice agents.',
  body: `
${innerHero({
  crumb: 'Terms',
  bgNum: '§',
  eyebrow: 'Legal',
  h1a: 'Terms of',
  h1b: 'Service.',
  sub: 'The terms that govern engagements with AIM Media.',
  cta: ' ',
})}

<section class="sect">
  <div class="container">
    <div class="legal-content">
      <span class="legal-updated">Last updated · August 2026</span>

      <h2>Agreement</h2>
      <p>These terms govern your use of this website and any engagement with AIM Media for building or operating AI voice agents. By engaging AIM Media or using this site, you agree to them.</p>

      <h2>Services</h2>
      <p>AIM Media designs, builds and operates AI voice agents for call-driven businesses. The scope of any engagement is set out in a separate proposal or agreement between AIM Media and the client.</p>

      <h2>Billing And Cancellation</h2>
      <p>Engagements are billed on a month-to-month basis against an agreed minute package unless a separate written agreement says otherwise. There is no long-term commitment. Cancelling before the next billing period ends the arrangement, and no further amounts fall due for periods after cancellation.</p>

      <h2>Client Responsibilities</h2>
      <p>Clients are responsible for giving us accurate information about their operations, for holding any rights needed to connect our systems to their existing tools, and for ensuring their use of a deployed agent complies with the laws that apply to their industry and jurisdiction — including any call recording or caller consent requirements.</p>

      <h2>No Guaranteed Outcomes</h2>
      <p>A voice agent adds coverage; it does not guarantee specific business results, call volume or revenue. We work to build and maintain a reliable agent, but outcomes depend on factors outside our control, including your own operations and third-party service availability.</p>

      <h2>Intellectual Property</h2>
      <p>Each party keeps ownership of its own pre-existing intellectual property. Ownership of configurations and integrations built specifically for a client is addressed in that engagement's agreement.</p>

      <h2>Third-Party Services</h2>
      <p>Our service depends on third-party voice platforms, AI models, carriers and integration partners. We are not responsible for outages or changes originating from those providers, though we select them carefully and respond promptly when issues arise.</p>

      <h2>Limitation Of Liability</h2>
      <p>To the maximum extent permitted by law, AIM Media is not liable for indirect, incidental or consequential damages arising from the use of a deployed agent or this website. Nothing here limits liability that cannot be limited under applicable law.</p>

      <h2>Changes</h2>
      <p>We may update these terms. Continued use of our services after an update constitutes acceptance of the revised terms.</p>

      <h2>Governing Law</h2>
      <p>These terms are governed by the laws of the Province of Ontario, Canada, without regard to conflict-of-law principles.</p>

      <h2>Contact</h2>
      <p>Questions can be sent to <a href="mailto:${EMAIL}" style="color:var(--accent)">${EMAIL}</a>.</p>
    </div>
  </div>
</section>
`,
});

console.log('\nAll pages generated.\n');
