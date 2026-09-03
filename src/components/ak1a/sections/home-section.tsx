"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  LibraryBig,
  Calculator,
  Award,
} from "lucide-react";
import { Eyebrow, HonestyTag } from "../primitives";
import { NyhetsChips } from "../kunskaps-flode";
import { VarumarkesLogo } from "../varumarkes-logo";

/* ────────────────────────────────────────────────────────────────────────────
   AK1A Research Lab — startsidans hem-sektion (omskriven 2026-09-01).

   Copyuppdrag: säljande, to the point, allt klickbart — men alltid faktabaserat.
   Alla tal nedan är räknade direkt ur public/deep-courses.json:
   · 333 kurser
   · 8 211 quiz-frågor (chapters[].quiz, summerat)
   · 103 bokkurser (kategori BOKMASTER)
   · 8 verktyg (kalkylatorn, vågfundamentet, portföljbyggaren, net-net-skannern,
     superanalysen, konfluensradarn, min portfölj, dagens pass)
   · 0 kr inträde (Fas 1 gratis för alltid — se /medlemskap)
   ──────────────────────────────────────────────────────────────────────────── */

const ANTAL_KURSER = 333;
const ANTAL_QUIZ = 8211;
const ANTAL_BOKER = 103;
const ANTAL_VERKTYG = 8;

/* ---------- Sifferbandets mätta tal — varje stat är klickbar ---------- */

const SIFFROR: {
  tal: number;
  suffix?: string;
  etikett: string;
  undertext: string;
  href: string;
}[] = [
  {
    tal: ANTAL_KURSER,
    etikett: "kurser",
    undertext: "Från bokföringens grunder till AK1TS våglära.",
    href: "/kurser",
  },
  {
    tal: ANTAL_QUIZ,
    etikett: "quiz-frågor",
    undertext: "Varje kurs avslutas med quiz som prickar kunskapsluckorna.",
    href: "/kurser",
  },
  {
    tal: ANTAL_BOKER,
    etikett: "kanonböcker",
    undertext: "Från Security Analysis till Poor Charlie's Almanack.",
    href: "/kurser",
  },
  {
    tal: ANTAL_VERKTYG,
    etikett: "verktyg",
    undertext: "Kalkylatorn, Vågfundamentet, Konfluensradarn med flera.",
    href: "/kalkylator",
  },
  {
    tal: 0,
    suffix: " kr",
    etikett: "att börja",
    undertext: "Fas 1 är gratis — för alltid. Inget kort, ingen bindningstid.",
    href: "/medlemskap",
  },
];

/* ---------- Varför AK1A? — fyra skäl, varje kort länkar dit det lovar ---------- */

const SKAL: {
  ikon: typeof BookOpen;
  rubrik: string;
  mening1: string;
  mening2: string;
  lankText: string;
  href: string;
}[] = [
  {
    ikon: BookOpen,
    rubrik: "Fundamental analys från grunden",
    mening1:
      "Från Grahams marginal of safety till modern räkenskapsanalys — AKM1:s 20 variabler ger dig en struktur i stället för gissningar.",
    mening2:
      "Varje steg förklaras på svenska, med quiz som tvingar dig att tänka själv.",
    lankText: "Öppna kurserna",
    href: "/kurser",
  },
  {
    ikon: LibraryBig,
    rubrik: "Byggd på mästarnas böcker",
    mening1:
      "103 kanonverk — var och en en egen kurs med källkort som pekar på originalkapitlen.",
    mening2:
      "Du lär dig mästarnas metoder i original, inte andrahandsreferat.",
    lankText: "Utforska bokkurserna",
    href: "/kurser",
  },
  {
    ikon: Calculator,
    rubrik: "Verktygen ingår",
    mening1:
      "AKM1-kalkylatorn väger 20 fundamentalvariabler, Vågfundamentet visar dem som tidsserier och Konfluensradarn (Fas 3) låter värde möta vågor.",
    mening2: "Samma system som kurserna lär ut — ingen extra kostnad.",
    lankText: "Öppna kalkylatorn",
    href: "/kalkylator",
  },
  {
    ikon: Award,
    rubrik: "Certifikat — och vägen vidare",
    mening1:
      "Klara kurser, samla XP och tjäna ditt certifikat på nivå A–D.",
    mening2:
      "I Fas 2 öppnas personlig utbildning och chansen att bli certifierad representant för AK1nvestor.",
    lankText: "Se certifikatet",
    href: "/certifikat",
  },
];

/* ---------- Verktygschips i kort 3 (varje verktyg klickbart) ---------- */

const VERKTYGSLANKAR: { text: string; href: string }[] = [
  { text: "AKM1-kalkylatorn", href: "/kalkylator" },
  { text: "Vågfundamentet", href: "/vagfundament" },
  { text: "Konfluensradarn", href: "/konfluens" },
];

/* ---------- Stigen: Fas 1 från konto till certifikat ---------- */

