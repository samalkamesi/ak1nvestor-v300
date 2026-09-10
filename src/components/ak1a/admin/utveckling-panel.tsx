"use client";

import * as React from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  FileText,
  HardDrive,
  HeartPulse,
  History,
  ListChecks,
  Lock,
  MemoryStick,
  Radio,
  RefreshCw,
  ScrollText,
  Server,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminHeaders, sparaAdminLosenord } from "@/lib/admin-klient";
import { cn } from "@/lib/utils";

/**
 * UTVECKLINGSPANELN — VÅG 80c (STYRELSE-ADMIN-MEGA tillägget "VÅG 80c",
 * kunddirektiv: "följa utvecklingen från TELEFONEN").
 *
 * Tre block mot GET /api/admin/utveckling (requireAdmin-läsning, 60 s
 * memo-cache på servern):
 *   (a) STATUSKORT — översättningsrader · variabeländringar · senaste
 *       händelse-tid (+ lagerrader när lagret nås billigt).
 *   (b) SENASTE HÄNDELSER — 40 senaste system_events med typ-badge
 *       (färgkodad), tid och meddelande — översättnings/termbank/variabel-
 *       rader är exkluderade server-side och räknas i stället i korten.
 *   (c) UTVECKLINGSLOGG — worklog.md:s senaste sektioner som accordion
 *       (markdown-light: fetstil/rubriker bevaras grovt, kod monospace),
 *       senaste sektionen öppen default.
 *
 * VÅG 84 BLOCK E (STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 84" §E — STUDIO 100x,
 * observerbarhet): "Puls 📈"-sektionen ÖVERST — serverns puls mot GET
 * /api/admin/puls (requireAdmin, EN delegation på servern, 60 s cache):
 * statuskort per pm2-tjänst (grön/orange/röd prick + cpu/mem), RAM- och
 * disk-gauge, load-sparkline (senaste 12 mätningarna i localStorage),
 * cron-lista med senaste körningstider, och felloggen (senaste 20 raderna
 * ur pm2:s ak1a-error-log) med RÖD badge när nya fel dyker upp sedan
 * senaste visningen.
 *
 * MOBIL-FÖRST: korten staplas (grid-cols-1 → sm:grid-cols-3), stora
 * tryckytor (accordion-utlösare i full bredd, py-4), inga breda tabeller
 * (worklog-tabellrader renderas som monospacerader).
 *
 * Lås-vyn + admin-klient-mönstret är variabel-panelens (våg 79):
 * adminHeaders() bär x-admin-password; 401/403/429 ⇒ lås-rad, upplåsning
 * sparar lösenordet i sessionStorage och försöker igen.
 */

// ── Svartyper (API-kontraktet våg 80c) ──────────────────────────────────────

type WorklogSektion = { rubrik: string; dag: string | null; kropp: string };

type HandelseRad = {
  type: string;
  severity: string | null;
  created_at: string;
  message: string;
};

type UtvecklingSvar = {
  hamtat: string;
  worklog: WorklogSektion[];
  events: HandelseRad[];
  stats: {
    oversattningRader: number;
    variabelAndringar: number;
    exkluderadeTyper?: { oversattning?: number; termbank_tillagg?: number; variabel?: number };
    lagret?: { rader: number } | null;
    senasteHandelse?: string | null;
  };
};

// ── Svartyper: serverns puls (API-kontraktet våg 84 block E) ────────────────

type PulsTjanst = {
  namn: string;
  status: string;
  cpu: number;
  mem: number;
  uppdaterad: string | null;
  uptimeS: number | null;
  restarts: number;
};

type PulsSvar = {
  hamtat: string;
  serverTid: string;
  tjanster: PulsTjanst[] | null;
  disk: { procent: number; anvant: string; totalt: string; tillgangligt: string } | null;
  ram: { anvantMB: number; totaltMB: number; procent: number } | null;
  load: { ett: number; fem: number; femton: number } | null;
  crons: { rader: number; poster: string[]; senasteKorningar: string[] | null } | null;
  fellogg: { rader: string[] } | null;
};

// ── Svartyper: AI-användning (API-kontraktet våg 85 F3) ─────────────────────

type AnvandningModell = {
  modell: string;
  tokens: number;
  antal: number;
  andel: number;
};

type AnvandningSvar = {
  hamtat: string;
  transport: string;
  live: boolean;
  /** Det RÅA usage/stats-svaret (bevis för protokollsform — visas ej rått). */
  usage: unknown | null;
  totalTokens7d: number;
  totalTokens24h: number;
  kalla24h?: "dagsrad" | "sessioner" | "snitt" | "okand";
  modellFordelning: AnvandningModell[];
  sammanfattning?: {
    inputTokens?: number;
    outputTokens?: number;
    reasoningTokens?: number;
    cacheReadTokens?: number;
    cacheCreationTokens?: number;
    cacheHitRate?: number;
    totalSessions?: number;
    totalTurns?: number;
    toolCallCount?: number;
  };
  fel?: string;
};

// ── Typ-badgar — färgkodade etiketter för kända eventtyper ─────────────────

