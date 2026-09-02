import { buildLlmsTxt } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/llms-txt — llms.txt för AI-chattbottar (OpenAI, Anthropic, Perplexity, …).
 * Text/plain-rekommendationsfil enligt https://llmstxt.org, genererad ur
 * levande kurs-/case-/bloggdata. Statisk spegel: /llms.txt.
 */
export async function GET() {
  const body = buildLlmsTxt();
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
