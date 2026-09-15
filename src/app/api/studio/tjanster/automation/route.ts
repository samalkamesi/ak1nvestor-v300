import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  arGiltigtCron,
  lasAutomationer,
  nyAutomationId,
  sparaAutomationer,
  type AutomationRad,
} from "@/lib/studio/automation-register";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/tjanster/automation — NATIV AUTOMATIONS-TJÄNST (våg 166)
 * =====================================================================
 * Verktygsauditen 2026-09-15 (kundkrav: "inga falska verktyg — 100 % på
 * riktigt"): runtinens automation/*-metoder är INTE exponerade på
 * app-server-kanalen (-32601, live-bevisat) — denna tjänst var en 501-
 * stubb sedan våg 91. Nu: ÄKTA NATIV MOTOR — registret på disk
 * (data/vakten/automations.json) + verktyg/automation-motor.mjs i
 * pumpor-daemonen eldar varje cron-matchande minut via /api/studio/stream.
 *
 * GET    → { poster:[{id,namn,schema,status,aktiverad,prompt,
 *           senasteKorning,korningar}], automationer:samma }
 * POST   {namn, schema, prompt} → skapar (STRIKT 5-fälts-cron — naturligt
 *           språk avvisas ärligt: motorn är mekanisk, inget påhitt)
 * DELETE ?id=… → raderar
 *
 * SKYDD: requireAdmin. Prompt-tak 2 000 tkn; namn 1–80; inga hemligheter.
 * Pedagogisk plattform — automationer bär sitt eget innehållsansvar
 * (motorn prefixar AUTOMATION-rubriken; ALDRIG investeringsråd).
 */

interface AutomationSvarPost {
  id: string;
  namn: string;
  schema: string;
  status: string;
  aktiverad: boolean;
  prompt: string;
  senasteKorning?: string;
  korningar?: number;
}

function tillSvar(a: AutomationRad): AutomationSvarPost {
  return {
    id: a.id,
    namn: a.namn,
    schema: a.schema,
    status: a.aktiv ? "aktiv" : "pausad",
    aktiverad: a.aktiv !== false,
    prompt: a.prompt,
    ...(a.senasteKorning ? { senasteKorning: a.senasteKorning } : {}),
    ...(typeof a.korningar === "number" ? { korningar: a.korningar } : {}),
  };
}

function jsonSvar(kropp: unknown, status = 200): Response {
  return new Response(JSON.stringify(kropp), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;
  const poster = lasAutomationer().map(tillSvar);
  return jsonSvar({ poster, automationer: poster, motor: "nativ (v166)" });
}

export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;
  let namn = "";
  let schema = "";
  let prompt = "";
  try {
    const kropp = (await req.json()) as { namn?: unknown; schema?: unknown; prompt?: unknown };
    if (typeof kropp.namn === "string") namn = kropp.namn.trim();
    if (typeof kropp.schema === "string") schema = kropp.schema.trim();
    if (typeof kropp.prompt === "string") prompt = kropp.prompt.trim();
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }
  if (!namn || namn.length > 80) {
    return jsonSvar({ fel: "namn krävs (1–80 tecken)." }, 400);
  }
  if (!arGiltigtCron(schema)) {
    return jsonSvar(
      {
        fel:
          "schema krävs som STRIKT 5-fälts-cron (min tim dag-i-månad månad veckodag — *, komma, bindestreck, snedsteg). " +
          "Nativa motorn är mekanisk: naturligt språk kan inte tolkas ärligt.",
      },
      400,
    );
  }
  if (!prompt || prompt.length > 2_000) {
    return jsonSvar({ fel: "prompt krävs (max 2 000 tecken)." }, 400);
  }
  const ny: AutomationRad = {
    id: nyAutomationId(),
    namn,
    schema,
    prompt,
    aktiv: true,
    skapad: Date.now(),
    korningar: 0,
  };
  const lista = [...lasAutomationer().filter((a) => a.id !== ny.id), ny];
  sparaAutomationer(lista);
  return jsonSvar({ skapad: tillSvar(ny), poster: lista.map(tillSvar) });
}

export async function DELETE(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;
  const id = req.nextUrl.searchParams.get("id")?.trim() ?? "";
  if (!id) return jsonSvar({ fel: "id krävs (?id=…)." }, 400);
  const lista = lasAutomationer();
  const kvar = lista.filter((a) => a.id !== id);
  if (kvar.length === lista.length) return jsonSvar({ fel: "Automationen finns ej." }, 404);
  sparaAutomationer(kvar);
  return jsonSvar({ raderad: id, poster: kvar.map(tillSvar) });
}
