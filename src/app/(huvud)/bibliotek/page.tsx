import type { Metadata } from "next";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Bibliotek } from "@/components/ak1a/bibliotek";
import { getBokkanon } from "@/lib/content";

// Statisk per default ger s-maxage=31536000 (årslås, o10 §2) — revalidate
// binder det, samma mönster som /kurser sedan våg 82.
export const revalidate = 3600;

export const metadata: Metadata = {
  // Uppdaterad 2026-09-01: bokkanon-datat forskas fram (data/bokkanon.json är tom) — inget antal hävdas förrän kanonen publiceras
  title: "Biblioteket — bokkanon för aktieanalytikern | AK1A Research Lab",
  description:
    "Den forskningsbaserade bokkanonen: fundamentalanalys, teknisk analys, beteendefinans, makro och risk — varje bok kopplad till AKM1 (V01–V20) och AK1TS (5×5×4). Tier 1 blir kompletta BOKMASTER-kurser.",
  alternates: { canonical: "https://lab.ak1nvestor.com/bibliotek" },
};

export default function BibliotekPage() {
  const bocker = getBokkanon();
  return (
    <SeoPageShell wide breadcrumb={[{ name: "Biblioteket" }]}>
      <Bibliotek bocker={bocker} />
    </SeoPageShell>
  );
}
