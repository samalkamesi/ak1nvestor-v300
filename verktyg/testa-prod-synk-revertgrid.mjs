#!/usr/bin/env node
/**
 * testa-prod-synk-revertgrid.mjs — svit för o72 blind-revert-vakten
 * (prod-synk.mjs headRorByggyta + felgrenens revert-avstånd).
 *
 * BAKGRUND (bevis 72682834): felgrenens `git revert HEAD` rullade tillbaka
 * o47:s tmp-migrering (3c78e03f) 3 minuter efter commit — en ren verktyg/+
 * data/-commit som aldrig kan orsaka Next-byggfel. Kuren reverterar ENDAST
 * när HEAD själv berör byggytan.
 *
 * Användning:  node verktyg/testa-prod-synk-revertgrid.mjs
 * Exit 0 = alla PASS, exit 1 = minst ett FAIL.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { headRorByggyta } from "./prod-synk.mjs";

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

// ── 1) REN FUNKTION: klassificering ──────────────────────────────────────
kontroll("1. null/undefined ⇒ true (konservativt = gammalt beteende)", headRorByggyta(null) === true);
kontroll("1b. ej-array ⇒ true", headRorByggyta("src/app/page.tsx") === true);
kontroll("2. 72682834-FALLET: ren verktyg+data-commit ⇒ false", headRorByggyta([
  "verktyg/validera-motorer.mjs",
  "verktyg/testa-sok.mjs",
  "data/rapporter/motorervalidering-2026-09-02.md",
  "data/forskning/OPTIMERING/o47-tmp-rot-skrivare-migrering-s8.md",
  "worklog.md",
]) === false);
kontroll("3. src/ ⇒ true", headRorByggyta(["src/app/page.tsx"]) === true);
kontroll("4. blandad src+data ⇒ true (koden kan vara gärningsman)", headRorByggyta(["src/lib/x.ts", "data/y.json"]) === true);
kontroll("5. public/ ⇒ true", headRorByggyta(["public/bild.png"]) === true);
kontroll("6. package.json ⇒ true", headRorByggyta(["package.json"]) === true);
kontroll("7. package-lock.json ⇒ true", headRorByggyta(["package-lock.json"]) === true);
kontroll("8. next.config.ts ⇒ true", headRorByggyta(["next.config.ts"]) === true);
kontroll("9. tsconfig.json ⇒ true", headRorByggyta(["tsconfig.json"]) === true);
kontroll("10. tailwind/postcss/middleware ⇒ true", headRorByggyta(["tailwind.config.ts", "postcss.config.mjs", "middleware.ts"]) === true);
kontroll("11. srcx/ är INTE src/ ⇒ false", headRorByggyta(["srcx/foo.ts"]) === false);
kontroll("12. tom commit-lista ⇒ false", headRorByggyta([]) === false);
kontroll("13. tomma strängar ignoreras ⇒ false", headRorByggyta(["", "   "]) === false);
kontroll("14. leading/trailing space normaliseras ⇒ src/ ⇒ true", headRorByggyta(["  src/app/page.tsx  "]) === true);

// ── 2) INTEGRATION: verkliga commits ur git-historiken ───────────────────
function commitFiler(hash) {
  const ut = execFileSync("git", ["show", "--name-only", "--format=", hash], { cwd: REPO, encoding: "utf8" });
  return ut.split("\n").map((s) => s.trim()).filter(Boolean);
}

// 3c78e03f = o47:s tmp-migrering som 72682834 revertrade (ren verktyg/data)
const migreringsFiler = commitFiler("3c78e03f");
kontroll("15. 3c78e03f (o47-migreringen, verklig) ⇒ false — SKYDDAD av vakt", headRorByggyta(migreringsFiler) === false, `filer: ${migreringsFiler.slice(0, 3).join(", ")}…`);

// 18c2d747 = s7-u1:s trädbantning (rör src/)
const srcFiler = commitFiler("18c2d747");
kontroll("16. 18c2d747 (src-commit, verklig) ⇒ true — revert tillåten", headRorByggyta(srcFiler) === true, `filer: ${srcFiler.slice(0, 3).join(", ")}…`);

// ── 3) KÄLLKONTROLL: felgrenen använder vakten ───────────────────────────
const kalla = readFileSync(path.join(REPO, "verktyg", "prod-synk.mjs"), "utf8");
kontroll("17. felgrenen anropar headRorByggyta", kalla.includes("const rorByggyta = headRorByggyta(headFiler)"));
kontroll("18. revert-grenen är villkorad (AVSTÅS-väg finns)", kalla.includes("revert AVSTÅS"));
kontroll("19. ombygg-utan-revert skriver audit", kalla.includes("deploy_ombygg_utan_revert"));
kontroll("20. gamla revert-vägen bevarad för byggyta-HEAD", kalla.includes('git(["revert", "HEAD", "--no-edit"])'));

// ── SVIT ─────────────────────────────────────────────────────────────────
console.log(`\nSVIT testa-prod-synk-revertgrid: ${pass} PASS, ${fail} FAIL`);
if (fail > 0) {
  console.log("FELPAKET: " + FEL.join(", "));
  process.exit(1);
}
process.exit(0);
