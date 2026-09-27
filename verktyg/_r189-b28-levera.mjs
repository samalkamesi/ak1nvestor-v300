#!/usr/bin/env node
// _r189-b28-levera.mjs — B28 investmentbolag: syskonets PÅGÅR-arbete fullbordas
// (utökning +235 ord på verifierad talbas → KVD GRÖN → B28-rad → worklog → commit → push → verifikation → minne)
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const GUIDE = 'data/blogg-utkast/investmentbolag-sa-analyserar-du-investmentbolag.json';
const KVD = 'verktyg/_s3u1-b28-kvd-investmentbolag.mjs';
const UNDERLAG = 'verktyg/_s3u1-b28-underlag.mjs';

const kvitto = [];
const steg = (namn, ok, extra = '') => {
  kvitto.push(`${ok ? 'OK ' : 'FEL'} ${namn}${extra ? ' — ' + extra : ''}`);
  fs.writeFileSync('/tmp/r189-kvitto.txt', kvitto.join('\n') + '\n');
  if (!ok) { console.error('AVBRYTER vid: ' + namn); process.exit(1); }
};
const sha = (p) => createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0, 16);
const git = (args, cwd = ROT) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

// ── 1. Arkivera syskonets originalbytes ──
fs.mkdirSync(`${ROT}/data/vakten/arkiv`, { recursive: true });
fs.copyFileSync(`${PROD}/${GUIDE}`, `${ROT}/data/vakten/arkiv/s3u1-b28-investmentbolag-originalbytes-2026-09-24.json`);
fs.copyFileSync(`${PROD}/${KVD}`, `${ROT}/data/vakten/arkiv/s3u1-b28-kvd-originalbytes-2026-09-24.mjs`);
steg('1 arkiv', true, `sha ${sha(`${ROT}/data/vakten/arkiv/s3u1-b28-investmentbolag-originalbytes-2026-09-24.json`)}`);

// ── 2. Adoptera + utöka (fyra sektionsankare, endast pedagogik på befintlig talbas) ──
const gp = `${ROT}/${GUIDE}`;
let body = JSON.parse(fs.readFileSync(`${PROD}/${GUIDE}`, 'utf8')).body;
const A = `Mekanismen bakom hela guiden är att andelen handlas fritt på börsen. Kursen bestäms av vad köpare och säljare i varje ögonblick är beredda att betala — inte av en förvaltare som löser in andelar till substansvärdet, som i en öppen fond. Kursen kan därför hamna var som helst i förhållande till substansen, och det är exakt detta gap som familjens analysmetodik finns för att mäta och förstå.`;
const B = `Effekten på multipeln blir lika direkt som missvisande: dividerat med ett resultat som byter tecken mellan åren blir P/E-talet ett slumpmått — samma portfölj kan visa en låg multipel ett år och en negativ eller ofantligt hög nästa. Jämförelsen hör hemma på substansnivå, inte i resultatet.`;
const C = `Det ger en praktisk kontrollfråga vid läsningen av varje substansvärde: hur stor del av siffran kan du själv verifiera mot noteringar i realtid? En substans som till övervägande del bärs av noterade innehav kan prickas av löpande; en som vilar på antaganden om onoterade bolag kräver tilltro till förvaltarens värderingar — och ju mer tilltro som krävs, desto högre avkastning begär marknaden för att bära risken.`;
const D = `Därmed också guidens viktigaste varning: en rabatt är aldrig i sig själv ett tecken på felprisning. Kinneviks fyra förlustår var verkliga omvärderingar av innehaven, och rabatten kan lika gärna vara en rimlig prissättning av osäkerhet som ett överdrivet rädslapris. Analytikerjobbet är att skilja de två fallen åt — inte att jaga familjens lägsta kvot.`;
const insatser = [
  ['utan tvång att sälja i botten.\n\nFör dig som analytiker', `utan tvång att sälja i botten.\n\n${A}\n\nFör dig som analytiker`],
  ['i närheten av det. Lärdomen syns', `i närheten av det. ${B} Lärdomen syns`],
  ['desto större osäkerhet — och ofta också en större rabatt. Bolag med många', `desto större osäkerhet — och ofta också en större rabatt. ${C} Bolag med många`],
  ['substansens kvalitet, ägarstyrning och resultathistorik. Jämför gärna', `substansens kvalitet, ägarstyrning och resultathistorik. ${D} Jämför gärna`],
];
for (const [före, efter] of insatser) {
  if (!body.includes(före)) steg('2 utökning', false, `ankarsträng ej funnen: "${före.slice(0, 50)}…"`);
  body = body.replace(före, efter);
}
const guiden = JSON.parse(fs.readFileSync(`${PROD}/${GUIDE}`, 'utf8'));
guiden.body = body;
fs.writeFileSync(gp, JSON.stringify(guiden, null, 2) + '\n');
const ord = guiden.body.match(/\S+/g).length;
steg('2 guide fullbordad', ord >= 1150 && ord <= 1400, `${ord} ord (var 987, krav 1150–1400)`);

