import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { Laroplan } from "@/components/ak1a/laroplan";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  path: "/laroplan",
  title: "Läroplanen — från nybörjare till aktieanalytiker | AK1A",
  // Uppdaterad 2026-09-01: läroplanens 5 nivåer listar 73 kurser (av totalt 307 i biblioteket)
  description:
    "5 nivåer, 73 kurser, ett mål: oberoende aktieanalytiker. Från AKM1:s grunder genom bokmaster till praktik och självständighet — helt gratis.",
  keywords: ["läroplan aktieanalys", "utbildning aktieanalytiker", "AKM1 kursplan", "gratis aktieutbildning", "bli aktieanalytiker"],
});

export default function LaroplanPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Läroplanen" }]} wide>
      <Laroplan />
    </SeoPageShell>
  );
}
