import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, JsonLd, websiteJsonLd } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Fas3Cert } from "@/components/ak1a/fas3-cert";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/fas3",
  title: "Fas 3 — Certifierad AK1A-Analytiker | AK1A",
  description:
    "Fas 3 är AK1A:s praktikexamen: en certifiering där du bevisar hantverket genom tio kompletta analyser i plattformens egna verktyg — med etikmodul, betyg A–F och årlig vidmakthållande. 13 999 kr. Pedagogisk kompetensprövning — aldrig investeringsråd.",
  keywords: [
    "Fas 3 certifiering",
    "certifierad aktieanalytiker",
    "praktikportfölj aktieanalys",
    "etik fundamentalanalys",
    "AKM1 certifiering",
    "analytiker utbildning Sverige",
  ],
});

/** Kravmatrisen — sex likaviktade kriterier, vardera betyg A–F (forskning-fas3 3.7). */
const KRAV = [
  {
    kriterium: "Metodisk täckning",
    a: "Alla 24 steg genomgångna, variabler motiverade per bolag, fyra dimensioner genomgående.",
    f: "Variabler poängsatta utan motivering; steg hoppade över.",
  },
  {
    kriterium: "Statistisk ärlighet",
    a: "Oberoende röster krävs innan slutsats, kalibrering redovisad, konfluens graderad.",
    f: "”Allt pekar samma håll” utan oberoende kontroll; sannolikheter på känsla.",
  },
  {
    kriterium: "Redovisning",
    a: "Siffror spårade till källor, proforma vid regimbrott, resultatkvalitetsavsnitt på plats.",
    f: "Multipelvärden okontrollerade mot bolagets egna rapporter.",
  },
  {
    kriterium: "Falsifierbarhet",
    a: "Varje tes med brytpunkt och agerande; uppföljning poängsätter gamla prognoser.",
    f: "Scenarier utan ogiltigförklaringsvillkor; ingen uppföljning.",
  },
  {
    kriterium: "Kontrovers-öppenhet",
    a: "Motståndets argument hörda och besvarade; uppskattningar och dataluckor deklarerade.",
    f: "Enbart bekräftande resonemang.",
  },
  {
    kriterium: "Kommunikation",
    a: "Rapporten läsbar av en lekman utan att förlora stringens; riskdeklaration på plats.",
    f: "Ogenomtränglig eller vilseledande presentation.",
  },
] as const;

/** Praktikportföljen — vad som räknas (forskning-fas3 3.3). */
const PORTFOLJ = [
  {
    ikon: "🏅",
    rubrik: "10 kompletta Superanalyser",
    text: "Tio olika bolag med krav på spridning: minst 4 sektorer, minst ett storbolag och ett småbolag. Varje komplett analys du sparar i verktyget räknas automatiskt — portföljen växer fram medan du övar.",
    auto: true,
  },
  {
    ikon: "📡",
    rubrik: "Minst 4 fulla Konfluens-läsningar",
    text: "Kopplade till dina Superanalyser: värdegolv FÖRE vågor, och fem oberoende röster som måste tala samman innan en slutsats får landa.",
    auto: true,
  },
  {
    ikon: "📊",
    rubrik: "Minst 2 tryckklara rapportbyggar-rapporter",
    text: "Multipelvärdering och DCF med känslighetsmatris, tre scenarier, Monte Carlo/Bayes/Kelly, riskmatris och trigger-matris — minst en i det korta formatet på ett storbolag, för att visa att du vet när tyngre verktyg är överflödiga.",
    auto: true,
  },
  {
    ikon: "🔁",
    rubrik: "Minst 1 uppföljningsanalys",
    text: "En egen tidigare analys återöppnas: brytpunkter poängsätts och den märkta historiken redovisas. Certifieringens själsrörelse — förmågan att döma sitt eget arbete.",
    auto: false,
  },
  {
    ikon: "⚔️",
    rubrik: "Minst 1 öppen debatt-analys",
    text: "Skriftligt: hur motståndarna skulle angripa din slutsats (EMH, random walk, akademisk TA-kritik, kvantfaktor-traditionen) — och ditt svar. Kontroversiell ärlighet, omvandlad till examinationsbar kompetens.",
    auto: false,
  },
] as const;

