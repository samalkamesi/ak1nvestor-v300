#!/usr/bin/env node
/**
 * ATOMÄR LEVERANS s5-u1 omgång 12 (2026-09-17): vr-04 → register + hela
 * genererade kedjan + FRONT B + KVD + tsc + worklog + git commit i EN process.
 * Sysken-clobber har fällt register-ytor i bash-stegfönster (omgång 9:s hårdläxa
 * b238a176) — inga mellanfönster här. Idempotent omkörning om vr-04 redan landat.
 * Pedagogisk plattform — inte investeringsråd.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const run = (cmd) => execSync(cmd, { stdio: ["ignore", "pipe", "pipe"], cwd: ROT, maxBuffer: 50 * 1024 * 1024 }).toString().trim();
const MINA = ["vr-04-avkastningens-tre-kallor"];
const KURSFILER = MINA.map(s => `data/kurser-tillagg/${s}.json`);
const YTOR = ["public/deep-courses.json", "src/lib/larvag-karta.ts", "public/sok-index.json",
  "public/speglar-slugar.json", "data/siffror.json", "public/llms.txt", "public/llms-full.txt"];

// 1. Bas: disk-sanningen (syskons ocommittade kurser bevaras — BASF-precedensen)
const bas = JSON.parse(readFileSync(`${ROT}/public/deep-courses.json`, "utf8"));
const basAntalRaw = Object.keys(bas).length;
if (basAntalRaw < 396) { console.error(`ABORT: basen är ${basAntalRaw}, förväntat ≥ 396`); process.exit(1); }
const redanIn = MINA.filter(s => bas[s]);
const aterupp = redanIn.length === 1;
const basAntal = basAntalRaw - (aterupp ? 1 : 0);
const mal = basAntal + 1;
console.log(`1. bas ${basAntal} → mål ${mal}${aterupp ? " [OMKÖRNING: vr-04 redan på disk — insert hoppas över]" : ""}`);

// 2. Insert (idempotent, serieordad efter vr-03) — vid omkörning redan gjort
if (aterupp) console.log("2. (hoppas över — omkörning)");
else console.log("2.", run("node verktyg/lagg-till-kurs.mjs data/kurser-tillagg/vr-04-avkastningens-tre-kallor.json").split("\n")[0]);

// 3. Hela genererade kedjan
for (const cmd of ["node scripts/bygg-larvag-karta.ts", "node verktyg/kor-sokindex.mjs",
  "node verktyg/kor-speglar-slugar.mjs", "node verktyg/rakna-siffror.mjs"]) {
  console.log("3.", (run(cmd).match(/.*/) || [cmd])[0].slice(0, 90));
}

// 4. llms mönstersträngt: unikt kursantal (≥380) → mal; BOKMASTER-antalet (103) orört
for (const [p, forvantat] of [["public/llms.txt", 6], ["public/llms-full.txt", 4]]) {
  let t = readFileSync(`${ROT}/${p}`, "utf8");
  const traf = [...t.matchAll(/\b(\d{3}) kurser\b/g)].map(m => m[1]).filter(n => parseInt(n, 10) >= 380);
  const unika = [...new Set(traf)];
  if (unika.length !== 1) { console.error(`ABORT: ${p} har blandade kursantal ${JSON.stringify(unika)}`); process.exit(1); }
  const nu = parseInt(unika[0], 10);
  if (nu !== basAntal && nu !== mal) { console.error(`ABORT: ${p} bär ${nu}, basen ${basAntal} eller mål ${mal} — ojämnt läge`); process.exit(1); }
  if (traf.length !== forvantat) { console.error(`ABORT: ${p} har ${traf.length} kursantals-ställen, förväntat ${forvantat}`); process.exit(1); }
  if (nu === mal) { console.log(`4. ${p}: redan ${mal} (omkörning) — orört`); continue; }
  t = t.split(`${unika[0]} kurser`).join(`${mal} kurser`);
  writeFileSync(`${ROT}/${p}`, t);
  console.log(`4. ${p}: ${traf.length} ställen ${unika[0]}→${mal} (103 BOKMASTER orört)`);
}

