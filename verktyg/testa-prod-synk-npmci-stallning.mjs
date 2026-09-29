#!/usr/bin/env node
/**
 * testa-prod-synk-npmci-stallning.mjs — svit för V183B (r280, npm
 * ci-fönstret): STALLNINGSVÄGEN i prod-synk.mjs.
 *
 * BAKGRUND: dagens npm ci-väg stoppar pm2 under hela installationen+bygget
 * (o48-mönstret, mörkt ~byggtid) därför att npm ci river prod-node_modules
 * under den gående appen. Stallningsvägen installerar+bygger i en arkivkopia
 * (.bygg-kopia) med EGEN node_modules och byter atomiskt DUBBELT (node_modules
 * + .next) i slutet — pm2 lever hela fönstret utom bytets sekunder.
 *
 * Mäts här:
 *   · stallningsKommando — fem steg i rätt ordning, pm2 nämns ALDRIG
 *   · stallningsByteKommando — hash-vakt + fem atomära steg i EN &&-kedja
 *   · stallningDiskMojlig — tröskel + konservativ null-hantering
 *     (JÄRN-U1 2026-09-29: tröskeln 20 000 MB — mätt kopia ≈ 2,4 GB,
 *      fönstrets topp ~6 GB; ordermått "kopian ~8-10 GB" + marginal)
 *   · reallivssimulering — dubbelbytet mot ett sandlåderepo med stubbad pm2
 *     (grönt byte + hash-vaktens stopp vid flyttat träd)
 *   · JÄRN-U1 — patchens stallnings-installation (kopia, aldrig prod-ytan)
 *     + bygg-steget i kopian + MÖRKER-VÄG-larmet (ALARM/dedupe/merge,
 *     skrivfel sväljs — skarp /desk/larm.json rörs aldrig av sviten)
 *
 * Användning:  node verktyg/testa-prod-synk-npmci-stallning.mjs
 * Exit 0 = alla PASS, exit 1 = minst ett FAIL.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  stallningsKommando,
  stallningsByteKommando,
  stallningDiskMojlig,
  byggNolldowntimeKommando,
  beslutaNpmCi,
  byggPatchInstallStallningsKommando,
  stallningsByggKommando,
  skrivMorkerVagLarm,
} from "./prod-synk.mjs";

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

// ── 1) STALLNINGSKOMMANDOT — struktur och ordning ─────────────────────────
const kmd = stallningsKommando();
kontroll(
  "1. stallningskommandot: fem steg i rätt ordning (rm kopia → mkdir → git archive → npm ci i kopia → build i kopia)",
  kmd.indexOf("rm -rf .bygg-kopia") < kmd.indexOf("mkdir -p .bygg-kopia") &&
    kmd.indexOf("mkdir -p .bygg-kopia") < kmd.indexOf("git archive HEAD") &&
    kmd.indexOf("git archive HEAD") < kmd.indexOf("npm ci") &&
    kmd.indexOf("npm ci") < kmd.indexOf("npm run build"),
);
kontroll(
  "2. npm ci installerar I KOPIAN (--prefix .bygg-kopia), aldrig i prod-ytan",
  /npm ci[^&]*--prefix \.bygg-kopia/.test(kmd) && !/npm ci --no-audit --no-fund >>/.test(kmd),
);
kontroll(
  "3. bygget körs I KOPIAN (cd .bygg-kopia) med NEXT_DIST_DIR=.next-ny",
  /cd \.bygg-kopia && NEXT_DIST_DIR=\.next-ny npm run build/.test(kmd),
);
kontroll(
  "4. stallningskommandot nämner ALDRIG pm2 (pm2 lever hela fönstret)",
  !kmd.includes("pm2"),
);
kontroll(
  "5. kopians bygglogg hamnar i synkens loggfiler (/tmp/synk-npmci.log + /tmp/synk-build.log)",
  kmd.includes("/tmp/synk-npmci.log") && kmd.includes("/tmp/synk-build.log"),
);

// ── 2) DUBBELBYTET — hash-vakt + fem atomära steg i en kedja ──────────────
const HASH = "abc123def456abc123def456abc123def456abc1";
const byte = stallningsByteKommando({ byggTradStart: HASH });
kontroll(
  "6. dubbelbytet börjar med hash-vakten (buntslagsrace-paritet)",
  byte.startsWith(`test "$(git rev-parse HEAD)" = "${HASH}" &&`),
);
kontroll(
  "7. dubbelbytet: node_modules → -forra FÖR kopians node_modules → node_modules",
  byte.indexOf("mv node_modules node_modules-forra") < byte.indexOf("mv .bygg-kopia/node_modules node_modules"),
);
kontroll(
  "8. dubbelbytet: .next → -forra FÖR kopians .next-ny → .next",
  byte.indexOf("mv .next .next-forra") < byte.indexOf("mv .bygg-kopia/.next-ny .next"),
);
kontroll(
  "9. dubbelbytet: pm2 restart är SISTA steget",
  byte.trim().endsWith("pm2 restart ak1a"),
);
kontroll(
  "10. dubbelbytet är EN &&-kedja (inga ; eller nya rader)",
  !/[;\n]/.test(byte),
);

// ── 3) DISKVAKTEN (JÄRN-U1: tröskeln 20 000 MB — kundorderns mått "kopian
//        ~8-10 GB" + marginal; mätt kopia ≈ 2,4 GB, fönstrets topp ~6 GB) ──
kontroll("11. diskvakt: 20 000 MB fria ⇒ stallning möjlig (JÄRN-U1-tröskeln)", stallningDiskMojlig({ friaMB: 20000 }) === true);
kontroll("12. diskvakt: 19 999 MB fria ⇒ MARKERAD mörker-fallback (JÄRN-U1: aldrig tyst)", stallningDiskMojlig({ friaMB: 19999 }) === false);
kontroll("13. diskvakt: omätbart (null) ⇒ konservativt fallback", stallningDiskMojlig({ friaMB: null }) === false);
kontroll("14. diskvakt: odefinierat ⇒ konservativt fallback", stallningDiskMojlig({}) === false);

// ── 4) REGRESSION — V182-kontraktet orört ─────────────────────────────────
kontroll(
  "15. regression: byggNolldowntimeKommando utan npm ci oförändrad",
  byggNolldowntimeKommando({ npmCi: false }) === "NEXT_DIST_DIR=.next-ny npm run build >> /tmp/synk-build.log 2>&1",
);
kontroll(
  "16. regression: beslutaNpmCi-laget orört (package-lock ⇒ npm ci)",
  beslutaNpmCi({ diffFiler: ["package-lock.json"], nodeModulesIntakt: true }) === true,
);

// ── 5) REALLIVSSIMULERING — dubbelbytet mot sandlåderekao med stubbad pm2 ─
const SL = fs.mkdtempSync(path.join(os.tmpdir(), "v183b-"));
const BIN = path.join(SL, "bin");
fs.mkdirSync(BIN);
const PM2_LOGG = path.join(SL, "pm2-anrop.log");
fs.writeFileSync(path.join(BIN, "pm2"), `#!/usr/bin/env bash\necho "$@" >> ${JSON.stringify(PM2_LOGG)}\n`);
fs.chmodSync(path.join(BIN, "pm2"), 0o755);
const kor = (k, cwd = SL) =>
  execFileSync("bash", ["-c", k], {
    cwd,
    env: { ...process.env, PATH: `${BIN}${path.delimiter}${process.env.PATH}` },
    stdio: "pipe",
  });

// sandlåde-repo: HEAD + prod-yta (node_modules/.next) + kopia (node_modules/.next-ny)
// (lokal git-identitet — servern saknar global; utan den dör commit-steget)
execFileSync("git", ["init", "-q", SL]);
execFileSync("git", ["-C", SL, "config", "user.email", "v183b@test"]);
execFileSync("git", ["-C", SL, "config", "user.name", "v183b-test"]);
execFileSync("git", ["-C", SL, "commit", "--allow-empty", "-m", "bas"]);
const HEAD = execFileSync("git", ["-C", SL, "rev-parse", "HEAD"]).toString().trim();
fs.mkdirSync(path.join(SL, "node_modules"));
fs.writeFileSync(path.join(SL, "node_modules", "URSPRUNG"), "prod");
fs.mkdirSync(path.join(SL, ".next"));
fs.writeFileSync(path.join(SL, ".next", "URSPRUNG"), "prod");
fs.mkdirSync(path.join(SL, ".bygg-kopia", "node_modules"), { recursive: true });
fs.writeFileSync(path.join(SL, ".bygg-kopia", "node_modules", "NY"), "kopia");
fs.mkdirSync(path.join(SL, ".bygg-kopia", ".next-ny"), { recursive: true });
fs.writeFileSync(path.join(SL, ".bygg-kopia", ".next-ny", "NY"), "kopia");

// 5a) grönt byte
try {
  kor(stallningsByteKommando({ byggTradStart: HEAD }));
  kontroll(
    "17. realliv: grönt dubbelbyte — kopians node_modules på plats i prod-ytan",
    fs.readFileSync(path.join(SL, "node_modules", "NY"), "utf8") === "kopia",
  );
  kontroll(
    "18. realliv: gamla node_modules bevarad i node_modules-forra (rullbar)",
    fs.readFileSync(path.join(SL, "node_modules-forra", "URSPRUNG"), "utf8") === "prod",
  );
  kontroll(
    "19. realliv: kopians .next-ny på plats som prod-.next",
    fs.readFileSync(path.join(SL, ".next", "NY"), "utf8") === "kopia",
  );
  kontroll(
    "20. realliv: gamla .next bevarad i .next-forra (rullbar)",
    fs.readFileSync(path.join(SL, ".next-forra", "URSPRUNG"), "utf8") === "prod",
  );
  kontroll(
    "21. realliv: pm2 restart anropad EXAKT EN gång",
    fs.readFileSync(PM2_LOGG, "utf8").trim() === "restart ak1a",
  );
} catch (e) {
  kontroll("17-21. realliv: grönt dubbelbyte", false, String(e.message).slice(0, 120));
}

// 5b) hash-vakten — flyttat träd stoppar bytet UTAN att något flyttas
fs.rmSync(path.join(SL, "node_modules"), { recursive: true, force: true });
fs.mkdirSync(path.join(SL, "node_modules"));
fs.writeFileSync(path.join(SL, "node_modules", "URSPRUNG"), "prod-igen");
fs.rmSync(path.join(SL, ".next"), { recursive: true, force: true });
fs.mkdirSync(path.join(SL, ".next"));
fs.writeFileSync(path.join(SL, ".next", "URSPRUNG"), "prod-igen");
fs.mkdirSync(path.join(SL, ".bygg-kopia", "node_modules"), { recursive: true });
fs.writeFileSync(path.join(SL, ".bygg-kopia", "node_modules", "NY2"), "kopia2");
fs.mkdirSync(path.join(SL, ".bygg-kopia", ".next-ny"), { recursive: true });
fs.writeFileSync(path.join(SL, ".bygg-kopia", ".next-ny", "NY2"), "kopia2");
execFileSync("git", ["-C", SL, "commit", "--allow-empty", "-m", "träd flyttat"]);
let stoppat = false;
try {
  kor(stallningsByteKommando({ byggTradStart: HEAD }));
} catch {
  stoppat = true;
}
kontroll(
  "22. realliv: hash-vakt stoppar bytet vid flyttat träd (icke-noll exit)",
  stoppat === true,
);
kontroll(
  "23. realliv: stoppat byte lämnar prod-ytan ORÖRD (node_modules + .next kvar)",
  fs.existsSync(path.join(SL, "node_modules", "URSPRUNG")) && fs.existsSync(path.join(SL, ".next", "URSPRUNG")),
);

// 5c) stallningskommandots arkivsteg (1-3) mot sandlåderepo — tracked yta extraheras
const arkiv = ["rm -rf .bygg-test", "mkdir -p .bygg-test", "git archive HEAD | tar -x -C .bygg-test"].join(" && ");
fs.writeFileSync(path.join(SL, "tracked-fil.txt"), "hej");
execFileSync("git", ["-C", SL, "add", "tracked-fil.txt"]);
execFileSync("git", ["-C", SL, "-c", "user.email=t@t", "-c", "user.name=t", "commit", "-m", "fil"]);
try {
  kor(arkiv);
  kontroll(
    "24. realliv: git archive-extraheringen fyller kopians tracked yta",
    fs.readFileSync(path.join(SL, ".bygg-test", "tracked-fil.txt"), "utf8") === "hej",
  );
} catch (e) {
  kontroll("24. realliv: git archive-extraheringen", false, String(e.message).slice(0, 120));
}

fs.rmSync(SL, { recursive: true, force: true });

// ── 6) JÄRN-U1 — patchens stallningsväg + MÖRKER-VÄG-larm ─────────────────
// (kundorder "noll mörker" 2026-09-29: patch-installationen flyttas ur
//  prod-ytan in i arkivkopian — pm2 lever hela fönstret — och de båda
//  mörker-FALLBACKERNA loggas MARKERAT + larmar /desk/larm.json)
const patchCmd = byggPatchInstallStallningsKommando("next@16.3.5");
kontroll(
  "25. patch-stallning: kopian rivs+skapas+arkiveras FÖR installationen (färsk kopia varje försök)",
  patchCmd.indexOf("rm -rf .bygg-kopia") < patchCmd.indexOf("mkdir -p .bygg-kopia") &&
    patchCmd.indexOf("mkdir -p .bygg-kopia") < patchCmd.indexOf("git archive HEAD") &&
    patchCmd.indexOf("git archive HEAD") < patchCmd.indexOf("npm install"),
);
kontroll(
  "26. patch-stallning: npm install MED SPEC i KOPIAN (cd .bygg-kopia) — installationen lämnar ALDRIG prod-ytan",
  /cd \.bygg-kopia && npm install next@16\.3\.5 --no-audit --no-fund/.test(patchCmd) && !patchCmd.startsWith("npm install"),
);
kontroll(
  "27. patch-stallning: tsc-grinden (o106) kedjad EFTER installationen, i kopians node_modules",
  patchCmd.endsWith(" && node node_modules/typescript/bin/tsc --noEmit >> /tmp/synk-patch.log 2>&1") &&
    patchCmd.indexOf("npm install") < patchCmd.indexOf("tsc --noEmit"),
);
kontroll(
  "28. patch-stallning: ALDRIG pm2 i kommandot (appen lever hela fönstret)",
  !patchCmd.includes("pm2"),
);
kontroll(
  "29. stallningsbygget (patch-läge): ENDAST bygg i kopian — installationen skedde i installationsbarnet, ombyggen installerar ej om",
  stallningsByggKommando() === "cd .bygg-kopia && NEXT_DIST_DIR=.next-ny npm run build >> /tmp/synk-build.log 2>&1",
);
// mörker-larmet mot tmp-filer — skarp /desk/larm.json rörs ALDRIG av sviten
{
  const larmTmp = fs.mkdtempSync(path.join(os.tmpdir(), "jarn-u1-"));
  const larmFil = path.join(larmTmp, "larm.json");
  const las = (p) => (p === larmFil && fs.existsSync(larmFil) ? fs.readFileSync(larmFil, "utf8") : null);
  const skriv = (p, data) => fs.writeFileSync(p, data);
  skrivMorkerVagLarm("test-fönster", { sokvagar: [larmFil], las, skriv, nu: "2026-09-29T00:00:00.000Z" });
  const efter1 = JSON.parse(fs.readFileSync(larmFil, "utf8"));
  kontroll(
    "30. mörker-larm: ALARM + MÖRKER-VÄG-rad med orsak + tidsstämpel (desk/larm.json-formatet)",
    efter1.lag === "ALARM" && efter1.t === "2026-09-29T00:00:00.000Z" && efter1.fel.includes("prod-synk MÖRKER-VÄG: test-fönster"),
  );
  skrivMorkerVagLarm("test-fönster", { sokvagar: [larmFil], las, skriv, nu: "2026-09-29T00:05:00.000Z" });
  const efter2 = JSON.parse(fs.readFileSync(larmFil, "utf8"));
  kontroll(
    "31. mörker-larm: identisk rad DEDUPLICERAS (ingen radtillväxt per poll)",
    efter2.fel.filter((f) => f === "prod-synk MÖRKER-VÄG: test-fönster").length === 1,
  );
  fs.writeFileSync(larmFil, JSON.stringify({ lag: "OK", t: "x", fel: ["app-framsida: HTTP 200"] }, null, 2));
  skrivMorkerVagLarm("annan orsak", { sokvagar: [larmFil], las, skriv, nu: "2026-09-29T00:10:00.000Z" });
  const efter3 = JSON.parse(fs.readFileSync(larmFil, "utf8"));
  kontroll(
    "32. mörker-larm: MERGAR med vakttornets befintliga felrader (bannerförlust = larmförlust)",
    efter3.lag === "ALARM" && efter3.fel.includes("app-framsida: HTTP 200") && efter3.fel.includes("prod-synk MÖRKER-VÄG: annan orsak"),
  );
  kontroll(
    "33. mörker-larm: skrivfel sväljs (larmet får ALDRIG döda deploy-kedjan)",
    (() => {
      try {
        skrivMorkerVagLarm("x", { sokvagar: ["/proc/omöjlig/larm.json"], las: () => null, skriv: () => { throw new Error("skrivfel"); }, nu: "t" });
        return true;
      } catch {
        return false;
      }
    })(),
  );
  fs.rmSync(larmTmp, { recursive: true, force: true });
}

// ── SUMMA ─────────────────────────────────────────────────────────────────
console.log(`\n=== ${pass} PASS · ${fail} FAIL ===`);
if (FEL.length) {
  console.log("FALLEN: " + FEL.join(", "));
  process.exit(1);
}
process.exit(0);
