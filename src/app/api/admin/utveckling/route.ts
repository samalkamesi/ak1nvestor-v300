import { NextRequest, NextResponse } from "next/server";
import { readdirSync, readFileSync, statSync, existsSync } from "fs";
import path from "path";

import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * ADMIN UTVECKLING — kundägarens fönster mot hela utvecklingen.
 *
 * VÅG 80c (STYRELSE-ADMIN-MEGA tillägget "VÅG 80c"): kunden vill följa
 * utvecklingen från TELEFONEN — därför svarar ruten nu med TRE nya block
 * utöver radarns (våg 78) fält, som består oförändrat för Utvecklingsradarn:
 *
 *   worklog — senaste ~12 sektionerna ur worklog.md ("## "-rubriker + kropp,
 *             trunkat läsbart; readFileSync med try/catch — filen bundles
 *             via next.config outputFileTracingIncludes på Vercel).
 *   events  — senaste 40 system_events (type/severity/created_at +
 *             message avklippt 120 tkn). Typerna oversattning/termbank_tillagg/
 *             variabel EXKLUDERAS (för stora/känsliga — details lämnas ALDRIG
 *             med i svaret, inga nycklar/översättningstexter läcker) och
 *             räknas i stället per typ i stats.
 *   stats   — oversattningRader + variabelAndringar (count=exact HEAD),
 *             exkluderade typers antal, lagret (radantal i översättnings-
 *             lagret — lasStatusKartas tabell-backend är UNIQUE-per-nyckel,
 *             så HEAD-räkningen Är kartans storlek; tar timeout/haveri ⇒
 *             null = ärligt hoppa) och senaste händelsen överhuvadaget.
 *
 * TAKT (kontraktet): hela svaret bygger < 3 s — alla Supabase-anrop körs
 * PARALLELLT med 2,5 s-tak och hela payloaden memo-cachas 60 s i processen
 * (radar + utveckling panel delar cachen; 60 s = panelens poll-intervall).
 *
 * SKYDD: requireAdmin (ADMIN_PASSWORD via x-admin-password/Bearer, eller
 * signerad sessions-cookie våg 83) — läsning, admin-only.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── Typer (svaret) ───────────────────────────────────────────────────────────

type WorklogSektion = { rubrik: string; dag: string | null; kropp: string };

type HandelseRad = {
  type: string;
  severity: string | null;
  created_at: string;
  message: string;
};

type Stats = {
  oversattningRader: number;
  variabelAndringar: number;
  exkluderadeTyper: { oversattning: number; termbank_tillagg: number; variabel: number };
  lagret: { rader: number } | null;
  senasteHandelse: string | null;
};

type FilInfo = { namn: string; dag: string; kb: number };

// ── Filhjälpare (radarn, våg 78 — oförändrade) ─────────────────────────────

function listaKatalog(dir: string, suffix?: string): FilInfo[] {
  const abs = path.join(process.cwd(), dir);
  if (!existsSync(abs)) return [];
  try {
    return readdirSync(abs)
      .filter((f) => (suffix ? f.endsWith(suffix) : true))
      .map((f) => {
        const fp = path.join(abs, f);
        const st = statSync(fp);
        return { namn: f, dag: st.mtime.toISOString().slice(0, 10), kb: Math.round(st.size / 1024) };
      })
      .sort((a, b) => (a.dag < b.dag ? 1 : -1));
  } catch {
    return [];
  }
}

// ── Worklog — senaste ~12 "## "-sektionerna, trunkat läsbart ────────────────

/** Kroppens maxlängd per sektion — 12 sektioner × 1,6 kB ≈ 20 kB svar. */
const WORKLOG_MAX_KROPP = 1_600;
const WORKLOG_ANTAL_SEKTIONER = 12;

