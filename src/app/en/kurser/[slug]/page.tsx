import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourse } from "@/lib/content";
import { byggKursSpegel, hamtaKursLager } from "@/lib/kurs-speglar";
import {
  KursSpegelSida,
  kursSpegelGenerateMetadata,
  type KursSpegelTexter,
} from "@/components/ak1a/kurs-spegel-sida";

/**
 * /en/kurser/[slug] — DYNAMISK KURSSPEGEL (våg 52, agent B).
 *
 * Kunddirektivet: "ett system som översätter alla delar live... allt sker
 * dynamiskt" — INGET förbygge: generateStaticParams returnerar [] och
 * dynamicParams = true låter varje kurssida genereras on-demand (ISR,
 * revalidate 1 h) först när den begärs. Därmed byggs aldrig 666 halvfärdiga
 * sidor; översatta kurser blir "live" i takt med att block publiceras i
 * översättningslagret (Supabase `oversattningar`, status "publicerad" —
 * se kontraktet i src/lib/kurs-speglar.ts).
 *
 * Data ur samma källa som svenska /kurser/[slug] (public/deep-courses.json);
 * texter via lagret med fallback till svensk originaltext + översättnings-
 * notis med andel klart. Okänd slug ⇒ notFound() (riktig 404).
 *
 * SEO: robots noindex + canonical mot svenska originalet tills
 * publicerad-andelen ≥ 80 % (INDEX_TRASKEL) — därefter index + fullt
 * hreflang-kluster. Se kursSpegelMetadata().
 */

export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = 3600;

/** Inget förbygge — 333 kurser × 2 speglar skapas on-demand vid begäran. */
export function generateStaticParams(): Array<{ slug: string }> {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return kursSpegelGenerateMetadata("en", params);
}

/** Page-level texts — professional financial English (not machine translation). */
const TEXTER_EN: KursSpegelTexter = {
  notisTitel: (procent) => `This course is being translated — ${procent}% complete`,
  notisText:
    "Chapters are shown in their original Swedish until each translation is published in English. Quizzes, progress tracking and XP work exactly as in the Swedish course.",
  whyRubrik: "Why this variable is decisive",
  perspektivRubrik: "Three perspectives",
  perspektivAk1: "AK1A's interpretation",
  nyckelinsikt: "Key insight",
  ovningarRubrik: "Exercises",
  ovningarIntro: "Three exercises to anchor the variable — unfold each one for guidance.",
  ovningLabel: "Exercise",
  ledningLabel: "Guidance:",
  ovning1: (titel, vikt) =>
    `Explain in your own words: what does ${titel} measure, and why does it carry ${vikt} weight in AKM1?`,
  ovning2Nummer: (titel) =>
    `Calculation exercise: pull the latest figures from a company's annual report (see "Where do I find the figures" in the calculator) and compute ${titel}. What score (0–5) does your calculation give?`,
  ovning2NummerFacit:
    "The answer key is your own calculation — check it against the calculator's automatic score on /kalkylator.",
  ovning2Tillampning: (titel) =>
    `Application: find one company where ${titel} is strong — and one where it is weak. What separates them?`,
  ovning2TillampningFacit: (kapitelNum, kapitelTitel) =>
    `Guidance: see chapter ${kapitelNum} ("${kapitelTitel}").`,
  ovning3: (titel) =>
    `Reflection: how would your portfolio be affected if your largest holding failed precisely on ${titel}?`,
  ovning3Facit: "Test it in My Portfolio (/min-portfolj) or discuss it in the lab.",
  fortsattRubrik: "Continue the curriculum",
  fortsattText: "Interactive exercises, wave matrices and the AI tutor are found in the lab.",
  oppnaLab: "Open AK1A Research Lab",
  seMedlemskap: "See memberships",
  relaterade: (kategori) => `Related courses in ${kategori}`,
};

export default async function KursSpegelPageEn({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const kurs = getCourse(slug);
  if (!kurs) notFound();

  const lager = await hamtaKursLager(slug, "en");
  const spegel = byggKursSpegel(kurs, lager);

  return <KursSpegelSida lang="en" spegel={spegel} texter={TEXTER_EN} />;
}
