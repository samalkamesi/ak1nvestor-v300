import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * STUDIO-TRANSPORT — injicerbart transportlager för /studio-bryggan
 * (VÅG 81 WEBCHAT-STUDIO + VÅG 82 STUDIO V2 "Z-portalen i molnet",
 * STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 81/82").
 *
 * VÅG 82-tillägg (protokollvägar FIRST-HAND bevisade 2026-09-09, se
 * tool-results/v82-protokoll.md): bytModell (kassera + session/create MED
 * model-param — sessionen föds med vald modell; session/setModel på levande
 * session är också bevisat men KVD-valet är create-vägen), publik nySession,
 * lasSessioner (session/list), compact (session/compact — kompakteringen
 * kör som turn, metoden väntar på idle) + lasKontext (session/read:s
 * projection {contextUsed, contextWindow, totalTokenCount} = kontextradens
 * sanningskälla; contextWindow 200 000 för zai/GLM vid beviset, 1 000 000
 * är endast reservvärde i UI när protokollet tiger).
 *
 * VÅG 83 MEGA-tillägg B1 (Z-portalens kärna — KOMPLETT STREAMING-
 * VISUALISERING + DIFF; protokollkälla: tool-results/v83-protokollkarta.md,
 * LIVE-testad 2026-09-09): StudioEvent utökas med
 *   · "verktyg_kort" — tool.updated (kinds scheduled/started/progress/
 *     result/error, kartan §4A): verktygsnamn, argument-truncat,
 *     resultat-truncat, fel, varaktighet (kind result bär duration) +
 *     live-progress (elapsedMs/stdoutTail/stderrTail) — varje verktygskall
 *     blir ett expanderbart kort i chattflödet.
 *   · "verktyg_input" — model.streaming kinds tool_input_delta/tool_call
 *     (agenten skriver argumenten LIVE — "läser fil X…" medan de tickar
 *     fram) samt defensivt part.delta field "input".
 *   · "runda" — turn.started/turn.completed (duration, resultType,
 *     toolCallCount) för rundstatistiken i agentbubblan.
 *   · state.updated — patch.status running/idle + aktiv verktygsräkning
 *     (patch.activeToolCalls) → status-event; projektionen hämtas efter
 *     rundan via lasKontext (oförändrat v82-flöde).
 *   · lasFilandringar() — senaste turnens filändringar som ±N-rader per
 *     fil, härledda ur session/messages tool-delar (VBe §5: Write bär
 *     hela content → +N; Edit bär old_string/new_string → EXAKT −N/+N;
 *     MultiEdit bär edits[]). Protokollets ursprungliga diff-källa
 *     v4/conversation/fileChanges lever i v4-grenen — EN EGEN protokoll-
 *     gren som kräver v4/connection/flow + v4/controller/subscribe +
 *     v4/conversation/subscribe och INGÅR ej i session/event-strömmen
 *     (kartan §4F/§6.1) — och är här dokumenterad som uppgraderingsväg;
 *     ändringspanelen renderar samma form oavsett källa.
 *
 * VÅG 83 MEGA-tillägg B2 (Z-portaLens GODKÄNANDEFLÖDE — permission- och
 * interaktionsskiktet; protokollkälla: tool-results/v83-protokollkarta.md
 * §3 SERVER→KLIENT-REQUESTS): ProtokollKlientens serverRequestHanterare
 * besvarar interaktionsdomänen asynkront —
 *   · interaction/requestPermission {input, reason, requestId, riskLevel,
 *     options:[{optionId: allow_once|allow_project|deny, kind, name,
 *     description?, response?}], toolCallId, toolName, turnId} → svaret är
 *     protokollets z2-form {decision:"allow"|"deny"|"escalate"|"modify",
 *     reason?, permissionUpdates?:[{type:"addRules",behavior,rules:[{toolName}]}]}.
 *     Alternativen publiceras som StudioEvent "interaktion" på den AKTIVA
 *     promptens ström (SSE-bryggan) + i ett register; UI:t svarar via
 *     POST /api/studio/interaktion → svarPermission(). KVD-DEFAULT: inget
 *     UI-svar inom 30 s ⇒ {decision:"escalate"} — sessionen får ALDRIG
 *     hänga på en obesvarad dialog. Re-announce av samma request-id
 *     (kartan §3: "server-<n>" kan skickas om) re-notifierar bara UI:t.
 *   · interaction/requestUserInput {requestId, prompt, inputType?:
 *     "text"|"choice"|"confirm", choices?} → {value} | {cancelled:true}
 *     (30 s-default: cancelled). Frågekort i chatten med knappval/fritext.
 *   · interaction/requestOfficialMcpAuthHeaders → {} (hoppa över — LIVE
 *     ×6 i kartan §3).
 *   · session/setMode {sessionId, mode:"build"|"plan"} (LIVE i kartan §1)
 *     + session/setThoughtLevel {sessionId, thoughtLevel:"nothink"|
 *     "high"|"max"} (LIVE-nivåer §1) — bägge sparas i transporten och
 *     följer med till session/create (mode+thoughtLevel är create-params)
 *     så modellbyte/ny session bevarar valet; resume bär tanke-nivån.
 *     E2E-AVGRÄNSNING (dokumenterad enligt KVD): permission-flödet kan
 *     ej testas i build-läge — servern auto-godkänner låg/medel risk där
 *     (kartan §3). Dialogen visas när läget kräver det (t.ex. plan);
 *     eskalerings-defaulten är tidsbestämt och körs i dev via mock.
 *
 * Två implementeringar bakom ETT gränssnitt:
 *
 *   1. appServerTransport — PRIMÄR (protokollet FIRST-HAND bevisat
 *      2026-09-09 på Contabo, se tool-results/v81-appserver.md + STUDIO-2-
 *      korrigeringen i slutet av den filen): spawnar `zcode app-server`
 *      som långlivad barnprocess och talar ZCode Protocol: NDJSON på
 *      stdio, kuvert {"id"?,"method","params"} UTAN jsonrpc-fält. Metoder
 *      som bevisats live: session/create, session/resume, session/list,
 *      session/subscribe, session/send, session/messages, session/stop.
 *      Strömning sker via session/event-notiser där HÄNDELSETYPEN ligger
 *      på params-nivå i zcode ≥ 3.11.2-22 (params.type "model.streaming"
 *      med payload.kind text_delta/reasoning_delta; slutpixel
 *      "turn.completed" med payload.response) — äldre form med typen i
 *      payload ("turn") stöds defensivt. session/send på en session vars
 *      modell tagits bort svarar -32031 ZCODE_RUNTIME_MODEL_UNAVAILABLE →
 *      transporten kasserar sessionen, skapar en färsk (aktuell modell)
 *      och försöker EN gång till (bevisat 2026-09-09 när glm-5.3-flash
 *      stängdes av).
 *
 *   2. mockTransport — deterministisk utvecklings-/testtransport (ingen
 *      modell, inga kostnader): samma gränssnitt, strömmer ett canned
 *      markdown-svar i bitar. DEV på Windows-arbetsstationen använder
 *      mock som default (NEXT_ENV-artighet: riktig end-to-end sker vid
 *      deploy på Contabo där zcode + workspace lever lokalt).
 *
 * FALLBACK-ARKITEKTUR (dokumenterad i v81-appserver.md): om protokollet
 * bryts i framtida zcode-versioner är planen tmux send-keys + capture-
 * pane-pollning (V2) — INTE implementerad här (ingen död kod; gränssnittet
 * tar emot en tredje transport om det behövs).
 *
 * MILJÖVARIABLER (alla valfria — prod på Contabo behöver INGEN):
 *   STUDIO_TRANSPORT   = "appserver" | "mock" (default: mock på win32,
 *                        annars appserver)
 *   STUDIO_ZCODE_BIN   = sökväg till zcode-binären (default: "zcode" resp.
 *                        /home/ak1a/.npm-global/bin/zcode som reserv)
 *   STUDIO_WORKSPACE   = agentens arbetskatalog
 *                        (default: /home/ak1a/agent/ak1 om den finns, annars cwd)
 *   STUDIO_LAGRING     = katalog för sessions-persistensfilen
 *                        (default: os.tmpdir())
 *
 * Säkerhet: transporten kör ENDAST server-side (Node runtime) och exponerar
 * ALDRIG hemligheter mot klienten — API-rutten (stream/route.ts) äger
 * requireAdmin och översätter events till sanerad SSE.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── Gränssnitt ───────────────────────────────────────────────────────────────

/** Strömningskanal: "text" = svaret, "tankar" = agentens resonemang. */
export type StudioKanal = "text" | "tankar";

/**
 * Verktygskortets livscykelsteg — mappar tool.updated-kinds (kartan §4A):
 * scheduled→planerad, started→startar, progress→kör, result→resultat,
 * error→fel. UI:t spinner på planerad/startar/kör och färgar fel rött.
 */
export type StudioVerktygSteg = "planerad" | "startar" | "kör" | "resultat" | "fel";

/** Live-progress på ett körande verktyg (tool.updated kind "progress"). */
export interface StudioVerktygFramsteg {
  elapsedMs?: number;
  /** stdoutTail/stderrTail-truncat — bashverktygets puls. */
  utdata?: string;
}

/** En diff-rad i ändringspanelen — "+" grön, "−" röd. */
export interface StudioRadandring {
  typ: "+" | "-";
  text: string;
}

/** Filändring med ÄRLIGA ±N-rader (rader kan vara trunkerade till cap). */
export interface StudioFilandring {
  sokvag: string;
  plus: number;
  minus: number;
  rader: StudioRadandring[];
}

/**
 * Alternativ i en permission-request (protokollens options[]-post, kartan
 * §3): optionId allow_once|allow_project|deny + visningsnamn. "response"
 * (protokollets förslagade z2-svar) stannar i transporten — UI:t ser bara
 * knappdata.
 */
export interface StudioPermissionAlternativ {
  optionId: string;
  namn: string;
  beskrivning?: string;
}

/**
 * Server→klient-interaktion som väntar på användarens svar (V83 B2).
 * "permission" = verktygskall som kräver godkännande; "fråga" =
 * requestUserInput (knappval eller fritext).
 */
export type StudioInteraktion =
  | {
      typ: "permission";
      requestId: string;
      verktyg: string;
      /** low|medium|high|critical (kartan §3). */
      risk: string;
      skäl?: string;
      /** Argument-summary (truncat JSON/text) — protokollets input-fält. */
      sammanfattning: string;
      alternativ: StudioPermissionAlternativ[];
    }
  | {
      typ: "fråga";
      requestId: string;
      fråga: string;
      /** text|choice|confirm (kartan §3). */
      inputTyp?: string;
      val?: string[];
    };

/** Detaljerade händelser som transporten strömmar under en prompt. */
export type StudioEvent =
  | { typ: "status"; text: string }
  | { typ: "delta"; kanal: StudioKanal; text: string }
  | { typ: "verktyg"; namn: string; händelse: "start" | "slut" }
  | {
      /** V83 B2: interaktionsrequest väntar på användarens val (dialogkort). */
      typ: "interaktion";
      interaktion: StudioInteraktion;
    }
  | {
      /** V83 B2: interaktionen löst (svar/avbruten/eskalerad) — stäng kortet. */
      typ: "interaktionsKlar";
      requestId: string;
      /** "eskal" | "avbruten" | "besvarad" | "tillåtet en gång" | … */
      beslut: string;
      skäl?: string;
    }
  | {
      /** V83 B1: verktygskort (tool.updated-kartläggning) — merge:a på id. */
      typ: "verktyg_kort";
      /** Protokollets toolCallId — UI:t samlar korten per id. */
      id: string;
      /**
       * Verktygsnamn — ENDAST när protokollet bär det (LIVE-sond: kind
       * "result" saknar toolName; UI:t behåller då det tidigare namnet).
       */
      namn?: string;
      steg: StudioVerktygSteg;
      /** Argument som JSON-sträng, truncat. */
      argument?: string;
      beskrivning?: string;
      /** Resultatet som text, truncat. */
      resultat?: string;
      /** Felmeddelande (kind error) — kortet renderas rött. */
      fel?: string;
      /** Kind result bär duration (ms). */
      varaktighetMs?: number;
      /** Kind progress: elapsedMs + stdout/stderr-svans. */
      framsteg?: StudioVerktygFramsteg;
    }
  | {
      /** V83 B1: agenten skriver verktygsargumenten LIVE (model.streaming). */
      typ: "verktyg_input";
      id: string;
      text: string;
    }
  | {
      /** V83 B1: turn.started/turn.completed — rundstatistik i bubblan. */
      typ: "runda";
      fas: "start" | "slut";
      varaktighetMs?: number;
      /** "success" | "cancelled" | "error_max_turns" | … (kartan §4A). */
      resultatTyp?: string;
      verktygAntal?: number;
      tokenCount?: number;
    }
  | { typ: "klart"; svar: string; tokenCount?: number; varaktighetMs?: number }
  | { typ: "fel"; meddelande: string };

export type StudioLyssnare = (event: StudioEvent) => void;

/** Historikpost (senaste först i tid — transporten returnerar äldst först). */
export interface StudioHistorikPost {
  roll: "user" | "assistant";
  text: string;
}

/**
 * Post ur session/list (protokollfält mappade defensivt). V83 utökad med
 * modell (qBe.model) + berikning: turns/tokens hämtas ur session/read:s
 * projection för topp-listan (turnCount/totalTokenCount — BEVISAT v83,
 * se tool-results/v83-protokollkarta.md §1).
 */
export interface StudioSessionPost {
  sessionId: string;
  titel?: string;
  status?: string;
  arbetsyta?: string;
  uppdaterad?: string;
  /** v83: qBe.model → "zai/glm-5.3" (ellerbart modelId om provider saknas). */
  modell?: string;
  /** v83: projection.turnCount via session/read-berikning. */
  turns?: number;
  /** v83: projection.totalTokenCount via session/read-berikning. */
  tokens?: number;
}

/**
 * Kontextsanning ur session/read-projektionen (BEVISAT v82: projection =
 * {contextUsed, contextWindow, totalTokenCount, turnCount, ...}). UI:t
 * använder protokollets ÄRLIGA contextWindow som tak (200 000 för zai/GLM
 * vid beviset) och 1 000 000 endast som reservvärde när protokollet tiger.
 */
export interface StudioKontext {
  modell?: string;
  contextUsed?: number;
  contextWindow?: number;
  totalTokenCount?: number;
  turnCount?: number;
  /** V83 B2: projection.mode ("build"|"plan"|…) — lägesväxlarens sanning. */
  lage?: string;
  /** V83 B2: snapshot settings.thoughtLevel.current (nothink|high|max). */
  tankeNiva?: string;
}

/** Svar från compact() — status enligt protokollets compact.state. */
export interface StudioCompactSvar {
  status: "klar" | "redan_körs" | "tom";
  meddelande: string;
  kontext?: StudioKontext | null;
}

/** Resultat från bytModell() — sessionId BYTER alltid (KVD/E2E-krav). */
export interface StudioBytModellSvar {
  sessionId: string;
  /** "create" = kassera + session/create med model-param (huvudvägen). */
  väg: "create";
  modell: string;
}

/** Resultat från oppnaSession() — historiken ur session/messages. */
export interface StudioOppnaSvar {
  sessionId: string;
  historik: StudioHistorikPost[];
  kontext: StudioKontext | null;
}

/** Resultat från forka() — forkedSessionId saknas när checkpoint krävs. */
export interface StudioForkSvar {
  forkedSessionId?: string;
  meddelande: string;
}

/** Resultat från lasMal()/sattMal() (session/goal — LIVE-bevisat "show"). */
export interface StudioMalSvar {
  /** null = inget mål satt (LIVE: response "No goal is set…"). */
  mal: string | null;
  meddelande: string;
}

/** Status-badge för en bakgrundsagent (session/subagents running+ended). */
export type StudioSubagentStatus =
  | "running"
  | "waiting"
  | "blocked"
  | "success"
  | "failed"
  | "cancelled"
  | "lost";

/** Bakgrundsagent ur session/subagents (running[] ∪ ended.items[]). */
export interface StudioSubagent {
  barnSessionId: string;
  titel: string;
  typ?: string;
  status: StudioSubagentStatus;
  startad?: string;
  avslutad?: string;
  sammanfattning?: string;
}

/** Resultat från avbrytBakgrundsTask() (session/cancelBackgroundTask). */
export interface StudioAvbrytSvar {
  avbruten: boolean;
  meddelande: string;
}

/** Workspaceinfo ur workspace/readState (BEVISAT LIVE v83, §2 i kartan). */
export interface StudioArbetsytaInfo {
  arbetsyta: string;
  /** settings.mode.current ("build"|"plan"|…). */
  lage?: string;
  /** settings.model.current → "zai/glm-5.3". */
  modell?: string;
  tankeNiva?: string;
  /** settings.permission.mode. */
  behorighet?: string;
  modellerTillgangliga?: number;
  kommandon?: number;
}

export interface StudioTransport {
  /** "appserver" (riktig agent) eller "mock" (demo/test). */
  readonly namn: "appserver" | "mock";
  /** Session-id om en session hålls levande — annars null. */
  sessionId(): string | null;
  /** Starta/återuppta + prenumerera — idempotent; kastar vid fel. */
  ensure(): Promise<void>;
  /** Historik för den levande sessionen (tom lista när ej tillgänglig). */
  historik(): Promise<StudioHistorikPost[]>;
  /**
   * Skicka en prompt och strömma händelser tills klart/fel. EN PROMPT I
   * TAGET (zcode vägrar självt med -32010 om en redan kör — speglas här
   * som fel-event så UI:t kan visa det ärligt).
   */
  skicka(prompt: string, lyssnare: StudioLyssnare, signal?: AbortSignal): Promise<void>;
  // ── V82 STUDIO V2 (protokollvägar FIRST-HAND bevisade, se
  // tool-results/v82-protokoll.md) ────────────────────────────────────────
  /**
   * Byt huvudmodell: kasserar sessionen och skapar en ny med
   * session/create-param `model:{providerId:"zai",modelId}` (BEVISAT
   * 2026-09-09: sessionen föds med vald modell). sessionId ändras alltid.
   * (Protokollet har ÄVEN session/setModel på levande session — bevisat —
   * men KVD:s arkitekturval är create-vägen så historik/kontext börjar
   * friskt per modellbyte.)
   */
  bytModell(modellId: string): Promise<StudioBytModellSvar>;
  /** Kassera + skapa frisk session (ev. med vald modell) — publikt för "Ny session"-knappen. */
  nySession(modellId?: string): Promise<string>;
  /** session/list (BEVISAT: {} → alla; {workspace,limit} filtrerar). */
  lasSessioner(): Promise<StudioSessionPost[]>;
  /**
   * session/compact (BEVISAT v82: schema {sessionId, inputId?,
   * instructions?, expectedRevision?}; svar compact.state "accepted"|
   * "already_running"). Kompakteringen kör som en turn — metoden väntar
   * på idle (max ~2 min) och returnerar färsk kontext.
   */
  compact(instruktioner?: string): Promise<StudioCompactSvar>;
  /** session/read-projektionen — kontextsanning för kontextraden. */
  lasKontext(): Promise<StudioKontext | null>;
  // ── V83 SESSIONS- OCH WORKSPACE-HANTERING (Z-portaLens projektnavigation,
  // protokollvägar i tool-results/v83-protokollkarta.md) ─────────────────────
  /**
   * Öppna vald session ur listan: session/resume + subscribe + historik
   * via session/messages (renderas i chatten). Vägrar när en prompt kör.
   */
  oppnaSession(sessionId: string): Promise<StudioOppnaSvar>;
  /**
   * session/close — stänger vald (eller aktuella) session; den finns kvar
   * i session/list (arkiverad historik) men svarar inte längre.
   */
  stangSession(sessionId?: string): Promise<boolean>;
  /**
   * session/fork {target:{kind:"latestCheckpoint"}}. DOKUMENTERAT LIVE-FEL
   * (v83-kartan §1): "No workspace checkpoint is available yet" — fork
   * kräver en checkpoint och de skapas VID FILÄNDRINGAR (turn med Write).
   * Metoden returnerar därför ett ÄRLIGT meddelande i stället för att
   * tvinga fram filändringar; KVD-beslut: ingen auto-Write.
   */
  forka(): Promise<StudioForkSvar>;
  /** session/goal action "show" (LIVE-bevisat: "No goal is set…" tomt). */
  lasMal(): Promise<StudioMalSvar>;
  /**
   * session/goal action "set" — sätter målet; svarets startedTurn kan
   * innebära att agenten börjar arbeta mot målet asynkront (events via
   * prenumerationen; utan pågående prompt strömmar de inte i chatten).
   */
  sattMal(mal: string): Promise<StudioMalSvar>;
  /** session/goal action "clear". */
  rensaMal(): Promise<StudioMalSvar>;
  /**
   * session/subagents — körande (running/waiting/blocked) + avslutade
   * (success/failed/cancelled/lost) barnagenter. Kräver persistent
   * session (LIVE-fel "Session not found" gällde en ephemeral testsession).
   */
  lasSubagenter(): Promise<StudioSubagent[]>;
  /**
   * session/cancelBackgroundTask {sessionId, taskId}. För subagenter
   * saknar protokollet task-id i listan — childSessionId används som
   * taskId (dokumenterat val; servern avvisar ärligt om den inte hittar).
   */
  avbrytBakgrundsTask(taskId: string): Promise<StudioAvbrytSvar>;
  /** workspace/readState — arbetsytans läge/modell/tanke-nivå/behörighet. */
  lasArbetsyta(): Promise<StudioArbetsytaInfo | null>;
  // ── V83 MEGA B1: STREAMING-VISUALISERING + DIFF (Z-portalens kärna) ──────
  /**
   * Senaste turnens filändringar som ±N-rader per fil. Härleds ur
   * session/messages tool-delar: Write bär hela content (+N), Edit bär
   * old_string/new_string (EXAKT −N/+N), MultiEdit bär edits[]. Den
   * ursprungliga protokollkällan v4/conversation/fileChanges kräver v4-
   * grenens egna subscribe-flöde (dokumenterat i filhuvudet) och är
   * uppgraderingsvägen — panelen renderar samma form. Tom lista = inga
   * filändringar (ALDRIG fel).
   */
  lasFilandringar(): Promise<StudioFilandring[]>;
  // ── V83 MEGA B2: PERMISSION- OCH INTERAKTIONSSKIKT (Z-portaLens) ──────────
  /**
   * Väntande interaktioner (permission/fråga) i ankomstordning — GET
   * /api/studio/stream och /api/studio/interaktion listar dem så ett
   * refreshat UI återfår dialogkortet.
   */
  vantaInteraktioner(): StudioInteraktion[];
  /**
   * Svara en interaction/requestPermission med valt alternativ (allow_once|
   * allow_project|deny ur eventets options). Svaret till protokollet blir
   * alternativets förslagade response om det finns, annars z2-formen:
   * allow_project ⇒ permissionUpdates addRules för verktyget. ok:false =
   * begäran okänd/redan besvarad (t.ex. 30 s-defaulten eller annat flik).
   */
  svarPermission(
    requestId: string,
    alternativId: string,
  ): Promise<{ ok: boolean; beslut: string; skäl?: string }>;
  /**
   * Svara en interaction/requestUserInput: {varde} = knappval/fritext,
   * {avbruten:true} = avbryt. Protokollsvaret: {value} | {cancelled:true}.
   */
  svarFraga(requestId: string, svar: { varde?: string; avbruten?: boolean }): Promise<{ ok: boolean }>;
  /**
   * session/setMode {sessionId, mode:"build"|"plan"} (BEVISAT LIVE, kartan
   * §1) — svaret är en snapshot; läget bekräftas ur settings.mode.current
   * (workspace-default kan överskriva, kartan §1 not). Valet följer med
   * till framtida session/create-param `mode`.
   */
  sattLage(lage: "build" | "plan"): Promise<{ lage: string }>;
  /**
   * session/setThoughtLevel {sessionId, thoughtLevel} (BEVISAT LIVE, kartan
   * §1 — nivåer: nothink|high|max). Tankestyrkan för resonemangsmodellen;
   * valet följer med till session/create + session/resume.
   */
  sattTankeNiva(niva: string): Promise<{ niva: string }>;
}

// ── NDJSON-protokollklient (app-server) ──────────────────────────────────────

/** En rad = ett JSON-objekt (bevisat: zod-strict, jsonrpc-fält förbjudet). */
interface ProtokollMeddelande {
  id?: string | number;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: { code?: number; message?: string; data?: unknown };
}

/** Väntande request med timeout-resolver. */
interface Vantan {
  los: (v: unknown) => void;
  fel: (e: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * Tunn NDJSON-klient mot `zcode app-server`. Hanterar:
 *   · request/svar via id-karta (request())
 *   · server→klient-requests: session/requestRuntimePreferences BESVARAS
 *     (obligatoriskt — annars låser sig sessionen), övriga besvaras -32601
 *   · notiser (method utan id) vidarebefordras till händelseLyssnare
 *   · barnprocess-död: alla väntande avvisas, lever=false (transporten
 *     startar om vid nästa ensure())
 */
class ProtokollKlient {
  private barn: ChildProcess | null = null;
  private buffert = "";
  private nästaId = 1;
  private readonly vantar = new Map<string | number, Vantan>();
  /** Notis- och server-request-mottagare (sätts av transporten). */
  händelseLyssnare: ((m: ProtokollMeddelande) => void) | null = null;
  /**
   * V83 B2: hanterare för övriga server→klient-requests (interaktions-
   * domänen) — sätts av transporten. Returnerar protokollets result-objekt
   * ASYNKRONT (användaren ska hinna klicka i UI:t), eller null = -32601.
   * Klienten skriver själv {id, result|error} när promisen löser.
   */
  serverRequestHanterare:
    | ((metod: string, parametrar: unknown) => unknown | Promise<unknown | null> | null)
    | null = null;
  lever = false;

  constructor(
    private readonly binär: string,
    private readonly arbetskatalog: string,
  ) {}

  /** Starta barnprocessen — kastar om spawn misslyckas (t.ex. ENOENT). */
  starta(): void {
    if (this.lever && this.barn) return;
    this.buffert = "";
    const barn = spawn(this.binär, ["app-server"], {
      cwd: this.arbetskatalog,
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
    });
    this.barn = barn;
    this.lever = true;

    barn.on("error", (fel) => this.stäng(new Error(`app-server kunde ej startas (${this.binär}): ${String(fel)}`)));
    barn.on("exit", (kod) => this.stäng(new Error(`app-server avslutades (kod ${kod})`)));
    barn.stdout?.on("data", (data: Buffer) => this.matad(data.toString("utf8")));
    // stderr läses och glöms — protokollet svarar med strukturerade fel;
    // rå stderr ska ALDRIG läckas vidare (kan innehålla sökvägar).
    barn.stderr?.on("data", () => undefined);
  }

  /** Radbuffrad JSON-tolkning — en rad = ett meddelande. */
  private matad(text: string): void {
    this.buffert += text;
    let ny = this.buffert.indexOf("\n");
    while (ny >= 0) {
      const rad = this.buffert.slice(0, ny).trim();
      this.buffert = this.buffert.slice(ny + 1);
      if (rad) {
        try {
          this.tolkat(JSON.parse(rad) as ProtokollMeddelande);
        } catch {
          // Icke-JSON-rad (bannertext etc.) — protokollet tål skräp rader.
        }
      }
      ny = this.buffert.indexOf("\n");
    }
  }

  private tolkat(m: ProtokollMeddelande): void {
    // Svar på vår request?
    if (m.id !== undefined && (m.result !== undefined || m.error !== undefined)) {
      const vantan = this.vantar.get(m.id);
      if (vantan) {
        this.vantar.delete(m.id);
        clearTimeout(vantan.timer);
        if (m.error) {
          const data = m.error.data as { message?: string; code?: string } | undefined;
          // data.code (t.ex. ZCODE_RUNTIME_MODEL_UNAVAILABLE) följer med i
          // meddelandet — transportens självläkning matchar på den strängen.
          const detaljer = [data?.code, data?.message]
            .filter((d): d is string => typeof d === "string" && d.length > 0)
            .join(": ");
          vantan.fel(
            new Error(
              `${m.error.message ?? "protokollfel"}${detaljer ? ` — ${detaljer}` : ""} (kod ${m.error.code ?? "?"})`,
            ),
          );
        } else {
          vantan.los(m.result);
        }
      }
      return;
    }
    // Server→klient-request? (method + id)
    if (m.method !== undefined && m.id !== undefined) {
      // Skriv-skyddad svarare — barnprocessen kan dö medan en interaktion
      // väntar på användaren; ett kast här får ALDRIG krascha strömmen.
      const svara = (rad: Record<string, unknown>) => {
        try {
          this.skickaRad(rad);
        } catch {
          // anslutningen nedkopplad — svaret når aldrig fram
        }
      };
      if (m.method === "session/requestRuntimePreferences") {
        // BEVISAT OBLIGATORISKT (annars låser create/send): schema MEt.
        svara({
          id: m.id,
          result: {
            nativeSearchEnhancementsEnabled: false,
            memoryEnabled: false,
            askUserQuestionAutoResolutionEnabled: true,
          },
        });
      } else if (m.method === "interaction/requestOfficialMcpAuthHeaders") {
        // V83 B2 (kartan §3, LIVE ×6): {} = hoppa över MCP-autentisering.
        svara({ id: m.id, result: {} });
      } else if (this.serverRequestHanterare) {
        // V83 B2: transporten äger svaret (permission/fråga) — asynkront
        // eftersom användaren ska hinna klicka; null = metoden stöds ej.
        const id = m.id;
        Promise.resolve(this.serverRequestHanterare(m.method, m.params)).then(
          (result) => {
            if (result === null || result === undefined) {
              svara({ id, error: { code: -32601, message: "ak1a-studio: metoden stöds ej" } });
            } else {
              svara({ id, result });
            }
          },
          (fel: unknown) => {
            svara({
              id,
              error: { code: -32603, message: `ak1a-studio: interaktionen misslyckades (${String(fel).slice(0, 160)})` },
            });
          },
        );
      } else {
        // Artigt nej (bevisat harmlöst att ignorera — flödet fortsätter).
        svara({ id: m.id, error: { code: -32601, message: "ak1a-studio: metoden stöds ej" } });
      }
      return;
    }
    // Notis — vidare till transporten.
    if (m.method !== undefined) this.händelseLyssnare?.(m);
  }

  private skickaRad(obj: Record<string, unknown>): void {
    if (!this.lever || !this.barn?.stdin?.writable) {
      throw new Error("app-server-anslutningen är nedkopplad");
    }
    this.barn.stdin.write(`${JSON.stringify(obj)}\n`);
  }

  /** Request med svar-väntan + timeout (ms). */
  request(metod: string, parametrar: Record<string, unknown>, timeoutMs = 30_000): Promise<unknown> {
    const id = this.nästaId++;
    this.skickaRad({ id, method: metod, params: parametrar });
    return new Promise((los, fel) => {
      const timer = setTimeout(() => {
        this.vantar.delete(id);
        fel(new Error(`timeout på ${metod} (${timeoutMs} ms)`));
      }, timeoutMs);
      this.vantar.set(id, { los, fel, timer });
    });
  }

  /** Eldränge-notis (svar väntas ej). */
  notis(metod: string, parametrar: Record<string, unknown>): void {
    this.skickaRad({ method: metod, params: parametrar });
  }

  private stäng(fel: Error): void {
    if (!this.lever) return;
    this.lever = false;
    for (const [, v] of this.vantar) {
      clearTimeout(v.timer);
      v.fel(fel);
    }
    this.vantar.clear();
    this.barn = null;
  }
}

// ── appServerTransport ───────────────────────────────────────────────────────

/** Resultat från session/create|resume — nyckeln är result.session.sessionId. */
interface SessionResult {
  session?: { sessionId?: string; model?: { providerId?: string; modelId?: string } };
}

/** session/read-svar (BEVISAT v82): {session, messages, projection, ...}. */
interface SessionReadResult {
  session?: { sessionId?: string; model?: { providerId?: string; modelId?: string } };
  projection?: {
    contextUsed?: number;
    contextWindow?: number;
    totalTokenCount?: number;
    turnCount?: number;
    status?: string;
    /** V83 B2: sessionens läge ("build"|"plan"|…). */
    mode?: string;
  };
  /** V83 B2: snapshoten bär settings (pce §5 i kartan). */
  settings?: {
    mode?: { current?: string };
    thoughtLevel?: { current?: string };
  };
}

/** session/list-svar (BEVISAT v82: {sessions:[{sessionId,status,title,workspace}]}). */
interface SessionListResult {
  sessions?: {
    sessionId?: string;
    status?: string;
    title?: string;
    updatedAt?: string;
    updated?: string;
    lastActiveAt?: string;
    /** v83 (qBe.model): {providerId?,modelId?}. */
    model?: { providerId?: string; modelId?: string } | null;
    workspace?: { workspacePath?: string };
  }[];
}

/** session/subagents-svar (v83-kartan §1: running[] + ended.items[]). */
interface SubagentsResult {
  running?: {
    childSessionId?: string;
    subagentType?: string;
    title?: string;
    summary?: string;
    startedAt?: string;
    endedAt?: string;
    status?: string;
  }[];
  ended?: {
    items?: {
      childSessionId?: string;
      subagentType?: string;
      title?: string;
      summary?: string;
      startedAt?: string;
      endedAt?: string;
      status?: string;
    }[];
  };
}

/** workspace/readState-svar (v83-kartan §2 — endast fält UI:t visar). */
interface WorkspaceStateResult {
  workspace?: { workspacePath?: string };
  settings?: {
    mode?: { current?: string };
    model?: { current?: { providerId?: string; modelId?: string } | string; available?: unknown[] };
    permission?: { mode?: string };
    thoughtLevel?: { current?: string };
  };
  slashCommands?: unknown[];
}

interface SessionEventParams {
  sessionId?: string;
  /**
   * Händelsetypen ligger på PARAMS-nivå i zcode ≥ 3.11.2-22 (bevisat live
   * 2026-09-09 STUDIO-2 på Contabo, /tmp/transport-create2.txt): t.ex.
   * "turn.started" | "model.streaming" | "model.response.completed" |
   * "turn.completed" | "session.updated" | "session.titleUpdated" |
   * "model_request_started" | "model_request_completed". Den äldre
   * dokumentationen (tool-results/v81-appserver.md) placerade den i
   * payload — båda formerna stöds defensivt.
   */
  type?: string;
  payload?: {
    type?: string;
    kind?: string;
    delta?: string;
    done?: boolean;
    response?: string;
    content?: string;
    resultType?: string;
    tokenCount?: number;
    duration?: number;
    name?: string;
    toolName?: string;
    // ── V83 B1 (kartan §4A tool.updated + model.streaming + turn.*) ──────
    /** tool.updated base + model.streaming tool_call/tool_input_*. */
    toolCallId?: string;
    /** tool.updated kind scheduled: description ur basfältet. */
    description?: string;
    /** kind scheduled/model.streaming tool_call: verktygsargumenten. */
    input?: unknown;
    /** kind result: resultatet (sträng eller objekt). */
    result?: unknown;
    /** kind error: felobjektet _Et {message?, …}. */
    error?: unknown;
    /** kind progress: elapsedMs/pid/stdoutBytes/stderrBytes/tails. */
    elapsedMs?: number;
    stdoutTail?: string;
    stderrTail?: string;
    /** turn.completed: antal verktygskall i rundan. */
    toolCallCount?: number;
    /** part.delta: field "input" = verktygsargument strömmas. */
    field?: string;
    partId?: string;
  };
}

interface StateUpdatedParams {
  /** v83 B1: activeToolCalls/backgroundJobs i patch → status-räknare. */
  patch?: {
    status?: string;
    activeToolCalls?: unknown[];
    backgroundJobs?: unknown[];
    contextUsed?: number;
    totalTokenCount?: number;
  };
}

/** Läs null-säkert sessionsid ur create/resume-svar. */
function sessionUr(result: unknown): string | null {
  const r = result as SessionResult | null;
  const sid = r?.session?.sessionId;
  return typeof sid === "string" && sid ? sid : null;
}

/** V83 B2: läge ur en snapshot (setMode/setThoughtLevel/read-svar). */
function lasLageUrSnapshot(r: unknown): string | null {
  const s = r as { settings?: { mode?: { current?: unknown } }; session?: { mode?: unknown } } | null;
  const urSettings = s?.settings?.mode?.current;
  if (typeof urSettings === "string" && urSettings) return urSettings;
  const urSession = s?.session?.mode;
  return typeof urSession === "string" && urSession ? urSession : null;
}

/** V83 B2: tanke-nivå ur en snapshot (settings.thoughtLevel.current). */
function lasTankeNivaUrSnapshot(r: unknown): string | null {
  const niva = (r as { settings?: { thoughtLevel?: { current?: unknown } } } | null)?.settings
    ?.thoughtLevel?.current;
  return typeof niva === "string" && niva ? niva : null;
}

/**
 * V83 B2: väntande interaktion i registret. "losare" kan vara flera (ett
 * request-id kan re-annonseras, kartan §3) — alla löses med SAMMA svar.
 */
interface VantanInteraktion {
  interaktion: StudioInteraktion;
  /** Protokollets förslagade z2-svar per optionId (options[].response). */
  fardigaSvar: Map<string, unknown>;
  /** Verktygsnamn för permissionUpdates (allow_project → addRules). */
  verktygNamn: string;
  losare: ((result: unknown) => void)[];
  timer: ReturnType<typeof setTimeout>;
  besvarad: boolean;
}

/** Permission-argument (input-fältet) → läsbar summary, truncat. */
function sammanfattaInput(input: unknown): string {
  if (input === undefined || input === null) return "(inga argument)";
  if (typeof input === "string") return input ? truncat(input, 600) : "(tomt)";
  try {
    return truncat(JSON.stringify(input) ?? "(okänt)", 600);
  } catch {
    return truncat(String(input), 600);
  }
}

/**
 * Resolve en binärkandidat till en existerande sökväg: absolut sökväg
 * kontrolleras rakt av, naket namn söks i PATH (separatorkompabil med
 * ":"/";"). Returnerar null när kandidaten ej finns — startaKlient hoppar
 * då till nästa (ENOENT är annars asynkront och osynligt för try/catch).
 */
function resolvorBinär(binär: string): string | null {
  if (binär.includes("/") || binär.includes("\\")) {
    return existsSync(binär) ? binär : null;
  }
  const pathSeparator = process.platform === "win32" ? ";" : ":";
  for (const rot of (process.env.PATH ?? "").split(pathSeparator)) {
    if (!rot) continue;
    for (const ändelse of process.platform === "win32" ? ["", ".cmd", ".exe"] : [""]) {
      const kandidat = path.join(rot, binär + ändelse);
      try {
        if (existsSync(kandidat) && !statIsKatalog(kandidat)) return kandidat;
      } catch {
        // vidare
      }
    }
  }
  return null;
}

function statIsKatalog(sokvag: string): boolean {
  try {
    return statSync(sokvag).isDirectory();
  } catch {
    return false;
  }
}

/**
 * -32031 ZCODE_RUNTIME_MODEL_UNAVAILABLE (bevisat live 2026-09-09 STUDIO-2:
 * "历史任务使用的模型已不可用" när en session pin:ar glm-5.3-flash som tagits
 * bort ur .zcode) — sessionen kan ALDRIG svara igen och måste kasseras.
 */
function arModellOtillganglig(meddelande: string): boolean {
  return meddelande.includes("ZCODE_RUNTIME_MODEL_UNAVAILABLE") || meddelande.includes("(kod -32031");
}

// ── V83 B1: truncering + filändringar ur session/messages ────────────────────

/** Argument-/resultat-budgeter: SSE-raderna skall förblir små och snabba. */
const MAX_ARGUMENT_TEEKEN = 600;
const MAX_RESULTAT_TEEKEN = 1_500;
const MAX_PROGRESS_TEEKEN = 240;
const MAX_RADLANGD = 200;
const MAX_RADER_PER_FIL = 400;
const MAX_FILER = 12;

/** Ärlig trunkering med räkneverkonsruta. */
function truncat(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}… [trunkerat — ${text.length} tecken totalt]`;
}

/** Verktygsargument (objekt|sträng) → läsbar JSON-sträng, truncat. */
function argumentText(indata: unknown): string | undefined {
  if (indata === undefined || indata === null) return undefined;
  const str = typeof indata === "string" ? indata : JSON.stringify(indata);
  if (!str) return undefined;
  return truncat(str, MAX_ARGUMENT_TEEKEN);
}

/** Verktygsresultat (sträng|objekt) → text, truncat. */
function resultatText(resultat: unknown): string | undefined {
  if (resultat === undefined || resultat === null) return undefined;
  if (typeof resultat === "string") return resultat ? truncat(resultat, MAX_RESULTAT_TEEKEN) : undefined;
  const str = JSON.stringify(resultat);
  return str ? truncat(str, MAX_RESULTAT_TEEKEN) : undefined;
}

/** tool.updated kind error: felobjektet _Et → läsbar text, truncat. */
function felText(fel: unknown): string | undefined {
  if (fel === undefined || fel === null) return undefined;
  if (typeof fel === "string") return truncat(fel, MAX_RESULTAT_TEEKEN);
  const f = fel as { message?: unknown; type?: unknown; code?: unknown };
  const delar = [f.type, f.message, f.code].filter(
    (d): d is string => typeof d === "string" && d.length > 0,
  );
  if (delar.length > 0) return truncat(delar.join(": "), MAX_RESULTAT_TEEKEN);
  const str = JSON.stringify(fel);
  return str ? truncat(str, MAX_RESULTAT_TEEKEN) : undefined;
}

/** Text → diff-rader med radlängdstak. */
function tillRader(text: string, typ: "+" | "-"): StudioRadandring[] {
  return text.split("\n").map((rad) => ({
    typ,
    text: rad.length > MAX_RADLANGD ? `${rad.slice(0, MAX_RADLANGD)}…` : rad,
  }));
}

/**
 * Filändringar ur ett session/messages-svar (ren funktion — deterministiskt
 * testbar): senaste turnen = meddelandena EFTER det SENASTE user-meddelandet;
 * Write/Edit/MultiEdit-delarnas input bär file_path + content respektive
 * old_string/new_string/edits[]. ±N är ÄRLIGA heltal även när rader listan
 * kapats (MAX_RADER_PER_FIL) — gränsdokumentationen är panelens sak.
 */
export function filandringarUrMessages(svar: unknown): StudioFilandring[] {
  const meddelanden = (svar as { messages?: unknown[] } | null)?.messages;
  if (!Array.isArray(meddelanden)) return [];
  let senasteUser = -1;
  for (let i = meddelanden.length - 1; i >= 0; i--) {
    const roll = (meddelanden[i] as { info?: { role?: unknown } } | null)?.info?.role;
    if (roll === "user") {
      senasteUser = i;
      break;
    }
  }
  if (senasteUser < 0) return []; // ingen turn att tillskriva ändringar
  const karta = new Map<string, StudioFilandring>();
  const addera = (sokvag: string, minus: StudioRadandring[], plus: StudioRadandring[]) => {
    const befintlig = karta.get(sokvag) ?? { sokvag, plus: 0, minus: 0, rader: [] };
    befintlig.minus += minus.length;
    befintlig.plus += plus.length;
    befintlig.rader.push(...minus, ...plus);
    if (befintlig.rader.length > MAX_RADER_PER_FIL) {
      befintlig.rader = befintlig.rader.slice(0, MAX_RADER_PER_FIL);
    }
    karta.set(sokvag, befintlig);
  };
  for (let i = senasteUser + 1; i < meddelanden.length; i++) {
    const delar = (meddelanden[i] as { parts?: unknown[] } | null)?.parts;
    if (!Array.isArray(delar)) continue;
    for (const del of delar) {
      const p = del as { type?: string; tool?: unknown; state?: { status?: unknown; input?: unknown } } | null;
      if (p?.type !== "tool") continue;
      // VBe §5: state är pending|running|completed|error — ENDAST completed
      // är en ÄNDRING PÅ DISK. En planerad/avbruten/misslyckad Write får
      // ALDRIG dyka upp i panelen (input finns i alla stater — LIVE-bevisat
      // v83: nekad Write gav +4 i panelen utan att filen fanns).
      if (p.state?.status !== "completed") continue;
      const verktyg = typeof p.tool === "string" ? p.tool : "";
      const indata =
        p.state && typeof p.state === "object" && p.state.input && typeof p.state.input === "object"
          ? (p.state.input as Record<string, unknown>)
          : {};
      const sokvag =
        typeof indata.file_path === "string" && indata.file_path
          ? indata.file_path
          : typeof indata.path === "string" && indata.path
            ? indata.path
            : null;
      if (!sokvag) continue;
      if (verktyg === "Write" && typeof indata.content === "string") {
        addera(sokvag, [], tillRader(indata.content, "+"));
      } else if (verktyg === "Edit") {
        const gammal = typeof indata.old_string === "string" ? indata.old_string : "";
        const ny = typeof indata.new_string === "string" ? indata.new_string : "";
        addera(sokvag, tillRader(gammal, "-"), tillRader(ny, "+"));
      } else if (verktyg === "MultiEdit" && Array.isArray(indata.edits)) {
        for (const e of indata.edits) {
          const red = (e ?? {}) as { old_string?: unknown; new_string?: unknown };
          const gammal = typeof red.old_string === "string" ? red.old_string : "";
          const ny = typeof red.new_string === "string" ? red.new_string : "";
          addera(sokvag, tillRader(gammal, "-"), tillRader(ny, "+"));
        }
      }
    }
  }
  return [...karta.values()].slice(0, MAX_FILER);
}

/**
 * Kontext för den aktiva prompten — notiser utan aktiv prompt ignoreras
 * (broadcasten är bred: state.updated, telemetri m.m.).
 */
interface AktivPrompt {
  lyssnare: StudioLyssnare;
  klar: () => void;
  senasteText: string;
  färdig: boolean;
}

class AppServerTransport implements StudioTransport {
  readonly namn = "appserver" as const;
  private klient: ProtokollKlient | null = null;
  private sid: string | null = null;
  private prenumererad = false;
  private aktiv: AktivPrompt | null = null;
  /** Väntar på state.updated-idle efter session/compact (BEVISAT v82). */
  private idleVakt: (() => void) | null = null;
  /** Fallback-räknare för tool.updated utan toolCallId (kartan har det — defensive). */
  private okandaVerktyg = 0;
  /** V83 B2: väntande server→klient-interaktioner (permission/fråga). */
  private readonly interaktioner = new Map<string, VantanInteraktion>();
  /** V83 B2: senast satta läge/tankestyrka — följer med vid create/resume. */
  private lage: "build" | "plan" | null = null;
  private tankeNiva: string | null = null;

  constructor(
    private readonly binärer: string[],
    private readonly arbetskatalog: string,
    private readonly lagringsSökväg: string,
  ) {}

  sessionId(): string | null {
    return this.sid;
  }

  async ensure(): Promise<void> {
    if (this.klient?.lever && this.sid && this.prenumererad) return;

    // Persistens: återuppta förra sessionen när pm2/servern startat om
    // ("sessionsliståterkomst") — fall tillbaka på create om den är borta.
    // OBS: resume-or-create körs också när klienten LEVER men sessionen
    // saknas (självläkningsvägen nySession() efter -32031).
    if (!this.klient?.lever) {
      this.klient = this.startaKlient();
      this.prenumererad = false;
    }
    if (!this.sid) {
      const klient = this.klient!;
      const { sessionId: sparad, modell, lage, tankeNiva } = this.lasSparadSession();
      if (lage === "build" || lage === "plan") this.lage = lage;
      if (tankeNiva) this.tankeNiva = tankeNiva;
      let resumerad = false;
      if (sparad) {
        try {
          // V83 B2: resume bär thoughtLevel (kartan §1 — mode finns ej i
          // resume-schemat, det följer med vid nästa create istället).
          const resultat = await klient.request(
            "session/resume",
            { sessionId: sparad, ...(this.tankeNiva ? { thoughtLevel: this.tankeNiva } : {}) },
            45_000,
          );
          const sid = sessionUr(resultat);
          if (sid) {
            this.sid = sid;
            resumerad = true;
          }
        } catch {
          resumerad = false; // borta/ogiltig → skapa ny nedan
        }
      }
      if (!resumerad) await this.skapa(klient, modell);
    }

    if (this.sid && !this.prenumererad) {
      // BEVISAT: web-remote-replayable ger session/event-push med riktiga
      // text_delta-bitar (desktop-continuous är skrivbordsyta).
      await this.klient!.request(
        "session/subscribe",
        { sessionId: this.sid, deliveryKind: "web-remote-replayable" },
        30_000,
      );
      this.prenumererad = true;
    }
  }

  private startaKlient(): ProtokollKlient {
    let senasteFel: unknown = null;
    for (const binär of this.binärer) {
      // V82-prodfix: ENOENT kommer ASYNKRONT (spawn 'error'-event) och
      // undgår try/catch — resolve därför kandidaterna FÖRUT (bara "zcode"
      // i PATH räcker inte när pm2-daemonens PATH saknar npm-global;
      // bevisat 2026-09-09: "spawn zcode ENOENT" på prod trots att
      // /home/ak1a/.npm-global/bin/zcode fanns som reserv i listan).
      const sokvag = resolvorBinär(binär);
      if (!sokvag) {
        senasteFel = new Error(`${binär} finns ej (PATH + kända sökvägar)`);
        continue;
      }
      const klient = new ProtokollKlient(sokvag, this.arbetskatalog);
      klient.händelseLyssnare = (m) => this.påNotis(m);
      // V83 B2: interaktionsdomänen (permission/fråga) besvaras asynkront
      // via transportens register — klienten skriver {id, result} när
      // användaren svarat (eller 30 s-defaulten löst).
      klient.serverRequestHanterare = (metod, parametrar) => this.paServerRequest(metod, parametrar);
      try {
        klient.starta();
        return klient;
      } catch (fel) {
        senasteFel = fel;
      }
    }
    throw new Error(`ingen zcode-binär kunde startas (${this.binärer.join(", ")}): ${String(senasteFel)}`);
  }

  private async skapa(klient: ProtokollKlient, modellId?: string): Promise<void> {
    // BEVISAT params-form: workspace {workspaceKey, workspacePath} — INTE
    // kind:"local" (det är en annan union; strict zod refuserar kind här).
    // V82 BEVISAT: model {providerId, modelId} accepteras och sessionen
    // föds med vald modell (setModel finns också men KVD-val är create).
    const params: Record<string, unknown> = {
      workspace: { workspaceKey: this.arbetskatalog, workspacePath: this.arbetskatalog },
    };
    if (modellId) params.model = { providerId: "zai", modelId: modellId };
    // V83 B2: läge + tankestyrka är create-params (kartan §1) — valet
    // bevaras över modellbyte/ny session. OBS (kartan §1 not): mode kan
    // överskrivas av workspace-default på serversidan — snapshoten är
    // sanningen, detta är bara intentionen.
    if (this.lage) params.mode = this.lage;
    if (this.tankeNiva) params.thoughtLevel = this.tankeNiva;
    const resultat = await klient.request("session/create", params, 60_000);
    const sid = sessionUr(resultat);
    if (!sid) throw new Error("session/create svarade utan sessionId");
    this.sid = sid;
    this.sparaPersistens(sid, modellId);
  }

  /** Persistens: {sessionId, modell?, lage?, tankeNiva?, sparad} — modellen används av create-fallback. */
  private sparaPersistens(sid: string, modellId?: string): void {
    try {
      mkdirSync(path.dirname(this.lagringsSökväg), { recursive: true });
      writeFileSync(
        this.lagringsSökväg,
        JSON.stringify({
          sessionId: sid,
          ...(modellId ? { modell: modellId } : {}),
          // V83 B2: läge/tankestyrka överlever pm2-omstart.
          ...(this.lage ? { lage: this.lage } : {}),
          ...(this.tankeNiva ? { tankeNiva: this.tankeNiva } : {}),
          sparad: Date.now(),
        }),
        "utf8",
      );
    } catch {
      // Persistens är best-effort — chatten funkar även utan.
    }
  }

  // ── V2: modellbyte, ny session, session/list, compact, kontext ───────────

  async bytModell(modellId: string): Promise<StudioBytModellSvar> {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,80}$/.test(modellId)) {
      throw new Error("Ogiltigt modell-id.");
    }
    // Kassera + skapa med model-param (BEVISAT v82 — sessionen föds med
    // modellen; sessionId ändras alltid vilket E2E-kravet kontrollerar).
    const sid = await this.nySession(modellId);
    return { sessionId: sid, väg: "create", modell: `zai/${modellId}` };
  }

  /**
   * Kassera den nuvarande sessionen och skapa en frisk — med vald modell
   * (bytModell-vägen) eller utan (självläkning efter -32031 + knappen
   * "Ny session"). En nyskapad session plockar annars serverns aktuella
   * standard/workspace-modell (zai/glm-5.3 vid v81-beviset).
   */
  async nySession(modellId?: string): Promise<string> {
    // Pågående prompt får aldrig överlivas av en kasserad session (UI-knappen
    // och modellbytet vägrar) — SJÄVLÄKNINGEN efter -32031 använder den
    // interna vägen nedan (skapaFriskSession) som tillåter just det.
    if (this.aktiv && !this.aktiv.färdig) {
      throw new Error("En prompt kör — vänta tills agenten är klar.");
    }
    return this.skapaFriskSession(modellId);
  }

  /**
   * Intern frisk-session-väg UTAN prompt-vakten — självläkningsretryn efter
   * -32031 (bevisad dödläge på prod 2026-09-09: nySession vägrade med
   * "En prompt kör" MEDAN retryn pågick, så döda sessionen kunde aldrig
   * kasseras och prompten dog). Städar väntande interaktioner + persistens.
   */
  private async skapaFriskSession(modellId?: string): Promise<string> {
    if (this.sid && this.klient?.lever) {
      // Artigt stäng — sessionen finns kvar i session/list (historik).
      try {
        await this.klient.request("session/close", { sessionId: this.sid }, 10_000);
      } catch {
        // ej fatal — kasseras ändå nedan
      }
    }
    // V83 B2: en kasserad session lämnar inga hängande dialoger — lösa
    // väntande interaktioner ärligt (permission→deny, fråga→cancelled)
    // innan registret glöms.
    this.rensaVantandeInteraktioner();
    this.sid = null;
    this.prenumererad = false;
    try {
      rmSync(this.lagringsSökväg, { force: true });
    } catch {
      // best-effort — en kvarvarande fil betyder bara att nästa omstart
      // får ett misslyckat resume-försök innan create fallback körs.
    }
    if (!this.klient?.lever) {
      this.klient = this.startaKlient();
      this.prenumererad = false;
    }
    await this.skapa(this.klient, modellId);
    await this.ensure();
    return this.sid!;
  }

  async lasSessioner(): Promise<StudioSessionPost[]> {
    // session/list kräver LEVANDE klient men EGEN session — skapa aldrig
    // en ny bara för att lista.
    if (!this.klient?.lever) {
      this.klient = this.startaKlient();
      this.prenumererad = false;
    }
    try {
      const svar = await this.klient!.request("session/list", {}, 30_000);
      const lista = (svar as SessionListResult | null)?.sessions;
      if (!Array.isArray(lista)) return [];
      const ut: StudioSessionPost[] = [];
      for (const s of lista) {
        if (typeof s.sessionId !== "string" || !s.sessionId) continue;
        const m = s.model;
        ut.push({
          sessionId: s.sessionId,
          titel: typeof s.title === "string" ? s.title : undefined,
          status: typeof s.status === "string" ? s.status : undefined,
          arbetsyta: s.workspace?.workspacePath,
          uppdaterad: s.updatedAt ?? s.updated ?? s.lastActiveAt,
          // v83: qBe.model bär modellen direkt i listan.
          modell:
            m?.providerId && m?.modelId
              ? `${m.providerId}/${m.modelId}`
              : typeof m?.modelId === "string" && m.modelId
                ? m.modelId
                : undefined,
        });
      }
      const topp = ut.slice(0, 25);
      // V83-BERIKNING: turns + tokens ur session/read-projektionen för de
      // 10 första (kontextraden per session). Varje läsning fel-tolerant —
      // listan lever alltid, berikning är lyx. Kör parallellt (NDJSON-
      // klienten multiplexar requests via id-kartan).
      await Promise.all(
        topp.slice(0, 10).map(async (post) => {
          try {
            const r = (await this.klient!.request(
              "session/read",
              { sessionId: post.sessionId },
              12_000,
            )) as SessionReadResult | null;
            const p = r?.projection;
            if (typeof p?.turnCount === "number") post.turns = p.turnCount;
            if (typeof p?.totalTokenCount === "number") post.tokens = p.totalTokenCount;
            if (!post.modell) {
              const m = r?.session?.model;
              if (m?.providerId && m?.modelId) post.modell = `${m.providerId}/${m.modelId}`;
            }
          } catch {
            // berikning är lyx
          }
        }),
      );
      return topp;
    } catch {
      return []; // listan är lyx, aldrig ett fel
    }
  }

  async compact(instruktioner?: string): Promise<StudioCompactSvar> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    if (this.aktiv && !this.aktiv.färdig) {
      throw new Error("En prompt kör — vänta tills agenten är klar.");
    }
    // BEVISAT v82: schema {sessionId, inputId?, instructions?,
    // expectedRevision?}; svar compact.state "accepted"|"already_running".
    const svar = (await this.klient.request(
      "session/compact",
      {
        sessionId: this.sid,
        ...(instruktioner && instruktioner.trim() ? { instructions: instruktioner.trim().slice(0, 500) } : {}),
      },
      60_000,
    )) as { compact?: { state?: string }; response?: string } | null;

    const state = svar?.compact?.state;
    if (state === "already_running") {
      return { status: "redan_körs", meddelande: "En komprimering körs redan — vänta några ögonblick." };
    }
    // "accepted": kompakteringen kör som en agentturn — vänta på idle
    // (state.updated broadcastas även utan subscribe; tak 2 min).
    await new Promise<void>((los) => {
      const tak = setTimeout(() => {
        this.idleVakt = null;
        los();
      }, 120_000);
      this.idleVakt = () => {
        clearTimeout(tak);
        this.idleVakt = null;
        los();
      };
    });
    const kontext = await this.lasKontext();
    const tom = !svar?.response && !kontext?.totalTokenCount;
    return {
      status: tom ? "tom" : "klar",
      meddelande: tom ? "Ingenting att komprimera — kontexten är redan frisk." : "Kontexten komprimerad.",
      kontext,
    };
  }

  async lasKontext(): Promise<StudioKontext | null> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) return null;
    try {
      const r = (await this.klient.request("session/read", { sessionId: this.sid }, 30_000)) as
        | SessionReadResult
        | null;
      const p = r?.projection;
      const m = r?.session?.model;
      const modell = m?.providerId && m?.modelId ? `${m.providerId}/${m.modelId}` : undefined;
      return {
        modell,
        contextUsed: typeof p?.contextUsed === "number" ? p.contextUsed : undefined,
        contextWindow: typeof p?.contextWindow === "number" ? p.contextWindow : undefined,
        totalTokenCount: typeof p?.totalTokenCount === "number" ? p.totalTokenCount : undefined,
        turnCount: typeof p?.turnCount === "number" ? p.turnCount : undefined,
        // V83 B2: läge ur projektionen, tanke-nivå ur snapshot-settings —
        // lägesväxlarens/tankekortets sanning efter varje ändring.
        lage: typeof p?.mode === "string" && p.mode ? p.mode : (lasLageUrSnapshot(r) ?? undefined),
        tankeNiva: lasTankeNivaUrSnapshot(r) ?? undefined,
      };
    } catch {
      return null;
    }
  }

  // ── V83: sessions- och workspace-hantering ──────────────────────────────

  async oppnaSession(sessionId: string): Promise<StudioOppnaSvar> {
    // sessions-id:t är protokollets egen identifierare — validera formen
    // hårt innan den går till app-servern.
    if (typeof sessionId !== "string" || !/^sess_[A-Za-z0-9._-]+$/.test(sessionId)) {
      throw new Error("Ogiltigt sessions-id.");
    }
    if (this.aktiv && !this.aktiv.färdig) {
      throw new Error("En prompt kör — vänta tills agenten är klar.");
    }
    if (!this.klient?.lever) {
      this.klient = this.startaKlient();
      this.prenumererad = false;
    }
    // Artigt stäng den nuvarande (den lever kvar i session/list) — samma
    // mönster som nySession().
    if (this.sid && this.sid !== sessionId && this.klient.lever) {
      try {
        await this.klient.request("session/close", { sessionId: this.sid }, 10_000);
      } catch {
        // ej fatal — resume kör ändå nedan
      }
    }
    this.sid = null;
    this.prenumererad = false;
    // BEVISAT v83-kartan §1: {sessionId} räcker — snapshoten bär historiken
    // (messageCount) och sessionen fortsätter där den slutade.
    const resultat = await this.klient.request("session/resume", { sessionId }, 45_000);
    const sid = sessionUr(resultat);
    if (!sid) throw new Error("session/resume svarade utan sessionId");
    this.sid = sid;
    this.sparaPersistens(sid);
    await this.klient.request(
      "session/subscribe",
      { sessionId: sid, deliveryKind: "web-remote-replayable" },
      30_000,
    );
    this.prenumererad = true;
    // Historiken ur session/messages — det är DENNA som fyller chatten.
    const [historik, kontext] = await Promise.all([this.historik(), this.lasKontext()]);
    return { sessionId: sid, historik, kontext };
  }

  async stangSession(sessionId?: string): Promise<boolean> {
    // ALDRIG ensure() här — att stänga ska inte föda en ny session när
    // ingen lever. Valdigt mål = parametern eller den aktiva sessionen.
    const mal = sessionId && /^sess_[A-Za-z0-9._-]+$/.test(sessionId) ? sessionId : this.sid;
    if (!mal) throw new Error("Ingen session att stänga.");
    if (!this.klient?.lever) {
      this.klient = this.startaKlient();
      this.prenumererad = false;
    }
    const r = (await this.klient.request("session/close", { sessionId: mal }, 15_000)) as
      | { closed?: boolean }
      | null;
    if (mal === this.sid) {
      // Den aktiva sessionen stängd — nästa ensure() skapar en frisk.
      this.rensaVantandeInteraktioner(); // V83 B2: inga hängande dialoger
      this.sid = null;
      this.prenumererad = false;
      try {
        rmSync(this.lagringsSökväg, { force: true });
      } catch {
        // best-effort
      }
    }
    return r?.closed !== false;
  }

  async forka(): Promise<StudioForkSvar> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    try {
      const r = (await this.klient.request(
        "session/fork",
        { sessionId: this.sid, target: { kind: "latestCheckpoint" } },
        30_000,
      )) as { forkedSessionId?: string } | null;
      const forkedSessionId = typeof r?.forkedSessionId === "string" ? r.forkedSessionId : undefined;
      if (!forkedSessionId) throw new Error("session/fork svarade utan forkedSessionId");
      return {
        forkedSessionId,
        meddelande: `Fork skapad — ny session ${forkedSessionId.slice(0, 13)}… (öppna den ur sessionslistan).`,
      };
    } catch (fel) {
      // DOKUMENTERAT (v83-kartan §1, LIVE-FEL): fork kräver checkpoint och
      // checkpoints skapas VID FILÄNDRINGAR (turn med Write). Ärligt svar
      // rakt ut — KVD: ingen auto-Write för att tvinga fram checkpoint.
      const text = fel instanceof Error ? fel.message : String(fel);
      if (/checkpoint/i.test(text)) {
        return {
          meddelande:
            "Ingen checkpoint ännu — fork kräver att agenten ändrat en fil först (checkpoints skapas vid filändringar). Kör en turn som skriver en fil och försök igen.",
        };
      }
      // LIVE-BEVISAT 2026-09-09 (prod, B3-E2E): -32010 "Cannot fork while a
      // prompt is running" — aktiv prompt ELLER aktiv mål-turn blockerar.
      // Ärligt svar (session/stop här skulle kunna döda pågående arbete).
      if (/prompt is running|-32010/i.test(text)) {
        return {
          meddelande:
            "En prompt eller aktivt mål kör i sessionen — fork väntar tills agenten är ledig (stoppa agenten eller rensa målet först).",
        };
      }
      throw fel;
    }
  }

  async lasMal(): Promise<StudioMalSvar> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    const r = (await this.klient.request(
      "session/goal",
      { sessionId: this.sid, action: "show" },
      30_000,
    )) as { response?: string } | null;
    const text = typeof r?.response === "string" ? r.response.trim() : "";
    // LIVE-bevisat v83: tomt mål ⇒ response "No goal is set…" — mönstret
    // matchas brett (formuleringen kan variera mellan versioner).
    if (!text || /\bno goal\b/i.test(text)) {
      return { mal: null, meddelande: "Inget mål är satt för sessionen." };
    }
    // LIVE-bevisat (prod-protokolexperiment /tmp/v83-b3-goal.mjs): aktivt
    // mål svarar "Goal active" + raden "Objective: <text>" + förbrukning —
    // plocka Objective-raden så headern visar själva målet, inte statistik.
    const objRad = /objective:[ \t]*(.+)/i.exec(text);
    const mal = objRad ? objRad[1].trim() : text;
    return { mal, meddelande: mal };
  }

  async sattMal(mal: string): Promise<StudioMalSvar> {
    const text = mal.trim().slice(0, 500);
    if (!text) throw new Error("Målet är tomt.");
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    if (this.aktiv && !this.aktiv.färdig) {
      throw new Error("En prompt kör — vänta tills agenten är klar.");
    }
    // BEVISAT schema v83-kartan §1: action "set" + objective. startedTurn
    // i svaret kan innebära att agenten börjar arbeta mot målet asynkront.
    const r = (await this.klient.request(
      "session/goal",
      { sessionId: this.sid, action: "set", objective: text },
      45_000,
    )) as { response?: string; startedTurn?: boolean } | null;
    return {
      mal: text,
      meddelande:
        typeof r?.response === "string" && r.response.trim()
          ? r.response.trim()
          : r?.startedTurn
            ? "Målet satt — agenten har börjat arbeta mot det."
            : "Målet satt.",
    };
  }

  async rensaMal(): Promise<StudioMalSvar> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    try {
      await this.klient.request(
        "session/goal",
        { sessionId: this.sid, action: "clear" },
        30_000,
      );
    } catch (fel) {
      const text = fel instanceof Error ? fel.message : String(fel);
      // LIVE-BEVISAT 2026-09-09 (prod, B3-E2E): -32010 "Cannot manage goals
      // while a prompt is running" — mål-set startar en ASYNKRON mål-turn
      // som håller sessionen upptagen. Kartan §1: session/stop "avbryter
      // aktiv prompt + pausar aktiv goal". KVD-vakt: stoppa ENDAST när
      // EGEN prompt INTE strömmar (this.aktiv) — klientens pågående svar
      // dödas ALDRIG av en målrensning.
      if (/prompt is running|-32010/i.test(text)) {
        // LIVE-bevisat (/tmp/v83-b3-goal.mjs): session/stop (ack {}) och
        // goal pause är VERKNINGSLÖSA under mål-turnen — clear går igenom
        // först när turnen SLUTFÖRT (experimentet: ~20 s). Rätt medicin:
        // POLLA clear (icke-destruktivt — pågående agentarbete avbryts
        // ALDRIG), tak ~75 s, därefter ärligt fel.
        let rensad = false;
        let sistaFel = fel instanceof Error ? fel : new Error(text);
        for (let forsok = 0; forsok < 15; forsok += 1) {
          await new Promise((los) => setTimeout(los, 5_000));
          try {
            await this.klient!.request(
              "session/goal",
              { sessionId: this.sid, action: "clear" },
              30_000,
            );
            rensad = true;
            break;
          } catch (fel2) {
            sistaFel = fel2 instanceof Error ? fel2 : new Error(String(fel2));
            if (!/prompt is running|-32010/i.test(sistaFel.message)) throw sistaFel;
          }
        }
        if (!rensad) {
          throw new Error(
            "Mål-turnen kör fortfarande efter 75 s — målet rensades ej. Försök igen om en stund. (" +
              sistaFel.message.slice(0, 120) +
              ")",
          );
        }
      } else {
        throw fel;
      }
    }
    return { mal: null, meddelande: "Målet rensat." };
  }

  async lasSubagenter(): Promise<StudioSubagent[]> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    // BEVISAT schema v83-kartan §1: {sessionId, endedLimit≤100}.
    // LIVE-BEVISAT 2026-09-09 (prod, B3-E2E): en NYSS skapad session utan
    // turn-historik svarar -32004 "Session not found" — subagentregistret
    // känner bara persistent materialiserade sessioner. Det är ÄRLIGT en
    // tom lista (en session utan historik kan omöjligt ha barnagenter),
    // aldrig ett fel för panelen.
    let r: SubagentsResult | null;
    try {
      r = (await this.klient.request(
        "session/subagents",
        { sessionId: this.sid, endedLimit: 20 },
        30_000,
      )) as SubagentsResult | null;
    } catch (fel) {
      const text = fel instanceof Error ? fel.message : String(fel);
      if (/session not found|-32004/i.test(text)) return [];
      throw fel;
    }
    const körande = r?.running;
    const avslutade = r?.ended?.items;
    const ut: StudioSubagent[] = [];
    for (const rad of [
      ...(Array.isArray(körande) ? körande : []),
      ...(Array.isArray(avslutade) ? avslutade : []),
    ]) {
      const id = typeof rad?.childSessionId === "string" ? rad.childSessionId : "";
      const status = typeof rad?.status === "string" ? rad.status : "";
      if (!id || !status) continue;
      ut.push({
        barnSessionId: id,
        titel: typeof rad.title === "string" && rad.title ? rad.title : "Bakgrundsagent",
        typ: typeof rad.subagentType === "string" ? rad.subagentType : undefined,
        status: status as StudioSubagentStatus,
        startad: typeof rad.startedAt === "string" ? rad.startedAt : undefined,
        avslutad: typeof rad.endedAt === "string" ? rad.endedAt : undefined,
        sammanfattning: typeof rad.summary === "string" ? rad.summary : undefined,
      });
    }
    return ut;
  }

  async avbrytBakgrundsTask(taskId: string): Promise<StudioAvbrytSvar> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    if (typeof taskId !== "string" || !taskId) throw new Error("Task-id saknas.");
    // BEVISAT schema v83-kartan §1: {sessionId, taskId} → {cancelled,
    // reason?, status}. För subagenter används childSessionId som taskId
    // (listan saknar task-id — dokumenterat val).
    const r = (await this.klient.request(
      "session/cancelBackgroundTask",
      { sessionId: this.sid, taskId },
      30_000,
    )) as { cancelled?: boolean; reason?: string; status?: string } | null;
    const avbruten = r?.cancelled === true;
    return {
      avbruten,
      meddelande: avbruten
        ? `Tasken avbruten (status: ${typeof r?.status === "string" ? r.status : "?"}).`
        : r?.reason || `Kunde ej avbryta tasken (status: ${typeof r?.status === "string" ? r.status : "?"}).`,
    };
  }

  async lasArbetsyta(): Promise<StudioArbetsytaInfo | null> {
    // readState kräver LEVANDE klient men EGEN session — som lasSessioner.
    if (!this.klient?.lever) {
      this.klient = this.startaKlient();
      this.prenumererad = false;
    }
    try {
      const r = (await this.klient!.request(
        "workspace/readState",
        { workspace: { workspaceKey: this.arbetskatalog, workspacePath: this.arbetskatalog } },
        30_000,
      )) as WorkspaceStateResult | null;
      const s = r?.settings;
      const mc = s?.model?.current;
      const modell =
        typeof mc === "string"
          ? mc
          : mc?.providerId && mc?.modelId
            ? `${mc.providerId}/${mc.modelId}`
            : undefined;
      return {
        arbetsyta: typeof r?.workspace?.workspacePath === "string" ? r.workspace.workspacePath : this.arbetskatalog,
        lage: typeof s?.mode?.current === "string" ? s.mode.current : undefined,
        modell,
        tankeNiva: typeof s?.thoughtLevel?.current === "string" ? s.thoughtLevel.current : undefined,
        behorighet: typeof s?.permission?.mode === "string" ? s.permission.mode : undefined,
        modellerTillgangliga: Array.isArray(s?.model?.available) ? s.model.available.length : undefined,
        kommandon: Array.isArray(r?.slashCommands) ? r.slashCommands.length : undefined,
      };
    } catch {
      return null; // workspaceinfo är lyx, aldrig ett fel
    }
  }

  // ── V83 MEGA B1: filändringar (diff-panelens datakälla) ─────────────────

  async lasFilandringar(): Promise<StudioFilandring[]> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) return [];
    try {
      // Senaste turnens Write/Edit/MultiEdit-delar bär hela diffunderlaget
      // (VBe §5) — se filandringarUrMessages. Diff är lyx: ALDRIG fel.
      const svar = await this.klient.request(
        "session/messages",
        { sessionId: this.sid, limit: 60 },
        30_000,
      );
      return filandringarUrMessages(svar);
    } catch {
      return [];
    }
  }

  // ── V83 MEGA B2: permission- och interaktionsskikt (Z-portaLens) ────────

  /**
   * Server→klient-request ur interaktionsdomänen (kartan §3). Returnerar
   * protokollets result-objekt via ett promise som löser när användaren
   * svarar i UI:t — eller 30 s-defaulten (permission: escalate, fråga:
   * cancelled) så sessionen aldrig hänger. null = metoden stöds ej.
   */
  private async paServerRequest(metod: string, parametrar: unknown): Promise<unknown | null> {
    if (metod !== "interaction/requestPermission" && metod !== "interaction/requestUserInput") {
      return null;
    }
    const p = parametrar as {
      requestId?: unknown;
      toolName?: unknown;
      input?: unknown;
      reason?: unknown;
      riskLevel?: unknown;
      options?: unknown;
      toolCallId?: unknown;
      prompt?: unknown;
      inputType?: unknown;
      choices?: unknown;
    };
    // Nyckel: protokollets requestId (fallback toolCallId/tid — requestUserInput-
    // och permission-schemat bär båda requestId, kartan §3).
    const nyckel =
      typeof p.requestId === "string" && p.requestId
        ? p.requestId
        : typeof p.toolCallId === "string" && p.toolCallId
          ? `tc-${p.toolCallId}`
          : `imp-${Date.now().toString(36)}`;

    if (metod === "interaction/requestPermission") {
      const fardigaSvar = new Map<string, unknown>();
      const alternativ: StudioPermissionAlternativ[] = [];
      if (Array.isArray(p.options)) {
        for (const o of p.options as {
          optionId?: unknown;
          name?: unknown;
          description?: unknown;
          response?: unknown;
        }[]) {
          if (typeof o?.optionId !== "string" || !o.optionId) continue;
          alternativ.push({
            optionId: o.optionId,
            namn: typeof o.name === "string" && o.name ? o.name : o.optionId,
            beskrivning: typeof o.description === "string" && o.description ? o.description : undefined,
          });
          if (o.response && typeof o.response === "object") fardigaSvar.set(o.optionId, o.response);
        }
      }
      if (alternativ.length === 0) {
        // Defensiv: schemat lovar options — annars kan UI:t ändå svara.
        alternativ.push({ optionId: "allow_once", namn: "Allow once" }, { optionId: "deny", namn: "Deny" });
      }
      const verktyg = typeof p.toolName === "string" && p.toolName ? p.toolName : "okänt verktyg";
      return this.registreraInteraktion(
        {
          typ: "permission",
          requestId: nyckel,
          verktyg,
          risk: typeof p.riskLevel === "string" && p.riskLevel ? p.riskLevel : "medium",
          skäl: typeof p.reason === "string" && p.reason ? p.reason : undefined,
          sammanfattning: sammanfattaInput(p.input),
          alternativ,
        },
        {
          fardigaSvar,
          verktygNamn: verktyg,
          // KVD-DEFAULT: escalate — beslutet lämnas till servern men
          // sessionen hänger ALDRIG på en obesvarad dialog.
          standard: () => ({ decision: "escalate", reason: "ak1a-studio: inget klient-svar inom 30 s" }),
          standardBeslut: "eskal",
        },
      );
    }

    // interaction/requestUserInput {requestId, prompt, inputType?, choices?}
    const val: string[] = [];
    if (Array.isArray(p.choices)) {
      for (const c of p.choices) {
        if (typeof c === "string" && c) val.push(c);
      }
    }
    return this.registreraInteraktion(
      {
        typ: "fråga",
        requestId: nyckel,
        fråga: typeof p.prompt === "string" && p.prompt ? p.prompt : "Agenten väntar på svar",
        inputTyp: typeof p.inputType === "string" && p.inputType ? p.inputType : undefined,
        val: val.length > 0 ? val : undefined,
      },
      {
        // Timeout-default: cancelled (kartan §3-svar {cancelled:true}).
        standard: () => ({ cancelled: true }),
        standardBeslut: "avbruten",
      },
    );
  }

  /**
   * Registrera (eller re-annonsera — request-id kan skickas om, kartan §3)
   * en interaktion: notifiera den aktiva promptens ström (SSE → dialogkort)
   * + starta 30 s-defaulten. Returnerar promise: protokollsvaret.
   */
  private registreraInteraktion(
    interaktion: StudioInteraktion,
    opts: {
      fardigaSvar?: Map<string, unknown>;
      verktygNamn?: string;
      standard: () => unknown;
      standardBeslut: string;
    },
  ): Promise<unknown> {
    const befintlig = this.interaktioner.get(interaktion.requestId);
    if (befintlig && !befintlig.besvarad) {
      // Re-announce: visa dialogen igen, lös INTE ut en andra 30 s-räknare.
      this.notiferaInteraktion({ typ: "interaktion", interaktion: befintlig.interaktion });
      return new Promise((los) => befintlig.losare.push(los));
    }
    const post: VantanInteraktion = {
      interaktion,
      fardigaSvar: opts.fardigaSvar ?? new Map(),
      verktygNamn: opts.verktygNamn ?? "",
      losare: [],
      timer: null as unknown as ReturnType<typeof setTimeout>,
      besvarad: false,
    };
    post.timer = setTimeout(() => {
      this.besvaraInteraktion(interaktion.requestId, opts.standard(), opts.standardBeslut, "ingen respons inom 30 s");
    }, 30_000);
    this.interaktioner.set(interaktion.requestId, post);
    this.notiferaInteraktion({ typ: "interaktion", interaktion });
    return new Promise((los) => post.losare.push(los));
  }

  /** Lös en interaktion: skicka svaret till protokollet + stäng UI-kortet. */
  private besvaraInteraktion(
    requestId: string,
    result: unknown,
    beslut: string,
    skal?: string,
  ): boolean {
    const post = this.interaktioner.get(requestId);
    if (!post || post.besvarad) return false;
    post.besvarad = true;
    clearTimeout(post.timer);
    this.interaktioner.delete(requestId);
    for (const los of post.losare) los(result);
    this.notiferaInteraktion({
      typ: "interaktionsKlar",
      requestId,
      beslut,
      ...(skal ? { skal } : {}),
    });
    return true;
  }

  /** Interaktionsnotis till aktiv prompt-ström — registret lever alltid. */
  private notiferaInteraktion(event: StudioEvent): void {
    const aktiv = this.aktiv;
    if (!aktiv || aktiv.färdig) return;
    try {
      aktiv.lyssnare(event);
    } catch {
      // strömmen bruten — 30 s-defaulten fångar upp
    }
  }

  /** Lös ALLA väntande interaktioner (session kasseras/stängs). */
  private rensaVantandeInteraktioner(): void {
    for (const [nyckel, post] of [...this.interaktioner]) {
      if (post.besvarad) continue;
      this.besvaraInteraktion(
        nyckel,
        post.interaktion.typ === "permission"
          ? { decision: "deny", reason: "ak1a-studio: sessionen kasserades" }
          : { cancelled: true },
        "avbruten",
        "sessionen byttes",
      );
    }
  }

  vantaInteraktioner(): StudioInteraktion[] {
    return [...this.interaktioner.values()].map((p) => p.interaktion);
  }

  async svarPermission(
    requestId: string,
    alternativId: string,
  ): Promise<{ ok: boolean; beslut: string; skäl?: string }> {
    const post = this.interaktioner.get(requestId);
    if (!post || post.besvarad || post.interaktion.typ !== "permission") {
      return { ok: false, beslut: "okänd", skäl: "begäran finns ej eller är redan besvarad" };
    }
    // Bygg z2-svaret: protokollets förslagade response vinner om den finns,
    // annars mappas de bevisade optionId:n till beslutsformerna (kartan §3:
    // allow_project motsvaras av permissionUpdates addRules allow).
    const etikett =
      alternativId === "allow_once"
        ? "tillåtet en gång"
        : alternativId === "allow_project"
          ? "tillåtet för projektet"
          : alternativId === "deny"
            ? "nekat"
            : alternativId;
    const result =
      post.fardigaSvar.get(alternativId) ??
      ((): unknown => {
        switch (alternativId) {
          case "allow_once":
            return { decision: "allow", reason: "allow_once via ak1a-studio" };
          case "allow_project":
            return {
              decision: "allow",
              reason: "allow_project via ak1a-studio",
              permissionUpdates: [
                { type: "addRules", behavior: "allow", rules: [{ toolName: post.verktygNamn }] },
              ],
            };
          case "deny":
            return { decision: "deny", reason: "deny via ak1a-studio" };
          default:
            return { decision: "deny", reason: `okänt alternativ ${alternativId.slice(0, 40)}` };
        }
      })();
    this.besvaraInteraktion(requestId, result, etikett);
    return { ok: true, beslut: etikett };
  }

  async svarFraga(requestId: string, svar: { varde?: string; avbruten?: boolean }): Promise<{ ok: boolean }> {
    const post = this.interaktioner.get(requestId);
    if (!post || post.besvarad || post.interaktion.typ !== "fråga") return { ok: false };
    const result = svar.avbruten
      ? { cancelled: true }
      : { value: typeof svar.varde === "string" ? svar.varde : "" };
    this.besvaraInteraktion(requestId, result, svar.avbruten ? "avbruten" : "besvarad");
    return { ok: true };
  }

  async sattLage(lage: "build" | "plan"): Promise<{ lage: string }> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    if (this.aktiv && !this.aktiv.färdig) {
      throw new Error("En prompt kör — vänta tills agenten är klar.");
    }
    // BEVISAT LIVE (kartan §1): session/setMode {sessionId, mode} → snapshot.
    const svar = await this.klient.request(
      "session/setMode",
      { sessionId: this.sid, mode: lage },
      30_000,
    );
    const bekräftad = lasLageUrSnapshot(svar) ?? lage;
    this.lage = lage;
    this.sparaPersistens(this.sid);
    return { lage: bekräftad };
  }

  async sattTankeNiva(niva: string): Promise<{ niva: string }> {
    // LIVE-bevisade nivåer (kartan §1): nothink | high | max. KVD-texten
    // "off/medium/high" är generisk protokollterminologi — de ÄRLIGA,
    // first-hand bevisade nivåerna för zai/GLM är dessa tre.
    if (!["nothink", "high", "max"].includes(niva)) {
      throw new Error(`Okänd tankestyrka "${niva.slice(0, 30)}" — använd nothink, high eller max.`);
    }
    await this.ensure();
    if (!this.sid || !this.klient?.lever) throw new Error("session ej tillgänglig");
    if (this.aktiv && !this.aktiv.färdig) {
      throw new Error("En prompt kör — vänta tills agenten är klar.");
    }
    // BEVISAT LIVE (kartan §1): session/setThoughtLevel → snapshot.
    const svar = await this.klient.request(
      "session/setThoughtLevel",
      { sessionId: this.sid, thoughtLevel: niva },
      30_000,
    );
    const bekräftad = lasTankeNivaUrSnapshot(svar) ?? niva;
    this.tankeNiva = niva;
    this.sparaPersistens(this.sid);
    return { niva: bekräftad };
  }

  /** Notis-mottagare: översätter protokollhändelser till StudioEvent. */
  private påNotis(m: ProtokollMeddelande): void {
    const aktiv = this.aktiv;
    const params = m.params as SessionEventParams | StateUpdatedParams | undefined;

    if (m.method === "session/event") {
      const p = params as SessionEventParams | undefined;
      const payload = p?.payload;
      // ROTORSAK v81-STUDIO-2 (bevisat live 2026-09-09): zcode ≥ 3.11.2-22
      // lägger händelsetypen på PARAMS-nivå (params.type), inte i payload —
      // gamla koden läste payload.type och tappade därmed ALLA events
      // (deltas kom aldrig fram; strömmen stod stilla). Fallback till
      // payload.type behålls för äldre protokollform.
      const typ = p?.type ?? payload?.type;
      if (!typ) return;
      // Event från annan session än den aktva (t.ex. en kasserad session
      // under självläknings-omskapandet) skall aldrig blandas in.
      if (p?.sessionId && this.sid && p.sessionId !== this.sid) return;
      if (!aktiv || aktiv.färdig) return; // utanför pågående prompt: strunt

      switch (typ) {
        case "turn.started":
          // V83 B1: rundstatistik — fas "start" (turnNumber finns i payload).
          aktiv.lyssnare({ typ: "runda", fas: "start" });
          aktiv.lyssnare({ typ: "status", text: "Agenten arbetar…" });
          return;
        case "tool.updated": {
          // V83 B1 (kartan §4A + LIVE-sond tool-results/v83-b1-toolupdated-
          // sond.mjs 2026-09-09): kinds scheduled/started/progress/result/
          // error — varje verktygskall blir ett kort (merge på toolCallId).
          // SONDFAKTA: kind "result" bär {toolCallId,result,duration} UTAN
          // toolName — namn skickas DÄRFÖR bara när protokollet säger det,
          // så UI:t:s merge (event.namn ?? befintligt.namn) aldrig skriver
          // över "Bash" med "verktyg". Kind "scheduled" bär ENBART inputRef/
          // inputByteLength (inputOmitted) — argumenten kommer via
          // model.streaming tool_call (den mappningen lever kvar nedan).
          const kind = payload?.kind;
          const id =
            typeof payload?.toolCallId === "string" && payload.toolCallId
              ? payload.toolCallId
              : `tc-ingen-id-${this.okandaVerktyg++}`;
          const namn =
            typeof payload?.toolName === "string" && payload.toolName ? payload.toolName : undefined;
          if (kind === "scheduled") {
            aktiv.lyssnare({
              typ: "verktyg_kort",
              id,
              ...(namn ? { namn } : {}),
              steg: "planerad",
              argument: argumentText(payload?.input),
              beskrivning: typeof payload?.description === "string" ? payload.description : undefined,
            });
            // Bakåtkompatibel chip-rad (v81-UI) lever kvar.
            if (namn) aktiv.lyssnare({ typ: "verktyg", namn, händelse: "start" });
          } else if (kind === "started") {
            aktiv.lyssnare({
              typ: "verktyg_kort",
              id,
              ...(namn ? { namn } : {}),
              steg: "startar",
            });
          } else if (kind === "progress") {
            aktiv.lyssnare({
              typ: "verktyg_kort",
              id,
              ...(namn ? { namn } : {}),
              steg: "kör",
              framsteg: {
                elapsedMs: typeof payload?.elapsedMs === "number" ? payload.elapsedMs : undefined,
                utdata:
                  typeof payload?.stdoutTail === "string" && payload.stdoutTail
                    ? truncat(payload.stdoutTail, MAX_PROGRESS_TEEKEN)
                    : typeof payload?.stderrTail === "string" && payload.stderrTail
                      ? truncat(payload.stderrTail, MAX_PROGRESS_TEEKEN)
                      : undefined,
              },
            });
          } else if (kind === "result") {
            aktiv.lyssnare({
              typ: "verktyg_kort",
              id,
              ...(namn ? { namn } : {}),
              steg: "resultat",
              resultat: resultatText(payload?.result),
              varaktighetMs: typeof payload?.duration === "number" ? payload.duration : undefined,
            });
            if (namn) aktiv.lyssnare({ typ: "verktyg", namn, händelse: "slut" });
          } else if (kind === "error") {
            aktiv.lyssnare({
              typ: "verktyg_kort",
              id,
              ...(namn ? { namn } : {}),
              steg: "fel",
              fel: felText(payload?.error),
            });
            if (namn) aktiv.lyssnare({ typ: "verktyg", namn, händelse: "slut" });
          }
          return;
        }
        case "part.delta": {
          // Defensivt (kartan §4A): part.delta field "input" = verktygs-
          // argument strömmas i partedeln — samma live-vy som tool_input.
          if (payload?.field === "input" && typeof payload?.delta === "string" && payload.delta) {
            aktiv.lyssnare({
              typ: "verktyg_input",
              id: typeof payload?.partId === "string" && payload.partId ? payload.partId : "live",
              text: payload.delta,
            });
          }
          return;
        }
        case "model.streaming": {
          // V83 B1: tool_input_delta strömmar argumenten MEDAN modellen
          // skriver dem ("läser fil X…") — tool_call lever hela paketet.
          const kind = typeof payload?.kind === "string" ? payload.kind : "";
          if (kind === "tool_input_delta" && typeof payload?.delta === "string" && payload.delta) {
            aktiv.lyssnare({
              typ: "verktyg_input",
              id:
                typeof payload?.toolCallId === "string" && payload.toolCallId
                  ? payload.toolCallId
                  : "live",
              text: payload.delta,
            });
            return;
          }
          if (kind === "tool_call") {
            aktiv.lyssnare({
              typ: "verktyg_kort",
              id:
                typeof payload?.toolCallId === "string" && payload.toolCallId
                  ? payload.toolCallId
                  : `tc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
              namn:
                typeof payload?.toolName === "string" && payload.toolName
                  ? payload.toolName
                  : "verktyg",
              steg: "planerad",
              argument: argumentText(payload?.input),
            });
            return;
          }
          if (typeof payload?.delta !== "string" || !payload.delta) return;
          aktiv.lyssnare({
            typ: "delta",
            kanal: payload.kind === "reasoning_delta" ? "tankar" : "text",
            text: payload.delta,
          });
          if (payload.kind !== "reasoning_delta") aktiv.senasteText += payload.delta;
          return;
        }
        case "model.response.completed":
          // Helheten — sparas som fallback om sluteventet uteblir.
          if (typeof payload?.content === "string" && payload.content) {
            aktiv.senasteText = payload.content;
          }
          return;
        case "turn":
        case "turn.completed": {
          // SLUTPIXEL (bevisat live 2026-09-09): params.type "turn.completed"
          // med payload.response = hela svaret ("turn" = äldre form).
          aktiv.färdig = true;
          // V83 B1: rundstatistiken FÖRE klart-pixeln (duration, resultType,
          // toolCallCount — kartan §4A turn.completed-payload).
          aktiv.lyssnare({
            typ: "runda",
            fas: "slut",
            varaktighetMs: typeof payload?.duration === "number" ? payload.duration : undefined,
            resultatTyp: typeof payload?.resultType === "string" ? payload.resultType : undefined,
            verktygAntal: typeof payload?.toolCallCount === "number" ? payload.toolCallCount : undefined,
            tokenCount: typeof payload?.tokenCount === "number" ? payload.tokenCount : undefined,
          });
          if (typeof payload?.resultType === "string" && payload.resultType !== "success") {
            // Ärligt fel i stället för tomt "klart" (ALDRIG tystnad).
            aktiv.lyssnare({
              typ: "fel",
              meddelande: `Agentrundan avslutades utan lyckat resultat (${payload.resultType}).`,
            });
          } else {
            aktiv.lyssnare({
              typ: "klart",
              svar:
                typeof payload?.response === "string" && payload.response
                  ? payload.response
                  : aktiv.senasteText,
              tokenCount: typeof payload?.tokenCount === "number" ? payload.tokenCount : undefined,
              varaktighetMs: typeof payload?.duration === "number" ? payload.duration : undefined,
            });
          }
          aktiv.klar();
          return;
        }
        default: {
          // Verktygshändelser (tool.* — namn varierar mellan versioner):
          // start när typen inte slutar på finish/completed/ended.
          if (typ.startsWith("tool.")) {
            const namn = payload?.name || payload?.toolName || "verktyg";
            const slut = /finish|completed|ended|result$/i.test(typ);
            aktiv.lyssnare({ typ: "verktyg", namn, händelse: slut ? "slut" : "start" });
          }
          return;
        }
      }
    }

    if (m.method === "state.updated") {
      const patch = (params as StateUpdatedParams | undefined)?.patch;
      const status = patch?.status;
      // Compact-väckare: kompakteringsturnen slutar med idle (BEVISAT v82 —
      // broadcasten kommer även utan pågående prompt).
      if (status === "idle" && this.idleVakt) this.idleVakt();
      if (!aktiv || aktiv.färdig) return;
      if (status === "running") {
        // V83 B1: state.updated-patchen kan bära projektionen (tasks) —
        // räkna aktiva verktyg för en ärlig "arbetar"-rad.
        const aktivaVerktyg = Array.isArray(patch?.activeToolCalls) ? patch.activeToolCalls.length : 0;
        const bakgrund = Array.isArray(patch?.backgroundJobs) ? patch.backgroundJobs.length : 0;
        const extra = aktivaVerktyg > 0 ? ` (${aktivaVerktyg} verktyg kör)` : bakgrund > 0 ? ` (+${bakgrund} bakgrund)` : "";
        aktiv.lyssnare({ typ: "status", text: `Agenten arbetar…${extra}` });
      } else if (status === "idle") {
        // Fallback-slut: "turn"-eventet är primärt; idle efter 1,5 s utan
        // det betyder ändå att agenten är klar (bevisad ordning i testerna).
        setTimeout(() => {
          if (this.aktiv === aktiv && !aktiv.färdig) {
            aktiv.färdig = true;
            aktiv.lyssnare({ typ: "klart", svar: aktiv.senasteText });
            aktiv.klar();
          }
        }, 1_500);
      }
    }
  }

  async historik(): Promise<StudioHistorikPost[]> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) return [];
    try {
      const svar = await this.klient.request(
        "session/messages",
        { sessionId: this.sid, limit: 60 },
        30_000,
      );
      const meddelanden = (svar as { messages?: unknown[] } | null)?.messages;
      if (!Array.isArray(meddelanden)) return [];
      const ut: StudioHistorikPost[] = [];
      for (const m of meddelanden) {
        const info = (m as { info?: { role?: unknown } }).info;
        const roll = info?.role;
        if (roll !== "user" && roll !== "assistant") continue;
        // BEVISAT form: parts[] med type "text" bär textfältet.
        const delar = (m as { parts?: { type?: string; text?: unknown }[] }).parts ?? [];
        const text = delar
          .filter((d) => d.type === "text" && typeof d.text === "string")
          .map((d) => d.text as string)
          .join("\n")
          .trim();
        if (text) ut.push({ roll, text });
      }
      return ut.slice(-40);
    } catch {
      return []; // historik är lyx, aldrig ett fel för chatten
    }
  }

  async skicka(prompt: string, lyssnare: StudioLyssnare, signal?: AbortSignal): Promise<void> {
    await this.ensure();
    if (!this.sid || !this.klient?.lever) {
      throw new Error("session ej tillgänglig");
    }
    if (this.aktiv && !this.aktiv.färdig) {
      lyssnare({ typ: "fel", meddelande: "En prompt kör redan — vänta tills agenten är klar." });
      return;
    }

    await new Promise<void>((losa) => {
      const aktiv: AktivPrompt = {
        lyssnare,
        senasteText: "",
        färdig: false,
        klar: () => {
          städa();
          losa();
        },
      };
      this.aktiv = aktiv;

      // Hårt tak: 10 minuter räcker för långa agentrundor; client-abort
      // (req.signal) eldar session/stop och löser strömmen.
      const tak = setTimeout(() => {
        if (this.aktiv === aktiv && !aktiv.färdig) {
          aktiv.färdig = true;
          lyssnare({
            typ: "fel",
            meddelande: "Tidsgränsen nåddes (10 min) — svaret kan vara ofullständigt.",
          });
          städa();
          losa();
        }
      }, 10 * 60_000);
      const påAbort = () => {
        try {
          this.klient?.notis("session/stop", { sessionId: this.sid ?? "" });
        } catch {
          // eldränge — barnprocessen kan ha dött
        }
        if (this.aktiv === aktiv && !aktiv.färdig) {
          aktiv.färdig = true;
          städa();
          losa();
        }
      };
      const städa = () => {
        clearTimeout(tak);
        signal?.removeEventListener("abort", påAbort);
        if (this.aktiv === aktiv) this.aktiv = null;
      };
      if (signal) {
        if (signal.aborted) {
          påAbort();
          return;
        }
        signal.addEventListener("abort", påAbort, { once: true });
      }

      // Översändning med EN självläkningsretry: om sessionens modell
      // tagits bort (-32031 ZCODE_RUNTIME_MODEL_UNAVAILABLE — bevisat
      // 2026-09-09 när glm-5.3-flash stängdes av på servern) kasseras
      // sessionen, en färsk skapas med aktuell modell och send körs en
      // gång till. Alla andra fel (även retryns) → tydligt fel-event.
      const oversand = async (): Promise<void> => {
        if (!this.klient?.lever || !this.sid) throw new Error("session ej tillgänglig");
        try {
          const svar = await this.klient.request(
            "session/send",
            { sessionId: this.sid, content: prompt },
            60_000,
          );
          if ((svar as { accepted?: boolean } | null)?.accepted === false) {
            throw new Error("Prompten avvisades av agenten.");
          }
          return; // accepted:true → vänta på turn/idle-notiserna (taket vaktar)
        } catch (fel) {
          if (signal?.aborted) throw fel;
          const text = fel instanceof Error ? fel.message : String(fel);
          if (arModellOtillganglig(text) && this.aktiv === aktiv && !aktiv.färdig) {
            lyssnare({
              typ: "status",
              text: "Sessionens modell är ej längre tillgänglig — skapar ny session…",
            });
            // Intern frisk-session-väg (UTAN prompt-vakt) — dödlägesfix
            // bevisad på prod 2026-09-09: nySession vägrade under retryn.
            await this.skapaFriskSession();
            const svar = await this.klient!.request(
              "session/send",
              { sessionId: this.sid!, content: prompt },
              60_000,
            );
            if ((svar as { accepted?: boolean } | null)?.accepted === false) {
              throw new Error("Prompten avvisades av agenten.");
            }
            return; // vänta på events från den nya sessionen
          }
          throw fel;
        }
      };
      oversand().catch((fel: unknown) => {
        if (this.aktiv === aktiv && !aktiv.färdig) {
          aktiv.färdig = true;
          lyssnare({
            typ: "fel",
            meddelande: `Kunde ej skicka till agenten: ${fel instanceof Error ? fel.message : String(fel)}`,
          });
        }
        städa();
        losa();
      });
    });
  }

  private lasSparadSession(): { sessionId: string | null; modell?: string; lage?: string; tankeNiva?: string } {
    try {
      const rå = readFileSync(this.lagringsSökväg, "utf8");
      const pars = JSON.parse(rå) as {
        sessionId?: unknown;
        modell?: unknown;
        lage?: unknown;
        tankeNiva?: unknown;
      };
      const sid = typeof pars.sessionId === "string" && pars.sessionId.startsWith("sess_") ? pars.sessionId : null;
      const modell = typeof pars.modell === "string" && pars.modell ? pars.modell : undefined;
      const lage = typeof pars.lage === "string" && (pars.lage === "build" || pars.lage === "plan") ? pars.lage : undefined;
      const tankeNiva =
        typeof pars.tankeNiva === "string" && ["nothink", "high", "max"].includes(pars.tankeNiva)
          ? pars.tankeNiva
          : undefined;
      return { sessionId: sid, modell, lage, tankeNiva };
    } catch {
      return { sessionId: null };
    }
  }
}

