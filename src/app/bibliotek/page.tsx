import type { Metadata } from "next";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Bibliotek } from "@/components/ak1a/bibliotek";
import { getBokkanon } from "@/lib/content";

export const metadata: Metadata = {
  title: "Biblioteket — 100 böcker för aktieanalytikern | AK1A Research Lab",
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
