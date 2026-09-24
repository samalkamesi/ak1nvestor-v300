/**
 * RAPPORTAKADEMIN — ART 13-INFORMATION VID INSAMLINGEN (BESLUT 1 §3,
 * LAGBESLUT STYRELSE-MUADCVYF-CG1JM2, 2026-09-21).
 *
 * LAGRUM: GDPR (EU) 2016/679 art 13 — den registrerade skall få
 * information VID INSAMLINGEN av personuppgifter: identitet, ändamål,
 * rättslig grund, lagringstid, rättigheter. Juridik-organets villkor:
 * synlig I FÖRSTA ÖVNINGENS gränssnitt — INTE bara i allmänna villkor.
 * Källa: laggrundade-beslut-2026-09-21.md BESLUT 1 (komplettering 3).
 *
 * MEKANIK (maskinell tvingande koppling): bedömnings-intaget (API-rutten)
 * VÄGRAR lagra en bedömning om eleven inte har ett art 13-kvitto —
 * informationen kan inte hoppas över i praktiken, bara visas + kvitteras.
 * Kvitto: type="ra_art13" details={authId,version,ts} — SENASTE-VINNER.
 */

import { getSupabaseRest } from "@/lib/supabase-rest";

export const RA_ART13_EVENT = "ra_art13";

/** Bumpas när informationstexten ändras — ny version ⇒ ny kvittning. */
export const ART13_VERSION = "ra-art13-v1";

export type Art13Avsnitt = { rubrik: string; text: string };

/**
 * Informationstexten som visas i första övningens gränssnitt FÖRE den
 * första bedömningen lagras. Strukturerad i avsnitt så UI:t kan rendera
 * med tryckytor (kunden: stora ytor, tydligt — ingen jargon).
 */
export const ART13_INFO: Art13Avsnitt[] = [
  {
    rubrik: "Vad vi sparar om dig",
    text: "När du gör övningar i Rapportakademin sparar vi endast: vilken övning det var, ditt svar, om det var rätt eller fel, och tidpunkten — kopplat till ditt konto. Inga fritextsvar, inga anteckningar, inget annat.",
  },
  {
    rubrik: "Varför vi sparar det",
    text: "Enda ändamålet är att anpassa din repetition inuti tjänsten: övningar du svarat fel på kommer tillbaka oftare. Vi använder aldrig svaren för något annat — inte marknadsföring, inte profilering, inte delning med tredje part.",
  },
  {
    rubrik: "Hur länge vi sparar det",
    text: "Så länge din prenumeration pågår. När prenumerationen upphör raderas dina övningsresultat automatiskt — vi sparar dem inte i onödan (dataskyddsförordningens artikel 5.1 e). Detta gäller även om du ångrar ett köp: ånger räknas som att prenumerationen upphört.",
  },
  {
    rubrik: "Dina rättigheter",
    text: "Du kan när som helst hämta ut dina övningsresultat som fil och radera dem helt från tjänsten — direkt i din medlemssida (dataskyddsförordningen artikel 15, 17 och 20). Kontakt för frågor: info@ak1nvestor.com.",
  },
];

function fv(s: string): string {
  return encodeURIComponent(s);
}

/**
 * Har eleven ett GILTIGT art 13-kvitto (senaste versionen)? Intagsgrinden
 * frågar detta FÖRE varje lagring av en bedömning.
 */
export async function harArt13Kvitto(authId: string): Promise<boolean> {
  const rest = getSupabaseRest();
  if (!rest || !authId) return false;
  try {
    const res = await fetch(
      `${rest.origin}/rest/v1/system_events?type=eq.${RA_ART13_EVENT}` +
        `&details->>authid=eq.${fv(authId.toLowerCase())}` +
        `&details->>version=eq.${fv(ART13_VERSION)}&select=id&limit=1`,
      { headers: rest.headers, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return false;
    const rader = (await res.json()) as unknown[];
    return rader.length > 0;
  } catch {
    return false;
  }
}

/**
 * Kvittera att art 13-informationen visades VID INSAMLINGSTILLFÄLLET.
 * Skrivs när eleven bockar av/fortsätter förbi informationsytan i första
 * övningen — informationen har visats, eleven har gått vidare med kännedom.
 */
export async function sparaArt13Kvitto(authId: string): Promise<boolean> {
  const rest = getSupabaseRest();
  if (!rest || !authId) return false;
  try {
    const res = await fetch(`${rest.origin}/rest/v1/system_events`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        type: RA_ART13_EVENT,
        severity: "info",
        message: `[ra] art 13-information visad vid insamlingstillfället (${ART13_VERSION})`,
        details: {
          authId: authId.toLowerCase(),
          version: ART13_VERSION,
          avsnitt: ART13_INFO.length,
          ts: new Date().toISOString(),
        },
        source: "rapportakademin",
      }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
