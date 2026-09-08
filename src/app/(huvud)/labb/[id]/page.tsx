import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCaseStudies, getCaseStudy } from "@/lib/content";
import { caseMetadata, breadcrumbJsonLd, JsonLd } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getCaseStudies().map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const c = getCaseStudy(id);
  if (!c) return {};
  return caseMetadata(c);
}

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getCaseStudy(id);
  if (!c) notFound();

  const related = getCaseStudies()
    .filter((r) => r.type === c.type && r.id !== c.id)
    .slice(0, 6);

  return (
    <SeoPageShell breadcrumb={[{ name: "Labbet", href: "/labb" }, { name: c.company }]}>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Labbet", path: "/labb" },
          { name: c.title, path: `/labb/${c.id}` },
        ])}
      />

      <header className="border-b border-gold/30 pb-6">
        <p className="text-xs uppercase tracking-widest text-gold">
          Case study · {c.type}
          {c.isIllustrative ? " · Illustrativt exempel" : ""}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold">{c.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {[c.company, c.ticker, c.sector, c.year].filter(Boolean).join(" · ")}
        </p>
      </header>

      {c.description && (
        <section className="mt-8">
          <h2 className="font-serif text-xl font-bold">Bakgrund</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed whitespace-pre-line">
            {c.description}
          </p>
        </section>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {c.akm1Score != null && (
          <div className="rounded-lg border border-gold/20 bg-card p-4">
            <h2 className="font-serif font-semibold">AKM1-poäng</h2>
            <p className="mt-2 font-serif text-3xl font-bold text-gold">{c.akm1Score}</p>
          </div>
        )}
        {c.decisiveVars && (
          <div className="rounded-lg border border-gold/20 bg-card p-4">
            <h2 className="font-serif font-semibold">Avgörande variabler</h2>
            <p className="mt-2 text-sm text-muted-foreground">{c.decisiveVars}</p>
          </div>
        )}
        {c.outcome && (
          <div className="rounded-lg border border-gold/20 bg-card p-4">
            <h2 className="font-serif font-semibold">Utfall</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.outcome}</p>
          </div>
        )}
        {c.lesson && (
          <div className="rounded-lg border border-gold/40 bg-card p-4">
            <h2 className="font-serif font-semibold text-gold">Lärdom</h2>
            <p className="mt-2 text-sm leading-relaxed">{c.lesson}</p>
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-xl font-bold">Fler {c.type}-case</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/labb/${r.id}`}
                  className="inline-block rounded-full border border-gold/30 px-3 py-1 text-xs hover:bg-gold/10"
                >
                  {r.company}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </SeoPageShell>
  );
}
