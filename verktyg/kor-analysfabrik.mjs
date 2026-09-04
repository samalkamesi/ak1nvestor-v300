#!/usr/bin/env node
/**
 * AK1A — ANALYSFABRIKEN (våg 56 bygg-B): genererar det automatiska
 * Forskningsbiblioteket ur befintliga motorlager — ingen ny datainsamling.
 *
 * Byggplan: data/forskning/STYRELSE-analysbibliotek.md §2.1–§2.2.
 *
 * KÄLLOR (alla läs-only):
 *   - data/portfolj-system/korstabell-grund.json   (urvalets sanningskälla;
 *     våg 57 D2: raderna bär även akm2/akm2Skillnad/akm2Moduler)
 *   - data/portfolj-system/bolagsunivers.json      (land/valuta/golv)
 *   - data/cache/akm1-{TICKER}.json                (poäng + motiveringar ORDAGRAT)
 *   - data/cache/fvag-{TICKER}.json                (våganteckningar per variabel)
 *   - data/cache/akm2-{TICKER}.json                (AKM2-resultat + profil —
 *     verktyg/kor-akm2-berika.mjs, våg 57 D2; raknaAKM2 med automatiska
 *     moduler ur modulregistret och viktprofil akm2-2026)
 *
 * KANDIDATREGLN v1 (STYRELSE §2.1 — deterministisk, simulering = 22 bolag):
 *   portV19 = false                                  (hårt port: kassatäckning)
 *   AND ( status = "grön" AND datatackning ≥ 0,60 )  (D1:s gröna regel; < 0,70
 *                                                     ⇒ varningsetikett)
 *   OR  ( status = "gul" AND datatackning ≥ 0,70
 *         AND akm1Totalt/akm1MaxMojligt ≥ 0,65 )
 *
 * UTDATA: data/forskningsbiblioteket/{TICKER}.json per kandidat enligt
 * schemat analysfabrik-v1 (ticker sanerad som filnamn: '.' → '_', samma
 * mönster som data/cache — fältet `ticker` bär alltid den äkta symbolen).
 *
 * ÄRLIGHETSLINJER (kundkultur):
 *   - Motiveringar citeras ORDAGRAT ur akm1-cachen — fabrikens texter läggs
 *     ALDRIG i munnen på bedömningsmotorn.
 *   - "osatt" skrivs "osatt" (FVag-motorn gissar aldrig).
 *   - Minst tre MÄTBARA falsifieringsvillkor per analys med variabel-ID +
 *     tröskel — inga "kan gå ner"-fraser.
 *   - Etikett + disclaimer enligt lag (2007:528): forskningsunderlag, aldrig
 *     rådgivning — inga köp-/sälj-/rekommendera-ord i genererad text.
 *
 * Användning:  node verktyg/kor-analysfabrik.mjs
 * Avslutskod:  0 om urvalet skrevs, 1 vid datafel.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KORSTABELL = path.join(REPO, "data", "portfolj-system", "korstabell-grund.json");
const UNIVERS = path.join(REPO, "data", "portfolj-system", "bolagsunivers.json");
const CACHE = path.join(REPO, "data", "cache");
const UTFALL = path.join(REPO, "data", "forskningsbiblioteket");

// ── Trösklar (STYRELSE §2.1 — kanoniska) ────────────────────────────────────
const TACKNING_GUL = 0.7; // publikt biblioteksgolv för gul
const TACKNING_GRON_MIN = 0.6; // D1:s gröna regel
const TACKNING_VARNING = 0.7; // grön under 70 % ⇒ varningsetikett
const REL_GUL = 0.65; // gul kräver AKM1 ≥ 65 % av max

const VERSIONSDATUM = new Date().toISOString().slice(0, 10);

// ── V01–V20 (ur src/lib/akm2/karna.ts VARIABEL_META — namn + kurssluggar) ──
const VARIABEL = {
  V01: { namn: "Försäljningstillväxt", kursSlug: "v01-forsaljningstillvaxt" },
  V02: { namn: "ARR-tillväxt", kursSlug: "v02-arr-tillvaxt" },
  V03: { namn: "Intäktsdiversifiering", kursSlug: "v03-intaktsdiversifiering" },
  V04: { namn: "P/S", kursSlug: "v04-ps" },
  V05: { namn: "P/B", kursSlug: "v05-pb" },
  V06: { namn: "EV/EBITDA", kursSlug: "v06-ev-ebitda" },
  V07: { namn: "Bruttomarginal", kursSlug: "v07-bruttomarginal" },
  V08: { namn: "EBITDA-marginal", kursSlug: "v08-ebitda-marginal" },
  V09: { namn: "ROE", kursSlug: "v09-roe" },
  V10: { namn: "Skuldsättningsgrad", kursSlug: "v10-skuldsattningsgrad" },
  V11: { namn: "Likviditet", kursSlug: "v11-likviditet" },
  V12: { namn: "Intäktsstabilitet", kursSlug: "v12-intaktsstabilitet" },
  V13: { namn: "Patent & IP", kursSlug: "v13-patent-ip" },
  V14: { namn: "Varumärke", kursSlug: "v14-varumarke" },
  V15: { namn: "Nätverkseffekter", kursSlug: "v15-natverkseffekter" },
  V16: { namn: "Produktlanseringar", kursSlug: "v16-produktlanseringar" },
  V17: { namn: "Avtal & Partnerskap", kursSlug: "v17-avtal-partnerskap" },
  V18: { namn: "Regulatoriska", kursSlug: "v18-regulatoriska" },
  V19: { namn: "Kassatäckning — nyemissionsrisk", kursSlug: "v19-kapitalforbranning" },
  V20: { namn: "Återköp av egna aktier", kursSlug: "v20-aterekop-egna-aktier" },
};
const KATEGORI_ETIKETT = {
  tillvaxt: "Tillväxt",
  vardering: "Värdering",
  lonsamhet: "Lönsamhet",
  stabilitet: "Stabilitet",
  moat: "Moat",
  katalysator: "Katalysator",
  risk: "Risk",
};
const HORIZONTER = ["mikro", "kort", "medellang", "lang", "mega"];
const CYKLISKA = ["konsument", "industri", "material", "energi"];

/** Sanera ticker till filnamn (samma mönster som verktyg/kor-fvag.mjs). */
function tickerFil(ticker) {
  if (!ticker || ticker.includes("..")) throw new Error("ogiltig ticker: " + ticker);
  const rensat = ticker.replace(/[^A-Za-z0-9._-]/g, "_");
  if (!rensat || rensat.startsWith(".")) throw new Error("ogiltig ticker efter sanering: " + ticker);
  return rensat.replace(/\./g, "_");
}

