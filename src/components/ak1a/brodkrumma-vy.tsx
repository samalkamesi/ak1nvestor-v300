import Link from "next/link";
import type { OrdlistaNyckel } from "@/lib/ordlista";
import type { SprakParametrar } from "@/lib/sprak";
import type { SidfooterEtikett } from "@/components/ak1a/sidfooter-vy";

/**
 * BRÖDKRUMMA-VY (o105, spår 7) — hook-fri renderare av navigationsraden.
 *
 * Samma dualbindningsmönster som sidfooter-vy.tsx: brodkrumma.tsx (klient,
 * useSprak) för sv-rötter; brodkrumma-server.tsx (skapaT/oversattText från
 * spegelns lang) för /en|/ar — smulorna SSR:as rätt och hydratiseras aldrig.
 *
 * tText = exakt matchning mot ordlistans svenska värden ("Kurser",
 * "Läroplanen" …) — träff ⇒ valt språk, annars originalet (svenska).
 */

export function BrodkrummaVy({
  breadcrumb,
  t,
  tText,
}: {
  breadcrumb?: Array<{ name: string; href?: string }>;
  t: SidfooterEtikett;
  tText: (text: string) => string;
}) {
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
