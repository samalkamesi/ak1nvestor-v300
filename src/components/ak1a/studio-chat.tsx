"use client";

import * as React from "react";
import Link from "next/link";

import {
  CircleStop,
  FileText,
  FileArchive,
  FileImage,
  FolderUp,
  Loader2,
  Paperclip,
  Send,
  Sparkles,
  UploadCloud,
} from "lucide-react";

import { adminHeaders, adminJsonHeaders } from "@/lib/admin-klient";
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
 * verktyg/klart/fel) läses med fetch+reader (EventSource kan ej POST).
 * UPLOADS: POST /api/studio/uppladdning multipart — drag-och-släpp på hela
 * ytan, paste-bild i skrivfältet, filknapp, mappknapp (webkitdirectory →
 * relativa sökvägar följer med → servern rekonstruerar mappstrukturen).
 * Klickbara chips infogar "Titta på uploads/..." i prompten.
 *
 * SKYDD: sidan (page.tsx) visar lås-vy; API-rutterna kräver admin — här
 * bär adminHeaders() lösenordet i lösenordsläget (session-cookien åker
 * med automatiskt). INGA hemligheter renderas.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── Typer ────────────────────────────────────────────────────────────────────

interface Meddelande {
  id: string;
  roll: "user" | "assistant";
  text: string;
  /** Strömmar pågående (agentbubbla utan guldkant-fade). */
  strömmande?: boolean;
  /** Verktygsrad under agentens arbete. */
  verktyg?: string[];
  fel?: boolean;
}

interface Uppladdning {
  sokvag: string;
  typ: string;
  storlek: number;
}

interface StreamEvent {
  typ: "hej" | "status" | "delta" | "verktyg" | "klart" | "fel";
  kanal?: "text" | "tankar";
  text?: string;
  namn?: string;
  händelse?: "start" | "slut";
  svar?: string;
  meddelande?: string;
  transport?: string;
  sessionId?: string | null;
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

  const blattraRef = React.useRef<HTMLDivElement | null>(null);
  const ytaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const filInputRef = React.useRef<HTMLInputElement | null>(null);
  const mappInputRef = React.useRef<HTMLInputElement | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  // Auto-scroll vid nya bitar (mjukt — bara när användaren är nära botten).
  React.useEffect(() => {
    const yta = blattraRef.current;
    if (!yta) return;
    const näraBotten = yta.scrollHeight - yta.scrollTop - yta.clientHeight < 220;
    if (näraBotten) yta.scrollTop = yta.scrollHeight;
  }, [meddelanden, tankar, statusText]);

  // Uppstart: status + historik + senaste uploads.
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
          };
          if (!levande) return;
          setLive(data.live ? (data.transport === "mock" ? "demo" : "live") : "ned");
          setStatusText(data.live ? (data.transport === "mock" ? "Demo-läge (mock-transport)" : "Sessionen lever") : "Agenten kunde ej nås");
          if (data.historik?.length) {
            setMeddelanden(
              data.historik.map((h) => ({ id: nyttId(), roll: h.roll, text: h.text })),
            );
          }
        } else if (res.status === 401) {
          if (levande) setStatusText("Logga in igen — sessionen har löpt ut.");
        }
      } catch {
        if (levande) setStatusText("Nätverksfel — agenten kunde ej nås.");
      }
      try {
        const res = await fetch("/api/studio/uppladdning", { headers: adminHeaders() });
        if (res.ok) {
          const data = (await res.json()) as { filer?: Uppladdning[] };
          if (levande && data.filer) setUppladdningar(data.filer);
        }
      } catch {
        // uploads-listan är lyx
      }
    })();
    return () => {
      levande = false;
    };
  }, []);

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
              setStatusText(`${event.händelse === "start" ? "Kör" : "Klart"}: ${event.namn ?? "verktyg"}`);
              rörAgent((m) => {
                if (event.händelse !== "start") return m;
                const verktyg = m.verktyg ?? [];
                if (verktyg.includes(event.namn ?? "verktyg")) return m;
                return { ...m, verktyg: [...verktyg, event.namn ?? "verktyg"].slice(-6) };
              });
              break;
            case "klart":
              rörAgent((m) => ({
                ...m,
                text: event.svar && event.svar.trim() ? event.svar : m.text || "(tomt svar)",
                strömmande: false,
              }));
              färdig = true;
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
  }, [prompt, strömmar, live]);

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
      {/* Marin rubrikrad */}
      <header className="marin-panel sticky top-0 z-20 border-b border-gold/25 shadow-md">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3">
          <VarumarkesLogo storlek="sm" medText={false} onClick={hem} />
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-lg font-bold leading-tight text-[#EDE6D6] sm:text-xl">
              AK1A <span className="text-gold">Studio</span>
            </h1>
            <p className="truncate text-[11px] text-[#EDE6D6]/70">
              Din agent — samma hjärna som bygger sajten
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-black/20 px-2.5 py-1" title={statusText}>
            <span className={cn("h-2 w-2 animate-pulse rounded-full", prickFärg)} />
            <span className="text-[10px] font-semibold tracking-wider text-[#EDE6D6]/90">{prickText}</span>
          </div>
        </div>
      </header>

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
              {["Vad är status i projektet just nu?", "Sammanfatta senaste worklog", "Titta på data/siffror.json och förklara treck"].map((förslag) => (
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
                  {m.verktyg && m.verktyg.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {m.verktyg.map((v) => (
                        <span key={v} className="rounded-sm bg-gold/10 px-1.5 py-0.5 text-[10px] font-medium text-gold">
                          {v}
                        </span>
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
              placeholder="Skriv till agenten… (Enter skickar, Skift+Enter ny rad)"
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
