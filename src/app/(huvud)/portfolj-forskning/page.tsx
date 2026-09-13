import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, websiteJsonLd } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { StrukturData } from "@/components/seo/StrukturData";
import { Korstabell } from "@/components/ak1a/portfolj-forskning/korstabell";
import { ByggPortfoljKort } from "@/components/ak1a/portfolj-forskning/bygg-portfolj-kort";
import { KorstabellLeverantor } from "@/components/ak1a/portfolj-forskning/korstabell-leverantor";
import { PortfoljForskningDemo } from "@/components/ak1a/portfolj-forskning/demo-wrapper";
import { ForskningslageKort } from "@/components/ak1a/forskningslage-kort";
import { lasKorstabellGrund, lasPriser, type Priser } from "@/lib/portfolj-forskning/korstabell-data";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/portfolj-forskning",
  title: "Portföljforskning — välj risk, få en forskningsportfölj | AK1A",
  description:
    "Välj risknivå och tillväxttakt — AK1A:s motor poängsätter 100 bolag på AKM1, fundamental och teknisk vågstatus samt golvmarginal, och forskar fram en portfölj med motiv och kravkontroller. Pedagogisk forskning, aldrig investeringsråd.",
  keywords: [
    "portföljforskning",
    "forskningsportfölj",
    "AKM1 portfölj",
    "risknivå portfölj",
    "våganalys portfölj",
    "golvmarginal",
    "portföljuppbyggnad verktyg",
  ],
});

/** Medlemspris med 20 % Fas-rabatt, avrundat till hela kronor. */
function medlemPris(pris: number, rabatt: number): number {
  return Math.round(pris * (1 - rabatt));
}

