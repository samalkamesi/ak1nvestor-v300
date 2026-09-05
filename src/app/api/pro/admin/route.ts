import { NextRequest, NextResponse } from "next/server";
import { getSupabaseRest } from "@/lib/supabase-rest";
import { publiceraOrganEvent } from "@/lib/organ-event";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/pro/admin — B2B-ADMINISTRATIONEN (skild från publik /api/admin).
 *
 * SKYDD (VÅG 63 bygg-1, O4-robusthet §5): requireAdmin på ALLA metoder —
 * x-admin-password (timing-säkert, fas2-access-mönstret). GET läser B2B-
 * kunduppgifter (e-post, XP, logits) och POST fattar mall-beslut — ingen
 * av dessa fick vara öppen mot internet.
 *
 * GET  → samlade B2B-metrics i EN vända:
 *        - användare: members med member_type != free (B2B-kunderna),
 *        - pro-analys-anrop senaste 30 dagarna (ur system_events),
 *        - Fas 2-ansökningar: antal + senaste (type=fas2_ansokan),
 *        - aktiva rapportmallar: 3 statiskt (Fas D-MVP),
 *        - kundtabell: members med XP-snapshot (senaste kända XP ur
 *          Fas 2-ansökningar — members-tabellen saknar xp-kolumn),
 *        - analysloggen: senaste pro-anropen (tid + tickers + konfluens).
 *
 * POST { action: "mallar", mallar, whiteLabel? } → publicerar beslutet som
 * OrganEvent (source "organ/pro-admin", verb "beslut") — mallarnas aktiv-
 * tillstånd + white-label sparas lokalt (pro-admin-v1) i utvecklingssteget;
 * detta API är det redo-ställda publika spåret.
 *
 * Pedagogisk analys — inte investeringsråd.
 */

/** De tre låsta mallarna (forskning-b2b 5.3) — statiskt antal i översikten. */
const ANTAL_RAPPORTMALLAR = 3;

/** Utforskningsfönster för pro-analys-anrop. */
const DAGAR_30_MS = 30 * 86400_000;

/** Max kunder i kundtabellen (bounced av Supabase-paginering senare). */
const MAX_KUNDER = 500;

/** Max rader i analysloggen. */
const MAX_LOGG = 50;

// ── SMÅHANTERK ─────────────────────────────────────────────────────────────

