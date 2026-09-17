#!/usr/bin/env node
/**
 * LARM-ESKALERINGEN (spår 8, o22 §4.2 + o24 §6.1 — bokad 2026-09-16;
 * v2 2026-09-16 samma kväll: o26 §5 bokning 3 "evolutionspost v2")
 * ===================================================================
 * ROTORSAKA (bevisad i o22): konfigintegritetsvakten larmade 30 gånger
 * identiskt under natten 2026-09-15→16 (22:49→03:49 Z) utan att någon
 * mekanism reagerade — journalen bar signalen men inget översatte
 * upprepning ⟶ eskalering. Ett vaktlarm som är felaktigt/ignorerat i
 * >1 dag tränar systemet att ignorera larm (larmkulturens död).
 *
 * ROTORSAKA v2 (o26 §5:3): eskaleringen läste ENDAST konfig-larm.jsonl —
 * tre vaktnät, ett bevakat. Kraschvaktens incidentjournal (där o24:s nya
 * radtyper och 10:02-klassens ARTEFAKT RÖD-lägen syns) och kvalitets-
 * rapportens ålder (o22: sex dagar mätblindhet med GRÖN smak) var
 * osynliga för eskaleringslagret — exakt samma blindhetsklass som
 * startade spåret. Kärnan var redan källagnostisk (ts+niva+fingeravtryck);
 * v2 växer MAPPNINGSLAGRET, inte kärnan.
 *
 * KUR (denna fil): ett lager PÅ TOPP av journalerna — aldrig en ändring
 * av källvakterna. Append-only-journaler SKALL förbli kompletta (30 rader
 * ÄR beviset); eskaleringen läser dem och höjer signalnivån när ett
 * larm förblir ouppklarat:
 *
 *   nivå 1 VARNING     — aktiv episod ≥ 30 min (vakten slagit larm utan kur)
 *   nivå 2 ESKALERING  — aktiv episod ≥ 60 min (systemet ignorerar signalen)
 *   nivå 3 KRITISK     — aktiv episod ≥ 240 min (o22-natten: nåddes 02:49 Z,
 *                        en timme före den manuella kuren 03:54 Z)
 *   VAKT-TYSTHET       — konfigjournalens senaste rad äldre än --max-tyst-min
 *                        (default 25 min = 2,5 vaktpiller; vakten kan ha
 *                        dött — samma mätblindhetsklass som o22:s
 *                        triggerlösa kvalitetsvakt)
 *   KRASCHVAKT-AVSTANNAD — AKTIV räddningsepisod vars logg slutat röra
 *                        sig > max-tyst-min (kraschvakten skriver tyst i
 *                        pass-läge, men ALDRIG mitt i en räddning —
 *                        avstannad aktiv episod = vakten kan ha dött med
 *                        appen nere; nivå minst 2)
 *   KVALITETSRAPPORT   — SENASTE-rapportens ålder (trösklar 26/50/170 h;
 *                        26 h = missad daglig 07:00-pump + marginal,
 *                        170 h ≈ o22:s värsta vecka)
 *   HISTORIK           — uppklarad episod som varade ≥ eskaleringströskeln
 *                        (larmkultur-läxa: synliggörs, ackumuleras ej som larm)
 *
 * Episod = alla larm med samma fingeravtryck (typ|område|meddelande)
 * sedan senaste GRÖN-rad. Konfigintegritetsvakten skriver GRÖN endast
 * när ALLT är grönt, så en grön rad avslutar alla pågående episoder.
 * Kraschvaktens "RÄDDNING KLAR"/"PM2-RESTART LÄKTE" gör samma tjänst
 * i DISS källa (append svarar=true) — episoder byggs PER KÄLLA så att
 * en källas grön aldrig trollbinder en annans larm.
 *
 * Källor (v2):
 *   data/vakten/konfig-larm.jsonl        — jsonl, källa 1 (append-only)
 *   data/vakten/kraschvakt.log           — textjournal, källa 2:
 *     grön:  RÄDDNING KLAR · PM2-RESTART LÄKTE
 *     larm:  KRASCHLOOP-MISSTANKE · RÄDDNINGSBYGG MISSLYCKADES ·
 *            SVARAR INTE 2 GÅNGER · PM2-RESTART RÄCKTE INTE ·
 *            ARTEFAKT RÖD (10:02-klassen: bygget lämnade sajten trasig)
 *     neutrala rader (kooldown/TRANSIENT/DEPLOY PÅGÅR/…) deltar ej i
 *     episodbildning men DERAS ts är pulsen för avstannad-detekten.
 *   data/rapporter/kvalitetsrapport-SENASTE.md — källa 3: "**Genererad:**"
 *     -radens ålder ⟶ mätblindhetsnivåer.
 *   data/vakten/larm-eskalering.json     — lägesfil (skrivs om hel; för
 *     ronder/människor/framtid: pulsvakt)
 *
 * Säkerhet: ren läsning + filläsningar — inga child-processer, inga
 * nycklar, ingen .env. Exit-kod ALLTID 0 (samma kultur som konfig-
 * integritetsvakten: signalen bärs av stdout/lägesfilen, aldrig som
 * krasch för daemonen).
 *
 * Cronklar (bokas hos huvudagenten — den äger pumpor-daemonens
 * korEnGang-nycklar): kör OMEDLEBBT EFTER konfigintegritetsvakten
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
 *   --kval-varning-tim N  — kvalitetsrapport nivå 1 i timmar (default 26)
 *   --kval-eskalering-tim N — nivå 2 (default 50)
 *   --kval-kritisk-tim N   — nivå 3 (default 170)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KALLA = path.join(ROT, "data", "vakten", "konfig-larm.jsonl");
const KALLA_KRASCH = path.join(ROT, "data", "vakten", "kraschvakt.log");
const KALLA_KVAL = path.join(ROT, "data", "rapporter", "kvalitetsrapport-SENASTE.md");
const LAGESFIL = path.join(ROT, "data", "vakten", "larm-eskalering.json");

const NIVA_ETIKETT = { 0: "OK", 1: "VARNING", 2: "ESKALERING", 3: "KRITISK" };
const STANDARD_GRANSER = {
  varningMin: 30,
  eskaleringMin: 60,
  kritiskMin: 240,
  maxTystMin: 25,
  kvalVarningTim: 26,
  kvalEskaleringTim: 50,
  kvalKritiskTim: 170,
};

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

// ── Källmappning v2 (o26 §5:3) ──────────────────────────────────────────────

// Klassning i declarationsordning: första träff vinner (RÄCKTE INTE före
// generell PM2-restart; LÄKTE är grön även om raden nämner PM2-RESTART).
const KRASCH_KLASSER = [
  ["RÄDDNING KLAR", "raddning-klar", "gron"],
  ["PM2-RESTART LÄKTE", "pm2-restart-lakte", "gron"],
  ["KRASCHLOOP-MISSTANKE", "kraschloop-misstanke", "larm"],
  ["RÄDDNINGSBYGG MISSLYCKADES", "raddningsbygg-misslyckades", "larm"],
  ["SVARAR INTE 2 GÅNGER", "svarar-inte-2-ganger", "larm"],
  ["PM2-RESTART RÄCKTE INTE", "pm2-restart-rackte-inte", "larm"],
  ["ARTEFAKT RÖD", "artefakt-rod", "larm"],
];

/**
 * Översätter kraschvakt.log (text, "<ISO-ts> <meddelande>" per rad) till
 * normrader för den källagnostiska kärnan. Returnerar:
 *   rader        — bara larm+grön (neutrala rader deltar ej i episoder)
 *   senasteRadTs — SISTA parsade radens ts (även neutral: kooldown-rader
 *                  är vaktpulsen för avstannad-detekten)
 *   raderTotalt  — alla parsade rader (lägesfilens ärlighet)
 * Fingeravtrycket per klass är medvetet konstant (medd = klassen):
 * kraschvaktens detaljdelar (omstarter/status) varierar från rad till
 * rad och detaljerna äger journalen — klassen äger eskaleringen.
 */
