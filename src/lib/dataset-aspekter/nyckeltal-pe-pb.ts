/**
 * DATASET-ASPEKTER — P/E och P/B (fabrik spår 2: dataset-djup)
 * ============================================================
 * De två mest eftersökta värderingsmultiplerna som egna aspektsidor för
 * /dataset/[bransch]/[aspekt] — samma mönster som nyckeltal-a/b: branschens
 * median, kvartiler och spridning, och sedan universumjämförelsen (samma
 * mått över hela universumet) i både data och ingress. P/E är navet i
 * värderingshubben och P/B dess bokföringskusin; att de nu också får egna
 * long-tail-sidor gör "median P/E inom [bransch]" citerbart på sida nivå.
 *
 * GRÄNSDRAGNING (A2-DATASET-KONTRAKT §1, tvingande som för syskonen):
 *  - PUBLIKT: median/kvartiler/min/max av PUBLIKA marknadsmultipler per
 *    bransch med n-redovisning — plus samma aggregat över hela universumet
 *    (en kvartil av publika marknadstal bär ingen AKM-poäng; samma argument
 *    som dataset-medianernas universummedianer, våg 98 F2).
 *  - ALDRIG i utdata: AKM-poäng, vågklasser, status, golv, portV19 — och
 *    INGA bolagsnamn eller tickers. Typen AspektUniversumRad bär dem inte.
 *  - Källfil är ENBAST data/portfolj-system/bolagsunivers.json via
 *    kontraktets egen läsare (lasAspektUniversum); data/stocks/** och
 *    korstabellen förblir osynliga.
 *  - Gränsregeln (< 5 mätta ⇒ sidan publiceras ej) fattas av SLUTLED-
 *    registret; modulen räknar alltid ärligt och returnerar null vid
 *    okänd bransch SAMT matta < MIN_MATTA (dubbelgrinden, u5:s vit-test).
 *
 * Ärlighetsnotering som sidorna bär själva: i universumet räknas
 * egenKapitalMultipl på samma grund som P/B (börsvärde / bokfört eget
 * kapital) och talen sammanfaller därför helt — P/B-sidorna säger detta
 * öppet och länkar syskonsidans-logik i texten (samma princip som
 * värderingshubben, som visar båda raderna med förklaring).
 */
import {
  hittaKurslankar,
  lasAspektUniversum,
  MIN_MATTA,
  sammanfatta,
  sammanfattaUniversum,
  type AspektModule,
  type AspektSida,
  type AspektStat,
  type AspektUniversumRad,
} from "../dataset-aspekter-kontrakt";
import { branschNamn as branschVisningsnamn } from "../dataset-medianer";

// ── Visningshjälpare (svenska decimaler; null ⇒ "osatt") ─────────────────────

function svMultipl(v: number | null): string {
  return v === null ? "osatt" : `${String(v).replace(".", ",")}x`;
}

/** Branschstatistik-mening i syskonstil (nyckeltal-a:s statMening). */
function statMening(namn: string, s: AspektStat): string {
  return `Bland universumets bolag inom ${namn} har ${s.matta} bolag ett mätt värde: medianen ligger på ${svMultipl(
    s.median,
  )}, den mittersta halvan mellan ${svMultipl(s.p25)} och ${svMultipl(s.p75)}, och hela spridningen från ${svMultipl(
    s.min,
  )} till ${svMultipl(s.max)}.`;
}

/** Universum-mening för ingressen — det citerbara jämförelsetalet. */
function universumMening(u: AspektStat & { antalBolag: number }): string {
  if (u.median === null) {
    return `Hela universumet saknar mätt värde för måttet.`;
  }
  return `I hela universumet (${u.antalBolag} bolag, ${u.matta} mätta) ligger medianen på ${svMultipl(
    u.median,
  )} med den mittersta halvan mellan ${svMultipl(u.p25)} och ${svMultipl(u.p75)}.`;
}

// ── Texter ───────────────────────────────────────────────────────────────────