// ── 3. Adoptera KVD + underlag (oförändrade — relativa sökvägar funkar från arbetsytan) ──
fs.copyFileSync(`${PROD}/${KVD}`, `${ROT}/${KVD}`);
fs.copyFileSync(`${PROD}/${UNDERLAG}`, `${ROT}/${UNDERLAG}`);
steg('3 verktyg adopterade', true);

// ── 4. KVD GRÖN krav ──
let kvdUt = '';
try {
  kvdUt = execFileSync('node', [`verktyg/${KVD.split('/').pop()}`], { cwd: ROT, encoding: 'utf8', timeout: 120000, stdio: ['ignore', 'pipe', 'pipe'] });
} catch (e) { kvdUt = String(e.stdout || '') + '\n[exit ' + e.status + ']'; }
fs.writeFileSync('/tmp/r189-kvd.txt', kvdUt);
const domRad = (kvdUt.match(/DOM: .*/) || [])[0] || '(dom hittades ej)';
steg('4 KVD', /DOM: 0 FEL/.test(kvdUt), domRad);

// ── 5. B28-rad efter B27-rad ──
const seoP = `${ROT}/data/forskning/SEO-GUIDER-2026-09.md`;
const seo = fs.readFileSync(seoP, 'utf8').split('\n');
const b27 = seo.findIndex((l) => l.startsWith('| B27 |'));
if (b27 < 0) steg('5 B28-rad', false, 'B27-raden hittades ej');
seo.splice(b27 + 1, 0,
`| B28 | investmentbolag-sa-analyserar-du-investmentbolag | investmentbolag | ${ord} | UTKAST v1 (2026-09-24, s3-u1 byggare 1/3, manifest auto-s3-1790240107451, klaimfil data/vakten/s3-b28-investmentbolag-ansprak-2026-09-24.md skriven FÖRE arbetet 09:00:35Z, disk-först; PÅGÅR när fabriken kvotdog 13:10 — guiden 987 ord mot skriptets eget krav 1150–1400; FULLBORDAD, VERIFIERAD OCH BOKFÖRD av studio-sessionen rond 189: +${ord - 987} ord i fyra sektioner med pedagogisk fördjupning av redan verifierad talbas — inga nya tal, talpariteten orörd, syskonets originalbytes arkiverade i data/vakten/arkiv/) — nytt svenskt original enligt B23-precedensen (svensk uppdragstext ⇒ översättningsobjekt stås över); luckanalys: 0 "så analyserar du"-guide för familjen (begreppsposten begreppet-substansrabatt = BEGREPPSpost; bolagsanalyserna Investor/Industrivärden 2026 = analyser, inte branschguide); universumsbärning FYRA fulla poster (AB Industrivärden INDU-C.ST, Investor AB, Investment AB Latour, Kinnevik AB — rådata 2026-09-03); guidens tes: investmentbolagets räkenskaper speglar innehaven ⇒ degenererade driftsmått (Industrivärden brutto 100 %, EBIT 99,9, netto 99,3, P/E 3,7) blir meningslösa för prissättning ⇒ substansmetodiken som familjens eget verktyg: NAV per aktie, P/B som kärnkvot, trappan Kinnevik 0,598 (rabatt 40,2 % efter fyra förlustår −19,5/−4,8/−2,6/−3,3 mdr ≈ 30,3 sammanlagt) — Industrivärden 1,03 (handlat i nivå med substansen, ROE 32,3 % börsburen) — Investor 1,159 (premie ~16 %: kurs 410,75 mot substans ~354; substansen 355→367→397 under 2026 = +11,8 %) — Latour 3,128 (konsoliderar driftsbolag: omsättning 22,6→28,1 mdr 2022–2025 ≈ 7,6 %/år, P/E 20,5 = familjens enda driftsliknande multipel), spannet 3,13/0,60 > 5×, medianen 1,09; svängningsbeviset Industrivärden 2021 +26,6 → 2022 −14,0 mdr = över 40 mdr på ett år; checklistans fem steg (substansens noterade/onoterade andel, rabatt mot historik och median, balansräkning före resultaträkning, ägarstyrningen, kostnader och utdelning); KVD GRÖN 0 FEL i 14 maskinella kontroller (verktyg/_s3u1-b28-kvd-investmentbolag.mjs — syskonets skript OFÖRÄNDRAT adopterat, kört av studion mot den fullbordade guiden): varumärkesgrind 26 regexer × 3 ytor 0 FEL/0 VARN · rådverb SV 0 · sökord "investmentbolag" i H1+ingress+2 H2 · title 49/60 · OG 149/155 · ord ${ord} inom 1150–1400 · korslänkar 18 unika samtliga verifierade mot publicerade ytor (0 mot utkast) · aritmetik 9/9 motorräknad · talparitet 19/19 mot data/portfolj-system/bolagsunivers.json · readingMinutes 2 = round(${ord}/600) · disclaimer exakt sista rad · BlogPost-formen komplett | data/blogg-utkast/investmentbolag-sa-analyserar-du-investmentbolag.json |`);
fs.writeFileSync(seoP, seo.join('\n'));
steg('5 B28-rad bokförd', true, `efter B27 (rad ${b27 + 1})`);

