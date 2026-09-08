import type { Metadata } from "next";
import { lasDemoklient } from "@/components/ak1a/pro/demoklient-data";
import { Klientvy, KlientvyTom } from "@/components/ak1a/pro/klientvy";
import { b2bAktiv } from "@/lib/b2b-status";

export const dynamic = "force-static";

// V86 P1 + B2B-residual 2+3: ingen egen robots — layoutens b2bAktiv()-grind
// (noindex i AV-läge) gäller. Metadata endast när B2B är PÅ.
export const metadata: Metadata = b2bAktiv()
  ? {
      title: "Klienter — AK1A PRO",
      description:
        "Klientvyn i AK1A PRO: portföljöversikt, AKM2-radar, vågrader per horisont och mötespaketet — ETT utskriftbart A4 inför klientmötet. Pedagogisk analys — inte investeringsråd.",
    }
  : {};

/**
 * /pro/klienter — KLIENTVYN PÅ DEMOKLIENTEN (VÅG 61 bygg-4, BESLUT §4c).
 *
 *   • Korthuvud: alias + nästa uppföljning (demoklienten = medföljande
 *     forskningsportfölj — icke-person, aldrig riktiga klientuppgifter).
 *   • Portföljöversikt: innehav × vikt + aggregerad vågprofil.
 *   • AKM2-radar + profiljämförelse på tunga innehav (prop-drivna — ren import
 *     ur akm2-dashboard.tsx, som RÖRS ALDRIG).
 *   • VagCell-rader per horisont + differens-chip "ändrat sedan sist"
 *     (jamforDåNu ur uppfoljning.ts — anropbar; första mätningen märks ärligt).
 *   • Vågprofil-kort (VagkurvaGraf) + peer-rad per innehav.
 *   • MÖTESPAKETET (b5 §2d) = klientvys-knappen → /pro/rapporter?mall=motespaket.
 *
 * Giltar hårt (B2B-BESLUT): 0 nya tabeller · 0 personuppgifter (FORBUD 1/§6.7 —
 * klientregistret väntar bakom DPA-grinden G3) · låsrad 2007:528 på vyn ·
 * AKM2/AKM3-lib läses, rörs ej · force-static (URL:n är läget, ingen cookie).
 * Skalet ägs av ../layout.tsx (ProShell) — INTE SeoPageShell.
 */
export default function ProKlienterPage() {
  // V86 B2B-residual 4: early-return i AV-läge före lasDemoklient() — sidan
  // serialiseras i RSC-flight-payloaden även utan renderade {children}.
  if (!b2bAktiv()) return null;

  const demoklient = lasDemoklient();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-guld-djup">
        AK1A PRO · Klientvyn
      </p>
      <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">Klienter</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Morgonrond → screening → klientmötet. Klientvyn samlar mötesunderlaget:
        portföljöversikt med aggregerad vågprofil, AKM2-radar på tunga innehav,
        vågrader per horisont och mötespaketet — ett enda utskriftbart A4 att
        lägga på bordet före kaffet.
      </p>

      {demoklient ? <Klientvy demoklient={demoklient} /> : <KlientvyTom />}
    </div>
  );
}
