"use client";

import * as React from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Flame,
  Globe,
  Lock,
  RefreshCw,
  RadioTower,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * TRAFIK & SÄKERHET-PANELN — kundens live-fönster mot nervsystemet:
 * "exceptionellt bra statistik med alla besökare och fullständig säkerhet
 * och dna-blockeringar … allt skall synas live i hemsidan."
 *
 * KÄLLOR (60 s-poll):
 *   GET /api/trafik           (med x-admin-password → fullt aggregat)
 *   GET /api/sakerhet/handelser (samma admin-skydd)
 *
 * LÅS-RAD: API:t kräver ADMIN_PASSWORD även efter admin-inloggningen —
 * samma mönster som BeteendePaneln.
 *
 * AK1A-DNA: marin-panel, guld-accenter, serif-rubriker, tabular-nums,
 * SVG-sparkline utan bibliotek. Allt anonymiserat: sessioner är hashade
 * slump-tokens, IP visas endast som 8 tecken hash — aldrig rå data.
 */

// ── Svartyper (speglar API-routerna) ─────────────────────────────────────────

type TrafikSvar = {
  ok?: boolean;
  genererad?: string;
  nu?: { senaste5min: number; fonster?: string };
  idag?: { visningar: number; unika: number; blockerat: number };
  senaste24h?: { visningar: number; unika: number; perTimme: number[] };
  senaste7d?: { visningar: number; unika: number; perDag: { dag: string; visningar: number; unika: number }[] };
  senaste30d?: { visningar: number; unika: number; perDag: { dag: string; visningar: number; unika: number }[] };
  topSidor?: { namn: string; antal: number }[];
  topKallor?: { namn: string; antal: number }[];
  felgranser24h?: { totalt: number; chunk: number; ovriga: number; topSidor?: { namn: string; antal: number }[] };
  botAndel?: number;
  stickprovsfaktor?: number;
  urvalNotering?: string;
};

type SakerhetSvar = {
  ok?: boolean;
  genererad?: string;
  senaste?: { tid: string | null; path: string; klass: string; http: number | null; monster: string | null; ipHash: string }[];
  totaltBlockerat24h?: number;
  heatmap?: { path: string; antal: number }[];
  unikaHotHashar24h?: number;
  alltKlart?: boolean;
};

// ── Hjälpare ─────────────────────────────────────────────────────────────────

const sv = (n: number | undefined): string => (n ?? 0).toLocaleString("sv-SE");

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

