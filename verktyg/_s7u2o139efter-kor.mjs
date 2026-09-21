#!/usr/bin/env node
/**
 * AK1A — o139-EFTER-körare (SPÅR 7 — u2:s vakarövertag DEL 2, u3:s recept).
 *
 * Förutsättning: prod-synken har DEPLOYAT en commit med e27ef394 som
 * förfader. Skriptet verifierar det FÖRST (spökmätningsskyddet — o139 §8
 * DEL 1) och kör sedan hela EFTER-paketet sekventiellt:
 *   0) deploy-rad + merge-base-kontroll
 *   1) prod 200 ×2 (/superanalys + /kalkylator)
 *   2) kanalbevis: kurens CSS-signaturer i serverad chunk
 *   3) ISR-värmning ×3/sida + settle
 *   4) Lighthouse-EFTER (kanoniskt verktyg, LH_JAMFOR=o139-fore)
 *   5) geometri + skroll-CLS (o139 §7.3)
 *   6) mätdom mot o139 §7.2-kriterierna
 *
 * Användning: node verktyg/_s7u2o139efter-kor.mjs
 * Utdata: data/forskning/OPTIMERING/lighthouse/kanalbevis-s7u2o139efter.json
 *         + dom-s7u2o139efter.json (+ LH/geo-verktygens egna filer)
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROT = "/home/ak1a/AK1";
const SYNKLOGG = join(ROT, "data/vakten/prod-synk.log");
const LH_KAT = join(ROT, "data/forskning/OPTIMERING/lighthouse");
const KUR_COMMIT = "e27ef394";
const RAPPORT = { steg: [], datum: new Date().toISOString() };
const logga = (s) => { console.log(s); RAPPORT.steg.push(s); };

// ── Steg 0: deploy-kontroll (spökmätningsskydd) ────────────────────────────
const deployRader = readFileSync(SYNKLOGG, "utf8").split("\n").filter((r) => r.includes("DEPLOYAD automatiskt"));
const senaste = deployRader[deployRader.length - 1] ?? "";
const hash = (senaste.match(/\(([0-9a-f]{8})\)/) ?? [])[1];
if (!hash) { console.error("STEG 0 FEL: ingen DEPLOYAD-rad — avbryter (spökmätningsskydd)."); process.exit(2); }
let forefar = false;
try { execFileSync("git", ["merge-base", "--is-ancestor", KUR_COMMIT, hash], { cwd: ROT }); forefar = true; } catch { /* ej förfader */ }
logga(`STEG 0 deploy: ${senaste.trim()} — e27ef394 förfader: ${forefar ? "JA" : "NEJ"}`);
if (!forefar) { writeFileSync(join(LH_KAT, "dom-s7u2o139efter.json"), JSON.stringify({ ...RAPPORT, abort: "deploy utan kur-förfader" }, null, 2)); process.exit(3); }

// ── Steg 1: prod 200 ×2 ────────────────────────────────────────────────────
const prodStatus = {};
for (const sida of ["/superanalys", "/kalkylator"]) {
  const svar = await fetch(`https://lab.ak1nvestor.com${sida}`, { redirect: "manual" });
  prodStatus[sida] = svar.status;
}
logga(`STEG 1 prod 200 ×2: /superanalys=${prodStatus["/superanalys"]} /kalkylator=${prodStatus["/kalkylator"]}`);
if (Object.values(prodStatus).some((k) => k !== 200)) { console.error("STEG 1 FEL: prod ej 200."); process.exit(4); }

