import Link from "next/link";

/**
 * Enkelt skal för crawlbara SEO-sidor (server components).
 * Länkar tillbaka till SPA:n och håller DNA-design: paper, serif, guld.
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
      <div className={`mx-auto ${wide ? "max-w-6xl" : "max-w-3xl"} px-4 sm:px-6 py-12`}>
        <nav className="flex flex-1 flex-wrap items-center gap-3 text-sm">
          <Link
            href="/"
            className="font-serif text-lg font-bold tracking-tight text-foreground hover:opacity-80"
          >
            AK1<span className="text-gold">A</span> Research Lab
          </Link>
          <span className="text-muted-foreground">/</span>
          {breadcrumb?.map((b, i) => (
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
          <div className="ml-auto flex items-center gap-3 text-sm">
            <Link href="/kurser" className="text-muted-foreground hover:text-foreground">Kurser</Link>
            <Link href="/blogg" className="text-muted-foreground hover:text-foreground">Blogg</Link>
            <Link href="/logga-in" className="rounded-md bg-gold px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90">Logga in</Link>
          </div>
        <div className="mt-8">{children}</div>
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
