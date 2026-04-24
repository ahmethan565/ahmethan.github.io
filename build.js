/**
 * build.js — Reads site-data.json and updates HTML files using SC markers.
 * Run: node build.js
 * Also called by server.js when editor saves.
 */
'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');
const ROOT  = __dirname;
const DATA = path.join(ROOT, 'site-data.json');

// ── Helpers ────────────────────────────────────────────────────────────────────
function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/** Replace content between <!-- SC:key --> and <!-- /SC:key --> */
function sc(html, key, content) {
  const re = new RegExp(`(<!-- SC:${key} -->)([\\s\\S]*?)(<!-- /SC:${key} -->)`, 'g');
  if (!re.test(html)) { console.warn(`  ⚠  Marker SC:${key} not found`); return html; }
  return html.replace(re, `$1${content}$3`);
}

/** Replace href attr on element with given id */
function href(html, id, url) {
  return html
    .replace(new RegExp(`(<a[^>]*\\bid="${id}"[^>]*href=")[^"]*(")`,'g'), `$1${url}$2`)
    .replace(new RegExp(`(<a[^>]*href=")[^"]*("[^>]*\\bid="${id}")`, 'g'), `$1${url}$2`);
}

/** Replace src attr on img element with given id */
function imgSrc(html, id, src) {
  return html
    .replace(new RegExp(`(<img[^>]*\\bid="${id}"[^>]*src=")[^"]*(")`,'g'), `$1${src}$2`)
    .replace(new RegExp(`(<img[^>]*src=")[^"]*("[^>]*\\bid="${id}")`, 'g'), `$1${src}$2`);
}

// ── Renderers ─────────────────────────────────────────────────────────────────
const ICONS = {
  unity:      'fa-brands fa-unity',
  unreal:     'fa-solid fa-gamepad',
  'c#':       'fa-solid fa-hashtag',
  'c++':      'fa-solid fa-c',
  html:       'fa-brands fa-html5',
  python:     'fa-brands fa-python',
  photon:     'fa-solid fa-network-wired',
  photoshop:  'fa-brands fa-adobe'
};
function skillIcon(n) {
  const k = n.toLowerCase();
  for (const [m, i] of Object.entries(ICONS)) if (k.includes(m)) return i;
  return 'fa-solid fa-code';
}

function timelineHTML(item) {
  const bl = (item.bullets || []).map(b => `<li>${esc(b)}</li>`).join('');
  return `
                <div class="experience-item">
                  <div class="exp-header">
                    <span class="exp-role">${esc(item.role)}</span>
                    <span class="exp-date">${esc(item.dateFrom)}${item.dateTo ? ' — ' + esc(item.dateTo) : ''}</span>
                  </div>
                  <span class="exp-company">${esc(item.company)}</span>
                  ${bl ? `<ul class="exp-list">${bl}</ul>` : ''}
                </div>`;
}

// ── Per-page builders ──────────────────────────────────────────────────────────
function buildIndex(html, cfg) {
  html = sc(html, 'hero-tag',       esc(cfg.hero.tag));
  html = sc(html, 'hero-firstname',  esc(cfg.hero.firstName));
  html = sc(html, 'hero-lastname',   esc(cfg.hero.lastName));
  html = sc(html, 'hero-subtitle',   esc(cfg.hero.subtitle));
  html = sc(html, 'hero-desc',       esc(cfg.hero.description));
  html = sc(html, 'hero-badge',      esc(cfg.hero.badgeText));

  const statsHTML = (cfg.hero.stats || []).map(s =>
    `<div class="stat-item"><div class="stat-num">${esc(s.num)}</div><div class="stat-label">${esc(s.label)}</div></div>`
  ).join('');
  html = sc(html, 'stats', statsHTML);

  // Hero photo
  if (cfg.hero.heroImg) html = imgSrc(html, 'hero-img', cfg.hero.heroImg);

  // Social hrefs (hero + footer)
  for (const [k, v] of Object.entries(cfg.links)) {
    ['link', 'footer'].forEach(pfx => { html = href(html, `${pfx}-${k}`, v); });
  }
  return html;
}

function buildAbout(html, cfg) {
  html = sc(html, 'bio1', esc(cfg.about.bio1));
  html = sc(html, 'bio2', esc(cfg.about.bio2));

  html = sc(html, 'education',  (cfg.about.education  || []).map(timelineHTML).join(''));
  html = sc(html, 'experience', (cfg.about.experience || []).map(timelineHTML).join(''));

  const skillsHTML = (cfg.about.skills || []).map(s =>
    `<div class="skill-chip"><i class="${skillIcon(s)}"></i> ${esc(s)}</div>`
  ).join('\n                ');
  html = sc(html, 'skills', '\n                ' + skillsHTML + '\n              ');

  const langHTML = (cfg.about.languages || []).map(l =>
    `<div class="skill-chip"><i class="fa-solid fa-globe"></i> ${esc(l)}</div>`
  ).join('\n                ');
  html = sc(html, 'languages', '\n                ' + langHTML + '\n              ');

  // About photo
  if (cfg.about.aboutImg) html = imgSrc(html, 'about-img', cfg.about.aboutImg);

  // Footer hrefs
  for (const [k, v] of Object.entries(cfg.links)) {
    html = href(html, `footer-${k}`, v);
  }
  return html;
}

