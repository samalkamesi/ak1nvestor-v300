#!/usr/bin/env node
/**
 * testa-prod-synk-buntslagsrace.mjs — svit för V187 (r276): BYGGER FRÅN-
 * provenans + BUNTSLAGSRACE-VAKTEN i prod-synk.mjs.
 *
 * BAKGRUND (r276:s rot, bevisad 2026-09-27): pushar levererar trädet DIREKT
 * till servern (updateInstead) och kan landa MITT i ett byggfönster —
 * DEPLOYAD-radens hash är SLUTTRÄDET, inte byggträdet. Speglar-kuren
 * 03ea5918 landade 15:00:40Z mitt i 14:57-fönstret: deployen loggades GRÖN
 * (bb1fe548) men edge-buntslen serverade gamla 55-listan (speglar-slugar.json
 * buntas in i proxy-modulen — f.d. middleware, v188 — vid BYGGTID) = 78 döda
 * spegelsidor trots grön deploy.
 *
 * Kuren som mäts här:
 *   · buntslagsraceDom — flyttat träd ⇒ race; omätbar hash ⇒ race (fail-closed:
 *     bevisbördan ligger på provenansen, aldrig på prod)
 *   · BYGGER FRÅN — byggträdets hash låses + loggas FÖRE första byggförsöket
 *   · race-dom FÖRE artefaktgrinden — race ⇒ INGET byte, INGEN DEPLOYAD-markör
 *   · hash-vakt i själva byte-kommandot — fönstret mellan JS-dom och mv:arna
 *
 * Användning:  node verktyg/testa-prod-synk-buntslagsrace.mjs
 * Exit 0 = alla PASS, exit 1 = minst ett FAIL.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buntslagsraceDom } from "./prod-synk.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KALLA = fs.readFileSync(path.join(REPO, "verktyg/prod-synk.mjs"), "utf8");
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

const H1 = "a80b2049aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const H2 = "03ea5918bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

// ── 1) DOM-FUNKTIONEN ─────────────────────────────────────────────────────
kontroll(
  "1. oförändrad hash ⇒ ingen race",
  buntslagsraceDom({ byggTradStart: H1, byggTradSlut: H1 }).race === false,
);
kontroll(
  "2. flyttad hash ⇒ race med båda kort-hasharna i meddelandet",
  (() => {
    const d = buntslagsraceDom({ byggTradStart: H1, byggTradSlut: H2 });
    return d.race === true && d.meddelande.includes("a80b2049") && d.meddelande.includes("03ea5918");
  })(),
);
kontroll(
  "3. omätbar slut-hash ⇒ race (fail-closed — bevisbördan på provenansen)",
  buntslagsraceDom({ byggTradStart: H1, byggTradSlut: null }).race === true,
);
kontroll(
  "4. omätbar start-hash ⇒ race",
  buntslagsraceDom({ byggTradStart: null, byggTradSlut: H1 }).race === true,
);
kontroll(
  "5. kort-hash är 8 tecken (loggen läses av människor)",
  buntslagsraceDom({ byggTradStart: H1, byggTradSlut: H2 }).meddelande.includes("a80b2049 → 03ea5918"),
);

// ── 2) STRUKTURELLA KONTRAKT I KÄLLAN ─────────────────────────────────────
const ixByggTradStart = KALLA.indexOf('const byggTradStart = git(["rev-parse", "HEAD"])');
const ixByggerFran = KALLA.indexOf("BYGGER FRÅN:");
const ixForstaBygg = KALLA.indexOf("await korByggMedSond()");
const ixRaceBlock = KALLA.indexOf("const race = buntslagsraceDom(");
const ixArtefakt = KALLA.indexOf("verifieraArtefakt({ nextKatalog: path.join(ROT, \".next-ny\") })");
const ixSwap = KALLA.indexOf('const swap = `test "$(git rev-parse HEAD)" = "${byggTradStart}"');

kontroll(
  "6. BYGGER FRÅN-låset finns och ligger FÖRE första byggförsöket",
  ixByggTradStart !== -1 && ixByggerFran > ixByggTradStart && ixByggerFran < ixForstaBygg,
  `index: lås ${ixByggTradStart}, logg ${ixByggerFran}, bygg ${ixForstaBygg}`,
);
kontroll(
  "7. race-domaren ropas FÖRE artefaktgrinden (race stoppar tidigt)",
  ixRaceBlock !== -1 && ixArtefakt !== -1 && ixRaceBlock < ixArtefakt,
);
kontroll(
  "8. byte-kommandot bär hash-vakten + mv-kedjan + pm2 restart",
  ixSwap !== -1 && KALLA.slice(ixSwap, ixSwap + 400).includes("mv .next .next-forra && mv .next-ny .next && pm2 restart ak1a"),
);
kontroll(
  "9. race-grenen returnerar UTAN deploy (DEPLOYAD-markören orörd ⇒ ombygg nästa poll)",
  (() => {
    const gren = KALLA.slice(ixRaceBlock, ixRaceBlock + 800);
    return gren.includes("if (race.race)") && gren.includes("deploy_stoppad_buntslagsrace") && gren.includes("return;");
  })(),
);
kontroll(
  "10. slut-hashen mäts fail-closed (try/catch ⇒ null ⇒ race-dom)",
  KALLA.includes('try { byggTradSlut = git(["rev-parse", "HEAD"]); } catch'),
);
kontroll(
  "11. BYGGER FRÅN-loggen skriver kort-hash (8 tecken)",
  KALLA.includes("BYGGER FRÅN: ${byggTradStart.slice(0, 8)}"),
);
kontroll(
  "12. dom-funktionen är exporterad (o43 — sviten importerar den)",
  KALLA.includes("export function buntslagsraceDom"),
);
kontroll(
  "13. ingen ny rekursionsväg: korByggMedSond ropar fortfarande korBygg (r274-läxan)",
  (() => {
    const wrapper = KALLA.slice(KALLA.indexOf("const korByggMedSond"), KALLA.indexOf("const korByggMedSond") + 700);
    return wrapper.includes("return await korBygg();") && !wrapper.includes("korByggMedSond()");
  })(),
);

console.log(`\n${pass}/${pass + fail} PASS${fail ? " — FAIL: " + FEL.join(", ") : ""}`);
process.exit(fail ? 1 : 0);