type MultiplText = {
  kortNamn: string;
  beskrivning: (namn: string) => string;
  ingress: (namn: string, stat: AspektStat, universum: AspektStat & { antalBolag: number }) => string;
  saRaknas: string[];
  saLaserDu: string[];
  fellerAttUndvika: string[];
  sokord: string[];
};

const peText: MultiplText = {
  kortNamn: "P/E",
  beskrivning: (n) =>
    `P/E inom ${n}: median, kvartiler och spridning bland mätta bolag — mot hela universumet. Så räknas och läses pris/vinst-multipeln.`,
  ingress: (n, s, u) =>
    `P/E sätter aktiens pris i relation till bolagets vinst per aktie — det mest citerade talet i värderingsdebatten. ${statMening(
      n,
      s,
    )} ${universumMening(u)} Jämför alltid inom branschen och läs talet som ett startläge för frågor, inte som ett facit.`,
  saRaknas: [
    "Ta bolagets senaste vinst per aktie (EPS): årets resultat dividerat med antalet aktier.",
    "Dividera aktiens kurs med vinsten per aktie — svaret är hur många års nuvarande vinst kursen representerar.",
    "Negativ eller nästan noll vinst gör multiplen meningslös — sådana bolag lämnar värdet osatt i stället för att synas som missvisande tal.",
    "I universumet lagras P/E som färdig multipel per bolag; median, kvartiler (P25/P75), min och max räknas endast på bolag med ändligt mätt värde.",
    "Universumraden räknas med exakt samma metod på alla 100 bolag — bransch- och universumtal kan aldrig skilja sig åt i sättet de räknats.",
  ],
  saLaserDu: [
    "P/E väger samman två utfall — kursen och vinsten — så en hög multipel kan lika gärna spegla hög väntad tillväxt som en vinst på väg att falla.",
    "Jämför inom branschen: kapitalbehov, marginaler och tillväxttakter gör multipler olika jämförbara mellan branscher (universumraden finns som referens, inte som facit).",
    "Ett års vinst är ömtålig grund: engångsposter, nedskrivningar och skatteeffekter svänger EPS — läs multiplen tillsammans med marginalerna på syskonsidorna.",
    "Läs spridningen: inom en bransch kan P/E spänna från enkelsiffrigt till tresiffrigt — medianen beskriver mittpunkten, inte varje bolag.",
    "Investmentbolag värderas mot substansen, inte mot resultatet — deras P/E säger lite om värdet (substans, inte drift).",
  ],
  fellerAttUndvika: [
    "Lågt P/E är inte automatiskt billigt — det kan spegla en marknad som väntar fallande vinster eller högre risk.",
    "Högt P/E är inte automatiskt dyrt — tillväxtbolag bär ofta höga multipler i åratal medan vinsten växer ikapp priset.",
    "Blanda inte P/E på senaste årets vinst med P/E på prognos — det är olika tal med olika betydelse, och prognosvarianten (PEG-familjen) har egen sida.",
  ],
  sokord: ["p/e", "värdering", "multipel"],
};

