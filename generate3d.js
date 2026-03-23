/**
 * AIM Media — 3D Model Generator
 * WaveSpeed · Hunyuan 3D v3.1 Rapid (text-to-GLB)
 *
 * Run: node generate3d.js
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

async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}/${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { throw new Error(`Non-JSON: ${text.slice(0, 200)}`); }
}

async function submit3D(prompt) {
  const json = await apiFetch('wavespeed-ai/hunyuan-3d-v3.1/text-to-3d-rapid', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
  if (json.code !== 200 && !json.data?.id) {
    throw new Error(json.message || JSON.stringify(json).slice(0, 200));
  }
  return json.data;
}

async function poll(taskId, label, timeout = 300000) {
  const start = Date.now();
  let dots = 0;
  while (Date.now() - start < timeout) {
    await new Promise(r => setTimeout(r, 5000));
    const json = await apiFetch(`predictions/${taskId}/result`);
    const status = json.data?.status;
    dots = (dots + 1) % 4;
    process.stdout.write(`\r  ⏳ ${label} · ${status}${'.'.repeat(dots)}   `);
    if (status === 'completed') { process.stdout.write('\n'); return json.data; }
    if (status === 'failed') throw new Error(`Task failed: ${json.data?.error || 'unknown'}`);
  }
  throw new Error('Timeout after 5 minutes');
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    const req = protocol.get(url, { headers: { 'User-Agent': 'AIMMedia/2.0' } }, res => {
      if ([301, 302, 307, 308].includes(res.statusCode)) {
        file.close(); fs.unlink(destPath, () => {});
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close(); fs.unlink(destPath, () => {});
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    });
    req.on('error', reject);
  });
}

// ── MODELS ───────────────────────────────────────────────────────

const MODELS = [
  {
    id: 'car',
    file: 'model-car.glb',
    prompt: 'luxury sports coupe car, sleek aerodynamic body, low profile, detailed wheels and headlights, modern supercar',
  },
  {
    id: 'house',
    file: 'model-house.glb',
    prompt: 'modern luxury house exterior, flat roof, large floor to ceiling glass windows, minimalist contemporary architecture, clean design',
  },
  {
    id: 'coffee',
    file: 'model-coffee.glb',
    prompt: 'professional commercial espresso machine, chrome silver and black finish, barista coffee equipment, high detail',
  },
  {
    id: 'office',
    file: 'model-office.glb',
    prompt: 'modern glass office skyscraper building, corporate architecture, curtain wall facade, tall tower, detailed exterior',
  },
];

// ── MAIN ─────────────────────────────────────────────────────────

async function generateOne(m) {
  const dest = path.join(ASSETS_DIR, m.file);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
    const kb = (fs.statSync(dest).size / 1024).toFixed(0);
    console.log(`  ✓ [CACHED] ${m.id} (${kb}KB)`);
    return true;
  }
  process.stdout.write(`  → ${m.id} · Submitting to Hunyuan 3D...`);
  try {
    const task = await submit3D(m.prompt);
    process.stdout.write(` ID:${task.id.slice(0, 8)}...\n`);
    const result = await poll(task.id, m.id);
    const url = result.outputs?.[0];
    if (!url) throw new Error('No output URL in response');
    process.stdout.write(`  → Downloading ${m.file}...`);
    await downloadFile(url, dest);
    const kb = (fs.statSync(dest).size / 1024).toFixed(0);
    console.log(` ✓ (${kb}KB)`);
    return true;
  } catch (err) {
    console.log(`\n  ✗ ${m.id} · ${err.message.slice(0, 100)}`);
    return false;
  }
}

async function main() {
  console.log('\n  ╔══════════════════════════════════════╗');
  console.log('  ║  AIM Media — 3D Model Generator      ║');
  console.log('  ║  WaveSpeed · Hunyuan 3D v3.1 Rapid   ║');
  console.log('  ╚══════════════════════════════════════╝\n');

  const results = [];
  for (const m of MODELS) {
    results.push(await generateOne(m));
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n  ────────────────────────────────────────');
  MODELS.forEach((m, i) => console.log(`  ${results[i] ? '✓' : '✗'} ${m.id} → assets/${m.file}`));
  console.log('  ────────────────────────────────────────\n');
}

main().catch(err => { console.error('\n  Fatal:', err.message); process.exit(1); });
