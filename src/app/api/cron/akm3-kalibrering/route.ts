import { NextResponse, NextRequest } from "next/server";
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { getSupabaseRest } from "@/lib/supabase-rest";
import { publiceraOrganEvent } from "@/lib/organ-event";
import { domVagvalidering } from "@/lib/vagvalidering";
import {
  KALIBRERING_SCHEMA,
  KALIBRERING_PROTOKOLL_VERSION,
  KALIBRERING_CLEAN_FRAN,
  KALIBRERING_MODELL,
  GRIND_LASAD,
  HANDLINGSGRIND_TEXT,
  ROLLBACK_REGEL_TEXT,
  byggKalibreringsRond,
  byggKalibreringsRapport,
  valideraKedja,
  type KalibreringDomRad,
  type KalibreringLogg,
} from "@/lib/akm3/kalibrering";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/akm3-kalibrering — AKM3 STEG 6 (r1-bayes; BESLUT §8 + §11.6):
 * månadsrond med LÅST handlingsgrind — ΔΦ = 0 ALWAYS. Cronen SAMLAR bara
 * data, ändrar ALDRIG (BESLUT §2: Φ-kalibrering VILLKORAD; ändring först vid
 * n_eff ≥ 20 episoder — realistiskt 8–12 kvartal — OCH steg 7:s protokoll-
 * beslut). Vercel-cron "20 5 2 * *" (dag 2 kl 05:20 UTC varje månad — ledig
 * slot mellan vagscan 05:00 och vagvalidering 05:30; månadens första Bana
 * B-ronder ligger då redan i system_events).
 *
 * Ronden (ren logik i src/lib/akm3/kalibrering.ts — testad i 100%-sviten):
 *   (a) LÄS Bana B: senaste system_events-rader type=vagvalidering, tabell
 *       vagvalidering_dom (per-variabel episoder; dedupliceras av episod-
 *       räknaren: samma episod + dag räknas EN gång). Clean-förbudet vakas:
 *       rader med traff_datum < 2026-09-04 kasseras (FORBUD §10.5).
 *   (b) BERÄKNA beta-binomial-posteriorer per fas (nivå 1) och per (variabel,
 *       fas) som rå rapportering: prior Beta(m·q(fas), m·(1−q)), m = 10, q ur
 *       Markov-priorerna (r1 §1.2 exakt); α = α₀ + T, β = β₀ + M där T/M är
 *       EPISODER (majoritetsdom — aldrig dagar, FORBUD §10.7); n_eff =
 *       episoder / √(1/ρ̄) med ρ̄ skattad ur tvärsnittets momentumserier
 *       (fallback 0,45; 12 tickers ⇒ ~1–3 effektiva/dag).
 *   (c) FÖRSLAG Φ_ny = clamp(1 + κ·(2p̂−1), 0,80, 1,20) — MEN GRINDEN LÅST:
 *       endast förslag + status "vantar-grind" + handlingsgrindens villkor
 *       (n_eff ≥ 20 OCH kredibelt intervall helt ena sidan 0,50 OCH rate-
 *       limit ±0,05/månad, true/false per fas) skrivs i rapporten
 *       data/rapporter/akm3-kalibrering-SENASTE.md + system_events
 *       type=akm3_kalibrering (mått per fas: n_eff, p̂, intervall, villkor).
 *   (d) Hash-kedjad versionslogg data/portfolj-system/kalibrering-logg.json
 *       (append-only, sha-256: prevHash → hash; BARA mätningar — ΔΦ = 0 är
 *       loggradens typkontrakt "matning"). Bruten kedja ⇒ INGEN append +
 *       öppen varning (append-only-kontraktet). Rollback-regeln (§10.11)
 *       följer med i varje rad och varje event — kodat kontrakt.
 *
 * FAIL-SAFE: utan Supabase/nät körs ronden ändå (tom Bana B ⇒ rena priors,
 * n_eff = 0, grinden stängd — hederligt) och rutten svarar alltid 200.
 * Idempotens: redan genomförd månad (system_events ELLER loggfilen) ⇒ samma
 * tabellversion returneras, inget dubbelloggas (acceptans §11.6.i).
 */

/** Antal senaste vagvalidering-ronder som läses (dagliga — ~5 veckor). */
const LASA_RONDER = 35;

type EventRad = { details: Record<string, unknown> | null; created_at: string };

