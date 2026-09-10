import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  hamtaStudioTransport,
  StudioMetodSaknasError,
  StudioTransport,
  StudioBakgrundsjobb,
} from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/tjanster/bakgrund — BAKGRUNDSJOBBS-PANEL, FULLVY (VÅG 92 B2;
 * v91 A1d-grunden).
 *
 * GET → {poster:[{id,titel,status,startad?}]} — transport.lasBakgrundsjobb
 * (B1 våg 92: full projektionsparsning ur session/read-projektionens
 * backgroundJobs med subagenter-fallback). DENNA rutt normaliserar
 * (titel ← titel|beskrivning|typ|id; startad ← ISO-sträng eller epoktal)
 * och SORTERAR SENAST STARTAD FÖRST (oparsbar/saknad startad sist —
 * stabilt). Alias "jobb" (v91-form) behålls under integrationen.
 * Avbrytning: POST /api/studio/tjanster/bakgrund/avbryt {id} (oförändrad).
 *
 * ÄRLIG 501: protokollmetoden saknas i agent-versionen (-32601) ⇒
 * {saknas:true} med status 501 — UI:t DÖLJER panelen (aldrig ett fel-kort).
 *
 * SKYDD: requireAdmin. Pedagogisk plattform — inte investeringsråd.
 */

/** Normaliserad bakgrundspost — v92-kontraktet {id,titel,status,startad?}. */
interface BakgrundsPost {
  id: string;
  titel: string;
  status: string;
  startad?: string;
}

/** Post + sorteringstid (epoch ms; 0 = okänd/oparsbar → sorterar sist). */
interface BakgrundsPostMedTid extends BakgrundsPost {
  startadMs: number;
}

/** JSON-svar utan caching — studio-ytan får aldrig cachas. */
function jsonSvar(kropp: unknown, status = 200): Response {
  return new Response(JSON.stringify(kropp), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/** Objekt-sond: okänd protokollkropp som nyckelkarta (ALDRIG "as any"). */
function somKalla(väste: unknown): Record<string, unknown> {
  return väste !== null && typeof väste === "object" ? (väste as Record<string, unknown>) : {};
}

/** Första icke-tomma strängen bland kandidatnamnen (fältnamn varierar). */
function strangfalt(kalla: Record<string, unknown>, namn: readonly string[]): string {
  for (const n of namn) {
    const v = kalla[n];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

/**
 * Startad → {ISO-sträng?, epoch ms}: ISO-sträng tolkas med Date.parse;
 * epoktal (s eller ms — heuristik < 1e12 = sekunder) konverteras till ISO.
 * Okänd/oparsbar ⇒ ms 0 (sorterar sist) men strängen ekoas ändå om den finns.
 */
function startadFranKalla(kalla: Record<string, unknown>): { startad?: string; startadMs: number } {
  const str = strangfalt(kalla, ["startad", "startedAt", "startTime", "createdAt"]);
  if (str) {
    const ms = Date.parse(str);
    if (!Number.isNaN(ms)) return { startad: str, startadMs: ms };
    return { startad: str, startadMs: 0 };
  }
  for (const nyckel of ["startadMs", "startedAtMs", "startedAt"]) {
    const v = kalla[nyckel];
    if (typeof v === "number" && Number.isFinite(v) && v > 0) {
      const ms = v < 1e12 ? v * 1_000 : v;
      return { startad: new Date(ms).toISOString(), startadMs: ms };
    }
  }
  return { startadMs: 0 };
}

/** Transportens rad → kontraktsform (titel-fallbackkedja: beskrivning→typ→id). */
function normaliseraBakgrund(jobb: StudioBakgrundsjobb): BakgrundsPostMedTid {
  const kalla = somKalla(jobb);
  const { startad, startadMs } = startadFranKalla(kalla);
  return {
    id: jobb.id,
    titel:
      strangfalt(kalla, ["titel", "title"]) ||
      (typeof jobb.beskrivning === "string" && jobb.beskrivning.trim()) ||
      (typeof jobb.typ === "string" && jobb.typ.trim()) ||
      jobb.id,
    status: (typeof jobb.status === "string" && jobb.status.trim()) || "okänd",
    ...(startad ? { startad } : {}),
    startadMs,
  };
}

/** 501/502-vakt: transportmetoden saknas (-32601) ⇒ ärlig {saknas:true}. */
function svarVidTransportFel(fel: unknown, standard: string): Response {
  if (fel instanceof StudioMetodSaknasError || (fel as { saknas?: boolean })?.saknas === true) {
    return jsonSvar(
      { saknas: true, fel: fel instanceof Error ? fel.message : "Metoden stöds ej." },
      501,
    );
  }
  return jsonSvar(
    { fel: fel instanceof Error ? fel.message.slice(0, 300) : standard },
    502,
  );
}

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const transport: StudioTransport = hamtaStudioTransport();
  try {
    const jobb = await transport.lasBakgrundsjobb();
    // SENAST STARTAD FÖRST (descending); okänd startad (ms 0) sist —
    // Array#sort är stabil i Node ≥ 12, behåller inkomstång ordning.
    const medTid = jobb.map(normaliseraBakgrund);
    medTid.sort((a, b) => b.startadMs - a.startadMs);
    const poster: BakgrundsPost[] = medTid.map(({ id, titel, status, ...rest }) => ({
      id,
      titel,
      status,
      ...(rest.startad ? { startad: rest.startad } : {}),
    }));
    return jsonSvar({ poster, jobb });
  } catch (fel) {
    return svarVidTransportFel(fel, "Bakgrundsjobben kunde ej listas.");
  }
}
