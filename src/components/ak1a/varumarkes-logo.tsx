"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * VARUMÄRKES-LOGO — AK1A Research Labs enhetliga logotypstandard.
 *
 * Standard (beslutad 2026-09-01): kundens trådskulptur med kron-motiv visas i
 * en mjuk AVGRÄNSAD RUTA — rundade hörn, cream-yta #FDFBF7 (normaliserad i
 * bildfilen skulptur-mark.jpg), tunn marin ring. Rutan funkar identiskt på
 * cream-underlag (ljusläget) och marin-natt (mörkläget): skulpturens mörka
 * marin-linjer är dessutom exakt sajtens bläck-marin, så ingen omfärgning
 * behövs — det ser designat ut, inte klistrat, överallt.
 *
 * Storlekar:
 *   sm — 32px ruta (mobil-drawer, kompakta ytor)
 *   md — 40px ruta (header, footer, mobilmeny — standard)
 *   lg — 56px ruta (fel-sidor, presentation)
 *
 * medText lägger AK1A Research Lab-ordmärket bredvid i befintlig stil
 * (serif AK1 i guld + A i bläck, versal undertext, guldrad).
 */

/** Ruttillbehör per storlek — speglar primitives.tsx Ak1aLogo-dimensioner. */
const STORLEKAR = {
  sm: { ruta: "h-8 w-8 rounded-md", px: 32, ak: "text-base", sub: "text-[8px]", linje: "w-10" },
  md: { ruta: "h-10 w-10 rounded-lg", px: 40, ak: "text-xl", sub: "text-[9px]", linje: "w-14" },
  lg: { ruta: "h-14 w-14 rounded-xl", px: 56, ak: "text-3xl", sub: "text-xs", linje: "w-20" },
} as const;

export function VarumarkesLogo({
  storlek = "md",
  medText = true,
  onClick,
  href,
  prioritet = false,
  klass,
}: {
  /** Rutstorlek — sm 32px · md 40px · lg 56px. */
  storlek?: "sm" | "md" | "lg";
  /** Visa AK1A Research Lab-ordmärket bredvid rutan (standard: true). */
  medText?: boolean;
  /** Klick-handler — renderar en button. */
  onClick?: () => void;
  /** Länkmål — renderar en Link (tar precedens över onClick). */
  href?: string;
  /** next/image priority för ovantill-liggande logotyper (header). */
  prioritet?: boolean;
  /** Extra klasser på yt.behållaren. */
  klass?: string;
}) {
  const dims = STORLEKAR[storlek];

  /** Själva varumärket: skulptur-ruta + (valfritt) ordmärke. */
  const inre = (
    <>
      <span
        aria-hidden
        className={cn(
          "relative block shrink-0 overflow-hidden bg-[#FDFBF7] ring-1 ring-[#0E1B2E]/15 dark:ring-white/10",
          "shadow-[0_1px_3px_rgba(14,27,46,0.12)]",
          dims.ruta
        )}
      >
        <Image
          src="/ak1a/logo/skulptur-mark.jpg"
          alt="AK1A Research Lab — trådskulptur med krona"
          width={dims.px}
          height={dims.px}
          priority={prioritet}
          sizes={`${dims.px}px`}
          className="h-full w-full object-cover"
        />
      </span>
      {medText && (
        <span className="flex min-w-0 flex-col items-start leading-none">
          <span className="font-serif font-bold tracking-tight text-ink dark:text-foreground">
            <span className="text-gold">AK1</span>A
          </span>
          <span
            className={cn(
              "font-sans uppercase tracking-[0.2em] text-muted-foreground",
              dims.sub
            )}
          >
            Research Lab
          </span>
          <span
            className={cn(
              "mt-1 h-px bg-gradient-to-r from-gold to-transparent",
              dims.linje
            )}
          />
        </span>
      )}
    </>
  );

  const gemensamKlass = cn(
    "group flex items-center gap-2.5 select-none max-md:min-h-[52px]",
    klass
  );

  // Link när href finns (mobilmenyn vill stänga + navigera via onClick).
  if (href) {
    return (
      <Link
        href={href}
        prefetch={false}
        // prefetch={false} (o17/o41/o49-precedensen): logon är synlig i
        // viewport på varje sida ⇒ Next 16 prefetchar `/` i tre omgångar
        // (partial + full flight ≈ 12 KiB) i varje sidvisnings LCP-fönster.
        // Startsidan är force-static (klick ≈ 100–300 ms), hover-prefetch
        // lever kvar (Next 16); mätt i o50.
        onClick={onClick}
        className={gemensamKlass}
        aria-label="AK1A Research Lab — till startsidan"
      >
        {/* Brandgenomgång P3 (våg 195): ordbilden är dekor — etiketten
            bärs av aria-label, textextraktorer slipper menyskrapet. */}
        <span aria-hidden className="contents">{inre}</span>
      </Link>
    );
  }

  // Button vid klick-handler (SPA-sektionsval i headern).
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={gemensamKlass} aria-label="AK1A Research Lab — till startsidan">
        <span aria-hidden className="contents">{inre}</span>
      </button>
    );
  }

  // Statisk renderering (footer m.m.) — texten i ordmärket är skärmläsar-etiketten.
  return <span className={gemensamKlass}>{inre}</span>;
}
