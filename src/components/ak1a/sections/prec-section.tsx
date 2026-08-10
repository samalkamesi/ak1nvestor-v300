"use client";

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CalendarDays,
  Fingerprint,
  Users,
  Globe,
  Building2,
  Award,
  Merge,
  Sparkles,
  ShieldCheck,
  Info,
  GraduationCap,
  FlaskConical,
  BookOpen,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Bookmark,
  Layers,
  Scale,
  CircleDot,
} from "lucide-react";
import { useAk1aStore, type Level } from "@/lib/ak1a-store";
import {
  Eyebrow,
  GoldRule,
  HonestyTag,
  SignalPill,
} from "@/components/ak1a/primitives";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Section index — drives the sticky reading-progress bar                    */
/* ────────────────────────────────────────────────────────────────────────── */

const SECTIONS = [
  { id: "omslag", label: "Omslag" },
  { id: "princip", label: "Princip" },
  { id: "rekommendation", label: "Rekommendation" },
  { id: "fem-punkter", label: "Fem punkter" },
  { id: "upp-ned", label: "Upp- / Nedgradering" },
  { id: "bolaget", label: "Bolaget" },
  { id: "affarsomraden", label: "Affärsområden" },
  { id: "intaktsmix", label: "Intäktsmix" },
  { id: "kunder", label: "Kunder" },
  { id: "historik", label: "Historik" },
  { id: "fusionen", label: "Fusionen" },
  { id: "kalender", label: "Kalender" },
  { id: "kurshistorik", label: "Kurshistorik" },
  { id: "scenarier", label: "Scenarier" },
  { id: "ga-vidare", label: "Gå vidare" },
] as const;

// The published reference labels this as a 29-section analysis.
const TOTAL_SECTIONS = 29;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Main component                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

