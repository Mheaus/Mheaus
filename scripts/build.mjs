import { mkdir, writeFile } from 'node:fs/promises';

const LOGIN = 'Mheaus';
const LANG_WINDOW_YEARS = 4;
const OUT = new URL('../assets/', import.meta.url);

const C = {
  void: '#23272E',
  magenta: '#FF2A6D',
  cyan: '#05D9E8',
  ice: '#D1F7FF',
  amber: '#FFB000',
  dim: '#5B6371',
};

const MONO = `'JetBrains Mono','SF Mono',Menlo,Consolas,'Liberation Mono',monospace`;

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const defs = `
  <defs>
    <filter id="glow" x="-20%" y="-50%" width="140%" height="200%">
      <feGaussianBlur stdDeviation="2.4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="glow-soft" x="-10%" y="-50%" width="120%" height="200%">
      <feGaussianBlur stdDeviation="1.2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M24 0H0V24" fill="none" stroke="${C.cyan}" stroke-opacity=".07"/>
    </pattern>
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="1" fill="#000" fill-opacity=".35"/>
    </pattern>
    <pattern id="hazard" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="8" height="16" fill="${C.amber}"/>
    </pattern>
  </defs>`;

const baseStyle = `
    text { font-family: ${MONO}; }
    .blink { animation: blink 1.1s steps(1) infinite; }
    @keyframes blink { 50% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      * { animation: none !important; opacity: 1 !important; }
    }`;

const frame = (w, h, label, code) => `
  <rect width="${w}" height="${h}" fill="${C.void}"/>
  <rect width="${w}" height="${h}" fill="url(#grid)"/>
  <path d="M10 28V10H28M${w - 28} 10H${w - 10}V28M${w - 10} ${h - 28}V${h - 10}H${w - 28}M28 ${h - 10}H10V${h - 28}"
        fill="none" stroke="${C.cyan}" stroke-width="2" filter="url(#glow-soft)"/>
  <text x="38" y="23" font-size="11" fill="${C.dim}" letter-spacing="2">${esc(label)}</text>
  <text x="${w - 38}" y="23" font-size="11" fill="${C.dim}" letter-spacing="2" text-anchor="end">${esc(code)}</text>`;

const scanlines = (w, h) => `<rect width="${w}" height="${h}" fill="url(#scan)" pointer-events="none"/>`;

