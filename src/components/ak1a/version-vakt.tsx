"use client";

import * as React from "react";
import { RefreshCw, X } from "lucide-react";

/**
 * VERSIONSVAKTEN (våg 105) — dödar "stalt app-skal"-felklassen vid roten.
 *
 * Problemet: sajten är en SPA; en flik som lämnas öppen navigerar klientsidigt
 * i all evighet och laddar ALDRIG om. Efter en deploy kör fliken gamla assets
 * (trasig layout, gamla teman) fast produktionen är frisk — exakt den klass
 * kunden såg på /kurser och /admin 2026-09-11 ("samma fel här... helt utan
 * att jag skulle se").
 *
 * Lösningen: klientbunten bärs NEXT_PUBLIC_BYGGE (byggstart); vaktens pollar
 * /api/version (serverns stämpel) var 10:e minut + när fliken blir synlig.
 * Vid skillnad:
 *   - flik I BAKGRUNDEN → location.reload() direkt (ingen ser det, våg 78-
 *     normen "aldrig avbryta ett pågående besök" respekteras — en dold flik
 *     är inget pågående besök)
 *   - SYNlig flik → diskret guldbanner längst ner: "En ny version finns —
 *     Uppdatera". Ingen tvingad omladdning, aldrig.
 */

export function VersionVakt() {
  const [nyFinns, setNyFinns] = React.useState(false);
  const [dold, setDold] = React.useState(false); // kunden stängde bannern

  const kolla = React.useCallback(async () => {
    try {
      const res = await fetch("/api/version", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { bygge?: string };
      const minBygge = process.env.NEXT_PUBLIC_BYGGE;
      if (!minBygge || !data.bygge || data.bygge === "okand") return;
      if (data.bygge === minBygge) {
        setNyFinns(false);
        return;
      }
      // Ny version finns.
      if (document.hidden) {
        location.reload(); // bakgrundsflik: säker, osynlig uppfräschning
        return;
      }
      setNyFinns(true);
    } catch {
      // offline/API-fel — tyst nästa intervall
    }
  }, []);

  React.useEffect(() => {
    // första kontrollen efter 20 s (sidan ska få landa först)
    const forsta = setTimeout(kolla, 20000);
    const intervall = setInterval(kolla, 10 * 60 * 1000);
    const synlig = () => {
      if (document.visibilityState === "visible") kolla();
    };
    document.addEventListener("visibilitychange", synlig);
    return () => {
      clearTimeout(forsta);
      clearInterval(intervall);
      document.removeEventListener("visibilitychange", synlig);
    };
  }, [kolla]);

  if (!nyFinns || dold) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md rounded-xl border border-gold/50 bg-card/95 p-3 shadow-lg backdrop-blur-md sm:inset-x-auto sm:right-4 sm:bottom-4"
    >
      <div className="flex items-center gap-3">
        <RefreshCw className="h-4 w-4 shrink-0 text-gold" aria-hidden />
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-foreground">
          En ny version av sajten finns — uppdatera för senaste fixarna.
        </p>
        <button
          type="button"
          onClick={() => location.reload()}
          className="min-h-[44px] shrink-0 rounded-lg bg-gold px-3 text-xs font-bold text-background"
        >
          Uppdatera
        </button>
        <button
          type="button"
          aria-label="Stäng"
          onClick={() => setDold(true)}
          className="min-h-[44px] min-w-[44px] shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