function buildContact(html, cfg) {
  html = sc(html, 'contact-email',    esc(cfg.contact.email));
  html = sc(html, 'contact-phone',    esc(cfg.contact.phone));
  html = sc(html, 'contact-location', esc(cfg.contact.location));

  // Update mailto/tel hrefs
  html = html.replace(/(id="direct-email"[^>]*href="|href="[^"]*"[^>]*id="direct-email")[^"]*(")/,
    `$1mailto:${cfg.contact.email}$2`).replace(
    /(href=")[^"]*("[^>]*id="direct-email")/,
    `$1mailto:${cfg.contact.email}$2`);
  html = html.replace(/(id="direct-phone"[^>]*href="|href="[^"]*"[^>]*id="direct-phone")[^"]*(")/,
    `$1tel:${cfg.contact.phone.replace(/\s/g,'')}$2`).replace(
    /(href=")[^"]*("[^>]*id="direct-phone")/,
    `$1tel:${cfg.contact.phone.replace(/\s/g,'')}$2`);

  // Social hrefs
  for (const [k, v] of Object.entries(cfg.links)) {
    ['social', 'footer'].forEach(pfx => { html = href(html, `${pfx}-${k}`, v); });
  }
  return html;
}

function buildPortfolio(html, cfg) {
  // Footer hrefs
  for (const [k, v] of Object.entries(cfg.links)) {
    html = href(html, `footer-${k}`, v);
  }

  const manual = cfg.portfolio?.manualGames || [];
  const auto = cfg.portfolio?.autoGames || [];
  const allGames = [...manual, ...auto];

  if (allGames.length === 0) {
    return sc(html, 'portfolio-grid', '<p class="text-center" style="color:var(--t2);width:100%;grid-column:1/-1;">No projects found yet.</p>');
  }

  const gridHTML = allGames.map(g => {
    const thumb = g.thumb || 'images/ab.png';
    return `
      <a href="${esc(g.link)}" target="_blank" rel="noopener" class="port-card">
        <div class="port-thumb">
          <img src="${esc(thumb)}" alt="${esc(g.title)}" loading="lazy">
        </div>
        <div class="port-info">
          <h3 class="port-title">${esc(g.title)}</h3>
          ${g.genre ? `<span class="port-genre">${esc(g.genre)}</span>` : ''}
        </div>
      </a>`;
  }).join('');

  return sc(html, 'portfolio-grid', gridHTML);
}

// ── Itch.io Scraper ────────────────────────────────────────────────────────────
function fetchItchGames(url) {
  return new Promise((resolve) => {
    if (!url || !url.includes('itch.io')) return resolve([]);
    console.log(`  🌐 Fetching itch.io games from ${url}...`);
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    };
    
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          console.error(`  ⚠ Error: Itch.io returned status code ${res.statusCode}`);
          return resolve([]);
        }
        try {
          const games = [];
          const parts = data.split('data-game_id=');
          for (let i = 1; i < parts.length; i++) {
            const cell = parts[i];
            // Since we split by data-game_id, we need to limit the cell text to just this game's div to avoid matching next game's thumb if this one lacks it.
            // A game cell usually ends within 2000 chars.
            const cellBlock = cell.substring(0, 2000);
            
            const titleM = cellBlock.match(/<div class="game_title">[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/);
            const thumbM = cellBlock.match(/data-lazy_src="([^"]+)"/);
            const fallbackThumbM = cellBlock.match(/data-background_image="([^"]+)"/);
            const genreM = cellBlock.match(/<div class="game_genre">([^<]+)<\/div>/);
            
            if (titleM) {
              games.push({
                id: 'itch_' + Math.random().toString(36).slice(2,9),
                title: titleM[2].trim(),
                thumb: (thumbM ? thumbM[1] : (fallbackThumbM ? fallbackThumbM[1] : '')),
                link: titleM[1],
                genre: genreM ? genreM[1].trim() : ''
              });
            }
          }
          console.log(`  ✓ Found ${games.length} itch.io games`);
          resolve(games);
        } catch (e) {
          console.error('  ⚠ Error parsing itch.io data', e);
          resolve([]);
        }
      });
    }).on('error', (e) => {
      console.error('  ⚠ Error fetching itch.io data', e);
      resolve([]);
    });
  });
}

// ── Main build ─────────────────────────────────────────────────────────────────
async function build(cfg) {
  const pages = {
    'index.html':     buildIndex,
    'about.html':     buildAbout,
    'contact.html':   buildContact,
    'portfolio.html': buildPortfolio
  };

  if (!cfg.portfolio) cfg.portfolio = { manualGames: [], autoGames: [] };
  
  // Fetch itch.io data
  if (cfg.links && cfg.links.itchio) {
    const games = await fetchItchGames(cfg.links.itchio);
    if (games && games.length > 0) {
      cfg.portfolio.autoGames = games;
    }
  }

  for (const [file, fn] of Object.entries(pages)) {
    const fp = path.join(ROOT, file);
    if (!fs.existsSync(fp)) { console.warn(`  ⚠  ${file} not found, skipped`); continue; }
    let html = fs.readFileSync(fp, 'utf8');
    html = fn(html, cfg);
    fs.writeFileSync(fp, html, 'utf8');
    console.log(`  ✓ ${file}`);
  }

  fs.writeFileSync(DATA, JSON.stringify(cfg, null, 2), 'utf8');
  console.log('  ✓ site-data.json');
}

// ── CLI ────────────────────────────────────────────────────────────────────────
if (require.main === module) {
  (async () => {
    if (!fs.existsSync(DATA)) {
      console.error('❌  site-data.json not found. Open editor.html first to save initial config.');
      process.exit(1);
    }
    const cfg = JSON.parse(fs.readFileSync(DATA, 'utf8'));
    console.log('🔨 Building site...');
    await build(cfg);
    console.log('✅ Done!');
  })();
}

module.exports = { build };
