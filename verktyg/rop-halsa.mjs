#!/usr/bin/env node
/**
 * ROP-HÄLSA-SONDEN (o136, spår 8) — daemonens puls synliggjord
 * =====================================================================
 * ROTFYND (2026-09-20T22:4xZ, pm2-ut-logggravning): pumpor-daemonens rop-
 * kadens har ett bevakningsgap — organism-hälsan ser bara "online/offline"
 * (pm2-booles), och en HÄNGD eller tyst daemon (event loop fryst under
 * resurs_svält: byggen + agentvågor) är OSYNLIG tills den dör. Bevis:
 * 6 hel-tystnadsgap (94–203 s, samtliga roppar tysta) + 20 automation-
 * motor-missade slotar i aktuell epok (09-18 20:09Z → 09-21), varav 2 mitt
 * i byggfönster; pm2-alarm 0 (processen levde). o125:s "öken punkt"-
 * fråga (kraschvaktens 10 h tystnad) hade samma rot-EFFEKT men motsatt
 * orsak — mätning 2026-09-20: 66/66 kraschvakt-rop 02:04–12:54, max
 * avstånd 615 s ⇒ daemonen hjälpt, tystnaden var VAKTENS design-tystnad.
 *
 * Denna sond läser daemonens EGEN rop-logg (pm2 stdout-logg) och klassar:
 *   GRÖN        inga tystnadsgap alls i fönstret
 *   OBSERVATION 1–4 mikro-gap (< FYND-tröskeln) — höglast-klass, trenddata
 *   FYND        daemon-omstart i fönstret (pm2 behövde väcka den) ELLER
 *               hel-tystnad ≥ FYND-tröskeln (default 600 s) ELLER ≥ 5 gap
 *               ⇒ roppar har SAKNATS — vaktmaskinens täckning har hål
 *
 * Läser ENDAST filer (pm2-loggen + klockan): inga barnprocesser, ingen
 * nät — född mimosa-ren (o123-doktrinen: instrument föds i arrayform;
 * denna behöver ingen form alls). Import startar ALDRIG mätning (o80).
 *
 * Anrop: node verktyg/rop-halsa.mjs [--logg SÖKVÄG] [--fonster-timmar N]
 *        [--json UTFIL] [--tyst] [--minsta-tystnad S] [--fynd-tystnad S]
 *        [--max-observationer N]
 * Exit:  0 GRÖN/OBSERVATION · 1 FYND · 2 FEL (ologgbar/oparsabel logg)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const VERSION = "1.0.0";
export const STANDARD_LOGG = "/home/ak1a/.pm2/logs/ak1a-pumpor-out.log";

/** Daemonens täta scheman (sekunder) — endast dessa kadenser döms, glesa
 *  rop (rond 3 h, vakt 6 h …) lämnas till hel-tystnad-måttet. */
export const KADENSER = {
  "automation-motor": 60,
  kraschvakt: 600,
  hjärtslag: 600,
  "prod-synk": 600,
  agentfabrik: 600,
  evighetsmotor: 600,
  konfigintegritet: 600,
  "larm-eskalering": 600,
  feljagaren: 900,
};

const RAD_RE = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}):/;
const ROP_RE = /▶ (\S+)/;
const START_RE = /PUMPOR-DAEMONEN.*startar/;

/** Parsa daemon-loggen → {startar, rop} — ts i ms (konsekvent tolkning av
 *  pm2-prefixet; gap-matematiken skillnadsbaserad, offset-neutral). */
export function parsaNoggrann(rader) {
  const startar = [];
  const rop = [];
  for (const rad of rader) {
    const m = rad.match(RAD_RE);
    if (!m) continue;
    const ts = Date.parse(`${m[1]}T${m[2]}Z`);
    if (!Number.isFinite(ts)) continue;
    if (START_RE.test(rad)) startar.push(ts);
    const r = rad.match(ROP_RE);
    if (r) rop.push({ ts, namn: r[1] });
  }
  rop.sort((a, b) => a.ts - b.ts);
  startar.sort((a, b) => a - b);
  return { startar, rop };
}