/** Sparkline: 24 timvärden → guld-polyline i SVG (inga bibliotek). */
function Sparkline24({ varde }: { varde: number[] }) {
  const data = varde.length === 24 ? varde : new Array(24).fill(0);
  const max = Math.max(1, ...data);
  const B = 240;
  const H = 56;
  const stig = data
    .map((v, i) => `${(i / (data.length - 1)) * B},${H - 4 - (v / max) * (H - 10)}`)
    .join(" ");
  const nuX = B;
  const nuY = H - 4 - (data[data.length - 1] / max) * (H - 10);
  return (
    <svg viewBox={`0 0 ${B} ${H}`} className="h-14 w-full" role="img" aria-label="Sidvisningar per timme, senaste 24 timmarna">
      <polyline points={`0,${H - 4} ${stig} ${B},${H - 4}`} fill="rgba(201,168,76,0.12)" stroke="none" />
      <polyline points={stig} fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={nuX} cy={nuY} r="3" fill="#E8C766">
        <animate attributeName="opacity" values="1;0.35;1" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function StatTabell({ rader, tomt }: { rader: { namn: string; antal: number }[]; tomt: string }) {
  if (!rader || rader.length === 0) return <p className="py-3 text-xs text-muted-foreground">{tomt}</p>;
  const max = rader[0]?.antal || 1;
  return (
    <div className="space-y-1.5">
      {rader.map((r) => (
        <div key={r.namn} className="flex items-center gap-2">
          {/* våg 104: relativ bredd på mobil, fast w-40 från sm och uppåt */}
          <span className="w-[45%] truncate font-mono text-[11px] text-muted-foreground sm:w-40" title={r.namn}>
            {r.namn}
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-gold/80" style={{ width: `${(r.antal / max) * 100}%` }} />
          </div>
          <span className="w-10 text-right text-[11px] font-semibold tabular-nums">{sv(r.antal)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Panelen ──────────────────────────────────────────────────────────────────

export function TrafikSakerhetPanel() {
  const [trafik, setTrafik] = React.useState<TrafikSvar | null>(null);
  const [sakerhet, setSakerhet] = React.useState<SakerhetSvar | null>(null);
  const [fel, setFel] = React.useState("");
  const [laddar, setLaddar] = React.useState(false);
  const [senasteUppdatering, setSenasteUppdatering] = React.useState<number | null>(null);
  const [behoverLosen, setBehoverLosen] = React.useState(false);
  const [losenord, setLosenord] = React.useState("");
  const [losenFel, setLosenFel] = React.useState("");

  const hamta = React.useCallback(async (pwd?: string) => {
    setLaddar(true);
    setFel("");
    setLosenFel("");
    const headers = pwd ? { "x-admin-password": pwd } : undefined;
    try {
      const [tRes, sRes] = await Promise.all([
        fetch("/api/trafik", { headers }),
        fetch("/api/sakerhet/handelser", { headers }),
      ]);
      if (tRes.status === 401 || tRes.status === 429 || sRes.status === 401 || sRes.status === 429) {
        const json = (await tRes.json().catch(() => ({}))) as { error?: string };
        setBehoverLosen(true);
        setLosenFel(json.error || "Admin-lösenord krävs.");
        setTrafik(null);
        setSakerhet(null);
        return;
      }
      if (tRes.ok) setTrafik((await tRes.json()) as TrafikSvar);
      if (sRes.ok) setSakerhet((await sRes.json()) as SakerhetSvar);
      setBehoverLosen(false);
      setSenasteUppdatering(Date.now());
    } catch {
      setFel("Nätverksfel — kunde inte hämta live-data.");
    } finally {
      setLaddar(false);
    }
  }, []);

  React.useEffect(() => {
    void hamta();
  }, [hamta]);

  // Live-poll: var 60:e sekund (endast när fliken syns — ingen spöktrafik).
  React.useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void hamta();
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [hamta]);

  const lasUpp = async () => {
    if (!losenord) return;
    await hamta(losenord);
  };

  // ── Lås-vy: API:t kräver ADMIN_PASSWORD (x-admin-password) ──
  if (behoverLosen && !trafik) {
    return (
      <div className="marin-panel rounded-xl border border-gold/30 px-5 py-6">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-gold" />
          <h3 className="font-serif text-lg font-bold">Trafik &amp; Säkerhet — låst</h3>
        </div>
        <p className="mt-2 text-xs text-[#EDE6D6]/80">
          Live-statistiken och säkerhetsloggen skyddas av ADMIN_PASSWORD — lämnad i
          headern x-admin-password, samma mönster som övriga admin-rutter.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Input
            type="password"
            value={losenord}
            onChange={(e) => setLosenord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lasUpp()}
            placeholder="Admin-lösenord"
            className="max-w-xs bg-white/10 text-[#EDE6D6]"
          />
          <Button onClick={lasUpp} className="min-h-[44px] bg-gold text-background hover:bg-gold/90 sm:min-h-0">
            Lås upp
          </Button>
        </div>
        {losenFel && <p className="mt-2 text-xs text-red-300">{losenFel}</p>}
      </div>
    );
  }

  const blockerat = sakerhet?.totaltBlockerat24h ?? trafik?.idag?.blockerat ?? 0;
  const alltKlart = (sakerhet?.alltKlart ?? true) && blockerat === 0;

  return (
    <div className="space-y-5">
      {/* ── Rubrikrad: live-indikator + manuell uppdatering ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
          </span>
          <h3 className="font-serif text-lg font-bold">Trafik &amp; Säkerhet 📡</h3>
          <Badge variant="outline" className="border-gold/40 text-[10px] text-gold">
            LIVE · 60 s
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {senasteUppdatering && (
            <span className="text-[10px] text-muted-foreground tabular-nums">
              uppdaterad {tidSedan(new Date(senasteUppdatering).toISOString())}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => hamta()} disabled={laddar}>
            <RefreshCw className={cn("mr-1 h-3 w-3", laddar && "animate-spin")} /> Uppdatera
          </Button>
        </div>
      </div>

      {fel && <p className="text-xs text-red-600">{fel}</p>}

      {/* ── KPI-rad: besökare ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gold/30 bg-card p-4">
          <div className="flex items-center gap-1.5">
            <RadioTower className="h-4 w-4 text-gold" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Just nu (5 min)
            </span>
          </div>
          <p className="mt-1 font-serif text-3xl font-bold tabular-nums">{sv(trafik?.nu?.senaste5min)}</p>
          <p className="text-[10px] text-muted-foreground">aktiva sessioner senaste 5 min</p>
        </div>
        <div className="rounded-lg border border-gold/30 bg-card p-4">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-gold" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Besökare idag
            </span>
          </div>
          <p className="mt-1 font-serif text-3xl font-bold tabular-nums">{sv(trafik?.idag?.unika)}</p>
          <p className="text-[10px] text-muted-foreground">
            {sv(trafik?.idag?.visningar)} sidvisningar (stickprov 30 % + sessioner)
          </p>
        </div>
        <div className="rounded-lg border border-gold/30 bg-card p-4">
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-gold" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Senaste 24 h
            </span>
          </div>
          <p className="mt-1 font-serif text-3xl font-bold tabular-nums">{sv(trafik?.senaste24h?.unika)}</p>
          <p className="text-[10px] text-muted-foreground">{sv(trafik?.senaste24h?.visningar)} sidvisningar</p>
        </div>
        <div className={cn("rounded-lg border bg-card p-4", blockerat > 0 ? "border-orange-500/40" : "border-bull/40")}>
          <div className="flex items-center gap-1.5">
            {alltKlart ? <ShieldCheck className="h-4 w-4 text-green-600" /> : <Flame className="h-4 w-4 text-orange-500" />}
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Blockerat 24 h
            </span>
          </div>
          <p className="mt-1 font-serif text-3xl font-bold tabular-nums">{sv(blockerat)}</p>
          <p className="text-[10px] text-muted-foreground">
            {sv(sakerhet?.unikaHotHashar24h)} unika hot-källor (IP-hash)
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── Trafik: sparkline + 7/30 d ── */}
        <div className="rounded-lg border border-gold/30 bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-serif text-sm font-bold">Sidvisningar per timme — senaste 24 h</h4>
            <Badge variant="outline" className="border-gold/40 text-[10px] text-gold">
              bot-andel {sv(trafik?.botAndel)} %
            </Badge>
          </div>
          <Sparkline24 varde={trafik?.senaste24h?.perTimme ?? []} />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground tabular-nums">
            <span>−24 h</span>
            <span>−12 h</span>
            <span>nu</span>
          </div>
          {/* våg 104: en kolumn på mobil — talraderna är för långa för halv bredd */}
          <div className="mt-3 grid grid-cols-1 gap-3 border-t border-border pt-3 text-xs sm:grid-cols-2">
            <div>
              <p className="font-semibold">7 dagar</p>
              <p className="text-muted-foreground tabular-nums">
                {sv(trafik?.senaste7d?.visningar)} visningar · {sv(trafik?.senaste7d?.unika)} unika
              </p>
            </div>
            <div>
              <p className="font-semibold">30 dagar</p>
              <p className="text-muted-foreground tabular-nums">
                {sv(trafik?.senaste30d?.visningar)} visningar · {sv(trafik?.senaste30d?.unika)} unika
              </p>
            </div>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
            {trafik?.urvalNotering ??
              "Väntar på första mätningen — besök sajten i en annan flik så syns den här inom 60 sekunder."}
          </p>
        </div>

        {/* ── Topp-sidor + källor ── */}
        <div className="rounded-lg border border-gold/30 bg-card p-4">
          <div className="flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-gold" />
            <h4 className="font-serif text-sm font-bold">Topp-sidor (7 d)</h4>
          </div>
          <StatTabell rader={trafik?.topSidor ?? []} tomt="Inga sidvisningar inkomna ännu." />
          <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-3">
            <Globe className="h-4 w-4 text-gold" />
            <h4 className="font-serif text-sm font-bold">Topp-källor (7 d)</h4>
          </div>
          <StatTabell rader={trafik?.topKallor ?? []} tomt="Endast direktbesök hittills." />
        </div>
      </div>

      {/* ── Felgränser — telemetri från fel-ytorna (VÅG 101) ── */}
      {(() => {
        const fg = trafik?.felgranser24h;
        const totalt = fg?.totalt ?? 0;
        return (
          <div className={cn("rounded-lg border bg-card p-4", totalt > 0 ? "border-orange-500/40" : "border-gold/30")}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className={cn("h-4 w-4", totalt > 0 ? "text-orange-500" : "text-gold")} />
                <h4 className="font-serif text-sm font-bold">Felgränser — senaste 24 h</h4>
              </div>
              {totalt > 0 ? (
                <Badge variant="outline" className="border-orange-500/40 text-[10px] text-orange-600 dark:text-orange-400">
                  {sv(totalt)} felgräns{totalt === 1 ? "" : "er"}
                </Badge>
              ) : (
                <Badge variant="outline" className="border-bull/40 text-[10px] text-green-700 dark:text-green-400">
                  Inga fel inrapporterade
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground tabular-nums">
              {sv(fg?.chunk)} chunk-fel (självläkande) · {sv(fg?.ovriga)} övriga app-fel
            </p>
            {(fg?.topSidor ?? []).length > 0 && (
              <div className="mt-3">
                <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Topp-felsidor (24 h)
                </h5>
                <div className="mt-2">
                  <StatTabell rader={fg?.topSidor ?? []} tomt="" />
                </div>
              </div>
            )}
            <p className="mt-3 border-t border-border pt-2 text-[10px] leading-relaxed text-muted-foreground">
              PII-fri telemetri: endast kategori (chunk/övrigt) + sökväg — ingen session, IP eller fel-text.
              Chunk-fel självläker automatiskt hos besökaren (SW + cachear raderas, en omladdning per session).
            </p>
          </div>
        );
      })()}

      {/* ── Säkerhetspanelen ── */}
      <div className={cn("rounded-lg border bg-card p-4", alltKlart ? "border-bull/40" : "border-orange-500/40")}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {alltKlart ? (
              <ShieldCheck className="h-4 w-4 text-green-600" />
            ) : (
              <Flame className="h-4 w-4 text-orange-500" />
            )}
            <h4 className="font-serif text-sm font-bold">Säkerhet — dna-blockeringar</h4>
          </div>
          {alltKlart ? (
            <Badge variant="outline" className="border-bull/40 text-[10px] text-green-700 dark:text-green-400">
              <CheckCircle2 className="mr-1 h-3 w-3" /> Allt klart — inga attacker senaste 24 h
            </Badge>
          ) : (
            <Badge variant="outline" className="border-orange-500/40 text-[10px] text-orange-600 dark:text-orange-400">
              Aktiv blockering pågår
            </Badge>
          )}
        </div>

        {alltKlart ? (
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Trafikvakten står beredd i kanten: kända scanner-mönster (<span className="font-mono">.env, wp-admin,
            phpmyadmin, .git …</span>) blockeras direkt med 403, upprepade hot och flöden med 429 — men just nu har
            inget behövt stoppas. Vetekonen: första blockeringen syns här inom 60 sekunder.
          </p>
        ) : (
          <>
            {/* Senaste blockeringar */}
            {/* våg 104: minsta bredd — fem kolumner scrollar horisontellt på mobil */}
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-[11px]">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="py-1.5 pr-3 font-semibold">Tid</th>
                    <th className="py-1.5 pr-3 font-semibold">Sökväg (trunkerad)</th>
                    <th className="py-1.5 pr-3 font-semibold">Klass</th>
                    <th className="py-1.5 pr-3 font-semibold">HTTP</th>
                    <th className="py-1.5 font-semibold">IP-hash</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {(sakerhet?.senaste ?? []).map((r, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-1.5 pr-3 text-muted-foreground">{tidSedan(r.tid)}</td>
                      <td className="max-w-[220px] truncate py-1.5 pr-3 font-mono" title={r.path}>
                        {r.path}
                      </td>
                      <td className="py-1.5 pr-3">
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                            r.klass === "hot"
                              ? "bg-red-500/10 text-red-600 dark:text-red-400"
                              : r.klass === "flod" || r.klass === "misstankt"
                                ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          {r.klass}
                          {r.monster ? ` · ${r.monster}` : ""}
                        </span>
                      </td>
                      <td className="py-1.5 pr-3 font-mono">{r.http ?? "—"}</td>
                      <td className="py-1.5 font-mono text-muted-foreground">{r.ipHash || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Heat-map per sökväg */}
            {sakerhet?.heatmap && sakerhet.heatmap.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Heat-map — mest attackerade sökvägar (24 h)
                </h5>
                <div className="mt-2">
                  <StatTabell rader={(sakerhet.heatmap ?? []).map((h) => ({ namn: h.path, antal: h.antal }))} tomt="" />
                </div>
              </div>
            )}
          </>
        )}

        <p className="mt-3 border-t border-border pt-2 text-[10px] leading-relaxed text-muted-foreground">
          GDPR: IP-adresser hashas (SHA-256 + salt) innan minnet — rå IP lagras aldrig, sökvägar
          trunkeras till 120 tecken, query-strängar loggas aldrig. Registret: /transparens.
        </p>
      </div>
    </div>
  );
}
