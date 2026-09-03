/**
 * AK1A SIGNAL-BUS — systemens gemensamma andning.
 *
 * Direktiv (MEGA_PLAN V3): "alla system/tjänster skall andas och skickar
 * signaler till varandra". Signal-bussen är den enhetliga kanalen: varje
 * organ (konfluens, vågkartan, net-net, datacentralen, tracern, admin) kan
 * PUBLICERA en signal och varje vy (NotisCenter, Min Sida, admin) kan LÄSA
 * dem — utan att organen behöver känna till varandra.
 *
 * BYGGER PÅ OrganEvent v1 (src/lib/organ-event.ts): varje publicerad signal
 * postas som EN rad i system_events (type="signal", HEL payload i details —
 * event-carried state transfer) OCH ekar som OrganEvent (source
 * "signal/<källa>") så att kroppsvyn/nervsystemet ser den också. BOUNDED av
 * retention-organet (500 rader/30d) — signaler svämmar aldrig.
 *
 * LAGRING OCH FALLBACK:
 *   - Med Supabase: system_events, type="signal" (läs via lasSignaler).
 *   - UTAN Supabase (eller vid läs-fel): lasSignaler returnerar STATISKA
 *     pedagogiska signals (deterministisk tid = dagens midnatt) — bussen
 *     andas även i dev utan konfiguration (samma fail-safe-regel som
 *     organ-motorn).
 *
 * SEKRETESS/PGD: texter är pedagogiska och granskade — inga elevnamn, inga
 * interna vikter (P8). Streak-signaler byggs på KLIENTEN (byggStreakRiskSignal)
 * och publiceras ALDRIG till servern — streak-data är elevens egen.
 *
 * SERVER-SIDE för publicering/läsning; de rena streak-hjälparna är
 * klient-säkra (ingen fetch på modulnivå, inga node-beroenden) och får
 * importeras av notiser/NotisCenter.
 */

import { getSupabaseRest } from "@/lib/supabase-rest";
import { publiceraOrganEvent } from "@/lib/organ-event";
import type { KonfluensRad } from "@/lib/konfluens-motor";
import type { NetnetRad } from "@/lib/netnet-motor";

// ── Publika typer ────────────────────────────────────────────────────────────

/** En signal — ett organs andetag, pedagogiskt formulerat för eleven. */
export type Signal = {
  id: string;
  /** "konfluens" | "vagscan" | "datacache" | "tracer" | "netnet" | "admin" | ... */
  kalla: string;
  typ: "info" | "varning" | "mojlighet" | "beslut";
  /** Kort rubrik (visas i NotisCenter). */
  rubrik: string;
  /** Pedagogisk text — förklarar VAD som hänt och VARFÖR det spelar roll. */
  text: string;
  /** En emoji, t.ex. "🌊" (visas som ikon i notiser). */
  ikon: string;
  /** Intern relativ länk ("/konfluens") — aldrig extern (renLank-validerad). */
  lank?: string;
  /** Epoch-milliseconds när signalen sändes. */
  tid: number;
  /** Vem som ska se signalen (saknas → "alla"). */
  mottagare?: "alla" | "fas2" | "admin";
};

/** Läs-filter — alla fält valfria. mottagare = VEM SOM FRÅGAR (se SYNLIHET). */
export type SignalFilter = {
  kalla?: string;
  typ?: string;
  mottagare?: string;
  maxAntal?: number;
};

/** Tillåtna signal-typer (undviker fritext i bus:en). */
export const SIGNAL_TYPER = ["info", "varning", "mojlighet", "beslut"] as const;

/** Tillåtna mottagare. */
export const SIGNAL_MOTTAGARE = ["alla", "fas2", "admin"] as const;

/**
 * Synlighet monotonisk: en elev i fas 2 ser "alla"+"fas2", admin ser allt,
 * en gäst/nybörjare ser "alla". lasSignalerForElev använder samma tabell.
 */
const SYNLIHET: Record<string, readonly string[]> = {
  alla: ["alla"],
  fas2: ["alla", "fas2"],
  admin: ["alla", "fas2", "admin"],
};

/** Typen av system_events-raden som bussen skriver (EN typ för alla signaler). */
const EVENT_TYP = "signal";

/** Max rader per läsning (boundat — retention-organet städar ändå). */
const MAX_LASNING = 200;

