"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type JSX } from "react";

import { lasBevakning } from "@/lib/medlem-bevakning-klient";
import {
  lasPortfolj,
  skrivPortfolj,
  type PortfoljHoldings,
} from "@/lib/medlem-portfolj-klient";

/**
 * PORTFÖLJ-NAVET (Våg 119, PIPELINE-KO P1) — "Min portfölj"-kortet på Min
 * Sida: bolagen medlemmen STUDERAR, per konto i system_events via
 * /api/medlem/portfolj (mönster medlem-bevakning v104). Så följer du bolagen
 * du studerar: en rad per bolag med antal och ev. inprisad kurs som studie-
 * underlag — ALDRIG värde i kronor, avkastning, vinst/förlust eller köp/sälj-
 * uppmaningar (juridikgrinden: utbildning, inte rådgivning — 2007:528).
 *
 * Gäst ⇒ stillsam inloggningsrad (AnalysNavet-mönstret); inloggad ⇒
 * hydration via lasPortfolj i useEffect med skeleton tills svaret kommer —
 * aldrig fel innehåll först. Skrivfel (t.ex. 409 full portfölj) visas som
 * serverns egen text i en aria-live-rad.
 *
 * VÅG 120 — KORSKOPPLINGEN (portal-spårets våg 106: "korskopplingar alla
 * ytor"): bevakade bolag (☆ i AnalysNavet) som ännu saknas i studielistan
 * erbjuds som one-click-rader — tryck ⇒ bolaget hamnar i portföljen utan
 * antal/kurs (fylls i senare, frivilligt). Fotraden längar metodkurserna
 * (samma always-true-koppling som AnalysNavet: kurserna bakom ALLA
 * analyser). Ringen sluten: ☆ → studielista → analys → kurs.
 *
 * DESIGN (våg 105:s KO-regler): marin-familjens FASTA palett — panel
 * #0E1B2E, kort #101b2b, cream #EDE6D6, guld #E8C766 — ALDRIG tema-
 * variabler inuti marin-panelen. Tryckytor ≥ 44 px, flex-wrap.
 */

/** Metadata om en analys — mappas på SERVERN ur getAnalyses() (disk, ingen cache). */
export type PortfoljAnalysInfo = {
  ticker: string;
  company: string;
};

/** Visa max så många holdings — resten räknas ihop (aldrig oändlig vägg). */
const MAX_SYNLIGA = 6;

/**
 * Metodkurserna bakom varje analys (KURSREGISTER-slug:ar) — speglar
 * AnalysNavets konstant: kurserna bakom ALLA analyser, därför alltid sanna
 * kopplingar (våg 104:s beslut: sektor-mappning avförd som skör).
 */
const METOD_KURSER = [
  { slug: "akm1-den-kontroversiella-modellen", text: "AKM1-modellen — 20 variabler" },
  { slug: "ak1ts-vaglarans-hierarki", text: "Våglärans hierarki" },
] as const;

/** Svenskt talformat för antal/kurs — studieunderlag, aldrig värde i kronor. */
const talFmt = new Intl.NumberFormat("sv-SE");