const TYPE_STIL: Record<string, string> = {
  // AI-organ / autonomi — varumärkesguld
  organ: "border-gold/40 bg-gold/10 text-gold",
  organ_msg: "border-gold/40 bg-gold/10 text-gold",
  autonom_report: "border-gold/40 bg-gold/10 text-gold",
  ai_organ_autonom_proposal: "border-gold/40 bg-gold/10 text-gold",
  ai_analys_genererad: "border-gold/40 bg-gold/10 text-gold",
  // innehåll — blå ton
  blogg_publicerad: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300",
  blogg_utkast: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300",
  kurs_metadata: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300",
  media_fil: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300",
  media_fil_raderad: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300",
  // medlemmar/konvertering — grön ton
  medlem: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300",
  medlem_andring: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300",
  medlem_progress: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300",
  fas2_ansokan: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300",
  referral: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300",
  referral_kod: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300",
  // prisvariabler — violett
  "variabel-andring": "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-300",
  "kurs_metadata-andring": "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-300",
  // forskning/motorer — teal
  akm2_snapshot: "border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-300",
  akm3_regime: "border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-300",
  akm3_prediktion: "border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-300",
  akm3_kalibrering: "border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-300",
  vagscan: "border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-300",
  vagvalidering: "border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-300",
  stock_data_updated: "border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-300",
  // trafik/säkerhet/vakten — orange
  trafik: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-300",
  sakerhet: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-300",
  api_error: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-300",
};

/** Severity-fallback när typen saknas i kartan — fel syns alltid rött. */
function typStil(typ: string, severity: string | null): string {
  const kand = TYPE_STIL[typ];
  if (kand) return kand;
  if (severity === "critical" || severity === "error")
    return "border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300";
  if (severity === "warning")
    return "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300";
  return "border-border bg-muted/60 text-muted-foreground";
}

// ── Hjälpare ─────────────────────────────────────────────────────────────────

function tidSedan(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const sek = Math.floor((Date.now() - t) / 1000);
  if (sek < 60) return `${sek}s sedan`;
  const min = Math.floor(sek / 60);
  if (min < 60) return `${min}m sedan`;
  const tim = Math.floor(min / 60);
  if (tim < 24) return `${tim}h sedan`;
  return `${Math.floor(tim / 24)}d sedan`;
}

function klockslag(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  return new Date(t).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" });
}

const sv = (n: number | null | undefined): string =>
  typeof n === "number" && Number.isFinite(n) ? n.toLocaleString("sv-SE") : "—";

// ── Markdown-light — fetstil/kod bevaras, rubriker grovt, tabeller mono ─────

/** Inline-tokenisering: **fetstil** och `kod` — allt annat är plain text. */
function renderaInline(text: string): React.ReactNode[] {
  const ut: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|`([^`]+)`/g;
  let sist = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > sist) ut.push(text.slice(sist, m.index));
    if (m[1] !== undefined) {
      ut.push(
        <strong key={i++} className="font-semibold text-foreground">
          {m[1]}
        </strong>,
      );
    } else {
      ut.push(
        <code key={i++} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
          {m[2]}
        </code>,
      );
    }
    sist = m.index + m[0].length;
  }
  if (sist < text.length) ut.push(text.slice(sist));
  return ut;
}

/**
 * Markdown-light-renderare för en worklog-kropp: ### /#### -rubriker,
 * > -citat (guldkant), - /* -listor, ``` -kodblock (monospace) och
 * | -tabellrader som monospacerader (mobil: inga breda tabeller).
 */
function MarkdownLight({ text }: { text: string }) {
  const rader = text.split("\n");
  const ut: React.ReactNode[] = [];
  let i = 0;
  let nyckel = 0;
  while (i < rader.length) {
    const rad = rader[i];

    // Kodblock — ``` ... ```
    if (rad.trimStart().startsWith("```")) {
      const block: string[] = [];
      i += 1;
      while (i < rader.length && !rader[i].trimStart().startsWith("```")) {
        block.push(rader[i]);
        i += 1;
      }
      i += 1; // avslutande ```
      ut.push(
        <pre
          key={nyckel++}
          className="my-2 overflow-x-auto rounded-md border border-border bg-muted/60 p-2.5 font-mono text-[11px] leading-relaxed"
        >
          {block.join("\n")}
        </pre>,
      );
      continue;
    }

    // Tom rad — luft
    if (rad.trim() === "") {
      ut.push(<div key={nyckel++} className="h-2" />);
      i += 1;
      continue;
    }

    // Underrubrik (### / ####)
    const rubrikMatch = /^#{3,4}\s+(.*)$/.exec(rad);
    if (rubrikMatch) {
      ut.push(
        <p key={nyckel++} className="mt-2 font-serif text-sm font-bold">
          {renderaInline(rubrikMatch[1])}
        </p>,
      );
      i += 1;
      continue;
    }

    // Citat
    if (rad.startsWith("> ")) {
      ut.push(
        <p
          key={nyckel++}
          className="my-1.5 border-l-2 border-gold/50 pl-3 text-[13px] italic text-muted-foreground"
        >
          {renderaInline(rad.slice(2))}
        </p>,
      );
      i += 1;
      continue;
    }

    // Listrad
    const listMatch = /^\s*[-*]\s+(.*)$/.exec(rad);
    if (listMatch) {
      ut.push(
        <p key={nyckel++} className="my-0.5 flex gap-2 text-[13px] leading-relaxed">
          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-gold/70" />
          <span className="min-w-0 break-words">{renderaInline(listMatch[1])}</span>
        </p>,
      );
      i += 1;
      continue;
    }

    // Tabellrad — monospace (mobil-först: aldrig en riktig tabell)
    if (rad.trimStart().startsWith("|")) {
      ut.push(
        <p
          key={nyckel++}
          className="overflow-x-auto whitespace-pre font-mono text-[10.5px] leading-relaxed text-muted-foreground"
        >
          {rad}
        </p>,
      );
      i += 1;
      continue;
    }

    // Vanlig rad
    ut.push(
      <p key={nyckel++} className="my-1 text-[13px] leading-relaxed break-words">
        {renderaInline(rad)}
      </p>,
    );
    i += 1;
  }
  return <div className="text-muted-foreground">{ut}</div>;
}

