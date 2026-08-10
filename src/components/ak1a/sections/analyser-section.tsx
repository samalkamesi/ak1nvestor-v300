"use client";

import * as React from "react";
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  Library,
  Layers,
  Microscope,
  CheckCircle2,
  GitBranch,
  Sparkles,
  Hourglass,
  ChevronRight,
} from "lucide-react";
import { useAk1aStore } from "@/lib/ak1a-store";
import {
  Eyebrow,
  GoldRule,
  HonestyTag,
  SignalPill,
} from "@/components/ak1a/primitives";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { StockAnalysisView } from "@/components/ak1a/stock-analysis-view";

/* ──────────────────────────────────────────────────────────────────────
   DATA — exact figures from analyser.txt (the deployed page capture)
   ────────────────────────────────────────────────────────────────────── */

type Akm1Tier = "SVAG" | "MEDEL" | "STARK";
type Ak1tsSignal = "BEARISH" | "NEUTRAL" | "BULLISH";
type Confidence = "MÄTT" | "METODMÅL";

interface ArchiveRow {
  date: string;
  company: string;
  ticker: string;
  akm1Score: string; // "42.9/95"
  akm1Tier: Akm1Tier;
  ak1ts: Ak1tsSignal;
  confidence: Confidence;
  available: boolean; // only PRECIS is fully published today
  year: number;
}

const ARCHIVE: ArchiveRow[] = [
  {
    date: "2026-08-08",
    company: "Precise Biometrics",
    ticker: "PREC.ST",
    akm1Score: "38/100",
    akm1Tier: "SVAG",
    ak1ts: "BEARISH",
    confidence: "MÄTT",
    available: true,
    year: 2026,
  },
  {
    date: "2026-08-08",
    company: "Volvo Cars",
    ticker: "VOLCAR-B",
    akm1Score: "62/100",
    akm1Tier: "MEDEL",
    ak1ts: "NEUTRAL",
    confidence: "MÄTT",
    available: true,
    year: 2026,
  },
  {
    date: "2026-08-15",
    company: "Atlas Copco",
    ticker: "ATCO-A",
    akm1Score: "86/100",
    akm1Tier: "STARK",
    ak1ts: "BULLISH",
    confidence: "METODMÅL",
    available: false,
    year: 2026,
  },
  {
    date: "2026-09-12",
    company: "AstraZeneca",
    ticker: "AZN",
    akm1Score: "78/100",
    akm1Tier: "STARK",
    ak1ts: "BULLISH",
    confidence: "METODMÅL",
    available: false,
    year: 2026,
  },
  {
    date: "2026-10-10",
    company: "Volvo AB",
    ticker: "VOLV-B",
    akm1Score: "82/100",
    akm1Tier: "STARK",
    ak1ts: "BULLISH",
    confidence: "METODMÅL",
    available: false,
    year: 2026,
  },
  {
    date: "2026-11-14",
    company: "Hennes & Mauritz",
    ticker: "HM-B",
    akm1Score: "72/100",
    akm1Tier: "MEDEL",
    ak1ts: "NEUTRAL",
    confidence: "METODMÅL",
    available: false,
    year: 2026,
  },
  {
    date: "2026-12-08",
    company: "Sinch AB",
    ticker: "SINCH",
    akm1Score: "12/100",
    akm1Tier: "SVAG",
    ak1ts: "BEARISH",
    confidence: "METODMÅL",
    available: false,
    year: 2026,
  },
  {
    date: "2026-12-15",
    company: "Swedbank AB",
    ticker: "SWED-A",
    akm1Score: "75/100",
    akm1Tier: "STARK",
    ak1ts: "BULLISH",
    confidence: "METODMÅL",
    available: false,
    year: 2026,
  },
  {
    date: "2026-12-20",
    company: "Telefonaktiebolaget LM Ericsson",
    ticker: "ERIC-B",
    akm1Score: "68/100",
    akm1Tier: "MEDEL",
    ak1ts: "NEUTRAL",
    confidence: "METODMÅL",
    available: false,
    year: 2026,
  },
];

interface Phase {
  num: string;
  name: string;
  body: string;
  tag: string;
}

