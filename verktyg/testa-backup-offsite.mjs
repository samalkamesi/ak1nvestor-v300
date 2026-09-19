#!/usr/bin/env node
// SVIT: backup-offsite (o93, spår 8 s8-u2 2026-09-19) — skalfri härdning av
// DR-kritiska backupverktyget: CHILD_PROC_INTERP high (o80 §sidofynd, Mimosa
// verktygsdomän 2026-09-19T12:47:54Z FÖRE-bevis) ⇒ execFileSync-array.
// =============================================================================
// Två lagrar (konsol/urval/drift-precedensen): (1) DEN RIKTIGA koden importeras
// — byggTarArgv körs, och importen får ALDRIG starta driftsidan (main-guard,
// feljagar-precedensen o80: backup + git push är skarpa sidoeffekter);
// (2) källkontrakt på verktygsfilen (revertgrid-mönstret): sviten läser
// källan och påstår härdningsformerna. Ingen skarp körning sker någonsin —
// verktyget pushar till GitHub (origin) vid main(), vilket ägs av pumporna.
import { strict as assert } from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VERKTYG = path.join(ROT, "verktyg", "backup-offsite.mjs");
const LOGG = path.join(ROT, "data", "vakten", "backup-offsite.log");

let pass = 0;
let fel = 0;
const KOLL = (namn, villkor, detalj = "") => {
  if (villkor) {
    pass++;
    console.log(`  PASS ${namn}`);
  } else {
    fel++;
    console.log(`  FAIL ${namn}${detalj ? " — " + detalj : ""}`);
  }
};

console.log("backup-offsite (o93): källkontrakt — härdade anropsformer");
{
  const kalla = fs.readFileSync(VERKTYG, "utf8");
  // tar + git körs med program som REN STRÄNG + argument-array (execFileSync)
  KOLL(
    "tar via execFileSync-array",
    kalla.includes('execFileSync("tar"'),
    "programmet tar anropas inte i härdad form",
  );
  KOLL(
    "git push via execFileSync-array",
    kalla.includes('execFileSync("git"'),
    "git-pushen anropas inte i härdad form",
  );
  // exekveringsformen: "execSync(" (skalform) får inte finnas — OBS:
  // delsträngen "execSync(" träffar INTE "execFileSync(" (F skiljer).
  KOLL(
    "ingen skalform kvar (execSync)",
    !kalla.includes("execSync("),
    "interpolerad skalsträngsform finns kvar i verktyget",
  );
  // gamla angreppsytorna: cd-mall + tar-mall + push-pipe
  KOLL("cd-mall bort", !kalla.includes("cd ${"), "kvarvarande interpolerad cd");
  KOLL("tar-mall bort", !kalla.includes("tar -czf ${"), "kvarvarande interpolerad tar");
  KOLL("git-push-pipe bort", !kalla.includes("git push origin develop 2>&1"), "kvarvarande skal-pipe");
  // cwd i options i stället för cd — ROT når processen utan skal
  KOLL("cwd-option används", kalla.includes("cwd: ROT"), "ROT passerar inte via cwd");
}

console.log("backup-offsite (o93): byggTarArgv — ren funktion (import av RIKTIGA koden)");
{
  // Importen ÄR testet: main-guard ska hålla driftsidan borta (se nästa block
  // för den aktiva mätningen) — här kommer själva exporten fram oskadd.
  const loggStorlekFore = fs.existsSync(LOGG) ? fs.statSync(LOGG).size : -1;
  const { byggTarArgv } = await import(pathToFileURL(VERKTYG).href);

  KOLL("export byggTarArgv är funktion", typeof byggTarArgv === "function");

  // Grundform: flagga, målfil, delar — ordning bevarad (tar-läser i ordning)
  const argv = byggTarArgv(["data/forskning/", "data/vakten/huvudtrad.json"], "/tmp/a.tar.gz.tar.gz");
  assert.deepStrictEqual(argv, ["-czf", "/tmp/a.tar.gz.tar.gz", "data/forskning/", "data/vakten/huvudtrad.json"]);
  KOLL("grundform [‑czf, mål, …delar] i ordning", true);

  // Beteendeidentitet — dubbelsuffixet läggs av ANROPAREN (dokumenterat i
  // verktyget: diskens arkiv + rensningsfilter + kundens hämtningsflöde):
  // funktionen muterar aldrig målnamnet (ingen dold "hjälp").
  const argv2 = byggTarArgv([], "/x/ak1a-offsite-2026-09-19.tar.gz");
  assert.deepStrictEqual(argv2, ["-czf", "/x/ak1a-offsite-2026-09-19.tar.gz"]);
  KOLL("ingen dold suffix-mutation av målfil", true);

  // Skalets metatecken är data i array-form: en del med mellanslag förblir
  // ETT element (skalformens arg-citering — gamla radens JSON.stringify-per-
  // del — ersatt av strukturen själv; det var den yta Mimosa flaggade).
  const argv3 = byggTarArgv(["data/en katalog med mellanslag/"], "/tmp/b.tar.gz");
  assert.strictEqual(argv3.length, 3);
  assert.strictEqual(argv3[2], "data/en katalog med mellanslag/");
  KOLL("specialtecken förblir ett element (ingen skaltolkning)", true);

  // Importen startade ALDRIG driftsidan: skarp logg orörd
  await new Promise((r) => setTimeout(r, 300));
  const loggStorlekEfter = fs.existsSync(LOGG) ? fs.statSync(LOGG).size : -1;
  KOLL(
    "main-guard: import skriver ingen skarp backup-logg",
    loggStorlekFore === loggStorlekEfter,
    `loggstorlek ${loggStorlekFore} → ${loggStorlekEfter}`,
  );
}

console.log(`\nSVIT KLAR: ${pass} PASS · ${fel} FAIL`);
process.exit(fel > 0 ? 1 : 0);
