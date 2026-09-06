/**
 * REFERRAL — elev-för-elev steg 1: slumpad tipskod (alternativ C) + attribuering
 * utan belöning (m10-referral.md §3 + rekommendation 2, våg 69).
 *
 * GDPR-DATAMODELLEN (§3 alt C — "aggregate-only"):
 *   - Koden är en FRAMSTÄLLD slumpidentifierare (ingen hash — en e-posthash är
 *     pseudonym personuppgift enligt gällande vägledning, se m10 §2.1). Den
 *     lagras som KONTODATA kopplad till members.id — inga nya datakategorier.
 *   - INGEN social graf: "vem tipsade vem" lagras ALDRIG. Registreringen
 *     matchar koden, skriver ETT aggregat-event (type=referral, details=
 *     {framgang:true, kod}) och kastar sedan ref-fältet. Den nya elevens
 *     identitet kopplas ALDRIG till koden (AC2).
 *   - FOMO-FÖRBUD (§0/§3): ingen belöning, inga räknare för eleven, inga
 *     deadlines, ingen "lås upp genom att värva". Steg 2 (tack/badges) väntar
 *     på kundens policy-uppdatering J1–J2 — BYGGS EJ här.
 *
 * LAGRINGSVÄG UTAN DDL: members-tabellen saknar kolumn för koden (id, email,
 * name, phone, member_type, session_id, created_at, last_login_at) och får
 * inte ändras utan kund-SQL. Koden lagras därför som system_events-rader —
 * exakt mönstret från src/lib/oversattning/lager.ts (som skapades för att
 * lösa samma problem): SENASTE-VINNER-läsning per nyckel, order=
 * created_at.desc,id.desc (id.desc som tiebreaker — samma transaktions-batch
 * delar created_at, se lager.ts våg 67-kommentaren).
 *
 * Event-kontrakt (schema "ref/1"):
 *   Kod-rad:     type="referral_kod"  severity="info"
 *                message="[referral] tipskod {skapad|for ny}"
 *                details={kod, medlemsid, aktiv:true}   source="referral"
 *   Framgång:    type="referral"       severity="info"
 *                message="[referral] framgang: kod matchad vid registrering"
 *                details={framgang:true, kod}           source="referral"
 *                (ALDRIG den nya elevens id/e-post — AC2)
 *
 * Kod-format: 8 tecken ur ett alfabet UTAN förväxlingsbara tecken (I, O, 0
 * och 1 är uteslutna) — crypto.getRandomValues, typ "AB7CDE9F".
 *
 * Pedagogisk analys — inte investeringsråd.
 */

import type { SupabaseRest } from "./supabase-rest";

// ── Kod-format (rena funktioner — klient + server) ──────────────────────────

/** Alfabet utan förväxlingsbara tecken: I/1, O/0 är uteslutna. */
export const TIPS_ALFABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const TIPS_KOD_LANGD = 8;

/** Formatvakt: exakt 8 tecken ur alfabetet (versaler + siffror, ingen I/O/0/1). */
export const TIPS_KOD_RE = /^[A-HJ-NP-Z2-9]{8}$/;

/**
 * Slumpa en tipskod — 8 tecken ur TIPS_ALFABET via crypto.getRandomValues
 * (webbläsare + Node ≥ 20 har båda globala crypto). Alfabetet har exakt 32
 * tecken och 32 delar 2^32 jämnt — modulo är därför opartigt utan avvisning.
 */
export function genereraTipskod(): string {
  const slump = new Uint32Array(TIPS_KOD_LANGD);
  crypto.getRandomValues(slump);
  let kod = "";
  for (let i = 0; i < TIPS_KOD_LANGD; i++) kod += TIPS_ALFABET[slump[i] % TIPS_ALFABET.length];
  return kod;
}

/** Sant om strängen är en WELL-FORMERAD tipskod (versaler normaliseras först). */
export function arGiltigTipskod(kod: unknown): kod is string {
  return typeof kod === "string" && TIPS_KOD_RE.test(kod.trim().toUpperCase());
}

/**
 * Sanera ett ref-värde ur en URL/body: versaler, trim, validera. Ogiltigt
 * (fel längd, konstiga tecken, förväxlingsbara I/O/0/1) ⇒ "" — koden får
 * ALDRIG föras vidare till lagret utan formatvakt (server-side dubbelvägg:
 * klienten sanerar också, men servern litar bara på detta).
 */
