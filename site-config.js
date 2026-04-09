(function () {
  'use strict';
  const KEY = 'ahmethan-site-config';

  const defaults = {
    hero: {
      tag: 'Digital Game Design Student',
      firstName: 'Ahmethan', lastName: 'Bakır',
      subtitle: 'Unity & Unreal Engine Developer',
      description: 'A game developer pursuing a B.Sc. in Digital Game Design at Bahcesehir University, with hands-on experience in multiplayer game development using Photon PUN. Proficient in C# and C++, focused on combat mechanics and puzzle systems.',
      badgeText: 'Ranke Studios',
      heroImg: null,
      stats: [
        { id: 's1', num: '2',         label: 'Roles'      },
        { id: 's2', num: '2026',      label: 'Graduation' },
        { id: 's3', num: 'Unity+UE5', label: 'Engine'     }
      ]
    },
    about: {
      bio1: "I am a game developer pursuing a Bachelor's degree in Digital Game Design at Bahcesehir University (Expected Graduation: July 2026), with hands-on experience in multiplayer game development using Photon PUN.",
      bio2: 'Proficient in C#, C++, and algorithm design, with a focus on building engaging combat and puzzle mechanics. Through my role at BAU Code Nexus, I have gained leadership experience in technical community building and hackathon organisation.',
      aboutImg: null,
      education: [
        { id: 'e1', role: 'Digital Game Design — B.Sc.', company: 'Bahcesehir University', dateFrom: '2022', dateTo: 'Jul 2026', bullets: [] }
      ],
      experience: [
        { id: 'x1', role: 'Unity Developer', company: 'Ranke Studios', dateFrom: 'Apr 2025', dateTo: 'Present',
          bullets: ['Developing a multiplayer Co-Op puzzle adventure game "Lost In Your Eyes" (Release: Jun 2026)', 'Building Photon PUN-based multiplayer mechanics, combat and puzzle systems', 'GitHub repository management and technical oversight'] },
        { id: 'x2', role: 'Unreal Engine Developer Intern', company: 'Motion Blur', dateFrom: 'Nov 2025', dateTo: 'Jan 2026',
          bullets: ['Contributed to "Black State" using Unreal Engine 5.4 and Perforce', 'Level design with Nanite performance optimisation', 'Gameplay mechanics, interaction systems and AI behaviours via Blueprints', 'HUD elements with UMG; particle effects with Niagara'] },
        { id: 'x3', role: 'Vice President', company: 'BAU Code Nexus', dateFrom: 'Oct 2025', dateTo: 'Present',
          bullets: ['Co-founded the club; currently on the executive board', 'Organising workshops and hackathons; managing external partnerships'] },
        { id: 'x4', role: 'Student Office Assistant', company: 'Bahcesehir University', dateFrom: 'Jan 2024', dateTo: 'Oct 2025',
          bullets: ['Corporate communication; Excel, Word, Photoshop'] }
      ],
      skills: ['Unity', 'Unreal Engine 5', 'C#', 'C++', 'HTML / CSS', 'Python', 'Photon PUN', 'Photoshop'],
      languages: ['Turkish — Native', 'English — B2']
    },
    contact: { email: '1@ahmethan.com.tr', phone: '+90 546 620 04 55', location: 'Üsküdar, Istanbul' },
    links: { github: 'https://github.com/ahmethan565', linkedin: 'https://www.linkedin.com/in/ahmethan-bakir/', itchio: 'https://4ahmethan.itch.io', instagram: 'https://www.instagram.com/4hmethan/' }
  };

  function uid() { return '_' + Math.random().toString(36).slice(2, 9); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function merge(t, s) {
    for (const k in s) {
      if (s[k] && typeof s[k] === 'object' && !Array.isArray(s[k])) { if (!t[k]) t[k] = {}; merge(t[k], s[k]); }
      else t[k] = s[k];
    }
    return t;
  }
  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function load() {
    try { const r = localStorage.getItem(KEY); return r ? merge(clone(defaults), JSON.parse(r)) : clone(defaults); }
    catch(_) { return clone(defaults); }
  }
  function save(cfg) { try { localStorage.setItem(KEY, JSON.stringify(cfg)); return true; } catch(_) { return false; } }
  function reset() { localStorage.removeItem(KEY); return clone(defaults); }

  /* ── Render helpers (used by about.html) ── */
  const ICONS = { unity:'fa-brands fa-unity', unreal:'fa-solid fa-gamepad', 'c#':'fa-solid fa-hashtag', 'c++':'fa-solid fa-c', html:'fa-brands fa-html5', python:'fa-brands fa-python', photon:'fa-solid fa-network-wired', photoshop:'fa-brands fa-adobe' };
  function skillIcon(n) { const k=n.toLowerCase(); for(const[m,i] of Object.entries(ICONS)) if(k.includes(m)) return i; return 'fa-solid fa-code'; }

  function timelineHTML(item) {
    const bul = (item.bullets||[]).map(b=>`<li>${esc(b)}</li>`).join('');
    return `<div class="experience-item"><div class="exp-header"><span class="exp-role">${esc(item.role)}</span><span class="exp-date">${esc(item.dateFrom)}${item.dateTo?' — '+esc(item.dateTo):''}</span></div><span class="exp-company">${esc(item.company)}</span>${bul?`<ul class="exp-list">${bul}</ul>`:''}</div>`;
  }

  /* ── Apply ── */
  function apply(cfg) {
    if (!cfg) cfg = load();
    const page = location.pathname.split('/').pop().replace(/^$/,'index.html');

    /* All pages: footer/header social links */
    ['itchio','github','linkedin','instagram'].forEach(k => {
      if (cfg.links?.[k]) document.querySelectorAll(`a[id*="${k}"]`).forEach(el => el.setAttribute('href', cfg.links[k]));
    });

    /* index.html */
    if (page === 'index.html' || page === '') {
      const set = (sel,val) => { const e=document.querySelector(sel); if(e&&val!=null) e.textContent=val; };
      set('.hero-tag', cfg.hero?.tag);
      set('.hero-title .highlight', cfg.hero?.lastName);
      set('.hero-subtitle', cfg.hero?.subtitle);
      set('.hero-desc', cfg.hero?.description);
      const t = document.querySelector('.hero-title');
      if (t && cfg.hero?.firstName) for (const n of t.childNodes) if (n.nodeType===3) { n.textContent=cfg.hero.firstName+'\n'; break; }
      if (cfg.hero?.heroImg) { const i=document.getElementById('hero-img'); if(i) i.src=cfg.hero.heroImg; }
      const badge = document.querySelector('.hero-badge');
      if (badge && cfg.hero?.badgeText) for (let i=badge.childNodes.length-1;i>=0;i--) if(badge.childNodes[i].nodeType===3){badge.childNodes[i].textContent='\n            '+cfg.hero.badgeText+'\n          ';break;}
      const sc = document.getElementById('stats-container');
      if (sc && cfg.hero?.stats) sc.innerHTML = cfg.hero.stats.map(s=>`<div class="stat-item"><div class="stat-num">${esc(s.num)}</div><div class="stat-label">${esc(s.label)}</div></div>`).join('');
      const lk = (id,k) => { const e=document.getElementById(id); if(e&&cfg.links?.[k]) e.setAttribute('href',cfg.links[k]); };
      lk('link-itchio','itchio'); lk('link-github','github'); lk('link-linkedin','linkedin');
    }

    /* about.html */
    if (page === 'about.html') {
      const set=(id,v)=>{const e=document.getElementById(id);if(e&&v!=null)e.textContent=v;};
      set('about-bio1', cfg.about?.bio1);
      set('about-bio2', cfg.about?.bio2);
      if (cfg.about?.aboutImg) { const i=document.getElementById('about-img'); if(i) i.src=cfg.about.aboutImg; }
      const el=(id,arr)=>{const e=document.getElementById(id);if(e)e.innerHTML=(arr||[]).map(timelineHTML).join('');};
      el('education-list', cfg.about?.education);
      el('experience-list', cfg.about?.experience);
      const sg=document.getElementById('skills-grid');
      if(sg) sg.innerHTML=(cfg.about?.skills||[]).map(s=>`<div class="skill-chip"><i class="${skillIcon(s)}"></i> ${esc(s)}</div>`).join('');
      const lg=document.getElementById('languages-grid');
      if(lg) lg.innerHTML=(cfg.about?.languages||[]).map(l=>`<div class="skill-chip"><i class="fa-solid fa-globe"></i> ${esc(l)}</div>`).join('');
    }

    /* contact.html */
    if (page === 'contact.html') {
      const em=document.querySelector('#direct-email');
      if(em&&cfg.contact?.email){em.setAttribute('href','mailto:'+cfg.contact.email);const v=em.querySelector('.contact-direct-value');if(v)v.textContent=cfg.contact.email;}
      const ph=document.querySelector('#direct-phone');
      if(ph&&cfg.contact?.phone){ph.setAttribute('href','tel:'+cfg.contact.phone.replace(/\s/g,''));const v=ph.querySelector('.contact-direct-value');if(v)v.textContent=cfg.contact.phone;}
      const lo=document.querySelectorAll('.contact-direct-item')[2];
      if(lo&&cfg.contact?.location){const v=lo.querySelector('.contact-direct-value');if(v)v.textContent=cfg.contact.location;}
      ['linkedin','github','itchio','instagram'].forEach(k=>{const e=document.getElementById('social-'+k);if(e&&cfg.links?.[k])e.setAttribute('href',cfg.links[k]);});
    }
  }

  window.SiteConfig = { defaults, load, save, reset, apply, uid, clone };

  if (!location.pathname.includes('editor')) {
    document.addEventListener('DOMContentLoaded', () => apply(load()));
  }
})();
