"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { kraverFas, harFas2Access, harFas3Access, arAdmin } from "@/lib/kurs-access";

/**
 * KURSSÖK — sök + kategorifilter för kursbiblioteket (307 kurser, Uppdaterad 2026-09-01).
 * Samma DNA som övriga sajten: kategorisektioner, guldkantade kort.
 * Fas-kurser (kraverFas: 2 = fundamental vägen, 3 = dynamiska ekosystemet) visas
 * alltid (titel + beskrivning) men låsas med 🔒 → /fas2-ansok resp. /fas3 för
 * de som ännu inte har medlemskapet (inbjudan vidare, aldrig ett stopp).
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
  const [fas2Access, setFas2Access] = useState(false);
  const [fas3Access, setFas3Access] = useState(false);

  // Fas-åtkomst avgörs lokalt efter montering (SSR renderar låst — säkrast default)
  useEffect(() => {
    setFas2Access(harFas2Access() || arAdmin());
    setFas3Access(harFas3Access() || arAdmin());
  }, []);

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

  // Visas info-raden? — bara när minst en Fas-kurs (2 eller 3) finns i vyn
  const fasSynliga = useMemo(() => filtrerade.some((c) => kraverFas(c.slug) !== 0), [filtrerade]);

  return (
    <div>
      {/* Sök + filter — samma chip-kit som läroplanen: aktiv marin med guldtext, inaktiv guldkant */}
      <div className="sticky top-14 z-20 -mx-1 mb-6 flex flex-wrap items-center gap-2 bg-background/95 px-1 py-3 backdrop-blur-md">
        <input
          value={sok}
          onChange={(e) => setSok(e.target.value)}
          placeholder={`Sök bland ${kurser.length} kurser…`}
          className="w-60 rounded-lg border border-gold/30 bg-card px-3 py-2 text-xs outline-none transition-colors focus:border-[#0E1B2E] focus:ring-1 focus:ring-[#0E1B2E]/30 dark:focus:border-gold-soft dark:focus:ring-gold-soft/30"
          aria-label="Sök kurser"
        />
        <button
          onClick={() => setKat("alla")}
          className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
            kat === "alla"
              ? "bg-[#0E1B2E] text-[#E8C766] dark:bg-[#16263D]"
              : "border border-gold/30 text-muted-foreground hover:bg-gold/10"
          }`}
        >
          Alla ({kurser.length})
        </button>
        {kategorier.slice(0, 8).map(([k, n]) => (
          <button
            key={k}
            onClick={() => setKat(kat === k ? "alla" : k)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
              kat === k
                ? "bg-[#0E1B2E] text-[#E8C766] dark:bg-[#16263D]"
                : "border border-gold/30 text-muted-foreground hover:bg-gold/10"
            }`}
          >
            {k} ({n})
          </button>
        ))}
        <span className="ml-auto text-[11px] text-muted-foreground">
          {filtrerade.length} kurser visas
        </span>
      </div>

      {/* Vad är Fas 2 och Fas 3? — info-rad som förklarar lås-markeringen (inbjudan, aldrig stopp) */}
      {fasSynliga && (
        <p className="mb-6 flex flex-wrap items-center gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <span aria-hidden>🔒</span>
          <span className="font-bold text-gold">Vad är Fas 2 och Fas 3?</span>
          <span>
            Fas 2 — den fundamentala vägen till oberoende analytiker (18 kurser). Fas 3 —
            det dynamiska ekosystemet: vågor, teknisk analys och psykologi (24 kurser).
            Öppnas med medlemskap.
          </span>
          <Link href="/fas2-ansok" className="underline decoration-gold/50 underline-offset-2 hover:text-foreground">
            Fas 2 →
          </Link>
          <Link href="/fas3" className="underline decoration-gold/50 underline-offset-2 hover:text-foreground">
            Fas 3 →
          </Link>
        </p>
      )}

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
              {list.map((c) => {
                // Fas-kurs utan åtkomst: kortet visas (titel + beskrivning) men
                // klick leder till ansökan — inbjudan vidare, aldrig ett stopp.
                const fas = kraverFas(c.slug);
                const last = fas !== 0 && (fas === 3 ? !fas3Access : !fas2Access);
                return (
                  <li key={c.slug}>
                    <Link
                      href={last ? (fas === 3 ? "/fas3" : "/fas2-ansok") : `/kurser/${c.slug}`}
                      title={last ? `Fas ${fas}-kurs — öppnas med Fas ${fas}-medlemskap` : undefined}
                      className={`block rounded-lg border p-4 transition-all ${
                        last
                          ? "border-gold/40 bg-gold/[0.04] hover:border-gold/60 hover:shadow-lg"
                          : "border-gold/20 bg-card hover:border-gold/50 hover:shadow-lg"
                      }`}
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="font-serif font-semibold">{c.title}</span>
                        {fas !== 0 && (
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              fas === 3
                                ? last
                                  ? "bg-[#8C5A2B] text-[#F8EFE3] dark:bg-[#B07A3C] dark:text-[#081120]"
                                  : "bg-[#B07A3C]/15 koppar-text"
                                : last
                                  ? "bg-[#0E1B2E] text-[#E8C766] dark:bg-[#16263D]"
                                  : "bg-gold/15 text-gold"
                            }`}
                          >
                            {last ? `🔒 Fas ${fas}` : `Fas ${fas}`}
                          </span>
                        )}
                      </span>
                      {/* Metadata med tabular-nums — siffrorna står still i bankmatrisen */}
                      <span className="mt-1 block text-xs tabular-nums text-muted-foreground">
                        {c.kapitel} kapitel · {c.minuter} min · {c.quiz} quiz · {c.xp} XP
                      </span>
                      <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
                        {c.learn}
                      </span>
                      {last && (
                        <span
                          className={`mt-2 block text-[10px] font-semibold ${
                            fas === 3 ? "koppar-text" : "text-gold"
                          }`}
                        >
                          Öppnas i Fas {fas} — ansök för att komma vidare →
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
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
