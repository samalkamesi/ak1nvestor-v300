"use client";

import * as React from "react";

import {
  Brain,
  CheckCircle2,
  ChevronRight,
  FilePen,
  Loader2,
  MessageCircleQuestion,
  Pencil,
  RefreshCw,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * STUDIO-MINNE-PANEL — Minne 🧠-drawern i /studio (VÅG 84 STUDIO 100x
 * byggblock D: ARBETSMINNE + KUNSKAPSBAS). Renderas av studio-chat.tsx som
 * en höger drawer i exakt filträdets stil (marin #0D1B31 + guld).
 *
 * ALL logik (state + fetch) ägs av studio-chat.tsx — panelen är
 * presentationsyta + Escape-hantering, mottagen som ett props-objekt.
 * API-kontrakt: GET/PUT/DELETE /api/studio/minne (requireAdmin;
 * namnvalidering ^[a-z0-9\-]+\.md$ på servern — MEMORY.md blockerad för
 * radering, AGENTS.md = arbetsytans stående instruktioner).
 *
 * Vyer:
 *   · LISTA — alla minnesfiler (namn + beskrivning ur frontmatter + tid),
 *     MEMORY.md märkt INDEX, AGENTS.md märkt AGENTS.MD; saknas AGENTS.md
 *     visas en Skapa-ruta (stående instruktioner utan att chatta).
 *   · DETALJ — klicka fil → läsbar markdown (frontmatter avlägsnad) +
 *     REDIGERA (textarea, råtext inkl. frontmatter) + RADERA (confirm +
 *     backup-notis i .minnes-backup/); indexet kan ej raderas.
 *   · NY — namnfält (client-sanerat) + frontmatter-mall + Skapa.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Minnesfilnamn — samma mönster som servern validerar. */
const MINNES_NAMN_RE = /^[a-z0-9][a-z0-9\-]*\.md$/;

/** Mall för AGENTS.md (Skapa-rutan när filen saknas). */
export const AGENTS_MALL = [
  "---",
  "description: Stående instruktioner till agenten i denna arbetsyta",
  "---",
  "",
  "# Instruktioner till agenten (AGENTS.md)",
  "",
  "Det agenten ska veta/lämna sig till i VARJE session — utan att kunden",
  "behöver chatta fram det. Exempel:",
  "",
  "- Svara alltid på svenska.",
  "- Pedagogisk plattform — aldrig investeringsråd.",
  "",
].join("\n");

/** En minnesfil ur GET /api/studio/minne (lista ≤ 8 kB / detalj = full). */
export interface MinneFil {
  namn: string;
  storlek: number;
  uppdaterad?: number;
  /** Ur frontmatter (description:) — VAD agenten minns. */
  beskrivning?: string;
  typ: "index" | "agents" | "minne";
  innehåll: string;
  trunkerad?: boolean;
}

/** Props från studio-chat.tsx — allt state + alla actions ägs där. */
export interface MinnePanelProps {
  oppen: boolean;
  stang: () => void;
  /** Uppdatera listan (GET /api/studio/minne). */
  lasa: () => void | Promise<void>;
  filer: MinneFil[] | null;
  laddar: boolean;
  fel: string;
  rotVisning: string;
  vald: MinneFil | null;
  detaljLaddar: boolean;
  redigerar: boolean;
  text: string;
  sparar: boolean;
  raderar: boolean;
  ny: boolean;
  nyttNamn: string;
  setVald: (v: MinneFil | null) => void;
  setRedigerar: (v: boolean) => void;
  setText: (v: string) => void;
  setNy: (v: boolean) => void;
  setNyttNamn: (v: string) => void;
  /** Öppna EN fil (GET ?namn= — full text). */
  oppnaFil: (namn: string) => void | Promise<void>;
  /** PUT {namn, innehåll} — true vid lyckat sparande. */
  spara: (namn: string, innehåll: string) => Promise<boolean>;
  /** DELETE {namn} — confirm sköts av ägaren (studio-chat). */
  radera: (namn: string) => void | Promise<void>;
}

/** Frontmatter av för läsbar markdownvy (visar kroppen utan --- blocket). */
function rensaFrontmatter(text: string): string {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trimStart();
}

/** Formattera bytes läsbart (15 360 → "15 kB") — panelens egna (fristående). */
function byteStorlek(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} kB`;
  return `${n} B`;
}

/** Kompakt relativ tid ur epoch-ms ("nu" · "5 min" · "3 h" · "2 d"). */
function tidSenMs(ms?: number): string {
  if (typeof ms !== "number") return "";
  const min = Math.floor((Date.now() - ms) / 60_000);
  if (min < 1) return "nu";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const dagar = Math.floor(h / 24);
  if (dagar < 7) return `${dagar} d`;
  return new Date(ms).toLocaleDateString("sv-SE", { day: "numeric", month: "short" });
}

// ── Läsbar markdown (komprimerad tolkning i panelens egen stil) ──────────────

/** Inline: fet, kod, kursiv — panelen öppnar aldrig länkar åt agentens räkning. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const ut: React.ReactNode[] = [];
  const segments = text.split(/(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/g);
  segments.forEach((seg, i) => {
    if (!seg) return;
    if (seg.startsWith("**") && seg.endsWith("**")) {
      ut.push(<strong key={`${keyPrefix}-b${i}`}>{seg.slice(2, -2)}</strong>);
    } else if (seg.startsWith("`") && seg.endsWith("`") && seg.length > 2) {
      ut.push(
        <code key={`${keyPrefix}-c${i}`} className="rounded-sm bg-white/10 px-1 py-0.5 font-mono text-[0.85em]">
          {seg.slice(1, -1)}
        </code>,
      );
    } else if (seg.startsWith("_") && seg.endsWith("_") && seg.length > 2) {
      ut.push(<em key={`${keyPrefix}-i${i}`}>{seg.slice(1, -1)}</em>);
    } else {
      ut.push(seg);
    }
  });
  return ut;
}

/** Block: rubriker (##/###), listor, stycken — minnesfilernas form. */
function MinneMarkdown({ text }: { text: string }) {
  const block = React.useMemo(() => {
    const delar: React.ReactNode[] = [];
    const rader = text.split("\n");
    let lista: string[] = [];
    const spola = (k: string) => {
      if (lista.length === 0) return;
      delar.push(
        <ul key={`ul-${k}`} className="mt-2 list-disc space-y-0.5 pl-5">
          {lista.map((l, j) => (
            <li key={j} className="leading-relaxed">
              {renderInline(l, `${k}-${j}`)}
            </li>
          ))}
        </ul>,
      );
      lista = [];
    };
    rader.forEach((rad, j) => {
      const ren = rad.trimEnd();
      if (ren.startsWith("## ")) {
        spola(`l${j}`);
        delar.push(
          <h3 key={`h-${j}`} className="mt-3 font-serif text-base font-bold text-[#EDE6D6]">
            {renderInline(ren.slice(3), `h${j}`)}
          </h3>,
        );
      } else if (ren.startsWith("### ")) {
        spola(`l${j}`);
        delar.push(
          <h4 key={`h4-${j}`} className="mt-2 font-serif text-sm font-bold text-[#EDE6D6]">
            {renderInline(ren.slice(4), `h4${j}`)}
          </h4>,
        );
      } else if (/^[-*] /.test(ren)) {
        lista.push(ren.slice(2));
      } else if (ren === "") {
        spola(`l${j}`);
      } else {
        spola(`l${j}`);
        delar.push(
          <p key={`p-${j}`} className="mt-2 leading-relaxed first:mt-0">
            {renderInline(ren, `p${j}`)}
          </p>,
        );
      }
    });
    spola("sista");
    return delar;
  }, [text]);
  return <div className="text-xs text-[#EDE6D6]/90">{block}</div>;
}

// ── Panelen ──────────────────────────────────────────────────────────────────

export function StudioMinnePanel(p: MinnePanelProps) {
  // Escape: redigering → detalj → drawern (ett steg per tryck).
  React.useEffect(() => {
    if (!p.oppen) return;
    const påTangent = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (p.redigerar || p.ny) {
        p.setRedigerar(false);
        p.setNy(false);
      } else if (p.vald) {
        p.setVald(null);
      } else {
        p.stang();
      }
    };
    window.addEventListener("keydown", påTangent);
    return () => window.removeEventListener("keydown", påTangent);
  }, [p]);

  if (!p.oppen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px]"
        onClick={p.stang}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-label="Agentens minne — minnesfiler och instruktioner"
        className="fixed right-0 top-0 z-40 flex h-[100dvh] w-full max-w-[420px] flex-col border-l border-gold/30 bg-[#0D1B31] shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-gold/25 bg-black/25 px-3 py-2.5">
          <Brain className="h-4 w-4 shrink-0 text-gold" />
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-sm font-bold text-[#EDE6D6]">Minne 🧠</h2>
            <p className="truncate text-[10px] text-[#EDE6D6]/55" title={p.rotVisning}>
              {p.rotVisning ? `minne: ${p.rotVisning}` : "vad agenten kommer ihåg"}
            </p>
          </div>
          <button
            onClick={() => void p.lasa()}
            disabled={p.laddar}
            title="Uppdatera minnet"
            className="rounded-md p-1 text-[#EDE6D6]/70 transition-colors hover:bg-white/10 hover:text-[#EDE6D6] disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", p.laddar && "animate-spin")} />
          </button>
          <button
            onClick={p.stang}
            title="Stäng (Esc)"
            className="rounded-md p-1 text-[#EDE6D6]/70 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Detaljvy: en minnesfil (läsbar markdown / redigering) ── */}
        {p.vald ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center gap-2 border-b border-gold/15 bg-black/15 px-3 py-2">
              <button
                onClick={() => {
                  p.setVald(null);
                  p.setRedigerar(false);
                }}
                title="Tillbaka till listan"
                className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-[#EDE6D6]/75 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
              >
                <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                Alla minnen
              </button>
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate font-mono text-xs font-semibold text-[#EDE6D6]" title={p.vald.namn}>
                  {p.vald.namn}
                </p>
                <p className="text-[10px] text-[#EDE6D6]/55">
                  {byteStorlek(p.vald.storlek)}
                  {p.vald.uppdaterad ? ` · uppdaterad ${tidSenMs(p.vald.uppdaterad)} sedan` : ""}
                </p>
              </div>
            </div>

            {p.redigerar ? (
              <>
                <textarea
                  value={p.text}
                  onChange={(e) => p.setText(e.target.value)}
                  spellCheck={false}
                  className="min-h-0 flex-1 resize-none bg-transparent p-3 font-mono text-xs leading-relaxed text-[#EDE6D6] outline-none [scrollbar-width:thin]"
                  aria-label={`Redigera ${p.vald.namn}`}
                />
                <div className="flex items-center gap-2 border-t border-gold/25 bg-black/25 px-3 py-2">
                  <button
                    onClick={() => void p.spara(p.vald?.namn ?? "", p.text)}
                    disabled={p.sparar || p.raderar}
                    className="flex items-center gap-1 rounded-md border border-gold/40 bg-gold/10 px-2.5 py-1 text-[11px] font-semibold text-gold transition-colors hover:bg-gold/20 disabled:opacity-50"
                  >
                    {p.sparar ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                    Spara
                  </button>
                  <button
                    onClick={() => {
                      p.setText(p.vald?.innehåll ?? "");
                      p.setRedigerar(false);
                    }}
                    disabled={p.sparar}
                    className="rounded-md px-2.5 py-1 text-[11px] text-[#EDE6D6]/70 transition-colors hover:bg-white/10 hover:text-[#EDE6D6] disabled:opacity-50"
                  >
                    Avbryt
                  </button>
                  <span className="ml-auto text-[9px] text-[#EDE6D6]/40">
                    gammalt innehåll backas upp i .minnes-backup/
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 [scrollbar-width:thin]">
                  {p.detaljLaddar ? (
                    <div className="flex items-center gap-2 text-[11px] text-[#EDE6D6]/60">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
                      Läser minnesfilen…
                    </div>
                  ) : (
                    <div>
                      <MinneMarkdown text={rensaFrontmatter(p.vald.innehåll) || "(tom fil)"} />
                      {p.vald.trunkerad && (
                        <p className="mt-3 text-[10px] text-gold">
                          Förhandsvisningen är trunkerad — redigera för att se hela filen.
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 border-t border-gold/25 bg-black/25 px-3 py-2">
                  <button
                    onClick={() => {
                      p.setText(p.vald?.innehåll ?? "");
                      p.setRedigerar(true);
                    }}
                    disabled={p.raderar || p.detaljLaddar}
                    className="flex items-center gap-1 rounded-md border border-gold/40 bg-gold/10 px-2.5 py-1 text-[11px] font-semibold text-gold transition-colors hover:bg-gold/20 disabled:opacity-50"
                  >
                    <Pencil className="h-3 w-3" />
                    Redigera
                  </button>
                  {p.vald.typ === "index" ? (
                    <span
                      className="rounded-md px-2 py-1 text-[10px] text-[#EDE6D6]/45"
                      title="Agenten bygger om indexet automatiskt ur minnesfilerna — radering är blockerad"
                    >
                      Indexet byggs om av agenten — kan ej raderas
                    </span>
                  ) : (
                    <button
                      onClick={() => void p.radera(p.vald?.namn ?? "")}
                      disabled={p.raderar || p.sparar}
                      title={`Radera ${p.vald.namn} — backup-kopia sparas i .minnes-backup/ först`}
                      className="flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] text-red-300 transition-colors hover:bg-red-500/15 hover:text-red-200 disabled:opacity-50"
                    >
                      {p.raderar ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      Radera
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ) : p.ny ? (
          /* ── Ny minnesfil: namn + mall ── */
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center gap-2 border-b border-gold/15 bg-black/15 px-3 py-2">
              <button
                onClick={() => p.setNy(false)}
                title="Tillbaka till listan"
                className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-[#EDE6D6]/75 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
              >
                <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                Alla minnen
              </button>
              <p className="min-w-0 flex-1 truncate text-right font-serif text-xs font-bold text-[#EDE6D6]">
                Ny minnesfil
              </p>
            </div>
            <div className="border-b border-gold/15 px-3 py-2">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#EDE6D6]/55">
                Filnamn (a-z, 0-9, bindestreck, .md)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  value={p.nyttNamn}
                  onChange={(e) =>
                    p.setNyttNamn(e.target.value.toLowerCase().replace(/[^a-z0-9\-.]/g, ""))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && MINNES_NAMN_RE.test(p.nyttNamn)) {
                      void p.spara(p.nyttNamn, p.text);
                    }
                  }}
                  placeholder="t.ex. kundpreferenser-drift.md"
                  maxLength={80}
                  autoFocus
                  className="min-w-0 flex-1 rounded-md border border-gold/40 bg-black/30 px-2.5 py-1 font-mono text-xs text-[#EDE6D6] outline-none placeholder:text-[#EDE6D6]/40 focus:border-gold/70"
                />
                {MINNES_NAMN_RE.test(p.nyttNamn) ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-[#EDE6D6]/30" />
                )}
              </div>
              {p.filer?.some((f) => f.namn === p.nyttNamn) && (
                <p className="mt-1 text-[10px] text-red-300">Namnet finns redan — spara skriver över den filen.</p>
              )}
            </div>
            <textarea
              value={p.text}
              onChange={(e) => p.setText(e.target.value)}
              spellCheck={false}
              className="min-h-0 flex-1 resize-none bg-transparent p-3 font-mono text-xs leading-relaxed text-[#EDE6D6] outline-none [scrollbar-width:thin]"
              aria-label="Innehåll för den nya minnesfilen"
            />
            <div className="flex items-center gap-2 border-t border-gold/25 bg-black/25 px-3 py-2">
              <button
                onClick={() => void p.spara(p.nyttNamn, p.text)}
                disabled={p.sparar || !MINNES_NAMN_RE.test(p.nyttNamn)}
                className="flex items-center gap-1 rounded-md border border-gold/40 bg-gold/10 px-2.5 py-1 text-[11px] font-semibold text-gold transition-colors hover:bg-gold/20 disabled:opacity-50"
              >
                {p.sparar ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                Skapa minnesfil
              </button>
              <button
                onClick={() => p.setNy(false)}
                disabled={p.sparar}
                className="rounded-md px-2.5 py-1 text-[11px] text-[#EDE6D6]/70 transition-colors hover:bg-white/10 hover:text-[#EDE6D6] disabled:opacity-50"
              >
                Avbryt
              </button>
            </div>
          </div>
        ) : (
          /* ── Listvy: alla minnesfiler + AGENTS.md ── */
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-1.5 py-2 [scrollbar-width:thin]">
              {p.laddar && !p.filer && (
                <div className="flex items-center gap-2 px-2 py-3 text-[11px] text-[#EDE6D6]/60">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
                  Läser agentens minne…
                </div>
              )}
              {p.fel && <p className="px-2 py-3 text-[11px] text-red-300">{p.fel}</p>}
              {p.filer && p.filer.length === 0 && !p.laddar && (
                <p className="px-2 py-3 text-[11px] leading-relaxed text-[#EDE6D6]/60">
                  Agenten har inga minnesfiler ännu — skapa den första med knappen nedan.
                </p>
              )}
              <ul>
                {p.filer?.map((f) => (
                  <li key={f.namn}>
                    <button
                      onClick={() => void p.oppnaFil(f.namn)}
                      className="w-full rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white/10"
                      title={`${f.namn} — ${f.beskrivning ?? "ingen beskrivning"} (${byteStorlek(f.storlek)})`}
                    >
                      <span className="flex items-center gap-1.5">
                        {f.typ === "agents" ? (
                          <MessageCircleQuestion className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
                        ) : (
                          <Brain className="h-3.5 w-3.5 shrink-0 text-gold/80" />
                        )}
                        <span className="min-w-0 flex-1 truncate font-mono text-[11px] font-semibold text-[#EDE6D6]/90">
                          {f.typ === "agents" ? "Instruktioner till agenten" : f.namn}
                        </span>
                        {f.typ === "index" && (
                          <span className="shrink-0 rounded-full bg-gold/15 px-1.5 text-[8px] font-bold uppercase tracking-wider text-gold">
                            INDEX
                          </span>
                        )}
                        {f.typ === "agents" && (
                          <span className="shrink-0 rounded-full bg-emerald-400/15 px-1.5 text-[8px] font-bold uppercase tracking-wider text-emerald-300">
                            AGENTS.MD
                          </span>
                        )}
                        <span className="shrink-0 font-mono text-[9px] text-[#EDE6D6]/35">{tidSenMs(f.uppdaterad)}</span>
                      </span>
                      {f.beskrivning && (
                        <span className="mt-0.5 block truncate pl-5 text-[10px] leading-snug text-[#EDE6D6]/55">
                          {f.beskrivning}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              {/* AGENTS.md saknas → skapa stående instruktioner (§D:3) */}
              {p.filer && !p.filer.some((f) => f.typ === "agents") && !p.laddar && (
                <div className="mx-2 mt-3 rounded-lg border border-gold/25 bg-gold/5 p-2.5">
                  <p className="text-[10px] leading-relaxed text-[#EDE6D6]/70">
                    <span className="font-semibold text-gold">AGENTS.md finns inte ännu.</span> Skapa den för att ge
                    agenten stående instruktioner i varje session — utan att chatta.
                  </p>
                  <button
                    onClick={() => {
                      void (async () => {
                        const ok = await p.spara("AGENTS.md", AGENTS_MALL);
                        if (ok) {
                          p.setNy(false);
                          void p.oppnaFil("AGENTS.md");
                        }
                      })();
                    }}
                    disabled={p.sparar}
                    className="mt-2 flex items-center gap-1 rounded-md border border-gold/40 bg-gold/10 px-2.5 py-1 text-[10px] font-semibold text-gold transition-colors hover:bg-gold/20 disabled:opacity-50"
                  >
                    {p.sparar ? <Loader2 className="h-3 w-3 animate-spin" /> : <FilePen className="h-3 w-3" />}
                    Skapa AGENTS.md
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-gold/25 bg-black/25 px-3 py-2.5">
              <button
                onClick={() => {
                  p.setNyttNamn("");
                  p.setText(
                    [
                      "---",
                      "name: ny-minnesfil",
                      "description: Kort beskrivning av vad agenten ska minnas",
                      "metadata:",
                      "  node_type: memory",
                      "  type: project",
                      "---",
                      "",
                      "Faktum/text som agenten ska minnas — kunden kan rätta rader här.",
                      "",
                    ].join("\n"),
                  );
                  p.setVald(null);
                  p.setNy(true);
                }}
                disabled={p.laddar}
                className="flex w-full items-center justify-center gap-1 rounded-md border border-gold/40 bg-gold/10 px-2.5 py-1.5 text-[11px] font-semibold text-gold transition-colors hover:bg-gold/20 disabled:opacity-50"
              >
                <FilePen className="h-3.5 w-3.5" />
                Ny minnesfil
              </button>
              <p className="mt-2 text-[9px] leading-relaxed text-[#EDE6D6]/40">
                Radering sparar alltid en backup i .minnes-backup/ · MEMORY.md-indexet byggs om av agenten
                och kan ej raderas · ändringarna gäller direkt i agentens nästa session.
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
