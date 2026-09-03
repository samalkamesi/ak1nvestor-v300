import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { LoggaIn } from "@/components/ak1a/logga-in";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  path: "/logga-in",
  title: "Logga in — gratis konto, alla kurser upplåsta | AK1A",
  description:
    "Logga in med e-post eller skapa gratis konto: alla 226 kurser, kalkylatorn och portföljsystemet — helt kostnadsfritt, för alltid.",
  keywords: ["logga in", "gratis konto", "aktieutbildning gratis", "AK1A"],
});

export default function LoggaInPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Logga in" }]}>
      <h1 className="text-center font-serif text-4xl font-bold">Välkommen till AK1A</h1>
      <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground leading-relaxed">
        Institutionell metodik — som en rättighet. Ett konto låser upp allt i Fas 1,
        helt gratis. Ditt framsteg sparas och du tjänar XP och stjärnor för varje kurs.
      </p>
      <div className="mt-10">
        <LoggaIn />
      </div>
    </SeoPageShell>
  );
}
