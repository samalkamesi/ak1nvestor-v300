#!/usr/bin/env node
/**
 * Migrerar ALL data från JSON-exporter (data/export/) till Supabase.
 * Ingen Prisma/SQLite — läser direkt från fil.
 *
 * Data som migreras:
 * - mega-tasks.json (198 uppgifter)        → mega_tasks
 * - case-studies.json (201 cases)          → case_studies
 * - meeting-protocols.json (styrelse)      → meeting_protocols
 * - system-events.json (AI-organ events)   → system_events
 * - analyses/*.json (PREC-ST, VOLCAR-B)    → analyses
 *
 * Kör: node scripts/migrate-to-supabase.mjs
 *
 * Kräver miljövariabler (eller .env-fil):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { readFile, readdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const EXPORT_DIR = path.join(ROOT, "data", "export");

// ── Env (läser .env om den finns) ───────────────────────────────────────────
async function loadEnv() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const env = await readFile(path.join(ROOT, ".env"), "utf8");
    for (const line of env.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}
await loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Endast https mot offentlig värd — avvisa localhost/privata adresser
function assertValidUrl(raw) {
  let u;
  try {
    u = new URL(raw);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL är inte en giltig URL");
  }
  if (u.protocol !== "https:") throw new Error("NEXT_PUBLIC_SUPABASE_URL måste använda https");
  const h = u.hostname.toLowerCase();
  if (
    h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") ||
    h === "0.0.0.0" || h === "[::1]" || h === "::1" ||
    /^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) ||
    /^169\.254\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h)
  ) {
    throw new Error(`Otillåten värd: ${h} (privat/lokal adress)`);
  }
  return u.origin;
}
const SUPABASE_ORIGIN = assertValidUrl(SUPABASE_URL);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Saknar NEXT_PUBLIC_SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY");
  console.error("   Skapa .env i projektroten eller exportera variablerna.");
  process.exit(1);
}

const HEADERS = () => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
});

async function rest(method, table, body, query = "", extraHeaders = {}) {
  const res = await fetch(`${SUPABASE_ORIGIN}/rest/v1/${table}${query}`, {
    method,
    headers: {
      ...HEADERS(),
      ...(method === "POST" ? { Prefer: "return=minimal" } : {}),
      ...extraHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${table} → ${res.status}: ${text.slice(0, 300)}`);
  }
}

async function clearTable(table) {
  await rest("DELETE", table, null, "?id=neq.00000000-0000-0000-0000-000000000000");
}

async function insertBatched(table, rows, batchSize = 50) {
  for (let i = 0; i < rows.length; i += batchSize) {
    await rest("POST", table, rows.slice(i, i + batchSize));
  }
}

async function readJson(...parts) {
  return JSON.parse(await readFile(path.join(EXPORT_DIR, ...parts), "utf8"));
}

const iso = (v) => (v ? new Date(v).toISOString() : null);

// ── 1. MegaTasks ────────────────────────────────────────────────────────────
async function migrateMegaTasks() {
  console.log("\n📦 mega_tasks...");
  const tasks = await readJson("mega-tasks.json");
  const rows = tasks.map((t) => ({
    id: String(t.id),
    num: t.num,
    title: t.title,
    description: t.description || "",
    category: t.category,
    priority: t.priority || "MEDEL",
    status: t.status || "pending",
    organ_owner: t.organOwner || null,
    estimated_xp: t.estimatedXp ?? null,
  }));
  await clearTable("mega_tasks");
  await insertBatched("mega_tasks", rows);
  console.log(`  ✓ ${rows.length} mega_tasks`);
}

// ── 2. CaseStudies ──────────────────────────────────────────────────────────
async function migrateCaseStudies() {
  console.log("\n📦 case_studies...");
  const cases = await readJson("case-studies.json");
  const rows = cases.map((c) => ({
    id: String(c.id),
    type: c.type,
    company: c.company,
    ticker: c.ticker || null,
    title: c.title,
    description: c.description || null,
    akm1_score: c.akm1Score ?? null,
    decisive_vars: c.decisiveVars || null,
    sector: c.sector || null,
    year: c.year ?? null,
    outcome: c.outcome || null,
    lesson: c.lesson || null,
    is_illustrative: Boolean(c.isIllustrative),
  }));
  await clearTable("case_studies");
  await insertBatched("case_studies", rows);
  console.log(`  ✓ ${rows.length} case_studies`);
}

// ── 3. MeetingProtocols ─────────────────────────────────────────────────────
async function migrateMeetingProtocols() {
  console.log("\n📦 meeting_protocols...");
  const protocols = await readJson("meeting-protocols.json");
  const rows = protocols.map((p) => ({
    id: String(p.id),
    meeting_id: p.meetingId,
    agenda: p.agenda || null,
    timestamp: iso(p.timestamp) || new Date().toISOString(),
    viewpoints: p.viewpoints ?? null,
    decision: p.decision ?? null,
    decision_title: p.decisionTitle || null,
    confidence: p.confidence || null,
    passed: p.passed ?? null,
    signatures: p.signatures ?? null,
  }));
  if (!rows.length) return console.log("  ⚠️ Inga protokoll — hoppar");
  await clearTable("meeting_protocols");
  await insertBatched("meeting_protocols", rows);
  console.log(`  ✓ ${rows.length} meeting_protocols`);
}

// ── 4. SystemEvents ─────────────────────────────────────────────────────────
async function migrateSystemEvents() {
  console.log("\n📦 system_events...");
  const events = await readJson("system-events.json");
  const rows = events.map((e) => ({
    id: String(e.id),
    type: e.type,
    severity: e.severity || "info",
    message: e.message,
    details: e.details ?? null,
    source: e.source || null,
    created_at: iso(e.createdAt) || new Date().toISOString(),
  }));
  if (!rows.length) return console.log("  ⚠️ Inga events — hoppar");
  await clearTable("system_events");
  await insertBatched("system_events", rows);
  console.log(`  ✓ ${rows.length} system_events`);
}

// ── 5. Analyses ─────────────────────────────────────────────────────────────
async function migrateAnalyses() {
  console.log("\n📦 analyses...");
  const files = (await readdir(path.join(EXPORT_DIR, "analyses"))).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    const a = await readJson("analyses", file);
    const row = {
      ticker: a.ticker,
      company: a.company,
      exchange: a.exchange || null,
      sector: a.sector || null,
      isin: a.isin || null,
      currency: a.currency || "SEK",
      verified: a.verified || null,
      analysis_date: a.analysisDate || null,
      source: a.source || null,
      status: a.status || null,
      data: a,
    };
    // Upsert på ticker
    try {
      await rest("POST", "analyses", row, "?on_conflict=ticker", {
        Prefer: "return=minimal, resolution=merge-duplicates",
      });
    } catch (e) {
      console.log(`  ⚠️ ${file}: ${e.message}`);
      continue;
    }
    console.log(`  ✓ ${a.ticker} (${file})`);
  }
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Migrerar data/export/ → Supabase");
  console.log(`   URL: ${SUPABASE_ORIGIN}`);
  let failed = 0;
  for (const step of [migrateMegaTasks, migrateCaseStudies, migrateMeetingProtocols, migrateSystemEvents, migrateAnalyses]) {
    try {
      await step();
    } catch (e) {
      failed++;
      console.log(`  ❌ ${step.name}: ${e.message}`);
    }
  }
  console.log(failed === 0 ? "\n✅ Migrering klar!" : `\n⚠️ Klar med ${failed} fel`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
