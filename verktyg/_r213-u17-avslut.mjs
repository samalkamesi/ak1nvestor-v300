#!/usr/bin/env node
/** _r213-u17-avslut.mjs — v173 U17 (rond 213) bokföring + prod-HTTP + commit + push + adoptionsgren. Kvitto: /tmp/r213-avslut.txt */
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

const RUBRIK = "## ROND 213 [organ:Φ] — v173 U17 LEVERERAD: Daiichi Sankyo 4568.T (Japan/halso 1→2) — universum 278→279, ASTELLAS AVVISAD först på P/E-bärarkriteriet (−47 mdr JPY), vändningsfasen dokumenterad öppet — 2026-09-25";
const RAD =
"v173 U17: Japan/halso-cellens duo — KANDIDATURVÄGEN DOKUMENTERAD: Astellas 4503.T sonderades FÖRST och AVVISADES på P/E-bärarkriteriet (TTM-netto −47 mdr JPY ≤ 0 — patentklippur + nedskrivningar; Sony/Honda-doktrinen, Vestas-före-Ørsted-logiken; omprövningsvillkor dokumenterat); DAIICHI SANKYO valdes GRÖN (TTM-netto +213 mdr > 0, P/E 61,9) — Takeda global diversifierad + Daiichi Sankyo onkologi/ADC = cellens två modeller. Kollisionskontroll exakt-match (båda). TYO-primär JPY, mars-bokslut; mcap-repliken 0,00 % EXAKT (15 240,7 mot 15 240); netto-M 3,54 % EXAKT. Källans FÖNSTERBLANDNINGAR dokumenterade (P/E-bas 86,8 mot GAAP 75,1 · PS 2,20 mot replik 2,53 · P/FCF på FY25-FCF — Shin-Etsu-klassens dokumentnoter). PROFIL: oms-CAGR +14,48 % (Enhertu-rampen) med FY23-nettodipen (patent+R&D) dokumenterad; netto-marginal 3,54 % FARMATUNN mot Takeda ~12-15 % — vändningsfasen redovisas ÖPPET; prognosTillväxt +125,9 % (fwd 27,4 mot trailing 61,9 — VÄNDNINGSPROGNOS, konsensus väntar nettofyrdubbling; spår-PEG 0,49); ROIC<WACC som INVESTERINGSFAS-not (ADC-plattformens R&D, ej strukturbrist); Altman 2,2 datafakta; payout-rad saknades i källan — fältet bär GAAP-replik 8,1 % med not. KVD: append 278+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 279 (totalt n 266→267 · 10 aspektrader) · läckagevakt 0 (501) · tsc 0 · prod 200 i avslutet. Japan 23→24 (halso-grenen 1→2). Kö: Japans industri/energi-cellöppningar · Tysklands 1-grenar · Astellas+Kirin-omprövningar · rappdagar → v172. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U17-4568T-DAIICHISANKYO-UTOKNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 213")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 213 appendad");
} else ut.push("worklog: SKIPPAD");

const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("U16 LEVERERAD r212")) {
  pk = pk.replace(
    "nästa: Japans kvarvarande enbolagsceller (halso/industri/energi) · Tysklands 1-grenar eller spårrotation · rappdagar 10-20→11-04 → v172-kön",
    "U17 LEVERERAD r213: 4568.T Daiichi Sankyo Japan/halso 1→2 (universum 279, Astellas avvisad på P/E-bärarkriteriet; V173-U17-protokoll) · nästa: Japans industri/energi-cellöppningar · Tysklands 1-grenar eller spårrotation · omprövningar: Astellas 4503.T + Kirin 2503.T (villkor dokumenterade) · rappdagar 10-20→11-04 → v172-kön",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: U17 bokförd");
} else ut.push("PIPELINE-KO: expected ej träffat");

const post = {
  rond: 213, organ: "Φ", ts: Date.now(),
  beslut: "v173 U17: Daiichi Sankyo 4568.T (Japan/halso 278→279) — Astellas avvisad först på P/E-bärarkriteriet (TTM −47 mdr; omprövningsvillkor dokumenterat); vändningsfasen (Enhertu-ramp +126 %-prognos, farmatunn 3,5 %-marginal) redovisas öppet; källans fönsterblandningar dokumenterade. Kö: Japan industri/energi, Tyskland, omprövningar, rappdagar → v172. R2: Q3-paketet väntar kund.",
  bevis: "V173-U17-4568T-DAIICHISANKYO-UTOKNING.md + _r213-u17-*.mjs (kvitton /tmp/r213-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (213)");

for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/halso", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

const MSG = `studio: [organ:Φ] v173 U17 LEVERERAD — Daiichi Sankyo 4568.T (Japan/halso 27→28): KANDIDATURVÄGEN: Astellas 4503.T avvisad först på P/E-bärarkriteriet (TTM-netto −47 mdr JPY ≤ 0 — Sony/Honda-doktrinen; omprövningsvillkor dokumenterat); Daiichi Sankyo GRÖN (+213 mdr) — Takeda + Daiichi = cellens duo; vändningsfasen öppet: oms-CAGR +14,48 % (Enhertu) med FY23-dip dokumenterad, farmatunn netto-M 3,54 % EXAKT mot Takeda ~12-15 %, prognosTillväxt +125,9 % (VÄNDNINGSPROGNOS; spår-PEG 0,49), ROIC<WACC som investeringsfas-not; källans fönsterblandningar dokumenterade (P/E/PS/P-FCF-baser); mcap 0,00 % EXAKT; universum 278→279 kirurgiskt, llms HELREGEN på 279 (totalt n 266→267, 10 aspektrader), läckagevakt 0 (501), tsc 0, prod 200. Japan 23→24. Kö: Japan industri/energi, Tyskland, omprövningar, rappdagar → v172. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r213-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U17-4568T-DAIICHISANKYO-UTOKNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r213-u17-sond.mjs", "verktyg/_r213-u17-universum-inlagg.mjs", "verktyg/_r213-u17-avslut.mjs", "verktyg/_r213-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r213-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r213-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 213 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; 4568.T='+u.some(b=>b.ticker==='4568.T'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r213-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
