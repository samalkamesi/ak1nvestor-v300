#!/usr/bin/env node
/** _r197-v173u3-lackagevakt.mjs — v173 U3: läckagevakt v3 (kropp oförändrad, U1/U2-bevisad). */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
let sokningar = [];
for (const b of u) {
  if (b.namn && b.namn.length >= 4) sokningar.push({ typ: "namn", orig: b.namn, lag: b.namn.toLowerCase() });
  if (b.ticker && b.ticker.length >= 4)
    sokningar.push({ typ: "ticker", orig: b.ticker, re: new RegExp(`\\b${b.ticker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`) });
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
    else if (/^dataset/.test(f) && f.endsWith(".html")) filer.push(p);
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

console.log(`UNIVERSUM: ${u.length} bolag · ${sokningar.length} sökningar · ${filer.length} dataset-html + llms Dataset-sektionen`);
if (traffar.length) {
  console.error("LÄCKAGEVAKT RÖD — " + traffar.length + " träffar:");
  for (const t of traffar.slice(0, 30)) console.error("  ✗ " + t);
  process.exit(1);
}
console.log("LÄCKAGEVAKT GRÖN — 0 träffar på dataset-ytorna");
