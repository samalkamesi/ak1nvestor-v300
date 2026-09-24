import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { VagfundamentMatris } from "@/components/ak1a/vagfundament-matris";
import { VagkartaKort } from "@/components/ak1a/vagkarta-kort";
import { VagkonGraf } from "@/components/ak1a/vagkon-graf";
import { VagkurvaGraf, VAGKURVA_STANDARD_TICKERS } from "@/components/ak1a/vagkurva-graf";
import { SektionsCta } from "@/components/ak1a/sektions-cta";

// Statisk per default ger s-maxage=31536000 (årslås, o10 §2) — revalidate
// binder det, samma mönster som /kurser sedan våg 82.
export const revalidate = 3600;

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
 * DEMO-historik — 25 månads-slutkurser för Volvo B (statisk serie ur 2 års
 * volatilitet). Vågkonen ritar sina percentilband ur seriens egen σ; live-data
 * finns på /api/vagkon?ticker=VOLV-B.ST&serie=pris.
 */
const DEMO_VOLVO_B_PRIS = [
  258, 263, 257, 266, 274, 281, 287, 283, 276, 285, 294, 302, 308, 297, 289, 296, 305, 314, 321,
  315, 306, 312, 323, 332, 327,
];

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

      {/* Elliott-vågkurvor — vågläget per tidshorisont, ritat ur vågmotorns klass */}
      <div className="mt-10">
        <h2 className="font-serif text-2xl font-bold">Elliott-vågkurvor per horisont</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Fem tidshorisonter — mikro, kort, medellång, lång och Mega — var och en
          med sin vågkurva. Klass, styrka och lutning läses ur vågmotorn ovan;
          kurvformerna är Elliott-strukturer som synliggör läget: en impulsvåg
          ritas som den klassiska femvågssekvensen, en korrigering som ett
          A-B-C-zickzack och ett basbygge som en platt kanal. Välj bolag bland
          de tolv standard-tickrarna och jämför med matrisen.
        </p>
        <div className="mt-4">
          <VagkurvaGraf ticker="VOLV-B.ST" alternativ={VAGKURVA_STANDARD_TICKERS} />
        </div>
      </div>

      {/* Vågkon — scenariot som växer ur historikens egen volatilitet (Fas C) */}
      <div className="mt-10">
        <h2 className="font-serif text-2xl font-bold">Vågkon</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Vågkon — scenario för Volvo B:s pris (ur 2 års volatilitet).
        </p>
        <div className="mt-4">
          <VagkonGraf historik={DEMO_VOLVO_B_PRIS} titel="VOLV-B.ST" enhet="SEK" />
        </div>
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

      {/* v160 P2.5 (audit #4): sidans konverterings-CTA — startsidans standard */}
      <SektionsCta />
    </SeoPageShell>
  );
}
