"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminHeaders } from "@/lib/admin-klient";
import { Dna, HeartPulse, ShieldCheck, RefreshCw, Skull, Baby, Trophy, Radar, GitCommitHorizontal } from "lucide-react";

/**
 * ORGAN-PANELEN (våg 110) — organsystemets kontrollrum i admin.
 *
 * Kundens direktiv 2026-09-12: "lägg in systemet även i admin sidan när den
 * är helt klar helt autonomt". Visar det EVOLUTIONÄRA registret (organ A-Ö,
 * fitness = landade commits, födslar/dödsdatum, obduktioner) + de fyra
 * 24/7-pumparnas live-loggsvansar (mål-hjärtslag · styrelserond · vakten).
 *
 * Data: GET /api/admin/organ (requireAdmin-skyddad) — läsning endast;
 * evolutionen drivs av cron-ronderna (verktyg/organ-fabrik.mjs).
 */

interface OrganRad {
  bokstav: string;
  namn: string;
  uppdrag: string;
  status: "aktiv" | "död";
  fodd: string | null;
  dod: string | null;
  leveranserSista2: number[];
  totaltLeveranser: number;
  foralder: string | null;
  obduktion: string | null;
}

interface HistorikRad {
  rond: number;
  commits: number;
  doda: string[];
  fodd: string[];
}

/** Våg 139 — Observatoriet v3: en agent-rad i pågående våg, med filbevis. */
interface VagRadUI {
  block: string;
  agent: string;
  uppdrag: string;
  utdatafil: string;
  status: string;
  filFinns: boolean;
  commit: string | null;
  commitTid: string | null;
}

interface NastaRadUI {
  markering: string;
  uppdrag: string;
  varfor: string;
}

interface LandningUI {
  hash: string;
  tid: string;
  amne: string;
}

interface Data {
  registret: { rond: number; organ: OrganRad[]; historik: HistorikRad[] };
  senasteCommits?: LandningUI[];
  planering?: { vagTitel: string; vagRader: VagRadUI[]; nasta: NastaRadUI[] };
  pumper: { rond: string[]; hjartslag: string[]; vakt: string[] };
}