/** Tolka användarens taltext (komma eller punkt) — tom/ogiltig ⇒ null. */
function lasTal(text: string): number | null {
  const t = text.trim().replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function PortfoljNavet({
  analyser,
  inloggad,
}: {
  /** Analysbiblioteket — källan för namnuppslag och Lägg-till-väljaren; tomt ⇒ sektionen tystnar. */
  analyser: readonly PortfoljAnalysInfo[];
  /** Portalens sessionsbeslut (true ⇒ hämta portföljen; gäst ⇒ ingen extra rundtur). */
  inloggad: boolean;
}): JSX.Element | null {
  const [holdings, setHoldings] = useState<PortfoljHoldings[] | null>(null);
  const [legacyImporterad, setLegacyImporterad] = useState(false);
  const [bevakade, setBevakade] = useState<string[] | null>(null);
  const [felText, setFelText] = useState("");
  const [valdTicker, setValdTicker] = useState("");
  const [antalText, setAntalText] = useState("");
  const [kursText, setKursText] = useState("");

  useEffect(() => {
    if (!inloggad) return;
    let aktiv = true;
    lasPortfolj()
      .then((svar) => {
        if (!aktiv) return;
        if (svar.inloggad) {
          setHoldings(svar.holdings);
          setLegacyImporterad(svar.legacyImporterad);
        } else {
          setHoldings([]);
        }
      })
      .catch(() => {
        if (aktiv) setHoldings([]);
      });
    // Korskopplingen (våg 120): bevakningen läses parallellt — den driver
    // "bevakade bolag som saknas i studielistan" (eko-mönstret: fel ⇒ tomt).
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

  /** Ta bort ett bolag — optimistic update, tillbakarullning vid fel. */
  const taBort = useCallback(
    async (ticker: string) => {
      if (holdings === null) return;
      const förra = holdings;
      setHoldings(förra.filter((h) => h.ticker !== ticker));
      const svar = await skrivPortfolj(ticker, false);
      if (!svar.ok) {
        setHoldings(förra);
        setFelText(svar.fel);
      } else {
        setFelText("");
      }
    },
    [holdings],
  );

  /**
   * Lyft ett bevakat bolag (☆) in i studielistan — one-click, utan antal/
   * kurs (fylls i senare, frivilligt). Optimistic update + tillbakarullning,
   * samma kontrakt som taBort.
   */
  const lyftTillPortfolj = useCallback(
    async (ticker: string) => {
      if (holdings === null) return;
      const förra = holdings;
      setHoldings(
        [...förra.filter((h) => h.ticker !== ticker), { ticker, antal: null, kurs: null }],
      );
      const svar = await skrivPortfolj(ticker, true);
      if (!svar.ok) {
        setHoldings(förra);
        setFelText(svar.fel);
      } else {
        setFelText("");
      }
    },
    [holdings],
  );

  // Väljaren: analyserna sorterade på ticker; första bolaget förvalt tills användaren väljer.
  const valbara = analyser.slice().sort((a, b) => a.ticker.localeCompare(b.ticker));
  const gällandeTicker = valdTicker === "" ? (valbara[0]?.ticker ?? "") : valdTicker;

  /** Lägg till (eller uppdatera — senaste vinner) ett studerat bolag. */
  const lagTill = useCallback(async () => {
    if (holdings === null || gällandeTicker === "") return;
    const antal = lasTal(antalText);
    const kurs = lasTal(kursText);
    const svar = await skrivPortfolj(gällandeTicker, true, antal, kurs);
    if (!svar.ok) {
      setFelText(svar.fel);
      return;
    }
    setFelText("");
    setHoldings((förra) =>
      [
        ...(förra ?? []).filter((h) => h.ticker !== gällandeTicker),
        { ticker: gällandeTicker, antal, kurs },
      ].sort((a, b) => a.ticker.localeCompare(b.ticker)),
    );
    setAntalText("");
    setKursText("");
  }, [holdings, gällandeTicker, antalText, kursText]);

  if (analyser.length === 0) return null;

  const namnFranTicker = new Map(analyser.map((a) => [a.ticker, a.company]));
  const sorterade = (holdings ?? [])
    .slice()
    .sort((a, b) => a.ticker.localeCompare(b.ticker));

  // Korskopplingen: bevakade (☆) som ännu inte finns i studielistan.
  const iPortfoljen = new Set(sorterade.map((h) => h.ticker));
  const bevakadeSaknas = (bevakade ?? []).filter((t) => !iPortfoljen.has(t));

  return (
    <section
      aria-label="Min portfölj"
      className="overflow-hidden rounded-3xl border border-[#EDE6D6]/15 bg-[#0E1B2E] text-[#EDE6D6]"
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#E8C766]">
              AK1A Research Lab · Portföljen
            </p>
            <h2 className="mt-1.5 font-serif text-xl font-bold tracking-tight sm:text-2xl">
              Min portfölj
            </h2>
          </div>
          <Link
            href="/analyser"
            className="min-h-[44px] self-center rounded-lg border border-[#EDE6D6]/30 px-4 py-2 text-sm font-semibold text-[#EDE6D6] transition-colors hover:bg-[#EDE6D6]/10 active:scale-[0.98]"
          >
            Biblioteket →
          </Link>
        </div>

        {!inloggad ? (
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-[#EDE6D6]/75">
            Med ett konto samlas bolagen du studerar här — din utbildningsportfölj
            med antal och kurs som studieunderlag, rad för rad.{" "}
            <Link href="/logga-in" className="font-semibold text-[#E8C766] underline underline-offset-2">
              Logga in eller skapa konto
            </Link>
            .
          </p>
        ) : holdings === null ? (
          <div className="mt-3 h-10 animate-pulse rounded-xl bg-[#101b2b]" aria-hidden="true" />
        ) : (
          <>
            {/* Holdingslistan — bolagen jag studerar, aldrig värde i kronor */}
            {legacyImporterad && (
              <p className="mt-3 max-w-2xl text-xs leading-relaxed text-[#EDE6D6]/75">
                Din portfölj importerades från det tidigare systemet — alla bolag
                ligger nu samlade här.
              </p>
            )}
            {sorterade.length === 0 ? (
              <p className="mt-3 max-w-2xl text-xs leading-relaxed text-[#EDE6D6]/75">
                Din utbildningsportfölj är tom — lägg till bolaget du studerar
                för att följa din analysresa.
              </p>
            ) : (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {sorterade.slice(0, MAX_SYNLIGA).map((h) => {
                  const namn = namnFranTicker.get(h.ticker) ?? h.ticker;
                  return (
                    <li key={h.ticker} className="rounded-xl bg-[#101b2b] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <Link
                          href={`/analyser/${encodeURIComponent(h.ticker)}`}
                          className="flex min-h-[44px] min-w-0 flex-1 flex-col justify-center transition-transform hover:translate-x-0.5"
                        >
                          <span className="truncate text-sm font-semibold">
                            {namn} <span className="text-[#EDE6D6]/60">· {h.ticker}</span>
                          </span>
                          <span className="text-[11px] text-[#EDE6D6]/75">
                            {h.antal !== null ? `${talFmt.format(h.antal)} aktier` : "antal ej angivet"}
                            {h.kurs !== null ? ` · kurs ${talFmt.format(h.kurs)}` : ""}
                          </span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => taBort(h.ticker)}
                          aria-label={`Ta bort ${namn} (${h.ticker}) ur portföljen`}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#EDE6D6]/20 text-[#EDE6D6]/75 transition-colors hover:border-[#E8C766]/50 hover:text-[#E8C766] active:scale-[0.98]"
                        >
                          <span aria-hidden="true">✕</span>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {sorterade.length > MAX_SYNLIGA && (
              <p className="mt-2 text-xs text-[#EDE6D6]/75">
                …och {sorterade.length - MAX_SYNLIGA} bolag till i studielistan —{" "}
                <Link href="/analyser" className="font-semibold text-[#E8C766] underline underline-offset-2">
                  se alla i biblioteket
                </Link>
                .
              </p>
            )}

            {/* Korskopplingen (våg 120): bevakade (☆) → studielistan, one-click */}
            {bevakade !== null && bevakadeSaknas.length > 0 && (
              <div className="mt-4 rounded-xl bg-[#101b2b] p-4">
                <p className="text-xs font-semibold">
                  Bevakade bolag som saknas i studielistan
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {bevakadeSaknas.map((t) => {
                    const namn = namnFranTicker.get(t) ?? t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => void lyftTillPortfolj(t)}
                        aria-label={`Lägg till ${namn} (${t}) i portföljen`}
                        className="flex min-h-[44px] items-center gap-2 rounded-lg border border-[#EDE6D6]/20 px-3 py-2 text-xs font-semibold text-[#EDE6D6] transition-colors hover:border-[#E8C766]/50 hover:text-[#E8C766] active:scale-[0.98]"
                      >
                        <span aria-hidden="true" className="text-[#E8C766]">+</span> {t}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-[#EDE6D6]/75">
                  Tryck på en ticker — bolaget hamnar i listan ovan utan antal eller
                  kurs, som du fyller i när du vill.
                </p>
              </div>
            )}

            {/* Lägg till — infälld väljare + frivilliga Antal/Kurs som studieunderlag */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void lagTill();
              }}
              className="mt-4 rounded-xl bg-[#101b2b] p-4"
            >
              <p className="text-xs font-semibold">Lägg till bolaget du studerar</p>
              <div className="mt-2 flex flex-wrap items-end gap-2">
                <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-[11px] text-[#EDE6D6]/75">
                  Bolag
                  <select
                    value={gällandeTicker}
                    onChange={(e) => setValdTicker(e.target.value)}
                    className="min-h-[44px] rounded-lg border border-[#EDE6D6]/20 bg-[#0E1B2E] px-3 py-2 text-sm text-[#EDE6D6]"
                  >
                    {valbara.map((a) => (
                      <option key={a.ticker} value={a.ticker}>
                        {a.ticker} · {a.company}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex w-28 flex-col gap-1 text-[11px] text-[#EDE6D6]/75">
                  Antal
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={antalText}
                    onChange={(e) => setAntalText(e.target.value)}
                    placeholder="frivilligt"
                    className="min-h-[44px] rounded-lg border border-[#EDE6D6]/20 bg-[#0E1B2E] px-3 py-2 text-sm text-[#EDE6D6] placeholder:text-[#EDE6D6]/40"
                  />
                </label>
                <label className="flex w-28 flex-col gap-1 text-[11px] text-[#EDE6D6]/75">
                  Kurs
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={kursText}
                    onChange={(e) => setKursText(e.target.value)}
                    placeholder="frivilligt"
                    className="min-h-[44px] rounded-lg border border-[#EDE6D6]/20 bg-[#0E1B2E] px-3 py-2 text-sm text-[#EDE6D6] placeholder:text-[#EDE6D6]/40"
                  />
                </label>
                <button
                  type="submit"
                  className="min-h-[44px] rounded-lg border border-[#E8C766]/40 px-4 py-2 text-xs font-semibold text-[#E8C766] transition-colors hover:bg-[#E8C766]/10 active:scale-[0.98]"
                >
                  Lägg till
                </button>
              </div>
            </form>
          </>
        )}
        {felText !== "" && (
          <p role="status" aria-live="polite" className="mt-3 text-xs font-semibold text-[#E8C766]">
            {felText}
          </p>
        )}

        {/* Fotrad: studielistan — utbildning, aldrig investeringsråd; metod-
            kurserna = kurskopplingen (samma always-true som AnalysNavet) */}
        <p className="mt-5 border-t border-[#EDE6D6]/10 pt-4 text-[11px] leading-relaxed text-[#EDE6D6]/75">
          Portföljen är din studielista i utbildningen — inte investeringsråd.{" "}
          <Link href="/analyser" className="font-semibold text-[#E8C766] underline underline-offset-2">
            Biblioteket
          </Link>{" "}
          bär analyserna bakom varje bolag du följer. Så använder du listan i
          utbildningen:{" "}
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
