"use client";

import * as React from "react";
import { BarChart3, Lock, RefreshCw, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * KONVERTERINGSPANELN — MARKNADS-BESLUT VÅG 1b (m7 §3a): tratten i sex steg
 * ur BEFINTLIGA källor (noll nya spår, P6). Lås-rad och dataflöde följer
 * TrafikSakerhetPaneln exakt: klientpanel + GET /api/admin/konvertering med
 * x-admin-password (ADMIN_PASSWORD), modulmemo 5 min i routen.
 *
 * Ärligheten är designen (P4): varje steg bär sin mätkvalitet —
 * MÄTT (guldkantad siffra), SKATTAD (ur aktivitetsspåret), MANUELL
 * (underhållen för hand) — och mätluckorna skrivs ut, aldrig göms.
 */

// ── Svartyper (speglar API-routen) ───────────────────────────────────────────

type KonverteringsSteg = {
  id: string;
  namn: string;
  varde: number;
  sub?: string;
  kalla: string;
  kvalitet: "MÄTT" | "SKATTAD" | "MANUELL";
  notering: string;
};

type KonverteringsSvar = {
  ok?: boolean;
  genererad?: string;
  spann?: { fran: string | null; till: string };
  steg?: KonverteringsSteg[];
  grader?: {
    fran: string;
    till: string;
    taljare: number;
    namnare: number;
    procent: number | null;
    fonster: string;
  }[];
  luckor?: string[];
  urvalNotering?: string;
  error?: string;
};

// ── Hjälpare ─────────────────────────────────────────────────────────────────

const sv = (n: number | undefined): string => (n ?? 0).toLocaleString("sv-SE");

const kvalitetStil: Record<KonverteringsSteg["kvalitet"], string> = {
  MÄTT: "border-bull/40 text-green-700 dark:text-green-400",
  SKATTAD: "border-gold/50 text-gold",
  MANUELL: "border-muted-foreground/40 text-muted-foreground",
};

function datum(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = new Date(iso);
  return Number.isFinite(t.getTime()) ? t.toLocaleDateString("sv-SE") : "—";
}

// ── Panelen ──────────────────────────────────────────────────────────────────

export function KonverteringsPanel() {
  const [data, setData] = React.useState<KonverteringsSvar | null>(null);
  const [fel, setFel] = React.useState("");
  const [laddar, setLaddar] = React.useState(false);
  const [behoverLosen, setBehoverLosen] = React.useState(false);
  const [losenord, setLosenord] = React.useState("");
  const [losenFel, setLosenFel] = React.useState("");

  const hamta = React.useCallback(async (pwd?: string) => {
    setLaddar(true);
    setFel("");
    setLosenFel("");
    const headers = pwd ? { "x-admin-password": pwd } : undefined;
    try {
      const res = await fetch("/api/admin/konvertering", { headers });
      if (res.status === 401) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setBehoverLosen(true);
        setLosenFel(json.error || "Admin-lösenord krävs.");
        setData(null);
        return;
      }
      if (res.ok) {
        setData((await res.json()) as KonverteringsSvar);
        setBehoverLosen(false);
      } else {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setFel(json.error || `HTTP ${res.status}`);
      }
    } catch {
      setFel("Nätverksfel — kunde inte hämta konverteringsdata.");
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

  // ── Lås-vy: API:t kräver ADMIN_PASSWORD (x-admin-password) ──
  if (behoverLosen && !data) {
    return (
      <div className="marin-panel rounded-xl border border-gold/30 px-5 py-6">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-gold" />
          <h3 className="font-serif text-lg font-bold">Konvertering — låst</h3>
        </div>
        <p className="mt-2 text-xs text-[#EDE6D6]/80">
          Konverteringsvyn skyddas av ADMIN_PASSWORD — lämnad i headern
          x-admin-password, samma mönster som Trafik &amp; Säkerhet.
        </p>
        <div className="mt-3 flex gap-2">
          <Input
            type="password"
            value={losenord}
            onChange={(e) => setLosenord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lasUpp()}
            placeholder="Admin-lösenord"
            className="max-w-xs bg-white/10 text-[#EDE6D6]"
          />
          <Button onClick={lasUpp} className="bg-gold text-background hover:bg-gold/90">
            Lås upp
          </Button>
        </div>
        {losenFel && <p className="mt-2 text-xs text-red-300">{losenFel}</p>}
      </div>
    );
  }

  const steg = data?.steg ?? [];
  const grader = data?.grader ?? [];
  const maxVarde = Math.max(1, ...steg.map((s) => s.varde));
  const gradFor = (id: string) => grader.find((g) => g.fran === id);

  return (
    <div className="space-y-5">
      {/* ── Rubrikrad ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-gold" />
          <h3 className="font-serif text-lg font-bold">Konvertering 📊</h3>
          <Badge variant="outline" className="border-gold/40 text-[10px] text-gold">
            SEX STEG · NOLL NYA SPÅR
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          {data?.spann && (
            <span className="text-[10px] text-muted-foreground tabular-nums">
              datumspann {datum(data.spann.fran)} → {datum(data.spann.till)}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => hamta()} disabled={laddar}>
            <RefreshCw className={cn("mr-1 h-3 w-3", laddar && "animate-spin")} /> Uppdatera
          </Button>
        </div>
      </div>

      {fel && <p className="text-xs text-red-600">{fel}</p>}

      {/* ── Tratten: staplar + konverteringsgrader ── */}
      <div className="rounded-lg border border-gold/30 bg-card p-4">
        <h4 className="font-serif text-sm font-bold">Tratten — besökare till betalande</h4>
        <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
          {data?.urvalNotering ??
            "Hämtar konverteringsdata…"}
        </p>

        <div className="mt-4 space-y-1.5">
          {steg.map((s, i) => {
            const grad = gradFor(s.id);
            return (
              <React.Fragment key={s.id}>
                {i > 0 && grad && (
                  <div className="flex items-center gap-2 pl-2 text-[10px] text-muted-foreground" aria-label={`Konverteringsgrad ${grad.fran} till ${grad.till}`}>
                    <span className="text-gold">↓</span>
                    {grad.procent !== null ? (
                      <span className="font-semibold tabular-nums text-foreground/80">
                        {grad.procent.toLocaleString("sv-SE", { maximumFractionDigits: 1 })} %{" "}
                      </span>
                    ) : (
                      <span className="font-semibold">— </span>
                    )}
                    <span className="tabular-nums">
                      ({sv(grad.taljare)}/{sv(grad.namnare)} · {grad.fonster})
                    </span>
                  </div>
                )}
                <div className="rounded-lg border border-border bg-background/40 p-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-right font-mono text-[10px] text-muted-foreground tabular-nums">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold">{s.namn}</span>
                      {s.sub && (
                        <span className="block truncate text-[10px] text-muted-foreground" title={s.sub}>
                          {s.sub}
                        </span>
                      )}
                    </span>
                    <Badge variant="outline" className={cn("shrink-0 text-[9px] font-semibold", kvalitetStil[s.kvalitet])}>
                      {s.kvalitet}
                    </Badge>
                    <span className="shrink-0 text-right font-serif text-xl font-bold tabular-nums">
                      {sv(s.varde)}
                    </span>
                  </div>
                  <div className="mt-2 ml-7 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        s.kvalitet === "MÄTT" ? "bg-gold/80" : s.kvalitet === "SKATTAD" ? "bg-gold/50" : "bg-muted-foreground/50"
                      )}
                      style={{ width: `${Math.max(s.varde > 0 ? 2 : 0, (s.varde / maxVarde) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1.5 ml-7 text-[10px] leading-relaxed text-muted-foreground">
                    {s.notering} <span className="font-mono">Källa: {s.kalla}</span>
                  </p>
                </div>
              </React.Fragment>
            );
          })}
          {steg.length === 0 && !fel && (
            <p className="py-3 text-xs text-muted-foreground">Hämtar tratten…</p>
          )}
        </div>
      </div>

      {/* ── Mätluckorna — ärlig redovisning (P4) ── */}
      <div className="rounded-lg border border-gold/30 bg-card p-4">
        <div className="flex items-center gap-1.5">
          <ShieldQuestion className="h-4 w-4 text-gold" />
          <h4 className="font-serif text-sm font-bold">Mätluckor — det som INTE mäts</h4>
        </div>
        <ul className="mt-3 space-y-1.5">
          {(data?.luckor ?? []).map((l, i) => (
            <li key={i} className="flex gap-2 text-[11px] leading-relaxed text-muted-foreground">
              <span className="shrink-0 text-gold" aria-hidden="true">·</span>
              <span>{l}</span>
            </li>
          ))}
          {!data && <li className="text-[11px] text-muted-foreground">Väntar på data…</li>}
        </ul>
        <p className="mt-3 border-t border-border pt-2 text-[10px] leading-relaxed text-muted-foreground">
          GDPR: vyn bygger enbart på befintliga, anonymiserade datapunkter (beslut P6) — inga
          nya spår, inga pixels, ingen koppling av hashad session till medlem. Registret:{" "}
          <a href="/transparens" className="underline hover:text-foreground">/transparens</a>.
        </p>
      </div>
    </div>
  );
}
