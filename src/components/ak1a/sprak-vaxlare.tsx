"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, Globe } from "lucide-react";
import { SPRAK, SPRAK_IDN, spegelSokvag, type SprakId } from "@/lib/sprak";
import { useSprak } from "@/components/ak1a/sprak-leverantor";

/**
 * SPRÅK-VÄXLAREN — diskret SV/EN/AR-knapp i TemaVäxlarens viktorianska stil
 * (rund, guldkant, paper-bakgrund). Jordglob + aktuell kod; klick öppnar en
 * liten tre-radsmeny (flagga + inhemska namn + bock för aktuellt språk).
 *
 * VÅG 51 — SPEGEL-NAVIGATION: om aktuell route har en översatt spegel-version
 * (OVERSATTA_ROUTES i sprak.ts — /en/... och /ar/...) navigerar valet DIT via
 * router.push, så även sidinnehållet byter språk. Annars byts enbart
 * UI-språket (menyer, knappar, ordlista) på klienten.
 *
 * MONTERING:
 *   1. src/components/ak1a/seo-page-shell.tsx — i huvudraden bredvid
 *      <TemaVaxlare />.
 *   2. src/components/ak1a/header.tsx (SPA-headern) — i verktygsraden
 *      bredvid tema-knappen, samma mall: <SprakVaxlare />.
 *   3. src/components/ak1a/mobilmeny.tsx — i lådan, på egen rad under
 *      språk-/temaknapparna.
 *
 * Väljaren i sig äger inget språkstate — SprakLeverantor (rot-layouten)
 * gör jobbet: localStorage "ak1a-sprak-v1", <html lang> + <html dir>.
 */
export function SprakVaxlare() {
  const { sprak, setSprak, t } = useSprak();
  const [oppad, setOppad] = useState(false);
  const behallare = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Klick utanför + Escape stänger — samma etikett som huvudmenyn.
  useEffect(() => {
    if (!oppad) return;
    const klick = (e: MouseEvent) => {
      if (behallare.current && !behallare.current.contains(e.target as Node)) setOppad(false);
    };
    const tang = (e: KeyboardEvent) => e.key === "Escape" && setOppad(false);
    document.addEventListener("mousedown", klick);
    document.addEventListener("keydown", tang);
    return () => {
      document.removeEventListener("mousedown", klick);
      document.removeEventListener("keydown", tang);
    };
  }, [oppad]);

  const valj = (id: SprakId) => {
    setSprak(id); // UI-språket alltid — menyer/knappar byter direkt
    setOppad(false);
    // Spegel-navigation: /medlemskap + EN ⇒ /en/medlemskap (om den finns).
    if (pathname) {
      const spegel = spegelSokvag(pathname, id);
      if (spegel && spegel !== pathname) router.push(spegel);
    }
  };

  return (
    <div ref={behallare} className="relative">
      <button
        onClick={() => setOppad((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={oppad}
        aria-label={t("ui.sprakVaxla")}
        title={t("ui.sprakVaxla")}
        className="flex h-8 items-center justify-center gap-1 rounded-full border border-gold/40 px-2 text-[10px] font-bold tracking-wider text-foreground transition-colors hover:bg-gold/10 max-md:h-[52px] max-md:min-w-[52px]!"
      >
        <Globe className="h-3.5 w-3.5 text-gold" aria-hidden />
        <span>{SPRAK[sprak].kod}</span>
      </button>

      {oppad && (
        <div
          role="menu"
          aria-label={t("ui.sprakNamn")}
          className="absolute right-0 top-10 z-50 w-44 overflow-hidden rounded-xl border border-gold/30 bg-card shadow-2xl"
        >
          <p className="border-b border-gold/20 bg-gold/5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
            {t("ui.sprakNamn")}
          </p>
          {SPRAK_IDN.map((id) => {
            const info = SPRAK[id];
            const aktiv = id === sprak;
            return (
              <button
                key={id}
                role="menuitemradio"
                aria-checked={aktiv}
                onClick={() => valj(id)}
                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors ${
                  aktiv ? "bg-gold/10 font-bold text-foreground" : "text-muted-foreground hover:bg-gold/5 hover:text-foreground"
                }`}
              >
                <span aria-hidden className="text-base">{info.flagga}</span>
                <span className="min-w-0 flex-1">{info.namn}</span>
                {aktiv ? (
                  <Check className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
                ) : (
                  <span className="shrink-0 text-[9px] font-bold tracking-widest text-muted-foreground/60">
                    {info.kod}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
