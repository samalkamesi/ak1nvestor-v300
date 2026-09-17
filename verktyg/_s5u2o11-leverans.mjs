#!/usr/bin/env node
/**
 * ATOMÄR LEVERANS s5-u2 omgång 11 (2026-09-17): pe-03 + mt-04 → register + hela
 * genererade kedjan + FRONT B + KVD + tsc + worklog + git commit i EN process.
 * Syskon-clobber har fällt register-ytor i bash-stegfönster (omgång 9:s hårdläxa
 * b238a176) — inga mellanfönster här. Pedagogisk plattform — inte investeringsråd.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const run = (cmd) => execSync(cmd, { stdio: ["ignore", "pipe", "pipe"], cwd: ROT, maxBuffer: 50 * 1024 * 1024 }).toString().trim();
const MINA = ["pe-03-forvarvsmaskinen", "mt-04-vallgravens-fodelse"];
const KURSFILER = MINA.map(s => `data/kurser-tillagg/${s}.json`);
const YTOR = ["public/deep-courses.json", "src/lib/larvag-karta.ts", "public/sok-index.json",
  "public/speglar-slugar.json", "data/siffror.json", "public/llms.txt", "public/llms-full.txt"];

// 1. Bas: disk-sanningen (u3:s ek-03 lever ocommittad på disk — BASF-precedensen: bygg vidare, bevara)
const bas = JSON.parse(readFileSync(`${ROT}/public/deep-courses.json`, "utf8"));
const basAntalRaw = Object.keys(bas).length;
if (basAntalRaw < 390) { console.error(`ABORT: basen är ${basAntalRaw}, förväntat ≥ 390`); process.exit(1); }
const redanIn = MINA.filter(s => bas[s]);
if (redanIn.length === 1) { console.error("ABORT: delvis läge (en av två inserterad) — kör om från rent tillstånd"); process.exit(1); }
const aterupp = redanIn.length === 2;
const basAntal = basAntalRaw - (aterupp ? 2 : 0);
const ek03 = !!bas["ek-03-arbetsflodet-i-labbet"];
const mal = basAntal + 2;
console.log(`1. bas ${basAntal} (u3:s ek-03 ${ek03 ? "bevaras" : "finns inte — noteras"}) → mål ${mal}${aterupp ? " [OMKÖRNING: mina kurser redan på disk — inserts hoppas över]" : ""}`);

// 2. Mina två inserts (idempotenta, serieordade) — vid omkörning redan gjort
if (aterupp) console.log("2. (hoppas över — omkörning)");
else for (const f of KURSFILER) console.log("2.", run(`node verktyg/lagg-till-kurs.mjs ${f}`).split("\n")[0]);

// 3. Hela genererade kedjan
for (const cmd of ["node scripts/bygg-larvag-karta.ts", "node verktyg/kor-sokindex.mjs",
  "node verktyg/kor-speglar-slugar.mjs", "node verktyg/rakna-siffror.mjs"]) {
  console.log("3.", (run(cmd).match(/.*/) || [cmd])[0].slice(0, 90));
}

// 4. llms mönstersträngt: aktuellt unikt kursantal (≥380) → mal; BOKMASTER-antalet (103) orört
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
try { const fb = execSync("node verktyg/_s5u2o11-frontb.mjs", { stdio: ["ignore", "pipe", "pipe"], cwd: ROT }).toString(); console.log("6. FRONT B GRÖN ✓ —", fb.includes("2/2") ? "2/2 nominerade" : fb.trim().split("\n").pop()); }
catch (e) { console.error("ABORT: FRONT B RÖD:\n" + e.stdout + e.stderr); process.exit(1); }

// 7. KVD 0 FEL?
let kvdPass = "?";
try { const kvd = execSync("node verktyg/_s5u2o11-kvd.mjs", { stdio: ["ignore", "pipe", "pipe"], cwd: ROT }).toString(); const m = kvd.match(/KVD: (\d+) PASS · (\d+) FEL · (\d+) VARNING/); kvdPass = `${m[1]} PASS ${m[2]} FEL ${m[3]} VARNING`; console.log(`7. KVD ${kvdPass} ✓`); if (+m[2] > 0) process.exit(1); }
catch (e) { console.error("ABORT: KVD FEL:\n" + e.stdout + e.stderr); process.exit(1); }

// 8. tsc 0?
try { execSync("node node_modules/typescript/bin/tsc --noEmit", { stdio: "ignore", cwd: ROT }); } catch { console.error("ABORT: tsc fel"); process.exit(1); }
console.log("8. tsc 0 ✓");

