"use client";

import * as React from "react";
import {
  ArrowRight,
  Brain,
  Zap,
  Layers,
  Microscope,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  BookOpen,
  Cpu,
  GitBranch,
} from "lucide-react";
import { useAk1aStore } from "@/lib/ak1a-store";
import { Eyebrow, GoldRule, HonestyTag } from "@/components/ak1a/primitives";
import { VerifyStamp, GoldDivider, InstitutionalFrame, DnaBackground } from "@/components/ak1a/dna";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════════
   FAS 3 — AI-automatisering av AK1TS våganalys + klientanalyser
   ══════════════════════════════════════════════════════════════════════════ */

interface AnalysisLength {
  id: string;
  level: string;
  title: string;
  pages: number;
  description: string;
  features: string[];
  status: "MÄTT" | "METODMÅL";
  icon: React.ReactNode;
}

const ANALYSIS_LENGTHS: AnalysisLength[] = [
  {
    id: "nyborjare",
    level: "Nybörjare",
    title: "13 sidor — Kort",
    pages: 13,
    description: "Snabb överblick: bolaget, rekommendation, 5 viktigaste variablerna. För den som vill förstå på 15 minuter.",
    features: [
      "Bolagsöversikt + rekommendation",
      "5 viktigaste AKM1-variabler",
      "Våg-position sammanfattning",
      "Prisnivåer + scenarier",
    ],
    status: "METODMÅL",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    id: "intermediar",
    level: "Intermediär",
    title: "35 sidor — Standard",
    pages: 35,
    description: "Detaljerad genomgång: alla 20 AKM1-variabler, Fibonacci-beräkningar, Elliott Wave-strukturer. För den som kan läsa nyckeltal.",
    features: [
      "Alla 20 AKM1-variabler beräknade",
      "Fibonacci-retracements + extensions",
      "Elliott Wave-strukturer (5 tidshorisonter)",
      "Scenarier: Bull / Base / Bear",
      "Risker + katalysatorer",
    ],
    status: "METODMÅL",
    icon: <Layers className="h-5 w-5" />,
  },
  {
    id: "avancerad",
    level: "Avancerad",
    title: "99 sidor — Fullständig",
    pages: 99,
    description: "Fullständig institutionell analys: alla tidshorisonter, Monte Carlo, Bayesian, Kelly, DCF-känslighet. För den som vill förstå allt.",
    features: [
      "Full 5×5 AK1TS våg-matris",
      "Monte Carlo-simulering (10 000 banor)",
      "Bayesian sannolikhetsuppdatering",
      "Kelly-kriteriet position sizing",
      "DCF-känslighetsanalys",
      "Reproducerbarhets-faktaruta",
    ],
    status: "METODMÅL",
    icon: <Microscope className="h-5 w-5" />,
  },
];

interface AIAnalysisFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: "MÄTT" | "METODMÅL";
}

const AI_FEATURES: AIAnalysisFeature[] = [
  {
    icon: <Cpu className="h-5 w-5" />,
    title: "AI våg-detektion",
    description: "AI-system analyserar automatiskt Elliott Wave, Fibonacci, Gann, Lucas, Volym över 5 tidshorisonter — 25 celler genererad på sekunder.",
    status: "METODMÅL",
  },
  {
    icon: <Brain className="h-5 w-5" />,
    title: "Bayesian konfluens",
    description: "AI beräknar vägd konfluens mellan alla 25 celler + 20 AKM1-variabler — rekommendation med konfidens-intervall.",
    status: "METODMÅL",
  },
  {
    icon: <GitBranch className="h-5 w-5" />,
    title: "Multi-längd generering",
    description: "Samma aktie → 3 längder (13/35/99 sidor). AI anpassar djupet utan att tappa data — kunden väljer nivå.",
    status: "METODMÅL",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "MÄTT-validering",
    description: "Varje AI-genererad analys valideras mot AK1A:s kvalitets-standard innan publicering. Ärlighet > hastighet.",
    status: "METODMÅL",
  },
];

