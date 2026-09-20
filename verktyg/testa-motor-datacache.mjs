#!/usr/bin/env node
/**
 * AK1A — Kontraktssvit DATACACHE (src/lib/datacache.ts) · våg V213B-U2.
 *
 * Datacentralens lokala cache — de fyra publika kontrakten:
 *   lasCache(ticker, typ, maxAlderMin?)             → CacheRad | null
 *   sparaCache(ticker, typ, data, kalla?)           → "data/cache" | "/tmp/datacache" | "no-cache"
 *   lasEllerHamta(ticker, typ, hamta, maxAlderMin?) → { data, franCache }
 *   cacheStatistik()                                → { rader, aldst, yngst, perTyp }
 * Filosofin som testas (P8-graceful, motorns filhuvud): läs-/skrivfel kastar
 * ALDRIG — cachen är en accelererare, aldrig ett beroende.
 *
 * ISOLERING (deterministiskt: ingen server, inget nätverk, ingen prod):
 * Motorn äger två kataloger — process.cwd()/data/cache (huvud) och
 * <TMPDIR||"/tmp">/datacache (reserv). Sviten process.chdir:ar till en
 * sandlåda under OS-temp och pekar om TMPDIR dit; repots riktiga data/cache
 * berörs aldrig (varken läs eller skriv). Tidsberoendet fryses genom att
 * cacherader sås med VALDA cachad-tidsstämplar (motorn stödjer ingen
 * injicerad klocka); fönstermarginalerna är ±60 s mot realtid och sviten
 * går på millisekunder — gränserna kan inte vända under körningen.
 *
 * Kontroller (23): exportkontrakt · spara/läs-round-trip med filnamnssanering
 * (VOLV-B.ST ⇒ analys-VOLV_B_ST.json) · kalla-normalisering · ticker/typ-
 * validering utan skrivspår · färskhetsfönstret · katalogprioritet huvud >
 * reserv med genomfall vid gammal rad · ogiltig JSON/fält ⇒ null ·
 * lasEllerHamta: träff utan hämtanrop, miss + on-demand-fyllnad, data:null =
 * miss, nätverksreserv mot gammal rad, hämtarens fel vidarekastat ·
 * skrivkedjans tre steg (huvud ⇒ reserv ⇒ "no-cache") · cacheStatistik:
 * tom, innehåll, dublett där huvudet vinner, sopor hopphas, saknade
 * kataloger ⇒ nulfyllt svar.
 *
 * Användning:  node verktyg/testa-motor-datacache.mjs
 *              (node ≥ 22.18 läser .ts internt; äldre node/kanaler:
 *               npx --yes tsx verktyg/testa-motor-datacache.mjs)
 * Avslutskod:  0 om alla kontroller PASS, 1 annars.
 * Sista raden: "RESULTAT: N/M PASS".
 */
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const MODUL_SOKVAG = join(REPO, "src", "lib", "datacache.ts");

// ── Testram (kontroll-mönstret från verktyg/testa-admin-session.mjs) ─────────
const RADER = [];
function kontroll(namn, ok, detalj = "") {
  RADER.push({ namn, ok: !!ok, detalj });
}
function sammanstall() {
  let fail = 0;
  let nr = 0;
  for (const r of RADER) {
    nr += 1;
    if (!r.ok) fail += 1;
    console.log(`${r.ok ? "PASS" : "FAIL"}  ${String(nr).padStart(2)} · ${r.namn}${r.detalj ? " — " + r.detalj : ""}`);
  }
  const grona = RADER.length - fail;
  console.log("");
  console.log(`[testa-motor-datacache] ${grona}/${RADER.length} kontroller gröna${fail ? `, ${fail} FAIL` : ""}.`);
  console.log(`RESULTAT: ${grona}/${RADER.length} PASS`);
  process.exitCode = fail ? 1 : 0;
}

// ── Sandlåda: motorns två kataloger flyttas in under OS-temp ─────────────────
const SKRAP = join(tmpdir(), `ak1a-datacache-test-${process.pid}`);
const ARBETE = join(SKRAP, "arbete");                 // ny process.cwd() för huvudKatalog()
const RESERV = join(SKRAP, "reserv");                 // ny TMPDIR för reservKatalog()
const RESERV_BLOCKAD = join(SKRAP, "reserv-blockad"); // TMPDIR där "datacache" är en FIL
const HUVUD = join(ARBETE, "data", "cache");          // speglar huvudKatalog() efter chdir
const RESERV_KAT = join(RESERV, "datacache");         // speglar reservKatalog() efter TMPDIR
const GAMMAL_CWD = process.cwd();
const GAMMAL_TMPDIR = process.env.TMPDIR;
const MIN = 60_000;

