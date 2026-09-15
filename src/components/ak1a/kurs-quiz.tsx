"use client";

import { useEffect, useState } from "react";
import { addXP, lasXP } from "@/lib/member-local";
import { synkaQuiz } from "@/lib/medlem-progress-klient";
import { skapaT } from "@/lib/sprak";
import type { SprakId } from "@/lib/sprak";

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
 *
 * VÅG 80A: lang-prop (default "sv") — quiz-chromet kommer ur ordlistan så
 * smakprovet kap 1–2 håller sitt språk även på /en|/ar-speglarna (fragor/
 * alternativ/tips är redan översatta via kursspegel-lagret).
 */
export function KursQuiz({
  slug,
  kapitelNr,
  fragor,
  lang = "sv",
}: {
  slug: string;
  kapitelNr: number;
  fragor: QuizFraga[];
  lang?: SprakId;
}) {
  const t = skapaT(lang);
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
      // VÅG 87 (L2): dubbel-skrivning — lokal cache + skugg-POST av
      // quiz:<slug>:<kap>:<i> (servern fastställer 10 XP, aldrig klienten;
      // gästens 401 sväljs tyst — gäst = bara lokal).
      synkaQuiz(slug, kapitelNr, i);
      setXp(lasXP());
      setKlarade((n) => n + 1);
    }
  };

  return (
    <div data-chat-anker="quiz" className="mt-4 scroll-mt-24 rounded-xl border-2 border-gold/40 bg-paper p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">
          🧠 {t("kurs.quizRubrik", { num: kapitelNr })}
        </p>
        <span className="text-[11px] text-muted-foreground">
          {t("kurs.quizRaknare", { klarade, total: fragor.length })}
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
                      className={`w-full rounded-md border px-3 py-2 text-left text-xs transition-colors max-md:min-h-[52px]! ${styl} ${klarad ? "cursor-default" : "cursor-pointer"}`}
                    >
                      {String.fromCharCode(65 + j)}) {alt}
                      {klarad && arRatt && " ✓"}
                    </button>
                  );
                })}
              </div>
              {mitt !== undefined && mitt !== f.ratt && !klarad && (
                <p className="mt-2 rounded-md bg-gold/10 px-3 py-2 text-xs italic text-gold">
                  💡 {t("kurs.lararenTipsar")} {f.tips || t("kurs.quizTipsFallback")}
                </p>
              )}
              {mitt === f.ratt && (
                <p className="mt-2 text-xs font-semibold text-green-700">✓ {t("kurs.rattFortjanat")}</p>
              )}
            </div>
          );
        })}
      </div>
      {klarade === fragor.length && (
        <p className="mt-3 rounded-lg bg-green-50 border border-green-300 px-3 py-2 text-sm font-bold text-green-800">
          🏆 {t("kurs.kapitelBeharskat", { num: kapitelNr })} {xp !== null && `${t("kurs.totaltXp", { xp })} `}{t("kurs.gaVidareNasta")}
        </p>
      )}
      {rattCount > 0 && klarade < fragor.length && (
        <p className="mt-3 text-[11px] text-muted-foreground italic">
          {t("kurs.forsokIgenQuiz")}
        </p>
      )}
    </div>
  );
}
