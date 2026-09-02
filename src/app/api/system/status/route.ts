import { NextResponse } from "next/server";
import { readFileSync, readdirSync } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/system/status
 *
 * Fullständig system-status för AK1A Research Lab.
 * Visar hälsa för alla system, data, API:er och autonom status.
 */
export async function GET() {
  const status: any = {
    timestamp: new Date().toISOString(),
    site: "AK1A Research Lab",
    domain: "lab.ak1nvestor.com",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "production",
    systems: {},
    data: {},
    autonomous: {},
  };

  // 1. Mega Tasks
  try {
    const raw = readFileSync(path.join(process.cwd(), "data/export/mega-tasks.json"), "utf-8");
    const tasks = JSON.parse(raw);
    status.data.megaTasks = {
      count: tasks.length,
      status: tasks.length === 198 ? "complete" : "incomplete",
      source: "JSON file (GitHub)",
    };
  } catch {
    status.data.megaTasks = { count: 0, status: "missing", source: "N/A" };
  }

  // 2. Case Studies
  try {
    const raw = readFileSync(path.join(process.cwd(), "data/export/case-studies.json"), "utf-8");
    const cases = JSON.parse(raw);
    status.data.caseStudies = {
      count: cases.length,
      status: "complete",
      source: "JSON file (GitHub)",
    };
  } catch {
    status.data.caseStudies = { count: 0, status: "missing" };
  }

  // 3. Analyses
  try {
    const dir = path.join(process.cwd(), "data/analyses");
    const files = readdirSync(dir).filter((f: string) => f.endsWith(".json"));
    status.data.analyses = {
      count: files.length,
      tickers: files.map((f: string) => f.replace(".json", "").replace("-", ".")),
      status: "complete",
      source: "JSON file (GitHub)",
    };
  } catch {
    status.data.analyses = { count: 0, status: "missing" };
  }

  // 4. Courses
  try {
    const raw = readFileSync(path.join(process.cwd(), "public/deep-courses.json"), "utf-8");
    const courses = JSON.parse(raw);
    let deep = 0, shallow = 0;
    for (const [slug, course] of Object.entries(courses) as [string, any][]) {
      const total = course.chapters?.reduce((s: number, ch: any) =>
        s + ch.blocks?.reduce((s2: number, b: any) => s2 + (b.content?.length || 0), 0) || 0, 0) || 0;
      if (total > 5000) deep++;
      else shallow++;
    }
    status.data.courses = {
      total: Object.keys(courses).length,
      deep,
      shallow,
      status: shallow > 0 ? "needs_expansion" : "complete",
      source: "JSON file (GitHub)",
    };
  } catch {
    status.data.courses = { total: 0, status: "missing" };
  }

  // 5. Supabase
  status.systems.supabase = {
    configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "missing",
    tables: 13,
    role: "dynamic data (members, bookings, activities)",
  };

  // 6. Autonomous systems
  status.autonomous = {
    aiOrganLoop: {
      endpoint: "/api/cron/autonom",
      schedule: "every 6 hours (Vercel Cron)",
      status: "configured",
    },
    courseExpansion: {
      endpoint: "/api/cron/expand-courses",
      schedule: "every 12 hours (Vercel Cron)",
      status: "configured",
      coursesRemaining: status.data.courses?.shallow || 0,
    },
    autoDeploy: {
      trigger: "git push to main",
      platform: "Vercel",
      status: "active",
    },
  };

  // 7. Overall health
  const allHealthy = [
    status.data.megaTasks?.status === "complete",
    status.data.caseStudies?.status === "complete",
    status.data.analyses?.status === "complete",
    status.systems.supabase?.configured,
  ];
  status.health = allHealthy.every(Boolean) ? "healthy" : "needs_attention";

  return NextResponse.json(status);
}
