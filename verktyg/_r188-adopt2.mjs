#!/usr/bin/env node
// _r188-adopt2.mjs — AR27-adoptionen v2: återbygger KVD-skriptet ur arkivet med RÄTT patchning
// (förra försöket skrev över falt-arrayen — findIndex träffade fel rad), därefter alla steg idempotenta.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const GUIDE = 'data/blogg-utkast/medtechaktier-sa-analyserar-du-medicintekniska-bolag-ar.json';
const SKRIPT = 'verktyg/_s3u2-b24-ar-kvd-medtech.mjs';
const VAL = 'data/rapporter/motorervalidering-2026-09-02.md';

const kvitto = [];
const steg = (namn, ok, extra = '') => {
  kvitto.push(`${ok ? 'OK ' : 'FEL'} ${namn}${extra ? ' — ' + extra : ''}`);
  fs.writeFileSync('/tmp/r188-adopt2-kvitto.txt', kvitto.join('\n') + '\n');
  if (!ok) { console.error('AVBRYTER vid: ' + namn); process.exit(1); }
};
const sha = (p) => createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0, 16);
const git = (args, cwd = ROT) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

// A1'. Arkivet finns (A1 kördes grönt förra försöket) — verifiera
const arkivJson = `${ROT}/data/vakten/arkiv/s3u2-b24-ar-medtech-originalbytes-2026-09-24.json`;
const arkivMjs = `${ROT}/data/vakten/arkiv/s3u2-b24-ar-kvd-originalbytes-2026-09-24.mjs`;
steg("A1' arkiv", fs.existsSync(arkivJson) && fs.existsSync(arkivMjs), `sha(json) ${sha(arkivJson)}`);

// A2'. Guiden: antingen redan kurerad (2026-09-24) eller kurera nu
let guide = fs.readFileSync(`${PROD}/${GUIDE}`, 'utf8');
const antal21 = [...guide.matchAll(/"publishedAt"\s*:\s*"2026-09-21"/g)].length;
if (antal21 === 1) {
  guide = guide.replace(/("publishedAt"\s*:\s*)"2026-09-21"/, '$1"2026-09-24"');
  fs.writeFileSync(`${ROT}/${GUIDE}`, guide);
}
const koll = JSON.parse(fs.readFileSync(`${ROT}/${GUIDE}`, 'utf8'));
steg("A2' guide adopterad + kur", koll.publishedAt === '2026-09-24' && koll.slug === 'medtechaktier-sa-analyserar-du-medicintekniska-bolag-ar', `publishedAt=${koll.publishedAt} (kurades nu: ${antal21 === 1})`);