export function OrganPanel() {
  const [data, setData] = React.useState<Data | null>(null);
  const [laddar, setLaddar] = React.useState(true);
  const [uppdaterad, setUppdaterad] = React.useState("");

  const hamta = React.useCallback(async () => {
    setLaddar(true);
    try {
      const res = await fetch("/api/admin/organ", { headers: adminHeaders() });
      if (res.ok) {
        setData(await res.json());
        setUppdaterad(new Date().toLocaleTimeString("sv-SE"));
      }
    } catch {
      // tyst — panelen visar viloläge
    } finally {
      setLaddar(false);
    }
  }, []);

  React.useEffect(() => {
    hamta();
    const i = setInterval(hamta, 60_000); // live-uppdatering varje minut
    return () => clearInterval(i);
  }, [hamta]);

  const organ = data?.registret.organ ?? [];
  const aktiva = organ.filter((o) => o.status === "aktiv");
  const doda = organ.filter((o) => o.status === "död");
  const basta = [...aktiva].sort(
    (a, b) => (b.leveranserSista2[0] ?? 0) - (a.leveranserSista2[0] ?? 0),
  )[0];
  const historik = [...(data?.registret.historik ?? [])].reverse().slice(0, 8);
  const totaltCommits = historik.reduce((s, h) => s + h.commits, 0);
  const planering = data?.planering ?? { vagTitel: "", vagRader: [], nasta: [] };
  const landningar = data?.senasteCommits ?? [];
  const vagLevererade = planering.vagRader.filter((r) => r.commit !== null).length;

  return (
    <div className="space-y-4">
      {/* Rubrikrad */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Dna className="h-5 w-5 shrink-0 text-gold" aria-hidden />
          <h3 className="font-serif text-lg font-bold">Organismen — evolutionens kontrollrum</h3>
          <Badge variant="outline" className="border-gold/40 text-gold">
            Rond {data?.registret.rond ?? 0}
          </Badge>
          <Badge className="bg-gold text-background">{aktiva.length}/12 aktiva</Badge>
          {doda.length > 0 && (
            <Badge variant="outline" className="border-red-500/40 text-red-600 dark:text-red-400">
              {doda.length} döda
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {uppdaterad && (
            <span className="text-xs text-muted-foreground">uppdaterad {uppdaterad}</span>
          )}
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px] sm:min-h-0"
            onClick={hamta}
            disabled={laddar}
          >
            <RefreshCw className={laddar ? "mr-1 h-3 w-3 animate-spin" : "mr-1 h-3 w-3"} />
            Uppdatera
          </Button>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Fitness = landade commits i produktion (taggade <span className="font-mono">[organ:X]</span>).
        Organ utan leverans i två ronder dör; rondens bästa organ föder ett barn (A-Ö).
        Cell föds, cell dör — de bästa överlever längst.
      </p>

      {/* OBSERVATORIET v3 (våg 139) — planeringsvyn: pågående våg, nästa i kön */}
      {(planering.vagRader.length > 0 || planering.nasta.length > 0) && (
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Radar className="h-4 w-4 text-gold" aria-hidden />
            <h4 className="font-serif font-bold">Observatoriet v3 — planering</h4>
            {planering.vagRader.length > 0 && (
              <Badge variant="secondary" className="text-[10px] tabular-nums">
                våg: {vagLevererade}/{planering.vagRader.length} levererade
              </Badge>
            )}
          </div>

          {/* Pågående våg — agenter, filer, status med filbevis */}
          {planering.vagRader.length > 0 && (
            <>
              <p className="mt-2 text-sm font-semibold leading-snug">{planering.vagTitel}</p>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                      <th className="py-1.5 pr-3">Block</th>
                      <th className="py-1.5 pr-3">Uppgift</th>
                      <th className="py-1.5 pr-3">Utdatafil</th>
                      <th className="py-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planering.vagRader.map((r) => (
                      <tr key={r.block} className="border-b border-border/50 align-top">
                        <td className="py-1.5 pr-3 font-semibold whitespace-nowrap">{r.block}</td>
                        <td className="max-w-[16rem] py-1.5 pr-3 leading-snug text-foreground/80">
                          <span className="line-clamp-2">{r.uppdrag}</span>
                        </td>
                        <td className="py-1.5 pr-3 font-mono text-[10px] leading-snug text-muted-foreground">
                          {r.utdatafil.split(/[,+]/)[0]?.trim() ?? r.utdatafil}
                        </td>
                        <td className="py-1.5 whitespace-nowrap">
                          {r.commit !== null ? (
                            <Badge className="bg-emerald-600 text-[10px] text-white">
                              LEVERERAD {r.commit}
                            </Badge>
                          ) : r.filFinns ? (
                            <Badge className="bg-amber-500 text-[10px] text-background">
                              fil på disk
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">{r.status}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Nästa i kön — med varför-rader */}
          {planering.nasta.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Nästa i kön
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {planering.nasta.map((n, i) => (
                  <li key={i} className="text-xs leading-relaxed">
                    <span className="mr-1">{n.markering}</span>
                    <span className="font-semibold">{n.uppdrag}</span>
                    {n.varfor !== "" && (
                      <span className="text-muted-foreground"> — {n.varfor}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Senaste landningar — organismens faktiska leveranser */}
      {landningar.length > 0 && (
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <GitCommitHorizontal className="h-4 w-4 text-gold" aria-hidden />
            <h4 className="font-serif font-bold">Senaste landningar</h4>
          </div>
          <ul className="mt-2 space-y-1">
            {landningar.map((l) => (
              <li key={l.hash} className="flex flex-wrap items-baseline gap-x-2 text-xs">
                <span className="font-mono text-[10px] text-gold">{l.hash}</span>
                <span className="text-[10px] tabular-nums text-muted-foreground">{l.tid}</span>
                <span className="min-w-0 flex-1 leading-snug">{l.amne}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Bästa organet */}
      {basta && (
        <Card className="flex flex-wrap items-center gap-3 border-gold/40 bg-gold/5 p-4">
          <Trophy className="h-5 w-5 shrink-0 text-gold" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-serif font-bold">
              Bästa organet: {basta.bokstav} — {basta.namn}
            </p>
            <p className="text-xs text-muted-foreground">
              {basta.leveranserSista2[0] ?? 0} leveranser senaste ronden · {basta.totaltLeveranser} totalt
            </p>
          </div>
          {basta.foralder && (
            <Badge variant="outline" className="border-gold/30 text-gold">
              barn av {basta.foralder}
            </Badge>
          )}
        </Card>
      )}

      {/* Organ-grid */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {aktiva.map((o) => {
          const lev = o.leveranserSista2[0] ?? 0;
          return (
            <Card
              key={o.bokstav}
              className={"p-4 " + (lev === 0 ? " border-border" : " border-gold/30")}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-serif text-xl font-bold text-gold">{o.bokstav}</span>
                <span className={"text-xs font-bold tabular-nums " + (lev > 0 ? "text-gold" : "text-muted-foreground")}>
                  {lev} leveranser
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold leading-snug">{o.namn}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {o.uppdrag}
              </p>
              <p className="mt-2 text-[10px] text-muted-foreground">
                född {o.fodd ?? "?"} · {o.totaltLeveranser} totalt
                {o.foralder ? ` · barn av ${o.foralder}` : ""}
              </p>
            </Card>
          );
        })}
        {aktiva.length === 0 && !laddar && (
          <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
            Registret är tomt — första rondens evolution skapar fröorganen.
          </p>
        )}
      </div>

      {/* Döda organ — obduktioner */}
      {doda.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Skull className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden />
            <h4 className="font-serif font-bold">Obduktioner (döda organ)</h4>
          </div>
          <ul className="mt-2 space-y-1.5">
            {doda.map((o) => (
              <li key={o.bokstav} className="flex flex-wrap items-baseline gap-x-2 text-xs">
                <span className="font-serif text-sm font-bold text-red-600 dark:text-red-400">
                  {o.bokstav} {o.namn}
                </span>
                <span className="text-muted-foreground">
                  levde {o.fodd}–{o.dod} · {o.obduktion}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Evolutionens historia */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Baby className="h-4 w-4 text-gold" aria-hidden />
          <h4 className="font-serif font-bold">Evolutionens historia</h4>
          <Badge variant="secondary" className="text-[10px]">
            {totaltCommits} commits i synfältet
          </Badge>
        </div>
        <div className="mt-3 space-y-1.5">
          {historik.map((h) => (
            <div key={h.rond} className="flex flex-wrap items-baseline gap-x-2 text-xs">
              <span className="w-16 font-semibold tabular-nums">Rond {h.rond}</span>
              <span className="tabular-nums">{h.commits} commits</span>
              {h.fodd.length > 0 && (
                <span className="text-gold">född: {h.fodd.join(", ")}</span>
              )}
              {h.doda.length > 0 && (
                <span className="text-red-600 dark:text-red-400">död: {h.doda.join(", ")}</span>
              )}
              {h.commits === 0 && h.fodd.length === 0 && h.doda.length === 0 && (
                <span className="text-muted-foreground">(tyst rond)</span>
              )}
            </div>
          ))}
          {historik.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Historiken byggs av ronder — första posten kommer efter nästa evolution.
            </p>
          )}
        </div>
      </Card>

      {/* 24/7-pumparna — live-loggar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <HeartPulse className="h-4 w-4 text-gold" aria-hidden />
          <h4 className="font-serif font-bold">24/7-pumparna (live)</h4>
          <ShieldCheck className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span className="text-xs text-muted-foreground">
            självläkande: kilad turn ⇒ omstart + mål återställs
          </span>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          {[
            { titel: "Styrelseronden (var 3:e h)", rader: data?.pumper.rond ?? [] },
            { titel: "Målhjärtslaget (var 10:e min)", rader: data?.pumper.hjartslag ?? [] },
            { titel: "Gränsnittsvakten (var 6:e h)", rader: data?.pumper.vakt ?? [] },
          ].map((p) => (
            <div key={p.titel} className="rounded-lg border border-border bg-card p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {p.titel}
              </p>
              <pre className="mt-1.5 max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-[10px] leading-relaxed text-foreground/80">
                {p.rader.length > 0 ? p.rader.join("\n") : "(väntar på första körningen)"}
              </pre>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
