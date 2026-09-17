#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════════════
// testa-tmp-stad.mjs — svit för verktyg/tmp-stad.mjs (spår 8, gap 5 kö 1)
//
// Bevisar städarens KIRURGI: den raderar ENBART signaturverifierade,
// icke-git-trackade tmp-genererade filer DIREKT i roten — allt annat skonas.
// Fixtures lever i mkdtemp-kataloger under OS:ets tmp (ALDRIG i repo-roten —
// sviten är själv immun mot den klass den vaktar: en SIGKILL-dödad svit-
// körning kan inte läcka något som tsc typar).
//
//   node verktyg/testa-tmp-stad.mjs
// ════════════════════════════════════════════════════════════════════════════
import { mkdirSync, mkdtempSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { stadaTmpFiler } from "./tmp-stad.mjs";

const SKRIPT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "tmp-stad.mjs");
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SIGNATURFIXTUR = (namn, avisare) =>
  `// ${namn} — GENERERAD av verktyg/${avisare}. Raderas efter körning.\nexport const x = 1;\n`;

let pass = 0;
let fail = 0;
const feler = [];

function kolla(id, villkor, beskrivning) {
  if (villkor) {
    pass++;
    console.log(`  PASS ${id}: ${beskrivning}`);
  } else {
    fail++;
    feler.push(id);
    console.log(`  FAIL ${id}: ${beskrivning}`);
  }
}

function nyTempRot() {
  const rot = mkdtempSync(path.join(os.tmpdir(), "tmp-stad-svit-"));
  spawnSync("git", ["init", "-q"], { cwd: rot });
  return rot;
}

console.log("[testa-tmp-stad] svit för signaturverifierad tmp-städning — 12 fall\n");

// ── A: äkta läcka städas; torr-läge raderar inte ────────────────────────────
{
  const rot = nyTempRot();
  writeFileSync(path.join(rot, "tmp_demoklient_koll.ts"), SIGNATURFIXTUR("tmp_demoklient_koll.ts", "testa-demoklient-data.mjs"), "utf8");

  const torrRun = stadaTmpFiler({ rot, torr: true });
  kolla("A1", torrRun.stadade.length === 1 && existsSync(path.join(rot, "tmp_demoklient_koll.ts")), "torr-läge hittar läckan men raderar INGENTING");

  const run = stadaTmpFiler({ rot });
  kolla("A2", run.stadade.length === 1 && !existsSync(path.join(rot, "tmp_demoklient_koll.ts")), "signaturverifierad untracked tmp_*.ts i roten RADERAS");
  kolla("A3", run.skonade.length === 0, "äkt läcka ger inga skonade");

  const run2 = stadaTmpFiler({ rot });
  kolla("A4", run2.stadade.length === 0 && run2.skonade.length === 0, "idempotens: omkörning på städad rot = noll fynd");
  rmSync(rot, { recursive: true, force: true });
}

