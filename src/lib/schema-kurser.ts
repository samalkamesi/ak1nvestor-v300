/**
 * SCHEMA-KURSER (VÅG 99 G1 — A3 SLUTFÖRD): kompletta strukturerade data för
 * ALLA kurssidor × 3 språk (333 kurser · /kurser, /en/kurser, /ar/kurser).
 *
 * TRE schema-objekt per sida ur ETT anrop — byggKursSchema(kurs, lang):
 *   · Course          — name/description/provider/educationalLevel/
 *                      timeRequired/inLanguage/isAccessibleForFree/teaches/
 *                      courseMode(+ about när kursen har kategori)
 *   · FAQPage         — 3–4 ÄKTA fråga/svar-par GENERERADE ur kursens eget
 *                      innehåll (learn/why/kapitel/min/nivå/fas) — ALDRIG
 *                      påhittade frågor eller svar
 *   · BreadcrumbList  — Startsida > Kurser > {kategori} > {titel}
 *                      (spegel-prefix-aware: /en|/ar)
 *
 * ÄRLIGHETSREGLER (AI-innovationsplanens A3-block + R2):
 *   · isAccessibleForFree: Fas 1-kurser (kraverFas=0) ⇒ true; Fas 2/3 ⇒
 *     fältet UTELÅMNAS (null) — ALDRIG fejkade offers-priser eller
 *     numberOfCredits med påhittade värden.
 *   · FAQ-svaren är rakt ur kursdata (learn/why/kapitelantal/minuter/
 *     nivå/fas) — inga åsikter, ALDRIG investeringsråd.
 *   · Frågetexterna via ordlistans "schema"-domän (sv/en/ar), lästa med
 *      skapaT(lang) — samma mönster som dataset-sidor.tsx (våg 97/98).
 *
 * REN LIB: inga fs/läsningar — allt deterministiskt ur (kurs, lang).
 */

import type { Course } from "@/lib/content";
import { kraverFas } from "@/lib/kurs-access";
import { kategoriEtikett } from "@/lib/kurs-speglar";
import { ORDLISTA, type OrdlistaNyckel, type SprakRad } from "@/lib/ordlista";
import { SITE_URL } from "@/lib/seo";
import { skapaT, type SprakId } from "@/lib/sprak";

/** Resultatet av byggKursSchema — ett JSON-LD-objekt per <JsonLd>-rendering. */
export type KursSchema = {
  /** schema.org Course — kompletta Pflichtfält, se filhuvudet. */
  course: object;
  /** schema.org FAQPage — 3–4 par ur kursens eget innehåll. */
  faq: object;
  /** schema.org BreadcrumbList — 4 nivåer (spegel-prefix-aware). */
  breadcrumb: object;
};

/** Språkprefix för kurs-URL:er: sv ⇒ "", en ⇒ "/en", ar ⇒ "/ar". */
function kursPrefix(lang: SprakId): string {
  return lang === "sv" ? "" : `/${lang}`;
}

/** BCP-47 för JSON-LD: sv ⇒ "sv-SE" (sajtens huvudspråk), en/ar ⇒ rakt. */
function kursSprakkod(lang: SprakId): string {
  return lang === "sv" ? "sv-SE" : lang;
}

/** Kategorinamn på målspråket — sv visar datavärdet rått (ordlistans sv-rad
 *  ÄR datavärdet ordagrant), en/ar via kategoriEtikett (enda källan). */
function kategoriNamn(kurs: Course, lang: SprakId): string {
  return lang === "sv" ? kurs.category : kategoriEtikett(kurs.category, lang);
}

/**
 * Nivåetikett på målspråket: kurs.level ("Nybörjare"|"Intermediär"|
 * "Avancerad"|"Alla") normaliseras till ordlistans schema.kurs.niva.<stam>-
 * rad (samma normalisering som kategoriNyckel — Å/Ä→A, Ö→O, versaler →
 * gemener). Okända/framtidnivåer läcker aldrig: rå värdet återges ordagrant.
 */
export function nivaEtikett(level: string, lang: SprakId): string {
  const stam = level
    .toUpperCase()
    .split("")
    .map((tecken) =>
      tecken === "Å" || tecken === "Ä"
        ? "A"
        : tecken === "Ö"
          ? "O"
          : tecken === "É"
            ? "E"
            : tecken,
    )
    .filter((tecken) => (tecken >= "A" && tecken <= "Z") || (tecken >= "0" && tecken <= "9"))
    .join("")
    .toLowerCase();
  const rad: SprakRad | undefined = ORDLISTA[(`schema.kurs.niva.${stam}`) as OrdlistaNyckel];
  return rad ? rad[lang] || rad.sv : level;
}

