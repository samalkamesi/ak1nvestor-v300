#!/usr/bin/env node
/**
 * _s8u2-tmp-rotmigrering.mjs — s8-u2 (manifest auto-s8-1789642527960)
 *
 * O44 köpost 1: migrerar de 14 kvarvarande rot-skrivarna (verktyg som
 * genererar tmp_*.ts i REPO-ROten) till .tmp/-engångszonen (våg 150:
 * gitignorerad + tsconfig-exkluderad). Mekanisk mönstermigration med
 * EXAKT träff-verifiering per fil — en regel som inte träffar förväntat
 * antal gånger ⇒ filen hoppas över och rapporteras (inga halvkurer).
 *
 * Kur per fil (o44:s mönster, samma som demoklient/morgonrond):
 *   A. TMP-sökväg:  path.join(REPO, "<namn>")  → path.join(REPO, ".tmp", "<namn>")
 *   B. TMP_NAMN-variant: path.join(REPO, TMP_NAMN) → path.join(REPO, ".tmp", TMP_NAMN)
 *   C. tsx-argument: "<namn>" → ".tmp/<namn>"  (barnet körs med cwd=REPO)
 *   D. doc/log-rader: "tsx <namn>" → "tsx .tmp/<namn>"
 *   E. genererad TS-kod: from "./src/ → from "../src/  (filen ligger en nivå djupare)
 *   F. mkdirSync(.tmp, recursive) före writeFileSync + mkdirSync i fs-importen
 *
 * TS_KOD-signaturens första rad ("// tmp_X — GENERERAD av …") rörs EJ —
 * städarnas signaturmatchning ("GENERERAD av verktyg/" + "Raderas efter
 * körning") är innehållsbaserad, och .tmp-zonsoparen matchar basnamnet.
 *
 * Användning:  node verktyg/_s8u2-tmp-rotmigrering.mjs [--verkstalla]
 * Utan flagga: torrläge (bara rapport). Med flagga: skriver filerna.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VERKSTALLA = process.argv.includes("--verkstalla");

// fil → tmp-namn (kartlagd 2026-09-17; unika namn verifierade)
const FILER = [
  { fil: "verktyg/importera-oversattning.mjs", namn: "tmp_import_oversattning.ts", kor: true },
  { fil: "verktyg/kor-akm2-berika.mjs", namn: "tmp_akm2_berika.ts", kor: true },
  { fil: "verktyg/kor-fvag.mjs", namn: "tmp_fvag_kor.ts", kor: true },
  { fil: "verktyg/kor-oversatt-batch.mjs", namn: "tmp_kor_oversatt_batch.ts", kor: true },
  { fil: "verktyg/testa-akm2-dynamik.mjs", namn: "tmp_dynamik_koll.ts" },
  { fil: "verktyg/testa-akm2-moduler.mjs", namn: "tmp_akm2_modul_koll.ts" },
  { fil: "verktyg/testa-akm2-snapshot.mjs", namn: "tmp_akm2_snapshot_koll.ts", namnVariant: true },
  { fil: "verktyg/testa-akm3-kalibrering.mjs", namn: "tmp_kalibrering_koll.ts" },
  { fil: "verktyg/testa-fundamental-vagmotor.mjs", namn: "tmp_fvag_koll.ts" },
  { fil: "verktyg/testa-pro-screening.mjs", namn: "tmp_pro_screening_koll.ts" },
  { fil: "verktyg/testa-riskportfolj.mjs", namn: "tmp_riskportfolj_test.ts", namnVariant: true },
  { fil: "verktyg/testa-sok.mjs", namn: "tmp_sok_koll.ts" },
  { fil: "verktyg/testa-uppfoljning.mjs", namn: "tmp_uppfoljning_test.ts", namnVariant: true },
  { fil: "verktyg/validera-motorer.mjs", namn: "tmp_motor_koll.ts" },
];

function byt(text, fran, till, vanta, kontext) {
  const delar = text.split(fran);
  const träffar = delar.length - 1;
  if (träffar !== vanta) {
    throw new Error(
      kontext + ": mönster träffade " + träffar + " gånger, förväntat " + vanta +
      " — känns inte säker, filen hoppas över"
    );
  }
  return delar.join(till);
}

const rapport = [];
for (const { fil, namn, kor, namnVariant } of FILER) {
  const abs = path.join(REPO, fil);
  let kod;
  try {
    kod = readFileSync(abs, "utf8");
  } catch (e) {
    rapport.push({ fil, status: "FEL", medd: e.message });
    continue;
  }
  const aAndringar = [];
  try {
    if (namnVariant) {
      // B: TMP_NAMN-varianten — TMP = join(REPO, TMP_NAMN); tsx-anropet bär TMP_NAMN
      kod = byt(kod, "path.join(REPO, TMP_NAMN)", "path.join(REPO, \".tmp\", TMP_NAMN)", 1, fil + " B");
      kod = byt(kod, '"tsx", TMP_NAMN', '"tsx", ".tmp/" + TMP_NAMN', 1, fil + " C-namnvariant");
      aAndringar.push("B", "C");
    } else {
      // A: TMP_TS-varianten
      kod = byt(kod, 'path.join(REPO, "' + namn + '")', 'path.join(REPO, ".tmp", "' + namn + '")', 1, fil + " A");
      aAndringar.push("A");
      // C: tsx-argument (literalt namn) — 0 eller 1 träff (pro-screening kör "${TMP_TS}" absolut)
      const cFore = (kod.split('"tsx", "' + namn + '"').length - 1);
      if (cFore === 1) {
        kod = byt(kod, '"tsx", "' + namn + '"', '"tsx", ".tmp/' + namn + '"', 1, fil + " C");
        aAndringar.push("C");
      }
    }
    // D: doc/log-rader "tsx <namn>" (utan .tmp-prefix)
    const dFore = (kod.split("tsx " + namn).length - 1);
    if (dFore > 0) {
      kod = byt(kod, "tsx " + namn, "tsx .tmp/" + namn, dFore, fil + " D");
      aAndringar.push("D×" + dFore);
    }
    // E: genererad TS-kods relativa src-importer → en nivå upp
    const eFore = (kod.split('from "./src/').length - 1);
    if (eFore > 0) {
      kod = byt(kod, 'from "./src/', 'from "../src/', eFore, fil + " E");
      aAndringar.push("E×" + eFore);
    }
    // F: mkdirSync av .tmp-zonen före skrivningen + fs-import
    const tmpVar = namnVariant ? "TMP" : "TMP_TS";
    const skrivRad = "writeFileSync(" + tmpVar + ",";
    if (!kod.includes(skrivRad)) throw new Error(fil + " F: hittade inte " + skrivRad);
    const mkdirRad = "  mkdirSync(path.dirname(" + tmpVar + "), { recursive: true }); // o44: engångszonen finns alltid";
    if (!kod.includes(mkdirRad)) {
      const forekomst = (kod.split(skrivRad).length - 1);
      if (forekomst !== 1) throw new Error(fil + " F: " + skrivRad + " träffade " + forekomst + " gånger (väntat 1)");
      kod = byt(kod, skrivRad, mkdirRad + "\n  " + skrivRad, 1, fil + " F-insättning");
      // fs-importen: lägg till mkdirSync om den saknas (bevara ev. befintlig)
      const imp = 'import { unlinkSync, writeFileSync } from "node:fs";';
      const impNy = 'import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";';
      if (kod.includes(imp)) {
        kod = byt(kod, imp, impNy, 1, fil + " F-import");
      } else if (!/import \{[^}]*mkdirSync[^}]*\} from "node:fs"/.test(kod)) {
        throw new Error(fil + " F-import: okänd fs-import-rad — granska manuellt");
      }
      aAndringar.push("F");
    }
    // Säkerhetsgrip: inga kvarvarande rot-skrivande mönster
    if (kod.includes('path.join(REPO, "tmp_')) throw new Error(fil + ": kvarvarande rot-sökväg efter migration");
    if (kod.includes('"tsx", "tmp_')) throw new Error(fil + ": kvarvarande bart tsx-namn efter migration");
    rapport.push({ fil, status: kor ? "KURERAD (körverktyg — statiskt bevis)" : "KURERAD", andringar: aAndringar.join("+") });
    if (VERKSTALLA) {
      writeFileSync(abs, kod, "utf8");
      execFileSync(process.execPath, ["--check", abs], { stdio: "pipe" });
    }
  } catch (e) {
    rapport.push({ fil, status: "HOPPAT ÖVER", medd: e.message });
  }
}

console.log("=== s8-u2 tmp-rotmigrering — " + (VERKSTALLA ? "VERKSTÄLLT" : "TORRläge") + " ===");
for (const r of rapport) {
  console.log(
    (r.status.startsWith("KURERAD") ? "✓" : "✗") + " " + r.fil + " [" + r.status + "]" +
    (r.andringar ? " ändringar: " + r.andringar : "") + (r.medd ? " — " + r.medd : "")
  );
}
const misslyckade = rapport.filter((r) => !r.status.startsWith("KURERAD")).length;
console.log("Sammanfattning: " + (rapport.length - misslyckade) + "/" + rapport.length + " kurerade" + (misslyckade ? ", " + misslyckade + " hoppar" : ""));
process.exit(misslyckade > 0 ? 1 : 0);
