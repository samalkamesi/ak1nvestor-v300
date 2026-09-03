import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Fas2Ansok } from "@/components/ak1a/fas2-ansok";
import { SocialProof } from "@/components/ak1a/social-proof";
import { getCourseList } from "@/lib/content";

export const dynamic = "force-static";

/**
 * Fas 2 (nya modellen): de 18 fundamentala mästarverken, kategorivis —
 * värdering, bokslut, företagsfinans, värdeinvestering + AKM1-superdjup.
 * Ingen teknisk analys, inga vågor, inget ekosystem — det är Fas 3.
 * Titlar hämtas dynamiskt ur kurskatalogen (public/deep-courses.json) så
 * listan aldrig halkar ur synk med det faktiska innehållet. Spegla
 * FAS2_KURSER i src/lib/kurs-access.ts.
 */
const FAS2_KURSLISTA: Array<{ kategori: string; pitch: string; slugs: string[] }> = [
  {
    kategori: "Värderingsbiblorna",
    pitch:
      "Graham & Dodd, Damodaran, McKinsey, Williams, Rappaport & Mauboussin — konsten att väga ett bolag i handen, från bokslut till värde.",
    slugs: [
      "security-analysis",
      "investment-valuation",
      "valuation-measuring-managing",
      "the-theory-of-investment-value",
      "expectations-investing",
    ],
  },
  {
    kategori: "Bokslut & redovisning på analytikernivå",
    pitch:
      "Penman, Mulford & Comiskey, O'Glove, Schilit och Graham — hitta kvaliteten i vinsten och genomskåda det som bara är en berättelse.",
    slugs: [
      "financial-statement-analysis-and-security-valuation",
      "creative-cash-flow-reporting",
      "quality-of-earnings",
      "financial-shenanigans",
      "interpretation-of-financial-statements",
    ],
  },
  {
    kategori: "Företagsfinans & kapital",
    pitch:
      "Higgins, Brealey och Whitman — kapitalstruktur, kassaflödesmatematik och nödlidande bolag på MBA-nivå.",
    slugs: [
      "analysis-for-financial-management",
      "principles-of-corporate-finance",
      "distress-investing",
    ],
  },
  {
    kategori: "Värdeinvesteringens mästarverk + AKM1-superdjup",
    pitch:
      "Klarman, Greenwald, Gray & Carlisle, Einhorn — och den egna modellen AKM1 (V01–V20) på riktig analysnivå.",
    slugs: [
      "margin-of-safety",
      "value-investing-from-graham-to-buffett",
      "quantitative-value",
      "fooling-some-of-the-people",
      "akm1-den-kontroversiella-modellen",
    ],
  },
];

export const metadata: Metadata = pageMetadata({
  path: "/fas2-ansok",
  title: "Ansök om Fas 2 — den fundamentala vägen | AK1A",
  description:
    "Fas 2 är den snabba fundamentala vägen till oberoende analytiker: 18 mästarverk — värdering (Graham & Dodd, Damodaran, McKinsey), bokslutsanalys (Penman, Schilit, O'Glove), finans (Higgins, Brealey) och värdeinvestering (Klarman, Greenwald, Einhorn) plus AKM1 på superdjup. Personlig utbildning med grundaren och chansen att bli representant för AK1nvestor. Ingen teknisk analys — det är Fas 3. 9 999 kr, 90 dagars nöjdhetsgaranti.",
  keywords: [
    "Fas 2 ansökan",
    "fundamentalanalys utbildning Sverige",
    "värdering Damodaran",
    "Penman bokslutsanalys",
    "Klarman margin of safety",
    "oberoende analytiker",
    "representant AK1nvestor",
    "utbildning aktieanalys",
  ],
});