export function saneraRefKod(varde: unknown): string {
  if (typeof varde !== "string") return "";
  const kod = varde.trim().toUpperCase().slice(0, 16);
  return TIPS_KOD_RE.test(kod) ? kod : "";
}

/**
 * URL:en en QR/delningslänk pekar på: LAB_URL + ev. "?ref=" + NORMALISERAD kod
 * (m10 §3 + §5 AC1: "https://lab.ak1nvestor.com/?ref=AB7CDE9F"). Rot-URL:er
 * utan sökväg får ett "/" före frågetecknet — kanonisk form, samma destination.
 * Ogiltig/saknad kod ⇒ basUrl OFÖRÄNDRAD (AC4: exakt dagens beteende).
 */
export function refUrl(basUrl: string, kod: string | null | undefined): string {
  const s = saneraRefKod(kod);
  if (!s) return basUrl;
  const bas = /^https?:\/\/[^/]+$/.test(basUrl) ? basUrl + "/" : basUrl;
  return `${bas}?ref=${s}`;
}

// ── Klientsidans nycklar (localStorage = elevens EGNA kod, sessionStorage =
//    mottagarens lästa kod — bägge är slumpkoder, aldrig persondata) ─────────

/** localStorage: elevens egna tipskod (opt-in, skapas av DelaKort-knappen). */
const TIPSKOD_KEY = "ak1a-tipskod";
/** sessionStorage: ref-koden en mottagare kom med — konsumeras av registreringen. */
export const REF_PENDING_KEY = "ak1a-ref-pending";

/** Läs elevens egna tipskod ur localStorage (välvillig — "" vid ogiltig/saknad). */
export function lasTipskodLokalt(): string {
  try {
    return saneraRefKod(localStorage.getItem(TIPSKOD_KEY));
  } catch {
    return "";
  }
}

/** Spara elevens tipskod lokalt (bara giltiga koder sparas). */
export function sparaTipskodLokalt(kod: string) {
  try {
    const s = saneraRefKod(kod);
    if (s) localStorage.setItem(TIPSKOD_KEY, s);
  } catch {
    /* localStorage otillgängligt — koden finns kvar på servern */
  }
}

/** Rensa elevens lokala tipskod (t.ex. vid utloggning — koden lever kvar i lagret). */
export function rensaTipskodLokalt() {
  try {
    localStorage.removeItem(TIPSKOD_KEY);
  } catch {}
}

/** Mottagarens pending-ref (sessionStorage) — "" om besöket inte bar någon kod. */
export function lasRefPending(): string {
  try {
    return saneraRefKod(sessionStorage.getItem(REF_PENDING_KEY));
  } catch {
    return "";
  }
}

/** Spara mottagarens lästa kod tills registreringen konsumerar den. */
export function sparaRefPending(kod: string) {
  try {
    const s = saneraRefKod(kod);
    if (s) sessionStorage.setItem(REF_PENDING_KEY, s);
  } catch {}
}

/** Kasta ref-fältet — körs av registreringsflödet efter att koden matchats. */
export function rensaRefPending() {
  try {
    sessionStorage.removeItem(REF_PENDING_KEY);
  } catch {}
}

// ── Serverläsningar (PostgREST, senaste-vinner — bara route-handlers) ───────

export const REFERRAL_KOD_EVENT_TYP = "referral_kod";
export const REFERRAL_EVENT_TYP = "referral";

/** En referral_kod-eventrad såsom PostgREST returnerar den. */
export type ReferralKodRad = {
  created_at?: string | null;
  kod?: string | null;
  medlemsid?: string | null;
  aktiv?: boolean | string | null; // jsonb->> ger "true"/"false" som text
};

/** URL-kodat PostgREST-filtervärde — RÅTT, aldrig citerat (lager.ts våg 55:
 *  citerade värden är verifierat icke-träffande för details->>-filter). */
function fv(v: string): string {
  return encodeURIComponent(v);
}

/** Senaste-vinner-ordningen — id.desc som tiebreaker (lager.ts våg 67). */
const SENASTE = "order=created_at.desc,id.desc";

/** Tolka aktiv-fältet: saknat/true/null ⇒ aktivt, explicit false ⇒ spärrat. */
function arAktivRad(rad: ReferralKodRad): boolean {
  return rad.aktiv !== false && rad.aktiv !== "false";
}

