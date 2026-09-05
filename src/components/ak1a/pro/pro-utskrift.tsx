"use client";

/**
 * PRO-UTSKRIFT — Rapportverkstans gemensamma utskriftsmotor (VÅG 61 bygg-4).
 *
 * Rapportbyggare-motorn ÅTERANVÄND (P5): samma window.print + @media print-
 * mönster som src/components/ak1a/rapportbyggare.tsx (endast dokumentet syns,
 * resten av sidan tystas). White-label och mal-låst text kommer från BYGG-2:S
 * TENANT-LAGER (som landat): TenantHeader + useTenant ur
 * src/components/ak1a/pro/tenant-header.tsx och byggDisclaimerRader ur
 * src/lib/pro/tenant.ts — samma källa som testet bevisar mal-låsningen med.
 *
 * Detta filets eget bidrag ovanpå motorn:
 *   - PRO_PRINT_CSS + ProRapportDok (dokumentomslaget #pro-rapport-dokument)
 *   - ProVerktygsrad: Skriv ut-knapp + RAPPORTKVOT-RÄKNAREN (BESLUT §4d) i
 *     localStorage "pro-rapportkvot-v1" — {"2026-09": N} per kalendermånad;
 *     äkta kvoter kommer i fas 2 bakom DPA-grinden. Copy på /pro/priser är
 *     K7-ärlig: räknaren räknar utskriftsförsök, inget PDF-löfte (PDF = fas 3).
 *
 * Hydration-säkert: localStorage läses ENDAST i useEffect. Ingen klocka i
 * render-vägen (P1) — dokumentet dateras av anroparen med underlagets eget
 * datum, aldrig Date.now().
 *
 * Pedagogisk forskning — ALDRIG investeringsrådgivning (2007:528).
 */

import { useEffect, useState, type ReactNode } from "react";

// ── Utskrifts-CSS (rapportbyggare-mönstret — bara dokumentet syns) ───────────

export const PRO_PRINT_CSS = `
@media print {
  body * { visibility: hidden; }
  #pro-rapport-dokument, #pro-rapport-dokument * { visibility: visible; }
  #pro-rapport-dokument {
    position: absolute; left: 0; top: 0; width: 100%;
    padding: 0 !important; border: none !important; box-shadow: none !important;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
}
`;

// ── Rapportkvoten (localStorage "pro-rapportkvot-v1" — BESLUT §4d) ───────────

const LS_KVOT = "pro-rapportkvot-v1";

/** Månadsnyckel ur en ISO-datumsträng ("2026-09-04" → "2026-09"). */
function manadNyckel(iso: string): string {
  return /^(\d{4}-\d{2})/.exec(iso)?.[1] ?? "odaterad";
}

/** Läs kvoten för en månad (0 när ingen räknare finns). */
export function lasRapportkvot(iso: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const rå = window.localStorage.getItem(LS_KVOT);
    if (!rå) return 0;
    const tolkad = JSON.parse(rå) as Record<string, number> | null;
    const n = tolkad?.[manadNyckel(iso)];
    return typeof n === "number" && Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

/** Räkna upp kvoten för månaden — returnerar det nya värdet. */
export function okaRapportkvot(iso: string): number {
  if (typeof window === "undefined") return 0;
  const nyckel = manadNyckel(iso);
  let nu = 0;
  try {
    const rå = window.localStorage.getItem(LS_KVOT);
    const tolkad = rå ? (JSON.parse(rå) as Record<string, number> | null) : null;
    const n = tolkad?.[nyckel];
    if (typeof n === "number" && Number.isFinite(n) && n >= 0) nu = Math.floor(n);
  } catch {
    nu = 0;
  }
  const ny = nu + 1;
  try {
    window.localStorage.setItem(LS_KVOT, JSON.stringify({ [nyckel]: ny }));
  } catch {
    // fullbokat lagringsutrymme — kvoten är MVP-räknare, inget spärr-läge
  }
  return ny;
}

// ── Dokumentomslag + verktygsrad ─────────────────────────────────────────────

/**
 * Verktygsraden ovanför varje PRO-dokument: Skriv ut / spara som PDF +
 * valfri tillbaka-knapp + kvotvisning. `datumForKvot` är dokumentets ISO-
 * datering (underlagets datum — deterministiskt, inte väggklockan).
 */
export function ProVerktygsrad({
  onTillbaka,
  tillbakaText = "Tillbaka till verkstan",
  datumForKvot,
  notis,
}: {
  /** Saknas den visas ingen tillbaka-knapp (mallväljaren äger navigationen). */
  onTillbaka?: () => void;
  tillbakaText?: string;
  datumForKvot: string;
  notis?: string;
}) {
  const [kvot, setKvot] = useState<number | null>(null);
  useEffect(() => {
    setKvot(lasRapportkvot(datumForKvot));
  }, [datumForKvot]);

  return (
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      <button
        type="button"
        onClick={() => {
          setKvot(okaRapportkvot(datumForKvot));
          window.print();
        }}
        className="btn-guld-signatur inline-flex min-h-[44px] items-center gap-2 px-6 text-sm"
      >
        Skriv ut / spara som PDF
      </button>
      {onTillbaka && (
        <button
          type="button"
          onClick={onTillbaka}
          className="btn-marin inline-flex min-h-[44px] items-center px-5 text-sm"
        >
          {tillbakaText}
        </button>
      )}
      <p className="text-xs text-muted-foreground">
        {notis && <span className="mr-2">{notis}</span>}
        {kvot !== null && (
          <span title="Rapportkvot-räknaren (localStorage i MVP — äkta kvoter i fas 2 bakom DPA-grinden). Räknar utskriftsförsök; PDF-export på väg (K7).">
            Rapportkvot: {kvot} denna månad
          </span>
        )}
      </p>
    </div>
  );
}

/** Dokumentomslaget — A4-känsla, allt inom #pro-rapport-dokument för print. */
export function ProRapportDok({ children }: { children: ReactNode }) {
  return (
    <article
      id="pro-rapport-dokument"
      className="gravor-ram mx-auto mt-6 max-w-[820px] rounded-sm bg-card p-6 sm:p-10"
    >
      {children}
    </article>
  );
}
