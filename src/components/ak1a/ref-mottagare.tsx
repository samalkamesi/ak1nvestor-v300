"use client";

import { useEffect, useRef, useState } from "react";
import { saneraRefKod, sparaRefPending } from "@/lib/referral";

/**
 * REF-MOTTAGARE — m10 steg 1: startsidans diskreta mottagar-rad (m10-
 * referral.md §3.3). Läser ?ref= EN gång (klient-side), visar EN stillsam rad
 * och tvättar koden ur adressfältet (history.replaceState — J6/ePrivacy: en
 * URL-parameter är ingen cookie, men den ska ALDRIG läcka vidare när
 * mottagaren delar länken själv).
 *
 * GDPR/FOMO-regler som gäller denna rad (§0 + §3):
 *   - INGET namn på tipsgivaren (ingen social graf mot mottagaren).
 *   - INGEN annan personalisering, ingen rabatt-klocka, ingen "din vän
 *     väntar" — m10 §3:s förbudslista gäller ordagrant.
 *   - Raden försvinner vid nästa klick (engångs-listener på document).
 *   - Koden hålls i sessionStorage TILLS registreringen konsumerar den
 *     (LoggaIn läser den och kastar fältet efter matchingen — AC2).
 *
 * Läsningen sker i useEffect via window.location (inte useSearchParams):
 * helt hydreringssäkert på en statiskt renderad startsida, och "EN gång"
 * garanteras av läs-locket nedan (React StrictMode kör effekter dubbelt).
 */
export function RefMottagare() {
  const [synlig, setSynlig] = useState(false);
  const lastLock = useRef(false);

  useEffect(() => {
    if (lastLock.current) return; // EN läsning per sidvisning — kontraktet
    lastLock.current = true;

    const params = new URLSearchParams(window.location.search);
    const rå = params.get("ref");

    // Tvätta ur URL:en OAVSETT om koden var giltig — ett ref-fält ska aldrig
    // följa med när mottagaren kopierar/delar adressfältet (J6).
    if (rå !== null) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    const kod = saneraRefKod(rå);
    if (!kod) return; // ogiltig/frånvarande kod ⇒ exakt vanlig startsida (AC4)
    sparaRefPending(kod);
    setSynlig(true);
  }, []);

  // Raden försvinner vid nästa klick var som helst på sidan (§3.3).
  useEffect(() => {
    if (!synlig) return;
    const dolj = () => setSynlig(false);
    document.addEventListener("click", dolj, { once: true });
    return () => document.removeEventListener("click", dolj);
  }, [synlig]);

  if (!synlig) return null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-4">
      <p className="rounded-lg border border-gold/20 bg-gold/5 px-4 py-2 text-center text-xs leading-relaxed text-muted-foreground">
        Du kom via en väns tips — gå med gratis, utan krav.
      </p>
    </div>
  );
}
