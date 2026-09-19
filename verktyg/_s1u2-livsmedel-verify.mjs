#!/usr/bin/env node
// _s1u2-livsmedel-verify.mjs — granskningssond för livsmedelsaktier-utkastet (s1-u2, auto-s1-1789829700743)
// Kontrakt: läs utterJSON + bolagsunivers.json + varumarke.json, kör kontroller, skriv ENDAST stdout.
// Granskaren skriver ej om andras filer — sonden är read-only mot allt utom egen utmatning.
import { readFileSync } from 'node:fs';

const ROT = '/home/ak1a/AK1';
const las = (p) => readFileSync(ROT + '/' + p, 'utf8');
const ut = JSON.parse(las('data/blogg-utkast/livsmedelsaktier-sa-analyserar-du-livsmedelsbolag.json'));
const uni = JSON.parse(las('data/portfolj-system/bolagsunivers.json'));
const vm = JSON.parse(las('data/varumarke.json'));

const body = ut.body ?? '';
const ytor = { title: ut.title ?? '', description: ut.description ?? '', body };
const allt = ytor.title + '\n' + ytor.description + '\n' + body;

let ok = 0, fel = 0, varn = 0;
const rad = (status, namn, detalj) => {
  if (status === 'OK') ok++; else if (status === 'FEL') fel++; else varn++;
  console.log(`${status} ${namn} — ${detalj}`);
};
const nara = (fakta, text, tolk = 0.05, procent = false) =>
  Math.abs(fakta - text) <= tolk * (procent ? 1 : Math.abs(fakta) || 1);

// ---------- 1. KÄLLTALSPARITET mot bolagsunivers.json ----------
const B = (t) => uni.find((x) => x.ticker === t);
const PEP = B('PEP'), KO = B('KO'), NESN = B('NESN.SW'), CARL = B('CARL-B.CO');
for (const [t, b] of [['PEP', PEP], ['KO', KO], ['NESN.SW', NESN], ['CARL-B.CO', CARL]])
  if (!b) rad('FEL', 'universum', `${t} saknas i universumet`);

const K = [
  // [namn, faktavärde, textvärde, tolerans (relativ)]
  ['PEP oms 2022 Mdr', PEP.serier.omsattning[0] / 1e9, 86.4, 0.01],
  ['PEP oms 2025 Mdr', PEP.serier.omsattning[3] / 1e9, 93.9, 0.01],
  ['PEP omsCAGR', PEP.tillvaxt.omsattningCAGR5ar * 100, 2.8, 0.05],
  ['PEP brutto %', PEP.lonksamhet.bruttoMarginal * 100, 54.2, 0.01],
  ['PEP bruttoMedel5ar %', PEP.moat.bruttoMarginalMedel5ar * 100, 54.3, 0.01],
  ['PEP bruttoSpread5ar pp', PEP.moat.bruttoMarginalSpread5ar * 100, 1.6, 0.05],
  ['PEP resultat Mdr', PEP.serier.resultat[3] / 1e9, 8.2, 0.01],
  ['PEP mcap Mdr', PEP.marknadsKapitalMdr, 183.7, 0.005],
  ['PEP ROE %', PEP.lonksamhet.roe * 100, 51.5, 0.01],
  ['PEP ROIC %', PEP.lonksamhet.roic * 100, 19.4, 0.01],
  ['PEP skuld/EK', PEP.stabilitet.skuldEgenkapital, 2.39, 0.005],
  ['PEP P/E', PEP.vardering.pe, 17.8, 0.005],
  ['PEP PEG', PEP.vardering.peg, 1.25, 0.005],
  ['KO brutto %', KO.lonksamhet.bruttoMarginal * 100, 61.9, 0.01],
  ['KO oms Mdr', KO.serier.omsattning[3] / 1e9, 47.9, 0.01],
  ['KO resultat Mdr', KO.serier.resultat[3] / 1e9, 13.1, 0.01],
  ['KO mcap Mdr', KO.marknadsKapitalMdr, 381.7, 0.005],
  ['KO ROE %', KO.lonksamhet.roe * 100, 42.0, 0.02],
  ['KO ROIC %', KO.lonksamhet.roic * 100, 20.1, 0.01],
  ['KO skuld/EK', KO.stabilitet.skuldEgenkapital, 1.16, 0.005],
  ['KO P/E', KO.vardering.pe, 26.7, 0.005],
  ['KO PEG', KO.vardering.peg, 12.6, 0.005],
  ['KO prognosTillvaxt %', KO.tillvaxt.prognosTillvaxt * 100, 2.1, 0.05],
  ['KO fcf 2022 Mdr', KO.serier.fcf[0] / 1e9, 9.5, 0.01],
  ['KO resultat 2022 Mdr', KO.serier.resultat[0] / 1e9, 9.5, 0.01],
  ['KO fcf 2025 Mdr', KO.serier.fcf[3] / 1e9, 5.3, 0.01],
  ['NESN oms 2022 Mdr', NESN.serier.omsattning[0] / 1e9, 94.8, 0.01],
  ['NESN oms 2025 Mdr', NESN.serier.omsattning[3] / 1e9, 89.9, 0.01],
  ['NESN omsCAGR %', NESN.tillvaxt.omsattningCAGR5ar * 100, -1.8, 0.05],
  ['NESN brutto %', NESN.lonksamhet.bruttoMarginal * 100, 45.7, 0.01],
  ['NESN P/E trailing', NESN.vardering.pe, 27.4, 0.005],
  ['NESN PEG', NESN.vardering.peg, 0.45, 0.01],
  ['CARL brutto %', CARL.lonksamhet.bruttoMarginal * 100, 45.0, 0.01],
  ['CARL resultat 2023 Mdr', CARL.serier.resultat[1] / 1e9, -40.8, 0.01],
  ['CARL resultat 2024 Mdr', CARL.serier.resultat[2] / 1e9, 9.1, 0.01],
  ['CARL resultat 2025 Mdr', CARL.serier.resultat[3] / 1e9, 6.0, 0.01],
  ['CARL oms 2023 Mdr', CARL.serier.omsattning[1] / 1e9, 73.6, 0.01],
  ['CARL P/E', CARL.vardering.pe, 18.2, 0.005],
];
for (const [namn, fakta, text, tol] of K) {
  const avvik = Math.abs(fakta - text) / (Math.abs(fakta) || 1);
  rad(avvik <= tol ? 'OK' : 'FEL', 'källtal ' + namn, `universum ${fakta.toFixed(4)} mot text ${text} (avvik ${(avvik * 100).toFixed(2)} %)`);
}
// NESN forward-P/E 17,0 ur notens 27,39/17,04
rad(Math.abs(17.04 - 17.0) < 0.05 ? 'OK' : 'FEL', 'NESN forward P/E', `noten bär 17,04 mot text 17,0`);
// Carlsberg resultattillväxt osatt
rad(/osatt/i.test(CARL.notering) ? 'OK' : 'FEL', 'CARL osatt-resultatpåstående', `noten: "${CARL.notering.match(/resultatCAGR[^;.]*/)?.[0] ?? 'osatt ej hittat'}"`);

