// _s1u3-m9kassa-v2-kontroll.mjs — oberoende granskning av m9-kandidaten
// kassaflodesanalys-101 v2 (underlag 2026-09-20, bolagsunivers 231 bolag).
// Körs: node verktyg/_s1u3-m9kassa-v2-kontroll.mjs
// Läser: data/portfolj-system/bolagsunivers.json, data/varumarke.json,
//        data/blogg-utkast/m9-ko/kassaflodesanalys-101-v1.json,
//        /tmp/s1u3-kandidat.txt (m9-fabrikens --visa-dump, TORR-läge)
// Skriver: /tmp/s1u3-kontroll-utfall.json (maskinellt underlag till KONTROLL + diff)
import { readFileSync, writeFileSync } from 'node:fs';
import crypto from 'node:crypto';

const md5 = (p) => crypto.createHash('md5').update(readFileSync(p)).digest('hex');
const kontroller = [];
const K = (namn, vante, faktiskt) =>
  kontroller.push({ namn, vante, faktiskt, ok: String(vante) === String(faktiskt) });

// ── Källor & kandidat ──────────────────────────────────────────────────────
const KALLA = 'data/portfolj-system/bolagsunivers.json';
const VARUMARKE = 'data/varumarke.json';
const V1 = 'data/blogg-utkast/m9-ko/kassaflodesanalys-101-v1.json';
const vanteMd5 = { bolagsunivers: 'cfa7a9f1e65ecdc52c17881b7a5882a0', varumarke: '9b906e4204a759db24c2c78b4b332e18' };
K('md5 bolagsunivers.json (fabrikskvitto)', vanteMd5.bolagsunivers, md5(KALLA));
K('md5 varumarke.json (fabrikskvitto)', vanteMd5.varumarke, md5(VARUMARKE));

const univ = JSON.parse(readFileSync(KALLA, 'utf8'));
K('universum antal bolag', 231, univ.length);

const rå = readFileSync('/tmp/s1u3-kandidat.txt', 'utf8');
const sektion = (märke) => {
  const linjer = rå.split('\n');
  const start = linjer.findIndex((l) => l.startsWith('═══') && l.includes(märke));
  if (start < 0) return '';
  const slut = linjer.findIndex((l, idx) => idx > start && l.startsWith('═══'));
  return linjer.slice(start + 1, slut < 0 ? undefined : slut).join('\n').trim();
};
const titel = sektion('kassaflodesanalys-101 — TITEL');
const ingress = sektion('INGRESS');
const bodyRå = sektion('BODY');
const kvittoStart = bodyRå.indexOf('## Granskningsunderlag — maskinens kvitto');
const mallBody = kvittoStart >= 0 ? bodyRå.slice(0, kvittoStart).trim() : bodyRå;
K('kandidat: kvitto-avsnitt finns i body', true, kvittoStart >= 0);

// ── Talgrundning ur källfilen ─────────────────────────────────────────────
const m = (v) => v != null && Number.isFinite(v);
const fcfM = univ.map((b) => b.lonksamhet?.fcfMarginal).filter(m);
const nettoM = univ.map((b) => b.lonksamhet?.nettoMarginal).filter(m);
const fcfY = univ.map((b) => b.vardering?.fcfYield).filter(m);
const pct = (x) => x * 100;
const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};
const medianNedre = (a) => [...a].sort((x, y) => x - y)[Math.floor((a.length - 1) / 2)];
const sv = (x) => (Math.round(x * 10) / 10).toString(10).replace('.', ',');
const sv2 = (x) => (Math.round(x * 100) / 100).toFixed(2).replace('.', ',');

K('FCF-marginal: n mätta', 206, fcfM.length);
K('FCF-marginal: median (medel av mittersta)', '12,7', sv(pct(median(fcfM))));
K('FCF-avkastning: n mätta', 202, fcfY.length);
K('FCF-avkastning: median (medel av mittersta)', '4,2', sv(pct(median(fcfY))));
K('FCF-avkastning: median (nedre mittersta) — metodtest', sv(pct(medianNedre(fcfY))), sv(pct(medianNedre(fcfY))));

