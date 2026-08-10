"use client";

import * as React from "react";
import {
  Gavel,
  Send,
  Loader2,
  ChevronRight,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Sparkles,
  History,
  Users,
  Clock,
} from "lucide-react";
import { useAk1aStore } from "@/lib/ak1a-store";
import { ORGANS } from "@/lib/ak1a/data";
import { Eyebrow, GoldRule, HonestyTag, OrganGlyph } from "../primitives";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Signature {
  symbol: string;
  organ: string;
  verdict: "JA" | "RESERVATION" | "NEJ";
}

interface Viewpoint {
  organ: string;
  symbol: string;
  role: string;
  verb: string;
  mantra: string;
  viewpoint: string;
}

interface Decision {
  title: string;
  rationale: string;
  actions: string[];
  risk_notes: string;
  confidence: "LÅG" | "MEDEL" | "HÖG";
  signatures: Signature[];
}

interface Meeting {
  id: string;
  agenda: string;
  timestamp: string;
  viewpoints: Viewpoint[];
  decision: Decision;
}

interface SuggestedAgenda {
  id: string;
  title: string;
  agenda: string;
  category: string;
}

export function StyrelseSection() {
  const { setSection } = useAk1aStore();
  const [agenda, setAgenda] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [meeting, setMeeting] = React.useState<Meeting | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [suggested, setSuggested] = React.useState<SuggestedAgenda[]>([]);
  const [archive, setArchive] = React.useState<Meeting[]>([]);
  const [activeViewpoint, setActiveViewpoint] = React.useState<number>(0);

  // Load suggested agendas on mount
  React.useEffect(() => {
    fetch("/api/styrelse/agendas")
      .then((r) => r.json())
      .then((d) => setSuggested(d.agendas || []))
      .catch(() => {});
  }, []);

  const holdMeeting = async (agendaText: string) => {
    const a = agendaText.trim();
    if (a.length < 3) {
      setError("Skriv en dagordning på minst 3 tecken.");
      return;
    }
    setLoading(true);
    setError(null);
    setMeeting(null);
    setActiveViewpoint(0);
    try {
      const res = await fetch("/api/styrelse/mote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agenda: a }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || `HTTP ${res.status}`);
      }
      const m: Meeting = await res.json();
      setMeeting(m);
      setArchive((prev) => [m, ...prev].slice(0, 12));
    } catch (e: any) {
      setError(e?.message || "Mötet kunde inte hållas.");
    } finally {
      setLoading(false);
    }
  };

  const verdictColor = (v: Signature["verdict"]) =>
    v === "JA" ? "text-bull" : v === "NEJ" ? "text-bear" : "text-gold";
  const verdictBg = (v: Signature["verdict"]) =>
    v === "JA" ? "bg-bull/10 border-bull/30" : v === "NEJ" ? "bg-bear/10 border-bear/30" : "bg-gold/10 border-gold/30";
  const verdictIcon = (v: Signature["verdict"]) =>
    v === "JA" ? <CheckCircle2 className="h-3.5 w-3.5" /> : v === "NEJ" ? <XCircle className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />;

  return (
    <div className="paper-texture">
      {/* ───────────── HERO ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <Eyebrow>AI-organ styrelse · Mötesrummet</Eyebrow>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-balance sm:text-5xl">
            Styrelsen sammanträder.
            <span className="text-gold"> Fråga alltid om deras beslut.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            AK1A:s 8 strategiska AI-organ (Σ α Δ Ω Φ Θ Μ Ψ) samlas till möte kring
            din dagordning. Varje organ avger sin syn ur sin roll. Σ
            (Strategi-organet) syntetiserar till ett{" "}
            <span className="font-semibold text-foreground">styrelsebeslut</span>{" "}
            med åtgärder, risker och signaturer. Inget publiceras utan styrelsens
            prövning — detta är tankens struktur, synliggjord.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <HonestyTag kind="metodmal" />
            <span className="text-xs text-muted-foreground">
              8 organ · 5 aktiva idag · målet är 8/8 synkrona
            </span>
          </div>
        </div>
      </section>

      {/* ───────────── MÖTESRUM (dagordning + möte) ───────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
            {/* Vänster: dagordning + förslag */}
            <div className="space-y-5">
              <div>
                <Eyebrow>Lägg fram dagordning</Eyebrow>
                <h2 className="mt-2 font-serif text-2xl font-bold">
                  Vad ska styrelsen besluta om?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Skriv en fråga eller välj en förslagen dagordning. Σ leder
                  mötet, de 7 andra organen avger syn.
                </p>
              </div>

              <Card className="p-4">
                <Textarea
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="Ex: Ska AK1A publicera nästa analys före eller efter Q3-rapporten? Väg tidspress mot kvalitet."
                  className="min-h-[110px] resize-none border-0 px-0 focus-visible:ring-0"
                  maxLength={600}
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {agenda.length}/600 tecken
                  </span>
                  <Button
                    onClick={() => holdMeeting(agenda)}
                    disabled={loading || agenda.trim().length < 3}
                    className="bg-gold text-background hover:bg-gold/90"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Möte
                        pågår…
                      </>
                    ) : (
                      <>
                        <Gavel className="mr-1 h-4 w-4" /> Håll möte
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {error && (
                <div className="rounded-md border border-bear/40 bg-bear/5 p-3 text-sm text-bear">
                  {error}
                </div>
              )}

              <div>
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-gold" /> Förslagna dagordningar
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {suggested.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setAgenda(s.agenda);
                        setMeeting(null);
                      }}
                      className="group rounded-md border border-border bg-card p-3 text-left transition-all hover:border-gold/50 hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gold">
                          {s.category}
                        </span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <p className="mt-1 text-sm font-medium leading-snug">
                        {s.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Höger: mötesresultat */}
            <div>
              {loading && <MeetingSkeleton />}
              {!loading && !meeting && (
                <Card className="flex h-full min-h-[300px] flex-col items-center justify-center p-8 text-center">
                  <div className="rounded-full bg-gold/10 p-4">
                    <Gavel className="h-8 w-8 text-gold" />
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-bold">
                    Mötesresultatet visas här
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Lägg fram en dagordning och håll möte. De 8 organens syn och
                    Σ:s syntes publiceras som ett protokoll — alltid med
                    signaturer.
                  </p>
                  <GoldRule className="my-4 w-24" />
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Princip: bevisa det — annars stannar det
                  </p>
                </Card>
              )}
              {!loading && meeting && (
                <MeetingProtocol
                  meeting={meeting}
                  activeViewpoint={activeViewpoint}
                  setActiveViewpoint={setActiveViewpoint}
                  verdictColor={verdictColor}
                  verdictBg={verdictBg}
                  verdictIcon={verdictIcon}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── ORGANEN I STYRELSEN ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <Eyebrow>Styrelsens 8 platser</Eyebrow>
          <h2 className="mt-3 font-serif text-2xl font-bold">
            Vem sitter i mötet?
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Σ är ordförande. De 7 andra avger syn i turordning. Varje organ har
            ett verb (vad det gör) och ett mantra (hur det tänker).
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ORGANS.map((o) => (
              <Card
                key={o.symbol}
                className={cn(
                  "p-4",
                  o.active ? "border-gold/30" : "border-border opacity-70"
                )}
              >
                <div className="flex items-center gap-2">
                  <OrganGlyph symbol={o.symbol} active={o.active} />
                  <div className="min-w-0">
                    <p className="font-serif text-sm font-bold leading-tight">
                      {o.name}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gold">
                      {o.verb}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {o.role}
                </p>
                <p className="mt-2 text-[11px] italic text-muted-foreground">
                  &ldquo;{o.mantra}&rdquo;
                </p>
                {!o.active && (
                  <Badge
                    variant="outline"
                    className="mt-2 text-[9px] uppercase tracking-wider"
                  >
                    Metodmål · ej aktiv
                  </Badge>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── PROTOKOLLSARKIV ───────────── */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <Eyebrow>Protokollsarkiv</Eyebrow>
              <h2 className="mt-2 font-serif text-2xl font-bold">
                Tidigare möten
              </h2>
            </div>
            <History className="h-5 w-5 text-gold" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Din sessions protokoll sparas lokalt. (Sparas inte på servern.)
          </p>
          {archive.length === 0 ? (
            <Card className="mt-5 p-8 text-center text-sm text-muted-foreground">
              <FileText className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />
              Inga protokoll ännu. Håll ditt första möte ovan.
            </Card>
          ) : (
            <div className="mt-5 space-y-2">
              {archive.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMeeting(m);
                    setActiveViewpoint(0);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group flex w-full items-center gap-3 rounded-md border border-border bg-card p-3 text-left transition-all hover:border-gold/50"
                >
                  <FileText className="h-4 w-4 shrink-0 text-gold" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {m.decision.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {m.agenda}
                    </span>
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 text-[9px] uppercase",
                      m.decision.confidence === "HÖG"
                        ? "border-bull/40 text-bull"
                        : m.decision.confidence === "LÅG"
                        ? "border-bear/40 text-bear"
                        : "border-gold/40 text-gold"
                    )}
                  >
                    {m.decision.confidence}
                  </Badge>
                  <span className="hidden shrink-0 text-[10px] text-muted-foreground sm:flex sm:items-center sm:gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(m.timestamp).toLocaleTimeString("sv-SE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ───────────── GÅ VIDARE ───────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <Eyebrow>◆ Fortsätt utforska</Eyebrow>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => setSection("om-oss")}
            >
              <Users className="mr-2 h-4 w-4 text-gold" /> Läs om de 8 organen
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => setSection("labb")}
            >
              <Gavel className="mr-2 h-4 w-4 text-gold" /> Reproducera i Labbet
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => setSection("prec")}
            >
              <FileText className="mr-2 h-4 w-4 text-gold" /> Se publicerad
              analys
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Mötesprotokoll ---------- */

function MeetingProtocol({
  meeting,
  activeViewpoint,
  setActiveViewpoint,
  verdictColor,
  verdictBg,
  verdictIcon,
}: {
  meeting: Meeting;
  activeViewpoint: number;
  setActiveViewpoint: (i: number) => void;
  verdictColor: (v: Signature["verdict"]) => string;
  verdictBg: (v: Signature["verdict"]) => string;
  verdictIcon: (v: Signature["verdict"]) => React.ReactNode;
}) {
  const yes = meeting.decision.signatures.filter((s) => s.verdict === "JA").length;
  const no = meeting.decision.signatures.filter((s) => s.verdict === "NEJ").length;
  const res = meeting.decision.signatures.filter((s) => s.verdict === "RESERVATION").length;
  const passed = yes > no;

  return (
    <Card className="overflow-hidden border-gold/30">
      {/* Protocol header */}
      <div className="border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gold" />
            <span className="font-serif text-sm font-bold">
              PROTOKOLL {meeting.id}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(meeting.timestamp).toLocaleString("sv-SE", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          <span className="font-semibold uppercase tracking-wider text-gold">
            Dagordning:
          </span>{" "}
          {meeting.agenda}
        </p>
      </div>

      <ScrollArea className="max-h-[600px]">
        <div className="p-4">
          {/* Fas 1: Viewpoints */}
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gold">
                Fas 1 — Organens syn
              </span>
              <Separator className="flex-1" />
            </div>
            <div className="mb-3 flex flex-wrap gap-1">
              {meeting.viewpoints.map((v, i) => (
                <button
                  key={v.symbol}
                  onClick={() => setActiveViewpoint(i)}
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full font-serif text-sm border transition-all",
                    activeViewpoint === i
                      ? "bg-gold text-background border-gold"
                      : "bg-card border-border text-muted-foreground hover:border-gold/50"
                  )}
                  title={`${v.organ} — ${v.verb}`}
                >
                  {v.symbol}
                </button>
              ))}
            </div>
            {meeting.viewpoints[activeViewpoint] && (
              <div className="rounded-md border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <OrganGlyph
                    symbol={meeting.viewpoints[activeViewpoint].symbol}
                    active
                    className="h-7 w-7 text-xs"
                  />
                  <div>
                    <p className="font-serif text-sm font-bold leading-tight">
                      {meeting.viewpoints[activeViewpoint].organ}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gold">
                      {meeting.viewpoints[activeViewpoint].verb}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs italic text-muted-foreground">
                  &ldquo;{meeting.viewpoints[activeViewpoint].mantra}&rdquo;
                </p>
                <p className="mt-2 text-sm leading-relaxed">
                  {meeting.viewpoints[activeViewpoint].viewpoint}
                </p>
              </div>
            )}
          </div>

          <GoldRule className="my-4" />

          {/* Fas 2: Decision */}
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gold">
                Fas 2 — Σ:s styrelsebeslut
              </span>
              <Separator className="flex-1" />
            </div>
            <div className="rounded-md border border-gold/40 bg-gold/[0.03] p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <OrganGlyph symbol="Σ" active className="h-8 w-8" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gold">
                      Strategi-organet · ordförande
                    </p>
                    <p className="text-[11px] italic text-muted-foreground">
                      Riktning före hastighet.
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0",
                    meeting.decision.confidence === "HÖG"
                      ? "border-bull/40 text-bull"
                      : meeting.decision.confidence === "LÅG"
                      ? "border-bear/40 text-bear"
                      : "border-gold/40 text-gold"
                  )}
                >
                  Konfidens: {meeting.decision.confidence}
                </Badge>
              </div>

              <h3 className="mt-3 font-serif text-lg font-bold leading-snug">
                {meeting.decision.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {meeting.decision.rationale}
              </p>

              {meeting.decision.actions.length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gold">
                    Åtgärder
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {meeting.decision.actions.map((a, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="font-serif font-bold text-gold">
                          {i + 1}.
                        </span>
                        <span className="leading-relaxed">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {meeting.decision.risk_notes && (
                <div className="mt-3 rounded-md border border-bear/30 bg-bear/5 p-2.5">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-bear">
                    <AlertTriangle className="h-3 w-3" /> Risknotis
                  </p>
                  <p className="mt-1 text-xs leading-relaxed">
                    {meeting.decision.risk_notes}
                  </p>
                </div>
              )}
            </div>

            {/* Signatures */}
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Signaturer (8)
                </p>
                <p
                  className={cn(
                    "text-xs font-bold",
                    passed ? "text-bull" : "text-bear"
                  )}
                >
                  {passed ? "ANTAGET" : "FÖRKASTAT"} · {yes} JA · {res}{" "}
                  RESERVATION · {no} NEJ
                </p>
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {meeting.decision.signatures.map((s) => (
                  <div
                    key={s.symbol}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md border px-2 py-1.5",
                      verdictBg(s.verdict)
                    )}
                  >
                    <span className="font-serif text-base font-bold">
                      {s.symbol}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[10px] font-medium leading-tight">
                        {s.organ}
                      </span>
                      <span
                        className={cn(
                          "flex items-center gap-0.5 text-[10px] font-bold uppercase",
                          verdictColor(s.verdict)
                        )}
                      >
                        {verdictIcon(s.verdict)}
                        {s.verdict}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}

function MeetingSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-gold" />
          <span className="font-serif text-sm font-bold">
            Möte pågår — organen sammanträder…
          </span>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex gap-1">
          {["α", "Δ", "Ω", "Φ", "Θ", "Μ", "Ψ"].map((s) => (
            <div
              key={s}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-muted font-serif text-sm text-muted-foreground"
            >
              {s}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-3 rounded bg-muted"
              style={{ width: `${100 - i * 12}%` }}
            />
          ))}
        </div>
        <div className="h-px bg-border" />
        <div className="h-20 rounded-md border border-gold/30 bg-gold/[0.03]">
          <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-gold" />
            Σ syntetiserar styrelsebeslut…
          </div>
        </div>
      </div>
    </Card>
  );
}
