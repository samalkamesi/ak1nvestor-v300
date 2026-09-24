#!/usr/bin/env node
/**
 * SPÅR 8 s8-u2 (vakt 2/3, o98) — HARMONISERINGSREPARATÖREN
 * =====================================================================
 * Rotorsakan detta verktyg kurerar: s6-u3:s omgång 24-harmonisering av
 * våg 189:s marknadsmekanik-lager avbröts mitt i verkställandet — i 38
 * testfiler klistrades kommentarparet + KOMPONENTER-elementet
 *   "svaraLokaltMarknadsmekanik",
 * in MITT I IMPORTSEKTIONEN (naken sträng + kommatecken före `const` ⇒
 * SyntaxError: Unexpected token 'const'; node --check röd × 38). I de 4
 * korrekt harmoniserade syskonen (bokmastar/vardegrund/case/forsakring)
 * sitter SAME block inne i FALL L:s KOMPONENTER-array, direkt efter
 * "svaraLokaltCase" — widget-kedjans (chat-widget.tsx:1511) verkliga
 * ordning: sektor ?? case ?? MARKNADSMEKANIK ?? praktik.
 *
 * KUR: flytta blocket från importsektionen till KOMPONENTER efter case,
 * med ankarradens indent. Idempotent: finns inget hängande block ⇒ filen
 * orörs. Hårdhärdad: varje fil FÖRVÄNTAS ha mönstret exakt en gång och
 * kommentarparet ovanför — avvikelser avbryter HELA körningen (ingen
 * halvvägsfix, våg 100-doktrinen).
 *
 * Bevisning som hör till körningen:
 *   node --check × samtliga verktyg/*.mjs efteråt = 0 fel
 *   testsviterna själva (L01 widget-synk) verifierar ordningen LIVE
 *
 * Körs:  node verktyg/_s8u2-harmonisera-marknadsmekanik.mjs [--skriv]
 * Utan --skriv: torrkörning (bara rapport).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const HÄR = path.dirname(fileURLToPath(import.meta.url));
const ROT = path.resolve(HÄR, "..");
const SKRIV = process.argv.includes("--skriv");

const DANGEL = '"svaraLokaltMarknadsmekanik",';
const KOMPONENT = '"svaraLokaltMarknadsmekanik",';

const filer = fs
  .readdirSync(HÄR)
  .filter((f) => f.startsWith("testa-ai-mentor") && f.endsWith(".mjs"))
  .sort();

const rapport = [];
for (const fil of filer) {
  const sokvag = path.join(HÄR, fil);
  const rader = fs.readFileSync(sokvag, "utf8").split("\n");

  // Hängande detektion FÖRST: element-rader utanför array-kontext.
  // Filer utan raden (case/kedja/marknadsmekanik har andra former) är friska.
  const danglaAlla = rader.map((r, j) => (r.trim() === DANGEL ? j : -1)).filter((j) => j >= 0);
  if (danglaAlla.length === 0) {
    rapport.push({ fil, status: "frisk" });
    continue;
  }

  // Anchor: KOMPONENTER-arrayn (FALL L) och dess case-rad.
  const kompIdx = rader.findIndex((r) => r.includes("const KOMPONENTER"));
  if (kompIdx === -1) throw new Error(fil + ": element-rad men ingen const KOMPONENTER — oväntad filform");
  const caseIdx = rader.findIndex((r, j) => j >= kompIdx && r.includes('"svaraLokaltCase"'));
  if (caseIdx === -1) throw new Error(fil + ': hittar inte "svaraLokaltCase" i KOMPONENTER');

  // Hängande block = element-rad FÖRE KOMPONENTER (importsektionen).
  // Inne i KOMPONENTER är samma rad KORREKT harmoniserad (bokmastar-mall).
  const hängande = danglaAlla.filter((j) => j < kompIdx);

  // Idempotens: frisk fil — raden sitter bara på rätt plats i KOMPONENTER.
  if (hängande.length === 0) {
    rapport.push({ fil, status: "frisk" });
    continue;
  }

  // Härdning: mönstret ska vara kommentarparet + raden, exakt en gång.
  const i = hängande[0];
  const ovan1 = (rader[i - 1] ?? "").trim();
  const ovan2 = (rader[i - 2] ?? "").trim();
  if (hängande.length !== 1) throw new Error(fil + ": " + hängande.length + " hängande rader (väntat exakt 1)");
  if (!ovan2.includes("Omgång 24-harmonisering") || !ovan1.includes("baslinjens röda L01")) {
    throw new Error(fil + ": okänd blockform ovanför hängande rad: " + JSON.stringify(ovan2) + " / " + JSON.stringify(ovan1));
  }

  const indent = (rader[caseIdx].match(/^\s*/) ?? [""])[0];
  const block = [
    indent + "// Omgång 24-harmonisering (s6-u3): våg 189:s marknadsmekanik wireades utan",
    indent + "// harmonisering — baslinjens röda L01; kedjeordning efter case (kedjetestet G).",
    indent + KOMPONENT,
  ];

  // Verifiera att målet inte redan bär komponenten (dubbelinsättningsskydd).
  const efterKomp = rader.slice(kompIdx);
  if (efterKomp.some((r) => r.trim() === KOMPONENT)) {
    throw new Error(fil + ": KOMPONENTER bär redan marknadsmekanik — dubbelinsättning stoppad");
  }

  // Verkställ: ta bort 3 rader (i-2, i-1, i) och sätt in blocket efter
  // case-ankaret. Båda ligger UNDER borttaget område ⇒ insättningsindex
  // i målarrayen = caseIdx + 1 − 3 (ingen omletning av ankaret,ingen −1-fälla).
  const nyRader = [...rader.slice(0, i - 2), ...rader.slice(i + 1)];
  const insattning = caseIdx + 1 - 3;
  if (insattning <= 0 || !nyRader[insattning - 1].includes('"svaraLokaltCase"')) {
    throw new Error(fil + ": insättningsankaret föll igenom — avbryter utan skriv");
  }
  nyRader.splice(insattning, 0, ...block);

  if (SKRIV) fs.writeFileSync(sokvag, nyRader.join("\n"));
  rapport.push({ fil, status: SKRIV ? "reparerad" : "torr-reparerad", bort: i + 1, till: insattning + 1 });
}

// ── Rapport ────────────────────────────────────────────────────────────────
const reparerade = rapport.filter((r) => r.status.includes("reparerad"));
const friska = rapport.filter((r) => r.status === "frisk");
console.log("HARMONISERINGSREPARATÖREN (" + (SKRIV ? "SKRIV" : "TORR") + "): " + reparerade.length + " reparerade · " + friska.length + " friska");

if (SKRIV) {
  // Efterbevis i samma körning: node --check på ALLA verktyg-skript.
  const alla = fs.readdirSync(HÄR).filter((f) => f.endsWith(".mjs") || f.endsWith(".js"));
  const fel = [];
  for (const f of alla) {
    try {
      execFileSync(process.execPath, ["--check", path.join(HÄR, f)], { stdio: "pipe" });
    } catch {
      fel.push(f);
    }
  }
  console.log("node --check: " + alla.length + " filer · " + fel.length + " fel" + (fel.length ? " · " + fel.join(", ") : ""));
  process.exitCode = fel.length ? 1 : 0;
}
