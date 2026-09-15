/**
 * DATASET-ASPEKTER — UNIVERSUMJÄMFÖRELSEN (spår 2/s2-u3, dataset-djup)
 * =====================================================================
 * EN modul, slug "universumjamforelse", för rutten
 * /dataset/[bransch]/universumjamforelse: jämförelsehubben som ställer
 * branschens publika nyckeltal mot HELA universumets — samma mått, samma
 * metod, två grupper. Titelmönstret: "[Bransch] mot hela universumet —
 * nyckeltal i jämförelse".
 *
 * Huvudmått är branschens P/E (median/kvartiler/spridning i statistik-
 * blocket, exakt som nyckeltalssidorna); matTabell bär parvisa rader —
 * ett mått för branschen, samma mått för hela universumet — räknade med
 * SAMMA sammanfatta på SAMMA källfil, så jämförelsen aldrig kan vila på
 * två metoder. Universumets P/E-kvartiler bärs av ingressen, så kvartiler
 * syns för BÅDA grupperna (blocket = branschen, texten = universumet).
 *
 * GRÄNSDRAGNING (A2-DATASET-KONTRAKT §1, tvingande som för syskonen):
 *  - PUBLIKT: median/kvartiler/min/max av publika marknadsnyckeltal per
 *    bransch OCH för hela universumet med n-redovisning — här sex mått
 *    i parvisa rader.
 *  - ALDRIG i utdata: AKM-poäng, vågklasser, fvag, status, golv, portV19
 *    — och INGA bolagsnamn eller tickers (AspektUniversumRad bär dem
 *    inte ens). Källfil är ENBAST bolagsunivers.json via kontraktets
 *    läsare; data/stocks/** är osynlig och förblir den.
 *
 * RADNIVÅNS GRÄNSREGEL (samma som vardering.ts): en matTabell-rad under
 * MIN_MATTA mätta redovisar median null med matta kvar — branschraden
 * ska aldrig kunna visa en median som måttets egen aspektsida vägrar
 * publicera. Sidnivåns gränsregel (dubbelgrind sedan våg 150 u5):
 * bransch-P/E under MIN_MATTA mätta ⇒ ingen sida alls — beslutet fattas
 * egentligen av SLUTLED-registret via matta + MIN_MATTA.
 *
 * Jämförelsen är DESKRIPTIV statistik: ett avstånd mellan två medianer
 * är en iakttagelse om branschstruktur (kapitalintensitet, cyklicitet,
 * tillväxt), aldrig en signal om att en grupp är "bättre" — juridik-
 * grinden (lagen 2007:528) gäller texterna nedan som alla andra ytor.
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

/** Relativ avvikelse i procent, en decimal — null när något tal saknas. */
function avvikelse(bransch: number | null, universum: number | null): number | null {
  if (bransch === null || universum === null || universum === 0) return null;
  return Math.round(((bransch / universum - 1) * 100 + Number.EPSILON) * 10) / 10;
}

type MatRad = NonNullable<AspektSida["matTabell"]>[number];

/**
 * En jämförelserad = två matTabell-rader (bransch + universum) med
 * radnivå-gränsregeln: under MIN_MATTA mätta redovisas aldrig radens
 * median (matta redovisas ändå — osanning syns aldrig).
 */
function jamforelseRader(
  etikett: string,
  namn: string,
  branschStat: AspektStat,
  universumStat: AspektStat,
  enhet: "procent" | "multipl",
): MatRad[] {
  return [
    {
      etikett: `${etikett} — ${namn}`,
      median: branschStat.matta >= MIN_MATTA ? branschStat.median : null,
      matta: branschStat.matta,
      enhet,
    },
    {
      etikett: `${etikett} — hela universumet`,
      median: universumStat.matta >= MIN_MATTA ? universumStat.median : null,
      matta: universumStat.matta,
      enhet,
    },
  ];
}

// ── Texter — jämförelsens hantverk (§6:s juridiksäkra ton) ──────────────────

const SOKORD = ["bransch", "jämförelse", "median", "nyckeltal", "p/e"];

