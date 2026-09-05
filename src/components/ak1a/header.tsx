"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { lasMedlem, loggaUt } from "@/lib/member-local";
import { SprakVaxlare } from "@/components/ak1a/sprak-vaxlare";
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
  TrendingUp,
  GraduationCap,
  Calculator,
  Briefcase,
  Landmark,
  BookOpen,
  Award,
  Medal,
  Microscope,
  Puzzle,
  ScanSearch,
  Target,
  Trophy,
  Map,
  BookMarked,
  FlaskConical,
  Waves,
  Radar,
  Newspaper,
  BarChart3,
  Brain,
  Heart,
  CreditCard,
  Mail,
  PenLine,
  KeyRound,
  ScrollText,
  ShieldCheck,
  Wrench,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAk1aStore, type SectionId } from "@/lib/ak1a-store";
import {
  GAST_KONTEXT,
  MENY_REGISTER,
  lasMenyKontext,
  sektionPunkter,
  type MenyKontext,
  type MenyPunkt,
  type MenySektionId,
} from "@/lib/meny-register";
import { VarumarkesLogo } from "./varumarkes-logo";
import { Toppvaxel } from "./toppvaxel";
import { useSprak } from "./sprak-leverantor";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { OrdlistaNyckel } from "@/lib/ordlista";

/** Compute an analyst level from XP. */
function levelFromXp(xp: number): { lvl: number; title: string } {
  if (xp >= 3000) return { lvl: 5, title: "MASTER ANALYTIKER" };
  if (xp >= 1500) return { lvl: 4, title: "SENIOR ANALYTIKER" };
  if (xp >= 750) return { lvl: 3, title: "ANALYTIKER" };
  if (xp >= 250) return { lvl: 2, title: "JUNIOR ANALYTIKER" };
  return { lvl: 1, title: "NYANALYTIKER" };
}

// Registrets emoji-ikoner mappas till lucide (startsidan använder lucide-DNA).
// Saknad ikon → Sparkles; nya registrepunkter kräver ingen kodändring.
const IKON_FRAN_LUCIDE: Record<string, LucideIcon> = {
  "🎓": GraduationCap,
  "🗺️": Map,
  "📚": BookOpen,
  "📖": BookMarked,
  "🧪": FlaskConical,
  "🏅": Award,
  "🧮": Calculator,
  "🌊": Waves,
  "📡": Radar,
  "🔍": ScanSearch,
  "📰": Newspaper,
  "📊": BarChart3,
  "🧩": Puzzle,
  "💼": Briefcase,
  "🧠": Brain,
  "🎯": Target,
  "🏠": Home,
  "⚡": Zap,
  "🏆": Trophy,
  "🎖️": Medal,
  "🏛️": Landmark,
  "💛": Heart,
  "💳": CreditCard,
  "✉️": Mail,
  "✍️": PenLine,
  "🔑": KeyRound,
  "📜": ScrollText,
  "🛡️": ShieldCheck,
  "🛠️": Wrench,
};

// Använd direkta uppslag (som gamla SEKTIONS_IKONER-mönstret):
//   const Ikon = IKON_FRAN_LUCIDE[punkt.ikon] ?? Sparkles;

// Panelsymboler per sektion (startsidans egna paneler).
const SEKTIONS_IKON: Record<MenySektionId, LucideIcon> = {
  lara: GraduationCap,
  analysera: Microscope,
  praktik: Target,
  om: Landmark,
};

// Startsidans äkta SPA-sektioner (inga rutter — finns ENBART här, aldrig i
// registret → omöjliga att duplicera). Kurser/Labb/Analyser/Om-oss omdirigeras
// sedan M3 direkt till rutterna och nås via registrets länkar.
// Portal ligger som status-CTA längst ner i drawern (tumzonen) — inte här.
// VÅG 51: `nyckel` översätter etiketten via ordlistan (sv = text nedan).
const STARTSIDAN_SEKTIONER: {
  id: SectionId;
  text: string;
  nyckel: OrdlistaNyckel;
  beskrivningsNyckel: OrdlistaNyckel;
  beskrivning: string;
  ikon: LucideIcon;
}[] = [
  { id: "hem", text: "Hem", nyckel: "nav.hem", beskrivningsNyckel: "nav.hemBeskrivning", beskrivning: "Startsidan — allt på ett ställe", ikon: Home },
  { id: "prec", text: "PREC-analysen", nyckel: "nav.precAnalys", beskrivningsNyckel: "nav.precBeskrivning", beskrivning: "PREC-analysen, sektion för sektion", ikon: Crosshair },
  { id: "aktier", text: "Aktier & bevakning", nyckel: "nav.aktierBevakning", beskrivningsNyckel: "nav.aktierBeskrivning", beskrivning: "Bevakning & aktieuniversum", ikon: TrendingUp },
];

