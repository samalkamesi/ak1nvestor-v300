"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { lasMedlem, niva, lasXP, lasKlaraKurser } from "@/lib/member-local";

/**
 * FAS 2-ANMALAN (EN) — engelsk spegelkopia av src/components/ak1a/fas2-ansok.tsx
 * (våg 51 agent S3). Samma logik, samma API-post till /api/fas2-ansok —
 * endast texterna är översatta och länkarna pekar på /en-spegelsidorna där
 * sådana finns (övriga länkar går till de svenska originalsidorna tills
 * alla sidor är speglade). Den svenska komponenten är orörd.
 */

const MAX_VARFOR = 800;

export function Fas2AnsokEn() {
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
      setFel("Please fill in your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFel("Please fill in a valid email address.");
      return;
    }
    if (varfor.trim().length > MAX_VARFOR) {
      setFel(`The "why you" text may be at most ${MAX_VARFOR} characters.`);
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
        setFel(data.error || "Something went wrong — please try again in a moment.");
      }
    } catch {
      setFel("Network error — check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  // ── Confirmation state: application received ─────────────────────────────
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
            Application received
          </h2>
          <div className="mx-auto mt-3 h-0.5 w-24 bg-gold/40" />
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Thank you, {namn.trim() || "friend"}. We will get back to you with a
            meeting time — we read your application carefully and will be in
            touch shortly. In the meantime: <strong>Phase 1 hides nothing</strong>{" "}
            — you are welcome to keep building depth there.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/en/kurser"
              className="rounded-md bg-gold px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              Continue in Phase 1 — free
            </Link>
            <Link
              href="/en/medlemskap"
              className="text-sm underline text-muted-foreground hover:text-foreground"
            >
              Read about Phase 1 and Phase 2 again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Application form ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Student status — read locally, presented neutrally without labels */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/30 bg-card p-4">
        <div className="text-sm text-muted-foreground">
          {hydrerad ? (
            inloggad ? (
              <span>
                Your student status:{" "}
                <strong className="text-foreground">
                  Level {niv} · {elevXp.toLocaleString("en-US")} XP ·{" "}
                  {klaraKurser.length} course{klaraKurser.length === 1 ? "" : "s"}{" "}
                  completed
                </strong>
              </span>
            ) : (
              <span>
                Not logged in — fill in name and email manually.{" "}
                <Link href="/en/logga-in" className="underline hover:text-foreground">
                  Log in
                </Link>{" "}
                if you want your status fetched automatically.
              </span>
            )
          ) : (
            <span className="text-muted-foreground/60">Reading your student status…</span>
          )}
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
            redo
              ? "border-gold bg-gold/10 text-gold"
              : "border-gold/30 bg-paper text-muted-foreground"
          }`}
          title="Phase 2 is aimed at those who have gone deep in Phase 1"
        >
          Level 25{hydrerad && redo ? " — ready!" : ""}
        </span>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border-2 border-gold/60 bg-card p-7 shadow-lg sm:p-9">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold">PHASE 2 · APPLICATION</p>
        <h2 className="mt-3 font-serif text-2xl font-bold">Tell us who you are</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Three fields are enough. We read every application personally — there is
          no rush and no right answer. Level 25 is a signal, not a requirement.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="fas2-namn-en" className="mb-1.5 block text-xs font-semibold text-foreground">
              Name
            </label>
            <Input
              id="fas2-namn-en"
              value={namn}
              onChange={(e) => setNamn(e.target.value)}
              placeholder="Your name"
              maxLength={80}
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="fas2-email-en" className="mb-1.5 block text-xs font-semibold text-foreground">
              Email
            </label>
            <Input
              id="fas2-email-en"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              maxLength={160}
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="fas2-varfor-en" className="mb-1.5 block text-xs font-semibold text-foreground">
              Why you? ({varfor.length}/{MAX_VARFOR} characters)
            </label>
            <textarea
              id="fas2-varfor-en"
              value={varfor}
              onChange={(e) => setVarfor(e.target.value.slice(0, MAX_VARFOR))}
              placeholder="What do you want to learn more deeply? What has Phase 1 given you so far?"
              rows={6}
              maxLength={MAX_VARFOR}
              className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              Optional, but it helps us understand where you are in your development.
            </p>
          </div>

          <Button
            className="w-full bg-gold font-bold text-primary-foreground hover:bg-gold/90"
            onClick={skicka}
            disabled={busy}
          >
            {busy ? "Sending application…" : "Send application"}
          </Button>

          {fel && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {fel}
            </p>
          )}
        </div>
      </div>

      {/* Generous tone + terms */}
      <div className="rounded-lg border border-gold/30 bg-paper p-5 text-xs leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-foreground">No payment now.</strong> The
          application is free and non-binding. Phase 2 costs SEK 9,999 — but you
          pay nothing during the first 90 days: payment is due only after 90
          days, and only if you remain satisfied (90-day satisfaction guarantee,
          with legal basis in{" "}
          <Link href="/villkor" className="underline hover:text-foreground">
            the terms
          </Link>{" "}
          sections 5–6).{" "}
          <strong className="text-foreground">Phase 1 hides nothing</strong>: the
          entire methodology remains free, forever. We handle your data according
          to{" "}
          <Link href="/privacy-policy" className="underline hover:text-foreground">
            the privacy policy
          </Link>{" "}
          and never sell your data.
        </p>
        <p className="mt-2">
          AK1A Research Lab provides research-based financial education — no
          service here constitutes investment advice. See also our{" "}
          <Link href="/finansiell-policy" className="underline hover:text-foreground">
            financial policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
