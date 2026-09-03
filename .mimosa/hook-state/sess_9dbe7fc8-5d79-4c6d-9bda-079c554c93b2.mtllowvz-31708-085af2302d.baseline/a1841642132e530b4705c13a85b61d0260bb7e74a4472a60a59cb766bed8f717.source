import { NextRequest, NextResponse } from "next/server";
import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TILLATNA = ["impulsvåg", "korrigering", "basbygge", ""];

/** PATCH /api/member/holding — medlemmens vågskattning per innehav.
 *  { holdingId, mikro, kort, medel, lang } — värden: impulsvåg|korrigering|basbygge|"" */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { holdingId, mikro, kort, medel, lang } = body;
    if (!holdingId) {
      return NextResponse.json({ error: "holdingId krävs" }, { status: 400 });
    }
    const vagor = { mikro, kort, medel, lang };
    for (const v of Object.values(vagor)) {
      if (v !== undefined && !TILLATNA.includes(String(v))) {
        return NextResponse.json(
          { error: "Ogiltig våg — använd impulsvåg, korrigering, basbygge eller tom" },
          { status: 400 }
        );
      }
    }
    const rest = getSupabaseRest();
    if (!rest) {
      return NextResponse.json({ error: "Supabase inte konfigurerad" }, { status: 500 });
    }
    const res = await fetch(`${rest.origin}/rest/v1/client_holdings?id=eq.${encodeURIComponent(holdingId)}`, {
      method: "PATCH",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        ...(mikro !== undefined && { wave_micro: mikro || null }),
        ...(kort !== undefined && { wave_short: kort || null }),
        ...(medel !== undefined && { wave_medium: medel || null }),
        ...(lang !== undefined && { wave_long: lang || null }),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Supabase ${res.status}` }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
