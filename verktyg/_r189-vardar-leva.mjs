#!/usr/bin/env node
// _r189-vardar-leva.mjs — AR28 vård-ar leverans: AR28-rad + notis + klaim-KLAR + worklog + commit + push + minne
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const GUIDE = 'data/blogg-utkast/vardaktier-sa-analyserar-du-vardbolag-ar.json';

const kvitto = [];
const steg = (namn, ok, extra = '') => {
  kvitto.push(`${ok ? 'OK ' : 'FEL'} ${namn}${extra ? ' — ' + extra : ''}`);
  fs.writeFileSync('/tmp/r190-kvitto.txt', kvitto.join('\n') + '\n');
  if (!ok) { console.error('AVBRYTER vid: ' + namn); process.exit(1); }
};
const sha = (p) => createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0, 16);
const git = (args, cwd = ROT) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

// 1. AR28-rad efter AR27-raden
const seoP = `${ROT}/data/forskning/SEO-GUIDER-2026-09.md`;
const seo = fs.readFileSync(seoP, 'utf8').split('\n');
const ar27 = seo.findIndex((l) => l.startsWith('| AR27 |'));
if (ar27 < 0) steg('1 AR28-rad', false, 'AR27-raden hittades ej');
if (seo.some((l) => l.startsWith('| AR28 |'))) steg('1 AR28-rad', false, 'AR28-rad finns redan');
seo.splice(ar27 + 1, 0,
`| AR28 | vardaktier-sa-analyserar-du-vardbolag-ar | أسهم الرعاية الصحية | 1245 | UTKAST v1 (2026-09-25, studio-sessionen rond 190, v171 SEO-vågen; klaimfil data/vakten/s3-ar28-vard-ar-ansprak-2026-09-25.md skriven FÖRE arbetet, disk-först — BÅDA träden inventerade enligt rond 188:s läxa: vård-ar saknades i workspace OCH i prod-trädets untracked; AR-nummer i leveransordning: energi AR24 + material AR25 + skog AR26 + medtech AR27 ⇒ vård-ar = AR28; 0 klaimer ⇒ ingen race) — arabisk översättning av B25 (originalet 2026-09-22, 1190 ord; AR27 som färsk strukturreferens); samma tal och räkneexempel som originalet (marginaltrappan Genmab 93.0 → Eli Lilly 83.4 → Novo Nordisk 82.0 → medtech-zonen 67–74 med Sonova 73.7 och CellaVision 68.7 → Getinge 48.6 → driftsplattan Attendo 36.9 / Fresenius 25.4 / Galenica 12.5, med Roche-kontrasten 74.2 mot 12.5 = 61.7 pp och trappspannet 80.5 > 80; per-anställd-räkningen 18,991 Mkr / 33,000 anställda ≈ 575,000 kr med originalets golavrundning; IFRS 16-blocket: skuldsättningsgrad 3.15, räntetäckning 2.5, skuld/EBITDA 5.28, EBITDA-marginal 7.50 < EBIT 10.34, FCF 14.3 mot netto 5.1, ROE 18.7 mot ROIC 7.57 − WACC 6.88 = 0.69 pp; Attendo-serien netto −45 → 813 på omsättning 14,496 → 18,991 = 9.4 %/år med 2023 års 19.3 % och aktien +87.4 % på 52 veckor; Fresenius-fallet 40,840 → 22,299 M€ = −45.4 % med resultatvändningen −594 → +1,264; Galenica-motpolen beta 0.28, direktavkastning 3.06 på utdelningskvot 78.7; multipeltrappan P/E 16.26/19.25/25.68 och EV/EBIT 14.55/17/24.55 med Galenica-paradoxen ROIC 6.82, forward 16.05 mot trailing 19.25, PEG 0.79/0.97/1.01, FCF-yield 15.0, ägaravkastning 4.25 + 1.47 = 5.7; femårsmedlet 33.4 med spread 4.8 pp; FCF-serien 1,165 → 2,657 = 2.28×; lagparen 2016:1145 och 2008:962) — utskrivna tal symmetriskt utskrivna (åttio ↔ ثمانين-klassen); KVD GRÖN 0 FEL i 16 maskinella kontroller (verktyg/_r189-ar28-kvd.mjs): varumärkesgrind × 3 ytor 0/0 · rådverb SV+EN+AR 0 · sökord "أسهم الرعاية الصحية" i title+ingress+3 H2 · title 54/60 · OG 137/155 · ord 1245/1000–1400 · korslänkar 19/19 MULTISET-identiska · externa 5/5 (fresenius + attendo + galenica + ivo.se + riksdagen.se) · H2-paritet 6=6 · H1 0=0 · TAL-PARITET 109/109 språkmedveten multiset i FÖRSTA körningen (SV mellanslagstusental/decimalkomma == AR tusentelskomma/punkt; körningens enda röda var S&P-tokenet = vitlistelucka i KONTROLLEN, kurerad med motiv, guidetexten orörd — AR9/AR15-klassen) · aritmetik 14/14 motorräknad · readingMinutes 2 = round(1245/600) · läckor 0 (30 latinska token, alla vitlistade enligt AR6/AR7-konventionen) · disclaimer arabisk exakt sista rad · publishedAt = leveransdagen 2026-09-25 (AR1/AR26-konventionen, bevisad i rond 188) | data/blogg-utkast/vardaktier-sa-analyserar-du-vardbolag-ar.json |`);
fs.writeFileSync(seoP, seo.join('\n'));
steg('1 AR28-rad bokförd', true, `efter AR27 (rad ${ar27 + 1})`);

