import { notFound } from "next/navigation";
import Link from "next/link";
import { lasSite } from "@/lib/vaxthus/tenant-content";
import AndringarPanel from "./andringar-panel";

// VÄXTHUSET Fas 1 (r287) — hyresgästens ändringslogg: varje agentändring
// sparas som en version (git); här ser hyresgästen exakt vad som gjorts —
// transparensen är produkt, inte tillbehör.

export const dynamic = "force-dynamic";

export default async function AndringarSida({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = lasSite(slug);
  if (!site) notFound();
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-neutral-100 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-bold">{site.namn} — ändringslogg</h1>
          <div className="flex gap-2">
            <Link
              href={`/bygg/${slug}/chatt`}
              className="rounded-lg border border-neutral-700 px-4 py-2 text-sm hover:border-neutral-400"
            >
              ← Byggchatten
            </Link>
            <Link
              href={`/bygg/${slug}`}
              className="rounded-lg border border-neutral-700 px-4 py-2 text-sm hover:border-neutral-400"
              target="_blank"
            >
              Förhandsvisning ↗
            </Link>
          </div>
        </header>
        <AndringarPanel slug={slug} />
      </div>
    </main>
  );
}
