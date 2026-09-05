"use client";

import * as React from "react";
import {
  Activity,
  Users,
  FolderKanban,
  Brain,
  AlertTriangle,
  Database,
  TrendingUp,
  Clock,
  RefreshCw,
  Eye,
  ChevronRight,
  Server,
  Zap,
  CheckCircle2,
  XCircle,
  Filter,
  Download,
} from "lucide-react";
import { useAk1aStore } from "@/lib/ak1a-store";
import { sparaAdminLosenord, rensaAdminLosenord, adminHeaders } from "@/lib/admin-klient";
import { Eyebrow, GoldRule, HonestyTag } from "@/components/ak1a/primitives";
import { VarumarkesLogo } from "@/components/ak1a/varumarkes-logo";
import { AdminAnalysisManager } from "@/components/ak1a/admin-analysis-manager";
import { MembersManager } from "@/components/ak1a/admin/members-manager";
import { TrafficStatsPanel } from "@/components/ak1a/admin/traffic-stats-panel";
import { TrafikSakerhetPanel } from "@/components/ak1a/admin/trafik-sakerhet-panel";
import { KonverteringsPanel } from "@/components/ak1a/admin/konverterings-panel";
import { CustomerEcosystem } from "@/components/ak1a/admin/customer-ecosystem";
import { EkosystemPanel } from "@/components/ak1a/admin/ekosystem-panel";
import { BeteendePanel } from "@/components/ak1a/admin/beteende-panel";
import { Utvecklingsradar } from "@/components/ak1a/admin/utvecklingsradar";
import { OversattningPanel } from "@/components/ak1a/admin/oversattning-panel";
import { AutonomOrganPanel } from "@/components/ak1a/autonom-organ-panel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ActivityLog {
  id: string;
  sessionId: string;
  action: string;
  section: string | null;
  targetType: string | null;
  targetId: string | null;
  metadata: string | null;
  userAgent: string | null;
  ipHash: string | null;
  createdAt: string;
}

interface SystemEventLog {
  id: string;
  type: string;
  severity: string;
  message: string;
  details: string | null;
  source: string | null;
  createdAt: string;
}

interface PortfolioLog {
  id: string;
  sessionId: string;
  name: string;
  description: string | null;
  totalValue: number;
  riskScore: number | null;
  holdings: { id: string; ticker: string; company: string; weight: number; akm1Total: number | null }[];
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totals: {
    activities: number;
    activities24h: number;
    activities7d: number;
    uniqueSessions24h: number;
    uniqueSessions7d: number;
    portfolios: number;
    analysisSessions: number;
    organConsultations: number;
    systemEvents: number;
    criticalEvents24h: number;
  };
  breakdowns: {
    byAction: { action: string; count: number }[];
    bySection: { section: string; count: number }[];
  };
  recent: {
    activities: ActivityLog[];
    events: SystemEventLog[];
    portfolios: PortfolioLog[];
  };
}

const ACTION_LABELS: Record<string, string> = {
  section_visit: "Sektion besök",
  course_open: "Kurs öppnad",
  course_complete: "Kurs slutförd",
  portfolio_create: "Portfölj skapad",
  portfolio_update: "Portfölj uppdaterad",
  analysis_run: "Analys körd",
  search: "Sökning",
  meeting_convened: "Styrelsemöte",
  organ_consulted: "Organ konsulterat",
};

