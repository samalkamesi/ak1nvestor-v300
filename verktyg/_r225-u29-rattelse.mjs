#!/usr/bin/env node
/**
 * _r225-u29-rattelse.mjs — v173 U29 RÄTTELSE (rond 225): milestone-formuleringen
 * "UK:S SISTA 1-GREN ÖPPNAD (sju grenar alla ≥2)" var FEL — prod-verifieringen visar
 * halso (GSK.L) och kommunikation (BT.L) som kvarvarande 1-grenar. Köns namngivning
 * (energi/konsument/teknik) var komplett ÖPPNAD, men UK har INTE alla grenar ≥2.
 * Rättskirurgiskt: SGE.L-radens notering+paranoid, worklog-rättelserad, PIPELINE-KO,
 * protokollet, beslutsminne. Kvitto: /tmp/r225-rattelse.txt
 */
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";

const ut = [];

// 1) Universumraden (SGE.L = sista raden, tillagd denna rond — kirurgisk strängrättelse)
const UNI = "data/portfolj-system/bolagsunivers.json";
const raw = readFileSync(UNI, "utf8");
const u = JSON.parse(raw);
const idx = u.findIndex((b) => b.ticker === "SGE.L");
if (idx === -1) { console.error("ABORT: SGE.L saknas"); process.exit(1); }
const FEL = "UK:S SISTA 1-GREN ÖPPNAD";
const RATT_NOT = "UK:NAMNGIVNA 1-GRENAR ÖPPNADE (energi+ konsument+ teknik per U26-kön — kvarvarande 1-grenar: hälsa GSK · kommunikation BT)";
const RATT_PAR = "UK:NAMNGIVNA 1-GRENAR (energi/konsument/teknik enl. U26-kön) samtliga öppnade — kvarvarande UK-1-grenar: hälsa (GSK.L) och kommunikation (BT.L)";
const n1 = (u[idx].notering ?? "").split(FEL).length - 1;
const n2 = (u[idx].kallor?.[0]?.paranoid ?? "").split("UK:S SISTA 1-GREN ÖPPNAD").length - 1;
u[idx].notering = u[idx].notering.split(FEL).join(RATT_NOT).replace(/UK:S SISTA 1-GREN ÖPPNAD/g, RATT_NOT);
u[idx].kallor[0].paranoid = u[idx].kallor[0].paranoid.replace(/Storbritannien 14→15 \(teknik-grenen 1→2 — UK:S SISTA 1-GREN ÖPPNAD\)/g, "Storbritannien 14→15 (teknik-grenen 1→2 — " + RATT_PAR + ")");
ut.push("SGE.L-rad: " + n1 + " noteringsträff(ar) + " + n2 + " paranoidträff(ar) rättade");
const indent = raw.split("\n")[1]?.startsWith("  ") ? 2 : 1;
writeFileSync(UNI, JSON.stringify(u, null, indent) + (raw.endsWith("\n") ? "\n" : ""));
const el = JSON.parse(readFileSync(UNI, "utf8"));
if (el.length !== 291 || !el[el.length - 1] || el[el.length - 1].ticker !== "SGE.L") { console.error("ABORT: läs-tillbaka struktur"); process.exit(1); }
if ((el[el.length - 1].notering ?? "").includes("SISTA 1-GREN")) { console.error("ABORT: felsträngen kvar i notering"); process.exit(1); }
if ((el[el.length - 1].kallor?.[0]?.paranoid ?? "").includes("SISTA 1-GREN")) { console.error("ABORT: felsträngen kvar i paranoid"); process.exit(1); }
const forandrade = el.filter((b, i) => JSON.stringify(b) !== JSON.stringify(u[i])).length;
ut.push("läs-tillbaka OK: 291 rader, sista = SGE.L, felsträngar borta");

