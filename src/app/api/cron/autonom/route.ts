import { NextResponse, NextRequest } from "next/server";
import { readFileSync, readdirSync } from "fs";
import path from "path";
import { runOrgans } from "@/lib/autonom/organ";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/autonom — Autonom AI-organ loop (BOUNDED edition).
 * Körs av Vercel Cron dagligen. Se src/lib/autonom/organ.ts för säkerhetsdesign:
 * kill-switch, 500-raderstak, 30-dagars retention, EN skrivning per körning.
 */
export async function GET(req: NextRequest) {
  // Vercel cron skickar Authorization: Bearer CRON_SECRET (om satt)
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const report = await runOrgans({
    readJson: (p) => {
      try {
        return readFileSync(path.join(process.cwd(), p), "utf8");
      } catch {
        return null;
      }
    },
    listDir: (p) => {
      try {
        return readdirSync(path.join(process.cwd(), p));
      } catch {
        return [];
      }
    },
  });

  return NextResponse.json(report);
}
