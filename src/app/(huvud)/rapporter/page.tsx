import type { Metadata } from "next";
import { pageMetadata, websiteJsonLd } from "@/lib/seo";
import { StrukturData } from "@/components/seo/StrukturData";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Rapportbyggare } from "@/components/ak1a/rapportbyggare";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/rapporter",
  title: "Dina rapporter — redovisningsverkstan | AK1A",
  description:
    "Rapportbyggaren samlar dina analyser till en formatterad, utskriftsbar redovisningsrapport: marin omslagsband med AK1A-signering och elevens nivå, nyckeltal som tabular-rader, metodiken bakom AKM1 och AK1TS samt automatiska disclaimers. Allt sparas lokalt i webbläsaren. Pedagogiskt redovisningsverktyg — aldrig investeringsråd.",
  keywords: [
    "rapportbyggare",
    "redovisningsverkstad",
    "aktieanalys rapport",
    "utskriftbar analysrapport",
    "terminsredovisning",
    "AKM1",
    "AK1TS",
    "konfluens",
    "superanalys",
    "Fas 2",
  ],
});

export default function RapporterPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Dina rapporter" }]} wide>
      <StrukturData id="jsonld-webbsajt" data={websiteJsonLd()} />
      <h1 className="font-serif text-4xl font-bold">Dina rapporter — redovisningsverkstan</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        Här blir ditt arbete ett dokument att vara stolt över. Välj ut analyserna
        du vill redovisa i din analysbank, tryck på &quot;Bygg rapport&quot; och låt
        verkstan väva samman dem till ett formatterat underlag — marin omslagsband
        med AK1A-signering, nyckeltal i prydliga tabellrader och metodiken bakom
        AKM1, AK1TS och Konfluens. Skriv ut eller spara som PDF och dela med
        lärare, föräldrar eller framtida du. Allt ligger kvar lokalt i din
        webbläsare, och rapporten är vad den alltid varit: pedagogisk analys —
        inte investeringsråd.
      </p>
      <div className="mt-10">
        <Rapportbyggare />
      </div>
    </SeoPageShell>
  );
}
