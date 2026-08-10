"use client";

import * as React from "react";
import { WAVE_THEORIES, WAVE_HORIZONS, type WaveSignal } from "@/lib/ak1a/data";
import { useAk1aStore } from "@/lib/ak1a-store";
import { Eyebrow } from "./primitives";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface WaveCell {
  signal: WaveSignal;
  strength: 1 | 2 | 3;
  note: string;
}

// Precise Biometrics PREC.ST — wave position snapshot (demo data, Mätt)
const MATRIX: Record<string, WaveCell> = {
  "Elliott-Mikro":     { signal: "bear",    strength: 3, note: "Impuls våg 3 nedåt aktiv." },
  "Elliott-Kort":      { signal: "bear",    strength: 3, note: "Våg 5 nedåt under utveckling." },
  "Elliott-Medellång": { signal: "neutral", strength: 2, note: "Konsolideringszon ej bekräftad." },
  "Elliott-Lång":      { signal: "bull",    strength: 2, note: "Våg (A) uppgång påbörjas." },
  "Elliott-Mega":      { signal: "bull",    strength: 3, note: "Ny primärvåg upp formad." },

  "Fibonacci-Mikro":     { signal: "bear",    strength: 2, note: "Under 38.2% retracement." },
  "Fibonacci-Kort":      { signal: "bear",    strength: 3, note: "Testar 61.8% nedåt." },
  "Fibonacci-Medellång": { signal: "bear",    strength: 2, note: "Når 78.6% extrema zonen." },
  "Fibonacci-Lång":      { signal: "neutral", strength: 2, note: "Fib-cluster vändningszon." },
  "Fibonacci-Mega":      { signal: "bull",    strength: 2, note: "Projektion 161.8% uppåt." },

  "Gann-Mikro":     { signal: "bear",    strength: 3, note: "Under 1×1 vinkel nedåt." },
  "Gann-Kort":      { signal: "bear",    strength: 2, note: "Når 2×1 stödlinje." },
  "Gann-Medellång": { signal: "neutral", strength: 2, note: "Tids-cykel bottnar Q1." },
  "Gann-Lång":      { signal: "bull",    strength: 3, note: "Vändning vid 1×1 bekräftad." },
  "Gann-Mega":      { signal: "bull",    strength: 3, note: "Ny 1×2 upp-trend etablerad." },

  "Lucas-Mikro":     { signal: "bear",    strength: 2, note: "Lucas 7 nedräkning aktiv." },
  "Lucas-Kort":      { signal: "bear",    strength: 3, note: "Lucas 11 topp-närme." },
  "Lucas-Medellång": { signal: "bull",    strength: 2, note: "Lucas 18 vändningspunkt." },
  "Lucas-Lång":      { signal: "bull",    strength: 2, note: "Lucas 29 uppgångscykel." },
  "Lucas-Mega":      { signal: "bear",    strength: 3, note: "Lucas 47 toppmarkering." },

  "Volym-Mikro":     { signal: "bear",    strength: 2, note: "Sälj-volym över genomsnitt." },
  "Volym-Kort":      { signal: "bear",    strength: 2, note: "Ackumulering ej startad." },
  "Volym-Medellång": { signal: "neutral", strength: 2, note: "Volym-torka i vändningszon." },
  "Volym-Lång":      { signal: "bull",    strength: 2, note: "Ökande köp-volym noteras." },
  "Volym-Mega":      { signal: "neutral", strength: 2, note: "Långsiktig volym neutral." },
};

