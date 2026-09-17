#!/usr/bin/env node
/**
 * AK1A — Test av verktyg/stada-tmp-ts.mjs (spår 8, o43)
 *
 * Säkerts kontrakt: städaren får INTE radera något utanför den
 * signaturverifierade tmp-klassen. Alla fixturer byggs i en OS-tempkatalog
 * (mkdtemp) — ALDRIG i repot.
 *
 * Användning: node verktyg/testa-stada-tmp-ts.mjs
 * Avslutskod: 0 = alla PASS, 1 = minst ett FAIL.
 */
import { existsSync, mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stadaTmpTs } from "./stada-tmp-ts.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HEADER = (fil) => `// ${fil} — GENERERAD av verktyg/testa-demoklient-data.mjs. Raderas efter körning.\n`;

let ok = 0;
let fail = 0;
function kolla(namn, villkor, detalj = "") {
  if (villkor) {
    ok += 1;
    console.log(`PASS ${namn}${detalj ? ` — ${detalj}` : ""}`);
  } else {
    fail += 1;
    console.log(`FAIL ${namn}${detalj ? ` — ${detalj}` : ""}`);
  }
}

// Fixturrot: REPOLIK struktur (rot + .tmp) i OS-temp — repot RÖRS ALDRIG.
const rot = mkdtempSync(path.join(tmpdir(), "ak1a-stada-tmp-"));
const tmpKat = path.join(rot, ".tmp");
mkdirSync(tmpKat);
function nyFil(kat, namn, innehall) {
  const fil = path.join(kat, namn);
  writeFileSync(fil, innehall, "utf8");
  return fil;
}

