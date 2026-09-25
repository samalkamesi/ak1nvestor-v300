#!/usr/bin/env node
// _r191-byggar-leva.mjs — AR29 bygg-ar leverans (SISTA -ar-luckan): rad + stängningsnotis + klaim + worklog + commit + push + minne
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const GUIDE = 'data/blogg-utkast/byggaktier-sa-analyserar-du-byggbolag-ar.json';

const kvitto = [];
const steg = (namn, ok, extra = '') => {
  kvitto.push(`${ok ? 'OK ' : 'FEL'} ${namn}${extra ? ' — ' + extra : ''}`);
  fs.writeFileSync('/tmp/r191-kvitto.txt', kvitto.join('\n') + '\n');
  if (!ok) { console.error('AVBRYTER vid: ' + namn); process.exit(1); }
};
const sha = (p) => createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0, 16);
const git = (args, cwd = ROT) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

// 1. AR29-rad efter AR28-raden
const seoP = `${ROT}/data/forskning/SEO-GUIDER-2026-09.md`;
const seo = fs.readFileSync(seoP, 'utf8').split('\n');
const ar28 = seo.findIndex((l) => l.startsWith('| AR28 |'));
if (ar28 < 0) steg('1 AR29-rad', false, 'AR28-raden hittades ej');
if (seo.some((l) => l.startsWith('| AR29 |'))) steg('1 AR29-rad', false, 'AR29-rad finns redan');
seo.splice(ar28 + 1, 0,
`| AR29 | byggaktier-sa-analyserar-du-byggbolag-ar | أسهم البناء | 1153 | UTKAST v1 (2026-09-25, studio-sessionen rond 191, v171 SEO-vågen; klaimfil data/vakten/s3-ar29-bygg-ar-ansprak-2026-09-25.md skriven FÖRE arbetet, disk-först — BÅDA träden inventerade enligt rond 188:s läxa: bygg-ar saknades i workspace OCH prod-trädet; -ar-spårets SISTA lucka: AR24 energi + AR25 material + AR26 skog + AR27 medtech + AR28 vård ⇒ bygg-ar = AR29) — arabisk översättning av B27 (originalet 2026-09-22, 1155 ord; AR28 som färsk strukturreferens); samma tal och räkneexempel som originalet (orderstockstäckningen Skanska 257.9 mot omsättning 176.7 = 1.46 års produktion, NCC 54.4/55.7 ≈ exakt ett år; orderingången Skanska 179.5 mot 207.9 = −13.7 % medan Veidekke 41.0 → 47.3 NOK = +15.4 % — samma bransch, två cykellägen; fastpristrappan ur km-069:s pedagogiska exempel: kontrakt 1,000 / kostnad 900 / marginal 100 = 10.0 % → 8 % inflation utan prisskrivning: 972/28 = 2.8 % → 12 %: 1,008/salabt 8 = −0.8 % → 50 % prisskrivning: pris 1,036 / marginal 64 = 6.4 %; IFRS 15-broexemplet: 0.60 × 800 = intäkt 480 med vinst 36 = 7.5 % mot kassa +60 i förskott — vinst och kassa två kurvor; Skanska-serien 163,174 → 176,658 = +8.3 % intäkt mot resultatet 8,256 → 5,702 = −30.9 %, nettomarginal 3.2 %; TTM-bilden 2026-09-15: EBIT 3.9 / brutto 8.9 / ROE 11.1 / ROIC 9.1 / skuld-EK 0.25; NCC 55.7 = −9.6 % mot 61.6 med rörelsen 1,938 = 3.5 %; Veidekke-helåret 4.8 %; värderingsblocket P/E 16.4 · EV/EBIT 13.8 · P/B 1.76 · FCF-yield 7.8 · prognos +10.9; checklistans sex frågor) — utskrivna tal symmetriska (två-till-tre ↔ سنتين إلى ثلاث, ett år ↔ عام واحد, sex ↔ ستة); KVD GRÖN 0 FEL i 16 maskinella kontroller (verktyg/_r191-ar29-kvd.mjs, AR28-mallens struktur): varumärkesgrind × 3 ytor 0/0 · rådverb SV+EN+AR 0 · sökord "أسهم البناء" i title+ingress+2 H2 · title 45/60 · OG 125/155 · ord 1153 (originalet 1155) · korslänkar 11/11 MULTISET-identiska · externa 3/3 (skanska + ncc + veidekke) · H2-paritet 7=7 · H1 0=0 · TAL-PARITET 86/86 språkmedveten multiset (SV mellanslagstusental/decimalkomma == AR tusentelskomma/punkt; körningens enda röda var kvartalsetiketten Q4 2025 = formatkod ej innehållstal, strippad SYMMETRISKT i kontrollen med motiv — AR5/AR12-precedensens klass, AR29 skriver ut الربع الرابع) · aritmetik 15/15 motorräknad · readingMinutes 2 = round(1153/600) · läckor 0 (16 latinska token vitlistade) · disclaimer arabisk exakt sista rad · publishedAt = leveransdagen 2026-09-25 | data/blogg-utkast/byggaktier-sa-analyserar-du-byggbolag-ar.json |`);
fs.writeFileSync(seoP, seo.join('\n'));
steg('1 AR29-rad bokförd', true, `efter AR28 (rad ${ar28 + 1})`);

