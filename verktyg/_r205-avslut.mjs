#!/usr/bin/env node
/** _r205-avslut.mjs — rond 205 (beredskap + U10-underlag) bokföring + commit + push. Kvitto: /tmp/r205-avslut.txt */
import { readFileSync, writeFileSync, appendFileSync, copyFileSync } from "node:fs";
import { spawnSync as sp } from "node:child_process";

const A = "/home/ak1a/agent/ak1";
const P = "/home/ak1a/AK1";
const ut = [];
const run = (cwd, args, tag) => {
  const r = sp("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 240000 });
  ut.push(`[${tag}] exit ${r.status} :: ${(r.stdout || r.stderr || "").trim().split("\n").slice(-2).join(" | ").slice(0, 200)}`);
  return r;
};

const RUBRIK = "## ROND 205 [organ:Φ] — v172-BEREDSKAP VERIFIERAD (mätarens torrörning: exakt r194-finaldom, determinism bevisad) + v173 U10-UNDERLAG (BCE:s egna Spanien/UK-alternativ + Tysklands 1-cellegap) — 2026-09-25";
const RAD =
"BEREDSKAPSROND inför rappfönstret 10-20→11-04: (1) GRANSKNINGSMÄTARENS TORRÖRNING — _r172-granska-utkast.mjs kördes mot hm-b (GRÖN-väntande) och disney (känd GUL trimnotis): båda körningar återger EXAKT r194:s finaldom «71 GRÖN · 5 GUL · 0 RÖD (av 76)» med identiska fem GUL-namn (disney, lvmh, var-energi, vz, wihlborgs) — determinism och verktygshälsa bevisade, inget GUL har regresserat eller självläkt; mallstomme + checklista + r204-kalenderutbyggnad konstaterade i V172-RAPPORTVAG. UTLÖSNINGSPUNKTEN dokumenterad: när CNR:s Q3-tal landar ~10-20 (kalenderns första) skrivs utkast ur mallserien sa-laser-du-*-q3-2026.json → KVD via mätaren → status-rop enligt § 1 — verktygen FRISKA och redo. (2) v173 U10-UNDERLAG åt styrelseronden (BCE-listan tom): tunnaste celler = Tyskland 8 celler à 1 bolag · Frankrike 6 · Japan 4 (material/halso/industri/energi à 1) · Brasilien 5; dokumenterade lediga koordinater utanför BCE-listan = BCE-OMG24:s EGNA alternativ Spanien/kommunikation Cellnex/Redeia + UK/kommunikation BT (alla disk-checkade lediga men kräver P/E-bärarkontroll — TEF/VOD-föregångarna var P/E-döda, alternativen finns listade i §10) samt Kirin 2503.T med sitt dokumenterade normaliseringsvillkor. Godtyckligt val förbjudet — styrelseronden väljer koordinat. R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD väntar kundbeslut; fönstret 10-20→11-04 gör beslutet aktuellt). Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 205")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 205 appendad");
} else ut.push("worklog: SKIPPAD");

// PIPELINE-KO: v173-raden får U10-underlagsnotisen
const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("NÄSTA: ROTATION — BCE-listan tom")) {
  pk = pk.replace(
    "NÄSTA: ROTATION — BCE-listan tom; kandidatsondering per styrelserond ELLER v172-skifte (rappdagar 10-20→11-04, sex av vågens nio bolag i fönstret)",
    "U10-UNDERLAG KLART r205 (BCE:s egna alternativ Cellnex/Redeia Spanien + BT UK — disk-checkade lediga, kräver P/E-bärarkontroll; Tyskland 8 celler à 1; Japan 4 celler à 1) · v172-beredskap verifierad r205 (mätar-torrörning: exakt r194-dom) · utlösare: CNR Q3 ~10-20",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: v173 U10-underlagsnotis");
} else ut.push("PIPELINE-KO: expected-läge ej träffat (lämnad orörd)");

const post = {
  rond: 205, organ: "Φ", ts: Date.now(),
  beslut: "Beredskapsrond: v172-mätarens torrörning återger exakt r194-finaldom (71/5/0, determinism) — verktyg friska inför CNR ~10-20; U10-underlag: BCE:s egna Cellnex/Redeia/BT + Tysklands 8 ett-cellersceller; styrelserond väljer koordinat (godtyckligt val förbjudet). R2: Q3-paketet väntar kund.",
  bevis: "_r205-*-mjs (kvitton /tmp/r205-*) + worklog rond 205 + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda (205)");

const MSG = `studio: [organ:Φ] rond 205 — v172-BEREDSKAP VERIFIERAD: granskningsmätarens torrörning (hm-b GRÖN + disney GUL) återger exakt r194:s finaldom 71 GRÖN · 5 GUL · 0 RÖD med identiska GUL-namn — determinism och verktygshälsa bevisade inför rappfönstret 10-20→11-04; utlösningspunkten dokumenterad (CNR Q3 ~10-20 först: utkast ur mallserien → KVD → status-rop § 1). v173 U10-UNDERLAG: BCE:s egna alternativ Cellnex/Redeia (Spanien) + BT (UK) disk-checkade lediga (kräver P/E-bärarkontroll — TEF/VOD var döda), Tyskland 8 celler à 1, Japan 4 celler à 1; styrelseronden väljer koordinat. R2-påminnelsen kvarstår. Ren dataleverans — src orörd.`;
writeFileSync("verktyg/_r205-commitmsg.txt", MSG);
run(A, ["add", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r205-v172-torroring.mjs", "verktyg/_r205-v172-torroring2.mjs", "verktyg/_r205-u10-underlag.mjs", "verktyg/_r205-avslut.mjs", "verktyg/_r205-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r205-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r205-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
let pu = run(A, ["push", "prod", "develop"], "push-1");
if (pu.status !== 0) {
  const st = run(P, ["status", "--porcelain"], "prod-status");
  const mFiler = (st.stdout || "").split("\n").filter((r) => r.startsWith(" M")).map((r) => r.slice(3).trim());
  for (const FIL of mFiler) {
    const head = sp("git", ["-C", P, "show", `HEAD:${FIL}`], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const disk = readFileSync(`${P}/${FIL}`, "utf8");
    ut.push(`${FIL}: ren-append ${disk.startsWith(head.stdout)}`);
    copyFileSync(`${P}/${FIL}`, `${A}/${FIL}`);
    run(P, ["checkout", "--", FIL], "prod-checkout");
  }
  run(A, ["add", ...mFiler], "add-adoptioner");
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 205 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}
if (pu.status === 0) {
  run(A, ["log", "--oneline", "-1"], "HEAD");
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r205-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