const STIG: { num: string; rubrik: string; undertext: string; href: string }[] = [
  {
    num: "1",
    rubrik: "Skapa kontot",
    undertext: "0 kr · en minut",
    href: "/logga-in",
  },
  {
    num: "2",
    rubrik: "Alla kurser upplåsta",
    undertext: "333 kurser, direkt",
    href: "/kurser",
  },
  {
    num: "3",
    rubrik: "XP & badges",
    undertext: "Poäng, nivåer, troféer",
    href: "/badges",
  },
  {
    num: "4",
    rubrik: "Certifikat A–D",
    undertext: "Bevis på kunskapen",
    href: "/certifikat",
  },
];

/* ---------- Animerad räknare (count-up vid scroll-in, respekterar reduced motion) ---------- */

function AnimeraTal({ mal, suffix }: { mal: number; suffix?: string }) {
  const [varde, setVarde] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const startad = React.useRef(false);

  React.useEffect(() => {
    // Nollmålet ("0 kr") behöver ingen animation — sätt direkt.
    if (mal === 0) return;
    // Respektera reducerad rörelse: hoppa till slutvärdet.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVarde(mal);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const starta = () => {
      if (startad.current) return;
      startad.current = true;
      const t0 = performance.now();
      const varaktighet = 1400;
      const steg = (nu: number) => {
        const p = Math.min(1, (nu - t0) / varaktighet);
        const lattad = 1 - Math.pow(1 - p, 3); // easeOutCubic
        setVarde(Math.round(mal * lattad));
        if (p < 1) requestAnimationFrame(steg);
      };
      requestAnimationFrame(steg);
    };

    const obs = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && starta(),
      { threshold: 0.4 }
    );
    obs.observe(el);
    // Säkerhet: om elementet aldrig syns (t.ex. udda viewport) — starta ändå.
    const failsafe = setTimeout(starta, 2500);
    return () => {
      obs.disconnect();
      clearTimeout(failsafe);
    };
  }, [mal]);

  return (
    <span ref={ref}>
      {varde.toLocaleString("sv-SE")}
      {suffix}
    </span>
  );
}

