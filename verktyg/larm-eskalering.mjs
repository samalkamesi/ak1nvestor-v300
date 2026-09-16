#!/usr/bin/env node
/**
 * LARM-ESKALERINGEN (spår 8, o22 §4.2 + o24 §6.1 — bokad 2026-09-16)
 * ===================================================================
 * ROTORSAKA (bevisad i o22): konfigintegritetsvakten larmade 30 gånger
 * identiskt under natten 2026-09-15→16 (22:49→03:49 Z) utan att någon
 * mekanism reagerade — journalen bar signalen men inget översatte
 * upprepning ⟶ eskalering. Ett vaktlarm som är felaktigt/ignorerat i
 * >1 dag tränar systemet att ignorera larm (larmkulturens död).
 *
 * KUR (denna fil): ett lager PÅ TOPP av journalen — aldrig en ändring
 * av källvakten. Append-only-journalen SKALL förbli komplett (30 rader
 * ÄR beviset); eskaleringen läser den och höjer signalnivån när ett
 * larm förblir ouppklarat:
 *
 *   nivå 1 VARNING     — aktiv episod ≥ 30 min (vakten slagit larm utan kur)
 *   nivå 2 ESKALERING  — aktiv episod ≥ 60 min (systemet ignorerar signalen)
 *   nivå 3 KRITISK     — aktiv episod ≥ 240 min (o22-natten: nåddes 02:49 Z,
 *                        en timme före den manuella kuren 03:54 Z)
 *   VAKT-TYSTHET       — journalens senaste rad är äldre än --max-tyst-min
 *                        (default 25 min = 2,5 vaktpiller; vakten kan ha
 *                        dött — samma mätblindhetsklass som o22:s
 *                        triggerlösa kvalitetsvakt)
 *   HISTORIK           — uppklarad episod som varade ≥ eskaleringströskeln
 *                        (larmkultur-läxa: synliggörs, ackumuleras ej som larm)
 *
 * Episod = alla larm med samma fingeravtryck (typ|område|meddelande)
 * sedan senaste GRÖN-rad. Konfigintegritetsvakten skriver GRÖN endast
 * när ALLT är grönt, så en grön rad avslutar alla pågående episoder.
 *
 * Fil(er):
 *   data/vakten/konfig-larm.jsonl      — källa (append-only, orörd)
 *   data/vakten/larm-eskalering.json   — lägesfil (skrivs om hel; för
 *                                        ronder/människor/framtid: pulsvakt)
 *
 * Säkerhet: ren läsning + EN filläsning av journalen — inga child-
 * processer, inga nycklar, ingen .env. Exit-kod ALLTID 0 (samma kultur
 * som konfigintegritetsvakten: signalen bärs av stdout/lägesfilen,
 * aldrig som krasch för daemonen).
 *
 * Cronklar (bokas hos huvudagenten — den äger pumpor-daemonens
 * korEnGang-nycklar): kör OMEDLEBT EFTER konfigintegritetsvakten
 * (min%10==9) på en ledig daemon-minut, t.ex. min%10==8-ruset före
 * eller :x0 — aldrig :x1/:x4/:x5/:x7/:x8 eller :17/:23/:37/:43/:47
 * (konfigintegritetsvakt.mjs huvudkommentar).
 *
 * Flaggor:
 *   --torr            — skriv ej lägesfilen (endast stdout)
 *   --json            — skriv hela läget som JSON på stdout
 *   --varning-min N   — tröskel nivå 1 (default 30)
 *   --eskalering-min N — tröskel nivå 2 (default 60)
 *   --kritisk-min N   — tröskel nivå 3 (default 240)
 *   --max-tyst-min N  — vakt-tysthetströskel (default 25)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KALLA = path.join(ROT, "data", "vakten", "konfig-larm.jsonl");
const LAGESFIL = path.join(ROT, "data", "vakten", "larm-eskalering.json");

const NIVA_ETIKETT = { 0: "OK", 1: "VARNING", 2: "ESKALERING", 3: "KRITISK" };
const STANDARD_GRANSER = { varningMin: 30, eskaleringMin: 60, kritiskMin: 240, maxTystMin: 25 };

// ── Kärna (ren, noll IO — testas maskinellt i testa-larm-eskalering.mjs) ──

/** Fingeravtryck för en journalkolumn — allt utom ts+niva identifierar larmet. */
export function nyckelForRad(rad) {
  return [rad.typ ?? "?", rad.omrade ?? "?", rad.medd ?? "?"].join("|");
}