// 2. Kvarvarande-notisen uppdateras
const seoTxt = fs.readFileSync(seoP, 'utf8');
const före = 'vård-ar (B25) och bygg-ar (B27) — medtech-ar LEVERERAD som AR27\n2026-09-24 (se AR-tabellen) — därefter B26-notens lista över';
const efter = 'bygg-ar (B27) — medtech-ar AR27 (2026-09-24) och vård-ar AR28 (2026-09-25)\nLEVERERADE (se AR-tabellen) — därefter B26-notens lista över';
if (!seoTxt.includes(före)) steg('2 notis', false, 'notistexten hittades ej');
fs.writeFileSync(seoP, seoTxt.replace(före, efter));
steg('2 kvarvarande-notis', true, 'bygg-ar ensam kvar i -ar-spåret');

// 3. Klaimfil → KLAR
const klaimP = `${ROT}/data/vakten/s3-ar28-vard-ar-ansprak-2026-09-25.md`;
let klaim = fs.readFileSync(klaimP, 'utf8');
klaim = klaim.replace('- **Status:** PÅGÅR', '- **Status:** KLAR — KVD GRÖN 0 FEL i 16 kontroller, talparitet 109/109 i första körningen');
fs.writeFileSync(klaimP, klaim);
steg('3 klaim KLAR', true);

// 4. Worklog rond 190
const nyRond = `## ROND 190 [organ:Φ] — AR28 VÅRD-AR LEVERERAD med KVD GRÖN 16/16 (talparitet 109/109 i första körningen) — 2026-09-25 ~0x:5x lokal
v171 SEO-spåret fortsatt: vård-ar (B25:s arabiska spegling) = AR28 i leveransordning. KLAIM disk-först (data/vakten/s3-ar28-vard-ar-ansprak-2026-09-25.md) med ROND 188:S LÄXA TILLÄMPAD: BÅDA träden inventerade FÖRE valet (workspace + prod-trädets untracked — vård-ar saknades överallt, 0 klaimer, ingen race; kollisionsklassen från AR27 omöjliggjord från start). LEVERANS: data/blogg-utkast/vardaktier-sa-analyserar-du-vardbolag-ar.json — samma tal och räkneexempel som originalet B25 (1190 ord): marginaltrappan Genmab 93.0 → driftsplattan 12.5 med Roche-kontrasten 61.7 pp, per-anställd-räkningen 575,000 kr, hela IFRS 16-blocket (3.15 / 2.5 / 5.28 / 7.50 < 10.34 / 14.3 mot 5.1 / ROIC−WACC 0.69 pp), Attendo-serien (−45 → 813, 9.4 %/år, +87.4 % på 52 v), Fresenius-fallet (−45.4 % med vändningen −594 → +1,264), multipeltrappan med Galenica-paradoxen, lagparen 2016:1145 + 2008:962 — utskrivna tal symmetriska (åttio ↔ ثمانين). KVD GRÖN 0 FEL i 16 kontroller (verktyg/_r189-ar28-kvd.mjs): TAL-PARITET 109/109 språkmedveten multiset I FÖRSTA KÖRNINGEN · aritmetik 14/14 motorräknad · korslänkar 19/19 MULTISET · externa 5/5 · H2 6=6 · H1 0=0 · ord 1245 (originalet 1190) · sökord title+ingress+3 H2 · läckor 0 (30 token vitlistade) · disclaimer arabisk sista rad · publishedAt 2026-09-25 = leveransdagen (AR1/AR26-konventionen). Körningens enda röda var S&P-tokenet = vitlistelucka i KONTROLLEN (token-klassen fångar "&" i källetiketten S&P) — kurerad i kontrollen med motiv, guidetexten orörd (AR9/AR15-klassen). DOKUMENTATION: AR28-rad + kvarvarande-notis (bygg-ar B27 ensam kvar i -ar-spåret — därmed är HELA branschguide-familjen speglad i tre språk när bygg-ar landar). Ren dataleverans — src orörd, inget bygge. NÄSTA: bygg-ar (B27) = sista -ar-luckan, därefter v172 kvartalsrapporter (Q3 slutar 09-30) enligt PIPELINE-KO.`;
fs.appendFileSync(`${ROT}/worklog.md`, '\n' + nyRond + '\n');
steg('4 worklog', true);

