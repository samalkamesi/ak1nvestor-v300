"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import {
  genereraAutomatiskaNotiser,
  lasNotiser,
  markeraAllaLasta,
  markeraLast,
  rensaAlla,
  rensaGamla,
  type Notis,
  type NotisUnderlag,
} from "@/lib/notiser";
import { harFas2Access, arAdmin } from "@/lib/kurs-access";
import { lasMedlem } from "@/lib/member-local";

/**
 * NOTIS-CENTRET — den tysta mentorns ansikte utåt.
 *
 * Flytande klocka (nere till VÄNSTER — chatt/AI-Mentorn äger högersidan) med
 * röd badge = olästa. Klick → dropdown-panel (bg-card, border-gold/30) med
 * ikon + rubrik + text + länk per notis, plus "Markera alla lästa" och "Rensa".
 *
 * SIGNAL-BUSSEN (/api/signal): vid varje panelöppning läses systemens
 * gemensamma andning (vågkarta, konfluens, net-net, uppföljning) — elevens
 * egen synlighetsnivå avgör urvalet (gäst: "alla", Fas 2: +fas2, admin:
 * allt). Signalerna visas som egna notiskort med typ-ikon under lokala
 * notiser, deduplicerade mot lokala på id-nyckel ("signal-<id>"). FELMUTE:
 * bussen får ALDRIG krascha notispanelen — allt nät är tyst-fallande.
 *
 * Push (Notification API): behörighet begärs VID FÖRSTA interaktionen — aldrig
 * oombedd vid sidladdning. Beviljad → dagens nya notiser hälsas även när
 * fliken är i bakgrunden (en systemnotis, taggad mot stacking-spam).
 *
 * PWA: nya notiser postMessage:as till service workern (sw.js) — kopplings-
 * punkten för framtida bakgrundsnotiser; idag en ivrig men harmlös Hälsning.
 *
 * Hydration-säkert: allt lokal-state fylls i useEffect — första renderingen
 * (server + klient) är identiskt tom.
 */

// ── Signal-bussen (GET /api/signal) ──────────────────────────────────────────

/** En signal ur bussen — saniteras klient-side innan render. */
type BusSignal = {
  id: string;
  kalla: string;
  typ: "info" | "varning" | "mojlighet" | "beslut";
  rubrik: string;
  text: string;
  ikon: string;
  lank?: string;
  tid: number;
};

/** Hämtningsgränser — bussen andas, den ska inte översvämma panelen. */
const SIGNAL_TIMEOUT_MS = 8000;
const SIGNAL_MAX_ANTAL = 8;
/** Minnes-cache: samma öppning inom 60 s återanvänder svaret (anti-spam). */
const SIGNAL_CACHE_MS = 60_000;

const SIGNAL_TYPER = ["info", "varning", "mojlighet", "beslut"] as const;

/** Typ-markering — ⚠️ varning etc. (direktivet: typ-ikon per notiskort). */
const SIGNAL_TYP_MARKE: Record<BusSignal["typ"], { ikon: string; etikett: string; klass: string } | null> = {
  varning: { ikon: "⚠️", etikett: "Varning", klass: "border-bear/40 bg-bear/10 text-bear" },
  mojlighet: { ikon: "💡", etikett: "Möjlighet", klass: "border-gold/40 bg-gold/10 text-gold" },
  beslut: { ikon: "🏛️", etikett: "Beslut", klass: "border-gold/40 bg-gold/10 text-gold" },
  info: null, // info är bussens standard — ingen extra märkning behövs
};

