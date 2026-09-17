#!/usr/bin/env node
/**
 * AK1A — Städning av dokumenterade tmp-ts-läckor (spår 8, o43)
 *
 * ROTORSAKA (bevisad 2026-09-16 23:19Z): verktyg/testa-demoklient-data.mjs
 * och verktyg/testa-morgonrond-data.mjs genererade tmp_*_koll.ts I REPOTS ROT
 * och städade i finally — finally överlever ej SIGKILL (RAM-vakten/fabrikens
 * 25-min-tak dödar barn). Den läckta filen fångas av tsconfig:s include-glob
 * (alla .ts-filer i trädet) ⇒ tsc exit 1 ⇒ pre-commit-grinden blockerar ALL
 * commit i trädet (falsklarm: mätkollision i arbetsTRÄDET, inte kodbrott).
 *
 * KUREN har tre lager (o44): verktygen skriver numera i .tmp/ + tsconfig
 * exclude; ROT-zonens städare ägs av verktyg/tmp-stad.mjs (s8-u2 — ropas av
 * pre-commit-grinden FÖRE typmätningen och av kvalitetsvakten sektion 11).
 * DENNA städare är .tmp-zonens komplement (zonsopare, ALDRIG rot — se
 * kollisionsnotis data/vakten/s8-tmpskydd-kollisions-notis-u2.md): den sopar
 * GAMLA signaturbärande läckor i .tmp/ (exit-mossning: process.exit inuti
 * try mossar finally i Node — bevisat 2026-09-17; SIGKILL samma effekt).
 *
 * SÄKERHETSKONTRAKT (hårda):
 *   - Endast filer med namn ^tmp_[a-z0-9_]+\.ts$ överhuvudtaget kandidater
 *     (fabrikens v150- och s2-KVD-skript i .tmp/ matchar ALDRIG namnet).
 *   - Signaturkrav: filen BÖRJAR med "// tmp_" OCH innehåller EXAKT
 *     "GENERERAD av verktyg/" OCH "Raderas efter körning" (de genererade
 *     filernas egna header). Främmande innehåll ⇒ SKONAD och protokollförd.
 *   - REPO-ROTen rörs ALDRIG (tmp-stad.mjs:s zon).
 *   - .tmp-filer städas först när de är äldre än --alder-ms (default 6 h)
 *     — en pågående svits fil (timeout 240 s) skonas.
 *
 * Användning:  node verktyg/stada-tmp-ts.mjs [--torr] [--json] [--alder-ms N]
 * Avslutskod:  0 alltid när städningen kunde köras (främmande filer är
 *              varningsrader — de ägs av sin skapare; rot-zonen ägs av
 *              tmp-stad.mjs).
 */
import { existsSync, readdirSync, readFileSync, statSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NAMN_RE = /^tmp_[a-z0-9_]+\.ts$/;
const SIGNATUR_PREFIX = "// tmp_";
const SIGNATUR_GENERERAD = "GENERERAD av verktyg/";
const SIGNATUR_RADERAS = "Raderas efter körning";
const DEFAULT_ALDER_MS = 6 * 3600_000;

function arSignaturkorrekt(fil) {
  let huvud = "";
  try {
    // Läs bara filens huvud — signaturraden är rad 1 i varje genererad fil.
    const text = readFileSync(fil, "utf8");
    huvud = text.slice(0, 400);
  } catch {
    return false; // oläsbar ⇒ aldrig raderad av städaren
  }
  return huvud.startsWith(SIGNATUR_PREFIX) && huvud.includes(SIGNATUR_GENERERAD) && huvud.includes(SIGNATUR_RADERAS);
}

/**
 * Kärna — exporteras för kvalitetsvakten (sektion 11) och testsviten.
 * Returnerar { stadade, skonadeSignatur, skonadeUnga, rot, tmpKatalog }.
 *   stadade:        [{ fil, orsak }] — borttagna läckor
 *   skonadeSignatur:[{ fil, orsak }] — tmp-namn men FRÄMMANDE innehåll (rörs ej)
 *   skonadeUnga:    [{ fil, orsak }] — .tmp-filer yngre än alderMs (pågående svit)
 */
export function stadaTmpTs({ repoRot = REPO, alderMs = DEFAULT_ALDER_MS, torr = false } = {}) {
  const stadade = [];
  const skonadeSignatur = [];
  const skonadeUnga = [];
  const tmpKatalog = path.join(repoRot, ".tmp");

  // ZONAVTAL (kollisionsnotis s8-tmpskydd-kollisions-notis-u2.md): ROT-zonens
  // läckor ägs av verktyg/tmp-stad.mjs (ropas av pre-commit + vakten sektion
  // 11) — denna städare röR ALDRIG repo-roten. Dess zon är .tmp/: gamla
  // engångsfiler från avbrutna körningar (exit-mossning/SIGKILL); en fil
  // från en PÅGÅENDE svit (tsx-timeout 240 s) är yngre än gränsen och skonas.
  for (const namn of existsSync(tmpKatalog) ? readdirSync(tmpKatalog) : []) {
    if (!NAMN_RE.test(namn) || !statSync(path.join(tmpKatalog, namn)).isFile()) continue;
    const fil = path.join(tmpKatalog, namn);
    if (!arSignaturkorrekt(fil)) {
      skonadeSignatur.push({ fil: `.tmp/${namn}`, orsak: "tmp-namn men FRÄMMANDE innehåll — protokollförd, RÖRS EJ" });
      continue;
    }
    const alder = Date.now() - statSync(fil).mtimeMs;
    if (alder < alderMs) {
      skonadeUnga.push({ fil: `.tmp/${namn}`, orsak: `yngre än gränsen (${Math.round(alder / 60_000)} min < ${Math.round(alderMs / 60_000)} min) — pågående svit?` });
      continue;
    }
    if (!torr) unlinkSync(fil);
    stadade.push({ fil: `.tmp/${namn}`, orsak: `gammal .tmp-läcka (${Math.round(alder / 60_000)} min) — signaturverifierad` });
  }

  return { stadade, skonadeSignatur, skonadeUnga, rot: repoRot, tmpKatalog };
}

// ── CLI ─────────────────────────────────────────────────────────────────────
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const torr = args.includes("--torr");
  const json = args.includes("--json");
  const alderIx = args.indexOf("--alder-ms");
  const alderMs = alderIx >= 0 && args[alderIx + 1] && Number.isFinite(Number(args[alderIx + 1])) ? Number(args[alderIx + 1]) : DEFAULT_ALDER_MS;

  const r = stadaTmpTs({ torr, alderMs });

  if (json) {
    console.log(JSON.stringify(r, null, 2));
  } else {
    for (const s of r.stadade) console.log(`STÄDAD  ${s.fil} — ${s.orsak}${torr ? " (TORR LÄGE — ej raderad)" : ""}`);
    for (const s of r.skonadeSignatur) console.log(`VARNING  ${s.fil} — ${s.orsak}`);
    for (const s of r.skonadeUnga) console.log(`SKONAD   ${s.fil} — ${s.orsak}`);
    if (r.stadade.length + r.skonadeSignatur.length + r.skonadeUnga.length === 0) {
      console.log("tmp-städning (o44): 0 läckor — trädet rent");
    }
  }
  process.exit(0);
}
