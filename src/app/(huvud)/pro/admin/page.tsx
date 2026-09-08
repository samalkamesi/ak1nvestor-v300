"use client";

import * as React from "react";
import Link from "next/link";
import { Lock, LogOut, ShieldCheck } from "lucide-react";
import { ProAdminPanel } from "@/components/ak1a/pro/admin-panel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * /pro/admin — B2B-ADMINISTRATIONEN (Fas D, forskning-b2b).
 *
 * Skild från den publika adminen men skyddad av SAMMA lösenordsflöde:
 * ADMIN_PASSWORD verifieras mot POST /api/admin/auth (identiskt mönster som
 * src/app/admin/page.tsx). Sidan ligger under /pro och får därför PRO-skalet
 * (marin vägg, PRO-badge) via src/app/pro/layout.tsx — med tydlig ADMIN-markör.
 *
 * Allt innehåll efter inloggningen lever i ProAdminPanel.
 */

export default function ProAdminSida() {
  const [authed, setAuthed] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState("");
  const [loggarIn, setLoggarIn] = React.useState(false);

  const forsokLoggaIn = async () => {
    if (!password || loggarIn) return;
    setLoginError("");
    setLoggarIn(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthed(true);
      } else {
        const data = await res.json().catch(() => ({ error: "Fel lösenord." }));
        setLoginError(data.error || "Fel lösenord.");
      }
    } catch {
      setLoginError("Nätverksfel — försök igen.");
    } finally {
      setLoggarIn(false);
    }
  };

  const loggaUt = () => {
    setAuthed(false);
    setPassword("");
  };

  // ── Skyddsgrinden — samma auth-mönster som publika admin ──
  if (!authed) {
    return (
      <div className="flex min-h-[72vh] items-center justify-center px-4 py-16">
        <Card className="gravor-ram w-full max-w-sm rounded-xl p-6">
          <div className="flex items-center gap-2.5">
            <span className="font-serif text-lg font-bold tracking-tight">
              AK1<span className="text-gold">A</span>
            </span>
            <span className="rounded border border-[#E8C766]/60 bg-[#E8C766]/10 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.22em] text-gold">
              PRO
            </span>
            <span className="rounded border border-red-700/50 bg-red-700/10 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.22em] text-red-700 dark:text-red-400">
              ADMIN
            </span>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <Lock className="h-5 w-5 text-gold" />
            <h1 className="font-serif text-xl font-bold">PRO-administration</h1>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            AK1A PRO:s B2B-översikt — kunder, rapportmallar, white-label och
            analysanrop. Endast för behörig personal.
          </p>

          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Lösenord"
            className="mt-4"
            onKeyDown={async (e) => {
              if (e.key === "Enter") await forsokLoggaIn();
            }}
          />
          <Button
            className="mt-3 w-full bg-gold text-primary-foreground hover:bg-gold/90"
            onClick={forsokLoggaIn}
            disabled={loggarIn || !password}
          >
            {loggarIn ? "Kontrollerar…" : "Logga in"}
          </Button>
          {loginError && (
            <p className="mt-2 text-center text-xs text-red-600 dark:text-red-400">{loginError}</p>
          )}

          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
            Samma ADMIN_PASSWORD som den publika adminen — sätts i Vercel-miljövariabler.
          </p>
          <Button asChild variant="ghost" className="mt-2 w-full text-xs">
            <Link href="/pro">← Till PRO-landningen</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // ── Inloggad — PRO-skalet med ADMIN-markör + panelen ──
  return (
    <>
      <section className="marin-panel relative overflow-hidden border-b border-gold/40">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 12%, rgba(232,199,102,0.07), transparent 42%), radial-gradient(circle at 82% 88%, rgba(232,199,102,0.05), transparent 42%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-[#E8C766]/90">
                B2B · Administration · Endast behörig personal
              </p>
              <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#EDE6D6] sm:text-4xl">
                PRO-administration
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#EDE6D6]/80">
                Översikt över B2B-kunder, pro-analys-anrop, rapportmallar och
                white-label — den skilda världens egen admin. Pedagogisk analys —
                inte investeringsråd.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded border border-[#E8C766]/60 bg-[#E8C766]/10 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.22em] text-[#E8C766]">
                PRO
              </span>
              <span className="inline-flex items-center gap-1 rounded border border-red-400/60 bg-red-400/10 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.22em] text-red-300">
                <ShieldCheck className="h-3 w-3" /> ADMIN
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={loggaUt}
                className="border-[#E8C766]/50 text-[#E8C766] hover:bg-[#E8C766]/10 hover:text-[#E8C766]"
              >
                <LogOut className="mr-1 h-3.5 w-3.5" /> Logga ut
              </Button>
            </div>
          </div>
          <div className="hjarlinje mt-8" />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <ProAdminPanel />
      </div>
    </>
  );
}
