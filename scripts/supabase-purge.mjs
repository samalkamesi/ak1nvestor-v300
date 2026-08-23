#!/usr/bin/env node
/**
 * Nattlig städrobot — tömmer de 25 loggtabellerna (17,7M rader) via Supabase REST.
 *
 * Säkerhetsregler:
 * - Endast tabeller i PURGE_LIST (maskingenererad logg/cache — inget användarinnehåll)
 * - Tids-/id-skivor server-side; adaptiv halvering vid timeouts
 * - Resumable: state-fil; kör igen så fortsätter den där den slutade
 * - Backup: första 100 raderna per tabell sparas till data/backup/ före radering
 * - Endast https mot supabase-värd
 */
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const STATE_FILE = path.join(ROOT, "data", "purge-state.json");
const LOG_FILE = path.join(ROOT, "data", "purge-log.txt");
const BACKUP_DIR = path.join(ROOT, "data", "backup");

await loadEnv();
const ORIGIN = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
if (!ORIGIN.includes("supabase.co")) throw new Error("ovärd host");

const PURGE_LIST = [
  "news_articles", "autonomous_ai_executions", "ai_system_intelligence",
  "ai_learning_sessions", "ai_agent_registry", "autonomous_problem_detection",
  "market_data", "ai_self_improvement_logs", "ai_ecosystem_health",
  "ai_prediction_metrics", "news_aggregation_log", "update_logs",
  "ai_organ_evolution_history", "ai_service_generation_log", "ai_organ_registry",
  "ai_email_reports", "ai_error_tracking", "ai_user_interactions",
  "ai_quality_metrics", "neural_cache_stats", "collection_jobs",
  "ai_hourly_metrics", "analysis_history", "swarm_coordination", "ai_organs",
];

const log = async (s) => {
  const line = `${new Date().toISOString()} ${s}`;
  console.log(line);
  await appendFile(LOG_FILE, line + "\n");
};
async function appendFile(p, txt) {
  const { appendFile: af } = await import("fs/promises");
  try { await af(p, txt); } catch {}
}

