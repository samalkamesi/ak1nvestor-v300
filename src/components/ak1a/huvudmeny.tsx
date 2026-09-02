"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { besok } from "@/lib/navigationsminne";

/**
 * HUVUDMENY — megamenu i AK1A-DNA: paper, guld, serif.
 * Desktop: hover-panels medFördröjning + ⌘K-sökning + personligt
 * "Fortsätt"-chip (mönsterigenkänning). Mobil: klicka för panel.
 */

type MenyPunkt = { text: string; lank: string; ikon: string; beskrivning?: string };
type MenyPanel = { titel: string; ikon: string; punkter: MenyPunkt[] };

const PANELER: MenyPanel[] = [
  {
    titel: "Lär",
    ikon: "🎓",
    punkter: [
      { text: "Manifestet", lank: "/manifest", ikon: "🏛️", beskrivning: "Vår vision: världens bästa finansutbildning" },
      { text: "Läroplanen", lank: "/laroplan", ikon: "🗺️", beskrivning: "5 nivåer → oberoende analytiker" },
      { text: "Alla kurser", lank: "/kurser", ikon: "📚", beskrivning: "Hela biblioteket med quiz" },
      { text: "Bokmaster", lank: "/kurser/the-intelligent-investor", ikon: "🏛️", beskrivning: "Böckerna kapitel för kapitel + ekosystem-flaggskeppen" },
      { text: "Biblioteket", lank: "/bibliotek", ikon: "📖", beskrivning: "Bokkanon — 100 böcker mot AKM1/AK1TS" },
      { text: "Certifikat", lank: "/certifikat", ikon: "🏅", beskrivning: "Ditt intyg på kompetens" },
    ],
  },
  {
    titel: "Analysera",
    ikon: "🔬",
    punkter: [
      { text: "AKM1-kalkylatorn", lank: "/kalkylator", ikon: "🧮", beskrivning: "20 fundamentalvariabler · V01–V20" },
      { text: "Vågfundamentet", lank: "/vagfundament", ikon: "🌊", beskrivning: "Fundamentalvågor · 20×5-matris per aktie & portfölj" },
      { text: "Portföljbyggaren", lank: "/portfoljbyggare", ikon: "🧩", beskrivning: "Bygg visuellt — se risk & spridning live" },
      { text: "Net-net-skannern", lank: "/netnet", ikon: "🔍", beskrivning: "Grahams cigar-butts — NCAV-screening live" },
      { text: "Superanalysen", lank: "/superanalys", ikon: "🏅", beskrivning: "Guidad analys i 24 steg · AKM1 + AK1TS" },
      { text: "Min portfölj", lank: "/min-portfolj", ikon: "💼", beskrivning: "Innehav + djupanalys (5×5×4)" },
      { text: "Analyser", lank: "/analyser", ikon: "📊", beskrivning: "Fullständiga bolagsanalyser" },
      { text: "AI-Diagnos", lank: "/diagnos", ikon: "🧠", beskrivning: "Kognitiv profil — 3 minuter" },
      { text: "Labbar", lank: "/labb", ikon: "🧪", beskrivning: "Forskningsärenden" },
    ],
  },
  {
    titel: "Träna",
    ikon: "🎯",
    punkter: [
      { text: "Min Sida", lank: "/min-sida", ikon: "🏠", beskrivning: "Din dashboard — allt på ett ställe" },
      { text: "Dagens Pass", lank: "/dagens-pass", ikon: "⚡", beskrivning: "5 minuters daglig marknadsträning" },
      { text: "Topplistan", lank: "/topplista", ikon: "🏆", beskrivning: "Eleverna rankade på XP" },
      { text: "Badges & meriter", lank: "/badges", ikon: "🎖️", beskrivning: "29 troféer att förtjäna" },
      { text: "Repetera", lank: "/min-sida", ikon: "🃏", beskrivning: "100 flashcards med SM-2" },
      { text: "Fas 2-ansökan", lank: "/fas2-ansok", ikon: "✉️", beskrivning: "Utbildning med grundaren — ansök kostnadsfritt" },
      { text: "Blogg", lank: "/blogg", ikon: "✍️", beskrivning: "Guider + marknadskommentarer" },
      { text: "Medlemskap", lank: "/medlemskap", ikon: "💛", beskrivning: "Fas 1 gratis · Fas 2 · Fas 3" },
    ],
  },
];

