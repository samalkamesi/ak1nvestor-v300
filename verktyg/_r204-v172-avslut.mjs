#!/usr/bin/env node
/**
 * _r204-v172-avslut.mjs — rond 204 (v172-skiftet) bokföring + commit + push.
 * Kvitto: /tmp/r204-avslut.txt
 */
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

// 1. V172-RAPPORTVAG.md — notis
const NOTIS = `

## Kalenderutbyggnad rond 204 (2026-09-25) — v173-vågens bolag in i kalendrarna

Rotationsbeslut: BCE-kö-notislistan tom (v173 U1–U9 komplett) ⇒ skifte till v172 med
kalenderutbyggnaden: 100→110 bolag (kommunikation +3: RCI-B 10-22 est. · TMUS 10-22 est. ·
TELUS nov est.; industri +2: CNR 10-20 est. — fönstrets första · CP 10-28 est.; material +3:
NTR 11-04 est. · AEM sen-okt est. · ABX tidig-nov est.; konsument +1: 4661.T 10-29 Q2 FY2027;
teknik +1: 6752.T 10-30 Q2 FY2027). Rappdagarna källbelagda ur de färska panelhämtningarna
2026-09-25 (Est. Earnings-rader); ESTIMERADE datum märks est. — exakt dag ej påhittad där
panelen saknade den (AEM/ABX/TELUS bär fönsterform). Utkastmönstret: nya utkast skrivs när
rappdagarna passerar och Q3-tal finns (mall: sa-laser-du-*-q3-2026.json-serien).
`;
appendFileSync("data/forskning/V172-RAPPORTVAG.md", NOTIS);
ut.push("V172-RAPPORTVAG: notis appendad");

// 2. worklog
const RUBRIK = "## ROND 204 [organ:Φ] — ROTATIONSBESLUT: v172-skifte — kalendrarna 100→110 med v173-vågens nio bolag + TMUS (rappdagar 10-20→11-04 källbelagda), status-rop bitidentiskt — 2026-09-25";
const RAD =
"Rotationsbeslut enligt PIPELINE-KO: v173:s BCE-kö-notislista är TOM (U1–U9 komplett, universum 262→271) och rappdagarna 10-20→11-04 närmar sig ⇒ v172-skifte är kundvärdet närmast. KALENDERUTBYGGNAD: 10 branschkalendrar 100→110 bolag — v173-vågens nio (CNR 10-20 est. FÖRSTA i fönstret · RCI-B 10-22 est. · CP 10-28 est. · 4661.T 10-29 Q2 FY2027 · 6752.T 10-30 Q2 FY2027 · NTR 11-04 est. · AEM sen-okt est. · ABX tidig-nov est. · TELUS nov est.) + syskon-levererade TMUS (10-22 est.). Rappdagarna KÄLLBELAGDA ur de färska panelhämtningarna 2026-09-25 (Est. Earnings-rader) — estimerade datum märks est., exakt dag ej påhittad där panelen saknade den (AEM/ABX/TELUS bär fönsterform; ärlighetsprincipen även i kalenderfakta). Strukturbevarande append: bransch/genererad/borjanSasong orörda, fältuppsättning komplett på alla 110, dubbel läs-tillbaka per fil. STATUS-ROP enligt granskningsfilens regel § 1 som SISTA leveranssteg: RAPPORTBLOCK ombyggt bitidentiskt (8 publicerade · 76 väntar) — dubbelkörnings-idempotens bevisad; kalendrarna påverkar inte utkasträkningen (kalenderfakta ≠ utkast). Utkastmönstret förberett: nya utkast skrivs när rappdagarna passerar och Q3-tal finns (mall-serien sa-laser-du-*-q3-2026.json). Nästa: fortsatt v172-väntan per rappdagarna ELLER ny kandidatsondering per styrelserond (v173 viloläge med naturligt avslut — listan tom). R2-PÅMINNELSEN OM Q3-PUBLIKERINGSPAKETET kvarstår (71 GRÖN · 5 GUL · 0 RÖD av 76 väntar kundbeslut — rappfönstret 10-20→11-04 gör beslutet aktuellt inom veckor). Ren dataleverans — src orörd, inget bygge.";
const wl = readFileSync("worklog.md", "utf8");
if (!wl.includes("ROND 204")) {
  appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD + "\n");
  ut.push("worklog: ROND 204 appendad");
} else ut.push("worklog: SKIPPAD");

