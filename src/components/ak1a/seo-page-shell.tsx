import { TemaVaxlare } from "@/components/ak1a/tema-vaxlare";
import { Huvudmeny } from "@/components/ak1a/huvudmeny";
import { Mobilmeny } from "@/components/ak1a/mobilmeny";
import { NastaSteg } from "@/components/ak1a/nasta-steg";
import { Sidfooter } from "@/components/ak1a/sidfooter";
import { SidfooterServer } from "@/components/ak1a/sidfooter-server";
import { VarumarkesLogo } from "@/components/ak1a/varumarkes-logo";
import { InloggadKnapp } from "@/components/ak1a/inloggad-knapp";
import { SprakVaxlare } from "@/components/ak1a/sprak-vaxlare";
import { Brodkrumma } from "@/components/ak1a/brodkrumma";
import { BrodkrummaServer } from "@/components/ak1a/brodkrumma-server";
import { Toppvaxel } from "@/components/ak1a/toppvaxel";
import type { SprakId } from "@/lib/sprak";

/**
 * Enkelt skal för crawlbara SEO-sidor (server components).
 * Sticky header med HUVUDMENY (megamenu) + mobil-drawer + ⌘K.
 * NastaSteg = personlig mönsterigenkänning, Sidfooter = hel sitemap.
 *
 * o105 (spår 7, o101 §4 Kur A+B): lang="en|ar" från spegelbyggaren binder
 * brodkrumma + footer SERVER-side (skapaT(lang) — SSR rätt språk, ingen
 * hydratisering av footerns 81 element; speglarnas TBT-börda sv 316 →
 * en 994/ar 616 ms). Utan lang (eller lang="sv") används klientbindningarna
 * med oförändrat MGTM-beteende — sv-sidornas DOM och JS är identiska.
 */
export function SeoPageShell({
  breadcrumb,
  children,
  lang,
  wide = false,
}: {
  breadcrumb?: Array<{ name: string; href?: string }>;
  children: React.ReactNode;
  lang?: SprakId;
  wide?: boolean;
}) {
  const spegel = lang === "en" || lang === "ar";
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
        {/* Brödsmulor — speglar: serverbindning (o105); sv: klient-MGTM.
            Orden översätts via ordlistan (fas 1) i båda fallen. */}
        {spegel ? (
          <BrodkrummaServer breadcrumb={breadcrumb} lang={lang} />
        ) : (
          <Brodkrumma breadcrumb={breadcrumb} />
        )}
        <main>{children}</main>
        {/* Personlig mönsterigenkänning — nästa steg för just denna elev.
            cv-nasta-steg (o78): ligger under innehållet på alla shell-sidor —
            content-visibility hoppar rendering tills den närmar sig vecket. */}
        <div className="pt-10 cv-nasta-steg">
          <NastaSteg />
        </div>
      </div>
      {spegel ? <SidfooterServer lang={lang} /> : <Sidfooter />}
    </div>
  );
}