export function Huvudmeny() {
  const [oppad, setOppad] = useState<string | null>(null);
  const [fortsatt, setFortsatt] = useState<{ sida: string; titel: string } | null>(null);
  const behallare = useRef<HTMLDivElement>(null);
  const stallning = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

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

  // Hover med fördröjning så panelerna inte flimrar
  function hoverIn(titel: string) {
    if (stallning.current) clearTimeout(stallning.current);
    setOppad(titel);
  }
  function hoverUt() {
    if (stallning.current) clearTimeout(stallning.current);
    stallning.current = setTimeout(() => setOppad(null), 180);
  }

  return (
    <div ref={behallare} className="relative flex items-center gap-0.5" onMouseLeave={hoverUt}>
      {PANELER.map((p) => (
        <div key={p.titel} className="relative">
          <button
            onMouseEnter={() => hoverIn(p.titel)}
            onClick={() => setOppad(oppad === p.titel ? null : p.titel)}
            aria-expanded={oppad === p.titel}
            aria-haspopup="true"
            className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              oppad === p.titel ? "bg-gold/15 text-gold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.titel}
            <span className={`text-[8px] transition-transform ${oppad === p.titel ? "rotate-180" : ""}`}>▼</span>
          </button>

          {oppad === p.titel && (
            <div
              className="absolute left-0 top-full z-50 mt-1 max-h-[70vh] w-72 overflow-y-auto rounded-xl border border-gold/30 bg-card shadow-xl"
              onMouseEnter={() => stallning.current && clearTimeout(stallning.current)}
            >
              <div className="marin-panel border-b border-gold/30 px-3 py-2 font-serif text-xs font-bold tracking-wide text-[#E8C766]">
                {p.ikon} {p.titel.toUpperCase()}
              </div>
              {p.punkter.map((punkt) => (
                <Link
                  key={punkt.lank + punkt.text}
                  href={punkt.lank}
                  onClick={() => setOppad(null)}
                  className="flex items-start gap-2.5 border-b border-gold/10 px-3 py-2.5 last:border-b-0 hover:bg-gold/10"
                >
                  <span className="mt-0.5 text-base">{punkt.ikon}</span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-foreground">{punkt.text}</span>
                    {punkt.beskrivning && (
                      <span className="block text-[10px] leading-tight text-muted-foreground">{punkt.beskrivning}</span>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* ⌘K-sökning */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent("ak1a:oppna-sok"))}
        aria-label="Sök (Ctrl+K)"
        title="Sök — Ctrl+K / ⌘K"
        className="ml-1 flex items-center gap-1.5 rounded-md border border-gold/25 px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold"
      >
        <span>🔎</span>
        <span className="hidden font-mono text-[10px] lg:inline">⌘K</span>
      </button>

      {/* Fortsätt-chip — personlig mönsterigenkänning */}
      {fortsatt && (
        <Link
          href={fortsatt.sida}
          className="ml-1 hidden max-w-[170px] items-center gap-1 rounded-md border border-gold/25 bg-gold/5 px-2 py-1.5 text-[11px] text-gold transition-colors hover:bg-gold/15 xl:flex"
          title={`Fortsätt: ${fortsatt.titel}`}
        >
          <span className="shrink-0">⚡</span>
          <span className="truncate font-semibold">{fortsatt.titel}</span>
          <span className="shrink-0 text-[9px]">▸</span>
        </Link>
      )}
    </div>
  );
}
