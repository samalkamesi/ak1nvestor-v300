import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured, TABLES } from "@/lib/supabase";
import { readFileSync, readdirSync } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/migrate-to-supabase
 *
 * Migrerar ALL data från JSON-filer (data/export/) till Supabase.
 * Körs från Vercel.
 */
export async function GET() {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase inte konfigurerad" },
      { status: 500 }
    );
  }

  const results: any = {
    megaTasks: { total: 0, migrated: 0, error: null as string | null },
    caseStudies: { total: 0, migrated: 0, error: null as string | null },
    systemEvents: { total: 0, migrated: 0, error: null as string | null },
    meetingProtocols: { total: 0, migrated: 0, error: null as string | null },
    analyses: { total: 0, migrated: 0, error: null as string | null },
  };

  const batchSize = 50;

  // 1. Mega Tasks
  try {
    const raw = readFileSync(path.join(process.cwd(), "data/export/mega-tasks.json"), "utf-8");
    const tasks = JSON.parse(raw);
    results.megaTasks.total = tasks.length;

    await supabaseAdmin.from(TABLES.TASKS).delete().neq("id", "00000000-0000-0000-0000-000000000000");

    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize).map((t: any) => ({
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

      const { error } = await supabaseAdmin.from(TABLES.TASKS).insert(batch);
      if (error) {
        results.megaTasks.error = error.message;
        break;
      }
      results.megaTasks.migrated += batch.length;
    }
  } catch (e: any) {
    results.megaTasks.error = e.message;
  }

  // 2. Case Studies
  try {
    const raw = readFileSync(path.join(process.cwd(), "data/export/case-studies.json"), "utf-8");
    const cases = JSON.parse(raw);
    results.caseStudies.total = cases.length;

    await supabaseAdmin.from(TABLES.CASES).delete().neq("id", "00000000-0000-0000-0000-000000000000");

    for (let i = 0; i < cases.length; i += batchSize) {
      const batch = cases.slice(i, i + batchSize).map((c: any) => ({
        id: c.id,
        case_type: c.type,
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

      const { error } = await supabaseAdmin.from(TABLES.CASES).insert(batch);
      if (error) {
        results.caseStudies.error = error.message;
        break;
      }
      results.caseStudies.migrated += batch.length;
    }
  } catch (e: any) {
    results.caseStudies.error = e.message;
  }

  // 3. System Events
  try {
    const raw = readFileSync(path.join(process.cwd(), "data/export/system-events.json"), "utf-8");
    const events = JSON.parse(raw);
    results.systemEvents.total = events.length;

    await supabaseAdmin.from(TABLES.SYSTEM_EVENTS).delete().gt("created_at", "2020-01-01");

    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize).map((e: any) => ({
        id: e.id,
        event_type: e.type,
        severity: e.severity || "info",
        message: e.message,
        details: e.details || null,
        source: e.source || null,
        created_at: new Date(e.createdAt).toISOString(),
      }));

      const { error } = await supabaseAdmin.from(TABLES.SYSTEM_EVENTS).insert(batch);
      if (error) {
        results.systemEvents.error = error.message;
        break;
      }
      results.systemEvents.migrated += batch.length;
    }
  } catch (e: any) {
    results.systemEvents.error = e.message;
  }

  // 4. Meeting Protocols
  try {
    const raw = readFileSync(path.join(process.cwd(), "data/export/meeting-protocols.json"), "utf-8");
    const protocols = JSON.parse(raw);
    results.meetingProtocols.total = protocols.length;

    await supabaseAdmin.from(TABLES.PROTOCOLS).delete().neq("id", "00000000-0000-0000-0000-000000000000");

    for (const p of protocols) {
      const { error } = await supabaseAdmin.from(TABLES.PROTOCOLS).insert({
        id: p.id,
        meeting_id: p.meetingId,
        agenda: p.agenda || null,
        timestamp: new Date(p.timestamp).toISOString(),
        viewpoints: p.viewpoints || null,
        decision: p.decision || null,
        decision_title: p.decisionTitle || null,
        confidence: p.confidence || null,
        passed: p.passed,
        signatures: p.signatures || null,
      });
      if (error) {
        results.meetingProtocols.error = error.message;
        break;
      }
      results.meetingProtocols.migrated++;
    }
  } catch (e: any) {
    results.meetingProtocols.error = e.message;
  }

  // 5. Analyses
  try {
    const analysesDir = path.join(process.cwd(), "data/export/analyses");
    const files = readdirSync(analysesDir).filter((f) => f.endsWith(".json"));
    results.analyses.total = files.length;

    for (const file of files) {
      const raw = readFileSync(path.join(analysesDir, file), "utf-8");
      const data = JSON.parse(raw);
      const ticker = file.replace(".json", "").replace("-", ".");

      const { error } = await supabaseAdmin.from(TABLES.ANALYSES).upsert({
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
        results.analyses.error = error.message;
        break;
      }
      results.analyses.migrated++;
    }
  } catch (e: any) {
    results.analyses.error = e.message;
  }

  return NextResponse.json({ success: true, results });
}