// ── B: allt okänd/ägt skonas ────────────────────────────────────────────────
{
  const rot = nyTempRot();
  // B1: staggad tmp-fil (git add) — git-sanningen rörs aldrig
  writeFileSync(path.join(rot, "tmp_staggad_koll.ts"), SIGNATURFIXTUR("tmp_staggad_koll.ts", "sviten.mjs"), "utf8");
  spawnSync("git", ["add", "tmp_staggad_koll.ts"], { cwd: rot });
  // B2: signaturlös tmp-fil — okänd ägare
  writeFileSync(path.join(rot, "tmp_okand.ts"), "// ingen signatur alls\nexport const y = 2;\n", "utf8");
  // B3: fil i underkatalog — rot-nivå gäller
  mkdirSync(path.join(rot, "under"));
  writeFileSync(path.join(rot, "under", "tmp_grann.ts"), SIGNATURFIXTUR("tmp_grann.ts", "sviten.mjs"), "utf8");
  // B5: staggat manifest
  writeFileSync(path.join(rot, "tmp_staggat_manifest.json"), "{}", "utf8");
  spawnSync("git", ["add", "tmp_staggat_manifest.json"], { cwd: rot });
  // C1: vanlig rotfil utan tmp-namn
  writeFileSync(path.join(rot, "las.ts"), "export const z = 3;\n", "utf8");

  const run = stadaTmpFiler({ rot });
  const namn = (arr) => arr.map((s) => s.fil || s).join(",");
  kolla("B1", run.stadade.length === 0 && run.skonade.some((s) => s.fil === "tmp_staggad_koll.ts"), "staggad (git-trackad) tmp-fil SKONAS");
  kolla("B2", run.skonade.some((s) => s.fil === "tmp_okand.ts" && s.orsak.includes("signaturlös")), "signaturlös tmp-fil SKONAS (okänd ägare)");
  kolla("B3", existsSync(path.join(rot, "under", "tmp_grann.ts")) && !run.stadade.includes("tmp_grann.ts"), "tmp-fil i underkatalog ORÖRD (endast roten städas)");
  kolla("B5", run.skonade.some((s) => s.fil === "tmp_staggat_manifest.json"), "staggat manifest SKONAS");
  kolla("C1", existsSync(path.join(rot, "las.ts")) && !run.stadade.includes("las.ts"), "vanlig rotfil utan tmp-namn ORÖRD");
  kolla("D1", run.stadade.length === 0 && namn(run.stadade) === "", "samtliga B-fixtures: noll raderade i skyddsfallen");
  rmSync(rot, { recursive: true, force: true });
}

// ── B4: manifest (JSON kan inte bära signatur) städas via namnmönster ──────
{
  const rot = nyTempRot();
  writeFileSync(path.join(rot, "tmp_import_oversattning_manifest.json"), '{"poster":[]}', "utf8");
  const run = stadaTmpFiler({ rot });
  kolla("B4", run.stadade.length === 1 && !existsSync(path.join(rot, "tmp_import_oversattning_manifest.json")), "untracked tmp_*_manifest.json städas (generatörernas manifestklass)");
  rmSync(rot, { recursive: true, force: true });
}

// ── E: CLI-kontraktet ───────────────────────────────────────────────────────
{
  const rot = nyTempRot();
  writeFileSync(path.join(rot, "tmp_cli_koll.ts"), SIGNATURFIXTUR("tmp_cli_koll.ts", "testa-cli.mjs"), "utf8");
  const cli1 = spawnSync(process.execPath, [SKRIPT, "--rot", rot, "--torr"], { encoding: "utf8" });
  kolla("E1", cli1.status === 0 && cli1.stdout.includes("torr-läge") && existsSync(path.join(rot, "tmp_cli_koll.ts")), "CLI --torr: exit 0, deklarerar torr-läge, raderar ej");

  const cli2 = spawnSync(process.execPath, [SKRIPT, "--rot", rot], { encoding: "utf8" });
  kolla("E2", cli2.status === 0 && cli2.stdout.includes("RADERADE") && !existsSync(path.join(rot, "tmp_cli_koll.ts")), "CLI utan flaggor: städar + transparent RADERADE-rad");

  const cli3 = spawnSync(process.execPath, [SKRIPT, "--rot", rot], { encoding: "utf8" });
  kolla("E3", cli3.status === 0 && cli3.stdout.trim() === "", "CLI tyst + exit 0 vid noll fynd (pre-commit ska inte brusa)");
  rmSync(rot, { recursive: true, force: true });
}

// ── F: levande repo-sond (kontrakt, ej svaghetslarm för pågående syskon) ────
{
  const sond = stadaTmpFiler({ torr: true });
  kolla("F1", Array.isArray(sond.stadade) && Array.isArray(sond.skonade) && sond.fel === undefined, `levande sond på AK1-roten: välformad svar (fynd just nu: ${sond.stadade.length} städbara, ${sond.skonade.length} skonade — pre-commit/grind städar ev. läckor vid nästa commit)`);
}

console.log(`\n[testa-tmp-stad] ${pass} PASS / ${fail} FAIL`);
if (fail > 0) {
  console.error(`SVITEN RÖD: fall ${feler.join(", ")} misslyckades`);
  process.exit(1);
}
console.log("SVITEN GRÖN — städarens kirurgi bevisad: signatur + untracked + rot-nivå = raderas; trackad/signaturlös/grann/vanlig fil = skonas.");
process.exit(0);