/**
 * Läs elevens AKTUELLA tipskod (senaste-vinner per medlemsid). Returnerar ""
 * när eleven aldrig skapat en kod. Tolerant: nätverksfel ⇒ "" (aldrig krasch).
 */
export async function lasTipskodForMedlem(
  rest: SupabaseRest,
  medlemsid: string
): Promise<string> {
  try {
    const res = await fetch(
      `${rest.origin}/rest/v1/system_events?type=eq.${REFERRAL_KOD_EVENT_TYP}` +
        `&details->>medlemsid=eq.${fv(medlemsid)}&select=created_at,details->>kod,details->>aktiv` +
        `&${SENASTE}&limit=1`,
      { headers: rest.headers, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return "";
    const rader = (await res.json()) as ReferralKodRad[];
    const senaste = rader[0];
    if (!senaste || !arAktivRad(senaste)) return "";
    return saneraRefKod(senaste.kod);
  } catch {
    return "";
  }
}

/**
 * Läs den tipskod-ägare en kod hör till (senaste-vinner per kod — en eventuell
 * förnyelse radar/förbigår gamla rader). Returnerar medlemsid TILL OCH MED att
 * senaste raden för koden är aktiv; spärrad/saknad kod ⇒ null. Detta är
 * MATCHNINGEN vid registreringen — inget läses om den nya eleven efteråt.
 */
export async function lasMedlemsidForKod(
  rest: SupabaseRest,
  kod: string
): Promise<string | null> {
  const s = saneraRefKod(kod);
  if (!s) return null;
  try {
    const res = await fetch(
      `${rest.origin}/rest/v1/system_events?type=eq.${REFERRAL_KOD_EVENT_TYP}` +
        `&details->>kod=eq.${fv(s)}&select=created_at,details->>medlemsid,details->>aktiv` +
        `&${SENASTE}&limit=1`,
      { headers: rest.headers, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const rader = (await res.json()) as ReferralKodRad[];
    const senaste = rader[0];
    if (!senaste || !arAktivRad(senaste) || typeof senaste.medlemsid !== "string" || !senaste.medlemsid) {
      return null;
    }
    return senaste.medlemsid;
  } catch {
    return null;
  }
}

/**
 * Skriv en ny tipskod-rad: best-effort DELETE av elevens föregångare (lager.ts
 * lasSparaEvents-mönstret — lagret sväller inte, och en gammal kod slutar
 * gälla direkt) följt av POST av nya raden. Returnerar true vid skriven rad.
 */
export async function skrivTipskod(
  rest: SupabaseRest,
  medlemsid: string,
  kod: string
): Promise<boolean> {
  const s = saneraRefKod(kod);
  if (!s || !medlemsid) return false;
  try {
    await fetch(
      `${rest.origin}/rest/v1/system_events?type=eq.${REFERRAL_KOD_EVENT_TYP}` +
        `&details->>medlemsid=eq.${fv(medlemsid)}&select=id`,
      { method: "DELETE", headers: rest.headers, signal: AbortSignal.timeout(8000) }
    );
  } catch {
    /* best effort — senaste-vinner-läsningen täcker kvarvarande rader */
  }
  try {
    const res = await fetch(`${rest.origin}/rest/v1/system_events`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        type: REFERRAL_KOD_EVENT_TYP,
        severity: "info",
        message: `[referral] tipskod skapad för medlem ${medlemsid.slice(0, 8)}…`,
        details: { kod: s, medlemsid, aktiv: true },
        source: "referral",
      }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Skriv framgångs-aggregatet (EN rad per lyckad attribuering): details bär
 * ALDRIG den nya elevens identitet — bara framgang:true + koden som matchade.
 * Anropas med void/från fire-and-forget: registreringen får ALDRIG misslyckas
 * på attribueringen (samma mönster som vbout-leden i member/register).
 */
export async function skrivReferralFramgang(rest: SupabaseRest, kod: string): Promise<boolean> {
  const s = saneraRefKod(kod);
  if (!s) return false;
  try {
    const res = await fetch(`${rest.origin}/rest/v1/system_events`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        type: REFERRAL_EVENT_TYP,
        severity: "info",
        message: "[referral] framgang: kod matchad vid registrering",
        details: { framgang: true, kod: s },
        source: "referral",
      }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
