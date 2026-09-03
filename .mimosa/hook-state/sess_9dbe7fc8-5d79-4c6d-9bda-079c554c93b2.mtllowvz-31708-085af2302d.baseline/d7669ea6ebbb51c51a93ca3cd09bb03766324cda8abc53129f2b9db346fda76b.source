"use client";

import { useEffect, useState } from "react";
import { addXP, lasXP } from "@/lib/member-local";

export type QuizFraga = {
  q: string;
  alternativ: string[];
  ratt: number;
  // Fel-svars-coachning: visar vägen utan att avslöja svaret
  tips?: string;
};

/**
 * Kapitelquiz — AI-lärarens examination. Rätt svar = automatisk +10 XP
 (endast första gången per fråga). Fel svar = pedagogisk coachning.
 * Poängen TAS inte — poängen FÖRTJÄNAS.
 */
export function KursQuiz({ slug, kapitelNr, fragor }: { slug: string; kapitelNr: number; fragor: QuizFraga[] }) {
  const [svar, setSvar] = useState<Record<number, number>>({});
  const [xp, setXp] = useState<number | null>(null);
  const [klarade, setKlarade] = useState(0);
  const [hydrerad, setHydrerad] = useState(false);
  const nyckel = (i: number) => `ak1a-quiz-${slug}-${kapitelNr}-${i}`;

  useEffect(() => {
    const n = fragor.filter((_, i) => localStorage.getItem(nyckel(i)) === "1").length;
    setKlarade(n);
    setHydrerad(true);
  }, [fragor, nyckel]);

  if (!hydrerad || !fragor || fragor.length === 0) return null;

  const rattCount = fragor.filter((f, i) => svar[i] === f.ratt).length;

  const svara = (i: number, val: number) => {
    if (localStorage.getItem(nyckel(i)) === "1") return; // redan klarad
    setSvar((p) => ({ ...p, [i]: val }));
    if (val === fragor[i].ratt) {
      localStorage.setItem(nyckel(i), "1");
      addXP(10);
      setXp(lasXP());
      setKlarade((n) => n + 1);
    }
  };

  return (
    <div className="mt-4 rounded-xl border-2 border-gold/40 bg-paper p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">
          🧠 Masterquiz — kapitel {kapitelNr}
        </p>
        <span className="text-[11px] text-muted-foreground">
          {klarade}/{fragor.length} klarade · +10 XP per rätt
        </span>
      </div>
      <div className="mt-3 space-y-4">
        {fragor.map((f, i) => {
          const mitt = svar[i];
          const klarad = (klarade > 0 || Object.keys(svar).length > 0) && localStorage.getItem(nyckel(i)) === "1";
          return (
            <div key={i} className="rounded-lg border border-gold/20 bg-card p-3">
              <p className="text-sm font-medium">{i + 1}. {f.q}</p>
              <div className="mt-2 space-y-1.5">
                {f.alternativ.map((alt, j) => {
                  const vald = mitt === j;
                  const arRatt = j === f.ratt;
                  const styl = klarad && arRatt
                    ? "border-green-500 bg-green-50 font-semibold"
                    : vald && !arRatt
                      ? "border-red-400 bg-red-50"
                      : "border-gold/20 hover:border-gold/50";
                  return (
                    <button
                      key={j}
                      onClick={() => svara(i, j)}
                      disabled={klarad}
                      className={`w-full rounded-md border px-3 py-2 text-left text-xs transition-colors ${styl} ${klarad ? "cursor-default" : "cursor-pointer"}`}
                    >
                      {String.fromCharCode(65 + j)}) {alt}
                      {klarad && arRatt && " ✓"}
                    </button>
                  );
                })}
              </div>
              {mitt !== undefined && mitt !== f.ratt && !klarad && (
                <p className="mt-2 rounded-md bg-gold/10 px-3 py-2 text-xs italic text-gold">
                  💡 Läraren tipsar: {f.tips || "Gå tillbaka till kapitlet och leta ledtråden — svaret finns där."}
                </p>
              )}
              {mitt === f.ratt && (
                <p className="mt-2 text-xs font-semibold text-green-700">✓ Rätt! +10 XP förtjänat.</p>
              )}
            </div>
          );
        })}
      </div>
      {klarade === fragor.length && (
        <p className="mt-3 rounded-lg bg-green-50 border border-green-300 px-3 py-2 text-sm font-bold text-green-800">
          🏆 Kapitel {kapitelNr} behärskat! {xp !== null && `Totalt ${xp} XP.`} Gå vidare till nästa kapitel.
        </p>
      )}
      {rattCount > 0 && klarade < fragor.length && (
        <p className="mt-3 text-[11px] text-muted-foreground italic">
          Försök igen — fel svar kostar inget, men rätt svar måste förtjänas.
        </p>
      )}
    </div>
  );
}
