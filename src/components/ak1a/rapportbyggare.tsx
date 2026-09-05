"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { lasAnalysbank, type BankRad, type BankTyp } from "@/lib/analysbank";
import { niva as raknaNiva } from "@/lib/member-local";
import {
  HORIZONTER,
  KATEGORIER,
  bedomning,
  raknaKategorier,
  raknaTotal,
  type SuperanalysData,
} from "@/lib/superanalys";
import {
  byggDisclaimerRader,
  type TenantConfig,
} from "@/lib/pro/tenant";
import { TenantHeader, useTenant } from "@/components/ak1a/pro/tenant-header";

/**
 * RAPPORTBYGGAREN — redovisningsverkstan (MEGA_PLAN_V3 Fas B, steg 1).
 *
 * Vänligt steg 1: (a) visa analysbanken som valbara rader (typ-ikon +
 * ticker + datum), (b) "Bygg rapport" → formatterad RAPPORT-VY med marin
 * omslagsband (AK1A-signering + datum + elevens nivå), en sektion per vald
 * analys (titel + sammanfattning + nyckeltal ur dataJson som tabular-rader),
 * avslutningsvis "Metodiken bakom" (AKM1/AK1TS/Konfluens ur ekosystem.ts:s
 * termer) och automatiskt disclaimer-block. Utskriftsbar via window.print().
 * (c) Tom-läge lotsar vidare till Superanalysen/Konfluensradarn.
 *
 * Fas 2-koppling: nivå-badge; under nivå 25 visas en generös notis —
 * verkstans dörrar är öppna ändå, den är ju träningen den är.
 *
 * WHITE-LABEL-LAGER (B2B-BESLUT våg 61 steg 2 / K5): valfri `tenant`-prop
 * (Rapportverkstan på /pro/rapporter skickar sin tenant; utan prop löser
 * useTenant() pro-admin-kontraktet — på privata ytor blir avsändaren AK1A,
 * P4: B2B läcker aldrig in i privat-upplevelsen). Med tenant renderas
 * TenantHeader (firma + logotyp-plats + "× AK1A-metodik") I dokumentet och
 * tenantens LÄGG-TILL-juridik efter det MAL-LÅSTA blocket — som bygger på
 * byggDisclaimerRader() ur src/lib/pro/tenant.ts och därmed ALDRIG kan
 * suddas, mjukas eller kortas (mal-låsningstestet i validera-motorer.mjs
 * bevisar samma funktion).
 *
 * Hydration-säker: all localStorage-läsning sker i useEffect bakom `hydrerad`.
 */

// ── Typ-metadata (ikon + etikett per verktyp) ────────────────────────────────

const TYP: Record<BankTyp, { ikon: string; etikett: string }> = {
  superanalys: { ikon: "◆", etikett: "Superanalys" },
  konfluens: { ikon: "◈", etikett: "Konfluens" },
  netnet: { ikon: "◇", etikett: "Net-net" },
  vagfundament: { ikon: "▲▼", etikett: "Vågfundament" },
};

const sv = (n: number) => n.toFixed(1).replace(".", ",");
const pr = (n: number) => String(Math.round(n * 10) / 10).replace(".", ",");

