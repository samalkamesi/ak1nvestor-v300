"use client";

import Link from "next/link";

import type { MedlemProgressAggregat } from "@/lib/medlem-progress-klient";

/**
 * KURS-NAVET (portal-våg 103, STYRELSE-PORTAL-MEGA.md: "Utbildningen i
 * navet" — sista biten "Mina kurser"-gridet) — medlemmens kurser på Min
 * Sida: PÅBÖRJADE (quiz-räknare per kurs + fortsätt-länk) och KLARA
 * (stjärna + repetera-länk), allt ur server-progressen (system_events —
 * ingen ny tabell). Nästa steg tipsas redan av LarvagKort nedanför —
 * navet visar DET SOM PÅGÅR och det som är AVSLUTAT.
 *
 * Inloggad men utan kurser ⇒ välkomstrad + länk in i läroplanen (lärvägs-
 * kortet bär rekommendationen — aldrig tom yta). Gäst ⇒ stillsam rad med
 * inloggningslänk (samma mönster som AnalysNavets bevakningstext).
 *
 * DESIGN (våg 105:s KO-regler): marin-familjens FASTA palett — panel
 * #0E1B2E, kort #101b2b, cream #EDE6D6, guld #E8C766 — ALDRIG tema-
 * variabler inuti marin-panelen. Tryckytor ≥ 44 px, flex-wrap.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Kursmetadata — mappas på SERVERN ur getCourseList() (disk, ingen cache). */
export type KursKortInfo = {
  slug: string;
  titel: string;
  kategori: string;
  kapitel: number;
};

/** Visa max så många kort per sektion — resten räknas ihop (aldrig oändlig vägg). */
const MAX_KORT = 6;

