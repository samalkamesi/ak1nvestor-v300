import Link from "next/link";
import { notFound } from "next/navigation";
import { lasSite, lasSida } from "@/lib/vaxthus/tenant-content";

// VÄXTHUSET 2.0 Fas 1 (r284) — hyresgästens renderade sida.
// Renderar innehållet FRÅN DISK (force-dynamic): agentens ändringar i
// innehall/site.json syns direkt utan ombygge. Sektionstyerna är avsiktligt
// få (rubrik/text/bild/knapp) — Fas 1:s kontrakt med TENANT-AGENTS.md.

export const dynamic = "force-dynamic";

export default async function HyresgastSida({
  params,
}: {
  params: Promise<{ slug: string; sida?: string[] }>;
}) {
  const { slug, sida } = await params;
  const site = lasSite(slug);
  if (!site) notFound();
  const aktiv = lasSida(slug, sida?.[0]);
  if (!aktiv) notFound();
  const stilar = {
    "--vx-primar": site.stilar?.primarFarg ?? "#2563eb",
    "--vx-bakgrund": site.stilar?.bakgrundsFarg ?? "#ffffff",
    "--vx-text": site.stilar?.textFarg ?? "#1f2937",
  } as React.CSSProperties;

  return (
    <div style={{ ...stilar, background: "var(--vx-bakgrund)", color: "var(--vx-text)" }}>
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-6 py-5">
          <span className="text-lg font-bold">{site.namn}</span>
          <nav className="flex flex-wrap gap-4 text-sm">
            {site.sidor.map((s) => (
              <Link
                key={s.slug}
                href={s.slug === (site.sidor[0]?.slug ?? "") ? `/bygg/${slug}` : `/bygg/${slug}/${s.slug}`}
                className="opacity-70 hover:opacity-100"
                style={s.slug === aktiv.slug ? { opacity: 1, fontWeight: 600 } : undefined}
              >
                {s.titel}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-14">
        {aktiv.sektioner.map((sek, i) => {
          if (sek.typ === "rubrik") {
            return (
              <h1 key={i} className="mt-4 text-4xl font-extrabold tracking-tight first:mt-0">
                {sek.rubrik}
              </h1>
            );
          }
          if (sek.typ === "text") {
            return (
              <p key={i} className="mt-5 text-lg leading-relaxed opacity-90">
                {sek.text}
              </p>
            );
          }
          if (sek.typ === "bild") {
            // eslint-disable-next-line @next/next/no-img-element
            return <img key={i} src={sek.bild ?? ""} alt={sek.rubrik ?? ""} className="mt-6 w-full rounded-xl" />;
          }
          return (
            <a
              key={i}
              href={sek.knappLank ?? "#"}
              className="mt-7 inline-block rounded-lg px-6 py-3 font-semibold text-white"
              style={{ background: "var(--vx-primar)" }}
            >
              {sek.knappText ?? "Läs mer"}
            </a>
          );
        })}
      </main>
      <footer className="border-t border-black/10 py-8 text-center text-xs opacity-60">
        {site.namn} · byggd i Växthuset med AI-agent
      </footer>
    </div>
  );
}
