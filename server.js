/**
 * server.js — Local dev server for the site editor.
 * Run: node server.js
 * Then open: http://localhost:3000/editor.html
 *
 * Endpoints:
 *   GET  /api/config  → returns site-data.json
 *   POST /api/save    → saves config + rebuilds HTML files
 */
'use strict';
const http    = require('http');
const fs      = require('fs');
const path    = require('path');
const { build } = require('./build.js');

const PORT = 3000;
const ROOT = __dirname;
const DATA = path.join(ROOT, 'site-data.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
};

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // CORS headers for local use
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── API: GET /api/config ──────────────────────────────────────────────────
  if (req.method === 'GET' && url === '/api/config') {
    if (!fs.existsSync(DATA)) { res.writeHead(404); res.end('{}'); return; }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(fs.readFileSync(DATA));
    return;
  }

  // ── API: POST /api/save ───────────────────────────────────────────────────
  if (req.method === 'POST' && url === '/api/save') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const cfg = JSON.parse(body);
        console.log('\n📥 Save received — building...');
        build(cfg);
        console.log('✅ Build complete\n');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, message: 'HTML files updated!' }));
      } catch (e) {
        console.error('❌ Build error:', e.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, message: e.message }));
      }
    });
    return;
  }

  // ── Static file serving ───────────────────────────────────────────────────
  let filePath = path.join(ROOT, url === '/' ? 'index.html' : url);
  // Prevent directory traversal
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }
  // Default to index.html for directories
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end(`Not found: ${url}`);
    return;
  }

  const ext  = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mime });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log('');
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  🚀  Site Editor Server                      │');
  console.log('│                                              │');
  console.log(`│  Editor  →  http://localhost:${PORT}/editor.html   │`);
  console.log(`│  Site    →  http://localhost:${PORT}/             │`);
  console.log('│                                              │');
  console.log('│  Press Ctrl+C to stop                        │');
  console.log('└─────────────────────────────────────────────┘');
  console.log('');
});
