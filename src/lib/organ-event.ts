/**
 * OrganEvent v1 — nervsystemets ENHETLIGA händelsekonvention (MEGA_PLAN_V3 Fas A,
 * underlag: data/rapporter/forskning-organ-arkitektur.md §3.1).
 *
 * Ett schema, en skrivfunktion, alla organ. Raden postas till system_events via
 * getSupabaseRest (endast https *.supabase.co — samma SSRF-validering som övriga
 * skrivstackar) och är BOUNDED av retention-organet (500 rader/30d).
 *
 * Kontrakt (system_events-rad):
 *   type     = "organ"                        — EN typ för allt organ-beteende
 *   severity = "info"                         (v1: alltid info; severity-tolkn-
 *                                              ingen sker hos läsaren via verb/matt)
 *   message  = "[<source>] <verb> → <matt>"   — människoläsbar, avklippt
 *   details  = { schema, source, verb, matt, korrelation_id }
 *
 * Event-carried state transfer (Fowler): HEL payload i `matt` — konsumenter
 * (/api/kropp, kroppsvyn) ska aldrig behöva ringa tillbaka till organet.
 *
 * FAIL-SAFE: utan Supabase-konfig returneras false och anroparen fortsätter —
 * organet kör ändå (samma regel som organ-motorn, src/lib/autonom/organ.ts).
 */

import { getSupabaseRest } from "@/lib/supabase-rest";

/** Verb enligt forskningsrapporten — aldri fritext. */
export type OrganVerb = "rapport" | "beslut" | "delegation" | "halsopuls" | "atgard";

export type OrganEventInput = {
  /** "organ/<id>" | "motor/<id>" | "styrelsen" — organiseras snart mot ORGAN_REGISTRY. */
  source: string;
  verb: OrganVerb;
  /** HEL payload (event-carried state transfer), t.ex. { analyser: 5, mal: 10 }. */
  matt: Record<string, unknown>;
  /** Binder samman en rondas hela kedja (frågor→rapporter→beslut→delegation). */
  korrelationId?: string;
};

/**
 * Publicerar en OrganEvent v1-rad till system_events.
 * Returnerar false vid saknad konfig, timeout (8s) eller misslyckad skrivning —
 * anroparen ska ALDRIG krascha på ett tyst nervsystem.
 */
export async function publiceraOrganEvent(input: OrganEventInput): Promise<boolean> {
  const rest = getSupabaseRest();
  if (!rest) return false; // graceful utan konfiguration

  try {
    const res = await fetch(`${rest.origin}/rest/v1/system_events`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        type: "organ",
        severity: "info",
        message: `[${input.source}] ${input.verb} → ${JSON.stringify(input.matt).slice(0, 280)}`,
        details: {
          schema: "ak1a-organ-event/1",
          source: input.source,
          verb: input.verb,
          matt: input.matt,
          korrelation_id: input.korrelationId ?? null,
        },
        source: input.source,
      }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * uiEvent — klientens halva av nervsystemet (window-dispatch helper).
 *
 * KONVENTION (dokumenterad i forskning-organ-arkitektur.md §3.4 och här):
 * - Namn: "ak1a:<domän>-<händelse>", gärna med bindestreck — aldrig fritext.
 *   Befintliga: "ak1a:oppna-sok", "ak1a:oppna-mentor" (chat-widget, våg 78
 *   B7 — detail { fraga? } förhandsfyller frågefältet), "ak1a:shortseller-attacka",
 *   "ak1a:shortseller-uppdaterad". Nya organ-event sänder "ak1a:organ-event"
 *   med detail { organ, verb, status, matt }.
 * - Mönstret: EN poll (t.ex. KroppsvyKort → /api/kropp var 60:e sekund) jämför
 *   senaste pulsen och broadcastar vid förändring → många komponenter
 *   prenumerar via window.addEventListener utan egen polling.
 * - Viktighet i events `ui.viktighet` styr presentation: 1=tyst uppdatering,
 *   2=badge, 3=toast.
 * - Server-side-säker: anrop på servern (SSR) är no-op.
 */
export function uiEvent(namn: string, detail?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(namn, { detail: detail ?? {} }));
}
