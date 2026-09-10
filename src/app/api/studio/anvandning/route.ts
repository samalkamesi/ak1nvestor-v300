import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { hamtaStudioTransport } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/anvandning — USAGE/COST-PANELENS DATAKÄLLA (VÅG 85 STUDIO V3,
 * STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 85" F3).
 *
 * GET (requireAdmin) → usage/stats-svaret RÅTT + berikade fält:
 *   {
 *     hamtat, transport, live,
 *     usage:                <DET RÅA usage/stats-svaret (range "7d")>,
 *     totalTokens7d:        summary.totalTokens (7 dagar),
 *     totalTokens24h:       24 h-uppskattning (session/usage över sessioner
 *                           aktiva senaste dygnet; reserv dygnsmedel 7d/7),
 *     kalla24h:             "sessioner" | "snitt" | "okand",
 *     modellFordelning:     [{modell, tokens, antal, andel}] — byModel,
 *                           störst först (stapelordningen),
 *     sammanfattning:       {inputTokens, outputTokens, reasoningTokens,
 *                           cacheReadTokens, cacheCreationTokens,
 *                           cacheHitRate, totalSessions, totalTurns,
 *                           toolCallCount}
 *   }
 *
 * KOSTNADS-ÄRLIGHET (KVD, kundens direktiv): GLM Coding Plan är PAUSPRIS
 * (~$3/mo fast) — svaret bär ENDAST token-räkningar. ALDRIG "du har betalat
 * X kr" — UI:t visar "ingår i planen" + modellfördelningen.
 *
 * 60 s memo-cache i processen (puls-ruttens mönster — panelen pollar
 * var 60:e sekund och usage/stats ska inte bankas på zcode-app-servern
 * i onödan). Transportfel ⇒ 200 + {live:false, fel} — panelen visar ett
 * ärligt frånräknat kort, aldrig krasch.
 *
 * SKYDD: requireAdmin — läsning, admin-only. Inga nycklar, inga sökvägar
 * ur svaret (usage/stats bär endast aggregat).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** 60 s memo-cache i processen (panelen pollar var 60:e sekund). */
const CACHE_MS = 60_000;

interface AnvandningSvar {
  hamtat: string;
  transport: string;
  live: boolean;
  /** Det RÅA usage/stats-svaret — oförändrat (API-kontraktet våg 85 F3). */
  usage: unknown | null;
  totalTokens7d: number;
  totalTokens24h: number;
  kalla24h: "sessioner" | "snitt" | "okand";
  modellFordelning: { modell: string; tokens: number; antal: number; andel: number }[];
  sammanfattning: {
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

/** Bygg svaret ur transportens lasUsage() — kastar vid protokollfel. */
async function byggSvar(): Promise<AnvandningSvar> {
  const transport = hamtaStudioTransport();
  const u = await transport.lasUsage();
  return {
    hamtat: new Date().toISOString(),
    transport: transport.namn,
    live: true,
    usage: u.råSvar,
    totalTokens7d: u.totalTokens,
    totalTokens24h: u.totalTokens24h,
    kalla24h: u.kalla24h,
    modellFordelning: u.modeller,
    sammanfattning: {
      inputTokens: u.inputTokens,
      outputTokens: u.outputTokens,
      reasoningTokens: u.reasoningTokens,
      cacheReadTokens: u.cacheReadTokens,
      cacheCreationTokens: u.cacheCreationTokens,
      cacheHitRate: u.cacheHitRate,
      totalSessions: u.totalSessions,
      totalTurns: u.totalTurns,
      toolCallCount: u.toolCallCount,
    },
  };
}

// ── 60 s memo-cache (puls-ruttens mönster — pågående hämtning delas) ────────

let cacheLovelse: Promise<AnvandningSvar> | null = null;
let cacheSatt = 0;

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  if (!cacheLovelse || Date.now() - cacheSatt >= CACHE_MS) {
    cacheSatt = Date.now();
    cacheLovelse = byggSvar();
  }
  try {
    return Response.json(await cacheLovelse, { headers: { "Cache-Control": "no-store" } });
  } catch (fel) {
    cacheLovelse = null; // oväntat fel ⇒ nästa anrop mäter om
    return Response.json(
      {
        hamtat: new Date().toISOString(),
        transport: hamtaStudioTransport().namn,
        live: false,
        usage: null,
        totalTokens7d: 0,
        totalTokens24h: 0,
        kalla24h: "okand",
        modellFordelning: [],
        sammanfattning: {},
        fel:
          fel instanceof Error
            ? `usage/stats kunde ej hämtas: ${fel.message.slice(0, 300)}`
            : "usage/stats kunde ej hämtas (okänt fel).",
      } satisfies AnvandningSvar,
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
}
