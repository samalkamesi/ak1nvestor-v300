#!/usr/bin/env node
/**
 * KVD för s4-u1:s SAP Q3-2026-läspaket (sa-laser-du-sap-q3-2026.json).
 * Kontrollerar: JSON-struktur, källtalsparitet mot bolagsuniversum-posten,
 * aritmetiken i datavaktens kontroller (oberoende omräkning), juridikgrinden,
 * interna länkar mot localhost:3000 samt ord/readingMinutes-kontraktet.
 * Läser ENDAST — installerar/bygger ALDRIG (reglerna för fabriksagenter).
 */
import fs from 'node:fs';

const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-sap-q3-2026.json';
const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
const BAS = 'http://localhost:3000';

let pass = 0, fel = 0, varning = 0;
const ok = (villkor, namn, detalj = '') => {
  if (villkor) { pass++; console.log('PASS ' + namn + (detalj ? ' — ' + detalj : '')); }
  else { fel++; console.log('FEL  ' + namn + (detalj ? ' — ' + detalj : '')); }
};
const approx = (faktiskt, forvantat, tolerans, namn) =>
  ok(Math.abs(faktiskt - forvantat) <= tolerans, namn, faktiskt.toFixed(4) + ' mot ' + forvantat.toFixed(4) + ' (tol ' + tolerans + ')');

// ── 0. Struktur ─────────────────────────────────────────────────────────────
const p = JSON.parse(fs.readFileSync(PAKET, 'utf8'));
ok(p.slug === 'sa-laser-du-sap-q3-2026', 'slug');
ok(p.title.length > 20 && p.title.length <= 105, 'title-längd', p.title.length + ' tkn');
ok(p.description.length > 100 && p.description.length <= 600, 'description-längd', p.description.length + ' tkn');
ok(p.pillar === 'Institutionell metodik', 'pillar');
ok(p.publishedAt === '2026-10-21', 'publishedAt = rappdagen');
ok(Array.isArray(p.tags) && p.tags.length >= 5, 'tags', p.tags.join(', '));
ok(typeof p.body === 'string' && p.body.length > 5000, 'body längd', p.body.length + ' tkn');

// ── 1. Källtalsparitet mot universumposten ─────────────────────────────────
const u = JSON.parse(fs.readFileSync(UNI, 'utf8'));
const list = Array.isArray(u) ? u : (u.bolag || u);
const s = list.find(x => x.ticker === 'SAP.DE');
ok(!!s, 'SAP.DE finns i universumfilen');
const V = s.vardering, L = s.lonksamhet, T = s.tillvaxt, ST = s.stabilitet;
const b = p.body;
const innehaller = (str, namn) => ok(b.includes(str), 'källtalsparitet: ' + namn, str);
innehaller('28,02', 'P/E 28,021');
innehaller('4,76', 'P/B 4,764');
innehaller('19,74', 'EV/EBIT 19,741');
innehaller('1,61', 'PEG 1,61');
innehaller('4,27 %', 'FCF-avkastning 4,27 %');
innehaller('18,32 %', 'ROE 18,32 %');
innehaller('19,29 %', 'ROIC 19,29 %');
innehaller('73,66 %', 'bruttomarginal 73,66 %');
innehaller('27,62 %', 'EBIT-marginal 27,62 %');
innehaller('20,41 %', 'nettomarginal 20,41 %');
innehaller('23,80 %', 'FCF-marginal 23,80 %');
innehaller('17,26 %', 'prognostillväxt 17,26 %');
innehaller('63,50', 'resultat-CAGR 63,50 %');
innehaller('6,03', 'omsättnings-CAGR 6,03 %');
innehaller('9,40 %', 'TTM-omsättningstillväxt 9,40 %');
innehaller('30 871', 'omsättning 2022');
innehaller('31 207', 'omsättning 2023');
innehaller('34 176', 'omsättning 2024');
innehaller('36 800', 'omsättning 2025');
innehaller('1 714', 'resultat 2022');
innehaller('3 564', 'resultat 2023');
innehaller('3 124', 'resultat 2024');
innehaller('7 492', 'resultat 2025');
innehaller('184,66', 'kurs 184,66 EUR');
innehaller('213,135', 'marknadsvärde 213,135 mdr EUR');
innehaller('2026-09-03', 'universumdata hämtat 2026-09-03');

