import { lasStudioHalsa } from "@/lib/studio/studio-transport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/studio/halsa — STUDIONS HÄLSA (VÅG 90 STABILITET, STYRELSE-
 * ADMIN-MEGA "TILLÄGG VÅG 90" K1: kundklagomål "de är sega, jobbar ej
 * i timmar om det behövs, stänger av sig" — synligheten som gör instabilitet
 * DIAGNOSERBAR på Contabo-proden).
 *
 * GET → lasStudioHalsa() från transportlagret:
 *   · barn      — en post per zcode-app-server-barnprocess: pid, levande,
 *     RAM i MB (ur /proc/<pid>/statm — Linux/prod; null i dev på Windows),
 *     omstartsförsök (0–3) och om den är default-transporten (huvudtabben)
 *   · antalBarnprocesser — levande barn just nu (mot maxAktivaBarn=3)
 *   · sessionerIKarta — sessioner i sessionskartan (minne + disk)
 *   · tabbar — per-session-tabbar i transportregistret
 *   · senasteOmstart — senaste LYCKADE automatiska barnomstart (epoch ms)
 *   · senasteFel — senaste död/omstart-fel (tid + trunkerad text)
 *   · processUppstartad / plattform / node — driftsammanhang
 *
 * SKYDD (VÅG 90 K1-beslut): INGEN autentisering — rutten är avsett för
 * snabb driftkoll (curl/övervakning) och läcker ALDRIG hemligheter: inga
 * API-nycklar, inga sökvägar, inga session-id:n, inga prompter/historik —
 * endast räknare, pid:n och tillstånd. Feltexter trunkeras i transporten
 * och bär protokollfelkoder, inte miljövariabler.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
export async function GET() {
  const halsa = lasStudioHalsa();
  return new Response(JSON.stringify(halsa), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store", // hälsan får aldrig cachas
    },
  });
}
