"use client";

import * as React from "react";
import Link from "next/link";

import {
  Bot,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleStop,
  Diff,
  Download,
  FilePen,
  FileText,
  FileArchive,
  FileImage,
  FolderSearch,
  FolderTree,
  FolderUp,
  Globe,
  History,
  Link2,
  ListChecks,
  Loader2,
  MessageCircleQuestion,
  Paperclip,
  Pencil,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Shrink,
  SquarePen,
  Target,
  Terminal,
  Trash2,
  UploadCloud,
  Wrench,
  X,
  XCircle,
} from "lucide-react";

import { adminHeaders, adminJsonHeaders } from "@/lib/admin-klient";
import { kommandoHjalp, parsaKommando } from "@/lib/studio/kommandon";
import { VarumarkesLogo } from "@/components/ak1a/varumarkes-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * STUDIO-CHAT — /studio:s webchat-mot-Y (VÅG 81 WEBCHAT-STUDIO,
 * STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 81", kunddirektiv "exceptionell design,
 * uppmana allt — bilder till mappar, exakt som Z, max kapacitet").
 *
 * DNA: paper-botten, marin rubrikrad med VarumarkesLogo, guld-accenter,
 * serif-rubriker. Meddelanden: användare marin vänster / agent paper höger
 * med guldkant. Markdown enligt bloggens egen tolkning (## rubriker,
 * listor, inline länk/fet/kursiv — utökad med ```-kodblock eftersom agenten
 * skriver kod). Mobil-först: sticky composer, kompakt marinrad.
 *
 * STRÖM: POST /api/studio/stream {prompt} → SSE-events (status/delta/
 * verktyg/klart/fel/kontext) läses med fetch+reader (EventSource kan ej
 * POST). UPLOADS: POST /api/studio/uppladdning multipart — drag-och-släpp
 * på hela ytan, paste-bild i skrivfältet, filknapp, mappknapp
 * (webkitdirectory → relativa sökvägar följer med → servern
 * rekonstruerar mappstrukturen). Klickbara chips infogar "Titta på
 * uploads/..." i prompten.
 *
 * VÅG 82 STUDIO V2 ("Z-portalen i molnet"): MODELLRULLISTA i headern
 * (GET/POST /api/studio/modeller — listan härledd ur zcode-config.json,
 * aldrig hårdkodad; byte = kassera + session/create MED model-param,
 * protokollväg bevisad i tool-results/v82-protokoll.md) + KONTEXTRAD
 * "📊 X tkn denna runda · ~Y totalt · Z % av taket" (klart-eventets
 * tokenCount + session/read-projektionen via kontext-SSE-eventet;
 * protokollets contextWindow = taket, 1M endast reserv) med
 * guld-varning ≥ 80 % + knappar "Ny session"/"Komprimera"
 * (session/compact är bevisat stött) + sessionslista (session/list).
 *
 * VÅG 83 MEGA B4 (STUDIO=Z — "Z-portaLens fysiska yta"): FILTRÄD över
 * agentens arbetsyta (GET /api/studio/filer — maxdjup 3, 500 noder,
 * node_modules/.next/.git/uploads exkludera) i höger drawer: klicka mapp
 * = öppna/stäng, klicka fil = förhandsgranskning (text/kod monospace
 * ≤ 20 kB, bilder som <img>, övrigt = nedladdningslänk) + uploads-sektion
 * med datum och "Töm uploads" (DELETE /api/studio/filer). BILDER I
 * CHATTEN: hänvisar ett användarmeddelande till en uppladdad bild
 * ("uploads/<datum>/<namn>.png" — sökvägen finns i uploads/) visas
 * miniatyrer direkt i bubblan via &bild=1 (säker serving, admin-cookie).
 * SNABBKOMMANDON: rad som börjar med "/" parsas LOKALT före sändning
 * (src/lib/studio/kommandon.ts) — /help /ny /modell <id> /komprimera
 * /filer; API-vägarna anropar bryggan, resten är lokal hjälp.
 *
 * VÅG 83 MEGA B1 (STUDIO=Z — Z-portalens kärna): KOMPLETT STREAMING-
 * VISUALISERING. Varje verktygskall = EXPANDBART KORT i chattflödet
 * (SSE-typ "verktyg_kort" ur tool.updated: "▶ Bash: ls uploads/" → klicka
 * ut för argument+resultat i monospace; ikon per verktyg; spinner medan
 * verktyget kör (korts steg planerad/startar/kör); fel RÖTT). LIVE-INPUT
 * ("verktyg_input" ur model.streaming tool_input_delta) visar agentens
 * argument MEDAN de skrivs ("läser fil X…"). Rundstatistik ("runda" ur
 * turn.started/completed: varaktighet + resultatTyp + verktygsantal) i
 * bubblans fot. DIFF: "ändringar" (SSE efter klart + GET /api/studio/
 * andringar) renderar "Ändringar"-panelen per turn — +N GRÖNT / −N RÖTT
 * per fil, klicka ut filen för rad-diff (Write → +N rader, Edit → exakt
 * −N/+N ur old_string/new_string; v4/conversation/fileChanges = dokumenterad
 * uppgraderingsväg i studio-transport.ts).
 *
 * VÅG 83 MEGA B2 (STUDIO=Z — Z-portaLens GODKÄNANDEFLÖDE): PERMISSION-
 * DIALOG i chattflödet (SSE-typ "interaktion" ur protokollets server→
 * klient-request interaction/requestPermission): marin kort med verktygs-
 * namn + risk-badge + argument-summary + knapparna ur eventets options —
 * Tillåt en gång / Tillåt för projektet / Neka (allow_project ⇒ protokoll-
 * svaret permissionUpdates addRules). Svaret går via POST /api/studio/
 * interaktion; "interaktionsKlar" stänger kortet (t.ex. eskalering när
 * inget svar kom inom 30 s — sessionen hänger aldrig). FRÅGEKORT (interaction/
 * requestUserInput): prompt + svarsalternativ-knappar (choices) ELLER
 * fritext + Svara/Avbryt. LÄGESVÄXLARE (session/setMode — build/plan) +
 * TANKESTYRKA (session/setThoughtLevel — nothink/high/max) som dropdowns
 * bredvid modellrullistan (POST /api/studio/session {action:"läge"|
 * "tankestyrka"}). E2E-AVGRÄNSNING: i build-läge auto-godkänner servern
 * låg/medel risk (protokollkartan §3) — dialogen visas när läget kräver
 * det (t.ex. plan); hela kedjan är körbar i dev via mockens simulerade
 * dialog.
 *
 * SKYDD: sidan (page.tsx) visar lås-vy; API-rutterna kräver admin — här
 * bär adminHeaders() lösenordet i lösenordsläget (session-cookien åker
 * med automatiskt). INGA hemligheter renderas.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── Typer ────────────────────────────────────────────────────────────────────

// ── VÅG 83 B1: verktygskort + ändringar + rundstatistik ─────────────────────

/** Ett verktygskalls livscykelkort i chattflödet (merge:as på id). */
interface VerktygKort {
  /** Protokollets toolCallId (eller transportens fallback-id). */
  id: string;
  namn: string;
  steg: "planerad" | "startar" | "kör" | "resultat" | "fel";
  /** Argument som JSON-sträng (truncat av transporten). */
  argument?: string;
  beskrivning?: string;
  resultat?: string;
  fel?: string;
  varaktighetMs?: number;
  /** Live-progress (elapsedMs + stdout/stderr-svans). */
  framsteg?: { elapsedMs?: number; utdata?: string };
  /** Ackumulerad live-input (model.streaming tool_input_delta). */
  liveInput?: string;
  /** Expanderat läge (klick på kortet). */
  öppen?: boolean;
}

/** Filändring i turnens "Ändringar"-panel — ±N rader per fil. */
interface Filandring {
  sokvag: string;
  plus: number;
  minus: number;
  rader: { typ: "+" | "-"; text: string }[];
  /** Expanderat läge (klick på filraden). */
  öppen?: boolean;
}

/** Rundstatistik ur turn.started/turn.completed (bubblans fot). */
interface RundStatistik {
  varaktighetMs?: number;
  resultatTyp?: string;
  verktygAntal?: number;
}

interface Meddelande {
  id: string;
  roll: "user" | "assistant";
  text: string;
  /** Strömmar pågående (agentbubbla utan guldkant-fade). */
  strömmande?: boolean;
  /** V83 B1: verktygskort i ankomstordning (merge på id). */
  verktygKort?: VerktygKort[];
  /** V83 B1: senaste turnens filändringar (ändringar-SSE/GET). */
  ändringar?: Filandring[];
  /** V83 B1: rundstatistik (varaktighet · resultat · verktyg). */
  rundStatistik?: RundStatistik;
  fel?: boolean;
}

interface Uppladdning {
  sokvag: string;
  typ: string;
  storlek: number;
}

/** Modellpost ur GET /api/studio/modeller (härledd ur config.json — aldrig hårdkodad). */
interface ModellPost {
  id: string;
  namn: string;
}

/** Kontextsanning ur session/read-projektionen (via /api/studio/stream). */
interface KontextInfo {
  modell?: string;
  contextUsed?: number;
  contextWindow?: number;
  totalTokenCount?: number;
  turnCount?: number;
  /** V83 B2: projection.mode — lägesväxlarens sanning. */
  lage?: string;
  /** V83 B2: settings.thoughtLevel.current — tankestyrkans sanning. */
  tankeNiva?: string;
}

// ── VÅG 83 B2: Z-portaLens interaktioner (permission + fråga) ────────────────

/** Alternativ i permission-dialogens options[] (optionId + visningsnamn). */
interface PermissionAlternativ {
  optionId: string;
  namn: string;
  beskrivning?: string;
}

/** Väntande permission-dialog (interaction/requestPermission). */
interface PermissionDialog {
  requestId: string;
  verktyg: string;
  risk: string;
  skäl?: string;
  sammanfattning: string;
  alternativ: PermissionAlternativ[];
}

/** Väntande frågekort (interaction/requestUserInput). */
interface FragaDialog {
  requestId: string;
  fråga: string;
  inputTyp?: string;
  val?: string[];
}

/** UI-etiketter för protokollets bevisade optionId (kartan §3). */
const PERMISSION_ETIKETT: Record<string, string> = {
  allow_once: "Tillåt en gång",
  allow_project: "Tillåt för projektet",
  deny: "Neka",
};

/** Risk-badge-färg per riskLevel (low/medium/high/critical, kartan §3). */
function riskFarg(risk: string): string {
  switch (risk) {
    case "low":
      return "bg-emerald-400/15 text-emerald-300";
    case "medium":
      return "bg-gold/15 text-gold";
    case "high":
      return "bg-orange-400/15 text-orange-300";
    case "critical":
      return "bg-red-500/20 text-red-300";
    default:
      return "bg-white/10 text-[#EDE6D6]/70";
  }
}

/** Post ur GET /api/studio/session (session/list, v83 B3-berikad). */
interface SessionPost {
  sessionId: string;
  titel?: string;
  status?: string;
  arbetsyta?: string;
  uppdaterad?: string;
  /** v83 B3: qBe.model ur session/list ("zai/glm-5.3"). */
  modell?: string;
  /** v83 B3: projection.turnCount (session/read-berikning). */
  turns?: number;
  /** v83 B3: projection.totalTokenCount (session/read-berikning). */
  tokens?: number;
}

/** v83 B3: bakgrundsagent ur session/subagents (körande + avslutade). */
interface SubagentPost {
  barnSessionId: string;
  titel: string;
  typ?: string;
  status: string;
  startad?: string;
  avslutad?: string;
  sammanfattning?: string;
}

/** v83 B3: workspaceinfo ur workspace/readState (via GET /api/studio/session). */
interface ArbetsytaInfo {
  arbetsyta: string;
  lage?: string;
  modell?: string;
  tankeNiva?: string;
  behorighet?: string;
  modellerTillgangliga?: number;
  kommandon?: number;
}

interface StreamEvent {
  typ:
    | "hej"
    | "status"
    | "delta"
    | "verktyg"
    | "verktyg_kort"
    | "verktyg_input"
    | "runda"
    | "interaktion"
    | "interaktionsKlar"
    | "klart"
    | "fel"
    | "kontext"
    | "ändringar";
  kanal?: "text" | "tankar";
  text?: string;
  namn?: string;
  händelse?: "start" | "slut";
  svar?: string;
  meddelande?: string;
  transport?: string;
  sessionId?: string | null;
  tokenCount?: number;
  kontext?: KontextInfo | null;
  // ── V83 B1: verktygskort + live-input + runda + ändringar ──
  id?: string;
  steg?: "planerad" | "startar" | "kör" | "resultat" | "fel";
  argument?: string;
  beskrivning?: string;
  resultat?: string;
  fel?: string;
  varaktighetMs?: number;
  framsteg?: { elapsedMs?: number; utdata?: string };
  fas?: "start" | "slut";
  resultatTyp?: string;
  verktygAntal?: number;
  filer?: Filandring[];
  // ── V83 B2: interaktioner (permission + fråga) ──
  interaktion?:
    | ({
        typ: "permission";
        requestId: string;
        verktyg: string;
        risk: string;
        skäl?: string;
        sammanfattning: string;
        alternativ: PermissionAlternativ[];
      } & { val?: undefined; fråga?: undefined; inputTyp?: undefined })
    | ({
        typ: "fråga";
        requestId: string;
        fråga: string;
        inputTyp?: string;
        val?: string[];
      } & { verktyg?: undefined; risk?: undefined; skäl?: undefined; sammanfattning?: undefined; alternativ?: undefined });
  requestId?: string;
  beslut?: string;
  skäl?: string;
}

/** KVD-reservtak när protokollet tiger (zai/GLM svarade 200 000 vid v82-beviset). */
const KONTEXT_TAK_RESERV = 1_000_000;
/** Guld-varningströskel (KVD: kontext-optimering > 80 % av taket). */
const KONTEXT_VARNING_PROCENT = 80;

/** Formattera tokens kompakt (12 345 → "12,3k"). */
function tkn(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

/** Formattera bytes läsbart (15 360 → "15 kB"). */
function byteStorlek(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} kB`;
  return `${n} B`;
}

