import type { Metadata } from "next";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const metadata: Metadata = {
  title: "Användarvillkor | AK1A Research Lab",
  description:
    "AK1A Research Labs användarvillkor: pedagogisk finansanalys — inte investeringsrådgivning. Riskvarning, reproducerbarhet, villkor.",
  alternates: { canonical: "https://lab.ak1nvestor.com/terms" },
};

export default function Terms() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Användarvillkor" }]}>
      <h1 className="font-serif text-3xl font-bold">Användarvillkor</h1>
      <p className="mt-2 text-sm text-muted-foreground">Senast uppdaterad: 2026-08-05</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <section><h2 className="font-serif text-xl font-bold">1. Pedagogisk — inte rådgivning</h2><p className="mt-2 text-muted-foreground">AK1A är en plattform för pedagogisk finansanalys. Vi är INTE en investeringsrådgivare. Allt innehåll är utbildning, inte rekommendation.</p></section>
        <section><h2 className="font-serif text-xl font-bold">2. RISKVARNING</h2><div className="mt-2 rounded-lg border border-bear/30 bg-bear/5 p-4"><p className="text-muted-foreground">All investering innebär risk. Du kan förlora hela ditt kapital. Investera aldrig pengar du inte har råd att förlora.</p></div></section>
        <section><h2 className="font-serif text-xl font-bold">3. Reproducerbarhet</h2><p className="mt-2 text-muted-foreground">Våra analyser är reproducerbara. Men reproducerbarhet garanterar inte framtida avkastning.</p></section>
        <section><h2 className="font-serif text-xl font-bold">4. Prenumeration</h2><p className="mt-2 text-muted-foreground">149 kr/mån. Ingen bindningstid. Avsluta när du vill.</p></section>
        <section><h2 className="font-serif text-xl font-bold">5. Kontakt</h2><p className="mt-2 text-muted-foreground">Ak1 Apex Nexus · info@ak1nvestor.com</p></section>
      </div>
    </SeoPageShell>
  );
}
