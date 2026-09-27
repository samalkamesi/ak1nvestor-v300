/**
 * MEDLEM-AUTH — Supabase Auth (GoTrue v2 REST) för medlemmars konto-flöden
 * (FAS L1, STYRELSE-INLOGGNING-ADMIN.md våg 86 — kontraktet för V86-L1AUTH).
 *
 * ── KONTRAKTET ──────────────────────────────────────────────────────────────
 * Medlemsautentisering via Supabase Auth, verifierad LIVE mot kundens projekt
 * (signup skapade äkta användare; health 200): endpoinkterna nedan är de
 * verifierade GoTrue-v2-REST-anropen. Sessionstokens finns ENDAST i httpOnly-
 * cookies via server-proxy — ALDRIG localStorage (XSS-skydd, styrelsens L1-
 * beslut). ALDRIG lösenord i egen kod, loggar eller felmeddelanden (P6) —
 * Supabase sköter hashningen; vi skickar lösenordet EN gång i begäran-kroppen
 * till /auth/v1 och glömmer det omedelbart.
 *
 * ── MILJÖVARIABLER (finns redan i .env/.env.local — INGEN .env-ändring) ─────
 *   NEXT_PUBLIC_SUPABASE_URL        projektets https-URL (SSRF-vaknad i
 *                                   supabase-rest.ts: ENDAST https *.supabase.co)
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY   ANON-nyckeln — medlems-flödena använder
 *                                   ALLTID anon (publik GoTrue-roll), aldrig
 *                                   service-role
 *   SUPABASE_SERVICE_ROLE_KEY       ENDAST profil-eventet (system_events) —
 *                                   samma nyckel som övriga interna skrivvägar
 *
 * ── SÄKERHETSREGLER (KRITA, styrelsen) ──────────────────────────────────────
 *   · Felmeddelanden GENERELLA — avslöjar ALDRIG om ett konto finns ("konto
 *     kunde inte skapas" / "fel e-post eller lösenord"), aldrig Supabase-detaljer.
 *   · Valideringsfel (format/längd) FÅR vara specifika — de läcker inget om
 *     konton: "Ogiltig e-postadress.", "Lösenordet måste vara minst 10 tecken."
 *   · E-post normaliseras till gemener FÖRE alla jämförelser/sändningar.
 *   · Cookies: httpOnly + secure + sameSite=lax + path=/; access 1 h,
 *     refresh 30 d (rotation mot /auth/v1/token?grant_type=refresh_token).
 *   · NEXT_PHASE=phase-production-build ⇒ ALDRIG nätverk (bygg-hermetik,
 *     mönstret från variabler-lagring.ts våg 79).
 *   · Fetch-recept (Mimosa): URL = validerat origin (supabase-rest) + FAST
 *     https-literal-suffix, "+"-konkat — ALDRIG variabel i sökvägen.
 *
 * Signaturer (L1-kontraktet):
 *   lasMedlemSession(req)   → {authId, epost} | null   (access-kaka → /user)
 *   fornyaMedlemSession(req)→ {session, access, refresh} | null (rotation)
 *   medlemSignup(epost, lösenord) → {ok, fel?, orsak?, authId?}
 *   medlemSignIn(epost, lösenord)  → {ok, access, refresh, user} | {ok:false, fel}
 *   medlemSignOut(access)   → best-effort POST /auth/v1/logout
 *   + kaka-hjälpare, valideringar, rate-limit/IP-hash (rent, testbart)
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

import { createHash } from "node:crypto";

import { getSupabaseRest } from "./supabase-rest";
import { SPEGEL_SITE_URL } from "./spegel-metadata";

// ── Minimala req/res-lika-typer (strukturerade — NextRequest/NextResponse ────)
// uppfyller dem; testerna kör rena stubbar utan next-import utöver bron).

/** Det lasMedlemSession/lasKakaVarde behöver av en förfrågan. */
export type ReqLike = { headers: { get(namn: string): string | null } };

/** Det sattMedlemKakor/rensaMedlemKakor behöver av ett svar. */
export type KakSvarLike = {
  cookies: { set(namn: string, varde: string, attribut: Record<string, unknown>): unknown };
};

// ── Cookies (L1-kontraktet: httpOnly, access 1 h, refresh 30 d) ──────────────