/** Oförutsedd rad → BusSignal (eller null — tyst, graceful). */
function renSignal(rå: unknown): BusSignal | null {
  if (!rå || typeof rå !== "object") return null;
  const s = rå as Record<string, unknown>;
  if (typeof s.rubrik !== "string" || !s.rubrik.trim()) return null;
  const typ = (SIGNAL_TYPER as readonly string[]).includes(s.typ as string)
    ? (s.typ as BusSignal["typ"])
    : "info";
  const lank =
    typeof s.lank === "string" && /^\/(?!\/)[^\s]*$/.test(s.lank) && s.lank.length <= 200
      ? s.lank
      : undefined; // endast interna /-sökvägar — aldrig externa värdar
  return {
    id: typeof s.id === "string" && s.id ? s.id.slice(0, 80) : `sig-${Date.now()}`,
    kalla: typeof s.kalla === "string" && s.kalla ? s.kalla.slice(0, 40) : "system",
    typ,
    rubrik: s.rubrik.trim().slice(0, 90),
    text: typeof s.text === "string" ? s.text.trim().slice(0, 400) : "",
    ikon: typeof s.ikon === "string" && s.ikon.trim() ? s.ikon.trim().slice(0, 16) : "📡",
    ...(lank !== undefined ? { lank } : {}),
    tid: typeof s.tid === "number" && Number.isFinite(s.tid) ? s.tid : Date.now(),
  };
}

/** Elevens synlighetsnivå på bussen: admin ser allt, Fas 2 ser +fas2, gästen
 *  ser de publika. Samma tabell som lasSignaler:s SYNLIHET (monotonisk). */
function signalMottagare(): "alla" | "fas2" | "admin" {
  try {
    if (arAdmin()) return "admin";
    if (lasMedlem() && harFas2Access()) return "fas2";
  } catch {
    /* okänd nivå → publika signaler */
  }
  return "alla";
}