// 5. larvag-synk GRÖN?
const synk = run("node verktyg/larvag-synk.mjs");
if (!synk.includes("GRÖN") || !synk.includes(String(mal))) { console.error("ABORT: larvag-synk ej GRÖN " + mal + ":\n" + synk); process.exit(1); }
console.log(`5. larvag-synk GRÖN ${mal} ✓`);

// 6. FRONT B GRÖN?
try { const fb = execSync("node verktyg/_s5u1o12-frontb.mjs", { stdio: ["ignore", "pipe", "pipe"], cwd: ROT }).toString(); console.log("6. FRONT B GRÖN ✓ —", fb.includes("nivåpar") ? "vr-04 nominerad 90p + nivåpar 86p" : fb.trim().split("\n").pop()); }
catch (e) { console.error("ABORT: FRONT B RÖD:\n" + e.stdout + e.stderr); process.exit(1); }

// 7. KVD 0 FEL?
let kvdPass = "?";
try { const kvd = execSync("node verktyg/_s5u1o12-kvd.mjs", { stdio: ["ignore", "pipe", "pipe"], cwd: ROT }).toString(); const m = kvd.match(/KVD: (\d+) PASS · (\d+) FEL · (\d+) VARNING/); kvdPass = `${m[1]} PASS ${m[2]} FEL ${m[3]} VARNING`; console.log(`7. KVD ${kvdPass} ✓`); if (+m[2] > 0) process.exit(1); }
catch (e) { console.error("ABORT: KVD FEL:\n" + e.stdout + e.stderr); process.exit(1); }

// 8. tsc 0?
try { execSync("node node_modules/typescript/bin/tsc --noEmit", { stdio: "ignore", cwd: ROT }); } catch { console.error("ABORT: tsc fel"); process.exit(1); }
console.log("8. tsc 0 ✓");

