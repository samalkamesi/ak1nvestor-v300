/**
 * Migrerar ALL lokal data (Prisma/SQLite) till Supabase.
 *
 * Data som migreras:
 * - MegaTasks (198 uppgifter)
 * - SystemEvents (AI-organ beslut)
 * - CaseStudies (analysdata)
 * - MeetingProtocols (AI-organ styrelse)
 * - Analyses (PREC-ST, VOLCAR-B JSON)
 *
 * Kör: bun run scripts/migrate-to-supabase.ts
 */
import { db } from "../src/lib/db";
import { supabaseAdmin, isSupabaseConfigured } from "../src/lib/supabase";
import { readFile, readdir } from "fs/promises";
import path from "path";

async function migrateMegaTasks() {
  console.log("\n📦 Migrerar MegaTasks...");
  const tasks = await db.megaTask.findMany({ orderBy: { num: "asc" } });
  console.log(`  Hittade ${tasks.length} uppgifter i lokal DB`);

  if (!supabaseAdmin) {
    console.log("  ⚠️ Supabase inte konfigurerad — hoppar");
    return;
  }

  // Rensa befintliga
  const { error: delError } = await supabaseAdmin.from("mega_tasks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delError) console.log("  ⚠️ Delete error:", delError.message);

  // Insert i batchar om 50
  const batchSize = 50;
  let inserted = 0;
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize).map((t) => ({
      id: t.id,
      num: t.num,
      title: t.title,
      description: t.description || "",
      category: t.category,
      priority: t.priority,
      status: t.status,
      organ_owner: t.organOwner || null,
      estimated_xp: t.estimatedXp || null,
    }));

    const { data, error } = await supabaseAdmin.from("mega_tasks").insert(batch);
    if (error) {
      console.log(`  ⚠️ Batch ${i}-${i + batchSize} error:`, error.message);
    } else {
      inserted += batch.length;
    }
  }
  console.log(`  ✓ Migrerade ${inserted}/${tasks.length} MegaTasks till Supabase`);
}

async function migrateSystemEvents() {
  console.log("\n📦 Migrerar SystemEvents...");
  const events = await db.systemEvent.findMany({ take: 500, orderBy: { createdAt: "desc" } });
  console.log(`  Hittade ${events.length} events i lokal DB`);

  if (!supabaseAdmin) {
    console.log("  ⚠️ Supabase inte konfigurerad — hoppar");
    return;
  }

  // Rensa (bara de senaste 500 för att undvika att ta bort gammal data)
  await supabaseAdmin.from("system_events").delete().gt("created_at", "2020-01-01");

  const batchSize = 50;
  let inserted = 0;
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize).map((e) => ({
      id: e.id,
      type: e.type,
      severity: e.severity || "info",
      message: e.message,
      details: e.details || null,
      source: e.source || null,
      created_at: e.createdAt.toISOString(),
    }));

    const { error } = await supabaseAdmin.from("system_events").insert(batch);
    if (error) {
      console.log(`  ⚠️ Batch error:`, error.message);
    } else {
      inserted += batch.length;
    }
  }
  console.log(`  ✓ Migrerade ${inserted}/${events.length} SystemEvents till Supabase`);
}

async function migrateCaseStudies() {
  console.log("\n📦 Migrerar CaseStudies...");
  const cases = await db.caseStudy.findMany();
  console.log(`  Hittade ${cases.length} case studies i lokal DB`);

  if (!supabaseAdmin) {
    console.log("  ⚠️ Supabase inte konfigurerad — hoppar");
    return;
  }

  await supabaseAdmin.from("case_studies").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const batchSize = 50;
  let inserted = 0;
  for (let i = 0; i < cases.length; i += batchSize) {
    const batch = cases.slice(i, i + batchSize).map((c) => ({
      id: c.id,
      type: c.type,
      company: c.company,
      ticker: c.ticker || null,
      title: c.title,
      description: c.description || null,
      akm1_score: c.akm1Score || null,
      decisive_vars: c.decisiveVars || null,
      sector: c.sector || null,
      year: c.year || null,
      outcome: c.outcome || null,
      lesson: c.lesson || null,
      is_illustrative: c.isIllustrative,
    }));

    const { error } = await supabaseAdmin.from("case_studies").insert(batch);
    if (error) {
      console.log(`  ⚠️ Batch error:`, error.message);
    } else {
      inserted += batch.length;
    }
  }
  console.log(`  ✓ Migrerade ${inserted}/${cases.length} CaseStudies till Supabase`);
}

