#!/usr/bin/env node
/**
 * AK1A — Testsvit för MEDLEM-PROGRESS (src/lib/medlem-progress.ts, FAS L2
 * våg 87 — kontraktet i data/forskning/STYRELSE/STYRELSE-V86-L2-GATING.md §B).
 *
 * REN LOGIK UTAN NÄTVERK: global fetch är stubbad genom hela sviten. Bron
 * (v81/v86-mönstret) kopierar supabase-rest.ts + content.ts (importfria resp.
 * fs-baserade) till tool-results/ (gitignorad hjälpkatalog — aldrig i src/,
 * aldrig tmp_-namngiven) och skriver om medlem-progress.ts:s båda import-
 * specifiers till kopiorna; modulen läses med nodes typstrippring (≥ 22.18).
 *
 * Kontroller (≥ 10 enligt kontraktet):
 *   (1)  Quiz-nyckel: quiz → quiz:<slug>:<kap>:<i> = 10 — deterministisk,
 *        server-fastställd; KLIENTFÖRHANDLADE fält (nyckel/varde/xp i bodyn)
 *        läses ALDRIG och kan inte påverka utfallet.
 *   (2)  Quiz-gränser: kapitel utan quiz, i ≥ quizlängd, icke-heltal,
 *        negativa index ⇒ fel — ALDRIG en nyckel.
 *   (3)  Slug/typ-vakt: okänd slug, okänd typ ⇒ fel (vitlistan).
 *   (4)  kursklar ⇒ DUBBELRAD kursklar:<slug> = 50 + stjarna:<slug> = 1
 *        (samma belöning som member-local betalar ut, våg 78 B4b).
 *   (5)  stjarna ⇒ en rad varde 1.
 *   (6)  Teoretiskt max: quiz×10 + 50 per kurs; stjärnor = kursantalet.
 *   (7)  Import: takas mot teoretiskt max, avdrag för redan registrerat,
 *        främmande/redan-klara slug:ar filtreras, ENGÅNG (409 vid re-import).
 *   (8)  Senaste-vinner: nyast-först vinner per nyckel; saknad nyckel ⇒ rad
 *        kan aldrig vinna.
 *   (9)  Aggregat: quiz/kursklar/stjarna/import ⇒ {xp, stjarnor, klaraKurser,
 *        importGjord}; främmande nycklar ignoreras.
 *   (10) skrivMedlemProgressEvent: exakt POST /rest/v1/system_events med
 *        type=medlem_progress, severity=info, details={authId, slug, nyckel,
 *        varde}, Prefer: return=minimal, DUBBELRAD i EN begäran; byggfas ⇒
 *        ok:false + 0 nätverksanrop.
 *   (11) lasMedlemProgress: REQUESTSCOPAD läsning — filter details->>authId,
 *        Range-header, två medlemmar i följd får VAR SIN data (modul-cache
 *        vore en läcka mellan medlemmar, §B.4); nätverksfel ⇒ TOM profil.
 *   (12) URL-hermetik (Mimosa): varje fetch-URL = https://<ref>.supabase.co +
 *        FAST literal rest/v1/system_events — %-kodade filtervärden, aldrig
 *        rå variabel i sökvägen.
 *   (13) Bygg-hermetik + datumIdag: NEXT_PHASE=phase-production-build ⇒
 *        lasMedlemProgress TOM med 0 fetch; datumIdag = YYYY-MM-DD.
 *
 * Användning:  node verktyg/testa-medlem-progress.mjs   (node ≥ 22.18)
 * Avslutskod:  0 om inga FAIL, 1 annars.
 */
import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODUL_SOKVAG = path.join(REPO, "src", "lib", "medlem-progress.ts");
const SUPABASE_REST_SOKVAG = path.join(REPO, "src", "lib", "supabase-rest.ts");
const CONTENT_SOKVAG = path.join(REPO, "src", "lib", "content.ts");

// ── Testram (mönstret från verktyg/testa-medlem-auth.mjs) ─────────────────
const RADER = [];
function kolla(namn, ok, detalj = "") {
  RADER.push({ namn, ok: !!ok, detalj });
}