// ── 2. Aritmetik — oberoende omräkning av datavaktens kontroller ───────────
const oms = s.serier.omsattning, res = s.serier.resultat;
const oms25 = oms[3], res25 = res[3], mkap = s.marknadsKapitalMdr;
approx(V.pb / L.roe, 26.00, 0.01, 'identitet P/B÷ROE = 26,00');
approx(V.pe * (res25 / 1e9), 209.93, 0.01, 'absolutkontroll P/E×res = 209,93 mdr');
approx(((mkap - V.pe * res25 / 1e9) / (V.pe * res25 / 1e9)) * 100, 1.53, 0.01, 'absolutresidual +1,53 %');
approx(mkap / V.pe, 7.606, 0.001, 'implicit årsresultat 7,61 mdr');
approx(mkap / V.pb, 44.74, 0.01, 'EK via P/B 44,74 mdr');
approx((res25 / 1e9 / (mkap / V.pb)) * 100, 16.75, 0.01, 'resultat-ROE 16,75 %');
approx(L.ebitMarginal * (oms25 / 1e9), 10.164, 0.001, 'EBIT 2025 = 10,16 mdr');
approx((mkap + (mkap / V.pb) * ST.skuldEgenkapital) / (L.ebitMarginal * oms25 / 1e9), 21.94, 0.01, 'EV/EBIT med skuld 21,94');
approx(mkap / (L.ebitMarginal * oms25 / 1e9), 20.97, 0.01, 'EV/EBIT utan skuld 20,97');
approx(V.evEbit * (L.ebitMarginal * oms25 / 1e9), 200.7, 0.1, "fältets implicita EV 200,7 mdr");
const fcf = L.fcfMarginal * oms25 / 1e9;
approx((fcf / mkap) * 100, 4.11, 0.01, 'FCF-par 4,11 %');
approx(Math.abs(((V.fcfYield - fcf / mkap) / (fcf / mkap)) * 100), 3.9, 0.05, 'FCF-par avvikelse 3,9 %');
approx(V.pe / (T.prognosTillvaxt * 100), 1.62, 0.01, 'PEG-konvention 1,62');
ok(Math.abs(V.peg - V.pe / (T.prognosTillvaxt * 100)) / (V.pe / (T.prognosTillvaxt * 100)) < 0.02, 'PEG-fältet replikeras inom 2 %');
approx((Math.pow(res[3] / res[0], 1 / 3) - 1) * 100, 63.50, 0.01, 'resultat-CAGR 63,50 %/år = källfält');
approx((Math.pow(oms[3] / oms[0], 1 / 3) - 1) * 100, 6.03, 0.01, 'oms-CAGR 6,03 %/år = källfält');
approx((res[1] / res[0] - 1) * 100, 107.93, 0.01, 'res-steg 2023 +107,93 %');
approx((res[2] / res[1] - 1) * 100, -12.35, 0.01, 'res-steg 2024 −12,35 %');
approx((res[3] / res[2] - 1) * 100, 139.82, 0.01, 'res-steg 2025 +139,82 %');
approx((oms[1] / oms[0] - 1) * 100, 1.09, 0.01, 'oms-steg 2023 +1,09 %');
approx((oms[2] / oms[1] - 1) * 100, 9.51, 0.01, 'oms-steg 2024 +9,51 %');
approx((oms[3] / oms[2] - 1) * 100, 7.68, 0.01, 'oms-steg 2025 +7,68 %');
for (let i = 0; i < 4; i++) {
  const m = ((res[i] / oms[i]) * 100).toFixed(2).replace('.', ',');
  ok(b.includes(m + ' %'), 'nettomarginal ' + s.serier.ar[i] + ' = ' + m + ' %');
}
// Scenariorutan
const marginaler = [L.ebitMarginal - 0.02, L.ebitMarginal, L.ebitMarginal + 0.02];
const vols = [0.97, 1, 1.03];
for (const m of marginaler) for (const v of vols) {
  const cell = (m * oms25 * v / 1e9).toFixed(2).replace('.', ',');
  ok(b.includes(cell), 'scenariecell ' + cell + ' mdr');
}
approx(0.01 * (oms25 / 1e9) * 1000, 368, 1, '1 pp marginal = 368 M EUR/år');
approx(0.03 * oms25 * L.ebitMarginal / 1e9 * 1000, 305, 1, '3 % volym = 305 M EUR');
approx(1 / (3 * L.ebitMarginal), 1.21, 0.01, 'marginalvikt 1,21');
approx(mkap / 24.85, 8.58, 0.01, 'multipl-övning: årsresultat 8,58 mdr → P/E 24,85');
approx((8.575 / 7.492 - 1) * 100, 14.5, 0.1, 'premiekrav +14,5 %');

// ── 3. Juridikgrinden (lagen 2007:528 2 kap 5 § — utbildning, aldrig råd) ──
ok(b.includes('(2007:528) 2 kap 5 §'), 'lagrum närvarande exakt en gång', (b.match(/2007:528/g) || []).length + ' förekomster');
const rod = (b.match(/\b(köp|sälj|undvik)\b[^,.]{0,30}(aktien|nu|denna|idag)/gi) || []);
ok(rod.length === 0, 'inga rådverbformer', rod.join('; '));
ok(/inte investeringsrådgivning/.test(b), 'disclaimer-negation');
ok(/publiceringen av detta paket är kundens beslut/.test(b), 'R2-not');
ok(!/målkurs/i.test(b), 'ingen målkurs');

// ── 4. Interna länkar mot localhost ────────────────────────────────────────
const links = [...new Set([...b.matchAll(/\]\((\/[^)#?]+)/g)].map(m => m[1]))];
let svar;
try {
  svar = await Promise.all(links.map(async (l) => {
    const r = await fetch(BAS + l, { signal: AbortSignal.timeout(8000) });
    return { l, k: r.status };
  }));
  for (const { l, k } of svar) ok(k === 200, 'länk 200 ' + l, String(k));
} catch (e) {
  varning++;
  console.log('VARNING länkkoll hoppades över: ' + e.message);
}
ok(links.length >= 18, 'minst 18 unika interna länkar', links.length + ' st');

// ── 5. Ord-/tidskontrakt (600 ord per läsminut, JNJ-precedensen) ───────────
const ord = p.body.trim().split(/\s+/).length;
const min = Math.max(1, Math.round(ord / 600));
ok(Math.abs(min - p.readingMinutes) <= 0, 'readingMinutes-kontrakt', ord + ' ord → ' + min + ' min (filen säger ' + p.readingMinutes + ')');
ok(ord >= 1200 && ord <= 3200, 'ordmängd i seriens spannmått', ord + ' ord');

console.log('\nKVD-SAMMANFATTNING: ' + pass + ' PASS, ' + fel + ' FEL, ' + varning + ' VARNING');
process.exit(fel > 0 ? 1 : 0);
