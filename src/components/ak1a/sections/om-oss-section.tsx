"use client";

import * as React from "react";
import {
  ArrowRight,
  Check,
  GraduationCap,
  FlaskConical,
  BookOpen,
  Mail,
  MapPin,
  Quote,
  ChevronRight,
} from "lucide-react";
import { useAk1aStore } from "@/lib/ak1a-store";
import { ORGANS, PHASES, type Organ } from "@/lib/ak1a/data";
import {
  Eyebrow,
  GoldRule,
  HonestyTag,
  OrganGlyph,
} from "@/components/ak1a/primitives";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/* ============================================================
 * AK1A Research Lab — OM OSS section
 * The "research institute" page: manifesto, the contrarian
 * truth, the 8 AI-organs, the 5-phase cycle, the honesty
 * dashboard, and the researchers.
 * ============================================================ */

const MANIFEST_POINTS: string[] = [
  "De flesta tror att privatpersoner inte kan tänka som institutionella analytiker. Sanningen är att med rätt metodik kan en svensk retail-investerare göra analyser som överträffar sälj-sidans research.",
  "Varje siffra har en källa. Varje påstående har en etikett: MÄTT eller METODMÅL.",
  "Metoden är synlig. Användaren ser hur en slutsats nås — inte bara slutsatsen.",
  "Vi säljer inte körningar. Vi lär ut att köra.",
  "Långsamt och rätt. Anti-casino. Ingen FOMO, inga push-notiser om priser.",
];

const MARKET_BELIEFS: string[] = [
  "Indexfonder är bäst för alla",
  "Retail-investerare kan inte analysera bolag",
  "Tid är risk",
  "Hastighet är värde",
];

const WE_KNOW: { text: string; tag?: "matt" | "metodmal" }[] = [
  { text: "Djup metodik slår diversifiering för den som orkar lära", tag: "metodmal" },
  { text: "Med 20 variabler kan vem som helst göra institutionell analys", tag: "matt" },
  { text: "Tid är insikt, inte risk" },
  { text: "Djup är värde — hastighet är kasino" },
];

const HONESTY_STATS: {
  kind: "matt" | "metodmal";
  value: string;
  label: string;
  sub: string;
}[] = [
  { kind: "matt", value: "1", label: "Publicerade analyser", sub: "PREC.ST — 99-sidig rapport" },
  { kind: "matt", value: "200+", label: "Kurser i drift", sub: "Moduler tillgängliga idag" },
  { kind: "metodmal", value: "5 av 8", label: "Organ aktiva", sub: "Vi siktar på 8/8" },
  { kind: "matt", value: "0", label: "Push-notiser om priser", sub: "Anti-casino" },
];