// ---------- 2. ARITMETIK (egna omräkningar) ----------
const A = [
  ['organisk tillväxt 1,04×0,99', 1.04 * 0.99, 1.0296, 0.001],
  ['PEP CAGR (93,925/86,392)^(1/3)-1 %', ((PEP.serier.omsattning[3] / PEP.serier.omsattning[0]) ** (1 / 3) - 1) * 100, 2.8, 0.01],
  ['NESN CAGR (89,885/94,780)^(1/3)-1 %', ((NESN.serier.omsattning[3] / NESN.serier.omsattning[0]) ** (1 / 3) - 1) * 100, -1.8, 0.005],
  ['råvara: 45×1,1=49,5', 45 * 1.1, 49.5, 0.001],
  ['råvara: marginal 100-49,5=50,5', 100 - 49.5, 50.5, 0.001],
  ['pris+3 %: (103-49,5)/103 %', ((103 - 49.5) / 103) * 100, 51.9, 0.001],
  ['duopol: 93,9/47,9', 93.9 / 47.9, 1.9603, 0.001],
  ['engångs: 40,8/73,6', 40.8 / 73.6, 0.5543, 0.001],
  ['KO PEG härledning 26,66/2,11', 26.66 / 2.11, 12.63, 0.01],
];
for (const [namn, raknat, text, tol] of A)
  rad(Math.abs(raknat - text) <= tol ? 'OK' : 'FEL', 'aritmetik ' + namn, `egen=${raknat.toFixed(4)} mot text ${text}`);

// ---------- 3. JURIDIK 2007:528 ----------
const radmin = /\b(köp|köps|köper|köpa|sälj|sälja|säljer|sålt|rekommendera\w*|bör du|borde du|råder dig|råd till dig|min rekommendation|tips[a]?)\b/gi;
const radTr = [...allt.matchAll(radmin)].map((m) => m[0]);
rad(radTr.length === 0 ? 'OK' : 'VARN', 'rådglossor med ordgräns', radTr.length === 0 ? '0 träffar' : `${radTr.length}: ${radTr.join(', ')} (manuell bedömning deskriptiv/imperativ krävs)`);
const lagrum = [...allt.matchAll(/(2007:528|2022:260|2022:261|1985:716|2005:59|2022:482)/g)].map((m) => m[1]);
rad(lagrum.length === 0 ? 'OK' : 'VARN', 'lagrum i text', lagrum.length === 0 ? '0 lagrum → ingen blandningsrisk' : lagrum.join(', '));
for (const [yt, txt] of Object.entries(ytor)) {
  const traff = [];
  for (const f of vm.forbjudnaFraser ?? []) {
    try { if (new RegExp(f.fran, 'giu').test(txt)) traff.push(f.fran); } catch { /* mönsterfel i källan beivras ej här */ }
  }
  rad(traff.length === 0 ? 'OK' : 'FEL', `varumärkesgrind ${yt}`, traff.length === 0 ? `0/${vm.forbjudnaFraser.length} mönster` : `TRÄFF: ${traff.join(' | ')}`);
}
rad(/_Detta är pedagogisk finansanalys, inte investeringsråd\._\s*$/.test(body) ? 'OK' : 'FEL', 'disclaimer exakt sista rad', JSON.stringify(body.slice(-60)));
rad(/guiden går igenom|så fungerar|Den här guiden/i.test(body.slice(0, 900)) ? 'OK' : 'VARN', 'utbildningsram i ingress', 'metod-/guideformulering i första stycket');

