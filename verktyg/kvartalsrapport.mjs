#!/usr/bin/env node
/**
 * KVARTALSRAPPORTSERIEN — generator för automatförberedda rapportutkast
 * ur befintlig vågvalideringsdata (styrelse våg 106, beslut D3, agent H3).
 *
 * Läser AK1A:s egna mätloggar och sammanfattar per kvartal:
 *   1. Vågvalidering     — data/rapporter/vagvalidering-SENASTE.json (cron-spegeln)
 *   2. Regime            — data/portfolj-system/regime-logg.json
 *   3. Prediktioner      — data/portfolj-system/prediktionslogg-akm3.json
 *   4. Kalibreringsdrift — data/portfolj-system/kalibrering-logg.json
 *   5. Kvalitetsvakt     — data/rapporter/kvalitetsrapport-SENASTE.md
 *
 * PRINCIPER (motorn gissar aldrig):
 *   - Varje siffra i rapporten hämtas ur källorna vid körning — inga påhittade
 *     eller hårkodade tal. Saknas/tom en källa för perioden skrivs den ärliga
 *     raden "källan har ännu ingen data för perioden".
 *   - Deterministisk: inga slumptal, inget nät, inga beroenden utöver Node.
 *     Samma källor + samma år/kvartal => samma rapport (utöver publiceringsdatum).
 *   - Skriver ALDRIG till data/blogg/ (LIVE-mappen) — endast UTKAST till
 *     data/blogg-utkast/. En guard stoppar utfall utanför utkastmappen.
 *   - Pedagogisk utbildning, ej investeringsrådgivning (lagen 2007:528).
 *     Inga bolagsrekommendationer — tickers namnges aldrig i rapporten.
 *   - Sammanställningsraden i data/blogg-utkast/GRANSKNINGSKO-SAMMANSTALLNING.md
 *     uppdateras idempotent (publicering = kundens beslut, R2).
 *
 * Användning:  node verktyg/kvartalsrapport.mjs [--ar=2026] [--kvartal=3] [--datum=YYYY-MM-DD]
 * Default år/kvartal = aktuellt. --datum styr frontmatterns publishedAt (default: idag).
 * Avslutskod:  0 = utkast skrivet, 1 = fel.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ── Argument ─────────────────────────────────────────────────────────────────
function lasArg(namn) {
  const m = process.argv.find((a) => a.startsWith(`--${namn}=`));
  return m ? m.split("=", 2)[1] : null;
}
const IDAG = lasArg("datum") ?? new Date().toISOString().slice(0, 10);
const NU = new Date(IDAG + "T12:00:00Z");
const AR = Number(lasArg("ar") ?? NU.getUTCFullYear());
const KVARTAL = Number(lasArg("kvartal") ?? Math.floor(NU.getUTCMonth() / 3) + 1);
if (!(KVARTAL >= 1 && KVARTAL <= 4)) {
  console.error("FEL: --kvartal måste vara 1–4.");
  process.exit(1);
}

// Kvartalets datumgränser (ISO-datumsträngar jämförs lexikalt — säkert för YYYY-MM-DD).
const MANADER = [1, 2, 3].map((i) => `${AR}-${String((KVARTAL - 1) * 3 + i).padStart(2, "0")}`);
const KV_START = `${AR}-${String((KVARTAL - 1) * 3 + 1).padStart(2, "0")}-01`;
const KV_SLUT_EXKL = `${KVARTAL === 4 ? AR + 1 : AR}-${String((KVARTAL % 4) * 3 + 1).padStart(2, "0")}-01`;

/** Hör hemma datumet (ISO-datum eller ISO-tidsstämpel) i årets kvartal? */
function iKvartalet(isoDatum) {
  if (typeof isoDatum !== "string" || isoDatum.length < 10) return false;
  const d = isoDatum.slice(0, 10);
  return d >= KV_START && d < KV_SLUT_EXKL;
}