/** Etik-modulens tre examineerbara löften (forskning-fas3 3.4). */
const LOFTEN = [
  {
    nr: "1",
    namn: "Redovisa motståndet",
    text: "Varje analys i portföljen visar hur motståndarna tänker — innan din egen slutsats. Den öppna debatt-analysen är spetsen på detta löfte.",
  },
  {
    nr: "2",
    namn: "Deklarera före resultat",
    text: "Teorivikter, poängsättningstabell och datakällor publiceras i rapporten innan slutsatsen. Rekommendationen följer tabellen — aldrig tvärtom.",
  },
  {
    nr: "3",
    namn: "Falsifierbarhet",
    text: "Ingen tes utan brytpunkt, inget scenario utan ogiltigförklaringsvillkor — och uppföljning före ny analys.",
  },
] as const;

/** ÅKU-cykeln — årligt vidmakthållande (forskning-fas3 3.8). */
const AKU = [
  {
    ikon: "🏅",
    text: "1 ny portföljanalys — Superanalys + Konfluens på ett aktuellt bolag.",
  },
  {
    ikon: "🔁",
    text: "1 valideringsrunda av egna äldre prognoser — med redovisad träffsäkerhet.",
  },
  {
    ikon: "⚖️",
    text: "1 etiksdiskussion kring ett aktuellt case (cirka 2 timmar).",
  },
] as const;