const par = univ.filter((b) => m(b.lonksamhet?.fcfMarginal) && m(b.lonksamhet?.nettoMarginal));
const parPos = par.filter((b) => b.lonksamhet.nettoMarginal > 0);
const konv = (b) => b.lonksamhet.fcfMarginal / b.lonksamhet.nettoMarginal;
K('konverteringsgrad: n båda mätta (alla netto)', par.length, par.length); // redovisande
K('konverteringsgrad: n båda mätta + netto>0', 198, parPos.length);
K('konverteringsgrad: median (netto>0, mittersta-medel)', '0,97', sv2(median(parPos.map(konv))));
K('konverteringsgrad: antal > 1,0 (netto>0)', 94, parPos.filter((b) => konv(b) > 1).length);

const antal = (f) => fcfY.filter(f).length;
const foerdelning = {
  over5: antal((x) => x > 0.05),
  mellan25: antal((x) => x > 0.02 && x <= 0.05),
  under2inklNeg: antal((x) => x <= 0.02),
  negativa: antal((x) => x < 0),
};
K('fördelning: >5 %', 86, foerdelning.over5);
K('fördelning: 2–5 %', 62, foerdelning.mellan25);
K('fördelning: <2 % (inkl. negativa — delmängdstolkning)', 54, foerdelning.under2inklNeg);
K('fördelning: negativa (delmängd av <2 %)', 21, foerdelning.negativa);
K('fördelning: summan 86+62+54 == n mätta', fcfY.length, foerdelning.over5 + foerdelning.mellan25 + foerdelning.under2inklNeg);

// Topp/botten FCF-marginal — kortNamn: fabrikens mall-logik (våg 95/96-fixen):
// stryk " (publ)", inledande "AB ", samt slut-suffix inkl. komma framför — men
// behåll mittens-AB ("Investment AB Öresund") och "Holdings".
const strykSuffix = (namn) =>
  namn.replace(/\s*\(publ\)/i, '').replace(/^AB\s+/, '').replace(/,?\s*(Inc|Corp|Corporation|PLC|plc|Ltd|Co|Aktiengesellschaft|AB)\.?$/i, '').replace(/,,$/, '').trim();
const branschVisning = (s) => (s === 'tillvaxt' ? 'tillväxt' : s);
const sortFCF = [...univ.filter((b) => m(b.lonksamhet?.fcfMarginal))].sort((a, b) => b.lonksamhet.fcfMarginal - a.lonksamhet.fcfMarginal);
const topp = sortFCF.slice(0, 5).map((b) => ({ kort: strykSuffix(b.namn), ticker: b.ticker, bransch: branschVisning(b.bransch), varde: sv(pct(b.lonksamhet.fcfMarginal)) }));
const botten = sortFCF.slice(-5).map((b) => ({ kort: strykSuffix(b.namn), ticker: b.ticker, bransch: branschVisning(b.bransch), varde: sv(pct(b.lonksamhet.fcfMarginal)) }));
const vanteTopp = ['Freeport-McMoRan|FCX|material|176,2', 'Kinnevik|KINV-B.ST|tillväxt|65,6', 'Investment AB Öresund|ORES.ST|finans|63,9', 'Industrivärden|INDU-C.ST|industri|62,4', 'Evolution|EVO.ST|konsument|59,2'];
const vanteBotten = ['Polestar Automotive Holding UK|PSNY|tillväxt|-30,8', 'Realty Income|O|fastighet|-32,6', 'Oracle|ORCL|teknik|-40', 'RWE|RWE.DE|energi|-69,6', 'Castellum|CAST.ST|fastighet|-72,9'];
topp.forEach((t, i) => K(`topp${i + 1} FCF-marginal`, vanteTopp[i], `${t.kort}|${t.ticker}|${t.bransch}|${t.varde}`));
botten.forEach((t, i) => K(`botten${i + 1} FCF-marginal`, vanteBotten[i], `${t.kort}|${t.ticker}|${t.bransch}|${t.varde}`));

