import { NextResponse, NextRequest } from "next/server";
import { publiceraOrganEvent } from "@/lib/organ-event";
import { gallraUpphordaElever } from "@/lib/rapportakademin/gallring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/rapportakademin-gallring — GALLRINGSJOBBET (BESLUT 1 §2,
 * LAGBESLUT STYRELSE-MUADCVYF-CG1JM2 2026-09-21; GDPR art 5.1 e).
 *
 * Detta är den motor som gör BESLUT 1.2:s "radering sker AUTOMATISKT när
 * prenumerationen/förhållandet upphör" maskinellt verksamt: gallring.ts
 * kodade jobbet (idempotent, kvitto per elev med bakomliggande lagrum) men
 * hade ingen anropare — denna rutt ropas dagligen 04:41 av pumpor-daemonen
 * (curl mot 127.0.0.1, crontab-familjens mönster utan att röra /etc/crontab).
 *
 * Syskonens skydd och kanonisering (se /api/cron/kvalitet):
 *   · CRON_SECRET, om satt, krävs via ?secret= eller Authorization: Bearer.
 *   · Feltexter stannar i serverloggen — utåt går enbart antal (system-
 *     gränsen kanoniserar; gallring.ts fel-rad bär authId-prefix som inte
 *     skall läcka till en godtycklig ropare).
 *   · OrganEvent publiceras alltid (nervsystemet skall aldrig döda jobbet).
 */

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const qs = req.nextUrl.searchParams.get("secret");
    const auth = req.headers.get("authorization");
    if (qs !== secret && auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const r = await gallraUpphordaElever();

  if (r.fel.length > 0) {
    console.error("[cron/ra-gallring] fel:", r.fel.join(" | "));
  }

  await publiceraOrganEvent({
    source: "organ/ra-gallring",
    verb: "atgard",
    matt: {
      gallrade: r.gallrade,
      raderadeRader: r.raderadeRader,
      felAntal: r.fel.length,
      status: r.fel.length === 0 ? "GRÖN" : "GUL",
    },
  });

  return NextResponse.json({
    ok: r.fel.length === 0,
    gallrade: r.gallrade,
    raderadeRader: r.raderadeRader,
    felAntal: r.fel.length,
    disclaimer: "Pedagogisk analys — inte investeringsråd",
  });
}
