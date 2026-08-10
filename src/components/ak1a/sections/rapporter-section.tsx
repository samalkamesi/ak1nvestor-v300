"use client";

import * as React from "react";
import { Eyebrow, GoldRule, HonestyTag } from "@/components/ak1a/primitives";
import { ReportViewer } from "@/components/ak1a/report-viewer";

/**
 * RAPPORTER section — 99-page institutional analyses at 3 depth levels.
 * Wraps the ReportViewer with the AK1A section header styling.
 */
export function RapporterSection() {
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
            <Eyebrow>◆ RAPPORTER ◆</Eyebrow>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Institutionella analyser —{" "}
              <span className="text-gold">3 djupnivåer</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Samma 99-sidiga AK1A-rapport, tre längder. Välj snabb överblick
              på 15 sidor, detaljerad genomgång på 35 sidor, eller fullständig
              institutionell analys på 99 sidor. Varje sida reproducerbar till
              offentlig rådata.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <HonestyTag kind="matt" />
              <span className="text-xs text-muted-foreground">
                99,9 % säkerhet · 100 % rådata-garanti · 5 × 5 × 4 ramverket
              </span>
            </div>
            <GoldRule className="mt-8 max-w-xs" />
          </div>
        </div>
      </section>

      {/* ───────────── VIEWER ───────────── */}
      <ReportViewer />
    </div>
  );
}
