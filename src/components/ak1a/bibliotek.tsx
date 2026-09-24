"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Bok } from "@/lib/content";
import { kraverFas, harFas2Access, harFas3Access, arAdmin } from "@/lib/kurs-access";

/**
 * BIBLIOTEKET — AK1A-bokkanon mot AKM1/AK1TS (antalet redovisas dynamiskt via bocker.length).
 * Sök + filtrera på kategori/tier/nivå/AKM1-variabel. Tier 1 = full BOKMASTER.
 * Böcker vars BOKMASTER-kurs kräver Fas 2 eller Fas 3 (kraverFas) visas med 🔒 —
 * titel och innehåll förblir synliga, klick leder till /fas2-ansok resp. /fas3
 * (inbjudan, aldrig ett stopp).
 * Design: institutionellt kort-kit — marin axel-rad ovanför rubriker,
 * kortstandard rounded-xl + gold/25, primärknapp i marin med guldstext.
 */

const KATEGORIER: Record<string, { etikett: string; ikon: string }> = {
  fundamental: { etikett: "Fundamentalanalys", ikon: "📊" },
  teknisk: { etikett: "Teknisk analys", ikon: "📈" },
  beteende: { etikett: "Beteendefinans", ikon: "🧠" },
  makro: { etikett: "Makro & kriser", ikon: "🌍" },
  strategi: { etikett: "Strategi", ikon: "♟️" },
  risk: { etikett: "Risk", ikon: "🛡️" },
};

// Kurser som redan levererar motsvarande bok
const KURS_MAP: Record<string, string> = {
  "The Intelligent Investor": "the-intelligent-investor",
  "One Up on Wall Street": "mina-basta-investeringar",
  "Zero to One": "zero-to-one",
  "Blue Ocean Strategy": "blue-ocean-strategy",
  "Security Analysis": "security-analysis",
  "Technical Analysis of the Financial Markets": "technical-analysis-financial-markets",
  "A Random Walk Down Wall Street": "a-random-walk-down-wall-street",
  // Fas 3-kanon — avancerad teknisk analys, vågor och trader-psykologi
  // (slugs matchar FAS3_KURSER i src/lib/kurs-access.ts)
  "Elliott Wave Principle": "elliott-wave-principle",
  "Technical Analysis of Stock Trends": "technical-analysis-of-stock-trends",
  "Japanese Candlestick Charting Techniques": "japanese-candlestick-charting",
  "Encyclopedia of Chart Patterns": "encyclopedia-of-chart-patterns",
  "The Visual Investor": "the-visual-investor",
  "Intermarket Analysis": "intermarket-analysis",
  "Martin Pring on Market Momentum": "martin-pring-on-market-momentum",
  "The Master Swing Trader": "the-master-swing-trader",
  "Fibonacci Applications and Strategies for Traders": "fibonacci-applications",
  "Come Into My Trading Room": "come-into-my-trading-room",
  "Teknisk analys med Johnny Torssell": "teknisk-analys-med-johnny-torssell",
  "Bollinger on Bollinger Bands": "bollinger-on-bollinger-bands",
  "The New Science of Technical Analysis": "the-new-science-of-technical-analysis",
  "Way of the Turtle": "way-of-the-turtle",
  "The Complete TurtleTrader": "the-complete-turtletrader",
  "The Trend Following Bible": "the-trend-following-bible",
  "Trading in the Zone": "trading-in-the-zone",
  "The Hour Between Dog and Wolf": "the-hour-between-dog-and-wolf",
  "Market Mind Games": "market-mind-games",
  "Your Money and Your Brain": "your-money-and-your-brain",
};

