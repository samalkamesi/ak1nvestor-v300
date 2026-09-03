"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { lasMedlem, lasKlaraKurser, niva, lasXP } from "@/lib/member-local";
import { kraverFas, harFas2Access, harFas3Access, arAdmin } from "@/lib/kurs-access";

/**
 * Läroplanen — resan från nybörjare till oberoende aktieanalytiker.
 * 5 nivåer, varje kurs har ett syfte i resan mot självständighet.
 * Fas-kurser (kraverFas: 2 = den fundamentala vägen, 3 = det dynamiska
 * ekosystemet) visas med 🔒 och "Öppnas i Fas X"-notis — klick leder till
 * /fas2-ansok resp. /fas3.
 * Design: institutionellt kort-kit — marin axel-rad ovanför rubriker,
 * kortstandard rounded-xl + gold/25, aktiv accordion får marin vänsterkant.
 */

const NIVAER = [
  {
    id: 1,
    namn: "Grunderna",
    beskrivning: "Bygg din fundamentala bas — de 20 byggstenarna i AKM1",
    mal: "Du förstår vad varje variabel mäter och varför den finns",
    badge: "🌱",
    kurser: [
      { slug: "v01-forsaljningstillvaxt", syfte: "Lär dig den viktigaste tillväxtindikatorn", tid: 15 },
      { slug: "v02-arr-tillvaxt", syfte: "Förstå återkommande intäkter och varför ARR är guld", tid: 18 },
      { slug: "v03-intaktsdiversifiering", syfte: "Se risk med koncentrerade intäkter", tid: 12 },
      { slug: "v04-ps", syfte: "Din första värderingsmultipl — pris per omsättningskrona", tid: 14 },
      { slug: "v05-pb", syfte: "Pris mot bokfört värde — Grahams favorit", tid: 12 },
      { slug: "v06-ev-ebitda", syfte: "Den mest kompletta multiplen för jämförelser", tid: 16 },
      { slug: "v07-bruttomarginal", syfte: "Prissättningsmakt och affärskvalitet", tid: 13 },
      { slug: "v08-ebitda-marginal", syfte: "Driftseffektivitet i ett tal", tid: 14 },
      { slug: "v09-roe", syfte: "Avkastning på eget kapital — bolagets betyg", tid: 15 },
      { slug: "v10-skuldsattningsgrad", syfte: "Risk i kriser — hur mycket skuld tåls?", tid: 12 },
      { slug: "v11-likviditet", syfte: "Kan bolaget betala sina kortfristiga skulder?", tid: 11 },
      { slug: "v12-intaktsstabilitet", syfte: "Förutsägbarhet — ARR > kontrakt > engångs", tid: 13 },
      { slug: "v13-patent-ip", syfte: "Juridiskt skydd mot konkurrenter", tid: 14 },
      { slug: "v14-varumarke", syfte: "Kan bolaget ta högre pris än konkurrenterna?", tid: 12 },
      { slug: "v15-natverkseffekter", syfte: "Varför vissa bolag växer snabbare ju större de blir", tid: 14 },
      { slug: "v16-produktlanseringar", syfte: "Kommande katalysatorer som kan driva intäkter", tid: 13 },
      { slug: "v17-avtal-partnerskap", syfte: "Stora avtal som förändrar bilden", tid: 12 },
      { slug: "v18-regulatoriska", syfte: "Lagändringar som kan skapa eller förstöra värde", tid: 12 },
      { slug: "v19-kapitalforbranning", syfte: "Hur snabbt bränner bolaget pengar — emission-risk", tid: 20 },
      { slug: "v20-aterekop-egna-aktier", syfte: "Buybacks och insider-signal — ledningens tillit", tid: 20 },
    ],
  },
  {
    id: 2,
    namn: "Fördjupning",
    beskrivning: "Gå djupare på värdering, riskhantering och teknisk analys",
    mal: "Du kan kombinera variabler till en helhetsbild",
    badge: "📖",
    kurser: [
      { slug: "km-001-arsredovisningens-grunder", syfte: "Läs en årsredovisning från pärm till pärm", tid: 20 },
      { slug: "km-002-forvaltningsberattelsen", syfte: "VD:s brev — sanning och marknadsföring", tid: 15 },
      { slug: "km-003-resultatrakningen", syfte: "Från omsättning till vinst — rad för rad", tid: 18 },
      { slug: "km-004-balansrakningen", syfte: "Tillgångar, skulder och eget kapital", tid: 16 },
      { slug: "km-005-kassaflodesanalysen", syfte: "Sanningen bakom resultatet", tid: 15 },
      { slug: "km-006-noterna", syfte: "Där advokaterna talar — risker och undantag", tid: 14 },
      { slug: "ts-001-trendoberoende-analys", syfte: "Teknisk analys utan prognoser", tid: 15 },
      { slug: "ts-002-stod-och-motstand", syfte: "Prisnivåer som betyder något", tid: 14 },
      { slug: "rk-001-risk-i-portfoljen", syfte: "Risken är inte summan av riskerna", tid: 16 },
      { slug: "rk-002-koncentration-vs-spridning", syfte: "Hur många bolag och hur stora?", tid: 14 },
      { slug: "rk-003-kapitalfordelning", syfte: "Aktier vs räntor vs kassa", tid: 13 },
      { slug: "pc-001-komplett-aktieanalys", syfte: "Kombinera allt till en helhetsbild", tid: 25 },
    ],
  },
  {
    id: 3,
    namn: "Bokmaster",
    beskrivning: "Läs mästarna — 78 kompletta böckers visdom, kapitel för kapitel", // Uppdaterad 2026-09-01: 78 BOKMASTER-böcker (läroplanen listar urvalet)
    mal: "Du har böckernas visdom integrerad i ditt eget tänkande",
    badge: "🏛️",
    kurser: [
      { slug: "akm1-den-kontroversiella-modellen", syfte: "EKOSYSTEMET: alla 20 variabler superdjupt — vad mainstream säger och varför vi avviker", tid: 240, xp: 2500 },
      { slug: "ak1ts-vaglarans-hierarki", syfte: "EKOSYSTEMET: vågmätningens deterministiska hierarki — och den kontroversiella sanningen", tid: 230, xp: 2500 },
      { slug: "vagfundament-variablerna-som-tidsserier", syfte: "EKOSYSTEMET: variablerna som tidsserier — fundamentalvågor, divergens och portföljens matris", tid: 150, xp: 2500 },
      { slug: "the-intelligent-investor", syfte: "Grahams komplett system: Mr Market, marginal, disciplin", tid: 180, xp: 2000 },
      { slug: "mina-basta-investeringar", syfte: "Lynch: investera i det du förstår — på rätt sätt", tid: 170, xp: 2000 },
      { slug: "security-analysis", syfte: "Graham & Dodds bibel: analysens hantverk från grunden", tid: 240, xp: 2000 },
      { slug: "interpretation-of-financial-statements", syfte: "Grahams korta guide: läsa bokslut i praktiken", tid: 130, xp: 2000 },
      { slug: "common-stocks-uncommon-profits", syfte: "Fisher: kvalitetsbolag, scuttlebutt, 15 punkterna", tid: 170, xp: 2000 },
      { slug: "margin-of-safety", syfte: "Klarman: fyndjakt i kriser och special situations", tid: 150, xp: 2000 },
      { slug: "the-most-important-thing", syfte: "Marks: risk, cykler och pendeln girig–rädd", tid: 150, xp: 2000 },
      { slug: "investment-valuation", syfte: "Damodaran: DCF, multipeler och alla värderingsformler", tid: 200, xp: 2000 },
      { slug: "financial-shenanigans", syfte: "Schilit: avslöja redovningstrick innan de kostar dig", tid: 150, xp: 2000 },
      { slug: "poor-charlies-almanack", syfte: "Munger: mentalmodeller och 25 kognitiva biaser", tid: 150, xp: 2000 },
      { slug: "technical-analysis-financial-markets", syfte: "Murphy: teknisk analys — AK1TS:s motsvarighet till Graham", tid: 220, xp: 2000 },
      { slug: "japanese-candlestick-charting", syfte: "Nison: candlestickmönster — Pris-dimensionens mikroskop", tid: 160, xp: 2000 },
      { slug: "how-to-make-money-in-stocks", syfte: "O'Neil: CANSLIM — där fundamental möter teknisk", tid: 175, xp: 2000 },
      { slug: "the-outsiders", syfte: "Thorndike: kapitalallokering — återköp, förvärv, kassaflödesfokus (V20)", tid: 150, xp: 2000 },
      { slug: "the-dhandho-investor", syfte: "Pabrai: heads I win, tails I don't lose much", tid: 130, xp: 2000 },
      { slug: "the-little-book-that-beats-the-market", syfte: "Greenblatt: magiska formeln — EV/EBIT + ROIC", tid: 100, xp: 1500 },
      { slug: "expectations-investing", syfte: "Rappaport & Mauboussin: vad är redan inbakat i priset?", tid: 140, xp: 1800 },
      { slug: "100-baggers", syfte: "Mayer: compounding — vad 100x faktiskt kräver", tid: 140, xp: 1800 },
      { slug: "quality-of-earnings", syfte: "O'Glove: läs resultaträkningen som en detektiv", tid: 130, xp: 1600 },
      { slug: "what-works-on-wall-street", syfte: "O'Shaughnessy: kvantfaktorernas sanningar — P/S och tillväxtfällan", tid: 140, xp: 1800 },
      { slug: "market-wizards", syfte: "Schwager: tradrarnas disciplin — risk före avkastning", tid: 140, xp: 1800 },
      { slug: "the-essays-of-warren-buffett", syfte: "Cunningham/Buffett: breven — owner earnings, Mr Market, ärlighet", tid: 160, xp: 2000 },
      { slug: "the-alchemy-of-finance", syfte: "Soros: reflexivitet — marknaden som feedback-loop (AK1TS:s ideologiska anförvant)", tid: 150, xp: 2000 },
      { slug: "the-art-of-short-selling", syfte: "Staley: kortförsäljningens hantverk — läs risk, granska som en short", tid: 140, xp: 1800 },
      { slug: "a-random-walk-down-wall-street", syfte: "Malkiel: motståndarträning — EMH vs ekosystemet", tid: 200, xp: 2000 },
      { slug: "zero-to-one", syfte: "Thiel: monopol, nätverkseffekter (V15) och framtidens bolag", tid: 130, xp: 2000 },
      { slug: "blue-ocean-strategy", syfte: "Kim & Mauborgne: skapa obestridlig moat (V13–V15)", tid: 135, xp: 2000 },
      { slug: "portfolj-ekosystemet", syfte: "5×5×4 — från aktie till portfölj", tid: 55, xp: 500 },
    ],
  },
  {
    id: 4,
    namn: "Praktik",
    beskrivning: "Tillämpa på riktiga bolag och din egen portfölj",
    mal: "Du kan genomföra en komplett analys på egen hand",
    badge: "🔬",
    kurser: [
      { slug: "pc-002-case-hm", syfte: "Analysera ett konsumentbolag steg för steg", tid: 20 },
      { slug: "pc-003-case-volvo-cars", syfte: "Kapitaltungt bolag — hur räknar man?", tid: 22 },
      { slug: "pc-004-case-precise-biometrics", syfte: "Special situation — fusion och emission", tid: 25 },
      { slug: "pf-001-bygg-din-portfolj", syfte: "Konstruera en portfölj från grunden", tid: 18 },
      { slug: "pf-002-riskhantering-i-praktiken", syfte: "Hantera nedgångar utan att panik-sälja", tid: 15 },
    ],
  },
  {
    id: 5,
    namn: "Självständighet",
    beskrivning: "Bli en oberoende aktieanalytiker — Fas 2 och bortom",
    mal: "Du kan analysera, värdera och bygga portföljer helt på egen hand",
    badge: "🎓",
    kurser: [
      { slug: "se-001-sektoranalys-grunder", syfte: "Förstå en hel bransch", tid: 16 },
      { slug: "se-002-konkurrensanalys", syfte: "Porter's fem krafter i praktiken", tid: 15 },
      { slug: "vm-001-varldsmakro", syfte: "Räntor, valutor och konjunktur", tid: 18 },
      { slug: "ud-001-utdelningsstrategi", syfte: "Bygg en utdelningsportfölj", tid: 14 },
      { slug: "bf-001-beteendefinans", syfte: "Din hjärna är din största fiende", tid: 15 },
    ],
  },
];

