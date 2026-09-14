/**
 * DATASET-ASPEKTER — VÄRDERINGSHUBBEN (våg 150 u4, bransch-teman tema 7)
 * ======================================================================
 * EN modul, slug "vardering", för rutten /dataset/[bransch]/vardering:
 * hub-sidan som binder nyckeltalsaspekterna (tema 1, u1–u2) till en
 * sammanvävd genomgång av multipelval — titelmönstret är tema 7:s egna:
 * "Värdering inom [Bransch] — vilken multipel att använda när".
 *
 * Huvudmått är P/E (sammanfattat över branschens bolag, exakt som
 * nyckeltalssidorna); matTabell bär SEX multipelmedianer — P/E, P/B,
 * EV/EBIT, PEG, FCF-avkastning (procent) och egenkapitalmultipl — räknade
 * med SAMMA sammanfatta på SAMMA källa som u1/u2:s sidor, så hubbens
 * tal överensstämmer alltid med nyckeltalssidorna de binder samman.
 *
 * GRÄNSDRAGNING (A2-DATASET-KONTRAKT §1, tvingande som för syskonen):
 *  - PUBLIKT: median/kvartiler/min/max av publika marknadsnyckeltal per
 *    bransch med n-redovisning — här sex värderingsmått i EN tabell.
 *  - ALDRIG i utdata: AKM-poäng, vågklasser, fvag, status, golv, portV19
 *    — och INGA bolagsnamn eller tickers (AspektUniversumRad bär dem
 *    inte ens). Källfil är ENBAST bolagsunivers.json via kontraktets
 *    läsare; data/stocks/** är osynlig och förblir den.
 *
 * RADNIVÅNS GRÄNSREGEL (strängare än land.ts): en matTabell-rad under
 * MIN_MATTA mätta redovisar median null med matta kvar. Samma gräns som
 * gäller för tema 1-sidorna — u2:s fcf-avkastning/finans publiceras inte
 * alls vid n = 3, så hubben ska inte heller kunna visa en 3-observations-
 * median som den egna sidan vägrar publicera (i dagsläget: FCF-avkastning
 * inom finans). Sidnivåns gränsregel fattas av SLUTLED-registret på
 * huvudmåttet P/E — och sedan u5:s vit-test returnerar generera dessutom
 * null när P/E-mattan < MIN_MATTA (dubbelgrind).
 *
 * Källans egen notering om dubbelmåttet: egenKapitalMultipl räknas som
 * börsvärde / bokfört eget kapital — samma beräkningsgrund som P/B, och
 * i universumet sammanfaller talen därför helt (u2:s sida redovisar
 * samma grund). Hubben visar ändå båda radererna (tema 7:s lista) men
 * säger i saLaserDu ATT de sammanfaller och varför — ärlighet om metoden
 * är sidans kärna.
 */
import {
  hittaKurslankar,
  lasAspektUniversum,
  sammanfatta,
  MIN_MATTA,
  type AspektModule,
  type AspektSida,
  type AspektStat,
  type AspektUniversumRad,
} from "../dataset-aspekter-kontrakt";
import { branschNamn } from "../dataset-medianer";

// ── Formatering (svenska decimaler; null ⇒ "osatt", aldrig noll) ─────────────

function svTal(v: number | null): string {
  return v === null ? "osatt" : String(v).replace(".", ",");
}

function svMultipl(v: number | null): string {
  return v === null ? "osatt" : `${svTal(v)}×`;
}

type MatRad = NonNullable<AspektSida["matTabell"]>[number];

function matRad(etikett: string, stat: AspektStat, enhet: "procent" | "multipl"): MatRad {
  return {
    etikett,
    // Radens gränsregel — se filhuvudet: under MIN_MATTA mätta redovisas
    // aldrig radens median (matta redovisas ändå, osanning syns aldrig).
    median: stat.matta >= MIN_MATTA ? stat.median : null,
    matta: stat.matta,
    enhet,
  };
}