const PHASES: Phase[] = [
  {
    num: "01",
    name: "SAMLAS",
    body: "Data samlas från årsredovisning, kvartalsrapporter, marknadsdata. Alla källor verifierade.",
    tag: "KÄLLOR VERIFIERADE",
  },
  {
    num: "02",
    name: "TÄNKER",
    body: "AKM1 20 variabler + AK1TS 5×5 matris + RR/BR/CF 18 indikatorer bearbetas.",
    tag: "19 + 25 + 18 CELLER",
  },
  {
    num: "03",
    name: "BESLUTAR",
    body: "Konfluens-beräkning syntetiserar till en slutsats med konfidensgrad.",
    tag: "KONFIDENS = METODMÅL",
  },
  {
    num: "04",
    name: "SKAPAR",
    body: "99-sidig rapport byggs med fullständiga källhänvisningar och reproducerbarhetskvitto.",
    tag: "99 SIDOR + KÄLLOR",
  },
  {
    num: "05",
    name: "FÖRVERKLIGAR",
    body: "Kvalitets-organet granskar. Publiceras. Användaren kan reproducera i Labbet.",
    tag: "REPRODUCERBARHET = METODMÅL",
  },
];

interface UpcomingItem {
  company: string;
  ticker: string;
  plan: string;
}

const UPCOMING: UpcomingItem[] = [
  {
    company: "Svenska Cellulosa (SCA)",
    ticker: "SCA-B",
    plan: "Planerad Q1 2027",
  },
  {
    company: "Electrolux Professional",
    ticker: "EPRO-B",
    plan: "Planerad Q1 2027",
  },
  {
    company: "Assa Abloy",
    ticker: "ASS-B",
    plan: "Planerad Q2 2027",
  },
];

/* ──────────────────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────────────────── */

const tierStyles: Record<Akm1Tier, string> = {
  SVAG: "text-bear border-bear/30 bg-bear/5",
  MEDEL: "text-neutral-signal border-neutral-signal/30 bg-neutral-signal/5",
  STARK: "text-bull border-bull/30 bg-bull/5",
};

const signalMap: Record<
  Ak1tsSignal,
  "bear" | "neutral" | "bull"
> = {
  BEARISH: "bear",
  NEUTRAL: "neutral",
  BULLISH: "bull",
};

/* ──────────────────────────────────────────────────────────────────────
   MAIN
   ────────────────────────────────────────────────────────────────────── */

