#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════════════
// tmp-stad.mjs — signaturverifierad städning av genererade tmp-filer i roten
// Spår 8 (vakt), s8-u2 2026-09-17 — mekanisering av SYSTEMKARTAN gap 5 kö 1:
// "tmp-skydd mekaniseras i vakt/grind — annars kan varje SIGKILL-dödad
// svitkörning låsa ALLA commits tills manuell städning".
//
// ROTORSAKA (bevisad 2026-09-17 01:19): femton körskript (kor-*.mjs,
// testa-*.mjs, importera-oversattning.mjs) genererar tmp_*.ts i REPO-ROTen
// och tar bort dem i finally — men finally överlever INTE SIGKILL
// (fabrikens 25-min-tak / OOM / manuell kill). tsconfig inkluderar "**/*.ts"
// ⇒ en läcka typas av tsc ⇒ sektion 11 GUL + tsc-svit FAIL + pre-commit-
// grinden blockerar ALL commit (detta skedde: tmp_demoklient_koll.ts,
// TS2345, vakt GUL 23:19Z 2026-09-16, tre dagar efter att gapet bokats).
//
// KUR — kirurgisk, aldrig blint raderande. En fil städas ENDAST om ALLA gäller:
//   1. ligger DIREKT i repo-roten (underkataloger rörs aldrig),
//   2. namn matchar tmp_*.ts/.mts/.cts ELLER tmp_*_manifest.json
//      (generatörernas två filklasser; JSON kan inte bära kommentarsignatur),
//   3. är INTE git-trackad/staggad (git ls-files) — git-sanningen rörs aldrig,
//   4. ts-filer: första raden bär signaturen "GENERERAD av verktyg/"
//      (alla femton generatörerna skriver den; okända filer lämnas åt tsc
//      som blockerar TYDLIGT — grinden städar bara KÄNT engångsskräp).
//
// KONSUMENTER:
//   - verktyg/hooks/pre-commit FÖRE tsc (upplåsning: läcka ⇒ aldrig commit-lås)
//   - verktyg/kvalitetsvakt.mjs sektion 11 FÖRE tsc (daglig 07:02-självläkning,
//     transparent info-rad enligt o26-doktrinen: vakten döljer aldrig)
//
// CLI:  node verktyg/tmp-stad.mjs [--torr] [--rot <sökväg>]
//       tyst + exit 0 vid noll fynd (pre-commit ska inte brusa);
//       vid fynd skrivs en rad per klass (raderade resp. torr-läge).
// ════════════════════════════════════════════════════════════════════════════
import { readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SIGNATUR = "GENERERAD av verktyg/";
const TS_NAMN = /^tmp_[\w.-]+\.(ts|mts|cts)$/;
const MANIFEST_NAMN = /^tmp_[\w.-]+_manifest\.json$/;

// Trackade/staggade sökvägar i roten (git ls-files — ignorerade och untracked
// saknas i listan = städbara). I ett icke-git-träd (svitens fixturekatalog
// före git init) är listan tom: alla filer är då städbara enligt reglerna.
function trackadeFilmer(rot) {
  try {
    const sub = spawnSync("git", ["ls-files"], {
      cwd: rot,
      encoding: "utf8",
      timeout: 15_000,
    });
    if (sub.status !== 0 || !sub.stdout) return new Set();
    return new Set(sub.stdout.split("\n").filter(Boolean));
  } catch {
    return new Set();
  }
}

export function stadaTmpFiler({ rot = REPO, torr = false } = {}) {
  const stadade = [];
  const skonade = [];

  let filer;
  try {
    filer = readdirSync(rot);
  } catch {
    return { stadade, skonade, fel: `kunde inte läsa rot: ${rot}` };
  }
  const trackade = trackadeFilmer(rot);

  for (const namn of filer) {
    const full = path.join(rot, namn);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (!st.isFile()) continue;

    const arTs = TS_NAMN.test(namn);
    const arManifest = MANIFEST_NAMN.test(namn);
    if (!arTs && !arManifest) continue;

    if (trackade.has(namn)) {
      skonade.push({ fil: namn, orsak: "git-trackad/staggad" });
      continue;
    }

    if (arTs) {
      let forstaRad = "";
      try {
        forstaRad = readFileSync(full, "utf8").split("\n")[0] || "";
      } catch {
        skonade.push({ fil: namn, orsak: "oläsbar" });
        continue;
      }
      if (!forstaRad.includes(SIGNATUR)) {
        skonade.push({ fil: namn, orsak: "signaturlös (okänd ägare)" });
        continue;
      }
    }

    if (!torr) {
      try {
        rmSync(full, { force: true });
      } catch (e) {
        skonade.push({ fil: namn, orsak: `radering misslyckades: ${String(e?.message || e).slice(0, 80)}` });
        continue;
      }
    }
    stadade.push(namn);
  }

  return { stadade, skonade };
}

// ─── CLI ────────────────────────────────────────────────────────────────────
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const torr = process.argv.includes("--torr");
  const rotIx = process.argv.indexOf("--rot");
  const rot = rotIx >= 0 && process.argv[rotIx + 1] ? path.resolve(process.argv[rotIx + 1]) : REPO;
  const r = stadaTmpFiler({ rot, torr });

  if (r.fel) {
    console.error(`TMP-STÄD: FEL — ${r.fel}`);
    process.exit(1);
  }
  if (r.stadade.length > 0) {
    console.log(
      `TMP-STÄD: ${torr ? `${r.stadade.length} signaturverifierad(a) tmp-genererad(a) fil(er) funna (torr-läge, inget raderat)` : `${r.stadade.length} signaturverifierad(a) tmp-genererad(a) fil(er) RADERADE`}: ${r.stadade.join(", ")}`
    );
  }
  if (r.skonade.length > 0) {
    console.log(`TMP-STÄD: ${r.skonade.length} fil(er) skonade: ${r.skonade.map((s) => `${s.fil} (${s.orsak})`).join(", ")}`);
  }
  process.exit(0);
}