function lasJson(fil) {
  return JSON.parse(readFileSync(fil, "utf8"));
}

function r1(x) {
  return Math.round(x * 10) / 10;
}
function r4(x) {
  return Math.round(x * 10000) / 10000;
}

/** Ärlig procenttext: 0.688 → "68,8 %". */
function pct(x, decimaler = 1) {
  return (x * 100).toFixed(decimaler).replace(".", ",") + " %";
}

// ── Mallar: mätbara falsifieringströsklar per variabel (§2.2) ───────────────
const FALSK_TROSKEL = {
  V01: "V01 försäljningstillväxten under 0 % rullande 12 månader i nästa rapport",
  V04: "V04 P/S över 5× i nästa mätning",
  V05: "V05 P/B över 3× i nästa mätning",
  V06: "V06 EV/EBITDA över 12× i nästa mätning",
  V07: "V07 bruttomarginalen under 30 % i nästa årsredovisning",
  V08: "V08 EBITDA-marginalen under 10 % i nästa årsredovisning",
  V09: "V09 ROE under 15 % i nästa årsredovisning",
  V10: "V10 skuldsättningsgraden över 1,5 i nästa balansräkning",
  V19: "V19 kassatäckning under 12 månader inom 2 kvartal",
};

function falsifieringVillkor(rad, akm1, starkastVariabel, lagTackning) {
  const statusOrd = rad.status === "gron" ? "grön" : rad.status === "gul" ? "gul" : rad.status;
  const statusEtikett = lagTackning && rad.status === "gron" ? "grön (låg täckning)" : statusOrd;
  const villkor = [
    // 1. Hårdaporten — kundkulturens signaturexempel (§2.1/§2.2)
    `V19 kassatäckning < 12 mån inom 2 kvartal falsifierar ${statusEtikett}-statusen — portV19 aktiveras och raden blir röd enligt korstabellens D1-regel.`,
    // 2. Våggrunden
    `fvagDynamik → "försvagas" i nästa korstabellkörning falsifierar urvalsgrunden — kandidaturen omprövas omgående (dynamiken är ${rad.fvagDynamik} i dagens underlag).`,
    // 3. Täckningsgolvet
    `datatackning < ${TACKNING_GRON_MIN.toLocaleString("sv-SE")} i nästa leverans falsifierar statusgrunden — grön kräver ≥ 60 % (D1), det publika biblioteket ≥ 70 %; ${rad.ticker} ligger på ${pct(rad.datatackning)} i dag.`,
  ];
  // 4. Starkaste variabeln — variabelspecifik tröskel när mall finns
  if (starkastVariabel && FALSK_TROSKEL[starkastVariabel.id]) {
    villkor.push(
      `${FALSK_TROSKEL[starkastVariabel.id]} falsifierar tesen för ${KATEGORI_ETIKETT[starkastVariabel.kategori]?.toLowerCase() || "kategorin"} — AKM1-profilens starkaste ben (${starkastVariabel.id} ${starkastVariabel.namn}, ${starkastVariabel.poang}/5 p i dag).`,
    );
  } else if (starkastVariabel) {
    villkor.push(
      `${starkastVariabel.id} (${starkastVariabel.namn}) sjunker till ≤ 2/5 p i nästa AKM1-mätning falsifierar tesen för ${KATEGORI_ETIKETT[starkastVariabel.kategori]?.toLowerCase() || "kategorin"} — profilens starkaste ben bär urvalet.`,
    );
  }
  // 5. Statusbandet
  if (rad.status === "gul") {
    villkor.push(
      `relativ AKM1 under 0,50 i nästa mätning falsifierar gul-statusen (→ röd enligt D1) — idag ${pct(rad.akm1Totalt / rad.akm1MaxMojligt)}.`,
    );
  } else {
    villkor.push(
      `relativ AKM1 under 0,70 i nästa mätning falsifierar grön-statusen (→ gul enligt D1) — idag ${pct(rad.akm1Totalt / rad.akm1MaxMojligt)}.`,
    );
  }
  return villkor;
}

