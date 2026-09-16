#!/usr/bin/env node
// dr-kedja4.mjs — mekaniserad DR-kedja 4: per-typ-snapshots (system_events-
// typvyerna i data/backups/<fil>-<datum>.json, skapade av backup-fran-
// molnet.mjs). Spår 10, 2026-09-16. Kedja 1 = SQL-dumpen (dr-ovning.mjs),
// kedja 2 = full-JSON-arkivet (dr-kedja2.mjs), kedja 3 = serverfilsarkivet —
// detta verktyg bevisar det FJÄRDE ledet: de tio per-typ-filerna.
//
// Vad verktyget bevisar, per körning:
//   1. Självtest: valideraren griper sabotage (trunkerad JSON, antal≠rader,
//      fel typnamn) — saboterade kopior i /tmp, ALDRIG i data/backups.
//   2. Kontrakt per fil: senaste filen per typ hittas, JSON tolkas, typ-
//      namn stämmer, antal === rader.length, varje rad bär created_at.
//      Tysta exportfel är diskreta: HTTP-fel i exportören skriver INGEN fil
//      (backup-fran-molnet.mjs rad ~85) — en typ vars senaste fil är äldre
//      än dagens set-datum flaggas VARNING.
//   3. Konsistens mot kedja 2: per-typ-raderna måste vara en delmängd av
//      senaste full-arkivets rader (samma källa, arkivet skrivs ~1 min
//      senare) — strömmande läsning av arkivet, KONSTANT minne. Svarar
//      OCKSÅ på om antal=0-filer är äkta tomma (gallrad tabell) eller
//      exportfel: arkivets faktiska radtal per typ redovisas.
//   4. Restore: per-typ-raderna COPY:as in i lokal PG17-skrap-DB
//      (ak1a_dr_pertyp, probe-tabell — per-typ-filerna bär endast
//      created_at+details, ej id/message; fulla återställningen av
//      innehållet äger kedja 2) med RTO-mätning + oberoende verifiering.
//   5. Maskinellt protokoll i data/forskning/DR-PROV-<datum>-KEDJA4.md +
//      GARANTERAD städning (finally): skrap-DB raderas, PG17 stoppas om
//      verktyget startade den, DR-låset släpps.
//
// Flaggor: --behall (lämna skrap-DB+PG för manuell undersökning) · --hjalp
// Exit: 0 GRÖN · 1 RÖD (protokoll skrivs ändå) · 75 ram-/diskgrind · 3 lås.

import { spawnSync } from 'node:child_process';
import {
  existsSync, openSync, closeSync, readFileSync, writeFileSync, unlinkSync,
  readdirSync, statSync, mkdtempSync, rmSync,
} from 'node:fs';
import { createReadStream, createWriteStream } from 'node:fs';
import { createGunzip } from 'node:zlib';
import { StringDecoder } from 'node:string_decoder';
import { spawn } from 'node:child_process';
import { dirname as pathDirname, join as pathJoin, basename as pathBasename } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REPO_ROT = path.resolve(pathDirname(fileURLToPath(import.meta.url)), '..');
const ARKIV_KATALOG = pathJoin(REPO_ROT, 'data', 'backups');
const LAS_VAG = '/tmp/ak1a-dr-prov.lock';
const DB = 'ak1a_dr_pertyp';
const PG_KLUSTER = ['17', 'main'];
const TAK_PER_TYP = 5000; // exportörens limit=5000 (omarkerat i gamla filer)

// Exportörens (backup-fran-molnet.mjs) tionamn → event-typ. Källan till
// sanningen är verktyget självt — håll listan synkad vid nya typer.
const TYPER = [
  { fil: 'variabler', event: 'variabel' },
  { fil: 'variabel-andringar', event: 'variabel-andring' },
  { fil: 'kurs-metadata', event: 'kurs_metadata' },
  { fil: 'kurs-metadata-andringar', event: 'kurs_metadata-andring' },
  { fil: 'termbank-tillagg', event: 'termbank_tillagg' },
  { fil: 'blogg-utkast', event: 'blogg_utkast' },
  { fil: 'blogg-publicerade', event: 'blogg_publicerad' },
  { fil: 'media-filer', event: 'media_fil' },
  { fil: 'medlemmar', event: 'medlem' },
  { fil: 'medlem-progress', event: 'medlem_progress' },
];