function plockaObjekt(rå: unknown): Record<string, unknown> {
  if (typeof rå === "string") {
    try {
      const tolkad: unknown = JSON.parse(rå);
      return tolkad && typeof tolkad === "object" && !Array.isArray(tolkad)
        ? (tolkad as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  return rå && typeof rå === "object" && !Array.isArray(rå)
    ? (rå as Record<string, unknown>)
    : {};
}

function plockaTal(...källor: unknown[]): number | null {
  for (const k of källor) {
    if (typeof k === "number" && Number.isFinite(k)) return Math.round(k);
  }
  return null;
}

/** Tickers ur event-details — tolererar {tickers}, {matt:{tickers}} och JSON-strängar. */
function plockaTickers(details: Record<string, unknown>): string[] {
  const matt = plockaObjekt(details.matt);
  const rå = Array.isArray(details.tickers)
    ? details.tickers
    : Array.isArray(matt.tickers)
      ? matt.tickers
      : [];
  return rå
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.trim().toUpperCase().slice(0, 12))
    .filter(Boolean)
    .slice(0, 10);
}

/** Konfluens-poäng per anrop — ur details eller details.matt. */
function plockaKonfluens(details: Record<string, unknown>): number | null {
  const matt = plockaObjekt(details.matt);
  return plockaTal(details.konfluens, details.snittKonfluens, matt.konfluens, matt.snittKonfluens);
}

/** Räkna rader via HEAD + Prefer count=planned (content-range ger total N). */
async function antalRader(
  rest: NonNullable<ReturnType<typeof getSupabaseRest>>,
  filter: string,
): Promise<number> {
  try {
    const res = await fetch(`${rest.origin}/rest/v1/system_events?${filter}&select=id`, {
      method: "HEAD",
      headers: { ...rest.headers, Prefer: "count=planned" },
      signal: AbortSignal.timeout(8000),
    });
    return Number(res.headers.get("content-range")?.split("/")[1] ?? 0) || 0;
  } catch {
    return 0;
  }
}

// ── GET — B2B-METRICS ──────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const tomSvar = {
    genererad: new Date().toISOString(),
    konfigurerad: false,
    oversikt: {
      anvandare: { totalt: 0, premium: 0, pro: 0, ovriga: 0, senasteLogin: null as string | null },
      proAnalysAnrop30d: 0,
      fas2Ansokningar: { antal: 0, senaste: null as string | null },
      aktivaRapportmallar: ANTAL_RAPPORTMALLAR,
    },
    kunder: [] as unknown[],
    analyslogg: [] as unknown[],
  };

  const rest = getSupabaseRest();
  if (!rest) return NextResponse.json(tomSvar);

  const cutoff30d = new Date(Date.now() - DAGAR_30_MS).toISOString();

  /** Pro-analys-anrop: source börjar på "pro" (t.ex. "pro/analys") alt. type=pro_analys. */
  const proFilter = `or=(source.ilike.pro*,type.eq.pro_analys)&created_at=gte.${cutoff30d}`;

  const [membersRes, fas2Res, proAntal, proLoggRes] = await Promise.all([
    fetch(
      `${rest.origin}/rest/v1/members?select=id,email,name,member_type,last_login_at,created_at&order=last_login_at.desc.nullslast&limit=${MAX_KUNDER}`,
      { headers: rest.headers, signal: AbortSignal.timeout(10000) },
    ),
    fetch(
      `${rest.origin}/rest/v1/system_events?type=eq.fas2_ansokan&select=id,created_at,details&order=created_at.desc&limit=200`,
      { headers: rest.headers, signal: AbortSignal.timeout(10000) },
    ),
    antalRader(rest, proFilter),
    fetch(
      `${rest.origin}/rest/v1/system_events?${proFilter}&select=id,created_at,message,details,source&order=created_at.desc&limit=${MAX_LOGG}`,
      { headers: rest.headers, signal: AbortSignal.timeout(10000) },
    ),
  ]);

  // ── Fas 2-ansökningar: antal + senaste + XP-snapshot per e-post ──
  const fas2Rader = fas2Res.ok ? ((await fas2Res.json()) as unknown[]) ?? [] : [];
  const fas2Antal = await antalRader(rest, "type=eq.fas2_ansokan");
  const senasteFas2 =
    fas2Rader.length > 0
      ? plockaObjekt(fas2Rader[0]).created_at ?? null
      : null;

  const xpPerEpost = new Map<string, number>();
  for (const rad of fas2Rader) {
    const d = plockaObjekt(plockaObjekt(rad).details);
    const epost = typeof d.email === "string" ? d.email.toLowerCase().trim() : "";
    const xp = plockaTal(d.xp);
    if (epost && xp !== null && !xpPerEpost.has(epost)) xpPerEpost.set(epost, xp);
  }

  // ── Kundtabellen ──
  const membersRader = membersRes.ok ? ((await membersRes.json()) as unknown[]) ?? [] : [];
  const kunder = membersRader.map((rad) => {
    const m = plockaObjekt(rad);
    const epost = typeof m.email === "string" ? m.email : "";
    const senasteLogin =
      typeof m.last_login_at === "string" && m.last_login_at ? m.last_login_at : null;
    return {
      id: typeof m.id === "string" ? m.id : epost,
      email: epost,
      namn: typeof m.name === "string" && m.name ? m.name : null,
      memberType: typeof m.member_type === "string" && m.member_type ? m.member_type : "free",
      senasteLogin,
      registrerad: typeof m.created_at === "string" ? m.created_at : null,
      xp: epost ? xpPerEpost.get(epost.toLowerCase()) ?? null : null,
    };
  });

  // ── Översikt: användare med member_type != free ──
  const b2b = kunder.filter((k) => k.memberType !== "free");
  const senasteLoginB2B = b2b
    .map((k) => k.senasteLogin)
    .filter((t): t is string => typeof t === "string")
    .sort()
    .at(-1) ?? null;

  const oversikt = {
    anvandare: {
      totalt: b2b.length,
      premium: b2b.filter((k) => k.memberType === "premium").length,
      pro: b2b.filter((k) => k.memberType === "pro").length,
      ovriga: b2b.filter((k) => k.memberType !== "premium" && k.memberType !== "pro").length,
      senasteLogin: senasteLoginB2B,
    },
    proAnalysAnrop30d: proAntal,
    fas2Ansokningar: {
      antal: fas2Antal,
      senaste: senasteFas2,
    },
    aktivaRapportmallar: ANTAL_RAPPORTMALLAR,
  };

  // ── Analysloggen: tid + tickers + konfluens-poäng per anrop ──
  const analyslogg = (proLoggRes.ok ? ((await proLoggRes.json()) as unknown[]) ?? [] : []).map(
    (rad) => {
      const e = plockaObjekt(rad);
      const details = plockaObjekt(e.details);
      return {
        id: typeof e.id === "string" ? e.id : String(e.created_at ?? Math.random()),
        tid: typeof e.created_at === "string" ? e.created_at : null,
        tickers: plockaTickers(details),
        konfluensPoang: plockaKonfluens(details),
        source: typeof e.source === "string" ? e.source : null,
      };
    },
  );

  return NextResponse.json({
    genererad: new Date().toISOString(),
    konfigurerad: true,
    oversikt,
    kunder,
    analyslogg,
  });
}

