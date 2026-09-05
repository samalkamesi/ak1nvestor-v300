"use client";

/**
 * PRENUM-CTA (VÅG 63 O2 #2) — /prenumeration var före denna våg länkad
 * ENDAST från footern: tjänsten var i praktiken osynlig på sajten.
 *
 * Två återanvända ytor, samma datakälla:
 *  - PrenumCtaKort: kompakt marin kort för Min Sidas dashboard (efter
 *    ForskningslageKort).
 *  - PrenumCtaRad: engångs-rad under DelaKort när en kurs klarats i
 *    KursSteg ("klarad kurs → ta nästa steg").
 *
 * Nivådatan (namn + priser) kommer ALLTID som serialiserbara props från
 * servern (lasPriser() i data/portfolj-system/priser.json) — samma mönster
 * som prenumeration/page.tsx; prisbelopp hårdkodas aldrig i komponenter.
 * Texterna går via ordlistan (prenum.*) så kurs-speglingarna en/ar får
 * med sig CTA:n på rätt språk, och länken följer spegel-sökvägen.
 */

import Link from "next/link";
import { useState } from "react";
import { useSprak } from "@/components/ak1a/sprak-leverantor";
import {
  formateraKr,
  lasValdPrenumerationsNiva,
  type PrenumerationNiva,
} from "@/lib/prenumeration";

/** Prenumerationens URL i nuvarande språkkontext (svenskt original som default). */
function prenumLank(sprak: string): string {
  return sprak === "en" || sprak === "ar" ? `/${sprak}/prenumeration` : "/prenumeration";
}

/** Kompakt CTA-kort för Min Sidas dashboard — visas för inloggade medlemmar. */
export function PrenumCtaKort({
  niva,
  rabattProcent,
}: {
  /** Lägsta nivån ur priser.json ("forskning") — visas som exempelpris. */
  niva: PrenumerationNiva | null;
  /** Fas 2-rabatten i hela procent (priser.json rabattFas.fas2). */
  rabattProcent: number;
}) {
  const { t, sprak } = useSprak();
  // Har medlemmen redan en sparad aktiveringsintention visas inget kort —
  // hen har redan tagit steget och behöver inte förföljas vidare. Kortet
  // monteras ENDAST på klienten (Min Sidas hydrerings-gate) ⇒ localStorage
  // kan läsas direkt i lazy initial state — en enkel engångsläsning.
  const [redanVald] = useState(() => lasValdPrenumerationsNiva() !== null);

  if (!niva || redanVald) return null;

  return (
    <section className="marin-panel rounded-2xl border border-gold/30 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden="true">
            📊
          </span>
          <div className="min-w-0">
            <p className="font-serif text-lg font-bold text-[#E8C766]">
              {t("prenum.ctaTitel")}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#EDE6D6]/85">
              {t("prenum.ctaText", { pris: formateraKr(niva.prisManad) })}{" "}
              {rabattProcent > 0 && (
                <span className="text-[#EDE6D6]/60">
                  {rabattProcent} % rabatt för alltid för Fas 2- och Fas 3-elever.
                </span>
              )}
            </p>
          </div>
        </div>
        <Link
          href={prenumLank(sprak)}
          className="btn-marin shrink-0 px-4 py-2.5 text-center text-sm"
        >
          {t("prenum.ctaKnapp")}
        </Link>
      </div>
    </section>
  );
}

/** Engångs-rad efter sista kapitlet i en klarad kurs (KursSteg + DelaKort). */
export function PrenumCtaRad({ niva }: { niva: PrenumerationNiva | null }) {
  const { t, sprak } = useSprak();
  if (!niva) return null;

  return (
    <div className="mt-6 flex flex-col gap-3 rounded-xl border border-gold/30 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="min-w-0 text-sm leading-relaxed text-muted-foreground">
        <span className="font-bold text-gold">{t("prenum.ctaTitel")}</span>{" "}
        {t("prenum.ctaText", { pris: formateraKr(niva.prisManad) })}
      </p>
      <Link
        href={prenumLank(sprak)}
        className="btn-marin shrink-0 px-4 py-2.5 text-center text-sm"
      >
        {t("prenum.ctaKnapp")}
      </Link>
    </div>
  );
}
