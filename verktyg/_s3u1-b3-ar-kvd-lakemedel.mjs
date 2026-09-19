#!/usr/bin/env node
// KVD AR3 — lakemedelsaktier-sa-analyserar-du-lakemedelsbolag-ar.json (arabisk översättning av B3)
// Konvention: AR1 (_s3u1-b1-ar-kvd-fastighet.mjs) / AR2 (_s3u3-b2-ar-kvd-bank.mjs) — klassens 18 kontroller.
import { readFileSync } from 'node:fs';

const AR = '/home/ak1a/AK1/data/blogg-utkast/lakemedelsaktier-sa-analyserar-du-lakemedelsbolag-ar.json';
const SV = '/home/ak1a/AK1/data/blogg-utkast/lakemedelsaktier-sa-analyserar-du-lakemedelsbolag.json';
const VM = '/home/ak1a/AK1/data/varumarke.json';

const ar = JSON.parse(readFileSync(AR, 'utf8'));
const sv = JSON.parse(readFileSync(SV, 'utf8'));
const vm = JSON.parse(readFileSync(VM, 'utf8'));

let ok = 0, fel = 0;
function chk(id, kond, detalj) {
  if (kond) { ok++; console.log(`OK   ${id} :: ${detalj}`); }
  else { fel++; console.log(`FEL  ${id} :: ${detalj}`); }
}
function not(id, text) { console.log(`NOT  ${id} :: ${text}`); }

const SOKORD = 'أسهم الأدوية';
const ytor = { title: ar.title, description: ar.description, body: ar.body };
const allText = ar.title + '\n' + ar.description + '\n' + ar.body;

// ---- 1. Varumärkesgrinden: grindens EGNA regexer ur data/varumarke.json × 3 ytor ----
let vmFel = 0, vmVarn = 0;
for (const yta in ytor) {
  for (const regel of vm.forbjudnaFraser) {
    let re; try { re = new RegExp(regel.fran, 'gu'); } catch { re = new RegExp(regel.fran, 'g'); }
    if (re.test(ytor[yta])) {
      if (regel.allvar === 'FEL') { vmFel++; console.log(`  träff FEL ${yta}: ${regel.fran} (${regel.motiv})`); }
      else { vmVarn++; console.log(`  träff VARN ${yta}: ${regel.fran} (${regel.motiv})`); }
    }
  }
}
chk('1-varumarke', vmFel === 0, `varumärkesgrinden (grindens egna ${vm.forbjudnaFraser.length} regexer) × 3 ytor: ${vmFel} FEL, ${vmVarn} VARNING`);

// ---- 2–4. Rådverb SV + EN + AR = 0 (juridikgrinden, lagen 2007:528) ----
const radSv = [...allText.matchAll(/(?:^|[^\p{L}])(köp|sälj|sälja|rekommenderar|råder|aktietips)(?=[\s,.;:)_]|$)/giu)].map(m => m[1]);
chk('2-radverb-SV', radSv.length === 0, `svenska rådgivningsglossor: ${radSv.length} ${JSON.stringify(radSv)}`);
const radEn = [...allText.matchAll(/(?:^|[^\p{L}])(?:you should (?:buy|sell)|we recommend|our top pick|buy now|sell now)(?=[\s,.;:)_]|$)/giu)].length;
chk('3-radverb-EN', radEn === 0, `engelska rådgivningsfraser: ${radEn}`);
const radAr = [...allText.matchAll(/اشترِ|اشتروا|بِع|بيعوا|استثمر في هذا|أنصحك|نصيحة اشتروا|نوصي بشراء|نوصي بالشراء|نصيحة شراء/gu)].length;
chk('4-radverb-AR', radAr === 0, `arabiska rådgivningsmönster (AR2-konventionen): ${radAr}`);

