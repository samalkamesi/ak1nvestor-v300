import { NextRequest, NextResponse } from "next/server";
import { getSupabaseRest } from "@/lib/supabase-rest";
import {
  hashIp,
  klassificeraUa,
  sannyaPath,
  sannyaRefHost,
  sannyaUa,
  skrivTrafikBatch,
  trafikRad,
  utvinnIp,
  type TrafikEvent,
} from "@/lib/sakerhet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/trafik — den egna, GDPR-vänliga trafikmätningen (INGA cookies i
 * klassisk mening, INGA personuppgifter: varje rad är sökväg + UA-klass +
 * källa + språk + hashad session — se /transparens).
 *
 * POST — klientens TrafikRapportör (efter hydrering) beacon:ar hit.
 *   Skydd: 60 förfrågningar/minut/IP-hash (in-memory per instans).
 *   Samtyckes-stegring (beslutat i KLIENTEN utifrån ak1a-cookie-samtycke,
 *   verifierat här: utan session-fält loggas ENBART path + UA-klass):
 *     fullt    → { path, ref, ua, sprak, session }  (analys-samtycke)
 *     minimal  → { path, ua }                        (endast nödvändigt)
 *   Urval: "forsta" (sessionens första händelse — alltid) eller
 *   "stickprov" (30 % av övriga sidvisningar). Puls: keepalive var 3:e
 *   minut för "besökare just nu" — endast med analys-samtycke.
 *   Raderna samlas i en minnesbuffer och spolas till system_events
 *   (type=trafik) var 10:e händelse — skrivningen försenar aldrig svaret
 *   i onödan (klienten beacon:ar fire-and-forget).
 *   Special-form (VÅG 101): { typ:"felgrans", kategori, url } — felgränsernas
 *   PII-fria felrapport (chunk- vs övrigt-fel, endast sökväg); loggas med
 *   details.fel och räknas INTE som sidvisning i aggregaten.
 *
 * GET — aggregat. UTAN admin-lösenord: publik minimal rad för
 *   Sidfooterns status ("🔒 skyddad · N besökare idag"). MED
 *   x-admin-password: komplett live-aggregat (24 h/7 d/30 d, top-sidor,
 *   top-källor, unika sessioner, bot-andel, stickprovsfaktor).
 */

// ── Rate-limit (60/min per IP-hash, per instans) ─────────────────────────────

const MAX_PER_MIN = 60;
const forsok = new Map<string, number[]>();

function tillaten(ipHash: string): boolean {
  const nu = Date.now();
  const ts = (forsok.get(ipHash) ?? []).filter((t) => nu - t < 60_000);
  if (ts.length >= MAX_PER_MIN) {
    forsok.set(ipHash, ts);
    return false;
  }
  ts.push(nu);
  forsok.set(ipHash, ts);
  if (forsok.size > 4000) {
    for (const [k, v] of forsok) {
      if (!v.length || nu - v[v.length - 1] > 60_000) forsok.delete(k);
      if (forsok.size <= 2000) break;
    }
  }
  return true;
}

// ── Minnesbuffer + spolning (var 10:e) ───────────────────────────────────────

const buffer: ReturnType<typeof trafikRad>[] = [];
let aldstaIbuffer = 0;

async function spola(): Promise<void> {
  if (buffer.length === 0) return;
  const batch = buffer.splice(0, 25);
  aldstaIbuffer = buffer.length > 0 ? Date.now() : 0;
  await skrivTrafikBatch(batch);
}

function buffra(rad: ReturnType<typeof trafikRad>): void {
  if (buffer.length === 0) aldstaIbuffer = Date.now();
  buffer.push(rad);
  if (buffer.length > 200) buffer.shift(); // hårt minnestak
}

// ── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ipHash = await hashIp(utvinnIp(req));
  if (!tillaten(ipHash)) {
    return NextResponse.json({ ok: false }, { status: 429, headers: { "Retry-After": "60" } });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Sanering: path trunkerad 120 utan query; UA 120; ref → endast värdnamn.
  const path = sannyaPath(typeof body.path === "string" ? body.path : "/");
  const ua = sannyaUa(typeof body.ua === "string" ? body.ua : req.headers.get("user-agent"));
  const refHost = sannyaRefHost(typeof body.ref === "string" ? body.ref : req.headers.get("referer"));
  const uaKlass = klassificeraUa(ua);

  // FELGRÄNS-TELEMETRI (VÅG 101): felgränserna beacon:ar
  // { typ:"felgrans", kategori:"chunk"|"ovrig", url } — en gång per fel.
  // PII-fritt: endast sökväg (sannyad, query avlägsnad) + kategori + UA-klass;
  // session/ip/fel-text loggas ALDRIG. Räknas ej som sidvisning i aggregaten.
  if (body.typ === "felgrans") {
    const event: TrafikEvent = {
      dag: new Date().toISOString().slice(0, 10),
      path: sannyaPath(typeof body.url === "string" ? body.url : "/"),
      refHost: "direkt",
      uaKlass,
      sprak: null,
      land: null,
      sessionHash: null,
      puls: false,
      urval: "felgrans",
      fel: body.kategori === "chunk" ? "chunk" : "ovrigt",
    };
    buffra(trafikRad(event));
    if (buffer.length >= 10 || (aldstaIbuffer > 0 && Date.now() - aldstaIbuffer >= 10_000)) {
      await spola();
    }
    return NextResponse.json({ ok: true });
  }

  // Samtyckes-stegring: utan ANALYS-samtycke skickar klienten inget
  // session-fält → servern loggar enbart path + UA-klass (minimal-läge).
  const sessionRå = typeof body.session === "string" ? body.session.slice(0, 64) : "";
  const sessionHash = sessionRå ? await hashIp(sessionRå) : null;
  const sprak = typeof body.sprak === "string" ? body.sprak.slice(0, 12) : null;
  const land = typeof body.land === "string" ? body.land.slice(0, 8) : null;
  const puls = body.puls === true;
  const urval =
    sessionHash === null
      ? "minimal"
      : typeof body.urval === "string" && ["forsta", "stickprov"].includes(body.urval)
        ? body.urval
        : "stickprov";

  const event: TrafikEvent = {
    dag: new Date().toISOString().slice(0, 10),
    path,
    refHost,
    uaKlass,
    sprak: sessionHash === null ? null : sprak,
    land: sessionHash === null ? null : land,
    sessionHash,
    puls,
    urval,
  };
  buffra(trafikRad(event));

  // Spola var 10:e ELLER när bufferten är 10 s gammal — annars vänta.
  if (buffer.length >= 10 || (aldstaIbuffer > 0 && Date.now() - aldstaIbuffer >= 10_000)) {
    await spola();
  }
  return NextResponse.json({ ok: true });
}

// ── Admin-skydd för fulla aggregatet (mönster från /api/admin/beteende) ──────

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

// ── GET ──────────────────────────────────────────────────────────────────────

type TrafikRad = {
  created_at?: string | null;
  details?: {
    dag?: string | null;
    path?: string | null;
    ref?: string | null;
    ua?: string | null;
    s?: string | null;
    puls?: boolean | null;
    urval?: string | null;
    fel?: string | null;
  } | null;
};

