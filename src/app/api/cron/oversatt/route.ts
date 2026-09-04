import { NextResponse, NextRequest } from "next/server";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { publiceraOrganEvent } from "@/lib/organ-event";
import { publiceraSignal } from "@/lib/signal-bus";
import { MALSPRAK, listaKallor, type KallaPost, type MalSprak } from "@/lib/oversattning/kalla";
import { motorAktiv, oversatt, type OversattningStatus } from "@/lib/oversattning/motor";
import { TERMBANK_STORLEK } from "@/lib/oversattning/termbank";
import {
  TabellSaknasFel,
  koStatusKarta,
  lasSpara,
  lasStatusKarta,
  markeraInaktuell,
  sparaKo,
  type KoPost,
  type OversattningRad,
} from "@/lib/oversattning/lager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/oversatt — MÖS DAGLIGA AUTONOMA ROND (10:00 UTC, se vercel.json).
 *
 * Kunddirektiv: "skapa ett system som översätter alla delar live … och att allt
 * sker dynamiskt speciellt när vi har nytt innehåll". Ronden:
 *   1) lista källor + hash (kalla.ts — deterministiskt ur deep-courses.json
 *      + ordlistan), 2) hitta nya/ändrade mot lagret (hash ≠ lagrad),
 *   3) kör motorn (om ZAI aktiv) + KONTROLLER på varje objekt i en avgränsad
 *      batch, 4) markera ändrade källors gamla översättningar "inaktuell",
 *   5) publiceraOrganEvent + publiceraSignal till admin om granskningskö > 0,
 *   6) skriv rapport data/rapporter/oversattning-SENASTE.md.
 *
 * BATCH-BUDGET (Vercel Hobby: max 1 körning/dag, 60 s): motorn aktiv ⇒ 4
 * objekt/rond (ZAI-timeout 25 s styck); motor inaktiv ⇒ 80 objekt/rond som
 * kö-markeras "vantar-motor". Hela registret (~15 700 kursblock + ~230 ui-
 * nycklar × 2 språk ≈ 32 000 objekt) täcks inkrementellt över ronder — den
 * ärliga takten står i rapporten varje dag; inget påstås klart som inte är det.
 *
 * Utan tabellen oversattningar (data/sql/oversattningar.sql — kunden kör den
 * EN gång) köar ronden lokalt i data/oversattning-kö.json: fungerar i dev,
 * men produktion kräver tabellen (Vercels fs är read-only).
 */

// ── Rondens budgeter ─────────────────────────────────────────────────────────

const BATCH_MOTOR_AKTIV = 4; // 4 × ~25 s ZAI-budget ≤ 60 s ruttbudget
const BATCH_MOTOR_INAKTIV = 80; // kö-markeringar är billiga (EN upsert-begäran)
const MAX_INAKTUELLA_PER_ROND = 200; // ändrade källor som flaggas per dag

type Objekt = { kalla: KallaPost; sprak: MalSprak; kind: "ny" | "andrad" };

