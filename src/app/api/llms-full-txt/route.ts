import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/llms-full-txt — utökad llms.txt-kontext (llms-full.txt):
 * kursintros för alla kurser + FAQ-svar som rak text, max 500 kB.
 * Filen genereras av tool-results/llms-generera.mjs ur repots datafiler
 * (källa citeras per block — inga påhittade tal) och speglas statiskt på
 * /llms-full.txt. Denna rutt serverar samma innehåll dynamiskt.
 */
export async function GET() {
  try {
    const body = readFileSync(join(process.cwd(), "public", "llms-full.txt"), "utf8");
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response(
      "llms-full.txt saknas — kör node tool-results/llms-generera.mjs för att generera den.",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
}