// ── Sanitering (båda vägarna: skriv OCH läs — försvar i djupled) ─────────────

function renStr(v: unknown, max: number): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function arTyp(v: unknown): v is Signal["typ"] {
  return typeof v === "string" && (SIGNAL_TYPER as readonly string[]).includes(v);
}

function arMottagare(v: unknown): v is NonNullable<Signal["mottagare"]> {
  return typeof v === "string" && (SIGNAL_MOTTAGARE as readonly string[]).includes(v);
}

/**
 * Endast interna RELATIVA länkar ("/konfluens") — blockerar "javascript:",
 * externa värdar och protokoll-relativa ("//evil.com") innan UI:t renderar.
 */
function renLank(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return /^\/(?!\/)[^\s]*$/.test(s) && s.length <= 200 ? s : undefined;
}

/** Bygg en giltig Signal ur rå indata (oförutsedd data → dokumenterade standard). */
function renSignal(rå: {
  kalla?: unknown;
  typ?: unknown;
  rubrik?: unknown;
  text?: unknown;
  ikon?: unknown;
  lank?: unknown;
  mottagare?: unknown;
  id?: unknown;
  tid?: unknown;
}): Signal {
  const lank = renLank(rå.lank);
  const mottagare = arMottagare(rå.mottagare) ? rå.mottagare : "alla";
  return {
    id: renStr(rå.id, 80) || nyttId(),
    kalla: renStr(rå.kalla, 40) || "system",
    typ: arTyp(rå.typ) ? rå.typ : "info",
    rubrik: renStr(rå.rubrik, 90) || "Signal",
    text: renStr(rå.text, 400) || "Systemet andas — vidare information finns i vyn.",
    ikon: renStr(rå.ikon, 16) || "📡",
    ...(lank !== undefined ? { lank } : {}),
    tid: typeof rå.tid === "number" && Number.isFinite(rå.tid) ? rå.tid : Date.now(),
    mottagare,
  };
}

