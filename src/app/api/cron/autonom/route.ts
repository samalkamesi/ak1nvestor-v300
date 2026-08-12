import { NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/autonom
 *
 * Autonom AI-organ loop — körs av Vercel Cron (var 6:e timme).
 * Denna endpoint:
 * 1. Analyserar systemets status
 * 2. Identifierar vad som behöver förbättras
 * 3. Sparar förslag som SystemEvent (i JSON)
 * 4. Returnerar rapport
 *
 * Vercel Cron config finns i vercel.json
 */

interface SystemReport {
  timestamp: string;
  status: "healthy" | "needs_attention" | "critical";
  checks: {
    homePage: boolean;
    megaTasks: boolean;
    analyses: boolean;
    supabase: boolean;
    courses: { total: number; deep: number; shallow: number };
  };
  recommendations: string[];
  nextActions: string[];
}

export async function GET() {
  const report: SystemReport = {
    timestamp: new Date().toISOString(),
    status: "healthy",
    checks: {
      homePage: false,
      megaTasks: false,
      analyses: false,
      supabase: false,
      courses: { total: 0, deep: 0, shallow: 0 },
    },
    recommendations: [],
    nextActions: [],
  };

  // 1. Check mega tasks
  try {
    const raw = readFileSync(path.join(process.cwd(), "data/export/mega-tasks.json"), "utf-8");
    const tasks = JSON.parse(raw);
    report.checks.megaTasks = tasks.length === 198;
    if (!report.checks.megaTasks) {
      report.recommendations.push("Mega tasks count mismatch — verify data/export/mega-tasks.json");
    }
  } catch {
    report.checks.megaTasks = false;
    report.recommendations.push("Cannot read mega-tasks.json — file missing");
  }

  // 2. Check analyses
  try {
    const dir = path.join(process.cwd(), "data/analyses");
    
    const files = readdirSync(dir).filter((f: string) => f.endsWith(".json"));
    report.checks.analyses = files.length >= 2;
    if (!report.checks.analyses) {
      report.recommendations.push("Less than 2 analyses — need more stock data");
    }
  } catch {
    report.checks.analyses = false;
  }

  // 3. Check courses depth
  try {
    const raw = readFileSync(path.join(process.cwd(), "src/features/deep-courses/data/deep-courses.json"), "utf-8");
    const courses = JSON.parse(raw);
    let deep = 0, shallow = 0;
    for (const [slug, course] of Object.entries(courses) as [string, any][]) {
      const total = course.chapters?.reduce((s: number, ch: any) =>
        s + ch.blocks?.reduce((s2: number, b: any) => s2 + b.content?.length || 0, 0) || 0, 0) || 0;
      if (total > 5000) deep++;
      else shallow++;
    }
    report.checks.courses = { total: Object.keys(courses).length, deep, shallow };
    if (shallow > 0) {
      report.recommendations.push(`${shallow} courses need depth expansion (run /api/cron/expand-courses)`);
      report.nextActions.push("Expand shallow courses");
    }
  } catch {
    report.checks.courses = { total: 0, deep: 0, shallow: 0 };
  }

  // 4. Check Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  report.checks.supabase = Boolean(supabaseUrl);

  // 5. Determine status
  const allChecks = [
    report.checks.megaTasks,
    report.checks.analyses,
    report.checks.supabase,
  ];
  if (allChecks.every(Boolean)) {
    report.status = "healthy";
  } else if (allChecks.some(Boolean)) {
    report.status = "needs_attention";
  } else {
    report.status = "critical";
  }

  // 6. Save report
  const reportPath = path.join(process.cwd(), "data/export/last-report.json");
  try {
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
  } catch {}

  // 7. Auto-actions based on report
  if (report.checks.courses.shallow > 0) {
    report.nextActions.push("Trigger /api/cron/expand-courses to expand shallow courses");
  }
  if (!report.checks.supabase) {
    report.nextActions.push("Add Supabase environment variables in Vercel");
  }

  return NextResponse.json(report);
}
