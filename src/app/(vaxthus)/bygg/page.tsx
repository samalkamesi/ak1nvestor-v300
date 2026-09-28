import Link from "next/link";
import { listaHyresgaster } from "@/lib/vaxthus/tenant-content";

// VÄXTHUSET 2.0 Fas 1 (r284) — portalen: hyresgästernas sidor.
// Fas 1 = stängd registrering (kungen = testhyresgäst); listan läses från disk
// vid varje anrop (force-dynamic) — agentens ändringar syns direkt.

export const dynamic = "force-dynamic";

export default function ByggPortal() {
  const hyresgaster = listaHyresgaster();
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-12 text-neutral-100 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Växthuset</h1>
        <p className="mt-3 max-w-xl text-neutral-400">
          Bygg din egen sida med en AI-agent — samma system som byggde den här plattformen.
          Berätta för din agent vad sidan ska innehålla; agenten bygger, du godkänner.
        </p>
        <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Hyresgästers sidor
        </h2>
        {hyresgaster.length === 0 ? (
          <p className="mt-4 rounded-lg border border-neutral-800 p-4 text-neutral-500">
            Inga hyresgäster ännu. (Fas 1: registreringen är stängd — testhyresgästen skapas av
            systemet.)
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {hyresgaster.map((h) => (
              <li key={h.slug}>
                <Link
                  href={`/bygg/${h.slug}`}
                  className="block rounded-lg border border-neutral-800 p-4 transition hover:border-neutral-500"
                >
                  <span className="font-semibold">{h.namn}</span>
                  {h.tagline ? <span className="text-neutral-400"> — {h.tagline}</span> : null}
                  <span className="mt-1 block text-xs text-neutral-500">/bygg/{h.slug}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-12 text-xs text-neutral-600">
          Växthuset 2.0 · Fas 1 (preview) — självbetjäning öppnar senare.
        </p>
      </div>
    </main>
  );
}
