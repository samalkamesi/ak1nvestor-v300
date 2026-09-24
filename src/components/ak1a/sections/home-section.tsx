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
import { useSprak } from "../sprak-leverantor";
import type { OrdlistaNyckel } from "@/lib/ordlista";
import { SIFFROR } from "@/lib/siffror";

/* ────────────────────────────────────────────────────────────────────────────
   AK1A Research Lab — startsidans hem-sektion (omskriven 2026-09-01).

   Copyuppdrag: säljande, to the point, allt klickbart — men alltid faktabaserat.
   Alla antalstal interpoleras ur @/lib/siffror (guldkälleregeln, våg 78 A4):
   · SIFFROR.kurser — kurser
   · SIFFROR.quiz — quiz-frågor (chapters[].quiz, summerat)
   · SIFFROR.bokmaster — BOKMASTER-kurser (heltäckta böcker; OBS: bokKANONEN
     är SIFFROR.kanonBocker = ett annat tal — aldrig kalla bokmaster för "kanon")
   · 8 verktyg (kalkylatorn, vågfundamentet, portföljbyggaren, net-net-skannern,
     superanalysen, konfluensradarn, min portfölj, dagens pass)
   · 0 kr inträde (Fas 1 gratis för alltid — se /medlemskap)

   VÅG 51 (2026-09-01): ALL text som visas renderas via useSprak().t med
   home.*-nycklar i ordlistan (sv/en/ar). Svenska raderna ÄR copy nedan —
   SSR/SSG renderar svenska, klienten byter direkt vid språkval.
   ──────────────────────────────────────────────────────────────────────────── */

const ANTAL_KURSER = SIFFROR.kurser;
const ANTAL_QUIZ = SIFFROR.quiz;
const ANTAL_BOKER = SIFFROR.bokmaster;
const ANTAL_VERKTYG = 8;

/* ---------- Sifferbandets mätta tal — varje stat är klickbar ---------- */

const SIFFERBAND: {
  tal: number;
  suffix?: string;
  etikett: string;
  etikettNyckel: OrdlistaNyckel;
  undertext: string;
  undertextNyckel: OrdlistaNyckel;
  href: string;
}[] = [
  {
    tal: ANTAL_KURSER,
    etikett: "kurser",
    etikettNyckel: "home.siffraKurser",
    undertext: "Från bokföringens grunder till AK1TS våglära.",
    undertextNyckel: "home.siffraKurserUt",
    href: "/kurser",
  },
  {
    tal: ANTAL_QUIZ,
    etikett: "quiz-frågor",
    etikettNyckel: "home.siffraQuiz",
    undertext: "Varje kurs avslutas med quiz som prickar kunskapsluckorna.",
    undertextNyckel: "home.siffraQuizUt",
    href: "/kurser",
  },
  {
    tal: ANTAL_BOKER,
    etikett: "heltäckta böcker",
    etikettNyckel: "home.siffraBoker",
    undertext: "Från Security Analysis till Poor Charlie's Almanack.",
    undertextNyckel: "home.siffraBokerUt",
    href: "/kurser",
  },
  {
    tal: ANTAL_VERKTYG,
    etikett: "verktyg",
    etikettNyckel: "home.siffraVerktyg",
    undertext: "Kalkylatorn, Vågfundamentet, Konfluensradarn med flera.",
    undertextNyckel: "home.siffraVerktygUt",
    href: "/kalkylator",
  },
  {
    tal: 0,
    suffix: " kr",
    etikett: "att börja",
    etikettNyckel: "home.siffraStart",
    undertext: "Fas 1 är gratis — för alltid. Inget kort, ingen bindningstid.",
    undertextNyckel: "home.siffraStartUt",
    href: "/medlemskap",
  },
];

/* ---------- Varför AK1A? — fyra skäl, varje kort länkar dit det lovar ---------- */

