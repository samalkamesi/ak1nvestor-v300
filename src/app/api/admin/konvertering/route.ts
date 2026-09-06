import { NextRequest, NextResponse } from "next/server";
import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/admin/konvertering — konverteringsvyns aggregat (MARKNADS-BESLUT VÅG 1b).
 *
 * Sju steg ur BEFINTLIGA källor — NOLL nya spår, NOLL skrivningar (P6/AC1):
 *   1. Besökare            system_events type=trafik — unika sessioner
 *                          (details.s) 24 h/7 d/30 d (bounded läsning 3 000).
 *   2. Gratismedlemmar     members (PostgREST count=exact): totalt + nya 30 d.
 *   2b. Tips-värvar        system_events type=referral (details.framgang=
 *      (m10 steg 1)        true) — registreringar som bar en giltig tipskod.
 *                          AGGREGAT: ingen koppling till den nya elevens
 *                          identitet (m10-referral.md AC2 — ingen social graf).
 *   3. Aktiva elever       user_activities 30 d, action ≠ page_view,
 *                          unika session_id — SKATTNING (XP lever bara i
 *                          elevens localStorage; m7 §3a).
 *   4. Fas 2-ansökningar   system_events type=fas2_ansokan (totalt + 30 d).
 *   5. Prenumerations-     email_kö (details.typ=prenumeration-intention) +
 *      intentioner         konvertering_intention (aktivera-panelens A4-event,
 *                          anonymiserat: nivå/period/pris — ingen persondata).
 *   6. Betalande           members member_type ≠ free — MANUELLT underhållen
 *                          (aktivering via mejl; 0 är det ärliga svaret).
 *
 * GDPR (AC4): aggregat per period, ALDRIG per individ — vyn försöker inte
 * koppla hashad trafik-session till member-id.
 *
 * Skydd: x-admin-password (ADMIN_PASSWORD) — samma mönster som /api/trafik;
 * utan lösenord svaras 401 (AC5). Modulmemo 5 min:GET:arna mot Supabase
 * körs högst en gång per 5:e minut per instans (forskninglage-mönstret).
 *
 * Alla räknare används med Prefer: count=exact — "planned" är en PostgreSQL-
 * skattning som kan avvika kraftigt; ärliga tal kräver exakt räkning (P4).
 */

// ── Admin-lås (mönster från /api/trafik) ─────────────────────────────────────

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function arAdmin(req: NextRequest): boolean {
  const expected = process.env.ADMIN_PASSWORD || "AK1A-2026";
  const urHeader = req.headers.get("x-admin-password");
  const authorization = req.headers.get("authorization");
  const provided = urHeader
    ? urHeader
    : authorization && authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";
  return !!provided && timingSafeEqual(provided, expected);
}

// ── Modulmemo 5 min ──────────────────────────────────────────────────────────

const MEMO_MS = 5 * 60_000;
let memo: { vid: number; svar: unknown } | null = null;

// ── Svartyper ────────────────────────────────────────────────────────────────

type KonverteringsKvalitet = "MÄTT" | "SKATTAD" | "MANUELL";

type KonverteringsSvar = {
  ok: true;
  genererad: string;
  spann: { fran: string | null; till: string };
  steg: {
    id: string;
    namn: string;
    varde: number;
    sub?: string;
    kalla: string;
    kvalitet: KonverteringsKvalitet;
    notering: string;
  }[];
  grader: {
    fran: string;
    till: string;
    taljare: number;
    namnare: number;
    procent: number | null;
    fonster: string;
  }[];
  luckor: string[];
  urvalNotering: string;
};

// ── Hjälpare ─────────────────────────────────────────────────────────────────

type TrafikRad = {
  created_at?: string | null;
  details?: { s?: string | null; puls?: boolean | null } | null;
};

