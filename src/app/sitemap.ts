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
    { url: `${baseUrl}/kalkylator`, changeFrequency: "monthly", priority: 0.9, lastModified: now },
    { url: `${baseUrl}/vagfundament`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${baseUrl}/laroplan`, changeFrequency: "weekly", priority: 1, lastModified: now },
    { url: `${baseUrl}/profil`, changeFrequency: "monthly", priority: 0.9, lastModified: now },
    { url: `${baseUrl}/certifikat`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${baseUrl}/topplista`, changeFrequency: "daily", priority: 0.8, lastModified: now },
    { url: `${baseUrl}/bibliotek`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${baseUrl}/om-oss`, changeFrequency: "monthly", priority: 0.5, lastModified: now },
    { url: `${baseUrl}/manifest`, changeFrequency: "monthly", priority: 0.9, lastModified: now },
    { url: `${baseUrl}/superanalys`, changeFrequency: "monthly", priority: 0.9, lastModified: now },
    { url: `${baseUrl}/badges`, changeFrequency: "weekly", priority: 0.7, lastModified: now },
    { url: `${baseUrl}/fas2-ansok`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${baseUrl}/min-sida`, changeFrequency: "daily", priority: 0.8, lastModified: now },
    { url: `${baseUrl}/dagens-pass`, changeFrequency: "daily", priority: 0.9, lastModified: now },
    { url: `${baseUrl}/medlemskap`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${baseUrl}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/finansiell-policy`, changeFrequency: "yearly", priority: 0.4 },
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

  // Analyser (PREC.ST, VOLCAR-B, …) + variabel-landningssidor per analys
  const vslugs = Object.keys(getCourses()).filter((s) => /^v\d{2}-/.test(s));
  for (const a of getAnalyses()) {
    const t = a.ticker.toLowerCase().replace(/\.st$/, "-st");
    entries.push({
      url: `${baseUrl}/analyser/${encodeURIComponent(a.ticker)}`,
      changeFrequency: "monthly",
      priority: 0.8,
      lastModified: now,
    });
    for (const v of vslugs) {
      entries.push({
        url: `${baseUrl}/analyser/${t}/${v}`,
        changeFrequency: "monthly",
        priority: 0.6,
        lastModified: now,
      });
    }
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
