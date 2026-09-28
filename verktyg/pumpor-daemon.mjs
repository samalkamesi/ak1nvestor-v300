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
 *   · juridikgrind    min==37      (varje timme — före styrelserondens :43)
 *   · gränssnittsvakt min==17 && timme%6==1  (01:17, 07:17, 13:17, 19:17)
 *   · integritetsvakt min==47 && timme%6==4  (04:47, 10:47, 16:47, 22:47 —
 *     var 6:e timme OFFSET mot gränssnittsvakten; mega g5, styrelsens beslut 5)
 *   · ISR-värmare     03:10 dagligen · data-hygien 03:33 söndagar
 *
 * pm2: startas som ak1a-pumpor (pm2 save) — superviserad, självläker.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { byggTickMatning } from "./pumpor-tick-matning.mjs"; // o140: tick-svält-instrument (o136 §6.3)

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const senasteKorning = new Map(); // namn → ts (dedup inom samma minut)
// o140: mäter varje tick (drift + event-loop) — tröskelträff ⇒ TICK-SVÄLT-rad
// med resurskontext i pm2-loggen; kastar ALDRIG (daemonen lever alltid).
const tickMatning = byggTickMatning({ logga });

function logga(rad) {
  console.log(`${new Date().toISOString().slice(11, 19)} ${rad}`);
}

