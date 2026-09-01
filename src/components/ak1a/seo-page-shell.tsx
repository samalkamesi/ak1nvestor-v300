import Link from "next/link";
import { TemaVaxlare } from "@/components/ak1a/tema-vaxlare";
import { Huvudmeny } from "@/components/ak1a/huvudmeny";

/**
 * Enkelt skal för crawlbara SEO-sidor (server components).
 * Sticky header med HUVUDMENY (megamenu) — samma DNA: paper, serif, guld.
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
          <Link
            href="/"
            className="font-serif text-base font-bold tracking-tight text-foreground hover:opacity-80"
          >
            AK1<span className="text-gold">A</span> Research Lab
          </Link>
          <Huvudmeny />
          <div className="ml-auto flex items-center gap-2 text-sm">
            <Link
              href="/topplista"
              className="rounded-md px-1.5 py-1 text-sm text-muted-foreground hover:text-foreground"
              title="Topplistan"
              aria-label="Topplistan"
            >
              🏆
            </Link>
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
        <footer className="mt-16 border-t border-gold/30 pt-6 text-xs text-muted-foreground">
          <p>
            AK1A Research Lab — pedagogisk finansanalys, inte investeringsråd.{" "}
            <Link href="/privacy-policy" className="underline hover:text-foreground">
              Integritetspolicy
            </Link>{" "}
            ·{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Villkor
            </Link>{" "}
            ·{" "}
            <Link href="/blogg" className="underline hover:text-foreground">
              Blogg
            </Link>{" "}
            ·{" "}
            <Link href="/finansiell-policy" className="underline hover:text-foreground">
              Finansiell policy
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
