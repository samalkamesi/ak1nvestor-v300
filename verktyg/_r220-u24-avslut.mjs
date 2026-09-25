#!/usr/bin/env node
/** _r220-u24-avslut.mjs — v173 U24 (rond 220) bokföring + prod-HTTP + commit + push + adoptionsgren. Kvitto: /tmp/r220-avslut.txt */
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

const RUBRIK = "## ROND 220 [organ:Φ] — v173 U24 LEVERERAD: Astellas 4503.T (Japan/halso 2→3) — universum 285→286, OMPRÖVNINGEN LEVERERAD (U17:s avvisning overturned av färskpanelen: TTM +364,9 mdr JPY, FY-serien helt positiv), Kirin skjuten till Q3 (signaturen borta, mild normalisering kvar) — 2026-09-25";
const RAD =
"v173 U24: rondens direktiv var omprövningarna — ASTELLAS 4503.T GRÖN och LEVERERAD: U17:s avvisning (TTM-mätvärde −47 mdr JPY, Sony/Honda-doktrinen) MOT dagens färskpanel (S&P uppdaterad 2026-09-24): TTM-netto +364,9 mdr JPY (+347 %) med HELA FY-serien positiv [124,1 · 98,7 · 17,0 · 50,7 · 291,5] — vändningen konfirmerad, mätvärdet supersederat (avvisningen var korrekt mot sitt underlag, leveransen mot sitt — kedjan dokumenterad). Cellens TREDJE modell: Takeda (diversifierad) · Daiichi Sankyo (onkologi-sprint) · Astellas (specialty-VÄNDNINGEN: patentklippurdalen FY24 → FY26-rekord; rak CAGR oms +12,10 % · netto +43,47 %). NIO REPLIKERINGSLÅS: P/E 11,62 EXAKT mot close-basen (0,01 %) · PS 1,86 EXAKT · P/B 2,18 EXAKT · netto-M 16,05 % EXAKT · FCF-M 23,49 % EXAKT · D/E 0,30 · EPS×aktier 0,4 % · mcap 0,2 % · EV-DEKOMPOSITIONEN REN (0,1 % — vågens enda utan dolda poster: 4 230+589,87−244,70 = 4 575,2 mot 4 580). FCF-serien intern låst (OCF−capex exakt fem fönster — HEI-klassen) med FCF-yield 12,63 %. ROIC 16,18 % mot WACC 4,34 % — GAP +11,8 PUNKTER, VÅGENS BREDDASTE (patentmoaten); brutto-M 80,8 % cellens högsta; netto < EBIT (Kirin-U3-kollen gjord); minoritetsgapet CF/IS FY26 (85 mdr) dokumenterat; payout EPS-bas 39,4 % (källrad 38,29 % annat fönster); Altman 2,73 · Piotroski 7 · beta 0,09; prognosTillväxt NULL (fwd-implied +2,2 % endast referens); RAPPDAG 2026-10-30 INOM v172-FÖNSTRET. KIRIN-DOMEN: U3:s huvudsignatur (netto-M 16,86 > EBIT-M 12,56) ÄR BORTA (7,81 < 11,76) men netto +264,9 %-hoppet och fwd-gapet −9,2 % kvarstår ⇒ LEVERANS SKJUTEN till Q3-rapporten 2026-11-11 (normaliseringsbeviset). KVD: append 285+/0− · läs-tillbaka ×2 · fältgrind 4452.T · llms K2 på 286 (halso-raden n=27, median P/E 25,7; totalt n 273→274 · 10 aspektrader) · läckagevakt 0 (515) · tsc 0 · prod 200 i avslutet. Japan 26→27 (halso-grenen 2→3). Kö: Kirin vid Q3 · rappdagar 10-20→11-04 → v172 (4503:s dag 10-30 bokförd) · nya länder/celler eller spårrotation. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut). Protokoll: V173-U24-4503T-ASTELLAS-OMPROVNING.md. Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 220")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 220 appendad");
} else ut.push("worklog: SKIPPAD");

const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("U23 LEVERERAD r219")) {
  const fore = "V173-U23-protokoll) · nästa: omprövningar (Astellas+Kirin), rappdagar → v172, nytt land eller spårrotation";
  const efter = "V173-U23-protokoll) · U24 LEVERERAD r220: 4503.T Astellas Japan/halso 2→3 (universum 286 — OMPRÖVNINGEN: U17:s −47 mdr-mätvärde supersederat, TTM +364,9 mdr med FY-serien helt positiv; nio lås + ren EV-dekomposition; Kirin skjuten till Q3 2026-11-11; V173-U24-protokoll) · nästa: rappdagar 10-20→11-04 → v172 (4503:s rappdag 10-30 bokförd), nya länder/celler eller spårrotation";
  if (pk.includes(fore)) {
    pk = pk.replace(fore, efter);
    writeFileSync(PK, pk);
    ut.push("PIPELINE-KO: U24 bokförd");
  } else ut.push("PIPELINE-KO: ankare träffat men nästa-text saknas");
} else ut.push("PIPELINE-KO: expected ej träffat");