/** HEAD med count=exact → äkta antal (planned är en skattning — P4). */
async function antalExakt(
  rest: NonNullable<ReturnType<typeof getSupabaseRest>>,
  filtrum: string
): Promise<number> {
  try {
    const res = await fetch(`${rest.origin}/rest/v1/${filtrum}`, {
      method: "HEAD",
      headers: { ...rest.headers, Prefer: "count=exact" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return 0;
    return Number(res.headers.get("content-range")?.split("/")[1] ?? 0) || 0;
  } catch {
    return 0;
  }
}

const DAG_MS = 86_400_000;

// ── GET ──────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!arAdmin(req)) {
    return NextResponse.json(
      { ok: false, error: "Admin-lösenord krävs (x-admin-password)." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (memo !== null && Date.now() - memo.vid < MEMO_MS) {
    return NextResponse.json(memo.svar, { headers: { "Cache-Control": "no-store" } });
  }

  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json(
      { ok: false, error: "Supabase ej konfigurerad — konverteringsvyn kräver NEXT_PUBLIC_SUPABASE_URL och nyckel." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const nu = Date.now();
  const fran30d = new Date(nu - 30 * DAG_MS).toISOString();

  // Alla läsningar parallellt — INGA skrivningar (AC1).
  const [trafikRes, medTotalt, medGratis, medBetalande, medNya30, aktivaRes, fas2Totalt, fas2D30, koPrenTotalt, koPrenD30, konvIntTotalt, konvIntD30, refTotalt, refD30] =
    await Promise.all([
      // 1. Trafik: bounded läsning (samma gräns som /api/trafik).
      fetch(
        `${rest.origin}/rest/v1/system_events?type=eq.trafik&select=created_at,details&order=created_at.desc&limit=3000`,
        { headers: rest.headers, signal: AbortSignal.timeout(12_000) }
      ),
      // 2. Medlemmar (exakta räkningar).
      antalExakt(rest, "members?select=id"),
      antalExakt(rest, "members?member_type=eq.free&select=id"),
      antalExakt(rest, "members?member_type=neq.free&select=id"),
      antalExakt(rest, `members?created_at=gte.${fran30d}&select=id`),
      // 3. Aktiva: aktivitetsspåret 30 d (action ≠ page_view, unika sessioner).
      fetch(
        `${rest.origin}/rest/v1/user_activities?select=session_id,action,created_at&created_at=gte.${fran30d}&order=created_at.desc&limit=10000`,
        { headers: rest.headers, signal: AbortSignal.timeout(12_000) }
      ),
      // 4. Fas 2-ansökningar.
      antalExakt(rest, "system_events?type=eq.fas2_ansokan&select=id"),
      antalExakt(rest, `system_events?type=eq.fas2_ansokan&created_at=gte.${fran30d}&select=id`),
      // 5. Intentioner: mejl-kön (nyhetsbrevschecken) + anonymiserade event.
      antalExakt(rest, "system_events?type=eq.email_k%C3%B6&details-%3E%3Etyp=eq.prenumeration-intention&select=id"),
      antalExakt(
        rest,
        `system_events?type=eq.email_k%C3%B6&details-%3E%3Etyp=eq.prenumeration-intention&created_at=gte.${fran30d}&select=id`
      ),
      antalExakt(rest, "system_events?type=eq.konvertering_intention&select=id"),
      antalExakt(rest, `system_events?type=eq.konvertering_intention&created_at=gte.${fran30d}&select=id`),
      // 2b. m10 steg 1: tips-värvar — attribuerade registreringar (aggregat).
      antalExakt(rest, "system_events?type=eq.referral&details-%3E%3Eframgang=eq.true&select=id"),
      antalExakt(rest, `system_events?type=eq.referral&details-%3E%3Eframgang=eq.true&created_at=gte.${fran30d}&select=id`),
    ]);

  // 1. Besökare — unika sessioner per fönster (details.s = hashad token).
  let trafikRader: TrafikRad[] = [];
  try {
    if (trafikRes.ok) trafikRader = (await trafikRes.json()) || [];
  } catch {
    /* tomt är ett giltigt svar */
  }
  const unika = (sedan: number) =>
    new Set(
      trafikRader
        .filter((r) => Date.parse(r.created_at || "") >= nu - sedan && r.details?.s)
        .map((r) => r.details!.s as string)
    ).size;
  const besokare24 = unika(DAG_MS);
  const besokare7 = unika(7 * DAG_MS);
  const besokare30 = unika(30 * DAG_MS);
  const aldstaTraffik = trafikRader.length
    ? trafikRader.reduce(
        (min, r) => (Date.parse(r.created_at || "") < min ? Date.parse(r.created_at || "") : min),
        Infinity
      )
    : null;

  // 3. Aktiva — unika session_id där action ≠ page_view (beslut VÅG 1b).
  let aktiva = 0;
  try {
    if (aktivaRes.ok) {
      const rader = (await aktivaRes.json()) || [];
      aktiva = new Set(
        (rader as { session_id?: string | null; action?: string | null }[])
          .filter((r) => r.session_id && r.action && r.action !== "page_view")
          .map((r) => r.session_id as string)
      ).size;
    }
  } catch {
    /* 0 = dokumenterad lucka */
  }

  // 5. Intentioner — mejlkön + anonymiserade event kan överlappa (redovisas separat).
  const brev = koPrenTotalt;
  const brev30 = koPrenD30;
  const anonyma = konvIntTotalt;
  const anonyma30 = konvIntD30;

  // ── Tratten ───────────────────────────────────────────────────────────────
  const steg: KonverteringsSvar["steg"] = [
    {
      id: "besokare",
      namn: "Besökare",
      varde: besokare30,
      sub: `${besokare24.toLocaleString("sv-SE")} senaste 24 h · ${besokare7.toLocaleString("sv-SE")} senaste 7 d · visas: unika 30 d`,
      kalla: "system_events type=trafik (hashade sessioner)",
      kvalitet: "MÄTT",
      notering:
        "Egen mätning utan cookies: sessionens första händelse + 30 % stickprov av sidvisningar; enbart besökare med analys-samtycke räknas som unika. Bounded läsning: de 3 000 senaste raderna.",
    },
    {
      id: "medlemmar",
      namn: "Gratismedlemmar",
      varde: medGratis,
      sub: `${medNya30.toLocaleString("sv-SE")} nya senaste 30 d · totalt ${medTotalt.toLocaleString("sv-SE")} konton`,
      kalla: "members (PostgREST count=exact)",
      kvalitet: "MÄTT",
      notering:
        "Gratis Fas 1-konton (member_type=free) — kostnadsfritt, för alltid. Graden nedan räknas på NYA medlemmar 30 d mot besökare 30 d (samma fönster).",
    },
    {
      id: "referral",
      namn: "Tips-värvar (elev-för-elev)",
      varde: refTotalt,
      sub: `${refD30.toLocaleString("sv-SE")} senaste 30 d`,
      kalla: "system_events type=referral (details.framgang=true)",
      kvalitet: "MÄTT",
      notering:
        "m10 steg 1 (våg 69): registreringar som bar en giltig tipskod från ett elev-kort. Ren statistik — ingen belöning, ingen koppling till den nya elevens identitet (ingen social graf). Belöningssystemet (tack/badges) är medvetet ej byggt: väntar på kundens policy-uppdatering J1–J2.",
    },
    {
      id: "aktiva",
      namn: "Aktiva elever (30 d)",
      varde: aktiva,
      sub: "unika sessioner med riktig aktivitet (ej sidbläddring)",
      kalla: "user_activities, action ≠ page_view, unika session_id 30 d",
      kvalitet: "SKATTAD",
      notering:
        "Skattning ur aktivitetsspåret: servern ser kursöppningar, quiz och portföljbyggen — men XP och framsteg lever bara i elevens localStorage, så engagerade elever utan spårad aktivitet syns ej. Graden blandar fönster (aktiva 30 d / samtliga gratismedlemmar) — läs som engagemangsgrad.",
    },
    {
      id: "fas2",
      namn: "Fas 2-ansökningar",
      varde: fas2Totalt,
      sub: `${fas2D30.toLocaleString("sv-SE")} senaste 30 d`,
      kalla: "system_events type=fas2_ansokan",
      kvalitet: "MÄTT",
      notering: "Ansökningar till utbildningen med grundaren (äkt selectivitet — vi kan avböja).",
    },
    {
      id: "intentioner",
      namn: "Prenumerationsintentioner",
      varde: anonyma + brev,
      sub: `${anonyma.toLocaleString("sv-SE")} anonymiserade (${anonyma30.toLocaleString("sv-SE")} senaste 30 d) + ${brev.toLocaleString("sv-SE")} med nyhetsbrevscheck (${brev30.toLocaleString("sv-SE")} senaste 30 d)`,
      kalla: "system_events: type=konvertering_intention + email_kö details.typ=prenumeration-intention",
      kvalitet: "MÄTT",
      notering:
        "Aktiveringsbegäranden på /prenumeration. EFTER intention-patchen (VÅG 1b) skickas ALLTID ett anonymiserat event (nivå, period, pris — ingen persondata); nyhetsbrevschecken ger dessutom ett köat mejl. De två delräkningarna kan överlappa för samma begäran — delräkningarna är sanningen, summan är tak.",
    },
    {
      id: "betalande",
      namn: "Betalande",
      varde: medBetalande,
      sub: medBetalande === 0 ? "manuellt flöde — inget betalflöde är kopplat ännu" : "member_type underhållen manuellt",
      kalla: "members member_type ≠ free",
      kvalitet: "MANUELL",
      notering:
        "Aktivering sker manuellt via mejl (info@ak1nvestor.com) tills betalpartnern är kopplad — member_type ändras för hand. 0 är det ärliga svaret, inte ett mätfel.",
    },
  ];

  const grad = (taljare: number, namnare: number): number | null =>
    namnare > 0 ? Math.round((taljare / namnare) * 1000) / 10 : null;

  const grader: KonverteringsSvar["grader"] = [
    {
      fran: "besokare",
      till: "medlemmar",
      taljare: medNya30,
      namnare: besokare30,
      procent: grad(medNya30, besokare30),
      fonster: "nya medlemmar 30 d / besökare 30 d",
    },
    {
      fran: "medlemmar",
      till: "aktiva",
      taljare: aktiva,
      namnare: medGratis,
      procent: grad(aktiva, medGratis),
      fonster: "aktiva 30 d / gratismedlemmar totalt (engagemangsgrad — olika fönster)",
    },
    {
      fran: "aktiva",
      till: "fas2",
      taljare: fas2D30,
      namnare: aktiva,
      procent: grad(fas2D30, aktiva),
      fonster: "ansökningar 30 d / aktiva 30 d",
    },
    {
      fran: "fas2",
      till: "intentioner",
      taljare: anonyma30 + brev30,
      namnare: fas2Totalt,
      procent: grad(anonyma30 + brev30, fas2Totalt),
      fonster: "intentioner 30 d / samtliga ansökningar",
    },
    {
      fran: "intentioner",
      till: "betalande",
      taljare: medBetalande,
      namnare: anonyma + brev,
      procent: grad(medBetalande, anonyma + brev),
      fonster: "betalande totalt / intentioner totalt",
    },
  ];

  const luckor = [
    "XP och kursframsteg lever bara i elevens localStorage — servern ser dem enbart via frivilliga ansökningar och quiz. Steget 'aktiva' är därför en skattning (SKATTAD), inte en sanning.",
    "CTA-klick mäts INTE (beslut A6: luckan förblir stängd — inga nya spår). Tratten mäts aggregerat per steg, aldrig per individ.",
    "Betalande hanteras manuellt via mejl tills betalflödet finns — siffran är så sann som den senaste manuella uppdateringen av member_type.",
    "Trafikmätningen är en bounded läsning (3 000 senaste raderna) med 30 % stickprov av sidvisningar och kräver analys-samtycke för sessions-räkning — absolutvärdena kan underskattas.",
    "Prenumerationsintentioner: efter patchen triggar en aktiveringsbegäran med nyhetsbrevscheck BÅDE ett anonymiserat event och ett mejl-kö-event — summan kan räkna samma begäran två gånger; delräkningarna är sanningen.",
    "Ingen vy kopplar hashad trafik-session till member-id (GDPR-kopplingsregeln, AC4) — aggregat per period, aldrig per individ.",
  ];

  const svar: KonverteringsSvar = {
    ok: true,
    genererad: new Date().toISOString(),
    spann: {
      fran: aldstaTraffik && Number.isFinite(aldstaTraffik) ? new Date(aldstaTraffik).toISOString() : null,
      till: new Date(nu).toISOString(),
    },
    steg,
    grader,
    luckor,
    urvalNotering:
      "Sju steg ur befintliga källor — noll nya spår (P6). Besökare = unika hashade sessioner (analys-samtycke); aktiva = skattning ur aktivitetsspåret; betalande = manuellt underhållet. Räkningar med count=exact (planned-skattningar redovisas aldrig).",
  };

  memo = { vid: Date.now(), svar };
  return NextResponse.json(svar, { headers: { "Cache-Control": "no-store" } });
}