export function HomeSection() {
  return (
    <div className="paper-texture">
      {/* ───────────── 1 · HERO — marin certifikat-öppning med gravör-ram ───────────── */}
      <section className="relative border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="marin-panel relative overflow-hidden rounded-2xl border border-gold/40 p-2 sm:p-3">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
            <div className="relative rounded-xl border border-[#E8C766]/20 p-8 sm:p-12">
              {/* Överrad — emblem + bankfirmans signeringsrad */}
              <div className="flex items-center gap-3">
                <VarumarkesLogo storlek="sm" medText={false} />
                <p className="flex flex-wrap items-baseline gap-x-4 font-serif text-[10px] uppercase tracking-[0.35em] text-[#E8C766]">
                  <span>A · K · 1 · A</span>
                  <span>R E S E A R C H</span>
                  <span>L A B</span>
                </p>
              </div>

              <h1 className="mt-6 max-w-3xl font-serif text-4xl font-bold leading-[1.05] tracking-tight text-[#EDE6D6] text-balance sm:text-5xl lg:text-6xl">
                Bli analytikern som ser vad andra missar.
              </h1>

              <p className="mt-5 max-w-2xl font-serif text-lg italic leading-relaxed text-[#E8C766] sm:text-xl">
                Lär dig läsa bolag som en analytiker — från första
                årsredovisningen till certifikatet. {ANTAL_KURSER} kurser,{" "}
                {ANTAL_QUIZ.toLocaleString("sv-SE")} quiz-frågor och verktygen
                som hör till, från dag ett.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/logga-in"
                  className="btn-guld-signatur inline-flex items-center gap-2 px-8 py-4 text-base font-bold sm:text-lg"
                >
                  Bli medlem — gratis <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/kurser"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#E8C766]/50 px-6 py-4 text-base font-semibold text-[#E8C766] transition-colors hover:bg-[#E8C766]/10"
                >
                  Utforska kurserna
                </Link>
              </div>

              {/* Mikrostrip — avgörande invändningar omtyglade på en rad */}
              <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-wide text-[#EDE6D6]/70">
                <span>
                  <span className="mr-1.5 inline-block h-1 w-1 rounded-full bg-[#E8C766] align-middle" />
                  Fas 1 för alltid 0 kr
                </span>
                <span>
                  <span className="mr-1.5 inline-block h-1 w-1 rounded-full bg-[#E8C766] align-middle" />
                  Alla kurser upplåsta direkt
                </span>
                <span>
                  <span className="mr-1.5 inline-block h-1 w-1 rounded-full bg-[#E8C766] align-middle" />
                  Inget kort krävs
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── 2 · SIFFERBAND — mätta tal, räknar upp vid scroll ───────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Eyebrow>AK1A i siffror</Eyebrow>
            <HonestyTag kind="matt" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {SIFFROR.map((s) => (
              <Link
                key={s.etikett}
                href={s.href}
                className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-gold/50 hover:shadow-md"
              >
                <p className="font-serif text-4xl font-bold leading-none text-foreground sm:text-5xl">
                  <AnimeraTal mal={s.tal} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {s.etikett}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {s.undertext}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gold opacity-0 transition-opacity group-hover:opacity-100">
                  Gå dit <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── 3 · VARFÖR AK1A? — fyra skäl, hela kortet klickbart ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Eyebrow>Varför AK1A?</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-serif text-3xl font-bold text-balance">
            En komplett utbildning i aktieanalys — inte en ström av tips.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SKAL.map((s) => (
              <Link
                key={s.rubrik}
                href={s.href}
                className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-gold/50 hover:shadow-lg"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-gold/30 bg-gold/10 text-gold">
                  <s.ikon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-serif text-xl font-bold leading-snug">
                  {s.rubrik}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.mening1} {s.mening2}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 pt-2 text-xs font-semibold uppercase tracking-wider text-gold transition-transform group-hover:translate-x-0.5">
                  {s.lankText} <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>

          {/* Verktygen som chips — varje namn klickbart + Fas 2-vägen vidare */}
          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Verktygen på plats idag:</span>
            {VERKTYGSLANKAR.map((v) => (
              <Link
                key={v.href}
                href={v.href}
                className="rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs font-semibold text-gold transition-colors hover:bg-gold/15"
              >
                {v.text}
              </Link>
            ))}
            <span className="ml-auto text-xs text-muted-foreground">
              Fas 2:{" "}
              <Link href="/fas2-ansok" className="font-semibold text-gold hover:underline">
                bli certifierad representant
              </Link>{" "}
              ·{" "}
              <Link href="/medlemskap" className="font-semibold text-gold hover:underline">
                se medlemskapen
              </Link>
            </span>
          </div>
        </div>
      </section>

      {/* ───────────── 3b · SENASTE NYTT & NYA KUNSKAPER — rubrik-chips för
           besökare (kunddirektiv 2026-09-01: "jag ser ej systemet om nyheter
           och nya kunskaper"). Endast rubriker, varje chip + CTA länkar till
           /nyheter (respektive /kurser) — nyheterna når besökaren före
           medlemskapet. ───────────── */}
      <NyhetsChips />

      {/* ───────────── 4 · STIGEN — Fas 1 från konto till certifikat ───────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Eyebrow>Fas 1 — vägen in</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold text-balance">
            Från gratis konto till certifikat.
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Fas 1 → alla kurser upplåsta · XP &amp; badges · Certifikat A–D.
            Kontot kostar inget och kurserna låses upp i samma ögonblick du
            skapar det.
          </p>

          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {STIG.map((steg, i) => (
              <li key={steg.rubrik} className="relative">
                {/* Horisontell guldlänk mellan noderna (desktop) */}
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-6 hidden h-px w-4 -translate-x-full bg-gradient-to-r from-transparent to-gold/50 lg:block"
                  />
                )}
                {i < STIG.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute right-0 top-6 hidden h-px w-4 translate-x-full bg-gradient-to-l from-transparent to-gold/50 lg:block"
                  />
                )}
                <Link href={steg.href} className="group block">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10 font-serif text-lg font-bold text-gold transition-colors group-hover:bg-gold/20">
                    {steg.num}
                  </span>
                  <h3 className="mt-4 font-serif text-lg font-bold leading-snug">
                    {steg.rubrik}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {steg.undertext}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gold opacity-70 transition-opacity group-hover:opacity-100">
                    Gå dit <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────── 5 · SLUT-CTA — marin panel med guldsignatur-knapp ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="marin-panel relative overflow-hidden rounded-2xl border border-gold/40 p-2 sm:p-3">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-transparent" />
            <div className="relative flex flex-col items-center rounded-xl border border-[#E8C766]/20 px-6 py-12 text-center sm:px-12 sm:py-16">
              <p className="font-serif text-[10px] uppercase tracking-[0.35em] text-[#E8C766]">
                AK1A Research Lab · Fas 1
              </p>
              <h2 className="mt-4 max-w-2xl font-serif text-3xl font-bold leading-tight text-balance text-[#EDE6D6] sm:text-4xl">
                Din första kurs börjar om 30 sekunder.
              </h2>
              <p className="mt-3 max-w-xl font-serif text-base italic leading-relaxed text-[#E8C766] sm:text-lg">
                Skapa gratis konto — alla {ANTAL_KURSER} kurser låses upp
                direkt.
              </p>
              <Link
                href="/logga-in"
                className="btn-guld-signatur mt-8 inline-flex items-center gap-2 px-8 py-4 text-base font-bold sm:text-lg"
              >
                Bli medlem — gratis <span aria-hidden="true">→</span>
              </Link>
              <p className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs tracking-wide text-[#EDE6D6]/70">
                <span>0 kr för alltid</span>
                <span aria-hidden="true">·</span>
                <span>Inget kort krävs</span>
                <span aria-hidden="true">·</span>
                <span>
                  Osäker?{" "}
                  <Link
                    href="/kurser"
                    className="font-semibold text-[#E8C766] hover:underline"
                  >
                    Titta bland kurserna först
                  </Link>
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