const pbText: MultiplText = {
  kortNamn: "P/B",
  beskrivning: (n) =>
    `P/B inom ${n}: median, kvartiler och spridning bland mätta bolag — mot hela universumet. Priset per bokförd krona, steg för steg.`,
  ingress: (n, s, u) =>
    `P/B sätter aktiens pris i relation till det bokförda egna kapitalet — vad marknaden betalar per krona i balansräkningen. ${statMening(
      n,
      s,
    )} ${universumMening(u)} Bokfört kapital är en historik, så läs talet som utgångspunkt för frågor om balansräkningens värde — inte som ett mått på vad bolaget är värt i sig.`,
  saRaknas: [
    "Ta bolagets bokförda eget kapital ur senaste balansräkningen och räkna ut det per aktie.",
    "Dividera aktiens kurs med eget kapital per aktie — svaret är vad marknaden betalar per bokförd krona.",
    "Negativt eget kapital (skuld större än tillgångar) lämnar multiplen osatt — talet vore inte tolkningsbart.",
    "Median, kvartiler (P25/P75), min och max räknas endast på bolag med ändligt mätt värde; universumraden räknas på samma sätt på alla 100 bolag.",
    "Ärlighetsnotering: i universumet räknas egenkapitalmultiplen på samma grund (börsvärde / bokfört eget kapital), så dess tal sammanfaller helt med P/B — två namn, samma beräkning.",
  ],
  saLaserDu: [
    "P/B är substansnärt: multipel under 1x betyder att kursen ligger under det bokförda kapitalet — ett utfall att förstå (skepsis mot bokförda värden eller tillgångar som inte avkastar), aldrig en köpsignal i sig.",
    "Bokfört värde är en historik: gamla anläggningstillgångar, inköpta goodwillposter och olika avskrivningsprinciper gör det egna kapitalet olika jämförbart mellan bolag och länder.",
    "Mjukvarubolag har lite bokfört kapital och ofta höga P/B; fastighets- och finansbolag bär tunga balansräkningar och ofta låga — nivån är branschberoende, jämför därför inom branschen.",
    "Återköpsprogram minskar det egna kapitalet och lyfter P/B utan att verksamheten förändrats — läs talet tillsammans med avkastningsmått som ROE.",
    "Universumraden visar samma mått över alla tio branscher — en bred referens, inte ett normalvärde att sträva efter.",
  ],
  fellerAttUndvika: [
    "Låg P/B är ingen automatik för värde — bokfört kapital kan vara övervärderat, föråldrat eller svagt avkastande.",
    "Jämför inte banker och fastighetsbolag med mjukvarubolag på samma P/B — balansräkningens roll i affärsmodellen är helt olika.",
    "Glöm inte att goodwill ingår i bokfört eget kapital — köpta bolag blåser upp balansräkningen utan att något nytt skapats.",
  ],
  sokord: ["p/b", "substans", "balansräkning"],
};

// ── Byggare — en metod för båda modulerna ────────────────────────────────────

function multiplModul(
  slug: string,
  hamtaVarde: (r: AspektUniversumRad) => number | null | undefined,
  text: MultiplText,
): AspektModule {
  const gorTitel = (n: string): string =>
    `${text.kortNamn} inom ${n} — median, spridning och hur du läser det`;
  return {
    slug,
    titel: gorTitel,
    generera: (branschSlug: string): AspektSida | null => {
      const rader = lasAspektUniversum().rader.filter((r) => r.bransch === branschSlug);
      if (rader.length === 0) return null; // okänd bransch ⇒ rutten svarar 404
      const stat = sammanfatta(rader.map(hamtaVarde), false);
      // Dubbelgrind (u5:s vit-test): under MIN_MATTA mätta returneras ingen
      // sida — slutledet publicerar den heller inte.
      if (stat.matta < MIN_MATTA) return null;
      const namn = branschVisningsnamn("sv", branschSlug);
      const universum = sammanfattaUniversum(hamtaVarde, false);
      return {
        aspekt: slug,
        bransch: branschSlug,
        titel: gorTitel(namn),
        beskrivning: text.beskrivning(namn),
        ingress: text.ingress(namn, stat, universum),
        matta: stat.matta,
        median: stat.median,
        p25: stat.p25,
        p75: stat.p75,
        min: stat.min,
        max: stat.max,
        enhet: "multipl",
        saRaknas: text.saRaknas,
        saLaserDu: text.saLaserDu,
        fellerAttUndvika: text.fellerAttUndvika,
        kurslankar: hittaKurslankar(text.sokord),
        universum,
      };
    },
  };
}

// ── Modulerna (EXAKT 2 slugs — P/E och P/B) ─────────────────────────────────

export const aspekter: AspektModule[] = [
  multiplModul("pe", (r) => r.vardering?.pe, peText),
  multiplModul("pb", (r) => r.vardering?.pb, pbText),
];
