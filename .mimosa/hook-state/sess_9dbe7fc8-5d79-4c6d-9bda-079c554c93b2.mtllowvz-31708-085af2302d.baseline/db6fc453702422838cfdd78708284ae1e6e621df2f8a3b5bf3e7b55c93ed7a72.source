"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { lasMedlem, niva, lasXP, lasKlaraKurser } from "@/lib/member-local";

type Rad = { namn: string; xp: number; niva: number; kurser: number; datum: string };

const NIVA_ETIKETT = (n: number) =>
  n >= 50 ? "Mästare 🏆" : n >= 25 ? "Fas 2-redo 🎓" : n >= 10 ? "Analytiker i tillväxt 📈" : "Elev 🌱";

export function Topplista() {
  const [rader, setRader] = useState<Rad[]>([]);
  const [laddad, setLaddad] = useState(false);
  const [fel, setFel] = useState<string | null>(null);
  const [inloggad, setInloggad] = useState(false);
  const [egenRank, setEgenRank] = useState<number | null>(null);
  const [egenXp, setEgenXp] = useState(0);

  useEffect(() => {
    // 1) Hämta topplistan
    fetch("/api/topplista")
      .then((r) => r.json())
      .then((d) => setRader(d.topplista || []))
      .catch(() => setFel("Kunde inte hämta topplistan — försök igen om en stund."))
      .finally(() => setLaddad(true));

    // 2) Synka egen XP (om inloggad) — poängen förtjänas, listan speglar arbetet
    const medlem = lasMedlem();
    if (medlem?.email) {
      setInloggad(true);
      setEgenXp(lasXP());
      fetch("/api/topplista", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: medlem.email,
          namn: medlem.namn || "",
          xp: lasXP(),
          niva: niva(),
          kurser: lasKlaraKurser().length,
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.rank) setEgenRank(d.rank);
          // Uppdatera listan igen efter synken så eleven syns direkt
          return fetch("/api/topplista").then((r) => r.json());
        })
        .then((d) => { if (d?.topplista) setRader(d.topplista); })
        .catch(() => { /* synk är best-effort */ });
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="rounded-2xl border border-gold/30 bg-card p-6">
        <h1 className="font-serif text-3xl font-bold">
          Topplistan <span className="text-gold">🏆</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          AK1A Research Labs elever — rankade på förtjänade XP. Poängen TAS inte, poängen FÖRTJÄNAS:
          +10 XP per rätt quiz-svar, +50 XP per avslutad kurs, +5 XP per flashcard. Listan uppdateras
          varje gång du besöker sidan inloggad.
        </p>
      </div>

      {/* Podium */}
      {rader.length >= 3 && (
        <div className="grid grid-cols-3 items-end gap-3">
          {[1, 0, 2].map((pos) => {
            const r = rader[pos];
            if (!r) return <div key={pos} />;
            const hogd = pos === 0 ? "h-36" : pos === 1 ? "h-28" : "h-24";
            const medalj = pos === 0 ? "🥇" : pos === 1 ? "🥈" : "🥉";
            return (
              <div key={pos} className="text-center">
                <div className="text-3xl">{medalj}</div>
                <div className="mt-2 truncate text-sm font-bold">{r.namn}</div>
                <div className="text-xs text-muted-foreground">Nivå {r.niva} · {r.xp} XP</div>
                <div className={`mt-3 flex ${hogd} items-start justify-center rounded-t-xl border border-gold/40 bg-gold/10 pt-3`}>
                  <span className="font-serif text-2xl font-black text-gold">{pos + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Listan */}
      <div className="overflow-hidden rounded-2xl border border-gold/30">
        {!laddad && <div className="bg-card p-6 text-sm text-muted-foreground">Hämtar topplistan…</div>}
        {laddad && fel && <div className="bg-card p-6 text-sm text-destructive">{fel}</div>}
        {laddad && !fel && rader.length === 0 && (
          <div className="bg-card p-8 text-center text-sm text-muted-foreground">
            Topplistan är tom — var den första!{" "}
            <Link href="/logga-in" className="font-semibold text-gold underline">Logga in gratis</Link> och
            börja förtjäna XP.
          </div>
        )}
        {rader.map((r, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 border-b border-gold/10 px-4 py-3 last:border-b-0 ${
              egenRank === i + 1 ? "bg-gold/10" : i % 2 === 0 ? "bg-card" : "bg-secondary/40"
            }`}
          >
            <span className="w-8 text-center font-serif text-lg font-bold text-gold">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold">{r.namn}</div>
              <div className="text-[11px] text-muted-foreground">
                {NIVA_ETIKETT(r.niva)} · {r.kurser} kurser · synk {r.datum}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-gold">{r.xp.toLocaleString("sv-SE")} XP</div>
              <div className="text-[11px] text-muted-foreground">Nivå {r.niva}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Egensynk-status */}
      {inloggad ? (
        <p className="text-center text-xs text-muted-foreground">
          Din XP ({egenXp.toLocaleString("sv-SE")}) synkas automatiskt{egenRank ? ` — du är nr ${egenRank} just nu` : ""}.
        </p>
      ) : (
        <p className="text-center text-xs text-muted-foreground">
          <Link href="/logga-in" className="font-semibold text-gold underline">Logga in</Link> för att synas på topplistan.
        </p>
      )}
    </div>
  );
}
