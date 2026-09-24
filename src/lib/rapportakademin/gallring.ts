/**
 * RAPPORTAKADEMIN — GALLRINGSJOBB (BESLUT 1 §§2+3, LAGBESLUT
 * STYRELSE-MUADCVYF-CG1JM2, 2026-09-21).
 *
 * LAGRUM: GDPR (EU) 2016/679 art 5.1 e (lagringstidsbegränsning) —
 * personuppgifter får inte sparas längre än nödvändigt för ändamålet.
 * Ändamålet (anpassad repetition INOM tjänsten, se minimering.ts) upphör
 * när prenumerationen upphör ⇒ bedömningarna RADERAS automatiskt.
 * Retroaktivt upphörande via ångerrätt (2005:59 2 kap) triggar samma
 * statusgång: ånger ⇒ status "utgick" med retroaktiv verkan ⇒ gallring.
 * Källa: laggrundade-beslut-2026-09-21.md BESLUT 1 (CISO-villkor 1).
 *
 * LAGRING (schema "ra/1", LAGRINGSVÄG UTAN DDL — referral.ts-mönstret):
 *   Prenumerationsstatus: type="ra_prenumeration" details={authId,status,
 *     ts} — SENASTE-VINNER per authId (order=created_at.desc,id.desc).
 *   Bedömning:          type="ra_bedomning"    details={minimerad rad}
 *   Gallringskvitto:    type="ra_gallring"     details={authId,raderade,
 *     ts,bakomliggande} — ETT KVITTO PER ELEV: vad togs bort, när, var.
 *
 * MEKANIK: kronodrivet jobb (pumpor-familjen) anropar gallraUpphordaElever()
 * som är IDEMPOTENT — redan gallrade elever (senaste status = gallrad eller
 * inga kvarvarande bedömningar) lämnas ifred; inget dubbelräknande kvitto.
 *
 * BACKUP-RETENTION (CISO-villkor 1, dokumenterat tak): gallring verkställer
 * i databasen DIREKT; serverns backup-retentionstak är dokumenterat i
 * DRIFTSBOKEN (data/infra/) — en gallrad rad försvinner ur backuppen när
 * retentionstaket löper ut. Ingen backup klipps manuellt.
 */

import { getSupabaseRest, type SupabaseRest } from "@/lib/supabase-rest";

export const RA_BEDOMNING_EVENT = "ra_bedomning";
export const RA_PRENUMERATION_EVENT = "ra_prenumeration";
export const RA_GALLRING_EVENT = "ra_gallring";
export const RA_RADERING_EVENT = "ra_radering";

export type PrenumerationsStatus = "aktiv" | "utgick" | "gallrad";

type StatusRad = { details: { authId?: string; status?: string } };

/** URL-koda ett filtervärde säkert (PostgREST ?)-konvention). */
function fv(s: string): string {
  return encodeURIComponent(s);
}

/**
 * Läs elevens SENASTE prenumerationsstatus (SENASTE-VINNER enligt
 * referral.ts/lager.ts-kontraktet). Okänd elev ⇒ null (aldrig "gissad").
 */
