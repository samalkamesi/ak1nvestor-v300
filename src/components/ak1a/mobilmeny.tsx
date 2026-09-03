"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { lasStreak, lasXP, niva } from "@/lib/member-local";
import { VarumarkesLogo } from "./varumarkes-logo";
import { InloggadKnapp } from "./inloggad-knapp";
import { cn } from "@/lib/utils";

/**
 * MOBILMENY — fullskärms-drawer med samma AK1A-DNA: paper, guld, serif.
 * Hamburgerknappen syns enbart under md; drawern funkar oavsett brytpunkt.
 * Sökfältet dispatchar "ak1a:oppna-sok" (kommandopaletten lyssnar globalt).
 *
 * 2026-09-01 — omdesignad efter kundägarens önskan: menyn ska kännas som en
 * premium-panel från samma designer som övriga sidor. Därför:
 *   • Samma KORTSTIL som huvudmenyns paneler (rounded-xl + marin paneltopp
 *     med guld-serif, cream-kort under) — inte nakna listrader.
 *   • Länktitlar text-base (16px) + beskrivningar text-sm — alda mindre.
 *   • Generös tryckyta (py-3.5) för tummar.
 *   • Varumärkes-logotypen + stäng-knapp i topp; aktiv sida markeras i guld.
 */

type MenyPunkt = { text: string; lank: string; ikon: string; beskrivning?: string };
/** Icke-klickbar sektionsrubrik inuti en panel — renderas som guld-versaler. */
type MenyAvdelare = { avdelare: string };
type MenyRad = MenyPunkt | MenyAvdelare;
type MenyPanel = { titel: string; ikon: string; punkter: MenyRad[] };

// Samma paneler som HUVUDMENYN — spegla innehållet exakt.
const PANELER: MenyPanel[] = [
  {
    titel: "Lär",
    ikon: "🎓",
    punkter: [
      { text: "Manifestet", lank: "/manifest", ikon: "🏛️", beskrivning: "Vår vision: världens bästa finansutbildning" },
      { text: "Läroplanen", lank: "/laroplan", ikon: "🗺️", beskrivning: "5 nivåer → oberoende analytiker" },
      { text: "Alla kurser", lank: "/kurser", ikon: "📚", beskrivning: "Hela biblioteket med quiz" },
      { text: "Bokmaster", lank: "/kurser/the-intelligent-investor", ikon: "🏛️", beskrivning: "82 böcker kapitel för kapitel" }, // 2026-09-01: 82 BOKMASTER-kurser i deep-courses.json; kurs-sök läser ännu ej ?kategori=
      { text: "Biblioteket", lank: "/bibliotek", ikon: "📖", beskrivning: "Bokkanon — böcker mappade mot AKM1/AK1TS" },
      { text: "Certifikat", lank: "/certifikat", ikon: "🏅", beskrivning: "Ditt intyg på kompetens" },
    ],
  },
  {
    titel: "Analysera",
    ikon: "🔬",
    // Logisk stig: GRUNDÄNKNING → SKANNAR → FÖRDJUPNING — speglar huvudmenyn exakt.
    punkter: [
      { text: "Nyhetscentralen", lank: "/nyheter", ikon: "📰", beskrivning: "Ditt nyhetsrum — nyheter rangordnade efter påverkan" },
      { avdelare: "Grundtänkande" },
      { text: "AKM1-kalkylatorn", lank: "/kalkylator", ikon: "🧮", beskrivning: "20 fundamentalvariabler · V01–V20" },
      { text: "Vågfundamentet", lank: "/vagfundament", ikon: "🌊", beskrivning: "Fundamentalvågor · 20×5-matris per aktie & portfölj" },
      { avdelare: "Skannar" },
      { text: "Konfluensradarn", lank: "/konfluens", ikon: "📡", beskrivning: "Där värde möter vågor — fem källor måste tala samman" },
      { text: "Net-net-skannern", lank: "/netnet", ikon: "🔍", beskrivning: "Grahams cigar-butts — NCAV-screening live" },
      { text: "Portföljbyggaren", lank: "/portfoljbyggare", ikon: "🧩", beskrivning: "Bygg visuellt — se risk & spridning live" },
      { avdelare: "Fördjupning" },
      { text: "Superanalysen", lank: "/superanalys", ikon: "🏅", beskrivning: "Guidad analys i 24 steg · AKM1 + AK1TS" },
      { text: "Min portfölj", lank: "/min-portfolj", ikon: "💼", beskrivning: "Innehav + djupanalys (5×5×4)" },
      { text: "Analyser", lank: "/analyser", ikon: "📊", beskrivning: "Fullständiga bolagsanalyser" },
      { text: "AI-Diagnos", lank: "/profil", ikon: "🧠", beskrivning: "Kognitiv profil — 3 minuter" },
    ],
  },
  {
    titel: "Träna",
    ikon: "🎯",
    punkter: [
      { text: "Min Sida", lank: "/min-sida", ikon: "🏠", beskrivning: "Din dashboard — allt på ett ställe" },
      { text: "Dagens Pass", lank: "/dagens-pass", ikon: "⚡", beskrivning: "5 minuters daglig marknadsträning" },
      { text: "Topplistan", lank: "/topplista", ikon: "🏆", beskrivning: "Eleverna rankade på XP" },
      { text: "Badges & meriter", lank: "/badges", ikon: "🎖️", beskrivning: "29 troféer att förtjäna" }, // Uppdaterad 2026-09-01: 29 badges i src/lib/badges.ts
      { text: "Repetera", lank: "/min-sida", ikon: "🃏", beskrivning: "140 flashcards med SM-2" }, // Uppdaterad 2026-09-01: 140 kort i data/spaced-repetition.json — samma länk som huvudmenyn
      { text: "Short-Seller", lank: "/kurser", ikon: "🔴", beskrivning: "Sokratisk grillning (röd widget)" },
      { text: "Fas 2-ansökan", lank: "/fas2-ansok", ikon: "✉️", beskrivning: "Utbildning med grundaren — ansök kostnadsfritt" },
      { text: "Fas 3 — Certifiering", lank: "/fas3", ikon: "🎓", beskrivning: "Certifierad AK1A-analytiker — praktikportfölj + etik" },
      { text: "Blogg", lank: "/blogg", ikon: "✍️", beskrivning: "Guider + marknadskommentarer" },
      { text: "Medlemskap", lank: "/medlemskap", ikon: "💛", beskrivning: "Fas 1 gratis · Fas 2 · Fas 3" },
    ],
  },
];