export default function Fas2AnsokPage() {
  const katalog = getCourseList();
  const titelFor = (slug: string) =>
    katalog.find((k) => k.slug === slug)?.title ?? slug;
  const antalFas2 = FAS2_KURSLISTA.reduce((s, k) => s + k.slugs.length, 0);

  return (
    <SeoPageShell breadcrumb={[{ name: "Hem", href: "/" }, { name: "Fas 2-ansökan" }]}>
      <article className="space-y-8">
        <header className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
            Fas 2 · Den snabba fundamentala vägen · 9 999 kr
          </p>
          <h1 className="font-serif text-4xl font-bold tracking-tight">
            Ansök om Fas 2
          </h1>
          <p className="max-w-2xl leading-relaxed text-muted-foreground">
            Fas 1 är hela grundbiblioteket — kostnadsfritt, för alltid. Fas 2
            är något annat: <strong>den snabba fundamentala vägen till en
            oberoende analytiker</strong>. Du utbildar dig som analyiker på
            ett fundamentalt sätt — värdering, bokslut, kassaflöden, värde —
            med en människa vid din sida: personlig utbildning med grundaren
            och coaching i grupp. Vi tar emot ett begränsat antal elever i
            taget, därför krävs ansökan.
          </p>
        </header>

        {/* TYDLIGT: ingen teknisk analys + representant-chansen — två löften */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="gravor-ram rounded-2xl bg-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
              Våga vara tydlig: ingen teknisk analys här
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Vi utbildar <strong className="text-foreground">ingenting</strong> i
              teknisk analys inom Fas 2. Vågor, Elliott och det dynamiska
              ekosystemet är{" "}
              <Link href="/fas3" className="underline hover:text-foreground">
                Fas 3
              </Link>{" "}
              — Fas 2 är hantverket bakom omdömet: att läsa, värdera och
              försvara ett bolag med siffror.
            </p>
          </div>
          <div className="gravor-ram rounded-2xl bg-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
              Representant-chansen
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Fas 2 öppnar vägen att <strong className="text-foreground">bli
              representant för AK1nvestor</strong> — att representera oss med
              kvalitet. För eleven som vill är utbildningen början på den
              relationen, inte slutet på den.
            </p>
          </div>
        </div>

        <Fas2Ansok />

        {/* SOCIALT BEVIS — siffror och elevröster efter krav/ansökningsdelen */}
        <SocialProof />

        {/* VAD INGÅR I FAS 2 */}
        <section className="space-y-5 rounded-xl border border-gold/30 bg-card p-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
            Vad ingår i Fas 2
          </p>
          <h2 className="font-serif text-2xl font-bold">
            {antalFas2} mästarverk — och en människa som förenar dem
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            I Fas 1 lär du dig delarna: variabel för variabel, bok för bok,
            kapitel för kapitel. Fas 2 är den snabba vägen vidare — de
            fördjupningar som gör att du en dag står som en helt oberoende
            analytiker, med ett omdöme som är ditt eget. Allt fundamentalt,
            inget annat.
          </p>

          {/* Kurslistan, kategorivis */}
          <div className="space-y-4">
            {FAS2_KURSLISTA.map((kat) => (
              <div key={kat.kategori} className="rounded-lg border border-gold/20 bg-paper p-4">
                <h3 className="text-sm font-semibold text-foreground">
                  {kat.kategori}{" "}
                  <span className="font-normal text-gold">· {kat.slugs.length} kurser</span>
                </h3>
                <p className="mt-1 text-xs italic leading-relaxed text-muted-foreground">
                  {kat.pitch}
                </p>
                <ul className="mt-2 grid gap-1 text-xs leading-relaxed text-muted-foreground sm:grid-cols-2">
                  {kat.slugs.map((s) => (
                    <li key={s} className="flex gap-1.5">
                      <span className="text-gold">·</span>
                      <span>{titelFor(s)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Utbildningen utöver kurserna */}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                namn: "Grundaren vid din sida",
                text: "Personlig utbildning med grundaren av AK1A och coaching i grupp tillsammans med andra klienter — den snabba vägen, utan omvägar.",
              },
              {
                namn: "Representant för AK1nvestor",
                text: "Fas 2 öppnar vägen att förbli representant för AK1nvestor — att representera oss med kvalitet, när utbildningen bär dig dit.",
              },
              {
                namn: "Bolag testade med siffror",
                text: "Tips på bolag under utbildningen — prövade med AKM1:s variabler, siffror och trösklar, aldrig på känsla.",
              },
            ].map((v) => (
              <div key={v.namn} className="rounded-lg border border-gold/20 bg-paper p-4">
                <h4 className="font-serif text-sm font-bold text-foreground">{v.namn}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>

          {/* Fas 1-försvaret */}
          <p className="rounded-lg border border-dashed border-gold/40 bg-paper p-4 text-sm leading-relaxed text-muted-foreground">
            <strong className="text-foreground">
              Fas 1 förblir gratis — alltid.
            </strong>{" "}
            Fas 2 är för eleven som vill gå från att förstå delarna till att
            bära ett eget fundamentalt omdöme. Fas 1 gömmer ingenting: allt
            grundläggande vi kan finns gratis, och det förblir så.
          </p>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Allt i AK1A Research Lab är pedagogisk utbildning i aktieanalys — aldrig
            investeringsråd, och aldrig tips om köp eller försäljning. Analyser och
            kurser bygger på öppna källor och redovisade antaganden.
          </p>
        </section>

        <section className="rounded-xl border border-dashed border-gold/40 bg-paper p-6">
          <h2 className="font-serif text-xl font-bold">Vad som händer efter ansökan</h2>
          <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>
              <strong className="text-foreground">1.</strong> Vi läser din ansökan
              personligt — tillsammans med din elevstatus i Fas 1.
            </li>
            <li>
              <strong className="text-foreground">2.</strong> Du får en inbjudan till
              ett kostnadsfritt möte med grundaren. Inget säljtryck — ett samtal.
            </li>
            <li>
              <strong className="text-foreground">3.</strong> Bestämmer du att gå
              vidare börjar utbildningen, och du betalar först när du är nöjd
              (90 dagars nöjdhetsgaranti).
            </li>
          </ol>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Osäker? {" "}
            <Link href="/medlemskap" className="underline hover:text-foreground">
              Jämför Fas 1, Fas 2 och Fas 3 i lugn och ro
            </Link>
            . Fas 1 gömmer ingenting — allt grundläggande vi kan finns gratis, och det förblir så.
          </p>
        </section>
      </article>
    </SeoPageShell>
  );
}