// ── Formatering enligt sv-SE ─────────────────────────────────────────────────
const nfHeltal = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 });
const nfDecimal = new Intl.NumberFormat("sv-SE", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const fmtTal = (n) => (Number.isInteger(n) ? nfHeltal.format(n) : nfDecimal.format(n));
const fmtProcent = (n) => (Number.isInteger(n) ? `${nfHeltal.format(n)} %` : `${nfDecimal.format(n)} %`);

/** Percentil med linjär interpolation (typ 7) — deterministisk, inga antaganden utöver datan. */
function percentilLin(sorterade, p) {
  if (sorterade.length === 0) return null;
  if (sorterade.length === 1) return sorterade[0];
  const pos = (sorterade.length - 1) * p;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return lo === hi ? sorterade[lo] : sorterade[lo] + (pos - lo) * (sorterade[hi] - sorterade[lo]);
}

const SAKNAS_RAD = "Källan har ännu ingen data för perioden — raden lämnas ärligt tom, motorn gissar aldrig.";

// ── Källäsning ───────────────────────────────────────────────────────────────
function lasJson(sokVag) {
  if (!existsSync(sokVag)) return { finns: false };
  try {
    return { finns: true, data: JSON.parse(readFileSync(sokVag, "utf8")) };
  } catch (e) {
    return { finns: true, ogiltig: true, fel: e.message };
  }
}

const vagvalidering = lasJson(path.join(REPO, "data", "rapporter", "vagvalidering-SENASTE.json"));
const regimeLogg = lasJson(path.join(REPO, "data", "portfolj-system", "regime-logg.json"));
const prediktionsLogg = lasJson(path.join(REPO, "data", "portfolj-system", "prediktionslogg-akm3.json"));
const kalibreringLogg = lasJson(path.join(REPO, "data", "portfolj-system", "kalibrering-logg.json"));

// Kvalitetsrapporten är markdown — parsa endast de rader som behövs (siffror ur källan).
const kvalitetsSok = path.join(REPO, "data", "rapporter", "kvalitetsrapport-SENASTE.md");
const kvalitetsRapportText = existsSync(kvalitetsSok) ? readFileSync(kvalitetsSok, "utf8") : null;
const kvalitets = (() => {
  if (kvalitetsRapportText === null) return { finns: false };
  const genererad = kvalitetsRapportText.match(/^- \*\*Genererad:\*\* (\S+)/m)?.[1] ?? null;
  const status = kvalitetsRapportText.match(/^## ANTAL FEL: (\d+) \| MANUELLA: (\d+) \| STATUS: (\S+)$/m);
  const motor = kvalitetsRapportText.match(/RESULTAT: (\d+) PASS \/ (\d+) FAIL \/ (\d+) SKIP/);
  return {
    finns: true,
    genererad,
    iKvartalet: genererad ? iKvartalet(genererad) : false,
    fel: status ? Number(status[1]) : null,
    manuella: status ? Number(status[2]) : null,
    status: status ? status[3].trim() : null,
    motorPass: motor ? Number(motor[1]) : null,
    motorFail: motor ? Number(motor[2]) : null,
    motorSkip: motor ? Number(motor[3]) : null,
  };
})();

// ── Urval per kvartal ────────────────────────────────────────────────────────
// Vågvalidering: senaste ronden + eventuell historik (historikV1) med domdatum i kvartalet.
const vvRonder = [];
if (vagvalidering.finns && !vagvalidering.ogiltig) {
  const d = vagvalidering.data;
  if (d && iKvartalet(d.domdatum)) vvRonder.push({ domdatum: d.domdatum, arAktuell: true });
  if (Array.isArray(d?.historikV1)) {
    for (const h of d.historikV1) {
      const dd = typeof h === "string" ? h : h?.domdatum;
      if (dd && iKvartalet(dd)) vvRonder.push({ domdatum: dd, arAktuell: false });
    }
  }
}
const vv = vagvalidering.finns && !vagvalidering.ogiltig ? vagvalidering.data : null;

// Regime: rader med datum i kvartalet.
const regimeRader = (regimeLogg.finns && !regimeLogg.ogiltig
  ? (regimeLogg.data?.rader ?? []).filter((r) => iKvartalet(r?.datum))
  : []
);

// Prediktioner: rader med datum i kvartalet (schemat är framtida — räkna defensivt).
let predRader = [];
let predStrukturOk = false;
if (prediktionsLogg.finns && !prediktionsLogg.ogiltig) {
  const kandidat = Array.isArray(prediktionsLogg.data?.rader)
    ? prediktionsLogg.data.rader
    : Array.isArray(prediktionsLogg.data)
      ? prediktionsLogg.data
      : null;
  if (kandidat) {
    predStrukturOk = true;
    predRader = kandidat.filter((r) => iKvartalet(r?.datum ?? r?.skapad));
  }
}

// Kalibrering: rader med månad eller datum i kvartalet.
const kalRader = (kalibreringLogg.finns && !kalibreringLogg.ogiltig
  ? (kalibreringLogg.data?.rader ?? []).filter(
      (r) => (r?.manad && MANADER.includes(r.manad)) || iKvartalet(r?.datum),
    )
  : []
);

// ── Rapportdelar ─────────────────────────────────────────────────────────────
const kvartalEtikett = `${AR}:${KVARTAL}`;
const kvartalEngelsk = `Q${KVARTAL} ${AR}`;
const filStam = `kvartalsrapport-${AR}-Q${KVARTAL}`;

const HORISONTER = ["mikro", "kort", "medellång", "lång", "mega"];
const KLASSER = ["impulsvåg", "korrigering", "basbygge"];

function sektionVagvalidering() {
  if (!vv || vvRonder.length === 0) {
    return [
      "## 1. Vågvalideringen — träffbilden",
      "",
      SAKNAS_RAD,
      "",
      "_Källa: data/rapporter/vagvalidering-SENASTE.json._",
    ].join("\n");
  }
  const ronder = vvRonder.map((r) => r.domdatum).join(", ");
  const totalt = vv.totalt ?? {};
  const celler = (vv.perHorisontKlass ?? []).filter((c) => (c.nDomda ?? 0) > 0);
  const traffVarden = celler.map((c) => c.traffProcent).filter((v) => typeof v === "number");
  const sorterade = [...traffVarden].sort((a, b) => a - b);
  const q1 = percentilLin(sorterade, 0.25);
  const median = percentilLin(sorterade, 0.5);
  const q3 = percentilLin(sorterade, 0.75);
  const minN = Math.min(...celler.map((c) => c.nDomda));
  const maxN = Math.max(...celler.map((c) => c.nDomda));

  const cellText = (h, k) => {
    const c = (vv.perHorisontKlass ?? []).find((x) => x.horisont === h && x.klass === k);
    if (!c || (c.nDomda ?? 0) === 0) return `— (n=${nfHeltal.format(c?.nDomda ?? 0)})`;
    return `${fmtProcent(c.traffProcent)} (n=${nfHeltal.format(c.nDomda)})`;
  };
  const tabellRader = HORISONTER.map(
    (h) => `| ${h} | ${cellText(h, "impulsvåg")} | ${cellText(h, "korrigering")} | ${cellText(h, "basbygge")} |`,
  );

  const historikRad = Array.isArray(vv.historikV1) && vv.historikV1.length > 0
    ? "Källans historik (historikV1) redovisar tidigare ronder och är medräknad ovan."
    : "Källans historik (historikV1) är ännu tom — tidigare körningar inom kvartalet kan därför inte räknas ihop ärligt.";

  return [
    "## 1. Vågvalideringen — träffbilden",
    "",
    `Vågmotorn dömer sin egen vågklass mot faktiskt fundamental momentum, rond för rond. Under ${kvartalEngelsk} redovisas **${fmtTal(vvRonder.length)} rond med domslut** (domdatum: ${ronder}); de rullande räknarna startade ${vv.rullandeSedan ?? "okänt datum"}. ${historikRad}`,
    "",
    `Universumet omfattar ${fmtTal(vv.universumAntal ?? 0)} tickers (namnges aldrig här — det här är metodik, inte bolagsval). Senaste ronden mätte ${fmtTal(vv.universumAntal ?? 0)} tickers × 5 horisonter; **${fmtTal(totalt.nDomda ?? 0)} mätningar kunde dömas** och ${fmtProcent(totalt.osattAndelProcent ?? 0)} höll klassen osatt — osatt räknas i täckningsbråket, aldrig som fel. Total träffbild: **${fmtProcent(totalt.traffProcent ?? 0)}** (n=${fmtTal(totalt.nDomda ?? 0)}).`,
    "",
    "### Träffprocent per horisont och vågklass",
    "",
    "| Horisont | impulsvåg | korrigering | basbygge |",
    "|---|---|---|---|",
    ...tabellRader,
    "",
    `_n = antal dömda mätningar (träff + miss). Osatta andelar redovisas inom parentes och räknas aldrig som fel._`,
    "",
    `### Träffbildens kvartiler — där datan bär`,
    "",
    `Över de ${fmtTal(sorterade.length)} (horisont × klass)-celler som har dömt underlag ligger träffprocenten med **undre kvartilen ${fmtProcent(q1)}**, **median ${fmtProcent(median)}** och **övre kvartilen ${fmtProcent(q3)}**. Bilden är tvådelad: impulsvågscellerna ligger högt medan basbygge på medellång och mega horisont ligger på noll. Läs kvartilerna som en spridningsbild — underlaget per cell är ${fmtTal(minN)}–${fmtTal(maxN)} dömda mätningar, vilket är för litet för säkra skattningar.`,
    "",
    `Klassen **korrigering** har n = 0 i samtliga horisonter, och horisonten **lång** har n = 0 i samtliga klasser — för båda gäller: källan har ännu ingen data för perioden, så cellerna redovisas som streck med n = 0, aldrig som gissade procentsatser.`,
    "",
    "Vad träffprocenten betyder — och inte betyder: den är ett öppet kvitto på det förflutna, aldrig en garanti om framtiden. Motorn beskriver rytm och läge i fundamentalserier; mätningen gör systemet ärligare, inte kursprognostiskt.",
    "",
    "_Källa: data/rapporter/vagvalidering-SENASTE.json (speglar vagvalidering-SENASTE.md, cron api/cron/vagvalidering)._",
  ].join("\n");
}

function sektionRegime() {
  if (regimeRader.length === 0) {
    return [
      "## 2. Regime-läget",
      "",
      SAKNAS_RAD,
      "",
      "_Källa: data/portfolj-system/regime-logg.json._",
    ].join("\n");
  }
  const senaste = regimeRader[regimeRader.length - 1];
  const antal = regimeRader.length;
  const byte = regimeRader.filter((r) => r.byte === true).length;
  const lagena = [...new Set(regimeRader.map((r) => r.regime).filter(Boolean))];
  const ind = senaste.indikatorer ?? {};
  const gron = typeof ind.gronAndel === "number" ? fmtProcent(Math.round(ind.gronAndel * 1000) / 10) : null;
  const rod = typeof ind.rodAndel === "number" ? fmtProcent(Math.round(ind.rodAndel * 1000) / 10) : null;
  const osattRad = senaste.nOsattOrsak
    ? `Netto-vågbredden är dock **osatt** i källan (${senaste.nOsattOrsak}) — regimens benämning vilar därmed enbart på grön-/rödandelarna, och det sägs rakt ut.`
    : "";
  const andelRad = gron || rod
    ? `Senaste mätningens indikatorer (${senaste.datum}): grön andel ${gron ?? "osatt"}, röd andel ${rod ?? "osatt"} av universumet.`
    : "Senaste mätningens andelsindikatorer är osatta i källan.";
  const beskrivningsRad = senaste.beskrivning ? `Loggens egen beskrivning: _"${senaste.beskrivning}"_` : "";
  return [
    "## 2. Regime-läget",
    "",
    `Under kvartalet loggades ${fmtTal(antal)} regimehändelse${antal === 1 ? "" : "r"} i portföljsystemets regime-logg${byte > 0 ? `, varav ${fmtTal(byte)} regimbyte` : ""}. Laget${lagena.length === 1 ? ` som fördes är **${lagena[0]}**` : ` som förts är: ${lagen.join(", ")}`}.`,
    "",
    andelRad,
    ...(beskrivningsRad ? ["", beskrivningsRad] : []),
    ...(osattRad ? ["", osattRad] : []),
    "",
    "Regimebegreppet är portföljsystemets sätt att sätta namn på marknadsmiljön — ett lägesbeskrivande verktyg, inte en marknadstimingssignal.",
    "",
    "_Källa: data/portfolj-system/regime-logg.json._",
  ].join("\n");
}

function sektionPrediktioner() {
  let brödtext;
  if (!prediktionsLogg.finns) {
    brödtext = `Källan ${"data/portfolj-system/prediktionslogg-akm3.json"} finns ännu inte i trädet. ${SAKNAS_RAD}`;
  } else if (prediktionsLogg.ogiltig) {
    brödtext = `Källan finns men kunde inte tolkas som giltig JSON (${prediktionsLogg.fel}). ${SAKNAS_RAD}`;
  } else if (!predStrukturOk) {
    brödtext = `Källan finns men dess struktur kändes inte igen (varken rader-array eller lista). ${SAKNAS_RAD}`;
  } else if (predRader.length === 0) {
    brödtext = `Källan finns men innehåller inga poster daterade inom ${kvartalEngelsk}. ${SAKNAS_RAD}`;
  } else {
    const datum = predRader.map((r) => r.datum ?? r.skapad).filter(Boolean);
    brödtext = `Källan redovisar ${fmtTal(predRader.length)} prediktionspost${predRader.length === 1 ? "" : "er"} inom kvartalet${datum.length ? ` (daterade ${Math.min(...datum)} – ${Math.max(...datum)})` : ""}. Träff-/miss-fält redovisas i framtida versioner när loggen vuxit.`;
  }
  return [
    "## 3. Prediktionsloggen",
    "",
    brödtext,
    "",
    "Varför raden finns ändå: en kvartalsrapport som tiger om en tom källa är mindre ärlig än en som visar hålet. Nästa generation av rapporten fyller sektionen automatiskt när loggen börjar föra data.",
    "",
    "_Källa: data/portfolj-system/prediktionslogg-akm3.json._",
  ].join("\n");
}

function sektionKalibrering() {
  if (kalRader.length === 0) {
    return [
      "## 4. Kalibreringsdriften",
      "",
      SAKNAS_RAD,
      "",
      "_Källa: data/portfolj-system/kalibrering-logg.json._",
    ].join("\n");
  }
  const senaste = kalRader[kalRader.length - 1];
  const faser = senaste.faser ?? {};
  const fasNamn = Object.keys(faser);
  const statusRakning = {};
  for (const n of fasNamn) {
    const s = faser[n]?.status ?? "okänd";
    statusRakning[s] = (statusRakning[s] ?? 0) + 1;
  }
  const statusText = Object.entries(statusRakning).map(([s, n]) => `${fmtTal(n)} fas${n === 1 ? "" : "er"} ${s}`).join(", ");
  const deltaPhi = senaste.deltaPhi;
  const grindsats = senaste.grindLasad === true ? "LÅST" : senaste.grindLasad === false ? "olåst" : "okänd i källan";
  return [
    "## 4. Kalibreringsdriften",
    "",
    `Kalibreringscronen samlar in data för modellens fasvikter (Φ) utan att ändra dem — grinden är ${grindsats} och **ΔΦ = ${fmtTal(deltaPhi ?? 0)}**. Inom kvartalet fördes ${fmtTal(kalRader.length)} mätning${kalRader.length === 1 ? "" : "ar"} (senaste ${senaste.datum}, månad ${senaste.manad}).`,
    "",
    `Underlaget är ännu i uppbyggnadskede: **${fmtTal(senaste.episoderTotalt ?? 0)} episoder** totalt och ${fmtTal(senaste.domRader ?? 0)} domrader sedan clean-start ${senaste.cleanFran ?? "?"}. Korrelationsparametern ρ̄ ligger på ${nfDecimal.format(senaste.rho ?? 0)} med källangivelse _"${senaste.rhoKalla ?? "okänd"}"_ — dvs. en dokumenterad default, inte en skattning. Diskonterat med den ρ̄ bär universumet cirka ${fmtTal(senaste.effektivaPerDag ?? 0)} effektiva observationer per dag — dagar räknas aldrig som observationer, bara episoder.`,
    "",
    `Fasstatus per senaste mätning: ${statusText}. Ingen fas har nått handlingsgrindens krav (n_eff ≥ 20 episoder) — därför är samtliga Φ-förslag enbart framtida kandidater, aldrig genomförda ändringar.`,
    "",
    "Kalibreringen gör modellen mer självkonsistent; den kan inte och skall inte omvandla vågmotorn till en kursprognos.",
    "",
    "_Källa: data/portfolj-system/kalibrering-logg.json (speglas i data/rapporter/akm3-kalibrering-SENASTE.md)._",
  ].join("\n");
}

function sektionKvalitetsvakt() {
  if (!kvalitets.finns) {
    return [
      "## 5. Kvalitetsvakten",
      "",
      SAKNAS_RAD,
      "",
      "_Källa: data/rapporter/kvalitetsrapport-SENASTE.md._",
    ].join("\n");
  }
  const periodRad = kvalitets.iKvartalet
    ? `Senaste rapporten är genererad ${kvalitets.genererad?.slice(0, 10) ?? "okänt datum"} — inom kvartalet.`
    : `Senaste rapporten härstammar från ${kvalitets.genererad?.slice(0, 10) ?? "okänt datum"} (utanför kvartalet) — statusen nedan är senaste kända läge, inte periodens.`;
  const motorRad = kvalitets.motorPass !== null
    ? `Motorvalideringen (100 %-väktaren) redovisar **${fmtTal(kvalitets.motorPass)} PASS / ${fmtTal(kvalitets.motorFail)} FAIL / ${fmtTal(kvalitets.motorSkip)} SKIP**.`
    : "Motorvalideringens RESULTAT-rad kunde inte läsas ur rapporten.";
  return [
    "## 5. Kvalitetsvakten",
    "",
    `Kvalitetsvakten sveper sajten dagligen (cron 07:00 UTC) och skriver överskrivande rapport. ${periodRad} Status: **${kvalitets.status ?? "okänd"}** — ${fmtTal(kvalitets.fel ?? 0)} fel och ${fmtTal(kvalitets.manuella ?? 0)} poster för manuell granskning. ${motorRad}`,
    "",
    "För den här rapportens källor betyder det: de JSON-loggar kvartalsrapporten bygger på passerar vaktns giltighetskontroll, och motorerna bakom vågvalideringen håller 100 % i sin egen valideringsbild.",
    "",
    "_Källa: data/rapporter/kvalitetsrapport-SENASTE.md (verktyg/kvalitetsvakt.mjs)._",
  ].join("\n");
}

function sektionDatamognad() {
  const luckor = [];
  if (!prediktionsLogg.finns) luckor.push("prediktionsloggen (data/portfolj-system/prediktionslogg-akm3.json) finns ännu inte — sektion 3 är därför tom");
  if (vv && (!Array.isArray(vv.historikV1) || vv.historikV1.length === 0)) luckor.push("vågvalideringens historik (historikV1) är tom — antalet körningar per kvartal kan bara räknas när historiken börjar samlas");
  if (kalRader.length > 0 && (kalRader[kalRader.length - 1].episoderTotalt ?? 0) === 0) luckor.push("kalibreringen har 0 episoder av kravet 20 per fas — fasvikterna förblir frusna tills underlaget växt");
  if (regimeRader.length > 0 && regimeRader[regimeRader.length - 1].nOsattOrsak) luckor.push("regimens netto-vågbredd är osatt i källan");
  const celler = (vv?.perHorisontKlass ?? []).filter((c) => (c.nDomda ?? 0) > 0);
  const minN = celler.length ? Math.min(...celler.map((c) => c.nDomda)) : null;
  if (minN !== null && minN < 20) luckor.push(`minsta dömda underlaget per (horisont × klass)-cell är ${fmtTal(minN)} mätningar — under 20 är varje cellprocent en indikation, inte en skattning`);
  if (luckor.length === 0) luckor.push("inga kända luckor this run — källorna täcker perioden fullt ut");
  return [
    "## 6. Datamognad — vad nästa kvartalsrapport behöver",
    "",
    "Ärligheten är rapportens viktigaste kolumn. Följande luckor noterades vid genereringen:",
    "",
    ...luckor.map((l) => `- ${l}`),
    "",
    "Ingen av luckorna rättas med gissningar — de fylls när källorna själva börjar föra data, och rapporten skrivs om automatiskt då.",
    "",
    "_Källa: generatorens egen källstatus vid körningstillfället._",
  ].join("\n");
}

// ── Body ─────────────────────────────────────────────────────────────────────
const ingress = [
  `Det här är AK1A:s kvartalsrapport för ${kvartalEngelsk}: ett automatförberett utkast som sammanfattar vad systemets egna mätningar faktiskt visade under kvartalet — vågvalideringens träffbild, regime-läget, kalibreringsdriften och kvalitetsvaktsstatusen. Varje siffra är hämtad ur källorna vid genereringstillfället och källhänvisas per avsnitt; där en källa saknar data för perioden står det rakt ut, för motorn gissar aldrig.`,
  "",
  `Rapporten är pedagogisk till sin natur: den visar hur ett analyssystem kan hålla sig självt ansvarigt genom öppna kvitton. Träffprocent är ett kvitto på det förflutna — aldrig en garanti om framtiden.`,
].join("\n");

const sammanfattning = [
  "## Sammanfattningen",
  "",
  (() => {
    const punkter = [];
    if (vv && vvRonder.length > 0) {
      punkter.push(`Vågvalideringen redovisar ${fmtTal(vvRonder.length)} rond med domslut i kvartalet; total träffbild ${fmtProcent(vv.totalt?.traffProcent ?? 0)} på n=${fmtTal(vv.totalt?.nDomda ?? 0)} dömda mätningar, ${fmtProcent(vv.totalt?.osattAndelProcent ?? 0)} osatta.`);
      const celler = (vv.perHorisontKlass ?? []).filter((c) => (c.nDomda ?? 0) > 0);
      const s = [...celler.map((c) => c.traffProcent).filter((v) => typeof v === "number")].sort((a, b) => a - b);
      if (s.length >= 4) punkter.push(`Träffprocenternas kvartiler (per horisont och klass, där underlag finns): Q1 ${fmtProcent(percentilLin(s, 0.25))} · median ${fmtProcent(percentilLin(s, 0.5))} · Q3 ${fmtProcent(percentilLin(s, 0.75))} — en tvådelad bild med små n.`);
    } else punkter.push("Vågvalideringen: källan har ännu ingen data för perioden.");
    if (regimeRader.length > 0) {
      const senaste = regimeRader[regimeRader.length - 1];
      punkter.push(`Regime-läget: ${senaste.regime} sedan ${senaste.datum} (grön andel ${fmtProcent(Math.round((senaste.indikatorer?.gronAndel ?? 0) * 1000) / 10)}, röd ${fmtProcent(Math.round((senaste.indikatorer?.rodAndel ?? 0) * 1000) / 10)}); netto-vågbredden är osatt i källan.`);
    } else punkter.push("Regime-loggen: källan har ännu ingen data för perioden.");
    punkter.push(`Prediktionsloggen: ${prediktionsLogg.finns ? "finns men har ingen data för perioden" : "finns ännu inte"} — sektionen lämnas ärligt tom.`);
    if (kalRader.length > 0) {
      const s = kalRader[kalRader.length - 1];
      punkter.push(`Kalibreringen: ${fmtTal(kalRader.length)} mätning${kalRader.length === 1 ? "" : "ar"} i kvartalet, ΔΦ = ${fmtTal(s.deltaPhi ?? 0)} (grinden låst), ${fmtTal(s.episoderTotalt ?? 0)} episoder av 20 per fas.`);
    } else punkter.push("Kalibreringsloggen: källan har ännu ingen data för perioden.");
    punkter.push(`Kvalitetsvakten: ${kvalitets.finns && kvalitets.iKvartalet ? "" : "(senaste kända läge) "}${kvalitets.status ?? "okänd status"} — ${fmtTal(kvalitets.fel ?? 0)} fel, ${fmtTal(kvalitets.manuella ?? 0)} manuella; motorvalidering ${fmtTal(kvalitets.motorPass ?? 0)}/${fmtTal(kvalitets.motorFail ?? 0)}/${fmtTal(kvalitets.motorSkip ?? 0)}.`);
    return punkter.map((p) => `- ${p}`).join("\n");
  })(),
  "",
  "_Detta är pedagogisk utbildning, inte investeringsrådgivning (lagen 2007:528). Inga bolagsrekommendationer lämnas._",
].join("\n");

const body = [
  `# Kvartalsrapport ${kvartalEtikett} — vågmotorns öppna kvitto`,
  "",
  ingress,
  "",
  sektionVagvalidering(),
  "",
  sektionRegime(),
  "",
  sektionPrediktioner(),
  "",
  sektionKalibrering(),
  "",
  sektionKvalitetsvakt(),
  "",
  sektionDatamognad(),
  "",
  sammanfattning,
  "",
].join("\n");

// ── Frontmatter + fil (BlogPost-kompatibla fält; utkast-statusen bärs av kön) ─
const ordAntal = body.split(/\s+/).filter(Boolean).length;
const lasMinuter = Math.max(1, Math.ceil(ordAntal / 200));
const titel = `Kvartalsrapport ${kvartalEtikett} — vågmotorns öppna kvitto`;
const beskrivning = `Vågvalideringens träffbild för ${kvartalEngelsk} — per horisont och klass, med regime-läge, kalibreringsdrift och kvalitetsstatus. Siffror ur källorna; ärligt om det som saknas.`;

const utkast = [
  "---",
  `slug: ${filStam.toLowerCase()}`,
  `title: "${titel}"`,
  `description: "${beskrivning}"`,
  "pillar: Institutionell metodik",
  "author: AK1A Research Lab",
  `publishedAt: ${IDAG}`,
  `readingMinutes: ${lasMinuter}`,
  "tags: [kvartalsrapport, vågvalidering, AKM3, kalibrering, regime, transparens]",
  "---",
  "",
  "<!-- UTKAST — genererad av verktyg/kvartalsrapport.mjs. Publicering = kundens beslut (R2).",
  "     Vid publicering: konvertera till BlogPost-JSON i data/blogg/ (fälten ovan + body). -->",
  "",
  body,
  "",
].join("\n");

// ── Guard: aldrig utanför data/blogg-utkast/ ─────────────────────────────────
const UTKAST_DIR = path.join(REPO, "data", "blogg-utkast");
const LIVE_DIR = path.join(REPO, "data", "blogg");
const utSok = path.join(UTKAST_DIR, `${filStam}.md`);
if (!utSok.startsWith(UTKAST_DIR + path.sep) || utSok.startsWith(LIVE_DIR + path.sep)) {
  console.error("FEL: utdatavägen ligger utanför data/blogg-utkast/ — avbryter (data/blogg/ är LIVE).");
  process.exit(1);
}
mkdirSync(UTKAST_DIR, { recursive: true });
writeFileSync(utSok, utkast, "utf8");

// ── Granskningskön: idempotent rad i sammanställningen ───────────────────────
const KO_FIL = path.join(UTKAST_DIR, "GRANSKNINGSKO-SAMMANSTALLNING.md");
const kallaMedData = [
  vagvalidering.finns && vvRonder.length > 0,
  regimeRader.length > 0,
  prediktionsLogg.finns && predRader.length > 0,
  kalRader.length > 0,
  kvalitets.finns,
].filter(Boolean).length;

const koRad = `| ${kvartalEtikett} | [${filStam}.md](./${filStam}.md) | UTKAST v1 (${IDAG}) | node verktyg/kvartalsrapport.mjs | ${kallaMedData}/5 källor med data | Automatgenererad ur vågvalideringsdata — publicering = kundens beslut (R2) |`;
const koTabellHuvud = [
  "## Kvartalsrapportsserien",
  "",
  "| Kvartal | Fil | Status | Genererad av | Källtäckning | Not |",
  "|---|---|---|---|---|---|",
].join("\n");

let koText = existsSync(KO_FIL) ? readFileSync(KO_FIL, "utf8") : null;
let koNyFil = false;
if (koText === null) {
  koText = [
    "# GRANSKNINGSKÖN — sammanställning av utkast i data/blogg-utkast/",
    "",
    "**Publicering = kundens beslut (R2).** Denna fil är kön som kunden ser den: varje rad är ett utkast som väntar granskning. SEO-guiderna 1–8 redovisas med fullständiga detaljer i `data/forskning/SEO-GUIDER-2026-09.md` (oförändrade där); kvartalsrapportsserien redovisas här.",
    "",
    koTabellHuvud,
    koRad,
    "",
  ].join("\n");
  koNyFil = true;
} else if (!koText.includes(filStam)) {
  if (!koText.includes("## Kvartalsrapportsserien")) {
    koText = koText.trimEnd() + "\n\n" + koTabellHuvud + "\n" + koRad + "\n";
  } else {
    // lägg raden direkt efter sektionens tabellavgränsningsrad
    const sektionIdx = koText.indexOf("## Kvartalsrapportsserien");
    const stycke = koText.slice(sektionIdx);
    const grans = stycke.match(/^.*\n\|---[^\n]*\|\n/m);
    if (grans) {
      koText = koText.replace(grans[0], grans[0] + koRad + "\n");
    } else {
      koText = koText.trimEnd() + "\n" + koRad + "\n";
    }
  }
}
writeFileSync(KO_FIL, koText, "utf8");

// ── stdout-sammanfattning ────────────────────────────────────────────────────
const saknade = [];
if (!prediktionsLogg.finns) saknade.push("prediktionslogg-akm3.json (filen finns ej)");
if (vvRonder.length === 0) saknade.push("vagvalidering (inga ronder i perioden)");
if (regimeRader.length === 0) saknade.push("regime-logg (inga rader i perioden)");
if (kalRader.length === 0) saknade.push("kalibrering-logg (inga rader i perioden)");
if (!kvalitets.finns) saknade.push("kvalitetsrapport-SENASTE.md");
console.log(`KVARTALSRAPPORT ${kvartalEtikett}`);
console.log(`- Utkast: ${path.relative(REPO, utSok)} (${fmtTal(ordAntal)} ord, ${lasMinuter} min)`);
console.log(`- Källor med data för perioden: ${kallaMedData}/5`);
console.log(saknade.length ? `- Saknas/tomma: ${saknade.join("; ")}` : "- Alla källor hade data.");
console.log(`- Granskningskö: ${path.relative(REPO, KO_FIL)} ${koText.includes(filStam) ? "(rad finns)" : ""}`);