// ── VÅG 83 B3: tidsformat + agentstatus-badge ──────────────────────────────

/** Kompakt relativ tid ("nu" · "5 min" · "3 h" · "2 d" · annars datum). */
function tidSen(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 16).replace("T", " ");
  const min = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (min < 1) return "nu";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const dagar = Math.floor(h / 24);
  if (dagar < 7) return `${dagar} d`;
  return d.toLocaleDateString("sv-SE", { day: "numeric", month: "short" });
}

/** Badge-färg per subagent-status (session/subagents). */
function agentStatusFarg(status: string): string {
  switch (status) {
    case "running":
      return "bg-emerald-400/15 text-emerald-300";
    case "waiting":
      return "bg-gold/15 text-gold";
    case "blocked":
      return "bg-red-400/15 text-red-300";
    case "success":
      return "bg-emerald-400/10 text-emerald-300/80";
    case "failed":
    case "lost":
      return "bg-red-500/10 text-red-300/80";
    default:
      return "bg-white/10 text-[#EDE6D6]/60"; // cancelled m.fl.
  }
}

/** Svensk etikett per subagent-status. */
function agentStatusText(status: string): string {
  const tabell: Record<string, string> = {
    running: "kör",
    waiting: "väntar",
    blocked: "blockerad",
    success: "klar",
    failed: "fel",
    cancelled: "avbruten",
    lost: "förlorad",
  };
  return tabell[status] ?? status;
}

// ── VÅG 83 B4: filträd + bildminiatyrer ─────────────────────────────────────

/** Nod ur GET /api/studio/filer (trädgren 1). */
interface TradNod {
  namn: string;
  typ: "mapp" | "fil";
  storlek: number;
  sokvag: string;
  barn?: TradNod[];
}

/** Svar ur GET /api/studio/filer?sokvag=… (förhandsgranskningsgren). */
interface FilVisning {
  namn: string;
  sokvag: string;
  typ?: string;
  storlek: number;
  andrad?: number;
  forhandsgranskning:
    | { slag: "text"; innehåll: string }
    | { slag: "bild"; url: string }
    | { slag: "nedladdning"; url: string; orsak?: string }
    | { slag: "blockerad"; meddelande: string }
    | { slag: "mapp" };
  fel?: string;
}

/**
 * Bildreferenser i en text — matchar agentens upload-sökvägar
 * ("uploads/<datum>/<namn>.png"). Dedupe i tur- och ordning. Existens
 * verifieras av servern (trasig bild gömmer sig via onError).
 */
function bildRefsUrText(text: string): string[] {
  const ut: string[] = [];
  const re = /uploads\/[\w\-./ ]+?\.(?:png|jpe?g|webp|gif)\b/gi;
  for (const träff of text.matchAll(re)) {
    const sokvag = träff[0].trim().replace(/\/+$/, "");
    if (sokvag && !ut.includes(sokvag)) ut.push(sokvag);
  }
  return ut;
}

/** Säker bild-URL mot filer-rutten (admin-cookien åker med automatiskt). */
function bildUrl(sokvag: string): string {
  return `/api/studio/filer?sokvag=${encodeURIComponent(sokvag)}&bild=1`;
}

// ── Markdown (bloggens tolkning + kodblock) ──────────────────────────────────

/** Inline-markdown → noder (samma mönster som blogg-spegel-sida.tsx). */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const ut: React.ReactNode[] = [];
  const segments = text.split(
    /(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*|`[^`]+`|_[^_]+_|\*[^*\n]+\*)/g,
  );
  segments.forEach((seg, i) => {
    if (!seg) return;
    if (seg.startsWith("[") && seg.includes("](")) {
      const label = seg.slice(1, seg.indexOf("]"));
      const href = seg.slice(seg.indexOf("](") + 2, -1);
      // Endast säkra protokoll — aldrig javascript: m.fl.
      const säker = /^(https?:\/\/|\/|#)/i.test(href);
      ut.push(
        säker ? (
          <Link key={`${keyPrefix}-a${i}`} href={href} className="text-gold underline hover:opacity-80" target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>
            {label}
          </Link>
        ) : (
          <span key={`${keyPrefix}-a${i}`}>{label}</span>
        ),
      );
    } else if (seg.startsWith("**") && seg.endsWith("**")) {
      ut.push(<strong key={`${keyPrefix}-b${i}`}>{seg.slice(2, -2)}</strong>);
    } else if (seg.startsWith("`") && seg.endsWith("`") && seg.length > 2) {
      ut.push(
        <code key={`${keyPrefix}-c${i}`} className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.85em]">
          {seg.slice(1, -1)}
        </code>,
      );
    } else if ((seg.startsWith("_") && seg.endsWith("_")) || (seg.startsWith("*") && seg.endsWith("*"))) {
      ut.push(<em key={`${keyPrefix}-i${i}`}>{seg.slice(1, -1)}</em>);
    } else {
      ut.push(seg);
    }
  });
  return ut;
}

/** Block-markdown: kodblock, rubriker, listor, stycken. */
function StudioMarkdown({ text }: { text: string }) {
  const block = React.useMemo(() => {
    const delar: React.ReactNode[] = [];
    // Dela på kodblock först (``` ... ```).
    const segment = text.split(/```/);
    segment.forEach((seg, i) => {
      if (i % 2 === 1) {
        // Kodblock: första raden kan vara språktagg.
        const rader = seg.replace(/^\n/, "").split("\n");
        const första = rader[0]?.trim() ?? "";
        const sprak = /^[a-zA-Z0-9+-]{0,20}$/.test(första) && första !== "" ? första : "";
        const kropp = (sprak ? rader.slice(1) : rader).join("\n").replace(/\n$/, "");
        delar.push(
          <pre
            key={`kod-${i}`}
            className="mt-3 overflow-x-auto rounded-md border border-gold/20 bg-muted/70 p-3 font-mono text-xs leading-relaxed"
          >
            {sprak && <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gold">{sprak}</div>}
            <code>{kropp}</code>
          </pre>,
        );
        return;
      }
      // Vanliga block: rubriker, listor, stycken.
      const rader = seg.split("\n");
      let listBuffert: string[] = [];
      const spolaLista = (nyckel: string) => {
        if (listBuffert.length === 0) return;
        delar.push(
          <ul key={nyckel} className="mt-3 list-disc space-y-1 pl-5">
            {listBuffert.map((l, j) => (
              <li key={j} className="leading-relaxed">
                {renderInline(l, `${nyckel}-${j}`)}
              </li>
            ))}
          </ul>,
        );
        listBuffert = [];
      };
      rader.forEach((rad, j) => {
        const ren = rad.trimEnd();
        if (ren.startsWith("## ")) {
          spolaLista(`l${i}-${j}`);
          delar.push(
            <h3 key={`h-${i}-${j}`} className="mt-4 font-serif text-lg font-bold">
              {renderInline(ren.slice(3), `h${i}-${j}`)}
            </h3>,
          );
        } else if (ren.startsWith("### ")) {
          spolaLista(`l${i}-${j}`);
          delar.push(
            <h4 key={`h4-${i}-${j}`} className="mt-3 font-serif text-base font-bold">
              {renderInline(ren.slice(4), `h4${i}-${j}`)}
            </h4>,
          );
        } else if (/^[-*] /.test(ren)) {
          listBuffert.push(ren.slice(2));
        } else if (ren === "") {
          spolaLista(`l${i}-${j}`);
        } else {
          spolaLista(`l${i}-${j}`);
          delar.push(
            <p key={`p-${i}-${j}`} className="mt-3 leading-relaxed first:mt-0">
              {renderInline(ren, `p${i}-${j}`)}
            </p>,
          );
        }
      });
      spolaLista(`sista-${i}`);
    });
    return delar;
  }, [text]);
  return <div className="text-sm">{block}</div>;
}

// ── VÅG 83 B4: filträdsrad (rekursiv) ───────────────────────────────────────

/** Filikon per ändelse (bilder/arkiv/text — guldtonad som resten av ytan). */
function filIkon(namn: string): React.ReactNode {
  const andelse = namn.toLowerCase().split(".").pop() ?? "";
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(andelse)) {
    return <FileImage className="h-3.5 w-3.5 shrink-0 text-gold/80" />;
  }
  if (andelse === "zip") return <FileArchive className="h-3.5 w-3.5 shrink-0 text-gold/80" />;
  return <FileText className="h-3.5 w-3.5 shrink-0 text-gold/60" />;
}

/** En rad i filträdet — mapp växlar öppen/stängd, fil öppnar förhandsgranskning. */
function TradRad({
  nod,
  djup,
  oppna,
  onVaxla,
  onFil,
}: {
  nod: TradNod;
  djup: number;
  oppna: Set<string>;
  onVaxla: (sokvag: string) => void;
  onFil: (sokvag: string) => void;
}): React.JSX.Element {
  if (nod.typ === "mapp") {
    const arOppen = oppna.has(nod.sokvag);
    return (
      <div>
        <button
          onClick={() => onVaxla(nod.sokvag)}
          className="flex w-full items-center gap-1 rounded-md px-1.5 py-1 text-left text-[12px] text-[#EDE6D6]/90 transition-colors hover:bg-white/10"
          style={{ paddingLeft: 6 + djup * 14 }}
          title={nod.sokvag}
        >
          {arOppen ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gold" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gold" />
          )}
          <span className="truncate font-medium">{nod.namn}</span>
        </button>
        {arOppen &&
          nod.barn?.map((b) => (
            <TradRad key={b.sokvag} nod={b} djup={djup + 1} oppna={oppna} onVaxla={onVaxla} onFil={onFil} />
          ))}
      </div>
    );
  }
  return (
    <button
      onClick={() => onFil(nod.sokvag)}
      className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[12px] text-[#EDE6D6]/75 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
      style={{ paddingLeft: 10 + djup * 14 }}
      title={`${nod.sokvag} — ${byteStorlek(nod.storlek)}`}
    >
      {filIkon(nod.namn)}
      <span className="min-w-0 flex-1 truncate">{nod.namn}</span>
      <span className="shrink-0 font-mono text-[9px] text-[#EDE6D6]/35">{byteStorlek(nod.storlek)}</span>
    </button>
  );
}

// ── VÅG 83 B1: verktygskortets rubrik, ikon, tid + kort-/diff-komponenter ───

/** Formattera millisekunder läsbart (1234 → "1,2 s"; 456 → "456 ms"). */
function msText(ms: number): string {
  if (ms >= 1000) return (ms / 1000).toFixed(1).replace(".", ",") + " s";
  return Math.round(ms) + " ms";
}

/** Verktygsikon per namn (Bash=terminal, Read=filsymbol, Write=penndokument…). */
function verktygsIkon(namn: string): React.ReactNode {
  const n = namn.toLowerCase();
  if (n === "bash" || n.includes("terminal")) return <Terminal className="h-3.5 w-3.5 shrink-0 text-gold/80" />;
  if (n.startsWith("read")) return <FileText className="h-3.5 w-3.5 shrink-0 text-gold/80" />;
  if (n.startsWith("write") || n === "edit" || n === "multiedit" || n.includes("notebook")) {
    return <FilePen className="h-3.5 w-3.5 shrink-0 text-gold/80" />;
  }
  if (n.includes("grep")) return <Search className="h-3.5 w-3.5 shrink-0 text-gold/80" />;
  if (n.includes("glob")) return <FolderSearch className="h-3.5 w-3.5 shrink-0 text-gold/80" />;
  if (n.includes("todo")) return <ListChecks className="h-3.5 w-3.5 shrink-0 text-gold/80" />;
  if (n.includes("websearch")) return <Globe className="h-3.5 w-3.5 shrink-0 text-gold/80" />;
  if (n.includes("webfetch") || n.includes("fetch")) return <Link2 className="h-3.5 w-3.5 shrink-0 text-gold/80" />;
  return <Wrench className="h-3.5 w-3.5 shrink-0 text-gold/70" />;
}

/**
 * Kortrubrik av argumenten: plockar det mest läsbara fältet ur JSON:en —
 * "Bash: ls uploads/", "Read: src/lib/…", "Grep: finans*". Faller på
 * beskrivning, sedan första raden, sedan bara namnet.
 */
