/**
 * AUDIT-LOGGEN — skriptsida (mega g3) — se src/lib/studio/audit-logg.ts för
 * kanonisk dokumentation. Denna spegel finns för att node-skript (fabriken,
 * prod-synken) inte kan importera TypeScript: SCHEMAT ÄR IDENTISKT —
 * en JSONL-rad { ts, aktor, atgard, artefakt, detalj } till
 * data/vakten/audit-logg.jsonl, ALDRIG hemligheter, tak 5 000 rader.
 */
import { appendFileSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIT_SOKVAG = path.join(ROT, "data", "vakten", "audit-logg.jsonl");
const TAK_RADER = 5000;

const HEMLIGHET_MONSTER =
  /(sk-[A-Za-z0-9_-]{8,}|AKIA[0-9A-Z]{12,}|eyJ[A-Za-z0-9_-]{20,}|(?:password|passwd|lösenord|token|hemlik|hemlig|secret|api[_-]?nyckel|apikey|authorization)\s*[:=]\s*\S+)/gi;

function rensa(text, tak) {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .replace(HEMLIGHET_MONSTER, "[REDACTERAT]")
    .trim()
    .slice(0, tak);
}

function roteraOmBehov() {
  try {
    const rader = readFileSync(AUDIT_SOKVAG, "utf8").split("\n").filter((r) => r.trim() !== "");
    if (rader.length <= TAK_RADER) return;
    const temp = `${AUDIT_SOKVAG}.rotering-${Date.now()}`;
    writeFileSync(temp, rader.slice(-TAK_RADER).join("\n") + "\n", "utf8");
    renameSync(temp, AUDIT_SOKVAG);
  } catch {
    /* rotation får aldrig kasta */
  }
}

/** skrivAudit(aktor, atgard, artefakt, detalj?) — ALDRIG kastande. */
export function skrivAudit(aktor, atgard, artefakt, detalj = "") {
  try {
    mkdirSync(path.dirname(AUDIT_SOKVAG), { recursive: true });
    appendFileSync(
      AUDIT_SOKVAG,
      JSON.stringify({
        ts: new Date().toISOString(),
        aktor: rensa(aktor, 120),
        atgard: rensa(atgard, 60),
        artefakt: rensa(artefakt, 300),
        detalj: rensa(detalj, 500),
      }) + "\n",
      "utf8",
    );
    roteraOmBehov();
  } catch {
    /* audit får ALDRIG krascha anroparen */
  }
}
