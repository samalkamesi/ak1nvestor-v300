"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { lasMedlem, loggaUt } from "@/lib/member-local";
import {
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Sparkles,
  Zap,
  Home,
  Crosshair,
  BarChart3,
  TrendingUp,
  GraduationCap,
  FlaskConical,
  Users,
  LogIn,
  Calculator,
  Briefcase,
  Landmark,
  BookOpen,
  Award,
  LayoutDashboard,
  Medal,
  Microscope,
  Puzzle,
  ScanSearch,
  Target,
  Trophy,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAk1aStore, type SectionId } from "@/lib/ak1a-store";
import { NAV_SECTIONS, FOOTER_NAV } from "@/lib/ak1a/data";
import { VarumarkesLogo } from "./varumarkes-logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/** Compute an analyst level from XP. */
function levelFromXp(xp: number): { lvl: number; title: string } {
  if (xp >= 3000) return { lvl: 5, title: "MASTER ANALYTIKER" };
  if (xp >= 1500) return { lvl: 4, title: "SENIOR ANALYTIKER" };
  if (xp >= 750) return { lvl: 3, title: "ANALYTIKER" };
  if (xp >= 250) return { lvl: 2, title: "JUNIOR ANALYTIKER" };
  return { lvl: 1, title: "NYANALYTIKER" };
}

// Ikoner per SPA-sektion (mobil-drawerns stora tryckrader).
const SEKTIONS_IKONER: Record<string, typeof Home> = {
  hem: Home,
  prec: Crosshair,
  analyser: BarChart3,
  aktier: TrendingUp,
  kurser: GraduationCap,
  labb: FlaskConical,
  "om-oss": Users,
  portal: LogIn,
};

// Kort beskrivning under varje sektionsetikett (samma röst som Mobilmenyn).
const SEKTIONS_BESKRIVNINGAR: Record<string, string> = {
  hem: "Startsidan — allt på ett ställe",
  prec: "PREC-analysen, sektion för sektion",
  analyser: "Fullständiga bolagsanalyser",
  aktier: "Bevakning & aktieuniversum",
  kurser: "300+ moduler · sök & filter", // kurssektionen vidarebefordras till /kurser
  labb: "Case + faror + historia",
  "om-oss": "Meta-system (organ + visioner)",
  portal: "Logga in · Min portal",
};

// Riktiga routes (undersidor) — länkas med Link, ej SPA-sektioner.
const FLER_SIDER: { text: string; href: string; beskrivning: string; ikon: typeof Home }[] = [
  { text: "Kursbiblioteket", href: "/kurser", beskrivning: "Hela biblioteket med quiz", ikon: BookOpen },
  { text: "AKM1-kalkylatorn", href: "/kalkylator", beskrivning: "20 fundamentalvariabler · V01–V20", ikon: Calculator },
  { text: "Min portfölj", href: "/min-portfolj", beskrivning: "Innehav + djupanalys (5×5×4)", ikon: Briefcase },
  { text: "Vågfundament", href: "/vagfundament", beskrivning: "Fundamentalvågorna per aktie", ikon: Landmark },
  { text: "Dagens pass", href: "/dagens-pass", beskrivning: "5 minuters daglig marknadsträning", ikon: Zap },
];

// ── Megameny i EXAKT huvudmeny-stil (Lär/Analysera/Träna) ─────────────────
// EN meny-upplevelse på hela sajten: samma typografi, marin-paneltoppar med
// guldtext och 180 ms hover-fördröjning som undersidornas huvudmeny.
// Skillnaden: "Lär" öppnar SPA-sektioner (button) medan "Analysera"/"Träna"
// länkar riktiga routes (Link) — plus labb-sektionen i Träna.
type MegaPunkt =
  | { typ: "sektion"; text: string; sektion: SectionId; ikon: typeof Home; beskrivning: string }
  | { typ: "lank"; text: string; href: string; ikon: typeof Home; beskrivning: string };

