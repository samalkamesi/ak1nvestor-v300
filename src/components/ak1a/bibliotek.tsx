"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Bok } from "@/lib/content";

/**
 * BIBLIOTEKET — AK1A-bokkanon (100 böcker) mot AKM1/AK1TS.
 * Sök + filtrera på kategori/tier/nivå/AKM1-variabel. Tier 1 = full BOKMASTER.
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
};

export function Bibliotek({ bocker }: { bocker: Bok[] }) {
  const [sok, setSok] = useState("");
  const [kat, setKat] = useState("alla");
  const [tier, setTier] = useState(0); // 0 = alla
  const [akFilter, setAkFilter] = useState("alla");

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
      <div className="rounded-2xl border border-gold/30 bg-card p-8 text-center text-sm text-muted-foreground">
        Bokkanonen håller på att forskas fram — återkommer inom kort.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="rounded-2xl border border-gold/30 bg-card p-6">
        <h1 className="font-serif text-3xl font-bold">
          Biblioteket <span className="text-gold">📖</span>
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          {bocker.length} böcker — utvalda efter djup forskning för den som vill bli en oberoende
          aktieanalytiker. Varje bok är kopplad till <strong>AKM1</strong> (V01–V20,
          fundamentalvariablerna) och <strong>AK1TS</strong> (5 tidshorisonter × 5 teorier × 4
          dimensioner). Böcker med <span className="font-bold text-gold">◆ Tier 1</span> byggs som
          kompletta BOKMASTER-kurser — kapitel för kapitel.
        </p>
      </div>

      {/* Filterrad */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={sok}
          onChange={(e) => setSok(e.target.value)}
          placeholder="Sök titel, författare, ämne…"
          className="w-56 rounded-lg border border-gold/30 bg-card px-3 py-2 text-xs outline-none focus:border-gold"
        />
        <select
          value={kat}
          onChange={(e) => setKat(e.target.value)}
          className="rounded-lg border border-gold/30 bg-card px-2 py-2 text-xs"
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
          className="rounded-lg border border-gold/30 bg-card px-2 py-2 text-xs"
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
          className="rounded-lg border border-gold/30 bg-card px-2 py-2 text-xs"
          aria-label="AKM1-variabel"
        >
          {akVariabler.map((v) => (
            <option key={v} value={v}>
              {v === "alla" ? "Alla AKM1-variabler" : v}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-muted-foreground">
          {filtrerade.length} av {bocker.length} böcker
        </span>
      </div>

      {/* Bokkorten */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtrerade.map((b) => {
          const k = KATEGORIER[b.kat] || { etikett: b.kat, ikon: "📕" };
          const kursSlug = b.status === "kurs" ? KURS_MAP[b.titel] : undefined;
          return (
            <div
              key={b.id}
              className="flex flex-col rounded-2xl border border-gold/25 bg-card p-5 transition-colors hover:border-gold/50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="font-serif text-base font-bold leading-tight">{b.titel}</h2>
                  <p className="text-xs text-muted-foreground">
                    {b.author} · {b.year}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    b.tier === 1 ? "bg-gold/15 text-gold" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {b.tier === 1 ? "◆ Tier 1" : `Tier ${b.tier}`}
                </span>
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
                {kursSlug ? (
                  <Link
                    href={`/kurser/${kursSlug}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-gold px-3 py-1.5 text-[11px] font-bold text-primary-foreground hover:opacity-90"
                  >
                    📚 Läs hela kursen →
                  </Link>
                ) : (
                  <span className="text-[10px] text-muted-foreground">
                    {b.tier === 1 ? "BOKMASTER-kurs i byggkön" : `Nivå ${b.niva}/5 läsning`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtrerade.length === 0 && (
        <div className="rounded-2xl border border-gold/20 bg-card p-8 text-center text-sm text-muted-foreground">
          Inga böcker matchade filtret — prova att bredda sökningen.
        </div>
      )}
    </div>
  );
}
