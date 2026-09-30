"use client";

import * as React from "react";
import {
  ArrowDown,
  CheckCircle2,
  ChevronRight,
  FilePen,
  FileText,
  FolderSearch,
  Globe,
  Link2,
  ListChecks,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  SendHorizonal,
  ShieldAlert,
  Terminal,
  Wrench,
  XCircle,
} from "lucide-react";

import { adminHeaders, adminJsonHeaders, loggaIn, sparaAdminLosenord } from "@/lib/admin-klient";
import type {
  StudioEvent,
  StudioHistorikPost,
  StudioInteraktion,
  StudioKontext,
} from "@/lib/studio/studio-transport";

/**
 * ZCODE-KLIENT — EN-TRYCKS-INGÅNGEN till agentchatten (kunddirektivet
 * "komma in med ett tryck", 2026-09-30). Samma bro och samma protokoll som
 * /studio (VÅG 81–156) men utan ALLT chrome: ingen sidebar, ingen meny,
 * ingen panel — bara chatt + input i ZCode-tema (mörkt #0D1117, paletten
 * ur studio-chat VÅG 90: chatt-yta #161B22 · text #E6EDF3 · sekundär
 * #8B949E · accent #58A6FF · grön #238636 · röd #DA3633 · ramar #30363D).
 *
 * APP-KÄNSLA (uppdrag punkt 5): roten är h-dvh + overflow-hidden ⇒ body
 * scrollar ALDRIG — enda rull-yta är chattytan (overscroll-contain stoppar
 * pull-to-refresh). .studio-safe-top/.studio-safe-bottom (globals.css
 * VÅG 87 H4 1, kräver viewport-fit=cover från layouten) respekterar
 * telefonens notch/hem-rad.
 *
 * AUTO-CONNECT (punkt 3): mount ⇒ GET /api/studio/stream — giltig session
 * (cookien ak1a_admin eller x-admin-password) går RAKT in i chatten; annars
 * en minimal lösenordsvy (samma inloggning som /studio — API-rutterna kräver
 * requireAdmin oavsett, UI-låset är första dörren). Senast aktiva session
 * laddas automatiskt (VÅG 87 H1-återkopplingen) och vyn är TRÅDEN (VÅG 148:
 * tradHistorik = hela huvudtråden ur zcode:s egna sessionsdatabas — tråden
 * är helig, en poll ERSÄTTER aldrig vyn med en kort svans).
 *
 * NY CHATT (punkt 4): knappen tömmer vyn och nycklar nästa prompt med
 * `nyckel` (VÅG 84 B) — den friska sessionen föds med FÖRSTA meddelandet
 * (inga övergivna sessioner vid avbrott, huvudtransporten/mål-loopen rörs
 * ej); "hej"-eventet bär det nya sessionId:t och vyn omnycklas. Omladdning
 * återvänder ärligt till tråden (permansens poäng).
 *
 * STRÖMMEN: POST /api/studio/stream → SSE — ett `data:`-event i taget
 * (samma reader/`\n\n`-mönster som studio-chat; ": ping"-heartbeaps
 * hoppar över). delta(text) bygger svaret live; verktyg_kort/verktyg_input
 * (V83 B1-kartläggningen av tool.updated/model.streaming) bygger TOOL-
 * INDIKATORER — kollapsade rader mellan meddelandena (ikon + verktygsnamn
 * + argument-summary, spinner under körning, bock/kryss vid mål, klick =
 * detaljer) precis som Desktop-appens komprimerade kort; kontext
 * uppdaterar %-mätaren; klart sätter hela svaret; fel blir en röd rad
 * MED retry-knapp när prompten aldrig kom iväg — kundens text lägger sig
 * TILLBAKA i rutan vid avslag (R6: tappa aldrig kundens text). Interaktioner
 * (VÅG 83 B2: permission/fråga) renderas som ett kompakt kort ovanför
 * composern — besvaras det ej svarar transportens 30 s-default, men
 * kunden SKALL kunna godkänna från en-trycks-ytan (agenten annars stannar).
 *
 * LOADING + LAYOUT (fabriksuppdraget 2026-09-30): "AK1A tänker…"-rad med
 * puls-ikon medan svaret väntar; meddelandena bär avatar-initialer (D för
 * dig, A för agenten) + tidsstämplar (HH:MM, endast live-poster — historiken
 * bär ingen tid, då visas ärligt ingen); luft mellan meddelandena (användar-
 * bubbla med rundade hörn, assistent på ren yta); composern är ett lyftet
 * kort med skugga och fokus-ring. Skicka-knappen är disabled när rutan är
 * tom och byter till spinner under sändning.
 *
 * 30 s-poll (VÅG 87 H1, pausad när fliken är dold eller en ström kör)
 * håller vyn sann: mål-loopens autonoma arbete syns utan att kunden gör
 * något. Pollen ersätter vyn med journalens sanning — live-toolkort och
 * tidsstämplar lever bara i strömmande vy, nästa prompt bygger nya.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── Typer (protokollkontrakt — servern är sanningen, klienten tolkar) ───────

/** Wrapper-events som stream-rutten lägger RUNT transportens StudioEvent. */
type ZEvent =
  | StudioEvent
  | { typ: "hej"; transport: string; sessionId: string | null }
  | { typ: "kontext"; kontext: StudioKontext | null }
  | { typ: "ändringar"; filer: unknown[] };