const MEGA_PANELER: { titel: string; ikon: typeof Home; punkter: MegaPunkt[] }[] = [
  {
    titel: "Lär",
    ikon: GraduationCap,
    punkter: [
      { typ: "sektion", text: "Hem", sektion: "hem", ikon: Home, beskrivning: "Startsidan — allt på ett ställe" },
      { typ: "sektion", text: "Kurser", sektion: "kurser", ikon: GraduationCap, beskrivning: "300+ moduler · sök & filter" },
      { typ: "sektion", text: "Labb", sektion: "labb", ikon: FlaskConical, beskrivning: "Case + faror + historia" },
      { typ: "sektion", text: "Om oss", sektion: "om-oss", ikon: Users, beskrivning: "Meta-system (organ + visioner)" },
    ],
  },
  {
    titel: "Analysera",
    ikon: Microscope,
    punkter: [
      { typ: "lank", text: "AKM1-kalkylatorn", href: "/kalkylator", ikon: Calculator, beskrivning: "20 fundamentalvariabler · V01–V20" },
      { typ: "lank", text: "Vågfundamentet", href: "/vagfundament", ikon: Landmark, beskrivning: "Fundamentalvågor · 20×5-matris per aktie" },
      { typ: "lank", text: "Portföljbyggaren", href: "/portfoljbyggare", ikon: Puzzle, beskrivning: "Bygg visuellt — se risk & spridning live" },
      { typ: "lank", text: "Net-net-skannern", href: "/netnet", ikon: ScanSearch, beskrivning: "Grahams cigar-butts — NCAV-screening live" },
      { typ: "lank", text: "Min portfölj", href: "/min-portfolj", ikon: Briefcase, beskrivning: "Innehav + djupanalys (5×5×4)" },
      { typ: "lank", text: "Superanalysen", href: "/superanalys", ikon: Award, beskrivning: "Guidad analys i 24 steg · AKM1 + AK1TS" },
    ],
  },
  {
    titel: "Träna",
    ikon: Target,
    punkter: [
      { typ: "lank", text: "Dagens pass", href: "/dagens-pass", ikon: Zap, beskrivning: "5 minuters daglig marknadsträning" },
      { typ: "lank", text: "Min sida", href: "/min-sida", ikon: LayoutDashboard, beskrivning: "Din dashboard — allt på ett ställe" },
      { typ: "lank", text: "Topplistan", href: "/topplistan", ikon: Trophy, beskrivning: "Eleverna rankade på XP" },
      { typ: "lank", text: "Badges", href: "/badges", ikon: Medal, beskrivning: "Troféer & meriter att förtjäna" },
      { typ: "sektion", text: "Labb", sektion: "labb", ikon: FlaskConical, beskrivning: "Case + faror + historia (SPA)" },
    ],
  },
];