function header() {
  const W = 1200;
  const H = 420;
  const boot = [
    ['> MAGI-01 MELCHIOR ........', 'ONLINE', C.cyan],
    ['> MAGI-02 BALTHASAR .......', 'ONLINE', C.cyan],
    ['> MAGI-03 CASPER ..........', 'ONLINE', C.cyan],
    ['> neural link .............', 'SYNC', C.magenta],
    ['> pilot ...................', 'MATHIEU AUDEBERT', C.ice],
    ['> unit ....................', '@sakuga-software', C.ice],
    ['> sector ..................', 'BORDEAUX / FR', C.ice],
    ['> link ....................', 'adbrt.com', C.cyan],
  ];
  const lines = boot
    .map(
      ([k, v, col], i) => `
    <g class="boot" style="animation-delay:${0.25 + i * 0.28}s">
      <text x="64" y="${208 + i * 24}" font-size="15" fill="${C.dim}">${esc(k)}</text>
      <text x="330" y="${208 + i * 24}" font-size="15" fill="${col}" filter="url(#glow-soft)">${esc(v)}</text>
    </g>`,
    )
    .join('');

  const hexes = Array.from({ length: 4 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => {
      const x = 860 + col * 52 + (row % 2) * 26;
      const y = 180 + row * 45;
      const on = (row * 5 + col) % 3 === 0;
      const pts = Array.from({ length: 6 }, (_, k) => {
        const a = (Math.PI / 3) * k + Math.PI / 6;
        return `${(x + 26 * Math.cos(a)).toFixed(1)},${(y + 26 * Math.sin(a)).toFixed(1)}`;
      }).join(' ');
      return `<polygon points="${pts}" fill="${on ? C.magenta : 'none'}" fill-opacity="${on ? 0.18 : 0}"
        stroke="${on ? C.magenta : C.dim}" stroke-width="1.2" class="${on ? 'pulse' : ''}"
        style="animation-delay:${((row + col) * 0.3).toFixed(1)}s"/>`;
    }).join(''),
  ).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Mathieu Audebert — fullstack web developer, founder of Sakuga Software">
  <style>${baseStyle}
    .boot { opacity: 0; animation: appear .01s forwards; }
    @keyframes appear { to { opacity: 1; } }
    .title { animation: glitch 6s infinite; }
    .ghost-m { animation: ghostM 6s infinite; opacity: 0; }
    .ghost-c { animation: ghostC 6s infinite; opacity: 0; }
    @keyframes glitch { 0%,91%,100% { transform: none; } 92% { transform: translate(-3px,0) skewX(-8deg); } 94% { transform: translate(3px,0); } 96% { transform: none; } }
    @keyframes ghostM { 0%,91%,97%,100% { opacity: 0; } 92%,95% { opacity: .8; transform: translate(-6px,2px); } }
    @keyframes ghostC { 0%,91%,97%,100% { opacity: 0; } 93%,96% { opacity: .8; transform: translate(6px,-2px); } }
    .pulse { animation: pulse 3s ease-in-out infinite; }
    @keyframes pulse { 0%,100% { fill-opacity: .08; } 50% { fill-opacity: .45; } }
    .sweep { animation: sweep 5s linear infinite; }
    @keyframes sweep { from { transform: translateY(-40px); } to { transform: translateY(${H}px); } }
  </style>${defs}
  ${frame(W, H, 'MHEAUS://SYS — TERMINAL DOGMA', 'EVA-UNIT // RX-78 // VF-1')}

  <rect x="0" y="40" width="${W}" height="10" fill="url(#hazard)" opacity=".85"/>
  <text x="${W - 40}" y="68" font-size="11" fill="${C.amber}" text-anchor="end" letter-spacing="3">⚠ PATTERN BLUE — NOT AN ANGEL, JUST A DEVELOPER</text>

  <g transform="translate(60 162)">
    <text class="ghost-m" font-size="64" font-weight="800" fill="${C.magenta}" letter-spacing="2">MATHIEU AUDEBERT</text>
    <text class="ghost-c" font-size="64" font-weight="800" fill="${C.cyan}" letter-spacing="2">MATHIEU AUDEBERT</text>
    <text class="title" font-size="64" font-weight="800" fill="${C.ice}" letter-spacing="2" filter="url(#glow)">MATHIEU AUDEBERT</text>
  </g>
  <text x="64" y="86" font-size="16" fill="${C.magenta}" letter-spacing="6" filter="url(#glow-soft)">マチュー・オードベール ／ 開発者</text>

  ${lines}
  <rect x="64" y="${208 + boot.length * 24 - 14}" width="10" height="17" fill="${C.cyan}" class="blink"/>

  <g>${hexes}</g>
  <text x="886" y="372" font-size="11" fill="${C.dim}" letter-spacing="2">[NERV] [E.F.S.F] [U.N.SPACY]</text>

  <rect x="0" y="0" width="${W}" height="40" fill="${C.cyan}" fill-opacity=".05" class="sweep"/>
  ${scanlines(W, H)}
</svg>`;
  return svg;
}

// The GraphQL calendar leaves out private work in orgs that restrict token access.
// The public profile page counts it, so the stats use that page if the parse succeeds.
async function fetchPublicCalendar() {
  const res = await fetch(`https://github.com/users/${LOGIN}/contributions`);
  if (!res.ok) return null;
  const html = await res.text();
  const dates = new Map([...html.matchAll(/data-date="([\d-]+)" id="([^"]+)"/g)].map((m) => [m[2], m[1]]));
  const counts = new Map(
    [...html.matchAll(/for="([^"]+)"[^>]*>(No|\d+) contribution/g)].map((m) => [m[1], m[2] === 'No' ? 0 : Number(m[2])]),
  );
  const days = [...dates]
    .filter(([id]) => counts.has(id))
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([id]) => counts.get(id));
  return days.length > 300 ? days : null;
}