// 9. worklog-rad (idempotent: hoppa över om omgång 11-sektionen redan finns)
const worklogText = readFileSync(`${ROT}/worklog.md`, "utf8");
if (worklogText.includes("manifest auto-s5-1789635927734-u2") || worklogText.includes("pe-03 förvärvsmaskinen + mt-04 vallgravens födelse")) {
  console.log("9. worklog-rad redan på plats (omkörning) — orörd");
} else {
  appendFileSync(`${ROT}/worklog.md`, `
## SPÅR 5 s5-u2 (omgång 11, manifest auto-s5-1789635927734) — 2026-09-17: lärvägsdjup +2 kurser — pe-03 förvärvsmaskinen + mt-04 vallgravens födelse (PRIVATE EQUITY & INVESTMENTBOLAG:s mellanakt + MOAT:s fjärde akt — båda i u2:s egna serier, noll syskonkollision) [fabrik]

URVAL (anspråk FÖRE byggstart, data/vakten/auto-s5-1789635927734-u2-ansprak.md): pe/ib/mt/vr-st-serierna är u2:s sedan omgång 4–6 (ib-01+pe-01 9aacb6ce, pe-02 0a5fd21a, mt-03 067a8d7e); luckmätning: EKOSYSTEM I:0 (u3:s serie — lämnad i anspråksfilen, u3 tog den: ek-03 landade ocommittat på disk under mitt fönster), TILLVÄXT A:1 (tx = u3:s), UTDELNINGSSTRATEGI A:1 (ud = u1:s). Mina luckor tematiska: pe-01 (fondstruktur) + pe-02 (utfasning) lämnade förvärvsfasen utan kurs; mt-01/02/03 (vad/erosion/mätning) lämnade ursprunget.

OBJEKT: pe-03-forvarvsmaskinen (Intermediär — LBO-mekaniken genomräknad: köp 1 000 = 10x EBITDA 100 med 600 skuld + 400 fondkapital; ränta 600 × 0,06 = 36; kassaflöde 100 − 20 − 10 = 70 varav amortering 34; fem år à 40 i snitt ⇒ skuld 400 och ränta 24; de tre motorerna: EBITDA 100 → 130 × multipel 11 = 1 430 − 400 = 1 030 mot insats 400 = 2,6x, spegeln utan hävstång 1 430 mot 1 000 = 1,4x; nedsidan EBITDA 80: räntetäckning 2,8 → 2,2 mot covenant 2,5, utrymme 50 − 36 = 14 — hävstången flyttar krisgränsen; fällor: multipelvind som hantverk, addbacks-penseln, utdelningslånen, hävstången som universalförklaring, bolagets år mot fondens). mt-04-vallgravens-fodelse (Intermediär — fem källors bygginstruktioner: nätverk 10 × 9 ÷ 2 = 45 mot 20 × 19 ÷ 2 = 190 förbindelser = 4,2x värde på 2x storlek; skal (100 + 20) ÷ 10 = 12 per kund mot (100 + 200) ÷ 100 = 3 — pris 8 ger −40 vid tio kunder, +500 vid hundra; varumärke = 52 leveranser × 5 år = 260 hållna löften; omställning föds hos kunden; regelverket = enda moaten med utgångsdatum; grävåren 10 → 45 → 90 på 500 investerade = 2 → 9 → 18 % ROIC — J-kurvans (pe-01) släkting med öppen horisont; fällor: först ≠ försvar, tillväxt ≠ nätverk, kännedom ≠ premium, skala utan kvarstad, födelsens utsida).

REGISTER ${basAntal}→${mal} atomärt (u3:s ocommittade ek-03 på disk bevarad intakt — BASF-precedensen, deras commit blir register-ren): karta regenererad, sökindex + speglar + siffror, llms mönstersträngt ${basAntal}→${mal} (6+4 ställen), larvag-synk GRÖN ${mal}=${mal}=${mal}. FRONT B GRÖN 2/2 (pe-03 för fulläst PE-läsare [5 steg] 90p nivåmatch 'Du är igång i private equity & investmentbolag — 5 steg ligger bakom dig…'; mt-04 för fulläst MOAT-läsare [6 steg] 90p 'Du är igång i moat — 6 steg…'; kartordning: delvis-MOAT-läsare får v13 före mt-04; försvarsläge vilar; determinism). KVD _s5u2o11-kvd.mjs ${kvdPass}: strukturparitet ×2, aritmetik 26 kontroller oberoende omräknade, korslänkar 24 registeräkta prefixmatch, juridikgrind 0 rådsfraser + utbildningsframing + 0 lagrum i kurstext (lagrum = mentorgrindens yta), språkgrind 0 CJK/0 mjuka bindestreck/0 typografiska citattecken/0 tabbar — egna fel fångade FÖRE insert: CJK-bokstav 仍, 46 mjuka bindestreck, own hand, marginal of safety, stretch-läckan, fyra sammanskrivningar. tsc 0 via projektbinär. Endast data/ + src/lib/larvag-karta.ts (genererad) + public/ + verktyg/ + worklog; inget bygge (deploy ägs av prod-synken); R2 orörd (kraverFas 0 ×2 — ingen pris-/tier-yta); data/blogg/ orörd.
`);
  console.log("9. worklog-rad ✓");
}