function kortRubrik(kort: VerktygKort): string {
  if (kort.argument) {
    try {
      const p = JSON.parse(kort.argument) as Record<string, unknown>;
      for (const nyckel of ["command", "file_path", "path", "pattern", "url", "query", "prompt", "description"]) {
        const v = p[nyckel];
        if (typeof v === "string" && v) {
          const kortV = v.length > 72 ? v.slice(0, 72) + "…" : v;
          return kort.namn + ": " + kortV;
        }
      }
    } catch {
      // rå text — första raden nedan
    }
    const första = kort.argument.split("\n")[0];
    if (första && första !== kort.argument) return kort.namn + ": " + (första.length > 72 ? första.slice(0, 72) + "…" : första);
  }
  if (kort.beskrivning) return kort.namn + ": " + kort.beskrivning.slice(0, 72);
  return kort.namn;
}

/** Status-ikon höger i kortet: spinner kör / bock klar / kryss rött fel. */
function kortStatus(kort: VerktygKort): React.ReactNode {
  if (kort.steg === "fel") return <XCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />;
  if (kort.steg === "resultat") return <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />;
  return <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-gold" />;
}

/**
 * Verktygskortet — expanderbar rad i agentbubblan. Kollapsad: ▶ + ikon +
 * rubrik + status; live-input syns guld-tonat även kollapsat ("läser fil
 * X…"). Expanderad: argument + live-progress + resultat/fel i monospace.
 */
