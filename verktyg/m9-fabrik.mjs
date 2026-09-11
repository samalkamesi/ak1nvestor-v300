#!/usr/bin/env node
/**
 * AK1A — m9-FABRIKEN v2 (våg 86, agent V86-M9PREP): innehållsfabrikens
 * ombyggnad till produktionsklar med GRANSKNINGSGRINDEN inbyggd.
 *
 * NY LAG — "SERVERN ÄR DATORN": fabrikens output lever I systemet, inte i
 * filträdet. Våg 66:s pilot (kor-innehallsfabrik.mjs) skrev JSON rakt ner i
 * data/blogg/ och driftsattes aldrig ("mänsklig granskning innan storskalig
 * drift" — MARKNADS-BESLUT). v2 skriver i stället BLOGG-UTKAST-rader till
 * Supabase i EXAKT /api/admin/blogg:s dataform (src/lib/blogg-utkast.ts):
 *   system_events type="blogg_utkast" severity="info" source="blogg"
 *   message="[blogg] <slug> v<version> utkast"
 *   details={slug, titel, ingress, bodyMarkdown, status:"utkast", av,
 *            version, omslagUrl:null}
 * Senaste-vinner per slug gör raden till ett utkast I GRANSKNINGSKÖN som
 * panelen (/api/admin/blogg GET) listar. Maskinen sätter status "utkast" —
 * ALDRIG "granskad", ALDRIG "publicerad" (bokstavligen: skrivfunktionen
 * nekar allt annat; enda insläppet för publicerad är exportvägen efter
 * mänsklig granskning, våg 66-regeln består).
 *
 * Additivt kontraktstillägg (argumentations-stöd, m9 rek 3): details.bär
 * dessutom ett "fabrik"-objekt (version, seed, källor fil+md5, dataurdrag
 * värde+datum, kontrollresultat). Läsaren (tolkaRad) arrow-selectar ENBART
 * kontraktens fält — tillägget är osynligt för panelen men maskinläsbart
 * för gransknings-agenten. Samma underlag redovisas OCKSÅ som ett tydligt
 * "Granskningsunderlag"-avsnitt inuti bodyMarkdown (människan ser det i
 * editorn; avsnittet tas bort av granskaren före export).
 *
 * ── DE SEX EVERGREEN-SERIERNA (våg 66:s design + våg 96 D3) ──────────────────
 *   (a) branschmedianer-akm2        — peer.ts:s median-logik över akm2
 *   (b) forskningslaget-grona-av-100 — statusfördelning + regim (fasta
 *                                      trösklar, lägestexter ordagrant)
 *   (c) vagkartan-traffprocent      — vågvalideringens rullande kvitto
 *   (d) kassaflodesanalys-101       — bolagsuniversets FCF-fält: fcfMarginal,
 *                                      fcfYield + HÄRLEDD konverteringsgrad
 *                                      (fcfMarginal ÷ nettoMarginal — båda
 *                                      mätta fält med omsättning som nämnare);
 *                                      deskriptiva rankningar, ALDRIG råd
 *   (e) utdelningar-101             — utdelningsandel + direktavkastning som
 *                                      BEGREPP; dataurdraget är det som FINNS:
 *                                      FCF-taket (fcfYield) + ärlighetsröstan
 *                                      om att per-bolags utdelningsdata saknas
 *                                      i källorna (aterkop-fält 0/100 mätta)
 *   (f) boerspsykologi-fallstugor   — undervisningscase ur vågvalideringens
 *                                      dömda historik (vagvalidering-SENASTE.
 *                                      json): uträknade binomialexempel på när
 *                                      antaganden faller (n=2-fällan, 0/12-
 *                                      basbygget, osatt döms aldrig). Inga
 *                                      personnamn — datan bär bara tickers.
 *
 * ── DETERMINISM (md5-stabil, dokumenterad seed) ────────────────────────────
 * SEED = md5(md5(korstabell) + md5(vagvalidering) + md5(varumarke) + ":" +
 *         månadsnyckel ur underlagens egna datum)
 * Fabriken bär EN global seed (ovansatta tre filer + månadsnyckel) — oför-
 * ändrad sedan våg 95 så att redan skrivna kö-rader förblir verifierbara.
 * Serierna (d)-(f) läser YTTERLIGARE två läs-only-filer (bolagsunivers.json,
 * vagvalidering-SENASTE.json) som redovisas i varje series EGNA käll-array
 * (fil+md5, ingår i kandidat-md5) och färskhetsvakten — deras md5 bär samma
 * determinismbevis även om de inte ingår i det globala seedet.
 * Samma källfiler ⇒ samma seed ⇒ byte-identiska kandidater (md5 av
 * {slug,titel,ingress,bodyMarkdown,statistik,urdrag,källor} är oflyttnings-
 * stabilt — kandidat-hashen i rapporten ska vara identisk mellan körningar).
 * Datum ur data (skapad/domdatum), ALDRIG klockan; klockan används ENBART
 * till 45-dagars färskhetsvakten (m9 §5). Om underlaget inte rört sig sedan
 * senast PUBLICERADE utgåva (data/blogg/<slug>.json fabrik.statistik) markeras
 * kandidaten OFÖRÄNDRAT och --skriv hoppar den (evergreen-regeln: ingen
 * månadsduplikat i kön).
 *
 * ── GRINDEN (inbyggd, skript-sida) ──────────────────────────────────────────
 * kontrolleraText-spegeln (data/varumarke.json — SAMMA källa som
 * src/lib/varumarke.ts; ts-importen avvisas av node, därför spegel, våg 66)
 * med våg 2 AC2-självtest, körs på titel + ingress + VARJE kroppsrad, plus
 * spegeln av blogg-utkast.ts kontrolleratextRad-strukturen: body ≥ 800
 * tecken, ≥ 2 "## "-rubriker, negerad disclaimer som sista rad. FEL ⇒
 * kandidaten BLOCKERAS och skrivs ALDRIG. Varningar bärs med i kvittot.
 *
 * ── KÖRNING ────────────────────────────────────────────────────────────────
 *   node verktyg/m9-fabrik.mjs               # torr: generera + grind + rapport
 *   node verktyg/m9-fabrik.mjs --skriv       # produktion: ett utkast PER
 *                                             # serie (våg 96: sex stycken),
 *                                             # av="m9-fabriken", till granskningskön
 *   node verktyg/m9-fabrik.mjs --sond        # testomgång: skriver kandidat-
 *                                             # rader med av="Sond-M9-Test",
 *                                             # läser TILLBAKA, TABORTERAR
 *                                             # dem + verifierar 0 kvar
 *   node verktyg/m9-fabrik.mjs --stadja-sond # desperat-rengöring: ta bort ALLA
 *                                             # Sond-M9-Test-rader (felsäker spärr)
 *   node verktyg/m9-fabrik.mjs --skriv --tvinga
 *                                           # BOOTSTRAP-UNDANTAG (våg 95): skriv
 *                                           # utkast ÄVEN för OFÖRÄNDRAT-under-
 *                                           # lag. Evergreen-regeln jämför mot
 *                                           # data/blogg/<slug>.json — men våg
 *                                           # 66:s pilot publicerade september-
 *                                           # utgåvorna RAKT i filträdet utanför
 *                                           # granskningskön, så kön kan aldrig
 *                                           # fyllas första gången utan detta
 *                                           # medvetna override (kundens första
 *                                           # riktiga granskningskö, m9 LED 3).
 * Avslutskod 0 = ok, 1 = blockerad/fel.
 *
 * ENV: process.loadEnvFile('.env') + '.env.local' (värden loggas ALDRIG).
 * Nycklar: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (eller
 * NEXT_PUBLIC_SUPABASE_ANON_KEY). REST-validering som supabase-rest.ts:
 * ENBAST https mot <ref>.supabase.co (fasta https-literaler i koden).
 *
 * Äger: agent V86-M9PREP (serier a-c) / våg 96 agent D3 (serier d-f). Rör
 * ALDRIG src/ eller data/. Läs-only källor: korstabell-grund.json ·
 * vagvalidering-SENASTE.md · varumarke.json · bolagsunivers.json ·
 * vagvalidering-SENASTE.json · data/blogg/<slug>.json (förra utgåvans
 * statistik).
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIL_KORSTABELL = path.join(REPO, "data", "portfolj-system", "korstabell-grund.json");
const FIL_RAPPORT = path.join(REPO, "data", "rapporter", "vagvalidering-SENASTE.md");
const FIL_VARUMARKE = path.join(REPO, "data", "varumarke.json");
const FIL_UNIVERS = path.join(REPO, "data", "portfolj-system", "bolagsunivers.json"); // våg 96 D3: serierna (d)+(e)
const FIL_VAGJSON = path.join(REPO, "data", "rapporter", "vagvalidering-SENASTE.json"); // våg 96 D3: serien (f)
const BLOGG_KAT = path.join(REPO, "data", "blogg");

const ARG_SKRIV = process.argv.includes("--skriv");
const ARG_SOND = process.argv.includes("--sond");
const ARG_STADJA = process.argv.includes("--stadja-sond");
const ARG_TVINGA = process.argv.includes("--tvinga"); // våg 95: bootstrap-override av evergreen-skip (endast --skriv)
const ARG_VISA = process.argv.includes("--visa"); // --visa [slug] — skriv ut hela bodyn/erna
const ARG_VISA_IX = process.argv.indexOf("--visa");
const ARG_VISA_SLUG = ARG_VISA_IX >= 0 && process.argv[ARG_VISA_IX + 1]?.match(/^[a-z0-9-]+$/) ? process.argv[ARG_VISA_IX + 1] : null;
if ([ARG_SKRIV, ARG_SOND, ARG_STADJA, ARG_VISA].filter(Boolean).length > 1) {
  console.error("[FEL] --skriv, --sond, --stadja-sond och --visa är ömsesidigt uteslutande.");
  process.exit(1);
}

const FABRIK_VERSION = "m9-fabrik-v2";
const AV_PRODUKTION = "m9-fabriken";
const AV_SOND = "Sond-M9-Test";
const EVENT_TYP = "blogg_utkast";
const KALLA = "blogg";
const MAX_ALDER_DAGAR = 45; // m9 §5
const BODY_MIN_TECKEN = 800; // blogg-utkast.ts spegel
const BODY_MIN_RUBRIKER = 2;
const SLUG_RE = /^[a-z0-9-]+$/;

// ── Generiska hjälpare (mönstret kor-innehallsfabrik.mjs) ────────────────────

function lasJson(fil) {
  return JSON.parse(readFileSync(fil, "utf8"));
}
function md5(data) {
  return createHash("md5").update(data).digest("hex");
}
function md5Fil(fil) {
  return md5(readFileSync(fil));
}
/** "56.5" → "56,5"; heltal utan decimaler. */
function tal(x, decimaler = 1) {
  const t = Number(x).toFixed(decimaler).replace(/\.?0+$/, "");
  return t.replace(".", ",");
}
/** Svensk procent: 0.07 → "7 %". */
function pct(x, decimaler = 1) {
  return tal(x * 100, decimaler) + " %";
}
const MANADER = [
  "januari", "februari", "mars", "april", "maj", "juni",
  "juli", "augusti", "september", "oktober", "november", "december",
];
function manadArsNamn(datum) {
  const m = Number(datum.slice(5, 7));
  return `${MANADER[m - 1]} ${datum.slice(0, 4)}`;
}
function kortNamn(namn) {
  let n = String(namn)
    .replace(/\s*\(publ\)\s*$/i, "")
    .replace(/^\s*AB\s+/i, "")
    .replace(/\s+AB$/i, "")
    .trim();
  // Våg 95 buggfix (dokumenterad): "Warner Bros. Discovery, Inc." lämnade ett
  // ensamt kvarvarande komma när suffixet ströks ("Discovery,,") — polsk-commit
  // b375518 fixade samma sak i de publicerade filerna; här fixas mallen. ,? äter
  // kommat framför suffixet.
  const suffix = /\s*,?\s+(Inc\.|Corporation|A\/S|Abp|Oyj|ASA|NV|S\.A\.|PLC|LLC|Aktiengesellschaft|SE & Co\. KGaA)$/i;
  while (suffix.test(n)) n = n.replace(suffix, "").trim();
  return n;
}
function branschNamn(bransch) {
  return { halso: "hälsa", tillvaxt: "tillväxt" }[bransch] ?? bransch;
}
/** Median enligt peer.ts:s kontrakt: jämnt n ⇒ medel av de två mittersta. */
function median(varde) {
  const talen = varde.filter((x) => typeof x === "number" && Number.isFinite(x)).sort((a, b) => a - b);
  if (talen.length === 0) return null;
  const mitt = Math.floor(talen.length / 2);
  return talen.length % 2 === 1 ? talen[mitt] : (talen[mitt - 1] + talen[mitt]) / 2;
}
function alderDagar(datum) {
  return Math.floor((Date.now() - Date.parse(datum + "T00:00:00Z")) / 86400000);
}
/** Signerad skillnad "61 → 63 (+2,0)". */
function deltaText(forr, nu, decimaler = 1) {
  const d = nu - forr;
  const tecken = d > 0 ? `(+${tal(d, decimaler)})` : d < 0 ? `(${tal(d, decimaler)})` : "(±0)";
  return `${tal(forr, decimaler)} → ${tal(nu, decimaler)} ${tecken}`;
}
function forstaMening(body) {
  const stycke = body.split("\n\n").find((s) => s.trim().length > 0) ?? "";
  const m = stycke.match(/^[^.!?]*[.!?]/);
  return (m ? m[0] : stycke.slice(0, 120)).replace(/\s+/g, " ").trim();
}

