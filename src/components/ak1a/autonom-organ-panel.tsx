"use client";

import * as React from "react";
import {
  Brain,
  Zap,
  RefreshCw,
  TrendingUp,
  Users,
  Eye,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  Target,
  Lightbulb,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AutonomProposal {
  eventId: string;
  createdAt: string;
  focus: string;
  organ: string;
  proposals: Array<{
    title: string;
    page: string;
    currentText: string;
    proposedText: string;
    rationale: string;
    successMetric: string;
    priority: string;
  }>;
  dataSnapshot: {
    totalSessions: number;
    totalActivities: number;
    topSections: Array<[string, number]>;
    actionCounts: Record<string, number>;
  };
}

interface Campaign {
  eventId: string;
  createdAt: string;
  campaign: string;
  channel: string;
  audience: string;
  campaignData: {
    campaignText: string;
    subject: string;
    body: string;
    cta: string;
    rationale: string;
    framework: string;
    successMetric: string;
    organConfidence: string;
    tonality: string;
  };
}

interface Rewrite {
  eventId: string;
  createdAt: string;
  page: string;
  target: string;
  changesMade: string[];
  rationale: string;
  successMetric: string;
}

const ORGAN_NAMES: Record<string, string> = {
  "Σ": "Strategi",
  "α": "Analys",
  "Δ": "Data",
  "Ω": "Vision",
  "Φ": "Innovation",
  "Θ": "Kvalitet",
  "Μ": "Marknads",
  "Ψ": "Utbildning",
};

const PRIORITY_STYLES: Record<string, string> = {
  KRITISK: "border-bear/40 text-bear bg-bear/[0.06]",
  HÖG: "border-gold/40 text-gold bg-gold/[0.06]",
  MEDEL: "border-border text-muted-foreground bg-muted/20",
};

export function AutonomOrganPanel() {
  const [tab, setTab] = React.useState<"proposals" | "campaigns" | "rewrites">("proposals");
  const [proposals, setProposals] = React.useState<AutonomProposal[]>([]);
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [rewrites, setRewrites] = React.useState<Rewrite[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const [runResult, setRunResult] = React.useState<string | null>(null);

  const fetchAll = React.useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes, rRes] = await Promise.all([
        fetch("/api/styrelse/autonom", { cache: "no-store" }),
        fetch("/api/styrelse/marknadsforing", { cache: "no-store" }),
        fetch("/api/styrelse/kommunikation", { cache: "no-store" }),
      ]);
      const pData = await pRes.json();
      const cData = await cRes.json();
      const rData = await rRes.json();
      setProposals(pData.proposals || []);
      setCampaigns(cData.campaigns || []);
      setRewrites(rData.rewrites || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const runAutonom = async (focus: string) => {
    setRunning(true);
    setRunResult(null);
    try {
      const res = await fetch("/api/styrelse/autonom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focus }),
      });
      const data = await res.json();
      setRunResult(
        `✓ ${data.proposal?.organ || "?"} föreslog ${data.proposal?.proposals?.length || 0} förbättringar (sessions: ${data.dataSnapshot?.totalSessions || 0})`
      );
      fetchAll();
    } catch (e: any) {
      setRunResult(`✗ Fel: ${e.message}`);
    } finally {
      setRunning(false);
    }
  };

  const runCampaign = async (campaign: string, channel: string) => {
    setRunning(true);
    setRunResult(null);
    try {
      const res = await fetch("/api/styrelse/marknadsforing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign, channel, audience: "diy-sparare" }),
      });
      const data = await res.json();
      setRunResult(`✓ Kampanj skapad — ${data.framework} (confidence: ${data.organConfidence})`);
      fetchAll();
    } catch (e: any) {
      setRunResult(`✗ Fel: ${e.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header med status */}
      <Card className="border-gold/30 bg-gradient-to-br from-gold/[0.04] to-transparent p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-gold" />
            <h3 className="font-serif text-lg font-bold">AI-organ autonomt system</h3>
            <Badge variant="outline" className="border-gold/40 text-gold text-[9px] uppercase">
              Backend
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAll}
            disabled={loading}
          >
            <RefreshCw className={cn("mr-1 h-3.5 w-3.5", loading && "animate-spin")} />
            Uppdatera
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          8 AI-organ (Σ α Δ Ω Φ Θ Μ Ψ) arbetar autonomt för att förbättra kundupplevelsen.
          Loopen körs var 6:e timme och analyserar kundaktivitet, föreslår förbättringar,
          skapar kampanjer och omskriver text — allt spårbart (MÄTT).
        </p>

        {/* Kör autonomt */}
        <div className="mt-4 border-t border-border pt-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Kör autonomt (manuellt)
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => runAutonom("kundupplevelse")}
              disabled={running}
            >
              {running ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Sparkles className="mr-1 h-3 w-3" />}
              Kundupplevelse
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => runAutonom("branding")}
              disabled={running}
            >
              {running ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Target className="mr-1 h-3 w-3" />}
              Branding
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => runAutonom("marketing")}
              disabled={running}
            >
              {running ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <TrendingUp className="mr-1 h-3 w-3" />}
              Marketing
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => runAutonom("innehåll")}
              disabled={running}
            >
              {running ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Lightbulb className="mr-1 h-3 w-3" />}
              Innehåll
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => runCampaign("branding", "hero")}
              disabled={running}
            >
              <Mail className="mr-1 h-3 w-3" />
              Skapa hero-kampanj
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => runCampaign("conversion", "email")}
              disabled={running}
            >
              <Mail className="mr-1 h-3 w-3" />
              Skapa email-kampanj
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => runCampaign("launch", "social")}
              disabled={running}
            >
              <Mail className="mr-1 h-3 w-3" />
              Skapa social-kampanj
            </Button>
          </div>
          {runResult && (
            <div className="mt-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs">
              {runResult}
            </div>
          )}
        </div>
      </Card>

      {/* Tab-switcher */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={tab === "proposals" ? "default" : "outline"}
          onClick={() => setTab("proposals")}
          className={tab === "proposals" ? "bg-gold text-background" : ""}
        >
          Autonoma förslag ({proposals.length})
        </Button>
        <Button
          size="sm"
          variant={tab === "campaigns" ? "default" : "outline"}
          onClick={() => setTab("campaigns")}
          className={tab === "campaigns" ? "bg-gold text-background" : ""}
        >
          Kampanjer ({campaigns.length})
        </Button>
        <Button
          size="sm"
          variant={tab === "rewrites" ? "default" : "outline"}
          onClick={() => setTab("rewrites")}
          className={tab === "rewrites" ? "bg-gold text-background" : ""}
        >
          Omskrivningar ({rewrites.length})
        </Button>
      </div>

      {/* Innehåll */}
      {tab === "proposals" && (
        <ScrollArea className="h-[600px] rounded-md border border-border p-4">
          {proposals.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Inga autonoma förslag än. Kör loopen manuellt ovan.
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((p) => (
                <ProposalCard key={p.eventId} proposal={p} />
              ))}
            </div>
          )}
        </ScrollArea>
      )}

      {tab === "campaigns" && (
        <ScrollArea className="h-[600px] rounded-md border border-border p-4">
          {campaigns.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Inga kampanjer än. Skapa en kampanj ovan.
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((c) => (
                <CampaignCard key={c.eventId} campaign={c} />
              ))}
            </div>
          )}
        </ScrollArea>
      )}

      {tab === "rewrites" && (
        <ScrollArea className="h-[600px] rounded-md border border-border p-4">
          {rewrites.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Inga omskrivningar än.
            </div>
          ) : (
            <div className="space-y-4">
              {rewrites.map((r) => (
                <RewriteCard key={r.eventId} rewrite={r} />
              ))}
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
}

function ProposalCard({ proposal }: { proposal: AutonomProposal }) {
  const organName = ORGAN_NAMES[proposal.organ] || proposal.organ;
  return (
    <Card className="border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.06] font-serif text-sm font-bold text-gold">
            {proposal.organ}
          </span>
          <div>
            <div className="font-serif text-sm font-bold">{organName}-organet</div>
            <div className="text-[10px] text-muted-foreground">
              {new Date(proposal.createdAt).toLocaleString("sv-SE")} · fokus: {proposal.focus}
            </div>
          </div>
        </div>
        <Badge variant="outline" className="border-border text-[9px] uppercase">
          {proposal.dataSnapshot?.totalSessions || 0} sessioner
        </Badge>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-md border border-border bg-muted/20 p-2">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Aktiviteter</div>
          <div className="font-mono font-bold">{proposal.dataSnapshot?.totalActivities || 0}</div>
        </div>
        <div className="rounded-md border border-border bg-muted/20 p-2 col-span-2">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Topp sektioner</div>
          <div className="font-mono text-[10px]">
            {(proposal.dataSnapshot?.topSections || []).map(([s, c]) => `${s} (${c})`).join(", ")}
          </div>
        </div>
      </div>

      <Separator className="my-3 bg-border" />

      <div className="space-y-2">
        {proposal.proposals.map((p, i) => (
          <div key={i} className="rounded-md border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm font-bold text-gold/60">{i + 1}</span>
                <span className="text-sm font-semibold">{p.title}</span>
              </div>
              <Badge
                variant="outline"
                className={cn("text-[9px] uppercase", PRIORITY_STYLES[p.priority] || PRIORITY_STYLES.MEDEL)}
              >
                {p.priority}
              </Badge>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Nuvarande</div>
                <p className="text-xs italic text-muted-foreground line-clamp-2">{p.currentText}</p>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-gold">Föreslaget</div>
                <p className="text-xs font-medium line-clamp-2">{p.proposedText}</p>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground">
              <strong>Sida:</strong> {p.page} · <strong>Mått:</strong> {p.successMetric}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{p.rationale}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const d = campaign.campaignData;
  if (!d) return null;
  return (
    <Card className="border-border p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-serif text-sm font-bold">
            {campaign.campaign} · {campaign.channel}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {new Date(campaign.createdAt).toLocaleString("sv-SE")} · målgrupp: {campaign.audience}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="border-gold/30 text-gold text-[9px] uppercase">
            {d.organConfidence}
          </Badge>
          <Badge variant="outline" className="border-border text-[9px] uppercase">
            {d.tonality}
          </Badge>
        </div>
      </div>

      <Separator className="my-3 bg-border" />

      <div className="space-y-2">
        {d.subject && (
          <div>
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Ämne/Rubrik</div>
            <p className="text-sm font-bold">{d.subject}</p>
          </div>
        )}
        {d.campaignText && (
          <div>
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Kampanjtext</div>
            <p className="text-sm">{d.campaignText}</p>
          </div>
        )}
        {d.body && (
          <div>
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Body</div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{d.body}</p>
          </div>
        )}
        {d.cta && (
          <div>
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">CTA</div>
            <Badge className="bg-gold text-background">{d.cta}</Badge>
          </div>
        )}
      </div>

      <Separator className="my-3 bg-border" />

      <div className="grid gap-2 sm:grid-cols-2 text-xs">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-gold">Ramverk</div>
          <div>{d.framework}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-gold">Mått</div>
          <div>{d.successMetric}</div>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{d.rationale}</p>
    </Card>
  );
}

function RewriteCard({ rewrite }: { rewrite: Rewrite }) {
  return (
    <Card className="border-border p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-serif text-sm font-bold">
            {rewrite.page} · {rewrite.target}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {new Date(rewrite.createdAt).toLocaleString("sv-SE")}
          </div>
        </div>
      </div>
      <Separator className="my-3 bg-border" />
      {rewrite.changesMade && rewrite.changesMade.length > 0 && (
        <div>
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Förändringar</div>
          <ul className="space-y-1">
            {rewrite.changesMade.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-bull" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-2 text-xs text-muted-foreground">{rewrite.rationale}</p>
      <div className="mt-2 text-[10px] text-muted-foreground">
        <strong>Mått:</strong> {rewrite.successMetric}
      </div>
    </Card>
  );
}
