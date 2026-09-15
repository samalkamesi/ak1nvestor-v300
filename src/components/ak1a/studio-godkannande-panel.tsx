"use client";

import * as React from "react";

import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Loader2,
  RefreshCw,
  UploadCloud,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * STUDIO-GODKÄNNANDE-PANEL (mega g1 — styrelsens beslut punkt 1): studions
 * "väntar-på-dig"-lista i höger panelen (samma sektion i desktop-panelen och
 * mobil-drawern). Visar FLYTTKLART granskat innehåll ur
 * GET /api/studio/godkannande — titel, typ, status, md5 och en
 * förhandsvisningsrad per post — och bär kundens två knappar:
 *
 *   · PUBLICERA (STOR, 52 px) → POST /api/studio/godkannande/publicera —
 *     R2-YTAN: kundens tryck verkställer flytten utkast → data/blogg/
 *     (efter 0-FEL-grinden på servern) och loggas i audit. Confirm-dialog
 *     före anropet — inget oavsiktligt tryck.
 *   · BEHÅLL I UTKAST → POST /api/studio/godkannande {val:"behall"} —
 *     markerar ENBART kundens val (godkannande-val.json); texten ligger
 *     kvar och kan publiceras senare.
 *
 * Självbärande komponent (egen hämtning): läs vid mount (badge-antalet),
 * uppdatering vid uppfällning + efter varje åtgärd + manuell knapp, poll
 * 60 s bara medan sektionen är öppen. Två monteringar (desktop + mobil)
 * är två oberoende läsare — listan är billig och no-store.

 * Pedagogisk plattform — inte investeringsråd.
 */

/** Post-kontraktet — speglar /api/studio/godkannande (lib/studio/godkannande.ts). */
export interface GodkannandePanelPost {
  sokvag: string;
  slug: string;
  titel: string;
  typ: "seo-guide" | "m9-serie";
  status: "FLYTTKLAR" | "FLYTTKLAR EFTER RÄTTNING";
  md5: string;
  forhandsvisning: string;
  val: { val: "behall" | "publicerad"; ts: string; slug: string; liveSokvag?: string } | null;
}

/** Svarskontraktet — speglar rutten. */
export interface GodkannandeSvar {
  hamtat: string;
  antal: number;
  poster: GodkannandePanelPost[];
  redanLive: string[];
  fel?: string;
}