// ── Texter — multipelvalens logik (tema 7 + §6:s juridiksäkra ton) ──────────

const SOKORD = ["multipel", "värdering", "p/e", "ev/ebit", "peg"];

const SA_RAKNAS = [
  "Tabellen räknas ur 100-bolagsuniversumets publika nyckeltal: för varje mått sorteras branschens mätta bolag och medianen (mittpunkten) redovisas — med exakt samma hjälpare som branschmedianerna på /dataset, så hubbens tal överensstämmer alltid med nyckeltalssidorna.",
  "Vinstbolag → P/E: när bolaget har en positiv och någorlunda stabil vinst visar P/E hur många års nuvarande vinst priset motsvarar — det naturliga förstavalet för vinstdrivna verksamheter.",
  "Olika kapitalstruktur → EV/EBIT: när bolagen i gruppen är olika hårt belånade jämför du ärligare hela företagsvärdet (börsvärde plus nettoskuld) mot driftsresultatet — multiplen blir neutral mot hur kapitalet delats mellan lån och eget kapital.",
  "Tillväxtjustering → PEG: när tillväxttakten skiljer sig mycket inom branschen sätter PEG P/E-talet i relation till väntad resultattillväxt — kom ihåg att nämnaren är en analytikerprognos, inte ett faktum.",
  "Substans → P/B och egenkapitalmultipl: när värdet sitter i bokfört kapital — till exempel banker, fastigheter och investmentbolag — läser du vad marknaden betalar per bokförd krona eget kapital.",
  "Kassaflöde → FCF-avkastning: det fria kassaflödet i procent av börsvärdet kompletterar vinstmultiplerna med ett kontantmått; saknas mätta värden redovisas raden som osatt — modulen gissar aldrig.",
];

const SA_LASER_DU = [
  "P/E fungerar som bäst när vinsten är positiv och stabil; läs medianen tillsammans med kvartilerna P25–P75 — de visar hur sammanhållen branschens kärna är.",
  "EV/EBIT är ärligare när belåningen skiljer inom gruppen: skuldtunga bolag ser dyrare ut i P/E än i EV/EBIT, och skillnaden mellan de två raderna är i sig en lektion om kapitalstrukturens effekt.",
  "Branschmedianen är en utgångspunkt för ditt eget resonemang — inte en gräns mellan rimligt och orimligt; affärsmodellerna inom en och samma bransch kan motivera mycket olika multipler.",
  "I det här universumet räknas egenkapitalmultiplen som börsvärde i förhållande till bokfört eget kapital — samma beräkningsgrund som P/B — och de två radernas medianer sammanfaller därför; läs dem som två vägar in i substansfrågan, inte som två oberoende mått.",
  "FCF-avkastningen är ett procenttal, inte en multipel: ett högre värde betyder mer fritt kassaflöde per prissatt krona — ett komplement till vinstbaserade multipler, inte en ersättning.",
  "Rader med färre än 5 mätta bolag redovisas utan median (osatt) — samma gränsregel som nyckeltalssidorna; antalet mätta bolag står alltid i tabellen, så underlagets styrka syns.",
];

const FELLER = [
  "Multipelskjuvhet: samma bolag kan se högt värderat i en multipel och lägre i en annan — välj mått efter bolagets ekonomi (vinst, skuld, tillväxt, substans) i stället för att leta fram den multipel som bäst stödjer en redan dragen slutsats.",
  "Lågräntemiljö: när räntan faller står multiplerna högre i hela marknaden utan att något enskilt bolag förbättrats — jämför gärna mot tal från liknande ränteläge, inte rakt mot siffror från en annan ränteregim.",
  "Cykliska topptider: i en konjunkturtopp är vinsterna som högst och multiplerna som lägst — ett lågt P/E kan alltså spegla högsta uppnådda vinst snarare än en låg prisnivå; för cykliska verksamheter läser du därför multiplerna över ett helt konjunktursnitt.",
  "PEG:s prognosnämnare: väntad tillväxt är en konsensusbedömning som kan slå fel — ett lågt PEG är inte en signal i sig utan ett tal vars underlag du bör granska.",
];

