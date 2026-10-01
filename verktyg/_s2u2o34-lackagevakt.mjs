#!/usr/bin/env node
/**
 * s2-u2 omg34 — LÄCKAGEVAKT v98 (v3-mönstret ur skrap-arkivet, hela universumet).
 * Söker ALLA universumets bolagsnamn (case-insens) + tickers (case-SENSITIV, \b)
 * i ALLA renderade dataset-html under .next/server/app + llms.txt:s Dataset-sektion.
 * v3-lärdomarna hålls: <meta>-falskträffar undviks via case-sensitiva tickers;
 * llms Dataset-sektionen är tillåten halvpublik yta (A2-DATASET-KONTRAKT §1:
 * namn utan poäng) men ALL bolagsdata på dataset-SIDORNA är förbjuden.
 * 0 träffar = GRÖN.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
let sokningar = [];
let nTick = 0, nNamn = 0;
for (const b of u) {
  if (b.namn && b.namn.length >= 4) { sokningar.push({ typ: "namn", orig: b.namn, lag: b.namn.toLowerCase() }); nNamn++; }
  if (b.ticker && b.ticker.length >= 4)
    sokningar.push({ typ: "ticker", orig: b.ticker, re: new RegExp(`\\b${b.ticker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`) }), nTick++;
}
const sedda = new Set();
sokningar = sokningar.filter((x) => (sedda.has(x.lag ?? x.orig) ? false : (sedda.add(x.lag ?? x.orig), true)));

const filer = [];
(function vand(dir) {
  let ents;
  try { ents = readdirSync(dir); } catch { return; }
  for (const f of ents) {
    const p = join(dir, f);
    let s;
    try { s = statSync(p); } catch { continue; }
    if (s.isDirectory()) vand(p);
    else if (f.endsWith(".html") && /\/dataset(\/|\.html$)/.test(p)) filer.push(p);
  }
})(".next/server/app");

const traffar = [];
for (const fil of filer) {
  let txt;
  try { txt = readFileSync(fil, "utf8"); } catch { continue; }
  const lagTxt = txt.toLowerCase();
  for (const s of sokningar) {
    if (s.typ === "namn") { if (lagTxt.includes(s.lag)) traffar.push(`${fil}: ${s.typ} "${s.orig}"`); }
    else if (s.re.test(txt)) traffar.push(`${fil}: ${s.typ} "${s.orig}"`);
  }
}

{
  const txt = readFileSync("public/llms.txt", "utf8");
  const rader = txt.split("\n");
  const start = rader.findIndex((r) => r === "## Dataset — branschmedianer");
  const slut = rader.findIndex((r, i) => i > start && r.startsWith("## "));
  if (start === -1 || slut === -1) { console.error("hittar inte Dataset-sektionen i llms.txt"); process.exit(1); }
  const sektion = rader.slice(start, slut).join("\n");
  const lagSek = sektion.toLowerCase();
  for (const s of sokningar) {
    if (s.typ === "namn") { if (lagSek.includes(s.lag)) traffar.push(`llms.txt[Dataset-sektionen]: ${s.typ} "${s.orig}"`); }
    else if (s.re.test(sektion)) traffar.push(`llms.txt[Dataset-sektionen]: ${s.typ} "${s.orig}"`);
  }
}

console.log(`UNIVERSUM: ${u.length} bolag · ${nNamn} namn + ${nTick} tickers (${sokningar.length} sökningar efter dedup) · ${filer.length} utdatafiler (ALLA dataset-sidor: rotvyer + bransch + aspekter, tre språk) + llms.txt Dataset-sektionen`);
if (traffar.length) {
  console.error("LÄCKAGEVAKT RÖD — " + traffar.length + " träffar:");
  for (const t of traffar.slice(0, 30)) console.error("  ✗ " + t);
  process.exit(1);
}
console.log("LÄCKAGEVAKT GRÖN — 0 träffar på dataset-ytorna");
