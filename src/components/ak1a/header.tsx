"use client";

import * as React from "react";
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
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAk1aStore, levelLabel, type Level } from "@/lib/ak1a-store";
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
  React.useEffect(() => setMounted(true), []);

  // ⌘K sköts GLOBALT av Kommandopaletten (layout.tsx) — ingen lokal lyssnare här
  // (dubbla lyssnare race:togglear paletten stängd på startsidan)

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

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-3">
          <nav className="flex flex-col gap-1">
            {visibleNavSections.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSection(s.id);
                  setMobileOpen(false);
                }}
                className={cn(
                  "text-left px-2 py-2 text-sm font-semibold uppercase tracking-wider rounded-sm",
                  section === s.id ? "text-gold bg-muted" : "text-foreground/80"
                )}
              >
                {s.label}
              </button>
            ))}
          </nav>
          <div className="mt-3 flex items-center gap-1 rounded-md border border-border bg-card/60 p-0.5">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id as Level)}
                className={cn(
                  "flex-1 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm",
                  level === l.id ? "bg-gold text-background" : "text-muted-foreground"
                )}
              >
                {l.label}
              </button>
            ))}
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
