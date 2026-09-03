"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ekosystemPuls,
  markeraOmtankeVisad,
  omtankeTillaten,
  type EkosystemPuls,
  type OmtankeAtgard,
} from "@/lib/omtanke-motor";

/**
 * DIN VÄGVISARE — omtanke-motorns varma röst i dashboarden.
 *
 * MONTERING av det redan byggda nervsystemet (src/lib/omtanke-motor.ts):
 * tidigare nådde ekosystemPuls() bara notis-klockan (genereraAutomatiskaNotiser
 * i notis-centret). Vägvisaren lyfter mentorns fråga in i det inloggade
 * flödet — som ett kort bredvid medlemmen, ALDRIG som ett modalt avbrott.
 *
 * 100x-SNABBHET: ekosystemPuls() är en helt synkron LOKAL läsning av
 * localStorage (tracer, chat-minne, medlemsdata) — under en millisekund,
 * noll nätverksanrop. Hela tillståndsanalysen ("vad behöver medlemmen just
 * nu?") görs om vid varje pulsslag: vid montering och var 60:e sekund.
 * Det är 100x snabbare än någon serverrunda — systemet vet läget innan
 * medlemmen hinner blinka.
 *
 * TILLSTÅNDSHANTERING (motorn konsumeras, ändras aldrig):
 *  1. Varje pulsslag: ekosystemPuls() → åtgärd ELLER harmoni (null).
 *  2. Åtgärdskortet visas bara om motorns 24h-cooldown (omtankeTillaten)
 *     tillåter — max en omsorgsfråga per dag, aldrig påträngande.
 *  3. "Tack, inte nu" → markeraOmtankeVisad() + göm (cooldown börjar).
 *     Även besvarade frågor (länk/chat) markerar cooldown: en fråga som
 *     fått svar återvisas inte inom 24 h — samma princip som motorn.
 *  4. Harmoni → inget kort (tystnad är omtanke); istället en diskret
 *     puls-indikator byggd ur puls.system-hälsopoängen.
 *
 * AI-Mentorn öppnas via etablerade mönstret (min-sida.tsx, dagens-pass.tsx):
 * ett programmatiskt klick på chatt-widgetens trigger-knapp.
 */

/** Pulsslag var 60:e sekund — samma takt som Kroppsvyn (Vercel Hobby: poll). */
const PULS_INTERVALL_MS = 60_000;

/** Öppnar den globalt monterade AI-mentorn (chatt-widgeten i layouten). */
function oppnaMentorn() {
  const knapp = document.querySelector<HTMLButtonElement>('button[aria-label="AI-Mentor"]');
  knapp?.click();
}

/** Hälsopoäng ur pulsen: antalet vakande system (0–4). */
function halsopoang(system: EkosystemPuls["system"]): number {
  return [system.tracerAktiv, system.mentorMinneAktivt, system.profilSvarad, system.medlemAktiv].filter(
    Boolean,
  ).length;
}

export function Vagvisare() {
  const [atgard, setAtgard] = useState<OmtankeAtgard | null>(null);
  const [system, setSystem] = useState<EkosystemPuls["system"] | null>(null);
  const [avfardad, setAvfardad] = useState(false);
  const [intradde, setIntradde] = useState(false);

  useEffect(() => {
    let aktiv = true;

    // Ett hjärtslag: lokal läsning (<1 ms), härleder omsorgsläget just nu.
    const slag = () => {
      try {
        const p = ekosystemPuls();
        if (!aktiv) return;
        setSystem(p.system);
        // Cooldown-respekten avgörs i pulsslaget, inte i render — samma
        // regel som notis-centret: motorn frågar max en gång per 24 h.
        setAtgard(p.omtanke && omtankeTillaten() ? p.omtanke : null);
      } catch {
        /* omtanke-lagret får aldrig bryta dashboarden */
      }
    };

    slag();
    // Mjuk fade-in först när pulsen slagit (inget hopp i flödet).
    const raf = requestAnimationFrame(() => {
      if (aktiv) setIntradde(true);
    });
    const timer = setInterval(slag, PULS_INTERVALL_MS);

    return () => {
      aktiv = false;
      cancelAnimationFrame(raf);
      clearInterval(timer);
    };
  }, []);

  /** Medlemmen svarade på frågan → 24h-cooldown + göm (älskvärt tyst). */
  function besvarad() {
    markeraOmtankeVisad();
    setAvfardad(true);
  }

  // Före första pulsslaget: tystnad (inget att visa, ingen layout-shift).
  if (!system) return null;

  // ── HARMONI (eller nyligen besvarad): tystnad är omtanke — men den
  // lilla puls-indikatorn visar att ekosystemet vakar. ──
  if (!atgard || avfardad) {
    const friska = halsopoang(system);
    return (
      <p
        aria-live="polite"
        className={`flex items-center gap-2 text-[11px] text-muted-foreground transition-opacity duration-700 ${
          intradde ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-gold/60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
        </span>
        Ekosystemet vakar · {friska >= 4 ? "alla system mår" : `${friska} av 4 system vakar`}
      </p>
    );
  }

  // ── ÅTGÄRD: mentorns varma kort — i flödet, aldrig modalt ──
  return (
    <section
      aria-live="polite"
      className={`relative overflow-hidden rounded-2xl border border-gold/40 bg-card p-5 shadow-sm transition-all duration-500 sm:p-6 ${
        intradde ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
      }`}
    >
      {/* Guld-kantens varma sken — subtil, aldrig skrikig */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <div className="relative flex items-start gap-4">
        <span
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-lg"
          aria-hidden="true"
        >
          🤍
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Din vägvisare</p>
          <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">{atgard.fraga}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {/* Primärt svar — medlemmen väljer själv vägen */}
            <Link
              href={atgard.lank}
              onClick={besvarad}
              className="rounded-lg bg-gold px-4 py-2.5 text-xs font-bold text-primary-foreground shadow transition-transform hover:scale-[1.02]"
            >
              {atgard.lankText} →
            </Link>
            {/* Samtal med mentorn — öppnar chatt-widgeten programmatiskt */}
            <button
              type="button"
              onClick={() => {
                besvarad();
                oppnaMentorn();
              }}
              className="rounded-lg border border-gold/40 px-4 py-2.5 text-xs font-semibold text-gold transition-colors hover:bg-gold/10"
            >
              Intressant — berätta mer 💬
            </button>
            {/* Tack, inte nu — respekteras i 24 h (motorns cooldown) */}
            <button
              type="button"
              onClick={besvarad}
              className="rounded-lg px-3 py-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Tack, inte nu
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Vagvisare;