// 9. worklog-rad (idempotent)
const worklogText = readFileSync(`${ROT}/worklog.md`, "utf8");
if (worklogText.includes("manifest auto-s5-1789657528556-u1") || worklogText.includes("vr-04 avkastningens tre källor")) {
  console.log("9. worklog-rad redan på plats (omkörning) — orörd");
} else {
  appendFileSync(`${ROT}/worklog.md`, `
## SPÅR 5 s5-u1 (omgång 12, manifest auto-s5-1789657528556) — 2026-09-17: lärvägsdjup +1 kurs — vr-04 avkastningens tre källor (VÄRDERING:s tidsaxel: dekompositionen av en periods avkastning — lucklistans vr-04-namn från omgång 9:s kvar-lista, kategorins tunnaste rad I 2 → 3) [fabrik]

URVAL (anspråk FÖRE byggstart, data/vakten/auto-s5-1789657528556-u1-ansprak.md, gitignorad diskbevis): luckmätning tema × nivå över registret 396 — svagaste trapporna VÄRDERING/RISK/KATALYSATOR/TILLVÄXT (6 kurser vardera); dokumenterat kvarstående från omgång 9:s kvar-lista: st-05, tx-04, vr-04, rs-06, kt-04. vr-04 vald efter sond mot hela registret (slug+titel+summary): /re-?rating|omvärder|multipelutvidg|multiple expansion|derating|avkastningsdeko|returdeko/ = 0 träffar — territoriet HELT fritt; st-05-kandidaten (refinansieringsmuren) föll i sonden (ks-03 äger löptidsstegen+räntebindningen, st-04 kreditcykeln), kt-04-kandidaten (katalysatorkalendern) delvis belagd (sj-03 stämmor, ud-07 utdelningskalender, km-006 rapporten).

OBJEKT: vr-04-avkastningens-tre-kallor (Intermediär — VÄRDERING-familjens fjärde steg och tidsaxeln ingen granne äger: vr-03 äger multipelns anatomi VAD den är, vr-01 tvärsnittet varför lika bolag skiljer, vr-02 normaliseringen av svängande vinstbaser, kt-02 ex-ante-förväntningarna — vr-04 äger ex-post-redovisningen: var en periods avkastning faktiskt KOM IFRÅN. Tre källor: vinsttillväxt (bolagets arbete, tjänat), utdelning (bolagets beslut, beslutat), multipelförändring (marknadens omprissättning, tillskänkt) — Bogles investerings-/spekulativ avkastning i svensk dräkt: påtagligt mot lånat). Signatursiffror (spegelparet, genomgående påhittade Svea Stolar AB med identisk vinstväg 10,00 · 11,50 · 13,00 · 14,50 · 16,00 = +60 procent): FALL A nedvärdering P/E 20,0 → 12,5 ger 12,5 × 16,00 = 200,0 mot 20,0 × 10,00 = 200,0 = 0,0 procent prisavkastning (företaget lyckades, aktieägaren stod stilla; 1,60 × 0,625 = 1,000), med utdelningen 0,4 × 65,00 = 26,00 kronor blir totalen 26,00 ÷ 200,0 = 13,0 procent ≈ 2,5 per år; FALL B spegeln P/E 12,5 → 20,0: 320,0 ÷ 125,0 = 2,56 = +156 procent ty 1,60 × 1,60 = 2,56 (procent på procent), total 221,0 ÷ 125,0 = 1,768 = +176,8 — multipeln bar mer än vinsten och ingen krona av den delen var bolagets. Trapptestet: 1,06 × 1,02 = 1,0812 ⇒ 1,10 ÷ 1,0812 = 1,017 — den OKÖPBARA posten (multipeln +1,7 procent/år i tio år, 1,017¹⁰ ≈ 1,19); additiva bluffen 60 − 37,5 = 22,5 namngiven som just bluff.

REGISTER ${basAntal}→${mal} atomärt (insert efter vr-03, serieordningen bevarad): karta regenererad, sökindex + speglar + siffror (quiz 8 223 oförändrad — kursen bär inga quiz), llms mönstersträngt ${basAntal}→${mal} (6+4 ställen, 103 BOKMASTER orört), larvag-synk GRÖN ${mal} = ${mal} = ${mal}. FRONT B GRÖN (verktyg/_s5u1o12-frontb.mjs, läsreplik av larvag.ts BAS 86 + nivåmatch +4): fulläst VÄRDERING-läsare [6 steg, växande lästillstånd] → vr-04 nomineras 90p med genererad varför-rad Du är igång i värdering — 6 steg ligger bakom dig…; nivåpars avancerat lästillstånd → 86p (Intermediär matchar inte målnivå 3); kartordning (delvisläsare v04+v05 → v06 FÖRE vr-04 = korrekt motorbeteende); försvarsläge vilar; determinism identisk. KVD _s5u1o12-kvd.mjs ${kvdPass}: strukturparitet (vr-familjens kapitelmönster Grunderna/Konstruktion/Praktisk/Mätning/Fällor/Mästerskap + blockmönster definition 1+5, tabell 2+3+4, insight+utmaning 6), aritmetik 20 kontroller oberoende omräknade (spegelparet + vinstvägen + utdelningssumman + trapptestet), korslänkar 11 registeräkta prefixmatch (vr-01/02/03, km-009, kt-02, tx-03, ud-09, v20, ln-02, ek-03, v04), juridikgrind 0 rådsfraser + utbildningsframing (vr-familjens passus utbildning, aldrig råd) + 0 lagrum i kurstext, språkgrind 0 CJK/0 mjuka bindestreck/0 typografiska citattecken/0 tabbar + anomalitecken-whitelist — egna fel fångade och rättade FÖRE insert (lärčen→lärdomen med anomalibokstav, trångStart→dyr entré, endes→endast, alkat→aldrig, spädt→späder, units→enheter, kontrollyttring→kontrollpost, näringsväxten→tillväxten, FEM BOTEN→BOTAR, garbage in→skräp in, felsläsning→misstolkning + tre brutna meningsbyggnader). tsc 0 via projektbinär. Endast data/ + genererad karta + public/ + verktyg/ + worklog; inget bygge (deploy ägs av prod-synken); R2 orörd (kraverFas 0 — ingen pris-/tier-/publiceringsyta); data/blogg/ orörd. Kvar i spåret åt syskonen: st-05 (obs ks-03-sonden), tx-04, rs-06, kt-04, od-N, vr-N.
`);
  console.log("9. worklog-rad ✓");
}

