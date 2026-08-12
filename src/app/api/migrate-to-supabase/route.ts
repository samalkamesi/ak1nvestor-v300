import { NextResponse } from "next/server";
import { readFileSync, readdirSync } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

async function supabaseInsert(table: string, rows: any[]) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${table}: ${res.status} ${text.substring(0, 200)}`);
  }
}

async function supabaseDeleteAll(table: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=neq.00000000-0000-0000-0000-000000000000`, {
    method: "DELETE",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
    },
  });
}

async function supabaseUpsert(table: string, row: any, onConflict: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": `return=minimal,resolution=merge-duplicates`,
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${table}: ${res.status} ${text.substring(0, 200)}`);
  }
}

export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ error: "Supabase env vars missing" }, { status: 500 });
  }

  const results: any = {
    megaTasks: { total: 0, migrated: 0, error: null },
    caseStudies: { total: 0, migrated: 0, error: null },
    systemEvents: { total: 0, migrated: 0, error: null },
    meetingProtocols: { total: 0, migrated: 0, error: null },
    analyses: { total: 0, migrated: 0, error: null },
  };

  const batchSize = 50;

  // 1. Mega Tasks
  try {
    const tasks = JSON.parse(readFileSync(path.join(process.cwd(), "data/export/mega-tasks.json"), "utf-8"));
    results.megaTasks.total = tasks.length;
    await supabaseDeleteAll("mega_tasks");
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize).map((t: any) => ({
        id: t.id, num: t.num, title: t.title, description: t.description || "",
        category: t.category, priority: t.priority, status: t.status,
        organ_owner: t.organOwner || null, estimated_xp: t.estimatedXp || null,
      }));
      await supabaseInsert("mega_tasks", batch);
      results.megaTasks.migrated += batch.length;
    }
  } catch (e: any) { results.megaTasks.error = e.message; }

  // 2. Case Studies
  try {
    const cases = JSON.parse(readFileSync(path.join(process.cwd(), "data/export/case-studies.json"), "utf-8"));
    results.caseStudies.total = cases.length;
    await supabaseDeleteAll("case_studies");
    for (let i = 0; i < cases.length; i += batchSize) {
      const batch = cases.slice(i, i + batchSize).map((c: any) => ({
        id: c.id, case_type: c.type, company: c.company, ticker: c.ticker || null,
        title: c.title, description: c.description || null, akm1_score: c.akm1Score || null,
        decisive_vars: c.decisiveVars || null, sector: c.sector || null, year: c.year || null,
        outcome: c.outcome || null, lesson: c.lesson || null, is_illustrative: c.isIllustrative,
      }));
      await supabaseInsert("case_studies", batch);
      results.caseStudies.migrated += batch.length;
    }
  } catch (e: any) { results.caseStudies.error = e.message; }

  // 3. System Events
  try {
    const events = JSON.parse(readFileSync(path.join(process.cwd(), "data/export/system-events.json"), "utf-8"));
    results.systemEvents.total = events.length;
    await supabaseDeleteAll("system_events");
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize).map((e: any) => ({
        id: e.id, event_type: e.type, severity: e.severity || "info",
        message: e.message, details: e.details || null, source: e.source || null,
        created_at: new Date(e.createdAt).toISOString(),
      }));
      await supabaseInsert("system_events", batch);
      results.systemEvents.migrated += batch.length;
    }
  } catch (e: any) { results.systemEvents.error = e.message; }

  // 4. Meeting Protocols
  try {
    const protocols = JSON.parse(readFileSync(path.join(process.cwd(), "data/export/meeting-protocols.json"), "utf-8"));
    results.meetingProtocols.total = protocols.length;
    await supabaseDeleteAll("meeting_protocols");
    for (const p of protocols) {
      await supabaseInsert("meeting_protocols", [{
        id: p.id, meeting_id: p.meetingId, agenda: p.agenda || null,
        timestamp: new Date(p.timestamp).toISOString(),
        viewpoints: p.viewpoints || null, decision: p.decision || null,
        decision_title: p.decisionTitle || null, confidence: p.confidence || null,
        passed: p.passed, signatures: p.signatures || null,
      }]);
      results.meetingProtocols.migrated++;
    }
  } catch (e: any) { results.meetingProtocols.error = e.message; }

  // 5. Analyses
  try {
    const dir = path.join(process.cwd(), "data/export/analyses");
    const files = readdirSync(dir).filter(f => f.endsWith(".json"));
    results.analyses.total = files.length;
    for (const file of files) {
      const data = JSON.parse(readFileSync(path.join(dir, file), "utf-8"));
      const ticker = file.replace(".json", "").replace("-", ".");
      await supabaseUpsert("analyses", {
        ticker, company: data.company, exchange: data.exchange, sector: data.sector,
        isin: data.isin, currency: data.currency || "SEK", verified: data.verified,
        analysis_date: data.analysisDate, source: data.source, status: data.status,
        data: data,
      }, "ticker");
      results.analyses.migrated++;
    }
  } catch (e: any) { results.analyses.error = e.message; }

  return NextResponse.json({ success: true, results });
}
