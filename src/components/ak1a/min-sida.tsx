"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  lasKlaraKurser,
  lasMedlem,
  lasStjarnor,
  lasStreak,
  lasXP,
  nivaFranXP,
  type Medlem,
} from "@/lib/member-local";
import { srStatistik, type SRStatistik } from "@/lib/spaced-repetition";
import { badgeStatus, type BadgeStatus } from "@/lib/badges";
import { KurstipsKort } from "@/components/ak1a/kurstips-kort";
import { ElevkarnaFormuljar } from "@/components/ak1a/elevkarna-formuljar";
import { VeckoPlan } from "@/components/ak1a/vecko-plan";
import { VagkartaKort } from "@/components/ak1a/vagkarta-kort";

/**
 * MIN SIDA — medlemmens allt-i-ett-dashboard.
 *
 * Sammanför hela ekosystemet på ett enda ställe: nivå/XP, streak, stjärnor,
 * läroplans-progress, badges, flashcards (SM-2), certifikat, verktygsgatan
 * och topplistan. All state läses ur localStorage i useEffect — SSR-säkra
 * defaults + hydrerings-guard (skeleton under första renderingen).
 */

const LAROPLAN_TOTAL = 280;

/** De 8 nyckelkurserna — dashboardens fasta "nästa steg"-väg (prioriterad ordning). */
const NYCKELKURSER = [
  { slug: "akm1-den-kontroversiella-modellen", titel: "AKM1 — Den Kontroversiella Modellen" },
  { slug: "ak1ts-vaglarans-hierarki", titel: "AK1TS — Våglärans Hierarki" },
  { slug: "the-intelligent-investor", titel: "The Intelligent Investor — Graham" },
  { slug: "security-analysis", titel: "Security Analysis — Graham & Dodd" },
  { slug: "technical-analysis-financial-markets", titel: "Technical Analysis — Murphy" },
  { slug: "investment-valuation", titel: "Investment Valuation — Damodaran" },
  { slug: "the-snowball", titel: "The Snowball — Schroeder om Buffett" },
  { slug: "the-psychology-of-money", titel: "The Psychology of Money — Housel" },
] as const;

const VERKTYG = [
  {
    text: "Superanalysen",
    lank: "/superanalys",
    ikon: "🏅",
    beskrivning: "Guidad analys i 24 steg — AKM1 + AK1TS",
  },
  {
    text: "Kalkylatorn",
    lank: "/kalkylator",
    ikon: "🧮",
    beskrivning: "20 fundamentalvariabler · V01–V20",
  },
  {
    text: "Min portfölj",
    lank: "/min-portfolj",
    ikon: "💼",
    beskrivning: "Innehav + djupanalys (5×5×4)",
  },
  {
    text: "Dagens Pass",
    lank: "/dagens-pass",
    ikon: "🎯",
    beskrivning: "Dagens repetition — håll streaken levande",
  },
] as const;

const SR_TOM: SRStatistik = {
  totalt: 0,
  sedda: 0,
  beharskade: 0,
  forfallna: 0,
  repetitionerTotalt: 0,
  nastaNasta: null,
};

// ── Välfärdspanelen: hjälpvärden ─────────────────────────────────────────────

/** Kalkylatorns 20 fundamentalvariabler (V01–V20) — varje klarad kurs grundlägger en. */
const V_KURSER_TOTAL = 20;

/** Välfärdskurvans kubiska bézier: start (6,74) → mål (190,10). Ger punkten vid t∈[0,1]. */
function punktPaKurva(t: number): { x: number; y: number } {
  const u = 1 - t;
  const x = u ** 3 * 6 + 3 * u ** 2 * t * 58 + 3 * u * t ** 2 * 110 + t ** 3 * 190;
  const y = u ** 3 * 74 + 3 * u ** 2 * t * 70 + 3 * u * t ** 2 * 42 + t ** 3 * 10;
  return { x, y };
}

