"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { lasMedlem, niva, lasXP, lasKlaraKurser } from "@/lib/member-local";

const MAX_VARFOR = 800;

/** Fas 2-ansökan — elevstatus lokalt + POST till /api/fas2-ansok. Premium-ton,
 *  generös: "Fas 1 gömmer ingenting" — ingen aggressiv säljton. */
export function Fas2Ansok() {
  // SSR-säkra guards: allt localStorage-läsande sker i useEffect efter montering.
  const [hydrerad, setHydrerad] = useState(false);
  const [inloggad, setInloggad] = useState(false);
  const [elevNiva, setElevNiva] = useState(1);
  const [elevXp, setElevXp] = useState(0);
  const [klaraKurser, setKlaraKurser] = useState<string[]>([]);

  const [namn, setNamn] = useState("");
  const [email, setEmail] = useState("");
  const [varfor, setVarfor] = useState("");
  const [busy, setBusy] = useState(false);
  const [fel, setFel] = useState("");
  const [skickad, setSkickad] = useState(false);

  useEffect(() => {
    const m = lasMedlem();
    if (m) {
      setInloggad(true);
      setNamn(m.namn || "");
      setEmail(m.email);
    }
    setElevXp(lasXP());
    setElevNiva(niva());
    setKlaraKurser(lasKlaraKurser());
    setHydrerad(true);
  }, []);

  const niv = hydrerad ? elevNiva : 1;
  const redo = niv >= 25;

  const skicka = async () => {
    setFel("");
    if (!namn.trim()) {
      setFel("Fyll i ditt namn.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFel("Fyll i en giltig e-postadress.");
      return;
    }
    if (varfor.trim().length > MAX_VARFOR) {
      setFel(`Varför-texten får vara högst ${MAX_VARFOR} tecken.`);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/fas2-ansok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namn: namn.trim(),
          email: email.trim(),
          niva: niv,
          xp: elevXp,
          kurserKlara: klaraKurser,
          varfor: varfor.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSkickad(true);
      } else {
        setFel(data.error || "Något gick fel — försök igen om en stund.");
      }
    } catch {
      setFel("Nätverksfel — kontrollera anslutningen och försök igen.");
    } finally {
      setBusy(false);
    }
  };

  // ── Bekräftelseläge: ansökan mottagen ────────────────────────────────────
  if (skickad) {
    return (
      <div className="relative overflow-hidden rounded-3xl border-2 border-gold bg-card p-10 text-center shadow-2xl">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]">
          <span className="font-serif text-[160px] font-black">AK1A</span>
        </div>
        <div className="absolute inset-2 rounded-2xl border-2 border-gold/30" />
        <div className="relative">
          <p className="text-4xl">✉️</p>
          <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight">
            Ansökan mottagen
          </h2>
          <div className="mx-auto mt-3 h-0.5 w-24 bg-gold/40" />
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Tack, {namn.trim() || "vän"}. Vi återkommer med mötestid — läs igenom din
            ansökan noga och hör av oss inom kort. Under tiden:{" "}
            <strong>Fas 1 gömmer ingenting</strong> — fortsätt gärna bygga djup där.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/kurser"
              className="rounded-md bg-gold px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              Fortsätt i Fas 1 — gratis
            </Link>
            <Link
              href="/medlemskap"
              className="text-sm underline text-muted-foreground hover:text-foreground"
            >
              Läs om Fas 1 och Fas 2 igen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Ansökningsformulär ───────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Elevstatus — läs lokalt, presenteras neutralt utan etiketter */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/30 bg-card p-4">
        <div className="text-sm text-muted-foreground">
          {hydrerad ? (
            inloggad ? (
              <span>
                Din elevstatus:{" "}
                <strong className="text-foreground">
                  Nivå {niv} · {elevXp.toLocaleString("sv-SE")} XP · {klaraKurser.length}{" "}
                  klar{klaraKurser.length === 1 ? "" : "a"} kurs{klaraKurser.length === 1 ? "" : "er"}
                </strong>
              </span>
            ) : (
              <span>
                Inte inloggad — fyll i namn och e-post manuellt.{" "}
                <Link href="/logga-in" className="underline hover:text-foreground">
                  Logga in
                </Link>{" "}
                om du vill hämta din status automatiskt.
              </span>
            )
          ) : (
            <span className="text-muted-foreground/60">Läser din elevstatus…</span>
          )}
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
            redo
              ? "border-gold bg-gold/10 text-gold"
              : "border-gold/30 bg-paper text-muted-foreground"
          }`}
          title="Fas 2 vänder sig till dig som gått djupt i Fas 1"
        >
          Nivå 25{hydrerad && redo ? " — redo!" : ""}
        </span>
      </div>

      {/* Formulärskort */}
      <div className="rounded-2xl border-2 border-gold/60 bg-card p-7 shadow-lg sm:p-9">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold">FAS 2 · ANSÖKAN</p>
        <h2 className="mt-3 font-serif text-2xl font-bold">Berätta vem du är</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Tre fält räcker. Vi läser varje ansökan personligt — det finns ingen
          rush och inget rätt svar. Nivå 25 är en signal, inte ett krav.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="fas2-namn" className="mb-1.5 block text-xs font-semibold text-foreground">
              Namn
            </label>
            <Input
              id="fas2-namn"
              value={namn}
              onChange={(e) => setNamn(e.target.value)}
              placeholder="Ditt namn"
              maxLength={80}
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="fas2-email" className="mb-1.5 block text-xs font-semibold text-foreground">
              E-post
            </label>
            <Input
              id="fas2-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@epost.se"
              maxLength={160}
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="fas2-varfor" className="mb-1.5 block text-xs font-semibold text-foreground">
              Varför du? ({varfor.length}/{MAX_VARFOR} tecken)
            </label>
            <textarea
              id="fas2-varfor"
              value={varfor}
              onChange={(e) => setVarfor(e.target.value.slice(0, MAX_VARFOR))}
              placeholder="Vad vill du lära dig djupare? Vad har Fas 1 gett dig hittills?"
              rows={6}
              maxLength={MAX_VARFOR}
              className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              Frivilligt, men det hjälper oss förstå var du är i din utveckling.
            </p>
          </div>

          <Button
            className="w-full bg-gold font-bold text-primary-foreground hover:bg-gold/90"
            onClick={skicka}
            disabled={busy}
          >
            {busy ? "Skickar ansökan…" : "Skicka ansökan"}
          </Button>

          {fel && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {fel}
            </p>
          )}
        </div>
      </div>

      {/* Generös ton + villkor */}
      <div className="rounded-lg border border-gold/30 bg-paper p-5 text-xs leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-foreground">Ingen betalning nu.</strong> Ansökan är
          kostnadsfri och icke-bindande. Fas 2 kostar 9 999 kr — men du betalar
          inget under de första 90 dagarna: betalning sker först efter 90 dagar,
          och bara om du förblir nöjd (90 dagars nöjd-kund-garanti, med
          juridisk hemvist i{" "}
          <Link href="/villkor" className="underline hover:text-foreground">
            villkoren
          </Link>{" "}
          sektion 5–6).{" "}
          <strong className="text-foreground">Fas 1 gömmer ingenting</strong>: hela
          metodiken förblir gratis, för alltid. Vi behandlar dina uppgifter enligt{" "}
          <Link href="/privacy-policy" className="underline hover:text-foreground">
            integritetspolicyn
          </Link>{" "}
          och säljer aldrig din data.
        </p>
        <p className="mt-2">
          AK1A Research Lab bedriver pedagogisk finansanalys — inga tjänster här
          utgör investeringsråd. Se även vår{" "}
          <Link href="/finansiell-policy" className="underline hover:text-foreground">
            finansiella policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