// ── mockTransport ────────────────────────────────────────────────────────────

/**
 * Deterministisk demo/test-transport: strömmar ett canned markdown-svar i
 * bitar med små pauser, rapporterar verktygsstatus och "klart". Ingen
 * barnprocess, ingen modell, inga kostnader — DEV på arbetsstationen och
 * enhetstest av SSE-bryggan (dev-testet i verktyg/testa-studio.mjs).
 */
class MockTransport implements StudioTransport {
  readonly namn = "mock" as const;
  private mockSid: string | null = null;
  private mockModell: string | null = null;
  private mockTotalt = 0;
  private mockTurns = 0;
  private readonly historikPoster: StudioHistorikPost[] = [];
  private readonly gamlaSessioner: StudioSessionPost[] = [];
  /** v83 B3: historik + metadata per avlagd session (resume i mock). */
  private readonly mockHistorik = new Map<string, StudioHistorikPost[]>();
  private readonly mockMeta = new Map<string, { turns: number; tokens: number }>();
  private mockMal: string | null = null;
  private readonly mockSubagenter: StudioSubagent[] = [
    {
      barnSessionId: "sess_mock_sub_1",
      titel: "Bakgrundsagent (mock)",
      typ: "demo",
      status: "running",
      startad: new Date(Date.now() - 90_000).toISOString(),
    },
    {
      barnSessionId: "sess_mock_sub_2",
      titel: "Avslutad agent (mock)",
      typ: "demo",
      status: "success",
      startad: new Date(Date.now() - 600_000).toISOString(),
      avslutad: new Date(Date.now() - 300_000).toISOString(),
    },
  ];
  /** V83 B1: senaste mock-turnens "filändringar" (Write-kortets diff). */
  private mockAndringar: StudioFilandring[] = [];
  /** V83 B2: väntande simulerad permission-dialog (dev-kedjans bevis). */
  private mockVantan: { interaktion: Extract<StudioInteraktion, { typ: "permission" }>; los: (beslut: string) => void } | null = null;
  /** V83 B2: väntande simulerat frågekort (requestUserInput). */
  private mockVantanFraga: { interaktion: Extract<StudioInteraktion, { typ: "fråga" }>; los: (varde: string) => void } | null = null;
  /** V83 B2: mock-läge + tankestyrka (satt via sattLage/sattTankeNiva). */
  private mockLage: "build" | "plan" | null = null;
  private mockTankeNiva: string | null = null;