export function PrecSection() {
  const { level, setSection, setPrecSection } = useAk1aStore();

  const [scrollPct, setScrollPct] = useState(0);
  const [activeLabel, setActiveLabel] = useState<string>(SECTIONS[0].label);
  const [activeIdx, setActiveIdx] = useState(0);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  /* ----- scroll progress + active section detection ----- */
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      setScrollPct(Math.max(0, Math.min(100, pct)));

      // Find the section whose top is closest to (but above) 160px from viewport top.
      let bestIdx = 0;
      let bestTop = -Infinity;
      for (let i = 0; i < SECTIONS.length; i++) {
        const el = sectionRefs.current[SECTIONS[i].id];
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= 160 && top > bestTop) {
          bestTop = top;
          bestIdx = i;
        }
      }
      setActiveIdx(bestIdx);
      setActiveLabel(SECTIONS[bestIdx].label);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Persist reading position into the global store (used by header/summary).
  useEffect(() => {
    setPrecSection(activeIdx + 1);
  }, [activeIdx, setPrecSection]);

  const registerRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      sectionRefs.current[id] = el;
    },
    []
  );

  // Sections read so far as a fraction of the published 29.
  const sectionsRead = Math.min(
    TOTAL_SECTIONS,
    Math.max(1, Math.round((activeIdx / (SECTIONS.length - 1)) * (TOTAL_SECTIONS - 1)) + 1)
  );

  return (
    <div className="paper-texture">
      {/* ───────────── STICKY READING-PROGRESS BAR ───────────── */}
      <div className="sticky top-[57px] z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2">
          <div className="flex items-center justify-between gap-4 text-[11px] uppercase tracking-wider text-muted-foreground">
            <div className="flex items-center gap-2 min-w-0">
              <Bookmark className="h-3.5 w-3.5 text-gold" />
              <span className="font-semibold text-foreground">
                {sectionsRead}/{TOTAL_SECTIONS} sektioner
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline truncate">
                {activeLabel}
              </span>
            </div>
            <span className="font-mono font-semibold text-gold tabular-nums">
              {Math.round(scrollPct)}%
            </span>
          </div>
          <Progress
            value={scrollPct}
            className="mt-1.5 h-[3px] bg-border [&>[data-slot=progress-indicator]]:bg-gold"
          />
        </div>
      </div>

      {/* ───────────── OMSLAG (cover) ───────────── */}
      <section
        id="omslag"
        ref={registerRef("omslag")}
        className="relative overflow-hidden border-b border-border"
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
          <Eyebrow>
            NASDAQ STOCKHOLM SMALL CAP · SEK · INFORMATIONSTEKNIK / PROGRAMVARA
          </Eyebrow>

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <span className="text-gold">AK1A Research Lab</span>
            <span className="text-border">·</span>
            <span>Nybörjaranalys</span>
            <span className="hidden sm:inline text-border">·</span>
            <span className="hidden sm:inline">
              5 tidshorisonter × 5 teorier × 4 dimensioner
            </span>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-end">
            <div>
              <h1 className="font-serif text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Precise Biometrics AB
              </h1>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                PREC.ST · Nasdaq Stockholm Small Cap
              </p>

              {/* Recommendation badge */}
              <div className="mt-6 inline-flex flex-col items-start rounded-lg border-2 border-gold bg-gold/[0.06] px-6 py-4">
                <div className="flex items-center gap-2">
                  <CircleDot className="h-5 w-5 text-gold" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                    AK1A-rekommendation
                  </span>
                </div>
                <span className="mt-1 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                  FÖRSIKTIGT KÖP
                </span>
                <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Spekulativt · Händelsedriven special situation
                </span>
              </div>

              <p className="mt-5 max-w-xl text-base text-muted-foreground leading-relaxed">
                Fusion genomförd 20/7 · Emission 0,82 SEK (91 % garanterad).
              </p>
            </div>

            {/* Mini quote / verifiering */}
            <Card className="border-gold/30 bg-gradient-to-br from-card to-gold/[0.04] p-5">
              <div className="flex items-center justify-between">
                <Eyebrow>Snabb slutsats</Eyebrow>
                <HonestyTag kind="matt" />
              </div>
              <p className="mt-3 font-serif text-lg font-medium leading-snug">
                “Ett verkligt vändningsläge — men köp det{" "}
                <span className="text-gold">försiktigt</span> och i trappor.”
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Vägt prismål 1,38 SEK · +9 % mot TERP · +69 % mot teckningskurs
              </p>
            </Card>
          </div>

          {/* ── Stat grid (12 tiles) ── */}
          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
            <StatTile value="1,676" label="Stängning SEK 20/7" sub="2026-07-20" />
            <StatTile value="245,9 M" label="Börsvärde" sub="146,7 M aktier" />
            <StatTile
              value="1,38"
              label="Vägt prismål 12 mån"
              sub="SEK"
              accent="gold"
            />
            <StatTile
              value="HÖG"
              label="Risknivå"
              sub="Volatilitet ~90 %/år"
              accent="bear"
            />
            <StatTile value="0,82" label="Teckningskurs" sub="SEK" />
            <StatTile
              value="91 %"
              label="Garanterad emission"
              sub="av 110,3 MSEK"
              accent="gold"
            />
            <StatTile value="2,3x" label="P/S post-emission" sub="vid TERP" />
            <StatTile
              value="281,2 M"
              label="Aktier efter emission"
              sub="vid full teckning"
            />
            <StatTile value="Nybörjare" label="Målgrupp" sub="Tier 2 · 3" />
            <StatTile value="99" label="Antal sidor" sub="institutionsdjup" />
            <StatTile
              value="2026-07-22"
              label="Verifierad"
              sub="senaste granskning"
            />
            <StatTile value="MarketStack + Bolag" label="Datakälla" sub="primär" />
          </div>
        </div>
      </section>

      {/* ───────────── PRINCIP / PEDAGOGISK FINANSANALYS ───────────── */}
      <section
        id="princip"
        ref={registerRef("princip")}
        className="border-b border-border bg-muted/30"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <Eyebrow>Pedagogisk finansanalys</Eyebrow>
              <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                Skriven på enkel svenska — i “du”-form.
              </h2>
              <p className="mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
                Varje begrepp förklaras första gången det dyker upp. Du behöver
                inte kunna något om aktier eller teknik sedan tidigare. Det här
                är en analys byggd för att läsas uppifrån och ner — inte för att
                imponera, utan för att du ska förstå.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <HonestyTag kind="matt" />
                <Badge variant="outline" className="border-border">
                  Verifierad 2026-07-22
                </Badge>
                <Badge variant="outline" className="border-border">
                  99 sidor
                </Badge>
                <Badge variant="outline" className="border-border">
                  Datakälla: MarketStack · Bolag · Fusionsdokument
                </Badge>
              </div>
            </div>

            <Card className="border-gold/40 bg-card p-6">
              <Eyebrow>Vår princip</Eyebrow>
              <GoldRule className="my-3 max-w-[6rem]" />
              <p className="font-serif text-2xl font-bold leading-snug">
                Håll know-how helt — redovisa generöst.
              </p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Slutsatser, scenarier, risker och rekommendationer är fullt
                offentliga. De proprietära metoderna bakom — vågräkningar,
                kvoter, formler, positionsregler — bevaras som vårt know-how.
              </p>
              <Separator className="my-4 bg-border" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Pedagogisk finansanalys — inte investeringsråd. Verifierad
                2026-07-22. Datakälla: MarketStack · Bolagsrapporter ·
                Fusionsdokument.
                <br />
                Ägare: Ak1 Apex Nexus via AK1nvestor.com · Kontakt:
                info@ak1nvestor.com
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ───────────── DEL X · KONSENSUS — REKOMMENDATION ───────────── */}
      <section
        id="rekommendation"
        ref={registerRef("rekommendation")}
        className="border-b border-border"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Del X · Konsensus</Eyebrow>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            Rekommendation
          </h2>
          <p className="mt-3 max-w-3xl text-base text-muted-foreground leading-relaxed">
            Fem tidshorisonter × fem teorier × fyra dimensioner, fundamental
            analys, scenarier och risker — sammanfattat i ett enda svar.
          </p>

          {/* Beginner callout — level aware */}
          {level === "nyborjare" && (
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-bull/30 bg-bull/[0.06] p-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-bull" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  För nybörjare — vad betyder “försiktigt köp”?
                </p>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  Det betyder: köp, men bara med pengar du kan tänka dig att
                  förlora, och sprid köpen över tid (“trappa in”). Vi rekommenderar
                  0,5–2 % av din portfölj. Längre ner förklarar vi exakt vad som
                  skulle få oss att säga <em>köp</em> eller <em>sälj</em> istället.
                </p>
              </div>
            </div>
          )}
          {level === "avancerad" && (
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-gold/30 bg-gold/[0.04] p-4">
              <Layers className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Analytiker-vy — metodkommentar
                </p>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  Rekommendationen är en viktad konsensus av 25 våg-teoretiska
                  banor × 4 dimensioner (prismål, risk, timing, position) ×
                  fundamental scenarieviktning. Vågräkningar, Fibonacci-kvoter och
                  positionsformler redovisas inte — slutsatserna däremot fullt ut.
                </p>
              </div>
            </div>
          )}

          {/* Main recommendation card */}
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <Card className="overflow-hidden border-gold/40">
              <div className="bg-gradient-to-br from-gold/[0.08] to-transparent p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <Eyebrow>AK1A-rekommendation · 12 månader</Eyebrow>
                  <HonestyTag kind="metodmal" />
                </div>
                <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-1">
                  <span className="font-serif text-5xl font-bold tracking-tight text-gold sm:text-6xl">
                    FÖRSIKTIGT KÖP
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Cautious Buy · Spekulativt
                </p>

                <ul className="mt-6 grid gap-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                    Endast spekulativt kapital
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                    Position 0,5–2 % av portföljen
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                    Trappad ingång
                  </li>
                </ul>
              </div>
            </Card>

            {/* Price target & risk summary */}
            <Card className="bg-card p-6">
              <Eyebrow>Vägt prismål</Eyebrow>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-serif text-5xl font-bold tabular-nums">
                  1,38
                </span>
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  SEK
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border border-bull/30 bg-bull/[0.06] px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-bull">
                    Mot TERP 1,27
                  </div>
                  <div className="font-mono text-base font-semibold text-bull">
                    +9 %
                  </div>
                </div>
                <div className="rounded-md border border-bull/30 bg-bull/[0.06] px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-bull">
                    Mot teckningskurs 0,82
                  </div>
                  <div className="font-mono text-base font-semibold text-bull">
                    +69 %
                  </div>
                </div>
              </div>
              <Separator className="my-4 bg-border" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Spann 12 mån</span>
                <span className="font-mono font-semibold tabular-nums">
                  0,93 – 2,03 SEK
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Risk</span>
                <SignalPill signal="bear" label="HÖG" />
              </div>
            </Card>
          </div>

          {/* Recommendation scale — 5 steps */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <Eyebrow>Rekommendationsskalan · 5 steg</Eyebrow>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Du är här · 3 av 5
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-stretch gap-2">
              <ScaleStep label="SÄLJ" tone="bear" />
              <ScaleStep label="MINSKA" tone="bear-soft" />
              <ScaleStep label="FÖRSIKTIGT KÖP" tone="gold" active />
              <ScaleStep label="KÖP" tone="bull-soft" />
              <ScaleStep label="STARKT KÖP" tone="bull" />
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── MOTIVERINGEN I FEM PUNKTER ───────────── */}
      <section
        id="fem-punkter"
        ref={registerRef("fem-punkter")}
        className="border-b border-border bg-muted/30"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Motiveringen</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Fem punkter — varför försiktigt köp.
          </h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Varje punkt bygger vidare på den förra. Tillsammans förklarar de varför
            vi inte säger <em>köp</em> rakt av — och vad som saknas för att vi
            ska göra det.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MotivationCard
              n={1}
              title="Positivt väntevärde"
              icon={<TrendingUp className="h-5 w-5" />}
              tone="bull"
            >
              Scenarieviktningen (Bull 20 % × 2,03 + Base 50 % × 1,40 + Bear 30 %
              × 0,93) ger 1,38 SEK = +9 % mot TERP 1,27 (och +69 % mot
              teckningskursen 0,82). Uppsidan (+60 % i Bull mot TERP) är 2,2×
              nedsidan (−27 % i Bear).
            </MotivationCard>

            <MotivationCard
              n={2}
              title="Strukturell katalysator på plats"
              icon={<Merge className="h-5 w-5" />}
              tone="bull"
            >
              Fusionen är genomförd (registrerad 20/7), emissionen är till 91 %
              garanterad (100/110,3 MSEK), och synergimålet (45 MSEK) är större
              än hela proforma EBITDA-hålet (−19 MSEK). Det finns en verklig
              vändningsmekanism — inte bara hopp.
            </MotivationCard>

            <MotivationCard
              n={3}
              title="Värderingen är låg"
              icon={<Scale className="h-5 w-5" />}
              tone="bull"
            >
              P/S 2,3x och P/B ~0,8x post-emission (vid TERP) mot historiskt
              spann på 0,5x–30x+; EV/(EBITDA+synergier) ~4,1x. Marknaden
              prissätter redan mycket motvind — det är när uppsidan är störst.
            </MotivationCard>

            <MotivationCard
              n={4}
              title="Men: tekniskt svagt läge + emission pågår"
              icon={<TrendingDown className="h-5 w-5" />}
              tone="bear"
            >
              Kursen ligger under alla medelvärden i bearish ordning, och 110,3
              MSEK hämtas till 0,82 SEK på 245,9 MSEK börsvärde — 47,8 %
              utspädning för passiva. Historien (2023) säger: fall in i
              emissionen, rekyl efter. Att köpa allt före ex-rätt är att köpa
              osäkerheten på topp.
            </MotivationCard>

            <MotivationCard
              n={5}
              title='Därför "försiktigt"'
              icon={<ShieldCheck className="h-5 w-5" />}
              tone="gold"
            >
              Trappa in (rätter nu / TERP-zonen 1,26–1,30 / styrka över 1,40
              efter utfallet ~13/8), håll positionen på 0,5–2 %, och respektera
              0,82-ankaret som hård omprövningsnivå. Full KÖP-rekommendation
              kräver: emission klar ≥91 % + stängning över 1,75 + första
              synergiebeviset.
            </MotivationCard>

            {level === "intermediar" || level === "avancerad" ? (
              <Card className="border-border bg-card p-5">
                <Eyebrow>Nyckeltal i korthet</Eyebrow>
                <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                  <KeyRow k="P/S post-emission" v="2,3x" />
                  <KeyRow k="P/B post-emission" v="~0,8x" />
                  <KeyRow k="EV / (EBITDA+syn)" v="~4,1x" />
                  <KeyRow k="Utspädning passiva" v="47,8 %" />
                  <KeyRow k="TERP" v="1,27 SEK" />
                  <KeyRow k="Proforma EBITDA" v="−19 MSEK" />
                  <KeyRow k="Synergimål" v="45 MSEK" />
                  <KeyRow k="Volatilitet" v="~90 %/år" />
                </dl>
              </Card>
            ) : (
              <Card className="border-border bg-card p-5">
                <Eyebrow>Sammanfattning</Eyebrow>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Två starka skäl att köpa (väntevärde + katalysator), ett skäl
                  att vänta (tekniskt svagt läge). Därför: köp — men
                  försiktigt, och i trappor.
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Byt till <span className="font-semibold">Intermediär</span> i
                  toppmenyn för att se fler nyckeltal.
                </p>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* ───────────── UPPGRADERING / NEDGRADERING ───────────── */}
      <section
        id="upp-ned"
        ref={registerRef("upp-ned")}
        className="border-b border-border"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Triggeröversikt</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            När vi höjer — och när vi sänker.
          </h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Rekommendationen är inte statisk. Här är de konkreta händelser som
            skulle flytta oss ett steg på skalan.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card className="border-bull/40 bg-bull/[0.05] p-6">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-bull" />
                <h3 className="font-serif text-xl font-bold text-bull">
                  Uppgradering till KÖP
                </h3>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                <UpgradeItem>Emission övertecknad utöver 91 %</UpgradeItem>
                <UpgradeItem>Stängning över 1,75 SEK på veckobasis</UpgradeItem>
                <UpgradeItem>Första kvartalet med bevisad synergieffekt</UpgradeItem>
                <UpgradeItem>
                  Q3-rapport 13/11 visar positivt konsoliderat EBITDA
                </UpgradeItem>
              </ul>
            </Card>

            <Card className="border-bear/40 bg-bear/[0.05] p-6">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="h-5 w-5 text-bear" />
                <h3 className="font-serif text-xl font-bold text-bear">
                  Nedgradering till SÄLJ
                </h3>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                <DowngradeItem>
                  Emissionsutfall under 91 % med stor garantifördelning
                </DowngradeItem>
                <DowngradeItem>Brott under 0,82 SEK på veckobasis</DowngradeItem>
                <DowngradeItem>Synergiebesked beskuret (&lt; 30 MSEK)</DowngradeItem>
                <DowngradeItem>
                  Goodwill-nedskrivning i FPC-förvärvsanalysen
                </DowngradeItem>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* ───────────── DEL I · BOLAGET ───────────── */}
      <section
        id="bolaget"
        ref={registerRef("bolaget")}
        className="border-b border-border bg-muted/30"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Del I · Bolaget</Eyebrow>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            Bolaget i korthet
          </h2>
          <p className="mt-3 max-w-3xl text-base text-muted-foreground leading-relaxed">
            Precise Biometrics AB (1997) säljer mjukvara för biometri — teknik
            som känner igen människor via kroppen i stället för lösenord. 46
            medarbetare, 800+ kunder, 100 000+ verifieringar/sekund globalt.
          </p>

          {/* Stat tiles */}
          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
            <IconStatTile
              icon={<Building2 className="h-4 w-4" />}
              value="1997"
              label="Grundat"
              sub="Lund, Sverige"
            />
            <IconStatTile
              icon={<Users className="h-4 w-4" />}
              value="46"
              label="Medarbetare"
              sub="globalt"
            />
            <IconStatTile
              icon={<Globe className="h-4 w-4" />}
              value="6 länder"
              label="Kontor"
              sub="Norden · Asien · USA"
            />
            <IconStatTile
              icon={<Fingerprint className="h-4 w-4" />}
              value="40+"
              label="OEM-integrationer"
              sub="tillverkare"
            />
          </div>

          {/* Vad är biometri? — accordion, level-aware default open */}
          <div className="mt-8">
            <Card className="overflow-hidden border-border bg-card">
              <Accordion
                type="single"
                collapsible
                defaultValue={level === "nyborjare" ? "biometri" : undefined}
              >
                <AccordionItem value="biometri" className="border-b-0 px-5">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Fingerprint className="h-5 w-5 text-gold" />
                      <div className="text-left">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                          Förklaring
                        </div>
                        <div className="font-serif text-lg font-bold">
                          Vad är biometri?
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    <p>
                      Biometri betyder “kroppsmätning”. När du låser upp mobilen
                      med fingret eller ansiktet är det biometri. Precise säljer
                      inte sensorerna (hårdvaran) utan <strong>algoritmerna</strong> —
                      hjärnan som avgör om fingeravtrycket är ditt, om handen är
                      levande (inte ett foto) och som förbättrar bilden innan
                      matchning. Kunderna betalar en licensavgift per år plus en
                      liten royalty för varje såld enhet som använder tekniken.
                    </p>
                    {level !== "nyborjare" && (
                      <p className="mt-3">
                        <strong>Affärslogiken i en mening:</strong> högre
                        enhetsvolym → mer royalty → hög operationell hävstång.
                        Därför är 42 % av intäkterna volymkänsliga.
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          </div>
        </div>
      </section>

      {/* ───────────── TVÅ AFFÄRSOMRÅDEN · 2025 ───────────── */}
      <section
        id="affarsomraden"
        ref={registerRef("affarsomraden")}
        className="border-b border-border"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Del I · Bolaget</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Två affärsområden · 2025
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card className="overflow-hidden border-border">
              <div className="bg-gradient-to-br from-gold/[0.08] to-transparent p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <Eyebrow>Affärsområde 1</Eyebrow>
                    <h3 className="mt-2 font-serif text-2xl font-bold">
                      Biometric Technologies
                    </h3>
                  </div>
                  <span className="font-serif text-4xl font-bold text-gold">
                    72 %
                  </span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  Algoritmer: BioMatch (matchning), BioLive (anti-spoofing),
                  BioEnhance (bildförbättring) + experttjänster och syntetisk
                  datagenerering.
                </p>
                <Separator className="my-4 bg-border" />
                <div className="grid grid-cols-2 gap-4">
                  <MiniMetric
                    label="Omsättning 2025"
                    value="56,4 MSEK"
                    icon={<Activity className="h-4 w-4" />}
                  />
                  <MiniMetric
                    label="Bruttomarginal"
                    value="82,4 %"
                    icon={<TrendingUp className="h-4 w-4" />}
                    tone="bull"
                  />
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border-border">
              <div className="bg-gradient-to-br from-gold/[0.05] to-transparent p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <Eyebrow>Affärsområde 2</Eyebrow>
                    <h3 className="mt-2 font-serif text-2xl font-bold">
                      Digital Identity
                    </h3>
                  </div>
                  <span className="font-serif text-4xl font-bold text-gold/80">
                    28 %
                  </span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  Precise Access (biometrisk access till byggnader) och Precise
                  Visit by EastCoast (moln-besökshantering, marknadsledande i
                  Norden).
                </p>
                <Separator className="my-4 bg-border" />
                <div className="grid grid-cols-2 gap-4">
                  <MiniMetric
                    label="Omsättning 2025"
                    value="21,4 MSEK"
                    icon={<Activity className="h-4 w-4" />}
                  />
                  <MiniMetric
                    label="Bruttomarginal"
                    value="~48 %"
                    icon={<Activity className="h-4 w-4" />}
                    tone="neutral"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ───────────── INTÄKTSMIX 2025 ───────────── */}
      <section
        id="intaktsmix"
        ref={registerRef("intaktsmix")}
        className="border-b border-border bg-muted/30"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Del I · Bolaget</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Intäktsmix 2025
          </h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Summa 2025: <strong>77,8 MSEK</strong>. Royalty är den mest
            volymkänsliga delen (42 %) — den stiger snabbt med enhetsförsäljning
            hos OEM-kunder.
          </p>

          <Card className="mt-8 border-border bg-card p-6">
            {/* Stacked horizontal bar */}
            <div className="flex h-12 w-full overflow-hidden rounded-md border border-border">
              <div
                className="flex items-center justify-center bg-gold/80 text-xs font-semibold text-background"
                style={{ width: "42%" }}
                title="Royalty 42 %"
              >
                Royalty · 42 %
              </div>
              <div
                className="flex items-center justify-center bg-gold text-xs font-semibold text-background"
                style={{ width: "50%" }}
                title="Licenser & support 50 %"
              >
                Licenser & support · 50 %
              </div>
              <div
                className="flex items-center justify-center bg-gold/40 text-xs font-semibold text-foreground"
                style={{ width: "7%" }}
                title="Övrigt 7 %"
              >
                7 %
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <LegendItem color="bg-gold/80" label="Royalty" sub="42 % · mest volymkänslig" />
              <LegendItem
                color="bg-gold"
                label="Licenser & support"
                sub="50 % · återkommande"
              />
              <LegendItem color="bg-gold/40" label="Övrigt" sub="7 % · experttjänster m.m." />
            </div>

            <Separator className="my-5 bg-border" />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <HonestyTag kind="matt" />
                <span className="text-sm text-muted-foreground">
                  Intäkter 2025 enligt bolagsrapport
                </span>
              </div>
              <div className="font-mono text-sm font-semibold tabular-nums">
                Summa: 77,8 MSEK
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ───────────── KUNDER OCH FRAMGÅNGAR ───────────── */}
      <section
        id="kunder"
        ref={registerRef("kunder")}
        className="border-b border-border"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Del I · Bolaget</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Kunder och framgångar du känner igen
          </h2>

          <div className="mt-6 flex flex-wrap gap-2">
            <CustomerBadge>Google</CustomerBadge>
            <CustomerBadge>Huawei</CustomerBadge>
            <CustomerBadge>Lenovo</CustomerBadge>
            <CustomerBadge>Xiaomi</CustomerBadge>
            <CustomerBadge>UIDAI / Aadhaar (Indien · 1,3 mdr människor)</CustomerBadge>
            <CustomerBadge>FPC (numera dotterbolag efter fusion)</CustomerBadge>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card className="border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-gold" />
                <Eyebrow>40+ tillverkare</Eyebrow>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Fingeravtrycksmjukvaran är integrerad i mobiler från över 40
                tillverkare globalt — varje såld enhet genererar royalty.
              </p>
            </Card>

            <Card className="border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-gold" />
                <Eyebrow>Aadhaar · UIDAI</Eyebrow>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                BioLive godkänt av Indiens UIDAI för Aadhaar — världens största
                biometriska ID-program (1,3 miljarder människor).
              </p>
            </Card>

            <Card className="border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-gold" />
                <Eyebrow>Xiaomi · 2025-01-09</Eyebrow>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Xiaomis smarta kassaskåp lanserades 9 januari 2025 med
                PREC-teknik — ett tidigt exempel på nya royalty-kategorier utan
                för mobil.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ───────────── DEL II · HISTORIK ───────────── */}
      <section
        id="historik"
        ref={registerRef("historik")}
        className="border-b border-border bg-muted/30"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Del II · Historik</Eyebrow>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            Prec:s resa 1997–2026
          </h2>
          <p className="mt-3 max-w-3xl text-base text-muted-foreground leading-relaxed">
            Från Lund-startup till Nordens största biometribolag. 29 år av
            innovation, kriser och vändningar — visualiserade som en tidslinje.
          </p>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
            <StatTile value="29" label="År sedan grundning" sub="1997 → 2026" />
            <StatTile value="7" label="Positiva milstolpar" sub="bull" accent="bull" />
            <StatTile value="4" label="Negativa milstolpar" sub="bear" accent="bear" />
            <StatTile value="14" label="Totalt händelser" sub="katalogiserade" />
          </div>

          {/* Timeline */}
          <div className="mt-10 relative">
            <div className="absolute left-[15px] sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/60 via-border to-gold/30 sm:-translate-x-1/2" />
            <ol className="space-y-8">
              <TimelineNode
                year="1997"
                title="Precise Biometrics grundas"
                tag="Grundning"
                signal="neutral"
                side="left"
              >
                Bolaget grundas i Lund med visionen att utveckla mjukvara för
                biometrisk identifiering.
              </TimelineNode>

              <TimelineNode
                year="2002"
                title="Notering på Nasdaq Stockholm"
                tag="Finansiell"
                signal="bull"
                side="right"
              >
                PREC noteras på Small Cap-listan och får tillgång till
                kapitalmarknaden.
              </TimelineNode>

              <TimelineNode
                year="2010"
                title="Första stora OEM-avtalet"
                tag="Affär"
                signal="bull"
                side="left"
              >
                Fingeravtrycksalgoritmen integreras hos en stor
                mobiltillverkare — affärsmodellen med royalty föds.
              </TimelineNode>

              <TimelineNode
                year="2017"
                title="BioLive godkänt av UIDAI / Aadhaar"
                tag="Produkt"
                signal="bull"
                side="right"
              >
                Anti-spoofing-tekniken blir en del av världens största
                biometriska ID-program (1,3 mdr människor).
              </TimelineNode>

              <TimelineNode
                year="2020"
                title="Omsättningsnedgång & omstrukturering"
                tag="Finansiell"
                signal="bear"
                side="left"
              >
                Pandemin sänker OEM-volymen; bolaget stramar upp och
                prioriterar lönsamhet framför volym.
              </TimelineNode>

              <TimelineNode
                year="2023"
                title="Ny emission — kursfall sedan rekyl"
                tag="Finansiell"
                signal="bear"
                side="right"
              >
                En erfarenhet som präglar årets rekommendation: fall in i
                emissionen, rekyl efter utfallet.
              </TimelineNode>

              <TimelineNode
                year="2025"
                title="Precise Visit by EastCoast lanseras"
                tag="Produkt"
                signal="bull"
                side="left"
              >
                Moln-besökshantering blir marknadsledande i Norden och breddar
                Digital Identity-affären.
              </TimelineNode>

              <TimelineNode
                year="2026"
                title="Fusion med FPC registrerad 20/7"
                tag="Fusion"
                signal="bull"
                side="right"
                highlight
              >
                FPC blir dotterbolag. Synergimål 45 MSEK &gt; proforma
                EBITDA-hål −19 MSEK. Emission till 91 % garanterad.
              </TimelineNode>
            </ol>
          </div>
        </div>
      </section>

      {/* ───────────── DEL III · FUSIONEN ───────────── */}
      <section
        id="fusionen"
        ref={registerRef("fusionen")}
        className="border-b border-border"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Del III · Fusionen</Eyebrow>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            Fusionen med FPC
          </h2>
          <p className="mt-3 max-w-3xl text-base text-muted-foreground leading-relaxed">
            Den 20 juli 2026 registrerades fusionen med Fingerprint Cards (FPC).
            FPC blir dotterbolag i Precise-koncernen. Syftet: bygga Nordens
            starkaste biometri-hus under ett tak — mjukvara, algoritmer och
            sensorer i samma bolag.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card className="border-border bg-card p-6">
              <Eyebrow>Vändningsmekanismen</Eyebrow>
              <GoldRule className="my-3 max-w-[5rem]" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                Tre konkreta pusselbitar på plats samtidigt:
              </p>
              <ol className="mt-4 space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="font-serif text-xl font-bold text-gold">
                    1.
                  </span>
                  <span>
                    <strong>Fusionen är genomförd</strong> (registrerad 20/7) —
                    osäkerheten om huruvida den blir av är borta.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-serif text-xl font-bold text-gold">
                    2.
                  </span>
                  <span>
                    <strong>Emissionen är till 91 % garanterad</strong> (100 av
                    110,3 MSEK) — kapitalet finns säkrat.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-serif text-xl font-bold text-gold">
                    3.
                  </span>
                  <span>
                    <strong>Synergimålet (45 MSEK) är större än hela
                    proforma EBITDA-hålet (−19 MSEK)</strong> — det finns en
                    verklig väg till lönsamhet, inte bara hopp.
                  </span>
                </li>
              </ol>
            </Card>

            <Card className="border-gold/30 bg-gradient-to-br from-card to-gold/[0.04] p-6">
              <Eyebrow>Fusion i siffror</Eyebrow>
              <dl className="mt-4 space-y-3 text-sm">
                <KeyRow k="Registrerad" v="20 juli 2026" />
                <KeyRow k="Emissionslikvid" v="110,3 MSEK" />
                <KeyRow k="Teckningskurs" v="0,82 SEK" />
                <KeyRow k="Garanterad" v="91 % (100 MSEK)" accent="gold" />
                <KeyRow k="Synergimål" v="45 MSEK/år" accent="bull" />
                <KeyRow k="Proforma EBITDA" v="−19 MSEK" accent="bear" />
                <KeyRow k="Utspädning (passiva)" v="47,8 %" />
              </dl>
            </Card>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <HonestyTag kind="matt" />
            <span className="text-xs text-muted-foreground">
              Siffror från fusionsdokument och bolagsrapport. Verifierad
              2026-07-22.
            </span>
          </div>
        </div>
      </section>

      {/* ───────────── DEL IV · KALENDER ───────────── */}
      <section
        id="kalender"
        ref={registerRef("kalender")}
        className="border-b border-border bg-muted/30"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Del IV · Kalender</Eyebrow>
              <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
                Kommande katalysatorer
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-4 w-4 text-gold" />
              <span>Källa: bolagets IR-kalender · fusionsdokument</span>
            </div>
          </div>

          <Card className="mt-8 overflow-hidden border-border">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 border-b border-border bg-muted/60 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span>Datum</span>
              <span>Händelse</span>
              <span className="text-right">Påverkan</span>
            </div>
            <ul className="divide-y divide-border">
              <CalendarRow
                date="~13/8 2026"
                title="Emissionsutfall offentliggörs"
                body="Slutgiltigt teckningsgrad och eventuell garantifördelning. Huvudtrigger för rekommendationen."
                signal="bull"
                signalLabel="Positivt om ≥91 %"
              />
              <CalendarRow
                date="Aug–sep 2026"
                title="Första synergiebeviset"
                body="Första konkreta besked om realiserade kostnadssynergier från FPC-integrationen."
                signal="bull"
                signalLabel="Bull om ≥10 MSEK"
              />
              <CalendarRow
                date="13/11 2026"
                title="Q3-rapport"
                body="Första konsoliderade rapporten med FPC medtagen i del av perioden."
                signal="neutral"
                signalLabel="Katalysator"
              />
              <CalendarRow
                date="Q4 2026"
                title="Capital Markets Day"
                body="Väntat tillfälle då ledningen presenterar långsiktiga mål för det sammanslagna bolaget."
                signal="bull"
                signalLabel="Bull"
              />
              <CalendarRow
                date="Feb 2027"
                title="Helårsrapport 2026"
                body="Första fullårsredovisning med FPC. Goodwill-prov i förvärvsanalysen."
                signal="neutral"
                signalLabel="Risk för nedskrivning"
              />
              <CalendarRow
                date="Löpande"
                title="OEM-avtal & volymtillväxt"
                body="Nya royalty-bärande avtal driver den volymkänsliga intäktsdelen (42 %)."
                signal="bull"
                signalLabel="Bull"
              />
              <CalendarRow
                date="Löpande"
                title="Brott under 0,82 SEK"
                body="Om kursen bryter teckningskursen på veckobasis är den tekniska bilden bruten — trigger för nedgradering."
                signal="bear"
                signalLabel="Bear"
              />
            </ul>
          </Card>
        </div>
      </section>

      {/* ───────────── DEL V · KURSHISTORIK ───────────── */}
      <section
        id="kurshistorik"
        ref={registerRef("kurshistorik")}
        className="border-b border-border"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Del V · Kurshistorik</Eyebrow>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            Prisbild & läge
          </h2>
          <p className="mt-3 max-w-3xl text-base text-muted-foreground leading-relaxed">
            Stängning 1,676 SEK den 20/7 2026 — dagen fusionen registrerades.
            Emissionskursen 0,82 SEK sätter ett tekniskt ankare, och TERP
            (teoretisk ex-rätt-pris) 1,27 SEK är referenspunkten för
            rekommendationen.
          </p>

          {/* Price ladder viz */}
          <Card className="mt-8 border-border bg-card p-6">
            <Eyebrow>Prisstege — viktiga nivåer</Eyebrow>
            <div className="mt-5 space-y-3">
              <PriceLevel
                label="Bull-mål 12 mån"
                value="2,03 SEK"
                pct={100}
                tone="bull"
                hint="+60 % mot TERP"
              />
              <PriceLevel
                label="Stängning 20/7"
                value="1,676 SEK"
                pct={82}
                tone="gold"
                hint="senaste observerade kurs"
              />
              <PriceLevel
                label="Base-mål 12 mån"
                value="1,40 SEK"
                pct={68}
                tone="neutral"
                hint="+10 % mot TERP"
              />
              <PriceLevel
                label="Vägt prismål"
                value="1,38 SEK"
                pct={67}
                tone="gold"
                hint="AK1A:s vägda mål"
                strong
              />
              <PriceLevel
                label="TERP (ex-rätt)"
                value="1,27 SEK"
                pct={62}
                tone="neutral"
                hint="teoretisk ex-rätt-pris"
              />
              <PriceLevel
                label="Bear-mål 12 mån"
                value="0,93 SEK"
                pct={45}
                tone="bear"
                hint="−27 % mot TERP"
              />
              <PriceLevel
                label="Teckningskurs"
                value="0,82 SEK"
                pct={40}
                tone="bear"
                hint="hård omprövningsnivå"
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>0,82 SEK</span>
              <span>Skala baserad på spann 0,93–2,03 SEK</span>
              <span>2,03 SEK</span>
            </div>
          </Card>
        </div>
      </section>

      {/* ───────────── SCENARIER ───────────── */}
      <section
        id="scenarier"
        ref={registerRef("scenarier")}
        className="border-b border-border bg-muted/30"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Scenarieviktning</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Tre scenarier — ett vägt mål
          </h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Vi tilldelar sannolikhet till tre utfall och viktar fram ett
            förväntat värde. Det är detta värde (1,38 SEK) som sätter prismålet.
          </p>

          <Card className="mt-8 overflow-hidden border-border">
            <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-4 border-b border-border bg-muted/60 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span>Scenario</span>
              <span>Beskrivning</span>
              <span className="text-right">Sannolikhet</span>
              <span className="text-right">Pris</span>
            </div>
            <ul className="divide-y divide-border">
              <ScenarioRow
                signal="bull"
                name="Bull"
                weight="20 %"
                price="2,03 SEK"
                body="Emission övertecknad, synergier bevisas tidigt, kurs bryter 1,75."
              />
              <ScenarioRow
                signal="neutral"
                name="Base"
                weight="50 %"
                price="1,40 SEK"
                body="Emission ~91 %, första synergier synliga i Q3-rapporten."
              />
              <ScenarioRow
                signal="bear"
                name="Bear"
                weight="30 %"
                price="0,93 SEK"
                body="Stor garantifördelning, tekniskt svag rekyl, goodwill-prov hotar."
              />
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gold/[0.06] px-5 py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Vägt prismål (Σ p × P)
                </span>
              </div>
              <span className="font-serif text-3xl font-bold tabular-nums text-gold">
                1,38 SEK
              </span>
            </div>
          </Card>

          <p className="mt-4 text-xs text-muted-foreground">
            0,20 × 2,03 + 0,50 × 1,40 + 0,30 × 0,93 = 1,38 SEK.
            Uppsidan (+60 % mot TERP) är 2,2× nedsidan (−27 % mot TERP).
          </p>
        </div>
      </section>

      {/* ───────────── GÅ VIDARE (footer CTAs) ───────────── */}
      <section
        id="ga-vidare"
        ref={registerRef("ga-vidare")}
        className="border-b border-border"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="text-center">
            <Eyebrow>Gå vidare</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Du har läst analysen. Gör något av det.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Tre naturliga nästa steg — välj det som passar var du är.
            </p>
            <GoldRule className="mx-auto my-6 max-w-xs" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <CtaCard
              icon={<GraduationCap className="h-5 w-5" />}
              tier="Nästa steg · 1"
              title="Lär dig metoden"
              body="AKM1:s 20 variabler — den struktur som ligger bakom den här analysen."
              cta="GÅ TILL KURSER"
              onClick={() => setSection("kurser")}
            />
            <CtaCard
              icon={<FlaskConical className="h-5 w-5" />}
              tier="Nästa steg · 2"
              title="Reproducera i Labbet"
              body="Öppna Labbet och bygg samma scenarioanalys själv — med dina egna antaganden."
              cta="ÖPPNA LABBET"
              onClick={() => setSection("labb")}
              highlight
            />
            <CtaCard
              icon={<BookOpen className="h-5 w-5" />}
              tier="Nästa steg · 3"
              title="Läs om oss"
              body="Vem står bakom AK1A? Forskningsinstitutet, manifestet, de 8 organen."
              cta="LÄS OM OSS"
              onClick={() => setSection("om-oss")}
            />
          </div>

          <div className="mt-10 rounded-lg border border-border bg-muted/40 p-5 text-center">
            <p className="text-xs text-muted-foreground">
              Pedagogisk finansanalys — inte investeringsråd. Verifierad
              2026-07-22. Datakälla: MarketStack · Bolagsrapporter ·
              Fusionsdokument. Ägare: Ak1 Apex Nexus via AK1nvestor.com ·
              Kontakt: info@ak1nvestor.com
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Sub-components                                                             */
/* ────────────────────────────────────────────────────────────────────────── */

