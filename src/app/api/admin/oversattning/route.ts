import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import path from "node:path";

import { getSupabaseRest } from "@/lib/supabase-rest";
import { publiceraOrganEvent } from "@/lib/organ-event";
import { MALSPRAK, arMalSprak, listaKallor, type KallaPost, type MalSprak, type ScopeTyp } from "@/lib/oversattning/kalla";
import { korKontroller, KVALITETSTRASKEL, type Kontrollrapport } from "@/lib/oversattning/kontroller";
import { motorAktiv, OVERSATTNING_STATUS, type OversattningStatus } from "@/lib/oversattning/motor";
import { TabellSaknasFel, lasKo, lasSpara, type OversattningRad } from "@/lib/oversattning/lager";
import { TERMBANK_STORLEK } from "@/lib/oversattning/termbank";
import { lasTermbankTillagg } from "@/lib/oversattning-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/admin/oversattning — MÖS-granskningspanelens API (Våg 52 agent C).
 *
 * Kunddirektiv: "vi måste garantera att översättningen har också rätt
 * översättning" — MÄNNISKOKONTROLLEN är byggd i systemet, inte en eftertanke.
 * Denna rutt är granskarens arbetsbänk mot samma sanningslager som cronden
 * (/api/cron/oversatt) skriver i: tabellen oversattningar via
 * src/lib/oversattning/lager.ts (ALL skrivning går via lagret).
 *
 * GET ?sprak=en|ar & status=<status> & sida=N
 *   → sammanfattning per språk+status, granskningskö (nyast först, 50/sida),
 *     termbankens storlek, senaste cron-rapport (data/rapporter/
 *     oversattning-SENASTE.md) samt motorläget (ZAI aktiv/inaktiv).
 *
 * POST { action: "godkann"|"publicera"|"avslå"|"redigera", id?|scope+sprak,
 *        text?, force? }
 *   - redigera: ny text + OMKÖRNING av korKontroller — kvalitetspoängen är
 *     ÄRLIG även för mänskliga ändringar (mänskligt redigerad text återgår i
 *     granskningsflödet; publicering är alltid ett explicit steg).
 *   - publicera: poäng < KVALITETSTRASKEL ⇒ 409-varning — tillåtet endast med
 *     force:true (människan kan övertrumfa maskinen, men aldrig tyst).
 *   - godkann → "granskad"; avslå → "inaktuell" + notis (OrganEvent i
 *     nervsystemet, samma mönster som /api/admin/fas2-access).
 *
 * SKYDD: ADMIN_PASSWORD på servern (x-admin-password | Authorization: Bearer
 * | body.adminPassword), timing-säker jämförelse, endast misslyckade försök
 * rate-limitas (10/min/process) — exakt mönstret från /api/admin/beteende.
 *
 * GRACEFUL NEDBRYTNING: saknas tabellen (TabellSaknasFel) svarar rutten med
 * lage "tabell-saknas" + instruktion "kör data/sql/oversattningar.sql" och
 * speglar i stället lokala fallback-kön — panelen visar konfigurationskort,
 * aldrig krasch. Skrivåtgärder kräver tabellen (fallback-kön saknar textfält
 * — en publicering utan bestående text vore lögn, inte graceful).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── Admin-skydd (mönster från /api/admin/beteende) ───────────────────────────

const misslyckade: number[] = [];
const MAX_MISSLYCKADE_PER_MIN = 10;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function utdragLosenord(req: NextRequest, body: Record<string, unknown>): string {
  const urHeader = req.headers.get("x-admin-password");
  if (urHeader) return urHeader;
  const bearer = req.headers.get("authorization");
  if (bearer?.startsWith("Bearer ")) return bearer.slice(7);
  const urBody = body.adminPassword;
  return typeof urBody === "string" ? urBody : "";
}

