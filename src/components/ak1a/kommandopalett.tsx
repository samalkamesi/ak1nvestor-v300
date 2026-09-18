"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { sokIIndex, type SokPost } from "@/lib/sokindex";
import Image from "next/image";
import { SIFFROR } from "@/lib/siffror";
import { besok, registreraBesok, titelFranSida } from "@/lib/navigationsminne";
import { GAST_KONTEXT, lasMenyKontext, type MenyKontext } from "@/lib/meny-register";
import { useSprak } from "@/components/ak1a/sprak-leverantor";

/**
 * KOMMANDOPALETT — ⌘K / Ctrl+K.
 * Söker alla sidor, verktyg och hela kursbiblioteket. Visar senast besökta
 * när fältet är tomt. Registrerar automatiskt navigation (mönsterigenkänning).
 * Öppnas även via window-event "ak1a:oppna-sok".
 *
 * 2026-09-03: datakällan är meny-registret via sokindex — publik-filtret
 * gäller även här (medlem/fas/admin-ytor bara med behörighet).
 */

const KATEGYRIKON: Record<string, string> = {
  Sida: "◇",
  Verktyg: "◆",
  Kurs: "📖",
  Träning: "⚡",
};

export function Kommandopalett() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, tText } = useSprak(); // våg 51: titlar/kategorier/UI byter språk
  const [oppad, setOppad] = useState(false);
  const [fraga, setFraga] = useState("");
  const [resultat, setResultat] = useState<SokPost[]>([]);
  const [markerad, setMarkerad] = useState(0);
  const [laddar, setLaddar] = useState(false);
  // Behörighetskontext (registrets publik-filter) — SSR-säkert gast från start.
  const [kontext, setKontext] = useState<MenyKontext>(GAST_KONTEXT);
  const senaste = useRef<Array<{ sida: string; titel: string }>>([]);
  const inmatning = useRef<HTMLInputElement>(null);

  // — automatisk besöksregistrering: paletten är monterad på alla sidor —
  useEffect(() => {
    if (pathname) registreraBesok(pathname, titelFranSida(pathname));
  }, [pathname]);

  // — öppna/stäng —
  useEffect(() => {
    const tang = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOppad((o) => !o);
      }
      if (e.key === "Escape") setOppad(false);
      if (e.key === "/" && !oppad) {
        const el = document.activeElement;
        const iTextfalt = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el as HTMLElement)?.isContentEditable;
        if (!iTextfalt) {
          e.preventDefault();
          setOppad(true);
        }
      }
    };
    const event = () => setOppad(true);
    document.addEventListener("keydown", tang);
    window.addEventListener("ak1a:oppna-sok", event);
    return () => {
      document.removeEventListener("keydown", tang);
      window.removeEventListener("ak1a:oppna-sok", event);
    };
  }, [oppad]);

  // — fokus + scroll-lås —
  useEffect(() => {
    if (oppad) {
      inmatning.current?.focus();
      document.body.style.overflow = "hidden";
      setKontext(lasMenyKontext());
      senaste.current = besok().slice(0, 5).map((b) => ({ sida: b.sida, titel: b.titel }));
    } else {
      document.body.style.overflow = "";
      setFraga("");
      setMarkerad(0);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [oppad]);

  // — sök (debounce 120 ms) —
  useEffect(() => {
    if (!oppad) return;
    let aktiv = true;
    setLaddar(true);
    const t = setTimeout(async () => {
      const r = await sokIIndex(fraga, 12, kontext);
      if (aktiv) {
        setResultat(r);
        setMarkerad(0);
        setLaddar(false);
      }
    }, 120);
    return () => {
      aktiv = false;
      clearTimeout(t);
    };
  }, [fraga, oppad, kontext]);

  // — tangentnavigering i resultatan —
  useEffect(() => {
    if (!oppad) return;
    const tang = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMarkerad((m) => Math.min(m + 1, resultat.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMarkerad((m) => Math.max(m - 1, 0));
      }
      if (e.key === "Enter" && resultat[markerad]) {
        e.preventDefault();
        valj(resultat[markerad]);
      }
    };
    document.addEventListener("keydown", tang);
    return () => document.removeEventListener("keydown", tang);
  }, [oppad, resultat, markerad]);

  function valj(post: SokPost) {
    setOppad(false);
    router.push(post.lank);
  }

  const visaSenaste = !fraga.trim() && senaste.current.length > 0;

  if (!oppad) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label={t("cta.sok")}>
      {/* backdrop */}
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setOppad(false)} />

      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-gold/40 bg-card shadow-2xl">
        {/* rubrikrad — institutionell marin signatur */}
        <div className="marin-panel flex items-center justify-between border-b border-gold/30 px-4 py-2">
          <span className="font-serif text-xs font-bold tracking-widest text-[#E8C766]">
            ⌘ {t("ui.kommandocentralen")}
          </span>
          <span className="text-[10px] text-[#EDE6D6]/70">{t("ui.palettTips")}</span>
        </div>

        {/* sökfält */}
        <div className="flex items-center gap-3 border-b border-gold/15 px-4 py-3">
          <span className="text-gold">🔎</span>
          <input
            ref={inmatning}
            value={fraga}
            onChange={(e) => setFraga(e.target.value)}
            placeholder={t("ui.sokPlats")}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            aria-label={t("cta.sok")}
          />
          {laddar && <span className="text-[10px] text-muted-foreground">…</span>}
        </div>

        {/* senast besökta */}
        {visaSenaste && (
          <div className="border-b border-gold/10 px-2 py-2">
            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t("ui.senastBesokta")}
            </div>
            {senaste.current.map((b) => (
              <button
                key={b.sida}
                onClick={() => valj({ titel: b.titel, lank: b.sida, kategori: "Sida", ikon: "🕘" })}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-gold/10"
              >
                <span className="text-sm">🕘</span>
                <span className="truncate text-xs text-foreground">{tText(b.titel)}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">{b.sida}</span>
              </button>
            ))}
          </div>
        )}

        {/* resultat */}
        <div className="max-h-[46vh] overflow-y-auto px-2 py-2">
          {resultat.length === 0 && !laddar && (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              {t("ui.ingaTraffar", { fraga })}
            </div>
          )}
          {resultat.map((r, i) => (
            <button
              key={r.lank + r.titel}
              onClick={() => valj(r)}
              onMouseEnter={() => setMarkerad(i)}
              className={`flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left ${
                i === markerad ? "bg-gold/15 ring-1 ring-gold/40" : "hover:bg-gold/10"
              }`}
            >
              <span className="text-base">{r.ikon}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-foreground">{tText(r.titel)}</span>
                {r.beskrivning && (
                  <span className="block truncate text-[10px] leading-tight text-muted-foreground">{tText(r.beskrivning)}</span>
                )}
              </span>
              <span className="shrink-0 rounded border border-gold/25 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gold">
                {KATEGYRIKON[r.kategori]} {tText(r.kategori)}
              </span>
            </button>
          ))}
        </div>

        {/* bottentrad */}
        <div className="flex items-center justify-between border-t border-gold/20 bg-gold/5 px-4 py-1.5 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            {/* Logomark inline (o76): importerades VarumarkesLogo-modulen
                här höll Turbopack den kvar i palett-chunken, och React
                emitterade då hela klumpen (~17,7 KiB, bl.a. navigationsminnet
                och streak/badges-koden) som script-tagg i flighten på ALLA
                SeoPageShell-sidor — @~240 ms, mitt i LCP-fönstret, trots
                PalettVaktens 8 s-defer (o61 §6.1:s öppna rest). Inline-marken
                = samma bild och klasser som VarumarkesLogo sm/medText={false},
                men utan den delade modulen i grafen. */}
            <span className="flex scale-[0.6] origin-left">
              <span
                aria-hidden
                className="relative block shrink-0 overflow-hidden bg-[#FDFBF7] ring-1 ring-[#0E1B2E]/15 dark:ring-white/10 shadow-[0_1px_3px_rgba(14,27,46,0.12)] h-8 w-8 rounded-md"
              >
                <Image
                  src="/ak1a/logo/skulptur-mark.jpg"
                  alt="AK1A Research Lab — trådskulptur med krona"
                  width={32}
                  height={32}
                  sizes="32px"
                  className="h-full w-full object-cover"
                />
              </span>
            </span>
            {t("ui.kurserIndexerade", { antal: SIFFROR.kurser })}
          </span> {/* ur src/lib/siffror.ts */}
          <span className="font-mono">esc</span>
        </div>
      </div>
    </div>
  );
}
