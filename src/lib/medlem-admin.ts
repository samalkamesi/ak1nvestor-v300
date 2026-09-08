/**
 * MEDLEM-ADMIN — tunn server-only-hjälpare för Medlemmar-admin-panelen
 * (FAS L3, STYRELSE-V86-L3-ADMIN.md §A våg 88 — kontraktets A2-agent:
 * "hämtaAnvändare/sidvandring/ban/fas").
 *
 * ── KONTRAKTET ──────────────────────────────────────────────────────────────
 * Auth-användare listas/muteras via Supabase Auth Admin-API (GoTrue v2 REST):
 *   GET  {origin}/auth/v1/admin/users?per_page=50&page=N   (lista, sidvandring)
 *   GET  {origin}/auth/v1/admin/users/{authId}              (EN rad — visaEpost)
 *   PUT  {origin}/auth/v1/admin/users/{authId}              (ban_duration /
 *        app_metadata — MERGE: läs först, skriv HELA objektet)
 * ALLTID med SUPABASE_SERVICE_ROLE_KEY som Bearer (anon → NEJ). Origin kommer
 * från getSupabaseRest() (SSRF-vakten *.supabase.co) — INGET nytt nätverks-
 * mönster (kontraktets NULÄGE KORT). Members-profiler läses ur system_events
 * (type=medlem, senaste raden per authId vinner) med EN enda fråga — ALDRIG
 * ett anrop per användare.
 *
 * ── GDPR (§A-GDPR + P6×2, KRITA) ────────────────────────────────────────────
 *   · List-payloaden bär ALDRIG e-post i klartext — endast epostMaskerad =
 *     sha256(epost) första 8 + "@" + domän (tillMedlemRad sanerar).
 *   · Klartext hämtas ENDAST via hamtaEpost (ruttens ?visaEpost=1-gren, EN
 *     rad) och lämnar ALDRIG denna modul i list-svar.
 *   · KLARTEXT-E-POST LOGGAS ALDRIG — inga lösenord, tokens eller e-post i
 *     loggar/körspår (P6×2); events bär epostHash (sha256 första 12, samma
 *     nyckel som medlem-auth.ts).
 *   · app_metadata (ALDRIG user_metadata — den är användarskrivbar) för
 *     roll+fas; MERGE vid PUT annars raderas grannfält.
 *
 * ── CACHE (ruttens krita "inga loops mot /auth/v1, cache 60 s") ─────────────
 * Modul-cache 60 s för list-sidor + profil-frågan (mönstret: variabler-
 * lagring.ts). rensaAuthCache() efter varje lyckad mutation. Byggfas
 * (NEXT_PHASE=phase-production-build) ⇒ ALDRIG nätverk (bygg-hermetik).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

import { createHash } from "node:crypto";

import { epostHash } from "./medlem-auth";
import { getSupabaseRest } from "./supabase-rest";

// ── Supabase Auth Admin-plumbing (service-role — ALDRIG anon här) ────────────

/** Det auth-admin-anropen behöver: validerat origin + SERVICE-nyckel-headers. */
function getSupabaseAdminAuth(): { origin: string; headers: Record<string, string> } | null {
  const serviceNyckel = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceNyckel) return null;
  // Origin + SSRF-validering via getSupabaseRest — samma vakt som allt annat.
  const rest = getSupabaseRest();
  if (!rest) return null;
  return {
    origin: rest.origin,
    headers: { apikey: serviceNyckel, Authorization: "Bearer " + serviceNyckel },
  };
}

