import { NextRequest, NextResponse } from "next/server";
import { exec } from "node:child_process";
import { readFileSync } from "node:fs";
import { promisify } from "node:util";

import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execAsync = promisify(exec);

/**
 * ADMIN PULS — "serverns puls" synlig för kundägaren.
 *
 * VÅG 84 BLOCK E (STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 84" §E,
 * STUDIO 100x — observerbarhet): EN delegation på servern samlar hela
 * serverns hälsa i ett enda JSON-svar som Puls-panelen i Utvecklings-
 * panelen renderar (statuskort per pm2-tjänst, RAM/disk-gauge, load-
 * sparkline, cron-lista + fellogg).
 *
 * SÄKERHET (Mimosa bevakar):
 *   · Samtliga shell-kommandon är KOMPILE-TIDS-KONSTANTER i KOMMANDON
 *     nedan — de interpoleras ALDRIG med användardata, filnamn eller
 *     miljövariabler. Ingen request-parameter, cookie eller databasrad
 *     når vägen fram till child_process. Ruten accepterar INGA parametrar.
 *   · requireAdmin (ADMIN_PASSWORD via x-admin-password/Bearer, eller
 *     signerad sessions-cookie våg 83) — läsning, admin-only.
 *   · Feletext från misslyckade kommandon loggas ALDRIG i svaret —
 *     kommandot svarar bara null (se "Fel per kommando = null-fält").
 *
 * ROBUSTHET: varje kommando kör i egen try/catch med 1 500 ms-tak —
 * pm2/df/free/uptime/crontab som saknas (t.ex. Vercel eller Windows-dev)
 * ger null-fält, ALDRIG krasch. Hela svaret memo-cachas 60 s i processen
 * (= panelens poll-intervall, samma mönster som /api/admin/utveckling).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── FASTA kommandon — HELIGA konstanter, aldrig interpolerade ────────────────
// Regeln (block E): child_process exec med FASTA strängar. Dessa sju
// litteraler är de ENDA som når skalet. Ingen strängbygge, ingen mall.
const KOMMANDON = {
  /** pm2:s fullständiga processtabell som JSON (namn/status/cpu/mem/…). */
  pm2: "pm2 jlist",
  /** Rotfilsystemets diskutnyttjande. */
  disk: "df -h /",
  /** RAM i MiB. */
  ram: "free -m",
  /** Load average (1/5/15 min). */
  load: "uptime",
  /** Användarens cron-tabell. */
  crontab: "crontab -l",
  /** Senaste 20 raderna ur ak1a:s pm2-fellogg (block E del 3). */
  fellogg: "pm2 logs ak1a --err --nostream --lines 20",
} as const;

/** Hälso-loggen från cron-jobben — läses som FIL (readFileSync), ej via skalet. */
const HALSA_LOGG = "/var/log/ak1a-halsa.log";

/** Tak per kommando — hela svaret ska vara klart < 2 s (kontraktet). */
const EXEC_TAK_MS = 1_500;
const EXEC_MAX_BUFFER = 2 * 1024 * 1024;

/** 60 s memo-cache i processen (panelen pollar var 60:e sekund). */
const CACHE_MS = 60_000;

// ── Svartyper (panelens kontrakt) ────────────────────────────────────────────

export type PulsTjanst = {
  namn: string;
  status: string;
  cpu: number;
  mem: number; // MB
  uppdaterad: string | null; // ISO för senaste (om)start
  uptimeS: number | null; // sekunder sedan starten
  restarts: number;
};

export type PulsSvar = {
  hamtat: string;
  serverTid: string;
  tjanster: PulsTjanst[] | null;
  disk: { procent: number; anvant: string; totalt: string; tillgangligt: string } | null;
  ram: { anvantMB: number; totaltMB: number; procent: number } | null;
  load: { ett: number; fem: number; femton: number } | null;
  crons: { rader: number; poster: string[]; senasteKorningar: string[] | null } | null;
  fellogg: { rader: string[] } | null;
};

// ── Hjälpare — säker körning + säker tolkning ───────────────────────────────

/** Kör ETT fast kommando → stdout, eller null (timeout/saknas/fel — aldrig kast). */
async function kor(kommando: string): Promise<string | null> {
  try {
    const { stdout } = await execAsync(kommando, {
      timeout: EXEC_TAK_MS,
      maxBuffer: EXEC_MAX_BUFFER,
      windowsHide: true,
    });
    return stdout;
  } catch {
    return null; // kommandot saknas i miljön / tog för lång tid / felade
  }
}

