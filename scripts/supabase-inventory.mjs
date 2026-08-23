#!/usr/bin/env node
/**
 * Inventerar ALLA tabeller i Supabase-projektet (auto-upptäckt via OpenAPI)
 * och listar radantal i fallande ordning — hittar vad som svämmat.
 *
 * Användning: node scripts/supabase-inventory.mjs [--top 40]
 * Endast läsning (HEAD count=planned — billigt även för miljonrader).
 */
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const env = await readFile(path.join(ROOT, ".env"), "utf8");
    for (const line of env.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {}
}

const ORIGIN = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const topIdx = process.argv.indexOf("--top");
const TOP = topIdx >= 0 ? Number(process.argv[topIdx + 1]) || 40 : 40;

if (!ORIGIN.includes("supabase.co")) throw new Error("Ovärd host: " + ORIGIN);

// 1. Hämta tabellista från OpenAPI-spec
const specRes = await fetch(`${ORIGIN}/rest/v1/`, { headers: HEADERS });
if (!specRes.ok) throw new Error(`OpenAPI: ${specRes.status}`);
const spec = await specRes.json();
const tables = Object.keys(spec.definitions || {});

console.log(`📋 ${tables.length} tabeller — inventerar radantal (HEAD count=planned)…\n`);

// 2. Räkna rader, i parallella batchar om 24
const counts = [];
const BATCH = 24;
for (let i = 0; i < tables.length; i += BATCH) {
  const batch = tables.slice(i, i + BATCH);
  const results = await Promise.all(
    batch.map(async (t) => {
      try {
        const res = await fetch(`${ORIGIN}/rest/v1/${t}?select=*&limit=0`, {
          method: "HEAD",
          headers: { ...HEADERS, Prefer: "count=planned" },
          signal: AbortSignal.timeout(20000),
        });
        if (res.status === 401) return { t, n: -401 };
        const n = Number(res.headers.get("content-range")?.split("/")[1] ?? "0");
        return { t, n: Number.isFinite(n) ? n : 0 };
      } catch {
        return { t, n: -1 };
      }
    })
  );
  counts.push(...results);
  process.stdout.write(`\r${Math.min(i + BATCH, tables.length)}/${tables.length} klar…`);
}

console.log("\n");

// 3. Rapport
const ok = counts.filter((c) => c.n >= 0);
const failed = counts.filter((c) => c.n < 0);
const sorted = [...ok].sort((a, b) => b.n - a.n);
const totalRows = ok.reduce((s, c) => s + c.n, 0);
const nonEmpty = ok.filter((c) => c.n > 0);

console.log(`SUMMA: ${totalRows.toLocaleString("sv-SE")} rader i ${nonEmpty.length} icke-tomma tabeller (${ok.length - nonEmpty.length} tomma)`);
if (failed.length) console.log(`(${failed.length} tabeller kunde inte räknas)`);

console.log(`\nTopp ${Math.min(TOP, sorted.length)} tabeller:`);
console.log("RAD".padStart(12) + "  TABELL");
for (const c of sorted.slice(0, TOP)) {
  console.log(String(c.n.toLocaleString("sv-SE")).padStart(12) + "  " + c.t);
}

// Spara full rapport för analys
const { writeFileSync } = await import("fs");
writeFileSync(
  path.join(ROOT, "data", "supabase-inventory.json"),
  JSON.stringify(
    { generatedAt: new Date().toISOString(), totalTables: tables.length, totalRows, counts: sorted },
    null,
    2
  )
);
console.log(`\n💾 Full rapport: data/supabase-inventory.json`);
