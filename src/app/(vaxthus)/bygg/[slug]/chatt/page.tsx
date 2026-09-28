import { notFound } from "next/navigation";
import Link from "next/link";
import { lasSite } from "@/lib/vaxthus/tenant-content";
import ChattPanel from "./chatt-panel";

// VÄXTHUSET Fas 1 (r285) — hyresgästens bygg-chatt: prata med agenten,
// agenten redigerar innehållet, förhandsvisningen uppdateras automatiskt.

export const dynamic = "force-dynamic";

export default async function ChattSida({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = lasSite(slug);
  if (!site) notFound();
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-neutral-100 sm:px-8">
      <div className="mx-auto flex h-[85vh] max-w-3xl flex-col">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold">{site.namn} — byggchatt</h1>
            <p className="text-xs text-neutral-500">
              Berätta för agenten vad du vill ändra — den bygger och svarar här.
            </p>
          </div>
          <Link
            href={`/bygg/${slug}`}
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm hover:border-neutral-400"
            target="_blank"
          >
            Förhandsvisning ↗
          </Link>
        </header>
        <ChattPanel slug={slug} />
      </div>
    </main>
  );
}