export function OmOssSection() {
  const { setSection } = useAk1aStore();

  const scrollToManifest = () => {
    if (typeof document === "undefined") return;
    const el = document.getElementById("manifest");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const activeCount = ORGANS.filter((o) => o.active).length;

  return (
    <div className="paper-texture">
      {/* ───────────────── HERO ───────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <Eyebrow>Forskningsinstitutet</Eyebrow>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Vi bygger Sveriges enda institutionella metodik
              <span className="text-gold"> för privatpersoner.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              AK1A Research Lab är inte en app. Det är en metodik som råkar ha
              ett gränssnitt.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={scrollToManifest}
                className="bg-gold text-background hover:bg-gold/90"
              >
                Läs manifestet <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setSection("prec")}
              >
                Se analyserna
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── MANIFEST ───────────────── */}
      <section id="manifest" className="border-b border-border scroll-mt-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
          <Card className="border-gold/30 bg-card p-6 sm:p-10">
            <Eyebrow>Styrelsebeslut #1 · Manifest</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
              Manifest
            </h2>
            <p className="mt-2 font-serif italic text-muted-foreground">
              Vad vi tror — och varför.
            </p>
            <GoldRule className="my-6 max-w-xs" />
            <ul className="space-y-5">
              {MANIFEST_POINTS.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-base leading-relaxed text-foreground/90">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* ───────────────── DEN KONTRÄRA SANINGEN ───────────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="max-w-3xl">
            <Eyebrow>Den konträra sanningen</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
              Vår tes — och varför den är osynlig för marknaden.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {/* 01 — MARKNADEN TROR */}
            <Card className="border-border bg-card p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="font-serif text-2xl font-bold text-neutral-signal">
                  01
                </span>
                <Separator orientation="vertical" className="h-6" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-signal">
                  Marknaden tror
                </span>
              </div>
              <ul className="mt-6 space-y-3">
                {MARKET_BELIEFS.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm sm:text-base">
                    <span className="mt-1 text-neutral-signal">—</span>
                    <span className="text-foreground/80">{b}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* 02 — VI VET */}
            <Card className="border-gold/40 bg-gradient-to-br from-card to-gold/[0.04] p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="font-serif text-2xl font-bold text-gold">02</span>
                <Separator orientation="vertical" className="h-6 bg-gold/40" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                  Vi vet
                </span>
              </div>
              <ul className="mt-6 space-y-4">
                {WE_KNOW.map((w, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 text-gold">◆</span>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium sm:text-base text-foreground">
                        {w.text}
                      </span>
                      {w.tag && <HonestyTag kind={w.tag} />}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* ───────────────── AK1A:S 8 ORGANER ───────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="max-w-3xl">
            <Eyebrow>Meta-systemet</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
              AK1A:s 8 organer
            </h2>
            <p className="mt-2 font-serif italic text-muted-foreground">
              Forskningens 8 naturliga avdelningar.
            </p>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Varje seriöst forskningsinstitut i historien har haft dessa
              funktioner. AK1A namnger dem explicit så att användaren ser
              tankens struktur.
            </p>
          </div>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs">
            <span className="font-semibold uppercase tracking-wider text-muted-foreground">
              Status:
            </span>
            <LegendDot color="bg-gold" label="AKTIV" />
            <LegendDot color="bg-gold-soft" label="DJUPARBETE" />
            <LegendDot color="bg-neutral-signal" label="SYNKAR" />
            <Separator orientation="vertical" className="hidden h-4 sm:block" />
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">{activeCount} av 8</span>{" "}
              organ aktiva idag · <HonestyTag kind="metodmal" className="ml-1" />{" "}
              8/8
            </span>
          </div>

          {/* Organ accordion grid */}
          <Accordion
            type="single"
            collapsible
            className="mt-8 grid gap-4 lg:grid-cols-2"
          >
            {ORGANS.map((organ) => (
              <OrganCard key={organ.symbol} organ={organ} />
            ))}
          </Accordion>
        </div>
      </section>

      {/* ───────────────── 5-FAS-CYKELN ───────────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="max-w-3xl">
            <Eyebrow>Arbetscykeln</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
              5-fas-cykeln
            </h2>
            <p className="mt-2 font-serif italic text-muted-foreground">
              Samlas. Tänka. Besluta. Skapa. Förverkliga.
            </p>
          </div>

          {/* Horizontal on lg, vertical on mobile */}
          <div className="mt-10 grid gap-4 lg:grid-cols-5 lg:items-stretch">
            {PHASES.map((phase, i) => (
              <React.Fragment key={phase.num}>
                <PhaseStep phase={phase} isLast={i === PHASES.length - 1} />
              </React.Fragment>
            ))}
          </div>

          <p className="mt-8 max-w-3xl text-sm text-muted-foreground leading-relaxed">
            Varje analys passerar samma fem faser — i ordning, utan genvägar.
            Det är detta som gör slutsatserna reproducerbara.
          </p>
        </div>
      </section>

      {/* ───────────────── HONESTY DASHBOARD ───────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="max-w-3xl">
            <Eyebrow>Ärlighet forever</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
              Vi publicerar vad andra döljer.
            </h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              Varje siffra nedan är märkt MÄTT eller METODMÅL. Inga påhittade
              statistik. Inga falska framsteg.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HONESTY_STATS.map((s, i) => (
              <HonestyStat key={i} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── FORSKARNA ───────────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
          <div className="max-w-3xl">
            <Eyebrow>Teamet</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
              Forskarna
            </h2>
            <p className="mt-2 font-serif italic text-muted-foreground">
              Ett forskarlag, inte en influencer-stable.
            </p>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Vi presenterar teamet som forskare, inte influencers. Varje roll
              beskriver vad som forskas, inte vad som poseras.
            </p>
          </div>

          <Card className="mt-8 border-gold/30 bg-card p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* Avatar */}
              <Avatar className="h-20 w-20 shrink-0 border-2 border-gold/50">
                <AvatarFallback className="bg-gold/15 font-serif text-3xl font-bold text-gold">
                  A
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h3 className="font-serif text-2xl font-bold">Ak1 Apex Nexus</h3>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-gold">
                  Grundare & Strategisk ledare
                </p>

                <div className="mt-5 space-y-4">
                  <ResearchField
                    label="Forskningsfokus"
                    body="AKM1-metodik, institutionell överföring till retail."
                  />
                  <ResearchField
                    label="Rekryteringspolicy"
                    body="Teamet växer. Vi rekryterar inte marketing-folk — vi rekryterar analytiker som kan förklara."
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <HonestyTag kind="metodmal" />
                  <span className="text-xs text-muted-foreground">
                    Inga headshots. Inga titlar. Bara forskning.
                  </span>
                </div>

                <Separator className="my-6" />

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Mail className="mt-0.5 h-4 w-4 text-gold" />
                    <span>
                      <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                        Kontakt
                      </span>
                      <span className="text-foreground">info@ak1nvestor.com</span>
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 text-gold" />
                    <span>
                      <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                        Plats
                      </span>
                      <span className="text-foreground">
                        Online — kontakt via e-post
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ───────────────── CLOSING CTA — GÅ VIDARE ───────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <Eyebrow>◆ Fortsätt utforska</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
            Gå vidare
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Tre vägar in i samma metodik. Välj den som passar var du är idag.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <CtaCard
              icon={<BookOpen className="h-5 w-5" />}
              title="Läs PREC-analysen"
              sub="99-sidig institutionell rapport"
              onClick={() => setSection("prec")}
            />
            <CtaCard
              icon={<GraduationCap className="h-5 w-5" />}
              title="Börja med Power 20"
              sub="19 fundamentala variabler"
              onClick={() => setSection("kurser")}
            />
            <CtaCard
              icon={<FlaskConical className="h-5 w-5" />}
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

/* ============================================================
 * Sub-components
 * ============================================================ */

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-full", color)} />
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

function stateStyles(state: Organ["state"]) {
  switch (state) {
    case "AKTIV":
      return "border-gold/40 bg-gold/10 text-gold";
    case "DJUPARBETE":
      return "border-gold-soft/40 bg-gold-soft/10 text-gold-soft";
    case "SYNKAR":
      return "border-neutral-signal/40 bg-neutral-signal/10 text-neutral-signal";
  }
}

function OrganCard({ organ }: { organ: Organ }) {
  return (
    <AccordionItem
      value={organ.symbol}
      className="rounded-lg border border-border bg-card px-5 py-4 data-[state=open]:border-gold/40 data-[state=open]:shadow-sm"
    >
      <AccordionTrigger className="hover:no-underline">
        <div className="flex w-full items-start gap-4 pr-2">
          <OrganGlyph symbol={organ.symbol} active={organ.active} />
          <div className="flex-1 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {organ.verb}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wider",
                  stateStyles(organ.state)
                )}
              >
                {organ.state}
              </Badge>
            </div>
            <h3 className="mt-1 font-serif text-lg font-bold leading-tight">
              {organ.name}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {organ.role}
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-2">
        <div className="mt-2 space-y-4 pl-1">
          {/* Responsibilities */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Ansvarsområden
            </p>
            <ul className="mt-2 space-y-1.5">
              {organ.responsibilities.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-foreground/80"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Metodmål */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Metodmål
              </span>
              <HonestyTag kind={organ.goalKind} />
            </div>
            <p className="mt-1.5 text-sm text-foreground/90">{organ.goal}</p>
          </div>

          <Separator />

          {/* Mantra */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Mantra
            </p>
            <blockquote className="mt-1.5 flex items-start gap-2 font-serif text-base italic text-foreground">
              <Quote className="mt-0.5 h-4 w-4 shrink-0 text-gold/60" />
              <span>“{organ.mantra}”</span>
            </blockquote>
          </div>

          <Separator />

          {/* Nästa önskan */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Nästa önskan
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              {organ.nextWish}
            </p>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function PhaseStep({
  phase,
  isLast,
}: {
  phase: { num: string; name: string; desc: string };
  isLast: boolean;
}) {
  return (
    <div className="relative">
      {/* horizontal connector (lg only) */}
      {!isLast && (
        <div
          aria-hidden
          className="absolute -right-3 top-7 hidden h-px w-6 bg-gradient-to-r from-gold to-gold/30 lg:block"
        />
      )}
      {/* vertical connector (mobile only) */}
      {!isLast && (
        <div
          aria-hidden
          className="absolute left-7 top-14 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-gold to-gold/30 sm:hidden"
        />
      )}

      <div className="flex h-full flex-col items-start rounded-lg border border-border bg-card p-5 transition-colors hover:border-gold/40">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold/40 bg-gold/10 font-serif text-lg font-bold text-gold">
            {phase.num}
          </span>
          <GoldRule className="w-8" />
        </div>
        <h3 className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
          {phase.name}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {phase.desc}
        </p>
      </div>
    </div>
  );
}

function HonestyStat({
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
    <Card className="border-border bg-card p-5">
      <HonestyTag kind={kind} />
      <p className="mt-3 font-serif text-4xl font-bold leading-none">{value}</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{sub}</p>
    </Card>
  );
}

function ResearchField({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
        {label}
      </p>
      <p className="mt-1 text-sm text-foreground/90 leading-relaxed">{body}</p>
    </div>
  );
}

function CtaCard({
  icon,
  title,
  sub,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center justify-between rounded-lg border border-border bg-card p-5 text-left transition-all hover:border-gold/50 hover:shadow-md"
    >
      <span className="flex items-center gap-3">
        <span className="text-gold">{icon}</span>
        <span>
          <span className="block font-serif text-lg font-bold">{title}</span>
          <span className="block text-xs text-muted-foreground">{sub}</span>
        </span>
      </span>
      <ChevronRight className="h-5 w-5 text-gold transition-transform group-hover:translate-x-1" />
    </button>
  );
}
