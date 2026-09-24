#!/usr/bin/env node
// SVIT: skalfri-vakt (o98, spår 8 s8-u3 2026-09-19) — verktygets FÖRSTA svit,
// född ur o93 §4.1-köposten: args-tolkningens rotkur + testbar kärna.
// =============================================================================
// Lager (konsol/urval/drift-precedensen):
// (1) KÄLLKONTRAKT på verktygsfilen: isAbsolute-idiomet finns, buggformen
//     `statSync(rot).isAbsolute` finns INTE, main-guard + exporterad kärna
//     (o80-precedensen), UNDANTAG-oföränderlighet (dev.sh + mimosa-sviten).
// (2) FUNKTIONELLT: jagaSkalfri() importeras och körs mot en tmp-fixture —
//     klassningen FYND/HÄRDAD/FAST, rekursion, filändelsesfilter, och
//     o96-kurens kärna: ABSOLUT rot fungerar + är ekvivalent med relativ.
// (3) CLI-KONTRAKT (pumpornas 05:06-rop): exit 1 vid fynd, exit 0 + GRÖN vid
//     rent träd, --json FIL skriver rapport, okänd flagga → exit 2.
//
// DESIGNVAL (viktigt för framtida vågor): fixture-innehållet med FARLIGA
// mönster byggs i DELAR (["exe", "cSync(…"]) så att denna svitfil ALDRIG
// själv bär en komplett fyndrad — då behövs INGEN utvidgning av
// fixture-undantagen (kvalitetsvakten sektion 13:s kontrakt "ENDAST den egna
// mimosa-sviten" förblir sant, och skalfri-vaktens UNDANTAG växer inte).
import { strict as assert } from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VERKTYG = path.join(ROT, "verktyg", "skalfri-vakt.mjs");

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

console.log("skalfri-vakt (o98): källkontrakt — args-tolkning + main-guard + undantag");
{
  const kalla = fs.readFileSync(VERKTYG, "utf8");
  KOLL(
    "isAbsolute-idiomet används",
    kalla.includes("if (!isAbsolute(rot))"),
    "rotcykeln tolkar inte absoluta rötter via path.isAbsolute",
  );
  KOLL(
    "buggformen bort (statSync(…).isAbsolute)",
    !kalla.includes(".isAbsolute)"),
    "fs.Stats saknar isAbsolute — gamla buggformen finns kvar",
  );
  KOLL(
    "isAbsolute importeras från node:path",
    /from "node:path"/.test(kalla) && /\bisAbsolute\b/.test(kalla.split("node:path")[1] || ""),
    "importen saknar isAbsolute",
  );
  KOLL(
    "main-guard (import startar aldrig skanning)",
    kalla.includes("import.meta.url === pathToFileURL(resolve(process.argv[1])).href"),
    "o80-precedensens huvudmodulvakt saknas",
  );
  KOLL(
    "kärnan exporterad (jagaSkalfri)",
    kalla.includes("export function jagaSkalfri"),
    "o80-precedensens rena kärna saknas",
  );
  KOLL(
    "UNDANTAG oföränderlig (dev.sh kvar)",
    kalla.includes('".zscripts/dev.sh"'),
    "o21-undantaget har tagits bort",
  );
  KOLL(
    "UNDANTAG oföränderlig (mimosa-sviten kvar)",
    kalla.includes('"verktyg/testa-mimosa-paritet.mjs"'),
    "o15-undantaget har tagits bort",
  );
  KOLL(
    "CLI-exitkontraktet kvar (0/1/2)",
    kalla.includes("process.exit(fynd.length === 0 ? 0 : 1)") && kalla.includes("process.exit(2)"),
    "pumpornas 05:06-rop kräver exit 0/1 + argumentfel exit 2",
  );
}

