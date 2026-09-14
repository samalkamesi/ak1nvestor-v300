"use client";

import * as React from "react";

import { Gauge, Loader2, RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * STUDIO-FÖRBRUKNING-PANEL — 10X p9: kompakt förbrukningssektion i
 * /studio:s höger panel, direkt UNDER Kontext-raden (samma sektion i
 * desktop-panelen och mobil-drawern). Presentationsyta — state + fetch
 * (GET /api/studio/anvandning, poll var 60:e sekund) ägs av studio-chat
 * (mönstret från minne-/färdighets-panelerna: EN pollare, två monteringar).
 *
 * VISAR (källor = routens befintliga data, inga nya hemligheter):
 *   · TOKENS PER DAG — mini-stapeldiagram senaste 7 dagarna ur protokollets
 *     dailyModelUsage (sista dagsraden = idag, blå stapel); saknas formen
 *     visas en ärlig rad istället för påhittade staplar.
 *   · 24 H-SIFFRA med källmärkning (dagsrad/sessioner/snitt/okänd —
 *     transportens ärlighetsstege våg 85 F3).
 *   · MODELLFÖRDELNING — tokens + andel + antal modellanrop (requestCount
 *     bär ALDRIG påhittade värden; 0 = protokollet saknar räknefältet).
 *   · cache-träff · rundor · sessioner · verktyg ur sammanfattningen.
 *
 * KOSTNADS-ÄRLIGHET (KVD, kundens direktiv): planen är fast pris —
 * panelen visar ALDRIG påhittade kronor, bara "ingår i planen" +
 * token-räkningar. Transportfel ⇒ ett ärligt frånräknat kort, aldrig krasch.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Svarskontrakt — speglar /api/studio/anvandning (våg 85 F3). */
export interface ForbrukningSvar {
  hamtat: string;
  transport: string;
  live: boolean;
  /** Det RÅA usage/stats-svaret (range "7d") — dailyModelUsage bor här. */
  usage: unknown | null;
  totalTokens7d: number;
  totalTokens24h: number;
  kalla24h?: "dagsrad" | "sessioner" | "snitt" | "okand";
  modellFordelning: { modell: string; tokens: number; antal: number; andel: number }[];
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
}

/** Props från studio-chat.tsx — datahämtning + polling ägs där. */
export interface ForbrukningPanelProps {
  data: ForbrukningSvar | null;
  laddar: boolean;
  fel: string;
  uppdatera: () => void;
}

/** Formattera tokens kompakt (12 345 → "12,3k") — samma skala som kontextraden. */
function tkn(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

/** Veckodagsinitial ur "2026-09-14" (lokal tolkning — ingen UTC-förskjutning). */
function veckoDag(datum: string): string {
  const d = new Date(`${datum}T00:00:00`);
  return Number.isFinite(d.getTime()) ? ["sö", "må", "ti", "on", "to", "fr", "lö"][d.getDay()] : "·";
}

/** Källmärkning för 24 h-siffran — transportens ärlighetsstege. */
function kallaText(kalla?: ForbrukningSvar["kalla24h"]): string {
  switch (kalla) {
    case "dagsrad":
      return "senaste dagsraden";
    case "sessioner":
      return "sessioner 24 h";
    case "snitt":
      return "dygnsmedel 7 d";
    default:
      return "okänd källa";
  }
}

/** En stapelbar dag ur dailyModelUsage (defensivt — protokollets LIVE-form). */
interface ForbrukningsDag {
  datum: string;
  etikett: string;
  tokens: number;
}

/**
 * Tokens per dag ur DET RÅA svarets dailyModelUsage (date-stigande,
 * sista raden = idag). Tom lista när protokollet saknar formen —
 * ALDRIG påhittade dagar.
 */
function lasDagar(rå: unknown): ForbrukningsDag[] {
  const s = rå as { dailyModelUsage?: { date?: string; models?: { totalTokens?: number }[] }[] } | null;
  const rader = Array.isArray(s?.dailyModelUsage) ? s!.dailyModelUsage! : [];
  const dagar: ForbrukningsDag[] = [];
  for (const rad of rader) {
    const datum = typeof rad?.date === "string" ? rad.date.slice(0, 10) : "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) continue;
    let tokens = 0;
    if (Array.isArray(rad.models)) {
      for (const m of rad.models) {
        if (typeof m?.totalTokens === "number" && Number.isFinite(m.totalTokens)) tokens += m.totalTokens;
      }
    }
    dagar.push({ datum, etikett: veckoDag(datum), tokens });
  }
  return dagar.slice(-7);
}

/** Andel som ärlig procenttext ("0,4 %" → "<1 %", aldrig en platt "0 %"). */
function procentText(andel: number): string {
  const p = andel * 100;
  if (p > 0 && p < 1) return "<1 %";
  return `${Math.round(p)} %`;
}

export function StudioForbrukningPanel({ data, laddar, fel, uppdatera }: ForbrukningPanelProps) {
  const dagar = React.useMemo(() => lasDagar(data?.usage ?? null), [data]);
  const maxDag = React.useMemo(() => dagar.reduce((störst, d) => Math.max(störst, d.tokens), 0), [dagar]);
  const modeller = data?.modellFordelning ?? [];
  const summa = data?.sammanfattning ?? {};
  const hamtadKlocka = data
    ? new Date(data.hamtat).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })
    : "";

  // cacheHitRate bär protokollets egen skala (0–1 eller färdiga procent) —
  // visa defensivt, ALDRIG en gissad multiplikation som ger 8 400 %.
  const cacheProcent =
    typeof summa.cacheHitRate === "number" && Number.isFinite(summa.cacheHitRate)
      ? summa.cacheHitRate <= 1
        ? Math.round(summa.cacheHitRate * 100)
        : Math.round(summa.cacheHitRate)
      : null;

  return (
    <section aria-label="Förbrukning" className="border-b border-[#30363D]">
      <p className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B949E]">
        <Gauge className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Förbrukning
        <button
          onClick={uppdatera}
          disabled={laddar}
          title="Uppdatera förbrukningen (usage/stats, 7 dagar)"
          aria-label="Uppdatera förbrukningen"
          className="ml-auto rounded-md p-0.5 text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3 w-3", laddar && "animate-spin")} />
        </button>
      </p>
      <div className="px-3 pb-3">
        {data === null && laddar ? (
          <p className="flex items-center gap-1.5 font-mono text-[10px] text-[#8B949E]">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            läser förbrukningen…
          </p>
        ) : data === null ? (
          <p
            className="font-mono text-[10px] leading-relaxed text-[#8B949E]"
            title={fel || "usage/stats kunde ej hämtas"}
          >
            kunde ej hämta — försöker igen automatiskt
          </p>
        ) : (
          <>
            {/* Totaler: 7 dagar + senaste dygnet med ärlig källmärkning. */}
            <p className="font-mono text-[10px] tabular-nums leading-relaxed text-[#8B949E]">
              <span className="text-[#E6EDF3]">{tkn(data.totalTokens7d)} tkn</span> / 7 dagar
              {" · "}
              <span className="text-[#E6EDF3]">{tkn(data.totalTokens24h)}</span> / 24 h
              <span className="text-[#6E7681]" title={`24 h-siffrets källa: ${kallaText(data.kalla24h)}`}>
                {" "}
                ({kallaText(data.kalla24h)})
              </span>
            </p>

            {/* Stapeldiagram: tokens per dag (dailyModelUsage — sista = idag, blå). */}
            {dagar.length >= 2 && maxDag > 0 ? (
              <div
                className="mt-2 flex h-12 items-end gap-1"
                role="img"
                aria-label={`Tokens per dag, äldst först: ${dagar
                  .map((d) => `${d.datum} ${tkn(d.tokens)} tkn`)
                  .join(", ")}`}
              >
                {dagar.map((d, i) => (
                  <div
                    key={d.datum}
                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-0.5"
                    title={`${d.datum}: ${d.tokens.toLocaleString("sv-SE")} tkn${i === dagar.length - 1 ? " (idag)" : ""}`}
                  >
                    <div
                      className={cn("w-full rounded-sm", i === dagar.length - 1 ? "bg-[#58A6FF]" : "bg-[#3FB950]")}
                      style={{ height: `${Math.max(3, Math.round((d.tokens / maxDag) * 34))}px` }}
                      aria-hidden
                    />
                    <span className="font-mono text-[8px] leading-none text-[#6E7681]">{d.etikett}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-1.5 text-[9px] leading-relaxed text-[#484F58]">
                per-dag-staplar kräver protokollets dailyModelUsage — saknas i svaret just nu.
              </p>
            )}

            {/* Modellfördelning: tokens + andel + antal anrop (0 = protokollet
                saknar räknefältet — ALDRIG påhittat). */}
            {modeller.length > 0 && (
              <ul className="mt-2 space-y-1" aria-label="Modellfördelning senaste 7 dagarna">
                {modeller.slice(0, 5).map((m) => (
                  <li
                    key={m.modell}
                    className="font-mono text-[10px]"
                    title={`${m.modell}: ${m.tokens.toLocaleString("sv-SE")} tkn${m.antal > 0 ? ` · ${m.antal} modellanrop` : ""}`}
                  >
                    <span className="flex items-baseline gap-1.5">
                      <span className="min-w-0 flex-1 truncate text-[#8B949E]">{m.modell}</span>
                      <span className="shrink-0 tabular-nums text-[#E6EDF3]">{tkn(m.tokens)}</span>
                      <span className="shrink-0 tabular-nums text-[#6E7681]">{procentText(m.andel)}</span>
                    </span>
                    <span className="mt-0.5 block h-1 overflow-hidden rounded-full bg-[#21262D]" aria-hidden>
                      <span
                        className="block h-full rounded-full bg-[#58A6FF]"
                        style={{ width: `${Math.min(100, Math.max(0, m.andel) * 100)}%` }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Sammanfattning: cache-träff · rundor · sessioner · verktyg. */}
            {(cacheProcent !== null ||
              typeof summa.totalTurns === "number" ||
              typeof summa.totalSessions === "number" ||
              typeof summa.toolCallCount === "number") && (
              <p className="mt-2 font-mono text-[9px] tabular-nums leading-relaxed text-[#6E7681]">
                {cacheProcent !== null && `cache-träff ${cacheProcent} %`}
                {typeof summa.totalTurns === "number" && ` · ${summa.totalTurns} rundor`}
                {typeof summa.totalSessions === "number" && ` · ${summa.totalSessions} sessioner`}
                {typeof summa.toolCallCount === "number" && ` · ${summa.toolCallCount} verktyg`}
              </p>
            )}

            {/* KVD-kostnadsraden: fast pris — ALDRIG påhittade kronor. */}
            <p
              className="mt-1.5 text-[9px] leading-relaxed text-[#484F58]"
              title="KVD: planen är fast pris — panelen bär token-räkningar, aldrig påhittade kronor"
            >
              Kostnad: ingår i planen (fast pris) — ingen per-token-debitering.
            </p>
            <p
              className="mt-1 font-mono text-[9px] text-[#484F58]"
              title={fel ? `Senaste fel: ${fel}` : `Transport: ${data.transport}`}
            >
              {fel ? "visar gammal data" : `uppdaterad ${hamtadKlocka}`}
              {laddar ? " · hämtar…" : ""}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
