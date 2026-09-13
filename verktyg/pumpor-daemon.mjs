#!/usr/bin/env node
/**
 * PUMPOR-DAEMONEN (våg 113) — alla 24/7-pumpar som ÉN pm2-process
 * =====================================================================
 * Bakgrund (2026-09-13): cron-daemonen slutade elda jobb vid 22:20 utan
 * att själv dö (crond aktiv, crontab hel, manuella körningar friska) —
 * nattens leveranser stannade. PM2 är däremot BEVISAT självläkande
 * (663 omstarter utan driftstopp). Därför: pumparna flyttas från crond
 * till denna pm2-daemon som schemalägger och ÅTERSTARTAR skripten:
 *
 *   · målhjärtslag    var 10:e minut        verktyg/mal-hjartslag.mjs
 *   · styrelserond    var 3:e timme (xx:43) verktyg/styrelse-rond.mjs
 *   · gränssnittsvakt var 6:e timme (xx:17) verktyg/vakt-cron.mjs
 *   · data-hygien     söndagar 03:33        verktyg/data-hygien.mjs
 *   · ISR-värmare     dagligen 03:10        data/infra/contabo/ak1a-varm.sh
 *
 * Installad: pm2 start verktyg/pumpor-daemon.mjs --name ak1a-pumpor && pm2 save
 * Logg: pm2 logs ak1a-pumpor (alla skript-utskrifter + schemat).
 * Kraschar ett skript: daemonen lever vidare (spawn, ej samma process) —
 * kraschar DAEMONEN: pm2 startar om den (supervisor). Vakter som vaktar.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NU = () => new Date();

function logga(rad) {
  console.log(`${NU().toISOString().slice(11, 19)} ${rad}`);
}

/** Kör ett skript (spawn — krasch i skriptet dödar aldrig daemonen). */
function kör(skript, args = []) {
  const barn = spawn("node", [path.join(ROT, "verktyg", skript), ...args], {
    cwd: ROT,
    stdio: "inherit",
  });
  barn.on("error", (e) => logga(`FEL vid start av ${skript}: ${String(e).slice(0, 100)}`));
  barn.on("exit", (kod) => logga(`${skript} slut kod=${kod ?? "?"}`));
}

/** Bash-skript (ISR-värmaren). */
function körBash(skript) {
  const barn = spawn("bash", [path.join(ROT, "data", "infra", "contabo", skript)], {
    cwd: ROT,
    stdio: "inherit",
  });
  barn.on("exit", (kod) => logga(`${skript} slut kod=${kod ?? "?"}`));
}

// ── Schemaläggning ──────────────────────────────────────────────────────────
// Hjärtat: var 10:e minut (förskjutet 1 min in — :01, :11, :21 … så det aldrig
// krockar exakt med ronder/vakt som ligger på :43/:17).
function planeraHjartslag() {
  const nu = NU();
  const nast = new Date(nu);
  nast.setSeconds(0, 0);
  nast.setMinutes(Math.floor(nu.getMinutes() / 10) * 10 + 1);
  if (nast <= nu) nast.setMinutes(nast.getMinutes() + 10);
  setTimeout(() => {
    kör("mal-hjartslag.mjs");
    planeraHjartslag();
  }, nast - nu);
  logga(`hjärtslag nästa: ${nast.toISOString().slice(11, 16)}`);
}

/** Rond var 3:e timme på :43. */
function planeraRond() {
  const nu = NU();
  const nast = new Date(nu);
  nast.setMinutes(43, 0, 0);
  while (nast <= nu) nast.setHours(nast.getHours() + 3);
  setTimeout(() => {
    kör("styrelse-rond.mjs");
    planeraRond();
  }, nast - nu);
  logga(`rond nästa: ${nast.toISOString().slice(11, 16)}`);
}

/** Vakt var 6:e timme på :17. */
function planeraVakt() {
  const nu = NU();
  const nast = new Date(nu);
  nast.setMinutes(17, 0, 0);
  while (nast <= nu) nast.setHours(nast.getHours() + 6);
  setTimeout(() => {
    kör("vakt-cron.mjs");
    planeraVakt();
  }, nast - nu);
  logga(`vakt nästa: ${nast.toISOString().slice(11, 16)}`);
}

/** Dagligen 03:10 ISR-värmare + söndagar 03:33 data-hygien. */
function planeraDagligen() {
  const nu = NU();
  const nast = new Date(nu);
  nast.setHours(3, 10, 0, 0);
  if (nast <= nu) nast.setDate(nast.getDate() + 1);
  setTimeout(() => {
    körBash("ak1a-varm.sh");
    if (nast.getDay() === 0) {
      // söndag — hygienen 23 min efter värmaren
      setTimeout(() => kör("data-hygien.mjs"), 23 * 60_000);
      logga("söndag: data-hygien schemalagd 03:33");
    }
    planeraDagligen();
  }, nast - nu);
  logga(`daglig värmare nästa: ${nast.toISOString().slice(0, 16)}`);
}

logga("PUMPOR-DAEMONEN startar — fem scheman, pm2-superviserad");
planeraHjartslag();
planeraRond();
planeraVakt();
planeraDagligen();
