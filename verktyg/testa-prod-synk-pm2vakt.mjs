#!/usr/bin/env node
/**
 * TESTSVIT — PM2-VAKTEN i prod-synk.mjs (o55, spår 8)
 * ====================================================================
 * Testar skapaPm2Vakt() — o48/r58-köpostens rotkur: patch-byggets
 * .next-tömning racar pm2:s live-ISR-skrivningar (ENOTEMPTY rmdir,
 * bevisat 2026-09-17 11:29 + 11:39) — stoppad pm2 = inga skrivare.
 * Vakten är garantin att prod ALDRIG lämnas utan process.
 *
 * Kontrakt som SVARAR mot korSynk-integrationen:
 *   · aterstarta() utan föregående stopp = "behovdes-ej" (finally-
 *     ropet är en no-op i varje deploy utan patch — 99 % av runsen)
 *   · stoppa() → exakt ["stop","ak1a"]; aterstarta() → "startad" +
 *     ["restart","ak1a"] + flaggan nollställd (idempotens: andra
 *     aterstarta() = "behovdes-ej")
 *   · misslyckat stopp = fail-open (stoppad förblir false, byggfönstret
 *     körs som idag, felgrenen ombygge-på-god-lock fångar) — ALDRIG ny
 *     död vinkel
 *   · misslyckad återstart = "misslyckades" + larmlogg med manuell
 *     instruktion (ALDRIG tyst — r58-doktrinen); main():s finally
 *     skriver då audit
 *   · starta() (ok-vägens vanliga restart) ropar restart OCH
 *     nollställer stoppflaggan — garantin blir no-op efter lyckad
 *     deploy; misslyckas starta() lever flaggan kvar = finally:n gör
 *     nödstarten
 *   · strukturella kontrakt (ordagranna, 0526db9e-mönstret): stoppa()
 *     ropas ENDAST i patch-install-OK-grenen, aterstarta() ropas i
 *     main():s finally — källfilen läses och mönstren verifieras
 *
 * pm2Kora/logg injiceras — sviten spelar in anrop och rör ALDRIG skarp
 * pm2 (stoppa prod ur en testsvit vore den värsta möjliga buggen).
 * Körning: node verktyg/testa-prod-synk-pm2vakt.mjs  (exit 0 = GRÖN)
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { skapaPm2Vakt } from "./prod-synk.mjs";

let pass = 0;
let fail = 0;
const felsakad = [];

function kolla(namn, villkor) {
  if (villkor) {
    pass++;
    console.log(`  PASS ${namn}`);
  } else {
    fail++;
    felsakad.push(namn);
    console.log(`  FAIL ${namn}`);
  }
}

/** Inspelningsmock: pm2-anrop + loggrader samlas; kastaVid = exakt det
 * anropnummer (1-baserat) som kastar — senare anrop lyckas igen. */
function spelare(kastaVid) {
  const anrop = [];
  const loggar = [];
  return {
    anrop,
    loggar,
    pm2Kora(args) {
      anrop.push(args.join(" "));
      if (kastaVid && anrop.length === kastaVid) throw new Error("pm2 svarade ej");
    },
    logg(rad) { loggar.push(rad); },
  };
}

console.log("== aterstarta utan stopp (99 % av deploys — ingen patch) ==");
{
  const s = spelare();
  const v = skapaPm2Vakt(s.pm2Kora, s.logg);
  kolla("aterstarta() = \"behovdes-ej\" när pm2 aldrig stoppats", v.aterstarta() === "behovdes-ej");
  kolla("inget pm2-anrop gjordes", s.anrop.length === 0);
  kolla("arStoppad() = false", v.arStoppad() === false);
}

console.log("== stoppa + aterstarta (patch-fönstrets normala cykel) ==");
{
  const s = spelare();
  const v = skapaPm2Vakt(s.pm2Kora, s.logg);
  kolla("stoppa() = true", v.stoppa() === true);
  kolla("exakt ['stop','ak1a'] ropades", s.anrop[0] === "stop ak1a");
  kolla("arStoppad() = true efter stopp", v.arStoppad() === true);
  kolla("stopp-loggen bär o48/r58-markeringen", s.loggar.some((r) => r.includes("o48/r58-kur")));
  kolla("aterstarta() = \"startad\"", v.aterstarta() === "startad");
  kolla("restart ropades efter stoppet", s.anrop[1] === "restart ak1a");
  kolla("arStoppad() = false efter återstart", v.arStoppad() === false);
  kolla("återstart-loggen bär garantimarkeringen", s.loggar.some((r) => r.includes("o48-garantin")));
  kolla("andra aterstarta() = \"behovdes-ej\" (idempotens)", v.aterstarta() === "behovdes-ej");
  kolla("totalt 2 pm2-anrop (stop + restart, inget mer)", s.anrop.length === 2);
}