// 5. Commit
const msg = `studio: [organ:Φ] v171 AR28 vård-ar LEVERERAD — KVD GRÖN 16/16 (talparitet 109/109 i FÖRSTA körningen, aritmetik 14/14, korslänkar 19/19 MULTISET, externa 5/5). Arabisk spegling av B25 med exakt talbas (marginaltrappan 93.0→12.5, IFRS 16-blocket, Attendo/Fresenius-vändningarna, multipeltrappan, lagparen 2016:1145 + 2008:962); utskrivna tal symmetriska (åttio ↔ ثمانين); publishedAt = leveransdagen 2026-09-25 (AR1/AR26-konventionen). Klaim disk-först med rond 188:s läxa tillämpad: BÅDA träden inventerade, ingen race. Kvar i -ar-spåret: endast bygg-ar (B27). Ren dataleverans — src orörd, inget bygge.`;
fs.writeFileSync('/tmp/r190-msg.txt', msg);
const filer = [GUIDE, 'data/forskning/SEO-GUIDER-2026-09.md', 'verktyg/_r189-vardar-sondra.mjs', 'verktyg/_r189-vardar-bygg.mjs', 'verktyg/_r189-ar28-kvd.mjs', 'verktyg/_r189-vardar-leva.mjs', 'worklog.md'];
git(['add', ...filer]);
steg('5 git add', true, `${filer.length} filer`);
try {
  const ut = git(['commit', '-F', '/tmp/r190-msg.txt']);
  steg('6 commit (tsc-grinden)', true, ut.split('\n').find((l) => l.startsWith('[')) || '');
} catch (e) { steg('6 commit (tsc-grinden)', false, String(e.stdout || e.message).slice(0, 400)); }
const hash = git(['rev-parse', '--short', 'HEAD']);
steg('7 HEAD', true, hash);

// 8. Prod-renhetskontroll FÖRE push (rond 188:s mönster: tracked-mod = adoptera först)
const status = git(['status', '--porcelain'], PROD);
const trackedMod = status.split('\n').filter((l) => /^ ?M/.test(l));
if (trackedMod.length > 0) {
  steg('8 prod-renhet', false, `tracked-modifierade: ${trackedMod.join(' | ')} — ADOPTERA FÖRST (rond 188-mönstret)`);
}
steg('8 prod-renhet', true, `${status.split('\n').filter((l) => l.trim()).length} untracked-spår (avris), 0 tracked-mod`);
try {
  const push = git(['push', 'prod', 'develop']);
  steg('9 push prod develop', true, push.split('\n').filter((l) => l.includes('->') || l.includes('|')).join(' | ').slice(0, 160));
} catch (e) { steg('9 push prod develop', false, String(e.stdout || e.message).slice(0, 500)); }

// 10. Verifikation + beslutsminne
const prodHead = git(['rev-parse', '--short', 'HEAD'], PROD);
steg('10a prod HEAD ≡ push', prodHead === hash, prodHead);
steg('10b guiden bitidentisk i prod', sha(`${ROT}/${GUIDE}`) === sha(`${PROD}/${GUIDE}`), `sha ${sha(`${PROD}/${GUIDE}`)}`);
const seoProd = fs.readFileSync(`${PROD}/data/forskning/SEO-GUIDER-2026-09.md`, 'utf8');
steg('10c AR28-rad i prod', seoProd.includes('| AR28 | vardaktier-sa-analyserar-du-vardbolag-ar'));
let sajt = 'n/a';
try { const svar = await fetch('https://lab.ak1nvestor.com/', { method: 'HEAD', signal: AbortSignal.timeout(15000) }); sajt = svar.status; } catch { try { const l = await fetch('http://localhost:3000/', { method: 'HEAD', signal: AbortSignal.timeout(8000) }); sajt = l.status; } catch { sajt = 'fel'; } }
steg('10d sajten', sajt === 200, String(sajt));
fs.appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, JSON.stringify({ ts: new Date().toISOString(), rond: 190, beslut: 'AR28 vård-ar levererad KVD GRÖN 16/16 (talparitet 109/109 första körningen); klaim med båda-träd-inventering (rond 188-läxan); endast bygg-ar kvar i -ar-spåret', landat: hash }) + '\n');
steg('11 beslutsminne', true);

console.log(kvitto.join('\n'));
