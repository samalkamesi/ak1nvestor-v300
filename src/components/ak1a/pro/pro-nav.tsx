"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * PRO-NAV — AK1A PRO:s egen B2B-navigation (B2B-BESLUT §3.1/K4, våg 61).
 *
 * EN B2B-nav, inte två: cockpiten är INNEHÅLLET i vyerna, inte egna rutter.
 * Fem fasta håll i rådgivarens arbetsordning (b3 §DEL 4):
 *
 *   /pro           Översikt — morgonronden (steg 3)
 *   /pro/klienter  Klienter — klientvy + mötespaket på demoklient (steg 4)
 *   /pro/analys    Analys — screening med sparade filter + CSV-import (steg 3)
 *   /pro/rapporter Rapportverkstan — print-först, white-label (steg 4)
 *   /pro/priser    Priser — långsida ur #priser-ankaret (steg 4)
 *
 * FORBUD 8 (B2B-BESLUT §6): naven länkar ALDRIG till LÄRA/PRAKTIK/kurser/
 * kalkylatorer — privata destinationer förekommer inte här, och privata
 * menyer renderas aldrig i PRO-skalet. Aktiv vy markeras med aria-current.
 */

/** Fem rutter — namnkonflikt mot privat /rapporter löst med etiketten
 *  "Rapportverkstan" (b2 §2.3, K4). */
export const PRO_RUTTER = [
  { href: "/pro", namn: "Översikt" },
  { href: "/pro/klienter", namn: "Klienter" },
  { href: "/pro/analys", namn: "Analys" },
  { href: "/pro/rapporter", namn: "Rapportverkstan" },
  { href: "/pro/priser", namn: "Priser" },
] as const;

export function ProNav({ mobil = false }: { mobil?: boolean }) {
  const pathname = usePathname();

  /** /pro är aktiv ENBART på exakt /pro (annars slår den alla syskonrutter). */
  const arAktiv = (href: string) =>
    href === "/pro" ? pathname === "/pro" : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      aria-label="AK1A PRO — B2B-navigation"
      className={cn(
        mobil
          ? "flex gap-x-5 gap-y-1 overflow-x-auto pb-0.5 text-xs"
          : "hidden items-center gap-6 text-xs lg:flex"
      )}
    >
      {PRO_RUTTER.map((r) => {
        const aktiv = arAktiv(r.href);
        return (
          <Link
            key={r.href}
            href={r.href}
            aria-current={aktiv ? "page" : undefined}
            className={cn(
              "whitespace-nowrap transition-colors",
              aktiv
                ? "font-bold text-[#E8C766] underline decoration-[#E8C766]/60 underline-offset-4"
                : "text-[#EDE6D6]/80 hover:text-[#E8C766]"
            )}
          >
            {r.namn}
          </Link>
        );
      })}
    </nav>
  );
}
