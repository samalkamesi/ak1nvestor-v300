import type { Metadata } from "next";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

export const metadata: Metadata = {
  title: "Integritetspolicy | AK1A Research Lab",
  description:
    "AK1A Research Labs integritetspolicy: endast e-post vid konto, kursprogress lokalt i browser, ingen spårning av investeringar, GDPR-rättigheter.",
  alternates: { canonical: "https://lab.ak1nvestor.com/privacy-policy" },
};

export default function PrivacyPolicy() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Integritetspolicy" }]}>
      <h1 className="font-serif text-3xl font-bold">Integritetspolicy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Senast uppdaterad: 2026-08-05</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <section><h2 className="font-serif text-xl font-bold">1. Vem vi är</h2><p className="mt-2 text-muted-foreground">AK1A Research Lab ägs av Ak1 Apex Nexus. Kontakt: info@ak1nvestor.com</p></section>
        <section><h2 className="font-serif text-xl font-bold">2. Vilken data vi samlar</h2><p className="mt-2 text-muted-foreground">Endast: e-postadress (vid konto), kursprogress (lokalt i browser), anonym statistik. INTE: finansiell info, bankuppgifter, plats.</p></section>
        <section><h2 className="font-serif text-xl font-bold">3. Anti-casino</h2><p className="mt-2 text-muted-foreground">ALDRIG push-notiser om priser. INTE spårning av investeringar. INTE försäljning av data.</p></section>
        <section><h2 className="font-serif text-xl font-bold">4. GDPR-rättigheter</h2><p className="mt-2 text-muted-foreground">Tillgång, rättelse, radering, begränsning, portabilitet. Kontakt: info@ak1nvestor.com</p></section>
        <section><h2 className="font-serif text-xl font-bold">5. Cookies</h2><p className="mt-2 text-muted-foreground">Endast nödvändiga cookies för kursprogress. INGA spårningscookies för reklam.</p></section>
      </div>
    </SeoPageShell>
  );
}
