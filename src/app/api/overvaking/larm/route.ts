import { NextRequest, NextResponse } from "next/server";

import {
  appenderaExterntLarm,
  hashaIpFranRequest,
  tokenStammer,
  utdragLarmToken,
} from "@/lib/overvaking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/overvaking/larm (VÅG 122B, beslut mtzou25g åtgärd 2) — POST-
 * mottagare för externa bevakares webhook-larm (t.ex. UptimeRobot
 * "site down" mot /api/overvaking/status). Mottagarplattformen lever
 * REDAN; kontot hos bevakningstjänsten + tokenen är kundens beslut
 * (R2) — instruktion: data/forskning/EXTERN-OVERVAKNING.md.
 *
 * SÄKERHET (död-säker default):
 *  - Kräver token (query "token", header "x-overvaking-token" eller
 *    "Authorization: Bearer") jämförd TIMING-SÄKERT mot
 *    process.env.OVERVAKNING_TOKEN.
 *  - OVERVAKNING_TOKEN ej satt ⇒ 403 {ok:false, orsak:...} — mottagaren
 *    förblir STÄNGD tills kunden aktiverar. Aldrig öppen per default.
 *  - IP hashas ALLTID (SHA-256, saltad) — rå IP sparas ALDRIG.
 *  - Body saneras som i webhook/vbt: endast korta typ/event-namn plockas
 *    ut, ALDRIG rå payload (kan innehålla okänd data vi inte ska lagra).
 *  - Inga nätverkskopplingar styrs av request-data.
 *
 * ROBUSTHET: skrivningen till data/vakten/externa-larm.log sker HELT i
 * try/catch — skrivfel kastar ALDRIG (svar 200 med varning i svaret), så
 * ett fullt diskutrymme inte fejkade extra nedtider hos bevakaren.
 * Gränsnittsvaktens cron läser loggen och larmar AI-sessionen (samma
 * pump som övrig drift — inga nya bakgrundsprocesser behövs).
 */

/** Tak på body-läsningen — bevakare skickar små payloader. */
const MAX_BODY = 16 * 1024;

export async function POST(req: NextRequest) {
  const vantan = process.env.OVERVAKNING_TOKEN;
  if (!vantan) {
    return NextResponse.json(
      { ok: false, orsak: "OVERVAKNING_TOKEN ej konfigurerad" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (!tokenStammer(utdragLarmToken(req), vantan)) {
    return NextResponse.json(
      { ok: false, orsak: "ogiltig token" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  // Body — SANERAD läsning: plocka endast korta identifierare, aldrig rå.
  let kalla = "extern-bevakare";
  try {
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY) {
      return NextResponse.json(
        { ok: false, orsak: "payload_too_large" },
        { status: 413, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (raw) {
      const j = JSON.parse(raw) as Record<string, unknown>;
      const kandidat =
        (typeof j.monitorName === "string" && j.monitorName) ||
        (typeof j.type === "string" && j.type) ||
        (typeof j.event === "string" && j.event) ||
        "";
      if (kandidat) kalla = kandidat.slice(0, 60);
    }
  } catch {
    kalla = "extern-bevakare/ogiltig-json"; // 200 ändå — bevakaren ska inte spamma om
  }

  // IP hashas innan raden byggs — rå IP lämnar aldrig detta block.
  const varning = await appenderaExterntLarm({
    tid: new Date().toISOString(),
    kalla,
    ipHash: hashaIpFranRequest(req),
  });

  return NextResponse.json(
    varning ? { ok: true, varning } : { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** GET → 405 — detta är en mottagare, inte en läs-yta. */
export async function GET() {
  return NextResponse.json(
    { ok: false, orsak: "endast POST" },
    { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } },
  );
}
