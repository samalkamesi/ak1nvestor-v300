/**
 * AK1A DATACENTRALEN — daglig lokal cache av all motor-data.
 *
 * Direktiv: "varje dag spara alla data för att nå rätt cache och optimera
 * analysen utan att söka på nätet — med tiden söka via vår egen databas."
 * Kärnan är lasEllerHamta: varje route kan fråga cachen FÖRE nätverket —
 * dagens cron-fyllning (06:00 UTC) gör att analysrouterna kan servera ur
 * egen data och bara hämta när cachen är för gammal.
 *
 * LAGRINGSSTRATEGI (beslutad mot supabase-inventory: ingen data_cache-tabell
 * värd bindningen — filer är enklare och robusta):
 *   - JSON-fil per (ticker, typ): data/cache/{typ}-{ticker}.json i repo-roten
 *     (process.cwd()) — fungerar lokalt, vid build och vid `next start`.
 *   - Vercel-produktion har read-only filsystem utom /tmp: om skrivningen till
 *     data/cache/ misslyckas faller sparaCache graceful tillbaka på
 *     /tmp/datacache/ (skrivbar men flyktig — cachen lever per instans).
 *     Misslyckas även det returneras "no-cache" och anroparen fortsätter som
 *     utan cache. Cachen kan aktiveras på Vercel senare med en writable mount
 *     (t.ex. ett volumemonterat data/cache) — ingen kodändring krävs.
 *
 * SERVER-SIDE ONLY: synkron fs-åtkomst (readFileSync/writeFileSync) — får
 * ALDRIG importeras av klientkomponenter. Används av API-routes med
 * runtime = "nodejs" (t.ex. /api/cron/datacache).
 *
 * Felphilosofi (P8-graceful): läs-/skrivfel kastar ALDRIG — lasCache → null,
 * sparaCache → "no-cache". Cachen är en accelererare, aldrig ett beroende.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";

// ── Publika typer ────────────────────────────────────────────────────────────

/** De fyra motorernas svarstyper som cachas per ticker. */
export type CacheTyp = "vagfundament" | "analys" | "konfluens" | "netnet";

/** En cacherad — hela motorsvaret för (ticker, typ) plus metadata. */
export type CacheRad = {
  ticker: string;
  typ: CacheTyp;
  /** Motor-svaret (okänt format — typas av läsaren via lasEllerHamta<T>). */
  data: unknown;
  /** Epoch-milliseconds när raden sparades. */
  cachad: number;
  /** "cron" = daglig fyllning, "on-demand" = lasEllerHamta-utfyllnad. */
  kalla: "cron" | "on-demand";
};

/** Var sparaCache faktiskt landade ("no-cache" = ingen skrivbar katalog). */
export type CacheLagring = "data/cache" | "/tmp/datacache" | "no-cache";

const TYPER: readonly CacheTyp[] = ["vagfundament", "analys", "konfluens", "netnet"];

/** Samma ticker-format som motorerna accepterar (Yahoos syntax). */
const TICKER_RE = /^[A-Za-z0-9.\-]{1,12}$/;

// ── Katalog- och filhjälpmedel ───────────────────────────────────────────────

/** Primär katalog: <repo>/data/cache — beständig lokalt och vid `next start`. */
function huvudKatalog(): string {
  return join(process.cwd(), "data", "cache");
}

/** Reservkatalog: /tmp/datacache (TMPDIR om satt) — Vercels skrivbara yta. */
function reservKatalog(): string {
  const bas = process.env.TMPDIR || process.env.TMP || process.env.TEMP || "/tmp";
  return join(bas, "datacache");
}

/** Läskataloger i prioritetsordning: huvudkatalogen först, reserven efter. */
function kataloger(): string[] {
  return [huvudKatalog(), reservKatalog()];
}

/**
 * Filnamn för (ticker, typ): endast [A-Za-z0-9] behålls, övriga tecken (t.ex.
 * "-" och "." i "VOLV-B.ST") blir "_". Det blockar path-traversal och
 * Windows-reserverade namn samtidigt som filerna är deterministiska.
 */
function filNamn(ticker: string, typ: CacheTyp): string {
  return `${typ}-${ticker.replace(/[^A-Za-z0-9]/g, "_")}.json`;
}

function filVag(katalog: string, ticker: string, typ: CacheTyp): string {
  return join(katalog, filNamn(ticker, typ));
}

function arTyp(v: unknown): v is CacheTyp {
  return typeof v === "string" && (TYPER as readonly string[]).includes(v);
}

/** Läser + tolkar EN fil; null vid saknad/korrupt/ogiltig rad. Aldrig kast. */
function lasFil(katalog: string, ticker: string, typ: CacheTyp): CacheRad | null {
  try {
    const rad = JSON.parse(readFileSync(filVag(katalog, ticker, typ), "utf8")) as CacheRad;
    if (!rad || typeof rad !== "object") return null;
    if (rad.ticker !== ticker || rad.typ !== typ) return null;
    if (typeof rad.cachad !== "number" || !Number.isFinite(rad.cachad)) return null;
    if (rad.kalla !== "cron" && rad.kalla !== "on-demand") return null;
    return rad;
  } catch {
    return null;
  }
}

// ── Publikt API ──────────────────────────────────────────────────────────────

/**
 * Läs en cacherad. maxAlderMin (minuter) styr färskheten: en äldre rad räknas
 * som träff-bara-från-nästa-katalog — faller även reserven bort returneras
 * null (cache-miss). Utan maxAlderMin serveras första funna raden oavsett ålder
 * (användbart som nätverksreserv i lasEllerHamta).
 */
