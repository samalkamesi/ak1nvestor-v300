#!/usr/bin/env node
// _s8u3o146-bolag-sond.mjs — publiceringskontraktets eldprov (o146).
//
// Mäter gapet "sitemap lovar / ut rutten levererar" för /bolag/*:
// läser https://lab.ak1nvestor.com/sitemap.xml (eller --bas), plockar alla
// /bolag/{slug}-URL:er, sondar varje slug mot servern (default localhost:3000
// = prod-trädet enligt AGENTS.md) och skriver facit-JSON till data/vakten/.
//
// Användning:
//   node verktyg/_s8u3o146-bolag-sond.mjs                # FÖRE/EFTER-mätning
//   node verktyg/_s8u3o146-bolag-sond.mjs --bas=http://localhost:3000
//
// Dom (o146 §dom): gap = 0 ⇒ kontraktet håller (sitemap lovar bara byggda).
// Före kur (2026-09-21): 249 lovade, 243 byggda, 6 × 404.

import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const basArg = args.find((a) => a.startsWith("--bas="));
const BAS = basArg ? basArg.slice(6) : "http://localhost:3000";
const SITEMAP = "https://lab.ak1nvestor.com/sitemap.xml";
const ROT = path.join(process.cwd());
const UTFIL = path.join(
  ROT,
  "data",
  "vakten",
  `_s8u3o146-bolag-sond-${new Date().toISOString().slice(0, 10)}-${Date.now()}.json`,
);

async function hamtaSitemap() {
  const svar = await fetch(SITEMAP, { redirect: "follow" });
  if (!svar.ok) throw new Error(`sitemap ${svar.status}`);
  const xml = await svar.text();
  const urler = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return urler.filter((u) => /\/bolag\/[^/]+$/.test(u));
}

async function sond(sokvag) {
  // HEAD först (billigt); vissa lager svarar 405 — fall då till GET.
  for (const metod of ["HEAD", "GET"]) {
    try {
      const r = await fetch(`${BAS}${sokvag}`, { method: metod, redirect: "manual" });
      if (r.status === 405 && metod === "HEAD") continue;
      return r.status;
    } catch (e) {
      if (metod === "GET") return `FEL:${String(e).slice(0, 60)}`;
    }
  }
  return "FEL:okänd";
}

const bolagUrler = await hamtaSitemap();
const slugs = bolagUrler.map((u) => new URL(u).pathname);

const statusar = {};
const fyraHundraFyra = [];
const ovrigaAvvikelse = [];
const KONKURRENS = 6;
for (let i = 0; i < slugs.length; i += KONKURRENS) {
  const batch = slugs.slice(i, i + KONKURRENS);
  await Promise.all(
    batch.map(async (sokvag) => {
      const status = await sond(sokvag);
      statusar[status] = (statusar[status] || 0) + 1;
      if (status === 404) fyraHundraFyra.push(sokvag);
      else if (status !== 200) ovrigaAvvikelse.push({ sokvag, status });
    }),
  );
}

const rapport = {
  ts: new Date().toISOString(),
  bas: BAS,
  sitemapKalla: SITEMAP,
  lovadeBolagsUrler: slugs.length,
  statusfordelning: statusar,
  gap404: fyraHundraFyra.length,
  gap404Sokvagar: fyraHundraFyra,
  ovrigaAvvikelse,
  dom: fyraHundraFyra.length === 0 && ovrigaAvvikelse.length === 0
    ? "GRÖN — kontraktet håller (sitemap lovar bara levererbara sidor)"
    : `RÖD — ${fyraHundraFyra.length} döda löften + ${ovrigaAvvikelse.length} övriga avvikelser`,
};

mkdirSync(path.dirname(UTFIL), { recursive: true });
writeFileSync(UTFIL, JSON.stringify(rapport, null, 2));
console.log(`o146-bolag-sond: ${slugs.length} lovade | 404: ${fyraHundraFyra.length} | övriga: ${ovrigaAvvikelse.length}`);
console.log(`DOM: ${rapport.dom}`);
console.log(`Facit: ${UTFIL}`);
if (fyraHundraFyra.length) console.log("404-sökvägar:", fyraHundraFyra.join(", "));
