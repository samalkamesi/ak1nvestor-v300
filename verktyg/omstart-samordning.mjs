#!/usr/bin/env node
/**
 * VÅG 216 — OMSTART-SAMORDNING (rond 113 [Φ]).
 *
 * Rotbevis 2026-09-20 08:41: målhjärtat och pulsvakten pm2-omstartade
 * appen inom samma minut — kanalerna ORSAKADE själva det
 * ECONNREFUSED-larm de sedan läkte, och hjärtats pm2-race kastade sig
 * genom mål-kirurgin (V215-vaccinet täcker följden, inte roten).
 *
 * EN ägare per omstart:
 *   1. Deploybygget äger pm2 medan /tmp/ak1a-deploy.lock hålls (rond 50:
 *      en extra omstart mitt i npm ci+build dödar appen).
 *   2. Senaste omstarten journaliseras trädoberoende i /tmp — en annan
 *      kanal inom 3 min vägras (dubbelomstart = 08:41-fallet).
 *
 * Användning:
 *   import { samordnadOmstart, deployPagar } from "./omstart-samordning.mjs";
 *   const om = samordnadOmstart("malhjarta", "frusen turn 49 min", logga);
 *   // om.startad=true ⇒ omstarten skedde; false + om.skal talar om varför.
 *
 * Journalen skrivs FÖRE pm2-anropet — en samtidigt startande kanal ser
 * den även mitt i fönstret. pm2-anropet i execFileSync-arrayform (o116
 * K2-mall: förlustfritt, ingen tolkning av skal-metatecken).
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

export const JOURNAL_SOKVAG = "/tmp/ak1a-omstart-journal.json";
export const SKIP_FONSTER_MS = 3 * 60_000;

/** Hålls deploylåset? (flock-probe: -n lyckas bara när låset är fritt.) */
export function deployPagar() {
  try {
    execFileSync("flock", ["-n", "/tmp/ak1a-deploy.lock", "-c", "true"], {
      timeout: 5000,
      stdio: "ignore",
    });
    return false;
  } catch {
    return true;
  }
}

/**
 * Samordnad pm2-omstart av ak1a. Returnerar {startad, skal?, senaste?, fel?}.
 * ALDRIG kast — anroparen (hjärtat) fortsätter alltid sin mål-kirurgi.
 */
export function samordnadOmstart(kanal, orsak, logga = () => {}) {
  if (deployPagar()) {
    logga(`OMSTART-SAMORDNING: deploybygg pågår — omstart uppskjuten (${kanal}: ${orsak})`);
    return { startad: false, skal: "deploy" };
  }
  let senaste = null;
  try {
    senaste = JSON.parse(readFileSync(JOURNAL_SOKVAG, "utf8"));
  } catch {
    /* ingen journal än = första omstarten */
  }
  const alder = senaste ? Date.now() - senaste.ts : Infinity;
  if (senaste && alder < SKIP_FONSTER_MS && senaste.kanal !== kanal) {
    logga(
      `OMSTART-SAMORDNING: ${senaste.kanal} omstartade för ${Math.round(alder / 1000)} s sedan — dubbelomstart vägras (${kanal}: ${orsak})`,
    );
    return { startad: false, skal: "annan-kanal", senaste };
  }
  try {
    writeFileSync(
      JOURNAL_SOKVAG,
      JSON.stringify({ kanal, orsak: String(orsak).slice(0, 120), ts: Date.now() }) + "\n",
    );
    execFileSync("pm2", ["restart", "ak1a", "--update-env"], {
      timeout: 90_000,
      stdio: "ignore",
    });
    return { startad: true };
  } catch (e) {
    return { startad: false, fel: String(e?.message || e).slice(0, 150) };
  }
}
