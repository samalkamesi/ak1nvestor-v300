import type { Metadata } from "next";
import { pageMetadata, JsonLd, websiteJsonLd } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Superanalys } from "@/components/ak1a/superanalys";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/superanalys",
  title: "Superanalysen — analysera ett bolag i 24 steg | AK1A",
  description:
    "Guidad aktieanalys i 24 steg: AKM1:s 20 fundamentalvariabler (V01–V20) med formler och trösklar, plus AK1TS-vågklassgissning per tidshorizont. Avsluta med ett delbart analys-kort med poäng av 100 — pedagogiskt, aldrig investeringsråd.",
  keywords: [
    "superanalys",
    "aktieanalys steg för steg",
    "AKM1 20 variabler",
    "fundamentalanalys guide",
    "aktieanalys verktyg",
    "ROE P/S EV/EBITDA trösklar",
    "Elliott vågteori horisonter",
  ],
});

export default function SuperanalysPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Superanalysen" }]} wide>
      <JsonLd data={websiteJsonLd()} />
      <h1 className="font-serif text-4xl font-bold">Superanalysen</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        Flaggskeppet: en guidad, komplett aktieanalys i 24 steg. Poängsätt AKM1:s 20
        fundamentalvariabler — en i taget, med formel, förklaring och typiska trösklar —
        korsläs sedan mot AK1TS genom att gissa vågklass på fem tidshorisonter. Resultatet
        blir ett delbart analys-kort med betyg av 100. Utkastet sparas automatiskt; en
        fullbordad analys förtjänar +100 XP.
      </p>
      <div className="mt-10">
        <Superanalys />
      </div>
    </SeoPageShell>
  );
}
