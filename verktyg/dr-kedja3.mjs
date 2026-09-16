#!/usr/bin/env node
// dr-kedja3.mjs — mekaniserad DR-kedja 3: SERVERFILS-ARKIVET (spår 10, 2026-09-16)
// Komplement till dr-ovning.mjs (kedja 1 SQL), dr-kedja2.mjs (kedja 2 moln-JSON)
// och dr-kedja4.mjs (kedja 4 per-typ): kvartalsmallens fjärde steg var det ENDA
// manuella — manualen DR-PROV-2026-09-16-KEDJA3.md §8 begärde kommandoradisering
// "av annan agent än författaren". Detta verktyg är den leveransen.
//
// Flöde: flock-lås (samma fil som övriga DR-verktyg — DR-fönstret ägs av EN
// agent) → ram-/diskgrind → självsabotage 3 fall (domkontraktet gripet) →
// ARKIV A server-repo-*.tar.gz: gzip -t + full tar-listning (postantal +
// exkluderingskontrakt) + restore till /tmp-skrap med RTO-mätning +
// antalskontrakt (listat == uppackat) + src-radräkning + spot-diff mot
// levande trädet (IDENTISK eller SKILJER-FÖRKLARAD av commit efter arkivets
// mtime — RPO syns utan falsk RÖD) → ARKIV B server-git-*.bundle:
// git bundle verify + klon-test (commits + HEAD) + ancestor-bevis mot
// levande repots HEAD → PG-städning enligt vilolägeskontraktet (ak1a_dr_*
// borta, PG17 nere) → maskinellt protokoll → GARANTERAD /tmp-städning.
//
// Flaggor: --repo <fil> · --bundle <fil> (override) · --behall (lämna
// restore-katalogen för manuell granskning) · --hjalp
// Exit: 0 GRÖN · 1 RÖD (protokoll skrivs ändå) · 75 ram-/diskgrind stängd.

import { spawnSync } from 'node:child_process';
import {
  existsSync, openSync, closeSync, readFileSync, writeFileSync, unlinkSync,
  readdirSync, statSync, rmSync, mkdirSync,
} from 'node:fs';
import { dirname as pathDirname, join as pathJoin, basename as pathBasename } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REPO_ROT = path.resolve(pathDirname(fileURLToPath(import.meta.url)), '..');
const ARKIV_KATALOG = pathJoin(REPO_ROT, 'data', 'backups');
const LAS_VAG = '/tmp/ak1a-dr-prov.lock';
const PG_KLUSTER = ['17', 'main'];
const SPOT_FILER = ['package.json', 'next.config.ts', 'data/DRIFTSBOKEN.md', 'src/lib/seo.tsx'];
// Exportörens exkluderingslista (backup-server-filer.mjs efter O3:s kur) —
// arkivet som ska kunna återställas får INTE innehålla dessa poster.
const FLOBODDA = /^\.\/(node_modules|\.next|\.git|tool-results|data\/cache|data\/backups)\//;

function lasArgument() {
  const args = process.argv.slice(2);
  const opts = { repo: null, bundle: null, behall: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--repo') opts.repo = args[++i];
    else if (args[i] === '--bundle') opts.bundle = args[++i];
    else if (args[i] === '--behall') opts.behall = true;
    else if (args[i] === '--hjalp' || args[i] === '--help') {
      console.log('Användning: node verktyg/dr-kedja3.mjs [--repo <server-repo-*.tar.gz>] [--bundle <server-git-*.bundle>] [--behall]');
      process.exit(0);
    } else {
      console.error(`Okänt argument: ${args[i]} (se --hjalp)`);
      process.exit(2);
    }
  }
  return opts;
}