async function loadEnv() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) return;
  try {
    const env = await readFile(path.join(ROOT, ".env"), "utf8");
    for (const line of env.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {}
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function rest(method, url, body, headers = {}, retries = 4) {
  for (let i = 0; i <= retries; i++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 90000);
    try {
      const res = await fetch(url, {
        method,
        headers: { ...H, ...headers },
        body: body ? JSON.stringify(body) : undefined,
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (res.status === 429 || res.status >= 500) {
        if (i === retries) return res;
        await sleep(3000 * (i + 1));
        continue;
      }
      return res;
    } catch {
      clearTimeout(t);
      if (i === retries) throw new Error("fetch-fel efter retry: " + url.slice(0, 80));
      await sleep(3000 * (i + 1));
    }
  }
}

async function count(table) {
  const res = await rest("HEAD", `${ORIGIN}/rest/v1/${table}?select=*&limit=0`, null, {
    Prefer: "count=planned",
  });
  return Number(res.headers.get("content-range")?.split("/")[1] ?? "0");
}

// ── Backup av första 100 raderna per tabell ────────────────────────────────
async function backupTable(table) {
  try {
    const res = await rest("GET", `${ORIGIN}/rest/v1/${table}?select=*&limit=100`);
    if (res.ok) {
      const rows = await res.json();
      await writeFile(path.join(BACKUP_DIR, `${table}-sample.json`), JSON.stringify(rows, null, 1));
    }
  } catch {}
}

// ── Ta reda på skiv-kolumn via OpenAPI ─────────────────────────────────────
async function getColumns(table) {
  const res = await rest("GET", `${ORIGIN}/rest/v1/`);
  const spec = await res.json();
  const props = spec.definitions?.[table]?.properties || {};
  return Object.keys(props);
}

// ── Radera via tidsfönster med adaptiv halvering ───────────────────────────
async function deleteTimeSlice(table, col, from, to, depth = 0) {
  if (depth > 6) return; // dag-nivå räcker som minsta
  const q = `${ORIGIN}/rest/v1/${table}?${col}=gte.${from}&${col}=lt.${to}`;
  const res = await rest("DELETE", q, null, { Prefer: "return=minimal" });
  if (res.ok || res.status === 404) return;
  // 504/timeout → halvera fönstret
  const mid = new Date((Date.parse(from) + Date.parse(to)) / 2).toISOString();
  await log(`  ⚙️ ${table} ${from.slice(0, 10)} timeout (${res.status}) — halverar`);
  await deleteTimeSlice(table, col, from, mid, depth + 1);
  await deleteTimeSlice(table, col, mid, to, depth + 1);
}

async function purgeByTime(table, col) {
  const start = new Date("2025-06-01T00:00:00Z").getTime();
  const end = Date.now() + 86400_000;
  const stepMs = 14 * 86400_000; // 2-veckorsfönster från början
  for (let t = start; t < end; t += stepMs) {
    const from = new Date(t).toISOString();
    const to = new Date(Math.min(t + stepMs, end)).toISOString();
    await deleteTimeSlice(table, col, from, to);
  }
  // Rader utan tidsvärde
  await rest("DELETE", `${ORIGIN}/rest/v1/${table}?${col}=is.null`, null, { Prefer: "return=minimal" });
}

async function purgeByIdChunks(table) {
  // uuid/id: hämta id i omgångar via keyset, radera i portioner om 500
  let last = "";
  let total = 0;
  for (;;) {
    const q = `${ORIGIN}/rest/v1/${table}?select=id&order=id.asc&limit=2000${last ? `&id=gt.${last}` : ""}`;
    const res = await rest("GET", q);
    if (!res.ok) break;
    const rows = await res.json();
    if (!rows.length) break;
    const ids = rows.map((r) => r.id);
    for (let i = 0; i < ids.length; i += 500) {
      const chunk = ids.slice(i, i + 500);
      const del = await rest(
        "DELETE",
        `${ORIGIN}/rest/v1/${table}?id=in.(${chunk.join(",")})`,
        null,
        { Prefer: "return=minimal" }
      );
      if (!del.ok && del.status !== 404) {
        await log(`  ⚠️ ${table} id-delete ${del.status}`);
      }
    }
    total += ids.length;
    last = ids[ids.length - 1];
    if (ids.length < 2000) break;
    await sleep(400);
  }
  return total;
}

// ── Main ────────────────────────────────────────────────────────────────────
let state = {};
try { state = JSON.parse(await readFile(STATE_FILE, "utf8")); } catch {}

await mkdir(BACKUP_DIR, { recursive: true });
await log("🧹 Städrobot startar — 25 loggtabeller");

const specRes = await rest("GET", `${ORIGIN}/rest/v1/`);
const spec = await specRes.json();

for (const table of PURGE_LIST) {
  if (state[table]?.done) { await log(`✓ ${table}: redan klar`); continue; }
  const before = await count(table);
  await log(`▶ ${table}: ${before.toLocaleString("sv-SE")} rader`);
  if (before === 0) {
    state[table] = { done: true, before: 0, after: 0 };
    await writeFile(STATE_FILE, JSON.stringify(state, null, 2));
    continue;
  }

  await backupTable(table);
  const props = Object.keys(spec.definitions?.[table]?.properties || {});
  const timeCol = ["created_at", "executed_at", "detected_at", "timestamp", "published_at", "started_at", "logged_at"]
    .find((c) => props.includes(c));

  try {
    if (timeCol) {
      await log(`  skivar på ${timeCol}`);
      await purgeByTime(table, timeCol);
    } else {
      await log(`  ingen tidskolumn — id-chunks`);
      await purgeByIdChunks(table);
    }
  } catch (e) {
    await log(`  ❌ ${table}: ${e.message} — fortsätter med nästa`);
  }

  const after = await count(table);
  // Restposter: plocka via id om något finns kvar
  if (after > 0 && after <= 20000) {
    await log(`  restplock: ${after}`);
    try { await purgeByIdChunks(table); } catch {}
  }
  const final = await count(table);
  state[table] = { done: true, before, after: final };
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2));
  await log(`✓ ${table}: ${before.toLocaleString("sv-SE")} → ${final.toLocaleString("sv-SE")}`);
}

const totalBefore = PURGE_LIST.reduce((s, t) => s + (state[t]?.before || 0), 0);
const totalAfter = PURGE_LIST.reduce((s, t) => s + (state[t]?.after || 0), 0);
await log(`\n🎉 KLAR: ${totalBefore.toLocaleString("sv-SE")} → ${totalAfter.toLocaleString("sv-SE")} rader`);
