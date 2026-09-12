"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { lasBevakning, skrivBevakning } from "@/lib/medlem-bevakning-klient";

/**
 * ANALYS-NAVET (Våg 104, STYRELSE-PORTAL-MEGA.md: "Analyserna i navet") —
 * portalens analysyta på Min Sida: de senaste analyserna ur biblioteket +
 * "Din bevakning" per konto (system_events via /api/medlem/bevakning).
 *
 * Kopplingen våg 104 begär — bevakat bolag → aktuell analys → relaterad
 * kurs — bärs av tre ytor: bevakningskortet länkar in i analysen, fotraden
 * längar metoden (AKM1-modellen + våglärans hierarki — kurserna bakom
 * ALLA analyser, därför alltid sanna), och ☆ på ett analyskort bevakar
 * bolaget utan att lämna dashboarden.
 *
 * DESIGN (våg 105:s KO-regler): marin-familjens FASTA palett — panel
 * #0E1B2E, kort #101b2b, djup #081120, cream #EDE6D6, guld #E8C766 —
 * ALDRIG temavariabler inuti marin-panelen. Tryckytor ≥ 44 px, flex-wrap.
 *
 * Analysens slutsatser visas ALDRIG uppmanande: biblioteket är studie-
 * material ("så läser du en analys"), bevakningen är en läsningslista.
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Metadata om en analys — mappas på SERVERN ur getAnalyses() (disk, ingen cache). */
export type AnalysKortInfo = {
  ticker: string;
  company: string;
  sector: string;
  datum: string;
  status: string;
};

/** Metodkurserna bakom varje analys (KURSREGISTER-slug:ar) — fotradens länkar. */
const METOD_KURSER = [
  { slug: "akm1-den-kontroversiella-modellen", text: "AKM1-modellen — 20 variabler" },
  { slug: "ak1ts-vaglarans-hierarki", text: "Våglärans hierarki" },
] as const;