/** Hel-tystnadsgap: avstånd mellan CONSECUTIVA rop (alla organ) — daemonens
 *  totala puls. Returnerar poster inom [fran, till]. */
export function hittaTystnadsgap(rop, fran, till, minstaSek) {
  const gap = [];
  let sist = null;
  for (const r of rop) {
    if (r.ts < fran) { sist = r; continue; }
    if (r.ts > till) break;
    if (sist !== null && sist.ts >= fran - 3_600_000) {
      const sek = (r.ts - sist.ts) / 1000;
      if (sek > minstaSek) {
        gap.push({
          sek: Math.round(sek),
          efter: new Date(sist.ts).toISOString().slice(0, 19),
          fore: new Date(r.ts).toISOString().slice(0, 19),
        });
      }
    }
    sist = r;
  }
  return gap;
}

/** Per-organ missade slotar: gap > 1,5× väntad kadens mellan samma organs
 *  rop i fönstret. Organ med < 2 rop i fönstret kan inte dömas. */
export function hittaOrganGap(rop, fran, till) {
  const poster = [];
  for (const [namn, vanta] of Object.entries(KADENSER)) {
    const egna = rop.filter((r) => r.namn === namn && r.ts >= fran && r.ts <= till);
    if (egna.length < 2) continue;
    for (let i = 1; i < egna.length; i++) {
      const sek = (egna[i].ts - egna[i - 1].ts) / 1000;
      if (sek > vanta * 1.5) {
        poster.push({
          organ: namn,
          vantaSek: vanta,
          sek: Math.round(sek),
          efter: new Date(egna[i - 1].ts).toISOString().slice(0, 19),
        });
      }
    }
  }
  return poster.sort((a, b) => b.sek - a.sek);
}

/** Klassning: FYND = omstart i fönstret | tystnad ≥ fyndTröskel | många gap
 *  | persistent loop-svält (automation-motor, v166:s "FÅR ALDRIG missa en
 *  cron-minut" — enstaka miss = höglast-observation, upprepad = maskinfel).
 *  OBSERVATION = få mikro-gap (höglast-klass — trend, ej larmvärd). */
export function klassa({ omstarterIvanster, tystnadsgap, organGap, maxObservationer, fyndTystnadSek }) {
  if (omstarterIvanster > 0) return "FYND";
  if (tystnadsgap.some((g) => g.sek >= fyndTystnadSek)) return "FYND";
  if (tystnadsgap.length > maxObservationer) return "FYND";
  const amMiss = organGap.filter((g) => g.organ === "automation-motor").length;
  if (amMiss >= 5) return "FYND";
  if (tystnadsgap.length > 0 || amMiss > 0) return "OBSERVATION";
  return "GRÖN";
}

export function analysera(rader, nu, arg) {
  const { startar, rop } = parsaNoggrann(rader);
  if (rop.length === 0) {
    return { fel: "ologgbar — 0 rop-rader i loggen" };
  }
  const epok = startar.length > 0 ? startar[startar.length - 1] : rop[0].ts;
  const fonsterTill = nu;
  const fonsterFran = Math.max(epok, nu - arg.fonsterTimmar * 3_600_000);
  if (fonsterTill - fonsterFran < 600_000) {
    return { fel: "fönstret < 10 min — inget att döma (daemon nystartad?)" };
  }
  const tystnadsgap = hittaTystnadsgap(rop, fonsterFran, fonsterTill, arg.minstaTystnadSek);
  const organGap = hittaOrganGap(rop, fonsterFran, fonsterTill);
  // Omstarter mäts mot det OKLÄMDA fönstret (nu − fönster): epok-klemman får
  // ALDRIG gömma en mid-fönster-omstart (den flyttar ju fonsterFran till
  // omstarten). En startar-rad är en RESTART endast om loggen bevisar rop
  // FÖRE den (daemonen levde, dog, väcktes av pm2) — nyloggens första
  // start är en start-händelse, inte en omstart.
  const franOklampad = nu - arg.fonsterTimmar * 3_600_000;
  const omstarterIvanster = startar.filter(
    (t) => t > franOklampad && t <= fonsterTill && rop[0].ts < t,
  ).length;
  const klass = klassa({
    omstarterIvanster,
    tystnadsgap,
    organGap,
    maxObservationer: arg.maxObservationer,
    fyndTystnadSek: arg.fyndTystnadSek,
  });
  return {
    epok: new Date(epok).toISOString().slice(0, 19),
    epokFrånStartRad: startar.length > 0,
    fonsterFran: new Date(fonsterFran).toISOString().slice(0, 19),
    fonsterTill: new Date(fonsterTill).toISOString().slice(0, 19),
    ropIvanster: rop.filter((r) => r.ts >= fonsterFran && r.ts <= fonsterTill).length,
    omstarterTotalt: startar.length,
    omstarterIvanster,
    tystnadsgap,
    organGap,
    klass,
  };
}