function VerktygsKortVy({
  kort,
  onVaxla,
}: {
  kort: VerktygKort;
  onVaxla: (id: string) => void;
}): React.JSX.Element {
  const kör = kort.steg === "planerad" || kort.steg === "startar" || kort.steg === "kör";
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border text-left",
        kort.steg === "fel" ? "border-red-500/40 bg-red-500/5" : "border-gold/25 bg-muted/40",
      )}
    >
      <button
        onClick={() => onVaxla(kort.id)}
        className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left transition-colors hover:bg-muted/70"
        title={kort.beskrivning ?? kortRubrik(kort)}
      >
        {kort.öppen ? (
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        )}
        {verktygsIkon(kort.namn)}
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] leading-tight text-foreground/90">
          {kortRubrik(kort)}
        </span>
        {typeof kort.varaktighetMs === "number" && !kör && (
          <span className="shrink-0 font-mono text-[9px] text-muted-foreground/70">{msText(kort.varaktighetMs)}</span>
        )}
        {kortStatus(kort)}
      </button>
      {/* Live-input medan agenten skriver argumenten — syns även kollapsat. */}
      {kör && kort.liveInput && (
        <p className="truncate border-t border-gold/15 px-2.5 py-1 font-mono text-[10px] leading-tight text-gold/90">
          {kort.liveInput.slice(-96)}
          <span className="ml-0.5 inline-block h-3 w-[2px] animate-pulse bg-gold align-text-bottom" />
        </p>
      )}
      {kort.öppen && (
        <div className="space-y-2 border-t border-gold/15 px-2.5 py-2">
          {kort.argument && (
            <div>
              <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">Argument</p>
              <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-muted/70 p-2 font-mono text-[10px] leading-relaxed">{kort.argument}</pre>
            </div>
          )}
          {kör && kort.framsteg?.utdata && (
            <div>
              <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Live{typeof kort.framsteg.elapsedMs === "number" ? " · " + msText(kort.framsteg.elapsedMs) : ""}
              </p>
              <pre className="max-h-24 overflow-auto whitespace-pre-wrap break-words rounded bg-muted/70 p-2 font-mono text-[10px] leading-relaxed">{kort.framsteg.utdata}</pre>
            </div>
          )}
          {kort.resultat && (
            <div>
              <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">Resultat</p>
              <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words rounded bg-muted/70 p-2 font-mono text-[10px] leading-relaxed">{kort.resultat}</pre>
            </div>
          )}
          {kort.fel && (
            <div>
              <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-red-500/80">Fel</p>
              <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words rounded bg-red-500/10 p-2 font-mono text-[10px] leading-relaxed text-red-600 dark:text-red-400">{kort.fel}</pre>
            </div>
          )}
          {!kort.argument && !kort.resultat && !kort.fel && !kort.framsteg?.utdata && (
            <p className="text-[10px] text-muted-foreground/60">Väntar på att verktyget ska börja…</p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Ändringspanelen per turn — filrader med +N (grönt) / −N (rött), klicka
 * ut filen för rad-diff i monospace (grönt/rött per rad).
 */
function AndringsPanel({
  andringar,
  onVaxlaFil,
}: {
  andringar: Filandring[];
  onVaxlaFil: (sokvag: string) => void;
}): React.JSX.Element {
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-gold/25 bg-muted/30">
      <p className="flex items-center gap-1.5 border-b border-gold/15 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
        <Diff className="h-3.5 w-3.5 text-gold" />
        Ändringar denna rundan ({andringar.length} {andringar.length === 1 ? "fil" : "filer"})
      </p>
      <ul>
        {andringar.map((f) => (
          <li key={f.sokvag} className="border-b border-gold/10 last:border-b-0">
            <button
              onClick={() => onVaxlaFil(f.sokvag)}
              className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left transition-colors hover:bg-muted/60"
              title={f.sokvag}
            >
              {f.öppen ? (
                <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
              )}
              <FilePen className="h-3 w-3 shrink-0 text-gold/70" />
              <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground/90">
                {f.sokvag.split("/").slice(-2).join("/")}
              </span>
              <span className="shrink-0 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">+{f.plus}</span>
              <span className="shrink-0 font-mono text-[10px] font-bold text-red-600 dark:text-red-400">−{f.minus}</span>
            </button>
            {f.öppen && f.rader.length > 0 && (
              <pre className="max-h-64 overflow-auto border-t border-gold/10 bg-muted/60 px-2.5 py-1.5 font-mono text-[10px] leading-relaxed">
                {f.rader.map((r, i) => (
                  <span
                    key={i}
                    className={cn(
                      "block whitespace-pre-wrap break-all",
                      r.typ === "+" ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400",
                    )}
                  >
                    {r.typ === "+" ? "+" : "−"} {r.text || " "}
                  </span>
                ))}
              </pre>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Huvudkomponent ───────────────────────────────────────────────────────────

let idRäknare = 0;
const nyttId = () => `m${++idRäknare}-${Date.now().toString(36)}`;

export function StudioChat({ hem }: { hem: () => void }) {
  const [meddelanden, setMeddelanden] = React.useState<Meddelande[]>([]);
  const [prompt, setPrompt] = React.useState("");
  const [strömmar, setStrömmar] = React.useState(false);
  const [statusText, setStatusText] = React.useState("Ansluter…");
  const [tankar, setTankar] = React.useState("");
  const [live, setLive] = React.useState<"live" | "demo" | "ned">("ned");
  const [uppladdningar, setUppladdningar] = React.useState<Uppladdning[]>([]);
  const [laddarUpp, setLaddarUpp] = React.useState(false);
  const [draÖver, setDraÖver] = React.useState(false);

  // ── V2 STUDIO: modellval + kontextrad + sessioner ─────────────────────────
  const [modeller, setModeller] = React.useState<ModellPost[]>([]);
  const [valdModell, setValdModell] = React.useState("");
  const [byterModell, setByterModell] = React.useState(false);
  const [kontext, setKontext] = React.useState<KontextInfo | null>(null);
  const [rundaTkn, setRundaTkn] = React.useState<number | null>(null);
  const [ackumulerat, setAckumulerat] = React.useState(0);
  const [sessioner, setSessioner] = React.useState<SessionPost[]>([]);
  const [visaSessioner, setVisaSessioner] = React.useState(false);
  const [sessionJobbar, setSessionJobbar] = React.useState<"" | "ny" | "compact" | "resume" | "stang">("");
  const [toast, setToast] = React.useState<{ text: string; ton: "guld" | "fel" } | null>(null);

  // ── VÅG 83 B3: sessions- och workspace-hantering (Z-portaLens) ──────────
  const [aktivSession, setAktivSession] = React.useState("");
  const [mal, setMal] = React.useState<string | null>(null);
  const [malRedigerar, setMalRedigerar] = React.useState(false);
  const [malText, setMalText] = React.useState("");
  const [malSparar, setMalSparar] = React.useState(false);
  const [subagenter, setSubagenter] = React.useState<SubagentPost[]>([]);
  const [visaAgenter, setVisaAgenter] = React.useState(false);
  const [agenterLaddar, setAgenterLaddar] = React.useState(false);
  const [agenterFel, setAgenterFel] = React.useState("");
  const [arbetsytaInfo, setArbetsytaInfo] = React.useState<ArbetsytaInfo | null>(null);

  // ── VÅG 83 B4: filträd + förhandsgranskning ──────────────────────────────
  const [visaFiler, setVisaFiler] = React.useState(false);
  const [trad, setTrad] = React.useState<TradNod[] | null>(null);
  const [tradLaddar, setTradLaddar] = React.useState(false);
  const [tradFel, setTradFel] = React.useState("");
  const [tradTrunkerad, setTradTrunkerad] = React.useState(false);
  const [arbetsytaNamn, setArbetsytaNamn] = React.useState("");
  const [oppnaMappar, setOppnaMappar] = React.useState<Set<string>>(new Set());
  const [filVisning, setFilVisning] = React.useState<FilVisning | null>(null);
  const [visningLaddar, setVisningLaddar] = React.useState(false);
  const [tommerUploads, setTommerUploads] = React.useState(false);

  // ── VÅG 83 B2: Z-portaLens — dialoger + läge/tankestyrka ─────────────────
  const [permission, setPermission] = React.useState<PermissionDialog | null>(null);
  const [fraga, setFraga] = React.useState<FragaDialog | null>(null);
  const [fragSvar, setFragSvar] = React.useState("");
  const [svarJobbar, setSvarJobbar] = React.useState(false);
  const [lage, setLage] = React.useState("");
  const [tanka, setTanka] = React.useState("");
  const [lageJobbar, setLageJobbar] = React.useState(false);

  const blattraRef = React.useRef<HTMLDivElement | null>(null);
  const ytaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const filInputRef = React.useRef<HTMLInputElement | null>(null);
  const mappInputRef = React.useRef<HTMLInputElement | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  /** Bekräftelse-toast — försvinner av sig själv efter 4,5 s. */
  const visaToast = React.useCallback((text: string, ton: "guld" | "fel" = "guld") => {
    setToast({ text, ton });
    window.setTimeout(() => setToast((t) => (t?.text === text ? null : t)), 4_500);
  }, []);

  /**
   * Uppdatera sessionlistan (GET /api/studio/session) — v83 B3: bär även
   * aktiv session, målet (session/goal) och workspaceinfo (readState).
   */
  const lasSessioner = React.useCallback(async () => {
    try {
      const res = await fetch("/api/studio/session", { headers: adminHeaders() });
      if (res.ok) {
        const data = (await res.json()) as {
          sessioner?: SessionPost[];
          aktiv?: string | null;
          mal?: { mal: string | null; meddelande: string } | null;
          arbetsyta?: ArbetsytaInfo | null;
        };
        if (data.sessioner) setSessioner(data.sessioner);
        if (typeof data.aktiv === "string") setAktivSession(data.aktiv);
        if (data.mal) setMal(data.mal.mal);
        if (data.arbetsyta) setArbetsytaInfo(data.arbetsyta);
      }
    } catch {
      // listan är lyx
    }
  }, []);

  /** Uppdatera modellistan + aktuell modell (GET /api/studio/modeller). */
  const lasModeller = React.useCallback(async () => {
    try {
      const res = await fetch("/api/studio/modeller", { headers: adminHeaders() });
      if (res.ok) {
        const data = (await res.json()) as { modeller?: ModellPost[]; standard?: string; vald?: string };
        if (data.modeller) setModeller(data.modeller);
        setValdModell(data.vald ?? data.standard ?? "");
      }
    } catch {
      // modellistan är lyx i dev (mock) — livsviktig på prod
    }
  }, []);

  // Auto-scroll vid nya bitar (mjukt — bara när användaren är nära botten).
  React.useEffect(() => {
    const yta = blattraRef.current;
    if (!yta) return;
    const näraBotten = yta.scrollHeight - yta.scrollTop - yta.clientHeight < 220;
    if (näraBotten) yta.scrollTop = yta.scrollHeight;
  }, [meddelanden, tankar, statusText, permission, fraga]);

  // Uppstart: status + historik + kontext + modeller + sessioner + uploads.
  React.useEffect(() => {
    let levande = true;
    (async () => {
      try {
        const res = await fetch("/api/studio/stream", { headers: adminHeaders() });
        if (res.ok) {
          const data = (await res.json()) as {
            transport?: string;
            live?: boolean;
            historik?: { roll: "user" | "assistant"; text: string }[];
            kontext?: KontextInfo | null;
            interaktioner?: (
              | {
                  typ: "permission";
                  requestId: string;
                  verktyg: string;
                  risk: string;
                  skäl?: string;
                  sammanfattning: string;
                  alternativ: PermissionAlternativ[];
                }
              | { typ: "fråga"; requestId: string; fråga: string; inputTyp?: string; val?: string[] }
            )[];
          };
          if (!levande) return;
          setLive(data.live ? (data.transport === "mock" ? "demo" : "live") : "ned");
          setStatusText(data.live ? (data.transport === "mock" ? "Demo-läge (mock-transport)" : "Sessionen lever") : "Agenten kunde ej nås");
          if (data.historik?.length) {
            setMeddelanden(
              data.historik.map((h) => ({ id: nyttId(), roll: h.roll, text: h.text })),
            );
          }
          if (data.kontext) {
            setKontext(data.kontext);
            if (typeof data.kontext.totalTokenCount === "number") {
              setAckumulerat(data.kontext.totalTokenCount);
            }
            // V83 B2: läge + tankestyrka ur sessionens projektion/snapshot —
            // växlarna startar på protokollets sanning (fallback build/av).
            setLage(data.kontext.lage ?? "build");
            setTanka(data.kontext.tankeNiva ?? "");
          }
          // V83 B2: väntande dialoger efter t.ex. en siduppdatering mitt i
          // en permission-väntan — kortet återkommer direkt.
          for (const i of data.interaktioner ?? []) {
            if (i.typ === "permission") {
              setPermission({
                requestId: i.requestId,
                verktyg: i.verktyg,
                risk: i.risk,
                skäl: i.skäl,
                sammanfattning: i.sammanfattning,
                alternativ: i.alternativ ?? [],
              });
            } else {
              setFraga({ requestId: i.requestId, fråga: i.fråga, inputTyp: i.inputTyp, val: i.val });
              setFragSvar("");
            }
          }
        } else if (res.status === 401) {
          if (levande) setStatusText("Logga in igen — sessionen har löpt ut.");
        }
      } catch {
        if (levande) setStatusText("Nätverksfel — agenten kunde ej nås.");
      }
      void lasModeller();
      void lasSessioner();
      // V83 B1: senaste turnens filändringar — visas på sista agentbubblan
      // även efter omladdning (GET /api/studio/andringar).
      try {
        const res = await fetch("/api/studio/andringar", { headers: adminHeaders() });
        if (res.ok) {
          const data = (await res.json()) as { filer?: Filandring[] };
          if (levande && Array.isArray(data.filer) && data.filer.length > 0) {
            setMeddelanden((alla) => {
              for (let i = alla.length - 1; i >= 0; i--) {
                if (alla[i].roll === "assistant") {
                  const kopia = [...alla];
                  kopia[i] = { ...alla[i], ändringar: data.filer };
                  return kopia;
                }
              }
              return alla;
            });
          }
        }
      } catch {
        // diff vid uppslag är lyx
      }
      try {
        const res = await fetch("/api/studio/uppladdning", { headers: adminHeaders() });
        if (res.ok) {
          const data = (await res.json()) as { filer?: (Uppladdning & { andrad?: number })[] };
          // GET svarar med sökväg relativt uploads-roten ("<datum>/<namn>") —
          // normalisera till agentens fulla relativa sökväg "uploads/…".
          if (levande && data.filer) {
            setUppladdningar(
              data.filer.map((f) => ({
                ...f,
                sokvag: f.sokvag.startsWith("uploads/") ? f.sokvag : `uploads/${f.sokvag}`,
              })),
            );
          }
        }
      } catch {
        // uploads-listan är lyx
      }
    })();
    return () => {
      levande = false;
    };
  }, [lasModeller, lasSessioner]);

  // ── V2 STUDIO: modellbyte / ny session / komprimering ─────────────────────

  const bytModell = React.useCallback(
    async (modellId: string) => {
      if (!modellId || modellId === valdModell || byterModell || strömmar) return;
      const namn = modeller.find((m) => m.id === modellId)?.namn ?? modellId;
      setByterModell(true);
      try {
        const res = await fetch("/api/studio/modeller", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ modell: modellId }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          sessionId?: string;
          modell?: string;
          fel?: string;
        };
        if (res.ok && data.sessionId) {
          setValdModell(modellId);
          setMeddelanden([]); // frisk session — historiken lever kvar i sessionslistan
          setKontext(null);
          setRundaTkn(null);
          setAckumulerat(0);
          visaToast(`Modell bytt till ${data.modell ?? namn} — ny session skapad`);
          void lasSessioner();
        } else {
          visaToast(data.fel || "Modellbytet misslyckades.", "fel");
        }
      } catch {
        visaToast("Nätverksfel under modellbytet.", "fel");
      } finally {
        setByterModell(false);
      }
    },
    [modeller, strömmar, visaToast, lasSessioner, valdModell, byterModell],
  );

  const startaNySession = React.useCallback(async () => {
    if (sessionJobbar || strömmar) return;
    setSessionJobbar("ny");
    try {
      const res = await fetch("/api/studio/session", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ action: "ny" }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        sessionId?: string;
        kontext?: KontextInfo | null;
        fel?: string;
      };
      if (res.ok && data.sessionId) {
        setMeddelanden([]);
        setKontext(data.kontext ?? null);
        setRundaTkn(null);
        setAckumulerat(data.kontext?.totalTokenCount ?? 0);
        visaToast("Ny session — frisk kontext (1M-fönstret börjar om)");
        void lasSessioner();
      } else {
        visaToast(data.fel || "Kunde ej skapa ny session.", "fel");
      }
    } catch {
      visaToast("Nätverksfel — kunde ej skapa ny session.", "fel");
    } finally {
      setSessionJobbar("");
    }
  }, [sessionJobbar, strömmar, visaToast, lasSessioner]);

  const komprimera = React.useCallback(async () => {
    if (sessionJobbar || strömmar) return;
    setSessionJobbar("compact");
    setStatusText("Komprimerar kontexten…");
    try {
      const res = await fetch("/api/studio/session", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ action: "compact" }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        status?: "klar" | "redan_körs" | "tom";
        meddelande?: string;
        kontext?: KontextInfo | null;
        fel?: string;
      };
      if (res.ok) {
        if (data.kontext) {
          setKontext(data.kontext);
          setAckumulerat(data.kontext.totalTokenCount ?? 0);
        }
        visaToast(data.meddelande ?? "Kontexten komprimerad.");
      } else {
        visaToast(data.fel || "Komprimeringen misslyckades.", "fel");
      }
    } catch {
      visaToast("Nätverksfel under komprimeringen.", "fel");
    } finally {
      setSessionJobbar("");
      setStatusText(live === "demo" ? "Demo-läge (mock-transport)" : "Sessionen lever");
    }
  }, [sessionJobbar, strömmar, visaToast, live]);

  // ── VÅG 83 B3: sessions- och workspace-hantering (Z-portaLens) ──────────

  /**
   * Öppna session ur listan (session/resume) — chatten fylls med historiken
   * via session/messages och kontextraden får sessionens projektion.
   */
  const oppnaSessionen = React.useCallback(
    async (sessionId: string) => {
      if (sessionJobbar || strömmar) return;
      setSessionJobbar("resume");
      try {
        const res = await fetch("/api/studio/session", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ action: "resume", sessionId }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          sessionId?: string;
          historik?: { roll: "user" | "assistant"; text: string }[];
          kontext?: KontextInfo | null;
          fel?: string;
        };
        if (res.ok && data.sessionId) {
          setMeddelanden(
            (data.historik ?? []).map((h) => ({ id: nyttId(), roll: h.roll, text: h.text })),
          );
          setKontext(data.kontext ?? null);
          setRundaTkn(null);
          setAckumulerat(data.kontext?.totalTokenCount ?? 0);
          visaToast(`Sessionen öppnad — ${data.historik?.length ?? 0} meddelanden ur historiken`);
          void lasSessioner();
        } else {
          visaToast(data.fel || "Kunde ej öppna sessionen.", "fel");
        }
      } catch {
        visaToast("Nätverksfel — kunde ej öppna sessionen.", "fel");
      } finally {
        setSessionJobbar("");
      }
    },
    [sessionJobbar, strömmar, visaToast, lasSessioner],
  );

  /** Stäng session (session/close) — lever kvar i listan men svarar ej. */
  const stangSessionen = React.useCallback(
    async (sessionId: string) => {
      if (sessionJobbar || strömmar) return;
      setSessionJobbar("stang");
      try {
        const res = await fetch("/api/studio/session", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ action: "stang", sessionId }),
        });
        const data = (await res.json().catch(() => ({}))) as { stangd?: boolean; fel?: string };
        if (res.ok && data.stangd) {
          if (sessionId === aktivSession) {
            // Den aktiva stängdes — chatten töms; nästa prompt föder frisk session.
            setMeddelanden([]);
            setKontext(null);
            setRundaTkn(null);
            setAckumulerat(0);
            setMal(null);
          }
          visaToast("Sessionen stängd — finns kvar i listan (arkiverad).");
          void lasSessioner();
        } else {
          visaToast(data.fel || "Kunde ej stänga sessionen.", "fel");
        }
      } catch {
        visaToast("Nätverksfel — kunde ej stänga sessionen.", "fel");
      } finally {
        setSessionJobbar("");
      }
    },
    [sessionJobbar, strömmar, visaToast, lasSessioner, aktivSession],
  );

  /** Spara målet (session/goal set — visas i headern om satt). */
  const sparaMal = React.useCallback(async () => {
    const texten = malText.trim();
    if (!texten || malSparar) return;
    setMalSparar(true);
    try {
      const res = await fetch("/api/studio/session", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ action: "malSatt", mal: texten }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        mal?: string | null;
        meddelande?: string;
        fel?: string;
      };
      if (res.ok) {
        setMal(typeof data.mal === "string" ? data.mal : texten);
        setMalRedigerar(false);
        visaToast(data.meddelande || "Målet satt.");
      } else {
        visaToast(data.fel || "Målet kunde ej sparas.", "fel");
      }
    } catch {
      visaToast("Nätverksfel — målet kunde ej sparas.", "fel");
    } finally {
      setMalSparar(false);
    }
  }, [malText, malSparar, visaToast]);

  /** Rensa målet (session/goal clear). */
  const rensaMaler = React.useCallback(async () => {
    if (malSparar) return;
    setMalSparar(true);
    try {
      const res = await fetch("/api/studio/session", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ action: "malRensa" }),
      });
      const data = (await res.json().catch(() => ({}))) as { meddelande?: string; fel?: string };
      if (res.ok) {
        setMal(null);
        setMalRedigerar(false);
        visaToast(data.meddelande || "Målet rensat.");
      } else {
        visaToast(data.fel || "Målet kunde ej rensas.", "fel");
      }
    } catch {
      visaToast("Nätverksfel — målet kunde ej rensas.", "fel");
    } finally {
      setMalSparar(false);
    }
  }, [malSparar, visaToast]);

  /** Hämta bakgrundsagenter (session/subagents). */
  const lasAgenter = React.useCallback(async () => {
    setAgenterLaddar(true);
    setAgenterFel("");
    try {
      const res = await fetch("/api/studio/session", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ action: "subagenter" }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        subagenter?: SubagentPost[];
        fel?: string;
      };
      if (res.ok && Array.isArray(data.subagenter)) {
        setSubagenter(data.subagenter);
      } else {
        setAgenterFel(data.fel || "Bakgrundsagenterna kunde ej listas.");
      }
    } catch {
      setAgenterFel("Nätverksfel — bakgrundsagenterna kunde ej listas.");
    } finally {
      setAgenterLaddar(false);
    }
  }, []);

  /** Avbryt bakgrundstask (session/cancelBackgroundTask). */
  const avbrytAgent = React.useCallback(
    async (taskId: string) => {
      try {
        const res = await fetch("/api/studio/session", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ action: "avbrytTask", taskId }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          avbruten?: boolean;
          meddelande?: string;
          fel?: string;
        };
        if (res.ok && data.avbruten) {
          visaToast(data.meddelande || "Tasken avbruten.");
        } else {
          visaToast(data.meddelande || data.fel || "Kunde ej avbryta tasken.", "fel");
        }
      } catch {
        visaToast("Nätverksfel — kunde ej avbryta tasken.", "fel");
      }
      void lasAgenter();
    },
    [visaToast, lasAgenter],
  );

  // ── VÅG 83 B4: filträd + förhandsgranskning + töm uploads ────────────────

  /** Hämta trädet (GET /api/studio/filer) — tvingas via ?frisk=1 vid uppdatering. */
  const lasTrad = React.useCallback(async (frisk = false) => {
    setTradLaddar(true);
    setTradFel("");
    try {
      const res = await fetch(`/api/studio/filer${frisk ? `?frisk=${Date.now()}` : ""}`, {
        headers: adminHeaders(),
      });
      const data = (await res.json().catch(() => ({}))) as {
        arbetsyta?: string;
        trad?: TradNod[];
        trunkerad?: boolean;
        fel?: string;
      };
      if (res.ok && data.trad) {
        setTrad(data.trad);
        setTradTrunkerad(Boolean(data.trunkerad));
        setArbetsytaNamn((data.arbetsyta ?? "").split("/").filter(Boolean).pop() ?? "");
      } else {
        setTradFel(data.fel || "Filträdet kunde ej hämtas.");
      }
    } catch {
      setTradFel("Nätverksfel — filträdet kunde ej hämtas.");
    } finally {
      setTradLaddar(false);
    }
  }, []);

  /** Öppna drawern (laddar trädet vid behov) — also /filer-kommandot. */
  const oppnaFiltrad = React.useCallback(() => {
    setVisaFiler(true);
    void lasTrad();
  }, [lasTrad]);

  /** Klicka fil → hämta förhandsgranskning (GET ?sokvag=…). */
  const visaFil = React.useCallback(async (sokvag: string) => {
    setFilVisning(null);
    setVisningLaddar(true);
    try {
      const res = await fetch(`/api/studio/filer?sokvag=${encodeURIComponent(sokvag)}`, {
        headers: adminHeaders(),
      });
      const data = (await res.json().catch(() => ({}))) as FilVisning;
      if (res.ok) {
        setFilVisning(data);
      } else {
        setFilVisning({ namn: sokvag.split("/").pop() ?? sokvag, sokvag, storlek: 0, forhandsgranskning: { slag: "blockerad", meddelande: data.fel || "Filen kunde ej visas." } });
      }
    } catch {
      setFilVisning({ namn: sokvag.split("/").pop() ?? sokvag, sokvag, storlek: 0, forhandsgranskning: { slag: "blockerad", meddelande: "Nätverksfel — filen kunde ej hämtas." } });
    } finally {
      setVisningLaddar(false);
    }
  }, []);

  /** Töm uploads (DELETE /api/studio/filer) — rensar även chips-listan. */
  const tomUploads = React.useCallback(async () => {
    if (tommerUploads) return;
    if (!window.confirm(`Tömma uploads? Alla ${uppladdningar.length ? `${uppladdningar.length}+ ` : ""}uppladdade filer raderas (äldre än 7 dagar rensas ändå automatiskt).`)) return;
    setTommerUploads(true);
    try {
      const res = await fetch("/api/studio/filer", { method: "DELETE", headers: adminHeaders() });
      const data = (await res.json().catch(() => ({}))) as { raderade?: number; fel?: string };
      if (res.ok) {
        setUppladdningar([]);
        visaToast(`Uploads tömda — ${data.raderade ?? 0} filer raderade.`);
      } else {
        visaToast(data.fel || "Kunde ej tömma uploads.", "fel");
      }
    } catch {
      visaToast("Nätverksfel — kunde ej tömma uploads.", "fel");
    } finally {
      setTommerUploads(false);
    }
  }, [tommerUploads, uppladdningar.length, visaToast]);

  /** Klicka mapp = växla öppen/stängd (Set i state — ny referens varje gång). */
  const vaxlaMapp = React.useCallback((sokvag: string) => {
    setOppnaMappar((gamla) => {
      const nya = new Set(gamla);
      if (nya.has(sokvag)) nya.delete(sokvag);
      else nya.add(sokvag);
      return nya;
    });
  }, []);

  // Escape stänger förhandsgranskning + drawern (mjuk lokal hjälppunkt).
  React.useEffect(() => {
    if (!visaFiler && !filVisning) return;
    const påTangent = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFilVisning(null);
        setVisaFiler(false);
      }
    };
    window.addEventListener("keydown", påTangent);
    return () => window.removeEventListener("keydown", påTangent);
  }, [visaFiler, filVisning]);

  // ── VÅG 83 B2: dialogsvar + läges-/tankestyrkeväxlare ────────────────────

  /** Svara permission-dialog (POST /api/studio/interaktion typ permission). */
  const svaraPermission = React.useCallback(
    async (requestId: string, alternativId: string) => {
      if (svarJobbar) return;
      setSvarJobbar(true);
      try {
        const res = await fetch("/api/studio/interaktion", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ typ: "permission", requestId, alternativ: alternativId }),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; beslut?: string; fel?: string };
        // Stäng kortet oavsett — 409 = redan besvarad/eskalerad.
        setPermission((p) => (p?.requestId === requestId ? null : p));
        if (res.ok && data.ok) {
          visaToast(`Verktyget ${data.beslut ?? "besvarat"}`);
        } else {
          visaToast(data.fel || "Begäran var redan besvarad (30 s-gränsen).", "fel");
        }
      } catch {
        visaToast("Nätverksfel — svaret gick ej fram.", "fel");
      } finally {
        setSvarJobbar(false);
      }
    },
    [svarJobbar, visaToast],
  );

  /** Svara frågekortet — knappval/fritext eller avbryt. */
  const svaraFraga = React.useCallback(
    async (requestId: string, varde?: string, avbryt = false) => {
      if (svarJobbar) return;
      setSvarJobbar(true);
      try {
        const res = await fetch("/api/studio/interaktion", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify(
            avbryt
              ? { typ: "fråga-avbryt", requestId }
              : { typ: "fråga", requestId, varde: varde ?? "" },
          ),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; fel?: string };
        setFraga((f) => (f?.requestId === requestId ? null : f));
        setFragSvar("");
        if (res.ok && data.ok) {
          visaToast(avbryt ? "Frågan avbröts." : "Svaret skickat till agenten.");
        } else {
          visaToast(data.fel || "Frågan var redan besvarad (30 s-gränsen).", "fel");
        }
      } catch {
        visaToast("Nätverksfel — svaret gick ej fram.", "fel");
      } finally {
        setSvarJobbar(false);
      }
    },
    [svarJobbar, visaToast],
  );

  /** Byt agentläge (session/setMode — POST /api/studio/session action läge). */
  const byteLage = React.useCallback(
    async (nytt: string) => {
      if (!nytt || nytt === lage || lageJobbar || strömmar) return;
      const gammalt = lage;
      setLage(nytt);
      setLageJobbar(true);
      try {
        const res = await fetch("/api/studio/session", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ action: "läge", lage: nytt }),
        });
        const data = (await res.json().catch(() => ({}))) as { lage?: string; fel?: string };
        if (res.ok && data.lage) {
          setLage(data.lage);
          visaToast(`Agentläge: ${data.lage}${data.lage === "plan" ? " — godkännandedialoger aktiveras" : ""}`);
        } else {
          setLage(gammalt);
          visaToast(data.fel || "Läget kunde ej sättas.", "fel");
        }
      } catch {
        setLage(gammalt);
        visaToast("Nätverksfel — läget kunde ej sättas.", "fel");
      } finally {
        setLageJobbar(false);
      }
    },
    [lage, lageJobbar, strömmar, visaToast],
  );

  /** Byt tankestyrka (session/setThoughtLevel — action tankestyrka). */
  const byteTanke = React.useCallback(
    async (ny: string) => {
      if (!ny || ny === tanka || lageJobbar || strömmar) return;
      const gammal = tanka;
      setTanka(ny);
      setLageJobbar(true);
      try {
        const res = await fetch("/api/studio/session", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ action: "tankestyrka", niva: ny }),
        });
        const data = (await res.json().catch(() => ({}))) as { niva?: string; fel?: string };
        if (res.ok && data.niva) {
          setTanka(data.niva);
          visaToast(`Tankestyrka: ${data.niva}`);
        } else {
          setTanka(gammal);
          visaToast(data.fel || "Tankestyrkan kunde ej sättas.", "fel");
        }
      } catch {
        setTanka(gammal);
        visaToast("Nätverksfel — tankestyrkan kunde ej sättas.", "fel");
      } finally {
        setLageJobbar(false);
      }
    },
    [tanka, lageJobbar, strömmar, visaToast],
  );

  // ── Uppladdning ────────────────────────────────────────────────────────────

  const laddaUpp = React.useCallback(async (filer: File[], relativa?: string[]) => {
    if (filer.length === 0) return;
    setLaddarUpp(true);
    try {
      const form = new FormData();
      for (const fil of filer) form.append("fil", fil);
      if (relativa) for (const sok of relativa) form.append("sokvag", sok);
      const res = await fetch("/api/studio/uppladdning", {
        method: "POST",
        headers: adminHeaders(),
        body: form,
      });
      const data = (await res.json().catch(() => ({}))) as {
        sokvagar?: Uppladdning[];
        fel?: string;
      };
      if (res.ok && data.sokvagar) {
        setUppladdningar((gamla) => [...data.sokvagar!, ...gamla].slice(0, 50));
      } else {
        setStatusText(data.fel || "Uppladdningen misslyckades.");
      }
    } catch {
      setStatusText("Nätverksfel under uppladdningen.");
    } finally {
      setLaddarUpp(false);
    }
  }, []);

  // Paste: bilder ur urklippet åker rakt upp + sökväg infogas.
  const påPaste = React.useCallback(
    async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const filer = Array.from(e.clipboardData?.files ?? []);
      if (filer.length === 0) return;
      e.preventDefault();
      const res = await (async () => {
        setLaddarUpp(true);
        try {
          const form = new FormData();
          for (const fil of filer) form.append("fil", fil);
          const r = await fetch("/api/studio/uppladdning", { method: "POST", headers: adminHeaders(), body: form });
          return (await r.json().catch(() => ({}))) as { sokvagar?: Uppladdning[]; fel?: string };
        } catch {
          return { fel: "Nätverksfel under uppladdningen." } as { sokvagar?: Uppladdning[]; fel?: string };
        } finally {
          setLaddarUpp(false);
        }
      })();
      if (res.sokvagar?.length) {
        setUppladdningar((gamla) => [...res.sokvagar!, ...gamla].slice(0, 50));
        const sista = res.sokvagar[res.sokvagar.length - 1];
        setPrompt((p) => `${p}${p && !p.endsWith(" ") ? " " : ""}Titta på bilden ${sista.sokvag} — `);
        ytaRef.current?.focus();
      } else {
        setStatusText(res.fel || "Uppladdningen misslyckades.");
      }
    },
    [],
  );

  // ── Skicka (SSE över fetch) ────────────────────────────────────────────────

  const skicka = React.useCallback(async () => {
    const text = prompt.trim();
    if (!text || strömmar) return;

    // ── VÅG 83 B4: snabbkommandon parsas LOKALT före sändning ──
    // (rad som börjar med "/" lämnar ALDRIG browsern som prompt; de med
    // API-väg anropar bryggan här, resten är lokal hjälp).
    const kommando = parsaKommando(text);
    if (kommando) {
      setPrompt("");
      if (!kommando.kommando) return; // bart "/" — avfärdat utan brus
      const pushAssistant = (t: string) =>
        setMeddelanden((m) => [...m, { id: nyttId(), roll: "assistant", text: t }]);
      setMeddelanden((m) => [...m, { id: nyttId(), roll: "user", text }]);
      switch (kommando.kommando) {
        case "help":
          pushAssistant(kommandoHjalp());
          return;
        case "ny":
          await startaNySession();
          pushAssistant("Ny session — kontexten börjar om (gamla sessioner finns kvar i listan).");
          return;
        case "komprimera":
          await komprimera();
          pushAssistant("Komprimering körd — se kontextraden för färsk tokenräkning.");
          return;
        case "filer":
          oppnaFiltrad();
          pushAssistant("Filträdet är öppet — klicka dig ner i arbetsytan och förhandsgranska filer.");
          return;
        case "modell": {
          const id = kommando.argument.split(/\s+/)[0] ?? "";
          const listaText =
            modeller.length > 0
              ? `Tillgängliga: ${modeller.map((m) => `\`${m.id}\``).join(", ")}.`
              : "Modellistan är ej hämtad (demo-läge) — modellbyte kräver riktig anslutning.";
          if (!id) {
            pushAssistant(`Använd: **/modell <id>** — ${listaText}`);
            return;
          }
          if (modeller.length > 0 && !modeller.some((m) => m.id === id)) {
            pushAssistant(`Okänd modell \`${id}\`. ${listaText}`);
            return;
          }
          if (id === valdModell) {
            pushAssistant(`\`${id}\` är redan vald — ingen session kasseras.`);
            return;
          }
          await bytModell(id);
          pushAssistant(`Modellbyte till **${id}** kört — ny session skapad med modellen.`);
          return;
        }
        default:
          pushAssistant(`Okänt kommando \`${kommando.kommando}\` — skriv **/help** för alla kommandon.`);
          return;
      }
    }

    setPrompt("");
    setTankar("");
    setStatusText("Skickar…");
    setStrömmar(true);
    const agentId = nyttId();
    setMeddelanden((m) => [...m, { id: nyttId(), roll: "user", text }, { id: agentId, roll: "assistant", text: "", strömmande: true, verktyg: [] }]);

    const abort = new AbortController();
    abortRef.current = abort;

    /** Uppdatera agentbubblan funktionellt (strömmen skriver ofta). */
    const rörAgent = (rör: (m: Meddelande) => Meddelande) => {
      setMeddelanden((alla) => alla.map((m) => (m.id === agentId ? rör(m) : m)));
    };

    // ── V83 B1: verktygskort-merge (funktionell uppdatering på id) ──
    const uppdateraKort = (id: string, rör: (k: VerktygKort) => VerktygKort) => {
      rörAgent((m) => {
        const korta = m.verktygKort ? [...m.verktygKort] : [];
        const i = korta.findIndex((k) => k.id === id);
        if (i >= 0) {
          korta[i] = rör(korta[i]);
        } else {
          korta.push(rör({ id, namn: "verktyg", steg: "planerad" }));
        }
        return { ...m, verktygKort: korta };
      });
    };

    try {
      const res = await fetch("/api/studio/stream", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ prompt: text }),
        signal: abort.signal,
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { fel?: string };
        throw new Error(data.fel || `Bryggan svarade ${res.status}.`);
      }

      const läsare = res.body.getReader();
      const avkodare = new TextDecoder();
      let buffert = "";
      let färdig = false;
      while (!färdig) {
        const { done, value } = await läsare.read();
        if (done) break;
        buffert += avkodare.decode(value, { stream: true });
        let gräns = buffert.indexOf("\n\n");
        while (gräns >= 0) {
          const block = buffert.slice(0, gräns);
          buffert = buffert.slice(gräns + 2);
          gräns = buffert.indexOf("\n\n");
          const dataRad = block.split("\n").find((r) => r.startsWith("data: "));
          if (!dataRad) continue; // heartbeat-kommentarer osv.
          let event: StreamEvent;
          try {
            event = JSON.parse(dataRad.slice(6)) as StreamEvent;
          } catch {
            continue;
          }
          switch (event.typ) {
            case "hej":
              setLive(event.transport === "mock" ? "demo" : "live");
              break;
            case "status":
              setStatusText(event.text || "Agenten arbetar…");
              break;
            case "delta":
              if (event.kanal === "tankar") {
                setTankar((t) => (t + (event.text ?? "")).slice(-260));
              } else {
                rörAgent((m) => ({ ...m, text: m.text + (event.text ?? "") }));
                setStatusText("Svarar…");
              }
              break;
            case "verktyg":
              // V83 B1: den gamla verktygs-raden lever bara som statusText —
              // korten (med argument+resultat) kommer via "verktyg_kort".
              setStatusText(`${event.händelse === "start" ? "Kör" : "Klart"}: ${event.namn ?? "verktyg"}`);
              break;
            case "verktyg_kort":
              // tool.updated-kartläggningen: merge:a kortet på id (senare
              // events berikar — argument → resultat → varaktighet).
              if (event.id) {
                uppdateraKort(event.id, (k) => ({
                  ...k,
                  namn: event.namn ?? k.namn,
                  steg: event.steg ?? k.steg,
                  argument: event.argument ?? k.argument,
                  beskrivning: event.beskrivning ?? k.beskrivning,
                  resultat: event.resultat ?? k.resultat,
                  fel: event.fel ?? k.fel,
                  varaktighetMs: event.varaktighetMs ?? k.varaktighetMs,
                  framsteg: event.framsteg ?? k.framsteg,
                }));
                setStatusText(
                  event.steg === "fel"
                    ? `${event.namn ?? "Verktyg"} misslyckades`
                    : event.steg === "resultat"
                      ? `${event.namn ?? "Verktyg"} klart${
                          typeof event.varaktighetMs === "number" ? ` (${msText(event.varaktighetMs)})` : ""
                        }`
                      : `${event.steg === "kör" ? "Kör" : "Förbereder"}: ${event.namn ?? "verktyg"}`,
                );
              }
              break;
            case "verktyg_input":
              // model.streaming tool_input_delta — argumenten strömmas LIVE.
              if (event.id) {
                uppdateraKort(event.id, (k) => ({
                  ...k,
                  liveInput: (k.liveInput ?? "") + (event.text ?? ""),
                }));
                setStatusText(
                  `Skriver verktygsargument: ${event.namn ?? (event.text ?? "").slice(0, 24)}`,
                );
              }
              break;
            case "runda":
              // turn.started/completed — rundstatistiken i bubblans fot.
              if (event.fas === "slut") {
                rörAgent((m) => ({
                  ...m,
                  rundStatistik: {
                    varaktighetMs: event.varaktighetMs,
                    resultatTyp: event.resultatTyp,
                    verktygAntal: event.verktygAntal,
                  },
                }));
              } else {
                setStatusText("Agenten arbetar…");
              }
              break;
            case "interaktion":
              // V83 B2: dialogkort väntar på användarens val — permission
              // (godkännande) eller fråga (requestUserInput).
              if (event.interaktion?.typ === "permission") {
                setPermission({
                  requestId: event.interaktion.requestId,
                  verktyg: event.interaktion.verktyg,
                  risk: event.interaktion.risk,
                  skäl: event.interaktion.skäl,
                  sammanfattning: event.interaktion.sammanfattning,
                  alternativ: event.interaktion.alternativ ?? [],
                });
                setStatusText("Väntar på ditt godkännande…");
              } else if (event.interaktion?.typ === "fråga") {
                setFraga({
                  requestId: event.interaktion.requestId,
                  fråga: event.interaktion.fråga,
                  inputTyp: event.interaktion.inputTyp,
                  val: event.interaktion.val,
                });
                setFragSvar("");
                setStatusText("Agenten frågar…");
              }
              break;
            case "interaktionsKlar":
              // V83 B2: löst (svar/avbruten/eskalerad) — stäng kortet.
              if (event.requestId) {
                setPermission((p) => (p?.requestId === event.requestId ? null : p));
                setFraga((f) => (f?.requestId === event.requestId ? null : f));
                if (event.beslut === "eskal") {
                  visaToast("Tidsgränsen löpte ut (30 s) — begäran eskalerades till agenten.", "fel");
                }
              }
              break;
            case "klart":
              rörAgent((m) => ({
                ...m,
                text: event.svar && event.svar.trim() ? event.svar : m.text || "(tomt svar)",
                strömmande: false,
              }));
              if (typeof event.tokenCount === "number" && event.tokenCount > 0) {
                setRundaTkn(event.tokenCount);
                setAckumulerat((a) => (a > 0 ? a + event.tokenCount! : event.tokenCount!));
              }
              färdig = true;
              break;
            case "kontext":
              // V2: färsk projektion efter rundan — kontextradens sanning.
              if (event.kontext) {
                setKontext(event.kontext);
                if (typeof event.kontext.totalTokenCount === "number") {
                  setAckumulerat(event.kontext.totalTokenCount);
                }
              }
              break;
            case "fel":
              rörAgent((m) => ({
                ...m,
                strömmande: false,
                fel: true,
                text: m.text || event.meddelande || "Okänt fel.",
              }));
              färdig = true;
              break;
            case "ändringar":
              // V83 B1: senaste turnens filändringar (SSE efter klart +
              // kontext) — "Ändringar"-panelen per turn.
              if (Array.isArray(event.filer)) {
                const filer = event.filer;
                rörAgent((m) => ({ ...m, ändringar: filer }));
              }
              break;
          }
        }
      }
      rörAgent((m) => ({ ...m, strömmande: false }));
    } catch (fel) {
      if ((fel as Error).name !== "AbortError") {
        rörAgent((m) => ({
          ...m,
          strömmande: false,
          fel: true,
          text: m.text || (fel instanceof Error ? fel.message : "Bryggfel."),
        }));
      } else {
        rörAgent((m) => ({ ...m, strömmande: false, text: m.text || "(avbruten)" }));
      }
    } finally {
      setStrömmar(false);
      setTankar("");
      abortRef.current = null;
      setStatusText((nuvarande) =>
        nuvarande.startsWith("Sessionen") || nuvarande.startsWith("Demo")
          ? nuvarande
          : live === "demo"
            ? "Demo-läge (mock-transport)"
            : "Sessionen lever",
      );
    }
  }, [prompt, strömmar, live, modeller, valdModell, startaNySession, komprimera, bytModell, oppnaFiltrad, visaToast]);

  const stoppa = React.useCallback(() => {
    abortRef.current?.abort();
  }, []);

  /** Infoga en uppladdad sökväg i prompten ("Titta på …"). */
  const infogaSokvag = (sokvag: string, typ: string) => {
    const led = typ === "bild" ? `Titta på bilden ${sokvag} — ` : `Läs filen ${sokvag} — `;
    setPrompt((p) => (p.includes(sokvag) ? p : `${p}${p && !p.endsWith(" ") ? " " : ""}${led}`));
    ytaRef.current?.focus();
  };

  const prickFärg =
    live === "live" ? "bg-emerald-500" : live === "demo" ? "bg-gold-soft" : "bg-red-500";
  const prickText = live === "live" ? "LIVE" : live === "demo" ? "DEMO" : "NED";

  // Kontextberäkning (V2): protokollets ÄRLIGA contextWindow är taket
  // (200 000 för zai/GLM vid v82-beviset); 1 000 000 endast som reserv.
  const kontextTak =
    typeof kontext?.contextWindow === "number" && kontext.contextWindow > 0
      ? kontext.contextWindow
      : KONTEXT_TAK_RESERV;
  const kontextAnvänt =
    typeof kontext?.contextUsed === "number" && kontext.contextUsed > 0
      ? kontext.contextUsed
      : ackumulerat;
  const kontextProcent = kontextAnvänt > 0 ? Math.min(100, (kontextAnvänt / kontextTak) * 100) : null;

  return (
    <div
      className="paper-texture flex h-[100dvh] flex-col"
      onDragOver={(e) => {
        e.preventDefault();
        setDraÖver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDraÖver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDraÖver(false);
        const filer = Array.from(e.dataTransfer?.files ?? []);
        if (filer.length > 0) void laddaUpp(filer);
      }}
    >
      {/* Bekräftelse-toast (modellbyte / ny session / komprimering) */}
      {toast && (
        <div
          role="status"
          className={cn(
            "fixed left-1/2 top-3 z-50 -translate-x-1/2 rounded-xl border px-4 py-2 text-xs font-medium shadow-lg backdrop-blur",
            toast.ton === "fel"
              ? "border-red-500/40 bg-red-950/90 text-red-100"
              : "border-gold/50 bg-[#10233F]/95 text-[#EDE6D6]",
          )}
        >
          {toast.ton === "guld" && <span className="mr-1.5 text-gold">✦</span>}
          {toast.text}
        </div>
      )}

      {/* Marin rubrikrad */}
      <header className="marin-panel sticky top-0 z-20 border-b border-gold/25 shadow-md">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2.5 px-3 py-2.5 sm:px-4 sm:py-3">
          <VarumarkesLogo storlek="sm" medText={false} onClick={hem} />
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-lg font-bold leading-tight text-[#EDE6D6] sm:text-xl">
              AK1A <span className="text-gold">Studio</span>
            </h1>
            <p className="truncate text-[11px] text-[#EDE6D6]/70">
              Din agent — samma hjärna som bygger sajten
            </p>
          </div>
          {/* MODELLRULLISTA (V2) — listan härledd ur config.json via API */}
          <label className="relative shrink-0" title="Välj huvudmodell — ny session skapas med modellen">
            <span className="sr-only">Välj modell</span>
            <select
              value={valdModell}
              onChange={(e) => void bytModell(e.target.value)}
              disabled={modeller.length === 0 || byterModell || strömmar}
              className={cn(
                "appearance-none rounded-full border border-gold/30 bg-black/25 py-1 pl-3 pr-7 text-[11px] font-semibold text-[#EDE6D6] outline-none transition-colors",
                "hover:border-gold/60 focus:border-gold/60 disabled:opacity-50",
              )}
            >
              {modeller.length === 0 && <option value="">—</option>}
              {modeller.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#10233F] text-[#EDE6D6]">
                  {m.namn}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-gold">
              {byterModell ? "…" : "▼"}
            </span>
          </label>
          <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-gold/30 bg-black/20 px-2.5 py-1" title={statusText}>
            <span className={cn("h-2 w-2 animate-pulse rounded-full", prickFärg)} />
            <span className="text-[10px] font-semibold tracking-wider text-[#EDE6D6]/90">{prickText}</span>
          </div>
        </div>

        {/* KONTEXTRAD (V2): tokens denna runda · totalt · procent av taket */}
        <div className="border-t border-gold/15 bg-black/15">
          <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-1.5 sm:px-4">
            <span className="text-[11px] text-[#EDE6D6]/85" title="Tokens denna runda · ackumulerat · andel av kontextfönstret">
              📊 {rundaTkn !== null ? `${tkn(rundaTkn)} tkn denna runda` : "— denna runda"} · ~
              {tkn(ackumulerat)} totalt
              {kontextProcent !== null && (
                <span className={cn("ml-1 font-semibold", kontextProcent >= KONTEXT_VARNING_PROCENT ? "text-gold" : "text-[#EDE6D6]/60")}>
                  · {kontextProcent.toFixed(kontextProcent < 10 ? 1 : 0)}% av {tkn(kontextTak)}
                </span>
              )}
            </span>
            {kontextProcent !== null && (
              <span className="relative h-1.5 w-24 overflow-hidden rounded-full bg-white/10 sm:w-32" aria-hidden>
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-all",
                    kontextProcent >= KONTEXT_VARNING_PROCENT ? "bg-gold" : "bg-emerald-400/80",
                  )}
                  style={{ width: `${Math.min(100, kontextProcent)}%` }}
                />
              </span>
            )}
            {kontext?.modell && (
              <span className="hidden text-[10px] uppercase tracking-wider text-[#EDE6D6]/50 sm:inline">
                {kontext.modell}
              </span>
            )}
            <span className="ml-auto flex items-center gap-1">
              <button
                onClick={() => (visaFiler ? setVisaFiler(false) : oppnaFiltrad())}
                title="Filträdet — agentens arbetsyta (förhandsgranska filer och bilder, töm uploads)"
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-[#EDE6D6]/85 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
              >
                <FolderTree className="h-3.5 w-3.5" />
                Filer
              </button>
              <button
                onClick={() => void startaNySession()}
                disabled={sessionJobbar !== "" || strömmar}
                title="Kassera sessionen och börja en frisk kontext (1M-fönstret börjar om — gamla sessioner finns kvar i listan)"
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-[#EDE6D6]/85 transition-colors hover:bg-white/10 hover:text-[#EDE6D6] disabled:opacity-50"
              >
                {sessionJobbar === "ny" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <SquarePen className="h-3.5 w-3.5" />}
                Ny session
              </button>
              <button
                onClick={() => void komprimera()}
                disabled={sessionJobbar !== "" || strömmar}
                title="Komprimera kontexten (session/compact — agenten sammanfattar och fönstret frias)"
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-[#EDE6D6]/85 transition-colors hover:bg-white/10 hover:text-[#EDE6D6] disabled:opacity-50"
              >
                {sessionJobbar === "compact" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shrink className="h-3.5 w-3.5" />}
                Komprimera
              </button>
              {/* VÅG 83 B3: MÅL (session/goal) + BAKGRUNDSAGENTER (subagents) */}
              <button
                onClick={() => {
                  setMalText(mal ?? "");
                  setMalRedigerar((v) => !v);
                }}
                title="Sessionens mål (session/goal) — visas i headern om satt, redigerbart"
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-[#EDE6D6]/85 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
              >
                <Target className="h-3.5 w-3.5" />
                Mål
                {mal && <span className="h-1.5 w-1.5 rounded-full bg-gold" title="Mål satt" />}
              </button>
              <button
                onClick={() => {
                  const ny = !visaAgenter;
                  setVisaAgenter(ny);
                  if (ny) void lasAgenter();
                }}
                title="Bakgrundsagenter (session/subagents) — status + avbryt"
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-[#EDE6D6]/85 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
              >
                <Bot className="h-3.5 w-3.5" />
                Agenter
              </button>
              <button
                onClick={() => {
                  const ny = !visaSessioner;
                  setVisaSessioner(ny);
                  if (ny) void lasSessioner();
                }}
                title="Sessioner (session/list) — klicka en session för att öppna den (session/resume)"
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-[#EDE6D6]/85 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
              >
                <History className="h-3.5 w-3.5" />
                Sessioner
                {sessioner.length > 0 && <span className="rounded-full bg-gold/20 px-1.5 text-[9px] font-bold text-gold">{sessioner.length}</span>}
              </button>
            </span>
          </div>

          {/* VÅG 83 B3: MÅL (session/goal) — visas i headern om satt, redigerbart */}
          {(malRedigerar || mal) && (
            <div className="border-t border-gold/15 bg-black/10">
              <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-3 py-1.5 sm:px-4">
                <Target className="h-3.5 w-3.5 shrink-0 text-gold" />
                {malRedigerar ? (
                  <>
                    <input
                      value={malText}
                      onChange={(e) => setMalText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void sparaMal();
                        if (e.key === "Escape") setMalRedigerar(false);
                      }}
                      placeholder="Sessionens mål — t.ex. &quot;Färdigställ våg 83-rapporten&quot;"
                      maxLength={500}
                      autoFocus
                      className="min-w-0 flex-1 rounded-md border border-gold/40 bg-black/30 px-2.5 py-1 text-[11px] text-[#EDE6D6] outline-none placeholder:text-[#EDE6D6]/40 focus:border-gold/70"
                    />
                    <button
                      onClick={() => void sparaMal()}
                      disabled={malSparar || !malText.trim()}
                      className="shrink-0 rounded-md border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold transition-colors hover:bg-gold/20 disabled:opacity-50"
                    >
                      {malSparar ? <Loader2 className="h-3 w-3 animate-spin" /> : "Spara"}
                    </button>
                    <button
                      onClick={() => setMalRedigerar(false)}
                      className="shrink-0 rounded-md px-2 py-0.5 text-[10px] text-[#EDE6D6]/60 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
                    >
                      Avbryt
                    </button>
                  </>
                ) : (
                  <>
                    <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#EDE6D6]/90" title={mal ?? undefined}>
                      {mal}
                    </span>
                    {malSparar && <Loader2 className="h-3 w-3 shrink-0 animate-spin text-gold" />}
                    <button
                      onClick={() => {
                        setMalText(mal ?? "");
                        setMalRedigerar(true);
                      }}
                      title="Redigera målet (session/goal set)"
                      className="shrink-0 rounded p-0.5 text-[#EDE6D6]/60 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => void rensaMaler()}
                      disabled={malSparar}
                      title="Rensa målet (session/goal clear)"
                      className="shrink-0 rounded p-0.5 text-[#EDE6D6]/60 transition-colors hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Guld-varning: kontexten > 80 % av taket (KVD kontext-optimering) */}
          {kontextProcent !== null && kontextProcent >= KONTEXT_VARNING_PROCENT && (
            <div className="border-t border-gold/30 bg-gold/10">
              <p className="mx-auto w-full max-w-3xl px-3 py-1.5 text-[11px] font-semibold text-gold sm:px-4">
                ⚠ Överväg ny session — kontexten närmar sig taket ({kontextProcent.toFixed(0)} % av {tkn(kontextTak)})
              </p>
            </div>
          )}

          {/* Sessionslista (V2 + V83 B3): modell · vändor · tokens · tid —
              klicka = session/resume (historiken återkommer i chatten). */}
          {visaSessioner && (
            <div className="border-t border-gold/15 bg-black/25">
              <div className="mx-auto max-h-56 w-full max-w-3xl overflow-y-auto px-3 py-2 sm:px-4">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#EDE6D6]/50">
                  Sessioner {sessioner.length === 0 && "— ingen lista ännu"} · klicka för att öppna
                </p>
                {arbetsytaInfo && (
                  <p
                    className="mb-1.5 truncate text-[10px] text-[#EDE6D6]/45"
                    title={`${arbetsytaInfo.arbetsyta}${arbetsytaInfo.behorighet ? ` · behörighet ${arbetsytaInfo.behorighet}` : ""}${typeof arbetsytaInfo.kommandon === "number" ? ` · ${arbetsytaInfo.kommandon} kommandon` : ""}`}
                  >
                    Arbetsyta {arbetsytaInfo.arbetsyta.split("/").filter(Boolean).pop() ?? arbetsytaInfo.arbetsyta}
                    {arbetsytaInfo.lage && ` · läge ${arbetsytaInfo.lage}`}
                    {arbetsytaInfo.modell && ` · ${arbetsytaInfo.modell}`}
                    {arbetsytaInfo.tankeNiva && ` · tanke ${arbetsytaInfo.tankeNiva}`}
                    {typeof arbetsytaInfo.modellerTillgangliga === "number" &&
                      ` · ${arbetsytaInfo.modellerTillgangliga} modeller`}
                  </p>
                )}
                <ul className="space-y-1">
                  {sessioner.map((s) => (
                    <li
                      key={s.sessionId}
                      className="group flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-[11px] text-[#EDE6D6]/80 transition-colors hover:bg-white/10"
                      title={s.sessionId}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          s.status === "idle"
                            ? "bg-emerald-400"
                            : s.status === "completed" || s.status === "error"
                              ? "bg-red-400/80"
                              : "bg-gold",
                        )}
                      />
                      <button
                        onClick={() => void oppnaSessionen(s.sessionId)}
                        disabled={sessionJobbar !== "" || strömmar || s.sessionId === aktivSession}
                        className="flex min-w-0 flex-1 flex-col items-start text-left disabled:cursor-default"
                        title={
                          s.sessionId === aktivSession
                            ? "Aktiv session"
                            : `Öppna ${s.sessionId} (session/resume) — historiken återkommer i chatten`
                        }
                      >
                        <span className="w-full truncate font-medium">
                          {s.titel || s.sessionId.slice(0, 18) + "…"}
                          {s.sessionId === aktivSession && (
                            <span className="ml-1.5 rounded-full bg-gold/20 px-1.5 text-[9px] font-bold text-gold">AKTIV</span>
                          )}
                        </span>
                        <span className="w-full truncate text-[9px] text-[#EDE6D6]/45">
                          {[
                            s.modell?.includes("/") ? s.modell.split("/").slice(1).join("/") : s.modell,
                            typeof s.turns === "number" ? `${s.turns} vändor` : null,
                            typeof s.tokens === "number" ? `${tkn(s.tokens)} tkn` : null,
                            tidSen(s.uppdaterad) || null,
                          ]
                            .filter(Boolean)
                            .join(" · ") || s.sessionId.slice(5, 13)}
                        </span>
                      </button>
                      <span className="shrink-0 font-mono text-[9px] text-[#EDE6D6]/40">
                        {s.sessionId.slice(5, 13)}
                      </span>
                      <button
                        onClick={() => void stangSessionen(s.sessionId)}
                        disabled={sessionJobbar !== "" || strömmar}
                        title="Stäng sessionen (session/close) — finns kvar i listan men svarar ej"
                        className="shrink-0 rounded p-0.5 text-[#EDE6D6]/40 opacity-0 transition-all hover:bg-red-500/20 hover:text-red-300 focus:opacity-100 group-hover:opacity-100 disabled:opacity-30"
                      >
                        {sessionJobbar === "stang" ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* VÅG 83 B3: BAKGRUNDSAGENTER (session/subagents) — badge + avbryt */}
          {visaAgenter && (
            <div className="border-t border-gold/15 bg-black/25">
              <div className="mx-auto max-h-44 w-full max-w-3xl overflow-y-auto px-3 py-2 sm:px-4">
                <div className="mb-1.5 flex items-center gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#EDE6D6]/50">
                    Bakgrundsagenter {subagenter.length > 0 && `(${subagenter.length})`}
                  </p>
                  <button
                    onClick={() => void lasAgenter()}
                    disabled={agenterLaddar}
                    title="Uppdatera (session/subagents)"
                    className="rounded p-0.5 text-[#EDE6D6]/50 transition-colors hover:bg-white/10 hover:text-[#EDE6D6] disabled:opacity-50"
                  >
                    <RefreshCw className={cn("h-3 w-3", agenterLaddar && "animate-spin")} />
                  </button>
                </div>
                {agenterFel && <p className="text-[11px] text-red-300">{agenterFel}</p>}
                {!agenterFel && subagenter.length === 0 && !agenterLaddar && (
                  <p className="text-[11px] leading-relaxed text-[#EDE6D6]/50">
                    Inga bakgrundsagenter just nu — när agenten delegerar arbete i bakgrunden
                    syns barnagenterna här med status och avbryt-knapp.
                  </p>
                )}
                <ul className="space-y-1">
                  {subagenter.map((a) => {
                    const kör =
                      a.status === "running" || a.status === "waiting" || a.status === "blocked";
                    return (
                      <li
                        key={a.barnSessionId}
                        className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-1 text-[11px] text-[#EDE6D6]/80"
                        title={`${a.barnSessionId}${a.startad ? ` · startad ${tidSen(a.startad)} sedan` : ""}${a.avslutad ? ` · avslutad ${tidSen(a.avslutad)} sedan` : ""}${a.sammanfattning ? ` — ${a.sammanfattning}` : ""}`}
                      >
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                            agentStatusFarg(a.status),
                          )}
                        >
                          {agentStatusText(a.status)}
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          {a.titel}
                          {a.typ && <span className="ml-1.5 text-[9px] text-[#EDE6D6]/40">{a.typ}</span>}
                        </span>
                        {kör && (
                          <button
                            onClick={() => void avbrytAgent(a.barnSessionId)}
                            title="Avbryt (session/cancelBackgroundTask)"
                            className="shrink-0 rounded-md border border-red-500/30 px-1.5 py-0.5 text-[10px] text-red-300 transition-colors hover:bg-red-500/15 hover:text-red-200"
                          >
                            Avbryt
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* VÅG 83 B4: FILTRÄDSDRAWER — agentens arbetsyta, klicka dig ner */}
      {visaFiler && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setVisaFiler(false)}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-label="Filträd över agentens arbetsyta"
            className="fixed right-0 top-0 z-40 flex h-[100dvh] w-full max-w-[380px] flex-col border-l border-gold/30 bg-[#0D1B31] shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-gold/25 bg-black/25 px-3 py-2.5">
              <FolderTree className="h-4 w-4 shrink-0 text-gold" />
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-sm font-bold text-[#EDE6D6]">Filträdet</h2>
                <p className="truncate text-[10px] text-[#EDE6D6]/55">
                  {arbetsytaNamn ? `arbetsyta: ${arbetsytaNamn}` : "agentens arbetsyta"}
                </p>
              </div>
              <button
                onClick={() => void lasTrad(true)}
                disabled={tradLaddar}
                title="Uppdatera trädet"
                className="rounded-md p-1 text-[#EDE6D6]/70 transition-colors hover:bg-white/10 hover:text-[#EDE6D6] disabled:opacity-50"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", tradLaddar && "animate-spin")} />
              </button>
              <button
                onClick={() => setVisaFiler(false)}
                title="Stäng (Esc)"
                className="rounded-md p-1 text-[#EDE6D6]/70 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-1.5 py-2 [scrollbar-width:thin]">
              {tradLaddar && !trad && (
                <div className="flex items-center gap-2 px-2 py-3 text-[11px] text-[#EDE6D6]/60">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
                  Läser arbetsytan…
                </div>
              )}
              {tradFel && <p className="px-2 py-3 text-[11px] text-red-300">{tradFel}</p>}
              {trad && trad.length === 0 && !tradLaddar && (
                <p className="px-2 py-3 text-[11px] text-[#EDE6D6]/60">Arbetsytan är tom.</p>
              )}
              {trad?.map((nod) => (
                <TradRad
                  key={nod.sokvag}
                  nod={nod}
                  djup={0}
                  oppna={oppnaMappar}
                  onVaxla={vaxlaMapp}
                  onFil={(s) => void visaFil(s)}
                />
              ))}
              {tradTrunkerad && (
                <p className="mt-2 border-t border-gold/15 px-2 pt-2 text-[10px] leading-relaxed text-[#EDE6D6]/45">
                  Trädet är avkortat vid 500 noder (maxdjup 3) — node_modules/.next/.git/uploads
                  visas aldrig. Övriga filer når agenten via chatten.
                </p>
              )}
            </div>

            {/* Uploads-sektion: datum + töm-knapp (>7 dgr rensas automatiskt) */}
            <div className="border-t border-gold/25 bg-black/25 px-3 py-2.5">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#EDE6D6]/55">
                  Uploads {uppladdningar.length > 0 && `(${uppladdningar.length}${uppladdningar.length >= 50 ? "+" : ""})`}
                </p>
                <button
                  onClick={() => void tomUploads()}
                  disabled={tommerUploads || uppladdningar.length === 0}
                  title="Töm uploads — filer äldre än 7 dagar rensas annars automatiskt"
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] text-red-300 transition-colors hover:bg-red-500/15 hover:text-red-200 disabled:opacity-40"
                >
                  {tommerUploads ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  Töm uploads
                </button>
              </div>
              {uppladdningar.length === 0 ? (
                <p className="text-[10px] leading-relaxed text-[#EDE6D6]/45">
                  Inga filer de senaste 7 dagarna — släpp filer på chattytan eller använd
                  filknappen. Filer äldre än 7 dagar rensas automatiskt.
                </p>
              ) : (
                <ul className="max-h-28 space-y-1 overflow-y-auto [scrollbar-width:thin]">
                  {uppladdningar.slice(0, 10).map((u) => {
                    const andrad = (u as Uppladdning & { andrad?: number }).andrad;
                    return (
                      <li
                        key={u.sokvag}
                        className="flex items-center gap-1.5 text-[10px] text-[#EDE6D6]/70"
                        title={u.sokvag}
                      >
                        {filIkon(u.sokvag)}
                        <span className="min-w-0 flex-1 truncate">{u.sokvag.split("/").slice(2).join("/") || u.sokvag}</span>
                        <span className="shrink-0 font-mono text-[9px] text-[#EDE6D6]/35">
                          {andrad
                            ? `${new Date(andrad).toLocaleDateString("sv-SE")} · ${byteStorlek(u.storlek)}`
                            : byteStorlek(u.storlek)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>
        </>
      )}

      {/* VÅG 83 B4: FÖRHANDSGRANSKNING — text monospace, bild, nedladdning */}
      {filVisning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3"
          onClick={() => setFilVisning(null)}
        >
          <div
            className="flex max-h-[88dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gold/30 bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-gold/25 bg-[#10233F] px-3 py-2">
              <FileText className="h-4 w-4 shrink-0 text-gold" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs font-semibold text-[#EDE6D6]">{filVisning.namn}</p>
                <p className="truncate text-[10px] text-[#EDE6D6]/55">
                  {filVisning.sokvag} · {byteStorlek(filVisning.storlek)}
                </p>
              </div>
              <button
                onClick={() => setFilVisning(null)}
                title="Stäng (Esc)"
                className="rounded-md p-1 text-[#EDE6D6]/70 transition-colors hover:bg-white/10 hover:text-[#EDE6D6]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              {visningLaddar && (
                <div className="flex items-center gap-2 px-4 py-6 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-gold" />
                  Läser filen…
                </div>
              )}
              {!visningLaddar && filVisning.forhandsgranskning.slag === "text" && (
                <pre className="whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed">
                  {filVisning.forhandsgranskning.innehåll}
                </pre>
              )}
              {!visningLaddar && filVisning.forhandsgranskning.slag === "bild" && (
                 
                <img
                  src={filVisning.forhandsgranskning.url}
                  alt={filVisning.namn}
                  className="mx-auto max-h-[72dvh] w-auto max-w-full object-contain"
                />
              )}
              {!visningLaddar && filVisning.forhandsgranskning.slag === "nedladdning" && (
                <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
                  <Download className="h-8 w-8 text-gold" />
                  <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
                    {filVisning.forhandsgranskning.orsak ?? "Binärt format — ladda ner för att öppna."}
                  </p>
                  <a
                    href={filVisning.forhandsgranskning.url}
                    download={filVisning.namn}
                    className="rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold transition-colors hover:bg-gold/20"
                  >
                    Ladda ner {filVisning.namn} ({byteStorlek(filVisning.storlek)})
                  </a>
                </div>
              )}
              {!visningLaddar && filVisning.forhandsgranskning.slag === "blockerad" && (
                <p className="px-4 py-6 text-center text-xs leading-relaxed text-muted-foreground">
                  {filVisning.forhandsgranskning.meddelande}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Meddelandelista */}
      <div ref={blattraRef} className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-3 py-4 sm:px-4">
        {meddelanden.length === 0 && (
          <div className="mx-auto mt-10 max-w-md text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/30 bg-card">
              <Sparkles className="h-6 w-6 text-gold" />
            </div>
            <h2 className="mt-4 font-serif text-xl font-bold">Prata med agenten</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Skriv, klistra in en bild eller släpp filer här. Mappar laddas upp med
              mappknappen — sökvägarna hamnar i chatten så agenten kan läsa dem.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {["Vad är status i projektet just nu?", "Sammanfatta senaste worklog", "Titta på data/siffror.json och förklara treck", "/help — snabbkommandon"].map((förslag) => (
                <button
                  key={förslag}
                  onClick={() => setPrompt(förslag)}
                  className="rounded-full border border-gold/30 bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:border-gold/60"
                >
                  {förslag}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {meddelanden.map((m) =>
            m.roll === "user" ? (
              <div key={m.id} className="flex justify-start">
                <div className="marin-panel marin-scope max-w-[85%] rounded-2xl rounded-tl-sm border border-gold/25 px-4 py-2.5 shadow-sm sm:max-w-[75%]">
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.text}</p>
                  {/* VÅG 83 B4: uppladdade bilder som refereras i texten →
                      miniatyrer direkt i bubblan (säker serving &bild=1). */}
                  {bildRefsUrText(m.text).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {bildRefsUrText(m.text).map((sokvag) => (
                         
                        <img
                          key={sokvag}
                          src={bildUrl(sokvag)}
                          alt={sokvag.split("/").pop() ?? sokvag}
                          loading="lazy"
                          className="h-24 w-24 cursor-pointer rounded-lg border border-gold/30 object-cover transition-opacity hover:opacity-90"
                          onClick={() => void visaFil(sokvag)}
                          onError={(e) => {
                            // Filen finns inte (rensad/rensat) — göm stiligt.
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex justify-end">
                <div
                  className={cn(
                    "max-w-[92%] rounded-2xl rounded-tr-sm border bg-card px-4 py-3 shadow-sm sm:max-w-[80%]",
                    m.fel ? "border-red-500/40" : "border-gold/40",
                  )}
                >
                  {/* V83 B1: varje verktygskall = expanderbart kort i flödet. */}
                  {m.verktygKort && m.verktygKort.length > 0 && (
                    <div className="mb-2 space-y-1.5">
                      {m.verktygKort.map((k) => (
                        <VerktygsKortVy
                          key={k.id}
                          kort={k}
                          onVaxla={(id) =>
                            setMeddelanden((alla) =>
                              alla.map((mm) =>
                                mm.id === m.id
                                  ? {
                                      ...mm,
                                      verktygKort: (mm.verktygKort ?? []).map((k2) =>
                                        k2.id === id ? { ...k2, öppen: !k2.öppen } : k2,
                                      ),
                                    }
                                  : mm,
                              ),
                            )
                          }
                        />
                      ))}
                    </div>
                  )}
                  {m.text ? (
                    <StudioMarkdown text={m.text} />
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
                      {statusText}
                    </div>
                  )}
                  {m.strömmande && m.text && (
                    <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-gold align-text-bottom" />
                  )}
                  {/* V83 B1: ändringspanelen — +N/−N per fil, expanderbar diff. */}
                  {m.ändringar && m.ändringar.length > 0 && (
                    <AndringsPanel
                      andringar={m.ändringar}
                      onVaxlaFil={(sokvag) =>
                        setMeddelanden((alla) =>
                          alla.map((mm) =>
                            mm.id === m.id
                              ? {
                                  ...mm,
                                  ändringar: (mm.ändringar ?? []).map((f) =>
                                    f.sokvag === sokvag ? { ...f, öppen: !f.öppen } : f,
                                  ),
                                }
                              : mm,
                          ),
                        )
                      }
                    />
                  )}
                  {/* V83 B1: rundstatistik — varaktighet · resultat · verktyg. */}
                  {m.rundStatistik && !m.strömmande && (
                    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground/70">
                      {typeof m.rundStatistik.varaktighetMs === "number" && (
                        <span title="Turnens varaktighet (turn.completed.duration)">
                          ⏱ {msText(m.rundStatistik.varaktighetMs)}
                        </span>
                      )}
                      {typeof m.rundStatistik.verktygAntal === "number" && (
                        <span title="Verktygskall denna turn (turn.completed.toolCallCount)">
                          🛠 {m.rundStatistik.verktygAntal}
                        </span>
                      )}
                      {m.rundStatistik.resultatTyp && (
                        <span
                          className={cn(
                            m.rundStatistik.resultatTyp === "success"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400",
                          )}
                          title="Turnens resultat (turn.completed.resultType)"
                        >
                          {m.rundStatistik.resultatTyp === "success" ? "✓ lyckad" : "⚠ " + m.rundStatistik.resultatTyp}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            ),
          )}
          {tankar && (
            <div className="flex justify-end pr-1">
              <p className="max-w-[80%] truncate text-right text-[11px] italic text-muted-foreground/70">{tankar}</p>
            </div>
          )}
        </div>
      </div>

      {/* Uppladdnings-chips */}
      {uppladdningar.length > 0 && (
        <div className="mx-auto w-full max-w-3xl px-3 sm:px-4">
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 [scrollbar-width:thin]">
            {uppladdningar.slice(0, 12).map((u) => (
              <button
                key={u.sokvag}
                onClick={() => infogaSokvag(u.sokvag, u.typ)}
                title={`${u.sokvag} — klicka för att infoga i prompten`}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-gold/30 bg-card px-2.5 py-1 text-[11px] transition-colors hover:border-gold/60"
              >
                {u.typ === "bild" ? (
                  <FileImage className="h-3.5 w-3.5 text-gold" />
                ) : u.typ === "zip" ? (
                  <FileArchive className="h-3.5 w-3.5 text-gold" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-gold" />
                )}
                <span className="max-w-[160px] truncate">{u.sokvag.split("/").slice(2).join("/") || u.sokvag}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Skrivfält */}
      <div className="sticky bottom-0 z-10 border-t border-gold/20 bg-paper/95 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-3 py-2.5 sm:px-4 sm:py-3">
          {draÖver && (
            <div className="mb-2 rounded-lg border-2 border-dashed border-gold/60 bg-gold/5 px-3 py-2 text-center text-xs text-gold">
              Släpp filerna här — de hamnar i uploads/ och agenten kan läsa dem
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              ref={ytaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onPaste={(e) => void påPaste(e)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void skicka();
                }
              }}
              rows={1}
              placeholder="Skriv till agenten… (Enter skickar, Skift+Enter ny rad — /help visar kommandon)"
              className="max-h-40 min-h-[44px] flex-1 resize-none rounded-xl border border-gold/30 bg-card px-3.5 py-2.5 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold/60"
              style={{ height: "auto" }}
            />
            {strömmar ? (
              <Button
                onClick={stoppa}
                variant="outline"
                className="h-11 w-11 shrink-0 rounded-xl border-red-500/40 p-0 text-red-600 hover:bg-red-500/10 dark:text-red-400"
                title="Stoppa agenten"
              >
                <CircleStop className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                onClick={() => void skicka()}
                disabled={!prompt.trim()}
                className="h-11 w-11 shrink-0 rounded-xl bg-gold p-0 text-background hover:bg-gold/90"
                title="Skicka"
              >
                <Send className="h-5 w-5" />
              </Button>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-1">
            <input
              ref={filInputRef}
              type="file"
              multiple
              className="hidden"
              accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.zip,.txt,.md,.json,.csv"
              onChange={(e) => {
                const filer = Array.from(e.target.files ?? []);
                if (filer.length) void laddaUpp(filer);
                e.target.value = "";
              }}
            />
            <input
              ref={(el) => {
                mappInputRef.current = el;
                if (el) {
                  el.setAttribute("webkitdirectory", "");
                  el.setAttribute("directory", "");
                }
              }}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const input = e.target;
                const filer = Array.from(input.files ?? []);
                // webkitRelativePath sitter på varje File — servern bygger om
                // mappstrukturen ur de relativa sökvägarna.
                const relativa = filer.map(
                  (f) => (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name,
                );
                if (filer.length) void laddaUpp(filer, relativa);
                input.value = "";
              }}
            />
            <button
              onClick={() => filInputRef.current?.click()}
              disabled={laddarUpp}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              title="Ladda upp filer (png/jpg/webp/gif/pdf/zip/txt/md/json/csv, max 30 MB/fil)"
            >
              {laddarUpp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Paperclip className="h-3.5 w-3.5" />}
              Fil
            </button>
            <button
              onClick={() => mappInputRef.current?.click()}
              disabled={laddarUpp}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              title="Ladda upp en hel mapp (strukturen bevaras)"
            >
              <FolderUp className="h-3.5 w-3.5" />
              Mapp
            </button>
            <span className="ml-auto hidden items-center gap-1 text-[10px] text-muted-foreground/70 sm:flex">
              <UploadCloud className="h-3 w-3" />
              dra & släpp eller klistra en bild
            </span>
            <span className="ml-auto max-w-[45%] truncate text-[10px] text-muted-foreground/70 sm:hidden">
              {statusText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
