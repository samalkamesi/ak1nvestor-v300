"use client";

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Scale,
  ShieldCheck,
  Fingerprint,
  Globe,
  Award,
  Merge,
  Building2,
  Users,
  Calendar,
  Bookmark,
  Info,
  Layers,
  CircleDot,
  FileText,
  MapPin,
  Briefcase,
  BookOpen,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAk1aStore, type Level } from "@/lib/ak1a-store";
import { Eyebrow, GoldRule, HonestyTag, SignalPill } from "@/components/ak1a/primitives";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { slugForAkm1, recommendCourses } from "@/lib/ak1a/course-links";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Types                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

interface StatTileData {
  value: string;
  label: string;
  sub: string;
  accent?: "gold" | "bear" | "bull";
}

interface MotivationPoint {
  n: number;
  title: string;
  icon: string;
  tone: string;
  body: string;
}

interface Akm1Indicator {
  name: string;
  score: number;
  signal: "bull" | "bear" | "neutral";
  note: string;
}

interface AnalysisData {
  ticker: string;
  displayTicker: string;
  company: string;
  exchange: string;
  sector: string;
  isin: string;
  currency: string;
  verified: string;
  analysisDate: string;
  source: string;
  status: string;

  cover: {
    eyebrow: string;
    subtitle: string;
    recommendation: string;
    recommendationSub: string;
    recommendationScale: number;
    quickConclusion: string;
    quickConclusionMeta: string;
    lede: string;
    stats: StatTileData[];
  };

  princip: {
    title: string;
    body: string;
    principleTitle: string;
    principleBody: string;
    footer: string;
  };

  recommendation: {
    del: string;
    title: string;
    body: string;
    main: string;
    mainSub: string;
    period: string;
    bullets: string[];
    priceTarget: {
      value: string;
      currency: string;
      vsTerp?: string;
      vsTerpLabel?: string;
      vsTeckning?: string;
      vsTeckningLabel?: string;
      vsCurrent?: string;
      vsCurrentLabel?: string;
      vsBear?: string;
      vsBearLabel?: string;
      span12m: string;
      risk: string;
    };
    scale: { label: string; tone: string; active?: boolean }[];
    nyborjareCallout: { title: string; body: string };
    avanceradCallout: { title: string; body: string };
  };

  motivation: {
    title: string;
    body: string;
    points: MotivationPoint[];
    keyMetrics: { k: string; v: string }[];
  };

  companyInfo: {
    title: string;
    description: string;
    founded: number;
    headquarters: string;
    offices: string[];
    employees: number;
    website: string;
    customers: string[];
    revenue: string;
    ebitdaProforma: string;
    synergyTarget: string;
  };

  businessAreas: {
    name: string;
    revenue: string;
    margin: string;
    description: string;
  }[];

  akm1: {
    score: number;
    maxScore: number;
    tier: string;
    recommendation: string;
    indicators: Record<string, Akm1Indicator>;
  };

  waveSummary: {
    title: string;
    impulse: string[];
    correction: string[];
    base: string[];
    overallBias: string;
    megaTrend: string;
  };

  scenarios: {
    title: string;
    bull: { probability: string; target: string; description: string };
    base: { probability: string; target: string; description: string };
    bear: { probability: string; target: string; description: string };
  };

  priceLevels: {
    title: string;
    levels: { label: string; value: string; tone: string }[];
  };

  keyEvents: {
    title: string;
    events: { date: string; event: string }[];
  };

  fusion: {
    title: string;
    body: string;
    timeline: { date: string; event: string }[];
  };

  history: {
    title: string;
    body: string;
    peak: string;
    bottom: string;
    current: string;
    declineFromPeak: string;
    stats?: { value: string; label: string; sub: string; accent?: string }[];
    timeline?: { year: string; title: string; tag: string; signal: string; body: string; highlight?: boolean }[];
  };

  upgradeDowngrade?: {
    title: string;
    body: string;
    upgrades: string[];
    downgrades: string[];
  };

  revenueMix?: {
    title: string;
    body: string;
    total: string;
    segments: { label: string; percentage: number; sub: string; tone: string }[];
  };

  customersShowcase?: {
    title: string;
    badges: string[];
    highlights: { icon: string; eyebrow: string; body: string }[];
  };

  fusionDetails?: {
    title: string;
    body: string;
    mechanismTitle: string;
    mechanismBody: string;
    mechanismSteps: { n: number; title: string; body: string }[];
    keyNumbers: { k: string; v: string; accent?: string }[];
  };

