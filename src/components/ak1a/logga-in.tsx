"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lasMedlem, sparaMedlem, loggaUt, niva, lasXP, lasStjarnor } from "@/lib/member-local";

/** Inloggning med e-post — GRATIS konto: hittar eller skapar medlemmen. */
export function LoggaIn() {
  const [email, setEmail] = useState("");
  const [namn, setNamn] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [redan, setRedan] = useState(false);

  useState(() => {
    if (typeof window !== "undefined" && lasMedlem()) setRedan(true);
  });

  const loggaIn = async () => {
    if (!email.trim()) return;
    setBusy(true);
    setStatus("");
    try {
      // Hitta eller skapa medlemmen
      const res = await fetch("/api/member/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: namn.trim() || null }),
      });
      const data = await res.json();
      if (res.ok && data.member) {
        sparaMedlem({ id: data.member.id, email: data.member.email, namn: data.member.name || namn || undefined });
        setStatus(
          data.isNew
            ? `Välkommen till AK1A, ${data.member.name || email}! Ditt gratis-konto är skapat — alla 307 kurser är upplåsta.` // Uppdaterad 2026-09-01: 307 kurser
            : `Välkommen tillbaka, ${data.member.name || email}!`
        );
        setRedan(true);
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
            En e-post räcker. Fundamentalanalys är en rättighet: alla 307 kurser,
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
            <Button
              className="w-full bg-gold text-background hover:bg-gold/90"
              onClick={loggaIn}
              disabled={busy}
            >
              {busy ? "Loggar in…" : "Logga in / Skapa konto"}
            </Button>
          </div>
          {status && <p className="mt-3 text-sm text-gold">{status}</p>}
          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            Genom att fortsätta godkänner du vår{" "}
            <Link href="/privacy-policy" className="underline">integritetspolicy</Link> och{" "}
            <Link href="/finansiell-policy" className="underline">finansiella policy</Link>.
            Ingen betalning, inget kort, avsluta när du vill.
          </p>
        </div>
      )}
    </div>
  );
}
