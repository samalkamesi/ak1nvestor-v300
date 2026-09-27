#!/usr/bin/env node
/** _r206-u10-avslut.mjs — v173 U10 (rond 206) bokföring + prod-HTTP + commit + push + adoptionsgren. Kvitto: /tmp/r206-avslut.txt */
import { readFileSync, writeFileSync, appendFileSync, copyFileSync } from "node:fs";
import { spawnSync as sp } from "node:child_process";

const A = "/home/ak1a/agent/ak1";
const P = "/home/ak1a/AK1";
const ut = [];
const run = (cwd, args, tag) => {
  const r = sp("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 240000 });
  ut.push(`[${tag}] exit ${r.status} :: ${(r.stdout || r.stderr || "").trim().split("\n").slice(-2).join(" | ").slice(0, 220)}`);
  return r;
};

const RUBRIK = "## ROND 206 [organ:Φ] — v173 U10 LEVERERAD: Cellnex CLN.MC (Spanien/kommunikation 0→1) — universum 271→272, vändningsbrottet dokumenterat, CAGR-nullen som fältvakt — 2026-09-25";
const RAD =
"v173 U10: styrelserondens koordinatval enligt r205-underlaget — BCE-OMG24 §10:s EGNA Spanien-alternativ förstanamn CELLNEX (BME-primär EUR): P/E-bärarkontroll före leverans GRÖN på doktrinens TTM-villkor (netto +518 M EUR > 0 — källvändningen som protokollet förutsade: TEF/VOD förblev P/E-döda men alternativet levde) + kollisionskontroll exakt-match (även REE.MC/BT.L kontrollerade — kvar som dokumenterade koordinater). VÄNDNINGSBROTTET FY2025 är rundens kärna: netto-serien [−855 · −956 · −1 004 · +350] (tre goodwill-nedskrivningsår ⇒ första positiva) med TTM-momentum ⇒ P/E-BÄRARNS ÅTSKILLNAD: P/E bär (TTM>0) men SERIENS negativa basår gör netto-CAGR ODEFINIERBAR ⇒ resultatCAGR5ar NULL med vändningsdokumentation — doktrinen som FÄLTVAKT, inte bara leveransvakt; fältet återtas vid konsekutiv positiv bas. omsCAGR rak +6,94 % organisk. Repliker: netto-M EXAKT · PS EXAKT · FCF-yield EXAKT · mcap 0,2 %; P/E 21,96 källans JUSTERADE bas (nedskrivningarna är historiken — GAAP-replik 27,75 dokumenterad). TORNBOLAGSMETODNOTEN: D/E 3,69 + Altman 1,01 djup varningszon + ROIC 3,87 % under WACC — affärsmodellen (platskontrakt binder kassaflödet som finansierar skuldbygget; ROIC missvisande) redovisas öppet; brutto 91,73 % tjänstestruktur. prognosTillväxt +31,65 % (vändningens normalisering; spår-PEG 0,69); nyemissioner 2 (2020-21-höjningarna). KVD: append 271+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 272 (kommunikation P75 26→25,4 n 24→25 · totalt n 259→260 · 10 aspektrader) · läckagevakt 0 (487) · tsc 0 · prod 200 i avslutet. Spanien 3→4 (landets fjärde gren). Kö: Redeia/BT (kvarvarande koordinater) · Cellnex-rappdag Q3 i v172-kön vid nästa kalenderberöring. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U10-CLN-CELLNEX-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 206")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 206 appendad");
} else ut.push("worklog: SKIPPAD");

const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("U10-UNDERLAG KLART r205")) {
  pk = pk.replace(
    "U10-UNDERLAG KLART r205 (BCE:s egna alternativ Cellnex/Redeia Spanien + BT UK — disk-checkade lediga, kräver P/E-bärarkontroll; Tyskland 8 celler à 1; Japan 4 celler à 1) · v172-beredskap verifierad r205 (mätar-torrörning: exakt r194-dom) · utlösare: CNR Q3 ~10-20",
    "U10 LEVERERAD r206: Cellnex CLN.MC Spanien/kommunikation 0→1 (universum 271→272, CAGR-null vid vändningsserie, tornbolagsmetodnot; V173-U10-protokoll) · kvarvarande koordinater: Redeia REE.MC · BT.L · Tyskland 8 celler à 1 · Japan 4 celler à 1 · v172-beredskap verifierad r205 · utlösare: CNR Q3 ~10-20",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: U10-leverans bokförd");
} else ut.push("PIPELINE-KO: expected-läge ej träffat");

const post = {
  rond: 206, organ: "Φ", ts: Date.now(),
  beslut: "v173 U10: Cellnex CLN.MC (Spanien/kommunikation 271→272) — BCE:s eget Spanien-alternativ; P/E-bärare på TTM-villkoret men CAGR NULL på vändningsserien (doktrinen som fältvakt); tornbolagsmetodnot (Altman 1,01/D&E 3,69 öppet). Kö: Redeia/BT, Cellnex-rappdag → v172. R2: Q3-paketet väntar kund.",
  bevis: "V173-U10-CLN-CELLNEX-UTOKNING.md + _r206-u10-*.mjs (kvitton /tmp/r206-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (206)");

for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/kommunikation", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

const MSG = `studio: [organ:Φ] v173 U10 LEVERERAD — Cellnex Telecom CLN.MC (Spanien/kommunikation 26→27): BCE-OMG24 §10:s egna Spanien-alternativ (källvändningen skedde: TTM-netto +518 M EUR > 0); VÄNDNINGSBROTT FY2025 dokumenterat (netto −855/−956/−1 004/+350) ⇒ P/E bär men resultatCAGR NULL (negativa basår — Sony/Honda-aritmetiken som FÄLTVAKT; återtas vid konsekutiv positiv bas); omsCAGR +6,94 % organisk; P/E 21,96 på källans justerade bas (GAAP-replik 27,75 dokumenterad); TORNBOLAGSMETODNOT: D/E 3,69 + Altman 1,01 + ROIC<WACC som datafakta (platskontrakten binder kassaflödet); repliker EXAKTA (netto-M, PS, FCF-yield); universum 271→272 kirurgiskt, llms HELREGEN på 272 (kommunikation P75 26→25,4, totalt n 259→260, 10 aspektrader), läckagevakt 0 (487), tsc 0, prod 200. Spanien 3→4. Kö: Redeia/BT, rappdagar → v172. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r206-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U10-CLN-CELLNEX-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r206-u10-sond.mjs", "verktyg/_r206-u10-universum-inlagg.mjs", "verktyg/_r206-u10-avslut.mjs", "verktyg/_r206-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r206-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r206-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
let pu = run(A, ["push", "prod", "develop"], "push-1");
if (pu.status !== 0) {
  ut.push("PUSH-1 avvisad — adoptiongren");
  const st = run(P, ["status", "--porcelain"], "prod-status");
  const mFiler = (st.stdout || "").split("\n").filter((r) => r.startsWith(" M")).map((r) => r.slice(3).trim());
  for (const FIL of mFiler) {
    const head = sp("git", ["-C", P, "show", `HEAD:${FIL}`], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const disk = readFileSync(`${P}/${FIL}`, "utf8");
    ut.push(`${FIL}: ren-append ${disk.startsWith(head.stdout)} (+${disk.length - head.stdout.length})`);
    copyFileSync(`${P}/${FIL}`, `${A}/${FIL}`);
    run(P, ["checkout", "--", FIL], "prod-checkout");
  }
  run(A, ["add", ...mFiler], "add-adoptioner");
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 206 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; CLN.MC='+u.some(b=>b.ticker==='CLN.MC'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r206-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
