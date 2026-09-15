"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Cookie-samtycke enligt lag (2022:482) om elektronisk kommunikation,
 * 6 kap. 19–20 §§: samtycke INNAN icke-nödvändiga cookies/localStorage.
 * Valet sparas i localStorage "ak1a-cookie-samtycke" och kan ändras
 * via ?cookies=1 (länkat från footern och cookiepolicyn).
 */

const NYCKEL = "ak1a-cookie-samtycke";

export type CookieSamtycke = {
  version: 1;
  nodvandiga: true;
  analys: boolean;
  preferenser: boolean;
  datum: string;
};

export function lasCookieSamtycke(): CookieSamtycke | null {
  if (typeof window === "undefined") return null;
  try {
    const rå = window.localStorage.getItem(NYCKEL);
    return rå ? (JSON.parse(rå) as CookieSamtycke) : null;
  } catch {
    return null;
  }
}

/** För framtida gating av tracern: har användaren samtyckt till analys? */
export function harCookieSamtycke(kategori: "analys" | "preferenser"): boolean {
  const s = lasCookieSamtycke();
  if (!s) return false;
  return kategori === "analys" ? s.analys : s.preferenser;
}

function spara(analys: boolean, preferenser: boolean) {
  const val: CookieSamtycke = {
    version: 1,
    nodvandiga: true,
    analys,
    preferenser,
    datum: new Date().toISOString(),
  };
  window.localStorage.setItem(NYCKEL, JSON.stringify(val));
}

export function CookieConsent() {
  const [synlig, setSynlig] = useState(false);
  const [oppnaInstallningar, setOppnaInstallningar] = useState(false);
  const [analys, setAnalys] = useState(true);
  const [preferenser, setPreferenser] = useState(true);

  useEffect(() => {
    // hydrate-safe: rendera först efter mount; visa om inget val sparat
    // eller om ?cookies=1 efterfrågar ändring
    const param = new URLSearchParams(window.location.search).get("cookies");
    if (!lasCookieSamtycke() || param === "1") setSynlig(true);
  }, []);

  if (!synlig) return null;

  const valdOchStang = (a: boolean, p: boolean) => {
    spara(a, p);
    setSynlig(false);
    setOppnaInstallningar(false);
    // rensa ?cookies=1 ur URL:n utan omladdning
    if (window.location.search.includes("cookies=")) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie-inställningar"
      className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2"
    >
      <div className="marin-panel mx-auto max-w-3xl rounded-2xl border border-gold/40 p-4 shadow-2xl sm:p-5">
        <div className="flex items-start gap-3">
          <span aria-hidden className="text-xl">🍪</span>
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-base font-bold text-[#E8C766]">
              Vi använder cookies — du bestämmer
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[#EDE6D6]/85">
              Nödvändiga gör att tjänsten fungerar (inloggning, kursprogress). Analys hjälper
              Förståelse-Först-assistenten anpassa din utbildning. Läs mer i{" "}
              <Link href="/cookiepolicy" className="underline hover:text-[#E8C766]">
                cookiepolicyn
              </Link>{" "}
              och{" "}
              <Link href="/privacy-policy" className="underline hover:text-[#E8C766]">
                integritetspolicyn
              </Link>
              . Hela dataregistret — vad, varför, rättslig grund och dina
              rättigheter, enligt GDPR artikel 13 — finns på{" "}
              <Link href="/transparens" className="underline hover:text-[#E8C766]">
                Transparens &amp; GDPR
              </Link>
              .
            </p>

            {oppnaInstallningar && (
              <div className="mt-3 space-y-2 rounded-xl border border-gold/25 bg-[#0B1626]/60 p-3">
                <div className="flex items-start justify-between gap-3">
                  <label htmlFor="ck-nod" className="text-xs text-[#EDE6D6]">
                    <strong className="block">Nödvändiga</strong>
                    Inloggning, säkerhet, kursprogress. Alltid aktiva.
                  </label>
                  <input id="ck-nod" type="checkbox" checked disabled className="mt-1 accent-[#785c13]" />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <label htmlFor="ck-analys" className="text-xs text-[#EDE6D6]">
                    <strong className="block">Analys &amp; anpassning</strong>
                    Beteendetracer (scroll, tid, intresseprofil) — endast för din utbildning.
                  </label>
                  <input
                    id="ck-analys"
                    type="checkbox"
                    checked={analys}
                    onChange={(e) => setAnalys(e.target.checked)}
                    className="mt-1 accent-[#785c13]"
                  />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <label htmlFor="ck-pref" className="text-xs text-[#EDE6D6]">
                    <strong className="block">Preferenser</strong>
                    UI-val och senast besökta sidor.
                  </label>
                  <input
                    id="ck-pref"
                    type="checkbox"
                    checked={preferenser}
                    onChange={(e) => setPreferenser(e.target.checked)}
                    className="mt-1 accent-[#785c13]"
                  />
                </div>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => valdOchStang(true, true)}
                className="btn-marin px-3 py-2 text-xs max-md:min-h-[52px]!"
              >
                Godkänn alla
              </button>
              {oppnaInstallningar ? (
                <button
                  onClick={() => valdOchStang(analys, preferenser)}
                  className="rounded-lg border border-gold/50 px-3 py-2 text-xs font-semibold text-[#E8C766] hover:bg-gold/10 max-md:min-h-[52px]!"
                >
                  Spara mitt val
                </button>
              ) : (
                <button
                  onClick={() => setOppnaInstallningar(true)}
                  className="rounded-lg border border-gold/50 px-3 py-2 text-xs font-semibold text-[#E8C766] hover:bg-gold/10 max-md:min-h-[52px]!"
                >
                  Inställningar
                </button>
              )}
              <button
                onClick={() => valdOchStang(false, false)}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-[#EDE6D6]/75 underline hover:text-[#EDE6D6] max-md:min-h-[52px]!"
              >
                Endast nödvändiga
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