/**
 * Verktygskortets vy-form — merge:as live ur verktyg_kort-/verktyg_input-
 * eventen (samma fält som transportens StudioVerktygSteg-kedja plus
 * liveInput från argument-deltan).
 */
interface VerktygVy {
  id: string;
  namn: string;
  steg: "planerad" | "startar" | "kör" | "resultat" | "fel";
  /** Argument som JSON-sträng, truncat av transporten. */
  argument?: string;
  beskrivning?: string;
  /** Resultatet som text, truncat. */
  resultat?: string;
  /** Felmeddelande (kind error) — raden renderas röd. */
  fel?: string;
  /** Kind result bär duration (ms). */
  varaktighetMs?: number;
  /** Kind progress: elapsedMs + stdout/stderr-svans. */
  framsteg?: { elapsedMs?: number; utdata?: string };
  /** Agenten skriver argumenten JUST NU (verktyg_input-delta, partiell). */
  liveInput?: string;
}

/** Chattens vy-post — "fel" är lokala/systemrader (röda), aldrig historik;
 *  "verktyg" är en tool-indikatorrad mellan meddelandena. */
interface VyPost {
  roll: "user" | "assistant" | "fel" | "verktyg";
  text: string;
  /** Live-tidsstämpel — historikposter bär ingen, då visas ingen (ärligt). */
  ts?: number;
  /** roll === "verktyg": kortet som strömmen bygger. */
  verktyg?: VerktygVy;
  /** roll === "fel": prompten som ALDRIG kom iväg — retry-knappen skickar om den. */
  retryPrompt?: string;
}

/** Kontextradens vy (StudioKontext → två tal). */
interface KontextVy {
  used: number;
  window: number;
}

/** Vy-tak: tråden kan bära hundratals poster — en-trycks-ytan på en telefon
 *  renderar de 150 senaste; äldre lever i serverns sanning + studions trådvy. */
const MAX_VY_POSTER = 150;

/** GET /api/studio/stream-svarets fält som denna klient använder. */
interface StreamSidaload {
  sessionId?: string | null;
  senastAktivSessionId?: string | null;
  historik?: StudioHistorikPost[];
  tradHistorik?: StudioHistorikPost[];
  kontext?: StudioKontext | null;
  interaktioner?: StudioInteraktion[];
  live?: boolean;
  fel?: string;
}

// ── Rena hjälpfunktioner ─────────────────────────────────────────────────────

/** Kontext → vy-tal (ogiltiga värden ⇒ null = dölj mätaren). */
function kontextVy(k: StudioKontext | null | undefined): KontextVy | null {
  if (!k || typeof k.contextWindow !== "number" || k.contextWindow <= 0) return null;
  return {
    used: typeof k.contextUsed === "number" ? k.contextUsed : 0,
    window: k.contextWindow,
  };
}

/** Historikfält → vy-poster (tradLäge=true ⇒ tråden, annars sessionens egna).
 *  kapad=true när taket MAX_VY_POSTER högg äldre poster (ärlig notis i vyn). */
function posterUr(data: StreamSidaload, tradLage: boolean): { poster: VyPost[]; kapad: boolean } {
  const kalla: StudioHistorikPost[] = tradLage
    ? Array.isArray(data.tradHistorik)
      ? data.tradHistorik
      : []
    : Array.isArray(data.historik)
      ? data.historik
      : [];
  const poster: VyPost[] = [];
  for (const post of kalla) {
    if ((post.roll === "user" || post.roll === "assistant") && typeof post.text === "string") {
      poster.push({ roll: post.roll, text: post.text });
    }
  }
  if (poster.length > MAX_VY_POSTER) {
    return { poster: poster.slice(-MAX_VY_POSTER), kapad: true };
  }
  return { poster, kapad: false };
}

/** Tidsstämpel HH:MM (sv-SE) — vy-posternas lokala klocka. */
function tidText(ts: number): string {
  return new Date(ts).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
}

/** Formattera millisekunder läsbart (1234 → "1,2 s"; 456 → "456 ms"). */
function msText(ms: number): string {
  if (ms >= 1000) return (ms / 1000).toFixed(1).replace(".", ",") + " s";
  return Math.round(ms) + " ms";
}

/** Verktygsikon per namn — samma karta som studio-chatts verktygskort. */
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
 * "Bash: ls uploads/", "Read: src/lib/…", "Grep: finans*". Faller på
 * liveInput (partiell JSON ⇒ rå första raden) och sist beskrivning.
 */
function kortRubrik(v: VerktygVy): string {
  const ra = v.argument ?? v.liveInput;
  if (ra) {
    try {
      const p = JSON.parse(ra) as Record<string, unknown>;
      for (const nyckel of ["command", "file_path", "path", "pattern", "url", "query", "prompt", "description"]) {
        const varde = p[nyckel];
        if (typeof varde === "string" && varde) {
          return `${v.namn}: ${varde.length > 64 ? varde.slice(0, 64) + "…" : varde}`;
        }
      }
    } catch {
      /* rå/partiell text — första raden nedan */
    }
    const forsta = ra.split("\n")[0];
    if (forsta) return `${v.namn}: ${forsta.length > 64 ? forsta.slice(0, 64) + "…" : forsta}`;
  }
  if (v.beskrivning) return `${v.namn}: ${v.beskrivning.slice(0, 64)}`;
  return v.namn;
}