// ── POST — ÅTGÄRDER ────────────────────────────────────────────────────────

/** Mall-id: slug-liknande, begränsat — aldrig fritext mot system_events. */
const MALL_ID_RE = /^[a-zA-Z0-9_-]{1,40}$/;

function saneraMallar(rå: unknown): { id: string; aktiv: boolean }[] | null {
  if (!Array.isArray(rå) || rå.length === 0 || rå.length > 10) return null;
  const ut: { id: string; aktiv: boolean }[] = [];
  const sedda = new Set<string>();
  for (const m of rå) {
    const o = plockaObjekt(m);
    const id = typeof o.id === "string" ? o.id.trim() : "";
    if (!MALL_ID_RE.test(id) || sedda.has(id)) return null;
    sedda.add(id);
    ut.push({ id, aktiv: o.aktiv === true });
  }
  return ut;
}

function saneraWhiteLabel(rå: unknown): { foretagsnamn: string; logotypUrl: string; fargtemaPrefix: string } | null {
  if (rå === undefined || rå === null) return null;
  const o = plockaObjekt(rå);
  return {
    foretagsnamn: typeof o.foretagsnamn === "string" ? o.foretagsnamn.trim().slice(0, 120) : "",
    logotypUrl: typeof o.logotypUrl === "string" ? o.logotypUrl.trim().slice(0, 300) : "",
    fargtemaPrefix: typeof o.fargtemaPrefix === "string" ? o.fargtemaPrefix.trim().slice(0, 40) : "",
  };
}

/**
 * POST /api/pro/admin — hantera åtgärder.
 * { action: "mallar", mallar: [{ id, aktiv }], whiteLabel? } → OrganEvent
 * (source "organ/pro-admin", verb "beslut", matt { mallar, whiteLabel? }).
 */
export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  let kropp: unknown = null;
  try {
    kropp = await req.json();
  } catch {
    kropp = null;
  }
  const body = plockaObjekt(kropp);

  if (body.action !== "mallar") {
    return NextResponse.json(
      { error: 'Okänd åtgärd — förväntar { action: "mallar", mallar }.' },
      { status: 400 },
    );
  }

  const mallar = saneraMallar(body.mallar);
  if (!mallar) {
    return NextResponse.json(
      { error: "mallar måste vara en array (1–10) med { id, aktiv }." },
      { status: 400 },
    );
  }

  const whiteLabel = saneraWhiteLabel(body.whiteLabel);
  const matt: Record<string, unknown> = { mallar };
  if (whiteLabel) matt.whiteLabel = whiteLabel;

  const publicerat = await publiceraOrganEvent({
    source: "organ/pro-admin",
    verb: "beslut",
    matt,
  });

  return NextResponse.json({ ok: true, publicerat });
}