export function AnalysNavet({
  analyser,
  inloggad,
}: {
  /** Biblioteket, senaste först (servern sorterar) — tomt ⇒ sektionen tystnar. */
  analyser: readonly AnalysKortInfo[];
  /** Portalens sessionsbeslut (true ⇒ hämta bevakningen; gäst ⇒ ingen extra rundtur). */
  inloggad: boolean;
}) {
  const [bevakade, setBevakade] = useState<string[] | null>(null);
  const [felText, setFelText] = useState("");

  useEffect(() => {
    if (!inloggad) return;
    let aktiv = true;
    lasBevakning()
      .then((svar) => {
        if (aktiv) setBevakade(svar.inloggad ? svar.tickers : []);
      })
      .catch(() => {
        if (aktiv) setBevakade([]);
      });
    return () => {
      aktiv = false;
    };
  }, [inloggad]);

  /** Slå på/av bevakning — optimistic update, tillbakarullning vid fel. */
  const toggl = useCallback(
    async (ticker: string, pa: boolean) => {
      if (bevakade === null) return;
      const förra = bevakade;
      setBevakade(pa ? [...new Set([...förra, ticker])].sort() : förra.filter((t) => t !== ticker));
      const svar = await skrivBevakning(ticker, pa);
      if (!svar.ok) {
        setBevakade(förra);
        setFelText(svar.fel);
      } else {
        setFelText("");
      }
    },
    [bevakade],
  );

  if (analyser.length === 0) return null;

  const senaste = analyser.slice(0, 3);
  const bevakningsKort = (bevakade ?? [])
    .map((t) => analyser.find((a) => a.ticker === t))
    .filter((a): a is AnalysKortInfo => a !== undefined);
  const arBevakad = (ticker: string) => (bevakade ?? []).includes(ticker);

  return (
    <section
      aria-label="Analyser i portalen"
      className="overflow-hidden rounded-3xl border border-[#EDE6D6]/15 bg-[#0E1B2E] text-[#EDE6D6]"
    >
      {/* Senaste analyserna — bibliotekets front mot dashboarden */}
      <div className="border-b border-[#EDE6D6]/10 p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#E8C766]">
              AK1A Research Lab · Analyserna
            </p>
            <h2 className="mt-1.5 font-serif text-xl font-bold tracking-tight sm:text-2xl">
              Senaste analyserna
            </h2>
          </div>
          <Link
            href="/analyser"
            className="min-h-[44px] self-center rounded-lg border border-[#EDE6D6]/30 px-4 py-2 text-sm font-semibold text-[#EDE6D6] transition-colors hover:bg-[#EDE6D6]/10 active:scale-[0.98]"
          >
            Hela biblioteket →
          </Link>
        </div>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#EDE6D6]/75">
          Varje analys är studiematerial i metodiken — pedagogisk finansanalys,
          inte investeringsråd.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {senaste.map((a) => (
            <div key={a.ticker} className="flex flex-col rounded-xl bg-[#101b2b] p-4">
              <Link
                href={`/analyser/${encodeURIComponent(a.ticker)}`}
                className="group min-h-[44px] flex-1 transition-transform hover:translate-x-0.5"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#EDE6D6]/75">{a.sector}</p>
                <p className="mt-1 font-serif text-lg font-bold leading-snug">{a.company}</p>
                <p className="mt-0.5 text-xs text-[#EDE6D6]/75">
                  {a.ticker} · {a.datum}
                </p>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#EDE6D6]/75">{a.status}</p>
                <p className="mt-2 text-xs font-semibold text-[#E8C766]">Läs analysen →</p>
              </Link>
              {inloggad ? (
                <button
                  type="button"
                  onClick={() => toggl(a.ticker, !arBevakad(a.ticker))}
                  aria-pressed={arBevakad(a.ticker)}
                  aria-label={
                    arBevakad(a.ticker)
                      ? `Sluta bevaka ${a.company} (${a.ticker})`
                      : `Bevaka ${a.company} (${a.ticker})`
                  }
                  className="mt-3 flex min-h-[44px] items-center gap-2 rounded-lg border border-[#EDE6D6]/20 px-3 py-2 text-xs font-semibold text-[#EDE6D6] transition-colors hover:border-[#E8C766]/50 active:scale-[0.98]"
                >
                  <span aria-hidden="true" className={arBevakad(a.ticker) ? "text-[#E8C766]" : ""}>
                    {arBevakad(a.ticker) ? "★" : "☆"}
                  </span>
                  {arBevakad(a.ticker) ? "Bevakas" : "Bevaka"}
                </button>
              ) : (
                <Link
                  href="/logga-in"
                  className="mt-3 flex min-h-[44px] items-center gap-2 rounded-lg border border-[#EDE6D6]/20 px-3 py-2 text-xs font-semibold text-[#EDE6D6] transition-colors hover:border-[#E8C766]/50 active:scale-[0.98]"
                >
                  <span aria-hidden="true">☆</span>
                  Bevaka — kräver konto
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Din bevakning — per konto (system_events), navigate-vidare-vägg */}
      <div aria-label="Din bevakning" className="p-5 sm:p-6">
        <h3 className="font-serif text-lg font-bold tracking-tight">Din bevakning</h3>
        {!inloggad ? (
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#EDE6D6]/75">
            Med ett konto kan du bevaka bolag i analysbiblioteket och följa deras
            analyser här — din läsningslista på dashboarden.{" "}
            <Link href="/logga-in" className="font-semibold text-[#E8C766] underline underline-offset-2">
              Logga in
            </Link>
          </p>
        ) : bevakade === null ? (
          <div className="mt-3 h-10 animate-pulse rounded-xl bg-[#101b2b]" aria-hidden="true" />
        ) : bevakningsKort.length === 0 ? (
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#EDE6D6]/75">
            Du bevakar inga bolag ännu — tryck ☆ på en analys ovan så hamnar den
            här, redo att följa upp.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {bevakningsKort.map((a) => (
              <li key={a.ticker} className="rounded-xl bg-[#101b2b] p-3">
                <div className="flex items-center justify-between gap-3">
                  <Link
                    href={`/analyser/${encodeURIComponent(a.ticker)}`}
                    className="group flex min-h-[44px] min-w-0 flex-1 flex-col justify-center transition-transform hover:translate-x-0.5"
                  >
                    <span className="truncate text-sm font-semibold">
                      {a.company} <span className="text-[#EDE6D6]/60">· {a.ticker}</span>
                    </span>
                    <span className="text-[11px] text-[#EDE6D6]/75">
                      Analys {a.datum} · {a.sector}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggl(a.ticker, false)}
                    aria-label={`Ta bort ${a.company} (${a.ticker}) ur bevakningen`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#EDE6D6]/20 text-[#EDE6D6]/75 transition-colors hover:border-[#E8C766]/50 hover:text-[#E8C766] active:scale-[0.98]"
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {felText !== "" && (
          <p role="alert" className="mt-3 text-xs font-semibold text-[#E8C766]">
            {felText}
          </p>
        )}

        {/* Fotraden: metodkurserna — kopplingen analys → relaterad kurs */}
        <p className="mt-5 border-t border-[#EDE6D6]/10 pt-4 text-[11px] leading-relaxed text-[#EDE6D6]/75">
          Så går analyserna till — fördjupa metoden:{" "}
          {METOD_KURSER.map((k, i) => (
            <span key={k.slug}>
              {i > 0 && " · "}
              <Link
                href={`/kurser/${k.slug}`}
                className="font-semibold text-[#E8C766] underline underline-offset-2"
              >
                {k.text}
              </Link>
            </span>
          ))}
          .
        </p>
      </div>
    </section>
  );
}
