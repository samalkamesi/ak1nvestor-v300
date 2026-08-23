import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { MyAnalyses } from "@/components/ak1a/my-analyses";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  path: "/mina-analyser",
  title: "Mina analyser — dina klientanalyser | AK1A",
  description:
    "De portföljanalyser som AK1A:s analytiker har gjort åt dig: sammanfattning, riskbedömning, våganalys, rekommendationer och nästa steg.",
  keywords: ["klientanalys", "portföljanalys", "mina analyser", "AK1A"],
});

export default function MinaAnalyserPage() {
  return (
    <SeoPageShell breadcrumb={[{ name: "Mina analyser" }]}>
      <h1 className="font-serif text-4xl font-bold">Mina analyser</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Här ligger de analyser din analytiker publicerat till dig. Bygg gärna en
        portfölj först på{" "}
        <Link href="/min-portfolj" className="underline hover:text-gold">
          Min portfölj
        </Link>{" "}
        — då har analytikern allt underlag.
      </p>
      <div className="mt-10">
        <MyAnalyses />
      </div>
    </SeoPageShell>
  );
}
