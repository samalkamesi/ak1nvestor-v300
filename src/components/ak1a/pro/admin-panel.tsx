"use client";

import * as React from "react";
import {
  Users,
  Activity,
  ClipboardList,
  FileText,
  Download,
  RefreshCw,
  ArrowUpDown,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// AK1A PRO — PROADMINPANELEN (B2B-administration, /pro/admin)
//
// Skild från den publika adminen: detta är PRO-världens egen
// översikt — B2B-kunder, pro-analys-anrop, rapportmallar och
// white-label. Fyra sektioner (forskning-b2b Fas D):
//   1. B2B-översikt   — kort-grid med nyckeltal ur GET /api/pro/admin
//   2. Kundtabellen   — members via REST, filtrering + sortering + CSV
//   3. Rapportmallar  — tre låsta mallar + aktiv-toggle + white-label
//   4. Analysloggen   — senaste pro-anrop: tid + tickers + konfluens
//
// Utvecklingssteg: mall-/white-label-inställningar sparas i
// localStorage "pro-admin-v1"; API-posten (POST /api/pro/admin,
// action "mallar") är redo och publicerar ett OrganEvent-beslut.
// ═══════════════════════════════════════════════════════════

// ── Typer (speglar GET /api/pro/admin) ─────────────────────────────────────

export type ProAdminKund = {
  id: string;
  email: string;
  namn: string | null;
  memberType: string;
  senasteLogin: string | null;
  registrerad: string | null;
  xp: number | null;
};

export type ProAdminLoggrad = {
  id: string;
  tid: string | null;
  tickers: string[];
  konfluensPoang: number | null;
  source: string | null;
};

export type ProAdminData = {
  genererad: string;
  konfigurerad: boolean;
  oversikt: {
    anvandare: {
      totalt: number;
      premium: number;
      pro: number;
      ovriga: number;
      senasteLogin: string | null;
    };
    proAnalysAnrop30d: number;
    fas2Ansokningar: { antal: number; senaste: string | null };
    aktivaRapportmallar: number;
  };
  kunder: ProAdminKund[];
  analyslogg: ProAdminLoggrad[];
};

// ── Rapportmallarna — tre låsta AK1A-DNA-mallar (forskning-b2b 5.3) ────────

const RAPPORTMALLAR = [
  {
    id: "portfoljoversikt",
    ikon: "🗂",
    namn: "Portföljöversikt",
    beskrivning: "20×5-värmematris — hela universum (20 bolag × 5 tidshorisonter) på en sida.",
  },
  {
    id: "djupanalyskort",
    ikon: "🔎",
    namn: "Djupanalys-kort",
    beskrivning: "Ett kort per innehav — AKM1-poäng, AK1TS-läge och vågstruktur i fast layout.",
  },
  {
    id: "konfluenssida",
    ikon: "🎯",
    namn: "Konfluenssida",
    beskrivning: "Värde-grind-status — konfluenspoäng per ticker med klassfördelning.",
  },
] as const;

// ── localStorage-kontrakt (pro-admin-v1) ───────────────────────────────────

type WhiteLabel = {
  foretagsnamn: string;
  logotypUrl: string;
  fargtemaPrefix: string;
};

type ProAdminInstallning = {
  mallar: Record<string, boolean>;
  whiteLabel: WhiteLabel;
};

const LS_KEY = "pro-admin-v1";

const STANDARD_INSTALLNING: ProAdminInstallning = {
  mallar: {
    portfoljoversikt: true,
    djupanalyskort: true,
    konfluenssida: true,
  },
  whiteLabel: { foretagsnamn: "", logotypUrl: "", fargtemaPrefix: "" },
};

function lasInstallning(): ProAdminInstallning {
  if (typeof window === "undefined") return STANDARD_INSTALLNING;
  try {
    const rå = window.localStorage.getItem(LS_KEY);
    if (!rå) return STANDARD_INSTALLNING;
    const tolkad = JSON.parse(rå) as Partial<ProAdminInstallning> | null;
    if (!tolkad || typeof tolkad !== "object") return STANDARD_INSTALLNING;
    return {
      mallar: { ...STANDARD_INSTALLNING.mallar, ...(tolkad.mallar ?? {}) },
      whiteLabel: {
        ...STANDARD_INSTALLNING.whiteLabel,
        ...(typeof tolkad.whiteLabel === "object" && tolkad.whiteLabel !== null
          ? tolkad.whiteLabel
          : {}),
      },
    };
  } catch {
    return STANDARD_INSTALLNING;
  }
}

function sparaInstallning(i: ProAdminInstallning): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(i));
  } catch {
    // privat läge m.m. — tyst, inget kraschar på inställningar
  }
}

