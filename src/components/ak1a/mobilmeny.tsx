"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { lasStreak, lasXP, niva } from "@/lib/member-local";
import {
  GAST_KONTEXT,
  MENY_REGISTER,
  lasMenyKontext,
  sektionPunkter,
  type MenyKontext,
  type MenyPunkt,
  type MenySektionId,
} from "@/lib/meny-register";
import { VarumarkesLogo } from "./varumarkes-logo";
import { InloggadKnapp } from "./inloggad-knapp";
import { SprakVaxlare } from "./sprak-vaxlare";
import { cn } from "@/lib/utils";

/**
 * MOBILMENY — fullskärms-drawer med AK1A-DNA: paper, guld, serif.
 * Hamburgerknappen syns enbart under md; drawern funkar oavsett brytpunkt.
 * Sökfältet dispatchar "ak1a:oppna-sok" (kommandopaletten lyssnar globalt).
 *
 * 2026-09-03 — bygger UR src/lib/meny-register.ts och följer forskningen
 * (data/forskning/MENYFORSKNING-2026-09-03.md §5):
 *   • Vertikal ACCORDION — endast en sektion öppen åt gången, sektionen som
 *     innehåller aktiva sidan öppnas automatiskt (progressive disclosure).
 *   • Tryckytor ≥48 px (py-3.5 + 16 px titlar) för tummar; sök överst;
 *     status-CTA (inloggning) längst ner i tumzonen.
 *   • Behörighetsfiltrering via registrets publik-nivå: medlem-ytor syns
 *     bara för inloggade, fas 2-ytor bara med åtkomst (R14).
 *   • Horisontell mobil (915×412): drawern scrollar lodrätt — inga fasta
 *     höjder som antar porträtt (R13).
 */

