import Link from "next/link";
import type { Metadata } from "next";
import { getCourseList } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/medlemskap",
  title: "Fas 1 gratis för alltid — Fas 2: utbildning med grundaren | AK1A",
  // Uppdaterad 2026-09-01: 78 BOKMASTER-böcker (räknas dynamiskt nedan)
  description:
    "Fas 1: alla kurser, 78 heltäckta böcker, AI-Mentorn, kalkylatorn och portföljsystemet — kostnadsfritt för alltid. Fas 2: personlig utbildning med grundaren, 90 dagars nöjdhetsgaranti, 9 999 kr. Ansökan krävs.",
  keywords: [
    "gratis aktieutbildning",
    "fundamentalanalys gratis",
    "AKM1 medlemskap",
    "aktieanalys utbildning Sverige",
    "representant utbildning",
    "bokmaster",
  ],
});

export default function MedlemskapPage() {
  const kurserLista = getCourseList();
  const kurser = kurserLista.length;
  const bokmaster = kurserLista.filter((c) => c.category === "BOKMASTER").length;
  const flaggskepp = kurserLista.filter((c) => c.category === "EKOSYSTEM").length;
  const quiz = kurserLista.reduce(
    (s, c) => s + c.chapters.reduce((q, k) => q + (k.quiz?.length || 0), 0), 0
  );

  return (
    <SeoPageShell breadcrumb={[{ name: "Medlemskap" }]} wide>
      <h1 className="font-serif text-4xl font-bold">Vår vision: kunskap är en rättighet</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        Fundamentalanalys ska vara tillgänglig för alla människor — som luft och vatten.
        Därför är <strong>Fas 1 helt gratis, för alltid</strong>. Vi tjänar inte på
        människor som vill lära sig. Fas 2 är för dig som vill gå längre — med
        grundarens coaching vid din sida.
      </p>

      {/* Värde-rad — generositeten i klartext */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          { tal: `${kurser}`, etikett: "kurser, alla gratis" },
          { tal: `${bokmaster}`, etikett: "heltäckta böcker, kapitel för kapitel" },
          { tal: `${quiz.toLocaleString("sv-SE")}`, etikett: "quizfrågor med +10 XP var" },
          { tal: `${flaggskepp}`, etikett: "ekosystem-flaggskepp (AKM1 + AK1TS superdjupt)" },
        ].map((s) => (
          <div key={s.etikett} className="rounded-xl border border-gold/30 bg-card p-4 text-center">
            <div className="font-serif text-3xl font-black text-gold">{s.tal}</div>
            <div className="mt-1 text-[11px] leading-tight text-muted-foreground">{s.etikett}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {/* FAS 1 */}
        <div className="flex flex-col rounded-xl border-2 border-gold bg-card p-7 shadow-lg">
          <span className="mb-2 inline-block w-fit rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-primary-foreground">
            FAS 1 · ALLTID GRATIS · ALLTID ÖPPET
          </span>
          <h2 className="font-serif text-2xl font-bold">Bli en oberoende aktieanalytiker</h2>
          <p className="mt-1 text-sm italic text-muted-foreground">
            ”En rättighet vi garanterar till alla människor.”
          </p>
          <ul className="mt-5 flex-1 space-y-2.5 text-sm">
            {[
              `Alla ${kurser} kurser — hela AKM1-metodiken (V01–V20)`,
              `${bokmaster} BOKMASTER-böcker kapitel för kapitel — Graham, Buffett, Marks, Damodaran, Murphy, Soros, Kahneman…`,
              "Båda ekosystem-flaggskeppen: AKM1 Den Kontroversiella Modellen + AK1TS Våglärans Hierarki",
              "AI-Mentorn som känner dig + Short-Sellern som grillar dina teser",
              "140 flashcards med spaced repetition (Ebbinghaus/SM-2)",
              "AKM1-kalkylatorn + portföljsystemet med fundamentaldata per innehav",
              "Biblioteket: bokkanon mappad mot AKM1/AK1TS",
              "Certifikat, topplista, XP & nivåer 1–100",
              "Alla aktieanalyser och case studies i labbet",
              "Bli medlem med bara e-post — ingen betalning, någonsin",
            ].map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-gold">✓</span>
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/kurser"
            className="mt-6 rounded-md bg-gold px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Börja lära dig nu — kostnadsfritt
          </Link>
        </div>

        {/* FAS 2 */}
        <div className="flex flex-col rounded-xl border border-gold/40 bg-card p-7">
          <span className="mb-2 inline-block w-fit rounded-full border border-gold/50 px-3 py-0.5 text-xs font-semibold text-gold">
            FAS 2 · ANSÖKAN KRÄVS · 9 999 KR
          </span>
          <h2 className="font-serif text-2xl font-bold">Utbildning med grundaren</h2>
          <p className="mt-1 text-sm italic text-muted-foreground">
            Samma kunskap — men med min expertis, coaching och gemenskap.
          </p>
          <ul className="mt-5 flex-1 space-y-2.5 text-sm">
            {[
              "Personlig utbildning med grundaren av AK1A",
              "90 dagars nöjdhetsgaranti — du betalar ingenting förrän du är nöjd",
              "Utbildning i grupp tillsammans med andra klienter",
              "Mål: utbilda framtida representanter för AK1nvestor",
              "Tips på bolag under utbildningen — testade med siffror och variabler",
              "Rätt att nyttja framtida Fas 2-tjänster (utvecklas löpande)",
              "Efter utbildningen: möjlighet att arbeta med AK1nvestor.com vid stark vilja och resultat",
            ].map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-gold">✓</span>
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-lg border border-gold/30 bg-paper p-3 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">För vem?</strong> Du som gått djupt i Fas 1
            (nivå 25+ är en bra signal) och vill ha en människa vid sidan — inte mer
            innehåll. Fas 1 gömmer ingenting: allt vi kan finns gratis. Fas 2 köper du
            för coachingen, gemenskapen och representant-vägen.
          </div>
          <Link
            href="/fas2-ansok"
            className="mt-5 rounded-md border border-gold/50 px-4 py-2.5 text-center text-sm font-semibold hover:bg-gold/10"
          >
            Ansök om Fas 2 → kostnadsfritt, 2 minuter
          </Link>
        </div>
      </div>

      {/* FAS 3 teaser */}
      <div className="mt-6 rounded-xl border border-dashed border-gold/40 bg-paper p-6 text-center">
        <p className="font-serif text-lg font-bold">
          Fas 3 <span className="text-gold">· 13 999 kr</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Representeras snart. Fas 2-medlemmar får tillgång först — håll utkik.
        </p>
      </div>

      {/* 10x-värdebeviset */}
      <section className="mt-8 rounded-xl border border-gold/30 bg-card p-6">
        <h2 className="font-serif text-2xl font-bold">Varför vi är generösa</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          En traditionell analysutbildning kostar tiotusentals kronor och ger dig en bråkdel
          av metodiken. Hos oss får du <strong>hela systemet gratis</strong>: 20
          fundamentalvariabler med formler och trösklar, den deterministiska vågmotorn,{" "}
          {bokmaster} böcker kapitel för kapitel med quiz — och ärligheten om varje
          kontrovers. Vår affärsidé är inte att stänga in kunskapen: den är att utbilda
          oberoende analytiker som så småningom vill arbeta <em>med</em> oss. Ju fler som
          lär sig, desto starkare blir ekosystemet.
        </p>
      </section>

      <section className="mt-6 rounded-lg border border-gold/30 bg-card p-6">
        <h2 className="font-serif text-2xl font-bold">Våra löften</h2>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <li>✓ Fas 1 förblir gratis — kunskap är en rättighet</li>
          <li>✓ Fas 2: betala först när du är nöjd (90 dagar)</li>
          <li>✓ Allt vi publicerar är reproducerbart — källor redovisas</li>
          <li>✓ Vi säljer aldrig din data</li>
          <li>✓ Pedagogisk finansanalys — aldrig investeringsråd</li>
          <li>✓ GDPR: din data är din, export på begäran</li>
        </ul>
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        Redo att börja?{" "}
        <Link href="/laroplan" className="underline hover:text-foreground">
          Öppna läroplanen
        </Link>{" "}
        eller{" "}
        <Link href="/profil" className="underline hover:text-foreground">
          testa din kognitiva profil
        </Link>{" "}
        — båda gratis, för alltid.
      </p>
    </SeoPageShell>
  );
}
