"use client";

import * as React from "react";
import { Eyebrow, GoldRule } from "@/components/ak1a/primitives";
import { ClientPortal } from "@/components/ak1a/client-portal";

/* ============================================================
 *  AK1A Research Lab — Portal Section
 *  ----------------------------------------------------------
 *  Wraps the ClientPortal component with section header styling
 *  matching the editorial paper-textured look of other sections.
 * ============================================================ */

export function PortalSection() {
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
            <Eyebrow>◆ MIN PORTAL ◆</Eyebrow>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Din portfölj. Vår analys.
              <span className="block text-gold">Tillsammans vid bordet.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Skicka in din portfölj. En analytiker gör en full manuell
              Elliott-vågsanalys — fem tidshorisonter, innehav för innehav. Du
              får en pedagogisk analys, som om vi satt bredvid dig. Boka en 15
              eller 30 minuters genomgång när du vill gå djupare.
            </p>
            <GoldRule className="mt-8 max-w-xs" />
          </div>
        </div>
      </section>

      {/* ───────────── PORTAL ───────────── */}
      <section className="border-b border-border">
        <ClientPortal />
      </section>
    </div>
  );
}
