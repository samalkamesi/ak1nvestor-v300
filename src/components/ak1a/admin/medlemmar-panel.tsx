"use client";

import * as React from "react";
import {
  Ban,
  ChevronDown,
  ChevronRight,
  Crown,
  Eye,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminHeaders, adminJsonHeaders, sparaAdminLosenord } from "@/lib/admin-klient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/**
 * MEDLEMMAR-PANELN — FAS L3 (våg 88, STYRELSE-V86-L3-ADMIN.md §A+§C): admin-
 * panelens vy över AUTH-användare (Supabase Auth) mergead med members-profiler
 * (system_events type=medlem) — INTE den gamla members-tabellen (den tabellen
 * läses fortfarande av fliken "Leads 🧲" / members-manager.tsx, orörd).
 *
 * LAZY (media-panel-mönstret): mountas först när fliken "Medlemmar 👥"
 * aktiveras (Radix TabsContent utan forceMount) — GET körs vid fliköppning.
 *
 * KÄLLOR (x-admin-password via admin-klienten — syskon-stilen):
 *   GET  /api/admin/medlemmar?sida=N&sok=      → {medlemmar, sida, nastaSida, total}
 *   GET  /api/admin/medlemmar?authId=…&visaEpost=1 → {epost} (EN rad, per-rad-läs)
 *   POST /api/admin/medlemmar {authId, action}  → ban|unban|fas2-grant|fas3-grant|role
 *   GET  /api/admin/granskningslogg?type=&limit=50 → underpanelen (§C)
 *
 * GDPR (§A-GDPR): listan bär ENDAST maskerad e-post (hash-prefix@domän) —
 * klartext hämtas per rad via ögon-knappen och visas enbart i radens
 * expanderade vy; den loggas ALDRIG (P6×2) och lämnar aldrig raden.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── Svartyper (speglar rutten) ───────────────────────────────────────────────

type Medlem = {
  authId: string;
  epostMaskerad: string;
  epostHash: string | null;
  namn: string | null;
  xp: number | null;
  niva: number | null;
  fas: string | null;
  roll: string | null;
  banned: boolean;
  skapad: string | null;
  senasteInloggning: string | null;
  harProfil: boolean;
};

type ListSvar = {
  medlemmar?: Medlem[];
  sida?: number;
  nastaSida?: number | null;
  total?: number;
  error?: string;
  fel?: string;
};

type LoggEvent = {
  type?: string;
  severity?: string;
  message?: string;
  details?: unknown;
  source?: string | null;
  created_at?: string | null;
};

// ── Hjälpare ─────────────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, string> = {
  info: "text-muted-foreground",
  warning: "text-yellow-600 dark:text-yellow-400",
  error: "text-orange-600 dark:text-orange-400",
  critical: "text-red-600 dark:text-red-400",
};

/** Rollbärare som aldrig får banneas (ruttens självlåsningsskydd — §A r2). */
const SKYDDAD_ROLL = new Set(["admin", "redaktor"]);

function datumKort(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  return new Date(t).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" });
}

function tidSedan(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const sek = Math.floor((Date.now() - t) / 1000);
  if (sek < 60) return `${sek}s sedan`;
  const min = Math.floor(sek / 60);
  if (min < 60) return `${min}m sedan`;
  const tim = Math.floor(min / 60);
  if (tim < 24) return `${tim}h sedan`;
  return `${Math.floor(tim / 24)}d sedan`;
}

/** details-JSON som sträng (kollapsad vy i loggen). */
function detailsText(details: unknown): string {
  if (details === null || details === undefined) return "";
  if (typeof details === "string") return details;
  try {
    return JSON.stringify(details, null, 2);
  } catch {
    return String(details);
  }
}

// ── Panelen ──────────────────────────────────────────────────────────────────

