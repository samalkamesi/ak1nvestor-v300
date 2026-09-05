import { readFileSync } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/pro/dpa-mall — PUBLICERAR DPA-MALLEN SOM DOKUMENT (VÅG 66 G2).
 *
 * G2-juridikpaketet (B2B-BESLUT steg 5; b4-juridik-priser §2.4): DPA-mallen
 * är ett DOKUMENT i data/forskning/B2B/DPA-MALL.md — ingen egen sida (beslut
 * 2026-09-04: "dokument-fil + /pro/priser länkar till den"). En sannings-
 * källa: filen är mastern, denna route serverar den oförändrad som
 * text/markdown så att kundens jurist och tecknande rådgivare kan läsa den
 * direkt. Underbiträdeslistan (Vercel + Supabase, EU) ingår i dokumentet —
 * därmed är även den publicerad (G2-grindens krav).
 *
 * Inga personuppgifter, ingen spårning (P6): ett statiskt dokument som
 * cacheas en timme. Prod-tracing: next.config.ts outputFileTracingIncludes
 * listar filen (mönstret från /api/forskningslage — Vercels tracing följer
 * inte alltid readFileSync-vägar).
 *
 * Status i dokumentet: UTKAST tills kundens juristgranskning (K-B2B:1) är
 * godkänd — teckningsflödet öppnar först vid G2.
 */
export async function GET() {
  const fil = path.join(
    process.cwd(),
    "data",
    "forskning",
    "B2B",
    "DPA-MALL.md",
  );
  try {
    const body = readFileSync(fil, "utf8");
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(
      "# DPA-mallen kunde inte läsas\n\nDokumentet data/forskning/B2B/DPA-MALL.md saknas i denna miljö. Kontakta info@ak1nvestor.com.",
      {
        status: 404,
        headers: { "Content-Type": "text/markdown; charset=utf-8" },
      },
    );
  }
}
