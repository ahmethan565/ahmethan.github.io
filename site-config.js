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

  window.SiteConfig = { defaults, load, save, reset, uid, clone };

  /* Content is now managed statically by build.js + server.js.
     Runtime apply() is no longer used on the public pages. */
})();
