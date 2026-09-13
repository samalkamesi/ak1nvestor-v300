import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/overvaking/status (VÅG 122B, styrelsebeslut mtzou25g åtgärd 2) —
 * PUBLIK leveransindikator för EXTERN bevakning utanför Contabo-servern
 * (t.ex. UptimeRobot, se data/forskning/EXTERN-OVERVAKNING.md).
 *
 * VARFÖR den finns: servern kan inte larma om sig själv — faller hela
 * Contabo-boxen (ström, nät, pm2) tystnar ALL intern övervakning med den.
 * En bevakare UTANFÖR servern pollar denna rutt och larmar kunden (mejl)
 * samt AI-sessionen (webhook → /api/overvaking/larm) när svaret uteblir.
 *
 * Designregler (hårda):
 *  - REN LEVERANSINDIKATOR: inga Supabase-anrop, ingen fil-läsning, inga
 *    hemligheter, ingen persondata (GDPR-ren — svaret är identiskt för
 *    alla). Det enda som kan gå fel här är själva processen/nätverket —
 *    vilket är exakt det bevakaren ska upptäcka.
 *  - force-dynamic + Cache-Control: no-store — en bevakare ska ALLTID få
 *    färskt svar, aldrig ett CDN-cachat "ok" från en död server.
 *  - Snabb: svaret byggs av två literals + en klock läsning. Microsekunder.
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      app: "ak1a",
      tid: new Date().toISOString(),
      miljo: process.env.NODE_ENV === "production" ? "prod" : "dev",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
