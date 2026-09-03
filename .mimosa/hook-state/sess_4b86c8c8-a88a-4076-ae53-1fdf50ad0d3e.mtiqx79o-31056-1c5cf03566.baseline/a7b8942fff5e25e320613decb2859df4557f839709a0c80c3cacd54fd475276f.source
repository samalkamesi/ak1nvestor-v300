import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/medlemskap",
  title: "Fas 1 gratis — fundamentalanalys är en rättighet | AK1A",
  description:
    "Fas 1: alla 225 kurser och analyser helt kostnadsfritt — fundamentalanalys är en rättighet som luft och vatten. Fas 2: personlig utbildning medgrundaren, 90 dagar nöjdhetsgaranti, 9 999 kr. Ansökan krävs.",
  keywords: [
    "gratis aktieutbildning",
    "fundamentalanalys gratis",
    "AKM1 medlemskap",
    "aktieanalys utbildning Sverige",
    "representant utbildning",
  ],
});

export default function MedlemskapPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Medlemskap" }]} wide>
      <h1 className="font-serif text-4xl font-bold">Vår vision: kunskap är en rättighet</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
        Fundamentalanalys ska vara tillgänglig för alla människor — som luft och vatten.
        Därför är <strong>Fas 1 helt gratis, för alltid</strong>. Vi tjänar inte på
        människor som vill lära sig. Fas 2 är för dig som vill gå längre — med vår
        expertis vid din sida.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {/* FAS 1 */}
        <div className="flex flex-col rounded-xl border-2 border-gold bg-card p-7 shadow-lg">
          <span className="mb-2 inline-block w-fit rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-primary-foreground">
            FAS 1 · ALLTID GRATIS
          </span>
          <h2 className="font-serif text-2xl font-bold">Lär dig fundamentalanalys</h2>
          <p className="mt-1 text-sm italic text-muted-foreground">
            "En rättighet vi garanterar till alla människor."
          </p>
          <ul className="mt-5 flex-1 space-y-2.5 text-sm">
            {[
              "Alla 225 kurser — hela AKM1-metodiken",
              "Alla aktieanalyser (99-sidors genomgångar)",
              "Alla 201 case studies i labbet",
              "AKM1-kalkylatorn med rapportguide",
              "Hela bloggen med guider och variabelserien",
              "Bli medlem med bara e-post — ingen betalning någonsin",
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
            FAS 2 · ANSIKAN KRÄVS · 9 999 KR
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
            <strong className="text-foreground">Så blir du beviljad:</strong> boka möte med
            grundaren för att kontrollera att du har viljan att lyckas. Vi kan närsomhelst
            avbryta utbildningen om policyn inte följs.
          </div>
          <Link
            href="/#portal"
            className="mt-5 rounded-md border border-gold/50 px-4 py-2.5 text-center text-sm font-semibold hover:bg-gold/10"
          >
            Ansök om Fas 2 → boka möte
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

      <section className="mt-12 rounded-lg border border-gold/30 bg-card p-6">
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
        <Link href="/kalkylator" className="underline hover:text-foreground">
          Testa kalkylatorn direkt
        </Link>{" "}
        — den visar exakt var du hittar varje siffra i årsredovisningen.
      </p>
    </SeoPageShell>
  );
}