export function AnalyserSection() {
  const { setSection } = useAk1aStore();
  const { toast } = useToast();
  const metodikRef = React.useRef<HTMLElement | null>(null);
  const [activeTicker, setActiveTicker] = React.useState<string | null>(null);

  const scrollToMetodik = () => {
    metodikRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleArchiveClick = (row: ArchiveRow) => {
    if (row.available) {
      setActiveTicker(row.ticker);
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    toast({
      title: "Kommer",
      description: `${row.company} (${row.ticker}) — rapporten publiceras när metoden är redo. METODMÅL.`,
    });
  };

  // When an analysis is selected, render the unified StockAnalysisView
  if (activeTicker) {
    return (
      <StockAnalysisView
        ticker={activeTicker}
        onBack={() => {
          setActiveTicker(null);
          window.scrollTo({ top: 0, behavior: "auto" });
        }}
      />
    );
  }

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
            <Eyebrow>ANALYSER</Eyebrow>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Analyser du kan{" "}
              <span className="text-gold">verifiera själv.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              En analys per månad. 99 sidor. Varje siffra spårbar till offentlig källa.
              Du behöver inte lita på oss — du kan återskapa det.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => {
                  setActiveTicker("PREC.ST");
                  window.scrollTo({ top: 0, behavior: "auto" });
                }}
                className="bg-gold text-background hover:bg-gold/90"
              >
                Läs senaste analysen{" "}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToMetodik}
              >
                <FileText className="mr-1 h-4 w-4" /> Om metodiken
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── ARKIVET I SIFFROR ───────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <Eyebrow>Arkivet i siffror</Eyebrow>
          <div className="mt-5 grid gap-6 sm:grid-cols-3">
            <StatTile
              tag="matt"
              value="8"
              label="Publicerade analyser"
              caption="Månadsvis takt. Inga dubbla — djup före bredd."
            />
            <StatTile
              tag="matt"
              value="99"
              label="Sidor per analys"
              caption="Institutionsdjup. Varje siffra spårbar till källa."
            />
            <StatTile
              tag="metodmal"
              value="40h"
              label="Tid per analys"
              caption="metodmål 40h — från datainsamling till publicering."
            />
          </div>
        </div>
      </section>

      {/* ───────────── AKTUELLT — Featured ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Aktuellt — Denna månadens djupanalys</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
            En analys i fokus.
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Power law — den värd-99-sidor-analysen får scenen, de andra står
            i arkivet.
          </p>

          <Card className="mt-8 overflow-hidden border-gold/30 bg-gradient-to-br from-card to-gold/[0.03]">
            <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
              {/* Left — meta + body */}
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-gold/15 text-gold border border-gold/40 uppercase tracking-wider text-[10px] font-semibold">
                    DJUPANALYS · 99 SIDOR
                  </Badge>
                  <HonestyTag kind="matt" />
                </div>

                <h3 className="mt-4 font-serif text-2xl font-bold sm:text-3xl">
                  Precise Biometrics (PREC.ST)
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> 2026-08-08
                  </span>
                  <span aria-hidden>·</span>
                  <span>Publicerad av AK1A Research Lab</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-bear/30 text-bear bg-bear/5"
                  >
                    AKM1 · 38/100 · SVAG-MEDL
                  </Badge>
                  <SignalPill signal="bear" label="BEARISH BIAS" />
                </div>

                <p className="mt-5 text-sm leading-relaxed text-foreground/90 sm:text-base">
                  Precise Biometrics vid 0,86 SEK (2026-08-07). Fusion FPC + emission 110 MSEK.
                  Vägt prismål 1,38 SEK (+69% mot teckningskurs). FÖRSIKTIGT KÖP (spekulativt).
                  Special Situation: binär utgång — antingen vändning med 45 MSEK synergier eller
                  utspädning och integrationssvårigheter.
                </p>

                {/* Stat grid */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <FeaturedStat label="TICKER" value="PREC.ST" />
                  <FeaturedStat
                    label="PRIS"
                    value="0,86 SEK"
                    tag="matt"
                  />
                  <FeaturedStat
                    label="AKM1"
                    value="38/100"
                    tag="matt"
                  />
                  <FeaturedStat
                    label="REK"
                    value="FÖRSIKTIGT KÖP"
                    tag="metodmal"
                  />
                </div>

                <p className="mt-5 text-xs text-muted-foreground">
                  Fullständig rapport: 99 sidor · 20 AKM1-variabler · 25
                  AK1TS-celler · 18 RR/BR/CF-indikatorer.
                </p>

                <Button
                  className="mt-6 bg-gold text-background hover:bg-gold/90"
                  onClick={() => {
                    setActiveTicker("PREC.ST");
                    window.scrollTo({ top: 0, behavior: "auto" });
                  }}
                >
                  Läs hela analysen — alla sektioner{" "}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              {/* Right — decorative / institutional motif */}
              <div className="relative hidden items-center justify-center border-l border-border bg-muted/40 p-8 lg:flex">
                <div className="absolute inset-0 opacity-[0.05]">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                </div>
                <div className="relative w-full max-w-xs space-y-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="font-serif text-sm font-semibold">
                        99 sidor
                      </div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Institutionsdjup
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-bull/40 bg-bull/10 text-bull">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="font-serif text-sm font-semibold">
                        Reproducerbar
                      </div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Alla källor offentliga
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
                      <Clock className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="font-serif text-sm font-semibold">
                        40h metodmål
                      </div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Från data till publicering
                      </div>
                    </div>
                  </div>
                  <div className="pt-3">
                    <GoldRule />
                    <p className="mt-3 text-[11px] italic leading-relaxed text-muted-foreground">
                      &ldquo;En analys per månad. Ingen kompromiss.&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ───────────── ARKIV — Table ───────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Arkiv — Tidigare publicerade analyser</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
            Listad i kronologisk ordning.
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Varje analys är en 99-sidig institutionell rapport.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <HonestyTag kind="matt" />
            <span className="text-sm text-muted-foreground">
              8 av 8 publicerad
            </span>
          </div>

          <Tabs defaultValue="all" className="mt-6">
            <TabsList>
              <TabsTrigger value="all">ALLA</TabsTrigger>
              <TabsTrigger value="2026">2026</TabsTrigger>
              <TabsTrigger value="2025">2025</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <ArchiveTable
                rows={ARCHIVE}
                onRowClick={handleArchiveClick}
              />
            </TabsContent>
            <TabsContent value="2026" className="mt-4">
              <ArchiveTable
                rows={ARCHIVE.filter((r) => r.year === 2026)}
                onRowClick={handleArchiveClick}
              />
            </TabsContent>
            <TabsContent value="2025" className="mt-4">
              <EmptyYearState year={2025} />
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-xs text-muted-foreground">
            Fler analyser publiceras månadsvis. Prenumerera på min sida för
            notiser. Inga push-notiser om priser — anti-casino.
          </p>
        </div>
      </section>

      {/* ───────────── METODIKEN ───────────── */}
      <section
        ref={metodikRef}
        id="metodik"
        className="scroll-mt-24 border-b border-border"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Metodiken bakom varje analys</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
            Så här byggs en 99-sidig analys.
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Inga gissningar. Strukturerad metodik. Reproducerbar.
          </p>
          <GoldRule className="mt-6 max-w-md" />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PHASES.map((p, i) => (
              <PhaseCard key={p.num} phase={p} isLast={i === PHASES.length - 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── REPRODUCERBARHET ───────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Reproducerbarhet</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
            Varje analys kan reproduceras.
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Detta är unikt för AK1A. Ingen annan svensk aktieanalys-sajt
            erbjuder detta.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <ReproCard
              icon={<Library className="h-5 w-5" />}
              title="Alla källor offentliga"
              body="Årsredovisningar, kvartalsrapporter, marknadsdata. Inga hemliga källor. Varje siffra i varje analys går att spåra till en offentlig publikation."
              footer="MÄTT — GÄLLER ALLA ANALYSER"
              tagKind="matt"
            />
            <ReproCard
              icon={<Microscope className="h-5 w-5" />}
              title="AKM1-calculatorn öppen"
              body="Du kan poängsatta samma bolag med samma verktyg. 20 variabler, samma vikter, samma skala. Inga dolda formler."
              footer="MÄTT — GÄLLER ALLA ANALYSER"
              tagKind="matt"
            />
            <ReproCard
              icon={<GitBranch className="h-5 w-5" />}
              title="Steg-för-steg-metod"
              body="Varje analys slutar med ”Reproduce this yourself” — en checklista. Du får exakt den sekvens som byggt rapporten."
              footer="MÄTT — GÄLLER ALLA ANALYSER"
              tagKind="matt"
            />
          </div>

          <div className="mt-8">
            <Button
              size="lg"
              onClick={() => setSection("labb")}
              className="bg-gold text-background hover:bg-gold/90"
            >
              Öppna Labbet och testa{" "}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ───────────── KOMMANDE ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Kommande — Vad som kommer härnäst</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
            METODMÅL — inte löften.
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Vi publicerar när metoden är klar, inte när marknaden skriker.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {UPCOMING.map((u) => (
              <Card key={u.ticker} className="border-border p-6">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-gold/40 text-gold uppercase tracking-wider text-[10px] font-semibold"
                  >
                    KÖ
                  </Badge>
                  <HonestyTag kind="metodmal" />
                </div>
                <h3 className="mt-4 font-serif text-xl font-bold">
                  {u.company}
                </h3>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-mono text-muted-foreground">
                    {u.ticker}
                  </span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Hourglass className="h-3.5 w-3.5" /> {u.plan}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            <span className="text-gold">◆</span> METODMÅL — dessa är
            planerade, inte garanterade. Vi publicerar när metoden är redo.
            Hastighet är kasino; djup är värde.
          </p>
        </div>
      </section>

      {/* ───────────── GÅ VIDARE ───────────── */}
      <section className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Fortsätt utforska</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
            Gå vidare
          </h2>
          <GoldRule className="mt-6 max-w-md" />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <GoCard
              icon={<FileText className="h-5 w-5" />}
              title="PREC-analysen"
              sub="Alla sektioner"
              onClick={() => {
                setActiveTicker("PREC.ST");
                window.scrollTo({ top: 0, behavior: "auto" });
              }}
            />
            <GoCard
              icon={<Layers className="h-5 w-5" />}
              title="Alla aktier"
              sub="8 bolag"
              onClick={() => setSection("aktier")}
            />
            <GoCard
              icon={<Sparkles className="h-5 w-5" />}
              title="Reproduce i Labbet"
              sub="Gör det själv"
              onClick={() => setSection("labb")}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Sub-components
   ────────────────────────────────────────────────────────────────────── */

function StatTile({
  tag,
  value,
  label,
  caption,
}: {
  tag: "matt" | "metodmal";
  value: string;
  label: string;
  caption: string;
}) {
  return (
    <Card className="border-border p-6">
      <HonestyTag kind={tag} />
      <div className="mt-4 font-serif text-4xl font-bold text-ink dark:text-foreground">
        {value}
      </div>
      <div className="mt-1 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {caption}
      </p>
    </Card>
  );
}

function FeaturedStat({
  label,
  value,
  tag,
}: {
  label: string;
  value: string;
  tag?: "matt" | "metodmal";
}) {
  return (
    <div className="rounded-md border border-border bg-background/60 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-serif text-base font-bold">{value}</div>
      {tag && (
        <div className="mt-1.5">
          <HonestyTag kind={tag} />
        </div>
      )}
    </div>
  );
}

function ArchiveTable({
  rows,
  onRowClick,
}: {
  rows: ArchiveRow[];
  onRowClick: (r: ArchiveRow) => void;
}) {
  return (
    <Card className="overflow-hidden border-border p-0">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="pl-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Datum
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Bolag
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Ticker
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              AKM1
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              AK1TS
            </TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Konfidens
            </TableHead>
            <TableHead className="pr-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Länk
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.ticker} className="group">
              <TableCell className="pl-4 font-mono text-xs text-muted-foreground">
                {r.date}
              </TableCell>
              <TableCell className="font-medium">{r.company}</TableCell>
              <TableCell className="font-mono text-xs">{r.ticker}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs font-semibold">
                    {r.akm1Score}
                  </span>
                  <span
                    className={cn(
                      "inline-flex w-fit items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      tierStyles[r.akm1Tier]
                    )}
                  >
                    {r.akm1Tier}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <SignalPill signal={signalMap[r.ak1ts]} label={r.ak1ts} />
              </TableCell>
              <TableCell>
                <HonestyTag kind={r.confidence === "MÄTT" ? "matt" : "metodmal"} />
              </TableCell>
              <TableCell className="pr-4 text-right">
                <Button
                  size="sm"
                  variant={r.available ? "default" : "outline"}
                  onClick={() => onRowClick(r)}
                  className={cn(
                    "h-7 px-2.5 text-[11px] uppercase tracking-wider",
                    r.available &&
                      "bg-gold text-background hover:bg-gold/90"
                  )}
                >
                  Läs
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function EmptyYearState({ year }: { year: number }) {
  return (
    <Card className="border-dashed border-border p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
        <Clock className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-serif text-lg font-semibold">
        Inga analyser publicerade {year}
      </h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        AK1A Research Lab började publicera månadsvisa djupanalyser under
        2026. Arkivet växer med en analys per månad — ingen kompromiss.
      </p>
    </Card>
  );
}

function PhaseCard({
  phase,
  isLast,
}: {
  phase: Phase;
  isLast: boolean;
}) {
  return (
    <Card className="relative border-border p-5">
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-3xl font-bold text-gold">
          {phase.num}
        </span>
        <span className="font-serif text-sm font-bold uppercase tracking-wider">
          {phase.name}
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {phase.body}
      </p>
      <div className="mt-4 border-t border-border pt-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gold">
          {phase.tag}
        </span>
      </div>
      {!isLast && (
        <ChevronRight
          className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-gold/40 lg:block"
          aria-hidden
        />
      )}
    </Card>
  );
}

function ReproCard({
  icon,
  title,
  body,
  footer,
  tagKind,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  footer: string;
  tagKind: "matt" | "metodmal";
}) {
  return (
    <Card className="flex flex-col border-border p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
          {icon}
        </span>
        <h3 className="font-serif text-lg font-bold leading-tight">
          {title}
        </h3>
      </div>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
      <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
        <HonestyTag kind={tagKind} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {footer}
        </span>
      </div>
    </Card>
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
