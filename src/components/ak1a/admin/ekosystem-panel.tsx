"use client";

import * as React from "react";
import {
  Activity,
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardList,
  Database,
  FileText,
  Globe,
  HeartPulse,
  HelpCircle,
  RefreshCw,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { adminHeaders } from "@/lib/admin-klient";

/**
 * EKOSYSTEM-PANELEN — det unifierade kommandobordet (admin-ser ALLT på ett ställe).
 *
 * Användarens direktiv: "B2B ska vara separat sida men båda sidor ska jag som
 * admin kunna se och hantera." Panelen samlar båda världarna under EN flik:
 *
 *   PUBLIK      (a) kroppens puls — /api/kropp, samma källa som KroppsvyKort
 *                   (organens status lever/vilande/okänd, expanderbara 44 px-kort)
 *               (b) datacentralen — senaste dagliga cron-fyllningen ur
 *                   systemflödet (organ/datacache-eventet bär hela måttet:
 *                   sparadeRader/misslyckade — event-carried state transfer)
 *               (c) kurs-statistik — public/deep-courses.json (kurser, kapitel,
 *                   quiz-total, BOKMASTER mot bokkanonens 101 böcker)
 *               (d) kvalitetsvakten — GRÖN/GUL/RÖD ur senaste kvalitetsrapporten
 *                   (verktyg/kvalitetsvakt.mjs): fel + manuella granskningar +
 *                   senaste felen (max 5) + körinstruktion; hämtas via GET
 *                   /api/cron/kvalitet (öppen utan satt CRON_SECRET, dev) eller
 *                   direktlänken /admin?kvalitet=true
 *               (e) kvalitetsrapporternas historik — datum + typ + status ur
 *                   svaret ovan, med systemflödet (type *kvalitet*) som fallback
 *               (f) de 20 senaste systemeventen — /api/admin/stats
 *   PRO (B2B)   (a) analys-anrop 30 d + analysloggen — /api/pro/admin
 *               (b) fas2-ansökningar: antal + senaste — /api/pro/admin
 *               (c) aktiva seats/members per member_type — /api/admin/stats
 *               (d) rapportmallar: 3 konfigurerade — white-label redo
 *
 * UNIONEN — "Ekosystemets hälsa": grön/gul/röd samlad status (grön om alla
 * organ lever + senaste cache-fyllning >40 rader + kurser >300).
 *
 * ARKITEKTUR: panelen lever i admin-sidans klientträd ("use client"-sidan äger
 * flikarna), därför läses all SERVERDATA via befintliga API-routes — fs och
 * cacheStatistik() är server-only och får aldrig dras in i klientbunten.
 * Världsvalen (PUBLIK/PRO) är ren klient-interaktivitet med 44 px-knappar.
 * deep-courses.json är 13 MB och hämtas EN gång per session (module-memo).
 *
 * Kvalitetsrapporterna på disk (data/rapporter/) kan INTE läsas med fs här —
 * panelen lever i klientbunten. Därför hämtas senaste kontrollen via GET
 * /api/cron/kvalitet, som följer repo-standarden (cron/datacache): utan satt
 * CRON_SECRET är rutten öppen (dev/lokal), med satt secret svarar den 401 —
 * då visas i stället körinstruktionen "node verktyg/kvalitetsvakt.mjs".
 * Direktlänken /admin?kvalitet=true triggar kontrollen vid montering
 * (parametern sitter kvar i URL:en när fliken Ekosystem väljs).
 *
 * AK1A-DNA: marin-panel, guld, .hjarlinje, tabular-nums, serif-rubriker.
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── Svarstyper från befintliga routes ────────────────────────────────────────

type OrganStatus = "lever" | "vilande" | "okänd";

type KroppsOrgan = {
  id: string;
  namn: string;
  ikon: string;
  status: OrganStatus;
  senast: string | null;
  sammanfattning: string;
};

type KroppSvar = { genererad?: string; organ?: KroppsOrgan[] };

type EventRad = {
  id?: string;
  type?: string | null;
  severity?: string | null;
  message?: string | null;
  source?: string | null;
  createdAt?: string | null;
};

type StatsSvar = {
  members?: { total?: number; free?: number; premium?: number; pro?: number };
  courses?: { total?: number; deep?: number; shallow?: number };
  totals?: { systemEvents?: number };
  recent?: { events?: EventRad[] };
};

type ProAnalysLoggRad = {
  id: string;
  tid: string | null;
  tickers: string[];
  konfluensPoang: number | null;
  source: string | null;
};

type ProAdminSvar = {
  genererad?: string;
  konfigurerad?: boolean;
  oversikt?: {
    anvandare?: {
      totalt?: number;
      premium?: number;
      pro?: number;
      ovriga?: number;
      senasteLogin?: string | null;
    };
    proAnalysAnrop30d?: number;
    fas2Ansokningar?: { antal?: number; senaste?: string | null };
    aktivaRapportmallar?: number;
  };
  analyslogg?: ProAnalysLoggRad[];
};

type KursStat = { kurser: number; kapitel: number; quiz: number; bokmaster: number };

type DeepKurs = { category?: unknown; chapters?: { quiz?: unknown[] }[] | null };

/** Bokkanonens storlek (data/bokkanon.json: 101 böcker — varav 84 status "kurs").
 *  BOKMASTER-kurserna räknas ur deep-courses.json och ställs mot kanonens storlek. */
const KANONENS_BOCKER = 101;

/** Fullmatningsmål: 12 tickers × 4 motorer (cron/datacache, AKM1-universumet). */
const CACHE_MAL_RADER = 48;

// ── Kurs-statistik — 13 MB hämtas EN gång per session ───────────────────────

let kursStatPromise: Promise<KursStat | null> | null = null;

async function beraknaKursStat(): Promise<KursStat | null> {
  try {
    const res = await fetch("/deep-courses.json", { cache: "force-cache" });
    if (!res.ok) return null;
    const rader = (await res.json()) as Record<string, DeepKurs | undefined>;
    let kurser = 0;
    let kapitel = 0;
    let quiz = 0;
    let bokmaster = 0;
    for (const k of Object.values(rader)) {
      if (!k || typeof k !== "object") continue;
      kurser += 1;
      if (k.category === "BOKMASTER") bokmaster += 1;
      if (Array.isArray(k.chapters)) {
        for (const ch of k.chapters) {
          kapitel += 1;
          if (ch && Array.isArray(ch.quiz)) quiz += ch.quiz.length;
        }
      }
    }
    return kurser > 0 ? { kurser, kapitel, quiz, bokmaster } : null;
  } catch {
    return null; // P8-graceful — panelen visar "—" och unionen sätter kurser=? 
  }
}

function lasKursStat(): Promise<KursStat | null> {
  // single-flight + memo av lyckade läsningar; misslyckade får försöka igen
  kursStatPromise ??= beraknaKursStat().then((r) => {
    if (r === null) kursStatPromise = null;
    return r;
  });
  return kursStatPromise;
}

// ── Småhantverk ──────────────────────────────────────────────────────────────

/** "Xs/min/h/d sedan" — anropas bara med data hämtad EFTER hydrering. */
function tidSedan(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "—";
  const sek = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (sek < 60) return `${sek}s sedan`;
  const min = Math.floor(sek / 60);
  if (min < 60) return `${min} min sedan`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} sedan`;
  return `${Math.floor(h / 24)}d sedan`;
}

const SEVERITY_FARG: Record<string, string> = {
  info: "text-muted-foreground",
  warning: "text-yellow-600 dark:text-yellow-400",
  error: "text-orange-600 dark:text-orange-400",
  critical: "text-red-600 dark:text-red-400",
};

/** Datacentralens senaste fyllning ur eventflödet (organ/datacache, matt JSON). */
type CacheFyllning = {
  tid: string | null;
  sparadeRader: number | null;
  misslyckade: number | null;
  tickers: number | null;
  typer: number | null;
};

function lasCacheFyllning(events: EventRad[]): CacheFyllning | null {
  for (const e of events) {
    if (e.type !== "organ" || typeof e.message !== "string") continue;
    if (!e.message.startsWith("[organ/datacache]")) continue;
    const fyllning: CacheFyllning = {
      tid: e.createdAt ?? null,
      sparadeRader: null,
      misslyckade: null,
      tickers: null,
      typer: null,
    };
    const pil = e.message.indexOf("→");
    if (pil >= 0) {
      try {
        const matt = JSON.parse(e.message.slice(pil + 1).trim()) as Record<string, unknown>;
        const tal = (v: unknown): number | null =>
          typeof v === "number" && Number.isFinite(v) ? v : null;
        fyllning.sparadeRader = tal(matt.sparadeRader);
        fyllning.misslyckade = tal(matt.misslyckade);
        fyllning.tickers = tal(matt.tickers);
        fyllning.typer = tal(matt.typer);
      } catch {
        // trunkerat/ogiltigt mått-JSON — tidpunkten räcker fortfarande
      }
    }
    return fyllning;
  }
  return null;
}

// ── Kvalitetsvakten — kodbokens väktare (verktyg/kvalitetsvakt.mjs) ──────────
//
// Verktyget ägs av ett separat arbetsspår och rutten /api/cron/kvalitet kan
// vara odiftsatt ännu — därför tolkas svaret MEDVETET tolerant (flera tänkbara
// nyckelnamn) och allt faller tillbaka på körinstruktionen. Aldrig kast.

type KvalitetLagge = "gron" | "gul" | "rod";

type KvalitetFelRad = { typ: string; fil: string };

type KvalitetRapportRad = {
  namn: string;
  datum: string | null;
  typ: string;
  lagge: KvalitetLagge | null;
};

type KvalitetResultat = {
  lagge: KvalitetLagge | null;
  antalFel: number | null;
  manuellaGranskningar: number | null;
  korning: string | null;
  fel: KvalitetFelRad[];
  rapporter: KvalitetRapportRad[];
};

const KVALITET_PRICK: Record<
  KvalitetLagge,
  { etikett: string; text: string; prick: string }
> = {
  gron: {
    etikett: "GRÖN",
    text: "text-green-700 dark:text-green-400",
    prick: "bg-bull animate-pulse",
  },
  gul: { etikett: "GUL", text: "text-yellow-700 dark:text-yellow-400", prick: "bg-[#F59E0B]" },
  rod: { etikett: "RÖD", text: "text-red-700 dark:text-red-400", prick: "bg-red-600" },
};

/** "grön"/"GRÖN"/"green"/"ok" → gron … — okänd form ger null. */
function tolkaKvalitetLagge(v: unknown): KvalitetLagge | null {
  if (typeof v !== "string") return null;
  const s = v.toLowerCase().replace(/ö/g, "o").replace(/ä/g, "a").replace(/å/g, "a").trim();
  if (s === "gron" || s === "green" || s === "ok" || s === "pass") return "gron";
  if (s === "gul" || s === "yellow" || s === "warning") return "gul";
  if (s === "rod" || s === "red" || s === "error" || s === "fail") return "rod";
  return null;
}

function lasKvalitetStrang(o: Record<string, unknown>, nycklar: string[]): string | null {
  for (const n of nycklar) {
    const v = o[n];
    if (typeof v === "string" && v.trim() !== "") return v.trim();
  }
  return null;
}

function lasKvalitetTal(o: Record<string, unknown>, nycklar: string[]): number | null {
  for (const n of nycklar) {
    const v = o[n];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

/** Felrader ur flera tänkbara former: objekt[], sträng[] eller {fil:[fel]}. */
function tolkaKvalitetFel(v: unknown): KvalitetFelRad[] {
  const ut: KvalitetFelRad[] = [];
  if (Array.isArray(v)) {
    for (const rad of v) {
      if (rad && typeof rad === "object") {
        const o = rad as Record<string, unknown>;
        const typ = lasKvalitetStrang(o, ["typ", "type", "severity", "regel", "niva"]);
        const fil = lasKvalitetStrang(o, ["fil", "file", "filnamn", "path", "sokvag"]);
        if (typ || fil) ut.push({ typ: typ ?? "okänt fel", fil: fil ?? "okänd fil" });
      } else if (typeof rad === "string" && rad.trim() !== "") {
        // "TS2322: src/lib/x.ts" — typ före kolon, resten som filreferens
        const kolon = rad.indexOf(":");
        ut.push(
          kolon > 0
            ? { typ: rad.slice(0, kolon).trim(), fil: rad.slice(kolon + 1).trim() }
            : { typ: rad.trim(), fil: "okänd fil" },
        );
      }
    }
  } else if (v && typeof v === "object") {
    for (const [fil, innehall] of Object.entries(v as Record<string, unknown>)) {
      const fultext = Array.isArray(innehall) ? innehall.join("; ") : String(innehall);
      ut.push({ typ: fultext.slice(0, 60) || "fel", fil });
    }
  }
  return ut.slice(0, 5);
}

/** Rapportfiler ("kvalitetsrapport-2026-09-01.md") — objekt[] eller sträng[]. */
function tolkaKvalitetRapporter(v: unknown): KvalitetRapportRad[] {
  const ut: KvalitetRapportRad[] = [];
  if (!Array.isArray(v)) return ut;
  for (const rad of v) {
    if (rad && typeof rad === "object") {
      const o = rad as Record<string, unknown>;
      const namn = lasKvalitetStrang(o, ["filnamn", "namn", "fil", "file", "rapport"]);
      if (!namn) continue;
      ut.push({
        namn,
        datum: lasKvalitetStrang(o, ["datum", "tid", "genererad", "senast", "createdAt"]),
        typ: lasKvalitetStrang(o, ["typ", "type", "sort"]) ?? namn.split("-")[0] ?? "kvalitetsrapport",
        lagge: tolkaKvalitetLagge(o.status ?? o.lagge),
      });
    } else if (typeof rad === "string" && rad.trim() !== "") {
      const namn = rad.trim();
      const datumMatch = namn.match(/(\d{4}-\d{2}-\d{2})/);
      ut.push({
        namn,
        datum: datumMatch ? datumMatch[1] : null,
        typ: namn.split("-")[0] ?? "kvalitetsrapport",
        lagge: null,
      });
    }
  }
  return ut;
}

/** Normalisera ruttsvaret — svaret kan ligga kapslat i {resultat:{…}}. */
function tolkaKvalitetSvar(json: unknown): KvalitetResultat | null {
  if (!json || typeof json !== "object") return null;
  const rot = json as Record<string, unknown>;
  const kalla = (
    rot.resultat && typeof rot.resultat === "object" ? rot.resultat : rot
  ) as Record<string, unknown>;
  const resultat: KvalitetResultat = {
    lagge: tolkaKvalitetLagge(kalla.status ?? kalla.lagge ?? kalla.halsa),
    antalFel: lasKvalitetTal(kalla, ["antalFel", "felAntal", "totaltFel", "errors"]),
    manuellaGranskningar: lasKvalitetTal(kalla, [
      "manuellaGranskningar",
      "manuella",
      "granskningar",
      "manualReviews",
    ]),
    korning: lasKvalitetStrang(kalla, ["senasteKorning", "korning", "genererad", "tid", "senast"]),
    fel: tolkaKvalitetFel(
      kalla.felLista ?? kalla.felRader ?? kalla.senasteFel ?? kalla.fel ?? kalla.issues ?? kalla.errors,
    ),
    rapporter: tolkaKvalitetRapporter(kalla.rapporter ?? kalla.historik ?? rot.rapporter),
  };
  const tomt =
    resultat.lagge === null &&
    resultat.antalFel === null &&
    resultat.manuellaGranskningar === null &&
    resultat.fel.length === 0 &&
    resultat.rapporter.length === 0;
  return tomt ? null : resultat;
}

/** Fallback-historik: kvalitetsvaktens loggade körningar i systemflödet. */
function kvalitetHistorikUrEvents(events: EventRad[]): KvalitetRapportRad[] {
  const rader: KvalitetRapportRad[] = [];
  for (const e of events) {
    if (!(e.type ?? "").toLowerCase().includes("kvalitet")) continue;
    const sev = e.severity ?? "info";
    rader.push({
      namn:
        typeof e.message === "string" && e.message !== ""
          ? e.message
          : "kvalitetsvakt-körning",
      datum: e.createdAt ?? null,
      typ: e.type ?? "kvalitet",
      lagge: sev === "critical" || sev === "error" ? "rod" : sev === "warning" ? "gul" : "gron",
    });
  }
  return rader;
}

// ── UNIONEN — ekosystemets samlade hälsa ─────────────────────────────────────

type Kriterium = { etikett: string; detalj: string; ok: boolean | null };
type Halsa = {
  lagge: "gron" | "gul" | "rod";
  etikett: string;
  forklaring: string;
  kriterier: Kriterium[];
};

function beraknaHalsa(
  kropp: KroppSvar | null,
  kroppFel: boolean,
  fyllning: CacheFyllning | null,
  kurser: number | null,
): Halsa {
  const organ = kropp?.organ ?? [];
  const organOk: boolean | null =
    organ.length === 0 ? null : organ.every((o) => o.status === "lever");
  const lever = organ.filter((o) => o.status === "lever").length;
  const cacheOk: boolean | null = fyllning
    ? fyllning.sparadeRader !== null
      ? fyllning.sparadeRader > 40
      : null
    : null;
  const kursOk: boolean | null = kurser !== null ? kurser > 300 : null;

  const kriterier: Kriterium[] = [
    {
      etikett: `Alla organ lever (${lever}/${organ.length || "?"})`,
      detalj:
        organOk === null
          ? "Pulsen kunde inte läsas"
          : organOk
            ? "Hjärtat, hjärnan, sinnena, immunförsvaret, minnet — alla inom kadens"
            : "Minst ett organ vilande eller utan signal",
      ok: organOk,
    },
    {
      etikett: `Cache-fyllning >40 rader${
        fyllning?.sparadeRader !== null && fyllning?.sparadeRader !== undefined
          ? ` (${fyllning.sparadeRader}/${CACHE_MAL_RADER})`
          : ""
      }`,
      detalj: fyllning
        ? `Senaste dagliga fyllningen ${tidSedan(fyllning.tid)}${fyllning.misslyckade !== null ? ` · ${fyllning.misslyckade} misslyckade` : ""}`
        : "Senaste fyllningen utanför de 20 senaste eventen",
      ok: cacheOk,
    },
    {
      etikett: `Kurser >300${kurser !== null ? ` (${kurser.toLocaleString("sv-SE")})` : ""}`,
      detalj: "Kursbiblioteket läst ur deep-courses.json",
      ok: kursOk,
    },
  ];

  const fallerade = kriterier.filter((k) => k.ok === false).length;
  const okanda = kriterier.filter((k) => k.ok === null).length;

  if (kroppFel && organ.length === 0) {
    return {
      lagge: "rod",
      etikett: "RÖD",
      forklaring: "Kroppens puls kan inte läsas — /api/kropp svarar inte.",
      kriterier,
    };
  }
  if (fallerade === 0 && okanda === 0) {
    return {
      lagge: "gron",
      etikett: "GRÖN",
      forklaring: "Alla organ lever, cachen är fylld och biblioteket bär — ekosystemet andas.",
      kriterier,
    };
  }
  if (fallerade >= 2) {
    return {
      lagge: "rod",
      etikett: "RÖD",
      forklaring: `${fallerade} av 3 kriterier fallerar — åtgärda innan nästa rund.`,
      kriterier,
    };
  }
  return {
    lagge: "gul",
    etikett: "GUL",
    forklaring:
      fallerade === 1
        ? "Ett kriterium fallerar — läget är degraderat, inte kritiskt."
        : "Någon signal är okänd (äldre än loggfönstret) — komplettera i respektive flik.",
    kriterier,
  };
}

const ORGAN_PRICK: Record<OrganStatus, { klass: string; etikett: string; titel: string }> = {
  lever: { klass: "bg-bull animate-pulse", etikett: "lever", titel: "Rapporterat inom sin kadens" },
  vilande: { klass: "bg-[#F59E0B]", etikett: "vilande", titel: "Signal finns men är äldre än kadensen" },
  okänd: { klass: "bg-muted-foreground/50", etikett: "okänd", titel: "Ingen signal loggad ännu" },
};

// ── Panelen ──────────────────────────────────────────────────────────────────

/** En lässveps data — ren funktion utan setState (P8-graceful: aldrig kast). */
type Snapshot = {
  kropp: KroppSvar | null;
  kroppFel: boolean;
  stats: StatsSvar | null;
  pro: ProAdminSvar | null;
  kurs: KursStat | null;
};

async function hamtaEkosystem(): Promise<Snapshot> {
  const svar = await Promise.allSettled([
    fetch("/api/kropp", { cache: "no-store", signal: AbortSignal.timeout(8000) }),
    fetch("/api/admin/stats", { cache: "no-store", signal: AbortSignal.timeout(15000) }),
    fetch("/api/pro/admin", { cache: "no-store", headers: adminHeaders(), signal: AbortSignal.timeout(10000) }),
    lasKursStat(),
  ]);

  // (1) Kroppens puls
  let kropp: KroppSvar | null = null;
  let kroppFel = false;
  if (svar[0].status === "fulfilled" && svar[0].value.ok) {
    try {
      kropp = (await svar[0].value.json()) as KroppSvar;
    } catch {
      kroppFel = true;
    }
  } else {
    kroppFel = true;
  }

  // (2) Publika metrics (members per member_type + senaste systemevents)
  let stats: StatsSvar | null = null;
  if (svar[1].status === "fulfilled" && svar[1].value.ok) {
    try {
      stats = (await svar[1].value.json()) as StatsSvar;
    } catch {
      stats = null;
    }
  }

  // (3) B2B-översikten
  let pro: ProAdminSvar | null = null;
  if (svar[2].status === "fulfilled" && svar[2].value.ok) {
    try {
      pro = (await svar[2].value.json()) as ProAdminSvar;
    } catch {
      pro = null;
    }
  }

  // (4) Kurs-statistik (13 MB — memoizerad efter första lyckade hämtning)
  const kurs = svar[3].status === "fulfilled" ? svar[3].value : null;

  return { kropp, kroppFel, stats, pro, kurs };
}

export function EkosystemPanel() {
  const [varld, setVarld] = React.useState<"publik" | "pro">("publik");
  const [laddar, setLaddar] = React.useState(true);
  const [matt, setMatt] = React.useState<string | null>(null);
  const [kropp, setKropp] = React.useState<KroppSvar | null>(null);
  const [kroppFel, setKroppFel] = React.useState(false);
  const [stats, setStats] = React.useState<StatsSvar | null>(null);
  const [pro, setPro] = React.useState<ProAdminSvar | null>(null);
  const [kurs, setKurs] = React.useState<KursStat | null>(null);
  const [oppnadOrgan, setOppnadOrgan] = React.useState<string | null>(null);
  const [kvalitet, setKvalitet] = React.useState<KvalitetResultat | null>(null);
  const [kvalitetFel, setKvalitetFel] = React.useState<string | null>(null);
  const [kvalitetKors, setKvalitetKors] = React.useState(false);
  const kvalitetAutoKord = React.useRef(false);

  /** GET /api/cron/kvalitet utan secret — rutten är öppen i dev (repo-
   *  standard: CRON_SECRET krävs bara när den är satt). 401/404/otolkbart
   *  svar faller tillbaka på körinstruktionen, aldrig ett kast. */
  const korKvalitetskontroll = React.useCallback(async () => {
    setKvalitetKors(true);
    setKvalitetFel(null);
    try {
      const res = await fetch("/api/cron/kvalitet", {
        cache: "no-store",
        signal: AbortSignal.timeout(120000), // kontrollkedjan kan ta ett tag
      });
      if (res.status === 401) {
        setKvalitetFel(
          "Rutten kräver CRON_SECRET — kör vakten lokalt i stället (instruktionen nedan).",
        );
      } else if (res.status === 404) {
        setKvalitetFel(
          "Rutten /api/cron/kvalitet finns inte ännu — kör vakten lokalt tills den är driftsatt.",
        );
      } else if (!res.ok) {
        setKvalitetFel(`Kontrollen misslyckades (HTTP ${res.status}) — försök igen eller kör lokalt.`);
      } else {
        const tolkad = tolkaKvalitetSvar(await res.json());
        if (tolkad === null) {
          setKvalitetFel("Svaret kunde inte tolkas — läs senaste rapporten på disk i stället.");
        } else {
          setKvalitet(tolkad);
        }
      }
    } catch {
      setKvalitetFel("Kontrollen nådde inte fram (timeout eller nätverksfel) — kör lokalt i stället.");
    } finally {
      setKvalitetKors(false);
    }
  }, []);

  // Direktlänk /admin?kvalitet=true → kör kontrollen EN gång när panelen
  // monterats. Fliken Ekosystem måste vara vald — parametern sitter kvar i
  // URL:en, så monteringen (flikbytet) triggar läsningen. Kontrollen
  // fördröjs en tick så att setState aldrig körs synkront i effekten.
  React.useEffect(() => {
    if (kvalitetAutoKord.current) return;
    if (new URLSearchParams(window.location.search).get("kvalitet") !== "true") return;
    kvalitetAutoKord.current = true;
    const t = setTimeout(() => void korKvalitetskontroll(), 0);
    return () => clearTimeout(t);
  }, [korKvalitetskontroll]);

  const applicera = React.useCallback((s: Snapshot) => {
    setKropp(s.kropp);
    setKroppFel(s.kroppFel);
    setStats(s.stats);
    setPro(s.pro);
    setKurs(s.kurs);
    setMatt(new Date().toISOString());
    setLaddar(false);
  }, []);

  React.useEffect(() => {
    let avbruten = false;
    (async () => {
      const s = await hamtaEkosystem();
      if (!avbruten) applicera(s);
    })();
    return () => {
      avbruten = true;
    };
  }, [applicera]);

  const organ = kropp?.organ ?? [];
  const events = stats?.recent?.events ?? [];
  const fyllning = lasCacheFyllning(events);
  const kurserAntal = kurs?.kurser ?? stats?.courses?.total ?? null;
  const halsa = beraknaHalsa(kropp, kroppFel, fyllning, kurserAntal);

  const medlemmar = stats?.members ?? {};
  const aktivaSeats = (medlemmar.premium ?? 0) + (medlemmar.pro ?? 0);
  const oversikt = pro?.oversikt ?? {};
  const analyslogg = (pro?.analyslogg ?? []).slice(0, 5);
  const fas2 = oversikt.fas2Ansokningar ?? {};
  const aiAnalyserIFlodet = events.filter((e) => e.type === "ai_analys_genererad").length;
  const kvalitetHistorik =
    kvalitet !== null && kvalitet.rapporter.length > 0
      ? kvalitet.rapporter
      : kvalitetHistorikUrEvents(events);

  return (
    <div className="space-y-4">
      {/* Marin-panel-rubrikrad */}
      <div className="marin-panel rounded-xl border border-gold/30 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold-soft">
              Ekosystempanelen — ett kommandobord, två världar
            </p>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#EDE6D6]/80">
              Den publika plattformen och PRO (B2B) sida vid sida: puls, datacentral,
              kurser och systemflöde i Publik-läget — analys-anrop, ansökningar, seats
              och rapportmallar i PRO-läget. Allt läses via serverns egna API-router.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="tabular-nums text-[10px] text-[#EDE6D6]/60">
              {matt ? `mätt ${tidSedan(matt)}` : "mäter…"}
            </span>
            <Button
              variant="outline"
              disabled={laddar}
              onClick={() => {
                setLaddar(true);
                void hamtaEkosystem().then(applicera);
              }}
              className="min-h-[44px] border-gold/40 bg-transparent text-gold hover:bg-gold/10 hover:text-gold"
            >
              <RefreshCw className={cn("mr-1 h-4 w-4", laddar && "animate-spin")} />
              Uppdatera
            </Button>
          </div>
        </div>
      </div>

      <div className="hjarlinje" aria-hidden="true" />

      {/* UNIONEN — ekosystemets hälsa (gemensam topp-rad oavsett värld) */}
      <div
        aria-live="polite"
        className={cn(
          "rounded-xl border p-4",
          halsa.lagge === "gron" && "border-bull/40 bg-bull/[0.05]",
          halsa.lagge === "gul" && "border-yellow-600/40 bg-yellow-500/[0.05]",
          halsa.lagge === "rod" && "border-red-500/40 bg-red-500/[0.04]",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "h-3 w-3 rounded-full",
                halsa.lagge === "gron" && "bg-bull animate-pulse",
                halsa.lagge === "gul" && "bg-[#F59E0B]",
                halsa.lagge === "rod" && "bg-red-600",
              )}
              aria-hidden="true"
            />
            <h3 className="font-serif text-lg font-bold">Ekosystemets hälsa</h3>
            <Badge
              variant="outline"
              className={cn(
                "border-current text-[10px] uppercase tracking-wider",
                halsa.lagge === "gron" && "text-green-700 dark:text-green-400",
                halsa.lagge === "gul" && "text-yellow-700 dark:text-yellow-400",
                halsa.lagge === "rod" && "text-red-700 dark:text-red-400",
              )}
            >
              {halsa.etikett}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{halsa.forklaring}</p>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {halsa.kriterier.map((k) => (
            <div
              key={k.etikett}
              className="flex items-start gap-2 rounded-lg border border-border bg-card p-2.5"
            >
              {k.ok === true ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
              ) : k.ok === false ? (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
              ) : (
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold">{k.etikett}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{k.detalj}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Världs-väljaren — PUBLIK + PRO (B2B) */}
      <div role="tablist" aria-label="Välj värld" className="flex flex-wrap gap-2">
        <button
          type="button"
          role="tab"
          aria-selected={varld === "publik"}
          onClick={() => setVarld("publik")}
          className={cn(
            "flex min-h-[44px] items-center gap-2 rounded-xl border px-4 text-xs font-bold uppercase tracking-wider transition-colors",
            varld === "publik"
              ? "border-gold bg-gold/15 text-gold"
              : "border-gold/30 bg-card text-muted-foreground hover:border-gold/60 hover:text-gold",
          )}
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
          Publik
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={varld === "pro"}
          onClick={() => setVarld("pro")}
          className={cn(
            "flex min-h-[44px] items-center gap-2 rounded-xl border px-4 text-xs font-bold uppercase tracking-wider transition-colors",
            varld === "pro"
              ? "border-gold bg-gold/15 text-gold"
              : "border-gold/30 bg-card text-muted-foreground hover:border-gold/60 hover:text-gold",
          )}
        >
          <Building2 className="h-4 w-4" aria-hidden="true" />
          PRO (B2B)
        </button>
      </div>

      {/* ── PUBLIK-läget ── */}
      {varld === "publik" && (
        <div role="tabpanel" className="space-y-4">
          {/* (a) Kroppsvyn — alla organs puls */}
          <div className="rounded-xl border border-gold/20 bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-gold" />
                <h4 className="font-serif text-base font-bold">Kroppsvyn — alla organs puls</h4>
              </div>
              <p className="tabular-nums text-[10px] text-muted-foreground">
                {kropp?.genererad ? `mätt ${tidSedan(kropp.genererad)}` : "mäter…"} · källa: /api/kropp
              </p>
            </div>
            {laddar && organ.length === 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className="h-[44px] animate-pulse rounded-xl border border-gold/20 bg-muted/30"
                  />
                ))}
              </div>
            )}
            {!laddar && kroppFel && organ.length === 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                Pulsen kunde inte läsas just nu — prova Uppdatera om en stund.
              </p>
            )}
            {organ.length > 0 && (
              <>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  {organ.map((o) => {
                    const prick = ORGAN_PRICK[o.status] ?? ORGAN_PRICK.okänd;
                    const arOppnad = oppnadOrgan === o.id;
                    return (
                      <div key={o.id}>
                        <button
                          type="button"
                          onClick={() => setOppnadOrgan(arOppnad ? null : o.id)}
                          aria-expanded={arOppnad}
                          aria-label={`${o.namn} — ${prick.etikett}, senast ${tidSedan(o.senast)}`}
                          title={prick.titel}
                          className="flex min-h-[44px] w-full flex-col items-start gap-1 rounded-xl border border-gold/30 bg-card px-3 py-2 text-left transition-colors hover:border-gold/60"
                        >
                          <span className="flex w-full items-center gap-2">
                            <span className="shrink-0 text-base" aria-hidden="true">
                              {o.ikon}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-xs font-bold">{o.namn}</span>
                            <span
                              className={cn("h-2.5 w-2.5 shrink-0 rounded-full", prick.klass)}
                              aria-hidden="true"
                            />
                          </span>
                          <span className="tabular-nums text-[10px] text-muted-foreground">
                            {o.senast ? `senast: ${tidSedan(o.senast)}` : "senast: okänt"}
                          </span>
                        </button>
                        {arOppnad && (
                          <p className="mt-1 rounded-lg border border-gold/20 bg-gold/5 p-2 text-[11px] leading-snug text-muted-foreground">
                            {o.sammanfattning}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                  {(Object.keys(ORGAN_PRICK) as OrganStatus[]).map((s) => (
                    <span key={s} className="flex items-center gap-1.5">
                      <span className={cn("h-2 w-2 rounded-full", ORGAN_PRICK[s].klass)} aria-hidden="true" />
                      {ORGAN_PRICK[s].etikett}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* (b) Datacentralen — cache-statistik */}
            <div className="rounded-xl border border-gold/20 bg-card p-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-gold" />
                <h4 className="font-serif text-base font-bold">Datacentralen — cachen</h4>
              </div>
              {fyllning ? (
                <div className="mt-3 space-y-1.5">
                  <p className="tabular-nums font-serif text-2xl font-bold">
                    {fyllning.sparadeRader !== null
                      ? fyllning.sparadeRader.toLocaleString("sv-SE")
                      : "—"}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      rader i senaste fyllningen (mål {CACHE_MAL_RADER})
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Senaste dagliga fyllning {tidSedan(fyllning.tid)}
                    {fyllning.tickers !== null && fyllning.typer !== null
                      ? ` · ${fyllning.tickers} tickers × ${fyllning.typer} motorer`
                      : ""}
                    {fyllning.misslyckade !== null ? ` · ${fyllning.misslyckade} misslyckade` : ""}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">
                  Senaste fyllningen ligger utanför de 20 senaste systemeventen —
                  cache-läget är okänt just nu.
                </p>
              )}
              <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
                data/cache fylls av cron 06:00 UTC (fallback /tmp/datacache på Vercel);
                fyra motorer — vagfundament, analys, konfluens, netnet. Måttet läses ur
                organ/datacache-eventet i systemflödet.
              </p>
            </div>

            {/* (c) Kurs-statistik */}
            <div className="rounded-xl border border-gold/20 bg-card p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gold" />
                <h4 className="font-serif text-base font-bold">Kurs-statistik</h4>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Miniraknare etikett="Kurser" varde={kurs?.kurser ?? stats?.courses?.total ?? null} />
                <Miniraknare etikett="Kapitel" varde={kurs?.kapitel ?? null} />
                <Miniraknare etikett="Quiz-frågor" varde={kurs?.quiz ?? null} />
                <Miniraknare
                  etikett={`Kanon-kurser /${KANONENS_BOCKER}`}
                  varde={kurs?.bokmaster ?? null}
                />
              </div>
              {(stats?.courses?.deep !== undefined || stats?.courses?.shallow !== undefined) && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {stats?.courses?.deep ?? 0} djupkurser (&gt;5 000 tecken) ·{" "}
                  {stats?.courses?.shallow ?? 0} väntar autonom expansion
                </p>
              )}
              <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                BOKMASTER-kurserna räknas ur public/deep-courses.json (13 MB — hämtas en
                gång per session) och ställs mot bokkanonens {KANONENS_BOCKER} böcker.
              </p>
            </div>
          </div>

          {/* (d) Kvalitetsvakten — kodbokens väktare */}
          <div className="rounded-xl border border-gold/20 bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold" />
                <h4 className="font-serif text-base font-bold">Kvalitetsvakten</h4>
                {kvalitet?.lagge !== null && kvalitet?.lagge !== undefined ? (
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-current text-[10px] uppercase tracking-wider",
                      KVALITET_PRICK[kvalitet.lagge].text,
                    )}
                  >
                    {KVALITET_PRICK[kvalitet.lagge].etikett}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-current text-[10px] uppercase tracking-wider text-muted-foreground"
                  >
                    ej körd
                  </Badge>
                )}
              </div>
              <p className="tabular-nums text-[10px] text-muted-foreground">
                {kvalitet?.korning ? `kördes ${tidSedan(kvalitet.korning)}` : "ingen kontroll inläst"}{" "}
                · källa: /api/cron/kvalitet
              </p>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <Miniraknare etikett="Fel" varde={kvalitet?.antalFel ?? null} />
              <Miniraknare etikett="Manuella granskningar" varde={kvalitet?.manuellaGranskningar ?? null} />
              <div className="rounded-lg border border-border bg-card p-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Senaste körning
                </p>
                <p className="mt-1 font-serif text-lg font-bold">
                  {kvalitet?.korning ? tidSedan(kvalitet.korning) : "—"}
                </p>
              </div>
            </div>

            {(kvalitet?.fel.length ?? 0) > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Senaste felen (max 5)
                </p>
                {kvalitet?.fel.map((f, i) => (
                  <div
                    key={`${f.fil}-${i}`}
                    className="flex items-center justify-between gap-2 rounded-md border border-border px-2 py-1 text-[11px]"
                  >
                    <Badge variant="outline" className="shrink-0 text-[9px]">
                      {f.typ}
                    </Badge>
                    <span className="min-w-0 flex-1 truncate text-right font-mono" title={f.fil}>
                      {f.fil}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {kvalitetFel && (
              <p className="mt-3 rounded-md border border-yellow-600/40 bg-yellow-500/[0.06] p-2 text-[11px] leading-snug text-yellow-700 dark:text-yellow-400">
                {kvalitetFel}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                Senaste rapport på disk:{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono">
                  data/rapporter/kvalitetsrapport-SENASTE.md
                </code>{" "}
                · manuell körning:{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono">node verktyg/kvalitetsvakt.mjs</code>
              </p>
              <Button
                size="sm"
                variant="outline"
                className="btn-marin min-h-[44px]"
                disabled={kvalitetKors}
                onClick={() => void korKvalitetskontroll()}
              >
                <ShieldCheck className={cn("mr-1 h-4 w-4", kvalitetKors && "animate-pulse")} />
                {kvalitetKors ? "Kontrollerar…" : "Kör manuell kontroll nu"}
              </Button>
            </div>
          </div>

          {/* (e) Kvalitetsrapporter — historik (datum + typ + status) */}
          <div className="rounded-xl border border-gold/20 bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-gold" />
                <h4 className="font-serif text-base font-bold">Kvalitetsrapporter — historik</h4>
              </div>
              <a
                href="/admin?kvalitet=true"
                className="text-[10px] underline decoration-gold/50 underline-offset-2 hover:text-gold"
              >
                direktlänk: /admin?kvalitet=true
              </a>
            </div>
            {kvalitetHistorik.length > 0 ? (
              <div className="mt-3 space-y-1">
                {kvalitetHistorik.slice(0, 10).map((r, i) => (
                  <div
                    key={`${r.namn}-${i}`}
                    className="flex items-center justify-between gap-2 rounded-md border border-border px-2 py-1 text-[11px]"
                  >
                    <span className="min-w-0 flex-1 truncate font-mono" title={r.namn}>
                      {r.namn}
                    </span>
                    <Badge variant="outline" className="shrink-0 text-[9px]">
                      {r.typ}
                    </Badge>
                    {r.lagge !== null ? (
                      <span
                        className={cn(
                          "flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase",
                          KVALITET_PRICK[r.lagge].text,
                        )}
                      >
                        <span
                          className={cn("h-2 w-2 rounded-full", KVALITET_PRICK[r.lagge].prick)}
                          aria-hidden="true"
                        />
                        {KVALITET_PRICK[r.lagge].etikett}
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] text-muted-foreground">status okänd</span>
                    )}
                    <span className="tabular-nums shrink-0 text-[10px] text-muted-foreground">
                      {r.datum ? tidSedan(r.datum) : "—"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Inga kvalitetsrapporter inlästa ännu — kör vakten (
                <code className="rounded bg-muted px-1 py-0.5 font-mono">node verktyg/kvalitetsvakt.mjs</code>)
                eller trigga kontrollen via direktlänken. Historiken visas även ur systemflödet
                så snart vakten loggat sina körningar.
              </p>
            )}
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
              Rapportfilerna skrivs till data/rapporter/ (kvalitetsrapport-&lt;datum&gt;.md) — listan
              hämtas ur /api/cron/kvalitet-svaret när kontrollen körts, med systemflödet som fallback.
            </p>
          </div>

          {/* (f) Senaste systemevents — 20 rader */}
          <div className="rounded-xl border border-gold/20 bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gold" />
                <h4 className="font-serif text-base font-bold">Senaste systemevents</h4>
              </div>
              <p className="tabular-nums text-[10px] text-muted-foreground">
                20 rader
                {stats?.totals?.systemEvents !== undefined &&
                  ` · ${stats.totals.systemEvents.toLocaleString("sv-SE")} totalt`}
              </p>
            </div>
            <ScrollArea className="mt-3 h-[320px]">
              <div className="space-y-1.5 pr-3">
                {events.slice(0, 20).map((e, i) => (
                  <div
                    key={e.id ?? i}
                    className="rounded-md border border-border bg-card p-2 text-[11px]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <Badge variant="outline" className="shrink-0 text-[9px]">
                          {e.type || "okänd"}
                        </Badge>
                        <span
                          className={cn(
                            "shrink-0 font-semibold uppercase",
                            SEVERITY_FARG[e.severity ?? "info"] ?? SEVERITY_FARG.info,
                          )}
                        >
                          {e.severity || "info"}
                        </span>
                      </div>
                      <span className="tabular-nums shrink-0 text-[10px] text-muted-foreground">
                        {tidSedan(e.createdAt)}
                      </span>
                    </div>
                    {e.message && (
                      <p className="mt-1 truncate font-medium">{e.message}</p>
                    )}
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="py-8 text-center text-xs text-muted-foreground">
                    {laddar ? "Läser systemflödet…" : "Inga systemevents kunde läsas."}
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* ── PRO-läget (B2B) ── */}
      {varld === "pro" && (
        <div role="tabpanel" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* (a) B2B-sammanfattning — analys-anrop */}
            <div className="rounded-xl border border-gold/20 bg-card p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gold" />
                <h4 className="font-serif text-base font-bold">B2B-sammanfattning — analys-anrop</h4>
              </div>
              <p className="mt-3 tabular-nums font-serif text-2xl font-bold">
                {(oversikt.proAnalysAnrop30d ?? 0).toLocaleString("sv-SE")}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  PRO-analys-anrop senaste 30 dagarna
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Räknas ur system_events (source pro* eller type=pro_analys) · därutöver{" "}
                {aiAnalyserIFlodet} ai_analys_genererad i det senaste eventflödet.
              </p>
              {analyslogg.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Senaste anropen
                  </p>
                  {analyslogg.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-border px-2 py-1 text-[11px]"
                    >
                      <span className="min-w-0 flex-1 truncate font-mono">
                        {r.tickers.length > 0 ? r.tickers.join(" · ") : (r.source ?? "anrop")}
                      </span>
                      {r.konfluensPoang !== null && (
                        <Badge variant="secondary" className="tabular-nums shrink-0 text-[9px]">
                          KP {r.konfluensPoang}
                        </Badge>
                      )}
                      <span className="tabular-nums shrink-0 text-[10px] text-muted-foreground">
                        {tidSedan(r.tid)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {pro === null && !laddar && (
                <p className="mt-2 text-xs text-muted-foreground">
                  /api/pro/admin kunde inte läsas — prov igen om en stund.
                </p>
              )}
            </div>

            {/* (b) Fas2-ansökningar */}
            <div className="rounded-xl border border-gold/20 bg-card p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gold" />
                <h4 className="font-serif text-base font-bold">Fas 2-ansökningar</h4>
              </div>
              <p className="mt-3 tabular-nums font-serif text-2xl font-bold">
                {(fas2.antal ?? 0).toLocaleString("sv-SE")}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  ansökningar totalt
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Senaste ansökan {tidSedan(fas2.senaste ?? null)}
              </p>
              <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
                Ansökningarna skrivs som system_events (type=fas2_ansokan) och läses i
                sin helhet under fliken Systemevents — namn, nivå och motivering.
              </p>
            </div>

            {/* (c) Aktiva seats / medlemmar per member_type */}
            <div className="rounded-xl border border-gold/20 bg-card p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gold" />
                <h4 className="font-serif text-base font-bold">Aktiva seats och medlemmar</h4>
              </div>
              <p className="mt-3 tabular-nums font-serif text-2xl font-bold">
                {aktivaSeats.toLocaleString("sv-SE")}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  aktiva seats (premium + pro)
                </span>
              </p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                <Miniraknare etikett="Free" varde={medlemmar.free ?? null} />
                <Miniraknare etikett="Premium" varde={medlemmar.premium ?? null} />
                <Miniraknare etikett="Pro" varde={medlemmar.pro ?? null} />
                <Miniraknare etikett="Totalt" varde={medlemmar.total ?? null} />
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                members-tabellen via /api/admin/stats{oversikt.anvandare?.senasteLogin
                  ? ` · senaste B2B-inloggning ${tidSedan(oversikt.anvandare.senasteLogin)}`
                  : ""}
                . Hantera nivåer under fliken Medlemmar.
              </p>
            </div>

            {/* (d) Rapportmallar-status */}
            <div className="rounded-xl border border-gold/20 bg-card p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gold" />
                <h4 className="font-serif text-base font-bold">Rapportmallar</h4>
              </div>
              <p className="mt-3 tabular-nums font-serif text-2xl font-bold">
                {(oversikt.aktivaRapportmallar ?? 3).toLocaleString("sv-SE")}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  mallar konfigurerade — white-label redo
                </span>
              </p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-gold">◆</span> Portföljöversikt (20×5-värmematris)
                </li>
                <li className="flex gap-2">
                  <span className="text-gold">◆</span> Djupanalys-kort per innehav
                </li>
                <li className="flex gap-2">
                  <span className="text-gold">◆</span> Konfluens-sidan (värde-grind-status)
                </li>
              </ul>
              <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                Firmans logo och kolofon — metod- och ansvarsdeklarationen förblir mall-låst.
                Mallstatus hanteras via /api/pro/admin (organ/pro-admin).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Liten siffer ruta — tabular-nums, "—" när värdet saknas. */
function Miniraknare({ etikett, varde }: { etikett: string; varde: number | null }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        {etikett}
      </p>
      <p className="tabular-nums mt-1 font-serif text-lg font-bold">
        {varde !== null ? varde.toLocaleString("sv-SE") : "—"}
      </p>
    </div>
  );
}
