"use client";

import * as React from "react";
import {
  ArrowRight,
  Clock,
  TrendingUp,
  Award,
  Lock,
  Check,
  ChevronRight,
  BookOpen,
  Library,
  Briefcase,
  Layers,
  Lightbulb,
} from "lucide-react";
import { useAk1aStore, type Level } from "@/lib/ak1a-store";
import {
  AKM1_VARIABLES,
  type Akm1Category,
  type Akm1Variable,
} from "@/lib/ak1a/data";
import { Eyebrow, HonestyTag } from "@/components/ak1a/primitives";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Static data                                                         */
/* ------------------------------------------------------------------ */

const LEVEL_LABEL: Record<Level, string> = {
  nyborjare: "Nybörjare",
  intermediar: "Intermediär",
  avancerad: "Avancerad",
};

const LEVEL_ORDER: Record<Level, number> = {
  nyborjare: 0,
  intermediar: 1,
  avancerad: 2,
};

function isLockedFor(courseLevel: Level, userLevel: Level): boolean {
  return LEVEL_ORDER[courseLevel] > LEVEL_ORDER[userLevel];
}

const CATEGORY_FILTERS: { id: Akm1Category | "ALLA"; label: string; count: number }[] = [
  { id: "ALLA", label: "ALLA", count: 19 },
  { id: "Värdering", label: "VÄRDERING", count: 3 },
  { id: "Tillväxt", label: "TILLVÄXT", count: 3 },
  { id: "Lönsamhet", label: "LÖNSAMHET", count: 3 },
  { id: "Stabilitet", label: "STABILITET", count: 3 },
  { id: "Moat", label: "MOAT", count: 3 },
  { id: "Katalysator", label: "KATALYSATOR", count: 3 },
  { id: "Risk", label: "RISK", count: 1 },
];

const CATEGORY_CARDS = [
  {
    id: "akm1-19",
    title: "AKM1 19 VARIABLER",
    subtitle: "19 KURSER",
    icon: Layers,
    description: "Grunden allt annat vilar på. Variabel för variabel.",
    target: "akm1-variabler",
  },
  {
    id: "marknad-full",
    title: "KUNSKAPSMARKNAD",
    subtitle: "251 KURSER",
    icon: Library,
    description: "Bred bibliotek — nyckeltal, branscher, historik, strategier.",
    target: "akm1-variabler",
  },
  {
    id: "case-studies",
    title: "LEVANDE FALLSTUDIER",
    subtitle: "5 FALL",
    icon: Briefcase,
    description: "Levande historiska fall. Lär av andras segrar och misstag.",
    target: "inlarningsvagar",
  },
  {
    id: "mega-levels",
    title: "MEGA NIVÅER 1-100",
    subtitle: "6 TIERS",
    icon: TrendingUp,
    description: "Sex nivåer av mästerskap — från nyfiken till expert.",
    target: "inlarningsvagar",
  },
  {
    id: "rewards",
    title: "BELÖNINGAR",
    subtitle: "14 BADGES",
    icon: Award,
    description: "Tjäna badges, XP och streaks. Spelet är kunskap.",
    target: "inlarningsvagar",
  },
  {
    id: "insights",
    title: "ANALYTIKER-INSIKTER",
    subtitle: "5 INSIKTER",
    icon: Lightbulb,
    description: "Korta insikter från institutionella analytiker.",
    target: "inlarningsvagar",
  },
];

const LEARNING_PATHS = [
  {
    num: 1,
    eyebrow: "STEG 1 I LÄROPLANEN",
    title: "Nybörjare → Förstå ett bolag",
    body: "Aktie vs bolag vs fond. Läs en årsredovisning. Introduktion till AKM1. Första variabeln (V1 — försäljningstillväxt).",
    courses: 4,
    minutes: 52,
    premium: false,
  },
  {
    num: 2,
    eyebrow: "STEG 2 I LÄROPLANEN",
    title: "Aktiv → Räkna på det",
    body: "Bokföringens grunder. Nyckeltal. Scenario-analys. Kassaflödesmodellering. Värderingsmetoder. Risk-koncept.",
    courses: 6,
    minutes: 84,
    premium: true,
  },
  {
    num: 3,
    eyebrow: "STEG 3 I LÄROPLANEN",
    title: "Ambitiös → Bedöm det (Power 19)",
    body: "Alla 19 AKM1-variabler. Integration mot Labbet. Reproducera institutionella analyser självständigt.",
    courses: 9,
    minutes: 156,
    premium: true,
  },
];

