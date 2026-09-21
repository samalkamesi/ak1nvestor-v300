/**
 * LANDASPEKTER — sverige + usa + danmark + schweiz + tyskland + australien + japan + frankrike + storbritannien för /dataset/[bransch]/[aspekt]
 * ====================================================================================
 * Tema 4 ur data/forskning/sokord/bransch-teman.md (§4): "svenska
 * [bransch]bolag — så ligger de mot branschmedianen". Två moduler (slug
 * "sverige" och "usa") som filtrerar forskningsuniversumet på land-fältet
 * och sammanfattar SAMMA fem publika nyckeltal som /dataset:s
 * branschmedianer: P/E, P/B, EBIT-marginal, FCF-marginal och
 * omsättningstillväxt TTM. Titeln är ett "så jämför du"-mönster (§6:
 * ALDRIG "bäst svenska aktier").
 *
 * GRÄNSDRAGNING (A2-DATASET-KONTRAKT §1, samma princip som kontraktet):
 *  - PUBLIKT: median/kvartiler/min/max av de fem publika nyckeltalen per
 *    land × bransch, med n-redovisning per mått.
 *  - ALDRIG i utdata: AKM-poäng, vågklasser, status, golv, portV19 — och
 *    INGA bolagsnamn eller tickers. Typen nedan (DatasetUniversumRad +
 *    land) är den strukturella gränsvakten: namn, tickers, serier och
 *    poäng finns helt enkelt inte i den.
 *  - Kontraktets AspektUniversumRad bär inte ebitMarginal/fcfMarginal/
 *    omsattningTillvaxtTTM, men matTabell kräver alla fem dataset-
 *    nyckeltalen — därför läser denna modul samma fil med dataset-
 *    medianernas publika utsnitt + land (egen modulcache, samma mönster
 *    som lasAspektUniversum: kastar vid oläslig fil, svensk kollation).
 *  - Gränsregeln (< 5 mätta ⇒ opublicerad) fattas av SLUTLED-registret —
 *    modulen räknar alltid ärligt (matta = antal mätta P/E-bolag) och
 *    returnerar null för okänd bransch SAMT sedan u5:s vit-test även när
 *    huvudmåttets matta < MIN_MATTA (dubbelgrind: ett enbolags-P/E kan
 *    aldrig läcka ut som gruppmedian oavsett vem som anropar).
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import type { AspektModule, AspektSida, AspektStat } from "../dataset-aspekter-kontrakt";
import { hittaKurslankar, MIN_MATTA, sammanfatta } from "../dataset-aspekter-kontrakt";
import { branschNamn, type DatasetUniversumRad } from "../dataset-medianer";

// ── Universumet — publikt land-utsnitt (EN källa, modulcache) ───────────────

/**
 * Land-raden = dataset-medianernas publika utsnitt (bransch + DE FEM
 * nyckeltalen) plus land-fältet. Strukturell gränsvakten: det finns inget
 * sätt att nå namn, tickers eller poäng från denna modul.
 */
type LandUniversumRad = DatasetUniversumRad & {
  land?: string | null;
};

let landCache: LandUniversumRad[] | null = null;

/**
 * Läs bolagsunivers.json → land-rader, cachat i modulminnet (100 rader parsas
 * en gång per process). Kastar vid oläslig fil — en landaspektsida ska ALDRIG
 * tyst rendera påhittade medianer. Svensk kollation på (bransch, land) för
 * determinism vid uppbyggnad och ISR-omrendering.
 */
function lasLandRader(): LandUniversumRad[] {
  if (landCache) return landCache;
  const fil = path.join(process.cwd(), "data", "portfolj-system", "bolagsunivers.json");
  const radata = JSON.parse(readFileSync(fil, "utf8")) as LandUniversumRad[];
  const rader = (Array.isArray(radata) ? radata : []).slice();
  rader.sort(
    (a, b) =>
      String(a.bransch ?? "").localeCompare(String(b.bransch ?? ""), "sv") ||
      String(a.land ?? "").localeCompare(String(b.land ?? ""), "sv"),
  );
  landCache = rader;
  return rader;
}

