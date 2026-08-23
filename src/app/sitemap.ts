import type { MetadataRoute } from "next";
import { getCourses, getAnalyses, getCaseStudies, getBlogPosts } from "@/lib/content";

export const dynamic = "force-dynamic";

/** /sitemap.xml — alla crawlbara sidor genererade från statiskt innehåll */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://lab.ak1nvestor.com";
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1, lastModified: now },
    { url: `${baseUrl}/kurser`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${baseUrl}/analyser`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${baseUrl}/labb`, changeFrequency: "weekly", priority: 0.8, lastModified: now },
    { url: `${baseUrl}/blogg`, changeFrequency: "daily", priority: 0.9, lastModified: now },
    { url: `${baseUrl}/medlemskap`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${baseUrl}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // 225 kurser
  for (const slug of Object.keys(getCourses())) {
    entries.push({
      url: `${baseUrl}/kurser/${slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
      lastModified: now,
    });
  }

  // Analyser (PREC.ST, VOLCAR-B, …)
  for (const a of getAnalyses()) {
    entries.push({
      url: `${baseUrl}/analyser/${encodeURIComponent(a.ticker)}`,
      changeFrequency: "monthly",
      priority: 0.8,
      lastModified: now,
    });
  }

  // 201 case studies
  for (const c of getCaseStudies()) {
    entries.push({
      url: `${baseUrl}/labb/${c.id}`,
      changeFrequency: "monthly",
      priority: 0.6,
      lastModified: now,
    });
  }

  // Blogginlägg
  for (const p of getBlogPosts()) {
    entries.push({
      url: `${baseUrl}/blogg/${p.slug}`,
      changeFrequency: "monthly",
      priority: 0.8,
      lastModified: new Date(p.updatedAt || p.publishedAt),
    });
  }

  return entries;
}