function tomCachear() {
  for (const k of [HUVUD, RESERV_KAT]) rmSync(k, { recursive: true, force: true });
  mkdirSync(HUVUD, { recursive: true });
  mkdirSync(RESERV_KAT, { recursive: true });
}

/** Så en cacherad (eller råsträng) direkt i en katalog — full kontroll på cachad. */
function saRad(katalog, fil, rad) {
  mkdirSync(katalog, { recursive: true });
  writeFileSync(join(katalog, fil), typeof rad === "string" ? rad : JSON.stringify(rad), "utf8");
}

const json = (v) => JSON.stringify(v);
const nu = () => Date.now();

async function main() {
  // ── Import (node ≥ 22.18 tolkar .ts internt; tsx är aggregatorns återfall) ─
  let datacache;
  try {
    datacache = await import(pathToFileURL(MODUL_SOKVAG).href);
  } catch (e) {
    kontroll(
      "Import av src/lib/datacache.ts",
      false,
      `${e && e.message ? e.message : String(e)} — äldre node? kör under tsx`,
    );
    sammanstall();
    return;
  }
  const { lasCache, sparaCache, lasEllerHamta, cacheStatistik } = datacache;

  // Sandlådan aktiveras FÖRE alla motoranrop (importen är cwd-okänslig).
  mkdirSync(ARBETE, { recursive: true });
  mkdirSync(RESERV, { recursive: true });
  mkdirSync(RESERV_BLOCKAD, { recursive: true });
  writeFileSync(join(RESERV_BLOCKAD, "datacache"), "blockerad-fil", "utf8");
  process.env.TMPDIR = RESERV;
  process.chdir(ARBETE);

  // ── (1) Exportkontrakt ─────────────────────────────────────────────────────
  kontroll(
    "Exportkontrakt: lasCache, sparaCache, lasEllerHamta, cacheStatistik är funktioner",
    [lasCache, sparaCache, lasEllerHamta, cacheStatistik].every((f) => typeof f === "function"),
  );

  // ── (2–4) Round-trip i huvudkatalogen + kalla-normalisering ────────────────
  tomCachear();
  const lagring = await sparaCache("VOLV-B.ST", "analys", { pris: 123 }, "cron");
  kontroll(
    "sparaCache ⇒ 'data/cache' med sanerat filnamn (VOLV-B.ST ⇒ analys-VOLV_B_ST.json)",
    lagring === "data/cache" && existsSync(join(HUVUD, "analys-VOLV_B_ST.json")),
    `lagring=${lagring}`,
  );

  const start = nu();
  await sparaCache("VOLV-B.ST", "analys", { pris: 123 }, "cron"); // idempotent omskrivning
  const rad = await lasCache("VOLV-B.ST", "analys");
  kontroll(
    "lasCache round-trip: ticker/typ/data bevarade, kalla='cron', cachad ≈ nu (ändligt epok-ms)",
    rad !== null &&
      rad.ticker === "VOLV-B.ST" &&
      rad.typ === "analys" &&
      json(rad.data) === json({ pris: 123 }) &&
      typeof rad.cachad === "number" &&
      Number.isFinite(rad.cachad) &&
      rad.cachad >= start - 2_000 &&
      rad.cachad <= nu() + 2_000,
  );

  await sparaCache("NORM-1", "analys", { a: 1 });
  let n = await lasCache("NORM-1", "analys");
  const kallaDefault = n !== null && n.kalla === "on-demand";
  await sparaCache("NORM-1", "analys", { a: 2 }, "skrap");
  n = await lasCache("NORM-1", "analys");
  const kallaSkrap = n !== null && n.kalla === "on-demand" && json(n.data) === json({ a: 2 });
  await sparaCache("NORM-1", "analys", { a: 3 }, "cron");
  n = await lasCache("NORM-1", "analys");
  const kallaCron = n !== null && n.kalla === "cron";
  kontroll(
    "kalla-normalisering: undefined/skräp ⇒ 'on-demand', 'cron' ⇒ 'cron'",
    kallaDefault && kallaSkrap && kallaCron,
  );

  // ── (5–6) Invalidering: ticker/typ utanför kontraktet, inget skrivspår ─────
  tomCachear();
  const ogiltiga = ["", "A B", "A/B", "AAAAAAAAAAAAA", "X();"];
  const lasFel = [];
  const sparaFel = [];
  for (const t of ogiltiga) {
    if ((await lasCache(t, "analys")) !== null) lasFel.push(`las:${JSON.stringify(t)}`);
    if ((await sparaCache(t, "analys", {})) !== "no-cache") sparaFel.push(`spara:${JSON.stringify(t)}`);
  }
  kontroll(
    "Ogiltiga tickers ⇒ lasCache null + sparaCache 'no-cache' (tom, mellanslag, slash, 13 tecken, parentes)",
    lasFel.length === 0 && sparaFel.length === 0 && readdirSync(HUVUD).length === 0,
    [...lasFel, ...sparaFel].join(", "),
  );

  const typLas = await lasCache("AAPL", "skrap");
  const typSpara = await sparaCache("AAPL", "skrap", {});
  kontroll(
    "Ogiltig typ (utanför de fyra) ⇒ null/'no-cache' — fortfarande inget skrivspår",
    typLas === null && typSpara === "no-cache" && readdirSync(HUVUD).length === 0,
  );

  // ── (7–9) Färskhetsfönstret (frysta cachad-tidsstämplar, ±60 s marginal) ───
  tomCachear();
  saRad(HUVUD, "analys-FISK4.json", { ticker: "FISK4", typ: "analys", data: "fyra-min", cachad: nu() - 4 * MIN, kalla: "cron" });
  saRad(HUVUD, "analys-FISK6.json", { ticker: "FISK6", typ: "analys", data: "seks-min", cachad: nu() - 6 * MIN, kalla: "cron" });
  const frisk = await lasCache("FISK4", "analys", 5);
  kontroll(
    "maxAlderMin: 4 min gammal rad inom 5-minutersfönstret ⇒ träff",
    frisk !== null && frisk.data === "fyra-min",
  );
  const gammal = await lasCache("FISK6", "analys", 5);
  kontroll(
    "maxAlderMin: 6 min gammal rad utanför fönstret ⇒ null (cache-miss)",
    gammal === null,
  );
  const utanFonster = await lasCache("FISK6", "analys");
  kontroll(
    "Utan maxAlderMin serveras raden oavsett ålder (nätverksreservläget i lasEllerHamta)",
    utanFonster !== null && utanFonster.data === "seks-min",
  );

  // ── (10–11) Katalogprioritet: huvud först, reserv efter genomfall ──────────
  tomCachear();
  saRad(HUVUD, "analys-PRI.json", { ticker: "PRI", typ: "analys", data: "huvud-gammal", cachad: nu() - 6 * MIN, kalla: "cron" });
  saRad(RESERV_KAT, "analys-PRI.json", { ticker: "PRI", typ: "analys", data: "reserv-frisk", cachad: nu(), kalla: "on-demand" });
  const genomfall = await lasCache("PRI", "analys", 5);
  kontroll(
    "Gammal huvudrad + frisk reservrad ⇒ reserven serveras (genomfall till nästa katalog)",
    genomfall !== null && genomfall.data === "reserv-frisk",
  );
  saRad(HUVUD, "analys-PRI.json", { ticker: "PRI", typ: "analys", data: "huvud-frisk", cachad: nu(), kalla: "cron" });
  const vinnare = await lasCache("PRI", "analys", 5);
  kontroll(
    "Frisk rad i BÅDA katalogerna ⇒ huvudkatalogen vinner",
    vinnare !== null && vinnare.data === "huvud-frisk",
  );

  // ── (12–13) Korrupta/ogiltiga cacherader ⇒ null, aldrig kast ───────────────
  tomCachear();
  saRad(HUVUD, "analys-SOPA.json", "{det här är inte json");
  const korrupt = await lasCache("SOPA", "analys");
  kontroll(
    "Ogiltig JSON i cachefilen ⇒ null, aldrig kast",
    korrupt === null,
  );

  saRad(HUVUD, "analys-FELT.json", { ticker: "ANNAN", typ: "analys", data: 1, cachad: nu(), kalla: "cron" });
  saRad(HUVUD, "analys-FELTYP.json", { ticker: "FELTYP", typ: "netnet", data: 1, cachad: nu(), kalla: "cron" });
  saRad(HUVUD, "analys-STR.json", { ticker: "STR", typ: "analys", data: 1, cachad: "1234", kalla: "cron" });
  saRad(HUVUD, "analys-KALLA.json", { ticker: "KALLA", typ: "analys", data: 1, cachad: nu(), kalla: "manuell" });
  const felt = await lasCache("FELT", "analys");
  const feltyp = await lasCache("FELTYP", "analys");
  const strCachad = await lasCache("STR", "analys");
  const felKalla = await lasCache("KALLA", "analys");
  kontroll(
    "Radfältsvalidering: främmande ticker, fel typ, cachad=sträng, kalla='manuell' ⇒ null",
    felt === null && feltyp === null && strCachad === null && felKalla === null,
  );

  // ── (14–18) lasEllerHamta: kärnan — cachen före nätverket ──────────────────
  tomCachear();
  saRad(HUVUD, "analys-TRAFF.json", { ticker: "TRAFF", typ: "analys", data: { svar: "ur-cache" }, cachad: nu(), kalla: "cron" });
  let hamtad = false;
  const traff = await lasEllerHamta("TRAFF", "analys", async () => {
    hamtad = true;
    throw new Error("fick inte kallas");
  });
  kontroll(
    "lasEllerHamta frisk träff: franCache=true, data ur cachen, hämtaren ALDRIG kallad",
    traff.franCache === true && json(traff.data) === json({ svar: "ur-cache" }) && !hamtad,
  );

  const miss = await lasEllerHamta("MISS15", "analys", async () => ({ svar: "fran-nat" }));
  const fylld = await lasCache("MISS15", "analys");
  kontroll(
    "lasEllerHamta miss: hämtaren körs, franCache=false, raden fylld med kalla='on-demand'",
    miss.franCache === false &&
      json(miss.data) === json({ svar: "fran-nat" }) &&
      fylld !== null &&
      fylld.kalla === "on-demand" &&
      json(fylld.data) === json({ svar: "fran-nat" }),
  );

  saRad(HUVUD, "analys-NULLD.json", { ticker: "NULLD", typ: "analys", data: null, cachad: nu(), kalla: "cron" });
  saRad(HUVUD, "analys-SAKNA.json", `{"ticker":"SAKNA","typ":"analys","cachad":${nu()},"kalla":"cron"}`);
  const nullMiss = await lasEllerHamta("NULLD", "analys", async () => "hamtad-null");
  const saknaMiss = await lasEllerHamta("SAKNA", "analys", async () => "hamtad-sakna");
  kontroll(
    "data:null och data-fältet saknas i cacheraden ⇒ räknas som miss (motorns dokumenterade kontrakt)",
    nullMiss.franCache === false &&
      nullMiss.data === "hamtad-null" &&
      saknaMiss.franCache === false &&
      saknaMiss.data === "hamtad-sakna",
  );

  saRad(HUVUD, "analys-RES18.json", { ticker: "RES18", typ: "analys", data: "gammal-reserv", cachad: nu() - 6 * MIN, kalla: "cron" });
  const reserv = await lasEllerHamta(
    "RES18",
    "analys",
    async () => {
      throw new Error("natverk nere");
    },
    5,
  );
  kontroll(
    "Nätverksreserv: hämtaren kastar + gammal rad finns ⇒ gamla datan serveras, franCache=true",
    reserv.franCache === true && reserv.data === "gammal-reserv",
  );

  let kastat = null;
  try {
    await lasEllerHamta(
      "FINNS18",
      "analys",
      async () => {
        throw new Error("natverk nere (test)");
      },
      5,
    );
  } catch (e) {
    kastat = e;
  }
  kontroll(
    "Ingen rad + hämtaren kastar ⇒ hämtarens fel kastas vidare (samma meddelande)",
    kastat !== null && kastat.message === "natverk nere (test)",
  );

  // ── (19–20) Skrivkedjan: huvud ⇒ reserv ⇒ no-cache (graceful) ──────────────
  tomCachear();
  rmSync(HUVUD, { recursive: true, force: true });
  writeFileSync(HUVUD, "blockerad-fil", "utf8"); // data/cache är nu en FIL ⇒ huvudkatalogen ospännbar
  const reservLagring = await sparaCache("T19", "netnet", { x: 1 });
  const reservLas = await lasCache("T19", "netnet");
  kontroll(
    "Skrivreserv: data/cache blockerad ⇒ sparaCache '/tmp/datacache' + lasCache hittar reservraden",
    reservLagring === "/tmp/datacache" && reservLas !== null && json(reservLas.data) === json({ x: 1 }),
    `lagring=${reservLagring}`,
  );

  process.env.TMPDIR = RESERV_BLOCKAD; // även reservens "datacache" är nu en fil
  const kollaps = await sparaCache("T20", "netnet", { y: 2 });
  const kollapsLas = await lasCache("T20", "netnet");
  kontroll(
    "Totalkollaps: huvud OCH reserv blockerade ⇒ 'no-cache' + lasCache null — graceful, inget kast",
    kollaps === "no-cache" && kollapsLas === null,
    `lagring=${kollaps}`,
  );
  process.env.TMPDIR = RESERV;
  rmSync(HUVUD, { recursive: true, force: true }); // blockerarfilen bort

  // ── (21–23) cacheStatistik: hälsoläget över båda katalogerna ───────────────
  tomCachear();
  const tomStat = await cacheStatistik();
  kontroll(
    "cacheStatistik på tomma kataloger ⇒ { rader: 0, aldst: null, yngst: null, perTyp: {} }",
    tomStat.rader === 0 &&
      tomStat.aldst === null &&
      tomStat.yngst === null &&
      Object.keys(tomStat.perTyp).length === 0,
  );

  saRad(HUVUD, "vagfundament-A.json", { ticker: "A", typ: "vagfundament", data: 1, cachad: 1000, kalla: "cron" });
  saRad(HUVUD, "netnet-B.json", { ticker: "B", typ: "netnet", data: 1, cachad: 2000, kalla: "cron" });
  saRad(HUVUD, "analys-DUP.json", { ticker: "DUP", typ: "analys", data: "huvud", cachad: 5000, kalla: "cron" });
  saRad(HUVUD, "sopor.json", "{inte json");
  saRad(HUVUD, "ogiltig-typ.json", { ticker: "X", typ: "skrap", data: 1, cachad: 3000, kalla: "cron" });
  saRad(HUVUD, "readme.txt", "textfil");
  saRad(RESERV_KAT, "konfluens-C.json", { ticker: "C", typ: "konfluens", data: 1, cachad: 1500, kalla: "cron" });
  saRad(RESERV_KAT, "analys-DUP.json", { ticker: "DUP", typ: "analys", data: "reserv", cachad: 9000, kalla: "cron" });
  const stat = await cacheStatistik();
  const perTypOK =
    Object.keys(stat.perTyp).length === 4 &&
    ["vagfundament", "netnet", "konfluens", "analys"].every((t) => stat.perTyp[t] === 1);
  kontroll(
    "cacheStatistik: 4 giltiga rader, sopor/ogiltig typ/txt hopphas, dubbertrad räknas en gång (huvudet vinner)",
    stat.rader === 4 && stat.aldst === 1000 && stat.yngst === 5000 && perTypOK,
    json({ rader: stat.rader, aldst: stat.aldst, yngst: stat.yngst, perTyp: stat.perTyp }),
  );

  rmSync(HUVUD, { recursive: true, force: true });
  rmSync(RESERV_KAT, { recursive: true, force: true });
  const saknadStat = await cacheStatistik();
  kontroll(
    "cacheStatistik på saknade kataloger ⇒ nulfyllt svar, aldrig kast",
    saknadStat.rader === 0 &&
      saknadStat.aldst === null &&
      saknadStat.yngst === null &&
      Object.keys(saknadStat.perTyp).length === 0,
  );

  sammanstall();
}

main()
  .catch((e) => {
    // Oväntat kast utanför kontrollerna: rapportera det, tvinga avslutskod 1 —
    // men RESULTAT-raden ska alltid vara den sista.
    console.error("[testa-motor-datacache] FEL: " + (e && e.message ? e.message : String(e)));
    sammanstall();
    process.exitCode = 1;
  })
  .finally(() => {
    // Sandlådan rivs alltid — repots data/cache har aldrig berörts.
    try {
      process.chdir(GAMMAL_CWD);
    } catch {
      /* ursprunglig cwd kan ha försvunnit */
    }
    if (GAMMAL_TMPDIR === undefined) delete process.env.TMPDIR;
    else process.env.TMPDIR = GAMMAL_TMPDIR;
    try {
      rmSync(SKRAP, { recursive: true, force: true });
    } catch {
      /* OS-temp städar själv */
    }
  });
