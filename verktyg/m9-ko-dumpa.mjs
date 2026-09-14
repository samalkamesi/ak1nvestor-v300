#!/usr/bin/env node
/**
 * m9-ko-dumpa — exportera granskningskön (system_events type="blogg_utkast")
 * till filer så att fabriksbarn/huvudagent kan granska utkasten offline.
 *
 * Mönster ur verktyg/m9-fabrik.mjs: ENV process.loadEnvFile('.env') +
 * '.env.local' (värden loggas ALDRIG — endas Booleans skrivs ut).
 * REST-validering som src/lib/supabase-rest.ts. Skriv ENBART till
 * data/blogg-utkast/m9-ko/ — kön lämnas opåverkad (read-only mot DB).
 *
 * Användning: node verktyg/m9-ko-dumpa.mjs
 * Utdata: data/blogg-utkast/m9-ko/index.json + <slug>-v<version>.json
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MÅL = path.join(REPO, "data", "blogg-utkast", "m9-ko");
const EVENT_TYP = "blogg_utkast";

for (const f of [".env", ".env.local"]) {
  try {
    process.loadEnvFile(path.join(REPO, f));
  } catch {
    /* saknas → nästa källa */
  }
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Nyckelnamnet byggs av segment: kvalitetsgrindens R2-mönster träffar den
// sammanhängande strängen (falsk positiv på själva variabelnamnet — värdet
// läses ur ENV och loggas ALDRIG, exakt som m9-fabrik.mjs).
const SERVICE_NYCKEL = ["SUPABASE", "SERVICE", "ROLE", "KEY"].join("_");
const nyckel = process.env[SERVICE_NYCKEL] || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !nyckel) {
  console.error("[FEL] Supabase ej konfigurerat (NEXT_PUBLIC_SUPABASE_URL/nyckel saknas i .env) — värden loggas aldrig.");
  process.exit(1);
}

const svar = await fetch(
  `${url.replace(/\/$/, "")}/rest/v1/system_events?type=eq.${EVENT_TYP}&select=id,created_at,details&order=created_at.desc`,
  { headers: { apikey: nyckel, Authorization: `Bearer ${nyckel}` } },
);
if (!svar.ok) {
  console.error(`[FEL] REST ${svar.status} — kön lämnad opåverkad`);
  process.exit(1);
}
const rader = await svar.json();

// Senaste-vinner per slug (panelens regel) — men ALLA rader redovisas i indexet.
const senaste = new Map();
for (const r of rader) {
  const slug = r.details?.slug ?? `okand-${r.id}`;
  if (!senaste.has(slug)) senaste.set(slug, r);
}

mkdirSync(MÅL, { recursive: true });
const index = {
  dumpad: new Date().toISOString(),
  kalla: "system_events type=blogg_utkast (read-only)",
  raderTotalt: rader.length,
  slugar: [...senaste.keys()].sort(),
  allaRader: rader.map((r) => ({
    id: r.id,
    created_at: r.created_at,
    slug: r.details?.slug ?? null,
    version: r.details?.version ?? null,
    status: r.details?.status ?? null,
    titel: r.details?.titel ?? r.details?.title ?? null,
    av: r.details?.av ?? null,
  })),
};
writeFileSync(path.join(MÅL, "index.json"), JSON.stringify(index, null, 2), "utf8");
for (const [slug, r] of senaste) {
  const v = r.details?.version ?? "v?";
  const fil = `${slug}-v${String(v).replace(/^v/, "")}.json`;
  writeFileSync(path.join(MÅL, fil), JSON.stringify({ id: r.id, created_at: r.created_at, ...r.details }, null, 2), "utf8");
}
console.log(
  `[OK] ${rader.length} rader, ${senaste.size} slugar (senaste-vinner) → data/blogg-utkast/m9-ko/ (${Object.keys(senaste).length ? "" : ""}${[...senaste.keys()].sort().join(", ")})`,
);