/** Bygg-hermetik (variabler-lagring.ts våg 79): aldrig nätverk under next build. */
function arByggFas(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

// ── Sanering (§A-GDPR) ───────────────────────────────────────────────────────

/** GDPR-mask: sha256(normaliserad e-post) första 8 + "@" + domän — eller "—". */
export function epostMaskerad(epost: string | null | undefined): string {
  if (typeof epost !== "string" || epost === "") return "—";
  const normaliserad = epost.trim().toLowerCase();
  const at = normaliserad.lastIndexOf("@");
  const doman = at >= 0 && at < normaliserad.length - 1 ? normaliserad.slice(at + 1) : "";
  const prefix = createHash("sha256").update(normaliserad, "utf8").digest("hex").slice(0, 8);
  return doman !== "" ? prefix + "@" + doman : prefix;
}

// ── GoTrue-typer (tolerant parsade — aldrig trusted) ─────────────────────────

/** Det vi läser ur en GoTrue-användare (klartext-epost STANNAR i denna modul). */
export type AuthAnvandare = {
  authId: string;
  epost: string | null; // server-side endast — saneras före svar
  skapad: string | null;
  senasteInloggning: string | null;
  banned: boolean;
  roll: string | null;
  fas: string | null;
  appMetadata: Record<string, unknown>; // befintligt objekt — MERGE-underlag
};

type GoTrueUser = {
  id?: unknown;
  email?: unknown;
  created_at?: unknown;
  last_sign_in_at?: unknown;
  banned_at?: unknown;
  app_metadata?: Record<string, unknown> | null;
};

function lasText(v: unknown): string | null {
  return typeof v === "string" && v !== "" ? v : null;
}

/** Tolka EN GoTrue-användare — ogiltig rad ⇒ null (aldrig trusted). */
function tolkaAnvandare(r: GoTrueUser): AuthAnvandare | null {
  const authId = lasText(r.id);
  if (!authId) return null;
  const appMetadata =
    r.app_metadata && typeof r.app_metadata === "object" && !Array.isArray(r.app_metadata)
      ? (r.app_metadata as Record<string, unknown>)
      : {};
  return {
    authId,
    epost: lasText(r.email),
    skapad: lasText(r.created_at),
    senasteInloggning: lasText(r.last_sign_in_at),
    banned: lasText(r.banned_at) !== null,
    roll: lasText(appMetadata.roll),
    fas: lasText(appMetadata.fas),
    appMetadata,
  };
}

/** En sida ur listan — nastaSida null på sista sidan (sidvandring på nextPage). */
export type AuthSida = {
  anvandare: AuthAnvandare[];
  nastaSida: number | null;
  totalApprox: number;
};

/** per_page-tak 50 i GoTrue v1 (kontraktets notering) — hårdkodat. */
const PER_PAGE = 50;
/** Profilsökningen: EN fråga, tak 200 rader (kontrakt §A.3). */
const PROFIL_TAK = 200;

// ── Modul-cache 60 s (KRITA: inga loops mot /auth/v1) ───────────────────────

const CACHE_MS = 60_000;
const cache = new Map<string, { utgar: number; data: unknown }>();

function lasCache<T>(nyckel: string): T | null {
  const rad = cache.get(nyckel);
  if (!rad || rad.utgar <= Date.now()) {
    cache.delete(nyckel);
    return null;
  }
  return rad.data as T;
}

function sparaCache(nyckel: string, data: unknown): void {
  cache.set(nyckel, { utgar: Date.now() + CACHE_MS, data });
}

/** Rensa cachen efter lyckad mutation — nästa lista läser färskt. */
export function rensaAuthCache(): void {
  cache.clear();
}

// ── Lista (sidvandring enligt kontrakt §A.2) ─────────────────────────────────

/**
 * hamtaAnvandarSida — GET /auth/v1/admin/users?per_page=50&page=N.
 * EN sida per anrop (ALDRIG loopa alla sidor — Supabase-side tak). Cache 60 s.
 * Misslyckande ⇒ { fel } (supprimerat — inga GoTrue-detaljer läcks).
 */
export async function hamtaAnvandarSida(sida: number): Promise<AuthSida | { fel: string }> {
  const nyckel = "auth-sida:" + String(sida);
  const urCache = lasCache<AuthSida>(nyckel);
  if (urCache) return urCache;
  if (arByggFas()) return { fel: "Auth-admin ej tillgänglig i byggfas." };
  const admin = getSupabaseAdminAuth();
  if (!admin) return { fel: "Supabase service-nyckel saknas." };

  try {
    const res = await fetch(
      admin.origin + "/auth/v1/admin/users?per_page=" + String(PER_PAGE) + "&page=" + String(sida),
      {
        headers: admin.headers,
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      },
    );
    if (!res.ok) return { fel: "Kunde inte lista auth-användare (HTTP " + String(res.status) + ")." };
    const kropp = (await res.json().catch(() => null)) as
      | { users?: unknown; next_page?: unknown; nextPage?: unknown; last_page?: unknown; total?: unknown }
      | null;
    if (!kropp || !Array.isArray(kropp.users)) return { fel: "Oväntat svar från auth-admin." };

    const anvandare: AuthAnvandare[] = [];
    for (const rad of kropp.users) {
      const tolkad = tolkaAnvandare(rad as GoTrueUser);
      if (tolkad) anvandare.push(tolkad);
    }
    // nextPage null/0 på sista sidan — sidvandring, ALDRIG blint N+1.
    const nastaRaw = kropp.next_page ?? kropp.nextPage;
    const nastaSida =
      (typeof nastaRaw === "number" && nastaRaw > sida ? nastaRaw : null) ??
      (typeof kropp.nextPage === "number" && kropp.nextPage > 0 ? kropp.nextPage : null);
    const totalApprox =
      typeof kropp.total === "number" && kropp.total > 0
        ? kropp.total
        : Math.max(anvandare.length, (sida - 1) * PER_PAGE + anvandare.length);
    const resultat: AuthSida = { anvandare, nastaSida, totalApprox };
    sparaCache(nyckel, resultat);
    return resultat;
  } catch {
    return { fel: "Nätverksfel mot auth-admin." };
  }
}

// ── EN rad (visaEpost-grenen + POST:s läs-först-merge) ───────────────────────

/**
 * hamtaAnvandare — GET /auth/v1/admin/users/{authId} (EN rad, alltid färsk).
 * Ogiltig/okänd ⇒ null. In cache — mutationsunderlag + visaEpost läser färskt.
 */
export async function hamtaAnvandare(authId: string): Promise<AuthAnvandare | null> {
  if (arByggFas()) return null;
  const admin = getSupabaseAdminAuth();
  if (!admin) return null;
  try {
    const res = await fetch(
      admin.origin + "/auth/v1/admin/users/" + encodeURIComponent(authId),
      {
        headers: admin.headers,
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    const kropp = (await res.json().catch(() => null)) as GoTrueUser | null;
    if (!kropp) return null;
    return tolkaAnvandare(kropp);
  } catch {
    return null;
  }
}

/**
 * hamtaEpost — klartext-epost för EN rad (ruttens ?visaEpost=1-gren, admin-only
 * hos anroparen). ALDRIG i list-svar, ALDRIG loggad (§A-GDPR regel 1+2).
 */
export async function hamtaEpost(authId: string): Promise<string | null> {
  const anvandare = await hamtaAnvandare(authId);
  return anvandare?.epost ?? null;
}

// ── Mutationer (PUT — service-nyckel) ────────────────────────────────────────

/** ban via PUT {"ban_duration":"876000h"} (≈100 år); unban via "none" (KRITA:
 *  "0" är ODEFINIERAT i GoTrue). Returnerar den uppdaterade raden eller fel. */
export async function banAnvandare(authId: string, bannlyst: boolean): Promise<AuthAnvandare | { fel: string }> {
  const kropp = { ban_duration: bannlyst ? "876000h" : "none" };
  return putAnvandare(authId, kropp);
}

/**
 * sattAppMetadata — PUT med MERGAT app_metadata (läs-först hos anroparen som
 * skickar in HELA sammanslagna objektet; KRITA: user_metadata är förbjudet
 * mark — den är användarskrivbar). Roll+fas bara här.
 */
export async function sattAppMetadata(
  authId: string,
  appMetadata: Record<string, unknown>,
): Promise<AuthAnvandare | { fel: string }> {
  return putAnvandare(authId, { app_metadata: appMetadata });
}

/** Gemensam PUT-motor — aldrig user_metadata, aldrig e-post i fel-spor. */
async function putAnvandare(
  authId: string,
  body: Record<string, unknown>,
): Promise<AuthAnvandare | { fel: string }> {
  if (arByggFas()) return { fel: "Auth-admin ej tillgänglig i byggfas." };
  const admin = getSupabaseAdminAuth();
  if (!admin) return { fel: "Supabase service-nyckel saknas." };
  try {
    const res = await fetch(
      admin.origin + "/auth/v1/admin/users/" + encodeURIComponent(authId),
      {
        method: "PUT",
        headers: { ...admin.headers, "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      },
    );
    if (!res.ok) return { fel: "Ändringen gick inte igenom (HTTP " + String(res.status) + ")." };
    const kropp = (await res.json().catch(() => null)) as GoTrueUser | null;
    const tolkad = kropp ? tolkaAnvandare(kropp) : null;
    if (!tolkad) return { fel: "Oväntat svar efter ändringen." };
    return tolkad;
  } catch {
    return { fel: "Nätverksfel vid ändringen." };
  }
}

// ── Members-profiler ur system_events (EN fråga — kontrakt §A.3) ─────────────

/** Senaste profil-rad per authId (latest-winner) — rå details + parsad kärna. */
export type MedlemProfil = {
  authId: string;
  epostHash: string | null;
  namn: string | null;
  xp: number | null;
  niva: number | null;
  fas: string | null;
  rå: Record<string, unknown>; // hela details — MERGE-underlag vid profilskriv
};

function lasTal(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/**
 * lasMedlemProfiler — EN enda system_events-fråga
 * (type=eq.medlem&order=created_at.desc&limit=200), senaste rad per authId
 * vinner i minnet. INTE en förfrågan per användare. Cache 60 s. Fel ⇒ tom map.
 */
export async function lasMedlemProfiler(): Promise<Map<string, MedlemProfil>> {
  const kartan = new Map<string, MedlemProfil>();
  const urCache = lasCache<Map<string, MedlemProfil>>("profiler");
  if (urCache) return urCache;
  if (arByggFas()) return kartan;
  const rest = getSupabaseRest(); // service-role-först — interna läs-vägar
  if (!rest) return kartan;
  try {
    const res = await fetch(
      rest.origin +
        "/rest/v1/system_events?type=eq.medlem&select=details,created_at&order=created_at.desc&limit=" +
        String(PROFIL_TAK),
      {
        headers: rest.headers,
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      },
    );
    if (!res.ok) return kartan;
    const rader = (await res.json().catch(() => null)) as unknown[] | null;
    if (!Array.isArray(rader)) return kartan;
    for (const rad of rader) {
      const detaljer =
        rad && typeof rad === "object" && !Array.isArray(rad)
          ? ((rad as { details?: unknown }).details as unknown)
          : null;
      const obj =
        detaljer && typeof detaljer === "object" && !Array.isArray(detaljer)
          ? (detaljer as Record<string, unknown>)
          : {};
      const authId = lasText(obj.authId);
      if (!authId || kartan.has(authId)) continue; // senaste vinner (desc-ordning)
      kartan.set(authId, {
        authId,
        epostHash: lasText(obj.epostHash),
        namn: lasText(obj.namn),
        xp: lasTal(obj.xp),
        niva: lasTal(obj.niva),
        fas: lasText(obj.fas),
        rå: obj,
      });
    }
    sparaCache("profiler", kartan);
    return kartan;
  } catch {
    return kartan;
  }
}

// ── Event-skrivningar (system_events — batch, P6-ren) ────────────────────────

/** En system_events-rad (P6: inga lösenord/token/epost — HASH-ar). */
export type EventRad = {
  type: string;
  severity: string;
  message: string;
  details: Record<string, unknown>;
  source: string;
};

/**
 * skrivSystemEvents — POST /rest/v1/system_events (EN batch-räknad POST,
 * service-role, Prefer return=minimal — medlem-auth.ts mönstret). Best-effort
 * vid LÄS-bara spår: kastar aldrig; vid mutations-audit (viktigt=true) ger
 * false tillbaka så ruten kan svara 200 med varning i stället för tyst tapp.
 */
export async function skrivSystemEvents(rader: EventRad[], viktigt = false): Promise<boolean> {
  if (rader.length === 0) return true;
  if (arByggFas()) return false;
  const rest = getSupabaseRest();
  if (!rest) return false;
  try {
    const res = await fetch(rest.origin + "/rest/v1/system_events", {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(rader),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok && viktigt) return false;
    return true;
  } catch {
    return viktigt ? false : true; // best-effort-läge slukar nätverksfel tyst
  }
}

/** epostHash-reexport (medlem-auth.ts samma nyckel — konsekvent spår). */
export { epostHash };