/** ID utan beroenden — crypto.randomUUID där den finns, annars tidsstämpel+slump. */
function nyttId(): string {
  const c = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto : null;
  return c ? c.randomUUID() : `sig-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// ── Publicera ────────────────────────────────────────────────────────────────

/**
 * Publicera en signal på bussen.
 *
 * 1. Skriver EN system_events-rad: type="signal", HEL signal i details
 *    (event-carried — läsaren ringer aldrig tillbaka till organet).
 * 2. Ekar som OrganEvent (publiceraOrganEvent, source "signal/<källa>") så
 *    nervsystemet/kroppsvyn ser att organet andades.
 *
 * FAIL-SAFE: kastar ALDRIG — utan Supabase-konfig är skrivningen en no-op
 * (bussen andas vidare lokalt via de statiska signalerna). Returnerar void;
 * anroparen ska inte behöva bry sig om leveransen.
 */
export async function publiceraSignal(s: Omit<Signal, "id" | "tid">): Promise<void> {
  const signal = renSignal(s);

  const rest = getSupabaseRest();
  if (rest) {
    try {
      await fetch(`${rest.origin}/rest/v1/system_events`, {
        method: "POST",
        headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          type: EVENT_TYP,
          severity: signal.typ === "varning" ? "warning" : "info",
          message: `[signal/${signal.kalla}] ${signal.rubrik} — ${signal.text}`.slice(0, 280),
          details: {
            schema: "ak1a-signal/1",
            id: signal.id,
            kalla: signal.kalla,
            typ: signal.typ,
            rubrik: signal.rubrik,
            text: signal.text,
            ikon: signal.ikon,
            ...(signal.lank !== undefined ? { lank: signal.lank } : {}),
            mottagare: signal.mottagare,
          },
          source: `signal/${signal.kalla}`,
        }),
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      // tyst — signalen lever bara lokalt utan konfig
    }
  }

  // Nervsystemets eko (spec: publiceraSignal → publiceraOrganEvent).
  // Beslut-signalen är ett beslut; allt annat är en rapport.
  await publiceraOrganEvent({
    source: `signal/${signal.kalla}`,
    verb: signal.typ === "beslut" ? "beslut" : "rapport",
    matt: {
      signalId: signal.id,
      typ: signal.typ,
      rubrik: signal.rubrik,
      mottagare: signal.mottagare,
    },
  });
}

// ── Läsa ─────────────────────────────────────────────────────────────────────

type EventRad = { details?: Record<string, unknown> | null; created_at?: string | null };

/** system_events-rad → Signal (saniterad); null för ogiltiga rader. */
function radTillSignal(rad: EventRad): Signal | null {
  const d = rad.details;
  if (!d || typeof d !== "object") return null;
  const skapad = typeof rad.created_at === "string" ? Date.parse(rad.created_at) : NaN;
  const signal = renSignal({ ...d, tid: Number.isFinite(skapad) ? skapad : Date.now() });
  return signal;
}

/**
 * Läs senaste signalerna.
 *
 * mottagare = VEM SOM FRÅGAR (inte vad som söks): "alla" → bara publika,
 * "fas2" → publika + fas2, "admin" → allt (se SYNLIHET). Utan Supabase
 * (eller vid läs-fel) returneras de statiska pedagogiska signalerna,
 * filtrerade på samma sätt — bussen andas alltid.
 */
export async function lasSignaler(filter?: SignalFilter): Promise<Signal[]> {
  const maxAntal = Math.max(1, Math.min(filter?.maxAntal ?? 30, 100));
  const synliga = SYNLIHET[filter?.mottagare ?? "alla"] ?? SYNLIHET.alla;

  const passed = (s: Signal): boolean =>
    (!filter?.kalla || s.kalla === filter.kalla) &&
    (!filter?.typ || s.typ === filter.typ) &&
    synliga.includes(s.mottagare ?? "alla");

  // Hämta med marginal (post-filter) men boundat.
  const rest = getSupabaseRest();
  if (rest) {
    try {
      const limit = Math.min(Math.max(maxAntal * 3, 30), MAX_LASNING);
      const res = await fetch(
        `${rest.origin}/rest/v1/system_events?type=eq.${EVENT_TYP}` +
          `&select=details,created_at&order=created_at.desc&limit=${limit}`,
        { headers: rest.headers, cache: "no-store", signal: AbortSignal.timeout(8000) },
      );
      if (res.ok) {
        const rader = (await res.json()) as EventRad[];
        if (Array.isArray(rader)) {
          const signaler = rader
            .map(radTillSignal)
            .filter((s): s is Signal => s !== null)
            .filter(passed)
            .slice(0, maxAntal);
          if (signaler.length > 0 || rader.length > 0) return signaler;
          // 0 rader lästa (= tomt flöde) → statiska som andning tills första
          // publiceringen landar.
        }
      }
    } catch {
      // tyst — fall igenom till statiska signaler
    }
  }
  return statiskaSignaler().filter(passed).slice(0, maxAntal);
}

/**
 * Elevens vy: fas 2-eleven ser publika + fas2-signalerna, alla andra ser
 * bara de publika. Admin-signaler syns ALDRIG för elever.
 */
export async function lasSignalerForElev(fas2: boolean): Promise<Signal[]> {
  return lasSignaler({ mottagare: fas2 ? "fas2" : "alla" });
}

// ── Statiska signaler (fallback utan Supabase / tomt flöde) ──────────────────

/**
 * Dagens andning när flödet är tomt: fyra pedagogiska signaler (en per
 * huvudorgan) med deterministisk tid = dagens lokala midnatt — de känns
 * aktuella varje dag utan att skriva något.
 */
export function statiskaSignaler(): Signal[] {
  const nu = new Date();
  const midnatt = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate()).getTime();
  const tid = Number.isFinite(midnatt) ? midnatt : nu.getTime();

  const bas = (kalla: string, typ: Signal["typ"], ikon: string, rubrik: string, text: string, lank?: string, mottagare: Signal["mottagare"] = "alla"): Signal =>
    ({ id: `statisk-${kalla}-${nu.getFullYear()}-${nu.getMonth() + 1}-${nu.getDate()}`, kalla, typ, rubrik, text, ikon, ...(lank !== undefined ? { lank } : {}), tid, mottagare });

  return [
    bas(
      "vagscan",
      "info",
      "🌊",
      "Vågkartan andas varje dag",
      "Vågkartan mäter fundamentalvågor (V01–V20 × 5 horisonter) för universumet varje dag. Besök vågfundamentet och se om impulsvågor eller korrigeringar dominerar just nu.",
      "/vagfundament",
    ),
    bas(
      "konfluens",
      "mojlighet",
      "🎯",
      "Konfluensradarn står redo",
      "När värdegolvet (Grahams NCAV) och vändande vågor talar samman uppstår konfluens — ekosystemets kärna. Radarn skannar dagligen och signalerar här vid träff.",
      "/konfluens",
      "fas2",
    ),
    bas(
      "netnet",
      "mojlighet",
      "🏦",
      "Net-net-skannern vakar",
      "Bolag som handlas under två tredjedelar av sitt rörelsekapital är Grahams klassiska net-net. Skannern letar varje dag och signalerar vid träff.",
      "/netnet",
      "fas2",
    ),
    bas(
      "datacache",
      "info",
      "💾",
      "Datacentralen andas i tysthet",
      "Dagligen 06:00 förfylls cachen för hela universumet — analyserna serveras ur egen data. Admin-ser den fulla fyllningsstatistiken här.",
      undefined,
      "admin",
    ),
  ];
}

// ── Trigg-hjälpare (routes/cron importerar och anropar EFTER sin körning) ────

/** Max antal tickers som nämns i en aggregerad signaltext. */
const MAX_NAMN_I_TEXT = 5;

/** "VOLV-B.ST, SAAB-B.ST + 3 fler" — deterministisk avkortning. */
function namnlista(namn: string[]): string {
  const visa = namn.slice(0, MAX_NAMN_I_TEXT);
  const rest = namn.length - visa.length;
  return rest > 0 ? `${visa.join(", ")} + ${rest} fler` : visa.join(", ");
}

/**
 * 1. KONFLUENS-HITT — när skannaKonfluens finner klassen
 * "Konfluens — värde möter vändande vågor" sänds EN aggregerad signal
 * (mottagare: fas2). Anropas av konfluens-routen/cron med redan körda rader.
 * Returnerar antalet träffar.
 */
export async function publiceraKonfluensSignaler(rader: KonfluensRad[]): Promise<number> {
  const traffar = (rader ?? []).filter(
    (r) => r && r.klass === "Konfluens — värde möter vändande vågor",
  );
  if (traffar.length === 0) return 0;

  const namn = traffar.map((r) => r.namn?.trim() || r.ticker);
  const basta = traffar
    .slice()
    .sort((a, b) => (b.konfluens ?? 0) - (a.konfluens ?? 0))[0];
  const toppTicker = basta ? (basta.namn?.trim() || basta.ticker) : "";

  await publiceraSignal({
    kalla: "konfluens",
    typ: "mojlighet",
    rubrik: traffar.length === 1 ? `Konfluensträff: ${toppTicker}` : `Konfluensträff: ${traffar.length} bolag`,
    text:
      `${namnlista(namn)} — här möts ekosystemets båda pelare: kursen handlas nära ett ` +
      `värdegolv samtidigt som de fundamentalvågorna vänder upp${basta && basta.konfluens !== null ? ` (konfluenspoäng ${basta.konfluens} av 100)` : ""}. ` +
      `Värdet garanterar nedsidan, vågorna ger timingen. Studera bilden i Konfluensradarn.`,
    ikon: "🎯",
    lank: "/konfluens",
    mottagare: "fas2",
  });
  return traffar.length;
}

/**
 * 2. VÅGKARTAN — daglig signal till ALLA när cron/vagscan ritat dagens karta.
 * Anropas med universum-sammanfattningen ur skanningen. Returnerar true om
 * signalen sändes.
 */
export async function publiceraVagkartaSignal(sum: {
  impulsvag: number;
  korrigering: number;
  basbygge: number;
  osatt: number;
  totalBolag?: number;
}): Promise<boolean> {
  const s = {
    impulsvag: Math.max(0, Math.round(Number(sum?.impulsvag) || 0)),
    korrigering: Math.max(0, Math.round(Number(sum?.korrigering) || 0)),
    basbygge: Math.max(0, Math.round(Number(sum?.basbygge) || 0)),
    osatt: Math.max(0, Math.round(Number(sum?.osatt) || 0)),
  };
  const totalt = Math.max(0, Math.round(Number(sum?.totalBolag) || 0));

  const dominerar = s.impulsvag > s.korrigering ? "impulsvågor" : s.korrigering > s.impulsvag ? "korrigeringar" : "balans";
  await publiceraSignal({
    kalla: "vagscan",
    typ: "info",
    rubrik: "Dagens vågkarta är ritad",
    text:
      `Vågkartan andas: ${s.impulsvag} impulsvågor mot ${s.korrigering} korrigeringar och ${s.basbygge} basbyggen ` +
      `${totalt > 0 ? `över ${totalt} bolag` : "över universumet"} — just nu dominerar ${dominerar}. ` +
      `Impulsvåg betyder tillväxt som bär; korrigering betyder att fundamentet andas ut. Se hela matrisen i vågfundamentet.`,
    ikon: "🌊",
    lank: "/vagfundament",
    mottagare: "alla",
  });
  return true;
}

/**
 * 3. NET-NET-TRÄFF — när net-net-skannern finner klass "net-net" (kurs <
 * 0,667 × NCAV) sänds EN aggregerad signal (mottagare: fas2).
 * Returnerar antalet träffar.
 */
export async function publiceraNetnetSignaler(rader: NetnetRad[]): Promise<number> {
  const traffar = (rader ?? []).filter((r) => r && r.klass === "net-net");
  if (traffar.length === 0) return 0;

  const namn = traffar.map((r) => r.namn?.trim() || r.ticker);
  const rabatt = traffar
    .map((r) => (typeof r.forhallande === "number" && r.forhallande > 0 ? Math.round((1 - r.forhallande) * 100) : null))
    .filter((x): x is number => x !== null)
    .sort((a, b) => b - a)[0];

  await publiceraSignal({
    kalla: "netnet",
    typ: "mojlighet",
    rubrik: traffar.length === 1 ? `Net-net-träff: ${namn[0]}` : `Net-net-träff: ${traffar.length} bolag`,
    text:
      `${namnlista(namn)} handlas under Grahams tröskel — kursen täcker inte ens två tredjedelar av det ` +
      `omsättningsbara rörelsekapitalet${rabatt !== undefined ? ` (upp mot ${rabatt} % rabatt mot NCAV)` : ""}. ` +
      `Det är värdeinvesteringens djupaste värvningsjakt — och alltid värt att fråga VARFÖR marknaden är rädd. Öppna skannern.`,
    ikon: "🏦",
    lank: "/netnet",
    mottagare: "fas2",
  });
  return traffar.length;
}

/**
 * 4. CACHE-FYLLT — datacache-cronens kvitto till ADMIN när dagens fyllning
 * är klar. Anropas sist i /api/cron/datacache.
 */
export async function publiceraCacheFylltSignal(info: {
  totaltSparade: number;
  misslyckade?: number;
  raderTotalt?: number;
}): Promise<void> {
  const sparade = Math.max(0, Math.round(Number(info?.totaltSparade) || 0));
  const fel = Math.max(0, Math.round(Number(info?.misslyckade) || 0));
  const rader = Math.max(0, Math.round(Number(info?.raderTotalt) || 0));

  await publiceraSignal({
    kalla: "datacache",
    typ: fel > 0 ? "varning" : "info",
    rubrik: fel > 0 ? "Datacentralen fyllde cachen — med fel" : "Datacentralen fyllde dagens cache",
    text:
      `Dagens cron-fyllning sparade ${sparade} rader${rader > 0 ? ` (cachen håller nu ${rader} rader totalt)` : ""}` +
      `${fel > 0 ? ` — ${fel} misslyckades och hämtas on-demand vid nästa fråga istället` : " utan fel — motorerna kan servera ur egen data hela dagen"}. ` +
      `"Med tiden söka via vår egen databas": varje dag växer minnet.`,
    ikon: "💾",
    mottagare: "admin",
  });
}

/**
 * 5. TRACER-INSIKT — nya pedagogiska insikter till ADMIN. Anropas av
 * /api/tracer när en elev frivilligt delat sin sammanfattning, eller av
 * admin-flöden som vill larma om ett mönster. Insiktens rubrik/text/ikon
 * återanvänds (tracer.ts Insikt-form); P8/PGD: endast sammanfattad nivå.
 */
export async function publiceraTracerInsiktSignal(insikt: {
  rubrik?: string;
  text?: string;
  ikon?: string;
  elevId?: string;
  aktivTidSek?: number;
  toppIntresse?: string | null;
}): Promise<void> {
  const rubrik = renStr(insikt?.rubrik, 90);
  const text = renStr(insikt?.text, 400);
  const topp = renStr(insikt?.toppIntresse, 30);
  const minuter = Math.max(0, Math.round(Number(insikt?.aktivTidSek) || 0) / 60);

  await publiceraSignal({
    kalla: "tracer",
    typ: "info",
    rubrik: rubrik || "Tracern ser ett mönster",
    text:
      (text || "En elev har delat sin beteendesammanfattning frivilligt — tracern ser ett pedagogiskt mönster.") +
      (minuter >= 1 ? ` Aktiv tid: cirka ${Math.round(minuter)} minuter.` : "") +
      (topp ? ` Toppintresse: ${topp}.` : "") +
      (insikt?.elevId ? ` (Elev ${renStr(insikt.elevId, 64)} — delat frivilligt, endast sammanfattning.)` : ""),
    ikon: renStr(insikt?.ikon, 16) || "🔭",
    mottagare: "admin",
  });
}

// ── 6. STREAK-RISK — elevens egen kedja (KLIENT-sidor; publiceras aldrig) ────

/** Minimal streak-status (member-local.ts Streak-form: antal + "YYYY-MM-DD"). */
export type StreakStatus = { antal: number; senast: string };

/** "risk" börjar räknas när kedjan är värd att rädda (≥ 3 dagar). */
const MIN_STREAK_FOR_RISK = 3;

/** Lokal kalenderdag som "YYYY-MM-DD" (samma semantik som member-local.ts). */
function lokalDagIso(d: Date): string {
  return (
    d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0")
  );
}

export type StreakRisk = {
  /** "aktiv" = räknad idag · "risk" = senast igår, kedjan kan brytas vid midnatt · "bruten". */
  status: "aktiv" | "risk" | "bruten";
  /** Timmar kvar till lokal midnatt när status = "risk" (annars null). */
  timmarKvar: number | null;
};

/**
 * Ren beräkning (deterministisk givet nu): streaken bryts vid midnatt om
 * senaste aktivitet var igår. Körbar på klienten — lasStreak() ur
 * member-local.ts passar rakt in.
 */
export function raknaStreakRisk(s: StreakStatus, nu = Date.now()): StreakRisk {
  const antal = Math.max(0, Math.round(Number(s?.antal) || 0));
  const senast = renStr(s?.senast, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(senast) || antal <= 0) {
    return { status: "bruten", timmarKvar: null };
  }

  const d = new Date(nu);
  const idag = lokalDagIso(d);
  const igar = lokalDagIso(new Date(nu - 86_400_000));

  if (senast >= idag) return { status: "aktiv", timmarKvar: null };
  if (senast === igar) {
    const midnatt = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
    const timmar = Math.max(0, (midnatt - nu) / 3_600_000);
    return { status: "risk", timmarKvar: Math.round(timmar * 10) / 10 };
  }
  return { status: "bruten", timmarKvar: null };
}

/**
 * Bygg streak-risk-signalen för ELEVEN — en lokal Signal (med id/tid) som
 * NotisCenter/notiser renderar direkt. Publiceras ALDRIG till servern:
 * streaken lever i elevens localStorage och lämnar aldrig browsern
 * (samma integritetsgrund som tracerns passiva lyssnande).
 * Returnerar null när kedjan är trygg (aktiv/räknad idag) eller för kort.
 */
export function byggStreakRiskSignal(s: StreakStatus, nu = Date.now()): Signal | null {
  const risk = raknaStreakRisk(s, nu);
  if (risk.status !== "risk") return null;
  const antal = Math.max(0, Math.round(Number(s?.antal) || 0));
  if (antal < MIN_STREAK_FOR_RISK) return null;

  const timmarText =
    risk.timmarKvar !== null && risk.timmarKvar > 0
      ? ` Cirka ${Math.round(risk.timmarKvar)} h kvar innan midnatt.`
      : " Mindre än en timme kvar innan midnatt.";

  return {
    id: nyttId(),
    kalla: "streak",
    typ: "varning",
    rubrik: `Din ${antal}-dagars streak behöver dig ikväll`,
    text:
      `${antal} dagar i rad med närvaro — kedjan bryts vid midnatt om dagen passerar utan ett pass.${timmarText} ` +
      `Ett kort Dagens Pass räcker: glömskekurvan älskar daglig återkomst, och varje dag i kedjan är en vinst redan vunnen.`,
    ikon: "🔥",
    lank: "/dagens-pass",
    tid: nu,
    mottagare: "alla",
  };
}
