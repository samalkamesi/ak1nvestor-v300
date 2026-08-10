"use client";

import * as React from "react";
import {
  Wallet,
  Plus,
  X,
  Save,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calculator,
  Waves,
  Layers,
  Target,
  AlertTriangle,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  PieChart,
  Activity,
  CircleDollarSign,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eyebrow, HonestyTag, GoldRule } from "@/components/ak1a/primitives";
import { cn } from "@/lib/utils";

// ============================================================
// KONSTANTER — AKM1 20 variabler, tekniska fält, vågpositioner
// ============================================================

interface Akm1Var {
  id: string;
  num: number;
  name: string;
  category: Akm1Category;
}

type Akm1Category =
  | "Tillväxt"
  | "Värdering"
  | "Lönsamhet"
  | "Stabilitet"
  | "Moat"
  | "Katalysator"
  | "Risk"
  | "Kapitalstruktur";

const AKM1_VARS: Akm1Var[] = [
  { id: "V01", num: 1, name: "Försäljningstillväxt", category: "Tillväxt" },
  { id: "V02", num: 2, name: "ARR-tillväxt", category: "Tillväxt" },
  { id: "V03", num: 3, name: "Intäktsdiversifiering", category: "Tillväxt" },
  { id: "V04", num: 4, name: "P/S", category: "Värdering" },
  { id: "V05", num: 5, name: "P/B", category: "Värdering" },
  { id: "V06", num: 6, name: "EV/EBITDA", category: "Värdering" },
  { id: "V07", num: 7, name: "Bruttomarginal", category: "Lönsamhet" },
  { id: "V08", num: 8, name: "EBITDA-marginal", category: "Lönsamhet" },
  { id: "V09", num: 9, name: "ROE", category: "Lönsamhet" },
  { id: "V10", num: 10, name: "Skuldsättningsgrad", category: "Stabilitet" },
  { id: "V11", num: 11, name: "Likviditet", category: "Stabilitet" },
  { id: "V12", num: 12, name: "Intäktsstabilitet", category: "Stabilitet" },
  { id: "V13", num: 13, name: "Patent/IP", category: "Moat" },
  { id: "V14", num: 14, name: "Varumärke", category: "Moat" },
  { id: "V15", num: 15, name: "Nätverkseffekter", category: "Moat" },
  { id: "V16", num: 16, name: "Produktlanseringar", category: "Katalysator" },
  { id: "V17", num: 17, name: "Avtal/Partnerskap", category: "Katalysator" },
  { id: "V18", num: 18, name: "Regulatoriska", category: "Katalysator" },
  { id: "V19", num: 19, name: "Kapitalförbränning", category: "Risk" },
  { id: "V20", num: 20, name: "Återköp", category: "Kapitalstruktur" },
];

const AKM1_CATEGORIES: Akm1Category[] = [
  "Tillväxt",
  "Värdering",
  "Lönsamhet",
  "Stabilitet",
  "Moat",
  "Katalysator",
  "Risk",
  "Kapitalstruktur",
];

const WAVE_POSITIONS = [
  "Impuls 1",
  "Impuls 2",
  "Impuls 3",
  "Impuls 4",
  "Impuls 5",
  "Korrektion A",
  "Korrektion B",
  "Korrektion C",
  "Korrektion D",
  "Korrektion E",
] as const;

const WAVE_TIMEFRAMES = ["vecka", "månad", "kvartal", "år"] as const;

const FIB_LEVELS = ["0%", "23.6%", "38.2%", "50%", "61.8%", "78.6%", "100%"] as const;

const SECTORS = [
  "Industri",
  "Teknik",
  "Hälsovård",
  "Finans",
  "Konsument",
  "Material",
  "Energi",
  "Fastighet",
  "Telekom",
  "Utility",
] as const;

const MAX_HOLDINGS = 15;

const SESSION_KEY = "ak1a-session-id";

// Scenario multipliers — justerar varje innehavs projicerade avkastning
const SCENARIOS = {
  bull: {
    label: "Bull",
    multiplier: 0.25, // +25 %
    icon: TrendingUp,
    color: "text-bull",
    border: "border-bull/40",
    bg: "bg-bull/10",
    desc: "Tillväxtscenario — impuls 3 förstärks, moats vidhålls, katalysatorer slår in.",
  },
  base: {
    label: "Base",
    multiplier: 0.05, // +5 %
    icon: Activity,
    color: "text-gold",
    border: "border-gold/40",
    bg: "bg-gold/10",
    desc: "Basfall — trenden vidhålls, ingen större överraskning.",
  },
  bear: {
    label: "Bear",
    multiplier: -0.2, // −20 %
    icon: TrendingDown,
    color: "text-bear",
    border: "border-bear/40",
    bg: "bg-bear/10",
    desc: "Bearsceanario — korrektionsvåg, moat-erosion eller katalysator misslyckas.",
  },
} as const;

type ScenarioKey = keyof typeof SCENARIOS;

// ============================================================
// TYPER
// ============================================================

type TrendKey = "stigande" | "sidled" | "fallande";
type MacdKey = "positiv" | "negativ";
type MaCrossKey = "golden" | "death" | "ingen";
type VolumeKey = "ökande" | "svagande";

interface TechnicalAnalysis {
  trend: TrendKey;
  rsi: number; // 0–100
  macd: MacdKey;
  maCross: MaCrossKey;
  volume: VolumeKey;
  support: number | "";
  resistance: number | "";
  candlestick: string;
}

