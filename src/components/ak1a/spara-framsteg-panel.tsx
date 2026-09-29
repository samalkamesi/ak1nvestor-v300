"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSprak } from "@/components/ak1a/sprak-leverantor";
import { lasMedlem } from "@/lib/member-local";

/**
 * SPARA-FRAMSTEG-PANELEN (v207-u4 — konverteringsresan): kontextuell
 * konto-CTA vid kurserna (/kurser + en/ar-speglarna). Svarar på frågan
 * "varför ett konto?" med värdet besökaren redan känt — framsteg, XP och
 * stjärnor som följer med mellan enheter (samma budskap som /logga-in och
 * migreringsbannern; återanvänder SektionsCta:s knappstil).
 *
 * Döljs för medlemmar: ak1a-member i localStorage (hydreringssäkert —
 * SSR-vyn renderas, effect:en döljer efter mount, mönstret från
 * fortsatt-panel.tsx). Knappen bär ?lage=registrera så formuläret
 * öppnas direkt i Skapa konto-läget (mottagaren: medlem-inloggning.tsx).
 */
export function SparaFramstegPanel() {
  const { t } = useSprak();
  const [arMedlem, setArMedlem] = useState(false);

  useEffect(() => {
    setArMedlem(lasMedlem() !== null);
  }, []);

  if (arMedlem) return null;

  return (
    <div className="rounded-xl border border-gold/30 bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t("kurser.sparaRubrik")}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {t("kurser.sparaText")}
      </p>
      <Link
        href="/logga-in?lage=registrera"
        prefetch={false}
        className="mt-3 flex min-h-[52px] items-center justify-center gap-2 rounded-lg border border-gold/50 bg-gold/10 px-4 text-sm font-bold text-gold transition-colors hover:bg-gold/20"
      >
        {t("kurser.sparaKnapp")} <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
