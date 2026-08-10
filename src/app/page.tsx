"use client";

import * as React from "react";
import { useAk1aStore } from "@/lib/ak1a-store";
import { useAutoLogger } from "@/lib/ak1a/use-activity-logger";
import { Header } from "@/components/ak1a/header";
import { Footer } from "@/components/ak1a/footer";
import { SearchModal, SummaryDrawer, ShareDialog } from "@/components/ak1a/overlays";
import { HomeSection } from "@/components/ak1a/sections/home-section";
import { PrecSection } from "@/components/ak1a/sections/prec-section";
import { KurserSection } from "@/components/ak1a/sections/kurser-section";
import { LabbSection } from "@/components/ak1a/sections/labb-section";
import { OmOssSection } from "@/components/ak1a/sections/om-oss-section";
import { StyrelseSection } from "@/components/ak1a/sections/styrelse-section";
import { AnalyserSection } from "@/components/ak1a/sections/analyser-section";
import { AktierSection } from "@/components/ak1a/sections/aktier-section";
import { UtbildningSection } from "@/components/ak1a/sections/utbildning-section";
import { PortalSection } from "@/components/ak1a/sections/portal-section";

export default function Page() {
  const { section } = useAk1aStore();
  // Auto-log client activity for admin dashboard
  useAutoLogger();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {section === "hem" && <HomeSection />}
        {section === "prec" && <PrecSection />}
        {section === "analyser" && <AnalyserSection />}
        {section === "aktier" && <AktierSection />}
        {section === "kurser" && <KurserSection />}
        {section === "labb" && <LabbSection />}
        {section === "styrelse" && <StyrelseSection />}
        {section === "utbildning" && <UtbildningSection />}
        {section === "om-oss" && <OmOssSection />}
        {section === "portal" && <PortalSection />}
      </main>
      <Footer />
      <SearchModal />
      <SummaryDrawer />
      <ShareDialog />
    </div>
  );
}
