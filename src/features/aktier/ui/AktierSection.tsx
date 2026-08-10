"use client";

import * as React from "react";
import {
  ArrowRight,
  BookOpen,
  Building2,
  ChevronRight,
  FlaskConical,
  TrendingDown,
  TrendingUp,
  Library,
  ExternalLink,
} from "lucide-react";
import { useAk1aStore } from "@/lib/ak1a-store";
import { Eyebrow, GoldRule, HonestyTag } from "../primitives";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────────
 * STOCK REGISTER
 * All values captured from the deployed AKTIER page (aktier.txt) — 2026-07-20.
 * ──────────────────────────────────────────────────────────────────────── */

type Filter = "alla" | "publicerade" | "kommande";

interface Stock {
  ticker: string;
  name: string;
  akm1: number;
  price: string; // Swedish-formatted, e.g. "252,50" or "1,676"
  changePct: string; // e.g. "+0,4" or "−1,4" (note: Swedish minus "−")
  changePositive: boolean;
  pe: string; // "24,8" or "—"
  ps: string; // "5,6×"
  yield: string; // "1,8 %"
  sector: string;
  market: string;
  description: string;
  published: boolean; // true = MÄTT (publicerad), false = METODMÅL
}

const STOCKS: Stock[] = [
  {
    ticker: "PRECIS",
    name: "Precise Biometrics AB",
    akm1: 42.9,
    price: "1,676",
    changePct: "−1,4",
    changePositive: false,
    pe: "—",
    ps: "2,3×",
    yield: "0 %",
    sector: "INFORMATIONSTEKNIK / PROGRAMVARA",
    market: "NASDAQ STOCKHOLM SMALL CAP",
    description:
      "Fusion med FPC skapar enda bolaget med både hårdvara + mjukvara i alla 4 arenor.",
    published: true,
  },
  {
    ticker: "ATCO-A",
    name: "Atlas Copco AB",
    akm1: 86.0,
    price: "252,50",
    changePct: "+0,4",
    changePositive: true,
    pe: "24,8",
    ps: "5,6×",
    yield: "1,8 %",
    sector: "INDUSTRI / KAPITALVAROR",
    market: "NASDAQ STOCKHOLM LARGE CAP",
    description:
      "Sveriges mest stabila industriella compounder — hög ROIC, låg belåning, global fotavtryck.",
    published: true,
  },
  {
    ticker: "AZN",
    name: "AstraZeneca plc",
    akm1: 78.0,
    price: "165,20",
    changePct: "−0,6",
    changePositive: false,
    pe: "18,4",
    ps: "4,1×",
    yield: "2,6 %",
    sector: "HÄLSOVÅRD / LÄKEMEDEL",
    market: "NASDAQ STOCKHOLM LARGE CAP",
    description:
      "Onkologi-pipeline med Enhertu i spetsen — brutit 10-års patentklipp-cykel.",
    published: true,
  },
  {
    ticker: "VOLV-B",
    name: "Volvo AB",
    akm1: 82.0,
    price: "241,80",
    changePct: "+0,9",
    changePositive: true,
    pe: "13,6",
    ps: "1,1×",
    yield: "3,2 %",
    sector: "INDUSTRI / KAPITALVAROR",
    market: "NASDAQ STOCKHOLM LARGE CAP",
    description:
      "Elförskjutning i tunga fordon — Volvo Trucks & Construction Equipment i ledande position.",
    published: true,
  },
  {
    ticker: "HM-B",
    name: "Hennes & Mauritz AB",
    akm1: 72.0,
    price: "178,40",
    changePct: "+1,2",
    changePositive: true,
    pe: "16,8",
    ps: "1×",
    yield: "4,1 %",
    sector: "KONSUMENT / DETALJHANDEL",
    market: "NASDAQ STOCKHOLM LARGE CAP",
    description:
      "Efter flera svaga år — marginalerna börjar återhämta sig; net cash + 4 % utdelning.",
    published: true,
  },
  {
    ticker: "SINCH",
    name: "Sinch AB",
    akm1: 12.0,
    price: "78,60",
    changePct: "−2,1",
    changePositive: false,
    pe: "—",
    ps: "1,2×",
    yield: "0 %",
    sector: "KOMMUNIKATION / SAAS",
    market: "NASDAQ STOCKHOLM MID CAP",
    description:
      "Tidigare tech-darling — sjunkit 88 % från toppen; turnaround-case med skuldsatt balansräkning.",
    published: true,
  },
  {
    ticker: "SWED-A",
    name: "Swedbank AB",
    akm1: 75.0,
    price: "230,40",
    changePct: "+0,6",
    changePositive: true,
    pe: "9,2",
    ps: "3,1×",
    yield: "6 %",
    sector: "FINANS / BANK",
    market: "NASDAQ STOCKHOLM LARGE CAP",
    description:
      "En av Norden mest lönsamma banker — ROE 15 %, direktavkastning 6 %, P/E 9x; cyklisk exponering mot bostad + Baltikum.",
    published: true,
  },
  {
    ticker: "ERIC-B",
    name: "Telefonaktiebolaget LM Ericsson",
    akm1: 68.0,
    price: "85,20",
    changePct: "−0,4",
    changePositive: false,
    pe: "14,1",
    ps: "1,2×",
    yield: "3,8 %",
    sector: "INFORMATIONSTEKNIK / TELEKOM-INFRASTRUKTUR",
    market: "NASDAQ STOCKHOLM LARGE CAP",
    description:
      "Världens näst största 5G-infrastruktur-leverantör — stabil men osäker tillväxt; konkurrens från Huawei, Nokia.",
    published: true,
  },
];

