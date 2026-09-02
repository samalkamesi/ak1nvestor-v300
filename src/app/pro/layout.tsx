import type { Metadata } from "next";
import Link from "next/link";

/**
 * AK1A PRO — DET EGNA B2B-SKALET (Fas D, forskning-b2b 5.1).
 *
 * "/pro är en skild värld" — därför eget skal: mörk marin vägg i stället för
 * publik pappers-header, PRO-badge i guld, INGA publika menyer (ingen mega-
 * meny, ingen mobil-drawer, ingen publik logga-in). Tonen är institutionell:
 * färre val, tyngre väggar.
 *
 * Röt-länk till den publika världen finns (diskret, i footern) — B2B-kunden
 * ska aldrig känna sig instängd, bara skild från folkhavet.
 */
export const metadata: Metadata = {
  title: "AK1A PRO — Analytikerplattformen för rådgivare och analytiker",
  description:
    "Bygg institutionella rapporter på AKM1 · AK1TS · Konfluens — metodiken som rättighetsstyrd modul. CSV-portföljimport, tre låsta AK1A-rapportmallar, white-label redo. Pedagogisk analys — inte investeringsråd.",
  keywords: [
    "AK1A PRO",
    "B2B analysplattform",
    "rapportbyggare",
    "white-label rapporter",
    "metodik-licens",
    "AKM1",
    "AK1TS",
    "konfluens",
    "finansiell analys Sverige",
  ],
  robots: { index: true, follow: true },
};

/** B2B-ankarnavigation — tre fasta håll på landningssidan, aldrig publik meny. */
const ANKARE = [
  { href: "#plattformen", namn: "Plattformen" },
  { href: "#kom-igang", namn: "Kom igång" },
  { href: "#priser", namn: "Priser" },
] as const;

export default function ProLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/*
        B2B-är separating: de publika fasta verktygen (AI-Mentorn, Short-
        Sellern) döljs medan PRO-skalet är monterat — style-taggen följer
        layoutens livscykel, så utanför /pro är allt som vanligt.
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `button[aria-label="AI-Mentor"], button[aria-label="Utmana mig — Short-Seller"] { display: none !important; }`,
        }}
      />

      {/* ── Marin vägg — PRO:s egen header ── */}
      <header className="marin-panel sticky top-0 z-30 w-full border-b border-gold/40">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link href="/pro" className="flex items-center gap-2.5 hover:opacity-85">
            <span className="font-serif text-base font-bold tracking-tight text-[#EDE6D6] sm:text-lg">
              AK1<span className="text-[#E8C766]">A</span>
            </span>
            <span className="rounded border border-[#E8C766]/60 bg-[#E8C766]/10 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.22em] text-[#E8C766]">
              PRO
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-6 text-xs sm:flex">
            {ANKARE.map((a) => (
              <a key={a.href} href={a.href} className="text-[#EDE6D6]/80 transition-colors hover:text-[#E8C766]">
                {a.namn}
              </a>
            ))}
          </nav>

          <a
            href="mailto:info@ak1nvestor.com?subject=Boka%20demo%20%E2%80%94%20AK1A%20PRO"
            className="btn-guld-signatur ml-auto min-h-[38px] px-4 py-2 text-xs sm:ml-4"
          >
            Boka demo
          </a>
        </div>
        <div className="hjarlinje" />
      </header>

      <main className="flex-1">{children}</main>

      {/* ── B2B-footer — minimal, institutionell ── */}
      <footer className="marin-panel mt-16 border-t border-gold/40">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-serif text-sm font-bold text-[#EDE6D6]">
                AK1A <span className="text-[#E8C766]">PRO</span>
                <span className="ml-2 font-sans text-xs font-normal italic text-[#EDE6D6]/70">
                  — en skild värld inom AK1A Research Lab
                </span>
              </p>
              <p className="mt-2 max-w-md text-[11px] leading-relaxed text-[#EDE6D6]/70">
                Rapporter framtagda med AK1A-metodiken är pedagogisk analys — aldrig personlig
                rekommendation eller investeringsråd. Metod- och ansvarsdeklarationen följer varje
                export och kan aldrig suddas ut av white-label.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 text-xs">
              <a href="mailto:info@ak1nvestor.com" className="text-[#E8C766] hover:opacity-80">
                info@ak1nvestor.com
              </a>
              <Link href="/terms" className="text-[#EDE6D6]/70 hover:text-[#E8C766]">
                Villkor
              </Link>
              <Link href="/privacy-policy" className="text-[#EDE6D6]/70 hover:text-[#E8C766]">
                Integritetspolicy
              </Link>
              <Link href="/" className="text-[#EDE6D6]/50 hover:text-[#E8C766]">
                ← Till den publika plattformen
              </Link>
            </div>
          </div>
          <div className="hjarlinje mt-6" />
          <p className="mt-4 text-center text-[10px] italic text-[#EDE6D6]/50">
            © {new Date().getFullYear()} Ak1 Apex Nexus · AK1A Research Lab · Pedagogisk analys — inte investeringsråd
          </p>
        </div>
      </footer>
    </div>
  );
}
