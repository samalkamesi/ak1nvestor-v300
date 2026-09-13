import type { Metadata } from "next";

/**
 * SPEGEL-METADATA — metadata-byggare för de fullt översatta spegel-sidorna
 * under /en/ och /ar/ (våg 51, agent S3 — kunddirektiv: "vi måste vara 100 %
 * arabiska och engelska på exakt samma sätt").
 *
 * Skillnad mot pageMetadata() i seo.tsx (där sidor utan speglar sedan
 * rond H/våg 129 bara deklarerar sv-SE+x-default mot egen URL): här är
 * varje språkversion en egen indexerbar sida —
 *
 *   canonical  = spegel-sidans egen URL (/en/... eller /ar/...)
 *   hreflang   = sv-SE → svensk originalsida, en → /en/…, ar → /ar/…
 *   x-default  = den svenska originalsidan
 *
 * seo.tsx rörs ej (svenska sidors metadata förblir exakt oförändrat).
 */

export const SPEGEL_SITE_URL = "https://lab.ak1nvestor.com";
export const SPEGEL_SITE_NAME = "AK1A Research Lab";

export type SpegelSprak = "en" | "ar";

export function spegelMetadata(opts: {
  lang: SpegelSprak;
  /** Svensk sid-slug utan språkprefix, t.ex. "kurser" eller "fas2-ansok". */
  sida: string;
  title: string;
  description: string;
  keywords?: string[];
}): Metadata {
  const url = `${SPEGEL_SITE_URL}/${opts.lang}/${opts.sida}`;
  const sv = `${SPEGEL_SITE_URL}/${opts.sida}`;
  const en = `${SPEGEL_SITE_URL}/en/${opts.sida}`;
  const ar = `${SPEGEL_SITE_URL}/ar/${opts.sida}`;

  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords,
    alternates: {
      canonical: url,
      languages: {
        "sv-SE": sv,
        en,
        ar,
        "x-default": sv,
      },
    },
    // Robots: indexera (spegel-sidorna är fullvärdiga sidor, inte dubbletter —
    // kanonisk + hreflang talar om för sökmotorerna hur de förhåller sig).
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SPEGEL_SITE_NAME,
      type: "website",
      locale: opts.lang === "ar" ? "ar_AR" : "en_US",
      alternateLocale: ["sv_SE"],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
    },
  };
}

/**
 * Översatta JSON-LD-varianter av websiteJsonLd/educationalOrganizationJsonLd
 * (seo.tsx-versionerna har hardkodad inLanguage "sv-SE" och svenska
 * beskrivningar — spegelsidorna deklarerar sitt eget språk).
 */
export function spegelWebsiteJsonLd(lang: SpegelSprak) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SPEGEL_SITE_NAME,
    url: `${SPEGEL_SITE_URL}/${lang}`,
    inLanguage: lang === "ar" ? "ar" : "en",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SPEGEL_SITE_URL}/kurser?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function spegelUtbildningsOrganisationJsonLd(
  lang: SpegelSprak,
  department: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SPEGEL_SITE_NAME,
    url: SPEGEL_SITE_URL,
    logo: `${SPEGEL_SITE_URL}/ak1a/favicon.svg`,
    email: "info@ak1nvestor.com",
    inLanguage: lang === "ar" ? "ar" : "en",
    department,
  };
}

/** FAQPage-schema på mål-språk (spegel till faqJsonLd i seo.tsx). */
export function spegelFaqJsonLd(
  lang: SpegelSprak,
  fragor: Array<{ fraga: string; svar: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang === "ar" ? "ar" : "en",
    mainEntity: fragor.map((f) => ({
      "@type": "Question",
      name: f.fraga,
      acceptedAnswer: { "@type": "Answer", text: f.svar },
    })),
  };
}