try {
  // 1) ZONAVTAL: repo-roten ägs av tmp-stad.mjs (s8-u2) — ÄVEN en
  //    signaturkorrekt rot-läcka lämnas ORÖRD av denna städare.
  const rotLacka = nyFil(rot, "tmp_demoklient_koll.ts", HEADER("tmp_demoklient_koll.ts") + "import x;\n");
  let r = stadaTmpTs({ repoRot: rot });
  kolla("1 rot-läcka lämnas orörd (zonavtal: roten ägs av tmp-stad.mjs)", existsSync(rotLacka) && r.stadade.length === 0);

  // 2) Rot-fil med tmp-namn men FRÄMMANDE innehåll ⇒ orörd och orapporterad
  const frammande = nyFil(rot, "tmp_viktigt.ts", "// min egen fil — RÖR EJ\nexport const x = 1;\n");
  r = stadaTmpTs({ repoRot: rot });
  kolla("2 främmande tmp-namn i rot orörd + orapporterad", existsSync(frammande) && !r.skonadeSignatur.some((s) => s.fil === "tmp_viktigt.ts"));

  // 3) .tmp: ung signaturfil (mtime nu) ⇒ skonas (pågående svit)
  const ung = nyFil(tmpKat, "tmp_morgonrond_koll.ts", HEADER("tmp_morgonrond_koll.ts"));
  r = stadaTmpTs({ repoRot: rot });
  kolla("3 ung .tmp-signaturfil skonas", existsSync(ung) && r.skonadeUnga.length === 1);

  // 4) .tmp: gammal signaturfil (mtime -7 h) ⇒ städas
  const gammal = nyFil(tmpKat, "tmp_akerlund_koll.ts", HEADER("tmp_akerlund_koll.ts"));
  const forrSjuTim = new Date(Date.now() - 7 * 3600_000);
  utimesSync(gammal, forrSjuTim, forrSjuTim);
  r = stadaTmpTs({ repoRot: rot });
  kolla("4 gammal .tmp-läcka städas", !existsSync(gammal) && r.stadade.some((s) => s.fil === ".tmp/tmp_akerlund_koll.ts"));

  // 5) .tmp: gammal främmande fil ⇒ skonas
  const gammalFrammande = nyFil(tmpKat, "tmp_hemlig.ts", "export const hemlighet = 42;\n");
  utimesSync(gammalFrammande, forrSjuTim, forrSjuTim);
  r = stadaTmpTs({ repoRot: rot });
  kolla("5 gammal främmande .tmp-fil skonas", existsSync(gammalFrammande) && r.skonadeSignatur.some((s) => s.fil === ".tmp/tmp_hemlig.ts"));

  // 6) Filnamn UTANFÖR klassen ⇒ orörd (stora bokstäver, .md, utan prefix)
  const utanfor1 = nyFil(rot, "TMP_STOR.ts", HEADER("TMP_STOR"));
  const utanfor2 = nyFil(tmpKat, "tmp_anteckning.md", HEADER("tmp_anteckning"));
  const utanfor3 = nyFil(tmpKat, "koll_tmp.ts", HEADER("koll_tmp"));
  r = stadaTmpTs({ repoRot: rot });
  kolla("6 filnamn utanför tmp-klassen orörda", existsSync(utanfor1) && existsSync(utanfor2) && existsSync(utanfor3));

  // 7) Tomradeterminism: omkörning på städat läge ⇒ 0 nya städade
  r = stadaTmpTs({ repoRot: rot });
  kolla("7 omkörning städar inget nytt", r.stadade.length === 0);

  // 8) Torr läge: rapporterar men raderar ej
  const torrFil = nyFil(tmpKat, "tmp_torr_koll.ts", HEADER("tmp_torr_koll.ts"));
  utimesSync(torrFil, forrSjuTim, forrSjuTim);
  r = stadaTmpTs({ repoRot: rot, torr: true });
  kolla("8 torr läge raderar ej", existsSync(torrFil) && r.stadade.some((s) => s.fil === ".tmp/tmp_torr_koll.ts"));

  // 9) Kärnexporten är en funktion (vakten importerar den)
  kolla("9 stadaTmpTs är exporterad funktion", typeof stadaTmpTs === "function");

  // 10) Signaturkravets tre delar var för sig nödiga (prefix/genererad/raderas)
  const saknarGenererad = nyFil(tmpKat, "tmp_sig1.ts", "// tmp_sig1 — Raderas efter körning.\n");
  const saknarRaderas = nyFil(tmpKat, "tmp_sig2.ts", "// tmp_sig2 — GENERERAD av verktyg/x.mjs.\n");
  const saknarPrefix = nyFil(tmpKat, "tmp_sig3.ts", "/* tmp_sig3 — GENERERAD av verktyg/x.mjs. Raderas efter körning. */\n");
  utimesSync(saknarGenererad, forrSjuTim, forrSjuTim);
  utimesSync(saknarRaderas, forrSjuTim, forrSjuTim);
  utimesSync(saknarPrefix, forrSjuTim, forrSjuTim);
  r = stadaTmpTs({ repoRot: rot });
  kolla(
    "10 partiell signatur skonas ×3",
    existsSync(saknarGenererad) && existsSync(saknarRaderas) && existsSync(saknarPrefix)
      && r.skonadeSignatur.some((s) => s.fil === ".tmp/tmp_sig1.ts")
      && r.skonadeSignatur.some((s) => s.fil === ".tmp/tmp_sig2.ts")
      && r.skonadeSignatur.some((s) => s.fil === ".tmp/tmp_sig3.ts"),
  );

  // 11) Tomma kataloger ⇒ noll-läge utan krasch
  const tomRot = mkdtempSync(path.join(tmpdir(), "ak1a-stada-tom-"));
  r = stadaTmpTs({ repoRot: tomRot });
  kolla("11 tomt rot-läge ⇒ 0 städade", r.stadade.length === 0 && r.skonadeSignatur.length === 0 && r.skonadeUnga.length === 0);
  rmSync(tomRot, { recursive: true, force: true });

  // 12) CLI-läget: --torr + --json kör och svarar exit 0
  const { spawnSync } = await import("node:child_process");
  const cli = spawnSync(process.execPath, [path.join(REPO, "verktyg", "stada-tmp-ts.mjs"), "--torr", "--json"], { encoding: "utf8", timeout: 30_000 });
  let cliJson = null;
  try {
    cliJson = JSON.parse(cli.stdout);
  } catch {
    /* hanteras av kontrollen */
  }
  kolla("12 CLI --torr --json exit 0 med tolkbar kropp", cli.status === 0 && cliJson !== null && Array.isArray(cliJson.stadade));
} finally {
  rmSync(rot, { recursive: true, force: true });
}

console.log(`\nSUMMA: ${ok} PASS, ${fail} FAIL`);
process.exit(fail > 0 ? 1 : 0);
