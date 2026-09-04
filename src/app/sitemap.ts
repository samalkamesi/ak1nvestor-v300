import type { MetadataRoute } from "next";
import { getCourses, getAnalyses, getCaseStudies, getBlogPosts } from "@/lib/content";

export const dynamic = "force-dynamic";

const BASE_URL = "https://lab.ak1nvestor.com";

/** Säker ISO-datumparsning — ogiltiga/missing värden faller tillbaka på "nu". */
function safeDate(value: unknown, fallback: Date): Date {
  if (typeof value === "string" && value.trim()) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  return fallback;
}

/** /sitemap.xml — alla crawlbara sidor genererade från statiskt innehåll.
 *  Mål: maximal indexering. Varje kurs (BOKMASTER 0.9, övriga 0.8),
 *  varje labb-case, varje bloggpost, varje analys + variabelsida,
 *  alla verktygssidor och flaggskepp (1.0). */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const courses = getCourses();
  const courseSlugs = Object.keys(courses);

  // ── Flaggskepp (1.0) + statiska sidor + alla verktygssidor ────────────────
  const entries: MetadataRoute.Sitemap = [
    // Flaggskepp — sajtens kärna
    { url: BASE_URL, changeFrequency: "daily", priority: 1, lastModified: now },
    { url: `${BASE_URL}/kurser`, changeFrequency: "daily", priority: 1, lastModified: now },
    { url: `${BASE_URL}/laroplan`, changeFrequency: "weekly", priority: 1, lastModified: now },
    { url: `${BASE_URL}/konfluens`, changeFrequency: "weekly", priority: 1, lastModified: now },
    { url: `${BASE_URL}/vagfundament`, changeFrequency: "weekly", priority: 1, lastModified: now },
    { url: `${BASE_URL}/manifest`, changeFrequency: "monthly", priority: 0.9, lastModified: now },

    // Innehållsnav
    { url: `${BASE_URL}/analyser`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/labb`, changeFrequency: "weekly", priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/blogg`, changeFrequency: "daily", priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/bibliotek`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/topplista`, changeFrequency: "daily", priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/badges`, changeFrequency: "weekly", priority: 0.7, lastModified: now },
    { url: `${BASE_URL}/dagens-pass`, changeFrequency: "daily", priority: 0.9, lastModified: now },

    // Alla verktygssidor
    { url: `${BASE_URL}/nyheter`, changeFrequency: "hourly", priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/kalkylator`, changeFrequency: "monthly", priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/portfoljbyggare`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/portfolj-forskning`, changeFrequency: "weekly", priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/netnet`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/superanalys`, changeFrequency: "monthly", priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/profil`, changeFrequency: "monthly", priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/certifikat`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/rapporter`, changeFrequency: "monthly", priority: 0.7, lastModified: now },

    // Medlems- och företagssidor
    { url: `${BASE_URL}/pro`, changeFrequency: "monthly", priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/medlemskap`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/prenumeration`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/fas2-ansok`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/fas3`, changeFrequency: "monthly", priority: 0.6, lastModified: now },
    { url: `${BASE_URL}/min-sida`, changeFrequency: "daily", priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/min-portfolj`, changeFrequency: "weekly", priority: 0.5, lastModified: now },
    { url: `${BASE_URL}/logga-in`, changeFrequency: "yearly", priority: 0.3 },

    // Om & juridik
    { url: `${BASE_URL}/om-oss`, changeFrequency: "monthly", priority: 0.5, lastModified: now },
    { url: `${BASE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.3, lastModified: now },
    { url: `${BASE_URL}/transparens`, changeFrequency: "yearly", priority: 0.4, lastModified: now },

    // Språkspeglar EN/AR (våg 51) — hreflang-klustren pekar mot svensk original
    { url: `${BASE_URL}/en`, changeFrequency: "monthly", priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/ar`, changeFrequency: "monthly", priority: 0.9, lastModified: now },
    ...["medlemskap", "manifest", "logga-in", "om-oss", "kurser", "fas2-ansok", "fas3", "prenumeration", "transparens"].flatMap((sida) => [
      { url: `${BASE_URL}/en/${sida}`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
      { url: `${BASE_URL}/ar/${sida}`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    ]),
    { url: `${BASE_URL}/villkor`, changeFrequency: "yearly", priority: 0.3, lastModified: now },
    { url: `${BASE_URL}/cookiepolicy`, changeFrequency: "yearly", priority: 0.3, lastModified: now },
    { url: `${BASE_URL}/ansvar`, changeFrequency: "yearly", priority: 0.3, lastModified: now },
    { url: `${BASE_URL}/upphovsratt`, changeFrequency: "yearly", priority: 0.4, lastModified: now },
    { url: `${BASE_URL}/kallor`, changeFrequency: "monthly", priority: 0.5, lastModified: now },
    { url: `${BASE_URL}/finansiell-policy`, changeFrequency: "yearly", priority: 0.4 },
  ];

  // ── VARJE kurs-slug: BOKMASTER 0.9, övriga kurser 0.8 ─────────────────────
  for (const slug of courseSlugs) {
    const course = courses[slug];
    entries.push({
      url: `${BASE_URL}/kurser/${slug}`,
      changeFrequency: "monthly",
      priority: course?.category === "BOKMASTER" ? 0.9 : 0.8,
      // Kapiteldata innehåller inga datumfält — lastModified = genereringstillfället
      lastModified: now,
    });
  }

  // ── Analyser (PREC.ST, VOLCAR-B, …) + variabel-landningssidor per analys ──
  const vslugs = courseSlugs.filter((s) => /^v\d{2}-/.test(s));
  for (const a of getAnalyses()) {
    const t = a.ticker.toLowerCase().replace(/\.st$/, "-st");
    entries.push({
      url: `${BASE_URL}/analyser/${encodeURIComponent(a.ticker)}`,
      changeFrequency: "monthly",
      priority: 0.8,
      lastModified: safeDate(a.analysisDate || a.verified, now),
    });
    for (const v of vslugs) {
      entries.push({
        url: `${BASE_URL}/analyser/${t}/${v}`,
        changeFrequency: "monthly",
        priority: 0.6,
        lastModified: now,
      });
    }
  }

  // ── VARJE labb-case med lastModified ur createdAt ─────────────────────────
  for (const c of getCaseStudies()) {
    entries.push({
      url: `${BASE_URL}/labb/${c.id}`,
      changeFrequency: "monthly",
      priority: 0.7,
      lastModified: safeDate(c.createdAt, now),
    });
  }

  // ── VARJE bloggpost med lastModified ur publicerings-/uppdateringsdatum ───
  for (const p of getBlogPosts()) {
    entries.push({
      url: `${BASE_URL}/blogg/${p.slug}`,
      changeFrequency: "monthly",
      priority: 0.8,
      lastModified: safeDate(p.updatedAt || p.publishedAt, now),
    });
  }

  return entries;
}
