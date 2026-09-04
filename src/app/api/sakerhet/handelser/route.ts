import { NextRequest, NextResponse } from "next/server";
import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/sakerhet/handelser — säkerhetspanelens källa (admin).
 *
 * SKYDD: ADMIN_PASSWORD på servern (samma mönster som /api/admin/beteende
 * och /api/admin/fas2-access) — lösenordet lämnas i headern
 * "x-admin-password" eller "Authorization: Bearer <pwd>". Jämförelsen är
 * timing-säker; endast misslyckade försök rate-limitas (10/min/process).
 *
 * Läser system_events (type=sakerhet — skrivna av middleware via
 * event.waitUntil): senaste blockeringar (tid, trunkerad sökväg, klass,
 * HTTP-status, IP-hash-förkortning — ALDRIG hela hashen, ALDRIG rå IP),
 * heat-map per sökväg 24 h samt unika hot-IP-hashar 24 h. Tom data
 * redovisas ärligt som "allt klart"-läge.
 */

const misslyckade: number[] = [];
const MAX_MISSLYCKADE_PER_MIN = 10;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function kontrolleraAdmin(req: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_PASSWORD || "AK1A-2026";
  const urHeader = req.headers.get("x-admin-password");
  const authorization = req.headers.get("authorization");
  const provided = urHeader
    ? urHeader
    : authorization && authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

  const nu = Date.now();
  while (misslyckade.length && nu - misslyckade[0] > 60_000) misslyckade.shift();
  if (misslyckade.length >= MAX_MISSLYCKADE_PER_MIN) {
    return NextResponse.json(
      { error: "För många felaktiga försök — vänta en minut." },
      { status: 429 }
    );
  }
  if (!provided || !timingSafeEqual(provided, expected)) {
    misslyckade.push(nu);
    return NextResponse.json({ error: "Admin-lösenord krävs (x-admin-password)." }, { status: 401 });
  }
  return null;
}

type SakerhetRad = {
  id?: string;
  created_at?: string | null;
  message?: string | null;
  details?: {
    klass?: string | null;
    http?: number | null;
    path?: string | null;
    ip_hash?: string | null;
    monster?: string | null;
    ua?: string | null;
  } | null;
};

export async function GET(req: NextRequest) {
  const skydd = kontrolleraAdmin(req);
  if (skydd) return skydd;

  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json({
      ok: true,
      kalla: "ingen-konfig",
      senaste: [],
      totaltBlockerat24h: 0,
      heatmap: [],
      unikaHotHashar24h: 0,
      alltKlart: true,
    });
  }

  let rader: SakerhetRad[] = [];
  try {
    const res = await fetch(
      `${rest.origin}/rest/v1/system_events?type=eq.sakerhet&select=id,created_at,message,details&order=created_at.desc&limit=400`,
      { headers: rest.headers, signal: AbortSignal.timeout(12_000) }
    );
    if (res.ok) rader = (await res.json()) || [];
  } catch {
    rader = [];
  }

  const nu = Date.now();
  const inom24 = rader.filter((r) => Date.parse(r.created_at || "") >= nu - 86_400_000);

  // Heat-map per (trunkerad) sökväg — attacker klustrar per mål.
  const karta = new Map<string, number>();
  for (const r of inom24) {
    const p = String(r.details?.path ?? "okänd").slice(0, 60);
    karta.set(p, (karta.get(p) ?? 0) + 1);
  }

  return NextResponse.json(
    {
      ok: true,
      genererad: new Date().toISOString(),
      senaste: rader.slice(0, 25).map((r) => ({
        tid: r.created_at ?? null,
        // Vänte-raden i panelen: trunkerad sökväg + klass + hash-förkortning.
        path: String(r.details?.path ?? "—").slice(0, 60),
        klass: r.details?.klass ?? "okand",
        http: r.details?.http ?? null,
        monster: r.details?.monster ?? null,
        ipHash: (r.details?.ip_hash ?? "").slice(0, 8),
      })),
      totaltBlockerat24h: inom24.length,
      heatmap: [...karta.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([path, antal]) => ({ path, antal })),
      unikaHotHashar24h: new Set(inom24.map((r) => r.details?.ip_hash).filter(Boolean)).size,
      alltKlart: inom24.length === 0,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