const SKAL: {
  ikon: typeof BookOpen;
  rubrik: string;
  rubrikNyckel: OrdlistaNyckel;
  mening1: string;
  mening1Nyckel: OrdlistaNyckel;
  /** {parameter}-interpolation till mening1 (t.ex. {bocker} — våg 78 A4). */
  mening1Parametrar?: Record<string, string | number>;
  mening2: string;
  mening2Nyckel: OrdlistaNyckel;
  lankText: string;
  lankNyckel: OrdlistaNyckel;
  href: string;
}[] = [
  {
    ikon: BookOpen,
    rubrik: "Fundamental analys från grunden",
    rubrikNyckel: "home.skal1Rubrik",
    mening1:
      "Från Grahams marginal of safety till modern räkenskapsanalys — AKM1:s 20 variabler ger dig en struktur i stället för gissningar.",
    mening1Nyckel: "home.skal1Mening1",
    mening2:
      "Varje steg förklaras på svenska, med quiz som tvingar dig att tänka själv.",
    mening2Nyckel: "home.skal1Mening2",
    lankText: "Öppna kurserna",
    lankNyckel: "home.skal1Lank",
    href: "/kurser",
  },
  {
    ikon: LibraryBig,
    rubrik: "Byggd på mästarnas böcker",
    rubrikNyckel: "home.skal2Rubrik",
    mening1:
      `${ANTAL_BOKER} böcker — var och en en egen kurs med källkort som pekar på originalkapitlen.`,
    mening1Nyckel: "home.skal2Mening1",
    mening1Parametrar: { bocker: ANTAL_BOKER },
    mening2:
      "Du lär dig mästarnas metoder i original, inte andrahandsreferat.",
    mening2Nyckel: "home.skal2Mening2",
    lankText: "Utforska bokkurserna",
    lankNyckel: "home.skal2Lank",
    href: "/kurser",
  },
  {
    ikon: Calculator,
    rubrik: "Verktygen ingår",
    rubrikNyckel: "home.skal3Rubrik",
    mening1:
      "AKM1-kalkylatorn väger 20 fundamentalvariabler, Vågfundamentet visar dem som tidsserier och Konfluensradarn (Fas 3) låter värde möta vågor.",
    mening1Nyckel: "home.skal3Mening1",
    mening2: "Samma system som kurserna lär ut — ingen extra kostnad.",
    mening2Nyckel: "home.skal3Mening2",
    lankText: "Öppna kalkylatorn",
    lankNyckel: "home.skal3Lank",
    href: "/kalkylator",
  },
  {
    ikon: Award,
    rubrik: "Certifikat — och vägen vidare",
    rubrikNyckel: "home.skal4Rubrik",
    mening1:
      "Klara kurser, samla XP och tjäna ditt certifikat på nivå A–D.",
    mening1Nyckel: "home.skal4Mening1",
    mening2:
      "I Fas 2 öppnas personlig utbildning och chansen att bli certifierad representant för AK1nvestor.",
    mening2Nyckel: "home.skal4Mening2",
    lankText: "Se certifikatet",
    lankNyckel: "home.skal4Lank",
    href: "/certifikat",
  },
];

/* ---------- Verktygschips i kort 3 (varje verktyg klickbart) ---------- */

const VERKTYGSLANKAR: { nyckel: OrdlistaNyckel; href: string }[] = [
  // Rond 149 (branding spår 11): övningsentrén FÖRST — hero-underrubriken
  // lovar "från första årsredovisningen"; chipet är den kortaste vägen dit.
  { nyckel: "nav.rapportakademin", href: "/rapportakademin" },
  { nyckel: "nav.akm1Kalkylatorn", href: "/kalkylator" },
  { nyckel: "nav.vagfundamentet", href: "/vagfundament" },
  { nyckel: "nav.konfluensradarn", href: "/konfluens" },
];

/* ---------- Stigen: Fas 1 från konto till certifikat ---------- */