export function KursNavet({
  kurser,
  progress,
}: {
  /** Kursuniversumet (servern mappar — tomt ⇒ sektionen tystnar). */
  kurser: readonly KursKortInfo[];
  /** Portalens sessionsbeslut (null ⇒ gäst). */
  progress: MedlemProgressAggregat | null;
}) {
  if (kurser.length === 0) return null;

  const kursFranSlug = new Map(kurser.map((k) => [k.slug, k]));
  // Påbörjade: flest klarade quiz först (där är momentumet), lika ⇒ slug-ordning.
  const paborjade = (progress?.paborjadeKurser ?? [])
    .map((slug) => kursFranSlug.get(slug))
    .filter((k): k is KursKortInfo => k !== undefined)
    .sort((a, b) => {
      const qa = progress?.quizRatta[a.slug] ?? 0;
      const qb = progress?.quizRatta[b.slug] ?? 0;
      return qb - qa || a.slug.localeCompare(b.slug);
    });
  const klara = (progress?.klaraKurser ?? [])
    .map((slug) => kursFranSlug.get(slug))
    .filter((k): k is KursKortInfo => k !== undefined)
    .sort((a, b) => a.titel.localeCompare(b.titel));

  return (
    <section
      aria-label="Mina kurser"
      className="overflow-hidden rounded-3xl border border-[#EDE6D6]/15 bg-[#0E1B2E] text-[#EDE6D6]"
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#E8C766]">
              AK1A Research Lab · Utbildningen
            </p>
            <h2 className="mt-1.5 font-serif text-xl font-bold tracking-tight sm:text-2xl">
              Mina kurser
            </h2>
          </div>
          <Link
            href="/kurser"
            className="min-h-[44px] self-center rounded-lg border border-[#EDE6D6]/30 px-4 py-2 text-sm font-semibold text-[#EDE6D6] transition-colors hover:bg-[#EDE6D6]/10 active:scale-[0.98]"
          >
            Hela läroplanen →
          </Link>
        </div>

        {progress === null ? (
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-[#EDE6D6]/75">
            Med ett konto samlas dina påbörjade och klara kurser här — med
            quiz-räkning och stjärnor, kapitel för kapitel.{" "}
            <Link href="/logga-in" className="font-semibold text-[#E8C766] underline underline-offset-2">
              Logga in eller skapa konto
            </Link>
            .
          </p>
        ) : (
          <>
            {/* PÅBÖRJADE — momentum först: flest klarade quiz överst */}
            <div aria-label="Påbörjade kurser" className="mt-4">
              <h3 className="font-serif text-lg font-bold tracking-tight">Påbörjade</h3>
              {paborjade.length === 0 ? (
                <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#EDE6D6]/75">
                  Du har inga pågående kurser just nu — välkommen in i{" "}
                  <Link href="/kurser" className="font-semibold text-[#E8C766] underline underline-offset-2">
                    läroplanen
                  </Link>{" "}
                  eller ta emot nästa steg i ditt lärvägstips nedanför.
                </p>
              ) : (
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {paborjade.slice(0, MAX_KORT).map((k) => {
                    const ratt = progress.quizRatta[k.slug] ?? 0;
                    return (
                      <li key={k.slug} className="flex flex-col rounded-xl bg-[#101b2b] p-4">
                        <Link
                          href={`/kurser/${k.slug}`}
                          className="group min-h-[44px] flex-1 transition-transform hover:translate-x-0.5"
                        >
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[#EDE6D6]/75">
                            {k.kategori}
                          </p>
                          <p className="mt-1 font-serif text-lg font-bold leading-snug">{k.titel}</p>
                          <p className="mt-0.5 text-xs text-[#EDE6D6]/75">
                            {ratt} rätt quiz · {k.kapitel} kapitel
                          </p>
                        </Link>
                        <Link
                          href={`/kurser/${k.slug}`}
                          className="mt-3 flex min-h-[44px] items-center justify-center rounded-lg border border-[#E8C766]/40 px-3 py-2 text-xs font-semibold text-[#E8C766] transition-colors hover:bg-[#E8C766]/10 active:scale-[0.98]"
                        >
                          Fortsätt kursen →
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
              {paborjade.length > MAX_KORT && (
                <p className="mt-2 text-xs text-[#EDE6D6]/75">
                  …och {paborjade.length - MAX_KORT} till påbörjade —{" "}
                  <Link href="/kurser" className="font-semibold text-[#E8C766] underline underline-offset-2">
                    se alla i läroplanen
                  </Link>
                  .
                </p>
              )}
            </div>

            {/* KLARA — avslutade kurser med sin stjärna */}
            <div aria-label="Klara kurser" className="mt-6 border-t border-[#EDE6D6]/10 pt-4">
              <h3 className="font-serif text-lg font-bold tracking-tight">
                Klara <span className="ml-1 text-[#E8C766]">★</span>
              </h3>
              {klara.length === 0 ? (
                <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#EDE6D6]/75">
                  Ingen kurs avslutad ännu — varje avslutad kurs ger 50 XP och en
                  stjärna; de samlas här.
                </p>
              ) : (
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {klara.slice(0, MAX_KORT).map((k) => (
                    <li key={k.slug} className="rounded-xl bg-[#101b2b] p-3">
                      <Link
                        href={`/kurser/${k.slug}`}
                        className="flex min-h-[44px] items-center gap-3 transition-transform hover:translate-x-0.5"
                      >
                        <span aria-hidden="true" className="shrink-0 text-[#E8C766]">★</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{k.titel}</span>
                          <span className="block text-[11px] text-[#EDE6D6]/75">
                            {k.kategori} · repetera kapitlen
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {klara.length > MAX_KORT && (
                <p className="mt-2 text-xs text-[#EDE6D6]/75">
                  …och {klara.length - MAX_KORT} klara kurser till —{" "}
                  <Link href="/kurser" className="font-semibold text-[#E8C766] underline underline-offset-2">
                    hela läroplanen
                  </Link>
                  .
                </p>
              )}
            </div>
          </>
        )}

        {/* Fotrad: utbildningstrappan — navet visar pågående, lärvägen bär nästa steg */}
        <p className="mt-5 border-t border-[#EDE6D6]/10 pt-4 text-[11px] leading-relaxed text-[#EDE6D6]/75">
          Så byggs kunskapen: en kurs i taget, quiz för quiz — ditt nästa steg
          tipsas i{" "}
          <Link href="/kurser" className="font-semibold text-[#E8C766] underline underline-offset-2">
            läroplanen
          </Link>{" "}
          och av lärvägskortet nedanför.
        </p>
      </div>
    </section>
  );
}
