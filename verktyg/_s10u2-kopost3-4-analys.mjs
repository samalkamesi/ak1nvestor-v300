#!/usr/bin/env node
// _s10u2-kopost3-4-analys.mjs — köpost 3+4 (5b5e9e60): 09-13-anomalien + organ-klockan
// Spår 10 vakt 2/3, manifest auto-s10-1789802729714, 2026-09-19.
//
// Två instrument, samma frågor (spårets kontrakt):
//   A) skrap-DB ak1a_dr_test = blad db-2026-09-14 restore (dr-ovning.mjs --behall)
//   B) levande prod (PGPASSFILE-pekare, LÄSANDE aggregat, GDPR-rent: antal + tidsstämplar)
//
// Frågor:
//   Q1 board per kalenderdag lokal 09-09..09-15   → reproducerar/använder 765-talet
//   Q2 board per kvart lokal 09-12..09-14         → lokaliserar −3 (P5)
//   Q3 detalj för avvikande kvarts(ar)            → exakta tidsstämplar
//   Q4 organ per timme lokal (hela bladet)        → pulskartan (P6/P7)
//   Q5 organ_id/organ_name identiteter            → vilka organ pulserar
//   Q6 span/total board+organ                     → protokollets baslinje
//
// Endast läsning. Skriver data/forskning/DR-KOPOST-ANOMALI-ORGAN-2026-09-19.json.
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const PSQL = '/usr/lib/postgresql/17/bin/psql';
const PSQL_FLAGGOR = ['-X', '-q', '-A', '-t', '-F', '\t'];
const PG_TARGET = 'host=db.rkaqmulgoubvewwnwxrw.supabase.co port=5432 dbname=postgres user=postgres sslmode=require';
const UTF = 'Europe/Stockholm'; // beslutsklockans "lokal"-kontrakt

function fraga(sql, sida) {
  if (sida === 'skrap') {
    const r = spawnSync('sudo', ['-n', '-u', 'postgres', PSQL, '-d', 'ak1a_dr_test', ...PSQL_FLAGGOR, '-c', sql], { encoding: 'utf8' });
    if (r.status !== 0) throw new Error(`skrap-psql: ${r.stderr}`);
    return r.stdout;
  }
  const r = spawnSync(PSQL, [PG_TARGET, ...PSQL_FLAGGOR, '-c', sql], { encoding: 'utf8', env: { ...process.env, PGPASSFILE: '/home/ak1a/.pgpass' } });
  if (r.status !== 0) throw new Error(`prod-psql: ${r.stderr}`);
  return r.stdout;
}

function rader(utf) {
  if (utf === undefined) return null;
  return utf.split('\n').filter((l) => l.trim() !== '').map((l) => l.split('\t'));
}
const txt = (utf) => (utf === undefined ? '(ej körd denna omgång)' : utf.trim().split('\n').join(' · '));

const Q = {
  dagar: `SELECT to_char(created_at AT TIME ZONE '${UTF}','YYYY-MM-DD'), count(*) FROM public.board_decisions WHERE created_at >= timestamptz '2026-09-09' AND created_at < timestamptz '2026-09-16' GROUP BY 1 ORDER BY 1`,
  kvarts: `SELECT to_char(date_trunc('hour', created_at AT TIME ZONE '${UTF}') + floor(extract(minute FROM created_at AT TIME ZONE '${UTF}')/15) * interval '15 min','YYYY-MM-DD HH24:MI'), count(*) FROM public.board_decisions WHERE created_at >= timestamptz '2026-09-12' AND created_at < timestamptz '2026-09-15' GROUP BY 1 ORDER BY 1`,
  organTimme: `SELECT to_char(created_at AT TIME ZONE '${UTF}','YYYY-MM-DD HH24'), count(*), count(DISTINCT organ_id) FROM public.organ_health_logs GROUP BY 1 ORDER BY 1`,
  organId: `SELECT organ_id, organ_name, count(*) FROM public.organ_health_logs GROUP BY 1,2 ORDER BY 3 DESC`,
  spanBoard: `SELECT count(*), to_char(min(created_at) AT TIME ZONE '${UTF}','YYYY-MM-DD HH24:MI'), to_char(max(created_at) AT TIME ZONE '${UTF}','YYYY-MM-DD HH24:MI') FROM public.board_decisions`,
  spanOrgan: `SELECT count(*), to_char(min(created_at) AT TIME ZONE '${UTF}','YYYY-MM-DD HH24:MI'), to_char(max(created_at) AT TIME ZONE '${UTF}','YYYY-MM-DD HH24:MI') FROM public.organ_health_logs`,
  dagarNya: `SELECT to_char(created_at AT TIME ZONE '${UTF}','YYYY-MM-DD'), count(*) FROM public.board_decisions WHERE created_at >= timestamptz '2026-09-17' GROUP BY 1 ORDER BY 1`,
};

const utf = {};
const sidaVal = process.argv[2] || 'bada'; // 'live' | 'skrap' | 'bada' — RAM-grind kan tvinga delning
const sidor = sidaVal === 'live' ? ['prod'] : sidaVal === 'skrap' ? ['skrap'] : ['skrap', 'prod'];
for (const [namn, sql] of Object.entries(Q)) {
  for (const sida of sidor) utf[`${namn}${sida === 'skrap' ? 'Skrap' : 'Prod'}`] = fraga(sql, sida);
}