export async function lasPrenumerationsStatus(
  authId: string
): Promise<PrenumerationsStatus | null> {
  const rest = getSupabaseRest();
  if (!rest || !authId) return null;
  try {
    const res = await fetch(
      `${rest.origin}/rest/v1/system_events?type=eq.${RA_PRENUMERATION_EVENT}` +
        `&details->>authid=eq.${fv(authId.toLowerCase())}` +
        `&select=details&order=created_at.desc,id.desc&limit=1`,
      { headers: rest.headers, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const rader = (await res.json()) as StatusRad[];
    const s = rader[0]?.details?.status;
    if (s === "aktiv" || s === "utgick" || s === "gallrad") return s;
    return null;
  } catch {
    return null;
  }
}

/**
 * Skriv en prenumerationshändelse (statusgång aktiv → utgick). Körs av
 * aktiverings-/ångerrutorna; THIS module never guesses status — den läses.
 */
export async function skrivPrenumerationsStatus(
  authId: string,
  status: "aktiv" | "utgick"
): Promise<boolean> {
  const rest = getSupabaseRest();
  if (!rest || !authId) return false;
  try {
    const res = await fetch(`${rest.origin}/rest/v1/system_events`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        type: RA_PRENUMERATION_EVENT,
        severity: "info",
        message: `[ra] prenumeration ${status} för ${authId.slice(0, 8)}…`,
        details: { authId: authId.toLowerCase(), status, ts: new Date().toISOString() },
        source: "rapportakademin",
      }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Radera EN elevs bedömningar + skriv kvitto (art 5.1 e / art 17).
 * Används av gallringsjobbet (bakomliggande="art 5.1 e — prenumeration
 * upphört") och av elevens egna raderingsbegäran (bakomliggande=
 * "art 17 — elevens begäran"). Returnerar antal raderade rader.
 */
export async function raderaEleversBedomningar(
  authId: string,
  bakomliggande: string,
  eventTyp: typeof RA_GALLRING_EVENT | typeof RA_RADERING_EVENT
): Promise<number> {
  const rest = getSupabaseRest();
  if (!rest || !authId) return -1;
  const aid = authId.toLowerCase();
  try {
    // Räkna FÖRST (kvittot behöver antalet — vad togs bort).
    const raknaRes = await fetch(
      `${rest.origin}/rest/v1/system_events?type=eq.${RA_BEDOMNING_EVENT}` +
        `&details->>authid=eq.${fv(aid)}&select=id`,
      { headers: rest.headers, signal: AbortSignal.timeout(8000) }
    );
    if (!raknaRes.ok) return -1;
    const befintliga = (await raknaRes.json()) as unknown[];
    const antal = befintliga.length;
    if (antal === 0) return 0; // idempotent: inget att radera, inget kvitto

    const delRes = await fetch(
      `${rest.origin}/rest/v1/system_events?type=eq.${RA_BEDOMNING_EVENT}` +
        `&details->>authid=eq.${fv(aid)}`,
      { method: "DELETE", headers: rest.headers, signal: AbortSignal.timeout(8000) }
    );
    if (!delRes.ok) return -1;

    // Kvitto per elev: vad, när, var + bakomliggande lagrum.
    await fetch(`${rest.origin}/rest/v1/system_events`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        type: eventTyp,
        severity: "info",
        message: `[ra] ${antal} bedömningar raderade (${bakomliggande})`,
        details: {
          authId: aid,
          raderade: antal,
          tabell: "system_events",
          bakomliggande,
          ts: new Date().toISOString(),
        },
        source: "rapportakademin",
      }),
      signal: AbortSignal.timeout(8000),
    });
    return antal;
  } catch {
    return -1;
  }
}

/**
 * GALLRINGSJOBBET — kronodrivet: hitta alla elever vars SENASTE status är
 * "utgick" och radera deras bedömningar med kvitto. Elever utan status-
 * händelse rörs INTE (okänd status = aldrig registrerad = inget att gallra).
 * Idempotent: omgångar efter den första hittar 0 rader per redan gallrad.
 */
export async function gallraUpphordaElever(): Promise<{
  gallrade: number;
  raderadeRader: number;
  fel: string[];
}> {
  const rest = getSupabaseRest();
  if (!rest) return { gallrade: 0, raderadeRader: 0, fel: ["Supabase REST ej konfigurerad"] };

  const fel: string[] = [];
  let gallrade = 0;
  let raderadeRader = 0;

  try {
    // Distinkta authId:n med status "utgick" (senaste händelsen per elev
    // avgör — PostgREST-distinktion på details->>authid).
    const res = await fetch(
      `${rest.origin}/rest/v1/system_events?type=eq.${RA_PRENUMERATION_EVENT}` +
        `&details->>status=eq.utgick&select=details->>authid&order=created_at.desc,id.desc`,
      { headers: rest.headers, signal: AbortSignal.timeout(15000) }
    );
    if (!res.ok) {
      return { gallrade: 0, raderadeRader: 0, fel: [`läsning misslyckades: HTTP ${res.status}`] };
    }
    const rader = (await res.json()) as { authid: string | null }[];
    const kandidater: string[] = [];
    const sett = new Set<string>();
    for (const r of rader) {
      const aid = typeof r.authid === "string" ? r.authid : "";
      if (aid !== "" && !sett.has(aid)) {
        sett.add(aid);
        kandidater.push(aid);
      }
    }

    for (const aid of kandidater) {
      // Dubbelkolla SENASTE status (listan ovan kan innehålla gamla "utgick"
      // som sedan återaktiverats — senaste händelsen är sanningen).
      const senaste = await lasPrenumerationsStatus(aid);
      if (senaste !== "utgick") continue;
      const n = await raderaEleversBedomningar(
        aid,
        "art 5.1 e — prenumeration upphört (LAGBESLUT 2026-09-21)",
        RA_GALLRING_EVENT
      );
      if (n > 0) {
        gallrade += 1;
        raderadeRader += n;
      } else if (n === -1) {
        fel.push(`gallring misslyckades för ${aid.slice(0, 8)}…`);
      }
      // n === 0: redan gallrad (idempotent) — inget kvitto, inget fel.
    }
  } catch (e) {
    fel.push(e instanceof Error ? e.message : "okänt fel i gallringsjobbet");
  }

  return { gallrade, raderadeRader, fel };
}