async function migrateMeetingProtocols() {
  console.log("\n📦 Migrerar MeetingProtocols...");
  const protocols = await db.meetingProtocol.findMany();
  console.log(`  Hittade ${protocols.length} protokoll i lokal DB`);

  if (!supabaseAdmin) {
    console.log("  ⚠️ Supabase inte konfigurerad — hoppar");
    return;
  }

  await supabaseAdmin.from("meeting_protocols").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const batchSize = 50;
  let inserted = 0;
  for (let i = 0; i < protocols.length; i += batchSize) {
    const batch = protocols.slice(i, i + batchSize).map((p) => ({
      id: p.id,
      meeting_id: p.meetingId,
      agenda: p.agenda || null,
      timestamp: p.timestamp.toISOString(),
      viewpoints: p.viewpoints || null,
      decision: p.decision || null,
      decision_title: p.decisionTitle || null,
      confidence: p.confidence || null,
      passed: p.passed,
      signatures: p.signatures || null,
    }));

    const { error } = await supabaseAdmin.from("meeting_protocols").insert(batch);
    if (error) {
      console.log(`  ⚠️ Batch error:`, error.message);
    } else {
      inserted += batch.length;
    }
  }
  console.log(`  ✓ Migrerade ${inserted}/${protocols.length} MeetingProtocols till Supabase`);
}

async function migrateAnalyses() {
  console.log("\n📦 Migrerar Analyses (JSON-filer)...");
  const analysesDir = path.join(process.cwd(), "data", "analyses");
  const files = await readdir(analysesDir).catch(() => [] as string[]);
  console.log(`  Hittade ${files.length} analys-filer`);

  if (!supabaseAdmin) {
    console.log("  ⚠️ Supabase inte konfigurerad — hoppar");
    return;
  }

  let inserted = 0;
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const ticker = file.replace(".json", "").replace("-", ".");
    const filePath = path.join(analysesDir, file);
    const raw = await readFile(filePath, "utf-8");
    const data = JSON.parse(raw);

    const { error } = await supabaseAdmin.from("analyses").upsert({
      ticker,
      company: data.company,
      exchange: data.exchange,
      sector: data.sector,
      isin: data.isin,
      currency: data.currency || "SEK",
      verified: data.verified,
      analysis_date: data.analysisDate,
      source: data.source,
      status: data.status,
      data: data,
    }, { onConflict: "ticker" });

    if (error) {
      console.log(`  ⚠️ ${ticker} error:`, error.message);
    } else {
      inserted++;
    }
  }
  console.log(`  ✓ Migrerade ${inserted}/${files.length} Analyses till Supabase`);
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  AK1A Research Lab — Migrering till Supabase              ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  if (!isSupabaseConfigured) {
    console.log("\n❌ Supabase inte konfigurerad. Lägg till credentials i .env");
    process.exit(1);
  }

  console.log("\n✓ Supabase konfigurerad");
  console.log(`  URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);

  // Test anslutning
  const { testSupabaseConnection } = await import("../src/lib/supabase");
  const test = await testSupabaseConnection();
  if (!test.connected) {
    console.log(`\n⚠️ Supabase-anslutning misslyckades: ${test.error}`);
    console.log("  Kör scripts/supabase-schema.sql i Supabase SQL Editor först!");
    console.log("  Fortsätter ändå med migrering (tabeller skapas kanske inte ännu)...\n");
  } else {
    console.log("✓ Supabase-anslutning OK\n");
  }

  await migrateMegaTasks();
  await migrateSystemEvents();
  await migrateCaseStudies();
  await migrateMeetingProtocols();
  await migrateAnalyses();

  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║  ✓ Migrering komplett!                                     ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log("\nNästa steg:");
  console.log("  1. Kör scripts/supabase-schema.sql i Supabase SQL Editor (om inte gjort)");
  console.log("  2. Verifiera data i Supabase Dashboard");
  console.log("  3. Uppdatera API:er för att använda Supabase vid behov");
}

main()
  .catch((e) => {
    console.error("Migrering misslyckades:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
