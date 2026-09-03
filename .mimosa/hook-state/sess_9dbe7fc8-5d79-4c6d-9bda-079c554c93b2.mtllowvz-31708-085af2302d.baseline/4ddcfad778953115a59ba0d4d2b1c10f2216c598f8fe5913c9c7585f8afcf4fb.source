import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const HEADERS = () => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
});

/**
 * GET /api/supabase/cleanup — Analyzes and cleans Supabase database
 * 
 * Actions:
 * 1. Shows table sizes and row counts
 * 2. Deletes old data (>7 days)
 * 3. Returns cleanup report
 */
export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const report: any = {
    timestamp: new Date().toISOString(),
    tables: {},
    cleanup: {},
    before: {},
    after: {},
  };

  // 1. Count rows in each table
  const tables = [
    { name: "mega_tasks", cleanup: false },
    { name: "case_studies", cleanup: false },
    { name: "analyses", cleanup: false },
    { name: "meeting_protocols", cleanup: false },
    { name: "members", cleanup: false },
    { name: "client_portfolios", cleanup: false },
    { name: "client_holdings", cleanup: false },
    { name: "client_analyses", cleanup: false },
    { name: "bookings", cleanup: false },
    { name: "user_activities", cleanup: true, days: 7 },
    { name: "system_events", cleanup: true, days: 7 },
    { name: "organ_consultations", cleanup: true, days: 7 },
  ];

  for (const table of tables) {
    try {
      // Count rows
      const countRes = await fetch(
        `${SUPABASE_URL}/rest/v1/${table.name}?select=id&limit=1000`,
        { headers: HEADERS() }
      );
      
      if (countRes.ok) {
        const data = await countRes.json();
        const count = Array.isArray(data) ? data.length : 0;
        report.tables[table.name] = { rows: count, cleanup: table.cleanup };
        report.before[table.name] = count;
      } else {
        report.tables[table.name] = { rows: "error", status: countRes.status };
      }
    } catch (e: any) {
      report.tables[table.name] = { error: e.message };
    }
  }

  // 2. Clean up old data
  for (const table of tables) {
    if (!table.cleanup || !table.days) continue;

    try {
      // Delete old records (>7 days)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - table.days);
      const cutoff = cutoffDate.toISOString();

      const deleteRes = await fetch(
        `${SUPABASE_URL}/rest/v1/${table.name}?created_at=lt.${cutoff}`,
        {
          method: "DELETE",
          headers: HEADERS(),
        }
      );

      if (deleteRes.ok) {
        // Count remaining
        const remainingRes = await fetch(
          `${SUPABASE_URL}/rest/v1/${table.name}?select=id&limit=1000`,
          { headers: HEADERS() }
        );
        const remaining = await remainingRes.json();
        const afterCount = Array.isArray(remaining) ? remaining.length : 0;
        
        report.cleanup[table.name] = {
          deleted: report.before[table.name] - afterCount,
          remaining: afterCount,
          status: "cleaned",
        };
        report.after[table.name] = afterCount;
      } else {
        report.cleanup[table.name] = { status: "error", code: deleteRes.status };
      }
    } catch (e: any) {
      report.cleanup[table.name] = { error: e.message };
    }
  }

  // 3. Check for duplicate data
  // Check mega_tasks for duplicates
  try {
    const tasksRes = await fetch(
      `${SUPABASE_URL}/rest/v1/mega_tasks?select=num,id&order=num.asc`,
      { headers: HEADERS() }
    );
    if (tasksRes.ok) {
      const tasks = await tasksRes.json();
      const nums = tasks.map((t: any) => t.num);
      const duplicates = nums.filter((n: number, i: number) => nums.indexOf(n) !== i);
      if (duplicates.length > 0) {
        report.duplicates = { mega_tasks: duplicates };
        // Delete duplicates (keep first occurrence)
        for (const dup of duplicates) {
          const dupTasks = tasks.filter((t: any) => t.num === dup);
          for (let i = 1; i < dupTasks.length; i++) {
            await fetch(
              `${SUPABASE_URL}/rest/v1/mega_tasks?id=eq.${dupTasks[i].id}`,
              { method: "DELETE", headers: HEADERS() }
            );
          }
        }
        report.cleanup.duplicates_deleted = duplicates.length;
      }
    }
  } catch {}

  // 4. Summary
  report.summary = {
    totalTables: tables.length,
    tablesWithCleanup: tables.filter(t => t.cleanup).length,
    totalRowsBefore: Object.values(report.before).reduce((a: number, b: any) => a + (typeof b === "number" ? b : 0), 0),
    totalRowsAfter: Object.values(report.after).reduce((a: number, b: any) => a + (typeof b === "number" ? b : 0), 0),
  };

  return NextResponse.json(report);
}
