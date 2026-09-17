#!/usr/bin/env node
/**
 * AK1A — Testsvit för AKM2-SNAPSHOT-LAGRINGEN (src/lib/akm2-snapshot-lagring.ts,
 * våg 86) + retention-kopplingen i src/lib/autonom/organ.ts.
 *
 * Mönster som verktyg/testa-akm2-karna.mjs (node kan inte importera TS direkt):
 *   1. Genererar tmp-Testfil (TS) i repo-roten,
 *   2. kör den med: npx --yes tsx tmp_akm2_snapshot_koll.ts,
 *   3. läser JSON-svaret mellan markörerna, skriver ut PASS/FAIL, städar.
 *
 * REN LOGIK — INGEN nätförbindelse: .env laddas ALDRIG här, men skal-miljön
 * KAN bära Supabase-variablerna (prod-servern GÖR det — fabriksbarnens env),
 * så getSupabaseRest är bara null om kontrollen PINNER bort dem. Kontroll 11
 * gör precis det (o48-hermetik-pinnen): nätfrihet AV KONSTRUKTION, inte av
 * förutsättning. Senaste-vinner, tolkning, tombstone-frånvaro och tak-logik
 * testas som rena funktioner.
 *
 * Kontroller (≥ 8 enligt direktivet — här 12):
 *   (1)  Nyckelform: event-typ "akm2_snapshot" + schema "akm2-resultat-v1".
 *   (2)  Ticker-intyget: börsformer passerar, fientliga avvisas (Mimosa).
 *   (3)  Filnamnssanering: "ABB.ST"→"ABB_ST", ".."/punktprefix avvisas.
 *   (4)  Formguard arAkm2Resultat (lager 1/2/4 + komposit).
 *   (5)  tolkaSnapshotRad: giltig rad → snapshot; trasig/tom/ointygad → null.
 *   (6)  Senaste-vinner: nyast-först vinner per ticker.
 *   (7)  TOMBSTONE EJ AKTUAL: ogiltig nyare rad markerar INTE tickern sedd —
 *        äldre giltig rad vinner (dokumenterad skillnad mot kurs_metadata).
 *   (8)  Tak-logik: 100 tickers × 20 generationer = 2 000 rader → exakt 100
 *        vinnare, var och en den yngsta generationen.
 *   (9)  Tak-logik, organ-källvakt: akm2_snapshot i BÅDA not.in.-listorna,
 *        MAX_ANTAL_AKM2_SNAPSHOT = 2_000 registrerat i raknaTak (100×20=2 000).
 *   (10) Hermetik: phase-production-build ⇒ lasAkm2Snapshot tom karta UTAN
 *        nät + skrivAkm2Snapshot nekas med BYGGFASENS feltext (vakten sitter
 *        före env-kontrollen — bevisat av att feltexten inte är "ej konfigurerat").
 *   (11) Skriv-validering (ren): ointygad ticker / ogiltigt resultat / misspar
 *        ticker↔resultat.ticker ⇒ ok:false FÖRE nät; giltigt utan env ⇒
 *        "Supabase ej konfigurerat" (valideringen passerade). HERMETIK-PINN
 *        (o48): de tre Supabase-variablerna raderas under kontrollen och
 *        återställs i finally — utan pinn tar r4 env-grenen vidare till NÄTET
 *        (läsning + i värsta fall POST mot prod-lagret; påvisad 2026-09-15
 *        22:07Z då fixturen "Fixtur AB" blev gällande ABB.ST-snapshot i prod).
 *   (12) kanoniskJson: jsonb-nyckelordning (a-b vs b-a) är samma snapshot;
 *        olika värden skiljer — idempotensens likhet ljuger aldrig.
 *
 * Användning:  node verktyg/testa-akm2-snapshot.mjs
 * Avslutskod:  0 om inga FAIL, 1 annars.
 */
