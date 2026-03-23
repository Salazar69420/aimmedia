/**
 * AIM Media — Build Script v2
 * WaveSpeed AI · NanoBanana 2 (images) · LTX 2.3 (video + audio)
 *
 * Run: node build.js
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, 'assets');
const API_KEY = '84cec76d1d6c3f0e860e43e7c7519d90a8a3a6838a24e6f59a3a249f8b86ce7a';
const BASE_URL = 'https://api.wavespeed.ai/api/v3';

if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

// ── HELPERS ──────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`Non-JSON response: ${text.substring(0, 200)}`); }
}

async function submit(endpoint, body) {
  const json = await apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) });
  if (json.code !== 200 && !json.data?.id) {
    throw new Error(json.message || `Submit failed: ${JSON.stringify(json).substring(0, 200)}`);
  }
  return json.data;
}

async function poll(taskId, { interval = 2500, timeout = 360000, label = taskId } = {}) {
  const start = Date.now();
  let dots = 0;
  while (Date.now() - start < timeout) {
    await new Promise(r => setTimeout(r, interval));
    const json = await apiFetch(`predictions/${taskId}/result`);
    const status = json.data?.status;
    dots = (dots + 1) % 4;
    process.stdout.write(`\r  ⏳ ${label} · ${status}${'.'.repeat(dots)}   `);
    if (status === 'completed') {
      process.stdout.write('\n');
      return json.data;
    }
    if (status === 'failed') throw new Error(`Task failed: ${json.data?.error || 'unknown'}`);
  }
  throw new Error(`Timeout after ${timeout / 1000}s for ${label}`);
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    const req = protocol.get(url, { headers: { 'User-Agent': 'AIMMedia/2.0' } }, res => {
      if ([301, 302, 307, 308].includes(res.statusCode)) {
        file.close();
        fs.unlink(destPath, () => {});
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(destPath, () => {});
        return reject(new Error(`Download failed: HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    });
    req.on('error', reject);
  });
}

function fmt(bytes) {
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)}MB`
    : `${(bytes / 1024).toFixed(0)}KB`;
}

// ── IMAGE JOBS (NanoBanana 2) ─────────────────────────────────────

const IMAGE_JOBS = [
  {
    id: 'hero-bg',
    file: 'hero-bg.jpg',
    prompt: 'Cinematic aerial night photograph of a modern city waterfront. Warm amber and cool blue city lights reflecting on dark water. Film grain. Ultra-wide angle. No text, no UI. Noir atmospheric photography.',
    aspect: '16:9',
  },
  {
    id: 'ram-bharose',
    file: 'ram-bharose.jpg',
    prompt: 'Cinematic interior of a warm moody Windsor restaurant. Dramatic tungsten amber lighting. Dark wooden tables. Candle reflections. Shallow depth of field. No people. No text. Editorial food photography.',
    aspect: '2:3',
  },
  {
    id: 'kris-ramotar',
    file: 'kris-ramotar.jpg',
    prompt: 'Luxury real estate interior at twilight. Floor-to-ceiling windows, city glow. High-end residential design. Dark moody tones. No people. No text. Architectural editorial photography.',
    aspect: '2:3',
  },
  {
    id: 'wetech',
    file: 'wetech.jpg',
    prompt: 'Dark minimal tech workspace. Glowing monitors showing abstract data. Cool blue ambient lighting. No people. No text. Cinematic editorial tech photography.',
    aspect: '2:3',
  },
  {
    id: 'vip-motors',
    file: 'vip-motors.jpg',
    prompt: 'Exotic luxury supercar in a dramatic dark showroom. Low-key studio lighting. Glossy paint with specular reflections. Deep shadows. No people. No text. Ultra-premium automotive photography.',
    aspect: '2:3',
  },
  {
    id: 'coffee-exchange',
    file: 'coffee-exchange.jpg',
    prompt: 'Luxury cafe interior. Moody warm amber lighting. Steam from espresso. Dark marble counter. Bokeh background. No people. No text. Editorial brand photography.',
    aspect: '2:3',
  },
  {
    id: 'krish',
    file: 'krish.jpg',
    prompt: 'Black and white studio portrait of a young South Asian male professional in his early 20s. Dramatic Rembrandt lighting from left. Very dark background. Sharp facial focus. Confident expression. No text.',
    aspect: '2:3',
  },
  {
    id: 'kartik',
    file: 'kartik.jpg',
    prompt: 'Black and white studio portrait of a young South Asian male professional in his early 20s. Dramatic side lighting from right. Dark background. Film grain. Thoughtful composed expression. No text.',
    aspect: '2:3',
  },
  {
    id: 'atiyas',
    file: 'atiyas.jpg',
    prompt: 'Cinematic editorial photograph of a fresh farm market. Wooden crates overflowing with colorful fresh produce — tomatoes, herbs, peppers — under moody warm tungsten lighting. Deep dark shadows. Rich earthy tones. No people. No text. Luxury food brand photography.',
    aspect: '2:3',
  },
  {
    id: 'tdottruck',
    file: 'tdottruck.jpg',
    prompt: 'Cinematic dramatic photograph of a large commercial semi-truck driving on a dark highway at night. Motion blur on road markings. Dramatic headlight beams cutting through absolute darkness. Low angle epic perspective. Wet asphalt reflections. No people visible. No text. Cinematic automotive photography.',
    aspect: '2:3',
  },
  {
    id: 'hero-right',
    file: 'hero-right.jpg',
    prompt: 'Ultra-cinematic macro photograph of glowing fiber optic light strands weaving through absolute darkness. Warm amber and deep coral light refractions. Ink-black background. Razor-sharp selective focus with extreme bokeh. 8K resolution. Subtle film grain. Abstract light installation art photography. Luminous threads of light against pitch black. No people, no text, no watermarks.',
    aspect: '9:16',
  },
];

// ── VIDEO JOB (LTX 2.3) ──────────────────────────────────────────

const VIDEO_JOB = {
  id: 'hero-video',
  file: 'hero.mp4',
  prompt: 'Cinematic slow aerial drone shot over a modern city waterfront at night. Warm amber street lights and cool blue water reflections. Slow forward drift through the cityscape. Ultra-cinematic film look with slight grain. Atmospheric, moody, noir. No text, no watermarks. Ambient city soundscape with distant traffic and wind.',
  resolution: '720p',
  aspect_ratio: '16:9',
  duration: 8,
};

// ── MAIN ─────────────────────────────────────────────────────────

async function main() {
  console.log('\n  ╔══════════════════════════════════════╗');
  console.log('  ║  AIM Media — Build Script v2         ║');
  console.log('  ║  WaveSpeed AI · NanoBanana 2 + LTX   ║');
  console.log('  ╚══════════════════════════════════════╝\n');

  let imgSuccess = 0;
  let videoSuccess = false;

  // ── IMAGES ─────────────────────────────────────────────────────
  console.log('  ◆ PHASE 1: Image Generation (NanoBanana 2)\n');

  for (const job of IMAGE_JOBS) {
    const dest = path.join(ASSETS_DIR, job.file);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1024) {
      const size = fmt(fs.statSync(dest).size);
      console.log(`  ✓ [CACHED] ${job.id} (${size})`);
      imgSuccess++;
      continue;
    }

    process.stdout.write(`  → ${job.id} · Submitting...`);
    try {
      const task = await submit('google/nano-banana-2/text-to-image', {
        prompt: job.prompt,
        resolution: '2k',
        aspect_ratio: job.aspect || '16:9',
        output_format: 'jpeg',
        enable_sync_mode: false,
        enable_base64_output: false,
      });
      process.stdout.write(` ID:${task.id.substring(0,8)}...\n`);

      const result = await poll(task.id, { label: job.id, interval: 2000, timeout: 120000 });
      const url = result.outputs?.[0];
      if (!url) throw new Error('No output URL');

      await downloadFile(url, dest);
      const size = fmt(fs.statSync(dest).size);
      console.log(`  ✓ ${job.id} · Saved (${size})`);
      imgSuccess++;
    } catch (err) {
      console.log(`\n  ✗ ${job.id} · ${err.message.substring(0, 80)}`);
    }

    await new Promise(r => setTimeout(r, 500));
  }

  // ── HERO VIDEO ──────────────────────────────────────────────────
  console.log('\n  ◆ PHASE 2: Video Generation (LTX 2.3 · ~2-3 min)\n');

  const videoDest = path.join(ASSETS_DIR, VIDEO_JOB.file);
  if (fs.existsSync(videoDest) && fs.statSync(videoDest).size > 50000) {
    console.log(`  ✓ [CACHED] hero video (${fmt(fs.statSync(videoDest).size)})`);
    videoSuccess = true;
  } else {
    process.stdout.write('  → Hero video · Submitting to LTX 2.3...');
    try {
      const task = await submit('wavespeed-ai/ltx-2.3/text-to-video', {
        prompt: VIDEO_JOB.prompt,
        resolution: VIDEO_JOB.resolution,
        aspect_ratio: VIDEO_JOB.aspect_ratio,
        duration: VIDEO_JOB.duration,
        seed: -1,
      });
      process.stdout.write(` ID:${task.id.substring(0,8)}...\n`);

      const result = await poll(task.id, {
        label: 'hero.mp4',
        interval: 4000,
        timeout: 420000,
      });
      const url = result.outputs?.[0];
      if (!url) throw new Error('No video URL');

      process.stdout.write('  → Downloading video...');
      await downloadFile(url, videoDest);
      const size = fmt(fs.statSync(videoDest).size);
      console.log(` ✓ (${size})`);
      videoSuccess = true;
    } catch (err) {
      console.log(`\n  ✗ Video failed · ${err.message.substring(0, 100)}`);
      console.log('  → CSS gradient fallback active in hero.');
    }
  }

  // ── 3D MODELS (cached GLB files) ───────────────────────────────
  console.log('\n  ◆ PHASE 3: 3D Models (Hunyuan 3D v3.1)\n');
  const MODEL_FILES = ['model-car.glb', 'model-house.glb', 'model-coffee.glb', 'model-office.glb'];
  let modelsOk = 0;
  for (const f of MODEL_FILES) {
    const p = path.join(ASSETS_DIR, f);
    if (fs.existsSync(p) && fs.statSync(p).size > 10000) {
      console.log(`  ✓ [CACHED] ${f} (${fmt(fs.statSync(p).size)})`);
      modelsOk++;
    } else {
      console.log(`  ⚠ ${f} missing — run: node generate3d.js`);
    }
  }

  // ── SUMMARY ────────────────────────────────────────────────────
  console.log('\n  ────────────────────────────────────────');
  console.log(`  ✓ Images: ${imgSuccess}/${IMAGE_JOBS.length}`);
  console.log(`  ${videoSuccess ? '✓' : '✗'} Hero Video: ${videoSuccess ? 'Generated' : 'Fallback'}`);
  console.log(`  ✓ 3D Models: ${modelsOk}/${MODEL_FILES.length}`);
  console.log('  ✓ Open index.html in browser to see the experience.');
  console.log('  ────────────────────────────────────────\n');
}

main().catch(err => {
  console.error('\n  Fatal:', err.message);
  console.log('  index.html is ready — CSS fallbacks active.\n');
  process.exit(0);
});
