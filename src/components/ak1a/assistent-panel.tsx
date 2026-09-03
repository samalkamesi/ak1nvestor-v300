"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  detekteraFrustration,
  genereraHalsning,
  raknaOptimalTid,
  raknaProaktivaForslag,
  type ProaktivtForslag,
} from "@/lib/assistent";
import { lasKlientkontext, type KlientKontext } from "@/lib/klientkontext";
import { uppmuntran } from "@/lib/pedagogik";

/**
 * DIN ASSISTENT — "den högra handen" synliggjord (Min Sida, direkt efter
 * Morgon-briefingen). En diskret marin-panel som:
 *
 * - hälsar tids- och lägesmedvetet (genereraHalsning) i pedagogik-ton,
 * - visar elevens tillstånd-badge (lästillståndet) + tidsstämpel,
 * - bjuder max 3 prioriterade, klickbara förslag under "Jag tror du
 *   vill…" — med "om jag har fel, berätta gärna" (ALDRIG påstridig),
 * - möter frustration med "en paus är också lärande" + uppmuntran("paus"),
 * - visar elevens optimala studietid diskret i fotraden.
 *
 * Hydration-säkert: deterministiskt skelett första passt; ALL lokaldata
 * (localStorage via klientkontexten) läses i useEffect — aldrig under render.
 */

/** Tillstånd-badge: resan eleven är i — aldrig ett betyg. */
const TILLSTAND_BADGE: Record<KlientKontext["lasTillstand"], { etikett: string; ikon: string }> = {
  nybörjare: { etikett: "Nyfiken nybörjare", ikon: "🌱" },
  växande: { etikett: "Växande", ikon: "🌿" },
  avancerad: { etikett: "Avancerad", ikon: "🌳" },
  "fas2-redo": { etikett: "Fas 2-redo", ikon: "🏛️" },
};

export function AssistentPanel() {
  const [kontext, setKontext] = useState<KlientKontext | null>(null);
  const [tidsstampel, setTidsstampel] = useState<string | null>(null);

  useEffect(() => {
    setKontext(lasKlientkontext());
    setTidsstampel(
      new Intl.DateTimeFormat("sv-SE", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
    );
  }, []);

  // ── Skelett under första passt (deterministiskt på server + klient) ──
  if (!kontext) {
    return (
      <section
        className="marin-panel rounded-2xl border border-gold/30 p-6 sm:p-8"
        aria-hidden="true"
      >
        <div className="h-4 w-40 animate-pulse rounded bg-gold/10" />
        <div className="mt-3 h-3 w-72 animate-pulse rounded bg-gold/10" />
        <div className="mt-5 space-y-2.5">
          <div className="h-14 w-full animate-pulse rounded-xl bg-gold/10" />
          <div className="h-14 w-11/12 animate-pulse rounded-xl bg-gold/10" />
          <div className="h-14 w-10/12 animate-pulse rounded-xl bg-gold/10" />
        </div>
      </section>
    );
  }

  const badge = TILLSTAND_BADGE[kontext.lasTillstand];
  const forslag: ProaktivtForslag[] = raknaProaktivaForslag(kontext, 3);
  const frustrerad = detekteraFrustration(kontext);
  const optimalTid = raknaOptimalTid(kontext);

  return (
    <section
      className="marin-panel relative overflow-hidden rounded-2xl border border-gold/30 p-6 sm:p-8"
      aria-labelledby="assistent-rubrik"
    >
      {/* Gravör-känsla: tunn inre guldram (som Morgon-briefingen) */}
      <div className="pointer-events-none absolute inset-2 rounded-xl border border-gold/15" aria-hidden="true" />

      <div className="relative">
        {/* ── Rubrik + tillstånd-badge + tidsstämpel ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl" aria-hidden="true">
              🤝
            </span>
            <h2
              id="assistent-rubrik"
              className="font-serif text-lg font-bold tracking-tight text-gold sm:text-xl"
            >
              Din assistent
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-bold text-gold"
              title="Ditt läge just nu — härleds ur hela din resa"
            >
              {badge.ikon} {badge.etikett}
            </span>
            {tidsstampel && (
              <span
                className="text-[11px] text-[#EDE6D6]/50"
                title="När assistenten senast läste av ditt läge"
              >
                {tidsstampel}
              </span>
            )}
          </div>
        </div>

        {/* ── Tids- + lägesmedveten hälsning ── */}
        <p className="mt-3 font-serif text-sm italic leading-relaxed text-[#EDE6D6] sm:text-base">
          &ldquo;{genereraHalsning(kontext)}&rdquo;
        </p>

        {/* ── Frustration? — paus är också lärande, aldrig påstridighet ── */}
        {frustrerad && (
          <div className="mt-4 rounded-xl border border-gold/30 bg-gold/5 p-4">
            <p className="text-sm font-bold text-[#EDE6D6]">
              🕯️ Jag ser att det är kämpigt just nu — en paus är också lärande.
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#EDE6D6]/75">{uppmuntran("paus")}</p>
          </div>
        )}

        {/* ── Proaktiva förslag: "Jag tror du vill…" (ett tips, aldrig ett tvång) ── */}
        <div className="mt-5 border-t border-gold/15 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8C766]/70">
            Jag tror du vill…
          </p>
          <ul className="mt-3 space-y-2">
            {forslag.map((f) => (
              <li key={f.lank}>
                <Link
                  href={f.lank}
                  className="group flex items-start gap-3 rounded-xl border border-gold/20 bg-card px-4 py-3 transition-all hover:border-gold/60 hover:bg-gold/10"
                >
                  <span className="mt-0.5 shrink-0 text-xl" aria-hidden="true">
                    {f.ikon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-[#EDE6D6]">{f.rubrik}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-[#EDE6D6]/70">
                      {f.text}
                    </span>
                  </span>
                  <span
                    className="shrink-0 text-sm font-semibold text-[#E8C766] transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] italic text-[#EDE6D6]/55">
            …och om jag har fel, berätta gärna — dina steg väljer du alltid själv.
          </p>
        </div>

        {/* ── Optimal studietid — diskret fotrad ── */}
        <p className="mt-4 border-t border-gold/15 pt-3 text-[11px] leading-snug text-[#EDE6D6]/60">
          <span aria-hidden="true">🕰️</span> Din finaste studietid: {optimalTid}
        </p>
      </div>
    </section>
  );
}
