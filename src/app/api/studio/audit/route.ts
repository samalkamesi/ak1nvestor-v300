/**
 * /api/studio/audit — AUDIT-LOGGENS LÄS-YTA (mega g3 — styrelsens beslut
 * punkt 3): append-only spårbarhet för organismeras autonoma skrivningar.
 *
 * GET → { antal, rader[] } — de sista 200 audit-raderna (äldst→nyast) ur
 *       data/vakten/audit-logg.jsonl. Raderna bär endast ts/aktor/atgard/
 *       artefakt/detalj — skrivaren slår redan UT hemligheter innan raden
 *       någonsin skrivs (dubbel gräns: ALDRIG hemligheter i svaret heller).
 *
 * SKYDD: requireAdmin (admin-only — sessionscookie ak1a_admin eller
 * x-admin-password, samma som övriga studio-rutter). Spårbarheten är
 * intern driftdata: oauktoriserade klienter får den ALDRIG.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { lasAuditRader } from "@/lib/studio/audit-logg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — sista 200 audit-raderna (fasta taket är medvetet: läs-yta, ej dump). */
export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const rader = lasAuditRader(200);
  return new Response(JSON.stringify({ antal: rader.length, rader }), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
