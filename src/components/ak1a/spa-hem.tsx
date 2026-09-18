"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useAk1aStore, type SectionId } from "@/lib/ak1a-store";
import { useAutoLogger } from "@/lib/ak1a/use-activity-logger";
import { Header } from "@/components/ak1a/header";
import { Footer } from "@/components/ak1a/footer";
import { LasyGlobal } from "@/components/ak1a/lasy-global";
import { HomeSection } from "@/components/ak1a/sections/home-section";
import { ROUTE_FOR_SEKTION } from "@/lib/ak1a/sektionsrutter";

// VÅG s7 (prestandaspåret 2026-09-15): sökmodalen lämnar startsidans kritiska
// hydratisering — egen chunk (radix-dialog + menyregistret-loopar), monteras
// först vid idle/interaktion via LasyGlobal (våg 68-mönstret, samma kanal som
// chat-widgeten och ⌘K-paletten). Interaktions-acceleratorn gör att modalen
// redan är på plats när besökaren trycker sök; store:s searchOpen är som förut.
const SearchModalLaddad = dynamic(
  () => import("@/components/ak1a/overlays").then((m) => ({ default: m.SearchModal })),
  { ssr: false },
);

// VÅG s7 u2 (koddelning 2026-09-16): SPA-sektionerna PREC/AKTIER/PORTAL
// renderas ALDRIG vid initial laddning (store:s standardsektion är "hem"),
// men deras kod bundleades ändå ivrigt i startsidans kritiska chunk —
// Lighthouse: unused-javascript poäng 0. Kedjan prec-section → StockAnalysis
// View (83 kB källa) + portal-section → ClientPortal (81 kB) + aktier-section
// (24 kB) är EXKLUSIVT ropade här (inga andra importörer) → next/dynamic
// flyttar hela ~190 kB källkod ur den kritiska bunten. Första besöket på en
// sektion hämtar dess chunk (en bråkdel av en sekund på bredband); HomeSection
// lämnas ivrig — den äger LCP-heron.
const PrecSectionLaddad = dynamic(
  () => import("@/components/ak1a/sections/prec-section").then((m) => ({ default: m.PrecSection })),
  { ssr: false, loading: () => <SektionsSkelett /> },
);

const AktierSectionLaddad = dynamic(
  () => import("@/components/ak1a/sections/aktier-section").then((m) => ({ default: m.AktierSection })),
  { ssr: false, loading: () => <SektionsSkelett /> },
);

const PortalSectionLaddad = dynamic(
  () => import("@/components/ak1a/sections/portal-section").then((m) => ({ default: m.PortalSection })),
  { ssr: false, loading: () => <SektionsSkelett /> },
);

// VÅG s7 o71 (o54 §6-köposten): M3-vidarebefordransvyn är JS-only (sektions-
// bytet är ett store-event — vyn kan aldrig synas i server-HTML) men bundleades
// ändå ivrigt i spa-hem-chunken inklusive sin logotyp och timer-logik.
// next/dynamic flyttar hela grenen ur startsidans kritiska hydratisering.
const SektionVidarebefodranLaddad = dynamic(
  () =>
    import("@/components/ak1a/sektion-vidarebefodran").then((m) => ({
      default: m.SektionVidarebefodran,
    })),
  { ssr: false, loading: () => <SektionsSkelett /> },
);

// VÅG s7 o71: referral-mottagaren renderar null i SSR (dess ?ref=-läsning är
// ett useEffect-kontrakt) — ssr:false ändrar alltså inget synligt kontrakt,
// men flyttar kod + URL-tvätten ur den kritiska hydratiseringsbunten.
const RefMottagareLaddad = dynamic(
  () => import("@/components/ak1a/ref-mottagare").then((m) => ({ default: m.RefMottagare })),
  { ssr: false },
);

/** Platshållare medan en uppskjuten sektions-chunk hämtas (visas endast vid
 *  sektionsbyte efter interaktion — initial laddning renderar alltid "hem"). */
function SektionsSkelett() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4">
      <span className="animate-pulse font-serif text-sm text-muted-foreground">
        Laddar sektion …
      </span>
    </div>
  );
}

// ── M3 SPA-avveckling (2026-09-02) ─────────────────────────────────────────
// Dessa sektioner duplicerar riktiga routes — valet omdirigeras dit i stället
// för att rendera SPA-kopian. Endast hem + portal (plus prec/aktier, som ägs
// av andra) förblir äkta SPA-sektioner. Mappningarna + vidarebefordransvyn
// bor sedan o71 i @/lib/ak1a/sektionsrutter + sektion-vidarebefodran.tsx.

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
        {/* m10 steg 1: diskret mottagar-rad om besöket bar ?ref= (läses en
            gång, tvättas ur URL:en, försvinner vid nästa klick). Sedan o71
            hämtas den via next/dynamic — SSR-kontraktet är null-fallet. */}
        <RefMottagareLaddad />
        {skaVidarebefodra ? (
          <SektionVidarebefodranLaddad sektion={section} />
        ) : (
          <>
            {section === "hem" && <HomeSection />}
            {section === "prec" && <PrecSectionLaddad />}
            {section === "aktier" && <AktierSectionLaddad />}
            {section === "portal" && <PortalSectionLaddad />}
          </>
        )}
      </main>
      <Footer />
      <LasyGlobal>
        <SearchModalLaddad />
      </LasyGlobal>
    </div>
  );
}
