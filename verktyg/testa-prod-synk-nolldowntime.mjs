#!/usr/bin/env node
/**
 * testa-prod-synk-nolldowntime.mjs — svit för V182 (r272, F6-rotens vaccin):
 * BYGG UTAN KUNDAVBROTT i prod-synk.mjs.
 *
 * BAKGRUND (r271:s F6-utredning 2026-09-27): varje prod-bygge mörkar sajten
 * medan det pågår — next build tömmer .next progressivt medan pm2 serverar
 * filerna från disk (statiska chunks 500, pulsvakten 05:40Z) och npm ci
 * raderar node_modules under den gående appen (lazy-require dör →
 * next-not-found-kraschloop, våg 153: ~7 min, 1 309 omstarter).
 *
 * Kuren som mäts här:
 *   · beslutaNpmCi — npm ci ENDAST vid lock-ändring/trasigt node_modules
 *   · byggNolldowntimeKommando — bygget skriver .next-ny (NEXT_DIST_DIR)
 *   · korSynk-flödet — artefakten mäts mot .next-ny, atomärt byte + restart,
 *     tillbakarullning på sekunder vid rött HTTPS
 *   · next.config.ts — distDir via env med .next som default
 *
 * Användning:  node verktyg/testa-prod-synk-nolldowntime.mjs
 * Exit 0 = alla PASS, exit 1 = minst ett FAIL.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { beslutaNpmCi, byggNolldowntimeKommando } from "./prod-synk.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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

// ── 1) BESLUTA NPM CI — normalfallet hoppar över (mörkerkällan tystas) ────
kontroll(
  "1. diff utan paketfiler + intakt node_modules ⇒ INGET npm ci (normalfallet)",
  beslutaNpmCi({ diffFiler: ["src/app/page.tsx", "data/blogg/x.json"], nodeModulesIntakt: true }) === false,
);
kontroll(
  "2. diff med package.json ⇒ npm ci",
  beslutaNpmCi({ diffFiler: ["README.md", "package.json"], nodeModulesIntakt: true }) === true,
);
kontroll(
  "3. diff med package-lock.json ⇒ npm ci (v181-klassen)",
  beslutaNpmCi({ diffFiler: ["package-lock.json", "verktyg/x.mjs"], nodeModulesIntakt: true }) === true,
);
kontroll(
  "4. obestämbar diff (null) ⇒ konservativt npm ci",
  beslutaNpmCi({ diffFiler: null, nodeModulesIntakt: true }) === true,
);
kontroll(
  "5. trasigt node_modules ⇒ npm ci även utan paketdiff",
  beslutaNpmCi({ diffFiler: ["src/app/page.tsx"], nodeModulesIntakt: false }) === true,
);
kontroll(
  "6. tom diff-array + intakt ⇒ inget npm ci (data-only deploy)",
  beslutaNpmCi({ diffFiler: [], nodeModulesIntakt: true }) === false,
);

// ── 2) BYGGKOMMANDOT — .next-ny är hela poängen ───────────────────────────
const utanCi = byggNolldowntimeKommando({ npmCi: false });
kontroll(
  "7. utan npm ci: bygger till .next-ny via NEXT_DIST_DIR",
  utanCi.startsWith("NEXT_DIST_DIR=.next-ny npm run build") && !utanCi.includes("npm ci"),
);
kontroll(
  "8. utan npm ci: byggloggen till /tmp/synk-build.log (bedömning av feltyp)",
  utanCi.includes(">> /tmp/synk-build.log 2>&1"),
);
const medCi = byggNolldowntimeKommando({ npmCi: true });
kontroll(
  "9. med npm ci: installationen FÖRE bygget, &&-kedjad",
  medCi.startsWith("npm ci --no-audit --no-fund >> /tmp/synk-npmci.log 2>&1 && NEXT_DIST_DIR=.next-ny npm run build"),
);

// ── 3) SANDBOX: mv-sekvenserna (bytets kärna, utan pm2 — skarp process) ───
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "nolldt-"));
const rot = path.join(tmp, "prod");
fs.mkdirSync(rot, { recursive: true });
// grönt prod-.next + nytt .next-ny från färdigt bygg
fs.mkdirSync(path.join(rot, ".next", "static"), { recursive: true });
fs.writeFileSync(path.join(rot, ".next", "BUILD_ID"), "GAMMAL-GRON");
fs.writeFileSync(path.join(rot, ".next", "static", "gammal.js"), "// gammal");
fs.mkdirSync(path.join(rot, ".next-ny", "static"), { recursive: true });
fs.writeFileSync(path.join(rot, ".next-ny", "BUILD_ID"), "NY-BYGGD");
fs.writeFileSync(path.join(rot, ".next-ny", "static", "ny.js"), "// ny");
const swapMv = "mv .next .next-forra && mv .next-ny .next";
try {
  execFileSync("bash", ["-c", swapMv], { cwd: rot, timeout: 10_000 });
  kontroll(
    "10. swap: .next är nya bygget (BUILD_ID NY-BYGGD)",
    fs.readFileSync(path.join(rot, ".next", "BUILD_ID"), "utf8") === "NY-BYGGD",
  );
  kontroll(
    "11. swap: gamla läget bevarat i .next-forra (rullningsbart)",
    fs.readFileSync(path.join(rot, ".next-forra", "BUILD_ID"), "utf8") === "GAMMAL-GRON",
  );
} catch (e) {
  kontroll("10. swap: .next är nya bygget (BUILD_ID NY-BYGGD)", false, String(e).slice(0, 80));
  kontroll("11. swap: gamla läget bevarat i .next-forra (rullningsbart)", false);
}
// tillbakarullning: trasigt nytt läge kasseras, gamla åter
fs.writeFileSync(path.join(rot, ".next", "BUILD_ID"), "TRASIG-EJ-VERIFIERAD");
const rollbackMv = "mv .next .next-ny-kass && mv .next-forra .next";
try {
  execFileSync("bash", ["-c", rollbackMv], { cwd: rot, timeout: 10_000 });
  kontroll(
    "12. rollback: gamla gröna läget åter i .next",
    fs.readFileSync(path.join(rot, ".next", "BUILD_ID"), "utf8") === "GAMMAL-GRON",
  );
  kontroll(
    "13. rollback: trasiga nya läget i .next-ny-kass (städbart)",
    fs.readFileSync(path.join(rot, ".next-ny-kass", "BUILD_ID"), "utf8") === "TRASIG-EJ-VERIFIERAD",
  );
} catch (e) {
  kontroll("12. rollback: gamla gröna läget åter i .next", false, String(e).slice(0, 80));
  kontroll("13. rollback: trasiga nya läget i .next-ny-kass (städbart)", false);
}
fs.rmSync(tmp, { recursive: true, force: true });

// ── 4) KÄLLKONTROLL: flödesanknytningarna i korSynk + next.config.ts ──────
const kalla = fs.readFileSync(path.join(REPO, "verktyg", "prod-synk.mjs"), "utf8");
kontroll(
  // v183B (r280): artefakten mäts mot NYA läget via nyaKatalog — .next-ny i
  // normalfallet, kopians .next-ny i stallningsläget (aldrig prod .next)
  "14. artefakten mäts mot .next-ny (inte prod .next)",
  kalla.includes("verifieraArtefakt({ nextKatalog: nyaKatalog })") &&
    kalla.includes('const nyaKatalog = stallning ? path.join(ROT, KOPIA_KATALOG, ".next-ny") : path.join(ROT, ".next-ny")'),
);
kontroll(
  // v187 (r276): bytet bär hash-vakten först — flyttade trädet under bygget
  // ⇒ swap-barnet exitar icke-noll och bytes-felgrenen tar över (buntslags-
  // racet 2026-09-27: grön deploy serverade steril edge-bunt). Kontraktet
  // är OFÖRÄNDRAT i kärnan: mv-kedjan + pm2 restart under deploylåset.
  "15. atomiskt byte under deploylåset: hash-vakt (v187) + mv .next .next-forra && mv .next-ny .next && pm2 restart",
  kalla.includes('test "$(git rev-parse HEAD)" = "${byggTradStart}" && mv .next .next-forra && mv .next-ny .next && pm2 restart ak1a'),
);
kontroll(
  "16. tillbakarullning vid rött HTTPS: mv tillbaka + restart",
  kalla.includes('"mv .next .next-ny-kass && mv .next-forra .next && pm2 restart ak1a"'),
);
kontroll(
  "17. npm ci-beslutet körs i korSynk (goodHead..HEAD-diff)",
  kalla.includes("beslutaNpmCi({ diffFiler, nodeModulesIntakt })"),
);
kontroll(
  // v183B (r280): o48-mörkret lever ENDAST som fallback — stallningsläget
  // (disk ≥ tröskel) stoppar ALDRIG pm2
  "18. npm ci-läget stoppar pm2 endast UTAN stallning (o48-fallbacken) — fönstret ärligt mörkt",
  kalla.includes("if (npmCiBehov && !stallning) pm2Vakt.stoppa();"),
);
kontroll(
  "19. bytet nollställer pm2-vakten (markeraLevande — ingen dubbelrestart)",
  kalla.includes("pm2Vakt.markeraLevande();"),
);
kontroll(
  "20. markeraLevande är en del av pm2-vakten",
  kalla.includes("markeraLevande() {") && kalla.includes("stoppad = false;"),
);
kontroll(
  "21. rent .next-ny före varje byggförsök (fallit skrap städas)",
  kalla.includes('fs.rmSync(path.join(ROT, ".next-ny"), { recursive: true, force: true });'),
);
kontroll(
  "22. grön deploy städar .next-forra (diskhygien)",
  kalla.includes('fs.rmSync(path.join(ROT, ".next-forra"), { recursive: true, force: true });'),
);
kontroll(
  "23. NOLLDOWNTIME-loggraden finns (transparens i synkloggen)",
  kalla.includes("NOLLDOWNTIME v182:"),
);
const nextConfig = fs.readFileSync(path.join(REPO, "next.config.ts"), "utf8");
kontroll(
  "24. next.config.ts: distDir via NEXT_DIST_DIR med .next som default",
  nextConfig.includes('distDir: process.env.NEXT_DIST_DIR || ".next"'),
);
const gitignore = fs.readFileSync(path.join(REPO, ".gitignore"), "utf8");
kontroll(
  "25. .gitignore täcker byggkatalogerna (aldrig ytsmuts)",
  gitignore.includes("/.next-ny/") && gitignore.includes("/.next-forra/") && gitignore.includes("/.next-ny-kass/"),
);

// ── SVIT ─────────────────────────────────────────────────────────────────
console.log(`\nSVIT testa-prod-synk-nolldowntime: ${pass} PASS, ${fail} FAIL`);
if (fail > 0) {
  console.log("FELPAKET: " + FEL.join(", "));
  process.exit(1);
}
process.exit(0);
