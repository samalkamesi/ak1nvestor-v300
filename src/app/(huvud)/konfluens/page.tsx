import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, websiteJsonLd } from "@/lib/seo";
import { StrukturData } from "@/components/seo/StrukturData";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { KonfluensTabell } from "@/components/ak1a/konfluens-tabell";
import { VagkonGraf } from "@/components/ak1a/vagkon-graf";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/konfluens",
  title: "Konfluensradarn — där värde möter vågor | AK1A",
  description:
    "Konfluensradarn väger värde mot vågor som vänder: först garanteras värdegolvet (är bolaget påstått billigt mot sina egna siffror?), sedan letas fundamental vågstart och prisvågläge — fundamental först, pris sist. Fem oberoende källor måste tala samman innan en rad klassas som konfluens. Pedagogiskt studieunderlag, aldrig investeringsråd.",
  keywords: [
    "konfluens",
    "värdeinvestering",
    "värdegolv",
    "fundamental analys",
    "våganalys",
    "aktiescreening",
    "svenska aktier",
    "momentum",
    "divergens",
    "AK1A",
  ],
});

/** Konceptets kärna — radarns garanti, ord för ord. */
const KONSEPTET =
  "Vi garanterar värdegolvet FÖRE vågorna: först måste bolaget vara påstått billigt mot sina egna siffror, SEDAN letar vi vågor som vänder — fundamental först, pris sist. Fem oberoende källor måste tala samman.";

/** Tre steg — värde → vågor → konfluens (radarns arbetsordning). */
const STEG = [
  {
    nr: "1",
    namn: "Värde",
    text: "Är bolaget påstått billigt mot sina egna siffror? Värdegolvet och kvaliteten läses först — utan ett värdegolv spelar vågorna ingen roll. Det är radarns garanti.",
  },
  {
    nr: "2",
    namn: "Vågor",
    text: "Vänder något? Fundamental vågstart läses före prisvåglaget — fundamentet leder, priset följer. Divergensen (priset släpar efter) är den femte, oberoende rösten.",
  },
  {
    nr: "3",
    namn: "Konfluens",
    text: "När källorna talar samman uppstår konfluens — värde möter vändande vågor. Klass-namnen i tabellen är radarns eget språk: ett studieunderlag, aldrig en signal.",
  },
] as const;

/** Vidare-läsning i ekosystemet. */
const LANKAR = [
  {
    href: "/vagfundament",
    rubrik: "Vågfundament",
    text: "Se varje AKM1-variabel som en tidsserie med egen riktning — fundamentala vågor i en 20 × 5-matris.",
  },
  {
    href: "/netnet",
    rubrik: "Net-net-skannern",
    text: "Grahams mest extrema värdegolv: bolag som handlas under två tredjedelar av rörelsekapitalet.",
  },
  {
    href: "/kalkylator",
    rubrik: "AKM1-kalkylatorn",
    text: "Poängsätt variablerna själv och se hur ditt eget värdegolv byggs — med hederlig osatt-markering.",
  },
] as const;

/**
 * DEMO-historik — 25 månads-slutkurser för Volvo B (statisk serie ur 2 års
 * volatilitet). Vågkonen ritar sina percentilband ur seriens egen σ; live-data
 * finns på /api/vagkon?ticker=VOLV-B.ST&serie=pris.
 */
const DEMO_VOLVO_B_PRIS = [
  258, 263, 257, 266, 274, 281, 287, 283, 276, 285, 294, 302, 308, 297, 289, 296, 305, 314, 321,
  315, 306, 312, 323, 332, 327,
];

/**
 * KONFLUENSRADARN — ytan där värde möter vågor. Server component med
 * statisk metadata; tabellen är en klientkomponent som fetchar
 * /api/konfluens (route — inte server action).
 */
export default function KonfluensPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Hem", href: "/" }, { name: "Konfluensradarn" }]} wide>
      <StrukturData id="jsonld-webbsajt" data={websiteJsonLd()} />
      <h1 className="font-serif text-4xl font-bold">Konfluensradarn</h1>
      <p className="mt-2 font-serif text-lg italic text-gold">— där värde möter vågor</p>

      {/* Pedagogisk ingress */}
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/90 sm:text-base">
        <p>
          De flesta skärmar gör ett av två fel: de letar antingen bara billiga bolag (och hamnar
          i värdefällor som förblir billiga i åratal) eller bara vändande vågor (och hamnar i
          momentum-köp utan golv under sig). Konfluensradarn vägrar nöja sig med halva bilden.
        </p>
        <blockquote className="marin-panel rounded-xl border-l-4 border-gold p-4 font-serif text-base italic leading-relaxed text-[#EDE6D6] sm:p-5">
          &quot;{KONSEPTET}&quot;
        </blockquote>
        <p>
          Ordningen är hela poängen. Ett bolag som är påstått billigt mot sina egna siffror men
          där vågorna sover är bara en viloplats — klass-namnet blir <em>Värde men vågor
          sover</em>. Ett bolag där vågorna vänder men utan värdegolv är en satsning utan nät —{" "}
          <em>Vågor utan värdegolv</em>. Först när fem oberoende källor — värdegolv, kvalitet,
          fundamental vågstart, prisvågläge och divergens — talar samman klassas raden som{" "}
          <em>Konfluens — värde möter vändande vågor</em>. Exakta vikter och trösklar stannar i
          motorn; ytan visar koncept och klass-namn.
        </p>
      </div>

      <div className="hjarlinje mt-8" />

      {/* Tre steg — radarns arbetsordning */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">Tre steg — alltid i denna ordning</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {STEG.map((s, i) => (
            <div key={s.nr} className="marin-panel relative rounded-2xl border border-gold/30 p-5">
              <p className="font-serif text-3xl font-bold text-[#E8C766]">{s.nr}</p>
              <p className="mt-1 font-serif text-lg font-bold text-[#EDE6D6]">{s.namn}</p>
              <p className="mt-2 text-xs leading-relaxed text-[#EDE6D6]/85">{s.text}</p>
              {i < STEG.length - 1 && (
                <span
                  aria-hidden
                  className="absolute -right-3 top-1/2 hidden -translate-y-1/2 font-serif text-2xl font-bold text-gold md:block"
                >
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Radarn */}
      <div className="mt-10">
        <KonfluensTabell />
      </div>

      {/* Vågkon — scenariot som växer ur historikens egen volatilitet (Fas C) */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold">Vågkon</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Vågkon — scenario för Volvo B:s pris (ur 2 års volatilitet).
        </p>
        <div className="mt-4">
          <VagkonGraf historik={DEMO_VOLVO_B_PRIS} titel="VOLV-B.ST" enhet="SEK" />
        </div>
      </section>

      {/* Vidare i ekosystemet */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold">Fortsätt i ekosystemet</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {LANKAR.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-xl border border-gold/30 bg-paper p-4 transition-colors hover:border-gold/60"
            >
              <p className="font-serif text-base font-bold text-gold">{l.rubrik} →</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{l.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        Underlag: offentlig datakälla (Yahoo Finance) via konfluens-motorn på servern. All utdata
        är pedagogisk analys — inte investeringsråd. Poängen är ett studieunderlag, aldrig en
        köp- eller säljsignal.
      </p>
    </SeoPageShell>
  );
}