// ---- 5–7. Sökord i title + ingress + ≥2 H2 ----
chk('5-sokord-title', ar.title.includes(SOKORD), `title innehåller "${SOKORD}"`);
const ingress = ar.body.split('\n\n')[0];
chk('6-sokord-ingress', ingress.includes(SOKORD), `ingressen innehåller sökordet`);
const h2rader = [...ar.body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
const h2med = h2rader.filter(h => h.includes(SOKORD));
chk('7-sokord-H2', h2med.length >= 2, `sökordet i ${h2med.length} H2 (krav ≥2): ${JSON.stringify(h2med)}`);

// ---- 8–9. Title ≤ 60, OG ≤ 155 ----
chk('8-title-langd', ar.title.length <= 60, `title ${ar.title.length}/60 tkn`);
chk('9-og-langd', ar.description.length <= 155, `OG-description ${ar.description.length}/155 tkn`);

// ---- 10–11. Ord + readingMinutes ----
const ord = ar.body.trim().split(/\s+/).length;
chk('10-ord', ord >= 800 && ord <= 1400, `body ${ord} ord (mål 800–1400; originalet B3 ${sv.body.trim().split(/\s+/).length})`);
chk('11-readingMinutes', ar.readingMinutes === Math.round(ord / 600), `readingMinutes ${ar.readingMinutes} = round(${ord}/600) = ${Math.round(ord / 600)}`);

// ---- 12. Korslänkar MULTISET-identiska med B3 ----
const lnk = t => [...t.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]).sort();
const lsv = lnk(sv.body), lar = lnk(ar.body);
chk('12-korslankar', JSON.stringify(lsv) === JSON.stringify(lar), `korslänkar ${lar.length} st multiset-identiska med B3 (${lsv.length})`);

// ---- 13. Externa URL:er identiska ----
const ext = t => [...t.matchAll(/\((https:\/\/[^)]+)\)/g)].map(m => m[1]).sort();
chk('13-externa-url', JSON.stringify(ext(sv.body)) === JSON.stringify(ext(ar.body)), `externa källor ${ext(ar.body).length} st URL-identiska: ${ext(ar.body).join(', ')}`);

