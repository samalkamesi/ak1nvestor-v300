"use client";

import * as React from "react";

import {
  Blocks,
  ChevronRight,
  Loader2,
  Plug,
  RefreshCw,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * STUDIO-FARDIGHETER-PANEL — Färdigheter ⚡-drawern i /studio (VÅG 85
 * STUDIO V3, STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 85" F2: SKILLS/PLUGINS/
 * TOOLS-panelen — "vad agenten KAN"). Renderas av studio-chat.tsx som en
 * höger drawer i exakt filträdets/Minne 🧠-stil (marin #0D1B31 + guld).
 *
 * ALL logik (state + fetch) ägs av studio-chat.tsx — panelen är
 * presentationsyta + Escape-hantering, mottagen som ett props-objekt
 * (samma kontrakt som studio-minne-panel.tsx; våg 84 D:s parallellmerge-
 * lärdom: panel-ytan i EGEN fil = minimala studio-chat-infogningar för
 * de fem parallella våg 85-agenterna).
 *
 * API-kontrakt: GET /api/studio/fardigheter (requireAdmin) → {skills,
 * plugins, mcp, transport, live, mcpVerktyg} — tre sektioner:
 *   · SKILLS — skills/referenceCatalog: varje skill som KORT med namn +
 *     beskrivning (referenceCatalog bär dem) + scope-badge.
 *   · PLUGINS — plugins/list: aktiva med GRÖN PRICK + version (under
 *     sektionen även tillgängliga utan prick).
 *   · MCP-VERKTYG — mcp/list: anslutna tjänster (t.ex. android-emulator
 *     23 verktyg) med verktygslista när protokollet bär namnen (annars
 *     verktygsantal — kartan §2 dokumenterar endast toolCount).
 *
 * VÅG 93 C3: PLUGIN-BRYTARE — när studio-chat.tsx skickar `vaxlaPlugin`
 * får varje plugin-rad en på/av-brytare (grön #238636 aktiv / grå av,
 * 52 px-tryckyta; POST /api/studio/fardigheter {plugin, aktiverad} +
 * optimistic update ägs av studio-chat.tsx). Prop saknas/GET utan
 * plugins-fält ⇒ inga brytare — befintligt läge består.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Post ur GET /api/studio/fardigheter — transportens StudioSkill-form. */
export interface FardighetSkill {
  id: string;
  namn: string;
  beskrivning?: string;
  omfattning?: string;
  sokvag?: string;
  aktiv?: boolean;
}

/** Post ur GET /api/studio/fardigheter — transportens StudioPlugin-form. */
export interface FardighetPlugin {
  id: string;
  namn: string;
  beskrivning?: string;
  version?: string;
  aktiv: boolean;
  skillAntal?: number;
  kalla?: string;
}

/** Post ur GET /api/studio/fardigheter — transportens StudioMcpServer-form. */
export interface FardighetMcp {
  namn: string;
  status: string;
  transport?: string;
  verktygAntal: number;
  fel?: string;
  uppdaterad?: string;
  verktyg?: string[];
}

/** Props från studio-chat.tsx — allt state + alla actions ägs där. */
export interface FardigheterPanelProps {
  oppen: boolean;
  stang: () => void;
  /** Uppdatera listan (GET /api/studio/fardigheter). */
  lasa: () => void | Promise<void>;
  laddar: boolean;
  fel: string;
  skills: FardighetSkill[] | null;
  plugins: FardighetPlugin[] | null;
  mcp: FardighetMcp[] | null;
  /** Summerad MCP-verktygsräkning (serverns mcpVerktyg). */
  mcpVerktyg: number;
  /**
   * VÅG 93 C3: växla plugin på/av — POST /api/studio/fardigheter
   * {plugin, aktiverad} med optimistic update (logiken i studio-chat.tsx).
   * undefined ⇒ plugin-brytare visas ej (befintligt läge består).
   */
  vaxlaPlugin?: (pluginId: string, aktiverad: boolean) => void;
  /** Id på plugin-rad som växlas just nu (spinner + spärr), null = ingen. */
  pluginVaxlarId?: string | null;
}

/** Sektionrubrik — ikon + rubrik + räknare (filträdets etikettsstil). */
function Sektion({
  ikon,
  rubrik,
  antal,
  brodtext,
}: {
  ikon: React.ReactNode;
  rubrik: string;
  antal: number | null;
  brodtext?: string;
}) {
  return (
    <div className="mb-1.5 flex items-center gap-2">
      {ikon}
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#EDE6D6]/55">{rubrik}</h3>
      {antal !== null && (
        <span className="rounded-full bg-gold/15 px-1.5 text-[9px] font-bold text-gold">{antal}</span>
      )}
      {brodtext && (
        <span className="ml-auto min-w-0 truncate text-[9px] text-[#EDE6D6]/40" title={brodtext}>
          {brodtext}
        </span>
      )}
    </div>
  );
}

/** Scope-badge per skill-scope (kartan §2: plugin | workspace | user). */
function scopeBadge(omfattning?: string): { text: string; klass: string } | null {
  switch (omfattning) {
    case "plugin":
      return { text: "PLUGIN", klass: "bg-white/10 text-[#EDE6D6]/70" };
    case "workspace":
      return { text: "ARBETSYTA", klass: "bg-white/10 text-[#EDE6D6]/70" };
    case "user":
      return { text: "ANVÄNDARE", klass: "bg-emerald-400/15 text-emerald-300" };
    default:
      return null;
  }
}

/**
 * VÅG 93 C3: plugin-brytare — grön #238636 när aktiv, grå när av; spinner
 * medan växlingen pågår (logik + POST ägs av studio-chat.tsx). Våg 90:s
 * tryckytesspråk: 44×24 px-brytare på en 52 px-hög rad.
 */
function PluginBrytare({
  aktiv,
  jobbar,
  namn,
  onVaxla,
}: {
  aktiv: boolean;
  jobbar: boolean;
  namn: string;
  onVaxla: () => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={aktiv}
      aria-label={`${aktiv ? "Stäng av" : "Aktivera"} pluginet ${namn}`}
      disabled={jobbar}
      onClick={(e) => {
        e.stopPropagation();
        onVaxla();
      }}
      title={aktiv ? `Stäng av ${namn}` : `Aktivera ${namn}`}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full border transition-colors disabled:cursor-default disabled:opacity-60",
        aktiv ? "border-[#238636] bg-[#238636]" : "border-[#30363D] bg-[#21262D]",
      )}
    >
      {jobbar ? (
        <Loader2 className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 animate-spin text-[#EDE6D6]" />
      ) : (
        <span
          className={cn(
            "absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white transition-all",
            aktiv ? "left-6" : "left-1",
          )}
        />
      )}
    </button>
  );
}

export function StudioFardigheterPanel(p: FardigheterPanelProps) {
  // Expanderad MCP-server (verktygslistan under kortet) — null = stängd.
  const [oppnadMcp, setOppnadMcp] = React.useState<string | null>(null);
  // Öppna skill-kort (id-set) — klick växler beskrivningsvyn.
  const [oppnadeSkills, setOppnadeSkills] = React.useState<Set<string>>(new Set());

  // Escape stänger drawern (MCP-expansion först, ett steg per tryck).
  React.useEffect(() => {
    if (!p.oppen) return;
    const påTangent = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (oppnadMcp) setOppnadMcp(null);
      else p.stang();
    };
    window.addEventListener("keydown", påTangent);
    return () => window.removeEventListener("keydown", påTangent);
  }, [p, oppnadMcp]);

  if (!p.oppen) return null;

  const aktivaPlugins = p.plugins?.filter((x) => x.aktiv) ?? [];
  const tillgangligaPlugins = p.plugins?.filter((x) => !x.aktiv) ?? [];
  const anslutnaMcp = p.mcp?.filter((s) => s.status === "connected") ?? [];

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px]"
        onClick={p.stang}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-label="Färdigheter — agentens skills, plugins och MCP-verktyg"
        className="fixed right-0 top-0 z-40 flex h-[100dvh] w-full max-w-[420px] flex-col border-l border-gold/30 bg-[#0D1B31] shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-gold/25 bg-black/25 px-3 py-2.5">
          <Sparkles className="h-4 w-4 shrink-0 text-gold" />
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-sm font-bold text-[#EDE6D6]">Färdigheter ⚡</h2>
            <p className="truncate text-[10px] text-[#EDE6D6]/55">
              vad agenten KAN — skills, plugins och MCP-verktyg
            </p>
          </div>
          <button
            onClick={() => void p.lasa()}
            disabled={p.laddar}
            title="Uppdatera färdigheterna"
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

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 [scrollbar-width:thin]">
          {p.laddar && !p.skills && !p.plugins && !p.mcp && (
            <div className="flex items-center gap-2 px-2 py-3 text-[11px] text-[#EDE6D6]/60">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
              Läser agentens färdigheter…
            </div>
          )}
          {p.fel && <p className="px-2 py-2 text-[11px] text-red-300">{p.fel}</p>}

          {/* ── SEKTION SKILLS — skills/referenceCatalog (kort: namn + beskrivning) ── */}
          <section className="mb-4">
            <Sektion
              ikon={<Wrench className="h-3.5 w-3.5 text-gold/80" />}
              rubrik="Skills"
              antal={p.skills ? p.skills.length : null}
              brodtext="referenceCatalog"
            />
            {p.skills && p.skills.length === 0 && !p.laddar && (
              <p className="px-1 py-2 text-[11px] leading-relaxed text-[#EDE6D6]/55">
                Agenten har inga registrerade skills i arbetsytan ännu.
              </p>
            )}
            <ul className="space-y-1">
              {p.skills?.map((s) => {
                const öppen = oppnadeSkills.has(s.id);
                const badge = scopeBadge(s.omfattning);
                return (
                  <li key={s.id}>
                    <button
                      onClick={() =>
                        setOppnadeSkills((gamla) => {
                          const nya = new Set(gamla);
                          if (nya.has(s.id)) nya.delete(s.id);
                          else nya.add(s.id);
                          return nya;
                        })
                      }
                      className={cn(
                        "w-full rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white/10",
                        s.aktiv === false && "opacity-50",
                      )}
                      title={s.sokvag ?? s.id}
                    >
                      <span className="flex items-center gap-1.5">
                        <ChevronRight
                          className={cn(
                            "h-3 w-3 shrink-0 text-[#EDE6D6]/40 transition-transform",
                            öppen && "rotate-90",
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate font-mono text-[11px] font-semibold text-[#EDE6D6]/90">
                          {s.namn}
                        </span>
                        {badge && (
                          <span className={cn("shrink-0 rounded-full px-1.5 text-[8px] font-bold uppercase tracking-wider", badge.klass)}>
                            {badge.text}
                          </span>
                        )}
                      </span>
                      {s.beskrivning && (
                        <span
                          className={cn(
                            "mt-0.5 block pl-5 text-[10px] leading-snug text-[#EDE6D6]/60",
                            !öppen && "line-clamp-2",
                          )}
                        >
                          {s.beskrivning}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* ── SEKTION PLUGINS — aktiva med grön prick + version ── */}
          <section className="mb-4">
            <Sektion
              ikon={<Blocks className="h-3.5 w-3.5 text-gold/80" />}
              rubrik="Plugins"
              antal={p.plugins ? aktivaPlugins.length : null}
              brodtext={p.plugins ? `${tillgangligaPlugins.length} tillgängliga` : "plugins/list"}
            />
            {p.plugins && p.plugins.length === 0 && !p.laddar && (
              <p className="px-1 py-2 text-[11px] leading-relaxed text-[#EDE6D6]/55">
                Inga plugins installerade i arbetsytan.
              </p>
            )}
            {p.vaxlaPlugin && p.plugins && p.plugins.length > 0 && (
              <p className="mb-1 px-1 text-[9px] leading-relaxed text-[#EDE6D6]/40">
                Brytarna slår på/stänger av pluginet direkt mot servern — verkans
                kommer agentens nästa körning.
              </p>
            )}
            <ul className="space-y-1">
              {aktivaPlugins.map((x) => (
                <li
                  key={x.id}
                  className={cn(
                    "rounded-md bg-white/5 px-2 py-1.5",
                    // VÅG 93 C3: 52 px-tryckyta när brytaren finns.
                    p.vaxlaPlugin && "min-h-[52px]",
                  )}
                  title={x.beskrivning ?? x.id}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.7)]" title="Aktiv" />
                    <span className="min-w-0 flex-1 truncate font-mono text-[11px] font-semibold text-[#EDE6D6]/90">
                      {x.namn}
                    </span>
                    {x.version && (
                      <span className="shrink-0 rounded-full bg-gold/15 px-1.5 font-mono text-[9px] font-bold text-gold">
                        v{x.version}
                      </span>
                    )}
                    {p.vaxlaPlugin && (
                      <PluginBrytare
                        aktiv={x.aktiv}
                        jobbar={p.pluginVaxlarId === x.id}
                        namn={x.namn}
                        onVaxla={() => p.vaxlaPlugin?.(x.id, !x.aktiv)}
                      />
                    )}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 pl-3.5 text-[10px] text-[#EDE6D6]/55">
                    {typeof x.skillAntal === "number" && (
                      <span>
                        {x.skillAntal} {x.skillAntal === 1 ? "skill" : "skills"}
                      </span>
                    )}
                    {x.kalla && <span className="truncate">· {x.kalla}</span>}
                  </span>
                  {x.beskrivning && (
                    <span className="mt-0.5 block pl-3.5 text-[10px] leading-snug text-[#EDE6D6]/45">
                      {x.beskrivning}
                    </span>
                  )}
                </li>
              ))}
              {tillgangligaPlugins.map((x) => (
                <li
                  key={x.id}
                  className={cn(
                    "rounded-md px-2 py-1",
                    // VÅG 93 C3: brytare ⇒ raden är åtgärdsbar (full opacitet,
                    // 52 px-tryckyta); annars befintlig dämpad visning.
                    p.vaxlaPlugin ? "min-h-[52px] py-1.5" : "opacity-55",
                  )}
                  title={`Tillgänglig men ej aktiverad — ${x.beskrivning ?? x.id}`}
                >
                  <span className="flex min-h-[24px] items-center gap-1.5">
                    <span className="h-2 w-2 shrink-0 rounded-full border border-[#EDE6D6]/40" title="Ej aktiverad" />
                    <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-[#EDE6D6]/80">{x.namn}</span>
                    {x.version && (
                      <span className="shrink-0 rounded-full bg-white/10 px-1.5 font-mono text-[9px] text-[#EDE6D6]/60">
                        v{x.version}
                      </span>
                    )}
                    {p.vaxlaPlugin && (
                      <PluginBrytare
                        aktiv={x.aktiv}
                        jobbar={p.pluginVaxlarId === x.id}
                        namn={x.namn}
                        onVaxla={() => p.vaxlaPlugin?.(x.id, !x.aktiv)}
                      />
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* ── SEKTION MCP-VERKTYG — anslutna tjänster med verktygslista ── */}
          <section>
            <Sektion
              ikon={<Plug className="h-3.5 w-3.5 text-gold/80" />}
              rubrik="MCP-verktyg"
              antal={p.mcp ? anslutnaMcp.length : null}
              brodtext={p.mcp ? `${p.mcpVerktyg} verktyg anslutna` : "mcp/list"}
            />
            {p.mcp && p.mcp.length === 0 && !p.laddar && (
              <p className="px-1 py-2 text-[11px] leading-relaxed text-[#EDE6D6]/55">
                Inga MCP-servrar anslutna till agenten.
              </p>
            )}
            <ul className="space-y-1">
              {p.mcp?.map((s) => {
                const ansluten = s.status === "connected";
                const öppen = oppnadMcp === s.namn;
                return (
                  <li key={s.namn} className="rounded-md bg-white/5">
                    <button
                      onClick={() => setOppnadMcp(öppen ? null : s.namn)}
                      className="w-full px-2 py-1.5 text-left transition-colors hover:bg-white/10"
                      title={
                        s.fel
                          ? s.fel
                          : `${s.namn} — ${s.status}${s.transport ? ` (${s.transport})` : ""}, ${s.verktygAntal} verktyg`
                      }
                    >
                      <span className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "h-2 w-2 shrink-0 rounded-full",
                            ansluten
                              ? "bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.7)]"
                              : "bg-red-400/80",
                          )}
                          title={ansluten ? "Ansluten" : `Nere: ${s.fel ?? s.status}`}
                        />
                        <span className="min-w-0 flex-1 truncate font-mono text-[11px] font-semibold text-[#EDE6D6]/90">
                          {s.namn}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-1.5 text-[9px] font-bold",
                            ansluten ? "bg-emerald-400/15 text-emerald-300" : "bg-red-400/15 text-red-300",
                          )}
                        >
                          {ansluten ? `${s.verktygAntal} verktyg` : "nere"}
                        </span>
                        <ChevronRight
                          className={cn(
                            "h-3 w-3 shrink-0 text-[#EDE6D6]/40 transition-transform",
                            öppen && "rotate-90",
                          )}
                        />
                      </span>
                    </button>
                    {öppen && (
                      <div className="border-t border-gold/15 px-3 py-1.5">
                        {s.transport && (
                          <p className="text-[9px] uppercase tracking-wider text-[#EDE6D6]/40">
                            transport: {s.transport}
                            {s.uppdaterad ? ` · uppdaterad ${new Date(s.uppdaterad).toLocaleString("sv-SE")}` : ""}
                          </p>
                        )}
                        {s.fel && <p className="mt-1 text-[10px] text-red-300">{s.fel}</p>}
                        {s.verktyg && s.verktyg.length > 0 ? (
                          <ul className="mt-1 max-h-44 space-y-0.5 overflow-y-auto [scrollbar-width:thin]">
                            {s.verktyg.map((v) => (
                              <li key={v} className="truncate font-mono text-[10px] text-[#EDE6D6]/70" title={v}>
                                {v}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-1 text-[10px] leading-relaxed text-[#EDE6D6]/45">
                            {ansluten
                              ? `${s.verktygAntal} verktyg anslutna — protokollets mcp/list bär antalet (kartan §2); namnlistan visas när protokollet levererar den.`
                              : "Inga verktyg — servern är ej ansluten."}
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <div className="border-t border-gold/25 bg-black/25 px-3 py-2.5">
          <p className="text-[9px] leading-relaxed text-[#EDE6D6]/40">
            Källor: skills/referenceCatalog · plugins/list · mcp/list (protokollkartan §2 —
            LIVE-testade 2026-09-09). Skills visar VAD agenten kan göra; plugins är
            verktygsutbyggningar; MCP-servrar ansluter externa tjänster.
          </p>
        </div>
      </aside>
    </>
  );
}
