import { NextRequest, NextResponse } from "next/server";
import { promises as fsp } from "fs";
import path from "path";
import { körAnalysMotor, type TickerAnalys } from "@/lib/analys-motor";
import { publiceraSignal } from "@/lib/signal-bus";
import { publiceraOrganEvent } from "@/lib/organ-event";
import {
  beslutaIntervall,
  jamforDåNu,
  raknaNotisTexter,
  skapaSnapshot,
  type Jamforelse,
} from "@/lib/portfolj-forskning/uppfoljning";
import type {
  Bransch,
  Horisont,
  KorstabbellRad,
  RiskProfil,
  UppfoljningSnapshot,
  VagKlass,
} from "@/lib/portfolj-forskning/typer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST/GET /api/cron/portfolj-uppfoljning — portföljernas "då vs nu"-andetag.
 *
 * KUNDdirektiv: samma aktier analyseras varje månad eller kvartal ( per
 * portfölj ), klienten får en notis och tas till sidan där portföljen och
 * analysen då mot nu visas ( /min-portfolj ).
 *
 * FLÖDE per portföljfil i data/portfolj-system/uppfoljning/*.json:
 *  1. aktiv === false → hoppas över ( EXEMPEL.json är dokumentation, inte data ).
 *  2. beslutaIntervall( senaste snapshot, intervall ) avgör om det är dags —
 *     månads-cronen triggar själv rätt takt per portfölj ( manad/kvartal ).
 *  3. körAnalysMotor ( analys-motor.ts ) ger TEKNISK vågstatus + pris per
 *     ticker; AKM1 läses ur data/cache/akm1-<TICKER>.json och fundamental
 *     vågstatus ur data/cache/fvag-<TICKER>.json ( P6-/P2-konvention ) när
 *     dessa levererat — ANNARS ärligt: AKM1/fvag bärs vidare från senaste
 *     snapshot som "senast kända mätning" ( forandringAkm1 sätts till null
 *     och snapshoten noterar att ingen omräkning skett ), och på allra första
 *     mätningen redovisas fvag som "osatt" — motorn hittar ALDRIG på data.
 *  4. jamforDåNu + raknaNotisTexter ( max 3 ) → publiceraSignal per text
 *     ( SAMMA mönster som /api/nyheter/scan; NotisCenter läser signal-bussen
 *     via lasSignalerForElev — det finns inget server-skrivet localStorage,
 *     därför valdes signal-bussen framför "ak1a-nyheter-top"-mönstret som är
 *     klientside-skrivet ) med länk till /min-portfolj, mottagare fas2.
 *  5. Filen skrivs tillbaka med nya snapshots + historikrad. Skrivningen kan
 *     misslyckas på read-only filsystem ( Vercel ) — då publiceras notiserna
 *     ändå och felet redovisas ärligt i svaret ( se begränsning i rapporten ).
 *  6. publiceraOrganEvent ( organ/portfolj, verb rapport ) — den månadsvisa
 *     kroppspulsen ( /api/kropp ), grova tal utan tickers/namn ( P8 ).
 *
 * SKYDD: samma CRON_SECRET-mönster som /api/nyheter/scan ( ?secret= eller
 * Authorization: Bearer; utan satt secret är rutten öppen i dev ).
 * Vercel Cron anropar GET — POST finns för manuella/externa triggningar.
 *
 * ALDRIG krascha, ALDRIG investeringsråd — allt är pedagogisk forskning.
 */

// ── Konstanter ────────────────────────────────────────────────────────────────

/** Portföljfilernas hem. process.cwd() fungerar i dev och i Vercel-bygget. */
const KATALOG = path.join(process.cwd(), "data", "portfolj-system", "uppfoljning");

/** Cache-katalogen där P1/P2/P6 lämnar sina mätvärden. */
const CACHE_KATALOG = path.join(process.cwd(), "data", "cache");

/** Timeout-skydd: max 10 tickers per portfölj ( motorerna kör max 12 —
 *  uppföljningen håller sig strax under för att lämna marginal på 60 s ). */
const MAX_TICKERS = 10;

/** Timeout-skydd: max 6 portföljer per andetag — resterande köas till nästa
 *  månad ( cron:en kommer ändå tillbaka, det är en månadsandning ). */
const MAX_PORTFOLJER = 6;

const HORIZONTER: Horisont[] = ["mikro", "kort", "medellang", "lang", "mega"];