export function Header() {
  const { section, setSection, progress } = useAk1aStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [oppad, setOppad] = React.useState<string | null>(null); // öppen megamenu-panel
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [intrad, setIntrad] = React.useState(false); // för tonad drawer-entré
  // Inloggningsstatus i drawerns CTA — medlem ser Portal + Logga ut
  // (kunddirektiv 2026-09-03: aldrig "Logga in" till inloggad).
  const [medlemNamn, setMedlemNamn] = React.useState<string | null>(null);
  React.useEffect(() => {
    const m = lasMedlem();
    if (m) {
      const f = (m.namn || m.email || "").split("@")[0].split(" ")[0];
      setMedlemNamn(f ? f.charAt(0).toUpperCase() + f.slice(1) : "du");
    }
  }, []);
  React.useEffect(() => setMounted(true), []);

  // Megameny — hover med 180 ms fördröjning så panelerna inte flimrar
  // (exakt samma mönster som huvudmenyn på undersidorna).
  const megamenyRef = React.useRef<HTMLElement>(null);
  const fordrojning = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function hoverIn(titel: string) {
    if (fordrojning.current) clearTimeout(fordrojning.current);
    setOppad(titel);
  }
  function hoverUt() {
    if (fordrojning.current) clearTimeout(fordrojning.current);
    fordrojning.current = setTimeout(() => setOppad(null), 180);
  }

  // Stäng megamenyn vid klick utanför + Escape (samma beteende som huvudmenyn).
  React.useEffect(() => {
    const klick = (e: MouseEvent) => {
      if (megamenyRef.current && !megamenyRef.current.contains(e.target as Node)) setOppad(null);
    };
    const stang = (e: KeyboardEvent) => e.key === "Escape" && setOppad(null);
    document.addEventListener("mousedown", klick);
    document.addEventListener("keydown", stang);
    return () => {
      document.removeEventListener("mousedown", klick);
      document.removeEventListener("keydown", stang);
    };
  }, []);

  // ⌘K sköts GLOBALT av Kommandopaletten (layout.tsx) — ingen lokal lyssnare här
  // (dubbla lyssnare race:togglear paletten stängd på startsidan)

  // Tonad entré: vänd synlighet strax efter att drawern monterats så transitionen spelas.
  React.useEffect(() => {
    if (!mobileOpen) {
      setIntrad(false);
      return;
    }
    const t = setTimeout(() => setIntrad(true), 10);
    return () => clearTimeout(t);
  }, [mobileOpen]);

  // Body-scroll-lås + Escape stänger (samma beteende som Mobilmenyn).
  React.useEffect(() => {
    if (!mobileOpen) return;
    const fore = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const tangentslag = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", tangentslag);
    return () => {
      document.body.style.overflow = fore;
      document.removeEventListener("keydown", tangentslag);
    };
  }, [mobileOpen]);

  // Stäng drawern + öppna kommandopaletten (global lyssnare).
  const oppnaSokOchStang = () => {
    window.dispatchEvent(new CustomEvent("ak1a:oppna-sok"));
    setMobileOpen(false);
  };

  // Välj SPA-sektion i drawern + stäng.
  const valjSektion = (id: SectionId) => {
    setSection(id);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <VarumarkesLogo onClick={() => setSection("hem")} storlek="md" prioritet />

        {/* Desktop nav — megameny i EXAKT huvudmeny-stil: EN meny-upplevelse på hela sajten */}
        <nav
          ref={megamenyRef}
          aria-label="Huvudnavigation"
          className="relative ml-4 hidden items-center gap-0.5 lg:flex"
          onMouseLeave={hoverUt}
        >
          {MEGA_PANELER.map((p) => {
            // Guldmarkera knappen om en av panelens SPA-sektioner är aktiv.
            const aktivIPanel = p.punkter.some(
              (pk) => pk.typ === "sektion" && pk.sektion === section
            );
            return (
              <div key={p.titel} className="relative">
                <button
                  onMouseEnter={() => hoverIn(p.titel)}
                  onClick={() => setOppad(oppad === p.titel ? null : p.titel)}
                  aria-expanded={oppad === p.titel}
                  aria-haspopup="true"
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
                    oppad === p.titel
                      ? "bg-gold/15 text-gold"
                      : aktivIPanel
                        ? "text-gold"
                        : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.titel}
                  <span
                    className={cn(
                      "text-[8px] transition-transform",
                      oppad === p.titel && "rotate-180"
                    )}
                  >
                    ▼
                  </span>
                </button>

                {oppad === p.titel && (
                  <div
                    className="absolute left-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-xl border border-gold/30 bg-card shadow-xl"
                    onMouseEnter={() =>
                      fordrojning.current && clearTimeout(fordrojning.current)
                    }
                  >
                    {/* Paneltopp — marin med guldtext, identisk med huvudmenyn */}
                    <div className="marin-panel flex items-center gap-1.5 border-b border-gold/30 px-3 py-2 font-serif text-xs font-bold tracking-wide text-[#E8C766]">
                      <p.ikon className="h-3.5 w-3.5" />
                      {p.titel.toUpperCase()}
                    </div>
                    {p.punkter.map((punkt) =>
                      punkt.typ === "sektion" ? (
                        <button
                          key={`sektion-${punkt.sektion}`}
                          onClick={() => {
                            setSection(punkt.sektion);
                            setOppad(null); // stäng vid val
                          }}
                          className="flex w-full items-start gap-2.5 border-b border-gold/10 px-3 py-2.5 text-left last:border-b-0 hover:bg-gold/10"
                        >
                          <punkt.ikon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0">
                            <span
                              className={cn(
                                "block text-xs font-bold",
                                section === punkt.sektion ? "text-gold" : "text-foreground"
                              )}
                            >
                              {punkt.text}
                            </span>
                            <span className="block text-[10px] leading-tight text-muted-foreground">
                              {punkt.beskrivning}
                            </span>
                          </span>
                        </button>
                      ) : (
                        <Link
                          key={`lank-${punkt.href}`}
                          href={punkt.href}
                          onClick={() => setOppad(null)} // stäng vid val
                          className="flex items-start gap-2.5 border-b border-gold/10 px-3 py-2.5 last:border-b-0 hover:bg-gold/10"
                        >
                          <punkt.ikon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0">
                            <span className="block text-xs font-bold text-foreground">
                              {punkt.text}
                            </span>
                            <span className="block text-[10px] leading-tight text-muted-foreground">
                              {punkt.beskrivning}
                            </span>
                          </span>
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => window.dispatchEvent(new CustomEvent("ak1a:oppna-sok"))}
            aria-label="Sök (Cmd+K)"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Global XP indicator — gamification visible everywhere */}
          {mounted && (
            <button
              onClick={() => setSection("labb")}
              title={`${progress.xp} XP · ${levelFromXp(progress.xp).title}`}
              className="hidden sm:flex items-center gap-1.5 rounded-md border border-gold/40 bg-gold/5 px-2 py-1 text-[11px] font-semibold text-gold hover:bg-gold/10 transition-colors"
            >
              <Zap className="h-3 w-3" />
              <span>{progress.xp}</span>
              <span className="text-[9px] uppercase tracking-wider opacity-70">
                Lvl {levelFromXp(progress.xp).lvl}
              </span>
            </button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Byt tema"
          >
            {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Meny"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobil drawer — fullskärm i samma design som Mobilmenyn (paper, guld, serif).
          PORTAL till body: headerns backdrop-blur skapar containing block som
          annars klipper fixed inset-0 till headerns 56px. */}
      {mobileOpen &&
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
            {/* Topprad: stäng-X + logotyp + XP/nivå/streak-chips */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Stäng menyn"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-gold/20 text-muted-foreground transition-colors hover:border-gold/50 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              <VarumarkesLogo onClick={() => valjSektion("hem")} storlek="sm" />

              <div className="ml-auto flex flex-wrap items-center gap-1.5">
                <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[10px] font-bold text-gold">
                  {progress.xp} XP
                </span>
                <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[10px] font-bold text-gold">
                  Lvl {levelFromXp(progress.xp).lvl}
                </span>
                <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[10px] font-bold text-gold">
                  🔥 {progress.streak}
                </span>
              </div>
            </div>

            {/* Sökfält — öppnar kommandopaletten (global lyssnare) och stänger drawern.
                text-base (16px) hindrar iOS från auto-zoom vid fokus. */}
            <div className="relative mt-5">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Sök kurser, verktyg, sidor…"
                onFocus={oppnaSokOchStang}
                onKeyDown={(e) => e.key === "Enter" && oppnaSokOchStang()}
                className="w-full rounded-xl border border-gold/20 bg-card py-3 pl-10 pr-4 text-base text-foreground shadow-xl placeholder:text-muted-foreground focus:border-gold focus:outline-none"
              />
            </div>

            {/* SPA-sektionerna — stora tryckrader med ikon + beskrivning, aktiv = guld */}
            <nav className="mt-7 space-y-8" aria-label="Mobilnavigation">
              <section>
                <h2 className="font-serif text-sm font-bold uppercase tracking-wide text-gold">
                  Sektioner
                </h2>
                <div className="mt-2">
                  {NAV_SECTIONS.map((s) => {
                    const Ikon = SEKTIONS_IKONER[s.id] ?? Sparkles;
                    const beskrivning = SEKTIONS_BESKRIVNINGAR[s.id];
                    const aktiv = section === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => valjSektion(s.id)}
                        className={`flex w-full items-start gap-3 border-b border-gold/10 py-3.5 text-left last:border-b-0 hover:bg-gold/5 active:bg-gold/10 ${
                          aktiv ? "bg-gold/5" : ""
                        }`}
                      >
                        <Ikon
                          className={`mt-0.5 h-5 w-5 shrink-0 ${
                            aktiv ? "text-gold" : "text-muted-foreground"
                          }`}
                        />
                        <span className="min-w-0">
                          <span
                            className={`block text-base font-bold ${
                              aktiv ? "text-gold" : "text-foreground"
                            }`}
                          >
                            {s.label}
                          </span>
                          {beskrivning && (
                            <span className="block text-sm leading-snug text-muted-foreground">
                              {beskrivning}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* MER — samma länkar som desktop-droppen, som mindre rader */}
              <section>
                <h2 className="font-serif text-sm font-bold uppercase tracking-wide text-gold">
                  Mer
                </h2>
                <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {FOOTER_NAV.slice(0, 6).map((item) => (
                    <button
                      key={item.label}
                      onClick={() => valjSektion(item.section)}
                      className="rounded-md px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-gold/5 hover:text-foreground"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* FLER SIDER — riktiga routes, länkas med Link */}
              <section>
                <h2 className="font-serif text-sm font-bold uppercase tracking-wide text-gold">
                  Fler sider
                </h2>
                <div className="mt-2">
                  {FLER_SIDER.map((sida) => (
                    <Link
                      key={sida.href}
                      href={sida.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-start gap-3 border-b border-gold/10 py-3.5 text-left last:border-b-0 hover:bg-gold/5 active:bg-gold/10"
                    >
                      <sida.ikon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                      <span className="min-w-0">
                        <span className="block text-base font-bold text-foreground">{sida.text}</span>
                        <span className="block text-sm leading-snug text-muted-foreground">
                          {sida.beskrivning}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            </nav>

            {/* Guld-CTA längst ner — statusmedveten */}
            <div className="mt-auto flex gap-3 pt-8">
              <div className="flex flex-1 flex-col gap-2">
                <button
                  onClick={() => valjSektion("portal")}
                  className="w-full rounded-xl bg-gold px-4 py-3.5 text-center text-base font-bold text-primary-foreground shadow-xl transition-opacity hover:opacity-90"
                >
                  {medlemNamn ? `${medlemNamn} · Portal` : "Logga in / Portal"}
                </button>
                {medlemNamn && (
                  <button
                    onClick={() => {
                      loggaUt();
                      setMedlemNamn(null);
                    }}
                    className="w-full rounded-xl border border-gold/30 px-4 py-2.5 text-center text-sm font-semibold text-muted-foreground hover:border-gold/60 hover:text-foreground"
                  >
                    Logga ut
                  </button>
                )}
              </div>
              <Link
                href="/fas2-ansok"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-xl border border-gold px-4 py-3.5 text-center text-base font-bold text-gold transition-colors hover:bg-gold/10"
              >
                Fas 2-ansökan
              </Link>
            </div>
          </div>
        </div>
        , document.body)}

    </header>
  );
}
