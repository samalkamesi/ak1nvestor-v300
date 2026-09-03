import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Fas2Ansok } from "@/components/ak1a/fas2-ansok";
import { SocialProof } from "@/components/ak1a/social-proof";
import { getCourseList } from "@/lib/content";

export const dynamic = "force-static";

/**
 * Fas 2: de 26 låsta kurserna, kategorivis. Titlar hämtas dynamiskt ur
 * kurskatalogen (public/deep-courses.json) så listan aldrig halkar ur synk
 * med det faktiska innehållet. 4 flaggskepp + 18 teknisk analys + 4 psykologi.
 */
const FAS2_KURSLISTA: Array<{ kategori: string; pitch: string; slugs: string[] }> = [
  {
    kategori: "Ekosystem-flaggskeppen",
    pitch: "De fyra superdjupa systemkurserna — där delarna blir en helhet.",
    slugs: [
      "ak1ts-vaglarans-hierarki",
      "akm1-den-kontroversiella-modellen",
      "vagfundament-variablerna-som-tidsserier",
      "konfluens-varde-moter-vagor",
    ],
  },
  {
    kategori: "Avancerad teknisk analys",
    pitch:
      "Elliott, Fibonacci och Bollinger i fördjupningskurserna — plus mästerverken av Frost & Prechter, Bollinger, Fischer, Pring, Murphy, Torssell, DeMark, Edwards & Magee och Bulkowski.",
    slugs: [
      "ts-01-elliott-wave",
      "ts-02-elliott-wave",
      "ts-22-elliott-wave",
      "ts-03-fibonacciretracements",
      "ts-04-fibonacciextensions",
      "ts-19-fibonaccitidszoner",
      "ts-21-fibonaccikluster",
      "ts-15-bollinger-bands",
      "elliott-wave-principle",
      "bollinger-on-bollinger-bands",
      "fibonacci-applications",
      "martin-pring-on-market-momentum",
      "intermarket-analysis",
      "teknisk-analys-med-johnny-torssell",
      "the-new-science-of-technical-analysis",
      "technical-analysis-financial-markets",
      "technical-analysis-of-stock-trends",
      "encyclopedia-of-chart-patterns",
    ],
  },
  {
    kategori: "Trading psykologi",
    pitch:
      "Fienden sitter vid ditt eget skrivbord — Douglas, Coates, Shull och Zweig lär dig känna igen honom.",
    slugs: [
      "trading-in-the-zone",
      "the-hour-between-dog-and-wolf",
      "market-mind-games",
      "your-money-and-your-brain",
    ],
  },
];

export const metadata: Metadata = pageMetadata({
  path: "/fas2-ansok",
  title: "Ansök om Fas 2 — utbildning med grundaren | AK1A",
  description:
    "Ansök om Fas 2: personlig utbildning med grundaren, 26 avancerade kurser, Portföljens vågor och AKM1 × AK1TS-integrationen. Ansökan är kostnadsfri och icke-bindande — 90 dagars nöjdhetsgaranti. Fas 1 förblir gratis, för alltid.",
  keywords: [
    "Fas 2 ansökan",
    "utbildning aktieanalys",
    "fundamentalanalys utbildning Sverige",
    "Elliott Wave utbildning",
    "trading psykologi",
    "coaching aktieanalys",
    "AKM1 medlemskap",
    "representant utbildning",
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
            Fas 2 · Utbildning med grundaren
          </p>
          <h1 className="font-serif text-4xl font-bold tracking-tight">
            Ansök om Fas 2
          </h1>
          <p className="max-w-2xl leading-relaxed text-muted-foreground">
            Fas 1 är hela grundbiblioteket — kostnadsfritt, för alltid. Fas 2 är något
            annat: <strong>en människa vid din sida</strong>. Personlig utbildning
            med grundaren, coaching i grupp och en väg mot att representera
            AK1nvestor. Vi tar emot ett begränsat antal elever i taget, därför
            krävs ansökan.
          </p>
        </header>

        <Fas2Ansok />

        {/* SOCIALT BEVIS — siffror och elevröster efter krav/ansökningsdelen */}
        <SocialProof />

        {/* VAD INGÅR I FAS 2 */}
        <section className="space-y-5 rounded-xl border border-gold/30 bg-card p-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
            Vad ingår i Fas 2
          </p>
          <h2 className="font-serif text-2xl font-bold">
            {antalFas2} avancerade kurser — och tre verktyg som förenar dem
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            I Fas 1 lär du dig delarna: variabel för variabel, bok för bok, kapitel
            för kapitel. Fas 2 öppnar det som kräver att delarna redan sitter — de
            djupaste kurserna och de verktyg som väver samman dem till helhet.
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

          {/* De tre sammansatta verktygen */}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                namn: "Portföljens vågor",
                text: "Se din egen portföljs vågprofil på mikro-, kort-, medellång-, lång- och mega-horisont. En dynamisk vy som lever med dina innehav efter inloggning — din portfölj, dina vågor.",
              },
              {
                namn: "AKM1 × AK1TS-integrationen",
                text: "Den sammansatta analysen där fundamentalstyrka möter vågor: AKM1:s variabler och AK1TS våghierarki förenas till ett enda sammanhängande svar.",
              },
              {
                namn: "Nyheter kopplade till dina aktier",
                text: "En personlig nyhetsfeed som vakar över dina innehav — så att du slipper leta och aldrig missar det som rör just dig.",
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
            analysera helheten. Fas 1 gömmer ingenting: allt grundläggande vi kan
            finns gratis, och det förblir så.
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
              Jämför Fas 1 och Fas 2 i lugn och ro
            </Link>
            . Fas 1 gömmer ingenting — allt grundläggande vi kan finns gratis, och det förblir så.
          </p>
        </section>
      </article>
    </SeoPageShell>
  );
}
