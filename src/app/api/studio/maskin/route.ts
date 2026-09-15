import { NextRequest } from "next/server";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

import { requireAdmin } from "@/lib/admin-auth";
import { hamtaStudioTransport } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/maskin — MASKINENS PULS (våg 164, kundfrågan "jobbar loopen?
 * jag ser ej sådant"): samlar ALL bakgrundsaktivitet i ETT svar så studion
 * kan VISA den levande organismen — mål/order, fabrikens omgångar, hjärtat,
 * auditens senaste autonoma handlingar, vaktdomar och uppdragsloggen.
 *
 * GET → { ts, mal:{…}, malFranDisk, fabrik:{manifestationer:[…], ko:[…]},
 *         hjarta:[…], audit:[…], uppdrag:[…], vakter:{juridik, scenario},
 *         synk:[…] }
 *
 * Läser ENDAST statusfiler/loggar under data/vakten + mål-minne (billigt —
 * pumpvänligt). requireAdmin. Inga hemligheter lämnar servern.
 */

interface FabrikManifest {
  id: string;
  status: string;
  klara: number;
  totalt: number;
}

function lasJson(sokvag: string): unknown {
  try {
    return JSON.parse(readFileSync(sokvag, "utf8"));
  } catch {
    return null;
  }
}

function svans(sokvag: string, antalRader: number, maxLangd = 220): string[] {
  try {
    return readFileSync(sokvag, "utf8")
      .trim()
      .split("\n")
      .slice(-antalRader)
      .map((r) => r.slice(0, maxLangd));
  } catch {
    return [];
  }
}

function jsonlSvans(sokvag: string, antal: number): unknown[] {
  try {
    return readFileSync(sokvag, "utf8")
      .trim()
      .split("\n")
      .slice(-antal)
      .map((r) => {
        try {
          return JSON.parse(r);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function lasFabrik(fabrikKat: string): { manifestationer: FabrikManifest[]; ko: string[] } {
  const manifestationer: FabrikManifest[] = [];
  const ko: string[] = [];
  const statusKat = path.join(fabrikKat, "status");
  const koKat = path.join(fabrikKat, "ko");
  try {
    for (const f of readdirSync(statusKat)) {
      if (!f.endsWith(".json")) continue;
      const j = lasJson(path.join(statusKat, f)) as
        | { id?: unknown; status?: unknown; totalt?: unknown; klara?: unknown }
        | null;
      if (!j || typeof j.id !== "string") continue;
      manifestationer.push({
        id: j.id,
        status: typeof j.status === "string" ? j.status : "?",
        klara: Array.isArray(j.klara) ? j.klara.length : 0,
        totalt: typeof j.totalt === "number" ? j.totalt : 0,
      });
    }
  } catch {
    /* statuskatalogen lever sin egen rundas */
  }
  try {
    for (const f of readdirSync(koKat)) {
      if (f.endsWith(".json")) ko.push(f.replace(".json", ""));
    }
  } catch {
    /* kön kan vara tom */
  }
  return { manifestationer, ko };
}

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const VAKT = path.join(process.cwd(), "data", "vakten");

  // Mål/order — levande transport-minne + disk-sanning.
  const transport = hamtaStudioTransport();
  let mal: Record<string, unknown> = { mal: null, aktiv: false, pausad: false };
  try {
    const m = transport.malStatus();
    mal = {
      mal: m.mal,
      aktiv: m.aktiv,
      pausad: m.pausad,
      iteration: m.iteration,
      pagaendeTurn: m.pagaendeTurn === true,
      sessionId: m.sessionId,
      arKunduppdrag: typeof m.mal === "string" && m.mal.startsWith("KUNDUPPDRAG"),
    };
  } catch {
    /* disk-värdet nedan gäller */
  }
  const malDisk = lasJson(path.join(VAKT, "mal-state.json")) as { mal?: string } | null;

  const fabrik = lasFabrik(path.join(VAKT, "agentfabrik"));
  const hjarta = svans(path.join(VAKT, "hjartslag.log"), 4);
  const audit = jsonlSvans(path.join(VAKT, "audit-logg.jsonl"), 8);
  const uppdrag = jsonlSvans(path.join(VAKT, "uppdragslogg.jsonl"), 5);
  const juridikFil = lasJson(path.join(VAKT, "juridik-larm.json")) as
    | { senasteKorning?: unknown }
    | null;
  const synk = svans(path.join(VAKT, "prod-synk.log"), 2);
  // VÅG 168 (integration-audit p7): tre pumpor var osynliga — nu synliga
  const feljakt = svans(path.join(VAKT, "feljakt-fynd.jsonl"), 3, 200);
  const konfiglarm = svans(path.join(VAKT, "konfig-larm.jsonl"), 2, 200);
  const automationer = lasJson(path.join(VAKT, "automations.json")) as
    | { automationer?: { namn?: string; aktiv?: boolean; senasteKorning?: string }[] }
    | null;
  const scenario = svans(path.join(VAKT, "scenariotest.log"), 1);

  return new Response(
    JSON.stringify({
      ts: Date.now(),
      mal,
      malFranDisk: malDisk && typeof malDisk.mal === "string" ? malDisk.mal.slice(0, 300) : null,
      fabrik,
      hjarta,
      audit,
      uppdrag,
      vakter: {
        juridik: juridikFil ? juridikFil.senasteKorning ?? null : null,
        scenario: scenario.length > 0 ? scenario[scenario.length - 1] : null,
      },
      synk,
      // VÅG 168 (integration-audit p7): tre saknade pumpor
      feljakt,
      konfiglarm,
      automationer: automationer?.automationer?.slice(0, 5) ?? [],
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    },
  );
}