// ── 6. Worklog rond 189 ──
const wlP = `${ROT}/worklog.md`;
const nyRond = `## ROND 189 [organ:Φ] — B28 INVESTMENTBOLAG: syskonets PÅGÅR-utkast FULLBORDAT, KVD GRÖN 0 FEL, B28-rad bokförd — 2026-09-25 ~0x:xx lokal
Rond 188:s B28-fynd löst till leverans: s3-u1:s claim (PÅGÅR, klaim 09:00:35Z FÖRE arbetet, disk-först) + guide + KVD-skript + underlagsverktyg satt ostageda i prod-trädet när fabriken kvotdog 13:10. PROBEN: syskonets eget KVD kört mot utkastet = 13 PASS · 1 FEL — ENDA felet ordantalet (987 < skriptets eget krav 1150–1400); länkar 18/18 verifierade mot publicerade ytor, aritmetik 9/9, talparitet 19/19 mot bolagsunivers.json — materialet kvalitetsgodkänt, ofullständigt till volymen. BESLUT: FULLBORDA (materialet starkt — fyra fulla universumposter, komplett metodik; avfärdning skulle kasta bevisat gott arbete). LEVERANS: guiden utökad +${ord - 987} ord i fyra sektioner (fond-mekaniken bakom gapet, multipelns slumpmässighet vid teckenvändande resultat, substansvärderets kontrollerbarhet, rabattens två fall) — ENDAST pedagogisk fördjupning av redan verifierad talbas: inga nya tal, inga nya länkar, talpariteten mekaniskt orörd. Syskonets KVD-skript OFÖRÄNDRAT adopterat och kört mot fullbordaden: DOM 0 FEL · 0 VARN. B28-rad bokförad efter B27 (SEO-GUIDER — branschomgångens tabell). Syskonets originalbytes + PÅGÅR-claim arkiverade (data/vakten/arkiv/ + prod-vaktens claim fick fullbordan-notis). Prod-avlåsning: de tre untracked-kopiorna borttagna FÖRST efter arkivering+commit; claim-filen (vakten) lämnad orörd som syskonets egen historia med tillagd notis. NÄSTA: vård-ar (B25) → bygg-ar (B27) → v172 kvartalsrapporter (Q3 slutar 09-30) enligt PIPELINE-KO. Ren dataleverans — src orörd, inget bygge.`;
fs.appendFileSync(wlP, '\n' + nyRond + '\n');
steg('6 worklog', true);

// ── 7. Fullbordan-notis i syskonets claim (prod:s vakten, lokal) ──
fs.appendFileSync(`${PROD}/data/vakten/s3-b28-investmentbolag-ansprak-2026-09-24.md`, `\n## FULLBORDAD AV STUDION (rond 189, 2026-09-25)\nGuiden utökad ${987}→${ord} ord (fyra sektioner, endast verifierad talbas), syskonets KVD-skript oförändrat adopterat och GRÖNT 0 FEL, B28-rad bokförd, allt committat av studio-sessionen. Originalbytes arkiverade i data/vakten/arkiv/. Klaimens plan steg 1–3 fullföljd; steg 4 (rad + commit) utförd av studion.\n`);
steg('7 claim-notis', true);

