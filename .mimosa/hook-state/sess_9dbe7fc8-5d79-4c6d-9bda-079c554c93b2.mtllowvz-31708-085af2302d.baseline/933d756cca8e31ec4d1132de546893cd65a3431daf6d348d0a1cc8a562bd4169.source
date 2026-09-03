"use client";

import { useCallback, useEffect, useState } from "react";
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

/**
 * NOTIS-CENTRET — den tysta mentorns ansikte utåt.
 *
 * Flytande klocka (nere till VÄNSTER — chatt/AI-Mentorn äger högersidan) med
 * röd badge = olästa. Klick → dropdown-panel (bg-card, border-gold/30) med
 * ikon + rubrik + text + länk per notis, plus "Markera alla lästa" och "Rensa".
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
              {notiser.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs leading-relaxed text-muted-foreground">
                  Allt lugnt — vi höjer flaggan när något nytt väntar dig.
                </p>
              ) : (
                notiser.map((n) => (
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
                ))
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