// ── Språk-hjälpare ───────────────────────────────────────────────────────────

/**
 * Branschens visningsnamn → naturligt sammansatt bolagsord för titeln
 * ("Fastighet" → "fastighetsbolag" — fog-s och allt). Okänd nyckel (ny
 * bransch utan egen rad) ⇒ generisk sammansättning; titeln håller alltid
 * läsbar svenska.
 */
const BOLAGORD: Record<string, string> = {
  teknik: "teknikbolag",
  industri: "industribolag",
  halso: "hälsobolag",
  konsument: "konsumentbolag",
  fastighet: "fastighetsbolag",
  finans: "finansbolag",
  material: "materialbolag",
  energi: "energibolag",
  kommunikation: "kommunikationsbolag",
  tillvaxt: "tillväxtbolag",
};

function bolagord(visningsnamn: string): string {
  const nyckel = visningsnamn.trim().toLowerCase();
  return BOLAGORD[nyckel] ?? `${nyckel}bolag`;
}

/** Tal → svensk skrivning med en decimal ("12,3 %" / "18,4"); osatt är osatt. */
function tal(v: number | null, enhet: "procent" | "multipl"): string {
  if (v === null) return "osatt";
  const s = v.toFixed(1).replace(".", ",");
  return enhet === "procent" ? `${s} %` : s;
}

/** AspektStat → matTabell-rad (etikett + median + matta + enhet). */
function matRad(
  etikett: string,
  stat: AspektStat,
  enhet: "procent" | "multipl",
): NonNullable<AspektSida["matTabell"]>[number] {
  return { etikett, median: stat.median, matta: stat.matta, enhet };
}

// ── Modulbyggaren — en metod för båda länderna ───────────────────────────────

type LandKonfig = {
  slug: string;
  /** Exakt värde i universumets land-fält ("Sverige" / "USA"). */
  land: string;
  /** Förled i titel och beskrivning ("Svenska" / "Amerikanska"). */
  forled: string;
  /** Landets namn i löptext ("Sverige" / "USA"). */
  landNamn: string;
  /** Hela valuta-jämförelsemeningen (SEK vs USD — jämförbarhetsfällan). */
  valutaMening: string;
};