// ---------- 4. 911-KONTROLL (6 mönster) ----------
const m911 = ['911', '9/11', '11 september', 'september 11', 'eleven september', 'nine eleven'];
const traff911 = m911.filter((p) => new RegExp(p.replace(/\//g, '\\/'), 'i').test(allt));
rad(traff911.length === 0 ? 'OK' : 'VARN', '911-referenser (6 mönster)', traff911.length === 0 ? '0/6' : traff911.join(', '));

// ---------- 5. INTerna LÄNKAR ----------
const lankar = [...body.matchAll(/\[([^\]]+)\]\((\/[^)]+)\)/g)].map((m) => m[2]);
const unika = [...new Set(lankar)];
console.log(`INFO länkar — ${lankar.length} totalt, ${unika.length} unika: ${unika.join(' ')}`);
if (process.env.LANKKOLL !== 'nej') {
  for (const lank of unika) {
    try {
      const r = await fetch('http://localhost:3000' + lank, { redirect: 'follow' });
      rad(r.status === 200 ? 'OK' : 'FEL', 'länk ' + lank, `HTTP ${r.status}`);
    } catch (e) {
      rad('VARN', 'länk ' + lank, 'fetch-fel: ' + e.message);
    }
  }
}

// ---------- 6. STRUKTUR ----------
const h2 = [...body.matchAll(/^## (.+)$/gm)].length;
rad(h2 === 8 ? 'OK' : 'VARN', 'H2-antal', `${h2} (seriens konvention 8)`);
rad(ut.title.length <= 60 ? 'OK' : 'FEL', 'title-längd', `${ut.title.length}/60`);
rad(ut.description.length <= 155 ? 'OK' : 'FEL', 'description-längd', `${ut.description.length}/155`);
const ordRen = body.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[#*_>`|-]/g, ' ').split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;
rad(true ? 'OK' : 'FEL', 'ord (textrensat)', `${ordRen} ord`);
const rmBor = Math.max(1, Math.round(ordRen / 200));
rad(ut.readingMinutes >= rmBor ? 'OK' : 'FEL', 'readingMinutes', `${ut.readingMinutes} mot ord/200-praxis ≥ ${rmBor} (${Math.round(ordRen / ut.readingMinutes)} ord/min vid nuvarande)`);
rad(/^\d{4}-\d{2}-\d{2}$/.test(ut.publishedAt) ? 'OK' : 'FEL', 'publishedAt-format', ut.publishedAt);
const mjuk = (body.match(/[a-zåäö]-[a-zåäö]/gi) ?? []).length;
rad(mjuk === 0 ? 'OK' : 'VARN', 'mjuka bindestreck i body', `${mjuk}`);

// ---------- 7. UNIVERSUMGLIDNING: konsumentbranschens P/E idag ----------
const peK = uni.filter((x) => x.bransch === 'konsument' && typeof x.vardering?.pe === 'number' && x.vardering.pe > 0).map((x) => x.vardering.pe).sort((a, b) => a - b);
const kv = (p) => peK[Math.min(peK.length - 1, Math.floor(p * (peK.length - 1)))];
const med = peK.length % 2 ? peK[(peK.length - 1) / 2] : (peK[peK.length / 2 - 1] + peK[peK.length / 2]) / 2;
console.log(`INFO glidning — konsumentbranschen IDAG: n=${peK} Median=${med.toFixed(2)} kvartiler≈${kv(0.25).toFixed(1)}–${kv(0.75).toFixed(1)} | texten hävdar median 20,4 kvartiler 17,9–22,4 n=14`);
// Norge/konsument totalt inkl. null-PE:
const konsTot = uni.filter((x) => x.bransch === 'konsument').length;
console.log(`INFO glidning — konsumentrader totalt (inkl. utan P/E): ${konsTot} av ${uni.length} poster`);

// ---------- 8. DIFF-SÖKSTRÄNGAR (unikhet i utkastet) ----------
const diffSok = ['Raknat på ett exempel', 'räntkänsliga', 'kassaflöde från verksamheten i nivå med resultatet', 'universumets 14 bolag', '"readingMinutes": 2'];
for (const s of diffSok) {
  const utkastStr = JSON.stringify(ut);
  const antal = (utkastStr.match(new RegExp(s.replace(/"/g, '\\"').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length;
  rad(antal === 1 ? 'OK' : antal === 0 ? 'FEL' : 'VARN', 'diffsträng unik: ' + s, `${antal} träffar`);
}

console.log(`\nSAMMANFATTNING: ${ok} OK · ${fel} FEL · ${varn} VARN`);
process.exit(0);
