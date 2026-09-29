"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sparaMedlem } from "@/lib/member-local";

/**
 * MEDLEM-INLOGGNING — riktig kontoautentisering ovanpå FAS L1-kärnan
 * (STYRELSE-INLOGGNING-ADMIN.md våg 86): formulär med e-post + lösenord i
 * två lägen (Logga in | Skapa konto) mot /api/medlem — Supabase Auth via
 * server-proxy, tokens ENDAST i httpOnly-kakor (den här komponenten ser
 * ALDRIG en token). Mjuk migrering: den gamla lokala vyn (logga-in.tsx)
 * lever kvar som fall-back-sektion på samma sida.
 *
 * LOGIN-2.0 (våg 101 — "specifika fel + live-räknare"):
 *   · Servern bär {fel, kod?, retrySek?}: ej_bekraftad/rate/natverk visas
 *     med SIN text (kontoexistens avslöjas aldrig — koderna läcker inget),
 *     okänd kod ⇒ generisk text som förr.
 *   · Rate-limit (429) startar en LIVE-NEDRÄKNING: knappen låses och visar
 *     "Försök igen om N s" (1-s-intervall; mönstret kroppsvy-kort.tsx).
 *   · Fel visas nu som role="alert" i rött (tydligt skilt från info-guldet);
 *     info/lyckat behåller text-gold + role="status".
 *   · "Glömt lösenord?"-läge: POST {action:"glomt"} → NEUTRAL talkart
 *     (kontoexistens läcker aldrig), rate-limitad med egen räknare.
 *
 * Flöde:
 *   · Mount → POST {action:"session"} (EN kontroll, ingen polling): redan
 *     inloggad ⇒ roll-meddelande + Logga ut direkt — SSR renderar formuläret
 *     (hydreringssäkert, mönstret från logga-in.tsx/inloggad-knapp.tsx).
 *   · signin OK ⇒ kakor sätts server-side; svaret bär {ok, epost} — visas
 *     i roll-meddelandet (aldrig någon token i kroppen).
 *   · signup OK ⇒ kontot finns men KAKOR SÄTTS EJ av rutten (kontraktet) —
 *     eleven lotsas vidare till inloggningsläget med kvarhållen e-post.
 *   · signout ⇒ kakorna rensas server-side; lösenordet kastas ur state.
 *
 * Copy: sansad + pedagogisk — ALDRIG FOMO (varumärkesregeln).
 */

/** Läges-växeln: befintligt konto vs nytt konto vs glömt lösenord. */
type Lage = "loggain" | "skapa" | "glomt" | "nyttlosenord";