// ---- 14. H2-antal == originalets ----
const h2sv = [...sv.body.matchAll(/^## /gm)].length;
chk('14-h2-paritet', h2rader.length === h2sv, `H2 ${h2rader.length} == originalets ${h2sv}`);

// ---- 15. Talparitet: multiset med normalisering + ord-tal-mappning + vitlista ----
// Normalisering: SV "1 200"/"0,7" == AR "1,200"/"0.7" (tusentelsmellanslag respektive komma → inget; decimalkomma → punkt).
// Ord-tal mappas symmetriskt (B3 skriver åtta/tolv/sex/tio som ord; AR3 skriver عشرة som ord).
// OBS kontrollbugg fixad: SV 'en'/'ett' är primärt obestämd artikel (29 träffar i B3, varav 2 räkneord) —
// därför mappas FRASERNA 'en av'/'ett av' ↔ 'واحد من كل' (AR2-precedensens klass: vitlistad tolerans med motiv), och
// AR:s efterställda räkneordskonstruktioner (جزيء واحد، دواء واحد، واحدة) lämnas omapdade — de är AR:s sätt att
// skriva SV:s artikel-"en/ett" (obestämdhet), inte matematiska tal.
const SV_ORDTAL = { 'tio': 10, 'tjugo': 20, 'sex': 6, 'åtta': 8, 'tolv': 12, 'hundra': 100 };
const SV_FRASER = { 'en av': 1, 'ett av': 1 };
const AR_ORDTAL = { 'عشرة': 10, 'عشر': 10, 'عشرين': 20, 'ستة': 6, 'ثمانية': 8, 'مئة': 100 };
const AR_FRASER = { 'واحد من كل': 1 };
// Vitlista (kvalitativa pluralformer utan exakt talvärde — bägge språk strippas, AR2/Ö13-precedensens klass):
const SV_VITLISTA = ['tiotals', 'tusentals', 'hundratals'];
const AR_VITLISTA = ['عشرات', 'آلاف', 'مئات'];
function tokenisera(text, ordtal, fraser, vitlista) {
  let t = text;
  for (const v of vitlista) t = t.replace(new RegExp(v, 'gu'), ' ');
  // råa tal-token (mellanslag strippas: SV "1 200" == AR "1,200" == 1200), sedan explicit normalisering
  const raa = [...t.matchAll(/\d[\d\s.,]*\d|\d/gu)].map(m => m[0].replace(/\s/g, ''));
  const normaliserade = raa.map(s => {
    // "1 200"→1200 redan via \s-strip; "1,200"→1200 (tusentalskomma, exakt 3 decimaler); "0.7"/"0,7"→0.7
    if (/^\d{1,3}(,\d{3})+$/.test(s)) return s.replace(/,/g, '');
    if (/^\d+,\d+$/.test(s)) return s.replace(',', '.');
    return s;
  });
  const extra = [];
  for (const [w, n] of Object.entries({ ...ordtal, ...fraser })) {
    const antal = [...t.matchAll(new RegExp(`(?:^|[^\\p{L}])${w}(?=[^\\p{L}]|$)`, 'giu'))].length;
    for (let i = 0; i < antal; i++) extra.push(String(n));
  }
  return [...normaliserade, ...extra].sort((a, b) => Number(a) - Number(b)).map(Number);
}
const tsv = tokenisera(sv.body, SV_ORDTAL, SV_FRASER, SV_VITLISTA);
const tar = tokenisera(ar.body, AR_ORDTAL, AR_FRASER, AR_VITLISTA);
const multisetEq = JSON.stringify(tsv) === JSON.stringify(tar);
let diffText = '';
if (!multisetEq) {
  const rakna = (arr) => arr.reduce((m, x) => (m[x] = (m[x] || 0) + 1, m), {});
  const msv = rakna(tsv), mar = rakna(tar);
  const endastSv = Object.keys(msv).filter(k => (msv[k] || 0) > (mar[k] || 0)).map(k => `${k}×${msv[k] - (mar[k] || 0)}`);
  const endastAr = Object.keys(mar).filter(k => (mar[k] || 0) > (msv[k] || 0)).map(k => `${k}×${mar[k] - (msv[k] || 0)}`);
  diffText = ` — endast-SV: [${endastSv.join(', ')}]; endast-AR: [${endastAr.join(', ')}]; SV=${JSON.stringify(tsv)}; AR=${JSON.stringify(tar)}`;
}
chk('15-talparitet', multisetEq, `talparitet multiset: SV ${tsv.length} token (siffror+ordtal) == AR ${tar.length} token${diffText}`);

// ---- 16. Aritmetik motorräknad (guidens tre räkneexempel + kalender) ----
chk('16a-runway', 1200 / 100 === 12, `1,200 ÷ 100 = ${1200 / 100} kvartal (runway)`);
chk('16b-rapv', 20 * 0.7 === 14, `20 × 0.7 = ${20 * 0.7} miljarder (riskjusterat värde)`);
chk('16c-patent', (2034 - 2020 === 14) && (20 - 14 === 6), `2034 − 2020 = ${2034 - 2020}; 20 − 14 = ${20 - 14} år kvar`);
chk('16d-spann', 15 < 25, `R&D-spann 15–25 procent`);

// ---- 17. Disclaimer exakt sista rad (AR-form, AR1/AR2-konventionen) ----
const disclaimer = '_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._';
chk('17-disclaimer', ar.body.trim().endsWith(disclaimer), `sista raden = arabisk disclaimer exakt`);

// ---- 18. Svenska läckor 0 (URL-slugar strippade; egennamn bär inga å/ä/ö) ----
const bodyStrip = ar.body.replace(/\([^)]*https?:\/\/[^)]*\)/gu, '').replace(/https?:\/\/\S+/gu, '');
const svenskaLackor = [...bodyStrip.matchAll(/[åäöÅÄÖ]/gu)].length;
chk('18-svenska-lackor', svenskaLackor === 0, `svenska tecken (å/ä/ö) efter URL-strip: ${svenskaLackor}`);

// ---- Notiser ----
not('N1', `H2-struktur: ${JSON.stringify(h2rader)}`);
not('N2', `publishedAt ${ar.publishedAt} = skapandedagen (serieskonvention); publicering = kundens R2 (granskningskön)`);
not('N3', `latinska termer kvar enligt AR1-konventionen (NAV/FFO-klassen): pipeline, runway, Phase I, P/E, EMA, FDA, patent cliff, V13 + egennamn AstraZeneca/Novo Nordisk/Getinge/Elekta/AK1A/BIO/PRV — engelska/latinska termer är tillåtna, svenska läckor kontrolleras i punkt 18`);
not('N4', `romerska fasbeteckningar I/II/III exkluderade ur talpariteten (inte \d-token i något språk); ord-tal mappade symmetriskt enligt punkt 15`);

console.log(`\n== KVD AR3: ${ok} OK, ${fel} FEL ==`);
process.exit(fel === 0 ? 0 : 1);