/** camelCase-nyckel → läsbar rubrik ("vardgolv" → "Vardgolv"). */
function rubrik(nyckel: string): string {
  return nyckel
    .replace(/([a-zåäö])([A-ZÅÄÖ])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Nyckeltal ur dataJson som tabular-rader. Superanalyser tolkas med egen
 * logik (totalpoäng, band, kategorisnitt, AK1TS-vågor); övriga verk får en
 * generisk, hederlig projektion av sina primitiva toppnivå-fält.
 */
function nyckeltalFor(rad: BankRad): Array<{ namn: string; varde: string }> {
  let data: unknown;
  try {
    data = JSON.parse(rad.dataJson);
  } catch {
    return [];
  }
  if (typeof data !== "object" || data === null) return [];
  const obj = data as Record<string, unknown>;

  if (rad.typ === "superanalys" && obj.poang && typeof obj.poang === "object") {
    const d = obj as unknown as SuperanalysData;
    const total = raknaTotal(d.poang);
    const ut: Array<{ namn: string; varde: string }> = [
      { namn: "Totalpoäng (max 100)", varde: sv(total) },
      { namn: "Pedagogiskt band", varde: bedomning(total).etikett },
    ];
    const kat = raknaKategorier(d.poang);
    for (const k of KATEGORIER) {
      ut.push({
        namn: `${k.namn} (${Math.round(k.vikt * 100)} % vikt)`,
        varde: `${sv(kat[k.id])} / 5`,
      });
    }
    for (const h of HORIZONTER) {
      const v = d.vagor?.[h.id];
      if (v) ut.push({ namn: `AK1TS · ${h.namn} (${h.spans})`, varde: v });
    }
    return ut;
  }

  // Generisk fallback — konfluens/netnet/vagfundament och framtida verk.
  const ut: Array<{ namn: string; varde: string }> = [];
  for (const [nyckel, varde] of Object.entries(obj)) {
    if (ut.length >= 12) break;
    if (nyckel === "id" || nyckel === "dataJson") continue;
    if (typeof varde === "number" && Number.isFinite(varde)) {
      ut.push({ namn: rubrik(nyckel), varde: pr(varde) });
    } else if (typeof varde === "boolean") {
      ut.push({ namn: rubrik(nyckel), varde: varde ? "Ja" : "Nej" });
    } else if (typeof varde === "string" && varde.length > 0 && varde.length <= 120) {
      ut.push({ namn: rubrik(nyckel), varde });
    }
  }
  return ut;
}

/** Utskrift: endast rapportdokumentet syns — resten av sidan tystas. */
const PRINT_CSS = `
@media print {
  body * { visibility: hidden; }
  #ak1a-rapport-dokument, #ak1a-rapport-dokument * { visibility: visible; }
  #ak1a-rapport-dokument {
    position: absolute; left: 0; top: 0; width: 100%;
    padding: 0 !important; border: none !important; box-shadow: none !important;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
}
`;

// ── Komponenten ──────────────────────────────────────────────────────────────

export function Rapportbyggare({
  tenant,
}: {
  /** Explicit tenant (t.ex. Rapportverkstan på /pro/rapporter) — eller
   *  undefined för useTenant()-lösning (pro-admin-kontraktet; AK1A på privata ytor). */
  tenant?: TenantConfig | null;
} = {}) {
  const [hydrerad, setHydrerad] = useState(false);
  const [rader, setRader] = useState<BankRad[]>([]);
  const [valda, setValda] = useState<Set<string>>(new Set());
  const [niva, setNiva] = useState(1);
  const [rapportSynlig, setRapportSynlig] = useState(false);
  const { tenant: lsTenant } = useTenant();

  useEffect(() => {
    setRader(lasAnalysbank());
    setNiva(raknaNiva());
    setHydrerad(true);
  }, []);

  /** Explicit prop vinner; annars useTenant() (pro-admin-v1 → /pro-demo → null). */
  const aktivTenant = tenant !== undefined ? tenant : lsTenant;
  /** Mal-låst disclaimer + (vaktaget) tenant-tillägg — SAMMA funktion som
   *  mal-låsningstestet i verktyg/validera-motorer.mjs kör mot. */
  const disclaimerRader = useMemo(
    () => byggDisclaimerRader(aktivTenant),
    [aktivTenant]
  );

  const valdaRader = useMemo(
    () => rader.filter((r) => valda.has(r.id)),
    [rader, valda]
  );

  function toggle(id: string) {
    setValda((förra) => {
      const ny = new Set(förra);
      if (ny.has(id)) ny.delete(id);
      else ny.add(id);
      return ny;
    });
  }

  const datumLang = new Date().toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── Rapport-vyn (formatterad, utskriftsbar) ────────────────────────────────
  if (rapportSynlig && valdaRader.length > 0) {
    return (
      <section aria-label="Rapportbyggaren — rapportvy">
        <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => window.print()}
            className="btn-guld-signatur inline-flex min-h-[44px] items-center gap-2 px-6 text-sm"
          >
            Skriv ut / spara som PDF
          </button>
          <button
            onClick={() => setRapportSynlig(false)}
            className="btn-marin inline-flex min-h-[44px] items-center px-5 text-sm"
          >
            Tillbaka till verkstan
          </button>
          <p className="text-xs text-muted-foreground">
            {valdaRader.length} analyser redovisas · nivå {niva}
          </p>
        </div>

        <article
          id="ak1a-rapport-dokument"
          className="gravor-ram mt-6 rounded-sm bg-card p-6 sm:p-10"
        >
          {/* WHITE-LABEL — avsändarbandet I dokumentet (utskriftsenheterna
              följer med): firma + logotyp-plats + "× AK1A-metodik". Utan
              tenant är avsändaren AK1A och bandet renderas ej. */}
          {aktivTenant && <TenantHeader tenant={aktivTenant} />}

          {/* Marin omslagsband — certifikat-känslan */}
          <header className="marin-panel relative overflow-hidden rounded-sm px-6 py-10 text-center sm:px-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#E8C766]">
              AK1A Research Lab · Fas 2
            </p>
            <h2 className="mt-4 font-serif text-3xl font-bold sm:text-4xl">
              Redovisningsrapport
            </h2>
            <div className="hjarlinje mx-auto mt-5 w-44" />
            <p className="mt-5 text-sm opacity-80">{datumLang}</p>
            <p className="mt-1 text-sm text-[#E8C766]">
              Elevens nivå: {niva} · {valdaRader.length} analyser redovisas
            </p>
          </header>

          {/* Sektion per vald analys */}
          {valdaRader.map((rad, i) => {
            const nyckel = nyckeltalFor(rad);
            return (
              <section key={rad.id} className="mt-8 break-inside-avoid print:mt-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-serif text-xl font-bold">
                    {i + 1}. {rad.titel}
                  </h3>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    {TYP[rad.typ].etikett}
                    {rad.ticker ? ` · ${rad.ticker.toUpperCase()}` : ""} · {rad.datum}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {rad.sammanfattning}
                </p>
                {nyckel.length > 0 && (
                  <table className="mt-4 w-full text-sm">
                    <tbody>
                      {nyckel.map((n) => (
                        <tr key={n.namn} className="border-b border-border/70">
                          <th
                            scope="row"
                            className="py-2 pr-4 text-left font-normal text-muted-foreground"
                          >
                            {n.namn}
                          </th>
                          <td className="tabular py-2 text-right font-semibold">
                            {n.varde}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            );
          })}

          {/* Metodiken bakom — ekosystem.ts:s termer, kort och klart */}
          <section className="mt-10">
            <h3 className="font-serif text-xl font-bold">Metodiken bakom</h3>
            <div className="hjarlinje mt-3" />
            <dl className="mt-4 space-y-4 text-sm leading-relaxed">
              <div>
                <dt className="font-semibold">AKM1 — Institutionell Fundamentalmodell</dt>
                <dd className="mt-1 text-muted-foreground">
                  20 fundamentalvariabler (V01–V20) i 7 kategorier — Tillväxt, Värdering,
                  Lönsamhet, Stabilitet, Moat, Katalysator och Risk. Varje variabel
                  poängsätts 0–5 och sammanvägs till max 100 poäng.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">AK1TS — Teknisk Våganalys</dt>
                <dd className="mt-1 text-muted-foreground">
                  5 teorier (Elliott Wave, Fibonacci, GANN, Lucas, Volym) × 5 horisonter
                  (Mikro, Kort, Medellång, Lång, Mega) × 4 dimensioner (Våg, Pris, Tid,
                  Brytpunkt) = 100 datapunkter.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Konfluens</dt>
                <dd className="mt-1 text-muted-foreground">
                  Minst 3 av 5 teorier måste peka samma håll innan en slutsats får väga.
                </dd>
              </div>
            </dl>
          </section>

          {/* Disclaimers + signatur — automatiskt, alltid */}
          <footer className="mt-10">
            <div className="hjarlinje" />
            {/* MAL-LÅST BLOCK (b4:s tre lager — B2B-BESLUT K5/FORBUD 6):
                byggs UR byggDisclaimerRader() i src/lib/pro/tenant.ts och kan
                ALDRIG stängas av, varken av tenant-konfiguration eller prop —
                kärnan är en frusen konstant som alltid renderas först. Tenantens
                tillägg (om nyckeln finns OCH vakten godkänner den) hamnar EFTER. */}
            <div className="mt-4 space-y-2 text-xs leading-relaxed text-muted-foreground">
              {disclaimerRader.map((rad, i) => (
                <p key={i}>{rad}</p>
              ))}
            </div>
            {/* Utan tenant är avsändaren AK1A och elev-raden berättar var
                underlaget bor — white-label-ytan (tenant) har sin egen juridik
                i tillägget ovan i stället. */}
            {!aktivTenant && (
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Detta är en pedagogisk analys från AK1A Research Lab — inte
                investeringsråd. Rekommendationsbanden (&quot;Aktör att följa&quot;,
                &quot;Studera vidare&quot;, &quot;Skjut inte&quot;) är läranderedskap och
                ska aldrig läsas som köp- eller säljuppmaningar. Underlaget är elevens
                eget arbete och allt material sparas lokalt i elevens webbläsare.
              </p>
            )}
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-gold">
              Fas 2-verktyg — byggt med AK1A Research Lab
            </p>
          </footer>
        </article>
      </section>
    );
  }

  // ── Verkstan: lista + val + bygg-knapp ─────────────────────────────────────
  return (
    <section aria-label="Rapportbyggaren">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold">Din analysbank</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Elevens samlade verk — kryssa för det du vill redovisa, så binder
            verkstans samman det till en formatterad rapport.
          </p>
        </div>
        <span className="inline-flex min-h-[44px] items-center gap-2 rounded-sm border border-gold/40 bg-gold/5 px-4 font-mono text-xs font-bold uppercase tracking-wider text-gold">
          Nivå {niva}
        </span>
      </div>

      {/* Fas 2-koppling — generös notis under nivå 25 */}
      {hydrerad && niva < 25 && (
        <div className="mt-4 rounded-sm border border-gold/30 bg-gold/5 p-4">
          <p className="guld-djup-text text-sm font-semibold">
            Redovisningsverkstan öppnas helt i Fas 2 — nivå 25.
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Du är på nivå {niva} — och ändå är dörren redan öppen. Bygg gärna
            rapporter nu också: varje rapport du övar på idag gör Fas 2:s
            redovisningar skickligare.
          </p>
        </div>
      )}

      {!hydrerad ? (
        <p className="mt-8 text-sm text-muted-foreground">Läser din analysbank…</p>
      ) : rader.length === 0 ? (
        /* Tom-läge — pedagogik-ton, lotsar vidare */
        <div className="gravor-ram mt-8 rounded-sm bg-card p-8 text-center sm:p-10">
          <p className="font-serif text-2xl font-bold">Analysbanken är tom — ännu.</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Skapa din första analys via Superanalysen/Konfluensradarn — den landar
            här automatiskt, redo att bli din första redovisningsrapport.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/superanalys"
              className="btn-guld-signatur inline-flex min-h-[44px] items-center px-5 text-sm"
            >
              Till Superanalysen
            </Link>
            <Link
              href="/konfluens"
              className="btn-marin inline-flex min-h-[44px] items-center px-5 text-sm"
            >
              Till Konfluensradarn
            </Link>
          </div>
        </div>
      ) : (
        <>
          <ul className="mt-6 space-y-3">
            {rader.map((rad) => {
              const markerad = valda.has(rad.id);
              return (
                <li key={rad.id}>
                  <label
                    className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-sm border px-4 py-3 transition-colors ${
                      markerad
                        ? "border-gold/60 bg-gold/5"
                        : "border-border hover:border-gold/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={markerad}
                      onChange={() => toggle(rad.id)}
                      className="h-5 w-5 shrink-0 accent-gold"
                      aria-label={`Välj ${rad.titel}`}
                    />
                    <span
                      aria-hidden
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-gold/30 bg-gold/5 font-serif text-sm text-gold"
                    >
                      {TYP[rad.typ].ikon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-serif font-semibold">{rad.titel}</span>
                        {rad.ticker && (
                          <span className="font-mono text-xs uppercase text-muted-foreground">
                            {rad.ticker}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">
                        {rad.sammanfattning}
                      </span>
                    </span>
                    <span className="tabular shrink-0 font-mono text-xs text-muted-foreground">
                      {rad.datum}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setRapportSynlig(true)}
              disabled={valdaRader.length === 0}
              className="btn-guld-signatur inline-flex min-h-[44px] items-center gap-2 px-6 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Bygg rapport{valdaRader.length > 0 ? ` (${valdaRader.length})` : ""}
            </button>
            <p className="text-xs text-muted-foreground">
              {valdaRader.length === 0
                ? "Välj minst en analys i banken ovan."
                : `Valt ${valdaRader.length} av ${rader.length} verk.`}
            </p>
          </div>
        </>
      )}
    </section>
  );
}
