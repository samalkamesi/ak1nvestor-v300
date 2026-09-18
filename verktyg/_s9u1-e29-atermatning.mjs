// Sond: E29-systemets återmätning (dokvåg s9-u1, manifest auto-s9-1789731901131).
// Disk-först-precedensen: anspråk låg på disk 13:49 FÖRE denna verifiering.
// Skriver MÄTNING till stdout + data/vakten/ (gitignorerad väg). Värden ALDRIG
// inlästa från .env* — endast NAMNTRÄFFAR för CRON_SECRET (09-16-precedensen).
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const now = new Date();
const rad = (k, v) => console.log(`${k}: ${v}`);

// 1. Fabriksmanifest: klara / totalt i status/
const stDir = 'data/vakten/agentfabrik/status';
const statusFiler = readdirSync(stDir).filter(f => f.endsWith('.json'));
let klara = 0, pagaende = [];
for (const f of statusFiler) {
  try {
    const j = JSON.parse(readFileSync(`${stDir}/${f}`, 'utf8'));
    if (j.status === 'klar') klara++;
    else pagaende.push(`${f.replace('.json','')} (${j.status}, klara ${j.klara?.length ?? 0}/${j.totalt ?? '?'})`);
  } catch { /* ogiltig json räknas ej */ }
}
rad('manifest_totalt', statusFiler.length);
rad('manifest_klara', klara);
rad('manifest_pagaende', pagaende.join(' | ') || 'inga');

// 2. Utdataloggar (leveransbevis)
const utFiler = readdirSync('data/vakten/agentfabrik/utdata').filter(f => f.endsWith('.log'));
rad('utdataloggar', utFiler.length);

// 3. Beslutsminnet: poster + senaste
const bmRader = readFileSync('data/vakten/beslutsminne.jsonl', 'utf8').trim().split('\n');
const sistaBm = JSON.parse(bmRader[bmRader.length - 1]);
rad('beslutsminne_poster', bmRader.length);
rad('beslutsminne_senast', `${sistaBm.rad ?? sistaBm.titel ?? '?'} · ${sistaBm.ts ?? sistaBm.tid ?? '?'}`);
const bmIdag = bmRader.filter(r => { try { const j = JSON.parse(r); return String(j.ts ?? j.tid ?? '').startsWith('2026-09-18'); } catch { return false; } }).length;
rad('beslutsminne_idag', bmIdag);

// 4. pumpor-daemon + levande fabriksprocess (ps — namnträffar endast)
try {
  const ps = execFileSync('ps', ['-eo', 'pid,etime,cmd'], { encoding: 'utf8' });
  const pumpor = ps.split('\n').filter(l => l.includes('ak1a-pumpor') && !l.includes('grep'));
  rad('pumpor_ps', pumpor.length ? pumpor[0].trim().slice(0, 120) : 'SAKNAS');
  const fab = ps.split('\n').filter(l => l.includes('agentfabrik.mjs') && !l.includes('grep'));
  rad('fabriksprocess_ps', fab.length ? fab.map(l => l.trim().slice(0, 110)).join(' ;; ') : 'ingen levande (rop styrs av pumpor)');
} catch (e) { rad('ps_fel', e.message); }

// 5. Evighetsmotorn: kontroller + senaste + mål-läge
try {
  const ev = JSON.parse(readFileSync('data/vakten/evighetsmotor-state.json', 'utf8'));
  rad('evighet_kontroller', ev.kontroller ?? ev.antal ?? JSON.stringify(Object.keys(ev)));
  rad('evighet_senast', ev.senasteKontroll ?? ev.senast ?? '?');
  const mal = JSON.parse(readFileSync('data/vakten/mal-state.json', 'utf8'));
  rad('mal_state', `mal=${mal.mal ? 'AKTIVT' : 'null'} · uppdaterad ${mal.uppdaterad ?? mal.ts ?? '?'}`);
} catch (e) { rad('evighet_fel', e.message); }

// 6. Svitgapet: pumpor/styrelse HAR · fabrik/evighet/uppdrag saknar
const svitKoll = {
  'testa-pumpor-scheman.mjs': false, 'testa-styrelse.mjs': false,
  'testa-agentfabrik.mjs': false, 'testa-evighetsmotor.mjs': false, 'testa-uppdrag.mjs': false,
};
for (const f of readdirSync('verktyg')) if (f in svitKoll) svitKoll[f] = true;
rad('svitgap', JSON.stringify(svitKoll));

// 7. CRON_SECRET: NAMNTRÄFF i .env*-filer (värden läses ALDRIG)
try {
  const envFiler = readdirSync('.').filter(f => f.startsWith('.env'));
  let traffar = [];
  for (const f of envFiler) {
    const txt = readFileSync(f, 'utf8');
    if (/^CRON_SECRET/m.test(txt)) traffar.push(f);
  }
  rad('cron_secret_namntraff', traffar.length ? traffar.join(',') : `0 (av ${envFiler.length} env-filer)`);
} catch (e) { rad('cron_secret_koll_fel', e.message); }

// 8. Kunduppdragsfilerna (viloläge = frånvarande)
rad('kunduppdrag_json', existsSync('data/vakten/kunduppdrag.json') ? 'FINNS (order i flykt!)' : 'frånvarande');
rad('uppdrag_klart_json', existsSync('data/vakten/uppdrag-klart.json') ? 'FINNS' : 'frånvarande');

// 9. s8-kollisionsnotiserna (bevisklassen, återmätt)
for (const n of ['auto-s8-1789730101010-u1-o67-commitnotis.md', 'auto-s8-1789730101010-u2-o68-commitnotis.md']) {
  const p = `data/vakten/${n}`;
  if (existsSync(p)) { const s = statSync(p); rad(`notis_${n.slice(-18)}`, `finns ${s.mtime.toISOString().slice(0,16)}`); }
}

rad('matt_nu', now.toISOString());