async function fetchStats(token) {
  const query = `query($login:String!){
    user(login:$login){
      followers{totalCount}
      repositories(ownerAffiliations:OWNER, isFork:false, privacy:PUBLIC, first:100){
        totalCount
        nodes{ stargazerCount pushedAt languages(first:8, orderBy:{field:SIZE,direction:DESC}){ edges{ size node{ name color } } } }
      }
      contributionsCollection{
        totalPullRequestContributions totalPullRequestReviewContributions
        contributionCalendar{ totalContributions weeks{ contributionDays{ contributionCount } } }
      }
    }
  }`;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { login: LOGIN } }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  const u = json.data.user;
  const cc = u.contributionsCollection;

  const langs = new Map();
  const since = Date.now() - LANG_WINDOW_YEARS * 365 * 864e5;
  for (const repo of u.repositories.nodes.filter((r) => Date.parse(r.pushedAt) > since))
    for (const { size, node } of repo.languages.edges) langs.set(node.name, (langs.get(node.name) ?? 0) + size);
  const total = [...langs.values()].reduce((a, b) => a + b, 0) || 1;
  const topLangs = [...langs.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, size]) => ({ name, pct: (size / total) * 100 }));

  const days = (await fetchPublicCalendar()) ?? cc.contributionCalendar.weeks.flatMap((w) => w.contributionDays.map((d) => d.contributionCount));

  return {
    contributions: days.reduce((a, b) => a + b, 0),
    prs: cc.totalPullRequestContributions,
    reviews: cc.totalPullRequestReviewContributions,
    repos: u.repositories.totalCount,
    stars: u.repositories.nodes.reduce((a, r) => a + r.stargazerCount, 0),
    followers: u.followers.totalCount,
    activeDays: days.filter((n) => n > 0).length,
    trackedDays: days.length,
    last12w: days.slice(-84),
    topLangs,
  };
}

function stats(s) {
  const W = 1200;
  const H = 300;
  const fmt = (n) => n.toLocaleString('en-US');
  const gauges = [
    ['CONTRIBUTIONS / 1Y', fmt(s.contributions), C.magenta],
    ['ACTIVE DAYS', `${s.activeDays}/${s.trackedDays}`, C.cyan],
    ['PULL REQUESTS', fmt(s.prs), C.ice],
    ['REVIEWS', fmt(s.reviews), C.ice],
  ];
  const gaugeSvg = gauges
    .map(
      ([label, value, col], i) => `
    <g transform="translate(${40 + i * 140} 70)">
      <text font-size="10" fill="${C.dim}" letter-spacing="1.5">${esc(label)}</text>
      <text y="36" font-size="28" font-weight="700" fill="${col}" filter="url(#glow-soft)">${esc(value)}</text>
      <rect y="48" width="120" height="3" fill="${col}" class="bar" style="animation-delay:${i * 0.15}s"/>
    </g>`,
    )
    .join('');

  const max = Math.max(1, ...s.last12w);
  const barW = 6;
  const histo = s.last12w
    .map((n, i) => {
      const h = Math.max(1, Math.round((n / max) * 70));
      const col = n === 0 ? C.dim : n > max * 0.6 ? C.magenta : C.cyan;
      return `<rect x="${i * barW}" y="${70 - h}" width="${barW - 2}" height="${h}" fill="${col}" fill-opacity="${n === 0 ? 0.4 : 0.9}"/>`;
    })
    .join('');

  const langSvg = s.topLangs
    .map(
      ({ name, pct }, i) => `
    <g transform="translate(0 ${i * 30})">
      <text font-size="13" fill="${C.ice}">${esc(name.toUpperCase())}</text>
      <text x="400" font-size="13" fill="${i === 0 ? C.magenta : C.cyan}" text-anchor="end">${pct.toFixed(1)}%</text>
      <rect y="8" width="400" height="6" fill="${C.dim}" fill-opacity=".35"/>
      <rect y="8" width="${((pct / s.topLangs[0].pct) * 400).toFixed(1)}" height="6" fill="${i === 0 ? C.magenta : C.cyan}"
            class="bar" style="animation-delay:${0.4 + i * 0.12}s" filter="url(#glow-soft)"/>
    </g>`,
    )
    .join('');

  const stamp = new Date().toISOString().slice(0, 10);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="GitHub activity: ${s.contributions} contributions in the last year">
  <style>${baseStyle}
    .bar { transform-box: fill-box; transform-origin: left; animation: grow 1.2s cubic-bezier(.2,.8,.2,1) both; }
    @keyframes grow { from { transform: scaleX(0); } }
  </style>${defs}
  ${frame(W, H, 'SYS.STATUS — PILOT TELEMETRY', `UPDATED ${stamp}`)}
  ${gaugeSvg}
  <g transform="translate(40 170)">
    <text font-size="10" fill="${C.dim}" letter-spacing="1.5">SYNC ACTIVITY — LAST 12 WEEKS</text>
    <g transform="translate(0 14)">${histo}</g>
    <line x1="0" y1="85" x2="${s.last12w.length * barW}" y2="85" stroke="${C.cyan}" stroke-opacity=".4"/>
  </g>
  <line x1="640" y1="50" x2="640" y2="${H - 30}" stroke="${C.cyan}" stroke-opacity=".25" stroke-dasharray="2 4"/>
  <g transform="translate(700 70)">
    <text font-size="10" fill="${C.dim}" letter-spacing="1.5" y="-4">LOADOUT — CODE SIZE, REPOS PUSHED IN ${LANG_WINDOW_YEARS}Y</text>
    <g transform="translate(0 24)">${langSvg}</g>
  </g>
  <text x="40" y="${H - 22}" font-size="11" fill="${C.dim}" letter-spacing="1.5">REPOS ${s.repos} · STARS ${s.stars} · FOLLOWERS ${s.followers}</text>
  <text x="${W - 40}" y="${H - 22}" font-size="11" fill="${C.cyan}" text-anchor="end" letter-spacing="1.5">STATUS: NOMINAL<tspan class="blink" fill="${C.magenta}"> ▌</tspan></text>
  ${scanlines(W, H)}
</svg>`;
}

function card({ code, name, desc, tag, accent }) {
  const W = 580;
  const H = 150;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(name)} — ${esc(desc)}">
  <style>${baseStyle}
    .edge { animation: edge 4s ease-in-out infinite; }
    @keyframes edge { 0%,100% { stroke-opacity: .35; } 50% { stroke-opacity: 1; } }
  </style>${defs}
  ${frame(W, H, `UNIT ${code}`, tag)}
  <rect x="24" y="44" width="4" height="72" fill="${accent}" filter="url(#glow-soft)"/>
  <text x="44" y="72" font-size="26" font-weight="700" fill="${C.ice}" filter="url(#glow-soft)">${esc(name)}</text>
  <text x="44" y="102" font-size="14" fill="${C.cyan}">${esc(desc)}</text>
  <path d="M${W - 70} ${H - 34}h40l-10 -10" fill="none" stroke="${accent}" stroke-width="2" class="edge"/>
  ${scanlines(W, H)}
</svg>`;
}

