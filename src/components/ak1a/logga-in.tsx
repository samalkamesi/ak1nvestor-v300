"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lasMedlem, sparaMedlem, loggaUt, niva, lasXP, lasStjarnor } from "@/lib/member-local";
import { lasRefPending, rensaRefPending } from "@/lib/referral";
import { SIFFROR } from "@/lib/siffror";

/** localStorage-nyckel för spårat samtycke till villkor + integritetspolicy. */
const SAMTYCKE_NYCKEL = "ak1a-villkors-samtycke";

/**
 * Return-URL-sanering (VÅG 63 O2 #1): ?next= accepteras ENDAST som intern
 * sökväg — aldrig protokoll-relativa (//evil.com) eller absoluta mål
 * (https://…), annars vore ?next en öppen redirect.
 */
function santNext(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) return null;
  return raw;
}

/** Sparar samtycket vid första lyckade inloggningen — skriver aldrig över ett befintligt. */
function sparaSamtycke() {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(SAMTYCKE_NYCKEL)) return; // finns redan — blockera inte framtida besök
    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : String(Date.now());
    window.localStorage.setItem(
      SAMTYCKE_NYCKEL,
      JSON.stringify({ godkant: true, datum: new Date().toISOString(), id })
    );
  } catch {
    /* localStorage otillgängligt — blockera inte inloggningen */
  }
}

/** Inloggning med e-post — GRATIS konto: hittar eller skapar medlemmen. */
export function LoggaIn() {
  const router = useRouter();
  // Return-URL (VÅG 63 O2 #1): kurs-portallen länkar hit med
  // ?next=/kurser/{slug} — vid framgång skickas eleven direkt tillbaka.
  const next = santNext(useSearchParams().get("next"));
  const [email, setEmail] = useState("");
  const [namn, setNamn] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [redan, setRedan] = useState(false);
  const [samtycke, setSamtycke] = useState(false);

  // Redan inloggad från ett tidigare besök? Visa inloggnings-läget direkt.
  // (Tidigare useState(() => … setRedan(true)) — render-fas-updatering,
  // skör antipattern; useEffect är det hydreringssäkra sättet.) Kom eleven
  // hit med ?next och var redan medlem → återför direkt till målet.
  useEffect(() => {
    if (lasMedlem()) {
      setRedan(true);
      if (next) router.push(next);
    }
  }, [next, router]);

  // Redan sparat samtycke? Ikryssat direkt så återkommande besökare inte blockeras.
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage.getItem(SAMTYCKE_NYCKEL)) {
        setSamtycke(true);
      }
    } catch {
      /* ignorerbart */
    }
  }, []);

  const loggaIn = async () => {
    if (!email.trim()) return;
    if (!samtycke) {
      setStatus("Du måste godkänna villkoren.");
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      // m10 steg 1: bär sessions pending-ref-kod (läst EN gång av
      // RefMottagare på startsidan) med i registreringen — servern matchar
      // den mot en aktiv tipskod och KASTAR fältet efteråt (AC2). Ingen kod
      // ⇒ exakt dagens beteende (AC4).
      const ref = lasRefPending() || undefined;
      // Hitta eller skapa medlemmen
      const res = await fetch("/api/member/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: namn.trim() || null, ref }),
      });
      const data = await res.json();
      if (res.ok && data.member) {
        // Koden är konsumerad (matchad eller ej) — kasta fältet direkt.
        if (ref) rensaRefPending();
        // FAS-SYNK (gapet v171): member_type MÅSTE med — annars ser aldrig
        // fasgrindarna (kurs-access.ts) nivån och faserna förblir låsta.
        sparaMedlem({ id: data.member.id, email: data.member.email, namn: data.member.name || namn || undefined, member_type: data.member.member_type });
        sparaSamtycke();
        setStatus(
          data.isNew
            ? `Välkommen till AK1A, ${data.member.name || email}! Ditt gratis-konto är skapat — alla ${SIFFROR.kurser} kurser är upplåsta.`
            : `Välkommen tillbaka, ${data.member.name || email}!`
        );
        setRedan(true);
        // Return-URL: tillbaka till kursen som låstes (fallback Min Sida) —
        // tar bort 3 steg + hela kontextförlusten i nybörjarresan.
        router.push(next ?? "/min-sida");
      } else {
        setStatus(data.error || "Något gick fel — försök igen.");
      }
    } catch {
      setStatus("Nätverksfel — försök igen.");
    } finally {
      setBusy(false);
    }
  };

  const m = typeof window !== "undefined" ? lasMedlem() : null;

  return (
    <div className="mx-auto max-w-md">
      {redan && m ? (
        <div className="rounded-2xl border-2 border-gold bg-card p-8 text-center">
          <p className="text-4xl">✅</p>
          <h2 className="mt-3 font-serif text-2xl font-bold">Du är inloggad</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {m.namn || m.email} · Nivå {typeof window !== "undefined" ? niva() : 1}/100 ·{" "}
            {typeof window !== "undefined" ? lasXP() : 0} XP · {typeof window !== "undefined" ? lasStjarnor() : 0} ★
          </p>
          <div className="mt-5 space-y-2">
            <Link
              href="/kurser"
              className="block rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              Till alla kurser →
            </Link>
            <Link href="/min-portfolj" className="block text-sm underline hover:text-gold">
              Min portfölj
            </Link>
            <button
              onClick={() => {
                loggaUt();
                setRedan(false);
                setStatus("Du är utloggad. Välkommen åter!");
              }}
              className="text-xs text-muted-foreground underline"
            >
              Logga ut
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-gold bg-card p-8">
          <h2 className="font-serif text-2xl font-bold">Logga in — eller skapa gratis konto</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            En e-post räcker. Fundamentalanalys är en rättighet: alla {SIFFROR.kurser} kurser,
            kalkylatorn och portföljsystemet är <strong>helt gratis</strong> — för alltid.
          </p>
          <div className="mt-5 space-y-3">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@epost.se"
              onKeyDown={(e) => e.key === "Enter" && loggaIn()}
            />
            <Input
              value={namn}
              onChange={(e) => setNamn(e.target.value)}
              placeholder="Ditt namn (valfritt)"
            />
            <label
              htmlFor="ak1a-villkors-samtycke"
              className="flex cursor-pointer select-none items-start gap-2.5"
            >
              <input
                id="ak1a-villkors-samtycke"
                type="checkbox"
                checked={samtycke}
                onChange={(e) => setSamtycke(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-gold"
              />
              <span className="text-xs leading-relaxed text-muted-foreground">
                Jag godkänner{" "}
                <Link href="/villkor" className="underline hover:text-gold">
                  användarvillkoren
                </Link>{" "}
                och{" "}
                <Link href="/privacy-policy" className="underline hover:text-gold">
                  integritetspolicyn
                </Link>
                .
              </span>
            </label>
            <Button
              className="w-full bg-gold text-background hover:bg-gold/90"
              onClick={loggaIn}
              disabled={busy || !samtycke}
            >
              {busy ? "Loggar in…" : "Logga in / Skapa konto"}
            </Button>
            {!samtycke && (
              <p className="text-center text-[11px] text-muted-foreground">
                Godkänn villkoren för att fortsätta
              </p>
            )}
          </div>
          {status && <p className="mt-3 text-sm text-gold">{status}</p>}
          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            Ingen betalning, inget kort, avsluta när du vill.
          </p>
        </div>
      )}
    </div>
  );
}
