import type { MetadataRoute } from "next";

/**
 * /robots.txt — maximal indexering: låt alla crawlers hämta allt publikt
 * innehåll (kurser, analyser, labb, blogg, llms.txt, sitemap). Endast
 * admin-ytor hålls stängda. Crawl-delay 0 = indexera oss snabbt!
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
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
          "/pro/",
          "/llms.txt",
          "/api/llms-txt",
          "/sitemap.xml",
        ],
        disallow: ["/admin", "/pro/admin"],
        // crawlDelay: 0 är falsy och hopas över av Nexts generator —
        // skickas verbatim via "other" så att "Crawl-delay: 0" faktiskt emitas.
        crawlDelay: 0,
        other: { "Crawl-delay": "0" },
      },
    ],
    sitemap: "https://lab.ak1nvestor.com/sitemap.xml",
    host: "https://lab.ak1nvestor.com",
  };
}
