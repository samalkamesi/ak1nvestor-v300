import { NextRequest, NextResponse } from "next/server";
import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/kundbild?memberId=xxx — kundens A-Ö-profil.
 * Bygger intressebild från aktiviteter (sektioner + sidvisningar),
 * medlemsdata och portföljer. Deterministisk — ingen gissning utan
 * aktivitetsdata renderas "okänd" ärligt.
 */
export async function GET(req: NextRequest) {
  const memberId = new URL(req.url).searchParams.get("memberId");
  if (!memberId) {
    return NextResponse.json({ error: "memberId krävs" }, { status: 400 });
  }
  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json({ error: "Supabase inte konfigurerad" }, { status: 500 });
  }
  const sedan = new Date(Date.now() - 90 * 86400_000).toISOString();

  try {
    const [mRes, aRes, pRes] = await Promise.all([
      fetch(`${rest.origin}/rest/v1/members?id=eq.${encodeURIComponent(memberId)}&select=*`, {
        headers: rest.headers,
        signal: AbortSignal.timeout(10000),
      }),
      fetch(
        `${rest.origin}/rest/v1/user_activities?session_id=eq.${encodeURIComponent("m-" + memberId)}&created_at=gte.${sedan}&select=action,section,created_at&limit=2000`,
        { headers: rest.headers, signal: AbortSignal.timeout(10000) }
      ),
      fetch(`${rest.origin}/rest/v1/client_portfolios?member_id=eq.${encodeURIComponent(memberId)}&select=id,name,analysis_status,total_value`, {
        headers: rest.headers,
        signal: AbortSignal.timeout(10000),
      }),
    ]);

    const medlem = (await mRes.json())?.[0];
    if (!medlem) {
      return NextResponse.json({ error: "Medlem hittades inte" }, { status: 404 });
    }
    const aktiviteter = (await aRes.json()) || [];
    const portfoljer = (await pRes.json()) || [];

    // Intressen från sektioner och sidor
    const intressen = new Map<string, number>();
    for (const a of aktiviteter) {
      if (!a.section) continue;
      intressen.set(a.section, (intressen.get(a.section) || 0) + 1);
    }
    const topIntressen = [...intressen.entries()]
      .sort((x, y) => y[1] - x[1])
      .slice(0, 6)
      .map(([namn, antal]) => ({ namn, antal }));

    // Önskemål — härledda (regelbaserat, redovisade som Härledning)
    const onskemolen: string[] = [];
    const har = (s: string) => [...intressen.keys()].some((k) => k.includes(s));
    if (har("kurser") || har("/kurser/")) onskemolen.push("Vill lära sig metodiken (kurser)");
    if (har("/kalkylator")) onskemolen.push("Vill räkna själv (kalkylatorn)");
    if (har("analyser") || har("/analyser")) onskemolen.push("Intresserad av aktieanalyser");
    if (har("labb") || har("/labb")) onskemolen.push("Övar på case (labbet)");
    if (har("medlemskap")) onskemolen.push("Överväger medlemskap");
    if (portfoljer.length > 0) onskemolen.push("Har portfölj — redo för djupanalys");
    if (onskemolen.length === 0) onskemolen.push("Ingen aktivitet ännu — bifoga vid första besöket");

    const senaste = aktiviteter[0]?.created_at || null;

    return NextResponse.json({
      medlem: {
        id: medlem.id,
        email: medlem.email,
        namn: medlem.name,
        niva: medlem.member_type,
        medlemSedan: medlem.created_at,
        senasteInloggning: medlem.last_login_at,
      },
      engagemang: {
        aktiviteter90d: aktiviteter.length,
        senasteAktivitet: senaste,
      },
      intressen: topIntressen,
      onskemolen,
      portfoljer,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