function kor(kommando, args, opts = {}) {
  const r = spawnSync(kommando, args, { encoding: 'utf8', timeout: opts.timeoutMs ?? 120000, maxBuffer: 64 * 1024 * 1024 });
  return { ok: r.status === 0, status: r.status, stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
}
const sudo = (args, opts) => kor('sudo', ['-n', ...args], opts);
const log = (s) => console.log(s);

// --- Flock-lager: identiskt kontrakt som dr-ovning.mjs/dr-kedja2.mjs/dr-kedja4.mjs ---

function flockStartaOm() {
  if (process.env.AK1A_DR_FLOCK === '1') return;
  const skriptVag = fileURLToPath(import.meta.url);
  const r = spawnSync('flock', ['-w', '900', LAS_VAG, process.execPath, skriptVag, ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: { ...process.env, AK1A_DR_FLOCK: '1' },
    timeout: 960000,
  });
  if (r.error) {
    console.error(`FLOCK-KRITISKT: kunde inte starta om under flock (${r.error.message}) — övningen vägras utan lås.`);
    process.exit(1);
  }
  process.exit(r.status ?? 1);
}

function taLas() {
  if (process.env.AK1A_DR_FLOCK === '1') {
    const fd = openSync(LAS_VAG, 'w');
    writeFileSync(fd, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-kedja3.mjs flock=1\n`);
    closeSync(fd);
    return;
  }
  if (existsSync(LAS_VAG)) {
    const innehall = (() => { try { return readFileSync(LAS_VAG, 'utf8').trim(); } catch { return '?'; } })();
    const alder = (Date.now() - statSync(LAS_VAG).mtimeMs) / 60000;
    if (alder < 30) {
      console.error(`LÅSET UPTAGET (${alder.toFixed(1)} min): ${innehall} — DR-fönstret ägs av annan agent.`);
      process.exit(3);
    }
    unlinkSync(LAS_VAG);
  }
  const fd = openSync(LAS_VAG, 'wx');
  writeFileSync(fd, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-kedja3.mjs\n`);
  closeSync(fd);
}

function slappLas() {
  if (process.env.AK1A_DR_FLOCK === '1') return; // flock äger filens livslängd
  try { unlinkSync(LAS_VAG); } catch { /* redan borta */ }
}

function grind() {
  const mem = /MemAvailable:\s+(\d+) kB/.exec(readFileSync('/proc/meminfo', 'utf8'));
  const mb = mem ? Math.round(Number(mem[1]) / 1024) : 0;
  if (mb < 1000) {
    console.error(`RAMGRIND: MemAvailable ${mb} MB < 1000 MB — SKIPPAS (exit 75).`);
    return false;
  }
  // Restoren packar ~0,6 GB okomprimerat till /tmp — mät /tmp:s enhet, inte bara /.
  const df = kor('df', ['-k', '/tmp']);
  const gbLedigt = Number((((df.stdout || '').split('\n')[1] || '').trim().split(/\s+/)[3] || 0)) / 1024 / 1024;
  if (gbLedigt < 5) {
    console.error(`DISKGRIND: ${gbLedigt.toFixed(1)} GB ledigt på /tmp < 5 GB — SKIPPAS (exit 75).`);
    return false;
  }
  log(`[0] Grind OK: MemAvailable ${mb} MB · ${gbLedigt.toFixed(0)} GB ledigt på /tmp.`);
  return true;
}

function hittaSenaste(katalog, monster) {
  if (!existsSync(katalog)) return null;
  const filer = readdirSync(katalog).filter((n) => monster.test(n)).sort();
  return filer.length ? pathJoin(katalog, filer[filer.length - 1]) : null;
}

function pgUpp() { return sudo(['-u', 'postgres', 'pg_isready', '-q']).ok; }

// PG-städning enligt vilolägeskontraktet (u3 omgång 1:s läxa: fönstret stängs
// ALLTID med dropdb + stop, oavsett vem som öppnade). Kedja 3 använder ingen
// databas — detta steg bevisar att lokala PG17 är tom på skrap-DB:er och nere.
function stadaPg(dom) {
  try {
    if (!pgUpp()) {
      dom.pgStad = 'PG17 nere vid ankomst och vid slut — korrekt viloläge (skrap-DB:er kan ej finnas i nere kluster)';
      return;
    }
    const l = sudo(['-u', 'postgres', 'psql', '-X', '-q', '-A', '-t', '-c', 'SELECT datname FROM pg_database']);
    const skrap = l.ok ? l.stdout.split('\n').map((s) => s.trim()).filter((s) => /^ak1a_dr/.test(s)) : [];
    const droppade = [];
    for (const db of skrap) droppade.push(`${db}:${sudo(['-u', 'postgres', 'dropdb', '--if-exists', db]).ok ? 'raderad' : 'FEL'}`);
    sudo(['pg_ctlcluster', ...PG_KLUSTER, 'stop']);
    const nere = !pgUpp();
    dom.pgStad = `var UPPE vid ankomst (vilolägesbrott — protokollfynd) · skrap-DB:er ${skrap.length ? droppade.join(' · ') : '0 st'} · PG17 ${nere ? 'stoppad (viloläget återställt)' : 'STOP MISSLYCKADES'}`;
  } catch (e) {
    dom.pgStad = 'PG-städning fel: ' + e.message;
  }
}

// Självsabotage: domkontraktet ska gripa trasiga artefakter FÖRE någon
// "godkänt"-rad skrivs. Tre fall: kapad gzip, skräp med rätt ändelse, kapad bundle.
function sjalvSabotage(rot, arkivA, arkivB) {
  const gripna = [];
  const visa = (namn, pass) => log(`    sabotage ${namn}: ${pass ? 'GRIPET (RÖD väntat)' : 'EJ GRIPET — DOMKONTRAKTET trasigt!'}`);

  const s1 = pathJoin(rot, 's1-kapad.tar.gz');
  const storlekA = statSync(arkivA).size;
  writeFileSync(s1, readFileSync(arkivA).slice(0, Math.floor(storlekA * 0.6)));
  const g1 = kor('gzip', ['-t', s1], { timeoutMs: 120000 });
  visa('s1 kapad gzip (60 %)', !g1.ok);
  if (!g1.ok) gripna.push('s1');

  const s2 = pathJoin(rot, 's2-skrap.tar.gz');
  writeFileSync(s2, Buffer.alloc(1024 * 1024, 7));
  const g2 = kor('gzip', ['-t', s2], { timeoutMs: 30000 });
  visa('s2 skräpfil med .tar.gz-ändelse', !g2.ok);
  if (!g2.ok) gripna.push('s2');

  const s3 = pathJoin(rot, 's3-kapad.bundle');
  const storlekB = statSync(arkivB).size;
  writeFileSync(s3, readFileSync(arkivB).slice(0, Math.floor(storlekB * 0.6)));
  const bvKat = pathJoin(rot, 'bv-sab');
  mkdirSync(bvKat, { recursive: true });
  kor('git', ['-C', bvKat, 'init', '--quiet']);
  // FYND (bevisat 2026-09-16): git bundle verify GODTAR en 60 % kapad bundle
  // ("records a complete history") — verify läser header/refs, aldrig packdatan.
  // Integritetsdomen för bundlen är därför KLON-testet (early EOF/index-pack
  // died på den kapade); verify är nödvändig, ej tillräcklig.
  const v3 = kor('git', ['-C', bvKat, 'bundle', 'verify', s3], { timeoutMs: 120000 });
  const k3 = kor('git', ['clone', '--quiet', s3, pathJoin(rot, 'klon-sab')], { timeoutMs: 300000 });
  visa(`s3 kapad bundle (60 %): verify ${v3.ok ? 'GODTAR den (fynd: header-rubrik ej integritet)' : 'griper'} · klon ${k3.ok ? 'LEVANDE — DOMKONTRAKTET trasigt!' : 'dödar (huvuddom)'}`, !k3.ok);
  if (!k3.ok) gripna.push('s3');

  return gripna.length === 3;
}

function raknaSrc(bas) {
  let filer = 0;
  let rader = 0;
  const ga = (p) => {
    for (const namn of readdirSync(p, { withFileTypes: true })) {
      const v = pathJoin(p, namn.name);
      if (namn.isDirectory()) ga(v);
      else if (/\.(ts|tsx)$/.test(namn.name)) {
        filer++;
        rader += readFileSync(v, 'utf8').split('\n').length;
      }
    }
  };
  const rot = pathJoin(bas, 'src');
  if (existsSync(rot)) ga(rot);
  return { filer, rader };
}

// Spot-diff enligt manualen (4 filer) — men med RPO-logik: en fil som skiljer
// är INTE ett restore-fel om trädets senaste commit är efter arkivets mtime
// (trädet har helt enkelt rört sig sedan arkiveringen). Oförklarad skillnad
// däremot = anomali = RÖD.
function spotDiff(restoreRot, arkivMtime) {
  const rader = [];
  for (const rel of SPOT_FILER) {
    const iArkiv = existsSync(pathJoin(restoreRot, rel));
    const iTrad = existsSync(pathJoin(REPO_ROT, rel));
    if (!iArkiv || !iTrad) {
      rader.push({ rel, ok: false, status: `SAKNAS ${!iArkiv ? 'i arkivet' : 'i levande trädet'}` });
      continue;
    }
    const a = readFileSync(pathJoin(restoreRot, rel), 'utf8');
    const t = readFileSync(pathJoin(REPO_ROT, rel), 'utf8');
    if (a === t) {
      rader.push({ rel, ok: true, status: 'IDENTISK' });
      continue;
    }
    const g = kor('git', ['-C', REPO_ROT, 'log', '-1', '--format=%cI', '--', rel], { timeoutMs: 30000 });
    const senaste = g.ok ? g.stdout : '';
    const forklasad = senaste !== '' && new Date(senaste).getTime() > arkivMtime;
    rader.push({
      rel,
      ok: forklasad,
      status: forklasad
        ? `SKILJER-FÖRKLARAD (trädets senaste commit ${senaste} > arkivets mtime ${new Date(arkivMtime).toISOString()})`
        : `SKILJER-OFÖRKLARAD (trädets senaste commit ${senaste || 'okänd'} — arkivet kan inte vara äldre än sina egna filer)`,
    });
  }
  return rader;
}

function skrivProtokoll(dom) {
  let vag = pathJoin(REPO_ROT, 'data', 'forskning', `DR-KEDJA3-${dom.datumIso}-AUTO.md`);
  let n = 2;
  while (existsSync(vag)) vag = pathJoin(REPO_ROT, 'data', 'forskning', `DR-KEDJA3-${dom.datumIso}-AUTO-${n++}.md`);
  const a = dom.arkivA || {};
  const b = dom.arkivB || {};
  const spot = (dom.spotRader || []).map((r) => `- ${r.rel}: ${r.status}`).join('\n');
  const text = `# DR-KEDJA 3 ${dom.datumIso} — serverfils-arkivet (AUTO)

Körd av \`verktyg/dr-kedja3.mjs\` (spår 10; manual: DR-PROV-2026-09-16-KEDJA3.md
— detta verktyg är §8:s kommandoradisering, kvartalsmallens fjärde steg).
Arkiv A: ${a.namn ?? 'nåddes ej'} · Arkiv B: ${b.namn ?? 'nåddes ej'}.

| Moment | Resultat |
|---|---|
| Självsabotage (domkontraktet) | ${dom.sabotage ?? 'nåddes ej'} |
| Arkiv A gzip-integritet (gzip -t) | ${a.gzip ?? 'nåddes ej'} |
| Arkiv A listning | ${a.listning ?? 'nåddes ej'} |
| Exkluderingskontrakt | ${a.exkludering ?? 'nåddes ej'} |
| RTO restore (tar -xzf) | ${a.rtoSek ?? 'nåddes ej'} |
| Antalskontrakt (listat == uppackat) | ${a.antalKontrakt ?? 'nåddes ej'} |
| src ts/tsx | ${a.srcFiler ?? 'nåddes ej'} filer · ${a.srcRader ?? 'nåddes ej'} rader |
| Arkiv B bundle verify | ${b.verify ?? 'nåddes ej'} |
| Arkiv B klon-test | ${b.klon ?? 'nåddes ej'} |
| RTO klon | ${b.klonSek ?? 'nåddes ej'} |
| Ancestor-bevis (klonHEAD ∈ trädets historia) | ${b.ancestor ?? 'nåddes ej'} |
| Total RTO kedja 3 (restore + klon) | ${dom.totalRto ?? 'nåddes ej'} |
| PG-städning (vilolägeskontraktet) | ${dom.pgStad ?? 'nåddes ej'} |
| Dom | ${dom.dom} (exit ${dom.exit}) |
| Städning /tmp | ${dom.stadning} |

Spot-diff mot levande trädet (RPO-visning):

${spot || '- (nåddes ej)'}

Avbrottsorsak: ${dom.avbrots || 'ingen'}

SLUT — maskinellt genererat av dr-kedja3.mjs ${new Date().toISOString()}
`;
  writeFileSync(vag, text);
  log(`[8] Protokoll: ${path.relative(REPO_ROT, vag)}`);
}

function main() {
  const opts = lasArgument();
  flockStartaOm();
  taLas();
  if (!grind()) { slappLas(); process.exit(75); }
  const dom = { datumIso: new Date().toISOString().slice(0, 10), behall: opts.behall, stadning: '' };
  const tmpRot = pathJoin('/tmp', `dr-kedja3-${process.pid}`);
  let gron = false;
  try {
    const arkivA = opts.repo ? path.resolve(opts.repo) : hittaSenaste(ARKIV_KATALOG, /^server-repo-\d{4}-\d{2}-\d{2}\.tar\.gz$/);
    const arkivB = opts.bundle ? path.resolve(opts.bundle) : hittaSenaste(ARKIV_KATALOG, /^server-git-\d{4}-\d{2}-\d{2}\.bundle$/);
    if (!arkivA) throw new Error(`inget server-repo-*.tar.gz i ${ARKIV_KATALOG} — kodarkivet saknas (kedja 3 död)`);
    if (!arkivB) throw new Error(`inget server-git-*.bundle i ${ARKIV_KATALOG} — historikarkivet saknas (kedja 3 död)`);
    dom.arkivA = { namn: pathBasename(arkivA) };
    dom.arkivB = { namn: pathBasename(arkivB) };
    const arkivMtime = statSync(arkivA).mtimeMs;
    mkdirSync(tmpRot, { recursive: true });
    log(`DR-KEDJA 3 ${dom.datumIso} — A: ${dom.arkivA.namn} (${(statSync(arkivA).size / 1024 / 1024).toFixed(0)} MB) · B: ${dom.arkivB.namn} (${(statSync(arkivB).size / 1024 / 1024).toFixed(0)} MB)`);

    log('[1] Självsabotage — domkontraktet ska gripa innan något döms GRÖNT:');
    dom.sabotage = sjalvSabotage(tmpRot, arkivA, arkivB) ? '3/3 GRIPNA (kapad gzip · skräpfil · kapad bundle)' : 'UNDERKÄNT — kontraktet grep ej allt';
    if (dom.sabotage.startsWith('3/3') !== true) throw new Error('sabotagekontraktet underkänt');

    const gz = kor('gzip', ['-t', arkivA], { timeoutMs: 180000 });
    dom.arkivA.gzip = gz.ok ? 'GRÖN (gzip -t exit 0)' : `RÖD: ${gz.stderr.slice(0, 200)}`;
    if (!gz.ok) throw new Error('arkiv A: gzip-integriteten underkänd');

    const lista = kor('tar', ['-tzf', arkivA], { timeoutMs: 300000 });
    const poster = lista.ok ? lista.stdout.split('\n').filter((l) => l.trim() !== '') : [];
    const posterExklRot = poster.filter((p) => p !== './');
    const brott = posterExklRot.filter((p) => FLOBODDA.test(p));
    dom.arkivA.listning = lista.ok ? `GRÖN — ${posterExklRot.length} poster (full listning exit 0)` : `RÖD: ${lista.stderr.slice(0, 200)}`;
    dom.arkivA.exkludering = lista.ok && brott.length === 0 ? 'GRÖN — 0 poster av de förbjudna (node_modules/.next/.git/tool-results/data-cache/data-backups)' : `RÖD — ${brott.length} förbjudna poster: ${brott.slice(0, 5).join(', ')}`;
    if (!lista.ok || brott.length > 0) throw new Error('arkiv A: listning/exkluderingskontrakt underkänt');
    log(`[2] Arkiv A: gzip GRÖN · ${posterExklRot.length} poster · exkludering 0 brott.`);

    const restoreKat = pathJoin(tmpRot, 'restore');
    mkdirSync(restoreKat, { recursive: true });
    const t0 = Date.now();
    const ex = kor('tar', ['-xzf', arkivA, '-C', restoreKat], { timeoutMs: 300000 });
    dom.arkivA.rtoSek = ex.ok ? `${((Date.now() - t0) / 1000).toFixed(1)} s` : `RÖD: ${ex.stderr.slice(0, 200)}`;
    if (!ex.ok) throw new Error('restore av arkiv A misslyckades');
    const filer = kor('find', [restoreKat, '-type', 'f'], { timeoutMs: 120000 });
    const kataloger = kor('find', [restoreKat, '-type', 'd'], { timeoutMs: 120000 });
    const nFiler = filer.ok ? filer.stdout.split('\n').filter((l) => l.trim() !== '').length : -1;
    const nKat = kataloger.ok ? kataloger.stdout.split('\n').filter((l) => l.trim() !== '').length - 1 : -1; // rotkatalogen ränas ej
    dom.arkivA.antalKontrakt = nFiler + nKat === posterExklRot.length ? `GRÖN — ${nFiler} filer + ${nKat} kataloger = ${nFiler + nKat} == ${posterExklRot.length} listade` : `RÖD — ${nFiler} filer + ${nKat} kataloger ≠ ${posterExklRot.length} listade`;
    if (nFiler + nKat !== posterExklRot.length) throw new Error('antalskontraktet underkänt (listat ≠ uppackat)');
    const src = raknaSrc(restoreKat);
    dom.arkivA.srcFiler = src.filer;
    dom.arkivA.srcRader = src.rader.toLocaleString('sv-SE');
    if (src.filer === 0) throw new Error('src/ innehåller 0 ts/tsx-filer — arkivet kan inte vara rätt');
    log(`[3] Restore GRÖN: ${nFiler} filer + ${nKat} kataloger == listat · src ${src.filer} filer / ${dom.arkivA.srcRader} rader kod.`);

    dom.spotRader = spotDiff(restoreKat, arkivMtime);
    for (const r of dom.spotRader) log(`    spot ${r.rel}: ${r.status}`);
    const oforklard = dom.spotRader.filter((r) => !r.ok);
    if (oforklard.length > 0) throw new Error('spot-diff: ' + oforklard.map((r) => r.rel + ' ' + r.status).join(' | '));
    log('[4] Spot-diff: samtliga IDENTISKA eller SKILJER-FÖRKLARADE (trädets commits efter arkivets mtime).');

    const bvKat = pathJoin(tmpRot, 'bv');
    mkdirSync(bvKat, { recursive: true });
    kor('git', ['-C', bvKat, 'init', '--quiet']);
    const bv = kor('git', ['-C', bvKat, 'bundle', 'verify', arkivB], { timeoutMs: 180000 });
    dom.arkivB.verify = bv.ok ? `GRÖN — ${(bv.stdout + ' ' + bv.stderr).replace(/\s+/g, ' ').trim().slice(0, 140)} · NOTIS: verify är nödvändig men EJ tillräcklig (sabotage s3: kapad bundle godtas) — klon-testet nedan är huvuddomen` : `RÖD: ${bv.stderr.slice(0, 200)}`;
    if (!bv.ok) throw new Error('arkiv B: bundle verify underkänt');

    const klonKat = pathJoin(tmpRot, 'klon');
    const t1 = Date.now();
    const kl = kor('git', ['clone', '--quiet', arkivB, klonKat], { timeoutMs: 600000 });
    dom.arkivB.klonSek = kl.ok ? `${((Date.now() - t1) / 1000).toFixed(1)} s` : 'n/a (klon RÖD)';
    if (!kl.ok) {
      dom.arkivB.klon = `RÖD: ${kl.stderr.slice(0, 200)}`;
      throw new Error('klon-test av arkiv B misslyckades');
    }
    const commits = kor('git', ['-C', klonKat, 'rev-list', '--count', 'HEAD'], { timeoutMs: 120000 });
    const klonHead = kor('git', ['-C', klonKat, 'rev-parse', 'HEAD'], { timeoutMs: 30000 });
    const antalCommits = commits.ok ? Number(commits.stdout) : -1;
    dom.arkivB.klon = `GRÖN — ${antalCommits.toLocaleString('sv-SE')} commits · klonad HEAD ${klonHead.ok ? klonHead.stdout.slice(0, 8) : '?'}`;
    if (antalCommits <= 0) throw new Error('klonen innehåller 0 commits');
    const anc = kor('git', ['-C', REPO_ROT, 'merge-base', '--is-ancestor', klonHead.stdout, 'HEAD'], { timeoutMs: 30000 });
    dom.arkivB.ancestor = anc.ok ? `GRÖN — klonens HEAD ${klonHead.stdout.slice(0, 8)} är föregångare till trädets HEAD (bundlen ≡ historikens delmängd)` : `RÖD — klonens HEAD finns ej i trädets historia`;
    if (!anc.ok) throw new Error('ancestor-beviset underkänd');
    dom.totalRto = `${dom.arkivA.rtoSek} + ${dom.arkivB.klonSek} (restore + klon; nätverksflytt till ny VPS tillkommer i verklig katastrof)`;
    log(`[5] Arkiv B: verify GRÖN · klon GRÖN ${antalCommits} commits · ancestor GRÖN.`);

    stadaPg(dom);
    log(`[6] PG-städning: ${dom.pgStad}`);
    gron = true;
  } catch (e) {
    console.error('DR-KEDJA 3 AVBRUTEN: ' + e.message);
    dom.avbrots = e.message;
    try { stadaPg(dom); } catch { /* protokollförs i stadaPg */ }
  } finally {
    try {
      if (existsSync(tmpRot)) {
        if (dom.behall) {
          for (const d of ['s1-kapad.tar.gz', 's2-skrap.tar.gz', 's3-kapad.bundle']) rmSync(pathJoin(tmpRot, d), { force: true });
          for (const d of ['bv-sab', 'bv', 'klon', 'klon-sab']) rmSync(pathJoin(tmpRot, d), { recursive: true, force: true });
          dom.stadning = `sabotagefiler + bv/klon rensade · restore LÄMNAD (--behall): ${tmpRot}/restore`;
        } else {
          rmSync(tmpRot, { recursive: true, force: true });
          dom.stadning = `${tmpRot} raderad (restore + sabotage + klon + bv)`;
        }
      } else {
        dom.stadning = 'tmp skapades ej';
      }
    } catch (e2) {
      dom.stadning = 'STÄDNINGSFEL: ' + e2.message;
    }
    log(`[7] Städning: ${dom.stadning}`);
    dom.dom = gron ? 'GRÖN' : 'RÖD';
    dom.exit = gron ? 0 : 1;
    try { skrivProtokoll(dom); } catch (e3) { console.error('Protokoll kunde ej skrivas: ' + e3.message); }
    slappLas();
  }
  process.exit(gron ? 0 : 1);
}

main();
