import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const HEADERS = () => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
});

export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const result: any = {
    timestamp: new Date().toISOString(),
    tables: [],
    totalRows: 0,
    recommendations: [],
  };

  const tables = [
    "mega_tasks", "case_studies", "analyses", "meeting_protocols",
    "members", "client_portfolios", "client_holdings", "client_analyses",
    "bookings", "user_activities", "system_events", "organ_consultations",
    "ak1_indicators",
  ];

  for (const table of tables) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/${table}?select=id&limit=10000`,
        { headers: HEADERS() }
      );
      
      if (res.ok) {
        const data = await res.json();
        const count = Array.isArray(data) ? data.length : 0;
        result.tables.push({ name: table, rows: count, status: "ok" });
        result.totalRows += count;
      } else {
        result.tables.push({ name: table, rows: 0, status: `error: ${res.status}` });
      }
    } catch (e: any) {
      result.tables.push({ name: table, rows: 0, status: `error: ${e.message}` });
    }
  }

  result.tables.sort((a: any, b: any) => b.rows - a.rows);
  result.largestTable = result.tables[0];

  for (const t of result.tables) {
    if (t.rows > 1000) {
      result.recommendations.push(`${t.name} has ${t.rows} rows — consider cleanup`);
    }
  }

  const activities = result.tables.find((t: any) => t.name === "user_activities");
  if (activities && activities.rows > 500) {
    result.recommendations.push("user_activities growing fast — run /api/supabase/cleanup");
  }

  return NextResponse.json(result);
}
