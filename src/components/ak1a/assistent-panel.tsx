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
import {
  lasKlientkontext as lasEkoKlientkontext,
  type EkoInsikt,
} from "@/lib/eko-koppling";
import { lasMedlem } from "@/lib/member-local";
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
 * - visar elevens optimala studietid diskret i fotraden,
 * - trådar in EKOT FRÅN EKOSYSTEMET (/api/eko — eko-koppling.ts samverkans-
 *   motor): högst tre sammanflätade insikter (tracer+kurstips, vågkarta+
 *   portfölj, quiz+veckoplan, signal-bus+notiser, Fas 2-analys) som en
 *   diskret lista ovanför fotraden. AbortController 8 s; vid motstånd
 *   vilas sektionen tyst — panelen är och förblir en kommandoyta.
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

// ── Ekot från ekosystemet (/api/eko) ─────────────────────────────────────────

/** Hämtnings-timeout för eko-API:t — sedan får ekosystemet vila tyst. */
const EKO_TIMEOUT_MS = 8000;
/** Kommandoytan förblir kommandoyta: max 3 rader ek. */
const EKO_MAX_RADER = 3;

/** Insikt ur /api/eko — saniterad klient-side (oförutsedd data → null). */
function renEkoInsikt(rå: unknown): EkoInsikt | null {
  if (!rå || typeof rå !== "object") return null;
  const i = rå as Partial<EkoInsikt>;
  if (typeof i.rubrik !== "string" || !i.rubrik.trim()) return null;
  const lank =
    typeof i.lank === "string" && /^\/(?!\/)/.test(i.lank) && i.lank.length <= 200
      ? i.lank
      : undefined;
  return {
    omrade: (["utbildning", "verktyg", "beteende", "marknad", "fas2"] as const).includes(
      i.omrade as EkoInsikt["omrade"],
    )
      ? (i.omrade as EkoInsikt["omrade"])
      : "verktyg",
    rubrik: i.rubrik.trim().slice(0, 120),
    text: typeof i.text === "string" ? i.text.trim().slice(0, 300) : "",
    kalla: typeof i.kalla === "string" ? i.kalla.trim().slice(0, 40) : "eko",
    ikon: typeof i.ikon === "string" ? i.ikon.trim().slice(0, 16) : "🧬",
    ...(lank !== undefined ? { lank } : {}),
    prioritet: typeof i.prioritet === "number" && Number.isFinite(i.prioritet) ? i.prioritet : 9,
  };
}

/**
 * Bygg /api/eko-query ur eko-kopplingens egna klientkontext (samma nycklar
 * som member-local — P8/PGD: endast SAMMANFATTAD data lämnar eleven) plus
 * ev. memberId så servern kan läsa portföljens sektorer i Supabase.
 */
function ekoQuery(): string {
  const k = lasEkoKlientkontext();
  const medlem = lasMedlem();
  const p = new URLSearchParams();
  p.set("niva", String(k.niva));
  if (k.klaraKurser.length > 0) p.set("klara", k.klaraKurser.join(","));
  if (k.streakAntal > 0) p.set("streak", String(k.streakAntal));
  if (k.aktivTidSek > 0) p.set("aktivTid", String(Math.round(k.aktivTidSek)));
  if (k.toppIntresse) p.set("toppIntresse", k.toppIntresse);
  const aktivaSpar = Object.entries(k.intresseProfil)
    .filter(([, poang]) => poang > 0)
    .map(([nyckel]) => nyckel);
  if (aktivaSpar.length > 0) p.set("intressen", aktivaSpar.join(","));
  if (k["quiz ratt"] > 0) p.set("quizRatt", String(k["quiz ratt"]));
  if (k["quiz fel"] > 0) p.set("quizFel", String(k["quiz fel"]));
  if (medlem?.id) p.set("memberId", medlem.id);
  return p.toString();
}

