import type { Metadata } from "next";
import { lasDemoklient } from "@/components/ak1a/pro/demoklient-data";
import {
  Rapportverkstan,
  RapportverkstanTom,
} from "@/components/ak1a/pro/rapportverkstan";
import { b2bAktiv } from "@/lib/b2b-status";

export const dynamic = "force-static";

// V86 P1 + B2B-residual 2+3: ingen egen robots — layoutens b2bAktiv()-grind
// (noindex i AV-läge) gäller. Metadata endast när B2B är PÅ.
export const metadata: Metadata = b2bAktiv()
  ? {
      title: "Rapportverkstan — AK1A PRO",
      description:
        "Rapportverkstan i AK1A PRO: bygg utskriftsklara rapporter i tre låsta AK1A-mallar med white-label — metod- och ansvarsdeklarationen förblir mal-låst. Pedagogisk analys — inte investeringsråd.",
    }
  : {};

/**
 * /pro/rapporter — RAPPORTVERKSTAN, PRINT FÖRST (VÅG 61 bygg-4, BESLUT §4d).
 *
 *   • Rapportbyggare-motorn återanvänd: window.print + @media print
 *     (PRO_PRINT_CSS — endast dokumentet syns i utskriften).
 *   • MALL-VÄLJARE: Mötespaket | Analys | Portföljöversikt. Djuplänk
 *     ?mall=motespaket (från klientvy-knappen) läses KLIENTSIDIGT i
 *     useEffect — sidan förblir force-static (URL:n är läget, ingen cookie,
 *     FORBUD 4).
 *   • White-label-blocket I DOKUMENTET: TenantHeader ("[firmnamn] × AK1A-
 *     metodik") ur bygg-2:s tenant-lager (pro-admin-v1 → TenantConfig;
 *     demo-firma på /pro-ytor enligt K-B2B:4).
 *   • Mal-låst metod-/risk-sida (MalLastSida) ur byggDisclaimerRader() — kan
 *     ALDRIG suddas, mjukas eller kortas, inte ens av Institution (K5/FORBUD 6).
 *   • Analys + Portföljöversikt renderas ur /api/pro/analys-svaret (POST
 *     { tickers, vikter } — samma route som CSV-importen).
 *   • Rapportkvot-räknare i localStorage (BESLUT §4d); PRINT FÖRST —
 *     server-PDF är fas 3 (K1/K7): copy lovar ALDRIG PDF som inte levereras.
 *
 * Skalet ägs av ../layout.tsx (ProShell) — INTE SeoPageShell.
 */
export default function ProRapporterPage() {
  // V86 B2B-residual 4: early-return i AV-läge före lasDemoklient() — sidan
  // serialiseras i RSC-flight-payloaden även utan renderade {children}.
  if (!b2bAktiv()) return null;

  const demoklient = lasDemoklient();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-guld-djup">
        AK1A PRO · Rapportverkstan
      </p>
      <h1 className="mt-3 font-serif text-4xl font-bold">Rapportverkstan</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Bygg utskriftsklara rapporter i tre mallar — med firmans logo och kolofon i
        omslagsbandet, och metod- samt ansvarsdeklarationen mal-låst på sin sida:
        white-label lägger till, aldrig subtraherar.
      </p>

      <div className="mt-8">
        {demoklient ? <Rapportverkstan demoklient={demoklient} /> : <RapportverkstanTom />}
      </div>
    </div>
  );
}