/**
 * Vanans värme-färgskala: 0 → klarblå ("varje forskare börjar noll") →
 * 7+ → djupgrön ("vanan sitter"). Aldrig röd/varning — alltid resan-börjar-ton.
 */
function vanFarg(dag: number): string {
  if (dag <= 0) return "#7DD3FC"; // klarblå — början
  if (dag <= 2) return "#67E8F9";
  if (dag <= 4) return "#5EEAD4";
  if (dag <= 6) return "#34D399";
  return "#059669"; // djupgrön — vanan sitter
}

/** Öppnar den globalt monterade AI-mentorn (chatt-widgeten i layouten). */
function oppnaMentorn() {
  const knapp = document.querySelector<HTMLButtonElement>('button[aria-label="AI-Mentor"]');
  knapp?.click();
}

export function MinSida() {
  const [hydrerad, setHydrerad] = useState(false);
  const [medlem, setMedlem] = useState<Medlem | null>(null);
  const [xp, setXp] = useState(0);
  const [stjarnor, setStjarnor] = useState(0);
  const [streak, setStreak] = useState(0);
  const [streakBasta, setStreakBasta] = useState(0);
  const [klara, setKlara] = useState<string[]>([]);
  const [sr, setSr] = useState<SRStatistik>(SR_TOM);
  const [badges, setBadges] = useState<BadgeStatus[]>([]);

  useEffect(() => {
    setMedlem(lasMedlem());
    setXp(lasXP());
    setStjarnor(lasStjarnor());
    const streakData = lasStreak();
    setStreak(streakData.antal);
    setStreakBasta(streakData.basta);
    setKlara(lasKlaraKurser());
    setSr(srStatistik());
    setBadges(badgeStatus());
    setHydrerad(true);
  }, []);

  // ── Härledda värden (SSR-säkra: defaults räcker tills hydrering) ──
  const elevNiva = nivaFranXP(xp);
  const upplastaBadges = badges.filter((b) => b.upplast).length;
  const totaltBadges = badges.length || 28;
  const procent = Math.min(100, Math.round((klara.length / LAROPLAN_TOTAL) * 100));
  const nastaKurs = NYCKELKURSER.find((k) => !klara.includes(k.slug));
  const xpINivan = xp % 100;

  // ── Välfärdspanelen: härledda värden ──
  const kurvFramsteg = Math.min(1, klara.length / LAROPLAN_TOTAL);
  const nulage = punktPaKurva(kurvFramsteg);
  const grundlagda = Math.min(V_KURSER_TOTAL, klara.length);
  const trygghetsProcent = Math.round((grundlagda / V_KURSER_TOTAL) * 100);
  const ringOmfang = 2 * Math.PI * 30;

  // ── Skeleton under hydrering (deterministisk på server + klient) ──
  if (!hydrerad) {
    return (
      <div className="space-y-6" aria-hidden="true">
        <div className="h-32 animate-pulse rounded-2xl border border-gold/20 bg-card" />
        <div className="h-48 animate-pulse rounded-2xl border border-gold/20 bg-card" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-40 animate-pulse rounded-2xl border border-gold/20 bg-card" />
          <div className="h-40 animate-pulse rounded-2xl border border-gold/20 bg-card" />
          <div className="h-40 animate-pulse rounded-2xl border border-gold/20 bg-card" />
        </div>
      </div>
    );
  }

  // ── VÄLKOMST-LÄGE: ej inloggad ────────────────────────────────────────────
  if (!medlem) {
    const VANTAR = [
      { ikon: "🎓", titel: "280 kurser", text: "Från AKM1 och vågläran till hela bokkanon — kapitel för kapitel." },
      { ikon: "🔥", titel: "XP, nivåer och streak", text: "Varje quiz, kurs och repetition räknas. Nivå 1–100 väntar." },
      { ikon: "🃏", titel: "100 flashcards med SM-2", text: "Glömskekurvan arbetar åt dig — repetition när du behöver den." },
      { ikon: "🎖️", titel: "28 badges", text: "Meriter att förtjäna — från första steget till hundraguldet." },
      { ikon: "🏅", titel: "Certifikat", text: "Ett delbart intyg på verklig kompetens, med betyg efter din nivå." },
      { ikon: "🧮", titel: "Analysverktygen", text: "Superanalysen, kalkylatorn och din egen portfölj — redo att öppnas." },
      { ikon: "🏆", titel: "Topplistan", text: "Se var du landar bland labbets elever — och klättra." },
    ];

    return (
      <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-card p-8 sm:p-12">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]">
          <span className="font-serif text-[180px] font-black">AK1A</span>
        </div>

        <div className="relative text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">AK1A RESEARCH LAB</p>
          <div className="mx-auto mt-3 h-0.5 w-24 bg-gold/40" />
          <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            Din utbildning — på ett ställe
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Min Sida samlar hela ditt arbete på ett ställe — vi bygger detta för
            dig. Framsteg, repetition, meriter och analysverktyg — allt som
            väntar dig:
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/logga-in"
              className="rounded-lg bg-gold px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02]"
            >
              Logga in gratis
            </Link>
            <Link
              href="/kurser"
              className="rounded-lg border border-gold/40 px-6 py-3 text-sm font-semibold text-gold hover:bg-gold/10"
            >
              Utforska kurserna
            </Link>
          </div>
        </div>

        <div className="relative mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {VANTAR.map((v) => (
            <div
              key={v.titel}
              className="flex items-start gap-3 rounded-xl border border-gold/20 bg-paper/80 p-4"
            >
              <span className="text-xl">{v.ikon}</span>
              <div>
                <p className="text-xs font-bold text-foreground">{v.titel}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{v.text}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="relative mt-8 text-center text-xs text-muted-foreground">
          Vi bygger detta för dig — kostnadsfritt, för alltid. Dina framsteg
          sparas lokalt i din webbläsare.
        </p>
      </div>
    );
  }

  // ── INLOGGAD: dashboard ───────────────────────────────────────────────────
  const dag = new Date()
    .toLocaleDateString("sv-SE", { weekday: "long" })
    .replace(/^./, (c) => c.toUpperCase());
  const namn = medlem.namn || medlem.email.split("@")[0];
  const forfallnaText =
    sr.forfallna > 0 ? `${sr.forfallna} förfallna idag` : "Inga förfallna idag";

  return (
    <div className="space-y-6">
      {/* (a) HERO-RAD */}
      <section className="relative overflow-hidden rounded-2xl border border-gold/30 bg-card p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Min Sida</p>
            <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight sm:text-3xl">
              God {dag}, {namn}
            </h1>
            <p className="mt-4 font-serif text-4xl font-black tracking-tight text-gold sm:text-5xl">
              Nivå {elevNiva}
              <span className="mx-2 text-gold/40">·</span>
              <span className="text-foreground">{xp.toLocaleString("sv-SE")} XP</span>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {100 - xpINivan} XP kvar till nivå {Math.min(100, elevNiva + 1)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-2 text-xs font-bold text-gold"
              title={`Bästa streak: ${streakBasta} dagar`}
            >
              🔥 {streak > 0 ? `${streak} dag${streak === 1 ? "" : "ar"} i rad` : "Starta streaken idag"}
            </span>
            <span
              className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-2 text-xs font-bold text-gold"
              title="Stjärnor tjänas per avslutad övning"
            >
              ⭐ {stjarnor.toLocaleString("sv-SE")} stjärnor
            </span>
          </div>
        </div>
      </section>

      {/* (a2) VÄLFÄRDSPANLEN — utbildning → välmående → välfärd */}
      <section className="marin-panel relative overflow-hidden rounded-2xl border border-gold/30 p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold-soft">Välfärdspanelen</p>
          <h2 className="mt-2 font-serif text-xl font-bold tracking-tight text-gold-soft sm:text-2xl">
            Din resa mot det du vill uppnå
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-[#EDE6D6]/70">
            Utbildning är kärnan i välmående — varje kurs, varje repetition och varje
            dag framåt blir välfärd som är din för alltid.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {/* Kort 1 · Kunskapsväxt — din punkt på kurvan just nu */}
            <div className="flex flex-col rounded-xl border border-gold/30 bg-card p-5">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Kunskapsväxt</p>
              <p className="mt-3 font-serif text-4xl font-black tracking-tight text-gold">
                {klara.length}
                <span className="ml-2 align-middle text-xs font-bold text-muted-foreground">
                  {klara.length === 1 ? "kurs klarad" : "kurser klarade"}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Nivå {elevNiva} · {xp.toLocaleString("sv-SE")} XP — och varje dag framåt
              </p>

              <div className="mt-auto pt-4">
                <svg
                  viewBox="0 0 200 84"
                  className="w-full"
                  role="img"
                  aria-label={`Stigande kunskapskurva: ${klara.length} klarade kurser på väg mot målet Oberoende analytiker`}
                >
                  {/* Vägen framåt — mjuk stigande kurva som långsamt flyter mot målet */}
                  <path
                    d="M 6 74 C 58 70 110 42 190 10"
                    fill="none"
                    stroke="var(--gold)"
                    strokeOpacity="0.45"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="4 5"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="0"
                      to="-18"
                      dur="1.6s"
                      repeatCount="indefinite"
                    />
                  </path>
                  {/* Målpunkten med vimpel — Oberoende analytiker */}
                  <circle cx="190" cy="10" r="3.5" fill="var(--gold)" />
                  <path d="M 190 10 l 0 -8 l 8 3 l -8 3" fill="var(--gold)" opacity="0.9" />
                  {/* Din punkt på kurvan — startpunkten, med andning */}
                  <circle
                    cx={nulage.x}
                    cy={nulage.y}
                    r="6"
                    fill="var(--gold)"
                    opacity="0.25"
                    className="animate-pulse"
                  />
                  <circle cx={nulage.x} cy={nulage.y} r="3.5" fill="var(--gold)" />
                </svg>
                <div className="mt-1 flex items-center justify-between gap-2 text-[10px]">
                  <span className="font-bold text-gold">Du är här</span>
                  <span className="text-right text-muted-foreground">Målet: Oberoende analytiker</span>
                </div>
              </div>
            </div>

            {/* Kort 2 · Vanan — streak med värme-färgskala */}
            <div className="flex flex-col rounded-xl border border-gold/30 bg-card p-5">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Vanan</p>
              <p
                className="mt-3 font-serif text-4xl font-black tracking-tight"
                style={{ color: vanFarg(streak) }}
              >
                {streak}
                <span className="ml-2 align-middle text-xs font-bold text-muted-foreground">
                  {streak === 1 ? "dag i rad" : "dagar i rad"}
                </span>
              </p>
              <p className="mt-1 text-xs font-semibold" style={{ color: vanFarg(streak) }}>
                {streak >= 7 ? "Vanan sitter" : streak >= 1 ? "Vanan växer" : "Varje forskare börjar noll"}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                {streak >= 7
                  ? `${streak} dagar i rad — närvaron som bygger välfärd.`
                  : streak >= 1
                    ? "En dag i taget — imorgon blir kedjan längre."
                    : "Din första dag kan vara idag — ett pass räcker."}
              </p>

              <div className="mt-auto pt-4">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  {Array.from({ length: 7 }, (_, i) => {
                    const tand = i < Math.min(streak, 7);
                    const farg = vanFarg(i + 1);
                    return (
                      <span
                        key={i}
                        className="h-2.5 w-2.5 rounded-full border border-gold/20 bg-muted"
                        style={
                          tand
                            ? { backgroundColor: farg, borderColor: farg, boxShadow: `0 0 7px ${farg}55` }
                            : undefined
                        }
                      />
                    );
                  })}
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Bästa streak: {streakBasta} {streakBasta === 1 ? "dag" : "dagar"}
                </p>
              </div>
            </div>

            {/* Kort 3 · Tryggheten — grundlagda variabler (V01–V20) */}
            <div className="flex items-start gap-4 rounded-xl border border-gold/30 bg-card p-5">
              <div className="relative shrink-0">
                <svg
                  viewBox="0 0 72 72"
                  className="h-20 w-20 -rotate-90"
                  role="img"
                  aria-label={`${trygghetsProcent} procent av 20 grundlagda variabler`}
                >
                  <circle cx="36" cy="36" r="30" fill="none" stroke="var(--muted)" strokeWidth="7" />
                  <circle
                    cx="36"
                    cy="36"
                    r="30"
                    fill="none"
                    stroke="var(--gold)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={ringOmfang}
                    strokeDashoffset={ringOmfang * (1 - trygghetsProcent / 100)}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-serif text-sm font-black text-gold">
                  {trygghetsProcent}%
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Tryggheten</p>
                <p className="mt-2 text-sm font-bold text-foreground">
                  {grundlagda} av {V_KURSER_TOTAL} grundlagda variabler
                </p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  {grundlagda >= V_KURSER_TOTAL
                    ? "Alla 20 variabler är lagda — du står på solid grund."
                    : grundlagda > 0
                      ? "Varje variabel = ett tryggare beslut i ditt liv."
                      : "Resan börjar med första variabeln — varje grundläggning är ett tryggare beslut i ditt liv."}
                </p>
                <p className="mt-2 text-[10px] text-muted-foreground">V01–V20 · kalkylatorns fundament</p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] italic text-[#EDE6D6]/60">
            Vi är tacksamma för varje dag du väljer att lära dig — så byggs välfärd, ett beslut i taget.
          </p>
        </div>
      </section>

      {/* (a2) ELEVKÄRNAN — din 30-sekunders introduktion, välfärden först */}
      <section className="mt-6">
        <ElevkarnaFormuljar />
      </section>

      {/* (a3) VECKOPLANEN — automatiskt sammansatt, anpassar sig varje vecka */}
      <section className="mt-6">
        <VeckoPlan />
      </section>

      {/* (a5) DAGENS VÅGKARTA — autonom mätning av fundamentalvågorna */}
      <section className="mt-6">
        <VagkartaKort />
      </section>

      {/* (a4) KURSTIPS — rätt kurs som ett tips, aldrig ett tvång */}
      <section className="mt-6">
        <KurstipsKort antal={3} />
      </section>

      {/* (b) PROGRESS-VÄG */}
      <section className="rounded-2xl border border-gold/30 bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-lg font-bold">Läroplanen</h2>
          <p className="text-xs text-muted-foreground">
            {klara.length} av {LAROPLAN_TOTAL} kurser · <span className="font-bold text-gold">{procent}%</span>
          </p>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gold transition-all"
            style={{ width: `${procent}%` }}
            role="progressbar"
            aria-valuenow={procent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {/* De 8 nyckelkurserna — fast väg, första oklara är nästa steg */}
        <div className="mt-5 flex flex-wrap gap-2">
          {NYCKELKURSER.map((k, i) => {
            const klar = klara.includes(k.slug);
            const arNasta = nastaKurs?.slug === k.slug;
            return (
              <Link
                key={k.slug}
                href={`/kurser/${k.slug}`}
                title={k.titel}
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-bold transition-colors ${
                  klar
                    ? "border-gold/40 bg-gold/15 text-gold"
                    : arNasta
                      ? "border-gold bg-gold text-primary-foreground shadow-md"
                      : "border-gold/20 bg-card text-muted-foreground hover:border-gold/50"
                }`}
                aria-label={`${k.titel}${klar ? " — klarad" : arNasta ? " — nästa kurs" : ""}`}
              >
                {klar ? "✓" : i + 1}
              </Link>
            );
          })}
        </div>

        {nastaKurs ? (
          <Link
            href={`/kurser/${nastaKurs.slug}`}
            className="group mt-5 flex items-center justify-between gap-3 rounded-xl border border-gold/30 bg-gold/5 px-4 py-3.5 transition-all hover:border-gold/60 hover:bg-gold/10"
          >
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Nästa kurs på vägen
              </p>
              <p className="mt-0.5 truncate text-sm font-bold text-foreground">{nastaKurs.titel}</p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-gold group-hover:translate-x-0.5 transition-transform">
              Fortsätt →
            </span>
          </Link>
        ) : (
          <Link
            href="/kurser"
            className="group mt-5 flex items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3.5 transition-all hover:border-gold/60"
          >
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Alla åtta nyckelkurser klarade
              </p>
              <p className="mt-0.5 text-sm font-bold text-foreground">
                Välj nästa kurs i biblioteket
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-gold group-hover:translate-x-0.5 transition-transform">
              Till biblioteket →
            </span>
          </Link>
        )}
      </section>

      {/* (c) TRE KORT */}
      <section className="grid gap-4 md:grid-cols-3">
        {/* Badges */}
        <Link
          href="/badges"
          className="group flex flex-col rounded-2xl border border-gold/30 bg-card p-6 transition-all hover:border-gold/60 hover:shadow-lg"
        >
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Badges</p>
          <p className="mt-3 font-serif text-3xl font-bold text-gold">
            {upplastaBadges}
            <span className="text-lg text-muted-foreground">/{totaltBadges}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">upplåsta meriter</p>
          <p className="mt-auto pt-4 text-sm font-semibold text-gold group-hover:underline">
            Se alla meriter →
          </p>
        </Link>

        {/* Flashcards — repetitionen sker i AI-mentorn */}
        <div className="flex flex-col rounded-2xl border border-gold/30 bg-card p-6">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Flashcards · SM-2
          </p>
          <p className="mt-3 font-serif text-3xl font-bold text-gold">
            {sr.beharskade}
            <span className="text-lg text-muted-foreground">/{sr.totalt}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            behärskade · {forfallnaText}
            {sr.forfallna > 0 && (
              <span className="ml-1 inline-block h-2 w-2 rounded-full bg-bear align-middle" title="Förfallna idag" />
            )}
          </p>
          <button
            onClick={oppnaMentorn}
            className="mt-auto pt-4 text-left text-sm font-semibold text-gold hover:underline"
          >
            Repetera i AI-mentorn →
          </button>
        </div>

        {/* Certifikat */}
        <Link
          href="/certifikat"
          className="group flex flex-col rounded-2xl border border-gold/30 bg-card p-6 transition-all hover:border-gold/60 hover:shadow-lg"
        >
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Certifikat</p>
          <p className="mt-3 font-serif text-3xl font-bold text-gold">🏆</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Betyget sätts efter din nivå — du klarar nivå {elevNiva}
          </p>
          <p className="mt-auto pt-4 text-sm font-semibold text-gold group-hover:underline">
            Se ditt certifikat →
          </p>
        </Link>
      </section>

      {/* (d) VERKTYGSGATA */}
      <section>
        <h2 className="font-serif text-lg font-bold">Verktygsgatan</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VERKTYG.map((v) => (
            <Link
              key={v.text}
              href={v.lank}
              className="group flex items-start gap-3 rounded-2xl border border-gold/30 bg-card p-5 transition-all hover:border-gold/60 hover:shadow-lg"
            >
              <span className="text-2xl">{v.ikon}</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground group-hover:text-gold">{v.text}</p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{v.beskrivning}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* (e) TOPPLISTA-POSITION */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gold/30 bg-card p-6">
        <div className="flex items-center gap-4">
          <span className="text-3xl">🏆</span>
          <div>
            <h2 className="font-serif text-lg font-bold">Synas på topplistan</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Varje XP räknas — varje quiz, kurs och repetition flyttar dig uppåt.
            </p>
          </div>
        </div>
        <Link
          href="/topplista"
          className="rounded-lg border border-gold/40 px-5 py-2.5 text-sm font-semibold text-gold transition-colors hover:bg-gold/10"
        >
          Se topplistan →
        </Link>
      </section>
    </div>
  );
}