function kontrolleraAdmin(req: NextRequest, body: Record<string, unknown>): NextResponse | null {
  const expected = process.env.ADMIN_PASSWORD || "AK1A-2026";
  const provided = utdragLosenord(req, body);

  const now = Date.now();
  while (misslyckade.length && now - misslyckade[0] > 60_000) misslyckade.shift();
  if (misslyckade.length >= MAX_MISSLYCKADE_PER_MIN) {
    return NextResponse.json(
      { error: "För många felaktiga försök — vänta en minut." },
      { status: 429 },
    );
  }
  if (!provided || !timingSafeEqual(provided, expected)) {
    misslyckade.push(now);
    return NextResponse.json({ error: "Admin-lösenord krävs (x-admin-password)." }, { status: 401 });
  }
  return null;
}

// ── Typer (svaret till panelen) ──────────────────────────────────────────────

/** Statusvärden som utgör granskningskön (maskinutkast i alla lägen + granskade som väntar publicering). */
const GRANSKNINGS_STATUS: readonly OversattningStatus[] = [
  "utkast",
  "maskinutkast-behovar-granskning",
  "granskad",
];

const KO_SIDSTORLEK = 50;

type StatusRaknare = Record<OversattningStatus, number>;

function nollRaknare(): StatusRaknare {
  const r = {} as StatusRaknare;
  for (const s of OVERSATTNING_STATUS) r[s] = 0;
  return r;
}

type KoRadVy = {
  id: number | null;
  scope_typ: ScopeTyp;
  scope_nyckel: string;
  sprak: MalSprak;
  status: OversattningStatus;
  kvalitet: number;
  kallhash: string;
  text: string;
  kontrollrapport: Kontrollrapport | { tom: true } | null;
  uppdaterad: string;
  /** Svensk källtext ur registret (two-column-vyn) — null om källan försvunnit. */
  kalltext: string | null;
  /** true = källan har ändrats sedan översättningen skapades (hash ≠ registrets). */
  kallaAndrad: boolean;
};

type SenasteRond = {
  datum: string | null;
  rapport: string;
} | null;

// ── Hjälpredor ───────────────────────────────────────────────────────────────

function plockaObjekt(rå: unknown): Record<string, unknown> {
  return rå && typeof rå === "object" && !Array.isArray(rå) ? (rå as Record<string, unknown>) : {};
}

/** Tabell-radens rapportkolonn kan vara jsonb-objekt eller sträng — tolkas försiktigt. */
function tolkaRapport(rå: unknown): Kontrollrapport | { tom: true } | null {
  if (rå && typeof rå === "object") {
    const o = rå as Record<string, unknown>;
    if (o.tom === true) return { tom: true };
    if (typeof o.poang === "number" && Array.isArray(o.resultat)) return o as unknown as Kontrollrapport;
    return null;
  }
  if (typeof rå === "string") {
    if (!rå) return null;
    try {
      return tolkaRapport(JSON.parse(rå));
    } catch {
      return null;
    }
  }
  return null;
}

/** Läs senaste cron-rapport (data/rapporter/oversattning-SENASTE.md) — null om ingen rond körts. */
function lasSenasteRapport(): SenasteRond {
  try {
    const fil = path.join(process.cwd(), "data", "rapporter", "oversattning-SENASTE.md");
    const innehall = readFileSync(fil, "utf8");
    const traffad = innehall.match(/\*\*Körd:\*\*\s*(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)/);
    return { datum: traffad ? traffad[1] : null, rapport: innehall };
  } catch {
    return null;
  }
}

/** Målspråkens visningsnamn — MALSPRAK är sanningskällan (framtida språk dyker upp automatiskt). */
const SPRAK_NAMN: Record<string, string> = { en: "Engelska", ar: "Arabiska" };

// ── GET — sammanfattning + granskningskö + termbank + senaste rond ───────────