// 3. PIPELINE-KO — v172-raden uppdateras
const PK = "PIPELINE-KO.md";
let pk = readFileSync(PK, "utf8");
if (pk.includes("utlösare = rapportdagarna från 10-09")) {
  pk = pk.replace(
    "utlösare = rapportdagarna från 10-09 · nästa: granskningsomgång av utkasten + publiceringspaket till kund (R2)",
    "utlösare = rapportdagarna 10-20→11-04 (kalendrarna 110 bolag sedan r204: v173-vågens nio + TMUS inlagda med källbelagda est.-datum) · kur-ronden klar r194 (71 GRÖN · 5 GUL · 0 RÖD — publiceringsklar R2) · nästa: utkast per rappdag när talen landar + publiceringspaket till kund (R2)",
  );
  writeFileSync(PK, pk);
  ut.push("PIPELINE-KO: v172-rad uppdaterad (kalenderläget)");
} else ut.push("PIPELINE-KO: v172-radens expected-läge hittades ej — manuell granskning");

// 4. beslutsminne
const post = {
  rond: 204, organ: "Φ", ts: Date.now(),
  beslut: "Rotation: v172-skifte (BCE-listan tom, rappdagar nära). Kalendrarna 100→110 med v173-vågens nio + TMUS; rappdagar källbelagda ur panelerna 2026-09-25, est.-datum märkta; status-rop bitidentiskt (8+76 oförändrat). Nästa: utkast per rappdag eller ny sondering. R2: Q3-paketet väntar kund — fönstret gör beslutet aktuellt.",
  bevis: "V172-RAPPORTVAG.md-notis + kalender-*.json (5 filer) + _r204-*.mjs (kvitton /tmp/r204-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: båda instanserna (rond 204)");

// 5. commit + push (med adoptiongren)
const MSG = `studio: [organ:Φ] rond 204 ROTATIONSBESLUT — v172-skifte: kalendrarna 100→110 bolag (v173-vågens nio + syskon-TMUS; rappdagar 10-20→11-04 källbelagda ur panelhämtningarna 2026-09-25 — est. märkta, AEM/ABX/TELUS i fönsterform då exakt dag saknades i panelen); strukturbevarande append med fältkontroll på alla 110; status-rop enligt granskningsfilens § 1: RAPPORTBLOCK bitidentiskt (8 publicerade · 76 väntar, dubbelkörnings-idempotens). Utkast per rappdag när Q3-tal landar (mall-serien klar). V172-RAPPORTVAG-notis + PIPELINE-KO-v172-rad uppdaterade. Ren dataleverans — src orörd, inget bygge.`;
writeFileSync("verktyg/_r204-commitmsg.txt", MSG);
run(A, ["add", "data/blogg-utkast/kvartal/2026-q3/kalender-kommunikation.json", "data/blogg-utkast/kvartal/2026-q3/kalender-industri.json", "data/blogg-utkast/kvartal/2026-q3/kalender-material.json", "data/blogg-utkast/kvartal/2026-q3/kalender-konsument.json", "data/blogg-utkast/kvartal/2026-q3/kalender-teknik.json", "data/forskning/V172-RAPPORTVAG.md", "worklog.md", "PIPELINE-KO.md", "data/forskning/beslutsminne.jsonl", "verktyg/_r204-v172-sond.mjs", "verktyg/_r204-v172-kalenderutbyggnad.mjs", "verktyg/_r204-v172-avslut.mjs", "verktyg/_r204-commitmsg.txt"], "add");
let c = run(A, ["commit", "-F", "verktyg/_r204-commitmsg.txt"], "commit");
if (c.status !== 0) { writeFileSync("/tmp/r204-avslut.txt", ut.join("\n")); console.log(ut.join("\n")); process.exit(1); }
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
  const ca = run(A, ["commit", "-m", "studio: [organ:Φ] rond 204 adoption — prod-trädets ändring(ar) av " + mFiler.join(", ") + " adopterade för ren updateInstead-push"], "commit-adoption");
  if (ca.status === 0) pu = run(A, ["push", "prod", "develop"], "push-2");
}

// 6. efterverifiering
if (pu.status === 0) {
  const uni = sp("node", ["-e", "const fs=require('fs');let n=0;for(const f of fs.readdirSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3')){if(f.startsWith('kalender-')){n+=JSON.parse(fs.readFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/'+f)).bolag.length}}console.log(n+' kalenderbolag i prod-trädet')"], { encoding: "utf8" });
  ut.push("prod-trädet: " + (uni.stdout || "").trim());
  run(A, ["status", "--porcelain"], "arbetsyte-slut");
}
writeFileSync("/tmp/r204-avslut.txt", ut.join("\n"));
console.log(ut.join("\n"));
