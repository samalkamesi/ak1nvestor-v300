"use client";

import { useState } from "react";
import {
  CompoundChart,
  MarginalBro,
  Marknadscykel,
  Akm1Radar,
  PortfoljDonut,
} from "@/components/ak1a/visuellt-bibliotek";

/**
 * VISUELL BLOCK-RENDERER — väcker kursdata:ns `visuell`-block till liv.
 * Typer: skala | compound | cykel | donut | bro | radar
 * Alla interaktiva (sliders/drag) — pedagogiken: se sambandet, inte bara läsa det.
 */

/** Interaktiv värderingsskala — dra multipeln, se zonen (SÄLJ/BEAKTA/KÖP) */
function VardeSkala() {
  const [pe, setPe] = useState(18);
  // zon-logik i anda Graham/Dreman: historiskt multipel-spann 10-25
  const zon =
    pe <= 12 ? { namn: "KÖP-ZON", farg: "text-bull", bg: "bg-bull/10", tip: "Låg multipel — marginalen är bred (ifall kvaliteten håller)" }
    : pe <= 20 ? { namn: "BEAKTA", farg: "text-gold", bg: "bg-gold/10", tip: "Rimlig nivå — kräv moat + tillväxt som motiverar den" }
    : { namn: "SÄLJ-ZON", farg: "text-bear", bg: "bg-bear/10", tip: "Hög multipel — förväntningarna måste slås med råge" };

  return (
    <div className="rounded-xl border border-gold/30 bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gold">⚖️ Värderingsskalan</p>
      <div className="relative mt-6 h-3 rounded-full overflow-hidden flex">
        <div className="h-full bg-bull/60" style={{ width: "33%" }} />
        <div className="h-full bg-gold/40" style={{ width: "34%" }} />
        <div className="h-full bg-bear/60" style={{ width: "33%" }} />
      </div>
      <input
        type="range"
        min={5}
        max={35}
        value={pe}
        onChange={(e) => setPe(Number(e.target.value))}
        className="mt-2 w-full accent-[#a8862a]"
        aria-label="P/E-multipel"
      />
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>P/E 5</span>
        <span className={`rounded px-2 py-0.5 font-bold ${zon.bg} ${zon.farg}`}>{zon.namn} · P/E {pe}</span>
        <span>P/E 35</span>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{zon.tip}</p>
      <p className="mt-1 text-[10px] italic text-muted-foreground/70">
        Pedagogiskt verktyg — zoner efter historiskt multipel-spann, inte investeringsråd.
      </p>
    </div>
  );
}

/** Standardprofil för radarn: ett "exempelbolag" med tydliga styrkor/svagheter */
const EXEMPEL_PROFIL = [4, 3, 4, 3, 4, 3, 2, 4, 4, 3, 3, 4, 4, 3, 2, 3, 2, 3, 3, 3];

const EXEMPEL_SEKTORER = [
  { namn: "Industri", procent: 30, farg: "#a8862a" },
  { namn: "Teknik", procent: 25, farg: "#047857" },
  { namn: "Hälsovård", procent: 20, farg: "#64748b" },
  { namn: "Konsument", procent: 15, farg: "#c9a84c" },
  { namn: "Finans", procent: 10, farg: "#b91c1c" },
];

export function VisuellBlock({ typ }: { typ: string }) {
  const innehall = (() => {
    switch (typ) {
      case "compound":
        return <CompoundChart />;
      case "bro":
        return <MarginalBro />;
      case "cykel":
        return <Marknadscykel />;
      case "radar":
        return <Akm1Radar poang={EXEMPEL_PROFIL} />;
      case "donut":
        return <PortfoljDonut sektorer={EXEMPEL_SEKTORER} />;
      case "skala":
        return <VardeSkala />;
      default:
        return (
          <p className="text-xs text-muted-foreground">
            Visuallisering (“{typ}”) saknar renderer — blocket ignoreras.
          </p>
        );
    }
  })();

  return (
    <div className="my-4">
      {innehall}
    </div>
  );
}
