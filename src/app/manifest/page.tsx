import Link from "next/link";
import type { Metadata } from "next";
import { getCourseList } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { SocialProof } from "@/components/ak1a/social-proof";
import { SIFFROR } from "@/lib/siffror";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/manifest",
  harSpeglar: true, // Ömsesidig hreflang med /en|ar/manifest (VÅG 63 O3 #2)
  title: "Manifestet — världens bästa finansutbildning | AK1A Research Lab",
  // Siffror ur src/lib/siffror.ts (guldkällan) — kroppen räknar dynamiskt
  description:
    `Vårt manifest: vi bygger världens bästa finansutbildning — ${SIFFROR.kurser} kurser, ${SIFFROR.bokmaster} böcker kapitel för kapitel och ${SIFFROR.quiz.toLocaleString("sv-SE")} quizfrågor, gratis i Fas 1. Institutionell metodik, komplett ärlighet och generositet som affärsidé.`,
  keywords: [
    "finansutbildning",
    "manifest",
    "gratis aktieutbildning",
    "fundamentalanalys",
    "AKM1 metodik",
    "AK1TS våglära",
    "bokmaster",
  ],
});

export default function ManifestPage() {
  // Levande tal — räknas från innehållslager vid build. Statisk fallback om datan saknas.
  const kurserLista = getCourseList();
  const kurser = kurserLista.length || 324;
  const bokmaster =
    kurserLista.filter((c) => c.category === "BOKMASTER").length || 78;
  const quiz =
    kurserLista.reduce(
      (s, c) =>
        s +
        c.chapters.reduce(
          (q, k) => q + ((k as { quiz?: Array<unknown> }).quiz?.length ?? 0),
          0
        ),
      0
    ) || SIFFROR.quiz;

  return (
    <SeoPageShell breadcrumb={[{ name: "Manifestet" }]} wide>
      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section className="rounded-xl border-2 border-gold bg-card p-8 shadow-lg sm:p-10">
        <span className="mb-4 inline-block w-fit rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-primary-foreground">
          AK1A RESEARCH LAB · MANIFESTET
        </span>
        <h1 className="font-serif text-4xl font-bold leading-tight sm:text-5xl">
          Vi bygger världens bästa finansutbildning.
        </h1>
        <p className="mt-5 max-w-3xl leading-relaxed text-muted-foreground">
          Inte världens största. Inte världens flashigaste. Bäst — mätt i vad en
          elev faktiskt kan efteråt. Idag: <strong>{kurser} kurser</strong>,{" "}
          <strong>{bokmaster} böcker</strong> täckta kapitel för kapitel och{" "}
          <strong>{quiz.toLocaleString("sv-SE")} quizfrågor</strong> som tvingar
          kunskapen att sitta fast. Imorgon: mer av samma, djupare. Vi håller
          måttet offentligt — ett manifest utan siffror är bara humör.
        </p>
        <p className="mt-4 font-serif text-lg italic text-gold">
          Fas 1 gratis, för alltid — kunskap är en rättighet.
        </p>
      </section>

      {/* ── 2. SEX LÖFTEN ───────────────────────────────────────────────────── */}
      <section className="mt-12">
        <h2 className="font-serif text-3xl font-bold">Våra sex löften</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Sex påståenden som alla går att kontrollera mot innehållet. Om vi
          bryter ett — håll oss ansvariga.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              nr: "01",
              titel: "10x värdet",
              body: (
                <>
                  Varje kurs måste lära dig något du <em>inte</em> kunde förra
                  du öppnade den. En kurs som bara bekräftar vad du redan trodde
                  har misslyckats — oavsett hur snygg den är. Vi siktar på att
                  varje läst minut ska multiplicera din förmåga, inte addera en
                  aning till den.
                </>
              ),
            },
            {
              nr: "02",
              titel: "Komplett ärlighet",
              body: (
                <>
                  Vi lär ut kritiken mot oss själva bättre än kritikerna gör. Den
                  hårdaste granskningen av våra egna modeller finns{" "}
                  <Link
                    href="/kurser/akm1-den-kontroversiella-modellen"
                    className="font-medium text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
                  >
                    i våra egna kontrovers-kurser
                  </Link>{" "}
                  — inte gömd i ett FAQ-hörn. Ett ramverk som inte tål sin egen
                  kritik förtjänar inte ditt förtroende.
                </>
              ),
            },
            {
              nr: "03",
              titel: "Institutionell metodik",
              body: (
                <>
                  AKM1:s 20 variabler och AK1TS:s deterministiska vågmotor — med
                  öppna formler, trösklar och poängsättning. Inga svarta lådor,
                  inget &quot;ltr på känsla&quot;. Allt du ser går att räkna
                  efter själv.
                </>
              ),
            },
            {
              nr: "04",
              titel: "Böckerna hela",
              body: (
                <>
                  Varje BOKMASTER täcker sin bok kapitel för kapitel — inte
                  sammanfattningar, inte &quot;de fem lärdomarna&quot;. Graham
                  läses som Graham, Kahneman som Kahneman. {bokmaster} titlar,
                  och listan växer.
                </>
              ),
            },
            {
              nr: "05",
              titel: "Pedagogik, aldrig råd",
              body: (
                <>
                  Allt vi publicerar är utbildning. Kalkylatorn, vågmotorn,
                  portföljsystemet — varje verktyg bär sin disclaimer, för ett
                  verktyg som lär dig att tänka ska aldrig förleda dig att
                  låta bli.
                </>
              ),
            },
            {
              nr: "06",
              titel: "Generositet som affärsidé",
              body: (
                <>
                  Vi stänger inte in kunskap. Fas 1 är <em>allt</em> innehåll —
                  alla kurser, alla böcker, alla verktyg — kostnadsfritt, för
                  alltid. Vi tjänar inte på att du lär dig; vi tjänar på det du
                  väljer att göra med kunskapen.
                </>
              ),
            },
          ].map((l) => (
            <div
              key={l.nr}
              className="flex flex-col rounded-xl border border-gold/30 bg-card p-6"
            >
              <div className="font-serif text-sm font-black tracking-[0.2em] text-gold">
                {l.nr}
              </div>
              <h3 className="mt-2 font-serif text-xl font-bold">{l.titel}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {l.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. METODIKEN ────────────────────────────────────────────────────── */}
      <section className="mt-12">
        <h2 className="font-serif text-3xl font-bold">Metodiken</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Systemet vilar på två pelare: fundamentalsidan och marknadssidan —
          båda deterministiska, båda öppna.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="flex flex-col rounded-xl border border-gold/40 bg-card p-7">
            <span className="mb-2 inline-block w-fit rounded-full border border-gold/50 px-3 py-0.5 text-xs font-semibold text-gold">
              PELARE I · FUNDAMENTALSIDAN
            </span>
            <h3 className="font-serif text-2xl font-bold">
              AKM1 — Den Kontroversiella Modellen
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              20 variabler, <strong>V01–V20</strong>, grupperade i{" "}
              <strong>7 kategorier</strong> — lönsamhet, tillväxt, stabilitet,
              moat, värdering, risk och katalysator. Varje variabel poängsätts{" "}
              <strong>0–5</strong> mot redovisade trösklar; sammanlagd{" "}
              <strong>maxpoäng är 100</strong>. Inga känslodrivna
              helhetsintryck: ett bolag blir en siffra du kan argumentera om,
              rad för rad.
            </p>
            <Link
              href="/kurser/akm1-den-kontroversiella-modellen"
              className="mt-5 text-sm font-semibold text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
            >
              Läs hela AKM1-kursen →
            </Link>
          </div>
          <div className="flex flex-col rounded-xl border border-gold/40 bg-card p-7">
            <span className="mb-2 inline-block w-fit rounded-full border border-gold/50 px-3 py-0.5 text-xs font-semibold text-gold">
              PELARE II · MARKNADSSIDAN
            </span>
            <h3 className="font-serif text-2xl font-bold">
              AK1TS — Våglärans Hierarki
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              <strong>5 tidshorisonter × 5 teorier × 4 dimensioner</strong> — ett
              helt rutnät av marknadsläror, var och en vägd och poängsatt. En{" "}
              <strong>deterministisk vågmotor</strong>: samma indata ger samma
              vågbild, varje gång. Teorin väljer aldrig sida — den tvingar dig
              att veta vilken teori du handlar på.
            </p>
            <Link
              href="/kurser/ak1ts-vaglarans-hierarki"
              className="mt-5 text-sm font-semibold text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
            >
              Läs hela AK1TS-kursen →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. ÄRLIGHETENS VERKLIGA TEST ────────────────────────────────────── */}
      <section className="mt-12 rounded-xl border border-gold/30 bg-paper p-8">
        <h2 className="font-serif text-3xl font-bold">
          Ärlighetens verkliga test
        </h2>
        <blockquote className="mt-5 border-l-4 border-gold pl-5 font-serif text-lg italic leading-relaxed text-foreground">
          &quot;Teorierna saknar vetenskapligt belagt prediktiv förmåga —
          verktyget tvingar dig att mäta istället för att känna.&quot;
        </blockquote>
        <p className="mt-2 text-xs text-muted-foreground">
          — Ur vår egen disclaimer, som följer med varje analysverktyg.
        </p>
        <div className="mt-5 max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Den meningen skriver vi under på varje verktyg i hela systemet. Inte
            för att vi tvivlar på vårt hantverk — utan för att det är den
            ärligaste meningen som finns att säga om teknisk analys, och alla
            som påstår något annat säljer dig något.
          </p>
          <p>
            <strong className="text-foreground">
              Varför är det en styrka?
            </strong>{" "}
            Därför att varje säljare av säkerhet har ett intresse av att dölja
            osäkerheten. När vi skriver ut den — i disclaimer efter disclaimer —
            finns inget kvar att dölja. Det som återstår är metoden: mät
            istället för att känna, poängsätt istället för att gissa, och låt
            siffran bära ansvaret din mage inte kan bära. En utbildning som
            börjar i &quot;vi vet inte&quot; och ändå lär dig att handla
            strukturerat, är ärligare än en som börjar i löften.
          </p>
        </div>
      </section>

      {/* ── 5. MÄTETALEN ───────────────────────────────────────────────────── */}
      <section className="mt-12">
        <h2 className="font-serif text-3xl font-bold">Mätetalen</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Ett manifest ska gå att räkna på. Så här ser läget ut just nu —
          levande tal, uppdaterade med innehållet.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { tal: `${kurser}`, etikett: "kurser i hela systemet — alla gratis i Fas 1" },
            { tal: `${bokmaster}`, etikett: "BOKMASTER — böcker täckta kapitel för kapitel" },
            {
              tal: quiz.toLocaleString("sv-SE"),
              etikett: "quizfrågor som aktiverar kunskapen du just läst",
            },
            { tal: "140", etikett: "flashcards med spaced repetition (Ebbinghaus/SM-2)" },
            { tal: "10", etikett: "graf-typer i analysverktygen" },
            { tal: "201", etikett: "case studies i labbet — framgångar och misslyckanden" },
          ].map((s) => (
            <div
              key={s.etikett}
              className="rounded-xl border border-gold/30 bg-card p-5 text-center"
            >
              <div className="font-serif text-3xl font-black text-gold">
                {s.tal}
              </div>
              <div className="mt-1 text-[11px] leading-tight text-muted-foreground">
                {s.etikett}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5b. SOCIALT BEVIS — siffror och elevröster ─────────────────────── */}
      <SocialProof className="mt-12" />

      {/* ── 6. VÄGEN ────────────────────────────────────────────────────────── */}
      <section className="mt-12">
        <h2 className="font-serif text-3xl font-bold">Vägen</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Fyra steg, ett enda värdeord: generositet. Vi tjänar inte på att du
          lär dig — vi tjänar på vad du blir.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              steg: "Steg 1",
              titel: "Fas 1 — gratis, för alltid",
              body: (
                <>
                  Alla {kurser} kurser, alla BOKMASTER, alla verktyg.
                  Kostnadsfritt, obegränsat, utan förbehåll. Inte ett
                  smakprov — hela bordet.
                </>
              ),
            },
            {
              steg: "Steg 2",
              titel: "Nivå 25 — beviset för dig själv",
              body: (
                <>
                  När du når nivå 25 har du lagt ned arbetet — och har siffrorna
                  som visar det. Ingen vägspärr, ingen paywall: bara en signal,
                  till dig själv, att grunden sitter.
                </>
              ),
            },
            {
              steg: "Steg 3",
              titel: "Fas 2 — utbildning med grundaren",
              body: (
                <>
                  9 999 kr, ansökan krävs, 90 dagars nöjd-kund-garanti (betalning
                  först efter 90 dagar om du förblir nöjd). Den fundamentala
                  vägen till oberoende analytiker: inget nytt — samma 20
                  analytiska indikatorer, nu sammanvägda på rätt sätt. 18
                  mästarverk med en människa vid din sida, oändligt med timmar —
                  och chansen att bli representant för AK1nvestor.
                </>
              ),
            },
            {
              steg: "Steg 4",
              titel: "Representant — arbeta med oss",
              body: (
                <>
                  För de som vill längre: arbeta med AK1nvestor. Vår modell
                  odlar oberoende analytiker — ibland blir de kollegor. Det är
                  poängen.
                </>
              ),
            },
          ].map((s) => (
            <div
              key={s.steg}
              className="flex flex-col rounded-xl border border-gold/30 bg-card p-6"
            >
              <span className="inline-block w-fit rounded-full border border-gold/50 px-3 py-0.5 text-xs font-semibold text-gold">
                {s.steg}
              </span>
              <h3 className="mt-3 font-serif text-lg font-bold leading-snug">
                {s.titel}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-5 max-w-3xl text-sm italic leading-relaxed text-muted-foreground">
          Läs hela strukturen — faserna, garantin, ansökan — på sidan{" "}
          <Link
            href="/medlemskap"
            className="text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
          >
            Medlemskap
          </Link>
          .
        </p>
      </section>

      {/* ── 7. CTA-RAD ──────────────────────────────────────────────────────── */}
      <section className="mt-12 rounded-xl border-2 border-gold bg-card p-8 text-center shadow-lg">
        <h2 className="font-serif text-2xl font-bold">
          Manifestet är läst. Nu är det din tur.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Tre dörrar — alla öppna, ingen med prislapp.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/laroplan"
            className="rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Börja gratis — öppna läroplanen
          </Link>
          <Link
            href="/profil"
            className="rounded-md border border-gold/50 px-5 py-2.5 text-sm font-semibold hover:bg-gold/10"
          >
            Testa din profil
          </Link>
          <Link
            href="/bibliotek"
            className="rounded-md border border-gold/50 px-5 py-2.5 text-sm font-semibold hover:bg-gold/10"
          >
            Se biblioteket
          </Link>
        </div>
      </section>

      {/* ── 8. SIGNATUR ─────────────────────────────────────────────────────── */}
      <p className="mt-12 border-t border-gold/30 pt-8 text-center font-serif text-lg font-bold leading-relaxed">
        AK1A Research Lab
        <span className="mt-1 block text-sm font-medium italic text-muted-foreground">
          Djupare än en blogg. Tydligare än en bank. Snabbare än en utbildning.
        </span>
      </p>
    </SeoPageShell>
  );
}
