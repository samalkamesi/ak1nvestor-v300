#!/usr/bin/env node
/**
 * Test av kvalitetsvaktens kontroll 13 — Mimosa-paritet full-scan (spår 8, o94).
 *
 * Statiskt kontrakt (källtexten) + fullständig vaktkörning (tolkar den färska
 * rapporten): sektion 13 måste finnas, köra HELA trädet (`--doman .`,
 * o29-kontraktet — standarddomänen ensam förväxlar baslinjen, se o92:s
 * 725≠906), ha ENDAST det dokumenterade fixture-undantaget, tolka
 * exitkoderna 0/1/2 skilt, aldrig ge tyst PASS (OMÄTT-grenar), och landa
 * PASS med 0 fel på det kurade trädet.
 *
 * Användning: node verktyg/testa-kvalitetsvakt-mimosa.mjs
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
  "sektionMimosa definierad och kopplad i main",
  /function sektionMimosa\(\)/.test(kalla) && /sektionMimosa\(\),/.test(kalla),
  "funktion + sektioner-listan",
);
kontroll(
  "HELA trädet skannas (--doman . — o29-kontraktet)",
  kalla.includes('"--doman", "."'),
  "standarddomänen ensam räcker inte (o92:s domänförväxling 725≠906)",
);
kontroll(
  "fixture-undantaget är ENDAST den egna mimosa-sviten",
  kalla.includes('"--hoppa-over", "testa-mimosa-paritet\\\\.mjs$"'),
  "levande kod undantas aldrig (o15/o23-filosofin)",
);
kontroll(
  "rådata skrivs till gitignorerad väg (data/vakten)",
  kalla.includes('path.join(REPO, "data", "vakten", "mimosa-fullscan-SENASTE.json")'),
  "cron-körningar skall inte smutsa git-trädet",
);
kontroll(
  "exitkodsgrenarna 0/1/2 är åtskilda",
  kalla.includes("sub.status === 0") && kalla.includes("sub.status === 2") && kalla.includes("FYND "),
  "0=grönt · 1=fynd ⇒ FELposter · 2=instrumentfel ⇒ MANUELL",
);
kontroll(
  "OMÄTT-grenar finns (saknad fil + timeout — aldrig tyst PASS)",
  kalla.includes("mimosa-paritet.mjs saknas") && kalla.includes("överskred budgeten 240 s"),
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
  "rapporten har sektion 13 Mimosa-paritet",
  /^## 13\. .*Mimosa-paritet.*$/m.test(rap),
);
kontroll(
  "sektion 13 landade PASS i färska rapporten",
  /^## 13\. .* — \*\*PASS\*\*$/m.test(rap),
  "kurat träd ⇒ full-scan 0 fynd",
);
kontroll(
  "sammanfattningen räknar 13 sektioner",
  (rap.match(/^\| \d+\. /gm) ?? []).length === 13,
);
kontroll(
  "mimosa-sektionen bidrar 0 fel i sammanfattningstabellen",
  /^\| 13\. [^|]*\| \*\*PASS\*\* \| 0 \|/m.test(rap),
);
kontroll(
  "RESULTAT_JSON-maskinraden parsar och är GRÖN eller GUL utan mimosa-fel",
  (() => {
    const m = String(sub.stdout || "").match(/RESULTAT_JSON=(\{.*\})/);
    if (!m) return false;
    try {
      const j = JSON.parse(m[1]);
      return (j.status === "GRÖN" || j.status === "GUL") && /^\| 13\. [^|]*\| \*\*PASS\*\* \| 0 \|/m.test(rap);
    } catch {
      return false;
    }
  })(),
  "GUL tolereras endast för icke-mimosa-driftfynd (t.ex. SSR-livssondens prod-fönster)",
);

const misslyckade = resultat.filter((r) => !r.pass).length;
console.log(`\nRESULTAT: ${resultat.length - misslyckade} PASS / ${misslyckade} FAIL`);
process.exit(misslyckade > 0 ? 1 : 0);
