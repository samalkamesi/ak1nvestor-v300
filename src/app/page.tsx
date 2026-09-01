import type { Metadata } from "next";
import { SpaHem } from "@/components/ak1a/spa-hem";

export const metadata: Metadata = {
  title: "AK1A Research Lab — Från utbildning till inkomst | Ak1 Apex Nexus",
  description:
    "Sveriges enda institutionella metodik, byggd för privatpersoner. Djupare än en blogg. Ärligare än en bank. Snabbare än en utbildning. Pedagogisk finansanalys — inte investeringsråd.",
  alternates: { canonical: "https://lab.ak1nvestor.com" },
};

export default function Page() {
  return <SpaHem />;
}