// ── kontrolleraText-spegeln (data/varumarke.json — single source, våg 66) ───

const varumarke = lasJson(FIL_VARUMARKE);
const FORBJUDNA = varumarke.forbjudnaFraser.map((f) => ({
  fran: new RegExp(f.fran, "giu"),
  istallet: f.istallet,
  allvar: f.allvar === "FEL" ? "FEL" : "VARNING",
}));

function kontrolleraText(text) {
  const fel = [];
  const varningar = [];
  if (typeof text !== "string" || text.length === 0) return { fel, varningar };
  for (const { fran, istallet, allvar } of FORBJUDNA) {
    fran.lastIndex = 0;
    let m;
    while ((m = fran.exec(text)) !== null) {
      const traff = { fras: m[0], index: m.index, allvar, ersattning: istallet };
      if (allvar === "FEL") fel.push(traff);
      else varningar.push(traff);
    }
  }
  return { fel, varningar };
}

// Våg 2 AC2-självtest — spegeln måste vara vaken innan något genereras.
(function sjalvtest() {
  const felTest = kontrolleraText("garanterad avkastning").fel.length >= 1;
  const varnTest = kontrolleraText("SISTA CHANSEN att gå med gratis!").varningar.length >= 1;
  const negTest = kontrolleraText("Pedagogisk analys — aldrig investeringsrådgivning").fel.length === 0;
  if (!(felTest && varnTest && negTest)) {
    console.error("KONTROLLERATEXT-SPEGELN FELKONFIGURERAD — fabriken skriver inget. Avbryter.");
    process.exit(1);
  }
})();

// ── GRINDEN: kontrolleraText per rad + struktur (kontrolleratextRad-spegel) ──

function grind({ titel, ingress, body }) {
  const rader = [titel, ingress, ...body.split("\n").filter((l) => l.trim() !== "")];
  const fel = [];
  const varningar = [];
  for (const rad of rader) {
    const r = kontrolleraText(rad);
    for (const f of r.fel) fel.push({ rad, ...f });
    for (const v of r.varningar) varningar.push({ rad, ...v });
  }
  // Struktur — spegel av blogg-utkast.ts kontrolleratextRad (gransknings-
  // grunden: ett maskinutkast ska vara omedelbart upphöjbart av människan).
  const strukturFel = [];
  const strukturVarningar = [];
  const tecken = body.trim().length;
  if (tecken < BODY_MIN_TECKEN) {
    strukturFel.push(`body ${tecken} tecken < ${BODY_MIN_TECKEN}`);
  }
  const rubriker = (body.match(/^## /gm) ?? []).length;
  if (rubriker < BODY_MIN_RUBRIKER) {
    strukturFel.push(`${rubriker} "## "-rubriker < ${BODY_MIN_RUBRIKER}`);
  }
  const sistaRad = body.trimEnd().split("\n").pop()?.trim() ?? "";
  const disclaimerSist = /investeringsråd/i.test(sistaRad);
  if (!disclaimerSist) {
    strukturVarningar.push("sista raden är inte en negerad disclaimer (exportvägen lägger till — men fabrikens mall bär den)");
  }
  return {
    rader: rader.length,
    fel,
    varningar,
    strukturFel,
    strukturVarningar,
    rubriker,
    disclaimerSist,
    godkand: fel.length === 0 && strukturFel.length === 0,
  };
}

// ── Supabase (supabase-rest.ts-mönstret: https *.supabase.co, env aldrig loggad)

function laddaEnv() {
  try {
    process.loadEnvFile(path.join(REPO, ".env"));
  } catch {
    /* saknas .env → fortsätt med processenv/.env.local */
  }
  try {
    process.loadEnvFile(path.join(REPO, ".env.local"));
  } catch {
    /* saknas .env.local → endast .env/processenv gäller */
  }
  return {
    urlSatt: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    serviceSatt: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    anonSatt: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };
}

function supabaseRest() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!raw || !key) return null;
  let u;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null; // fasta https-literalen — inget http-insläpp
  const host = u.hostname.toLowerCase();
  if (
    host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") ||
    host.endsWith(".internal") || host === "0.0.0.0" || host === "::1" || host === "[::1]" ||
    /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  ) {
    return null;
  }
  if (!/^([a-z0-9-]+)\.supabase\.co$/i.test(host)) return null;
  return { origin: u.origin, headers: { apikey: key, Authorization: "Bearer " + key } };
}

function fv(v) {
  return encodeURIComponent(v);
}
const SENASTE = "order=created_at.desc,id.desc";