/** Skript-/bash-körning: child-krasch dödar ALDRIG daemonen. */
function kör(kommando, args, cwd = ROT) {
  // v192 (r287 2026-09-28): stdio "ignore" — INTE "inherit". r285:s
  // frysningar (03:22→03:27, 03:29→03:39; state S + ep_poll, inga barn)
  // har sin mest sannolika rot i pipe-backpressure: barnen ärver daemonens
  // stdout-pipe till pm2:s God-daemon, byggfloder (prod-synk → npm →
  // next-build) fyller pipan under tung last och daemonens EGEN console.log
  // blockerar då event-loopen i kernelläge. Varje verktyg loggar själv på
  // disk — pm2-loggen behåller daemonens ▶-rader + exit-koder, exakt det
  // som pumpor-hundvakten (verktyg/pumpor-hundvakt.mjs) bevakar som puls.
  const barn = spawn(kommando, args, { cwd, stdio: "ignore" });
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

/** VÅG 166: minutprecis variant — automation-motorn FÅR ALDRIG missa en
 *  cron-minut på grund av 2-min-dedupen (bevisat: E2E-sloten 12:30 föll
 *  mellan 12:28:35 och 12:31:05). 55 s-dedup = en körning per minut. */
function korMinutvis(namn, kommando, args, cwd) {
  const nu = Date.now();
  const sist = senasteKorning.get(namn) ?? 0;
  if (nu - sist < 55_000) return;
  senasteKorning.set(namn, nu);
  logga(`▶ ${namn}`);
  kör(kommando, args, cwd);
}

function tick() {
  tickMatning.tick(); // o140: FÖRE schemat — tick-callbackens egen puls mäts ren
  const d = new Date();
  const min = d.getMinutes();
  const tim = d.getHours();
  const dag = d.getDay();

  if (min % 10 === 1) korEnGang("hjärtslag", "node", ["verktyg/mal-hjartslag.mjs"]);
  if (min % 10 === 4) korEnGang("kraschvakt", "node", ["verktyg/kraschvakt.mjs"]);
  if (min % 10 === 5) korEnGang("agentfabrik", "node", ["verktyg/agentfabrik.mjs"]);
  if (min % 10 === 7) korEnGang("prod-synk", "node", ["verktyg/prod-synk.mjs"]);
  if (min % 10 === 8) korEnGang("evighetsmotor", "node", ["verktyg/evighetsmotor.mjs"]);
  if (min % 10 === 9) korEnGang("konfigintegritet", "node", ["verktyg/konfigintegritet-vakt.mjs"]); // v166: automation-motorn varje tick — mikrosekunder när inget förfaller
  korMinutvis("automation-motor", "node", ["verktyg/automation-motor.mjs"]); // beslut 6: crontab + pm2 mot git-referens (data/infra/konfig-referens) — GRÖN/larm till data/vakten/konfig-larm.jsonl
  if (min === 37) korEnGang("juridikgrind", "node", ["verktyg/juridikgrind-vakt.mjs"]); // rådsförbudsscan FÖRE FLYTTKLAR (mega g2) — körs alltid före rondens :43
  if (min === 43 && tim % 3 === 1) korEnGang("styrelserond", "node", ["verktyg/styrelse-rond.mjs"]);
  if (min === 17 && tim % 6 === 1) korEnGang("gränssnittsvakt", "node", ["verktyg/vakt-cron.mjs"]);
  if (min === 47 && tim % 6 === 4) korEnGang("integritetsvakt", "node", ["verktyg/integritetsvakt.mjs"]); // BUILD_ID + 5xx FÖRE kundens ögon (mega g5) — 3,5 h efter gränssnittsvakten
  if (min === 23 && tim % 6 === 4) korEnGang("minnesberedare", "node", ["verktyg/minnesberedare.mjs"]);
  if (min === 52 && tim % 6 === 2) korEnGang("backup-offsite", "node", ["verktyg/backup-offsite.mjs"]);
  if (tim === 3 && min === 10) korEnGang("ISR-värmare", "bash", ["data/infra/contabo/ak1a-varm.sh"]);
  if (tim === 4 && min === 41) korEnGang("ra-gallring", "curl", ["-s", "-m", "120", "-H", "Host: lab.ak1nvestor.com", "http://127.0.0.1/api/cron/rapportakademin-gallring"]); // v169: GDPR art 5.1 e — BESLUT 1.2:s automatiska gallring får sin motor (dagligen; idempotent)
  if (tim === 4 && min === 44) korEnGang("scenariotest", "node", ["verktyg/testa-studio-scenarion.mjs"]);
  if (min % 15 === 12) korEnGang("feljagaren", "node", ["verktyg/feljagaren.mjs"]);
  if (dag === 0 && tim === 3 && min === 33) korEnGang("data-hygien", "node", ["verktyg/data-hygien.mjs"]);
  // Spår 8-vaktinstrumentens triggers (o21/o22/o26-bokningarna, infriade
  // 2026-09-16): ett instrument utan pump-rad är mätblint i drift — o22:s
  // kvalitetsvakt var triggerlös 6 dagar och åt en 09-10-rapport som sanning.
  if (min % 10 === 0) korEnGang("larm-eskalering", "node", ["verktyg/larm-eskalering.mjs"]); // o26 §5: minuten efter konfigintegritetens :x9 — upprepade larm ⟶ eskalering (o22-nattens 30 ignoreringar)
  if (tim === 5 && min === 6) korEnGang("skalfri-vakt", "node", ["verktyg/skalfri-vakt.mjs", "--json", "data/vakten/skalfri-senaste.json"]); // o21: daglig kodhälsa i väktardomänen (exec-härdningens vakt)
  if (tim === 7 && min === 2) korEnGang("kvalitetsvakt", "node", ["verktyg/kvalitetsvakt.mjs"]); // o22: färsk rapport före 07:43-ronden (SENASTE-filen gitignore:ad — ingen daglig ytsmuts)
}

logga("TICK-MÄTNING aktiv (o140) — trösklar: drift 2000 ms · event-loop 1000 ms · rad: TICK-SVÄLT {json} (till pm2-loggen)");
logga("PUMPOR-DAEMONEN v2 (klockstyrd) startar — scheman: hjärta :x1 · kraschvakt :x4 · agentfabrik :x5 · synk :x7 · evighetsmotor :x8 · konfigintegritet :x9 · larm-eskalering :x0 · juridikgrind :37 · rond xx:43/3h · vakt xx:17/6h · integritetsvakt xx:47/6h (offset) · minnesberedare xx:23/6h · värmare 03:10 · ra-gallring 04:41 · scenariotest 04:44 · skalfri-vakt 05:06 · kvalitetsvakt 07:02 · hygien sö 03:33");
logga("v192: barnens stdio avkopplad (pipe-backpressure-kuran, r287) — pulsen bevakas av pumpor-hundvakten (tystnad > 3 min ⇒ omstart-eskalering)");
setInterval(tick, 30_000);
tick(); // första kontrollen direkt