  sessionId(): string | null {
    return this.mockSid;
  }

  async ensure(): Promise<void> {
    if (!this.mockSid) this.mockSid = `sess_mock_${Date.now().toString(36)}`;
  }

  async historik(): Promise<StudioHistorikPost[]> {
    return [...this.historikPoster];
  }

  async bytModell(modellId: string): Promise<StudioBytModellSvar> {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,80}$/.test(modellId)) throw new Error("Ogiltigt modell-id.");
    this.mockModell = modellId;
    const sid = await this.nySession(modellId);
    return { sessionId: sid, väg: "create", modell: `zai/${modellId}` };
  }

  async nySession(modellId?: string): Promise<string> {
    if (modellId) this.mockModell = modellId;
    if (this.mockSid) {
      // "Tidigare sessioner" finns kvar i listan även efter kassering —
      // v83 B3: historik + turns/tokens sparas så resume kan återge dem.
      this.mockHistorik.set(this.mockSid, [...this.historikPoster]);
      this.mockMeta.set(this.mockSid, { turns: this.mockTurns, tokens: this.mockTotalt });
      this.gamlaSessioner.unshift({
        sessionId: this.mockSid,
        titel: this.historikPoster[0]?.text.slice(0, 60) || "Mock-session",
        status: "idle",
        modell: this.mockModell ? `mock/${this.mockModell}` : "mock/demo",
        turns: this.mockTurns,
        tokens: this.mockTotalt,
        uppdaterad: new Date().toISOString(),
      });
    }
    this.historikPoster.length = 0;
    this.mockTotalt = 0;
    this.mockTurns = 0;
    this.mockSid = `sess_mock_${Date.now().toString(36)}`;
    return this.mockSid;
  }

  async lasSessioner(): Promise<StudioSessionPost[]> {
    await this.ensure();
    return [
      {
        sessionId: this.mockSid!,
        titel: "Aktiv mock-session",
        status: "idle",
        modell: this.mockModell ? `mock/${this.mockModell}` : "mock/demo",
        turns: this.mockTurns,
        tokens: this.mockTotalt,
        uppdaterad: new Date().toISOString(),
      },
      ...this.gamlaSessioner,
    ].slice(0, 25);
  }

  async compact(): Promise<StudioCompactSvar> {
    await this.ensure();
    this.mockTotalt = Math.round(this.mockTotalt * 0.2);
    return {
      status: this.mockTurns === 0 ? "tom" : "klar",
      meddelande: "Mock: kontexten nollställd till 20 % (deterministisk no-op).",
      kontext: await this.lasKontext(),
    };
  }

  async lasKontext(): Promise<StudioKontext | null> {
    await this.ensure();
    return {
      modell: this.mockModell ? `mock/${this.mockModell}` : "mock/demo",
      contextUsed: this.mockTotalt,
      // KVD-reservtak 1M används i mock (protokollets ärliga tak saknas).
      contextWindow: 1_000_000,
      totalTokenCount: this.mockTotalt,
      turnCount: this.mockTurns,
      lage: this.mockLage ?? undefined,
      tankeNiva: this.mockTankeNiva ?? undefined,
    };
  }

  // ── V83 B1: filändringar — mockens deterministiska Write-diff ───────────

  async lasFilandringar(): Promise<StudioFilandring[]> {
    await this.ensure();
    return this.mockAndringar.map((f) => ({ ...f, rader: [...f.rader] }));
  }

  // ── V83 B2: interaktionsskiktet — deterministisk dev-simulering ─────────

  vantaInteraktioner(): StudioInteraktion[] {
    const ut: StudioInteraktion[] = [];
    if (this.mockVantan) ut.push(this.mockVantan.interaktion);
    if (this.mockVantanFraga) ut.push(this.mockVantanFraga.interaktion);
    return ut;
  }

  async svarPermission(
    requestId: string,
    alternativId: string,
  ): Promise<{ ok: boolean; beslut: string; skäl?: string }> {
    const v = this.mockVantan;
    if (!v || v.interaktion.requestId !== requestId) {
      return { ok: false, beslut: "okänd", skäl: "begäran finns ej eller är redan besvarad" };
    }
    this.mockVantan = null;
    const etikett =
      alternativId === "allow_once"
        ? "tillåtet en gång"
        : alternativId === "allow_project"
          ? "tillåtet för projektet"
          : alternativId === "deny"
            ? "nekat"
            : alternativId;
    v.los(alternativId);
    return { ok: true, beslut: etikett };
  }

  async svarFraga(requestId: string, svar: { varde?: string; avbruten?: boolean }): Promise<{ ok: boolean }> {
    const v = this.mockVantanFraga;
    if (!v || v.interaktion.requestId !== requestId) return { ok: false };
    this.mockVantanFraga = null;
    v.los(svar.avbruten ? "" : (svar.varde ?? ""));
    return { ok: true };
  }

  async sattLage(lage: "build" | "plan"): Promise<{ lage: string }> {
    this.mockLage = lage;
    return { lage };
  }

  async sattTankeNiva(niva: string): Promise<{ niva: string }> {
    if (!["nothink", "high", "max"].includes(niva)) {
      throw new Error(`Okänd tankestyrka "${niva.slice(0, 30)}" — använd nothink, high eller max.`);
    }
    this.mockTankeNiva = niva;
    return { niva };
  }

  // ── V83 B3 (mock): sessions- och workspace-hantering, deterministisk ────

  async oppnaSession(sessionId: string): Promise<StudioOppnaSvar> {
    if (!/^sess_[A-Za-z0-9._-]+$/.test(sessionId)) throw new Error("Ogiltigt sessions-id.");
    await this.ensure();
    if (sessionId !== this.mockSid && !this.gamlaSessioner.some((s) => s.sessionId === sessionId)) {
      throw new Error("Sessionen finns ej (mock).");
    }
    if (sessionId !== this.mockSid) {
      // Lägg undan nuvarande innan resumen tar över (spegla nySession).
      this.mockHistorik.set(this.mockSid!, [...this.historikPoster]);
      this.mockMeta.set(this.mockSid!, { turns: this.mockTurns, tokens: this.mockTotalt });
      const post = this.gamlaSessioner.find((s) => s.sessionId === sessionId);
      this.mockSid = sessionId;
      this.historikPoster.length = 0;
      const sparad = this.mockHistorik.get(sessionId);
      if (sparad) this.historikPoster.push(...sparad);
      const meta = this.mockMeta.get(sessionId);
      this.mockTurns = meta?.turns ?? post?.turns ?? 0;
      this.mockTotalt = meta?.tokens ?? post?.tokens ?? 0;
    }
    return {
      sessionId: sessionId,
      historik: [...this.historikPoster],
      kontext: await this.lasKontext(),
    };
  }

  async stangSession(sessionId?: string): Promise<boolean> {
    await this.ensure();
    const mal = sessionId ?? this.mockSid;
    if (!mal) throw new Error("Ingen session att stänga.");
    for (const s of this.gamlaSessioner) {
      if (s.sessionId === mal) s.status = "completed";
    }
    if (mal === this.mockSid) {
      // Spegla app-servern: stängd aktiv session ⇒ nästa ensure föder frisk.
      this.mockHistorik.set(mal, [...this.historikPoster]);
      this.mockMeta.set(mal, { turns: this.mockTurns, tokens: this.mockTotalt });
      if (!this.gamlaSessioner.some((s) => s.sessionId === mal)) {
        this.gamlaSessioner.unshift({
          sessionId: mal,
          titel: this.historikPoster[0]?.text.slice(0, 60) || "Mock-session",
          status: "completed",
          modell: this.mockModell ? `mock/${this.mockModell}` : "mock/demo",
          turns: this.mockTurns,
          tokens: this.mockTotalt,
          uppdaterad: new Date().toISOString(),
        });
      }
      this.mockSid = null;
      this.historikPoster.length = 0;
      this.mockTotalt = 0;
      this.mockTurns = 0;
    }
    return true;
  }

  async forka(): Promise<StudioForkSvar> {
    await this.ensure();
    const forkedSessionId = `sess_mock_fork_${Date.now().toString(36)}`;
    return {
      forkedSessionId,
      meddelande: `Mock: fork skapad (${forkedSessionId}) — riktigt läge kräver checkpoint.`,
    };
  }

  async lasMal(): Promise<StudioMalSvar> {
    await this.ensure();
    return this.mockMal
      ? { mal: this.mockMal, meddelande: this.mockMal }
      : { mal: null, meddelande: "Inget mål är satt för sessionen." };
  }

  async sattMal(mal: string): Promise<StudioMalSvar> {
    const malText = mal.trim().slice(0, 500);
    if (!malText) throw new Error("Målet är tomt.");
    await this.ensure();
    this.mockMal = malText;
    return { mal: malText, meddelande: "Mock: målet satt." };
  }

  async rensaMal(): Promise<StudioMalSvar> {
    await this.ensure();
    this.mockMal = null;
    return { mal: null, meddelande: "Mock: målet rensat." };
  }

  async lasSubagenter(): Promise<StudioSubagent[]> {
    await this.ensure();
    return this.mockSubagenter.map((s) => ({ ...s }));
  }

  async avbrytBakgrundsTask(taskId: string): Promise<StudioAvbrytSvar> {
    await this.ensure();
    const agent = this.mockSubagenter.find((s) => s.barnSessionId === taskId);
    if (!agent) {
      return { avbruten: false, meddelande: `Mock: tasken ${taskId.slice(0, 13)}… hittades ej.` };
    }
    if (agent.status !== "running" && agent.status !== "waiting" && agent.status !== "blocked") {
      return { avbruten: false, meddelande: `Mock: agenten är redan ${agent.status}.` };
    }
    agent.status = "cancelled";
    agent.avslutad = new Date().toISOString();
    return { avbruten: true, meddelande: "Mock: tasken avbruten." };
  }

  async lasArbetsyta(): Promise<StudioArbetsytaInfo | null> {
    await this.ensure();
    return {
      arbetsyta: "/home/ak1a/agent/ak1",
      lage: "build",
      modell: this.mockModell ? `mock/${this.mockModell}` : "mock/demo",
      tankeNiva: "max",
      behorighet: "auto",
      modellerTillgangliga: 5,
      kommandon: 12,
    };
  }

  async skicka(prompt: string, lyssnare: StudioLyssnare, signal?: AbortSignal): Promise<void> {
    await this.ensure();
    const sov = (ms: number) =>
      new Promise<void>((los) => {
        const t = setTimeout(los, ms);
        signal?.addEventListener("abort", () => { clearTimeout(t); los(); }, { once: true });
      });

    // V83 B1: verktygskorten strömmas i protokollföljd — runda → live-input
    // → kortens livscykel (planerad/startar/kör/resultat/fel) → runda slut.
    lyssnare({ typ: "runda", fas: "start" });
    lyssnare({ typ: "status", text: "Agenten arbetar… (mock)" });
    await sov(100);

    // Kort 1: Bash — live-input (model.streaming tool_input_delta) + progress.
    lyssnare({ typ: "verktyg_kort", id: "mock-bash", namn: "Bash", steg: "planerad", beskrivning: "Listar uppladdningar" });
    for (const bit of ['{"comm', 'and":"ls u', 'ploads/"}']) {
      if (signal?.aborted) break;
      lyssnare({ typ: "verktyg_input", id: "mock-bash", text: bit });
      await sov(60);
    }
    lyssnare({ typ: "verktyg_kort", id: "mock-bash", namn: "Bash", steg: "startar", argument: '{"command":"ls uploads/"}' });
    await sov(110);
    lyssnare({
      typ: "verktyg_kort",
      id: "mock-bash",
      namn: "Bash",
      steg: "kör",
      framsteg: { elapsedMs: 140, utdata: "2026-09-08\n2026-09-09" },
    });
    await sov(140);
    lyssnare({
      typ: "verktyg_kort",
      id: "mock-bash",
      namn: "Bash",
      steg: "resultat",
      argument: '{"command":"ls uploads/"}',
      resultat: "2026-09-08\n2026-09-09",
      varaktighetMs: 290,
    });

    // Kort 2: Write — ger ändringspanelen dess deterministiska diff.
    lyssnare({ typ: "verktyg_kort", id: "mock-write", namn: "Write", steg: "planerad" });
    await sov(70);
    lyssnare({ typ: "verktyg_kort", id: "mock-write", namn: "Write", steg: "resultat", argument: '{"file_path":"uploads/demo.txt","content":"rad 1\nrad 2\nrad 3"}', resultat: "Filen skapad (3 rader).", varaktighetMs: 80 });
    this.mockAndringar = [
      {
        sokvag: "uploads/demo.txt",
        plus: 3,
        minus: 0,
        rader: [
          { typ: "+", text: "rad 1" },
          { typ: "+", text: "rad 2" },
          { typ: "+", text: "rad 3" },
        ],
      },
    ];

    // Kort 3: Grep med FEL — det röda kortet.
    lyssnare({ typ: "verktyg_kort", id: "mock-grep", namn: "Grep", steg: "startar", argument: '{"pattern":"finans*"}' });
    await sov(90);
    lyssnare({ typ: "verktyg_kort", id: "mock-grep", namn: "Grep", steg: "fel", fel: "Ogiltigt regex: oavslutad grupp (mock-demo av fel-vägen)" });

    // V83 B2: simulerad PERMISSION-DIALOG — bevisar hela kedjan i dev:
    // interaktion-event → dialogkort → POST /api/studio/interaktion →
    // svarPermission → interaktionsKlar. 30 s-default = escalate (samma
    // KVD-regel som prod).
    const permId = `mock-perm-${Date.now().toString(36)}`;
    const permBeslut = await new Promise<string>((los) => {
      const permInteraktion: Extract<StudioInteraktion, { typ: "permission" }> = {
        typ: "permission",
        requestId: permId,
        verktyg: "LäsRepo",
        risk: "medium",
        skäl: "Mock: verifiera godkännandedialogen (Z-portaLens)",
        sammanfattning: '{"sokvag":"uploads/demo.txt","radBegränsning":50}',
        alternativ: [
          { optionId: "allow_once", namn: "Allow once" },
          { optionId: "allow_project", namn: "Allow for project" },
          { optionId: "deny", namn: "Deny" },
        ],
      };
      const timer = setTimeout(() => {
        this.mockVantan = null;
        lyssnare({ typ: "interaktionsKlar", requestId: permId, beslut: "eskal", skäl: "ingen respons inom 30 s" });
        los("eskal");
      }, 30_000);
      this.mockVantan = { interaktion: permInteraktion, los: (b) => { clearTimeout(timer); los(b); } };
      lyssnare({ typ: "interaktion", interaktion: permInteraktion });
    });
    this.mockVantan = null;

    // V83 B2: simulerat FRÅGEKORT (requestUserInput — knappval eller fritext).
    const fragId = `mock-fraga-${Date.now().toString(36)}`;
    const fragSvar = await new Promise<string>((los) => {
      const fragInteraktion: Extract<StudioInteraktion, { typ: "fråga" }> = {
        typ: "fråga",
        requestId: fragId,
        fråga: "Mock-fråga: vill du att sammanfattningen hålls kort?",
        inputTyp: "choice",
        val: ["Ja, korta ner", "Nej, full längd"],
      };
      const timer = setTimeout(() => {
        this.mockVantanFraga = null;
        lyssnare({ typ: "interaktionsKlar", requestId: fragId, beslut: "avbruten", skäl: "ingen respons inom 30 s" });
        los("(tidsgräns)");
      }, 30_000);
      this.mockVantanFraga = { interaktion: fragInteraktion, los: (v) => { clearTimeout(timer); los(v); } };
      lyssnare({ typ: "interaktion", interaktion: fragInteraktion });
    });
    this.mockVantanFraga = null;

    lyssnare({ typ: "verktyg", namn: "LäsRepo", händelse: "start" });
    await sov(150);
    lyssnare({ typ: "verktyg", namn: "LäsRepo", händelse: "slut" });
    lyssnare({ typ: "delta", kanal: "tankar", text: "Mock-läget: jag echoar prompten utan modell." });

    const rader = [
      `**Mottaget:** ${prompt.length > 400 ? `${prompt.slice(0, 400)}…` : prompt}`,
      "",
      "## Studiosvar (mock)",
      "",
      "Detta är **deterministisk demo-utdata** — ingen modell anropades.",
      "",
      "- Riktig drift sker på servern där `zcode app-server` lever",
      "- Sessionen hålls vid liv mellan prompter",
      "- Uppladdade filer får sökvägar som `uploads/<datum>/<namn>`",
      `- Permission-dialog (mock): **${permBeslut}** · frågekort (mock): **${fragSvar || "(tidsgräns)"}**`,
      "",
      "```txt",
      "transport: mock · protokoll: bevisat i tool-results/v81-appserver.md",
      "```",
    ];
    let svar = "";
    for (const rad of rader) {
      if (signal?.aborted) break;
      lyssnare({ typ: "delta", kanal: "text", text: `${rad}\n` });
      svar += `${rad}\n`;
      await sov(35);
    }
    this.historikPoster.push({ roll: "user", text: prompt });
    this.historikPoster.push({ roll: "assistant", text: svar.trim() });
    this.mockTotalt += 128;
    this.mockTurns += 1;
    lyssnare({
      typ: "runda",
      fas: "slut",
      varaktighetMs: rader.length * 35 + 1_040,
      resultatTyp: "success",
      verktygAntal: 4,
      tokenCount: 128,
    });
    lyssnare({ typ: "klart", svar: svar.trim(), tokenCount: 128, varaktighetMs: rader.length * 35 + 270 });
  }
}