export function WaveMatrix() {
  const { setSection } = useAk1aStore();
  const [active, setActive] = React.useState<string | null>(null);

  const stats = React.useMemo(() => {
    let bull = 0, bear = 0, neutral = 0;
    Object.values(MATRIX).forEach((c) => {
      if (c.signal === "bull") bull++;
      else if (c.signal === "bear") bear++;
      else neutral++;
    });
    return { bull, bear, neutral };
  }, []);

  const bias = stats.bear > stats.bull ? "BEARISH" : stats.bull > stats.bear ? "BULLISH" : "NEUTRAL";

  const activeCell = active ? MATRIX[active] : null;
  const [activeTheory, activeHorizon] = active ? active.split("-") : ["", ""];

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <Eyebrow>AK1T Våg-Matris — Signatur-visualisering</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-bold text-balance">
              25 celler. 5 teorier × 5 tidshorisonter. En bild.
            </h2>
            <p className="mt-2 text-muted-foreground">
              Så här ser en akties vågposition ut i hela sitt spektrum. Detta är
              unikt för AK1A — ingen svensk plattform gör detta.
            </p>
          </div>
          <div className="rounded-md border border-gold/30 bg-gold/5 px-4 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gold">
              Vågposition nu
            </p>
            <p className="font-serif text-lg font-bold">Precise Biometrics</p>
            <p className="text-xs text-muted-foreground">PREC · ST · Snapshot · Demo</p>
          </div>
        </div>

        {/* Matrix */}
        <div className="mt-8 overflow-x-auto scrollbar-ak1a">
          <div className="min-w-[640px]">
            {/* header row */}
            <div className="grid grid-cols-[120px_repeat(5,1fr)] gap-1">
              <div />
              {WAVE_HORIZONS.map((h) => (
                <div
                  key={h}
                  className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground pb-2"
                >
                  {h}
                </div>
              ))}
            </div>

            {WAVE_THEORIES.map((theory) => (
              <div key={theory} className="grid grid-cols-[120px_repeat(5,1fr)] gap-1">
                <div className="flex items-center pr-2 text-right justify-end">
                  <span className="font-serif text-sm font-bold">{theory}</span>
                </div>
                {WAVE_HORIZONS.map((horizon) => {
                  const key = `${theory}-${horizon}`;
                  const cell = MATRIX[key];
                  return (
                    <WaveCellButton
                      key={key}
                      cell={cell}
                      theory={theory}
                      horizon={horizon}
                      onClick={() => setActive(key)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Confluence bar */}
        <div className="mt-6 rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-serif text-sm font-bold">
              KONFLUENS:{" "}
              <span className={bias === "BULLISH" ? "text-bull" : bias === "BEARISH" ? "text-bear" : "text-neutral-signal"}>
                {bias} BIAS
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              {stats.bull}/25 BULLISH · {stats.bear}/25 BEARISH · {stats.neutral}/25 NEUTRAL
            </p>
          </div>
          <div className="mt-3 flex h-3 overflow-hidden rounded-full">
            <div className="bg-bull" style={{ width: `${(stats.bull / 25) * 100}%` }} />
            <div className="bg-neutral-signal/40" style={{ width: `${(stats.neutral / 25) * 100}%` }} />
            <div className="bg-bear" style={{ width: `${(stats.bear / 25) * 100}%` }} />
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-wider text-muted-foreground">
            Detta är AK1A:s signatur-visualisering — 25 celler visar hela vågspektrumet
          </p>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
            <LegendDot color="bull" label="BULL" />
            <LegendDot color="bear" label="BEAR" />
            <LegendDot color="neutral" label="NEUTRAL" />
            <span className="text-muted-foreground">STYRKA = ANTAL PRICKAR</span>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button variant="outline" onClick={() => setSection("labb")}>
            REPRODUCERA I LABBET <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cell detail dialog */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {activeTheory} · {activeHorizon}
            </DialogTitle>
            <DialogDescription>
              {activeTheory}-teori, {activeHorizon} tidshorisont.
            </DialogDescription>
          </DialogHeader>
          {activeCell && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-bold",
                    activeCell.signal === "bull" && "border-bull/40 bg-bull/10 text-bull",
                    activeCell.signal === "bear" && "border-bear/40 bg-bear/10 text-bear",
                    activeCell.signal === "neutral" && "border-neutral-signal/40 bg-neutral-signal/10 text-neutral-signal"
                  )}
                >
                  {activeCell.signal === "bull" ? "▲" : activeCell.signal === "bear" ? "▼" : "—"}
                  {activeCell.signal === "bull" ? "Bullish" : activeCell.signal === "bear" ? "Bearish" : "Neutral"}
                </span>
                <span className="text-sm text-muted-foreground">
                  Styrka {activeCell.strength} av 3
                </span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-2 w-8 rounded-full",
                      i <= activeCell.strength
                        ? activeCell.signal === "bull"
                          ? "bg-bull"
                          : activeCell.signal === "bear"
                          ? "bg-bear"
                          : "bg-neutral-signal"
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <p className="rounded-md border border-border bg-muted/40 p-3 text-sm leading-relaxed">
                {activeCell.note}
              </p>
              <p className="text-xs text-muted-foreground">
                Cell från AK1T snapshot för Precise Biometrics (PREC.ST). Demo-data —
                reproducerbar i Labbet via samma 5 teorier × 5 tidshorisonter.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function WaveCellButton({
  cell,
  theory,
  horizon,
  onClick,
}: {
  cell: WaveCell;
  theory: string;
  horizon: string;
  onClick: () => void;
}) {
  const palette =
    cell.signal === "bull"
      ? "border-bull/40 bg-bull/10 text-bull hover:bg-bull/20"
      : cell.signal === "bear"
      ? "border-bear/40 bg-bear/10 text-bear hover:bg-bear/20"
      : "border-neutral-signal/40 bg-neutral-signal/10 text-neutral-signal hover:bg-neutral-signal/20";

  return (
    <button
      onClick={onClick}
      title={`${theory} · ${horizon}: ${cell.signal}, styrka ${cell.strength}/3. ${cell.note}`}
      className={cn(
        "group relative aspect-square rounded-md border p-2 transition-all hover:scale-[1.03] hover:shadow-md",
        palette
      )}
    >
      <span className="block text-center font-serif text-2xl font-bold leading-none">
        {cell.signal === "bull" ? "▲" : cell.signal === "bear" ? "▼" : "—"}
      </span>
      <span className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-0.5">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 w-1 rounded-full",
              i <= cell.strength ? "currentcolor" : "bg-current/20"
            )}
          />
        ))}
      </span>
    </button>
  );
}

function LegendDot({ color, label }: { color: WaveSignal; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          color === "bull" && "bg-bull",
          color === "bear" && "bg-bear",
          color === "neutral" && "bg-neutral-signal"
        )}
      />
      <span className="font-semibold">{label}</span>
    </span>
  );
}
