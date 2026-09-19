#!/usr/bin/env node
// _s1u3-lyxaktier-verify.mjs — granskarsond för lyxaktier-sa-analyserar-du-lyxbolag.json (B20)
// Granskare s1-u3, manifest auto-s1-1789829700743. Läser, skriver ALDRIG källfiler.
// Kontroller: LVMH-fältparitet, vintage-medianer (bygg 09-17 vs idag), aritmetik,
// juridik (varumarke.json 26 regexer × 3 ytor), 911-mönster, internlänkar (localhost),
// struktur (title/desc/ord/rm), -en-spegelns systerformuleringar.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROT = '/home/ak1a/AK1';
const las = p => JSON.parse(readFileSync(ROT + p, 'utf8'));
const pad = (s, n) => String(s).padEnd(n);
let PASS = 0, FEL = 0, VARN = 0;
const rad = (ok, namn, detalj) => {
  if (ok === 'varn') { VARN++; console.log(`VARN ${namn}: ${detalj}`); }
  else if (ok) { PASS++; console.log(`PASS ${namn}: ${detalj}`); }
  else { FEL++; console.log(`FEL  ${namn}: ${detalj}`); }
};

const ut = las('/data/blogg-utkast/lyxaktier-sa-analyserar-du-lyxbolag.json');
const body = ut.body;
const ytor = { title: ut.title, description: ut.description, body };

// ── 1. LVMH-fältparitet mot dagens universum ─────────────────────────────
const uIdag = las('/data/portfolj-system/bolagsunivers.json');
const lvmh = uIdag.find(b => b.ticker === 'MC.PA');
rad(lvmh.lonksamhet.bruttoMarginal > 0.663 && lvmh.lonksamhet.bruttoMarginal < 0.664,
  'brutto 66,4', `fält ${(lvmh.lonksamhet.bruttoMarginal * 100).toFixed(2)} %`);
rad(Math.round(lvmh.lonksamhet.roe * 1000) / 10 === 16.6, 'ROE 16,6', `${(lvmh.lonksamhet.roe * 100).toFixed(2)} %`);
rad(Math.round(lvmh.lonksamhet.roic * 1000) / 10 === 17.0, 'ROIC 17,0', `${(lvmh.lonksamhet.roic * 100).toFixed(2)} %`);
rad(lvmh.stabilitet.skuldEgenkapital.toFixed(2) === '0.53', 'skuld/EK 0,53', `${lvmh.stabilitet.skuldEgenkapital}`);
rad(Math.round(lvmh.vardering.pe * 10) / 10 === 19.7, 'P/E 19,7', `${lvmh.vardering.pe}`);
rad(Math.round(lvmh.vardering.evEbit * 10) / 10 === 13.5, 'EV/EBIT 13,5', `${lvmh.vardering.evEbit}`);
rad(lvmh.vardering.peg === 1.59, 'PEG 1,59', `${lvmh.vardering.peg}`);
rad(Math.round(lvmh.vardering.fcfYield * 1000) / 10 === 5.5, 'FCF-yield 5,5', `${(lvmh.vardering.fcfYield * 100).toFixed(2)} %`);
rad(Math.round(lvmh.tillvaxt.prognosTillvaxt * 1000) / 10 === 12.3, 'prognos +12,3', `${(lvmh.tillvaxt.prognosTillvaxt * 100).toFixed(2)} %`);
rad(Math.round(lvmh.tillvaxt.resultatCAGR5ar * 1000) / 10 === -8.2, 'resultatCAGR −8,2 (källfält)', `${(lvmh.tillvaxt.resultatCAGR5ar * 100).toFixed(2)} %`);
rad(Math.round(lvmh.lonksamhet.ebitMarginal * 1000) / 10 === 22.5, 'EBIT-marginal 22,5 (LVMH-fältet)', `${(lvmh.lonksamhet.ebitMarginal * 100).toFixed(2)} %`);

