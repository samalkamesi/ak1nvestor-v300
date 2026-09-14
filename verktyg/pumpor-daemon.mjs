#!/usr/bin/env node
/**
 * PUMPOR-DAEMONEN v2 (våg 124) — klockstyrd, omstart-tålig
 * =====================================================================
 * v1:s setTimeout-KEDJOR var sköra: en kraschad callback (15:43-ronden
 * 2026-09-13) dödade schemat tills nästa omstart. v2: var 30:e sekund
 * kollar daemonen KLOCKAN mot schemat — ingen kedja, inget att tappa;
 * omstart = schemat fortsätter av sig själv (missade slotar fångas upp
 * av hjärtat/rondernas egna självläkning).
 *
 * Scheman (lokal tid):
 *   · målhjärtslag    min%10==1  (xx:01, :11, :21, :31, :41, :51)
 *   · prod-synk       min%10==7  (xx:07, :17, :27, :37, :47, :57)
 *   · styrelserond    min==43 && timme%3==1  (01:43, 04:43, … 22:43)
 *   · gränssnittsvakt min==17 && timme%6==1  (01:17, 07:17, 13:17, 19:17)
 *   · ISR-värmare     03:10 dagligen · data-hygien 03:33 söndagar
 *
 * pm2: startas som ak1a-pumpor (pm2 save) — superviserad, självläker.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const senasteKorning = new Map(); // namn → ts (dedup inom samma minut)

function logga(rad) {
  console.log(`${new Date().toISOString().slice(11, 19)} ${rad}`);
}

/** Skript-/bash-körning: child-krasch dödar ALDRIG daemonen. */
function kör(kommando, args, cwd = ROT) {
  const barn = spawn(kommando, args, { cwd, stdio: "inherit" });
  barn.on("error", (e) => logga(`FEL vid start: ${String(e).slice(0, 100)}`));
  barn.on("exit", (kod) => logga(`${path.basename(args[0] ?? kommando)} slut kod=${kod ?? "?"}`));
}

function korEnGang(namn, kommando, args, cwd) {
  const nu = Date.now();
  const sist = senasteKorning.get(namn) ?? 0;
  if (nu - sist < 120_000) return; // redan körd inom 2 min (dedup)
  senasteKorning.set(namn, nu);
  logga(`▶ ${namn}`);
  kör(kommando, args, cwd);
}

function tick() {
  const d = new Date();
  const min = d.getMinutes();
  const tim = d.getHours();
  const dag = d.getDay();

  if (min % 10 === 1) korEnGang("hjärtslag", "node", ["verktyg/mal-hjartslag.mjs"]);
  if (min % 10 === 4) korEnGang("kraschvakt", "node", ["verktyg/kraschvakt.mjs"]);
  if (min % 10 === 5) korEnGang("agentfabrik", "node", ["verktyg/agentfabrik.mjs"]);
  if (min % 10 === 7) korEnGang("prod-synk", "node", ["verktyg/prod-synk.mjs"]);
  if (min % 10 === 8) korEnGang("evighetsmotor", "node", ["verktyg/evighetsmotor.mjs"]);
  if (min === 43 && tim % 3 === 1) korEnGang("styrelserond", "node", ["verktyg/styrelse-rond.mjs"]);
  if (min === 17 && tim % 6 === 1) korEnGang("gränssnittsvakt", "node", ["verktyg/vakt-cron.mjs"]);
  if (tim === 3 && min === 10) korEnGang("ISR-värmare", "bash", ["data/infra/contabo/ak1a-varm.sh"]);
  if (dag === 0 && tim === 3 && min === 33) korEnGang("data-hygien", "node", ["verktyg/data-hygien.mjs"]);
}

logga("PUMPOR-DAEMONEN v2 (klockstyrd) startar — scheman: hjärta :x1 · kraschvakt :x4 · agentfabrik :x5 · synk :x7 · evighetsmotor :x8 · rond xx:43/3h · vakt xx:17/6h · värmare 03:10 · hygien sö 03:33");
setInterval(tick, 30_000);
tick(); // första kontrollen direkt