export function Header() {
  const { section, setSection, progress } = useAk1aStore();
  const { theme, setTheme } = useTheme();
  const { t } = useSprak();
  const [mounted, setMounted] = React.useState(false);
  const [oppad, setOppad] = React.useState<string | null>(null); // öppen megamenu-panel
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [intrad, setIntrad] = React.useState(false); // för tonad drawer-entré
  const [oppenSektion, setOppenSektion] = React.useState<MenySektionId | null>(null);
  // Behörighetskontext ur registrets modell (SSR: gast-vyn, R16).
  const [kontext, setKontext] = React.useState<MenyKontext>(GAST_KONTEXT);
  // Inloggningsstatus i drawerns CTA — medlem ser Portal + Logga ut
  // (kunddirektiv 2026-09-03: aldrig "Logga in" till inloggad).
  const [medlemNamn, setMedlemNamn] = React.useState<string | null>(null);
  React.useEffect(() => {
    setKontext(lasMenyKontext());
    const m = lasMedlem();
    if (m) {
      const f = (m.namn || m.email || "").split("@")[0].split(" ")[0];
      setMedlemNamn(f ? f.charAt(0).toUpperCase() + f.slice(1) : "du");
    }
  }, []);
  React.useEffect(() => setMounted(true), []);

  // Registret anpassat för denna klient (meny-ytan, behörighetsfiltrerat).
  const sektioner = MENY_REGISTER.map((s) => ({
    ...s,
    punkter: sektionPunkter(s, kontext, "meny"),
  })).filter((s) => s.punkter.length > 0);

  // Megameny — hover med 180 ms fördröjning så panelerna inte flimrar
  // (exakt samma mönster som huvudmenyn på undersidorna — EN upplevelse).
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
      setOppenSektion(null);
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

        {/* Desktop nav — registrets fyra sektioner i EXAKT huvudmeny-stil:
            EN meny-upplevelse på hela sajten (samma register, samma ordning).
            Startsidans SPA-sektioner når via fullmenyn (hamburgaren syns alltid). */}
        <nav
          ref={megamenyRef}
          aria-label="Huvudnavigation"
          className="relative ml-4 hidden items-center gap-0.5 lg:flex"
          onMouseLeave={hoverUt}
        >
          {sektioner.map((p) => {
            const PanelIkon = SEKTIONS_IKON[p.id];
            return (
              <div key={p.id} className="relative">
                <button
                  onMouseEnter={() => hoverIn(p.titel)}
                  onClick={() => setOppad(oppad === p.titel ? null : p.titel)}
                  aria-expanded={oppad === p.titel}
                  aria-haspopup="true"
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
                    oppad === p.titel
                      ? "bg-gold/15 text-gold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.nyckel ? t(p.nyckel) : p.titel}
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
                    className="absolute left-0 top-full z-50 mt-1 max-h-[70vh] w-72 overflow-y-auto rounded-xl border border-gold/30 bg-card shadow-xl"
                    onMouseEnter={() =>
                      fordrojning.current && clearTimeout(fordrojning.current)
                    }
                  >
                    {/* Paneltopp — marin med guldtext, identisk med huvudmenyn */}
                    <div className="marin-panel flex items-center gap-1.5 border-b border-gold/30 px-3 py-2 font-serif text-xs font-bold tracking-wide text-[#E8C766]">
                      <PanelIkon className="h-3.5 w-3.5" />
                      {(p.nyckel ? t(p.nyckel) : p.titel).toUpperCase()}
                    </div>
                    {p.punkter.map((punkt, i) => (
                      <MegaRad
                        key={punkt.lank}
                        punkt={punkt}
                        foregaende={p.punkter[i - 1]}
                        onStang={() => setOppad(null)}
                      />
                    ))}
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
            aria-label={t("ui.sokGenvag")}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* VÅG 61: världsväxeln Privatperson | Företag (B2B-BESLUT §3.1) —
              diskret pill i utility-raden; under sm bor den i fullmeny-
              drawerns egen rad. */}
          <Toppvaxel klass="hidden sm:inline-flex" />

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

          {/* Språkväljare SV/EN/AR — samma standard som SEO-sidornas header */}
          <SprakVaxlare />

          {/* Fullmeny — syns i ALLA storlekar på startsidan: bär SPA-sektionerna
              (PREC/Aktier) + registrets accordion. Desktop-megamyn är registret. */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Meny"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Fullmeny-drawer — fullskärm i samma design som Mobilmenyn (paper, guld,
          serif). PORTAL till body: headerns backdrop-blur skapar containing
          block som annars klipper fixed inset-0 till headerns 56px.
          Innehåll: startsidans SPA-sektioner först (de äger inga rutter),
          sedan registrets sektioner som vertikal accordion (forskning §5). */}
      {mobileOpen &&
        createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("ui.huvudmeny")}
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
                aria-label={t("ui.stangMenyn")}
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

            {/* VÅG 61: världsväxeln — EGEN RAD överst i fullmeny-drawern
                (B2B-BESLUT §3.1: "en klick från varje sida", även på mobil). */}
            <div className="mt-4">
              <Toppvaxel stor />
            </div>

            {/* Sökfält — öppnar kommandopaletten (global lyssnare) och stänger drawern.
                text-base (16px) hindrar iOS från auto-zoom vid fokus. */}
            <div className="relative mt-5">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("ui.sokPlats")}
                onFocus={oppnaSokOchStang}
                onKeyDown={(e) => e.key === "Enter" && oppnaSokOchStang()}
                className="w-full rounded-xl border border-gold/20 bg-card py-3 pl-10 pr-4 text-base text-foreground shadow-xl placeholder:text-muted-foreground focus:border-gold focus:outline-none"
              />
            </div>

            <nav className="mt-6 space-y-3" aria-label={t("ui.mobilnavigation")}>
              {/* STARTSIDAN — äkta SPA-sektioner (eged vy, inga rutter) */}
              <section className="overflow-hidden rounded-xl border border-gold/30 bg-card shadow-lg">
                <h2 className="marin-panel border-b border-gold/30 px-4 py-3 font-serif text-sm font-bold tracking-wide text-[#E8C766]">
                  🏠 {t("ui.startsidan").toUpperCase()}
                </h2>
                <div>
                  {STARTSIDAN_SEKTIONER.map((s) => {
                    const aktiv = section === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => valjSektion(s.id)}
                        aria-current={aktiv ? "true" : undefined}
                        className={cn(
                          "flex w-full items-start gap-3 border-b border-gold/10 px-4 py-3.5 text-left last:border-b-0 transition-colors hover:bg-gold/5 active:bg-gold/10",
                          aktiv && "bg-gold/10"
                        )}
                      >
                        <s.ikon
                          className={cn(
                            "mt-0.5 h-5 w-5 shrink-0",
                            aktiv ? "text-gold" : "text-muted-foreground"
                          )}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block text-base font-bold",
                              aktiv ? "text-gold" : "text-foreground"
                            )}
                          >
                            {t(s.nyckel)}
                          </span>
                          <span className="block text-sm leading-snug text-muted-foreground">
                            {t(s.beskrivningsNyckel)}
                          </span>
                        </span>
                        {aktiv && (
                          <span className="mt-1.5 shrink-0 text-gold" aria-hidden="true">
                            ●
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Registrets sektioner — vertikal accordion (endast en öppen). */}
              {sektioner.map((s) => {
                const arOppen = oppenSektion === s.id;
                return (
                  <section
                    key={s.id}
                    className="overflow-hidden rounded-xl border border-gold/30 bg-card shadow-lg"
                  >
                    <h2>
                      <button
                        type="button"
                        onClick={() => setOppenSektion(arOppen ? null : s.id)}
                        aria-expanded={arOppen}
                        aria-controls={`spa-meny-${s.id}`}
                        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
                      >
                        <span className="font-serif text-sm font-bold tracking-wide text-[#E8C766]">
                          {s.ikon} {(s.nyckel ? t(s.nyckel) : s.titel).toUpperCase()}
                        </span>
                        <ChevronDown
                          width={14}
                          height={14}
                          className={cn(
                            "text-gold transition-transform duration-300",
                            arOppen && "rotate-180"
                          )}
                          aria-hidden="true"
                        />
                      </button>
                    </h2>
                    <div
                      id={`spa-meny-${s.id}`}
                      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                        arOppen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        {s.punkter.map((punkt, i) => (
                          <DrawerRad
                            key={punkt.lank}
                            punkt={punkt}
                            foregaende={s.punkter[i - 1]}
                            onStang={() => setMobileOpen(false)}
                          />
                        ))}
                      </div>
                    </div>
                  </section>
                );
              })}
            </nav>

            {/* Guld-CTA längst ner — statusmedveten, i tumzonen (forskning §5).
                Portal är startsidans inloggningsyta och duplierar ingen registerlänk. */}
            <div className="mt-auto pt-8">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => valjSektion("portal")}
                  className="w-full rounded-xl bg-gold px-4 py-3.5 text-center text-base font-bold text-primary-foreground shadow-xl transition-opacity hover:opacity-90"
                >
                  {medlemNamn ? t("auth.namnPortal", { namn: medlemNamn }) : t("auth.loggaInPortal")}
                </button>
                {medlemNamn && (
                  <button
                    onClick={() => {
                      loggaUt();
                      setMedlemNamn(null);
                    }}
                    className="w-full rounded-xl border border-gold/30 px-4 py-2.5 text-center text-sm font-semibold text-muted-foreground hover:border-gold/60 hover:text-foreground"
                  >
                    {t("auth.loggaUt")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        , document.body)}

    </header>
  );
}

/** Megameny-rad (desktop) — lucide-ikoner, avdelare vid ny undergrupp. */
function MegaRad({
  punkt,
  foregaende,
  onStang,
}: {
  punkt: MenyPunkt;
  foregaende?: MenyPunkt;
  onStang: () => void;
}) {
  const { t, tText } = useSprak();
  // Direkt map-uppslag (etablerat mönster i kodbasen — stabila referenser).
  const Ikon = IKON_FRAN_LUCIDE[punkt.ikon] ?? Sparkles;
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
          "flex items-start gap-2.5 border-b border-gold/10 px-3 py-2.5 text-left last:border-b-0 hover:bg-gold/10",
          punkt.guldknapp && "bg-gold/10 hover:bg-gold/20"
        )}
      >
        <Ikon
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0",
            punkt.guldknapp ? "text-gold" : "text-muted-foreground"
          )}
        />
        <span className="min-w-0">
          <span
            className={cn(
              "block text-xs font-bold",
              punkt.guldknapp ? "text-gold" : "text-foreground"
            )}
          >
            {punkt.nyckel ? t(punkt.nyckel) : punkt.text}
          </span>
          <span className="block text-[10px] leading-tight text-muted-foreground">
            {punkt.beskrivning ? tText(punkt.beskrivning) : null}
          </span>
        </span>
      </Link>
    </>
  );
}

