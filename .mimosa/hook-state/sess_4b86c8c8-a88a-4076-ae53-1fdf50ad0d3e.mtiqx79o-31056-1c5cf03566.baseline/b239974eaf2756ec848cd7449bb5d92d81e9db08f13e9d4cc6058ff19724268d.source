import Link from "next/link";
import type { Metadata } from "next";
import { getAnalyses } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/analyser",
  title: "Svensk aktieanalys — institutionell metodik | AK1A",
  description:
    "Djupgående svensk aktieanalys med AKM1:s 20 variabler, vågmatris, scenarier och prisnivåer. Varje analys: 99 sidor, 20 variabler, redovisad metodik.",
  keywords: [
    "svensk aktieanalys",
    "aktieanalyser svenska aktier",
    "institutionell aktieanalys",
    "AKM1",
    "Precise Biometrics analys",
    "Volvo Cars analys",
  ],
});

export default function AnalyserPage() {
  const analyses = getAnalyses();
  return (
    <SeoPageShell breadcrumb={[{ name: "Analyser" }]} wide>
      <h1 className="font-serif text-4xl font-bold">Svensk aktieanalys</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Varje analys: 99 sidor. 20 variabler. Vi tillämpar samma metodik som
        institutionerna — AKM1:s fundamentalmodell kombinerad med våganalys — och
        redovisar hela underlaget. Detta är pedagogisk finansanalys, inte investeringsråd.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {analyses.map((a) => (
          <Link
            key={a.ticker}
            href={`/analyser/${encodeURIComponent(a.ticker)}`}
            className="block rounded-lg border border-gold/20 bg-card p-6 hover:border-gold/60 transition-colors"
          >
            <p className="text-xs uppercase tracking-widest text-gold">
              {a.exchange || "Nasdaq Stockholm"}
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold">{a.company}</h2>
            <p className="text-sm text-muted-foreground">
              {a.ticker} · {a.sector}
            </p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {a.status}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Analyserad {a.analysisDate || a.verified} · Läs hela analysen →
            </p>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Fler analyser publiceras löpande.{" "}
        <Link href="/medlemskap" className="underline hover:text-foreground">
          Premium-medlemmar
        </Link>{" "}
        får ny analys först och kan begära prioriterade bolag.
      </p>
    </SeoPageShell>
  );
}