export function Bibliotek({ bocker }: { bocker: Bok[] }) {
  const [sok, setSok] = useState("");
  const [kat, setKat] = useState("alla");
  const [tier, setTier] = useState(0); // 0 = alla
  const [akFilter, setAkFilter] = useState("alla");
  const [fas2Access, setFas2Access] = useState(false);
  const [fas3Access, setFas3Access] = useState(false);

  // Fas-åtkomst avgörs lokalt efter montering (SSR renderar låst — säkrast default)
  useEffect(() => {
    setFas2Access(harFas2Access() || arAdmin());
    setFas3Access(harFas3Access() || arAdmin());
  }, []);

  const akVariabler = useMemo(() => {
    const m = new Set<string>();
    bocker.forEach((b) => b.ak?.forEach((v) => m.add(v)));
    return ["alla", ...[...m].sort()];
  }, [bocker]);

  const filtrerade = useMemo(() => {
    const q = sok.toLowerCase().trim();
    return bocker.filter((b) => {
      if (kat !== "alla" && b.kat !== kat) return false;
      if (tier && b.tier !== tier) return false;
      if (akFilter !== "alla" && !(b.ak || []).includes(akFilter)) return false;
      if (q) {
        const text = `${b.titel} ${b.author} ${b.why}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [bocker, sok, kat, tier, akFilter]);

  const räknare = useMemo(() => {
    const perKat: Record<string, number> = {};
    bocker.forEach((b) => (perKat[b.kat] = (perKat[b.kat] || 0) + 1));
    return perKat;
  }, [bocker]);

  if (bocker.length === 0) {
    return (
      <div className="rounded-xl border border-gold/25 bg-card p-8 text-center text-sm text-muted-foreground">
        Bokkanonen håller på att forskas fram — återkommer inom kort.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro — kortstandard med marin axel-rad ovanför rubriken */}
      <div className="rounded-xl border border-gold/25 bg-card p-6">
        <div className="h-[3px] w-10 rounded-full bg-[#0E1B2E] dark:bg-gold/60" />
        <p className="mt-3 text-xs uppercase tracking-widest text-gold">AK1A Research Lab</p>
        <h1 className="mt-2 font-serif text-4xl font-bold">
          Biblioteket <span className="text-gold">📖</span>
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          {bocker.length} böcker — utvalda efter djup forskning för den som vill bli en oberoende
          aktieanalytiker. Varje bok är kopplad till <strong>AKM1</strong> (V01–V20,
          fundamentalvariablerna) och <strong>AK1TS</strong> (5 tidshorisonter × 5 teorier × 4
          dimensioner). Böcker med <span className="font-bold text-gold">◆ Tier 1</span> byggs som
          kompletta BOKMASTER-kurser — kapitel för kapitel.
        </p>
        {/* Vad är Fas 2 och Fas 3? — förklarar 🔒-markeringen på de avancerade kanonböckerna */}
        <p className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <span aria-hidden>🔒</span>
          <span className="font-bold text-gold">Vad är Fas 2 och Fas 3?</span>
          <span>
            Fas 2 — sammanvägningen av de 20 indikatorerna till ett eget omdöme (18
            mästarverks-kurser; ingen teknisk analys-utbildning). Fas 3 — det
            dynamiska ekosystemet: vågor, teknisk analys på mästarnivå och
            psykologi (24 kurser). Öppnas med medlemskap.
          </span>
          <Link
            href="/fas2-ansok"
            className="underline decoration-gold/50 underline-offset-2 hover:text-foreground"
          >
            Fas 2 →
          </Link>
          <Link
            href="/fas3"
            className="underline decoration-gold/50 underline-offset-2 hover:text-foreground"
          >
            Fas 3 →
          </Link>
        </p>
      </div>

      {/* Filterrad — sekundär stil: diskreta gold/25-ramar mot kortbakgrund */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={sok}
          onChange={(e) => setSok(e.target.value)}
          placeholder="Sök titel, författare, ämne…"
          className="w-56 rounded-lg border border-gold/25 bg-card px-3 py-2 text-xs outline-none transition-colors focus:border-gold"
        />
        <select
          value={kat}
          onChange={(e) => setKat(e.target.value)}
          className="rounded-lg border border-gold/25 bg-card px-2 py-2 text-xs"
          aria-label="Kategori"
        >
          <option value="alla">Alla kategorier ({bocker.length})</option>
          {Object.entries(KATEGORIER).map(([k, v]) => (
            <option key={k} value={k}>
              {v.etikett} ({räknare[k] || 0})
            </option>
          ))}
        </select>
        <select
          value={tier}
          onChange={(e) => setTier(Number(e.target.value))}
          className="rounded-lg border border-gold/25 bg-card px-2 py-2 text-xs"
          aria-label="Tier"
        >
          <option value={0}>Alla tiers</option>
          <option value={1}>◆ Tier 1 — full BOKMASTER</option>
          <option value={2}>Tier 2 — essens</option>
          <option value={3}>Tier 3 — referens</option>
        </select>
        <select
          value={akFilter}
          onChange={(e) => setAkFilter(e.target.value)}
          className="rounded-lg border border-gold/25 bg-card px-2 py-2 text-xs"
          aria-label="AKM1-variabel"
        >
          {akVariabler.map((v) => (
            <option key={v} value={v}>
              {v === "alla" ? "Alla AKM1-variabler" : v}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
          {filtrerade.length} av {bocker.length} böcker
        </span>
      </div>

      {/* Sektionshuvud — bokhyllan, axel-rad som institutionell signatur */}
      <div>
        <div className="h-[3px] w-10 rounded-full bg-[#0E1B2E] dark:bg-gold/60" />
        <h2 className="mt-2 font-serif text-lg font-bold">Bokhyllan</h2>
      </div>

      {/* Bokkorten — standardkort: rounded-xl, gold/25, hover-lyft */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtrerade.map((b) => {
          const k = KATEGORIER[b.kat] || { etikett: b.kat, ikon: "📕" };
          const kursSlug = b.status === "kurs" ? KURS_MAP[b.titel] : undefined;
          // Fas-bok utan åtkomst: allt innehåll syns, men kurslänken blir en ansökan
          const fas = kursSlug ? kraverFas(kursSlug) : 0;
          const last = fas !== 0 && (fas === 3 ? !fas3Access : !fas2Access);
          return (
            <div
              key={b.id}
              className={`cv-kort flex flex-col rounded-xl border bg-card p-5 transition hover:shadow-md ${
                last ? "border-gold/40 hover:border-gold/60" : "border-gold/25 hover:border-gold/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-serif text-base font-bold leading-tight">{b.titel}</h3>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {b.author} · {b.year}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {/* Tier 1-markering — marin chip med guldstext (ej guldbakgrund) */}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                      b.tier === 1 ? "bg-[#0E1B2E] text-[#E8C766]" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {b.tier === 1 ? "◆ Tier 1" : `Tier ${b.tier}`}
                  </span>
                  {/* Fas-markering — lås-badge på kanonböcker som öppnas med medlemskap (koppar = Fas 3) */}
                  {fas !== 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        fas === 3
                          ? last
                            ? "bg-[#B07A3C]/20 koppar-text"
                            : "bg-[#B07A3C]/10 koppar-text"
                          : last
                            ? "bg-gold/15 text-gold"
                            : "bg-gold/10 text-gold/80"
                      }`}
                      title={`Fas ${fas}-kurs — öppnas med Fas ${fas}-medlemskap`}
                    >
                      {last ? `🔒 Fas ${fas}` : `Fas ${fas}`}
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-foreground/85">{b.why}</p>

              <ul className="mt-3 space-y-1">
                {(b.lessons || []).slice(0, 3).map((l, i) => (
                  <li key={i} className="flex gap-1.5 text-[11px] leading-snug text-muted-foreground">
                    <span className="text-gold">◆</span>
                    {l}
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex flex-wrap gap-1">
                <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold">
                  {k.ikon} {k.etikett}
                </span>
                {(b.ak || []).slice(0, 4).map((v) => (
                  <span key={v} className="rounded bg-gold/10 px-1.5 py-0.5 text-[10px] font-bold text-gold">
                    {v}
                  </span>
                ))}
                {(b.ts || []).map((d) => (
                  <span key={d} className="rounded bg-bull/10 px-1.5 py-0.5 text-[10px] font-semibold text-bull">
                    {d}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-3">
                {/* Primär action — marin knapp med guldstext. Fas-låst: ansök, inte kursen */}
                {kursSlug && last ? (
                  <Link
                    href={fas === 3 ? "/fas3" : "/fas2-ansok"}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#0E1B2E] px-3 py-1.5 text-[11px] font-semibold text-[#E8C766] transition-colors hover:bg-[#081120]"
                    title={`Fas ${fas}-kurs — öppnas med Fas ${fas}-medlemskap`}
                  >
                    🔒 Öppnas i Fas {fas} — ansök →
                  </Link>
                ) : kursSlug ? (
                  <Link
                    href={`/kurser/${kursSlug}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#0E1B2E] px-3 py-1.5 text-[11px] font-semibold text-[#E8C766] transition-colors hover:bg-[#081120]"
                  >
                    📚 Läs hela kursen →
                  </Link>
                ) : (
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {b.tier === 1 ? "BOKMASTER-kurs i byggkön" : `Nivå ${b.niva}/5 läsning`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtrerade.length === 0 && (
        <div className="rounded-xl border border-gold/25 bg-card p-8 text-center text-sm text-muted-foreground">
          Inga böcker matchade filtret — prova att bredda sökningen.
        </div>
      )}
    </div>
  );
}