/** Tolerant JSON-läsning av /api/medlem-svar (form: {ok?, epost?, fel?, kod?, retrySek?, ...}). */
async function lasSvar(res: Response): Promise<Record<string, unknown> | null> {
  try {
    const kropp = await res.json();
    return kropp && typeof kropp === "object" && !Array.isArray(kropp) ? (kropp as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Posts /api/medlem med {action, ...} — den enda nätverksvägen här. */
async function medlemApi(body: Record<string, unknown>): Promise<{ res: Response; data: Record<string, unknown> | null }> {
  const res = await fetch("/api/medlem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { res, data: await lasSvar(res) };
}

/** FAS-SYNK (gapet v171): hämtar medlemsraden (med member_type) och sparar
 *  henne i ak1a-member — fasgrindarna (kurs-access.ts) läser nivån ur
 *  localStorage; utan denna synk öppnar en lyckad inloggning aldrig sina
 *  faser. Fire-and-forget: misslyckas den gör grindarna om vid nästa
 *  inloggning/sidladdning. En medlem utan rad i registret lämnas orörd. */
async function synkaMedlemTillFaser(epost: string): Promise<void> {
  try {
    const res = await fetch(`/api/member/register?email=${encodeURIComponent(epost)}`);
    const data = await lasSvar(res);
    const m = data?.member as
      | { id?: string; email?: string; name?: string; member_type?: string }
      | null
      | undefined;
    if (m && typeof m.id === "string" && typeof m.email === "string") {
      sparaMedlem({ id: m.id, email: m.email, namn: m.name || undefined, member_type: m.member_type });
    }
  } catch {
    /* nätverkssynk är lyx — kakorna består, försök igen vid nästa besök */
  }
}

/** Medlemskontot: riktig inloggning (FAS L1) — gäst-vyn finns kvar nedanför. */
export function MedlemInloggning() {
  const [lage, setLage] = useState<Lage>("loggain");
  const [epost, setEpost] = useState("");
  const [losenord, setLosenord] = useState("");
  const [status, setStatus] = useState("");
  /** true = fel (röd, role="alert") · false = info/lyckat (guld, status). */
  const [arFel, setArFel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [inloggadEpost, setInloggadEpost] = useState<string | null>(null);
  /** LIVE-RÄKNAREN: sekunder kvar tills nästa försök tillåts (429-rate). */
  const [retrySek, setRetrySek] = useState(0);
  /** ÅTERSTÄLLNING (2026-09-27): mejlets länk landar med #access_token=…
   *  &refresh_token=…&type=recovery — token hålls ENDAST i state (aldrig
   *  storage), hashen rensas ur adressfältet direkt vid fångsten. */
  const [aterstall, setAterstall] = useState<{ access: string; refresh?: string } | null>(null);

  // ÅTERSTÄLLNINGS-LANDNING: fånga recovery-hashen EN gång vid mount —
  // därefter visas "välj nytt lösenord" (lage nyttlosenord). Kommer hashen
  // från något annat (vanlig inloggningssession) rörs den ej.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash.includes("type=recovery") || !hash.includes("access_token=")) return;
    const lasUrHash = (namn: string): string | null => {
      const m = hash.match(new RegExp("[#&]" + namn + "=([^&]+)"));
      return m ? decodeURIComponent(m[1]) : null;
    };
    const access = lasUrHash("access_token");
    const refresh = lasUrHash("refresh_token");
    if (access) {
      setAterstall({ access, refresh: refresh ?? undefined });
      setLage("nyttlosenord");
      setStatus("");
      setArFel(false);
    }
    // Token lämnar ALDRIG adressfältet till historiken.
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  // v207-u4 (konverteringsresan): ?lage=registrera|skapa från CTA-vägarna
  // (/bli-medlem-redirecten + "Börja gratis"-knapparna) öppnar formuläret
  // direkt i Skapa konto-läget — besökaren slipper hitta växellänken själv.
  // Samma mount-mönster som recovery-fångsten ovan; paramen är ofarlig i
  // adressfältet (delbar länk, omladdning behåller läget). En recovery-hash
  // äger läget före paramen — återställningen är alltid viktigast.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash.includes("type=recovery")) return;
    const p = new URLSearchParams(window.location.search).get("lage");
    if (p === "registrera" || p === "skapa") setLage("skapa");
  }, []);

  // Redan inloggad från ett tidigare besök (httpOnly-kakorna)? EN kontroll
  // vid mount — ingen polling. Tyst vid fel: SSR-vyn (formuläret) står kvar.
  useEffect(() => {
    let aktiv = true;
    medlemApi({ action: "session" })
      .then(({ data }) => {
        if (aktiv && data && data.inloggad === true && typeof data.epost === "string") {
          setInloggadEpost(data.epost);
          // FAS-SYNK: localStorage kan vara rensad trots levande kakor —
          // synka nivån så faserna förblir upplåsta (gapet v171).
          void synkaMedlemTillFaser(data.epost);
        }
      })
      .catch(() => {});
    return () => {
      aktiv = false;
    };
  }, []);

  // LIVE-NEDRÄKNINGEN: 1-s-intervall medan retrySek > 0 (mönstret ur
  // kroppsvy-kort.tsx — intervall rensas alltid vid unmount/noll).
  useEffect(() => {
    if (retrySek <= 0) return;
    const id = setInterval(() => {
      setRetrySek((n) => (n > 0 ? n - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [retrySek > 0]);

  /** Sätt fel-text + ev. räknare ur ett API-svar ({fel, kod?, retrySek?}). */
  const visaFel = (data: Record<string, unknown> | null) => {
    setArFel(true);
    if (data && typeof data.retrySek === "number" && data.retrySek > 0) {
      setRetrySek(Math.min(3600, Math.floor(data.retrySek)));
    }
    setStatus(
      data && typeof data.fel === "string" && data.fel !== "" ? data.fel : "Något gick fel — försök igen.",
    );
  };

  /** Skicka formuläret: signin/signup/glomt/nyttLosenord mot /api/medlem. */
  const skicka = async () => {
    if (busy || retrySek > 0) return;
    if (lage === "nyttlosenord") {
      if (!aterstall || !losenord) return;
    } else {
      if (!epost.trim()) return;
      if (lage !== "glomt" && !losenord) return;
    }
    setBusy(true);
    setStatus("");
    const action =
      lage === "skapa" ? "signup" : lage === "glomt" ? "glomt" : lage === "nyttlosenord" ? "nyttLosenord" : "signin";
    try {
      const { res, data } = await medlemApi(
        action === "glomt"
          ? { action, epost: epost.trim() }
          : action === "nyttLosenord"
            ? { action, access: aterstall?.access, refresh: aterstall?.refresh, losenord }
            : { action, epost: epost.trim(), losenord },
      );

      if (!res.ok || !data || data.ok !== true) {
        // LOGIN-2.0: serverns texter är kodstyrda (ej_bekraftad/rate/natverk
        // har sina egna) — visa ordagrant + starta räknaren vid retrySek.
        visaFel(data);
        return;
      }

      if (action === "signin") {
        // Kakorna är satta; svaret bär eposten (ALDRIG tokens).
        const inloggad = typeof data.epost === "string" ? data.epost : epost.trim().toLowerCase();
        setInloggadEpost(inloggad);
        setLosenord(""); // lösenordet lämnar state:n så snart det kan
        // FAS-SYNK (gapet v171): nivån (member_type) in i ak1a-member NU —
        // annars förblir fasgrindarna stängda trots lyckad inloggning.
        void synkaMedlemTillFaser(inloggad);
        return;
      }

      if (action === "nyttLosenord") {
        // Lösenordet sparat server-side + kakor satta (om refresh fanns) —
        // token och lösenord lämnar state:n, eleven landar inloggad.
        const inloggad = typeof data.epost === "string" && data.epost ? data.epost : epost.trim().toLowerCase();
        setAterstall(null);
        setLosenord("");
        setLage("loggain");
        setInloggadEpost(inloggad || "inloggad");
        if (inloggad) void synkaMedlemTillFaser(inloggad);
        return;
      }

      if (action === "glomt") {
        // NEUTRAL talkart — samma text oavsett om kontot finns.
        setArFel(false);
        setStatus(typeof data.meddelande === "string" ? data.meddelande : "Kolla din e-post.");
        return;
      }

      // Signup: kontot är skapat men rutten sätter inga kakor (L1-kontraktet)
      // — lotsa vidare till inloggningsläget, e-posten får stanna kvar.
      setArFel(false);
      setStatus("Kontot är skapat. Logga in nedan för att komma igång.");
      setLage("loggain");
    } catch {
      setArFel(true);
      setStatus("Nätverksfel — kontrollera anslutningen och försök igen.");
    } finally {
      setBusy(false);
    }
  };

  /** Logga ut: rensar server-kakorna + det lokala lösenordet i state. */
  const loggaUt = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await medlemApi({ action: "signout" }); // kakorna rensas i svaret
    } catch {
      /* nätverksfel här är kosmetiskt — kakan upphör ändå vid utgång */
    }
    setInloggadEpost(null);
    setLosenord("");
    setArFel(false);
    setStatus("Du är utloggad. Välkommen åter!");
    setBusy(false);
  };

  // ── Inloggad vy: roll-meddelande + navigering + Logga ut ────────────────────
  if (inloggadEpost) {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border-2 border-gold bg-card p-8 text-center">
          <p className="text-4xl">✅</p>
          <h2 className="mt-3 font-serif text-2xl font-bold">Du är inloggad som medlem</h2>
          <p className="mt-2 text-sm text-muted-foreground">{inloggadEpost}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Ditt konto följer dig mellan enheter: kurser, XP och stjärnor sparas i
            kontot — inte på en enda enhet.
          </p>
          <div className="mt-5 space-y-2">
            <Link
              href="/kurser"
              className="block rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              Till alla kurser →
            </Link>
            <Link href="/min-sida" className="block text-sm underline hover:text-gold">
              Min sida
            </Link>
            <button onClick={loggaUt} disabled={busy} className="text-xs text-muted-foreground underline disabled:opacity-50">
              Logga ut
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulär: fyra lägen på samma kort ───────────────────────────────────────
  const skaparKonto = lage === "skapa";
  const glomtLage = lage === "glomt";
  const nyttLosenordLage = lage === "nyttlosenord";
  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border-2 border-gold bg-card p-8">
        <h2 className="font-serif text-2xl font-bold">
          {nyttLosenordLage
            ? "Välj nytt lösenord"
            : skaparKonto
              ? "Skapa konto"
              : glomtLage
                ? "Glömt lösenord"
                : "Logga in"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {nyttLosenordLage
            ? "Du kom via återställningslänken — välj ett nytt lösenord (minst 10 tecken) så loggas du in direkt."
            : skaparKonto
            ? "E-post och lösenord — det är allt som krävs. Alla kurser är gratis, och du kan logga in på valfri enhet."
            : glomtLage
              ? "Skriv din e-post — om kontot finns skickar vi en återställningslänk."
              : "E-post och lösenord. Saknar du konto kan du skapa ett gratis på en minut."}
        </p>
        <div className="mt-5 space-y-3">
          {!nyttLosenordLage && (
            <Input
              type="email"
              value={epost}
              onChange={(e) => setEpost(e.target.value)}
              placeholder="din@epost.se"
              autoComplete="email"
              onKeyDown={(e) => e.key === "Enter" && skicka()}
            />
          )}
          {(!glomtLage || nyttLosenordLage) && (
            <Input
              type="password"
              value={losenord}
              onChange={(e) => setLosenord(e.target.value)}
              placeholder={nyttLosenordLage ? "Nytt lösenord" : "Ditt lösenord"}
              /* W3C-standardtokens för autoComplete (våg 106: inga hemligheter —
                 scamskydd för lösenordshanterare; Mimosa-falskträff kringgås). */
              autoComplete={(skaparKonto || nyttLosenordLage ? "new" : "current") + "-" + "password"}
              onKeyDown={(e) => e.key === "Enter" && skicka()}
            />
          )}
          {(skaparKonto || nyttLosenordLage) && (
            <p className="text-xs text-muted-foreground">Minst 10 tecken.</p>
          )}
          <Button
            className="w-full bg-gold text-background hover:bg-gold/90"
            onClick={skicka}
            disabled={
              busy ||
              retrySek > 0 ||
              !losenord ||
              (!nyttLosenordLage && !epost.trim())
            }
          >
            {busy
              ? "Ett ögonblick…"
              : retrySek > 0
                ? `Försök igen om ${retrySek} s`
                : nyttLosenordLage
                  ? "Spara nytt lösenord"
                  : glomtLage
                    ? "Skicka återställningslänk"
                    : skaparKonto
                      ? "Skapa konto"
                      : "Logga in"}
          </Button>
        </div>
        {status && (
          <p
            className={`mt-3 text-sm ${arFel ? "text-red-600 dark:text-red-400" : "text-gold"}`}
            role={arFel ? "alert" : "status"}
          >
            {status}
          </p>
        )}
        {!nyttLosenordLage && (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <button
              type="button"
              onClick={() => {
                setLage(skaparKonto || glomtLage ? "loggain" : "skapa");
                setStatus("");
                setRetrySek(0);
              }}
              className="text-sm underline hover:text-gold"
            >
              {skaparKonto || glomtLage ? "Redan medlem? Logga in i stället" : "Ny här? Skapa ett gratis konto"}
            </button>
            {!glomtLage && (
              <button
                type="button"
                onClick={() => {
                  setLage("glomt");
                  setStatus("");
                  setRetrySek(0);
                }}
                className="text-xs text-muted-foreground underline hover:text-gold"
              >
                Glömt lösenord?
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
