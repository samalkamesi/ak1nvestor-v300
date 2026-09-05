import type { Metadata } from "next";
import Link from "next/link";
import { getCourseList, getCourses, type Course } from "@/lib/content";
import { kraverFas } from "@/lib/kurs-access";
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
  harSpeglar: true, // Ömsesidig hreflang med /en|ar/kurser (VÅG 63 O3 #2)
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

// ── BIBLIOTEKSHALLEN (våg 58): urval till de tre utvalda sektionerna ─────────
//
// Urvalsprinciper — deterministiska ur data, dokumenterade:
//  * FLAGGSKEPPEN: hårdkodad kanonlista (se slugs nedan). Det är nyckelverken
//    — värdeinvesteringens mittpelare — och urvalet är ett redaktionellt
//    varumärkesval, inte en sortering. Slugs verifierade mot
//    public/deep-courses.json (alla sex finns, kategori BOKMASTER).
//  * NYA I BIBLIOTEKET: publiceringsdatum saknas i datan — antagandet är att
//    deep-courses.json:ens objektordning speglar tilläggsordning, så arrayens
//    SLUT = senast tillagda (nyast först). Kurser redan förhöjda som
//    flaggskepp hoppas över — inget kort ska ligga i två sektioner.
//  * BÖRJA HÄR: grundkurserna V01–V06 (AKM1:s första variabler) i slug-ordning
//    = läroplanens nybörjarspår.

const FLAGGSKEPP_SLUGS = [
  "the-intelligent-investor",
  "security-analysis",
  "one-up-on-wall-street",
  "zero-to-one",
  "margin-of-safety",
  "poor-charlies-almanack",
] as const;

/** Kortdata för de utvalda sektionerna — samma fält som registret. */
function kurKort(c: Course) {
  return {
    slug: c.slug,
    title: c.title,
    category: c.category,
    kapitel: c.chapters.length,
    minuter: c.totalMinutes || c.minutes,
    learn: c.learn,
    xp: c.xp,
    quiz: c.chapters.reduce((s, k) => s + ((k as { quiz?: unknown[] }).quiz?.length ?? 0), 0),
    fas: kraverFas(c.slug),
  };
}

type UtvaltData = ReturnType<typeof kurKort>;

/** Stig-ikonen — nybörjarspårets symbol (våg 58): en prickad stig uppåt. */
function StigIkon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 21c5-1.2 2.5-6.8 7.5-8.2 4.4-1.2 3.6-5 6-8.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="0.1 3.6"
      />
      <circle cx="5" cy="21" r="1.7" fill="currentColor" />
    </svg>
  );
}

/**
 * Utvalt kort — förhöjt kort (RO-nivå) för sektionerna ovanför registret.
 * Chip i guld, serif-titel, learn-rad och metadata med tabular-nums.
 * Fas-kurser märks ärligt med 🔒-chip redan i urvalet (en inbjudan, aldrig stopp).
 */
function UtvaltKort({
  c,
  chip,
  stig = false,
  hojd = false,
}: {
  c: UtvaltData;
  chip: React.ReactNode;
  stig?: boolean;
  hojd?: boolean;
}) {
  return (
    <li>
      <Link
        href={`/kurser/${c.slug}`}
        className={`group flex h-full flex-col rounded-xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
          hojd
            ? "border-gold/50 bg-gradient-to-b from-gold/[0.09] to-card shadow-sm hover:border-gold"
            : "border-gold/25 bg-card hover:border-gold/50"
        }`}
      >
        <span className="flex items-center justify-between gap-2">
          {chip}
          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
            {c.kapitel} kapitel
          </span>
        </span>
        <span className="mt-3 flex items-start gap-2">
          {stig && <StigIkon className="mt-1 h-5 w-5 shrink-0 text-gold" />}
          <span className="font-serif text-base font-bold leading-snug group-hover:text-gold">
            {c.title}
          </span>
        </span>
        <span className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
          {c.learn}
        </span>
        <span className="mt-3 flex items-center justify-between gap-2 text-[11px] tabular-nums text-muted-foreground">
          <span>
            {c.minuter} min · {c.xp} XP{c.fas !== 0 && (
              <span className="ml-1.5 font-bold text-gold">🔒 Fas {c.fas}</span>
            )}
          </span>
          <span className="font-semibold text-gold">Utforska →</span>
        </span>
      </Link>
    </li>
  );
}

