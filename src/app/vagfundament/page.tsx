import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { VagfundamentMatris } from "@/components/ak1a/vagfundament-matris";
import { VagkartaKort } from "@/components/ak1a/vagkarta-kort";

export const metadata: Metadata = pageMetadata({
  path: "/vagfundament",
  title: "Vågfundament — fundamentalvågorna per aktie | AK1A",
  description:
    "Varje AKM1-variabel är en tidsserie med sin egen våg. Se 20 fundamentalvariabler × 5 tidshorisonter i en matris — deterministiskt klassad, med hederlig osatt-markering när historik saknas.",
  keywords: [
    "fundamentalanalys",
    "AKM1",
    "fundamentalvågor",
    "vågmatris",
    "aktieanalys",
    "Volvo B analys",
  ],
});

/**
 * VÅGFUNDAMENT — fundamentalvågornas ekosystem (pedagogisk ingång).
 * Demovisning med VOLV-B.ST; konceptet lärs ut öppet (P8), exakta
 * klassningsgränser stannar i motorn. Sidan är en server component —
 * matrisen hämtar själv sin data via /api/vagfundament.
 */
export default function VagfundamentPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Hem", href: "/" }, { name: "Vågfundament" }]} wide>
      <h1 className="font-serif text-4xl font-bold">Vågfundament</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        Indikatorer förblir inte längre statiska — vi förstår deras rörelser.
      </p>

      <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/90">
        <p>
          En ROE på 20 % är bara ett tal. Men <em>banan</em> dit — från 16 till 20 %,
          med bruttomarginalen som breddar och skuldsättningen som smalnar — är en
          berättelse. <strong>Vågfundament</strong> behandlar varje variabel i AKM1:s
          fundamentalmodell som vad den verkligen är: en tidsserie med egen riktning,
          egen fart och egen rytm.
        </p>
        <p>
          Resultatet är en <strong>20 × 5-matris</strong>: alla tjugo variabler, från
          försäljningstillväxt till återköp, läsade på fem tidshorisonter — från
          senaste kvartalet till hela den tillgängliga historiken. Varje cell får en
          av fyra vågklasser: <span className="font-semibold text-bull">impulsvåg</span>{" "}
          (variabeln rör sig kraftigt i positiv riktning),{" "}
          <span className="font-semibold text-bear">korrigering</span> (kraftigt i negativ
          riktning), <span className="font-semibold text-gold">basbygge</span> (i princip
          stillastående) eller <span className="font-semibold text-muted-foreground">osatt</span>.
        </p>
        <p>
          Osatt är en hederlig utdata. När dataunderlaget är för tunt för en säker
          klassning visar matrisen det i stället för att gissa — samma ärlighet som
          gäller när du själv poängsätter en variabel i AKM1 och väljer att lämna den
          opoängsatt. Till vänster om varje rad syns också variabelns aktuella nivå
          0–5, där den kan beräknas ur underlaget.
        </p>
        <p>
          Läs matrisen som en väderkarta för bolagets fundamentals: är lönsamheten i
          impulsvåg medan värderingen korrigera? Bygger stabiliteten bas medan
          tillväxten växer? Kombinerad med prisvågsmatrisen (AK1TS) blir den
          intressantaste frågan synlig — när fundamentet och priset rör sig i
          olika riktningar. Det är en inbjudan att studera, aldrig en signal att
          köpa eller sälja.
        </p>
      </div>

      <div className="mt-10">
        <VagfundamentMatris ticker="VOLV-B.ST" />
      </div>

      {/* Dagens vågkarta — den autonoma morgonskanningen (Yahoo + MarketStack) */}
      <div className="mt-10">
        <VagkartaKort />
      </div>

      <div className="mt-10 rounded-lg border border-gold/20 bg-gold/5 p-5">
        <h2 className="font-serif text-lg font-bold">Så läser du matrisen</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed">
          <li>
            <strong>En rad = en variabel.</strong> V01–V20 räknas upp med sina namn;
            nivå-badgen visar AKM1-poängen 0–5 där motorn kan beräkna den — annars
            ett streck.
          </li>
          <li>
            <strong>En kolumn = en tidshorisont.</strong> Mikro jämför senaste kvartalet
            med föregående; kort med samma kvartal i fjol; medellång till mega rör sig
            över årsdata och hela historiken.
          </li>
          <li>
            <strong>Färgen = variabelns egen våg</strong> — inte om variabeln är bra
            eller dålig. En stigande skuldsättningsgrad är en impulsvåg i skulden.
            Undantaget är återköp (V20), där minskat aktieantal läses som positiv våg.
          </li>
          <li>
            <strong>Hovra över en cell</strong> för momentum i procent och om rörelsen
            är bekräftad av horisontens medelvärde.
          </li>
        </ul>
      </div>

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        Underlag: fundamentalserier från offentlig datakälla (Yahoo Finance). Medlemmar
        kan köra matrisen för egna innehav och portföljen samlad i Min portfölj. All
        utdata är pedagogisk analys — inte investeringsråd.
      </p>
    </SeoPageShell>
  );
}