// Omsättningsserie 79,2/86,2/84,7/80,8
const oms = lvmh.serier.omsattning.map(v => +(v / 1e9).toFixed(1));
rad(JSON.stringify(oms) === JSON.stringify([79.2, 86.2, 84.7, 80.8]), 'omsättningsserie 79,2/86,2/84,7/80,8', oms.join('/'));
// Resultatserie: universum 14,1/15,2/12,6/10,9 — texten listar TRE (15,2/12,6/10,9)
const res = lvmh.serier.resultat.map(v => +(v / 1e9).toFixed(1));
console.log(`INFO resultatserie universum (2022–2025): ${res.join('/')}`);
rad(res[1] === 15.2 && res[2] === 12.6 && res[3] === 10.9, 'resultatTAL 15,2/12,6/10,9 exakta i universumet', `men texten stryker 2022-talet ${res[0]}`);
rad(!body.includes('14,1'), 'B1-kandidat: 14,1 (2022) nämns INTE i texten', 'resultatserien presenteras utan startåret');

// ── 2. Medianer: byggvintage (09-17 03:04 = 795fe396) vs idag ───────────
const vintageJson = execFileSync('git', ['-C', ROT, 'show', '795fe396:data/portfolj-system/bolagsunivers.json'], { maxBuffer: 64e6 });
const uVint = JSON.parse(vintageJson.toString());
const median = a => { const s = [...a].sort((x, y) => x - y); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
for (const [tag, u] of [['VINTAGE-795fe396 (09-17 03:04)', uVint], ['IDAG (HEAD)', uIdag]]) {
  const k = u.filter(b => b.bransch === 'konsument');
  const br = k.map(b => b.lonksamhet?.bruttoMarginal).filter(v => typeof v === 'number');
  const l = u.find(b => b.ticker === 'MC.PA');
  const over = k.filter(b => (b.lonksamhet?.bruttoMarginal ?? 0) > l.lonksamhet.bruttoMarginal).map(b => b.namn.split(' ')[0]);
  console.log(`INFO ${tag}: n=${br.length} konsumentbolag, median brutto ${(median(br) * 100).toFixed(2)} %, över LVMH: ${over.join(',') || 'INGA'}, tot=${u.length}`);
}
const vK = uVint.filter(b => b.bransch === 'konsument').map(b => b.lonksamhet?.bruttoMarginal).filter(v => typeof v === 'number');
rad(vK.length === 16, 'BYGGTID n=16 konsumentbolag', `vintagen har n=${vK.length}`);
rad(Math.abs(median(vK) - 0.483) < 0.0005, 'BYGGTID median 48,3 %', `${(median(vK) * 100).toFixed(2)} %`);
const iK = uIdag.filter(b => b.bransch === 'konsument').map(b => b.lonksamhet?.bruttoMarginal).filter(v => typeof v === 'number');
rad(false || Math.abs(median(iK) - 0.483) > 0.0005, 'B2-kandidat: DAGENS median ≠ 48,3 (glidning)', `idag ${(median(iK) * 100).toFixed(2)} % n=${iK.length} — presensmeningen förfallen`);
// "endast Evolution högre" i vintagen
const lV = uVint.find(b => b.ticker === 'MC.PA');
const overV = uVint.filter(b => b.bransch === 'konsument' && (b.lonksamhet?.bruttoMarginal ?? 0) > lV.lonksamhet.bruttoMarginal);
rad(overV.length === 1 && /Evolution/i.test(overV[0].namn), '"endast Evolution högre" SANT i byggvintagen', `över: ${overV.map(b => b.namn).join(', ') || 'inga'}`);
const overI = uIdag.filter(b => b.bransch === 'konsument' && (b.lonksamhet?.bruttoMarginal ?? 0) > lvmh.lonksamhet.bruttoMarginal);
rad(overI.length === 1 && /Evolution/i.test(overI[0].namn), '"endast Evolution höger" SANT också idag', `över: ${overI.map(b => b.namn).join(', ')}`);
// KO 61,9
const ko = uIdag.find(b => /Coca/i.test(b.namn));
rad(ko && Math.round(ko.lonksamhet.bruttoMarginal * 1000) / 10 === 61.9, 'Coca-Kola 61,9', ko ? `${(ko.lonksamhet.bruttoMarginal * 100).toFixed(1)} %` : 'saknas');
// Universumets EBIT-median (tvetydigheten "universumets EBIT-marginal")
const ebitU = uIdag.map(b => b.lonksamhet?.ebitMarginal).filter(v => typeof v === 'number');
console.log(`INFO universumets EBIT-MEDIAN idag: ${(median(ebitU) * 100).toFixed(2)} % (n=${ebitU.length}) — textens "universumets EBIT-marginal på 22,5" = LVMH:s EGET fält ${ (lvmh.lonksamhet.ebitMarginal*100).toFixed(2) }`);

// ── 3. Aritmetik (egen omräkning) ────────────────────────────────────────
const na = (v, namn, exp, tol = 0.001) => rad(Math.abs(v - exp) <= tol, namn, `${v.toFixed(4)} mot väntat ${exp}`);
na(1.06 * 1.00 - 1, 'prishöjning +6 % volym 1,00 → +6,0 %', 0.060);
na(1.06 * 0.92 - 1, '1,06 × 0,92 → −2,5 %', -0.0248, 0.0005); // 0,9752 → minus 2,48 ≈ minus 2,5
na(lvmh.vardering.pe / (1 + lvmh.tillvaxt.prognosTillvaxt), 'forward-P/E 19,713/1,1232 ≈ 17,6', 17.6, 0.10);
na((oms[3] / oms[2] - 1) * 100, 'omsättning 2025 −4,6 %', -4.6, 0.05);
na((oms[2] / oms[1] - 1) * 100, 'omsättning 2024 −1,7 %', -1.7, 0.05);
na((lvmh.serier.resultat[3] / lvmh.serier.resultat[2] - 1) * 100, 'nettoresultat 2025 −13,3 % (RÅVÄRDEN — avrundade 10,9/12,6 ger −13,5, texten följer råserien)', -13.3, 0.05);
na((res[3] / res[0]) ** (1 / 3) * 100 - 100, 'CAGR 2022→2025 = källfältet −8,2', lvmh.tillvaxt.resultatCAGR5ar * 100, 0.05);
na(17.8 / 80.8, 'officiell rörelsemarginal 22 %', 0.220, 0.005);

// ── 4. Juridik: varumarke.json regexer × 3 ytor ─────────────────────────
const vm = las('/data/varumarke.json');
const fraser = vm.forbjudnaFraser;
let jf = 0;
for (const f of fraser) {
  const re = new RegExp(f.fran, 'giu');
  for (const [yta, text] of Object.entries(ytor)) {
    const m = text.match(re);
    if (m) {
      // negerad investeringsråd är tillåtet (förekommer i disclaimer)
      if (/investeringsråd/.test(f.fran) && /inte investeringsråd/.test(text)) continue;
      jf++; console.log(`  träff [${f.allvar}] ${yta}: /${f.fran}/ → "${m[0]}"`);
    }
  }
}
rad(jf === 0, `juridikgrind 0 träffar (${fraser.length} regexer × 3 ytor)`, jf === 0 ? 'ren' : `${jf} träffar`);
// disclaimer exakt sista raden i body
const sista = body.trimEnd().split('\n').pop().trim();
rad(sista === '_Detta är pedagogisk finansanalys, inte investeringsråd._', 'disclaimer sista rad', sista);
// lagrum i texten (blandrisk)
const lagrum = body.match(/(?:19|20)\d{2}:\d{3}/g) || [];
rad(lagrum.length === 0, '0 lagrum i texten', lagrum.join(',') || 'ingen blandningsrisk');
// rådverb med ordgräns (imperativ köp/sälj avseende aktier)
const radVerb = [...body.matchAll(/(?<!\p{L})(köp|sälj|råder|rekommenderar)(?!\p{L})/giu)].map(m => m[1]);
console.log(`INFO rådverb-träffar: ${radVerb.length} ${radVerb.join(',')}`);
rad(radVerb.length === 0, '0 rådverb med ordgräns', radVerb.join(',') || 'rena');

// ── 5. 911-referenser (6 mönster) ────────────────────────────────────────
const p911 = ['911', '9/11', '11 september', 'september 11', '11/9', 'nine.?eleven'];
let t911 = 0;
for (const p of p911) { const m = `${ut.title} ${ut.description} ${body}`.match(new RegExp(p, 'giu')); if (m) { t911 += m.length; console.log(`  911-träff: /${p}/ ×${m.length}`); } }
rad(t911 === 0, '911 = 0/6 mönster', 'ren');

// ── 6. Internlänkar mot localhost ────────────────────────────────────────
const lankar = [...body.matchAll(/\((\/(?:kurser|blogg)\/[^)]+)\)/g)].map(m => m[1]);
console.log(`INFO ${lankar.length} interna länkar (unika ${new Set(lankar).size})`);
let ok200 = 0, fel = [];
for (const lv of [...new Set(lankar)]) {
  try {
    const r = await fetch(`http://localhost:3000${lv}`, { redirect: 'manual' });
    if (r.status === 200) ok200++; else fel.push(`${lv} → ${r.status}`);
  } catch (e) { fel.push(`${lv} → ${e.message}`); }
}
rad(fel.length === 0, `interna länkar ${ok200}/${new Set(lankar).size} HTTP 200`, fel.join(' · ') || 'alla gröna');
rad(!body.includes('/data/blogg-utkast'), '0 länkar till utkast', 'grönt');

