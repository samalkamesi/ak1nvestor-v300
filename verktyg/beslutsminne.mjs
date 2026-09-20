#!/usr/bin/env node
/**
 * BESLUTSMINNE — KANONISKT VERKTYG med LAGGRUNDEN-grinden (åtgärd 5,
 * LAGBESLUT STYRELSE-MUADCVYF-CG1JM2, 2026-09-21).
 *
 * STÅENDE PRINCIP LAGGRUNDEN: varje RÄTTSLIGT beslut i organismen (båda
 * maskinerna) SKALL ange lagrum + tillämpning + källa. Detta verktyg är
 * den mekaniska verkställelsen: det NEKAR (exit 1) registrering av
 * rättsliga beslut som saknar lagrumsfält — ett beslut som inte får
 * registreras är inte bokfört, och styrelseregel "bevis eller tystnad"
 * gäller även bokföringen.
 *
 * FORMAT (bakåtkompatibelt med existerande data/vakten/beslutsminne.jsonl):
 *   {ts, rond, beslut, landat} + vid rättsliga beslut dessutom:
 *   {lagrum: string[], tillampning: string, kalla: string}
 *
 * ANVÄNDNING:
 *   node verktyg/beslutsminne.mjs '{"rond":128,"beslut":"…","landat":"…"}'
 *   node verktyg/beslutsminne.mjs --fil sokvag/till/beslut.json
 *   node verktyg/beslutsminne.mjs --las 5        (visa 5 senaste)
 *
 * RÄTTSLIGT = posten har "typ":"rattsligt" ELLER bär något lagrumsfält
 * (lagrum/tillampning/kalla) — då krävs alla tre, ifyllda. Vanliga
 * drift-beslut (typ saknas/annan) passerar utan lagrumskrav.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const FIL = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "vakten", "beslutsminne.jsonl");

function lasSenaste(n) {
  if (!existsSync(FIL)) return [];
  const rader = readFileSync(FIL, "utf8").split("\n").filter((l) => l.trim() !== "");
  return rader.slice(-n).map((l) => {
    try {
      return JSON.parse(l);
    } catch {
      return { trasigRad: l.slice(0, 60) };
    }
  });
}

function arRattsligt(post) {
  if (post.typ === "rattsligt") return true;
  return post.lagrum !== undefined || post.tillampning !== undefined || post.kalla !== undefined;
}

function validera(post) {
  const fel = [];
  if (typeof post.beslut !== "string" || post.beslut.trim() === "") fel.push("beslut saknas/tom");
  if (typeof post.landat !== "string" || post.landat.trim() === "") fel.push("landat saknas/tom");
  if (post.rond !== undefined && typeof post.rond !== "number" && typeof post.rond !== "string") {
    fel.push("rond skall vara nummer eller sträng");
  }
  if (typeof post.ts !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(post.ts)) fel.push("ts skall vara ISO 8601");

  // LAGGRUNDEN-grinden — den mekaniska kärnan (åtgärd 5).
  if (arRattsligt(post)) {
    const lagrum = Array.isArray(post.lagrum) ? post.lagrum.filter((x) => typeof x === "string" && x.trim() !== "") : [];
    if (lagrum.length === 0) fel.push("LAGGRUNDEN: rattsligt beslut utan lagrum[] — NEKAS (ange lagrum, t.ex. [\"GDPR art 5.1 e\"])");
    if (typeof post.tillampning !== "string" || post.tillampning.trim() === "") fel.push("LAGGRUNDEN: rattsligt beslut utan tillämpning — NEKAS (hur lagrummet tillämpas)");
    if (typeof post.kalla !== "string" || post.kalla.trim() === "") fel.push("LAGGRUNDEN: rattsligt beslut utan källa — NEKAS (t.ex. laggrundade-beslut-2026-09-21.md)");
  }
  return fel;
}

const argv = process.argv.slice(2);

// --las N — läs N senaste posterna (read-only).
if (argv[0] === "--las") {
  const n = Number(argv[1] ?? "5") || 5;
  const poster = lasSenaste(n);
  for (const p of poster) console.log(JSON.stringify(p).slice(0, 400));
  process.exit(0);
}

// Posten: --fil <sokvag> eller literal JSON-argument.
let post = null;
try {
  if (argv[0] === "--fil") {
    post = JSON.parse(readFileSync(argv[1], "utf8"));
  } else if (argv.length > 0) {
    post = JSON.parse(argv.join(" "));
  }
} catch (e) {
  console.error(`FEL: kunde inte tolka posten — ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
}
if (post === null || typeof post !== "object") {
  console.error("Användning: node verktyg/beslutsminne.mjs '<json>' | --fil <sokvag> | --las <n>");
  process.exit(1);
}

if (!post.ts) post.ts = new Date().toISOString();

const fel = validera(post);
if (fel.length > 0) {
  console.error("NEKAT — beslutsminnet vägrar registreringen:");
  for (const f of fel) console.error(`  - ${f}`);
  process.exit(1);
}

const rad = JSON.stringify(post) + "\n";
writeFileSync(FIL, rad, { flag: "a" });
console.log(`REGISTERAT: ${post.ts} rond ${post.rond ?? "?"} — ${(post.beslut ?? "").slice(0, 100)}`);