const SA_RAKNAS = [
  "Båda kolumnerna räknas ur samma källfil — bolagsuniversumets publika nyckeltal — med samma hjälpare som branschmedianerna på /dataset: för varje mått sorteras gruppens mätta bolag och medianen (mittpunkten) redovisas. Jämförelsen vilar alltså aldrig på två metoder.",
  "Universumraden räknas över ALLA bolag i universumet, oavsett bransch — den är motstycket till branschraden på samma radpar i tabellen.",
  "Kvartilerna (P25–P75) fångar den mittersta halvan av varje grupp: ett smalt kvartilavstånd betyder sammanhållen grupp, ett brett betyder att medianen döljer stor spridning.",
  "Procentmått (ROE, bruttomarginal, omsättningstillväxt) omvandlas från råandel till procenttal med en decimal — på exakt samma sätt som nyckeltalssidorna, så talen överensstämmer alltid mellan sidorna.",
  "Rader med färre än 5 mätta bolag redovisas utan median (osatt) — samma gränsregel som hela dataset-ytan; antalet mätta bolag står alltid i tabellen, så underlagets styrka syns.",
  "Avståndet mellan branschens och universumets median är ren beskrivning av läge — noll poäng, ingen rekommendation; modulen känner inte ens till något bolags identitet.",
];

const SA_LASER_DU = [
  "Läs radparen lodrätt: branschens median mot universumets median för SAMMA mått — det är avståndet mellan dem som beskriver branschens särart, inte nivån i sig.",
  "Ett lågt P/E-avstånd mot universumet kan spegla cykliskt höga vinster (energi, material) snarare än en lågt värderad bransch — läs multiplerna tillsammans med marginalraderna i samma tabell.",
  "Jämför kvartilavstånden: en bransch kan ligga nära universummedianen på P/E men ha dubbelt så breda kvartiler — det betyder att branschens kärna är mindre sammanhållen än genomsnittet.",
  "Universumradens n är alltid större än branschens — universummedianen är stabilare mot enskilda bolags datapåverkade kvartal, medan branschmedianen rör sig mer när ett fåtal bolag ändras.",
  "Procenttal och multipler svarar på olika frågor: ROE och marginaler beskriver rörelsens ekonomi, multiplerna beskriver priset på den — en jämförelse över båda slagen ger helheten.",
  "Alla tal är tagna vid samma hämtdatum (se sidhuvudet) — jämför aldrig den här tabellens tal mot siffror hämtade vid annat tillfälle utan att räkna om.",
];

const FELLER = [
  "Relativt tänkande som slutsats: att en bransch ligger under universummedianen är en observation, inte en slutsats om att gruppen är felprisad — branschstruktur, cykelfas och kapitalintensitet förklarar ofta hela avståndet.",
  "Median-förväxling: universumets median är INTE samma sak som genomsnittet av branschmedianerna — medianen av alla bolag väger automatiskt branscher efter antal mätta bolag, och en tvärfördelning kan se helt annorlunda ut.",
  "Simpsons paradox i miniatyr: en bransch kan ligga över universumet på ett mått samtidigt som dess bolag ligger under på ett annat — läs hela radparet och måtten tillsammans innan du beskriver branschen med ett enda tal.",
  "Att jämfra mått med olika definitioner mellan källor: universumets tal följer källfilens fältdesign (exempelvis är prognostillväxt ett konsenstal) — blanda aldrig in mått från andra källor med annan definition i samma jämförelse.",
];

// ── Modulen — EXAKT 1 (slug "universumjamforelse") ──────────────────────────

