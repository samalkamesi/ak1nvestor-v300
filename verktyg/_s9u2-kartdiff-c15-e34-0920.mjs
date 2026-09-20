#!/usr/bin/env node
// _s9u2-kartdiff-c15-e26-0920.mjs — SYSTEMKARTAN-dokvåg C15 + E26→E34 (read-only mätare; E26 mättes FÖRE pivoten till u3, komplement överlämnade i worklog)
// Manifest auto-s9-1789922106888 · 2026-09-20 · GET/HEAD + filläsning endast.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROT = '/home/ak1a/AK1';
const ut = [];
const p = (etikett, vardet) => ut.push(`${etikett}: ${vardet}`);
const SEP = () => ut.push('');

// ---------- C15: kö-census ----------
SEP(); ut.push('=== C15 BLOGGEN + PUBLICERINGSFLÖDET ===');
const ko = `${ROT}/data/blogg-utkast`;
const raks = (vag, filter = () => true) => {
  try {
    return readdirSync(vag).filter((f) => filter(f)).length;
  } catch { return -1; }
};
const allaJson = (vag) => raks(vag, (f) => f.endsWith('.json'));
const rotJson = allaJson(`${ko}`);
const arJson = raks(`${ko}`, (f) => f.endsWith('-ar.json'));
const m9ko = allaJson(`${ko}/m9-ko`);
const granskningMd = raks(`${ko}/granskning`, (f) => f.endsWith('.md'));
const granskningJson = raks(`${ko}/granskning`, (f) => f.endsWith('.json'));
const kvartal = allaJson(`${ko}/kvartal/2026-q3`);
const totaltKo = rotJson + m9ko + granskningMd + granskningJson + kvartal;
p('kö-census totalt (jfr 199 @09-18)', totaltKo);
p('  rot *.json (jfr 54)', `${rotJson} (varav -ar.json: ${arJson})`);
p('  m9-ko/ (jfr 7)', m9ko);
p('  granskning/ (jfr 89 — 09-18 eh. MD/JSON ej delat)', `${granskningMd} MD + ${granskningJson} JSON = ${granskningMd + granskningJson}`);
p('  kvartal/2026-q3 (jfr 49)', kvartal);

// publiceringsstocken (R2-yta — READ-ONLY)
const stock = readdirSync(`${ROT}/data/blogg`).filter((f) => f.endsWith('.json'));
const mtider = stock.map((f) => statSync(`${ROT}/data/blogg/${f}`).mtimeMs).sort((a, b) => b - a);
const nyaste = new Date(mtider[0]).toISOString();
const aldsta = new Date(mtider[mtider.length - 1]).toISOString();
p('publiceringsstock data/blogg/*.json (jfr 55)', `${stock} st · nyaste mtime ${nyaste} · äldsta ${aldsta}`);

// speglar
for (const s of ['en', 'ar']) {
  const vag = `${ROT}/src/app/${s}/blogg`;
  p(`spegel src/app/${s}/blogg`, existsSync(vag) ? `finns (${raks(vag, () => true)} poster)` : 'SAKNAS');
}

// sammanställningen
const samvag = `${ko}/GRANSKNINGSKO-SAMMANSTALLNING.md`;
if (existsSync(samvag)) {
  const st = statSync(samvag);
  p('GRANSKNINGSKO-SAMMANSTALLNING.md', `${st.size} byte · mtime ${st.mtime.toISOString()}`);
}
SEP();

// git-rörelse på C15-nyckelfiler sedan 09-18
const gitC15 = (args) => {
  try {
    return execFileSync('git', ['-C', ROT, ...args], { encoding: 'utf8' }).trim();
  } catch (e) { return e.stdout?.trim() || '(fel)'; }
};
p('git commits C15-filer sedan 09-18 (senaste 5)',
  gitC15(['log', '--oneline', '--since=2026-09-18', '-5', '--',
    'src/lib/blogg-utkast.ts', 'src/lib/blogg-speglar.ts', 'src/app/(huvud)/blogg',
    'src/app/api/admin/blogg', 'src/components/ak1a/admin/blogg-panel.tsx']) || '0 träffar');
p('blogg-panel.tsx mtime/rader',
  `${readFileSync(`${ROT}/src/components/ak1a/admin/blogg-panel.tsx`, 'utf8').split('\n').length} r`);
SEP();

