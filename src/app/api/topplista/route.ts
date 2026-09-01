import { NextRequest, NextResponse } from "next/server";
import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/topplista — LEADERBOARD (social layer)
 *
 * XP lever i localStorage per elev; varje inloggad synk skickar en snapshot
 * som system_event (type=xp_sync). GET aggregerar senaste snapshot per elev.
 * Inga personuppgifter läcker: namn visas om eleven angett namn, annars maskeras
 * e-posten ("anna.k@…"). Också: eager_validering av indata (caps), och endast
 * supabase-rest (begränsad host från env) anropas.
 */

type SyncBody = { email?: string; namn?: string; xp?: number; niva?: number; kurser?: number };

function maskera(email: string): string {
  const [lokal, doman] = email.split("@");
  if (!doman) return "Elev";
  const initialer = lokal
    .split(/[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((d) => d[0]?.toUpperCase() + ".")
    .join(" ");
  return initialer || "Elev";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SyncBody;
    const email = String(body.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "ogiltig e-post" }, { status: 400 });
    }
    const xp = Math.max(0, Math.min(Number(body.xp) || 0, 10_000_000));
    const niva = Math.max(1, Math.min(Number(body.niva) || 1, 100));
    const kurser = Math.max(0, Math.min(Number(body.kurser) || 0, 1000));
    const namn = String(body.namn || "").slice(0, 60).trim();

    const rest = getSupabaseRest();
    if (!rest) {
      return NextResponse.json({ error: "Supabase ej konfigurerad" }, { status: 500 });
    }

    const res = await fetch(`${rest.origin}/rest/v1/system_events`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        type: "xp_sync",
        severity: "info",
        message: `XP-synk: ${namn || maskera(email)} — nivå ${niva}, ${xp} XP`,
        details: { email, namn, xp, niva, kurser },
        source: "leaderboard",
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Supabase ${res.status}` }, { status: 500 });
    }

    // Returnera elevens placering efter synken
    const rankRes = await fetch(
      `${rest.origin}/rest/v1/system_events?type=eq.xp_sync&select=details&order=created_at.desc&limit=500`,
      { headers: rest.headers, cache: "no-store" }
    );
    let rank: number | null = null;
    let total: number = 0;
    if (rankRes.ok) {
      const rader = (await rankRes.json()) as Array<{ details: Record<string, unknown> }>;
      const senaste = new Map<string, number>();
      for (const r of rader) {
        const e = String(r.details?.email || "").toLowerCase();
        if (!e || senaste.has(e)) continue;
        senaste.set(e, Number(r.details?.xp) || 0);
      }
      const sortrad = [...senaste.entries()].sort((a, b) => b[1] - a[1]);
      total = sortrad.length;
      const idx = sortrad.findIndex(([e]) => e === email);
      rank = idx >= 0 ? idx + 1 : null;
    }
    return NextResponse.json({ ok: true, rank, total });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rest = getSupabaseRest();
    if (!rest) {
      return NextResponse.json({ topplista: [] });
    }

    const res = await fetch(
      `${rest.origin}/rest/v1/system_events?type=eq.xp_sync&select=details,created_at&order=created_at.desc&limit=500`,
      { headers: rest.headers, cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json({ topplista: [] }, { status: 200 });
    }
    const rader = (await res.json()) as Array<{ details: Record<string, unknown>; created_at: string }>;

    // Senaste snapshot per e-post vinner
    const senaste = new Map<string, Record<string, unknown> & { datum: string }>();
    for (const r of rader) {
      const d = r.details || {};
      const email = String(d.email || "").toLowerCase();
      if (!email || senaste.has(email)) continue;
      senaste.set(email, { ...d, datum: r.created_at });
    }

    const topplista = [...senaste.values()]
      .map((d) => ({
        namn: String(d.namn || "").trim() || maskera(String(d.email || "")),
        xp: Number(d.xp) || 0,
        niva: Number(d.niva) || 1,
        kurser: Number(d.kurser) || 0,
        datum: String(d.datum || "").slice(0, 10),
      }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 20);

    return NextResponse.json({ topplista, antal: senaste.size });
  } catch (e: any) {
    return NextResponse.json({ topplista: [], error: e.message }, { status: 200 });
  }
}
