import { NextResponse } from "next/server";
import { readFileSync, readdirSync } from "fs";
import path from "path";
import { runOrgans } from "@/lib/autonom/organ";
import { fattaBeslut, signalerFranRapport } from "@/lib/autonom/styrelse";
import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/styrelse/beslut — AI-organ-styrelsens aktuella utvecklingsprioritering.
 * Tillståndslös: räknas från grunden vid varje anrop. Inga skrivningar.
 */
export async function GET() {
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

  // Medlemsantal (valfritt — utan Supabase blir signalen null)
  let medlemmar: number | null = null;
  const rest = getSupabaseRest();
  if (rest) {
    try {
      const res = await fetch(`${rest.origin}/rest/v1/members?select=id&limit=1`, {
        method: "HEAD",
        headers: { ...rest.headers, Prefer: "count=planned" },
        signal: AbortSignal.timeout(10000),
      });
      medlemmar = Number(res.headers.get("content-range")?.split("/")[1] ?? 0) || 0;
    } catch {}
  }

  const signal = signalerFranRapport(report, { medlemmar });
  const protokoll = fattaBeslut(signal);

  return NextResponse.json({
    ...protokoll,
    underlag: { signal, organRapport: report },
  });
}
