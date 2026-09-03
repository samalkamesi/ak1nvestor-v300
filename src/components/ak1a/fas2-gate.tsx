"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  kraverFas2,
  harFas2Access,
  arAdmin,
  aktiveraFas2Override,
  fas2LockeradText,
} from "@/lib/kurs-access";

/**
 * Fas2Gate — visas när en kurs kräver Fas 2 men eleven ännu inte har det.
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
  const [access, setAccess] = useState<boolean | null>(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setAccess(!kraverFas2(slug) || harFas2Access());
    setAdmin(arAdmin());
  }, [slug]);

  // SSR/first paint samt kurser utan lås och de med åtkomst: innehållet (samma som KursGate)
  if (access === null || access) return <>{children}</>;

  const lasUpp = () => {
    aktiveraFas2Override();
    setAccess(true);
  };

  return (
    <section
      className="marin-panel relative mt-10 overflow-hidden rounded-3xl border-2 border-gold/50 p-6 text-center shadow-xl sm:p-10"
      aria-label="Fas 2-kurs — inbjudan vidare"
    >
      {/* Lås-visualisering */}
      <p className="text-5xl" aria-hidden>
        🔒
      </p>
      <h2 className="mt-4 font-serif text-2xl font-bold leading-tight text-[#EDE6D6] sm:text-3xl">
        Denna kurs är en del av Fas 2 — den avancerade analysresan
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#EDE6D6]/75">
        Välkommen vidare när du är redo. Nedan ser du exakt vad som väntar —
        innehållet stänger vi aldrig in, vi bjuder in till det.
      </p>

      {/* SE KORTET — eleven får se vad som finns */}
      <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-[#E8C766]/30 bg-[#081120]/60 p-5 text-left sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
          Kurskortet — en blick på resan
        </p>
        <h3 className="mt-2 font-serif text-xl font-bold text-[#EDE6D6]">{titel}</h3>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-[#E8C766]/40 bg-[#E8C766]/10 px-3 py-1 font-medium text-gold">
            📖 {kapitel} kapitel
          </span>
          {xp ? (
            <span className="rounded-full border border-[#E8C766]/40 bg-[#E8C766]/10 px-3 py-1 font-medium text-gold">
              ⚡ {xp} XP
            </span>
          ) : null}
          <span className="rounded-full border border-[#E8C766]/40 bg-[#E8C766]/10 px-3 py-1 font-medium text-gold">
            🎓 Fas 2-kurs
          </span>
        </div>
        {intro && (
          <p className="mt-4 border-l-2 border-[#E8C766]/50 pl-4 text-sm italic leading-relaxed text-[#EDE6D6]/80">
            {intro}
          </p>
        )}
      </div>

      {/* VARFÖR FAS 2 — varför detta är nästa analytiska fas */}
      <div className="mx-auto mt-6 max-w-2xl text-left">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
          Varför Fas 2?
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[#EDE6D6]/90">
          {fas2LockeradText(slug)}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          href="/fas2-ansok"
          className="btn-guld-signatur inline-block px-8 py-3.5 text-sm"
        >
          Ansök till Fas 2 →
        </Link>
        <p className="text-xs text-[#EDE6D6]/70">
          Fas 1 förblir gratis — alltid.{" "}
          <Link href="/kurser" className="underline hover:text-[#EDE6D6]">
            Hela gratis-biblioteket
          </Link>{" "}
          väntar tills vidare, och det förblir så.
        </p>
      </div>

      {/* ADMIN-BONUS — lokal upplåsning för granskning */}
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