function byggLandAspekt(k: LandKonfig): AspektModule {
  return {
    slug: k.slug,
    titel: (namn) => `${k.forled} ${bolagord(namn)} — nyckeltal mot branschmedianen`,
    generera: (branschSlug) => {
      const rader = lasLandRader();
      if (!rader.some((r) => r.bransch === branschSlug)) return null; // okänd bransch ⇒ 404
      const namn = branschNamn("sv", branschSlug);
      const ordet = bolagord(namn);
      const iLandet = rader.filter((r) => r.land === k.land);
      const bolag = iLandet.filter((r) => r.bransch === branschSlug);

      // De FEM publika dataset-nyckeltalen — samma fält och samma hjälpare
      // (sammanfatta) som /dataset:s branschmedianer, men på landets bolag.
      const pe = sammanfatta(bolag.map((b) => b.vardering?.pe ?? null), false);
      // Sidnivåns gränsregel (u5:s vit-test): under MIN_MATTA mätta P/E-bolag
      // returneras ingen sida alls — slutledet publicerar den heller inte, och
      // ett enstaka bolags P/E kan aldrig läcka ut som gruppens "median".
      if (pe.matta < MIN_MATTA) return null;
      const pb = sammanfatta(bolag.map((b) => b.vardering?.pb ?? null), false);
      const ebit = sammanfatta(bolag.map((b) => b.lonksamhet?.ebitMarginal ?? null), true);
      const fcf = sammanfatta(bolag.map((b) => b.lonksamhet?.fcfMarginal ?? null), true);
      const tillvaxt = sammanfatta(bolag.map((b) => b.tillvaxt?.omsattningTillvaxtTTM ?? null), true);

      const matTabell: AspektSida["matTabell"] = [
        matRad("P/E", pe, "multipl"),
        matRad("P/B", pb, "multipl"),
        matRad("EBIT-marginal", ebit, "procent"),
        matRad("FCF-marginal", fcf, "procent"),
        matRad("Omsättningstillväxt (TTM)", tillvaxt, "procent"),
      ];

      const ingress =
        `Universumets ${rader.length} bolag har ${iLandet.length} bolag med ` +
        `${k.landNamn} i land-fältet; av dem tillhör ${bolag.length} branschen ${namn.toLowerCase()}. ` +
        (pe.median === null
          ? `Inget av dem har ett mätt P/E-värde ännu — tabellen redovisar därför sitt eget antal mätta per nyckeltal. `
          : `P/E är mätt för ${pe.matta} av dem och medianen ligger på ${tal(pe.median, "multipl")} ` +
            `(kvartilerna ${tal(pe.p25, "multipl")}–${tal(pe.p75, "multipl")}). `) +
        `Så jämför du ${k.forled.toLowerCase()} ${ordet} med branschens median — urval, valuta och metod först.`;

      const saRaknas = [
        `Urval: av universumets ${rader.length} bolag har ${iLandet.length} stycken ${k.landNamn} i land-fältet — ` +
          `den här sidan räknar vidare på de ${bolag.length} som tillhör branschen ${namn.toLowerCase()}.`,
        `Land-fältet är registerdata om bolagets hemmamarknad i källmaterialet — inte en bedömning av ` +
          `var bolaget omsätter mest eller var dess verksamhet står starkast.`,
        `Per bolag läses fem publika nyckeltal ur bolagsunivers.json — P/E, P/B, EBIT-marginal, ` +
          `FCF-marginal och omsättningstillväxt TTM — och median, kvartiler (P25/P75) samt antal mätta ` +
          `(matta) räknas med exakt samma hjälpare som branschmedianerna på /dataset: landstal och ` +
          `branschtal kan aldrig skilja sig åt i metod.`,
        `Saknad eller icke-ändlig data räknas aldrig som noll — här är P/E mätt för ${pe.matta} av ` +
          `${bolag.length} bolag, och varje rad i tabellen redovisar sitt eget matta.`,
        `Gränsregel: under 5 mätta bolag publiceras sidan inte alls (slutledet hopar den) — därför ` +
          `visar den här sidan bara ärligt räknade tal, aldrig påhittade medianer.`,
        `Andelar (marginaler, tillväxt) omvandlas till procenttal med en decimal; multipler redovisas ` +
          `som multipler med en decimal.`,
      ];

      const saLaserDu = [
        `Huvudtalet är median-P/E bland ${ordet} i urvalet; tabellen ger gruppens fem nyckeltal — ` +
          `läs dem tillsammans, inte ett i taget.`,
        k.valutaMening,
        `P25–P75 är spridningen: ett smalt band betyder en homogen grupp, ett brett band betyder att ` +
          `medianen säger mindre om varje enskilt bolag.`,
        `Titta alltid på matta-kolumnen: ett tal räknat på få observationer är ömtåligt, och under ` +
          `5 mätta publiceras det inte alls.`,
        `Skillnaden mot branschens samlade median (alla länders bolag) är information om urvalet — ` +
          `inte en signal om vilka aktier som är bättre.`,
      ];

      const fellerAttUndvika = [
        `Läsa medianen som ett rätt pris eller mål — den beskriver gruppens läge i källmaterialet, ` +
          `inte vad du bör betala (pedagogisk analys, inte investeringsråd).`,
        `Jämföra medianer mellan länder rakt av — valuta, redovisningspraxis och räntemiljö gör det ` +
          `till en jämförelse över stolen.`,
        `Tolka låg matta som lägre kvalitet i bolagen — det är datatäckning i källmaterialet, inte ` +
          `ett omdöme om gruppen.`,
      ];

      const sida: AspektSida = {
        aspekt: k.slug,
        bransch: branschSlug,
        titel: `${k.forled} ${ordet} — nyckeltal mot branschmedianen`,
        beskrivning:
          `Så jämför du ${k.forled.toLowerCase()} ${ordet} med branschmedianen — fem nyckeltal, ` +
          `median och spridning. Pedagogisk statistik, inte råd.`,
        ingress,
        matta: pe.matta,
        median: pe.median,
        p25: pe.p25,
        p75: pe.p75,
        min: pe.min,
        max: pe.max,
        enhet: "multipl",
        saRaknas,
        saLaserDu,
        fellerAttUndvika,
        // Fem sökord (VÅG150-RAPPORT §4): de tre smala gav bara 2 träffar —
        // "aktier" + "balansräkning" breddar till 4 pedagogiskt rimliga kurser.
        kurslankar: hittaKurslankar(["svenska aktier", "nyckeltal", "jämföra", "aktier", "balansräkning"]),
        matTabell,
      };
      return sida;
    },
  };
}