// ---------- C15: live-sonder ----------
const sond = async (namn, vag, metod = 'GET') => {
  try {
    const r = await fetch(`http://localhost:3000${vag}`, { method: metod });
    let kropp = '';
    try { kropp = (await r.text()).slice(0, 90).replace(/\s+/g, ' '); } catch {}
    p(`LIVE ${namn} ${metod} ${vag}`, `${r.status} ${kropp}`);
  } catch (e) { p(`LIVE ${namn} ${metod} ${vag}`, `FEL ${e.message}`); }
};
await sond('blogg-yta', '/blogg');
await sond('blogg-spegel en', '/en/blogg');
await sond('blogg-spegel ar', '/ar/blogg');
await sond('B2-rutt (metodbevakad)', '/api/admin/blogg/publicera');
await sond('B2-POST tom (grind)', '/api/admin/blogg/publicera', 'POST');
SEP();

// ---------- E26: audit-loggen ----------
ut.push('=== E26 ADMIN-PANELEN ===');
const auditVag = `${ROT}/data/vakten/audit-logg.jsonl`;
const auditRaw = readFileSync(auditVag, 'utf8');
const auditRader = auditRaw.split('\n').filter((r) => r.trim());
const auditPoster = auditRader.map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
const atg = {};
for (const post of auditPoster) atg[post.atgard ?? post.åtgärd ?? '?'] = (atg[post.atgard ?? post.åtgärd ?? '?'] ?? 0) + 1;
const sista = auditPoster[auditPoster.length - 1];
p('audit-logg.jsonl (jfr 336 540 B / 1 281 r @09-18)', `${statSync(auditVag).size} byte / ${auditRader.length} rader`);
p('  åtgärdsfördelning', JSON.stringify(atg));
p('  första post', auditPoster[0]?.tid ?? auditPoster[0]?.ts ?? '?');
p('  sista post', `${sista?.tid ?? sista?.ts ?? '?'} · ${sista?.atgard ?? sista?.åtgärd ?? '?'} · aktör ${sista?.aktor ?? sista?.aktör ?? '?'}`);
p('  unika aktörer (jfr 301)', new Set(auditPoster.map((x) => x.aktor ?? x.aktör)).size);
SEP();

// E26-struktur
p('panelkomponenter (jfr 16)', raks(`${ROT}/src/components/ak1a/admin`, (f) => f.endsWith('.tsx')));
const ruttUt = execFileSync('find', [`${ROT}/src/app/api/admin`, '-name', 'route.ts'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
p('admin-rutter (jfr 25)', ruttUt.length);
const xadmin = execFileSync('grep', ['-rn', 'x-admin-password', `${ROT}/src/`, '--include=*.ts', '--include=*.tsx'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
p('sessionStorage-rest x-admin-password i src/ (jfr 77)', xadmin.length);
const rl = ruttUt.filter((v) => readFileSync(v, 'utf8').match(/rateLimit|rate-limit|RL_/));
p('rutter med rateLimit-referens (jfr 8)', rl.length);
p('admin-auth.ts rader', readFileSync(`${ROT}/src/lib/admin-auth.ts`, 'utf8').split('\n').length);
p('godkannande-val.json (jfr "finns ej")', existsSync(`${ROT}/data/vakten/godkannande-val.json`) ? 'FINNS (kunden har klickat!)' : 'finns ej (flödet fortfarande kodbevisat)');
p('GDPR-DATAKARTA.md', existsSync(`${ROT}/data/forskning/GDPR-DATAKARTA.md`) ? `${statSync(`${ROT}/data/forskning/GDPR-DATAKARTA.md`).size} byte` : 'SAKNAS');
SEP();

// E26: live-sonder
await sond('requireAdmin variabler', '/api/admin/variabler');
await sond('requireAdmin godkannande', '/api/studio/godkannande');
await sond('admin-sidan', '/admin');
await sond('audit-EP om finns', '/api/studio/audit');
SEP();

// juridik-larmfilen (läs senaste KÖRNINGENS läge; vakten körs separat)
const larmVag = `${ROT}/data/vakten/juridik-larm.json`;
if (existsSync(larmVag)) {
  const larm = JSON.parse(readFileSync(larmVag, 'utf8'));
  p('juridik-larm.json senaste körning', `${larm.kord ?? larm.tid ?? '?'} · FEL ${larm.fel?.length ?? '?'} · VARNING ${larm.varningar?.length ?? JSON.stringify(Object.keys(larm))}`);
} else p('juridik-larm.json', 'SAKNAS');

console.log(ut.join('\n'));
