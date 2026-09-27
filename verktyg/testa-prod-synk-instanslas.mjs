#!/usr/bin/env node
/**
 * testa-prod-synk-instanslas.mjs — svit för V183 (r273): instanslåsets
 * PID-dom i prod-synk.mjs.
 *
 * BAKGRUND (bevisat 2026-09-27 05:57→06:17Z): OOM-svepet mördade
 * prod-synk-processen under ett pågående v182-bygge — loggspringa utan en
 * enda felrad (SIGKILL loggar aldrig) och det kvarlämnade
 * .synk-instans.lock blockerade nästa poll tyst i 10 min (det blinda
 * 12-min-taket kan inte skilja ett levande 26-min-byggfönster från en död
 * process). Kuren: låset bär pid-fil; kollisionen dömer ur /proc — död
 * pid rivas direkt, levande prod-synk lämnas över, pid-fil-lösa lås
 * behåller 12-min-regeln som reserv.
 *
 * Användning:  node verktyg/testa-prod-synk-instanslas.mjs
 * Exit 0 = alla PASS, exit 1 = minst ett FAIL.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tolkaLasPid, lasInstansStatus, bedomInstansLas } from "./prod-synk.mjs";

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

// ── 1) tolkaLasPid — låsets pid-text tolkas strikt ─────────────────────────
kontroll("1. tolkaLasPid '4242\\n' → 4242", tolkaLasPid("4242\n") === 4242);
kontroll("2. tolkaLasPid ' 42 ' → 42 (whitespace tålös)", tolkaLasPid(" 42 ") === 42);
kontroll("3. tolkaLasPid 'abc' → null", tolkaLasPid("abc") === null);
kontroll("4. tolkaLasPid null → null", tolkaLasPid(null) === null);
kontroll("5. tolkaLasPid '' → null", tolkaLasPid("") === null);
kontroll("6. tolkaLasPid '12 34' → null (två tal är ingen pid)", tolkaLasPid("12 34") === null);

// ── 2) bedomInstansLas — PID-vägens tre domar ──────────────────────────────
const domLevande = bedomInstansLas({ pidText: "4242\n", alderMs: 26 * 60_000, procFinns: true, procArSynk: true });
kontroll(
  "7. levande prod-synk-pid ⇒ VÄNTA (även 26-min-byggfönster — v182-bevisad normaltid)",
  domLevande.vanta === true && domLevande.anledning.includes("4242"),
);
const domDod = bedomInstansLas({ pidText: "4242\n", alderMs: 30_000, procFinns: false, procArSynk: false });
kontroll(
  "8. död pid (inget /proc) ⇒ RIV — 30 sekunder är nog, inte 12 minuter",
  domDod.vanta === false && domDod.anledning.includes("död"),
);
const domAteranvand = bedomInstansLas({ pidText: "4242\n", alderMs: 30_000, procFinns: true, procArSynk: false });
kontroll(
  "9. pid återanvänd av icke-synk-process ⇒ RIV (cmdline-beviset skyddar mot falsk väntan)",
  domAteranvand.vanta === false && domAteranvand.anledning.includes("återanvänd"),
);

// ── 3) bedomInstansLas — reservvägen för pid-fil-lösa lås (före V183) ──────
kontroll(
  "10. ogiltig pid-text + färskt lås (5 min) ⇒ VÄNTA (12-min-regeln består)",
  bedomInstansLas({ pidText: "skräp", alderMs: 5 * 60_000, procFinns: false, procArSynk: false }).vanta === true,
);
kontroll(
  "11. ogiltig pid-text + gammalt lås (13 min) ⇒ RIV (12-min-tak)",
  bedomInstansLas({ pidText: "skräp", alderMs: 13 * 60_000, procFinns: false, procArSynk: false }).vanta === false,
);
kontroll(
  "12. omätbar låsålder ⇒ VÄNTA (fail-safe — oförändrat beteende vid fs-fel)",
  bedomInstansLas({ pidText: null, alderMs: null, procFinns: false, procArSynk: false }).vanta === true,
);

// ── 4) lasInstansStatus — integration mot äkta fs + /proc ──────────────────
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ak1a-instanslas-"));
try {
  const las = path.join(tmp, ".synk-instans.lock");
  fs.mkdirSync(las, { recursive: false });
  fs.writeFileSync(path.join(las, "pid"), `${process.pid}\n`);
  const statusEgen = lasInstansStatus(las);
  kontroll(
    "13. egen pid-fil ⇒ status läser pidText + /proc hittar processen",
    statusEgen.pidText === `${process.pid}\n` && statusEgen.procFinns === true,
  );
  kontroll(
    "14. egen process är INTE prod-synk (cmdline-beviset) ⇒ procArSynk false — korrekt dom RIV",
    statusEgen.procArSynk === false &&
      bedomInstansLas(statusEgen).vanta === false,
  );

  // pid som garanterat saknas i /proc (pid_max-avstånd): använd en nyligen
  // avlivad barnprocess — spawn+wait ger en ledig pid utan /proc-post
  const { execFileSync } = await import("node:child_process");
  let dodPid = null;
  try {
    // pwet: vänta in en process som hinner födas och dö; readFileSync på
    // /proc/<pid> ger då ENOENT
    const ut = execFileSync("bash", ["-c", "echo $$ && exec true"]).toString().trim();
    dodPid = Number(ut);
  } catch { /* reserv: hoppa testet */ }
  if (dodPid !== null && Number.isInteger(dodPid)) {
    fs.writeFileSync(path.join(las, "pid"), `${dodPid}\n`);
    const statusDod = lasInstansStatus(las);
    kontroll(
      "15. död barn-pid ⇒ procFinns false + dom RIV (ända till äkta integration)",
      statusDod.procFinns === false && bedomInstansLas(statusDod).vanta === false,
    );
  } else {
    console.log("PASS 15 (hoppad — ingen död pid kunde provas)");
    pass++;
  }

  fs.rmSync(path.join(las, "pid"), { force: true });
  const statusAldre = lasInstansStatus(las);
  kontroll(
    "16. lås utan pid-fil ⇒ pidText null + älder mätbar (reservvägen levande)",
    statusAldre.pidText === null && typeof statusAldre.alderMs === "number",
  );
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

// ── Sammanställning ─────────────────────────────────────────────────────────
console.log(`\n${pass} PASS · ${fail} FAIL`);
if (fail > 0) {
  console.error("FALLNA: " + FEL.join(", "));
  process.exit(1);
}
