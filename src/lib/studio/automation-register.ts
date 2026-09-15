import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

/**
 * AUTOMATION-REGISTRET (våg 166 — verktygsauditen: "inga falska verktyg")
 * =====================================================================
 * Kundkrav: varje studioverktyg skall fungera 100 % på riktigt. Roten:
 * runtinens automation/*-metoder är INTE exponerade på app-server-kanalen
 * (-32601, bevisat i auditen) — tjänsten var en stubb sedan våg 91.
 * KUREN: NATIV motor — detta register (disk, deploy-säkert under
 * data/vakten/) + verktyg/automation-motor.mjs (pumpor-daemonen, varje
 * minut) som eldar prompterna via /api/studio/stream.
 *
 * Cron: EXAKT 5 fält (min tim dom mån dag) med * , - / — motorn är
 * sanningsägaren; naturligt språk avvisas ärligt (den kan inte tolkas
 * mekaniskt utan att bli "påhitt" — kundens ord).
 */

export interface AutomationRad {
  id: string;
  namn: string;
  schema: string;
  prompt: string;
  aktiv: boolean;
  skapad: number;
  /** Senaste eldade cron-sloten (epoch-minut) — idempotensväkt. */
  senasteSlot?: number;
  senasteKorning?: string;
  korningar?: number;
}

const SOKVAG = path.join(process.cwd(), "data", "vakten", "automations.json");

export function lasAutomationer(): AutomationRad[] {
  try {
    const pars = JSON.parse(readFileSync(SOKVAG, "utf8")) as { automationer?: unknown };
    return Array.isArray(pars.automationer)
      ? (pars.automationer as AutomationRad[]).filter(
          (a) => a && typeof a.id === "string" && typeof a.schema === "string",
        )
      : [];
  } catch {
    return [];
  }
}

export function sparaAutomationer(lista: AutomationRad[]): void {
  mkdirSync(path.dirname(SOKVAG), { recursive: true });
  writeFileSync(SOKVAG, JSON.stringify({ automationer: lista, uppdaterad: Date.now() }, null, 2));
}

/** Strikt 5-fälts-cron (motor+samt route delar samma sanning). */
export function arGiltigtCron(schema: string): boolean {
  const falt = schema.trim().split(/\s+/);
  if (falt.length !== 5) return false;
  return falt.every((f) => /^[\d*,\-/]+$/.test(f) && f.length > 0);
}

export function nyAutomationId(): string {
  return `auto-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