// ── Tool-indikatorn (kollapsad rad mellan meddelandena, expandera för detaljer) ──

/**
 * Verktygsraden — Desktop-känslans komprimerade kort: ikon + rubrik +
 * status (spinner under körning, bock vid resultat, kryss vid fel) +
 * varaktighet när protokollet bär den. Klick växlar detaljvyn (argument,
 * resultat, fel, live-utdata) i monospace.
 */
function VerktygsRad({ kort, oppen, visa }: { kort: VerktygVy; oppen: boolean; visa: () => void }) {
  const detaljer =
    (kort.argument || kort.liveInput || kort.resultat || kort.fel || kort.framsteg?.utdata) ?? null;
  return (
    <div className="my-1 pl-[calc(1rem+28px+10px)] pr-4">
      <button
        onClick={visa}
        aria-expanded={oppen}
        className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF]/50 ${
          kort.steg === "fel" ? "border-[#DA3633]/40 bg-[#DA3633]/10" : "border-[#21262D] bg-[#161B22]/70"
        }`}
      >
        {verktygsIkon(kort.namn)}
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-[#8B949E]">
          {kortRubrik(kort)}
        </span>
        {kort.varaktighetMs ? (
          <span className="shrink-0 font-mono text-[10px] text-[#6E7681]">{msText(kort.varaktighetMs)}</span>
        ) : null}
        {kort.steg === "fel" ? (
          <XCircle className="h-3.5 w-3.5 shrink-0 text-[#F85149]" />
        ) : kort.steg === "resultat" ? (
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#3FB950]" />
        ) : (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[#D29922]" />
        )}
        {detaljer ? (
          <ChevronRight
            className={`h-3.5 w-3.5 shrink-0 text-[#6E7681] transition-transform ${oppen ? "rotate-90" : ""}`}
          />
        ) : null}
      </button>
      {oppen && detaljer ? (
        <div className="mt-1 space-y-1.5 rounded-lg border border-[#21262D] bg-[#010409] p-2">
          {kort.argument || kort.liveInput ? (
            <DetaljBlock etikett="Argument" text={kort.argument ?? kort.liveInput ?? ""} />
          ) : null}
          {kort.framsteg?.utdata ? <DetaljBlock etikett="Live" text={kort.framsteg.utdata} /> : null}
          {kort.resultat ? <DetaljBlock etikett="Resultat" text={kort.resultat} /> : null}
          {kort.fel ? <DetaljBlock etikett="Fel" text={kort.fel} rod /> : null}
        </div>
      ) : null}
    </div>
  );
}

/** Monospace-detaljblock i det expanderade verktygskortet. */
function DetaljBlock({ etikett, text, rod }: { etikett: string; text: string; rod?: boolean }) {
  return (
    <div>
      <p className={`text-[10px] font-semibold tracking-wide ${rod ? "text-[#F85149]" : "text-[#6E7681]"}`}>
        {etikett.toUpperCase()}
      </p>
      <pre
        className={`mt-0.5 max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed ${
          rod ? "text-[#F85149]" : "text-[#8B949E]"
        }`}
      >
        {text}
      </pre>
    </div>
  );
}

// ── Komponenten ──────────────────────────────────────────────────────────────

