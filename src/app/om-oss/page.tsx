import type { Metadata } from "next";
import Link from "next/link";
import { getCourseList } from "@/lib/content";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const metadata: Metadata = {
  title: "Om oss — AK1A Research Lab | Ak1 Apex Nexus",
  description:
    "AK1A Research Lab är en institutionell analysmetodik byggd för privatpersoner. Bakom plattformen står Ak1 Apex Nexus och grundaren Sam Alkamesi.",
  // Ömsesidig hreflang med /en|ar/om-oss (VÅG 63 O3 #2) — speglarna
  // deklarerar klustret sedan våg 51; originalet måste göra detsamma.
  alternates: {
    canonical: "https://lab.ak1nvestor.com/om-oss",
    languages: {
      "sv-SE": "https://lab.ak1nvestor.com/om-oss",
      en: "https://lab.ak1nvestor.com/en/om-oss",
      ar: "https://lab.ak1nvestor.com/ar/om-oss",
      "x-default": "https://lab.ak1nvestor.com/om-oss",
    },
  },
};

export default function OmOssPage() {
  // Levande tal — räknas från innehållslaget vid build
  const kurserLista = getCourseList();
  const antalKurser = kurserLista.length; // ur public/deep-courses.json (dynamiskt)
  const antalBokmaster = kurserLista.filter((c) => c.category === "BOKMASTER").length; // 78 böcker
  return (
    <SeoPageShell wide breadcrumb={[{ name: "Om oss" }]}>
      <h1 className="font-serif text-4xl font-bold">
        Om AK1<span className="text-gold">A</span> Research Lab
      </h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        AK1A Research Lab är en utbildningsplattform med en enkel övertygelse:
        institutionell analysmetodik är en rättighet — inte en tjänst reserverad
        för bankers och fondförvaltares analytiker.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gold/30 bg-card p-5">
          <div className="text-2xl">📊</div>
          <h2 className="mt-2 font-serif text-lg font-bold">AKM1</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            20 fundamentalvariabler (V01–V20) i 7 kategorier: tillväxt, värdering,
            lönsamhet, stabilitet, moat, katalysator och risk. 0–5 poäng per
            variabel, max 100.
          </p>
        </div>
        <div className="rounded-2xl border border-gold/30 bg-card p-5">
          <div className="text-2xl">🌊</div>
          <h2 className="mt-2 font-serif text-lg font-bold">AK1TS</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Teknisk våganalys: 5 teorier (Elliott, Fibonacci, GANN, Lucas, volym) ×
            5 tidshorisonter × 4 dimensioner (våg, pris, tid, brytpunkt) = 100
            datapunkter per innehav.
          </p>
        </div>
        <div className="rounded-2xl border border-gold/30 bg-card p-5">
          <div className="text-2xl">🎓</div>
          <h2 className="mt-2 font-serif text-lg font-bold">Utbildning först</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {antalKurser} kurser, {antalBokmaster} kompletta BOKMASTER-böcker, kalkylator, portföljsystem,
            AI-mentor och spaced repetition — allt sammanvävt i ett ekosystem.
          </p>
        </div>
      </div>

      <div className="mt-10 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-serif text-2xl font-bold">Grundaren</h2>
          <p className="mt-2 text-muted-foreground">
            Bakom AK1nvestor.com och AK1A Research Lab står grundaren Sam Alkamesi
            och bolaget Ak1 Apex Nexus. Visionen är rakt fram: bygga Sveriges —
            kanske världens — mest genomgripande utbildning i oberoende
            aktieanalys, och göra den tillgänglig för alla. Fas 1 är alltid
            gratis, alltid öppet.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold">Principerna</h2>
          <ul className="mt-2 space-y-2 text-muted-foreground">
            <li>
              <strong className="text-foreground">Pedagogisk analys — inte investeringsråd.</strong>{" "}
              Allt på plattformen är utbildning. Vi ger inga tips om vad du ska köpa.
            </li>
            <li>
              <strong className="text-foreground">Djupare än en blogg. Tydligare än en bank. Snabbare än en utbildning.</strong>{" "}
              Institutionell metodik, förklarad för privatpersoner — utan att dölja
              teoriernas begränsningar.
            </li>
            <li>
              <strong className="text-foreground">Håll know-how — redovisa generöst.</strong>{" "}
              Kunskapen om metodiken delas öppet; kurser som bygger på en komplett
              bok citerar boken öppet (BOKMASTER).
            </li>
            <li>
              <strong className="text-foreground">Reproducerbarhet.</strong>{" "}
              Våra analyser följer tydliga regler och redovisade datakällor — så att
              du kan göra om dem själv.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold">Utbildningsvägen</h2>
          <p className="mt-2 text-muted-foreground">
            Vägen till självständighet följer{" "}
            <Link href="/laroplan" className="font-semibold text-gold underline">
              läroplanen
            </Link>{" "}
            i fem nivåer: grunderna (V01–V20), fördjupning, Bokmaster ({antalBokmaster} böcker
            kapitel för kapitel), praktik på riktiga bolag och din egen portfölj —
            till slutmålet: oberoende aktieanalytiker. På vägen förtjänar du XP,
            stjärnor och till sist{" "}
            <Link href="/certifikat" className="font-semibold text-gold underline">
              certifikat
            </Link>
            . Medlemskapet är gratis i Fas 1, för alltid.
          </p>
        </section>

        <section className="rounded-xl border border-gold/30 bg-card p-5">
          <h2 className="font-serif text-xl font-bold">Kontakt</h2>
          <p className="mt-2 text-muted-foreground">
            Ak1 Apex Nexus · info@ak1nvestor.com
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Link href="/medlemskap" className="inline-flex min-h-[44px] items-center rounded-lg bg-gold px-4 font-bold text-primary-foreground">Medlemskap</Link>
            <Link href="/kurser" className="inline-flex min-h-[44px] items-center rounded-lg border border-gold/40 px-4 font-bold text-gold">Alla kurser</Link>
            <Link href="/bibliotek" className="inline-flex min-h-[44px] items-center rounded-lg border border-gold/40 px-4 font-bold text-gold">Biblioteket</Link>
          </div>
        </section>
      </div>
    </SeoPageShell>
  );
}
