#!/usr/bin/env node
/**
 * _r204-v172-sond.mjs — rotationsbeslut r204: v172-skiftet. Sondera kalendrarnas
 * format + vilka av vågens nio v173-bolag som saknas (rappdagar 10-20→11-04).
 * Kvitto: /tmp/r204-sond.txt
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const KAT = "data/blogg-utkast/kvartal/2026-q3";
const filer = readdirSync(KAT).filter((f) => f.startsWith("kalender-"));
const ut = [`kalendrar: ${filer.length} — ${filer.join(", ")}`];

// struktur ur första kalendern
const första = JSON.parse(readFileSync(`${KAT}/${filer[0]}`, "utf8"));
ut.push("struktur-nycklar: " + Object.keys(första).join(","));
ut.push("första bolaget: " + JSON.stringify(första.bolag?.[0] ?? första[0] ?? {}).slice(0, 300));

// vågens nio + TMUS — finns de?
const vaga = ["4661.T", "6752.T", "TELUS", "RCI-B", "TMUS", "CNR", "CP", "NTR", "AEM", "ABX"];
const lager = {};
for (const f of filer) {
  const k = JSON.parse(readFileSync(`${KAT}/${f}`, "utf8"));
  const bolag = k.bolag ?? k ?? [];
  for (const t of vaga) {
    const traf = bolag.find((b) => b.ticker === t);
    if (traf) lager[t] = `${f} → ${traf.rapportfenster ?? "?"}`;
  }
}
ut.push("=== vågens bolag i kalendrarna ===");
for (const t of vaga) ut.push(`  ${t}: ${lager[t] ?? "SAKNAS"}`);
const totalBolag = filer.reduce((n, f) => {
  const k = JSON.parse(readFileSync(`${KAT}/${f}`, "utf8"));
  return n + (k.bolag ?? []).length;
}, 0);
ut.push("totalt kalenderbolag: " + totalBolag);
writeFileSync("/tmp/r204-sond.txt", ut.join("\n"));
console.log(ut.join("\n"));