// 2. Stängningsnotis: -ar-omgången KLAR
const seoTxt = fs.readFileSync(seoP, 'utf8');
const före = 'bygg-ar (B27) — medtech-ar AR27 (2026-09-24) och vård-ar AR28 (2026-09-25)\nLEVERERADE (se AR-tabellen) — därefter B26-notens lista över';
const efter = '-AR-OMGÅNGEN KLAR: AR1–AR29 — samtliga 29 original (B1–B27 + energi +\nmaterial) speglade i alla tre språken (bygg-ar AR29 2026-09-25; medtech AR27 +\nvård AR28 2026-09-24/25) — därefter B26-notens lista över';
if (!seoTxt.includes(före)) steg('2 stängningsnotis', false, 'notistexten hittades ej');
fs.writeFileSync(seoP, seoTxt.replace(före, efter));
steg('2 stängningsnotis', true, '-ar-omgången KLAR: 29 original × 3 språk');

// 3. Klaim → KLAR
const klaimP = `${ROT}/data/vakten/s3-ar29-bygg-ar-ansprak-2026-09-25.md`;
let klaim = fs.readFileSync(klaimP, 'utf8');
klaim = klaim.replace('- **Status:** PÅGÅR', '- **Status:** KLAR — KVD GRÖN 0 FEL i 16 kontroller, talparitet 86/86, -ar-spårets sista lucka stängd');
fs.writeFileSync(klaimP, klaim);
steg('3 klaim KLAR', true);

// 4. Worklog rond 191
const nyRond = `## ROND 191 [organ:Φ] — AR29 BYGG-AR LEVERERAD med KVD GRÖN 16/16 — -AR-OMGÅNGEN KLAR: 29 ORIGINAL × 3 SPRÅK — 2026-09-25 ~01:3x lokal
v171 SEO-spårets SISTA -ar-lucka stängd: bygg-ar (B27:s arabiska spegling) = AR29 i leveransordning. KLAIM disk-först med rond 188:s läxa tillämpad (BÅDA träden inventerade FÖRE valet: bygg-ar saknades i workspace + prod, 0 klaimer, ingen race). LEVERANS: data/blogg-utkast/byggaktier-sa-analyserar-du-byggbolag-ar.json — samma tal och räkneexempel som originalet B27 (1155 ord): orderstockstäckningen 257.9/176.7 = 1.46 år med NCC:s 54.4/55.7 ≈ ett år, orderingångsbron Skanska −13.7 % mot Veidekke +15.4 %, hela fastpristrappan (10.0 → 2.8 → −0.8 → 6.4 %), IFRS 15-broexemplet (480/36/7.5 % mot kassa +60), Skanska-serien +8.3 % intäkt mot −30.9 % resultat, TTM-blocket, checklistans sex frågor — utskrivna tal symmetriska (två-till-tre ↔ سنتين إلى ثلاث). KVD GRÖN 0 FEL i 16 kontroller (verktyg/_r191-ar29-kvd.mjs, AR28-mallens struktur): TAL-PARITET 86/86 · aritmetik 15/15 motorräknad · korslänkar 11/11 MULTISET · externa 3/3 · H2 7=7 · H1 0=0 · ord 1153 (originalet 1155) · läckor 0 · disclaimer arabisk sista rad · publishedAt 2026-09-25 = leveransdagen. Körningens enda röda var kvartalsetiketten Q4 2025 (formatkod ej innehållstal) — strippad SYMMETRISKT i kontrollen med motiv (AR5/AR12-precedensens klass; AR29 skriver ut الربع الرابع). Eget språkprov fångade TRE egna fel FÖR KVD (svenska "omsättningen" + engelska "against" + ett arabiskt stavfel i utkastet) — kurerade FÖRE första körningen, vaccinerad. STÄNGNINGSNOTIS i SEO-GUIDER: -AR-OMGÅNGEN KLAR — AR1–AR29, samtliga 29 original (B1–B27 + energi + material) speglade i alla tre språken; nya original (B28+) öppnar nya speglingsobjekt (B28-en/B28-ar = nästa öppna speglingsytor). Ren dataleverans — src orörd, inget bygge. NÄSTA enligt PIPELINE-KO: v172 kvartalsrapporter (Q3 2026 slutar 09-30 — ramverket), därefter v173 dataset-djup.`;
fs.appendFileSync(`${ROT}/worklog.md`, '\n' + nyRond + '\n');
steg('4 worklog', true);

