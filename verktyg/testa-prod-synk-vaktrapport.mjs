#!/usr/bin/env node
/**
 * testa-prod-synk-vaktrapport.mjs — svit för VÅG 212 VAKTRAPPORTS-GRINDEN
 * (prod-synk.mjs lasVaktrapportStatus + bedomVaktrapportStopp).
 *
 * KONTRAKT (E35 gap 3:s sista halva — "RÖD kvalitetsrapport ⇒ deploy-stopp"):
 *   · RÖD (färsk)         ⇒ STOPP före byggstart (niva "stopp")
 *   · GUL                 ⇒ deploy fortsätter (varning — GUL stoppar aldrig)
 *   · GRÖN                ⇒ deploy fortsätter (info)
 *   · saknas/otolkbar     ⇒ deploy fortsätter (varning, fail-open — OMÄTT
 *                           loggas ärligt, aldrig tyst PASS)
 *   · RÖD äldre än 48 h   ⇒ deploy fortsätter (varning — vaktpumpornas död
 *                           ägs av pulsvakten; en död vakt får ALDRIG frysa
 *                           prod-koden i evighet; ålder vägs FÖRE status)
 *   · sista ANTAL FEL-raden vinner (append-tolerans, motorsektionens regel)
 *
 * Användning:  node verktyg/testa-prod-synk-vaktrapport.mjs
 * Exit 0 = alla PASS, exit 1 = minst ett FAIL.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lasVaktrapportStatus, bedomVaktrapportStopp } from "./prod-synk.mjs";

let pass = 0;
let fail = 0;
const FEL = [];

function kontroll(namn, villkor, detalj = "") {
  if (villkor) {
    pass++;
    console.log(`PASS ${namn}`);
  } else {
    fail++;
    console.log(`FAIL ${namn}${detalj ? " — " + detalj : ""}`);
    FEL.push(namn);
  }
}

// ── SANDBOX: fixture-rapporter ────────────────────────────────────────────
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "vaktrapport-"));
const nu = Date.now();

const skrivRapport = (namn, rader, mtimeAtergaTimmar = 0) => {
  const p = path.join(tmp, namn);
  fs.writeFileSync(p, `# KVALITETSVAKTEN — fixture\n\n${rader.join("\n")}\n`);
  if (mtimeAtergaTimmar > 0) fs.utimesSync(p, new Date(nu - mtimeAtergaTimmar * 3_600_000), new Date(nu - mtimeAtergaTimmar * 3_600_000));
  return p;
};
const GRON_RAD = "## ANTAL FEL: 0 | MANUELLA: 0 | STATUS: GRÖN";
const ROD_RAD = "## ANTAL FEL: 12 | MANUELLA: 4 | STATUS: RÖD";
const GUL_RAD = "## ANTAL FEL: 3 | MANUELLA: 10 | STATUS: GUL";

// ── 1) lasVaktrapportStatus — parsning ────────────────────────────────────
kontroll("1. saknad fil ⇒ {saknas}", lasVaktrapportStatus(path.join(tmp, "finns-ej.md"), nu)?.saknas === true);

const gron = lasVaktrapportStatus(skrivRapport("gron.md", [GRON_RAD]), nu);
kontroll("2. GRÖN parsas (status+tal)", gron?.status === "GRÖN" && gron?.felAntal === 0 && gron?.manuella === 0, JSON.stringify(gron));

const rod = lasVaktrapportStatus(skrivRapport("rod.md", [ROD_RAD]), nu);
kontroll("3. RÖD parsas (12 fel, 4 manuella)", rod?.status === "RÖD" && rod?.felAntal === 12 && rod?.manuella === 4, JSON.stringify(rod));

const append = lasVaktrapportStatus(skrivRapport("append.md", [ROD_RAD, GRON_RAD]), nu);
kontroll("4. sista ANTAL FEL-raden vinner (append-tolerans)", append?.status === "GRÖN", JSON.stringify(append));

kontroll("5. ingen statusrad ⇒ fel", typeof lasVaktrapportStatus(skrivRapport("tom.md", ["## Sammanfattning", "(inget)"]), nu)?.fel === "string");

const gammal = lasVaktrapportStatus(skrivRapport("gammal.md", [GRON_RAD], 50), nu);
kontroll("6. ålder ur mtime (50 h ⇒ 50)", gammal?.alderTimmar === 50, JSON.stringify(gammal));

const farsk = lasVaktrapportStatus(skrivRapport("farsk.md", [GRON_RAD]), nu);
kontroll("7. färsk rapport ⇒ 0 h", farsk?.alderTimmar === 0, JSON.stringify(farsk));

// ── 2) bedomVaktrapportStopp — grinddomarna ───────────────────────────────
const dom = (r) => bedomVaktrapportStopp(r);

const dRod = dom(rod);
kontroll("8. RÖD färsk ⇒ STOPP (niva stopp)", dRod.stopp === true && dRod.niva === "stopp", JSON.stringify(dRod));
kontroll("9. RÖD-domens meddelande bär talen", dRod.meddelande.includes("12 fel") && dRod.meddelande.includes("deploy STOPPAD"), dRod.meddelande);

const dGul = dom(lasVaktrapportStatus(skrivRapport("gul.md", [GUL_RAD]), nu));
kontroll("10. GUL ⇒ fortsätt (varning)", dGul.stopp === false && dGul.niva === "varning", JSON.stringify(dGul));

const dGron = dom(gron);
kontroll("11. GRÖN ⇒ fortsätt (info)", dGron.stopp === false && dGron.niva === "info", JSON.stringify(dGron));

const dSaknas = dom({ saknas: true });
kontroll("12. saknas ⇒ fortsätt (varning, fail-open)", dSaknas.stopp === false && dSaknas.niva === "varning" && dSaknas.meddelande.includes("SAKNAS"), JSON.stringify(dSaknas));

const dOtolkbar = dom({ fel: "ingen tolkbar ANTAL FEL/STATUS-rad" });
kontroll("13. otolkbar ⇒ fortsätt (varning)", dOtolkbar.stopp === false && dOtolkbar.niva === "varning", JSON.stringify(dOtolkbar));

const dGammalRod = dom(lasVaktrapportStatus(skrivRapport("gammal-rod.md", [ROD_RAD], 50), nu));
kontroll("14. RÖD äldre än 48 h ⇒ fortsätt (varning — ålder vägs före status)", dGammalRod.stopp === false && dGammalRod.niva === "varning", JSON.stringify(dGammalRod));

const dNull = dom(null);
kontroll("15. obestämbär input ⇒ fortsätt (varning)", dNull.stopp === false && dNull.niva === "varning", JSON.stringify(dNull));

const dGammalGron = dom(gammal);
kontroll("16. GRÖN 50 h ⇒ fortfarande varning (läget OMÄTT loggas)", dGammalGron.stopp === false && dGammalGron.niva === "varning", JSON.stringify(dGammalGron));

// ── städning + summering ──────────────────────────────────────────────────
fs.rmSync(tmp, { recursive: true, force: true });

console.log("");
if (fail > 0) {
  console.log(`RESULTAT: ${pass} PASS / ${fail} FAIL — ${FEL.join(", ")}`);
  process.exit(1);
}
console.log(`RESULTAT: ${pass} PASS / 0 FAIL`);