// ── Panelen ─────────────────────────────────────────────────────────────────

export function UtvecklingPanel() {
  const [data, setData] = React.useState<UtvecklingSvar | null>(null);
  const [fel, setFel] = React.useState("");
  const [laddar, setLaddar] = React.useState(false);
  const [behoverLosen, setBehoverLosen] = React.useState(false);
  const [losenord, setLosenord] = React.useState("");
  const [losenFel, setLosenFel] = React.useState("");

  // ── VÅG 84 E: serverns puls (egen route, egen 60 s-takt) ──────────────────
  const [puls, setPuls] = React.useState<PulsSvar | null>(null);
  const [pulsLaddar, setPulsLaddar] = React.useState(false);

  // ── VÅG 85 F3: AI-användning (usage/stats — egen route, egen 60 s-takt) ───
  const [anvandning, setAnvandning] = React.useState<AnvandningSvar | null>(null);
  const [anvandningLaddar, setAnvandningLaddar] = React.useState(false);

  const hamta = React.useCallback(async () => {
    setLaddar(true);
    setFel("");
    setLosenFel("");
    try {
      const res = await fetch("/api/admin/utveckling", { headers: adminHeaders() });
      if (res.status === 401 || res.status === 403 || res.status === 429) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setBehoverLosen(true);
        setLosenFel(json.error || "Admin-lösenord krävs.");
        setData(null);
        return;
      }
      if (res.ok) {
        setData((await res.json()) as UtvecklingSvar);
        setBehoverLosen(false);
      } else {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setFel(json.error || `Kunde inte hämta utvecklingsvyn (HTTP ${res.status}).`);
      }
    } catch {
      setFel("Nätverksfel — kunde inte hämta utvecklingsvyn.");
    } finally {
      setLaddar(false);
    }
  }, []);

  /** Puls-hämtning — delar lås-vyn med utvecklingsvyn (401 ⇒ gemensam lås-rad). */
  const hamtaPuls = React.useCallback(async () => {
    setPulsLaddar(true);
    try {
      const res = await fetch("/api/admin/puls", { headers: adminHeaders() });
      if (res.status === 401 || res.status === 403 || res.status === 429) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setBehoverLosen(true);
        if (json.error) setLosenFel(json.error);
        setPuls(null);
        return;
      }
      if (res.ok) {
        setPuls((await res.json()) as PulsSvar);
        setBehoverLosen(false);
      }
      // Övriga fel: puls-rutten svarar null-fält per kommando — ett ej-ok
      // svar lämnar föregående puls kvar (aldrig röd kraschvy för en blink).
    } catch {
      // nätverksfel ⇒ behåll senaste pulsen, tyst (nästa 60 s-takt tar om)
    } finally {
      setPulsLaddar(false);
    }
  }, []);

  /** VÅG 85 F3: användnings-hämtning — samma lås-mönster som pulsen. */
  const hamtaAnvandning = React.useCallback(async () => {
    setAnvandningLaddar(true);
    try {
      const res = await fetch("/api/studio/anvandning", { headers: adminHeaders() });
      if (res.status === 401 || res.status === 403 || res.status === 429) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setBehoverLosen(true);
        if (json.error) setLosenFel(json.error);
        setAnvandning(null);
        return;
      }
      if (res.ok) {
        setAnvandning((await res.json()) as AnvandningSvar);
        setBehoverLosen(false);
      }
      // Ej-ok svar: rutten svarar själv live:false + fel — ett ej-ok svar
      // lämnar föregående mätning kvar (aldrig kraschvy för en blink).
    } catch {
      // nätverksfel ⇒ behåll senaste mätningen, tyst (60 s-takten tar om)
    } finally {
      setAnvandningLaddar(false);
    }
  }, []);

  // Hämta när fliken öppnas (Radix unmountar inaktiva TabsContent ⇒ lazy).
  React.useEffect(() => {
    void hamta();
    void hamtaPuls();
    void hamtaAnvandning();
  }, [hamta, hamtaPuls, hamtaAnvandning]);

  // 60 s auto-uppdatering — ENDAST när fliken syns (mobil: spara batteri/data).
  React.useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && !behoverLosen) {
        void hamta();
        void hamtaPuls();
        void hamtaAnvandning();
      }
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [hamta, hamtaPuls, hamtaAnvandning, behoverLosen]);

  const lasUpp = async () => {
    if (!losenord) return;
    sparaAdminLosenord(losenord); // admin-klienten bär den på kommande anrop
    await hamta();
  };

  // ── Lås-vy (variabel-panelens mönster, våg 79) ───────────────────────────
  if (behoverLosen && !data) {
    return (
      <div className="rounded-xl border border-gold/30 bg-card px-5 py-6">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-gold" />
          <h3 className="font-serif text-lg font-bold">Utveckling — låst</h3>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Utvecklingsvyn skyddas av ADMIN_PASSWORD — lämnad i headern
          x-admin-password, samma mönster som övriga admin-rutter.
        </p>
        <div className="mt-3 flex gap-2">
          <Input
            type="password"
            value={losenord}
            onChange={(e) => setLosenord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lasUpp()}
            placeholder="Admin-lösenord"
            className="max-w-xs"
          />
          <Button onClick={lasUpp} className="bg-gold text-background hover:bg-gold/90">
            Lås upp
          </Button>
        </div>
        {losenFel && <p className="mt-2 text-xs text-red-600">{losenFel}</p>}
      </div>
    );
  }

  const events = data?.events ?? [];
  const worklog = data?.worklog ?? [];
  const stats = data?.stats;
  const senaste = stats?.senasteHandelse ?? events[0]?.created_at ?? null;

  return (
    <div className="space-y-5">
      {/* Rubrikrad — LIVE + manuell uppdatering */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
          </span>
          <h3 className="font-serif text-lg font-bold">Utveckling 📡</h3>
          <Badge variant="outline" className="text-[10px]">
            <Clock className="mr-1 h-3 w-3" /> LIVE · 60 s
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <span className="text-[10px] text-muted-foreground">
              Uppdaterad {new Date(data.hamtat).toLocaleTimeString("sv-SE")}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void hamta();
              void hamtaPuls();
              void hamtaAnvandning();
            }}
            disabled={laddar || pulsLaddar || anvandningLaddar}
          >
            <RefreshCw
              className={cn(
                "mr-1 h-3 w-3",
                (laddar || pulsLaddar || anvandningLaddar) && "animate-spin",
              )}
            />{" "}
            Uppdatera
          </Button>
        </div>
      </div>

      {fel && <p className="text-xs text-red-600">{fel}</p>}
      {laddar && !data && <p className="text-xs text-muted-foreground">Hämtar utvecklingsvyn …</p>}

      {/* (0) PULS 📈 (våg 84 E) — serverns puls, överst: kunden ser först
          hur servern mår, sedan vad som händer i utvecklingen. */}
      <PulsSektion puls={puls} laddar={pulsLaddar} />

      {/* (0b) ANVÄNDNING 📊 (våg 85 F3) — AI-agentens tokenförbrukning
          direkt under pulsen: serverns hälsa → agentens kostnad. */}
      <AnvandSektion anvandning={anvandning} laddar={anvandningLaddar} />

      {/* (a) STATUSKORT — staplade på mobil, rad på större skärm */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatusKort
          ikon={<Radio className="h-4 w-4 text-gold" />}
          etikett="Översättningsrader"
          varde={sv(stats?.oversattningRader ?? 0)}
          sub="MÖS-korpusen · publicerade rader (count=exact)"
        />
        <StatusKort
          ikon={<History className="h-4 w-4 text-gold" />}
          etikett="Variabeländringar"
          varde={sv(stats?.variabelAndringar ?? 0)}
          sub={`prisvärden ändrade via panelen${stats?.exkluderadeTyper?.termbank_tillagg !== undefined ? ` · termbank: ${sv(stats.exkluderadeTyper.termbank_tillagg ?? 0)}` : ""}`}
        />
        <StatusKort
          ikon={<Clock className="h-4 w-4 text-gold" />}
          etikett="Senaste händelse"
          varde={tidSedan(senaste)}
          sub={klockslag(senaste)}
        />
      </div>

      {/* Lagret + exkluderade typer — ärlig rad när lagret nås billigt */}
      {stats?.lagret && (
        <p className="rounded-md border border-gold/30 bg-gold/[0.03] px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          <FileText className="mr-1 inline h-3.5 w-3.5 align-[-2px] text-gold" />
          Översättningslagret: <strong className="text-foreground">{sv(stats.lagret.rader)}</strong>{" "}
          unika språknycklar. Översättnings-, termbank- och variabelrader listas inte i
          händelseflödet (för stora/känsliga) — de räknas i korten ovan i stället.
        </p>
      )}

      {/* (b) SENASTE HÄNDELSER — typ-badge, tid, meddelande */}
      <div className="rounded-lg border border-gold/30 bg-card p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-gold" />
            <h4 className="font-serif text-sm font-bold">Senaste händelser ({events.length})</h4>
          </div>
          <span className="text-[10px] text-muted-foreground">
            system_events · meddelanden avklippta 120 tkn · inga detaljer
          </span>
        </div>
        {events.length === 0 ? (
          <p className="mt-3 rounded-md border border-border bg-card px-3 py-4 text-center text-xs text-muted-foreground">
            Inga händelser loggade än — eller kunde inte nås just nu.
          </p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {events.map((e, i) => (
              <li
                key={`${e.created_at}:${e.type}:${i}`}
                className="rounded-md border border-border bg-card p-3"
              >
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn("max-w-full truncate text-[10px] lowercase", typStil(e.type, e.severity))}
                  >
                    {e.type}
                  </Badge>
                  {e.severity && e.severity !== "info" && (
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase",
                        e.severity === "critical" || e.severity === "error"
                          ? "text-red-600 dark:text-red-400"
                          : e.severity === "warning"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-muted-foreground",
                      )}
                    >
                      {e.severity}
                    </span>
                  )}
                  <span className="ml-auto shrink-0 text-[10px] text-muted-foreground" title={klockslag(e.created_at)}>
                    {tidSedan(e.created_at)}
                  </span>
                </div>
                {e.message && (
                  <p className="mt-1.5 min-w-0 text-[13px] leading-snug break-words">{e.message}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* (c) UTVECKLINGSLOGG — worklog-sektioner som accordion, senaste öppen */}
      <div className="rounded-lg border border-gold/30 bg-card p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-gold" />
            <h4 className="font-serif text-sm font-bold">Utvecklingslogg ({worklog.length})</h4>
          </div>
          <span className="text-[10px] text-muted-foreground">
            worklog.md · senaste {worklog.length} sektionerna · trunkerat läsbart
          </span>
        </div>
        {worklog.length === 0 ? (
          <p className="mt-3 rounded-md border border-border bg-card px-3 py-4 text-center text-xs text-muted-foreground">
            Worklog kunde inte läsas — filen saknas i denna miljö.
          </p>
        ) : (
          <Accordion type="single" collapsible defaultValue="sektion-0" className="mt-2 w-full">
            {worklog.map((sektion, i) => (
              <AccordionItem key={`sektion-${i}`} value={`sektion-${i}`} className="border-b-0">
                <AccordionTrigger className="min-h-11 flex-col items-start gap-1 py-3.5 text-left hover:no-underline">
                  <span className="w-full pr-6 font-serif text-sm font-bold leading-snug break-words">
                    {sektion.rubrik}
                  </span>
                  {sektion.dag && (
                    <span className="text-[10px] font-normal text-muted-foreground">{sektion.dag}</span>
                  )}
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <MarkdownLight text={sektion.kropp} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}

// ── Statuskort — stort värde, liten etikett, staplad på mobil ───────────────

function StatusKort({
  ikon,
  etikett,
  varde,
  sub,
}: {
  ikon: React.ReactNode;
  etikett: string;
  varde: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-gold/30 bg-card p-4">
      <div className="flex items-center gap-2">
        {ikon}
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {etikett}
        </span>
      </div>
      <p className="mt-2 break-words font-serif text-2xl font-bold tabular-nums">{varde}</p>
      <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{sub}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PULS 📈 — VÅG 84 BLOCK E: serverns puls synlig för kunden
// ═══════════════════════════════════════════════════════════════════════════

/** localStorage-nycklar (klienten äger historiken — servern är stateless). */
const LS_LOAD = "ak1a-puls-load";
const LS_FELLOGG = "ak1a-puls-fellogg-senast";
/** Sparklinjens maxlängd — "senaste 12 mätningarna" (kontraktet). */
const LOAD_MAX = 12;

type LoadPunkt = { t: number; load: number };

function lasLoadHistorik(): LoadPunkt[] {
  try {
    const rå = window.localStorage.getItem(LS_LOAD);
    if (!rå) return [];
    const parsed = JSON.parse(rå) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is LoadPunkt =>
        typeof p === "object" && p !== null &&
        typeof (p as LoadPunkt).t === "number" &&
        typeof (p as LoadPunkt).load === "number",
    );
  } catch {
    return [];
  }
}

function sparaLoadHistorik(punkter: LoadPunkt[]) {
  try {
    window.localStorage.setItem(LS_LOAD, JSON.stringify(punkter.slice(-LOAD_MAX)));
  } catch {
    // privat läge/fullt utrymme ⇒ historiken är kosmetisk, aldrig fel
  }
}

/** Signatur på felloggen — antal rader + sista raden räcker för "nya fel?". */
function felloggSignatur(rader: string[]): string {
  return `${rader.length}:${rader[rader.length - 1] ?? ""}`;
}

function lasSenasteSignatur(): string | null {
  try {
    return window.localStorage.getItem(LS_FELLOGG);
  } catch {
    return null;
  }
}

function sparaSenasteSignatur(sig: string) {
  try {
    window.localStorage.setItem(LS_FELLOGG, sig);
  } catch {
    // se ovan — kosmetisk state
  }
}

// ── Puls-delrenderare ───────────────────────────────────────────────────────

/** Färgklass för andel (0–100): grönt < 60, orange < 85, rött ≥ 85. */
function andelFarg(procent: number | null | undefined): string {
  if (procent === null || procent === undefined) return "bg-muted-foreground/40";
  if (procent < 60) return "bg-emerald-500";
  if (procent < 85) return "bg-amber-500";
  return "bg-red-500";
}

/** Statusfärg per tjänst: online = grön, död/stoppad = röd, övrigt = orange. */
function statusFarg(status: string): string {
  if (status === "online") return "bg-emerald-500";
  if (status === "stopped" || status === "errored" || status === "stalled") return "bg-red-500";
  return "bg-amber-500"; // launching / restarting / …
}

function formatUptime(sek: number | null): string {
  if (sek === null || !Number.isFinite(sek)) return "—";
  const d = Math.floor(sek / 86_400);
  const t = Math.floor((sek % 86_400) / 3_600);
  const m = Math.floor((sek % 3_600) / 60);
  if (d > 0) return `${d}d ${t}h`;
  if (t > 0) return `${t}h ${m}m`;
  return `${m}m`;
}

/** Horisontell gauge (RAM/disk) — bred tryckyta krävs ej, ren visning. */
function Gauge({
  ikon,
  etikett,
  procent,
  varde,
  hinderText,
}: {
  ikon: React.ReactNode;
  etikett: string;
  procent: number | null;
  varde: string;
  hinderText: string;
}) {
  const p = procent !== null && Number.isFinite(procent) ? Math.min(100, Math.max(0, procent)) : null;
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        {ikon}
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {etikett}
        </span>
        {p !== null && (
          <span className="ml-auto font-serif text-lg font-bold tabular-nums">{p}%</span>
        )}
      </div>
      <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", andelFarg(p))}
          style={p !== null ? { width: `${p}%` } : { width: "0%" }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        {p !== null ? varde : hinderText}
      </p>
    </div>
  );
}

/** Load-sparkline — ren inline-SVG, senaste 12 mätningarna (localStorage). */
function LoadSparkline({ punkter, nuvarande }: { punkter: LoadPunkt[]; nuvarande: number | null }) {
  const B = 240; // viewBox-bredd
  const H = 48; // viewBox-höjd
  const pad = 4;
  const n = punkter.length;
  const max = Math.max(1, ...punkter.map((p) => p.load));
  const punkterStr =
    n >= 2
      ? punkter
          .map((p, i) => {
            const x = pad + (i / (n - 1)) * (B - pad * 2);
            const y = H - pad - (p.load / max) * (H - pad * 2);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(" ")
      : "";
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-gold" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Load (1/5/15 min)
        </span>
        {nuvarande !== null && (
          <span className="ml-auto font-serif text-lg font-bold tabular-nums">
            {nuvarande.toLocaleString("sv-SE", { maximumFractionDigits: 2 })}
          </span>
        )}
      </div>
      {punkterStr ? (
        <svg
          viewBox={`0 0 ${B} ${H}`}
          className="mt-2 h-12 w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Load-sparkline, senaste ${n} mätningarna`}
        >
          <polyline
            points={punkterStr}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gold"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Väntar på två mätningar — sparklinjen byggs en per puls (60 s).
        </p>
      )}
      <p className="mt-1 text-[11px] text-muted-foreground">
        {n > 0 ? `${n} mätning${n === 1 ? "" : "ar"} i minnet` : "Inga mätningar ännu"}
        {nuvarande !== null && " · högsta värdet i fönstret skalar axeln"}
      </p>
    </div>
  );
}

// ── PulsSektion — block E:s panel ───────────────────────────────────────────

function PulsSektion({ puls, laddar }: { puls: PulsSvar | null; laddar: boolean }) {
  // Load-historik + felloggs-signatur hålls i state så SSR aldrig rör localStorage.
  const [loadHistorik, setLoadHistorik] = React.useState<LoadPunkt[]>([]);
  const [nyaFel, setNyaFel] = React.useState(false);
  const [felloggOppen, setFelloggOppen] = React.useState(false);
  const [harSetFellogg, setHarSetFellogg] = React.useState(false);

  // Läs localStorage vid montering (efter att fliken öppnats — klient-only).
  React.useEffect(() => {
    setLoadHistorik(lasLoadHistorik());
  }, []);

  // Varje ny puls: mata load-historiken + jämför fellogg-signaturen.
  React.useEffect(() => {
    if (!puls) return;
    if (puls.load) {
      setLoadHistorik((tidigare) => {
        const nu = { t: Date.parse(puls.hamtat) || Date.now(), load: puls.load!.ett };
        // de-dupe: aldrig två punkter från samma mätning (60 s-cachen)
        if (tidigare.length > 0 && tidigare[tidigare.length - 1].t === nu.t) return tidigare;
        const nästa = [...tidigare, nu].slice(-LOAD_MAX);
        sparaLoadHistorik(nästa);
        return nästa;
      });
    }
    if (puls.fellogg) {
      const sig = felloggSignatur(puls.fellogg.rader);
      const sparad = lasSenasteSignatur();
      if (sparad === null) {
        sparaSenasteSignatur(sig); // första visningen — bara spara, inget larm
      } else if (sparad !== sig) {
        setNyaFel(true); // loggen har förändrats sedan senaste visningen
        sparaSenasteSignatur(sig);
      }
    }
  }, [puls]);

  // När felloggen öppnas (visas) nollställs den röda badge:n.
  React.useEffect(() => {
    if (felloggOppen && !harSetFellogg) {
      setNyaFel(false);
      setHarSetFellogg(true);
    }
    if (!felloggOppen) setHarSetFellogg(false);
  }, [felloggOppen, harSetFellogg]);

  const tjanster = puls?.tjanster ?? null;
  const felrader = puls?.fellogg?.rader ?? null;

  return (
    <section className="rounded-lg border border-gold/30 bg-card p-4" aria-label="Serverns puls">
      {/* Rubrikrad */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-gold" />
          <h4 className="font-serif text-sm font-bold">Puls 📈 — serverns hälsa</h4>
          {nyaFel && (
            <Badge
              variant="outline"
              className="animate-pulse border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
            >
              <AlertTriangle className="mr-1 h-3 w-3" /> Nya fel
            </Badge>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">
          {laddar
            ? "Mäter …"
            : puls
              ? `Mätt ${new Date(puls.hamtat).toLocaleTimeString("sv-SE")} · 60 s intervall`
              : "Ingen mätning än"}
        </span>
      </div>

      {!puls ? (
        <p className="mt-3 rounded-md border border-border bg-card px-3 py-4 text-center text-xs text-muted-foreground">
          Hämtar serverns puls …
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {/* (1) Statuskort per tjänst — prick + cpu/mem, staplade på mobil */}
          {tjanster === null ? (
            <p className="rounded-md border border-border bg-card px-3 py-3 text-[11px] text-muted-foreground">
              <Server className="mr-1 inline h-3.5 w-3.5 align-[-3px]" />
              pm2 svarar inte i denna miljö (t.ex. Vercel/dev) — tjänstekorten
              finns på Contabo-servern där pm2 kör.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {tjanster.map((tj) => (
                <div
                  key={tj.namn}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <span
                    className={cn(
                      "h-3 w-3 shrink-0 rounded-full",
                      statusFarg(tj.status),
                      tj.status === "online" && "shadow-[0_0_6px] shadow-emerald-500/60",
                    )}
                    title={tj.status}
                    aria-label={`Status: ${tj.status}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[13px] font-semibold">{tj.namn}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {tj.status} · uppe {formatUptime(tj.uptimeS)} · {tj.restarts} omstart
                      {tj.restarts === 1 ? "" : "er"}
                      {tj.uppdaterad && ` · sedan ${klockslag(tj.uppdaterad)}`}
                    </p>
                  </div>
                  <div className="shrink-0 text-right font-mono text-[11px] tabular-nums">
                    <p className={cn(tj.cpu >= 85 ? "text-red-600 dark:text-red-400" : tj.cpu >= 50 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>
                      cpu {tj.cpu}%
                    </p>
                    <p className="text-muted-foreground">mem {sv(tj.mem)} MB</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* (2) RAM + disk-gauges + load-sparkline — staplade på mobil */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <Gauge
              ikon={<MemoryStick className="h-4 w-4 text-gold" />}
              etikett="RAM"
              procent={puls.ram ? puls.ram.procent : null}
              varde={
                puls.ram
                  ? `${sv(puls.ram.anvantMB)} / ${sv(puls.ram.totaltMB)} MB`
                  : ""
              }
              hinderText="free -m svarar inte i denna miljö."
            />
            <Gauge
              ikon={<HardDrive className="h-4 w-4 text-gold" />}
              etikett="Disk /"
              procent={puls.disk ? puls.disk.procent : null}
              varde={
                puls.disk
                  ? `${puls.disk.anvant} / ${puls.disk.totalt} (${puls.disk.tillgangligt} kvar)`
                  : ""
              }
              hinderText="df -h / svarar inte i denna miljö."
            />
            <LoadSparkline punkter={loadHistorik} nuvarande={puls.load ? puls.load.ett : null} />
          </div>

          {/* (3) Cron-listan + senaste körningstider */}
          {puls.crons === null ? (
            <p className="rounded-md border border-border bg-card px-3 py-3 text-[11px] text-muted-foreground">
              <ListChecks className="mr-1 inline h-3.5 w-3.5 align-[-3px]" />
              crontab kunde inte läsas i denna miljö.
            </p>
          ) : (
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-gold" />
                  <h5 className="font-serif text-[13px] font-bold">
                    Cron-jobb ({puls.crons.rader})
                  </h5>
                </div>
                {puls.crons.senasteKorningar && puls.crons.senasteKorningar.length > 0 ? (
                  <span className="text-[10px] text-muted-foreground">
                    senaste körning: {puls.crons.senasteKorningar[0]}
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">
                    hälso-loggen oläsbar — körningstider saknas
                  </span>
                )}
              </div>
              {puls.crons.poster.length === 0 ? (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Cron-tabellen är tom (0 rader).
                </p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {puls.crons.poster.map((rad, i) => (
                    <li
                      key={`cron-${i}`}
                      className="overflow-x-auto whitespace-pre rounded border border-border/60 bg-muted/40 px-2 py-1.5 font-mono text-[10.5px] leading-relaxed text-muted-foreground"
                    >
                      {rad}
                    </li>
                  ))}
                </ul>
              )}
              {puls.crons.senasteKorningar && puls.crons.senasteKorningar.length > 1 && (
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Tidigare körningar: {puls.crons.senasteKorningar.slice(1).join(" · ")}
                </p>
              )}
            </div>
          )}

          {/* (4) FELLOGGEN — senaste 20 raderna, röd badge vid nya fel */}
          {felrader === null ? (
            <p className="rounded-md border border-border bg-card px-3 py-3 text-[11px] text-muted-foreground">
              <AlertTriangle className="mr-1 inline h-3.5 w-3.5 align-[-3px]" />
              pm2:s fellogg kunde inte läsas i denna miljö.
            </p>
          ) : (
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={cn(
                      "h-4 w-4",
                      felrader.length > 0 ? "text-red-500" : "text-emerald-500",
                    )}
                  />
                  <h5 className="font-serif text-[13px] font-bold">Felloggen ({felrader.length})</h5>
                  {nyaFel && (
                    <Badge
                      variant="outline"
                      className="border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
                    >
                      nya sedan senaste visningen
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  ak1a-error.log · senaste 20 · max 200 tkn/rad
                </span>
              </div>
              {felrader.length === 0 ? (
                <p className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[11px] text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Inga fel loggade — ak1a-error.log är tom.
                </p>
              ) : (
                <Accordion
                  type="single"
                  collapsible
                  value={felloggOppen ? "fellogg" : ""}
                  onValueChange={(v) => setFelloggOppen(v === "fellogg")}
                  className="mt-2 w-full"
                >
                  <AccordionItem value="fellogg" className="border-b-0">
                    <AccordionTrigger className="min-h-11 py-3 text-left hover:no-underline">
                      <span className="font-serif text-[13px] font-bold">
                        {felloggOppen ? "Dölj raderna" : `Visa ${felrader.length} rader`}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3">
                      <div className="max-h-72 space-y-1 overflow-y-auto">
                        {felrader.map((rad, i) => (
                          <p
                            key={`fel-${i}`}
                            className={cn(
                              "whitespace-pre-wrap break-words rounded border px-2 py-1.5 font-mono text-[10.5px] leading-relaxed",
                              i === felrader.length - 1
                                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                                : "border-border/60 bg-muted/40 text-muted-foreground",
                            )}
                          >
                            {rad}
                          </p>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          )}

          {/* Fotrad — serverns klocka + ärlig källadeklaration */}
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Mätt på servern i EN delegation (pm2 · df · free · uptime · crontab ·
            hälso-logg) — fält som inte kan läsas i aktuell miljö visas ärligt som
            saknade. Serverns tid:{" "}
            {new Date(puls.serverTid).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "medium" })}.
          </p>
        </div>
      )}
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ANVÄNDNING 📊 — VÅG 85 F3: AI-agentens tokenförbrukning + kostnads-ärlighet
// ═══════════════════════════════════════════════════════════════════════════

/** Token-tal → läsbar svensk förkortning: 8 350 000 → "8,35 M". */
function formatTokens(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n) || n <= 0) return "0";
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toLocaleString("sv-SE", { maximumFractionDigits: 2 })} M`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toLocaleString("sv-SE", { maximumFractionDigits: 1 })} k`;
  }
  return String(Math.round(n));
}

/** Stapelfärg per modell — guldfamiljen, index-cyklat (inga röda = inga larm). */
const MODELL_STAPPEL = [
  "bg-gold",
  "bg-gold/70",
  "bg-gold/50",
  "bg-gold/35",
  "bg-gold/25",
];

// ── AnvandSektion — F3:s panel ──────────────────────────────────────────────

function AnvandSektion({
  anvandning,
  laddar,
}: {
  anvandning: AnvandningSvar | null;
  laddar: boolean;
}) {
  const s = anvandning;
  const live = s?.live === true;
  const total = s?.totalTokens7d ?? 0;
  const dygn = s?.totalTokens24h ?? 0;
  const fordelning = s?.modellFordelning ?? [];
  const kallaText =
    s?.kalla24h === "dagsrad"
      ? "senaste dagen ur protokollets dagsuppdelning"
      : s?.kalla24h === "sessioner"
        ? "summerat ur sessioner aktiva senaste 24 h"
        : s?.kalla24h === "snitt"
          ? "dygnsmedelvärde (7 dagar ÷ 7)"
          : "";
  const sum = s?.sammanfattning;

  return (
    <section
      className="rounded-lg border border-gold/30 bg-card p-4"
      aria-label="AI-agentens användning"
    >
      {/* Rubrikrad */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-gold" />
          <h4 className="font-serif text-sm font-bold">Användning 📊 — AI-agenten</h4>
          <Badge
            variant="outline"
            className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300"
          >
            Ingår i planen
          </Badge>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {laddar
            ? "Hämtar …"
            : s
              ? `usage/stats · ${new Date(s.hamtat).toLocaleTimeString("sv-SE")} · 60 s intervall`
              : "Ingen mätning än"}
        </span>
      </div>

      {!s ? (
        <p className="mt-3 rounded-md border border-border bg-card px-3 py-4 text-center text-xs text-muted-foreground">
          Hämtar agentens tokenförbrukning …
        </p>
      ) : !live ? (
        <p className="mt-3 rounded-md border border-border bg-card px-3 py-4 text-center text-xs text-muted-foreground">
          usage/stats kunde ej hämtas{s.fel ? ` — ${s.fel}` : "."} Panelen återkommer
          vid nästa mätning (60 s).
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {/* (1) STORA SIFFROR — 7 dagar + senaste dygnet */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="rounded-lg border border-gold/30 bg-gold/[0.04] p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Tokens · 7 dagar
              </span>
              <p className="mt-1 break-words font-serif text-3xl font-bold tabular-nums">
                {formatTokens(total)}
              </p>
              <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                {sv(total)} tokens totalt · {sv(sum?.totalTurns ?? 0)} agentrundor ·{" "}
                {sv(sum?.toolCallCount ?? 0)} verktygskall
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {s.kalla24h === "dagsrad" ? "Tokens · senaste dagen" : "Senaste 24 timmarna"}
              </span>
              <p className="mt-1 break-words font-serif text-3xl font-bold tabular-nums">
                {formatTokens(dygn)}
              </p>
              <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                {kallaText || "usage/stats bär ingen 24 h-period"} ·{" "}
                {sv(sum?.totalSessions ?? 0)} sessioner i perioden
              </p>
            </div>
          </div>

          {/* (2) MODELLFÖRDELNING — horisontella staplar per modell */}
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h5 className="font-serif text-[13px] font-bold">
                Modellfördelning ({fordelning.length})
              </h5>
              <span className="text-[10px] text-muted-foreground">
                usage/stats byModel · andel av periodens tokens
              </span>
            </div>
            {fordelning.length === 0 ? (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Ingen modellfördelning i svaret — protokollet räknade inga modeller
                för perioden.
              </p>
            ) : (
              <ul className="mt-2.5 space-y-2.5">
                {fordelning.map((m, i) => {
                  const procent = Math.round((m.andel ?? 0) * 100);
                  const bredd = Math.min(100, Math.max(m.tokens > 0 ? 2 : 0, procent));
                  return (
                    <li key={m.modell}>
                      <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-2">
                        <span className="min-w-0 truncate font-mono text-[12px] font-semibold">
                          {m.modell}
                        </span>
                        <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                          {formatTokens(m.tokens)} tokens · {procent}% ·{" "}
                          {m.antal > 0
                            ? `${sv(m.antal)} anrop`
                            : "inga anrop räknade"}
                        </span>
                      </div>
                      <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            MODELL_STAPPEL[i % MODELL_STAPPEL.length],
                          )}
                          style={{ width: `${bredd}%` }}
                          role="img"
                          aria-label={`${m.modell}: ${procent}% av tokens`}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* (3) KOSTNADSUPPSKATTNING — ÄRLIGHET: pauspris, ALDRIG kronor */}
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/[0.06]">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h5 className="font-serif text-[13px] font-bold">Kostnad</h5>
              <Badge
                variant="outline"
                className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300"
              >
                fast pris
              </Badge>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              All förbrukning ovan <strong className="text-foreground">ingår i GLM Coding
              Plan</strong> (fast månadspris, ingen token-räkning) — staplarna visar
              hur användningen fördelar sig mellan modeller (t.ex. GLM-5.3 vs 5.2),
              inte vad något kostar. AK1A uppger därför aldrig "du har betalat X kr"
              för agentdriften.
            </p>
            {sum && (
              <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
                Sanningen ur protokollet: {sv(sum.inputTokens ?? 0)} in- ·{" "}
                {sv(sum.outputTokens ?? 0)} ut-tokens ·{" "}
                {sv(sum.reasoningTokens ?? 0)} resonemang · cache läs{" "}
                {formatTokens(sum.cacheReadTokens ?? 0)} (träff{" "}
                {Math.round((sum.cacheHitRate ?? 0) * 100)}%) · källa{" "}
                {s.transport === "mock" ? "mock (dev)" : "usage/stats · agent-db"}.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
