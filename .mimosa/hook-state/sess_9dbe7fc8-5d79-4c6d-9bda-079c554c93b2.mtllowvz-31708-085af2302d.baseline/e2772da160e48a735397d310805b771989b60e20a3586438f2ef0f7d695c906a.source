"use client";

import * as React from "react";
import {
  Send,
  Loader2,
  Sparkles,
  Brain,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  History,
  Zap,
} from "lucide-react";
import { useAk1aStore } from "@/lib/ak1a-store";
import { ORGANS } from "@/lib/ak1a/data";
import { Eyebrow, GoldRule, HonestyTag, OrganGlyph } from "./primitives";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Consultation {
  id: string;
  organ: string;
  question: string;
  response: string | null;
  confidence: string | null;
  depth: string;
  createdAt: string;
}

const DEEP_QUESTIONS = [
  {
    organ: "α",
    q: "Hur ska AK1A expandera portföljbyggaren för att ge klienter institutionell djupanalys? Vilka funktioner saknas för att matcha Bloomberg Terminal?",
  },
  {
    organ: "Δ",
    q: "Vilka är de 5 största riskerna med att låsa klienter bygga fiktiva portföljer med teknisk analys? Hur minimerar vi risk för att klienter misstar fiktiva analyser för rådgivning?",
  },
  {
    organ: "Ω",
    q: "Hur ska AK1A:s portföljbyggare integrera Elliott Wave-analys med fundamental AKM1 för att ge en helhetsbild över 5-10 års tidshorizont?",
  },
  {
    organ: "Θ",
    q: "Vilka 10 nya kurser bör AK1A utveckla nästa kvartal för att komplettera de befintliga 307 kurserna? Fokusera på områden där svensk retail-investerare är svagast.", // Uppdaterad 2026-09-01: 307 kurser
  },
  {
    organ: "Μ",
    q: "Hur kan AKM1-metodiken utökas från 20 till 25 variabler? Vilka 5 nya variabler skulle stärka prediktiv kraft utan att överkomplicera?",
  },
  {
    organ: "Ψ",
    q: "Vilka beteendemässiga fällor är vanligast bland svenska investerare som bygger egna portföljer? Hur ska AK1A:s verktyg varna för dessa i realtid?",
  },
];

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = localStorage.getItem("ak1a-session-id");
    if (!id) {
      id = `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem("ak1a-session-id", id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

export function DeepConsultationPanel() {
  const { setSearchOpen } = useAk1aStore();
  const [selectedOrgan, setSelectedOrgan] = React.useState<string>("α");
  const [question, setQuestion] = React.useState("");
  const [depth, setDepth] = React.useState<"standard" | "deep" | "mega">("deep");
  const [loading, setLoading] = React.useState(false);
  const [response, setResponse] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [consultations, setConsultations] = React.useState<Consultation[]>([]);
  const [confidence, setConfidence] = React.useState<string | null>(null);

  const loadHistory = React.useCallback(async () => {
    try {
      const sid = getSessionId();
      const res = await fetch(`/api/styrelse/djup?sessionId=${sid}`);
      if (res.ok) {
        const data = await res.json();
        setConsultations(data.consultations || []);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const ask = async () => {
    if (!question.trim() || !selectedOrgan) return;
    setLoading(true);
    setError(null);
    setResponse(null);
    setConfidence(null);
    try {
      const res = await fetch("/api/styrelse/djup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: getSessionId(),
          organ: selectedOrgan,
          question: question.trim(),
          depth,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setResponse(data.response);
        setConfidence(data.confidence);
        loadHistory();
      } else {
        setError(data.error || "Kunde inte få svar från organet.");
      }
    } catch (err: any) {
      setError(err.message || "Nätverksfel");
    } finally {
      setLoading(false);
    }
  };

  const applySuggestedQuestion = (organ: string, q: string) => {
    setSelectedOrgan(organ);
    setQuestion(q);
  };

  return (
    <div className="space-y-6">
      <Card className="border-gold/30 bg-gold/[0.03] p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gold" />
          <h3 className="font-serif text-xl font-bold">Djup konsultation av AI-organ</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Ställ strategiska frågor direkt till ett specifikt AI-organ. Svaren sparas i databasen
          och bidrar till AK1A:s kunskapsarkiv. <HonestyTag kind="matt" className="ml-1" /> —
          varje organ har sin egen persona och sitt eget mantra.
        </p>
      </Card>

      {/* Föreslagna djupa frågor */}
      <Card className="p-5">
        <Eyebrow>Föreslagna djupa frågor</Eyebrow>
        <p className="mt-1 text-xs text-muted-foreground">
          Klicka för att använda som utgångspunkt. Redigera fritt innan du skickar.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {DEEP_QUESTIONS.map((dq, i) => {
            const organ = ORGANS.find((o) => o.symbol === dq.organ);
            return (
              <button
                key={i}
                onClick={() => applySuggestedQuestion(dq.organ, dq.q)}
                className="rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-gold/50 hover:bg-gold/[0.02]"
              >
                <div className="flex items-center gap-2">
                  <OrganGlyph symbol={dq.organ} className="h-6 w-6 shrink-0" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gold">
                    {organ?.name || dq.organ}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed">{dq.q}</p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Frågeformulär */}
      <Card className="p-5">
        <Eyebrow>Ställ din fråga</Eyebrow>
        <div className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Välj organ
              </label>
              <Select value={selectedOrgan} onValueChange={setSelectedOrgan}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORGANS.map((o) => (
                    <SelectItem key={o.symbol} value={o.symbol}>
                      {o.symbol} — {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Djup
              </label>
              <Select value={depth} onValueChange={(v) => setDepth(v as any)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (100-200 ord)</SelectItem>
                  <SelectItem value="deep">Djup (300+ ord)</SelectItem>
                  <SelectItem value="mega">Mega (500+ ord)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Din fråga
            </label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Skriv din strategiska fråga till organet..."
              className="mt-1 min-h-[120px] resize-y"
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              Frågan sparas i databasen även om API:et är rate-limited. Svaret levereras när API:et är tillgängligt.
            </p>
            <Button
              onClick={ask}
              disabled={loading || !question.trim()}
              className="bg-gold text-background hover:bg-gold/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Organet tänker...
                </>
              ) : (
                <>
                  <Send className="mr-1 h-3.5 w-3.5" /> Konsultera organet
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Svar */}
      {error && (
        <Card className="border-orange-500/40 bg-orange-500/[0.03] p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="text-sm font-medium">{error}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Frågan har loggats och kommer att besvaras när API:et är tillgängligt.
              </p>
            </div>
          </div>
        </Card>
      )}

      {response && (
        <Card className="border-gold/40 bg-gold/[0.03] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-bull" />
              <Eyebrow>Svar från {selectedOrgan}</Eyebrow>
            </div>
            {confidence && (
              <Badge
                variant="outline"
                className={cn(
                  "border-gold/40 text-gold",
                  confidence === "LÅG" && "border-muted-foreground/40 text-muted-foreground",
                  confidence === "HÖG" && "border-bull/40 text-bull"
                )}
              >
                {confidence} konfidens
              </Badge>
            )}
          </div>
          <GoldRule className="my-3" />
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {response}
          </div>
        </Card>
      )}

      {/* Historik */}
      {consultations.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-gold" />
              <Eyebrow>Din konsultationshistorik</Eyebrow>
            </div>
            <Button variant="ghost" size="sm" onClick={loadHistory}>
              <ChevronRight className="h-3 w-3" /> Uppdatera
            </Button>
          </div>
          <ScrollArea className="mt-3 h-[300px]">
            <div className="space-y-2">
              {consultations.map((c) => {
                const organ = ORGANS.find((o) => o.symbol === c.organ);
                const parsed = c.response ? (() => {
                  try {
                    return JSON.parse(c.response);
                  } catch {
                    return null;
                  }
                })() : null;
                return (
                  <div key={c.id} className="rounded-md border border-border bg-card p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <OrganGlyph symbol={c.organ} className="h-5 w-5" />
                        <span className="font-semibold">{organ?.name || c.organ}</span>
                        <Badge variant="secondary" className="text-[10px]">{c.depth}</Badge>
                        {c.confidence && (
                          <Badge variant="outline" className="text-[10px]">{c.confidence}</Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(c.createdAt).toLocaleString("sv-SE")}
                      </span>
                    </div>
                    <p className="mt-1.5 font-medium">{c.question}</p>
                    {parsed?.text && (
                      <p className="mt-1 line-clamp-3 text-muted-foreground">{parsed.text}</p>
                    )}
                    {parsed?.error && (
                      <p className="mt-1 text-orange-600 dark:text-orange-400">
                        ⚠ API-fel: {parsed.error.slice(0, 80)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}
