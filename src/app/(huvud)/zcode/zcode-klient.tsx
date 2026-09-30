"use client";

import * as React from "react";
import { ArrowDown, Loader2, Plus, SendHorizonal, ShieldAlert } from "lucide-react";

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
 * hoppar över). delta(text) bygger svaret live; verktyg/status/modell_status
 * driver en tunn statusrad; kontext uppdaterar %-mätaren; klart sätter
 * hela svaret; fel blir en röd rad — kundens text lägger sig TILLBAKA i
 * rutan vid avslag (R6: tappa aldrig kundens text). Interaktioner
 * (VÅG 83 B2: permission/fråga) renderas som ett kompakt kort ovanför
 * composern — besvaras det ej svarar transportens 30 s-default, men
 * kunden SKALL kunna godkänna från en-trycks-ytan (agenten annars stannar).
 *
 * 30 s-poll (VÅG 87 H1, pausad när fliken är dold eller en ström kör)
 * håller vyn sann: mål-loopens autonoma arbete syns utan att kunden gör något.
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

/** Chattens vy-post — "fel" är lokala/systemrader (röda), aldrig historik. */
interface VyPost {
  roll: "user" | "assistant" | "fel";
  text: string;
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

  const chattRef = React.useRef<HTMLDivElement | null>(null);
  const rutaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const vidBottenRef = React.useRef(true);

  /** Auto-scroll: nya poster/statusrader ⇒ rulla om kunden är vid botten. */
  React.useEffect(() => {
    const el = chattRef.current;
    if (el && vidBottenRef.current) el.scrollTop = el.scrollHeight;
  }, [poster, status, tankar]);

  // ── Auto-connect: mount ⇒ sessionskontroll + senast aktiva session ────────

  const lasIn = React.useCallback(async () => {
    try {
      const res = await fetch("/api/studio/stream", { headers: adminHeaders() });
      if (!res.ok) {
        setLage("las");
        return;
      }
      let data = (await res.json()) as StreamSidaload;
      // VÅG 87 H1: senast aktiva session (annan än default) ⇒ sideload av DEN —
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
     *  (user-posten stod sist när strömmen började). Ingen yttre flagga. */
    const tryckSvans = (t: string) => {
      setPoster((p) => {
        const kopia = [...p];
        const sist = kopia.length - 1;
        if (sist >= 0 && kopia[sist].roll === "assistant") {
          kopia[sist] = { roll: "assistant", text: t };
        } else {
          kopia.push({ roll: "assistant", text: t });
        }
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
            setStatus(event.händelse === "start" ? `Kör ${event.namn}…` : "");
            break;
          case "verktyg_kort":
            if (event.namn && (event.steg === "planerad" || event.steg === "startar" || event.steg === "kör")) {
              setStatus(`Kör ${event.namn}…`);
            } else if (event.steg === "fel" && event.namn) {
              setStatus(`${event.namn} misslyckades`);
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
            setPoster((p) => [...p, { roll: "fel", text: event.meddelande }]);
            break;
          default:
            // ändringar/meddelande_id/mal_* — panelfri vy struntar i dem.
            break;
        }
      }
    }
  };

  // ── Skicka (prompt → SSE; kundens text förloras ALDRIG, R6) ───────────────

  const skicka = async () => {
    const prompt = text.trim();
    if (!prompt || sander) return;
    setText("");
    const el = rutaRef.current;
    if (el) el.style.height = "auto"; // rutan återföder sin vilohöjd
    setPoster((p) => [...p, { roll: "user", text: prompt }]);
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
          { roll: "fel", text: data?.fel ?? `Chatten kunde ej nås (${res.status}).` },
        ]);
        if (res.status === 401 || res.status === 403) setLage("las");
        return;
      }
      await lasStream(res.body);
    } catch {
      // Nätverksfel EFTER sändning: arbetet kan leva vidare server-side (VÅG 91
      // A1c) — pollen tar hem svaret; texten ligger kvar tryggt i journalen.
      setPoster((p) => [
        ...p,
        {
          roll: "fel",
          text: "Anslutningen bröts — meddelandet skickades och svaret syns här strax (uppdateras av sig själv).",
        },
      ]);
    } finally {
      setSander(false);
      setStatus("");
      setTankar("");
    }
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
        {poster.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6">
            <p className="max-w-sm text-center text-sm leading-relaxed text-[#8B949E]">
              {nyckelVantar
                ? "Ny chatt är klar — skriv ditt första meddelande."
                : "Hej! Skriv ett meddelande så fortsätter samtalet där det stannade."}
            </p>
          </div>
        ) : (
          <div>
            {kapat ? (
              <p className="px-4 pb-1 pt-3 text-center text-[11px] text-[#8B949E]">
                Visar de {MAX_VY_POSTER} senaste meddelandena — hela tråden lever i studion.
              </p>
            ) : null}
            {poster.map((post, i) => (
            <div
              key={`${i}-${post.roll}`}
              className="studio-fade-in border-b border-[#21262D]/70 px-4 py-3"
            >
              <p
                className={`text-[11px] font-semibold tracking-wide ${
                  post.roll === "user"
                    ? "text-[#58A6FF]"
                    : post.roll === "assistant"
                      ? "text-[#3FB950]"
                      : "text-[#F85149]"
                }`}
              >
                {post.roll === "user" ? "DU" : post.roll === "assistant" ? "AK1A" : "FEL"}
              </p>
              <p
                className={`mt-1 whitespace-pre-wrap break-words text-[14px] leading-relaxed ${
                  post.roll === "fel" ? "text-[#F85149]" : "text-[#E6EDF3]"
                }`}
              >
                {post.text}
                {sander && post.roll === "assistant" && i === poster.length - 1 ? (
                  <span className="ml-0.5 animate-pulse text-[#58A6FF]">▊</span>
                ) : null}
              </p>
            </div>
            ))}
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

      {/* Composer — safe-area-botten, Enter skickar, Skift+Enter = ny rad. */}
      <footer className="studio-safe-bottom shrink-0 border-t border-[#30363D] bg-[#010409] px-2 pt-2 pb-2">
        {tankar ? (
          <p className="mx-1 mb-1 truncate text-[11px] italic text-[#8B949E]">{tankar}</p>
        ) : null}
        {status ? (
          <p className="mx-1 mb-1 flex items-center gap-1.5 text-[11px] text-[#8B949E]">
            <Loader2 className="h-3 w-3 animate-spin" />
            {status}
          </p>
        ) : null}
        <div className="flex items-end gap-2">
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
            className="max-h-40 min-h-[44px] flex-1 resize-none rounded-xl border border-[#30363D] bg-[#0D1117] px-3.5 py-2.5 text-[15px] leading-relaxed text-[#E6EDF3] outline-none placeholder:text-[#6E7681] focus-visible:ring-2 focus-visible:ring-[#58A6FF]/50"
          />
          <button
            onClick={() => void skicka()}
            disabled={sander || !text.trim()}
            aria-label="Skicka"
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-[#238636] text-white disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF]/50"
          >
            {sander ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
          </button>
        </div>
      </footer>
    </div>
  );
}