/* ─── AKM1 score banding ─── */
function akm1Band(score: number): {
  label: string;
  cls: string;
  textCls: string;
} {
  if (score >= 75)
    return {
      label: "STARK",
      cls: "border-bull/40 bg-bull/10 text-bull",
      textCls: "text-bull",
    };
  if (score >= 50)
    return {
      label: "MEDEL",
      cls: "border-gold/40 bg-gold/10 text-gold",
      textCls: "text-gold",
    };
  return {
    label: "SVAG",
    cls: "border-bear/40 bg-bear/10 text-bear",
    textCls: "text-bear",
  };
}

/* ════════════════════════════════════════════════════════════════════════
 *  AKTIER SECTION
 * ════════════════════════════════════════════════════════════════════════ */

export function AktierSection() {
  const { setSection } = useAk1aStore();
  const { toast } = useToast();
  const [filter, setFilter] = React.useState<Filter>("alla");

  const filteredStocks = React.useMemo(() => {
    if (filter === "publicerade") return STOCKS.filter((s) => s.published);
    if (filter === "kommande") return STOCKS.filter((s) => !s.published);
    return STOCKS;
  }, [filter]);

  const openAnalysis = (stock: Stock) => {
    if (stock.ticker === "PRECIS") {
      setSection("prec");
      return;
    }
    // METODMÅL note — fullständig analys kommer
    toast({
      title: `${stock.ticker} · METODMÅL`,
      description:
        "Fullständig analys kommer. AKM1-poängen är MÄTT — den levande 99-sidiga analysen växer fram i takt med att organ-cykeln mognar.",
    });
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
            <Eyebrow>◆ AKTIER ◆</Eyebrow>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Alla aktier i AK1A-ekosystemet.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Sex svenska bolag. En gemensam metodik. Här ser du snabbt
              aktuellt pris, AKM1-poäng och varje bolags marknadsposition —
              oavsett om analysen är publicerad (MÄTT) eller kommande
              (METODMÅL).
            </p>
            <GoldRule className="mt-8 max-w-xs" />
          </div>
        </div>
      </section>

      {/* ───────────── STATS ROW ───────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="grid gap-6 sm:grid-cols-3">
            <StatTile kind="matt" value="8" label="BOLAG I REGISTRET" />
            <StatTile kind="matt" value="8" label="PUBLICERADE ANALYSER" />
            <StatTile kind="metodmal" value="0" label="KOMMANDE ANALYSER" />
          </div>

          {/* Börsvärde banner */}
          <div className="mt-8 flex flex-col items-start justify-between gap-3 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Samlat börsvärde:
              </span>
              <span className="font-serif text-2xl font-bold tracking-tight">
                4&nbsp;284,7 Mdr SEK
              </span>
            </div>
            <div className="flex items-center gap-2">
              <HonestyTag kind="matt" />
              <span className="text-xs font-mono text-muted-foreground">
                2026-07-20
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── REGISTRET (filter + grid) ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <Eyebrow>Registret</Eyebrow>
              <h2 className="mt-3 font-serif text-3xl font-bold text-balance">
                Åtta bolag. Samma AKM1-bedömning.
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Varje kort visar MÄTT-data: pris, dagens rörelse, P/E, P/S,
                direktavkastning — och den aggregerade AKM1-poängen / 100.
              </p>
            </div>

            <Tabs
              value={filter}
              onValueChange={(v) => setFilter(v as Filter)}
              className="w-full sm:w-auto"
            >
              <TabsList className="h-auto w-full sm:w-auto">
                <TabsTrigger value="alla" className="flex-1 sm:flex-initial">
                  ALLA (8)
                </TabsTrigger>
                <TabsTrigger
                  value="publicerade"
                  className="flex-1 sm:flex-initial"
                >
                  PUBLICERADE (8)
                </TabsTrigger>
                <TabsTrigger
                  value="kommande"
                  className="flex-1 sm:flex-initial"
                >
                  KOMMANDE (0)
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Stock grid */}
          {filteredStocks.length === 0 ? (
            <div className="mt-10 rounded-lg border border-dashed border-border bg-card p-12 text-center">
              <Building2 className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <p className="mt-3 font-serif text-lg font-semibold">
                Inga kommande analyser i kö just nu.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Alla bolag i registret har publicerade AKM1-bedömningar
                (MÄTT). Nya METODMÅL-bolag tillkommer i takt med att
                organ-cykeln mognar.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredStocks.map((stock) => (
                <StockCard
                  key={stock.ticker}
                  stock={stock}
                  onOpen={() => openAnalysis(stock)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ───────────── REPRODUCERBARHET ───────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <Eyebrow>Reproducerbarhet</Eyebrow>
              <h2 className="mt-3 font-serif text-3xl font-bold text-balance sm:text-4xl">
                Samma metodik. Sex bolag.
              </h2>
              <GoldRule className="mt-5 max-w-xs" />
              <p className="mt-5 max-w-xl text-base text-muted-foreground leading-relaxed">
                Varje aktie i detta register utvärderas med samma AKM1-ramverk
                — 19 fundamentala variabler, 25 våg-celler, 8 organ. PRECIS
                är publicerad som 99-sidors djupanalys. De övriga fem är
                METODMÅL: metodiken existerar, den levande analysen växer fram
                i takt med att organ-cykeln mognar.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  onClick={() => setSection("prec")}
                  className="bg-gold text-background hover:bg-gold/90"
                >
                  Läs publicerad analys <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => setSection("labb")}>
                  <FlaskConical className="mr-2 h-4 w-4 text-gold" /> Öppna
                  AKM1-verktyget
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <ReproPoint
                label="Alla källor offentliga"
                body="Varje kvantitativt påstående är hyperlänkat till årsredovisning, prospekt eller offentlig kursdata."
                kind="matt"
              />
              <ReproPoint
                label="AKM1-calculatorn öppen"
                body="Variablerna, vikterna och aggregeringsreglerna exponeras i Labbet — du ser hur poängen byggs."
                kind="matt"
              />
              <ReproPoint
                label="Steg-för-steg-metod"
                body="19 fundamentala variabler i sekvens — samma flöde för varje bolag, utan undantag."
                kind="matt"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── GÅ VIDARE ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <Eyebrow>◆ Fortsätt utforska</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold">Gå vidare</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <CtaCard
              icon={<BookOpen className="h-5 w-5" />}
              title="Läs PREC-analysen"
              sub="99 sidor institutionell djupanalys"
              onClick={() => setSection("prec")}
            />
            <CtaCard
              icon={<Library className="h-5 w-5" />}
              title="Alla analyser"
              sub="Fullt arkiv över publicerade bolagsanalyser"
              onClick={() => setSection("analyser")}
            />
            <CtaCard
              icon={<FlaskConical className="h-5 w-5" />}
              title="Reproduce i Labbet"
              sub="Bygg din egen AKM1-bedömning"
              onClick={() => setSection("labb")}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 *  SUB-COMPONENTS
 * ════════════════════════════════════════════════════════════════════════ */

function StatTile({
  kind,
  value,
  label,
}: {
  kind: "matt" | "metodmal";
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 text-center sm:text-left">
      <div className="flex items-center justify-center sm:justify-start">
        <HonestyTag kind={kind} />
      </div>
      <p className="mt-3 font-serif text-5xl font-bold leading-none tracking-tight">
        {value}
      </p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function StockCard({
  stock,
  onOpen,
}: {
  stock: Stock;
  onOpen: () => void;
}) {
  const band = akm1Band(stock.akm1);
  const isPrecis = stock.ticker === "PRECIS";

  return (
    <Card className="group relative gap-0 overflow-hidden border-border bg-card p-0 transition-all hover:border-gold/40 hover:shadow-md">
      {/* Top accent strip — AKM1 band color */}
      <div
        className={cn(
          "h-1 w-full",
          stock.akm1 >= 75
            ? "bg-bull/60"
            : stock.akm1 >= 50
            ? "bg-gold/60"
            : "bg-bear/60"
        )}
      />

      <div className="flex flex-col gap-4 p-5">
        {/* Header — ticker + honesty tag */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold tracking-tight">
                {stock.ticker}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {stock.name}
            </p>
          </div>
          <HonestyTag kind={stock.published ? "matt" : "metodmal"} />
        </div>

        {/* AKM1 score block */}
        <div
          className={cn(
            "rounded-md border p-3",
            band.cls
          )}
        >
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
              AKM1
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
              {band.label}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-serif text-3xl font-bold leading-none">
              {stock.akm1.toFixed(1)}
            </span>
            <span className="text-xs font-medium opacity-70">/ 100</span>
          </div>
        </div>

        {/* Price + change */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-2xl font-bold tracking-tight">
                {stock.price}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                SEK
              </span>
            </div>
          </div>
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-semibold",
              stock.changePositive ? "text-bull" : "text-bear"
            )}
          >
            {stock.changePositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>
              {stock.changePct} %
            </span>
          </div>
        </div>
        <div className="-mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          idag
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
          <Metric label="P/E" value={stock.pe} />
          <Metric label="P/S" value={stock.ps} />
          <Metric label="DIR. AVK." value={stock.yield} />
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-foreground/80">
          {stock.description}
        </p>

        {/* Sector + market tags */}
        <div className="flex flex-col gap-1.5">
          <Badge
            variant="outline"
            className="w-full justify-center border-border bg-muted/40 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {stock.sector}
          </Badge>
          <Badge
            variant="outline"
            className="w-full justify-center border-border bg-muted/40 text-[10px] font-mono uppercase tracking-wider text-muted-foreground"
          >
            {stock.market}
          </Badge>
        </div>

        {/* Open analysis button */}
        <Button
          onClick={onOpen}
          className={cn(
            "w-full",
            isPrecis
              ? "bg-gold text-background hover:bg-gold/90"
              : "bg-foreground text-background hover:bg-foreground/90"
          )}
          size="sm"
        >
          {isPrecis ? "Öppna analys" : "Öppna analys"}
          {isPrecis ? (
            <ArrowRight className="ml-1 h-4 w-4" />
          ) : (
            <ExternalLink className="ml-1 h-3.5 w-3.5 opacity-70" />
          )}
        </Button>
        {!isPrecis && (
          <p className="-mt-2 text-center text-[10px] uppercase tracking-wider text-gold">
            METODMÅL · Fullständig analys kommer
          </p>
        )}
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-serif text-sm font-bold">{value}</p>
    </div>
  );
}

function ReproPoint({
  label,
  body,
  kind,
}: {
  label: string;
  body: string;
  kind: "matt" | "metodmal";
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
      <div className="mt-0.5">
        <HonestyTag kind={kind} />
      </div>
      <div className="min-w-0">
        <p className="font-serif text-sm font-bold leading-tight">{label}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
    </div>
  );
}

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
      onClick={onClick}
      className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-5 text-left transition-all hover:border-gold/50 hover:shadow-md"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-gold">{icon}</span>
        <span className="min-w-0">
          <span className="block font-serif text-base font-bold leading-tight">
            {title}
          </span>
          <span className="block text-xs text-muted-foreground">{sub}</span>
        </span>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-gold transition-transform group-hover:translate-x-1" />
    </button>
  );
}
