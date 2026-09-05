"use client";

import * as React from "react";
import {
  DEFAULT_DEMO_TENANT,
  lasTenantFranLocalStorage,
  type TenantConfig,
} from "@/lib/pro/tenant";

/**
 * TENANT-RENDERINGSLAGRET — white-label ovanpå rapporterna (B2B-BESLUT våg 61
 * steg 2: pro-admin-v1-kontraktet → TenantConfig → TenantHeader).
 *
 * TenantHeader är den PRESENTATIONELLA delen (rent prop-driven — kan sträng-
 * renderas i tester); useTenant är klient-kroken som löser aktiv tenant:
 *   1. pro-admin-v1 i localStorage (rådgivarens/firmans egen konfiguration),
 *   2. annars DEFAULT_DEMO_TENANT — ENDAST på /pro-ytor (demo-läge G1,
 *      K-B2B:4:s påhittade demo-firma),
 *   3. annars null (avsändaren är AK1A — privatsidorna förblir orörda, P4:
 *      B2B läcker aldrig in i privat-upplevelsen).
 * Hydration-säkert: läsningen sker i useEffect bakom `hydrerad` (samma
 * mönster som rapportbyggare/admin-panel) — SSR renderar AK1A-läget.
 */

// ── Klient-kroken ───────────────────────────────────────────────────────────

export function useTenant(): { tenant: TenantConfig | null; hydrerad: boolean } {
  const [tenant, setTenant] = React.useState<TenantConfig | null>(null);
  const [hydrerad, setHydrerad] = React.useState(false);

  React.useEffect(() => {
    let t = lasTenantFranLocalStorage();
    if (!t && window.location.pathname.startsWith("/pro")) {
      t = DEFAULT_DEMO_TENANT; // demo-firman är en /pro-företeelse — aldrig på privat yta
    }
    setTenant(t);
    setHydrerad(true);
  }, []);

  return { tenant, hydrerad };
}

// ── Presentationskomponenten ────────────────────────────────────────────────

/**
 * TenantHeader — avsändarbandet överst I rapportdokumentet: logotyp-plats
 * (extern URL om konfigurerad, annars monogram) + firmanamn + "× AK1A-
 * metodik" (B2B-BESLUT §4d). Demo-firman markeras tydligt (K-B2B:4 — påhittat
 * namn ska aldrig kunna förväxlas med en verklig kund). Renderas INUTI
 * rapportdokumentet så att utskriftsmotorn (window.print + @media print)
 * tar med den.
 */
export function TenantHeader({ tenant }: { tenant: TenantConfig }) {
  const arDemo = tenant.id === DEFAULT_DEMO_TENANT.id;
  const monogram =
    tenant.firmNamn.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gold/30 pb-4"
      data-tenant-tema={tenant.brandFarger?.temaPrefix ?? undefined}
    >
      <div className="flex items-center gap-3">
        {tenant.logotypUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- tenant-logotypen är en extern, konfigurerad URL — inte en lokal asset att optimera
          <img
            src={tenant.logotypUrl}
            alt={`${tenant.firmNamn} — logotyp`}
            className="h-10 w-auto max-w-[160px] object-contain"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-gold/40 bg-gold/5 font-serif text-lg font-bold text-gold"
          >
            {monogram}
          </span>
        )}
        <p className="min-w-0">
          <span className="block truncate font-serif text-lg font-bold leading-tight">
            {tenant.firmNamn}
          </span>
          <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            × AK1A-metodik
          </span>
        </p>
      </div>
      {arDemo && (
        <span className="rounded border border-gold/50 bg-gold/10 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-gold">
          Demo-firma — påhittad (K-B2B:4)
        </span>
      )}
    </div>
  );
}
