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
import {
  sparaAdminLosenord,
  adminHeaders,
  loggaIn,
  loggaUt,
  lasRoll,
  type AdminRoll,
} from "@/lib/admin-klient";
import { Eyebrow, GoldRule, HonestyTag } from "@/components/ak1a/primitives";
import { VarumarkesLogo } from "@/components/ak1a/varumarkes-logo";
import { AdminAnalysisManager } from "@/components/ak1a/admin-analysis-manager";
import { MembersManager } from "@/components/ak1a/admin/members-manager";
import { MedlemmarPanel } from "@/components/ak1a/admin/medlemmar-panel";
import { TrafficStatsPanel } from "@/components/ak1a/admin/traffic-stats-panel";
import { TrafikSakerhetPanel } from "@/components/ak1a/admin/trafik-sakerhet-panel";
import { KonverteringsPanel } from "@/components/ak1a/admin/konverterings-panel";
import { CustomerEcosystem } from "@/components/ak1a/admin/customer-ecosystem";
import { EkosystemPanel } from "@/components/ak1a/admin/ekosystem-panel";
import { BeteendePanel } from "@/components/ak1a/admin/beteende-panel";
import { Utvecklingsradar } from "@/components/ak1a/admin/utvecklingsradar";
import { UtvecklingPanel } from "@/components/ak1a/admin/utveckling-panel";
import { OversattningPanel } from "@/components/ak1a/admin/oversattning-panel";
import { VariabelPanel } from "@/components/ak1a/admin/variabel-panel";
import { BloggPanel } from "@/components/ak1a/admin/blogg-panel";
import { MediaPanel } from "@/components/ak1a/admin/media-panel";
import { KursPanel } from "@/components/ak1a/admin/kurs-panel";
import { OrganPanel } from "@/components/ak1a/admin/organ-panel";
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

/**
 * VÅG 83 §A2 — flikkarta + rolltillåtelse i panelen. Redaktören ser ENDAST
 * Blogg/Media/Kurser (termbanken är INTE en egen flik — den lever inuti
 * Översättning-panelen och förblir admin-endast här). Alla andra flikar är
 * admin-endast och döljs för redaktören. Lösenordsläget (ADMIN_PASSWORD,
 * ingen session) = roll "admin" = nuvarande beteende med alla flikar.
 */