/** Senaste-vinner-versioner per slug (sparaUtkast:s versionsräkning). */
async function lasVersioner(rest) {
  const karta = new Map();
  for (let sida = 0; sida < 10; sida++) {
    const fran = sida * 1000;
    const res = await fetch(
      `${rest.origin}/rest/v1/system_events?type=eq.${fv(EVENT_TYP)}` +
        `&select=created_at,details->>slug,details->>version&${SENASTE}`,
      {
        headers: { ...rest.headers, Range: `${fran}-${String(fran + 999)}` },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!res.ok) throw new Error("Supabase svarade HTTP " + String(res.status) + " vid versionsläsning");
    const batch = await res.json();
    if (!Array.isArray(batch)) break;
    for (const r of batch) {
      const slug = r?.slug;
      if (typeof slug !== "string" || !SLUG_RE.test(slug) || karta.has(slug)) continue;
      const n = typeof r.version === "number" ? r.version : Number(r.version);
      karta.set(slug, Number.isInteger(n) && n >= 1 ? n : 1);
    }
    if (batch.length < 1000) break;
  }
  return karta;
}

/**
 * skrivUtkastRad — EXAKT sparaUtkast:s radform + det additiva fabrik-kvittot.
 * GRUNDLAG: status är härdenkodad "utkast" — funktionen KAN inte skriva något
 * annat (maskinen når aldrig "granskad"/"publicerad"; det är grindens poäng).
 */
async function skrivUtkastRad(rest, k) {
  const status = "utkast"; // härdenkodad — ALDRIG "granskad", ALDRIG "publicerad"
  const res = await fetch(`${rest.origin}/rest/v1/system_events`, {
    method: "POST",
    headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({
      type: EVENT_TYP,
      severity: "info",
      message: `[blogg] ${k.slug} v${String(k.version)} ${status}`,
      details: {
        slug: k.slug,
        titel: k.titel,
        ingress: k.ingress,
        bodyMarkdown: k.bodyMarkdown,
        status,
        av: k.av,
        version: k.version,
        omslagUrl: null,
        fabrik: k.fabrik, // additivt: granskningsunderlaget (läsaren ignorerar)
      },
      source: KALLA,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`Supabase svarade HTTP ${String(res.status)} vid skrivning av ${k.slug}`);
  }
}

/** Totala antalet blogg_utkast-rader (Content-Range + Prefer: count=exact). */
async function raknaRader(rest) {
  const res = await fetch(
    `${rest.origin}/rest/v1/system_events?type=eq.${fv(EVENT_TYP)}&select=id`,
    {
      headers: { ...rest.headers, Range: "0-0", Prefer: "count=exact" },
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!res.ok) throw new Error("Supabase svarade HTTP " + String(res.status) + " vid radräkning");
  const cr = res.headers.get("content-range") ?? ""; // "0-0/57" eller "*/0"
  const totalt = Number(cr.split("/")[1] ?? "");
  return Number.isFinite(totalt) ? totalt : null;
}

/** Läs tillbaka sondens rader (bevis på att de legat i granskningskön). */
async function lasSondRader(rest) {
  const res = await fetch(
    `${rest.origin}/rest/v1/system_events?type=eq.${fv(EVENT_TYP)}&details->>av=eq.${fv(AV_SOND)}` +
      `&select=id,created_at,details->>slug,details->>version,details->>status,details->>titel&${SENASTE}`,
    { headers: { ...rest.headers }, signal: AbortSignal.timeout(10_000) },
  );
  if (!res.ok) throw new Error("Supabase svarade HTTP " + String(res.status) + " vid sond-återläsning");
  const batch = await res.json();
  return Array.isArray(batch) ? batch : [];
}

/** Städa: ta bort ALLA sondrader (ENBART av=Sond-M9-Test — inget annat rörs). */
async function tabortSondRader(rest) {
  const res = await fetch(
    `${rest.origin}/rest/v1/system_events?type=eq.${fv(EVENT_TYP)}&details->>av=eq.${fv(AV_SOND)}`,
    {
      method: "DELETE",
      headers: { ...rest.headers, Prefer: "return=representation" },
      signal: AbortSignal.timeout(15_000),
    },
  );
  if (!res.ok) throw new Error("Supabase svarade HTTP " + String(res.status) + " vid sond-städning");
  const bort = await res.json();
  return Array.isArray(bort) ? bort.length : 0;
}

// ── Källor: läs + parsa (allt läs-only, deterministiskt) ────────────────────

function lasVagvalidering() {
  const text = readFileSync(FIL_RAPPORT, "utf8");
  const genererad = text.match(/\*\*Genererad:\*\* ([^·]+)·/)?.[1]?.trim() ?? null;
  const protokoll = text.match(/\*\*Protokoll:\*\* ([^·]+)·/)?.[1]?.trim() ?? null;
  const domdatum = text.match(/\*\*Domdatum:\*\* (\d{4}-\d{2}-\d{2})/)?.[1] ?? null;
  const universum = Number(text.match(/\*\*Universum:\*\* (\d+) tickers/)?.[1] ?? 0);
  const sedan = text.match(/\*\*Rullande räknare sedan:\*\* (\d{4}-\d{2}-\d{2})/)?.[1] ?? null;
  const protokollRad = text.match(/^> \*\*Dom-protokoll[^*]+:\*\*.+$/m)?.[0] ?? null;
  const protokollText = protokollRad !== null ? protokollRad.replace(/^>\s*/, "").trim() : null;
  const totalMatch = text.match(
    /\*\*Totalt:\*\* (?:(\d+) % träff|—) \(n=(\d+) dömda(?:, osatta (\d+) % av alla mätningar)?\)/,
  );
  const totalt =
    totalMatch !== null
      ? {
          traffProcent: totalMatch[1] !== undefined ? Number(totalMatch[1]) : null,
          domda: Number(totalMatch[2]),
          osattaAndel: totalMatch[3] !== undefined ? Number(totalMatch[3]) : null,
        }
      : null;
  const perHorisont = {};
  for (const m of text.matchAll(/^\| (mikro|kort|medellång|lång|mega) \| ([^|]+)\| ([^|]+)\| ([^|]+)\| ([^|]+)\|/gm)) {
    const cell = (raw) => raw.trim();
    perHorisont[m[1]] = {
      impulsvag: cell(m[2]),
      korrigering: cell(m[3]),
      basbygge: cell(m[4]),
      osattKlass: cell(m[5]),
    };
  }
  return { text, genererad, protokoll, domdatum, universum, sedan, protokollText, totalt, perHorisont };
}

/** Förra PUBLICERADE utgåvans statistik (data/blogg/<slug>.json fabrik.statistik). */
function publiceradStatistik(slug) {
  const fil = path.join(BLOGG_KAT, `${slug}.json`);
  if (!existsSync(fil)) return null;
  try {
    return lasJson(fil)?.fabrik?.statistik ?? null;
  } catch {
    return null;
  }
}

/**
 * våg 96 D3 — de två nya läskällorna (läs-only, deterministiska):
 * bolagsunivers.json = kartlagd array (100 rader) med nyckeltalsblocken
 * lonsamhet (fcfMarginal, nettoMarginal), vardering (fcfYield), aterkop;
 * vagvalidering-SENASTE.json = spegeln av md-rapporten med STRUKTURERADE
 * dömda celler per (horisont, klass) — fallstuge-seriens historik.
 * Datum ur data (aldrig klockan): filens egna hämtnings-/domdatum.
 */
function lasUnivers() {
  const rader = Object.values(lasJson(FIL_UNIVERS));
  if (rader.length === 0) throw new Error("bolagsunivers.json innehöll inga rader — fabriken hittar aldrig på tal");
  const datum = rader.reduce(
    (senast, r) => (typeof r.hamtat === "string" && r.hamtat > (senast ?? "") ? r.hamtat : senast),
    null,
  );
  return { rader, datum };
}

function lasVagJson() {
  const j = lasJson(FIL_VAGJSON);
  return {
    domdatum: typeof j.domdatum === "string" ? j.domdatum : null,
    totalt: j.totalt ?? null,
    perHorisontKlass: Array.isArray(j.perHorisontKlass) ? j.perHorisontKlass : [],
    protokollText: typeof j.domProtokollText === "string" ? j.domProtokollText : null,
    universum: j.universumAntal ?? null,
    sedan: j.rullandeSedan ?? null,
  };
}

// ── Mall-pjäser ──────────────────────────────────────────────────────────────

const DISCLAIMER_RAD =
  "_Automatiskt utkast ur m9-fabrikens evergreen-serier; den fullständiga AK1A-analysen tillverkas manuellt. Pedagogisk forskning — aldrig investeringsrådgivning (lagen 2007:528)._";

function granskningsunderlagAvsnitt(k, grunden) {
  const rader = [];
  rader.push(`## Granskningsunderlag — maskinens kvitto`);
  rader.push(
    `_Verifiera talen mot källorna nedan och ta sedan BORT detta avsnitt före export — granskaren äger publiceringen, maskinen levererar bara kvittot._`,
  );
  rader.push(
    `- **Determinism:** fabrik ${FABRIK_VERSION} · seed \`${k.seed}\` (md5 av källfilernas md5 + månadsnyckel) · mall-md5 \`${k.mallMd5}\` (md5 av titel+ingress+mall-body — samma underlag ger byte-identiskt utkast).`,
  );  rader.push(`- **Källor (läs-only):** ${k.kallor.map((kall) => `${kall.fil} (md5 ${kall.md5}${kall.datum ? `, daterad ${kall.datum}` : ""})`).join(" · ")}.`);
  rader.push(`- **Dataurdrag (värde · datum · notering):**`);
  for (const u of k.urdrag) {
    rader.push(`  - ${u.varde} · ${u.datum} · ${u.notering}`);
  }
  rader.push(
    `- **kontrolleraText-förkontroll (skript-sida, spegel av varumarke.ts, körd på mall-bodyn — det som blir kvar när kvittot tas bort):** FEL 0 · VARNINGAR ${String(grunden.varningar.length)} · struktur: ${String(grunden.rubriker)} "##"-rubriker (krav ≥ ${String(BODY_MIN_RUBRIKER)}), body ≥ ${String(BODY_MIN_TECKEN)} tecken uppfyllt, disclaimer sista rad ${grunden.disclaimerSist ? "ja" : "NEJ"}.`,
  );
  rader.push(
    `- **Status:** utkast i granskningskön — maskinen kan inte sätta "granskad" eller "publicerad" (statusbyte kräver människan via panelen; publicering endast via exportvägen).`,
  );
  return rader[0] + "\n\n" + rader.slice(1).join("\n"); // tom rad efter rubriken — korrekt markdown
}

// ════════════════════════════════════════════════════════════════════════════
// (a) Branschmedianer — peer.ts:s medianer över korstabellens akm2
// ════════════════════════════════════════════════════════════════════════════

function raknaBranschstatistik(rader) {
  const grupper = new Map();
  for (const rad of rader) {
    const lista = grupper.get(rad.bransch) ?? [];
    lista.push(rad);
    grupper.set(rad.bransch, lista);
  }
  const perBransch = {};
  for (const [bransch, grupp] of grupper) {
    const medAkm2 = grupp
      .filter((r) => typeof r.akm2 === "number")
      .sort((a, b) => b.akm2 - a.akm2 || (a.ticker < b.ticker ? -1 : 1));
    perBransch[bransch] = {
      median: median(medAkm2.map((r) => r.akm2)),
      matta: medAkm2.length,
      iGruppen: grupp.length,
      min: medAkm2.length > 0 ? medAkm2[medAkm2.length - 1].akm2 : null,
      max: medAkm2.length > 0 ? medAkm2[0].akm2 : null,
      minBolag: medAkm2.length > 0 ? kortNamn(medAkm2[medAkm2.length - 1].namn) : null,
      maxBolag: medAkm2.length > 0 ? kortNamn(medAkm2[0].namn) : null,
    };
  }
  return perBransch;
}

function byggBranschmedianer(korstabell, seed, kallor) {
  const rader = korstabell.rader;
  const datum = korstabell.skapad;
  const manad = manadArsNamn(datum);
  const referens = `${datum} · ${rader.length}-bolagsuniversum`;
  const perBransch = raknaBranschstatistik(rader);
  const sorterade = Object.entries(perBransch).sort(
    (a, b) => (b[1].median ?? -Infinity) - (a[1].median ?? -Infinity) || a[0].localeCompare(b[0]),
  );
  const rapporterade = sorterade.filter(([, s]) => s.matta >= 5); // PEER_MIN_GRUPP
  if (rapporterade.length === 0) {
    throw new Error("ingen branschgrupp nådde PEER_MIN_GRUPP=5 — fabriken gissar aldrig");
  }
  const statistik = {
    universum: rader.length,
    referens,
    perBransch,
    rapporteradeGrupper: rapporterade.length,
    gransGrupp: 5,
  };
  const forra = publiceradStatistik("branschmedianer-akm2");

  const rad = [];
  rad.push(
    `Medianen per bransch i korstabellens ${rader.length}-bolagsuniversum, underlag skapat ${datum}: ${rapporterade
      .map(([b, s]) => `**${branschNamn(b)} ${tal(s.median)}**`)
      .join(" · ")} (AKM2-poäng, median över gruppens mätta bolag). Högst median: ${branschNamn(rapporterade[0][0])} ${tal(rapporterade[0][1].median)}. Lägst: ${branschNamn(rapporterade[rapporterade.length - 1][0])} ${tal(rapporterade[rapporterade.length - 1][1].median)}.`,
  );
  rad.push(`## Så räknas medianen`);
  rad.push(
    `AKM2 är AKM1:s 20 variabler omviktade enligt viktprofilen akm2-2026 — samma komposit som korstabellens rader bär. Medianen följer peer-motorns kontrakt: gruppen är korstabellens kanoniska branscher (10 bolag var), medianen räknas över gruppens mätta bolag, jämnt antal ger medelvärdet av de två mittersta, och en grupp under 5 mätta bolag redovisas aldrig. Urvalsberoendet syns i referensen: ${referens}.`,
  );
  rad.push(`## Varje bransch — median, spridning och ytterligheter`);
  rad.push(
    rapporterade
      .map(
        ([bransch, s]) =>
          `- **${branschNamn(bransch)}** — median **${tal(s.median)}** · ${s.matta} mätta av ${s.iGruppen} · spridning ${tal(s.min)}–${tal(s.max)} (lägst ${s.minBolag}, högst ${s.maxBolag})`,
      )
      .join("\n"),
  );
  const investmentbolag = rader.filter((r) => /industrivärden|investor ab/i.test(r.namn || ""));
  if (investmentbolag.length > 0) {
    rad.push(
      `En jämförbarhetsnot: ${investmentbolag.map((r) => `${kortNamn(r.namn)} (${branschNamn(r.bransch)})`).join(" och ")} är investmentbolag — deras nyckeltal speglar innehavens marknadsvärden, inte en driftsrörelse, så finansgruppens median blandar två bolagsformer. Det är information, inte fel.`,
    );
  }
  rad.push(`## Ändringen sedan senaste publicerade utgåvan`);
  if (!forra) {
    rad.push(`Seriens första maskinutkast i utkastsystemet — ingen tidigare publicerad statistik att jämföra med i data/blogg/.`);
  } else {
    const flyttade = Object.keys(perBransch)
      .filter((b) => forra?.perBransch?.[b] && forra.perBransch[b].median !== null && perBransch[b].median !== forra.perBransch[b].median)
      .sort();
    rad.push(
      flyttade.length === 0
        ? `Ingen branschmedian rörde sig sedan den publicerade utgåvan — oförändrat (att inget rörde sig är också ett utfall).`
        : flyttade.map((b) => `- **${branschNamn(b)}**: ${deltaText(forra.perBransch[b].median, perBransch[b].median)}`).join("\n"),
    );
  }
  rad.push(`## Fördjupa dig`);
  rad.push(
    `- [Forskningsbiblioteket](/forskningsbiblioteket) — varje kandidatbolags AKM2-profil och urvalsregel\n- [Kursen V07 bruttomarginal](/kurser/v07-bruttomarginal) — lönsamhetsvariabeln bakom kompositen\n- [Kursen V09 ROE](/kurser/v09-roe) — avkastning på eget kapital`,
  );

  const urdrag = [
    { varde: `${rader.length} bolag`, datum, notering: "korstabellens universum (10 branscher × 10)" },
    ...rapporterade.map(([b, s]) => ({ varde: `${branschNamn(b)} median ${tal(s.median)}`, datum, notering: `n=${s.matta} mätta; spridning ${tal(s.min)}–${tal(s.max)}` })),
  ];

  const k = {
    slug: "branschmedianer-akm2",
    serie: "branschmedianer",
    titel: `Branschmedianer ${manad} — varje branschs AKM2-profil (utkast)`,
    ingress: `AKM2-medianen per bransch i ${rader.length}-bolagsuniversum, underlag ${datum}: ${rapporterade
      .slice(0, 4)
      .map(([b, s]) => `${branschNamn(b)} ${tal(s.median)}`)
      .join(", ")} med flera — antal mätta, spridning och gränsregeln redovisas öppet.`,
    statistik,
    urdrag,
    kallor,
    seed,
    manad: datum.slice(0, 7),
  };
  k.bodyForGrind = rad; // mallen före granskningsunderlag (kvittot fogas sist)
  return k;
}

// ════════════════════════════════════════════════════════════════════════════
// (b) Forskningsläget — statusfördelning + regim (fasta trösklar, ordagrant)
// ════════════════════════════════════════════════════════════════════════════

const TROSKEL_RIKT_ANDEL_GRONA = 0.1;
const TROSKEL_RIKT_ANDEL_RODA = 0.3;
const TROSKEL_MAGERT_ANDEL_GRONA = 0.08;
const TROSKEL_MAGERT_ANDEL_RODA = 0.35;

function raknaForskningslage(rader) {
  const antal = rader.length;
  const grona = rader.filter((r) => r.status === "gron").length;
  const gula = rader.filter((r) => r.status === "gul").length;
  const roda = rader.filter((r) => r.status === "rod").length;
  const osatta = rader.filter((r) => r.status === "osatt").length;
  const andelGrona = antal > 0 ? Math.round((grona / antal) * 10000) / 10000 : 0;
  const andelRoda = antal > 0 ? Math.round((roda / antal) * 10000) / 10000 : 0;

  let typ;
  let marknadslage;
  if (antal === 0) {
    typ = "osatt";
    marknadslage = "Forskningsunderlaget är ännu inte levererat — läget redovisas när korstabellens mätningar finns (motorn gissar aldrig).";
  } else if (andelGrona >= TROSKEL_RIKT_ANDEL_GRONA && andelRoda <= TROSKEL_RIKT_ANDEL_RODA) {
    typ = "rikt";
    marknadslage = `Forskningsläget är rikt — ${grona} av ${antal} bolag klarar de strikta kraven.`;
  } else if (andelGrona < TROSKEL_MAGERT_ANDEL_GRONA || andelRoda > TROSKEL_MAGERT_ANDEL_RODA) {
    typ = "magert";
    marknadslage = `Forskningsläget är magert — ${grona} av ${antal} bolag klarar de strikta kraven, selektion avgör.`;
  } else {
    typ = "balanserat";
    marknadslage = `Forskningsläget är i rörelse — ${grona} av ${antal} bolag klarar de strikta kraven och ${gula} rör sig i mellanskiktet.`;
  }

  const topp = rader
    .filter((r) => r.status === "gron")
    .sort((a, b) => b.akm1Totalt - a.akm1Totalt || (a.ticker < b.ticker ? -1 : 1))
    .slice(0, 3)
    .map((r) => ({
      ticker: r.ticker,
      namn: kortNamn(r.namn),
      bransch: branschNamn(r.bransch),
      akm1Totalt: r.akm1Totalt,
      akm1MaxMojligt: typeof r.akm1MaxMojligt === "number" ? r.akm1MaxMojligt : null,
      andelAvMax:
        typeof r.akm1MaxMojligt === "number" && r.akm1MaxMojligt > 0
          ? Math.round((r.akm1Totalt / r.akm1MaxMojligt) * 1000) / 1000
          : null,
    }));

  return { antal, grona, gula, roda, osatta, andelGrona, andelRoda, typ, marknadslage, topp };
}

function byggForskningslaget(korstabell, seed, kallor) {
  const rader = korstabell.rader;
  const datum = korstabell.skapad;
  const manad = manadArsNamn(datum);
  const lage = raknaForskningslage(rader);
  const regler = korstabell.statusRegler || {};
  const statistik = {
    universum: lage.antal,
    grona: lage.grona,
    gula: lage.gula,
    roda: lage.roda,
    osatta: lage.osatta,
    andelGrona: lage.andelGrona,
    andelRoda: lage.andelRoda,
    typ: lage.typ,
    marknadslage: lage.marknadslage,
    datum,
  };
  const forra = publiceradStatistik("forskningslaget-grona-av-100");

  const rad = [];
  rad.push(
    `${lage.grona} av ${lage.antal} bolag i korstabellens universum är gröna just nu. Regimen är **${lage.typ}**: "${lage.marknadslage}" — lägestexten ordagrant ur forskningsläges-motorn, som räknar ur fasta trösklar, inte tycke. Fördelningen: ${lage.grona} gröna · ${lage.gula} gula · ${lage.roda} röda · ${lage.osatta} osatta. Underlag daterat ${datum}.`,
  );
  rad.push(`## Vad färgerna betyder`);
  rad.push(`Statusklassningen är korstabellens egen regelverk, citerat ordagrant ur underlaget (${datum}):`);
  const reglerRader = [];
  if (regler.gron) reglerRader.push(`- **grön:** ${regler.gron}`);
  if (regler.gul) reglerRader.push(`- **gul:** ${regler.gul}`);
  if (regler.rod) reglerRader.push(`- **röd:** ${regler.rod}`);
  if (reglerRader.length > 0) rad.push(reglerRader.join("\n"));
  rad.push(`## Regimen och dess trösklar`);
  rad.push(
    `Regimen räknas ur fasta trösklar: rikt kräver andel gröna ≥ 10 % OCH andel röda ≤ 30 %; magert inträffar när andel gröna < 8 % ELLER andel röda > 35 %; däremellan är läget balanserat. I detta underlag: andel gröna ${pct(lage.andelGrona, 0)} och andel röda ${pct(lage.andelRoda, 0)} — utfallet blir ${lage.typ}. Samma underlag ger alltid samma text; trösklarna är skrivna före datan.`,
  );
  rad.push(`## De tre högt rankade gröna bolagen`);
  rad.push(
    `Bland de gröna bolagen har dessa tre högst AKM1-poäng i underlaget (daterat ${datum}) — en deskriptiv rankning ur data, inte en värdering:`,
  );
  rad.push(
    lage.topp
      .map(
        (t) =>
          `- **${t.namn}** (${t.ticker}, ${t.bransch}) — AKM1 ${tal(t.akm1Totalt)} av ${t.akm1MaxMojligt !== null ? tal(t.akm1MaxMojligt) : "?"} möjliga poäng${t.andelAvMax !== null ? ` (${pct(t.andelAvMax)})` : ""}`,
      )
      .join("\n"),
  );
  rad.push(
    `Urvalet är korstabellens ${lage.antal}-bolagsuniversum (10 branscher × 10 bolag) — talen är urvalsberoende och säger inget om bolag utanför universum. Dateringen kommer ur underlaget själv (skapad ${datum}), aldrig ur klockan.`,
  );
  rad.push(`## Ändringen sedan senaste publicerade utgåvan`);
  if (!forra) {
    rad.push(`Seriens första maskinutkast i utkastsystemet — ingen tidigare publicerad statistik att jämföra med i data/blogg/.`);
  } else {
    const delar = [];
    if (forra.grona !== lage.grona) delar.push(`gröna ${deltaText(forra.grona, lage.grona, 0)}`);
    if (forra.gula !== lage.gula) delar.push(`gula ${deltaText(forra.gula, lage.gula, 0)}`);
    if (forra.roda !== lage.roda) delar.push(`röda ${deltaText(forra.roda, lage.roda, 0)}`);
    if (forra.typ !== lage.typ) delar.push(`regimen ${forra.typ} → ${lage.typ}`);
    rad.push(
      delar.length > 0
        ? delar.join(" · ") + "."
        : `Fördelningen oförändrad sedan den publicerade utgåvan: ${lage.grona} gröna, ${lage.gula} gula, ${lage.roda} röda.`,
    );
  }
  rad.push(`## Fördjupa dig`);
  rad.push(
    `- [Forskningsbiblioteket](/forskningsbiblioteket) — bolagen som klarade kandidatregeln, med urvalsregel och utfall\n- [Kursen V09 ROE](/kurser/v09-roe) — variabeln bakom lönsamhetspoängen\n- [Komplett guide till svensk aktieanalys](/blogg/komplett-guide-svensk-aktieanalys-2026) — metodiken från grunden`,
  );

  const urdrag = [
    { varde: `${lage.grona} gröna · ${lage.gula} gula · ${lage.roda} röda · ${lage.osatta} osatta`, datum, notering: "statusfördelning, korstabellens rader" },
    { varde: `andel gröna ${pct(lage.andelGrona, 0)}, andel röda ${pct(lage.andelRoda, 0)}`, datum, notering: `regim ${lage.typ} (trösklar: rikt ≥10 % och ≤30 %; magert <8 % eller >35 %)` },
    ...lage.topp.map((t) => ({ varde: `${t.ticker} AKM1 ${tal(t.akm1Totalt)}/${t.akm1MaxMojligt !== null ? tal(t.akm1MaxMojligt) : "?"}`, datum, notering: `grönt toppbolag (${t.bransch})` })),
  ];

  const k = {
    slug: "forskningslaget-grona-av-100",
    serie: "forskningslaget",
    titel: `Forskningsläget ${manad} — ${lage.grona} gröna av ${lage.antal} (utkast)`,
    ingress: `Forskningsläget i korstabellens ${lage.antal}-bolagsuniversum: ${lage.grona} gröna, ${lage.gula} gula, ${lage.roda} röda — regimen är ${lage.typ} enligt fasta trösklar. Underlag daterat ${datum}.`,
    statistik,
    urdrag,
    kallor,
    seed,
    manad: datum.slice(0, 7),
  };
  k.bodyForGrind = rad;
  return k;
}

// ════════════════════════════════════════════════════════════════════════════
// (c) Vågkartan — vågvalideringens rullande träffprocent
// ════════════════════════════════════════════════════════════════════════════

function byggVagkartan(rapport, seed, kallor) {
  if (!rapport.domdatum || !rapport.totalt || rapport.totalt.traffProcent === null) {
    throw new Error("vagvalidering-rapporten saknar domdatum/träff-% — fabriken hittar aldrig på tal");
  }
  const datum = rapport.domdatum;
  const manad = manadArsNamn(datum);
  const t = rapport.totalt;
  const KLASS_NAMN = { impulsvag: "impulsvåg", korrigering: "korrigering", basbygge: "basbygge", osattKlass: "osatt klass" };
  const statistik = {
    traffProcent: t.traffProcent,
    domda: t.domda,
    osattaAndel: t.osattaAndel,
    universum: rapport.universum,
    protokoll: rapport.protokoll,
    sedan: rapport.sedan,
    domdatum: datum,
    perHorisont: rapport.perHorisont,
  };
  const forra = publiceradStatistik("vagkartan-traffprocent");

  const rad = [];
  rad.push(
    `Vågmotorns rullande träffprocent är **${t.traffProcent} %** — ${t.domda} dömda mätningar${rapport.sedan ? ` sedan ${rapport.sedan}` : ""}${t.osattaAndel !== null ? `, ${t.osattaAndel} % av mätningarna är osatta och räknas aldrig som fel` : ""}. Universum: ${rapport.universum} tickers, fem horisonter. Domdatum ${datum}${rapport.protokoll ? `, protokoll ${rapport.protokoll}` : ""}.`,
  );
  if (rapport.protokollText) {
    rad.push(`## Så dömer protokollet`);
    rad.push(rapport.protokollText);
  }
  const horisonter = Object.keys(rapport.perHorisont);
  if (horisonter.length > 0) {
    rad.push(`## Träffprocenten per horisont och vågklass`);
    rad.push(`n = antal dömda mätningar (träff + miss); klasser utan dömda mätningar redovisas inte.`);
    rad.push(
      horisonter
        .map((hz) => {
          const r = rapport.perHorisont[hz];
          const klasser = Object.entries(KLASS_NAMN)
            .map(([nyckel, namn]) => ({ namn, cell: r[nyckel] }))
            .filter((k) => k.cell && !/^— \(n=0\)$/.test(k.cell));
          return klasser.length > 0
            ? `- **${hz}** — ${klasser.map((k) => `${k.namn} ${k.cell}`).join(" · ")}`
            : `- **${hz}** — inga dömda mätningar`;
        })
        .join("\n"),
    );
  }
  rad.push(`## Vad siffran är — och inte är`);
  rad.push(
    `Träffprocenten är ett öppet kvitto om det förflutna — aldrig en garanti om framtiden. Motorn beskriver rytm och läge i fundamentalserier; "osatt" är information, inte fel, och därför räknas osatta mätningar i täckningsbråket men aldrig som fel. Enhetssiffran ${t.traffProcent} % säger inte vilken horisont eller klass som bär den — listan ovan gör det.`,
  );
  rad.push(`## Ändringen sedan senaste publicerade utgåvan`);
  if (!forra) {
    rad.push(`Seriens första maskinutkast i utkastsystemet — räknarna är unga (sedan ${rapport.sedan ?? "okänt datum"}) och varje ny rond väger tyngre än den förra.`);
  } else {
    const delar = [];
    if (forra.traffProcent !== t.traffProcent) delar.push(`träffprocent ${deltaText(forra.traffProcent, t.traffProcent, 0)}`);
    if (forra.domda !== t.domda) delar.push(`dömda mätningar ${deltaText(forra.domda, t.domda, 0)}`);
    rad.push(
      delar.length > 0
        ? delar.join(" · ") + "."
        : `Träffprocenten oförändrad sedan den publicerade utgåvan (${t.traffProcent} % på ${t.domda} dömda mätningar).`,
    );
  }
  rad.push(`## Fördjupa dig`);
  rad.push(
    `- [Kursen AK1TS 25 cellers matris](/kurser/ts-10-ak1ts-25cellers-matris) — vågmatrisen bakom horisonterna\n- [Vågfundament — indikatorer är tidsserier](/blogg/vagfundament-indikatorer-ar-tidsserier) — varför motorn kräver serier, inte nivåer\n- [Forskningsbiblioteket](/forskningsbiblioteket) — bolagsanalyserna vågscannens universum hämtar ifrån`,
  );

  const urdrag = [
    { varde: `träff ${t.traffProcent} % (n=${t.domda} dömda${t.osattaAndel !== null ? `, osatta ${t.osattaAndel} %` : ""})`, datum, notering: "rapportens Totalt-rad" },
    { varde: `${rapport.universum} tickers, 5 horisonter`, datum, notering: `räknare sedan ${rapport.sedan ?? "?"}` },
    ...horisonter.map((hz) => {
      const r = rapport.perHorisont[hz];
      const celler = Object.entries(KLASS_NAMN).filter(([nyckel]) => r[nyckel] && !/^— \(n=0\)$/.test(r[nyckel]));
      return { varde: `${hz}: ${celler.map(([nyckel, namn]) => `${namn} ${r[nyckel]}`).join(" · ") || "inga dömda"}`, datum, notering: "rapportens horisonttabell" };
    }),
  ];

  const k = {
    slug: "vagkartan-traffprocent",
    serie: "vagkartan",
    titel: `Vågkartan ${manad} — träffprocenten ${t.traffProcent} % (utkast)`,
    ingress: `Vågmotorns rullande träffprocent: ${t.traffProcent} % på ${t.domda} dömda mätningar${t.osattaAndel !== null ? ` (osatta ${t.osattaAndel} % räknas aldrig som fel)` : ""} — ett öppet kvitto om det förflutna, aldrig en garanti om framtiden. Domdatum ${datum}.`,
    statistik,
    urdrag,
    kallor,
    seed,
    manad: datum.slice(0, 7),
  };
  k.bodyForGrind = rad;
  return k;
}

// ════════════════════════════════════════════════════════════════════════════
// (d) Kassaflödesanalys 101 — fria kassaflöden + konverteringsgrad (våg 96 D3)
//     Källa: bolagsunivers.json (fcfMarginal, fcfYield, nettoMarginal).
//     Konverteringsgraden är HÄRLEND ur två mätta fält (fcfMarginal ÷
//     nettoMarginal — omsättningen är gemensam nämnare) och härledningen
//     redovisas öppet i texten. Deskriptiva rankningar, ALDRIG råd.
// ════════════════════════════════════════════════════════════════════════════

function raknaKassaflode(rader) {
  const fcf = rader
    .filter((r) => typeof r.lonksamhet?.fcfMarginal === "number")
    .sort((a, b) => b.lonksamhet.fcfMarginal - a.lonksamhet.fcfMarginal || (a.ticker < b.ticker ? -1 : 1));
  const fy = rader
    .filter((r) => typeof r.vardering?.fcfYield === "number")
    .sort((a, b) => b.vardering.fcfYield - a.vardering.fcfYield || (a.ticker < b.ticker ? -1 : 1));
  const konv = rader
    .filter(
      (r) =>
        typeof r.lonksamhet?.fcfMarginal === "number" &&
        typeof r.lonksamhet?.nettoMarginal === "number" &&
        r.lonksamhet.nettoMarginal > 0,
    )
    .map((r) => ({ ticker: r.ticker, namn: r.namn, konvertering: r.lonksamhet.fcfMarginal / r.lonksamhet.nettoMarginal }))
    .sort((a, b) => b.konvertering - a.konvertering || (a.ticker < b.ticker ? -1 : 1));
  if (fcf.length === 0 || fy.length === 0 || konv.length === 0) {
    throw new Error("kassaflödesunderlaget saknar mätta fcf-fält — fabriken gissar aldrig");
  }
  return {
    antal: rader.length,
    fcfMatta: fcf.length,
    fcfMedian: median(fcf.map((r) => r.lonksamhet.fcfMarginal)),
    fcfTopp: fcf.slice(0, 5),
    fcfBotten: fcf.slice(-5),
    fyMatta: fy.length,
    fyMedian: median(fy.map((r) => r.vardering.fcfYield)),
    fyOverFem: fy.filter((r) => r.vardering.fcfYield > 0.05).length,
    fyTvaFem: fy.filter((r) => r.vardering.fcfYield > 0.02 && r.vardering.fcfYield <= 0.05).length,
    fyUnderTva: fy.filter((r) => r.vardering.fcfYield <= 0.02).length,
    fyNegativa: fy.filter((r) => r.vardering.fcfYield < 0).length,
    konvMatta: konv.length,
    konvMedian: median(konv.map((r) => r.konvertering)),
    konvOverEtt: konv.filter((r) => r.konvertering > 1).length,
    konvTopp: konv.slice(0, 3),
  };
}

function byggKassaflodesanalys(univers, seed, kallor) {
  const s = raknaKassaflode(univers.rader);
  const datum = univers.datum;
  const manad = manadArsNamn(datum);
  const statistik = { ...s, datum, referens: `${datum} · ${s.antal}-bolagsuniversum` };
  const forra = publiceradStatistik("kassaflodesanalys-101");

  const rad = [];
  rad.push(
    `Bolagsuniverset bär tre kassaflödesfält, och underlaget hämtat ${datum} ser ut så: **FCF-marginal** är mätt för ${s.fcfMatta} av ${s.antal} bolag (median ${pct(s.fcfMedian)}), **FCF-avkastning** för ${s.fyMatta} (median ${pct(s.fyMedian)}), och **konverteringsgraden** kan härledas för ${s.konvMatta}. Det här är en genomgång av vad måtten betyder och hur universum ser ut just nu — en deskriptiv översikt, inte en värdering.`,
  );
  rad.push(`## Tre mått på samma kassa`);
  rad.push(
    `**FCF-marginal** = fritt kassaflöde ÷ omsättning — hur stor del av intäkterna som blir pengar att röra sig med. **FCF-avkastning** (fcfYield) = fritt kassaflöde ÷ marknadsvärde — kassaflödet satt mot bolagets prislapp. **Konverteringsgrad** = fritt kassaflöde ÷ nettoresultat — hur mycket av den redovisade vinsten som syns i kassan. Universet bär inte konverteringsgraden som eget fält, men eftersom fcfMarginal och nettoMarginal båda har omsättningen som nämnare ger kvoten mellan dem exakt FCF ÷ nettoresultat — härledningen är aritmetik och redovisas öppet, inget fält hittas på.`,
  );
  rad.push(`## Fria kassaflöden per bolag — spridningen`);
  rad.push(
    `Högst och lägst FCF-marginal i underlaget (sortering av data, inte omdömen):`,
  );
  rad.push(
    s.fcfTopp
      .map((r) => `- **${kortNamn(r.namn)}** (${r.ticker}, ${branschNamn(r.bransch)}) — FCF-marginal ${pct(r.lonksamhet.fcfMarginal)}`)
      .join("\n"),
  );
  rad.push(
    s.fcfBotten
      .map((r) => `- **${kortNamn(r.namn)}** (${r.ticker}, ${branschNamn(r.bransch)}) — FCF-marginal ${pct(r.lonksamhet.fcfMarginal)}`)
      .join("\n"),
  );
  rad.push(
    `En hög marginal i en kapitallätt verksamhet och en låg i en kapitaltung är olika företeelser; ett negativt värde betyder att bolaget förbrukade kassa under mätperioden. Talen är urvalsberoende — universum är ${s.antal} bolag i tio branscher, och inget sägs om bolag utanför det.`,
  );
  rad.push(`## Konverteringsgraden — när vinsten inte är pengar`);
  rad.push(
    `Bland ${s.konvMatta} bolag med båda fälten mätta (och positivt nettoresultat) ligger medianen på ${tal(s.konvMedian, 2)}, och ${String(s.konvOverEtt)} av ${String(s.konvMatta)} omsluter mer kassa än de redovisar i vinst. En konverteringsgrad över 1 kan till exempel komma av att bokförda avskrivningar (som inte är kontanta) överstiger de verkliga investeringarna; under 1 kan komma av att arbetande kapital eller investeringar binder kassa. Det är läsningar av redovisningens skillnad mot kassan — vad som gäller i det enskilda bolaget avgörs i den manuella analysen. Högst konverteringsgrad i underlaget: ${s.konvTopp.map((k) => `${kortNamn(k.namn)} (${k.ticker}, ${tal(k.konvertering, 2)})`).join(", ")}.`,
  );
  rad.push(`## FCF-avkastningens fördelning`);
  rad.push(
    `Bland ${s.fyMatta} mätta bolag har ${String(s.fyOverFem)} FCF-avkastning över 5 %, ${String(s.fyTvaFem)} mellan 2 och 5 %, ${String(s.fyUnderTva)} under 2 % — och ${String(s.fyNegativa)} är negativa, det vill säga bolag som för närvarande förbrukar kassa i förhållande till sitt marknadsvärde. Fördelningen är ett ögonblick ur underlaget (${datum}); den beskriver utfall, inte framtida hållbarhet.`,
  );
  rad.push(`## Ändringen sedan senaste publicerade utgåvan`);
  if (!forra) {
    rad.push(`Seriens första maskinutkast i utkastsystemet — ingen tidigare publicerad statistik att jämföra med i data/blogg/.`);
  } else {
    const delar = [];
    if (forra.fcfMedian !== s.fcfMedian) delar.push(`FCF-marginal-medianen ${deltaText(forra.fcfMedian * 100, s.fcfMedian * 100)}`);
    if (forra.fyMedian !== s.fyMedian) delar.push(`FCF-avkastning-medianen ${deltaText(forra.fyMedian * 100, s.fyMedian * 100)}`);
    if (forra.konvOverEtt !== s.konvOverEtt) delar.push(`antalet över 1,0 i konvertering ${deltaText(forra.konvOverEtt, s.konvOverEtt, 0)}`);
    rad.push(
      delar.length > 0
        ? delar.join(" · ") + "."
        : `Kassaflödesmåtten oförändrade sedan den publicerade utgåvan (median FCF-marginal ${pct(s.fcfMedian)}).`,
    );
  }
  rad.push(`## Fördjupa dig`);
  rad.push(
    `- [Kursen Kassaflödesanalysen](/kurser/km-003-kassaflodesanalysen) — kassaflödesanalysen från bokföringens grunder\n- [Forskningsbiblioteket](/forskningsbiblioteket) — bolagsanalyserna med fullständigt AKM1/AKM2-underlag\n- [Kapitalförbränkning (V19)](/blogg/v19-kapitalforbranning-analys) — vad negativa kassaflöden betyder i modellen`,
  );

  const urdrag = [
    { varde: `FCF-marginal median ${pct(s.fcfMedian)}`, datum, notering: `n=${String(s.fcfMatta)} mätta av ${String(s.antal)} (lonksamhet.fcfMarginal)` },
    { varde: `FCF-avkastning median ${pct(s.fyMedian)}`, datum, notering: `n=${String(s.fyMatta)} mätta (vardering.fcfYield)` },
    { varde: `konverteringsgrad median ${tal(s.konvMedian, 2)} · ${String(s.konvOverEtt)} över 1,0`, datum, notering: `n=${String(s.konvMatta)} — HÄRLEND som fcfMarginal ÷ nettoMarginal` },
    { varde: `fördelning FCF-avkastning: >5 % ${String(s.fyOverFem)} · 2–5 % ${String(s.fyTvaFem)} · <2 % ${String(s.fyUnderTva)} · negativ ${String(s.fyNegativa)}`, datum, notering: "av " + String(s.fyMatta) + " mätta" },
    ...s.fcfTopp.map((r) => ({ varde: `${r.ticker} FCF-marginal ${pct(r.lonksamhet.fcfMarginal)}`, datum, notering: `högst rankade (${branschNamn(r.bransch)})` })),
    ...s.fcfBotten.map((r) => ({ varde: `${r.ticker} FCF-marginal ${pct(r.lonksamhet.fcfMarginal)}`, datum, notering: `lägst rankade (${branschNamn(r.bransch)})` })),
  ];

  const k = {
    slug: "kassaflodesanalys-101",
    serie: "kassaflodesanalys",
    titel: `Kassaflödesanalys 101 ${manad} — fria kassaflöden och konverteringsgrad (utkast)`,
    ingress: `Kassaflödesgrunderna med riktiga tal: FCF-marginal mätt för ${String(s.fcfMatta)} av ${String(s.antal)} bolag (median ${pct(s.fcfMedian)}), FCF-avkastning för ${String(s.fyMatta)} (median ${pct(s.fyMedian)}) och härledd konverteringsgrad för ${String(s.konvMatta)}. Underlag hämtat ${datum}.`,
    statistik,
    urdrag,
    kallor,
    seed,
    manad: datum.slice(0, 7),
  };
  k.bodyForGrind = rad;
  return k;
}

// ════════════════════════════════════════════════════════════════════════════
// (e) Utdelningar 101 — begreppen + det underlag som FINNS (våg 96 D3)
//     Källorna levererar INGA per-bolags utdelningsfält (aterkop 0/100 mätta)
//     — därför: utdelningsandel + direktavkastning som BEGREPP (räkneexempel
//     med tydligt märkta pedagogiska tal) + FCF-taket som deskriptivt
//     dataurdrag (fcfYield) + ärlighetsredovisning av luckorna.
// ════════════════════════════════════════════════════════════════════════════

function raknaUtdelningsunderlag(rader) {
  const fy = rader.filter((r) => typeof r.vardering?.fcfYield === "number");
  if (fy.length === 0) throw new Error("utdelningsunderlaget saknar mätt fcfYield — fabriken gissar aldrig");
  const sorterade = [...fy].sort((a, b) => b.vardering.fcfYield - a.vardering.fcfYield || (a.ticker < b.ticker ? -1 : 1));
  return {
    antal: rader.length,
    fyMatta: fy.length,
    fyMedian: median(fy.map((r) => r.vardering.fcfYield)),
    fyOverFem: fy.filter((r) => r.vardering.fcfYield > 0.05).length,
    fyTvaFem: fy.filter((r) => r.vardering.fcfYield > 0.02 && r.vardering.fcfYield <= 0.05).length,
    fyUnderTva: fy.filter((r) => r.vardering.fcfYield <= 0.02).length,
    fyNegativa: fy.filter((r) => r.vardering.fcfYield < 0).length,
    fyTopp: sorterade.slice(0, 5),
    aterkopMatta: rader.filter((r) => typeof r.aterkop?.senasteArMdr === "number").length,
    insiderMatta: rader.filter((r) => typeof r.aterkop?.insiderkopSenaste6man === "number").length,
  };
}

function byggUtdelningar(univers, seed, kallor) {
  const s = raknaUtdelningsunderlag(univers.rader);
  const datum = univers.datum;
  const manad = manadArsNamn(datum);
  const statistik = { ...s, datum, referens: `${datum} · ${s.antal}-bolagsuniversum` };
  const forra = publiceradStatistik("utdelningar-101");

  const rad = [];
  rad.push(
    `Utdelningsandel och direktavkastning är två av börsens mest citerade nyckeltal — men AK1A:s underlag bär ingen per-bolags utdelningsdata: återköpsfältet (aterkop.senasteArMdr) är mätt i ${String(s.aterkopMatta)} av ${String(s.antal)} rader och utdelningsbelopp levereras inte av källorna alls. Serien gör därför två saker: den lär ut begreppen, och den redovisar det som finns — taket på långsiktig utdelningsförmåga som de fria kassaflödena beskriver. Underlag hämtat ${datum}.`,
  );
  rad.push(`## Utdelningsanden — andelen av vinsten som delas ut`);
  rad.push(
    `Utdelningsandel (payout) = utdelning ÷ nettoresultat. Pedagogiskt räkneexempel med valda tal (inte ur underlaget): ett bolag med 10 kr i vinst per aktie som delar ut 4 kr har utdelningsandel 40 %. En andel under 100 % lämnar plats att behålla och bygga; en andel över 100 % betyder att bolaget delar ut mer än det tjänar — det kan bäras en tid av kassabehållning eller skuld, men inte obegränsat. Vad en rimlig andel är skiljer sig mellan branscher och faser, och avgörs per bolag i den manuella analysen.`,
  );
  rad.push(`## Direktavkastningen — utdelningen satt mot kursen`);
  rad.push(
    `Direktavkastning = utdelning per aktie ÷ aktiekurs. Samma räkneexempel: 4 kr i utdelning på en kurs av 100 kr ger 4 %. Fallgropen är inbyggd i kvoten: en stigande direktavkastning kan komma av en stigande utdelning — eller av en fallande kurs. Kvoten säger vilket av de två som hände, inte varför, och den högsta direktavkastningen i en lista är ofta den bolag där marknaden prissatt något den är osäker på. Direktavkastning är alltså en fråga att ställa, inte ett svar.`,
  );
  rad.push(`## Taket: utdelningar betalas med kassa`);
  rad.push(
    `Långsiktigt kan utdelningar och återköp inte överstiga de fria kassaflödena utan att finansieras av ny skuld eller nytt eget kapital. Därför ger FCF-avkastningen (fcfYield) ett grovt tak på hur hög direktavkastningen kan bli hållbart. I universum är fältet mätt för ${String(s.fyMatta)} av ${String(s.antal)} bolag (underlag ${datum}): medianen ${pct(s.fyMedian)}, ${String(s.fyOverFem)} bolag över 5 %, ${String(s.fyTvaFem)} mellan 2 och 5 %, ${String(s.fyUnderTva)} under 2 % och ${String(s.fyNegativa)} negativa. Högst FCF-avkastning: ${s.fyTopp.map((r) => `${kortNamn(r.namn)} (${r.ticker}, ${pct(r.vardering.fcfYield)})`).join(", ")}. Ett utrymme är inte ett löfte — många bolag behåller kassan av goda skäl, och listan är en sortering av data, ingen värdering.`,
  );
  rad.push(`## Vad källorna inte levererar — och vad serien gör åt det`);
  rad.push(
    `Ärlighetsredovisningen: ${String(s.aterkopMatta)} av ${String(s.antal)} rader har mätta återköpsbelopp; utdelningsandel och direktavkastning per bolag finns inte i filerna. Insiderköp senaste 6 månader är däremot mätt (${String(s.insiderMatta)} av ${String(s.antal)} rader) — men det är en notering om ägarbeteende, inte något utdelningsmått. Fabriken upprepar aldrig utdelningstal den inte har; när källorna börjar leverera fältet kan serien redovisa riktiga andelar i stället för taket.`,
  );
  rad.push(`## Ändringen sedan senaste publicerade utgåvan`);
  if (!forra) {
    rad.push(`Seriens första maskinutkast i utkastsystemet — ingen tidigare publicerad statistik att jämföra med i data/blogg/.`);
  } else {
    const delar = [];
    if (forra.fyMedian !== s.fyMedian) delar.push(`FCF-avkastning-medianen ${deltaText(forra.fyMedian * 100, s.fyMedian * 100)}`);
    if (forra.fyOverFem !== s.fyOverFem) delar.push(`antalet över 5 % ${deltaText(forra.fyOverFem, s.fyOverFem, 0)}`);
    rad.push(
      delar.length > 0
        ? delar.join(" · ") + "."
        : `Utdelningsunderlaget oförändrat sedan den publicerade utgåvan (FCF-avkastning-median ${pct(s.fyMedian)}).`,
    );
  }
  rad.push(`## Fördjupa dig`);
  rad.push(
    `- [Kursen Direktavkastning](/kurser/km-063-direktavkastning) — kvoten, dess fallgropar och dess användning\n- [Kursen Utdelningstillväxt](/kurser/km-064-utdelningstillvaxt) — när växande utdelningar bär information\n- [Kursen Eget kapital och utdelningar](/kurser/km-005-eget-kapital-utdelningar) — hur utdelningen vandrar genom balansräkningen`,
  );

  const urdrag = [
    { varde: `FCF-avkastning median ${pct(s.fyMedian)}`, datum, notering: `n=${String(s.fyMatta)} mätta av ${String(s.antal)} (vardering.fcfYield) — tak på hållbar direktavkastning` },
    { varde: `fördelning: >5 % ${String(s.fyOverFem)} · 2–5 % ${String(s.fyTvaFem)} · <2 % ${String(s.fyUnderTva)} · negativ ${String(s.fyNegativa)}`, datum, notering: "av " + String(s.fyMatta) + " mätta" },
    { varde: `återköp mätta ${String(s.aterkopMatta)}/${String(s.antal)} · insiderköp mätta ${String(s.insiderMatta)}/${String(s.antal)}`, datum, notering: "aterkop-fältens täckning — utdelningsdata saknas i källorna" },
    ...s.fyTopp.map((r) => ({ varde: `${r.ticker} FCF-avkastning ${pct(r.vardering.fcfYield)}`, datum, notering: `högst rankade (${branschNamn(r.bransch)})` })),
  ];

  const k = {
    slug: "utdelningar-101",
    serie: "utdelningar",
    titel: `Utdelningar 101 ${manad} — begreppen och utdelningsutrymmet (utkast)`,
    ingress: `Utdelningsandel och direktavkastning som begrepp, med det underlag som finns: FCF-avkastning mätt för ${String(s.fyMatta)} av ${String(s.antal)} bolag (median ${pct(s.fyMedian)}) som tak på hållbar utdelning — per-bolags utdelningsdata levereras inte av källorna och påhittas aldrig. Underlag hämtat ${datum}.`,
    statistik,
    urdrag,
    kallor,
    seed,
    manad: datum.slice(0, 7),
  };
  k.bodyForGrind = rad;
  return k;
}

// ════════════════════════════════════════════════════════════════════════════
// (f) Börspsykologi: fallstugor — undervisningscase ur våghistoriken (våg 96 D3)
//     Källa: vagvalidering-SENASTE.json (dömda celler per horisont×klass).
//     Utfallet bärs av UT RÄKNADE binomialexempel på antaganden som faller
//     (n=2-fällan, basbyggots 0/12, osatt döms aldrig). Vågdata bär bara
//     tickers och horisonter — inga personnamn förekommer och inga hittas på.
// ════════════════════════════════════════════════════════════════════════════

function byggBoerspsykologi(vagj, seed, kallor) {
  if (!vagj.domdatum || !vagj.totalt || typeof vagj.totalt.traffProcent !== "number") {
    throw new Error("vagvalidering-SENASTE.json saknar domdatum/totalt — fabriken hittar aldrig på tal");
  }
  const cell = (h, klass) =>
    vagj.perHorisontKlass.find((r) => r.horisont === h && r.klass === klass) ?? null;
  const tvaTraffar = cell("kort", "impulsvåg");
  const basMedellang = cell("medellång", "basbygge");
  const basMega = cell("mega", "basbygge");
  const impMedellang = cell("medellång", "impulsvåg");
  const impMega = cell("mega", "impulsvåg");
  if (!tvaTraffar || tvaTraffar.nDomda !== 2 || !basMedellang || !basMega) {
    throw new Error("fallstugecellerna saknas/ändrat utfall i vågvalideringen — mallen vägrar skriva om sig själv");
  }
  const t = vagj.totalt;
  const datum = vagj.domdatum;
  const manad = manadArsNamn(datum);
  const basSumma = basMedellang.nDomda + basMega.nDomda;
  const slantTvaa = Math.pow(0.5, 2); // P(2/2 | p=0,5)
  const slantTolv = Math.pow(0.5, basSumma); // P(0/n | p=0,5)
  const statistik = {
    domdatum: datum,
    traffProcent: t.traffProcent,
    domda: t.nDomda,
    osattaAndel: t.osattAndelProcent,
    universum: vagj.universum,
    sedan: vagj.sedan,
    fall: {
      tvaTraffar: { horisont: "kort", klass: "impulsvåg", traffProcent: tvaTraffar.traffProcent, nDomda: tvaTraffar.nDomda, slantsingling: slantTvaa },
      basbygge: { celler: [basMedellang, basMega], nDomdaSumma: basSumma, slantsingling: slantTolv },
      impulsvagKontrast: [impMedellang, impMega].filter((x) => x !== null),
    },
  };
  const forra = publiceradStatistik("boerspsykologi-fallstugor");

  const rad = [];
  rad.push(
    `Vågvalideringen dömer varje rond: förra rondens vågklass per (ticker, horisont) mäts mot dagens faktiska fundamentmomentum. Hittills har motorn dömt ${String(t.nDomda)} mätningar med ${String(t.traffProcent)} % träff, och ${String(t.osattAndelProcent)} % av mätningarna är osatta och döms aldrig — inte ens som fel (räknare sedan ${vagj.sedan ?? "okänt datum"}, ${String(vagj.universum ?? "?")} tickers). Historiken är mer än ett kvitto: den är undervisningsmaterial. Tre fall ur domdatum ${datum}, räknade på motorns egna utfall.`,
  );
  rad.push(`## Fallet med de två träffarna`);
  rad.push(
    `Horisonten kort, klassen impulsvåg: ${String(tvaTraffar.traffProcent)} % träff — på exakt n = ${String(tvaTraffar.nDomda)} dömda mätningar. Räkneexemplet: vore den sanna träffchansen 50 %, som en slantsingling, är sannolikheten att träffa båda 0,5 × 0,5 = ${pct(slantTvaa, 0)} — alltså förklarar slumpen resultatet mer än väl. Tumregeln 3/n säger att noll missar på n observationer bara sätter taket på missfrekvensen vid ungefär 3/n; med n = 2 blir det 150 %, vilket betyder ingen begränsning alls. Hjärnan läser mönster i små urval — det är själva fallgropen, och därför redovisar motorn n bredvid varje procent.`,
  );
  rad.push(`## Fallet med basbygget som gick sönder`);
  rad.push(
    `Två celler visar 0 %: medellång basbygge (${String(basMedellang.nDomda)} dömda) och mega basbygge (${String(basMega.nDomda)} dömda) — sammanlagt 0 träffar på ${String(basSumma)} mätningar. Protokollet dömer basbygge som träff när fundamentmomentumet håller sig inom ± 6 % — antagandet är "en period av liten rörelse". Vore det en slantsingling vore sannolikheten ${String(basSumma)} raka missar 0,5 upphöjt till ${String(basSumma)}, ungefär ${pct(slantTolv, 2)} — sällsynt nog att granska antagandet i stället för att skylla på otur. Trolig läsning: när motorn klassat basbygge har momentumet ofta rört sig mer än tröskeln; etiketten "lugn period" var antagandet som föll. Kontrasten i samma data: impulsvåg på medellång och mega träffar ${String(impMedellang?.traffProcent ?? "?")} % (n = ${String(impMedellang?.nDomda ?? "?")}) respektive ${String(impMega?.traffProcent ?? "?")} % (n = ${String(impMega?.nDomda ?? "?")}) — riktning har fångats bättre än stillhet. Vad det betyder är en fråga till kommande ronder, inte en slutsats att handla på.`,
  );
  rad.push(`## Fallet med att inte döma`);
  rad.push(
    `${String(t.osattAndelProcent)} % av mätningarna är osatta, och protokollet dömer ALDRIG en osatt klass. Psykologiskt är det motståndskraftens kärna: impulsen att fylla varje lucka i datan med en tolkning ("den är osatt för att det nog är positivt") är samma instinkt som tillverkar slutsatser ur ingenting. Osatt är information — tidsserien räcker inte än, och att vänta är ett beslut, inte passivitet.`,
  );
  rad.push(`## Vad träffprocenten inte är`);
  rad.push(
    `Enheten ${String(t.traffProcent)} % är ett öppet kvitto om det förflutna — aldrig en sannolikhet om framtiden. Dom-protokollet, ordagrant ur rapporten: "${vagj.protokollText ?? "—"}" Binomialtalen ovan är räknade på motorns redovisade n och utfall; de förklarar vad datan KAN säga, inte vad den kommer att göra.`,
  );
  rad.push(`## Ändringen sedan senaste publicerade utgåvan`);
  if (!forra) {
    rad.push(`Seriens första maskinutkast i utkastsystemet — räknarna är unga (sedan ${vagj.sedan ?? "okänt datum"}) och varje ny rond väger tyngre än den förra.`);
  } else {
    const delar = [];
    if (forra.traffProcent !== t.traffProcent) delar.push(`träffprocent ${deltaText(forra.traffProcent, t.traffProcent, 0)}`);
    if (forra.domda !== t.nDomda) delar.push(`dömda mätningar ${deltaText(forra.domda, t.nDomda, 0)}`);
    rad.push(
      delar.length > 0
        ? delar.join(" · ") + "."
        : `Fallstugeunderlaget oförändrat sedan den publicerade utgåvan (${String(t.traffProcent)} % på ${String(t.nDomda)} dömda mätningar).`,
    );
  }
  rad.push(`## Fördjupa dig`);
  rad.push(
    `- [Kursen Bekräftelsefälla](/kurser/km-019-bekraftelsefalla) — varför vi söker det vi redan tror\n- [Kursen Övertro](/kurser/km-036-overconfidence) — små urval, stor säkerhet\n- [Mr Market och psykologin på börsen](/blogg/mr-market-psykologi-svenska-borsen) — klassikern om humörets pris`,
  );

  const urdrag = [
    { varde: `totalt ${String(t.traffProcent)} % (n=${String(t.nDomda)} dömda, osatta ${String(t.osattAndelProcent)} %)`, datum, notering: "rapportens totalt-block (JSON-spegeln)" },
    { varde: `kort/impulsvåg ${String(tvaTraffar.traffProcent)} % på n=${String(tvaTraffar.nDomda)}`, datum, notering: `fallstudie 1 — P(2/2 | slant) = ${pct(slantTvaa, 0)}` },
    { varde: `medellång+mega/basbygge 0 träffar på n=${String(basSumma)}`, datum, notering: `fallstudie 2 — P(0/${String(basSumma)} | slant) ≈ ${pct(slantTolv, 2)}` },
    { varde: `osatta ${String(t.osattAndelProcent)} % döms aldrig`, datum, notering: "fallstudie 3 — protokollregel, ordagrant i texten" },
  ];

  const k = {
    slug: "boerspsykologi-fallstugor",
    serie: "boerspsykologi",
    titel: `Börspsykologi: fallstudier ${manad} — när antaganden faller (utkast)`,
    ingress: `Tre undervisningscase ur vågvalideringens dömda historik (domdatum ${datum}): två träffar av två möjliga, basbyggen som missade samtliga tolv domar, och disciplinen att inte döma det osatta. Utfallen räknas fram ur motorns egna tal — utbildning, aldrig rådgivning.`,
    statistik,
    urdrag,
    kallor,
    seed,
    manad: datum.slice(0, 7),
  };
  k.bodyForGrind = rad;
  return k;
}

// ── Montering: body = mall + granskningsunderlag + disclaimer ───────────────

function montera(k) {
  // Mall = det som blir kvar när granskaren tagit bort kvitto-avsnittet:
  // innehåll + negerad disclaimer sist (exportformens krav).
  const mallUtanDisclaimer = k.bodyForGrind.join("\n\n");
  const mallBody = mallUtanDisclaimer + "\n\n" + DISCLAIMER_RAD;
  // mall-md5: md5 av kandidaten UTAN kvitto-avsnittet — väldefinierat och
  // icke-cirkulärt (kvitto-texten bärs inte av sitt eget underlag).
  k.mallMd5 = md5(
    JSON.stringify({
      slug: k.slug,
      titel: k.titel,
      ingress: k.ingress,
      bodyMall: mallBody,
      statistik: k.statistik,
      urdrag: k.urdrag,
      kallor: k.kallor,
      seed: k.seed,
      version: FABRIK_VERSION,
    }),
  );
  // Förkontrollen körs på mallen; GRINDEN KÖRS OM i main på hela bodyn
  // (mall + kvitto + disclaimer) — båda måste vara rena.
  const grunden = grind({ titel: k.titel, ingress: k.ingress, body: mallBody });
  const body = mallUtanDisclaimer + "\n\n" + granskningsunderlagAvsnitt(k, grunden) + "\n\n" + DISCLAIMER_RAD;
  return body;
}

function kandidatMd5(k, body) {
  return md5(
    JSON.stringify({
      slug: k.slug,
      titel: k.titel,
      ingress: k.ingress,
      bodyMarkdown: body,
      statistik: k.statistik,
      urdrag: k.urdrag,
      kallor: k.kallor,
      seed: k.seed,
      version: FABRIK_VERSION,
    }),
  );
}

function sammaStatistik(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ── Huvudflöde ───────────────────────────────────────────────────────────────

async function main() {
  console.log(`═══ m9-FABRIKEN ${FABRIK_VERSION} — granskningsgrinden inbyggd ("servern är datorn") ═══`);

  // Felsäker spärr: städa ev. sönderråkade sondrader utan att generera något.
  if (ARG_STADJA) {
    laddaEnv();
    const rest = supabaseRest();
    if (!rest) {
      console.error("[FEL] Supabase ej konfigurerat (NEXT_PUBLIC_SUPABASE_URL/nyckel saknas i .env) — värden loggas aldrig.");
      return 1;
    }
    const n = await tabortSondRader(rest);
    const kvar = await lasSondRader(rest);
    console.log(`STÄDNING: ${String(n)} sondrad(er) med av=${AV_SOND} borttagna · kvarvarande: ${String(kvar.length)} (skall vara 0)`);
    return kvar.length === 0 ? 0 : 1;
  }

  // 1) Källor + färskhetsvakt
  for (const fil of [FIL_KORSTABELL, FIL_RAPPORT, FIL_VARUMARKE, FIL_UNIVERS, FIL_VAGJSON]) {
    if (!existsSync(fil)) {
      console.error(`[FEL] ${path.relative(REPO, fil)} saknas — fabriken avbryter.`);
      return 1;
    }
  }
  const korstabell = lasJson(FIL_KORSTABELL);
  const rapport = lasVagvalidering();
  const univers = lasUnivers(); // våg 96 D3: serierna (d)+(e)
  const vagj = lasVagJson(); // våg 96 D3: serien (f)
  for (const k of [
    { namn: "korstabell-grund.json", datum: korstabell.skapad },
    { namn: "vagvalidering-SENASTE.md", datum: rapport.domdatum },
    { namn: "bolagsunivers.json", datum: univers.datum },
    { namn: "vagvalidering-SENASTE.json", datum: vagj.domdatum },
  ].filter((k) => k.datum)) {
    const alder = alderDagar(k.datum);
    if (alder > MAX_ALDER_DAGAR) {
      console.error(`[BLOCKERAD] ${k.namn} är ${String(alder)} dagar gammalt (> ${String(MAX_ALDER_DAGAR)}) — m9 §5 färskhetsregeln.`);
      return 1;
    }
  }

  // 2) Determinism-seed (dokumenterad): källfilernas md5 + månadsnyckel ur data.
  //    Våg 96 D3: det GLOBALA seedet är oförändrat (våg 95:s kö-rader skall
  //    förbli verifierbara) — serierna (d)-(f) bär sina EGNA käll-arrayer
  //    (fil+md5, ingår i kandidat-md5) utöver det globala kvittot.
  const kallor = [
    { fil: "data/portfolj-system/korstabell-grund.json", md5: md5Fil(FIL_KORSTABELL), datum: korstabell.skapad },
    { fil: "data/rapporter/vagvalidering-SENASTE.md", md5: md5Fil(FIL_RAPPORT), datum: rapport.domdatum },
    { fil: "data/varumarke.json", md5: md5Fil(FIL_VARUMARKE) },
  ];
  const kallorUnivers = [
    { fil: "data/portfolj-system/bolagsunivers.json", md5: md5Fil(FIL_UNIVERS), datum: univers.datum },
    { fil: "data/varumarke.json", md5: md5Fil(FIL_VARUMARKE) },
  ];
  const kallorVagJson = [
    { fil: "data/rapporter/vagvalidering-SENASTE.json", md5: md5Fil(FIL_VAGJSON), datum: vagj.domdatum },
    { fil: "data/varumarke.json", md5: md5Fil(FIL_VARUMARKE) },
  ];
  const manadsnyckel = `${korstabell.skapad.slice(0, 7)}|${rapport.domdatum.slice(0, 7)}`;
  const seed = md5(kallor.map((k) => k.md5).join(":") + ":" + manadsnyckel);

  // 3) Sex evergreen-kandidater (fasta serier — urvalet ÄR deterministiskt)
  const kandidater = [
    byggBranschmedianer(korstabell, seed, kallor),
    byggForskningslaget(korstabell, seed, kallor),
    byggVagkartan(rapport, seed, kallor),
    byggKassaflodesanalys(univers, seed, kallorUnivers),
    byggUtdelningar(univers, seed, kallorUnivers),
    byggBoerspsykologi(vagj, seed, kallorVagJson),
  ];

  console.log(
    `Färskhet: korstabell ${korstabell.skapad} (${String(alderDagar(korstabell.skapad))} d) · vågvalidering ${rapport.domdatum} (${String(alderDagar(rapport.domdatum))} d) · bolagsunivers ${univers.datum ?? "?"} (${univers.datum ? String(alderDagar(univers.datum)) : "?"} d) · våg-JSON ${vagj.domdatum ?? "?"} (${vagj.domdatum ? String(alderDagar(vagj.domdatum)) : "?"} d) — gräns ${String(MAX_ALDER_DAGAR)} d`,
  );
  console.log(`Seed: ${seed} (md5 av käll-md5:arna + månadsnyckel "${manadsnyckel}" ur underlagens egna datum)`);
  console.log("");

  // 4) Montera + GRINDEN (tvåstegs: kvitto fogas, hela bodyn kontrolleras om)
  let blockerad = false;
  const fardiga = [];
  for (const k of kandidater) {
    const body = montera(k);
    const grunden = grind({ titel: k.titel, ingress: k.ingress, body });
    const md5n = kandidatMd5(k, body);
    const oforandrad = sammaStatistik(k.statistik, publiceradStatistik(k.slug));
    const post = { ...k, bodyMarkdown: body, grunden, md5: md5n, oforandrad };
    delete post.bodyForGrind;
    fardiga.push(post);

    const status = !grunden.godkand ? "BLOCKERAD" : oforandrad && !ARG_SOND ? "OFÖRÄNDRAT (skip vid --skriv)" : "GRANSKNINGSKLAR";
    if (!grunden.godkand) blockerad = true;
    console.log(`- ${k.slug} — ${status}`);
    console.log(`    kontrolleraText: ${String(grunden.rader)} rader · FEL ${String(grunden.fel.length)} · VARNINGAR ${String(grunden.varningar.length)} · struktur-FEL ${String(grunden.strukturFel.length)} · ${String(grunden.rubriker)} "##"-rubriker · disclaimer sist: ${grunden.disclaimerSist ? "ja" : "nej"}`);
    console.log(`    kandidat-md5 ${md5n} · urdrag ${String(k.urdrag.length)} rader (värde+datum) · ${String(Math.round(body.length / 100) / 10)}k tecken body`);
    for (const f of grunden.fel) console.error(`    FEL "${f.fras}" i: ${String(f.rad).slice(0, 90)}`);
    for (const s of grunden.strukturFel) console.error(`    STRUKTUR-FEL: ${s}`);
    console.log(`    Första meningen: "${forstaMening(body)}"`);
  }
  console.log("");
  if (blockerad) {
    console.error("BLOCKERAD av grinden — inget skrivs till Supabase.");
    return 1;
  }

  // 5) Torr-läge slutar här (standard). --visa = granskarens helhetsvy.
  if (!ARG_SKRIV && !ARG_SOND) {
    if (ARG_VISA) {
      const urval = fardiga.filter((p) => ARG_VISA_SLUG === null || p.slug === ARG_VISA_SLUG);
      if (urval.length === 0) {
        console.error(`[FEL] Ingen kandidat med slug "${String(ARG_VISA_SLUG)}".`);
        return 1;
      }
      for (const p of urval) {
        console.log(`\n═══ ${p.slug} — TITEL ═══\n${p.titel}\n\n═══ INGRESS ═══\n${p.ingress}\n\n═══ BODY (${String(p.bodyMarkdown.length)} tecken) ═══\n${p.bodyMarkdown}`);
      }
      return 0;
    }
    console.log(`TORR: ${String(fardiga.length)} kandidater genererade, 0 rader skrivna. Kör med --skriv för produktion (av=${AV_PRODUKTION}), --sond för testomgång eller --visa [slug] för hela bodyn.`);
    console.log(`GRANSKNINGSGRINDEN: samtliga kandidater bär status "utkast" + granskningsunderlag (källor fil+md5, dataurdrag värde+datum, kontrollresultat) — publicering sker ENBART av människan via exportvägen.`);
    return 0;
  }

  // 6) Nätverkslägen: env + REST (värden loggas ALDRIG)
  const env = laddaEnv();
  const rest = supabaseRest();
  if (!rest) {
    console.error(
      `[FEL] Supabase ej konfigurerat — url ${env.urlSatt ? "satt" : "EJ SATT"}, service-nyckel ${env.serviceSatt ? "satt" : "ej satt"}, anon-nyckel ${env.anonSatt ? "satt" : "ej satt"} (värden loggas aldrig).`,
    );
    return 1;
  }
  const versioner = await lasVersioner(rest);

  if (ARG_SKRIV) {
    console.log(`── PRODUCTIONSSKRIVNING (av=${AV_PRODUKTION}) ─────────────────`);
    for (const p of fardiga) {
      if (p.oforandrad && !ARG_TVINGA) {
        console.log(`- ${p.slug} — OFÖRÄNDRAT: statistiken rörde sig ej sedan publicerad utgåva — inget nytt utkast i kön (evergreen-regeln).`);
        continue;
      }
      if (p.oforandrad && ARG_TVINGA) {
        console.log(`- ${p.slug} — OFÖRÄNDRAT men --tvinga: medvetet bootstrap-undantag (våg 66-pilotens utgåva gick aldrig genom kön) — utkast skrivs ändå.`);
      }
      const version = (versioner.get(p.slug) ?? 0) + 1;
      await skrivUtkastRad(rest, byggRad(p, AV_PRODUKTION, version));
      console.log(`✓ ${p.slug} v${String(version)} — utkast-rad i granskningskön (status "utkast", ALDRIG publicerad).`);
    }
    console.log(`Klar: kandidaterna ligger i granskningskön (panelen /api/admin/blogg GET listar dem) — granskaren fyller granskadAv via panelen; publicering endast via exportvägen.`);
    return 0;
  }

  // --sond: EN testomgång — skriv alla kandidatrader av=Sond-M9-Test, läs TILLBAKA, städa, verifiera 0.
  console.log(`── TESTOMGÅNG (av=${AV_SOND}) — skriv → återläs → städa → verifiera ──`);
  const totaltFore = await raknaRader(rest);
  const skrivna = [];
  for (const p of fardiga) {
    const version = (versioner.get(p.slug) ?? 0) + 1;
    await skrivUtkastRad(rest, byggRad(p, AV_SOND, version));
    skrivna.push({ slug: p.slug, version });
    console.log(`✓ skrev ${p.slug} v${String(version)} (status "utkast", av=${AV_SOND})`);
  }
  const tillbaka = await lasSondRader(rest);
  console.log(`Återläst ${String(tillbaka.length)} sondrad(er) ur granskningskön:`);
  for (const r of tillbaka) {
    console.log(
      `  · ${String(r.slug)} v${String(r.version)} status="${String(r.status)}" av=${AV_SOND} (created ${String(r.created_at)}) — titel: ${String(r.titel).slice(0, 70)}`,
    );
  }
  const forvantatOk = skrivna.every((s) => tillbaka.some((r) => r.slug === s.slug && Number(r.version) === s.version && r.status === "utkast"));
  const borttagna = await tabortSondRader(rest);
  const kvar = await lasSondRader(rest);
  const totaltEfter = await raknaRader(rest);
  console.log(`Städning: ${String(borttagna)} sondrad(er) borttagna · kvarvarande sondrader: ${String(kvar.length)} (skall vara 0)`);
  console.log(`Granskningskön totalt: ${String(totaltFore)} rader före sonden → ${String(totaltEfter)} efter städning (skall vara lika — kön opåverkat)`);
  console.log("");
  console.log(
    `SOND-RESULTAT: ${String(skrivna.length)} skrivna · ${String(tillbaka.length)} återlästa (form-korrekt: ${forvantatOk ? "JA — status utkast, versioner stämmer" : "NEJ"}) · ${String(borttagna)} städade · ${String(kvar.length)} kvar.`,
  );
  if (!forvantatOk || kvar.length !== 0 || borttagna !== skrivna.length || totaltFore !== totaltEfter) {
    console.error("[FEL] Sonden avvek — kör --stadja-sond och undersök.");
    return 1;
  }
  console.log("Granskningskön lämnad i ursprungligt skick — produktionstillstånd opåverkat.");
  return 0;
}

/** Bygg skriv-radens details + fabrik-kvitto. */
function byggRad(p, av, version) {
  return {
    slug: p.slug,
    titel: p.titel,
    ingress: p.ingress,
    bodyMarkdown: p.bodyMarkdown,
    av,
    version,
    fabrik: {
      version: FABRIK_VERSION,
      genereradUr: "verktyg/m9-fabrik.mjs",
      serie: p.serie,
      manad: p.manad,
      seed: p.seed,
      kandidatMd5: p.md5,
      kallor: p.kallor,
      urdrag: p.urdrag,
      kontroll: {
        kontrolleraTextFel: p.grunden.fel.length,
        kontrolleraTextVarningar: p.grunden.varningar.length,
        strukturFel: p.grunden.strukturFel.length,
        rubriker: p.grunden.rubriker,
        disclaimerSist: p.grunden.disclaimerSist,
      },
      notering:
        "m9-fabrikens granskningskö: automatiskt utkast — MÄNSKLIG GRANSKNING via panelen före statusbyte/publicering (våg 66-regeln). Granskningsunderlag = urdrag (värde+datum) + källor (fil+md5) + detta kvitto.",
    },
  };
}

main()
  .then((kod) => process.exit(kod))
  .catch((e) => {
    console.error("[m9-fabrik] FEL: " + (e instanceof Error ? e.message : String(e)));
    process.exit(1);
  });
