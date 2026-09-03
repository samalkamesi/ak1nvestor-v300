"use client";

import * as React from "react";
import {
  Compass,
  Lightbulb,
  Lock,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * BETEENDE-PANELN — adminens analys av hur eleverna faktiskt reser genom
 * ekosystemet ("redovisa analyser till admin så admin vet hur vi optimerar
 * vidare"). Läser GET /api/admin/beteende (ADMIN_PASSWORD-skyddad — därför
 * den lilla lås-raden: servern kräver lösenordet igen i x-admin-password).
 *
 * AK1A-DNA: marin-panel, guld, .hjarlinje, tabular-nums, serif-rubriker.
 * All text mot admin följer pedagogik.ts:s anda — mönster beskrivs som
 * möjligheter att välkomna, aldrig som brister hos eleven.
 */

// ── Svartyper (speglar API-routen) ────────────────────────────────────────────

type Sammanfattning = {
  aktivaElever: number;
  medelNiva: number;
  medelXP: number;
  toppIntressen: string[];
  fas2Redo: number;
};

type Monster = { namn: string; frekvens: number; beskrivning: string };

type Insikt = { rubrik: string; text: string; ikon: string; tid?: string | null };

type BeteendeSvar = {
  sammanfattning: Sammanfattning;
  mönster: Monster[];
  optimeringsTips: string[];
  senasteInsikter: Insikt[];
  datakalla: "tracer" | "aktivitet" | "statisk";
  genererad: string;
};

// ── Presentationshield ────────────────────────────────────────────────────────

const KALLA_ETIKETT: Record<BeteendeSvar["datakalla"], { text: string; cls: string }> = {
  tracer: {
    text: "tracer — frivilligt delade profiler",
    cls: "border-bull/40 text-green-700 dark:text-green-400",
  },
  aktivitet: {
    text: "aktivitet — anonyma sessioner (proxy)",
    cls: "border-gold/40 text-gold",
  },
  statisk: {
    text: "statisk fallback — ingen data ännu",
    cls: "border-border text-muted-foreground",
  },
};

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

const svTal = (n: number): string => n.toLocaleString("sv-SE", { maximumFractionDigits: 1 });

// ── Panelen ───────────────────────────────────────────────────────────────────

export function BeteendePanel() {
  const [data, setData] = React.useState<BeteendeSvar | null>(null);
  const [fel, setFel] = React.useState("");
  const [laddar, setLaddar] = React.useState(false);
  const [behoverLosen, setBehoverLosen] = React.useState(false);
  const [losenord, setLosenord] = React.useState("");
  const [losenFel, setLosenFel] = React.useState("");

  const hamta = React.useCallback(async (pwd?: string) => {
    setLaddar(true);
    setFel("");
    setLosenFel("");
    try {
      const res = await fetch("/api/admin/beteende", {
        headers: pwd ? { "x-admin-password": pwd } : undefined,
      });
      if (res.status === 401 || res.status === 429) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setBehoverLosen(true);
        setLosenFel(json.error || "Admin-lösenord krävs.");
        setData(null); // lås-vyn är alltid sanningen när skyddet säger nej
        return;
      }
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setFel(json.error || `HTTP ${res.status}`);
        return;
      }
      const json = (await res.json()) as BeteendeSvar;
      setData(json);
      setBehoverLosen(false);
    } catch {
      setFel("Nätverksfel — kunde inte hämta beteendeanalysen.");
    } finally {
      setLaddar(false);
    }
  }, []);

  React.useEffect(() => {
    void hamta();
  }, [hamta]);

  const lasUpp = async () => {
    if (!losenord) return;
    await hamta(losenord);
  };

  // ── Lås-rad: API:t kräver ADMIN_PASSWORD även efter admin-inloggningen ──────
  if (behoverLosen && !data) {
    return (
      <div className="marin-panel rounded-xl border border-gold/30 px-5 py-6">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-gold" />
          <h3 className="font-serif text-lg font-bold">Beteendeanalys — låst</h3>
        </div>
        <p className="mt-2 max-w-xl text-xs leading-relaxed text-[#EDE6D6]/80">
          Dashboarden läser frivilligt delade elevprofiler och kräver därför ADMIN_PASSWORD även
          efter inloggningen. Lösenordet skickas enbart i headern för detta anrop.
        </p>
        <div className="mt-4 flex max-w-sm items-center gap-2">
          <Input
            type="password"
            value={losenord}
            onChange={(e) => setLosenord(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && losenord) void lasUpp();
            }}
            placeholder="ADMIN_PASSWORD"
            className="min-h-[44px]"
          />
          <Button
            onClick={() => void lasUpp()}
            disabled={!losenord || laddar}
            className="min-h-[44px] bg-gold text-background hover:bg-gold/90"
          >
            Lås upp
          </Button>
        </div>
        {losenFel && <p className="mt-2 text-xs text-red-400">{losenFel}</p>}
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <h3 className="font-serif text-lg font-bold">Beteendeanalys</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {fel || "Hämtar aggregerade beteendeinsikter…"}
        </p>
        {fel && (
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void hamta(losenord || undefined)}>
            <RefreshCw className="mr-1 h-3 w-3" /> Försök igen
          </Button>
        )}
      </div>
    );
  }

  const { sammanfattning: s, mönster, optimeringsTips, senasteInsikter, datakalla } = data;
  const kalla = KALLA_ETIKETT[datakalla] ?? KALLA_ETIKETT.statisk;
  const maxFrekvens = Math.max(1, ...mönster.map((m) => m.frekvens));
  const xpPrefix = datakalla === "aktivitet" ? "≈" : "";

  return (
    <div className="space-y-4">
      {/* Marin-panel-rubrikrad */}
      <div className="marin-panel rounded-xl border border-gold/30 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold-soft">
              Beteendeanalys — hur eleverna reser
            </p>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#EDE6D6]/80">
              Aggregerade mönster ur tracerns frivilligt delade profiler och anonyma
              sessioner: vad som påbörjas, vad som återkommer, vad som bär mot Fas 2 —
              redovisat så admin vet hur vi optimerar vidare. Pedagogisk plattform,
              inte investeringsråd.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", kalla.cls)}>
              {kalla.text}
            </Badge>
            <span className="tabular-nums text-[10px] text-[#EDE6D6]/60">
              mätt {tidSedan(data.genererad)}
            </span>
            <Button
              variant="outline"
              disabled={laddar}
              onClick={() => void hamta(losenord || undefined)}
              className="min-h-[44px] border-gold/40 bg-transparent text-gold hover:bg-gold/10 hover:text-gold"
            >
              <RefreshCw className={cn("mr-1 h-4 w-4", laddar && "animate-spin")} />
              Uppdatera
            </Button>
          </div>
        </div>
      </div>

      <div className="hjarlinje" aria-hidden="true" />

      {/* Sammanfattning — kortrad */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaKort
          ikon={<Users className="h-4 w-4 text-gold" />}
          titel="Aktiva elever"
          varde={svTal(s.aktivaElever)}
          sub="senaste 30 dagar"
        />
        <SummaKort
          ikon={<TrendingUp className="h-4 w-4 text-gold" />}
          titel="Medelnivå"
          varde={svTal(s.medelNiva)}
          sub="1–100 (100 XP per nivå)"
        />
        <SummaKort
          ikon={<Sparkles className="h-4 w-4 text-gold" />}
          titel={datakalla === "aktivitet" ? "Medel-XP (proxy)" : "Medel-XP"}
          varde={`${xpPrefix}${svTal(s.medelXP)}`}
          sub={datakalla === "tracer" ? "ur delade profiler (närvaro-min om XP saknas)" : "aktivitets-viktad uppskattning"}
        />
        <SummaKort
          ikon={<Compass className="h-4 w-4 text-gold" />}
          titel="Toppintressen"
          varde={s.toppIntressen.length > 0 ? s.toppIntressen.join(" · ") : "—"}
          liten={s.toppIntressen.length > 1}
          sub="störst nyfikenhet"
        />
        <SummaKort
          ikon={<Lock className="h-4 w-4 text-gold" />}
          titel="Fas 2-redo"
          varde={svTal(s.fas2Redo)}
          sub="nivå ≥ 25"
        />
      </div>

      {/* Mönster + insikter sida vid sida på breda skärmar */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Mönster-listan */}
        <div className="rounded-xl border border-gold/20 bg-card p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gold" />
            <h3 className="font-serif text-lg font-bold">Beteendemönster</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Frekvens = antal elever/sessioner som matchar mönstret (90 dagars fönster).
          </p>
          <div className="mt-4 space-y-4">
            {mönster.map((m) => (
              <div key={m.namn}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold">{m.namn}</span>
                  <span className="tabular-nums shrink-0 font-serif text-2xl font-bold text-gold">
                    {svTal(m.frekvens)}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gold/15">
                  <div
                    className="h-full rounded-full bg-gold"
                    style={{ width: `${Math.min(100, (m.frekvens / maxFrekvens) * 100)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{m.beskrivning}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Senaste insikter */}
        <div className="rounded-xl border border-gold/20 bg-card p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" />
            <h3 className="font-serif text-lg font-bold">Senaste insikter</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {datakalla === "tracer"
              ? "Ur de senaste frivilligt delade profilerna — elevens egen röst."
              : "Tracerns välkomnande basinsikter (delade profiler ännu ej aktiverade)."}
          </p>
          <div className="mt-4 space-y-3">
            {senasteInsikter.map((i, ix) => (
              <div key={`${i.rubrik}-${ix}`} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold">
                    <span className="mr-1.5" aria-hidden="true">{i.ikon}</span>
                    {i.rubrik}
                  </p>
                  {i.tid && (
                    <span className="tabular-nums shrink-0 text-[10px] text-muted-foreground">
                      {tidSedan(i.tid)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{i.text}</p>
              </div>
            ))}
            {senasteInsikter.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Inga insikter ännu — tracern börjar se mönster vid nästa besök.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Optimerings-tips — numrerade, konkreta */}
      <div className="rounded-xl border border-gold/20 bg-card p-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-gold" />
          <h3 className="font-serif text-lg font-bold">Optimering — nästa steg</h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Datastyrda där data finns, alltid konkreta — varje tips är en välkomnande
          dörr för eleven, aldrig en brist att åtgärda.
        </p>
        <ol className="mt-4 space-y-2.5">
          {optimeringsTips.map((t, ix) => (
            <li key={ix} className="flex gap-3">
              <span className="tabular-nums mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/40 font-serif text-xs font-bold text-gold">
                {ix + 1}
              </span>
              <p className="text-sm leading-relaxed">{t}</p>
            </li>
          ))}
          {optimeringsTips.length === 0 && (
            <li className="text-sm text-muted-foreground">
              Inga tips genererade ännu — fyll på med data och uppdatera.
            </li>
          )}
        </ol>
      </div>
    </div>
  );
}

// ── Sammanfattningkort ────────────────────────────────────────────────────────

function SummaKort({
  ikon,
  titel,
  varde,
  sub,
  liten,
}: {
  ikon: React.ReactNode;
  titel: string;
  varde: string;
  sub?: string;
  liten?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gold/20 bg-card p-4">
      <div className="flex items-center gap-2">
        {ikon}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {titel}
        </p>
      </div>
      <p
        className={cn(
          "tabular-nums mt-2 font-serif font-bold text-gold",
          liten ? "text-lg leading-tight" : "text-3xl",
        )}
      >
        {varde}
      </p>
      {sub && <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
