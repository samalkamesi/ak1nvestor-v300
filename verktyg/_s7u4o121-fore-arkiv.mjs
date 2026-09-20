#!/usr/bin/env node
/**
 * AK1A — s7-o121 FÖRE-HTML-ARKIV (o119 §5.3 bitjämförelsebas).
 *
 * Arkiverar SSR-HTML från AKTUELLT prod-bygge (IxcwwO vid tillfället) för
 * /en/blogg · /ar/blogg · /blogg · /kurser via localhost:3000 (loopback-
 * regeln; pm2 'ak1a' serverar samma .next som prod). Per sida sparas:
 *   · rå HTML (i JSON, max 300 kB/sida — sidorna är ~40 kB, väl under)
 *   · sha256 rå + sha256 normaliserad (alla /_next/…-sökvägar → NEXTPATH)
 *   · initiala script-chunks (src-attribut ur <script>-taggarna)
 *   · träffar av widget-chunkens namn (o119 §2: 10f47l5mmeoxy.js) i HTML
 * Vid EFTER: kör _s7u4o121-efter-struktur.mjs som läser detta arkiv.
 *
 * Användning: node verktyg/_s7u4o121-fore-arkiv.mjs
 * Utdata: data/forskning/OPTIMERING/lighthouse/s7u4o121-fore-html-arkiv.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const BAS = process.env.LH_BAS || "http://localhost:3000";
const SIDOR = ["/en/blogg", "/ar/blogg", "/blogg", "/kurser"];
const UTFIL = join(process.cwd(), "data/forskning/OPTIMERING/lighthouse/s7u4o121-fore-html-arkiv.json");
const WIDGET_CHUNK_FORE = "10f47l5mmeoxy.js"; // o119 §2 (IxcwwO)
const WIDGET_STRANGAR = [
  "Håll streaken levande", "Fortsätt läroplanen", "Testa hela analysflödet",
  "Räkna på ett nytt case", "Djupdyk i dina innehav",
];

const sha = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);
const normalisera = (html) => html.replace(/\/_next\/[^"'\s)]+/g, "NEXTPATH");

const buildId = readFileSync(join(process.cwd(), ".next/BUILD_ID"), "utf8").trim();
const arkiv = { datum: new Date().toISOString(), bas: BAS, buildId, sidor: {} };

for (const s of SIDOR) {
  const r = await fetch(new URL(s, BAS).href, { headers: { "accept-language": "*" } });
  const html = await r.text();
  const chunks = [...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*>/g)].map((m) => m[1])
    .filter((u) => u.includes("/_next/"));
  arkiv.sidor[s] = {
    status: r.status,
    langd: html.length,
    sha256Ra: sha(html),
    sha256Normaliserad: sha(normalisera(html)),
    widgetChunkTraffar: html.split(WIDGET_CHUNK_FORE).length - 1,
    initialaChunks: chunks,
    html,
  };
  console.log(`${s}: ${r.status} · ${html.length} B · ${chunks.length} chunks · widget-chunk ${arkiv.sidor[s].widgetChunkTraffar} träffar`);
}

// Kontroll: widgetens strängar i .next-chunkarna (FÖRE-läge: i initial chunk)
const statisk = join(process.cwd(), ".next/static/chunks");
import { readdirSync } from "node:fs";
const chunkTraffar = [];
for (const f of readdirSync(statisk)) {
  if (!f.endsWith(".js")) continue;
  const innehall = readFileSync(join(statisk, f), "utf8");
  const traffar = WIDGET_STRANGAR.filter((str) => innehall.includes(str));
  if (traffar.length) chunkTraffar.push({ chunk: f, strangar: traffar.length });
}
arkiv.widgetStrangarIFiler = chunkTraffar;
console.log("Widget-strängar i .next/static/chunks:", JSON.stringify(chunkTraffar));

writeFileSync(UTFIL, JSON.stringify(arkiv, null, 2));
console.log(`Skriven: ${UTFIL} (buildId ${buildId})`);