console.log("skalfri-vakt (o98): funktionellt — fixture, absolut rot, ekvivalens");
{
  // Fixture-innehåll i delar: "exe" + "cSync(…)" — svitfilen själv bär aldrig
  // en komplett fyndrad (se DESIGNVAL ovan).
  const RAD_FARLIG = ["exe", "cSync(`git ${namn}`);"].join("");
  const tmpRot = fs.mkdtempSync(path.join(os.tmpdir(), "s8u3o96-skalfri-"));
  try {
    const fixtur = path.join(tmpRot, "fixturkat");
    const under = path.join(fixtur, "underkat");
    fs.mkdirSync(under, { recursive: true });
    fs.writeFileSync(path.join(fixtur, "farlig.mjs"), `const namn = "x";\n${RAD_FARLIG}\n`);
    fs.writeFileSync(path.join(fixtur, "hardad.mjs"), `import { execFileSync } from "node:child_process";\nexecFileSync("git", ["status"]);\n`);
    fs.writeFileSync(path.join(under, "fast.mjs"), `import { execSync } from "node:child_process";\nexecSync('git status');\n`);
    fs.writeFileSync(path.join(under, "ignoreras.txt"), `${RAD_FARLIG}\n`); // fel ändelse: ska ej skannas

    const { jagaSkalfri } = await import(VERKTYG);

    // o96-kurens kärna: ABSOLUT rot (kraschade med ENOENT före kur)
    const abs = jagaSkalfri([fixtur]);
    KOLL("absolut rot: 3 filer skannade", abs.skannade === 3, `fick ${abs.skannade}`);
    KOLL("absolut rot: 1 FYND (interpolerad mall)", abs.fynd.length === 1 && abs.fynd[0].fil.endsWith("farlig.mjs"), JSON.stringify(abs.fynd.map((f) => f.fil)));
    KOLL("absolut rot: 1 HÄRDAD (arrayform)", abs.hardade.length === 1 && abs.hardade[0].fil.endsWith("hardad.mjs"), `fick ${abs.hardade.length}`);
    KOLL("absolut rot: 1 FAST (rekursion underkat)", abs.fasta.length === 1 && abs.fasta[0].fil.endsWith("underkat/fast.mjs"), `fick ${abs.fasta.length}`);
    KOLL("absolut rot: fyndtexten är farliga raden", abs.fynd[0].text.includes("git ${namn}"), abs.fynd[0].text);
    KOLL("filändelses filtret: .txt oskannad", !abs.fynd.some((f) => f.fil.endsWith(".txt")) && !abs.fasta.some((f) => f.fil.endsWith(".txt")), "");

    // Ekvivalens: relativ rot (mot cwd) ger samma klassning — bakåtkompatibelt
    const fd = process.cwd();
    process.chdir(tmpRot);
    let rel;
    try {
      rel = jagaSkalfri(["fixturkat"]);
    } finally {
      process.chdir(fd);
    }
    KOLL(
      "ekvivalens absolut/relativ: samma klassning",
      rel.skannade === abs.skannade && rel.fynd.length === abs.fynd.length && rel.hardade.length === abs.hardade.length && rel.fasta.length === abs.fasta.length,
      `abs ${abs.skannade}/${abs.fynd.length}/${abs.hardade.length}/${abs.fasta.length} mot rel ${rel.skannade}/${rel.fynd.length}/${rel.hardade.length}/${rel.fasta.length}`,
    );

    // Import-säkerhet: modulen startar INTE skanning vid import (o80-precedensen)
    const imp = spawnSync(process.execPath, ["-e", `import(${JSON.stringify(pathToFileURL(VERKTYG).href)}).then(() => console.log("IMPORT-OK"))`], { encoding: "utf8", timeout: 30_000 });
    KOLL("import startar ingen skanning (main-guard)", imp.status === 0 && (imp.stdout || "").includes("IMPORT-OK") && !(imp.stdout || "").includes("skalfri-vakt:"), `exit ${imp.status} utdata ${(imp.stdout || "") + (imp.stderr || "")}`.slice(0, 160));
  } finally {
    fs.rmSync(tmpRot, { recursive: true, force: true });
  }
}

console.log("skalfri-vakt (o98): CLI-kontrakt — pumpornas 05:06-rop orört");
{
  const RAD_FARLIG = ["exe", "cSync(`git ${namn}`);"].join("");
  const tmpRot = fs.mkdtempSync(path.join(os.tmpdir(), "s8u3o96-cli-"));
  try {
    const medFynd = path.join(tmpRot, "medfynd");
    const rent = path.join(tmpRot, "rent");
    fs.mkdirSync(medFynd, { recursive: true });
    fs.mkdirSync(rent, { recursive: true });
    fs.writeFileSync(path.join(medFynd, "farlig.mjs"), `const namn = "x";\n${RAD_FARLIG}\n`);
    fs.writeFileSync(path.join(rent, "hardad.mjs"), `import { execFileSync } from "node:child_process";\nexecFileSync("git", ["status"]);\n`);

    const absKor = spawnSync(process.execPath, [VERKTYG, medFynd], { encoding: "utf8", timeout: 60_000 });
    KOLL("CLI absolut rot: exit 1 vid fynd", absKor.status === 1, `exit ${absKor.status}`);
    KOLL("CLI absolut rot: FYND-rad i utdata", (absKor.stdout || "").includes("FYND"), (absKor.stdout || "").slice(0, 160));

    const renKor = spawnSync(process.execPath, [VERKTYG, rent], { encoding: "utf8", timeout: 60_000 });
    KOLL("CLI rent träd: exit 0", renKor.status === 0, `exit ${renKor.status}: ${(renKor.stdout || "") + (renKor.stderr || "")}`.slice(0, 160));
    KOLL("CLI rent träd: GRÖN-rad", (renKor.stdout || "").includes("GRÖN"), (renKor.stdout || "").slice(0, 160));

    const jsonFil = path.join(tmpRot, "rapport.json");
    const jsonKor = spawnSync(process.execPath, [VERKTYG, medFynd, "--json", jsonFil, "--tyst"], { encoding: "utf8", timeout: 60_000 });
    const j = fs.existsSync(jsonFil) ? JSON.parse(fs.readFileSync(jsonFil, "utf8")) : null;
    KOLL("CLI --json + --tyst: rapport skriven med rätt innehåll", j !== null && j.fynd === 1 && j.skannadeFiler === 1 && (jsonKor.stdout || "") === "", `exit ${jsonKor.status} json ${j ? j.fynd + "/" + j.skannadeFiler : "saknad"}`);

    const felKor = spawnSync(process.execPath, [VERKTYG, "--flaga-som-inte-finns"], { encoding: "utf8", timeout: 60_000 });
    KOLL("CLI okänd flagga: exit 2", felKor.status === 2, `exit ${felKor.status}`);
  } finally {
    fs.rmSync(tmpRot, { recursive: true, force: true });
  }
}

console.log(`\nTOTALT: ${pass} PASS / ${fel} FAIL`);
process.exit(fel === 0 ? 0 : 1);
