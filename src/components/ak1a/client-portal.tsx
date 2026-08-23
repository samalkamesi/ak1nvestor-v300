"use client";

/* ============================================================
 *  AK1A Research Lab — Client Portal
 *  ----------------------------------------------------------
 *  Member-facing portal: register/login, submit portfolio for
 *  analyst review, view the analyst's pedagogical write-up
 *  (with Elliott-wave grid), book 15/30 min review session.
 *
 *  Backend:
 *    POST/GET /api/member/register
 *    POST/GET /api/member/portfolio
 *    GET    /api/member/analysis
 *    POST/GET /api/booking
 * ============================================================ */

import * as React from "react";
import {
  User,
  Wallet,
  FileText,
  Calendar,
  TrendingUp,
  Waves,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Sparkles,
  Plus,
  Trash2,
  Clock,
  Mail,
  Phone,
  ArrowRight,
  LogOut,
  Loader2,
  Star,
  ChevronRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Eyebrow, GoldRule, HonestyTag } from "@/components/ak1a/primitives";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────
 *  Types
 * ──────────────────────────────────────────────────────────── */

type MemberType = "free" | "premium" | "pro";

interface Member {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  memberType: MemberType;
  createdAt: string;
  lastLoginAt: string | null;
}

interface Holding {
  id: string;
  ticker: string;
  company: string;
  sector: string | null;
  shares: number;
  avgCost: number | null;
  currentPrice: number | null;
  weight: number;
  waveMicro: string | null;
  waveShort: string | null;
  waveMedium: string | null;
  waveLong: string | null;
  waveMega: string | null;
  waveConfidence: number | null;
  waveScore: number | null;
  usedCache: boolean;
}

interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  cashPosition: number;
  riskTolerance: string;
  analysisStatus: string;
  submittedAt: string | null;
  analyzedAt: string | null;
  avgWaveMicro: string | null;
  avgWaveShort: string | null;
  avgWaveMedium: string | null;
  avgWaveLong: string | null;
  avgWaveMega: string | null;
  avgWaveScore: number | null;
  riskScore: number | null;
  holdings: Holding[];
}

interface Analysis {
  id: string;
  title: string;
  summary: string;
  body: string;
  portfolioOverview: string | null;
  riskAssessment: string | null;
  waveAnalysis: string | null;
  recommendations: string | null;
  nextSteps: string | null;
  analyzedBy: string | null;
  confidence: string | null;
  publishedAt: string | null;
  createdAt: string;
}

interface Booking {
  id: string;
  type: string;
  requestedTime: string | null;
  confirmedTime: string | null;
  status: string;
  notes: string | null;
  meetingLink: string | null;
  createdAt: string;
}

interface HoldingDraft {
  ticker: string;
  company: string;
  shares: string;
  avgCost: string;
  sector: string;
}

/* ────────────────────────────────────────────────────────────
 *  Wave helpers — color coding per Elliott-wave position
 * ──────────────────────────────────────────────────────────── */

const TIMEFRAMES = [
  "Mikro",
  "Kort",
  "Medellångsikt",
  "Långsikt",
  "Mega",
] as const;
type Timeframe = (typeof TIMEFRAMES)[number];

const TIMEFRAME_SHORT: Record<Timeframe, string> = {
  Mikro: "Mikro",
  Kort: "Kort",
  Medellångsikt: "Medell.",
  Långsikt: "Lång",
  Mega: "Mega",
};

function holdingWave(h: Holding, tf: Timeframe): string | null {
  switch (tf) {
    case "Mikro":
      return h.waveMicro;
    case "Kort":
      return h.waveShort;
    case "Medellångsikt":
      return h.waveMedium;
    case "Långsikt":
      return h.waveLong;
    case "Mega":
      return h.waveMega;
  }
}

function portfolioWave(p: Portfolio, tf: Timeframe): string | null {
  switch (tf) {
    case "Mikro":
      return p.avgWaveMicro;
    case "Kort":
      return p.avgWaveShort;
    case "Medellångsikt":
      return p.avgWaveMedium;
    case "Långsikt":
      return p.avgWaveLong;
    case "Mega":
      return p.avgWaveMega;
  }
}

type WaveCategory = "impuls" | "korrektion" | "unknown";

function waveCategory(wave: string | null | undefined): WaveCategory {
  if (!wave) return "unknown";
  const w = wave.toLowerCase();
  if (w.includes("impuls")) return "impuls";
  if (w.includes("korrektion")) return "korrektion";
  return "unknown";
}

function waveStyle(wave: string | null | undefined): string {
  const cat = waveCategory(wave);
  if (cat === "impuls") return "border-bull/40 bg-bull/10 text-bull";
  if (cat === "korrektion") return "border-bear/40 bg-bear/10 text-bear";
  return "border-border bg-muted/40 text-muted-foreground";
}

function waveGlyph(wave: string | null | undefined): string {
  const cat = waveCategory(wave);
  if (cat === "impuls") return "▲";
  if (cat === "korrektion") return "▼";
  return "—";
}

/* ────────────────────────────────────────────────────────────
 *  Wave-analysis JSON shape (analyst-uploaded field)
 * ──────────────────────────────────────────────────────────── */

interface WaveAnalysisJSON {
  score?: number;
  holdings?: Array<{
    ticker?: string;
    company?: string;
    waves?: Partial<Record<Timeframe, string>>;
    confidence?: number;
    note?: string;
  }>;
  portfolioAverage?: Partial<Record<Timeframe, string>>;
}

function parseWaveAnalysis(raw: string | null | undefined): WaveAnalysisJSON | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as WaveAnalysisJSON;
    return null;
  } catch {
    return null;
  }
}

/* ────────────────────────────────────────────────────────────
 *  localStorage + session helpers
 * ──────────────────────────────────────────────────────────── */

const LS_MEMBER_ID = "ak1a_member_id";
const LS_MEMBER_EMAIL = "ak1a_member_email";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let sid = window.localStorage.getItem("ak1a_session_id");
    if (!sid) {
      sid =
        "anon-" +
        Math.random().toString(36).slice(2, 10) +
        Date.now().toString(36);
      window.localStorage.setItem("ak1a_session_id", sid);
    }
    return sid;
  } catch {
    return "";
  }
}

function readStoredMember(): { id: string; email: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const id = window.localStorage.getItem(LS_MEMBER_ID);
    const email = window.localStorage.getItem(LS_MEMBER_EMAIL);
    if (id && email) return { id, email };
    return null;
  } catch {
    return null;
  }
}