export const aspekter: AspektModule[] = [
  {
    slug: "universumjamforelse",
    titel: (namn) => `${namn} mot hela universumet — nyckeltal i jämförelse`,
    generera: (branschSlug: string): AspektSida | null => {
      const { rader } = lasAspektUniversum();
      const bolag = rader.filter((r: AspektUniversumRad) => r.bransch === branschSlug);
      if (bolag.length === 0) return null; // okänd bransch ⇒ rutten svarar 404
      const namn = branschNamn("sv", branschSlug);

      // SEX måttpar — samma fält och samma sammanfatta som nyckeltals-
      // sidorna (u1: pe/ev-ebit, u2: fcf) och branschmedianerna. ROE,
      // bruttomarginal och omsättning-CAGR är råandelar ⇒ procent.
      const pe = sammanfatta(bolag.map((r) => r.vardering?.pe ?? null), false);
      // Sidnivåns gränsregel (dubbelgrind): bransch-P/E under MIN_MATTA
      // mätta ⇒ ingen sida alls returneras.
      if (pe.matta < MIN_MATTA) return null;
      const peUniversum = sammanfatta(rader.map((r) => r.vardering?.pe ?? null), false);
      const pb = sammanfatta(bolag.map((r) => r.vardering?.pb ?? null), false);
      const pbUniversum = sammanfatta(rader.map((r) => r.vardering?.pb ?? null), false);
      const evEbit = sammanfatta(bolag.map((r) => r.vardering?.evEbit ?? null), false);
      const evEbitUniversum = sammanfatta(rader.map((r) => r.vardering?.evEbit ?? null), false);
      const roe = sammanfatta(bolag.map((r) => r.lonksamhet?.roe ?? null), true);
      const roeUniversum = sammanfatta(rader.map((r) => r.lonksamhet?.roe ?? null), true);
      const brutto = sammanfatta(bolag.map((r) => r.lonksamhet?.bruttoMarginal ?? null), true);
      const bruttoUniversum = sammanfatta(
        rader.map((r) => r.lonksamhet?.bruttoMarginal ?? null),
        true,
      );
      const omsCagr = sammanfatta(bolag.map((r) => r.tillvaxt?.omsattningCAGR5ar ?? null), true);
      const omsCagrUniversum = sammanfatta(
        rader.map((r) => r.tillvaxt?.omsattningCAGR5ar ?? null),
        true,
      );

      const matTabell: MatRad[] = [
        ...jamforelseRader("P/E", namn, pe, peUniversum, "multipl"),
        ...jamforelseRader("P/B", namn, pb, pbUniversum, "multipl"),
        ...jamforelseRader("EV/EBIT", namn, evEbit, evEbitUniversum, "multipl"),
        ...jamforelseRader("ROE", namn, roe, roeUniversum, "procent"),
        ...jamforelseRader("Bruttomarginal", namn, brutto, bruttoUniversum, "procent"),
        ...jamforelseRader("Omsättning-CAGR 5 år", namn, omsCagr, omsCagrUniversum, "procent"),
      ];

      const peAvvikelse = avvikelse(pe.median, peUniversum.median);
      const avvikelseText =
        peAvvikelse === null
          ? "medianerna går inte att sätta i förhållande till varandra just nu"
          : `branschens median ligger ${svTal(Math.abs(peAvvikelse))} % ${
              peAvvikelse >= 0 ? "över" : "under"
            } universumets`;

      const ingress =
        pe.median === null || peUniversum.median === null
          ? `Inom ${namn} saknas mätt P/E för tillfället (n = ${pe.matta} av branschens ${bolag.length} bolag) — sidan publiceras aldrig med gissade tal. Jämförelsens hantverk nedan gäller oavsett: samma mått, samma metod, två grupper.`
          : `Inom ${namn} har ${pe.matta} av branschens ${bolag.length} bolag ett mätt P/E-tal: medianen är ${svMultipl(
              pe.median,
            )} mot universumets ${svMultipl(peUniversum.median)} (n = ${
              peUniversum.matta
            } av ${rader.length} bolag) — ${avvikelseText}. Branschens mittersta halva ligger mellan ${svMultipl(
              pe.p25,
            )} och ${svMultipl(pe.p75)}, universumets mellan ${svMultipl(
              peUniversum.p25,
            )} och ${svMultipl(
              peUniversum.p75,
            )}. Tabellen nedan ställer sex mått sida vid sida — så ser ${namn.toLowerCase()} ut mot marknaden som helhet.`;

      const sida: AspektSida = {
        aspekt: "universumjamforelse",
        bransch: branschSlug,
        titel: `${namn} mot hela universumet — nyckeltal i jämförelse`,
        beskrivning: `${namn} mot hela universumet: median-P/E, kvartiler och sex mått i jämförelse — så läser du en bransch mot hela marknaden.`,
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
