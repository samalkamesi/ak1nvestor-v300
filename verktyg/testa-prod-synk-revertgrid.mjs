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
import { headRorByggyta, bordeAvstaGoodHeadReset } from "./prod-synk.mjs";

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
kontroll("10b. proxy.ts (rot) ⇒ true (v188: filbytet middleware→proxy får ej tömma byggytornas paritet)", headRorByggyta(["proxy.ts"]) === true);
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

// ── 4) O79: bordeAvstaGoodHeadReset — klassificering ─────────────────────
// (importeras på rad 18 tillsammans med headRorByggyta) — o72:s köpost:
// fallbacken `reset --hard goodHead` ska avstå när HELA kedjan är oskyldig.
kontroll("21. O79: HEAD ren + kedja ren ⇒ AVSTÅ reset (köpostens kärna)", bordeAvstaGoodHeadReset({ rorByggyta: false, kedjaRorByggyta: false }) === true);
kontroll("22. O79: HEAD ren + kedja smutsig ⇒ false (reset läker till goodHead)", bordeAvstaGoodHeadReset({ rorByggyta: false, kedjaRorByggyta: true }) === false);
kontroll("23. O79: revert-vägen (HEAD rör byggyta) ⇒ false — oförändrat", bordeAvstaGoodHeadReset({ rorByggyta: true, kedjaRorByggyta: false }) === false);
kontroll("24. O79: båda smutsiga ⇒ false — oförändrat", bordeAvstaGoodHeadReset({ rorByggyta: true, kedjaRorByggyta: true }) === false);

// ── 5) O79: INTEGRATION — verkliga kedjor ur git-historiken ──────────────
function kedjeFiler(fran, till) {
  const ut = execFileSync("git", ["diff", "--name-only", `${fran}..${till}`], { cwd: REPO, encoding: "utf8" });
  return ut.split("\n").map((s) => s.trim()).filter(Boolean);
}
// 3c78e03f (o47-migreringen) → 72682834 (dess revert): kedjans samlade
// skillnad = enbart migreringens verktyg/+data/-filer = REN (19 filer).
const renKedja = kedjeFiler("3c78e03f", "72682834");
kontroll("25. O79: verklig ren kedja 3c78e03f..72682834 ⇒ avstå-beslut STYRKER (headFiler ren + kedja ren)", headRorByggyta(renKedja) === false && bordeAvstaGoodHeadReset({ rorByggyta: false, kedjaRorByggyta: headRorByggyta(renKedja) }) === true, `${renKedja.length} filer, alla utanför byggytan`);
// 72682834 → 18c2d747 (s7-u1:s trädbantning): kedjan bär 40 src/-filer =
// SMUTSIG — reset goodHead ska behållas (äldre gärningsman kan finnas).
const smutsigKedja = kedjeFiler("72682834", "18c2d747");
kontroll("26. O79: verklig smutsig kedja 72682834..18c2d747 ⇒ avstå-beslut EJ styrkt", bordeAvstaGoodHeadReset({ rorByggyta: false, kedjaRorByggyta: headRorByggyta(smutsigKedja) }) === false, `${smutsigKedja.filter((f) => f.startsWith("src/")).length} src-filer i kedjan`);
// Kedjan med gärningsman + oskyldig HEAD: kombination som BEVISAR varför
// HEAD-checken ensam inte räcker — kedje-mätet är det sanna oskulds-måttet.
kontroll("27. O79: oskyldig HEAD (3c78e03f) på smutsig kedja ⇒ reset kvar (läker prod)", headRorByggyta(migreringsFiler) === false && bordeAvstaGoodHeadReset({ rorByggyta: false, kedjaRorByggyta: headRorByggyta(smutsigKedja) }) === false);

// ── 6) O79: KÄLLKONTROLL — felgrenens guard + disjunktion ────────────────
kontroll("28. O79: catch-grenen mäter kedjan (git diff --name-only)", kalla.includes('"diff", "--name-only"'));
kontroll("29. O79: avstå-reset skriver audit deploy_avstar_goodhead_reset", kalla.includes("deploy_avstar_goodhead_reset"));
kontroll("30. O79: reset-kommandot kvar för smutsig kedja", kalla.includes('git(["reset", "--hard", goodHead])'));
kontroll("31. O79: patch-läge och o72-block DISJUNKTA (} else { före O72-vakten)", kalla.includes("} else {\n      // O72 blind-revert-vakten"));
kontroll("32. O79: patch-lägets lyckade ombygg lämnar felgrenen (O79-kommentaren)", kalla.includes("patch-lägets lyckade ombygg lämnar felgrenen HÄR"));
kontroll("33. O79: kedja obestämbar ⇒ gammalt beteende (catch-kommentaren)", kalla.includes("obestämbar ⇒ headRorByggyta(null) = true = gammalt beteende */ }"));

// ── SVIT ─────────────────────────────────────────────────────────────────
console.log(`\nSVIT testa-prod-synk-revertgrid: ${pass} PASS, ${fail} FAIL`);
if (fail > 0) {
  console.log("FELPAKET: " + FEL.join(", "));
  process.exit(1);
}
process.exit(0);
