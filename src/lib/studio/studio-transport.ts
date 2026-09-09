import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * STUDIO-TRANSPORT — injicerbart transportlager för /studio-bryggan
 * (VÅG 81 WEBCHAT-STUDIO, STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 81").
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
  session?: { sessionId?: string };
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
      const sparad = this.lasSparadSession();
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
      if (!resumerad) await this.skapa(klient);
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
      const klient = new ProtokollKlient(binär, this.arbetskatalog);
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

  private async skapa(klient: ProtokollKlient): Promise<void> {
    // BEVISAT params-form: workspace {workspaceKey, workspacePath} — INTE
    // kind:"local" (det är en annan union; strict zod refuserar kind här).
    const resultat = await klient.request(
      "session/create",
      { workspace: { workspaceKey: this.arbetskatalog, workspacePath: this.arbetskatalog } },
      60_000,
    );
    const sid = sessionUr(resultat);
    if (!sid) throw new Error("session/create svarade utan sessionId");
    this.sid = sid;
    try {
      mkdirSync(path.dirname(this.lagringsSökväg), { recursive: true });
      writeFileSync(this.lagringsSökväg, JSON.stringify({ sessionId: sid, sparad: Date.now() }), "utf8");
    } catch {
      // Persistens är best-effort — chatten funkar även utan.
    }
  }

  /**
   * Självläkningsväg (bevisad nödvändig 2026-09-09 STUDIO-2): kassera den
   * nuvarande sessionen — persistensfil tas bort så ingen annan process
   * återupptar den döda — och skapa en färsk via ensure(). En nyskapad
   * session plockar serverns AKTUELLA standardmodell (zai/glm-5.3 vid
   * beviset), till skillnad från en återupptagen som pin:ar sin gamla.
   */
  private async nySession(): Promise<void> {
    this.sid = null;
    this.prenumererad = false;
    try {
      rmSync(this.lagringsSökväg, { force: true });
    } catch {
      // best-effort — en kvarvarande fil betyder bara att nästa omstart
      // får ett misslyckat resume-försök innan create fallback körs.
    }
    await this.ensure();
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

  private lasSparadSession(): string | null {
    try {
      const rå = readFileSync(this.lagringsSökväg, "utf8");
      const sid = (JSON.parse(rå) as { sessionId?: unknown }).sessionId;
      return typeof sid === "string" && sid.startsWith("sess_") ? sid : null;
    } catch {
      return null;
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
  private readonly historikPoster: StudioHistorikPost[] = [];

  sessionId(): string | null {
    return this.mockSid;
  }

  async ensure(): Promise<void> {
    if (!this.mockSid) this.mockSid = `sess_mock_${Date.now().toString(36)}`;
  }

  async historik(): Promise<StudioHistorikPost[]> {
    return [...this.historikPoster];
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