console.log("== misslyckat stopp = fail-open (byggfönstret som idag) ==");
{
  const s = spelare(1); // första anropet kastar
  const v = skapaPm2Vakt(s.pm2Kora, s.logg);
  kolla("stoppa() = false vid pm2-fel", v.stoppa() === false);
  kolla("arStoppad() förblir false", v.arStoppad() === false);
  kolla("misslyckandet loggades (ej tyst)", s.loggar.some((r) => r.includes("pm2-stopp misslyckades")));
  kolla("aterstarta() = \"behovdes-ej\" (ingen falsk nödstart)", v.aterstarta() === "behovdes-ej");
}

console.log("== misslyckad återstart = larmat, aldrig tyst ==");
{
  const s = spelare(2); // andra anropet (restarten) kastar
  const v = skapaPm2Vakt(s.pm2Kora, s.logg);
  v.stoppa();
  kolla("aterstarta() = \"misslyckades\"", v.aterstarta() === "misslyckades");
  kolla("larmloggen bär manuell instruktion", s.loggar.some((r) => r.includes("MANUELL START")));
  kolla("arStoppad() = false (räknas som försökt)", v.arStoppad() === false);
}

console.log("== starta() (ok-vägens restart) ==");
{
  const s = spelare();
  const v = skapaPm2Vakt(s.pm2Kora, s.logg);
  v.stoppa();
  kolla("starta() = true", v.starta() === true);
  kolla("restart ropades", s.anrop[1] === "restart ak1a");
  kolla("starta() nollställer stoppflaggan (finally blir no-op)", v.arStoppad() === false);
  kolla("aterstarta() efter starta() = \"behovdes-ej\"", v.aterstarta() === "behovdes-ej");
}
{
  const s = spelare(2); // restarten kastar
  const v = skapaPm2Vakt(s.pm2Kora, s.logg);
  v.stoppa();
  kolla("starta() = false vid pm2-fel (förr: tyst)", v.starta() === false);
  kolla("stoppflaggan LEVER kvar — finally:n gör nödstarten", v.arStoppad() === true);
  kolla("aterstarta() = \"startad\" på andra försöket (nödstarten)", v.aterstarta() === "startad");
}

console.log("== instansisolering (inget läckande tillstånd) ==");
{
  const a = skapaPm2Vakt(spelare().pm2Kora, () => {});
  const b = skapaPm2Vakt(spelare().pm2Kora, () => {});
  a.stoppa();
  kolla("instans B opåverkad av instans A:s stopp", b.arStoppad() === false);
  kolla("instans B:s aterstarta = \"behovdes-ej\"", b.aterstarta() === "behovdes-ej");
}

console.log("== strukturella kontrakt i prod-synk.mjs (ordagranna) ==");
{
  const kalla = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "prod-synk.mjs"), "utf8");
  const rader = kalla.split("\n");
  const stoppaRader = rader.map((r, i) => [r, i]).filter(([r]) => r.includes("pm2Vakt.stoppa()"));
  // V182 (r272): exakt 2 definierade stopp-lägen — (1) patch-install-OK-grenen
  // (o48) och (2) npm ci-läget (lock-ändrad/trasigt node_modules utan patch).
  // Båda är FARLIGA fönster där npm ci raderar node_modules under gående app;
  // kontraktet förblir: inga andra stopp, och ALLA stopp FÖRE korBygg.
  kolla("pm2Vakt.stoppa() ropas exakt 2 gånger i källan (o48-patch + v182-npmCi)", stoppaRader.length === 2);
  if (stoppaRader.length === 2) {
    const kontexter = stoppaRader.map(([, i]) => rader.slice(Math.max(0, i - 14), i + 1).join("\n"));
    kolla(
      "stopp #1 ligger i patch-install-OK-grenen (efter 'PATCH-KÖ installerad')",
      kontexter[0].includes("PATCH-KÖ installerad"),
    );
    kolla(
      "stopp #2 ligger i v182 npmCi-grenen (if (npmCiBehov))",
      kontexter[1].includes("if (npmCiBehov)"),
    );
    kolla(
      "båda stoppen ligger FÖRE korBygg-anropet i källordning",
      // V184 (r274): huvudbygget ropas via korByggMedSond (RAM-profilern
      // svänger runt samma korBygg) — kontraktet oförändrat: stopp FÖRE bygg.
      kalla.lastIndexOf("pm2Vakt.stoppa()") < kalla.indexOf("const korResultat = await korByggMedSond()"),
    );
  }
  kolla("main():s finally ropar aterstarta() — garantin", kalla.includes("pm2Vakt.aterstarta()"));
  const finallyPos = kalla.indexOf("pm2Vakt.aterstarta()");
  const korSynkPos = kalla.indexOf("await korSynk();");
  kolla("aterstarta() står i main():s finally (efter korSynk-anropet)", finallyPos > korSynkPos && finallyPos !== -1);
  kolla("misslyckad återstart → audit (aldrig tyst)", kalla.includes('"pm2_ej_startad"'));
}

console.log(`\nRESULTAT: ${pass} PASS / ${fail} FAIL`);
if (fail > 0) {
  console.log("FELSAKADE: " + felsakad.join(", "));
  process.exitCode = 1;
}