const STIG: {
  num: string;
  rubrik: string;
  rubrikNyckel: OrdlistaNyckel;
  undertext: string;
  undertextNyckel: OrdlistaNyckel;
  /** {parameter}-interpolation till undertexten (t.ex. {kurser} — våg 78 A4). */
  undertextParametrar?: Record<string, string | number>;
  href: string;
}[] = [
  {
    num: "1",
    rubrik: "Skapa kontot",
    rubrikNyckel: "home.stig1Rubrik",
    undertext: "0 kr · en minut",
    undertextNyckel: "home.stig1Undertext",
    href: "/logga-in",
  },
  {
    num: "2",
    rubrik: "Alla kurser upplåsta",
    rubrikNyckel: "home.stig2Rubrik",
    undertext: `${ANTAL_KURSER} kurser, direkt`,
    undertextNyckel: "home.stig2Undertext",
    undertextParametrar: { kurser: ANTAL_KURSER },
    href: "/kurser",
  },
  {
    num: "3",
    rubrik: "XP & badges",
    rubrikNyckel: "home.stig3Rubrik",
    undertext: "Poäng, nivåer, troféer",
    undertextNyckel: "home.stig3Undertext",
    href: "/badges",
  },
  {
    num: "4",
    rubrik: "Certifikat A–D",
    rubrikNyckel: "home.stig4Rubrik",
    undertext: "Bevis på kunskapen",
    undertextNyckel: "home.stig4Undertext",
    href: "/certifikat",
  },
];

/* ---------- Animerad räknare (count-up vid scroll-in, respekterar reduced motion) ---------- */

