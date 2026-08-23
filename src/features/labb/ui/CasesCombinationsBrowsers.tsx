"use client";

import * as React from "react";
import { useAk1aStore } from "@/lib/ak1a-store";
import { Eyebrow, HonestyTag, SignalPill } from "./primitives";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Loader2,
  Database,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CaseStudy {
  id: string;
  type: "success" | "failure";
  company: string;
  ticker: string;
  title: string;
  description: string;
  akm1Score: number;
  decisiveVars: string;
  sector: string | null;
  year: number | null;
  outcome: string | null;
  lesson: string | null;
  isIllustrative: boolean;
}

/** Case Studies browser — searches 400+ cases from the database. */
export function CaseStudiesBrowser() {
  const { setSection } = useAk1aStore();
  const [cases, setCases] = React.useState<CaseStudy[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<"all" | "success" | "failure">("all");
  const [search, setSearch] = React.useState("");
  const [active, setActive] = React.useState<CaseStudy | null>(null);
  const [totalCount, setTotalCount] = React.useState(0);

  const loadCases = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("type", filter);
      if (search) params.set("q", search);
      params.set("limit", "200");
      const res = await fetch(`/api/cases?${params}`);
      const d = await res.json();
      setCases(d.cases || []);
      setTotalCount(d.count || 0);
    } catch {
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  React.useEffect(() => {
    const t = setTimeout(loadCases, 300);
    return () => clearTimeout(t);
  }, [loadCases]);

  const successCount = cases.filter((c) => c.type === "success").length;
  const failureCount = cases.filter((c) => c.type === "failure").length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="font-serif text-2xl font-bold text-bull">{successCount}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Lyckade</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="font-serif text-2xl font-bold text-bear">{failureCount}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Misslyckade</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="font-serif text-2xl font-bold text-gold">{totalCount}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Totalt</p>
        </Card>
      </div>

      {/* Filter + search */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">Alla ({totalCount})</TabsTrigger>
            <TabsTrigger value="success">
              <TrendingUp className="mr-1 h-3 w-3 text-bull" /> Lyckade
            </TabsTrigger>
            <TabsTrigger value="failure">
              <TrendingDown className="mr-1 h-3 w-3 text-bear" /> Misslyckade
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sök bolag, ticker, sektor…"
            className="pl-8"
          />
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : cases.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Inga fallstudier hittades.
        </Card>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c)}
              className={cn(
                "group flex flex-col rounded-md border p-3 text-left transition-all hover:shadow-sm",
                c.type === "success"
                  ? "border-bull/30 bg-bull/5 hover:border-bull/50"
                  : "border-bear/30 bg-bear/5 hover:border-bear/50"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider",
                    c.type === "success" ? "text-bull" : "text-bear"
                  )}
                >
                  {c.type === "success" ? "▲ LYCKAD" : "▼ MISSLYCKAD"}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">{c.ticker}</span>
              </div>
              <p className="mt-1 font-serif text-sm font-bold leading-tight">{c.company}</p>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{c.title}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{c.sector}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px]",
                    c.akm1Score >= 70
                      ? "border-bull/40 text-bull"
                      : c.akm1Score >= 40
                      ? "border-gold/40 text-gold"
                      : "border-bear/40 text-bear"
                  )}
                >
                  {c.akm1Score}/95
                </Badge>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif">
              {active?.type === "success" ? (
                <TrendingUp className="h-5 w-5 text-bull" />
              ) : (
                <TrendingDown className="h-5 w-5 text-bear" />
              )}
              {active?.company}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              {active?.ticker} · {active?.sector} · {active?.year}
            </DialogDescription>
          </DialogHeader>
          {active && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <SignalPill
                  signal={active.type === "success" ? "bull" : "bear"}
                  label={active.type === "success" ? "LYCKAD" : "MISSLYCKAD"}
                />
                <Badge
                  variant="outline"
                  className={cn(
                    active.akm1Score >= 70
                      ? "border-bull/40 text-bull"
                      : active.akm1Score >= 40
                      ? "border-gold/40 text-gold"
                      : "border-bear/40 text-bear"
                  )}
                >
                  AKM1: {active.akm1Score}/95
                </Badge>
                {active.outcome && (
                  <Badge variant="outline" className="border-border">
                    {active.outcome}
                  </Badge>
                )}
                {active.isIllustrative && (
                  <HonestyTag kind="metodmal" />
                )}
              </div>
              <p className="font-serif text-lg font-bold leading-snug">{active.title}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{active.description}</p>
              <div className="rounded-md border border-border bg-muted/40 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gold">
                  Avgörande variabler
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {active.decisiveVars.split(",").map((v) => (
                    <Badge key={v} variant="outline" className="text-[10px] border-gold/30 text-gold">
                      {v.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
              {active.lesson && (
                <div className="rounded-md border border-gold/30 bg-gold/5 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gold">
                    Lärdom
                  </p>
                  <p className="mt-1 text-sm italic">{active.lesson}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Indicator Combinations browser — 190+ combinations from the database. */
export function CombinationsBrowser() {
  const [combos, setCombos] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [verdict, setVerdict] = React.useState<"all" | "bull" | "bear" | "warning" | "neutral">("all");
  const [active, setActive] = React.useState<any>(null);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (verdict !== "all") params.set("verdict", verdict);
        params.set("limit", "200");
        const res = await fetch(`/api/combinations?${params}`);
        const d = await res.json();
        setCombos(d.combinations || []);
      } catch {
        setCombos([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [verdict]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <Database className="mr-1 inline h-4 w-4 text-gold" />
          {combos.length} kombinationer från databasen
        </p>
        <Tabs value={verdict} onValueChange={(v) => setVerdict(v as any)}>
          <TabsList>
            <TabsTrigger value="all">Alla</TabsTrigger>
            <TabsTrigger value="bull" className="text-bull">Bull</TabsTrigger>
            <TabsTrigger value="bear" className="text-bear">Bear</TabsTrigger>
            <TabsTrigger value="warning" className="text-gold">Varning</TabsTrigger>
            <TabsTrigger value="neutral">Neutral</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {combos.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c)}
              className={cn(
                "group flex flex-col rounded-md border p-3 text-left transition-all hover:shadow-sm",
                c.verdict === "bull"
                  ? "border-bull/30 bg-bull/5"
                  : c.verdict === "bear"
                  ? "border-bear/30 bg-bear/5"
                  : c.verdict === "warning"
                  ? "border-gold/30 bg-gold/5"
                  : "border-border bg-card"
              )}
            >
              <div className="flex items-center gap-2">
                <SignalPill
                  signal={c.verdict === "bull" ? "bull" : c.verdict === "bear" ? "bear" : "neutral"}
                  label={c.verdict.toUpperCase()}
                />
                <span className="text-[10px] font-mono text-muted-foreground">
                  {c.indicatorAId} × {c.indicatorBId}
                </span>
              </div>
              <p className="mt-1.5 font-serif text-sm font-bold leading-tight line-clamp-2">
                {c.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{c.outcome}</p>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">{active?.title}</DialogTitle>
            <DialogDescription className="font-mono text-xs">
              {active?.indicatorAId} × {active?.indicatorBId} · {active?.verdict}
            </DialogDescription>
          </DialogHeader>
          {active && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <SignalPill
                  signal={active.verdict === "bull" ? "bull" : active.verdict === "bear" ? "bear" : "neutral"}
                  label={active.verdict.toUpperCase()}
                />
              </div>
              <div className="rounded-md border border-border bg-muted/40 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gold">Mönster</p>
                <p className="mt-1 text-sm">{active.pattern}</p>
              </div>
              <div className="rounded-md border border-border bg-muted/40 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gold">Utfall</p>
                <p className="mt-1 text-sm">{active.outcome}</p>
              </div>
              <p className="text-sm leading-relaxed">{active.courseBody}</p>
              {active.example && (
                <div className="rounded-md border border-gold/30 bg-gold/5 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gold">Exempel</p>
                  <p className="mt-1 text-sm italic">{active.example}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
