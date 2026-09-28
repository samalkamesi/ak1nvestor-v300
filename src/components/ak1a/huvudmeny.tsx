"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { besok } from "@/lib/navigationsminne";
import {
  GAST_KONTEXT,
  MENY_REGISTER,
  lasMenyKontext,
  sektionPunkter,
  type MenyKontext,
  type MenyPunkt,
} from "@/lib/meny-register";
import { cn } from "@/lib/utils";
import { useSprak } from "@/components/ak1a/sprak-leverantor";

/**
 * HUVUDMENY — megamenu i AK1A-DNA: paper, guld, serif.
 * Desktop: hover-panels med fördröjning + ⌘K-sökning + personligt
 * "Fortsätt"-chip (mönsterigenkänning). Mobil: klicka för panel.
 *
 * 2026-09-03 — läser UR src/lib/meny-register.ts (EN källa för alla menyer,
 * MENYFORSKNING-2026-09-03: Hick + NN/g "show each choice only once").
 * Panelerna filtreras adaptivt via registrets publik-nivå: gästen ser
 * basutbudet, medlemmen sina ytor, admin allt — samma register överallt.
 *
 * VÅG 51 (2026-09-01): etiketterna översätts via registrets `nyckel` +
 * useSprak().t — SSR/SSG renderar svenska (sv-raden = registrets text),
 * klienten byter till en/ar direkt vid språkval. Beskrivningar/avdelare
 * översätts best-effort via tText (exakt sv-match mot ordlistan).
 */