function AnimeraTal({ mal, suffix }: { mal: number; suffix?: string }) {
  // Initieras på MÅLET (våg 195, brandgenomgång P3): SSR-/no-JS-vyn bär
  // det äkta talet i stället för "0 kurser" för förcrawlers; count-up:en
  // börjar först i starta() nedan och syns bara för JS-användare.
  const [varde, setVarde] = React.useState(mal);
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
      setVarde(0); // från SSR-slutvärdet ner till noll — count-up börjar här
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
  const { t } = useSprak();

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
                {t("home.heroRubrik")}
              </h1>

              <p className="mt-5 max-w-2xl font-serif text-lg italic leading-relaxed text-[#E8C766] sm:text-xl">
                {t("home.heroUnderrubrik", {
                  kurser: ANTAL_KURSER,
                  quiz: ANTAL_QUIZ.toLocaleString("sv-SE"),
                })}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/logga-in"
                  prefetch={false}
                  // prefetch={false} (o17/o41/o49-precedensen): herons knappar
                  // sitter i viewport på sajtens entré ⇒ varje kall besökare
                  // prefetchar /logga-in ×2 omgångar innan något klickats. Se
                  // data/forskning/OPTIMERING/o56 (spårets prefetch-familj).
                  className="btn-guld-signatur inline-flex items-center gap-2 px-8 py-4 text-base font-bold sm:text-lg"
                >
                  {t("home.bliMedlemGratis")} <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/kurser"
                  prefetch={false}
                  // Samma kur som grannknappen: /kurser-flighten är ~35 KiB i
                  // tre omgångar (multiomgångs-prefetch på EN länk, o50 §2) —
                  // tyngsta enskilla spillposten på startsidan. Hover-prefetch
                  // lever; klickkostnad ~100–300 ms (ISR-sida).
                  className="inline-flex items-center gap-2 rounded-lg border border-[#E8C766]/50 px-6 py-4 text-base font-semibold text-[#E8C766] transition-colors hover:bg-[#E8C766]/10"
                >
                  {t("home.utforskaKurserna")}
                </Link>
              </div>

              {/* Mikrostrip — avgörande invändningar omtyglade på en rad */}
              <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-wide text-[#EDE6D6]/70">
                <span>
                  <span className="mr-1.5 inline-block h-1 w-1 rounded-full bg-[#E8C766] align-middle" />
                  {t("home.heroMikro1")}
                </span>
                <span>
                  <span className="mr-1.5 inline-block h-1 w-1 rounded-full bg-[#E8C766] align-middle" />
                  {t("home.heroMikro2")}
                </span>
                <span>
                  <span className="mr-1.5 inline-block h-1 w-1 rounded-full bg-[#E8C766] align-middle" />
                  {t("home.heroMikro3")}
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
            <Eyebrow>{t("home.siffrorEyebrow")}</Eyebrow>
            <HonestyTag kind="matt" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {SIFFERBAND.map((s) => (
              <Link
                key={s.etikett}
                href={s.href}
                prefetch={false}
                // prefetch={false} (o63): bandet ligger direkt under vecket —
                // Next:s länk-observer med ~200 px rootMargin räknar kort 1–2
                // (/kurser) som synliga vid kall entré på mobil, vilket drog
                // 3 auto-prefetch-flighter (~36 KiB) ~0,9 s efter load
                // (CDP-IO-audit 2026-09-18). Hover-prefetch lever.
                className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-gold/50 hover:shadow-md"
              >
                <p className="font-serif text-4xl font-bold leading-none text-foreground sm:text-5xl">
                  <AnimeraTal mal={s.tal} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t(s.etikettNyckel)}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {t(s.undertextNyckel)}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gold opacity-0 transition-opacity group-hover:opacity-100">
                  {t("notis.gatDit")} <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── 3 · VARFÖR AK1A? — fyra skäl, hela kortet klickbart ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Eyebrow>{t("home.varforEyebrow")}</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-serif text-3xl font-bold text-balance">
            {t("home.varforRubrik")}
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
                  {t(s.rubrikNyckel)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(s.mening1Nyckel, s.mening1Parametrar)} {t(s.mening2Nyckel)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 pt-2 text-xs font-semibold uppercase tracking-wider text-gold transition-transform group-hover:translate-x-0.5">
                  {t(s.lankNyckel)} <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>

          {/* Verktygen som chips — varje namn klickbart + Fas 2-vägen vidare */}
          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t("home.verktygIdag")}</span>
            {VERKTYGSLANKAR.map((v) => (
              <Link
                key={v.href}
                href={v.href}
                className="rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs font-semibold text-gold transition-colors hover:bg-gold/15 max-md:inline-flex max-md:min-h-[52px] max-md:items-center max-md:py-0"
              >
                {t(v.nyckel)}
              </Link>
            ))}
            <span className="ml-auto text-xs text-muted-foreground">
              {t("home.fas2Etikett")}{" "}
              <Link href="/fas2-ansok" className="font-semibold text-gold hover:underline max-md:inline-flex max-md:min-h-[52px] max-md:items-center">
                {t("home.bliCertifierad")}
              </Link>{" "}
              ·{" "}
              <Link href="/medlemskap" className="font-semibold text-gold hover:underline max-md:inline-flex max-md:min-h-[52px] max-md:items-center">
                {t("home.seMedlemskapen")}
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
          <Eyebrow>{t("home.stigEyebrow")}</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold text-balance">
            {t("home.stigRubrik")}
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t("home.stigUnderrubrik")}
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
                    {t(steg.rubrikNyckel)}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t(steg.undertextNyckel, steg.undertextParametrar)}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gold opacity-70 transition-opacity group-hover:opacity-100">
                    {t("notis.gatDit")} <ArrowRight className="h-3 w-3" />
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
                {t("home.slutOvan")}
              </p>
              <h2 className="mt-4 max-w-2xl font-serif text-3xl font-bold leading-tight text-balance text-[#EDE6D6] sm:text-4xl">
                {t("home.slutRubrik")}
              </h2>
              <p className="mt-3 max-w-xl font-serif text-base italic leading-relaxed text-[#E8C766] sm:text-lg">
                {t("home.slutUnderrubrik", { kurser: ANTAL_KURSER })}
              </p>
              <Link
                href="/logga-in"
                className="btn-guld-signatur mt-8 inline-flex items-center gap-2 px-8 py-4 text-base font-bold sm:text-lg"
              >
                {t("home.bliMedlemGratis")} <span aria-hidden="true">→</span>
              </Link>
              <p className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs tracking-wide text-[#EDE6D6]/70">
                <span>{t("home.slutMikro1")}</span>
                <span aria-hidden="true">·</span>
                <span>{t("home.heroMikro3")}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {t("home.slutOsaker")}{" "}
                  <Link
                    href="/kurser"
                    className="font-semibold text-[#E8C766] hover:underline"
                  >
                    {t("home.slutTitta")}
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