// ── Modulen — EXAKT 1 (slug "vardering") ────────────────────────────────────

export const aspekter: AspektModule[] = [
  {
    slug: "vardering",
    titel: (namn) => `Värdering inom ${namn} — vilken multipel att använda när`,
    generera: (branschSlug: string): AspektSida | null => {
      const { rader } = lasAspektUniversum();
      const bolag = rader.filter((r: AspektUniversumRad) => r.bransch === branschSlug);
      if (bolag.length === 0) return null; // okänd bransch ⇒ rutten svarar 404
      const namn = branschNamn("sv", branschSlug);

      // SEX multipelmedianer — samma fält och samma sammanfatta som
      // u1 (ev-ebit, peg), u2 (fcf-avkastning, egenkapitalmultipl) och
      // branschmedianerna (pe, pb). fcfYield är rå andel ⇒ procent.
      const pe = sammanfatta(bolag.map((r) => r.vardering?.pe ?? null), false);
      // Sidnivåns gränsregel (dubbelgrind sedan u5:s vit-test): huvudmåttet
      // P/E under MIN_MATTA mätta ⇒ ingen sida alls returneras.
      if (pe.matta < MIN_MATTA) return null;
      const pb = sammanfatta(bolag.map((r) => r.vardering?.pb ?? null), false);
      const evEbit = sammanfatta(bolag.map((r) => r.vardering?.evEbit ?? null), false);
      const peg = sammanfatta(bolag.map((r) => r.vardering?.peg ?? null), false);
      const fcfYield = sammanfatta(bolag.map((r) => r.vardering?.fcfYield ?? null), true);
      const ekMultipl = sammanfatta(bolag.map((r) => r.vardering?.egenKapitalMultipl ?? null), false);

      const matTabell: MatRad[] = [
        matRad("P/E", pe, "multipl"),
        matRad("P/B", pb, "multipl"),
        matRad("EV/EBIT", evEbit, "multipl"),
        matRad("PEG", peg, "multipl"),
        matRad("FCF-avkastning", fcfYield, "procent"),
        matRad("Egenkapitalmultipl", ekMultipl, "multipl"),
      ];

      const ingress =
        pe.median === null
          ? `Inom ${namn} saknas mätt P/E för tillfället (n = ${pe.matta} av ${bolag.length} bolag) — sidan publiceras aldrig med gissade tal. Multipelvalens logik nedan gäller oavsett: vinst, kapitalstruktur, tillväxt och substans styr vilket mått som bär information.`
          : `Inom ${namn} har ${pe.matta} av branschens ${bolag.length} bolag ett mätt P/E-tal: medianen är ${svMultipl(
              pe.median,
            )} och den mittersta halvan ligger mellan ${svMultipl(pe.p25)} och ${svMultipl(
              pe.p75,
            )}. Men P/E är bara ett av flera sätt att läsa ett pris — tabellen nedan redovisar sex värderingsmått för samma grupp. Vilken multipel som passar beror på bolagets vinst, kapitalstruktur, tillväxt och substans; stegen nedan visar logiken.`;

      const sida: AspektSida = {
        aspekt: "vardering",
        bransch: branschSlug,
        titel: `Värdering inom ${namn} — vilken multipel att använda när`,
        beskrivning: `Värdering inom ${namn}: median-P/E, kvartiler och sex multipelmedianer — så räknas tabellen och hur du väljer mellan P/E, EV/EBIT, PEG och P/B.`,
        ingress,
        matta: pe.matta,
        median: pe.median,
        p25: pe.p25,
        p75: pe.p75,
        min: pe.min,
        max: pe.max,
        enhet: "multipl",
        saRaknas: SA_RAKNAS,
        saLaserDu: SA_LASER_DU,
        fellerAttUndvika: FELLER,
        kurslankar: hittaKurslankar(SOKORD),
        matTabell,
      };
      return sida;
    },
  },
];
