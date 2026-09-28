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
import { execFileSync } from "node:child_process";
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

console.log("backup-offsite (s10-u3 2026-09-28): atomiskt kontrakt — ruin-detektor + namnformer");
{
  const kalla = fs.readFileSync(VERKTYG, "utf8");
  const { byggArkivFilnamn, byggPartFilnamn, arArkivLasbart } = await import(pathToFileURL(VERKTYG).href);

  // Namnkontrakt: daterat arkiv behåller dubbel-suffixformen (diskens alla
  // arkiv + kundens hämtningsflöde), part-filen är SINGULÄR-prefixär — en
  // körning mitt i skrivning syns aldrig på det slutgiltiga namnet.
  assert.strictEqual(byggArkivFilnamn("2026-09-28"), "ak1a-offsite-2026-09-28.tar.gz.tar.gz");
  KOLL("arkivnamn: daterat dubbel-suffix bevarat", true);
  assert.strictEqual(byggPartFilnamn("2026-09-28"), "ak1a-offsite-2026-09-28.part.tar.gz");
  KOLL("partnamn: .part.tar.gz-formen", true);
  assert.ok(!byggArkivFilnamn("2026-09-28").includes(".part"));
  KOLL("part och slutgiltigt namn kan aldrig kollidera", true);

  // Beteendettest av ruin-detektorn mot riktiga tar-filer (fixture i /tmp):
  // giltigt arkiv → true; trunkerad kopia (hel gzip avklippt mitt i) → false.
  const fix = fs.mkdtempSync("/tmp/s10u3-svit-");
  try {
    fs.writeFileSync(path.join(fix, "a.txt"), "tråden lever\n");
    fs.writeFileSync(path.join(fix, "b.txt"), "x".repeat(4096));
    execFileSync("tar", ["-czf", path.join(fix, "helt.tar.gz"), "a.txt", "b.txt"], { cwd: fix });
    const helt = await arArkivLasbart(path.join(fix, "helt.tar.gz"));
    KOLL("arArkivLasbart: helt arkiv → true", helt === true);

    const ruin = path.join(fix, "ruin.tar.gz");
    const buf = fs.readFileSync(path.join(fix, "helt.tar.gz"));
    fs.writeFileSync(ruin, buf.subarray(0, Math.floor(buf.length * 0.7)));
    const ruinen = await arArkivLasbart(ruin);
    KOLL("arArkivLasbart: trunkerad ruin → false", ruinen === false);
  } finally {
    fs.rmSync(fix, { recursive: true, force: true });
  }

  // Källkontrakt på kuren: timeouten räcker för växtet arkiv, part→rename-
  // flytet, snapshot via backup-API + quick_check-grind — och copyFileSync
  // på db-källan är borta (integritetsfyllet 2026-09-28: invalid pages).
  KOLL("timeout höjd till 1 200 s", kalla.includes("timeout: 1_200_000"), "verktyget skjuter fortfarande med 120 s");
  KOLL("GZIP=-1 via ren env-option", kalla.includes('GZIP: "-1"'), "genomströmningsvalet saknas");
  KOLL("rename-flyt finns (part → slutgiltigt)", kalla.includes("fs.renameSync(partSökväg, sökväg)"), "atomär namngivning saknas");
  KOLL("snapshot via python3 backup-API", kalla.includes("src.backup(dst)"), "konsistent snapshot saknas");
  KOLL("quick_check grindar snapshot", kalla.includes("PRAGMA quick_check"), "integritetsgrind saknas");
  KOLL(
    "copyFileSync på db-källan bortagen",
    !/^\s*fs\.copyFileSync/m.test(kalla),
    "filkopiering av levande DB lever kvar som ANROP (dokumentationsomnämnanden i kommentarer är tillåtna)",
  );
  KOLL("part-rester rensas i huvudet", kalla.includes(".part.tar.gz"), "part-flödet saknas i rensningen");
}

console.log(`\nSVIT KLAR: ${pass} PASS · ${fel} FAIL`);
process.exit(fel > 0 ? 1 : 0);