function lasArgv(argv) {
  const arg = {
    logg: STANDARD_LOGG,
    fonsterTimmar: 24,
    minstaTystnadSek: 120,
    fyndTystnadSek: 600,
    maxObservationer: 4,
    json: null,
    tyst: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--logg") arg.logg = argv[++i];
    else if (a === "--fonster-timmar") arg.fonsterTimmar = Number(argv[++i]);
    else if (a === "--minsta-tystnad") arg.minstaTystnadSek = Number(argv[++i]);
    else if (a === "--fynd-tystnad") arg.fyndTystnadSek = Number(argv[++i]);
    else if (a === "--max-observationer") arg.maxObservationer = Number(argv[++i]);
    else if (a === "--json") arg.json = argv[++i];
    else if (a === "--tyst") arg.tyst = true;
    else { console.error(`Okänd flagga: ${a}`); process.exit(2); }
  }
  return arg;
}

export function main(argv) {
  const arg = lasArgv(argv);
  let rader;
  try {
    rader = readFileSync(arg.logg, "utf8").split("\n");
  } catch (e) {
    console.log(`ROP-HÄLSA: FEL — loggen oläslig (${String(e.message).slice(0, 80)})`);
    return 2;
  }
  const resultat = analysera(rader, Date.now(), arg);
  if (resultat.fel) {
    console.log(`ROP-HÄLSA: FEL — ${resultat.fel}`);
    return 2;
  }
  const worst = resultat.tystnadsgap[0]?.sek ?? 0;
  const klassRad =
    `ROP-HÄLSA: ${resultat.klass} — ${resultat.ropIvanster} rop · ` +
    `${resultat.tystnadsgap.length} tystnadsgap (värst ${worst} s) · ` +
    `${resultat.organGap.length} organ-gap · ${resultat.omstarterIvanster} omstart(er) i fönstret`;
  if (!arg.tyst) {
    console.log(klassRad);
    for (const g of resultat.tystnadsgap.slice(0, 10)) {
      console.log(`  TYSTNAD ${g.sek} s  ${g.efter} → ${g.fore}`);
    }
    for (const g of resultat.organGap.slice(0, 10)) {
      console.log(`  ORGAN-GAP ${g.organ} ${g.sek} s (väntat ≤ ${Math.round(g.vantaSek * 1.5)} s) efter ${g.efter}`);
    }
    if (resultat.omstarterTotalt > 0) {
      console.log(`  Epoch: ${resultat.epok} (loggens totala omstarter: ${resultat.omstarterTotalt})`);
    }
  }
  if (arg.json) {
    writeFileSync(arg.json, JSON.stringify({
      verktyg: "rop-halsa", version: VERSION, tid: new Date().toISOString(),
      logg: arg.logg, ...resultat, exit: resultat.klass === "FYND" ? 1 : 0,
    }, null, 2) + "\n", "utf8");
    if (!arg.tyst) console.log(`Rapport: ${arg.json}`);
  }
  return resultat.klass === "FYND" ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
