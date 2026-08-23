import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/medlemskap",
  title: "Medlemskap — Free, Premium & Pro | AK1A Research Lab",
  description:
    "Välj din nivå: Free (analyser och grundkurser), Premium 199 kr/mån (alla 225 kurser, labbet, bokningar) eller Pro 999 kr/mån (AI-analyser, metodik-licens).",
  keywords: [
    "medlemskap aktieanalys",
    "premium aktieutbildning",
    "AKM1 medlemskap",
    "aktieanalys prenumeration",
    "svensk aktieutbildning pris",
  ],
});

const tiers = [
  {
    name: "Fas 1 — Free",
    price: "0 kr",
    period: "alltid",
    tagline: "Börja här. Upptäck metoden.",
    cta: "Skapa gratis konto",
    ctaHref: "/#portal",
    features: [
      "Alla aktieanalyser (läsläge)",
      "Grundkurser i AKM1",
      "Bokmärken & fortsätt-där-du-slutade",
      "Nyhetsbrev med marknadskommentar",
      "Begränsad sökning (5/dag)",
    ],
  },
  {
    name: "Fas 2 — Premium",
    price: "199 kr/mån",
    period: "eller 1 990 kr/år (16% rabatt)",
    tagline: "Lär dig metoden — komplett.",
    cta: "Bli Premium-medlem",
    ctaHref: "/#portal",
    featured: true,
    features: [
      "Allt i Free",
      "Alla 225 kurser + 201 case studies",
      "Labbet: interaktiva verktyg",
      "1 bokning/månad (15 min genomgång)",
      "Anteckningar per kurs + PDF-analyser",
      "AI-tutor (20 frågor/dag)",
      "Watchlist (5 aktier) + uppdateringsnotiser",
      "Premium-nyhetsbrev varje vecka",
    ],
  },
  {
    name: "Fas 3 — Pro",
    price: "999 kr/mån",
    period: "eller 9 990 kr/år",
    tagline: "Arbeta som en analytiker.",
    cta: "Ansök om Pro",
    ctaHref: "/#portal",
    features: [
      "Allt i Premium",
      "AI-analyser: våg-detektion + konfluens",
      "Metodik-licens (AKM1-ramverket)",
      "Obegränsad AI-tutor & watchlist",
      "4 bokningar/månad (30 min)",
      "API-åtkomst (rate-limited)",
      "Årligt metodik-audit-certifikat",
      "Pro-community + kvartalscall",
    ],
  },
];

export default function MedlemskapPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Medlemskap" }]} wide>
      <h1 className="font-serif text-4xl font-bold">Medlemskap</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
        Institutionell metodik, pedagogiskt förklarad — i din takt. Alla nivåer
        inkluderar våra publicerade analyser och 30-dagars pengarna-tillbaka-garanti
        på betalda nivåer. Avsluta när som helst.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`flex flex-col rounded-xl border p-6 ${
              t.featured
                ? "border-gold bg-card shadow-lg"
                : "border-gold/20 bg-card"
            }`}
          >
            {t.featured && (
              <span className="mb-2 inline-block w-fit rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                Mest valda
              </span>
            )}
            <h2 className="font-serif text-xl font-bold">{t.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
            <p className="mt-4 font-serif text-3xl font-bold text-gold">{t.price}</p>
            <p className="text-xs text-muted-foreground">{t.period}</p>
            <ul className="mt-5 flex-1 space-y-2">
              {t.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm">
                  <span className="text-gold">✓</span>
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href={t.ctaHref}
              className={`mt-6 rounded-md px-4 py-2 text-center text-sm font-semibold ${
                t.featured
                  ? "bg-gold text-primary-foreground hover:opacity-90"
                  : "border border-gold/50 hover:bg-gold/10"
              }`}
            >
              {t.cta}
            </Link>
          </div>
        ))}
      </div>

      <section className="mt-12 rounded-lg border border-gold/30 bg-card p-6">
        <h2 className="font-serif text-2xl font-bold">Trygghet & transparens</h2>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <li>✓ 30-dagars pengarna-tillbaka-garanti (Premium & Pro)</li>
          <li>✓ Kvartalsvis transparensrapport: rätt/fel analysresultat</li>
          <li>✓ Ingen bindningstid — avsluta när du vill</li>
          <li>✓ GDPR: din data är din, export på begäran</li>
          <li>✓ Företagslicens: Pro Team 5 platser — kontakta oss</li>
          <li>✓ Betalning via kort (Stripe) — kvitto automatiskt</li>
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          Detta är pedagogisk finansanalys, inte investeringsråd. Vi ger dig metoden —
          besluten är alltid dina egna.
        </p>
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        Osäker på var du ska börja? Läs{" "}
        <Link href="/blogg/komplett-guide-svensk-aktieanalys-2026" className="underline hover:text-foreground">
          guiden till svensk aktieanalys
        </Link>{" "}
        eller utforska{" "}
        <Link href="/kurser" className="underline hover:text-foreground">
          kurserna gratis
        </Link>
        .
      </p>
    </SeoPageShell>
  );
}