interface WaveAnalysis {
  position: (typeof WAVE_POSITIONS)[number];
  timeframe: (typeof WAVE_TIMEFRAMES)[number];
  confidence: number; // 0–100
  fibRetracement: (typeof FIB_LEVELS)[number];
}

interface Holding {
  id: string;
  ticker: string;
  company: string;
  sector: string;
  weight: number; // %
  entryPrice: number | "";
  akm1Scores: Record<string, number>; // V01..V20 -> 0–5
  technical: TechnicalAnalysis;
  wave: WaveAnalysis;
}

interface SavedPortfolio {
  id: string;
  name: string;
  description?: string | null;
  cashPosition: number;
  updatedAt: string;
  holdings?: Array<{
    id: string;
    ticker: string;
    company: string;
    sector?: string | null;
    weight: number;
    entryPrice?: number | null;
    akm1Scores?: string | null;
    akm1Total?: number | null;
    technicalAnalysis?: string | null;
    technicalScore?: number | null;
    wavePosition?: string | null;
    waveTimeframe?: string | null;
    waveConfidence?: number | null;
  }>;
}

// ============================================================
// HJÄLPFUNKTIONER
// ============================================================

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

function emptyAkm1Scores(): Record<string, number> {
  const s: Record<string, number> = {};
  for (const v of AKM1_VARS) s[v.id] = 0;
  return s;
}

function defaultTechnical(): TechnicalAnalysis {
  return {
    trend: "sidled",
    rsi: 50,
    macd: "negativ",
    maCross: "ingen",
    volume: "svagande",
    support: "",
    resistance: "",
    candlestick: "",
  };
}

function defaultWave(): WaveAnalysis {
  return {
    position: "Impuls 3",
    timeframe: "månad",
    confidence: 50,
    fibRetracement: "50%",
  };
}

function newHolding(): Holding {
  return {
    id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ticker: "",
    company: "",
    sector: "Industri",
    weight: 5,
    entryPrice: "",
    akm1Scores: emptyAkm1Scores(),
    technical: defaultTechnical(),
    wave: defaultWave(),
  };
}

function calcAkm1Total(scores: Record<string, number>): number {
  let sum = 0;
  for (const v of AKM1_VARS) sum += scores[v.id] ?? 0;
  return sum; // max 100 (20 × 5)
}

function calcAkm1ByCategory(
  scores: Record<string, number>
): Record<Akm1Category, { sum: number; max: number }> {
  const out: Record<Akm1Category, { sum: number; max: number }> =
    {} as Record<Akm1Category, { sum: number; max: number }>;
  for (const c of AKM1_CATEGORIES) out[c] = { sum: 0, max: 0 };
  for (const v of AKM1_VARS) {
    out[v.category].sum += scores[v.id] ?? 0;
    out[v.category].max += 5;
  }
  return out;
}

function calcTechnicalScore(t: TechnicalAnalysis): number {
  // Max 100: trend 25 + rsi 20 + macd 20 + maCross 20 + volume 15
  let score = 0;
  score += t.trend === "stigande" ? 25 : t.trend === "sidled" ? 12 : 0;
  if (t.rsi >= 50 && t.rsi <= 70) score += 20;
  else if (t.rsi > 30 && t.rsi < 50) score += 10;
  else if (t.rsi >= 70) score += 15; // överköpt — fortfarande stark, men risk
  else if (t.rsi <= 30) score += 15; // översålt — potentiell vändning
  score += t.macd === "positiv" ? 20 : 0;
  score += t.maCross === "golden" ? 20 : t.maCross === "death" ? 0 : 10;
  score += t.volume === "ökande" ? 15 : 0;
  return score;
}

function isImpulse(position: string): boolean {
  return position.startsWith("Impuls");
}

function scoreColor(score: number, max = 100): string {
  const pct = (score / max) * 100;
  if (pct >= 75) return "text-bull";
  if (pct >= 50) return "text-gold";
  return "text-bear";
}

function scoreBg(score: number, max = 100): string {
  const pct = (score / max) * 100;
  if (pct >= 75) return "bg-bull";
  if (pct >= 50) return "bg-gold";
  return "bg-bear";
}

function fmtPct(n: number, digits = 1): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

// ============================================================
// SUB-KOMPONENTER
// ============================================================

/** 0–5-poängsväljare med klickbara cirklar för AKM1-variabler. */
function ScoreDots({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4, 5].map((n) => {
        const active = n <= value;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "h-3.5 w-3.5 rounded-full border transition-all",
              active
                ? n >= 4
                  ? "border-bull bg-bull"
                  : n >= 3
                    ? "border-gold bg-gold"
                    : "border-bear bg-bear"
                : "border-border bg-transparent hover:border-gold/50"
            )}
            aria-label={`Poäng ${n}`}
          />
        );
      })}
      <span className="ml-1.5 w-4 text-right text-[11px] tabular-nums text-muted-foreground">
        {value}
      </span>
    </div>
  );
}

