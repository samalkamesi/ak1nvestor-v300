import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supabaseAdmin, isSupabaseConfigured, TABLES } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/migrate-to-supabase
 *
 * Migrerar ALL lokal data till Supabase.
 * Körs från Vercel (som har nätverksåtkomst till Supabase).
 */
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase inte konfigurerad. Lägg till environment variables i Vercel." },
      { status: 500 }
    );
  }

  const results = {
    megaTasks: { total: 0, migrated: 0, error: null as string | null },
    caseStudies: { total: 0, migrated: 0, error: null as string | null },
    systemEvents: { total: 0, migrated: 0, error: null as string | null },
    meetingProtocols: { total: 0, migrated: 0, error: null as string | null },
  };

  try {
    // 1. Mega Tasks
    try {
      const tasks = await db.megaTask.findMany({ orderBy: { num: "asc" } });
      results.megaTasks.total = tasks.length;

      // Rensa befintliga
      await supabaseAdmin.from(TABLES.TASKS).delete().neq("id", "00000000-0000-0000-0000-000000000000");

      // Insert i batchar
      const batchSize = 50;
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
      const cases = await db.caseStudy.findMany();
      results.caseStudies.total = cases.length;

      await supabaseAdmin.from(TABLES.CASES).delete().neq("id", "00000000-0000-0000-0000-000000000000");

      for (let i = 0; i < cases.length; i += batchSize) {
        const batch = cases.slice(i, i + batchSize).map((c) => ({
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
      const events = await db.systemEvent.findMany({ take: 100, orderBy: { createdAt: "desc" } });
      results.systemEvents.total = events.length;

      await supabaseAdmin.from(TABLES.SYSTEM_EVENTS).delete().gt("created_at", "2020-01-01");

      for (let i = 0; i < events.length; i += batchSize) {
        const batch = events.slice(i, i + batchSize).map((e) => ({
          id: e.id,
          event_type: e.type,
          severity: e.severity || "info",
          message: e.message,
          details: e.details || null,
          source: e.source || null,
          created_at: e.createdAt.toISOString(),
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
      const protocols = await db.meetingProtocol.findMany();
      results.meetingProtocols.total = protocols.length;

      await supabaseAdmin.from(TABLES.PROTOCOLS).delete().neq("id", "00000000-0000-0000-0000-000000000000");

      for (const p of protocols) {
        const { error } = await supabaseAdmin.from(TABLES.PROTOCOLS).insert({
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

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message, results },
      { status: 500 }
    );
  }
}

const batchSize = 50;