// 5. Commit
const msg = `studio: [organ:Φ] v171 AR29 bygg-ar LEVERERAD — KVD GRÖN 16/16 (talparitet 86/86, aritmetik 15/15, korslänkar 11/11 MULTISET, externa 3/3). -AR-OMGÅNGEN KLAR: AR1–AR29 = samtliga 29 original (B1–B27 + energi + material) speglade i alla tre språken. Arabisk spegling av B27 med exakt talbas (orderstockstäckning 257.9/176.7 = 1.46 år, fastpristrappan 10.0→2.8→−0.8→6.4 %, IFRS 15-broexemplet 480/36/7.5 %, Skanska +8.3 %/−30.9 %); kvartalsetiketten Q4 strippad symmetriskt i kontrollen (AR5/AR12-klassen). Klaim disk-först, båda träden inventerade. Nya original (B28+) öppnar nya speglingsytor (B28-en/B28-ar). Ren dataleverans — src orörd, inget bygge.`;
fs.writeFileSync('/tmp/r191-msg.txt', msg);
const filer = [GUIDE, 'data/forskning/SEO-GUIDER-2026-09.md', 'verktyg/_r191-byggar-sondra.mjs', 'verktyg/_r191-byggar-bygg.mjs', 'verktyg/_r191-ar29-kvd.mjs', 'verktyg/_r191-byggar-leva.mjs', 'worklog.md'];
git(['add', ...filer]);
steg('5 git add', true, `${filer.length} filer`);
try {
  const ut = git(['commit', '-F', '/tmp/r191-msg.txt']);
  steg('6 commit (tsc-grinden)', true, ut.split('\n').find((l) => l.startsWith('[')) || '');
} catch (e) { steg('6 commit (tsc-grinden)', false, String(e.stdout || e.message).slice(0, 400)); }
const hash = git(['rev-parse', '--short', 'HEAD']);
steg('7 HEAD', true, hash);

// 8. Prod-renhet + push
const status = git(['status', '--porcelain'], PROD);
const trackedMod = status.split('\n').filter((l) => /^ ?M/.test(l));
if (trackedMod.length > 0) steg('8 prod-renhet', false, `tracked-modifierade: ${trackedMod.join(' | ')} — adoptera först (rond 188-mönstret)`);
steg('8 prod-renhet', true, '0 tracked-mod');
try {
  const push = git(['push', 'prod', 'develop']);
  steg('9 push prod develop', true, push.split('\n').filter((l) => l.includes('->') || l.includes('|')).join(' | ').slice(0, 160));
} catch (e) { steg('9 push prod develop', false, String(e.stdout || e.message).slice(0, 500)); }

// 10. Verifikation + beslutsminne
const prodHead = git(['rev-parse', '--short', 'HEAD'], PROD);
steg('10a prod HEAD ≡ push', prodHead === hash, prodHead);
steg('10b guiden bitidentisk i prod', sha(`${ROT}/${GUIDE}`) === sha(`${PROD}/${GUIDE}`), `sha ${sha(`${PROD}/${GUIDE}`)}`);
const seoProd = fs.readFileSync(`${PROD}/data/forskning/SEO-GUIDER-2026-09.md`, 'utf8');
steg('10c AR29-rad i prod', seoProd.includes('| AR29 | byggaktier-sa-analyserar-du-byggbolag-ar'));
steg('10d stängningsnotis i prod', seoProd.includes('-AR-OMGÅNGEN KLAR: AR1–AR29'));
let sajt = 'n/a';
try { const svar = await fetch('https://lab.ak1nvestor.com/', { method: 'HEAD', signal: AbortSignal.timeout(15000) }); sajt = svar.status; } catch { try { const l = await fetch('http://localhost:3000/', { method: 'HEAD', signal: AbortSignal.timeout(8000) }); sajt = l.status; } catch { sajt = 'fel'; } }
steg('10e sajten', sajt === 200, String(sajt));
fs.appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, JSON.stringify({ ts: new Date().toISOString(), rond: 191, beslut: 'AR29 bygg-ar levererad KVD GRÖN 16/16 (talparitet 86/86) — -AR-OMGÅNGEN KLAR: AR1–AR29, 29 original × 3 språk; nästa: v172 kvartalsrapporter', landat: hash }) + '\n');
steg('11 beslutsminne', true);

console.log(kvitto.join('\n'));