// ── 8. Commit → prod-avlåsning → push ──
const msg = `studio: [organ:Φ] v171 B28 investmentbolag LEVERERAD — s3-u1:s PÅGÅR-utkast (fabriken kvotdog innan klart) FULLBORDAT av studion: +${ord - 987} ord pedagogisk fördjupning på redan verifierad talbas (inga nya tal), syskonets KVD-skript OFÖRÄNDRAT adopterat och GRÖNT 0 FEL (varumärkesgrind 0/0, rådverb 0, korslänkar 18/18 mot publicerade ytor, aritmetik 9/9, talparitet 19/19 mot bolagsunivers.json, ord ${ord}/1150–1400). B28-rad bokförd efter B27 — branschomgångens första nya original sedan B27 (B23-precedensen: svensk uppdragstext ⇒ nytt original). Originalbytes arkiverade. Ren dataleverans — src orörd, inget bygge.`;
fs.writeFileSync('/tmp/r189-msg.txt', msg);
const filer = [GUIDE, KVD, UNDERLAG, 'data/forskning/SEO-GUIDER-2026-09.md', 'verktyg/_r189-b28-sondra.mjs', 'verktyg/_r189-b28-djup.mjs', 'verktyg/_r189-b28-dom.mjs', 'verktyg/_r189-b28-levera.mjs', 'worklog.md'];
git(['add', ...filer]);
steg('8 git add', true, `${filer.length} filer`);
try {
  const ut = git(['commit', '-F', '/tmp/r189-msg.txt']);
  steg('9 commit (tsc-grinden)', true, ut.split('\n').find((r) => r.startsWith('[')) || '');
} catch (e) { steg('9 commit (tsc-grinden)', false, String(e.stdout || e.message).slice(0, 400)); }
const hash = git(['rev-parse', '--short', 'HEAD']);
steg('10 HEAD', true, hash);

// prod-avlåsning: rm untracked-kopiorna (arkiverade + committade); claim-filen orörd
fs.rmSync(`${PROD}/${GUIDE}`);
fs.rmSync(`${PROD}/${KVD}`);
fs.rmSync(`${PROD}/${UNDERLAG}`);
const statusEfter = git(['status', '--porcelain'], PROD);
const blockerare = statusEfter.split('\n').filter((l) => /^ ?M/.test(l) || l.includes('investmentbolag'));
steg('11 prod avlåst', blockerare.length === 0, `${statusEfter.split('\n').filter((l) => l.trim()).length} övriga untracked-spår (avris, orörda)`);
try {
  const push = git(['push', 'prod', 'develop']);
  steg('12 push prod develop', true, push.split('\n').filter((r) => r.includes('->') || r.includes('|')).join(' | ').slice(0, 160));
} catch (e) { steg('12 push prod develop', false, String(e.stdout || e.message).slice(0, 500)); }

// ── 13. Verifikation + beslutsminne ──
const prodHead = git(['rev-parse', '--short', 'HEAD'], PROD);
steg('13a prod HEAD ≡ push', prodHead === hash, prodHead);
const spårad = git(['ls-files', '--error-unmatch', GUIDE], PROD);
steg('13b guiden spårad i prod', spårad === GUIDE);
steg('13c guiden bitidentisk', sha(gp) === sha(`${PROD}/${GUIDE}`), `sha ${sha(`${PROD}/${GUIDE}`)}`);
const seoProd = fs.readFileSync(`${PROD}/data/forskning/SEO-GUIDER-2026-09.md`, 'utf8');
steg('13d B28-rad i prod', seoProd.includes('| B28 | investmentbolag-sa-analyserar-du-investmentbolag'));
let sajt = 'n/a';
try { const svar = await fetch('https://lab.ak1nvestor.com/', { method: 'HEAD', signal: AbortSignal.timeout(15000) }); sajt = svar.status; } catch { try { const l = await fetch('http://localhost:3000/', { method: 'HEAD', signal: AbortSignal.timeout(8000) }); sajt = l.status; } catch { sajt = 'fel'; } }
steg('13e sajten', sajt === 200, String(sajt));
fs.appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, JSON.stringify({ ts: new Date().toISOString(), rond: 189, beslut: `B28 investmentbolag: s3-u1:s PÅGÅR-utkast fullbordat (+${ord - 987} ord, ingen ny talbas), syskonets KVD GRÖN 0 FEL, B28-rad bokförd — branschomgången fortsätter; kvar: vård-ar + bygg-ar`, landat: hash }) + '\n');
steg('14 beslutsminne', true);

console.log(kvitto.join('\n'));
