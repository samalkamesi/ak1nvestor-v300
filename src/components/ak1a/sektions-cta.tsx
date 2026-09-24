"use client";

import Link from "next/link";
import { useSprak } from "./sprak-leverantor";

/* v160 P2.5 (audit #4): SektionsCta lyft ur home-section.tsx — startsidans
   konverteringsstandard (knapp + två invändningsnycklar ur ordlistan, 52 px
   mobiltryckyta) som delad komponent för sidbotten på CTA-lösa sidor.
   Strip-varianten sitter i befintligt sidflöde; sjalvstandig bär egen
   sektion-wrapper (startsidans mönster efter NyhetsChips). */
export function SektionsCta({ sjalvstandig = false }: { sjalvstandig?: boolean }) {
  const { t } = useSprak();
  const knapp = (
    <Link
      href="/logga-in"
      prefetch={false}
      className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg border border-gold/50 bg-gold/10 px-6 py-3 text-sm font-bold text-gold transition-colors hover:bg-gold/20 sm:w-auto"
    >
      {t("home.borjaGratis")} <span aria-hidden="true">→</span>
    </Link>
  );
  const mikro = (
    <p className="text-xs tracking-wide text-muted-foreground">
      {t("home.heroMikro1")} · {t("home.heroMikro3")}
    </p>
  );
  const strip = (
    <div className="mt-10 flex flex-col items-center gap-3 border-t border-border pt-6 sm:flex-row sm:justify-center">
      {knapp}
      {mikro}
    </div>
  );
  if (!sjalvstandig) return strip;
  return (
    <div className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">{strip}</div>
    </div>
  );
}
