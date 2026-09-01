import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Fas2Ansok } from "@/components/ak1a/fas2-ansok";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/fas2-ansok",
  title: "Ansök om Fas 2 — utbildning med grundaren | AK1A",
  description:
    "Ansök om Fas 2: personlig utbildning med grundaren av AK1A Research Lab. Ansökan är kostnadsfri och icke-bindande — 90 dagars nöjdhetsgaranti. Fas 1 förblir gratis, för alltid.",
  keywords: [
    "Fas 2 ansökan",
    "utbildning aktieanalys",
    "fundamentalanalys utbildning Sverige",
    "coaching aktieanalys",
    "AKM1 medlemskap",
    "representant utbildning",
  ],
});

export default function Fas2AnsokPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Hem", href: "/" }, { name: "Fas 2-ansökan" }]}>
      <article className="space-y-8">
        <header className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
            Fas 2 · Utbildning med grundaren
          </p>
          <h1 className="font-serif text-4xl font-bold tracking-tight">
            Ansök om Fas 2
          </h1>
          <p className="max-w-2xl leading-relaxed text-muted-foreground">
            Fas 1 är hela biblioteket — kostnadsfritt, för alltid. Fas 2 är något
            annat: <strong>en människa vid din sida</strong>. Personlig utbildning
            med grundaren, coaching i grupp och en väg mot att representera
            AK1nvestor. Vi tar emot ett begränsat antal elever i taget, därför
            krävs ansökan.
          </p>
        </header>

        <Fas2Ansok />

        <section className="rounded-xl border border-dashed border-gold/40 bg-paper p-6">
          <h2 className="font-serif text-xl font-bold">Vad som händer efter ansökan</h2>
          <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>
              <strong className="text-foreground">1.</strong> Vi läser din ansökan
              personligt — tillsammans med din elevstatus i Fas 1.
            </li>
            <li>
              <strong className="text-foreground">2.</strong> Du får en inbjudan till
              ett kostnadsfritt möte med grundaren. Inget säljtryck — ett samtal.
            </li>
            <li>
              <strong className="text-foreground">3.</strong> Bestämmer du att gå
              vidare börjar utbildningen, och du betalar först när du är nöjd
              (90 dagars nöjdhetsgaranti).
            </li>
          </ol>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Osäker? {" "}
            <Link href="/medlemskap" className="underline hover:text-foreground">
              Jämför Fas 1 och Fas 2 i lugn och ro
            </Link>
            . Fas 1 gömmer ingenting — allt vi kan finns gratis, och det förblir så.
          </p>
        </section>
      </article>
    </SeoPageShell>
  );
}
