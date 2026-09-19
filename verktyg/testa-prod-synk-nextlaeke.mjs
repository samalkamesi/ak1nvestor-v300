#!/usr/bin/env node
/**
 * testa-prod-synk-nextlaeke.mjs — svit för o97 NEXT-LÄKEBACKUP
 * (prod-synk.mjs skapaNextLaekebackup + aterstallNextUrLaeke).
 *
 * BAKGRUND (bevis 2026-09-19): next build skriver progressivt i prod-trädets
 * .next — ett fallit/OOM-dödat bygg lämnar katalogen halvskriven medan pm2
 * serverar den från disk (06:58+07:01-fallna byggen ⇒ /kurser m.fl. 500 i
 * ~14 min; nytt fönster efter 19:11-OOM:en). Kuren säkrar senast GRÖNA .next
 * i .next-laeke före byggstart och återställer den i varje fallit utfall.
 *
 * Användning:  node verktyg/testa-prod-synk-nextlaeke.mjs
 * Exit 0 = alla PASS, exit 1 = minst ett FAIL.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { skapaNextLaekebackup, aterstallNextUrLaeke } from "./prod-synk.mjs";

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

// ── SANDBOX: ett grönt .next med manifests, server, static och cache ─────
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "nextlaeke-"));
const nextKatalog = path.join(tmp, "sandbox", ".next");
const laekeKatalog = path.join(tmp, "sandbox", ".next-laeke");
fs.mkdirSync(path.join(nextKatalog, "server", "app"), { recursive: true });
fs.mkdirSync(path.join(nextKatalog, "static", "chunks"), { recursive: true });
fs.mkdirSync(path.join(nextKatalog, "cache", "isr"), { recursive: true });
fs.writeFileSync(path.join(nextKatalog, "BUILD_ID"), "GRON-1234");
fs.writeFileSync(path.join(nextKatalog, "build-manifest.json"), "{}");
fs.writeFileSync(path.join(nextKatalog, "prerender-manifest.json"), "{}");
fs.writeFileSync(path.join(nextKatalog, "server", "app", "index.html"), "<html>grön</html>");
fs.writeFileSync(path.join(nextKatalog, "static", "chunks", "chunk-abc.js"), "// grön chunk");
fs.writeFileSync(path.join(nextKatalog, "cache", "isr", "kurser.html"), "<html>isr-cache</html>");

// ── 1) SKAPA: LAEKE föds ur ett grönt .next ──────────────────────────────
kontroll("1. grönt .next ⇒ skapad", skapaNextLaekebackup({ nextKatalog, laekeKatalog }) === "skapad");
kontroll("2. LAEKE existerar", fs.existsSync(laekeKatalog));
kontroll(
  "3. kärnkontraktet följer med (BUILD_ID identiskt)",
  fs.readFileSync(path.join(laekeKatalog, "BUILD_ID"), "utf8") === "GRON-1234",
);
kontroll("4. server-bundle följer med", fs.existsSync(path.join(laekeKatalog, "server", "app", "index.html")));
kontroll("5. static-chunk följer med", fs.existsSync(path.join(laekeKatalog, "static", "chunks", "chunk-abc.js")));
kontroll("6. ISR-cache EXKLUDERAS (regenererbar ~1 GB)", !fs.existsSync(path.join(laekeKatalog, "cache")));

// ── 2) FINNS-SEDAN: LAEKE ersätts ALDRIG av ett trasigt .next ────────────
fs.rmSync(path.join(nextKatalog, "BUILD_ID"), { force: true }); // simulerar halvskrivet träd
kontroll("7. LAEKE finns ⇒ finns-sedan (orörd)", skapaNextLaekebackup({ nextKatalog, laekeKatalog }) === "finns-sedan");
kontroll(
  "8. LAEKE bevarar gröna BUILD_ID trots sabotaget",
  fs.readFileSync(path.join(laekeKatalog, "BUILD_ID"), "utf8") === "GRON-1234",
);

// ── 3) ICKE-GRÖN: halvskrivet .next backas ALDRIG ────────────────────────
const tmp2 = fs.mkdtempSync(path.join(os.tmpdir(), "nextlaeke-"));
fs.mkdirSync(path.join(tmp2, ".next"), { recursive: true }); // finns, men TOM (rivet av fallit bygg)
kontroll(
  "9. .next utan BUILD_ID ⇒ icke-gron, ingen LAEKE skapas",
  skapaNextLaekebackup({ nextKatalog: path.join(tmp2, ".next"), laekeKatalog: path.join(tmp2, ".next-laeke") }) === "icke-gron" &&
    !fs.existsSync(path.join(tmp2, ".next-laeke")),
);
fs.writeFileSync(path.join(tmp2, ".next", "BUILD_ID"), "HALV");
kontroll(
  "10. BUILD_ID utan manifests ⇒ fortfarande icke-gron",
  skapaNextLaekebackup({ nextKatalog: path.join(tmp2, ".next"), laekeKatalog: path.join(tmp2, ".next-laeke") }) === "icke-gron",
);
kontroll(
  "11. .next saknas ⇒ saknas-next (första deployen)",
  skapaNextLaekebackup({ nextKatalog: path.join(tmp2, "finns-ej"), laekeKatalog: path.join(tmp2, "laeke-ej") }) === "saknas-next",
);

// ── 4) ÅTERSTÄLL: saboterat .next läker ur LAEKE ─────────────────────────
fs.rmSync(path.join(nextKatalog, "static"), { recursive: true, force: true }); // bygg-rivning
fs.writeFileSync(path.join(nextKatalog, "BUILD_ID"), "HALVSKRIVEN-9999");
kontroll("12. LAEKE ⇒ aterstallt", aterstallNextUrLaeke({ nextKatalog, laekeKatalog }) === "aterstallt");
kontroll(
  "13. återställt BUILD_ID == gröna originalets",
  fs.readFileSync(path.join(nextKatalog, "BUILD_ID"), "utf8") === "GRON-1234",
);
kontroll("14. återställd chunk på plats", fs.existsSync(path.join(nextKatalog, "static", "chunks", "chunk-abc.js")));
kontroll(
  "15. idempotent: andra återställningen också aterstallt + identiskt",
  aterstallNextUrLaeke({ nextKatalog, laekeKatalog }) === "aterstallt" &&
    fs.readFileSync(path.join(nextKatalog, "BUILD_ID"), "utf8") === "GRON-1234",
);
kontroll(
  "16. ingen LAEKE ⇒ ingen-backup (ärligt, första fönstret)",
  aterstallNextUrLaeke({ nextKatalog: path.join(tmp2, ".next"), laekeKatalog: path.join(tmp2, ".next-laeke") }) === "ingen-backup",
);

// ── 5) FAIL-OPEN: backup-vägen kastar ALDRIG (deploy-kedjan får ej dö) ───
const filSomEjArKatalog = path.join(tmp2, "en-fil");
fs.writeFileSync(filSomEjArKatalog, "inte en katalog");
fs.writeFileSync(path.join(tmp2, ".next", "build-manifest.json"), "{}");
fs.writeFileSync(path.join(tmp2, ".next", "prerender-manifest.json"), "{}"); // .next nu GRÖNT med BUILD_ID ovan
let kastadeEj = true;
let svarFel = "";
try {
  svarFel = skapaNextLaekebackup({ nextKatalog: path.join(tmp2, ".next"), laekeKatalog: path.join(filSomEjArKatalog, "laeke") });
} catch {
  kastadeEj = false;
}
kontroll("17. skapa kastar aldrig — oläslig laeke-sökväg ⇒ fel-sträng", kastadeEj && svarFel.startsWith("fel:"));
let kastadeEj2 = true;
let svarFel2 = "";
try {
  svarFel2 = aterstallNextUrLaeke({ nextKatalog: path.join(tmp2, "target"), laekeKatalog: filSomEjArKatalog });
} catch {
  kastadeEj2 = false;
}
kontroll("18. aterstall kastar aldrig — FIL som laeke ⇒ fel-sträng (katalog-guards)", kastadeEj2 && svarFel2.startsWith("fel:"));

// städa sandbox
fs.rmSync(tmp, { recursive: true, force: true });
fs.rmSync(tmp2, { recursive: true, force: true });

// ── 6) KÄLLKONTROLL: flödesanknytningarna i korSynk ──────────────────────
const kalla = fs.readFileSync(path.join(REPO, "verktyg", "prod-synk.mjs"), "utf8");
kontroll("19. korSynk tar backup FÖRE första korBygg", kalla.includes("const backup = skapaNextLaekebackup({ nextKatalog, laekeKatalog })"));
kontroll('20. oom-grenen läker: lakaNext("oom")', kalla.includes('lakaNext("oom")'));
kontroll('21. riktigt-fel-grenen läker före ombyggena: lakaNext("byggfel")', kalla.includes('lakaNext("byggfel")'));
kontroll('22. fallit ombygg på god lock läker: lakaNext("ombygge-god-lock-fall")', kalla.includes('lakaNext("ombygge-god-lock-fall")'));
kontroll('23. o79-avstå-terminalen läker: lakaNext("o79-avsta")', kalla.includes('lakaNext("o79-avsta")'));
kontroll('24. goodHead-KRITISKT-terminalen läker: lakaNext("goodhead-kritiskt")', kalla.includes('lakaNext("goodhead-kritiskt")'));
kontroll('25. artefakt-stoppet läker (E34-klassen): lakaNext("artefakt-stopp")', kalla.includes('lakaNext("artefakt-stopp")'));
kontroll("26. lyckad deploy städar LAEKE (rmSync i ok-vägen)", kalla.includes("try { fs.rmSync(laekeKatalog, { recursive: true, force: true }); } catch { /* får ligga — städas nästa gröna deploy */ }"));
kontroll("27. läkning auditloggas (next_lakt_ur_backup)", kalla.includes('"next_lakt_ur_backup"'));
kontroll("28. startade-aldrig-grenen lämnas orörd (bygget startade ej ⇒ .next orört)", !kalla.includes("lakaNext(" + '"startade'));
const gitignore = fs.readFileSync(path.join(REPO, ".gitignore"), "utf8");
kontroll("29. .gitignore täcker /.next-laeke/ (aldrig ytsmuts)", gitignore.includes("/.next-laeke/"));

// ── SVIT ─────────────────────────────────────────────────────────────────
console.log(`\nSVIT testa-prod-synk-nextlaeke: ${pass} PASS, ${fail} FAIL`);
if (fail > 0) {
  console.log("FELPAKET: " + FEL.join(", "));
  process.exit(1);
}
process.exit(0);