export function Huvudmeny() {
  const [oppad, setOppad] = useState<string | null>(null);
  const [fortsatt, setFortsatt] = useState<{ sida: string; titel: string } | null>(null);
  // SSR: gast-vyn → hydrering utökar till medlem/fas/admin (R16).
  const [kontext, setKontext] = useState<MenyKontext>(GAST_KONTEXT);
  const behallare = useRef<HTMLDivElement>(null);
  const stallning = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const { t, tText } = useSprak();

  useEffect(() => setKontext(lasMenyKontext()), []);

  // Mönsterigenkänning: senaste besökta sida (som inte är aktuell)
  useEffect(() => {
    const senaste = besok().find((b) => b.sida !== pathname && b.sida !== "/");
    setFortsatt(senaste ? { sida: senaste.sida, titel: senaste.titel } : null);
  }, [pathname]);

  // Stäng vid klick utanför + Escape
  useEffect(() => {
    const klick = (e: MouseEvent) => {
      if (behallare.current && !behallare.current.contains(e.target as Node)) setOppad(null);
    };
    const tang = (e: KeyboardEvent) => e.key === "Escape" && setOppad(null);
    document.addEventListener("mousedown", klick);
    document.addEventListener("keydown", tang);
    return () => {
      document.removeEventListener("mousedown", klick);
      document.removeEventListener("keydown", tang);
    };
  }, []);

  // Hover med fördröjning så panelerna inte flimrar (NN/g hover-intent)
  function hoverIn(titel: string) {
    if (stallning.current) clearTimeout(stallning.current);
    setOppad(titel);
  }
  function hoverUt() {
    if (stallning.current) clearTimeout(stallning.current);
    stallning.current = setTimeout(() => setOppad(null), 180);
  }

  // Registret anpassat för denna klient (meny-ytan, behörighetsfiltrerat).
  const paneler = MENY_REGISTER.map((s) => ({
    ...s,
    punkter: sektionPunkter(s, kontext, "meny"),
  })).filter((s) => s.punkter.length > 0);

  return (
    <div ref={behallare} className="relative flex items-center gap-0.5" onMouseLeave={hoverUt}>
      {paneler.map((p) => (
        <div key={p.id} className="relative">
          <button
            onMouseEnter={() => hoverIn(p.titel)}
            onClick={() => setOppad(oppad === p.titel ? null : p.titel)}
            aria-expanded={oppad === p.titel}
            aria-haspopup="true"
            className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              oppad === p.titel ? "bg-gold/15 text-gold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.nyckel ? t(p.nyckel) : p.titel}
            <span className={`text-[8px] transition-transform ${oppad === p.titel ? "rotate-180" : ""}`}>▼</span>
          </button>

          {oppad === p.titel && (
            <div
              className="absolute left-0 top-full z-50 mt-1 max-h-[70vh] w-72 overflow-y-auto rounded-xl border border-gold/30 bg-card shadow-xl"
              onMouseEnter={() => stallning.current && clearTimeout(stallning.current)}
            >
              <div className="marin-panel border-b border-gold/30 px-3 py-2 font-serif text-xs font-bold tracking-wide text-[#E8C766]">
                {p.ikon} {(p.nyckel ? t(p.nyckel) : p.titel).toUpperCase()}
              </div>
              {p.punkter.map((punkt, i) => (
                <PanelRad
                  key={punkt.lank}
                  punkt={punkt}
                  foregaende={p.punkter[i - 1]}
                  onStang={() => setOppad(null)}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* ⌘K-sökning */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent("ak1a:oppna-sok"))}
        aria-label={t("ui.sokGenvag")}
        title={t("ui.sokGenvag")}
        className="ml-1 flex items-center gap-1.5 rounded-md border border-gold/25 px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold"
      >
        <span>🔎</span>
        <span className="hidden font-mono text-[10px] lg:inline">⌘K</span>
      </button>

      {/* Fortsätt-chip — personlig mönsterigenkänning (recency, forskning §6) */}
      {fortsatt && (
        <Link
          href={fortsatt.sida}
          prefetch={false}
          // prefetch={false} (v206/o557): chippet länkar godtycklig senaste
          // sida — kan vara en tung motorrutt vars bunt annars prefetchar
          // i headern på varje vy (o56-familjen).
          className="ml-1 hidden max-w-[170px] items-center gap-1 rounded-md border border-gold/25 bg-gold/5 px-2 py-1.5 text-[11px] text-gold transition-colors hover:bg-gold/15 xl:flex"
          title={t("ui.fortsattTitel", { titel: tText(fortsatt.titel) })}
        >
          <span className="shrink-0">⚡</span>
          <span className="truncate font-semibold">{fortsatt.titel}</span>
          <span className="shrink-0 text-[9px]">▸</span>
        </Link>
      )}
    </div>
  );
}

/** En menyrad — avdelare renderas när punkten inleder en ny undergrupp. */
function PanelRad({
  punkt,
  foregaende,
  onStang,
}: {
  punkt: MenyPunkt;
  foregaende?: MenyPunkt;
  onStang: () => void;
}) {
  const { t, tText } = useSprak();
  const nyAvdelare = punkt.avdelare && punkt.avdelare !== foregaende?.avdelare;
  return (
    <>
      {nyAvdelare && (
        <div className="border-b border-gold/10 bg-gold/5 px-3 pb-1 pt-2.5 text-[10px] font-bold uppercase tracking-widest text-gold">
          {tText(punkt.avdelare ?? "")}
        </div>
      )}
      <Link
        href={punkt.lank}
        onClick={onStang}
        className={cn(
          "flex items-start gap-2.5 border-b border-gold/10 px-3 py-2.5 last:border-b-0 hover:bg-gold/10",
          punkt.guldknapp && "bg-gold/10 hover:bg-gold/20"
        )}
      >
        <span className="mt-0.5 text-base">{punkt.ikon}</span>
        <span className="min-w-0">
          <span
            className={cn(
              "block text-xs font-bold",
              punkt.guldknapp ? "text-gold" : "text-foreground"
            )}
          >
            {punkt.nyckel ? t(punkt.nyckel) : punkt.text}
          </span>
          {punkt.beskrivning && (
            <span className="block text-[10px] leading-tight text-muted-foreground">{tText(punkt.beskrivning)}</span>
          )}
        </span>
      </Link>
    </>
  );
}