/** Sektionshuvud för de utvalda sektionerna — eyebrow + serifrubrik + beskrivning. */
function UtvaltSektion({
  eyebrow,
  rubrik,
  beskrivning,
  children,
  id,
}: {
  eyebrow: string;
  rubrik: string;
  beskrivning: string;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <section aria-labelledby={id} className="mt-14">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
      <h2 id={id} className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
        {rubrik}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{beskrivning}</p>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
    </section>
  );
}

export default function KurserPage() {
  const courses = getCourseList();

  // Urval (deterministiskt — se urvalsprinciperna ovan):
  // Flaggskeppen = hårdkodad kanon; Nya = objektordningens slut (nyast först)
  // minus flaggskepp; Börja här = V01–V06 i slug-ordning.
  const record = getCourses();
  const flaggskepp = FLAGGSKEPP_SLUGS.map((s) => record[s]).filter(Boolean).map(kurKort);
  const flaggSlugs = new Set<string>(FLAGGSKEPP_SLUGS);
  const nya = Object.values(record)
    .reverse()
    .filter((c) => !flaggSlugs.has(c.slug))
    .slice(0, 6)
    .map(kurKort);
  const borjaHar = Object.values(record)
    .filter((c) => /^v0[1-6]-/.test(c.slug))
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .slice(0, 6)
    .map(kurKort);

  return (
    <SeoPageShell breadcrumb={[{ name: "Kurser" }]} wide>
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={educationalOrganizationJsonLd()} />
      <JsonLd data={kurserFaqJsonLd()} />

      {/* HERON — rubrik + kort intro; sökfältet bor stort och centralt i
          KursSok direkt nedan (våg 58: curated-först, registret paginerat) */}
      <h1 className="font-serif text-4xl font-bold">Kurser i institutionell aktieanalys</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground leading-relaxed">
        {tal(courses.length)} kurser som lär dig tänka som en analytiker — från AKM1:s 20
        fundamentalvariabler till teknisk analys, riskhantering och praktiska case.
        Börja med ett flaggskepp eller följ stigen från noll.
      </p>

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
        sidopanel={<FortsattPanel />}
      >
        {/* (a) FLAGGSKEPPEN — sex nyckelverk, RO-förhöjda kort */}
        <UtvaltSektion
          id="flaggskeppen"
          eyebrow="Bibliotekshallen · först"
          rubrik="Flaggskeppen"
          beskrivning="Sex nyckelverk som format århundraden av investeringsvisdom — kompletta, kapitel för kapitel. Börja här om du vill läsa mästarna direkt."
        >
          {flaggskepp.map((c) => (
            <UtvaltKort
              key={c.slug}
              c={c}
              hojd
              chip={
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
                  <span aria-hidden>★</span> BOKMASTER
                </span>
              }
            />
          ))}
        </UtvaltSektion>

        {/* (b) NYA I BIBLIOTEKET — senast tillagda kurser med ✨-chip */}
        <UtvaltSektion
          id="nya-i-biblioteket"
          eyebrow="Bibliotekshallen · färska"
          rubrik="Nya i biblioteket"
          beskrivning="Senast tillagda kurser — färska kapitel att utforska, rakt från analyslabbet."
        >
          {nya.map((c) => (
            <UtvaltKort
              key={c.slug}
              c={c}
              chip={
                <span className="inline-flex items-center gap-1 rounded-full bg-[#0E1B2E] px-2 py-0.5 text-[10px] font-bold text-[#E8C766] dark:bg-[#16263D]">
                  <span aria-hidden>✨</span> Ny
                </span>
              }
            />
          ))}
        </UtvaltSektion>

        {/* (c) BÖRJA HÄR — nybörjarspåret V01–V06 med stig-ikonen */}
        <UtvaltSektion
          id="borja-har"
          eyebrow="Bibliotekshallen · stigen"
          rubrik="Börja här"
          beskrivning="Aldrig analyserat ett bolag förut? Följ stigen: de sex första grundkurserna i AKM1 — V01 till V06 — bygger grunden steg för steg."
        >
          {borjaHar.map((c) => (
            <UtvaltKort
              key={c.slug}
              c={c}
              stig
              chip={
                <span className="inline-flex items-center rounded-full border border-gold/30 px-2 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground">
                  {c.slug.slice(0, 3).toUpperCase()}
                </span>
              }
            />
          ))}
        </UtvaltSektion>

        {/* Personlig brygga in i registret — tips, aldrig ett tvång */}
        <div className="mt-10">
          <KurstipsKort antal={3} />
        </div>
      </KursSok>

      {/* SOCIALT BEVIS — siffror och elevröster efter hallen */}
      <SocialProof className="mt-12" />
    </SeoPageShell>
  );
}
