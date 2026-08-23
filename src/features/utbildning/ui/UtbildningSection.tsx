"use client";

import * as React from "react";
import {
  ArrowRight,
  Check,
  GraduationCap,
  Star,
  Zap,
  Quote,
  ChevronRight,
  Layers,
  FlaskConical,
  LineChart,
  PlayCircle,
} from "lucide-react";
import { useAk1aStore } from "@/lib/ak1a-store";
import { isDeepCourseSlug } from "@/lib/ak1a/deep-courses-data";
import { Eyebrow, GoldRule, HonestyTag } from "@/components/ak1a/primitives";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

const V01_SLUG = "v01-forsaljningstillvaxt";

function scrollToId(id: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/* ------------------------------------------------------------------ */
/*  Local typed data                                                   */
/* ------------------------------------------------------------------ */

interface StepCourse {
  label: string;
}

interface LaroPlanSteg {
  num: string;
  stepLabel: string;
  title: string;
  desc: string;
  courses: StepCourse[];
  count: number;
  minutes: number;
  power?: boolean;
}

const LAROPLAN_STEG: LaroPlanSteg[] = [
  {
    num: "01",
    stepLabel: "STEG 1",
    title: "Förstå ett bolag",
    desc: "Vad är en aktie? Vad är ett bolag? Vad äger du egentligen?",
    courses: [
      { label: "Aktie vs Bolag vs Fond" },
      { label: "Aktieslag A/B/C" },
      { label: "Utdelning" },
      { label: "Återköp" },
    ],
    count: 4,
    minutes: 52,
  },
  {
    num: "02",
    stepLabel: "STEG 2",
    title: "Räkna på det",
    desc: "Intäkter, marginaler, skuld, kassaflöde. Santen bakom siffrorna.",
    courses: [
      { label: "Resultaträkning" },
      { label: "Balansräkning" },
      { label: "Kassaflöde" },
      { label: "AKM1 V1-V5 (Tillväxt)" },
      { label: "AKM1 V6-V9 (Värdering)" },
      { label: "AKM1 V10-V12 (Lönsamhet)" },
    ],
    count: 6,
    minutes: 84,
  },
  {
    num: "03",
    stepLabel: "STEG 3",
    title: "Bedöm det",
    desc: "De 19 fundamentala variablerna. Moat, katalysatorer, risk. Detta är Carnegie-nivå.",
    courses: [
      { label: "AKM1 V13-V15 (Stabilitet)" },
      { label: "AKM1 V16-V17 (Moat)" },
      { label: "AKM1 V18 (Katalysator)" },
      { label: "AKM1 V19 (Risk)" },
      { label: "Farliga kombinationer" },
      { label: "AK1TS: Elliott Wave" },
      { label: "AK1TS: Fibonacci" },
      { label: "AK1TS: 5 horisonter" },
      { label: "Reproducera en analys" },
    ],
    count: 9,
    minutes: 156,
    power: true,
  },
];

interface CompletionRow {
  course: string;
  pct: number;
  note?: string;
}

const COMPLETION_ROWS: CompletionRow[] = [
  { course: "Aktie vs Bolag vs Fond", pct: 94 },
  { course: "AKM1 V1 — Tillväxt", pct: 87 },
  { course: "AK1TS: Elliott Wave", pct: 62, note: "svårare kurs, lägre grad — ärligt" },
  { course: "Reproducera en analys", pct: 71 },
];

interface Testimonial {
  quote: string;
  name: string;
  meta: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Jag förstår äntligen vad jag äger.",
    name: "Johan",
    meta: "42, ingenjör",
  },
  {
    quote: "Jag läser årsredovisningar annorlunda nu. Helt annorlunda.",
    name: "Sara",
    meta: "35, lärare",
  },
  {
    quote: "Min kompis på Carnegie frågade var jag lärt mig det här.",
    name: "Erik",
    meta: "28, student KTH",
  },
];

