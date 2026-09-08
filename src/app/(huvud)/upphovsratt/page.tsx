import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/upphovsratt",
  title: "Upphovsrättspolicy — ära boken, bygg egen pedagogik | AK1A",
  description:
    "AK1A:s upphovsrättspolicy: kurserna är fristående pedagogiska verk inspirerade av 101 kanonböcker. Idéer, metoder och fakta är fria — bokens formuleringar är skyddade. Kort citat med källangivelse enligt 46 § upphovsrättslagen (1960:729).",
  keywords: [
    "upphovsrätt",
    "upphovsrättslagen 1960:729",
    "citaträtten",
    "citationsrätten",
    "bokmaster",
    "källhänvisning",
    "AK1A",
  ],
});

const lasMer = "font-medium text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold";

export default function UpphovsrattPage() {
  const sektion = (rubrik: string, stycken: React.ReactNode[]) => (
    <section className="mt-8">
      <h2 className="font-serif text-2xl font-bold">{rubrik}</h2>
      {stycken.map((p, i) => (
        <p key={i} className="mt-3 leading-relaxed text-muted-foreground">
          {p}
        </p>
      ))}
    </section>
  );

  return (
    <SeoPageShell breadcrumb={[{ name: "Upphovsrättspolicy" }]}>
      <h1 className="font-serif text-4xl font-bold">Upphovsrättspolicy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Fastställd 2026-09-01 · gäller alla AK1A:s kurser, quiz och material
      </p>

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">Bakgrund och juridisk grund</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          AK1A bygger kurser som FRISTÅENDE pedagogiska verk INSPIRERADE av 101 kanonböcker. Den
          juridiska grunden är upphovsrättslagen (1960:729): enligt 1–2 §§ gäller skyddet för
          VERKETS FORM — uttrycket — inte idéer, metoder, fakta eller koncept. Citeringsrätten i 46 §
          tillåter i sin tur korta citat med källangivelse i den utsträckning ändamålet motiverar.
          Denna policy beskriver hur vi tillämpar båda delarna i praktiken.
        </p>
      </section>

      {sektion("1. Vår princip — ära boken, bygg egen pedagogik", [
        "Varje bokmaster-kurs är vårt eget pedagogiska verk: egna förklaringar, egna svenska exempel, egna övningar och egna quiz. Det är INTE återberättelser kapitel för kapitel — och INTE en ersättning för boken. Bokens förtjänst är bokens; vår förtjänst är pedagogiken vi bygger på dess idéer.",
      ])}

      {sektion("2. Vad som INTE är skyddat — och vad som ÄR", [
        "Idéer, fakta, metoder och teorier är fria enligt lagen — de tillhör ingen och får alla bygga vidare på. Bokens formuleringar, struktur och exempel är däremot skyddade.",
        "Vi citerar endast kort — några meningar som mest — och alltid med full källangivelse när ett citat används (46 §). Längre återgivning förekommer inte.",
      ])}

      {sektion("3. Källhänvisning på varje kurs", [
        "Varje bokbaserad kurs redovisar sin källa — författare, titel och år — på kurssidan, så att du alltid kan spåra vilken bok idéerna kommer från.",
        <>
          Fullständig förteckning:{" "}
          <Link href="/kallor" className={lasMer}>
            Källor
          </Link>
          .
        </>,
      ])}

      {sektion("4. Köp boken", [
        "Vi UPPMUNTRAR köp av böckerna. De är kanon av en anledning, och våra kurser är komplement — inte substitut. Den djupaste förståelsen får du genom att läsa boken själv och sedan använda våra kurser för att öva, repetera och tillämpa det du lärt.",
        <>
          Hela listan med länkar till bokhandlar finns på{" "}
          <Link href="/kallor" className={lasMer}>
            Källor
          </Link>
          .
        </>,
      ])}

      {sektion("5. Vårt eget innehåll", [
        "Allt vi själva skapar — texter, quiz, motorer, visualiseringar och design — är vårt verk och skyddat © AK1A Research Lab. Det gäller materialet som helhet såväl som enskilda delar.",
      ])}

      {sektion("6. Tredjepartsrättigheter", [
        "Aktiedata hämtas från Yahoo Finance och används enligt deras villkor. Bokomslag används INTE — AK1A har inga omslagsbilder i plattformen (bekräftat). Övriga tredjepartsrättigheter redovisas på källsidan där de förekommer.",
      ])}

      {sektion("7. Om du är upphovsman och anser att vi går över gränsen", [
        "Hör av dig till info@ak1nvestor.com. Vi åtgärdar, omformulerar eller tar bort ifrågasatt material snarast. Skyddsändamålet i 46 § andra stycket respekteras — citaträtten får aldrig strida mot verkets normala exploatering eller skada upphovsmannen.",
      ])}

      {sektion("8. Anmälan → granskning → åtgärd", [
        "Vår process är DMCA-liknande och enkel: (1) du anmäler med angivande av verk och var det återfinns, (2) vi granskar anmälan inom 14 dagar, (3) vi vidtar åtgärd — omformulering, ersättande eller borttagning — och återkopplar till dig.",
      ])}

      {sektion("9. Svensk rätt, svenska användare", [
        "Kursmaterialet riktar sig till svenska användare och svensk rätt tillämpas. Har du frågor om denna policy: info@ak1nvestor.com",
      ])}

      <div className="mt-12 rounded-lg border border-gold/30 bg-gold/5 p-4">
        <p className="font-serif text-lg font-bold">Relaterade sidor</p>
        <ul className="mt-2 space-y-2 text-sm leading-relaxed">
          <li>
            <Link href="/kallor" className={lasMer}>
              Källor
            </Link>{" "}
            — alla 101 böcker med författare, titel, år och länkar till bokhandlar.
          </li>
          <li>
            <Link href="/ansvar" className={lasMer}>
              Ansvar &amp; friskrivning
            </Link>{" "}
            — utbildning, inte rådgivning: var gränsen för vårt ansvar går.
          </li>
          <li>
            <Link href="/finansiell-policy" className={lasMer}>
              Finansiell policy
            </Link>{" "}
            — ärlighet, anti-casino, teoriernas status och felloggning.
          </li>
        </ul>
      </div>
    </SeoPageShell>
  );
}