export function oversattKraschvaktRader(text) {
  const rader = [];
  let senasteRadTs = null;
  let raderTotalt = 0;
  for (const rad of String(text ?? "").split("\n")) {
    const m = rad.match(/^(\d{4}-\d{2}-\d{2}T[0-9:.]+Z)\s+(.+)$/);
    if (!m) continue; //Tomma/skräprader hoppar — journalen får ha ärr
    raderTotalt += 1;
    senasteRadTs = m[1];
    for (const [markor, klass, niva] of KRASCH_KLASSER) {
      if (m[2].startsWith(markor)) {
        rader.push({ ts: m[1], niva, typ: "kraschvakt", omrade: klass, medd: klass });
        break;
      }
    }
  }
  return { rader, senasteRadTs, raderTotalt };
}

/** Läser kvalitetsrapportens "**Genererad:**"-ts; null = saknas/ogiltig. */
export function lasKvalitetsrapportTs(fil) {
  let text;
  try {
    text = fs.readFileSync(fil, "utf8");
  } catch {
    return null;
  }
  const m = text.match(/\*\*Genererad:\*\*\s*([^\s(]+)/);
  if (!m || Number.isNaN(Date.parse(m[1]))) return null;
  return m[1];
}

/**
 * Kvalitetsrapportens ålder ⟶ mätblindhetsnivå (o22: sex dagar blind med
 * GRÖN smak; "kan inte mäta" är ALDRIG frisk). Trösklar i granser med
 * ??-default så äldre anropsformer (utan nya fält) fortsätter fungera.
 */
export function bedomKvalitetsrapport(genereradTs, nuMs, granser = {}) {
  const v = granser.kvalVarningTim ?? STANDARD_GRANSER.kvalVarningTim;
  const e = granser.kvalEskaleringTim ?? STANDARD_GRANSER.kvalEskaleringTim;
  const k = granser.kvalKritiskTim ?? STANDARD_GRANSER.kvalKritiskTim;
  if (!genereradTs) {
    return { genererad: null, alderTim: null, niva: 3, etikett: NIVA_ETIKETT[3], orsak: "rapport saknas eller saknar Genererad-ts — kan inte mäta är aldrig frisk (o22-klassen)" };
  }
  const alderTim = Math.round(((nuMs - Date.parse(genereradTs)) / 3600000) * 10) / 10;
  if (alderTim >= k) return { genererad: genereradTs, alderTim, niva: 3, etikett: NIVA_ETIKETT[3], orsak: `mätblindhet ${alderTim} h (tröskel ${k} h — o22:s veckoklass)` };
  if (alderTim >= e) return { genererad: genereradTs, alderTim, niva: 2, etikett: NIVA_ETIKETT[2], orsak: `mätblindhet ${alderTim} h (tröskel ${e} h — två missade dygnspumpar)` };
  if (alderTim >= v) return { genererad: genereradTs, alderTim, niva: 1, etikett: NIVA_ETIKETT[1], orsak: `ålder ${alderTim} h (tröskel ${v} h — missad daglig pump?)` };
  return { genererad: genereradTs, alderTim, niva: 0, etikett: NIVA_ETIKETT[0], orsak: null };
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
    else if (a === "--kval-varning-tim") granser.kvalVarningTim = Number(argv[++i]);
    else if (a === "--kval-eskalering-tim") granser.kvalEskaleringTim = Number(argv[++i]);
    else if (a === "--kval-kritisk-tim") granser.kvalKritiskTim = Number(argv[++i]);
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

/**
 * Avstannad-detekt (v2): AKTIV kraschvakt-episod vars logg inte rört sig
 * på maxTystMin. Kraschvakten skriver tyst i pass-läge, men ALDRIG mitt
 * i en räddning (var 10:e minut medan kooldown/åtgärd pågår) — avstannad
 * aktiv episod = vakten kan ha dött med appen nere. Nivå höjs till ≥ 2.
 */
export function markeraAvstannade(aktiva, senasteRadTs, nuMs, granser = STANDARD_GRANSER) {
  if (!senasteRadTs) return aktiva.map((e) => ({ ...e, avstannad: true, avstannadMin: null }));
  const stillaMin = Math.round((nuMs - Date.parse(senasteRadTs)) / 60000);
  return aktiva.map((e) => {
    if (stillaMin <= granser.maxTystMin) return e;
    const niva = Math.max(e.niva, 2);
    return { ...e, avstannad: true, avstannadMin: stillaMin, niva, etikett: `${NIVA_ETIKETT[niva]} (AVSTANNAD)` };
  });
}

function huvud() {
  const { granser, flaggor } = lasFlaggor(process.argv);
  const nuMs = Date.now();

  // Källa 1: konfig-larm (oförändrat v1-beteende).
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

  // Källa 2: kraschvakt.log (v2).
  let kraschText = "";
  try {
    kraschText = fs.readFileSync(KALLA_KRASCH, "utf8");
  } catch {
    /* vakten kan vara nyinstallerad — tomt är sant, inte fel */
  }
  const oversatt = oversattKraschvaktRader(kraschText);
  const kraschEpisoder = byggEpisoder(oversatt.rader);
  kopplaGronTillEpisoder(kraschEpisoder, oversatt.rader);
  const kraschAktiva = markeraAvstannade(
    kraschEpisoder.aktiva.map((e) => bedomEpisod(e, nuMs, granser)),
    oversatt.senasteRadTs,
    nuMs,
    granser
  ).sort((a, b) => b.niva - a.niva || b.varaktighetMin - a.varaktighetMin);
  const kraschKlara = kraschEpisoder.klara
    .map((e) => bedomEpisod(e, nuMs, granser))
    .sort((a, b) => b.varaktighetMin - a.varaktighetMin);

  // Källa 3: kvalitetsrapportens ålder (v2).
  const kvalitet = bedomKvalitetsrapport(lasKvalitetsrapportTs(KALLA_KVAL), nuMs, granser);

  const lag = {
    genererad: new Date(nuMs).toISOString(),
    kallor: {
      konfigLarm: "data/vakten/konfig-larm.jsonl",
      kraschvakt: "data/vakten/kraschvakt.log",
      kvalitetsrapport: "data/rapporter/kvalitetsrapport-SENASTE.md",
    },
    granser,
    sammanfattning: {
      rader: rader.length,
      larm: rader.filter((r) => r.niva !== "gron").length,
      grona: rader.filter((r) => r.niva === "gron").length,
      episoderAktiva: aktiva.length,
      episoderUppklarade: klara.length,
      aktivaEskaleringar: aktiva.filter((e) => e.niva >= 1).length,
      vaktTyst: tysthet.tyst,
      kraschvaktRader: oversatt.raderTotalt,
      kraschvaktEpisoderAktiva: kraschAktiva.length,
      kraschvaktAvstannade: kraschAktiva.filter((e) => e.avstannad).length,
      kvalitetsrapportAlderTim: kvalitet.alderTim,
    },
    aktiva,
    historikSenaste: klara.filter((e) => e.historik).slice(0, 10),
    tysthet,
    kraschvakt: {
      raderTotalt: oversatt.raderTotalt,
      senasteRadTs: oversatt.senasteRadTs,
      episoderAktiva: kraschAktiva,
      historikSenaste: kraschKlara.filter((e) => e.historik).slice(0, 10),
    },
    kvalitetsrapport: kvalitet,
  };

  if (flaggor.json) {
    console.log(JSON.stringify(lag, null, 2));
  } else {
    for (const e of aktiva.filter((x) => x.niva >= 1)) {
      console.log(`[LARM-ESKALERING] NIVÅ ${e.niva} ${e.etikett} — ${String(e.nyckel).split("|").slice(1).join(": ")} · ${e.upprepningar} larm · aktiv i ${e.varaktighetMin} min (sedan ${e.forstaTs})`);
    }
    if (tysthet.tyst) console.log(`[LARM-ESKALERING] VAKT-TYSTHET ${tysthet.etikett} — ${tysthet.orsak}`);
    for (const e of kraschAktiva) {
      if (e.avstannad) {
        console.log(`[LARM-ESKALERING] NIVÅ ${e.niva} ${e.etikett} (KRASCHVAKT) — ${String(e.nyckel).split("|")[1]} · episoden utan loggrörelse i ${e.avstannadMin ?? "?"} min — vakten kan ha dött mitt i räddningen (appkoll påkallad)`);
      } else if (e.niva >= 1) {
        console.log(`[LARM-ESKALERING] NIVÅ ${e.niva} ${e.etikett} (KRASCHVAKT) — ${String(e.nyckel).split("|")[1]} · ${e.upprepningar} larm · aktiv i ${e.varaktighetMin} min (sedan ${e.forstaTs})`);
      }
    }
    if (kvalitet.niva >= 1) {
      console.log(`[LARM-ESKALERING] NIVÅ ${kvalitet.niva} ${kvalitet.etikett} (KVALITETSRAPPORT) — ${kvalitet.orsak}`);
    }
    const his = lag.historikSenaste.length;
    const kraschHis = lag.kraschvakt.historikSenaste.length;
    console.log(
      `[larm-eskalering] ${aktiva.length} aktiv(a) episod(er) varav ${lag.sammanfattning.aktivaEskaleringar} över tröskel · journal ${lag.sammanfattning.rader} rader · senaste rad ${tysthet.minSedan ?? "?"} min sedan · kraschvakt ${oversatt.raderTotalt} rader / ${kraschAktiva.length} aktiv(a) varav ${lag.sammanfattning.kraschvaktAvstannade} avstannad(e) · kvalitetsrapport ${kvalitet.alderTim ?? "?"} h · historik ${his}+${kraschHis} läxa(or)`
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
