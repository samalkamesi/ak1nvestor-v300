import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { hamtaStudioTransport, type StudioArbetsytaInfo } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/session — SESSIONSHANTERING för /studio (VÅG 82 STUDIO V2 +
 * VÅG 83 MEGA byggblock B3: SESSIONS- OCH WORKSPACE-HANTERING,
 * Z-portaLens projektnavigation).
 *
 * GET  → {sessioner:[{sessionId,titel,status,arbetsyta,uppdaterad,modell?,
 *        turns?,tokens?}], aktiv, mal, arbetsyta} via transport.lasSessioner
 *        (session/list — v83-BERIKAT: modell ur qBe.model + turns/tokens ur
 *        session/read-projektionen för topp-10) + lasMal (session/goal show)
 *        + lasArbetsyta (workspace/readState) — båda best-effort, listan
 *        lever alltid.
 * POST → {action} enligt:
 *   "ny"        → transport.nySession() → {sessionId, kontext} (v82).
 *   "compact"   → transport.compact() → {status, meddelande, kontext} (v82).
 *   "resume"    {sessionId} → session/resume + subscribe + historik via
 *                session/messages → {sessionId, historik, kontext} — så
 *                chatten fylls med den öppna sessionens historia.
 *   "stang"     {sessionId?} → session/close → {stangd:true} (sessionen
 *                finns kvar i listan men svarar inte längre).
 *   "fork"      → session/fork latestCheckpoint → {forkedSessionId?} ELLER
 *                ärligt meddelande: fork kräver checkpoint (skapas vid
 *                FILÄNDRINGAR — LIVE-bevisat v83, se protokollkarta §1).
 *   "malSatt"   {mal} → session/goal set → {mal, meddelande}.
 *   "malRensa"  → session/goal clear → {mal:null, meddelande}.
 *   "subagenter" → session/subagents → {subagenter:[{barnSessionId,titel,
 *                status,…}]} (körande + avslutade barnagenter).
 *   "avbrytTask" {taskId} → session/cancelBackgroundTask → {avbruten,
 *                meddelande} — för subagenter används childSessionId som
 *                taskId (dokumenterat i transporten).
 *   "arbetsyta" → workspace/readState → {arbetsyta:{lage,modell,…}}.
 *   "lage" {lage:"build"|"plan"} → V83 B2: session/setMode (BEVISAT LIVE,
 *                kartan §1) → {lage, kontext} — läget bevaras till nyskapade
 *                sessioner (create-param mode).
 *   "tankestyrka" {niva:"nothink"|"high"|"max"} → V83 B2: session/
 *                setThoughtLevel (BEVISAT LIVE, nivåer ur kartan §1) →
 *                {niva, kontext}.
 *
 * SKYDD: requireAdmin på båda metoderna. Svaret bär ALDRIG hemligheter —
 * sessionId är en offentlig zcode-identifierare.
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

// ── GET — sessioner (berikade) + mål + arbetsyta ─────────────────────────────

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const transport = hamtaStudioTransport();
  try {
    const sessioner = await transport.lasSessioner();
    // Mål + workspaceinfo är best-effort — sessionerna lever alltid.
    let mal: { mal: string | null; meddelande: string } | null = null;
    try {
      mal = await transport.lasMal();
    } catch {
      mal = null;
    }
    let arbetsyta: StudioArbetsytaInfo | null = null;
    try {
      arbetsyta = await transport.lasArbetsyta();
    } catch {
      arbetsyta = null;
    }
    return jsonSvar({ sessioner, aktiv: transport.sessionId(), mal, arbetsyta });
  } catch (fel) {
    return jsonSvar({
      sessioner: [],
      fel: fel instanceof Error ? fel.message.slice(0, 300) : "Sessionerna kunde ej listas.",
    });
  }
}

// ── POST — sessions-/mål-/agent-åtgärder ─────────────────────────────────────