/** Läser N senaste system_events-rader av en typ (details + created_at, fallande). */
async function lasEventRader(sb: ReturnType<typeof getSupabaseRest>, typ: string, limit: number): Promise<EventRad[]> {
  if (!sb) return [];
  try {
    const res = await fetch(
      `${sb.origin}/rest/v1/system_events?type=eq.${typ}&select=details,created_at&order=created_at.desc&limit=${limit}`,
      { headers: sb.headers, cache: "no-store", signal: AbortSignal.timeout(15000) },
    );
    if (!res.ok) return [];
    const rader = (await res.json()) as EventRad[];
    return Array.isArray(rader) ? rader : [];
  } catch {
    return [];
  }
}

/** UTC-kalenderdag (YYYY-MM-DD) ur en ISO-sträng. */
function dagIso(iso: string): string {
  return String(iso).slice(0, 10);
}

/** sha-256-digesten (INJICERAS till lib:s rena funktioner — P1-vänligt). */
const digest = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");

/** Rå Bana B-rad ur eventens details.vagvalidering_dom (STYRELSE §3.2:s schema). */
type RaDomRad = {
  ticker?: unknown;
  variabel?: unknown;
  horisont?: unknown;
  domat_datum?: unknown;
  traff_datum?: unknown;
  klass?: unknown;
  utfall_momentum?: unknown;
  episod_id?: unknown;
  protokoll_version?: unknown;
};

