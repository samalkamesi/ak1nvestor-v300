import { TemaVaxlare } from "@/components/ak1a/tema-vaxlare";
import { Huvudmeny } from "@/components/ak1a/huvudmeny";
import { Mobilmeny } from "@/components/ak1a/mobilmeny";
import { NastaSteg } from "@/components/ak1a/nasta-steg";
import { Sidfooter } from "@/components/ak1a/sidfooter";
import { VarumarkesLogo } from "@/components/ak1a/varumarkes-logo";
import { InloggadKnapp } from "@/components/ak1a/inloggad-knapp";
import { SprakVaxlare } from "@/components/ak1a/sprak-vaxlare";
import { Brodkrumma } from "@/components/ak1a/brodkrumma";
import { Toppvaxel } from "@/components/ak1a/toppvaxel";

/**
 * Enkelt skal för crawlbara SEO-sidor (server components).
 * Sticky header med HUVUDMENY (megamenu) + mobil-drawer + ⌘K.
 * NastaSteg = personlig mönsterigenkänning, Sidfooter = hel sitemap.
 */
export function SeoPageShell({
  breadcrumb,
  children,
  wide = false,
}: {
  breadcrumb?: Array<{ name: string; href?: string }>;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="paper-texture min-h-screen">
      <header className="sticky top-0 z-30 w-full border-b border-gold/20 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          {/* Skulptur-emblemet + ordmärke — kundens varumärkesstandard på
              samtliga SEO-sidor (ersatte den gamla textlänken 2026-09-03). */}
          <VarumarkesLogo href="/" storlek="sm" prioritet klass="ml-1" />
          <div className="hidden lg:flex">
            <Huvudmeny />
          </div>
          <Mobilmeny />
          <div className="ml-auto flex items-center gap-2 text-sm">
            {/* VÅG 61: världsväxeln Privatperson | Företag — B2B-BESLUT §3.1.
                Diskret pill i utility-raden; under sm bor växeln i mobil-
                drawerns egen rad istället (mobilmeny.tsx). */}
            <Toppvaxel klass="hidden sm:inline-flex" />
            {/* Inloggningsstatus — hälsning + utloggning när medlem, guld-CTA annars */}
            <InloggadKnapp />
            <SprakVaxlare />
            <TemaVaxlare />
          </div>
        </div>
      </header>
      <div className={`mx-auto ${wide ? "max-w-6xl" : "max-w-3xl"} px-4 sm:px-6 py-12`}>
        {/* Brödsmulor — klientkomponent: orden översätts via ordlistan (fas 1) */}
        <Brodkrumma breadcrumb={breadcrumb} />
        <main>{children}</main>
        {/* Personlig mönsterigenkänning — nästa steg för just denna elev.
            cv-nasta-steg (o78): ligger under innehållet på alla shell-sidor —
            content-visibility hoppar rendering tills den närmar sig vecket. */}
        <div className="pt-10 cv-nasta-steg">
          <NastaSteg />
        </div>
      </div>
      <Sidfooter />
    </div>
  );
}