function lasWorklog(): WorklogSektion[] {
  try {
    // Vercel läser bundlade filer — worklog.md följer med via
    // next.config outputFileTracingIncludes (samma mönster som data/-filerna).
    const text = readFileSync(path.join(process.cwd(), "worklog.md"), "utf8");
    const sektioner = text.split(/^## /m).slice(1); // texten före första rubriken är preamble
    return sektioner
      .slice(-WORKLOG_ANTAL_SEKTIONER) // filen är kronologisk — de saste = senaste
      .map((raw) => {
        const nl = raw.indexOf("\n");
        const rubrik = (nl === -1 ? raw : raw.slice(0, nl)).replace(/\r$/, "").trim();
        let kropp = (nl === -1 ? "" : raw.slice(nl + 1)).replace(/\r\n/g, "\n").trim();
        if (kropp.length > WORKLOG_MAX_KROPP) {
          kropp =
            kropp.slice(0, WORKLOG_MAX_KROPP).trimEnd() +
            "\n\n… [trunkerat — hela sektionen lever i worklog.md]";
        }
        const dagMatch = /\b(20\d{2}-\d{2}-\d{2})\b/.exec(rubrik);
        return { rubrik, dag: dagMatch ? dagMatch[1] : null, kropp };
      })
      .reverse(); // senaste först — panelens accordion öppnar rad 0
  } catch {
    return []; // filen saknas/olasbar (t.ex. otillräcklig tracing) ⇒ tomt, aldrig 500
  }
}

// ── system_events — listvy + exakta räkningar ───────────────────────────────

/** Typer som ALDRIG listas (för stora/känsliga) — räknas i stället i stats. */
const EXKLUDERADE_TYPER = ["oversattning", "termbank_tillagg", "variabel"] as const;

/** Tak per nätverksanrop — hela bygget ska klara < 3 s (parallellt). */
const NAT_TAK_MS = 2_500;

type HandelseJson = { type?: unknown; severity?: unknown; created_at?: unknown; message?: unknown };

async function lasEvents(
  rest: NonNullable<ReturnType<typeof getSupabaseRest>>,
): Promise<HandelseRad[]> {
  try {
    const url =
      `${rest.origin}/rest/v1/system_events?select=type,severity,created_at,message` +
      `&type=not.in.(${EXKLUDERADE_TYPER.join(",")})` +
      `&order=created_at.desc,id.desc&limit=40`;
    const res = await fetch(url, { headers: rest.headers, signal: AbortSignal.timeout(NAT_TAK_MS) });
    if (!res.ok) return [];
    const rader = (await res.json()) as HandelseJson[];
    if (!Array.isArray(rader)) return [];
    return rader.map((r) => ({
      type: typeof r.type === "string" ? r.type : "okänd",
      severity: typeof r.severity === "string" ? r.severity : null,
      created_at: typeof r.created_at === "string" ? r.created_at : "",
      // Truncering 120 tkn — details lämnas aldrig, nycklar/texter läcker inte.
      message: typeof r.message === "string" ? r.message.slice(0, 120) : "",
    }));
  } catch {
    return []; // timeout/nätverksfel ⇒ tom lista, takten hålls
  }
}

/** HEAD + Prefer: count=exact ⇒ äkta antal (planned-skattningar redovisas aldrig). */
async function antalExakt(
  rest: NonNullable<ReturnType<typeof getSupabaseRest>>,
  filter: string,
): Promise<number> {
  try {
    const res = await fetch(`${rest.origin}/rest/v1/system_events?select=id&${filter}`, {
      method: "HEAD",
      headers: { ...rest.headers, Prefer: "count=exact" },
      signal: AbortSignal.timeout(NAT_TAK_MS),
    });
    if (!res.ok) return 0;
    return Number(res.headers.get("content-range")?.split("/")[1] ?? 0) || 0;
  } catch {
    return 0;
  }
}

/** Senaste händelsen överhuvadaget (alla typer — inkl. översättningsbatchar). */
async function lasSenasteHandelse(
  rest: NonNullable<ReturnType<typeof getSupabaseRest>>,
): Promise<string | null> {
  try {
    const res = await fetch(
      `${rest.origin}/rest/v1/system_events?select=created_at&order=created_at.desc,id.desc&limit=1`,
      { headers: rest.headers, signal: AbortSignal.timeout(NAT_TAK_MS) },
    );
    if (!res.ok) return null;
    const rader = (await res.json()) as Array<{ created_at?: unknown }>;
    const rad = Array.isArray(rader) ? rader[0] : undefined;
    return typeof rad?.created_at === "string" ? rad.created_at : null;
  } catch {
    return null;
  }
}

/**
 * Lagret = radantalet i översättningslagret. lasStatusKarta (lager.ts) är
 * den kanoniska källan men läser upp till 200 sidor — INTE snabbt. Tabell-
 * backenden är UNIQUE per (scope_typ, scope_nyckel, språk) så en HEAD-räkning
 * ÄR kartans storlek; events-backenden (paginerad dedupe) kan inte räknas
 * billigt ⇒ null (kontraktet: "annars hoppa").
 */
async function lasLager(
  rest: NonNullable<ReturnType<typeof getSupabaseRest>>,
): Promise<{ rader: number } | null> {
  try {
    const res = await fetch(`${rest.origin}/rest/v1/oversattningar?select=scope_typ`, {
      method: "HEAD",
      headers: { ...rest.headers, Prefer: "count=exact" },
      signal: AbortSignal.timeout(NAT_TAK_MS),
    });
    if (!res.ok) return null; // tabellen saknas (events-backend) ⇒ hoppa
    const rader = Number(res.headers.get("content-range")?.split("/")[1] ?? 0) || 0;
    return { rader };
  } catch {
    return null;
  }
}

// ── 60 s memo-cache (hel-payload; radar + panel delar) ──────────────────────

const CACHE_MS = 60_000;

let cacheLovelse: Promise<Record<string, unknown>> | null = null;
let cacheSatt = 0;

/** Allt Supabase-lästa i ett svep — eller nollor/null när lagret ej nås. */
async function lasHandelserOchStats(): Promise<{
  events: HandelseRad[];
  oversattningRader: number;
  variabelRader: number;
  termbankPoster: number;
  variabelAndringar: number;
  senasteHandelse: string | null;
  lagret: { rader: number } | null;
}> {
  const rest = getSupabaseRest();
  if (!rest) {
    // Utan Supabase-konfig: ärliga nollor — worklog/radar-delarna lever kvar.
    return {
      events: [],
      oversattningRader: 0,
      variabelRader: 0,
      termbankPoster: 0,
      variabelAndringar: 0,
      senasteHandelse: null,
      lagret: null,
    };
  }
  return Promise.all([
    lasEvents(rest),
    antalExakt(rest, "type=eq.oversattning"),
    antalExakt(rest, "type=eq.variabel"),
    antalExakt(rest, "type=eq.termbank_tillagg"),
    antalExakt(rest, "type=eq.variabel-andring"),
    lasSenasteHandelse(rest),
    lasLager(rest),
  ]).then(([events, oversattningRader, variabelRader, termbankPoster, variabelAndringar, senasteHandelse, lagret]) => ({
    events,
    oversattningRader,
    variabelRader,
    termbankPoster,
    variabelAndringar,
    senasteHandelse,
    lagret,
  }));
}

async function byggSvar(): Promise<Record<string, unknown>> {
  // – Worklog (fil, synkron och snabb) –
  const worklog = lasWorklog();

  // – system_events + stats (PARALLELLT, varje anrop takat 2,5 s) –
  const {
    events,
    oversattningRader,
    variabelRader,
    termbankPoster,
    variabelAndringar,
    senasteHandelse,
    lagret,
  } = await lasHandelserOchStats();

  const stats: Stats = {
    oversattningRader,
    variabelAndringar,
    exkluderadeTyper: {
      oversattning: oversattningRader,
      termbank_tillagg: termbankPoster,
      variabel: variabelRader,
    },
    lagret,
    senasteHandelse,
  };

  // – Radarns fält (våg 78, oförändrade) –
  // 1 · Portföljforskningssystemet
  const portfoljDir = "data/portfolj-system";
  const manifest = existsSync(path.join(process.cwd(), portfoljDir, "manifest.json"))
    ? JSON.parse(readFileSync(path.join(process.cwd(), portfoljDir, "manifest.json"), "utf8"))
    : null;
  const priser = existsSync(path.join(process.cwd(), portfoljDir, "priser.json"))
    ? JSON.parse(readFileSync(path.join(process.cwd(), portfoljDir, "priser.json"), "utf8"))
    : null;
  const fundamentalaFiler = listaKatalog("data/cache", ".json").filter((f) =>
    f.namn.startsWith("fundamental-"),
  );

  const universAntal = manifest?.branscher
    ? (manifest.branscher as Array<{ bolag?: string[] }>).reduce(
        (sum: number, b) => sum + (b.bolag?.length ?? 0),
        0,
      )
    : null;

  // 2 · AKM2-forskning
  const forskning = listaKatalog("data/forskning", ".md");

  // 3 · Kvalitetsvakten — senaste sektionsstatus
  let kvalitet: { dag: string; sektioner: Array<{ namn: string; status: string }> } | null = null;
  const kvalFil = path.join(process.cwd(), "data", "rapporter", "kvalitetsrapport-SENASTE.md");
  if (existsSync(kvalFil)) {
    const text = readFileSync(kvalFil, "utf8");
    const sektioner = [...text.matchAll(/^## \d+\. (.+?) — \*\*(PASS|FAIL|MANUELL|SKIP)\*\*$/gm)].map(
      (m) => ({ namn: m[1], status: m[2] }),
    );
    kvalitet = { dag: statSync(kvalFil).mtime.toISOString().slice(0, 10), sektioner };
  }

  // 4 · Rapporter (språk, motorvalidering, url-scan)
  const rapporter = listaKatalog("data/rapporter", ".md")
    .filter((f) => !f.namn.startsWith("kvalitetsrapport"))
    .slice(0, 15);

  // 5 · Kurser & quiz — hälsa
  let kurser: { antal: number; quiz: number } | null = null;
  const kursFil = path.join(process.cwd(), "public", "deep-courses.json");
  if (existsSync(kursFil)) {
    try {
      const djup = JSON.parse(readFileSync(kursFil, "utf8")) as Record<
        string,
        { chapters?: Array<{ quiz?: unknown[] }> }
      >;
      let quiz = 0;
      for (const k of Object.values(djup)) {
        for (const kap of k.chapters ?? []) quiz += Array.isArray(kap.quiz) ? kap.quiz.length : 0;
      }
      kurser = { antal: Object.keys(djup).length, quiz };
    } catch {
      kurser = null; // parsfel = hälsoproblem, visas som saknad
    }
  }

  // 6 · Fasplanen ur MEGA-dokumentet (råa tabellrader, statuskolumnen sist)
  let faser: Array<{ fas: string; status: string }> = [];
  const megaFil = path.join(process.cwd(), "MEGA_PROJEKT-PORTFOLJ.md");
  if (existsSync(megaFil)) {
    const text = readFileSync(megaFil, "utf8");
    faser = [...text.matchAll(/^\| \*\*(P\d[^|]*)\*\*[^|]*\|[^|]*\| (✅ 🔄|✅|🔄|⏳|✅ KLAR|🔄 agent pågår|KLAR|agent pågår|kö) \|$/gm)].map(
      (m) => ({ fas: m[1].trim(), status: m[2].trim() }),
    );
    // Fallback: alla tabellrader som börjar på **P
    if (faser.length === 0) {
      faser = [...text.matchAll(/^\| \*\*(P\d[^|]*)\*\*(.*)\| ([^|]*)\|$/gm)].map((m) => ({
        fas: m[1].trim(),
        status: m[3].trim() || "—",
      }));
    }
  }

  return {
    hamtat: new Date().toISOString(),
    worklog,
    events,
    stats,
    portfoljSystemet: {
      universAntal,
      branscher: manifest?.branscher?.length ?? 0,
      fundamentalaFiler: fundamentalaFiler.length,
      priser:
        priser?.nivaer?.map((n: { id: string; namn?: string; prisManad?: number }) => ({
          id: n.id,
          namn: n.namn,
          prisManad: n.prisManad,
        })) ?? [],
      manifestDag: manifest?.skapad ?? null,
    },
    forskning,
    kvalitet,
    rapporter,
    kurser,
    faser,
  };
}

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req); // admin-only läsning (våg 80c-kontraktet)
  if (skydd) return skydd;

  // 60 s memo-cache: pågående bygge återanvänds (panel + radar delar).
  if (!cacheLovelse || Date.now() - cacheSatt >= CACHE_MS) {
    cacheSatt = Date.now();
    cacheLovelse = byggSvar();
  }
  try {
    return NextResponse.json(await cacheLovelse);
  } catch {
    cacheLovelse = null; // oväntat fel ⇒ nästa anrop bygger om
    return NextResponse.json(
      { error: "Kunde inte bygga utvecklingsvyn — försök igen om en stund." },
      { status: 500 },
    );
  }
}