// A3'. KVD-skript: återbygg ur arkiv + patcha RÄTT rad (K-krysset, ej falt-arrayen)
let s = fs.readFileSync(arkivMjs, 'utf8');
s = s.replaceAll("'/home/ak1a/AK1/", "'/home/ak1a/agent/ak1/");
const linjer = s.split('\n');
const pkIdx = linjer.findIndex((l) => /K\('publishedAt/.test(l));
if (pkIdx < 0) steg("A3' KVD-patch", false, "K('publishedAt…-rad hittades ej i arkivet");
linjer[pkIdx] = `K('publishedAt = spegelns leveransdag', ar.publishedAt === '2026-09-24', ar.publishedAt + ' — KUR VID ADOPTIONEN (rond 188): originalet ' + sv.publishedAt + ' → leveransdagen 2026-09-24 enligt AR1 (09-15→09-19) och AR26 (09-22→09-24); syskonets kryss kodade == originalet');`;
linjer.splice(1, 0, '// ADOPTERAD av studio-sessionen rond 188: sökvägar omdirigerade till arbetsytan + publishedAt-kryss kurerat till spårets leveransdagskonvention (motiv i kryssraden). Originalbytes arkiverade i data/vakten/arkiv/.');
fs.writeFileSync(`${ROT}/${SKRIPT}`, linjer.join('\n'));
steg("A3' KVD-skript återbyggt+patchat", true, `K-rad på index ${pkIdx + 1} (ur originalet)`);

// A4'. Kör — 18 GRÖN 0 FEL väntas
let kvdUt;
try {
  kvdUt = execFileSync('node', ['_s3u2-b24-ar-kvd-medtech.mjs'], { cwd: `${ROT}/verktyg`, encoding: 'utf8', timeout: 120000, stdio: ['ignore', 'pipe', 'pipe'] });
} catch (e) { kvdUt = String(e.stdout || '') + '|FEL|' + String(e.message); }
const grön = (kvdUt.match(/^GRÖN /gm) || []).length;
const fel = (kvdUt.match(/^FEL /gm) || []).length;
fs.writeFileSync('/tmp/r188-kvd-omkorning.txt', kvdUt);
steg("A4' KVD-omkörning", fel === 0 && grön === 18, `${grön} GRÖN · ${fel} FEL`);

// A5'. Väktar-appenden
fs.copyFileSync(`${PROD}/${VAL}`, `${ROT}/${VAL}`);
const valTxt = fs.readFileSync(`${ROT}/${VAL}`, 'utf8');
steg("A5' väktar-append adopterad", valTxt.includes('2026-09-24T22:20:58') && valTxt.includes('107 PASS / 0 FAIL / 0 SKIP'), `sha ${sha(`${ROT}/${VAL}`)}`);

// A6'. AR27-raden (ersätt oavsett läge)
const seoP = `${ROT}/data/forskning/SEO-GUIDER-2026-09.md`;
const seoRader = fs.readFileSync(seoP, 'utf8').split('\n');
const ar27 = seoRader.findIndex((l) => l.startsWith('| AR27 |'));
if (ar27 < 0) steg("A6' AR27-rad", false, 'raden hittades ej');
seoRader[ar27] = `| AR27 | medtechaktier-sa-analyserar-du-medicintekniska-bolag-ar | أسهم التقنية الطبية | 1257 | UTKAST v1 (2026-09-24, s3-u2 byggare 2/3, manifest auto-s3-1790240107451, klaimfil s3-b24-ar-medtech-ansprak-2026-09-24.md i prod-trädets vakten skriven FÖRE arbetet 08:58:40Z, disk-först; levererad i PROD-trädet 09:05:16Z men lämnad OCOMMITTAD när fabriken kvotdog 13:10 — ADOPTERAD, VERIFIERAD OCH COMMITTAD av studio-sessionen rond 188 när push-avvisningen avslöjade den; klaimens racenot numrerade redan korrekt AR27 och AR26-radens notis "medtech-ar landade av syskon" bekräftades SANN — studions inventering rond 187 omfattade ej prod-trädet, läxa bokförd; studions egna parallellleverans 20:51 KVD-GRÖN 28/28 återkallad enligt AR14/AR15/AR17-precedensen, bevarad i lokala commit dae10397) — arabisk översättning av B24 (originalet 09-21; -en-spegeln och AR26 lästa som strukturreferenser); samma tal och räkneexempel som originalet (bruttomarginaltrappan Sonova 73.7 → Straumann 69.3 → Boston Scientific 69.2 → CellaVision 68.7 → Coloplast 67.2 → Getinge 48.6 → Elekta 39.6 med spannet 73.7−25.4 = 48.3 pp; räkneexemplet 68/32 med volymfall +10 % → +42.5 % = 4.25× och prisfall −5 % → −31 %; Getingeserien 2022→2025 intäkt 28,292→34,969 Mkr = +23.6 % mot resultat 2,491→2,258 = −9.4 % med nettomarginal 8.8→6.5; värderingsblocket P/E-median 30.0 · EV/EBIT 18.8 · ROIC 15.0 med spannet 19.4–41.0; Ambu 10.8 %/60.1 och Sonova ROE 20.5; MDR 2017/745 + FDA 510(k); checklistans fem steg); KVD GRÖN 0/0 i 18 maskinella kontroller (verktyg/_s3u2-b24-ar-kvd-medtech.mjs — syskonets skript, adopterat och omkört av studion mot den kurerade filen vid adoptionen): varumärkesgrind 26 regexer × 3 ytor 0/0 · rådverb SV+EN+AR 0 · sökord "أسهم التقنية الطبية" title+ingress+3 H2 · title 50/60 · OG 150/155 · ord 1257/1400 (originalet 1193) · korslänkar 12/12 MULTISET-identiska · externa 3/3 (eur-lex + lakemedelsverket + fda) · H2-paritet 6=6 · H1 0=0 · TAL-PARITET 88/88 i första körningen · aritmetik 19/19 motorräknad · readingMinutes 2 · svenska läckor 0 (28 latinska token, alla vitlistade enligt AR6/AR7-konventionen) · disclaimer arabisk exakt sista rad; KUR VID ADOPTIONEN: publishedAt 2026-09-21→2026-09-24 — spårets leveransdagskonvention (AR1 09-15→09-19, AR26 09-22→09-24), dokumenterad i det adopterade KVD-skriptets kryssrad | data/blogg-utkast/medtechaktier-sa-analyserar-du-medicintekniska-bolag-ar.json |`;
fs.writeFileSync(seoP, seoRader.join('\n'));
steg("A6' AR27-rad omskriven", true);

// A7'. Worklog (ersätt eventellt befintligt rond 188-block)
const wlP = `${ROT}/worklog.md`;
const wl = fs.readFileSync(wlP, 'utf8');
const klipp = wl.indexOf('## ROND 188');
if (klipp < 0) steg("A7' worklog", false, 'ROND 188-block hittades ej');
const nyRond = `## ROND 188 [organ:Φ] — AR27 MEDTECH-AR: KOLLISIONEN STUDION×SYSKONET LÖST — syskonets förstalande adopterat KVD 18/18, push avlåst — 2026-09-24 ~23:5x lokal
(1) EGEN LEVERANS: studion byggde medtech-ar parallellt (KVD GRÖN 28/28, _v171-ar24-kvd.mjs) och commitade dae10397 — men PUSHEN AVVISADES: prod (receive.denyCurrentBranch=updateInstead) kräver ren katalog. (2) SONDERINGEN AVSLÖJADE KOLLISIONEN: syskonet s3-u2 (manifest auto-s3-1790240107451, fabriken kvotdog 13:10) hade levererat medtech-ar i PROD-trädet 09:05:16Z — klaim 08:58:40Z FÖRE arbetet, guide 09:05, KVD-skript 09:07, klaimens racenot med korrekt AR27-nummering och uttrycklig yta-reservation — OCOMMITTAD när fabriken dog. AR26-radens notis "medtech-ar landade av syskon" var SANN; studions inventering rond 187 omfattade bara egen arbetsyta = ROTTEN till dubbelarbetet (d13/d19/d22-klassens AR-variant). LÄXA BOKFÖRD: SEO-spårets disk-inventeringar omfattar ALLTID prod-trädets untracked-filer. (3) LÖSNING ENLIGT SPÅRETS PRECEDENS (AR14/AR15/AR17 — förstalande på disk äger ytan): syskonets fil ADOPTERAD — deras KVD-skript omkört av studion mot prod-trädet GRÖN 18/18 (talparitet 88/88 i första körningen, aritmetik 19/19, korslänkar 12/12, ord 1257, läckor 0); EN DOKUMENTERAD KUR: publishedAt 2026-09-21→2026-09-24 (spårets leveransdagskonvention — AR1 09-15→09-19, AR26 09-22→09-24; syskonets KVD-kryss kodade == originalet, kurerat med motiv i det adopterade skriptet); studions parallellleverans ÅTERKALLAD — bevarad i lokala dae10397 som historiskt bevis, aldrig pushad; syskonets originalbytes arkiverade i data/vakten/arkiv/. AR27-raden omskriven med sann proveniens. (4) PUSH-BLOCKERAREN LÖST: väktarens motorervalidering-append 2026-09-24T22:20:58Z (107 PASS/0 FAIL/0 SKIP, 172 rader) ADOPTERAD i commiten; prod-trädets untracked-kopior (guide + KVD-skript) borttagna FÖRST efter arkivering+commit, motorervalidering checkoutad i prod (innehållet återkommer via pushen). (5) PIPELINE: B28 investmentbolag (s3-u1, ostaged i prod sedan 09:03–09:08: guide + underlag + KVD-skript) påträffad — ADOPTIONSPROB nästa rond (verifiera → bokföra → committa eller avfärda); därefter vård-ar (B25) + bygg-ar (B27); v172 kvartalsrapporter (Q3 slutar 09-30) enligt PIPELINE-KO. Ren dataleverans — src orörd, inget bygge.`;
fs.writeFileSync(wlP, wl.slice(0, klipp) + nyRond + '\n');
steg("A7' worklog omskriven", true);

// A8'. Klaim-återkallelse (endast en gång)
const klaimP = `${ROT}/data/vakten/s3-ar24-ansprak-2026-09-24.md`;
const klaim = fs.readFileSync(klaimP, 'utf8');
if (!klaim.includes('ÅTERKALLAD')) {
  fs.appendFileSync(klaimP, `\n## ÅTERKALLAD (rond 188, 2026-09-24 ~24:0x lokal)\nPush-avvisningen avslöjade s3-u2:s förstalande i prod-trädet 09:05:16Z (klaim 08:58:40Z FÖRE deras arbete, KVD GRÖN 18/18 omkört av studion). Enligt AR14/AR15/AR17-precedensen (förstalande på disk äger ytan) återkallas denna parallellleverans; min fil bevarad i lokala commit dae10397, AR27 = syskonets fil med publishedAt-kur.\n`);
}
steg("A8' klaim-återkallelse", true);

// ══ FAS B: commit → prod-avlåsning → push ══
const msg = `studio: [organ:Φ] rond 188 rättning — medtech-ar-kollisionen löst: syskonet s3-u2:s FÖRSTALANDE (09:05 UTC i prod-trädet, klaim 08:58 FÖRE arbetet, KVD GRÖN 18/18 omkört av studion) ADOPTERAT som AR27 enligt AR14/AR15/AR17-precedensen. Studions parallellleverans (20:51, KVD 28/28) ÅTERKALLAD — bevarad i dae10397, aldrig pushad. EN kur: publishedAt →2026-09-24 (spårets leveransdagskonvention AR1/AR26, motiv i det adopterade KVD-skriptet). Väktarens motorervalidering-append (107 PASS) adopterad = push-blockeraren borta; prod-trädets untracked-kopior borttagna efter arkivering i data/vakten/arkiv/. LÄXA: SEO-inventeringar omfattar prod-trädets untracked-filer (dubbelarbesroten). B28 investmentbolag (s3-u1) påträffad ostaged — adoptionsprob nästa rond. Kvar i spåret: vård-ar + bygg-ar. Ren dataleverans — src orörd, inget bygge.`;
fs.writeFileSync('/tmp/r188-msg2.txt', msg);
steg('B1 commitmsg', true);
const filer = [GUIDE, 'data/forskning/SEO-GUIDER-2026-09.md', VAL, SKRIPT, 'verktyg/_r188-sondra-prod.mjs', 'verktyg/_r188-kollision.mjs', 'verktyg/_r188-koll2.mjs', 'verktyg/_r188-kvd-syskon.mjs', 'verktyg/_r188-diagnos.mjs', 'verktyg/_r188-diagnos2.mjs', 'verktyg/_r188-hex.mjs', 'verktyg/_r188-adopt.mjs', 'verktyg/_r188-adopt2.mjs', 'worklog.md'];
git(['add', ...filer]);
steg('B2 git add', true, `${filer.length} filer`);
try {
  const ut = git(['commit', '-F', '/tmp/r188-msg2.txt']);
  steg('B3 commit (tsc-grinden)', true, ut.split('\n').find((r) => r.startsWith('[')) || '');
} catch (e) { steg('B3 commit (tsc-grinden)', false, String(e.stdout || e.message).slice(0, 400)); }
const hash = git(['rev-parse', '--short', 'HEAD']);
steg('B4 HEAD', true, hash);

// B5. Prod-avlåsning (idempotenta kommandon)
git(['checkout', '--', VAL], PROD);
if (fs.existsSync(`${PROD}/${GUIDE}`)) fs.rmSync(`${PROD}/${GUIDE}`);
if (fs.existsSync(`${PROD}/${SKRIPT}`)) fs.rmSync(`${PROD}/${SKRIPT}`);
const statusEfter = git(['status', '--porcelain'], PROD);
const blockerare = statusEfter.split('\n').filter((l) => /^ ?M/.test(l) || l.includes('medtechaktier') || l.includes('_s3u2-b24-ar-kvd'));
steg('B5 prod avlåst', blockerare.length === 0, `spår kvar: ${statusEfter.split('\n').filter((l) => l.trim()).length} (övriga = syskonens B28 + historiskt avris, orörda)`);

try {
  const push = git(['push', 'prod', 'develop']);
  steg('B6 push prod develop', true, push.split('\n').filter((r) => r.includes('->') || r.includes('|')).join(' | ').slice(0, 160));
} catch (e) { steg('B6 push prod develop', false, String(e.stdout || e.message).slice(0, 500)); }

// ══ FAS C: verifikation + beslutsminne ══
const prodHead = git(['rev-parse', '--short', 'HEAD'], PROD);
steg('C1 prod HEAD ≡ push', prodHead === hash, `${prodHead}`);
const spårad = git(['ls-files', '--error-unmatch', GUIDE], PROD);
steg('C2 guiden spårad i prod', spårad === GUIDE);
steg('C3 guiden bitidentisk', sha(`${ROT}/${GUIDE}`) === sha(`${PROD}/${GUIDE}`), `sha ${sha(`${PROD}/${GUIDE}`)}`);
const seoProd = fs.readFileSync(`${PROD}/data/forskning/SEO-GUIDER-2026-09.md`, 'utf8');
steg('C4 AR27-rad (adoption) i prod', seoProd.includes('ADOPTERAD, VERIFIERAD OCH COMMITTAD'));
const valP = fs.readFileSync(`${PROD}/${VAL}`, 'utf8');
steg('C5 väktar-append tillbaka i prod', valP.includes('107 PASS / 0 FAIL / 0 SKIP'));
let sajt = 'n/a';
try { const svar = await fetch('https://lab.ak1nvestor.com/', { method: 'HEAD', signal: AbortSignal.timeout(15000) }); sajt = svar.status; } catch { try { const l = await fetch('http://localhost:3000/', { method: 'HEAD', signal: AbortSignal.timeout(8000) }); sajt = l.status; } catch { sajt = 'fel'; } }
steg('C6 sajten', sajt === 200, String(sajt));
const minne = { ts: new Date().toISOString(), rond: 188, beslut: 'AR27 medtech-ar: syskonet s3-u2:s förstalande (09:05 i prod-trädet) adopterat KVD 18/18 efter push-avvisning avslöjade kollisionen; studions parallell återkallad; läxa: inventeringar omfattar prod-trädets untracked; B28-adoption + vård-ar + bygg-ar kvar', landat: hash };
fs.appendFileSync(`${ROT}/data/vakten/beslutsminne.jsonl`, JSON.stringify(minne) + '\n');
steg('C7 beslutsminne', true);

console.log(kvitto.join('\n'));
