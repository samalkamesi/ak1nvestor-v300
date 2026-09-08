"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * MEDLEM-INLOGGNING — riktig kontoautentisering ovanpå FAS L1-kärnan
 * (STYRELSE-INLOGGNING-ADMIN.md våg 86): formulär med e-post + lösenord i
 * två lägen (Logga in | Skapa konto) mot /api/medlem — Supabase Auth via
 * server-proxy, tokens ENDAST i httpOnly-kakor (den här komponenten ser
 * ALDRIG en token). Mjuk migrering: den gamla lokala vyn (logga-in.tsx)
 * lever kvar som fall-back-sektion på samma sida.
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
 * Feltexter: serverns generella texter ("Fel e-post eller lösenord.",
 * "Kontot kunde inte skapas.") visas ordagrant; nätverksfel ⇒ egen text.
 * Copy: sansad + pedagogisk — ALDRIG FOMO (varumärkesregeln).
 */

/** Läges-växeln: befintligt konto vs nytt konto. */
type Lage = "loggain" | "skapa";

/** Tolerant JSON-läsning av /api/medlem-svar (form: {ok?, epost?, fel?, inloggad?}). */
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

/** Medlemskontot: riktig inloggning (FAS L1) — gäst-vyn finns kvar nedanför. */
export function MedlemInloggning() {
  const [lage, setLage] = useState<Lage>("loggain");
  const [epost, setEpost] = useState("");
  const [losenord, setLosenord] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [inloggadEpost, setInloggadEpost] = useState<string | null>(null);

  // Redan inloggad från ett tidigare besök (httpOnly-kakorna)? EN kontroll
  // vid mount — ingen polling. Tyst vid fel: SSR-vyn (formuläret) står kvar.
  useEffect(() => {
    let aktiv = true;
    medlemApi({ action: "session" })
      .then(({ data }) => {
        if (aktiv && data && data.inloggad === true && typeof data.epost === "string") {
          setInloggadEpost(data.epost);
        }
      })
      .catch(() => {});
    return () => {
      aktiv = false;
    };
  }, []);

  /** Skicka formuläret: signin eller signup mot /api/medlem. */
  const skicka = async () => {
    if (!epost.trim() || !losenord || busy) return;
    setBusy(true);
    setStatus("");
    const action = lage === "skapa" ? "signup" : "signin";
    try {
      const { res, data } = await medlemApi({ action, epost: epost.trim(), losenord });

      if (!res.ok || !data || data.ok !== true) {
        // Serverns generella feltexter är redan sansade — visa ordagrant,
        // med egen fallback om kroppen var tom/ovidkommande.
        setStatus(
          data && typeof data.fel === "string" ? data.fel : "Något gick fel — försök igen.",
        );
        return;
      }

      if (action === "signin") {
        // Kakorna är satta; svaret bär eposten (ALDRIG tokens).
        setInloggadEpost(typeof data.epost === "string" ? data.epost : epost.trim().toLowerCase());
        setLosenord(""); // lösenordet lämnar state:n så snart det kan
        return;
      }

      // Signup: kontot är skapat men rutten sätter inga kakor (L1-kontraktet)
      // — lotsa vidare till inloggningsläget, e-posten får stanna kvar.
      setStatus("Kontot är skapat. Logga in nedan för att komma igång.");
      setLage("loggain");
    } catch {
      setStatus("Nätverksfel — försök igen.");
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

  // ── Formulär: två lägen på samma kort ───────────────────────────────────────
  const skaparKonto = lage === "skapa";
  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border-2 border-gold bg-card p-8">
        <h2 className="font-serif text-2xl font-bold">
          {skaparKonto ? "Skapa konto" : "Logga in"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {skaparKonto
            ? "E-post och lösenord — det är allt som krävs. Alla kurser är gratis, och du kan logga in på valfri enhet."
            : "E-post och lösenord. Saknar du konto kan du skapa ett gratis på en minut."}
        </p>
        <div className="mt-5 space-y-3">
          <Input
            type="email"
            value={epost}
            onChange={(e) => setEpost(e.target.value)}
            placeholder="din@epost.se"
            autoComplete="email"
            onKeyDown={(e) => e.key === "Enter" && skicka()}
          />
          <Input
            type="password"
            value={losenord}
            onChange={(e) => setLosenord(e.target.value)}
            placeholder="Ditt lösenord"
            onKeyDown={(e) => e.key === "Enter" && skicka()}
          />
          {skaparKonto && (
            <p className="text-xs text-muted-foreground">Minst 10 tecken.</p>
          )}
          <Button
            className="w-full bg-gold text-background hover:bg-gold/90"
            onClick={skicka}
            disabled={busy || !epost.trim() || !losenord}
          >
            {busy ? "Ett ögonblick…" : skaparKonto ? "Skapa konto" : "Logga in"}
          </Button>
        </div>
        {status && (
          <p className="mt-3 text-sm text-gold" role="status">
            {status}
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            setLage(skaparKonto ? "loggain" : "skapa");
            setStatus("");
          }}
          className="mt-4 text-sm underline hover:text-gold"
        >
          {skaparKonto ? "Redan medlem? Logga in i stället" : "Ny här? Skapa ett gratis konto"}
        </button>
      </div>
    </div>
  );
}