export function Fas3Section() {
  const { setSection } = useAk1aStore();
  const [generating, setGenerating] = React.useState(false);
  const [generatedAnalyses, setGeneratedAnalyses] = React.useState<string[]>([]);

  const handleGenerateDemo = async () => {
    setGenerating(true);
    // Simulera AI-generering
    await new Promise((r) => setTimeout(r, 2000));
    setGeneratedAnalyses(["nyborjare", "intermediar", "avancerad"]);
    setGenerating(false);
  };

  return (
    <DnaBackground>
      <div className="paper-texture">
        {/* ───────────── HERO ───────────── */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
            <div className="max-w-4xl">
              <Eyebrow>◆ FAS 3 · AI-AUTOMATION ◆</Eyebrow>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <VerifyStamp status="METODMÅL" date="2026-Q4" />
                <Badge variant="outline" className="border-gold/40 text-gold uppercase tracking-wider text-[10px]">
                  AI-driven
                </Badge>
              </div>

              <h1 className="mt-5 font-serif text-3xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
                AI analyserar vågor.{" "}
                <span className="text-gold">Du förstår metoden.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base text-muted-foreground leading-relaxed sm:text-lg">
                Världen går mot AI och automation. Fas 3 kombinerar vår metodik med AI-system
                som automatiskt analyserar AK1TS vågor över alla tidshorisonter — så du får
                institutionella analyser på sekunder, inte veckor.
              </p>

              <GoldDivider className="mt-6 max-w-md" />

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-gold text-background hover:bg-gold/90"
                  onClick={handleGenerateDemo}
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" /> AI analyserar...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-1 h-4 w-4" /> Se demo-generering
                    </>
                  )}
                </Button>
                <Button size="lg" variant="outline" onClick={() => setSection("kurser")}>
                  <BookOpen className="mr-1 h-4 w-4" /> Lär dig metoden först
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── AI-SYSTEM FUNKTIONER ───────────── */}
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
            <Eyebrow>AI-system — 4 kärnfunktioner</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
              Vad AI-systemet gör
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-muted-foreground leading-relaxed sm:text-base">
              AK1TS våganalys är komplext — 5 teorier × 5 tidshorisonter = 25 celler per aktie.
              Manuellt tar det 40+ timmar. AI-systemet gör det på sekunder, med MÄTT-validering.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {AI_FEATURES.map((f, i) => (
                <Card key={i} className="border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.06] text-gold">
                      {f.icon}
                    </span>
                    <VerifyStamp status={f.status} />
                  </div>
                  <h3 className="mt-3 font-serif text-base font-bold leading-tight">{f.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{f.description}</p>
                </Card>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2">
              <HonestyTag kind="metodmal" />
              <span className="text-xs text-muted-foreground">
                Alla AI-funktioner är METODMÅL — under utveckling med gradvis implementering
              </span>
            </div>
          </div>
        </section>

        {/* ───────────── 3 LÄNGDER ───────────── */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
            <Eyebrow>Klientanalyser — 3 längder, 1 aktie</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
              Välj ditt djup
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-muted-foreground leading-relaxed sm:text-base">
              Samma aktie, samma metodik — tre längder för tre nivåer av förståelse.
              Du börjar kort och fördjupar dig när du mognar.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {ANALYSIS_LENGTHS.map((length) => (
                <InstitutionalFrame key={length.id} className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.06] text-gold">
                      {length.icon}
                    </span>
                    <VerifyStamp status={length.status} />
                  </div>

                  <h3 className="mt-3 font-serif text-lg font-bold leading-tight">{length.title}</h3>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {length.level} · {length.pages} sidor
                  </p>

                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{length.description}</p>

                  <Separator className="my-3 bg-border" />

                  <ul className="space-y-1.5">
                    {length.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-gold" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 pt-3 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      disabled={length.status === "METODMÅL"}
                    >
                      {length.status === "METODMÅL" ? "METODMÅL — Kommer Q4 2026" : "Öppna analys"}
                    </Button>
                  </div>
                </InstitutionalFrame>
              ))}
            </div>

            {generatedAnalyses.length > 0 && (
              <Card className="mt-6 border-gold/40 bg-gold/[0.04] p-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-bull" />
                  <h3 className="font-serif text-base font-bold">AI-generering demo</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  AI-systemet genererade 3 längder av samma aktie på 2 sekunder:
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {generatedAnalyses.map((id) => {
                    const l = ANALYSIS_LENGTHS.find((a) => a.id === id);
                    return (
                      <div key={id} className="rounded-md border border-border bg-card p-3">
                        <div className="font-serif text-sm font-bold">{l?.title}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">{l?.pages} sidor · {l?.level}</div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-[10px] text-muted-foreground">
                  Demo — i produktion valideras varje analys MÄTT innan publicering.
                </p>
              </Card>
            )}
          </div>
        </section>

        {/* ───────────── METODIK-LICENS ───────────── */}
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
              <div>
                <Eyebrow>Metodik-licens — Fas 3 exklusivt</Eyebrow>
                <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">
                  Lär dig tänka. Inte bara kopiera.
                </h2>
                <p className="mt-4 max-w-2xl text-sm text-muted-foreground leading-relaxed sm:text-base">
                  Fas 3-kunder får tillgång till metodik-licensen — hur man TÄNKER när man analyserar
                  vågor. Inte den exakta formeln (det är vår know-how), men tanke-ramverket som gör
                  att du kan utmana och förstå AI-systemets slutsatser.
                </p>
                <GoldDivider className="mt-6 max-w-xs" />
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <VerifyStamp status="METODMÅL" date="Q4 2026" />
                  <Badge variant="outline" className="border-gold/40 text-gold text-[10px] uppercase">
                    Fas 3 exklusivt
                  </Badge>
                </div>
              </div>

              <Card className="border-gold/40 bg-gradient-to-br from-gold/[0.06] to-transparent p-5 sm:p-6">
                <Eyebrow>Vad Fas 3 inkluderar</Eyebrow>
                <div className="mt-4 space-y-3">
                  <LicenseRow
                    icon={<Brain className="h-4 w-4" />}
                    title="Metodik-licens"
                    desc="Tanke-ramverket bakom AK1TS — hur man tänker vågor"
                  />
                  <LicenseRow
                    icon={<Cpu className="h-4 w-4" />}
                    title="AI-analyser"
                    desc="Obegränsade AI-genererade analyser (3 längder)"
                  />
                  <LicenseRow
                    icon={<ShieldCheck className="h-4 w-4" />}
                    title="MÄTT-validering"
                    desc="Varje analys kvalitetsgranskad innan leverans"
                  />
                  <LicenseRow
                    icon={<TrendingUp className="h-4 w-4" />}
                    title="Klientportfölj-analys"
                    desc="Hela din portfölj analyserad enligt AK1A-ekosystemet"
                  />
                  <LicenseRow
                    icon={<BookOpen className="h-4 w-4" />}
                    title="Alla 225 kurser"
                    desc="Full tillgång till kunskapsmarknaden"
                  />
                </div>
                <div className="mt-5 border-t border-border pt-4">
                  <Button
                    className="w-full bg-gold text-background hover:bg-gold/90"
                    onClick={() => setSection("utbildning")}
                  >
                    Bli Fas 3-medlem <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* ───────────── ÄRLIGHET OM AI ───────────── */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
            <InstitutionalFrame>
              <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-8">
                <div>
                  <Eyebrow>Ärlighet om AI</Eyebrow>
                  <h2 className="mt-3 font-serif text-xl font-bold leading-tight sm:text-2xl">
                    AI är ett verktyg. Inte en sanning.
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    AI-systemet analyserar vågor snabbare än människor kan. Men AI kan fel —
                    särskilt i mönster-igenkänning som Elliott Wave. Därför:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-bull" />
                      <span>Varje AI-analys MÄTT-valideras av mänsklig granskare</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-bull" />
                      <span>Du lär dig metoden så du kan utmana AI:n</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <span>AI är approximativt reproducerbar — metoden är know-how</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <span>METODMÅL: full reproducerbarhet inom 36 månader</span>
                    </li>
                  </ul>
                </div>
                <div className="border-l border-border pl-6">
                  <Eyebrow>Progression</Eyebrow>
                  <div className="mt-3 space-y-3">
                    <ProgressionStep n="1" title="Fas 1 — Gratis" desc="Läs analyser, lär grunderna" done />
                    <ProgressionStep n="2" title="Fas 2 — Premium" desc="Alla kurser + Labbet" done />
                    <ProgressionStep n="3" title="Fas 3 — Pro" desc="AI-analyser + metodik-licens" current />
                    <ProgressionStep n="4" title="METODMÅL" desc="Open methodology (36 mån)" />
                  </div>
                </div>
              </div>
            </InstitutionalFrame>
          </div>
        </section>

        {/* ───────────── GÅ VIDARE ───────────── */}
        <section className="bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-14">
            <Eyebrow>Fortsätt utforska</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-4xl">Gå vidare</h2>
            <GoldRule className="mt-6 max-w-md" />

            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <GoCard icon={<BookOpen className="h-5 w-5" />} title="Alla kurser" sub="225 djupa moduler" onClick={() => setSection("kurser")} />
              <GoCard icon={<Microscope className="h-5 w-5" />} title="Analyser" sub="99-sidiga rapporter" onClick={() => setSection("analyser")} />
              <GoCard icon={<Zap className="h-5 w-5" />} title="Labbet" sub="Verifiera själv" onClick={() => setSection("labb")} />
              <GoCard icon={<ShieldCheck className="h-5 w-5" />} title="Strategi" sub="Vår väg till #1" onClick={() => setSection("strategi")} />
            </div>
          </div>
        </section>
      </div>
    </DnaBackground>
  );
}

function LicenseRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.06] text-gold">
        {icon}
      </span>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

function ProgressionStep({
  n,
  title,
  desc,
  done,
  current,
}: {
  n: string;
  title: string;
  desc: string;
  done?: boolean;
  current?: boolean;
}) {
  return (
    <div className={cn("flex items-start gap-3", current && "ring-1 ring-gold/30 rounded-md p-2 -m-2")}>
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          done && "bg-bull text-white",
          current && "bg-gold text-background",
          !done && !current && "border border-border text-muted-foreground"
        )}
      >
        {done ? "✓" : n}
      </span>
      <div>
        <div className={cn("text-sm font-semibold", current && "text-gold")}>{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
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
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Gå vidare →</div>
        <h3 className="mt-1 font-serif text-xl font-bold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
      </div>
    </button>
  );
}
