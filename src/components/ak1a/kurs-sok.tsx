"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

/**
 * KURSSÖK — sök + kategorifilter för kursbiblioteket (233 kurser).
 * Samma DNA som övriga sajten: kategorisektioner, guldkantade kort.
 */

export type KursKort = {
  slug: string;
  title: string;
  category: string;
  kapitel: number;
  minuter: number;
  learn: string;
  xp: number;
  quiz: number;
};

export function KursSok({ kurser }: { kurser: KursKort[] }) {
  const [sok, setSok] = useState("");
  const [kat, setKat] = useState("alla");

  const kategorier = useMemo(() => {
    const m = new Map<string, number>();
    kurser.forEach((k) => m.set(k.category, (m.get(k.category) || 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [kurser]);

  const filtrerade = useMemo(() => {
    const q = sok.toLowerCase().trim();
    return kurser.filter((k) => {
      if (kat !== "alla" && k.category !== kat) return false;
      if (q && !`${k.title} ${k.learn}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [kurser, sok, kat]);

  const grupperade = useMemo(() => {
    const m = new Map<string, KursKort[]>();
    for (const k of filtrerade) {
      const list = m.get(k.category) ?? [];
      list.push(k);
      m.set(k.category, list);
    }
    return [...m.entries()];
  }, [filtrerade]);

  return (
    <div>
      {/* Sök + filter */}
      <div className="sticky top-14 z-20 -mx-1 mb-6 flex flex-wrap items-center gap-2 bg-background/95 px-1 py-3 backdrop-blur-md">
        <input
          value={sok}
          onChange={(e) => setSok(e.target.value)}
          placeholder={`Sök bland ${kurser.length} kurser…`}
          className="w-60 rounded-lg border border-gold/30 bg-card px-3 py-2 text-xs outline-none focus:border-gold"
          aria-label="Sök kurser"
        />
        <button
          onClick={() => setKat("alla")}
          className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
            kat === "alla" ? "bg-gold text-primary-foreground" : "border border-gold/30 bg-card text-muted-foreground hover:border-gold/60"
          }`}
        >
          Alla ({kurser.length})
        </button>
        {kategorier.slice(0, 8).map(([k, n]) => (
          <button
            key={k}
            onClick={() => setKat(kat === k ? "alla" : k)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
              kat === k ? "bg-gold text-primary-foreground" : "border border-gold/30 bg-card text-muted-foreground hover:border-gold/60"
            }`}
          >
            {k} ({n})
          </button>
        ))}
        <span className="ml-auto text-[11px] text-muted-foreground">
          {filtrerade.length} kurser visas
        </span>
      </div>

      {/* Kategorisektioner */}
      <div className="space-y-10">
        {grupperade.map(([category, list]) => (
          <section key={category}>
            <h2 className="border-b border-gold/30 pb-2 font-serif text-2xl font-bold">
              {category}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {list.length} kurser
              </span>
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/kurser/${c.slug}`}
                    className="block rounded-lg border border-gold/20 bg-card p-4 transition-colors hover:border-gold/60"
                  >
                    <span className="font-serif font-semibold">{c.title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {c.kapitel} kapitel · {c.minuter} min · {c.quiz} quiz · {c.xp} XP
                    </span>
                    <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
                      {c.learn}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {grupperade.length === 0 && (
          <p className="rounded-xl border border-gold/20 bg-card p-8 text-center text-sm text-muted-foreground">
            Inga kurser matchade — prova ett annat sökord.
          </p>
        )}
      </div>
    </div>
  );
}