export async function lasCache(
  ticker: string,
  typ: CacheRad["typ"],
  maxAlderMin?: number,
): Promise<CacheRad | null> {
  if (!TICKER_RE.test(ticker) || !arTyp(typ)) return null;
  for (const katalog of kataloger()) {
    const rad = lasFil(katalog, ticker, typ);
    if (rad === null) continue;
    if (typeof maxAlderMin === "number") {
      if (Date.now() - rad.cachad > maxAlderMin * 60_000) continue; // för gammal här — pröva reserven
    }
    return rad;
  }
  return null;
}

/**
 * Spara en cacherad. Skriver data/cache/{typ}-{ticker}.json; misslyckas det
 * (read-only fs på Vercel) provas /tmp/datacache/, och som sista utväg
 * returneras "no-cache" — anroparen fortsätter då utan cache (graceful).
 * Returnvärdet är ignorerbart för anropare som inte bryr sig.
 */
export async function sparaCache(
  ticker: string,
  typ: CacheRad["typ"],
  data: unknown,
  kalla?: string,
): Promise<CacheLagring> {
  if (!TICKER_RE.test(ticker) || !arTyp(typ)) return "no-cache";
  const rad: CacheRad = {
    ticker,
    typ,
    data,
    cachad: Date.now(),
    kalla: kalla === "cron" ? "cron" : "on-demand",
  };
  const innehall = JSON.stringify(rad);
  try {
    const katalog = huvudKatalog();
    mkdirSync(katalog, { recursive: true });
    writeFileSync(filVag(katalog, ticker, typ), innehall, "utf8");
    return "data/cache";
  } catch {
    // read-only filsystem (t.ex. Vercel) — pröva reserven
  }
  try {
    const katalog = reservKatalog();
    mkdirSync(katalog, { recursive: true });
    writeFileSync(filVag(katalog, ticker, typ), innehall, "utf8");
    return "/tmp/datacache";
  } catch {
    // ingen skrivbar yta alls — cachen avstängd, aldrig kast
  }
  return "no-cache";
}

/**
 * KÄRNAN: fråga cachen först, hämta bara vid behov.
 *
 *  1. Frisk cacherad (inom maxAlderMin) → serveras direkt, franCache: true.
 *  2. Annars kös hämtaren (t.ex. körVagfundament) och resultatet fylls på
 *     cachen (kalla "on-demand") — nästa anrop inom fönstret går ur cachen.
 *  3. RESERV: om hämtaren kastar men en gammal rad finns serveras den istället
 *     ("med tiden söka via vår egen databas" — nätverksbrott ska inte döda
 *     analysen). Finns ingen rad alls kastas hämtarens fel vidare.
 *
 * data: null i en cacherad räknas som miss (kan inte skiljas från saknad).
 */
export async function lasEllerHamta<T>(
  ticker: string,
  typ: CacheRad["typ"],
  hamta: () => Promise<T>,
  maxAlderMin?: number,
): Promise<{ data: T; franCache: boolean }> {
  const frisk = await lasCache(ticker, typ, maxAlderMin);
  if (frisk !== null && frisk.data !== null && frisk.data !== undefined) {
    return { data: frisk.data as T, franCache: true };
  }
  try {
    const data = await hamta();
    await sparaCache(ticker, typ, data, "on-demand");
    return { data, franCache: false };
  } catch (fel) {
    const gammal = await lasCache(ticker, typ); // valfri ålder — nätverksreserv
    if (gammal !== null && gammal.data !== null && gammal.data !== undefined) {
      return { data: gammal.data as T, franCache: true };
    }
    throw fel;
  }
}

/**
 * Cachens hälsa: antal rader, äldsta/yngsta cachad-tidsstämpel (epoch-ms) och
 * radfördelning per typ. Läser båda katalogerna (huvudkatalogen vinner vid
 * dublett). Tom/avsaknad katalog ger nulfyllt svar — aldrig kast.
 */
export async function cacheStatistik(): Promise<{
  rader: number;
  aldst: number | null;
  yngst: number | null;
  perTyp: Record<string, number>;
}> {
  let rader = 0;
  let aldst: number | null = null;
  let yngst: number | null = null;
  const perTyp: Record<string, number> = {};
  const lasa = new Set<string>(); // filnamn — huvudkatalogen har företräde
  for (const katalog of kataloger()) {
    let filer: string[];
    try {
      filer = readdirSync(katalog);
    } catch {
      continue; // katalog saknas/oläsbar
    }
    for (const fil of filer) {
      if (!fil.endsWith(".json") || lasa.has(fil)) continue;
      try {
        const rad = JSON.parse(readFileSync(join(katalog, fil), "utf8")) as CacheRad;
        if (!rad || typeof rad !== "object" || !arTyp(rad.typ)) continue;
        if (typeof rad.cachad !== "number" || !Number.isFinite(rad.cachad)) continue;
        lasa.add(fil);
        rader += 1;
        perTyp[rad.typ] = (perTyp[rad.typ] ?? 0) + 1;
        if (aldst === null || rad.cachad < aldst) aldst = rad.cachad;
        if (yngst === null || rad.cachad > yngst) yngst = rad.cachad;
      } catch {
        // korrupt fil hopphas
      }
    }
  }
  return { rader, aldst, yngst, perTyp };
}
