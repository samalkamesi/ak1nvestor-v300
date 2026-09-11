import type { MetadataRoute } from "next";

import { tierAktiv } from "@/lib/tier-status";

/**
 * /robots.txt — maximal indexering hos SÅVÄL sökmotorer som AI-assistenter
 * (kunddirektiv: "nr 1 hos alla AI, bokstavligen").
 *
 *  1. `*` — vanliga crawlers: allt publikt innehåll öppet (kurser, analyser,
 *     labb, blogg, llms.txt, sitemap), endast admin-ytor stängda.
 *  2. EXPLICITA AI-crawler-regler —OpenAI (GPTBot/OAI-SearchBot/ChatGPT-User),
 *     Anthropic (ClaudeBot/Claude-User/Claude-SearchBot; äldre Claude-Web för
 *     bakåtkompatibilitet), Perplexity (PerplexityBot + Perplexity-Searchbot),
 *     Google-Extended (Gemini-träning/grounding — skilt från Googlebot/Search),
 *     Applebot-Extended (Apple Intelligence), meta-externalagent (Meta AI),
 *     Amazonbot (AWS/Amazon AI) och CCBot (Common Crawl — källa för många
 *     modellers träningsdata). Syfte: deklarera välkomnande, inte bara låta
 *     `*` täcka dem — vissa AI-vendorer dokumenterar att de läser sin EGNA
 *     user-agent-grupp för tolkningen.
 *
 * AI-SEO-underlag: data/forskning/AI-SEO-2026-09-03.md (källor där).
 * OBS OpenAI: stödjer bara User-agent/Allow/Disallow (ingen crawl-delay,
 *     inga wildcards) — därför hålls AI-grupperna raka.
 */

/** Publika ytor som ALLA — sök + AI — bjuds in till.
 *  VÅG 77 (B1-grinden): /pro är under uppbyggnad — bjuds in först när
 *  NEXT_PUBLIC_B2B_AKTIV=1 (annars hålls hela B2B-trädet borta). */
const PUBLIKA_YTOR = [
  "/",
  "/kurser/",
  "/analyser/",
  "/labb/",
  "/blogg/",
  "/bibliotek/",
  "/vagfundament/",
  "/konfluens/",
  "/laroplan/",
  "/manifest/",
  "/medlemskap/",
  "/prenumeration/",
  "/kallor/",
  "/dataset/",
  ...(process.env.NEXT_PUBLIC_B2B_AKTIV === "1" ? ["/pro/"] : []),
  // VÅG 99 (G2): portfölj-tier-sidorna är färdigbyggda men AVSTÄNGDA —
  // bjuds in först när NEXT_PUBLIC_TIER_AKTIV=1 (annars svarar de 404 och
  // hålls borta även ur sitemap).
  ...(tierAktiv() ? ["/portfolj-grund/", "/portfolj-plus/", "/portfolj-hyra/"] : []),
  "/llms.txt",
  "/api/llms-txt",
  "/sitemap.xml",
];

/** AI-crawlers som uttryckligen bjuds in (user-agent → ägare/syfte). */
const AI_CRAWLERS: Array<{ agents: string[]; vem: string }> = [
  {
    agents: ["GPTBot", "OAI-SearchBot", "ChatGPT-User"],
    vem: "OpenAI — GPT-träning, ChatGPT/SearchGPT-sök och användarfetch",
  },
  {
    agents: ["ClaudeBot", "Claude-User", "Claude-SearchBot", "Claude-Web"],
    vem: "Anthropic — Claude-träning, användarfetch, sökindex (Claude-Web äldre)",
  },
  {
    agents: ["PerplexityBot", "Perplexity-Searchbot"],
    vem: "Perplexity — svarsmotorns index",
  },
  {
    agents: ["Google-Extended"],
    vem: "Google — Gemini-träning/grounding (skilt från Googlebot/Search)",
  },
  {
    agents: ["Applebot-Extended"],
    vem: "Apple — Apple Intelligence-träning (skilt från Applebot/Siri)",
  },
  {
    agents: ["meta-externalagent"],
    vem: "Meta — Meta AI-träning",
  },
  {
    agents: ["Amazonbot"],
    vem: "Amazon/AWS — AI-indexering",
  },
  {
    agents: ["CCBot"],
    vem: "Common Crawl — öppen dataset bakom många modeller",
  },
];

/** Stängda ytor: admin + VÅG 81 /studio (admin-låst agent-webchat — varken
 *  sidan eller dess API-rutter ska indexeras eller crawlas). */
const STANGDA_YTOR = ["/admin", "/pro/admin", "/studio", "/api/studio"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── 1. Alla crawlers (sökmotorer + övriga) ──
      {
        userAgent: "*",
        allow: PUBLIKA_YTOR,
        disallow: STANGDA_YTOR,
        // crawlDelay: 0 är falsy och hopas över av Nexts generator —
        // skickas verbatim via "other" så att "Crawl-delay: 0" faktiskt emitas.
        crawlDelay: 0,
        other: { "Crawl-delay": "0" },
      },
      // ── 2. Explicita AI-crawler-grupper (en grupp per vendor) ──
      // Nexts MetadataRule sätter en user-agent per rule — därför expanderas
      // varje vendors agentlista till en rule per agent (samma innehåll).
      ...AI_CRAWLERS.flatMap(({ agents }) =>
        agents.map((agent) => ({
          userAgent: agent,
          allow: PUBLIKA_YTOR,
          disallow: STANGDA_YTOR,
        })),
      ),
    ],
    sitemap: "https://lab.ak1nvestor.com/sitemap.xml",
    host: "https://lab.ak1nvestor.com",
  };
}
