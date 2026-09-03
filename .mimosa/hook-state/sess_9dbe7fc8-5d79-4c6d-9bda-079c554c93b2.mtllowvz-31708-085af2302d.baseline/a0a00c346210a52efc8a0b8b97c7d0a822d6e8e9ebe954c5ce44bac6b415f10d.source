import Link from "next/link";
import type { Metadata } from "next";
import { getCaseStudies } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/labb",
  title: "Case studies — 201 analyscase | AK1A Research Lab",
  description:
    "201 praktiska case studies: riktiga och illustrativa bolagscase med AKM1-poäng, avgörande variabler, utfall och lärdomar. Pedagogisk finansanalys genom exempel.",
  keywords: [
    "case studies aktieanalys",
    "aktie case",
    "AKM1 case",
    "lära sig aktieanalys exempel",
    "bolagsanalys case",
  ],
});

export default function LabbPage() {
  const cases = getCaseStudies();
  const byType = new Map<string, typeof cases>();
  for (const c of cases) {
    const list = byType.get(c.type) ?? [];
    list.push(c);
    byType.set(c.type, list);
  }

  return (
    <SeoPageShell breadcrumb={[{ name: "Labbet" }]} wide>
      <h1 className="font-serif text-4xl font-bold">Case studies</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        {cases.length} praktiska case — varje case visar hur AKM1:s variabler avgör
        utfallet, med tydlig lärdom. Riktiga bolag redovisas med källa; illustrativa
        exempel är märkta och bygger på autentiska mönster.
      </p>

      <div className="mt-10 space-y-10">
        {[...byType.entries()].map(([type, list]) => (
          <section key={type}>
            <h2 className="font-serif text-2xl font-bold border-b border-gold/30 pb-2">
              {type}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {list.length} case
              </span>
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/labb/${c.id}`}
                    className="block h-full rounded-lg border border-gold/20 bg-card p-4 hover:border-gold/60 transition-colors"
                  >
                    <span className="font-serif font-semibold">{c.title}</span>
                    <span className="block mt-1 text-xs text-muted-foreground">
                      {[c.sector, c.year].filter(Boolean).join(" · ")}
                      {c.akm1Score != null ? ` · AKM1 ${c.akm1Score}` : ""}
                      {c.isIllustrative ? " · Illustrativt" : ""}
                    </span>
                    {c.lesson && (
                      <span className="block mt-2 text-xs text-muted-foreground leading-relaxed">
                        {c.lesson.slice(0, 140)}
                        {c.lesson.length > 140 ? "…" : ""}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </SeoPageShell>
  );
}
