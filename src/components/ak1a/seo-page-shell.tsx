import Link from "next/link";
import { TemaVaxlare } from "@/components/ak1a/tema-vaxlare";
import { Huvudmeny } from "@/components/ak1a/huvudmeny";
import { Mobilmeny } from "@/components/ak1a/mobilmeny";
import { NastaSteg } from "@/components/ak1a/nasta-steg";
import { Sidfooter } from "@/components/ak1a/sidfooter";
import { VarumarkesLogo } from "@/components/ak1a/varumarkes-logo";

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
            <Link
              href="/logga-in"
              className="rounded-md bg-gold px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
            >
              Logga in
            </Link>
            <TemaVaxlare />
          </div>
        </div>
      </header>
      <div className={`mx-auto ${wide ? "max-w-6xl" : "max-w-3xl"} px-4 sm:px-6 py-12`}>
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex flex-wrap items-center gap-3 pb-8 text-sm">
            {breadcrumb.map((b, i) => (
              <span key={b.name} className="flex items-center gap-3">
                {b.href ? (
                  <Link href={b.href} className="text-muted-foreground hover:text-foreground">
                    {b.name}
                  </Link>
                ) : (
                  <span className="text-foreground">{b.name}</span>
                )}
                {i < (breadcrumb?.length ?? 0) - 1 && <span className="text-muted-foreground">/</span>}
              </span>
            ))}
          </nav>
        )}
        <main>{children}</main>
        {/* Personlig mönsterigenkänning — nästa steg för just denna elev */}
        <div className="pt-10">
          <NastaSteg />
        </div>
      </div>
      <Sidfooter />
    </div>
  );
}