/** Kort svensk relativ tid — "just nu", "12 min", "3 h", "2 d". */
function tidSedan(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "just nu";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h`;
  return `${Math.floor(h / 24)} d`;
}

/** En systemnotis för dagens nyheter — max en, taggad, med klick-fokus. */
function visaSystemnotis(nya: Notis[]) {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted" || nya.length === 0) return;
    const forsta = nya[0];
    const titel = nya.length > 1 ? `AK1A — ${nya.length} nya notiser` : `AK1A — ${forsta.rubrik}`;
    const text =
      nya.length > 1 ? `${forsta.rubrik}: ${forsta.text} (+${nya.length - 1} till)` : forsta.text;
    const n = new Notification(titel, {
      body: text,
      icon: "/ak1a/favicon.svg",
      tag: "ak1a-notiser", // ersätter, staplar aldrig
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    /* vissa webbläsare kastar på konstruktor i vissa lägen — aldrig fatalt */
  }
}

/** PWA-bryggan: berätta för service workern vilka notiser som fästs. */
function meddelaServiceWorker(nya: Notis[]) {
  try {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const sw = navigator.serviceWorker.controller;
    if (!sw) return;
    sw.postMessage({
      typ: "ak1a-notiser",
      antal: nya.length,
      notiser: nya.map((n) => ({ rubrik: n.rubrik, text: n.text, typ: n.typ, lank: n.lank ?? null })),
    });
  } catch {
    /* ignoreras — SW-meddelandet är en bonus, inte ett krav */
  }
}

export function NotisCenter() {
  const [notiser, setNotiser] = useState<Notis[]>([]);
  const [oppen, setOppen] = useState(false);
  const [signaler, setSignaler] = useState<BusSignal[]>([]);

  /** Senaste busshämtningen (ms) — 60 s minnes-cache mot panel-spam. */
  const signalCacheRef = useRef(0);

  const olasta = notiser.filter((n) => !n.last).length;

  const laddaOm = useCallback(() => setNotiser(lasNotiser()), []);

  // Start: hygien + hämta underlag + generera/fäst + ev. push + SW-meddelande.
  useEffect(() => {
    let aktiv = true;
    rensaGamla();

    (async () => {
      let underlag: NotisUnderlag | null = null;
      try {
        const r = await fetch("/api/notiser");
        if (r.ok) underlag = (await r.json()) as NotisUnderlag;
      } catch {
        /* offline/API nere — de lokala reglerna (streak, nivå) räcker */
      }
      if (!aktiv) return;
      const nya = genereraAutomatiskaNotiser(underlag);
      if (!aktiv) return;
      setNotiser(lasNotiser());
      if (nya.length > 0) {
        visaSystemnotis(nya);
        meddelaServiceWorker(nya);
      }
    })();

    return () => {
      aktiv = false;
    };
  }, []);

  // Escape stänger panelen — tangentbords-etikett.
  useEffect(() => {
    if (!oppen) return;
    const stang = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOppen(false);
    };
    window.addEventListener("keydown", stang);
    return () => window.removeEventListener("keydown", stang);
  }, [oppen]);

  // SIGNAL-BUSSEN — läs /api/signal vid panelöppning (med 60 s minnes-cache).
  // Felmute i botten: nätverksfel, timeout, ogiltigt JSON — allt tyst, panelen
  // visar helt enkelt bara sina lokala notiser. Bussen kraschar aldrig klockan.
  useEffect(() => {
    if (!oppen) return;
    if (Date.now() - signalCacheRef.current < SIGNAL_CACHE_MS) return;
    signalCacheRef.current = Date.now();

    let aktiv = true;
    (async () => {
      try {
        const kontroll = new AbortController();
        const tidtagning = setTimeout(() => kontroll.abort(), SIGNAL_TIMEOUT_MS);
        const r = await fetch(
          `/api/signal?mottagare=${signalMottagare()}&maxAntal=${SIGNAL_MAX_ANTAL}`,
          { signal: kontroll.signal, headers: { Accept: "application/json" } },
        );
        clearTimeout(tidtagning);
        if (!aktiv || !r.ok) return;
        const j = (await r.json()) as { signaler?: unknown };
        if (!aktiv || !Array.isArray(j?.signaler)) return;
        const rensade = j.signaler
          .map(renSignal)
          .filter((s): s is BusSignal => s !== null)
          .slice(0, SIGNAL_MAX_ANTAL);
        if (aktiv) setSignaler(rensade);
      } catch {
        /* bussen får ALDRIG krascha notispanelen — tyst */
      }
    })();

    return () => {
      aktiv = false;
    };
  }, [oppen]);

  const vexla = () => {
    // Be om push-behörighet vid FÖRSTA interaktionen — aldrig oombedd.
    try {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
        void Notification.requestPermission().catch(() => {});
      }
    } catch {
      /* ignoreras */
    }
    setOppen((o) => !o);
  };

  // Dedupe mot lokala notiser på id-nyckel ("signal-<id>") + inom busslistan —
  // samma signal visas aldrig två gånger i panelen.
  const lokalaIdn = new Set(notiser.map((n) => n.id));
  const signalSett = new Set<string>();
  const synligaSignaler = signaler.filter((s) => {
    const nyckel = `signal-${s.id}`;
    if (lokalaIdn.has(nyckel) || signalSett.has(nyckel)) return false;
    signalSett.add(nyckel);
    return true;
  });

  const lasEn = (id: string) => {
    markeraLast(id);
    laddaOm();
  };

  const raportera = (action: "lasAlla" | "rensa") => {
    try {
      void fetch("/api/notiser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      }).catch(() => {});
    } catch {
      /* ignoreras */
    }
  };

  const allaLasta = () => {
    markeraAllaLasta();
    laddaOm();
    raportera("lasAlla");
  };

  const rensa = () => {
    rensaAlla();
    laddaOm();
    raportera("rensa");
  };

  return (
    <>
      {/* Genomskinlig fångstryta — klick utanför stänger panelen */}
      {oppen && <div className="fixed inset-0 z-30" onClick={() => setOppen(false)} aria-hidden />}

      <div className="fixed bottom-[calc(1rem_+_env(safe-area-inset-bottom))] left-4 z-40">
        {/* Dropdown-panel (öppnas uppåt ur klockan) */}
        {oppen && (
          <div
            role="dialog"
            aria-label="Notiser"
            className="absolute bottom-full left-0 mb-3 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-gold/30 bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between gap-2 border-b border-gold/20 px-4 py-3">
              <h2 className="font-serif text-sm font-bold tracking-wide text-gold">
                Notiser {olasta > 0 && <span className="text-foreground/70">· {olasta} nya</span>}
              </h2>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={allaLasta}
                  disabled={olasta === 0}
                  className="inline-flex items-center gap-1 rounded-md border border-gold/30 bg-gold/5 px-2 py-1 text-[11px] font-semibold text-gold transition-colors hover:bg-gold/15 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Alla lästa
                </button>
                <button
                  onClick={rensa}
                  disabled={notiser.length === 0}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Rensa
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {notiser.length === 0 && synligaSignaler.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs leading-relaxed text-muted-foreground">
                  Allt lugnt — vi höjer flaggan när något nytt väntar dig.
                </p>
              ) : (
                <>
                  {notiser.map((n) => (
                    <div
                      key={n.id}
                      className={`flex gap-3 border-b border-border/60 px-4 py-3 last:border-b-0 ${
                        !n.last ? "bg-gold/5" : ""
                      }`}
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-sm">
                        {n.ikon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate text-sm font-bold">{n.rubrik}</p>
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {tidSedan(n.skapad)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{n.text}</p>
                        <div className="mt-1 flex items-center gap-3">
                          {n.lank && (
                            <Link
                              href={n.lank}
                              onClick={() => lasEn(n.id)}
                              className="text-[11px] font-bold text-gold hover:underline"
                            >
                              Gå dit <span aria-hidden>→</span>
                            </Link>
                          )}
                          {!n.last && (
                            <button
                              onClick={() => lasEn(n.id)}
                              className="text-[11px] text-muted-foreground hover:text-foreground"
                            >
                              Markera läst
                            </button>
                          )}
                        </div>
                      </div>
                      {!n.last && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-600" aria-label="Oläst" />
                      )}
                    </div>
                  ))}

                  {/* ── FRÅN SIGNAL-BUSSEN — systemens gemensamma andning ── */}
                  {synligaSignaler.length > 0 && (
                    <div className="border-t border-gold/20 bg-gold/[0.02]">
                      <p className="px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gold/70">
                        Från signalbussen <span aria-hidden>📡</span>
                      </p>
                      {synligaSignaler.map((s) => {
                        const marke = SIGNAL_TYP_MARKE[s.typ];
                        return (
                          <div
                            key={`signal-${s.id}`}
                            className="flex gap-3 border-b border-border/60 px-4 py-3 last:border-b-0"
                          >
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-sm">
                              {s.ikon}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between gap-2">
                                <p className="truncate text-sm font-bold">{s.rubrik}</p>
                                <span className="shrink-0 text-[10px] text-muted-foreground">
                                  {tidSedan(s.tid)}
                                </span>
                              </div>
                              <p className="mt-0.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                                {s.text}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                {marke && (
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${marke.klass}`}
                                  >
                                    <span aria-hidden>{marke.ikon}</span> {marke.etikett}
                                  </span>
                                )}
                                {s.lank && (
                                  <Link
                                    href={s.lank}
                                    className="text-[11px] font-bold text-gold hover:underline"
                                  >
                                    Gå dit <span aria-hidden>→</span>
                                  </Link>
                                )}
                                <span
                                  className="text-[10px] text-muted-foreground/70"
                                  title={`Signal från ${s.kalla}`}
                                >
                                  {s.kalla}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Klock-knappen — marin med guld, chatt-bubblans DNA (vänster sida).
            Mobil: h-10 w-10 (mindre fotavtryck — täcker ej innehåll); desktop: h-12 w-12. */}
        <button
          onClick={vexla}
          aria-label={olasta > 0 ? `Notiser — ${olasta} olästa` : "Notiser"}
          aria-expanded={oppen}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-gold bg-[#0E1B2E] text-gold shadow-xl transition-transform hover:scale-105 sm:h-12 sm:w-12"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          {olasta > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-card bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
              {olasta > 9 ? "9+" : olasta}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