// 10. git add + commit (index-atomärt i denna process)
const medd = "verktyg/_s5u2o11-commitmsg.txt";
writeFileSync(`${ROT}/${medd}`, `studio: auto s5-u2 lärvägsdjup +2 kurser — pe-03 förvärvsmaskinen · mt-04 vallgravens födelse (PRIVATE EQUITY & INVESTMENTBOLAG:s mellanakt: LBO-mekaniken som varken pe-01 fondstruktur eller pe-02 utfasning äger — köp 1 000 = 10x EBITDA 100 med 600 skuld + 400 fondkapital, ränta 36, amorteringstrappan 70 − 36 = 34/år, tre motorer 130 × 11 = 1 430 − 400 = 1 030 = 2,6x mot 1,4x utan hävstång, nedsidan räntetäckning 2,8 → 2,2 mot covenant 2,5 · MOAT:s fjärde akt: ursprunget — nätverk 45 → 190 förbindelser = 4,2x på 2x, skal 12 → 3 per kund med pris 8: −40 vid tio, +500 vid hundra, varumärke 52 × 5 = 260 hållna löften, grävåren 10/45/90 på 500 = 2/9/18 % ROIC — J-kurvans släkting med öppen horisont). Båda i u2:s egna serier (pe/ib/mt sedan omg 4–6) — noll syskonkollision; EKOSYSTEM-luckan lämnad åt u3 (deras ek-03 landade ocommittat på disk under mitt fönster och bevaras intakt i mina register-ytar — BASF-precedensen). Register ${basAntal}→${mal} atomärt (karta + sökindex + speglar + siffror + llms mönstersträngt 6+4 + larvag-synk GRÖN ${mal}=${mal}=${mal} i EN process, omgång 9:s hårdläxa); FRONT B GRÖN 2/2 med genererade varför-rader (90p nivåmatch ×2, kartordning + försvarsläge + determinism korrekt); KVD _s5u2o11-kvd.mjs: strukturparitet ×2, 26 aritmetikkontroller oberoende omräknade, 24 korslänkar registeräkta, juridikgrind 0 rådsfraser + 0 lagrum i kurstext, språkgrind ren efter 51 egna fel fångade och rättade FÖRE insert (CJK-bokstav, mjuka bindestreck, own hand, marginal of safety, stretch, sammanskrivningar); tsc 0 via projektbinär. Endast data/ + genererad karta + public/ + verktyg/ + worklog; inget bygge (deploy ägs av prod-synken); R2 orörd; data/blogg/ orörd. [fabrik]\n`);
run(`git add ${[...KURSFILER, ...YTOR, medd, "worklog.md", "verktyg/_s5u2o11-frontb.mjs", "verktyg/_s5u2o11-kvd.mjs", "verktyg/_s5u2o11-leverans.mjs", "verktyg/_s5u2o11-sond.mjs"].join(" ")}`);
const commit = run(`git commit -F ${medd}`);
console.log("10.", commit.split("\n")[0]);

// 11. Verifiera HEAD
const h = JSON.parse(run("git show HEAD:public/deep-courses.json"));
const ok = Object.keys(h).length === mal && MINA.every(s => h[s]) && (!ek03 || !!h["ek-03-arbetsflodet-i-labbet"]);
console.log(ok ? `11. HEAD VERIFIERAD: ${mal} kurser, mina två + ${ek03 ? "u3:s ek-03 " : ""}i trädet ✓` : `11. FEL: HEAD oförklarlig (${Object.keys(h).length})`);
process.exit(ok ? 0 : 1);
