import type { MetadataRoute } from "next";
import { getCourses, getAnalyses, getCaseStudies, getBlogPosts } from "@/lib/content";
import { lasAnalyser } from "@/lib/analysfabrik";

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
    { url: `${BASE_URL}/forskningsbiblioteket`, changeFrequency: "weekly", priority: 0.8, lastModified: now },
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
    // Pro-undersidorna (VÅG 63 O3 #4): robots index:true men saknades i
    // sitemap — 4 B2B-pengasidor osynliga för upptäckt.
    { url: `${BASE_URL}/pro/priser`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/pro/analys`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/pro/klienter`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/pro/rapporter`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
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
    // Blogglist-speglarna (VÅG 63 O3 #4): indexbara (spegelMetadata med
    // canonical + hreflang sedan våg 55) men osynliga i sitemap.
    { url: `${BASE_URL}/en/blogg`, changeFrequency: "daily", priority: 0.7, lastModified: now },
    { url: `${BASE_URL}/ar/blogg`, changeFrequency: "daily", priority: 0.7, lastModified: now },
    { url: `${BASE_URL}/villkor`, changeFrequency: "yearly", priority: 0.3, lastModified: now },
    { url: `${BASE_URL}/cookiepolicy`, changeFrequency: "yearly", priority: 0.3, lastModified: now },
    { url: `${BASE_URL}/ansvar`, changeFrequency: "yearly", priority: 0.3, lastModified: now },
    { url: `${BASE_URL}/upphovsratt`, changeFrequency: "yearly", priority: 0.4, lastModified: now },
    { url: `${BASE_URL}/kallor`, changeFrequency: "monthly", priority: 0.5, lastModified: now },
    { url: `${BASE_URL}/finansiell-policy`, changeFrequency: "yearly", priority: 0.4 },
  ];

  // ── VARJE kurs-slug: BOKMASTER 0.9, övriga kurser 0.8 ─────────────────────
  // + spegeldetaljer (VÅG 78 C #3): /{en,ar}/kurser/{slug} för varje kurs —
  // 666 spegel-URLer som indexeras allteftersom översättningsandelen passerar
  // INDEX_TRASKEL (kurs-speglar.ts); upptäcks tidigare via sitemap än via
  // interna länkar ensamt.
  for (const slug of courseSlugs) {
    const course = courses[slug];
    entries.push({
      url: `${BASE_URL}/kurser/${slug}`,
      changeFrequency: "monthly",
      priority: course?.category === "BOKMASTER" ? 0.9 : 0.8,
      // Kapiteldata innehåller inga datumfält — lastModified = genereringstillfället
      lastModified: now,
    });
    for (const lang of ["en", "ar"] as const) {
      entries.push({
        url: `${BASE_URL}/${lang}/kurser/${slug}`,
        changeFrequency: "monthly",
        priority: 0.7,
        lastModified: now,
      });
    }
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

  // ── Forskningsbiblioteket (analysfabriken) — varje automatisk översikt ────
  for (const a of lasAnalyser()) {
    entries.push({
      url: `${BASE_URL}/forskningsbiblioteket/${encodeURIComponent(a.ticker)}`,
      changeFrequency: "monthly",
      priority: 0.7,
      lastModified: safeDate(a.versionsdatum, now),
    });
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
  // + spegeldetaljer (VÅG 78 C #3): /{en,ar}/blogg/{slug} för varje inlägg
  // (110 spegel-URLer) — samma tröskel-logik som kursspeglarna.
  for (const p of getBlogPosts()) {
    entries.push({
      url: `${BASE_URL}/blogg/${p.slug}`,
      changeFrequency: "monthly",
      priority: 0.8,
      lastModified: safeDate(p.updatedAt || p.publishedAt, now),
    });
    for (const lang of ["en", "ar"] as const) {
      entries.push({
        url: `${BASE_URL}/${lang}/blogg/${p.slug}`,
        changeFrequency: "monthly",
        priority: 0.7,
        lastModified: safeDate(p.updatedAt || p.publishedAt, now),
      });
    }
  }

  return entries;
}
