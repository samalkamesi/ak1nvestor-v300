import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata, JsonLd, websiteJsonLd } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { NyhetsCentral } from "@/components/ak1a/nyhets-central";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/nyheter",
  title: "Nyhetscentralen — senaste nytt intelligent rangerat | AK1A",
  description:
    "Nyhetscentralen är ditt personliga nyhetsrum: nyheter om dina aktier, din bevakningslista, ämneskanaler och egna RSS-flöden — samlade, poängsatta efter påverkan och försedda med AK1A-noteringar som kopplar varje rubrik till metodens variabler. Pedagogiskt underlag, aldrig investeringsråd.",
  keywords: [
    "aktienyheter",
    "nyhetscentral",
    "nyhetsrum",
    "RSS",
    "bevakningslista",
    "aktieanalys",
    "svenska aktier",
    "värdeinvestering",
    "AK1A",
  ],
});

/** Vidare i ekosystemet — samma kortmönster som /konfluens. */
const LANKAR = [
  {
    href: "/vagfundament",
    rubrik: "Vågfundamentet",
    text: "Se varje AKM1-variabel som en tidsserie med egen riktning — nyheter förändrar vågor.",
  },
  {
    href: "/konfluens",
    rubrik: "Konfluensradarn",
    text: "Där värde möter vågor — fem oberoende källor måste tala samman.",
  },
  {
    href: "/superanalys",
    rubrik: "Superanalysen",
    text: "Guidad analys i 24 steg — AKM1 + AK1TS förenade i en resa.",
  },
] as const;

/**
 * NYHETSCENTRALEN — kundens nyhetsrum. Server component med statisk
 * metadata + SEO-intro; själva centralen är en klientkomponent som
 * fetchar /api/nyheter med medlemmens kanaler.
 */
export default function NyheterPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Hem", href: "/" }, { name: "Nyhetscentralen" }]} wide>
      <JsonLd data={websiteJsonLd()} />
      <h1 className="font-serif text-4xl font-bold">Nyhetscentralen</h1>
      <p className="mt-2 font-serif text-lg italic text-gold">— senaste nytt, intelligent rangerat</p>

      {/* Statisk SEO-intro — centralen själv hämtar data i klienten */}
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/90 sm:text-base">
        <p>
          Nyhetscentralen samlar hela din värld i ett flöde: nyheter om aktierna i din portfölj,
          om din bevakningslista, från utvalda ämneskanaler och från egna RSS-flöden. Varje nyhet
          rangeras efter påverkan — inte efter larmnivå — och förses med en AK1A-notering som
          kopplar rubriken till metodens variabler. Du får inte mer nyheter; du får rätt nyheter,
          i rätt ordning, med rätt frågor.
        </p>
        <p>
          Centralen utvidgas efter hand: lägg till bevaknings-tickers, välj ämneskanaler eller
          anslut dina egna RSS-källor i kanalhanteraren — flödet anpassar sig direkt. Allt sparas
          lokalt hos dig. Nyheter är information och underlag för ditt eget tänkande — aldrig
          investeringsråd, och alltid något att läsa tillsammans med analysverktygen.
        </p>
      </div>

      <div className="hjarlinje mt-8" />

      {/* Själva centralen — kanaler, filter och det rangerade flödet */}
      <div className="mt-8">
        <NyhetsCentral />
      </div>

      {/* Vidare i ekosystemet */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold">Fortsätt i ekosystemet</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {LANKAR.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-xl border border-gold/30 bg-paper p-4 transition-colors hover:border-gold/60"
            >
              <p className="font-serif text-base font-bold text-gold">{l.rubrik} →</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{l.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        Underlag: offentliga nyhetskällor via nyhetsmotorn på servern. All utdata är pedagogiskt
        studieunderlag — information, inte investeringsråd. Någon köp- eller säljsignal ges aldrig.
      </p>
    </SeoPageShell>
  );
}