function lasArgument() {
  const args = process.argv.slice(2);
  const opts = { behall: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--behall') opts.behall = true;
    else if (args[i] === '--hjalp' || args[i] === '--help') {
      console.log('Användning: node verktyg/dr-kedja4.mjs [--behall]');
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

// ── Validerare: kontraktet för EN per-typ-fil ─────────────────────────────
// Returnerar { ok, fel: [..], varningar: [..], antal, typ, datum, rader }.
function valideraFil(vag, vantadEvent) {
  const ut = { ok: false, fel: [], varningar: [], antal: null, typ: null, datum: null, rader: [] };
  let text;
  try {
    text = readFileSync(vag, 'utf8');
  } catch (e) {
    ut.fel.push('kunde inte läsas: ' + e.message);
    return ut;
  }
  let o;
  try {
    o = JSON.parse(text);
  } catch (e) {
    ut.fel.push('JSON-parse: ' + e.message);
    return ut;
  }
  if (!o || typeof o !== 'object' || Array.isArray(o)) { ut.fel.push('rotobjekt saknas'); return ut; }
  ut.typ = typeof o.typ === 'string' ? o.typ : null;
  ut.datum = typeof o.datum === 'string' ? o.datum : null;
  if (ut.typ !== vantadEvent) ut.fel.push(`typ="${ut.typ}" matchar inte förväntad "${vantadEvent}"`);
  if (!Number.isInteger(o.antal) || o.antal < 0) ut.fel.push('antal är inte ett giltigt heltal ≥ 0');
  if (!Array.isArray(o.rader)) ut.fel.push('rader är inte en array');
  if (Number.isInteger(o.antal) && Array.isArray(o.rader) && o.antal !== o.rader.length) {
    ut.fel.push(`antal (${o.antal}) ≠ rader.length (${o.rader.length})`);
  }
  if (Array.isArray(o.rader)) {
    for (let i = 0; i < o.rader.length; i++) {
      const r = o.rader[i];
      if (!r || typeof r !== 'object' || Array.isArray(r)) { ut.fel.push(`rad ${i}: inte ett objekt`); break; }
      if (typeof r.created_at !== 'string' || !r.created_at) { ut.fel.push(`rad ${i}: created_at saknas/tom`); break; }
      if (r.details !== null && r.details !== undefined && typeof r.details !== 'object') {
        ut.fel.push(`rad ${i}: details är varken null eller objekt`); break;
      }
    }
    ut.rader = o.rader;
    ut.antal = Array.isArray(o.rader) ? o.rader.length : null;
  }
  // Exportörens limit=5000 har ingen markör i gamla filer — vid taket kan
  // snapshoten vara avklippt utan att veta om det. (Kur 2026-09-16: nya
  // filer bär truncerad-fält; se DR-PROV-...-KEDJA4.md.)
  if (ut.antal !== null && ut.antal >= TAK_PER_TYP) {
    ut.varningar.push(`antal ${ut.antal} ≥ tak ${TAK_PER_TYP} — snapshoten kan vara avklippt (limit utan markör i gamla filer)`);
  }
  if (o.truncerad === true) ut.varningar.push('filen är markerad truncerad av exportören');
  ut.ok = ut.fel.length === 0;
  return ut;
}

// ── Självtest: valideraren måste gripa sabotage ──────────────────────────
function sjalvtest() {
  const kat = mkdtempSync('/tmp/dr-kedja4-sabotage-');
  const bra = pathJoin(kat, 'bra.json');
  writeFileSync(bra, JSON.stringify({ typ: 'medlem', datum: '2026-09-16T00:00:00.000Z', antal: 1, rader: [{ created_at: '2026-09-11T21:25:06.730062+00:00', details: { a: 1 } }] }));
  const trunkerad = pathJoin(kat, 'trunkerad.json');
  writeFileSync(trunkerad, '{"typ":"medlem","datum":"2026-09-16T00:00:00.000Z","antal":2,"rader":[{"created_at":"2026-09-11T21:25:06.730062+00:00"},{"created_at":"2026-09');
  const antalFel = pathJoin(kat, 'antal-fel.json');
  writeFileSync(antalFel, JSON.stringify({ typ: 'medlem', datum: '2026-09-16T00:00:00.000Z', antal: 2, rader: [{ created_at: '2026-09-11T21:25:06.730062+00:00', details: null }] }));
  const felTyp = pathJoin(kat, 'fel-typ.json');
  writeFileSync(felTyp, JSON.stringify({ typ: 'medlem_progress', datum: '2026-09-16T00:00:00.000Z', antal: 1, rader: [{ created_at: '2026-09-11T21:25:06.730062+00:00', details: null }] }));

  const fall = [
    ['giltig fil GODKÄNS', valideraFil(bra, 'medlem'), true],
    ['trunkerad JSON RÖD', valideraFil(trunkerad, 'medlem'), false],
    ['antal ≠ rader.length RÖD', valideraFil(antalFel, 'medlem'), false],
    ['fel typnamn RÖD', valideraFil(felTyp, 'medlem'), false],
  ];
  let passa = 0;
  for (const [namn, r, vantatOk] of fall) {
    const ok = r.ok === vantatOk;
    if (ok) passa++;
    log(`  ${ok ? '[GRÖN]' : '[RÖD]'} ${namn}${ok ? '' : ' — ut.ok=' + r.ok + ' (' + r.fel.join(' | ') + ')'}`);
  }
  rmSync(kat, { recursive: true, force: true });
  return { passa, totalt: fall.length };
}

// ── Strömmande arkivläsare (mönstret ur aterstall-system-events.mjs) ─────
// Konstant minne: arkivet är ~350 MB okomprimerat. Stödjer .json.gz och .json.
function skapaArkivLasare(fil) {
  const lasare = { header: null, klar: false, fel: null, rader: [], vantar: [] };
  let buf = '', state = 'H', rad = '', djup = 0, iStr = false, esc = false;
  let stoppad = false;
  const dec = new StringDecoder('utf8');
  const gz = /\.gz$/.test(fil) ? createGunzip() : null;
  const src = createReadStream(fil);
  src.on('error', (e) => { if (!stoppad) (gz || src).destroy(e); });
  if (gz) src.pipe(gz);
  const utStrom = gz || src;
  lasare.stoppa = () => { stoppad = true; try { src.destroy(); if (gz) gz.destroy(); } catch {} };
  function pumpa() {
    while (lasare.vantar.length && (lasare.rader.length || lasare.klar)) lasare.vantar.shift()();
  }
  utStrom.on('data', (c) => { buf += gz ? dec.write(c) : c.toString('utf8'); bearbeta(); pumpa(); });
  utStrom.on('end', () => {
    buf += gz ? dec.end() : '';
    bearbeta();
    if (!lasare.fel && state !== 'E') lasare.fel = new Error('ARKIV OFULLSTÄNDIGT — strömmen slut före arkivets slut (state=' + state + ')');
    lasare.klar = true; pumpa();
  });
  utStrom.on('error', (e) => {
    if (stoppad) { lasare.klar = true; pumpa(); return; }
    lasare.fel = e; lasare.klar = true; pumpa();
  });
  function bearbeta() {
    if (state === 'H') {
      const idx = buf.indexOf('"rader":');
      if (idx < 0) {
        if (buf.length > 65536) lasare.fel = new Error('HEADER FEL — "rader"-nyckeln finns inte i arkivets början');
        return;
      }
      const headerText = buf.slice(0, idx).replace(/[\s,]+$/, '') + '}';
      try { lasare.header = JSON.parse(headerText); } catch (e) { lasare.fel = new Error('HEADER FEL: ' + e.message); return; }
      buf = buf.slice(idx + 8);
      state = 'S';
    }
    let i = 0;
    while (i < buf.length) {
      const c = buf[i];
      if (state === 'S') {
        if (c === '[') state = 'M';
        else if (!/\s/.test(c)) { lasare.fel = new Error("FORMAT FEL — väntade [ efter \"rader\":, fann '" + c + "'"); return; }
      } else if (state === 'M') {
        if (c === '{') { rad = '{'; djup = 1; iStr = false; esc = false; state = 'R'; }
        else if (c === ']') state = 'E';
        else if (!/[\s,]/.test(c)) { lasare.fel = new Error("FORMAT FEL — oväntat tecken mellan rader: '" + c + "'"); return; }
      } else if (state === 'R') {
        rad += c;
        if (iStr) {
          if (esc) esc = false;
          else if (c === '\\') esc = true;
          else if (c === '"') iStr = false;
        } else if (c === '"') iStr = true;
        else if (c === '{' || c === '[') djup++;
        else if (c === '}' || c === ']') {
          djup--;
          if (djup === 0) { lasare.rader.push(rad); rad = ''; state = 'M'; }
        }
      } else if (state === 'E') {
        if (!/[\s}]/.test(c)) { lasare.fel = new Error("FORMAT FEL — skräp efter rader-arrayen: '" + c + "'"); return; }
      }
      i++;
      if (lasare.fel) return;
    }
    buf = buf.slice(i);
  }
  lasare.nasta = async function nasta() {
    while (!lasare.rader.length && !lasare.klar) await new Promise((r) => { lasare.vantar.push(r); });
    if (lasare.rader.length) return lasare.rader.shift();
    if (lasare.fel) throw lasare.fel;
    return null;
  };
  return lasare;
}

// Deterministisk JSON-nyckel för rad-jämförelse mellan två oberoende
// exportörskörningar (kolumnordning i details kan skilja — sortera nycklar).
function stabilt(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(stabilt).join(',') + ']';
  return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + stabilt(v[k])).join(',') + '}';
}
const radNyckel = (event, r) => event + '|' + r.created_at + '|' + stabilt(r.details);

// ── Flock-lager: identiskt kontrakt som dr-ovning.mjs/dr-kedja2.mjs ──────
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
    writeFileSync(fd, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-kedja4.mjs flock=1\n`);
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
  writeFileSync(fd, `pid=${process.pid} start=${new Date().toISOString()} verktyg=dr-kedja4.mjs\n`);
  closeSync(fd);
}
function slappLas() {
  if (process.env.AK1A_DR_FLOCK === '1') return; // flock äger filens livslängd
  try { unlinkSync(LAS_VAG); } catch { /* redan borta */ }
}
function grind() {
  const mem = /MemAvailable:\s+(\d+) kB/.exec(readFileSync('/proc/meminfo', 'utf8'));
  const mb = mem ? Math.round(Number(mem[1]) / 1024) : 0;
  if (mb < 1000) { console.error(`RAMGRIND: MemAvailable ${mb} MB < 1000 MB — SKIPPAS (exit 75).`); return false; }
  const df = kor('df', ['-k', '/']);
  const gbLedigt = Number((((df.stdout || '').split('\n')[1] || '').trim().split(/\s+/)[3] || 0)) / 1024 / 1024;
  if (gbLedigt < 5) { console.error(`DISKGRIND: ${gbLedigt.toFixed(1)} GB ledigt < 5 GB — SKIPPAS (exit 75).`); return false; }
  log(`[0] Grind OK: MemAvailable ${mb} MB · ${gbLedigt.toFixed(0)} GB ledigt.`);
  return true;
}
function pgUpp() { return sudo(['-u', 'postgres', 'pg_isready', '-q']).ok; }

function hittaSenasteArkiv() {
  if (!existsSync(ARKIV_KATALOG)) return null;
  const gz = readdirSync(ARKIV_KATALOG).filter((n) => /^system-events-full-.*\.json\.gz$/.test(n)).sort();
  if (gz.length) return pathJoin(ARKIV_KATALOG, gz[gz.length - 1]);
  const raa = readdirSync(ARKIV_KATALOG).filter((n) => /^system-events-full-.*\.json$/.test(n)).sort();
  return raa.length ? pathJoin(ARKIV_KATALOG, raa[raa.length - 1]) : null;
}

function skrivProtokoll(dom) {
  let vag = pathJoin(REPO_ROT, 'data', 'forskning', `DR-PROV-${dom.datumIso}-KEDJA4.md`);
  let n = 2;
  while (existsSync(vag)) vag = pathJoin(REPO_ROT, 'data', 'forskning', `DR-PROV-${dom.datumIso}-KEDJA4-${n++}.md`);
  const rader = (dom.raderTyper || [])
    .map((t) => `| ${t.fil} | ${t.datumFil} | ${t.antal} | ${t.status} |`)
    .join('\n');
  const text = `# DR-KEDJA 4 ${dom.datumIso} — per-typ-snapshots (AUTO)

Körd av \`verktyg/dr-kedja4.mjs\` (spår 10). Källa: data/backups/<fil>-<datum>.json
(exportör: backup-fran-molnet.mjs — tio per-typ-vyor ur system_events).
Referensarkiv: ${dom.arkivNamn}. Skrap-DB: ${DB} (probe-tabell per_typ_probe).

| Moment | Resultat |
|---|---|
| Självtest (sabotage) | ${dom.sjalvtest} |
| Totalt fönster | ${dom.fonsterSek} s |
| RTO COPY-fas | ${dom.rtoSek} |
| Rader inlästa (summa per-typ) | ${dom.summaRader} |
| Konsistens per-typ ⊆ full-arkiv | ${dom.konsistens} |
| PG-verifiering (oberoende) | ${dom.pgVerifiering} |
| Städning | ${dom.stadning} |

Per-typ-tabell (senaste filen per typ; set-datum ${dom.setDatum}):

| Fil | Fildatum | antal | Status |
|---|---|---|---|
${rader}

Noteringar:
- Per-typ-filerna bär endast created_at+details (exportörens select) — full
  återställning av innehållet äger kedja 2 (full-arkivet); detta led bevisar
  att vyerna är INTAKTA, KONSISTENTA och INLÄSNINGSBARA.
- Tysta exportfel är diskreta: HTTP-fel i exportören skriver ingen fil —
  en typ utan fil för set-datumet flaggas ovan (VARNING).
- Arkivets radtal per per-typ-typ (ägtenhet-svaret på antal=0):
  ${dom.arkivFordelning || 'nåddes ej'}

Avbrottsorsak: ${dom.avbrots || 'ingen'}

SLUT — maskinellt genererat av dr-kedja4.mjs ${new Date().toISOString()}
`;
  writeFileSync(vag, text);
  log(`[6] Protokoll: ${path.relative(REPO_ROT, vag)}`);
}

async function main() {
  const opts = lasArgument();
  flockStartaOm();
  taLas();
  if (!grind()) { slappLas(); process.exit(75); }
  const tStart = Date.now();
  const dom = { datumIso: new Date().toISOString().slice(0, 10), behall: opts.behall, raderTyper: [], stadning: '' };
  let gron = false;
  let pgStartadAvOss = false;
  try {
    // [1] Självtest — valideraren måste bita FÖRE PG17 rörs.
    log('[1] Självtest av valideraren (sabotage i /tmp):');
    const st = sjalvtest();
    dom.sjalvtest = `${st.passa}/${st.totalt} PASS`;
    log(`    ${dom.sjalvtest}`);
    if (st.passa !== st.totalt) throw new Error('självtest misslyckades — valideraren griper inte sabotage');

    // [2] Inventera + validera senaste filen per typ.
    const filer = [];
    for (const t of TYPER) {
      if (!existsSync(ARKIV_KATALOG)) throw new Error('data/backups saknas — per-typ-kedjan har inget underlag');
      const kandidater = readdirSync(ARKIV_KATALOG)
        .filter((n) => new RegExp('^' + t.fil.replace(/[-]/g, '[-]') + '-\\d{4}-\\d{2}-\\d{2}\\.json$').test(n))
        .sort();
      if (!kandidater.length) {
        dom.raderTyper.push({ fil: t.fil, datumFil: '(saknas)', antal: 0, status: 'RÖD — ingen fil någonsin' });
        continue;
      }
      const senaste = kandidater[kandidater.length - 1];
      const v = valideraFil(pathJoin(ARKIV_KATALOG, senaste), t.event);
      filer.push({ def: t, namn: senaste, v, datumFil: (senaste.match(/(\d{4}-\d{2}-\d{2})\.json$/) || [])[1] || '?' });
    }
    const setDatum = filer.map((f) => f.datumFil).sort().pop();
    dom.setDatum = setDatum;
    for (const f of filer) {
      const statusDel = [];
      if (!f.v.ok) statusDel.push('RÖD — ' + f.v.fel.join('; '));
      else statusDel.push('GRÖN');
      if (f.datumFil !== setDatum) statusDel.push(`VARNING — senaste filen är från ${f.datumFil}, set-datum är ${setDatum} (tyst exportfel? HTTP-fel skriver ingen fil)`);
      for (const w of f.v.varningar) statusDel.push('VARNING — ' + w);
      dom.raderTyper.push({ fil: f.def.fil, datumFil: f.datumFil, antal: f.v.antal, status: statusDel.join(' · ') });
      log(`    ${f.def.fil}: antal ${f.v.antal} · ${statusDel.join(' · ')}`);
    }
    const felFiler = filer.filter((f) => !f.v.ok);
    if (felFiler.length) throw new Error(felFiler.length + ' per-typ-filer bröt kontraktet (se ovan)');

    // [3] Konsistens: per-typ ⊆ senaste full-arkiv (strömmande, konstant minne).
    const arkiv = hittaSenasteArkiv();
    if (!arkiv) throw new Error('inget system-events-full-arkiv — konsistenskedjan saknar referens (RPO-fynd)');
    dom.arkivNamn = pathBasename(arkiv);
    log(`[2] Konsistens mot ${dom.arkivNamn} (strömmande):`);
    const vanta = new Map(); // nyckel → antal kvar att matcha
    for (const f of filer) {
      for (const r of f.v.rader) {
        const k = radNyckel(f.def.event, r);
        vanta.set(k, (vanta.get(k) || 0) + 1);
      }
    }
    const lasare = skapaArkivLasare(arkiv);
    const arkivPerTyp = new Map();
    let arkivRader = 0, matchade = 0, felRader = 0;
    const felExempel = [];
    for (;;) {
      let radText;
      try { radText = await lasare.nasta(); } catch (e) { throw new Error('arkivström: ' + e.message); }
      if (radText === null) break;
      let o;
      try { o = JSON.parse(radText); } catch (e) { felRader++; if (felExempel.length < 3) felExempel.push(e.message); continue; }
      const event = typeof o.event_type === 'string' && o.event_type ? o.event_type : (typeof o.type === 'string' ? o.type : null);
      if (!event || typeof o.created_at !== 'string') { felRader++; continue; }
      arkivRader++;
      if (TYPER.some((t) => t.event === event)) arkivPerTyp.set(event, (arkivPerTyp.get(event) || 0) + 1);
      const k = event + '|' + o.created_at + '|' + stabilt(o.details ?? null);
      const kvar = vanta.get(k);
      if (kvar !== undefined) {
        if (kvar <= 1) vanta.delete(k); else vanta.set(k, kvar - 1);
        matchade++;
      }
    }
    if (lasare.fel) throw new Error('arkivström: ' + lasare.fel.message);
    const saknade = [...vanta.values()].reduce((a, b) => a + b, 0);
    dom.arkivFordelning = [...arkivPerTyp.entries()].map(([e, n]) => e + '=' + n).join(' · ') || '(arkivet bär INGA rader av de tio per-typ-typerna)';
    dom.konsistens = `matchade ${matchade} av ${matchade + saknade} · saknade ${saknade}` + (felRader ? ` · ${felRader} oläsliga arkivrader (${felExempel.join(' | ')})` : '');
    log(`    arkiv ${arkivRader.toLocaleString('sv-SE')} rader · ${dom.konsistens}`);
    log(`    arkivets per-typ-fördelning: ${dom.arkivFordelning}`);
    if (saknade > 0 || felRader > 0) throw new Error(`konsistensbrist: ${saknade} per-typ-rader saknas i full-arkivet`);

    // [4] Restore i lokal PG17 — probe-tabell + COPY + mätning.
    if (!pgUpp()) {
      const r = sudo(['pg_ctlcluster', ...PG_KLUSTER, 'start']);
      if (!r.ok && !pgUpp()) throw new Error('pg_ctlcluster start: ' + r.stderr);
      pgStartadAvOss = true;
      log('[3] PG17 startad (korrekt viloläge emellan).');
    } else {
      log('[3] PG17 var REDAN uppe vid ankomst (protokollfynd — oväntat).');
    }
    const roll = sudo(['-u', 'postgres', 'psql', '-X', '-q', '-A', '-t', '-c', "SELECT 1 FROM pg_roles WHERE rolname='ak1a'"]);
    if (roll.stdout !== '1') {
      const r = sudo(['-u', 'postgres', 'createuser', '-s', 'ak1a']);
      if (!r.ok) throw new Error('createuser: ' + r.stderr);
      log('    Roll ak1a skapad (superuser, endast lokala klustret).');
    }
    let r = sudo(['-u', 'postgres', 'dropdb', '--if-exists', DB]);
    if (!r.ok) throw new Error('dropdb: ' + r.stderr);
    r = sudo(['-u', 'postgres', 'createdb', '--owner=ak1a', DB]);
    if (!r.ok) throw new Error('createdb: ' + r.stderr);
    r = kor('psql', ['-X', '-v', 'ON_ERROR_STOP=1', '-d', DB, '-c',
      'CREATE TABLE per_typ_probe (typ text NOT NULL, created_at timestamptz NOT NULL, details jsonb)']);
    if (!r.ok) throw new Error('CREATE TABLE: ' + r.stderr);
    log(`[4] ${DB}.per_typ_probe skapad — COPY inläsning (RTO-mätning):`);

    const psql = spawn('psql', ['-X', '-v', 'ON_ERROR_STOP=1', '-d', DB,
      '-c', 'COPY per_typ_probe (typ, created_at, details) FROM STDIN']);
    let psqlUt = '', psqlFel = '', psqlExit = null;
    psql.stdout.on('data', (d) => { psqlUt += d; });
    psql.stderr.on('data', (d) => { psqlFel += d; });
    psql.on('error', (e) => { psqlExit = -1; psqlFel += e.message; });
    psql.on('close', (k) => { psqlExit = k; });
    psql.stdin.on('error', () => {});
    const tCopy0 = Date.now();
    let copyRader = 0;
    const copyFalt = (v) => (v === null || v === undefined ? '\\N' : String(v).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t'));
    for (const f of filer) {
      for (const rad of f.v.rader) {
        const linje = [f.def.event, rad.created_at, rad.details === null || rad.details === undefined ? null : JSON.stringify(rad.details)].map(copyFalt).join('\t') + '\n';
        if (!psql.stdin.write(linje)) await new Promise((res) => psql.stdin.once('drain', res));
        copyRader++;
      }
    }
    try { psql.stdin.end('\\.\n'); } catch {}
    await new Promise((res) => { if (psqlExit !== null) res(); else psql.on('close', res); });
    const tCopy1 = Date.now();
    const copyN = Number((psqlUt.match(/COPY\s+(\d+)/) || [])[1]);
    dom.rtoSek = ((tCopy1 - tCopy0) / 1000).toFixed(2) + ' s';
    dom.summaRader = String(copyRader);
    log(`    COPY exit=${psqlExit} n=${copyN} · ${dom.rtoSek} · ${copyRader} rader från ${filer.length} filer`);
    if (psqlExit !== 0 || copyN !== copyRader) throw new Error(`COPY misslyckades (exit ${psqlExit}, COPY-n ${copyN} mot ${copyRader}): ${psqlFel.slice(0, 200)}`);

    // [5] Oberoende PG-verifiering.
    const fragor = {
      totalt: 'SELECT count(*) FROM per_typ_probe',
      perTyp: "SELECT string_agg(t.e||'='||t.n, ' · ' ORDER BY t.n DESC) FROM (SELECT typ AS e, count(*) AS n FROM per_typ_probe GROUP BY typ) t",
      fonster: "SELECT min(created_at)||' … '||max(created_at) FROM per_typ_probe",
      jsonbLasbar: 'SELECT count(*) FROM per_typ_probe WHERE details IS NOT NULL',
      jsonbMedlem: "SELECT count(*) FROM per_typ_probe WHERE details->>'epostHash' IS NOT NULL",
    };
    log('[5] Oberoende PG-verifiering:');
    const svar = {};
    for (const [namn, f] of Object.entries(fragor)) {
      const q = sudo(['-u', 'postgres', 'psql', '-X', '-q', '-A', '-t', '-d', DB, '-c', f], { timeoutMs: 300000 });
      if (!q.ok) throw new Error('verifiering ' + namn + ': ' + q.stderr);
      svar[namn] = q.stdout.replace(/\n/g, ' ').slice(0, 400);
      log(`    ${namn}: ${svar[namn]}`);
    }
    dom.pgVerifiering = `totalt ${svar.totalt} · jsonb ${svar.jsonbLasbar} (varav medlem-epostHash ${svar.jsonbMedlem}) · fönster ${svar.fonster} · per typ: ${svar.perTyp}`;
    if (Number(svar.totalt) !== copyRader) throw new Error(`PG-total ${svar.totalt} ≠ COPY ${copyRader}`);

    dom.fonsterSek = ((Date.now() - tStart) / 1000).toFixed(1);
    gron = true;
  } catch (e) {
    console.error('DR-KEDJA 4 AVBRUTEN: ' + e.message);
    dom.avbrots = e.message;
    dom.fonsterSek = ((Date.now() - tStart) / 1000).toFixed(1);
  } finally {
    const d = sudo(['-u', 'postgres', 'dropdb', '--if-exists', DB]);
    let stopPad = false;
    if (pgStartadAvOss && !dom.behall) stopPad = sudo(['pg_ctlcluster', ...PG_KLUSTER, 'stop']).ok || !pgUpp();
    const nere = !pgUpp();
    dom.stadning = `${DB} ${d.ok ? 'raderad' : 'KUNDE EJ RADERAS: ' + d.stderr} · PG17 ${nere ? 'stoppad/nere' : dom.behall ? 'lämnad uppe (--behall)' : (pgStartadAvOss ? 'STOP MISSLYCKADES' : 'var uppe vid ankomst — lämnas')}`;
    log(`[6] Städning: ${dom.stadning}`);
    try { skrivProtokoll(dom); } catch (e2) { console.error('Protokoll kunde ej skrivas: ' + e2.message); }
    slappLas();
  }
  process.exit(gron ? 0 : 1);
}

main();