function riskmall(rad, akm1, universPost, osatta, lagTackning) {
  const risker = [];
  const poang = akm1.poang || {};
  const satta = Object.keys(poang).filter((v) => !osatta.includes(v));
  // 1. Osattheten — alltid först (ärlighet är varumärket)
  risker.push(
    `${osatta.length} av 20 AKM1-variabler är osatta i underlaget (${osatta.join(", ")}) — analysen bygger på ${satta.length} mätta variabler, inte hela modellen.`,
  );
  // 2. Investmentbolagsprofil (INDU-C/INVE-B — navet i våg 56:s namnverifiering)
  if (/industrivärden|investor ab/i.test(rad.namn || "")) {
    risker.push(
      "Investmentbolagsprofil: P/E, marginaler och P/B speglar innehavens marknadsvärden (substans), inte en driftsrörelse — nyckeltalen är inte jämförbara med driftsbolag och resultatet svänger med börsen.",
    );
  }
  // 3. Cyklisk bransch + svag intäktsstabilitet
  if (CYKLISKA.includes(rad.bransch) && satta.includes("V12") && poang["V12"] <= 2) {
    risker.push(
      `Intäktsvolatilitet: V12 intäktsstabilitet ${poang["V12"]}/5 p i cyklisk bransch (${rad.bransch}).`,
    );
  }
  // 4. Värderingsrisk
  if (satta.includes("V05") && poang["V05"] <= 2) {
    risker.push(`Värderingsrisk: V05 P/B ${poang["V05"]}/5 p — högt betalt värderingsläge relativt bokfört kapital.`);
  }
  // 5. Osatt likviditet
  if (osatta.includes("V11")) {
    risker.push("Likviditet (V11) osatt — balansräkningsdata saknas i källorna, likviditetsrisken kan inte bedömas.");
  }
  // 6. Fastigheters räntkänslighet
  if (rad.bransch === "fastighet") {
    risker.push("Räntekänslighet: fastighetsvärdena bakom NAV-proxyn sjunker med stigande avkastningskrav — golvet rör på sig.");
  }
  // 7. Låg täckning / gul status
  if (lagTackning) {
    risker.push(
      `Låg datatackning: ${pct(rad.datatackning)} under biblioteksgolvet 70 % — grön-statusen vilar på D1:s 60 %-regel och varningsetiketten är satt.`,
    );
  } else if (rad.status === "gul") {
    risker.push(
      `Gul status: AKM1 ${pct(rad.akm1Totalt / rad.akm1MaxMojligt)} av max — mellanskiktet; en svag mätning till flyttar raden mot rött.`,
    );
  }
  // 8. Dubbelkällsbrist (ur bolagsuniversets notering — data-sant)
  if (/marketstack/i.test(universPost.notering || "")) {
    risker.push(
      "Dubbelkällsbrist: källa B (MarketStack) saknade färsk kurs vid insamlingen — pris och värdering dubbelkollades ej (notering i bolagsuniverset).",
    );
  }
  // 9. Räntetäckning osatt (ur bolagsuniversets stabilitetsfält)
  if (universPost.stabilitet && universPost.stabilitet.rantaTackning === null) {
    risker.push(
      "Räntetäckning osatt — räntekostnad saknas för senaste räkenskapsåret (notering i bolagsuniverset); skuldbördans kostnadssida är inte mätt.",
    );
  }
  // 10. ALLTID SIST: underlagets natur (garanterar ≥3 risker tillsammans med #1)
  risker.push(
    "Automatiskt underlag: en 1-sidig översikt ur 20 variabler — beslutsdjupet (scenarier, Monte Carlo, vågmatris) tillverkas endast i grundarens manuella analys.",
  );
  return risker.slice(0, 5);
}