const SEVERITY_COLORS: Record<string, string> = {
  info: "text-muted-foreground",
  warning: "text-yellow-600 dark:text-yellow-400",
  error: "text-orange-600 dark:text-orange-400",
  critical: "text-red-600 dark:text-red-400",
};

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const diff = Date.now() - t;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s sedan`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m sedan`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h sedan`;
  const day = Math.floor(hr / 24);
  return `${day}d sedan`;
}

export default function AdminDashboard() {
  const { setSection, setIsAdmin } = useAk1aStore();
  const [authed, setAuthed] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [activities, setActivities] = React.useState<ActivityLog[]>([]);
  const [actionFilter, setActionFilter] = React.useState<string>("all");
  const [sectionFilter, setSectionFilter] = React.useState<string>("all");
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("overview");
  const [loginError, setLoginError] = React.useState("");

  const forsokLoggaIn = async () => {
    setLoginError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthed(true);
        setIsAdmin(true);
        sparaAdminLosenord(password); // x-admin-password på skyddade admin-anrop
      } else {
        const data = await res.json().catch(() => ({ error: "Fel lösenord." }));
        setLoginError(data.error || "Fel lösenord.");
      }
    } catch {
      setLoginError("Nätverksfel — försök igen.");
    }
  };

  const fetchStats = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      // silent fail
    }
  }, []);

  const fetchActivities = React.useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (actionFilter !== "all") params.set("action", actionFilter);
      if (sectionFilter !== "all") params.set("section", sectionFilter);
      const res = await fetch(`/api/admin/activity?${params}`, { headers: adminHeaders() });
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (err) {
      // silent fail
    }
  }, [actionFilter, sectionFilter]);

  React.useEffect(() => {
    if (!authed) return;
    fetchStats();
    fetchActivities();
  }, [authed, fetchStats, fetchActivities]);

  React.useEffect(() => {
    if (!authed || !autoRefresh) return;
    const interval = setInterval(() => {
      fetchStats();
      if (activeTab === "activity") fetchActivities();
    }, 10000); // refresh var 10s
    return () => clearInterval(interval);
  }, [authed, autoRefresh, activeTab, fetchStats, fetchActivities]);

  if (!authed) {
    return (
      <div className="paper-texture flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-sm border-gold/30 p-6">
          <VarumarkesLogo storlek="md" onClick={() => setSection("hem")} />
          <div className="mt-6 flex items-center gap-2">
            <Server className="h-5 w-5 text-gold" />
            <h1 className="font-serif text-xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            AK1A Research Lab — administrativ översikt. Endast för behörig personal.
          </p>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Lösenord"
            className="mt-4"
            onKeyDown={async (e) => {
              if (e.key === "Enter" && password) {
                await forsokLoggaIn();
              }
            }}
          />
          <Button
            className="mt-3 w-full bg-gold text-background hover:bg-gold/90"
            onClick={forsokLoggaIn}
          >
            Logga in
          </Button>
          {loginError && (
            <p className="mt-2 text-center text-xs text-red-600">{loginError}</p>
          )}
          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
            Lösenord sätts via ADMIN_PASSWORD i Vercel-miljövariabler.
          </p>
          <Button variant="ghost" className="mt-2 w-full text-xs" onClick={() => setSection("hem")}>
            Tillbaka till startsidan
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="paper-texture min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <VarumarkesLogo storlek="md" onClick={() => setSection("hem")} />
          <div className="flex items-center gap-2">
            <Badge className="bg-gold text-background">ADMIN</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh((v) => !v)}
            >
              <RefreshCw className={cn("mr-1 h-3.5 w-3.5", autoRefresh && "animate-spin")} />
              {autoRefresh ? "Auto-uppdaterar" : "Pausad"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => { fetchStats(); fetchActivities(); }}>
              <RefreshCw className="mr-1 h-3.5 w-3.5" /> Uppdatera
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAuthed(false);
                setIsAdmin(false);
                rensaAdminLosenord();
                setPassword("");
                setSection("hem");
              }}
            >
              Logga ut
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <Eyebrow>AK1A Research Lab</Eyebrow>
          <h1 className="mt-2 font-serif text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Realtidsöversikt över klientaktivitet, portföljer, AI-organ-möten och systemhälsa.
            <HonestyTag kind="matt" className="ml-2" /> — all data är anonymiserad per session.
          </p>
        </div>

        <GoldRule className="my-6" />

        {/* KPI Cards */}
        {stats && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard
              icon={<Activity className="h-5 w-5 text-gold" />}
              label="Aktiviteter totalt"
              value={stats.totals.activities}
              sub={`${stats.totals.activities24h} senaste 24h`}
            />
            <KpiCard
              icon={<Users className="h-5 w-5 text-gold" />}
              label="Unika sessioner 24h"
              value={stats.totals.uniqueSessions24h}
              sub={`${stats.totals.uniqueSessions7d} senaste 7d`}
            />
            <KpiCard
              icon={<FolderKanban className="h-5 w-5 text-gold" />}
              label="Klientportföljer"
              value={stats.totals.portfolios}
              sub={`${stats.totals.analysisSessions} analyssessioner`}
            />
            <KpiCard
              icon={<Brain className="h-5 w-5 text-gold" />}
              label="AI-organ konsultationer"
              value={stats.totals.organConsultations}
              sub="Σ α Δ Ω Φ Θ Μ Ψ"
            />
            <KpiCard
              icon={<AlertTriangle className="h-5 w-5 text-gold" />}
              label="Kritiska events 24h"
              value={stats.totals.criticalEvents24h}
              sub={`${stats.totals.systemEvents} totalt events`}
              alert={stats.totals.criticalEvents24h > 0}
            />
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="inline-flex h-auto w-max flex-nowrap gap-1 rounded-lg bg-muted p-1">
            <TabsTrigger value="overview" className="px-3 py-1.5 text-xs sm:text-sm">Översikt</TabsTrigger>
            <TabsTrigger value="members" className="px-3 py-1.5 text-xs sm:text-sm">Medlemmar</TabsTrigger>
            <TabsTrigger value="kundekosystem" className="px-3 py-1.5 text-xs sm:text-sm">Kundekosystem</TabsTrigger>
            <TabsTrigger value="ekosystem" className="px-3 py-1.5 text-xs sm:text-sm">Ekosystem</TabsTrigger>
            <TabsTrigger value="activity" className="px-3 py-1.5 text-xs sm:text-sm">Aktivitetslogg</TabsTrigger>
            <TabsTrigger value="portfolios" className="px-3 py-1.5 text-xs sm:text-sm">Klientportföljer</TabsTrigger>
            <TabsTrigger value="analysis-upload" className="px-3 py-1.5 text-xs sm:text-sm">Analys-uppladdning</TabsTrigger>
            <TabsTrigger value="system" className="px-3 py-1.5 text-xs sm:text-sm">Systemevents</TabsTrigger>
            <TabsTrigger value="traffic" className="px-3 py-1.5 text-xs sm:text-sm">Statistik & SEO</TabsTrigger>
            <TabsTrigger value="trafik-sakerhet" className="px-3 py-1.5 text-xs sm:text-sm">Trafik &amp; Säkerhet 📡</TabsTrigger>
            <TabsTrigger value="konvertering" className="px-3 py-1.5 text-xs sm:text-sm">Konvertering 📊</TabsTrigger>
            <TabsTrigger value="beteende" className="px-3 py-1.5 text-xs sm:text-sm">Beteende</TabsTrigger>
            <TabsTrigger value="ai-organ" className="px-3 py-1.5 text-xs sm:text-sm">AI-organ styrelse</TabsTrigger>
            <TabsTrigger value="utveckling" className="px-3 py-1.5 text-xs sm:text-sm">Utveckling 🔭</TabsTrigger>
            <TabsTrigger value="oversattning" className="px-3 py-1.5 text-xs sm:text-sm">Översättning 🌍</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-gold" />
                    <h3 className="font-serif text-lg font-bold">Senaste aktivitet</h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("activity")}>
                    Visa alla <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
                <ScrollArea className="mt-3 h-[300px]">
                  <div className="space-y-2">
                    {stats?.recent.activities.map((a) => (
                      <ActivityRow key={a.id} activity={a} compact />
                    ))}
                    {stats?.recent.activities.length === 0 && (
                      <p className="py-8 text-center text-sm text-muted-foreground">Inga aktiviteter än.</p>
                    )}
                  </div>
                </ScrollArea>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-gold" />
                    <h3 className="font-serif text-lg font-bold">Systemevents</h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("system")}>
                    Visa alla <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
                <ScrollArea className="mt-3 h-[300px]">
                  <div className="space-y-2">
                    {stats?.recent.events.map((e) => (
                      <div key={e.id} className="rounded-md border border-border bg-card p-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className={cn("font-semibold uppercase", SEVERITY_COLORS[e.severity])}>
                            {e.severity}
                          </span>
                          <span className="text-muted-foreground">{timeAgo(e.createdAt)}</span>
                        </div>
                        <p className="mt-1 font-medium">{e.message}</p>
                        {e.source && (
                          <p className="mt-0.5 text-muted-foreground">källa: {e.source}</p>
                        )}
                      </div>
                    ))}
                    {stats?.recent.events.length === 0 && (
                      <p className="py-8 text-center text-sm text-muted-foreground">Inga systemevents.</p>
                    )}
                  </div>
                </ScrollArea>
              </Card>
            </div>

            {/* Mest populära sektioner */}
            {stats && (
              <Card className="p-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gold" />
                  <h3 className="font-serif text-lg font-bold">Mest besökta sektioner</h3>
                </div>
                <div className="mt-3 space-y-2">
                  {stats.breakdowns.bySection.slice(0, 8).map((s) => {
                    const max = stats.breakdowns.bySection[0]?.count || 1;
                    return (
                      <div key={s.section} className="flex items-center gap-3">
                        <span className="w-24 text-xs font-medium uppercase text-muted-foreground">
                          {s.section || "okänd"}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-gold"
                            style={{ width: `${(s.count / max) * 100}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-xs font-semibold">{s.count}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Activity Log */}
          <TabsContent value="members" className="mt-6">
            <Card className="p-5">
              <MembersManager />
            </Card>
          </TabsContent>

          <TabsContent value="kundekosystem" className="mt-6">
            <Card className="p-5">
              <CustomerEcosystem />
            </Card>
          </TabsContent>

          <TabsContent value="ekosystem" className="mt-6">
            <Card className="p-5">
              <EkosystemPanel />
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-serif text-lg font-bold">Aktivitetslogg</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="h-8 w-40 text-xs">
                      <SelectValue placeholder="Alla actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alla actions</SelectItem>
                      {Object.entries(ACTION_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sectionFilter} onValueChange={setSectionFilter}>
                    <SelectTrigger className="h-8 w-40 text-xs">
                      <SelectValue placeholder="Alla sektioner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alla sektioner</SelectItem>
                      <SelectItem value="hem">Hem</SelectItem>
                      <SelectItem value="kurser">Kurser</SelectItem>
                      <SelectItem value="labb">Labbet</SelectItem>
                      <SelectItem value="styrelse">Styrelse</SelectItem>
                      <SelectItem value="analyser">Analyser</SelectItem>
                      <SelectItem value="aktier">Aktier</SelectItem>
                      <SelectItem value="utbildning">Utbildning</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={fetchActivities}>
                    <RefreshCw className="mr-1 h-3 w-3" /> Ladda om
                  </Button>
                </div>
              </div>

              <ScrollArea className="mt-4 h-[500px]">
                <div className="space-y-1.5">
                  {activities.map((a) => (
                    <ActivityRow key={a.id} activity={a} />
                  ))}
                  {activities.length === 0 && (
                    <p className="py-12 text-center text-sm text-muted-foreground">
                      Inga aktiviteter matchar filtren.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Portfolios */}
          <TabsContent value="portfolios" className="mt-6">
            <Card className="p-5">
              <h3 className="font-serif text-lg font-bold">Klientportföljer</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Fiktiva portföljer byggda av klienter i Labbet. Varje portfölj innehåller AKM1-analys,
                teknisk analys och Elliott Wave-position per innehav.
              </p>
              <ScrollArea className="mt-4 h-[500px]">
                <div className="space-y-3">
                  {stats?.recent.portfolios.map((p) => (
                    <div key={p.id} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-serif font-bold">{p.name}</h4>
                          {p.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{p.description}</p>
                          )}
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            session: {(p.sessionId || "—").toString().slice(0, 16)} · {timeAgo(p.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          {p.riskScore !== null && (
                            <Badge variant="outline" className="border-gold/40 text-gold">
                              AKM1: {p.riskScore.toFixed(1)}
                            </Badge>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {p.holdings.length} innehav
                          </p>
                        </div>
                      </div>
                      {p.holdings.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {p.holdings.map((h) => (
                            <Badge key={h.id} variant="secondary" className="text-[10px]">
                              {h.ticker} ({h.weight.toFixed(1)}%)
                              {h.akm1Total !== null && ` · ${h.akm1Total}/100`}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {stats?.recent.portfolios.length === 0 && (
                    <p className="py-12 text-center text-sm text-muted-foreground">
                      Inga portföljer skapade än. Klienter kan bygga portföljer i Labbet → Portfölj-tab.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Analysis Upload */}
          <TabsContent value="analysis-upload" className="mt-6">
            <AdminAnalysisManager />
          </TabsContent>

          {/* System Events */}
          <TabsContent value="system" className="mt-6">
            <Card className="p-5">
              <h3 className="font-serif text-lg font-bold">Systemevents</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Tekniska händelser: API-fel, rate-limits, generation-körningar, watchdog-events.
              </p>
              <ScrollArea className="mt-4 h-[500px]">
                <div className="space-y-2">
                  {stats?.recent.events.map((e) => (
                    <div key={e.id} className="rounded-md border border-border bg-card p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {e.severity === "critical" || e.severity === "error" ? (
                            <XCircle className={cn("h-4 w-4", SEVERITY_COLORS[e.severity])} />
                          ) : (
                            <CheckCircle2 className={cn("h-4 w-4", SEVERITY_COLORS[e.severity])} />
                          )}
                          <span className={cn("font-semibold uppercase", SEVERITY_COLORS[e.severity])}>
                            {e.severity}
                          </span>
                          <Badge variant="outline" className="text-[10px]">{e.type}</Badge>
                        </div>
                        <span className="text-muted-foreground">{timeAgo(e.createdAt)}</span>
                      </div>
                      <p className="mt-1.5 font-medium">{e.message}</p>
                      {e.source && (
                        <p className="mt-0.5 text-muted-foreground">källa: {e.source}</p>
                      )}
                      {e.details && (
                        <pre className="mt-1 max-h-24 overflow-auto rounded bg-muted p-1.5 text-[10px]">
                          {e.details}
                        </pre>
                      )}
                    </div>
                  ))}
                  {stats?.recent.events.length === 0 && (
                    <p className="py-12 text-center text-sm text-muted-foreground">
                      Inga systemevents loggade.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Breakdown */}
          <TabsContent value="traffic" className="mt-6">
            <Card className="p-5">
              <TrafficStatsPanel />
            </Card>
          </TabsContent>

          {/* Trafik & Säkerhet — kundens live-fönster (egen mätning + dna-blockering) */}
          <TabsContent value="trafik-sakerhet" className="mt-6">
            <Card className="p-5">
              <TrafikSakerhetPanel />
            </Card>
          </TabsContent>

          {/* Konvertering 📊 — tratten i sex steg ur befintliga källor (MARKNADS-BESLUT VÅG 1b) */}
          <TabsContent value="konvertering" className="mt-6">
            <Card className="p-5">
              <KonverteringsPanel />
            </Card>
          </TabsContent>

          {/* Beteendeanalys — aggregerade elevmönster */}
          <TabsContent value="beteende" className="mt-6">
            <BeteendePanel />
          </TabsContent>

          <TabsContent value="breakdown" className="mt-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="p-5">
                <h3 className="font-serif text-lg font-bold">Aktivitet per action-typ</h3>
                <div className="mt-3 space-y-2">
                  {stats?.breakdowns.byAction.map((a) => {
                    const max = stats.breakdowns.byAction[0]?.count || 1;
                    return (
                      <div key={a.action} className="flex items-center gap-3">
                        <span className="w-32 text-xs font-medium">
                          {ACTION_LABELS[a.action] || a.action}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-gold"
                            style={{ width: `${(a.count / max) * 100}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-xs font-semibold">{a.count}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="font-serif text-lg font-bold">Aktivitet per sektion</h3>
                <div className="mt-3 space-y-2">
                  {stats?.breakdowns.bySection.map((s) => {
                    const max = stats.breakdowns.bySection[0]?.count || 1;
                    return (
                      <div key={s.section} className="flex items-center gap-3">
                        <span className="w-24 text-xs font-medium uppercase text-muted-foreground">
                          {s.section || "okänd"}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-gold"
                            style={{ width: `${(s.count / max) * 100}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-xs font-semibold">{s.count}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* AI-organ styrelse — admin only */}
          <TabsContent value="ai-organ" className="mt-6">
            <Card className="p-5 mb-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-gold" />
                <h3 className="font-serif text-lg font-bold">AI-organ styrelse (backend)</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                8 AI-organ (Σ α Δ Ω Φ Θ Μ Ψ) tar beslut om strategi, analys, data, vision,
                innovation, kvalitet, marknad och utbildning. Denna sektion är endast för admin —
                inte synlig för vanliga besökare.
              </p>
            </Card>

            {/* Autonomt system — AI-organen bygger vidare kontinuerligt */}
            <AutonomOrganPanel />
          </TabsContent>

          {/* Utvecklingsradarn — allt kundägaren behöver för att följa utvecklingen */}
          <TabsContent value="utveckling" className="mt-6">
            <Card className="p-5">
              <Utvecklingsradar />
            </Card>
          </TabsContent>

          {/* Översättning 🌍 — MÖS granskningsbänk (människokontroll inbyggd) */}
          <TabsContent value="oversattning" className="mt-6">
            <Card className="p-5">
              <OversattningPanel />
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setSection("hem")}>
            Till huvudsidan
          </Button>
          <Button variant="outline" onClick={() => setSection("labb")}>
            Öppna Labbet
          </Button>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  alert,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub: string;
  alert?: boolean;
}) {
  return (
    <Card className={cn("p-4", alert && "border-red-500/40 bg-red-500/[0.03]")}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className={cn("mt-2 font-serif text-3xl font-bold", alert && "text-red-600 dark:text-red-400")}>
        {value.toLocaleString("sv-SE")}
      </p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>
    </Card>
  );
}

function ActivityRow({ activity, compact }: { activity: ActivityLog; compact?: boolean }) {
  return (
    <div className={cn(
      "rounded-md border border-border bg-card",
      compact ? "p-2 text-[11px]" : "p-2.5 text-xs"
    )}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            {ACTION_LABELS[activity.action] || activity.action}
          </Badge>
          {activity.section && (
            <span className="shrink-0 text-muted-foreground">/{activity.section}</span>
          )}
          {activity.targetId && (
            <span className="truncate font-mono text-[10px] text-muted-foreground">
              {activity.targetId}
            </span>
          )}
        </div>
        <span className="shrink-0 text-[10px] text-muted-foreground">
          {timeAgo(activity.createdAt)}
        </span>
      </div>
      {!compact && (
        <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span>session: {(activity.sessionId || "—").toString().slice(0, 12)}...</span>
          {activity.metadata && (
            <span className="truncate font-mono">{activity.metadata.slice(0, 80)}</span>
          )}
        </div>
      )}
    </div>
  );
}
