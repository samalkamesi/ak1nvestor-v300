import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  hamtaStudioTransport,
  hamtaTransportMedInteraktion,
  lasAllaInteraktioner,
} from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/interaktion — SVARSVÄGEN för Z-portaLens godkännandeflöde
 * (VÅG 83 MEGA bygg-B2, STUDIO=Z). Protokollets server→klient-requests
 * interaction/requestPermission + interaction/requestUserInput landar i
 * transportens register (se studio-transport.ts) och publiceras som
 * dialogkort i chatten via SSE-eventet "interaktion". Denna rutt är
 * motsatt riktning: ANVÄNDARENS VAL → protokollsvar.
 *
 * GET  → {interaktioner:[{typ:"permission"|"fråga", requestId, …}]} —
 *        väntande dialoger (ett refreshat UI återfår kortet; samma lista
 *        följer med i GET /api/studio/stream).
 * POST → {typ:"permission", requestId, alternativ:"allow_once"|
 *        "allow_project"|"deny"} → transport.svarPermission — svaret blir
 *        protokollets z2-form ({decision, reason, permissionUpdates} vid
 *        allow_project: addRules för verktyget). ok:false (409) = begäran
 *        redan besvarad/eskalerad (t.ex. 30 s-defaulten eller annat flik).
 *        {typ:"fråga", requestId, varde:"…"} → {value} |
 *        {typ:"fråga-avbryt", requestId} → {cancelled:true}.
 *
 * SKYDD: requireAdmin på båda metoderna — ett godkännande är en
 * behörighetshandling och får ALDRIG vara anonymt. Svaren bär inga
 * hemligheter (verktygsnamn + argument-summary är protokollets egna,
 * redan sanerade fält).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** JSON-svar utan caching — studio-ytan får aldrig cachas. */
function jsonSvar(kropp: unknown, status = 200): Response {
  return new Response(JSON.stringify(kropp), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

// ── GET — väntande interaktioner ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;
  // V84 B: ALLA transporters dialoger (default + per-session-tabbar) — ett
  // refreshat UI återfår kortet oavsett vilken tabb som väntar.
  return jsonSvar({ interaktioner: lasAllaInteraktioner() });
}

// ── POST — användarens val → protokollsvar ──────────────────────────────────

export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  let kropp: { typ?: unknown; requestId?: unknown; alternativ?: unknown; varde?: unknown };
  try {
    kropp = (await req.json()) as typeof kropp;
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }

  const typ = typeof kropp.typ === "string" ? kropp.typ : "";
  const requestId = typeof kropp.requestId === "string" ? kropp.requestId : "";
  if (!requestId) return jsonSvar({ fel: "requestId saknas." }, 400);

  // V84 B: dialogen kan komma från VILKEN tabb som helst — slå upp ägaren
  // (per-session-register först av naturliga skäl), fall tillbaka på
  // default-transporten (bakåtkompatibel ärlig 409 om id:t är okänt).
  const transport = hamtaTransportMedInteraktion(requestId) ?? hamtaStudioTransport();
  try {
    if (typ === "permission") {
      const alternativ = typeof kropp.alternativ === "string" ? kropp.alternativ : "";
      if (!alternativ) return jsonSvar({ fel: "alternativ saknas (allow_once|allow_project|deny)." }, 400);
      const svar = await transport.svarPermission(requestId, alternativ);
      // 409 = begäran finns ej/reds besvarad — UI:t stänger dialogen ändå.
      return jsonSvar(svar, svar.ok ? 200 : 409);
    }
    if (typ === "fråga" || typ === "fraga") {
      const varde = typeof kropp.varde === "string" ? kropp.varde : "";
      if (!varde) return jsonSvar({ fel: "varde saknas." }, 400);
      const svar = await transport.svarFraga(requestId, { varde });
      return jsonSvar(svar, svar.ok ? 200 : 409);
    }
    if (typ === "fråga-avbryt" || typ === "fraga-avbryt") {
      const svar = await transport.svarFraga(requestId, { avbruten: true });
      return jsonSvar(svar, svar.ok ? 200 : 409);
    }
    return jsonSvar(
      { fel: 'Okänd typ — använd {"typ":"permission"|"fråga"|"fråga-avbryt"}.' },
      400,
    );
  } catch (fel) {
    return jsonSvar(
      { fel: fel instanceof Error ? fel.message.slice(0, 300) : "Svaret kunde ej levereras." },
      502,
    );
  }
}
