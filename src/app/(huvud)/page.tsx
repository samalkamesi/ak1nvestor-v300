import type { Metadata } from "next";
import { SpaHem } from "@/components/ak1a/spa-hem";
import { sidaMetadata, faqJsonLd, educationalOrganizationJsonLd } from "@/lib/seo";
import { StrukturData } from "@/components/seo/StrukturData";
import { SIFFROR, tal } from "@/lib/siffror";

/**
 * Startsidan — metadata via sidaMetadata (AI-SEO våg 50): canonical +
 * hreflang + robots + OG/Twitter som övriga sidor, PLUS JSON-LD i samma
 * svep: EducationalOrganization (AK1A som utbildningsaktör) + FAQPage med
 * sajtens kanoniska frågor. Detta är sidan AI-assistenter hamnar på när
 * användare frågar "vad är AK1A Research Lab?".
 */
const SIDA = sidaMetadata({
  path: "",
  harSpeglar: true, // Ömsesidig hreflang med /en + /ar (VÅG 63 O3 #2)
  title: "AK1A Research Lab — institutionell metodik för privatpersoner | Ak1 Apex Nexus",
  description:
    "Institutionell aktieanalysmetodik, byggd för privatpersoner. Djupare än en blogg. Tydligare än en bank. Snabbare än en utbildning. Pedagogisk finansanalys — inte investeringsråd.",
  keywords: [
    "aktieanalys",
    "fundamentalanalys",
    "institutionell metodik",
    "AKM1",
    "lär sig aktieanalys",
    "svenska aktier",
  ],
  jsonLd: [
    educationalOrganizationJsonLd(),
    faqJsonLd([
      {
        fraga: "Vad är AK1A Research Lab?",
        svar: `En gratis forsknings- och utbildningsplats som lär ut institutionell aktieanalys till privatpersoner: ${tal(SIFFROR.kurser)} kurser, ${tal(SIFFROR.bokmaster)} heltäckta böcker, ${tal(SIFFROR.quiz)} quiz och deterministiska analysmotorer — allt byggd på metodiken AKM1.`,
      },
      {
        fraga: "Är AK1A gratis?",
        svar:
          "Fas 1 — grundutbildningen med kurser, böcker och verktyg — är kostnadsfritt för alltid. Fas 2 och Fas 3 är frivilliga fördjupningar.",
      },
      {
        fraga: "Ger AK1A investeringsråd eller aktietips?",
        svar:
          "Nej. AK1A ger pedagogisk utbildning i analysmetodik — aldrig investeringsråd. Målet är att du själv ska kunna analysera bolag som en oberoende analytiker.",
      },
      {
        fraga: "Vem passar AK1A för?",
        svar:
          "Alla som vill förstå fundamental analys på riktigt — från nybörjare som aldrig öppnat en årsredovisning till erfarna privatpersoner som vill väga ihop nyckeltal som en institutionell analytiker.",
      },
    ]),
  ],
});

export const metadata: Metadata = SIDA.metadata;

export default function Page() {
  return (
    <>
      {SIDA.jsonLd.map((schema, i) => (
        <StrukturData key={i} data={schema} />
      ))}
      <SpaHem />
    </>
  );
}
