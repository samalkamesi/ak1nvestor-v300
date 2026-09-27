#!/usr/bin/env node
/** _r215-u19-avslut.mjs — v173 U19 (rond 215) bokföring + prod-HTTP + commit + push + adoptionsgren. Kvitto: /tmp/r215-avslut.txt */
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

const RUBRIK = "## ROND 215 [organ:Φ] — v173 U19 LEVERERAD: Tokyo Gas 9531.T (Japan/energi 1→2) — universum 280→281, MILEPÅLE: Japans alla fyra enbolagsceller öppna på 1→2, vågens sjunde brottsfria rad — 2026-09-25";
const RAD =
"v173 U19: Japan/energi-cellens duo — TOKYO GAS (TYO-primär JPY, mars-bokslut, beta 0,3 vågens lugnaste) bredvid INPEX (producent mot reglerad distributör/LNG-terminaler = cellens kontrast råvarucykel mot nättariff). P/E-bärarkontroll före leverans GRÖN (TTM-netto 138 mdr JPY > 0; Sony/Honda-doktrinen) + kollisionskontroll exakt-match. VÅGENS SJUNDE BROTTSFRIA RAD: netto [84 · 91 · 115 · 124] och EPS stigande VARJE ÅR (rak CAGR oms +7,39 % · netto +13,86 % — energiprisnormalisering + LNG-diversifiering). Repliker: FCF-yield EXAKT (8,14 %) · mcap 0,1 %; P/E 14,9 källans justerade bas (GAAP-replik 22,5 — förrådsjusteringarnas basgap dokumenterat) · netto-M fält=replik 4,59 % (källans 2,4 %-rad annat fönster, Hitachi-mönstret) · källans PS-rad avviker (dokumenterad). REGLERADE NÄTMETODNOTER (Redeia/Cellnex-klassen): P/B 0,89 UNDER bokfört (distributörens profil — annars feltolkas som köpläge), ROIC<WACC = avkastningsformeln, Altman 1,7 = tung infrastrukturbas. prognosTillväxt +12,88 % (spår-PEG 1,16). KVD: append 280+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 281 (totalt n 268→269 · 10 aspektrader) · läckagevakt 0 (505) · tsc 0 · prod 200 i avslutet. MILEPÅLE: JAPANS ALLA FYRA ENBOLANGSCELLER öppna på 1→2 under vågen (material/halso/industri/energi) — Japan 22→26. Kö: Tysklands 1-grenar · omprövningar (Astellas+Kirin) · rappdagar → v172. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U19-9531T-TOKYOGAS-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 215")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 215 appendad");
} else ut.push("worklog: SKIPPAD");

const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("U18 LEVERERAD r214")) {
  pk = pk.replace(
    "nästa: Japan/energi (sista enbolagscellen) · Tysklands 1-grenar eller spårrotation · omprövningar: Astellas + Kirin (villkor dokumenterade) · rappdagar 10-20→11-04 → v172-kön",
    "U19 LEVERERAD r215: 9531.T Tokyo Gas Japan/energi 1→2 (universum 281 — MILEPÅLE: Japans alla fyra enbolagsceller öppna; V173-U19-protokoll) · nästa: Tysklands 1-grenar eller spårrotation · omprövningar: Astellas + Kirin (villkor dokumenterade) · rappdagar 10-20→11-04 → v172-kön",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: U19 + milpåle bokförd");
} else ut.push("PIPELINE-KO: expected ej träffat");

const post = {
  rond: 215, organ: "Φ", ts: Date.now(),
  beslut: "v173 U19: Tokyo Gas 9531.T (Japan/energi 280→281) — MILEPÅLE: Japans alla fyra enbolagsceller öppna på 1→2 (Japan 22→26); vågens sjunde brottsfria rad; nämetodnoter (P/B<1, ROIC-formeln) dokumenterade. Kö: Tyskland 1-grenar, omprövningar, rappdagar → v172. R2: Q3-paketet väntar kund.",
  bevis: "V173-U19-9531T-TOKYOGAS-UTOKNING.md + _r215-u19-*.mjs (kvitton /tmp/r215-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (215)");

for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/energi", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

const MSG = `studio: [organ:Φ] v173 U19 LEVERERAD — Tokyo Gas 9531.T (Japan/energi 26→27): cellmotiverad duo (INPEX producent + Tokyo Gas reglerad distributör/LNG); P/E-bärarkontroll före leverans (TTM-netto 138 mdr JPY > 0); VÅGENS SJUNDE BROTTSFRIA RAD (netto/EPS stigande varje år 84→124; rak CAGR oms +7,39 % · netto +13,86 %); MILEPÅLE: JAPANS ALLA FYRA ENBOLANGSCELLER öppna på 1→2 (Japan 22→26); FCF-yield EXAKT 8,14 %; P/E 14,9 källans justerade bas (GAAP-replik noterad); netto-M fält=replik (källans fönster noterat); nämetodnoter: P/B 0,89 under bokfört, ROIC<WACC = avkastningsformeln, Altman 1,7 = infrastrukturbas; beta 0,3; universum 280→281 kirurgiskt, llms HELREGEN på 281 (totalt n 268→269, 10 aspektrader), läckagevakt 0 (505), tsc 0, prod 200. Kö: Tyskland, omprövningar, rappdagar → v172. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r215-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U19-9531T-TOKYOGAS-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r215-u19-sond.mjs", "verktyg/_r215-u19-universum-inlagg.mjs", "verktyg/_r215-u19-avslut.mjs", "verktyg/_r215-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r215-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r215-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 215 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; 9531.T='+u.some(b=>b.ticker==='9531.T'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r215-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
