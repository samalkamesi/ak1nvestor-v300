import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { lasAutomationer, sparaAutomationer } from "@/lib/studio/automation-register";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/tjanster/automation/pausa — PAUSA/AKTIVERA (våg 166: NATIV)
 * =====================================================================
 * Tidigare (v92): automation/update via protokollet — trasigt sedan länge
 * (runtinen exponerar ej automation/* på vår kanal, -32601; verktygs-
 * auditen 2026-09-15). Nu: registret på disk är sanningsägaren —
 * POST {id, pausad:boolean} vänder aktiv-flaggan; motorn respekterar den
 * vid nästa minutavslag. SKYDD: requireAdmin.
 */

const MAX_ID_TEEKEN = 200;

function jsonSvar(kropp: unknown, status = 200): Response {
  return new Response(JSON.stringify(kropp), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;
  let id = "";
  let pausad = true;
  try {
    const kropp = (await req.json()) as { id?: unknown; pausad?: unknown };
    if (typeof kropp.id === "string") id = kropp.id.trim();
    if (typeof kropp.pausad === "boolean") pausad = kropp.pausad;
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }
  if (!id || id.length > MAX_ID_TEEKEN) {
    return jsonSvar({ fel: `id krävs (max ${MAX_ID_TEEKEN} tecken).` }, 400);
  }
  const lista = lasAutomationer();
  const a = lista.find((x) => x.id === id);
  if (!a) return jsonSvar({ fel: "Automationen finns ej." }, 404);
  a.aktiv = !pausad;
  sparaAutomationer(lista);
  return jsonSvar({
    id: a.id,
    namn: a.namn,
    aktiverad: a.aktiv,
    status: a.aktiv ? "aktiv" : "pausad",
  });
}
