"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { lasBevakning, skrivBevakning } from "@/lib/medlem-bevakning-klient";

/**
 * BEVAKA-KNAPP (Våg 104, STYRELSE-PORTAL-MEGA.md) — analysdetaljsidans dörr
 * in i "Din bevakning" på Min Sida. Självbärande klientkomponent (sidan är
 * force-static): hämtar sessionsläget + bevakningen vid mount, slår på/av
 * via /api/medlem/bevakning, gäst ⇒ inloggningslänk. TEMA-stil här (sidan
 * bär temats card/gold — marin-familjen gäller bara portal-panelerna).
 *
 * Pedagogisk plattform — inte investeringsråd: knappen bevakar ANALYSEN
 * ("följ bolagets analys"), aldrig en position.
 */
export function BevakaKnapp({ ticker, company }: { ticker: string; company: string }) {
  const [lage, setLage] = useState<"start" | "gast" | "av" | "pa">("start");
  const [felText, setFelText] = useState("");

  useEffect(() => {
    let aktiv = true;
    lasBevakning()
      .then((svar) => {
        if (!aktiv) return;
        if (!svar.inloggad) {
          setLage("gast");
        } else {
          setLage(svar.tickers.includes(ticker) ? "pa" : "av");
        }
      })
      .catch(() => {
        if (aktiv) setLage("gast");
      });
    return () => {
      aktiv = false;
    };
  }, [ticker]);

  const toggl = async () => {
    const nyPa = lage !== "pa";
    const forra = lage;
    setLage(nyPa ? "pa" : "av");
    setFelText("");
    const svar = await skrivBevakning(ticker, nyPa);
    if (!svar.ok) {
      setLage(forra);
      setFelText(svar.fel);
    }
  };

  if (lage === "gast") {
    return (
      <Link
        href="/logga-in"
        className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-md border border-gold/50 px-4 py-2 text-sm font-semibold hover:bg-gold/10"
      >
        <span aria-hidden="true">☆</span> Bevaka {company} — logga in
      </Link>
    );
  }

  const pa = lage === "pa";
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={toggl}
        disabled={lage === "start"}
        aria-pressed={pa}
        aria-label={pa ? `Sluta bevaka ${company} (${ticker})` : `Bevaka ${company} (${ticker})`}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-gold/50 px-4 py-2 text-sm font-semibold hover:bg-gold/10 disabled:opacity-60"
      >
        <span aria-hidden="true" className={pa ? "text-gold" : ""}>
          {pa ? "★" : "☆"}
        </span>
        {pa ? `Bevakar ${company}` : `Bevaka ${company}`}
        {lage === "start" ? " …" : ""}
      </button>
      <p aria-live="polite" className="sr-only">
        {pa ? `${company} bevakas nu på Min Sida.` : `${company} bevakas inte längre.`}
      </p>
      {felText !== "" && (
        <p role="alert" className="mt-2 text-xs font-semibold text-gold">
          {felText}
        </p>
      )}
    </div>
  );
}