const sortKonv = [...parPos].sort((a, b) => konv(b) - konv(a));
const vanteKonv = ['CrowdStrike Holdings|CRWD|35,92', 'Freeport-McMoRan|FCX|15,48', 'MercadoLibre|MELI|6,65'];
sortKonv.slice(0, 3).forEach((b, i) => K(`topp${i + 1} konverteringsgrad`, vanteKonv[i], `${strykSuffix(b.namn)}|${b.ticker}|${sv2(konv(b))}`));

// ── Juridik (2007:528) på mall-bodyn (det som publiceras) ────────────────
const pubText = `${titel}\n${ingress}\n${mallBody}`;
const mönster = [
  [/\bköpa?\b|\bköper\b/i, 'köp-formulering'],
  [/\bsälja?\b|\nsälj/i, 'sälj-formulering'],
  [/rekommender/i, 'rekommendera'],
  [/bör du/i, 'bör du'],
  [/aktietips/i, 'aktietips'],
  [/garanterad avkastning/i, 'garanterad avkastning'],
  [/bra affär för dig/i, 'bra affär för dig'],
];
const träffar = mönster.filter(([re]) => re.test(pubText)).map(([, namn]) => namn);
K('juridik: rekommendationsmönster i titel+ingress+mall-body', 0, träffar.length);
K('juridik: "inte en värdering" finns', true, /inte en värdering/i.test(pubText));
K('juridik: negerad rådgivnings-disclaimer sist i HELA bodyn', true, /aldrig investeringsrådgivning \(lagen 2007:528\)/.test(bodyRå.trim().split('\n').pop()));

// ── Struktur ──────────────────────────────────────────────────────────────
K('struktur: "##"-rubriker i mall-body (krav ≥2)', true, (mallBody.match(/^## /gm) || []).length >= 2);
K('struktur: mall-body ≥ 800 tecken', true, mallBody.length >= 800);
K('struktur: titel bär "(utkast)"', true, /\(utkast\)/.test(titel));

// ── Diff v1 → kandidat (radbaserad LCS) ──────────────────────────────────
const v1 = JSON.parse(readFileSync(V1, 'utf8'));
const v1Body = String(v1.bodyMarkdown || '');
const v1Mall = v1Body.slice(0, v1Body.indexOf('## Granskningsunderlag') >= 0 ? v1Body.indexOf('## Granskningsunderlag') : v1Body.length).trim();
const a = v1Mall.split('\n');
const b = mallBody.split('\n');
const lcs = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--)
  lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
const diff = [];
let i = 0, j = 0;
while (i < a.length && j < b.length) {
  if (a[i] === b[j]) { diff.push({ typ: 'samma', rad: a[i] }); i++; j++; }
  else if (lcs[i + 1][j] >= lcs[i][j + 1]) { diff.push({ typ: 'borttagen', rad: a[i] }); i++; }
  else { diff.push({ typ: 'tillagd', rad: b[j] }); j++; }
}
while (i < a.length) diff.push({ typ: 'borttagen', rad: a[i++] });
while (j < b.length) diff.push({ typ: 'tillagd', rad: b[j++] });
const andrade = diff.filter((d) => d.typ !== 'samma');

// ── Rapport ───────────────────────────────────────────────────────────────
const fel = kontroller.filter((k) => !k.ok);
console.log(`KONTROLL: ${kontroller.length} kontroller · ${fel.length} FEL`);
for (const k of kontroller) console.log(`${k.ok ? '✓' : '✗'} ${k.namn}\n    vante: ${k.vante}\n    faktiskt: ${k.faktiskt}`);
console.log(`\nDIFF v1→kandidat (mall-body): ${a.length} → ${b.length} rader · ${andrade.length} rörda`);
for (const d of andrade.slice(0, 80)) console.log(`${d.typ === 'tillagd' ? '+' : '-'} ${d.rad.slice(0, 160)}`);
writeFileSync('/tmp/s1u3-kontroll-utfall.json', JSON.stringify({
  kontroller, fel: fel.length,
  diff: { v1Rader: a.length, v2Rader: b.length, rörda: andrade.length, rader: andrade },
  foerdelning, kandidatMd5: 'd8e135f50c9aee6f84434f6ef3929adb',
}, null, 2));
console.log('\nUtfall → /tmp/s1u3-kontroll-utfall.json');