/**
 * Bygger episoder ur journalkolumner (tidsordning = filordning, append-only).
 * GRÖN-rad (niva==="gron") avslutar ALLA pågående episoder — konfigvakten
 * skriver grön endast när allt är grönt. Två olika larmnycklar utan grön
 * emellan ackumuleras var för sig (samma ouppklarade fönster).
 */
export function byggEpisoder(rader) {
  const pagaende = new Map();
  const klara = [];
  for (const rad of rader) {
    if (rad.niva === "gron") {
      for (const episod of pagaende.values()) klara.push(episod);
      pagaende.clear();
      continue;
    }
    const nyckel = nyckelForRad(rad);
    const episod = pagaende.get(nyckel);
    if (episod) {
      episod.upprepningar += 1;
      episod.sistaTs = rad.ts;
    } else {
      pagaende.set(nyckel, { nyckel, forstaTs: rad.ts, sistaTs: rad.ts, upprepningar: 1 });
    }
  }
  return { aktiva: [...pagaende.values()], klara };
}

/**
 * Bedömer en episod mot trösklarna.
 * Aktiv episod: varaktighet = nu − första larmet (pågående ouppklarat läge).
 * Uppklarad episod: varaktighet = grönTs − första larmet (om den avslutades
 * av en grön rad; sistaTs för övriga — se lasOchBedöm för grön-kopplingen).
 */
export function bedomEpisod(episod, nuMs, granser = STANDARD_GRANSER) {
  const forstaMs = Date.parse(episod.forstaTs);
  const referensMs = episod.gronTs ? Date.parse(episod.gronTs) : nuMs;
  const varaktighetMin = Math.max(0, Math.round((referensMs - forstaMs) / 60000));
  if (episod.gronTs) {
    return {
      ...episod,
      status: "uppklarad",
      varaktighetMin,
      niva: 0,
      etikett: varaktighetMin >= granser.eskaleringMin ? "HISTORIK" : NIVA_ETIKETT[0],
      historik: varaktighetMin >= granser.eskaleringMin,
    };
  }
  let niva = 0;
  if (varaktighetMin >= granser.kritiskMin) niva = 3;
  else if (varaktighetMin >= granser.eskaleringMin) niva = 2;
  else if (varaktighetMin >= granser.varningMin) niva = 1;
  return { ...episod, status: "aktiv", varaktighetMin, niva, etikett: NIVA_ETIKETT[niva] };
}

/** Tystnadskontroll: journalens senaste rad ålder i minuter ⟶ vakt-tysthet. */
export function bedomTysthet(senasteRadTs, nuMs, granser = STANDARD_GRANSER) {
  if (!senasteRadTs) return { tyst: true, minSedan: null, niva: 3, etikett: NIVA_ETIKETT[3], orsak: "journal saknar rader" };
  const minSedan = Math.round((nuMs - Date.parse(senasteRadTs)) / 60000);
  if (minSedan <= granser.maxTystMin) return { tyst: false, minSedan, niva: 0, etikett: NIVA_ETIKETT[0], orsak: null };
  const niva = minSedan >= granser.eskaleringMin ? 2 : 1;
  return { tyst: true, minSedan, niva, etikett: NIVA_ETIKETT[niva], orsak: `vakten tyst i ${minSedan} min (tröskel ${granser.maxTystMin})` };
}

// ── IO-lager ────────────────────────────────────────────────────────────────

/** Läser jsonl tåligt: ogiltiga/ickes-JSON-rader och rader utan ts hoppas. */
export function lasRader(fil) {
  let text;
  try {
    text = fs.readFileSync(fil, "utf8");
  } catch {
    return [];
  }
  const rader = [];
  for (const rad of text.split("\n")) {
    if (!rad.trim()) continue;
    try {
      const obj = JSON.parse(rad);
      if (obj && typeof obj.ts === "string" && !Number.isNaN(Date.parse(obj.ts))) rader.push(obj);
    } catch {
      /* skräprad — journalen får ha ärr */
    }
  }
  return rader;
}

