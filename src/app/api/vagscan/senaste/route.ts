import { NextResponse } from "next/server";
import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/vagscan/senaste — läs senaste autonoma vågkartan för UI:t.
 * Hämtar senaste system_events-rad med type=vagscan (created_at desc, limit 1)
 * och returnerar details + genererad. Utan Supabase eller utan sparat event
 * → { saknas: true } (kortet visar sitt saknas-tillstånd).
 */
export async function GET() {
  const sb = getSupabaseRest();
  if (sb) {
    try {
      const res = await fetch(
        `${sb.origin}/rest/v1/system_events?type=eq.vagscan&select=details,created_at&order=created_at.desc&limit=1`,
        { headers: sb.headers, cache: "no-store" }
      );
      if (res.ok) {
        const rader = (await res.json()) as Array<{
          details: Record<string, unknown> | null;
          created_at: string;
        }>;
        const rad = rader[0];
        if (rad && rad.details) {
          const genererad = typeof rad.details.genererad === "string" ? rad.details.genererad : rad.created_at;
          return NextResponse.json({ ...rad.details, genererad });
        }
      }
    } catch {
      // tyst → saknas-tillstånd
    }
  }
  return NextResponse.json({ saknas: true });
}