/** Klockslag ur ISO-strängen ("14:07") för val-markeringarna. */
function klockslag(iso: string): string {
  const d = new Date(iso);
  return Number.isFinite(d.getTime())
    ? d.toLocaleString("sv-SE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "";
}

export function StudioGodkannandePanel() {
  const [data, setData] = React.useState<GodkannandeSvar | null>(null);
  const [laddar, setLaddar] = React.useState(false);
  const [hamtningsFel, setHamtningsFel] = React.useState("");
  const [oppen, setOppen] = React.useState(false);
  const [vald, setVald] = React.useState<string | null>(null);
  const [jobbar, setJobbar] = React.useState<string | null>(null);
  const [resultat, setResultat] = React.useState("");
  const [atgardFel, setAtgardFel] = React.useState("");

  const las = React.useCallback(async () => {
    setLaddar(true);
    try {
      const r = await fetch("/api/studio/godkannande", { cache: "no-store" });
      const j = (await r.json()) as GodkannandeSvar;
      if (!r.ok) throw new Error(j.fel || `HTTP ${String(r.status)}`);
      setData(j);
      setHamtningsFel("");
    } catch (e) {
      setHamtningsFel(e instanceof Error ? e.message : "okänt fel");
    } finally {
      setLaddar(false);
    }
  }, []);

  // Läs vid mount (badge-antalet) + poll 60 s bara medan sektionen är öppen.
  React.useEffect(() => {
    void las();
  }, [las]);
  React.useEffect(() => {
    if (!oppen) return;
    void las();
    const t = window.setInterval(() => void las(), 60_000);
    return () => window.clearInterval(t);
  }, [oppen, las]);

  const poster = data?.poster ?? [];
  const antalVantar = poster.filter((p) => !p.val).length;
  const valdPost = poster.find((p) => p.sokvag === vald) ?? null;

  /** Publicera — R2: confirm-dialog + kundens tryck → publicera-rutten. */
  const korPublicera = async (p: GodkannandePanelPost) => {
    const ok = window.confirm(
      `Publicera "${p.titel}"?\n\nDitt beslut (R2): utkastet flyttas till data/blogg/ och texten syns på sajten efter nästa driftsättning. Servern kör juridikgrinden (0 FEL krävs) och ditt tryck loggas i audit-loggen.`,
    );
    if (!ok) return;
    setJobbar(p.sokvag);
    setAtgardFel("");
    setResultat("");
    try {
      const r = await fetch("/api/studio/godkannande/publicera", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sokvag: p.sokvag }),
      });
      const j = (await r.json()) as { meddelande?: string; fel?: string };
      if (!r.ok) throw new Error(j.fel || `HTTP ${String(r.status)}`);
      setResultat(j.meddelande ?? "Publicerad!");
      setVald(null);
      await las();
    } catch (e) {
      setAtgardFel(e instanceof Error ? e.message : "Publiceringen misslyckades.");
    } finally {
      setJobbar(null);
    }
  };

  /** Behåll i utkast — markerar ENBART kundens val (flyttar aldrig filer). */
  const korBehall = async (p: GodkannandePanelPost) => {
    setJobbar(p.sokvag);
    setAtgardFel("");
    setResultat("");
    try {
      const r = await fetch("/api/studio/godkannande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sokvag: p.sokvag, val: "behall" }),
      });
      const j = (await r.json()) as { ok?: boolean; fel?: string };
      if (!r.ok) throw new Error(j.fel || `HTTP ${String(r.status)}`);
      setResultat(`Markerad: "${p.titel}" behålls i utkast — du kan publicera den senare.`);
      await las();
    } catch (e) {
      setAtgardFel(e instanceof Error ? e.message : "Markeringen misslyckades.");
    } finally {
      setJobbar(null);
    }
  };

  return (
    <section aria-label="Godkännande" className="shrink-0 border-b border-[#30363D]">
      <button
        type="button"
        onClick={() => setOppen(!oppen)}
        aria-expanded={oppen}
        title={`Godkännande — granskat innehåll som väntar på ditt beslut${oppen ? " (fäll ihop)" : " (fäll ut och läs färskt; uppdateras var 60:e s medan öppen)"}`}
        className="flex min-h-[52px] w-full items-center gap-1.5 px-3 py-2 text-left transition-colors hover:bg-[#161B22] sm:min-h-0"
      >
        {oppen ? (
          <ChevronDown className="h-3 w-3 shrink-0 text-[#8B949E]" />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0 text-[#8B949E]" />
        )}
        <ClipboardCheck className="h-3.5 w-3.5 shrink-0 text-[#8B949E]" aria-hidden />
        <span className="min-w-0 flex-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B949E]">
          Godkännande
        </span>
        {antalVantar > 0 && (
          <span
            className="shrink-0 rounded-full bg-[#238636]/15 px-1.5 font-mono text-[9px] font-bold text-[#3FB950]"
            title={`${String(antalVantar)} granskade texter väntar på ditt beslut (publicera eller behåll i utkast)`}
          >
            {String(antalVantar)}
          </span>
        )}
        {laddar && <Loader2 className="h-3 w-3 shrink-0 animate-spin text-[#58A6FF]" aria-hidden />}
      </button>

      {oppen && (
        <div className="px-3 pb-3">
          <p className="text-[10px] leading-relaxed text-[#8B949E]">
            Granskat innehåll som väntar på{" "}
            <span className="font-semibold text-[#E6EDF3]">dig</span> — publicering är ditt beslut
            (styrelseregel R2). Klicka en text för förhandsgranskning och knappar.
          </p>

          {data === null && laddar ? (
            <p className="mt-2 flex items-center gap-1.5 text-[10px] text-[#8B949E]">
              <Loader2 className="h-3 w-3 animate-spin text-[#58A6FF]" aria-hidden /> läser
              väntelistan…
            </p>
          ) : data === null ? (
            <p
              className="mt-2 font-mono text-[10px] leading-relaxed text-[#8B949E]"
              title={hamtningsFel || "godkannande-rutten svarade ej"}
            >
              kunde ej hämta —{" "}
              <button
                type="button"
                onClick={() => void las()}
                className="underline decoration-[#30363D] underline-offset-2 hover:text-[#E6EDF3]"
              >
                försök igen
              </button>
            </p>
          ) : poster.length === 0 ? (
            <p className="mt-2 text-[10px] leading-relaxed text-[#484F58]">
              Inget väntar just nu — granskningsleden har inga FLYTTKLAR-texter som saknar ditt
              beslut.
              {(data.redanLive?.length ?? 0) > 0 && (
                <span className="mt-1 block text-[#484F58]">
                  Redan publicerat via ytan: {String(data.redanLive.length)} st.
                </span>
              )}
            </p>
          ) : (
            <>
              <ul className="mt-2 max-h-[280px] space-y-1.5 overflow-y-auto [scrollbar-width:thin]">
                {poster.map((p) => {
                  const arVald = vald === p.sokvag;
                  return (
                    <li key={p.sokvag}>
                      <button
                        type="button"
                        onClick={() => {
                          setVald(arVald ? null : p.sokvag);
                          setAtgardFel("");
                          setResultat("");
                        }}
                        aria-expanded={arVald}
                        title={`${p.sokvag} · md5 ${p.md5}${p.val ? ` · markerad ${p.val.val} ${klockslag(p.val.ts)}` : ""}`}
                        className={cn(
                          "w-full rounded-md border px-2 py-1.5 text-left transition-colors",
                          arVald
                            ? "border-[#58A6FF]/60 bg-[#161B22]"
                            : "border-[#30363D] bg-[#161B22] hover:bg-[#0D1117]",
                        )}
                      >
                        <span className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider",
                              p.status === "FLYTTKLAR"
                                ? "bg-[#238636]/15 text-[#3FB950]"
                                : "bg-[#D29922]/15 text-[#D29922]",
                            )}
                          >
                            {p.status === "FLYTTKLAR" ? "flyttklar" : "klar efter rättning"}
                          </span>
                          <span className="shrink-0 rounded-full bg-[#58A6FF]/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#58A6FF]">
                            {p.typ === "m9-serie" ? "m9-serie" : "seo-guide"}
                          </span>
                          {p.val?.val === "publicerad" && (
                            <span
                              className="ml-auto flex shrink-0 items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-[#3FB950]"
                              title={`Publicerad via ytan ${klockslag(p.val.ts)}`}
                            >
                              <CheckCircle2 className="h-3 w-3" aria-hidden /> publicerad
                            </span>
                          )}
                          {p.val?.val === "behall" && (
                            <span
                              className="ml-auto shrink-0 text-[8px] font-bold uppercase tracking-wider text-[#6E7681]"
                              title={`Behållen i utkast ${klockslag(p.val.ts)} — kan publiceras senare`}
                            >
                              behållen
                            </span>
                          )}
                        </span>
                        <span className="mt-1 flex items-start gap-1.5">
                          <FileText className="mt-0.5 h-3 w-3 shrink-0 text-[#484F58]" aria-hidden />
                          <span className="min-w-0 flex-1 break-words text-[11px] font-semibold leading-snug text-[#E6EDF3]/90">
                            {p.titel}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-[9px] text-[#484F58]">
                          {p.slug} · md5 {p.md5.slice(0, 8)}
                        </span>
                        <span className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-[#8B949E]">
                          {p.forhandsvisning || "—"}
                        </span>
                      </button>

                      {/* ── Förhandsgranskning + kundens två knappar ── */}
                      {arVald && (
                        <div className="mt-1.5 rounded-md border border-[#58A6FF]/30 bg-[#0D1117] p-2">
                          <p className="text-[10px] leading-relaxed text-[#8B949E]">
                            {p.forhandsvisning || "—"}
                          </p>
                          <p
                            className="mt-1 break-all font-mono text-[9px] text-[#484F58]"
                            title={`${p.sokvag} · ${p.status} · granskningens fingeravtryck på utkastfilen`}
                          >
                            {p.sokvag} · md5 {p.md5}
                          </p>
                          <button
                            type="button"
                            onClick={() => void korPublicera(p)}
                            disabled={jobbar === p.sokvag}
                            title="DITT BESLUT (R2): flyttar utkastet till data/blogg/ — texten syns på sajten efter nästa driftsättning. Servern kör juridikgrinden (0 FEL) och trycket loggas i audit."
                            className="mt-2 flex min-h-[52px] w-full items-center justify-center gap-1.5 rounded-md bg-[#238636] px-3 text-xs font-bold text-white transition-colors hover:bg-[#2EA043] disabled:opacity-50"
                          >
                            {jobbar === p.sokvag ? (
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                            ) : (
                              <UploadCloud className="h-4 w-4" aria-hidden />
                            )}
                            Publicera
                          </button>
                          <button
                            type="button"
                            onClick={() => void korBehall(p)}
                            disabled={jobbar === p.sokvag}
                            title="Låter texten ligga kvar i utkastmappen — markeringen sparas och du kan publicera senare."
                            className="mt-1.5 flex min-h-[52px] w-full items-center justify-center gap-1.5 rounded-md border border-[#30363D] px-3 text-xs font-semibold text-[#E6EDF3] transition-colors hover:bg-[#161B22] disabled:opacity-50 sm:min-h-11"
                          >
                            {jobbar === p.sokvag ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                            ) : (
                              <ClipboardCheck className="h-3.5 w-3.5" aria-hidden />
                            )}
                            Behåll i utkast
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              {(resultat || atgardFel) && (
                <p
                  role="status"
                  className={cn(
                    "mt-2 text-[10px] leading-relaxed",
                    atgardFel ? "text-[#F85149]" : "text-[#3FB950]",
                  )}
                >
                  {atgardFel || resultat}
                </p>
              )}

              {(data.redanLive?.length ?? 0) > 0 && (
                <p
                  className="mt-2 truncate font-mono text-[9px] text-[#484F58]"
                  title={`Redan live i data/blogg/ (visas inte som väntande): ${data.redanLive.join(", ")}`}
                >
                  redan live: {String(data.redanLive.length)} st
                </p>
              )}

              <p className="mt-1.5 flex items-center justify-between gap-1.5 text-[9px] text-[#484F58]">
                <span title="Granskningsleden (protokoll i data/blogg-utkast/granskning/) sätter FLYTTKLAR — maskinen kan aldrig publicera åt dig">
                  R2: publiceringen är din
                </span>
                <button
                  type="button"
                  onClick={() => void las()}
                  disabled={laddar}
                  title="Uppdatera väntelistan (godkannande)"
                  aria-label="Uppdatera väntelistan"
                  className="rounded-md p-0.5 text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] disabled:opacity-50"
                >
                  <RefreshCw className={cn("h-3 w-3", laddar && "animate-spin")} aria-hidden />
                </button>
              </p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