function lasFlaggor(argv) {
  const granser = { ...STANDARD_GRANSER };
  const flaggor = { torr: false, json: false };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--torr") flaggor.torr = true;
    else if (a === "--json") flaggor.json = true;
    else if (a === "--varning-min") granser.varningMin = Number(argv[++i]);
    else if (a === "--eskalering-min") granser.eskaleringMin = Number(argv[++i]);
    else if (a === "--kritisk-min") granser.kritiskMin = Number(argv[++i]);
    else if (a === "--max-tyst-min") granser.maxTystMin = Number(argv[++i]);
    else {
      console.error(`[larm-eskalering] okänt argument: ${a} (se filhuvudet)`);
      process.exit(2);
    }
  }
  return { granser, flaggor };
}

/** Kopplar varje uppklarad episod till AVSLUTANDE grön-rad (för ärlig varaktighet). */
export function kopplaGronTillEpisoder(episoder, rader) {
  if (episoder.klara.length === 0) return;
  const gronTs = rader.filter((r) => r.niva === "gron").map((r) => r.ts);
  for (const episod of episoder.klara) {
    // Första grön-rad EFTER episodens sista larm (append-only ⇒ ts-ordning).
    const slut = gronTs.find((ts) => Date.parse(ts) >= Date.parse(episod.sistaTs));
    episod.gronTs = slut ?? null;
  }
}

function huvud() {
  const { granser, flaggor } = lasFlaggor(process.argv);
  const nuMs = Date.now();
  const rader = lasRader(KALLA);
  const episoder = byggEpisoder(rader);
  kopplaGronTillEpisoder(episoder, rader);

  const aktiva = episoder.aktiva
    .map((e) => bedomEpisod(e, nuMs, granser))
    .sort((a, b) => b.niva - a.niva || b.varaktighetMin - a.varaktighetMin);
  const klara = episoder.klara
    .map((e) => bedomEpisod(e, nuMs, granser))
    .sort((a, b) => b.varaktighetMin - a.varaktighetMin);
  const tysthet = bedomTysthet(rader.length > 0 ? rader[rader.length - 1].ts : null, nuMs, granser);

  const lag = {
    genererad: new Date(nuMs).toISOString(),
    kalla: "data/vakten/konfig-larm.jsonl",
    granser,
    sammanfattning: {
      rader: rader.length,
      larm: rader.filter((r) => r.niva !== "gron").length,
      grona: rader.filter((r) => r.niva === "gron").length,
      episoderAktiva: aktiva.length,
      episoderUppklarade: klara.length,
      aktivaEskaleringar: aktiva.filter((e) => e.niva >= 1).length,
      vaktTyst: tysthet.tyst,
    },
    aktiva,
    historikSenaste: klara.filter((e) => e.historik).slice(0, 10),
    tysthet,
  };

  if (flaggor.json) {
    console.log(JSON.stringify(lag, null, 2));
  } else {
    for (const e of aktiva.filter((x) => x.niva >= 1)) {
      console.log(`[LARM-ESKALERING] NIVÅ ${e.niva} ${e.etikett} — ${String(e.nyckel).split("|").slice(1).join(": ")} · ${e.upprepningar} larm · aktiv i ${e.varaktighetMin} min (sedan ${e.forstaTs})`);
    }
    if (tysthet.tyst) console.log(`[LARM-ESKALERING] VAKT-TYSTHET ${tysthet.etikett} — ${tysthet.orsak}`);
    const his = lag.historikSenaste.length;
    console.log(
      `[larm-eskalering] ${aktiva.length} aktiv(a) episod(er) varav ${lag.sammanfattning.aktivaEskaleringar} över tröskel · ${his} historikläxa(er) · journal ${lag.sammanfattning.rader} rader · senaste rad ${tysthet.minSedan ?? "?"} min sedan`
    );
  }
  if (!flaggor.torr) {
    fs.mkdirSync(path.dirname(LAGESFIL), { recursive: true });
    fs.writeFileSync(LAGESFIL, JSON.stringify(lag, null, 2));
  }
  process.exit(0);
}

const AR_HUVUDPROGRAM = (() => {
  try {
    return process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
  } catch {
    return false;
  }
})();
if (AR_HUVUDPROGRAM) huvud();
