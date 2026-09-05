import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import path from "node:path";

import { getSupabaseRest } from "@/lib/supabase-rest";
import { publiceraOrganEvent } from "@/lib/organ-event";
import { MALSPRAK, arMalSprak, listaKallor, type KallaPost, type MalSprak, type ScopeTyp } from "@/lib/oversattning/kalla";
import { korKontroller, KVALITETSTRASKEL, type Kontrollrapport } from "@/lib/oversattning/kontroller";
import { motorAktiv, OVERSATTNING_STATUS, type OversattningStatus } from "@/lib/oversattning/motor";
import {
  TabellSaknasFel,
  dedupeSenasteVinner,
  lasKo,
  lasRad,
  lasRadEfterId,
  lasSpara,
  type MosEventLasRad,
  type OversattningRad,
  type OversattningRadLas,
} from "@/lib/oversattning/lager";
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
 * VÅG 62 (status + kvalitet): (1) GET läser VÅG 55:S EVENTS-BACKEND — saknas
 * tabellen oversattningar räknas i stället MÖS-eventen i system_events
 * (senaste-vinner-dedupe, samma regler som lager.ts) innan fallback-kön över
 * huvud taget övervägs: lagrets verklighet före den lokala dev-speglingen.
 * Sammanfattningen fick KATEGORIBRYTNING per scope_typ (ui/kursblock/blogg) ×
 * språk + "kvar i gratis-kvot"-estimat (ca 5 000 ord/dygn). (2) POST läser
 * sin rad via lager.ts lasRad/lasRadEfterId — granskning/publicering fungerar
 * ALLTID i system_events-läget, precis som speglarna och importören.
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

  // (2) Lägesdetektering + statusräkning. Läsning går direkt mot PostgREST
  //     (lasStatusKarta:s kompositnycklar går inte att entydigt räkna per
  //     språk eftersom kursnycklar innehåller ":").
  //     VÅG 62: saknas tabellen oversattningar läses i stället MÖS-eventen i
  //     system_events (senaste-vinner-dedupe — samma regler som lager.ts) —
  //     sammanfattningen ska visa LAGRETS verklighet, aldrig en åldrad lokal
  //     fallback-kö när det finns riktiga översättningar i events-backenden.
  let lage: "tabell" | "events" | "tabell-saknas" | "ko" = "tabell";
  let lagerFel: string | null = null;
  const raknarePerSprak = new Map<string, StatusRaknare>();
  for (const s of MALSPRAK) raknarePerSprak.set(s, nollRaknare());
  /** Kategoribrytning (våg 62): "typ\u0000språk" → statusräknare. */
  const raknarePerTyp = new Map<string, StatusRaknare>();
  /** Publicerade "typ:nyckel:språk" — underlag till ordkvotestimatet. */
  const publiceradeNycklar = new Set<string>();

  const arStatus = (s: string): s is OversattningStatus =>
    (OVERSATTNING_STATUS as readonly string[]).includes(s);

  /** Räkna en (typ, nyckel, språk, status)-rad i båda sammanfattningarna. */
  function rakna(typ: string | null, nyckel: string | null, sprak: string, status: string): void {
    if (!arStatus(status)) return;
    const rs = raknarePerSprak.get(sprak);
    if (!rs) return;
    rs[status] += 1;
    if (!typ) return;
    const rt = raknarePerTyp.get(typ + "\u0000" + sprak) ?? nollRaknare();
    rt[status] += 1;
    raknarePerTyp.set(typ + "\u0000" + sprak, rt);
    if (status === "publicerad" && nyckel) publiceradeNycklar.add(typ + ":" + nyckel + ":" + sprak);
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
      // 2a. Ljus statusräkning (typ+nyckel+språk+status räcker för KPI-raderna,
      //     kategoribrytningen och ordkvotens publicerade nycklar).
      const statusRader: Array<{ scope_typ?: string | null; scope_nyckel?: string | null; sprak: string; status: string }> = [];
      for (let sidaIx = 0; sidaIx < 40; sidaIx++) {
        const fran = sidaIx * 1000;
        const res = await fetch(
          `${rest.origin}/rest/v1/oversattningar?select=scope_typ,scope_nyckel,sprak,status`,
          {
            headers: { ...rest.headers, Range: `${fran}-${fran + 999}` },
            signal: AbortSignal.timeout(20_000),
          },
        );
        if (!res.ok) await sankaLagerfel(res);
        const rader = (await res.json()) as Array<{ scope_typ: string; scope_nyckel: string; sprak: string; status: string }>;
        statusRader.push(...rader);
        if (rader.length < 1000) break;
      }
      for (const r of statusRader) rakna(r.scope_typ ?? null, r.scope_nyckel ?? null, r.sprak, r.status);

      // 2b. Granskningskön: nyast först, en sida à 50.
      let koUrl =
        `${rest.origin}/rest/v1/oversattningar?select=id,scope_typ,scope_nyckel,sprak,kallhash,text,status,kvalitet,kontrollrapport,uppdaterad` +
        `&status=${statusFilter ? `eq.${encodeURIComponent(statusFilter)}` : `in.(${GRANSKNINGS_STATUS.map((s) => `"${encodeURIComponent(s)}"`).join(",")})`}&order=uppdaterad.desc`;
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

  // (2b′) EVENTS-BACKEND (våg 62): tabellen saknas ⇒ läs MÖS-eventen ur
  //       system_events — ljus projection, senaste-vinner-dedupe (lager.ts:s
  //       ren funktion), retentionstakets 40 sidor à 1 000 rader.
  if (rest && lage === "tabell-saknas") {
    try {
      const eventRader: MosEventLasRad[] = [];
      for (let sidaIx = 0; sidaIx < 40; sidaIx++) {
        const fran = sidaIx * 1000;
        const res = await fetch(
          `${rest.origin}/rest/v1/system_events?type=eq.oversattning` +
            `&select=created_at,details->>scope_typ,details->>scope_nyckel,details->>sprak,details->>status` +
            `&order=created_at.desc`,
          {
            headers: { ...rest.headers, Range: `${fran}-${fran + 999}` },
            signal: AbortSignal.timeout(20_000),
          },
        );
        if (!res.ok) await sankaLagerfel(res);
        const batch = (await res.json()) as MosEventLasRad[];
        eventRader.push(...batch);
        if (batch.length < 1000) break;
      }
      for (const r of dedupeSenasteVinner(eventRader)) {
        rakna(r.scope_typ ?? null, r.scope_nyckel ?? null, r.sprak ?? "", r.status ?? "");
      }
      lage = "events";
    } catch (e) {
      // TabellSaknasFel (heller inga events) ⇒ tabell-saknas-läget kvarstår
      // med fallback-kön nedan; annat fel ⇒ ko-läge med tydlig orsak.
      if (!(e instanceof TabellSaknasFel)) {
        lage = "ko";
        lagerFel = e instanceof Error ? "lagret svarade inte (" + e.name + ")" : "lagret svarade inte";
      }
    }
  }

  // (2b″) Granskningskön i events-läget: de 5 000 nyaste event-raderna MED
  //       text, dedupe → statusfilter → nyast först → sidning i koden.
  //       Fönstret är dokumenterat ärligt: en kö större än fönstret servar de
  //       nyaste sidorna (koTotalt nedan räknas EXAKT ur räkneverket ovan).
  if (rest && lage === "events") {
    const koStatusLista: readonly string[] = statusFilter ? [statusFilter] : GRANSKNINGS_STATUS;
    try {
      const eventRader: MosEventLasRad[] = [];
      for (let sidaIx = 0; sidaIx < 5; sidaIx++) {
        const fran = sidaIx * 1000;
        const res = await fetch(
          `${rest.origin}/rest/v1/system_events?type=eq.oversattning` +
            `&select=created_at,details->>scope_typ,details->>scope_nyckel,details->>sprak,details->>kallhash,details->>text,details->>status,details->>kvalitet,details->>kontrollrapport` +
            `&order=created_at.desc`,
          {
            headers: { ...rest.headers, Range: `${fran}-${fran + 999}` },
            signal: AbortSignal.timeout(20_000),
          },
        );
        if (!res.ok) await sankaLagerfel(res);
        const batch = (await res.json()) as MosEventLasRad[];
        eventRader.push(...batch);
        if (batch.length < 1000) break;
      }
      koRader = dedupeSenasteVinner(eventRader)
        .filter((r) => typeof r.status === "string" && koStatusLista.includes(r.status))
        .filter((r) => (sprakFilter ? r.sprak === sprakFilter : true))
        .filter((r) => Boolean(r.scope_typ && r.scope_nyckel && r.sprak))
        .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
        .slice((sida - 1) * KO_SIDSTORLEK, sida * KO_SIDSTORLEK)
        .map((r) => ({
          id: undefined,
          scope_typ: r.scope_typ as ScopeTyp,
          scope_nyckel: r.scope_nyckel as string,
          sprak: r.sprak as MalSprak,
          status: r.status as OversattningStatus,
          kvalitet: Number(r.kvalitet ?? 0) || 0, // details->> ger text — tolka
          kallhash: r.kallhash ?? "",
          text: r.text ?? "",
          kontrollrapport: r.kontrollrapport,
          uppdaterad: r.created_at ?? "",
        }));
      // koTotalt ur räkneverket (exakt — hela events-databasen är räknad).
      koTotalt = 0;
      for (const status of koStatusLista) {
        for (const [sprak, r] of raknarePerSprak) {
          if (!sprakFilter || sprak === sprakFilter) koTotalt += r[status as OversattningStatus] ?? 0;
        }
      }
    } catch {
      // Kö-läsningen misslyckades men räkneverket fungerar — visa tom kö,
      // aldrig krasch (sammanfattningen bär täckningen).
      koRader = [];
      koTotalt = 0;
    }
  }

  // (2c) Fallback: lokala kön (data/oversattning-kö.json) — dev-läge utan
  //     varken tabell eller events (alltså INTE när events-backenden svarar).
  if (lage === "tabell-saknas" || lage === "ko") {
    for (const p of lasKo()) rakna(p.scope_typ, p.scope_nyckel, p.sprak, p.status);
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
      text: "", // fallback-kön bär ingen text — granskning kräver lagret (dokumenteras i panelen)
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
      vantarKvot: number;
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
      vantarKvot: r["vantar-kvot"],
      inaktuell: r.inaktuell,
      utkast: r.utkast,
      kraverGranskning: r["maskinutkast-behovar-granskning"],
      granskad: r.granskad,
      procentPublicerad: totaltKallor > 0 ? Math.round((r.publicerad / totaltKallor) * 100) : 0,
    };
  }

  // (3b) KATEGORIBRYTNING per scope_typ × språk (våg 62) — källunderlaget ur
  //      samma register (listaKallor) som cron-ronden och importören bygger på.
  const kallorPerTyp = new Map<string, { antal: number; ord: number }>();
  const publiceradeOrd: Record<string, number> = {};
  for (const s of MALSPRAK) publiceradeOrd[s] = 0;
  for (const k of kallor) {
    const rad = kallorPerTyp.get(k.scope.typ) ?? { antal: 0, ord: 0 };
    rad.antal += 1;
    const ord = k.text.split(/\s+/).filter(Boolean).length;
    rad.ord += ord;
    kallorPerTyp.set(k.scope.typ, rad);
    for (const s of MALSPRAK) {
      if (publiceradeNycklar.has(k.scope.typ + ":" + k.scope.nyckel + ":" + s)) publiceradeOrd[s] += ord;
    }
  }
  // Typordning = källregistrets kontraktsordning (ui → kurser → blogg); typer
  // som bara finns i lagret (t.ex. framtida "sida") läggs sorterat efter.
  const TYP_ORDNING: readonly string[] = ["ui", "kursblock", "blogg"];
  const typNamn: Record<string, string> = { ui: "Gränssnitt (ui)", kursblock: "Kursblock", blogg: "Blogg", sida: "Sidor", kurs: "Kurser" };
  const typUnion = new Set<string>([...kallorPerTyp.keys()]);
  for (const nyckel of raknarePerTyp.keys()) typUnion.add(nyckel.split("\u0000")[0]);
  const typOrdning = [...typUnion].sort((a, b) => {
    const ia = TYP_ORDNING.indexOf(a);
    const ib = TYP_ORDNING.indexOf(b);
    return (ia === -1 ? TYP_ORDNING.length : ia) - (ib === -1 ? TYP_ORDNING.length : ib) || a.localeCompare(b);
  });

  const perTyp: Record<
    string,
    {
      namn: string;
      totaltKallor: number;
      publiceradTotalt: number;
      procentPublicerad: number;
      perSprak: Record<
        string,
        { publicerad: number; granskningsKo: number; vantarMotor: number; vantarKvot: number; inaktuell: number; procentPublicerad: number }
      >;
    }
  > = {};
  for (const typ of typOrdning) {
    const totaltTyp = kallorPerTyp.get(typ)?.antal ?? 0;
    const perSprakTyp: Record<
      string,
      { publicerad: number; granskningsKo: number; vantarMotor: number; vantarKvot: number; inaktuell: number; procentPublicerad: number }
    > = {};
    let publiceradTotalt = 0;
    for (const s of MALSPRAK) {
      const r = raknarePerTyp.get(typ + "\u0000" + s) ?? nollRaknare();
      publiceradTotalt += r.publicerad;
      perSprakTyp[s] = {
        publicerad: r.publicerad,
        granskningsKo: r.utkast + r.granskad + r["maskinutkast-behovar-granskning"],
        vantarMotor: r["vantar-motor"],
        vantarKvot: r["vantar-kvot"],
        inaktuell: r.inaktuell,
        procentPublicerad: totaltTyp > 0 ? Math.round((r.publicerad / totaltTyp) * 100) : 0,
      };
    }
    perTyp[typ] = {
      namn: typNamn[typ] ?? typ,
      totaltKallor: totaltTyp,
      publiceradTotalt,
      procentPublicerad: totaltTyp > 0 ? Math.round((publiceradTotalt / (totaltTyp * MALSPRAK.length)) * 100) : 0,
      perSprak: perSprakTyp,
    };
  }

  // (3c) "KVAR I GRATIS-KVOT"-ESTIMAT (våg 62): MyMemory-gratisnivån räknas
  //      ca 5 000 ord/dygn — dagar kvar = ord kvar / ord per dygn. Ord kvar =
  //      källregistrets ord för källor som ännu inte är publicerade, per språk
  //      (varje källa översätts en gång per målspråk). Estimat, ej löfte.
  const IGRATIS_ORD_PER_DYGN = 5000;
  let totaltOrd = 0;
  for (const t of kallorPerTyp.values()) totaltOrd += t.ord;
  const kvot = {
    ordPerDygn: IGRATIS_ORD_PER_DYGN,
    perSprak: {} as Record<string, { ordKvar: number; dagarKvar: number }>,
    ordKvar: 0,
    dagarKvar: 0,
    notering:
      "estimat — gratisnivån (MyMemory) räknas ca " + String(IGRATIS_ORD_PER_DYGN) + " ord/dygn; dagar kvar = ord kvar / ord per dygn",
  };
  for (const s of MALSPRAK) {
    const ordKvar = Math.max(0, totaltOrd - (publiceradeOrd[s] ?? 0));
    kvot.perSprak[s] = { ordKvar, dagarKvar: Math.ceil(ordKvar / IGRATIS_ORD_PER_DYGN) };
    kvot.ordKvar += ordKvar;
  }
  kvot.dagarKvar = Math.ceil(kvot.ordKvar / IGRATIS_ORD_PER_DYGN);

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
      perTyp,
      kvot,
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
        error:
          "Supabase ej konfigurerat — granskningsåtgärder kräver lagret (tabellen oversattningar ELLER system_events; kör data/sql/oversattningar.sql för bästa läget).",
      },
      { status: 503 },
    );
  }

  // Läs aktuell rad via LAGRET (våg 62): lasRad/lasRadEfterId hanterar båda
  // backends (tabell + system_events) med senaste-vinner-semantik — och all
  // skrivning går sedan via lager.ts lasSpara, samma som cronden/importören.
  let rad: OversattningRadLas | null = null;
  try {
    if (id !== null) {
      rad = await lasRadEfterId(id); // id:n är tabellfödda — events-rader nyttjar scope-tuppeln
    } else {
      if (!scope_typ || !SCOPTYPER.includes(scope_typ) || !scope_nyckel || !arMalSprak(sprakRaw)) {
        return NextResponse.json(
          { error: "id (numeriskt) eller scope_typ + scope_nyckel + sprak (en|ar) krävs." },
          { status: 400 },
        );
      }
      rad = await lasRad(scope_typ, scope_nyckel, sprakRaw);
    }
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
          ") — kontrollera att cron-ronden/batchen körts och att objektet finns i lagret (tabell eller system_events).",
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