// ── Miljöhantering (testerna styr process.env — modulen läser den LAZY) ────
const ENV_NYCKLAR = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PHASE",
];
const SPARAD_ENV = Object.fromEntries(ENV_NYCKLAR.map((k) => [k, process.env[k]]));
function rensaEnv() {
  for (const k of ENV_NYCKLAR) delete process.env[k];
}
function aterstallEnv() {
  for (const [k, v] of Object.entries(SPARAD_ENV)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

// ── Fetch-stub: räknar anrop, svarar från fabrik — NÄTVERK ALDRIG ──────────
let ANROP = [];
let svarFabrik = () => nySvar(200, []);
const RIKTIG_FETCH = globalThis.fetch;
function nySvar(status, kropp) {
  if (status === 204 || status === 205 || status === 304) {
    return new Response(null, { status });
  }
  return new Response(JSON.stringify(kropp), { status, headers: { "Content-Type": "application/json" } });
}
function installeraFetchStub() {
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    ANROP.push({ url: u, init });
    return svarFabrik(u, init);
  };
}
function aterstallFetch() {
  globalThis.fetch = RIKTIG_FETCH;
}

// ── Syntetiskt kursuniversum (DETERMINISTISKT — ej deep-courses.json) ──────
const quiz = (n) => Array.from({ length: n }, (_, i) => ({ q: `f${i}`, alternativ: ["a", "b"], ratt: 0 }));
const KAP = (num, quizLen) => ({ num, title: `Kap ${num}`, minutes: 5, intro: "", blocks: [], ...(quizLen ? { quiz: quiz(quizLen) } : {}) });
const KURSER = {
  "v09-roe": { slug: "v09-roe", category: "x", chapters: [KAP(1, 2), KAP(2, 0), KAP(3, 1)] },
  "v10-roic": { slug: "v10-roic", category: "x", chapters: [KAP(1, 1)] },
};
// v09-roe: 3 frågor × 10 + 50 = 80 · v10-roic: 1 × 10 + 50 = 60 ⇒ max 140 XP.
const MAX_XP = 140;
const MAX_STJARNOR = 2;

async function main() {
  // ── Importbro (v86-mönstret): "./supabase-rest" + "@/lib/content" ⇒ kopior ─
  let m;
  const BRO_KALLA = path.join(REPO, "tool-results", "v87-medlem-progress-importbro.ts");
  const REST_KOPIA = path.join(REPO, "tool-results", "v87-medlem-progress-supabase-rest.ts");
  const CONTENT_KOPIA = path.join(REPO, "tool-results", "v87-medlem-progress-content.ts");
  try {
    mkdirSync(path.dirname(BRO_KALLA), { recursive: true });
    writeFileSync(REST_KOPIA, readFileSync(SUPABASE_REST_SOKVAG, "utf8"));
    writeFileSync(CONTENT_KOPIA, readFileSync(CONTENT_SOKVAG, "utf8"));
    const kalla = readFileSync(MODUL_SOKVAG, "utf8");
    const transformerad = kalla
      .replace('from "./supabase-rest"', `from "${pathToFileURL(REST_KOPIA).href}"`)
      .replace('from "@/lib/content"', `from "${pathToFileURL(CONTENT_KOPIA).href}"`);
    writeFileSync(BRO_KALLA, transformerad);
    m = await import(pathToFileURL(BRO_KALLA).href);
  } catch (e) {
    console.error("[testa-medlem-progress] KUNDE INTE IMPORTERA MODULFILEN: " + (e && e.message ? e.message : String(e)));
    process.exitCode = 1;
    return;
  } finally {
    try { unlinkSync(BRO_KALLA); } catch { /* redan borta */ }
    try { unlinkSync(REST_KOPIA); } catch { /* redan borta */ }
    try { unlinkSync(CONTENT_KOPIA); } catch { /* redan borta */ }
  }
  const {
    valideraProgressSkrivning, valideraImport, teoretisktMaxXp, teoretisktMaxStjarnor,
    senasteVinnerProgress, aggredereaProgress, lasMedlemProgress, skrivMedlemProgressEvent,
    XP_PER_QUIZ, XP_KURSKLAR, MEDLEM_PROGRESS_EVENT_TYP, datumIdag,
  } = m;

  rensaEnv();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://testproj.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-nyckel";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-nyckel";
  installeraFetchStub();

  // ── (1) Quiz-nyckeln — deterministisk + klientförhandling ignorerad ───────
  const quizOK = valideraProgressSkrivning(
    // Bodyn bär medvetet förhandlade fält (nyckel/varde/xp) — validatoren
    // FÅR bara läsa typ/slug/kap/i (kontrakt §B.3: ALDRIG klientskickad sträng).
    { typ: "quiz", slug: "v09-roe", kap: 3, i: 0, nyckel: "quiz:elonade:999:0", varde: 1000000, xp: 999999 },
    KURSER,
  );
  const quiz1 =
    valideraProgressSkrivning({ typ: "quiz", slug: "v09-roe", kap: 1, i: 1 }, KURSER);
  const nyckelOK =
    quizOK.ok === true && quizOK.rader.length === 1 &&
    quizOK.rader[0].nyckel === "quiz:v09-roe:3:0" && quizOK.rader[0].varde === XP_PER_QUIZ &&
    quiz1.ok === true && quiz1.rader[0].nyckel === "quiz:v09-roe:1:1" &&
    XP_PER_QUIZ === 10;
  kolla(
    "Quiz-nyckel: quiz:<slug>:<kap>:<i> = 10 server-fastställt; klientförhandlade nyckel/varde/xp-fält läses ALDRIG",
    nyckelOK,
    "servern äger nyckeln och beloppet (§B.3–B.4)",
  );

  // ── (2) Quiz-gränser ───────────────────────────────────────────────────────
  const kapUtanQuiz = valideraProgressSkrivning({ typ: "quiz", slug: "v09-roe", kap: 2, i: 0 }, KURSER);
  const kapSaknas = valideraProgressSkrivning({ typ: "quiz", slug: "v09-roe", kap: 9, i: 0 }, KURSER);
  const iForStort = valideraProgressSkrivning({ typ: "quiz", slug: "v09-roe", kap: 1, i: 2 }, KURSER);
  const ejHeltal = valideraProgressSkrivning({ typ: "quiz", slug: "v09-roe", kap: 1.5, i: 0 }, KURSER);
  const negativt = valideraProgressSkrivning({ typ: "quiz", slug: "v09-roe", kap: 1, i: -1 }, KURSER);
  const gransOK =
    !kapUtanQuiz.ok && !kapSaknas.ok && !iForStort.ok && !ejHeltal.ok && !negativt.ok &&
    [kapUtanQuiz, kapSaknas, iForStort, ejHeltal, negativt].every((v) => typeof v.fel === "string" && v.fel !== "");
  kolla(
    "Quiz-gränser: kapitel utan quiz / saknat kapitel / i ≥ längd / icke-heltal / i < 0 ⇒ fel — aldrig en nyckel",
    gransOK,
    "validering mot kursdata innan någon nyckel byggs",
  );

  // ── (3) Slug/typ-vakt ──────────────────────────────────────────────────────
  const okandSlug = valideraProgressSkrivning({ typ: "quiz", slug: "elonade-kurs", kap: 1, i: 0 }, KURSER);
  const okandTyp = valideraProgressSkrivning({ typ: "xp-bomb", slug: "v09-roe" }, KURSER);
  const tomSlug = valideraProgressSkrivning({ typ: "stjarna", slug: "" }, KURSER);
  const vaktOK = !okandSlug.ok && !okandTyp.ok && !tomSlug.ok;
  kolla(
    "Slug/typ-vakt: okänd slug (utanför deep-courses), okänd typ, tom slug ⇒ fel",
    vaktOK,
    "vitlistan quiz|kursklar|stjarna|import (§B.2)",
  );

  // ── (4) kursklar ⇒ dubbelrad 50 + 1 ────────────────────────────────────────
  const kursklar = valideraProgressSkrivning({ typ: "kursklar", slug: "v10-roic" }, KURSER);
  const kursklarOK =
    kursklar.ok === true && kursklar.slug === "v10-roic" &&
    kursklar.rader.length === 2 &&
    kursklar.rader[0].nyckel === "kursklar:v10-roic" && kursklar.rader[0].varde === 50 &&
    kursklar.rader[1].nyckel === "stjarna:v10-roic" && kursklar.rader[1].varde === 1 &&
    XP_KURSKLAR === 50;
  kolla(
    "kursklar ⇒ DUBBELRAD kursklar:<slug> = 50 + stjarna:<slug> = 1 i EN POST (v79-dual-write)",
    kursklarOK,
    "samma belöning som member-local (addXP(50) + addStjarna)",
  );

  // ── (5) stjarna ⇒ en rad ───────────────────────────────────────────────────
  const stjarna = valideraProgressSkrivning({ typ: "stjarna", slug: "v10-roic" }, KURSER);
  const stjarnaOK =
    stjarna.ok === true && stjarna.rader.length === 1 &&
    stjarna.rader[0].nyckel === "stjarna:v10-roic" && stjarna.rader[0].varde === 1;
  kolla(
    "stjarna ⇒ exakt en rad stjarna:<slug> = 1",
    stjarnaOK,
    "vitlistad separat typ (framtida stjärn-belöningar)",
  );

  // ── (6) Teoretiskt max (importtaket) ───────────────────────────────────────
  const maxOK =
    teoretisktMaxXp(KURSER) === MAX_XP &&
    teoretisktMaxStjarnor(KURSER) === MAX_STJARNOR &&
    teoretisktMaxXp({}) === 0 && teoretisktMaxStjarnor({}) === 0;
  kolla(
    `Teoretiskt max ur kursdata: quiz×10 + 50 per kurs (${MAX_XP} XP), stjärnor = kursantal (${MAX_STJARNOR})`,
    maxOK,
    "importens XP takas mot detta (§B.4)",
  );

  // ── (7) Import: tak + avdrag + filter + engångs ────────────────────────────
  const REDAN = { xp: 120, stjarnor: 1, klaraKurser: ["v10-roic"], importGjord: false };
  const importer = valideraImport(
    { authId: "auth-uuid-1", xp: 500, stjarnor: 9, klaraKurser: ["v09-roe", "finns-ej", "v10-roic", "v09-roe"], datum: "2026-09-07" },
    KURSER,
    REDAN,
  );
  const ogiltig = valideraImport(
    { authId: "a", xp: -5, stjarnor: 1, klaraKurser: [], datum: "2026-09-07" },
    KURSER,
    { xp: 0, stjarnor: 0, klaraKurser: [], importGjord: false },
  );
  const redanGjord = valideraImport(
    { authId: "a", xp: 10, stjarnor: 0, klaraKurser: [], datum: "2026-09-07" },
    KURSER,
    { xp: 0, stjarnor: 0, klaraKurser: [], importGjord: true },
  );
  const importOK =
    importer.ok === true &&
    importer.nyckel === "import:auth-uuid-1:2026-09-07" &&
    importer.varde.xp === 20 && // 500 avdragat redan 120 = 380 ⇒ takat mot 140? Nej: tak gäller KLIENT-xp (500>140⇒140) sedan avdrag ⇒ 20.
    importer.varde.stjarnor === 1 && // 9 ⇒ tak 2, avdrag 1 ⇒ 1
    importer.varde.klaraKurser.length === 1 && importer.varde.klaraKurser[0] === "v09-roe" &&
    !ogiltig.ok && ogiltig.status === 400 &&
    !redanGjord.ok && redanGjord.status === 409;
  kolla(
    "Import: XP takas mot teoretiskt max OCH dras av redan registrerat; stjärnor takas; främmande/redan-klara slug:ar filtreras; EN gång (409)",
    importOK,
    `varde=${JSON.stringify(importer.ok ? importer.varde : importer.fel)} — GDPR: endast aggregat`,
  );

  // ── (8) Senaste-vinner ─────────────────────────────────────────────────────
  const rader = [
    { nyckel: "quiz:v09-roe:1:0", varde: "10" },
    { nyckel: "kursklar:v09-roe", varde: "50" },
    { nyckel: null, varde: "10" },
    { varde: "10" },
  ];
  const karta = senasteVinnerProgress(rader);
  const vinnerOK =
    karta.size === 2 &&
    karta.get("quiz:v09-roe:1:0") === "10" &&
    karta.get("kursklar:v09-roe") === "50" &&
    senasteVinnerProgress([]).size === 0;
  kolla(
    "Senaste-vinner: första förekomsten (nyest) vinner per nyckel; rader utan nyckel kan aldrig vinna; tomt ⇒ tomt",
    vinnerOK,
    "samma läsmodell som lasKursOverrides (Range-paginerat i lasRaderFor)",
  );

  // ── (9) Aggregatet ─────────────────────────────────────────────────────────
  const agg = aggredereaProgress(
    new Map([
      ["quiz:v09-roe:1:0", "10"],
      ["quiz:v09-roe:1:1", "10"],
      ["kursklar:v09-roe", "50"],
      ["stjarna:v09-roe", "1"],
      ["import:auth-uuid-1:2026-09-07", '{"xp":30,"stjarnor":2,"klaraKurser":["v10-roic","v09-roe"]}'],
      ["frammande:nyckel", "999"],
      ["annat", "1"],
    ]),
  );
  const aggOK =
    agg.xp === 10 + 10 + 50 + 30 &&
    agg.stjarnor === 1 + 2 &&
    agg.klaraKurser.length === 2 && agg.klaraKurser[0] === "v09-roe" && agg.klaraKurser[1] === "v10-roic" &&
    agg.importGjord === true &&
    aggredereaProgress(new Map()).xp === 0;
  kolla(
    "Aggregat: quiz +10/st, kursklar +50 +slug, stjarna +1, import-objekt unionas (importGjord=true); främmande nycklar ignoreras",
    aggOK,
    `xp=${agg.xp} stjarnor=${agg.stjarnor} klara=${agg.klaraKurser.join(",")}`,
  );

  // ── (10) skrivMedlemProgressEvent — exakt POST-kontrakt ────────────────────
  ANROP = [];
  svarFabrik = () => nySvar(201, []);
  const skrivning = await skrivMedlemProgressEvent("auth-uuid-2", "v10-roic", [
    { nyckel: "kursklar:v10-roic", varde: 50 },
    { nyckel: "stjarna:v10-roic", varde: 1 },
  ]);
  const skrivAnrop = ANROP[0];
  const skrivRader = skrivAnrop ? JSON.parse(skrivAnrop.init.body) : [];
  const skrivOK =
    skrivning.ok === true &&
    skrivAnrop.url === "https://testproj.supabase.co/rest/v1/system_events" &&
    skrivAnrop.init.method === "POST" &&
    skrivAnrop.init.headers.Prefer === "return=minimal" &&
    skrivRader.length === 2 &&
    skrivRader.every((r) => r.type === "medlem_progress" && r.severity === "info" && r.source === "medlem") &&
    skrivRader[0].details.authId === "auth-uuid-2" &&
    skrivRader[0].details.slug === "v10-roic" &&
    skrivRader[0].details.nyckel === "kursklar:v10-roic" &&
    skrivRader[0].details.varde === 50 &&
    MEDLEM_PROGRESS_EVENT_TYP === "medlem_progress";
  kolla(
    "skrivMedlemProgressEvent: EN POST /rest/v1/system_events med båda raderna (type=medlem_progress, details={authId, slug, nyckel, varde}, Prefer return=minimal)",
    skrivOK,
    "organ-event-mönstret (timeout 8 s, fail-safe)",
  );

  // ── (11) lasMedlemProgress — requestskopad per medlem ──────────────────────
  ANROP = [];
  const RADPER = {
    "auth-uuid-A": [
      { nyckel: "quiz:v09-roe:1:0", varde: "10" },
      { nyckel: "kursklar:v09-roe", varde: "50" },
    ],
    "auth-uuid-B": [{ nyckel: "stjarna:v10-roic", varde: "1" }],
  };
  svarFabrik = (url) => {
    for (const [authId, rader] of Object.entries(RADPER)) {
      if (url.includes(encodeURIComponent(authId))) return nySvar(200, rader);
    }
    return nySvar(200, []);
  };
  const profilA1 = await lasMedlemProgress("auth-uuid-A");
  const profilB = await lasMedlemProgress("auth-uuid-B");
  const profilA2 = await lasMedlemProgress("auth-uuid-A");
  svarFabrik = () => {
    throw new Error("nätverksbortfall");
  };
  const profilNett = await lasMedlemProgress("auth-uuid-A");
  const lasUrl = ANROP[0] ? ANROP[0].url : "";
  const lasOK =
    profilA1.xp === 60 && profilA1.klaraKurser.length === 1 && profilA1.importGjord === false &&
    profilB.xp === 0 && profilB.stjarnor === 1 &&
    profilA2.xp === profilA1.xp && // ingen modul-cache: VARJE anrop gick till nätet
    ANROP.length === 4 && // A + B + A (lysande läsningar) + A (nätverksfels-anropet)
    profilNett.xp === 0 && profilNett.klaraKurser.length === 0 && profilNett.importGjord === false &&
    lasUrl.includes("/rest/v1/system_events?type=eq.medlem_progress&details->>authId=eq.auth-uuid-A") &&
    ANROP.every((a) => typeof a.init.headers.Range === "string" && a.init.headers.Range.startsWith("0-"));
  kolla(
    "lasMedlemProgress: REQUESTSCOPAD — filter details->>authId + Range-header; medlem A och B i följd får VAR SIN data (ingen modul-cache-läcka); nätverksfel ⇒ TOM profil",
    lasOK,
    `A=${profilA1.xp} XP · B=${profilB.stjarnor} ★ · nätanrop=${ANROP.length} (3 läsningar + 1 felande)`,
  );

  // ── (12) URL-hermetik (Mimosa-receptet) ────────────────────────────────────
  // Sökvägen är en FAST literal; frågedelen bär enbart %-kodade filtervärden.
  const URL_RE = /^https:\/\/[a-z0-9-]+\.supabase\.co\/rest\/v1\/system_events(\?.*)?$/;
  const urlOK =
    ANROP.length > 0 &&
    ANROP.every((a) => URL_RE.test(a.url) && !a.url.includes(" ")) &&
    skrivAnrop !== undefined && URL_RE.test(skrivAnrop.url);
  kolla(
    "URL-hermetik: varje fetch-URL = https://<ref>.supabase.co + FAST literal /rest/v1/system_events — filtervärden %-kodade, aldrig variabel i sökvägen",
    urlOK,
    "sökvägen är konstant; authId/typ lever ENDAST i %-kodade filtervärden",
  );

  // ── (13) Bygg-hermetik + datumIdag ─────────────────────────────────────────
  process.env.NEXT_PHASE = "phase-production-build";
  ANROP = [];
  svarFabrik = () => nySvar(200, [{ nyckel: "quiz:v09-roe:1:0", varde: "10" }]);
  const hermLas = await lasMedlemProgress("auth-uuid-A");
  const hermSkriv = await skrivMedlemProgressEvent("a", "v09-roe", [{ nyckel: "quiz:v09-roe:1:0", varde: 10 }]);
  delete process.env.NEXT_PHASE;
  const hermOK =
    ANROP.length === 0 &&
    hermLas.xp === 0 && hermLas.importGjord === false &&
    hermSkriv.ok === false &&
    /^\d{4}-\d{2}-\d{2}$/.test(datumIdag());
  kolla(
    "Bygg-hermetik: NEXT_PHASE=phase-production-build ⇒ läsning TOM + skrivning NEKAD, 0 nätverksanrop; datumIdag = YYYY-MM-DD",
    hermOK,
    "mönstret från variabler-lagring.ts våg 79 — aldrig nätverk under next build",
  );

  aterstallFetch();
  aterstallEnv();

  // ── Sammanställning (akm2-mönstret) ────────────────────────────────────────
  let fail = 0;
  let nr = 0;
  for (const r of RADER) {
    nr += 1;
    const status = r.ok ? "PASS" : "FAIL";
    if (!r.ok) fail += 1;
    console.log(`${status}  ${String(nr).padStart(2)} · ${r.namn}${r.detalj ? " — " + r.detalj : ""}`);
  }
  console.log("");
  const grona = RADER.length - fail;
  console.log(`[testa-medlem-progress] ${grona}/${RADER.length} kontroller gröna${fail ? ", " + fail + " FAIL" : ""}.`);
  if (!fail) {
    console.log("[testa-medlem-progress] Kontrakt L2: deterministiska nycklar, server-fastställda värden, importtak, senaste-vinner — REN logik, nätverk stubbat.");
  }
  process.exitCode = fail ? 1 : 0;
}

main().catch((e) => {
  aterstallFetch();
  aterstallEnv();
  console.error("[testa-medlem-progress] FEL: " + (e && e.message ? e.message : String(e)));
  process.exitCode = 1;
});
