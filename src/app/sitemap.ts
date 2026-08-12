import { NextResponse } from "next/server";

export const dynamic = "force-static";

/** GET /sitemap.xml — dynamic sitemap from all content */
export async function GET() {
  const baseUrl = "https://lab.ak1nvestor.com";

  // Static pages
  const staticPages = [
    "",
    "/#analyser",
    "/#aktier",
    "/#kurser",
    "/#labb",
    "/#fas3",
    "/#strategi",
    "/#om-oss",
    "/#portal",
  ];

  // Stock analyses
  const analyses = ["PREC.ST", "VOLCAR-B"];

  // AKM1 indicators (V01-V20)
  const indicators = Array.from({ length: 20 }, (_, i) => `V${String(i + 1).padStart(2, "0")}`);

  // Course categories
  const courseCategories = [
    "AKM1 20 VARIABLER",
    "KUNSKAPSMARKNAD",
    "TEKNISK ANALYS",
    "PRAKTISKA CASE",
    "RISKHANTERING",
    "PORTFOLJHANTERING",
    "SEKTORANALYS",
    "BETEENDEFINANS",
    "MAKROEKONOMI",
    "UTDELNINGSSTRATEGI",
  ];

  let urls = "";

  // Static pages
  for (const page of staticPages) {
    urls += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  // Analyses
  for (const ticker of analyses) {
    urls += `
  <url>
    <loc>${baseUrl}/api/analysis/${ticker}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`;
  }

  // Mega tasks API
  urls += `
  <url>
    <loc>${baseUrl}/api/mega/tasks</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