export default function Fas3Page() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Hem", href: "/" }, { name: "Fas 3 — Certifiering" }]} wide>
      <JsonLd data={websiteJsonLd()} />

      {/* ── HERO — marin panel med guld-CTA ─────────────────────────────────── */}
      <section className="marin-panel relative overflow-hidden rounded-3xl border-2 border-gold/60 p-7 shadow-2xl sm:p-12">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]">
          <span className="font-serif text-[150px] font-black tracking-tight">FAS 3</span>
        </div>
        <div className="pointer-events-none absolute inset-2 rounded-2xl border border-[#E8C766]/30" aria-hidden />
        <div className="relative max-w-3xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#E8C766]">
            Praktikexamen · Fas 3 · 13 999 kr
          </p>
          <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#EDE6D6] sm:text-5xl">
            Fas 3 — Certifierad AK1A-Analytiker
          </h1>
          <p className="mt-4 font-serif text-lg italic leading-relaxed text-[#E8C766] sm:text-xl">
            Praktikexamen: bevisa hantverket genom tio kompletta analyser.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[#EDE6D6]/85 sm:text-base">
            Fas 1 äger du kunskapen. Fas 2 slipar du den med en mästare. Fas 3{" "}
            <strong className="text-[#EDE6D6]">bevisar</strong> du den — en
            certifiering där det producerade arbetet själv är examinationen.
            Granskad, betygsatt och utfärdad. Beviset som sedan talar för dig,
            oavsett vart din resa tar vägen.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="#krav"
              className="rounded-md bg-gold px-5 py-3 text-center text-sm font-bold text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
            >
              Se kraven ↓
            </a>
            <Link
              href="#portfolj"
              className="rounded-md border border-[#E8C766]/50 px-5 py-3 text-center text-sm font-semibold text-[#E8C766] transition-colors hover:bg-[#E8C766]/10"
            >
              Vad räknas i portföljen?
            </Link>
          </div>
        </div>
      </section>

      {/* ── DIN PROGRESS — praktikportföljens råvara, läst lokalt ──────────── */}
      <div className="mt-10">
        <Fas3Cert />
      </div>

      <div className="hjarlinje mt-10" />

      {/* ── KRAVMATRISEN — sex kriterier, A–F ──────────────────────────────── */}
      <section id="krav" className="mt-10 scroll-mt-24">
        <h2 className="font-serif text-2xl font-bold">Kravmatrisen — sex kriterier, betyg A–F</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Portföljen betygsätts på sex likaviktade kriterier, vardera A–F.
          Slutbetyget sätts på <strong>portföljen som helhet — aldrig på
          människan</strong>. Ett F på ett kriterium är en arbetsorder att göra
          om, inte en dom; omgångarna är utan tak.
        </p>
        <div className="table-wrap mt-5 w-full overflow-x-auto rounded-xl border border-gold/30 bg-card">
          <table className="w-full min-w-[640px] text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gold/30 bg-gold/5">
                <th className="px-4 py-3 font-serif text-sm font-bold text-gold">Kriterium</th>
                <th className="px-4 py-3 font-serif text-sm font-bold text-gold">
                  A känns igen på
                </th>
                <th className="px-4 py-3 font-serif text-sm font-bold text-gold">
                  F känns igen på
                </th>
              </tr>
            </thead>
            <tbody>
              {KRAV.map((k) => (
                <tr key={k.kriterium} className="border-b border-gold/10 last:border-b-0">
                  <td className="px-4 py-3 align-top font-semibold text-foreground">
                    {k.kriterium}
                  </td>
                  <td className="px-4 py-3 align-top leading-relaxed text-muted-foreground">
                    {k.a}
                  </td>
                  <td className="px-4 py-3 align-top leading-relaxed text-muted-foreground/80">
                    {k.f}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Skalan höjs medvetet från Fas 1:s certifikat A–D (som mäter nivå och
          XP) till A–F på <em>arbetet</em> — samma ämnen, högre kognitivt krav:
          integrera och tillämpa, självständigt.
        </p>
      </section>

      {/* ── PRAKTIKPORTFÖLJEN — vad som räknas ─────────────────────────────── */}
      <section id="portfolj" className="mt-12 scroll-mt-24">
        <h2 className="font-serif text-2xl font-bold">Praktikportföljen — tio kompletta analyser</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Kärnkravet i certifieringen, byggt i plattformens egna verktyg —
          redan de du använder varje vecka. Inga nya verktyg behövs: verktygen
          blir klassrummet. Portföljen är en halvöppen tentamen som växer fram
          successivt, inte ett provtillfälle.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {PORTFOLJ.map((p) => (
            <div
              key={p.rubrik}
              className="marin-panel relative rounded-2xl border border-gold/30 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-serif text-lg font-bold text-[#EDE6D6]">
                  {p.ikon} {p.rubrik}
                </p>
                {p.auto && (
                  <span
                    className="shrink-0 rounded-full border border-[#E8C766]/50 bg-[#E8C766]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#E8C766]"
                    title="Spåras automatiskt i verktyget — inget att räkna för hand"
                  >
                    ✓ Auto-spåras
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#EDE6D6]/85">{p.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-gold/30 bg-paper p-4 text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Valbara spår.</strong> Två av de
          tio platserna kan fördjupas antingen mot special situations och
          emissioner, eller mot portfölj- och riskarbete — spåret syns på
          certifieringsbeviset. Granskningen sker i två led: AI-förgranskning
          mot schemat, sedan grundarens mänskliga slutbedömning.
        </div>
      </section>

      <div className="hjarlinje mt-12" />

      {/* ── ETIK-MODULEN — tre examineerbara löften ────────────────────────── */}
      <section id="etik" className="mt-12 scroll-mt-24">
        <h2 className="font-serif text-2xl font-bold">Etik-modulen — ärlighet som examinerbar kärna</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Vår hållning är <strong>ärlighet framför comfort</strong> — och den är
          inte en attityd utan tre konkreta löften som kan examineras. De är
          tagna rakt ur metodikens hårda regler, och de gäller varje analys i
          portföljen:
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {LOFTEN.map((l, i) => (
            <div
              key={l.nr}
              className="relative rounded-2xl border border-gold/40 bg-card p-5 shadow-sm"
            >
              <p className="font-serif text-3xl font-bold text-gold">{l.nr}</p>
              <p className="mt-1 font-serif text-lg font-bold">{l.namn}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{l.text}</p>
              {i < LOFTEN.length - 1 && (
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
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Därtill en etik-case-del med dilemman anpassade efter verkligheten som
          analytiker: ”din publicerade analys innehåller ett räknefel — vad
          gör du?”. Svaren bedöms på resonemangets ärlighet, aldrig på ett
          ”rätt svar” — ett F betyder gör om med frågorna som kompass.
        </p>
      </section>

      {/* ── B2B-BEHÖRIGHETEN ───────────────────────────────────────────────── */}
      <section id="b2b" className="mt-12 scroll-mt-24">
        <h2 className="font-serif text-2xl font-bold">
          Certifierad = klar för /pro-plattformen
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Certifieringen är porten till Fas 3:s syfte: den som är certifierad
          är klar för <strong>/pro-plattformen</strong> — analytiker-ytan med
          portföljimport, rapportmallar och rättighetsstyrda moduler — och för
          <strong> relationen till AK1nvestor</strong>, vägen att arbeta med
          oss. Men certifieringen och behörigheten är två olika saker, och det
          ska vara ärligt sagt:
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-gold/40 bg-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
              Certifieringen — alla kan nå den
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Ett personligt bevis: praktikportfölj + etik-del med betyg A–F.
              Delbart, dokumenterat och ditt för alltid — värdefullt även om du
              aldrig vill arbeta inom ekosystemet. Certifieringen intygar{" "}
              <em>hantverk och ärlighet</em>.
            </p>
          </div>
          <div className="rounded-xl border border-gold/40 bg-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
              Behörigheten — en nästa-steg-relation
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Betyg C eller högre öppnar /pro-plattformen. Att representera
              AK1nvestor kräver dessutom grundarens personliga bedömning och en
              undertecknad AK1A-analytikerkod. Certifieringen allena är{" "}
              <strong>aldrig</strong> en rådgivningsbehörighet.
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Compliance, hedvigt: Fas 3 är en <strong>pedagogisk
          kompetensprövning</strong> — aldrig investeringsråd, aldrig en
          rådgivningslicens i Finansinspektionens mening. Att säga detta rakt
          ut är själva exemplen på den ärlighet Fas 3 examinerar. Se vår{" "}
          <Link href="/finansiell-policy" className="underline hover:text-foreground">
            finansiella policy
          </Link>
          .
        </p>
      </section>

      {/* ── ÅKU — kunskap är en färskvara ──────────────────────────────────── */}
      <section id="aku" className="mt-12 scroll-mt-24">
        <div className="marin-panel rounded-2xl border border-gold/30 p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-bold text-[#EDE6D6]">
            ÅKU — kunskap är en färskvara
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#EDE6D6]/85">
            Certifieringen är ett <strong className="text-[#EDE6D6]">levande
            tillstånd</strong>, inte ett diploms datum. Varje år fyller du på
            med en kunskapsuppdatering — ÅKU — anpassad efter din roll som
            analytiker:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[#EDE6D6]/85">
            {AKU.map((a) => (
              <li key={a.text} className="flex gap-2.5">
                <span className="text-[#E8C766]">{a.ikon}</span>
                <span>{a.text}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-[#EDE6D6]/70">
            Missad förnyelse betyder att certifieringen{" "}
            <em>vilar</em> — den indras aldrig — och den återaktiveras av en
            ifylld ÅKU-cykel. Behörigheten hålls alltid färsk, för både dig och
            dem du arbetar med.
          </p>
        </div>
      </section>

      {/* ── PRISRAD ────────────────────────────────────────────────────────── */}
      <section className="mt-12 rounded-3xl border-2 border-gold bg-card p-7 text-center shadow-lg sm:p-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
          Fas 3 · Certifiering · ÅKU-struktur
        </p>
        <p className="mt-3 font-serif text-4xl font-black text-gold sm:text-5xl">
          13 999 kr
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Innehållet är gratis (Fas 1). Människan vid din sida är Fas 2.{" "}
          <strong className="text-foreground">Beviset</strong> — att en
          oberoende granskare lägger timmar på just dina analyser och intygar
          deras kvalitet, med en behörighetsväg för dig som vill arbeta med
          oss — är Fas 3. Ingen betalar för innehåll; alla betalar för
          granskning, betyg och utfärdande.
        </p>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          90 dagars nöjdhetsgaranti (Fas 2:s tradition låter gälla även här) ·
          Fas 2-medlemmar får tillgång först · Alla verktyg förblir gratis i
          Fas 1, för alltid.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/fas2-ansok"
            className="rounded-md bg-gold px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            Gå Fas 2-vägen först → kostnadsfri ansökan
          </Link>
          <Link
            href="/medlemskap"
            className="rounded-md border border-gold/50 px-5 py-3 text-sm font-semibold hover:bg-gold/10"
          >
            Jämför Fas 1, 2 och 3
          </Link>
        </div>
      </section>

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        Redo att börja bygga?{" "}
        <Link href="/superanalys" className="underline hover:text-foreground">
          Öppna Superanalysen
        </Link>{" "}
        och börja din praktikportfölj idag — varje analys du sparar räknas,
        automatiskt. AK1A Research Lab bedriver pedagogisk finansanalys — inget
        här är investeringsråd.
      </p>
    </SeoPageShell>
  );
}
