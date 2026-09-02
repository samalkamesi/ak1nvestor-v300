"use client";

import { useState } from "react";
import {
  CompoundChart,
  MarginalBro,
  Marknadscykel,
  Akm1Radar,
  PortfoljDonut,
} from "@/components/ak1a/visuellt-bibliotek";
import {
  VagTidslinje,
  BubbelHistorik,
  RiskTermometer,
  KonvergensKort,
} from "@/components/ak1a/visuellt-bibliotek-2";
import { SankeyPortfolj } from "@/components/ak1a/sankey-portfolj";
import { SasongsGrid } from "@/components/ak1a/sasongs-grid";

/**
 * VISUELL BLOCK-RENDERER — väcker kursdata:ns `visuell`-block till liv.
 * Typer: skala | compound | cykel | donut | bro | radar | tidslinje | bubbel |
 * termometer | konvergens | sankey | sasongs
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

/** Standardpositioner för Sankeyn: donutens exempelportfölj som flöde (Σ 100 %) */
const EXEMPEL_POSITIONER = [
  { namn: "Atlas Copco", sektor: "Industri", vikt: 14 },
  { namn: "Sandvik", sektor: "Industri", vikt: 10 },
  { namn: "Volvo B", sektor: "Industri", vikt: 8 },
  { namn: "AstraZeneca", sektor: "Hälsovård", vikt: 16 },
  { namn: "Getinge", sektor: "Hälsovård", vikt: 6 },
  { namn: "Ericsson", sektor: "Teknik", vikt: 12 },
  { namn: "Hexagon", sektor: "Teknik", vikt: 8 },
  { namn: "H&M", sektor: "Konsument", vikt: 9 },
  { namn: "Evolution", sektor: "Konsument", vikt: 5 },
  { namn: "Handelsbanken", sektor: "Finans", vikt: 12 },
];

/** Standardprofil för säsongsgriden: exempelår mot månadernas långtidsmedel */
const EXEMPEL_SASONG = [
  { manad: "januari", varde: 2.1, medel: 1.0 },
  { manad: "februari", varde: -0.8, medel: 0.3 },
  { manad: "mars", varde: 1.9, medel: 1.1 },
  { manad: "april", varde: 2.6, medel: 1.3 },
  { manad: "maj", varde: -1.2, medel: 0.5 },
  { manad: "juni", varde: 0.9, medel: 0.6 },
  { manad: "juli", varde: 1.4, medel: 0.9 },
  { manad: "augusti", varde: -2.1, medel: 0.4 },
  { manad: "september", varde: -1.5, medel: -0.6 },
  { manad: "oktober", varde: 1.1, medel: 0.9 },
  { manad: "november", varde: 2.8, medel: 1.7 },
  { manad: "december", varde: 1.7, medel: 1.2 },
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
      case "tidslinje":
        return <VagTidslinje />;
      case "bubbel":
        return <BubbelHistorik />;
      case "termometer":
        return <RiskTermometer />;
      case "konvergens":
        return <KonvergensKort />;
      case "sankey":
        return <SankeyPortfolj positioner={EXEMPEL_POSITIONER} />;
      case "sasongs":
        return <SasongsGrid manadsData={EXEMPEL_SASONG} ar={2025} />;
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
