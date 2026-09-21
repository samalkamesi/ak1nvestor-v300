#!/usr/bin/env node
// Reserverar o147 i protokollnummerpoolen (atomärt lås, idempotent).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const fil = path.resolve("/home/ak1a/AK1/data/vakten/protokollnummer.json");
const las = JSON.parse(readFileSync(fil, "utf8"));
const nr = "o147";
const mig = {
  nummer: nr,
  agare: "s8-u2",
  manifest: "auto-s8-1790006726228",
  titel:
    "sitemap-livskontraktet: byggfrusna klassers döda löften (rapportakademin + dataset-/aspekt-/spegelgrenar) — byggdSidaFinns-sond (.next, fail-open) + livskontraktssvit som permanent vakt",
  ts: Date.now(),
  status: "reserverat",
};

const finns = (las.protokoll || las.nummer || []).some?.((p) => p.nummer === nr);
const lista = Array.isArray(las) ? las : las.protokoll || las.nummer || las.reserverade || [];
if (!finns) {
  lista.push(mig);
  const ut = Array.isArray(las) ? lista : { ...las, protokoll: lista };
  writeFileSync(fil, JSON.stringify(ut, null, 2));
  console.log(`RESERVERAT ${nr} för s8-u2`);
} else {
  console.log(`${nr} finns redan — kontrollera ägarskap`);
}
