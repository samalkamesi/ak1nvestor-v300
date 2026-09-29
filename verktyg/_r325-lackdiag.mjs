// r325: läckage-diagnos — varför svarar sa-laser-du-holm-q3-2026 med 200?
import { execSync } from 'node:child_process';
import fs from 'node:fs';

function kort(cmd, timeoutMs = 60_000) {
  try {
    return { kod: 0, ut: execSync(cmd, { encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] }).trim() };
  } catch (e) {
    return { kod: e.status ?? 1, ut: ((e.stdout || '') + (e.stderr || '')).trim() };
  }
}

const AK1 = '/home/ak1a/AK1';

// 1. När landade 847185f8 (sälj-u6 S2) i prod-trädet?
const commitTid = kort(`git -C ${AK1} log -1 --format='%ci %h %s' 847185f8`).ut.slice(0, 120);

// 2. Byggloggen: vilket träd byggde 03:07?
let synklog = '';
for (const kandidat of ['data/infra/prod-synk.log', 'data/infra/contabo/prod-synk.log']) {
  if (fs.existsSync(kandidat)) { synklog = kandidat; break; }
}
const logSvans = synklog ? kort(`tail -40 ${synklog}`).ut : '(hittade ingen prod-synk.log på kända ställen)';

// 3. Finns kodändringen i AK1:s arbetsträd? (getBlogPosts-filtret)
const filtrering = kort(`grep -n 'publishedAt' ${AK1}/src/lib/blogg/content.ts | head -8`).ut || '(inga publishedAt-träffar i content.ts)';

// 4. Vad innehåller den serverade sidan? (soft-404 eller äkta inlägg?)
const sida = kort(`curl -s --max-time 20 https://lab.ak1nvestor.com/blogg/sa-laser-du-holm-q3-2026`).ut;
const titelMatch = sida.match(/<title>([^<]*)<\/title>/);
const harInlagg = /Du holm|SA Laser|sa-laser/i.test(sida) && /Q3|kvartal/i.test(sida);
const harNotFound = /404|hittades inte|kunde inte hittas/i.test(sida);

// 5. Finns sidan i .next byggutdata (prerenderad)?
const buildMapp = `${AK1}/.next/server/app/blogg/sa-laser-du-holm-q3-2026.html`;
const prerender = fs.existsSync(buildMapp) ? 'FINNS (prerenderad .html)' : 'finns EJ som .html';

console.log('1) sälj-u6-commit i prod-träd:', commitTid);
console.log('\n2) prod-synk-logg (' + synklog + '):\n' + logSvans.slice(0, 2000));
console.log('\n3) publishedAt i content.ts:\n' + filtrering);
console.log('\n4) Serverad sida: <title> =', titelMatch ? titelMatch[1] : '(inget title-fält)');
console.log('   inläggsinnehåll syns:', harInlagg ? 'JA — LÄCKAGE' : 'nej');
console.log('   notFound-text:', harNotFound ? 'JA — soft-404 (sida men 200)' : 'nej');
console.log('   sidstorlek:', sida.length, 'byte');
console.log('\n5) Prerenderad fil i .next:', prerender);