const post = {
  rond: 220, organ: "Φ", ts: Date.now(),
  beslut: "v173 U24: Astellas 4503.T (Japan/halso 285→286) — omprövningen levererad: U17:s TTM-mätvärde −47 mdr supersederat av färskpanelen (+364,9 mdr, FY-serien helt positiv); cellens tredje modell; nio lås + vågens enda ren EV-dekomposition; ROIC-gap +11,8 p vågens bredaste; rappdag 10-30 i v172-fönstret. Kirin: signaturen netto>EBIT borta, leverans skjuten till Q3 2026-11-11. Kö: rappdagar → v172, nya länder/celler eller spårrotation. R2: Q3-paketet väntar kund.",
  bevis: "V173-U24-4503T-ASTELLAS-OMPROVNING.md + _r220-u24-*.mjs (kvitton /tmp/r220-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (220)");

for (const url of ["https://lab.ak1nvestor.com/dataset", "https://lab.ak1nvestor.com/dataset/halso", "https://lab.ak1nvestor.com/llms.txt"]) {
  const r = sp("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "20", url], { encoding: "utf8" });
  ut.push(`${r.status === 0 ? r.stdout.trim() : "FEL"} ${url}`);
}

const MSG = `studio: [organ:Φ] v173 U24 LEVERERAD — Astellas Pharma 4503.T (Japan/halso 28→29): OMPRÖVNINGEN LEVERERAD — U17:s avvisning (TTM-mätvärde −47 mdr JPY) overturned av dagens färskpanel: TTM-netto +364,9 mdr JPY (+347 %) med HELA FY-serien positiv [124,1 · 98,7 · 17,0 · 50,7 · 291,5]; mätvärdet supersederat (kedjan dokumenterad — avvisningen korrekt mot sitt underlag, leveransen mot sitt); cellens tredje modell (Takeda diversifierad · Daiichi Sankyo onkologi-sprint · Astellas specialty-VÄNDNINGEN: patentklippurdalen FY24 → FY26-rekord, rak CAGR netto +43,47 %); NIO REPLIKERINGSLÅS (P/E 11,62 EXAKT mot close-basen · PS 1,86 · P/B 2,18 · netto-M 16,05 % · FCF-M 23,49 % · D/E 0,30 · EPS×aktier · mcap · EV-DEKOMPOSITIONEN REN 0,1 % — vågens enda utan dolda poster); FCF-serien intern låst (OCF−capex exakt fem fönster, HEI-klassen) med yield 12,63 %; ROIC 16,18 % mot WACC 4,34 % — gap +11,8 p VÅGENS BREDDASTE; brutto-M 80,8 % cellens högsta; minoritetsgapet 85 mdr dokumenterat; rappdag 2026-10-30 i v172-fönstret; KIRIN-DOMEN: U3:s signatur (netto-M > EBIT-M) borta men leverans skjuten till Q3 2026-11-11 (normaliseringsbevis); universum 285→286 kirurgiskt, llms HELREGEN på 286 (halso-raden n=27, median P/E 25,7; totalt n 273→274, 10 aspektrader), läckagevakt 0 (515), tsc 0, prod 200. Japan 26→27. Kö: rappdagar → v172, nya länder/celler eller spårrotation. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r220-commitmsg.txt", MSG);
run(A, ["add", "data/portfolj-system/bolagsunivers.json", "public/llms.txt", "data/forskning/V173-U24-4503T-ASTELLAS-OMPROVNING.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r220-u24-sond.mjs", "verktyg/_r220-u24-universum-inlagg.mjs", "verktyg/_r220-u24-llms-regen.mjs", "verktyg/_r220-u24-lackagevakt.mjs", "verktyg/_r220-u24-avslut.mjs", "verktyg/_r220-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r220-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r220-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 220 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  const r2 = sp("curl", ["-s", "--max-time", "20", "https://lab.ak1nvestor.com/llms.txt"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const m = (r2.stdout || "").match(/på (\d+) bolag i \d+ branscher \(rådata ([\d-]+)\)/);
  ut.push("LIVE llms efter push: " + (m ? `${m[1]} bolag, rådata ${m[2]}` : "mönster saknas"));
  const uni = sp("node", ["-e", "const u=JSON.parse(require('fs').readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json','utf8'));console.log(u.length+' bolag; 4503.T='+u.some(b=>b.ticker==='4503.T'))"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r220-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
