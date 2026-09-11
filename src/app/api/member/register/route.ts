import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getSupabaseRest } from "@/lib/supabase-rest";
import { skickaVboutLead, vboutStatusText } from "@/lib/vbout";
import { lasMedlemsidForKod, saneraRefKod, skrivReferralFramgang } from "@/lib/referral";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, phone, memberType = "free", sessionId, ref } = body;

    if (!email) {
      return NextResponse.json({ error: "email krävs" }, { status: 400 });
    }

    // m10 steg 1: ref-koden saneras SERVER-SIDE (formatvakt — ogiltig ⇒ "")
    // och används ALDRIG i svar/körlogg. Självvärvarfallet är omöjligt: kod
    // skapas endast för befintliga medlemmar, attribuering endast för NYA.
    const refKod = saneraRefKod(ref);

    const rest = getSupabaseRest();
    if (!rest) {
      return NextResponse.json({ error: "Supabase inte konfigurerad. Lägg till NEXT_PUBLIC_SUPABASE_URL och SUPABASE_SERVICE_ROLE_KEY i Vercel Environment Variables." }, { status: 500 });
    }

    // Check if member exists in Supabase
    const checkRes = await fetch(
      `${rest.origin}/rest/v1/members?email=eq.${encodeURIComponent(email)}&select=*`,
      { headers: rest.headers }
    );
    const existing = await checkRes.json();

    if (existing && existing.length > 0) {
      // Update lastLogin
      const member = existing[0];
      await fetch(`${rest.origin}/rest/v1/members?id=eq.${member.id}`, {
        method: "PATCH",
        headers: rest.headers,
        body: JSON.stringify({
          last_login_at: new Date().toISOString(),
          ...(name && { name }),
          ...(phone && { phone }),
        }),
      });
      return NextResponse.json({ member: { ...member, last_login_at: new Date().toISOString() }, isNew: false });
    }

    // Create new member in Supabase
    const createRes = await fetch(`${rest.origin}/rest/v1/members`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({
        email,
        name: name || null,
        phone: phone || null,
        member_type: memberType,
        session_id: sessionId || null,
      }),
    });
    
    if (!createRes.ok) {
      const errText = await createRes.text();
      return NextResponse.json({ error: `Supabase error: ${createRes.status} ${errText.substring(0, 200)}` }, { status: 500 });
    }

    // Vbout-hjälp: endast nybildade adresser (ej test-prefix) matas vidare
    const isNewMemberLead = (e: string) => !/^(test|synthetic|dev)@/i.test(e);

    const newMember = await createRes.json();

    // m10 steg 1 — REFERENS-ATTRIBUERING (endast NYA registreringar, AC2):
    // bär begäran en giltig ref-kod OCH matchar den en lagrad aktiv tipskod ⇒
    // skriv ETT anonymiserat aggregat-event (type=referral, details=
    // {framgang:true, kod}). Den nya elevens identitet kopplas ALDRIG till
    // koden (ingen social graf) och ref-fältet kastas efter matchingen — det
    // finns ALDRIG i svaret eller på medlemsraden. Fire-and-forget: en misslyckad
    // attribuering får ALDRIG påverka registreringen (vbout-mönstret).
    if (refKod && rest) {
      void lasMedlemsidForKod(rest, refKod)
        .then((tipsgivarid) => {
          if (!tipsgivarid) return; // okänd/spärrad kod ⇒ tyst noll — exakt som utan kod
          return skrivReferralFramgang(rest, refKod);
        })
        .catch(() => {
          /* attribuering är statistik, inte registreringsdata — tyst härifrån */
        });
    }

    // Vbout — ny medlem är sajtens viktigaste lead: mata marknadsautomationen
    // (fire-and-forget: misslyckande påverkar ALDRIG registreringen)
    if (isNewMemberLead(email)) {
      void skickaVboutLead({
        email,
        namn: name || undefined,
        kalla: "medlem",
        notering: `Ny gratismedlem (${memberType})`,
      }).then((r) => {
        if (!r.ok) console.warn("[vbout] leadmiss medlem:", vboutStatusText(r));
      });
    }

    return NextResponse.json({ member: newMember[0] || newMember, isNew: true });
  } catch {
    // LOGIN-2.0: rå e.message läcker ALDRIG ut (kunde bära Supabase-detaljer).
    return NextResponse.json({ error: "Registreringen misslyckades — försök igen." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const email = new URL(req.url).searchParams.get("email");
    if (!email) return NextResponse.json({ error: "email krävs" }, { status: 400 });

    const rest = getSupabaseRest();
    if (!rest) {
      return NextResponse.json({ member: null });
    }

    const res = await fetch(
      `${rest.origin}/rest/v1/members?email=eq.${encodeURIComponent(email)}&select=*&limit=1`,
      { headers: rest.headers }
    );
    const data = await res.json();
    return NextResponse.json({ member: data?.[0] || null });
  } catch {
    // LOGIN-2.0: generell text — rå felmeddelanden läcker aldrig ut.
    return NextResponse.json({ error: "Kunde inte läsa medlem just nu." }, { status: 500 });
  }
}