export function Mobilmeny() {
  const [oppad, setOppad] = useState(false);
  const [intrad, setIntrad] = useState(false); // för tonad entré-animation
  const [xp, setXp] = useState(0);
  const [nivaNu, setNivaNu] = useState(1);
  const [streakAntal, setStreakAntal] = useState(0);
  const pathname = usePathname();

  const stang = useCallback(() => setOppad(false), []);

  /** Aktiv sida = exakt träff eller undersida (t.ex. /kurser/… under /kurser). */
  const arAktiv = useCallback(
    (lank: string) => pathname === lank || pathname.startsWith(lank + "/"),
    [pathname]
  );

  // Läs medlemsdata när drawern öppnas (alltid synliga, även vid 0 XP).
  useEffect(() => {
    if (!oppad) return;
    setXp(lasXP());
    setNivaNu(niva());
    setStreakAntal(lasStreak().antal);
  }, [oppad]);

  // Tonad entré: vänd synlighet strax efter montering så transitionen spelas.
  useEffect(() => {
    if (!oppad) return;
    const t = setTimeout(() => setIntrad(true), 10);
    return () => clearTimeout(t);
  }, [oppad]);

  // Body-scroll-lås + Escape stänger.
  useEffect(() => {
    if (!oppad) return;
    const fore = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const tang = (e: KeyboardEvent) => e.key === "Escape" && stang();
    document.addEventListener("keydown", tang);
    return () => {
      document.body.style.overflow = fore;
      document.removeEventListener("keydown", tang);
    };
  }, [oppad, stang]);

  // Sökfältet: öppna kommandopaletten (global lyssnare) och stäng drawern.
  const oppnaSok = () => {
    window.dispatchEvent(new CustomEvent("ak1a:oppna-sok"));
    stang();
  };

  return (
    <>
      {/* Hamburgerknapp — tre linjer, syns enbart under md */}
      <button
        type="button"
        onClick={() => setOppad(true)}
        aria-label="Öppna menyn"
        aria-expanded={oppad}
        className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-md text-foreground transition-colors hover:text-gold lg:hidden"
      >
        <span
          className={`h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ${
            oppad ? "translate-y-[7px] rotate-45" : ""
          }`}
        />
        <span
          className={`h-0.5 w-5 rounded-full bg-current transition-opacity duration-300 ${
            oppad ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ${
            oppad ? "-translate-y-[7px] -rotate-45" : ""
          }`}
        />
      </button>

      {/* Fullskärms-drawer — PORTAL till body: headerns backdrop-blur skapar
          en containing block som annars klipper fixed inset-0 till 56px */}
      {oppad &&
        createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Huvudmeny"
          className={`paper-texture fixed inset-0 z-[60] bg-background/98 backdrop-blur-md transition-opacity duration-300 ${
            intrad ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`mx-auto flex h-full max-w-lg flex-col overflow-y-auto px-5 pb-10 pt-4 transition-all duration-300 ${
              intrad ? "translate-y-0" : "translate-y-3"
            }`}
          >
            {/* Topprad: varumärket till vänster, stäng-knapp till höger */}
            <div className="flex items-center gap-3">
              <VarumarkesLogo href="/" onClick={stang} storlek="md" />

              <button
                type="button"
                onClick={stang}
                aria-label="Stäng menyn"
                className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gold/25 text-muted-foreground transition-colors hover:border-gold/60 hover:text-foreground"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* Guld-chips: nivå · XP · streak (egen rad så logotypen får luft) */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-bold text-gold">
                Nivå {nivaNu}
              </span>
              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-bold text-gold">
                {xp} XP
              </span>
              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-bold text-gold">
                🔥 {streakAntal}
              </span>
            </div>

            {/* Sökfält — öppnar kommandopaletten vid fokus/Enter.
                text-base (16px) hindrar iOS från auto-zoom vid fokus. */}
            <div className="relative mt-5">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Sök kurser, verktyg, sidor…"
                onFocus={oppnaSok}
                onKeyDown={(e) => e.key === "Enter" && oppnaSok()}
                className="w-full rounded-xl border border-gold/20 bg-card py-3 pl-11 pr-4 text-base text-foreground shadow-xl placeholder:text-muted-foreground focus:border-gold focus:outline-none"
              />
            </div>

            {/* Tre sektioner — KORTSTIL som huvudmenyns paneler:
                marin paneltopp med guld-serif + cream-kort med tryckrader */}
            <nav className="mt-6 space-y-5" aria-label="Mobilnavigation">
              {PANELER.map((p) => (
                <section
                  key={p.titel}
                  className="overflow-hidden rounded-xl border border-gold/30 bg-card shadow-lg"
                >
                  {/* Paneltopp — marin med guldtext, identisk med huvudmenyn */}
                  <h2 className="marin-panel border-b border-gold/30 px-4 py-3 font-serif text-sm font-bold tracking-wide text-[#E8C766]">
                    {p.ikon} {p.titel.toUpperCase()}
                  </h2>

                  <div>
                    {p.punkter.map((punkt) =>
                      "avdelare" in punkt ? (
                        <div
                          key={`avdelare-${punkt.avdelare}`}
                          className="border-b border-gold/10 bg-gold/5 px-4 pb-1.5 pt-3 text-[11px] font-bold uppercase tracking-widest text-gold"
                        >
                          {punkt.avdelare}
                        </div>
                      ) : (
                        <Link
                          key={punkt.lank + punkt.text}
                          href={punkt.lank}
                          onClick={stang}
                          aria-current={arAktiv(punkt.lank) ? "page" : undefined}
                          className={cn(
                            "flex items-start gap-3 border-b border-gold/10 px-4 py-3.5 text-left last:border-b-0 transition-colors hover:bg-gold/5 active:bg-gold/10",
                            arAktiv(punkt.lank) && "bg-gold/10"
                          )}
                        >
                          <span className="mt-0.5 w-6 shrink-0 text-center text-xl" aria-hidden="true">
                            {punkt.ikon}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                "block text-base font-bold",
                                arAktiv(punkt.lank) ? "text-gold" : "text-foreground"
                              )}
                            >
                              {punkt.text}
                            </span>
                            {punkt.beskrivning && (
                              <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">
                                {punkt.beskrivning}
                              </span>
                            )}
                          </span>
                          {arAktiv(punkt.lank) && (
                            <span className="mt-1.5 shrink-0 text-gold" aria-hidden="true">
                              ●
                            </span>
                          )}
                        </Link>
                      )
                    )}
                  </div>
                </section>
              ))}
            </nav>

            {/* Längst ner: inloggningsstatus + Fas 2-ansökan.
                Inloggad medlem ser "Min Sida"-hälsning + Logga ut (aldrig
                "Logga in" till någon som redan är inloggad — kunddirektiv
                2026-09-03). */}
            <div className="mt-auto flex gap-3 pt-8">
              <div className="flex-1">
                <InloggadKnapp stor />
              </div>
              <Link
                href="/fas2-ansok"
                onClick={stang}
                className="flex-1 rounded-xl border border-gold px-4 py-3.5 text-center text-base font-bold text-gold hover:bg-gold/10"
              >
                Fas 2-ansökan
              </Link>
            </div>
          </div>
        </div>
        , document.body)}
    </>
  );
}
