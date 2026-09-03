"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  FlaskConical,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useAk1aStore } from "@/lib/ak1a-store";
import { Eyebrow, GoldRule, HonestyTag } from "../primitives";
import { WaveMatrix } from "../wave-matrix";
import { SocialProof } from "../social-proof";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* ---------- marknadsförings-data (pedagogik-ton: vi tipsar, tvingar aldrig) ---------- */

const SNABBLANKAR = [
  {
    ikon: "⚡",
    titel: "Testa Dagens Pass",
    text: "5 min på riktiga marknadsdata",
    href: "/dagens-pass",
  },
  {
    ikon: "🧠",
    titel: "Se din profil",
    text: "Vilken analytiker är du?",
    href: "/profil",
  },
  {
    ikon: "🌊",
    titel: "Öppna Vågfundamentet",
    text: "20 variabler × 5 horisonter — live",
    href: "/vagfundament",
  },
] as const;

const ELEVCITAT = [
  "Första gången jag FÖRSTÅR mina aktier",
  "Quiz:en tvingar mig att tänka",
  "Vågfundamentet förändrade allt",
] as const;

export function HomeSection() {
  const { setSection, setLevel } = useAk1aStore();

  return (
    <div className="paper-texture">
      {/* ───────────── HERO — Marin dokument-öppning (privatabanks-certifikat) ───────────── */}
      <section className="relative border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
          {/* Marin panel med gravör-ram: ytterram + inre tunn ram = double-frame certifikat */}
          <div className="marin-panel relative overflow-hidden rounded-2xl border border-gold/40 p-2 sm:p-3">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
            <div className="relative rounded-xl border border-[#E8C766]/20 p-8 sm:p-12">
              {/* Överrad — bankfirmans signeringsrad, bokstavad i guld-serif */}
              <p className="flex flex-wrap items-baseline gap-x-4 font-serif text-[10px] uppercase tracking-[0.35em] text-[#E8C766]">
                <span>A · K · 1 · A</span>
                <span>R E S E A R C H</span>
                <span>L A B</span>
              </p>

              <h1 className="mt-6 max-w-3xl font-serif text-4xl font-bold leading-[1.05] tracking-tight text-[#EDE6D6] text-balance sm:text-5xl lg:text-6xl">
                Institutionell metodik. Byggd för privatpersoner.
              </h1>

              <p className="mt-5 max-w-2xl font-serif text-lg italic leading-relaxed text-[#E8C766] sm:text-xl">
                Djupare än en blogg. Tydligare än en bank. Snabbare än en
                utbildning.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={() => setSection("kurser")}
                  className="bg-[#E8C766] font-bold text-[#081120] hover:bg-[#E8C766]/90"
                >
                  Öppna läroplanen <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    if (typeof window !== "undefined") window.location.href = "/manifest";
                  }}
                  className="border-[#E8C766]/50 bg-transparent text-[#E8C766] hover:bg-[#E8C766]/10 hover:text-[#E8C766] dark:bg-transparent"
                >
                  Så tänker vi
                </Button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ───────────── SOCIALT BEVIS — levande statistik + elevröster ─────────────
          Ersätter den gamla enradiga statist-rad som låg i heron: samma budskap,
          fast med roterande räknare, sammanfattande strip och elevröster. */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <SocialProof />
        </div>
      </section>

      {/* ───────────── PROVA GRATIS — tre dörrar in, utan konto ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="marin-panel relative overflow-hidden rounded-2xl border border-gold/40 p-2 sm:p-3">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-transparent" />
            <div className="relative rounded-xl border border-[#E8C766]/20 p-8 sm:p-10">
              <p className="font-serif text-[10px] uppercase tracking-[0.35em] text-[#E8C766]">
                Prova gratis · utan konto
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="max-w-xl font-serif text-3xl font-bold leading-tight text-balance text-[#EDE6D6] sm:text-4xl">
                  Känn på metoden — på riktiga data, idag.
                </h2>
                <p className="max-w-sm text-sm leading-relaxed text-[#EDE6D6]/70">
                  Tre dörrar in i labbet. Ingen registrering, ingen kortuppgift
                  — bara metoden, dig och marknaden.
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {SNABBLANKAR.map((lank) => (
                  <Link
                    key={lank.href}
                    href={lank.href}
                    className="group flex min-h-[44px] flex-col rounded-xl border border-[#E8C766]/25 bg-black/20 p-5 transition-all hover:border-[#E8C766]/60 hover:bg-black/30"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#E8C766]/30 bg-[#E8C766]/10 text-xl"
                    >
                      {lank.ikon}
                    </span>
                    <span className="mt-4 font-serif text-xl font-bold leading-snug text-[#EDE6D6]">
                      {lank.titel}{" "}
                      <span
                        aria-hidden="true"
                        className="inline-block text-[#E8C766] transition-transform group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </span>
                    <span className="mt-1 text-sm leading-relaxed text-[#EDE6D6]/70">
                      {lank.text}
                    </span>
                  </Link>
                ))}
              </div>

              <p className="mt-6 text-center text-xs tracking-wide text-[#EDE6D6]/50">
                Vi tipsar — du väljer väg. Allt öppnas direkt, inget konto
                krävs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── ELEVRÖSTER — citat-band i marin ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <div className="marin-panel relative overflow-hidden rounded-2xl border border-gold/30 px-6 py-8 sm:px-10 sm:py-9">
            <div
              className="pointer-events-none absolute inset-3 rounded-xl border border-gold/15"
              aria-hidden="true"
            />
            <div className="relative grid gap-8 text-center sm:grid-cols-3 sm:gap-6">
              {ELEVCITAT.map((citat) => (
                <blockquote key={citat}>
                  <p className="font-serif text-lg italic leading-snug text-[#EDE6D6] sm:text-xl">
                    <span className="text-[#E8C766]">“</span>
                    {citat}
                    <span className="text-[#E8C766]">”</span>
                  </p>
                </blockquote>
              ))}
            </div>
            <p className="relative mt-8 text-center font-serif text-sm italic tracking-wide text-[#E8C766]/80">
              — verkliga elevers ord
            </p>
          </div>
        </div>
      </section>

      {/* ───────────── AK1A I SIFFROR ───────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="grid gap-6 sm:grid-cols-3">
            <NumberStat
              value="200+"
              label="kurser"
              kind="matt"
              caption="20 grundläggande AKM1 + 287 fördjupande."
            />
            <NumberStat
              value="99"
              label="sidor per analys"
              kind="matt"
              caption="Institutionsdjup. Varje siffra hyperlänkad till källa."
            />
            <NumberStat
              value="5 / 8"
              label="organ i drift"
              kind="metodmal"
              caption="Vi siktar på 8 synkrona organ. Idag är 5 live."
            />
          </div>
        </div>
      </section>

      {/* ───────────── BÖRJA DIN RESA ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Börja din resa</Eyebrow>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <Card className="overflow-hidden border-gold/30 bg-gradient-to-br from-card to-gold/[0.03]">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-5xl font-bold text-gold">V1</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tillväxt · 8 %
                  </span>
                </div>
                <h3 className="mt-3 font-serif text-2xl font-bold">
                  Försäljningstillväxt
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Den första av 19 fundamentala variabler. Bygg din AKM1-grund
                  steg för steg.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <HonestyTag kind="matt" />
                  <span className="text-xs text-muted-foreground">15 min · Nybörjare</span>
                </div>
                <Button
                  className="mt-5 bg-gold text-background hover:bg-gold/90"
                  onClick={() => {
                    setLevel("nyborjare");
                    setSection("kurser");
                  }}
                >
                  Starta kurs <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </Card>

            <div className="flex flex-col justify-center rounded-lg border border-border bg-card p-6">
              <Eyebrow>5 minuter till insikt</Eyebrow>
              <h3 className="mt-2 font-serif text-xl font-bold">Så här börjar du.</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tre steg. Från att se en institutionell analys till att göra en
                själv. Inget konto krävs för att börja.
              </p>
            </div>
          </div>

          {/* 3 steps */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StepCard
              num="1"
              title="Se en analys"
              body="En 99-sidig institutionell analys, sammanfattad på 2 minuter."
              cta="VISA PRECIS-ANALYSEN →"
              icon={<BookOpen className="h-5 w-5" />}
              onClick={() => setSection("prec")}
            />
            <StepCard
              num="2"
              title="Lär dig metoden"
              body="AKM1:s 20 variabler. Inte gissning — struktur."
              cta="BÖRJA MED VARIABEL 1 →"
              icon={<GraduationCap className="h-5 w-5" />}
              onClick={() => setSection("kurser")}
            />
            <StepCard
              num="3"
              title="Gör det själv"
              body="Öppna Labbet. Reproducera analysen. Bli analytiker."
              cta="ÖPPNA LABBET →"
              icon={<FlaskConical className="h-5 w-5" />}
              onClick={() => setSection("labb")}
            />
          </div>
        </div>
      </section>

      {/* ───────────── AK1T VÅG-MATRIS (signature viz) ───────────── */}
      <WaveMatrix />

      {/* ───────────── VEM ÄR DU? ───────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>Vem är du?</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold text-balance">
            Tre vägar in i samma metodik.
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Oavsett var du börjar når du samma destination: att tänka som en
            analytiker.
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <TierCard
              tier="TIER 2 · 3"
              title="Ny till investering?"
              body="Du har ingen broker. Du vill förstå innan du köper."
              cta="GÅ TILL UTBILDNING"
              onClick={() => {
                setLevel("nyborjare");
                setSection("kurser");
              }}
            />
            <TierCard
              tier="TIER 1"
              title="Redan aktiv investerare?"
              body="Du har Avanza/Nordnet. Du vill veta vad du äger."
              cta="SE ANALYSERNA"
              onClick={() => setSection("prec")}
              highlight
            />
            <TierCard
              tier="TIER 3"
              title="Framtidens analytiker?"
              body="Du vill tänka som Carnegie — fast på svenska, fast för dig."
              cta="ÖPPNA LABBET"
              onClick={() => setSection("labb")}
            />
          </div>
        </div>
      </section>

      {/* ───────────── MANIFEST ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 text-center">
          <Eyebrow>Styrelsebeslut #1 · Manifest</Eyebrow>
          <GoldRule className="mx-auto my-6 max-w-xs" />
          <blockquote className="font-serif text-2xl font-medium leading-relaxed text-balance sm:text-3xl">
            <span className="text-gold">“</span>
            De flesta tror att privatpersoner inte kan tänka som institutionella
            analytiker — sanningen är att med rätt metodik kan en svensk
            retail-investerare göra analyser som överträffar sälj-sidans
            research.
            <span className="text-gold">”</span>
          </blockquote>
          <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            — AK1A Research Lab · Styrelsebeslut #1
          </p>
        </div>
      </section>

      {/* ───────────── ÄRLIGHET FOREVER ───────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Eyebrow>Ärlighet forever</Eyebrow>
              <h2 className="mt-3 font-serif text-3xl font-bold">
                Vi publicerar vad andra döljer.
              </h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Varje kvantitativt påstående är märkt:{" "}
                <HonestyTag kind="matt" /> (historiskt verifierbar) eller{" "}
                <HonestyTag kind="metodmal" /> (vad vi siktar mot, inte vad vi
                uppnått).
              </p>
            </div>
            <Button variant="outline" onClick={() => setSection("om-oss")}>
              Fullständig ärlighets-dashboard <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <HonestyCard kind="matt" value="200+" label="KURSER PUBLICERADE" sub="20 grundläggande AKM1 + 287 fördjupande." />
            <HonestyCard kind="matt" value="99" label="SIDOR PER ANALYS" sub="Institutionsdjup. Varje siffra hyperlänkad till källa." />
            <HonestyCard kind="metodmal" value="5 / 8" label="AI-ORGAN I DRIFT" sub="Vi siktar på 8 synkrona organ. Idag är 5 live." />
            <HonestyCard kind="matt" value="0" label="PUSH-NOTISER OM PRISER" sub="Pro-metod. Du bestämmer när du tittar." />
          </div>
        </div>
      </section>

      {/* ───────────── GÅ VIDARE ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>◆ Fortsätt utforska</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold">Gå vidare</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <CtaCard
              title="Läs PREC-analysen"
              sub="99 sidor institutionell analys"
              onClick={() => setSection("prec")}
            />
            <CtaCard
              title="Börja med Power 20"
              sub="19 fundamentala variabler"
              onClick={() => setSection("kurser")}
            />
            <CtaCard
              title="Öppna Labbet"
              sub="Analys-konsolen"
              onClick={() => setSection("labb")}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- sub-components ---------- */

function NumberStat({
  value,
  label,
  kind,
  caption,
}: {
  value: string;
  label: string;
  kind: "matt" | "metodmal";
  caption: string;
}) {
  return (
    <div className="text-center sm:text-left">
      <div className="flex items-center justify-center gap-2 sm:justify-start">
        <HonestyTag kind={kind} />
      </div>
      <p className="mt-2 font-serif text-5xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto sm:mx-0">
        {caption}
      </p>
    </div>
  );
}

function StepCard({
  num,
  title,
  body,
  cta,
  icon,
  onClick,
}: {
  num: string;
  title: string;
  body: string;
  cta: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-start rounded-lg border border-border bg-card p-5 text-left transition-all hover:border-gold/50 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <span className="font-serif text-3xl font-bold text-gold">{num}</span>
        <span className="text-gold">{icon}</span>
      </div>
      <h3 className="mt-3 font-serif text-lg font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-gold group-hover:underline">
        {cta}
      </span>
    </button>
  );
}

function TierCard({
  tier,
  title,
  body,
  cta,
  onClick,
  highlight = false,
}: {
  tier: string;
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col rounded-lg border p-6 text-left transition-all hover:shadow-lg ${
        highlight
          ? "border-gold bg-gradient-to-br from-card to-gold/[0.04]"
          : "border-border bg-card hover:border-gold/50"
      }`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
        {tier}
      </span>
      <h3 className="mt-2 font-serif text-xl font-bold">{title}</h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{body}</p>
      <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-gold group-hover:underline">
        {cta} →
      </span>
    </button>
  );
}

function HonestyCard({
  kind,
  value,
  label,
  sub,
}: {
  kind: "matt" | "metodmal";
  value: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <HonestyTag kind={kind} />
      <p className="mt-3 font-serif text-4xl font-bold leading-none">{value}</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{sub}</p>
    </div>
  );
}

function CtaCard({
  title,
  sub,
  onClick,
}: {
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center justify-between rounded-lg border border-border bg-card p-5 text-left transition-all hover:border-gold/50 hover:shadow-md"
    >
      <span>
        <span className="block font-serif text-lg font-bold">{title}</span>
        <span className="block text-xs text-muted-foreground">{sub}</span>
      </span>
      <ChevronRight className="h-5 w-5 text-gold transition-transform group-hover:translate-x-1" />
    </button>
  );
}