/** Access-token-kakan (httpOnly — ALDRIG localStorage). */
export const MEDLEM_KAKA = "ak1a_medlem";
/** Refresh-token-kakan (httpOnly; rotation via fornyaMedlemSession). */
export const MEDLEM_REFRESH_KAKA = "ak1a_medlem_refresh";
/** Access-kakans maxAge i sekunder (1 timme). */
export const MEDLEM_ACCESS_MAX_AGE_S = 60 * 60;
/** Refresh-kakans maxAge i sekunder (30 dygn). */
export const MEDLEM_REFRESH_MAX_AGE_S = 30 * 24 * 60 * 60;

/** Cookie-värde ur rå cookie-header ("a=1; ak1a_medlem=…") — eller null.
 *  Tar allt efter FIRST "=" (JWT/base64-padding får innehålla "="/"."). */
export function lasKakaVarde(req: ReqLike, namn: string): string | null {
  const rad = req.headers.get("cookie");
  if (!rad) return null;
  for (const del of rad.split(";")) {
    const trimmad = del.trim();
    const lika = trimmad.indexOf("=");
    if (lika <= 0) continue;
    if (trimmad.slice(0, lika) === namn) return trimmad.slice(lika + 1);
  }
  return null;
}

/** Sätt access- + refresh-kakor på ett svar (L1-attributen, P6: inga lösenord). */
export function sattMedlemKakor(res: KakSvarLike, access: string, refresh: string): void {
  res.cookies.set(MEDLEM_KAKA, access, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MEDLEM_ACCESS_MAX_AGE_S,
  });
  res.cookies.set(MEDLEM_REFRESH_KAKA, refresh, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MEDLEM_REFRESH_MAX_AGE_S,
  });
}

