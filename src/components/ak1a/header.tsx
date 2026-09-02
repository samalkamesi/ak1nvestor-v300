"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Share2,
  Moon,
  Sun,
  ScrollText,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Zap,
  Home,
  Crosshair,
  BarChart3,
  TrendingUp,
  GraduationCap,
  FlaskConical,
  Bot,
  Crown,
  Compass,
  Users,
  LogIn,
  Calculator,
  Briefcase,
  Landmark,
  BookOpen,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAk1aStore, levelLabel, type Level, type SectionId } from "@/lib/ak1a-store";
import { NAV_SECTIONS, LEVELS, FOOTER_NAV } from "@/lib/ak1a/data";
import { Ak1aLogo } from "./primitives";
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
  fas3: Bot,
  styrelse: Crown,
  strategi: Compass,
  "om-oss": Users,
  portal: LogIn,
};

// Kort beskrivning under varje sektionsetikett (samma röst som Mobilmenyn).
const SEKTIONS_BESKRIVNINGAR: Record<string, string> = {
  hem: "Startsidan — allt på ett ställe",
  prec: "PREC-analysen, sektion för sektion",
  analyser: "Fullständiga bolagsanalyser",
  aktier: "Bevakning & aktieuniversum",
  kurser: "200+ moduler · 4 flikar",
  labb: "Case + faror + historia",
  fas3: "AI-driven analys (Fas 3)",
  styrelse: "Styrelsens interna vy",
  strategi: "Strategi (#1 i världen)",
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

export function Header() {
  const {
    section,
    setSection,
    level,
    setLevel,
    setSummaryOpen,
    setShareOpen,
    progress,
    isAdmin,
  } = useAk1aStore();

  // Filter nav sections — STYRELSE only visible to admin
  const visibleNavSections = NAV_SECTIONS.filter((s) => s.id !== "styrelse" || isAdmin);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [intrad, setIntrad] = React.useState(false); // för tonad drawer-entré
  React.useEffect(() => setMounted(true), []);

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
        <Ak1aLogo onClick={() => setSection("hem")} size="md" />

        {/* Desktop nav */}
        <nav className="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Huvudnavigation">
          {visibleNavSections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                "px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors",
                section === s.id
                  ? "text-gold"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted"
              )}
            >
              {s.label}
            </button>
          ))}
          <div className="relative">
            <button
              onClick={() => setMoreOpen((v) => !v)}
              onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
              className="flex items-center gap-0.5 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-sm text-foreground/70 hover:text-foreground hover:bg-muted"
            >
              MER
              <ChevronDown className="h-3 w-3" />
            </button>
            {moreOpen && (
              <div className="absolute left-0 top-full mt-1 w-64 rounded-md border border-border bg-popover p-1 shadow-lg">
                {FOOTER_NAV.slice(0, 6).map((item) => (
                  item.section === "admin" as any ? (
                    <a
                      key={item.label}
                      href="/admin"
                      className="block w-full text-left px-2 py-1.5 text-xs hover:bg-muted rounded-sm"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <button
                      key={item.label}
                      onMouseDown={() => setSection(item.section as any)}
                      className="block w-full text-left px-2 py-1.5 text-xs hover:bg-muted rounded-sm"
                    >
                      {item.label}
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Level switcher */}
          <div className="hidden md:flex items-center rounded-md border border-border bg-card/60 p-0.5">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id as Level)}
                title={l.subtitle}
                className={cn(
                  "px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-sm transition-colors",
                  level === l.id
                    ? "bg-gold text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {l.label}
              </button>
            ))}
          </div>

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
            className="h-8 w-8 hidden sm:inline-flex"
            onClick={() => setShareOpen(true)}
            aria-label="Dela"
          >
            <Share2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden sm:inline-flex"
            onClick={() => setSummaryOpen(true)}
            aria-label="Sammanfattning"
          >
            <ScrollText className="h-4 w-4" />
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

      {/* Mobil drawer — fullskärm i samma design som Mobilmenyn (paper, guld, serif) */}
      {mobileOpen && (
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

              <Ak1aLogo onClick={() => valjSektion("hem")} size="sm" />

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

            {/* Sökfält — öppnar kommandopaletten (global lyssnare) och stänger drawern */}
            <div className="relative mt-5">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Sök kurser, verktyg, sidor…"
                onFocus={oppnaSokOchStang}
                onKeyDown={(e) => e.key === "Enter" && oppnaSokOchStang()}
                className="w-full rounded-xl border border-gold/20 bg-card py-2.5 pl-10 pr-4 text-sm text-foreground shadow-xl placeholder:text-muted-foreground focus:border-gold focus:outline-none"
              />
            </div>

            {/* SPA-sektionerna — stora tryckrader med ikon + beskrivning, aktiv = guld */}
            <nav className="mt-7 space-y-8" aria-label="Mobilnavigation">
              <section>
                <h2 className="font-serif text-xs font-bold uppercase tracking-wide text-gold">
                  Sektioner
                </h2>
                <div className="mt-2">
                  {visibleNavSections.map((s) => {
                    const Ikon = SEKTIONS_IKONER[s.id] ?? Sparkles;
                    const beskrivning = SEKTIONS_BESKRIVNINGAR[s.id];
                    const aktiv = section === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => valjSektion(s.id)}
                        className={`flex w-full items-start gap-3 border-b border-gold/10 py-3 text-left last:border-b-0 hover:bg-gold/5 active:bg-gold/10 ${
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
                            className={`block text-sm font-bold ${
                              aktiv ? "text-gold" : "text-foreground"
                            }`}
                          >
                            {s.label}
                          </span>
                          {beskrivning && (
                            <span className="block text-xs leading-tight text-muted-foreground">
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
                <h2 className="font-serif text-xs font-bold uppercase tracking-wide text-gold">
                  Mer
                </h2>
                <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {FOOTER_NAV.slice(0, 6).map((item) => (
                    <button
                      key={item.label}
                      onClick={() => valjSektion(item.section)}
                      className="rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-gold/5 hover:text-foreground"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* FLER SIDER — riktiga routes, länkas med Link */}
              <section>
                <h2 className="font-serif text-xs font-bold uppercase tracking-wide text-gold">
                  Fler sider
                </h2>
                <div className="mt-2">
                  {FLER_SIDER.map((sida) => (
                    <Link
                      key={sida.href}
                      href={sida.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-start gap-3 border-b border-gold/10 py-3 text-left last:border-b-0 hover:bg-gold/5 active:bg-gold/10"
                    >
                      <sida.ikon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-foreground">{sida.text}</span>
                        <span className="block text-xs leading-tight text-muted-foreground">
                          {sida.beskrivning}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            </nav>

            {/* Nivåväljaren — kompakt rad inne i drawern */}
            <div className="mt-6 flex items-center gap-1 rounded-md border border-border bg-card/60 p-0.5">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLevel(l.id)}
                  title={l.subtitle}
                  className={cn(
                    "flex-1 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm transition-colors",
                    level === l.id
                      ? "bg-gold text-background"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Guld-CTA längst ner */}
            <div className="mt-auto flex gap-3 pt-8">
              <button
                onClick={() => valjSektion("portal")}
                className="flex-1 rounded-xl bg-gold px-4 py-3 text-center text-sm font-bold text-primary-foreground shadow-xl transition-opacity hover:opacity-90"
              >
                Logga in / Portal
              </button>
              <Link
                href="/fas2-ansok"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-xl border border-gold px-4 py-3 text-center text-sm font-bold text-gold transition-colors hover:bg-gold/10"
              >
                Fas 2-ansökan
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Level context strip */}
      <div className="hidden sm:flex border-t border-border/60 bg-muted/40">
        <div className="mx-auto flex max-w-7xl w-full items-center gap-2 px-4 sm:px-6 py-1">
          <Sparkles className="h-3 w-3 text-gold" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Nivå: <span className="text-foreground font-semibold">{levelLabel(level)}</span>
          </span>
          <span className="text-[10px] text-muted-foreground hidden md:inline">
            · {LEVELS.find((l) => l.id === level)?.subtitle}
          </span>
        </div>
      </div>
    </header>
  );
}