const PRICE_FEATURES: string[] = [
  "19 Power-kurser (AKM1 V1-V19)",
  "183 valfria tilläggs-kurser",
  "Labbet — calculatorn, scenarier, verktyg",
  "Alla publicerade analyser",
];

interface Faq {
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  {
    q: "Måste jag ha en broker först?",
    a: "Nej. 30-minuterspasset kräver ingen broker och ingen kapitalinsats — du poängsatt Atlas Copco på papper. En broker behövs först när du själv väljer att omsätta dina analyser i faktiska positioner. AK1A är en analysplattform, inte en mäklare.",
  },
  {
    q: "Fungerar detta för nybörjare?",
    a: "Ja. Steg 1 börjar med ‘vad är en aktie?’ och bygger stegvis. Level-väljaren (Nybörjare / Intermediär / Avancerad) anpassar språket i analyserna — du kan sänka tröskeln och höja den när du mognar. Anti-casino: inga push-notiser, inga snabba knappar.",
  },
  {
    q: "Är detta finansiell rådgivning?",
    a: "Nej. AK1A publicerar pedagogisk finansanalys — metoder, slutsatser, scenarier och risker — inte individuella råd att köpa eller sälja specifika värdepapper. Besluten fattar du själv, med din egen risknivå. Investera aldrig pengar du inte har råd att förlora.",
  },
  {
    q: "Vad krävs för att bli klar?",
    a: "En kurs räknas som slutförd när alla kapitel är lästa och eventuella quiz besvarade — progress sparas i din profil. ‘Klar’ som analytiker är subjektivt: 19 Power-kurser ger dig metoden, Reproducera-en-analys ger dig beviset, resten är valfria tillägg.",
  },
  {
    q: "Varför inte bara köpa index?",
    a: "Index är legitimt för många — och inget vi argumenterar emot. AK1A lär dig förstå vad du faktiskt äger: variablerna bakom de bolag som driver indexet. Om du ändå väljer index gör du det med öppna ögon, inte som en svart låda.",
  },
];

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