  priceLadder?: {
    title: string;
    body: string;
    levels: { label: string; value: string; pct: number; tone: string; hint: string; strong?: boolean }[];
    scaleMin: string;
    scaleMax: string;
    scaleNote: string;
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Section definitions                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

const SECTION_DEFS = [
  { id: "omslag", label: "Omslag" },
  { id: "princip", label: "Princip" },
  { id: "rekommendation", label: "Rekommendation" },
  { id: "motivation", label: "Motivering" },
  { id: "upp-ned", label: "Upp/Ned" },
  { id: "bolaget", label: "Bolaget" },
  { id: "affarsomraden", label: "Affärsområden" },
  { id: "intaktsmix", label: "Intäktsmix" },
  { id: "kunder", label: "Kunder" },
  { id: "akm1", label: "AKM1" },
  { id: "vagor", label: "Våganalys" },
  { id: "scenarier", label: "Scenarier" },
  { id: "prisnivaer", label: "Prisnivåer" },
  { id: "kalender", label: "Kalender" },
  { id: "kurshistorik", label: "Kurshistorik" },
  { id: "historik", label: "Historik" },
  { id: "fusionen", label: "Fusionen" },
  { id: "relaterade-kurser", label: "Kurser" },
  { id: "ga-vidare", label: "Gå vidare" },
] as const;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Icon helper                                                               */
/* ────────────────────────────────────────────────────────────────────────── */

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp,
  TrendingDown,
  Scale,
  ShieldCheck,
  Merge,
  Fingerprint,
  Globe,
  Award,
  ArrowUpRight,
  ArrowDownRight,
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Main component                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

interface StockAnalysisViewProps {
  ticker: string;
  onBack?: () => void;
}

export function StockAnalysisView({ ticker, onBack }: StockAnalysisViewProps) {
  const { level, setSection } = useAk1aStore();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollPct, setScrollPct] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  /* ----- fetch analysis data ----- */
  useEffect(() => {
    let cancelled = false;
    // Reset to loading state via async microtask to avoid synchronous setState in effect
    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
      setData(null);
    });
    fetch(`/api/analysis/${encodeURIComponent(ticker)}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("not_found");
        return r.json();
      })
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("not_found");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  /* ----- scroll progress ----- */
  useEffect(() => {
    if (!data) return;
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      setScrollPct(Math.max(0, Math.min(100, pct)));

      let bestIdx = 0;
      let bestTop = -Infinity;
      for (let i = 0; i < SECTION_DEFS.length; i++) {
        const el = sectionRefs.current[SECTION_DEFS[i].id];
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= 160 && top > bestTop) {
          bestTop = top;
          bestIdx = i;
        }
      }
      setActiveIdx(bestIdx);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [data]);

  const registerRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      sectionRefs.current[id] = el;
    },
    []
  );

  const scrollToSection = useCallback((id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      window.scrollTo({ top: el.offsetTop - 120, behavior: "smooth" });
    }
  }, []);

  /* ----- loading state ----- */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gold" />
          <p className="mt-3 text-sm text-muted-foreground">Hämtar analysdata…</p>
        </div>
      </div>
    );
  }

  /* ----- error state ----- */
  if (error || !data) {
    return (
      <div className="paper-texture">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.06]">
            <AlertTriangle className="h-7 w-7 text-gold" />
          </div>
          <h2 className="mt-5 font-serif text-2xl font-bold">Analysen är inte publicerad ännu</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
            Vi publicerar en djupanalys i taget — 99 sidor, 40 timmars arbete. Den här aktien
            står i kön och bearbetas enligt AK1A:s metodmål.
          </p>
          {onBack && (
            <Button variant="outline" className="mt-6" onClick={onBack}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Tillbaka till arkivet
            </Button>
          )}
        </div>
      </div>
    );
  }

  const sectionsRead = Math.min(
    SECTION_DEFS.length,
    Math.max(1, activeIdx + 1)
  );

  return (
    <div className="paper-texture">
      {/* ───────────── STICKY READING-PROGRESS BAR ───────────── */}
      <div className="sticky top-[57px] z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              className="mb-1 -ml-2 h-7 text-xs"
              onClick={onBack}
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Tillbaka till arkivet
            </Button>
          )}
          <div className="flex items-center justify-between gap-4 text-[11px] uppercase tracking-wider text-muted-foreground">
            <div className="flex items-center gap-2 min-w-0">
              <Bookmark className="h-3.5 w-3.5 text-gold" />
              <span className="font-semibold text-foreground">
                {sectionsRead}/{SECTION_DEFS.length} sektioner
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline truncate">
                {SECTION_DEFS[activeIdx]?.label}
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

      {/* ───────────── SECTION NAVIGATION (horizontal scroll) ───────────── */}
      <div className="sticky top-[120px] z-20 border-b border-border bg-muted/50 backdrop-blur sm:top-[114px] overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="overflow-x-auto">
            <div className="flex gap-1 py-2 min-w-min">
              {SECTION_DEFS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={cn(
                    "shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap",
                    i === activeIdx
                      ? "bg-gold text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ───────────── OMSLAG (cover) ───────────── */}
      <CoverSection data={data} registerRef={registerRef} />

      {/* ───────────── PRINCIP ───────────── */}
      <PrincipSection data={data} registerRef={registerRef} />

      {/* ───────────── REKOMMENDATION ───────────── */}
      <RecommendationSection data={data} level={level} registerRef={registerRef} />

      {/* ───────────── MOTIVERING ───────────── */}
      <MotivationSection data={data} level={level} registerRef={registerRef} />

      {/* ───────────── UPP-/NEDGRADERING ───────────── */}
      {data.upgradeDowngrade && (
        <UpgradeDowngradeSection data={data} registerRef={registerRef} />
      )}

      {/* ───────────── BOLAGET ───────────── */}
      <CompanySection data={data} registerRef={registerRef} />

      {/* ───────────── AFFÄRSOMRÅDEN ───────────── */}
      {data.businessAreas.length > 0 && (
        <BusinessAreasSection data={data} registerRef={registerRef} />
      )}

      {/* ───────────── INTÄKTSMIX ───────────── */}
      {data.revenueMix && (
        <RevenueMixSection data={data} registerRef={registerRef} />
      )}

      {/* ───────────── KUNDER ───────────── */}
      {data.customersShowcase && (
        <CustomersSection data={data} registerRef={registerRef} />
      )}

      {/* ───────────── AKM1 ───────────── */}
      <Akm1Section data={data} level={level} registerRef={registerRef} />

      {/* ───────────── VÅGANALYS ───────────── */}
      <WaveSection data={data} registerRef={registerRef} />

      {/* ───────────── SCENARIER ───────────── */}
      <ScenarioSection data={data} registerRef={registerRef} />

      {/* ───────────── PRISNIVÅER ───────────── */}
      <PriceLevelsSection data={data} registerRef={registerRef} />

      {/* ───────────── KALENDER ───────────── */}
      <CalendarSection data={data} registerRef={registerRef} />

      {/* ───────────── KURSHISTORIK ───────────── */}
      {data.priceLadder && (
        <PriceLadderSection data={data} registerRef={registerRef} />
      )}

      {/* ───────────── HISTORIK ───────────── */}
      <HistorySection data={data} registerRef={registerRef} />

      {/* ───────────── FUSIONEN ───────────── */}
      {data.fusionDetails && (
        <FusionSection data={data} registerRef={registerRef} />
      )}

      {/* ───────────── RELATERADE KURSER ───────────── */}
      <RelatedCoursesSection data={data} registerRef={registerRef} />

      {/* ───────────── GÅ VIDARE ───────────── */}
      <GoFurtherSection data={data} registerRef={registerRef} setSection={setSection} onBack={onBack} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Section components
   ══════════════════════════════════════════════════════════════════════════ */

function CoverSection({
  data,
  registerRef,
}: {
  data: AnalysisData;
  registerRef: (id: string) => (el: HTMLElement | null) => void;
}) {
  const c = data.cover;
  return (
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

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
        <Eyebrow>{c.eyebrow}</Eyebrow>

        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <span className="text-gold">AK1A Research Lab</span>
          <span className="text-border">·</span>
          <span> {data.analysisDate}</span>
          <span className="hidden sm:inline text-border">·</span>
          <span className="hidden sm:inline">5 tidshorisonter × 5 teorier × 4 dimensioner</span>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-end">
          <div>
            <h1 className="font-serif text-3xl font-bold leading-[1.05] tracking-tight text-balance sm:text-4xl lg:text-6xl">
              {data.company}
            </h1>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {c.subtitle}
            </p>

            {/* Recommendation badge */}
            <div className="mt-5 inline-flex flex-col items-start rounded-lg border-2 border-gold bg-gold/[0.06] px-5 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center gap-2">
                <CircleDot className="h-5 w-5 text-gold" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                  AK1A-rekommendation
                </span>
              </div>
              <span className="mt-1 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
                {c.recommendation}
              </span>
              <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {c.recommendationSub}
              </span>
            </div>

            <p className="mt-4 max-w-xl text-sm text-muted-foreground leading-relaxed sm:text-base">
              {c.lede}
            </p>
          </div>

          {/* Quick conclusion */}
          <Card className="border-gold/30 bg-gradient-to-br from-card to-gold/[0.04] p-5">
            <div className="flex items-center justify-between">
              <Eyebrow>Snabb slutsats</Eyebrow>
              <HonestyTag kind="matt" />
            </div>
            <p className="mt-3 font-serif text-base font-medium leading-snug sm:text-lg">
              &ldquo;{c.quickConclusion}&rdquo;
            </p>
            <p className="mt-3 text-xs text-muted-foreground">{c.quickConclusionMeta}</p>
          </Card>
        </div>

        {/* Stat grid */}
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
          {c.stats.map((s, i) => (
            <CoverStat key={i} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CoverStat({ value, label, sub, accent }: StatTileData) {
  const accentClass =
    accent === "gold"
      ? "text-gold"
      : accent === "bear"
      ? "text-bear"
      : accent === "bull"
      ? "text-bull"
      : "text-foreground";
  return (
    <div className="bg-background p-3 sm:p-4">
      <div className={cn("font-serif text-xl font-bold tabular-nums sm:text-2xl", accentClass)}>
        {value}
      </div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function RecommendationSection({
  data,
  level,
  registerRef,
}: {
  data: AnalysisData;
  level: Level;
  registerRef: (id: string) => (el: HTMLElement | null) => void;
}) {
  const r = data.recommendation;
  const pt = r.priceTarget;
  return (
    <section
      id="rekommendation"
      ref={registerRef("rekommendation")}
      className="border-b border-border"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
        <Eyebrow>{r.del}</Eyebrow>
        <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-5xl">
          {r.title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground leading-relaxed sm:text-base">
          {r.body}
        </p>

        {/* Level-aware callouts */}
        {level === "nyborjare" && (
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-bull/30 bg-bull/[0.06] p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-bull" />
            <div>
              <p className="text-sm font-semibold text-foreground">{r.nyborjareCallout.title}</p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {r.nyborjareCallout.body}
              </p>
            </div>
          </div>
        )}
        {level === "avancerad" && (
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-gold/30 bg-gold/[0.04] p-4">
            <Layers className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
            <div>
              <p className="text-sm font-semibold text-foreground">{r.avanceradCallout.title}</p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {r.avanceradCallout.body}
              </p>
            </div>
          </div>
        )}

        {/* Main recommendation + price target */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr] sm:gap-6">
          <Card className="overflow-hidden border-gold/40">
            <div className="bg-gradient-to-br from-gold/[0.08] to-transparent p-5 sm:p-8">
              <div className="flex items-center justify-between">
                <Eyebrow>AK1A-rekommendation · {r.period}</Eyebrow>
                <HonestyTag kind="metodmal" />
              </div>
              <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-1">
                <span className="font-serif text-4xl font-bold tracking-tight text-gold sm:text-6xl">
                  {r.main}
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {r.mainSub}
              </p>
              <ul className="mt-5 grid gap-2 text-sm">
                {r.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card className="bg-card p-5 sm:p-6">
            <Eyebrow>Vägt prismål</Eyebrow>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif text-4xl font-bold tabular-nums sm:text-5xl">
                {pt.value}
              </span>
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {pt.currency}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {pt.vsTerp && (
                <div className="rounded-md border border-bull/30 bg-bull/[0.06] px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-bull">
                    {pt.vsTerpLabel}
                  </div>
                  <div className="font-mono text-base font-semibold text-bull">{pt.vsTerp}</div>
                </div>
              )}
              {pt.vsTeckning && (
                <div className="rounded-md border border-bull/30 bg-bull/[0.06] px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-bull">
                    {pt.vsTeckningLabel}
                  </div>
                  <div className="font-mono text-base font-semibold text-bull">{pt.vsTeckning}</div>
                </div>
              )}
              {pt.vsCurrent && (
                <div className="rounded-md border border-bull/30 bg-bull/[0.06] px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-bull">
                    {pt.vsCurrentLabel}
                  </div>
                  <div className="font-mono text-base font-semibold text-bull">{pt.vsCurrent}</div>
                </div>
              )}
              {pt.vsBear && (
                <div className="rounded-md border border-bear/30 bg-bear/[0.06] px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-bear">
                    {pt.vsBearLabel}
                  </div>
                  <div className="font-mono text-base font-semibold text-bear">{pt.vsBear}</div>
                </div>
              )}
            </div>
            <Separator className="my-4 bg-border" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Spann 12 mån</span>
              <span className="font-mono font-semibold tabular-nums">{pt.span12m}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Risk</span>
              <SignalPill signal="bear" label={pt.risk} />
            </div>
          </Card>
        </div>

        {/* Recommendation scale */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <Eyebrow>Rekommendationsskalan · 5 steg</Eyebrow>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Du är här · {r.recommendationScale} av 5
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-stretch gap-2">
            {r.scale.map((s, i) => (
              <ScaleStep key={i} label={s.label} tone={s.tone} active={s.active} />
            ))}
          </div>
        </div>

        {/* Verifiera själv — Zero to One handling */}
        <div className="mt-8 rounded-lg border-2 border-gold/40 bg-gradient-to-br from-gold/[0.06] to-transparent p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-gold" />
                <Eyebrow>Verifiera själv</Eyebrow>
              </div>
              <h3 className="mt-2 font-serif text-xl font-bold leading-tight">
                Du behöver inte lita på oss. Du kan återskapa detta.
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                Alla 20 AKM1-variabler, alla 25 våg-celler, alla källor — offentliga.
                Öppna Labbet och poängsätt {data.company} själv med samma verktyg.
              </p>
            </div>
            <Button
              size="lg"
              className="shrink-0 bg-gold text-background hover:bg-gold/90"
              onClick={() => setSection("labb")}
            >
              Öppna AKM1-calculatorn
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gold/20 pt-3">
            <HonestyTag kind="matt" />
            <span className="text-[10px] text-muted-foreground">
              Detta är vår Zero to One-sanning: vi säljer metod, inte åsikter.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScaleStep({ label, tone, active }: { label: string; tone: string; active?: boolean }) {
  const toneClasses: Record<string, string> = {
    bear: "border-bear/30 text-bear bg-bear/[0.04]",
    "bear-soft": "border-bear/20 text-bear/70 bg-bear/[0.02]",
    gold: "border-gold bg-gold/[0.08] text-gold",
    "bull-soft": "border-bull/20 text-bull/70 bg-bull/[0.02]",
    bull: "border-bull/30 text-bull bg-bull/[0.04]",
  };
  return (
    <div
      className={cn(
        "flex flex-1 items-center justify-center rounded-md border px-2 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider sm:text-xs",
        toneClasses[tone] || "border-border text-muted-foreground",
        active && "ring-2 ring-gold ring-offset-1 ring-offset-background"
      )}
    >
      {label}
    </div>
  );
}

function MotivationSection({
  data,
  level,
  registerRef,
}: {
  data: AnalysisData;
  level: Level;
  registerRef: (id: string) => (el: HTMLElement | null) => void;
}) {
  const m = data.motivation;
  return (
    <section
      id="motivation"
      ref={registerRef("motivation")}
      className="border-b border-border bg-muted/30"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
        <Eyebrow>Motiveringen</Eyebrow>
        <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
          {m.title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">{m.body}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {m.points.map((p) => {
            const Icon = iconMap[p.icon] || TrendingUp;
            return (
              <MotivationCard key={p.n} n={p.n} title={p.title} icon={<Icon className="h-5 w-5" />} tone={p.tone}>
                {p.body}
              </MotivationCard>
            );
          })}

          {level === "intermediar" || level === "avancerad" ? (
            <Card className="border-border bg-card p-5">
              <Eyebrow>Nyckeltal i korthet</Eyebrow>
              <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                {m.keyMetrics.map((km, i) => (
                  <div key={i}>
                    <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{km.k}</dt>
                    <dd className="font-mono font-semibold">{km.v}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          ) : (
            <Card className="border-border bg-card p-5">
              <Eyebrow>Sammanfattning</Eyebrow>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Läs de fem punkterna ovan. Byt till <span className="font-semibold">Intermediär</span> i
                toppmenyn för att se fler nyckeltal.
              </p>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}

function MotivationCard({
  n,
  title,
  icon,
  tone,
  children,
}: {
  n: number;
  title: string;
  icon: React.ReactNode;
  tone: string;
  children: React.ReactNode;
}) {
  const toneClasses: Record<string, string> = {
    bull: "border-bull/30 bg-bull/[0.03]",
    bear: "border-bear/30 bg-bear/[0.03]",
    gold: "border-gold/30 bg-gold/[0.03]",
  };
  const iconTone: Record<string, string> = {
    bull: "border-bull/40 bg-bull/10 text-bull",
    bear: "border-bear/40 bg-bear/10 text-bear",
    gold: "border-gold/40 bg-gold/10 text-gold",
  };
  return (
    <Card className={cn("flex flex-col p-5", toneClasses[tone] || "border-border")}>
      <div className="flex items-center gap-3">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-full border", iconTone[tone] || "border-border bg-background text-gold")}>
          {icon}
        </span>
        <span className="font-serif text-2xl font-bold text-gold">{n}</span>
      </div>
      <h3 className="mt-3 font-serif text-lg font-bold leading-tight">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </Card>
  );
}

function CompanySection({
  data,
  registerRef,
}: {
  data: AnalysisData;
  registerRef: (id: string) => (el: HTMLElement | null) => void;
}) {
  const co = data.companyInfo;
  return (
    <section
      id="bolaget"
      ref={registerRef("bolaget")}
      className="border-b border-border"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
        <Eyebrow>{co.title}</Eyebrow>
        <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
          {data.company}
        </h2>
        <p className="mt-4 max-w-3xl text-sm text-muted-foreground leading-relaxed sm:text-base">
          {co.description}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoTile icon={<Calendar className="h-4 w-4" />} label="Grundat" value={String(co.founded)} />
          <InfoTile icon={<MapPin className="h-4 w-4" />} label="Huvudkontor" value={co.headquarters} />
          <InfoTile icon={<Users className="h-4 w-4" />} label="Anställda" value={String(co.employees)} />
          <InfoTile icon={<Globe className="h-4 w-4" />} label="Webb" value={co.website} />
        </div>

        {/* Offices */}
        {co.offices.length > 0 && (
          <div className="mt-6">
            <Eyebrow>Kontor</Eyebrow>
            <div className="mt-3 flex flex-wrap gap-2">
              {co.offices.map((o) => (
                <Badge key={o} variant="outline" className="border-border">
                  <MapPin className="mr-1 h-3 w-3 text-gold" /> {o}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Customers */}
        {co.customers.length > 0 && (
          <div className="mt-6">
            <Eyebrow>Nyckelkunder</Eyebrow>
            <div className="mt-3 flex flex-wrap gap-2">
              {co.customers.map((cu) => (
                <Badge key={cu} variant="outline" className="border-gold/30 bg-gold/[0.04] text-gold">
                  <Award className="mr-1 h-3 w-3" /> {cu}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Financials */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card className="border-border p-5">
            <Eyebrow>Proforma intäkter</Eyebrow>
            <p className="mt-2 font-serif text-xl font-bold">{co.revenue}</p>
          </Card>
          <Card className="border-border p-5">
            <Eyebrow>Proforma EBITDA</Eyebrow>
            <p className="mt-2 font-serif text-xl font-bold">{co.ebitdaProforma}</p>
          </Card>
          {co.synergyTarget && (
            <Card className="border-border p-5">
              <Eyebrow>Synergimål</Eyebrow>
              <p className="mt-2 font-serif text-xl font-bold text-gold">{co.synergyTarget}</p>
            </Card>
          )}
        </div>

        {/* Business areas */}
        {data.businessAreas.length > 0 && (
          <div className="mt-8">
            <Eyebrow>Affärsområden</Eyebrow>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.businessAreas.map((ba) => (
                <Card key={ba.name} className="border-border p-5">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gold" />
                    <h3 className="font-serif text-base font-bold">{ba.name}</h3>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs">
                    <Badge variant="outline" className="border-gold/30 text-gold">{ba.revenue}</Badge>
                    <Badge variant="outline" className="border-bull/30 text-bull">Marginal {ba.margin}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{ba.description}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="border-border p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 font-serif text-base font-bold">{value}</p>
    </Card>
  );
}

function Akm1Section({
  data,
  level,
  registerRef,
}: {
  data: AnalysisData;
  level: Level;
  registerRef: (id: string) => (el: HTMLElement | null) => void;
}) {
  const a = data.akm1;
  const indicators = Object.entries(a.indicators);

  // Level filtering: nyborjare shows fewer, avancerad shows all
  const visibleIndicators =
    level === "nyborjare"
      ? indicators.filter(([id]) => ["V01", "V04", "V07", "V09", "V10", "V17"].includes(id))
      : indicators;

  return (
    <section
      id="akm1"
      ref={registerRef("akm1")}
      className="border-b border-border bg-muted/30"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
        <div className="flex items-center justify-between">
          <Eyebrow>AKM1 · 20 variabler</Eyebrow>
          <HonestyTag kind="matt" />
        </div>
        <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
          Fundamental poängsättning
        </h2>

        {/* Score summary */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card className="border-gold/40 p-5 text-center">
            <Eyebrow>AKM1-poäng</Eyebrow>
            <p className="mt-2 font-serif text-4xl font-bold text-gold">{a.score}<span className="text-xl text-muted-foreground">/{a.maxScore}</span></p>
          </Card>
          <Card className="border-border p-5 text-center">
            <Eyebrow>Nivå</Eyebrow>
            <p className="mt-2 font-serif text-2xl font-bold">{a.tier}</p>
          </Card>
          <Card className="border-border p-5 text-center">
            <Eyebrow>Rekommendation</Eyebrow>
            <p className="mt-2 font-serif text-base font-bold leading-tight">{a.recommendation}</p>
          </Card>
        </div>

        {level === "nyborjare" && (
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-bull/30 bg-bull/[0.06] p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-bull" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Du ser de 6 viktigaste variablerna. Byt till <span className="font-semibold">Intermediär</span> eller
              <span className="font-semibold"> Avancerad</span> för att se alla 20.
            </p>
          </div>
        )}

        {/* Indicator grid */}
        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {visibleIndicators.map(([id, ind]) => (
            <Akm1IndicatorCard key={id} id={id} indicator={ind} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Akm1IndicatorCard({ id, indicator }: { id: string; indicator: Akm1Indicator }) {
  const { openCourse } = useAk1aStore();
  const slug = slugForAkm1(id);
  const signalColor =
    indicator.signal === "bull"
      ? "text-bull border-bull/30 bg-bull/[0.04]"
      : indicator.signal === "bear"
      ? "text-bear border-bear/30 bg-bear/[0.04]"
      : "text-muted-foreground border-border bg-muted/20";

  const scoreColor =
    indicator.score >= 4 ? "text-bull" : indicator.score <= 2 ? "text-bear" : "text-gold";

  return (
    <Card className={cn("border p-4 transition-all", signalColor, slug && "cursor-pointer hover:ring-2 hover:ring-gold/30")}>
      <button
        type="button"
        disabled={!slug}
        onClick={() => slug && openCourse(slug)}
        className="block w-full text-left disabled:cursor-default"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-gold">{id}</span>
            <span className="text-sm font-semibold">{indicator.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {slug && (
              <span className="text-[9px] font-semibold uppercase tracking-wider text-gold/70 hidden sm:inline">
                Läs kurs →
              </span>
            )}
            <span className={cn("font-serif text-xl font-bold", scoreColor)}>{indicator.score}/5</span>
          </div>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{indicator.note}</p>
      </button>
    </Card>
  );
}

function WaveSection({
  data,
  registerRef,
}: {
  data: AnalysisData;
  registerRef: (id: string) => (el: HTMLElement | null) => void;
}) {
  const w = data.waveSummary;
  return (
    <section
      id="vagor"
      ref={registerRef("vagor")}
      className="border-b border-border"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
        <Eyebrow>{w.title}</Eyebrow>
        <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
          Våg-teoretisk konsensus
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground leading-relaxed sm:text-base">
          5 tidshorisonter × 5 teorier (Elliott, Fibonacci, Gann, Lucas, Volym) = 25 celler per aktie.
          Varje cell klassificeras som impuls, korrektion eller bas.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <WaveGroup title="Impuls (Bullish)" ids={w.impulse} tone="bull" />
          <WaveGroup title="Korrektion (Bearish)" ids={w.correction} tone="bear" />
          <WaveGroup title="Bas (Neutral)" ids={w.base} tone="neutral" />
        </div>

        <Card className="mt-6 border-gold/30 bg-gold/[0.03] p-5">
          <Eyebrow>Övergripande bias</Eyebrow>
          <p className="mt-2 font-serif text-xl font-bold text-gold">{w.overallBias}</p>
          <Separator className="my-4 bg-border" />
          <Eyebrow>Mega-trend</Eyebrow>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.megaTrend}</p>
        </Card>
      </div>
    </section>
  );
}

function WaveGroup({ title, ids, tone }: { title: string; ids: string[]; tone: string }) {
  const toneClasses: Record<string, string> = {
    bull: "border-bull/30 text-bull",
    bear: "border-bear/30 text-bear",
    neutral: "border-border text-muted-foreground",
  };
  return (
    <Card className={cn("border p-5", toneClasses[tone])}>
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-sm font-bold">{title}</h3>
        <span className="font-mono text-2xl font-bold">{ids.length}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {ids.map((id) => (
          <Badge key={id} variant="outline" className={cn("font-mono text-[10px]", toneClasses[tone])}>
            {id}
          </Badge>
        ))}
      </div>
    </Card>
  );
}

function ScenarioSection({
  data,
  registerRef,
}: {
  data: AnalysisData;
  registerRef: (id: string) => (el: HTMLElement | null) => void;
}) {
  const s = data.scenarios;
  return (
    <section
      id="scenarier"
      ref={registerRef("scenarier")}
      className="border-b border-border bg-muted/30"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
        <Eyebrow>{s.title}</Eyebrow>
        <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
          Tre scenarier — viktade
        </h2>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <ScenarioCard
            tone="bull"
            label="Bull-case"
            probability={s.bull.probability}
            target={s.bull.target}
            description={s.bull.description}
          />
          <ScenarioCard
            tone="gold"
            label="Base-case"
            probability={s.base.probability}
            target={s.base.target}
            description={s.base.description}
          />
          <ScenarioCard
            tone="bear"
            label="Bear-case"
            probability={s.bear.probability}
            target={s.bear.target}
            description={s.bear.description}
          />
        </div>
      </div>
    </section>
  );
}

function ScenarioCard({
  tone,
  label,
  probability,
  target,
  description,
}: {
  tone: string;
  label: string;
  probability: string;
  target: string;
  description: string;
}) {
  const toneClasses: Record<string, string> = {
    bull: "border-bull/40 bg-bull/[0.04]",
    gold: "border-gold/40 bg-gold/[0.04]",
    bear: "border-bear/40 bg-bear/[0.04]",
  };
  const textTone: Record<string, string> = {
    bull: "text-bull",
    gold: "text-gold",
    bear: "text-bear",
  };
  return (
    <Card className={cn("border p-5", toneClasses[tone])}>
      <div className="flex items-center justify-between">
        <span className={cn("text-[10px] font-bold uppercase tracking-wider", textTone[tone])}>{label}</span>
        <span className="font-mono text-sm font-bold">{probability}</span>
      </div>
      <p className={cn("mt-3 font-serif text-2xl font-bold", textTone[tone])}>{target}</p>
      <Separator className="my-3 bg-border" />
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </Card>
  );
}

function PriceLevelsSection({
  data,
  registerRef,
}: {
  data: AnalysisData;
  registerRef: (id: string) => (el: HTMLElement | null) => void;
}) {
  const pl = data.priceLevels;
  return (
    <section
      id="prisnivaer"
      ref={registerRef("prisnivaer")}
      className="border-b border-border"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
        <Eyebrow>{pl.title}</Eyebrow>
        <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
          Stöd, motstånd och mål
        </h2>

        <Card className="mt-6 overflow-hidden border-border p-0">
          <div className="divide-y divide-border">
            {pl.levels.map((lvl, i) => {
              const toneClass =
                lvl.tone === "bull"
                  ? "text-bull"
                  : lvl.tone === "bear"
                  ? "text-bear"
                  : lvl.tone === "gold"
                  ? "text-gold"
                  : "text-foreground";
              return (
                <div key={i} className="flex items-center justify-between px-4 py-3 sm:px-6">
                  <span className="text-sm text-muted-foreground">{lvl.label}</span>
                  <span className={cn("font-mono text-sm font-bold", toneClass)}>{lvl.value}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </section>
  );
}

function CalendarSection({
  data,
  registerRef,
}: {
  data: AnalysisData;
  registerRef: (id: string) => (el: HTMLElement | null) => void;
}) {
  const ke = data.keyEvents;
  return (
    <section
      id="kalender"
      ref={registerRef("kalender")}
      className="border-b border-border bg-muted/30"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
        <Eyebrow>{ke.title}</Eyebrow>
        <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
          Viktiga händelser
        </h2>

        <div className="mt-6 space-y-2">
          {ke.events.map((e, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-md border border-border bg-background p-4"
            >
              <div className="shrink-0 text-right">
                <div className="font-mono text-xs font-bold text-gold">{e.date}</div>
              </div>
              <Separator orientation="vertical" className="h-auto bg-border" />
              <p className="text-sm leading-relaxed">{e.event}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HistorySection({
  data,
  registerRef,
}: {
  data: AnalysisData;
  registerRef: (id: string) => (el: HTMLElement | null) => void;
}) {
  const h = data.history;
  const f = data.fusion;
  return (
    <section
      id="historik"
      ref={registerRef("historik")}
      className="border-b border-border bg-muted/30"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
        <Eyebrow>Del II · Historik</Eyebrow>
        <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
          {h.title}
        </h2>
        <p className="mt-4 max-w-3xl text-sm text-muted-foreground leading-relaxed sm:text-base">
          {h.body}
        </p>

        {/* Stats row */}
        {h.stats && h.stats.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
            {h.stats.map((s, i) => {
              const accentClass =
                s.accent === "bull"
                  ? "text-bull"
                  : s.accent === "bear"
                  ? "text-bear"
                  : s.accent === "gold"
                  ? "text-gold"
                  : "text-foreground";
              return (
                <div key={i} className="bg-background p-3 sm:p-4">
                  <div className={cn("font-serif text-xl font-bold tabular-nums sm:text-2xl", accentClass)}>
                    {s.value}
                  </div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{s.sub}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Timeline */}
        {h.timeline && h.timeline.length > 0 && (
          <div className="mt-8 relative sm:mt-10">
            <div className="absolute left-[15px] sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/60 via-border to-gold/30 sm:-translate-x-1/2" />
            <ol className="space-y-6 sm:space-y-8">
              {h.timeline.map((node, i) => {
                const side = i % 2 === 0 ? "left" : "right";
                const signalBorder =
                  node.signal === "bull"
                    ? "border-bull/40"
                    : node.signal === "bear"
                    ? "border-bear/40"
                    : "border-border";
                const signalDot =
                  node.signal === "bull"
                    ? "bg-bull"
                    : node.signal === "bear"
                    ? "bg-bear"
                    : "bg-gold";
                return (
                  <li key={i} className={cn("relative", side === "right" && "sm:pl-[calc(50%+2rem)]", side === "left" && "sm:pr-[calc(50%+2rem)]")}>
                    <div className={cn("pl-10 sm:pl-0", side === "right" && "sm:pl-[calc(50%+2rem)] sm:pr-0", side === "left" && "sm:pr-[calc(50%+2rem)] sm:pl-0")}>
                      {/* Dot on timeline */}
                      <span
                        className={cn(
                          "absolute left-[11px] sm:left-1/2 top-1 h-3 w-3 -translate-x-1/2 rounded-full ring-4 ring-background",
                          signalDot,
                          node.highlight && "h-4 w-4 ring-gold/20"
                        )}
                      />
                      <Card className={cn("border p-4 sm:p-5", signalBorder, node.highlight && "ring-2 ring-gold/40 border-gold/40")}>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-lg font-bold text-gold">{node.year}</span>
                          {node.highlight && <Badge variant="outline" className="border-gold/40 text-gold text-[9px]">★ HÖJDPUNKT</Badge>}
                        </div>
                        <h3 className="mt-1 font-serif text-base font-bold">{node.title}</h3>
                        <div className="mt-1">
                          <Badge variant="outline" className="border-border text-[9px] uppercase tracking-wider">{node.tag}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{node.body}</p>
                      </Card>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* Summary cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <Card className="border-border p-4 text-center">
            <Eyebrow>Peak</Eyebrow>
            <p className="mt-2 font-serif text-lg font-bold text-bull">{h.peak}</p>
          </Card>
          <Card className="border-border p-4 text-center">
            <Eyebrow>Botten</Eyebrow>
            <p className="mt-2 font-serif text-lg font-bold text-bear">{h.bottom}</p>
          </Card>
          <Card className="border-border p-4 text-center">
            <Eyebrow>Nu</Eyebrow>
            <p className="mt-2 font-serif text-lg font-bold text-gold">{h.current}</p>
          </Card>
          <Card className="border-border p-4 text-center">
            <Eyebrow>Förändring</Eyebrow>
            <p className="mt-2 font-serif text-lg font-bold text-bear">{h.declineFromPeak}</p>
          </Card>
        </div>

        {/* Fusion / transformation summary (kept for backward compat) */}
        <Card className="mt-6 border-gold/30 bg-gold/[0.02] p-5 sm:p-6">
          <Eyebrow>{f.title}</Eyebrow>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{f.body}</p>

          {f.timeline.length > 0 && (
            <div className="mt-6 space-y-2">
              {f.timeline.map((t, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="flex h-8 w-16 items-center justify-center rounded-md border border-gold/30 bg-gold/[0.06] font-mono text-[10px] font-bold text-gold">
                      {t.date}
                    </div>
                  </div>
                  <p className="pt-1.5 text-sm leading-relaxed">{t.event}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}

function RelatedCoursesSection({
  data,
  registerRef,
}: {
  data: AnalysisData;
  registerRef: (id: string) => (el: HTMLElement | null) => void;
}) {
  const { openCourse } = useAk1aStore();
  const courses = recommendCourses(data.akm1.indicators, data.sector);

  if (courses.length === 0) return null;

  return (
    <section
      id="relaterade-kurser"
      ref={registerRef("relaterade-kurser")}
      className="border-b border-border"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
        <div className="flex items-center justify-between">
          <div>
            <Eyebrow>Läroplan — 5 rekommenderade kurser</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
              Fördjupa dig i analysen
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Baserat på {data.company}s AKM1-profil — dina svagaste och starkaste variabler,
              plus sektorkunskap. Klicka för att öppna djupkursen.
            </p>
          </div>
          <Badge variant="outline" className="border-gold/40 text-gold uppercase tracking-wider text-[10px] hidden sm:flex">
            {courses.length} kurser
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c, i) => (
            <button
              key={c.slug}
              onClick={() => openCourse(c.slug)}
              className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 text-left transition-all hover:border-gold/40 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.06] font-serif text-sm font-bold text-gold">
                  {i + 1}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-gold" />
              </div>
              <div className="mt-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {c.reason}
                </div>
                <h3 className="mt-1 font-serif text-base font-bold leading-tight">{c.title}</h3>
                <div className="mt-2 flex items-center gap-1.5">
                  <FileText className="h-3 w-3 text-gold" />
                  <span className="text-[10px] text-muted-foreground font-mono">{c.slug}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2">
          <HonestyTag kind="matt" />
          <span className="text-xs text-muted-foreground">
            Varje kurs är 6 kapitel · 15-25 min · Lynch + Graham + AK1 perspektiv
          </span>
        </div>
      </div>
    </section>
  );
}

function GoFurtherSection({
  data,
  registerRef,
  setSection,
  onBack,
}: {
  data: AnalysisData;
  registerRef: (id: string) => (el: HTMLElement | null) => void;
  setSection: (s: "hem" | "analyser" | "aktier" | "kurser" | "labb" | "styrelse" | "om-oss" | "portal") => void;
  onBack?: () => void;
}) {
  return (
    <section
      id="ga-vidare"
      ref={registerRef("ga-vidare")}
      className="bg-muted/30"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
        <Eyebrow>Fortsätt utforska</Eyebrow>
        <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
          Gå vidare
        </h2>
        <GoldRule className="mt-6 max-w-md" />

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <GoCard
            icon={<FileText className="h-5 w-5" />}
            title="Alla analyser"
            sub="Arkivet"
            onClick={() => setSection("analyser")}
          />
          <GoCard
            icon={<Layers className="h-5 w-5" />}
            title="Alla aktier"
            sub="Aktieuniversum"
            onClick={() => setSection("aktier")}
          />
          <GoCard
            icon={<BookOpen className="h-5 w-5" />}
            title="Alla kurser"
            sub="225 djupa moduler"
            onClick={() => setSection("kurser")}
          />
          <GoCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="Reproduce i Labbet"
            sub="Gör det själv"
            onClick={() => setSection("labb")}
          />
        </div>

        {onBack && (
          <Button variant="outline" className="mt-8" onClick={onBack}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Tillbaka till arkivet
          </Button>
        )}

        <div className="mt-8 flex items-center gap-2">
          <HonestyTag kind="matt" />
          <span className="text-[10px] text-muted-foreground">
            Verifierad {data.verified} · {data.source}
          </span>
        </div>
      </div>
    </section>
  );
}

function GoCard({
  icon,
  title,
  sub,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 text-left transition-all hover:border-gold/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-gold transition-colors group-hover:border-gold/40">
          {icon}
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-gold" />
      </div>
      <div className="mt-5">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Gå vidare →
        </div>
        <h3 className="mt-1 font-serif text-xl font-bold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   RESTORED SECTIONS — from old PREC section (1934 lines)
   ══════════════════════════════════════════════════════════════════════════ */

function PrincipSection({
  data,
  registerRef,
}: {
  data: AnalysisData;
  registerRef: (id: string) => (el: HTMLElement | null) => void;
}) {
  const p = data.princip;
  return (
    <section
      id="princip"
      ref={registerRef("princip")}
      className="border-b border-border bg-muted/30"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
          <div>
            <Eyebrow>Pedagogisk finansanalys</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
              {p.title}
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground leading-relaxed sm:text-base">
              {p.body}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <HonestyTag kind="matt" />
              <Badge variant="outline" className="border-border whitespace-nowrap">
                Verifierad {data.verified}
              </Badge>
              <Badge variant="outline" className="border-border whitespace-nowrap">
                99 sidor
              </Badge>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground break-words">
              Datakälla: {data.source}
            </p>
          </div>

          <Card className="border-gold/40 bg-card p-5 sm:p-6">
            <Eyebrow>Vår princip</Eyebrow>
            <GoldRule className="my-3 max-w-[6rem]" />
            <p className="font-serif text-xl font-bold leading-snug sm:text-2xl">
              {p.principleTitle}
            </p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {p.principleBody}
            </p>
            <Separator className="my-4 bg-border" />
            <p className="text-xs leading-relaxed text-muted-foreground break-words">
              {p.footer}
              <br />
              Ägare: Ak1 Apex Nexus via AK1nvestor.com
              <br />
              Kontakt: info@ak1nvestor.com
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}

function UpgradeDowngradeSection({
  data,
  registerRef,
}: {
  data: AnalysisData;
  registerRef: (id: string) => (el: HTMLElement | null) => void;
}) {
  const u = data.upgradeDowngrade!;
  return (
    <section
      id="upp-ned"
      ref={registerRef("upp-ned")}
      className="border-b border-border"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
        <Eyebrow>Triggeröversikt</Eyebrow>
        <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
          {u.title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
          {u.body}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 sm:gap-6">
          <Card className="border-bull/40 bg-bull/[0.05] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-bull" />
              <h3 className="font-serif text-lg font-bold text-bull sm:text-xl">
                Uppgradering till KÖP
              </h3>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {u.upgrades.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-bull" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border-bear/40 bg-bear/[0.05] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <ArrowDownRight className="h-5 w-5 text-bear" />
              <h3 className="font-serif text-lg font-bold text-bear sm:text-xl">
                Nedgradering till SÄLJ
              </h3>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {u.downgrades.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-bear" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}

function BusinessAreasSection({
  data,
  registerRef,
}: {
  data: AnalysisData;
  registerRef: (id: string) => (el: HTMLElement | null) => void;
}) {
  const areas = data.businessAreas;
  return (
    <section
      id="affarsomraden"
      ref={registerRef("affarsomraden")}
      className="border-b border-border"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
        <Eyebrow>Del I · Bolaget</Eyebrow>
        <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
          {areas.length} affärsområden · 2025
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2 sm:gap-6">
          {areas.map((ba, i) => (
            <Card key={i} className="overflow-hidden border-border">
              <div className="bg-gradient-to-br from-gold/[0.08] to-transparent p-5 sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <Eyebrow>Affärsområde {i + 1}</Eyebrow>
                    <h3 className="mt-2 font-serif text-xl font-bold sm:text-2xl">
                      {ba.name}
                    </h3>
                  </div>
                  <span className="font-serif text-3xl font-bold text-gold sm:text-4xl">
                    {ba.revenue.match(/(\d+%)/)?.[1] || ba.revenue}
                  </span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {ba.description}
                </p>
                <Separator className="my-4 bg-border" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Omsättning 2025
                    </div>
                    <div className="mt-1 font-mono text-sm font-bold">{ba.revenue}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Bruttomarginal
                    </div>
                    <div className="mt-1 font-mono text-sm font-bold text-bull">{ba.margin}</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function RevenueMixSection({
  data,
  registerRef,
}: {
  data: AnalysisData;
  registerRef: (id: string) => (el: HTMLElement | null) => void;
}) {
  const r = data.revenueMix!;
  return (
    <section
      id="intaktsmix"
      ref={registerRef("intaktsmix")}
      className="border-b border-border bg-muted/30"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
        <Eyebrow>Del I · Bolaget</Eyebrow>
        <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
          {r.title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
          {r.body}
        </p>

        <Card className="mt-6 border-border bg-card p-5 sm:p-6">
          {/* Stacked horizontal bar */}
          <div className="flex h-12 w-full overflow-hidden rounded-md border border-border">
            {r.segments.map((seg, i) => {
              const bgClass =
                seg.tone === "gold-strong"
                  ? "bg-gold/80 text-background"
                  : seg.tone === "gold"
                  ? "bg-gold text-background"
                  : "bg-gold/40 text-foreground";
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center justify-center text-xs font-semibold",
                    bgClass
                  )}
                  style={{ width: `${seg.percentage}%` }}
                  title={`${seg.label} ${seg.percentage} %`}
                >
                  {seg.percentage >= 10 ? `${seg.label} · ${seg.percentage} %` : `${seg.percentage} %`}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {r.segments.map((seg, i) => {
              const dotClass =
                seg.tone === "gold-strong"
                  ? "bg-gold/80"
                  : seg.tone === "gold"
                  ? "bg-gold"
                  : "bg-gold/40";
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className={cn("h-3 w-3 rounded-sm", dotClass)} />
                  <div>
                    <div className="font-semibold">{seg.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {seg.percentage} % · {seg.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="my-5 bg-border" />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <HonestyTag kind="matt" />
              <span className="text-sm text-muted-foreground">
                Intäkter enligt bolagsrapport
              </span>
            </div>
            <div className="font-mono text-sm font-semibold tabular-nums">
              Summa: {r.total}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

function CustomersSection({
  data,
  registerRef,
}: {
  data: AnalysisData;
  registerRef: (id: string) => (el: HTMLElement | null) => void;
}) {
  const c = data.customersShowcase!;
  return (
    <section
      id="kunder"
      ref={registerRef("kunder")}
      className="border-b border-border"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
        <Eyebrow>Del I · Bolaget</Eyebrow>
        <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
          {c.title}
        </h2>

        <div className="mt-5 flex flex-wrap gap-2">
          {c.badges.map((b, i) => (
            <Badge
              key={i}
              variant="outline"
              className="border-gold/30 bg-gold/[0.04] px-3 py-1.5 text-sm"
            >
              <Award className="mr-1.5 h-3.5 w-3.5 text-gold" /> {b}
            </Badge>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {c.highlights.map((h, i) => {
            const Icon = iconMap[h.icon] || Award;
            return (
              <Card key={i} className="border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-gold" />
                  <Eyebrow>{h.eyebrow}</Eyebrow>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {h.body}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PriceLadderSection({
  data,
  registerRef,
}: {
  data: AnalysisData;
  registerRef: (id: string) => (el: HTMLElement | null) => void;
}) {
  const pl = data.priceLadder!;
  return (
    <section
      id="kurshistorik"
      ref={registerRef("kurshistorik")}
      className="border-b border-border"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
        <Eyebrow>Del V · Kurshistorik</Eyebrow>
        <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
          {pl.title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground leading-relaxed sm:text-base">
          {pl.body}
        </p>

        <Card className="mt-6 border-border bg-card p-5 sm:p-6">
          <Eyebrow>Prisstege — viktiga nivåer</Eyebrow>
          <div className="mt-5 space-y-3">
            {pl.levels.map((lvl, i) => {
              const toneClass =
                lvl.tone === "bull"
                  ? "bg-bull/60"
                  : lvl.tone === "bear"
                  ? "bg-bear/60"
                  : lvl.tone === "gold"
                  ? "bg-gold/60"
                  : "bg-muted-foreground/40";
              const textTone =
                lvl.tone === "bull"
                  ? "text-bull"
                  : lvl.tone === "bear"
                  ? "text-bear"
                  : lvl.tone === "gold"
                  ? "text-gold"
                  : "text-foreground";
              return (
                <div key={i} className={cn("rounded-md", lvl.strong && "ring-1 ring-gold/40")}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {lvl.label}
                      {lvl.strong && <span className="ml-2 text-gold font-semibold">★</span>}
                    </span>
                    <span className="text-xs text-muted-foreground">{lvl.hint}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="relative h-8 flex-1 overflow-hidden rounded-sm bg-muted/40">
                      <div
                        className={cn("absolute inset-y-0 left-0 rounded-sm", toneClass)}
                        style={{ width: `${lvl.pct}%` }}
                      />
                    </div>
                    <span className={cn("font-mono text-sm font-bold tabular-nums w-20 text-right", textTone)}>
                      {lvl.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>{pl.scaleMin}</span>
            <span>{pl.scaleNote}</span>
            <span>{pl.scaleMax}</span>
          </div>
        </Card>
      </div>
    </section>
  );
}

function FusionSection({
  data,
  registerRef,
}: {
  data: AnalysisData;
  registerRef: (id: string) => (el: HTMLElement | null) => void;
}) {
  const f = data.fusionDetails!;
  return (
    <section
      id="fusionen"
      ref={registerRef("fusionen")}
      className="border-b border-border"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
        <Eyebrow>Del III · Fusionen</Eyebrow>
        <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
          {f.title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground leading-relaxed sm:text-base">
          {f.body}
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr] sm:gap-6">
          <Card className="border-border bg-card p-5 sm:p-6">
            <Eyebrow>{f.mechanismTitle}</Eyebrow>
            <GoldRule className="my-3 max-w-[5rem]" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {f.mechanismBody}
            </p>
            <ol className="mt-4 space-y-3 text-sm">
              {f.mechanismSteps.map((s) => (
                <li key={s.n} className="flex gap-3">
                  <span className="font-serif text-xl font-bold text-gold">
                    {s.n}.
                  </span>
                  <span>
                    <strong>{s.title}</strong> {s.body}
                  </span>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="border-gold/30 bg-gradient-to-br from-card to-gold/[0.04] p-5 sm:p-6">
            <Eyebrow>Fusion i siffror</Eyebrow>
            <dl className="mt-4 space-y-3 text-sm">
              {f.keyNumbers.map((kn, i) => {
                const accentClass =
                  kn.accent === "gold"
                    ? "text-gold"
                    : kn.accent === "bull"
                    ? "text-bull"
                    : kn.accent === "bear"
                    ? "text-bear"
                    : "text-foreground";
                return (
                  <div key={i} className="flex items-center justify-between">
                    <dt className="text-muted-foreground">{kn.k}</dt>
                    <dd className={cn("font-mono font-semibold", accentClass)}>{kn.v}</dd>
                  </div>
                );
              })}
            </dl>
          </Card>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <HonestyTag kind="matt" />
          <span className="text-xs text-muted-foreground">
            Siffror från fusionsdokument och bolagsrapport. Verifierad {data.verified}.
          </span>
        </div>
      </div>
    </section>
  );
}