function writeStoredMember(id: string, email: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_MEMBER_ID, id);
    window.localStorage.setItem(LS_MEMBER_EMAIL, email);
  } catch {
    /* no-op */
  }
}

function clearStoredMember() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LS_MEMBER_ID);
    window.localStorage.removeItem(LS_MEMBER_EMAIL);
  } catch {
    /* no-op */
  }
}

/* ────────────────────────────────────────────────────────────
 *  Misc helpers
 * ──────────────────────────────────────────────────────────── */

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function formatSEK(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return n.toLocaleString("sv-SE", {
    maximumFractionDigits: 0,
  });
}

function memberTypeLabel(t: MemberType): string {
  if (t === "premium") return "Premium";
  if (t === "pro") return "Pro";
  return "Free";
}

function confidenceVariant(
  c: string | null | undefined
): "default" | "secondary" | "outline" {
  if (!c) return "outline";
  const v = c.toLowerCase();
  if (v.includes("hög")) return "default";
  if (v.includes("medel")) return "secondary";
  return "outline";
}

/* ════════════════════════════════════════════════════════════
 *  LOGIN / REGISTER SCREEN
 * ════════════════════════════════════════════════════════════ */

function LoginRegisterScreen({
  onAuth,
}: {
  onAuth: (member: Member, portfolios: Portfolio[], analyses: Analysis[], bookings: Booking[]) => void;
}) {
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const valid = email.includes("@") && email.includes(".");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      toast({
        title: "Ogiltig e-post",
        description: "Ange en giltig e-postadress.",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/member/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
          memberType: "free",
          sessionId: getSessionId(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Kunde inte registrera");
      }
      const member = data.member as Member;
      writeStoredMember(member.id, member.email);

      // Fetch full member record (with relations)
      const fres = await fetch(
        `/api/member/register?email=${encodeURIComponent(member.email)}`
      );
      const fdata = await fres.json();
      if (fres.ok && fdata?.member) {
        const m = fdata.member;
        onAuth(
          {
            id: m.id,
            email: m.email,
            name: m.name,
            phone: m.phone,
            memberType: (m.memberType as MemberType) || "free",
            createdAt: m.createdAt,
            lastLoginAt: m.lastLoginAt,
          },
          (m.portfolios as Portfolio[]) || [],
          (m.analyses as Analysis[]) || [],
          (m.bookings as Booking[]) || []
        );
      } else {
        onAuth(member, [], [], []);
      }

      toast({
        title: data.isNew ? "Välkommen till AK1A" : "Välkommen tillbaka",
        description: data.isNew
          ? "Ditt konto är skapat. Skicka in din portfölj för analys."
          : "Du är inloggad. Senaste portfölj och analys visas i portalen.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Okänt fel";
      toast({
        title: "Inloggning misslyckades",
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-20">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
          <User className="h-6 w-6" />
        </div>
        <Eyebrow className="mt-4">Klientportal</Eyebrow>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight">
          Logga in eller registrera
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Skicka in din portfölj för personlig analys av AK1A:s analytiker —
          pedagogiskt upplagd, som om vi satt bredvid dig.
        </p>
        <GoldRule className="mx-auto mt-5 max-w-[180px]" />
      </div>

      <Card className="mt-8 gap-0">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cp-email" className="text-xs uppercase tracking-wider">
                E-post <span className="text-bear">*</span>
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="cp-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="du@exempel.se"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cp-name" className="text-xs uppercase tracking-wider">
                Namn <span className="text-muted-foreground">(valfritt)</span>
              </Label>
              <Input
                id="cp-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Anna Andersson"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cp-phone" className="text-xs uppercase tracking-wider">
                Telefon <span className="text-muted-foreground">(valfritt)</span>
              </Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="cp-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+46 70 123 45 67"
                  className="pl-9"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !valid}
              className="mt-2 w-full bg-gold text-background hover:bg-gold/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loggar in…
                </>
              ) : (
                <>
                  Fortsätt <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <p className="mt-1 text-center text-[11px] leading-relaxed text-muted-foreground">
              Finns e-posten redan loggas du in. Annars skapas ett gratis konto.
              Pedagogisk finansanalys — inte investeringsråd.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 *  TAB 1 — MIN PORTFÖLJ
 * ════════════════════════════════════════════════════════════ */

function PortfolioTab({
  member,
  portfolios,
  onRefresh,
}: {
  member: Member;
  portfolios: Portfolio[];
  onRefresh: () => void;
}) {
  const { toast } = useToast();
  const [drafts, setDrafts] = React.useState<HoldingDraft[]>([
    { ticker: "", company: "", shares: "", avgCost: "", sector: "" },
  ]);
  const [portfolioName, setPortfolioName] = React.useState("Min portfölj");
  const [riskTolerance, setRiskTolerance] = React.useState("medium");
  const [cashPct, setCashPct] = React.useState(10);
  const [submitting, setSubmitting] = React.useState(false);

  const totalEquity = drafts.reduce((sum, d) => {
    const sh = parseFloat(d.shares);
    const cost = parseFloat(d.avgCost);
    if (Number.isFinite(sh) && Number.isFinite(cost)) return sum + sh * cost;
    return sum;
  }, 0);
  const totalValue = totalEquity / (1 - cashPct / 100);
  const cashAmount = Number.isFinite(totalValue) ? totalValue - totalEquity : 0;

  const addRow = () =>
    setDrafts((d) => [
      ...d,
      { ticker: "", company: "", shares: "", avgCost: "", sector: "" },
    ]);

  const removeRow = (i: number) =>
    setDrafts((d) => d.filter((_, idx) => idx !== i));

  const updateRow = (i: number, field: keyof HoldingDraft, value: string) =>
    setDrafts((d) =>
      d.map((row, idx) => (idx === i ? { ...row, [field]: value } : row))
    );

  const validDrafts = drafts.filter(
    (d) => d.ticker.trim() && d.company.trim() && parseFloat(d.shares) > 0
  );

  const handleSubmit = async () => {
    if (validDrafts.length === 0) {
      toast({
        title: "Saknar innehav",
        description:
          "Lägg till minst ett innehav med ticker, bolagsnamn och antal aktier.",
      });
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        memberId: member.id,
        name: portfolioName.trim() || "Min portfölj",
        holdings: validDrafts.map((d) => ({
          ticker: d.ticker.trim().toUpperCase(),
          company: d.company.trim(),
          shares: parseFloat(d.shares),
          avgCost: parseFloat(d.avgCost) || undefined,
          sector: d.sector.trim() || undefined,
        })),
        riskTolerance,
        cashPosition: cashAmount,
      };
      const res = await fetch("/api/member/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Kunde inte skicka in");
      }
      toast({
        title: "Portfölj inskickad",
        description: data.message || "Analytiker granskar — du får notis när analysen är klar.",
      });
      setDrafts([{ ticker: "", company: "", shares: "", avgCost: "", sector: "" }]);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Okänt fel";
      toast({
        title: "Kunde inte skicka in portfölj",
        description: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const latest = portfolios[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* ── Form ── */}
      <Card className="gap-0">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-2 font-serif">
            <Wallet className="h-4 w-4 text-gold" />
            Skicka in portfölj för analys
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cp-portname" className="text-xs uppercase tracking-wider">
                  Portföljnamn
                </Label>
                <Input
                  id="cp-portname"
                  value={portfolioName}
                  onChange={(e) => setPortfolioName(e.target.value)}
                  placeholder="Min portfölj"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cp-risk" className="text-xs uppercase tracking-wider">
                  Risktolerans
                </Label>
                <Select value={riskTolerance} onValueChange={setRiskTolerance}>
                  <SelectTrigger id="cp-risk" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Låg — bevarande</SelectItem>
                    <SelectItem value="medium">Medel — balanserad</SelectItem>
                    <SelectItem value="high">Hög — tillväxt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Holdings editor */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Innehav ({validDrafts.length})
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Lägg till aktier, fonder och andra värdepapper.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRow}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Rad
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {drafts.map((d, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-2 rounded-md border border-border bg-card/60 p-2"
                >
                  <Input
                    className="col-span-3 font-mono text-xs"
                    placeholder="TICKER"
                    value={d.ticker}
                    onChange={(e) => updateRow(i, "ticker", e.target.value)}
                  />
                  <Input
                    className="col-span-4 text-xs"
                    placeholder="Bolag"
                    value={d.company}
                    onChange={(e) => updateRow(i, "company", e.target.value)}
                  />
                  <Input
                    className="col-span-2 text-xs"
                    inputMode="decimal"
                    placeholder="Antal"
                    value={d.shares}
                    onChange={(e) => updateRow(i, "shares", e.target.value)}
                  />
                  <Input
                    className="col-span-2 text-xs"
                    inputMode="decimal"
                    placeholder="Snittpris"
                    value={d.avgCost}
                    onChange={(e) => updateRow(i, "avgCost", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    disabled={drafts.length === 1}
                    className="col-span-1 flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-bear/10 hover:text-bear disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Ta bort rad"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <Input
                    className="col-span-12 text-xs"
                    placeholder="Sektor (valfritt, t.ex. Industri, Hälssovård, Finans)"
                    value={d.sector}
                    onChange={(e) => updateRow(i, "sector", e.target.value)}
                  />
                </div>
              ))}
            </div>

            {/* Cash position slider */}
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <div className="flex items-baseline justify-between">
                <Label className="text-xs uppercase tracking-wider">
                  Kassaposition
                </Label>
                <span className="font-mono text-sm font-semibold text-gold">
                  {cashPct} %
                </span>
              </div>
              <Slider
                value={[cashPct]}
                onValueChange={(v) => setCashPct(v[0] ?? 0)}
                min={0}
                max={60}
                step={5}
                className="mt-3"
              />
              <p className="mt-2 text-[11px] text-muted-foreground">
                Uppskattad kontantpost i portföljen.{" "}
                {Number.isFinite(cashAmount) && cashAmount > 0 ? (
                  <span className="text-foreground">
                    ~{formatSEK(cashAmount)} SEK kontant
                  </span>
                ) : null}
              </p>
            </div>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || validDrafts.length === 0}
              className="bg-gold text-background hover:bg-gold/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Skickar…
                </>
              ) : (
                <>
                  Skicka för analys <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Existing portfolios ── */}
      <div className="flex flex-col gap-4">
        <div className="rounded-md border border-gold/30 bg-gold/5 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" />
            <p className="font-serif text-sm font-bold">Så här går det till</p>
          </div>
          <ol className="mt-3 flex flex-col gap-2 text-xs leading-relaxed text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">1.</span> Du
              skickar in dina innehav — tickers, antal, snittpris.
            </li>
            <li>
              <span className="font-semibold text-foreground">2.</span> En
              analytiker gör full manuell Elliott-vågsanalys per innehav och
              tidshorisont.
            </li>
            <li>
              <span className="font-semibold text-foreground">3.</span> Du får
              en pedagogisk analys — som om vi satt bredvid dig.
            </li>
            <li>
              <span className="font-semibold text-foreground">4.</span> Boka en
              15–30 min genomgång (premium) om du vill gå djupare.
            </li>
          </ol>
        </div>

        <Card className="gap-0">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="font-serif text-sm">
              Mina portföljer ({portfolios.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {portfolios.length === 0 ? (
              <div className="rounded-md border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
                <Wallet className="mx-auto h-6 w-6 text-muted-foreground/60" />
                <p className="mt-2 text-sm font-medium">Inga portföljer ännu</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Skicka in din första portfölj med formuläret till vänster.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {portfolios.map((p) => (
                  <PortfolioSummaryCard key={p.id} portfolio={p} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {latest && (
          <Card className="gap-0 border-gold/30 bg-gold/[0.03]">
            <CardContent className="pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">
                Senaste inskickade
              </p>
              <p className="mt-1 font-serif text-base font-bold">{latest.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Inskickad {formatDate(latest.submittedAt)} ·{" "}
                {latest.holdings.length} innehav
              </p>
              <div className="mt-3 flex items-center gap-2">
                <StatusBadge status={latest.analysisStatus} />
                {latest.avgWaveScore !== null && (
                  <Badge variant="outline" className="text-[10px]">
                    Våg-poäng {Math.round(latest.avgWaveScore)}/100
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function PortfolioSummaryCard({ portfolio: p }: { portfolio: Portfolio }) {
  return (
    <div className="rounded-md border border-border bg-card/60 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-serif text-sm font-bold">{p.name}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {formatDate(p.submittedAt)} · {p.holdings.length} innehav
          </p>
        </div>
        <StatusBadge status={p.analysisStatus} />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
        <div>
          <p className="text-muted-foreground">Värde</p>
          <p className="font-mono font-semibold">{formatSEK(p.totalValue)} kr</p>
        </div>
        <div>
          <p className="text-muted-foreground">Kassa</p>
          <p className="font-mono font-semibold">{formatSEK(p.cashPosition)} kr</p>
        </div>
        <div>
          <p className="text-muted-foreground">Risk</p>
          <p className="font-mono font-semibold capitalize">{p.riskTolerance}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; cls: string; icon: React.ReactNode }
  > = {
    pending: {
      label: "Väntar",
      cls: "border-gold/40 bg-gold/10 text-gold",
      icon: <Clock className="h-3 w-3" />,
    },
    in_review: {
      label: "Under granskning",
      cls: "border-gold/40 bg-gold/10 text-gold",
      icon: <Loader2 className="h-3 w-3" />,
    },
    completed: {
      label: "Klar",
      cls: "border-bull/40 bg-bull/10 text-bull",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    needs_update: {
      label: "Behöver uppdateras",
      cls: "border-bear/40 bg-bear/10 text-bear",
      icon: <AlertTriangle className="h-3 w-3" />,
    },
  };
  const s = map[status] || {
    label: status,
    cls: "border-border bg-muted/40 text-muted-foreground",
    icon: <Clock className="h-3 w-3" />,
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        s.cls
      )}
    >
      {s.icon}
      {s.label}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════
 *  TAB 2 — MIN ANALYS (pedagogical display + wave grid)
 * ════════════════════════════════════════════════════════════ */

function AnalysisTab({
  analyses,
  portfolios,
}: {
  analyses: Analysis[];
  portfolios: Portfolio[];
}) {
  const [activeId, setActiveId] = React.useState<string | null>(
    analyses[0]?.id ?? null
  );

  React.useEffect(() => {
    if (analyses.length > 0 && !analyses.find((a) => a.id === activeId)) {
      setActiveId(analyses[0].id);
    }
  }, [analyses, activeId]);

  if (analyses.length === 0) {
    return <PendingAnalysis portfolios={portfolios} />;
  }

  const active = analyses.find((a) => a.id === activeId) ?? analyses[0];
  const portfolio = portfolios.find((p) => p.id === active.id) || portfolios[0];

  return (
    <div className="flex flex-col gap-6">
      {analyses.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {analyses.map((a) => (
            <button
              key={a.id}
              onClick={() => setActiveId(a.id)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-left text-xs transition-colors",
                a.id === active.id
                  ? "border-gold/50 bg-gold/10 text-gold"
                  : "border-border bg-card hover:bg-muted"
              )}
            >
              <span className="block font-semibold">{a.title}</span>
              <span className="block text-[10px] text-muted-foreground">
                {formatDate(a.publishedAt)}
              </span>
            </button>
          ))}
        </div>
      )}

      <AnalysisView analysis={active} portfolio={portfolio} />
    </div>
  );
}

function PendingAnalysis({ portfolios }: { portfolios: Portfolio[] }) {
  const submitted = portfolios.length > 0;
  return (
    <div className="mx-auto max-w-2xl">
      <Card className="gap-0 border-gold/30 bg-gold/[0.03]">
        <CardContent className="pt-10 pb-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
            {submitted ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <FileText className="h-6 w-6" />
            )}
          </div>
          <Eyebrow className="mt-4">Analysstatus</Eyebrow>
          <h2 className="mt-2 font-serif text-2xl font-bold">
            {submitted
              ? "Analytiker granskar din portfölj"
              : "Ingen analys — ännu"}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
            {submitted
              ? "Din portfölj är mottagen. En analytiker gör en full manuell Elliott-vågsanalys — fem tidshorisonter per innehav. Du får en personlig skrivning, som om vi satt bredvid dig. Det tar normalt 2–5 arbetsdagar."
              : "Skicka in din portfölj under fliken ”Min portfölj”. När analytikern är klar visas den här — pedagogiskt upplagd med våg-matris, riskbedömning och rekommendationer."}
          </p>
          <GoldRule className="mx-auto mt-5 max-w-[180px]" />
          {submitted && (
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-gold" />
              <span>Beräknad tid kvar: 2–5 arbetsdagar</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AnalysisView({
  analysis,
  portfolio,
}: {
  analysis: Analysis;
  portfolio?: Portfolio;
}) {
  const wave = parseWaveAnalysis(analysis.waveAnalysis);

  // Build a unified holdings list: prefer JSON's holdings, fall back to portfolio
  const holdingsRows: Array<{
    ticker: string;
    company: string;
    waves: Partial<Record<Timeframe, string>>;
    confidence?: number;
    note?: string;
  }> = React.useMemo(() => {
    if (wave?.holdings && wave.holdings.length > 0) {
      return wave.holdings.map((h) => ({
        ticker: h.ticker || "—",
        company: h.company || h.ticker || "—",
        waves: h.waves || {},
        confidence: h.confidence,
        note: h.note,
      }));
    }
    if (portfolio?.holdings) {
      return portfolio.holdings.map((h) => ({
        ticker: h.ticker,
        company: h.company,
        waves: {
          Mikro: h.waveMicro || undefined,
          Kort: h.waveShort || undefined,
          Medellångsikt: h.waveMedium || undefined,
          Långsikt: h.waveLong || undefined,
          Mega: h.waveMega || undefined,
        },
        confidence: h.waveConfidence || undefined,
      }));
    }
    return [];
  }, [wave, portfolio]);

  const portfolioAverage: Partial<Record<Timeframe, string>> =
    wave?.portfolioAverage ||
    (portfolio
      ? {
          Mikro: portfolio.avgWaveMicro || undefined,
          Kort: portfolio.avgWaveShort || undefined,
          Medellångsikt: portfolio.avgWaveMedium || undefined,
          Långsikt: portfolio.avgWaveLong || undefined,
          Mega: portfolio.avgWaveMega || undefined,
        }
      : {});

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <Card className="gap-0">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <Eyebrow>Analys · {formatDate(analysis.publishedAt)}</Eyebrow>
              <h2 className="mt-2 font-serif text-2xl font-bold leading-tight tracking-tight">
                {analysis.title}
              </h2>
              {analysis.analyzedBy && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Skriven av {analysis.analyzedBy}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5">
              {analysis.confidence && (
                <Badge
                  variant={confidenceVariant(analysis.confidence)}
                  className="uppercase tracking-wider"
                >
                  Konfidens: {analysis.confidence}
                </Badge>
              )}
              {wave?.score !== undefined && (
                <Badge variant="outline" className="font-mono">
                  Våg-poäng {Math.round(wave.score)}/100
                </Badge>
              )}
            </div>
          </div>

          <GoldRule className="mt-4" />

          {/* Summary — pedagogical lede */}
          <p className="mt-4 font-serif text-base italic leading-relaxed text-foreground/90">
            “{analysis.summary}”
          </p>
        </CardContent>
      </Card>

      {/* ── Portfolio overview ── */}
      {analysis.portfolioOverview && (
        <PedagogicalSection
          icon={<Wallet className="h-4 w-4" />}
          label="Din portfölj"
          body={analysis.portfolioOverview}
        />
      )}

      {/* ── Wave analysis grid ── */}
      {holdingsRows.length > 0 && (
        <Card className="gap-0">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="flex items-center gap-2 font-serif">
              <Waves className="h-4 w-4 text-gold" />
              Elliott-våg · fem tidshorisonter
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <WaveGrid
              holdings={holdingsRows}
              portfolioAverage={portfolioAverage}
            />
          </CardContent>
        </Card>
      )}

      {/* ── Risk assessment ── */}
      {analysis.riskAssessment && (
        <PedagogicalSection
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Risknivån"
          body={analysis.riskAssessment}
        />
      )}

      {/* ── Recommendations ── */}
      {analysis.recommendations && (
        <PedagogicalSection
          icon={<TrendingUp className="h-4 w-4" />}
          label="Rekommendationer"
          body={analysis.recommendations}
        />
      )}

      {/* ── Next steps (15-30 min offer) ── */}
      {analysis.nextSteps && (
        <Card className="gap-0 border-gold/40 bg-gold/[0.04]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gold" />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">
                Nästa steg
              </p>
            </div>
            <p className="mt-3 font-serif text-base leading-relaxed">
              {analysis.nextSteps}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-md border border-gold/40 bg-background px-3 py-2 text-xs">
                <Clock className="h-3.5 w-3.5 text-gold" />
                <span>
                  <span className="font-semibold">15 min</span> genomgång —
                  snabb avstämning
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-gold/40 bg-background px-3 py-2 text-xs">
                <Clock className="h-3.5 w-3.5 text-gold" />
                <span>
                  <span className="font-semibold">30 min</span> genomgång — full
                  djupdykning
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Full body (markdown-ish) ── */}
      {analysis.body && (
        <Card className="gap-0">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="font-serif text-base">Full analys</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {analysis.body}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PedagogicalSection({
  icon,
  label,
  body,
}: {
  icon: React.ReactNode;
  label: string;
  body: string;
}) {
  return (
    <Card className="gap-0">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2">
          <span className="text-gold">{icon}</span>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">
            {label}
          </p>
        </div>
        <p className="mt-3 font-serif text-base leading-relaxed">{body}</p>
      </CardContent>
    </Card>
  );
}

/* ─── Wave grid ─── */

function WaveGrid({
  holdings,
  portfolioAverage,
}: {
  holdings: Array<{
    ticker: string;
    company: string;
    waves: Partial<Record<Timeframe, string>>;
    confidence?: number;
    note?: string;
  }>;
  portfolioAverage: Partial<Record<Timeframe, string>>;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-bull/40 bg-bull/10" />
          <span className="text-muted-foreground">Impuls (trend)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-bear/40 bg-bear/10" />
          <span className="text-muted-foreground">Korrektion (motrend)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-border bg-muted/40" />
          <span className="text-muted-foreground">Ej bedömd</span>
        </span>
      </div>

      {/* Grid — horizontal scroll on mobile */}
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Header row */}
          <div className="grid grid-cols-[1.6fr_repeat(5,1fr)_0.8fr] gap-1 border-b border-border pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="px-2">Innehav</div>
            {TIMEFRAMES.map((tf) => (
              <div key={tf} className="px-2 text-center" title={tf}>
                {TIMEFRAME_SHORT[tf]}
              </div>
            ))}
            <div className="px-2 text-center">Konf.</div>
          </div>

          {/* Holding rows */}
          {holdings.map((h, idx) => (
            <div
              key={`${h.ticker}-${idx}`}
              className="grid grid-cols-[1.6fr_repeat(5,1fr)_0.8fr] gap-1 border-b border-border/60 py-2 text-xs"
            >
              <div className="px-2">
                <p className="font-mono font-bold leading-tight">{h.ticker}</p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {h.company}
                </p>
              </div>
              {TIMEFRAMES.map((tf) => {
                const w = h.waves[tf] || null;
                return (
                  <div key={tf} className="px-1">
                    <div
                      className={cn(
                        "flex h-9 items-center justify-center rounded-md border px-1 text-center text-[10px] font-semibold leading-tight",
                        waveStyle(w)
                      )}
                      title={w || "Ej bedömd"}
                    >
                      {w ? (
                        <span className="flex flex-col items-center gap-0.5">
                          <span aria-hidden className="text-[9px] leading-none">
                            {waveGlyph(w)}
                          </span>
                          <span className="leading-none">{w}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="px-2 text-center font-mono text-[11px]">
                {h.confidence !== undefined ? (
                  <span
                    className={cn(
                      "font-semibold",
                      h.confidence >= 70
                        ? "text-bull"
                        : h.confidence >= 40
                        ? "text-gold"
                        : "text-bear"
                    )}
                  >
                    {Math.round(h.confidence)}%
                  </span>
                ) : (
                  <span className="text-muted-foreground/60">—</span>
                )}
              </div>
            </div>
          ))}

          {/* Portfolio average row */}
          <div className="grid grid-cols-[1.6fr_repeat(5,1fr)_0.8fr] gap-1 bg-gold/[0.06] py-2 text-xs">
            <div className="flex items-center gap-1 px-2">
              <Waves className="h-3 w-3 text-gold" />
              <div>
                <p className="font-serif text-[11px] font-bold leading-tight">
                  Portfölj
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  genomsnitt
                </p>
              </div>
            </div>
            {TIMEFRAMES.map((tf) => {
              const w = portfolioAverage[tf] || null;
              return (
                <div key={tf} className="px-1">
                  <div
                    className={cn(
                      "flex h-9 items-center justify-center rounded-md border border-2 px-1 text-center text-[10px] font-bold leading-tight",
                      waveStyle(w)
                    )}
                    title={w || "Ej bedömd"}
                  >
                    {w ? (
                      <span className="flex flex-col items-center gap-0.5">
                        <span aria-hidden className="text-[9px] leading-none">
                          {waveGlyph(w)}
                        </span>
                        <span className="leading-none">{w}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="px-2 text-center text-[10px] text-muted-foreground">
              Σ
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Varje cell visar aktuell Elliott-vågposition. Impuls 1–5 indikerar en
        trend i primär riktning; Korrektion A–E indikerar motrend. Portföljens
        genomsnitt vägs samman per tidshorisont.
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 *  TAB 3 — BOKA GENOMGÅNG
 * ════════════════════════════════════════════════════════════ */

function BookingTab({
  member,
  bookings,
  analyses,
  onRefresh,
  onUpgrade,
}: {
  member: Member;
  bookings: Booking[];
  analyses: Analysis[];
  onRefresh: () => void;
  onUpgrade: () => void;
}) {
  const { toast } = useToast();
  const [type, setType] = React.useState<"review_15" | "review_30">("review_30");
  const [requestedTime, setRequestedTime] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [analysisId, setAnalysisId] = React.useState<string>("");
  const [submitting, setSubmitting] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const isFree = member.memberType === "free";

  const handleBook = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member.id,
          analysisId: analysisId || undefined,
          type,
          requestedTime: requestedTime || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.upgradeRequired) {
          setDialogOpen(false);
          onUpgrade();
          return;
        }
        throw new Error(data?.error || "Kunde inte boka");
      }
      toast({
        title: "Bokningsförfrågan skickad",
        description:
          "Analytikern bekräftar tiden via e-post inom 24 timmar. Du får en möteslänk i god tid innan genomgången.",
      });
      setNotes("");
      setRequestedTime("");
      setDialogOpen(false);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Okänt fel";
      toast({
        title: "Bokning misslyckades",
        description: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      {/* ── Booking options ── */}
      <div className="flex flex-col gap-4">
        <Card className="gap-0">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="flex items-center gap-2 font-serif">
              <Calendar className="h-4 w-4 text-gold" />
              Boka genomgång med analytiker
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">
              Vi går igenom din portfölj tillsammans — våg för våg, risk för
              risk. Som om vi satt bredvid dig vid köksbordet.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <BookingOption
                active={type === "review_15"}
                onClick={() => setType("review_15")}
                title="15 minuter"
                tagline="Snabb avstämning"
                points={[
                  "Topp-3 innehav — vågläge",
                  "En röd flagga vi ser",
                  "En konkret fråga du har",
                ]}
              />
              <BookingOption
                active={type === "review_30"}
                onClick={() => setType("review_30")}
                title="30 minuter"
                tagline="Full djupdykning"
                recommended
                points={[
                  "Hela portföljens våg-matris",
                  "Riskprofil + koncentrationsanalys",
                  "Rekommendationer + Q&A",
                ]}
              />
            </div>

            {isFree ? (
              <div className="mt-5 rounded-md border border-gold/40 bg-gold/[0.05] p-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gold" />
                  <p className="font-serif text-sm font-bold">
                    Premium-funktion
                  </p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Bokning av genomgång ingår i Premium och Pro. Uppgradera för
                  att boka 15 eller 30 minuter med en analytiker.
                </p>
                <Button
                  type="button"
                  onClick={onUpgrade}
                  className="mt-3 bg-gold text-background hover:bg-gold/90"
                  size="sm"
                >
                  <Sparkles className="mr-1 h-3.5 w-3.5" /> Uppgradera till
                  Premium
                </Button>
              </div>
            ) : (
              <div className="mt-5 flex flex-col gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="cp-when"
                      className="text-xs uppercase tracking-wider"
                    >
                      Önskad tid
                    </Label>
                    <Input
                      id="cp-when"
                      type="datetime-local"
                      value={requestedTime}
                      onChange={(e) => setRequestedTime(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="cp-which-analysis"
                      className="text-xs uppercase tracking-wider"
                    >
                      Analys (valfritt)
                    </Label>
                    <Select
                      value={analysisId}
                      onValueChange={setAnalysisId}
                    >
                      <SelectTrigger id="cp-which-analysis" className="w-full">
                        <SelectValue placeholder="Välj analys" />
                      </SelectTrigger>
                      <SelectContent>
                        {analyses.length === 0 ? (
                          <SelectItem value="none" disabled>
                            Inga publicerade analyser
                          </SelectItem>
                        ) : (
                          analyses.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="cp-notes"
                    className="text-xs uppercase tracking-wider"
                  >
                    Anteckningar (valfritt)
                  </Label>
                  <Textarea
                    id="cp-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Vad vill du fokusera på? T.ex. ”Volvo — är det dags att ta vinst?”"
                  />
                </div>

                <Button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className="bg-gold text-background hover:bg-gold/90"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Boka {type === "review_15" ? "15 min" : "30 min"} genomgång
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Existing bookings */}
        <Card className="gap-0">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="font-serif text-sm">
              Mina bokningar ({bookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {bookings.length === 0 ? (
              <div className="rounded-md border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
                <Calendar className="mx-auto h-5 w-5 text-muted-foreground/60" />
                <p className="mt-2 text-sm">Inga bokningar än</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {bookings.map((b) => (
                  <BookingRow key={b.id} booking={b} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Sidebar — what to expect ── */}
      <div className="flex flex-col gap-4">
        <Card className="gap-0 border-gold/30 bg-gold/[0.03]">
          <CardContent className="pt-5">
            <Eyebrow>Vad du får</Eyebrow>
            <h3 className="mt-2 font-serif text-lg font-bold">
              En analytiker, inte en robot
            </h3>
            <GoldRule className="mt-3 max-w-[120px]" />
            <ul className="mt-4 flex flex-col gap-3 text-sm leading-relaxed">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-bull" />
                <span>
                  Genomgång av din våg-matris — fem tidshorisonter, innehav för
                  innehav.
                </span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-bull" />
                <span>
                  Tydlig riskbedömning — var sitter risken, var sitter
                  möjligheten?
                </span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-bull" />
                <span>
                  Konkreta nästa steg — inget svävande, inget kasino.
                </span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-bull" />
                <span>
                  Inspelning delas efteråt — så du kan gå tillbaka.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardContent className="pt-5">
            <Eyebrow>Anti-casino</Eyebrow>
            <p className="mt-2 font-serif text-sm font-bold">
              Vi säljer inte körningar
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              AK1A lär ut att tänka — vi ger dig inte färdiga köp- och
              säljorder. Genomgången är pedagogisk: när vi är klara förstår du
              din portfölj bättre, oavsett om du agerar på det eller inte.
            </p>
            <div className="mt-3">
              <HonestyTag kind="matt" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Confirm dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Bekräfta bokning</DialogTitle>
            <DialogDescription>
              Du bokar{" "}
              <span className="font-semibold text-foreground">
                {type === "review_15" ? "15 minuter" : "30 minuter"}
              </span>{" "}
              genomgång med en AK1A-analytiker.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tid</span>
              <span className="font-medium">
                {requestedTime ? formatDateTimeLocal(requestedTime) : "Ej angiven — analytiker föreslår"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Längd</span>
              <span className="font-medium">
                {type === "review_15" ? "15 min" : "30 min"}
              </span>
            </div>
            {notes && (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Anteckningar</span>
                <span className="rounded-md border border-border bg-muted/30 p-2 text-xs">
                  {notes}
                </span>
              </div>
            )}
          </div>
          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              Avbryt
            </Button>
            <Button
              onClick={handleBook}
              disabled={submitting}
              className="bg-gold text-background hover:bg-gold/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Skickar…
                </>
              ) : (
                <>
                  Bekräfta <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookingOption({
  active,
  onClick,
  title,
  tagline,
  points,
  recommended,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  tagline: string;
  points: string[];
  recommended?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col gap-2 rounded-md border p-3 text-left transition-all",
        active
          ? "border-gold/60 bg-gold/[0.06] shadow-sm"
          : "border-border bg-card hover:border-gold/30"
      )}
    >
      {recommended && (
        <span className="absolute right-2 top-2">
          <Badge className="bg-gold text-background text-[9px] uppercase tracking-wider">
            <Star className="mr-1 h-2.5 w-2.5" /> Rekommenderad
          </Badge>
        </span>
      )}
      <div className="flex items-center gap-2">
        <Clock
          className={cn(
            "h-4 w-4",
            active ? "text-gold" : "text-muted-foreground"
          )}
        />
        <span className="font-serif text-base font-bold">{title}</span>
      </div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {tagline}
      </p>
      <ul className="flex flex-col gap-1 text-[11px] leading-snug text-muted-foreground">
        {points.map((p, i) => (
          <li key={i} className="flex gap-1.5">
            <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-gold/70" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

function BookingRow({ booking: b }: { booking: Booking }) {
  const typeLabel = b.type === "review_15" ? "15 min" : b.type === "review_30" ? "30 min" : b.type;
  const statusMap: Record<string, { label: string; cls: string }> = {
    requested: {
      label: "Förfrågan",
      cls: "border-gold/40 bg-gold/10 text-gold",
    },
    confirmed: {
      label: "Bekräftad",
      cls: "border-bull/40 bg-bull/10 text-bull",
    },
    completed: {
      label: "Genomförd",
      cls: "border-border bg-muted/40 text-muted-foreground",
    },
    cancelled: {
      label: "Avbokad",
      cls: "border-bear/40 bg-bear/10 text-bear",
    },
  };
  const s = statusMap[b.status] || {
    label: b.status,
    cls: "border-border bg-muted/40 text-muted-foreground",
  };
  return (
    <div className="rounded-md border border-border bg-card/60 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-serif text-sm font-bold">{typeLabel} genomgång</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {b.confirmedTime
              ? `Bekräftad: ${formatDateTimeLocal(b.confirmedTime)}`
              : b.requestedTime
              ? `Önskad: ${formatDateTimeLocal(b.requestedTime)}`
              : "Tid ej angiven — väntar bekräftelse"}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            s.cls
          )}
        >
          {s.label}
        </span>
      </div>
      {b.meetingLink && (
        <a
          href={b.meetingLink}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-gold hover:underline"
        >
          <Mail className="h-3 w-3" /> Möteslänk
        </a>
      )}
      {b.notes && (
        <p className="mt-2 rounded-md border border-border bg-muted/20 p-2 text-[11px] text-muted-foreground">
          {b.notes}
        </p>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 *  TAB 4 — MITT KONTO
 * ════════════════════════════════════════════════════════════ */

function AccountTab({
  member,
  onLogout,
  onUpgrade,
}: {
  member: Member;
  onLogout: () => void;
  onUpgrade: () => void;
}) {
  const isFree = member.memberType === "free";
  const isPremium = member.memberType === "premium";
  const isPro = member.memberType === "pro";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      {/* ── Profile ── */}
      <Card className="gap-0">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="flex items-center gap-2 font-serif">
            <User className="h-4 w-4 text-gold" />
            Mitt konto
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex flex-col gap-4">
            <Field label="Namn" value={member.name || "—"} />
            <Field
              label="E-post"
              value={member.email}
              icon={<Mail className="h-3.5 w-3.5" />}
            />
            <Field
              label="Telefon"
              value={member.phone || "—"}
              icon={<Phone className="h-3.5 w-3.5" />}
            />
            <Field
              label="Medlemskap"
              value={
                <Badge
                  className={cn(
                    "uppercase tracking-wider",
                    isFree && "border-border bg-muted/40 text-muted-foreground",
                    isPremium && "bg-gold text-background",
                    isPro && "bg-foreground text-background"
                  )}
                >
                  {memberTypeLabel(member.memberType)}
                </Badge>
              }
            />
            <Field
              label="Medlem sedan"
              value={formatDate(member.createdAt)}
            />
            <Field
              label="Senaste inloggning"
              value={formatDate(member.lastLoginAt)}
            />

            <Separator />

            <Button
              variant="outline"
              onClick={onLogout}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" /> Logga ut
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Membership / upgrade ── */}
      <Card className="gap-0 border-gold/30 bg-gold/[0.03]">
        <CardContent className="pt-6">
          <Eyebrow>Medlemskap</Eyebrow>
          <h3 className="mt-2 font-serif text-xl font-bold">
            {isFree && "Uppgradera för full erfarenhet"}
            {isPremium && "Du är Premium-medlem"}
            {isPro && "Du är Pro-medlem"}
          </h3>
          <GoldRule className="mt-3 max-w-[120px]" />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <PlanCard
              title="Free"
              active={isFree}
              points={[
                "Skicka in portfölj",
                "Visa publicerade analyser",
                "Våg-matris per innehav",
              ]}
            />
            <PlanCard
              title="Premium"
              active={isPremium || isPro}
              recommended
              points={[
                "Allt i Free",
                "Boka 15–30 min genomgång",
                "Prioriterad analys-kö",
              ]}
            />
          </div>

          {isFree && (
            <Button
              onClick={onUpgrade}
              className="mt-5 w-full bg-gold text-background hover:bg-gold/90"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Uppgradera till Premium
            </Button>
          )}
          {isPremium && (
            <Button
              onClick={onUpgrade}
              variant="outline"
              className="mt-5 w-full"
            >
              Gå vidare till Pro <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {isPro && (
            <div className="mt-5 flex items-center gap-2 rounded-md border border-bull/40 bg-bull/10 px-3 py-2 text-xs text-bull">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                Du har högsta medlemskap. Allt i portalen är upplåst.
              </span>
            </div>
          )}

          <p className="mt-4 text-[11px] text-muted-foreground">
            Uppgraderingen hanteras manuellt — kontakta{" "}
            <a
              href="mailto:info@ak1nvestor.com"
              className="text-gold hover:underline"
            >
              info@ak1nvestor.com
            </a>{" "}
            så hjälper vi dig.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="flex items-center gap-1.5 text-right text-sm font-medium">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {value}
      </span>
    </div>
  );
}

function PlanCard({
  title,
  active,
  recommended,
  points,
}: {
  title: string;
  active: boolean;
  recommended?: boolean;
  points: string[];
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-md border p-3",
        active
          ? "border-gold/60 bg-gold/[0.08]"
          : "border-border bg-card/60"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-serif text-base font-bold">{title}</span>
        {active && (
          <Badge className="bg-gold text-background text-[9px] uppercase tracking-wider">
            Aktiv
          </Badge>
        )}
        {!active && recommended && (
          <Badge className="bg-gold text-background text-[9px] uppercase tracking-wider">
            <Star className="mr-1 h-2.5 w-2.5" /> Rekommenderad
          </Badge>
        )}
      </div>
      <ul className="flex flex-col gap-1 text-[11px] leading-snug text-muted-foreground">
        {points.map((p, i) => (
          <li key={i} className="flex gap-1.5">
            <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-bull" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 *  MAIN PORTAL
 * ════════════════════════════════════════════════════════════ */

export function ClientPortal() {
  const { toast } = useToast();
  const [mounted, setMounted] = React.useState(false);
  const [member, setMember] = React.useState<Member | null>(null);
  const [portfolios, setPortfolios] = React.useState<Portfolio[]>([]);
  const [analyses, setAnalyses] = React.useState<Analysis[]>([]);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState("portfolio");

  const refreshMember = React.useCallback(async (email: string) => {
    try {
      const res = await fetch(
        `/api/member/register?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      if (!res.ok || !data?.member) {
        // Stored member not found server-side — clear and reset
        clearStoredMember();
        setMember(null);
        setPortfolios([]);
        setAnalyses([]);
        setBookings([]);
        return;
      }
      const m = data.member;
      setMember({
        id: m.id,
        email: m.email,
        name: m.name,
        phone: m.phone,
        memberType: (m.memberType as MemberType) || "free",
        createdAt: m.createdAt,
        lastLoginAt: m.lastLoginAt,
      });
      setPortfolios((m.portfolios as Portfolio[]) || []);
      setAnalyses((m.analyses as Analysis[]) || []);
      setBookings((m.bookings as Booking[]) || []);
    } catch {
      /* no-op */
    }
  }, []);

  // Hydrate from localStorage
  React.useEffect(() => {
    setMounted(true);
    const stored = readStoredMember();
    if (!stored) {
      setLoading(false);
      return;
    }
    refreshMember(stored.email).finally(() => setLoading(false));
  }, [refreshMember]);

  const handleAuth = React.useCallback(
    (
      m: Member,
      p: Portfolio[],
      a: Analysis[],
      b: Booking[]
    ) => {
      setMember(m);
      setPortfolios(p);
      setAnalyses(a);
      setBookings(b);
    },
    []
  );

  const handleLogout = React.useCallback(() => {
    clearStoredMember();
    setMember(null);
    setPortfolios([]);
    setAnalyses([]);
    setBookings([]);
    setTab("portfolio");
    toast({
      title: "Utloggad",
      description: "Du är nu utloggad. Dina uppgifter finns kvar hos AK1A.",
    });
  }, [toast]);

  const handleUpgrade = React.useCallback(() => {
    toast({
      title: "Uppgradering",
      description:
        "Kontakta info@ak1nvestor.com så hjälper vi dig uppgradera till Premium eller Pro.",
    });
  }, [toast]);

  // Avoid hydration mismatch — render nothing until mounted
  if (!mounted) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-gold" />
        <p className="mt-3 text-sm text-muted-foreground">Laddar portalen…</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-gold" />
        <p className="mt-3 text-sm text-muted-foreground">Hämtar ditt konto…</p>
      </div>
    );
  }

  if (!member) {
    return <LoginRegisterScreen onAuth={handleAuth} />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      {/* Member header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-5">
        <div className="min-w-0">
          <Eyebrow>Klientportal</Eyebrow>
          <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight sm:text-3xl">
            Välkommen, {member.name || member.email.split("@")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hantera din portfölj, läs analytikerns analys, boka genomgång.
          </p>
        </div>
        <Badge
          className={cn(
            "uppercase tracking-wider",
            member.memberType === "free" &&
              "border-border bg-muted/40 text-muted-foreground",
            member.memberType === "premium" && "bg-gold text-background",
            member.memberType === "pro" && "bg-foreground text-background"
          )}
        >
          {memberTypeLabel(member.memberType)}
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList className="h-auto w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="portfolio" className="gap-1.5">
            <Wallet className="h-3.5 w-3.5" /> Min portfölj
          </TabsTrigger>
          <TabsTrigger value="analysis" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Min analys
            {analyses.length > 0 && (
              <span className="ml-1 rounded-full bg-gold/20 px-1.5 text-[10px] font-bold text-gold">
                {analyses.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="booking" className="gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> Boka genomgång
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-1.5">
            <User className="h-3.5 w-3.5" /> Mitt konto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="mt-6">
          <PortfolioTab
            member={member}
            portfolios={portfolios}
            onRefresh={() => refreshMember(member.email)}
          />
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <AnalysisTab analyses={analyses} portfolios={portfolios} />
        </TabsContent>

        <TabsContent value="booking" className="mt-6">
          <BookingTab
            member={member}
            bookings={bookings}
            analyses={analyses}
            onRefresh={() => refreshMember(member.email)}
            onUpgrade={handleUpgrade}
          />
        </TabsContent>

        <TabsContent value="account" className="mt-6">
          <AccountTab
            member={member}
            onLogout={handleLogout}
            onUpgrade={handleUpgrade}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ClientPortal;
