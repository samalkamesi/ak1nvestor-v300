"use client";

import * as React from "react";
import Link from "next/link";

import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bell,
  BellRing,
  Bot,
  Brain,
  Check,
  Dna,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleStop,
  Clock,
  Command,
  Diff,
  Download,
  ExternalLink,
  FilePen,
  FileText,
  FileArchive,
  FileCode,
  FileImage,
  FolderSearch,
  FolderTree,
  Globe,
  Info,
  Landmark,
  Link2,
  ListChecks,
  Loader2,
  Menu,
  MessageCircleQuestion,
  MoreHorizontal,
  Paperclip,
  Pencil,
  PanelLeft,
  PanelRight,
  Pause,
  Play,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Shrink,
  SquarePen,
  Star,
  Target,
  Terminal,
  Trash2,
  UploadCloud,
  Wrench,
  X,
  XCircle,
  Zap,
} from "lucide-react";

import { adminHeaders, adminJsonHeaders } from "@/lib/admin-klient";
import { STUDIO_KOMMANDON, kommandoHjalp, parsaKommando, type StudioKommando } from "@/lib/studio/kommandon";
import { byggChatHtml } from "@/components/ak1a/studio-html-export";
import { StudioMinnePanel } from "@/components/ak1a/studio-minne-panel";
import { StudioAdminPanel } from "@/components/ak1a/studio-admin-panel";
import {
  StudioFardigheterPanel,
  type FardighetMcp,
  type FardighetPlugin,
  type FardighetSkill,
} from "@/components/ak1a/studio-fardigheter-panel";
import { cn } from "@/lib/utils";

/**
 * STUDIO-CHAT — PIXELNÄRA Z CODE-KLON (VÅG 90, STYRELSE-ADMIN-MEGA
 * "TILLÄGG VÅG 90": kundens sanna vision — EXAKT Z Code-upplevelsen).
 *
 * DESIGN (mörkt VS Code/GitHub-dark-tema — FAST, inget tema-växlande):
 *   · Bakgrund #0D1117 · chatt-yta #161B22 · sidebar #010409
 *   · Text #E6EDF3 primär / #8B949E sekundär / #58A6FF länkar+aktiv
 *   · Accent #238636 (grön success) / #DA3633 (röd error) / #D29922 varning
 *   · Ramar #30363D · system-ui · SF Mono (font-mono) för kod/terminal
 *
 * LAYOUT (K2): desktop = 3 KOLUMNER — sidebar 260px (tasks/samtal +
 * "+ Nytt samtal") | chatt flex-1 (fullbredd-block, INGA bubblor) | höger
 * panel 300px (MÅL-checklist · KONTEXT · TERMINAL). Båda kolumnerna är
 * kollapsbara; mobil (< md) = chatt + hamburger-drawer (panelen når via
 * header-knappen som overlay).
 *
 * CHATT (K2): meddelanden = fullbredd-block med tunn separator. Användare
 * = "DU"-etikett + ren text. Agent = "AK1A"-etikett + STATUSCHIPS
 * (Utforskat/Körde/Skrev ✓ — gröna pills härledda ur verktygskorten) +
 * verktygskort (monospace, $-prefix, grå bakgrund, klick = expandera) +
 * diff-badges (+733/−7 per fil) + streaming med blinkande cursor.
 * Input STICKY BOTTOM (#0D1117, "Skriv här…", stor grön skicka-knapp →).
 *
 * ALL logik från våg 81–89 lever kvar OFÖRÄNDRAD under huven (K1):
 * streaming-SSE, verktygskort, live-input, diff + kodvy + redigering,
 * permission/fråge-dialoger + minnesregler + diff-förhandsvisning,
 * multi-session-tabbar (nu renderade som sidebar-tasklista), mål-läget
 * (autonom loop), uppladdning (drag/paste/mapp), minne, färdigheter,
 * admin-verktyg, notiser + långkörningsvakt, sök, kommandopalett,
 * slash-autocomplete, promptbibliotek + historik, rewind/fork, åter-
 * koppling (IndexedDB-cache + 15/30 s-poll), export md/HTML. Tema-
 * växlaren (våg 84 A) är MEDVETET borttagen — våg 90:s tema är FAST
 * mörk; kodvägen (morkLage/vaxlaTema/T-genvägen) är därmed raderad.
 *
 * VÅG 91 (STUDIO-UI, block A3 — STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 91"):
 *   · A3a BILDER I SAMTALET: uppladdade bilder (drag/paste/📎) väljs som
 *     bilagor — 64px-thumbnails med X ovanför skrivfältet, följer med
 *     POST /api/studio/stream {prompt, sessionId?, bilder?} (kontrakt A1d),
 *     visas på det skickade meddelandet; agentens bildreferenser renderas
 *     monospace. Transport utan bildstöd ⇒ toast.
 *   · A3b STYRELSEN 🏛: Landmark-knapp i headern + /styrelsen-kommando →
 *     fråga-fält → POST /api/studio/styrelse {fraga} → mötesvy med fem
 *     rollkort (ORDFÖRANDE/TEKNIK/SÄKERHET/JURIDIK/TILLVÄXT) som tänds
 *     allt eftersom (poll GET ?id=&senast= var 3:e s) → beslutskort med
 *     badge KÖRS DIREKT (#238636) / VÄNTAR KUND (#D29922). 501/saknas ⇒
 *     diskret info-rad (graceful mot A2:s parallellbygge).
 *   · A3c TJÄNSTE-PANELER: kollapsbara sektioner under TERMINAL —
 *     BAKGRUNDSJOBB (lista + avbryt), WEBBLÄSARE, AUTOMATION; varje
 *     sektion dold om endpointen svarar 501/saknas; poll 30 s när öppen.
 *   · A3d AUTONOMI-SIGNAL: GET /api/studio/mal/status pollas (20 s när
 *     fliken syns + vid mount) — aktiv ⇒ pulserande header-badge
 *     "⏱ Arbetar i bakgrunden" (#D29922); övergång aktiv→avslutat ⇒
 *     toast "Agenten avslutade jobbet medan du var borta". Otillgänglig
 *     endpoint = tyst (graceful mot A1:s parallellbygge).
 *
 * VÅG 92 (STUDIO-UI, block B3 — STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 92"):
 *   · WEBBLÄSAR-PANEL: URL-fält + "Öppna"-knapp → POST /api/studio/
 *     tjanster/webblasare {url} → resultatkort (titel länkad #58A6FF,
 *     url, utdrag ≤ 300 tkn — tolererande tolkat mot B2:s rodd) + lista
 *     öppna sidor underåt (klick = kör igen). 501/saknas ⇒ sektion dold.
 *   · AUTOMATION-HANTERAREN: lista (namn + schema + badge aktiv/pausad)
 *     + "Ny automation"-form (namn, schema, prompt) → POST /tjanster/
 *     automation; per rad Pausa/Återuppta → POST …/automation/pausa samt
 *     Radera (confirm) → DELETE …/automation?id=. /automation-kommandot
 *     öppnar panelen (sondar färskt — saknas endpoint ⇒ info-toast).
 *   · BAKGRUNDSKORT FULL: varje jobb = kort med titel, status-färgs-badge
 *     och startad relativ tid + befintlig Avbryt-knapp.
 *   · BILAGE-PROGRESS: användarmeddelandet med bilder visar
 *     "Laddar upp bilaga…" (spinner) tills POST /api/studio/stream svarat,
 *     därefter "Bilaga ✓" (#3FB950) vid varje thumbnail — enkel variant
 *     (skick-väntan = progress), inget nytt API.
 *
 * VÅG 93 (STUDIO-UI, block C3 — STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 93"):
 *   · SERVERN-SPARADE INSTÄLLNINGAR: Inställningar-drawern ⚙ läser
 *     GET /api/studio/installningar vid öppning — en liten rad "Standard:
 *     <modell/läge> (server)" visar serverns default för NYA samtal; varje
 *     modell/läge/tankestyrke-val sparar till SESSIONEN (befintligt) OCH
 *     skickar POST /api/studio/installningar (ENDAST ändrat fält) med diskret
 *     toast "Sparat — gäller nästa samtal". Endpoint 501/saknas ⇒ raden
 *     dold + ingen POST — sessionssparandet består opåverkat (graceful mot
 *     C2:s parallella roddbygge). Gul prick (#D29922) vid drawer-rubriken när
 *     sessionens modell/läge AVVIKER från server-standarden (title förklarar).
 *   · PLUGIN-BRYTARE: Färdigheter ⚡-drawerns plugin-rader får på/av-brytare
 *     (grön #238636 aktiv / grå av, 52 px-tryckyta) → POST /api/studio/
 *     fardigheter {plugin, aktiverad} med OPTIMISTIC update + toast; fel ⇒
 *     återställ + röd toast. GET utan plugins-fält ⇒ brytare dolda.
 *   · /installningar-kommandot (kommandon.ts) öppnar drawern — registret
 *     driver samtidigt slash-autocomplete + kommandopaletten.
 *
 * VÅG 97 (STUDIO-UI, block E2 — STYRELSE-ADMIN-MEGA "VÅG 97"):
 *   · TANKAR-VY: agentens resonemang (ström-kanal "tankar", model.streaming
 *     kind reasoning_delta) samlas PER MEDDELANDE (m.tankar) och renderas
 *     som KOLLAPSBAR sektion OVANFÖR svaret — rubrik "💭 Tankar" (mono,
 *     #8B949E) + chevron. Under streaming: senaste ~2 raderna + "tänker…"-
 *     indikator (spinner); efter klart: kollapsad som standard, klick =
 *     expandera (max-h-60 overflow-auto, kursiv grå 13 px). ALDRIG
 *     tankar-texten i huvudsvaret (kanalen hålls strikt åtskild från
 *     m.text). Historik-inläsning: bär sessionen/meddelandena tankar-fält
 *     (sessionStorage-persistens + ev. framtida server-fält) visas samma
 *     sektion.
 *   · BORTA-REPLAY-RIKARE: borta-bannern ("Agenten har arbetat medan du
 *     var borta") visar upp till 5 SENASTE verktygskörningar direkt i
 *     bannern ($-prefix-mono-rader + ✓/✗ + varaktighet) ur GET
 *     /api/studio/session/events (V93 C4:s replay — aggregerade kort);
 *     fetchen körs nu ÄVEN via reconnect-pollen (återkomst utan reload).
 *     Endpoint 404/501/nätverksfel ⇒ befintligt beteende (graceful —
 *     replay är lyx, historik-vägen består ALWAYS).
 *
 * SKYDD: sidan visar lås-vy; API-rutterna kräver admin — adminHeaders()
 * bär lösenordet i lösenordsläget. INGA hemligheter renderas.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── Typer ────────────────────────────────────────────────────────────────────

/** Ett verktygskalls livscykelkort i chattflödet (merge:as på id). */
interface VerktygKort {
  id: string;
  namn: string;
  steg: "planerad" | "startar" | "kör" | "resultat" | "fel";
  argument?: string;
  beskrivning?: string;
  resultat?: string;
  fel?: string;
  varaktighetMs?: number;
  framsteg?: { elapsedMs?: number; utdata?: string };
  liveInput?: string;
  öppen?: boolean;
}

/** Filändring i turnens diff-panel — ±N rader per fil. */
interface Filandring {
  sokvag: string;
  plus: number;
  minus: number;
  rader: { typ: "+" | "-"; text: string }[];
  /** v4/conversation/fileChanges patch-hunkar med radnummer (kodvyn). */
  punkter?: { oldStart: number; oldLines: number; newStart: number; newLines: number; rader: string[] }[];
  öppen?: boolean;
}

/** Rundstatistik ur turn.started/turn.completed. */
interface RundStatistik {
  varaktighetMs?: number;
  resultatTyp?: string;
  verktygAntal?: number;
}

interface Meddelande {
  id: string;
  roll: "user" | "assistant";
  text: string;
  strömmande?: boolean;
  verktygKort?: VerktygKort[];
  ändringar?: Filandring[];
  rundStatistik?: RundStatistik;
  malIteration?: number;
  fel?: boolean;
  /** VÅG 91 A3a: bildsökvägar (arbetsytan) som bifogades med prompten. */
  bilder?: string[];
  /**
   * VÅG 92 B3: bilage-progress — "laddar" från skick till att POST
   * /api/studio/stream svarat, därefter "klar" (Bilaga ✓). Endastsett för
   * meddelanden med `bilder`; återställd sessionsstate normaliseras till
   * "klar" (skicket svarade för längesedan).
   */
  bilagaStatus?: "laddar" | "klar";
  /**
   * VÅG 97 E2: agentens resonemang (ström-kanal "tankar") samlas PER
   * MEDDELANDE och renderas i TankarVy OVANFÖR svaret — ALDRIG i m.text.
   * Taks vid strömning (TANKAR_TAK) + vid persistens (sparaTabbar).
   */
  tankar?: string;
  /** VÅG 97 E2: tankar-sektionens expanderade tillstånd (kollapsad default). */
  tankarOppen?: boolean;
}

interface Uppladdning {
  sokvag: string;
  typ: string;
  storlek: number;
}

/**
 * VÅG 97 E2: historik-post ur GET /api/studio/stream (session/messages).
 * Servern bär idag {roll, text}; `tankar` följer med NÄR källan har det
 * (klientens IndexedDB-cachar + ev. framtida server-fält) — samma sektion
 * renderas oavsett väg.
 */
interface HistorikPost {
  roll: "user" | "assistant";
  text: string;
  tankar?: string;
}

// ── Multi-session-tabbar (våg 84 B) — renderas som sidebar-tasklista (våg 90) ─

/**
 * En sessionstabb — huvudtabben (huvud=true) kör DEFAULT-transporten; egna
 * tabbar bär varsi per-session-transport på servern. Buffrade meddelanden
 * lever I tabben så inaktiva tabbar fortsätter samla SSE i bakgrunden.
 */
interface Tabb {
  id: string;
  huvud: boolean;
  sessionId: string | null;
  /**
   * VÅG 140 — TRÅDKEDJAN: sessioner som fliken VUXIT IGENOM (äldst först,
   * exklusive nuvarande sessionId). Spara/töm vid sessionsbyte (hej-eventet)
   * gör att en refresh kan återskapa HELA tråden: kandidatens historia +
   * alla föregångares — kunden ser chatten fortsätta i oändlighet, som
   * desktop-Z: en tråd, många sessioner under huven.
   */
  kedja?: string[];
  titel: string;
  meddelanden: Meddelande[];
  utkast: string;
  strömmar: boolean;
  status: string;
  tankar: string;
  kontext: KontextInfo | null;
  rundaTkn: number | null;
  ackumulerat: number;
  historikLasad: boolean;
  /** VÅG 90: senaste aktivitet (ms) — sidbarens relativa tidsstämpel. */
  uppdaterad: number;
}

/** Friska tabb-defaults (allt utom identiteten id/huvud/sessionId/titel). */
function tabbGrund(): Pick<
  Tabb,
  "meddelanden" | "utkast" | "strömmar" | "status" | "tankar" | "kontext" | "rundaTkn" | "ackumulerat" | "historikLasad" | "uppdaterad"
> {
  return {
    meddelanden: [],
    utkast: "",
    strömmar: false,
    status: "",
    tankar: "",
    kontext: null,
    rundaTkn: null,
    ackumulerat: 0,
    historikLasad: false,
    uppdaterad: 0,
  };
}

/** Kortnamn ur en prompt — första tre orden, max ~20 tecken. */
function kortNamn(text: string): string {
  const ren = text.trim().replace(/^\/\S+\s*/, "");
  const ord = ren.split(/\s+/).filter(Boolean);
  if (ord.length === 0) return "Ny tabb";
  const namn = ord.slice(0, 3).join(" ");
  return namn.length > 20 ? `${namn.slice(0, 20)}…` : namn;
}

/** Modellsuffix för badgen — "zai/glm-5.3" → "glm-5.3". */
function modellBadge(modell?: string): string {
  if (!modell) return "—";
  const delar = modell.split("/");
  return (delar.length > 1 ? delar.slice(1).join("/") : modell).slice(0, 16);
}

/** Kort beskrivning per modell i Inställningar-drawern (HÄRLEDD ur config). */
function modellBeskrivning(id: string): string {
  const lag = id.toLowerCase();
  if (lag.includes("5.3-flash")) return "Snabb och lätt — vardagsuppgifter till lägsta kostnad";
  if (lag.includes("5.3")) return "Kraftfullaste — max resonemang för krävande arbete";
  if (lag.includes("5.2")) return "Föregående generation — stabil fullstor modell";
  if (lag.includes("5.1")) return "Äldre generation — pålitlig och beprövad";
  if (lag.includes("turbo")) return "Turbo — fart före djup, bra för enkla jobb";
  if (lag.includes("mock") || lag.includes("demo")) return "Demonstration — ingen riktig modell ansluten";
  return "zai-modell";
}

/** sessionStorage-nyckel: tabbar + buffrade meddelanden (överlever refresh). */
const TABB_LAGRING = "ak1a-studio-tabbar";

// ── Återkopplingspekare (våg 87 H1): senaste session i localStorage ──────────

const SENASTE_SESSION_LAGRING = "ak1a-studio-senaste-sessionId";

function lasSenasteSessionId(): string | null {
  try {
    const v = window.localStorage.getItem(SENASTE_SESSION_LAGRING);
    return typeof v === "string" && v.startsWith("sess_") ? v : null;
  } catch {
    return null;
  }
}

function sparaSenasteSessionId(sessionId: string | null): void {
  try {
    if (sessionId) window.localStorage.setItem(SENASTE_SESSION_LAGRING, sessionId);
    else window.localStorage.removeItem(SENASTE_SESSION_LAGRING);
  } catch {
    // privat läge — pekaren lever bara denna sidad
  }
}

// ── IndexedDB-historik + cache-meta (våg 88 I3) — RÅA API:et, inget lib ──────

const HISTORIK_META_LAGRING = "ak1a-studio-historik-meta";

interface HistorikCachePost {
  sessionId: string;
  /** VÅG 97 E2: tankar följer med i cachen så återkopplingen kan visa sektionen. */
  meddelanden: HistorikPost[];
  sistSparad: number;
}

interface HistorikMeta {
  sessionId: string;
  sistSparad: number;
  antalMeddelanden: number;
}

function oppnaHistorikDb(): Promise<IDBDatabase | null> {
  return new Promise((los) => {
    try {
      const req = indexedDB.open("ak1a-studio", 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains("historik")) {
          req.result.createObjectStore("historik", { keyPath: "sessionId" });
        }
      };
      req.onsuccess = () => los(req.result);
      req.onerror = () => los(null);
      req.onblocked = () => los(null);
    } catch {
      los(null);
    }
  });
}

async function sparaHistorikCache(sessionId: string, meddelanden: HistorikPost[]): Promise<void> {
  if (!sessionId || meddelanden.length === 0) return;
  const db = await oppnaHistorikDb();
  if (!db) return;
  try {
    await new Promise<void>((los, avvisa) => {
      const tx = db.transaction("historik", "readwrite");
      tx.objectStore("historik").put({ sessionId, meddelanden, sistSparad: Date.now() });
      tx.oncomplete = () => los();
      tx.onerror = () => avvisa(tx.error ?? new Error("IndexedDB-skrivning misslyckades"));
      tx.onabort = () => avvisa(tx.error ?? new Error("IndexedDB-transaktionen avbröts"));
    });
    try {
      window.localStorage.setItem(
        HISTORIK_META_LAGRING,
        JSON.stringify({ sessionId, sistSparad: Date.now(), antalMeddelanden: meddelanden.length }),
      );
    } catch {
      // privat läge/quota — metan är lyx
    }
  } catch {
    // skrivskyddad lagring — cachen är lyx
  } finally {
    db.close();
  }
}

async function lasHistorikCache(sessionId: string): Promise<HistorikCachePost | null> {
  if (!sessionId) return null;
  const db = await oppnaHistorikDb();
  if (!db) return null;
  try {
    return await new Promise<HistorikCachePost | null>((los) => {
      const req = db.transaction("historik", "readonly").objectStore("historik").get(sessionId);
      req.onsuccess = () => {
        const post = req.result as HistorikCachePost | undefined;
        los(post && Array.isArray(post.meddelanden) && post.meddelanden.length > 0 ? post : null);
      };
      req.onerror = () => los(null);
    });
  } catch {
    return null;
  } finally {
    db.close();
  }
}

function lasHistorikMeta(): HistorikMeta | null {
  try {
    const rå = window.localStorage.getItem(HISTORIK_META_LAGRING);
    if (!rå) return null;
    const m = JSON.parse(rå) as Partial<HistorikMeta>;
    if (
      typeof m.sessionId !== "string" ||
      typeof m.sistSparad !== "number" ||
      typeof m.antalMeddelanden !== "number"
    ) {
      return null;
    }
    return m as HistorikMeta;
  } catch {
    return null;
  }
}

// ── Skrivfältets minne (våg 86 G1/G2): promptbibliotek + prompthistorik ──────

const PROMPT_LAGRING = "ak1a-studio-prompter";
const PROMPT_HISTORIK_LAGRING = "ak1a-studio-prompthistorik";
const MAX_PROMPTER = 50;
const MAX_PROMPT_HISTORIK = 50;

interface SparadPrompt {
  text: string;
  skapad: number;
}

function lasPrompter(): SparadPrompt[] {
  try {
    const rå = localStorage.getItem(PROMPT_LAGRING);
    if (!rå) return [];
    const pars = JSON.parse(rå) as unknown;
    if (!Array.isArray(pars)) return [];
    return pars
      .filter(
        (p): p is SparadPrompt =>
          !!p && typeof (p as SparadPrompt).text === "string" && (p as SparadPrompt).text.trim() !== "",
      )
      .map((p) => ({ text: p.text, skapad: typeof p.skapad === "number" ? p.skapad : 0 }))
      .slice(0, MAX_PROMPTER);
  } catch {
    return [];
  }
}

function lasPromptHistorik(): string[] {
  try {
    const rå = localStorage.getItem(PROMPT_HISTORIK_LAGRING);
    if (!rå) return [];
    const pars = JSON.parse(rå) as unknown;
    if (!Array.isArray(pars)) return [];
    return pars
      .filter((t): t is string => typeof t === "string" && t.trim() !== "")
      .map((t) => t.trim())
      .slice(0, MAX_PROMPT_HISTORIK);
  } catch {
    return [];
  }
}

/** Tak för det som persistas per tabb (sessionStorage-quota är öm). */
const MAX_TABB_MEDDELANDEN = 200;
const MAX_TABB_TEXT = 20_000;

function sparaTabbar(tabbar: Tabb[], aktivTabbId: string): void {
  try {
    sessionStorage.setItem(
      TABB_LAGRING,
      JSON.stringify({
        version: 1,
        sparad: Date.now(),
        aktivTabbId,
        tabbar: tabbar.map((t) => ({
          ...t,
          utkast: t.utkast.slice(0, 5_000),
          strömmar: false,
          status: "",
          tankar: "",
          meddelanden: t.meddelanden.slice(-MAX_TABB_MEDDELANDEN).map((m) => ({
            ...m,
            text: m.text.slice(0, MAX_TABB_TEXT),
            // VÅG 97 E2: tankar överlever refresh (kollapsad, svans-budget).
            ...(m.tankar !== undefined ? { tankar: m.tankar.slice(-8_000) } : {}),
            tankarOppen: false,
            verktygKort: m.verktygKort?.map((k) => ({
              ...k,
              argument: k.argument?.slice(0, 2_000),
              resultat: k.resultat?.slice(0, 2_000),
              fel: k.fel?.slice(0, 2_000),
              liveInput: k.liveInput?.slice(-500),
              öppen: false,
            })),
            ändringar: m.ändringar?.map((f) => ({
              ...f,
              rader: f.rader.slice(0, 50),
              punkter: f.punkter?.slice(0, 20).map((p) => ({ ...p, rader: p.rader.slice(0, 40) })),
              öppen: false,
            })),
          })),
        })),
      }),
    );
  } catch {
    // quota/privat läge — tabbar lever i minnet
  }
}

function lasTabbar(): { aktivTabbId: string; tabbar: Tabb[] } | null {
  try {
    const rå = sessionStorage.getItem(TABB_LAGRING);
    if (!rå) return null;
    const pars = JSON.parse(rå) as { version?: number; aktivTabbId?: string; tabbar?: Tabb[] };
    if (pars.version !== 1 || !Array.isArray(pars.tabbar) || pars.tabbar.length === 0) return null;
    const tabbar = pars.tabbar
      .filter((t) => typeof t?.id === "string" && t.id)
      .map((t) => ({
        ...tabbGrund(),
        ...t,
        uppdaterad: typeof t.uppdaterad === "number" ? t.uppdaterad : 0,
        strömmar: false,
        status: "",
        tankar: "",
        // VÅG 92 B3: bilage-progress överlever ej en sidoladdning — ett
        // sparat "laddar" (POST bröts av navigeringen) visas som klart.
        // VÅG 97 E2: tankar-sektionen startar KOLLAPSAD efter läsning.
        meddelanden: t.meddelanden.map((m) =>
          m
            ? {
                ...m,
                ...(m.bilagaStatus === "laddar" ? { bilagaStatus: "klar" as const } : {}),
                tankarOppen: false,
              }
            : m,
        ),
      }));
    if (tabbar.length === 0) return null;
    if (!tabbar.some((t) => t.huvud)) tabbar[0].huvud = true;
    const aktiv =
      typeof pars.aktivTabbId === "string" && tabbar.some((t) => t.id === pars.aktivTabbId)
        ? pars.aktivTabbId
        : tabbar[0].id;
    return { aktivTabbId: aktiv, tabbar };
  } catch {
    return null;
  }
}

/** Modellpost ur GET /api/studio/modeller (härledd ur config.json). */
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
  lage?: string;
  tankeNiva?: string;
}

// ── Interaktioner (våg 83 B2): permission + fråga ────────────────────────────

interface PermissionAlternativ {
  optionId: string;
  namn: string;
  beskrivning?: string;
}

interface PermissionDialog {
  requestId: string;
  verktyg: string;
  risk: string;
  skäl?: string;
  sammanfattning: string;
  alternativ: PermissionAlternativ[];
  diff?: Filandring;
}

interface FragaDialog {
  requestId: string;
  fråga: string;
  inputTyp?: string;
  val?: string[];
}

const PERMISSION_ETIKETT: Record<string, string> = {
  allow_once: "Tillåt en gång",
  allow_project: "Tillåt för projektet",
  deny: "Neka",
};

/** Risk-badge-färg per riskLevel (low/medium/high/critical) — våg 90-palett. */
function riskFarg(risk: string): string {
  switch (risk) {
    case "low":
      return "bg-[#238636]/15 text-[#3FB950]";
    case "medium":
      return "bg-[#D29922]/15 text-[#D29922]";
    case "high":
      return "bg-[#DB6D28]/15 text-[#DB6D28]";
    case "critical":
      return "bg-[#DA3633]/20 text-[#F85149]";
    default:
      return "bg-[#30363D] text-[#8B949E]";
  }
}

// ── Verktygsriskklassning + minnesregler + långkörningsnotis (våg 84 C) ──────

interface Verktygsrisk {
  etikett: string;
  farg: string;
  forklaring: string;
}

function verktygsriskKlass(verktyg: string): Verktygsrisk {
  const n = verktyg.toLowerCase();
  if (
    n === "bash" ||
    n === "write" ||
    n === "edit" ||
    n === "multiedit" ||
    n === "notebookedit" ||
    n === "notebookeditcell" ||
    n.startsWith("bash")
  ) {
    return {
      etikett: "skrivande",
      farg: "bg-[#DB6D28]/15 text-[#DB6D28]",
      forklaring: "Skrivande verktyg — ändrar filer eller kör kommandon (Bash/Write/Edit = orange)",
    };
  }
  if (n === "read" || n === "glob" || n === "grep" || n === "ls" || n === "listfiles") {
    return {
      etikett: "läsande",
      farg: "bg-[#238636]/15 text-[#3FB950]",
      forklaring: "Läsande verktyg — ändrar ingenting (Read/Glob/Grep = grön)",
    };
  }
  if (n === "websearch" || n === "webfetch" || n === "websearchquery" || n === "webreader") {
    return {
      etikett: "nät",
      farg: "bg-[#D29922]/15 text-[#D29922]",
      forklaring: "Nätverkverktyg — hämtar från webben (WebSearch/WebFetch = gul)",
    };
  }
  return {
    etikett: "annat",
    farg: "bg-[#30363D] text-[#8B949E]",
    forklaring: "Oklassat verktyg (t.ex. MCP) — klassas som varken läsande eller skrivande",
  };
}

interface PermissionRegel {
  verktyg: string;
  omfattning: "alltid";
  skapad: number;
}

const REGEL_NYCKEL = "ak1a-studio-regler";

function lasReglerUrLagring(): PermissionRegel[] {
  try {
    const rader = window.localStorage.getItem(REGEL_NYCKEL);
    if (!rader) return [];
    const parsad = JSON.parse(rader) as unknown;
    if (!Array.isArray(parsad)) return [];
    const ut: PermissionRegel[] = [];
    for (const r of parsad) {
      const p = r as { verktyg?: unknown; omfattning?: unknown; skapad?: unknown };
      if (typeof p?.verktyg === "string" && p.verktyg && p?.omfattning === "alltid") {
        ut.push({ verktyg: p.verktyg, omfattning: "alltid", skapad: typeof p.skapad === "number" ? p.skapad : Date.now() });
      }
    }
    return ut;
  } catch {
    return [];
  }
}

const TURN_NOTIS_TRAOSKEL_MS = 60_000;

// ── Notishistorik (våg 86 G6) ────────────────────────────────────────────────

interface NotisPost {
  text: string;
  typ: "lang" | "klar" | "fel";
  tid: number;
}

const NOTIS_LAGRING = "ak1a-studio-notiser";
const MAX_NOTISER = 50;

function lasNotiserUrLagring(): NotisPost[] {
  try {
    const rader = window.localStorage.getItem(NOTIS_LAGRING);
    if (!rader) return [];
    const parsad = JSON.parse(rader) as unknown;
    if (!Array.isArray(parsad)) return [];
    const ut: NotisPost[] = [];
    for (const r of parsad) {
      const p = r as { text?: unknown; typ?: unknown; tid?: unknown };
      if (typeof p?.text === "string" && p.text && (p?.typ === "lang" || p?.typ === "klar" || p?.typ === "fel")) {
        ut.push({ text: p.text, typ: p.typ, tid: typeof p.tid === "number" ? p.tid : Date.now() });
      }
    }
    return ut.slice(-MAX_NOTISER);
  } catch {
    return [];
  }
}

/** Post ur GET /api/studio/session (session/list, berikad). */
interface SessionPost {
  sessionId: string;
  titel?: string;
  status?: string;
  arbetsyta?: string;
  uppdaterad?: string;
  modell?: string;
  turns?: number;
  tokens?: number;
}

interface SubagentPost {
  barnSessionId: string;
  titel: string;
  typ?: string;
  status: string;
  startad?: string;
  avslutad?: string;
  sammanfattning?: string;
}

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
    | "ändringar"
    | "mal_status"
    | "mal_iteration"
    | "mal_pausad";
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
  aktiv?: boolean;
  pausad?: boolean;
  iteration?: number;
  mal?: string | null;
  interaktion?:
    | ({
        typ: "permission";
        requestId: string;
        verktyg: string;
        risk: string;
        skäl?: string;
        sammanfattning: string;
        alternativ: PermissionAlternativ[];
        diff?: Filandring;
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

const KONTEXT_TAK_RESERV = 1_000_000;
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

/** VÅG 90: KLUMP-relativ tid för sidbarens tasklista — "nu"/"2m"/"1h"/"3d". */
function tidKort(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return tidKortMs(Date.now() - d.getTime());
}

/** VÅG 90: KLUMP-relativ tid ur en ålder i ms ("nu"/"2m"/"1h"/"3d"/"2v"). */
function tidKortMs(ms: number): string {
  if (ms < 60_000) return "nu";
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const dagar = Math.floor(h / 24);
  if (dagar < 14) return `${dagar}d`;
  return `${Math.floor(dagar / 7)}v`;
}

/** Badge-färg per subagent-status — våg 90-palett. */
function agentStatusFarg(status: string): string {
  switch (status) {
    case "running":
      return "bg-[#238636]/15 text-[#3FB950]";
    case "waiting":
      return "bg-[#D29922]/15 text-[#D29922]";
    case "blocked":
      return "bg-[#DA3633]/15 text-[#F85149]";
    case "success":
      return "bg-[#238636]/10 text-[#3FB950]/80";
    case "failed":
    case "lost":
      return "bg-[#DA3633]/10 text-[#F85149]/80";
    default:
      return "bg-[#30363D] text-[#8B949E]";
  }
}

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

// ── Filträd + förhandsgranskning (våg 83 B4) ─────────────────────────────────

interface TradNod {
  namn: string;
  typ: "mapp" | "fil";
  storlek: number;
  sokvag: string;
  barn?: TradNod[];
}

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

// ── Agentens minne (våg 84 D) ────────────────────────────────────────────────

interface MinnePost {
  namn: string;
  storlek: number;
  uppdaterad?: number;
  beskrivning?: string;
  typ: "index" | "agents" | "minne";
  innehåll: string;
  trunkerad?: boolean;
}

const MINNES_MALL = (namn: string) =>
  [
    "---",
    `name: ${namn}`,
    "description: Kort beskrivning av vad agenten ska minnas",
    "metadata:",
    "  node_type: memory",
    "  type: project",
    "---",
    "",
    "Faktum/text som agenten ska minnas — kunden kan rätta rader här.",
    "",
  ].join("\n");

const AGENTS_MALL = [
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

const MINNES_NAMN_RE = /^[a-z0-9][a-z0-9\-]*\.md$/;

function rensaFrontmatter(text: string): string {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trimStart();
}

/**
 * Bildreferenser i en text — matchar agentens upload-sökvägar.
 * Dedupe i tur- och ordning; existens verifieras av servern (onError gömmer).
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

function bildUrl(sokvag: string): string {
  return `/api/studio/filer?sokvag=${encodeURIComponent(sokvag)}&bild=1`;
}

// ── VÅG 91 A3b: STYRELSEN 🏛 — typer + tolererande tolkning av A2:s API ──────

/** En händelse i styrelsemötet (roll + inlägg) — rollId = matchad av de fem. */
interface StyrelseHandelse {
  roll: string;
  rollId: string | null;
  text: string;
  /** Motorns händelsetyp (mote_startad/roll_start/… ) — för visningstext. */
  typ: string;
  /** Löpnummer (A2:s kontrakt) — dedupe-identitet när det finns. */
  i: number | null;
}

/** Beslutskortet: BESLUT / MOTIVERING / ÅTGÄRDER + existential-flaggan (R2). */
interface StyrelseBeslutVy {
  beslut: string;
  motivering: string;
  atgarder: string[];
  existential: boolean;
}

/** Ett pågående/kört möte — pollas var 3:e s tills beslutet landar. */
interface StyrelseMote {
  id: string;
  fraga: string;
  händelser: StyrelseHandelse[];
  beslut: StyrelseBeslutVy | null;
}

/** De fem rollerna (A2:s rollagenter) — tänds allt eftersom de rapporterar. */
const STYRELSE_ROLLER = [
  { id: "ordforande", etikett: "ORDFÖRANDE", match: ["ordforande", "ordf", "ceo"] },
  { id: "teknik", etikett: "TEKNIK", match: ["teknik", "cto"] },
  { id: "sakerhet", etikett: "SÄKERHET", match: ["sakerhet", "security"] },
  { id: "juridik", etikett: "JURIDIK", match: ["juridik", "compliance"] },
  { id: "tillvaxt", etikett: "TILLVÄXT", match: ["tillvaxt", "growth", "seo"] },
] as const;

/** Första sträng i ett okänt objekt som matchar någon av nycklarna ("" annars). */
function strUr(obj: Record<string, unknown>, nycklar: string[]): string {
  for (const n of nycklar) {
    const v = obj[n];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

/** Normalisera svensk text för matchning (åäö→aao, gemener). */
function styrelseNorm(text: string): string {
  return text.toLowerCase().replace(/[åä]/g, "a").replace(/ö/g, "o");
}

/** Matcha en händelsetext mot de fem rollerna → rollId eller null. */
function styrelseRoll(text: string): string | null {
  const norm = styrelseNorm(text);
  if (!norm) return null;
  for (const r of STYRELSE_ROLLER) {
    for (const m of r.match) {
      if (norm.includes(m)) return r.id;
    }
  }
  return null;
}

/** Motorns händelsetyper → kort visningstext (monoraden i mötesvyn). */
const STYRELSE_TYP_TEXT: Record<string, string> = {
  mote_startad: "mötet startat",
  vag_start: "vågen kör",
  roll_start: "diskuterar",
  roll_klar: "har redovisat",
  roll_ute: "kunde ej delta",
  vag_slut: "vågen klar",
  ordforande_start: "ordföranden syntetiserar",
  beslut_klart: "beslut fattat",
  mote_slut: "mötet avslutat",
  fel: "fel i mötet",
};

/** Åtgärdslista ur okänd JSON — strängar eller objekt med text-fält. */
function atgarderUr(rå: unknown): string[] {
  if (!Array.isArray(rå)) return [];
  const ut: string[] = [];
  for (const a of rå) {
    if (typeof a === "string" && a.trim()) {
      ut.push(a.trim());
    } else if (a && typeof a === "object") {
      const t = strUr(a as Record<string, unknown>, ["text", "atgard", "beskrivning", "titel", "title"]);
      if (t) ut.push(t);
    }
  }
  return ut.slice(0, 20);
}

/** Beslut ur ett okänt GET-svar — objekt, sträng eller fält på roten. */
function beslutUr(d: Record<string, unknown>): StyrelseBeslutVy | null {
  const rå = d.beslut ?? d.beslutKort ?? d.slutsats;
  if (rå && typeof rå === "object") {
    const b = rå as Record<string, unknown>;
    const text = strUr(b, ["beslut", "text", "slutsats"]);
    if (!text) return null;
    return {
      beslut: text,
      motivering: strUr(b, ["motivering", "skal", "motiv"]),
      atgarder: atgarderUr(b.atgarder ?? b["åtgärder"]),
      existential:
        b.existential === true ||
        b.existentiell === true ||
        /vantar\s*kund/i.test(strUr(b, ["status"])) ||
        strUr(d, ["atgardsStatus"]) === "VANTAR_KUND",
    };
  }
  if (typeof rå === "string" && rå.trim()) {
    return {
      beslut: rå.trim(),
      motivering: strUr(d, ["motivering", "skal"]),
      atgarder: atgarderUr(d.atgarder ?? d["åtgärder"]),
      existential: d.existential === true || d.atgardsStatus === "VANTAR_KUND",
    };
  }
  return null;
}

/** Tolka GET /api/studio/styrelse-svaret (händelser + beslut), tolererande. */
function tolkaStyrelseSvar(data: unknown): { händelser: StyrelseHandelse[]; beslut: StyrelseBeslutVy | null } {
  const d = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  const råLista = Array.isArray(d.handelser)
    ? d.handelser
    : Array.isArray(d["händelser"])
      ? d["händelser"]
      : Array.isArray(d.events)
        ? d.events
        : [];
  const händelser: StyrelseHandelse[] = [];
  for (const rå of råLista) {
    if (!rå || typeof rå !== "object") continue;
    const e = rå as Record<string, unknown>;
    const roll = strUr(e, ["roll", "role", "agent", "namn"]);
    const text = strUr(e, ["text", "meddelande", "inlagg", "analys", "sammanfattning", "innehall", "innehåll"]);
    const typ = strUr(e, ["typ", "type"]);
    if (!roll && !text && !typ) continue;
    händelser.push({ roll, rollId: styrelseRoll(`${roll} ${text}`), text, typ, i: typeof e.i === "number" ? e.i : null });
  }
  return { händelser, beslut: beslutUr(d) };
}

/** Dedupe-signatur för en händelse (löpnummer om motorn ger det, annars innehåll). */
function handelseSignatur(h: StyrelseHandelse): string {
  if (typeof h.i === "number") return `#${h.i}`;
  return `${h.typ}|${h.roll}|${h.text}`.slice(0, 160);
}

/** Slå ihop mottagna händelser med befintliga (dedupe, tak 100). */
function slagIhopHandelser(befintliga: StyrelseHandelse[], nya: StyrelseHandelse[]): StyrelseHandelse[] {
  if (nya.length === 0) return befintliga;
  const sett = new Set(befintliga.map(handelseSignatur));
  const ut = [...befintliga];
  for (const h of nya) {
    const sig = handelseSignatur(h);
    if (sig === "|" || sig === "||" || sett.has(sig)) continue;
    sett.add(sig);
    ut.push(h);
  }
  return ut.slice(-100);
}

/** Rollens läge i mötesvyn: väntar → talar (något inlägg) → klar (beslut). */
function styrelseRollStatus(
  rollId: string,
  händelser: StyrelseHandelse[],
  beslut: StyrelseBeslutVy | null,
): "vantar" | "talar" | "klar" {
  if (beslut) return "klar";
  return händelser.some((h) => h.rollId === rollId) ? "talar" : "vantar";
}

// ── VÅG 91 A3c: TJÄNSTE-PANELER — typer + tolererande normalisering ──────────

/** En rad i en tjänste-panel (bakgrundsjobb/webbläsare/automation). */
interface TjansteRad {
  id: string;
  titel: string;
  status: string;
  /** VÅG 92 B3: automation — cron/schemauttrycket (t.ex. "0 7 * * *"). */
  schema?: string;
  /** VÅG 92 B3: automation — aktiverad-flaggan (false = pausad). */
  aktiverad?: boolean;
  /** VÅG 92 B3: bakgrund — startad (ISO-sträng) för relativ tidsstämpel. */
  startad?: string;
  /** VÅG 92 B3: kategori (taskKind/typ) — bakgrundskortets mono-etikett. */
  typ?: string;
}

type TjansteNamn = "bakgrund" | "webblasare" | "automation";

/** Panelens tillstånd — finns=false döljer sektionen (endpoint 501/saknas). */
interface TjansteTillstand {
  finns: boolean;
  oppen: boolean;
  laddar: boolean;
  rader: TjansteRad[];
}

const TJANSTE_NAMN: readonly TjansteNamn[] = ["bakgrund", "webblasare", "automation"];

/** Panel-metadata: etikett + ikon + vad raderna visar. */
const TJANSTE_INFO: readonly { namn: TjansteNamn; etikett: string; ikon: "klocka" | "glob" | "zap"; tom: string }[] = [
  { namn: "bakgrund", etikett: "Bakgrundsjobb", ikon: "klocka", tom: "Inga bakgrundsjobb just nu." },
  { namn: "webblasare", etikett: "Webbläsare", ikon: "glob", tom: "Inga webbläsarsessioner just nu." },
  { namn: "automation", etikett: "Automation", ikon: "zap", tom: "Inga automationer körs just nu." },
];

/** Normalisera okänt GET /api/studio/tjanster/*-svar → visningsrader. */
function tjansteRaderUr(data: unknown): TjansteRad[] {
  let lista: unknown[] = [];
  if (Array.isArray(data)) {
    lista = data;
  } else if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    for (const nyckel of [
      "jobb",
      "poster",
      "lista",
      "sessioner",
      "rader",
      "tasks",
      "items",
      "floden",
      "automationer", // VÅG 92 B3: /tjanster/automation GET {automationer}
      "blasare", // VÅG 92 B3: /tjanster/webblasare GET {blasare}
    ]) {
      if (Array.isArray(d[nyckel])) {
        lista = d[nyckel] as unknown[];
        break;
      }
    }
  }
  const ut: TjansteRad[] = [];
  for (const rå of lista.slice(0, 30)) {
    if (!rå || typeof rå !== "object") continue;
    const r = rå as Record<string, unknown>;
    const id = strUr(r, ["id", "taskId", "jobId", "sessionId"]);
    const titel = strUr(r, ["titel", "title", "namn", "name", "beskrivning", "description", "url", "mal"]) || id;
    const status = strUr(r, ["status", "typ", "lage", "state"]);
    if (!id && !titel) continue;
    // VÅG 92 B3: schemat (cron), aktiverad-flaggan, startad-tid + typ —
    // tolererant mot både v91- och v92-form (B1/B2 bygger parallellt).
    const schema = strUr(r, ["schema", "cron", "cronExpr", "schedule", "intervall"]);
    const startad = strUr(r, ["startad", "startedAt", "startTime", "createdAt", "skapad", "nastaKorning"]);
    const aktiverad = [r.aktiverad, r.enabled, r.aktiv].find((v) => typeof v === "boolean");
    const typ = strUr(r, ["typ", "taskKind"]);
    ut.push({
      id: id || titel,
      titel,
      status,
      ...(schema ? { schema } : {}),
      ...(startad ? { startad } : {}),
      ...(typeof aktiverad === "boolean" ? { aktiverad } : {}),
      ...(typ ? { typ } : {}),
    });
  }
  return ut;
}

/** Körs statusen fortfarande? (styr Avbryt-knappen i Bakgrundsjobb-panelen). */
function tjansteKor(status: string): boolean {
  return /run|kör|koer|pågå|pagar|väntar|vantar|wait|block|start|activ|live/i.test(status);
}

// ── VÅG 92 B3: WEBBLÄSAR-RESULTAT — tolererande tolkning av POST {url} ───────

/** Resultatkortet för en öppnad sida (titel länkad + url + utdrag). */
interface WebblasareResultat {
  titel: string;
  url: string;
  utdrag: string;
}

/**
 * Normalisera en URL för fältet — saknas schema sätts https:// (studion
 * öppnar aldrig osäkra adresser avsiktligt).
 */
function normaliseraUrl(url: string): string {
  const trimmad = url.trim();
  if (!trimmad) return "";
  return /^https?:\/\//i.test(trimmad) ? trimmad : `https://${trimmad}`;
}

/**
 * Tolka POST /api/studio/tjanster/webblasare {url}-svaret (VÅG 92 B2/B3).
 * B2:s v92-rodd sätter strukturerade fält; äldre/formlös form bär det hela
 * i "resultat" — båda vägarna söks (ett djup), med url-fallback till den
 * begärda adressen så kortet alltid blir klickbart.
 */
function webblasareResultatUr(data: unknown, begardUrl: string): WebblasareResultat | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const kallor: Record<string, unknown>[] = [d];
  if (d.resultat && typeof d.resultat === "object") kallor.push(d.resultat as Record<string, unknown>);
  for (const k of kallor) {
    const titel = strUr(k, ["titel", "title", "namn", "name"]);
    const url = strUr(k, ["url", "sida", "adress", "link", "href"]) || begardUrl;
    const utdrag = strUr(k, ["utdrag", "excerpt", "sammanfattning", "summary", "beskrivning", "description", "text", "innehall", "innehåll"]);
    if (titel || utdrag) {
      return { titel: titel || url, url, utdrag: utdrag.slice(0, 300) };
    }
  }
  // Ogenomskinligt svar (t.ex. {resultat:{…}} utan kända fält) — visa
  // kortet med adressen + rå innehåll trunkat, så kunden ser att det körde.
  const rå =
    typeof d.resultat === "string"
      ? d.resultat
      : d.resultat !== undefined
        ? JSON.stringify(d.resultat)
        : "";
  if (!rå && !begardUrl) return null;
  return { titel: begardUrl, url: begardUrl, utdrag: rå.slice(0, 300) };
}

/** VÅG 92 B3: är automationen pausad? (status/lifecycleStatus + flaggan). */
function automationPausad(rad: TjansteRad): boolean {
  if (rad.aktiverad === false) return true;
  if (rad.aktiverad === true) return false;
  return /paus|pause|inaktiv|disable|suspend/i.test(rad.status);
}

// ── Kommandopalett + sök-highlight (våg 84 A) ────────────────────────────────

interface PalettPost {
  id: string;
  etikett: string;
  beskrivning: string;
  grupp: "Kommandon" | "Modeller";
  ikon: "kommando" | "modell";
  sokbar: string;
  kor: () => void;
}

interface SokTräff {
  meddelandeId: string;
  forekomst: number;
}

interface MarkRaknare {
  n: number;
}

/**
 * Text med sökträffar → noder med <mark>. VÅG 90: aktiv träff = blå
 * (#58A6FF-botten med mörk text), övriga = subtil guldbock — läsbara
 * mot #161B22.
 */
function markeraVanlig(
  text: string,
  fras: string,
  aktivForekomst: number,
  raknare?: MarkRaknare,
): React.ReactNode[] | string {
  if (!fras) return text;
  const hojd = text.toLowerCase();
  const f = fras.toLowerCase();
  if (f === "" || !hojd.includes(f)) return text;
  const ut: React.ReactNode[] = [];
  let pos = 0;
  let i = hojd.indexOf(f, pos);
  while (i >= 0) {
    if (i > pos) ut.push(text.slice(pos, i));
    const nummer = raknare ? raknare.n++ : 0;
    ut.push(
      <mark
        key={`mark-${i}`}
        className={
          nummer === aktivForekomst
            ? "rounded-sm bg-[#58A6FF] px-0.5 font-semibold text-[#0D1117]"
            : "rounded-sm bg-[#D29922]/35 px-0.5 text-inherit"
        }
      >
        {text.slice(i, i + f.length)}
      </mark>,
    );
    pos = i + f.length;
    i = hojd.indexOf(f, pos);
  }
  if (pos < text.length) ut.push(text.slice(pos));
  return ut;
}

function raknaForekomster(text: string, fras: string): number {
  if (!fras) return 0;
  return text.toLowerCase().split(fras.toLowerCase()).length - 1;
}

// ── Markdown (Z Code-mörk tolkning + kodblock) ───────────────────────────────

/** Inline-markdown → noder; länkar #58A6FF, kod i grå #30363D-chip. */
function renderInline(
  text: string,
  keyPrefix: string,
  sok?: { fras: string; aktiv: number; raknare: MarkRaknare },
): React.ReactNode[] {
  const ut: React.ReactNode[] = [];
  const segments = text.split(
    /(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*|`[^`]+`|_[^_]+_|\*[^*\n]+\*)/g,
  );
  segments.forEach((seg, i) => {
    if (!seg) return;
    if (seg.startsWith("[") && seg.includes("](")) {
      const label = seg.slice(1, seg.indexOf("]"));
      const href = seg.slice(seg.indexOf("](") + 2, -1);
      const säker = /^(https?:\/\/|\/|#)/i.test(href);
      ut.push(
        säker ? (
          <Link key={`${keyPrefix}-a${i}`} href={href} className="text-[#58A6FF] underline decoration-[#58A6FF]/40 underline-offset-2 hover:underline" target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>
            {label}
          </Link>
        ) : (
          <span key={`${keyPrefix}-a${i}`}>{label}</span>
        ),
      );
    } else if (seg.startsWith("**") && seg.endsWith("**")) {
      ut.push(<strong key={`${keyPrefix}-b${i}`} className="font-semibold text-[#E6EDF3]">{seg.slice(2, -2)}</strong>);
    } else if (seg.startsWith("`") && seg.endsWith("`") && seg.length > 2) {
      ut.push(
        <code key={`${keyPrefix}-c${i}`} className="rounded-sm border border-[#30363D] bg-[#0D1117] px-1 py-0.5 font-mono text-[0.85em] text-[#E6EDF3]">
          {seg.slice(1, -1)}
        </code>,
      );
    } else if ((seg.startsWith("_") && seg.endsWith("_")) || (seg.startsWith("*") && seg.endsWith("*"))) {
      ut.push(<em key={`${keyPrefix}-i${i}`}>{seg.slice(1, -1)}</em>);
    } else if (sok && sok.fras) {
      const markerad = markeraVanlig(seg, sok.fras, sok.aktiv, sok.raknare);
      if (typeof markerad === "string") {
        ut.push(markerad);
      } else {
        markerad.forEach((nod, j) => ut.push(<React.Fragment key={`${keyPrefix}-s${i}-${j}`}>{nod}</React.Fragment>));
      }
    } else {
      ut.push(seg);
    }
  });
  return ut;
}

/** Block-markdown: kodblock (#0D1117 + språktagg), rubriker, listor, stycken. */
function StudioMarkdown({
  text,
  markera,
}: {
  text: string;
  markera?: { fras: string; aktivForekomst: number };
}): React.JSX.Element {
  const block = React.useMemo(() => {
    const delar: React.ReactNode[] = [];
    const sok =
      markera && markera.fras
        ? { fras: markera.fras, aktiv: markera.aktivForekomst, raknare: { n: 0 } as MarkRaknare }
        : undefined;
    const segment = text.split(/```/);
    segment.forEach((seg, i) => {
      if (i % 2 === 1) {
        const rader = seg.replace(/^\n/, "").split("\n");
        const första = rader[0]?.trim() ?? "";
        const sprak = /^[a-zA-Z0-9+-]{0,20}$/.test(första) && första !== "" ? första : "";
        const kropp = (sprak ? rader.slice(1) : rader).join("\n").replace(/\n$/, "");
        delar.push(
          <pre
            key={`kod-${i}`}
            className="mt-3 overflow-x-auto rounded-md border border-[#30363D] bg-[#0D1117] p-3 font-mono text-xs leading-relaxed text-[#E6EDF3] [-webkit-overflow-scrolling:touch]"
          >
            {sprak && <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#8B949E]">{sprak}</div>}
            <code>{sok ? markeraVanlig(kropp, sok.fras, sok.aktiv, sok.raknare) : kropp}</code>
          </pre>,
        );
        return;
      }
      const rader = seg.split("\n");
      let listBuffert: string[] = [];
      const spolaLista = (nyckel: string) => {
        if (listBuffert.length === 0) return;
        delar.push(
          <ul key={nyckel} className="mt-3 list-disc space-y-1 pl-5 marker:text-[#8B949E]">
            {listBuffert.map((l, j) => (
              <li key={j} className="leading-relaxed">
                {renderInline(l, `${nyckel}-${j}`, sok)}
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
            <h3 key={`h-${i}-${j}`} className="mt-4 text-base font-semibold tracking-tight text-[#E6EDF3]">
              {renderInline(ren.slice(3), `h${i}-${j}`, sok)}
            </h3>,
          );
        } else if (ren.startsWith("### ")) {
          spolaLista(`l${i}-${j}`);
          delar.push(
            <h4 key={`h4-${i}-${j}`} className="mt-3 text-sm font-semibold tracking-tight text-[#E6EDF3]">
              {renderInline(ren.slice(4), `h4${i}-${j}`, sok)}
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
              {renderInline(ren, `p${i}-${j}`, sok)}
            </p>,
          );
        }
      });
      spolaLista(`sista-${i}`);
    });
    return delar;
  }, [text, markera]);
  /* VÅG 96 D2 (b): telefon-läsbarhet — 15 px + rymlig radhöjd på mobil
     (sm:text-sm återställer), brödtext max 65 ch (max-w-prose, sm: full
     bredd) och kodblock scrollas horisontellt med touch-momentum ovan. */
  return <div className="max-w-prose text-[15px] leading-relaxed text-[#E6EDF3] sm:max-w-none sm:text-sm">{block}</div>;
}

// ── Inställningar-drawerns radioregel (52 px tryckyta) ───────────────────────

function InstallningarRad({
  vald,
  titel,
  beskrivning,
  val,
  onClick,
  disabled,
  jobbar,
}: {
  vald: boolean;
  titel: string;
  beskrivning?: string;
  val?: string;
  onClick: () => void;
  disabled?: boolean;
  jobbar?: boolean;
}): React.JSX.Element {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={vald}
      onClick={onClick}
      disabled={disabled}
      title={val ? `${titel} (${val})` : titel}
      className={cn(
        "flex min-h-[52px] w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
        vald ? "bg-[#58A6FF]/10" : "hover:bg-[#161B22]",
        disabled && "cursor-default opacity-50",
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
          vald ? "border-[#58A6FF]" : "border-[#30363D]",
        )}
        aria-hidden
      >
        {vald && <span className="h-2 w-2 rounded-full bg-[#58A6FF]" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-sm font-medium", vald ? "text-[#58A6FF]" : "text-[#E6EDF3]")}>
          {titel}
        </span>
        {beskrivning && (
          <span className="mt-0.5 block leading-snug text-[11px] text-[#8B949E]">{beskrivning}</span>
        )}
      </span>
      {jobbar && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[#58A6FF]" />}
    </button>
  );
}

/** Filikon per ändelse (#58A6FF-tonad som VS Code:s fillista). */
function filIkon(namn: string): React.ReactNode {
  const andelse = namn.toLowerCase().split(".").pop() ?? "";
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(andelse)) {
    return <FileImage className="h-3.5 w-3.5 shrink-0 text-[#8B949E]" />;
  }
  if (andelse === "zip") return <FileArchive className="h-3.5 w-3.5 shrink-0 text-[#8B949E]" />;
  return <FileText className="h-3.5 w-3.5 shrink-0 text-[#8B949E]" />;
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
          className="flex w-full items-center gap-1 rounded-md px-1.5 py-1 text-left text-[12px] text-[#E6EDF3]/90 transition-colors hover:bg-[#161B22]"
          style={{ paddingLeft: 6 + djup * 14 }}
          title={nod.sokvag}
        >
          {arOppen ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#8B949E]" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#8B949E]" />
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
      className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[12px] text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3]"
      style={{ paddingLeft: 10 + djup * 14 }}
      title={`${nod.sokvag} — ${byteStorlek(nod.storlek)}`}
    >
      {filIkon(nod.namn)}
      <span className="min-w-0 flex-1 truncate">{nod.namn}</span>
      <span className="shrink-0 font-mono text-[9px] text-[#484F58]">{byteStorlek(nod.storlek)}</span>
    </button>
  );
}

// ── Verktygskort (Z Code-stil: $-prefix, mono, grå bakgrund, expandera) ──────

/** Formattera millisekunder läsbart (1234 → "1,2 s"; 456 → "456 ms"). */
function msText(ms: number): string {
  if (ms >= 1000) return (ms / 1000).toFixed(1).replace(".", ",") + " s";
  return Math.round(ms) + " ms";
}

/** Verktygsikon per namn. */
function verktygsIkon(namn: string): React.ReactNode {
  const n = namn.toLowerCase();
  if (n === "bash" || n.includes("terminal")) return <Terminal className="h-3.5 w-3.5 shrink-0 text-[#8B949E]" />;
  if (n.startsWith("read")) return <FileText className="h-3.5 w-3.5 shrink-0 text-[#8B949E]" />;
  if (n.startsWith("write") || n === "edit" || n === "multiedit" || n.includes("notebook")) {
    return <FilePen className="h-3.5 w-3.5 shrink-0 text-[#8B949E]" />;
  }
  if (n.includes("grep")) return <Search className="h-3.5 w-3.5 shrink-0 text-[#8B949E]" />;
  if (n.includes("glob")) return <FolderSearch className="h-3.5 w-3.5 shrink-0 text-[#8B949E]" />;
  if (n.includes("todo")) return <ListChecks className="h-3.5 w-3.5 shrink-0 text-[#8B949E]" />;
  if (n.includes("websearch")) return <Globe className="h-3.5 w-3.5 shrink-0 text-[#8B949E]" />;
  if (n.includes("webfetch") || n.includes("fetch")) return <Link2 className="h-3.5 w-3.5 shrink-0 text-[#8B949E]" />;
  return <Wrench className="h-3.5 w-3.5 shrink-0 text-[#8B949E]" />;
}

/**
 * Kortrubrik av argumenten: plockar det mest läsbara fältet ur JSON:en —
 * "Bash: ls uploads/", "Read: src/lib/…", "Grep: finans*".
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
  if (kort.steg === "fel") return <XCircle className="h-3.5 w-3.5 shrink-0 text-[#F85149]" />;
  if (kort.steg === "resultat") return <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#3FB950]" />;
  return <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[#D29922]" />;
}

// ── VÅG 90 K2: STATUSCHIPS — agentens handlingar som gröna pills ─────────────

/**
 * Agentens statuschips (spec: "Utforskat ✓ / Körde ✓ / Skrev ✓ — gröna
 * små pills"): härleds ur svarets VERKTYGSKORT (äkta data — inga gissningar):
 *   Utforskat = Read/Glob/Grep/LS · Körde = Bash/Terminal · Skrev =
 *   Write/Edit/MultiEdit/Notebook · Webb = WebSearch/WebFetch.
 * Pill-tillstånd: ✓ (minst ett resultat), spinner (pågående), ✗ (enbart fel).
 */
interface StatusChip {
  etikett: string;
  tillstånd: "klara" | "kör" | "fel" | "blandat";
  antal: number;
}

function statusChips(kort?: VerktygKort[]): StatusChip[] {
  if (!kort || kort.length === 0) return [];
  const klassa = (namn: string): number => {
    const n = namn.toLowerCase();
    if (n.startsWith("read") || n.includes("glob") || n.includes("grep") || n === "ls" || n === "listfiles") return 0;
    if (n === "bash" || n.includes("terminal") || n.startsWith("bash")) return 1;
    if (n.startsWith("write") || n === "edit" || n === "multiedit" || n.includes("notebook")) return 2;
    if (n.includes("websearch") || n.includes("webfetch") || n.includes("fetch") || n.includes("webreader")) return 3;
    return -1;
  };
  const etiketter = ["Utforskat", "Körde", "Skrev", "Webb"];
  const grupper = new Map<number, { klara: number; kör: number; fel: number }>();
  for (const k of kort) {
    const g = klassa(k.namn);
    if (g < 0) continue;
    const post = grupper.get(g) ?? { klara: 0, kör: 0, fel: 0 };
    if (k.steg === "fel") post.fel += 1;
    else if (k.steg === "resultat") post.klara += 1;
    else post.kör += 1;
    grupper.set(g, post);
  }
  const ut: StatusChip[] = [];
  for (const [g, p] of grupper) {
    ut.push({
      etikett: etiketter[g],
      tillstånd: p.klara > 0 ? (p.fel > 0 || p.kör > 0 ? "blandat" : "klara") : p.kör > 0 ? "kör" : "fel",
      antal: p.klara + p.kör + p.fel,
    });
  }
  return ut;
}

/** VÅG 90 K2: en statuschip-pill — grön ✓ / spinner / röd ✗. */
function StatusChipPill({ chip }: { chip: StatusChip }): React.JSX.Element {
  const klar = chip.tillstånd === "klara" || chip.tillstånd === "blandat";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
        chip.tillstånd === "klara" && "bg-[#238636]/15 text-[#3FB950]",
        chip.tillstånd === "blandat" && "bg-[#238636]/15 text-[#3FB950]",
        chip.tillstånd === "kör" && "bg-[#D29922]/15 text-[#D29922]",
        chip.tillstånd === "fel" && "bg-[#DA3633]/15 text-[#F85149]",
      )}
      title={`${chip.etikett} — ${chip.antal} verktygskall${chip.tillstånd === "kör" ? " (pågår)" : chip.tillstånd === "fel" ? " (misslyckades)" : ""}`}
    >
      {klar ? <Check className="h-3 w-3" /> : chip.tillstånd === "kör" ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
      {chip.etikett}
      {klar && <span aria-hidden>✓</span>}
    </span>
  );
}

// ── Webb-verktygens visualisering (våg 86 G4) ────────────────────────────────

function webVerktygInfo(kort: VerktygKort): { typ: "fetch"; url: string } | { typ: "search"; fråga: string } | null {
  const n = kort.namn.toLowerCase();
  const arSok = n.includes("websearch");
  const arFetch = n.includes("webfetch") || n.includes("fetch") || n.includes("webreader");
  if (!arSok && !arFetch) return null;
  const kalla = kort.argument || kort.liveInput || "";
  if (!kalla) return null;
  let url = "";
  let fråga = "";
  try {
    const p = JSON.parse(kalla) as Record<string, unknown>;
    const falt = (...nycklar: string[]): string => {
      for (const k of nycklar) {
        const v = p[k];
        if (typeof v === "string" && v.trim()) return v.trim();
      }
      return "";
    };
    url = falt("url", "link", "uri", "href");
    fråga = falt("query", "q", "fråga", "search");
  } catch {
    const um = kalla.match(/https?:\/\/[^\s"'<>)]+/i);
    if (um) url = um[0];
    const qm = kalla.match(/"query"\s*:\s*"([^"]*)/i);
    if (qm) fråga = qm[1];
  }
  if (arSok) return fråga ? { typ: "search", fråga } : null;
  return url ? { typ: "fetch", url } : null;
}

function FaviconIkon({ url }: { url: string }): React.JSX.Element {
  const [fel, setFel] = React.useState(false);
  let domän = "";
  try {
    domän = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname;
  } catch {
    domän = "";
  }
  if (fel || !domän) return <Globe className="h-[18px] w-[18px] shrink-0 text-[#8B949E]" aria-hidden />;
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domän)}&sz=32`}
      alt={domän}
      width={18}
      height={18}
      loading="lazy"
      onError={() => setFel(true)}
      className="h-[18px] w-[18px] shrink-0 rounded-sm"
    />
  );
}

/**
 * Verktygskortet (Z Code-stil): monospace-rad med $-prefix, grå #0D1117-
 * bakgrund, klick = expandera (argument + live-progress + resultat/fel).
 * Live-input + webb-rad syns även kollapsat.
 */
function VerktygsKortVy({
  kort,
  onVaxla,
}: {
  kort: VerktygKort;
  onVaxla: (id: string) => void;
}): React.JSX.Element {
  const kör = kort.steg === "planerad" || kort.steg === "startar" || kort.steg === "kör";
  const web = webVerktygInfo(kort);
  const webResultat =
    web && kort.resultat && !kort.öppen
      ? kort.resultat.length > 300
        ? kort.resultat.slice(0, 300) + "…"
        : kort.resultat
      : "";
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border text-left font-mono",
        kort.steg === "fel" ? "border-[#DA3633]/50 bg-[#DA3633]/5" : "border-[#30363D] bg-[#0D1117]",
      )}
    >
      <button
        onClick={() => onVaxla(kort.id)}
        className="flex min-h-[52px] w-full items-center gap-1.5 px-2.5 py-1.5 text-left transition-colors hover:bg-[#161B22] sm:min-h-0"
        title={kort.beskrivning ?? kortRubrik(kort)}
      >
        {kort.öppen ? (
          <ChevronDown className="h-3 w-3 shrink-0 text-[#8B949E]" />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0 text-[#8B949E]" />
        )}
        {/* VÅG 90 K2: $-prefix — Z Code-terminalkänslan. */}
        <span className="shrink-0 text-[11px] text-[#3FB950]" aria-hidden>
          $
        </span>
        {verktygsIkon(kort.namn)}
        <span className="min-w-0 flex-1 truncate text-[11px] leading-tight text-[#E6EDF3]/90">
          {kortRubrik(kort)}
        </span>
        {typeof kort.varaktighetMs === "number" && !kör && (
          <span className="shrink-0 text-[9px] text-[#484F58]">{msText(kort.varaktighetMs)}</span>
        )}
        {kortStatus(kort)}
      </button>
      {/* Live-input medan agenten skriver argumenten — syns även kollapsat. */}
      {kör && kort.liveInput && (
        <p className="truncate border-t border-[#21262D] px-2.5 py-1 text-[10px] leading-tight text-[#D29922]">
          {kort.liveInput.slice(-96)}
          <span className="studio-cursor ml-0.5 inline-block h-3 w-[2px] bg-[#D29922] align-text-bottom" />
        </p>
      )}
      {web && (
        <div className="space-y-1 border-t border-[#21262D] px-2.5 py-1.5">
          {web.typ === "fetch" ? (
            <a
              href={web.url}
              target="_blank"
              rel="noopener noreferrer"
              title={web.url}
              className="flex min-w-0 items-center gap-1.5 rounded-md py-0.5"
            >
              <FaviconIkon url={web.url} />
              <span className="min-w-0 flex-1 truncate text-[11px] text-[#58A6FF] underline decoration-[#58A6FF]/40 underline-offset-2">
                {web.url}
              </span>
              <ExternalLink className="h-3 w-3 shrink-0 text-[#8B949E]" />
            </a>
          ) : (
            <p className="flex min-w-0 items-center gap-1.5" title={web.fråga}>
              <span className="shrink-0 text-[11px]" aria-hidden>
                🔍
              </span>
              <span className="shrink-0 text-[10px] uppercase tracking-wider text-[#8B949E]">sökte efter:</span>
              <span className="min-w-0 flex-1 truncate rounded-full border border-[#30363D] bg-[#161B22] px-2 py-0.5 text-[11px] text-[#E6EDF3]/90">
                {web.fråga}
              </span>
            </p>
          )}
          {webResultat && (
            <p className="whitespace-pre-wrap break-words text-[10px] leading-relaxed text-[#8B949E]">
              {webResultat}{" "}
              {(kort.resultat?.length ?? 0) > 300 && (
                <button
                  onClick={() => onVaxla(kort.id)}
                  className="font-sans font-medium text-[#58A6FF] underline underline-offset-2"
                  title="Expandera kortet (samma växling som ▶-vronen)"
                >
                  hela resultatet
                </button>
              )}
            </p>
          )}
        </div>
      )}
      {kort.öppen && (
        <div className="space-y-2 border-t border-[#21262D] px-2.5 py-2">
          {kort.argument && (
            <div>
              <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#8B949E]">Argument</p>
              <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded border border-[#21262D] bg-[#010409] p-2 text-[10px] leading-relaxed text-[#E6EDF3]">{kort.argument}</pre>
            </div>
          )}
          {kör && kort.framsteg?.utdata && (
            <div>
              <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#8B949E]">
                Live{typeof kort.framsteg.elapsedMs === "number" ? " · " + msText(kort.framsteg.elapsedMs) : ""}
              </p>
              <pre className="max-h-24 overflow-auto whitespace-pre-wrap break-words rounded border border-[#21262D] bg-[#010409] p-2 text-[10px] leading-relaxed text-[#E6EDF3]">{kort.framsteg.utdata}</pre>
            </div>
          )}
          {kort.resultat && (
            <div>
              <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#8B949E]">Resultat</p>
              <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words rounded border border-[#21262D] bg-[#010409] p-2 text-[10px] leading-relaxed text-[#E6EDF3]">{kort.resultat}</pre>
            </div>
          )}
          {kort.fel && (
            <div>
              <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#F85149]">Fel</p>
              <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words rounded border border-[#DA3633]/40 bg-[#DA3633]/10 p-2 text-[10px] leading-relaxed text-[#F85149]">{kort.fel}</pre>
            </div>
          )}
          {!kort.argument && !kort.resultat && !kort.fel && !kort.framsteg?.utdata && (
            <p className="text-[10px] text-[#484F58]">Väntar på att verktyget ska börja…</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── VÅG 97 E2: TANKAR-VY — agentens resonemang som kollapsbar sektion ────────

/** Tak per meddelande (tecken) — svansen behålls när resonemanget är långt. */
const TANKAR_TAK = 16_000;

/**
 * Tankar-sektionen (VÅG 97 E2): agentens resonemang (ström-kanal "tankar")
 * samlas PER MEDDELANDE och visas OVANFÖR svaret — ALDRIG i själva
 * svartexten (kanalen hålls strikt åtskild i stream-hanterarna).
 *   · Under streaming: senaste ~2 raderna + "tänker…"-indikator (spinner).
 *   · Efter klart: kollapsad som standard — klick = expandera
 *     (max-h-60 overflow-auto, kursiv grå 13 px-text).
 * Tryckyta: 52 px på mobil (sm:min-h-0 på desktop) — VerktygsKort-mönstret.
 */
function TankarVy({
  tankar,
  strömmande,
  oppen,
  onVaxla,
}: {
  tankar: string;
  strömmande: boolean;
  oppen: boolean;
  onVaxla: () => void;
}): React.JSX.Element {
  if (strömmande) {
    // Peek-läge: senaste ~2 icke-tomma raderna (fallback: svansens tecken).
    const rader = tankar.split("\n").filter((r) => r.trim() !== "");
    const peek = rader.slice(-2).join("\n") || tankar.slice(-160);
    return (
      <div
        className="mb-2 rounded-md border border-[#30363D] bg-[#0D1117] px-2.5 py-1.5"
        title="Agenten resonerar — resonemanget samlas här och blir kollapsbart när svaret är klart"
      >
        <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#8B949E]">
          <Loader2 className="h-3 w-3 shrink-0 animate-spin text-[#D29922]" aria-hidden />
          💭 Tankar <span className="font-normal normal-case tracking-normal">— tänker…</span>
        </p>
        {peek && (
          <p className="mt-1 line-clamp-2 whitespace-pre-wrap break-words text-[13px] italic leading-snug text-[#8B949E]">
            {peek}
          </p>
        )}
      </div>
    );
  }
  const antalRader = tankar.split("\n").filter((r) => r.trim() !== "").length;
  return (
    <div className="mb-2 overflow-hidden rounded-md border border-[#30363D] bg-[#0D1117]">
      <button
        type="button"
        onClick={onVaxla}
        aria-expanded={oppen}
        title={oppen ? "Fäll ihop agentens resonemang" : "Visa agentens resonemang (samlades medan svaret byggdes)"}
        className="flex min-h-[52px] w-full items-center gap-1.5 px-2.5 py-1.5 text-left transition-colors hover:bg-[#161B22] sm:min-h-0"
      >
        {oppen ? (
          <ChevronDown className="h-3 w-3 shrink-0 text-[#8B949E]" aria-hidden />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0 text-[#8B949E]" aria-hidden />
        )}
        <span className="font-mono text-[11px] text-[#8B949E]">💭 Tankar</span>
        <span className="ml-auto shrink-0 font-mono text-[9px] text-[#484F58]">
          {antalRader} {antalRader === 1 ? "rad" : "rader"}
        </span>
      </button>
      {oppen && (
        <p className="max-h-60 overflow-auto whitespace-pre-wrap break-words border-t border-[#21262D] px-2.5 py-2 text-[13px] italic leading-relaxed text-[#8B949E]">
          {tankar}
        </p>
      )}
    </div>
  );
}

// ── Inline-kodvy (våg 85 F5): syntax + ändringsmarkering ─────────────────────

/**
 * Enkel tokenisering per rad — VÅG 90: GitHub-dark-syntax (nyckelord
 * #FF7B72, strängar #A5D6FF, kommentarer #8B949E, tal #79C0FF).
 */
const KOD_NYCKELORD = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while", "do",
  "import", "from", "export", "default", "async", "await", "class", "extends",
  "new", "type", "interface", "enum", "public", "private", "protected", "readonly",
  "static", "throw", "try", "catch", "finally", "switch", "case", "break",
  "continue", "typeof", "instanceof", "in", "of", "as", "null", "undefined",
  "true", "false", "void", "never", "this", "super", "yield", "implements",
]);

const KOD_FARGER = {
  nyckelord: "text-[#FF7B72]",
  strang: "text-[#A5D6FF]",
  kommentar: "text-[#8B949E]",
  tal: "text-[#79C0FF]",
  rubrik: "text-[#79C0FF] font-bold",
} as const;

function markeraKodRad(rad: string, typ: string, nyckel: string): React.ReactNode[] {
  if (typ === "md") {
    if (/^\s*#{1,6}\s/.test(rad)) {
      return [
        <span key={`${nyckel}-h`} className={KOD_FARGER.rubrik}>
          {rad}
        </span>,
      ];
    }
    const delar = rad.split(/(`[^`]*`|\*\*[^*]+\*\*|\[[^\]]*\]\([^)]*\))/g);
    return delar.map((d, i) =>
      d.startsWith("`") || d.startsWith("[") ? (
        <span key={`${nyckel}-m${i}`} className={KOD_FARGER.strang}>
          {d}
        </span>
      ) : d.startsWith("**") ? (
        <span key={`${nyckel}-m${i}`} className={KOD_FARGER.rubrik}>
          {d}
        </span>
      ) : (
        <span key={`${nyckel}-m${i}`}>{d}</span>
      ),
    );
  }
  const re =
    /(\/\/.*$|\/\*.*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d[\d_]*(?:\.\d+)?\b)|([A-Za-z_$][A-Za-z0-9_$]*)/g;
  const ut: React.ReactNode[] = [];
  let sist = 0;
  let n = 0;
  for (let m = re.exec(rad); m !== null; m = re.exec(rad)) {
    if (m.index > sist) ut.push(<span key={`${nyckel}-t${n++}`}>{rad.slice(sist, m.index)}</span>);
    const [träff, kommentar, strang, tal, ord] = m;
    let klass: string | undefined;
    if (kommentar) klass = KOD_FARGER.kommentar;
    else if (strang) klass = KOD_FARGER.strang;
    else if (tal) klass = KOD_FARGER.tal;
    else if (ord && KOD_NYCKELORD.has(ord)) klass = KOD_FARGER.nyckelord;
    ut.push(
      klass ? (
        <span key={`${nyckel}-k${n++}`} className={klass}>
          {träff}
        </span>
      ) : (
        <span key={`${nyckel}-k${n++}`}>{träff}</span>
      ),
    );
    sist = m.index + träff.length;
  }
  if (sist < rad.length) ut.push(<span key={`${nyckel}-t${n++}`}>{rad.slice(sist)}</span>);
  return ut;
}

/** Absolut agentsökväg → arbetsytans relativa (API:t kräver relativ form). */
function relativSokvag(sokvag: string, arbetsyta?: string): string {
  if (!sokvag.startsWith("/")) return sokvag;
  const rot = arbetsyta?.replace(/\/+$/, "");
  if (rot && sokvag.startsWith(`${rot}/`)) return sokvag.slice(rot.length + 1);
  return sokvag;
}

function kodSprak(namn: string): string {
  const ande = (namn.toLowerCase().split(".").pop() ?? "").trim();
  return ande === "md" || ande === "markdown" ? "md" : "kod";
}

/**
 * EXPANDERAD KODVY för en fil i diff-panelen — hämtar filen via GET
 * /api/studio/filer?sokvag=…, syntaxmarkerar, markerar ändrade rader GULT,
 * rena borttagningar RÖDA spökrader, max 200 rader + REDIGERA i plan-läge.
 */
function KodvyFil({
  fil,
  arbetsyta,
  planLage,
}: {
  fil: Filandring;
  arbetsyta?: string;
  planLage: boolean;
}): React.JSX.Element {
  const relativ = relativSokvag(fil.sokvag, arbetsyta);
  const [innehall, setInnehall] = React.useState<string | null>(null);
  const [fel, setFel] = React.useState("");
  const [laddar, setLaddar] = React.useState(true);
  const [redigerar, setRedigerar] = React.useState(false);
  const [utkast, setUtkast] = React.useState("");
  const [sparar, setSparar] = React.useState(false);
  const [notis, setNotis] = React.useState("");

  React.useEffect(() => {
    let aktiv = true;
    (async () => {
      setLaddar(true);
      setFel("");
      setNotis("");
      try {
        const res = await fetch(`/api/studio/filer?sokvag=${encodeURIComponent(relativ)}`, {
          headers: adminHeaders(),
        });
        const data = (await res.json()) as {
          fel?: string;
          forhandsgranskning?: { slag?: string; innehåll?: string; meddelande?: string; orsak?: string };
        };
        if (!aktiv) return;
        if (data.fel) {
          setFel(data.fel);
        } else if (
          data.forhandsgranskning?.slag === "text" &&
          typeof data.forhandsgranskning.innehåll === "string"
        ) {
          setInnehall(data.forhandsgranskning.innehåll);
        } else {
          setFel(
            data.forhandsgranskning?.meddelande ??
              data.forhandsgranskning?.orsak ??
              "Filen kan inte förhandsgranskas.",
          );
        }
      } catch (e) {
        if (aktiv) setFel(e instanceof Error ? e.message.slice(0, 160) : "Filen kunde ej hämtas.");
      } finally {
        if (aktiv) setLaddar(false);
      }
    })();
    return () => {
      aktiv = false;
    };
  }, [relativ]);

  const markerade = React.useMemo(() => {
    const gula = new Set<number>();
    const roda = new Map<number, number>();
    const rader = (innehall ?? "").split("\n");
    if (fil.punkter && fil.punkter.length > 0) {
      for (const p of fil.punkter) {
        if (p.newLines > 0) {
          for (let i = 0; i < p.newLines; i++) gula.add(p.newStart + i);
        } else if (p.oldLines > 0) {
          roda.set(p.newStart, Math.max(roda.get(p.newStart) ?? 0, p.oldLines));
        }
      }
    } else {
      let pekare = 0;
      for (const r of fil.rader) {
        if (r.typ !== "+") continue;
        const mal = r.text.trim();
        if (!mal) continue;
        for (let i = pekare; i < rader.length; i++) {
          if (rader[i].trim() === mal) {
            gula.add(i + 1);
            pekare = i + 1;
            break;
          }
        }
      }
    }
    return { gula, roda };
  }, [innehall, fil]);

  const spara = async (): Promise<void> => {
    setSparar(true);
    setNotis("");
    try {
      const res = await fetch("/api/studio/filer", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ sokvag: relativ, innehall: utkast }),
      });
      const data = (await res.json()) as { fel?: string; spara?: string; storlek?: number };
      if (data.fel) {
        setNotis(`Kunde ej spara: ${data.fel}`);
      } else {
        setInnehall(utkast);
        setRedigerar(false);
        setNotis(`✓ Filen sparad (${data.storlek ?? utkast.length} B) — nästa agent-turn ser ändringen.`);
      }
    } catch (e) {
      setNotis(`Kunde ej spara: ${e instanceof Error ? e.message.slice(0, 140) : "nätverksfel"}`);
    } finally {
      setSparar(false);
    }
  };

  const sprak = kodSprak(fil.sokvag.split("/").pop() ?? "");
  const allaRader = (innehall ?? "").split("\n");
  const MAX_VISADE = 200;
  const visade = allaRader.slice(0, MAX_VISADE);
  const gömda = allaRader.length - visade.length;

  return (
    <div className="border-t border-[#21262D] bg-[#0D1117]">
      {laddar ? (
        <p className="flex items-center gap-1.5 px-2.5 py-2 text-[10px] text-[#8B949E]">
          <Loader2 className="h-3 w-3 animate-spin text-[#58A6FF]" /> Läser filen…
        </p>
      ) : fel ? (
        <p className="px-2.5 py-2 text-[10px] leading-relaxed text-[#8B949E]">
          Kodvy ej tillgänglig: {fel}
        </p>
      ) : redigerar ? (
        <div className="p-2">
          <textarea
            value={utkast}
            onChange={(e) => setUtkast(e.target.value)}
            spellCheck={false}
            rows={14}
            className="w-full resize-y rounded-md border border-[#30363D] bg-[#010409] px-2 py-1.5 font-mono text-[11px] leading-relaxed text-[#E6EDF3] outline-none focus:border-[#58A6FF]"
          />
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => void spara()}
              disabled={sparar}
              className="flex items-center gap-1 rounded-md bg-[#238636] px-2.5 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-[#2EA043] disabled:opacity-50"
            >
              {sparar ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Spara
            </button>
            <button
              onClick={() => {
                setRedigerar(false);
                setNotis("");
              }}
              disabled={sparar}
              className="rounded-md border border-[#30363D] px-2 py-1 text-[10px] text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] disabled:opacity-50"
            >
              Avbryt
            </button>
            <span className="text-[9px] text-[#484F58]">
              Skrivs till agentens workspace — nästa turn ser ändringen.
            </span>
          </div>
          {notis && (
            <p className={cn("mt-1.5 text-[10px]", notis.startsWith("✓") ? "text-[#3FB950]" : "text-[#F85149]")}>
              {notis}
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1.5 border-b border-[#21262D] px-2.5 py-1">
            <FileCode className="h-3 w-3 shrink-0 text-[#8B949E]" />
            <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-[#8B949E]" title={relativ}>
              {relativ}
            </span>
            <span className="shrink-0 text-[9px] text-[#484F58]">{allaRader.length} rader</span>
            {planLage && innehall !== null && (
              <button
                onClick={() => {
                  setUtkast(innehall);
                  setNotis("");
                  setRedigerar(true);
                }}
                className="flex shrink-0 items-center gap-1 rounded-md border border-[#30363D] px-1.5 py-0.5 text-[9px] font-semibold text-[#E6EDF3] transition-colors hover:bg-[#161B22]"
                title="Redigera filen (endast plan-läge) — sparas till agentens workspace"
              >
                <Pencil className="h-3 w-3" /> Redigera
              </button>
            )}
          </div>
          <pre className="max-h-72 overflow-auto px-2.5 py-1.5 font-mono text-[10px] leading-relaxed">
            {visade.map((rad, i) => {
              const nummer = i + 1;
              const gul = markerade.gula.has(nummer);
              return (
                <span
                  key={i}
                  className={cn(
                    "flex gap-2 whitespace-pre-wrap break-all rounded-sm px-1",
                    gul && "bg-[#D29922]/20",
                  )}
                >
                  <span className="w-8 shrink-0 select-none text-right text-[#484F58]">{nummer}</span>
                  <span className="min-w-0 flex-1">{markeraKodRad(rad, sprak, `r${i}`)}</span>
                </span>
              );
            })}
            {[...markerade.roda.entries()].map(([pos, antal]) =>
              pos <= MAX_VISADE ? (
                <span
                  key={`ghost-${pos}`}
                  className="flex gap-2 rounded-sm bg-[#DA3633]/20 px-1 text-[#F85149]"
                  title={`${antal} borttagna rader (diff-motorn)`}
                >
                  <span className="w-8 shrink-0 select-none text-right opacity-60">{pos}</span>
                  <span className="min-w-0 flex-1">
                    − {antal} borttagen{antal > 1 ? "a rader" : " rad"} (existerar ej i filen)
                  </span>
                </span>
              ) : null,
            )}
            {gömda > 0 && (
              <span className="block px-1 pt-1 text-[#484F58]">
                … {gömda} rader till (kodvyn visar max {MAX_VISADE})
              </span>
            )}
          </pre>
          {notis && (
            <p
              className={cn(
                "border-t border-[#21262D] px-2.5 py-1.5 text-[10px]",
                notis.startsWith("✓") ? "text-[#3FB950]" : "text-[#F85149]",
              )}
            >
              {notis}
            </p>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Diff-panelen per turn (Z Code-stil) — filrader med gröna (+N)/röda (−N)
 * BADGES på filnamnet, klicka ut filen för kodvy + rad-diff.
 */
function AndringsPanel({
  andringar,
  onVaxlaFil,
  arbetsyta,
  planLage,
}: {
  andringar: Filandring[];
  onVaxlaFil: (sokvag: string) => void;
  arbetsyta?: string;
  planLage: boolean;
}): React.JSX.Element {
  return (
    <div className="mt-2 overflow-hidden rounded-md border border-[#30363D] bg-[#0D1117]">
      <p className="flex items-center gap-1.5 border-b border-[#21262D] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8B949E]">
        <Diff className="h-3.5 w-3.5 text-[#8B949E]" />
        Ändringar denna rundan ({andringar.length} {andringar.length === 1 ? "fil" : "filer"})
      </p>
      <ul>
        {andringar.map((f) => (
          <li key={f.sokvag} className="border-b border-[#21262D] last:border-b-0">
            <button
              onClick={() => onVaxlaFil(f.sokvag)}
              className="flex min-h-[52px] w-full items-center gap-1.5 px-2.5 py-1.5 text-left transition-colors hover:bg-[#161B22] sm:min-h-0"
              title={f.sokvag}
            >
              {f.öppen ? (
                <ChevronDown className="h-3 w-3 shrink-0 text-[#8B949E]" />
              ) : (
                <ChevronRight className="h-3 w-3 shrink-0 text-[#8B949E]" />
              )}
              <FilePen className="h-3 w-3 shrink-0 text-[#8B949E]" />
              <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-[#E6EDF3]/90">
                {f.sokvag.split("/").slice(-2).join("/")}
              </span>
              {/* VÅG 90 K2: diff-badges — grönt (+N) / rött (−N). */}
              {f.plus > 0 && (
                <span className="shrink-0 rounded-full bg-[#238636]/15 px-1.5 font-mono text-[10px] font-bold text-[#3FB950]">
                  +{f.plus}
                </span>
              )}
              {f.minus > 0 && (
                <span className="shrink-0 rounded-full bg-[#DA3633]/15 px-1.5 font-mono text-[10px] font-bold text-[#F85149]">
                  −{f.minus}
                </span>
              )}
            </button>
            {f.öppen && (
              <>
                <KodvyFil fil={f} arbetsyta={arbetsyta} planLage={planLage} />
                {f.rader.length > 0 && (
                  <pre className="max-h-64 overflow-auto border-t border-[#21262D] bg-[#010409] px-2.5 py-1.5 font-mono text-[10px] leading-relaxed">
                    {f.rader.map((r, i) => (
                      <span
                        key={i}
                        className={cn(
                          "block whitespace-pre-wrap break-all",
                          r.typ === "+" ? "bg-[#238636]/10 text-[#3FB950]" : "bg-[#DA3633]/10 text-[#F85149]",
                        )}
                      >
                        {r.typ === "+" ? "+" : "−"} {r.text || " "}
                      </span>
                    ))}
                  </pre>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * DIFF-FÖRHANDSVISNING i permission-dialogen — exakt vad Write/Edit ändrar,
 * FÄRGKODAT (gröna +/röda −rader) INNAN användaren väljer.
 */
function DiffForhandsvisning({ diff }: { diff: Filandring }): React.JSX.Element {
  return (
    <div className="mt-2 overflow-hidden rounded-md border border-[#30363D] bg-[#0D1117]">
      <p className="flex items-center gap-1.5 border-b border-[#21262D] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8B949E]">
        <Diff className="h-3.5 w-3.5 text-[#8B949E]" />
        Diff-förhandsvisning
      </p>
      <div className="flex items-center gap-1.5 border-b border-[#21262D] px-2.5 py-1.5" title={diff.sokvag}>
        <FilePen className="h-3 w-3 shrink-0 text-[#8B949E]" />
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-[#E6EDF3]/90">
          {diff.sokvag.split("/").slice(-2).join("/")}
        </span>
        {diff.plus > 0 && (
          <span className="shrink-0 rounded-full bg-[#238636]/15 px-1.5 font-mono text-[10px] font-bold text-[#3FB950]">+{diff.plus}</span>
        )}
        {diff.minus > 0 && (
          <span className="shrink-0 rounded-full bg-[#DA3633]/15 px-1.5 font-mono text-[10px] font-bold text-[#F85149]">−{diff.minus}</span>
        )}
      </div>
      <pre className="max-h-56 overflow-auto px-2.5 py-1.5 font-mono text-[10px] leading-relaxed">
        {diff.rader.map((r, i) => (
          <span
            key={i}
            className={cn(
              "block whitespace-pre-wrap break-all",
              r.typ === "+" ? "bg-[#238636]/10 text-[#3FB950]" : "bg-[#DA3633]/10 text-[#F85149]",
            )}
          >
            {r.typ === "+" ? "+" : "−"} {r.text || " "}
          </span>
        ))}
      </pre>
    </div>
  );
}

// ── VÅG 91 A3b: STYRELSENS MÖTESVY — 5 rollkort + beslutskort ────────────────

/**
 * Mötesvyn (VÅG 91 A3b): ärendet, fem rollkort som tänds allt eftersom rollerna
 * rapporterar (väntar → talar → klar) och — när motorn är färdig — beslutskortet:
 * BESLUT (fet #E6EDF3) · MOTIVERING · ÅTGÄRDER som checklista · badge KÖRS
 * DIREKT (#238636) eller VÄNTAR KUND (#D29922).
 */
function StyrelseMoteVy({ mote, onNyFraga }: { mote: StyrelseMote; onNyFraga: () => void }): React.JSX.Element {
  const senaste = mote.händelser[mote.händelser.length - 1];
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 [scrollbar-width:thin]">
      {/* Ärendet */}
      <p className="flex items-start gap-2 text-xs leading-relaxed">
        <span className="shrink-0 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#8B949E]">
          Ärende
        </span>
        <span className="min-w-0 flex-1 text-[#E6EDF3]">{mote.fraga}</span>
      </p>
      {/* Rollkorten — tänds allt eftersom (poll var 3:e s). */}
      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {STYRELSE_ROLLER.map((r) => {
          const status = styrelseRollStatus(r.id, mote.händelser, mote.beslut);
          return (
            <div
              key={r.id}
              title={`${r.etikett} — ${status === "vantar" ? "har ej rapporterat ännu" : status === "talar" ? "diskuterar just nu" : "har redovisat"}`}
              className={cn(
                "rounded-md border px-2.5 py-2 transition-colors",
                status === "vantar" && "border-[#30363D] bg-[#0D1117]",
                status === "talar" && "border-[#D29922]/50 bg-[#D29922]/5",
                status === "klar" && "border-[#238636]/50 bg-[#238636]/5",
              )}
            >
              <p className="text-[10px] font-bold tracking-wider text-[#E6EDF3]">{r.etikett}</p>
              <p
                className={cn(
                  "mt-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider",
                  status === "vantar" && "text-[#484F58]",
                  status === "talar" && "text-[#D29922]",
                  status === "klar" && "text-[#3FB950]",
                )}
              >
                {status === "vantar" ? (
                  "väntar"
                ) : status === "talar" ? (
                  <>
                    <Loader2 className="h-2.5 w-2.5 animate-spin" /> talar…
                  </>
                ) : (
                  <>
                    <Check className="h-2.5 w-2.5" /> klar
                  </>
                )}
              </p>
            </div>
          );
        })}
      </div>
      {/* Senaste händelsen — mono-terminalrad ($-prefix). */}
      <p
        className="mt-3 truncate font-mono text-[10px] text-[#484F58]"
        title={senaste ? `${senaste.roll}${senaste.text ? ` — ${senaste.text}` : ""}` : undefined}
      >
        <span className="text-[#3FB950]" aria-hidden>
          ${" "}
        </span>
        {mote.beslut
          ? "styrelsen är enig — beslut fattat"
          : senaste
            ? `${senaste.roll || "styrelsen"}: ${senaste.text || STYRELSE_TYP_TEXT[senaste.typ] || "…"}`.slice(0, 120)
            : "styrelsen sammanträder…"}
      </p>
      {/* Beslutskortet. */}
      {mote.beslut && (
        <div className="mt-2 overflow-hidden rounded-md border border-[#30363D] bg-[#0D1117]">
          <div className="flex flex-wrap items-center gap-2 border-b border-[#21262D] px-3 py-2">
            <Landmark className="h-3.5 w-3.5 shrink-0 text-[#3FB950]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8B949E]">Beslut</span>
            <span
              className={cn(
                "ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                mote.beslut.existential ? "bg-[#D29922] text-[#0D1117]" : "bg-[#238636] text-white",
              )}
              title={
                mote.beslut.existential
                  ? "Existentiell åtgärd (R2) — väntar på kundens godkännande"
                  : "Tillämpas omedelbart av agentpipelinen (R2)"
              }
            >
              {mote.beslut.existential ? "Väntar kund" : "Körs direkt"}
            </span>
          </div>
          <div className="px-3 py-2.5">
            <p className="text-sm font-bold leading-relaxed text-[#E6EDF3]">{mote.beslut.beslut}</p>
            {mote.beslut.motivering && (
              <p className="mt-2 text-xs leading-relaxed text-[#8B949E]">
                <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider">Motivering</span>
                {mote.beslut.motivering}
              </p>
            )}
            {mote.beslut.atgarder.length > 0 && (
              <div className="mt-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8B949E]">Åtgärder</p>
                <ul className="mt-1 space-y-1">
                  {mote.beslut.atgarder.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-[#E6EDF3]/90">
                      <span
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-[#238636] text-[#3FB950]"
                        aria-hidden
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="min-w-0 flex-1">{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      {!mote.beslut ? (
        <p className="mt-2 flex items-center gap-1.5 text-[10px] leading-relaxed text-[#8B949E]">
          <Loader2 className="h-3 w-3 shrink-0 animate-spin text-[#D29922]" />
          Fem roller diskuterar — korten tänds allt eftersom de rapporterar (uppdateras var 3:e sekund).
        </p>
      ) : (
        <button
          type="button"
          onClick={onNyFraga}
          className="mt-3 flex items-center gap-1.5 rounded-md bg-[#238636] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#2EA043]"
          title="Lägg ett nytt ärende till styrelsen"
        >
          <Landmark className="h-3.5 w-3.5" />
          Ny fråga
        </button>
      )}
    </div>
  );
}

// ── VÅG 91 A3c + VÅG 92 B3: TJÄNSTE-PANELER — kollapsbara sektioner ──────────

/** VÅG 92 B3: webbläsar-vyns props (URL-fält + resultatkort + öppna sidor). */
interface TjansteWebblasareProps {
  url: string;
  setUrl: (v: string) => void;
  /** Kör POST /tjanster/webblasare {url} (form-submit eller sidlista-klick). */
  kor: () => void;
  /** true medan POST pågår (Öppna-knappens spinner). */
  korPaga: boolean;
  /** Fel/info-rad från senaste kör (tom = tyst). */
  meddelande: string;
  /** Senaste resultatkort (titel länkad + url + utdrag ≤ 300 tkn). */
  resultat: WebblasareResultat | null;
  /** Öppnade sidor denna session (under resultatkortet, klick = kör igen). */
  sidor: WebblasareResultat[];
  /** Kör en url ur listan igen. */
  oppnaSida: (url: string) => void;
}

/** VÅG 92 B3: automation-hanterarens props (lista + ny-form + pausa/radera). */
interface TjansteAutomationProps {
  namn: string;
  setNamn: (v: string) => void;
  schema: string;
  setSchema: (v: string) => void;
  prompt: string;
  setPrompt: (v: string) => void;
  formOppen: boolean;
  vaxlaForm: (oppenEfter: boolean) => void;
  skapar: boolean;
  skapa: () => void;
  /** Pausa (aktiveradEfter=false) / Återuppta (true) en automation. */
  pausa: (id: string, aktiveradEfter: boolean) => void;
  /** Radera med confirm — hanteras hos ägaren. */
  radera: (id: string, namn: string) => void;
  /** Rad med pågående pausa/radera (spinner + disabled). */
  jobbarId: string | null;
}

/**
 * Tjänste-panelerna (VÅG 91 A3c + VÅG 92 B3): BAKGRUNDSKORT (titel +
 * status-färg + startad relativ tid + Avbryt), WEBBLÄSAR-PANEL (URL-fält →
 * resultatkort + öppna sidor) och AUTOMATION-HANTERAREN (lista + ny-form +
 * pausa/återuppta + radera) — renderas i höger panelens fot. Sektioner vars
 * endpoint svarat 501/saknas är helt dolda (finns=false hos ägaren).
 */
function TjansteSektioner({
  tjanster,
  onVaxla,
  onAvbryt,
  avbryterId,
  webblasare,
  automation,
}: {
  tjanster: Record<TjansteNamn, TjansteTillstand>;
  onVaxla: (namn: TjansteNamn, oppenEfter: boolean) => void;
  onAvbryt: (id: string) => void;
  avbryterId: string | null;
  webblasare: TjansteWebblasareProps;
  automation: TjansteAutomationProps;
}): React.JSX.Element | null {
  const synliga = TJANSTE_INFO.filter((t) => tjanster[t.namn].finns);
  if (synliga.length === 0) return null;

  /** Laddar-rad — visas när sektionen läser och ännu har inget innehåll. */
  const lasRad = (etikett: string) => (
    <p className="flex items-center gap-1.5 text-[10px] text-[#8B949E]">
      <Loader2 className="h-3 w-3 animate-spin text-[#58A6FF]" /> Läser {etikett.toLowerCase()}…
    </p>
  );

  return (
    <>
      {synliga.map((t) => {
        const s = tjanster[t.namn];
        return (
          <section key={t.namn} aria-label={t.etikett} className="shrink-0 border-b border-[#30363D]">
            <button
              type="button"
              onClick={() => onVaxla(t.namn, !s.oppen)}
              aria-expanded={s.oppen}
              title={`${t.etikett} — ${s.oppen ? "fäll ihop" : "fäll ut och läs färskt"} (uppdateras var 30:e s medan öppen)`}
              className="flex min-h-[52px] w-full items-center gap-1.5 px-3 py-2 text-left transition-colors hover:bg-[#161B22] sm:min-h-0"
            >
              {s.oppen ? (
                <ChevronDown className="h-3 w-3 shrink-0 text-[#8B949E]" />
              ) : (
                <ChevronRight className="h-3 w-3 shrink-0 text-[#8B949E]" />
              )}
              {t.ikon === "klocka" ? (
                <Clock className="h-3.5 w-3.5 shrink-0 text-[#8B949E]" />
              ) : t.ikon === "glob" ? (
                <Globe className="h-3.5 w-3.5 shrink-0 text-[#8B949E]" />
              ) : (
                <Zap className="h-3.5 w-3.5 shrink-0 text-[#8B949E]" />
              )}
              <span className="min-w-0 flex-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B949E]">
                {t.etikett}
              </span>
              {s.rader.length > 0 && (
                <span className="shrink-0 rounded-full bg-[#21262D] px-1.5 font-mono text-[9px] font-bold text-[#8B949E]">
                  {s.rader.length}
                </span>
              )}
            </button>
            {s.oppen && (
              <div className="px-3 pb-2.5">
                {/* ── BAKGRUNDSKORT (VÅG 92 B3): kort per jobb + Avbryt ── */}
                {t.namn === "bakgrund" &&
                  (s.laddar && s.rader.length === 0 ? (
                    lasRad(t.etikett)
                  ) : s.rader.length === 0 ? (
                    <p className="text-[10px] leading-relaxed text-[#484F58]">{t.tom}</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {s.rader.map((r) => (
                        <li
                          key={r.id}
                          className="rounded-md border border-[#30363D] bg-[#161B22] px-2 py-1.5"
                          title={`${r.id}${r.status ? ` · ${r.status}` : ""}`}
                        >
                          <div className="flex items-center gap-1.5">
                            {r.status && (
                              <span
                                className={cn(
                                  "shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider",
                                  agentStatusFarg(r.status),
                                )}
                              >
                                {agentStatusText(r.status)}
                              </span>
                            )}
                            {r.startad && (
                              <span
                                className="ml-auto shrink-0 font-mono text-[9px] text-[#484F58]"
                                title={`Startad: ${r.startad}`}
                              >
                                {tidKort(r.startad)}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 break-words font-mono text-[10px] leading-snug text-[#E6EDF3]/85">
                            {r.titel}
                          </p>
                          {r.typ && r.typ !== r.status && (
                            <p className="mt-0.5 truncate font-mono text-[9px] text-[#484F58]">{r.typ}</p>
                          )}
                          {tjansteKor(r.status) && (
                            <div className="mt-1.5 flex justify-end">
                              <button
                                type="button"
                                onClick={() => onAvbryt(r.id)}
                                disabled={avbryterId === r.id}
                                title="Avbryt bakgrundsjobbet (tjanster/bakgrund/avbryt)"
                                aria-label="Avbryt jobbet"
                                className="flex items-center gap-1 rounded-md border border-[#DA3633]/40 px-2 py-0.5 text-[9px] font-semibold text-[#F85149] transition-colors hover:bg-[#DA3633]/10 disabled:opacity-50"
                              >
                                {avbryterId === r.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <X className="h-3 w-3" />
                                )}
                                Avbryt
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ))}

                {/* ── WEBBLÄSAR-PANEL (VÅG 92 B3): URL-fält → kort + sidor ── */}
                {t.namn === "webblasare" && (
                  <div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        webblasare.kor();
                      }}
                      className="flex gap-1.5"
                    >
                      <input
                        value={webblasare.url}
                        onChange={(e) => webblasare.setUrl(e.target.value)}
                        placeholder="https://example.se"
                        maxLength={500}
                        aria-label="Webbadress att öppna"
                        title="Webbadress — agentens webbläsare öppnar och läser sidan"
                        className="h-8 min-w-0 flex-1 rounded-md border border-[#30363D] bg-[#0D1117] px-2 font-mono text-[10px] text-[#E6EDF3] outline-none transition-colors placeholder:text-[#484F58] focus:border-[#58A6FF]"
                      />
                      <button
                        type="submit"
                        disabled={webblasare.korPaga || !webblasare.url.trim()}
                        title="Öppna adressen i agentens webbläsare (tjanster/webblasare)"
                        className="flex h-8 shrink-0 items-center gap-1 rounded-md bg-[#238636] px-2.5 text-[10px] font-bold text-white transition-colors hover:bg-[#2EA043] disabled:opacity-50"
                      >
                        {webblasare.korPaga ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Globe className="h-3 w-3" />
                        )}
                        Öppna
                      </button>
                    </form>
                    {webblasare.meddelande && (
                      <p className="mt-1.5 text-[10px] leading-relaxed text-[#F85149]" role="alert">
                        {webblasare.meddelande}
                      </p>
                    )}
                    {webblasare.korPaga && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#8B949E]">
                        <Loader2 className="h-3 w-3 animate-spin text-[#58A6FF]" /> Öppnar sidan…
                      </p>
                    )}
                    {webblasare.resultat && (
                      <div className="mt-2 rounded-md border border-[#30363D] bg-[#161B22] p-2">
                        <a
                          href={webblasare.resultat.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={webblasare.resultat.url}
                          className="block truncate text-[11px] font-semibold text-[#58A6FF] underline decoration-[#58A6FF]/40 underline-offset-2 hover:underline"
                        >
                          {webblasare.resultat.titel}
                        </a>
                        <p
                          className="mt-0.5 truncate font-mono text-[9px] text-[#8B949E]"
                          title={webblasare.resultat.url}
                        >
                          {webblasare.resultat.url}
                        </p>
                        {webblasare.resultat.utdrag && (
                          <p className="mt-1 line-clamp-4 text-[10px] leading-relaxed text-[#8B949E]">
                            {webblasare.resultat.utdrag}
                          </p>
                        )}
                      </div>
                    )}
                    {webblasare.sidor.length > 0 && (
                      <div className="mt-2">
                        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#484F58]">
                          Öppna sidor
                        </p>
                        <ul className="space-y-1">
                          {webblasare.sidor.map((sida, i) => (
                            <li key={`${sida.url}-${i}`}>
                              <button
                                type="button"
                                onClick={() => webblasare.oppnaSida(sida.url)}
                                title={`Öppna igen: ${sida.url}`}
                                className="flex w-full items-center gap-1.5 rounded-md bg-[#161B22] px-2 py-1 text-left transition-colors hover:bg-[#0D1117]"
                              >
                                <Globe className="h-3 w-3 shrink-0 text-[#8B949E]" aria-hidden />
                                <span className="min-w-0 flex-1 truncate text-[10px] text-[#E6EDF3]/85">
                                  {sida.titel}
                                </span>
                                <ExternalLink className="h-3 w-3 shrink-0 text-[#484F58]" aria-hidden />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {s.laddar && s.rader.length === 0 && !webblasare.resultat && lasRad(t.etikett)}
                  </div>
                )}

                {/* ── AUTOMATION-HANTERAREN (VÅG 92 B3): lista + ny + rad-knappar ── */}
                {t.namn === "automation" && (
                  <div>
                    {s.laddar && s.rader.length === 0 ? (
                      lasRad(t.etikett)
                    ) : s.rader.length === 0 && !automation.formOppen ? (
                      <p className="text-[10px] leading-relaxed text-[#484F58]">
                        Inga automationer än — skapa en med "Ny automation".
                      </p>
                    ) : s.rader.length === 0 ? null : (
                      <ul className="space-y-1.5">
                        {s.rader.map((r) => {
                          const pausad = automationPausad(r);
                          return (
                            <li
                              key={r.id}
                              className="rounded-md border border-[#30363D] bg-[#161B22] px-2 py-1.5"
                              title={`${r.id}${r.status ? ` · ${r.status}` : ""}${r.schema ? ` · ${r.schema}` : ""}`}
                            >
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={cn(
                                    "shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider",
                                    pausad
                                      ? "bg-[#D29922]/15 text-[#D29922]"
                                      : r.status
                                        ? agentStatusFarg(r.status)
                                        : "bg-[#238636]/15 text-[#3FB950]",
                                  )}
                                >
                                  {pausad ? "pausad" : r.status ? agentStatusText(r.status) : "aktiv"}
                                </span>
                                <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-[#E6EDF3]/90">
                                  {r.titel}
                                </span>
                              </div>
                              <p className="mt-0.5 truncate font-mono text-[9px] text-[#8B949E]">
                                {r.schema ? `$ ${r.schema}` : r.id}
                              </p>
                              <div className="mt-1.5 flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => automation.pausa(r.id, !pausad)}
                                  disabled={automation.jobbarId === r.id}
                                  title={pausad ? "Återuppta automationen (tjanster/automation/pausa)" : "Pausa automationen (tjanster/automation/pausa)"}
                                  className={cn(
                                    "flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-semibold transition-colors disabled:opacity-50",
                                    pausad
                                      ? "border-[#238636]/50 text-[#3FB950] hover:bg-[#238636]/10"
                                      : "border-[#D29922]/50 text-[#D29922] hover:bg-[#D29922]/10",
                                  )}
                                >
                                  {automation.jobbarId === r.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : pausad ? (
                                    <Play className="h-3 w-3" />
                                  ) : (
                                    <Pause className="h-3 w-3" />
                                  )}
                                  {pausad ? "Återuppta" : "Pausa"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => automation.radera(r.id, r.titel)}
                                  disabled={automation.jobbarId === r.id}
                                  title="Radera automationen (confirm krävs)"
                                  className="flex items-center gap-1 rounded-md border border-[#DA3633]/40 px-2 py-0.5 text-[9px] font-semibold text-[#F85149] transition-colors hover:bg-[#DA3633]/10 disabled:opacity-50"
                                >
                                  {automation.jobbarId === r.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                  Radera
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    {automation.formOppen ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          automation.skapa();
                        }}
                        className="mt-2 space-y-1.5 rounded-md border border-[#30363D] bg-[#0D1117] p-2"
                        aria-label="Ny automation"
                      >
                        <input
                          value={automation.namn}
                          onChange={(e) => automation.setNamn(e.target.value)}
                          placeholder="Namn (t.ex. Morgonrapport)"
                          maxLength={80}
                          aria-label="Automationens namn"
                          className="h-8 w-full rounded-md border border-[#30363D] bg-[#161B22] px-2 text-[10px] text-[#E6EDF3] outline-none transition-colors placeholder:text-[#484F58] focus:border-[#58A6FF]"
                        />
                        <input
                          value={automation.schema}
                          onChange={(e) => automation.setSchema(e.target.value)}
                          placeholder="Schema — cron (t.ex. 0 7 * * *)"
                          maxLength={60}
                          aria-label="Automationens schema"
                          className="h-8 w-full rounded-md border border-[#30363D] bg-[#161B22] px-2 font-mono text-[10px] text-[#E6EDF3] outline-none transition-colors placeholder:text-[#484F58] focus:border-[#58A6FF]"
                        />
                        <textarea
                          value={automation.prompt}
                          onChange={(e) => automation.setPrompt(e.target.value)}
                          placeholder="Prompt — vad agenten kör varje gång"
                          maxLength={2000}
                          rows={3}
                          aria-label="Automationens prompt"
                          className="w-full resize-none rounded-md border border-[#30363D] bg-[#161B22] px-2 py-1.5 text-[10px] leading-relaxed text-[#E6EDF3] outline-none transition-colors placeholder:text-[#484F58] focus:border-[#58A6FF]"
                        />
                        <div className="flex items-center gap-1.5">
                          <button
                            type="submit"
                            disabled={automation.skapar || !automation.namn.trim() || !automation.schema.trim() || !automation.prompt.trim()}
                            title="Skapa automationen (POST tjanster/automation)"
                            className="flex items-center gap-1 rounded-md bg-[#238636] px-2.5 py-1 text-[10px] font-bold text-white transition-colors hover:bg-[#2EA043] disabled:opacity-50"
                          >
                            {automation.skapar ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                            Skapa
                          </button>
                          <button
                            type="button"
                            onClick={() => automation.vaxlaForm(false)}
                            title="Stäng formuläret"
                            className="rounded-md border border-[#30363D] px-2.5 py-1 text-[10px] font-semibold text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3]"
                          >
                            Avbryt
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => automation.vaxlaForm(true)}
                        title="Ny automation — namn, schema (cron) och prompt"
                        className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-[#238636]/50 px-2 py-1.5 text-[10px] font-semibold text-[#3FB950] transition-colors hover:bg-[#238636]/10"
                      >
                        <Plus className="h-3 w-3" />
                        Ny automation
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}

// ── Skrivfältets mått + placeholder-rotation (våg 86 G3) ─────────────────────

const YTA_MIN_HOJD = 44;
const YTA_MAX_HOJD = 205;

function hojdpassaYta(yta: HTMLTextAreaElement | null): void {
  if (!yta) return;
  yta.style.height = "auto";
  const behov = yta.scrollHeight;
  yta.style.height = `${Math.max(YTA_MIN_HOJD, Math.min(YTA_MAX_HOJD, behov))}px`;
  yta.style.overflowY = behov > YTA_MAX_HOJD ? "auto" : "hidden";
}

/** VÅG 90: primär placeholder = specens "Skriv här…" + roterande tips. */
const SKRIV_PLACEHOLDERS = [
  "Skriv här…",
  "Beskriv en uppgift…",
  "Klistra in en länk…",
  "Skriv här… (Enter skickar, Skift+Enter ny rad — / visar kommandon, ↑ återkallar)",
];

// ── VÅG 90: empty-state — terminal-prompt i Z Code-stil (ersätter Serena) ────

/**
 * Emblem för tom chatt: en mono terminalprompt "~/ak1a $ ▊" med blinkande
 * cursor — pixelnära Z Code, ingen extern fil.
 */
function ZcEmblem(): React.JSX.Element {
  return (
    <div className="mx-auto w-fit rounded-md border border-[#30363D] bg-[#0D1117] px-4 py-2.5 font-mono text-sm">
      <span className="text-[#3FB950]">~/ak1a</span>
      <span className="text-[#8B949E]"> $</span>
      <span className="studio-cursor ml-2 inline-block h-4 w-[9px] rounded-[1.5px] bg-[#E6EDF3] align-text-bottom" />
    </div>
  );
}

// ── Huvudkomponent ───────────────────────────────────────────────────────────

let idRäknare = 0;
const nyttId = () => `m${++idRäknare}-${Date.now().toString(36)}`;

/**
 * VÅG 97 E2: historik-post → chattmeddelande. tankar-fältet följer med när
 * källan bär det (IndexedDB-cachen + ev. framtida server-fält) så samma
 * TankarVy-sektion renderas vid historik-inläsning som under streaming.
 */
function meddelandeUrHistorik(h: HistorikPost): Meddelande {
  return {
    id: nyttId(),
    roll: h.roll,
    text: h.text,
    ...(typeof h.tankar === "string" && h.tankar.trim() !== ""
      ? { tankar: h.tankar.slice(0, TANKAR_TAK) }
      : {}),
  };
}

export function StudioChat({ hem }: { hem: () => void }) {
  // ── Multi-session-tabbar (våg 84 B) — per-tabb-livet i `tabbar` ────────────
  const [tabbar, setTabbar] = React.useState<Tabb[]>(() => [
    { id: "tabb-huvud", huvud: true, sessionId: null, titel: "Huvudsession", ...tabbGrund() },
  ]);
  const [aktivTabbId, setAktivTabbId] = React.useState("tabb-huvud");
  const [prompt, setPrompt] = React.useState("");
  const [statusText, setStatusText] = React.useState("Ansluter…");
  const [live, setLive] = React.useState<"live" | "demo" | "ned">("ned");
  const [uppladdningar, setUppladdningar] = React.useState<Uppladdning[]>([]);
  /** VÅG 108: kundens "bubblor stör mig" — chip-radan ovanför skrivfältet
   *  går att stänga med × (kvarstår sessionen ut; 📎-knappen återöppnar). */
  const [chipsDolda, setChipsDolda] = React.useState(false);
  React.useEffect(() => {
    try { setChipsDolda(sessionStorage.getItem("ak1a-studio-chips-dolda") === "1"); } catch {}
  }, []);
  const doljChips = React.useCallback(() => {
    setChipsDolda(true);
    try { sessionStorage.setItem("ak1a-studio-chips-dolda", "1"); } catch {}
  }, []);
  const visaChips = React.useCallback(() => {
    setChipsDolda(false);
    try { sessionStorage.removeItem("ak1a-studio-chips-dolda"); } catch {}
  }, []);
  const [laddarUpp, setLaddarUpp] = React.useState(false);
  const [draÖver, setDraÖver] = React.useState(false);
  const [laddarHistorik, setLaddarHistorik] = React.useState(true);
  const [placeholderIx, setPlaceholderIx] = React.useState(0);

  // ── VÅG 90 K2: LAYOUT-LÄGE — sidebar (vänster) + panel (höger), kollapsbara
  //    på desktop, overlay-drawers på mobil (hamburger i chatten/headern).
  const [sidebarOppen, setSidebarOppen] = React.useState(true);
  const [panelOppen, setPanelOppen] = React.useState(true);
  /** Mobil-drawer för sidbaren (hamburgaren) — oberoende av desktop-läget. */
  const [mobilSidebar, setMobilSidebar] = React.useState(false);
  /** Mobil-drawer för höger panelen (PanelRight-knappen i headern). */
  const [mobilPanel, setMobilPanel] = React.useState(false);

  // ── Modellval + kontext + sessioner (våg 82) ───────────────────────────────
  const [modeller, setModeller] = React.useState<ModellPost[]>([]);
  const [valdModell, setValdModell] = React.useState("");
  const [byterModell, setByterModell] = React.useState(false);
  const [sessioner, setSessioner] = React.useState<SessionPost[]>([]);
  const [sessionJobbar, setSessionJobbar] = React.useState<"" | "ny" | "compact" | "resume" | "stang">("");
  const [toast, setToast] = React.useState<{ text: string; ton: "gron" | "fel" } | null>(null);
  const [rewindJobbar, setRewindJobbar] = React.useState(false);

  // ── Sessions- och workspace-hantering (våg 83 B3) ──────────────────────────
  const [aktivSession, setAktivSession] = React.useState("");
  const [mal, setMal] = React.useState<string | null>(null);
  const [malSparar, setMalSparar] = React.useState(false);
  const [subagenter, setSubagenter] = React.useState<SubagentPost[]>([]);
  const [agenterLaddar, setAgenterLaddar] = React.useState(false);
  const [agenterFel, setAgenterFel] = React.useState("");
  const [arbetsytaInfo, setArbetsytaInfo] = React.useState<ArbetsytaInfo | null>(null);

  // ── Mål-läget (våg 85 F1): autonom utvecklingsloop ─────────────────────────
  const [malDialogOppen, setMalDialogOppen] = React.useState(false);
  const [malDialogText, setMalDialogText] = React.useState("");
  const [malStartar, setMalStartar] = React.useState(false);
  const [malStrömOppen, setMalStrömOppen] = React.useState(false);
  const [malStatus, setMalStatus] = React.useState<{ aktiv: boolean; pausad: boolean; iteration: number } | null>(null);
  const malStatusRef = React.useRef<{ aktiv: boolean; pausad: boolean; iteration: number } | null>(null);
  React.useEffect(() => {
    malStatusRef.current = malStatus;
  }, [malStatus]);
  const [malIteration, setMalIteration] = React.useState(0);
  const [malPausar, setMalPausar] = React.useState(false);
  const malBubblaRef = React.useRef<string | null>(null);
  const malAbortRef = React.useRef<AbortController | null>(null);
  const huvudTabbIdRef = React.useRef("tabb-huvud");

  // ── Filträd + förhandsgranskning (våg 83 B4) ───────────────────────────────
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

  // ── Agentens minne (våg 84 D) ──────────────────────────────────────────────
  const [visaMinne, setVisaMinne] = React.useState(false);
  const [minneFiler, setMinneFiler] = React.useState<MinnePost[] | null>(null);
  const [minneLaddar, setMinneLaddar] = React.useState(false);
  const [minneFel, setMinneFel] = React.useState("");
  const [minneRotVisning, setMinneRotVisning] = React.useState("");
  const [minneVald, setMinneVald] = React.useState<MinnePost | null>(null);
  const [minneDetaljLaddar, setMinneDetaljLaddar] = React.useState(false);
  const [minneRedigerar, setMinneRedigerar] = React.useState(false);
  const [minneText, setMinneText] = React.useState("");
  const [minneSparar, setMinneSparar] = React.useState(false);
  const [minneRaderar, setMinneRaderar] = React.useState(false);
  const [minneNy, setMinneNy] = React.useState(false);
  const [minneNyttNamn, setMinneNyttNamn] = React.useState("");

  // ── Färdigheter (våg 85 F2) ────────────────────────────────────────────────
  const [visaFardigheter, setVisaFardigheter] = React.useState(false);
  const [fardigheterSkills, setFardigheterSkills] = React.useState<FardighetSkill[] | null>(null);
  const [fardigheterPlugins, setFardigheterPlugins] = React.useState<FardighetPlugin[] | null>(null);
  const [fardigheterMcp, setFardigheterMcp] = React.useState<FardighetMcp[] | null>(null);
  const [fardigheterVerktyg, setFardigheterVerktyg] = React.useState(0);
  const [fardigheterLaddar, setFardigheterLaddar] = React.useState(false);
  const [fardigheterFel, setFardigheterFel] = React.useState("");
  /** VÅG 93 C3: plugin-rad som växlas just nu (id) — spinner + spärr, en i taget. */
  const [pluginVaxlar, setPluginVaxlar] = React.useState<string | null>(null);

  // ── Verktyg/admin-drawern (våg 88 I2) — ytan ägs av studio-admin-panel.tsx ──
  const [visaAdmin, setVisaAdmin] = React.useState(false);

  // ── VÅG 91 A3: BILDER I SAMTALET + STYRELSEN + TJÄNSTER + AUTONOMI ─────────
  /** A3a: valda bildbilagor (sökvägar i arbetsytan) — skickas med nästa prompt. */
  const [valdaBilder, setValdaBilder] = React.useState<string[]>([]);

  /** A3b: styrelsen 🏛 — dialog + pågående möte (pollas mot A2:s motor). */
  const [styrelseOppen, setStyrelseOppen] = React.useState(false);
  const [styrelseFraga, setStyrelseFraga] = React.useState("");
  const [styrelseStartar, setStyrelseStartar] = React.useState(false);
  const [styrelseMote, setStyrelseMote] = React.useState<StyrelseMote | null>(null);
  /** true när POST svarade 501/404 — dialogen visar diskret info-rad istället. */
  const [styrelseSaknas, setStyrelseSaknas] = React.useState(false);
  /** Pekare in i mötet för poll-loopen (antalet mottagna händelser + beslut). */
  const styrelseRef = React.useRef<{ id: string; antal: number; beslut: boolean }>({ id: "", antal: 0, beslut: false });

  /** A3c: tjänste-paneler — varje sektion dold om endpointen svarar 501/saknas. */
  const [tjanster, setTjanster] = React.useState<Record<TjansteNamn, TjansteTillstand>>({
    bakgrund: { finns: false, oppen: false, laddar: false, rader: [] },
    webblasare: { finns: false, oppen: false, laddar: false, rader: [] },
    automation: { finns: false, oppen: false, laddar: false, rader: [] },
  });
  const tjansterRef = React.useRef(tjanster);
  const [avbryterJobb, setAvbryterJobb] = React.useState<string | null>(null);

  /** VÅG 92 B3: WEBBLÄSAR-PANEL — URL-fält, kör-status, kort + öppna sidor. */
  const [webUrl, setWebUrl] = React.useState("");
  const [webKorPaga, setWebKorPaga] = React.useState(false);
  const [webMeddelande, setWebMeddelande] = React.useState("");
  const [webResultat, setWebResultat] = React.useState<WebblasareResultat | null>(null);
  const [webSidor, setWebSidor] = React.useState<WebblasareResultat[]>([]);

  /** VÅG 92 B3: AUTOMATION-HANTERAREN — ny-form + per-rad pausa/radera. */
  const [autoFormOppen, setAutoFormOppen] = React.useState(false);
  const [autoNamn, setAutoNamn] = React.useState("");
  const [autoSchema, setAutoSchema] = React.useState("");
  const [autoPrompt, setAutoPrompt] = React.useState("");
  const [autoSkapar, setAutoSkapar] = React.useState(false);
  const [autoJobbarId, setAutoJobbarId] = React.useState<string | null>(null);

  /** A3d: autonomi-signal — mål-motorn arbetar även när fliken vilat. */
  const [autonomiAktiv, setAutonomiAktiv] = React.useState(false);
  const autonomiForutRef = React.useRef<boolean | null>(null);

  // ── Dialoger + läge/tankestyrka (våg 83 B2) ────────────────────────────────
  const [permission, setPermission] = React.useState<PermissionDialog | null>(null);
  const [fraga, setFraga] = React.useState<FragaDialog | null>(null);
  const [fragSvar, setFragSvar] = React.useState("");
  const [svarJobbar, setSvarJobbar] = React.useState(false);
  const [lage, setLage] = React.useState("");
  const [tanka, setTanka] = React.useState("");
  const [lageJobbar, setLageJobbar] = React.useState(false);

  // ── Minnesregler + långkörningsnotiser (våg 84 C) ──────────────────────────
  const [regler, setRegler] = React.useState<PermissionRegel[]>([]);
  const reglerRef = React.useRef<PermissionRegel[]>([]);
  const [notisRattighet, setNotisRattighet] = React.useState("default");
  const turnStartRef = React.useRef<number | null>(null);
  const turnNotiseradRef = React.useRef(false);
  const turnTknRef = React.useRef<number | null>(null);
  const titleVaxlingRef = React.useRef<number | null>(null);
  const grundTitelRef = React.useRef<string | null>(null);

  // ── Notishistorik + snabbmeny (våg 86 G6) + Mer-drawern ────────────────────
  const [notiser, setNotiser] = React.useState<NotisPost[]>([]);
  const [visaNotiser, setVisaNotiser] = React.useState(false);
  const [visaGenvagar, setVisaGenvagar] = React.useState(false);
  /** "⋯ Mer"-drawern (våg 89 J1:s meny — våg 90: sidomeny/panel äger det mesta). */
  const [menyOppen, setMenyOppen] = React.useState(false);
  const [menyAgenterOppen, setMenyAgenterOppen] = React.useState(false);
  const [menyReglerOppen, setMenyReglerOppen] = React.useState(false);

  // ── Inställningar-drawern ⚙ (våg 88 I1; våg 90: temat är FAST mörkt) ───────
  const [installningarOppen, setInstallningarOppen] = React.useState(false);

  /**
   * VÅG 93 C3: serverns STANDARD för nya samtal (GET /api/studio/installningar).
   * null = endpointen saknas/501/ej hämtad ⇒ "Standard:"-raden dold och inga
   * POST-spar — sessionssparandet (befintligt) består opåverkat.
   */
  const [serverStandard, setServerStandard] = React.useState<{
    modell: string;
    lage: string;
    tankestyrka: string;
  } | null>(null);

  // ── Palett + sök + auto-scroll (våg 84 A) ──────────────────────────────────
  const [palettOppen, setPalettOppen] = React.useState(false);
  const [palettFras, setPalettFras] = React.useState("");
  const [palettIndex, setPalettIndex] = React.useState(0);
  const [sokOppen, setSokOppen] = React.useState(false);
  const [sokFras, setSokFras] = React.useState("");
  const [sokIndex, setSokIndex] = React.useState(0);
  const [vidBotten, setVidBotten] = React.useState(true);
  const [nyaSedanUpp, setNyaSedanUpp] = React.useState(0);

  // ── Återkoppling (våg 87 H1) ───────────────────────────────────────────────
  const [bortaBanner, setBortaBanner] = React.useState<{
    antalTurner: number;
    sessionId: string | null;
    malKorer: boolean;
    /** VÅG 93 C4: verktygsaktiviteten under frånvaron (session/events-replay). */
    kort?: VerktygKort[];
  } | null>(null);
  /** VÅG 93 C4: bannerns verktygslista expanderad + vilka kort som är öppna. */
  const [bortaKortOppet, setBortaKortOppet] = React.useState(false);
  const [bortaOppnaKort, setBortaOppnaKort] = React.useState<Set<string>>(new Set());
  const serverSynkRef = React.useRef<Set<string>>(new Set());

  // ── Skrivfältets minne (våg 86 G1/G2) ──────────────────────────────────────
  const [slashStangd, setSlashStangd] = React.useState(false);
  const [slashIndex, setSlashIndex] = React.useState(0);
  const [prompter, setPrompter] = React.useState<SparadPrompt[]>(() => lasPrompter());
  const [prompterOppen, setPrompterOppen] = React.useState(false);
  const [promptHistorik, setPromptHistorik] = React.useState<string[]>(() => lasPromptHistorik());
  /** VÅG 90: 📎-menyn vid skrivfältet (Fil / Mapp-uppladdning). */
  const [uploadMenyOppen, setUploadMenyOppen] = React.useState(false);

  const sokInputRef = React.useRef<HTMLInputElement | null>(null);
  const palettInputRef = React.useRef<HTMLInputElement | null>(null);
  const vidBottenRef = React.useRef(true);
  const foreLangdRef = React.useRef(0);
  const meddelandeRefs = React.useRef<Map<string, HTMLElement>>(new Map());
  const palettRadRefs = React.useRef<Map<string, HTMLElement>>(new Map());
  const slashRadRefs = React.useRef<Map<string, HTMLElement>>(new Map());
  const historikIndexRef = React.useRef<number | null>(null);
  const historikUtkastRef = React.useRef("");

  const blattraRef = React.useRef<HTMLDivElement | null>(null);
  const ytaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const filInputRef = React.useRef<HTMLInputElement | null>(null);
  const mappInputRef = React.useRef<HTMLInputElement | null>(null);
  const tabbAbortRef = React.useRef<Map<string, AbortController>>(new Map());
  const aktivTabbIdRef = React.useRef("tabb-huvud");
  const tabbarRef = React.useRef<{ tabbar: Tabb[]; aktivTabbId: string }>({ tabbar: [], aktivTabbId: "tabb-huvud" });
  const senasteSparaRef = React.useRef(0);
  const sparaTimerRef = React.useRef<number | null>(null);

  // ── Tabb-mutering + härledda vy-värden ─────────────────────────────────────
  const rörTabb = React.useCallback((id: string, rör: (t: Tabb) => Tabb) => {
    setTabbar((alla) => alla.map((t) => (t.id === id ? rör(t) : t)));
  }, []);

  const aktivTabb = tabbar.find((t) => t.id === aktivTabbId) ?? tabbar[0];
  const huvudTabb = tabbar.find((t) => t.huvud) ?? tabbar[0];
  const meddelanden = aktivTabb?.meddelanden ?? [];
  const strömmar = aktivTabb?.strömmar ?? false;
  const tankar = aktivTabb?.tankar ?? "";
  const kontext = aktivTabb?.kontext ?? null;
  const rundaTkn = aktivTabb?.rundaTkn ?? null;
  const ackumulerat = aktivTabb?.ackumulerat ?? 0;
  const strömmarHuvud = huvudTabb?.strömmar ?? false;
  const nagotStrömmar = tabbar.some((t) => t.strömmar);
  const arHuvudAktiv = Boolean(aktivTabb?.huvud);

  /** VÅG 114 — ORGANISM-PANELEN (kunden bygger via studion ⇒ maskinens
   *  puls ska synas här): registret + pumparnas senaste rader ur
   *  /api/admin/organ, uppdateras var 60:e s. */
  const [organism, setOrganism] = React.useState<{
    rond: number;
    aktiva: { bokstav: string; namn: string; lev: number }[];
    döda: string[];
    basta: string | null;
    ekonomi: { tokensPerLeverans: number | null; tokensTotalt: number } | null;
    pumpRad: string;
    landningar: { hash: string; tid: string; amne: string }[];
    kostnadTotal: number | null;
  } | null>(null);
  /** VÅG 125 — OBSERVATORIET: mål-strömmens senaste händelser LIVE (verk-
   *  tyg, iterationer, deltas) — kunden ser utvecklingen som i desktop-Z,
   *  oavsett vilken session chatten visar. */
  const [liveFeed, setLiveFeed] = React.useState<{ ts: number; rad: string; aktiv: boolean }[]>([]);
  const [livePa, setLivePa] = React.useState(false);
  React.useEffect(() => {
    if (!livePa) return;
    const kontroll = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/studio/mal/stream", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({}),
          signal: kontroll.signal,
        });
        const lasare = res.body?.getReader();
        if (!lasare) return;
        const dekod = new TextDecoder();
        for (;;) {
          const { value, done } = await lasare.read();
          if (done) break;
          for (const rad of dekod.decode(value).split("\n")) {
            if (!rad.startsWith("data:")) continue;
            let j: { typ?: string; fas?: string; iteration?: number; namn?: string; kanal?: string; text?: string; pagaendeTurn?: boolean; argument?: string; beskrivning?: string } | null = null;
            try { j = JSON.parse(rad.slice(5).trim()); } catch { continue; }
            if (!j?.typ) continue;
            let text = "";
            switch (j.typ) {
              case "mal_iteration":
                text = j.fas === "start" ? `▶ Iteration ${j.iteration} börjar` : `✓ Iteration ${j.iteration} klar`;
                break;
              case "runda":
                text = j.fas === "start" ? "▸ Agenten börjar en runda" : "▸ Rundan klar";
                break;
              case "verktyg_kort":
              case "verktyg_input": {
                // VÅG 129 — OBSERVATORIET v2: verktygets MÅL syns (filvägar,
                // kommandon) — kunden ser VAD som röras, som i desktop-Z.
                let detalj = j.beskrivning ?? "";
                if (!detalj && j.argument) {
                  try {
                    const a = JSON.parse(j.argument) as Record<string, unknown>;
                    const kandidat =
                      (typeof a.file_path === "string" && a.file_path) ||
                      (typeof a.path === "string" && a.path) ||
                      (typeof a.command === "string" && a.command) ||
                      (typeof a.pattern === "string" && a.pattern) ||
                      "";
                    detalj = String(kandidat).slice(0, 70);
                  } catch {
                    detalj = j.argument.slice(0, 60);
                  }
                }
                text = `🔧 ${j.namn ?? "verktyg"}${detalj ? ` — ${detalj}` : ""}`;
                break;
              }
              case "delta": {
                const t = (j.text ?? "").trim();
                if (t.length > 2) text = `… ${t.slice(0, 60)}`;
                break;
              }
              case "status":
                text = `⌁ ${(j.text ?? "").slice(0, 60)}`;
                break;
              default:
                continue;
            }
            setLiveFeed((f) => [...f.slice(-7), { ts: Date.now(), rad: text, aktiv: j.typ !== "mal_iteration" || j.fas !== "slut" }]);
          }
        }
      } catch { /* strömmen stängd — knappen startar om */ }
    })();
    return () => kontroll.abort();
  }, [livePa]);
  React.useEffect(() => {
    let lev = true;
    const hamta = async () => {
      try {
        const res = await fetch("/api/admin/organ", { headers: adminHeaders() });
        if (!res.ok) return;
        const d = await res.json();
        if (!lev) return;
        const aktiva = (d.registret?.organ ?? [])
          .filter((o: { status: string }) => o.status === "aktiv")
          .map((o: { bokstav: string; namn: string; leveranserSista2: number[] }) => ({
            bokstav: o.bokstav,
            namn: o.namn,
            lev: o.leveranserSista2?.[0] ?? 0,
          }));
        const bastaKandidat = [...aktiva].sort((a: { lev: number }, b: { lev: number }) => b.lev - a.lev)[0];
        setOrganism({
          rond: d.registret?.rond ?? 0,
          aktiva,
          döda: (d.registret?.organ ?? [])
            .filter((o: { status: string }) => o.status === "död")
            .map((o: { bokstav: string }) => o.bokstav),
          basta: bastaKandidat ? `${bastaKandidat.bokstav} (${bastaKandidat.lev})` : null,
          ekonomi: d.registret?.kostnad ?? null,
          pumpRad: (d.pumper?.rond ?? []).slice(-1)[0] ?? "",
          landningar: d.senasteCommits ?? [],
          kostnadTotal: d.kostnadTotal ?? null,
        });
      } catch { /* tyst — panelen visar viloläge */ }
    };
    hamta();
    const i = setInterval(hamta, 60_000);
    return () => {
      lev = false;
      clearInterval(i);
    };
  }, []);

  /** VÅG 90 K4: senaste verktygskörningar — panelens TERMINAL-sektion. */
  const senasteVerktyg = React.useMemo(() => {
    const ut: { kort: VerktygKort; iteration?: number }[] = [];
    for (let i = meddelanden.length - 1; i >= 0 && ut.length < 8; i--) {
      const m = meddelanden[i];
      if (m.roll !== "assistant" || !m.verktygKort) continue;
      for (let j = m.verktygKort.length - 1; j >= 0 && ut.length < 8; j--) {
        ut.push({ kort: m.verktygKort[j], iteration: m.malIteration });
      }
    }
    return ut;
  }, [meddelanden]);

  /** VÅG 86 G5: turnIndex per agentbubbla (session/fork {kind:"turn"}-räkning). */
  const turnIndexKarta = React.useMemo(() => {
    const karta = new Map<string, number>();
    let turn = -1;
    for (const m of meddelanden) {
      if (m.roll === "user") turn += 1;
      else karta.set(m.id, turn);
    }
    return karta;
  }, [meddelanden]);

  const malKör = mal !== null && malStatus?.aktiv === true && !malStatus.pausad;
  const malPausat = mal !== null && malStatus !== null && !malStatus.aktiv;

  /**
   * VÅG 93 C3: avviker sessionens aktuella modell/läge från server-standarden?
   * !=null ⇒ subtil gul prick vid Inställningar-drawerns rubrik (title-förklaring).
   * Tomma standardfält/okänt session-läge jämförs aldrig (inga falska prickar).
   */
  const standardAvvik = React.useMemo(() => {
    if (!serverStandard) return null;
    const delar: string[] = [];
    if (serverStandard.modell && valdModell && serverStandard.modell !== valdModell) {
      delar.push(`modell: ${modellBadge(valdModell)} (standard ${modellBadge(serverStandard.modell)})`);
    }
    if (serverStandard.lage && lage && serverStandard.lage !== lage) {
      delar.push(`läge: ${lage} (standard ${serverStandard.lage})`);
    }
    return delar.length > 0 ? delar : null;
  }, [serverStandard, valdModell, lage]);

  React.useEffect(() => {
    aktivTabbIdRef.current = aktivTabbId;
    tabbarRef.current = { tabbar, aktivTabbId };
    huvudTabbIdRef.current = tabbar.find((t) => t.huvud)?.id ?? "tabb-huvud";
  }, [aktivTabbId, tabbar]);

  /** Bekräftelse-toast — försvinner av sig själv efter 4,5 s. */
  const visaToast = React.useCallback((text: string, ton: "gron" | "fel" = "gron") => {
    setToast({ text, ton });
    window.setTimeout(() => setToast((t) => (t?.text === text ? null : t)), 4_500);
  }, []);

  // ── Regler ur localStorage + notisrättighet + ref-synk (våg 84 C) ──────────
  React.useEffect(() => {
    const lista = lasReglerUrLagring();
    reglerRef.current = lista;
    setRegler(lista);
    setNotisRattighet(typeof Notification === "undefined" ? "stöds ej" : Notification.permission);
  }, []);

  React.useEffect(() => {
    reglerRef.current = regler;
  }, [regler]);

  React.useEffect(() => {
    setNotiser(lasNotiserUrLagring());
  }, []);

  const loggaNotis = React.useCallback((text: string, typ: NotisPost["typ"]) => {
    setNotiser((gamla) => {
      const nya = [...gamla, { text, typ, tid: Date.now() }].slice(-MAX_NOTISER);
      try {
        window.localStorage.setItem(NOTIS_LAGRING, JSON.stringify(nya));
      } catch {
        // privat läge — historiken lever bara i state
      }
      return nya;
    });
  }, []);

  const tomNotiser = React.useCallback(() => {
    setNotiser([]);
    try {
      window.localStorage.removeItem(NOTIS_LAGRING);
    } catch {
      // tyst
    }
  }, []);

  const oppnaNotiser = React.useCallback(() => {
    setVisaFiler(false);
    setFilVisning(null);
    setVisaFardigheter(false);
    setVisaMinne(false);
    setInstallningarOppen(false);
    setVisaAdmin(false);
    setMenyOppen(false);
    setVisaNotiser(true);
  }, []);

  /**
   * VÅG 93 C3: läs serverns standard-inställningar (GET /api/studio/
   * installningar). 501/404/nätverksfel ⇒ null (raden dold, sessionsspar
   * består) — C2:s rutt är under parallellbygge, ALDRIG ett hårt UI-brott.
   */
  const lasServerInstallningar = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/studio/installningar?frisk=${Date.now()}`, {
        headers: adminHeaders(),
      });
      if (!res.ok) {
        setServerStandard(null);
        return;
      }
      const data = (await res.json().catch(() => ({}))) as {
        modell?: string;
        lage?: string;
        tankestyrka?: string;
        tankeNiva?: string;
        fel?: string;
      };
      if (data.fel) {
        setServerStandard(null);
        return;
      }
      const standard = {
        modell: typeof data.modell === "string" ? data.modell : "",
        lage: typeof data.lage === "string" ? data.lage : "",
        tankestyrka:
          typeof data.tankestyrka === "string"
            ? data.tankestyrka
            : typeof data.tankeNiva === "string"
              ? data.tankeNiva
              : "",
      };
      // Helt tomt svar = endpointen har inga standarder att visa ⇒ dolt.
      setServerStandard(
        standard.modell || standard.lage || standard.tankestyrka ? standard : null,
      );
    } catch {
      setServerStandard(null);
    }
  }, []);

  /**
   * VÅG 93 C3: spara ETT ändrat fält till server-standarden (POST /api/studio/
   * installningar — endast ändrat fält i kroppen). Fire-and-forget efter
   * lyckat SESSIONSSPAR: ok ⇒ diskret toast "Sparat — gäller nästa samtal" +
   * lokal standard-bild uppdateras (gul prick släcks); fel ⇒ ärlig toast —
   * sessionens val lever kvar opåverkat. Saknad endpoint (GET gav null) ⇒
   * inget skickas alls.
   */
  const sparaServerInstallning = React.useCallback(
    async (falt: "modell" | "lage" | "tankestyrka", varde: string) => {
      if (!serverStandard) return; // endpointen saknas (501) — sessionssparet räcker
      if (serverStandard[falt] === varde) return; // oförändrat värde — inget att skicka
      try {
        const res = await fetch("/api/studio/installningar", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ [falt]: varde }),
        });
        if (res.ok) {
          setServerStandard((s) => (s ? { ...s, [falt]: varde } : s));
          visaToast("Sparat — gäller nästa samtal");
        } else {
          visaToast("Standarden sparades ej — valet gäller bara detta samtal.", "fel");
        }
      } catch {
        visaToast("Nätverksfel — standarden sparades ej (valet gäller detta samtal).", "fel");
      }
    },
    [serverStandard, visaToast],
  );

  const oppnaInstallningar = React.useCallback(() => {
    setVisaFiler(false);
    setFilVisning(null);
    setVisaFardigheter(false);
    setVisaMinne(false);
    setVisaNotiser(false);
    setVisaAdmin(false);
    setMenyOppen(false);
    setInstallningarOppen(true);
    void lasServerInstallningar(); // VÅG 93 C3: färsk standard vid varje öppning
  }, [lasServerInstallningar]);

  const oppnaMeny = React.useCallback(() => {
    setVisaFiler(false);
    setFilVisning(null);
    setVisaFardigheter(false);
    setVisaMinne(false);
    setVisaNotiser(false);
    setVisaAdmin(false);
    setInstallningarOppen(false);
    setMenyOppen(true);
  }, []);

  const begraNotisRattighet = React.useCallback(async () => {
    if (typeof Notification === "undefined") {
      visaToast("Webbläsaren saknar stöd för notiser.", "fel");
      return;
    }
    if (Notification.permission === "granted") {
      visaToast("Notiser är redan påslagna — långa rundor (>60 s) pingar dig.");
      return;
    }
    if (Notification.permission === "denied") {
      visaToast("Notiser är blockerade — tillåt ak1nvestor.com i webbläsarens inställningar.", "fel");
      return;
    }
    try {
      const svar = await Notification.requestPermission();
      setNotisRattighet(svar);
      visaToast(
        svar === "granted"
          ? "Notiser på — du får veta när agenten arbetat över 60 s och när den är klar."
          : "Inga notiser — titelväxlingen fungerar ändå.",
      );
    } catch {
      visaToast("Notisrättigheten kunde ej begäras.", "fel");
    }
  }, [visaToast]);

  /**
   * LÅNGKÖRNINGSVAKT (våg 84 C): >60 s ⇒ Web Notification + titelväxling;
   * vid klart ⇒ "✓ Klar (N tkn)". Lyssnar på NÅGON tabb.
   */
  React.useEffect(() => {
    if (!nagotStrömmar) return;
    turnStartRef.current = Date.now();
    turnNotiseradRef.current = false;
    turnTknRef.current = null;
    grundTitelRef.current = document.title;
    const vakt = window.setInterval(() => {
      const start = turnStartRef.current;
      if (!start || turnNotiseradRef.current) return;
      if (Date.now() - start < TURN_NOTIS_TRAOSKEL_MS) return;
      turnNotiseradRef.current = true;
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          new Notification("⏳ Agenten arbetar…", {
            body: "Rundan har pågått över 60 sekunder — studion fortsätter själv. Du kan lämna fliken öppen.",
            tag: "ak1a-studio-turn",
          });
          loggaNotis("Agenten arbetar… (rundan >60 s)", "lang");
        } catch {
          // vissa plattformar kräver ServiceWorker-registrering — tyst
        }
      }
      if (titleVaxlingRef.current === null) {
        const grund = grundTitelRef.current ?? "AK1A Studio";
        let visaVaxel = false;
        titleVaxlingRef.current = window.setInterval(() => {
          visaVaxel = !visaVaxel;
          document.title = visaVaxel ? "⏳ Agenten arbetar…" : grund;
        }, 1_500);
      }
    }, 2_000);
    return () => {
      window.clearInterval(vakt);
      const start = turnStartRef.current;
      turnStartRef.current = null;
      if (titleVaxlingRef.current !== null) {
        window.clearInterval(titleVaxlingRef.current);
        titleVaxlingRef.current = null;
      }
      if (grundTitelRef.current !== null) document.title = grundTitelRef.current;
      const antal = turnTknRef.current;
      const paminerad = turnNotiseradRef.current;
      turnNotiseradRef.current = false;
      if (start !== null && paminerad && typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          new Notification(`✓ Klar${typeof antal === "number" ? ` (${tkn(antal)} tkn)` : ""}`, {
            body: "Agenten är klar — öppna studion för att läsa svaret.",
            tag: "ak1a-studio-turn",
          });
          loggaNotis(`Klar${typeof antal === "number" ? ` (${tkn(antal)} tkn)` : ""}`, "klar");
        } catch {
          // tyst
        }
      }
    };
  }, [nagotStrömmar, loggaNotis]);

  // ── Tabbhantering — ny tabb, växla, stäng (våg 84 B; tak 8) ────────────────
  const MAX_TABBAR = 8;

  const nyTabb = () => {
    if (tabbar.length >= MAX_TABBAR) {
      visaToast(`Max ${MAX_TABBAR} samtal — stäng ett först (serverns RAM-tak).`, "fel");
      return;
    }
    const ny: Tabb = { id: nyttId(), huvud: false, sessionId: null, titel: "Ny tabb", ...tabbGrund(), uppdaterad: Date.now() };
    setTabbar((alla) => [...alla, ny]);
    setAktivTabbId(ny.id);
    setPrompt("");
    setMobilSidebar(false);
    ytaRef.current?.focus();
  };

  const valjTabb = (id: string) => {
    if (id === aktivTabbId) return;
    const t = tabbar.find((x) => x.id === id);
    if (!t) return;
    setAktivTabbId(id);
    setPrompt(t.utkast);
    setMobilSidebar(false);
    requestAnimationFrame(() => {
      const yta = blattraRef.current;
      if (yta) yta.scrollTo({ top: yta.scrollHeight, behavior: "instant" as ScrollBehavior });
    });
  };

  const stangTabb = (id: string) => {
    const t = tabbar.find((x) => x.id === id);
    if (!t) return;
    if (t.strömmar && !window.confirm("Agenten arbetar — avbryta?")) return;
    tabbAbortRef.current.get(id)?.abort();
    tabbAbortRef.current.delete(id);
    const kvar = tabbar.filter((x) => x.id !== id);
    if (kvar.length === 0) {
      const ny: Tabb = { id: nyttId(), huvud: true, sessionId: null, titel: "Huvudsession", ...tabbGrund(), uppdaterad: Date.now() };
      setTabbar([ny]);
      setAktivTabbId(ny.id);
      setPrompt("");
      return;
    }
    setTabbar(kvar);
    if (aktivTabbId === id) {
      setAktivTabbId(kvar[0].id);
      setPrompt(kvar[0].utkast);
    }
  };

  /** Öppna session ur listan i en NY TABB (resume). Redan öppen ⇒ växla. */
  const oppnaITabb = (sessionId: string, titel?: string) => {
    sparaSenasteSessionId(sessionId);
    const befintlig = tabbar.find((t) => t.sessionId === sessionId);
    if (befintlig) {
      valjTabb(befintlig.id);
      setMenyOppen(false);
      setMobilSidebar(false);
      return;
    }
    if (tabbar.length >= MAX_TABBAR) {
      visaToast(`Max ${MAX_TABBAR} samtal — stäng ett först (serverns RAM-tak).`, "fel");
      return;
    }
    const ny: Tabb = {
      id: nyttId(),
      huvud: false,
      sessionId,
      titel: titel && titel.trim() ? kortNamn(titel) : `Session ${sessionId.slice(5, 13)}`,
      ...tabbGrund(),
      uppdaterad: sessionId ? Date.now() : 0,
    };
    setTabbar((alla) => [...alla, ny]);
    setAktivTabbId(ny.id);
    setPrompt("");
    setMenyOppen(false);
    setMobilSidebar(false);
  };

  // ── Persistens: tabbar + buffert i sessionStorage (throttlad) ──────────────
  React.useEffect(() => {
    const spara = () => {
      senasteSparaRef.current = Date.now();
      sparaTabbar(tabbar, aktivTabbId);
    };
    if (Date.now() - senasteSparaRef.current > 1_500) {
      spara();
      return;
    }
    if (sparaTimerRef.current !== null) return;
    sparaTimerRef.current = window.setTimeout(() => {
      sparaTimerRef.current = null;
      spara();
    }, 1_500);
    return () => {
      if (sparaTimerRef.current !== null) {
        window.clearTimeout(sparaTimerRef.current);
        sparaTimerRef.current = null;
      }
    };
  }, [tabbar, aktivTabbId]);

  React.useEffect(() => {
    const vidStang = () => sparaTabbar(tabbarRef.current.tabbar, tabbarRef.current.aktivTabbId);
    window.addEventListener("beforeunload", vidStang);
    return () => window.removeEventListener("beforeunload", vidStang);
  }, []);

  // Composer-utkastet följer den aktiva tabben (per-tabb draft).
  React.useEffect(() => {
    if (!aktivTabb || aktivTabb.utkast === prompt) return;
    rörTabb(aktivTabb.id, (t) => ({ ...t, utkast: prompt }));
    // avsiktligt smal dep: endast prompt — tabbyte sätter prompt separat
  }, [prompt]);

  React.useEffect(() => {
    hojdpassaYta(ytaRef.current);
  }, [prompt]);

  // ── Permission-svar + minnesregler + auto-godkännande (våg 84 C) ───────────
  const skickaPermissionSvar = React.useCallback(
    async (requestId: string, alternativId: string, tyst = false) => {
      try {
        const res = await fetch("/api/studio/interaktion", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ typ: "permission", requestId, alternativ: alternativId }),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; beslut?: string; fel?: string };
        setPermission((p) => (p?.requestId === requestId ? null : p));
        if (res.ok && data.ok) {
          if (!tyst) visaToast(`Verktyget ${data.beslut ?? "besvarat"}`);
        } else {
          visaToast(data.fel || "Begäran var redan besvarad (30 s-gränsen).", "fel");
        }
      } catch {
        visaToast("Nätverksfel — svaret gick ej fram.", "fel");
      }
    },
    [visaToast],
  );

  const svaraPermission = React.useCallback(
    async (requestId: string, alternativId: string) => {
      if (svarJobbar) return;
      setSvarJobbar(true);
      try {
        await skickaPermissionSvar(requestId, alternativId);
      } finally {
        setSvarJobbar(false);
      }
    },
    [svarJobbar, skickaPermissionSvar],
  );

  const sparaRegel = React.useCallback((verktyg: string): boolean => {
    const namn = verktyg.trim();
    if (!namn) return false;
    if (reglerRef.current.some((r) => r.verktyg.toLowerCase() === namn.toLowerCase())) return false;
    const nya = [...reglerRef.current, { verktyg: namn, omfattning: "alltid" as const, skapad: Date.now() }];
    reglerRef.current = nya;
    setRegler(nya);
    try {
      window.localStorage.setItem(REGEL_NYCKEL, JSON.stringify(nya));
    } catch {
      // privat läge/utrymme — regeln lever bara denna session
    }
    return true;
  }, []);

  const tabortRegel = React.useCallback((verktyg: string) => {
    const nya = reglerRef.current.filter((r) => r.verktyg !== verktyg);
    reglerRef.current = nya;
    setRegler(nya);
    try {
      window.localStorage.setItem(REGEL_NYCKEL, JSON.stringify(nya));
    } catch {
      // se sparaRegel
    }
  }, []);

  const mottagenPermission = React.useCallback(
    (p: PermissionDialog) => {
      const match = reglerRef.current.find((r) => r.verktyg.toLowerCase() === p.verktyg.toLowerCase());
      if (match) {
        rörTabb(aktivTabbIdRef.current, (t) => ({
          ...t,
          uppdaterad: Date.now(),
          meddelanden: [
            ...t.meddelanden,
            {
              id: nyttId(),
              roll: "assistant" as const,
              text: `🛡 **${p.verktyg}** auto-godkänd enligt din regel (_alltid tillåt_${p.diff ? ` · diff: +${p.diff.plus}/−${p.diff.minus}` : ""}) — hantera regler via Mer → Minnesregler.`,
            },
          ],
        }));
        void skickaPermissionSvar(p.requestId, "allow_once", true);
        return;
      }
      setPermission(p);
    },
    [skickaPermissionSvar, rörTabb],
  );

  /** Uppdatera sessionlistan + aktiv session + mål + workspaceinfo. */
  const lasSessioner = React.useCallback(async () => {
    try {
      const res = await fetch("/api/studio/session", { headers: adminHeaders() });
      if (res.ok) {
        const data = (await res.json()) as {
          sessioner?: SessionPost[];
          aktiv?: string | null;
          mal?: { mal: string | null; meddelande: string; aktiv?: boolean } | null;
          arbetsyta?: ArbetsytaInfo | null;
        };
        if (data.sessioner) setSessioner(data.sessioner);
        if (typeof data.aktiv === "string") setAktivSession(data.aktiv);
        if (data.mal) {
          setMal(data.mal.mal);
          if (data.mal.mal) {
            setMalStrömOppen(true);
            if (typeof data.mal.aktiv === "boolean") {
              setMalStatus((s) => (s ? s : { aktiv: data.mal!.aktiv === true, pausad: false, iteration: 0 }));
            }
          }
        }
        if (data.arbetsyta) setArbetsytaInfo(data.arbetsyta);
      }
    } catch {
      // listan är lyx
    }
  }, []);

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

  // ── AUTO-SCROLL (våg 84 A3): bara när användaren är vid botten ─────────────
  const paScrollChatt = React.useCallback(() => {
    const yta = blattraRef.current;
    if (!yta) return;
    const nuVid = yta.scrollHeight - yta.scrollTop - yta.clientHeight < 90;
    vidBottenRef.current = nuVid;
    setVidBotten((nu) => (nu === nuVid ? nu : nuVid));
  }, []);

  React.useEffect(() => {
    const yta = blattraRef.current;
    if (!yta) return;
    if (vidBottenRef.current) {
      yta.scrollTo({ top: yta.scrollHeight, behavior: "instant" as ScrollBehavior });
    }
  }, [meddelanden, tankar, statusText, permission, fraga]);

  React.useEffect(() => {
    const nu = meddelanden.length;
    const skillnad = nu - foreLangdRef.current;
    foreLangdRef.current = nu;
    if (skillnad > 0 && !vidBottenRef.current) {
      setNyaSedanUpp((n) => n + skillnad);
    } else if (vidBottenRef.current && skillnad !== 0) {
      setNyaSedanUpp(0);
    }
  }, [meddelanden.length]);

  const hoppaNerChatt = React.useCallback(() => {
    const yta = blattraRef.current;
    if (yta) yta.scrollTo({ top: yta.scrollHeight, behavior: "smooth" });
    vidBottenRef.current = true;
    setVidBotten(true);
    setNyaSedanUpp(0);
  }, []);

  /**
   * VÅG 97 E2 (borta-replay): hämta verktygsaktiviteten för borta-bannern —
   * GET /api/studio/session/events?sessionId= (V93 C4:s replay-kort,
   * aggregerade per toolCallId till slutstatus). Anropas BOTH vid mount-
   * återkopplingen AND reconnect-pollen (återkomst utan sidreload).
   * Fire-and-forget: bannern visar svaren direkt, verktygsraderna droppar
   * in när replayen landar. 404/501/502/timeout/nätverksfel = TYST —
   * replay är lyx, historik-vägen (svaren) består ALWAYS (graceful).
   */
  const hamtaBortaKort = React.useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/studio/session/events?sessionId=${encodeURIComponent(sessionId)}`, {
        headers: adminHeaders(),
      });
      if (!res.ok) return; // 404/501/502 ⇒ befintligt beteende utan kort
      const data = (await res.json().catch(() => ({}))) as { kort?: VerktygKort[] };
      if (!Array.isArray(data.kort) || data.kort.length === 0) return;
      setBortaBanner((b) => (b ? { ...b, kort: data.kort } : b));
    } catch {
      // replay är lyx — bannern räcker utan kort
    }
  }, []);

  // ── Uppstart: hydrera tabbar + historik + kontext + modeller + sessioner ───
  React.useEffect(() => {
    let levande = true;
    const sparad = lasTabbar();
    if (sparad) {
      setTabbar(sparad.tabbar);
      setAktivTabbId(sparad.aktivTabbId);
      aktivTabbIdRef.current = sparad.aktivTabbId;
      const aktiv = sparad.tabbar.find((t) => t.id === sparad.aktivTabbId) ?? sparad.tabbar[0];
      setPrompt(aktiv?.utkast ?? "");
    }
    const malTabbId = sparad
      ? (sparad.tabbar.find((t) => t.id === sparad.aktivTabbId) ?? sparad.tabbar[0]).id
      : "tabb-huvud";
    const malArHuvud = sparad
      ? (sparad.tabbar.find((t) => t.id === malTabbId) ?? sparad.tabbar[0]).huvud
      : true;
    const huvudId = sparad ? (sparad.tabbar.find((t) => t.huvud) ?? sparad.tabbar[0]).id : "tabb-huvud";
    (async () => {
      try {
        const res = await fetch("/api/studio/stream", { headers: adminHeaders() });
        if (res.ok) {
          const data = (await res.json()) as {
            transport?: string;
            live?: boolean;
            sessionId?: string | null;
            historik?: HistorikPost[];
            kontext?: KontextInfo | null;
            senastAktivSessionId?: string | null;
            senastAktivHistorik?: HistorikPost[];
            aktivtMal?: { aktiv: boolean; pausad: boolean; iteration: number; mal: string | null } | null;
            interaktioner?: (
              | {
                  typ: "permission";
                  requestId: string;
                  verktyg: string;
                  risk: string;
                  skäl?: string;
                  sammanfattning: string;
                  alternativ: PermissionAlternativ[];
                  diff?: Filandring;
                }
              | { typ: "fråga"; requestId: string; fråga: string; inputTyp?: string; val?: string[] }
            )[];
          };
          if (!levande) return;
          setLive(data.live ? (data.transport === "mock" ? "demo" : "live") : "ned");
          setStatusText(data.live ? (data.transport === "mock" ? "Demo-läge (mock-transport)" : "Sessionen lever") : "Agenten kunde ej nås");
          if (malArHuvud && data.historik?.length) {
            rörTabb(malTabbId, (t) => ({
              ...t,
              uppdaterad: Date.now(),
              meddelanden: data.historik!.map(meddelandeUrHistorik),
            }));
          }
          if (data.kontext) {
            if (malArHuvud) {
              rörTabb(malTabbId, (t) => ({
                ...t,
                kontext: data.kontext ?? null,
                ackumulerat:
                  typeof data.kontext?.totalTokenCount === "number" ? data.kontext.totalTokenCount : t.ackumulerat,
              }));
            }
            setLage(data.kontext.lage ?? "build");
            setTanka(data.kontext.tankeNiva ?? "");
          }
          for (const i of data.interaktioner ?? []) {
            if (i.typ === "permission") {
              mottagenPermission({
                requestId: i.requestId,
                verktyg: i.verktyg,
                risk: i.risk,
                skäl: i.skäl,
                sammanfattning: i.sammanfattning,
                alternativ: i.alternativ ?? [],
                diff: i.diff,
              });
            } else {
              setFraga({ requestId: i.requestId, fråga: i.fråga, inputTyp: i.inputTyp, val: i.val });
              setFragSvar("");
            }
          }
          // ── ÅTERKOPPLING (våg 87 H1): auto-ladda senast aktiva session ──
          const aktivtMal = data.aktivtMal ?? null;
          if (aktivtMal) {
            setMal(aktivtMal.mal);
            setMalStatus({ aktiv: aktivtMal.aktiv, pausad: aktivtMal.pausad, iteration: aktivtMal.iteration });
            setMalIteration(aktivtMal.iteration);
            if (aktivtMal.mal) setMalStrömOppen(true);
          }
          const senastAktivSessionId =
            typeof data.senastAktivSessionId === "string" && data.senastAktivSessionId ? data.senastAktivSessionId : null;
          const senastAktivHistorik = Array.isArray(data.senastAktivHistorik) ? data.senastAktivHistorik : [];
          const sparadSid = lasSenasteSessionId();
          // VÅG 139 — SESSIONS-PREFERENS VID ÖPPNING/REFRESH ("chatten tappas
          // när jag uppdaterar"): tidigare trumfade serverns "senast aktiva"
          // kundens sparade flik — men efter varje styrelserond/testprompt är
          // "senast aktiva" = ROND-sessionen, och kundens egen chatt försvann
          // ur vyn. Ny ordning: (1) kundens sparade session om den lever,
          // (2) MÅL-sessionen (pågående arbetet — chatten fortsätter synas),
          // (3) transportens senast aktiva, (4) listans senaste (v128).
          const sessionerLista =
            (data as { sessioner?: { sessionId: string }[] }).sessioner ?? [];
          const leverIListan = (id: string | null): id is string =>
            !!id && sessionerLista.some((s) => s.sessionId === id);
          const malSid =
            (aktivtMal as unknown as { sessionId?: string } | null)?.sessionId ?? null;
          let kandidat: string | null = leverIListan(sparadSid)
            ? sparadSid
            : leverIListan(malSid)
              ? malSid
              : senastAktivSessionId;
          let aktivHistorik = senastAktivHistorik;
          // Kandidaten är inte transportens egna session ⇒ hämta dess historik
          const transportSid = typeof data.sessionId === "string" ? data.sessionId : "";
          if (
            kandidat &&
            kandidat !== senastAktivSessionId &&
            kandidat !== transportSid
          ) {
            try {
              const r2 = await fetch(`/api/studio/stream?sessionId=${encodeURIComponent(kandidat)}`, {
                headers: adminHeaders(),
              });
              if (r2.ok) {
                const d2 = (await r2.json()) as { historik?: HistorikPost[] };
                if (Array.isArray(d2.historik) && d2.historik.length > 0) {
                  aktivHistorik = d2.historik;
                }
              }
            } catch { /* nätverksfel — tabben börjar tom; nästa prompt resumear */ }
          }
          // VÅG 128 — "STUDION ÄR INTE HELT ÖPPEN"-BOTEN: transporten kan ha
          // tappat sin sessionsbindning (pm2-omstart/session-churn) medan
          // ALLA sessioner lever kvar i listan ⇒ kandidat=null ⇒ TOM vy.
          // Fallback: senaste sessionen i listan + dess historik ⇒ studion
          // öppnar ALLTID med det senaste samtalet synligt.
          if (!kandidat) {
            const s0 = sessionerLista[0];
            if (s0?.sessionId) {
              kandidat = s0.sessionId;
              try {
                const r2 = await fetch(`/api/studio/stream?sessionId=${encodeURIComponent(s0.sessionId)}`, {
                  headers: adminHeaders(),
                });
                if (r2.ok) {
                  const d2 = (await r2.json()) as { historik?: HistorikPost[] };
                  if (Array.isArray(d2.historik)) aktivHistorik = d2.historik;
                }
              } catch { /* nätverksfel — tabben börjar tom; nästa prompt resumear */ }
            }
          }
          // VÅG 140 — TRÅDKEDJAN VID ÖPPNING/REFRESH: kandidaten kan vara
          // trådens SENASTE session; föregångarna (sessionsbyten) hämtas och
          // konkateneras FÖRE kandidatens historia ⇒ hela tråden syns igen.
          if (kandidat) {
            const kand = kandidat;
            const trådTabb =
              sparad?.tabbar.find(
                (t) => t.sessionId === kand || (t.kedja ?? []).includes(kand),
              ) ?? null;
            const kedja = [...(trådTabb?.kedja ?? [])].filter(
              (sid, i, alla) => alla.indexOf(sid) === i && sid !== kand,
            );
            if (kedja.length > 0) {
              const delar = await Promise.all(
                kedja.map(async (sid) => {
                  try {
                    const r = await fetch(`/api/studio/stream?sessionId=${encodeURIComponent(sid)}`, {
                      headers: adminHeaders(),
                    });
                    if (!r.ok) return [] as HistorikPost[];
                    const d = (await r.json()) as { historik?: HistorikPost[] };
                    return Array.isArray(d.historik) ? d.historik : [];
                  } catch {
                    return [] as HistorikPost[];
                  }
                }),
              );
              const gamlaTråden = delar.flat();
              if (gamlaTråden.length > 0) {
                aktivHistorik = [...gamlaTråden, ...aktivHistorik];
              }
            }
          }
          // VÅG 143 — TRÅDVALET: den PÅGÅENDE tråden vinner när den bär MER
          // historia än den valda kandidaten. Kundbevis: refresh visade 1–2
          // meddelanden fast tråden hade 21 — den korta sparade sessionen
          // skrev över den långa pågående (ditt "12 agenter"-meddelande
          // fanns hela tiden i tråden, vyn valde fel).
          if (
            senastAktivSessionId &&
            kandidat !== senastAktivSessionId &&
            senastAktivHistorik.length > aktivHistorik.length
          ) {
            kandidat = senastAktivSessionId;
            aktivHistorik = senastAktivHistorik;
          }
          // ── IndexedDB-jämförelse (våg 88 I3): cachen FLER ⇒ cachad vinner ──
          let cacheTrumfar = false;
          if (levande && sparadSid && sparadSid === kandidat) {
            const meta = lasHistorikMeta();
            if (meta && meta.sessionId === sparadSid) {
              const serverLista =
                typeof data.sessionId === "string" && sparadSid === data.sessionId
                  ? (Array.isArray(data.historik) ? data.historik : [])
                  : senastAktivHistorik;
              const cache = await lasHistorikCache(sparadSid);
              if (cache && cache.meddelanden.length > serverLista.length) {
                aktivHistorik = cache.meddelanden;
                cacheTrumfar = true;
              }
            }
          }
          if (levande && kandidat && aktivHistorik.length > 0) {
            sparaSenasteSessionId(kandidat);
            // VÅG 93 C4 + VÅG 97 E2: verktygsaktiviteten under frånvaron —
            // replay ur session/events (lyftad hamtaBortaKort, även i
            // reconnect-pollen). Fire-and-forget: bannern visar svaren
            // direkt, verktygsraderna droppar in när replayen landar.
            const arDefault = typeof data.sessionId === "string" && kandidat === data.sessionId;
            const tillMeddelanden = (lista: HistorikPost[]) => lista.map(meddelandeUrHistorik);
            const nyaSvar = aktivHistorik.filter((h) => h.roll === "assistant").length;
            if (arDefault) {
              const forr = sparad?.tabbar.find((t) => t.huvud) ?? null;
              const forrSvar = forr ? forr.meddelanden.filter((m) => m.roll === "assistant").length : 0;
              rörTabb(huvudId, (t) => ({
                ...t,
                // VÅG 140: huvudfliken binder trådens SENASTE session — och
                // minler föregångaren om nyckeln byts (kedjan lever vid nästa
                // refresh).
                sessionId: kandidat,
                kedja: [
                  ...(t.kedja ?? []).filter((sid) => sid !== kandidat),
                  ...(t.sessionId && t.sessionId !== kandidat ? [t.sessionId] : []),
                ].filter((sid, i, alla) => alla.indexOf(sid) === i),
                meddelanden: tillMeddelanden(aktivHistorik),
                historikLasad: true,
                uppdaterad: Date.now(),
              }));
              setAktivTabbId(huvudId);
              setPrompt(forr?.utkast ?? "");
              if (nyaSvar > forrSvar) {
                setBortaBanner({ antalTurner: nyaSvar - forrSvar, sessionId: kandidat, malKorer: aktivtMal?.aktiv === true });
                void hamtaBortaKort(kandidat);
              }
            } else {
              const äger = sparad?.tabbar.find((t) => t.sessionId === kandidat) ?? null;
              const forrSvar = äger ? äger.meddelanden.filter((m) => m.roll === "assistant").length : 0;
              if (äger) {
                rörTabb(äger.id, (t) => ({
                  ...t,
                  meddelanden: tillMeddelanden(aktivHistorik),
                  historikLasad: true,
                  uppdaterad: Date.now(),
                }));
                setAktivTabbId(äger.id);
                setPrompt(äger.utkast);
              } else {
                const nyTabbId = nyttId();
                setTabbar((alla) => [
                  ...alla,
                  {
                    id: nyTabbId,
                    huvud: false,
                    sessionId: kandidat,
                    titel: `Åter ${kandidat.slice(5, 13)}`,
                    ...tabbGrund(),
                    meddelanden: tillMeddelanden(aktivHistorik),
                    historikLasad: true,
                    uppdaterad: Date.now(),
                  },
                ]);
                setAktivTabbId(nyTabbId);
                setPrompt("");
              }
              if (nyaSvar > forrSvar) {
                setBortaBanner({ antalTurner: nyaSvar - forrSvar, sessionId: kandidat, malKorer: aktivtMal?.aktiv === true });
                void hamtaBortaKort(kandidat);
              }
            }
          }
          if (cacheTrumfar) {
            visaToast("Visar cachad historik — webbläsarens kopia hade fler meddelanden än servern.");
          }
        } else if (res.status === 401) {
          if (levande) setStatusText("Logga in igen — sessionen har löpt ut.");
        }
      } catch {
        if (levande) setStatusText("Nätverksfel — agenten kunde ej nås.");
      }
      if (levande) setLaddarHistorik(false);
      void lasModeller();
      void lasSessioner();
      // Senaste turnens filändringar — huvudtabbens sista agentbubbla.
      try {
        const res = await fetch("/api/studio/andringar", { headers: adminHeaders() });
        if (res.ok) {
          const data = (await res.json()) as { filer?: Filandring[] };
          if (levande && Array.isArray(data.filer) && data.filer.length > 0) {
            rörTabb(huvudId, (t) => {
              for (let i = t.meddelanden.length - 1; i >= 0; i--) {
                if (t.meddelanden[i].roll === "assistant") {
                  const kopia = [...t.meddelanden];
                  kopia[i] = { ...t.meddelanden[i], ändringar: data.filer };
                  return { ...t, meddelanden: kopia };
                }
              }
              return t;
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
  }, [lasModeller, lasSessioner, mottagenPermission, rörTabb, visaToast, hamtaBortaKort]);

  // ── EGEN TABB-SIDALOAD — resume tidigare sessioner (våg 84 B) ──────────────
  React.useEffect(() => {
    const t = tabbar.find((x) => x.id === aktivTabbId);
    if (!t || t.huvud || !t.sessionId || t.historikLasad || t.meddelanden.length > 0) return;
    rörTabb(t.id, (x) => ({ ...x, historikLasad: true }));
    let levande = true;
    (async () => {
      try {
        const res = await fetch(`/api/studio/stream?sessionId=${encodeURIComponent(t.sessionId!)}`, {
          headers: adminHeaders(),
        });
        if (!res.ok || !levande) return;
        const data = (await res.json()) as {
          historik?: HistorikPost[];
          kontext?: KontextInfo | null;
          fel?: string;
        };
        if (!levande) return;
        if (Array.isArray(data.historik) && data.historik.length > 0) {
          rörTabb(t.id, (x) => ({
            ...x,
            uppdaterad: Date.now(),
            meddelanden: data.historik!.map(meddelandeUrHistorik),
          }));
        }
        if (data.kontext) {
          rörTabb(t.id, (x) => ({
            ...x,
            kontext: data.kontext ?? null,
            ackumulerat:
              typeof data.kontext?.totalTokenCount === "number" ? data.kontext.totalTokenCount : x.ackumulerat,
          }));
        }
        if (data.fel) visaToast(data.fel, "fel");
      } catch {
        // nätverksfel — tabben börjar tom; nästa prompt resumear ändå
      }
    })();
    return () => {
      levande = false;
    };
  }, [aktivTabbId, tabbar, rörTabb, visaToast]);

  // ── RECONNECT-POLL (våg 87 H1 + våg 88 I3: 15 s vid mål, annars 30 s) ──────
  const pollAterkopplingRef = React.useRef<() => Promise<void>>(async () => undefined);
  const pollAterkoppling = React.useCallback(async () => {
    try {
      const res = await fetch("/api/studio/stream", { headers: adminHeaders() });
      if (!res.ok) return;
      const data = (await res.json()) as {
        sessionId?: string | null;
        senastAktivSessionId?: string | null;
        aktivtMal?: { aktiv: boolean; pausad: boolean; iteration: number; mal: string | null } | null;
        sessionskarta?: Record<string, { aktiv?: boolean }>;
      };
      if (data.aktivtMal) {
        setMal(data.aktivtMal.mal);
        setMalStatus({
          aktiv: data.aktivtMal.aktiv,
          pausad: data.aktivtMal.pausad,
          iteration: data.aktivtMal.iteration,
        });
        setMalIteration(data.aktivtMal.iteration);
        if (data.aktivtMal.aktiv && !malStrömOppen) setMalStrömOppen(true);
      }
      const karta = data.sessionskarta ?? {};
      const malPaDefault = data.aktivtMal?.aktiv === true;
      for (const [sid, kort] of Object.entries(karta)) {
        if (!kort?.aktiv) continue;
        if (malPaDefault && sid === data.sessionId) continue;
        const tb = tabbarRef.current.tabbar.find((t) => t.sessionId === sid);
        if (tb && !tb.strömmar && !serverSynkRef.current.has(sid)) {
          serverSynkRef.current.add(sid);
          rörTabb(tb.id, (t) => ({ ...t, strömmar: true, status: "Agenten arbetar (återkopplad)…" }));
        }
      }
      for (const sid of [...serverSynkRef.current]) {
        const kort = karta[sid];
        if (kort?.aktiv) continue;
        serverSynkRef.current.delete(sid);
        const tb = tabbarRef.current.tabbar.find((t) => t.sessionId === sid);
        if (!tb) continue;
        rörTabb(tb.id, (t) => ({ ...t, strömmar: false, status: "" }));
        try {
          const r2 = await fetch(`/api/studio/stream?sessionId=${encodeURIComponent(sid)}`, {
            headers: adminHeaders(),
          });
          if (!r2.ok) continue;
          const d2 = (await r2.json()) as { historik?: HistorikPost[] };
          if (!Array.isArray(d2.historik) || d2.historik.length === 0) continue;
          const forrSvar = tb.meddelanden.filter((m) => m.roll === "assistant").length;
          const nyaSvar = d2.historik.filter((h) => h.roll === "assistant").length;
          rörTabb(tb.id, (t) => ({
            ...t,
            meddelanden: d2.historik!.map(meddelandeUrHistorik),
            historikLasad: true,
            uppdaterad: Date.now(),
          }));
          if (nyaSvar > forrSvar) {
            // VÅG 97 E2: även poll-upptäckt frånvaro berikas med replay-kort.
            setBortaBanner({ antalTurner: nyaSvar - forrSvar, sessionId: sid, malKorer: false });
            void hamtaBortaKort(sid);
          }
        } catch {
          // nästa poll (30 s) försöker igen
        }
      }
    } catch {
      // nätverksfel — nästa poll försöker igen
    }
  }, [malStrömOppen, rörTabb, hamtaBortaKort]);

  React.useEffect(() => {
    pollAterkopplingRef.current = pollAterkoppling;
  }, [pollAterkoppling]);

  React.useEffect(() => {
    const kanske = () => {
      if (document.visibilityState === "visible") void pollAterkopplingRef.current();
    };
    let tid: number | undefined;
    const arma = () => {
      const aktivtMal = malStatusRef.current?.aktiv === true && malStatusRef.current.pausad !== true;
      tid = window.setTimeout(() => {
        kanske();
        arma();
      }, aktivtMal ? 15_000 : 30_000);
    };
    arma();
    document.addEventListener("visibilitychange", kanske);
    return () => {
      if (tid !== undefined) window.clearTimeout(tid);
      document.removeEventListener("visibilitychange", kanske);
    };
  }, []);

  // ── Modellbyte / ny session / komprimering (våg 82) ────────────────────────
  /** true = sessionssparat ny modell (VÅG 93 C3: drawern sparar då standarden). */
  const bytModell = React.useCallback(
    async (modellId: string): Promise<boolean> => {
      if (!modellId || modellId === valdModell || byterModell || strömmarHuvud) return false;
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
          rörTabb(huvudTabb?.id ?? "tabb-huvud", (t) => ({
            ...t,
            sessionId: null,
            meddelanden: [],
            kontext: null,
            rundaTkn: null,
            ackumulerat: 0,
            historikLasad: false,
          }));
          visaToast(`Modell bytt till ${data.modell ?? namn} — ny session skapad`);
          void lasSessioner();
          return true;
        } else {
          visaToast(data.fel || "Modellbytet misslyckades.", "fel");
          return false;
        }
      } catch {
        visaToast("Nätverksfel under modellbytet.", "fel");
        return false;
      } finally {
        setByterModell(false);
      }
    },
    [modeller, strömmarHuvud, visaToast, lasSessioner, valdModell, byterModell, rörTabb, huvudTabb],
  );

  const startaNySession = React.useCallback(async () => {
    if (sessionJobbar || strömmarHuvud) return;
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
        rörTabb(huvudTabb?.id ?? "tabb-huvud", (t) => ({
          ...t,
          sessionId: null,
          meddelanden: [],
          kontext: data.kontext ?? null,
          rundaTkn: null,
          ackumulerat: data.kontext?.totalTokenCount ?? 0,
          historikLasad: false,
        }));
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
  }, [sessionJobbar, strömmar, visaToast, lasSessioner, rörTabb, huvudTabb]);

  // ── CHECKPOINT/REWIND (våg 86 G5): "⟲ Gå tillbaka hit" ──────────────────────
  const gaTillbakaHit = React.useCallback(
    async (bubblaId: string) => {
      const tabb = aktivTabb;
      if (!tabb || rewindJobbar) return;
      if (tabb.strömmar) {
        visaToast("Agenten arbetar i tabben — vänta tills den är klar.", "fel");
        return;
      }
      const turnIndex = turnIndexKarta.get(bubblaId) ?? -1;
      if (turnIndex < 0) return;
      const iteration = turnIndex + 1;
      if (
        !window.confirm(
          `Gå tillbaka till iteration ${iteration}?\n\nSessionen forkas vid denna punkt — den nya sessionen börjar från detta svar och nästa prompt fortsätter där. Den gamla sessionen finns kvar i samtalslistan.`,
        )
      ) {
        return;
      }
      setRewindJobbar(true);
      setStatusText("Forkar sessionen…");
      try {
        const res = await fetch("/api/studio/session", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({
            action: "rewind",
            turnIndex,
            ...(tabb.huvud ? {} : tabb.sessionId ? { sessionId: tabb.sessionId } : {}),
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          sessionId?: string;
          iteration?: number;
          historik?: HistorikPost[];
          kontext?: KontextInfo | null;
          meddelande?: string;
          fel?: string;
        };
        if (res.ok && data.sessionId) {
          rörTabb(tabb.id, (t) => ({
            ...t,
            sessionId: data.sessionId!,
            titel: t.titel === "Ny tabb" ? `Fork ${data.iteration ?? iteration}` : t.titel,
            meddelanden: (data.historik ?? []).map(meddelandeUrHistorik),
            kontext: data.kontext ?? null,
            rundaTkn: null,
            ackumulerat:
              typeof data.kontext?.totalTokenCount === "number" ? data.kontext.totalTokenCount : 0,
            historikLasad: true,
            uppdaterad: Date.now(),
          }));
          visaToast(`Sessionen har forkats från iteration ${data.iteration ?? iteration}`);
          setStatusText("");
          void lasSessioner();
        } else {
          setStatusText("");
          visaToast(data.fel || "Rewinden misslyckades.", "fel");
        }
      } catch {
        setStatusText("");
        visaToast("Nätverksfel under rewinden.", "fel");
      } finally {
        setRewindJobbar(false);
      }
    },
    [aktivTabb, rewindJobbar, turnIndexKarta, rörTabb, visaToast, lasSessioner],
  );

  const komprimera = React.useCallback(async () => {
    if (sessionJobbar || strömmarHuvud) return;
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
          rörTabb(huvudTabb?.id ?? "tabb-huvud", (t) => ({
            ...t,
            kontext: data.kontext ?? null,
            ackumulerat: data.kontext?.totalTokenCount ?? 0,
          }));
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
  }, [sessionJobbar, strömmarHuvud, visaToast, live, rörTabb, huvudTabb]);

  /** Stäng session (session/close) — lever kvar i listan men svarar ej. */
  const stangSessionen = React.useCallback(
    async (sessionId: string) => {
      if (sessionJobbar || strömmarHuvud) return;
      setSessionJobbar("stang");
      try {
        const res = await fetch("/api/studio/session", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ action: "stang", sessionId }),
        });
        const data = (await res.json().catch(() => ({}))) as { stangd?: boolean; fel?: string };
        if (res.ok && data.stangd) {
          if (sessionId === aktivSession) setMal(null);
          setTabbar((alla) =>
            alla.map((t) =>
              t.sessionId === sessionId || (t.huvud && sessionId === aktivSession)
                ? {
                    ...t,
                    sessionId: null,
                    meddelanden: [],
                    kontext: null,
                    rundaTkn: null,
                    ackumulerat: 0,
                    historikLasad: false,
                  }
                : t,
            ),
          );
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
    [sessionJobbar, strömmarHuvud, visaToast, lasSessioner, aktivSession],
  );

  // ── Mål-läget (våg 85 F1): dialog → Starta → autonom loop ──────────────────
  const oppnaMalDialog = React.useCallback(() => {
    setMalDialogText(mal ?? "");
    setMalDialogOppen(true);
  }, [mal]);

  const startaMal = React.useCallback(async () => {
    const texten = malDialogText.trim();
    if (!texten || malStartar) return;
    setMalStartar(true);
    setMalStrömOppen(true);
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
        setMalStatus({ aktiv: true, pausad: false, iteration: 0 });
        setMalIteration(0);
        setMalDialogOppen(false);
        setMobilPanel(false);
        visaToast(data.meddelande || "Målet satt — agenten börjar arbeta mot det.");
      } else {
        visaToast(data.fel || "Målet kunde ej sparas.", "fel");
      }
    } catch {
      visaToast("Nätverksfel — målet kunde ej sparas.", "fel");
    } finally {
      setMalStartar(false);
    }
  }, [malDialogText, malStartar, visaToast]);

  const pausaMal = React.useCallback(async () => {
    if (malPausar) return;
    setMalPausar(true);
    try {
      const res = await fetch("/api/studio/session", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ action: "malPausa" }),
      });
      const data = (await res.json().catch(() => ({}))) as { meddelande?: string; fel?: string };
      if (res.ok) {
        setMalStatus((s) => ({ aktiv: false, pausad: true, iteration: s?.iteration ?? 0 }));
        visaToast(data.meddelande || "Målet pausat — iterationerna stannar.");
      } else {
        visaToast(data.fel || "Målet kunde ej pausas.", "fel");
      }
    } catch {
      visaToast("Nätverksfel — målet kunde ej pausas.", "fel");
    } finally {
      setMalPausar(false);
    }
  }, [malPausar, visaToast]);

  const aterupptaMal = React.useCallback(async () => {
    if (malPausar) return;
    setMalPausar(true);
    try {
      const res = await fetch("/api/studio/session", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ action: "malAteruppta" }),
      });
      const data = (await res.json().catch(() => ({}))) as { meddelande?: string; fel?: string };
      if (res.ok) {
        setMalStatus((s) => ({ aktiv: true, pausad: false, iteration: s?.iteration ?? 0 }));
        visaToast(data.meddelande || "Målet återupptaget — loopen fortsätter.");
      } else {
        visaToast(data.fel || "Målet kunde ej återupptas.", "fel");
      }
    } catch {
      visaToast("Nätverksfel — målet kunde ej återupptas.", "fel");
    } finally {
      setMalPausar(false);
    }
  }, [malPausar, visaToast]);

  const rensaMaler = React.useCallback(async () => {
    if (malSparar) return;
    if (malKör && !window.confirm("Mål-loopen kör — rensa målet och stoppa agenten?")) return;
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
        setMalStatus(null);
        setMalIteration(0);
        setMalStrömOppen(false);
        visaToast(data.meddelande || "Målet rensat.");
      } else {
        visaToast(data.fel || "Målet kunde ej rensas.", "fel");
      }
    } catch {
      visaToast("Nätverksfel — målet kunde ej rensas.", "fel");
    } finally {
      setMalSparar(false);
    }
  }, [malSparar, malKör, visaToast]);

  /**
   * MÅL-STRÖMMEN (våg 85 F1) — autonom loopens SSE (POST
   * /api/studio/mal/stream). Varje iteration = KOMPLETT agentblock i
   * huvudtabben med verktygskort + diff + rundstatistik.
   */
  React.useEffect(() => {
    if (!malStrömOppen) {
      malAbortRef.current?.abort();
      malAbortRef.current = null;
      return;
    }
    const abort = new AbortController();
    malAbortRef.current = abort;

    const rörBubbla = (rör: (m: Meddelande) => Meddelande) => {
      const id = malBubblaRef.current;
      if (!id) return;
      rörTabb(huvudTabbIdRef.current, (t) => ({
        ...t,
        uppdaterad: Date.now(),
        meddelanden: t.meddelanden.map((m) => (m.id === id ? rör(m) : m)),
      }));
    };
    const uppdateraKort = (id: string, rör: (k: VerktygKort) => VerktygKort) => {
      rörBubbla((m) => {
        const korta = m.verktygKort ? [...m.verktygKort] : [];
        const i = korta.findIndex((k) => k.id === id);
        if (i >= 0) korta[i] = rör(korta[i]);
        else korta.push(rör({ id, namn: "verktyg", steg: "planerad" }));
        return { ...m, verktygKort: korta };
      });
    };

    (async () => {
      try {
        const res = await fetch("/api/studio/mal/stream", {
          method: "POST",
          headers: adminHeaders(),
          signal: abort.signal,
        });
        if (!res.ok || !res.body) return;
        const läsare = res.body.getReader();
        const avkodare = new TextDecoder();
        let buffert = "";
        for (;;) {
          const { done, value } = await läsare.read();
          if (done) break;
          buffert += avkodare.decode(value, { stream: true });
          let gräns = buffert.indexOf("\n\n");
          while (gräns >= 0) {
            const block = buffert.slice(0, gräns);
            buffert = buffert.slice(gräns + 2);
            gräns = buffert.indexOf("\n\n");
            const dataRad = block.split("\n").find((r) => r.startsWith("data: "));
            if (!dataRad) continue;
            let event: StreamEvent;
            try {
              event = JSON.parse(dataRad.slice(6)) as StreamEvent;
            } catch {
              continue;
            }
            switch (event.typ) {
              case "mal_status":
                setMalStatus({
                  aktiv: event.aktiv ?? false,
                  pausad: event.pausad ?? false,
                  iteration: event.iteration ?? 0,
                });
                setMalIteration(event.iteration ?? 0);
                if (typeof event.mal === "string") setMal(event.mal);
                else if (event.mal === null && !event.aktiv && !event.pausad) setMal(null);
                break;
              case "mal_iteration":
                if (event.fas === "start") {
                  const iteration = event.iteration ?? 0;
                  setMalIteration(iteration);
                  const id = nyttId();
                  malBubblaRef.current = id;
                  rörTabb(huvudTabbIdRef.current, (t) => ({
                    ...t,
                    tankar: "",
                    status: `Autonom iteration ${iteration}…`,
                    uppdaterad: Date.now(),
                    meddelanden: [
                      ...t.meddelanden,
                      {
                        id,
                        roll: "assistant" as const,
                        text: "",
                        strömmande: true,
                        verktygKort: [],
                        malIteration: iteration,
                      },
                    ],
                  }));
                } else {
                  setMalIteration(event.iteration ?? 0);
                  rörBubbla((m) => ({
                    ...m,
                    text: event.svar && event.svar.trim() ? event.svar : m.text || "(tom iteration)",
                    strömmande: false,
                    rundStatistik: {
                      varaktighetMs: event.varaktighetMs,
                      resultatTyp: event.resultatTyp,
                      verktygAntal: event.verktygAntal,
                    },
                  }));
                  malBubblaRef.current = null;
                }
                break;
              case "delta":
                if (event.kanal === "tankar") {
                  // VÅG 97 E2: resonemanget samlas PER MEDDELANDE (bubblan) —
                  // tab-fältet lever kvar som status-spegel; ALDRIG i m.text.
                  rörTabb(huvudTabbIdRef.current, (t) => ({ ...t, tankar: (t.tankar + (event.text ?? "")).slice(-260) }));
                  rörBubbla((m) => ({ ...m, tankar: ((m.tankar ?? "") + (event.text ?? "")).slice(-TANKAR_TAK) }));
                } else {
                  rörBubbla((m) => ({ ...m, text: m.text + (event.text ?? "") }));
                }
                break;
              case "verktyg_kort":
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
                }
                break;
              case "verktyg_input":
                if (event.id) {
                  uppdateraKort(event.id, (k) => ({
                    ...k,
                    liveInput: (k.liveInput ?? "") + (event.text ?? ""),
                  }));
                }
                break;
              case "runda":
                if (event.fas === "slut") {
                  rörBubbla((m) => ({
                    ...m,
                    rundStatistik: {
                      varaktighetMs: event.varaktighetMs,
                      resultatTyp: event.resultatTyp,
                      verktygAntal: event.verktygAntal,
                    },
                  }));
                }
                break;
              case "status":
                rörTabb(huvudTabbIdRef.current, (t) => ({
                  ...t,
                  status: event.text || "Agenten utvecklar autonomt…",
                }));
                break;
              case "kontext":
                if (event.kontext) {
                  rörTabb(huvudTabbIdRef.current, (t) => ({
                    ...t,
                    kontext: event.kontext ?? null,
                    ackumulerat:
                      typeof event.kontext?.totalTokenCount === "number"
                        ? event.kontext.totalTokenCount
                        : t.ackumulerat,
                  }));
                }
                break;
              case "ändringar":
                if (Array.isArray(event.filer)) {
                  const filer = event.filer;
                  rörBubbla((m) => ({ ...m, ändringar: filer }));
                }
                break;
              case "mal_pausad":
                rörBubbla((m) => ({ ...m, strömmande: false, text: m.text || "(pausad)" }));
                malBubblaRef.current = null;
                setMalStatus((s) => (s ? { ...s, aktiv: false, pausad: true } : s));
                visaToast("Målet pausat — den autonoma loopen stannar.");
                break;
              case "fel":
                visaToast(event.meddelande || "Mål-strömmen felade.", "fel");
                break;
              default:
                break;
            }
          }
        }
      } catch {
        // AbortError vid nedstängning är tyst; nätverksfel återförs av
        // användarens näppa (Starta/Återuppta) — mal_status-tystnad visar.
      }
    })();

    return () => {
      abort.abort();
      if (malAbortRef.current === abort) malAbortRef.current = null;
    };
  }, [malStrömOppen, rörTabb, visaToast]);

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

  // ── Filträd + förhandsgranskning + töm uploads (våg 83 B4) ─────────────────
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

  const oppnaFiltrad = React.useCallback(() => {
    setInstallningarOppen(false);
    setVisaAdmin(false);
    setMenyOppen(false);
    setVisaFiler(true);
    void lasTrad();
  }, [lasTrad]);

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

  const vaxlaMapp = React.useCallback((sokvag: string) => {
    setOppnaMappar((gamla) => {
      const nya = new Set(gamla);
      if (nya.has(sokvag)) nya.delete(sokvag);
      else nya.add(sokvag);
      return nya;
    });
  }, []);

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

  // ── Agentens minne (våg 84 D): läs/redigera/radera ─────────────────────────
  const lasMinne = React.useCallback(async () => {
    setMinneLaddar(true);
    setMinneFel("");
    try {
      const res = await fetch(`/api/studio/minne?frisk=${Date.now()}`, { headers: adminHeaders() });
      const data = (await res.json().catch(() => ({}))) as {
        rot?: string;
        filer?: MinnePost[];
        agentsFinns?: boolean;
        fel?: string;
      };
      if (res.ok && Array.isArray(data.filer)) {
        setMinneFiler(data.filer);
        setMinneRotVisning(data.rot ?? "");
      } else {
        setMinneFel(data.fel || "Minnet kunde ej hämtas.");
      }
    } catch {
      setMinneFel("Nätverksfel — minnet kunde ej hämtas.");
    } finally {
      setMinneLaddar(false);
    }
  }, []);

  const oppnaMinne = React.useCallback(() => {
    setVisaFiler(false);
    setFilVisning(null);
    setVisaFardigheter(false);
    setInstallningarOppen(false);
    setVisaAdmin(false);
    setMenyOppen(false);
    setMinneVald(null);
    setMinneRedigerar(false);
    setMinneNy(false);
    setVisaMinne(true);
    void lasMinne();
  }, [lasMinne]);

  const oppnaMinnesfil = React.useCallback(async (namn: string) => {
    setMinneRedigerar(false);
    setMinneNy(false);
    setMinneVald(null);
    setMinneDetaljLaddar(true);
    try {
      const res = await fetch(`/api/studio/minne?namn=${encodeURIComponent(namn)}`, {
        headers: adminHeaders(),
      });
      const data = (await res.json().catch(() => ({}))) as MinnePost & { fel?: string };
      if (res.ok && data.namn) {
        setMinneVald(data);
        setMinneText(data.innehåll);
      } else {
        visaToast(data.fel || "Minnesfilen kunde ej läsas.", "fel");
      }
    } catch {
      visaToast("Nätverksfel — minnesfilen kunde ej hämtas.", "fel");
    } finally {
      setMinneDetaljLaddar(false);
    }
  }, [visaToast]);

  const sparaMinnesfil = React.useCallback(
    async (namn: string, innehåll: string) => {
      if (minneSparar || !namn) return false;
      setMinneSparar(true);
      try {
        const res = await fetch("/api/studio/minne", {
          method: "PUT",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ namn, innehåll }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          namn?: string;
          skapad?: boolean;
          backup?: string;
          fel?: string;
        };
        if (res.ok && data.namn) {
          visaToast(
            data.skapad
              ? `"${namn}" skapad i agentens minne.`
              : `"${namn}" sparad${data.backup ? ` — backup: ${data.backup}` : ""}.`,
          );
          setMinneRedigerar(false);
          setMinneNy(false);
          void lasMinne();
          setMinneVald((v) =>
            v && v.namn === namn
              ? { ...v, innehåll, trunkerad: false }
              : v,
          );
          return true;
        }
        visaToast(data.fel || "Minnesfilen kunde ej sparas.", "fel");
        return false;
      } catch {
        visaToast("Nätverksfel — minnesfilen kunde ej sparas.", "fel");
        return false;
      } finally {
        setMinneSparar(false);
      }
    },
    [minneSparar, visaToast, lasMinne],
  );

  const raderaMinnesfil = React.useCallback(
    async (namn: string) => {
      if (minneRaderar || !minneVald || namn !== minneVald.namn) return;
      if (namn === "MEMORY.md") {
        visaToast("MEMORY.md-indexet kan inte raderas — agenten bygger om det automatiskt.", "fel");
        return;
      }
      if (
        !window.confirm(
          `Radera "${namn}" ur agentens minne?\n\nEn backup-kopia sparas i .minnes-backup/ först — agenten glömmer fakten tills du återskapar den.`,
        )
      )
        return;
      setMinneRaderar(true);
      try {
        const res = await fetch("/api/studio/minne", {
          method: "DELETE",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ namn }),
        });
        const data = (await res.json().catch(() => ({}))) as { raderad?: boolean; backup?: string; fel?: string };
        if (res.ok && data.raderad) {
          setMinneVald(null);
          setMinneRedigerar(false);
          visaToast(`"${namn}" raderad — backup: ${data.backup ?? "?"} (.minnes-backup/).`);
          void lasMinne();
        } else {
          visaToast(data.fel || "Minnesfilen kunde ej raderas.", "fel");
        }
      } catch {
        visaToast("Nätverksfel — minnesfilen kunde ej raderas.", "fel");
      } finally {
        setMinneRaderar(false);
      }
    },
    [minneRaderar, minneVald, visaToast, lasMinne],
  );

  // ── Färdigheter (våg 85 F2) ────────────────────────────────────────────────
  const lasFardigheter = React.useCallback(async () => {
    setFardigheterLaddar(true);
    setFardigheterFel("");
    try {
      const res = await fetch(`/api/studio/fardigheter?frisk=${Date.now()}`, {
        headers: adminHeaders(),
      });
      const data = (await res.json().catch(() => ({}))) as {
        skills?: FardighetSkill[];
        plugins?: FardighetPlugin[];
        mcp?: FardighetMcp[];
        mcpVerktyg?: number;
        fel?: string;
      };
      if (res.ok) {
        setFardigheterSkills(Array.isArray(data.skills) ? data.skills : []);
        setFardigheterPlugins(Array.isArray(data.plugins) ? data.plugins : []);
        setFardigheterMcp(Array.isArray(data.mcp) ? data.mcp : []);
        setFardigheterVerktyg(typeof data.mcpVerktyg === "number" ? data.mcpVerktyg : 0);
      } else {
        setFardigheterFel(data.fel || "Färdigheterna kunde ej hämtas.");
      }
    } catch {
      setFardigheterFel("Nätverksfel — färdigheterna kunde ej hämtas.");
    } finally {
      setFardigheterLaddar(false);
    }
  }, []);

  /**
   * VÅG 93 C3: PLUGIN-BRYTARE — växla plugin på/av (POST /api/studio/
   * fardigheter {plugin, aktiverad}). OPTIMISTIC: flaggan vänds direkt i
   * listan; svarar servern fel (eller nätverket dör) ⇒ återställs raden +
   * röd toast. En växling i taget (pluginVaxlar-spärren). Saknar endpointen
   * plugins-fältet visas aldrig några rader — och därmed inga brytare.
   */
  const vaxlaPlugin = React.useCallback(
    async (pluginId: string, aktiverad: boolean) => {
      if (pluginVaxlar) return;
      const forut = fardigheterPlugins;
      if (!forut) return;
      const rad = forut.find((p) => p.id === pluginId);
      if (!rad || rad.aktiv === aktiverad) return;
      const namn = rad.namn || pluginId;
      setFardigheterPlugins(forut.map((p) => (p.id === pluginId ? { ...p, aktiv: aktiverad } : p)));
      setPluginVaxlar(pluginId);
      try {
        const res = await fetch("/api/studio/fardigheter", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ plugin: pluginId, aktiverad }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          satt?: boolean;
          fel?: string;
        };
        if (res.ok && data.ok !== false && data.satt !== false) {
          visaToast(`${namn}: ${aktiverad ? "aktiverat" : "avstängt"} — gäller agentens nästa körning`);
        } else {
          setFardigheterPlugins(forut);
          visaToast(data.fel || `Kunde ej ${aktiverad ? "aktivera" : "stänga av"} ${namn}.`, "fel");
        }
      } catch {
        setFardigheterPlugins(forut);
        visaToast(`Nätverksfel — ${namn} återställt (${aktiverad ? "av" : "på"}).`, "fel");
      } finally {
        setPluginVaxlar(null);
      }
    },
    [fardigheterPlugins, pluginVaxlar, visaToast],
  );

  const oppnaFardigheter = React.useCallback(() => {
    setVisaFiler(false);
    setFilVisning(null);
    setVisaMinne(false);
    setInstallningarOppen(false);
    setVisaAdmin(false);
    setMenyOppen(false);
    setVisaFardigheter(true);
    void lasFardigheter();
  }, [lasFardigheter]);

  const oppnaAdmin = React.useCallback(() => {
    setVisaFiler(false);
    setFilVisning(null);
    setVisaMinne(false);
    setVisaFardigheter(false);
    setVisaNotiser(false);
    setInstallningarOppen(false);
    setMenyOppen(false);
    setVisaAdmin(true);
  }, []);

  // ── Dialogsvar + läges-/tankestyrkeväxlare (våg 83 B2) ─────────────────────
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

  const byteLage = React.useCallback(
    async (nytt: string): Promise<boolean> => {
      if (!nytt || nytt === lage || lageJobbar || strömmar) return false;
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
          return true;
        } else {
          setLage(gammalt);
          visaToast(data.fel || "Läget kunde ej sättas.", "fel");
          return false;
        }
      } catch {
        setLage(gammalt);
        visaToast("Nätverksfel — läget kunde ej sättas.", "fel");
        return false;
      } finally {
        setLageJobbar(false);
      }
    },
    [lage, lageJobbar, strömmar, visaToast],
  );

  const byteTanke = React.useCallback(
    async (ny: string): Promise<boolean> => {
      if (!ny || ny === tanka || lageJobbar || strömmar) return false;
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
          return true;
        } else {
          setTanka(gammal);
          visaToast(data.fel || "Tankestyrkan kunde ej sättas.", "fel");
          return false;
        }
      } catch {
        setTanka(gammal);
        visaToast("Nätverksfel — tankestyrkan kunde ej sättas.", "fel");
        return false;
      } finally {
        setLageJobbar(false);
      }
    },
    [tanka, lageJobbar, strömmar, visaToast],
  );

  // ── VÅG 93 C3: drawerns val = SESSIONSSPAR (befintligt) + STANDARD-SPAR ────
  //    Endast när sessionssparat LYCKADES skickas det ändrade fältet vidare
  //    till server-standarden ("gäller nästa samtal"-ärligheten).
  const valjModellMedStandard = React.useCallback(
    async (modellId: string) => {
      if (await bytModell(modellId)) void sparaServerInstallning("modell", modellId);
    },
    [bytModell, sparaServerInstallning],
  );

  const valjLageMedStandard = React.useCallback(
    async (nytt: string) => {
      if (await byteLage(nytt)) void sparaServerInstallning("lage", nytt);
    },
    [byteLage, sparaServerInstallning],
  );

  const valjTankeMedStandard = React.useCallback(
    async (ny: string) => {
      if (await byteTanke(ny)) void sparaServerInstallning("tankestyrka", ny);
    },
    [byteTanke, sparaServerInstallning],
  );

  // ── Uppladdning (våg 81): multipart + drag/paste/mapp ──────────────────────

  /** VÅG 91 A3a: bildfiler ur ett uppladdningssvar → valda bilagor (tak 8). */
  const valjBilderUrUpload = React.useCallback((sokvagar: Uppladdning[]) => {
    const bilder = sokvagar.filter((u) => u.typ === "bild").map((u) => u.sokvag);
    if (bilder.length === 0) return;
    setValdaBilder((gamla) => [...gamla, ...bilder.filter((b) => !gamla.includes(b))].slice(0, 8));
  }, []);

  const laddaUpp = React.useCallback(
    async (filer: File[], relativa?: string[]) => {
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
          // VÅG 91 A3a: enstaka bildfiler (ej mapp-uppladdning) blir bilagor.
          if (!relativa) valjBilderUrUpload(data.sokvagar);
        } else {
          setStatusText(data.fel || "Uppladdningen misslyckades.");
        }
      } catch {
        setStatusText("Nätverksfel under uppladdningen.");
      } finally {
        setLaddarUpp(false);
      }
    },
    [valjBilderUrUpload],
  );

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
        // VÅG 91 A3a: inklistrade bilder blir bilagor — prompten slipper sökvägen.
        valjBilderUrUpload(res.sokvagar);
        ytaRef.current?.focus();
      } else {
        setStatusText(res.fel || "Uppladdningen misslyckades.");
      }
    },
    [valjBilderUrUpload],
  );

  // ── Skrivfältets minne (våg 86 G1/G2) ──────────────────────────────────────
  const sparaPrompt = React.useCallback((text: string): boolean => {
    const t = text.trim();
    if (!t) return false;
    setPrompter((lista) => [{ text: t, skapad: Date.now() }, ...lista.filter((p) => p.text !== t)].slice(0, MAX_PROMPTER));
    return true;
  }, []);

  const tabortPrompt = React.useCallback((skapad: number) => {
    setPrompter((lista) => lista.filter((p) => p.skapad !== skapad));
  }, []);

  const oppnaPrompter = React.useCallback(() => {
    setSlashStangd(true);
    setPrompterOppen(true);
  }, []);

  const pushaHistorik = React.useCallback((text: string) => {
    const t = text.trim();
    if (!t) return;
    historikIndexRef.current = null;
    historikUtkastRef.current = "";
    setPromptHistorik((lista) => (lista[0] === t ? lista : [t, ...lista.filter((h) => h !== t)].slice(0, MAX_PROMPT_HISTORIK)));
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(PROMPT_LAGRING, JSON.stringify(prompter));
    } catch {
      // privat läge/quota
    }
  }, [prompter]);

  React.useEffect(() => {
    try {
      localStorage.setItem(PROMPT_HISTORIK_LAGRING, JSON.stringify(promptHistorik));
    } catch {
      // privat läge/quota
    }
  }, [promptHistorik]);

  // ── VÅG 91 A3b: STYRELSEN 🏛 — konkalla, polla mötet, visa beslutskort ──────

  /** Starta mötet: POST /api/studio/styrelse {fraga} → {id} → mötesvy. */
  const startaStyrelse = React.useCallback(
    async (fragatext?: string) => {
      const fraga = (fragatext ?? styrelseFraga).trim();
      if (!fraga || styrelseStartar) return;
      setStyrelseStartar(true);
      setStyrelseSaknas(false);
      try {
        const res = await fetch("/api/studio/styrelse", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ fraga }),
        });
        const data = (await res.json().catch(() => ({}))) as { id?: string; fel?: string };
        if (res.ok && data.id) {
          styrelseRef.current = { id: data.id, antal: 0, beslut: false };
          setStyrelseMote({ id: data.id, fraga, händelser: [], beslut: null });
          visaToast("🏛 Styrelsen är samlad — fem roller diskuterar nu.");
        } else if (res.status === 501 || res.status === 404) {
          // A2:s motor är ej igång ännu — diskret info-rad, ingen mötesvy.
          setStyrelseSaknas(true);
        } else {
          visaToast(data.fel || `Styrelsen kunde ej konkallas (${res.status}).`, "fel");
        }
      } catch {
        visaToast("Nätverksfel — styrelsen kunde ej konkallas.", "fel");
      } finally {
        setStyrelseStartar(false);
      }
    },
    [styrelseFraga, styrelseStartar, visaToast],
  );

  /** Öppna styrelse-dialogen — med fråga: konkallas mötet direkt (knapp + /styrelsen). */
  const oppnaStyrelseDialog = React.useCallback(
    (fraga?: string) => {
      const text = fraga?.trim();
      if (text) setStyrelseFraga(text);
      setStyrelseOppen(true);
      if (text) void startaStyrelse(text);
    },
    [startaStyrelse],
  );

  const stangStyrelse = React.useCallback(() => {
    setStyrelseOppen(false);
  }, []);

  /** Tillbaka till fråge-fältet (mötet glöms — nytt id vid nästa konkall). */
  const nyStyrelseFraga = React.useCallback(() => {
    styrelseRef.current = { id: "", antal: 0, beslut: false };
    setStyrelseMote(null);
    setStyrelseFraga("");
  }, []);

  /** Polla mötet: GET /api/studio/styrelse?id=&senast= → händelser + beslut. */
  const lasStyrelseStatus = React.useCallback(
    async (id: string) => {
      try {
        const res = await fetch(
          `/api/studio/styrelse?id=${encodeURIComponent(id)}&senast=${styrelseRef.current.antal}`,
          { headers: adminHeaders() },
        );
        if (!res.ok) return;
        const data: unknown = await res.json().catch(() => null);
        if (!data || typeof data !== "object") return;
        const pekare = styrelseRef.current;
        if (pekare.id !== id) return;
        const tolkat = tolkaStyrelseSvar(data);
        setStyrelseMote((m) => {
          if (!m || m.id !== id) return m;
          return {
            ...m,
            händelser: slagIhopHandelser(m.händelser, tolkat.händelser),
            beslut: tolkat.beslut ?? m.beslut,
          };
        });
        pekare.antal += tolkat.händelser.length;
        if (tolkat.beslut && !pekare.beslut) {
          pekare.beslut = true;
          visaToast("🏛 Styrelsen har beslutat — beslutskortet är klart.");
        }
      } catch {
        // tyst — nästa poll (3 s) försöker igen
      }
    },
    [visaToast],
  );

  /** Mötes-poll: var 3:e s tills beslutet landat (mötet lever även om dialogen stängs). */
  React.useEffect(() => {
    if (!styrelseMote || styrelseMote.beslut) return;
    const id = styrelseMote.id;
    const tid = window.setInterval(() => void lasStyrelseStatus(id), 3_000);
    return () => window.clearInterval(tid);
  }, [styrelseMote, lasStyrelseStatus]);

  // ── VÅG 91 A3c: TJÄNSTE-PANELER — bakgrundsjobb/webbläsare/automation ───────

  /**
   * Läs en tjänste-endpoint — 501/404/nätverksfel ⇒ sektionen döljs
   * (graceful). Returnerar om endpointen finns (VÅG 92 B3: /automation
   * sonderar färskt innan panelen öppnas).
   */
  const lasTjanst = React.useCallback(async (namn: TjansteNamn): Promise<boolean> => {
    setTjanster((t) => ({ ...t, [namn]: { ...t[namn], laddar: true } }));
    try {
      const res = await fetch(`/api/studio/tjanster/${namn}`, { headers: adminHeaders() });
      if (res.ok) {
        const data: unknown = await res.json().catch(() => ({}));
        setTjanster((t) => ({ ...t, [namn]: { finns: true, laddar: false, rader: tjansteRaderUr(data) } }));
        return true;
      }
      setTjanster((t) => ({ ...t, [namn]: { ...t[namn], finns: false, laddar: false, rader: [] } }));
      return false;
    } catch {
      setTjanster((t) => ({ ...t, [namn]: { ...t[namn], finns: false, laddar: false, rader: [] } }));
      return false;
    }
  }, []);

  /** Fäll upp/ihop en sektion — uppfällning läser direkta färskt. */
  const vaxlaTjanste = React.useCallback(
    (namn: TjansteNamn, oppenEfter: boolean) => {
      setTjanster((t) => ({ ...t, [namn]: { ...t[namn], oppen: oppenEfter } }));
      if (oppenEfter) void lasTjanst(namn);
    },
    [lasTjanst],
  );

  /** Avbryt ett bakgrundsjobb: POST /api/studio/tjanster/bakgrund/avbryt {id}. */
  const avbrytBakgrundsjobb = React.useCallback(
    async (id: string) => {
      setAvbryterJobb(id);
      try {
        const res = await fetch("/api/studio/tjanster/bakgrund/avbryt", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ id }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          avbruten?: boolean;
          meddelande?: string;
          fel?: string;
        };
        if (res.ok && (data.ok === true || data.avbruten === true)) {
          visaToast(data.meddelande || "Bakgrundsjobbet avbrutet.");
        } else {
          visaToast(data.meddelande || data.fel || "Jobbet kunde ej avbrytas.", "fel");
        }
      } catch {
        visaToast("Nätverksfel — jobbet kunde ej avbrytas.", "fel");
      } finally {
        setAvbryterJobb(null);
        void lasTjanst("bakgrund");
      }
    },
    [visaToast, lasTjanst],
  );

  // ── VÅG 92 B3: WEBBLÄSAR-PANEL — POST {url} → resultatkort + sidlista ──────

  /**
   * Öppna en URL i agentens webbläsare: POST /api/studio/tjanster/webblasare
   * {url} → tolererant tolkat resultatkort (titel/url/utdrag ≤ 300 tkn) +
   * sidan läggs i "öppna sidor"-listan. 501 ⇒ sektionen döljs (graceful).
   */
  const oppnaWebbsida = React.useCallback(
    async (urlFalt?: string) => {
      const begard = normaliseraUrl(urlFalt ?? webUrl);
      if (!begard || webKorPaga) return;
      setWebUrl(begard);
      setWebKorPaga(true);
      setWebMeddelande("");
      try {
        const res = await fetch("/api/studio/tjanster/webblasare", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ url: begard }),
        });
        if (res.status === 501 || res.status === 404) {
          // Tjänsten saknas i agent-versionen — dölj sektionen helt.
          setTjanster((t) => ({ ...t, webblasare: { ...t.webblasare, finns: false, oppen: false } }));
          setWebMeddelande("Webbläsartjänsten stöds ej av denna agent-version.");
          return;
        }
        const data = (await res.json().catch(() => ({}))) as { fel?: string };
        if (!res.ok) {
          setWebMeddelande(data.fel || `Sidan kunde ej öppnas (${res.status}).`);
          return;
        }
        const resultat = webblasareResultatUr(data, begard);
        if (!resultat) {
          setWebMeddelande(data.fel || "Tomt svar från webbläsartjänsten.");
          return;
        }
        setWebResultat(resultat);
        setWebSidor((sidor) => [
          resultat,
          ...sidor.filter((s) => s.url !== resultat.url),
        ].slice(0, 8));
      } catch {
        setWebMeddelande("Nätverksfel — sidan kunde ej öppnas.");
      } finally {
        setWebKorPaga(false);
      }
    },
    [webUrl, webKorPaga],
  );

  // ── VÅG 92 B3: AUTOMATION-HANTERAREN — skapa/pausa/radera ──────────────────

  /** Skapa automation: POST /api/studio/tjanster/automation {namn,schema,prompt}. */
  const skapaAutomation = React.useCallback(async () => {
    const namn = autoNamn.trim();
    const schema = autoSchema.trim();
    const prompt = autoPrompt.trim();
    if (!namn || !schema || !prompt || autoSkapar) return;
    setAutoSkapar(true);
    try {
      const res = await fetch("/api/studio/tjanster/automation", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ namn, schema, prompt }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; fel?: string; meddelande?: string };
      if (res.ok && (data.ok === undefined || data.ok === true)) {
        visaToast(data.meddelande || `Automationen "${namn}" skapad.`);
        setAutoNamn("");
        setAutoSchema("");
        setAutoPrompt("");
        setAutoFormOppen(false);
      } else if (res.status === 501) {
        visaToast("Automation-skapande stöds ej av denna agent-version (501).", "fel");
      } else {
        visaToast(data.fel || data.meddelande || `Automationen kunde ej skapas (${res.status}).`, "fel");
      }
    } catch {
      visaToast("Nätverksfel — automationen kunde ej skapas.", "fel");
    } finally {
      setAutoSkapar(false);
      void lasTjanst("automation");
    }
  }, [autoNamn, autoSchema, autoPrompt, autoSkapar, visaToast, lasTjanst]);

  /** Pausa (aktiveradEfter=false) / Återuppta (true): POST …/automation/pausa. */
  const vaxlaAutomationPaus = React.useCallback(
    async (id: string, aktiveradEfter: boolean) => {
      setAutoJobbarId(id);
      try {
        const res = await fetch("/api/studio/tjanster/automation/pausa", {
          method: "POST",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ id, aktiverad: aktiveradEfter }),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; fel?: string; meddelande?: string };
        if (res.ok && (data.ok === undefined || data.ok === true)) {
          visaToast(data.meddelande || (aktiveradEfter ? "Automationen återupptagen." : "Automationen pausad."));
        } else if (res.status === 501) {
          visaToast("Pausa/återuppta stöds ej av denna agent-version (501).", "fel");
        } else {
          visaToast(data.fel || data.meddelande || "Automationen kunde ej ändras.", "fel");
        }
      } catch {
        visaToast("Nätverksfel — automationen kunde ej ändras.", "fel");
      } finally {
        setAutoJobbarId(null);
        void lasTjanst("automation");
      }
    },
    [visaToast, lasTjanst],
  );

  /** Radera automation (confirm krävs): DELETE …/automation?id= (+ id i kroppen). */
  const raderaAutomation = React.useCallback(
    async (id: string, namn: string) => {
      if (!window.confirm(`Radera automationen "${namn}"? Detta kan ej ångras.`)) return;
      setAutoJobbarId(id);
      try {
        const res = await fetch(`/api/studio/tjanster/automation?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: adminJsonHeaders(),
          body: JSON.stringify({ id }),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; fel?: string; meddelande?: string };
        if (res.ok && (data.ok === undefined || data.ok === true)) {
          visaToast(data.meddelande || `Automationen "${namn}" raderad.`);
        } else if (res.status === 501) {
          visaToast("Radering stöds ej av denna agent-version (501).", "fel");
        } else {
          visaToast(data.fel || data.meddelande || "Automationen kunde ej raderas.", "fel");
        }
      } catch {
        visaToast("Nätverksfel — automationen kunde ej raderas.", "fel");
      } finally {
        setAutoJobbarId(null);
        void lasTjanst("automation");
      }
    },
    [visaToast, lasTjanst],
  );

  /**
   * Öppna automation-hanteraren i höger panelen (/automation-kommandot):
   * sonderar endpointen färskt — finns den fälls sektionen ut, annars
   * info-toast (graceful mot B1/B2:s parallella byggen).
   */
  const oppnaAutomationPanel = React.useCallback(async (): Promise<boolean> => {
    setPanelOppen(true);
    setMobilPanel(true);
    const finns = tjansterRef.current.automation.finns || (await lasTjanst("automation"));
    if (finns) {
      vaxlaTjanste("automation", true);
      return true;
    }
    visaToast("Automation-tjänsten saknas på servern (501) — hanteraren är dold tills den finns.", "fel");
    return false;
  }, [lasTjanst, vaxlaTjanste, visaToast]);

  // Sond en gång vid mount — endpoint som svarar får sin sektion (annars dold).
  React.useEffect(() => {
    for (const n of TJANSTE_NAMN) void lasTjanst(n);
  }, [lasTjanst]);

  React.useEffect(() => {
    tjansterRef.current = tjanster;
  }, [tjanster]);

  /** Poll 30 s — ENDAST öppna, existerande sektioner och bara när fliken syns. */
  React.useEffect(() => {
    const tid = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const t = tjansterRef.current;
      for (const n of TJANSTE_NAMN) {
        if (t[n].oppen && t[n].finns) void lasTjanst(n);
      }
    }, 30_000);
    return () => window.clearInterval(tid);
  }, [lasTjanst]);

  // ── VÅG 91 A3d: AUTONOMI-SIGNAL — mål-motorn lever trots att fliken vilat ──

  /** Läs GET /api/studio/mal/status {aktiv} — otillgänglig endpoint = tyst. */
  const lasAutonomiStatus = React.useCallback(async () => {
    try {
      const res = await fetch("/api/studio/mal/status", { headers: adminHeaders() });
      if (!res.ok) return; // 404/501/etc ⇒ ingen badge, ingen toast (graceful)
      const data = (await res.json().catch(() => ({}))) as { aktiv?: boolean };
      const aktiv = data.aktiv === true;
      const forut = autonomiForutRef.current;
      autonomiForutRef.current = aktiv;
      setAutonomiAktiv(aktiv);
      if (forut === true && !aktiv) {
        visaToast("Agenten avslutade jobbet medan du var borta.");
      }
    } catch {
      // tyst
    }
  }, [visaToast]);

  /** Poll 20 s när fliken syns + en gång vid mount. */
  React.useEffect(() => {
    void lasAutonomiStatus();
    const tid = window.setInterval(() => {
      if (document.visibilityState === "visible") void lasAutonomiStatus();
    }, 20_000);
    return () => window.clearInterval(tid);
  }, [lasAutonomiStatus]);

  /** Kör ett snabbkommando (våg 84 A2) — delad väg för "/"-rader + paletten. */
  const korKommando = React.useCallback(
    async (kommando: string, argument = "") => {
      const tabbId = aktivTabbIdRef.current;
      const pushAssistant = (t: string) =>
        rörTabb(tabbId, (tb) => ({
          ...tb,
          uppdaterad: Date.now(),
          meddelanden: [...tb.meddelanden, { id: nyttId(), roll: "assistant" as const, text: t }],
        }));
      rörTabb(tabbId, (tb) => ({
        ...tb,
        uppdaterad: Date.now(),
        meddelanden: [
          ...tb.meddelanden,
          { id: nyttId(), roll: "user" as const, text: `/${kommando}${argument ? ` ${argument}` : ""}` },
        ],
      }));
      switch (kommando) {
        case "help":
          pushAssistant(kommandoHjalp());
          return;
        case "ny":
          await startaNySession();
          pushAssistant("Ny session — kontexten börjar om (gamla sessioner finns kvar i listan).");
          return;
        case "komprimera":
          await komprimera();
          pushAssistant("Komprimering körd — se panelens KONTEXT-sektion för färsk tokenräkning.");
          return;
        case "installningar": {
          // VÅG 93 C3: öppna Inställningar-drawern ⚙ — modell/tankestyrka/läge
          // för sessionen + serverns standard för nya samtal ( där stöds).
          oppnaInstallningar();
          pushAssistant(
            "Inställningar ⚙ är öppna — modell, tankestyrka och läge. Valen gäller DETTA samtalet direkt; där servern stödjer det sparas de också som standard för nya samtal (”gäller nästa samtal”).",
          );
          return;
        }
        case "filer":
          oppnaFiltrad();
          pushAssistant("Filträdet är öppet — klicka dig ner i arbetsytan och förhandsgranska filer.");
          return;
        case "fardigheter":
          oppnaFardigheter();
          pushAssistant(
            "Färdigheter ⚡ är öppna — agentens skills, aktiva plugins och anslutna MCP-verktyg.",
          );
          return;
        case "styrelsen": {
          oppnaStyrelseDialog(argument);
          pushAssistant(
            argument
              ? "🏛 Styrelsen konkallas — fem roller (Ordföranden, Teknik, Säkerhet, Juridik, Tillväxt) diskuterar ärendet och beslutar. Mötesvyn öppnas."
              : "🏛 Styrelse-dialogen är öppen — skriv ärendet och konkalla de fem rollerna (de tänds allt eftersom de rapporterar).",
          );
          return;
        }
        case "automation": {
          // VÅG 92 B3: öppna automation-hanteraren i höger panelen —
          // endpointen sonderas färskt; saknas den (501) kommer info-toast.
          void oppnaAutomationPanel();
          pushAssistant(
            "⚡ Automation-hanteraren öppnas i panelen — lista över schemalagda jobb, \u201dNy automation\u201d (namn, schema/cron, prompt) samt pausa/återuppta och radera per rad. Saknas tjänsten på servern visas en notis.",
          );
          return;
        }
        case "sparad": {
          const sparade = argument ? sparaPrompt(argument) : false;
          oppnaPrompter();
          pushAssistant(
            sparade
              ? "Prompten sparad i biblioteket ⭐ — klicka en rad för att infoga den i skrivfältet."
              : "Promptbiblioteket ⭐ är öppet — klicka en sparad prompt för att infoga den, papperskorgen tar bort. Spara nya med /sparad + din text.",
          );
          return;
        }
        case "modell": {
          const id = argument.split(/\s+/)[0] ?? "";
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
          pushAssistant(`Okänt kommando \`${kommando}\` — skriv **/help** för alla kommandon.`);
          return;
      }
    },
    [modeller, valdModell, startaNySession, komprimera, bytModell, oppnaFiltrad, oppnaFardigheter, oppnaStyrelseDialog, oppnaAutomationPanel, oppnaInstallningar, sparaPrompt, oppnaPrompter, rörTabb],
  );

  // ── Skicka (SSE över fetch) — PER TABB (våg 84 B) ──────────────────────────
  const skickaPrompt = React.useCallback(
    async (tabbId: string, text: string, bilder?: string[]) => {
      const tabb = tabbarRef.current.tabbar.find((t) => t.id === tabbId);
      if (!tabb || tabb.strömmar) return;
      const kropp: { prompt: string; sessionId?: string; nyckel?: string; bilder?: string[] } = { prompt: text };
      if (!tabb.huvud) {
        if (tabb.sessionId) kropp.sessionId = tabb.sessionId;
        else kropp.nyckel = tabb.id;
      }
      // VÅG 91 A3a: bildbilagor följer med prompten (kontrakt A1d — bilder?: string[]).
      if (bilder && bilder.length > 0) kropp.bilder = bilder;
      if (tabb.sessionId) sparaSenasteSessionId(tabb.sessionId);
      let streamSessionId: string | null = tabb.sessionId;

      const agentId = nyttId();
      // VÅG 92 B3: användarmeddelandet får id + bilage-status ("laddar"
      // tills POST /api/studio/stream svarat — därefter "Bilaga ✓").
      const userMsgId = nyttId();
      rörTabb(tabbId, (t) => ({
        ...t,
        tankar: "",
        status: "Skickar…",
        strömmar: true,
        uppdaterad: Date.now(),
        titel: t.huvud ? t.titel : kortNamn(text),
        meddelanden: [
          ...t.meddelanden,
          {
            id: userMsgId,
            roll: "user" as const,
            text,
            ...(bilder && bilder.length > 0 ? { bilder } : {}),
            ...(bilder && bilder.length > 0 ? { bilagaStatus: "laddar" as const } : {}),
          },
          { id: agentId, roll: "assistant" as const, text: "", strömmande: true, verktygKort: [] },
        ],
      }));

      const abort = new AbortController();
      tabbAbortRef.current.set(tabbId, abort);

      const rörAgent = (rör: (m: Meddelande) => Meddelande) => {
        rörTabb(tabbId, (t) => ({
          ...t,
          meddelanden: t.meddelanden.map((m) => (m.id === agentId ? rör(m) : m)),
        }));
      };
      const sattStatus = (status: string) => {
        rörTabb(tabbId, (t) => ({ ...t, status }));
      };
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
          body: JSON.stringify(kropp),
          signal: abort.signal,
        });
        // VÅG 92 B3: POST har svarat — bilage-progressen blir "Bilaga ✓"
        // (enkel variant: skick-väntan = progress; även fel ger klart-läge,
        // felet visas redan i flödet + toast nedan).
        if (bilder && bilder.length > 0) {
          rörTabb(tabbId, (t) => ({
            ...t,
            meddelanden: t.meddelanden.map((m) =>
              m.id === userMsgId && m.bilagaStatus === "laddar" ? { ...m, bilagaStatus: "klar" as const } : m,
            ),
          }));
        }
        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => ({}))) as { fel?: string };
          // VÅG 91 A3a: följde bilderna inte med (transporten stödjer ej bilden
          // ännu) — säg det tydligt via toast; prompten redan visad med fel i flödet.
          if (bilder && bilder.length > 0) {
            visaToast(`Bilden följde inte med: ${data.fel || `bryggan svarade ${res.status}.`}`, "fel");
          }
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
          if (!dataRad) continue;
          let event: StreamEvent;
          try {
            event = JSON.parse(dataRad.slice(6)) as StreamEvent;
          } catch {
            continue;
          }
          switch (event.typ) {
            case "hej":
              setLive(event.transport === "mock" ? "demo" : "live");
              if (event.sessionId) {
                // VÅG 140 — TRÅDKEDJAN: byte av session (friskgång/omstart/
                // -32031-läkning) får ALDRIG bryta tråden i vyn. Fliken
                // behåller sin historia (strömmen fortsätter rakt in) och
                // minner föregångaren i kedjan — refresh syr sedan ihop allt.
                const gammal = tabb.sessionId;
                if (gammal && gammal !== event.sessionId) {
                  rörTabb(tabbId, (t) => {
                    const bas = t.kedja ?? [];
                    return {
                      ...t,
                      sessionId: event.sessionId ?? t.sessionId,
                      kedja: [...bas, gammal].filter(
                        (sid, i, alla) => alla.indexOf(sid) === i && sid !== (event.sessionId ?? sid),
                      ),
                    };
                  });
                } else if (!gammal) {
                  rörTabb(tabbId, (t) => ({ ...t, sessionId: event.sessionId ?? t.sessionId }));
                }
                sparaSenasteSessionId(event.sessionId);
                streamSessionId = event.sessionId;
              }
              break;
            case "status":
              sattStatus(event.text || "Agenten arbetar…");
              break;
            case "delta":
              if (event.kanal === "tankar") {
                // VÅG 97 E2: resonemanget samlas PER MEDDELANDE (agent-
                // bubblan) — ALDRIG i m.text; tab-fältet är status-spegel.
                rörTabb(tabbId, (t) => ({ ...t, tankar: (t.tankar + (event.text ?? "")).slice(-260) }));
                rörAgent((m) => ({ ...m, tankar: ((m.tankar ?? "") + (event.text ?? "")).slice(-TANKAR_TAK) }));
              } else {
                rörAgent((m) => ({ ...m, text: m.text + (event.text ?? "") }));
                sattStatus("Svarar…");
              }
              break;
            case "verktyg":
              sattStatus(`${event.händelse === "start" ? "Kör" : "Klart"}: ${event.namn ?? "verktyg"}`);
              break;
            case "verktyg_kort":
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
                sattStatus(
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
              if (event.id) {
                uppdateraKort(event.id, (k) => ({
                  ...k,
                  liveInput: (k.liveInput ?? "") + (event.text ?? ""),
                }));
                sattStatus(
                  `Skriver verktygsargument: ${event.namn ?? (event.text ?? "").slice(0, 24)}`,
                );
              }
              break;
            case "runda":
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
                sattStatus("Agenten arbetar…");
              }
              break;
            case "interaktion":
              if (tabbId !== aktivTabbIdRef.current) {
                visaToast("Ett samtal i bakgrunden väntar på ditt svar…");
              }
              if (event.interaktion?.typ === "permission") {
                mottagenPermission({
                  requestId: event.interaktion.requestId,
                  verktyg: event.interaktion.verktyg,
                  risk: event.interaktion.risk,
                  skäl: event.interaktion.skäl,
                  sammanfattning: event.interaktion.sammanfattning,
                  alternativ: event.interaktion.alternativ ?? [],
                  diff: event.interaktion.diff,
                });
                sattStatus("Väntar på ditt godkännande…");
              } else if (event.interaktion?.typ === "fråga") {
                setFraga({
                  requestId: event.interaktion.requestId,
                  fråga: event.interaktion.fråga,
                  inputTyp: event.interaktion.inputTyp,
                  val: event.interaktion.val,
                });
                setFragSvar("");
                sattStatus("Agenten frågar…");
              }
              break;
            case "interaktionsKlar":
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
                turnTknRef.current = event.tokenCount;
                rörTabb(tabbId, (t) => ({
                  ...t,
                  uppdaterad: Date.now(),
                  rundaTkn: event.tokenCount ?? null,
                  ackumulerat:
                    typeof event.tokenCount === "number"
                      ? (t.ackumulerat > 0 ? t.ackumulerat + event.tokenCount : event.tokenCount)
                      : t.ackumulerat,
                }));
              }
              if (streamSessionId) {
                void sparaHistorikCache(streamSessionId, [
                  // VÅG 97 E2: tankar följer med i cachen (återkopplings-vägen).
                  ...tabb.meddelanden.map((m) => ({
                    roll: m.roll,
                    text: m.text,
                    ...(m.tankar ? { tankar: m.tankar } : {}),
                  })),
                  { roll: "user" as const, text },
                  {
                    roll: "assistant" as const,
                    text: event.svar && event.svar.trim() ? event.svar : "(tomt svar)",
                  },
                ]);
              }
              färdig = true;
              break;
            case "kontext":
              if (event.kontext) {
                rörTabb(tabbId, (t) => ({
                  ...t,
                  kontext: event.kontext ?? null,
                  ackumulerat:
                    typeof event.kontext?.totalTokenCount === "number"
                      ? event.kontext.totalTokenCount
                      : t.ackumulerat,
                }));
              }
              break;
            case "fel":
              rörAgent((m) => ({
                ...m,
                strömmande: false,
                fel: true,
                text: m.text || event.meddelande || "Okänt fel.",
              }));
              loggaNotis(`Fel: ${event.meddelande || "okänt fel"}`.slice(0, 120), "fel");
              färdig = true;
              break;
            case "ändringar":
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
        // VÅG 92 B3: POST bröt fel/abort — bilage-progressen blir klar även
        // här (felet visas i flödet); spinner fastnar aldrig.
        if (bilder && bilder.length > 0) {
          rörTabb(tabbId, (t) => ({
            ...t,
            meddelanden: t.meddelanden.map((m) =>
              m.id === userMsgId && m.bilagaStatus === "laddar" ? { ...m, bilagaStatus: "klar" as const } : m,
            ),
          }));
        }
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
        rörTabb(tabbId, (t) => ({ ...t, strömmar: false, tankar: "", status: "", uppdaterad: Date.now() }));
        tabbAbortRef.current.delete(tabbId);
        setStatusText((nuvarande) =>
          nuvarande.startsWith("Sessionen") || nuvarande.startsWith("Demo")
            ? nuvarande
            : live === "demo"
              ? "Demo-läge (mock-transport)"
              : "Sessionen lever",
        );
      }
    },
    [live, visaToast, mottagenPermission, rörTabb, loggaNotis],
  );

  /** Skicka från skrivfältet — kommandon först, sedan prompten i AKTIVA tabben. */
  const skicka = React.useCallback(async () => {
    const text = prompt.trim();
    if (!text || strömmar) return;
    setPrompterOppen(false);
    setUploadMenyOppen(false);

    const kommando = parsaKommando(text);
    if (kommando) {
      setPrompt("");
      if (!kommando.kommando) return;
      pushaHistorik(text);
      await korKommando(kommando.kommando, kommando.argument);
      return;
    }

    if (malKör && !window.confirm("Mål-loopen kör — skicka prompten ändå? Agenten kan vara mitt i en iteration (vänta i så fall).")) {
      return;
    }

    setPrompt("");
    pushaHistorik(text);
    // VÅG 91 A3a: bildbilagorna följer med prompten och rensas ur fältet.
    const bilder = valdaBilder;
    if (bilder.length > 0) setValdaBilder([]);
    await skickaPrompt(aktivTabbIdRef.current, text, bilder);
  }, [prompt, strömmar, korKommando, skickaPrompt, malKör, pushaHistorik, valdaBilder]);

  /** Stoppa DEN AKTIVA TABBENS ström (session/stop via serverns abort-signal). */
  const stoppa = React.useCallback(() => {
    tabbAbortRef.current.get(aktivTabbIdRef.current)?.abort();
  }, []);

  // ── EXPORT: markdown (våg 84 A5) + HTML (våg 86 G7) ────────────────────────
  const exporteraChat = React.useCallback(() => {
    if (meddelanden.length === 0) {
      visaToast("Chatten är tom — inget att exportera än.", "fel");
      return;
    }
    const nu = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const datum = `${nu.getFullYear()}-${pad(nu.getMonth() + 1)}-${pad(nu.getDate())}`;
    const tid = `${pad(nu.getHours())}${pad(nu.getMinutes())}`;
    const rader: string[] = [
      `# AK1A Studio — chatt ${datum}`,
      "",
      `- **Exporterad:** ${nu.toLocaleString("sv-SE")}`,
      kontext?.modell ? `- **Modell:** ${kontext.modell}` : "",
      `- **Meddelanden:** ${meddelanden.length}`,
      "",
      "---",
      "",
    ].filter((r) => r !== "");
    for (const m of meddelanden) {
      if (m.roll === "user") {
        rader.push(m.text.split("\n").map((rad) => `> ${rad}`).join("\n") || ">");
      } else {
        rader.push(m.text || "_(tomt svar)_");
      }
      rader.push("");
    }
    const blob = new Blob([rader.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studio-chatt-${datum}-${tid}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
    visaToast("Chatten exporterad som markdown.");
  }, [meddelanden, kontext, visaToast]);

  const exporteraChatHtml = React.useCallback(() => {
    if (meddelanden.length === 0) {
      visaToast("Chatten är tom — inget att exportera än.", "fel");
      return;
    }
    const nu = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const datum = `${nu.getFullYear()}-${pad(nu.getMonth() + 1)}-${pad(nu.getDate())}`;
    const tid = `${pad(nu.getHours())}${pad(nu.getMinutes())}`;
    const blob = new Blob([byggChatHtml(meddelanden, kontext?.modell)], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studio-chatt-${datum}-${tid}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
    visaToast("Chatten exporterad som HTML — öppna filen och skriv ut direkt.");
  }, [meddelanden, kontext, visaToast]);

  // ── MEDDELANDESÖKNING (våg 84 A4) ──────────────────────────────────────────
  const sokTräffar = React.useMemo<SokTräff[]>(() => {
    const fras = sokFras.trim();
    if (!fras || !sokOppen) return [];
    const ut: SokTräff[] = [];
    for (const m of meddelanden) {
      for (let f = 0; f < raknaForekomster(m.text, fras); f++) {
        ut.push({ meddelandeId: m.id, forekomst: f });
      }
    }
    return ut;
  }, [meddelanden, sokFras, sokOppen]);

  React.useEffect(() => {
    setSokIndex((i) => Math.min(Math.max(0, i), Math.max(0, sokTräffar.length - 1)));
  }, [sokTräffar.length]);

  const aktivTräff = sokTräffar.length > 0 ? sokTräffar[Math.min(sokIndex, sokTräffar.length - 1)] : null;
  React.useEffect(() => {
    if (!aktivTräff) return;
    const el = meddelandeRefs.current.get(aktivTräff.meddelandeId);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [aktivTräff]);

  const hoppaSok = React.useCallback(
    (steg: 1 | -1) => {
      if (sokTräffar.length === 0) return;
      setSokIndex((i) => (i + steg + sokTräffar.length) % sokTräffar.length);
    },
    [sokTräffar.length],
  );

  // ── KOMMANDOPALETTEN (våg 84 A2) — poster ur registret + modellbyten ───────
  const palettPoster = React.useMemo<PalettPost[]>(() => {
    const poster: PalettPost[] = STUDIO_KOMMANDON.map((k) => ({
      id: `cmd-${k.namn}`,
      etikett: k.syntax,
      beskrivning: k.beskrivning,
      grupp: "Kommandon" as const,
      ikon: "kommando" as const,
      sokbar: `${k.syntax} ${k.namn} ${k.beskrivning}`.toLowerCase(),
      kor: () => void korKommando(k.namn),
    }));
    for (const m of modeller) {
      poster.push({
        id: `modell-${m.id}`,
        etikett: `Byt modell — ${m.namn}`,
        beskrivning: `/modell ${m.id} — ny session skapas med modellen`,
        grupp: "Modeller",
        ikon: "modell",
        sokbar: `byt modell ${m.id} ${m.namn} /modell`.toLowerCase(),
        kor: () => void bytModell(m.id),
      });
    }
    const f = palettFras.trim().toLowerCase();
    if (!f) return poster;
    return poster.filter((p) => p.sokbar.includes(f));
  }, [modeller, palettFras, korKommando, bytModell]);

  React.useEffect(() => {
    setPalettIndex(0);
  }, [palettFras, palettOppen]);

  React.useEffect(() => {
    const p = palettPoster[palettIndex];
    if (!p || !palettOppen) return;
    palettRadRefs.current.get(p.id)?.scrollIntoView({ block: "nearest" });
  }, [palettIndex, palettPoster, palettOppen]);

  // ── SLASH-AUTOCOMPLETE (våg 86 G1) ─────────────────────────────────────────
  const slashFras = React.useMemo(() => {
    if (!prompt.startsWith("/")) return null;
    const rest = prompt.slice(1);
    if (rest.includes(" ")) return null;
    return rest.toLowerCase();
  }, [prompt]);

  const slashPoster = React.useMemo(
    () => (slashFras === null ? [] : STUDIO_KOMMANDON.filter((k) => k.namn.startsWith(slashFras))),
    [slashFras],
  );

  const slashSynlig = slashFras !== null && !slashStangd && !prompterOppen && slashPoster.length > 0;

  React.useEffect(() => {
    setSlashIndex(0);
    setSlashStangd(false);
  }, [slashFras]);

  React.useEffect(() => {
    if (!slashSynlig) return;
    const k = slashPoster[slashIndex];
    if (k) slashRadRefs.current.get(k.namn)?.scrollIntoView({ block: "nearest" });
  }, [slashIndex, slashPoster, slashSynlig]);

  const valjSlash = React.useCallback(
    (k: StudioKommando) => {
      setSlashStangd(true);
      setPrompt("");
      void korKommando(k.namn);
    },
    [korKommando],
  );

  const kompletteraSlash = React.useCallback((k: StudioKommando) => {
    historikIndexRef.current = null;
    setPrompt(`/${k.namn} `);
    setSlashStangd(true);
    ytaRef.current?.focus();
  }, []);

  /** Bläddra i prompthistoriken (våg 86 G2) — som terminalen. */
  const blattraHistorik = React.useCallback(
    (riktning: 1 | -1): boolean => {
      if (promptHistorik.length === 0) return false;
      const nu = historikIndexRef.current;
      if (riktning === 1) {
        if (nu === null) {
          if (prompt.trim() !== "") return false;
          historikUtkastRef.current = prompt;
          historikIndexRef.current = 0;
          setPrompt(promptHistorik[0]);
          return true;
        }
        if (nu + 1 >= promptHistorik.length) return true;
        historikIndexRef.current = nu + 1;
        setPrompt(promptHistorik[nu + 1]);
        return true;
      }
      if (nu === null) return false;
      if (nu - 1 < 0) {
        historikIndexRef.current = null;
        setPrompt(historikUtkastRef.current);
        return true;
      }
      historikIndexRef.current = nu - 1;
      setPrompt(promptHistorik[nu - 1]);
      return true;
    },
    [promptHistorik, prompt],
  );

  const oppnaPalett = React.useCallback(() => {
    setPalettFras("");
    setPalettIndex(0);
    setPalettOppen(true);
  }, []);

  // ── GLOBALA GENVÄGAR (våg 84 A): Ctrl/Cmd+K (palett), "?" (genvägar), Esc.
  //    (VÅG 90: T/tema är borttaget — temat är fast mörkt; se filhuvudet.)
  React.useEffect(() => {
    const paTangent = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalettOppen((v) => {
          if (v) return false;
          setPalettFras("");
          setPalettIndex(0);
          return true;
        });
        return;
      }
      if (e.key === "Escape") {
        if (palettOppen) {
          setPalettOppen(false);
        } else if (sokOppen) {
          setSokOppen(false);
          setSokFras("");
        } else if (prompterOppen) {
          setPrompterOppen(false);
        }
        setVisaGenvagar(false);
        setVisaNotiser(false);
        setInstallningarOppen(false);
        setMenyOppen(false);
        setStyrelseOppen(false); // VÅG 91 A3b: styrelse-dialogen stängs (mötet lever kvar)
        setMobilSidebar(false); // VÅG 90: mobil-drawers stängs
        setMobilPanel(false);
        return;
      }
      const mal = e.target as HTMLElement | null;
      const iRedigerbart =
        !!mal &&
        (mal.tagName === "INPUT" ||
          mal.tagName === "TEXTAREA" ||
          mal.tagName === "SELECT" ||
          mal.isContentEditable);
      if (iRedigerbart || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "?") {
        e.preventDefault();
        setVisaGenvagar((v) => !v);
      }
    };
    window.addEventListener("keydown", paTangent);
    return () => window.removeEventListener("keydown", paTangent);
  }, [palettOppen, sokOppen, prompterOppen]);

  React.useEffect(() => {
    if (sokOppen) sokInputRef.current?.focus();
  }, [sokOppen]);

  React.useEffect(() => {
    if (palettOppen) palettInputRef.current?.focus();
  }, [palettOppen]);

  /* ── VÅG 96 D2 (c): iOS-tangentbord — när skrivfältet fokuseras och det
     visuella fönstret krymper (tangentbordet öppnas) hålls fältet synligt
     via visualViewport-resize + scrollIntoView("nearest"). Skonsamt: rör
     bara scrollen, aldrig layouten; desktop (utan resize-event) orörd. ── */
  React.useEffect(() => {
    const vy = window.visualViewport;
    if (!vy) return;
    const justera = () => {
      const yta = ytaRef.current;
      if (yta && document.activeElement === yta) {
        yta.scrollIntoView({ block: "nearest", behavior: "auto" });
      }
    };
    vy.addEventListener("resize", justera);
    return () => vy.removeEventListener("resize", justera);
  }, []);

  /** Infoga en uppladdad sökväg i prompten ("Titta på …"). */
  const infogaSokvag = (sokvag: string, typ: string) => {
    const led = typ === "bild" ? `Titta på bilden ${sokvag} — ` : `Läs filen ${sokvag} — `;
    setPrompt((p) => (p.includes(sokvag) ? p : `${p}${p && !p.endsWith(" ") ? " " : ""}${led}`));
    ytaRef.current?.focus();
  };

  const prickFärg =
    live === "live" ? "bg-[#3FB950]" : live === "demo" ? "bg-[#D29922]" : "bg-[#F85149]";
  const prickText = live === "live" ? "LIVE" : live === "demo" ? "DEMO" : "NED";

  // Kontextberäkning: protokollets ÄRLIGA contextWindow är taket.
  const kontextTak =
    typeof kontext?.contextWindow === "number" && kontext.contextWindow > 0
      ? kontext.contextWindow
      : KONTEXT_TAK_RESERV;
  const kontextAnvänt =
    typeof kontext?.contextUsed === "number" && kontext.contextUsed > 0
      ? kontext.contextUsed
      : ackumulerat;
  const kontextProcent = kontextAnvänt > 0 ? Math.min(100, (kontextAnvänt / kontextTak) * 100) : null;

  // ── VÅG 90 K3: SIDEBAR-INNEHÅLL — delas av desktop-kolumnen + mobil-drawern.
  const sidebarInnehall = (
    <>
      {/* Brand + LIVE-status */}
      <div className="flex items-center gap-2 px-3 py-3">
        <button
          onClick={hem}
          title="Tillbaka till AK1A"
          className="min-w-0 flex-1 truncate text-left font-mono text-sm font-bold"
        >
          <span className="text-[#3FB950]">~/</span>
          <span className="text-[#E6EDF3]">ak1a</span>
          <span className="text-[#8B949E]">/studio</span>
        </button>
        <span
          className={cn("h-2 w-2 shrink-0 animate-pulse rounded-full", prickFärg)}
          role="status"
          aria-label={`${prickText}: ${statusText}`}
          title={`${prickText} — ${statusText}`}
        />
      </div>

      {/* + Nytt samtal (grön, fullbredd) */}
      <div className="px-3 pb-2">
        <button
          onClick={nyTabb}
          title={`Nytt samtal — frisk agent-session (${tabbar.length}/${MAX_TABBAR} · egen zcode-process på servern)`}
          className="flex h-[52px] w-full items-center justify-center gap-1.5 rounded-md bg-[#238636] px-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#2EA043] sm:h-9"
        >
          <Plus className="h-4 w-4" />
          Nytt samtal
        </button>
      </div>

      {/* Samtalslista (tabbarna) — aktiv = blå border-vänster */}
      <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B949E]">
        Samtal {tabbar.length}/{MAX_TABBAR}
      </p>
      <nav className="min-h-0 flex-1 overflow-y-auto pb-2 [scrollbar-width:thin]" aria-label="Samtal">
        {tabbar.map((t) => {
          const arAktiv = t.id === (aktivTabb?.id ?? "");
          return (
            <div
              key={t.id}
              className={cn(
                "group flex items-center gap-1 border-l-2 pr-1 transition-colors",
                arAktiv ? "border-[#58A6FF] bg-[#0D1117]" : "border-transparent hover:bg-[#0D1117]",
              )}
              title={`${t.titel}${t.sessionId ? ` · ${t.sessionId}` : " · ingen session ännu"}${t.huvud ? " · huvudsessionen" : " · egen session"}${t.strömmar ? " · agenten arbetar…" : ""}`}
            >
              <button
                onClick={() => valjTabb(t.id)}
                className="flex min-h-[52px] min-w-0 flex-1 flex-col items-start px-2.5 py-2 text-left sm:min-h-0"
                aria-current={arAktiv ? "page" : undefined}
              >
                <span className="flex w-full items-center gap-1.5">
                  {t.strömmar && (
                    <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#D29922]" aria-label="Agenten arbetar" />
                  )}
                  <span className={cn("truncate text-[13px] leading-snug", arAktiv ? "font-medium text-[#E6EDF3]" : "text-[#8B949E]")}>
                    {t.titel}
                    {t.huvud && <span className="ml-1 text-[9px] text-[#484F58]">●</span>}
                  </span>
                </span>
                <span className="mt-0.5 flex w-full items-center gap-1.5 font-mono text-[9px] text-[#484F58]">
                  <span className="truncate">{modellBadge(t.kontext?.modell)}</span>
                  {t.uppdaterad > 0 && <span className="shrink-0">· {tidKortMs(Date.now() - t.uppdaterad)}</span>}
                  {t.sessionId && t.sessionId === aktivSession && (
                    <span className="shrink-0 font-sans font-bold text-[#3FB950]">AKTIV</span>
                  )}
                </span>
              </button>
              <button
                onClick={() => stangTabb(t.id)}
                title={t.strömmar ? "Stäng samtalet (agenten arbetar — avbryta?)" : "Stäng samtalet"}
                aria-label="Stäng samtalet"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#484F58] opacity-0 transition-colors hover:bg-[#DA3633]/20 hover:text-[#F85149] group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}

        {/* Äldre sessioner (server-listan) — klick = resume i nytt samtal */}
        <div className="mt-2 flex items-center justify-between border-t border-[#21262D] px-3 pb-1 pt-3 sm:mt-0 sm:border-t-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B949E]">
            Äldre sessioner
          </p>
          <button
            onClick={() => void lasSessioner()}
            title="Uppdatera sessionslistan (session/list)"
            className="flex h-6 w-6 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#0D1117] hover:text-[#E6EDF3]"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
        {sessioner.length === 0 && (
          <p className="px-3 py-1.5 text-[11px] leading-relaxed text-[#484F58]">
            Inga sparade sessioner än.
          </p>
        )}
        {sessioner.map((s) => {
          const arOppnad = tabbar.some((t) => t.sessionId === s.sessionId);
          return (
            <div
              key={s.sessionId}
              className="group flex items-center gap-1 border-l-2 border-transparent pr-1 transition-colors hover:bg-[#0D1117]"
              title={`${s.sessionId}${s.status ? ` · ${s.status}` : ""}${arOppnad ? " · redan öppen — klicka växlar dit" : " · klicka = resume i nytt samtal"}`}
            >
              <button
                onClick={() => oppnaITabb(s.sessionId, s.titel)}
                disabled={sessionJobbar !== ""}
                className="flex min-h-[52px] min-w-0 flex-1 flex-col items-start px-2.5 py-2 text-left disabled:cursor-default sm:min-h-0"
              >
                <span className="w-full truncate text-[13px] leading-snug text-[#8B949E]">
                  {s.titel || s.sessionId.slice(0, 18) + "…"}
                </span>
                <span className="mt-0.5 flex w-full items-center gap-1.5 truncate font-mono text-[9px] text-[#484F58]">
                  {[
                    s.modell?.includes("/") ? s.modell.split("/").slice(1).join("/") : s.modell,
                    typeof s.turns === "number" ? `${s.turns} vändor` : null,
                    typeof s.tokens === "number" ? `${tkn(s.tokens)} tkn` : null,
                    tidKort(s.uppdaterad) || null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || s.sessionId.slice(5, 13)}
                </span>
              </button>
              <button
                onClick={() => void stangSessionen(s.sessionId)}
                disabled={sessionJobbar !== "" || strömmarHuvud}
                title="Stäng sessionen (session/close) — finns kvar i listan men svarar ej"
                aria-label="Stäng sessionen"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#484F58] opacity-0 transition-colors hover:bg-[#DA3633]/20 hover:text-[#F85149] group-hover:opacity-100 disabled:opacity-30"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </nav>

      {/* Footer: status-text (LIVE/DEMO/NED) */}
      <div className="border-t border-[#30363D] px-3 py-2.5">
        <p className="flex items-center gap-2 text-[10px] text-[#8B949E]">
          <span className={cn("h-2 w-2 shrink-0 rounded-full", prickFärg)} aria-hidden />
          <span className="shrink-0 font-semibold uppercase tracking-wider">{prickText}</span>
          <span className="min-w-0 flex-1 truncate" title={statusText}>
            {statusText}
          </span>
        </p>
      </div>
    </>
  );

  return (
    <div
      className="studio-root flex h-[100dvh] overflow-hidden bg-[#0D1117] text-[#E6EDF3]"
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
      {/* Bekräftelse-toast (grön/röd accent på mörk bottn) */}
      {toast && (
        <div
          role="status"
          className={cn(
            "fixed left-1/2 top-3 z-[90] -translate-x-1/2 rounded-md border px-4 py-2 text-xs font-medium shadow-lg",
            toast.ton === "fel"
              ? "border-[#DA3633]/50 bg-[#161B22] text-[#F85149]"
              : "border-[#238636]/50 bg-[#161B22] text-[#E6EDF3]",
          )}
        >
          <span className={cn("mr-1.5", toast.ton === "fel" ? "text-[#F85149]" : "text-[#3FB950]")}>●</span>
          {toast.text}
        </div>
      )}

      {/* ══ VÅG 90 K3: SIDEBAR (vänster, 260px, #010409) — desktop-kolumn ══ */}
      <aside
        aria-label="Samtalsmeny"
        className={cn(
          "hidden w-[260px] shrink-0 flex-col border-r border-[#30363D] bg-[#010409] md:flex",
          !sidebarOppen && "md:hidden",
        )}
      >
        {sidebarInnehall}
      </aside>

      {/* ══ MOBIL (< md): sidebar som drawer (hamburgaren i headern) ══ */}
      {mobilSidebar && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setMobilSidebar(false)}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-label="Samtalsmeny"
            className="fixed inset-y-0 left-0 z-50 flex w-[85vw] flex-col border-r border-[#30363D] bg-[#010409] shadow-2xl md:hidden"
          >
            {/* VÅG 96 D2 (d): STÄNG-rad överst — tydlig fullbreddstryckyta
                (kunden är telefon-först: menyn ska gå att stänga utan jakt). */}
            <button
              onClick={() => setMobilSidebar(false)}
              title="Stäng (Esc)"
              className="flex min-h-[52px] w-full items-center justify-between gap-2 border-b border-[#30363D] px-3 text-sm font-semibold text-[#8B949E] transition-colors hover:bg-[#0D1117] hover:text-[#E6EDF3]"
            >
              Stäng menyn
              <X className="h-4 w-4" aria-hidden />
            </button>
            {sidebarInnehall}
          </aside>
        </>
      )}

      {/* ══ CHATT-KOLUMNEN (center, flex-1, #161B22) ══ */}
      <div className="flex min-w-0 flex-1 flex-col bg-[#161B22]">
        {/* Header: hamburger (mobil) + sidebar-toggle (desktop) + titel + status
            + sök/palett/panel/inställningar/mer. */}
        <header className="studio-safe-top z-20 flex h-[52px] shrink-0 items-center gap-1 border-b border-[#30363D] bg-[#0D1117] px-2 sm:h-12 sm:px-3">
          <button
            onClick={() => setMobilSidebar(true)}
            title="Samtalsmeny"
            aria-label="Öppna samtalsmenyn"
            aria-expanded={mobilSidebar}
            className="flex h-[52px] w-10 shrink-0 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:h-8 sm:w-8 md:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSidebarOppen((v) => !v)}
            title={sidebarOppen ? "Dölj samtalsmenyn" : "Visa samtalsmenyn"}
            aria-label={sidebarOppen ? "Dölj samtalsmenyn" : "Visa samtalsmenyn"}
            aria-expanded={sidebarOppen}
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] md:flex"
          >
            <PanelLeft className={cn("h-4 w-4", !sidebarOppen && "text-[#484F58]")} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[13px] font-semibold leading-tight tracking-tight text-[#E6EDF3]">
              AK1A <span className="text-[#58A6FF]">Studio</span>
            </h1>
            <p className="hidden truncate text-[10px] leading-tight text-[#8B949E] sm:block" title={statusText}>
              {aktivTabb?.status || statusText}
            </p>
          </div>
          {/* VÅG 91 A3d: autonomi-signal — mål-motorn arbetar i bakgrunden. */}
          {autonomiAktiv && (
            <span
              role="status"
              title="Mål-motorn kör — agenten arbetar vidare även om du lämnar fliken"
              className="mr-1 hidden shrink-0 animate-pulse items-center gap-1 rounded-full border border-[#D29922]/50 bg-[#D29922]/15 px-2 py-0.5 text-[10px] font-semibold text-[#D29922] sm:flex"
            >
              ⏱ Arbetar i bakgrunden
            </span>
          )}
          <span
            className={cn("mr-1 h-2 w-2 shrink-0 animate-pulse rounded-full md:hidden", prickFärg)}
            role="status"
            aria-label={`${prickText}: ${statusText}`}
            title={`${prickText} — ${statusText}`}
          />
          {/* VÅG 91 A3b: styrelsen 🏛 — konkalla de fem rollerna. */}
          <button
            onClick={() => oppnaStyrelseDialog()}
            title="Styrelsen 🏛 — konkalla AI-styrelsen (5 roller diskuterar och beslutar)"
            aria-label="Styrelsen"
            className="flex h-[52px] w-10 shrink-0 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:h-8 sm:w-8"
          >
            <Landmark className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSokOppen(true)}
            title="Sök i chatten (highlight + pilnavigering)"
            aria-label="Sök i chatten"
            className="flex h-[52px] w-10 shrink-0 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:h-8 sm:w-8"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={oppnaPalett}
            title="Kommandopalett (Ctrl/Cmd+K)"
            aria-label="Kommandopalett"
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:flex"
          >
            <Command className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (window.matchMedia("(min-width: 1024px)").matches) setPanelOppen((v) => !v);
              else setMobilPanel((v) => !v);
            }}
            title="Mål · kontext · terminal (höger panel)"
            aria-label="Växla höger panel"
            aria-expanded={panelOppen || mobilPanel}
            className="flex h-[52px] w-10 shrink-0 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:h-8 sm:w-8"
          >
            <PanelRight className={cn("h-4 w-4", !panelOppen && "text-[#484F58]")} />
          </button>
          <button
            onClick={oppnaInstallningar}
            title="Inställningar — modell, läge, tankestyrka"
            aria-label="Inställningar"
            className="flex h-[52px] w-10 shrink-0 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:h-8 sm:w-8"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={() => (menyOppen ? setMenyOppen(false) : oppnaMeny())}
            title="Mer — filer, minne, färdigheter, verktyg, export m.m."
            aria-label="Mer"
            aria-expanded={menyOppen}
            className="flex h-[52px] w-10 shrink-0 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:h-8 sm:w-8"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </header>

        {/* Sök-raden — visas ENDAST när sök är påslaget (Esc / X stänger). */}
        {sokOppen && (
          <div className="z-10 border-b border-[#30363D] bg-[#0D1117]">
            <div className="mx-auto flex w-full max-w-3xl items-center gap-1.5 px-3 py-2 sm:px-4">
              <Search className="h-4 w-4 shrink-0 text-[#8B949E]" />
              <input
                ref={sokInputRef}
                value={sokFras}
                onChange={(e) => setSokFras(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    hoppaSok(e.shiftKey ? -1 : 1);
                  }
                }}
                placeholder="Sök i chatten…"
                maxLength={120}
                className="min-h-9 min-w-0 flex-1 rounded-md border border-[#30363D] bg-[#161B22] px-3 py-1.5 text-sm text-[#E6EDF3] outline-none placeholder:text-[#484F58] focus:border-[#58A6FF]"
              />
              <span className="shrink-0 font-mono text-[11px] tabular-nums text-[#8B949E]" aria-live="polite">
                {sokFras.trim()
                  ? sokTräffar.length > 0
                    ? `${Math.min(sokIndex, sokTräffar.length - 1) + 1}/${sokTräffar.length}`
                    : "0 träffar"
                  : ""}
              </span>
              <button
                onClick={() => hoppaSok(-1)}
                disabled={sokTräffar.length === 0}
                title="Föregående träff (Skift+Enter)"
                aria-label="Föregående träff"
                className="flex h-[52px] w-11 shrink-0 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:h-9 sm:w-9 disabled:opacity-40"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => hoppaSok(1)}
                disabled={sokTräffar.length === 0}
                title="Nästa träff (Enter)"
                aria-label="Nästa träff"
                className="flex h-[52px] w-11 shrink-0 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:h-9 sm:w-9 disabled:opacity-40"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setSokOppen(false);
                  setSokFras("");
                }}
                title="Stäng sök (Esc)"
                aria-label="Stäng sök"
                className="flex h-[52px] w-11 shrink-0 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:h-9 sm:w-9"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Kontext-varning (≥ 80 % av taket) — gul varningsrad. */}
        {kontextProcent !== null && kontextProcent >= KONTEXT_VARNING_PROCENT && (
          <div className="z-10 border-b border-[#D29922]/30 bg-[#D29922]/10">
            <p className="mx-auto w-full max-w-3xl px-3 py-1.5 text-[11px] font-semibold text-[#D29922] sm:px-4">
              ⚠ Överväg ny session — kontexten närmar sig taket ({kontextProcent.toFixed(0)} % av {tkn(kontextTak)})
            </p>
          </div>
        )}

        {/* Autonom banner — mål-loopen kör (våg 85 F1). */}
        {malKör && (
          <div role="status" aria-live="polite" className="z-10 border-b border-[#238636]/40 bg-[#238636]/10">
            <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-3 py-2 sm:px-4">
              <Target className="h-4 w-4 shrink-0 animate-pulse text-[#3FB950]" />
              <p className="min-w-0 flex-1 truncate text-[12px] font-semibold text-[#3FB950]">
                Agenten utvecklar autonomt — iteration {malIteration}
                <span className="ml-1.5 hidden font-normal text-[#8B949E] sm:inline">
                  nya turner matas automatiskt mot målet
                </span>
              </p>
              <button
                onClick={() => void pausaMal()}
                disabled={malPausar}
                title="Pausa målet (session/stop) — den pågående iterationen avbryts inom sekunder"
                className="flex shrink-0 items-center gap-1 rounded-md border border-[#D29922]/50 px-2.5 py-1 text-[11px] font-semibold text-[#D29922] transition-colors hover:bg-[#D29922]/10 disabled:opacity-50"
              >
                {malPausar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CircleStop className="h-3.5 w-3.5" />}
                Pausa
              </button>
            </div>
          </div>
        )}

        {/* Meddelandelista — fullbredd-block med tunn separator (INGA bubblor). */}
        <div className="relative min-h-0 flex-1">
          {/* Borta-banner (våg 87 H1 + 93 C4): svaren + verktygsaktiviteten. */}
          {bortaBanner && (
            <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex justify-center px-3">
              <div className="studio-fade-in pointer-events-auto flex max-w-full flex-col rounded-md border border-[#30363D] bg-[#0D1117] text-xs font-medium text-[#E6EDF3] shadow-lg">
                <div className="flex items-center gap-2 px-4 py-2">
                  <span className="truncate">
                    Agenten har arbetat medan du var borta — {bortaBanner.antalTurner} nya svar
                    {bortaBanner.malKorer ? " · mål-loopen kör fortfarande" : ""}
                    {bortaBanner.kort && bortaBanner.kort.length > 0
                      ? ` · ${bortaBanner.kort.length} verktygskall`
                      : ""}
                  </span>
                  {bortaBanner.kort && bortaBanner.kort.length > 0 && (
                    <button
                      onClick={() => setBortaKortOppet((o) => !o)}
                      title={bortaKortOppet ? "Dölj verktygsaktiviteten" : "Visa verktygsaktiviteten"}
                      aria-label={bortaKortOppet ? "Dölj verktygsaktiviteten" : "Visa verktygsaktiviteten"}
                      aria-expanded={bortaKortOppet}
                      className="shrink-0 rounded-md bg-[#21262D] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#E6EDF3] transition-colors hover:bg-[#30363D]"
                    >
                      {bortaKortOppet ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setBortaBanner(null);
                      setBortaKortOppet(false);
                      hoppaNerChatt();
                    }}
                    className="min-h-[44px] shrink-0 rounded-md bg-[#238636] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#2EA043] sm:min-h-0"
                  >
                    Visa
                  </button>
                  <button
                    onClick={() => {
                      setBortaBanner(null);
                      setBortaKortOppet(false);
                    }}
                    title="Stäng notisen"
                    aria-label="Stäng notisen"
                    className="shrink-0 text-[#8B949E] transition-colors hover:text-[#E6EDF3]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                {/* VÅG 97 E2: upp till 5 SENASTE verktygskörningar direkt i
                    bannern — $-prefix-mono-rader + ✓/✗/spinner + varaktighet
                    (replay-kortens slutbild; tiden = körningens varaktighet —
                    protokollets kort bär ingen klockstämpel). Icke-tryckbara
                    informationsrader; fulla korten fälls ut med vronen ovan. */}
                {bortaBanner.kort && bortaBanner.kort.length > 0 && (
                  <ul
                    aria-label="Senaste verktygskörningar under frånvaron"
                    className="max-w-full space-y-px border-t border-[#30363D] px-3 py-1.5"
                  >
                    {bortaBanner.kort.slice(-5).map((k) => (
                      <li
                        key={k.id}
                        title={`${kortRubrik({ ...k, namn: k.namn || "verktyg" })}${
                          typeof k.varaktighetMs === "number" ? ` · ${msText(k.varaktighetMs)}` : ""
                        }${k.fel ? ` · fel: ${k.fel.slice(0, 120)}` : ""}`}
                        className="flex min-w-0 items-center gap-1.5 font-mono text-[10px] leading-relaxed"
                      >
                        <span className="shrink-0 text-[#3FB950]" aria-hidden>
                          $
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[#E6EDF3]/85">
                          {kortRubrik({ ...k, namn: k.namn || "verktyg" })}
                        </span>
                        {k.steg === "fel" ? (
                          <XCircle className="h-3 w-3 shrink-0 text-[#F85149]" aria-label="misslyckades" />
                        ) : k.steg === "resultat" ? (
                          <Check className="h-3 w-3 shrink-0 text-[#3FB950]" aria-label="klar" />
                        ) : (
                          <Loader2 className="h-3 w-3 shrink-0 animate-spin text-[#D29922]" aria-label="pågår" />
                        )}
                        {typeof k.varaktighetMs === "number" && (
                          <span className="shrink-0 text-[9px] text-[#484F58]">{msText(k.varaktighetMs)}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {/* VÅG 93 C4: verktygsaktiviteten under frånvaron — samma kortvy
                    som i chatten (VerktygsKortVy), aggregerad till slutstatus. */}
                {bortaKortOppet && bortaBanner.kort && bortaBanner.kort.length > 0 && (
                  <div
                    role="region"
                    aria-label="Verktygsaktivitet under frånvaron"
                    className="max-h-64 space-y-1 overflow-y-auto border-t border-[#30363D] p-2"
                  >
                    {bortaBanner.kort.map((k) => (
                      <VerktygsKortVy
                        key={k.id}
                        kort={{ ...k, namn: k.namn || "verktyg", öppen: bortaOppnaKort.has(k.id) }}
                        onVaxla={(id) =>
                          setBortaOppnaKort((s) => {
                            const n = new Set(s);
                            if (n.has(id)) n.delete(id);
                            else n.add(id);
                            return n;
                          })
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <div
            ref={blattraRef}
            onScroll={paScrollChatt}
            className="studio-chatt mx-auto h-full w-full max-w-3xl overflow-y-auto px-3 py-2 sm:px-4"
          >
            {/* Loading-skeletons — Z-mörka block medan historiken laddar. */}
            {meddelanden.length === 0 && laddarHistorik && (
              <div role="status" aria-label="Laddar chatten" className="mx-auto mt-8 max-w-md space-y-4">
                <div className="space-y-1.5">
                  <div className="h-3 w-16 animate-pulse rounded bg-[#21262D]" />
                  <div className="h-4 w-3/5 animate-pulse rounded bg-[#21262D]" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-12 animate-pulse rounded bg-[#21262D] [animation-delay:150ms]" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-[#21262D] [animation-delay:150ms]" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-14 animate-pulse rounded bg-[#21262D] [animation-delay:300ms]" />
                  <div className="h-4 w-2/5 animate-pulse rounded bg-[#21262D] [animation-delay:300ms]" />
                </div>
              </div>
            )}
            {/* Empty-state — terminal-prompt + välkomstord + förslag. */}
            {meddelanden.length === 0 && !laddarHistorik && (
              <div className="studio-fade-in mx-auto mt-12 max-w-md text-center">
                <ZcEmblem />
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B949E]">
                  Din agent i molnet
                </p>
                <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-[#E6EDF3]">
                  Välkommen till AK1A Studio
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#8B949E]">
                  Skriv, klistra in en bild eller släpp filer här — agenten bygger, läser
                  och utvecklar rakt i arbetsytan. Mappar laddas upp med 📎-knappen.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => setMalDialogOppen(true)}
                    title="Öppna mål-dialogen — beskriv ett utvecklingsmål och agenten itererar autonomt"
                    className="flex items-center gap-1.5 rounded-md border border-[#238636]/50 px-3.5 py-2 text-xs font-semibold text-[#3FB950] transition-colors hover:bg-[#238636]/10"
                  >
                    <Target className="h-3.5 w-3.5" />
                    Sätt ett mål
                  </button>
                  <button
                    onClick={() => filInputRef.current?.click()}
                    title="Ladda upp filer (png/jpg/pdf/zip/txt/md/json/csv, max 30 MB/fil)"
                    className="flex items-center gap-1.5 rounded-md border border-[#30363D] px-3.5 py-2 text-xs font-semibold text-[#E6EDF3] transition-colors hover:bg-[#0D1117]"
                  >
                    <UploadCloud className="h-3.5 w-3.5 text-[#8B949E]" />
                    Ladda upp en fil
                  </button>
                  <button
                    onClick={() => ytaRef.current?.focus()}
                    title="Fokusera skrivfältet — fråga agenten vad som helst"
                    className="flex items-center gap-1.5 rounded-md border border-[#30363D] px-3.5 py-2 text-xs font-semibold text-[#E6EDF3] transition-colors hover:bg-[#0D1117]"
                  >
                    <MessageCircleQuestion className="h-3.5 w-3.5 text-[#8B949E]" />
                    Fråga agenten
                  </button>
                </div>
              </div>
            )}

            {/* Meddelandena — divide-y = tunn separator mellan blocken. */}
            <div className="divide-y divide-[#21262D]">
              {meddelanden.map((m) => {
                // VÅG 91 A3a: bifogade bilder + sökvägar i texten → thumbnails.
                const userBilder = [...(m.bilder ?? []), ...bildRefsUrText(m.text)].filter(
                  (b, i, a) => a.indexOf(b) === i,
                );
                return (
                  <React.Fragment key={m.id}>
                    {m.roll === "user" ? (
                      <div
                        ref={(el) => {
                          if (el) meddelandeRefs.current.set(m.id, el);
                          else meddelandeRefs.current.delete(m.id);
                        }}
                        className="studio-fade-in py-4"
                      >
                        {/* DU-etikett + ren text (ingen bakgrund). */}
                        <p className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B949E]">
                          <span className="flex h-4 w-4 items-center justify-center rounded-sm border border-[#30363D] font-mono text-[8px] font-bold text-[#8B949E]" aria-hidden>
                            D
                          </span>
                          DU
                        </p>
                        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-[#E6EDF3] sm:text-sm">
                          {sokFras.trim()
                            ? markeraVanlig(m.text, sokFras.trim(), aktivTräff?.meddelandeId === m.id ? aktivTräff.forekomst : -1)
                            : m.text}
                        </p>
                        {/* Bifogade + textrefererade bilder → miniatyrer (64px).
                            VÅG 92 B3: bilage-progress — "Laddar upp bilaga…"
                            (spinner) tills POST /stream svarat, därefter
                            "Bilaga ✓" (#3FB950) vid varje thumbnail. */}
                        {userBilder.length > 0 && (
                          <div className="mt-2 flex flex-wrap items-start gap-1.5">
                            {userBilder.map((sokvag) => (
                              <span key={sokvag} className="relative shrink-0">
                                <img
                                  src={bildUrl(sokvag)}
                                  alt={sokvag.split("/").pop() ?? sokvag}
                                  loading="lazy"
                                  className="h-16 w-16 cursor-pointer rounded-md border border-[#30363D] object-cover transition-opacity hover:opacity-90"
                                  onClick={() => void visaFil(sokvag)}
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                  }}
                                />
                                {m.bilagaStatus && (
                                  <span
                                    aria-hidden
                                    title={m.bilagaStatus === "laddar" ? "Laddar upp bilaga…" : "Bilaga ✓"}
                                    className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-[#30363D] bg-[#0D1117]"
                                  >
                                    {m.bilagaStatus === "laddar" ? (
                                      <Loader2 className="h-2.5 w-2.5 animate-spin text-[#D29922]" />
                                    ) : (
                                      <Check className="h-2.5 w-2.5 text-[#3FB950]" />
                                    )}
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                        {m.bilder && m.bilder.length > 0 && m.bilagaStatus && (
                          <p
                            role="status"
                            className={cn(
                              "mt-2 flex items-center gap-1.5 text-[10px] font-medium",
                              m.bilagaStatus === "klar" ? "text-[#3FB950]" : "text-[#8B949E]",
                            )}
                          >
                            {m.bilagaStatus === "laddar" ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin text-[#D29922]" />
                                Laddar upp bilaga…
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-[#3FB950]" />
                                Bilaga ✓
                              </>
                            )}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div
                        ref={(el) => {
                          if (el) meddelandeRefs.current.set(m.id, el);
                          else meddelandeRefs.current.delete(m.id);
                        }}
                        className={cn("studio-fade-in py-4", m.fel && "border-l-2 border-[#DA3633] pl-3")}
                      >
                        {/* AK1A-etikett + statuschips (Utforskat/Körde/Skrev ✓). */}
                        <div className="mb-2 flex flex-wrap items-center gap-1.5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#3FB950]">
                            AK1A
                          </p>
                          {typeof m.malIteration === "number" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#58A6FF]/10 px-2 py-0.5 text-[10px] font-medium text-[#58A6FF]" title="Autonom iteration (mål-loopen)">
                              <Target className="h-3 w-3" />
                              Iteration {m.malIteration}
                            </span>
                          )}
                          {statusChips(m.verktygKort).map((chip) => (
                            <StatusChipPill key={chip.etikett} chip={chip} />
                          ))}
                        </div>
                        {/* VÅG 97 E2: TANKAR — resonemanget som kollapsbar sektion
                            OVANFÖR svaret (streaming: peek + "tänker…"; klart:
                            kollapsad, klick = expandera). ALDRIG i m.text. */}
                        {m.tankar && m.tankar.trim() !== "" && (
                          <TankarVy
                            tankar={m.tankar}
                            strömmande={m.strömmande === true}
                            oppen={m.tankarOppen === true}
                            onVaxla={() =>
                              rörTabb(aktivTabb?.id ?? "", (tb) => ({
                                ...tb,
                                meddelanden: tb.meddelanden.map((mm) =>
                                  mm.id === m.id ? { ...mm, tankarOppen: !(mm.tankarOppen === true) } : mm,
                                ),
                              }))
                            }
                          />
                        )}
                        {/* Verktygskort — mono, $-prefix, grå bakgrund, expandera. */}
                        {m.verktygKort && m.verktygKort.length > 0 && (
                          <div className="mb-2 space-y-1.5">
                            {m.verktygKort.map((k) => (
                              <VerktygsKortVy
                                key={k.id}
                                kort={k}
                                onVaxla={(id) =>
                                  rörTabb(aktivTabb?.id ?? "", (tb) => ({
                                    ...tb,
                                    meddelanden: tb.meddelanden.map((mm) =>
                                      mm.id === m.id
                                        ? {
                                            ...mm,
                                            verktygKort: (mm.verktygKort ?? []).map((k2) =>
                                              k2.id === id ? { ...k2, öppen: !k2.öppen } : k2,
                                            ),
                                          }
                                        : mm,
                                    ),
                                  }))
                                }
                              />
                            ))}
                          </div>
                        )}
                        {m.text ? (
                          <StudioMarkdown
                            text={m.text}
                            markera={
                              sokFras.trim()
                                ? { fras: sokFras.trim(), aktivForekomst: aktivTräff?.meddelandeId === m.id ? aktivTräff.forekomst : -1 }
                                : undefined
                            }
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-[#8B949E]">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#3FB950]" />
                            {aktivTabb?.status || statusText}
                          </div>
                        )}
                        {/* Streaming: blinkande cursor i slutet av texten. */}
                        {m.strömmande && m.text && (
                          <span
                            aria-hidden
                            className="studio-cursor ml-0.5 inline-block h-4 w-[9px] rounded-[1.5px] bg-[#E6EDF3] align-text-bottom"
                          />
                        )}
                        {/* VÅG 91 A3a: agentens bildreferenser → monospace-chips. */}
                        {bildRefsUrText(m.text).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {bildRefsUrText(m.text).map((sokvag) => (
                              <span
                                key={sokvag}
                                title={sokvag}
                                className="flex max-w-[220px] items-center gap-1 rounded-md border border-[#30363D] bg-[#0D1117] px-1.5 py-0.5 font-mono text-[10px] text-[#8B949E]"
                              >
                                <FileImage className="h-3 w-3 shrink-0" aria-hidden />
                                <span className="min-w-0 truncate">
                                  {sokvag.split("/").slice(2).join("/") || sokvag}
                                </span>
                              </span>
                            ))}
                          </div>
                        )}
                        {/* Diff-inline: filer + gröna/röda badges → kodvy. */}
                        {m.ändringar && m.ändringar.length > 0 && (
                          <AndringsPanel
                            andringar={m.ändringar}
                            onVaxlaFil={(sokvag) =>
                              rörTabb(aktivTabb?.id ?? "", (tb) => ({
                                ...tb,
                                meddelanden: tb.meddelanden.map((mm) =>
                                  mm.id === m.id
                                    ? {
                                        ...mm,
                                        ändringar: (mm.ändringar ?? []).map((f) =>
                                          f.sokvag === sokvag ? { ...f, öppen: !f.öppen } : f,
                                        ),
                                      }
                                    : mm,
                                ),
                              }))
                            }
                            arbetsyta={arbetsytaInfo?.arbetsyta}
                            planLage={(aktivTabb?.kontext?.lage ?? arbetsytaInfo?.lage) === "plan"}
                          />
                        )}
                        {/* Rundstatistik — mono fotrad. */}
                        {m.rundStatistik && !m.strömmande && (
                          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[10px] text-[#8B949E]">
                            {typeof m.rundStatistik.varaktighetMs === "number" && (
                              <span title="Turnens varaktighet (turn.completed.duration)">
                                {msText(m.rundStatistik.varaktighetMs)}
                              </span>
                            )}
                            {typeof m.rundStatistik.verktygAntal === "number" && (
                              <span title="Verktygskall denna turn (turn.completed.toolCallCount)">
                                {m.rundStatistik.verktygAntal} verktyg
                              </span>
                            )}
                            {m.rundStatistik.resultatTyp && (
                              <span
                                className={cn(
                                  m.rundStatistik.resultatTyp === "success" ? "text-[#3FB950]" : "text-[#F85149]",
                                )}
                                title="Turnens resultat (turn.completed.resultType)"
                              >
                                {m.rundStatistik.resultatTyp === "success" ? "✓ lyckad" : "⚠ " + m.rundStatistik.resultatTyp}
                              </span>
                            )}
                          </p>
                        )}
                        {/* Rewind ⟲ — fork:a sessionen vid denna punkt (våg 86 G5). */}
                        {(() => {
                          const ti = turnIndexKarta.get(m.id);
                          if (m.strömmande || ti === undefined || ti < 0) return null;
                          return (
                            <div className="mt-1.5 flex justify-end">
                              <button
                                onClick={() => void gaTillbakaHit(m.id)}
                                disabled={rewindJobbar}
                                title={`Gå tillbaka hit — sessionen forkas vid denna punkt (iteration ${ti + 1})`}
                                aria-label={`Gå tillbaka till iteration ${ti + 1} — fork:a sessionen här`}
                                className="rounded-md border border-[#30363D] px-2 py-0.5 text-[11px] leading-none text-[#8B949E] transition-colors hover:border-[#58A6FF] hover:text-[#58A6FF] disabled:opacity-50"
                              >
                                ⟲
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              {/* PERMISSION-DIALOG (våg 83 B2 + 84 C) — fullbreddskort i flödet. */}
              {permission && (
                <div className="py-4">
                  <div className="rounded-md border border-[#D29922]/40 bg-[#0D1117] p-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <ShieldAlert className="h-4 w-4 shrink-0 text-[#D29922]" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#D29922]">
                        Begäran om godkännande
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                          riskFarg(permission.risk),
                        )}
                        title={`Protokollets risknivå: ${permission.risk}`}
                      >
                        {permission.risk}
                      </span>
                      {(() => {
                        const klass = verktygsriskKlass(permission.verktyg);
                        return (
                          <span
                            className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wider", klass.farg)}
                            title={klass.forklaring}
                          >
                            {klass.etikett}
                          </span>
                        );
                      })()}
                      {svarJobbar && <Loader2 className="h-3 w-3 animate-spin text-[#58A6FF]" />}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[#E6EDF3]">
                      Verktyget <span className="font-mono font-semibold text-[#58A6FF]">{permission.verktyg}</span> vill köras
                    </p>
                    {permission.skäl && (
                      <p className="mt-1 text-xs leading-relaxed text-[#8B949E]">{permission.skäl}</p>
                    )}
                    {permission.diff ? (
                      <DiffForhandsvisning diff={permission.diff} />
                    ) : (
                      <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-words rounded-md border border-[#30363D] bg-[#010409] p-2 font-mono text-[10px] leading-relaxed text-[#E6EDF3]/85">
                        {permission.sammanfattning}
                      </pre>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {permission.alternativ.map((a) => (
                        <button
                          key={a.optionId}
                          onClick={() => void svaraPermission(permission.requestId, a.optionId)}
                          disabled={svarJobbar}
                          title={a.beskrivning || a.namn}
                          className={cn(
                            "min-h-[52px] rounded-md px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 sm:min-h-0",
                            a.optionId === "deny"
                              ? "border border-[#DA3633]/50 text-[#F85149] hover:bg-[#DA3633]/10"
                              : a.optionId === "allow_project"
                                ? "border border-[#238636]/60 text-[#3FB950] hover:bg-[#238636]/10"
                                : "bg-[#238636] text-white hover:bg-[#2EA043]",
                          )}
                        >
                          {PERMISSION_ETIKETT[a.optionId] ?? a.namn}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          const ny = sparaRegel(permission.verktyg);
                          visaToast(
                            ny
                              ? `Regel sparad: ${permission.verktyg} tillåts alltid (ta bort under Mer → Minnesregler).`
                              : `En regel för ${permission.verktyg} finns redan.`,
                          );
                          void svaraPermission(permission.requestId, "allow_once");
                        }}
                        disabled={svarJobbar}
                        title={`Spara en "alltid tillåt"-regel för ${permission.verktyg} i denna webbläsare (localStorage) och tillåt denna begäran`}
                        className="min-h-[52px] rounded-md border border-[#238636]/40 px-3 py-1.5 text-xs font-semibold text-[#3FB950] transition-colors hover:bg-[#238636]/10 disabled:opacity-50 sm:min-h-0"
                      >
                        ⛨ Alltid tillåta {permission.verktyg}
                      </button>
                    </div>
                    <p className="mt-2 text-[10px] leading-relaxed text-[#484F58]">
                      Svar inom 30 s — annars eskaleras begäran automatiskt så agenten inte fastnar.
                      {" "}Regler gäller i denna webbläsare och hanteras under Minnesregler i Mer-menyn (⋯).
                    </p>
                  </div>
                </div>
              )}

              {/* FRÅGEKORT (interaction/requestUserInput). */}
              {fraga && (
                <div className="py-4">
                  <div className="rounded-md border border-[#58A6FF]/40 bg-[#0D1117] p-3.5">
                    <div className="flex items-center gap-2">
                      <MessageCircleQuestion className="h-4 w-4 shrink-0 text-[#58A6FF]" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#58A6FF]">
                        Agenten frågar
                      </span>
                      {svarJobbar && <Loader2 className="h-3 w-3 animate-spin text-[#58A6FF]" />}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#E6EDF3]">{fraga.fråga}</p>
                    {fraga.val && fraga.val.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {fraga.val.map((v) => (
                          <button
                            key={v}
                            onClick={() => void svaraFraga(fraga.requestId, v)}
                            disabled={svarJobbar}
                            className="min-h-[52px] rounded-md border border-[#238636]/60 px-3 py-1.5 text-xs font-semibold text-[#3FB950] transition-colors hover:bg-[#238636]/10 disabled:opacity-50 sm:min-h-0"
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 flex items-end gap-2">
                        <textarea
                          value={fragSvar}
                          onChange={(e) => setFragSvar(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              void svaraFraga(fraga.requestId, fragSvar.trim());
                            }
                          }}
                          rows={1}
                          placeholder="Svara agenten… (Enter skickar)"
                          className="max-h-28 min-h-[52px] flex-1 resize-none rounded-md border border-[#30363D] bg-[#161B22] px-2.5 py-2 text-base leading-relaxed text-[#E6EDF3] outline-none transition-colors placeholder:text-[#484F58] focus:border-[#58A6FF] sm:min-h-[38px] sm:text-sm"
                        />
                        <button
                          onClick={() => void svaraFraga(fraga.requestId, fragSvar.trim())}
                          disabled={!fragSvar.trim() || svarJobbar}
                          className="h-[52px] shrink-0 rounded-md bg-[#238636] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#2EA043] disabled:opacity-50 sm:h-9"
                        >
                          Svara
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => void svaraFraga(fraga.requestId, undefined, true)}
                      disabled={svarJobbar}
                      className="mt-2 text-[10px] text-[#8B949E] underline underline-offset-2 transition-colors hover:text-[#E6EDF3] disabled:opacity-50"
                    >
                      Avbryt frågan
                    </button>
                  </div>
                </div>
              )}

              {/* VÅG 97 E2: den gamla tab-nivå-tankar-raden är BORTTAGEN —
                  resonemanget renderas nu per meddelande i TankarVy ovan
                  (peek under streaming, kollapsbar efter klart). */}
            </div>
          </div>
          {/* "↓ Nytt" — flytande knapp när användaren scrollat upp. */}
          {!vidBotten && meddelanden.length > 0 && (
            <button
              onClick={hoppaNerChatt}
              title="Hoppa till senaste — autoscrollen återupptas"
              className="absolute bottom-4 left-1/2 z-20 flex min-h-[44px] -translate-x-1/2 items-center gap-1.5 rounded-md border border-[#30363D] bg-[#0D1117] px-4 py-2 text-xs font-semibold text-[#E6EDF3] shadow-lg transition-colors hover:border-[#58A6FF] sm:bottom-3 sm:min-h-0 sm:px-3.5 sm:py-1.5"
            >
              <ArrowDown className="h-3.5 w-3.5 text-[#58A6FF]" />
              Nytt
              {nyaSedanUpp > 0 && (
                <span className="rounded-full bg-[#58A6FF] px-1.5 text-[10px] font-bold text-[#0D1117]">
                  {nyaSedanUpp}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Uppladdnings-chips — mono-rader ovanför skrivfältet. VÅG 108: ×
            stänger raden (sessionen ut) så chatten blir fri på mobil. */}
        {uppladdningar.length > 0 && chipsDolda && (
          <div className="mx-auto flex w-full max-w-3xl items-center px-3 pb-1.5 sm:px-4">
            <button
              onClick={visaChips}
              title="Visa uppladdnings-chipsen igen"
              className="flex h-6 items-center gap-1 rounded-md border border-[#30363D] bg-[#0D1117] px-2 font-mono text-[11px] text-[#8B949E] transition-colors hover:border-[#58A6FF] hover:text-[#E6EDF3]"
            >
              <Paperclip className="h-3 w-3" aria-hidden /> {uppladdningar.length}
            </button>
          </div>
        )}
        {uppladdningar.length > 0 && !chipsDolda && (
          <div className="shrink-0">
            <div className="mx-auto flex w-full max-w-3xl items-center gap-1.5 px-3 pb-1 sm:px-4">
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-[#8B949E]">
                Uppladdningar
              </span>
              <button
                onClick={doljChips}
                aria-label="Dölj uppladdnings-chipsen"
                title="Dölj chipsen (📎-knappen visar dem igen)"
                className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#30363D] bg-[#0D1117] text-sm text-[#8B949E] transition-colors hover:border-[#58A6FF] hover:text-[#E6EDF3]"
              >
                ×
              </button>
            </div>
            <div className="mx-auto flex w-full max-w-3xl gap-1.5 overflow-x-auto px-3 pb-1.5 sm:px-4 [scrollbar-width:thin]">
              {uppladdningar.slice(0, 12).map((u) => (
                <button
                  key={u.sokvag}
                  onClick={() => infogaSokvag(u.sokvag, u.typ)}
                  title={`${u.sokvag} — klicka för att infoga i prompten`}
                  className="flex shrink-0 items-center gap-1.5 rounded-md border border-[#30363D] bg-[#0D1117] px-2.5 py-1 font-mono text-[11px] text-[#8B949E] transition-colors hover:border-[#58A6FF] hover:text-[#E6EDF3]"
                >
                  {u.typ === "bild" ? (
                    <FileImage className="h-3.5 w-3.5 text-[#8B949E]" />
                  ) : u.typ === "zip" ? (
                    <FileArchive className="h-3.5 w-3.5 text-[#8B949E]" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-[#8B949E]" />
                  )}
                  <span className="max-w-[160px] truncate">{u.sokvag.split("/").slice(2).join("/") || u.sokvag}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══ INPUT — STICKY BOTTOM (#0D1117, "Skriv här…", grön →-knapp).
            VÅG 96 D2 (c): studio-safe-bottom = env(safe-area-inset-bottom),
            text-base på mobil (16 px — iOS zoomar ej fältet vid fokus) och
            visualViewport-lyssnaren ovan håller fältet ovanför tangent-
            bordet. Auto-grow (hojdpassaYta) består. ══ */}
        <div className="studio-safe-bottom z-10 shrink-0 border-t border-[#30363D] bg-[#0D1117]">
          <div className="mx-auto w-full max-w-3xl px-3 py-2.5 sm:px-4 sm:py-3">
            {draÖver && (
              <div className="mb-2 rounded-md border-2 border-dashed border-[#58A6FF]/60 bg-[#58A6FF]/5 px-3 py-2 text-center text-xs text-[#58A6FF]">
                Släpp filerna här — de hamnar i uploads/ och agenten kan läsa dem
              </div>
            )}
            {/* VÅG 91 A3a: valda bilder — 64px thumbnails med X, bifogas nästa prompt. */}
            {valdaBilder.length > 0 && (
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {valdaBilder.map((sokvag) => (
                  <span key={sokvag} className="relative shrink-0">
                    <img
                      src={bildUrl(sokvag)}
                      alt={sokvag.split("/").pop() ?? sokvag}
                      loading="lazy"
                      className="h-16 w-16 cursor-pointer rounded-md border border-[#30363D] object-cover transition-opacity hover:opacity-90"
                      onClick={() => void visaFil(sokvag)}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.opacity = "0.25";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setValdaBilder((v) => v.filter((b) => b !== sokvag))}
                      title={`Ta bort ${sokvag.split("/").pop() ?? "bilden"} ur bilagorna`}
                      aria-label="Ta bort bilden"
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-[#30363D] bg-[#0D1117] text-[#8B949E] transition-colors hover:border-[#DA3633] hover:text-[#F85149]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <p className="min-w-0 text-[10px] leading-tight text-[#484F58]">
                  {valdaBilder.length} {valdaBilder.length === 1 ? "bild" : "bilder"} bifogas nästa prompt
                  <span className="mt-0.5 block">agenten ser dem direkt — ingen sökväg behövs i texten</span>
                </p>
              </div>
            )}
            <div className="relative">
              {/* Slash-autocomplete (våg 86 G1) — dropdown ovanför fältet. */}
              {slashSynlig && (
                <div
                  role="listbox"
                  aria-label="Kommandoautocomplete"
                  className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-md border border-[#30363D] bg-[#161B22] shadow-2xl"
                >
                  <ul className="max-h-48 overflow-y-auto py-1">
                    {slashPoster.map((k, i) => (
                      <li key={k.namn}>
                        <button
                          type="button"
                          ref={(el) => {
                            if (el) slashRadRefs.current.set(k.namn, el);
                            else slashRadRefs.current.delete(k.namn);
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                          onMouseEnter={() => setSlashIndex(i)}
                          onClick={() => valjSlash(k)}
                          className={cn(
                            "flex min-h-[52px] w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors sm:min-h-[44px]",
                            i === slashIndex ? "bg-[#58A6FF]/10" : "hover:bg-[#0D1117]",
                          )}
                        >
                          <span className="shrink-0 font-mono text-sm text-[#3FB950]" aria-hidden>$</span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-mono text-xs font-semibold text-[#E6EDF3]">{k.syntax}</span>
                            <span className="block truncate text-[11px] leading-snug text-[#8B949E]">{k.beskrivning}</span>
                          </span>
                          <span className="shrink-0 rounded-full border border-[#30363D] px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-[#8B949E]">
                            {k.kalla === "api" ? "API" : "lokal"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="border-t border-[#30363D] px-3 py-1.5 text-[10px] text-[#8B949E]">
                    ↑↓ välj · Enter infogar + kör · Tab fyller i · Esc stänger
                  </p>
                </div>
              )}

              {/* Promptbiblioteket ⭐ (våg 86 G2). */}
              {prompterOppen && (
                <>
                  <div className="fixed inset-0 z-10" aria-hidden onClick={() => setPrompterOppen(false)} />
                  <div
                    role="dialog"
                    aria-label="Promptbiblioteket"
                    className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-md border border-[#30363D] bg-[#161B22] shadow-2xl"
                  >
                    <div className="flex items-center gap-2 border-b border-[#30363D] px-3 py-2">
                      <Star className="h-3.5 w-3.5 shrink-0 text-[#D29922]" />
                      <span className="min-w-0 flex-1 truncate text-[11px] font-semibold uppercase tracking-wider text-[#8B949E]">
                        Promptbiblioteket{prompter.length > 0 ? ` — ${Math.min(prompter.length, 10)} av ${prompter.length}` : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPrompterOppen(false)}
                        title="Stäng (Esc)"
                        aria-label="Stäng promptbiblioteket"
                        className="rounded-md p-1 text-[#8B949E] transition-colors hover:bg-[#0D1117] hover:text-[#E6EDF3]"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {prompter.length === 0 ? (
                      <p className="px-3 py-3 text-xs leading-relaxed text-[#8B949E]">
                        Inga sparade prompts än — skriv något i fältet och tryck ⭐ (eller kör{" "}
                        <span className="font-mono text-[#E6EDF3]">/sparad din text</span>) för att spara det här.
                      </p>
                    ) : (
                      <ul className="max-h-48 overflow-y-auto py-1">
                        {prompter.slice(0, 10).map((p, i) => (
                          <li key={`${p.skapad}-${i}`} className="flex items-stretch">
                            <button
                              type="button"
                              onClick={() => {
                                historikIndexRef.current = null;
                                setPrompt(p.text);
                                setPrompterOppen(false);
                                ytaRef.current?.focus();
                              }}
                              title={p.text}
                              className="flex min-h-[52px] min-w-0 flex-1 items-center px-3 py-2 text-left transition-colors hover:bg-[#0D1117] sm:min-h-[44px]"
                            >
                              <span className="line-clamp-2 min-w-0 flex-1 whitespace-pre-wrap break-words text-xs leading-snug text-[#E6EDF3]">
                                {p.text}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => tabortPrompt(p.skapad)}
                              title="Ta bort prompten ur biblioteket"
                              aria-label="Ta bort prompten"
                              className="flex w-11 shrink-0 items-center justify-center text-[#8B949E] transition-colors hover:bg-[#DA3633]/10 hover:text-[#F85149]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="border-t border-[#30363D] px-3 py-1.5 text-[10px] text-[#8B949E]">
                      klicka = infoga i skrivfältet · papperskorg = ta bort — sista 10 visas
                    </p>
                  </div>
                </>
              )}

              {/* 📎-menyn (VÅG 90): Fil / Mapp-uppladdning. */}
              {uploadMenyOppen && (
                <>
                  <div className="fixed inset-0 z-10" aria-hidden onClick={() => setUploadMenyOppen(false)} />
                  <div
                    role="menu"
                    aria-label="Ladda upp"
                    className="absolute bottom-full left-0 z-20 mb-2 w-48 overflow-hidden rounded-md border border-[#30363D] bg-[#161B22] shadow-2xl"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setUploadMenyOppen(false);
                        filInputRef.current?.click();
                      }}
                      className="flex min-h-[52px] w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-[#E6EDF3] transition-colors hover:bg-[#0D1117] sm:min-h-11"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-[#8B949E]" />
                      Fil…
                      <span className="ml-auto text-[10px] text-[#484F58]">png/pdf/zip/md</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadMenyOppen(false);
                        mappInputRef.current?.click();
                      }}
                      className="flex min-h-[52px] w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-[#E6EDF3] transition-colors hover:bg-[#0D1117] sm:min-h-11"
                    >
                      <FolderTree className="h-4 w-4 shrink-0 text-[#8B949E]" />
                      Mapp…
                      <span className="ml-auto text-[10px] text-[#484F58]">strukturen följer med</span>
                    </button>
                  </div>
                </>
              )}

              {/* Själva raden: 📎 + textarea + ⭐ + STOR skicka-knapp. */}
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadMenyOppen((v) => !v)}
                  title="Ladda upp fil eller mapp"
                  aria-label="Ladda upp"
                  aria-expanded={uploadMenyOppen}
                  className="flex h-[52px] w-11 shrink-0 items-center justify-center sm:h-11 sm:w-11 rounded-md border border-[#30363D] text-[#8B949E] transition-colors hover:border-[#58A6FF] hover:text-[#E6EDF3]"
                >
                  {laddarUpp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                </button>
                <textarea
                  ref={ytaRef}
                  value={prompt}
                  maxLength={2000}
                  onChange={(e) => {
                    historikIndexRef.current = null;
                    setPrompt(e.target.value);
                    hojdpassaYta(e.target);
                  }}
                  onFocus={() => {
                    setPlaceholderIx((i) => (i + 1) % SKRIV_PLACEHOLDERS.length);
                  }}
                  onPaste={(e) => void påPaste(e)}
                  onKeyDown={(e) => {
                    if (slashSynlig) {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setSlashIndex((i) => Math.min(i + 1, slashPoster.length - 1));
                        return;
                      }
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setSlashIndex((i) => Math.max(i - 1, 0));
                        return;
                      }
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        const k = slashPoster[slashIndex];
                        if (k) valjSlash(k);
                        return;
                      }
                      if (e.key === "Tab") {
                        e.preventDefault();
                        const k = slashPoster[slashIndex];
                        if (k) kompletteraSlash(k);
                        return;
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        e.stopPropagation();
                        setSlashStangd(true);
                        return;
                      }
                    }
                    if (e.key === "ArrowUp" && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
                      if (blattraHistorik(1)) e.preventDefault();
                      return;
                    }
                    if (e.key === "ArrowDown" && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
                      if (blattraHistorik(-1)) e.preventDefault();
                      return;
                    }
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void skicka();
                    }
                  }}
                  rows={1}
                  placeholder={SKRIV_PLACEHOLDERS[placeholderIx]}
                  title="Enter skickar · Skift+Enter ny rad · / visar kommandon · ↑ återkallar senaste prompten"
                  className="min-h-[52px] flex-1 resize-none rounded-md border border-[#30363D] bg-[#0D1117] px-3.5 py-2.5 text-base leading-relaxed text-[#E6EDF3] outline-none transition-colors placeholder:text-[#484F58] focus:border-[#58A6FF] sm:min-h-11 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (prompt.trim()) {
                      if (sparaPrompt(prompt)) visaToast("Prompten sparad i biblioteket ⭐ — öppna med ⭐ i tomt fält.");
                    } else {
                      oppnaPrompter();
                    }
                  }}
                  title={prompt.trim() ? "Spara prompten i biblioteket ⭐" : "Öppna promptbiblioteket ⭐"}
                  aria-label="Promptbiblioteket"
                  className="flex h-[52px] w-11 shrink-0 items-center justify-center sm:h-11 sm:w-11 rounded-md border border-[#30363D] text-[#8B949E] transition-colors hover:border-[#D29922] hover:text-[#D29922]"
                >
                  <Star className="h-4 w-4" />
                </button>
                {strömmar ? (
                  <button
                    type="button"
                    onClick={stoppa}
                    title="Stoppa agenten"
                    aria-label="Stoppa agenten"
                    className="flex h-[52px] w-11 shrink-0 items-center justify-center sm:h-11 sm:w-11 rounded-md bg-[#DA3633] p-0 text-white transition-colors hover:bg-[#B62324]"
                  >
                    <CircleStop className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void skicka()}
                    disabled={!prompt.trim()}
                    title="Skicka (Enter)"
                    aria-label="Skicka"
                    className="flex h-[52px] w-12 shrink-0 items-center justify-center rounded-md bg-[#238636] p-0 text-white transition-colors hover:bg-[#2EA043] disabled:opacity-40 sm:h-11 sm:w-12"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                )}
              </div>
              {/* Teckenräknare (gul ≥ 1800, röd vid taket). */}
              {prompt.length > 1600 && (
                <p
                  className={cn(
                    "mt-1 text-right font-mono text-[10px] tabular-nums",
                    prompt.length >= 2000 ? "text-[#F85149]" : "text-[#D29922]",
                  )}
                  aria-live="polite"
                >
                  {prompt.length}/2000
                </p>
              )}
            </div>
            {/* Dolda filinmatningar (drag/paste/📎/empty-state använder dom). */}
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
                const relativa = filer.map(
                  (f) => (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name,
                );
                if (filer.length) void laddaUpp(filer, relativa);
                input.value = "";
              }}
            />
          </div>
        </div>
      </div>

      {/* ══ VÅG 90 K4: HÖGER PANEL (300px, #0D1117) — MÅL · KONTEXT · TERMINAL ══ */}
      <aside
        aria-label="Mål, kontext och terminal"
        className={cn(
          "hidden w-[300px] shrink-0 flex-col border-l border-[#30363D] bg-[#0D1117] lg:flex",
          !panelOppen && "lg:hidden",
        )}
      >
        {/* MÅL — checklist (□/☑) + progress + kontroller. */}
        <section aria-label="Mål" className="border-b border-[#30363D]">
          <p className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B949E]">
            <Target className="h-3.5 w-3.5 shrink-0" />
            Mål
            {malKör && (
              <span className="ml-auto rounded-full bg-[#238636]/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#3FB950]" title={`Autonom iteration ${malIteration} kör`}>
                AKTIVT · {malIteration}
              </span>
            )}
            {malPausat && (
              <span className="ml-auto rounded-full bg-[#D29922]/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#D29922]">
                PAUSAT
              </span>
            )}
          </p>
          <div className="px-3 pb-3">
            {mal ? (
              <>
                <p className="line-clamp-3 text-xs leading-relaxed text-[#E6EDF3]" title={mal}>
                  {mal}
                </p>
                {/* Checklist: färdiga iterationer ☑ + pågående □ (äkta loop-data). */}
                <ul className="mt-2 space-y-1">
                  {Array.from({ length: Math.min(malIteration, 12) }, (_, i) => i + 1).map((n) => (
                    <li key={`klar-${n}`} className="flex items-center gap-2 text-[11px] text-[#8B949E]">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-[#238636] bg-[#238636] text-white" aria-hidden>
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="font-mono">Iteration {n}</span>
                      <span className="ml-auto text-[9px] text-[#484F58]">klar</span>
                    </li>
                  ))}
                  {malKör && (
                    <li className="flex items-center gap-2 text-[11px] text-[#D29922]">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-[#D29922]" aria-hidden>
                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      </span>
                      <span className="font-mono">Iteration {malIteration + 1}</span>
                      <span className="ml-auto text-[9px] text-[#484F58]">pågår…</span>
                    </li>
                  )}
                </ul>
                {/* Progress-rad: iterationer · tokens (spec: "5/5 · 2m · 89K tokens"). */}
                <p className="mt-2 font-mono text-[10px] tabular-nums text-[#8B949E]">
                  {malIteration > 0 ? `${malIteration}${malKör ? `/${malIteration + 1}` : ""} iter` : "startar…"}
                  {" · "}
                  {tkn(ackumulerat)} tkn
                  {kontextProcent !== null && ` · ${kontextProcent.toFixed(0)}%`}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {malSparar || malPausar ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#58A6FF]" />
                  ) : malKör ? (
                    <button
                      onClick={() => void pausaMal()}
                      title="Pausa målet (session/stop) — den pågående iterationen avbryts"
                      className="min-h-9 rounded-md border border-[#D29922]/50 px-2.5 text-[11px] font-semibold text-[#D29922] transition-colors hover:bg-[#D29922]/10"
                    >
                      Pausa
                    </button>
                  ) : malPausat ? (
                    <button
                      onClick={() => void aterupptaMal()}
                      title="Återuppta målet (session/goal resume) — agenten fortsätter mot målet"
                      className="min-h-9 rounded-md border border-[#238636]/60 px-2.5 text-[11px] font-semibold text-[#3FB950] transition-colors hover:bg-[#238636]/10"
                    >
                      Återuppta
                    </button>
                  ) : null}
                  <button
                    onClick={oppnaMalDialog}
                    title="Redigera målet (mål-dialogen — session/goal set)"
                    className="flex min-h-9 items-center gap-1 rounded-md border border-[#30363D] px-2.5 text-[11px] font-semibold text-[#E6EDF3] transition-colors hover:bg-[#161B22]"
                  >
                    <Pencil className="h-3 w-3" />
                    Redigera
                  </button>
                  <button
                    onClick={() => void rensaMaler()}
                    disabled={malSparar}
                    title="Rensa målet (session/goal clear)"
                    className="flex min-h-9 items-center gap-1 rounded-md border border-[#DA3633]/40 px-2.5 text-[11px] font-semibold text-[#F85149] transition-colors hover:bg-[#DA3633]/10 disabled:opacity-50"
                  >
                    <X className="h-3 w-3" />
                    Rensa
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-[11px] leading-relaxed text-[#8B949E]">
                  Inget mål satt — agenten arbetar bara när du chattar.
                </p>
                <button
                  onClick={() => setMalDialogOppen(true)}
                  className="mt-2 flex min-h-9 w-full items-center justify-center gap-1.5 rounded-md bg-[#238636] px-3 text-[11px] font-bold text-white transition-colors hover:bg-[#2EA043]"
                  title="Öppna mål-dialogen — beskriv utvecklingsmålet och starta autonom loop"
                >
                  <Target className="h-3.5 w-3.5" />
                  Sätt ett mål
                </button>
              </>
            )}
          </div>
        </section>

        {/* ORGANISMEN (våg 114) — kundens kontrollrum i studion: evolutionen
            + 24/7-pumparnas puls (registret live ur /api/admin/organ).
            VÅG 125 — OBSERVATORIET: LIVE-knappen strömmar mål-arbetets
            händelser (iterationer, verktyg, resonemang) i realtid här. */}
        <section aria-label="Organismen" className="border-b border-[#30363D]">
          <p className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B949E]">
            <Dna className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Organismen
            <button
              onClick={() => setLivePa((p) => !p)}
              title={livePa ? "Stäng direktsändningen" : "Följ utvecklingen LIVE — varje verktyg och iteration i realtid"}
              className={
                "ml-auto flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold transition-colors " +
                (livePa
                  ? "border-[#F85149]/60 bg-[#F85149]/10 text-[#F85149]"
                  : "border-[#30363D] text-[#8B949E] hover:border-[#58A6FF] hover:text-[#E6EDF3]")
              }
            >
              {livePa ? "● LIVE — stäng" : "▶ FÖLJ LIVE"}
            </button>
          </p>
          {livePa && (
            <div className="mx-3 mb-2 rounded-md border border-[#30363D] bg-[#0D1117] p-2">
              {liveFeed.length === 0 ? (
                <p className="animate-pulse font-mono text-[10px] text-[#8B949E]">
                  ansluter till organismens direktsändning…
                </p>
              ) : (
                <ul className="space-y-0.5">
                  {liveFeed.map((h, i) => (
                    <li
                      key={h.ts + "-" + i}
                      className={"font-mono text-[10px] leading-snug " + (i === liveFeed.length - 1 ? "text-[#E6EDF3]" : "text-[#8B949E]")}
                    >
                      {h.rad}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className="px-3 pb-3">
            {organism ? (
              <>
                <p className="font-mono text-[10px] leading-relaxed text-[#8B949E]">
                  Rond {organism.rond} · {organism.aktiva.length}/12 aktiva
                  {organism.döda.length > 0 && ` · döda: ${organism.döda.join(" ")}`}
                </p>
                <p className="mt-1 flex flex-wrap gap-1" aria-label="Aktiva organ">
                  {organism.aktiva.map((o) => (
                    <span
                      key={o.bokstav}
                      title={`${o.namn} — ${o.lev} leveranser senaste ronden`}
                      className={
                        "inline-flex h-5 min-w-5 items-center justify-center rounded border px-1 font-mono text-[10px] font-bold tabular-nums " +
                        (o.lev > 0
                          ? "border-[#D29922]/60 text-[#E3B341]"
                          : "border-[#30363D] text-[#8B949E]")
                      }
                    >
                      {o.bokstav}
                    </span>
                  ))}
                </p>
                <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-[#8B949E]">
                  {organism.basta && `Bäst: ${organism.basta}`}
                  {organism.ekonomi?.tokensPerLeverans
                    ? ` · ${organism.ekonomi.tokensPerLeverans.toLocaleString("sv-SE")} tkn/leverans`
                    : ""}
                  {organism.kostnadTotal !== null
                    ? ` · Σ ${(organism.kostnadTotal / 1_000_000).toFixed(1)}M tkn totalt`
                    : ""}
                </p>
                {organism.pumpRad && (
                  <p
                    className="mt-1.5 truncate font-mono text-[10px] text-[#30363D]"
                    style={{ color: "#6E7681" }}
                    title={organism.pumpRad}
                  >
                    ⟳ {organism.pumpRad}
                  </p>
                )}
                {organism.landningar.length > 0 && (
                  <div className="mt-2 border-t border-[#21262D] pt-2">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8B949E]">
                      Senaste landningar
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {organism.landningar.slice(0, 5).map((l) => (
                        <li
                          key={l.hash}
                          title={l.amne}
                          className="flex items-baseline gap-1.5 font-mono text-[10px] leading-snug"
                        >
                          <span className="shrink-0 text-[#3FB950]">{l.hash.slice(0, 7)}</span>
                          <span className="shrink-0 text-[#6E7681]">{l.tid.slice(5)}</span>
                          <span className="min-w-0 truncate text-[#8B949E]">{l.amne}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="font-mono text-[10px] text-[#8B949E]">läser registret…</p>
            )}
          </div>
        </section>

        {/* KONTEXT — modell + tokens + komprimera-knapp. */}
        <section aria-label="Kontext" className="border-b border-[#30363D]">
          <p className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B949E]">
            <Activity className="h-3.5 w-3.5 shrink-0" />
            Kontext
          </p>
          <div className="px-3 pb-3">
            <p className="truncate font-mono text-[11px] text-[#E6EDF3]" title={kontext?.modell ?? valdModell}>
              {kontext?.modell ?? (valdModell || "— ingen modell ännu")}
            </p>
            <p className="mt-1 font-mono text-[10px] tabular-nums leading-relaxed text-[#8B949E]">
              {rundaTkn !== null ? `${tkn(rundaTkn)} tkn denna runda · ` : ""}
              {tkn(ackumulerat)} totalt
              {kontextProcent !== null && ` · ${kontextProcent.toFixed(kontextProcent < 10 ? 1 : 0)}% av ${tkn(kontextTak)}`}
            </p>
            {kontextProcent !== null && (
              <span className="relative mt-1.5 block h-1.5 overflow-hidden rounded-full bg-[#21262D]" aria-hidden>
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-all",
                    kontextProcent >= KONTEXT_VARNING_PROCENT ? "bg-[#D29922]" : "bg-[#3FB950]",
                  )}
                  style={{ width: `${Math.min(100, kontextProcent)}%` }}
                />
              </span>
            )}
            <button
              onClick={() => void komprimera()}
              disabled={sessionJobbar !== "" || strömmarHuvud || !arHuvudAktiv}
              title="Komprimera kontexten (session/compact — agenten sammanfattar och fönstret frias)"
              className="mt-2 flex min-h-9 w-full items-center justify-center gap-1.5 rounded-md border border-[#238636]/50 px-3 text-[11px] font-semibold text-[#3FB950] transition-colors hover:bg-[#238636]/10 disabled:opacity-50"
            >
              {sessionJobbar === "compact" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shrink className="h-3.5 w-3.5" />}
              Komprimera
            </button>
            <p className="mt-1.5 text-[9px] leading-relaxed text-[#484F58]">
              {lage ? `Läge ${lage}` : "Läser läge…"}
              {tanka ? ` · tanke ${tanka}` : ""} · komprimering gäller huvudsessionen.
            </p>
          </div>
        </section>

        {/* TERMINAL — senaste verktygskörningar (mini-terminal). */}
        <section aria-label="Terminal" className="flex min-h-0 flex-1 flex-col">
          <p className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B949E]">
            <Terminal className="h-3.5 w-3.5 shrink-0" />
            Terminal
            <span className="ml-auto font-mono text-[9px] font-normal text-[#484F58]">senaste verktyg</span>
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto bg-[#010409] px-2 py-2 font-mono text-[10px] leading-relaxed [scrollbar-width:thin]">
            {senasteVerktyg.length === 0 ? (
              <p className="px-1 text-[#484F58]">
                <span className="text-[#3FB950]">$</span> väntar på verktyg…
              </p>
            ) : (
              <ul className="space-y-1">
                {senasteVerktyg.map(({ kort, iteration }) => (
                  <li
                    key={kort.id}
                    className={cn(
                      "flex items-start gap-1.5 rounded-sm px-1 py-0.5",
                      kort.steg === "fel" && "bg-[#DA3633]/10",
                    )}
                    title={`${kortRubrik(kort)}${kort.varaktighetMs ? ` · ${msText(kort.varaktighetMs)}` : ""}${iteration ? ` · autonom iteration ${iteration}` : ""}`}
                  >
                    <span className="shrink-0 text-[#3FB950]" aria-hidden>
                      $
                    </span>
                    <span className="min-w-0 flex-1 break-all text-[#8B949E]">
                      {kort.namn}: {(kort.argument ?? kort.beskrivning ?? "").replace(/[{}"]/g, "").slice(0, 60) || "…"}
                    </span>
                    <span className="shrink-0" aria-hidden>
                      {kort.steg === "fel" ? (
                        <span className="text-[#F85149]">✗</span>
                      ) : kort.steg === "resultat" ? (
                        <span className="text-[#3FB950]">✓</span>
                      ) : (
                        <span className="inline-block h-2.5 w-2.5 animate-spin rounded-sm border border-[#D29922] border-t-transparent" />
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* VÅG 91 A3c + VÅG 92 B3: TJÄNSTE-PANELER — kollapsbara sektioner under
            TERMINAL (BAKGRUNDSKORT · WEBBLÄSARE · AUTOMATION; dolda om 501). */}
        <TjansteSektioner
          tjanster={tjanster}
          onVaxla={(namn, oppenEfter) => vaxlaTjanste(namn, oppenEfter)}
          onAvbryt={(id) => void avbrytBakgrundsjobb(id)}
          avbryterId={avbryterJobb}
          webblasare={{
            url: webUrl,
            setUrl: setWebUrl,
            kor: () => void oppnaWebbsida(),
            korPaga: webKorPaga,
            meddelande: webMeddelande,
            resultat: webResultat,
            sidor: webSidor,
            oppnaSida: (url) => void oppnaWebbsida(url),
          }}
          automation={{
            namn: autoNamn,
            setNamn: setAutoNamn,
            schema: autoSchema,
            setSchema: setAutoSchema,
            prompt: autoPrompt,
            setPrompt: setAutoPrompt,
            formOppen: autoFormOppen,
            vaxlaForm: setAutoFormOppen,
            skapar: autoSkapar,
            skapa: () => void skapaAutomation(),
            pausa: (id, aktiveradEfter) => void vaxlaAutomationPaus(id, aktiveradEfter),
            radera: (id, namn) => void raderaAutomation(id, namn),
            jobbarId: autoJobbarId,
          }}
        />
      </aside>

      {/* ══ MOBIL: höger panelen som drawer (PanelRight-knappen i headern) ══ */}
      {mobilPanel && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setMobilPanel(false)}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-label="Mål, kontext och terminal"
            className="fixed inset-y-0 right-0 z-50 flex w-[300px] max-w-[88vw] flex-col border-l border-[#30363D] bg-[#0D1117] shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-[#30363D] px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8B949E]">
                Mål · Kontext · Terminal
              </p>
              <button
                onClick={() => setMobilPanel(false)}
                title="Stäng (Esc)"
                aria-label="Stäng panelen"
                className="flex h-[52px] w-11 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:h-9 sm:w-9"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              {/* Samma sektioner som desktop-panelen (ovan) — återanvänd via kopia
                  är ogörlig i JSX; sektionerna nedan är identiska i innehåll. */}
              <section aria-label="Mål" className="border-b border-[#30363D]">
                <p className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B949E]">
                  <Target className="h-3.5 w-3.5 shrink-0" />
                  Mål
                  {malKör && (
                    <span className="ml-auto rounded-full bg-[#238636]/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#3FB950]">
                      AKTIVT · {malIteration}
                    </span>
                  )}
                  {malPausat && (
                    <span className="ml-auto rounded-full bg-[#D29922]/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#D29922]">
                      PAUSAT
                    </span>
                  )}
                </p>
                <div className="px-3 pb-3">
                  {mal ? (
                    <>
                      <p className="line-clamp-3 text-xs leading-relaxed text-[#E6EDF3]" title={mal}>
                        {mal}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {Array.from({ length: Math.min(malIteration, 12) }, (_, i) => i + 1).map((n) => (
                          <li key={`m-klar-${n}`} className="flex items-center gap-2 text-[11px] text-[#8B949E]">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-[#238636] bg-[#238636] text-white" aria-hidden>
                              <Check className="h-3 w-3" />
                            </span>
                            <span className="font-mono">Iteration {n}</span>
                            <span className="ml-auto text-[9px] text-[#484F58]">klar</span>
                          </li>
                        ))}
                        {malKör && (
                          <li className="flex items-center gap-2 text-[11px] text-[#D29922]">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-[#D29922]" aria-hidden>
                              <Loader2 className="h-2.5 w-2.5 animate-spin" />
                            </span>
                            <span className="font-mono">Iteration {malIteration + 1}</span>
                            <span className="ml-auto text-[9px] text-[#484F58]">pågår…</span>
                          </li>
                        )}
                      </ul>
                      <p className="mt-2 font-mono text-[10px] tabular-nums text-[#8B949E]">
                        {malIteration > 0 ? `${malIteration}${malKör ? `/${malIteration + 1}` : ""} iter` : "startar…"}
                        {" · "}
                        {tkn(ackumulerat)} tkn
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {malKör ? (
                          <button
                            onClick={() => void pausaMal()}
                            disabled={malPausar}
                            className="min-h-[52px] rounded-md border border-[#D29922]/50 px-3 text-xs font-semibold text-[#D29922] transition-colors hover:bg-[#D29922]/10 disabled:opacity-50 sm:min-h-11"
                          >
                            Pausa
                          </button>
                        ) : malPausat ? (
                          <button
                            onClick={() => void aterupptaMal()}
                            disabled={malPausar}
                            className="min-h-[52px] rounded-md border border-[#238636]/60 px-3 text-xs font-semibold text-[#3FB950] transition-colors hover:bg-[#238636]/10 disabled:opacity-50 sm:min-h-11"
                          >
                            Återuppta
                          </button>
                        ) : null}
                        <button
                          onClick={oppnaMalDialog}
                          className="flex min-h-[52px] items-center gap-1 rounded-md border border-[#30363D] px-3 text-xs font-semibold text-[#E6EDF3] transition-colors hover:bg-[#161B22] sm:min-h-11"
                        >
                          <Pencil className="h-3 w-3" />
                          Redigera
                        </button>
                        <button
                          onClick={() => void rensaMaler()}
                          disabled={malSparar}
                          className="flex min-h-[52px] items-center gap-1 rounded-md border border-[#DA3633]/40 px-3 text-xs font-semibold text-[#F85149] transition-colors hover:bg-[#DA3633]/10 disabled:opacity-50 sm:min-h-11"
                        >
                          <X className="h-3 w-3" />
                          Rensa
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-[11px] leading-relaxed text-[#8B949E]">
                        Inget mål satt — agenten arbetar bara när du chattar.
                      </p>
                      <button
                        onClick={() => setMalDialogOppen(true)}
                        className="mt-2 flex min-h-[52px] w-full items-center justify-center gap-1.5 rounded-md bg-[#238636] px-3 text-xs font-bold text-white transition-colors hover:bg-[#2EA043] sm:min-h-11"
                      >
                        <Target className="h-3.5 w-3.5" />
                        Sätt ett mål
                      </button>
                    </>
                  )}
                </div>
              </section>
              <section aria-label="Kontext" className="border-b border-[#30363D]">
                <p className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B949E]">
                  <Activity className="h-3.5 w-3.5 shrink-0" />
                  Kontext
                </p>
                <div className="px-3 pb-3">
                  <p className="truncate font-mono text-[11px] text-[#E6EDF3]">
                    {kontext?.modell ?? (valdModell || "— ingen modell ännu")}
                  </p>
                  <p className="mt-1 font-mono text-[10px] tabular-nums leading-relaxed text-[#8B949E]">
                    {rundaTkn !== null ? `${tkn(rundaTkn)} tkn denna runda · ` : ""}
                    {tkn(ackumulerat)} totalt
                    {kontextProcent !== null && ` · ${kontextProcent.toFixed(kontextProcent < 10 ? 1 : 0)}% av ${tkn(kontextTak)}`}
                  </p>
                  {kontextProcent !== null && (
                    <span className="relative mt-1.5 block h-1.5 overflow-hidden rounded-full bg-[#21262D]" aria-hidden>
                      <span
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-full transition-all",
                          kontextProcent >= KONTEXT_VARNING_PROCENT ? "bg-[#D29922]" : "bg-[#3FB950]",
                        )}
                        style={{ width: `${Math.min(100, kontextProcent)}%` }}
                      />
                    </span>
                  )}
                  <button
                    onClick={() => void komprimera()}
                    disabled={sessionJobbar !== "" || strömmarHuvud || !arHuvudAktiv}
                    className="mt-2 flex min-h-[52px] w-full items-center justify-center gap-1.5 rounded-md border border-[#238636]/50 px-3 text-xs font-semibold text-[#3FB950] transition-colors hover:bg-[#238636]/10 disabled:opacity-50 sm:min-h-11"
                  >
                    {sessionJobbar === "compact" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shrink className="h-4 w-4" />}
                    Komprimera
                  </button>
                </div>
              </section>
              <section aria-label="Terminal" className="flex min-h-0 flex-1 flex-col">
                <p className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B949E]">
                  <Terminal className="h-3.5 w-3.5 shrink-0" />
                  Terminal
                </p>
                <div className="min-h-0 flex-1 overflow-y-auto bg-[#010409] px-2 py-2 font-mono text-[10px] leading-relaxed">
                  {senasteVerktyg.length === 0 ? (
                    <p className="px-1 text-[#484F58]">
                      <span className="text-[#3FB950]">$</span> väntar på verktyg…
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {senasteVerktyg.map(({ kort }) => (
                        <li
                          key={`m-${kort.id}`}
                          className={cn("flex items-start gap-1.5 rounded-sm px-1 py-0.5", kort.steg === "fel" && "bg-[#DA3633]/10")}
                          title={kortRubrik(kort)}
                        >
                          <span className="shrink-0 text-[#3FB950]" aria-hidden>
                            $
                          </span>
                          <span className="min-w-0 flex-1 break-all text-[#8B949E]">
                            {kort.namn}: {(kort.argument ?? kort.beskrivning ?? "").replace(/[{}"]/g, "").slice(0, 60) || "…"}
                          </span>
                          <span className="shrink-0" aria-hidden>
                            {kort.steg === "fel" ? (
                              <span className="text-[#F85149]">✗</span>
                            ) : kort.steg === "resultat" ? (
                              <span className="text-[#3FB950]">✓</span>
                            ) : (
                              <span className="inline-block h-2.5 w-2.5 animate-spin rounded-sm border border-[#D29922] border-t-transparent" />
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
              {/* VÅG 91 A3c + VÅG 92 B3: tjänste-paneler — samma sektioner som desktop-panelen. */}
              <TjansteSektioner
                tjanster={tjanster}
                onVaxla={(namn, oppenEfter) => vaxlaTjanste(namn, oppenEfter)}
                onAvbryt={(id) => void avbrytBakgrundsjobb(id)}
                avbryterId={avbryterJobb}
                webblasare={{
                  url: webUrl,
                  setUrl: setWebUrl,
                  kor: () => void oppnaWebbsida(),
                  korPaga: webKorPaga,
                  meddelande: webMeddelande,
                  resultat: webResultat,
                  sidor: webSidor,
                  oppnaSida: (url) => void oppnaWebbsida(url),
                }}
                automation={{
                  namn: autoNamn,
                  setNamn: setAutoNamn,
                  schema: autoSchema,
                  setSchema: setAutoSchema,
                  prompt: autoPrompt,
                  setPrompt: setAutoPrompt,
                  formOppen: autoFormOppen,
                  vaxlaForm: setAutoFormOppen,
                  skapar: autoSkapar,
                  skapa: () => void skapaAutomation(),
                  pausa: (id, aktiveradEfter) => void vaxlaAutomationPaus(id, aktiveradEfter),
                  radera: (id, namn) => void raderaAutomation(id, namn),
                  jobbarId: autoJobbarId,
                }}
              />
            </div>
          </aside>
        </>
      )}

      {/* MINNE-PANEL (våg 84 D) — ytan i studio-minne-panel.tsx. */}
      <StudioMinnePanel
        oppen={visaMinne}
        stang={() => setVisaMinne(false)}
        lasa={lasMinne}
        filer={minneFiler}
        laddar={minneLaddar}
        fel={minneFel}
        rotVisning={minneRotVisning}
        vald={minneVald}
        detaljLaddar={minneDetaljLaddar}
        redigerar={minneRedigerar}
        text={minneText}
        sparar={minneSparar}
        raderar={minneRaderar}
        ny={minneNy}
        nyttNamn={minneNyttNamn}
        setVald={setMinneVald}
        setRedigerar={setMinneRedigerar}
        setText={setMinneText}
        setNy={setMinneNy}
        setNyttNamn={setMinneNyttNamn}
        oppnaFil={oppnaMinnesfil}
        spara={sparaMinnesfil}
        radera={raderaMinnesfil}
      />

      {/* FÄRDIGHETER-PANEL (våg 85 F2) — ytan i studio-fardigheter-panel.tsx.
          VÅG 93 C3: vaxlaPlugin aktiverar plugin-brytarna (POST /api/studio/
          fardigheter) — logiken + statet ägs här, panelen är presentationsyta. */}
      <StudioFardigheterPanel
        oppen={visaFardigheter}
        stang={() => setVisaFardigheter(false)}
        lasa={lasFardigheter}
        laddar={fardigheterLaddar}
        fel={fardigheterFel}
        skills={fardigheterSkills}
        plugins={fardigheterPlugins}
        mcp={fardigheterMcp}
        mcpVerktyg={fardigheterVerktyg}
        vaxlaPlugin={(id, aktiverad) => void vaxlaPlugin(id, aktiverad)}
        pluginVaxlarId={pluginVaxlar}
      />

      {/* VERKTYG-PANEL (våg 88 I2) — admin-kommandon, egen yta + state. */}
      <StudioAdminPanel
        oppen={visaAdmin}
        stang={() => setVisaAdmin(false)}
        oppnaMinne={() => {
          setVisaAdmin(false);
          oppnaMinne();
        }}
      />

      {/* FILTRÄDSDRAWER (våg 83 B4) — agentens arbetsyta. */}
      {visaFiler && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50"
            onClick={() => setVisaFiler(false)}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-label="Filträd över agentens arbetsyta"
            className="fixed right-0 top-0 z-40 flex h-[100dvh] w-full max-w-[380px] flex-col border-l border-[#30363D] bg-[#0D1117] shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-[#30363D] px-3 py-2.5">
              <FolderTree className="h-4 w-4 shrink-0 text-[#8B949E]" />
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-[#E6EDF3]">Filträdet</h2>
                <p className="truncate font-mono text-[10px] text-[#8B949E]">
                  {arbetsytaNamn ? `~/${arbetsytaNamn}` : "agentens arbetsyta"}
                </p>
              </div>
              <button
                onClick={() => void lasTrad(true)}
                disabled={tradLaddar}
                title="Uppdatera trädet"
                aria-label="Uppdatera trädet"
                className="flex h-[52px] w-11 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:h-9 sm:w-9 disabled:opacity-50"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", tradLaddar && "animate-spin")} />
              </button>
              <button
                onClick={() => setVisaFiler(false)}
                title="Stäng (Esc)"
                aria-label="Stäng filträdet"
                className="flex h-[52px] w-11 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:h-9 sm:w-9"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-1.5 py-2 [scrollbar-width:thin]">
              {tradLaddar && !trad && (
                <div className="flex items-center gap-2 px-2 py-3 text-[11px] text-[#8B949E]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#58A6FF]" />
                  Läser arbetsytan…
                </div>
              )}
              {tradFel && <p className="px-2 py-3 text-[11px] text-[#F85149]">{tradFel}</p>}
              {trad && trad.length === 0 && !tradLaddar && (
                <p className="px-2 py-3 text-[11px] text-[#8B949E]">Arbetsytan är tom.</p>
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
                <p className="mt-2 border-t border-[#21262D] px-2 pt-2 text-[10px] leading-relaxed text-[#484F58]">
                  Trädet är avkortat vid 500 noder (maxdjup 3) — node_modules/.next/.git/uploads
                  visas aldrig. Övriga filer når agenten via chatten.
                </p>
              )}
            </div>

            {/* Uploads-sektion: datum + töm-knapp. */}
            <div className="border-t border-[#30363D] px-3 py-2.5">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8B949E]">
                  Uploads {uppladdningar.length > 0 && `(${uppladdningar.length}${uppladdningar.length >= 50 ? "+" : ""})`}
                </p>
                <button
                  onClick={() => void tomUploads()}
                  disabled={tommerUploads || uppladdningar.length === 0}
                  title="Töm uploads — filer äldre än 7 dagar rensas annars automatiskt"
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] text-[#F85149] transition-colors hover:bg-[#DA3633]/10 disabled:opacity-40"
                >
                  {tommerUploads ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  Töm uploads
                </button>
              </div>
              {uppladdningar.length === 0 ? (
                <p className="text-[10px] leading-relaxed text-[#484F58]">
                  Inga filer de senaste 7 dagarna — släpp filer på chattytan eller använd
                  📎-knappen. Filer äldre än 7 dagar rensas automatiskt.
                </p>
              ) : (
                <ul className="max-h-28 space-y-1 overflow-y-auto [scrollbar-width:thin]">
                  {uppladdningar.slice(0, 10).map((u) => {
                    const andrad = (u as Uppladdning & { andrad?: number }).andrad;
                    return (
                      <li
                        key={u.sokvag}
                        className="flex items-center gap-1.5 font-mono text-[10px] text-[#8B949E]"
                        title={u.sokvag}
                      >
                        {filIkon(u.sokvag)}
                        <span className="min-w-0 flex-1 truncate">{u.sokvag.split("/").slice(2).join("/") || u.sokvag}</span>
                        <span className="shrink-0 text-[9px] text-[#484F58]">
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

      {/* FÖRHANDSGRANSKNING — text monospace, bild, nedladdning. */}
      {filVisning && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-3"
          onClick={() => setFilVisning(null)}
        >
          <div
            className="flex max-h-[88dvh] w-full max-w-3xl flex-col overflow-hidden rounded-md border border-[#30363D] bg-[#0D1117] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-[#30363D] px-3 py-2">
              <FileText className="h-4 w-4 shrink-0 text-[#8B949E]" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs font-semibold text-[#E6EDF3]">{filVisning.namn}</p>
                <p className="truncate font-mono text-[10px] text-[#8B949E]">
                  {filVisning.sokvag} · {byteStorlek(filVisning.storlek)}
                </p>
              </div>
              <button
                onClick={() => setFilVisning(null)}
                title="Stäng (Esc)"
                aria-label="Stäng förhandsgranskningen"
                className="flex h-[52px] w-11 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:h-9 sm:w-9"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              {visningLaddar && (
                <div className="flex items-center gap-2 px-4 py-6 text-xs text-[#8B949E]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#58A6FF]" />
                  Läser filen…
                </div>
              )}
              {!visningLaddar && filVisning.forhandsgranskning.slag === "text" && (
                <pre className="whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-[#E6EDF3]">
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
                  <Download className="h-8 w-8 text-[#8B949E]" />
                  <p className="max-w-md text-xs leading-relaxed text-[#8B949E]">
                    {filVisning.forhandsgranskning.orsak ?? "Binärt format — ladda ner för att öppna."}
                  </p>
                  <a
                    href={filVisning.forhandsgranskning.url}
                    download={filVisning.namn}
                    className="rounded-md border border-[#238636]/60 px-4 py-1.5 text-xs font-semibold text-[#3FB950] transition-colors hover:bg-[#238636]/10"
                  >
                    Ladda ner {filVisning.namn} ({byteStorlek(filVisning.storlek)})
                  </a>
                </div>
              )}
              {!visningLaddar && filVisning.forhandsgranskning.slag === "blockerad" && (
                <p className="px-4 py-6 text-center text-xs leading-relaxed text-[#8B949E]">
                  {filVisning.forhandsgranskning.meddelande}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NOTISPANEL (våg 86 G6) — drawer i filträdets stil. */}
      {visaNotiser && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50"
            onClick={() => setVisaNotiser(false)}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-label="Notishistorik"
            className="fixed right-0 top-0 z-40 flex h-[100dvh] w-full max-w-[380px] flex-col border-l border-[#30363D] bg-[#0D1117] shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-[#30363D] px-3 py-2.5">
              {notisRattighet === "granted" ? (
                <BellRing className="h-4 w-4 shrink-0 text-[#3FB950]" />
              ) : (
                <Bell className="h-4 w-4 shrink-0 text-[#8B949E]" />
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-[#E6EDF3]">Notishistorik</h2>
                <p className="truncate text-[10px] text-[#8B949E]">
                  {notiser.length === 0 ? "inga notiser än" : `${notiser.length} ${notiser.length === 1 ? "notis" : "notiser"} (max 50)`}
                </p>
              </div>
              <button
                onClick={() => setVisaNotiser(false)}
                title="Stäng (Esc)"
                aria-label="Stäng notishistoriken"
                className="flex h-[52px] w-11 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:h-9 sm:w-9"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-[#21262D] px-3 py-2">
              {notisRattighet === "granted" ? (
                <p className="flex items-center gap-1.5 text-[10px] leading-relaxed text-[#3FB950]/85">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  Notiser på — rundor över 60 s pingar och ”✓ Klar (N tkn)” kommer när agenten är färdig.
                </p>
              ) : notisRattighet === "denied" ? (
                <p className="flex items-center gap-1.5 text-[10px] leading-relaxed text-[#F85149]/85">
                  <XCircle className="h-3.5 w-3.5 shrink-0" />
                  Notiser blockerade — tillåt ak1nvestor.com i webbläsarens inställningar.
                </p>
              ) : notisRattighet === "stöds ej" ? (
                <p className="text-[10px] leading-relaxed text-[#484F58]">
                  Webbläsaren saknar stöd för notiser — historiken lever ändå kvar här.
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="min-w-0 flex-1 text-[10px] leading-relaxed text-[#8B949E]">
                    Slå på notiser — agentens långa rundor pingar när den är klar.
                  </p>
                  <button
                    onClick={() => void begraNotisRattighet()}
                    className="shrink-0 rounded-md bg-[#238636] px-3 py-1 text-[10px] font-bold text-white transition-colors hover:bg-[#2EA043]"
                  >
                    Slå på
                  </button>
                </div>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 [scrollbar-width:thin]">
              {notiser.length === 0 ? (
                <p className="px-2 py-3 text-[11px] leading-relaxed text-[#8B949E]">
                  Ingen historik än — varje Web Notification (⏳ rundor över 60 s, ✓ när agenten
                  är klar, fel) loggas här och sparas i webbläsaren (sista 50).
                </p>
              ) : (
                <ul className="space-y-1">
                  {[...notiser].reverse().map((n) => (
                    <li
                      key={n.tid}
                      className="flex items-start gap-2 rounded-md bg-[#161B22] px-2 py-1.5 text-[11px] text-[#E6EDF3]/85"
                      title={new Date(n.tid).toLocaleString("sv-SE")}
                    >
                      {n.typ === "lang" ? (
                        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D29922]" />
                      ) : n.typ === "klar" ? (
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3FB950]" />
                      ) : (
                        <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F85149]" />
                      )}
                      <span className="min-w-0 flex-1 break-words leading-relaxed">{n.text}</span>
                      <span className="shrink-0 whitespace-nowrap font-mono text-[9px] text-[#484F58]">
                        {new Date(n.tid).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-[#30363D] px-3 py-2.5">
              <p className="text-[10px] leading-relaxed text-[#484F58]">
                Spelas i denna webbläsare (localStorage ak1a-studio-notiser, sista 50).
              </p>
              <button
                onClick={() => {
                  tomNotiser();
                  visaToast("Notishistoriken tömd.");
                }}
                disabled={notiser.length === 0}
                title="Töm notishistoriken"
                className="flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[10px] text-[#F85149] transition-colors hover:bg-[#DA3633]/10 disabled:opacity-40"
              >
                <Trash2 className="h-3 w-3" />
                Töm
              </button>
            </div>
          </aside>
        </>
      )}

      {/* MER-MENYN (⋯) — allt som inte bor i sidebar/panel/header. */}
      {menyOppen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50"
            onClick={() => setMenyOppen(false)}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-label="Mer"
            className="fixed right-0 top-0 z-40 flex h-[100dvh] w-full max-w-[400px] flex-col border-l border-[#30363D] bg-[#0D1117] shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-[#30363D] px-3 py-3">
              <MoreHorizontal className="h-5 w-5 shrink-0 text-[#8B949E]" />
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-[#E6EDF3]">Mer</h2>
                <p className="truncate text-[11px] text-[#8B949E]">filer · minne · färdigheter · export</p>
              </div>
              <button
                onClick={() => setMenyOppen(false)}
                title="Stäng (Esc)"
                aria-label="Stäng menyn"
                className="flex h-[52px] w-11 shrink-0 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:h-10 sm:w-10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3 [scrollbar-width:thin]">
              <button
                type="button"
                onClick={() => {
                  setMenyOppen(false);
                  void startaNySession();
                }}
                disabled={sessionJobbar !== "" || strömmarHuvud || !arHuvudAktiv}
                title="Kassera HUVUDSESSIONEN och börja en frisk kontext — nya samtal gör du med + Nytt samtal"
                className="flex min-h-14 w-full items-center gap-3.5 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-[#161B22] disabled:opacity-50"
              >
                {sessionJobbar === "ny" ? (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#58A6FF]" />
                ) : (
                  <SquarePen className="h-5 w-5 shrink-0 text-[#8B949E]" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[#E6EDF3]">Ny session (huvud)</span>
                  <span className="mt-0.5 block leading-snug text-[11px] text-[#8B949E]">frisk kontext — fönstret börjar om</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => oppnaFiltrad()}
                title="Filer — agentens arbetsyta (förhandsgranska filer och bilder, töm uploads)"
                className="flex min-h-14 w-full items-center gap-3.5 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-[#161B22]"
              >
                <FolderTree className="h-5 w-5 shrink-0 text-[#8B949E]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[#E6EDF3]">Filer</span>
                  <span className="mt-0.5 block leading-snug text-[11px] text-[#8B949E]">agentens arbetsyta + uploads</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#484F58]" />
              </button>

              <button
                type="button"
                onClick={() => oppnaMinne()}
                title="Minne — vad agenten kommer ihåg (minnesfiler + stående instruktioner, redigerbara)"
                className="flex min-h-14 w-full items-center gap-3.5 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-[#161B22]"
              >
                <Brain className="h-5 w-5 shrink-0 text-[#8B949E]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[#E6EDF3]">Minne</span>
                  <span className="mt-0.5 block leading-snug text-[11px] text-[#8B949E]">
                    minnesfiler + stående instruktioner
                    {minneFiler && minneFiler.length > 0 ? ` (${minneFiler.length})` : ""}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#484F58]" />
              </button>

              <button
                type="button"
                onClick={() => oppnaFardigheter()}
                title="Färdigheter — vad agenten KAN (skills/plugins/MCP)"
                className="flex min-h-14 w-full items-center gap-3.5 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-[#161B22]"
              >
                <Zap className="h-5 w-5 shrink-0 text-[#8B949E]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[#E6EDF3]">Färdigheter</span>
                  <span className="mt-0.5 block leading-snug text-[11px] text-[#8B949E]">
                    skills, plugins och MCP-verktyg
                    {fardigheterSkills && fardigheterSkills.length > 0 ? ` (${fardigheterSkills.length})` : ""}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#484F58]" />
              </button>

              <button
                type="button"
                onClick={() => oppnaAdmin()}
                title="Verktyg — admin-kommandon (variabler/priser, blogg-publicering, minne)"
                className="flex min-h-14 w-full items-center gap-3.5 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-[#238636]/10"
              >
                <Wrench className="h-5 w-5 shrink-0 text-[#3FB950]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[#3FB950]">Verktyg</span>
                  <span className="mt-0.5 block leading-snug text-[11px] text-[#8B949E]">admin — variabler, blogg, minne</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#484F58]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenyOppen(false);
                  exporteraChat();
                }}
                title="Exportera chatten som markdown-fil (datum i filnamnet)"
                className="flex min-h-14 w-full items-center gap-3.5 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-[#161B22]"
              >
                <Download className="h-5 w-5 shrink-0 text-[#8B949E]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[#E6EDF3]">Exportera markdown</span>
                  <span className="mt-0.5 block leading-snug text-[11px] text-[#8B949E]">chatten som .md-fil</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenyOppen(false);
                  exporteraChatHtml();
                }}
                title="Exportera chatten som fristående HTML-fil (printbar)"
                className="flex min-h-14 w-full items-center gap-3.5 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-[#161B22]"
              >
                <Printer className="h-5 w-5 shrink-0 text-[#8B949E]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[#E6EDF3]">Exportera HTML</span>
                  <span className="mt-0.5 block leading-snug text-[11px] text-[#8B949E]">fristående, printbar fil</span>
                </span>
              </button>

              <p className="mb-1 mt-4 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#484F58]">
                Fler verktyg
              </p>

              <button
                type="button"
                onClick={() => {
                  setMenyOppen(false);
                  setSokOppen(true);
                }}
                title="Sök i chatten (highlight + pilnavigering)"
                className="flex min-h-14 w-full items-center gap-3.5 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-[#161B22]"
              >
                <Search className="h-5 w-5 shrink-0 text-[#8B949E]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[#E6EDF3]">Sök i chatten</span>
                  <span className="mt-0.5 block leading-snug text-[11px] text-[#8B949E]">highlight + pilnavigering</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#484F58]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenyOppen(false);
                  oppnaPalett();
                }}
                title="Kommandopalett (Ctrl/Cmd+K)"
                className="flex min-h-14 w-full items-center gap-3.5 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-[#161B22]"
              >
                <Command className="h-5 w-5 shrink-0 text-[#8B949E]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[#E6EDF3]">Kommandopalett</span>
                  <span className="mt-0.5 block leading-snug text-[11px] text-[#8B949E]">Ctrl/Cmd+K — snabbkommandon</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#484F58]" />
              </button>

              {/* Bakgrundsagenter — expanderbar lista (våg 83 B3). */}
              <button
                type="button"
                onClick={() => {
                  const ny = !menyAgenterOppen;
                  setMenyAgenterOppen(ny);
                  if (ny) void lasAgenter();
                }}
                aria-expanded={menyAgenterOppen}
                title="Bakgrundsagenter (session/subagents) — status + avbryt"
                className="flex min-h-14 w-full items-center gap-3.5 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-[#161B22]"
              >
                <Bot className="h-5 w-5 shrink-0 text-[#8B949E]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[#E6EDF3]">Bakgrundsagenter</span>
                  <span className="mt-0.5 block leading-snug text-[11px] text-[#8B949E]">
                    {subagenter.length > 0 ? `${subagenter.length} agent(er) — status + avbryt` : "status + avbryt"}
                  </span>
                </span>
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-[#484F58] transition-transform", menyAgenterOppen && "rotate-180")} />
              </button>
              {menyAgenterOppen && (
                <div className="mb-2 rounded-md border border-[#21262D] bg-[#010409] px-2 py-2">
                  <div className="mb-1.5 flex items-center gap-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8B949E]">
                      Bakgrundsagenter {subagenter.length > 0 && `(${subagenter.length})`}
                    </p>
                    <button
                      onClick={() => void lasAgenter()}
                      disabled={agenterLaddar}
                      title="Uppdatera (session/subagents)"
                      aria-label="Uppdatera agenter"
                      className="flex h-[52px] w-11 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:h-9 sm:w-9 disabled:opacity-50"
                    >
                      <RefreshCw className={cn("h-3.5 w-3.5", agenterLaddar && "animate-spin")} />
                    </button>
                  </div>
                  {agenterFel && <p className="px-1 py-1.5 text-[11px] text-[#F85149]">{agenterFel}</p>}
                  {agenterLaddar && subagenter.length === 0 && (
                    <p className="px-1 py-1.5 text-[11px] text-[#8B949E]">Läser agenter…</p>
                  )}
                  {!agenterLaddar && subagenter.length === 0 && !agenterFel && (
                    <p className="px-1 py-1.5 text-[11px] leading-relaxed text-[#8B949E]">
                      Inga bakgrundsagenter just nu.
                    </p>
                  )}
                  <ul className="space-y-1">
                    {subagenter.map((a) => {
                      const kör =
                        a.status === "running" || a.status === "waiting" || a.status === "blocked";
                      return (
                        <li
                          key={a.barnSessionId}
                          className="flex items-center gap-2 rounded-md bg-[#161B22] px-2 py-1.5 text-[11px] text-[#E6EDF3]/85"
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
                            {a.typ && <span className="ml-1.5 text-[9px] text-[#484F58]">{a.typ}</span>}
                          </span>
                          {kör && (
                            <button
                              onClick={() => void avbrytAgent(a.barnSessionId)}
                              title="Avbryt (session/cancelBackgroundTask)"
                              className="flex min-h-[52px] shrink-0 items-center rounded-md border border-[#DA3633]/40 px-2 text-[10px] text-[#F85149] transition-colors hover:bg-[#DA3633]/10 sm:min-h-11"
                            >
                              Avbryt
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={() => oppnaNotiser()}
                title="Notiser — historik + på/av (rundor över 60 s pingar när agenten är klar)"
                className="flex min-h-14 w-full items-center gap-3.5 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-[#161B22]"
              >
                {notisRattighet === "granted" ? (
                  <BellRing className="h-5 w-5 shrink-0 text-[#3FB950]" />
                ) : (
                  <Bell className="h-5 w-5 shrink-0 text-[#8B949E]" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[#E6EDF3]">Notiser</span>
                  <span className="mt-0.5 block leading-snug text-[11px] text-[#8B949E]">
                    {notisRattighet === "granted"
                      ? "på — långa rundor pingar"
                      : `${notiser.length} i historiken — slå på inuti panelen`}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#484F58]" />
              </button>

              {/* Minnesregler — expanderbar (våg 84 C). */}
              <button
                type="button"
                onClick={() => setMenyReglerOppen((v) => !v)}
                aria-expanded={menyReglerOppen}
                title="Minnesregler — ”alltid tillåt” per verktyg (localStorage); matchande begäranden godkänns automatiskt"
                className="flex min-h-14 w-full items-center gap-3.5 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-[#161B22]"
              >
                <ShieldCheck className="h-5 w-5 shrink-0 text-[#8B949E]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[#E6EDF3]">Minnesregler</span>
                  <span className="mt-0.5 block leading-snug text-[11px] text-[#8B949E]">
                    {regler.length === 0 ? "”alltid tillåt” per verktyg" : `${regler.length} ${regler.length === 1 ? "regel" : "regler"} — alltid tillåt`}
                  </span>
                </span>
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-[#484F58] transition-transform", menyReglerOppen && "rotate-180")} />
              </button>
              {menyReglerOppen && (
                <div className="mb-2 rounded-md border border-[#21262D] bg-[#010409] px-2 py-2">
                  {regler.length === 0 ? (
                    <p className="px-1 py-2 text-[11px] leading-relaxed text-[#8B949E]">
                      Inga ”alltid tillåt”-regler än — spara en direkt i godkännandedialogen
                      (”⛨ Alltid tillåta &lt;verktyg&gt;”) så godkänns framtida begäranden för
                      verktyget automatiskt med en notis i flödet. Reglerna lever i denna
                      webbläsare (localStorage) och påverkar aldrig serverns egna regler.
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {regler.map((r) => (
                        <li
                          key={r.verktyg}
                          className="flex items-center gap-2 rounded-md bg-[#161B22] px-2 py-1 text-[11px] text-[#E6EDF3]/85"
                          title={`${r.verktyg} — sparad ${new Date(r.skapad).toLocaleString("sv-SE")}`}
                        >
                          {(() => {
                            const klass = verktygsriskKlass(r.verktyg);
                            return (
                              <span
                                className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wider", klass.farg)}
                                title={klass.forklaring}
                              >
                                {klass.etikett}
                              </span>
                            );
                          })()}
                          <span className="min-w-0 flex-1 truncate font-mono">{r.verktyg}</span>
                          <button
                            onClick={() => {
                              tabortRegel(r.verktyg);
                              visaToast(`Regeln för ${r.verktyg} borttagen — framtida begäranden visar dialogen igen.`);
                            }}
                            title="Ta bort regeln"
                            aria-label="Ta bort regeln"
                            className="flex h-11 w-9 shrink-0 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#DA3633]/10 hover:text-[#F85149]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setMenyOppen(false);
                  setVisaGenvagar(true);
                }}
                title="Genvägar (?) — tangentbordsgenvägarna"
                className="flex min-h-14 w-full items-center gap-3.5 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-[#161B22]"
              >
                <MessageCircleQuestion className="h-5 w-5 shrink-0 text-[#8B949E]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[#E6EDF3]">Genvägar</span>
                  <span className="mt-0.5 block leading-snug text-[11px] text-[#8B949E]">tangentbordet (?)</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#484F58]" />
              </button>
            </div>
          </aside>
        </>
      )}

      {/* INSTÄLLNINGAR-DRAWER ⚙ (våg 88 I1) — modell/läge/tankestyrka i lista
          (våg 90: temat är FAST mörkt — tema-sektionen är borttagen). */}
      {installningarOppen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50"
            onClick={() => setInstallningarOppen(false)}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-label="Inställningar"
            className="fixed right-0 top-0 z-40 flex h-[100dvh] w-full max-w-[380px] flex-col border-l border-[#30363D] bg-[#0D1117] shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-[#30363D] px-3 py-2.5">
              <Settings className="h-4 w-4 shrink-0 text-[#8B949E]" />
              <div className="min-w-0 flex-1">
                <h2 className="flex items-center gap-1.5 text-sm font-semibold text-[#E6EDF3]">
                  Inställningar
                  {/* VÅG 93 C3: sessionens modell/läge avviker från server-standarden. */}
                  {standardAvvik && (
                    <span
                      className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#D29922]"
                      role="status"
                      title={`Detta samtal avviker från server-standarden — ${standardAvvik.join(" · ")}. Valet gäller bara detta samtal; nya samtal börjar på standarden.`}
                      aria-label="Detta samtal avviker från server-standarden"
                    />
                  )}
                </h2>
                <p className="truncate text-[10px] text-[#8B949E]">modell · läge · tankestyrka</p>
              </div>
              <button
                onClick={() => setInstallningarOppen(false)}
                title="Stäng (Esc)"
                aria-label="Stäng inställningarna"
                className="flex h-[52px] w-11 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:h-9 sm:w-9"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-2 py-3 [scrollbar-width:thin]">
              {/* VÅG 93 C3: serverns standard för nya samtal (dold om endpoint
                  saknas/501 — sessionssparandet består ändå). */}
              {serverStandard && (
                <p
                  className="rounded-md bg-[#161B22] px-3 py-2 font-mono text-[10px] leading-relaxed text-[#8B949E]"
                  title="Serverns standard för nya samtal — ur GET /api/studio/installningar"
                >
                  Standard: {modellBadge(serverStandard.modell)} / {serverStandard.lage || "—"} (server)
                </p>
              )}
              <section aria-label="Modell">
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B949E]">
                  Modell
                </p>
                {modeller.length === 0 ? (
                  <p className="px-3 py-2 text-[11px] leading-relaxed text-[#8B949E]">
                    Ingen modellista ännu (GET /api/studio/modeller) — listan härleds ur
                    zcode-config.json på servern.
                  </p>
                ) : (
                  modeller.map((m) => (
                    <InstallningarRad
                      key={m.id}
                      vald={m.id === valdModell}
                      titel={m.namn}
                      beskrivning={modellBeskrivning(m.id)}
                      val={m.id}
                      jobbar={byterModell && m.id === valdModell}
                      disabled={byterModell || strömmarHuvud || !arHuvudAktiv}
                      onClick={() => void valjModellMedStandard(m.id)}
                    />
                  ))
                )}
                <p className="mt-1 px-3 text-[10px] leading-relaxed text-[#484F58]">
                  Byte skapar en ny session med modellen — gamla sessioner lever kvar
                  i samtalslistan.
                </p>
              </section>

              <section aria-label="Agentläge" className="border-t border-[#21262D] pt-3">
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B949E]">
                  Läge
                </p>
                {!lage && (
                  <p className="px-3 py-2 text-[11px] leading-relaxed text-[#8B949E]">
                    Läser sessionens läge (session/setMode)…
                  </p>
                )}
                <InstallningarRad
                  vald={lage === "build"}
                  titel="Build"
                  beskrivning="Agenten kör fritt — låg/medel risk godkänns automatiskt"
                  val="build"
                  disabled={!lage || lageJobbar || strömmarHuvud || !arHuvudAktiv}
                  jobbar={lageJobbar && lage === "build"}
                  onClick={() => void valjLageMedStandard("build")}
                />
                <InstallningarRad
                  vald={lage === "plan"}
                  titel="Plan"
                  beskrivning="Verktyg kräver godkännande — diff förhandsvisas i dialogen"
                  val="plan"
                  disabled={!lage || lageJobbar || strömmarHuvud || !arHuvudAktiv}
                  jobbar={lageJobbar && lage === "plan"}
                  onClick={() => void valjLageMedStandard("plan")}
                />
              </section>

              <section aria-label="Tankestyrka" className="border-t border-[#21262D] pt-3">
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B949E]">
                  Tankestyrka
                </p>
                {!tanka && (
                  <p className="px-3 py-2 text-[11px] leading-relaxed text-[#8B949E]">
                    Läser tankestyrkan (session/setThoughtLevel)…
                  </p>
                )}
                <InstallningarRad
                  vald={tanka === "nothink"}
                  titel="Av"
                  beskrivning="Snabbast — inget synligt resonemang"
                  val="nothink"
                  disabled={!tanka || lageJobbar || strömmarHuvud || !arHuvudAktiv}
                  jobbar={lageJobbar && tanka === "nothink"}
                  onClick={() => void valjTankeMedStandard("nothink")}
                />
                <InstallningarRad
                  vald={tanka === "high"}
                  titel="Hög"
                  beskrivning="Djupt resonemang för krävande uppgifter"
                  val="high"
                  disabled={!tanka || lageJobbar || strömmarHuvud || !arHuvudAktiv}
                  jobbar={lageJobbar && tanka === "high"}
                  onClick={() => void valjTankeMedStandard("high")}
                />
                <InstallningarRad
                  vald={tanka === "max"}
                  titel="Max"
                  beskrivning="Maximalt resonemang — långsammare men grundligast"
                  val="max"
                  disabled={!tanka || lageJobbar || strömmarHuvud || !arHuvudAktiv}
                  jobbar={lageJobbar && tanka === "max"}
                  onClick={() => void valjTankeMedStandard("max")}
                />
              </section>
            </div>
          </aside>
        </>
      )}

      {/* MÅL-DIALOG (våg 85 F1) — den stora textarea → Starta autonom loop. */}
      {malDialogOppen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-3"
          onClick={() => setMalDialogOppen(false)}
        >
          <div
            role="dialog"
            aria-label="Mål-läge — autonom utveckling"
            className="flex max-h-[88dvh] w-full max-w-xl flex-col overflow-hidden rounded-md border border-[#30363D] bg-[#0D1117] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-[#30363D] px-4 py-3">
              <Target className="h-5 w-5 shrink-0 text-[#3FB950]" />
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-[#E6EDF3]">Mål-läge</h2>
                <p className="text-[11px] text-[#8B949E]">
                  Autonom utveckling — agenten itererar själv mot målet tills du pausar
                </p>
              </div>
              <button
                onClick={() => setMalDialogOppen(false)}
                title="Stäng (Esc)"
                aria-label="Stäng mål-dialogen"
                className="shrink-0 flex h-[52px] w-11 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:h-9 sm:w-9"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              <label htmlFor="mal-dialog-text" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#8B949E]">
                Beskriv utvecklingsmålet
              </label>
              <textarea
                id="mal-dialog-text"
                value={malDialogText}
                onChange={(e) => setMalDialogText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    void startaMal();
                  }
                }}
                rows={5}
                maxLength={500}
                autoFocus
                placeholder="Beskriv utvecklingsmålet… t.ex. &quot;Lista alla .md-filer i workspacet och håll sammanfattningen uppdaterad&quot;"
                className="w-full resize-none rounded-md border border-[#30363D] bg-[#161B22] px-3 py-2.5 text-sm leading-relaxed text-[#E6EDF3] outline-none placeholder:text-[#484F58] focus:border-[#58A6FF]"
              />
              <p className="mt-1.5 text-right font-mono text-[10px] tabular-nums text-[#484F58]">{malDialogText.length}/500</p>
              <p className="mt-2 text-[10px] leading-relaxed text-[#8B949E]">
                När du startar börjar agenten arbeta mot målet på egen hand — protokollet
                matar nya turner automatiskt (bevisat våg 83). Varje iteration syns LIVE i
                chatten med verktygskort, diff och streaming, och panelen visar en
                <span className="mx-1 font-semibold text-[#3FB950]">AKTIVT</span>-badge med
                iterationsräknare + checklist. Pausa när du vill — sessionen och målet lever kvar.
              </p>
              {mal && (
                <p className="mt-2 rounded-md border border-[#D29922]/30 bg-[#D29922]/5 px-3 py-2 text-[10px] leading-relaxed text-[#8B949E]">
                  Ett mål är redan satt{malKör ? " och loopen KÖR just nu" : malPausat ? " (pausat)" : ""} — att
                  starta igen ersätter målet med texten ovan
                  {malKör ? " (pausa först om agenten är mitt i en iteration)" : ""}.
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-[#30363D] px-4 py-3">
              <button
                onClick={() => setMalDialogOppen(false)}
                className="rounded-md px-4 py-2 text-xs font-semibold text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3]"
              >
                Avbryt
              </button>
              <button
                onClick={() => void startaMal()}
                disabled={!malDialogText.trim() || malStartar}
                className="flex items-center gap-1.5 rounded-md bg-[#238636] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#2EA043] disabled:opacity-50"
                title="Starta mål-läget (session/goal set) — den autonoma loopen börjar"
              >
                {malStartar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                Starta mål-läge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STYRELSEN 🏛 (VÅG 91 A3b) — fråga-fält → mötesvy → beslutskort.
          Mötet pollas var 3:e s och lever även om dialogen stängs. */}
      {styrelseOppen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-3"
          onClick={stangStyrelse}
        >
          <div
            role="dialog"
            aria-label="AI-styrelsen"
            className="flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-md border border-[#30363D] bg-[#0D1117] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-[#30363D] px-4 py-3">
              <Landmark className="h-5 w-5 shrink-0 text-[#3FB950]" />
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-[#E6EDF3]">Styrelsen 🏛</h2>
                <p className="truncate text-[11px] text-[#8B949E]">
                  fem roller diskuterar och beslutar — varje ärende tas på största allvar
                </p>
              </div>
              <button
                onClick={stangStyrelse}
                title="Stäng (Esc)"
                aria-label="Stäng styrelsen"
                className="shrink-0 flex h-[52px] w-11 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:h-9 sm:w-9"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {styrelseSaknas ? (
              /* A2:s motor saknas (501/404) — diskret info-rad, mötesvyn dold. */
              <div className="px-4 py-4">
                <p className="flex items-start gap-2 text-xs leading-relaxed text-[#484F58]">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Styrelsemotorn är inte aktiverad på servern ännu — mötesvyn dyker upp här
                  så snart rutten <span className="mx-1 font-mono">/api/studio/styrelse</span> svarar.
                </p>
              </div>
            ) : styrelseMote ? (
              <StyrelseMoteVy mote={styrelseMote} onNyFraga={nyStyrelseFraga} />
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                <label
                  htmlFor="styrelse-fraga"
                  className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#8B949E]"
                >
                  Ärende till styrelsen
                </label>
                <textarea
                  id="styrelse-fraga"
                  value={styrelseFraga}
                  onChange={(e) => setStyrelseFraga(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      void startaStyrelse();
                    }
                  }}
                  rows={4}
                  maxLength={800}
                  autoFocus
                  placeholder="Vad ska styrelsen besluta om? T.ex. &quot;Ska vi bygga om prenumerationsflödet till årlig debitering?&quot;"
                  className="w-full resize-none rounded-md border border-[#30363D] bg-[#161B22] px-3 py-2.5 text-sm leading-relaxed text-[#E6EDF3] outline-none placeholder:text-[#484F58] focus:border-[#58A6FF]"
                />
                <p className="mt-1.5 text-right font-mono text-[10px] tabular-nums text-[#484F58]">
                  {styrelseFraga.length}/800
                </p>
                <p className="mt-2 text-[10px] leading-relaxed text-[#8B949E]">
                  Ordföranden, Teknik, Säkerhet, Juridik och Tillväxt konkallas och diskuterar i
                  parallella vågor. Beslut tillämpas OMEDELBART av agentpipelinen — utom
                  existentiella åtgärder (domänflytt, prissättning, betalningsflöden, extern
                  publicering, juridik/GDPR, radering, API-nycklar) som får badge
                  <span className="mx-1 rounded-full bg-[#D29922] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#0D1117]">
                    Väntar kund
                  </span>
                  och väntar på dig.
                </p>
              </div>
            )}

            {!styrelseMote && !styrelseSaknas && (
              <div className="flex items-center justify-end gap-2 border-t border-[#30363D] px-4 py-3">
                <button
                  onClick={stangStyrelse}
                  className="min-h-[52px] rounded-md px-4 py-2 text-xs font-semibold text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:min-h-0"
                >
                  Avbryt
                </button>
                <button
                  onClick={() => void startaStyrelse()}
                  disabled={!styrelseFraga.trim() || styrelseStartar}
                  title="Konkalla styrelsen — fem roller diskuterar och beslutar (Ctrl+Enter)"
                  className="flex min-h-[52px] items-center gap-1.5 rounded-md bg-[#238636] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#2EA043] disabled:opacity-50 sm:min-h-0"
                >
                  {styrelseStartar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Landmark className="h-3.5 w-3.5" />}
                  Konkalla styrelsen
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GENVÄGSÖVERSIKT ("?"-tangenten). */}
      {visaGenvagar && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-3"
          onClick={() => setVisaGenvagar(false)}
        >
          <div
            role="dialog"
            aria-label="Tangentbordsgenvägar"
            className="w-full max-w-md overflow-hidden rounded-md border border-[#30363D] bg-[#0D1117] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-[#21262D] px-3.5 py-2.5">
              <MessageCircleQuestion className="h-4 w-4 shrink-0 text-[#8B949E]" />
              <h2 className="min-w-0 flex-1 text-sm font-semibold text-[#E6EDF3]">Tangentbordsgenvägar</h2>
              <button
                onClick={() => setVisaGenvagar(false)}
                title="Stäng (Esc)"
                aria-label="Stäng genvägarna"
                className="flex h-[52px] w-11 items-center justify-center rounded-md text-[#8B949E] transition-colors hover:bg-[#161B22] hover:text-[#E6EDF3] sm:h-9 sm:w-9"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#21262D] text-[10px] uppercase tracking-wider text-[#8B949E]">
                  <th className="px-3.5 py-1.5 font-semibold">Tangent</th>
                  <th className="px-3.5 py-1.5 font-semibold">Vad den gör</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["Enter", "Skicka prompten till agenten"],
                    ["Skift+Enter", "Ny rad i skrivfältet (flerradsprompt)"],
                    ["Ctrl/Cmd+K", "Kommandopaletten — sök kommandon och modellbyten"],
                    ["/", "Kommandomenyn i skrivfältet (snabbkommandon med autocomplete)"],
                    ["↑", "Föregående prompt ur historiken (i tomt skrivfält); ↑/↓ navigerar även palett och sök"],
                    ["?", "Denna genvägsöversikt"],
                    ["Esc", "Stäng palett, sök, paneler och dialoger"],
                  ] as const
                ).map(([tangent, beskrivning]) => (
                  <tr key={tangent} className="border-b border-[#21262D]/60 last:border-b-0">
                    <td className="whitespace-nowrap px-3.5 py-1.5">
                      <kbd className="rounded border border-[#30363D] bg-[#161B22] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#E6EDF3]">
                        {tangent}
                      </kbd>
                    </td>
                    <td className="px-3.5 py-1.5 text-[#8B949E]">{beskrivning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-[#21262D] px-3.5 py-1.5 text-[10px] text-[#8B949E]">
              Tryck ? igen eller Esc för att stänga — musen fungerar förstås också.
            </p>
          </div>
        </div>
      )}

      {/* KOMMANDOPALETTEN (Ctrl/Cmd+K) — kommandon + modellbyten. */}
      {palettOppen && (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/50 p-4 pt-[12vh]"
          onClick={() => setPalettOppen(false)}
        >
          <div
            role="dialog"
            aria-label="Kommandopalett"
            className="w-full max-w-lg overflow-hidden rounded-md border border-[#30363D] bg-[#0D1117] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-[#21262D] px-3.5 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-[#8B949E]" />
              <input
                ref={palettInputRef}
                value={palettFras}
                onChange={(e) => setPalettFras(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setPalettIndex((i) => Math.min(i + 1, palettPoster.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setPalettIndex((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    const p = palettPoster[palettIndex];
                    if (p) {
                      setPalettOppen(false);
                      p.kor();
                    }
                  }
                }}
                placeholder="Sök kommandon och modellbyten…"
                maxLength={80}
                className="min-w-0 flex-1 bg-transparent text-sm text-[#E6EDF3] outline-none placeholder:text-[#484F58]"
              />
              <kbd className="shrink-0 rounded border border-[#30363D] bg-[#161B22] px-1.5 py-0.5 font-mono text-[9px] text-[#8B949E]">
                Esc
              </kbd>
            </div>
            <ul className="max-h-72 overflow-y-auto py-1.5">
              {palettPoster.length === 0 && (
                <li className="px-4 py-3 text-xs text-[#8B949E]">Inga träffar — prova "modell".</li>
              )}
              {palettPoster.map((p, i) => (
                <li key={p.id}>
                  <button
                    ref={(el) => {
                      if (el) palettRadRefs.current.set(p.id, el);
                      else palettRadRefs.current.delete(p.id);
                    }}
                    onClick={() => {
                      setPalettOppen(false);
                      p.kor();
                    }}
                    onMouseEnter={() => setPalettIndex(i)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3.5 py-2 text-left transition-colors",
                      i === palettIndex ? "bg-[#58A6FF]/10" : "hover:bg-[#161B22]",
                    )}
                  >
                    {p.ikon === "kommando" ? (
                      <Terminal className="h-4 w-4 shrink-0 text-[#8B949E]" />
                    ) : (
                      <Bot className="h-4 w-4 shrink-0 text-[#8B949E]" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-xs font-semibold text-[#E6EDF3]">{p.etikett}</span>
                      <span className="block truncate text-[10px] text-[#8B949E]">{p.beskrivning}</span>
                    </span>
                    <span className="shrink-0 rounded-full border border-[#30363D] px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-[#8B949E]">
                      {p.grupp}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="border-t border-[#21262D] px-3.5 py-1.5 text-[10px] text-[#8B949E]">
              ↑↓ välj · Enter kör · Esc stänger — samma kommandon som /help
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
