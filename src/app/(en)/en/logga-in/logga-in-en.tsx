"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lasMedlem, sparaMedlem, loggaUt, niva, lasXP, lasStjarnor } from "@/lib/member-local";
import { SIFFROR } from "@/lib/siffror";

/** localStorage key for tracked consent to terms + privacy policy.
 *  MUST match the Swedish component — the consent is shared per browser. */
const SAMTYCKE_NYCKEL = "ak1a-villkors-samtycke";

/** Saves the consent at the first successful login — never overwrites an existing one. */
function sparaSamtycke() {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(SAMTYCKE_NYCKEL)) return; // already there — don't block future visits
    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : String(Date.now());
    window.localStorage.setItem(
      SAMTYCKE_NYCKEL,
      JSON.stringify({ godkant: true, datum: new Date().toISOString(), id })
    );
  } catch {
    /* localStorage unavailable — don't block the login */
  }
}

/**
 * ENGLISH login form (Våg 51 agent S2) — a standalone translation of
 * src/components/ak1a/logga-in.tsx. Same flow, same API, same member
 * storage; only the strings are English. The Swedish component is left
 * untouched for the i18n wave.
 */
export function LoggaInEn() {
  const [email, setEmail] = useState("");
  const [namn, setNamn] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [redan, setRedan] = useState(false);
  const [samtycke, setSamtycke] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && lasMedlem()) setRedan(true);
  }, []);

  // Consent already saved? Pre-checked so returning visitors are not blocked.
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage.getItem(SAMTYCKE_NYCKEL)) {
        setSamtycke(true);
      }
    } catch {
      /* ignorable */
    }
  }, []);

  const loggaIn = async () => {
    if (!email.trim()) return;
    if (!samtycke) {
      setStatus("You must accept the terms to continue.");
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      // Find or create the member
      const res = await fetch("/api/member/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: namn.trim() || null }),
      });
      const data = await res.json();
      if (res.ok && data.member) {
        // FAS-SYNK (gapet v171): member_type MÅSTE med — annars ser aldrig
        // fasgrindarna (kurs-access.ts) nivån och faserna förblir låsta.
        sparaMedlem({ id: data.member.id, email: data.member.email, namn: data.member.name || namn || undefined, member_type: data.member.member_type });
        sparaSamtycke();
        setStatus(
          data.isNew
            ? `Welcome to AK1A, ${data.member.name || email}! Your free account is created — all ${SIFFROR.kurser} courses are unlocked.`
            : `Welcome back, ${data.member.name || email}!`
        );
        setRedan(true);
      } else {
        setStatus(data.error || "Something went wrong — please try again.");
      }
    } catch {
      setStatus("Network error — please try again.");
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
          <h2 className="mt-3 font-serif text-2xl font-bold">You are logged in</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {m.namn || m.email} · Level {typeof window !== "undefined" ? niva() : 1}/100 ·{" "}
            {typeof window !== "undefined" ? lasXP() : 0} XP · {typeof window !== "undefined" ? lasStjarnor() : 0} ★
          </p>
          <div className="mt-5 space-y-2">
            <Link
              href="/kurser"
              className="block rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              To all courses →
            </Link>
            <Link href="/min-portfolj" className="block text-sm underline hover:text-gold">
              My portfolio
            </Link>
            <button
              onClick={() => {
                loggaUt();
                setRedan(false);
                setStatus("You are logged out. Welcome back!");
              }}
              className="text-xs text-muted-foreground underline"
            >
              Log out
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-gold bg-card p-8">
          <h2 className="font-serif text-2xl font-bold">Log in — or create a free account</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            One email is enough. Fundamental analysis is a right: all{" "}
            {SIFFROR.kurser} courses, the calculator and the portfolio system
            are <strong>completely free</strong> — forever.
          </p>
          <div className="mt-5 space-y-3">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              onKeyDown={(e) => e.key === "Enter" && loggaIn()}
            />
            <Input
              value={namn}
              onChange={(e) => setNamn(e.target.value)}
              placeholder="Your name (optional)"
            />
            <label
              htmlFor="ak1a-villkors-samtycke-en"
              className="flex cursor-pointer select-none items-start gap-2.5"
            >
              <input
                id="ak1a-villkors-samtycke-en"
                type="checkbox"
                checked={samtycke}
                onChange={(e) => setSamtycke(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-gold"
              />
              <span className="text-xs leading-relaxed text-muted-foreground">
                I accept the{" "}
                <Link href="/villkor" className="underline hover:text-gold">
                  terms of use
                </Link>{" "}
                and the{" "}
                <Link href="/privacy-policy" className="underline hover:text-gold">
                  privacy policy
                </Link>
                .
              </span>
            </label>
            <Button
              className="w-full bg-gold text-background hover:bg-gold/90"
              onClick={loggaIn}
              disabled={busy || !samtycke}
            >
              {busy ? "Logging in…" : "Log in / Create account"}
            </Button>
            {!samtycke && (
              <p className="text-center text-[11px] text-muted-foreground">
                Accept the terms to continue
              </p>
            )}
          </div>
          {status && <p className="mt-3 text-sm text-gold">{status}</p>}
          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            No payment, no card, leave whenever you want.
          </p>
        </div>
      )}
    </div>
  );
}