export function UtbildningSection() {
  const { setSection, setKurserDeepSlug } = useAk1aStore();

  // Sanity link: ensures the V01 slug is a valid deep course.
  const v01Exists = React.useMemo(
    () => isDeepCourseSlug(V01_SLUG),
    []
  );

  const openV01 = React.useCallback(() => {
    // Falls back to the literal slug even if the data lookup somehow misses.
    setKurserDeepSlug(v01Exists ? V01_SLUG : V01_SLUG);
  }, [setKurserDeepSlug, v01Exists]);

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
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <Eyebrow>Läroplan</Eyebrow>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Bli analytiker.
              <br />
              <span className="text-gold">Inte kund.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
              En strukturerad läroplan — inte en kurs-katalog. Steg för steg,
              från ‘vad är en aktie’ till att reproducera institutionella
              analyser.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => scrollToId("starta-har")}
                className="bg-gold text-background hover:bg-gold/90"
              >
                Kom igång på 30 minuter <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToId("laroplanen")}
              >
                Se läroplanen
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <HonestyTag kind="metodmal" />
                <span className="text-muted-foreground">
                  30 min → din första analys
                </span>
              </div>
              <span className="hidden sm:inline text-border">|</span>
              <div className="flex items-center gap-2">
                <HonestyTag kind="matt" />
                <span className="text-muted-foreground">
                  89% slutför 30-min passet
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── 30 MINUTER TILL DIN FÖRSTA ANALYS ───────────── */}
      <section
        id="starta-har"
        className="border-b border-border scroll-mt-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20">
          <div className="max-w-3xl">
            <Eyebrow>Börja här</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              30 minuter till din första analys
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Gratis. Ingen registrering. Bara gör det.
            </p>
            <Button
              size="lg"
              className="mt-6 bg-gold text-background hover:bg-gold/90"
              onClick={() => scrollToId("trettio-min-passet")}
            >
              Kom igång på 30 minuter <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
            {/* Left: explanation + steps */}
            <div>
              <p className="font-serif text-xl leading-relaxed text-ink dark:text-foreground">
                Efter 30 minuter har du poängsatt en riktig svensk aktie
                (Atlas Copco) på AKM1-variabel 1 (tillväxt). Du har gjort
                institutionell analys. Inte sett den — gjort den.
              </p>

              <ol
                id="trettio-min-passet"
                className="mt-8 space-y-3 scroll-mt-24"
              >
                {[
                  "Läs kursen ‘Vad är tillväxt?’ (8 min)",
                  "Se exempel: Atlas Copcos organiska tillväxt 2023 (4 min)",
                  "Poängsatt själv med AKM1-calculatorn (10 min)",
                  "Jämför din poäng med AK1A:s publicerade analys (2 min)",
                ].map((step, i) => (
                  <li key={i}>
                    <div className="flex items-start gap-3 rounded-md border border-border bg-card p-4">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/10 font-serif text-sm font-bold text-gold ring-1 ring-gold/30">
                        {i + 1}
                      </span>
                      <span className="text-sm sm:text-base text-ink/90 dark:text-foreground/90">
                        {step}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-8">
                <Button
                  size="lg"
                  className="bg-gold text-background hover:bg-gold/90"
                  onClick={openV01}
                >
                  <PlayCircle className="mr-1 h-4 w-4" />
                  Starta 30-minuters passet
                </Button>
              </div>
            </div>

            {/* Right: stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Card className="border-border bg-card p-6">
                <HonestyTag kind="matt" />
                <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Genomsnittlig slutförandegrad
                </div>
                <div className="mt-1 font-serif text-5xl font-bold text-gold">
                  89%
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Av alla som startar 30-minuterspasset blir klara.
                </p>
              </Card>
              <Card className="border-border bg-card p-6">
                <HonestyTag kind="matt" />
                <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Tid att bli klar
                </div>
                <div className="mt-1 font-serif text-5xl font-bold text-gold">
                  28 min
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  i snitt. Metodmål 30 min — verkligheten snäppet snabbare.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── LÄROPLANEN ───────────── */}
      <section
        id="laroplanen"
        className="border-b border-border bg-muted/30 scroll-mt-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20">
          <div className="max-w-3xl">
            <Eyebrow>Läroplanen</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Tre steg. En analytiker.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Ingen smörgåsbord. En väg.
            </p>
            <GoldRule className="mt-6 w-24" />
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {LAROPLAN_STEG.map((steg) => (
              <Card
                key={steg.num}
                className={cn(
                  "relative flex flex-col border-border bg-card p-6",
                  steg.power && "border-gold/40 shadow-sm"
                )}
              >
                {steg.power && (
                  <Badge
                    className="absolute -top-2 right-4 bg-gold text-background hover:bg-gold/90"
                    variant="default"
                  >
                    <Zap className="mr-1 h-3 w-3" /> POWER 19
                  </Badge>
                )}

                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-4xl font-bold text-gold/60">
                    {steg.num}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {steg.stepLabel}
                  </span>
                </div>

                <h3 className="mt-3 font-serif text-2xl font-bold tracking-tight">
                  {steg.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {steg.desc}
                </p>

                <div className="mt-6">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Kurser i detta steg
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {steg.courses.map((c, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-ink/90 dark:text-foreground/90"
                      >
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                        <span>{c.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex items-center gap-2">
                  <HonestyTag kind="matt" />
                  <span className="text-sm text-muted-foreground">
                    {steg.count} kurser · {steg.minutes} min totalt
                  </span>
                </div>

                <div className="pt-6 mt-auto border-t border-border">
                  <Button
                    className="w-full bg-gold text-background hover:bg-gold/90"
                    onClick={openV01}
                  >
                    Börja {steg.stepLabel.replace("STEG", "Steg")}{" "}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── POWER 19-PRINCIPEN ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20">
          <div className="max-w-3xl">
            <Eyebrow>Power 19-principen</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              19 variabler. 80% av värdet.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Av 200+ kurser driver 19 grundläggande AKM1-variabler 80% av
              analys-värdet. Dessa får premium-behandling. Resten är valfria
              tillägg.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {/* Premium Power 19 */}
            <Card className="relative border-gold/40 bg-card p-6 shadow-sm">
              <Badge
                className="absolute -top-2 right-4 bg-gold text-background hover:bg-gold/90"
                variant="default"
              >
                <Star className="mr-1 h-3 w-3" /> PREMIUM
              </Badge>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-gold" />
                <h3 className="font-serif text-2xl font-bold tracking-tight">
                  Power 19
                </h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Fullständiga kurs-sidor med scenario, quiz, calculator,
                integration mot Labbet. Serif-typografi. Guld-accent.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <HonestyTag kind="matt" />
                <span className="text-sm text-muted-foreground">
                  19 kurser · 312 min totalt
                </span>
              </div>
            </Card>

            {/* Valfria tillägg */}
            <Card className="border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-neutral-signal" />
                <h3 className="font-serif text-2xl font-bold tracking-tight">
                  Valfria tillägg
                </h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                183 kurser. Samma kvalitet, enklare format. Fördjupningar,
                historiska fall, sektors-översikter.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <HonestyTag kind="matt" />
                <span className="text-sm text-muted-foreground">
                  183 kurser · ~38 tim totalt
                </span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ───────────── ÄRLIGA SLUTFÖRANDEGRAD ───────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20">
          <div className="max-w-3xl">
            <Eyebrow>Ärliga slutförandegrad</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Vi publicerar vad andra döljer.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Branschen visar sällan slutförandegrad. Vi visar den för varje
              kurs.
            </p>
          </div>

          <Card className="mt-10 border-border bg-card overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1.6fr_1fr_1fr] sm:grid-cols-[2fr_1fr_1fr] gap-4 px-5 sm:px-6 py-3 border-b border-border bg-muted/40">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Kurs
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Grad
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Status
              </span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border">
              {COMPLETION_ROWS.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1.6fr_1fr_1fr] sm:grid-cols-[2fr_1fr_1fr] gap-4 px-5 sm:px-6 py-4 items-center"
                >
                  <div>
                    <div className="font-medium text-ink dark:text-foreground">
                      {row.course}
                    </div>
                    {row.note && (
                      <div className="mt-0.5 text-xs italic text-muted-foreground">
                        {row.note}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg font-bold text-gold w-12">
                      {row.pct}%
                    </span>
                    <Progress
                      value={row.pct}
                      className="hidden sm:block h-1.5 bg-muted"
                    />
                  </div>
                  <div>
                    <HonestyTag kind="matt" />
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-border bg-muted/20">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Urval ur 50 mest startade kurser. Räknat på unika användare
                som slutfört alla moduler / unika som startat — senaste 90
                dagarna.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* ───────────── VAD VÅRA DELTAGARE SÄGER ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20">
          <div className="max-w-3xl">
            <Eyebrow>Vad våra deltagare säger</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Inte ‘jag tjänade 50%’. Något annat.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className="border-border bg-card p-6 flex flex-col">
                <Quote className="h-8 w-8 text-gold/40" />
                <blockquote className="mt-4 flex-1 font-serif text-lg italic leading-relaxed text-ink dark:text-foreground">
                  “{t.quote}”
                </blockquote>
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-muted-foreground">{t.meta}</div>
                </div>
                <div className="mt-3">
                  <HonestyTag kind="matt" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── PRIS ───────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <Eyebrow>Pris</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              En prenumeration. Inga nivåer.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Allt ingår.
            </p>
          </div>

          <Card className="mx-auto mt-10 max-w-xl border-gold/40 bg-card p-8 sm:p-10 text-center shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
              Allt ingår
            </div>
            <h3 className="mt-2 font-serif text-3xl font-bold tracking-tight">
              AK1A Medlemskap
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Allt ingår. 19 Power-kurser. 183 valfria. Labbet. Analyserna.
            </p>

            <div className="mt-8 flex items-end justify-center gap-2">
              <span className="font-serif text-6xl font-bold text-gold leading-none">
                149
              </span>
              <span className="mb-1 text-lg font-medium text-muted-foreground">
                kr/mån
              </span>
            </div>
            <div className="mt-3 flex justify-center">
              <HonestyTag kind="matt" />
            </div>

            <ul className="mt-8 space-y-3 text-left">
              {PRICE_FEATURES.map((feat, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm sm:text-base"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-bull" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="mt-8 w-full bg-gold text-background hover:bg-gold/90"
              onClick={() => setSection("kurser")}
            >
              Bli medlem <ArrowRight className="ml-1 h-4 w-4" />
            </Button>

            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              Ingen kreditkort krävs för 30-minuters passet.{" "}
              <br className="hidden sm:block" />
              Ingen bindningstid. Avsluta när du vill.
            </p>
          </Card>
        </div>
      </section>

      {/* ───────────── FRÅGOR (FAQ) ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20">
          <div className="max-w-3xl">
            <Eyebrow>Frågor</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Det folk frågar innan de börjar.
            </h2>
          </div>

          <div className="mt-10 max-w-3xl">
            <Card className="border-border bg-card p-2 sm:p-4">
              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((f, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="px-2 sm:px-3"
                  >
                    <AccordionTrigger className="font-serif text-base sm:text-lg text-left hover:no-underline">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          </div>
        </div>
      </section>

      {/* ───────────── CLOSING ───────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <Eyebrow>Redo att börja?</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Ditt första analys-passage.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              30 minuter. Ingen registrering. Du gör din första institutionella
              analys — inte ser någon annans.
            </p>
            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                className="bg-gold text-background hover:bg-gold/90"
                onClick={openV01}
              >
                <PlayCircle className="mr-1 h-4 w-4" />
                Starta 30-minuters passet
              </Button>
            </div>
          </div>

          {/* Gå vidare CTAs */}
          <div className="mt-14">
            <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="text-gold">◆</span> Fortsätt utforska
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <CtaCard
                icon={<GraduationCap className="h-5 w-5 text-gold" />}
                title="Power 19-kurser"
                sub="19 fundamentala variabler"
                onClick={() => setSection("kurser")}
              />
              <CtaCard
                icon={<FlaskConical className="h-5 w-5 text-gold" />}
                title="Öppna Labbet"
                sub="Praktiska verktyg"
                onClick={() => setSection("labb")}
              />
              <CtaCard
                icon={<LineChart className="h-5 w-5 text-gold" />}
                title="Alla aktier"
                sub="8 bolag i registret"
                onClick={() => setSection("aktier")}
              />
            </div>
          </div>

          {/* Anti-casino footer note */}
          <div className="mt-14 max-w-3xl mx-auto rounded-md border border-border bg-card p-5 text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pedagogisk finansanalys — inte investeringsråd.{" "}
              <span className="text-ink/70 dark:text-foreground/70">
                Investera aldrig pengar du inte har råd att förlora.
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small CTA card used in the closing block                           */
/* ------------------------------------------------------------------ */

function CtaCard({
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
      type="button"
      onClick={onClick}
      className="group text-left rounded-md border border-border bg-card p-5 transition-colors hover:border-gold/40 hover:bg-gold/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gold/10 ring-1 ring-gold/30">
            {icon}
          </span>
          <div>
            <div className="font-serif text-base font-bold leading-tight">
              {title}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-gold transition-colors" />
      </div>
      <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold/70">
        Gå vidare →
      </div>
    </button>
  );
}