/** Drawer-rad (fullmeny) — stora tryckytor, 16 px titlar (forskning §5). */
function DrawerRad({
  punkt,
  foregaende,
  onStang,
}: {
  punkt: MenyPunkt;
  foregaende?: MenyPunkt;
  onStang: () => void;
}) {
  const { t, tText } = useSprak();
  // Direkt map-uppslag (etablerat mönster i kodbasen — stabila referenser).
  const Ikon = IKON_FRAN_LUCIDE[punkt.ikon] ?? Sparkles;
  const nyAvdelare = punkt.avdelare && punkt.avdelare !== foregaende?.avdelare;
  return (
    <>
      {nyAvdelare && (
        <div className="border-b border-gold/10 bg-gold/5 px-4 pb-1.5 pt-3 text-[11px] font-bold uppercase tracking-widest text-gold">
          {tText(punkt.avdelare ?? "")}
        </div>
      )}
      <Link
        href={punkt.lank}
        onClick={onStang}
        className={cn(
          "flex items-start gap-3 border-b border-gold/10 px-4 py-3.5 text-left last:border-b-0 hover:bg-gold/5 active:bg-gold/10",
          punkt.guldknapp && "bg-gold/10 hover:bg-gold/20"
        )}
      >
        <Ikon
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0",
            punkt.guldknapp ? "text-gold" : "text-muted-foreground"
          )}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block text-base font-bold",
              punkt.guldknapp ? "text-gold" : "text-foreground"
            )}
          >
            {punkt.nyckel ? t(punkt.nyckel) : punkt.text}
          </span>
          <span className="block text-sm leading-snug text-muted-foreground">
            {punkt.beskrivning ? tText(punkt.beskrivning) : null}
          </span>
        </span>
      </Link>
    </>
  );
}
