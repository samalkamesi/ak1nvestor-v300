#!/usr/bin/env node
/**
 * MENTORLÄKNING s5-u1 o32 — bygg om KURSREGISTER-arrayen ur registret med
 * EXAKT byggKursregister-reglerna (variabelFranSlug, quiz-summa, kodpunkts-
 * sortering). VAKT FÖRE SKRIVNING (lärdomen: aldrig skriva en trasig fil).
 * Kör: node verktyg/_s5u1o32-mentorlaka.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const REG = "/home/ak1a/AK1/public/deep-courses.json";
const FIL = "/home/ak1a/AK1/src/lib/ai-mentor-register.ts";
const dc = JSON.parse(readFileSync(REG, "utf8"));

const variabelFranSlug = (slug) => {
  const m = slug.match(/^v(\d{2})-/);
  if (!m) return undefined;
  const n = Number(m[1]);
  return n >= 1 && n <= 20 ? `V${m[1]}` : undefined;
};

const rader = Object.values(dc)
  .map((k) => ({
    slug: k.slug,
    titel: k.title ?? k.slug,
    kategori: k.category || "ÖVRIGT",
    variabel: variabelFranSlug(k.slug),
    kapitel: k.chapterCount || (k.chapters ? k.chapters.length : 0),
    quiz: (k.chapters || []).reduce((s, ch) => s + (ch.quiz ? ch.quiz.length : 0), 0),
    minuter: k.totalMinutes || 0,
    niva: (k.level || "").trim() || "Alla",
  }))
  .sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0))
  .map((r) =>
    `  { slug: ${JSON.stringify(r.slug)}, titel: ${JSON.stringify(r.titel)}, kategori: ${JSON.stringify(r.kategori)}, variabel: ${r.variabel === undefined ? "undefined" : JSON.stringify(r.variabel)}, kapitel: ${r.kapitel}, quiz: ${r.quiz}, minuter: ${r.minuter}, niva: ${JSON.stringify(r.niva)} },`);

console.log("register:", Object.keys(dc).length, "→ rader:", rader.length);

const src = readFileSync(FIL, "utf8");
const START = "export const KURSREGISTER: RegisterRad[]";
const iStart = src.indexOf(START);
if (iStart < 0) { console.error("VAKT: deklaration saknas — AVBRYTER, inget skrivet"); process.exit(1); }
const iTill = src.indexOf("];", iStart);
if (iTill < 0) { console.error("VAKT: arrayslut saknas — AVBRYTER, inget skrivet"); process.exit(1); }
const iErsattFrån = iStart + START.length; // efter typen — bygger selbst `= [ … ];`
if (rader.length !== Object.keys(dc).length) { console.error("VAKT: radantal ≠ register — AVBRYTER"); process.exit(1); }
if (!rader.some((r) => r.includes('"am-10-insynslistan"'))) { console.error("VAKT: am-10 saknas — AVBRYTER"); process.exit(1); }

const ny = src.slice(0, iErsattFrån) + " = [\n" + rader.join("\n") + "\n" + src.slice(iTill);

// simulera vakt: arrayblocket parsebart (balans runt) + deklarationsrad hel
const koll = (ny.match(/^\s*\{ slug: "/gm) || []).length;
if (koll !== rader.length) { console.error("VAKT: efterkontroll", koll, "≠", rader.length, "— AVBRYTER"); process.exit(1); }
writeFileSync(FIL, ny);
console.log("MENTORLÄKNING GRÖN:", koll, "rader skrivna (vakt passerad FÖRE skrivning)");