// ── Fabrik (injektionpunkt) ──────────────────────────────────────────────────

/**
 * Agentens arbetsyta — EN sanningskälla för hela studio-ytan (våg 83 B4):
 * STUDIO_WORKSPACE → /home/ak1a/agent/ak1 (Contabo-hem, om den finns) →
 * cwd. Används av hamtaStudioTransport() och av /api/studio/filer så att
 * filträdet ALLTID speglar samma rot som agenten jobbar i.
 */
export function studioArbetsyta(): string {
  const hem = "/home/ak1a/agent/ak1";
  return process.env.STUDIO_WORKSPACE || (existsSync(hem) ? hem : process.cwd());
}

let aktivTransport: StudioTransport | null = null;

/**
 * Miljöstyrd transport — injektionspunkten som dev-testet och framtida
 * tmux-fallback kopplar in sig på:
 *   STUDIO_TRANSPORT=mock|appserver tvingar; annars mock på win32 (dev)
 *   och appserver annars (prod = Contabo, linux).
 */
export function hamtaStudioTransport(): StudioTransport {
  if (aktivTransport) return aktivTransport;
  const tvingad = process.env.STUDIO_TRANSPORT;
  const namn: "appserver" | "mock" =
    tvingad === "mock" || tvingad === "appserver"
      ? tvingad
      : process.platform === "win32"
        ? "mock"
        : "appserver";

  if (namn === "mock") {
    aktivTransport = new MockTransport();
    return aktivTransport;
  }

  const binärer = [
    process.env.STUDIO_ZCODE_BIN,
    "zcode",
    "/home/ak1a/.npm-global/bin/zcode", // Contabo-installationens hem
  ].filter((b): b is string => typeof b === "string" && b.length > 0);

  const arbetskatalog = studioArbetsyta();
  const lagringsKatalog = process.env.STUDIO_LAGRING || os.tmpdir();

  aktivTransport = new AppServerTransport(
    [...new Set(binärer)],
    arbetskatalog,
    path.join(lagringsKatalog, "ak1a-studio-session.json"),
  );
  return aktivTransport;
}

/** Test-krok: nollställ singletonen (används av verktyg/testa-studio.mjs). */
export function _aterstallStudioTransport(): void {
  aktivTransport = null;
}