export async function GET(req: NextRequest) {
  const skyddSvar = kontrolleraAdmin(req, {});
  if (skyddSvar) return skyddSvar;

  const params = req.nextUrl.searchParams;
  const sprakFilter = params.get("sprak");
  if (sprakFilter && !arMalSprak(sprakFilter)) {
    return NextResponse.json({ error: "Ogiltigt sprak (en|ar)." }, { status: 400 });
  }
  const statusFilter = params.get("status");
  if (statusFilter && !(OVERSATTNING_STATUS as readonly string[]).includes(statusFilter)) {
    return NextResponse.json({ error: "Ogiltig status." }, { status: 400 });
  }
  const sida = Math.max(1, Math.floor(Number(params.get("sida")) || 1) || 1);

  // (1) Källregistret — källtexterna till two-column-vyn + totalunderlaget.
  let kallor: readonly KallaPost[] = [];
  let kallfel: string | null = null;
  try {
    kallor = listaKallor();
  } catch {
    kallfel = "källregistret kunde inte läsas (deep-courses.json?) — visa utan källtexter";
  }
  const kallIndex = new Map<string, KallaPost>();
  for (const k of kallor) kallIndex.set(k.scope.typ + ":" + k.scope.nyckel, k);

  const totaltKallor = kallor.length;

  // (2) Lägesdetektering + statusräkning. Tabell läses direkt (läsning får
  //     gå utanför lagret; lasStatusKarta:s kompositnycklar går inte att
  //     entydigt räkna per språk eftersom kursnycklar innehåller ":").
  let lage: "tabell" | "tabell-saknas" | "ko" = "tabell";
  let lagerFel: string | null = null;
  const raknarePerSprak = new Map<string, StatusRaknare>();
  for (const s of MALSPRAK) raknarePerSprak.set(s, nollRaknare());

  /** Räkna en (sprak, status)-rad i sammanfattningen. */
  function rakna(sprak: string, status: string): void {
    const r = raknarePerSprak.get(sprak);
    const nyckel = status as OversattningStatus;
    if (r && (OVERSATTNING_STATUS as readonly string[]).includes(status)) r[nyckel] += 1;
  }

  type KoRadRaa = {
    id?: number;
    scope_typ: ScopeTyp;
    scope_nyckel: string;
    sprak: MalSprak;
    status: OversattningStatus;
    kvalitet: number;
    kallhash: string;
    text?: string;
    kontrollrapport?: unknown;
    uppdaterad: string;
  };

  let koRader: KoRadRaa[] = [];
  let koTotalt = 0;

  const rest = getSupabaseRest();
  if (!rest) {
    lage = "tabell-saknas";
    lagerFel = "Supabase ej konfigurerat (NEXT_PUBLIC_SUPABASE_URL/nyckel saknas i miljön)";
  }

  if (rest && lage === "tabell") {
    try {
      // 2a. Ljus statusräkning (sprak+status räcker för KPI-raderna).
      const statusRader: Array<{ sprak: string; status: string }> = [];
      for (let sidaIx = 0; sidaIx < 40; sidaIx++) {
        const fran = sidaIx * 1000;
        const res = await fetch(
          `${rest.origin}/rest/v1/oversattningar?select=sprak,status`,
          {
            headers: { ...rest.headers, Range: `${fran}-${fran + 999}` },
            signal: AbortSignal.timeout(20_000),
          },
        );
        if (!res.ok) await sankaLagerfel(res);
        const rader = (await res.json()) as Array<{ sprak: string; status: string }>;
        statusRader.push(...rader);
        if (rader.length < 1000) break;
      }
      for (const r of statusRader) rakna(r.sprak, r.status);

      // 2b. Granskningskön: nyast först, en sida à 50.
      const koStatusLista = statusFilter
        ? `eq.${encodeURIComponent(statusFilter)}`
        : `in.(${GRANSKNINGS_STATUS.map((s) => `"${encodeURIComponent(s)}"`).join(",")})`;
      let koUrl =
        `${rest.origin}/rest/v1/oversattningar?select=id,scope_typ,scope_nyckel,sprak,kallhash,text,status,kvalitet,kontrollrapport,uppdaterad` +
        `&status=${koStatusLista}&order=uppdaterad.desc`;
      if (sprakFilter) koUrl += `&sprak=eq.${sprakFilter}`;
      const fran = (sida - 1) * KO_SIDSTORLEK;
      const koRes = await fetch(koUrl, {
        headers: {
          ...rest.headers,
          Range: `${fran}-${fran + KO_SIDSTORLEK - 1}`,
          Prefer: "count=exact",
        },
        signal: AbortSignal.timeout(20_000),
      });
      if (!koRes.ok) await sankaLagerfel(koRes);
      koRader = (await koRes.json()) as KoRadRaa[];
      koTotalt = Number(koRes.headers.get("content-range")?.split("/")[1] ?? "") || koRader.length;
    } catch (e) {
      if (e instanceof TabellSaknasFel) {
        lage = "tabell-saknas";
      } else {
        lage = "ko";
        lagerFel = e instanceof Error ? "lagret svarade inte (" + e.name + ")" : "lagret svarade inte";
      }
    }
  }

  // (2c) Fallback: lokala kön (data/oversattning-kö.json) — dev-läge utan tabell.
  if (lage !== "tabell") {
    for (const p of lasKo()) rakna(p.sprak, p.status);
    const filtrerade = lasKo()
      .filter((p) => (statusFilter ? p.status === statusFilter : (GRANSKNINGS_STATUS as readonly string[]).includes(p.status)))
      .filter((p) => (sprakFilter ? p.sprak === sprakFilter : true))
      .sort((a, b) => (b.uppdaterad || "").localeCompare(a.uppdaterad || ""));
    koTotalt = filtrerade.length;
    koRader = filtrerade.slice((sida - 1) * KO_SIDSTORLEK, sida * KO_SIDSTORLEK).map((p) => ({
      scope_typ: p.scope_typ,
      scope_nyckel: p.scope_nyckel,
      sprak: p.sprak,
      status: p.status,
      kvalitet: p.kvalitet,
      kallhash: p.kallhash,
      text: "", // fallback-kön bär ingen text — granskning kräver tabellen (dokumenteras i panelen)
      kontrollrapport: null,
      uppdaterad: p.uppdaterad,
    }));
  }

  // (3) KPI per språk — andelar räknas mot källregistret (totala källor).
  const perSprak: Record<
    string,
    {
      namn: string;
      dir: "ltr" | "rtl";
      totaltKallor: number;
      publicerad: number;
      granskningsKo: number;
      vantarMotor: number;
      inaktuell: number;
      utkast: number;
      kraverGranskning: number;
      granskad: number;
      procentPublicerad: number;
    }
  > = {};
  for (const s of MALSPRAK) {
    const r = raknarePerSprak.get(s) ?? nollRaknare();
    const granskningsKo = r.utkast + r.granskad + r["maskinutkast-behovar-granskning"];
    perSprak[s] = {
      namn: SPRAK_NAMN[s] ?? String(s).toUpperCase(),
      dir: s === "ar" ? "rtl" : "ltr",
      totaltKallor,
      publicerad: r.publicerad,
      granskningsKo,
      vantarMotor: r["vantar-motor"],
      inaktuell: r.inaktuell,
      utkast: r.utkast,
      kraverGranskning: r["maskinutkast-behovar-granskning"],
      granskad: r.granskad,
      procentPublicerad: totaltKallor > 0 ? Math.round((r.publicerad / totaltKallor) * 100) : 0,
    };
  }

  // (4) Kön med källtexter sammanfogade (two-column-vyn i panelen).
  const ko: KoRadVy[] = koRader.map((r) => {
    const kalla = kallIndex.get(r.scope_typ + ":" + r.scope_nyckel) ?? null;
    return {
      id: typeof r.id === "number" ? r.id : null,
      scope_typ: r.scope_typ,
      scope_nyckel: r.scope_nyckel,
      sprak: r.sprak,
      status: r.status,
      kvalitet: typeof r.kvalitet === "number" ? r.kvalitet : 0,
      kallhash: r.kallhash || "",
      text: typeof r.text === "string" ? r.text : "",
      kontrollrapport: tolkaRapport(r.kontrollrapport),
      uppdaterad: r.uppdaterad || "",
      kalltext: kalla ? kalla.text : null,
      kallaAndrad: kalla ? kalla.hash !== (r.kallhash || "") : false,
    };
  });

  const tillagg = lasTermbankTillagg();

  return NextResponse.json({
    ok: true,
    genererad: new Date().toISOString(),
    motorAktiv: motorAktiv(),
    lage,
    lagerFel,
    konfigurationKravs:
      lage === "tabell-saknas"
        ? {
            rubrik: "Konfiguration krävs: kör SQL-filen",
            instruktion:
              (lagerFel ? lagerFel + ". " : "") +
              "Kör data/sql/oversattningar.sql EN gång i Supabase SQL Editor — utan tabellen köar pipelinen endast " +
              "lokalt (data/oversattning-kö.json) och granskning/publicering kan inte bestå.",
          }
        : null,
    sprakRegister: MALSPRAK.map((s) => ({ id: s, namn: SPRAK_NAMN[s] ?? String(s).toUpperCase(), dir: s === "ar" ? "rtl" : "ltr" })),
    sammanfattning: {
      totaltKallor,
      oversattningsobjekt: totaltKallor * MALSPRAK.length,
      perSprak,
      kallfel,
    },
    ko,
    koSidinfo: { sida, perSida: KO_SIDSTORLEK, totalt: koTotalt, sidor: Math.max(1, Math.ceil(koTotalt / KO_SIDSTORLEK)) },
    termbank: { statiska: TERMBANK_STORLEK, tillagg: tillagg.poster.length },
    senasteRond: lasSenasteRapport(),
    disclaimer: "Pedagogisk analys — inte investeringsråd",
  });
}

