"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  kraverFas,
  harFas2Access,
  harFas3Access,
  arAdmin,
  aktiveraFas2Override,
  fas2LockeradText,
  fas3LockeradText,
} from "@/lib/kurs-access";

/**
 * Fas2Gate — TVÅFAS-GATE (exportnamnet Fas2Gate bevaras för bakåtkompabilitet).
 * Avgörs av kraverFas(slug):
 *  - fas 0 (gratis, Fas 1): renderar barnen direkt — en no-op.
 *  - fas 2 (harFas2Access öppnar): den fundamentala vägen till oberoende
 *    analytiker + chansen att representera AK1nvestor.
 *  - fas 3 (harFas3Access öppnar — fas3-medlem öppnar ALLT): det dynamiska
 *    ekosystemet — AKM1 × AK1TS, mästar-TA, psykologi, dashboard + AI.
 * Samma mönster som KursGate: SSR/first paint visar innehållet, efter
 * montering avgörs åtkomsten lokalt (ak1a-member → member_type).
 *
 * Pedagogik (pedagogik.ts): eleven FÅR se vad som väntar — kurskort med
 * titel, kapitel, XP och första kapitlets intro. Inbjudan vidare när eleven
 * är redo, aldrig ett stopp. Fas 1 förblir gratis, för alltid.
 */
export function Fas2Gate({
  slug,
  titel,
  kapitel,
  xp,
  intro,
  children,
}: {
  slug: string;
  titel: string;
  kapitel: number;
  xp?: number;
  intro?: string;
  children: React.ReactNode;
}) {
  // Rent Set-uppslag (SSR-säkert) — 0 = gratis, 2/3 = lås bakom respektive fas
  const fas = kraverFas(slug);
  const fas3 = fas === 3;
  const [access, setAccess] = useState<boolean | null>(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setAdmin(arAdmin());
    // fas3-medlem öppnar ALLT (supermängd i kurs-access.ts), men en fas2-medlem
    // öppnar bara fas 2 — fas 3-kurser förblir en inbjudan vidare.
    setAccess(fas3 ? harFas3Access() : harFas2Access());
  }, [fas3, slug]);

  // Fas 0 (gratis), SSR/first paint samt de med åtkomst: innehållet (samma som KursGate)
  if (fas === 0 || access === null || access) return <>{children}</>;

  const lasUpp = () => {
    aktiveraFas2Override(); // admin-override öppnar BÅDA faserna lokalt
    setAccess(true);
  };

  // Fas 3-accent: ljus koppar (#D9A066 = 7.5:1 mot marin) — skiljer ekosystemet från Fas 2:s guld
  const accentText = fas3 ? "text-[#D9A066]" : "text-gold";
  const chipKlass = fas3
    ? "rounded-full border border-[#B07A3C]/50 bg-[#B07A3C]/10 px-3 py-1 font-medium text-[#D9A066]"
    : "rounded-full border border-[#E8C766]/40 bg-[#E8C766]/10 px-3 py-1 font-medium text-gold";

  return (
    <section
      className={`marin-panel relative mt-10 overflow-hidden rounded-3xl border-2 p-6 text-center shadow-xl sm:p-10 ${
        fas3 ? "border-[#B07A3C]/60" : "border-gold/50"
      }`}
      aria-label={fas3 ? "Fas 3-kurs — inbjudan vidare" : "Fas 2-kurs — inbjudan vidare"}
    >
      {/* Lås-visualisering */}
      <p className="text-5xl" aria-hidden>
        🔒
      </p>
      <h2 className="mt-4 font-serif text-2xl font-bold leading-tight text-[#EDE6D6] sm:text-3xl">
        {fas3 ? "Fas 3 — det dynamiska ekosystemet" : "Fas 2 — den fundamentala vägen"}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#EDE6D6]/75">
        {fas3 ? (
          <>
            Välkommen vidare när du är redo. I Fas 3 börjar fundamentalanalysen röra
            sig — värde möter vågor, kapitel för kapitel. Nedan ser du exakt vad som
            väntar — innehållet stänger vi aldrig in, vi bjuder in till det.
          </>
        ) : (
          <>
            Välkommen vidare när du är redo. Fas 2 är den snabba fundamentala vägen
            till oberoende analytiker — och chansen att få representera AK1nvestor
            med kvalitet. Nedan ser du exakt vad som väntar — innehållet stänger vi
            aldrig in, vi bjuder in till det.
          </>
        )}
      </p>

      {/* SE KORTET — eleven får se vad som finns */}
      <div
        className={`mx-auto mt-8 max-w-2xl rounded-2xl border bg-[#081120]/60 p-5 text-left sm:p-6 ${
          fas3 ? "border-[#B07A3C]/40" : "border-[#E8C766]/30"
        }`}
      >
        <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${accentText}`}>
          Kurskortet — en blick på resan
        </p>
        <h3 className="mt-2 font-serif text-xl font-bold text-[#EDE6D6]">{titel}</h3>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className={chipKlass}>📖 {kapitel} kapitel</span>
          {xp ? <span className={chipKlass}>⚡ {xp} XP</span> : null}
          <span className={chipKlass}>🎓 Fas {fas}-kurs</span>
        </div>
        {intro && (
          <p
            className={`mt-4 border-l-2 pl-4 text-sm italic leading-relaxed text-[#EDE6D6]/80 ${
              fas3 ? "border-[#B07A3C]/60" : "border-[#E8C766]/50"
            }`}
          >
            {intro}
          </p>
        )}
      </div>

      {/* VARFÖR FAS 2/3 — varför detta är nästa analytiska fas */}
      <div className="mx-auto mt-6 max-w-2xl text-left">
        <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${accentText}`}>
          Varför Fas {fas}?
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[#EDE6D6]/90">
          {fas3 ? fas3LockeradText(slug) : fas2LockeradText(slug)}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          href={fas3 ? "/fas3" : "/fas2-ansok"}
          className="btn-guld-signatur inline-block px-8 py-3.5 text-sm"
        >
          {fas3 ? "Till Fas 3 — ekosystemet →" : "Ansök till Fas 2 →"}
        </Link>
        {fas3 ? (
          <p className="max-w-xl text-xs leading-relaxed text-[#EDE6D6]/70">
            Fas 3 innehåller alla framtida utvecklingar — dashboard, AI-koppling och
            rapporter. Efter utbildningen kan ekosystemet fortsätta nyttjas via månadsplan.
          </p>
        ) : (
          <p className="text-xs text-[#EDE6D6]/70">
            Fas 1 förblir gratis — alltid.{" "}
            <Link href="/kurser" className="underline hover:text-[#EDE6D6]">
              Hela gratis-biblioteket
            </Link>{" "}
            väntar tills vidare, och det förblir så.
          </p>
        )}
      </div>

      {/* ADMIN-BONUS — lokal upplåsning för granskning (öppnar båda faserna) */}
      {admin && (
        <div className="mt-6 border-t border-[#E8C766]/20 pt-5">
          <button
            onClick={lasUpp}
            className="btn-marin px-5 py-2 text-xs"
            title="Sätter ak1a-fas2-override=true i localStorage"
          >
            Lås upp (admin)
          </button>
        </div>
      )}
    </section>
  );
}