/** Töm båda medlemskakorna (utloggning — samma attribut, maxAge 0). */
export function rensaMedlemKakor(res: KakSvarLike): void {
  for (const namn of [MEDLEM_KAKA, MEDLEM_REFRESH_KAKA]) {
    res.cookies.set(namn, "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }
}

// ── Validering (ren logik — specifika texter läcker inget om konton) ─────────

/** E-postformat (pragmatisk vitlista på gemener-form), max 254 tecken. */
const EPOST_RE = /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/;

/** Normaliserad (gemener) e-post — eller null när formatet är ogiltigt. */
export function valideraEpost(epost: unknown): string | null {
  if (typeof epost !== "string") return null;
  const normaliserad = epost.trim().toLowerCase();
  if (normaliserad.length < 3 || normaliserad.length > 254) return null;
  return EPOST_RE.test(normaliserad) ? normaliserad : null;
}

/** Lösenord ≥ 10 tecken (signup-policyn; övre tak 72 — GoTrue/bcrypt-gränsen). */
export function valideraLosenord(losenord: unknown): string | null {
  if (typeof losenord !== "string") return null;
  if (losenord.length < 10) return null;
  if (losenord.length > 72) return null;
  return losenord;
}

// ── Rate-limit + IP-hash (rent, testbart — rutten äger Map:en) ───────────────

/** Sha256(ip) hex, första 16 tecken — nyckel per IP UTAN att lagra IP:n. */
export function ipHash(ip: string): string {
  return createHash("sha256").update(ip, "utf8").digest("hex").slice(0, 16);
}

/** Klient-IP ur proxy-headers (Vercel: x-forwarded-for) — eller "okand". */
export function klientIp(req: ReqLike): string {
  const xff = req.headers.get("x-forwarded-for");
  if (typeof xff === "string" && xff.trim() !== "") {
    const forsta = xff.split(",")[0].trim();
    if (forsta !== "") return forsta;
  }
  const real = req.headers.get("x-real-ip");
  if (typeof real === "string" && real.trim() !== "") return real.trim();
  return "okand";
}

/** Ren rate-limit-bedömning: fönster 60 s, tak 10 FEL per nyckel (L1/KRITA).
 *  Returnerar kvarvarande tidsstämplar + om nästa försök ska NEKAS. */
export function utvarderaRateLimit(
  forsok: readonly number[],
  nu: number,
  max = 10,
  fonsterMs = 60_000,
): { limitad: boolean; stansade: number[] } {
  const stansade = forsok.filter((t) => nu - t < fonsterMs && t <= nu);
  return { limitad: stansade.length >= max, stansade };
}

// ── GDPR: e-post-hash (sha256, första 12) — ALDRIG e-post i klartext ─────────

/** Sha256(normaliserad e-post) hex, första 12 tecken — profil-eventets nyckel. */
export function epostHash(epost: string): string {
  return createHash("sha256").update(epost.toLowerCase(), "utf8").digest("hex").slice(0, 12);
}

// ── GoTrue-REST-plumbing (anon-nyckel — ALDRIG service-role här) ─────────────

/** Det medlem-flödena behöver: validerat origin + anon-headers, eller null. */
function getSupabaseAuth(): { origin: string; headers: Record<string, string> } | null {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anon) return null;
  // getSupabaseRest validerar NEXT_PUBLIC_SUPABASE_URL (https + *.supabase.co +
  // SSRF-vakter); dess headers (ev. service-role) används INTE här — ENDAST origin.
  const rest = getSupabaseRest();
  if (!rest) return null;
  return { origin: rest.origin, headers: { apikey: anon, Authorization: "Bearer " + anon } };
}

/** Bygg-hermetik (variabler-lagring.ts våg 79): aldrig nätverk under next build. */
function arByggFas(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

/** Generisk signup-feltext — supprimerad: avslöjar ALDRIG orsak/konto-existens. */
export const MEDLEM_SIGNUP_FEL = "Kontot kunde inte skapas.";
/** Generisk signin-feltext — avslöjar ALDRIG om kontot finns. */
export const MEDLEM_SIGNIN_FEL = "Fel e-post eller lösenord.";

// ── LOGIN-2.0 (våg 101): felkoder utan läckage ───────────────────────────────
// KRITA-regeln består: kontoexistens avslöjas ALDRIG (dublett förblir
// supprimerad). Däremot är tre orsaker säkra att SKILJA UT — de läcker
// inget om konton och var tidigare oskiljbara från "fel lösenord":
//   "ej_bekraftad" — GoTrue svarar email_not_confirmed ENDAST när e-post +
//                    lösenord var KORREKTA (kontoexists + rätt lösenord är
//                    redan bevisat hos anroparen) → säker att säga högt.
//   "rate"         — throttling (vår eller GoTrues) → retrySek till räknaren.
//   "natverk"      — tjänsten nåddes ej (avslöjar inget om konton).

/** Typad felkod för klienten (mappas mot texter i UI:t; okänd ⇒ generisk). */
export type MedlemFelKod = "ej_bekraftad" | "rate" | "natverk" | "tjanst";

/** Nätverksfel-texten (säker — läcker inget om konton). */
export const MEDLEM_NATVERK_FEL = "Tjänsten kunde inte nås — kontrollera anslutningen och försök igen.";
/** Rate-limit-texten (fönstret bär retrySek — räknaren i UI:t visar nedräkning). */
export const MEDLEM_RATE_FEL = "För många försök — vänta en stund och försök igen.";
/** Ej-bekräftad-e-post-texten (endast vid korrekta inloggningsuppgifter). */
export const MEDLEM_EJ_BEKRAFTAD_FEL =
  "Din e-post är inte bekräftad ännu — kolla inkorgen (och skräpposten) efter bekräftelselänken.";

/** Tolka en GoTrue-felskropp till {kod?, retrySek?} — okänt ⇒ null (generisk text).
 *  Läser ENDAST kända throttling-/bekräftelse-koder; övriga (dublett, ogiltiga
 *  uppgifter, sårbarhetsblock) förblir supprimerade enligt KRITA. */
function tolkaGoTrueFel(kropp: unknown, status: number): { kod: MedlemFelKod; retrySek?: number } | null {
  if (typeof kropp !== "object" || kropp === null) return null;
  const errorKod = typeof (kropp as Record<string, unknown>).error_code === "string"
    ? ((kropp as Record<string, unknown>).error_code as string)
    : "";
  if (errorKod === "email_not_confirmed") return { kod: "ej_bekraftad" };
  if (errorKod === "over_request_rate_limit" || errorKod === "over_email_send_rate_limit" || status === 429) {
    return { kod: "rate", retrySek: 60 };
  }
  return null;
}

/** Läs felkroppen tåligt (trasig JSON ⇒ null — då gäller generisk text). */
async function lasFelKropp(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** GoTrue-sessionsvararetur (signup/token) — tolerant för båda formerna. */
type GoTrueSession = {
  access_token?: unknown;
  refresh_token?: unknown;
  user?: { id?: unknown; email?: unknown } | null;
  id?: unknown;
  email?: unknown;
};

/** Plocka {authId, epost} ur en GoTrue-kropp (user-wrapper eller platt). */
function plockaUser(kropp: GoTrueSession): { authId: string; epost: string } | null {
  const id = typeof kropp.user?.id === "string" ? kropp.user.id : typeof kropp.id === "string" ? kropp.id : null;
  const epost =
    typeof kropp.user?.email === "string" ? kropp.user.email : typeof kropp.email === "string" ? kropp.email : null;
  if (!id || !epost) return null;
  return { authId: id, epost: epost.toLowerCase() };
}

// ── signup ───────────────────────────────────────────────────────────────────

/** medlemSignup-resultat: ok + (vid lyckat) authId — eller generisk feltext.
 *  orsak "validering" (400-värd) vs "tjanst" (Supabase-fel, supprimerat).
 *  LOGIN-2.0: kod "rate"/"natverk" får bäras (läcker inget om konton);
 *  dublett förblir supprimerad (KRITA — kontoexistens avslöjas aldrig). */
export type MedlemSignupResultat =
  | { ok: true; authId: string }
  | { ok: false; fel: string; orsak: "validering" | "tjanst"; kod?: MedlemFelKod; retrySek?: number };

/**
 * medlemSignup — POST {origin}/auth/v1/signup (VERIFIERAD LIVE-endpoint).
 * Validerar EJOR e-postformat+gemener och lösenord ≥ 10 lokalt; Supabase-fel
 * (dublett, 429, nätverk...) SUPPRESSAS till "Kontot kunde inte skapas." —
 * aldrig detaljer, aldrig kontots existens. Lösenordet loggas ALDRIG (P6).
 */
export async function medlemSignup(epost: unknown, losenord: unknown): Promise<MedlemSignupResultat> {
  const normaliseradEpost = valideraEpost(epost);
  if (normaliseradEpost === null) return { ok: false, fel: "Ogiltig e-postadress.", orsak: "validering" };
  if (valideraLosenord(losenord) === null) {
    return {
      ok: false,
      fel: typeof losenord === "string" && losenord.length > 72
        ? "Lösenordet får vara högst 72 tecken."
        : "Lösenordet måste vara minst 10 tecken.",
      orsak: "validering",
    };
  }

  if (arByggFas()) return { ok: false, fel: MEDLEM_SIGNUP_FEL, orsak: "tjanst" };
  const auth = getSupabaseAuth();
  if (!auth) return { ok: false, fel: MEDLEM_SIGNUP_FEL, orsak: "tjanst" };

  try {
    const res = await fetch(auth.origin + "/auth/v1/signup", {
      method: "POST",
      headers: { ...auth.headers, "Content-Type": "application/json" },
      body: JSON.stringify({ email: normaliseradEpost, password: losenord }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) {
      // LOGIN-2.0: rate/natverk skiljs ut; dublett m.m. förblir supprimerad.
      const tolkat = tolkaGoTrueFel(await lasFelKropp(res), res.status);
      if (tolkat?.kod === "rate") return { ok: false, fel: MEDLEM_RATE_FEL, orsak: "tjanst", kod: "rate", retrySek: tolkat.retrySek };
      return { ok: false, fel: MEDLEM_SIGNUP_FEL, orsak: "tjanst" };
    }
    const kropp = (await res.json()) as GoTrueSession;
    const user = plockaUser(kropp);
    if (!user) return { ok: false, fel: MEDLEM_SIGNUP_FEL, orsak: "tjanst" };
    return { ok: true, authId: user.authId };
  } catch {
    return { ok: false, fel: MEDLEM_NATVERK_FEL, orsak: "tjanst", kod: "natverk" };
  }
}

// ── signin / signout / session / refresh ─────────────────────────────────────

/** medlemSignIn-resultat: tokens + user — eller feltext (ALDRIG kontoexistens).
 *  LOGIN-2.0: kod "ej_bekraftad" (endast vid KORREKTA uppgifter — säkert),
 *  "rate" (+retrySek) och "natverk" skiljs ut; ogiltiga uppgifter förblir
 *  den generella texten (inexistens läcker aldrig). */
export type MedlemSignInResultat =
  | { ok: true; access: string; refresh: string; user: { authId: string; epost: string } }
  | { ok: false; fel: string; kod?: MedlemFelKod; retrySek?: number };

/**
 * medlemSignIn — POST {origin}/auth/v1/token?grant_type=password (VERIFIERAD
 * LIVE). ALLA misslyckanden (fel lösenord, okänt konto, nätverk, byggfas)
 * ⇒ samma generella text "Fel e-post eller lösenord." — inexistens läcker
 * aldrig. Lösenordet skickas EN gång i kroppen, loggas ALDRIG (P6).
 */
export async function medlemSignIn(epost: unknown, losenord: unknown): Promise<MedlemSignInResultat> {
  const normaliseradEpost = valideraEpost(epost);
  if (normaliseradEpost === null || typeof losenord !== "string" || losenord === "") {
    return { ok: false, fel: MEDLEM_SIGNIN_FEL };
  }

  if (arByggFas()) return { ok: false, fel: MEDLEM_SIGNIN_FEL };
  const auth = getSupabaseAuth();
  if (!auth) return { ok: false, fel: MEDLEM_SIGNIN_FEL };

  try {
    const res = await fetch(auth.origin + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { ...auth.headers, "Content-Type": "application/json" },
      body: JSON.stringify({ email: normaliseradEpost, password: losenord }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) {
      // LOGIN-2.0: email_not_confirmed kommer ENDAST med korrekta uppgifter —
      // säker att säga högt; rate skiljs ut med fönster; övrigt ⇒ generisk.
      const tolkat = tolkaGoTrueFel(await lasFelKropp(res), res.status);
      if (tolkat?.kod === "ej_bekraftad") return { ok: false, fel: MEDLEM_EJ_BEKRAFTAD_FEL, kod: "ej_bekraftad" };
      if (tolkat?.kod === "rate") return { ok: false, fel: MEDLEM_RATE_FEL, kod: "rate", retrySek: tolkat.retrySek };
      return { ok: false, fel: MEDLEM_SIGNIN_FEL };
    }
    const kropp = (await res.json()) as GoTrueSession;
    const user = plockaUser(kropp);
    if (!user || typeof kropp.access_token !== "string" || typeof kropp.refresh_token !== "string") {
      return { ok: false, fel: MEDLEM_SIGNIN_FEL };
    }
    return { ok: true, access: kropp.access_token, refresh: kropp.refresh_token, user };
  } catch {
    return { ok: false, fel: MEDLEM_NATVERK_FEL, kod: "natverk" };
  }
}

// ── glömt lösenord (LOGIN-2.0): recover-länk UTAN kontoexistens-läckage ──────

/** medlemGlomtLosenord-resultat: ok är ALLTID sant när begäran gick iväg —
 *  svaret avslöjar ALDRIG om kontot finns (samma neutrala text oavsett). */
export type MedlemGlomtResultat =
  | { ok: true }
  | { ok: false; fel: string; kod: MedlemFelKod };

/**
 * medlemGlomtLosenord — POST {origin}/auth/v1/recover (GoTrue skickar ett
 * återställningsmejl OM kontot finns). KRITA: anroparen svarar ALLTID samma
 * neutrala text vid ok — kontots existens läcker aldrig. Endast transport-
 * fel (tjänsten nere) skiljs ut som kod "natverk"/"tjanst". E-posten
 * normaliseras och valideras lokalt FÖRE sändning (inga skräp-anrop).
 */
export async function medlemGlomtLosenord(epost: unknown): Promise<MedlemGlomtResultat> {
  const normaliseradEpost = valideraEpost(epost);
  if (normaliseradEpost === null) return { ok: false, fel: "Ogiltig e-postadress.", kod: "tjanst" };

  if (arByggFas()) return { ok: false, fel: MEDLEM_SIGNUP_FEL, kod: "tjanst" };
  const auth = getSupabaseAuth();
  if (!auth) return { ok: false, fel: MEDLEM_SIGNUP_FEL, kod: "tjanst" };

  try {
    // ÅTERSTÄLLNINGS-VIDAREBESÖK (buggrapport 2026-09-27): recover-mejlets
    // länk måste landa på VÅR domän — annars hamnar eleven på Supabase-
    // projektets Site URL (ak1nvestor.space-z.ai). redirect_to respekteras
    // när URL:en finns i projektets Redirect URLs (dashboard-steg); utan
    // allow-listning faller GoTrue tillbaka på Site URL som före —
    // aggiande, aldrig sämre.
    const res = await fetch(
      auth.origin + "/auth/v1/recover?redirect_to=" + encodeURIComponent(SPEGEL_SITE_URL + "/logga-in"),
      {
        method: "POST",
        headers: { ...auth.headers, "Content-Type": "application/json" },
        body: JSON.stringify({ email: normaliseradEpost }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) {
      const tolkat = tolkaGoTrueFel(await lasFelKropp(res), res.status);
      if (tolkat?.kod === "rate") return { ok: false, fel: MEDLEM_RATE_FEL, kod: "rate" };
      return { ok: false, fel: "Begäran kunde inte skickas — försök igen om en stund.", kod: "tjanst" };
    }
    return { ok: true }; // neutralt — GoTrue-mejlet (om kontot finns) är på väg
  } catch {
    return { ok: false, fel: MEDLEM_NATVERK_FEL, kod: "natverk" };
  }
}

/**
 * medlemSattLosenord — PATCH {origin}/auth/v1/user med Bearer access-token
 * (återställningsflödet, buggrapport 2026-09-27: mejlets länk bär en giltig
 * sessionstoken i hashen). Sätter det nya lösenordet OCH svarar med
 * användarens e-post (klientens fas-synk behöver den). Lösenordet skickas EN
 * gång i kroppen och glöms omedelbart (P6) — ALDRIG i loggar eller fel.
 */
export async function medlemSattLosenord(
  access: unknown,
  losenord: unknown,
): Promise<{ ok: true; epost: string } | { ok: false; fel: string; kod: MedlemFelKod }> {
  if (typeof access !== "string" || access.length < 20) {
    return { ok: false, fel: "Återställningslänken är ogiltig eller utgången — begär en ny.", kod: "tjanst" };
  }
  if (valideraLosenord(losenord) === null) {
    return { ok: false, fel: "Lösenordet måste vara minst 10 tecken.", kod: "tjanst" };
  }
  if (arByggFas()) return { ok: false, fel: MEDLEM_SIGNUP_FEL, kod: "tjanst" };
  const auth = getSupabaseAuth();
  if (!auth) return { ok: false, fel: MEDLEM_SIGNUP_FEL, kod: "tjanst" };
  try {
    const res = await fetch(auth.origin + "/auth/v1/user", {
      method: "PATCH",
      headers: { ...auth.headers, Authorization: "Bearer " + access, "Content-Type": "application/json" },
      body: JSON.stringify({ password: losenord }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) {
      // Ogiltig/utgången token eller svag lösenords-policy — samma neutrala
      // text: länkens existens avslöjar inget extra.
      return { ok: false, fel: "Återställningslänken är ogiltig eller utgången — begär en ny.", kod: "tjanst" };
    }
    const kropp = (await res.json().catch(() => ({}))) as { email?: unknown };
    return { ok: true, epost: typeof kropp.email === "string" ? kropp.email : "" };
  } catch {
    return { ok: false, fel: MEDLEM_NATVERK_FEL, kod: "natverk" };
  }
}

/**
 * medlemSignOut — POST {origin}/auth/v1/logout med Bearer access (VERIFIERAD
 * LIVE). Best-effort: kakorna rensas av anroparen oavsett; nätverksfel här är
 * kosmetiskt. Access-token skickas i header, loggas ALDRIG (P6).
 */
export async function medlemSignOut(access: string): Promise<boolean> {
  if (!access || arByggFas()) return false;
  const auth = getSupabaseAuth();
  if (!auth) return false;
  try {
    const res = await fetch(auth.origin + "/auth/v1/logout", {
      method: "POST",
      headers: { ...auth.headers, Authorization: "Bearer " + access },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** En verifierad medlemsession (läsvärd i server-komponenter). */
export type MedlemSession = { authId: string; epost: string };

/**
 * lasMedlemSession — läs httpOnly-kakan (ak1a_medlem) och VERIFIERA access-
 * token mot GET {origin}/auth/v1/user (VERIFIERAD LIVE). Ogiltig/utgången/
 * saknad kaka, nätverksfel eller byggfas ⇒ null (TYST — aldrig fel-text).
 * Refresh-rotation sker via fornyaMedlemSession i API-rutten (som kan sätta
 * nya kakor); här är kontraktet ren verifiering.
 */
export async function lasMedlemSession(req: ReqLike): Promise<MedlemSession | null> {
  const access = lasKakaVarde(req, MEDLEM_KAKA);
  if (!access) return null;

  if (arByggFas()) return null;
  const auth = getSupabaseAuth();
  if (!auth) return null;

  try {
    const res = await fetch(auth.origin + "/auth/v1/user", {
      headers: { ...auth.headers, Authorization: "Bearer " + access },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const kropp = (await res.json()) as GoTrueSession;
    return plockaUser(kropp);
  } catch {
    return null;
  }
}

/**
 * fornyaMedlemSession — refresh-rotation: POST {origin}/auth/v1/token?
 * grant_type=refresh_token med refresh-kakans token (VERIFIERAD LIVE-endpoint;
 * GoTrue ROTERAR refresh-token vid varje förnyelse). Returnerar nya tokens +
 * session så API-rutten kan sätta om kakorna; misslyckande ⇒ null (den gamla
 * refresh-tokenen är då förbrukad/ogiltig — anroparen rensar kakorna).
 */
export async function fornyaMedlemSession(
  req: ReqLike,
): Promise<{ session: MedlemSession; access: string; refresh: string } | null> {
  const refresh = lasKakaVarde(req, MEDLEM_REFRESH_KAKA);
  if (!refresh) return null;

  if (arByggFas()) return null;
  const auth = getSupabaseAuth();
  if (!auth) return null;

  try {
    const res = await fetch(auth.origin + "/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      headers: { ...auth.headers, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const kropp = (await res.json()) as GoTrueSession;
    const user = plockaUser(kropp);
    if (!user || typeof kropp.access_token !== "string" || typeof kropp.refresh_token !== "string") {
      return null;
    }
    return { session: user, access: kropp.access_token, refresh: kropp.refresh_token };
  } catch {
    return null;
  }
}

// ── Profil-event (system_events — mönstret från variabler-lagring.ts) ────────

/** Event-typen för medlemsprofiler (L2/L3 läser denna; INGEN ny tabell/DDL). */
export const MEDLEM_EVENT_TYP = "medlem";
const MEDLEM_KALLA = "medlem";

/**
 * skrivMedlemProfilEvent — POST {origin}/rest/v1/system_events (service-role,
 * samma PostgREST-mönster som variabler-lagring.ts/sparaVariabel). Rad:
 *   type="medlem" severity="info"
 *   message="[medlem] konto skapat <epostHash>"
 *   details={authId, epostHash (sha256 första 12), namn?, skapad}
 * ALDRIG lösenord, ALDRIG e-post i klartext (GDPR-minimering). Best-effort:
 * kastar ALDRIG — auth-kontot är redan skapat, profilraden får inte krascha
 * registreringen (vbout/referral-mönstret). Byggfas ⇒ false utan nätverk.
 */
export async function skrivMedlemProfilEvent(
  authId: string,
  epost: string,
  namn?: string,
): Promise<boolean> {
  if (arByggFas()) return false;
  const rest = getSupabaseRest(); // service-role-först — interna skrivvägar
  if (!rest) return false;

  const hash = epostHash(epost);
  try {
    const res = await fetch(rest.origin + "/rest/v1/system_events", {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify([
        {
          type: MEDLEM_EVENT_TYP,
          severity: "info",
          message: "[medlem] konto skapat " + hash,
          details: {
            authId,
            epostHash: hash,
            ...(typeof namn === "string" && namn.trim() !== "" ? { namn: namn.trim().slice(0, 100) } : {}),
            skapad: new Date().toISOString(),
          },
          source: MEDLEM_KALLA,
        },
      ]),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}
