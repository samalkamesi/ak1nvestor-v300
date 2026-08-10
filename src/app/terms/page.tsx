"use client";
import { Ak1aLogo } from "@/components/ak1a/primitives";
import { useAk1aStore } from "@/lib/ak1a-store";

export default function Terms() {
  const { setSection } = useAk1aStore();
  return (
    <div className="paper-texture min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <Ak1aLogo size="md" onClick={() => setSection("hem")} />
        <h1 className="mt-8 font-serif text-3xl font-bold">Användarvillkor</h1>
        <p className="mt-2 text-sm text-muted-foreground">Senast uppdaterad: 2026-08-05</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed">
          <section><h2 className="font-serif text-xl font-bold">1. Pedagogisk — inte rådgivning</h2><p className="mt-2 text-muted-foreground">AK1A är en plattform för pedagogisk finansanalys. Vi är INTE en investeringsrådgivare. Allt innehåll är utbildning, inte rekommendation.</p></section>
          <section><h2 className="font-serif text-xl font-bold">2. RISKVARNING</h2><div className="mt-2 rounded-lg border border-bear/30 bg-bear/5 p-4"><p className="text-muted-foreground">All investering innebär risk. Du kan förlora hela ditt kapital. Investera aldrig pengar du inte har råd att förlora.</p></div></section>
          <section><h2 className="font-serif text-xl font-bold">3. Reproducerbarhet</h2><p className="mt-2 text-muted-foreground">Våra analyser är reproducerbara. Men reproducerbarhet garanterar inte framtida avkastning.</p></section>
          <section><h2 className="font-serif text-xl font-bold">4. Prenumeration</h2><p className="mt-2 text-muted-foreground">149 kr/mån. Ingen bindningstid. Avsluta när du vill.</p></section>
          <section><h2 className="font-serif text-xl font-bold">5. Kontakt</h2><p className="mt-2 text-muted-foreground">Ak1 Apex Nexus · info@ak1nvestor.com</p></section>
        </div>
      </div>
    </div>
  );
}