function vaglagTolkning(rad, fvag) {
  const sattaHz = HORIZONTER.filter((h) => (rad.fvagPerHorisont || {})[h] !== "osatt");
  const klassadeVar = fvag?.perVariabel
    ? Object.values(fvag.perVariabel).filter((v) => v.klass && v.klass !== "osatt").length
    : 0;
  if (sattaHz.length === 0) {
    return `Fundamentala vågor ej klassade på aggregatnivå: FVag-motorn kräver tidsserier (omsättning, marginaler, värderingsmultipler över tid) som underlaget saknar — "osatt" är osatt, motorn gissar aldrig. Endast ${klassadeVar} av 20 variabler har klassbar vågdata; dynamiken (${rad.fvagDynamik}) är det enda vågspåret.`;
  }
  const lista = sattaHz.map((h) => `${h} ${rad.fvagPerHorisont[h]}`).join(", ");
  return `Klassade horisonter: ${lista} — övriga ${5 - sattaHz.length} osatt (tidsserier saknas i källorna). ${klassadeVar} av 20 variabler har klassbar vågdata; dynamiken är ${rad.fvagDynamik}.`;
}

// ── Huvudflöde ──────────────────────────────────────────────────────────────

const korstabell = lasJson(KORSTABELL);
const univers = lasJson(UNIVERS);
const universMap = new Map(univers.map((b) => [b.ticker, b]));
const rader = korstabell.rader || [];

// (A) URVAL — kandidatregeln v1
const kandidater = [];
for (const rad of rader) {
  if (!rad.ticker || !rad.akm1MaxMojligt) continue;
  const rel = rad.akm1Totalt / rad.akm1MaxMojligt;
  const gronOk = rad.status === "gron" && rad.datatackning >= TACKNING_GRON_MIN;
  const gulOk =
    rad.status === "gul" && rad.datatackning >= TACKNING_GUL && rel >= REL_GUL;
  if (rad.portV19 === false && (gronOk || gulOk)) {
    kandidater.push({ rad, rel, lagTackning: rad.datatackning < TACKNING_VARNING });
  }
}

if (kandidater.length === 0) {
  console.error("INGA kandidater — korstabellen kan inte stämma. Avbryter.");
  process.exit(1);
}

// Rankning (§2.1 bloggformel; konfluens saknas i MVP ⇒ omfördelat proportionellt)
const DYN_BONUS = { forbattras: 1.0, stabilt: 0.6, osatt: 0, forsvamras: 0 };
function rankPoang(k) {
  const poang =
    0.5 * k.rel + 0.2 * (DYN_BONUS[k.rad.fvagDynamik] ?? 0) + 0.15 * k.rad.datatackning;
  return r4(poang / 0.85);
}
kandidater.sort((a, b) => rankPoang(b) - rankPoang(a) || a.rad.ticker.localeCompare(b.rad.ticker));

mkdirSync(UTFALL, { recursive: true });