/* ------------------------------------------------------------------ */
/* Main section                                                        */
/* ------------------------------------------------------------------ */

export function KurserSection() {
  const { progress, completeCourse, level } = useAk1aStore();
  const [categoryFilter, setCategoryFilter] = React.useState<string>("ALLA");
  const [activeCourseId, setActiveCourseId] = React.useState<string | null>(null);

  const visibleVariables = React.useMemo(() => {
    if (categoryFilter === "ALLA") return AKM1_VARIABLES;
    return AKM1_VARIABLES.filter((v) => v.category === categoryFilter);
  }, [categoryFilter]);

  const completedAkm1Ids = React.useMemo(
    () =>
      new Set(
        AKM1_VARIABLES.filter((v) =>
          progress.completedCourses.includes(v.id)
        ).map((v) => v.id)
      ),
    [progress.completedCourses]
  );

  const completedCount = completedAkm1Ids.size;
  const akm1ProgressPct = Math.round((completedCount / 19) * 100);

  const activeCourse = React.useMemo(
    () => AKM1_VARIABLES.find((v) => v.id === activeCourseId) ?? null,
    [activeCourseId]
  );

  const scrollToId = (id: string) => {
    if (typeof document !== "undefined") {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="paper-texture">
      {/* ───────────── HERO ───────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-3xl">
            <Eyebrow>AK1A Kurser</Eyebrow>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Komplett kunskapsmarknad
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              270 kurser totalt. AKM1:s 19 variabler, kunskapsmarknad,
              mega-nivåer, belöningar och analytiker-insikter — allt på ett
              ställe.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-gold text-background hover:bg-gold/90"
                onClick={() => scrollToId("akm1-variabler")}
              >
                Börja med AKM1 <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToId("kurserna-spar")}
              >
                Utforska marknaden
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── STATS ROW ───────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              kind="matt"
              value="270"
              label="Kurser"
              caption="↑ KONTINUERLIG TILLVÄXT"
            />
            <StatTile
              kind="matt"
              value="142.9"
              label="Timmar"
              caption="↑ 142.9H TOTAL"
            />
            <ProgressTile
              completed={completedCount}
              total={19}
              pct={akm1ProgressPct}
              xp={progress.xp}
            />
            <StatTile
              kind="matt"
              value="0"
              label="Dolda avgifter"
              caption="ALLTID GRATIS ATT LÄRA"
            />
          </div>
        </div>
      </section>

      {/* ───────────── CATEGORIES ───────────── */}
      <section id="kurserna-spar" className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Kurserna</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
            Välj ditt spår.
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Sex sätt att utforska kunskap. Börja med AKM1:s 19 variabler —
            grunden allt annat vilar på.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORY_CARDS.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollToId(cat.target)}
                  className="group flex flex-col items-start rounded-lg border border-border bg-card p-6 text-left transition-all hover:border-gold/50 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gold/30 bg-gold/10 text-gold">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                      {cat.subtitle}
                    </span>
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-bold leading-tight">
                    {cat.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {cat.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gold group-hover:underline">
                    Öppna spåret
                    <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────── AKM1 19 VARIABLES ───────────── */}
      <section id="akm1-variabler" className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Eyebrow>AKM1 — grunden</Eyebrow>
              <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
                AKM1:s 19 variabler
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Lär dig varje indikator i AKM1-modellen. Varje kurs har teori,
                räkneexempel, övning och analytiker-insikt.
              </p>
            </div>
            <div className="min-w-[240px] rounded-lg border border-gold/30 bg-gold/[0.04] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                  Din progress
                </span>
                <HonestyTag kind="matt" />
              </div>
              <p className="mt-2 font-serif text-4xl font-bold leading-none">
                {completedCount}
                <span className="text-2xl text-muted-foreground">/19</span>
              </p>
              <ProgressBar pct={akm1ProgressPct} className="mt-3" />
              <p className="mt-2 text-xs text-muted-foreground">
                {akm1ProgressPct}% av AKM1 fullt behärskat
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <Tabs
            value={categoryFilter}
            onValueChange={setCategoryFilter}
            className="mt-8"
          >
            <div className="-mx-4 overflow-x-auto pb-1 sm:mx-0">
              <TabsList className="h-auto w-max gap-1.5 rounded-lg border border-border bg-transparent p-1">
                {CATEGORY_FILTERS.map((f) => (
                  <TabsTrigger
                    key={f.id}
                    value={f.id}
                    className="rounded-md border border-transparent px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground data-[state=active]:border-gold data-[state=active]:bg-gold data-[state=active]:text-background data-[state=active]:shadow-none whitespace-nowrap"
                  >
                    {f.label}
                    <span className="ml-1 text-[10px] opacity-70">
                      ({f.count})
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>

          {/* Course grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleVariables.map((v) => {
              const isCompleted = completedAkm1Ids.has(v.id);
              const isLocked = isLockedFor(v.level, level);
              return (
                <Akm1CourseCard
                  key={v.id}
                  variable={v}
                  isCompleted={isCompleted}
                  isLocked={isLocked}
                  onStart={() => setActiveCourseId(v.id)}
                />
              );
            })}
          </div>

          {/* Level-aware note */}
          <p className="mt-6 text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider text-gold">
              Din nivå:
            </span>{" "}
            {LEVEL_LABEL[level]}.{" "}
            {level === "nyborjare" &&
              "Avancerade kurser är låsta — växla till Intermediär eller Avancerad i toppen för att låsa upp."}
            {level === "intermediar" &&
              "Nybörjare- och Intermediär-kurser är upplåsta. Avancerade kurser kräver Avancerad-nivå."}
            {level === "avancerad" &&
              "Alla 19 variabler är upplåsta. Du kan påbörja vilken kurs som helst."}
          </p>
        </div>
      </section>

      {/* ───────────── KNOWLEDGE MAP ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>19 celler · 19 variabler</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
            Din kunskapskarta
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Så här ser din AKM1-kunskap ut som en struktur — inte en
            procentsats.
          </p>

          <Card className="mt-8 gap-0 p-6">
            {/* 19-cell grid */}
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 lg:grid-cols-10">
              {AKM1_VARIABLES.map((v) => {
                const isMastered = completedAkm1Ids.has(v.id);
                return (
                  <div
                    key={v.id}
                    title={`${v.id} — ${v.name}${
                      isMastered ? " · Behärskad" : " · Ej påbörjad"
                    }`}
                    className={cn(
                      "flex aspect-square flex-col items-center justify-center rounded-md border text-center transition-colors",
                      isMastered
                        ? "border-gold/60 bg-gold/15 text-gold"
                        : "border-border bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <span className="font-serif text-sm font-bold">
                      {v.id}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider opacity-70">
                      {isMastered ? "Klar" : "—"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-5">
              <LegendItem
                swatch="bg-gold/20 border-gold/60"
                label="Behärskad"
                sub="Kurs slutförd + scenario + quiz godkänd"
              />
              <LegendItem
                swatch="bg-blue-400/30 border-blue-400/50"
                label="Pågår"
                sub="Kurs påbörjad, ej slutförd"
              />
              <LegendItem
                swatch="bg-amber-400/30 border-amber-400/50"
                label="Påbörjad"
                sub="Första lektionen öppnad"
              />
              <LegendItem
                swatch="bg-muted border-border"
                label="Ej påbörjad"
                sub="Nästa inlärningsmål"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <HonestyTag kind="matt" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Demo: En användares kunskapssnapshot
              </span>
            </div>
          </Card>
        </div>
      </section>

      {/* ───────────── LEARNING PATHS ───────────── */}
      <section
        id="inlarningsvagar"
        className="border-b border-border bg-muted/30"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Inlärningsvägar</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
            Följ en väg, inte en lista.
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Tre steg. Börja där du är. Varje steg bygger på det förra.
          </p>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {LEARNING_PATHS.map((p) => (
              <PathCard key={p.num} path={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── COURSE DETAIL DIALOG ───────────── */}
      <CourseDetailDialog
        course={activeCourse}
        isCompleted={
          activeCourse ? completedAkm1Ids.has(activeCourse.id) : false
        }
        isLocked={
          activeCourse ? isLockedFor(activeCourse.level, level) : false
        }
        onClose={() => setActiveCourseId(null)}
        onComplete={() => {
          if (activeCourse) completeCourse(activeCourse.id);
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function StatTile({
  kind,
  value,
  label,
  caption,
}: {
  kind: "matt" | "metodmal";
  value: string;
  label: string;
  caption: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <HonestyTag kind={kind} />
      <p className="mt-3 font-serif text-4xl font-bold leading-none">
        {value}
      </p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground/70">
        {caption}
      </p>
    </div>
  );
}

function ProgressTile({
  completed,
  total,
  pct,
  xp,
}: {
  completed: number;
  total: number;
  pct: number;
  xp: number;
}) {
  return (
    <div className="rounded-lg border border-gold/30 bg-gradient-to-br from-card to-gold/[0.04] p-5">
      <div className="flex items-center justify-between">
        <HonestyTag kind="matt" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
          XP {xp}
        </span>
      </div>
      <p className="mt-3 font-serif text-4xl font-bold leading-none">
        {completed}
        <span className="text-2xl text-muted-foreground">/{total}</span>
      </p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Klara · Din personliga utveckling
      </p>
      <ProgressBar pct={pct} className="mt-3" />
    </div>
  );
}

function ProgressBar({
  pct,
  className,
}: {
  pct: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
    >
      <div
        className="h-full bg-gold transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Akm1CourseCard({
  variable,
  isCompleted,
  isLocked,
  onStart,
}: {
  variable: Akm1Variable;
  isCompleted: boolean;
  isLocked: boolean;
  onStart: () => void;
}) {
  const weightLabel =
    variable.weight === "KRITISK"
      ? `${variable.category.toUpperCase()} · KRITISK`
      : `${variable.category.toUpperCase()} · ${variable.weight}`;

  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden p-0 py-0 transition-all",
        isLocked && !isCompleted && "opacity-70",
        isCompleted
          ? "border-bull/40"
          : "hover:border-gold/40 hover:shadow-md"
      )}
    >
      <div className="p-5">
        {/* Top row: weight + minutes */}
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className={cn(
              "border-gold/40 bg-gold/5 text-gold",
              variable.weight === "KRITISK" && "border-bear/40 bg-bear/5 text-bear"
            )}
          >
            {weightLabel}
          </Badge>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {variable.minutes} min
          </span>
        </div>

        {/* Number + ID */}
        <div className="mt-4 flex items-baseline gap-3">
          <span className="font-serif text-5xl font-bold leading-none text-ink dark:text-foreground">
            {variable.num}
          </span>
          <span className="font-mono text-sm font-semibold text-muted-foreground">
            {variable.id}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-3 font-serif text-lg font-bold leading-tight">
          {variable.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {variable.summary}
        </p>

        {/* Bottom row: level + tags */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-muted-foreground">
            {LEVEL_LABEL[variable.level]}
          </Badge>
          <HonestyTag kind="matt" />
          {isCompleted && (
            <Badge className="border border-bull/30 bg-bull/15 text-bull">
              <Check className="h-3 w-3" /> Klar
            </Badge>
          )}
          {isLocked && !isCompleted && (
            <Badge
              variant="outline"
              className="border-muted-foreground/30 text-muted-foreground"
            >
              <Lock className="h-3 w-3" /> Avancerad-nivå
            </Badge>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-muted/30 p-4">
        <Button
          className={cn(
            "w-full",
            isCompleted
              ? "bg-bull text-background hover:bg-bull/90"
              : "bg-gold text-background hover:bg-gold/90"
          )}
          onClick={onStart}
          disabled={isLocked && !isCompleted}
        >
          {isLocked && !isCompleted ? (
            <>
              <Lock className="h-4 w-4" /> Låst — kräver Avancerad-nivå
            </>
          ) : isCompleted ? (
            <>
              <Check className="h-4 w-4" /> Repetera kursen
            </>
          ) : (
            <>
              Starta <ArrowRight className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}

function CourseDetailDialog({
  course,
  isCompleted,
  isLocked,
  onClose,
  onComplete,
}: {
  course: Akm1Variable | null;
  isCompleted: boolean;
  isLocked: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  const weightLabel = course
    ? course.weight === "KRITISK"
      ? `${course.category.toUpperCase()} · KRITISK`
      : `${course.category.toUpperCase()} · ${course.weight}`
    : "";

  return (
    <Dialog open={!!course} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {course && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "border-gold/40 bg-gold/5 text-gold",
                    course.weight === "KRITISK" &&
                      "border-bear/40 bg-bear/5 text-bear"
                  )}
                >
                  {weightLabel}
                </Badge>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {course.minutes} min
                </span>
              </div>
              <DialogTitle className="mt-2 font-serif text-2xl leading-tight">
                <span className="mr-2 font-mono text-base font-semibold text-gold">
                  {course.id}
                </span>
                {course.name}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                {course.summary}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{LEVEL_LABEL[course.level]}</Badge>
                <HonestyTag kind="matt" />
                {isCompleted && (
                  <Badge className="border border-bull/30 bg-bull/15 text-bull">
                    <Check className="h-3 w-3" /> Redan klar
                  </Badge>
                )}
              </div>

              {course.formula && (
                <div className="rounded-md border border-border bg-muted/40 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                    Formel
                  </p>
                  <p className="mt-2 font-mono text-sm leading-relaxed text-foreground">
                    {course.formula}
                  </p>
                </div>
              )}

              {course.scale && (
                <div className="rounded-md border border-border bg-muted/40 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                    Poängskala 1–5
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground">
                    {course.scale}
                  </p>
                </div>
              )}

              {!course.formula && !course.scale && (
                <div className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Kursen har teori, räkneexempel och övning — öppnas i
                    inlärningsvägen.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              {isLocked && !isCompleted ? (
                <Button variant="outline" disabled className="w-full">
                  <Lock className="h-4 w-4" /> Låst — kräver Avancerad-nivå
                </Button>
              ) : isCompleted ? (
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full"
                >
                  <Check className="h-4 w-4" /> Kursen redan klar (+100 XP)
                </Button>
              ) : (
                <Button
                  className="w-full bg-gold text-background hover:bg-gold/90"
                  onClick={() => {
                    onComplete();
                    onClose();
                  }}
                >
                  <Check className="h-4 w-4" /> Markera som klar (+100 XP)
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function LegendItem({
  swatch,
  label,
  sub,
}: {
  swatch: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span
        className={cn(
          "mt-0.5 inline-block h-3 w-3 shrink-0 rounded-sm border",
          swatch
        )}
      />
      <div>
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

function PathCard({ path }: { path: (typeof LEARNING_PATHS)[number] }) {
  return (
    <Card
      className={cn(
        "gap-0 p-6",
        path.premium &&
          "border-gold/60 bg-gradient-to-br from-card to-gold/[0.04]"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-gold/10 font-serif text-lg font-bold text-gold">
          {path.num}
        </span>
        {path.premium && (
          <Badge className="border border-gold/30 bg-gold/15 text-gold">
            <Lock className="h-3 w-3" /> Premium
          </Badge>
        )}
      </div>
      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
        {path.eyebrow}
      </p>
      <h3 className="mt-2 font-serif text-xl font-bold leading-tight">
        {path.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {path.body}
      </p>
      <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
          <BookOpen className="h-4 w-4 text-gold" />
          {path.courses}
          <span className="font-normal text-muted-foreground">kurser</span>
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
          <Clock className="h-4 w-4 text-gold" />
          {path.minutes}
          <span className="font-normal text-muted-foreground">min total</span>
        </span>
      </div>
      <Button
        className={cn(
          "mt-4 w-full",
          path.premium
            ? "bg-gold text-background hover:bg-gold/90"
            : "bg-foreground text-background hover:bg-foreground/90"
        )}
      >
        Följ denna väg <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </Card>
  );
}