export async function GET(req: NextRequest) {
  // samma skydd som övriga cron-rutter: om CRON_SECRET är satt krävs matchning
  // via ?secret= (query) eller Authorization: Bearer (Vercel Cron).
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const qs = req.nextUrl.searchParams.get("secret");
    const auth = req.headers.get("authorization");
    if (qs !== secret && auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const sb = getSupabaseRest();
  const nu = new Date();
  const dagensDatum = dagIso(nu.toISOString());
  const manad = dagensDatum.slice(0, 7);

  // ── loggfilen: data/portfolj-system/kalibrering-logg.json (graceful) ──────
  const loggSok = path.join(process.cwd(), "data", "portfolj-system", "kalibrering-logg.json");
  let logg: KalibreringLogg | null = null;
  let loggLasbar = false;
  try {
    logg = JSON.parse(readFileSync(loggSok, "utf8")) as KalibreringLogg;
    loggLasbar = Array.isArray(logg?.rader);
  } catch {
    logg = null; // finns inte ännu (första ronden) eller oläslig — hederligt
  }
  const kedjekoll = loggLasbar ? valideraKedja(logg?.rader ?? [], digest) : { ok: true, brutetVid: null };
  const loggRader = loggLasbar && Array.isArray(logg?.rader) ? logg.rader : [];

  // ── idempotens: månadens rond redan genomförd? (loggen ELLER eventet) ─────
  const senasteEvent = (await lasEventRader(sb, "akm3_kalibrering", 1))[0] ?? null;
  const loggManad = loggRader.length > 0 ? loggRader[loggRader.length - 1].manad : null;
  const eventManad =
    senasteEvent?.details && typeof senasteEvent.details.manad === "string"
      ? senasteEvent.details.manad
      : null;
  if (loggManad === manad || eventManad === manad) {
    return NextResponse.json({
      idempotent: true,
      manad,
      datum: dagensDatum,
      phiVersion: typeof senasteEvent?.details?.phiVersion === "string" ? senasteEvent.details.phiVersion : null,
      grindLasad: GRIND_LASAD,
      deltaPhi: 0,
      notering: "Månadens kalibreringsrond är redan genomförd — samma tabellversion returneras (ΔΦ = 0, grinden låst).",
      disclaimer: "Pedagogisk analys — inte investeringsråd",
    });
  }

  // ── (a) läs Bana B: per-variabel-domar ur senaste vagvalidering-ronder ────
  const vagvalRonder = await lasEventRader(sb, "vagvalidering", LASA_RONDER);
  const raRader: RaDomRad[] = [];
  let ronderMedBanaB = 0;
  for (const rond of vagvalRonder) {
    const domrader = rond?.details?.vagvalidering_dom;
    if (!Array.isArray(domrader) || domrader.length === 0) continue;
    ronderMedBanaB += 1;
    for (const r of domrader) if (r && typeof r === "object") raRader.push(r as RaDomRad);
  }

  // Clean by construction (FORBUD §10.5): kalibrering på data från före
  // 2026-09-04 är FÖRBJUDEN — utfallsdatumet måste ligga på/efter driftstart.
  const domRader: KalibreringDomRad[] = [];
  for (const r of raRader) {
    if (typeof r.ticker !== "string" || typeof r.variabel !== "string" || typeof r.horisont !== "string") continue;
    if (typeof r.episod_id !== "string" || r.episod_id === "") continue;
    if (typeof r.traff_datum !== "string" || r.traff_datum < KALIBRERING_CLEAN_FRAN) continue;
    const episodDelar = r.episod_id.split("|");
    const episodStart = /^\d{4}-\d{2}-\d{2}$/.test(episodDelar[episodDelar.length - 1] ?? "")
      ? (episodDelar[episodDelar.length - 1] as string)
      : "";
    const momentum = typeof r.utfall_momentum === "number" && Number.isFinite(r.utfall_momentum) ? r.utfall_momentum : null;
    const dom = domVagvalidering(typeof r.klass === "string" ? r.klass : null, momentum, r.horisont);
    domRader.push({
      ticker: r.ticker,
      variabel: r.variabel,
      horisont: r.horisont,
      klass: typeof r.klass === "string" ? r.klass : "osatt",
      episodId: r.episod_id,
      episodStartDatum: episodStart,
      dom,
      traffDatum: r.traff_datum,
    });
  }

  // ρ̄-underlag: cell (variabel, horisont) → ticker → traffDatum → momentum.
  const cellKartor = new Map<string, Record<string, Record<string, number>>>();
  for (const r of raRader) {
    if (typeof r.variabel !== "string" || typeof r.horisont !== "string" || typeof r.ticker !== "string") continue;
    if (typeof r.traff_datum !== "string" || r.traff_datum < KALIBRERING_CLEAN_FRAN) continue;
    if (typeof r.utfall_momentum !== "number" || !Number.isFinite(r.utfall_momentum)) continue;
    const nyckel = `${r.variabel}|${r.horisont}`;
    const cell = cellKartor.get(nyckel) ?? {};
    const serie = cell[r.ticker] ?? {};
    serie[r.traff_datum] = r.utfall_momentum;
    cell[r.ticker] = serie;
    cellKartor.set(nyckel, cell);
  }
  const momentumCeller = [...cellKartor.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([, cell]) => cell);

  // ── (b) + (c) + (d): ronden som ren funktion (posteriors, LÅST grind, logg)
  const rond = byggKalibreringsRond({
    domRader,
    momentumCeller,
    genererad: nu.toISOString(),
    datum: dagensDatum,
    manad,
    tidigareLogg: loggLasbar ? logg : null,
    digest,
    kedjaBruten: !kedjekoll.ok,
  });

  // ── loggfilen: append (ENDAST hel kedja — append-only-kontraktet) ─────────
  let loggSkrivad = false;
  if (rond.loggRad) {
    try {
      const nyLogg: KalibreringLogg = {
        schema: KALIBRERING_SCHEMA,
        protokollVersion: KALIBRERING_PROTOKOLL_VERSION,
        skapad: loggLasbar && logg?.skapad ? logg.skapad : dagensDatum,
        rader: [...loggRader, rond.loggRad],
        senasteHash: rond.loggRad.hash,
      };
      mkdirSync(path.dirname(loggSok), { recursive: true });
      writeFileSync(loggSok, JSON.stringify(nyLogg, null, 2) + "\n", "utf8");
      loggSkrivad = true;
    } catch {
      // read-only fs (t.ex. Vercel) — mätningen finns i system_events-raden
    }
  }

  // ── EN system_events-rad: type=akm3_kalibrering (mått per fas) ────────────
  let supabaseSparad = false;
  if (sb) {
    try {
      const res = await fetch(`${sb.origin}/rest/v1/system_events`, {
        method: "POST",
        headers: { ...sb.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          type: "akm3_kalibrering",
          severity: "info",
          message:
            "AKM3-kalibrering (LÅST grind, ΔΦ=0): månadrond " + manad +
            " — " + String(rond.episoderTotalt) + " episoder ur " + String(rond.domRader) + " Bana B-rader" +
            (rond.loggRad ? ", logg v" + String(rond.loggRad.version) + " " + rond.loggRad.hash.slice(0, 12) + "…" : ""),
          details: {
            schema: KALIBRERING_SCHEMA,
            protokollVersion: KALIBRERING_PROTOKOLL_VERSION,
            modell: KALIBRERING_MODELL,
            manad,
            datum: dagensDatum,
            genererad: rond.genererad,
            grindLasad: GRIND_LASAD,
            deltaPhi: 0,
            phiVersion: rond.phiVersion,
            cleanFran: rond.cleanFran,
            kalla: "system_events type=vagvalidering (vagvalidering_dom)",
            ronderLasta: vagvalRonder.length,
            ronderMedBanaB,
            domRader: rond.domRader,
            episoderTotalt: rond.episoderTotalt,
            rho: rond.rho,
            rhoKalla: rond.rhoKalla,
            rhoPar: rond.rhoPar,
            effektivaPerDag: rond.effektivaPerDag,
            // MÅTT per fas: n_eff, p̂, kredibelt intervall, villkor true/false.
            faser: rond.faser,
            osatt: rond.osatt,
            korrigeringGOkand: rond.korrigeringGOkand,
            variabelFasAntal: rond.variabelFas.length,
            handlingsgrind: HANDLINGSGRIND_TEXT,
            rollbackRegel: ROLLBACK_REGEL_TEXT,
            loggRad: rond.loggRad,
            varningar: rond.varningar,
            notering:
              "Grinden LÅST i AKM3.2026.09 (BESLUT §11 steg 6): cronen samlar bara data, ΔΦ=0. " +
              "T/M = EPISODER (majoritetsdom; aldrig dagar). n_eff = episoder/√(1/ρ̄). " +
              "Fas-mappning: impulsvåg → sekvens-proxy per kvartalsgräns; korrigering utan G → osatt " +
              "(kärnans regel) och diagnostikpool korrigeringGOkand. Posteriors fryses aldrig in i " +
              "analyskörningar — endast detta event + hash-kedjade loggen bär dem.",
          },
          source: "cron/akm3-kalibrering",
        }),
        signal: AbortSignal.timeout(15000),
      });
      supabaseSparad = res.ok;
    } catch {
      // tyst — svaret returneras alltid
    }
  }

  // ── OrganEvent — nervsystemets puls (fail-safe: kastar aldrig) ────────────
  await publiceraOrganEvent({
    source: "organ/akm3-kalibrering",
    verb: "rapport",
    matt: {
      manad,
      grindLasad: GRIND_LASAD,
      deltaPhi: 0,
      episoder: rond.episoderTotalt,
      domRader: rond.domRader,
      rho: rond.rho,
      effektivaPerDag: rond.effektivaPerDag,
      // per fas: n_eff, p̂, intervall, villkor-uppfyllda true/false
      faser: Object.fromEntries(
        Object.entries(rond.faser).map(([fas, f]) => [
          fas,
          {
            nEff: f.nEff,
            pHat: f.posterior.pHat,
            intervall90: f.posterior.kredibeltIntervall90,
            villkor: f.grind.villkor,
            allaVillkorUppfyllda: f.grind.allaVillkorUppfyllda,
            phiForslag: f.phiForslag,
            status: f.grind.status,
          },
        ]),
      ),
      loggVersion: rond.loggRad?.version ?? null,
      loggHashPrefix: rond.loggRad?.hash.slice(0, 12) ?? null,
      sparad: supabaseSparad,
    },
  });

  // ── rapporten: data/rapporter/akm3-kalibrering-SENASTE.md (graceful) ──────
  let rapportSkrivad = false;
  try {
    const rapportSok = path.join(process.cwd(), "data", "rapporter", "akm3-kalibrering-SENASTE.md");
    mkdirSync(path.dirname(rapportSok), { recursive: true });
    writeFileSync(rapportSok, byggKalibreringsRapport(rond), "utf8");
    rapportSkrivad = true;
  } catch {
    // read-only fs — rapporten finns i system_events-raden
  }

  return NextResponse.json({
    idempotent: false,
    genererad: rond.genererad,
    manad,
    datum: dagensDatum,
    schema: { namn: KALIBRERING_SCHEMA, version: KALIBRERING_PROTOKOLL_VERSION },
    modell: KALIBRERING_MODELL,
    grindLasad: GRIND_LASAD,
    deltaPhi: 0,
    phiVersion: rond.phiVersion,
    cleanFran: rond.cleanFran,
    kalla: {
      ronderLasta: vagvalRonder.length,
      ronderMedBanaB,
      domRader: rond.domRader,
    },
    episoderTotalt: rond.episoderTotalt,
    rho: rond.rho,
    rhoKalla: rond.rhoKalla,
    effektivaPerDag: rond.effektivaPerDag,
    faser: rond.faser,
    osatt: rond.osatt,
    korrigeringGOkand: rond.korrigeringGOkand,
    variabelFasAntal: rond.variabelFas.length,
    handlingsgrind: HANDLINGSGRIND_TEXT,
    rollbackRegel: ROLLBACK_REGEL_TEXT,
    logg: { skrivad: loggSkrivad, rad: rond.loggRad, kedjaOk: kedjekoll.ok, brutetVid: kedjekoll.brutetVid },
    varningar: rond.varningar,
    supabaseSparad,
    rapportSkrivad,
    disclaimer: "Pedagogisk analys — inte investeringsråd",
  });
}