// (B) GENERERING — en analysfabrik-v1-fil per kandidat
let skrivna = 0;
const rapport = [];
for (const k of kandidater) {
  const { rad, rel, lagTackning } = k;
  const fil = tickerFil(rad.ticker);
  const akm1 = lasJson(path.join(CACHE, `akm1-${fil}.json`));
  let fvag = null;
  try {
    fvag = lasJson(path.join(CACHE, `fvag-${fil}.json`));
  } catch {
    fvag = null; // ärlighet: vågläget skrivs ur korstabellen ensam
  }
  // Våg 57 D2: AKM2-blocket ur beriknings-cachen (raknaAKM2, moduler auto,
  // viktprofil akm2-2026) + radens berikade fält. Saknas cachen är blocket
  // null — fabriken hittar aldrig på AKM2-siffror.
  let akm2Cache = null;
  try {
    akm2Cache = lasJson(path.join(CACHE, `akm2-${fil}.json`));
  } catch {
    akm2Cache = null;
  }
  const akm2Profil = akm2Cache?.profil ?? null;
  const akm2Block =
    akm2Profil || rad.akm2 != null
      ? {
          totalt: typeof rad.akm2 === "number" ? rad.akm2 : null,
          skillnad: typeof rad.akm2Skillnad === "number" ? rad.akm2Skillnad : null,
          viktprofil: akm2Profil?.viktprofil ?? "akm2-2026",
          modellVersion: akm2Profil?.modellVersion ?? null,
          band: akm2Profil?.band ?? null,
          portAktiv: akm2Profil?.portAktiv ?? false,
          aktivaModuler: akm2Profil?.moduler ?? [],
          modulVariablerSatta: akm2Profil?.modulVariablerSatta ?? [],
          modulVariablerOsatta: akm2Profil?.modulVariablerOsatta ?? [],
          dynamikPaverkan: akm2Profil?.dynamikPaverkan ?? null,
          omfordelningText: akm2Profil?.omfordelningText ?? null,
          osakerhetNote: akm2Profil?.osakerhetNote ?? null,
          radModuler: Array.isArray(rad.akm2Moduler) ? rad.akm2Moduler : [],
          kalla:
            "data/cache/akm2-" + fil + ".json (verktyg/kor-akm2-berika.mjs, våg 57 D2) — raknaAKM2 med automatiska moduler ur modulregistret + viktprofil akm2-2026",
        }
      : null;
  const u = universMap.get(rad.ticker) || {};

  // Osatta variabler = motiveringen inleds med "osatt" (bedömarens egen markering)
  const osatta = Object.entries(akm1.motivering || {})
    .filter(([, m]) => /^osatt/i.test(String(m).trim()))
    .map(([v]) => v)
    .sort();

  // Topp/botten-3 bland SATTA variabler (poäng + motivering ORDAGRAT).
  // Kategori per variabel ur AKM1:s fack (V01–V03 tillväxt, V04–V06 värdering,
  // V07–V09 lönsamhet, V10–V12 stabilitet, V13–V15 moat, V16–V18 katalysator,
  // V19–V20 risk) — samma indelning som akm2/karna.ts VARIABEL_META.
  function kategoriFor(v) {
    if (["V01", "V02", "V03"].includes(v)) return "tillvaxt";
    if (["V04", "V05", "V06"].includes(v)) return "vardering";
    if (["V07", "V08", "V09"].includes(v)) return "lonsamhet";
    if (["V10", "V11", "V12"].includes(v)) return "stabilitet";
    if (["V13", "V14", "V15"].includes(v)) return "moat";
    if (["V16", "V17", "V18"].includes(v)) return "katalysator";
    if (["V19", "V20"].includes(v)) return "risk";
    return "";
  }
  const sattaLista = Object.entries(akm1.poang || {})
    .filter(([v]) => !osatta.includes(v))
    .map(([v, p]) => ({
      id: v,
      namn: VARIABEL[v]?.namn || v,
      poang: p,
      kategori: kategoriFor(v),
      motivering: String(akm1.motivering?.[v] || "").trim(),
    }));
  const ranking = sattaLista
    .slice()
    .sort((a, b) => b.poang - a.poang || a.id.localeCompare(b.id));
  const topp3 = ranking.slice(0, 3);
  const botten3 = ranking.slice(-3).reverse();

  const perKategori = akm1.perKategori || {};
  const starkast = Object.entries(perKategori).sort((a, b) => b[1] - a[1])[0]?.[0] || "osatt";
  const svagast = Object.entries(perKategori).sort((a, b) => a[1] - b[1])[0]?.[0] || "osatt";
  const starkastVar = topp3[0]
    ? { id: topp3[0].id, namn: topp3[0].namn, poang: topp3[0].poang, kategori: starkast }
    : null;

  const statusEtikett =
    rad.status === "gron"
      ? lagTackning
        ? "grön (låg täckning)"
        : "grön"
      : rad.status === "gul"
        ? "gul"
        : rad.status;

  const golvMarginal = rad.golvMarginal ?? null;
  const golv =
    golvMarginal !== null
      ? {
          typ: "NAV-proxy",
          marginal: r4(golvMarginal),
          not: "Bokfört eget kapital per aktie som NAV-proxy (fastighetsundantaget) — NCAV-data saknas hos källorna.",
        }
      : {
          typ: "osatt",
          marginal: null,
          not: "golvMarginal är null i korstabellen — värdegolvdata (NCAV/NAV) levereras inte av källorna ännu (känt, dokumenterat i manifestet).",
        };

  // Kurser: 2–3 sluggar efter starkaste variabler (kursnav-hubben länkar vidare)
  const kurser = [...new Set(topp3.map((t) => VARIABEL[t.id]?.kursSlug).filter(Boolean))].slice(0, 3);

  const analys = {
    schema: "analysfabrik-v1",
    ticker: rad.ticker,
    namn: rad.namn,
    bransch: rad.bransch,
    land: u.land || null,
    valuta: u.valuta || null,
    versionsdatum: VERSIONSDATUM,
    underlagSenastKontrollerad: rad.senastKontrollerad || null,
    genereradAv: "verktyg/kor-analysfabrik.mjs (våg 56 bygg-B + våg 57 D2 akm2-block)",
    urval: {
      regel:
        'kandidatregeln v1: portV19=false OCH (grön OCH täckning≥0,60 ELLER gul OCH täckning≥0,70 OCH AKM1/max≥0,65) — STYRELSE-analysbibliotek §2.1',
      status: rad.status,
      statusEtikett,
      relativAkm1: r4(rel),
      datatackning: r4(rad.datatackning),
      portV19: false,
      varning: lagTackning ? `grön rad under 70 % täckning (${pct(rad.datatackning)}) — etiketterad "grön (låg täckning)"` : null,
    },
    rankPoang: rankPoang(k),
    akm1: {
      totalt: r1(rad.akm1Totalt),
      maxMojligt: r1(rad.akm1MaxMojligt),
      relativ: r4(rel),
      perKategori,
      starkast,
      svagast,
      osattaVariabler: osatta,
      antalOsatta: osatta.length,
      topp3Motiveringar: topp3.map((t) => ({
        variabel: t.id,
        namn: t.namn,
        poang: t.poang,
        motivering: t.motivering,
      })),
      botten3Motiveringar: botten3.map((t) => ({
        variabel: t.id,
        namn: t.namn,
        poang: t.poang,
        motivering: t.motivering,
      })),
    },
    akm2: akm2Block,
    vaglage: {
      perHorisont: HORIZONTER.reduce((acc, h) => {
        acc[h] = rad.fvagPerHorisont?.[h] || "osatt";
        return acc;
      }, {}),
      fvagDynamik: rad.fvagDynamik,
      tolkning: vaglagTolkning(rad, fvag),
    },
    konfluens: null, // MVP: ej mätt — live-Yahoo per max 10 tickers lagras inte (§2.1)
    golv,
    risker: riskmall(rad, akm1, u, osatta, lagTackning),
    falsifiering: falsifieringVillkor(rad, akm1, starkastVar, lagTackning),
    lasMer: {
      bloggSlug: null, // fylls av verktyg/kor-analysblogg.mjs (tvåvägslänk)
      kurser,
      analysSida: `/forskningsbiblioteket/${encodeURIComponent(rad.ticker)}`,
    },
    etikett: "Automatiskt forskningsunderlag — ej grundarens 99-sidorsanalys",
    disclaimer:
      "Forskningsunderlag — ej rådgivning. Pedagogisk forskning, aldrig investeringsrådgivning (lagen 2007:528).",
  };

  writeFileSync(
    path.join(UTFALL, `${fil}.json`),
    JSON.stringify(analys, null, 1) + "\n",
    "utf8",
  );
  skrivna += 1;
  rapport.push(
    `${rad.ticker.padEnd(10)} ${String(rad.namn).slice(0, 34).padEnd(34)} ${statusEtikett.padEnd(21)} rel ${pct(rel).padStart(7)}  täck ${pct(rad.datatackning).padStart(7)}  akm2 ${String(rad.akm2 ?? "—").padStart(4)}  rank ${rankPoang(k)}`,
  );
}

const svenska = kandidater.filter((k) => (universMap.get(k.rad.ticker)?.land || "") === "Sverige");
console.log(`ANALYSFABRIKEN: ${skrivna} analyser → data/forskningsbiblioteket/`);
console.log(`  svenska kandidater: ${svenska.map((k) => k.rad.ticker).join(", ")}`);
console.log(rapport.join("\n"));
process.exit(0);
