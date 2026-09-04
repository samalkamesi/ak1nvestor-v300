import type { Metadata } from "next";
import { getCourseList } from "@/lib/content";
import {
  pageMetadata,
  websiteJsonLd,
  faqJsonLd,
  educationalOrganizationJsonLd,
  JsonLd,
} from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { FortsattPanel } from "@/components/ak1a/fortsatt-panel";
import { KursSok } from "@/components/ak1a/kurs-sok";
import { KurstipsKort } from "@/components/ak1a/kurstips-kort";
import { SocialProof } from "@/components/ak1a/social-proof";
import { SIFFROR, tal } from "@/lib/siffror";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/kurser",
  // Antal ur src/lib/siffror.ts (guldkällan) — verktyg/rakna-siffror.mjs räknar om
  title: `Kurser i institutionell aktieanalys — ${SIFFROR.kurser} kurser | AK1A`,
  description:
    `Lär dig institutionell aktieanalys steg för steg. ${SIFFROR.kurser} kurser: AKM1:s 20 variabler, teknisk analys, riskhantering, portföljhantering och praktiska case. Pedagogisk finansanalys.`,
  keywords: [
    "aktieanalys kurser",
    "AKM1",
    "institutionell metodik",
    "lära sig aktieanalys",
    "svenska aktier",
    "finansiell utbildning",
  ],
});

/**
 * FAQPage-schema (AI-SEO våg 50) — frågeformaterat och konkret med tal ur
 * guldkällan: GEO-forskningen (KDD 2024) visar att statistik + raka svar
 * är det som starkast ökar AI-citeringar. Se data/forskning/AI-SEO-2026-09-03.md.
 */
function kurserFaqJsonLd() {
  return faqJsonLd([
    {
      fraga: "Vad är AKM1 för metodik?",
      svar:
        "AKM1 är AK1A:s metodomfattning med 20 fundamentalvariabler (V01–V20) — från försäljningstillväxt till återköp av egna aktier — som tillsammans ger en institutionell helhetsbild av ett bolag.",
    },
    {
      fraga: "Hur många kurser finns på AK1A?",
      svar: `${tal(SIFFROR.kurser)} kurser i ämnen som fundamentalanalys, värdering, teknisk analys, riskhantering och beteendeekonomi — plus ${tal(SIFFROR.bokmaster)} böcker som BOKMASTER-kurser, kapitel för kapitel.`,
    },
    {
      fraga: "Är kurserna gratis?",
      svar:
        "Fas 1 — grundutbildningen med kurser, boksammanfattningar, quiz och verktyg — är kostnadsfritt för alltid. Fas 2 och Fas 3 är de fördjupade stegen.",
    },
    {
      fraga: "Behöver jag förkunskaper för att lära mig aktieanalys?",
      svar:
        "Nej. Läroplanen börjar från noll och bygger steg för steg: varje nyckeltal har sin egen kurs med exempel, quiz och praktiska övningar.",
    },
    {
      fraga: "Ger AK1A investeringsråd eller aktietips?",
      svar:
        "Nej. AK1A Research Lab ger pedagogisk utbildning i analysmetodik — aldrig investeringsråd eller tips på enskilda aktier.",
    },
  ]);
}

export default function KurserPage() {
  const courses = getCourseList();
  const byCategory = new Map<string, typeof courses>();
  for (const c of courses) {
    const list = byCategory.get(c.category) ?? [];
    list.push(c);
    byCategory.set(c.category, list);
  }

  return (
    <SeoPageShell breadcrumb={[{ name: "Kurser" }]} wide>
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={educationalOrganizationJsonLd()} />
      <JsonLd data={kurserFaqJsonLd()} />
      <h1 className="font-serif text-4xl font-bold">Kurser i institutionell aktieanalys</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        {courses.length} kurser som lär dig tänka som en analytiker — från AKM1:s 20
        fundamentalvariabler till teknisk analys, riskhantering och praktiska case.
        Varje kurs bygger på samma metodik som institutionerna använder, förklarad
        pedagogiskt för privatpersoner.
      </p>

      {/* Tips för just dig — personligt, som ett tips aldrig ett tvång */}
      <div className="mt-6">
        <KurstipsKort antal={3} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_260px]">
        <KursSok
          kurser={courses.map((c) => ({
            slug: c.slug,
            title: c.title,
            category: c.category,
            kapitel: c.chapters.length,
            minuter: c.totalMinutes || c.minutes,
            learn: c.learn,
            xp: c.xp,
            quiz: c.chapters.reduce((s, k) => s + ((k as { quiz?: unknown[] }).quiz?.length ?? 0), 0),
          }))}
        />
        <aside className="h-fit"><FortsattPanel /></aside>
      </div>

      {/* SOCIALT BEVIS — siffror och elevröster efter kursgriden */}
      <SocialProof className="mt-12" />
        </SeoPageShell>
  );
}