// Q2-parse: hitta avvikande kvartsar (≠ 8 rader) — per sida, NULL-ssäker vid delkörning
function avvikande(kvartsUtf) {
  if (kvartsUtf === undefined) return null;
  return rader(kvartsUtf).filter(([k, n]) => Number(n) !== 8).map(([k, n]) => ({ kvarts: k, rader: Number(n) }));
}
const avvSkrap = avvikande(utf.kvartsSkrap);
const avvProd = avvikande(utf.kvartsProd);
const aktivSida = avvSkrap !== null ? 'skrap' : 'prod';
const avvAktiv = avvSkrap !== null ? avvSkrap : avvProd;

// Q3: exakta tidsstämplar för varje avvikande kvarts (på den sidan som kördes)
const detaljSkrap = [];
const detaljProd = [];
for (const { kvarts } of avvAktiv) {
  const start = `${kvarts}:00`;
  const sql = `SELECT to_char(created_at AT TIME ZONE '${UTF}','YYYY-MM-DD HH24:MI:SS.US') FROM public.board_decisions WHERE (created_at AT TIME ZONE '${UTF}') >= timestamp '${start}' AND (created_at AT TIME ZONE '${UTF}') < timestamp '${start}' + interval '15 min' ORDER BY 1`;
  if (aktivSida === 'skrap') detaljSkrap.push({ kvarts, rader: rader(fraga(sql, 'skrap')).map(([t]) => t) });
  else detaljProd.push({ kvarts, rader: rader(fraga(sql, 'prod')).map(([t]) => t) });
}

const utfFil = sidaVal === 'bada'
  ? 'data/forskning/DR-KOPOST-ANOMALI-ORGAN-2026-09-19.json'
  : `data/forskning/DR-KOPOST-ANOMALI-ORGAN-2026-09-19-${sidaVal.toUpperCase()}.json`;
const dom = {
  titel: 'Köpost 3+4 (5b5e9e60): 09-13-anomalien lokaliserad + organ-klockan kartlagd',
  agent: 's10-u2 (manifest auto-s10-1789802729714, spår 10 vakt 2/3)',
  andratidpunkt: new Date().toISOString(),
  metod: 'skrap-DB (blad 09-14 restore) + levande prod, LÄSANDE aggregat, Europe/Stockholm',
  anomaliAvvikandeSkrap: avvSkrap,
  anomaliAvvikandeProd: avvProd,
  anomaliInteIListan: (avvSkrap ?? avvProd ?? []).length === 0 ? 'INGA kvartsar ≠ 8 hittade i 09-12..09-14 — se dagssummor' : null,
  anomaliDetaljSkrap: detaljSkrap,
  anomalidetaljProd: detaljProd,
};
writeFileSync(utfFil, JSON.stringify({
  ...dom,
  radata: {
    dagarSkrap: rader(utf.dagarSkrap), dagarProd: rader(utf.dagarProd),
    dagarNyaProd: rader(utf.dagarNyaProd),
    kvartsSkrap: rader(utf.kvartsSkrap), kvartsProd: rader(utf.kvartsProd),
    organTimmeSkrap: rader(utf.organTimmeSkrap), organTimmeProd: rader(utf.organTimmeProd),
    organIdSkrap: rader(utf.organIdSkrap), organIdProd: rader(utf.organIdProd),
    spanBoardSkrap: rader(utf.spanBoardSkrap), spanBoardProd: rader(utf.spanBoardProd),
    spanOrganSkrap: rader(utf.spanOrganSkrap), spanOrganProd: rader(utf.spanOrganProd),
  },
}, null, 2));

console.log('=== DAGSSUMMOR board (skrap | prod) ===');
console.log('skrap:', txt(utf.dagarSkrap));
console.log('prod :', txt(utf.dagarProd));
console.log('=== AVVIKANDE KVARTSAR (≠8) 09-12..09-14 ===');
console.log('skrap:', JSON.stringify(avvSkrap));
console.log('prod :', JSON.stringify(avvProd));
console.log('=== DETALJ AVVIKANDE (skrap) ===');
console.log(JSON.stringify(detaljSkrap, null, 1));
console.log('=== ORGAN IDENTITETER (skrap) ===');
console.log(txt(utf.organIdSkrap));
console.log('=== ORGAN TIMMAR med aktivitet (skrap, hela bladet) ===');
console.log(txt(utf.organTimmeSkrap));
console.log('=== ORGAN TIMMAR med aktivitet (prod) ===');
console.log(txt(utf.organTimmeProd));
console.log('=== SPAN ===');
console.log('board skrap:', txt(utf.spanBoardSkrap), '| prod:', txt(utf.spanBoardProd));
console.log('organ skrap:', txt(utf.spanOrganSkrap), '| prod:', txt(utf.spanOrganProd));
console.log('board nya dagar prod:', txt(utf.dagarNyaProd));
console.log(`JSON → ${utfFil}`);
