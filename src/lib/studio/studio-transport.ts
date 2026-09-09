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

/** Detaljerade händelser som transporten strömmar under en prompt. */
export type StudioEvent =
  | { typ: "status"; text: string }
  | { typ: "delta"; kanal: StudioKanal; text: string }
  | { typ: "verktyg"; namn: string; händelse: "start" | "slut" }
  | { typ: "klart"; svar: string; tokenCount?: number; varaktighetMs?: number }
  | { typ: "fel"; meddelande: string };

export type StudioLyssnare = (event: StudioEvent) => void;

/** Historikpost (senaste först i tid — transporten returnerar äldst först). */
export interface StudioHistorikPost {
  roll: "user" | "assistant";
  text: string;
}

/** Post ur session/list (protokollfält mappade defensivt). */
export interface StudioSessionPost {
  sessionId: string;
  titel?: string;
  status?: string;
  arbetsyta?: string;
  uppdaterad?: string;
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
      if (m.method === "session/requestRuntimePreferences") {
        // BEVISAT OBLIGATORISKT (annars låser create/send): schema MEt.
        this.skickaRad({
          id: m.id,
          result: {
            nativeSearchEnhancementsEnabled: false,
            memoryEnabled: false,
            askUserQuestionAutoResolutionEnabled: true,
          },
        });
      } else {
        // Artigt nej (bevisat harmlöst att ignorera — flödet fortsätter).
        this.skickaRad({ id: m.id, error: { code: -32601, message: "ak1a-studio: metoden stöds ej" } });
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
    workspace?: { workspacePath?: string };
  }[];
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
  };
}

interface StateUpdatedParams {
  patch?: { status?: string };
}

/** Läs null-säkert sessionsid ur create/resume-svar. */
function sessionUr(result: unknown): string | null {
  const r = result as SessionResult | null;
  const sid = r?.session?.sessionId;
  return typeof sid === "string" && sid ? sid : null;
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
      const { sessionId: sparad, modell } = this.lasSparadSession();
      let resumerad = false;
      if (sparad) {
        try {
          const resultat = await klient.request("session/resume", { sessionId: sparad }, 45_000);
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
    const resultat = await klient.request("session/create", params, 60_000);
    const sid = sessionUr(resultat);
    if (!sid) throw new Error("session/create svarade utan sessionId");
    this.sid = sid;
    this.sparaPersistens(sid, modellId);
  }

  /** Persistens: {sessionId, modell?, sparad} — modellen används av create-fallback. */
  private sparaPersistens(sid: string, modellId?: string): void {
    try {
      mkdirSync(path.dirname(this.lagringsSökväg), { recursive: true });
      writeFileSync(
        this.lagringsSökväg,
        JSON.stringify({ sessionId: sid, ...(modellId ? { modell: modellId } : {}), sparad: Date.now() }),
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
    // Pågående prompt får aldrig överlevas av en kasserad session.
    if (this.aktiv && !this.aktiv.färdig) {
      throw new Error("En prompt kör — vänta tills agenten är klar.");
    }
    if (this.sid && this.klient?.lever) {
      // Artigt stäng — sessionen finns kvar i session/list (historik).
      try {
        await this.klient.request("session/close", { sessionId: this.sid }, 10_000);
      } catch {
        // ej fatal — kasseras ändå nedan
      }
    }
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
        ut.push({
          sessionId: s.sessionId,
          titel: typeof s.title === "string" ? s.title : undefined,
          status: typeof s.status === "string" ? s.status : undefined,
          arbetsyta: s.workspace?.workspacePath,
          uppdaterad: s.updatedAt ?? s.updated ?? s.lastActiveAt,
        });
      }
      return ut.slice(0, 25);
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
      };
    } catch {
      return null;
    }
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
          aktiv.lyssnare({ typ: "status", text: "Agenten arbetar…" });
          return;
        case "model.streaming": {
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
      const status = (params as StateUpdatedParams | undefined)?.patch?.status;
      // Compact-väckare: kompakteringsturnen slutar med idle (BEVISAT v82 —
      // broadcasten kommer även utan pågående prompt).
      if (status === "idle" && this.idleVakt) this.idleVakt();
      if (!aktiv || aktiv.färdig) return;
      if (status === "running") {
        aktiv.lyssnare({ typ: "status", text: "Agenten arbetar…" });
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
            await this.nySession();
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

  private lasSparadSession(): { sessionId: string | null; modell?: string } {
    try {
      const rå = readFileSync(this.lagringsSökväg, "utf8");
      const pars = JSON.parse(rå) as { sessionId?: unknown; modell?: unknown };
      const sid = typeof pars.sessionId === "string" && pars.sessionId.startsWith("sess_") ? pars.sessionId : null;
      const modell = typeof pars.modell === "string" && pars.modell ? pars.modell : undefined;
      return { sessionId: sid, modell };
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
      // "Tidigare sessioner" finns kvar i listan även efter kassering.
      this.gamlaSessioner.unshift({
        sessionId: this.mockSid,
        titel: this.historikPoster[0]?.text.slice(0, 60) || "Mock-session",
        status: "idle",
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
      { sessionId: this.mockSid!, titel: "Aktiv mock-session", status: "idle" },
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
    };
  }

  async skicka(prompt: string, lyssnare: StudioLyssnare, signal?: AbortSignal): Promise<void> {
    await this.ensure();
    const sov = (ms: number) =>
      new Promise<void>((los) => {
        const t = setTimeout(los, ms);
        signal?.addEventListener("abort", () => { clearTimeout(t); los(); }, { once: true });
      });

    lyssnare({ typ: "status", text: "Agenten arbetar… (mock)" });
    await sov(120);
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
    lyssnare({ typ: "klart", svar: svar.trim(), tokenCount: 128, varaktighetMs: rader.length * 35 + 270 });
  }
}

// ── Fabrik (injektionpunkt) ──────────────────────────────────────────────────

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

  const hem = "/home/ak1a/agent/ak1";
  const arbetskatalog = process.env.STUDIO_WORKSPACE || (existsSync(hem) ? hem : process.cwd());
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
