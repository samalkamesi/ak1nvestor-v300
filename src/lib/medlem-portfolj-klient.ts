/**
 * MEDLEM-PORTFÖLJ-KLIENT — webbläsarens smala väg till /api/medlem/portfolj
 * (VÅG 119, PIPELINE-KO P1). Samma stil som medlem-bevakning-klient.ts:
 * korta funktioner, tydliga typer, ALDRIG kast — fel blir tomma svar som
 * komponenterna renderar tyst (eko-mönstret: motstånd ⇒ tyst viloläge,
 * aldrig kraschande dashboard).
 *
 * Portföljen är UTBILDNINGENS studielista: antal + ev. inprisad kurs är
 * studieunderlag — ALDRIG underlag för värde, avkastning eller råd.
 */

/** En rad i studielistan: bolaget + frivilligt antal + inprissatt kurs. */
export type PortfoljHoldings = { ticker: string; antal: number | null; kurs: number | null };

/** GET-svarets form: gäst ⇒ {inloggad:false}, medlem ⇒ holdings + legacy-flagga. */
export type PortfoljSvar =
  | { inloggad: false }
  | { inloggad: true; holdings: PortfoljHoldings[]; legacyImporterad: boolean };

/** Städa en rad från nätverket till känd form (ticker krävs; antal/kurs ⇒ null). */
function stadaHoldings(rad: unknown): PortfoljHoldings | null {
  if (rad === null || typeof rad !== "object") return null;
  const r = rad as Partial<PortfoljHoldings>;
  if (typeof r.ticker !== "string" || r.ticker === "") return null;
  return {
    ticker: r.ticker,
    antal: typeof r.antal === "number" ? r.antal : null,
    kurs: typeof r.kurs === "number" ? r.kurs : null,
  };
}

/** Läs portföljen (sessionen avgör). Fel ⇒ gästsvar — komponenten tystnar. */
export async function lasPortfolj(): Promise<PortfoljSvar> {
  try {
    const res = await fetch("/api/medlem/portfolj", {
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) return { inloggad: false };
    const kropp = (await res.json()) as Partial<PortfoljSvar>;
    if (kropp && kropp.inloggad === true && Array.isArray(kropp.holdings)) {
      return {
        inloggad: true,
        holdings: kropp.holdings
          .map(stadaHoldings)
          .filter((h): h is PortfoljHoldings => h !== null),
        legacyImporterad: kropp.legacyImporterad === true,
      };
    }
    return { inloggad: false };
  } catch {
    return { inloggad: false };
  }
}

/** Skrivresultatet: ok, eller serverns feltext (409 = portföljen full). */
export type PortfoljSkrivning = { ok: true; pa: boolean } | { ok: false; fel: string; status: number };

/** Slå på/av holding för EN ticker (POST {ticker, pa, antal, kurs}). */
export async function skrivPortfolj(
  ticker: string,
  pa: boolean,
  antal?: number | null,
  kurs?: number | null,
): Promise<PortfoljSkrivning> {
  // undefined-städning: endast äkta tal skickas, resten ⇒ null (senaste-vinner på servern).
  const talEllerNull = (v?: number | null): number | null =>
    typeof v === "number" && Number.isFinite(v) ? v : null;
  try {
    const res = await fetch("/api/medlem/portfolj", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker, pa, antal: talEllerNull(antal), kurs: talEllerNull(kurs) }),
      signal: AbortSignal.timeout(10_000),
    });
    const kropp = (await res.json().catch(() => ({}))) as { fel?: string };
    if (!res.ok) {
      return { ok: false, fel: kropp.fel ?? "Portföljen kunde inte sparas just nu.", status: res.status };
    }
    return { ok: true, pa };
  } catch {
    return { ok: false, fel: "Nätverket svarade inte — försök igen om en stund.", status: 0 };
  }
}