export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  let action = "";
  let instruktioner: string | undefined;
  let sessionId = "";
  let mal = "";
  let taskId = "";
  let lage = "";
  let niva = "";
  try {
    const kropp = (await req.json()) as {
      action?: unknown;
      instruktioner?: unknown;
      sessionId?: unknown;
      mal?: unknown;
      taskId?: unknown;
      lage?: unknown;
      niva?: unknown;
    };
    if (typeof kropp.action === "string") action = kropp.action.trim();
    if (typeof kropp.instruktioner === "string" && kropp.instruktioner.trim()) {
      instruktioner = kropp.instruktioner;
    }
    if (typeof kropp.sessionId === "string") sessionId = kropp.sessionId.trim();
    if (typeof kropp.mal === "string") mal = kropp.mal;
    if (typeof kropp.taskId === "string") taskId = kropp.taskId.trim();
    if (typeof kropp.lage === "string") lage = kropp.lage.trim();
    if (typeof kropp.niva === "string") niva = kropp.niva.trim();
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }

  const transport = hamtaStudioTransport();

  try {
    if (action === "ny") {
      const sid = await transport.nySession();
      const kontext = await transport.lasKontext();
      return jsonSvar({ sessionId: sid, kontext });
    }
    if (action === "compact") {
      const svar = await transport.compact(instruktioner);
      return jsonSvar(svar);
    }
    // ── V83 B3: Z-portaLens projektnavigation ──────────────────────────────
    if (action === "resume") {
      if (!sessionId) return jsonSvar({ fel: "sessionId krävs för resume." }, 400);
      const svar = await transport.oppnaSession(sessionId);
      return jsonSvar(svar);
    }
    if (action === "stang") {
      const stangd = await transport.stangSession(sessionId || undefined);
      return jsonSvar({ stangd });
    }
    if (action === "fork") {
      const svar = await transport.forka();
      return jsonSvar(svar);
    }
    if (action === "malSatt") {
      if (!mal.trim()) return jsonSvar({ fel: "Målet är tomt." }, 400);
      const svar = await transport.sattMal(mal);
      return jsonSvar(svar);
    }
    if (action === "malRensa") {
      const svar = await transport.rensaMal();
      return jsonSvar(svar);
    }
    if (action === "subagenter") {
      const subagenter = await transport.lasSubagenter();
      return jsonSvar({ subagenter });
    }
    if (action === "avbrytTask") {
      if (!taskId) return jsonSvar({ fel: "taskId krävs för avbrytTask." }, 400);
      const svar = await transport.avbrytBakgrundsTask(taskId);
      return jsonSvar(svar);
    }
    if (action === "arbetsyta") {
      const arbetsyta = await transport.lasArbetsyta();
      return jsonSvar({ arbetsyta });
    }
    // ── V83 B2: Z-portaLens läges- + tankestyrkeväxlare ─────────────────────
    if (action === "läge" || action === "lage") {
      if (lage !== "build" && lage !== "plan") {
        return jsonSvar({ fel: 'Okänt läge — använd "build" eller "plan" (kartans mode-union).' }, 400);
      }
      const svar = await transport.sattLage(lage);
      return jsonSvar({ ...svar, kontext: await transport.lasKontext() });
    }
    if (action === "tankestyrka" || action === "tankeniva") {
      if (!["nothink", "high", "max"].includes(niva)) {
        return jsonSvar({ fel: 'Okänd tankestyrka — använd "nothink", "high" eller "max" (LIVE-nivåer, kartan §1).' }, 400);
      }
      const svar = await transport.sattTankeNiva(niva);
      return jsonSvar({ ...svar, kontext: await transport.lasKontext() });
    }
    return jsonSvar(
      {
        fel:
          'Okänd action — använd "ny", "compact", "resume", "stang", "fork", "malSatt", "malRensa", "subagenter", "avbrytTask", "arbetsyta", "läge" eller "tankestyrka".',
      },
      400,
    );
  } catch (fel) {
    return jsonSvar(
      { fel: fel instanceof Error ? fel.message.slice(0, 300) : "Ogiltig åtgärd." },
      502,
    );
  }
}
