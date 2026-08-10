import * as React from "react";
import { cn } from "@/lib/utils";

/** The AK1A Research Lab wordmark — stacked, serif, gold rule beneath. */
export function Ak1aLogo({
  className,
  onClick,
  size = "md",
}: {
  className?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}) {
  const dims = {
    sm: { ak: "text-base", sub: "text-[8px]", rule: "w-10" },
    md: { ak: "text-xl", sub: "text-[9px]", rule: "w-14" },
    lg: { ak: "text-3xl", sub: "text-xs", rule: "w-20" },
  }[size];

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex flex-col items-start leading-none select-none",
        className
      )}
      aria-label="AK1A Research Lab — till startsidan"
    >
      <span className="font-serif font-bold tracking-tight text-ink dark:text-foreground">
        <span className="text-gold">AK1</span>A
      </span>
      <span
        className={cn("font-sans uppercase tracking-[0.2em] text-muted-foreground", dims.sub)}
      >
        Research Lab
      </span>
      <span className={cn("h-px mt-1 bg-gradient-to-r from-gold to-transparent", dims.rule)} />
    </button>
  );
}

/** "Mätt" / "Metodmål" honesty tag — the AK1A signature labelling system. */
export function HonestyTag({
  kind,
  className,
}: {
  kind: "matt" | "metodmal";
  className?: string;
}) {
  const isMatt = kind === "matt";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm border",
        isMatt
          ? "border-bull/40 text-bull bg-bull/5"
          : "border-gold/40 text-gold bg-gold/5",
        className
      )}
    >
      <span
        className={cn("h-1 w-1 rounded-full", isMatt ? "bg-bull" : "bg-gold")}
      />
      {isMatt ? "Mätt" : "Metodmål"}
    </span>
  );
}

/** Bull / Bear / Neutral signal pill. */
export function SignalPill({
  signal,
  className,
  label,
}: {
  signal: "bull" | "bear" | "neutral";
  className?: string;
  label?: string;
}) {
  const map = {
    bull: { txt: "text-bull", bg: "bg-bull/10", border: "border-bull/30", glyph: "▲", default: "Bull" },
    bear: { txt: "text-bear", bg: "bg-bear/10", border: "border-bear/30", glyph: "▼", default: "Bear" },
    neutral: { txt: "text-neutral-signal", bg: "bg-neutral-signal/10", border: "border-neutral-signal/30", glyph: "—", default: "Neutral" },
  }[signal];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-sm border",
        map.txt, map.bg, map.border,
        className
      )}
    >
      <span aria-hidden>{map.glyph}</span>
      {label ?? map.default}
    </span>
  );
}

/** A small greek-letter "organ" glyph badge. */
export function OrganGlyph({
  symbol,
  className,
  active = true,
}: {
  symbol: string;
  className?: string;
  active?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full font-serif text-lg border",
        active
          ? "bg-gold/10 border-gold/40 text-gold"
          : "bg-muted border-border text-muted-foreground",
        className
      )}
    >
      {symbol}
    </span>
  );
}

/** Section eyebrow label — small uppercase gold label above headings. */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-gold",
        className
      )}
    >
      {children}
    </span>
  );
}

/** Gold divider rule. */
export function GoldRule({ className }: { className?: string }) {
  return <span className={cn("block h-px gold-rule", className)} />;
}
