"use client";

/* ============================================================
 *  AK1A Research Lab — Admin Analysis Manager
 *  ----------------------------------------------------------
 *  Internal interface for analysts to review submitted client
 *  portfolios and upload their manual pedagogical analysis.
 *
 *  Three sub-panels (Analys-uppladdning):
 *    1. Member queue       — vänster lista över medlemmar med
 *                            väntande / granskas / slutförda portföljer
 *    2. Portfolio review   — mitten: vald portfölj + innehav +
 *                            Elliott-våg-redigerare (cache vs manuell)
 *    3. Upload form        — höger: titel, sammanfattning, sektioner,
 *                            våg-JSON, konfidens, publicera
 *
 *  Plus a separate Bokningar-tab for meeting confirmations.
 *
 *  Backend:
 *    GET  /api/admin/members
 *    POST /api/admin/upload-analysis
 *    GET/PUT /api/admin/bookings
 *    GET/PUT /api/stock-data/[ticker]?file=waves
 * ============================================================ */

import * as React from "react";
import {
  Users,
  FileText,
  Send,
  Save,
  Eye,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Waves,
  RefreshCw,
  Inbox,
  Calendar,
  XCircle,
  ChevronRight,
  ExternalLink,
  Loader2,
  Mail,
  CircleDot,
  TrendingUp,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
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
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────
 *  Types
 * ──────────────────────────────────────────────────────────── */

type MemberType = "free" | "premium" | "pro";
type AnalysisStatus = "pending" | "in_review" | "completed" | "needs_update";
type Confidence = "LÅG" | "MEDEL" | "HÖG";
type Timeframe = "Mikro" | "Kort" | "Medellångsikt" | "Långsikt" | "Mega";

interface ClientHolding {
  id: string;
  portfolioId: string;
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
  cacheDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ClientPortfolio {
  id: string;
  memberId: string;
  name: string;
  description: string | null;
  totalValue: number;
  cashPosition: number;
  riskTolerance: "low" | "medium" | "high";
  avgWaveMicro: string | null;
  avgWaveShort: string | null;
  avgWaveMedium: string | null;
  avgWaveLong: string | null;
  avgWaveMega: string | null;
  avgWaveScore: number | null;
  riskScore: number | null;
  analysisStatus: AnalysisStatus;
  submittedAt: string | null;
  analyzedAt: string | null;
  createdAt: string;
  updatedAt: string;
  holdings: ClientHolding[];
}

interface ClientAnalysis {
  id: string;
  memberId: string;
  portfolioId: string | null;
  type: string;
  title: string;
  summary: string;
  body: string;
  portfolioOverview: string | null;
  riskAssessment: string | null;
  waveAnalysis: string | null;
  recommendations: string | null;
  nextSteps: string | null;
  analyzedBy: string | null;
  confidence: Confidence | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Member {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  memberType: MemberType;
  sessionId: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  portfolios: ClientPortfolio[];
  analyses: ClientAnalysis[];
  bookings: Booking[];
}

interface Booking {
  id: string;
  memberId: string;
  analysisId: string | null;
  type: "review_15" | "review_30" | "strategy_session";
  requestedTime: string | null;
  confirmedTime: string | null;
  status: "requested" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
  meetingLink: string | null;
  createdAt: string;
  updatedAt: string;
  member?: Member;
}

interface MembersResponse {
  members: Member[];
  stats: {
    totalMembers: number;
    pendingPortfolios: number;
    inReviewPortfolios: number;
    completedPortfolios: number;
    totalAnalyses: number;
    totalBookings: number;
  };
}

/* ────────────────────────────────────────────────────────────
 *  Constants
 * ──────────────────────────────────────────────────────────── */

const WAVE_IMPULSE = ["Impuls 1", "Impuls 2", "Impuls 3", "Impuls 4", "Impuls 5"];
const WAVE_CORRECTION = ["Korrektion A", "Korrektion B", "Korrektion C", "Korrektion D", "Korrektion E"];
const WAVE_OPTIONS = [...WAVE_IMPULSE, ...WAVE_CORRECTION];

const TIMEFRAMES: { key: keyof ClientHolding; label: Timeframe }[] = [
  { key: "waveMicro", label: "Mikro" },
  { key: "waveShort", label: "Kort" },
  { key: "waveMedium", label: "Medellångsikt" },
  { key: "waveLong", label: "Långsikt" },
  { key: "waveMega", label: "Mega" },
];

const MEMBER_TYPE_LABELS: Record<MemberType, string> = {
  free: "Free",
  premium: "Premium",
  pro: "Pro",
};

const MEMBER_TYPE_COLORS: Record<MemberType, string> = {
  free: "border-muted-foreground/30 text-muted-foreground",
  premium: "border-gold/50 text-gold bg-gold/5",
  pro: "border-bull/50 text-bull bg-bull/5",
};

const STATUS_LABELS: Record<AnalysisStatus, string> = {
  pending: "Väntar",
  in_review: "Under granskning",
  completed: "Slutförd",
  needs_update: "Behöver uppdatering",
};

const STATUS_COLORS: Record<AnalysisStatus, string> = {
  pending: "border-gold/40 text-gold bg-gold/5",
  in_review: "border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/5",
  completed: "border-bull/40 text-bull bg-bull/5",
  needs_update: "border-bear/40 text-bear bg-bear/5",
};

const CONFIDENCE_LEVELS: Confidence[] = ["LÅG", "MEDEL", "HÖG"];

const ANALYSIS_TYPES = [
  { value: "full_portfolio", label: "Full portföljanalys" },
  { value: "single_stock", label: "Enskild aktie" },
  { value: "sector_review", label: "Sektorgranskning" },
  { value: "strategy_review", label: "Strategigranskning" },
];

const RISK_TOLERANCE_LABELS: Record<string, string> = {
  low: "Låg",
  medium: "Medel",
  high: "Hög",
};

const BOOKING_TYPE_LABELS: Record<string, string> = {
  review_15: "15 min genomgång",
  review_30: "30 min genomgång",
  strategy_session: "Strategimöte",
};

/* ────────────────────────────────────────────────────────────
 *  Helpers
 * ──────────────────────────────────────────────────────────── */

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatWeight(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(1)}%`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("sv-SE", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s sedan`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m sedan`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h sedan`;
  const day = Math.floor(hr / 24);
  return `${day}d sedan`;
}

function countByStatus(member: Member, status: AnalysisStatus): number {
  return member.portfolios.filter((p) => p.analysisStatus === status).length;
}

function isWaveImpulse(value: string | null | undefined): boolean {
  if (!value) return false;
  return value.toLowerCase().startsWith("impuls");
}

function waveColor(value: string | null | undefined): string {
  if (!value) return "text-muted-foreground";
  return isWaveImpulse(value) ? "text-bull" : "text-bear";
}

/** Build the auto-generated waveAnalysis JSON from a portfolio's holdings. */
function buildWaveAnalysisJSON(portfolio: ClientPortfolio | null): string {
  if (!portfolio) return "{}";
  const out: Record<string, any> = {
    portfolioId: portfolio.id,
    portfolioName: portfolio.name,
    aggregated: {
      mikro: portfolio.avgWaveMicro,
      kort: portfolio.avgWaveShort,
      medellangsikt: portfolio.avgWaveMedium,
      langsikt: portfolio.avgWaveLong,
      mega: portfolio.avgWaveMega,
      avgWaveScore: portfolio.avgWaveScore,
    },
    holdings: portfolio.holdings.map((h) => ({
      ticker: h.ticker,
      company: h.company,
      weight: h.weight,
      usedCache: h.usedCache,
      waves: {
        mikro: h.waveMicro,
        kort: h.waveShort,
        medellangsikt: h.waveMedium,
        langsikt: h.waveLong,
        mega: h.waveMega,
      },
      waveScore: h.waveScore,
      waveConfidence: h.waveConfidence,
    })),
  };
  return JSON.stringify(out, null, 2);
}

/* ────────────────────────────────────────────────────────────
 *  Main component
 * ──────────────────────────────────────────────────────────── */

export function AdminAnalysisManager() {
  const [subTab, setSubTab] = React.useState<"analysis" | "bookings">("analysis");

  // Members + selection
  const [members, setMembers] = React.useState<Member[]>([]);
  const [stats, setStats] = React.useState<MembersResponse["stats"] | null>(null);
  const [membersLoading, setMembersLoading] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<"all" | AnalysisStatus>("all");
  const [selectedMemberId, setSelectedMemberId] = React.useState<string | null>(null);
  const [selectedPortfolioId, setSelectedPortfolioId] = React.useState<string | null>(null);

  // Per-holding wave edits (keyed by holdingId)
  const [waveEdits, setWaveEdits] = React.useState<
    Record<string, Partial<Record<keyof ClientHolding, string>>>
  >({});

  // Analysis upload form state
  const [form, setForm] = React.useState({
    type: "full_portfolio",
    title: "",
    summary: "",
    portfolioOverview: "",
    riskAssessment: "",
    waveAnalysis: "",
    recommendations: "",
    nextSteps: "",
    confidence: "MEDEL" as Confidence,
    isPublished: true,
  });
  const [saveState, setSaveState] = React.useState<{
    loading: boolean;
    error: string | null;
    success: string | null;
  }>({ loading: false, error: null, success: null });

  // Bookings
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = React.useState(false);

  const fetchMembers = React.useCallback(async () => {
    setMembersLoading(true);
    try {
      const res = await fetch("/api/admin/members", { cache: "no-store" });
      if (res.ok) {
        const data: MembersResponse = await res.json();
        setMembers(data.members || []);
        setStats(data.stats || null);
      }
    } catch {
      // silent
    } finally {
      setMembersLoading(false);
    }
  }, []);

  const fetchBookings = React.useCallback(async () => {
    setBookingsLoading(true);
    try {
      const res = await fetch("/api/admin/bookings", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch {
      // silent
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  React.useEffect(() => {
    if (subTab === "bookings" && bookings.length === 0) {
      fetchBookings();
    }
  }, [subTab, bookings.length, fetchBookings]);

  // Filter members based on status filter
  const filteredMembers = React.useMemo(() => {
    if (statusFilter === "all") return members;
    return members.filter((m) =>
      m.portfolios.some((p) => p.analysisStatus === statusFilter)
    );
  }, [members, statusFilter]);

  const selectedMember = React.useMemo(
    () => members.find((m) => m.id === selectedMemberId) || null,
    [members, selectedMemberId]
  );

  const selectedPortfolio = React.useMemo(() => {
    if (!selectedMember || !selectedPortfolioId) return null;
    return (
      selectedMember.portfolios.find((p) => p.id === selectedPortfolioId) || null
    );
  }, [selectedMember, selectedPortfolioId]);

  // Reset portfolio selection when member changes
  React.useEffect(() => {
    if (selectedMember && selectedMember.portfolios.length > 0) {
      const pending =
        selectedMember.portfolios.find((p) => p.analysisStatus !== "completed") ||
        selectedMember.portfolios[0];
      setSelectedPortfolioId(pending.id);
      // Reset wave edits
      setWaveEdits({});
    } else {
      setSelectedPortfolioId(null);
    }
    // Reset form when member changes
    setForm((f) => ({
      ...f,
      title: "",
      summary: "",
      portfolioOverview: "",
      riskAssessment: "",
      waveAnalysis: "",
      recommendations: "",
      nextSteps: "",
    }));
    setSaveState({ loading: false, error: null, success: null });
  }, [selectedMemberId]);

  // Update auto-generated waveAnalysis when portfolio or wave edits change
  React.useEffect(() => {
    if (!selectedPortfolio) return;
    const mergedPortfolio: ClientPortfolio = {
      ...selectedPortfolio,
      holdings: selectedPortfolio.holdings.map((h) => {
        const edit = waveEdits[h.id] || {};
        return {
          ...h,
          waveMicro: edit.waveMicro ?? h.waveMicro,
          waveShort: edit.waveShort ?? h.waveShort,
          waveMedium: edit.waveMedium ?? h.waveMedium,
          waveLong: edit.waveLong ?? h.waveLong,
          waveMega: edit.waveMega ?? h.waveMega,
        };
      }),
    };
    setForm((f) => ({
      ...f,
      waveAnalysis: buildWaveAnalysisJSON(mergedPortfolio),
    }));
  }, [selectedPortfolio, waveEdits]);

  const handleWaveEdit = (
    holdingId: string,
    field: keyof ClientHolding,
    value: string
  ) => {
    setWaveEdits((prev) => ({
      ...prev,
      [holdingId]: { ...(prev[holdingId] || {}), [field]: value },
    }));
  };

  const handleSaveWavesToCache = async (ticker: string) => {
    try {
      // Find holdings with edits for this ticker
      const editedHoldings =
        selectedPortfolio?.holdings.filter((h) => h.ticker === ticker && waveEdits[h.id]) || [];
      if (editedHoldings.length === 0) return;
      const edit = waveEdits[editedHoldings[0].id];
      const payload = {
        ticker: ticker.toUpperCase(),
        score: 50,
        confidence: 50,
        mikro: { position: edit.waveMicro },
        kort: { position: edit.waveShort },
        medellangsikt: { position: edit.waveMedium },
        langsikt: { position: edit.waveLong },
        mega: { position: edit.waveMega },
      };
      await fetch(`/api/stock-data/${encodeURIComponent(ticker)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: "waves", data: payload }),
      });
    } catch {
      // silent
    }
  };

  const handleUpload = async (publish: boolean) => {
    if (!selectedMember || !selectedPortfolio) {
      setSaveState({ loading: false, error: "Välj en medlem och portfölj först.", success: null });
      return;
    }
    if (!form.title.trim() || !form.summary.trim()) {
      setSaveState({ loading: false, error: "Titel och sammanfattning krävs.", success: null });
      return;
    }
    setSaveState({ loading: true, error: null, success: null });
    try {
      let waveAnalysisJSON: any = null;
      try {
        waveAnalysisJSON = form.waveAnalysis ? JSON.parse(form.waveAnalysis) : null;
      } catch {
        // Treat as raw string if not valid JSON
        waveAnalysisJSON = form.waveAnalysis || null;
      }
      const res = await fetch("/api/admin/upload-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedMember.id,
          portfolioId: selectedPortfolio.id,
          type: form.type,
          title: form.title,
          summary: form.summary,
          body: form.summary, // summary doubles as body when no long-form body field
          portfolioOverview: form.portfolioOverview,
          riskAssessment: form.riskAssessment,
          waveAnalysis: waveAnalysisJSON,
          recommendations: form.recommendations,
          nextSteps: form.nextSteps,
          confidence: form.confidence,
          isPublished: publish,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Uppladdning misslyckades");
      }
      setSaveState({
        loading: false,
        error: null,
        success: publish
          ? `Analys publicerad till ${selectedMember.email}. Portfölj markerad som slutförd.`
          : `Utkast sparat för ${selectedMember.email}.`,
      });
      // Refresh members so the queue reflects the new state
      fetchMembers();
    } catch (err: any) {
      setSaveState({ loading: false, error: err.message || "Okänt fel", success: null });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>Analys-uppladdning</Eyebrow>
          <h2 className="mt-1 font-serif text-2xl font-bold">
            Analytiker-konsol
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Granska inskickade portföljer, fyll i Elliott-vågar manuellt och publicera
            pedagogiska analyser till klienter.
            <HonestyTag kind="matt" className="ml-2" /> — varje publicering loggas i aktivitetsloggen.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={fetchMembers} disabled={membersLoading}>
            <RefreshCw className={cn("mr-1 h-3.5 w-3.5", membersLoading && "animate-spin")} />
            Uppdatera kö
          </Button>
        </div>
      </div>

      <GoldRule />

      {/* Stats strip */}
      {stats && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          <StatTile label="Medlemmar" value={stats.totalMembers} icon={<Users className="h-3.5 w-3.5" />} />
          <StatTile label="Väntar" value={stats.pendingPortfolios} icon={<Clock className="h-3.5 w-3.5 text-gold" />} accent="gold" />
          <StatTile label="Under granskning" value={stats.inReviewPortfolios} icon={<Eye className="h-3.5 w-3.5 text-blue-600" />} />
          <StatTile label="Slutförda" value={stats.completedPortfolios} icon={<CheckCircle2 className="h-3.5 w-3.5 text-bull" />} accent="bull" />
          <StatTile label="Publicerade analyser" value={stats.totalAnalyses} icon={<FileText className="h-3.5 w-3.5" />} />
          <StatTile label="Bokningar" value={stats.totalBookings} icon={<Calendar className="h-3.5 w-3.5 text-gold" />} accent="gold" />
        </div>
      )}

      <Tabs value={subTab} onValueChange={(v) => setSubTab(v as "analysis" | "bookings")}>
        <TabsList className="inline-flex h-auto w-max flex-nowrap gap-1 rounded-lg bg-muted p-1">
          <TabsTrigger value="analysis" className="px-3 py-1.5 text-xs sm:text-sm">
            <FileText className="mr-1.5 h-3.5 w-3.5" /> Analys-uppladdning
          </TabsTrigger>
          <TabsTrigger value="bookings" className="px-3 py-1.5 text-xs sm:text-sm">
            <Calendar className="mr-1.5 h-3.5 w-3.5" /> Bokningar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-12">
            {/* LEFT: Member queue */}
            <div className="lg:col-span-3">
              <MemberQueue
                members={filteredMembers}
                allMembers={members}
                loading={membersLoading}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                selectedMemberId={selectedMemberId}
                onSelectMember={setSelectedMemberId}
              />
            </div>

            {/* MIDDLE: Portfolio review */}
            <div className="lg:col-span-5">
              <PortfolioReview
                member={selectedMember}
                portfolio={selectedPortfolio}
                waveEdits={waveEdits}
                onWaveEdit={handleWaveEdit}
                onSaveWavesToCache={handleSaveWavesToCache}
                onSelectPortfolio={setSelectedPortfolioId}
              />
            </div>

            {/* RIGHT: Upload form */}
            <div className="lg:col-span-4">
              <AnalysisUploadForm
                form={form}
                onFormChange={setForm}
                member={selectedMember}
                portfolio={selectedPortfolio}
                saveState={saveState}
                onUpload={handleUpload}
                onClearSuccess={() => setSaveState((s) => ({ ...s, success: null }))}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="mt-4">
          <BookingsManager
            bookings={bookings}
            loading={bookingsLoading}
            onRefresh={fetchBookings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 *  Member queue (left)
 * ──────────────────────────────────────────────────────────── */

function MemberQueue({
  members,
  allMembers,
  loading,
  statusFilter,
  onStatusFilterChange,
  selectedMemberId,
  onSelectMember,
}: {
  members: Member[];
  allMembers: Member[];
  loading: boolean;
  statusFilter: "all" | AnalysisStatus;
  onStatusFilterChange: (s: "all" | AnalysisStatus) => void;
  selectedMemberId: string | null;
  onSelectMember: (id: string) => void;
}) {
  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gold" />
          <h3 className="font-serif text-sm font-bold">Medlemskö</h3>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          {allMembers.length} totalt
        </Badge>
      </div>

      <div className="mt-3">
        <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as any)}>
          <SelectTrigger className="h-8 w-full text-xs">
            <SelectValue placeholder="Filtrera på status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla (med portföljer)</SelectItem>
            <SelectItem value="pending">Väntar</SelectItem>
            <SelectItem value="in_review">Under granskning</SelectItem>
            <SelectItem value="completed">Slutförda</SelectItem>
            <SelectItem value="needs_update">Behöver uppdatering</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-3" />

      <ScrollArea className="-mx-1 flex-1 px-1" style={{ height: "min(620px, 70vh)" }}>
        <div className="space-y-1.5">
          {loading && members.length === 0 && (
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Hämtar medlemmar…
            </div>
          )}
          {!loading && members.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Inbox className="h-6 w-6 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">
                {statusFilter === "all"
                  ? "Inga medlemmar med portföljer än."
                  : `Inga medlemmar med status "${STATUS_LABELS[statusFilter]}".`}
              </p>
            </div>
          )}
          {members.map((m) => {
            const pending = countByStatus(m, "pending") + countByStatus(m, "in_review");
            const completed = countByStatus(m, "completed");
            const isSelected = m.id === selectedMemberId;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMember(m.id)}
                className={cn(
                  "w-full rounded-md border p-2.5 text-left transition-colors",
                  isSelected
                    ? "border-gold/60 bg-gold/5"
                    : "border-border bg-card hover:border-gold/30 hover:bg-gold/[0.02]"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">
                      {m.name || m.email}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-muted-foreground">
                      <Mail className="h-2.5 w-2.5" /> {m.email}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("shrink-0 text-[9px]", MEMBER_TYPE_COLORS[m.memberType])}
                  >
                    {MEMBER_TYPE_LABELS[m.memberType]}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  {pending > 0 && (
                    <Badge variant="outline" className="text-[9px] border-gold/40 text-gold">
                      <Clock className="mr-0.5 h-2.5 w-2.5" /> {pending} kö
                    </Badge>
                  )}
                  {completed > 0 && (
                    <Badge variant="outline" className="text-[9px] border-bull/40 text-bull">
                      <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" /> {completed} klar
                    </Badge>
                  )}
                  {m.analyses.length > 0 && (
                    <Badge variant="outline" className="text-[9px] text-muted-foreground">
                      <FileText className="mr-0.5 h-2.5 w-2.5" /> {m.analyses.length} analys
                    </Badge>
                  )}
                  {m.bookings.length > 0 && (
                    <Badge variant="outline" className="text-[9px] text-muted-foreground">
                      <Calendar className="mr-0.5 h-2.5 w-2.5" /> {m.bookings.length} bokn.
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────
 *  Portfolio review (middle)
 * ──────────────────────────────────────────────────────────── */

function PortfolioReview({
  member,
  portfolio,
  waveEdits,
  onWaveEdit,
  onSaveWavesToCache,
  onSelectPortfolio,
}: {
  member: Member | null;
  portfolio: ClientPortfolio | null;
  waveEdits: Record<string, Partial<Record<keyof ClientHolding, string>>>;
  onWaveEdit: (holdingId: string, field: keyof ClientHolding, value: string) => void;
  onSaveWavesToCache: (ticker: string) => void;
  onSelectPortfolio: (id: string) => void;
}) {
  if (!member) {
    return (
      <Card className="flex h-full items-center justify-center p-10">
        <div className="text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            Välj en medlem i kön till vänster.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Du ser deras inskickade portföljer och kan börja granska.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col p-4">
      {/* Member header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-serif text-base font-bold">
            {member.name || member.email}
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" /> {member.email}
            {member.phone && (
              <>
                <span aria-hidden>·</span>
                <span>{member.phone}</span>
              </>
            )}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn("shrink-0 text-[10px]", MEMBER_TYPE_COLORS[member.memberType])}
        >
          {MEMBER_TYPE_LABELS[member.memberType]}
        </Badge>
      </div>

      {/* Portfolio selector */}
      {member.portfolios.length > 0 && (
        <div className="mt-3">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Portfölj
          </Label>
          <Select
            value={portfolio?.id || ""}
            onValueChange={(v) => onSelectPortfolio(v)}
          >
            <SelectTrigger className="mt-1 h-9 w-full text-xs">
              <SelectValue placeholder="Välj portfölj" />
            </SelectTrigger>
            <SelectContent>
              {member.portfolios.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  <span className="flex items-center gap-2">
                    <CircleDot
                      className={cn(
                        "h-3 w-3",
                        p.analysisStatus === "completed"
                          ? "text-bull"
                          : p.analysisStatus === "in_review"
                            ? "text-blue-600"
                            : "text-gold"
                      )}
                    />
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground">
                      · {STATUS_LABELS[p.analysisStatus]}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {member.portfolios.length === 0 && (
        <div className="mt-6 flex flex-col items-center justify-center gap-2 py-10 text-center">
          <FolderOpen className="h-6 w-6 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">
            Medlemmen har inte skickat in någon portfölj.
          </p>
        </div>
      )}

      {portfolio && (
        <>
          <Separator className="my-3" />

          {/* Portfolio meta */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MetaTile label="Totalt värde" value={formatCurrency(portfolio.totalValue)} />
            <MetaTile label="Kontantpos." value={formatCurrency(portfolio.cashPosition)} />
            <MetaTile
              label="Risktolerans"
              value={RISK_TOLERANCE_LABELS[portfolio.riskTolerance] || portfolio.riskTolerance}
            />
            <MetaTile label="Inlämnad" value={timeAgo(portfolio.submittedAt)} />
          </div>

          <div className="mt-2 flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("text-[10px]", STATUS_COLORS[portfolio.analysisStatus])}
            >
              {STATUS_LABELS[portfolio.analysisStatus]}
            </Badge>
            {portfolio.riskScore !== null && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                Risk-score: {portfolio.riskScore.toFixed(1)}
              </Badge>
            )}
            {portfolio.avgWaveScore !== null && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                <Waves className="mr-1 h-2.5 w-2.5" />
                Våg-score: {portfolio.avgWaveScore.toFixed(1)}
              </Badge>
            )}
          </div>

          <Separator className="my-3" />

          {/* Aggregated portfolio waves (from cache) */}
          <div>
            <div className="flex items-center gap-1.5">
              <Waves className="h-3.5 w-3.5 text-gold" />
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Portföljens aggregerade vågor
              </h4>
            </div>
            <div className="mt-1.5 grid grid-cols-5 gap-1">
              {TIMEFRAMES.map((tf) => {
                const val = (portfolio as any)[
                  tf.key.replace("wave", "avgWave") as keyof ClientPortfolio
                ] as string | null;
                return (
                  <div
                    key={tf.label}
                    className="rounded border border-border bg-muted/30 px-1.5 py-1 text-center"
                  >
                    <p className="text-[9px] uppercase text-muted-foreground">{tf.label}</p>
                    <p className={cn("mt-0.5 text-[10px] font-semibold", waveColor(val))}>
                      {val || "—"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator className="my-3" />

          {/* Holdings list with wave editor */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-gold" />
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Innehav ({portfolio.holdings.length})
              </h4>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {portfolio.holdings.filter((h) => h.usedCache).length} cache ·{" "}
              {portfolio.holdings.filter((h) => !h.usedCache).length} manuell
            </span>
          </div>

          <ScrollArea className="mt-2 -mx-1 flex-1 px-1" style={{ height: "min(420px, 50vh)" }}>
            <div className="space-y-2">
              {portfolio.holdings.map((h) => (
                <HoldingWaveEditor
                  key={h.id}
                  holding={h}
                  edits={waveEdits[h.id] || {}}
                  onEdit={(field, value) => onWaveEdit(h.id, field, value)}
                  onSaveCache={() => onSaveWavesToCache(h.ticker)}
                />
              ))}
              {portfolio.holdings.length === 0 && (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  Inga innehav i denna portfölj.
                </p>
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────
 *  Holding wave editor
 * ──────────────────────────────────────────────────────────── */

function HoldingWaveEditor({
  holding,
  edits,
  onEdit,
  onSaveCache,
}: {
  holding: ClientHolding;
  edits: Partial<Record<keyof ClientHolding, string>>;
  onEdit: (field: keyof ClientHolding, value: string) => void;
  onSaveCache: () => void;
}) {
  const [saving, setSaving] = React.useState(false);
  const hasEdits = TIMEFRAMES.some((tf) => edits[tf.key] !== undefined);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveCache();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-md border border-border bg-card p-2.5">
      {/* Holding header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold">{holding.ticker}</span>
            <Badge
              variant="outline"
              className={cn(
                "text-[9px]",
                holding.usedCache
                  ? "border-bull/40 text-bull"
                  : "border-gold/40 text-gold"
              )}
            >
              {holding.usedCache ? (
                <>
                  <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" /> Cache
                </>
              ) : (
                <>
                  <AlertTriangle className="mr-0.5 h-2.5 w-2.5" /> Manuell
                </>
              )}
            </Badge>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {holding.company}
          </p>
        </div>
        <div className="shrink-0 text-right text-[10px] text-muted-foreground">
          <p className="font-mono font-semibold text-foreground">
            {formatWeight(holding.weight)}
          </p>
          <p className="mt-0.5">{holding.shares.toLocaleString("sv-SE")} aktier</p>
        </div>
      </div>

      {/* Prices + cache date */}
      <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] text-muted-foreground">
        <span>
          Snittkost:{" "}
          <span className="font-mono text-foreground">
            {holding.avgCost !== null ? formatCurrency(holding.avgCost) : "—"}
          </span>
        </span>
        <span>
          Kurs:{" "}
          <span className="font-mono text-foreground">
            {holding.currentPrice !== null ? formatCurrency(holding.currentPrice) : "—"}
          </span>
        </span>
        <span className="text-right">
          {holding.cacheDate
            ? `cache: ${timeAgo(holding.cacheDate)}`
            : "ingen cache"}
        </span>
      </div>

      {/* Wave editor — 5 timeframes */}
      <div className="mt-2 grid grid-cols-5 gap-1">
        {TIMEFRAMES.map((tf) => {
          const stored = holding[tf.key] as string | null;
          const current = edits[tf.key] ?? stored ?? "";
          return (
            <div key={tf.label}>
              <Label className="text-[8px] uppercase tracking-wide text-muted-foreground">
                {tf.label}
              </Label>
              <Select
                value={current}
                onValueChange={(v) => onEdit(tf.key, v)}
              >
                <SelectTrigger
                  className={cn(
                    "mt-0.5 h-7 w-full px-1.5 py-0 text-[10px]",
                    !current && "border-dashed text-muted-foreground"
                  )}
                >
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="text-[10px]">
                    <span className="text-muted-foreground">— ej satt —</span>
                  </SelectItem>
                  <SelectGroup>
                    <SelectLabel className="text-[9px] uppercase">Impuls</SelectLabel>
                    {WAVE_IMPULSE.map((w) => (
                      <SelectItem key={w} value={w} className="text-[10px]">
                        {w}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="text-[9px] uppercase">Korrektion</SelectLabel>
                    {WAVE_CORRECTION.map((w) => (
                      <SelectItem key={w} value={w} className="text-[10px]">
                        {w}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>

      {/* Footer actions */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <a
          href={`/api/stock-data/${encodeURIComponent(holding.ticker)}?file=waves`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-gold"
        >
          <FolderOpen className="h-3 w-3" /> Öppna data-mapp
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
        {hasEdits && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={saving}
            className="h-6 px-2 text-[10px]"
          >
            {saving ? (
              <Loader2 className="mr-1 h-2.5 w-2.5 animate-spin" />
            ) : (
              <Save className="mr-1 h-2.5 w-2.5" />
            )}
            Spara till cache
          </Button>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 *  Analysis upload form (right)
 * ──────────────────────────────────────────────────────────── */

function AnalysisUploadForm({
  form,
  onFormChange,
  member,
  portfolio,
  saveState,
  onUpload,
  onClearSuccess,
}: {
  form: {
    type: string;
    title: string;
    summary: string;
    portfolioOverview: string;
    riskAssessment: string;
    waveAnalysis: string;
    recommendations: string;
    nextSteps: string;
    confidence: Confidence;
    isPublished: boolean;
  };
  onFormChange: React.Dispatch<
    React.SetStateAction<{
      type: string;
      title: string;
      summary: string;
      portfolioOverview: string;
      riskAssessment: string;
      waveAnalysis: string;
      recommendations: string;
      nextSteps: string;
      confidence: Confidence;
      isPublished: boolean;
    }>
  >;
  member: Member | null;
  portfolio: ClientPortfolio | null;
  saveState: { loading: boolean; error: string | null; success: string | null };
  onUpload: (publish: boolean) => void;
  onClearSuccess: () => void;
}) {
  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    onFormChange((prev) => ({ ...prev, [key]: value }));
  };

  const summaryWords = form.summary.trim()
    ? form.summary.trim().split(/\s+/).length
    : 0;

  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-gold" />
        <h3 className="font-serif text-sm font-bold">Analys</h3>
        {member && portfolio && (
          <Badge variant="secondary" className="ml-auto text-[9px]">
            {member.email.split("@")[0]} · {portfolio.name}
          </Badge>
        )}
      </div>

      {!member || !portfolio ? (
        <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
          <FileText className="h-6 w-6 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">
            Välj en medlem och portfölj för att aktivera formuläret.
          </p>
        </div>
      ) : (
        <ScrollArea className="mt-3 -mx-1 flex-1 px-1" style={{ height: "min(720px, 78vh)" }}>
          <div className="space-y-3 pr-1">
            {/* Type + Title */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Analys-typ
                </Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => update("type", v)}
                >
                  <SelectTrigger className="mt-1 h-8 w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ANALYSIS_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="text-xs">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Konfidens
                </Label>
                <Select
                  value={form.confidence}
                  onValueChange={(v) => update("confidence", v as Confidence)}
                >
                  <SelectTrigger className="mt-1 h-8 w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONFIDENCE_LEVELS.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Titel
              </Label>
              <Input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder={`Portföljanalys — ${new Date().toISOString().slice(0, 10)}`}
                className="mt-1 h-9 text-sm"
              />
            </div>

            {/* Summary */}
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Sammanfattning (100–300 ord, pedagogisk)
                </Label>
                <span
                  className={cn(
                    "text-[9px]",
                    summaryWords < 100
                      ? "text-muted-foreground"
                      : summaryWords > 300
                        ? "text-bear"
                        : "text-bull"
                  )}
                >
                  {summaryWords} ord
                </span>
              </div>
              <Textarea
                value={form.summary}
                onChange={(e) => update("summary", e.target.value)}
                placeholder="Ge klienten en pedagogisk, rak sammanfattning av portföljens tillstånd, styrkor och viktigaste risker. Skriv i klartext — inga interna koder."
                className="mt-1 min-h-[100px] text-sm"
              />
            </div>

            {/* Portfolio overview */}
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Portföljöversikt
              </Label>
              <Textarea
                value={form.portfolioOverview}
                onChange={(e) => update("portfolioOverview", e.target.value)}
                placeholder={`Din portfölj består av ${portfolio.holdings.length} innehav med en total exponering på ${formatCurrency(portfolio.totalValue)}…`}
                className="mt-1 min-h-[80px] text-sm"
              />
            </div>

            {/* Risk assessment */}
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Riskbedömning
              </Label>
              <Textarea
                value={form.riskAssessment}
                onChange={(e) => update("riskAssessment", e.target.value)}
                placeholder={`Risknivån är ${RISK_TOLERANCE_LABELS[portfolio.riskTolerance] || "medel"}. Koncentrationen mot enskilda innehav och sektorer är…`}
                className="mt-1 min-h-[80px] text-sm"
              />
            </div>

            {/* Wave analysis (JSON) */}
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Våganalys (JSON, auto-genererad — redigerbar)
                </Label>
                <Badge variant="outline" className="text-[9px] text-muted-foreground">
                  <Waves className="mr-1 h-2.5 w-2.5" /> Auto från innehav
                </Badge>
              </div>
              <Textarea
                value={form.waveAnalysis}
                onChange={(e) => update("waveAnalysis", e.target.value)}
                spellCheck={false}
                className="mt-1 min-h-[140px] resize-y font-mono text-[10px] leading-snug"
              />
            </div>

            {/* Recommendations */}
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Rekommendationer
              </Label>
              <Textarea
                value={form.recommendations}
                onChange={(e) => update("recommendations", e.target.value)}
                placeholder="Konkreta råd. T.ex. 'Överväg att reducera positionen i X från 22% till 12% för att minska sektorrisk…'"
                className="mt-1 min-h-[80px] text-sm"
              />
            </div>

            {/* Next steps */}
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Nästa steg
              </Label>
              <Textarea
                value={form.nextSteps}
                onChange={(e) => update("nextSteps", e.target.value)}
                placeholder="Boka 15–30 min genomgång med analytiker för att diskutera rekommendationerna. Du kan boka via Bokningar-fliken i din portal."
                className="mt-1 min-h-[60px] text-sm"
              />
            </div>

            <Separator />

            {/* Publish checkbox */}
            <label
              htmlFor="publish-check"
              className="flex cursor-pointer items-start gap-2 rounded-md border border-border bg-muted/30 p-2.5"
            >
              <Checkbox
                id="publish-check"
                checked={form.isPublished}
                onCheckedChange={(v) => update("isPublished", v === true)}
                className="mt-0.5"
              />
              <div className="text-xs">
                <p className="font-medium">
                  Publicera till klient
                </p>
                <p className="mt-0.5 text-muted-foreground">
                  Om markerad syns analysen i klientens portal och portföljen markeras
                  som slutförd. Avmarkera för att spara som utkast.
                </p>
              </div>
            </label>

            {/* Error / success messages */}
            {saveState.error && (
              <div className="flex items-start gap-2 rounded-md border border-bear/40 bg-bear/5 p-2.5 text-xs text-bear">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{saveState.error}</span>
              </div>
            )}
            {saveState.success && (
              <div className="flex items-start gap-2 rounded-md border border-bull/40 bg-bull/5 p-2.5 text-xs text-bull">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="flex-1">{saveState.success}</span>
                <button
                  onClick={onClearSuccess}
                  className="text-bull/70 hover:text-bull"
                  aria-label="Stäng"
                >
                  <XCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => onUpload(false)}
                disabled={saveState.loading || !form.title || !form.summary}
                className="flex-1"
              >
                {saveState.loading ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                )}
                Spara som utkast
              </Button>
              <Button
                onClick={() => onUpload(true)}
                disabled={saveState.loading || !form.title || !form.summary}
                className="flex-1 bg-gold text-background hover:bg-gold/90"
              >
                {saveState.loading ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                )}
                Publicera till klient
              </Button>
            </div>
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────
 *  Bookings manager
 * ──────────────────────────────────────────────────────────── */

function BookingsManager({
  bookings,
  loading,
  onRefresh,
}: {
  bookings: Booking[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const [filter, setFilter] = React.useState<"all" | "requested" | "confirmed" | "cancelled">("all");
  const [confirmDialog, setConfirmDialog] = React.useState<Booking | null>(null);
  const [meetingLink, setMeetingLink] = React.useState("");
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  const handleConfirm = async () => {
    if (!confirmDialog) return;
    setActionLoading(confirmDialog.id);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: confirmDialog.id,
          status: "confirmed",
          meetingLink: meetingLink || undefined,
        }),
      });
      if (res.ok) {
        setConfirmDialog(null);
        setMeetingLink("");
        onRefresh();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (booking: Booking) => {
    setActionLoading(booking.id);
    try {
      await fetch("/api/admin/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, status: "cancelled" }),
      });
      onRefresh();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gold" />
          <h3 className="font-serif text-base font-bold">Bokningar</h3>
          <Badge variant="secondary" className="text-[10px]">
            {bookings.length} totalt
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue placeholder="Alla statusar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla statusar</SelectItem>
              <SelectItem value="requested">Begärda</SelectItem>
              <SelectItem value="confirmed">Bekräftade</SelectItem>
              <SelectItem value="cancelled">Avbokade</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={cn("mr-1 h-3.5 w-3.5", loading && "animate-spin")} />
            Uppdatera
          </Button>
        </div>
      </div>

      <Separator className="my-3" />

      <ScrollArea className="-mx-1 px-1" style={{ height: "min(620px, 70vh)" }}>
        <div className="space-y-2">
          {loading && bookings.length === 0 && (
            <div className="flex items-center justify-center py-10 text-xs text-muted-foreground">
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Hämtar bokningar…
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <Calendar className="h-6 w-6 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">
                {filter === "all"
                  ? "Inga bokningar registrerade än."
                  : `Inga bokningar med status "${filter}".`}
              </p>
            </div>
          )}
          {filtered.map((b) => {
            const member = b.member;
            const statusColor =
              b.status === "confirmed"
                ? "border-bull/40 text-bull bg-bull/5"
                : b.status === "cancelled"
                  ? "border-bear/40 text-bear bg-bear/5"
                  : b.status === "completed"
                    ? "border-muted-foreground/30 text-muted-foreground"
                    : "border-gold/40 text-gold bg-gold/5";
            return (
              <div
                key={b.id}
                className="rounded-md border border-border bg-card p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {BOOKING_TYPE_LABELS[b.type] || b.type}
                      </Badge>
                      <Badge variant="outline" className={cn("text-[10px]", statusColor)}>
                        {b.status}
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-sm font-semibold">
                      {member ? member.name || member.email : "Okänd medlem"}
                    </p>
                    {member && (
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Mail className="h-2.5 w-2.5" /> {member.email}
                        {member.phone && (
                          <>
                            <span aria-hidden>·</span>
                            <span>{member.phone}</span>
                          </>
                        )}
                      </p>
                    )}
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Önskad tid: <span className="font-medium text-foreground">{formatDate(b.requestedTime)}</span>
                    </p>
                    {b.confirmedTime && (
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-bull">
                        <CheckCircle2 className="h-3 w-3" />
                        Bekräftad: <span className="font-medium">{formatDate(b.confirmedTime)}</span>
                      </p>
                    )}
                    {b.meetingLink && (
                      <a
                        href={b.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-[10px] text-gold hover:underline"
                      >
                        <ExternalLink className="h-2.5 w-2.5" /> Möteslänk
                      </a>
                    )}
                    {b.notes && (
                      <p className="mt-1 rounded bg-muted/40 p-1.5 text-[10px] text-muted-foreground">
                        {b.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5">
                    {b.status === "requested" && (
                      <>
                        <Button
                          size="sm"
                          className="h-7 bg-gold text-background hover:bg-gold/90"
                          onClick={() => {
                            setConfirmDialog(b);
                            setMeetingLink(b.meetingLink || "");
                          }}
                          disabled={actionLoading === b.id}
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Bekräfta
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-bear hover:bg-bear/5"
                          onClick={() => handleCancel(b)}
                          disabled={actionLoading === b.id}
                        >
                          <XCircle className="mr-1 h-3 w-3" /> Avboka
                        </Button>
                      </>
                    )}
                    {b.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-bear hover:bg-bear/5"
                        onClick={() => handleCancel(b)}
                        disabled={actionLoading === b.id}
                      >
                        <XCircle className="mr-1 h-3 w-3" /> Avboka
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Confirm dialog */}
      <Dialog
        open={!!confirmDialog}
        onOpenChange={(o) => {
          if (!o) {
            setConfirmDialog(null);
            setMeetingLink("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bekräfta bokning</DialogTitle>
            <DialogDescription>
              {confirmDialog && (
                <>
                  Bekräfta{" "}
                  <span className="font-medium text-foreground">
                    {BOOKING_TYPE_LABELS[confirmDialog.type] || confirmDialog.type}
                  </span>{" "}
                  för{" "}
                  <span className="font-medium text-foreground">
                    {confirmDialog.member?.name || confirmDialog.member?.email}
                  </span>
                  . Klienten får möteslänken via e-post.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="meeting-link" className="text-xs uppercase text-muted-foreground">
              Möteslänk (Zoom / Teams / Google Meet)
            </Label>
            <Input
              id="meeting-link"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://zoom.us/j/…"
              className="text-sm"
            />
            {confirmDialog?.requestedTime && (
              <p className="text-xs text-muted-foreground">
                Klienten önskar: <span className="font-medium text-foreground">
                  {formatDate(confirmDialog.requestedTime)}
                </span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDialog(null);
                setMeetingLink("");
              }}
            >
              Avbryt
            </Button>
            <Button
              className="bg-gold text-background hover:bg-gold/90"
              onClick={handleConfirm}
              disabled={actionLoading === confirmDialog?.id}
            >
              {actionLoading === confirmDialog?.id ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              )}
              Bekräfta bokning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────
 *  Small utility components
 * ──────────────────────────────────────────────────────────── */

function StatTile({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: "gold" | "bull";
}) {
  return (
    <Card
      className={cn(
        "p-2.5",
        accent === "gold" && "border-gold/30 bg-gold/[0.02]",
        accent === "bull" && "border-bull/30 bg-bull/[0.02]"
      )}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "mt-1 font-serif text-xl font-bold",
          accent === "gold" && "text-gold",
          accent === "bull" && "text-bull"
        )}
      >
        {value.toLocaleString("sv-SE")}
      </p>
    </Card>
  );
}

function MetaTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/20 px-2 py-1.5">
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 truncate text-xs font-semibold">{value}</p>
    </div>
  );
}
