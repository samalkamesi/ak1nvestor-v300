import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, websiteJsonLd } from "@/lib/seo";
import { StrukturData } from "@/components/seo/StrukturData";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

// KF3: Fas 2-landningssidan (/fas2 var 404). Ren presentationsyta — inga
// priser, inga live-tal — därför force-static utan revalidate (inget att
// hämta om). Ansökan och kurslistan lever kvar på /fas2-ansok.
export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/fas2",
  title: "Fas 2 — Fördjupning inom aktieanalys | AK1A",
  description:
    "Fas 2 är fördjupningen inom fundamental aktieanalys: de 20 indikatorerna (V01–V20) — värdering, lönsamhet, skuldsättning, marginaler, moat, kassaflöde — analyserade på riktiga årsredovisningar, tolkade och sammanvägda till ett eget omdöme. Du lär dig läsa bokslut rad för rad, tolka nyckeltal kritiskt och genomskåda det som bara är en berättelse. Pedagogisk utbildning — aldrig investeringsråd.",
  keywords: [
    "Fas 2 aktieanalys",
    "fundamentalanalys fördjupning",
    "20 fundamentala indikatorer",
    "läsa årsredovisning",
    "tolka nyckeltal",
    "P/S P/B EV/EBITDA",
    "ROE bruttomarginal",
    "kritiskt tänkande bokslut",
  ],
});

/**
 * De 20 fundamentala indikatorerna — AKM1:s V01–V20. Namn och kategori ur
 * kanon i src/lib/vagfundament-motor.ts + underlagen i
 * data/forskning/KURS-FAS2/ (samma lista som /fas2-ansok och /fas3 länkar
 * till). Beskrivningarna är pedagogiska en-radsförklaringar — utbildning,
 * aldrig råd. Spegla namnändringar i vagfundament-motor.ts.
 */
const INDIKATORER: Array<{
  nr: string;
  namn: string;
  kat: string;
  ikon: string;
  text: string;
}> = [
  { nr: "V01", namn: "Försäljningstillväxt", kat: "Tillväxt", ikon: "📈",
    text: "Hur snabbt försäljningen växer — läst år för år rakt ur resultaträkningens topprad." },
  { nr: "V02", namn: "ARR-tillväxt", kat: "Tillväxt", ikon: "📆",
    text: "Tillväxten i återkommande intäkter — tecknet på en förutsägbar, prenumerationsliknande affär." },
  { nr: "V03", namn: "Intäktsdiversifiering", kat: "Tillväxt", ikon: "🧺",
    text: "Spridningen över kunder, produkter och marknader — ett brett golv som bär när en del vacklar." },
  { nr: "V04", namn: "P/S", kat: "Värdering", ikon: "🏷️",
    text: "Priset per intäktskrona — vad marknaden betalar för varje krona försäljning." },
  { nr: "V05", namn: "P/B", kat: "Värdering", ikon: "📕",
    text: "Priset mot bokfört eget kapital — vad aktien kostar mot balansräkningens substans." },
  { nr: "V06", namn: "EV/EBITDA", kat: "Värdering", ikon: "⚖️",
    text: "Hela bolagets värde — skulder inkluderade — mot rörelseresultatet före avskrivningar: jämförbart på tvärs." },
  { nr: "V07", namn: "Bruttomarginal", kat: "Lönsamhet", ikon: "💰",
    text: "Vad som blir kvar av varje intäktskrona efter varukostnaden — affärens råa lönsamhet." },
  { nr: "V08", namn: "EBITDA-marginal", kat: "Lönsamhet", ikon: "📊",
    text: "Rörelsens vikt i en enda siffra — förmågan att omvandla intäkter till driftöverskott." },
  { nr: "V09", namn: "ROE", kat: "Lönsamhet", ikon: "🏅",
    text: "Avkastningen på eget kapital — hur effektivt bolaget får ägarnas pengar att arbeta." },
  { nr: "V10", namn: "Skuldsättningsgrad", kat: "Stabilitet", ikon: "🏗️",
    text: "Hur mycket av bolaget som är finansierat med lån — skuldens vikt mot eget kapital." },
  { nr: "V11", namn: "Likviditet", kat: "Stabilitet", ikon: "💧",
    text: "Förmågan att betala kortfristiga åtaganden — kassan räcker, räkningarna betalas." },
  { nr: "V12", namn: "Intäktsstabilitet", kat: "Stabilitet", ikon: "🧭",
    text: "Hur jämna intäkterna är över tid och konjunktur — förutsägbarhetens mått." },
  { nr: "V13", namn: "Patent & IP", kat: "Moat", ikon: "💡",
    text: "Skyddade innovationer och immateriella rättigheter — barriären som bromsar konkurrenterna." },
  { nr: "V14", namn: "Varumärke & Kundlojalitet", kat: "Moat", ikon: "🛡️",
    text: "Varumärkets styrka och kundernas benägenhet att stanna — grunden för prissättningsmakt." },
  { nr: "V15", namn: "Nätverkseffekter", kat: "Moat", ikon: "🕸️",
    text: "När produktens värde växer med varje ny användare — vallgraven som gräver sig själv." },
  { nr: "V16", namn: "Produktlanseringar", kat: "Katalysator", ikon: "🚀",
    text: "Kommande produktsläpp och pipelinen — tillväxtens framtida bränsle, bedömt inte gissat." },
  { nr: "V17", namn: "Avtal & Partnerskap", kat: "Katalysator", ikon: "🤝",
    text: "Bindande avtal och samarbeten — intäkter som redan är skrivna på papper." },
  { nr: "V18", namn: "Regulatoriska katalysatorer", kat: "Katalysator", ikon: "🏛️",
    text: "Regler och myndighetsbeslut som kan öppna — eller stänga — hela marknader." },
  { nr: "V19", namn: "Kassatäckning — nyemissionsrisk", kat: "Risk & kapitalstruktur", ikon: "🧯",
    text: "Hur länge kassan räcker — och risken att en nyemission späder ut dina andelar." },
  { nr: "V20", namn: "Återköp av egna aktier", kat: "Risk & kapitalstruktur", ikon: "🔁",
    text: "När bolaget köper tillbaka egna aktier — och vad det egentligen avslöjar om kapitaldisciplinen." },
];