export function MedlemmarPanel() {
  const { toast } = useToast();
  const [svar, setSvar] = React.useState<ListSvar | null>(null);
  const [sida, setSida] = React.useState(1);
  const [sok, setSok] = React.useState("");
  const [sokAktiv, setSokAktiv] = React.useState("");
  const [laddar, setLaddar] = React.useState(false);
  const [fel, setFel] = React.useState("");
  const [behoverLosen, setBehoverLosen] = React.useState(false);
  const [losenord, setLosenord] = React.useState("");
  const [losenFel, setLosenFel] = React.useState("");
  /** Expanderad rad (authId) — profil, nivå, Fas-status, XP + åtgärder. */
  const [expanderad, setExpanderad] = React.useState<string | null>(null);
  /** Per-rad klartext-epost (ENDAST i radens vy — aldrig loggas, aldrig i listan). */
  const [klarEpost, setKlarEpost] = React.useState<Record<string, string>>({});
  const [epostPagar, setEpostPagar] = React.useState<string | null>(null);
  const [actionPagar, setActionPagar] = React.useState<string | null>(null);
  /** Väljad roll i radens roll-väljare (per expanderad rad). */
  const [rollVal, setRollVal] = React.useState("medlem");

  const medlemmar = svar?.medlemmar ?? [];
  const nastaSida = svar?.nastaSida ?? null;
  const total = svar?.total ?? medlemmar.length;

  /** GET listan — vid fliköppning, sidbyte, sök och "Uppdatera". */
  const hamta = React.useCallback(
    async (tillSida: number, tillSok: string) => {
      setLaddar(true);
      setFel("");
      setLosenFel("");
      try {
        const params = new URLSearchParams({ sida: String(tillSida) });
        if (tillSok !== "") params.set("sok", tillSok);
        const res = await fetch(`/api/admin/medlemmar?${params}`, { headers: adminHeaders() });
        if (res.status === 401 || res.status === 403 || res.status === 429) {
          const json = (await res.json().catch(() => ({}))) as { error?: string; fel?: string };
          setBehoverLosen(true);
          setLosenFel(json.fel || json.error || "Admin-lösenord krävs.");
          setSvar(null);
          return;
        }
        if (res.ok) {
          setSvar((await res.json().catch(() => ({}))) as ListSvar);
          setBehoverLosen(false);
        } else {
          const json = (await res.json().catch(() => ({}))) as { error?: string; fel?: string };
          setFel(json.fel || json.error || `Kunde inte hämta medlemmar (HTTP ${res.status}).`);
        }
      } catch {
        setFel("Nätverksfel — kunde inte hämta medlemmar.");
      } finally {
        setLaddar(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    void hamta(1, "");
  }, [hamta]);

  const lasUpp = async () => {
    if (!losenord) return;
    sparaAdminLosenord(losenord); // admin-klienten bär den på kommande anrop
    await hamta(1, "");
  };

  const bytSida = async (nySida: number) => {
    if (nySida < 1) return;
    if (nySida > sida && nastaSida === null) return; // ingen nästa sida
    setSida(nySida);
    setExpanderad(null);
    await hamta(nySida, sokAktiv);
  };

  const sokNu = async () => {
    setSida(1);
    setExpanderad(null);
    setSokAktiv(sok.trim());
    await hamta(1, sok.trim());
  };

  // ── Granskningslogg-underpanelen (§C) ──────────────────────────────────────

  const [loggEvents, setLoggEvents] = React.useState<LoggEvent[]>([]);
  const [loggFilter, setLoggFilter] = React.useState("andringar");
  const [loggLaddar, setLoggLaddar] = React.useState(false);

  const hamtaLogg = React.useCallback(async (typ: string) => {
    setLoggLaddar(true);
    try {
      const params = new URLSearchParams({ type: typ, limit: "50" });
      const res = await fetch(`/api/admin/granskningslogg?${params}`, { headers: adminHeaders() });
      if (res.ok) {
        const json = (await res.json().catch(() => ({}))) as { events?: LoggEvent[] };
        setLoggEvents(json.events ?? []);
      }
    } catch {
      // tyst — underpanelen visar det den har
    } finally {
      setLoggLaddar(false);
    }
  }, []);

  React.useEffect(() => {
    void hamtaLogg("andringar");
  }, [hamtaLogg]);

  /** Per-rad klartext-epost (?visaEpost=1 — EN rad, admin-only, aldrig loggad). */
  const visaEpost = async (m: Medlem) => {
    setEpostPagar(m.authId);
    try {
      const params = new URLSearchParams({ authId: m.authId, visaEpost: "1" });
      const res = await fetch(`/api/admin/medlemmar?${params}`, { headers: adminHeaders() });
      const json = (await res.json().catch(() => ({}))) as { epost?: string; error?: string; fel?: string };
      if (res.ok && typeof json.epost === "string") {
        setKlarEpost((f) => ({ ...f, [m.authId]: json.epost as string }));
      } else {
        toast({
          variant: "destructive",
          title: "Kunde inte läsa e-posten",
          description: json.fel || json.error || `Servern svarade HTTP ${res.status}.`,
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Kunde inte läsa e-posten",
        description: "Nätverksfel — försök igen.",
      });
    } finally {
      setEpostPagar(null);
    }
  };

  /** POST-åtgärd (ban|unban|fas2-grant|fas3-grant|role) — bekräftad av raden. */
  const utfor = async (m: Medlem, action: string, roll?: string) => {
    setActionPagar(m.authId);
    try {
      const res = await fetch("/api/admin/medlemmar", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify(roll ? { authId: m.authId, action, roll } : { authId: m.authId, action }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fel?: string;
        varning?: string;
        banned?: boolean;
        fas?: string | null;
        roll?: string | null;
      };
      if (res.status === 401 || res.status === 403 || res.status === 429) {
        if (res.status === 401) {
          setBehoverLosen(true);
          setLosenFel(json.fel || json.error || "Admin-lösenord krävs.");
        } else {
          toast({
            variant: "destructive",
            title: "Åtgärden nekades",
            description: json.error || json.fel || "Servern nekade åtgärden.",
          });
        }
        return;
      }
      if (res.ok && json.ok) {
        toast({
          title: "Åtgärden verkställd",
          description:
            (action === "ban" || action === "unban"
              ? json.banned
                ? "Medlemmen är avstängd."
                : "Avstängningen är hävd."
              : action === "role"
                ? `Rollen är satt till ${json.roll ?? roll ?? "?"}.`
                : `Fas-status är nu ${json.fas ?? "?"}.`) +
            (json.varning ? ` Varning: ${json.varning}` : ""),
        });
        await Promise.all([hamta(sida, sokAktiv), hamtaLogg(loggFilter)]);
      } else {
        toast({
          variant: "destructive",
          title: "Åtgärden misslyckades",
          description: json.error || json.fel || `Servern svarade HTTP ${res.status}.`,
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Åtgärden misslyckades",
        description: "Nätverksfel — försök igen.",
      });
    } finally {
      setActionPagar(null);
    }
  };

  // ── Lås-vy (media-panel-mönstret) ─────────────────────────────────────────

  if (behoverLosen && !svar) {
    return (
      <div className="rounded-xl border border-gold/30 bg-card px-5 py-6">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-gold" />
          <h3 className="font-serif text-lg font-bold">Medlemmar — låst</h3>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Medlemsregistret skyddas av ADMIN_PASSWORD — lämnad i headern x-admin-password,
          samma mönster som övriga admin-rutter.
        </p>
        {/* våg 104: wrappa på mobil + 44px-mål; desktop som förut */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Input
            type="password"
            value={losenord}
            onChange={(e) => setLosenord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lasUpp()}
            placeholder="Admin-lösenord"
            className="min-h-[44px] max-w-xs sm:min-h-0"
          />
          <Button
            onClick={lasUpp}
            className="min-h-[44px] bg-gold text-background hover:bg-gold/90 sm:min-h-0"
          >
            Lås upp
          </Button>
        </div>
        {losenFel && <p className="mt-2 text-xs text-red-600">{losenFel}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Rubrikrad */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* våg 104: rubrikgruppen wrappar på mobil */}
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
          </span>
          <h3 className="font-serif text-lg font-bold">Medlemmar 👥</h3>
          <Badge variant="outline" className="shrink-0 border-gold/40 text-[10px] text-gold">
            FAS L3
          </Badge>
          <Badge variant="outline" className="shrink-0 text-[10px]">
            SUPABASE AUTH
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={laddar}
          onClick={() => {
            void hamta(sida, sokAktiv);
            void hamtaLogg(loggFilter);
          }}
          className="min-h-[44px] sm:min-h-0"
        >
          <RefreshCw className={cn("mr-1 h-3 w-3", laddar && "animate-spin")} /> Uppdatera
        </Button>
      </div>

      {/* Förklaring av mekaniken (GDPR-minimering) */}
      <p className="rounded-md border border-gold/30 bg-gold/[0.03] px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        <Users className="mr-1 inline h-3.5 w-3.5 align-[-2px] text-gold" />
        Auth-användare (Supabase) mergeade med medlemsprofiler ur system_events. E-post visas
        maskerad (hash@domän) — klartext hämtas endast per rad med ögon-knappen och loggas
        aldrig. Avstängning av rollbärare (admin/redaktör) är spärrat (självlåsningsskydd).
        Rollbyte gäller från nästa inloggning (sessionens maxålder 8 h).
      </p>

      {/* Sök + sidindelning */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={sok}
            onChange={(e) => setSok(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sokNu()}
            placeholder="Sök hash, namn eller authId…"
            className="h-8 w-56 max-w-full min-h-[44px] text-xs sm:min-h-0"
            aria-label="Sök medlemmar"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={sokNu}
            disabled={laddar}
            className="min-h-[44px] sm:min-h-0"
          >
            Sök
          </Button>
          {sokAktiv !== "" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSok("");
                setSokAktiv("");
                setSida(1);
                void hamta(1, "");
              }}
              className="min-h-[44px] sm:min-h-0"
            >
              Rensa sök
            </Button>
          )}
        </div>
        {/* våg 104: pagineringen wrappar på mobil; sidtexten får krympa */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Button
            variant="outline"
            size="sm"
            disabled={sida <= 1 || laddar}
            onClick={() => bytSida(sida - 1)}
            className="min-h-[44px] sm:min-h-0"
          >
            Föregående
          </Button>
          <span className="min-w-0">
            Sida {sida}
            {total > 0 ? ` · ≈${total.toLocaleString("sv-SE")} medlemmar` : ""}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={nastaSida === null || laddar}
            onClick={() => bytSida(nastaSida ?? sida)}
            className="min-h-[44px] sm:min-h-0"
          >
            Nästa
          </Button>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Listan visas sidvis à 50 (auth-tjänstens tak); sökträffar gäller aktuell sida.
        {sokAktiv !== "" ? ` Aktiv sökning: “${sokAktiv}”.` : ""}
      </p>

      {fel && <p className="text-xs text-red-600">{fel}</p>}
      {!svar && !fel && <p className="text-xs text-muted-foreground">Hämtar medlemmar …</p>}

      {/* Listan */}
      <ScrollArea className="h-[460px]">
        <div className="space-y-1.5 pr-3">
          {medlemmar.map((m) => (
            <MedlemRadVy
              key={m.authId}
              medlem={m}
              expanderad={expanderad === m.authId}
              klarEpost={klarEpost[m.authId] ?? null}
              epostPagar={epostPagar === m.authId}
              actionPagar={actionPagar === m.authId}
              rollVal={rollVal}
              setRollVal={setRollVal}
              onToggle={() => {
                const ny = expanderad === m.authId ? null : m.authId;
                setExpanderad(ny);
                if (ny === null) setKlarEpost((f) => {
                  const kopia = { ...f };
                  delete kopia[m.authId];
                  return kopia;
                });
              }}
              onVisaEpost={() => visaEpost(m)}
              onUtfor={(action, roll) => utfor(m, action, roll)}
            />
          ))}
          {svar && medlemmar.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Inga medlemmar matchar{sokAktiv !== "" ? " sökningen på denna sida." : "."}
            </p>
          )}
        </div>
      </ScrollArea>

      {/* Underpanel: Granskningslogg (§C) */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-gold" />
            <h4 className="font-serif text-sm font-bold">Granskningslogg</h4>
            <Badge variant="outline" className="shrink-0 text-[10px]">
              SENASTE {loggEvents.length}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={loggFilter}
              onValueChange={(v) => {
                setLoggFilter(v);
                void hamtaLogg(v);
              }}
            >
              <SelectTrigger
                className="h-8 w-48 max-w-full min-h-[44px] text-xs sm:min-h-0"
                aria-label="Filtrera granskningsloggen"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="andringar">Ändringar (audit)</SelectItem>
                <SelectItem value="alla">Alla händelser</SelectItem>
                <SelectItem value="medlem">Profiler (medlem)</SelectItem>
                <SelectItem value="medlem_progress">Progress</SelectItem>
                <SelectItem value="medlem_andring">Medlem-ändringar</SelectItem>
                <SelectItem value="admin-andring">Admin-ändringar</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              disabled={loggLaddar}
              onClick={() => void hamtaLogg(loggFilter)}
              className="min-h-[44px] sm:min-h-0"
            >
              <RefreshCw className={cn("mr-1 h-3 w-3", loggLaddar && "animate-spin")} /> Ladda om
            </Button>
          </div>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Varje åtgärd ovan hamnar här inom sekunder (system_events — same-table write).
          Inga e-postadresser eller lösenord loggas någonsin (P6).
        </p>
        <ScrollArea className="mt-3 h-[320px]">
          <div className="space-y-1.5 pr-3">
            {loggEvents.map((e, i) => (
              <div key={`${e.created_at ?? i}-${i}`} className="rounded-md border border-border bg-card p-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {e.type ?? "okänd"}
                    </Badge>
                    <span className={cn("truncate font-medium", SEVERITY_COLORS[e.severity ?? "info"])}>
                      {e.message ?? ""}
                    </span>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground" title={datumKort(e.created_at)}>
                    {tidSedan(e.created_at)}
                  </span>
                </div>
                {detailsText(e.details) !== "" && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-[10px] text-muted-foreground">
                      details-JSON (kollapsad)
                    </summary>
                    <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted p-1.5 text-[10px]">
                      {detailsText(e.details)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
            {loggEvents.length === 0 && !loggLaddar && (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Inga händelser i loggen än.
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      <p className="flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
        <Eye className="h-3 w-3 shrink-0" />
        Klartext-epost visas endast per rad (ögon-knappen), finns aldrig i list-payloaden och
        loggas aldrig — GDPR art. 5-minimering.
      </p>
    </div>
  );
}

// ── En rad: sammanfattning + expanderad vy med profil + åtgärder ─────────────

function MedlemRadVy({
  medlem,
  expanderad,
  klarEpost,
  epostPagar,
  actionPagar,
  rollVal,
  setRollVal,
  onToggle,
  onVisaEpost,
  onUtfor,
}: {
  medlem: Medlem;
  expanderad: boolean;
  klarEpost: string | null;
  epostPagar: boolean;
  actionPagar: boolean;
  rollVal: string;
  setRollVal: (v: string) => void;
  onToggle: () => void;
  onVisaEpost: () => void;
  onUtfor: (action: string, roll?: string) => void;
}) {
  const [bekrafta, setBekrafta] = React.useState<string | null>(null);
  const m = medlem;
  const skyddad = SKYDDAD_ROLL.has(m.roll ?? "");

  const actionKnapp = (
    action: string,
    etikett: string,
    ikon: React.ReactNode,
    destruktiv = false,
  ) =>
    bekrafta !== action ? (
      <Button
        key={action}
        size="sm"
        variant="outline"
        className={cn(
          "min-h-[44px] sm:min-h-0",
          destruktiv && "border-red-500/40 text-red-600 hover:bg-red-500/10",
        )}
        disabled={actionPagar || skyddad}
        title={skyddad ? "Rollbärare (admin/redaktör) kan inte stängas av" : etikett}
        onClick={() => setBekrafta(action)}
      >
        {ikon} {etikett}
      </Button>
    ) : (
      <span key={action} className="flex flex-wrap items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          className={cn(
            "min-h-[44px] sm:min-h-0",
            destruktiv && "border-red-500/60 text-red-600 hover:bg-red-500/10",
          )}
          disabled={actionPagar}
          onClick={() => {
            setBekrafta(null);
            onUtfor(action);
          }}
        >
          {actionPagar ? <RefreshCw className="mr-1 h-3 w-3 animate-spin" /> : ikon} Bekräfta {etikett.toLowerCase()}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={actionPagar}
          onClick={() => setBekrafta(null)}
          className="min-h-[44px] sm:min-h-0"
        >
          Avbryt
        </Button>
      </span>
    );

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-3",
        m.banned ? "border-red-500/30" : "border-gold/20",
      )}
    >
      {/* Sammanfattning */}
      <div className="flex cursor-pointer flex-wrap items-center gap-3" onClick={onToggle} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onToggle()}
      >
        {expanderad ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {m.fas !== null && (
              <Badge variant="outline" className="shrink-0 border-gold/40 text-[10px] text-gold">
                {m.fas.toUpperCase()}
              </Badge>
            )}
            {m.roll !== null && (
              <Badge variant="secondary" className="shrink-0 text-[10px] uppercase">
                {m.roll}
              </Badge>
            )}
            {m.banned && (
              <Badge variant="outline" className="shrink-0 border-red-500/50 text-[10px] text-red-600">
                AVSTÄNGD
              </Badge>
            )}
            <span className="min-w-0 truncate text-sm font-medium">{m.namn ?? m.epostMaskerad}</span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {m.epostMaskerad}
            {m.niva !== null ? ` · nivå ${m.niva}` : ""}
            {m.xp !== null ? ` · ${m.xp} XP` : ""}
            {m.skapad ? ` · sedan ${new Date(m.skapad).toLocaleDateString("sv-SE")}` : ""}
            {m.senasteInloggning
              ? ` · inloggad ${tidSedan(m.senasteInloggning)}`
              : " · aldrig inloggad"}
          </p>
        </div>
      </div>

      {/* Expanderad vy: profil + åtgärder (kontrakt §A) */}
      {expanderad && (
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          {/* våg 104: långa UUID/hash bryts med break-all — aldrig horisontell scroll */}
          <div className="grid gap-1 text-[11px] text-muted-foreground sm:grid-cols-2">
            <p>
              <span className="font-semibold">authId:</span>{" "}
              <code className="break-all font-mono">{m.authId}</code>
            </p>
            <p>
              <span className="font-semibold">epostHash:</span>{" "}
              <code className="break-all font-mono">{m.epostHash ?? "—"}</code>
            </p>
            <p>
              <span className="font-semibold">Skapad:</span> {datumKort(m.skapad)}
            </p>
            <p>
              <span className="font-semibold">Senaste inloggning:</span> {datumKort(m.senasteInloggning)}
            </p>
            <p>
              <span className="font-semibold">Fas-status:</span> {m.fas ?? "ingen"}
              {m.harProfil ? " · profil i system_events" : " · ingen profil-rad"}
            </p>
            <p>
              <span className="font-semibold">XP/nivå:</span> {m.xp ?? "—"} / {m.niva ?? "—"}
            </p>
          </div>

          {/* Klartext-epost: per-rad, visas här endast (§A-GDPR) */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={epostPagar}
              onClick={onVisaEpost}
              className="min-h-[44px] sm:min-h-0"
            >
              {epostPagar ? (
                <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Eye className="mr-1 h-3 w-3" />
              )}
              {klarEpost ? "Visa e-post igen" : "Visa e-post"}
            </Button>
            {klarEpost && (
              <code className="min-w-0 max-w-full break-all rounded bg-muted px-2 py-1 font-mono text-xs">
                {klarEpost}
              </code>
            )}
          </div>

          {/* Åtgärder med bekräftelser (syskon-stilen: tvåstegs-bekräfta) */}
          <div className="flex flex-wrap items-center gap-2">
            {m.banned
              ? actionKnapp("unban", "Häv avstängning", <ShieldCheck className="mr-1 h-3 w-3" />)
              : actionKnapp("ban", "Stäng av", <Ban className="mr-1 h-3 w-3" />, true)}
            {actionKnapp("fas2-grant", "Ge Fas 2", <KeyRound className="mr-1 h-3 w-3" />)}
            {actionKnapp("fas3-grant", "Ge Fas 3", <Crown className="mr-1 h-3 w-3" />)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <UserCog className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <Select value={rollVal} onValueChange={setRollVal}>
              <SelectTrigger
                className="h-8 w-36 max-w-full min-h-[44px] text-xs sm:min-h-0"
                aria-label="Välj ny roll"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medlem">medlem</SelectItem>
                <SelectItem value="redaktor">redaktör</SelectItem>
              </SelectContent>
            </Select>
            {bekrafta !== "role" ? (
              <Button
                size="sm"
                variant="outline"
                disabled={actionPagar || m.roll === "admin"}
                title={
                  m.roll === "admin"
                    ? "Admin-rollen sätts enbart via bootstrap och kan inte ändras här"
                    : "Sätt medlemmens roll"
                }
                onClick={() => setBekrafta("role")}
                className="min-h-[44px] sm:min-h-0"
              >
                Sätt roll
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={actionPagar}
                  onClick={() => {
                    setBekrafta(null);
                    onUtfor("role", rollVal);
                  }}
                  className="min-h-[44px] sm:min-h-0"
                >
                  {actionPagar ? (
                    <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <UserCog className="mr-1 h-3 w-3" />
                  )}
                  Bekräfta roll = {rollVal === "redaktor" ? "redaktör" : "medlem"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={actionPagar}
                  onClick={() => setBekrafta(null)}
                  className="min-h-[44px] sm:min-h-0"
                >
                  Avbryt
                </Button>
              </>
            )}
            {skyddad && (
              <span className="text-[10px] text-muted-foreground">
                Rollbärare — avstängning spärrad (självlåsningsskydd).
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