export default function ZcodeKlient() {
  const [lage, setLage] = React.useState<"kollar" | "las" | "chatt">("kollar");
  const [losenord, setLosenord] = React.useState("");
  const [inloggningsFel, setInloggningsFel] = React.useState("");
  const [loggarIn, setLoggarIn] = React.useState(false);

  const [poster, setPoster] = React.useState<VyPost[]>([]);
  /** true när vy-taket högg äldre poster — visar en ärlig notis ovanför listan. */
  const [kapat, setKapat] = React.useState(false);
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  /** true = vyn är HELA tråden (auto-connect); false = "Ny chatt"-lägets egna vy. */
  const [tradLage, setTradLage] = React.useState(true);
  /** Väntar första meddelandet i en ny chatt ⇒ nästa prompt bär denna nyckel. */
  const [nyckelVantar, setNyckelVantar] = React.useState<string | null>(null);
  const [live, setLive] = React.useState(false);
  const [varmText, setVarmText] = React.useState("");

  const [text, setText] = React.useState("");
  const [sander, setSander] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const [tankar, setTankar] = React.useState("");
  const [kontext, setKontext] = React.useState<KontextVy | null>(null);
  const [vantar, setVantar] = React.useState<StudioInteraktion | null>(null);
  const [svarsText, setSvarsText] = React.useState("");
  const [vidBotten, setVidBotten] = React.useState(true);
  /** Expanderade verktygskort (kort-id) — kollapsade är standard. */
  const [oppnaKort, setOppnaKort] = React.useState<Set<string>>(() => new Set());

  const chattRef = React.useRef<HTMLDivElement | null>(null);
  const rutaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const vidBottenRef = React.useRef(true);

  /** Auto-scroll: nya poster/statusrader ⇒ rulla om kunden är vid botten. */
  React.useEffect(() => {
    const el = chattRef.current;
    if (el && vidBottenRef.current) el.scrollTop = el.scrollHeight;
  }, [poster, status, tankar]);

  /** Kort-expansion: klick på raden växlar detaljläget (per kort-id). */
  const togglaKort = React.useCallback((id: string) => {
    setOppnaKort((s) => {
      const nya = new Set(s);
      if (nya.has(id)) nya.delete(id);
      else nya.add(id);
      return nya;
    });
  }, []);

  // ── Auto-connect: mount ⇒ sessionskontroll + senast aktiva session ────────

  const lasIn = React.useCallback(async () => {
    try {
      const res = await fetch("/api/studio/stream", { headers: adminHeaders() });
      if (!res.ok) {
        setLage("las");
        return;
      }
      let data = (await res.json()) as StreamSidaload;
      // VÅG 87 H1: senast aktiva session (annan än default) ⇒ sidoload av DEN —
      // kunden återkommer rakt in i samtalet som lever, utan ett enda klick.
      if (data.senastAktivSessionId && data.senastAktivSessionId !== data.sessionId) {
        try {
          const res2 = await fetch(
            `/api/studio/stream?sessionId=${encodeURIComponent(data.senastAktivSessionId)}`,
            { headers: adminHeaders() },
          );
          if (res2.ok) data = (await res2.json()) as StreamSidaload;
        } catch {
          /* default-vyn gäller */
        }
      }
      setLage("chatt");
      setTradLage(true);
      setNyckelVantar(null);
      setSessionId(typeof data.sessionId === "string" && data.sessionId ? data.sessionId : null);
      setLive(data.live === true);
      setVarmText(typeof data.fel === "string" && data.fel ? data.fel : "");
      setKontext(kontextVy(data.kontext));
      const vy = posterUr(data, true);
      setPoster(vy.poster);
      setKapat(vy.kapad);
    } catch {
      setLage("las");
    }
  }, []);

  React.useEffect(() => {
    void lasIn();
  }, [lasIn]);

  // ── 30 s-poll: vyn förblir sann (mål-loopens arbete syns av sig själv) ────

  React.useEffect(() => {
    if (lage !== "chatt") return;
    const polla = async () => {
      // Ny chatt utan första meddelande ⇒ ingen session finns än — den tomma
      // vyn är avsiktlig och ersätts ALDRIG av default-tråden (sessionen föds
      // med första prompten via nyckel-flödet).
      if (document.hidden || sander || nyckelVantar) return;
      try {
        const url =
          tradLage || !sessionId
            ? "/api/studio/stream"
            : `/api/studio/stream?sessionId=${encodeURIComponent(sessionId)}`;
        const res = await fetch(url, { headers: adminHeaders() });
        if (!res.ok) return; // transient — vyn behålls
        const d = (await res.json()) as StreamSidaload;
        setLive(d.live === true);
        setVarmText(typeof d.fel === "string" && d.fel ? d.fel : "");
        setKontext(kontextVy(d.kontext));
        const vy = posterUr(d, tradLage);
        setPoster(vy.poster);
        setKapat(vy.kapad);
        // Interaktionen kan ha lösts av annat håll/30 s-default — stäng kortet.
        if (vantar && Array.isArray(d.interaktioner)) {
          const lever = d.interaktioner.some((i) => i.requestId === vantar.requestId);
          if (!lever) setVantar(null);
        }
      } catch {
        /* tyst — nästa poll */
      }
    };
    const id = window.setInterval(() => void polla(), 30_000);
    // SAMMA funktionsreferens i add/remove — annars städas lyssnaren aldrig.
    const paSynlighet = () => void polla();
    document.addEventListener("visibilitychange", paSynlighet);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", paSynlighet);
    };
  }, [lage, sander, sessionId, tradLage, vantar, nyckelVantar]);

  // Fokusera rutan vid chatt-anslutning på pek-don med mus (telefonens
  // tangentbord öppnas ALDRIG oombedt — där är skicka-knappen vägen).
  React.useEffect(() => {
    if (lage === "chatt" && window.matchMedia("(pointer: fine)").matches) {
      rutaRef.current?.focus();
    }
  }, [lage]);

  // ── Inloggning (samma två vägar som studio-låsvyn: session ⇒ lösenord) ────

  const forsokLoggaIn = async () => {
    if (!losenord || loggarIn) return;
    setLoggarIn(true);
    setInloggningsFel("");
    try {
      const svar = await loggaIn(losenord);
      if (svar.roll) {
        await lasIn();
        return;
      }
      // Fall-back: ADMIN_PASSWORD-läget — verifieras mot bryggan och sparas
      // för kommande anrop (x-admin-password via adminHeaders).
      try {
        const res = await fetch("/api/studio/stream", {
          headers: { "x-admin-password": losenord },
        });
        if (res.ok) {
          sparaAdminLosenord(losenord);
          await lasIn();
          return;
        }
      } catch {
        /* fall igenom till feltexten */
      }
      setInloggningsFel("Fel lösenord.");
    } finally {
      setLoggarIn(false);
    }
  };

  // ── Ny chatt: tom vy + nyckel — sessionen föds med första meddelandet ─────

  const nyChatt = () => {
    setPoster([]);
    setKapat(false);
    setSessionId(null);
    setTradLage(false);
    setNyckelVantar(`zcode-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
    setStatus("");
    setTankar("");
    setVarmText("");
    rutaRef.current?.focus();
  };

  // ── SSE-strömmen (samma reader-mönster som studio-chat) ───────────────────

  const lasStream = async (kropp: ReadableStream<Uint8Array>) => {
    const lasare = kropp.getReader();
    const avkodare = new TextDecoder();
    let buffert = "";
    let svans = "";

    /** Bygg/ersätt den strömmande assistant-posten — ren härledning ur vyn:
     *  sista posten är "assistant" ⇒ delta fortsätter den, annars föds den
     *  (user-posten eller verktygsraderna stod sist när strömmen började).
     *  Ingen yttre flagga. */
    const tryckSvans = (t: string) => {
      setPoster((p) => {
        const kopia = [...p];
        const sist = kopia.length - 1;
        if (sist >= 0 && kopia[sist].roll === "assistant") {
          kopia[sist] = { roll: "assistant", text: t, ts: kopia[sist].ts };
        } else {
          kopia.push({ roll: "assistant", text: t, ts: Date.now() });
        }
        return kopia;
      });
    };

    /** Merge:a ett verktyg_kort-event i vy-posterna (upsert per kort-id —
     *  samma mönster som studio-chatts uppdateraKort: saknas kortet föds
     *  en planerad platshållare som följande event fyller). */
    const koraKort = (
      id: string,
      ror: (bef: VerktygVy) => VerktygVy,
    ) => {
      setPoster((p) => {
        const ix = p.findIndex((post) => post.roll === "verktyg" && post.verktyg?.id === id);
        if (ix < 0) {
          return [...p, { roll: "verktyg", text: "", verktyg: ror({ id, namn: "Verktyg", steg: "planerad" }) }];
        }
        const bef = p[ix].verktyg;
        if (!bef) return p;
        const kopia = [...p];
        kopia[ix] = { roll: "verktyg", text: "", verktyg: ror(bef) };
        return kopia;
      });
    };

    for (;;) {
      const { done, value } = await lasare.read();
      if (done) break;
      buffert += avkodare.decode(value, { stream: true });
      let grans = buffert.indexOf("\n\n");
      while (grans >= 0) {
        const block = buffert.slice(0, grans);
        buffert = buffert.slice(grans + 2);
        grans = buffert.indexOf("\n\n");
        const dataRad = block.split("\n").find((rad) => rad.startsWith("data: "));
        if (!dataRad) continue; // ": ping"-heartbeat
        let event: ZEvent;
        try {
          event = JSON.parse(dataRad.slice(6)) as ZEvent;
        } catch {
          continue;
        }
        switch (event.typ) {
          case "hej":
            // Ny/frisk session ⇒ omnyckla vy-sessionen (VÅG 95: nytt sessionId
            // följer hej). trådläget RÖRS ej — pollen ERSÄTTER aldrig den
            // sammanslagna tråden med en sessions svans (VÅG 148: tråden helig;
            // mordvapnet v144 får aldrig återvända).
            if (typeof event.sessionId === "string" && event.sessionId) {
              setSessionId(event.sessionId);
              setNyckelVantar(null);
            }
            break;
          case "status":
            setStatus(typeof event.text === "string" ? event.text : "");
            break;
          case "delta":
            if (event.kanal === "text") {
              svans += event.text;
              tryckSvans(svans);
            } else if (event.kanal === "tankar") {
              setTankar((t) => (t + event.text).slice(-240));
            }
            break;
          case "verktyg":
            // Legacy-signal (start/slut) — statusradens puls; de rika korten
            // kommer via verktyg_kort nedan.
            setStatus(event.händelse === "start" ? `Kör ${event.namn}…` : "");
            break;
          case "verktyg_kort":
            // Tool-indikatorn: kortet BÄR sin egen status (spinner/bock/
            // kryss + varaktighet) — statusraden dukas av för att inte dubblera.
            if (event.id) {
              koraKort(event.id, (bef) => ({
                ...bef,
                namn: event.namn ?? bef.namn,
                steg: event.steg ?? bef.steg,
                argument: event.argument ?? bef.argument,
                beskrivning: event.beskrivning ?? bef.beskrivning,
                resultat: event.resultat ?? bef.resultat,
                fel: event.fel ?? bef.fel,
                varaktighetMs: event.varaktighetMs ?? bef.varaktighetMs,
                framsteg: event.framsteg ?? bef.framsteg,
              }));
              setStatus("");
            }
            break;
          case "verktyg_input":
            // Agenten skriver argumenten LIVE — delta läggs på kortets
            // liveInput (rubriken följer med i realtid).
            if (event.id) {
              koraKort(event.id, (bef) => ({
                ...bef,
                liveInput: (bef.liveInput ?? "") + event.text,
              }));
            }
            break;
          case "runda":
            if (event.fas === "start") setStatus("Arbetar…");
            break;
          case "modell_status":
            if (typeof event.text === "string" && event.text) setStatus(event.text);
            break;
          case "kontext":
            setKontext(kontextVy(event.kontext));
            break;
          case "interaktion":
            setVantar(event.interaktion ?? null);
            setSvarsText("");
            break;
          case "interaktionsKlar":
            setVantar(null);
            break;
          case "klart":
            svans = typeof event.svar === "string" && event.svar ? event.svar : svans;
            if (svans) tryckSvans(svans);
            setStatus("");
            setTankar("");
            break;
          case "fel":
            setPoster((p) => [...p, { roll: "fel", text: event.meddelande, ts: Date.now() }]);
            break;
          default:
            // ändringar/meddelande_id/mal_* — panelfri vy struntar i dem.
            break;
        }
      }
    }
  };

  // ── Skicka (prompt → SSE; kundens text förloras ALDRIG, R6) ───────────────

  const skicka = async (explicit?: string) => {
    const prompt = (explicit ?? text).trim();
    if (!prompt || sander) return;
    setText("");
    const el = rutaRef.current;
    if (el) el.style.height = "auto"; // rutan återföder sin vilohöjd
    setPoster((p) => [...p, { roll: "user", text: prompt, ts: Date.now() }]);
    setSander(true);
    setStatus("Skickar…");
    setTankar("");
    vidBottenRef.current = true;
    setVidBotten(true);
    try {
      const res = await fetch("/api/studio/stream", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify(
          sessionId ? { prompt, sessionId } : nyckelVantar ? { prompt, nyckel: nyckelVantar } : { prompt },
        ),
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as {
          fel?: string;
          avslag?: boolean;
          prompt?: string;
        } | null;
        // R6 (b): avslaget bär texten tillbaka — kundens ord skrivs ALDRIG om.
        if (data?.avslag === true && typeof data.prompt === "string") setText(data.prompt);
        else setText(prompt);
        setPoster((p) => [
          ...p,
          {
            roll: "fel",
            text: data?.fel ?? `Chatten kunde ej nås (${res.status}).`,
            ts: Date.now(),
            // Prompten kom ALDRIG fram — retry-knappen skickar om den ordagrant.
            retryPrompt: prompt,
          },
        ]);
        if (res.status === 401 || res.status === 403) setLage("las");
        return;
      }
      await lasStream(res.body);
    } catch {
      // Nätverksfel EFTER sändning: arbetet kan leva vidare server-side (VÅG 91
      // A1c) — pollen tar hem svaret; texten ligger kvar tryggt i journalen.
      // Ingen retry-knapp här: om-skickning skulle dubbelgöra prompten.
      setPoster((p) => [
        ...p,
        {
          roll: "fel",
          text: "Anslutningen bröts — meddelandet skickades och svaret syns här strax (uppdateras av sig själv).",
          ts: Date.now(),
        },
      ]);
    } finally {
      setSander(false);
      setStatus("");
      setTankar("");
    }
  };

  /** Retry på en fallen prompt — bara när ingen ström kör; rutan tömms endast
   *  om kunden lämnat den fallna texten orörd (påbörjad ny text respekteras). */
  const provaIgen = (prompt: string) => {
    if (sander) return;
    if (text.trim() === prompt) setText("");
    void skicka(prompt);
  };

  // ── Interaktionssvar (permission/fråga → protokollet) ────────────────────

  const svaraInteraktion = async (kropp: Record<string, string>) => {
    if (!vantar) return;
    const requestId = vantar.requestId;
    setVantar(null);
    setSvarsText("");
    try {
      await fetch("/api/studio/interaktion", {
        method: "POST",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ ...kropp, requestId }),
      });
    } catch {
      /* 409/502 ⇒ kortet redan löst (30 s-default) — strömmen styr vyn */
    }
  };

  // ── Rendering ──────────────────────────────────────────────────────────────

  if (lage === "kollar") {
    return (
      <div className="flex h-dvh items-center justify-center overflow-hidden bg-[#0D1117] text-[#8B949E]">
        <p className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Öppnar chatten…
        </p>
      </div>
    );
  }

  if (lage === "las") {
    return (
      <div className="flex h-dvh items-center justify-center overflow-hidden bg-[#0D1117] px-4 text-[#E6EDF3]">
        <div className="w-full max-w-xs rounded-xl border border-[#30363D] bg-[#161B22] p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#238636] text-sm font-bold text-white">
              Z
            </span>
            <div>
              <h1 className="text-sm font-semibold leading-tight">AK1A ZCode</h1>
              <p className="text-[11px] text-[#8B949E]">Din direktingång till agenten</p>
            </div>
          </div>
          <input
            type="password"
            value={losenord}
            onChange={(e) => setLosenord(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && losenord) void forsokLoggaIn();
            }}
            placeholder="Lösenord"
            autoFocus
            className="mt-4 w-full rounded-lg border border-[#30363D] bg-[#0D1117] px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF]/50"
          />
          <button
            onClick={() => void forsokLoggaIn()}
            disabled={!losenord || loggarIn}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#238636] px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF]/50"
          >
            {loggarIn ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Lås upp chatten
          </button>
          {inloggningsFel ? <p className="mt-2 text-center text-xs text-[#F85149]">{inloggningsFel}</p> : null}
          <p className="mt-3 text-center text-[11px] leading-relaxed text-[#8B949E]">
            Samma lösenord som studion — sessionen sparas och nästa besök är ett tryck.
          </p>
        </div>
      </div>
    );
  }

  const kontextProcent =
    kontext !== null && kontext.window > 0 ? Math.round((kontext.used / kontext.window) * 100) : null;

  /** "AK1A tänker…"-raden: visas medan en ström kör och INGA svarsposter
   *  fötts än (user/första tomma assistant sist). Verktygsradernas spinnare
   *  och interaktionskortet är sina egna signaler — då döljs raden. */
  const sistPost = poster[poster.length - 1];
  const visaTankarRad =
    sander &&
    !vantar &&
    (!sistPost || sistPost.roll === "user" || (sistPost.roll === "assistant" && !sistPost.text));

  return (
    <div className="flex h-dvh flex-col overflow-hidden overscroll-none bg-[#0D1117] text-[#E6EDF3]">
      {/* Header — tunn, safe-area-topp: märke + status + Ny chatt. Inget mer. */}
      <header className="studio-safe-top flex shrink-0 items-center gap-2 border-b border-[#30363D] bg-[#010409] px-3 py-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#238636] text-xs font-bold text-white">
          Z
        </span>
        <span className="text-sm font-semibold">AK1A</span>
        <span className="flex items-center gap-1.5 text-[11px] text-[#8B949E]">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${live ? "bg-[#3FB950]" : "bg-[#D29922]"}`}
            aria-hidden
          />
          {live ? "live" : "värms"}
          {kontextProcent !== null ? ` · ${kontextProcent} % kontext` : ""}
        </span>
        <button
          onClick={nyChatt}
          disabled={sander}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-[#30363D] bg-[#21262D] px-2.5 py-1.5 text-xs font-medium text-[#E6EDF3] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF]/50"
        >
          <Plus className="h-3.5 w-3.5" />
          Ny chatt
        </button>
      </header>

      {varmText ? (
        <p className="shrink-0 bg-[#D29922]/10 px-4 py-1.5 text-center text-[11px] text-[#D29922]">{varmText}</p>
      ) : null}

      {/* Chattytan — sidans ENDA rull-yta. */}
      <main
        ref={chattRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          const botten = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
          vidBottenRef.current = botten;
          setVidBotten(botten);
        }}
        className="relative flex-1 overflow-y-auto overscroll-contain bg-[#0D1117]"
      >
        {poster.length === 0 && !visaTankarRad ? (
          <div className="flex h-full items-center justify-center px-6">
            <p className="max-w-sm text-center text-sm leading-relaxed text-[#8B949E]">
              {nyckelVantar
                ? "Ny chatt är klar — skriv ditt första meddelande."
                : "Hej! Skriv ett meddelande så fortsätter samtalet där det stannade."}
            </p>
          </div>
        ) : (
          <div className="py-2">
            {kapat ? (
              <p className="px-4 pb-1 pt-3 text-center text-[11px] text-[#8B949E]">
                Visar de {MAX_VY_POSTER} senaste meddelandena — hela tråden lever i studion.
              </p>
            ) : null}
            {poster.map((post, i) =>
              post.roll === "verktyg" && post.verktyg ? (
                <VerktygsRad
                  key={`${i}-${post.verktyg.id}`}
                  kort={post.verktyg}
                  oppen={oppnaKort.has(post.verktyg.id)}
                  visa={() => togglaKort(post.verktyg?.id ?? "")}
                />
              ) : (
                <div
                  key={`${i}-${post.roll}`}
                  className="studio-fade-in flex gap-2.5 px-4 py-2.5"
                >
                  {/* Avatar — D för dig, A för agenten, ! för systemfel. */}
                  <span
                    aria-hidden
                    className={`flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-full text-[11px] font-bold text-white ${
                      post.roll === "user"
                        ? "bg-[#1F6FEB]"
                        : post.roll === "assistant"
                          ? "bg-[#238636]"
                          : "bg-[#DA3633]"
                    }`}
                  >
                    {post.roll === "user" ? "D" : post.roll === "assistant" ? "A" : "!"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-baseline gap-2">
                      <span
                        className={`text-[11px] font-semibold tracking-wide ${
                          post.roll === "user"
                            ? "text-[#58A6FF]"
                            : post.roll === "assistant"
                              ? "text-[#3FB950]"
                              : "text-[#F85149]"
                        }`}
                      >
                        {post.roll === "user" ? "DU" : post.roll === "assistant" ? "AK1A" : "FEL"}
                      </span>
                      {post.ts ? (
                        <span className="text-[10px] tabular-nums text-[#6E7681]">{tidText(post.ts)}</span>
                      ) : null}
                    </p>
                    <div
                      className={`mt-1 ${
                        post.roll === "user"
                          ? "rounded-2xl rounded-tl-md border border-[#21262D] bg-[#161B22] px-3.5 py-2.5"
                          : ""
                      }`}
                    >
                      <p
                        className={`whitespace-pre-wrap break-words text-[14px] leading-relaxed ${
                          post.roll === "fel" ? "text-[#F85149]" : "text-[#E6EDF3]"
                        }`}
                      >
                        {post.text}
                        {sander && post.roll === "assistant" && i === poster.length - 1 ? (
                          <span className="ml-0.5 animate-pulse text-[#58A6FF]">▊</span>
                        ) : null}
                      </p>
                    </div>
                    {post.roll === "fel" && post.retryPrompt ? (
                      <button
                        onClick={() => {
                          const p = post.retryPrompt;
                          if (p) provaIgen(p);
                        }}
                        disabled={sander}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[#DA3633]/50 px-2.5 py-1.5 text-[11px] font-medium text-[#F85149] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF]/50"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Försök igen
                      </button>
                    ) : null}
                  </div>
                </div>
              ),
            )}

            {/* Loading-state — agenten arbetar men har inget svar att visa än. */}
            {visaTankarRad ? (
              <div className="studio-fade-in flex items-center gap-2.5 px-4 py-2.5" aria-live="polite">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#238636]/20">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3FB950] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3FB950]" />
                  </span>
                </span>
                <span className="text-[12px] text-[#8B949E]">AK1A tänker…</span>
              </div>
            ) : null}
          </div>
        )}

        {!vidBotten && poster.length > 0 ? (
          <div className="sticky bottom-4 z-10 flex justify-end pr-4">
            <button
              onClick={() => {
                const el = chattRef.current;
                if (el) el.scrollTop = el.scrollHeight;
                vidBottenRef.current = true;
                setVidBotten(true);
              }}
              aria-label="Hoppa till senaste"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#30363D] bg-[#21262D] text-[#E6EDF3] shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF]/50"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </main>

      {/* Interaktionskort — agenten väntar ett beslut: besvara ALDRIG tyst. */}
      {vantar ? (
        <div className="shrink-0 border-t border-[#D29922]/40 bg-[#161B22] px-3 py-2.5">
          {vantar.typ === "permission" ? (
            <>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D29922]">
                <ShieldAlert className="h-3.5 w-3.5" />
                Godkännande krävs — {vantar.verktyg}
                {vantar.risk ? <span className="font-normal text-[#8B949E]">(risk {vantar.risk})</span> : null}
              </p>
              {vantar.sammanfattning ? (
                <pre className="mt-1 max-h-28 overflow-auto whitespace-pre-wrap break-words rounded border border-[#21262D] bg-[#010409] p-2 text-[11px] leading-relaxed text-[#8B949E]">
                  {vantar.sammanfattning}
                </pre>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-2">
                {vantar.alternativ.map((alt) => (
                  <button
                    key={alt.optionId}
                    onClick={() => void svaraInteraktion({ typ: "permission", alternativ: alt.optionId })}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF]/50 ${
                      alt.optionId === "deny"
                        ? "border border-[#DA3633]/60 text-[#F85149]"
                        : "bg-[#238636] text-white"
                    }`}
                  >
                    {alt.namn}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold text-[#D29922]">Agenten frågar</p>
              <p className="mt-1 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-[#E6EDF3]">
                {vantar.fråga}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {Array.isArray(vantar.val) && vantar.val.length > 0 ? (
                  vantar.val.map((val) => (
                    <button
                      key={val}
                      onClick={() => void svaraInteraktion({ typ: "fråga", varde: val })}
                      className="rounded-lg bg-[#238636] px-3 py-1.5 text-xs font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF]/50"
                    >
                      {val}
                    </button>
                  ))
                ) : (
                  <>
                    <input
                      value={svarsText}
                      onChange={(e) => setSvarsText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && svarsText.trim()) {
                          void svaraInteraktion({ typ: "fråga", varde: svarsText.trim() });
                        }
                      }}
                      placeholder="Ditt svar…"
                      className="min-w-0 flex-1 rounded-lg border border-[#30363D] bg-[#0D1117] px-3 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF]/50"
                    />
                    <button
                      onClick={() => void svaraInteraktion({ typ: "fråga", varde: svarsText.trim() })}
                      disabled={!svarsText.trim()}
                      className="rounded-lg bg-[#238636] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF]/50"
                    >
                      Svara
                    </button>
                  </>
                )}
                <button
                  onClick={() => void svaraInteraktion({ typ: "fråga-avbryt" })}
                  className="rounded-lg border border-[#30363D] px-3 py-1.5 text-xs text-[#8B949E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF]/50"
                >
                  Avbryt
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}

      {/* Composer — safe-area-botten, lyftet kort med skugga, Enter skickar,
          Skift+Enter = ny rad. Skicka-knappen: disabled tom + spinner sänder. */}
      <footer className="studio-safe-bottom shrink-0 bg-[#010409] px-2 pt-2 pb-2">
        {tankar ? (
          <p className="mx-1 mb-1 truncate text-[11px] italic text-[#8B949E]">{tankar}</p>
        ) : null}
        {status ? (
          <p className="mx-1 mb-1 flex items-center gap-1.5 text-[11px] text-[#8B949E]">
            <Loader2 className="h-3 w-3 animate-spin" />
            {status}
          </p>
        ) : null}
        <div className="flex items-end gap-1.5 rounded-2xl border border-[#30363D] bg-[#0D1117] p-1.5 shadow-[0_4px_20px_rgba(1,4,9,0.6)] focus-within:border-[#58A6FF]/50">
          <textarea
            ref={rutaRef}
            value={text}
            rows={1}
            placeholder="Skriv till AK1A…"
            enterKeyHint="send"
            onChange={(e) => {
              setText(e.target.value);
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void skicka();
              }
            }}
            className="max-h-40 min-h-[44px] flex-1 resize-none border-0 bg-transparent px-3 py-2.5 text-[15px] leading-relaxed text-[#E6EDF3] outline-none placeholder:text-[#6E7681]"
          />
          <button
            onClick={() => void skicka()}
            disabled={sander || !text.trim()}
            aria-label={sander ? "Skickar…" : "Skicka"}
            className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-xl bg-[#238636] text-white disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF]/50"
          >
            {sander ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
          </button>
        </div>
      </footer>
    </div>
  );
}