const BRANSCHER: Bransch[] = [
  "teknik", "industri", "halso", "konsument", "fastighet",
  "finans", "material", "energi", "kommunikation", "tillvaxt",
];

/** Notisens mål — sidan där klienten ser sin portfölj då mot nu. */
const NOTIS_LANK = "/min-portfolj";

// ── Portföljfilens form ───────────────────────────────────────────────────────

/** En portföljfil i uppfoljning/-katalogen ( dokumenterad i EXEMPEL.json ). */
type UppfoljningFil = {
  portfoljId: string;
  namn?: string;
  /** false → cronen hoppar filen ( EXEMPEL.json ). Standard: aktiv. */
  aktiv?: boolean;
  riskProfil: RiskProfil;
  tickers: string[];
  intervall: "manad" | "kvartal";
  snapshots: UppfoljningSnapshot[];
  historik?: Array<{ datum: string; text: string }>;
  /** dokumentationsfält ignoreras av cronen */
  _dokumentation?: unknown;
};

// ── Hjälpmedel ────────────────────────────────────────────────────────────────

/** Lokal kalenderdag som YYYY-MM-DD (samma semantik som vagscan/analys-motor). */
function lokalDagIso(d = new Date()): string {
  return (
    d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0")
  );
}

/** Giltigt ISO-datum? */
function arIsoDatum(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

/**
 * Ticker → cache-filnamnsnyckel: "ABB.ST" → "ABB_ST" (fundamental-konvention).
 * Vitlistad: endast [A-Z0-9_-] — null om tickern innehåller sökvägs- eller
 * traversal-tecken (path traversal-skydd, samma standard som sakraFilnamn).
 */
function cacheNyckel(ticker: string): string | null {
  const nyckel = ticker.toUpperCase().replace(".", "_");
  if (!/^[A-Z0-9_-]{1,24}$/.test(nyckel) || nyckel.includes("..")) return null;
  return nyckel;
}

/** Läs + JSON-tolka en fil defensivt — null vid allt motstånd. */
async function lasJson(fil: string): Promise<unknown> {
  try {
    return JSON.parse(await fsp.readFile(fil, "utf-8"));
  } catch {
    return null;
  }
}

/** AKM1 ur P6-cache ( AKM1Bedomning.totalt ) — null när filen/data saknas. */
async function lasAkm1Cache(ticker: string): Promise<number | null> {
  const nyckel = cacheNyckel(ticker);
  if (!nyckel) return null;
  const rå = (await lasJson(path.join(CACHE_KATALOG, `akm1-${nyckel}.json`))) as
    | { totalt?: unknown; akm1Totalt?: unknown }
    | null;
  for (const v of [rå?.totalt, rå?.akm1Totalt]) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

/** Fundamental vågstatus ur P2-cache ( FVagAnalys.perHorisont ) — null när saknas. */
async function lasFvagCache(ticker: string): Promise<Record<Horisont, VagKlass> | null> {
  const nyckel = cacheNyckel(ticker);
  if (!nyckel) return null;
  const rå = (await lasJson(path.join(CACHE_KATALOG, `fvag-${nyckel}.json`))) as
    | { perHorisont?: Record<string, unknown> }
    | null;
  const per = rå?.perHorisont;
  if (!per || typeof per !== "object") return null;
  const ut = {} as Record<Horisont, VagKlass>;
  let n = 0;
  for (const hz of HORIZONTER) {
    const v = per[hz];
    ut[hz] = v === "impulsvag" || v === "korrigering" || v === "basbygge" || v === "osatt" ? v : "osatt";
    if (ut[hz] !== "osatt") n += 1;
  }
  return n > 0 ? ut : null;
}

/** Bransch ur P1-cache ( fundamental-<TICKER>.json ) — endast metadata i
 *  KorstabbellRad ( propagerar ALDRIG in i snapshoten ), "tillvaxt" som sista
 *  utväg när inget underlag finns. */
async function lasBransch(ticker: string): Promise<Bransch> {
  const nyckel = cacheNyckel(ticker);
  if (!nyckel) return "tillvaxt";
  const rå = (await lasJson(path.join(CACHE_KATALOG, `fundamental-${nyckel}.json`))) as
    | { bransch?: unknown }
    | null;
  return BRANSCHER.includes(rå?.bransch as Bransch) ? (rå?.bransch as Bransch) : "tillvaxt";
}

/** Säker teknisk vågstatus ur motorns svar — motor-typen skriver "impulsvåg"
 *  ( med å ) medan portföljforskningens kontrakt är "impulsvag" ( utan å,
 *  JSON-nycklar utan å/ä/ö enligt typer.ts ): översätt, ogiltigt → "osatt". */
function tvagFranMotor(a: TickerAnalys | undefined): Record<Horisont, VagKlass> {
  const ut = {} as Record<Horisont, VagKlass>;
  for (const hz of HORIZONTER) {
    const v = a?.vager?.[hz];
    ut[hz] =
      v === "impulsvåg"
        ? "impulsvag"
        : v === "korrigering" || v === "basbygge"
          ? v
          : "osatt";
  }
  return ut;
}

/** Senaste snapshot per ticker ( deduplicerat, deterministisk ordning på
 *  datum + ticker ) — uppföljningens "då". */
function senastePerTicker(snapshots: UppfoljningSnapshot[]): UppfoljningSnapshot[] {
  const sorterade = [...snapshots].sort(
    (a, b) => String(a?.datum ?? "").localeCompare(String(b?.datum ?? "")) || String(a?.ticker ?? "").localeCompare(String(b?.ticker ?? ""))
  );
  const map = new Map<string, UppfoljningSnapshot>();
  for (const s of sorterade) {
    if (s && typeof s.ticker === "string" && s.ticker !== "") map.set(s.ticker, s);
  }
  return [...map.values()].sort((a, b) => a.ticker.localeCompare(b.ticker));
}

/** Filens senaste snapshot-datum (ISO-jämförelse räcker) — null när tomt. */
function senasteDatum(fil: UppfoljningFil): string | null {
  let senast: string | null = null;
  for (const s of fil.snapshots ?? []) {
    if (arIsoDatum(s?.datum) && (senast === null || (s.datum as string) > senast)) {
      senast = s.datum;
    }
  }
  return senast;
}

/** Deduplicera tickers ( första förekomsten gäller ) och ta max MAX_TICKERS. */
function rensaTickers(tickers: unknown): string[] {
  const setta = new Set<string>();
  const ut: string[] = [];
  for (const t of Array.isArray(tickers) ? tickers : []) {
    if (typeof t !== "string" || t === "" || setta.has(t)) continue;
    setta.add(t);
    ut.push(t);
  }
  return ut.slice(0, MAX_TICKERS);
}

/** Filnamnssortering — deterministisk körordning ( endast *.json ). */
async function listaPortfoljFiler(): Promise<string[]> {
  try {
    const poster = await fsp.readdir(KATALOG, { withFileTypes: true });
    return poster
      .filter((p) => p.isFile() && p.name.toLowerCase().endsWith(".json"))
      .map((p) => p.name)
      .filter(sakraFilnamn)
      .sort((a, b) => a.localeCompare(b));
  } catch {
    // Katalogen saknas → inga portföljer att följa ( graceful, första.dev-läge )
    return [];
  }
}

/**
 * Path traversal-skydd: endast rena basnamn i strikt vitlista får bli
 * filsökvägar — inga sökvägsseparatorer, inga ".."-segment, endast
 * [A-Za-z0-9._-] + .json. (Samma standard som P1:s Python-insamlare.)
 */
function sakraFilnamn(namn: string): boolean {
  if (!/^[A-Za-z0-9._-]+\.json$/i.test(namn)) return false;
  if (namn.includes("/") || namn.includes("\\")) return false;
  if (namn.startsWith(".") || namn.includes("..")) return false;
  return true;
}

/** Rotkontroll: löst mål får aldrig lämna portföljkatalogen. */
function sakraSokvag(namn: string): string | null {
  const mal = path.resolve(KATALOG, namn);
  const rot = path.resolve(KATALOG) + path.sep;
  return mal.startsWith(rot) ? mal : null;
}

// ── Huvudlogik ────────────────────────────────────────────────────────────────

interface resultatRad {
  portfoljId: string;
  tickers?: number;
  snapshots?: number;
  notiser?: number;
  sparat?: boolean;
  orsak?: string;
}

async function koraUppfoljning(): Promise<NextResponse> {
  const idag = lokalDagIso();
  const filnamn = (await listaPortfoljFiler());
  const bearbetade: resultatRad[] = [];
  const hoppade: resultatRad[] = [];
  const fel: Array<{ portfoljId: string; meddelande: string }> = [];
  let aktiva = 0;
  let korda = 0;

  for (const namn of filnamn) {
    if (korda >= MAX_PORTFOLJER) {
      hoppade.push({ portfoljId: namn, orsak: "kö-gräns — tas nästa andetag" });
      continue;
    }
    const filSokvag = sakraSokvag(namn);
    if (!filSokvag) {
      fel.push({ portfoljId: namn, meddelande: "ogiltigt filnamn (vägrar läsa utanför katalogen)" });
      continue;
    }
    const rå = (await lasJson(filSokvag)) as UppfoljningFil | null;
    if (!rå || typeof rå.portfoljId !== "string" || rå.portfoljId === "") {
      fel.push({ portfoljId: namn, meddelande: "ogiltig portföljfil ( portfoljId saknas )" });
      continue;
    }
    if (rå.aktiv === false) {
      hoppade.push({ portfoljId: rå.portfoljId, orsak: "inaktiv ( aktiv: false )" });
      continue;
    }
    aktiva += 1;

    const intervall = rå.intervall === "kvartal" ? "kvartal" : "manad";
    const tickers = rensaTickers(rå.tickers);
    if (tickers.length === 0) {
      hoppade.push({ portfoljId: rå.portfoljId, orsak: "ingen ticker att följa" });
      continue;
    }
    if (!beslutaIntervall(senasteDatum(rå), intervall)) {
      hoppade.push({ portfoljId: rå.portfoljId, orsak: `intervall ${intervall} ej slut än` });
      continue;
    }
    korda += 1;

    try {
      // 1) Teknisk vågstatus + pris från analys-motorn ( kastar aldrig —
      //    tickers utan data får ärligt "fel" och hopas över denna gång ).
      const motorSvar = await körAnalysMotor({ tickers });
      const perTicker = new Map<string, TickerAnalys>();
      for (const t of motorSvar.tickers ?? []) {
        if (t && typeof t.ticker === "string") perTicker.set(t.ticker, t);
      }

      const daLista = senastePerTicker(rå.snapshots ?? []);
      const daMap = new Map(daLista.map((s) => [s.ticker, s]));
      const nyaSnapshots: UppfoljningSnapshot[] = [];

      for (const ticker of tickers) {
        const svar = perTicker.get(ticker);
        if (!svar || svar.fel) {
          // Ärligt hopp: utan ny mätdata skapas INGEN snapshot — annars skulle
          // "osatt" kunna likna en vågklassförändring som aldrig mätts.
          continue;
        }
        const tidigare = daMap.get(ticker);
        const [akm1, fvagCache, bransch] = await Promise.all([
          lasAkm1Cache(ticker),
          lasFvagCache(ticker),
          lasBransch(ticker),
        ]);
        const akm1FranCache = akm1 !== null;

        // Fundamental vågstatus: P2-cache i första hand; annars senast kända
        // bild ( vidmare ) — på första mätningen "osatt" ( motorn gissar aldrig ).
        const fvag =
          fvagCache ??
          (tidigare ? tidigare.fvagPerHorisont : ({ mikro: "osatt", kort: "osatt", medellang: "osatt", lang: "osatt", mega: "osatt" } as Record<Horisont, VagKlass>));

        const rad: KorstabbellRad = {
          ticker,
          namn: typeof svar.namn === "string" && svar.namn !== "" ? svar.namn : ticker,
          bransch,
          akm1Totalt: akm1FranCache ? (akm1 as number) : tidigare && Number.isFinite(tidigare.akm1Totalt) ? tidigare.akm1Totalt : 0,
          akm1PerKategori: {},
          fvagPerHorisont: fvag,
          fvagDynamik: "osatt",
          tvagPerHorisont: tvagFranMotor(svar),
          golvMarginal: null,
          senastKontrollerad: idag,
          status: "osatt",
        };

        const snap = skapaSnapshot(rad, svar.data?.pris ?? null, tidigare);
        if (!akm1FranCache) {
          // AKM1 ej omräknad denna mätning — delta är EJ jämförbart, sätt null
          // och redovisa ärligt i notistextfältet ( aldrig en låtsas-nolla ).
          snap.forandringAkm1 = null;
          snap.notisText = [
            tidigare
              ? "AKM1 ej omräknad i denna mätning ( P6-cache saknas ) — senast kända värde redovisas."
              : "AKM1 ej tillgänglig ännu ( P6-cache saknas ) — väntar på första AKM1-mätningen.",
          ].join(" ");
        }
        if (!fvagCache && tidigare) {
          snap.notisText = [
            snap.notisText,
            "Fundamental vågstatus ej ommätt denna gång ( P2-cache saknas ) — senast kända bild redovisas.",
          ]
            .filter((x) => x !== undefined)
            .join(" ");
        }
        nyaSnapshots.push(snap);
      }

      if (nyaSnapshots.length === 0) {
        hoppade.push({ portfoljId: rå.portfoljId, orsak: "analys-motorn returnerade ingen data denna gång" });
        continue;
      }

      // 2) Då vs nu + notistexter ( max 3 ) — notisText fästs på signifikanta
      //    snapshoten så djupvyn ( P4 ) visar "varför" direkt på positionen.
      const jamforelser = jamforDåNu(nyaSnapshots, daLista);
      const namn = typeof rå.namn === "string" && rå.namn.trim() !== "" ? rå.namn.trim() : rå.portfoljId;
      const notisTexter = raknaNotisTexter(jamforelser, namn);
      const perBetydelse = new Map<string, Jamforelse>(
        jamforelser.filter((j) => j.betydelse !== "liten").map((j) => [j.ticker, j])
      );
      for (const snap of nyaSnapshots) {
        const j = perBetydelse.get(snap.ticker);
        if (!j) continue;
        const del = j.text.slice(0, 200);
        snap.notisText = snap.notisText ? `${snap.notisText} ${del}` : del;
      }

      // 3) Skriv tillbaka filen ( snapshots + historikrad med sammanfattningen ).
      const historikrad = {
        datum: idag,
        text: notisTexter[notisTexter.length - 1] ?? `Omanalyserad ${idag}: ${nyaSnapshots.length} tickers mätta.`,
      };
      const utFil: UppfoljningFil = {
        ...rå,
        snapshots: [...(rå.snapshots ?? []), ...nyaSnapshots],
        historik: [...(rå.historik ?? []), historikrad].slice(-200),
      };
      let sparat = true;
      try {
        await fsp.writeFile(filSokvag, JSON.stringify(utFil, null, 2) + "\n", "utf-8");
      } catch (e: unknown) {
        sparat = false;
        fel.push({
          portfoljId: rå.portfoljId,
          meddelande: `kunde ej spara snapshotfilen: ${e instanceof Error ? e.message : "okänt fel"}`,
        });
      }

      // 4) Publicera notiserna — samma mönster som nyhets-motorn: EN signal
      //    per notistext på signal-bussen ( NotisCenter läser den server-side,
      //    det finns inget server-skrivet localStorage ). Max 3 per portfölj.
      for (const text of notisTexter) {
        await publiceraSignal({
          kalla: "portfolj-uppfoljning",
          typ: "info",
          rubrik: `Portföljuppföljning: ${namn}`.slice(0, 90),
          text: text.slice(0, 400),
          ikon: "🧭",
          lank: NOTIS_LANK,
          mottagare: "fas2",
        });
      }

      bearbetade.push({
        portfoljId: rå.portfoljId,
        tickers: tickers.length,
        snapshots: nyaSnapshots.length,
        notiser: notisTexter.length,
        sparat,
      });
    } catch (e: unknown) {
      fel.push({
        portfoljId: rå.portfoljId,
        meddelande: e instanceof Error ? e.message : "okänt fel i uppföljningen",
      });
    }
  }

  // 5) OrganEvent — den månadsvisa pulsen (AUTONOMI-ARKITEKTUR: varje autonom
  //    kanal andas ut ett organ-event, även en rond utan förfallna portföljer
  //    är en LEVANDE signal). Grova tal only (P8): inga tickers/namn läcker.
  await publiceraOrganEvent({
    source: "organ/portfolj",
    verb: "rapport",
    matt: {
      aktiva,
      bearbetade: bearbetade.length,
      notiser: bearbetade.reduce((s, r) => s + (r.notiser ?? 0), 0),
      hoppade: hoppade.length,
      fel: fel.length,
    },
  });

  return NextResponse.json({ ok: true, datum: idag, aktiva, bearbetade, hoppade, fel });
}

/** Skyddet — identiskt med /api/nyheter/scan. */
function auktoriserad(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const qs = req.nextUrl.searchParams.get("secret");
  const auth = req.headers.get("authorization");
  return qs === secret || auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!auktoriserad(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    return await koraUppfoljning();
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, fel: e instanceof Error ? e.message : "Portföljuppföljningen misslyckades" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!auktoriserad(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    return await koraUppfoljning();
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, fel: e instanceof Error ? e.message : "Portföljuppföljningen misslyckades" },
      { status: 500 },
    );
  }
}
