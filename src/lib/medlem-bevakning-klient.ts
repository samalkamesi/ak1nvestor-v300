/**
 * MEDLEM-BEVAKNING-KLIENT — webbläsarens smala väg till /api/medlem/bevakning
 * (VÅG 104). Samma stil som larvag-klient.ts: korta funktioner, tydliga typer,
 * ALDRIG kast — fel blir tomma svar som komponenterna renderar tyst (eko-
 * mönstret: motstånd ⇒ tyst viloläge, aldrig kraschande dashboard).
 */

/** GET-svarets form: gäst ⇒ {inloggad:false}, medlem ⇒ tickers. */
export type BevakningSvar = { inloggad: false } | { inloggad: true; tickers: string[] };

/** Läs bevakningen (sessionen avgör). Fel ⇒ gästsvar — komponenten tystnar. */
export async function lasBevakning(): Promise<BevakningSvar> {
  try {
    const res = await fetch("/api/medlem/bevakning", {
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) return { inloggad: false };
    const kropp = (await res.json()) as Partial<BevakningSvar>;
    if (kropp && kropp.inloggad === true && Array.isArray(kropp.tickers)) {
      return { inloggad: true, tickers: kropp.tickers.filter((t) => typeof t === "string") };
    }
    return { inloggad: false };
  } catch {
    return { inloggad: false };
  }
}

/** Skrivresultatet: ok, eller serverns feltext (409 = listan full). */
export type BevakningSkrivning = { ok: true; pa: boolean } | { ok: false; fel: string; status: number };

/** Slå på/av bevakning för EN ticker (POST {ticker, pa}). */
export async function skrivBevakning(ticker: string, pa: boolean): Promise<BevakningSkrivning> {
  try {
    const res = await fetch("/api/medlem/bevakning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker, pa }),
      signal: AbortSignal.timeout(10_000),
    });
    const kropp = (await res.json().catch(() => ({}))) as { fel?: string };
    if (!res.ok) {
      return { ok: false, fel: kropp.fel ?? "Bevakningen kunde inte sparas just nu.", status: res.status };
    }
    return { ok: true, pa };
  } catch {
    return { ok: false, fel: "Nätverket svarade inte — försök igen om en stund.", status: 0 };
  }
}