import { spawnSync } from "node:child_process";
import { unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP_NAMN = "tmp_akm2_snapshot_koll.ts";
const TMP = path.join(REPO, TMP_NAMN);
const MARK_START = "===AKM2_SNAP_JSON_START===";
const MARK_END = "===AKM2_SNAP_JSON_END===";
const TIMEOUT_MS = 240_000; // tsx kan behöva laddas ner första gången

// ── Genererad tmp-testfil (TS, körs via npx tsx, raderas efter körning) ──────
// OBS: inga backticks och inga ${} i koden nedan (den ligger i en template-literal).
const TS_KOD = String.raw`
// tmp_akm2_snapshot_koll.ts — GENERERAD av verktyg/testa-akm2-snapshot.mjs. Raderas efter körning.
import { readFileSync } from "node:fs";
import {
  AKM2_SNAPSHOT_EVENT_TYP,
  AKM2_SNAPSHOT_SCHEMA,
  arGiltigAkm2Ticker,
  akm2CacheFilnamn,
  arAkm2Resultat,
  kanoniskJson,
  tolkaSnapshotRad,
  senasteVinnerAkm2Snapshot,
  lasAkm2Snapshot,
  skrivAkm2Snapshot,
  type Akm2SnapshotLasRad,
} from "./src/lib/akm2-snapshot-lagring";

const MARK_START = "===AKM2_SNAP_JSON_START===";
const MARK_END = "===AKM2_SNAP_JSON_END===";

type TestRad = { namn: string; ok: boolean; detalj: string };
const RADER: TestRad[] = [];
function kolla(namn: string, ok: boolean, detalj = ""): void {
  RADER.push({ namn, ok: !!ok, detalj });
}

// Minimifixtur med AKM2Resultat-form (lager 1/2/4 + komposit — formguardens kontrakt).
function fixtureResultat(ticker: string, komposit: number, datum = "2026-09-03") {
  return {
    ticker,
    namn: "Fixtur AB",
    bransch: "teknik",
    datum,
    modellVersion: "AKM2.2026.09",
    lager1: { poang: { V01: 3 }, totalt: komposit - 1, motivering: {} },
    lager2: { aktiveradeModuler: [], poang: {} },
    lager3: { ticker, perVariabel: {}, perHorisont: {}, konfluens: { raknadeTeorier: 0, sammaRiktning: 0, port: "osatt", text: "" }, horisontVikter: {}, datum },
    lager4: { viktprofil: "akm2-2026", viktPerVariabel: { V01: 1 } },
    komposit,
    perKategori: {},
    band: "osatt" as const,
    projiceradAKM1: { poang: { V01: 3 }, totalt: komposit - 1, motivering: {} },
    spar: [],
    osakerhet: { andelOsatta: 0, andelarKallor: 0, note: "" },
  };
}

/** Bygg en rå läses-rad (resultatet JSON-text — PostgREST details->>-form). */
function rad(ticker: string, resultat: unknown, created_at: string, schema?: string, berikat?: string): Akm2SnapshotLasRad {
  return {
    created_at,
    ticker,
    schema: schema ?? "akm2-resultat-v1",
    berikat: berikat ?? "true",
    datum: "",
    resultat: typeof resultat === "string" ? resultat : JSON.stringify(resultat),
  };
}

// (filen transpileras som CJS — därför async-IIFE i stället för top-level await)
(async () => {

// (1) Nyckelform — event-typen och schemat är lagrets kontrakt.
kolla(
  "nyckelform: event-typ akm2_snapshot + schema akm2-resultat-v1",
  AKM2_SNAPSHOT_EVENT_TYP === "akm2_snapshot" && AKM2_SNAPSHOT_SCHEMA === "akm2-resultat-v1",
  "typ=" + AKM2_SNAPSHOT_EVENT_TYP + " schema=" + AKM2_SNAPSHOT_SCHEMA,
);

// (2) Ticker-intyget (Mimosa-receptet) — börsformer in, fientliga ut.
{
  const giltiga = ["AAPL", "ABB.ST", "ASSA-B.ST", "AKRBP.OL", "0000SSSSDDDDFFFF"];
  const ogiltiga = ["", "ab cd", "AB;DROP", "../..", "tick\\x", "AAAAAAAAAAAAAAAAA"];
  const g = giltiga.every((t) => arGiltigAkm2Ticker(t));
  const o = ogiltiga.every((t) => !arGiltigAkm2Ticker(t));
  kolla("ticker-intyg: börsformer passerar, fientliga avvisas", g && o, giltiga.join(","));
}

// (3) Filnamnssanering — cachefilens namn (".":ar → "_"), vägsäker.
{
  const a = akm2CacheFilnamn("ABB.ST") === "ABB_ST";
  const b = akm2CacheFilnamn("VOLV-B.ST") === "VOLV-B_ST";
  const c = akm2CacheFilnamn("..") === null && akm2CacheFilnamn(".x") === null && akm2CacheFilnamn("") === null;
  kolla("filnamnssanering: ABB.ST→ABB_ST, .. och punktprefix avvisas", a && b && c);
}

// (4) Formguard — hela AKM2Resultat-formen krävs (aldrig påhittad data).
{
  const giltigt = arAkm2Resultat(fixtureResultat("ABB.ST", 62));
  const saknadLager4 = !arAkm2Resultat({ ...fixtureResultat("X", 1), lager4: { viktprofil: "p" } });
  const nanKomposit = !arAkm2Resultat({ ...fixtureResultat("X", Number.NaN) });
  const inteObjekt = !arAkm2Resultat("hej") && !arAkm2Resultat(null);
  kolla("formguard arAkm2Resultat: lager 1/2/4 + ändlig komposit krävs", giltigt && saknadLager4 && nanKomposit && inteObjekt);
}

// (5) tolkaSnapshotRad — giltig rad tolkas, trasig/tom/ointygad kan aldrig bli en snapshot.
{
  const snap = tolkaSnapshotRad(rad("ABB.ST", fixtureResultat("ABB.ST", 62), "2026-09-07T10:00:00Z"));
  const okForm =
    snap !== null &&
    snap.ticker === "ABB.ST" &&
    snap.schema === "akm2-resultat-v1" &&
    snap.berikat === true &&
    snap.sparad === "2026-09-07T10:00:00Z" &&
    snap.resultat.komposit === 62 &&
    snap.datum === "2026-09-03"; // tomt details.datum ⇒ kärnans deterministiska datum
  const trasig = tolkaSnapshotRad(rad("ABB.ST", "{ Trasig JSON", "t2")) === null;
  const tom = tolkaSnapshotRad(rad("ABB.ST", "", "t3")) === null;
  const ointygad = tolkaSnapshotRad(rad("AB CD", fixtureResultat("AB CD", 1), "t4")) === null;
  kolla("tolkaSnapshotRad: giltig rad → snapshot; trasig/tom/ointygad → null", okForm && trasig && tom && ointygad);
}

// (6) Senaste-vinner — rader nyast-först: första giltiga per ticker vinner.
{
  const vinnare = senasteVinnerAkm2Snapshot([
    rad("AMD", fixtureResultat("AMD", 71, "2026-09-03"), "2026-09-07T10:00:00Z"),
    rad("AMD", fixtureResultat("AMD", 70, "2026-08-03"), "2026-08-07T10:00:00Z"),
    rad("ABB.ST", fixtureResultat("ABB.ST", 62), "2026-09-06T10:00:00Z"),
    rad("ABB.ST", fixtureResultat("ABB.ST", 61), "2026-09-05T10:00:00Z"),
  ]);
  const ok =
    vinnare.size === 2 &&
    vinnare.get("AMD")?.resultat.komposit === 71 &&
    vinnare.get("ABB.ST")?.resultat.komposit === 62;
  kolla("senaste-vinner: nyaste generationen vinner per ticker", ok, "size=" + String(vinnare.size));
}

// (7) TOMBSTONE EJ AKTUAL — ogiltig nyare rad blockerar INTE en äldre giltig.
{
  const vinnare = senasteVinnerAkm2Snapshot([
    rad("AMD", "{ ogiltig", "2026-09-08T10:00:00Z"), // yngst men trasig
    rad("AMD", fixtureResultat("AMD", 70), "2026-09-01T10:00:00Z"), // äldre men giltig
  ]);
  const ok = vinnare.size === 1 && vinnare.get("AMD")?.resultat.komposit === 70;
  kolla("tombstone ej aktuell: ogiltig nyare rad hopas över — äldre giltig vinner", ok);
}

// (8) Tak-logik — 100 tickers × 20 generationer = taket 2 000 rader räcker vida.
{
  const rader: Akm2SnapshotLasRad[] = [];
  for (let ticker = 0; ticker < 100; ticker++) {
    const t = "T" + String(ticker).padStart(3, "0") + ".ST";
    // Strömmen är nyast-först (läskontraktet): generation 19 (yngst) skrivs först.
    for (let gen = 19; gen >= 0; gen--) {
      rader.push(rad(t, fixtureResultat(t, gen), "2026-09-07T10:00:" + String(gen).padStart(2, "0") + "Z"));
    }
  }
  const vinnare = senasteVinnerAkm2Snapshot(rader);
  let yngst = true;
  for (const [, s] of vinnare) {
    if (s.resultat.komposit !== 19) {
      yngst = false;
      break;
    }
  }
  kolla(
    "tak-logik: 2 000 rader (100 × 20 generationer) kollapsar till 100 yngsta vinnare",
    rader.length === 2000 && vinnare.size === 100 && yngst,
    "rader=" + String(rader.length) + " vinnare=" + String(vinnare.size),
  );
}

// (9) Tak-logik, organ-källvakt — retentionen är korrekt kopplad (våg 86).
{
  const organ = readFileSync("src/lib/autonom/organ.ts", "utf8");
  const undantag = organ.split("referral,referral_kod,akm2_snapshot)").length - 1; // båda not.in.-listorna
  const takKonstant = organ.includes("const MAX_ANTAL_AKM2_SNAPSHOT = 2_000");
  const takRegistrerat = organ.includes('raknaTak("type=eq.akm2_snapshot", MAX_ANTAL_AKM2_SNAPSHOT)');
  kolla(
    "organ.ts: akm2_snapshot i båda undantagslistorna + eget tak 2 000 (100×20)",
    undantag === 2 && takKonstant && takRegistrerat && 100 * 20 === 2000,
    "not.in.-listor=" + String(undantag),
  );
}

// (10) Hermetik — byggfasen läser tomt UTAN nät och nekar skrivning först av allt.
{
  const forr = process.env.NEXT_PHASE;
  process.env.NEXT_PHASE = "phase-production-build";
  const karta = await lasAkm2Snapshot();
  const tom = karta instanceof Map && karta.size === 0;
  const svar = await skrivAkm2Snapshot({ ticker: "ABB.ST", resultat: fixtureResultat("ABB.ST", 62) as never });
  const nekad = svar.ok === false && typeof svar.fel === "string" && svar.fel.includes("next build");
  const foreEnv = typeof svar.fel === "string" && !svar.fel.includes("ej konfigurerat");
  if (forr === undefined) delete process.env.NEXT_PHASE;
  else process.env.NEXT_PHASE = forr;
  kolla("hermetik: byggfas ⇒ tom karta + skrivning nekas FÖRE env-kontroll", tom && nekad && foreEnv);
}

// (11) Skriv-validering — ren, nät-fri, före env-kontrollen.
// HERMETIK-PINN (o48): samma princip som (10):s NEXT_PHASE-pinn — kontrollen
// FÅR INTE vara miljöberoende. Prod-serverns skal bär RIKTIGA Supabase-
// variabler; utan pinn tar r4 env-grenen vidare till nätet (läsning + POST
// mot prod-lagret) och svaret blir ok/hoppat i stället för "ej konfigurerat"
// = deterministisk FAIL på servern + fixture-skraft i prod (påvisat
// 2026-09-15 22:07Z). Raderade variabler ⇒ deterministiskt nätfritt ÖVERALLT.
{
  const PINN_NYCKLAR = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
  const pinnFore: Record<string, string | undefined> = {};
  for (const nyckel of PINN_NYCKLAR) {
    pinnFore[nyckel] = process.env[nyckel];
    delete process.env[nyckel];
  }
  try {
    const giltigt = fixtureResultat("ABB.ST", 62);
    const r1 = await skrivAkm2Snapshot({ ticker: "AB CD", resultat: giltigt as never });
    const r2 = await skrivAkm2Snapshot({ ticker: "AAPL", resultat: { ticker: "AAPL" } as never });
    const r3 = await skrivAkm2Snapshot({ ticker: "AAPL", resultat: fixtureResultat("MSFT", 50) as never });
    const r4 = await skrivAkm2Snapshot({ ticker: "ABB.ST", resultat: giltigt as never });
    const avvisade =
      !r1.ok && typeof r1.fel === "string" && r1.fel.includes("avbröts") &&
      !r2.ok && !r3.ok && r3.fel !== undefined && r3.fel.includes("misspar");
    const passeradValidering = !r4.ok && typeof r4.fel === "string" && r4.fel.includes("ej konfigurerat");
    kolla(
      "skriv-validering: ointygad/ogiltig/misspar avvisas; giltig utan env ⇒ ärligt 'ej konfigurerat'",
      avvisade && passeradValidering,
    );
  } finally {
    for (const nyckel of PINN_NYCKLAR) {
      if (pinnFore[nyckel] === undefined) delete process.env[nyckel];
      else process.env[nyckel] = pinnFore[nyckel];
    }
  }
}

// (12) kanoniskJson — jsonb bevarar inte nyckelordning: likheten ljuger aldrig.
{
  const a = kanoniskJson(fixtureResultat("ABB.ST", 62));
  const omstoppad = JSON.parse(JSON.stringify(fixtureResultat("ABB.ST", 62)));
  const nycklar = Object.keys(omstoppad).reverse();
  const bObj: Record<string, unknown> = {};
  for (const k of nycklar) bObj[k] = (omstoppad as Record<string, unknown>)[k];
  const b = kanoniskJson(bObj);
  const annat = kanoniskJson(fixtureResultat("ABB.ST", 63));
  kolla("kanoniskJson: nyckelordning-sovrande objekt lika; olika värden skiljer", a === b && a !== annat);
}

// ── Rapport ──────────────────────────────────────────────────────────────────
console.log(MARK_START + JSON.stringify({ rader: RADER }) + MARK_END);

})().catch((e) => {
  console.error("TMPFEL: " + (e && e.message ? e.message : String(e)));
  process.exitCode = 1;
});
`.trim();

// ── 2) Kör tmp-filen med tsx, läs JSON mellan markörerna ─────────────────────
function hittaJson(ut) {
  const a = ut.indexOf(MARK_START);
  const b = ut.indexOf(MARK_END);
  if (a === -1 || b === -1 || b <= a) return null;
  return ut.slice(a + MARK_START.length, b);
}

try {
  writeFileSync(TMP, TS_KOD, "utf8");
  console.log("[testa-akm2-snapshot] kör npx --yes tsx " + TMP_NAMN + " ...");
  const barn = spawnSync("npx", ["--yes", "tsx", TMP_NAMN], {
    cwd: REPO,
    shell: true,
    encoding: "utf8",
    timeout: TIMEOUT_MS,
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, NO_COLOR: "1" },
  });
  const ut = (barn.stdout || "") + "\n[stderr]\n" + (barn.stderr || "");
  const json = hittaJson(barn.stdout || "");
  if (!json) {
    console.error("[testa-akm2-snapshot] FICK INGET TEST-JSON — rå utdata nedan:\n" + ut.slice(0, 4000));
    process.exitCode = 1;
  } else {
    const { rader } = JSON.parse(json);
    let fail = 0;
    let nr = 0;
    for (const r of rader) {
      nr += 1;
      const status = r.ok ? "PASS" : "FAIL";
      if (!r.ok) fail += 1;
      console.log(`${status}  ${String(nr).padStart(2)} · ${r.namn}${r.detalj ? " — " + r.detalj : ""}`);
    }
    console.log("");
    const grona = rader.length - fail;
    console.log(`[testa-akm2-snapshot] ${grona}/${rader.length} kontroller gröna${fail ? ", " + fail + " FAIL" : ""}.`);
    if (!fail) {
      console.log("[testa-akm2-snapshot] AKM2-snapshot-lagret: senaste-vinner, idempotens-vakten och retentionstaket intygt.");
    }
    process.exitCode = fail ? 1 : 0;
  }
  if (barn.status !== null && barn.status !== 0 && !json) process.exitCode = 1;
} catch (fel) {
  console.error("[testa-akm2-snapshot] FEL: " + (fel && fel.message ? fel.message : String(fel)));
  process.exitCode = 1;
} finally {
  // process.exit hoppar över finally — därför sätts exitCode och städning sker här.
  try {
    unlinkSync(TMP);
  } catch {
    /* tmp-filen fanns inte — ok */
  }
}