export function Mobilmeny() {
  const [oppad, setOppad] = useState(false);
  const [intrad, setIntrad] = useState(false); // för tonad entré-animation
  const [kontext, setKontext] = useState<MenyKontext>(GAST_KONTEXT); // SSR: gast-vyn (R16)
  const [oppenSektion, setOppenSektion] = useState<MenySektionId | null>(null);
  const [xp, setXp] = useState(0);
  const [nivaNu, setNivaNu] = useState(1);
  const [streakAntal, setStreakAntal] = useState(0);
  const pathname = usePathname();

  const stang = useCallback(() => setOppad(false), []);

  /** Aktiv sida = exakt träff eller undersida (t.ex. /kurser/… under /kurser). */
  const arAktiv = useCallback(
    (lank: string) => pathname === lank || pathname.startsWith(lank + "/"),
    [pathname]
  );

  // Registret anpassat för denna klient (meny-ytan, behörighetsfiltrerat).
  const sektioner = MENY_REGISTER.map((s) => ({
    ...s,
    punkter: sektionPunkter(s, kontext, "meny"),
  })).filter((s) => s.punkter.length > 0);

  // Läs medlemsdata + behörighet när drawern öppnas; öppna sektionen som
  // innehåller aktiva sidan (annars den första) — accordion-standard.
  useEffect(() => {
    if (!oppad) return;
    setKontext(lasMenyKontext());
    setXp(lasXP());
    setNivaNu(niva());
    setStreakAntal(lasStreak().antal);
    const aktiv = sektioner.find((s) => s.punkter.some((p) => arAktiv(p.lank)));
    setOppenSektion((nuvarande) => nuvarande ?? aktiv?.id ?? sektioner[0]?.id ?? null);
  }, [oppad]);

  // Tonad entré: vänd synlighet strax efter montering så transitionen spelas.
  useEffect(() => {
    if (!oppad) return;
    const t = setTimeout(() => setIntrad(true), 10);
    return () => clearTimeout(t);
  }, [oppad]);

  // Body-scroll-lås + Escape stänger.
  useEffect(() => {
    if (!oppad) return;
    const fore = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const tang = (e: KeyboardEvent) => e.key === "Escape" && stang();
    document.addEventListener("keydown", tang);
    return () => {
      document.body.style.overflow = fore;
      document.removeEventListener("keydown", tang);
    };
  }, [oppad, stang]);

  // Sökfältet: öppna kommandopaletten (global lyssnare) och stäng drawern.
  const oppnaSok = () => {
    window.dispatchEvent(new CustomEvent("ak1a:oppna-sok"));
    stang();
  };

  return (
    <>
      {/* Hamburgerknapp — tre linjer, syns enbart under lg */}
      <button
        type="button"
        onClick={() => {
          setOppad(true);
          setOppenSektion(null);
        }}
        aria-label="Öppna menyn"
        aria-expanded={oppad}
        className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-md text-foreground transition-colors hover:text-gold lg:hidden"
      >
        <span
          className={`h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ${
            oppad ? "translate-y-[7px] rotate-45" : ""
          }`}
        />
        <span
          className={`h-0.5 w-5 rounded-full bg-current transition-opacity duration-300 ${
            oppad ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ${
            oppad ? "-translate-y-[7px] -rotate-45" : ""
          }`}
        />
      </button>

      {/* Fullskärms-drawer — PORTAL till body: headerns backdrop-blur skapar
          en containing block som annars klipper fixed inset-0 till 56px */}
      {oppad &&
        createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Huvudmeny"
          className={`paper-texture fixed inset-0 z-[60] bg-background/98 backdrop-blur-md transition-opacity duration-300 ${
            intrad ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`mx-auto flex h-full max-w-lg flex-col overflow-y-auto px-5 pb-10 pt-4 transition-all duration-300 ${
              intrad ? "translate-y-0" : "translate-y-3"
            }`}
          >
            {/* Topprad: varumärket till vänster, stäng-knapp till höger */}
            <div className="flex items-center gap-3">
              <VarumarkesLogo href="/" onClick={stang} storlek="md" />

              <button
                type="button"
                onClick={stang}
                aria-label="Stäng menyn"
                className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gold/25 text-muted-foreground transition-colors hover:border-gold/60 hover:text-foreground"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* Guld-chips: nivå · XP · streak (egen rad så logotypen får luft) */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-bold text-gold">
                Nivå {nivaNu}
              </span>
              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-bold text-gold">
                {xp} XP
              </span>
              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-bold text-gold">
                🔥 {streakAntal}
              </span>
            </div>

            {/* Sökfält — öppnar kommandopaletten vid fokus/Enter.
                text-base (16px) hindrar iOS från auto-zoom vid fokus. */}
            <div className="relative mt-5">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Sök kurser, verktyg, sidor…"
                onFocus={oppnaSok}
                onKeyDown={(e) => e.key === "Enter" && oppnaSok()}
                className="w-full rounded-xl border border-gold/20 bg-card py-3 pl-11 pr-4 text-base text-foreground shadow-xl placeholder:text-muted-foreground focus:border-gold focus:outline-none"
              />
            </div>

            {/* ACCORDION — en sektion öppen åt gången (forskning §5).
                Panelhuvudena är marina kort med guld-serif; tryckrader under. */}
            <nav className="mt-6 space-y-3" aria-label="Mobilnavigation">
              {sektioner.map((s) => {
                const arOppen = oppenSektion === s.id;
                const innehallerAktiv = s.punkter.some((p) => arAktiv(p.lank));
                return (
                  <section
                    key={s.id}
                    className="overflow-hidden rounded-xl border border-gold/30 bg-card shadow-lg"
                  >
                    <h2>
                      <button
                        type="button"
                        onClick={() => setOppenSektion(arOppen ? null : s.id)}
                        aria-expanded={arOppen}
                        aria-controls={`mobil-meny-${s.id}`}
                        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
                      >
                        <span className="flex items-center gap-2 font-serif text-sm font-bold tracking-wide text-[#E8C766]">
                          <span aria-hidden="true">{s.ikon}</span>
                          {s.titel.toUpperCase()}
                        </span>
                        <span className="flex items-center gap-2">
                          {innehallerAktiv && (
                            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-label="Aktiv sida finns här" />
                          )}
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            className={`text-gold transition-transform duration-300 ${arOppen ? "rotate-180" : ""}`}
                            aria-hidden="true"
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </span>
                      </button>
                    </h2>

                    {/* Mjukt utfällbart innehåll (grid-template-rows-tricket) */}
                    <div
                      id={`mobil-meny-${s.id}`}
                      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                        arOppen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        {s.punkter.map((punkt, i) => (
                          <AccordionRad
                            key={punkt.lank}
                            punkt={punkt}
                            foregaende={s.punkter[i - 1]}
                            aktiv={arAktiv(punkt.lank)}
                            onStang={stang}
                          />
                        ))}
                      </div>
                    </div>
                  </section>
                );
              })}
            </nav>

            {/* Längst ner: inloggningsstatus i TUMZONEN (forskning §5).
                Fas 2-ansökan ligger som guld-rad i OM AK1A-sektionen —
                aldrig samma destination två gånger i samma vy.
                Inloggad medlem ser hälsning + Logga ut (aldrig "Logga in"
                till någon som redan är inloggad — kunddirektiv 2026-09-03). */}
            <div className="mt-auto pt-8">
              {/* Språk SV/EN/AR — samma standard som SEO-headern, över CTA:n */}
              <div className="mb-3 flex justify-center">
                <SprakVaxlare />
              </div>
              <InloggadKnapp stor />
            </div>
          </div>
        </div>
        , document.body)}
    </>
  );
}

/** Accordion-rad — avdelare renderas när punkten inleder en ny undergrupp. */
function AccordionRad({
  punkt,
  foregaende,
  aktiv,
  onStang,
}: {
  punkt: MenyPunkt;
  foregaende?: MenyPunkt;
  aktiv: boolean;
  onStang: () => void;
}) {
  const nyAvdelare = punkt.avdelare && punkt.avdelare !== foregaende?.avdelare;
  return (
    <>
      {nyAvdelare && (
        <div className="border-b border-gold/10 bg-gold/5 px-4 pb-1.5 pt-3 text-[11px] font-bold uppercase tracking-widest text-gold">
          {punkt.avdelare}
        </div>
      )}
      <Link
        href={punkt.lank}
        onClick={onStang}
        aria-current={aktiv ? "page" : undefined}
        className={cn(
          "flex items-start gap-3 border-b border-gold/10 px-4 py-3.5 text-left last:border-b-0 transition-colors hover:bg-gold/5 active:bg-gold/10",
          aktiv && "bg-gold/10",
          punkt.guldknapp && "bg-gold/10 hover:bg-gold/20"
        )}
      >
        <span className="mt-0.5 w-6 shrink-0 text-center text-xl" aria-hidden="true">
          {punkt.ikon}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block text-base font-bold",
              aktiv || punkt.guldknapp ? "text-gold" : "text-foreground"
            )}
          >
            {punkt.text}
          </span>
          {punkt.beskrivning && (
            <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">
              {punkt.beskrivning}
            </span>
          )}
        </span>
        {aktiv && (
          <span className="mt-1.5 shrink-0 text-gold" aria-hidden="true">
            ●
          </span>
        )}
      </Link>
    </>
  );
}