/** Vad du lär dig — kunddirektivet 2026-09-18 (KURS-FAS2/README):
 * läsa/tolka faktiska årsredovisningar, praktisk innebörd, kritiskt tänkande. */
const LARANDE = [
  {
    ikon: "📖",
    rubrik: "Analysera årsredovisningar",
    text: "Läsa faktiska bokslut — vilken rad, vilken not, vad som är kontraster. Du följer siffrorna från framställda tabeller tillbaka till källan och räknar på riktiga bolag, inte skolboksexempel.",
  },
  {
    ikon: "🔍",
    rubrik: "Tolka indikatorerna",
    text: "Varje nyckeltal får sin praktiska innebörd: vad ett högt och lågt värde faktiskt betyder för affären, och hur AKM1:s poängtrösklar väger samman dem till en helhet.",
  },
  {
    ikon: "🧠",
    rubrik: "Kritiskt tänkande",
    text: "Fällor och misstolkningar — genomskåda kreativ redovisning, vinstens kvalitet och det som bara är en berättelse. Att veta när en siffra ljuger är analysens kärna.",
  },
] as const;

export default function Fas2Page() {
  return (
    <SeoPageShell
      breadcrumb={[{ name: "Hem", href: "/" }, { name: "Fas 2 — Fördjupningen" }]}
      wide
    >
      <StrukturData id="jsonld-webbsajt" data={websiteJsonLd()} />

      {/* ── HERO — marin panel: fördjupningen inom aktieanalys ──────────── */}
      <section className="marin-panel relative overflow-hidden rounded-3xl border-2 border-gold/60 p-7 shadow-2xl sm:p-12">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]">
          <span className="font-serif text-[150px] font-black tracking-tight">FAS 2</span>
        </div>
        <div className="pointer-events-none absolute inset-2 rounded-2xl border border-[#E8C766]/30" aria-hidden />
        <div className="relative max-w-3xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#E8C766]">
            Den snabba fundamentala vägen · Fas 2
          </p>
          <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#EDE6D6] sm:text-5xl">
            Fas 2 — Fördjupning inom aktieanalys
          </h1>
          <p className="mt-4 font-serif text-lg italic leading-relaxed text-[#E8C766] sm:text-xl">
            Från att förstå delarna — till att väga bolaget i handen.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[#EDE6D6]/85 sm:text-base">
            I Fas 1 lär du dig delarna: variabel för variabel, bok för bok. I
            Fas 2 fördjupas hantverket — du analyserar{" "}
            <strong className="text-[#EDE6D6]">de 20 fundamentala
            indikatorerna</strong> på riktiga årsredovisningar, lär dig tolka
            dem kritiskt och sammanväga dem till ett omdöme som är ditt eget.
            Allt fundamentalt — ingen teknisk analys; det dynamiska
            ekosystemet är{" "}
            <Link href="/fas3" className="underline hover:text-[#EDE6D6]">
              Fas 3
            </Link>
            .
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="#indikatorer"
              className="rounded-md bg-gold px-5 py-3 text-center text-sm font-bold text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
            >
              Se de 20 indikatorerna ↓
            </a>
            <Link
              href="#forbered"
              className="rounded-md border border-[#E8C766]/50 px-5 py-3 text-center text-sm font-semibold text-[#E8C766] transition-colors hover:bg-[#E8C766]/10"
            >
              Förbered dig till Fas 2
            </Link>
          </div>
        </div>
      </section>

      {/* ── VAD DU LÄR DIG — kunddirektivets tre pelare ──────────────────── */}
      <section id="larande" className="mt-10 scroll-mt-24">
        <h2 className="font-serif text-2xl font-bold">Vad du lär dig</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Fas 2 fördjupar det du mötte i Fas 1 — samma indikatorer, men nu på
          analysnivå: riktiga bokslut, riktiga bolag, riktiga fällor.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {LARANDE.map((l) => (
            <div key={l.rubrik} className="rounded-2xl border border-gold/30 bg-card p-5">
              <p className="font-serif text-lg font-bold text-foreground">
                <span className="mr-1.5">{l.ikon}</span> {l.rubrik}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {l.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="hjarlinje mt-10" />

      {/* ── DE 20 INDIKATORERNA — visuellt rutnät ────────────────────────── */}
      <section id="indikatorer" className="mt-10 scroll-mt-24">
        <h2 className="font-serif text-2xl font-bold">
          De 20 fundamentala indikatorerna
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          AKM1:s variabler V01–V20 — sju kategorier som tillsammans täcker
          ett bolag från tillväxt och värdering till moat, risk och
          kapitalstruktur. I Fas 2 går varje kort på djupet: praktisk
          innebörd, var i årsredovisningen talet bor, och hur det sammanvägs
          med de övriga nitton.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {INDIKATORER.map((ind) => (
            <div
              key={ind.nr}
              className="group flex flex-col rounded-2xl border border-gold/30 bg-card p-5 transition-colors hover:border-gold/60"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xl" aria-hidden>{ind.ikon}</span>
                <span className="rounded-full border border-gold/40 bg-gold/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold">
                  {ind.nr}
                </span>
              </div>
              <p className="mt-3 font-serif text-base font-bold leading-snug text-foreground">
                {ind.namn}
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-gold/80">
                {ind.kat}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {ind.text}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Varje indikator har ett eget kursunderlag — fem avsnitt från
          affärsförklaring till kritiskt tänkande och räkneexempel på riktiga
          bolag ur AK1A:s bolagsuniversum.
        </p>
      </section>

      <div className="hjarlinje mt-10" />

      {/* ── FÖRBEREDELSEN — CTA under byggnation ─────────────────────────── */}
      <section id="forbered" className="mt-10 scroll-mt-24">
        <div className="marin-panel rounded-3xl border-2 border-gold/60 p-7 text-center shadow-2xl sm:p-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#E8C766]">
            Fas 2 · Under byggnation
          </p>
          <h2 className="mt-3 font-serif text-2xl font-bold text-[#EDE6D6] sm:text-3xl">
            Förbered dig till Fas 2
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#EDE6D6]/85 sm:text-base">
            Fas 2 växer fram just nu — indikator för indikator, bokslut för
            bokslut. Under tiden byggs grunden bäst i Fas 1: hela
            grundbiblioteket med kurser och verktyg, kostnadsfritt och för
            alltid. Den som vill gå den snabba vägen kan redan nu ansöka.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/fas2-ansok"
              className="rounded-md bg-gold px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
            >
              Förbered dig till Fas 2 — ansök
            </Link>
            <Link
              href="/kurser"
              className="rounded-md border border-[#E8C766]/50 px-6 py-3 text-sm font-semibold text-[#E8C766] transition-colors hover:bg-[#E8C766]/10"
            >
              Bygg grunden i Fas 1 — kostnadsfritt
            </Link>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-[#E8C766]/80">
            Vi lovar inte färdiga datum — vi lovar riktningen.
          </p>
        </div>
      </section>

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        AK1A Research Lab bedriver pedagogisk utbildning i fundamental
        aktieanalys — inget här är investeringsråd, och aldrig tips om köp
        eller försäljning. Kurser och analyser bygger på öppna källor och
        redovisade antaganden. Se vår{" "}
        <Link href="/finansiell-policy" className="underline hover:text-foreground">
          finansiella policy
        </Link>
        .
      </p>
    </SeoPageShell>
  );
}