export async function GET(req: NextRequest) {
  // Spola ev. vilande buffer först så läsningen är färsk.
  await spola();

  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json({ ok: true, kalla: "ingen-konfig", besokareIdag: 0, blockerat24h: 0, skyddad: true });
  }

  // Hämta senaste trafikraderna (bounded läsning) + blockeringar 24 h.
  let rader: TrafikRad[] = [];
  let sakerhet24 = 0;
  try {
    const [tRes, sRes] = await Promise.all([
      fetch(`${rest.origin}/rest/v1/system_events?type=eq.trafik&select=created_at,details&order=created_at.desc&limit=3000`, {
        headers: rest.headers,
        signal: AbortSignal.timeout(12_000),
      }),
      fetch(
        `${rest.origin}/rest/v1/system_events?type=eq.sakerhet&select=created_at&created_at=gte.${new Date(Date.now() - 86_400_000).toISOString()}`,
        {
          headers: { ...rest.headers, Prefer: "count=planned" },
          method: "HEAD",
          signal: AbortSignal.timeout(8000),
        }
      ),
    ]);
    if (tRes.ok) rader = (await tRes.json()) || [];
    if (sRes.ok) {
      sakerhet24 = Number(sRes.headers.get("content-range")?.split("/")[1] ?? 0) || 0;
    }
  } catch {
    /* tyst — tomma aggregat är ett giltigt svar */
  }

  const nu = Date.now();
  const idag = new Date(nu).toISOString().slice(0, 10);
  // VÅG 101: felgräns-rader (details.fel) är telemetri — aldrig sidvisningar.
  const vanliga = rader.filter((r) => !r.details?.fel);
  const visningarIdag = vanliga.filter((r) => !r.details?.puls && r.details?.dag === idag).length;
  const unikaIdag = new Set(
    vanliga.filter((r) => r.details?.dag === idag && r.details?.s).map((r) => r.details!.s)
  ).size;

  // Publik minimal rad (Sidfooterns status) — inga sökvägar, inga källor.
  if (!arAdmin(req)) {
    return NextResponse.json(
      { ok: true, skyddad: true, besokareIdag: unikaIdag, blockerat24h: sakerhet24 },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  // ── Fullt aggregat (admin) ──────────────────────────────────────────────
  const unika = (sedan: number) =>
    new Set(vanliga.filter((r) => Date.parse(r.created_at || "") >= nu - sedan && r.details?.s).map((r) => r.details!.s)).size;
  const visningar = (sedan: number) =>
    vanliga.filter((r) => !r.details?.puls && Date.parse(r.created_at || "") >= nu - sedan).length;

  // Senaste 24 h per timme (äldst → nyast, 24 hinkar).
  const perTimme24: number[] = new Array(24).fill(0);
  for (const r of vanliga) {
    if (r.details?.puls) continue;
    const t = Date.parse(r.created_at || "");
    const idx = 23 - Math.floor((nu - t) / 3_600_000);
    if (idx >= 0 && idx < 24) perTimme24[idx]++;
  }

  // Per dag, 7 d och 30 d (nyast sist).
  const perDag = (dagar: number) => {
    const out: { dag: string; visningar: number; unika: number }[] = [];
    for (let i = dagar - 1; i >= 0; i--) {
      const dag = new Date(nu - i * 86_400_000).toISOString().slice(0, 10);
      const dagens = vanliga.filter((r) => r.details?.dag === dag);
      out.push({
        dag,
        visningar: dagens.filter((r) => !r.details?.puls).length,
        unika: new Set(dagens.filter((r) => r.details?.s).map((r) => r.details!.s)).size,
      });
    }
    return out;
  };

  const topp = (falt: "path" | "ref", sedan: number, grans: number) => {
    const karta = new Map<string, number>();
    for (const r of vanliga) {
      if (r.details?.puls) continue;
      if (Date.parse(r.created_at || "") < nu - sedan) continue;
      const nyckel = String((r.details?.[falt] as string | undefined) ?? "ovrigt");
      karta.set(nyckel, (karta.get(nyckel) ?? 0) + 1);
    }
    return [...karta.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, grans)
      .map(([namn, antal]) => ({ namn, antal }));
  };

  const botRader = vanliga.filter((r) => r.details?.ua === "bot" && !r.details?.puls).length;
  const manskliga = vanliga.filter((r) => !r.details?.puls).length;

  // ── Felgräns-telemetri (VÅG 101): chunk- vs övriga-fel 24 h + topp-sidor ──
  const fel24 = rader.filter((r) => !!r.details?.fel && Date.parse(r.created_at || "") >= nu - 86_400_000);
  const felKarta = new Map<string, number>();
  for (const r of fel24) {
    const nyckel = String(r.details?.path ?? "ovrigt");
    felKarta.set(nyckel, (felKarta.get(nyckel) ?? 0) + 1);
  }
  const topFelSidor = [...felKarta.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([namn, antal]) => ({ namn, antal }));

  return NextResponse.json(
    {
      ok: true,
      genererad: new Date().toISOString(),
      nu: {
        senaste5min: unika(5 * 60_000),
        fonster: "5 min",
      },
      idag: { visningar: visningarIdag, unika: unikaIdag, blockerat: sakerhet24 },
      senaste24h: { visningar: visningar(86_400_000), unika: unika(86_400_000), perTimme: perTimme24 },
      senaste7d: { visningar: visningar(7 * 86_400_000), unika: unika(7 * 86_400_000), perDag: perDag(7) },
      senaste30d: { visningar: visningar(30 * 86_400_000), unika: unika(30 * 86_400_000), perDag: perDag(30) },
      topSidor: topp("path", 7 * 86_400_000, 10),
      topKallor: topp("ref", 7 * 86_400_000, 8),
      felgranser24h: {
        totalt: fel24.length,
        chunk: fel24.filter((r) => r.details?.fel === "chunk").length,
        ovriga: fel24.filter((r) => r.details?.fel !== "chunk").length,
        topSidor: topFelSidor,
      },
      botAndel: manskliga > 0 ? Math.round((botRader / manskliga) * 100) : 0,
      stickprovsfaktor: 0.3,
      urvalNotering:
        "Sidvisningar: sessionens första händelse alltid + 30 % stickprov + botar (dedupe 10 min). Pulsar räknas ej som visningar.",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
