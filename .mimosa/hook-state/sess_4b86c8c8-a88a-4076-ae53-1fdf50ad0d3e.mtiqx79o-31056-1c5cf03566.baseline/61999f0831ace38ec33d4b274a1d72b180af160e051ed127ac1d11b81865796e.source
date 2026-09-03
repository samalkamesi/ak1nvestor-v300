"use client";

import * as React from "react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════════════════
   AK1A DNA Components — 8 unika signaturer
   Varje komponent representerar en del av AK1A:s identitet
   ══════════════════════════════════════════════════════════════════════════ */

/* 1. VerifyStamp — MÄTT/METODMÅL verifieringsstämpel */
export function VerifyStamp({
  status = "MÄTT",
  date,
  className,
}: {
  status?: "MÄTT" | "METODMÅL" | "PRELIMINÄR";
  date?: string;
  className?: string;
}) {
  const Icon = status === "MÄTT" ? CheckCircle2 : status === "METODMÅL" ? Clock : AlertCircle;
  return (
    <span className={cn("ak1a-verify-stamp", className)} data-status={status}>
      <Icon className="h-2.5 w-2.5" />
      <span>{status}</span>
      {date && <span className="opacity-60">· {date}</span>}
    </span>
  );
}

/* 2. GoldDivider — våg-mönster avdelare */
export function GoldDivider({
  variant = "default",
  className,
}: {
  variant?: "default" | "wide";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "ak1a-gold-divider",
        variant === "wide" && "ak1a-gold-divider--wide",
        className
      )}
    />
  );
}

/* 3. CellGrid — 5×5 rutnät (25 våg-celler) */
export function CellGrid({
  activeCells = [],
  className,
  showLabels = true,
}: {
  activeCells?: number[];
  className?: string;
  showLabels?: boolean;
}) {
  return (
    <div className={cn("ak1a-cell-grid", className)}>
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "ak1a-cell-grid__cell",
            activeCells.includes(i) && "ak1a-cell-grid__cell--active"
          )}
          style={
            activeCells.includes(i)
              ? { backgroundColor: "rgba(197,165,114,0.15)", borderColor: "var(--gold)" }
              : undefined
          }
        >
          {showLabels ? `W${String(i + 1).padStart(2, "0")}` : ""}
        </div>
      ))}
    </div>
  );
}

/* 4. VariableTag — V01-V20 institutionella tags */
export function VariableTag({
  id,
  signal = "neutral",
  className,
}: {
  id: string;
  signal?: "bull" | "bear" | "neutral";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "ak1a-variable-tag",
        `ak1a-variable-tag--${signal}`,
        className
      )}
    >
      {id}
    </span>
  );
}

/* 5. PaperCard — institutionell pappersstruktur */
export function PaperCard({
  children,
  accent = false,
  className,
}: {
  children: React.ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "ak1a-paper-card",
        accent && "ak1a-paper-card--accent",
        className
      )}
    >
      {children}
    </div>
  );
}

/* 6. ConfidenceMeter — MÄTT/METODMÅL visuell mätare */
export function ConfidenceMeter({
  status = "MÄTT",
  value,
  max = 100,
  label,
  className,
}: {
  status?: "MÄTT" | "METODMÅL";
  value: number;
  max?: number;
  label?: string;
  className?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={cn("ak1a-confidence-meter", className)} data-status={status}>
      <div className="ak1a-confidence-meter__header">
        <span>{label || `${status}-konfidens`}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="ak1a-confidence-meter__track">
        <div
          className="ak1a-confidence-meter__fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* 7. SourceLink — källhänvisningar som footnotes */
export function SourceLink({
  number,
  href,
  source,
  className,
}: {
  number: number;
  href?: string;
  source?: string;
  className?: string;
}) {
  const [showPopover, setShowPopover] = React.useState(false);
  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShowPopover(true)}
      onMouseLeave={() => setShowPopover(false)}
    >
      <a
        href={href || `#source-${number}`}
        className={cn("ak1a-source-link", className)}
        onClick={(e) => {
          if (!href) e.preventDefault();
        }}
      >
        {number}
      </a>
      {showPopover && source && (
        <span
          className="absolute bottom-full left-1/2 z-50 mb-1 w-56 -translate-x-1/2 rounded-md border border-border bg-popover p-2 text-xs leading-relaxed shadow-lg"
          style={{ fontFamily: "monospace" }}
        >
          <span className="block text-[10px] text-muted-foreground mb-1">Källa {number}</span>
          {source}
        </span>
      )}
    </span>
  );
}

/* 8. InstitutionalFrame — ram med hörn-markörer + gold-divider */
export function InstitutionalFrame({
  children,
  variant = "default",
  showCorners = true,
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "cover";
  showCorners?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "ak1a-institutional-frame",
        variant === "cover" && "ak1a-institutional-frame--cover",
        className
      )}
    >
      {showCorners && (
        <>
          <span className="ak1a-institutional-frame__corner ak1a-institutional-frame__corner--tl" />
          <span className="ak1a-institutional-frame__corner ak1a-institutional-frame__corner--tr" />
          <span className="ak1a-institutional-frame__corner ak1a-institutional-frame__corner--bl" />
          <span className="ak1a-institutional-frame__corner ak1a-institutional-frame__corner--br" />
        </>
      )}
      {children}
    </div>
  );
}

/* 9. DnaBackground — subtilt 5×5 rutnät i bakgrunden */
export function DnaBackground({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("ak1a-dna-bg", className)}>
      {children}
    </div>
  );
}

/* 10. ManifestCard — kombinerar PaperCard + VerifyStamp + GoldDivider */
export function ManifestCard({
  title,
  children,
  status = "MÄTT",
  date,
  className,
}: {
  title: string;
  children: React.ReactNode;
  status?: "MÄTT" | "METODMÅL" | "PRELIMINÄR";
  date?: string;
  className?: string;
}) {
  return (
    <PaperCard accent className={className}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-serif text-base font-bold leading-tight">{title}</h3>
        <VerifyStamp status={status} date={date} />
      </div>
      <GoldDivider />
      <div className="mt-2">{children}</div>
    </PaperCard>
  );
}