// ── 7. Struktur ──────────────────────────────────────────────────────────
const textRensad = body.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[#*_>`]/g, '');
const ord = textRensad.split(/\s+/).filter(Boolean).length;
rad(ut.title.length <= 60, `title ${ut.title.length}/60 tkn`, ut.title);
rad(ut.description.length <= 155, `description ${ut.description.length}/155 tkn`, ut.description.slice(0, 60) + '…');
const rmRatt = Math.round(ord / 200);
console.log(`INFO ord textrensat ${ord}, readingMinutes=${ut.readingMinutes}, granskarpraxis round(ord/200)=${rmRatt}, byggpraxis round(ord/600)=${Math.round(ord / 600)}`);
rad(ut.readingMinutes !== rmRatt, `B5-kandidat rm ${ut.readingMinutes}→${rmRatt} (ord/200-praxis)`, `${ord} ord`);
const h2 = [...body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
console.log(`INFO ${h2.length} H2: ${h2.join(' | ')}`);
rad(h2.length === 6, '6 H2-sektioner (serien 5–8)', h2.join(' | '));
rad(!/‑|\u00AD/.test(body), '0 mjuka bindestreck', 'grönt');
rad(!body.includes('\n\n\n'), '0 trippelradbrytningar', 'grönt');

// ── 8. -en-spegeln: systerformuleringar ──────────────────────────────────
try {
  const en = las('/data/blogg-utkast/lyxaktier-sa-analyserar-du-lyxbolag-en.json');
  const eb = en.body;
  const syster = {
    '16 konsumentbolag': /sixteen|16 (consumer|consumer companies)?/i.test(eb) || eb.includes('16 consumer'),
    'median 48.3': eb.includes('48.3'),
    'resultatserie 3 tal': /15\.2, 12\.6 and 10\.9|15\.2, 12\.6, and 10\.9/.test(eb),
    'rm 2': en.readingMinutes === 2,
  };
  console.log(`INFO -en-spegeln: ${Object.entries(syster).map(([k, v]) => `${k}=${v}`).join(' · ')}, ord=${eb.split(/\s+/).length}, rm=${en.readingMinutes}`);
  rad(syster['median 48.3'] && syster['resultatserie 3 tal'] && syster['rm 2'], 'systerfynd i -en-spegeln (speglas vid verkställning)', JSON.stringify(syster));
} catch { rad('varn', '-en-spegeln', 'kunde ej läsas'); }

console.log(`\n=== RESULTAT: ${PASS} PASS · ${FEL} FEL · ${VARN} VARN ===`);