export async function GET(req: NextRequest) {
  // Samma skydd som övriga cron-rutter: om CRON_SECRET är satt krävs matchning
  // via ?secret= (query) eller Authorization: Bearer (Vercel Cron).
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const qs = req.nextUrl.searchParams.get("secret");
    const auth = req.headers.get("authorization");
    if (qs !== secret && auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const startad = new Date();
  const motorArAktiv = motorAktiv();

  // (1) Källregister + hash — deterministiskt; kastar om deep-courses.json är oläslig.
  let kallor: readonly KallaPost[];
  try {
    kallor = listaKallor();
  } catch (e) {
    const orsak = e instanceof Error ? e.name : "okänt fel";
    console.error("[cron/oversatt] källregistret kunde inte läsas:", orsak);
    await publiceraOrganEvent({
      source: "organ/oversattning",
      verb: "rapport",
      matt: { fel: 1, notering: "källregistret kunde inte läsas — se serverloggen" },
    });
    return NextResponse.json({ error: "källregistret kunde inte läsas" }, { status: 500 });
  }

  // (2) Lagret — tabell om den finns, annars lokal kö (dokumenterat ärligt).
  let tabellFinns = true;
  let statusKarta = new Map<string, { kallhash: string; status: string }>();
  try {
    statusKarta = await lasStatusKarta();
  } catch (e) {
    if (e instanceof TabellSaknasFel) {
      tabellFinns = false;
      statusKarta = koStatusKarta();
    } else {
      // Nätverksfel mot ett konfigurerat lager är ett FEL — men ronden ska
      // andas: rapportera och kör kön-lost (deterministiskt).
      console.error("[cron/oversatt] lagret svarade inte:", e instanceof Error ? e.name : "?");
      tabellFinns = false;
      statusKarta = koStatusKarta();
    }
  }

  // (3) Nya/ändrade objekt i deterministisk ordning (ui → kursblock; en → ar).
  const nya: Objekt[] = [];
  const andrade: Objekt[] = [];
  for (const kalla of kallor) {
    for (const sprak of MALSPRAK) {
      const id = kalla.scope.typ + ":" + kalla.scope.nyckel + ":" + sprak;
      const lagrad = statusKarta.get(id);
      if (!lagrad) nya.push({ kalla, sprak, kind: "ny" });
      else if (lagrad.kallhash !== kalla.hash) andrade.push({ kalla, sprak, kind: "andrad" });
    }
  }
  const borda = [...nya, ...andrade];

  // (4) Batch enligt budget.
  const batchMax = motorArAktiv ? BATCH_MOTOR_AKTIV : BATCH_MOTOR_INAKTIV;
  const batch = borda.slice(0, batchMax);

  // (5) Inaktuell-markering: ändrade källor UTANFÖR batchen får statusen nu;
  //     batchens egna rader skrivs över direkt av upserten nedan.
  let inaktuellmarkerade = 0;
  if (tabellFinns) {
    const utanforBatch = andrade.slice(batch.filter((o) => o.kind === "andrad").length);
    for (const obj of utanforBatch.slice(0, MAX_INAKTUELLA_PER_ROND)) {
      try {
        inaktuellmarkerade += await markeraInaktuell(obj.kalla.scope.typ, obj.kalla.scope.nyckel, obj.kalla.hash);
      } catch {
        break; // lagret satte stopp — nästa rond fortsätter (avgränsat, inte tyst)
      }
    }
  }

  // (6) Kör batchen: motor + KONTROLLER + status per objekt.
  const rader: OversattningRad[] = [];
  const koPoster: KoPost[] = [];
  const batchLog: Array<{ scope: string; sprak: string; status: OversattningStatus; poang: number; notering: string }> = [];
  let granskas = 0;
  let publicerade = 0;
  let vantanMotor = 0;
  for (const obj of batch) {
    const resultat = await oversatt(obj.kalla.text, obj.sprak);
    if (resultat.status === "publicerad") publicerade += 1;
    else if (resultat.status === "vantar-motor") vantanMotor += 1;
    else granskas += 1;
    rader.push({
      scope_typ: obj.kalla.scope.typ,
      scope_nyckel: obj.kalla.scope.nyckel,
      sprak: obj.sprak,
      kallhash: obj.kalla.hash,
      text: resultat.text ?? "",
      status: resultat.status,
      kvalitet: resultat.poang,
      kontrollrapport: resultat.rapport,
    });
    koPoster.push({
      scope_typ: obj.kalla.scope.typ,
      scope_nyckel: obj.kalla.scope.nyckel,
      sprak: obj.sprak,
      kallhash: obj.kalla.hash,
      status: resultat.status,
      kvalitet: resultat.poang,
      uppdaterad: new Date().toISOString(),
    });
    batchLog.push({
      scope: obj.kalla.scope.typ + ":" + obj.kalla.scope.nyckel,
      sprak: obj.sprak,
      status: resultat.status,
      poang: resultat.poang,
      notering: resultat.notering,
    });
  }

  // (7) Spara — tabell om den finns, annars lokal kö (och alltid kön som
  //     dev-spegling av senaste ronden).
  let lagringsnotering = "tabell";
  let koSkrivning = { ok: true, fel: null as string | null, antal: 0 };
  if (tabellFinns) {
    try {
      await lasSpara(rader);
    } catch (e) {
      if (e instanceof TabellSaknasFel) {
        tabellFinns = false;
        lagringsnotering = "kö (tabellen försvann mitt i ronden?)";
        koSkrivning = sparaKo(koPoster);
      } else {
        console.error("[cron/oversatt] lagring misslyckades:", e instanceof Error ? e.name : "?");
        lagringsnotering = "MISSLYCKAD — se serverloggen";
      }
    }
  } else {
    lagringsnotering = "kö";
    koSkrivning = sparaKo(koPoster);
  }
  if (!tabellFinns && !koSkrivning.ok) {
    lagringsnotering = "KEN URSLAGEN: vare sig tabell eller skrivbar kö — produktion kräver data/sql/oversattningar.sql";
  }

  // (8) Nervsystemet: OrganEvent + signal till admin vid granskningskö.
  const matt = {
    totaltKallor: kallor.length,
    oversattningsobjekt: kallor.length * MALSPRAK.length,
    nya: nya.length,
    andrade: andrade.length,
    granskas,
    publicerade,
    vantanMotor,
    inaktuellmarkerade,
    batch: batch.length,
    motorAktiv: motorArAktiv,
    tabellFinns,
    termbank: TERMBANK_STORLEK,
  };
  await publiceraOrganEvent({ source: "organ/oversattning", verb: "rapport", matt });
  if (granskas > 0) {
    await publiceraSignal({
      kalla: "oversattning",
      typ: "varning",
      rubrik: "Översättningsgranskning väntar",
      text: `${granskas} maskinutkast i granskningskön — se data/rapporter/oversattning-SENASTE.md (status utkast/maskinutkast-behovar-granskning).`,
      ikon: "🌍",
      mottagare: "admin",
      lank: "/admin",
    });
  }

  // (9) Rapport — skrivs lokalt där filsystemet tillåter (dokumenterat).
  const rapport = byggRapport({
    startad,
    kallor: kallor.length,
    nya: nya.length,
    andrade: andrade.length,
    batchLog,
    matt,
    lagringsnotering,
    koAntal: koSkrivning.antal,
  });
  let rapportSkriven = true;
  try {
    const kat = path.join(process.cwd(), "data", "rapporter");
    mkdirSync(kat, { recursive: true });
    writeFileSync(path.join(kat, "oversattning-SENASTE.md"), rapport, "utf8");
  } catch {
    rapportSkriven = false; // Vercel: read-only fs — rapporten lever i svaret + organ-event
  }

  return NextResponse.json({
    ok: true,
    ...matt,
    lagring: lagringsnotering,
    koAntal: koSkrivning.antal,
    rapportSkriven,
    rapportSokvag: "data/rapporter/oversattning-SENASTE.md",
    disclaimer: "Pedagogisk analys — inte investeringsråd",
  });
}

// ── Rapportbygge ─────────────────────────────────────────────────────────────

function byggRapport(o: {
  startad: Date;
  kallor: number;
  nya: number;
  andrade: number;
  batchLog: Array<{ scope: string; sprak: string; status: OversattningStatus; poang: number; notering: string }>;
  matt: Record<string, unknown>;
  lagringsnotering: string;
  koAntal: number;
}): string {
  const rader = o.batchLog
    .map((b) => "| `" + b.scope + "` | " + b.sprak + " | `" + b.status + "` | " + String(b.poang) + " | " + b.notering.replace(/\|/g, "\\|") + " |")
    .join("\n");
  return [
    "# MÖS — översättningsrond (SENASTE)",
    "",
    "- **Körd:** " + o.startad.toISOString(),
    "- **Register:** " + String(o.kallor) + " källor → " + String(o.kallor * 2) + " översättningsobjekt (× en/ar)",
    "- **Nya/ändrade:** " + String(o.nya) + " nya, " + String(o.andrade) + " ändrade",
    "- **Denna rond:** " + String(o.batchLog.length) + " objekt bearbetade (batchbudget: motor aktiv 4/rond, inaktiv 80/rond — Vercel Hobby max 1 cron/dag)",
    "- **Lagring:** " + o.lagringsnotering + (o.lagringsnotering === "kö" ? " (fallback data/oversattning-kö.json, " + String(o.koAntal) + " poster — produktion kräver data/sql/oversattningar.sql)" : ""),
    "",
    "## Kvalitetsstatusflöde",
    "",
    "- `publicerad` — 100 poäng (alla 4 kontroller gröna), automatiskt",
    "- `utkast` — 90–99 poäng, maskinutkast väntar mänsklig granskning → `granskad`",
    "- `maskinutkast-behovar-granskning` — < 90 poäng, granskning OBLIGATORISK",
    "- `vantar-motor` — ingen ZAI-nyckel / motorn svarade ej / för lång källa",
    "- `inaktuell` — källan ändrats (kallhash stämmer ej), köas om",
    "",
    "## Rondens objekt",
    "",
    "| Scope | Språk | Status | Poäng | Notering |",
    "|---|---|---|---:|---|",
    rader.length > 0 ? rader : "| (inga objekt denna rond — registret current) | | | | |",
    "",
    "_Genererad av /api/cron/oversatt (MÖS, våg 52) — deterministiskt underlag: termbank med " + String(o.matt.termbank) + " termer + 4 kontroller i src/lib/oversattning/kontroller.ts._",
    "",
  ].join("\n");
}