/** Tolkar PostgREST-fel till TabellSaknasFel (samma detektering som lager.ts). */
async function sankaLagerfel(res: Response): Promise<never> {
  let orsak = "HTTP " + String(res.status);
  try {
    const kropp = (await res.json()) as { code?: string; message?: string };
    if (kropp?.code === "PGRST205" || res.status === 404) {
      throw new TabellSaknasFel("relationen saknas — " + orsak);
    }
    if (kropp?.message) orsak += " " + String(kropp.message).slice(0, 120);
  } catch (e) {
    if (e instanceof TabellSaknasFel) throw e;
  }
  throw new Error("oversattningar-lagret svarade " + orsak);
}

// ── POST — granskarens åtgärder ──────────────────────────────────────────────

const SCOPTYPER: readonly ScopeTyp[] = ["ui", "sida", "kurs", "kursblock", "blogg"];
const MAX_TEXT_LANGD = 120_000;

export async function POST(req: NextRequest) {
  let kropp: unknown = null;
  try {
    kropp = await req.json();
  } catch {
    kropp = null;
  }
  const body = plockaObjekt(kropp);

  const skyddSvar = kontrolleraAdmin(req, body);
  if (skyddSvar) return skyddSvar;

  const action = typeof body.action === "string" ? body.action : "";
  if (action !== "godkann" && action !== "publicera" && action !== "avslå" && action !== "redigera") {
    return NextResponse.json(
      { error: 'Ogiltig action — använd "godkann" | "publicera" | "avslå" | "redigera".' },
      { status: 400 },
    );
  }
  const force = body.force === true;

  // Identifiera raden: numeriskt id (tabell-id) ELLER scope-tuppel + språk.
  const id = typeof body.id === "number" && Number.isInteger(body.id) && body.id > 0 ? body.id : null;
  const scope_typ = typeof body.scope_typ === "string" ? (body.scope_typ as ScopeTyp) : null;
  const scope_nyckel = typeof body.scope_nyckel === "string" ? body.scope_nyckel.trim() : "";
  const sprakRaw = typeof body.sprak === "string" ? body.sprak : "";

  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json(
      {
        error: "Supabase ej konfigurerat — granskningsåtgärder kräver tabellen oversattningar (kör data/sql/oversattningar.sql).",
      },
      { status: 503 },
    );
  }

  // Läs aktuell rad (läsning direkt; all skrivning går via lager.ts).
  let radUrl = `${rest.origin}/rest/v1/oversattningar?select=id,scope_typ,scope_nyckel,sprak,kallhash,text,status,kvalitet,kontrollrapport&limit=1`;
  if (id !== null) {
    radUrl += `&id=eq.${id}`;
  } else {
    if (!scope_typ || !SCOPTYPER.includes(scope_typ) || !scope_nyckel || !arMalSprak(sprakRaw)) {
      return NextResponse.json(
        { error: "id (numeriskt) eller scope_typ + scope_nyckel + sprak (en|ar) krävs." },
        { status: 400 },
      );
    }
    radUrl +=
      `&scope_typ=eq.${encodeURIComponent(scope_typ)}` +
      `&scope_nyckel=eq.${encodeURIComponent(scope_nyckel)}` +
      `&sprak=eq.${sprakRaw}`;
  }

  type TabellRad = {
    id: number;
    scope_typ: ScopeTyp;
    scope_nyckel: string;
    sprak: MalSprak;
    kallhash: string;
    text: string;
    status: OversattningStatus;
    kvalitet: number;
    kontrollrapport: unknown;
  };
  let rad: TabellRad | null = null;
  try {
    const res = await fetch(radUrl, { headers: rest.headers, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json(
          {
            error: "Tabellen oversattningar saknas — kör data/sql/oversattningar.sql i Supabase SQL Editor först.",
            konfigurationKravs: true,
          },
          { status: 503 },
        );
      }
      return NextResponse.json({ error: "Lagret svarade HTTP " + String(res.status) + "." }, { status: 502 });
    }
    const rader = (await res.json()) as TabellRad[];
    rad = Array.isArray(rader) && rader.length > 0 ? rader[0] : null;
  } catch (e) {
    if (e instanceof TabellSaknasFel) {
      return NextResponse.json({ error: e.message, konfigurationKravs: true }, { status: 503 });
    }
    return NextResponse.json({ error: "Lagret kunde inte läsas — försök igen." }, { status: 502 });
  }

  if (!rad) {
    return NextResponse.json(
      {
        error:
          "Översättningen hittades inte (" +
          (id !== null ? "id " + String(id) : scope_typ + ":" + scope_nyckel + ":" + sprakRaw) +
          ") — kontrollera att cron-ronden körts och att objektet finns i tabellen.",
      },
      { status: 404 },
    );
  }

  // Källtexten — behövs för redigeringens ärliga omkontroll.
  let kalla: KallaPost | null = null;
  try {
    kalla = listaKallor().find((k) => k.scope.typ === rad!.scope_typ && k.scope.nyckel === rad!.scope_nyckel) ?? null;
  } catch {
    kalla = null;
  }
  const kallaAndrad = kalla ? kalla.hash !== rad.kallhash : false;

  let nyStatus: OversattningStatus;
  let nyText = rad.text;
  let nyKvalitet = rad.kvalitet;
  const tolkadRapport = tolkaRapport(rad.kontrollrapport);
  let nyRapport: Kontrollrapport | null = tolkadRapport && !("tom" in tolkadRapport) ? tolkadRapport : null;
  let varning: string | null = null;

  if (action === "redigera") {
    const text = typeof body.text === "string" ? body.text : "";
    if (!text.trim()) {
      return NextResponse.json({ error: "text krävs för action redigera." }, { status: 400 });
    }
    if (text.length > MAX_TEXT_LANGD) {
      return NextResponse.json({ error: "texten är för lång (max " + String(MAX_TEXT_LANGD) + " tecken)." }, { status: 400 });
    }
    if (!kalla) {
      return NextResponse.json(
        {
          error:
            "Källtexten finns inte längre i källregistret — kontrollerna kan inte köras om ärligt. " +
            "Använd publicera med force om objektet ändå ska behållas, eller avslå.",
        },
        { status: 400 },
      );
    }
    // ÄRLIG POÄNG även för mänskliga ändringar: omkontroll med samma fyra
    // kontroller som motorn. En mänsklig redigering återgår i gransknings-
    // flödet (ALDRIG autopublicerad vid 100 — publicering är ett explicit
    // mänskligt steg, se action publicera).
    const rapport = korKontroller(kalla.text, text, rad.sprak);
    nyText = text;
    nyKvalitet = rapport.poang;
    nyRapport = rapport;
    nyStatus = rapport.poang >= KVALITETSTRASKEL ? "utkast" : "maskinutkast-behovar-granskning";
    if (rapport.poang < KVALITETSTRASKEL) {
      varning = "Den redigerade texten fick " + String(rapport.poang) + "/100 — under tröskeln " + String(KVALITETSTRASKEL) + ". Granska kontrollrapporten innan publicering.";
    }
  } else if (action === "godkann") {
    nyStatus = "granskad";
  } else if (action === "publicera") {
    if (nyKvalitet < KVALITETSTRASKEL && !force) {
      return NextResponse.json(
        {
          ok: false,
          varning:
            "Kvalitetspoängen " + String(nyKvalitet) + " ligger under tröskeln " + String(KVALITETSTRASKEL) +
            " — publicering kräver bekräftelse. Skicka om med force:true om människan trots allt intygar innehållet.",
          kraverForce: true,
        },
        { status: 409 },
      );
    }
    nyStatus = "publicerad";
    if (nyKvalitet < KVALITETSTRASKEL) {
      varning = "Publicerad med poäng " + String(nyKvalitet) + " (< " + String(KVALITETSTRASKEL) + ") — administratören har intygat innehållet trots varning (force).";
    }
  } else {
    nyStatus = "inaktuell";
  }

  // ALL skrivning via lagret (upsert på scope_typ+scope_nyckel+sprak).
  const lagrad: OversattningRad = {
    scope_typ: rad.scope_typ,
    scope_nyckel: rad.scope_nyckel,
    sprak: rad.sprak,
    kallhash: rad.kallhash,
    text: nyText,
    status: nyStatus,
    kvalitet: nyKvalitet,
    kontrollrapport: nyRapport ?? { tom: true },
  };
  try {
    await lasSpara([lagrad]);
  } catch (e) {
    if (e instanceof TabellSaknasFel) {
      return NextResponse.json({ error: e.message, konfigurationKravs: true }, { status: 503 });
    }
    return NextResponse.json(
      { error: "Lagring misslyckades — åtgärden genomfördes INTE. Försök igen." },
      { status: 502 },
    );
  }

  // Notis i nervsystemet — samma spår som övriga admin-beslut (fas2-access).
  const notis =
    action === "avslå"
      ? "Avslagen av administratör " + new Date().toISOString() + " — objektet sattes till inaktuell och köas om."
      : action === "publicera"
        ? "Publicerad av administratör " + new Date().toISOString() + (varning ? " (med force trots låg poäng)." : ".")
        : null;
  await publiceraOrganEvent({
    source: "organ/oversattning-admin",
    verb: "beslut",
    matt: {
      action,
      scope: rad.scope_typ + ":" + rad.scope_nyckel,
      sprak: rad.sprak,
      status: nyStatus,
      kvalitet: nyKvalitet,
      ...(notis ? { notis } : {}),
    },
  });

  return NextResponse.json({
    ok: true,
    action,
    id: rad.id,
    scope: rad.scope_typ + ":" + rad.scope_nyckel,
    sprak: rad.sprak,
    status: nyStatus,
    kvalitet: nyKvalitet,
    kontrollrapport: nyRapport,
    kallaAndrad,
    ...(notis ? { notis } : {}),
    ...(varning ? { varning } : {}),
  });
}