export function Laroplan() {
  const [medlem, setMedlem] = useState(false);
  const [klara, setKlara] = useState<string[]>([]);
  const [xp, setXp] = useState(0);
  const [oppnadNiva, setOppnadNiva] = useState<number | null>(1);
  const [fas2Access, setFas2Access] = useState(false);
  const [fas3Access, setFas3Access] = useState(false);

  useEffect(() => {
    setMedlem(Boolean(lasMedlem()));
    setKlara(lasKlaraKurser());
    setXp(lasXP());
    setFas2Access(harFas2Access() || arAdmin());
    setFas3Access(harFas3Access() || arAdmin());
  }, []);

  const totalKurser = NIVAER.reduce((s, n) => s + n.kurser.length, 0);
  const klaraKurser = klara.length;
  const procent = Math.round((klaraKurser / totalKurser) * 100);

  return (
    // pb-28 sm:pb-24 — luft undertill så sista kurs-korten kan scrollas förbi
    // de flytande knapparna (Short-Seller/AI-Mentor höger, Notiser vänster)
    <div className="mx-auto max-w-4xl pb-28 sm:pb-24">
      {/* Sidhuvud — marin axel-rad som institutionell signatur ovanför rubriken */}
      <div className="text-center">
        <div className="mx-auto h-[3px] w-10 rounded-full bg-[#0E1B2E] dark:bg-gold/60" />
        <h1 className="mt-3 font-serif text-4xl font-bold">Läroplanen</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Från nybörjare till oberoende aktieanalytiker. {totalKurser} kurser i 5 nivåer —
          varje kurs bygger mot målet: att du kan analysera, värdera och förvalta på egen hand.
        </p>
      </div>

      {/* Progress — kortstandard, marin spår med behållen guldfyllnad */}
      <div className="mx-auto mt-6 max-w-md rounded-xl border border-gold/25 bg-card p-5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-gold">Din resa</span>
          <span className="tabular-nums text-muted-foreground">{klaraKurser}/{totalKurser} kurser ({procent}%)</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#0E1B2E]/10">
          <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${procent}%` }} />
        </div>
        <p className="mt-2 text-center text-xs tabular-nums text-muted-foreground">
          Nivå {niva()}/100 · {xp} XP · {medlem ? "✅ Inloggad" : "⚠️ Inte inloggad"}
        </p>
        {/* Primär action — marin knapp med guldstext (ej guldknapp) */}
        {!medlem && (
          <Link
            href="/logga-in"
            className="mt-2 block rounded-lg bg-[#0E1B2E] px-4 py-2 text-center text-xs font-semibold text-[#E8C766] transition-colors hover:bg-[#081120]"
          >
            Logga in gratis för att spara din progress →
          </Link>
        )}
      </div>

      {/* Vad är Fas 2 och Fas 3? — förklarar 🔒-markeringen i nivåerna (inbjudan, aldrig stopp) */}
      <p className="mx-auto mt-3 flex max-w-xl flex-wrap items-center justify-center gap-1.5 text-center text-[11px] leading-relaxed text-muted-foreground">
        <span aria-hidden>🔒</span>
        <span className="font-bold text-gold">Vad är Fas 2 och Fas 3?</span>
        <span>
          Fas 2 — den fundamentala vägen till oberoende analytiker (18 kurser). Fas 3 —
          det dynamiska ekosystemet: vågor, teknisk analys och psykologi (24 kurser).
          Öppnas med medlemskap.
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

      {/* Nivåer — accordions i enhetlig kortstandard */}
      <div className="mt-10 space-y-8">
        {NIVAER.map((niv) => {
          const klaraINivan = niv.kurser.filter((k) => klara.includes(k.slug)).length;
          const procentNiva = Math.round((klaraINivan / niv.kurser.length) * 100);
          const oppen = oppnadNiva === niv.id;

          return (
            <section
              key={niv.id}
              className="overflow-hidden rounded-xl border border-gold/25 bg-card transition-colors hover:border-gold/50"
            >
              {/* Nivåhuvud — öppen accordion markerar med marin vänsterkant + svagt marin ton */}
              <button
                onClick={() => setOppnadNiva(oppen ? null : niv.id)}
                className={`flex w-full items-center gap-4 border-l-2 px-5 py-4 text-left transition-colors ${
                  oppen
                    ? "border-[#0E1B2E] bg-[#0E1B2E]/[0.04] dark:border-gold"
                    : "border-transparent hover:bg-gold/5"
                }`}
              >
                <span className="text-3xl">{niv.badge}</span>
                <div className="min-w-0 flex-1">
                  {/* Marin axel-rad ovanför rubriken */}
                  <div className="h-[3px] w-10 rounded-full bg-[#0E1B2E] dark:bg-gold/60" />
                  <div className="mt-2 flex items-baseline justify-between">
                    <h2 className="font-serif text-xl font-bold">
                      Nivå {niv.id}: {niv.namn}
                    </h2>
                    <span className="text-xs font-bold tabular-nums text-muted-foreground">
                      {klaraINivan}/{niv.kurser.length} ✓
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{niv.beskrivning}</p>
                  <p className="mt-1 text-[11px] italic text-gold">🎯 {niv.mal}</p>
                  {/* Nivå-progress — guldfyllnad behållen, spår i marin ton */}
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#0E1B2E]/10">
                    <div className="h-full rounded-full bg-gold" style={{ width: `${procentNiva}%` }} />
                  </div>
                </div>
                <span className="text-lg text-muted-foreground">{oppen ? "−" : "+"}</span>
              </button>

              {/* Kurser — standardkort med hover-lyft */}
              {oppen && (
                <div className="space-y-2 px-5 pb-5 pt-4">
                  {niv.kurser.map((kurs, i) => {
                    const klar = klara.includes(kurs.slug);
                    // Fas-kurs utan åtkomst: syftet syns, klick blir en inbjudan
                    // till /fas2-ansok (fas 2) resp. /fas3 (fas 3) — aldrig ett stopp
                    const fas = kraverFas(kurs.slug);
                    const last = fas !== 0 && (fas === 3 ? !fas3Access : !fas2Access);
                    return (
                      <Link
                        key={kurs.slug}
                        href={last ? (fas === 3 ? "/fas3" : "/fas2-ansok") : `/kurser/${kurs.slug}`}
                        title={last ? `Öppnas i Fas ${fas} — kräver Fas ${fas}-medlemskap` : undefined}
                        className={`flex items-center gap-3 rounded-xl border bg-card px-3 py-2.5 transition hover:shadow-md ${
                          klar ? "border-bull/40" : "border-gold/25 hover:border-gold/50"
                        }`}
                      >
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums ${
                          klar ? "bg-bull text-white" : "bg-gold/10 text-gold"
                        }`}>
                          {klar ? "✓" : i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-serif text-sm font-semibold">{kurs.syfte}</p>
                          <p className="text-[10px] tabular-nums text-muted-foreground">
                            {kurs.tid} min {kurs.xp ? `· ${kurs.xp} XP` : ""}
                            {last ? ` · 🔒 Öppnas i Fas ${fas}` : ""}
                          </p>
                        </div>
                        {last ? (
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              fas === 3
                                ? "bg-[#8C5A2B] text-[#F8EFE3] dark:bg-[#B07A3C] dark:text-[#081120]"
                                : "bg-[#0E1B2E] text-[#E8C766] dark:bg-[#16263D]"
                            }`}
                          >
                            🔒 Fas {fas}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">→</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Certifiering — avslutande sektion med axel-rad */}
      <div className="mt-10 rounded-xl border border-gold/25 bg-card p-6 text-center">
        <div className="mx-auto h-[3px] w-10 rounded-full bg-[#0E1B2E] dark:bg-gold/60" />
        <p className="mt-3 text-3xl">🎓</p>
        <h2 className="mt-2 font-serif text-2xl font-bold">Målet: Oberoende aktieanalytiker</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          När du klarat alla 5 nivåer har du verktygen för att analysera bolag,
          värdera aktier, bygga portföljer och fatta egna beslut — utan att
          bero av andras tips eller rekommendationer.
        </p>
        <p className="mt-3 text-xs font-bold text-gold">
          Detta är Fas 1 — alltid gratis, alltid öppet. Fundamental-analys är en rättighet.
        </p>
      </div>
    </div>
  );
}
