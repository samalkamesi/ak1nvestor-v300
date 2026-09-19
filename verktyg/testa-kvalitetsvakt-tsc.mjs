#!/usr/bin/env node
/**
 * Test av kvalitetsvaktens kontroll 11 — Typbaslinjen (spår 8, o39).
 *
 * Statiskt kontrakt (källtexten) + fullständig vaktkörning (tolkar den
 * färska rapporten): sektion 11 måste finnas, köras via PROJEKTBINÄREN
 * (node_modules/typescript/bin/tsc — ALDRIG npx), ha deploy/timeout-grenar,
 * och landa PASS med 0 fel på det gröna trädet.
 *
 * Användning: node verktyg/testa-kvalitetsvakt-tsc.mjs
 * Avslutskod: 0 = alla PASS, 1 = minst ett FAIL.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAKT = path.join(REPO, "verktyg", "kvalitetsvakt.mjs");
const RAPPORT = path.join(REPO, "data", "rapporter", "kvalitetsrapport-SENASTE.md");

const resultat = [];
function kontroll(namn, pass, detalj) {
  resultat.push({ namn, pass, detalj });
  console.log(`  ${pass ? "PASS" : "FAIL"}  ${namn}${detalj ? ` — ${detalj}` : ""}`);
}

const kalla = readFileSync(VAKT, "utf8");

// ── Statiskt kontrakt ────────────────────────────────────────────────────────
kontroll(
  "sektionTsc definierad och kopplad i main",
  /function sektionTsc\(\)/.test(kalla) && /sektionTsc\(\),/.test(kalla),
  "funktion + sektioner-listan",
);
kontroll(
  "PROJEKTBINÄREN används (node_modules/typescript/bin/tsc)",
  kalla.includes('path.join(REPO, "node_modules", "typescript", "bin", "tsc")'),
);
kontroll(
  "npx körs ALDRIG i vakten (ordet får förekomma i varningskommentarer)",
  !/["'`]\s*npx\b/.test(kalla) && !/spawn\w*\([^)]*["'`]npx["'`]/.test(kalla),
  "deployfönstrets dummy-paket-fälla (o39-regeln)",
);
kontroll(
  "timeout-budget 120 s satt",
  kalla.includes("timeout: 120_000"),
  "spegel av motorvalideringens budget",
);
kontroll(
  "deploy-transientgren finns (K2/K3-precedensen)",
  kalla.includes("deployMisstanke") && kalla.includes("felRader.every((r) => r.includes(\"node_modules\"))"),
  "omätning bokförs MANUELLT, aldrig tyst PASS",
);
kontroll(
  "saknad binär = MANUELL-gren finns",
  kalla.includes("saknad binär") && kalla.includes("OMÄTT"),
);

// ── Full vaktkörning (färsk rapport) ────────────────────────────────────────
const sub = spawnSync(process.execPath, ["verktyg/kvalitetsvakt.mjs"], {
  cwd: REPO,
  encoding: "utf8",
  timeout: 300_000,
  maxBuffer: 16 * 1024 * 1024,
});
const rap = existsSync(RAPPORT) ? readFileSync(RAPPORT, "utf8") : "";

kontroll("vakten avslutade 0 (GRÖN/GUL)", sub.status === 0, `exit ${sub.status}`);
kontroll(
  "rapporten har sektion 11 Typbaslinje",
  /^## 11\. .*Typbaslinje.*$/m.test(rap),
);
kontroll(
  "sektion 11 landade PASS i färska rapporten",
  /^## 11\. .* — \*\*PASS\*\*$/m.test(rap),
  "grönt träd ⇒ tsc 0 via projektbinären",
);
kontroll(
  "sammanfattningen räknar 13 sektioner",
  (rap.match(/^\| \d+\. /gm) ?? []).length === 13,
  "12 sedan SSR-livssonden tillkom, 13 sedan mimosa-full-scan (o94)",
);
kontroll(
  "RESULTAT_JSON-maskinraden parsar och är GRÖN",
  (() => {
    const m = String(sub.stdout || "").match(/RESULTAT_JSON=(\{.*\})/);
    if (!m) return false;
    try {
      const j = JSON.parse(m[1]);
      return j.status === "GRÖN" && j.fel === 0;
    } catch {
      return false;
    }
  })(),
);

const misslyckade = resultat.filter((r) => !r.pass).length;
console.log(`\nRESULTAT: ${resultat.length - misslyckade} PASS / ${misslyckade} FAIL`);
process.exit(misslyckade > 0 ? 1 : 0);