/** Fundamentallager — V01–V20 på 0–5-skala. */
function FundamentalLayer({
  scores,
  onChange,
}: {
  scores: Record<string, number>;
  onChange: (id: string, v: number) => void;
}) {
  const total = calcAkm1Total(scores);
  const byCat = calcAkm1ByCategory(scores);

  return (
    <div className="space-y-4">
      {/* Totalpoäng */}
      <div className="rounded-md border border-gold/30 bg-gold/[0.04] p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
            AKM1 totalpoäng
          </span>
          <span
            className={cn(
              "font-serif text-2xl font-bold tabular-nums",
              scoreColor(total)
            )}
          >
            {total}
            <span className="text-sm text-muted-foreground">/100</span>
          </span>
        </div>
      </div>

      {/* Variabellista per kategori */}
      <div className="space-y-3">
        {AKM1_CATEGORIES.map((cat) => (
          <div
            key={cat}
            className="rounded-md border border-border bg-card/60 p-3"
          >
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink dark:text-foreground">
                {cat}
              </span>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {byCat[cat].sum}/{byCat[cat].max}
              </span>
            </div>
            <div className="mt-2 space-y-1.5">
              {AKM1_VARS.filter((v) => v.category === cat).map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between gap-2 py-0.5"
                >
                  <span className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-[10px] font-semibold text-gold">
                      {v.id}
                    </span>
                    <span className="text-muted-foreground">{v.name}</span>
                  </span>
                  <ScoreDots
                    value={scores[v.id] ?? 0}
                    onChange={(n) => onChange(v.id, n)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Teknisk lager — trend, RSI, MACD, MA50/200, volym, support/resistance. */
function TechnicalLayer({
  t,
  onChange,
}: {
  t: TechnicalAnalysis;
  onChange: (patch: Partial<TechnicalAnalysis>) => void;
}) {
  const score = calcTechnicalScore(t);
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-gold/30 bg-gold/[0.04] p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
            Teknisk poäng
          </span>
          <span
            className={cn(
              "font-serif text-2xl font-bold tabular-nums",
              scoreColor(score)
            )}
          >
            {score}
            <span className="text-sm text-muted-foreground">/100</span>
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Trend */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Trend
          </label>
          <Select
            value={t.trend}
            onValueChange={(v) => onChange({ trend: v as TrendKey })}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stigande">Stigande</SelectItem>
              <SelectItem value="sidled">Sidled</SelectItem>
              <SelectItem value="fallande">Fallande</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* RSI */}
        <div>
          <label className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>RSI</span>
            <span className="tabular-nums text-gold">{t.rsi}</span>
          </label>
          <Slider
            value={[t.rsi]}
            min={0}
            max={100}
            step={1}
            onValueChange={([v]) => onChange({ rsi: v })}
            className="mt-3"
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* MACD */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            MACD
          </label>
          <Select
            value={t.macd}
            onValueChange={(v) => onChange({ macd: v as MacdKey })}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="positiv">Positiv</SelectItem>
              <SelectItem value="negativ">Negativ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* MA50 vs MA200 */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            MA50 vs MA200
          </label>
          <Select
            value={t.maCross}
            onValueChange={(v) => onChange({ maCross: v as MaCrossKey })}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="golden">Golden cross</SelectItem>
              <SelectItem value="death">Death cross</SelectItem>
              <SelectItem value="ingen">Ingen signal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Volym */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Volym-trend
          </label>
          <Select
            value={t.volume}
            onValueChange={(v) => onChange({ volume: v as VolumeKey })}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ökande">Ökande</SelectItem>
              <SelectItem value="svagande">Svagande</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Candlestick */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Candlestick-mönster
          </label>
          <Input
            value={t.candlestick}
            onChange={(e) => onChange({ candlestick: e.target.value })}
            placeholder="t.ex. Hammer, Doji, Engulfing"
            className="mt-1"
          />
        </div>

        {/* Support */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Support (kr)
          </label>
          <Input
            type="number"
            value={t.support}
            onChange={(e) =>
              onChange({
                support: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
            placeholder="0.00"
            className="mt-1"
          />
        </div>

        {/* Resistance */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Resistance (kr)
          </label>
          <Input
            type="number"
            value={t.resistance}
            onChange={(e) =>
              onChange({
                resistance: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
            placeholder="0.00"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}

/** Elliott Wave-lager — vågposition, timeframe, konfidens, fib. */
function WaveLayer({
  w,
  onChange,
}: {
  w: WaveAnalysis;
  onChange: (patch: Partial<WaveAnalysis>) => void;
}) {
  const impulse = isImpulse(w.position);
  return (
    <div className="space-y-4">
      <div
        className={cn(
          "rounded-md border p-3",
          impulse
            ? "border-bull/30 bg-bull/[0.04]"
            : "border-bear/30 bg-bear/[0.04]"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
            <Waves className="h-3.5 w-3.5" /> AK1TS vågposition
          </span>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px]",
              impulse
                ? "border-bull/40 text-bull"
                : "border-bear/40 text-bear"
            )}
          >
            {impulse ? "IMPULS" : "KORREKTION"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Vågposition
          </label>
          <Select
            value={w.position}
            onValueChange={(v) =>
              onChange({ position: v as WaveAnalysis["position"] })
            }
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WAVE_POSITIONS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Tidshorisont
          </label>
          <Select
            value={w.timeframe}
            onValueChange={(v) =>
              onChange({ timeframe: v as WaveAnalysis["timeframe"] })
            }
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WAVE_TIMEFRAMES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Våg-konfidens</span>
            <span className="tabular-nums text-gold">{w.confidence}%</span>
          </label>
          <Slider
            value={[w.confidence]}
            min={0}
            max={100}
            step={5}
            onValueChange={([v]) => onChange({ confidence: v })}
            className="mt-3"
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>Låg</span>
            <span>Hög</span>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Fibonacci retracement
          </label>
          <Select
            value={w.fibRetracement}
            onValueChange={(v) =>
              onChange({ fibRetracement: v as WaveAnalysis["fibRetracement"] })
            }
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FIB_LEVELS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

/** Ett enskilt innehav — rubrikrad + expanderbara lager. */
function HoldingCard({
  holding,
  index,
  expanded,
  onToggle,
  onChange,
  onRemove,
}: {
  holding: Holding;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<Holding>) => void;
  onRemove: () => void;
}) {
  const akm1Total = calcAkm1Total(holding.akm1Scores);
  const techScore = calcTechnicalScore(holding.technical);
  const impulse = isImpulse(holding.wave.position);

  return (
    <Card className="border-border bg-card p-0">
      {/* Rubrikrad */}
      <div className="flex items-center gap-3 border-b border-border p-4">
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <span className="font-mono text-[10px] text-muted-foreground">
            #{String(index + 1).padStart(2, "0")}
          </span>
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-gold" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gold" />
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-serif text-base font-bold">
                {holding.company || "Namnlöst innehav"}
              </span>
              {holding.ticker && (
                <Badge
                  variant="outline"
                  className="border-gold/40 text-[10px] text-gold"
                >
                  {holding.ticker}
                </Badge>
              )}
              <span className="text-[11px] text-muted-foreground">
                {holding.sector}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <span>Vikt {holding.weight}%</span>
              {holding.entryPrice !== "" && (
                <span>Inköp {holding.entryPrice} kr</span>
              )}
              <span className={cn("font-semibold", scoreColor(akm1Total))}>
                AKM1 {akm1Total}/100
              </span>
              <span className={cn("font-semibold", scoreColor(techScore))}>
                Teknisk {techScore}/100
              </span>
              <span
                className={cn(
                  "font-semibold",
                  impulse ? "text-bull" : "text-bear"
                )}
              >
                {holding.wave.position}
              </span>
            </div>
          </div>
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-muted-foreground hover:text-bear"
          aria-label="Ta bort innehav"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Expanderad kropp */}
      {expanded && (
        <div className="p-4">
          {/* Grundläggande fält */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Ticker
              </label>
              <Input
                value={holding.ticker}
                onChange={(e) => onChange({ ticker: e.target.value })}
                placeholder="ATCO-A.ST"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Bolag
              </label>
              <Input
                value={holding.company}
                onChange={(e) => onChange({ company: e.target.value })}
                placeholder="Atlas Copco"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Sektor
              </label>
              <Select
                value={holding.sector}
                onValueChange={(v) => onChange({ sector: v })}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Vikt (%)
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                value={holding.weight}
                onChange={(e) =>
                  onChange({ weight: Number(e.target.value) || 0 })
                }
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Inköpskurs (kr)
              </label>
              <Input
                type="number"
                value={holding.entryPrice}
                onChange={(e) =>
                  onChange({
                    entryPrice:
                      e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                placeholder="0.00"
                className="mt-1"
              />
            </div>
          </div>

          <Separator className="my-4" />

          {/* Tre analyslager */}
          <Tabs defaultValue="fundamental" className="w-full">
            <TabsList className="inline-flex h-auto w-full flex-nowrap gap-1 rounded-lg bg-muted p-1 sm:w-auto">
              <TabsTrigger
                value="fundamental"
                className="flex-1 whitespace-nowrap px-3 py-1.5 text-xs"
              >
                <Calculator className="mr-1 h-3.5 w-3.5" /> Fundamental
              </TabsTrigger>
              <TabsTrigger
                value="teknisk"
                className="flex-1 whitespace-nowrap px-3 py-1.5 text-xs"
              >
                <BarChart3 className="mr-1 h-3.5 w-3.5" /> Teknisk
              </TabsTrigger>
              <TabsTrigger
                value="vag"
                className="flex-1 whitespace-nowrap px-3 py-1.5 text-xs"
              >
                <Waves className="mr-1 h-3.5 w-3.5" /> Våg (AK1TS)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="fundamental" className="mt-4">
              <FundamentalLayer
                scores={holding.akm1Scores}
                onChange={(id, v) =>
                  onChange({
                    akm1Scores: { ...holding.akm1Scores, [id]: v },
                  })
                }
              />
            </TabsContent>
            <TabsContent value="teknisk" className="mt-4">
              <TechnicalLayer
                t={holding.technical}
                onChange={(patch) =>
                  onChange({ technical: { ...holding.technical, ...patch } })
                }
              />
            </TabsContent>
            <TabsContent value="vag" className="mt-4">
              <WaveLayer
                w={holding.wave}
                onChange={(patch) =>
                  onChange({ wave: { ...holding.wave, ...patch } })
                }
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Card>
  );
}

/** Aggregerad portföljöversikt. */
function AggregatePanel({ holdings }: { holdings: Holding[] }) {
  if (holdings.length === 0) {
    return (
      <Card className="border-dashed border-border bg-card/40 p-6 text-center">
        <PieChart className="mx-auto h-8 w-8 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">
          Lägg till innehav för att se aggregerad AKM1-, teknisk och
          våg-analys.
        </p>
      </Card>
    );
  }

  const akm1Avg =
    holdings.reduce((s, h) => s + calcAkm1Total(h.akm1Scores), 0) /
    holdings.length;
  const techAvg =
    holdings.reduce((s, h) => s + calcTechnicalScore(h.technical), 0) /
    holdings.length;
  // Fundamental ≈ akm1 i denna implementering
  const fundamentalAvg = akm1Avg;

  // Vågfördelning
  const waveDist: Record<string, number> = {};
  for (const h of holdings) {
    waveDist[h.wave.position] = (waveDist[h.wave.position] ?? 0) + 1;
  }
  const impulseCount = holdings.filter((h) =>
    isImpulse(h.wave.position)
  ).length;
  const correctionCount = holdings.length - impulseCount;

  const cards = [
    {
      label: "AKM1 snitt",
      value: akm1Avg,
      max: 100,
      icon: Calculator,
      hint: "Fundamental poäng, genomsnitt över innehaven.",
    },
    {
      label: "Fundamental snitt",
      value: fundamentalAvg,
      max: 100,
      icon: Layers,
      hint: "Samma som AKM1 i denna version av Labbet.",
    },
    {
      label: "Teknisk snitt",
      value: techAvg,
      max: 100,
      icon: BarChart3,
      hint: "Trend + RSI + MACD + MA-kors + volym.",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                <c.icon className="h-3.5 w-3.5" /> {c.label}
              </span>
              <span
                className={cn(
                  "font-serif text-2xl font-bold tabular-nums",
                  scoreColor(c.value)
                )}
              >
                {c.value.toFixed(0)}
                <span className="text-xs text-muted-foreground">/{c.max}</span>
              </span>
            </div>
            <Progress
              value={c.value}
              className={cn("mt-3 h-1.5", scoreBg(c.value))}
            />
            <p className="mt-2 text-[11px] text-muted-foreground">{c.hint}</p>
          </Card>
        ))}
      </div>

      {/* Vågfördelning */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
            <Waves className="h-3.5 w-3.5" /> Vågfördelning (AK1TS)
          </span>
          <div className="flex gap-2 text-[11px]">
            <Badge
              variant="outline"
              className="border-bull/40 text-bull"
            >
              {impulseCount} impuls
            </Badge>
            <Badge
              variant="outline"
              className="border-bear/40 text-bear"
            >
              {correctionCount} korrektion
            </Badge>
          </div>
        </div>
        <Separator className="my-3" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {WAVE_POSITIONS.map((p) => {
            const n = waveDist[p] ?? 0;
            return (
              <div
                key={p}
                className={cn(
                  "rounded-md border p-2 text-center",
                  n > 0
                    ? isImpulse(p)
                      ? "border-bull/30 bg-bull/[0.05]"
                      : "border-bear/30 bg-bear/[0.05]"
                    : "border-border bg-muted/20 opacity-50"
                )}
              >
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {p}
                </div>
                <div className="mt-1 font-serif text-lg font-bold tabular-nums">
                  {n}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/** Scenario-analys — tre knappar justerar varje innehavs projicerade avkastning. */
function ScenarioPanel({
  holdings,
  activeScenario,
  onScenario,
}: {
  holdings: Holding[];
  activeScenario: ScenarioKey | null;
  onScenario: (s: ScenarioKey) => void;
}) {
  const totalWeight = holdings.reduce((s, h) => s + h.weight, 0);

  return (
    <Card className="border-gold/30 bg-gradient-to-br from-card to-gold/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
          <Target className="h-3.5 w-3.5" /> Scenario-analys
        </span>
        <HonestyTag kind="metodmal" />
      </div>
      <h3 className="mt-2 font-serif text-lg font-bold">
        Tre framtidsscenarier — se portföljens projicerade avkastning.
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Varje scenario justerar varje innehavs projicerade avkastning med en
        multiplikator. Impuls-positioner förstärks i bull, korrektioner i bear.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => {
          const sc = SCENARIOS[key];
          const Icon = sc.icon;
          const active = activeScenario === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onScenario(key)}
              className={cn(
                "flex items-start gap-2 rounded-md border p-3 text-left transition-all",
                active
                  ? `${sc.border} ${sc.bg} shadow-sm`
                  : "border-border bg-card/60 hover:border-gold/40"
              )}
            >
              <Icon className={cn("mt-0.5 h-4 w-4", sc.color)} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-base font-bold">
                    {sc.label}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-semibold tabular-nums",
                      sc.color
                    )}
                  >
                    {fmtPct(sc.multiplier * 100, 0)}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {sc.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {activeScenario && holdings.length > 0 && (
        <div className="mt-4 rounded-md border border-border bg-card/60 p-3">
          <div className="grid gap-2">
            {holdings.map((h, i) => {
              const baseRet =
                SCENARIOS[activeScenario].multiplier *
                (isImpulse(h.wave.position)
                  ? activeScenario === "bull"
                    ? 1.4
                    : activeScenario === "bear"
                      ? 0.7
                      : 1
                  : activeScenario === "bear"
                    ? 1.3
                    : activeScenario === "bull"
                      ? 0.6
                      : 1);
              const weighted = baseRet * (h.weight / Math.max(totalWeight, 1));
              return (
                <div
                  key={h.id}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      #{String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-medium">
                      {h.company || h.ticker || "Innehav"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {h.wave.position}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="tabular-nums text-muted-foreground">
                      vikt {h.weight}%
                    </span>
                    <span
                      className={cn(
                        "w-16 text-right font-semibold tabular-nums",
                        baseRet >= 0 ? "text-bull" : "text-bear"
                      )}
                    >
                      {fmtPct(baseRet * 100, 0)}
                    </span>
                    <span
                      className={cn(
                        "w-20 text-right font-semibold tabular-nums",
                        weighted >= 0 ? "text-bull" : "text-bear"
                      )}
                    >
                      {fmtPct(weighted * 100, 1)}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
          <Separator className="my-2" />
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-muted-foreground">
              Portföljens projicerade avkastning
            </span>
            <span
              className={cn(
                "font-serif text-lg font-bold tabular-nums",
                (() => {
                  const total = holdings.reduce(
                    (s, h) =>
                      s +
                      SCENARIOS[activeScenario].multiplier *
                        (isImpulse(h.wave.position)
                          ? activeScenario === "bull"
                            ? 1.4
                            : activeScenario === "bear"
                              ? 0.7
                              : 1
                          : activeScenario === "bear"
                            ? 1.3
                            : activeScenario === "bull"
                              ? 0.6
                              : 1) *
                        (h.weight / Math.max(totalWeight, 1)),
                    0
                  );
                  return total >= 0 ? "text-bull" : "text-bear";
                })()
              )}
            >
              {fmtPct(
                holdings.reduce(
                  (s, h) =>
                    s +
                    SCENARIOS[activeScenario].multiplier *
                      (isImpulse(h.wave.position)
                        ? activeScenario === "bull"
                          ? 1.4
                          : activeScenario === "bear"
                            ? 0.7
                            : 1
                        : activeScenario === "bear"
                          ? 1.3
                          : activeScenario === "bull"
                            ? 0.6
                            : 1) *
                      (h.weight / Math.max(totalWeight, 1)),
                  0
                ) * 100,
                1
              )}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

/** Ladda-portfölj dropdown. */
function LoadPortfolioMenu({
  portfolios,
  onLoad,
  onRefresh,
  loading,
}: {
  portfolios: SavedPortfolio[];
  onLoad: (p: SavedPortfolio) => void;
  onRefresh: () => void;
  loading: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) onRefresh();
        }}
        disabled={loading}
      >
        <RefreshCw
          className={cn("mr-1 h-4 w-4", loading && "animate-spin")}
        />
        Ladda portfölj
        {portfolios.length > 0 && (
          <Badge
            variant="outline"
            className="ml-2 border-gold/40 text-[10px] text-gold"
          >
            {portfolios.length}
          </Badge>
        )}
      </Button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <Card className="absolute right-0 z-20 mt-2 max-h-80 w-80 overflow-y-auto p-2">
            {portfolios.length === 0 ? (
              <p className="p-4 text-center text-xs text-muted-foreground">
                Inga sparade portföljer ännu.
              </p>
            ) : (
              <div className="space-y-1">
                {portfolios.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onLoad(p);
                      setOpen(false);
                    }}
                    className="block w-full rounded-md border border-border bg-card/60 p-2 text-left hover:border-gold/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-sm font-bold">
                        {p.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(p.updatedAt).toLocaleDateString("sv-SE")}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>
                        {p.holdings?.length ?? 0} innehav
                      </span>
                      <span>·</span>
                      <span>Kassa {p.cashPosition}%</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

// ============================================================
// HUVUDKOMPONENT
// ============================================================

export function PortfolioBuilder() {
  // ----- Portfölj-state -----
  const [name, setName] = React.useState("Min AK1A-portfölj");
  const [description, setDescription] = React.useState("");
  const [cashPosition, setCashPosition] = React.useState(10);
  const [holdings, setHoldings] = React.useState<Holding[]>([newHolding()]);
  const [expandedId, setExpandedId] = React.useState<string | null>(
    () => null
  );
  const [activeScenario, setActiveScenario] =
    React.useState<ScenarioKey | null>(null);

  // ----- Sparade portföljer -----
  const [savedPortfolios, setSavedPortfolios] = React.useState<SavedPortfolio[]>(
    []
  );
  const [loadingList, setLoadingList] = React.useState(false);

  // ----- Save/load status -----
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<{
    kind: "ok" | "err";
    msg: string;
  } | null>(null);

  // ----- Session id -----
  const sessionIdRef = React.useRef<string>("");
  React.useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
  }, []);

  // ----- Init: expandera första innehavet -----
  React.useEffect(() => {
    if (holdings.length > 0 && expandedId === null) {
      setExpandedId(holdings[0].id);
    }
  }, []);

  // ----- Toast auto-dismiss -----
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(t);
  }, [toast]);

  // ----- Helpers -----
  function patchHolding(id: string, patch: Partial<Holding>) {
    setHoldings((hs) =>
      hs.map((h) => (h.id === id ? { ...h, ...patch } : h))
    );
  }
  function removeHolding(id: string) {
    setHoldings((hs) => hs.filter((h) => h.id !== id));
    if (expandedId === id) setExpandedId(null);
  }
  function addHolding() {
    if (holdings.length >= MAX_HOLDINGS) return;
    const h = newHolding();
    setHoldings((hs) => [...hs, h]);
    setExpandedId(h.id);
  }

  // ----- Save -----
  async function handleSave() {
    if (!sessionIdRef.current) {
      setToast({ kind: "err", msg: "Ingen session-id tillgänglig." });
      return;
    }
    if (!name.trim()) {
      setToast({ kind: "err", msg: "Portföljen behöver ett namn." });
      return;
    }
    setSaving(true);
    try {
      const body = {
        sessionId: sessionIdRef.current,
        name: name.trim(),
        description: description.trim() || null,
        cashPosition,
        holdings: holdings.map((h) => ({
          ticker: h.ticker,
          company: h.company,
          sector: h.sector,
          weight: h.weight,
          entryPrice: h.entryPrice === "" ? null : h.entryPrice,
          akm1Scores: h.akm1Scores,
          akm1Total: calcAkm1Total(h.akm1Scores),
          technicalAnalysis: h.technical,
          technicalScore: calcTechnicalScore(h.technical),
          fundamentalAnalysis: h.akm1Scores,
          fundamentalScore: calcAkm1Total(h.akm1Scores),
          wavePosition: h.wave.position,
          waveTimeframe: h.wave.timeframe,
          waveConfidence: h.wave.confidence,
          thesis: null,
          risks: null,
          catalysts: null,
        })),
      };
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      setToast({
        kind: "ok",
        msg: `Portfölj sparad — ${holdings.length} innehav.`,
      });
      // Refresh list
      void refreshSaved();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Okänt fel";
      setToast({ kind: "err", msg: `Kunde inte spara: ${msg}` });
    } finally {
      setSaving(false);
    }
  }

  // ----- Refresh saved list -----
  async function refreshSaved() {
    if (!sessionIdRef.current) return;
    setLoadingList(true);
    try {
      const res = await fetch(
        `/api/portfolio?sessionId=${encodeURIComponent(sessionIdRef.current)}`
      );
      if (!res.ok) return;
      const j = await res.json();
      setSavedPortfolios(j.portfolios ?? []);
    } catch {
      // fail silently
    } finally {
      setLoadingList(false);
    }
  }

  // ----- Load -----
  function handleLoad(p: SavedPortfolio) {
    setName(p.name);
    setDescription(p.description ?? "");
    setCashPosition(p.cashPosition ?? 0);
    setHoldings(
      (p.holdings ?? []).map((h, idx) => {
        let akm1Scores: Record<string, number> = emptyAkm1Scores();
        try {
          if (h.akm1Scores) {
            const parsed = JSON.parse(h.akm1Scores);
            for (const v of AKM1_VARS) {
              if (typeof parsed[v.id] === "number") akm1Scores[v.id] = parsed[v.id];
            }
          }
        } catch {
          // ignore
        }
        let technical: TechnicalAnalysis = defaultTechnical();
        try {
          if (h.technicalAnalysis) {
            const parsed = JSON.parse(h.technicalAnalysis);
            technical = { ...defaultTechnical(), ...parsed };
          }
        } catch {
          // ignore
        }
        const position = (WAVE_POSITIONS as readonly string[]).includes(
          h.wavePosition ?? ""
        )
          ? (h.wavePosition as (typeof WAVE_POSITIONS)[number])
          : "Impuls 3";
        const timeframe = (WAVE_TIMEFRAMES as readonly string[]).includes(
          h.waveTimeframe ?? ""
        )
          ? (h.waveTimeframe as (typeof WAVE_TIMEFRAMES)[number])
          : "månad";
        return {
          id: `h-loaded-${idx}-${Date.now()}`,
          ticker: h.ticker,
          company: h.company,
          sector: h.sector || "Industri",
          weight: h.weight,
          entryPrice: h.entryPrice ?? "",
          akm1Scores,
          technical,
          wave: {
            position,
            timeframe,
            confidence: h.waveConfidence ?? 50,
            fibRetracement: "50%",
          },
        };
      })
    );
    setExpandedId(null);
    setActiveScenario(null);
    setToast({
      kind: "ok",
      msg: `Portfölj "${p.name}" laddad.`,
    });
  }

  // ----- Reset -----
  function handleReset() {
    setName("Min AK1A-portfölj");
    setDescription("");
    setCashPosition(10);
    const h = newHolding();
    setHoldings([h]);
    setExpandedId(h.id);
    setActiveScenario(null);
  }

  // ----- Beräkningar -----
  const totalWeight = holdings.reduce((s, h) => s + h.weight, 0);
  const investedWeight = Math.max(0, 100 - cashPosition);
  const weightMismatch = Math.abs(totalWeight - investedWeight) > 0.5;

  return (
    <div className="paper-texture">
      {/* ───────────── RUBRIK ───────────── */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <Eyebrow>Djup portföljbyggare</Eyebrow>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                Tre analyslager. En portfölj.
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Bygg en fiktiv portfölj med upp till {MAX_HOLDINGS} innehav.
                För varje innehav kan du poängsätta alla 20 AKM1-variabler
                (fundamental), fylla i teknisk analys (trend, RSI, MACD,
                MA50/200, volym) och ange Elliott Wave-position (AK1TS).
                Avsluta med Bull/Base/Bear-scenarier.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <HonestyTag kind="metodmal" />
              <span className="text-[11px] text-muted-foreground">
                Fiktiv · Ej rådgivning
              </span>
            </div>
          </div>
          <GoldRule className="mt-6" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* ───────────── PORTFÖLJ-METADATA ───────────── */}
        <Card className="border-gold/30 bg-gradient-to-br from-card to-gold/[0.03] p-5">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                Portföljnamn
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 font-serif text-lg"
                placeholder="Min AK1A-portfölj"
              />
              <label className="mt-3 block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Beskrivning
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Kort beskrivning av portföljens tes — t.ex. 'Svenska moat-bolag med positiv våg-position.'"
                className="mt-1 resize-none"
              />
            </div>
            <div>
              <label className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                <span className="flex items-center gap-1.5">
                  <CircleDollarSign className="h-3.5 w-3.5" /> Kassaposition
                </span>
                <span className="tabular-nums">{cashPosition}%</span>
              </label>
              <Slider
                value={[cashPosition]}
                min={0}
                max={100}
                step={5}
                onValueChange={([v]) => setCashPosition(v)}
                className="mt-4"
              />
              <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                <span>100% investerat</span>
                <span>100% kassa</span>
              </div>
              <Separator className="my-3" />
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investerat</span>
                  <span className="font-semibold tabular-nums">
                    {investedWeight}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Summa vikter</span>
                  <span
                    className={cn(
                      "font-semibold tabular-nums",
                      weightMismatch ? "text-bear" : "text-bull"
                    )}
                  >
                    {totalWeight.toFixed(1)}%
                  </span>
                </div>
                {weightMismatch && (
                  <div className="mt-2 flex items-start gap-1.5 rounded-md border border-bear/30 bg-bear/[0.05] p-2 text-[10px] text-bear">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                    <span>
                      Vikterna ({totalWeight.toFixed(1)}%) matchar inte
                      investerat utrymme ({investedWeight}%). Justera vikterna
                      eller kassapositionen.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Åtgärdsknappar */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gold text-background hover:bg-gold/90"
            >
              <Save className="mr-1 h-4 w-4" />
              {saving ? "Sparar…" : "Spara portfölj"}
            </Button>
            <LoadPortfolioMenu
              portfolios={savedPortfolios}
              onLoad={handleLoad}
              onRefresh={refreshSaved}
              loading={loadingList}
            />
            <Button variant="ghost" onClick={handleReset}>
              <Sparkles className="mr-1 h-4 w-4" />
              Ny portfölj
            </Button>
            <Button
              variant="outline"
              onClick={addHolding}
              disabled={holdings.length >= MAX_HOLDINGS}
            >
              <Plus className="mr-1 h-4 w-4" /> Lägg till innehav
            </Button>
            <span className="ml-auto text-[11px] text-muted-foreground">
              {holdings.length}/{MAX_HOLDINGS} innehav
            </span>
          </div>

          {/* Toast */}
          {toast && (
            <div
              className={cn(
                "mt-4 flex items-center gap-2 rounded-md border px-3 py-2 text-xs",
                toast.kind === "ok"
                  ? "border-bull/40 bg-bull/10 text-bull"
                  : "border-bear/40 bg-bear/10 text-bear"
              )}
            >
              {toast.kind === "ok" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              {toast.msg}
            </div>
          )}
        </Card>

        {/* ───────────── AGGREGERAD ÖVERSIKT ───────────── */}
        <div className="mt-8">
          <Eyebrow>Portföljöversikt</Eyebrow>
          <h3 className="mt-2 font-serif text-2xl font-bold">
            Aggregerad analys
          </h3>
          <div className="mt-4">
            <AggregatePanel holdings={holdings} />
          </div>
        </div>

        {/* ───────────── INNEHAV ───────────── */}
        <div className="mt-8">
          <Eyebrow>Innehav</Eyebrow>
          <h3 className="mt-2 font-serif text-2xl font-bold">
            {holdings.length} {holdings.length === 1 ? "innehav" : "innehav"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Klicka på ett innehav för att expandera alla tre analyslager.
          </p>
          <div className="mt-4 space-y-3">
            {holdings.length === 0 ? (
              <Card className="border-dashed border-border bg-card/40 p-8 text-center">
                <Wallet className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Inga innehav. Lägg till ett för att börja bygga.
                </p>
                <Button
                  className="mt-4 bg-gold text-background hover:bg-gold/90"
                  onClick={addHolding}
                >
                  <Plus className="mr-1 h-4 w-4" /> Lägg till innehav
                </Button>
              </Card>
            ) : (
              holdings.map((h, i) => (
                <HoldingCard
                  key={h.id}
                  holding={h}
                  index={i}
                  expanded={expandedId === h.id}
                  onToggle={() =>
                    setExpandedId((id) => (id === h.id ? null : h.id))
                  }
                  onChange={(patch) => patchHolding(h.id, patch)}
                  onRemove={() => removeHolding(h.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ───────────── SCENARIO-ANALYS ───────────── */}
        <div className="mt-8">
          <Eyebrow>Scenario</Eyebrow>
          <h3 className="mt-2 font-serif text-2xl font-bold">
            Bull · Base · Bear
          </h3>
          <div className="mt-4">
            <ScenarioPanel
              holdings={holdings}
              activeScenario={activeScenario}
              onScenario={(s) =>
                setActiveScenario((cur) => (cur === s ? null : s))
              }
            />
          </div>
        </div>

        {/* ───────────── METODFOOTER ───────────── */}
        <div className="mt-10 rounded-lg border border-border bg-muted/30 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <Circle className="mt-0.5 h-3 w-3 text-gold" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                  Metodnot
                </p>
                <p className="mt-1 max-w-xl text-xs text-muted-foreground leading-relaxed">
                  Denna byggare samlar in fundamental (AKM1 20 variabler),
                  teknisk (trend, RSI, MACD, MA50/200, volym, support/resistance)
                  och Elliott Wave-data (AK1TS). Scenarierna justerar
                  projicerad avkastning utifrån vågposition — impulsförstärkning
                  i bull, korrektionsförstärkning i bear. Alla beräkningar är
                  reproducerbara och synliga.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <HonestyTag kind="matt" />
              <span className="text-[11px] text-muted-foreground">
                AKM1: 20 variabler
              </span>
              <span className="hidden text-muted-foreground sm:inline">·</span>
              <span className="text-[11px] text-muted-foreground">
                AK1TS: 10 vågpositioner
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