function somTal(text: string | undefined): number | null {
  if (typeof text !== "string" || text.trim() === "") return null;
  // sv_SE/andra lokaler använder decimalkomma ("0,52") — normalisera.
  const n = Number(text.trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

// ── pm2 jlist → tjänstekort ─────────────────────────────────────────────────

type Pm2Rad = {
  name?: unknown;
  pm2_env?: { status?: unknown; pm_uptime?: unknown; restart_time?: unknown };
  monit?: { cpu?: unknown; memory?: unknown };
};

function tolkaPm2(stdout: string): PulsTjanst[] | null {
  try {
    const lista = JSON.parse(stdout) as unknown;
    if (!Array.isArray(lista)) return null;
    const nu = Date.now();
    return lista
      .map((r) => r as Pm2Rad)
      .filter((r) => typeof r.name === "string")
      .map((r) => {
        const start =
          typeof r.pm2_env?.pm_uptime === "number" && r.pm2_env.pm_uptime > 0
            ? (r.pm2_env.pm_uptime as number)
            : null;
        const memBytes = typeof r.monit?.memory === "number" ? (r.monit.memory as number) : 0;
        return {
          namn: String(r.name),
          status: typeof r.pm2_env?.status === "string" ? String(r.pm2_env.status) : "okänd",
          cpu: typeof r.monit?.cpu === "number" ? Math.round(r.monit.cpu as number) : 0,
          mem: Math.round(memBytes / (1024 * 1024)),
          uppdaterad: start !== null ? new Date(start).toISOString() : null,
          uptimeS: start !== null ? Math.max(0, Math.round((nu - start) / 1000)) : null,
          restarts: typeof r.pm2_env?.restart_time === "number" ? (r.pm2_env.restart_time as number) : 0,
        };
      });
  } catch {
    return null; // ogiltig JSON ⇒ ärligt null
  }
}

// ── df -h / → disk ──────────────────────────────────────────────────────────

function tolkaDisk(stdout: string): PulsSvar["disk"] {
  // Letar raden monterad på "/" — tolkas BAKIFRÅN (mountpunkt sist) så att
  // filsystemsnamn med mellanslag (t.ex. "C:/Program Files/Git" i dev)
  // inte förskjuter kolumnerna. Raden "Filesystem …" hoppas över.
  for (const rad of stdout.split("\n").slice(1)) {
    const kol = rad.trim().split(/\s+/);
    if (kol.length < 6) continue;
    if (kol[kol.length - 1] !== "/") continue;
    const procent = Number.parseInt(kol[kol.length - 2], 10); // "38%"
    if (!Number.isFinite(procent)) continue;
    return {
      procent,
      anvant: kol[kol.length - 4],
      totalt: kol[kol.length - 5],
      tillgangligt: kol[kol.length - 3],
    };
  }
  return null;
}

// ── free -m → RAM ───────────────────────────────────────────────────────────

function tolkaRam(stdout: string): PulsSvar["ram"] {
  for (const rad of stdout.split("\n")) {
    if (!/^Mem:/.test(rad)) continue;
    const kol = rad.trim().split(/\s+/).slice(1).map(Number);
    if (kol.length < 3 || !kol.every(Number.isFinite)) return null;
    const [totalt, anvant, , , , tillgangligtMaybe] = kol;
    // "available" (kolumn 6, -m ger MiB) är det ärliga utnyttjandet;
    // utan den gäller used-kolumnen.
    const anvantMB = kol.length >= 6 ? Math.max(0, totalt - tillgangligtMaybe) : anvant;
    return {
      anvantMB,
      totaltMB: totalt,
      procent: totalt > 0 ? Math.round((anvantMB / totalt) * 100) : 0,
    };
  }
  return null;
}

// ── uptime → load average ───────────────────────────────────────────────────

function tolkaLoad(stdout: string): PulsSvar["load"] {
  // Tolka ENDAST svansen efter load-etiketten — engelsk "load average:" eller
  // svensk "belastningsgenomsnitt:" — annars kan dagar/antalanvändare-tal
  // förväxlas med load. sv_SE använder decimalkomma ("0,52, 0,58") som
  // normaliseras till punkt INNAN värdena delas ur svansen.
  const efter = /(?:load average|belastningsgenomsnitt)\s*:?\s*(.*)$/i.exec(stdout);
  const svansRaw = efter !== null ? efter[1] : stdout; // okänd locale ⇒ gamla sättet
  const svans = svansRaw.replace(/(\d),(\d)/g, "$1.$2");
  const tal = svans.split(/[,\s]+/).filter(Boolean).map(somTal).filter((n): n is number => n !== null);
  if (tal.length < 3) return null;
  const [ett, fem, femton] = tal.slice(-3);
  return { ett, fem, femton };
}

// ── crontab -l + hälso-loggen → crons ───────────────────────────────────────

function tolkaCrons(stdout: string): { rader: number; poster: string[] } {
  const rader = stdout
    .split("\n")
    .map((r) => r.replace(/\r$/, ""))
    .filter((r) => r.trim() !== "" && !r.trimStart().startsWith("#"));
  return { rader: rader.length, poster: rader.map((r) => r.slice(0, 160)) };
}

/** Senaste körningstider ur hälso-loggen — null när filen ej är läsbar. */
function lasSenasteKorningar(): string[] | null {
  try {
    const text = readFileSync(HALSA_LOGG, "utf8");
    const tider = [...text.matchAll(/\b(20\d{2}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2})?)\b/g)].map(
      (m) => m[1].replace("T", " "),
    );
    // sista 5 unika, nyast först
    const unika: string[] = [];
    for (const t of tider.reverse()) {
      if (!unika.includes(t)) unika.push(t);
      if (unika.length >= 5) break;
    }
    return unika;
  } catch {
    return null; // oläsbar/saknas (t.ex. Vercel, Windows-dev) ⇒ fältet saknas
  }
}