function StatTile({
  value,
  label,
  sub,
  accent,
}: {
  value: string;
  label: string;
  sub?: string;
  accent?: "gold" | "bull" | "bear";
}) {
  const valueColor =
    accent === "gold"
      ? "text-gold"
      : accent === "bull"
      ? "text-bull"
      : accent === "bear"
      ? "text-bear"
      : "text-foreground";
  return (
    <div className="bg-card p-4 sm:p-5">
      <div
        className={cn(
          "font-serif text-2xl font-bold leading-none tabular-nums sm:text-3xl",
          valueColor
        )}
      >
        {value}
      </div>
      <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      {sub && (
        <div className="mt-1 text-xs text-muted-foreground/80">{sub}</div>
      )}
    </div>
  );
}

function IconStatTile({
  icon,
  value,
  label,
  sub,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  sub?: string;
}) {
  return (
    <div className="bg-card p-4 sm:p-5">
      <div className="flex items-center gap-2 text-gold">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-2 font-serif text-2xl font-bold leading-none tabular-nums sm:text-3xl">
        {value}
      </div>
      {sub && (
        <div className="mt-1 text-xs text-muted-foreground/80">{sub}</div>
      )}
    </div>
  );
}

function ScaleStep({
  label,
  tone,
  active = false,
}: {
  label: string;
  tone: "bear" | "bear-soft" | "gold" | "bull" | "bull-soft";
  active?: boolean;
}) {
  const toneClass = {
    bear: active ? "border-bear bg-bear text-white" : "border-bear/40 text-bear bg-bear/[0.04]",
    "bear-soft": active ? "border-bear/70 bg-bear/80 text-white" : "border-bear/30 text-bear/80 bg-bear/[0.02]",
    gold: active ? "border-gold bg-gold text-background shadow-lg shadow-gold/20" : "border-gold/40 text-gold bg-gold/[0.04]",
    bull: active ? "border-bull bg-bull text-white" : "border-bull/40 text-bull bg-bull/[0.04]",
    "bull-soft": active ? "border-bull/70 bg-bull/80 text-white" : "border-bull/30 text-bull/80 bg-bull/[0.02]",
  }[tone];

  return (
    <div
      className={cn(
        "flex-1 min-w-[8.5rem] rounded-md border px-3 py-3 text-center transition-all",
        toneClass,
        active && "ring-2 ring-gold/40 ring-offset-2 ring-offset-background"
      )}
    >
      <div className="font-serif text-sm font-bold tracking-tight sm:text-base">
        {label}
      </div>
      {active && (
        <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider opacity-90">
          Du är här
        </div>
      )}
    </div>
  );
}

