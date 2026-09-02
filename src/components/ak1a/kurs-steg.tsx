"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { addXP, lasXP, lasStjarnor, niva, lasStreak, lasKlaraKurser, markeraKursKlar } from "@/lib/member-local";
import { geBadge, ORIGINAL_BOKMASTER, FLAGGSKEPP } from "@/lib/badges";
import { InsiktPuls } from "@/components/ak1a/kurs-visuellt";
import { VisuellBlock } from "@/components/ak1a/visuell-block";

type Kapitel = {
  num: number;
  title: string;
  intro?: string;
  minutes?: number;
  blocks?: Array<{ type: string; content: string }>;
  quiz?: Array<{ q: string; alternativ: string[]; ratt: number; tips?: string }>;
};

type Kurs = {
  slug: string;
  title: string;
  chapters: Kapitel[];
  weight?: string;
  category?: string;
  totalMinutes?: number;
};

/**
 * KursSteg — världsklass lärande-upplevelse: ett kapitel i taget,
 * visuell progress, quiz integrerat, "nästa"-knapp med dopamin-kick.
 * Baserat på learning science: microlearning + active recall + dual coding.
 */
export function KursSteg({ kurs }: { kurs: Kurs }) {
  const [steg, setSteg] = useState(0);
  const [svar, setSvar] = useState<Record<string, number>>({});
  const [klaradeKap, setKlaradeKap] = useState<Set<number>>(new Set());
  const [xp, setXp] = useState(0);
  const [stjarnor, setStjarnor] = useState(0);
  const [visaQuiz, setVisaQuiz] = useState(false);
  const [nivaUpp, setNivaUpp] = useState<number | null>(null);

  // Nivå-upp-firande försvinner efter 4 s av dopamin
  useEffect(() => {
    if (nivaUpp == null) return;
    const t = setTimeout(() => setNivaUpp(null), 4000);
    return () => clearTimeout(t);
  }, [nivaUpp]);

  useEffect(() => {
    setXp(lasXP());
    setStjarnor(lasStjarnor());
    // Återställ klarade kapitel från localStorage
    const sparade: number[] = [];
    kurs.chapters.forEach((ch) => {
      if (ch.quiz && ch.quiz.every((_, i) => localStorage.getItem(`ak1a-quiz-${kurs.slug}-${ch.num}-${i}`) === "1")) {
        sparade.push(ch.num);
      }
    });
    setKlaradeKap(new Set(sparade));
  }, [kurs.slug]);

  const kap = kurs.chapters[steg];
  const total = kurs.chapters.length;
  const procent = Math.round(((steg + 1) / total) * 100);
  const klaraTotalt = klaradeKap.size;

  const svaraQuiz = (qi: number, val: number) => {
    if (!kap.quiz) return;
    const nyckel = `ak1a-quiz-${kurs.slug}-${kap.num}-${qi}`;
    if (localStorage.getItem(nyckel) === "1") return;
    setSvar((p) => ({ ...p, [nyckel]: val }));
    if (val === kap.quiz[qi].ratt) {
      geBadge("forsta-quiz-ratt");
      const nivaFore = niva();
      localStorage.setItem(nyckel, "1");
      const nivaEfter = addXP(10);
      setXp(lasXP());
      if (nivaEfter > nivaFore) setNivaUpp(nivaEfter);
      [5, 10, 25, 50].forEach((n) => { if (nivaEfter >= n) geBadge(`niva-${n}`); });
      [1000, 10000].forEach((m) => { if (lasXP() >= m) geBadge(`xp-${m}`); });
      const st = lasStreak();
      [3, 7, 14, 30, 100].forEach((d) => { if (st.antal >= d) geBadge(`streak-${d}`); });
      // Kolla om hela kapitlet är klarat
      const alla = kap.quiz.every((_, i) => localStorage.getItem(`ak1a-quiz-${kurs.slug}-${kap.num}-${i}`) === "1");
      if (alla) {
        setKlaradeKap((p) => new Set([...p, kap.num]));
        setStjarnor(lasStjarnor());
        if (klaradeKap.size + 1 >= total) {
          // Hela kursen klarad → kurs-meriter
          const nysynkad = markeraKursKlar(kurs.slug);
          if (nysynkad) {
            geBadge("forsta-kurs-klar");
            const klara = lasKlaraKurser().length;
            [5, 10, 25, 50, 100].forEach((m) => { if (klara >= m) geBadge(`kurser-${m}`); });
            if (ORIGINAL_BOKMASTER.includes(kurs.slug)) geBadge("forsta-bokmaster");
            if (ORIGINAL_BOKMASTER.every((s) => lasKlaraKurser().includes(s))) geBadge("kanon-kannaren");
            if (FLAGGSKEPP.every((s) => lasKlaraKurser().includes(s))) geBadge("flaggskeppen");
          }
        }
      }
    }
  };

  const naasta = () => {
    if (steg < total - 1) {
      setSteg(steg + 1);
      setVisaQuiz(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!kap) return null;

  const insiktBlock = kap.blocks?.find((b) => b.type === "insikt");
  const utmaningBlock = kap.blocks?.find((b) => b.type === "utmaning");
  const visuellBlock = kap.blocks?.find((b) => b.type === "visuell");
  const textBlocks = kap.blocks?.filter((b) => b.type === "text") || [];
  const text = textBlocks.map((b) => String(b.content)).join("\n\n");
  const stycken = text.split(/\n\n+/);

  return (
    <div className="relative">
      {/* Nivå-upp-firande */}
      {nivaUpp != null && (
        <div className="pointer-events-none fixed inset-x-0 top-24 z-50 flex justify-center">
          <div className="animate-[fadeIn_0.3s_ease-out] rounded-2xl border-2 border-gold bg-card px-6 py-4 shadow-2xl">
            <p className="text-center font-serif text-2xl font-black text-gold">🎉 Nivå {nivaUpp}!</p>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              {nivaUpp >= 25 ? "Fas 2-porten står öppen — ansök när du är redo." : "100 XP per nivå — poängen förtjänas."}
            </p>
          </div>
        </div>
      )}
      {/* Progress-topprad — institutionellt marin bandhuvud med guldtext (bank-harmoni) */}
      <div className="marin-panel sticky top-0 z-30 border-b border-gold/30 shadow-md">
        <div className="mx-auto flex h-[52px] max-w-3xl items-center gap-4 px-4">
          <svg viewBox="0 0 44 44" className="h-10 w-10 shrink-0">
            <circle cx="22" cy="22" r="18" fill="none" stroke="#E8C766" strokeWidth="3" opacity="0.15" />
            <circle cx="22" cy="22" r="18" fill="none" stroke="#E8C766" strokeWidth="3"
              strokeDasharray={2 * Math.PI * 18}
              strokeDashoffset={2 * Math.PI * 18 - (2 * Math.PI * 18 * procent) / 100}
              strokeLinecap="round" transform="rotate(-90 22 22)" />
            <text x="22" y="26" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#E8C766">
              {procent}%
            </text>
          </svg>
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-xs font-semibold tracking-wide text-[#EDE6D6]">{kurs.title}</p>
            {/* Kapitel-dots: spår i porslin (#EDE6D6), fyllning i guld (#E8C766), klarade i grönt */}
            <div className="mt-1 flex gap-1">
              {kurs.chapters.map((ch, i) => (
                <button
                  key={ch.num}
                  onClick={() => { setSteg(i); setVisaQuiz(false); }}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    i === steg ? "bg-[#E8C766]" : klaradeKap.has(ch.num) ? "bg-green-400" : i < steg ? "bg-[#E8C766]/40" : "bg-[#EDE6D6]/15"
                  }`}
                  aria-label={`Kapitel ${ch.num}`}
                  title={ch.title}
                />
              ))}
            </div>
          </div>
          {/* XP/streak-chips — guldtext på marin, tabular-nums för bank-kolumn känsla */}
          <div className="flex shrink-0 items-center gap-1.5 text-[10px] font-bold leading-none">
            <span className="rounded-full border border-[#E8C766]/40 bg-[#E8C766]/10 px-2 py-1 tabular-nums text-[#E8C766]">{xp} XP</span>
            <span className="rounded-full border border-[#E8C766]/40 bg-[#E8C766]/10 px-2 py-1 tabular-nums text-[#E8C766]">⭐ {stjarnor}</span>
            <span className="rounded-full border border-[#E8C766]/40 bg-[#E8C766]/10 px-2 py-1 tabular-nums text-[#E8C766]">{klaraTotalt}/{total} 🏆</span>
          </div>
        </div>
      </div>

      {/* Aktuellt kapitel */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div key={steg} className="animate-[fadeIn_0.4s_ease-out]">
          {/* Kapitel-rubrik */}
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-serif text-2xl font-bold ${
              klaradeKap.has(kap.num) ? "bg-green-100 text-green-700" : "bg-gold/10 text-gold"
            }`}>
              {klaradeKap.has(kap.num) ? "✓" : kap.num}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Kapitel {kap.num} av {total} · {kap.minutes || 8} min
              </p>
              <h2 className="font-serif text-2xl font-bold leading-tight">{kap.title}</h2>
            </div>
          </div>

          {/* Intro-citat */}
          {kap.intro && (
            <div className="mt-6 border-l-4 border-gold/50 bg-gold/5 rounded-r-xl px-5 py-4">
              <p className="text-sm italic leading-relaxed text-foreground/80">{kap.intro}</p>
            </div>
          )}

          {/* Brödtext — uppdelad i stycken */}
          <div className="mt-6 space-y-4">
            {stycken.map((p, i) => {
              const rader = p.split("\n");
              const listRader = rader.filter((r) => /^[•\-*]\s/.test(r.trim()));
              if (listRader.length >= 2) {
                return (
                  <ul key={i} className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/90">
                    {rader.map((r, j) => /^[•\-*]\s/.test(r.trim()) ? (
                      <li key={j}>{r.trim().replace(/^[•\-*]\s*/, "")}</li>
                    ) : null)}
                  </ul>
                );
              }
              return (
                <p key={i} className="text-sm leading-[1.8] text-foreground/90">{p}</p>
              );
            })}
          </div>

          {/* 10x-insikt */}
          {insiktBlock && (
            <div className="mt-8 rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-gold/10 to-gold/5 px-6 py-5">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold">
                <InsiktPuls /> 10x-insikt
              </p>
              <p className="mt-2 font-serif text-lg font-semibold leading-snug">{String(insiktBlock.content)}</p>
            </div>
          )}

          {/* Utmaning */}
          {utmaningBlock && (
            <details className="mt-4 rounded-2xl border border-dashed border-gold/50 bg-paper px-5 py-4">
              <summary className="cursor-pointer text-xs font-bold uppercase tracking-widest text-gold">
                🎯 Utmaning — klicka när du är redo
              </summary>
              <p className="mt-3 text-sm leading-relaxed">{String(utmaningBlock.content)}</p>
            </details>
          )}

          {/* Visuell interaktiv graf (VIL-biblioteket) */}
          {visuellBlock && <VisuellBlock typ={String(visuellBlock.content)} />}

          {/* Quiz */}
          {kap.quiz && kap.quiz.length > 0 && (
            <div className="mt-8">
              {!visaQuiz ? (
                <button
                  onClick={() => setVisaQuiz(true)}
                  className="w-full rounded-xl border-2 border-gold/50 bg-gold/5 px-6 py-4 text-center text-sm font-bold text-gold hover:bg-gold/10 transition-colors"
                >
                  🧠 Testa dig själv — bevisa din kunskap (+10 XP per rätt)
                </button>
              ) : (
                <div className="space-y-5 rounded-2xl border border-gold/30 bg-card p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-gold">🧠 Masterquiz</p>
                  {kap.quiz.map((f, qi) => {
                    const nyckel = `ak1a-quiz-${kurs.slug}-${kap.num}-${qi}`;
                    const klarad = localStorage.getItem(nyckel) === "1";
                    const mitt = svar[nyckel];
                    return (
                      <div key={qi} className="rounded-lg border border-gold/15 bg-paper p-4">
                        <p className="text-sm font-medium">{qi + 1}. {f.q}</p>
                        <div className="mt-3 space-y-2">
                          {f.alternativ.map((alt, j) => {
                            const vald = mitt === j;
                            const arRatt = j === f.ratt;
                            return (
                              <button
                                key={j}
                                onClick={() => svaraQuiz(qi, j)}
                                disabled={klarad}
                                className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-all ${
                                  klarad && arRatt
                                    ? "border-green-500 bg-green-50 font-semibold"
                                    : vald && !arRatt
                                      ? "border-red-400 bg-red-50"
                                      : "border-gold/20 hover:border-gold/50 hover:bg-gold/5"
                                } ${klarad ? "cursor-default" : "cursor-pointer"}`}
                              >
                                {String.fromCharCode(65 + j)}) {alt}
                                {klarad && arRatt && " ✓"}
                              </button>
                            );
                          })}
                        </div>
                        {mitt !== undefined && mitt !== f.ratt && !klarad && (
                          <p className="mt-2 rounded-md bg-gold/10 px-3 py-2 text-xs italic text-gold">
                            💡 {f.tips || "Gå tillbaka till texten — svaret finns där."}
                          </p>
                        )}
                        {mitt === f.ratt && <p className="mt-2 text-xs font-bold text-green-700">✓ Rätt! +10 XP</p>}
                      </div>
                    );
                  })}
                  {kap.quiz.every((_, i) => localStorage.getItem(`ak1a-quiz-${kurs.slug}-${kap.num}-${i}`) === "1") && (
                    <p className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-center text-sm font-bold text-green-800">
                      🏆 Kapitel {kap.num} behärskat!
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Navigation — primär signatur: guld-knapp på papper; sekundär: diskret guldkant */}
          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={() => { if (steg > 0) { setSteg(steg - 1); setVisaQuiz(false); window.scrollTo({top:0,behavior:"smooth"}); } }}
              disabled={steg === 0}
              className="rounded-lg border border-gold/40 px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:border-gold/60 hover:bg-gold/5 disabled:opacity-30"
            >
              ← Föregående
            </button>
            {steg < total - 1 ? (
              <button
                onClick={naasta}
                className="rounded-xl bg-[#E8C766] px-8 py-3 text-sm font-bold text-[#081120] shadow-lg transition-all hover:opacity-90 hover:shadow-[#E8C766]/30"
              >
                Nästa kapitel →
              </button>
            ) : (
              <Link
                href="/kurser"
                className="rounded-xl bg-[#E8C766] px-8 py-3 text-sm font-bold text-[#081120] shadow-lg transition-all hover:opacity-90 hover:shadow-[#E8C766]/30"
              >
                🏆 Kursen klar! →
              </Link>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