// 2) Worklog-rättelserad
const RUBRIK = "## ROND 225 RÄTTELSE [organ:Φ] — U29:s milestone-formulering korrigerad: UK har INTE alla grenar ≥2 (halso GSK och kommunikation BT är kvarvarande 1-grenar; det var köns NAMNGIVNA grenar energi/konsument/teknik som öppnades) — 2026-09-25";
const RAD2 = "Självfångat fel i efterverifieringen (_r225-u29-prodverif.mjs): UK-grenstruktur i prod = finans 5 · teknik 2 · konsument 2 · industri 2 · energi 2 · halso 1 · kommunikation 1 — formuleringen 'UK:S SISTA 1-GREN ÖPPNAD, sju grenar alla ≥2' i U29:s leverans var FEL och byggde på U26-köns ofullständiga namngivning. Rättat kirurgiskt i: SGE.L-radens notering+paranoid (strängbytet verifierat med läs-tillbaka), detta worklog, PIPELINE-KO, protokollet V173-U29, beslutsminnet. Data (tal, lås, serier) opåverkade — endast milestone-påståendet. Kö uppdateras: UK-hälsa (GSK+?) och UK-kommunikation (BT+?) åter på 1-gren-listan. Lärdom: aldrig härleda 'alla/alla'-påståenden ur köns namngivning — kör grenstrukturmätningen FÖRE formuleringen.";
appendFileSync("worklog.md", "\n\n" + RUBRIK + "\n" + RAD2 + "\n");
ut.push("worklog: rättelserad appendad");

// 3) PIPELINE-KO
let pk = readFileSync("PIPELINE-KO.md", "utf8");
const pkFore = "UK:S SISTA 1-GREN ÖPPNAD: sju grenar alla ≥2;";
if (pk.includes(pkFore)) {
  pk = pk.replace(pkFore, "UK:s namngivna 1-grenar öppnade; kvarvarande UK-1-grenar: hälsa+ kommunikation;");
  writeFileSync("PIPELINE-KO.md", pk);
  ut.push("PIPELINE-KO: rättad");
} else ut.push("PIPELINE-KO: ankare ej träffat — manuell kontroll krävs");

// 4) Protokollet
const PROT = "data/forskning/V173-U29-SGE-SAGE-UTOKNING.md";
let pr = readFileSync(PROT, "utf8");
pr = pr.replace("**UK:S SISTA 1-GREN ÖPPNAD** — Storbritannien 15 bolag på sju grenar, alla ≥2.", "**UK:s namngivna 1-grenar öppnade** (energi/konsument/teknik enligt U26-kön) — men kvarvarande 1-grenar: hälsa (GSK.L) och kommunikation (BT.L). [Rättelse r225: den ursprungliga formuleringen 'sista 1-grenen, sju grenar alla ≥2' var fel — grenstrukturmätningen körs numera före formuleringen.]");
writeFileSync(PROT, pr);
ut.push("protokoll: rättat");

// 5) Beslutsminnet
const post = {
  rond: 225, organ: "Φ", ts: Date.now(),
  beslut: "v173 U29 RÄTTELSE: milestone-formuleringen 'UK alla grenar ≥2' var fel — kvarvarande UK-1-grenar är hälsa (GSK) och kommunikation (BT); rättat i SGE.L-rad, worklog, PIPELINE-KO, protokoll. Data opåverkade. Kö: UK-hälsa/UK-kommunikation tillbaka på 1-gren-listan.",
  bevis: "_r225-u29-rattelse.mjs + _r225-u29-prodverif.mjs (kvitton /tmp/r225-*) + commit",
};
appendFileSync("data/vakten/beslutsminne.jsonl", JSON.stringify(post) + "\n");
appendFileSync("data/forskning/beslutsminne.jsonl", JSON.stringify(post) + "\n");
ut.push("beslutsminne: rättelsepost båda");

writeFileSync("/tmp/r225-rattelse.txt", ut.join("\n"));
console.log(ut.join("\n"));
