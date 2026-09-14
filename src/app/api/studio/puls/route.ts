import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  hamtaStudioTransport,
  lasAllaInteraktioner,
  lasStudioPulsUnderlag,
} from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/puls — LÄTTVIKTSPULS (VÅG 156, R2-FAS 2 "kapitelverkställning"
 * enligt data/forskning/zcode-kallkod/R2-POLL.md §6-7).
 *
 * GET → { turnCount, senasteAktivitet, malAktiv, revision } — en BILLIG
 * versionsfråga som klientens reconnect-poll (studio-chat.tsx) frågar var
 * 5:e sekund; den TUNGA hel-GET:en (/api/studio/stream: transport-historik
 * + kontext + HELA tråden ur db.sqlite + interaktioner + karta) körs ENDAST
 * när revisionen ändras. Detta är officiella TUI:ns runtime-poll-mönster
 * översatt till HTTP: "polla ofta, arbeta bara på förändring" — TUI:n gör
 * isDeepStrictEqual in-process (runtime-poll.ts:30-32); vi gör det med en
 * revisionskomposit som klienten jämför som sträng.
 *
 * KOSTNAD (mikrosekunder — ALLT processminne, INGEN sqlite, INGEN
 * barnprocess, inget nät):
 *   · lasStudioPulsUnderlag — sessionskartan (Map i minnet; disk-hydrering
 *     är engångs per process).
 *   · malStatus() — transportens lokala mål-fält (sync spegling; SONDEN
 *     (sondMal) körs INTE här — den frågar barnet och hör hemma i
 *     mal/status-pollen, ej i en 5 s-puls).
 *   · lasAllaInteraktioner — itererar transporternas interaktions-mappar.
 *
 * revision = "<senasteAktivitet>|<turnCount>|<aktivaSessioner>|<malAktiv>|
 * <antalInteraktioner>" — varje del är en förändring klientens tunga GET
 * skall se: ny prompt/svar (turnCount + senasteAktivitet), session start/
 * slut (aktivaSessioner), mål på/av (malAktiv), väntande dialog-kort
 * (interaktioner — 10X p7-återställningen). Monoton ogiltigförklaring vid
 * pm2-omstart (allt börjar om) är oskyldig: klienten kör då en extra
 * synk-GET. SKYDD: requireAdmin — studions yta är aldrig öppen.
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

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const underlag = lasStudioPulsUnderlag();
  let malAktiv = false;
  try {
    malAktiv = hamtaStudioTransport().malStatus().aktiv === true;
  } catch {
    malAktiv = false; // transporten kunde ej skapas — ärlig false, aldrig 500
  }
  const antalInteraktioner = lasAllaInteraktioner().length;
  const revision =
    `${underlag.senasteAktivitet}|${underlag.turnCount}|${underlag.aktivaSessioner}` +
    `|${malAktiv ? 1 : 0}|${antalInteraktioner}`;
  return jsonSvar({
    turnCount: underlag.turnCount,
    senasteAktivitet: underlag.senasteAktivitet,
    malAktiv,
    revision,
  });
}
