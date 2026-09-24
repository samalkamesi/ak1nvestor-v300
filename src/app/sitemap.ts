import type { MetadataRoute } from "next";
import { getCourses, getAnalyses, getCaseStudies, getBlogPosts } from "@/lib/content";
import { lasAnalyser } from "@/lib/analysfabrik";
import { b2bAktiv } from "@/lib/b2b-status";
import { tierAktiv } from "@/lib/tier-status";
import { branschSlugs, lasBranschMedianer } from "@/lib/dataset-medianer";
import { aspektParametrar } from "@/lib/dataset-aspekter";
import { publiceradeBolagSlugs } from "@/lib/bolags-sidor";
import { byggdSidaFinns } from "@/lib/sitemap-byggsanning";

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

  // VÅG 97 E1: datasetmenyernas lastModified ägs av rådatans hämtdatum
  // (bolagsunivers.json "hamtat"), inte av genereringstillfället — ogiltigt
  // eller saknat datum faller ärligt tillbaka på "nu".
  const datasetHamtat = lasBranschMedianer().hamtat;
  const datasetDatumParse = typeof datasetHamtat === "string" ? new Date(datasetHamtat) : null;
  const datasetDatum = datasetDatumParse && !isNaN(datasetDatumParse.getTime()) ? datasetDatumParse : now;

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
    // Rapportakademin (rond 130): publikt SEO-skal — premium-innehållet
    // (pass, expertläsningar) lever bara bakom API:t och bjuds aldrig in.
    // o147: byggfryst sida (force-static) — annonseras bara om det KÖRANDE
    // bygget har den (född efter senaste gröna bygget ⇒ 404 medan sitemap
    // lovade; se sitemap-byggsanning.ts).
    ...(byggdSidaFinns("rapportakademin")
      ? ([
          {
            url: `${BASE_URL}/rapportakademin`,
            changeFrequency: "weekly" as const,
            priority: 0.8,
            lastModified: now,
          },
        ] satisfies MetadataRoute.Sitemap)
      : []),

    // Medlems- och företagssidor
    // V86 B2B-residual 1: /pro-blocket grindas mot b2bAktiv() — sitemap får
    // aldrig bjuda in crawlerar till URL:er som pro-layoutens grind håller
    // noindex:ade (Search Console: "Submitted URL marked 'noindex'").
    // /pro + 4 undersidor (VÅG 63 O3 #4) listas endast när B2B är PÅ.
    ...(b2bAktiv()
      ? ([
          { url: `${BASE_URL}/pro`, changeFrequency: "monthly" as const, priority: 0.9, lastModified: now },
          { url: `${BASE_URL}/pro/priser`, changeFrequency: "monthly" as const, priority: 0.8, lastModified: now },
          { url: `${BASE_URL}/pro/analys`, changeFrequency: "monthly" as const, priority: 0.8, lastModified: now },
          { url: `${BASE_URL}/pro/klienter`, changeFrequency: "monthly" as const, priority: 0.8, lastModified: now },
          { url: `${BASE_URL}/pro/rapporter`, changeFrequency: "monthly" as const, priority: 0.8, lastModified: now },
        ] satisfies MetadataRoute.Sitemap)
      : []),
    { url: `${BASE_URL}/medlemskap`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/prenumeration`, changeFrequency: "monthly", priority: 0.8, lastModified: now },

    // VÅG 99 (G2): portfölj-tier-sidorna (prisstegens tre nivåer) grindas
    // mot tierAktiv() — sitemap får aldrig bjuda in crawlerar till URL:er
    // som notFound()-grinden håller 404:ade (spegel av /pro-blocket ovan).
    // Listas endast när NEXT_PUBLIC_TIER_AKTIV=1.
    ...(tierAktiv()
      ? ([
          { url: `${BASE_URL}/portfolj-grund`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
          { url: `${BASE_URL}/portfolj-plus`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
          { url: `${BASE_URL}/portfolj-hyra`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
        ] satisfies MetadataRoute.Sitemap)
      : []),
    { url: `${BASE_URL}/fas2-ansok`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/fas3`, changeFrequency: "monthly", priority: 0.6, lastModified: now },
    { url: `${BASE_URL}/min-sida`, changeFrequency: "daily", priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/min-portfolj`, changeFrequency: "weekly", priority: 0.5, lastModified: now },
    { url: `${BASE_URL}/logga-in`, changeFrequency: "yearly", priority: 0.3 },

    // Om & juridik
    { url: `${BASE_URL}/om-oss`, changeFrequency: "monthly", priority: 0.5, lastModified: now },
    { url: `${BASE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.3, lastModified: now },
    { url: `${BASE_URL}/transparens`, changeFrequency: "yearly", priority: 0.4, lastModified: now },

    // ── Dataset — branschmedianer (VÅG 97 E1, citeringsmagneter): index +
    //    en detaljsida per bransch, svenska + EN/AR-speglar. lastModified =
    //    rådatans hämtdatum (sidorna bär ISR men TALEN ägs av universumet).
    { url: `${BASE_URL}/dataset`, changeFrequency: "daily", priority: 0.9, lastModified: datasetDatum },
    // o156 (s8): nyckeltalsguiden (våg 87) är dataset-familjens metod- och
    // citeringssida men glömdes när dataset-grenen ritades (våg 97) — en
    // levande sida som aldrig annonseras är o146-klassens spegelbild.
    // ISR-rutt byggd i varje bygge sedan våg 87: okonditionell post,
    // ingen byggfrysning-grind. lastModified ägs av rådatan som grannarna.
    { url: `${BASE_URL}/data/nyckeltalsguide`, changeFrequency: "daily", priority: 0.8, lastModified: datasetDatum },
    // o147: bransch/aspekt-sidorna är byggfrusna (dynamicParams=false) men
    // slugs läses ur LIVE-data — ny bransch under ett bygg-läge-fönster är
    // annars ett dött löfte (samma klass som bolagsgapet 249/243, o146).
    // byggdSidaFinns håller tillbaka det bygget saknar; fail-open utan .next.
    ...branschSlugs(lasBranschMedianer())
      .filter((bransch) => byggdSidaFinns(`dataset/${bransch}`))
      .map((bransch) => ({
        url: `${BASE_URL}/dataset/${bransch}`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
        lastModified: datasetDatum,
      })),
    ...["en", "ar"].flatMap((lang) => [
      { url: `${BASE_URL}/${lang}/dataset`, changeFrequency: "daily" as const, priority: 0.7, lastModified: datasetDatum },
      ...branschSlugs(lasBranschMedianer())
        .filter((bransch) => byggdSidaFinns(`${lang}/dataset/${bransch}`))
        .map((bransch) => ({
          url: `${BASE_URL}/${lang}/dataset/${bransch}`,
          changeFrequency: "monthly" as const,
          priority: 0.6,
          lastModified: datasetDatum,
        })),
    ]),

    // ── Dataset-aspekterna (VÅG 150 fas A): en statisk långsvanssida per
    //    bransch × aspekt. Registret räknar matta-filtret (matta >=
    //    MIN_MATTA) EN gång och delas med rutten — sitemap speglar exakt
    //    det slutledet publicerar (130 URL:er), aldrig de teoretiska 150.
    //    lastModified = rådatans hämtdatum (samma källa som övriga dataset).
    ...aspektParametrar()
      .filter(({ bransch, aspekt }) => byggdSidaFinns(`dataset/${bransch}/${aspekt}`))
      .map(({ bransch, aspekt }) => ({
        url: `${BASE_URL}/dataset/${bransch}/${aspekt}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
        lastModified: datasetDatum,
      })),

    // ── Bolagssidorna (VÅG 149, B1 i SOKORDSINVENTERING-2026): register +
    //    en statisk sida per universumsbolag (100 st, "ABB nyckeltal"-
    //    longtailet). lastModified = rådatans hämtdatum (samma källa som
    //    datasetmenyerna); svenska först — speglar följer som egen våg.
    //    o146: ENDAST publicerade slugs (byggets nedteckning) — sitemap är
    //    force-dynamic men rutten byggfryst (våg 81); att lova mer än det
    //    byggda är döda löften till crawlerar (gapet 249/243, 2026-09-21).
    { url: `${BASE_URL}/bolag`, changeFrequency: "daily", priority: 0.8, lastModified: datasetDatum },
    ...publiceradeBolagSlugs().map((slug) => ({
      url: `${BASE_URL}/bolag/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      lastModified: datasetDatum,
    })),

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