// ── Hjälpare ───────────────────────────────────────────────────────────────

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

function datum(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isFinite(d.getTime())
    ? d.toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" })
    : "—";
}

const NIVA_STIL: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  premium: "bg-gold/20 text-gold",
  pro: "bg-gold text-primary-foreground",
};

// ── Panelen ────────────────────────────────────────────────────────────────

export function ProAdminPanel() {
  const [data, setData] = React.useState<ProAdminData | null>(null);
  const [laddar, setLaddar] = React.useState(true);

  // Kundtabellens läge
  const [nivaFilter, setNivaFilter] = React.useState("all");
  const [sortStigande, setSortStigande] = React.useState(false);

  // Mallar + white-label (localStorage pro-admin-v1)
  const [installning, setInstallning] = React.useState<ProAdminInstallning>(STANDARD_INSTALLNING);
  const [hydrerad, setHydrerad] = React.useState(false);
  const [publicerar, setPublicerar] = React.useState(false);
  const [publiceratMeddelande, setPubliceratMeddelande] = React.useState("");

  const hamta = React.useCallback(async () => {
    setLaddar(true);
    try {
      const res = await fetch("/api/pro/admin");
      if (res.ok) setData((await res.json()) as ProAdminData);
    } catch {
      // tyst — panelen visar tom-mätvärden
    } finally {
      setLaddar(false);
    }
  }, []);

  React.useEffect(() => {
    hamta();
  }, [hamta]);

  // Hydrera localStorage-förinställningar på klienten (undvik SSR-flicker)
  React.useEffect(() => {
    setInstallning(lasInstallning());
    setHydrerad(true);
  }, []);

  const uppdateraInstallning = (ändring: {
    mallar?: Record<string, boolean>;
    whiteLabel?: Partial<WhiteLabel>;
  }) => {
    setInstallning((föregående) => {
      const nästa = {
        mallar: { ...föregående.mallar, ...(ändring.mallar ?? {}) },
        whiteLabel: { ...föregående.whiteLabel, ...(ändring.whiteLabel ?? {}) },
      };
      sparaInstallning(nästa);
      return nästa;
    });
  };

  // ── Kundtabellen: filtrering + sortering ──
  const filtreradeKunder = React.useMemo(() => {
    const lista = data?.kunder ?? [];
    const filtrerad =
      nivaFilter === "all" ? lista : lista.filter((k) => k.memberType === nivaFilter);
    return [...filtrerad].sort((a, b) => {
      const at = a.senasteLogin ? new Date(a.senasteLogin).getTime() : Number.NEGATIVE_INFINITY;
      const bt = b.senasteLogin ? new Date(b.senasteLogin).getTime() : Number.NEGATIVE_INFINITY;
      return sortStigande ? at - bt : bt - at;
    });
  }, [data, nivaFilter, sortStigande]);

  const nivaer = React.useMemo(() => {
    const lista = data?.kunder ?? [];
    return {
      alla: lista.length,
      free: lista.filter((k) => k.memberType === "free").length,
      premium: lista.filter((k) => k.memberType === "premium").length,
      pro: lista.filter((k) => k.memberType === "pro").length,
    };
  }, [data]);

  // ── CSV-export (klientgenererad, semikolon + BOM för svenskt Excel) ──
  const exporteraCsv = () => {
    const rubriker = [
      "E-post",
      "Namn",
      "Nivå",
      "Senaste inloggning",
      "XP-snapshot",
      "Registrerad",
    ];
    const rader = filtreradeKunder.map((k) => [
      k.email,
      k.namn ?? "",
      k.memberType,
      k.senasteLogin ?? "",
      k.xp !== null ? String(k.xp) : "",
      k.registrerad ?? "",
    ]);
    const cell = (fält: string) => `"${fält.replace(/"/g, '""')}"`;
    const csv =
      [rubriker, ...rader].map((rad) => rad.map(cell).join(";")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ak1a-pro-kunder-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Publicera mall-beslut → POST /api/pro/admin (OrganEvent redo-spår) ──
  const publiceraMallar = async () => {
    setPublicerar(true);
    setPubliceratMeddelande("");
    try {
      const res = await fetch("/api/pro/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mallar",
          mallar: RAPPORTMALLAR.map((m) => ({ id: m.id, aktiv: installning.mallar[m.id] === true })),
          whiteLabel: installning.whiteLabel,
        }),
      });
      const svar = await res.json().catch(() => ({}));
      setPubliceratMeddelande(
        res.ok
          ? svar.publicerat
            ? "Beslut publicerat till AI-organets nervsystem (organ/pro-admin)."
            : "Beslut sparat lokalt — organ-event kunde inte publiceras (Supabase ej konfigurerad)."
          : `Kunde inte publicera: ${svar.error ?? res.status}`,
      );
    } catch {
      setPubliceratMeddelande("Nätverksfel — försök igen.");
    } finally {
      setPublicerar(false);
    }
  };

  const o = data?.oversikt;

  return (
    <div className="space-y-10">
      {/* ═══ 1. B2B-ÖVERSIKT ═══ */}
      <section aria-labelledby="pro-admin-oversikt">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-guld-djup">
              Sektion 1 · Nyckeltal
            </p>
            <h2 id="pro-admin-oversikt" className="mt-1 font-serif text-2xl font-bold">
              B2B-översikt
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={hamta} disabled={laddar}>
            <RefreshCw className={cn("mr-1 h-3.5 w-3.5", laddar && "animate-spin")} />
            Uppdatera
          </Button>
        </div>

        {!data?.konfigurerad && !laddar && (
          <Card className="mt-4 border-gold/30 p-4 text-xs text-muted-foreground">
            Supabase ej konfigurerad — nyckeltalen visas som noll. Lägg till
            NEXT_PUBLIC_SUPABASE_URL och nycklar i miljövariablerna.
          </Card>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <OversiktsKort
            ikon={<Users className="h-5 w-5 text-gold" />}
            etikett="Användare (B2B)"
            varde={o?.anvandare.totalt ?? 0}
            fot={
              o && o.anvandare.totalt > 0
                ? `${o.anvandare.premium} premium · ${o.anvandare.pro} pro${
                    o.anvandare.ovriga > 0 ? ` · ${o.anvandare.ovriga} övriga` : ""
                  }`
                : "members med nivå ≠ free"
            }
          />
          <OversiktsKort
            ikon={<Activity className="h-5 w-5 text-gold" />}
            etikett="Pro-analys-anrop"
            varde={o?.proAnalysAnrop30d ?? 0}
            fot="senaste 30 dagarna"
          />
          <OversiktsKort
            ikon={<ClipboardList className="h-5 w-5 text-gold" />}
            etikett="Fas 2-ansökningar"
            varde={o?.fas2Ansokningar.antal ?? 0}
            fot={
              o?.fas2Ansokningar.senaste
                ? `senaste ${tidSedan(o.fas2Ansokningar.senaste)}`
                : "ännu ingen ansökan"
            }
          />
          <OversiktsKort
            ikon={<FileText className="h-5 w-5 text-gold" />}
            etikett="Aktiva rapportmallar"
            varde={o?.aktivaRapportmallar ?? RAPPORTMALLAR.length}
            fot="tre låsta AK1A-mallar"
          />
        </div>
      </section>

      {/* ═══ 2. KUND-TABELLEN ═══ */}
      <section aria-labelledby="pro-admin-kunder">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-guld-djup">
              Sektion 2 · Kundregister
            </p>
            <h2 id="pro-admin-kunder" className="mt-1 font-serif text-2xl font-bold">
              Kundtabellen
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Members via REST — XP-snapshot är senaste kända XP (ur Fas 2-ansökningar).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={nivaFilter} onValueChange={setNivaFilter}>
              <SelectTrigger className="h-8 w-44 text-xs">
                <SelectValue placeholder="Alla nivåer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla nivåer ({nivaer.alla})</SelectItem>
                <SelectItem value="free">Free ({nivaer.free})</SelectItem>
                <SelectItem value="premium">Premium ({nivaer.premium})</SelectItem>
                <SelectItem value="pro">Pro ({nivaer.pro})</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exporteraCsv}>
              <Download className="mr-1 h-3.5 w-3.5" /> Exportera CSV
            </Button>
          </div>
        </div>

        <Card className="mt-4 overflow-hidden border-gold/30 p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead>
                <tr className="border-b border-gold/25 bg-gold/5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 font-semibold">Kund</th>
                  <th className="px-4 py-2.5 font-semibold">Nivå</th>
                  <th className="px-4 py-2.5 font-semibold">XP-snapshot</th>
                  <th className="px-4 py-2.5 font-semibold">
                    <button
                      type="button"
                      onClick={() => setSortStigande((v) => !v)}
                      className="inline-flex items-center gap-1 uppercase tracking-wider hover:text-gold"
                    >
                      Senaste inloggning
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-2.5 font-semibold">Registrerad</th>
                </tr>
              </thead>
              <tbody>
                {filtreradeKunder.map((k) => (
                  <tr
                    key={k.id}
                    className="border-b border-border/60 last:border-0 hover:bg-gold/[0.04]"
                  >
                    <td className="px-4 py-2.5">
                      <p className="truncate font-medium text-foreground">{k.namn ?? k.email}</p>
                      {k.namn && <p className="truncate text-[11px] text-muted-foreground">{k.email}</p>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                          NIVA_STIL[k.memberType] ?? NIVA_STIL.free,
                        )}
                      >
                        {k.memberType}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-muted-foreground">
                      {k.xp !== null ? k.xp.toLocaleString("sv-SE") : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {k.senasteLogin ? datum(k.senasteLogin) : "aldrig"}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {k.registrerad ? datum(k.registrerad) : "—"}
                    </td>
                  </tr>
                ))}
                {!laddar && filtreradeKunder.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      Inga medlemmar matchar filtret.
                    </td>
                  </tr>
                )}
                {laddar && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      Hämtar kunder…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="mt-2 text-[11px] italic text-muted-foreground">
          {filtreradeKunder.length} av {data?.kunder.length ?? 0} medlemmar · sortering:{" "}
          {sortStigande ? "äldsta inloggning först" : "senaste inloggning först"}
        </p>
      </section>

      {/* ═══ 3. RAPPORTMALLAR + WHITE-LABEL ═══ */}
      <section aria-labelledby="pro-admin-mallar">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-guld-djup">
            Sektion 3 · Rapportbyggaren
          </p>
          <h2 id="pro-admin-mallar" className="mt-1 font-serif text-2xl font-bold">
            Rapportmallar
          </h2>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Tre låsta AK1A-mallar. Aktiv-läget och white-label-fälten sparas i
            localStorage (pro-admin-v1) i utvecklingssteget — &quot;Publicera beslut&quot;
            skickar dem via POST /api/pro/admin som ett OrganEvent-beslut.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {RAPPORTMALLAR.map((m) => {
            const aktiv = installning.mallar[m.id] !== false;
            return (
              <Card
                key={m.id}
                className={cn(
                  "flex flex-col rounded-xl p-5 transition-colors",
                  aktiv ? "border-gold/50" : "border-border opacity-70",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl" aria-hidden>
                    {m.ikon}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        aktiv ? "border-gold/60 text-gold" : "text-muted-foreground",
                      )}
                    >
                      {hydrerad ? (aktiv ? "Aktiv" : "Inaktiv") : "…"}
                    </Badge>
                    <Switch
                      checked={aktiv}
                      onCheckedChange={(på) => uppdateraInstallning({ mallar: { [m.id]: på } })}
                      aria-label={`${m.namn} — aktiv eller inaktiv`}
                    />
                  </div>
                </div>
                <h3 className="mt-3 font-serif text-lg font-bold">{m.namn}</h3>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">
                  {m.beskrivning}
                </p>
                <p className="mt-3 border-t border-gold/20 pt-2 font-mono text-[10px] uppercase tracking-wider text-guld-djup">
                  Låst AK1A-DNA · white-label redo
                </p>
              </Card>
            );
          })}
        </div>

        {/* White-label-fälten */}
        <Card className="mt-4 border-gold/30 p-5">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gold" />
            <h3 className="font-serif text-lg font-bold">White-label</h3>
            <Badge variant="outline" className="ml-1 text-[10px]">
              pro-admin-v1
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Firmans identitet på rapporterna. Metod- och ansvarsdeklarationen förblir
            mal-låst — den kan aldrig suddas ut av white-label.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="block text-xs">
              <span className="mb-1 block font-medium text-foreground">Företagsnamn</span>
              <Input
                value={installning.whiteLabel.foretagsnamn}
                onChange={(e) =>
                  uppdateraInstallning({
                    whiteLabel: { foretagsnamn: e.target.value.slice(0, 120) },
                  })
                }
                placeholder="Aktiebolag Kapital & Vågor"
                className="h-9 text-xs"
              />
            </label>
            <label className="block text-xs">
              <span className="mb-1 block font-medium text-foreground">Logotyp-URL</span>
              <Input
                value={installning.whiteLabel.logotypUrl}
                onChange={(e) =>
                  uppdateraInstallning({
                    whiteLabel: { logotypUrl: e.target.value.slice(0, 300) },
                  })
                }
                placeholder="https://…/logo.svg"
                className="h-9 text-xs"
              />
            </label>
            <label className="block text-xs">
              <span className="mb-1 block font-medium text-foreground">Färgtema-prefix</span>
              <Input
                value={installning.whiteLabel.fargtemaPrefix}
                onChange={(e) =>
                  uppdateraInstallning({
                    whiteLabel: { fargtemaPrefix: e.target.value.slice(0, 40) },
                  })
                }
                placeholder="kobolt"
                className="h-9 text-xs"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              className="bg-gold text-primary-foreground hover:bg-gold/90"
              onClick={publiceraMallar}
              disabled={publicerar}
            >
              <ShieldCheck className="mr-1 h-3.5 w-3.5" />
              {publicerar ? "Publicerar…" : "Publicera beslut"}
            </Button>
            {publiceratMeddelande && (
              <p className="text-[11px] text-muted-foreground">{publiceratMeddelande}</p>
            )}
          </div>
        </Card>
      </section>

      {/* ═══ 4. ANALYS-LOGGEN ═══ */}
      <section aria-labelledby="pro-admin-logg">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-guld-djup">
            Sektion 4 · Motoranrop
          </p>
          <h2 id="pro-admin-logg" className="mt-1 font-serif text-2xl font-bold">
            Analysloggen
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Senaste pro-analys-anropen (senaste 30 dagarna, ur system_events) — tid,
            tickers och konfluens-poäng per anrop.
          </p>
        </div>

        <Card className="mt-4 border-gold/30 p-5">
          <ScrollArea className="h-[320px] pr-3">
            <div className="space-y-2">
              {(data?.analyslogg ?? []).map((rad) => (
                <div
                  key={rad.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-md border border-border bg-card p-2.5 text-xs"
                >
                  <span className="shrink-0 text-muted-foreground">{datum(rad.tid)}</span>
                  <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                    {rad.tickers.length > 0 ? (
                      rad.tickers.map((t) => (
                        <Badge key={t} variant="secondary" className="font-mono text-[10px]">
                          {t}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">inga tickers registrerade</span>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 tabular-nums",
                      rad.konfluensPoang !== null ? "border-gold/50 text-gold" : "text-muted-foreground",
                    )}
                  >
                    {rad.konfluensPoang !== null
                      ? `Konfluens ${rad.konfluensPoang}`
                      : "Konfluens —"}
                  </Badge>
                  {rad.source && (
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                      {rad.source}
                    </span>
                  )}
                </div>
              ))}
              {(data?.analyslogg ?? []).length === 0 && !laddar && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Inga pro-analys-anrop de senaste 30 dagarna — loggen fylls när
                  B2B-analyser körs via /api/pro/analys.
                </p>
              )}
              {laddar && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Hämtar analysloggen…
                </p>
              )}
            </div>
          </ScrollArea>
        </Card>
      </section>
    </div>
  );
}

// ── Översiktskort ──────────────────────────────────────────────────────────

function OversiktsKort({
  ikon,
  etikett,
  varde,
  fot,
}: {
  ikon: React.ReactNode;
  etikett: string;
  varde: number;
  fot: string;
}) {
  return (
    <Card className="gravor-ram rounded-xl p-4">
      <div className="flex items-center gap-2">
        {ikon}
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {etikett}
        </span>
      </div>
      <p className="mt-2 font-serif text-3xl font-bold tabular-nums">
        {varde.toLocaleString("sv-SE")}
      </p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{fot}</p>
    </Card>
  );
}
