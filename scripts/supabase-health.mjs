#!/usr/bin/env node
/**
 * Supabase-hälsokontroll + säker rensning av loggdata.
 *
 * Läge 1 (standard) — endast läsning, ingen risk:
 *   node scripts/supabase-health.mjs
 *   → radantal (planned, billigt) för alla 13 tabeller + senaste aktivitet
 *
 * Läge 2 — rensa flyktiga loggtabeller (behåll senaste N dagar):
 *   node scripts/supabase-health.mjs --purge-logs --keep-days 14
 *   → raderar gamla rader ur system_events, user_activities, organ_consultations
 *     (rensa-loggdata; innehållstabeller rörs aldrig)
 *
 * Läser .env i projektroten. Endast https mot public värd.
 */
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

await loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function assertOrigin(raw) {
  const u = new URL(raw);
  if (u.protocol !== "https:") throw new Error("endast https tillåts");
  const h = u.hostname.toLowerCase();
  if (
    h === "localhost" || h.endsWith(".local") ||
    /^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) ||
    /^169\.254\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h)
  ) {
    throw new Error(`otillåten värd: ${h}`);
  }
  return u.origin;
}

async function loadEnv() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const env = await readFile(path.join(ROOT, ".env"), "utf8");
    for (const line of env.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {}
}

const ORIGIN = assertOrigin(SUPABASE_URL);
const HEADERS = () => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
});

const TABLES = [
  "analyses",
  "ak1_indicators",
  "case_studies",
  "mega_tasks",
  "meeting_protocols",
  "members",
  "client_portfolios",
  "client_holdings",
  "client_analyses",
  "bookings",
  "user_activities",
  "system_events",
  "organ_consultations",
];

// Tabeller där vi kan titta på senaste skrivna raden för att se om något fortfarande skriver
const VOLATILE = ["system_events", "user_activities", "organ_consultations", "members", "bookings"];
// Loggtabeller som är säkra att gallra (innehållet finns i data/export eller är ren logg)
const PURGEABLE = ["system_events", "user_activities", "organ_consultations"];

const args = process.argv.slice(2);
const purge = args.includes("--purge-logs");
const keepDaysIdx = args.indexOf("--keep-days");
const keepDays = keepDaysIdx >= 0 ? Number(args[keepDaysIdx + 1]) || 14 : 14;

async function countRows(table) {
  const res = await fetch(`${ORIGIN}/rest/v1/${table}?select=*&limit=1`, {
    method: "HEAD",
    headers: { ...HEADERS(), Prefer: "count=planned" },
  });
  return Number(res.headers.get("content-range")?.split("/")[1] ?? "0");
}

async function latestRow(table) {
  const timeCol = table === "meeting_protocols" ? "timestamp" : "created_at";
  const res = await fetch(
    `${ORIGIN}/rest/v1/${table}?select=${timeCol}&order=${timeCol}.desc&limit=1`,
    { headers: HEADERS() }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return rows?.[0]?.[timeCol] ?? null;
}

async function purgeOld(table, days) {
  const cutoff = new Date(Date.now() - days * 86400_000).toISOString();
  const timeCol = table === "meeting_protocols" ? "timestamp" : "created_at";
  let total = 0;
  // Radera i stycken om 5000 för att undvika timeouts på stora tabeller
  for (;;) {
    const res = await fetch(
      `${ORIGIN}/rest/v1/${table}?${timeCol}=lt.${cutoff}&select=id&limit=5000`,
      { headers: { ...HEADERS(), Prefer: "return=representation" } }
    );
    if (!res.ok) throw new Error(`${table}: ${res.status} ${(await res.text()).slice(0, 200)}`);
    const rows = await res.json();
    if (!rows.length) break;
    const ids = rows.map((r) => r.id);
    const del = await fetch(
      `${ORIGIN}/rest/v1/${table}?id=in.(${ids.join(",")})`,
      { method: "DELETE", headers: { ...HEADERS(), Prefer: "return=minimal" } }
    );
    if (!del.ok) throw new Error(`${table} delete: ${del.status}`);
    total += ids.length;
    if (ids.length < 5000) break;
  }
  return total;
}

async function main() {
  console.log(`🔍 Supabase-hälsa — ${ORIGIN}`);
  console.log(purge
    ? `🧹 RENSNING: ${PURGEABLE.join(", ")} — behåller senaste ${keepDays} dagarna\n`
    : "Läge: läsning (ingen data ändras)\n");

  const report = {};
  for (const t of TABLES) {
    try {
      const count = await countRows(t);
      report[t] = { rows: count };
      let extra = "";
      if (VOLATILE.includes(t)) {
        const latest = await latestRow(t);
        report[t].latest = latest;
        if (latest) extra = ` | senast: ${latest}`;
      }
      console.log(`  ${t.padEnd(22)} ${String(count).padStart(8)} rader${extra}`);
    } catch (e) {
      console.log(`  ${t.padEnd(22)} FEL: ${e.message.slice(0, 120)}`);
    }
  }

  if (purge) {
    console.log("");
    for (const t of PURGEABLE) {
      try {
        const n = await purgeOld(t, keepDays);
        report[t].purged = n;
        console.log(`  🧹 ${t}: raderade ${n} rader (äldre än ${keepDays} dagar)`);
      } catch (e) {
        console.log(`  ⚠️ ${t}: ${e.message.slice(0, 160)}`);
      }
    }
    console.log("\nℹ️ Diskutrymme frigörs fullt först efter VACUUM (SQL Editor):");
    console.log('   VACUUM (ANALYZE) system_events; VACUUM (ANALYZE) user_activities; VACUUM (ANALYZE) organ_consultations;');
  }

  console.log("\n✅ Klar");
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
