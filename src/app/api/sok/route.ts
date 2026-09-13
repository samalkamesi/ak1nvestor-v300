/**
 * GET /api/sok?q=<text>&lang=sv|en|ar — SERVER-SIDIG SAJTSÖKNING (våg 122E,
 * styrelsebeslut mtzou25g åtgärd 5: "säkra sajtsökningen — server-side sök
 * med cache och reservlösning på eget innehåll").
 *
 * KONTRAKT FÖR PULSVAKTEN (byggs parallellt — detta är kanonisk spec):
 *   GET /api/sok?q=akm2  →  KRÄVER: status 200 + Content-Type JSON.
 *   Vakten får kallas VARJE MINUT — indexet lever i minnet (module-scope,
 *   revalidering max 1/h) så varje anrop är billigt; ett anrop utan q
 *   svarar 400 (vakten SKICKAR alltid q).
 *
 * Svar (200): { q, lang, antal, resultat: [{ titel, url, typ, utdrag }] }
 *   – max 20 träffar, rankning enkel (prefix > substräng), åäö-normaliserad
 *     ("forvaltning" hittar "förvaltning"), url:er procentkodade; speglade
 *     poster får /en- eller /ar-prefix när lang=en|ar.
 *   – söker ENDAST eget innehåll (kurser, aktieanalyser, blogg, statiska
 *     sidor) och ENDAST gäst-synliga poster (publikt API — medlem/fas/
 *     admin-ytor läcks aldrig). Utbildningsinnehåll, aldrig råd.
 * Svar (400): { fel: "q krävs" } — q tomt/whitespace. ALDRIG 500: index-
 *   bortfall serveras ur reserven (inbakade huvudsidor), tomt resultat är
 *   OK vid tom data (datacache.ts-andan: cachen är accelerator, ej beroende).
 *
 * Cache-Control: 200-svaret får CDN/proxy-cachas 60 s (s-maxage) — sök-
 * resultaten åldras långsamt (indexet revalideras max 1/h) och inget fel
 * kan fryser längre än så; 400 cachelagras aldrig (no-store).
 * JSON-only: strängar escapes av JSON.stringify — XSS-säker genom
 * konstruktion (ingen HTML-rendering, ingen eval, inga råa svar).
 */
import { sokServerSide, type SokTräff } from "@/lib/sok-server";

export const runtime = "nodejs"; // läsning av indexfiler från disk (fs)
export const dynamic = "force-dynamic"; // query-parametrar ⇒ aldrig statisk

/** JSON-svar med konsekventa headers (båda statuskoderna har samma form). */
function svara(body: unknown, status: number, cacheControl: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cacheControl,
    },
  });
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const langRå = (url.searchParams.get("lang") ?? "sv").trim().toLowerCase();
  const lang: "sv" | "en" | "ar" = langRå === "en" || langRå === "ar" ? langRå : "sv";

  if (!q) {
    return svara({ fel: "q krävs" }, 400, "no-store");
  }

  // Sökningen kastar aldrig, men SKYDDSNÄTET gör 500 omöjligt även vid
  // oväntade fel (trasiga datafiler etc.) — tomt resultat är ett giltigt svar.
  let resultat: SokTräff[] = [];
  try {
    resultat = sokServerSide(q, lang);
  } catch {
    resultat = [];
  }

  return svara(
    { q, lang, antal: resultat.length, resultat },
    200,
    "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
  );
}