// ── pm2 logs → fellogg (block E del 3) ──────────────────────────────────────

function tolkaFellogg(stdout: string): { rader: string[] } | null {
  const rader = stdout
    .split("\n")
    .map((r) => r.replace(/\r$/, ""))
    // pm2 skriver "…/ak1a-error.log last 20 lines:"-rubriker — stryk dem
    // (raderna i sig är loggen).
    .filter((r) => r.trim() !== "" && !/last \d+ lines:$/.test(r.trim()))
    .slice(-20)
    .map((r) => r.slice(0, 200)); // truncat 200 tkn/rad (kontraktet)
  if (rader.length === 0) return { rader: [] }; // tom logg = inga fel (inte null)
  return { rader };
}

// ── 60 s memo-cache (hela payloaden) ────────────────────────────────────────

let cacheLovelse: Promise<PulsSvar> | null = null;
let cacheSatt = 0;

async function byggSvar(): Promise<PulsSvar> {
  // EN delegation: alla kommandon PARALLELLT (varje takat 1,5 s ⇒ < 2 s).
  const [pm2Ut, diskUt, ramUt, loadUt, crontabUt, felloggUt] = await Promise.all([
    kor(KOMMANDON.pm2),
    kor(KOMMANDON.disk),
    kor(KOMMANDON.ram),
    kor(KOMMANDON.load),
    kor(KOMMANDON.crontab),
    kor(KOMMANDON.fellogg),
  ]);

  return {
    hamtat: new Date().toISOString(),
    serverTid: new Date().toISOString(),
    tjanster: pm2Ut !== null ? tolkaPm2(pm2Ut) : null,
    disk: diskUt !== null ? tolkaDisk(diskUt) : null,
    ram: ramUt !== null ? tolkaRam(ramUt) : null,
    load: loadUt !== null ? tolkaLoad(loadUt) : null,
    crons:
      crontabUt !== null
        ? { ...tolkaCrons(crontabUt), senasteKorningar: lasSenasteKorningar() }
        : null,
    fellogg: felloggUt !== null ? tolkaFellogg(felloggUt) : null,
  };
}

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req); // admin-only läsning (block E-kontraktet)
  if (skydd) return skydd;

  // 60 s memo-cache: pågående mätning återanvänds av nästa poll.
  if (!cacheLovelse || Date.now() - cacheSatt >= CACHE_MS) {
    cacheSatt = Date.now();
    cacheLovelse = byggSvar();
  }
  try {
    return NextResponse.json(await cacheLovelse);
  } catch {
    cacheLovelse = null; // oväntat fel ⇒ nästa anrop mäter om
    return NextResponse.json(
      { error: "Kunde inte läsa serverns puls — försök igen om en stund." },
      { status: 500 },
    );
  }
}