/** Prenumerationsnivåerna ur data/portfolj-system/priser.json — 3 kort + rabatt. */
function PrisKort({ priser }: { priser: Priser }) {
  const rabatt = priser.rabattFas.fas2 > 0 ? priser.rabattFas.fas2 : priser.rabattFas.fas3;
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {priser.nivaer.map((niva, i) => (
          <div
            key={niva.id}
            className={`flex flex-col rounded-2xl border p-5 ${
              i === 1 ? "border-gold/50 bg-gold/5" : "border-gold/25 bg-card"
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
              Nivå {i + 1}
            </p>
            <h3 className="mt-1.5 font-serif text-lg font-bold leading-snug">{niva.namn}</h3>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-serif text-2xl font-bold text-gold tabular">
                {niva.prisManad} kr
              </span>
              <span className="text-xs text-muted-foreground">/månad</span>
              <span className="text-xs text-muted-foreground">
                · {niva.prisAr} kr/år
              </span>
            </div>
            {rabatt > 0 && (
              <p className="mt-1.5 text-xs leading-relaxed">
                <span className="font-bold text-bull">
                  Fas 2/3-medlemmar: {medlemPris(niva.prisManad, rabatt)} kr/månad
                </span>{" "}
                <span className="rounded-full border border-bull/30 bg-bull/10 px-1.5 py-0.5 text-[10px] font-bold text-bull">
                  −{Math.round(rabatt * 100)} %
                </span>
                <span className="text-muted-foreground"> ({medlemPris(niva.prisAr, rabatt)} kr/år)</span>
              </p>
            )}
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {niva.beskrivning}
            </p>
          </div>
        ))}
      </div>
      {priser.notering && (
        <p className="mt-4 rounded-xl border border-gold/30 bg-gold/10 p-3 text-xs italic leading-relaxed text-gold">
          Konfigurerat pris — beslut pågår: {priser.notering}
        </p>
      )}
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        {priser.juridiskFotnot}
      </p>
    </div>
  );
}

export default function PortfoljForskningPage() {
  const { finns, rader } = lasKorstabellGrund();
  const priser = lasPriser();

  return (
    <SeoPageShell wide breadcrumb={[{ name: "Portföljforskning" }]}>
      <StrukturData id="jsonld-webbsajt" data={websiteJsonLd()} />

      {/* VÅG 63 bygg-2 (optimering #1): raderkedjan levereras EN gång via
          kontext-leverantören — Korstabell och ByggPortfoljKort läser den
          ur kontexten i stället för att var och en få hela 100-raders-
          propset serialiserat i RSC-flighten (tidigare dubbelkostnad). */}
      <KorstabellLeverantor rader={rader}>

      {/* ── Intro-pedagogik ─────────────────────────────────────────── */}
      <header className="border-b border-gold/30 pb-8">
        <p className="text-xs uppercase tracking-widest text-gold">📡 AK1A Research Lab</p>
        <h1 className="mt-2 font-serif text-4xl font-bold">Portföljforskning</h1>
        <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
          Detta är en forskningsmotor, inte en rådgivare. Du väljer risknivå och
          tillväxttakt — motorn poängsätter ett univers av 100 bolag (tio branscher
          × tio bolag) på AKM1:s 20 fundamentalvariabler, den fundamentala och
          tekniska vågstatusen på fem tidshorisonter samt golvmarginal, och forskar
          fram en portfölj där varje innehav bär sitt motiv och sina
          kravkontroller öppet. Samma val + samma underlag ger alltid samma
          portfölj — ingenting gissas, ingenting döljs.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "9 riskprofiler (3 nivåer × 3 takter)",
            "AKM1 50 % · vågstatus 35 % · golv 15 %",
            "Deterministisk — aldrig slump",
            "ALDRIG investeringsråd",
          ].map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs font-medium text-gold"
            >
              {chip}
            </span>
          ))}
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          AK1A bedriver pedagogisk finansforskning — ingen värdepappersrörelse och
          inga köp- eller säljuppmaningar (lagen 2007:528). Hur vi hanterar din
          data redovisas öppet på{" "}
          <Link href="/transparens" className="font-semibold text-gold hover:underline">
            Transparens &amp; GDPR
          </Link>
          , och gränserna för allt vårt finansinnehåll står i{" "}
          <Link href="/finansiell-policy" className="font-semibold text-gold hover:underline">
            Finansiell policy
          </Link>
          . Du fattar alltid egna beslut — och bär eget ansvar för dem.
        </p>
      </header>

      {/* ── Forskningsläget (M3): sidans topp — korstabellens läge i ett svep ──
          Donut (andel gröna), topp-3 gröna med länk in i forskningsbiblioteket,
          deterministisk marknadsläge-text + P6:s datering. Klientkort som
          hämtar /api/forskningslage (server-side, cache 1 h). */}
      <ForskningslageKort />

      {/* ── Så fungerar flödet ──────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold">Så fungerar flödet</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            {
              steg: "1",
              ikon: "🛡",
              rubrik: "Välj risknivå och takt",
              text: "Konservativ, balanserad eller tillväxt — i lugn, stadig eller aggressiv takt. Valet sätter horisontvikter, spridningstak och minimikrav (mikro-horisonten förblir minst viktig).",
            },
            {
              steg: "2",
              ikon: "🧮",
              rubrik: "Motorn poängsätter korstabellen",
              text: "Varje bolag bedöms: AKM1-poäng (50 %), fundamental + teknisk vågstatus per horisont (35 %) och golvmarginal som bonusfaktor (15 %). Bolag utan mätvärden får ärliga varningar — aldrig påhittade siffror.",
            },
            {
              steg: "3",
              ikon: "📡",
              rubrik: "Portföljen redovisas öppet",
              text: "8–15 innehav med vikter, motiv och kravchips per position. Bryter ett innehav mot profilen strikta krav får du ersättningskandidater i samma bransch — studieobjekt, aldrig order.",
            },
          ].map((s) => (
            <div key={s.steg} className="rounded-2xl border border-gold/25 bg-card p-5">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
                <span className="text-base leading-none" aria-hidden>
                  {s.ikon}
                </span>
                Steg {s.steg}
              </p>
              <h3 className="mt-2 font-serif text-lg font-bold leading-snug">{s.rubrik}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bygg-flödet: riskval → portföljförslag ──────────────────── */}
      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold">Forska fram din portfölj</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Sidan är öppen för alla — utforska riskvalet fritt. Själva bygget kräver
          att du loggar in som medlem (gratis konto räcker). Uppföljning,
          ersättningsanalys och hyrda forskningsportföljer ingår i prenumerationen
          nedan.
        </p>
        <div className="mt-6">
          {finns ? (
            <ByggPortfoljKort />
          ) : (
            <div className="rounded-2xl border border-dashed border-gold/40 bg-paper p-5 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
                Datainsamlingen pågår
              </p>
              <h3 className="mt-2 font-serif text-xl font-bold">
                Grundunderlaget mäts upp — motorn gissar aldrig
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Korstabellens grunddata (AKM1-bedömning, vågstatus och golv per
                bolag) håller på att samlas in och dubbelkollas mot två oberoende
                källor. Det färdiga underlaget levereras av insamlingspipelinen —
                tills dess visas nedan hur hela flödet ser ut, med tydligt märkta
                syntetiska demodata. Forskningsredovisning utan underlag vore att
                hitta på siffror, och det gör vi aldrig.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Korstabellen ────────────────────────────────────────────── */}
      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold">Korstabellen — motorens underlag</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Tio bolag per bransch, AKM1 och vågor sida vid sida. Detta är det
          mätunderlag portföljbygget vilar på — varje rad har sin senast
          kontrollerade mätpunkt markerad.
        </p>
        <div className="mt-6">
          {finns ? (
            <Korstabell />
          ) : (
            <div className="space-y-4">
              <p className="rounded-xl border border-gold/30 bg-gold/10 p-3 text-xs italic leading-relaxed text-gold">
                Nedan följer en demonstration med syntetiska fixturer (20 bolag,
                tre branscher) — inte mätdata. Den visar korstabellen, riskvalet
                och portföljdjupvyn som de kommer att se ut när insamlingen är
                klar.
              </p>
              <PortfoljForskningDemo />
            </div>
          )}
        </div>
      </section>

      {/* ── Prenationer: 3 nivåer + Fas 2/3-rabatt ──────────────────── */}
      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold">Prenumeration &amp; portföljhyra</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Tre nivåer av samma forskning — från månadsvis forskningsportfölj till
          hyrd portfölj där AK1A sköter omvikningar och kravkontroller. Medlemmar
          i Fas 2 och Fas 3 får rabatt på alla nivåer.
        </p>
        <div className="mt-6">
          {priser ? (
            <PrisKort priser={priser} />
          ) : (
            <p className="rounded-2xl border border-dashed border-gold/40 bg-paper p-5 text-sm italic leading-relaxed text-muted-foreground">
              Prislistan håller på att sättas — prenumerationsnivåerna presenteras
              här så snart besluten är fatta.
            </p>
          )}
        </div>
      </section>

      {/* ── Vidare ─────────────────────────────────────────────────── */}
      <section className="mt-12 rounded-2xl border border-gold/30 bg-card p-6">
        <h2 className="font-serif text-2xl font-bold">Vill du förstå metoden bakom?</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Poängsättningen vilar på AKM1:s 20 variabler och vågfundamentets
          tidsserier — utforska dem i verktygen, eller bygg ditt eget urval i
          Portföljbyggaren.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/kalkylator"
            className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            AKM1-kalkylatorn
          </Link>
          <Link
            href="/portfoljbyggare"
            className="rounded-md border border-gold/50 px-4 py-2 text-sm font-semibold hover:bg-gold/10"
          >
            Portföljbyggaren
          </Link>
          <Link
            href="/medlemskap"
            className="rounded-md border border-gold/50 px-4 py-2 text-sm font-semibold hover:bg-gold/10"
          >
            Se medlemskap
          </Link>
        </div>
      </section>
      </KorstabellLeverantor>
    </SeoPageShell>
  );
}
