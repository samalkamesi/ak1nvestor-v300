"use client";

import Link from "next/link";
import { useSprak } from "@/components/ak1a/sprak-leverantor";

/**
 * BRÖDSMULOR — klientversion av seo-page-shell:s navigationsrad.
 *
 * Varje brödsmulenamn som skickas från page.tsx passeras genom
 * tText() = exakt matchning mot ordlistans svenska värden ("Kurser",
 * "Läroplanen", "Biblioteket" …). Träff ⇒ valt språk; ingen träff ⇒
 * originalet (svenska). Därmed byter navigationens ord på 700+ SSG-sidor
 * utan att röra sidfilerna — sidunika rubriker är fas 2 (SPRAK-PLAN.md).
 *
 * Separatorn speglas logiskt (⁄ förblir neutral), och i RTL läser
 * läsaren raden höger-vänster via document.dir — inget extra.
 */
export function Brodkrumma({
  breadcrumb,
}: {
  breadcrumb?: Array<{ name: string; href?: string }>;
}) {
  const { t, tText } = useSprak();

  if (!breadcrumb || breadcrumb.length === 0) return null;

  return (
    <nav aria-label={t("ui.brodsmulor")} className="flex flex-wrap items-center gap-3 pb-8 text-sm">
      {breadcrumb.map((b, i) => (
        <span key={b.name} className="flex items-center gap-3">
          {b.href ? (
            <Link
              href={b.href}
              prefetch={false}
              // prefetch={false} (o17/o41/o50-precedensen): smulan är synlig
              // i viewport på varje SeoPageShell-sida ⇒ Next 16 prefetchar
              // föräldrarutten i flera omgångar (partial + full flight) i
              // varje sidvisnings LCP-fönster — på /blogg/[slug] = 20,2 KiB
              // för "Blogg"-smulan (o52 §2). Listrutten är force-static/ISR
              // (klick ≈ 100–300 ms), hover-prefetch lever kvar (Next 16).
              className="text-muted-foreground hover:text-foreground max-md:min-h-[52px]"
            >
              {tText(b.name)}
            </Link>
          ) : (
            <span className="text-foreground">{tText(b.name)}</span>
          )}
          {i < (breadcrumb?.length ?? 0) - 1 && <span className="text-muted-foreground">/</span>}
        </span>
      ))}
    </nav>
  );
}