export function AssistentPanel() {
  const [kontext, setKontext] = useState<KlientKontext | null>(null);
  const [tidsstampel, setTidsstampel] = useState<string | null>(null);
  const [ekoInsikter, setEkoInsikter] = useState<EkoInsikt[]>([]);
  const [ekoKallsystem, setEkoKallsystem] = useState<string[]>([]);

  useEffect(() => {
    setKontext(lasKlientkontext());
    setTidsstampel(
      new Intl.DateTimeFormat("sv-SE", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
    );

    // EKOT FRÅN EKOSYSTEMET — samverkansmotorn (/api/eko) trådas in diskret:
    // elevens sammanfattade kontext som query, svaret renderas som högst tre
    // rader under panelfoten. Graceful viloläge: vid motstånd visas inget ek.
    let aktiv = true;
    try {
      const kontroll = new AbortController();
      const tidtagning = setTimeout(() => kontroll.abort(), EKO_TIMEOUT_MS);
      void fetch(`/api/eko?${ekoQuery()}`, {
        signal: kontroll.signal,
        headers: { Accept: "application/json" },
      })
        .then((r) => (r.ok ? (r.json() as Promise<unknown>) : null))
        .then((j: unknown) => {
          clearTimeout(tidtagning);
          if (!aktiv || !j || typeof j !== "object") return;
          const svar = j as { insikter?: unknown; kallsystem?: unknown };
          if (!Array.isArray(svar.insikter)) return;
          const rensade = svar.insikter
            .map(renEkoInsikt)
            .filter((i): i is EkoInsikt => i !== null)
            .slice(0, EKO_MAX_RADER);
          setEkoInsikter(rensade);
          if (Array.isArray(svar.kallsystem)) {
            setEkoKallsystem(
              svar.kallsystem
                .filter((s): s is string => typeof s === "string" && !!s.trim())
                .slice(0, 6),
            );
          }
        })
        .catch(() => {
          /* ekosystemet får vila — panelen andas vidare */
        });
    } catch {
      /* fetch-konstruktion misslyckades — tyst viloläge */
    }

    return () => {
      aktiv = false;
    };
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

        {/* ── Ekot från ekosystemet — samverkansmotorn, DISKRET ──
            Högst tre rader: ikon + rubrik (länkad om motorn gav en dörr) +
            enradig text. Källsystemen redovisas ärligt i fotraden. Tom vid
            viloläge — kommandoytan förblir en kommandoyta. */}
        {ekoInsikter.length > 0 && (
          <div className="mt-4 border-t border-gold/15 pt-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8C766]/70">
              Ekot från ekosystemet
            </p>
            <ul className="mt-2 space-y-1.5">
              {ekoInsikter.map((i) => {
                const rad = (
                  <span className="flex min-w-0 items-start gap-2">
                    <span className="mt-px shrink-0 text-sm leading-none" aria-hidden="true">
                      {i.ikon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-[#EDE6D6]">
                        {i.rubrik}
                      </span>
                      {i.text && (
                        <span className="block truncate text-[11px] leading-snug text-[#EDE6D6]/60">
                          {i.text}
                        </span>
                      )}
                    </span>
                    <span
                      className="shrink-0 self-center rounded border border-gold/20 bg-gold/5 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-[#E8C766]/80"
                      title={`Född ur ${i.kalla} — ingen enskild källa ser detta ensam`}
                    >
                      {i.kalla}
                    </span>
                  </span>
                );
                return (
                  <li key={`${i.rubrik}-${i.kalla}`}>
                    {i.lank ? (
                      <Link href={i.lank} className="group block rounded-lg px-2 py-1.5 transition-colors hover:bg-gold/10">
                        {rad}
                      </Link>
                    ) : (
                      <div className="px-2 py-1.5">{rad}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            {ekoKallsystem.length > 0 && (
              <p className="mt-1.5 px-2 text-[10px] leading-snug text-[#EDE6D6]/45">
                {ekoKallsystem.join(" + ")} samtalade fram ovan — pedagogiskt ek, inte råd.
              </p>
            )}
          </div>
        )}

        {/* ── Optimal studietid — diskret fotrad ── */}
        <p className="mt-4 border-t border-gold/15 pt-3 text-[11px] leading-snug text-[#EDE6D6]/60">
          <span aria-hidden="true">🕰️</span> Din finaste studietid: {optimalTid}
        </p>
      </div>
    </section>
  );
}