/**
 * byggKursSchema — kursens tre JSON-LD-strukturer på ett språk.
 *
 * @param kurs  kursobjektet (svensk filvara; svenska sidan skickar den
 *              live-mergade medKursOverrides(kurs), speglarna skickar
 *              byggKursSpegel-kopian med publicerade översättningar)
 * @param lang  sidans språk — sv (originalet), en/ar (speglarna)
 */
export function byggKursSchema(kurs: Course, lang: SprakId): KursSchema {
  const t = skapaT(lang);
  const prefix = kursPrefix(lang);
  const fas = kraverFas(kurs.slug);
  const minuter = kurs.totalMinutes || kurs.minutes || 30;
  const kapitel = kurs.chapters.length;
  const niva = kurs.level?.trim() ? nivaEtikett(kurs.level.trim(), lang) : "";
  const kategori = kurs.category?.trim() ? kategoriNamn(kurs, lang) : "";

  // ── Course ────────────────────────────────────────────────────────────────
  //numberOfCredits förekommer ALDRIG (inga påhittade hp); isAccessibleForFree
  //endast när det är SANT (Fas 1) — Fas 2/3 utelämnar fältet hellre än fejkar.
  const course = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${kurs.title} — AKM1 ${kurs.slug.toUpperCase()}`,
    description: kurs.summary || kurs.learn,
    url: `${SITE_URL}${prefix}/kurser/${kurs.slug}`,
    inLanguage: kursSprakkod(lang),
    image: `${SITE_URL}/og/kurser/${kurs.slug}.png`,
    timeRequired: `PT${minuter}M`,
    provider: {
      "@type": "EducationalOrganization",
      name: "AK1A Research Lab",
      url: SITE_URL,
    },
    ...(niva ? { educationalLevel: niva } : {}),
    ...(kurs.learn?.trim() ? { teaches: kurs.learn } : {}),
    ...(kategori ? { about: { "@type": "Thing", name: kategori } } : {}),
    ...(fas === 0 ? { isAccessibleForFree: true } : {}),
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `PT${minuter}M`,
    },
  };

  // ── FAQPage — 3–4 ÄKTA par ur kursens eget innehåll ───────────────────────
  // (1) vad man lär sig → learn; (2) längd → kapitel/min/nivå ur datan;
  // (3) vad kursen passar för → why (finns hos 333/333 — annars 3 par);
  // (4) gratis-frågan → fas-svar ur kraverFas (ALDRIG priser).
  const fragor: Array<{ fraga: string; svar: string }> = [
    {
      fraga: t("schema.kurs.fragaVad", { titel: kurs.title }),
      svar: kurs.learn || kurs.summary,
    },
    {
      fraga: t("schema.kurs.fragaLangd"),
      svar: niva
        ? t("schema.kurs.svarLangdNiva", { kapitel, minuter, niva })
        : t("schema.kurs.svarLangd", { kapitel, minuter }),
    },
    ...(kurs.why?.trim()
      ? [{ fraga: t("schema.kurs.fragaPassar"), svar: kurs.why }]
      : []),
    {
      fraga: t("schema.kurs.fragaGratis"),
      svar: t(
        fas === 0
          ? "schema.kurs.svarGratisFas1"
          : fas === 2
            ? "schema.kurs.svarGratisFas2"
            : "schema.kurs.svarGratisFas3",
      ),
    },
  ];

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: kursSprakkod(lang),
    mainEntity: fragor.map((f) => ({
      "@type": "Question",
      name: f.fraga,
      acceptedAnswer: { "@type": "Answer", text: f.svar },
    })),
  };

  // ── BreadcrumbList — Startsida > Kurser > {kategori} > {titel} ───────────
  //Kategorinivån pekar på kursbiblioteket (kategoriväggen listar samtliga
  //kategorier där) — ingen påhittad kategori-URL finns, och ska inte finnas.
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: t("schema.kurs.brodsmula.start"), path: prefix || "/" },
      { name: t("nav.kurser"), path: `${prefix}/kurser` },
      ...(kategori ? [{ name: kategori, path: `${prefix}/kurser` }] : []),
      { name: kurs.title, path: `${prefix}/kurser/${kurs.slug}` },
    ].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };

  return { course, faq, breadcrumb };
}