// ── Modulerna — sverige + usa (VÅG 150) + danmark (omg14) + schweiz (omg16) + tyskland (omg17) + australien (omg18) + japan (omg20) + frankrike (omg21) + storbritannien (omg26) ──

export const aspekter: AspektModule[] = [
  byggLandAspekt({
    slug: "sverige",
    land: "Sverige",
    forled: "Svenska",
    landNamn: "Sverige",
    valutaMening:
      "De svenska bolagen redovisar i svenska kronor (SEK) medan branschens amerikanska bolag " +
      "redovisar i dollar (USD). Multiplerna och marginalerna är i sig valutaneutrala tal, men " +
      "ränteläge, redovisningspraxis (IFRS kontra US GAAP) och marknadsstruktur skiljer mellan " +
      "börserna — jämför därför den här medianen med svenska bolags median, och var varsam med att " +
      "läsa den mot tal från dollarbolag.",
  }),
  byggLandAspekt({
    slug: "usa",
    land: "USA",
    forled: "Amerikanska",
    landNamn: "USA",
    valutaMening:
      "De amerikanska bolagen redovisar i dollar (USD) medan branschens svenska bolag redovisar i " +
      "svenska kronor (SEK). Multiplerna och marginalerna är i sig valutaneutrala tal, men " +
      "ränteläge, redovisningspraxis (US GAAP kontra IFRS) och marknadsstruktur skiljer mellan " +
      "börserna — jämför därför den här medianen med amerikanska bolags median, och var varsam med " +
      "att läsa den mot tal från svenskbolag.",
  }),
  byggLandAspekt({
    slug: "danmark",
    land: "Danmark",
    forled: "Danska",
    landNamn: "Danmark",
    valutaMening:
      "De danska bolagen redovisar oftast i danska kronor (DKK) — men enstaka Danmark-registrerade " +
      "bolag är noterade och redovisar i dollar (USD), och land-fältet säger inget om " +
      "rapportvalutan. Multiplerna och marginalerna är i sig valutaneutrala tal, men dansk krona och " +
      "svensk krona är skilda valutor med egna räntenivåer, och marknadsstruktur samt ägarstrukturer " +
      " (stiftelseägda ankare är vanliga på Köpenhamnsbörsen) skiljer från Stockholmsbörsen — jämför " +
      "därför den här medianen med danska bolags median, och var varsam med att läsa den mot tal " +
      "från svensk- eller dollarnotrade bolag.",
  }),
  byggLandAspekt({
    slug: "schweiz",
    land: "Schweiz",
    forled: "Schweiziska",
    landNamn: "Schweiz",
    valutaMening:
      "De schweiziska bolagen redovisar i schweiziska franc (CHF) — en valuta med egen " +
      "räntenivå och en historisk roll som säkerhetsvaluta, vilket trycker ned " +
      "kapitalkostnaderna för schweiziska bolag jämfört med euro- och dollarmiljöer. " +
      "Multiplerna och marginalerna är i sig valutaneutrala tal, men SIX Swiss Exchange " +
      "bär många globala verksamheter där majoriteten av intäkterna tjänas utomlands — " +
      "jämför därför den här medianen med schweiziska bolags median, och var varsam med " +
      "att läsa den mot tal från svensk- eller euro-noterade bolag.",
  }),
  byggLandAspekt({
    slug: "tyskland",
    land: "Tyskland",
    forled: "Tyska",
    landNamn: "Tyskland",
    valutaMening:
      "De tyska bolagen redovisar i euro (EUR) — Europas största ekonomi och den " +
      "referensvaluta som svenska kronor ofta vägs mot i handelsstatistiken. " +
      "Multiplerna och marginalerna är i sig valutaneutrala tal, men tysk börsstruktur " +
      "bär både världsomspännande varumärkesjättar och familjeägda industritraditioner " +
      "med långsiktiga ägarintressen, och DAX-bolagens stora andel intäkter utanför " +
      "eurozonen gör att valutaeffekten slår olika mellan bolagen — jämför därför den " +
      "här medianen med tyska bolags median, och var varsam med att läsa den mot tal " +
      "från svensk- eller dollar-noterade bolag.",
  }),
  byggLandAspekt({
    slug: "australien",
    land: "Australien",
    forled: "Australiska",
    landNamn: "Australien",
    valutaMening:
      "De australiska gruvbolagen är en valuta- och redovisningsblandning: en del redovisar i " +
      "australiska dollar (AUD) medan andra — bland dem de största — redovisar i amerikanska " +
      "dollar (USD) som koncernrapportvaluta, och land-fältet säger inget om rapportvalutan. " +
      "Multiplerna och marginalerna är i sig valutaneutrala tal, men råvarucyklerna (malm, guld, " +
      "koppar) driver resultaten mer än valutan, och ASX-börsens gruvvikt gör gruppen känslig " +
      "för Kina-efterfrågan — jämför därför den här medianen med australiska bolags median, " +
      "och var varsam med att läsa den mot tal från svensk- eller euro-noterade bolag.",
  }),
  byggLandAspekt({
    slug: "japan",
    land: "Japan",
    forled: "Japanska",
    landNamn: "Japan",
    valutaMening:
      "De japanska bolagen redovisar i yen (JPY) medan branschens amerikanska bolag " +
      "redovisar i dollar (USD) och de svenska i svenska kronor (SEK). Multiplerna och " +
      "marginalerna är i sig valutaneutrala tal, men Japans lågräntemiljö, yen-kursens " +
      "svängningar och börskulturens korsäganden med stabila huvudägare skiljer från " +
      "västerländska börser — jämför därför den här medianen med japanska bolags median, " +
      "och var varsam med att läsa den mot tal från svensk- eller dollar-noterade bolag.",
  }),
  byggLandAspekt({
    slug: "frankrike",
    land: "Frankrike",
    forled: "Franska",
    landNamn: "Frankrike",
    valutaMening:
      "De franska bolagen redovisar i euro (EUR) — eurozonens referensvaluta och den " +
      "närmaste utrikesspegeln för svenska kronor i handelsstatistiken. Multiplerna och " +
      "marginalerna är i sig valutaneutrala tal, men den franska bolagsvärlden bär en " +
      "annan ägarstruktur än den svenska: statliga eller kooperativa blockägare är " +
      "vanliga, och för bankerna gör insättningsbalanserna att skuld- och " +
      "kassaflödestal tolkas annorlunda än hos industrbolag — jämför därför den här " +
      "medianen med franska bolags median, och var varsam med att läsa den mot tal " +
      "från svensk- eller dollar-noterade bolag.",
  }),
  byggLandAspekt({
    slug: "storbritannien",
    land: "Storbritannien",
    forled: "Brittiska",
    landNamn: "Storbritannien",
    valutaMening:
      "De brittiska bolagen redovisar i pund (GBP) men noteras i pence (GBX) på Londonbörsen — " +
      "samma valuta i två skalor, och land-fältet säger inget om rapportvalutan (enstaka " +
      "noteringar redovisar i dollar). Multiplerna och marginalerna är i sig valutaneutrala " +
      "tal, men den brittiska grenen bär en tung bankvikt: för bankerna gör insättnings- " +
      "och utlåningsbalanserna att skuld-, kassaflödes- och avkastningstal tolkas annorlunda " +
      "än hos industrbolag (värderings-raderna P/E och P/B bär, medan skuld- och " +
      "kassaflödesmått lämnas osatta) — jämför därför den här medianen med brittiska bolags " +
      "median, och var varsam med att läsa den mot tal från svensk- eller dollar-noterade bolag.",
  }),
];