function MotivationCard({
  n,
  title,
  children,
  icon,
  tone,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  tone: "bull" | "bear" | "gold";
}) {
  const toneClass =
    tone === "bull"
      ? "border-bull/30 bg-bull/[0.04]"
      : tone === "bear"
      ? "border-bear/30 bg-bear/[0.04]"
      : "border-gold/40 bg-gold/[0.04]";
  const iconClass =
    tone === "bull"
      ? "text-bull"
      : tone === "bear"
      ? "text-bear"
      : "text-gold";
  return (
    <Card className={cn("p-5", toneClass)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="font-serif text-3xl font-bold tabular-nums text-muted-foreground/40">
            {n}
          </span>
          <span className={cn("h-5 w-5", iconClass)}>{icon}</span>
        </div>
      </div>
      <h3 className="mt-2 font-serif text-lg font-bold leading-snug">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {children}
      </p>
    </Card>
  );
}

function KeyRow({
  k,
  v,
  accent,
}: {
  k: string;
  v: string;
  accent?: "gold" | "bull" | "bear";
}) {
  const vColor =
    accent === "gold"
      ? "text-gold"
      : accent === "bull"
      ? "text-bull"
      : accent === "bear"
      ? "text-bear"
      : "text-foreground";
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={cn("font-mono font-semibold tabular-nums", vColor)}>{v}</dd>
    </div>
  );
}

function UpgradeItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-bull" />
      <span>{children}</span>
    </li>
  );
}

function DowngradeItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <ArrowDownRight className="mt-0.5 h-4 w-4 shrink-0 text-bear" />
      <span>{children}</span>
    </li>
  );
}

function MiniMetric({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "bull" | "bear" | "neutral";
}) {
  const toneClass =
    tone === "bull"
      ? "text-bull"
      : tone === "bear"
      ? "text-bear"
      : tone === "neutral"
      ? "text-neutral-signal"
      : "text-foreground";
  return (
    <div>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <span className={toneClass}>{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className={cn("mt-1 font-serif text-xl font-bold tabular-nums", toneClass)}>
        {value}
      </div>
    </div>
  );
}

function LegendItem({
  color,
  label,
  sub,
}: {
  color: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-3 w-3 rounded-sm", color)} />
      <div>
        <div className="font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}

function CustomerBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium">
      <span className="h-1.5 w-1.5 rounded-full bg-gold" />
      {children}
    </span>
  );
}

function TimelineNode({
  year,
  title,
  children,
  tag,
  signal,
  side,
  highlight = false,
}: {
  year: string;
  title: string;
  children: React.ReactNode;
  tag: string;
  signal: "bull" | "bear" | "neutral";
  side: "left" | "right";
  highlight?: boolean;
}) {
  return (
    <li
      className={cn(
        "relative pl-10 sm:w-1/2 sm:pl-0",
        side === "right" ? "sm:ml-auto sm:pl-10" : "sm:pr-10 sm:text-right"
      )}
    >
      {/* dot */}
      <span
        className={cn(
          "absolute top-1.5 left-[10px] sm:left-auto h-3 w-3 rounded-full border-2",
          side === "right" ? "sm:-left-[7px]" : "sm:-right-[7px]",
          highlight
            ? "border-gold bg-gold ring-4 ring-gold/20"
            : signal === "bull"
            ? "border-bull bg-bull"
            : signal === "bear"
            ? "border-bear bg-bear"
            : "border-neutral-signal bg-neutral-signal"
        )}
      />
      <Card
        className={cn(
          "p-4",
          highlight
            ? "border-gold/50 bg-gradient-to-br from-card to-gold/[0.05]"
            : "border-border bg-card"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2",
            side === "left" && "sm:justify-end"
          )}
        >
          <span className="font-serif text-2xl font-bold text-gold tabular-nums">
            {year}
          </span>
          <Badge variant="outline" className="border-border text-[10px]">
            {tag}
          </Badge>
          <SignalPill signal={signal} />
        </div>
        <h3 className="mt-2 font-serif text-base font-bold leading-snug">
          {title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {children}
        </p>
      </Card>
    </li>
  );
}

function CalendarRow({
  date,
  title,
  body,
  signal,
  signalLabel,
}: {
  date: string;
  title: string;
  body: string;
  signal: "bull" | "bear" | "neutral";
  signalLabel: string;
}) {
  return (
    <li className="grid grid-cols-[auto_1fr_auto] items-start gap-x-4 px-5 py-4">
      <span className="font-mono text-xs font-semibold tabular-nums text-muted-foreground whitespace-nowrap pt-0.5">
        {date}
      </span>
      <div>
        <div className="font-serif text-base font-bold leading-snug">
          {title}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
          {body}
        </p>
      </div>
      <div className="pt-0.5">
        <SignalPill signal={signal} label={signalLabel} />
      </div>
    </li>
  );
}

function PriceLevel({
  label,
  value,
  pct,
  tone,
  hint,
  strong = false,
}: {
  label: string;
  value: string;
  pct: number;
  tone: "bull" | "bear" | "gold" | "neutral";
  hint: string;
  strong?: boolean;
}) {
  const barClass =
    tone === "bull"
      ? "bg-bull"
      : tone === "bear"
      ? "bg-bear"
      : tone === "gold"
      ? "bg-gold"
      : "bg-neutral-signal";
  return (
    <div
      className={cn(
        "rounded-md border p-3",
        strong ? "border-gold/50 bg-gold/[0.05]" : "border-border bg-muted/30"
      )}
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className="font-mono font-semibold tabular-nums">{value}</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={cn("h-full rounded-full", barClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}

function ScenarioRow({
  signal,
  name,
  weight,
  price,
  body,
}: {
  signal: "bull" | "bear" | "neutral";
  name: string;
  weight: string;
  price: string;
  body: string;
}) {
  return (
    <li className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-4 px-5 py-4">
      <SignalPill signal={signal} label={name} />
      <span className="text-sm text-muted-foreground">{body}</span>
      <span className="text-right font-mono text-sm font-semibold tabular-nums">
        {weight}
      </span>
      <span className="text-right font-mono text-sm font-semibold tabular-nums">
        {price}
      </span>
    </li>
  );
}

function CtaCard({
  icon,
  tier,
  title,
  body,
  cta,
  onClick,
  highlight = false,
}: {
  icon: React.ReactNode;
  tier: string;
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex h-full flex-col rounded-lg border p-6 text-left transition-all hover:shadow-lg",
        highlight
          ? "border-gold/50 bg-gradient-to-br from-card to-gold/[0.05] hover:border-gold"
          : "border-border bg-card hover:border-gold/50"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-gold">{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {tier}
        </span>
      </div>
      <h3 className="mt-3 font-serif text-xl font-bold">{title}</h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">
        {body}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gold group-hover:underline">
        {cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </span>
    </button>
  );
}
