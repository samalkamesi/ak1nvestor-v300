/**
 * MAL-LÅST METOD-/RISK-SIDA (VÅG 61 bygg-4 — B2B-BESLUT §4d, K5, FORBUD 6).
 *
 * TEXTKÄLLA ÄR BYGG-2:S TENANT-LAGER (landat): rader och tilläggs-vakt kommer
 * från byggDisclaimerRader() i src/lib/pro/tenant.ts — MAL_LAST_RADER först
 * (alltid, oavsett tenant), därefter tenantens vaktagade LÄGG-TILL-juridik.
 * Det finns ingen kodväg här som kortar, mjukar eller suddar kärnan; samma
 * tenant ⇒ samma rader (P1-determinism). Svetestet som bevisar mal-låsningen
 * kör på SAMMA funktion — denna komponent renderar bara dess utdata.
 *
 * Dokumentets EGEN data-t.o.m.-rad (lager 3:s konkretisering) binds per
 * dokument: underlagets datering, vad som var osatt, regim-/läge-radens
 * formulering — "dokumentet tillför inget eget, senare datum" (MAL_LAST_RADER
 * lager 3, ordagrant).
 *
 * Ren presentational component (inga hooks, inget "use client" behövs) —
 * kan renderas i server- och klientträd. Innehåller ALDRIG signalverb
 * (FORBUD 5). Pedagogisk forskning — ALDRIG investeringsrådgivning (2007:528).
 */

import { byggDisclaimerRader, type TenantConfig } from "@/lib/pro/tenant";

/**
 * Den mal-låsta metod-/risk-sidan — renderas som dokumentets sista sektion i
 * varje PRO-utskrift (mötespaket, analys, portföljöversikt). `tenant` styr
 * ENDAST det vaktagade tillägget — aldrig kärnraderna (K5).
 */
export function MalLastSida({
  tenant,
  underlagsdatum,
  osattText,
  forskningsText,
}: {
  /** Aktiv tenant (useTenant) — tillägget renderas EFTER de mal-låsta raderna. */
  tenant?: TenantConfig | null;
  /** Underlagets eget datum (t.ex. korstabellens skapad) — aldrig "idag". */
  underlagsdatum: string | null;
  /** Vad som var osatt i underlaget (dokumentets egen ärliga rad). */
  osattText: string;
  /** Regim-/forskningsläge-radens datering och formulering. */
  forskningsText: string;
}) {
  const rader = byggDisclaimerRader(tenant);
  /** Kärnans längd — rader därefter är tenantens (vaktagade) tillägg. */
  const karnaLangd = byggDisclaimerRader(null).length;

  return (
    <section
      data-mal-last-sida=""
      aria-label="Mal-låst metod- och risksida"
      className="mt-8 break-inside-avoid border-t-2 border-gold/50 pt-4"
    >
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
        Mal-låst sida — kan ej redigeras bort av white-label
      </p>

      {/* Kärnan + (vaktaget) tillägg — byggDisclaimerRader():s exakta ordning. */}
      <ul className="mt-3 list-disc space-y-2 pl-4">
        {rader.map((rad, i) => (
          <li
            key={i}
            className={
              i < karnaLangd
                ? "text-xs leading-relaxed text-muted-foreground"
                : "border-t border-gold/25 pt-2 text-xs leading-relaxed text-muted-foreground"
            }
          >
            {rad}
          </li>
        ))}
      </ul>

      {/* Dokumentets egen data-t.o.m.-rad — lager 3:s konkretisering per dokument. */}
      <p className="mt-3 border-t border-gold/25 pt-2 text-[11px] leading-relaxed">
        <strong className="font-semibold">Detta dokuments data:</strong>{" "}
        underlag t.o.m. {underlagsdatum ?? "datum saknas i underlaget"}. {osattText}{" "}
        {forskningsText}
      </p>
    </section>
  );
}