// 10. git add + commit (index-atomärt i denna process; retry vid deployfönster — kvalitetsgrindens tsc kan träffa npm ci-stripping, s2u3-omg9-precedensen)
const medd = "verktyg/_s5u1o12-commitmsg.txt";
writeFileSync(`${ROT}/${medd}`, `studio: auto s5-u1 lärvägsdjup +1 kurs — vr-04 avkastningens tre källor (VÄRDERING:s tidsaxel: dekompositionen ingen granne äger — vr-03 har anat VAD multipeln är, vr-01 tvärsnittet mellan bolag, vr-02 normaliseringen, kt-02 ex-ante-förväntningarna; vr-04 äger ex-post-redovisningen var avkastningen kom ifrån: vinsttillväxt tjänad + utdelning beslutad + multipelförändring tillskänkt, Bogles påtagligt-mot-lånat i svensk dräkt). Signatursiffror på påhittade Svea Stolar AB med identisk vinstväg 10,00→16,00 (+60 procent): spegelparet P/E 20,0→12,5 = 0,0 procent prisavkastning (1,60 × 0,625 = 1,000 — företaget lyckades, aktieägaren stod stilla; med utdelning 0,4 × 65,00 = 26,00 kronor blir totalen 13,0 procent) mot P/E 12,5→20,0 = +156 procent (1,60 × 1,60 = 2,56, total 221,0 ÷ 125,0 = 1,768 = +176,8) — plus trapptestets oköpbara post 1,10 ÷ 1,0812 = 1,7 procent per år i tio år och den additiva bluffen 60 − 37,5 = 22,5 avslöjad. Register ${basAntal}→${mal} atomärt i EN process (insert efter vr-03 serieordat, karta + sökindex + speglar + siffror + llms mönstersträngt 6+4 + larvag-synk GRÖN ${mal}=${mal}=${mal}); FRONT B GRÖN med genererad varför-rad (fulläst VÄRDERING-läsare 90p nivåmatch, avancerat nivåpar 86p, kartordning v06 före vr-04, försvarsläge vilar, determinism); KVD _s5u1o12-kvd.mjs ${kvdPass}: strukturparitet efter vr-familjens kapitel/blockmönster, 20 aritmetikkontroller oberoende omräknade, 11 korslänkar registeräkta, juridikgrind 0 rådsfraser + 0 lagrum, språkgrind ren efter 14 egna fel fångade och rättade FÖRE insert (bland dem anomalibokstaven i lärčen och camelCase-läckan trångStart); tsc 0 via projektbinär. Endast data/ + genererad karta + public/ + verktyg/ + worklog; inget bygge (deploy ägs av prod-synken); R2 orörd; data/blogg/ orörd. [fabrik]\n`);
run(`git add ${[...KURSFILER, ...YTOR, medd, "worklog.md", "verktyg/_s5u1o12-frontb.mjs", "verktyg/_s5u1o12-kvd.mjs", "verktyg/_s5u1o12-leverans.mjs"].join(" ")}`);
let commit = "";
try { commit = run(`git commit -F ${medd}`); }
catch (e) {
  console.log("10. första commit-försöket misslyckades (deployfönster?) — väntar 100 s och försöker igen");
  execSync("sleep 100", { stdio: "ignore" });
  commit = run(`git commit -F ${medd}`);
}
console.log("10.", commit.split("\n")[0]);

// 11. Verifiera HEAD
const h = JSON.parse(run("git show HEAD:public/deep-courses.json"));
const ok = Object.keys(h).length === mal && MINA.every(s => h[s]);
console.log(ok ? `11. HEAD VERIFIERAD: ${mal} kurser, vr-04 i trädet ✓` : `11. FEL: HEAD oförklarlig (${Object.keys(h).length})`);
process.exit(ok ? 0 : 1);
