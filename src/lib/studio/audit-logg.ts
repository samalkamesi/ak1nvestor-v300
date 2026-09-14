/**
 * AUDIT-LOGGEN (mega g3 — styrelsens beslut punkt 3) — append-only
 * spårbarhet för organismeras AUTONOMA skrivningar.
 * ====================================================================
 * En enda JSONL-fil — data/vakten/audit-logg.jsonl — där varje rad är EN
 * autonom händelse: { ts, aktor, atgard, artefakt, detalj }. Skrivs av:
 *   · agentfabriken   (aktor "fabriken:<manifest>:<uppgift>") — se
 *                      verktyg/agentfabrik.mjs (egen spegel av skrivaren)
 *   · prod-synken     (aktor "prod-synk")  — se verktyg/prod-synk.mjs
 *   · styrelsemotorn  (aktor "styrelsen")  — verkstallBeslut nedströms
 *   · transporten     (aktor "transport")  — komprimering tier 3
 *
 * EGENSKAPER (styrelsens krav):
 *   · APPEND-ONLY — skrivAudit muterar ALDRIG befintliga rader; rotation
 *     behåller de sista TAK_RADER raderna ordnat (äldst först faller bort).
 *   · ALDRIG hemligheter — rensaHemligheter() slår ut nyckel-/tokenliknande
 *     mönster FÖR raden skrivs; alla fält trunkeras hårdt.
 *   · ALDRIG kasta — en trasig audit-skrivning får ALDRIG krascha anroparen
 *     (protokollet i sig är spårbarhet, inte en kritisk väg).
 *
 * Läs-yta: /api/studio/audit (requireAdmin) via lasAuditRader(n).
 * Sökvägen följer huvudtrådens mönster (process.cwd() = repot i prod-pm2).
 */

import { appendFileSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

/** Sökväg — EN fil för hela organismen (app + skript skriver samma). */
const AUDIT_SOKVAG = path.join(process.cwd(), "data", "vakten", "audit-logg.jsonl");

/** Rotationstak (styrelsens beslut): max 5 000 rader, sedan faller äldst. */
const TAK_RADER = 5000;

/** En audit-rad — schemat är FROSET (app + .mjs-speglar skriver identiskt). */
export interface AuditRad {
  ts: string;
  aktor: string;
  atgard: string;
  artefakt: string;
  detalj: string;
}

/**
 * Hemlighet-mönster som ALDRIG får nå filen: API-nycklar (sk-…, AKIA-…),
 * JWT:er (eyJ…) samt nyckel=värde-par med känsliga namn. Överklassning är
 * billig — en trunkerad filväg som råkar matcha är ett värt pris.
 */
const HEMLIGHET_MONSTER =
  /(sk-[A-Za-z0-9_-]{8,}|AKIA[0-9A-Z]{12,}|eyJ[A-Za-z0-9_-]{20,}|(?:password|passwd|lösenord|token|hemlik|hemlig|secret|api[_-]?nyckel|apikey|authorization)\s*[:=]\s*\S+)/gi;

/** Sanera ett fält: platta till, slå ut hemligheter, trunkera. */
function rensa(text: string, tak: number): string {
  return text
    .replace(/\s+/g, " ")
    .replace(HEMLIGHET_MONSTER, "[REDACTERAT]")
    .trim()
    .slice(0, tak);
}

/**
 * Rotation — append-only i Anden: när filen växt över taket behålls de sista
 * TAK_RADER raderna (äldsta faller bort i block, aldrig omordning). Temp +
 * rename gör själva bytet atomärt; en förlorad samtidig rad i byteseken är
 * det dokumenterade priset (rotationen sker sällan — ungefär vart x:e tusen).
 */
function roteraOmBehov(): void {
  try {
    const rader = readFileSync(AUDIT_SOKVAG, "utf8").split("\n").filter((r) => r.trim() !== "");
    if (rader.length <= TAK_RADER) return;
    const temp = `${AUDIT_SOKVAG}.rotering-${Date.now()}`;
    writeFileSync(temp, `${rader.slice(-TAK_RADER).join("\n")}\n`, "utf8");
    renameSync(temp, AUDIT_SOKVAG);
  } catch {
    /* nästa skrivAudit försöker igen — loggen är ändå append-bar */
  }
}

/**
 * skrivAudit — organismeras gemensamma kvitto: VEM gjorde VAD mot VILKEN
 * artefakt (+ valfri detalj). Returnerar aldrig fel; kastar ALDRIG.
 * Exempel: skrivAudit("fabriken:v161-audit:u1", "uppgift_start",
 *                      "src/lib/studio/audit-logg.ts", "manifest mega g3").
 */
export function skrivAudit(aktor: string, atgard: string, artefakt: string, detalj?: string): void {
  try {
    mkdirSync(path.dirname(AUDIT_SOKVAG), { recursive: true });
    const rad: AuditRad = {
      ts: new Date().toISOString(),
      aktor: rensa(aktor, 120),
      atgard: rensa(atgard, 60),
      artefakt: rensa(artefakt, 300),
      detalj: rensa(detalj ?? "", 500),
    };
    appendFileSync(AUDIT_SOKVAG, `${JSON.stringify(rad)}\n`, "utf8");
    roteraOmBehov();
  } catch {
    /* audit får ALDRIG krascha anroparen — spårbarhet är inte kritisk väg */
  }
}

/**
 * lasAuditRader — de sista n raderna, äldst→nyast (API-ruttens läs-yta).
 * Ogiltiga/ofullständiga rader hoppas tyst (append-only + rotation kan lämna
 * en halv svansrad vid ett avbrott mitt i en skrivning).
 */
export function lasAuditRader(max: number): AuditRad[] {
  try {
    const rader = readFileSync(AUDIT_SOKVAG, "utf8").split("\n").filter((r) => r.trim() !== "");
    const tolkade: AuditRad[] = [];
    for (const rad of rader.slice(-max)) {
      try {
        const j = JSON.parse(rad) as Partial<AuditRad>;
        if (typeof j.ts === "string" && typeof j.aktor === "string" && typeof j.atgard === "string") {
          tolkade.push({
            ts: j.ts,
            aktor: j.aktor,
            atgard: j.atgard,
            artefakt: typeof j.artefakt === "string" ? j.artefakt : "",
            detalj: typeof j.detalj === "string" ? j.detalj : "",
          });
        }
      } catch {
        /* halv rad — hoppa tyst */
      }
    }
    return tolkade;
  } catch {
    return []; // filen saknas än = inga autonoma skrivningar loggade
  }
}
