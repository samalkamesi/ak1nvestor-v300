"use client";

import * as React from "react";
import { useAk1aStore, type SectionId } from "@/lib/ak1a-store";
import { useAutoLogger } from "@/lib/ak1a/use-activity-logger";
import { Header } from "@/components/ak1a/header";
import { Footer } from "@/components/ak1a/footer";
import { SearchModal } from "@/components/ak1a/overlays";
import { HomeSection } from "@/components/ak1a/sections/home-section";
import { PrecSection } from "@/components/ak1a/sections/prec-section";
import { AktierSection } from "@/components/ak1a/sections/aktier-section";
import { VarumarkesLogo } from "@/components/ak1a/varumarkes-logo";
import { PortalSection } from "@/components/ak1a/sections/portal-section";

// ── M3 SPA-avveckling (2026-09-02) ─────────────────────────────────────────
// Dessa sektioner duplicerar riktiga routes — valet omdirigeras dit i stället
// för att rendera SPA-kopian. Endast hem + portal (plus prec/aktier, som ägs
// av andra) förblir äkta SPA-sektioner.
const ROUTE_FOR_SEKTION: Partial<Record<SectionId, string>> = {
  kurser: "/kurser",
  labb: "/labb",
  analyser: "/analyser",
  "om-oss": "/om-oss",
  utbildning: "/medlemskap",
};

// Visningsnamn för vidarebefordransvyn (utbildning landar på /medlemskap).
const NAMN_FOR_SEKTION: Partial<Record<SectionId, string>> = {
  kurser: "Kurser",
  labb: "Labb",
  analyser: "Analyser",
  "om-oss": "Om oss",
  utbildning: "Utbildning & Medlemskap",
};

/**
 * Elegant vidarebefordran — INGEN tyst redirect. Eleven ser vart hon förs:
 * marin panel, rubrik och en stor guldsignatur-knapp. Auto-redirect efter
 * 800 ms (timer med cleanup) om eleven inte hinner klicka själv.
 *
 * Specialfall: om openCourse() satt en djupkurs-slug (klick på kurslänk i
 * t.ex. PREC-analysen) skickas eleven direkt till den kursens route
 * `/kurser/<slug>` i stället för biblioteksöversikten.
 */
function SektionVidarebefodran({ sektion }: { sektion: SectionId }) {
  const namn = NAMN_FOR_SEKTION[sektion] ?? sektion;

  // Frys målet en gång per montering — senare store-ändringar (t.ex. rensad
  // djupkurs-slug) ska inte kunna köra om timern mot ett annat mål.
  const [mal] = React.useState(() => {
    const slug = useAk1aStore.getState().kurserDeepSlug;
    if (sektion === "kurser" && slug) return `/kurser/${slug}`;
    return ROUTE_FOR_SEKTION[sektion]!;
  });

  // Rensa djupkurs-slugen direkt (målet är redan fryst) så den inte dröjer
  // kvar i store:n och påverkar framtida kurser-val.
  React.useEffect(() => {
    if (sektion === "kurser" && useAk1aStore.getState().kurserDeepSlug) {
      useAk1aStore.getState().setKurserDeepSlug(null);
    }
  }, [sektion]);

  // Auto-redirect efter 800 ms med cleanup.
  React.useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = mal;
    }, 800);
    return () => clearTimeout(timer);
  }, [mal]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16">
      <div className="marin-panel w-full rounded-2xl border border-gold/30 p-8 text-center shadow-xl sm:p-12">
        <div className="flex justify-center">
          <VarumarkesLogo storlek="sm" medText={false} />
        </div>
        <p className="mt-2 font-serif text-xs font-bold uppercase tracking-widest text-[#E8C766]">
          AK1A Research Lab
        </p>
        <h1 className="mt-3 font-serif text-2xl font-bold sm:text-3xl">
          Vi har flyttat in det här i biblioteket
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Sektionen <span className="font-semibold text-[#E8C766]">{namn}</span> finns
          nu som en egen sida. Du skickas dit automatiskt om ett ögonblick — eller
          öppna den direkt här:
        </p>
        <button
          type="button"
          onClick={() => {
            window.location.href = mal;
          }}
          className="btn-guld-signatur mt-7 inline-flex items-center gap-2 px-8 py-4 text-base sm:text-lg"
        >
          Öppna {namn} <span aria-hidden="true">→</span>
        </button>
        <p className="mt-4 text-[11px] text-muted-foreground">
          {mal} · omdirigeras automatiskt
        </p>
      </div>
    </div>
  );
}

export function SpaHem() {
  const { section } = useAk1aStore();
  // Auto-log client activity for admin dashboard
  useAutoLogger();

  // M3: sektioner med riktig route → vidarebefordra i stället för SPA-kopia.
  const skaVidarebefodra = Boolean(ROUTE_FOR_SEKTION[section]);

  return (
    <div className="flex min-h-screen flex-col max-w-full overflow-x-hidden">
      <Header />
      <main className="flex-1">
        {skaVidarebefodra ? (
          <SektionVidarebefodran sektion={section} />
        ) : (
          <>
            {section === "hem" && <HomeSection />}
            {section === "prec" && <PrecSection />}
            {section === "aktier" && <AktierSection />}
            {section === "portal" && <PortalSection />}
          </>
        )}
      </main>
      <Footer />
      <SearchModal />
    </div>
  );
}
