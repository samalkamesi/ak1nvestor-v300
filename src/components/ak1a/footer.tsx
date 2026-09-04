"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUp, Mail, Globe } from "lucide-react";
import { GAST_KONTEXT, MENY_REGISTER, punktSynlig } from "@/lib/meny-register";
import { HonestyTag } from "./primitives";
import { VarumarkesLogo } from "./varumarkes-logo";
import { Button } from "@/components/ui/button";

// Navigationskolumnen läses UR meny-registret (EN källa, 2026-09-03): ett
// kurerat urval av registrets viktigaste destinationer per sektion — samma
// etiketter och länkar som huvudmenyn, aldrig ett motstridande urval.
const FOOTER_URVAL = [
  "/laroplan",
  "/kurser",
  "/bibliotek",
  "/kalkylator",
  "/superanalys",
  "/analyser",
  "/dagens-pass",
  "/min-sida",
  "/medlemskap",
  "/prenumeration",
  "/blogg",
  "/om-oss",
];
const FOOTER_PUNKTER = MENY_REGISTER.flatMap((s) => s.punkter).filter(
  (p) => FOOTER_URVAL.includes(p.lank) && punktSynlig(p, GAST_KONTEXT)
);

export function Footer() {
  const [version] = React.useState("2.0");
  const [updated] = React.useState("2026-07-31");

  return (
    <footer className="mt-auto border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        {/* Manifesto block */}
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr_1.2fr_1fr]">
          <div>
            <VarumarkesLogo storlek="md" />
            <p className="mt-4 max-w-md text-sm text-muted-foreground leading-relaxed">
              Strategiska AI-organ som autonoma team — de samlas, tänker, beslutar
              och skapar mega-visioner. År av mänskligt arbete komprimeras till
              timmar. Slutsatser publicerade — know-how bevarad.
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-gold">
              Princip: Håll know-how, redovisa generöst
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Ägare
            </h4>
            <p className="mt-2 text-sm">Ak1 Apex Nexus äger AK1A Research Lab</p>
            <a
              href="https://AK1nvestor.com"
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex items-center gap-1.5 text-sm text-gold hover:underline"
            >
              <Globe className="h-3.5 w-3.5" /> https://AK1nvestor.com
            </a>
            <a
              href="mailto:info@ak1nvestor.com"
              className="mt-1 flex items-center gap-1.5 text-sm text-gold hover:underline"
            >
              <Mail className="h-3.5 w-3.5" /> info@ak1nvestor.com
            </a>
            <p className="mt-2 text-xs text-muted-foreground">
              Online (inget fysiskt huvudkontor) · Kontakt sker uteslutande via e-post.
            </p>
          </div>

          <nav aria-label="Sidfot navigation" className="grid grid-cols-2 gap-x-4 gap-y-1">
            <h4 className="col-span-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Navigation
            </h4>
            {FOOTER_PUNKTER.map((punkt) => (
              <Link
                key={punkt.lank}
                href={punkt.lank}
                className="text-left text-xs text-muted-foreground hover:text-gold transition-colors py-0.5"
              >
                {punkt.text}
              </Link>
            ))}
          </nav>

          {/* Juridik & ansvar */}
          <nav aria-label="Juridik och ansvar" className="grid grid-cols-2 gap-x-4 gap-y-1">
            <h4 className="col-span-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Juridik &amp; ansvar
            </h4>
            <Link
              href="/villkor"
              className="text-xs text-muted-foreground hover:text-gold transition-colors py-0.5"
            >
              Användarvillkor
            </Link>
            <Link
              href="/privacy-policy"
              className="text-xs text-muted-foreground hover:text-gold transition-colors py-0.5"
            >
              Integritetspolicy
            </Link>
            <Link
              href="/transparens"
              className="text-xs text-muted-foreground hover:text-gold transition-colors py-0.5"
            >
              Transparens &amp; GDPR
            </Link>
            <Link
              href="/cookiepolicy"
              className="text-xs text-muted-foreground hover:text-gold transition-colors py-0.5"
            >
              Cookiepolicy
            </Link>
            <Link
              href="/ansvar"
              className="text-xs text-muted-foreground hover:text-gold transition-colors py-0.5"
            >
              Ansvar &amp; friskrivning
            </Link>
            <Link
              href="/upphovsratt"
              className="text-xs text-muted-foreground hover:text-gold transition-colors py-0.5"
            >
              Upphovsrätt &amp; källor
            </Link>
            <Link
              href="/kallor"
              className="text-xs text-muted-foreground hover:text-gold transition-colors py-0.5"
            >
              Alla 101 källor
            </Link>
            <Link
              href="/finansiell-policy"
              className="text-xs text-muted-foreground hover:text-gold transition-colors py-0.5"
            >
              Finansiell policy
            </Link>
            <Link
              href="/?cookies=1"
              className="text-xs text-muted-foreground hover:text-gold transition-colors py-0.5"
            >
              Cookie-inställningar
            </Link>
          </nav>
        </div>

        {/* About strip */}
        <div className="mt-8 grid gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:grid-cols-3">
          <div>
            <span className="font-semibold text-foreground">METOD</span>
            <br />
            AKM1 (20 variabler) + AK1TS (teknisk)
          </div>
          <div>
            <span className="font-semibold text-foreground">KURSER</span>
            <br />
            300+ moduler i 27 kategorier {/* ur public/deep-courses.json via siffror.ts */}
          </div>
          <div>
            <span className="font-semibold text-foreground">ANALYSER</span>
            <br />
            99 sidor per bolag, 3 nivåer
          </div>
        </div>

        {/* Honesty strip */}
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border pt-6 text-xs">
          <div className="flex items-center gap-2">
            <HonestyTag kind="matt" />
            <span>300+ kurser · 99 sidor per analys</span>
          </div>
          <div className="flex items-center gap-2">
            <HonestyTag kind="metodmal" />
            <span>8 av 8 AI-organ synkrona (idag 5/8)</span>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-6 max-w-3xl text-xs text-muted-foreground leading-relaxed">
          Pedagogisk finansanalys — inte investeringsråd. Investera aldrig pengar
          du inte har råd att förlora.
        </p>

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © 2026 Ak1 Apex Nexus · Online (inget fysiskt huvudkontor) · Kontakt
            sker uteslutande via e-post.
          </p>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>
              VERSION: <span className="text-foreground font-semibold">{version}</span>
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">
              SENAST UPPDATERAD: <span className="text-foreground">{updated}</span>
            </span>
            <span className="hidden md:inline">·</span>
            <span className="hidden md:inline">
              STATUS: <span className="text-bull font-semibold">5/8 ORGAN AKTIVA</span>{" "}
              <span className="text-gold">(METODMÅL: 8/8)</span>
            </span>
            <span className="hidden md:inline">·</span>
            <span className="hidden md:inline text-foreground/80">
              ANTI-CASINO · INGA PUSH-NOTISER
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Till toppen <ArrowUp className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    </footer>
  );
}