// ── Steg 2: kanalbevis (CSS-signatur i serverad chunk) ─────────────────────
const html = await (await fetch("http://localhost:3000/superanalys")).text();
const cssRefs = [...new Set([...html.matchAll(/\/_next\/static\/[^"']+\.css/g)].map((m) => m[0]))];
const kanal = { cssRefs, träffar: {} };
for (const ref of cssRefs) {
  const css = await (await fetch(`http://localhost:3000${ref}`)).text();
  for (const signatur of ["cv-widget-super", "cv-widget-kalk", "content-visibility:auto", "contain-intrinsic-size"]) {
    if (css.includes(signatur)) kanal.träffar[signatur] = (kanal.träffar[signatur] ?? 0) + css.split(signatur).length - 1;
  }
}
writeFileSync(join(LH_KAT, "kanalbevis-s7u2o139efter.json"), JSON.stringify({ datum: new Date().toISOString(), ...kanal }, null, 2));
logga(`STEG 2 kanalbevis: ${cssRefs.length} CSS-chunkar · träffar ${JSON.stringify(kanal.träffar)}`);
if (!kanal.träffar["cv-widget-super"] || !kanal.träffar["cv-widget-kalk"]) { console.error("STEG 2 FEL: kurens signaturer saknas i serverad CSS."); process.exit(5); }

// ── Steg 3: ISR-värmning (FÖRE-mätningen var mot varm app — symmetri) ──────
for (let i = 0; i < 3; i++) for (const sida of ["/superanalys", "/kalkylator"]) await fetch(`http://localhost:3000${sida}`);
await new Promise((r) => setTimeout(r, 15000));
logga("STEG 3 värmning: 3 hämtningar/sida + 15 s settle");

// ── Steg 4: Lighthouse-EFTER (kanoniskt) ───────────────────────────────────
execFileSync("node", [join(ROT, "verktyg/prestanda-lighthouse.mjs"), "o139-efter", "/superanalys", "/kalkylator"], {
  cwd: ROT, stdio: "inherit", env: { ...process.env, LH_JAMFOR: "o139-fore" }, timeout: 420_000,
});
logga("STEG 4 Lighthouse-EFTER klar (o139-efter-sammanfattning.json)");

// ── Steg 5: geometri + skroll-CLS ──────────────────────────────────────────
execFileSync("node", [join(ROT, "verktyg/_s7u2o139efter-geometri.mjs")], { cwd: ROT, stdio: "inherit", timeout: 180_000 });
logga("STEG 5 geometri + skroll-CLS klar (geometri-s7u2o139efter.json)");

// ── Steg 6: mätdom (o139 §7.2) ─────────────────────────────────────────────
const las = (namn) => JSON.parse(readFileSync(join(LH_KAT, `${namn}-sammanfattning.json`), "utf8"));
const fore = Object.fromEntries(las("o139-fore").sidor.map((s) => [s.sokvag, s]));
const efter = Object.fromEntries(las("o139-efter").sidor.map((s) => [s.sokvag, s]));
const dom = [];
for (const sida of ["/superanalys", "/kalkylator"]) {
  const f = fore[sida], e = efter[sida];
  if (!f?.karnmattMs || !e?.karnmattMs) { dom.push({ sida, fel: "saknas mätning" }); continue; }
  const lcpDelta = Math.abs(e.karnmattMs.LCP - f.karnmattMs.LCP) / f.karnmattMs.LCP;
  dom.push({
    sida,
    poangFore: Math.round(f.poang.prestanda * 100), poangEfter: Math.round(e.poang.prestanda * 100),
    lcpFore: f.karnmattMs.LCP, lcpEfter: e.karnmattMs.LCP, lcpDeltaProc: Math.round(lcpDelta * 1000) / 10,
    tbtFore: f.karnmattMs.TBT, tbtEfter: e.karnmattMs.TBT,
    clsEfter: e.karnmattMs.CLS,
    kriterier: {
      clsNoll: e.karnmattMs.CLS === 0,
      lcpInom15: lcpDelta <= 0.15,
      tbtKalkylatorUnder450: sida !== "/kalkylator" || e.karnmattMs.TBT <= 450,
    },
  });
}
writeFileSync(join(LH_KAT, "dom-s7u2o139efter.json"), JSON.stringify({ ...RAPPORT, dom }, null, 2));
console.log("STEG 6 dom:\n" + JSON.stringify(dom, null, 2));
