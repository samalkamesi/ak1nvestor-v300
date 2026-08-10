"use client";
import { Ak1aLogo } from "@/components/ak1a/primitives";
import { useAk1aStore } from "@/lib/ak1a-store";

export default function PrivacyPolicy() {
  const { setSection } = useAk1aStore();
  return (
    <div className="paper-texture min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <Ak1aLogo size="md" onClick={() => setSection("hem")} />
        <h1 className="mt-8 font-serif text-3xl font-bold">Integritetspolicy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Senast uppdaterad: 2026-08-05</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed">
          <section><h2 className="font-serif text-xl font-bold">1. Vem vi är</h2><p className="mt-2 text-muted-foreground">AK1A Research Lab ägs av Ak1 Apex Nexus. Kontakt: info@ak1nvestor.com</p></section>
          <section><h2 className="font-serif text-xl font-bold">2. Vilken data vi samlar</h2><p className="mt-2 text-muted-foreground">Endast: e-postadress (vid konto), kursprogress (lokalt i browser), anonym statistik. INTE: finansiell info, bankuppgifter, plats.</p></section>
          <section><h2 className="font-serif text-xl font-bold">3. Anti-casino</h2><p className="mt-2 text-muted-foreground">ALDRIG push-notiser om priser. INTE spårning av investeringar. INTE försäljning av data.</p></section>
          <section><h2 className="font-serif text-xl font-bold">4. GDPR-rättigheter</h2><p className="mt-2 text-muted-foreground">Tillgång, rättelse, radering, begränsning, portabilitet. Kontakt: info@ak1nvestor.com</p></section>
          <section><h2 className="font-serif text-xl font-bold">5. Cookies</h2><p className="mt-2 text-muted-foreground">Endast nödvändiga cookies för kursprogress. INGA spårningscookies för reklam.</p></section>
        </div>
      </div>
    </div>
  );
}