const CARDS = [
  { file: 'unit-adbrt.svg', code: '01', name: 'adbrt.com', desc: 'Personal site — the main hangar.', tag: 'TYPESCRIPT', accent: C.magenta },
  { file: 'unit-claude-skills.svg', code: '02', name: 'claude-skills', desc: 'Claude Code skills — autopilot modules.', tag: 'JAVASCRIPT', accent: C.cyan },
  { file: 'unit-dotfiles.svg', code: '03', name: 'dotfiles', desc: 'Cockpit configuration.', tag: 'SHELL', accent: C.cyan },
  { file: 'unit-three.svg', code: '04', name: 'three-js-experiment', desc: 'WebGL test flights.', tag: 'THREE.JS', accent: C.magenta },
];

function divider() {
  const W = 1200;
  const H = 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="">
  <style>${baseStyle}
    .run { animation: run 3s linear infinite; }
    @keyframes run { from { transform: translateX(-200px); } to { transform: translateX(${W}px); } }
  </style>${defs}
  <rect width="${W}" height="${H}" fill="${C.void}"/>
  <line x1="0" y1="12" x2="${W}" y2="12" stroke="${C.dim}"/>
  <rect y="11" width="200" height="2" fill="${C.magenta}" class="run" filter="url(#glow)"/>
  <rect x="0" y="6" width="60" height="12" fill="url(#hazard)"/>
  <rect x="${W - 60}" y="6" width="60" height="12" fill="url(#hazard)"/>
</svg>`;
}

const FALLBACK = {
  contributions: 0, prs: 0, reviews: 0, repos: 0, stars: 0, followers: 0, activeDays: 0, trackedDays: 365,
  last12w: Array(84).fill(0), topLangs: [{ name: 'TypeScript', pct: 100 }],
};

await mkdir(OUT, { recursive: true });
const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
const s = token ? await fetchStats(token) : FALLBACK;
if (!token) console.warn('No GITHUB_TOKEN: stats.svg uses placeholder data.');

await writeFile(new URL('header.svg', OUT), header());
await writeFile(new URL('stats.svg', OUT), stats(s));
await writeFile(new URL('divider.svg', OUT), divider());
for (const c of CARDS) await writeFile(new URL(c.file, OUT), card(c));
console.log('assets written', { contributions: s.contributions, langs: s.topLangs.map((l) => l.name) });
