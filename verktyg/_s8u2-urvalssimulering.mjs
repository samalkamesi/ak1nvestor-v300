#!/usr/bin/env node
// _s8u2-urvalssimulering.mjs — engångssond (spår 8, s8-u2, 2026-09-18):
// FÖRE (v157-algoritmen ordagrant, inline-kopia) mot EFTER (granssnitt-urval.mjs)
// mot VERKLIGA sitemap (localhost, 1 943 unika) + VERKLIGA journalen (264 poster).
// Läser endast — skriver inget, roterar inte journalen.
import fs from "node:fs";
import { urvalMedJournal } from "./granssnitt-urval.mjs";

const xml = fs.readFileSync("/tmp/sitemap.xml", "utf8");
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => {
    try { return decodeURIComponent(new URL(m[1]).pathname); } catch { return null; }
  })
  .filter(Boolean);
const unika = [...new Set(locs)];
const journal = JSON.parse(fs.readFileSync("data/vakten/vakt-sidjournal.json", "utf8"));
const SIDOR_MAX = 24;
const bas = ["/", "/studio", "/admin"];

// FÖRE — v157:s sortering ordagrant (prio FÖRE ålder)
const prio = (p) => ("/" + (p.split("/")[1] || "") === "/dataset" ? 0 : 1);
const fore = [...new Set([
  ...bas,
  ...unika
    .filter((p) => !bas.includes(p))
    .sort((a, b) => prio(a) - prio(b) || (journal[a] ?? 0) - (journal[b] ?? 0) || a.localeCompare(b)),
])].slice(0, SIDOR_MAX);

// EFTER — modulens kurerade urval
const { urval: efter, aldrigMatte } = urvalMedJournal(unika, journal);

const matta = (p) => (journal[p] ? `mätt ${new Date(journal[p]).toISOString().slice(0, 10)}` : "★ALDRIG MÄTT");
const rader = [];
rader.push(`sitemap ${unika.length} unika · journal ${Object.keys(journal).length} · aldrig-mätta ${aldrigMatte}`);
rader.push(`\nFÖRE (v157): ${fore.filter((p) => !bas.includes(p) && journal[p]).length}/21 platser till REDAN-MÄTTA dataset-sidor, ${fore.filter((p) => !journal[p] && !bas.includes(p)).length} aldrig-mätta:`);
fore.forEach((p) => rader.push(`  ${p.padEnd(45)} ${matta(p)}`));
rader.push(`\nEFTER (kur): ${efter.filter((p) => !bas.includes(p) && !journal[p]).length}/21 platser till ALDRIG-MÄTTA:`);
efter.forEach((p) => rader.push(`  ${p.padEnd(45)} ${matta(p)}`));
const ut = rader.join("\n");
console.log(ut);
fs.writeFileSync("data/vakten/urvalssimulering-2026-09-18-s8u2.txt", ut + "\n");