const ALLA_FLIKAR: { id: string; etikett: string; endastAdmin?: boolean }[] = [
  { id: "overview", etikett: "Översikt", endastAdmin: true },
  /**
   * VÅG 88 (FAS L3, STYRELSE-V86-L3 §A): gamla "Medlemmar"-fliken byter
   * etikett till "Leads 🧲" (members-manager.tsx läser leads ur members-
   * tabellen — panel+route orörd) och NY flik "Medlemmar 👥" (auth-medlemmar)
   * visar AUTH-användare via medlemmar-panel.tsx. Två flikar med namnet
   * "Medlemmar" förbjuds (kontraktets beslut).
   */
  { id: "members", etikett: "Leads 🧲", endastAdmin: true },
  { id: "auth-medlemmar", etikett: "Medlemmar 👥", endastAdmin: true },
  { id: "kundekosystem", etikett: "Kundekosystem", endastAdmin: true },
  { id: "ekosystem", etikett: "Ekosystem", endastAdmin: true },
  { id: "activity", etikett: "Aktivitetslogg", endastAdmin: true },
  { id: "portfolios", etikett: "Klientportföljer", endastAdmin: true },
  { id: "analysis-upload", etikett: "Analys-uppladdning", endastAdmin: true },
  { id: "system", etikett: "Systemevents", endastAdmin: true },
  { id: "traffic", etikett: "Statistik & SEO", endastAdmin: true },
  { id: "trafik-sakerhet", etikett: "Trafik & Säkerhet 📡", endastAdmin: true },
  { id: "konvertering", etikett: "Konvertering 📊", endastAdmin: true },
  { id: "beteende", etikett: "Beteende", endastAdmin: true },
  { id: "ai-organ", etikett: "AI-organ styrelse", endastAdmin: true },
  { id: "utveckling", etikett: "Utveckling 🔭", endastAdmin: true },
  /**
   * VÅG 80c (STYRELSE-ADMIN-MEGA tillägget, kunddirektiv "följa utvecklingen
   * från telefonen"): worklog-sektioner + senaste systemhändelser + statuskort —
   * mobil-först. Radarn (🔭) ovan består; denna flik är kundens live-fönster.
   */
  { id: "utveckling-live", etikett: "Utveckling 📡", endastAdmin: true },
  { id: "oversattning", etikett: "Översättning 🌍", endastAdmin: true },
  { id: "variabler", etikett: "Variabler 📊", endastAdmin: true },
  { id: "blogg", etikett: "Blogg ✍️" },
  { id: "media", etikett: "Media 🖼️" },
  { id: "kurser", etikett: "Kurser 🎓" },
  /** VÅG 110: organismsystemets kontrollrum — registret + 24/7-pumparna. */
  { id: "organen", etikett: "Organismen 🧬", endastAdmin: true },
];

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
  /** VÅG 83 §A2: roll efter session-inloggning (null = lösenordsläge/admin). */
  const [roll, setRoll] = React.useState<AdminRoll | null>(null);
  /** Ärlig 503-info: sessionsvägen av — lösenordsfältet gäller som tidigare. */
  const [sessionHint, setSessionHint] = React.useState("");

  const arRedaktor = roll === "redaktor";

  // Senaste roll från sessionStorage (tyst på servern/nysida).
  React.useEffect(() => {
    setRoll(lasRoll());
  }, []);

  const forsokLoggaIn = async () => {
    if (!password) return;
    setLoginError("");
    // 1) Session-inloggning (våg 83 §A): cookie ak1a_admin + {roll} om
    //    SESSION_SECRET finns — då skickas lösenordet aldrig vidare.
    const svar = await loggaIn(password);
    if (svar.roll) {
      setRoll(svar.roll);
      setAuthed(true);
      setIsAdmin(true);
      return;
    }
    if (svar.fel?.includes("SESSION_SECRET")) {
      setSessionHint(
        "Sessioner kräver SESSION_SECRET — skicka lösenord i fältet som tidigare.",
      );
    }
    // 2) Fall-back: befintlig ADMIN_PASSWORD-väg (POST /api/admin/auth) —
    //    fungerar oförändrat när sessionsvägen är av (503) eller ruten saknas.
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setRoll(null); // lösenordsläge = admin-beteende som tidigare (alla flikar)
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

  // Redaktören nekas aktivitet/statistik (våg 83 §A) — hämtas endast för admin.
  React.useEffect(() => {
    if (!authed || arRedaktor) return;
    fetchStats();
    fetchActivities();
  }, [authed, arRedaktor, fetchStats, fetchActivities]);

  React.useEffect(() => {
    if (!authed || arRedaktor || !autoRefresh) return;
    const interval = setInterval(() => {
      fetchStats();
      if (activeTab === "activity") fetchActivities();
    }, 10000); // refresh var 10s
    return () => clearInterval(interval);
  }, [authed, arRedaktor, autoRefresh, activeTab, fetchStats, fetchActivities]);

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
          {sessionHint && (
            <p className="mt-2 text-center text-[11px] leading-relaxed text-yellow-700 dark:text-yellow-400">
              {sessionHint}
            </p>
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
        {/* Header — våg 104: mobilförst (wrappar logo + knapprad på smala skärmar) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <VarumarkesLogo storlek="md" onClick={() => setSection("hem")} />
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            {/* Roll-chip (våg 83 §A2): Redaktör efter session-inloggning,
                ADMIN annars (lösenordsläget motsvarar admin). */}
            {arRedaktor ? (
              <Badge variant="outline" className="border-gold/40 text-gold">REDAKTÖR</Badge>
            ) : (
              <Badge className="bg-gold text-background">ADMIN</Badge>
            )}
            {!arRedaktor && (
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px] flex-1 justify-center sm:flex-none"
                onClick={() => setAutoRefresh((v) => !v)}
              >
                <RefreshCw className={cn("mr-1 h-3.5 w-3.5", autoRefresh && "animate-spin")} />
                <span className="hidden sm:inline">{autoRefresh ? "Auto-uppdaterar" : "Pausad"}</span>
                <span className="sm:hidden">{autoRefresh ? "Auto" : "Paus"}</span>
              </Button>
            )}
            {!arRedaktor && (
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px] flex-1 justify-center sm:flex-none"
                onClick={() => { fetchStats(); fetchActivities(); }}
              >
                <RefreshCw className="mr-1 h-3.5 w-3.5" /> Uppdatera
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px] flex-1 justify-center sm:flex-none"
              onClick={async () => {
                await loggaUt(); // POST /api/admin/logout + rensar lösenord/roll lokalt
                setAuthed(false);
                setIsAdmin(false);
                setRoll(null);
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
          <h1 className="mt-2 font-serif text-3xl font-bold">
            {arRedaktor ? "Redaktörsyta" : "Admin Dashboard"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {arRedaktor ? (
              <>Blogg, kurser och media — publicera och håll innehållet aktuellt.</>
            ) : (
              <>
                Realtidsöversikt över klientaktivitet, portföljer, AI-organ-möten och systemhälsa.
                <HonestyTag kind="matt" className="ml-2" /> — all data är anonymiserad per session.
              </>
            )}
          </p>
        </div>

        <GoldRule className="my-6" />

        {/* KPI Cards — admin only (redaktören nekas aktivitetsdata, våg 83 §A) */}
        {stats && !arRedaktor && (
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

        {/* Tabs — redaktören ser endast Blogg/Media/Kurser (våg 83 §A2);
            utan flik-matchning (t.ex. kvarvarande "overview" efter
            rollbyte) landar redaktören på Blogg. */}
        <Tabs
          value={arRedaktor && !ALLA_FLIKAR.some((f) => !f.endastAdmin && f.id === activeTab) ? "blogg" : activeTab}
          onValueChange={setActiveTab}
          className="mt-8"
        >
          {/* VÅG 104: flikraden scrollas horisontellt på mobil (21 flikar ≈
              2000 px får ALDRIG breda ut sidan); tryckytor ≥44 px, etiketter
              bryts ej (whitespace-nowrap + shrink-0) — skrivbordet oförändrat. */}
          <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:thin] sm:mx-0 sm:px-0">
            <TabsList className="inline-flex h-auto w-max flex-nowrap gap-1 rounded-lg bg-muted p-1">
              {ALLA_FLIKAR.filter((f) => !arRedaktor || !f.endastAdmin).map((f) => (
                <TabsTrigger
                  key={f.id}
                  value={f.id}
                  className="min-h-[44px] shrink-0 whitespace-nowrap px-3 py-2 text-xs sm:min-h-0 sm:py-1.5 sm:text-sm"
                >
                  {f.etikett}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

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

          {/* Leads 🧲 (våg 88: gamla "Medlemmar"-fliken — members-tabellen/leads, orörd) */}
          <TabsContent value="members" className="mt-6">
            <Card className="p-5">
              <MembersManager />
            </Card>
          </TabsContent>

          {/* Medlemmar 👥 — FAS L3 (våg 88 §A): AUTH-användare + members-profiler.
              Panelen mountas först när fliken öppnas → GET sker lazy (media-mönstret). */}
          <TabsContent value="auth-medlemmar" className="mt-6">
            <Card className="p-5">
              <MedlemmarPanel />
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

          {/* Utveckling 📡 (våg 80c) — kundens mobil-först live-fönster:
              worklog-accordion + senaste händelser + statuskort.
              Panelen mountas först när fliken öppnas → GET sker lazy. */}
          <TabsContent value="utveckling-live" className="mt-6">
            <Card className="p-5">
              <UtvecklingPanel />
            </Card>
          </TabsContent>

          {/* Översättning 🌍 — MÖS granskningsbänk (människokontroll inbyggd) */}
          <TabsContent value="oversattning" className="mt-6">
            <Card className="p-5">
              <OversattningPanel />
            </Card>
          </TabsContent>

          {/* Variabler 📊 — admin-mega steg 1: guldkällan redigerbar utan deploy */}
          <TabsContent value="variabler" className="mt-6">
            <Card className="p-5">
              <VariabelPanel />
            </Card>
          </TabsContent>

          {/* Blogg ✍️ — admin-mega steg 2: utkastflöde + paketexport (Läge A, våg 80b del B) */}
          <TabsContent value="blogg" className="mt-6">
            <Card className="p-5">
              <BloggPanel />
            </Card>
          </TabsContent>

          {/* Media 🖼️ — admin-mega steg 3: bildbibliotek i Supabase Storage (våg 81 §A4).
              Panelen mountas först när fliken öppnas → GET sker lazy, inte vid sidladdning. */}
          <TabsContent value="media" className="mt-6">
            <Card className="p-5">
              <MediaPanel />
            </Card>
          </TabsContent>

          {/* Kurser 🎓 — admin-mega steg 4: kursmetadata live utan deploy (våg 82 §A3).
              Panelen mountas först när fliken öppnas → GET sker lazy, inte vid sidladdning. */}
          <TabsContent value="kurser" className="mt-6">
            <Card className="p-5">
              <KursPanel />
            </Card>
          </TabsContent>

          {/* Organismen 🧬 (våg 110) — organsystemets kontrollrum: registret
              (fitness = landade commits, födslar/dödsfall) + 24/7-pumparnas
              live-loggar. Kundens direktiv: systemet i admin, autonomt. */}
          <TabsContent value="organen" className="mt-6">
            <Card className="p-5">
              <OrganPanel />
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
            // Våg s8-u3: shrink-0 här sprängde 390px-vyn när section är en
            // lång sökväg (blogg/<slug>, 274px+) — flex-item som vägrar
            // krympa skapade horisontell överflöd på alla admin-flikar.
            <span className="min-w-0 truncate text-muted-foreground">/{activity.section}</span>
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
