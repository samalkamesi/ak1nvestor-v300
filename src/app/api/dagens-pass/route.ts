import { NextResponse } from "next/server";
import { körAnalysMotor, type TickerAnalys as Analys } from "@/lib/analys-motor";
import { lasEllerHamta } from "@/lib/datacache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * DAGENS PASS — flaggskeppet: daglig 5-minuters marknadsträning på RIKTIG data.
 *
 * Deterministiskt urval (datum-hash % listlängd) ur en roterande lista på 12
 * svenska storbank-/industri-tickers → TS-motorn (bitidentisk port av
 * python-motorn) → kompletteras vid behov med ett lätt Yahoo-tillskott
 * (chart-endpoint, ingen crumb krävs) — misslyckas det är motor-datat sole.
 */

const ROTATION: readonly string[] = [
  "VOLV-B.ST",
  "SAAB-B.ST",
  "ATCO-A.ST",
  "SAND.ST",
  "SHB-B.ST",
  "SWED-A.ST",
  "ESSITY-B.ST",
  "ERIC-B.ST",
  "AZN.ST",
  "NDA-SE.ST",
  "SKF-B.ST",
  "ALFA.ST",
];

/** FNV-1a-hash med salt — ger ett stabilt, deterministiskt index per dag och salt. */
function datumHash(datum: string, salt: number): number {
  const s = `${salt}:${datum}`;
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/**
 * Lätt Yahoo-tillskott (chart-endpoint — kräver ingen crumb-cookie):
 * färskt senaste pris om motorns data skulle vara eftersläpande.
 * Icke-fatal: misslyckas den används enbart motor-data.
 */
async function hamtaYahooTillskott(ticker: string): Promise<{ pris: number; tidpunkt: string } | null> {
  try {
    const r = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1d&interval=1d`,
      {
        signal: AbortSignal.timeout(4000),
        cache: "no-store",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; AK1A-Research-Lab/1.0)" },
      }
    );
    if (!r.ok) return null;
    const j: any = await r.json();
    const meta = j?.chart?.result?.[0]?.meta;
    if (!meta || typeof meta.regularMarketPrice !== "number") return null;
    return {
      pris: meta.regularMarketPrice,
      tidpunkt: typeof meta.regularMarketTime === "number" ? new Date(meta.regularMarketTime * 1000).toISOString() : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/** Vågklass → quiz-index (impulsvåg=0, korrigering=1, basbygge=2). */
const VAG_INDEX: Record<string, number> = { "impulsvåg": 0, korrigering: 1, basbygge: 2 };

/**
 * AKM1-frågor — fast rotationslista (10 st) hämtade ur V01-V20-världen:
 * försäljningstillväxt, bruttomarginal, EV/EBITDA, ROE, moat-blocket,
 * kapitalförbränning, intäktsdiversifiering, ARR, P/B och intäktsstabilitet.
 */
const AKM1_FRAGOR: ReadonlyArray<{ fraga: string; alternativ: string[]; ratt: number; tips: string }> = [
  {
    fraga: "AKM1-variabeln V01 (Försäljningstillväxt) är markerad KRITISK. Var i årsredovisningen hittar du underlaget?",
    alternativ: [
      "Balansräkningen — eget kapital två år i rad",
      "Resultaträkningen — nettoomsättningen för året och föregående år",
      "Kassaflödesanalysen — kassaflöde från den löpande verksamheten",
      "Noten om immateriella tillgångar",
    ],
    ratt: 1,
    tips: "Tillväxten är procentförändringen mellan två års nettoomsättning — båda åren står i resultaträkningen.",
  },
  {
    fraga: "V07 Bruttomarginal räknas ut som…",
    alternativ: [
      "Rörelseresultat ÷ nettoomsättning",
      "Nettoomsättning − personalkostnader",
      "(Nettoomsättning − rörelsens kostnader exkl. personalkostnader) ÷ nettoomsättning",
      "EBITDA + avskrivningar ÷ eget kapital",
    ],
    ratt: 2,
    tips: "Personalkostnaderna ingår INTE i rörelsens kostnader vid bruttomarginalen — läs noterna noga.",
  },
  {
    fraga: "Hur räknas Enterprise Value (EV) i V06 EV/EBITDA?",
    alternativ: [
      "Börsvärde + räntebärande skulder − kassa",
      "Börsvärde ÷ EBITDA",
      "Börsvärde + kassa − skulder",
      "Eget kapital + utdelning",
    ],
    ratt: 0,
    tips: "EV är priset för hela bolaget inklusive skulden — därför dras kassan av.",
  },
  {
    fraga: "V09 ROE beräknas som…",
    alternativ: [
      "Resultat före skatt ÷ börsvärde",
      "Rörelseresultat ÷ omsättningstillgångar",
      "Utdelning ÷ aktiekurs",
      "Resultat efter skatt ÷ snittet av eget kapital (årets början + slut)",
    ],
    ratt: 3,
    tips: "ROE mäter avkastningen på aktieägarnas kapital — jämför med hur H&Ms ROE föll när moaten eroderades.",
  },
  {
    fraga: "Vilka tre variabler bildar moat-blocket i AKM1?",
    alternativ: [
      "V13 Patent & IP · V14 Varumärke · V15 Nätverkseffekter",
      "V13 P/S · V14 P/B · V15 EV/EBITDA",
      "V13 Likviditet · V14 Intäktsstabilitet · V15 Skuldsättningsgrad",
      "V13 ARR · V14 P/S · V15 ROE",
    ],
    ratt: 0,
    tips: "Moat = konkurrensskydd: immateriella rättigheter, varumärke och nätverkseffekter — ROE är ofta en produkt av moaten.",
  },
  {
    fraga: "V19 Kassatäckning — nyemissionsrisk (KRITISK) läses fram ur…",
    alternativ: [
      "Kassaflödesanalysen (löpande verksamheten) + kassabeståndet i balansräkningen",
      "Endast resultaträkningens rörelseresultat",
      "Förvaltningsberättelsens riskavsnitt",
      "Noten om segment och storkunder",
    ],
    ratt: 0,
    tips: "Bränner bolaget kassa? Kombinera kassaflödet från löpande verksamheten med kassan — så ser du runway.",
  },
  {
    fraga: "Varför är V03 Intäktsdiversifiering en viktig variabel?",
    alternativ: [
      "Hög omsättning garanterar alltid vinst",
      "Diversifiering ökar alltid bruttomarginalen",
      "En dominerande storkund gör bolaget sårbart redan vid en enda kontraktsförlust",
      "Den påverkar inte risken alls",
    ],
    ratt: 2,
    tips: "Segmentnoten + storkundsnotten avslöjar koncentrationen — en stor kund är en risk, inte en moat.",
  },
  {
    fraga: "V02 ARR-tillväxt är mest relevant för vilken bolagstyp?",
    alternativ: [
      "SaaS-bolag med återkommande prenumerationsintäkter",
      "Banker och kreditinstitut",
      "Råvarubolag",
      "Investmentbolag",
    ],
    ratt: 0,
    tips: "ARR = Annual Recurring Revenue — står i förvaltningsberättelsen eller presentationen för SaaS-bolag.",
  },
  {
    fraga: "V05 P/B beräknas som…",
    alternativ: [
      "Börsvärde ÷ nettoomsättning",
      "Aktiekurs ÷ utdelning per aktie",
      "EBITDA ÷ kassabehållning",
      "Börsvärde ÷ eget kapital i balansräkningen",
    ],
    ratt: 3,
    tips: "P/B jämför marknadens pris med det bokförda egna kapitalet — båda behövs i beräkningen.",
  },
  {
    fraga: "Hur bedömer du V12 Intäktsstabilitet?",
    alternativ: [
      "Räkna dagens aktiekurs ÷ EBITDA",
      "Läs nettoomsättningen fem år bakåt — hur jämn är kurvan?",
      "Jämför P/E med sektorsnittet för en enskild månad",
      "Läs endast årets pressmeddelanden",
    ],
    ratt: 1,
    tips: "Fem års nettoomsättning i årsredovisningen — en jämn kurva är verklig stabilitet.",
  },
];

/** Max-ålder på cacherad analysdata: 1 h (60 min) — prisdata hålls färskare än
 * fundamentalvågorna. En motor-rad utan analyserbar data cachas aldrig, så ett
 * tillfälligt Yahoo-fel aldrig fryser dagens pass en timme. */
const CACHE_MAX_ALDER_MIN = 60;

/** GET /api/dagens-pass — dagens aktie + våg-fråga + AKM1-fråga på riktig motor-data. */
export async function GET() {
  try {
    const datum = new Date().toISOString().slice(0, 10);
    const ticker = ROTATION[datumHash(datum, 1) % ROTATION.length];
    const akm1 = AKM1_FRAGOR[datumHash(datum, 2) % AKM1_FRAGOR.length];

    // Cachen FÖRE nätverket: lasEllerHamta cachar motor-raden per ticker i
    // samma format som cron-fyllningen (data/cache/analys-{ticker}.json) och
    // anropar motorn bara vid cache-miss eller utgången fönster.
    const { data: analys, franCache } = await lasEllerHamta<Analys | null>(
      ticker,
      "analys",
      async () => {
        const rad = (await körAnalysMotor({ tickers: [ticker] })).tickers[0] ?? null;
        return rad && !rad.fel && rad.data ? rad : null;
      },
      CACHE_MAX_ALDER_MIN,
    );

    if (!analys || analys.fel || !analys.data) {
      return NextResponse.json(
        { error: `Analysmotorn kunde inte hämta data för ${ticker}. Försök igen om en stund.`, datum, ticker },
        { status: 503 }
      );
    }

    // Valfri Yahoo-komplettering — enbart berikning, aldrig felkälla
    const senaste = await hamtaYahooTillskott(ticker);

    const namn = analys.namn || ticker;

    // rattIndex från motorns vågklass på KORT horisont (fallback via kort-momentum)
    const kortVag = analys.vager?.kort;
    let rattIndex = kortVag != null ? VAG_INDEX[kortVag] : undefined;
    if (rattIndex === undefined) {
      const m = analys.momentum?.kort ?? null;
      rattIndex = m == null ? 2 : m > 0.02 ? 0 : m < -0.02 ? 1 : 2;
    }

    return NextResponse.json({
      datum,
      ticker,
      namn,
      bors: analys.bors ?? null,
      valuta: analys.valuta ?? null,
      data: analys.data,
      vager: analys.vager ?? null,
      matris25: analys.matris25 ?? null,
      sammanfattning: analys.sammanfattning ?? null,
      fundament: analys.fundament ?? null,
      senaste,
      franCache,
      kallor: analys.kallor ?? null,
      dagensFraga: {
        fraga: `Vilken vågklass visar motorn på KORT horisont för ${namn}?`,
        alternativ: ["Impulsvåg", "Korrigering", "Basbygge"],
        rattIndex,
      },
      akm1Fraga: akm1,
      notering:
        "Signaler beräknade av AK1A Analysis Engine från live pris/volym-data — pedagogiskt verktyg, inte investeringsråd.",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internt fel" }, { status: 500 });
  }
}
