"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { lasMedlem, loggaUt } from "@/lib/member-local";
import { useSprak } from "@/components/ak1a/sprak-leverantor";

/**
 * INLOGGAD-KNAPP — hedern i headern: aldrig en "Logga in"-knapp till någon
 * som redan är inloggad (kunddirektiv 2026-09-03). Inloggad: hälsning med
 * förnamn + diskret "Logga ut". Utloggad: guld-CTA till /logga-in.
 * SSR-renderar utloggat läge (säkert) och hydrerar till rätt läge.
 * Språk (fas 1): etiketterna via useSprak().t — sv|en|ar.
 *
 * FAS L1 (våg 86): RIKTIG konto-session kontrolleras VID MOUNT mot
 * /api/medlem {action:"session"} (EN kontroll — ingen polling). Svarar den
 * inloggad visas "Mitt konto"-läget (server-sessionen är sanningen och
 * vinner över den lokala gäst-vyn); "Logga ut" anropar {action:"signout"}
 * och rensar även den lokala vyn. Nätverksfel är tysta — knappen SSR:ar
 * utloggat och den lokala kontrollen lever kvar oförändrad under den.
 */
export function InloggadKnapp({ stor = false }: { stor?: boolean }) {
  const [namn, setNamn] = useState<string | null>(null);
  const [hydrerad, setHydrerad] = useState(false);
  const [serverInloggad, setServerInloggad] = useState(false);
  const { t } = useSprak();

  useEffect(() => {
    const m = lasMedlem();
    if (m) {
      const fornamn = (m.namn || m.email || "").split("@")[0].split(" ")[0];
      setNamn(fornamn ? fornamn.charAt(0).toUpperCase() + fornamn.slice(1) : t("auth.du"));
    }
    setHydrerad(true);
  }, [t]);

  // FAS L1: konto-session via server-proxy — EN kontroll vid mount, ingen
  // polling. Misslyckande är tyst (utloggad vy kvarstår; tokens läses aldrig
  // här — de bor i httpOnly-kakor).
  useEffect(() => {
    let aktiv = true;
    fetch("/api/medlem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "session" }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (
          aktiv &&
          data &&
          typeof data === "object" &&
          (data as { inloggad?: unknown }).inloggad === true
        ) {
          setServerInloggad(true);
        }
      })
      .catch(() => {});
    return () => {
      aktiv = false;
    };
  }, []);

  // Riktig utloggning: server-kakorna rensas + den lokala vyn följer med.
  const riktigLoggaUt = () => {
    setServerInloggad(false);
    loggaUt();
    setNamn(null);
    fetch("/api/medlem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signout" }),
    }).catch(() => {}); // best-effort — kakorna rensas i svaret; fel är kosmetiskt
  };

  // "Mitt konto"-läge: server-sessionen är sanningen (FAS L1) — vinner över
  // den lokala gäst-vyn oavsett hydrering.
  if (serverInloggad) {
    if (stor) {
      return (
        <span className="flex w-full flex-col gap-2">
          <Link
            href="/min-sida"
            className="rounded-xl border border-gold/40 bg-gold/5 px-4 py-3 text-center text-base font-bold text-gold hover:bg-gold/10"
          >
            {t("auth.mittKonto")}
          </Link>
          <button
            onClick={riktigLoggaUt}
            className="rounded-xl border border-gold/30 px-4 py-3 text-center text-sm font-semibold text-muted-foreground hover:border-gold/60 hover:text-foreground"
          >
            {t("auth.loggaUt")}
          </button>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-2">
        <Link
          href="/min-sida"
          className="hidden rounded-full border border-gold/40 bg-gold/5 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/10 sm:inline-block"
        >
          {t("auth.mittKonto")}
        </Link>
        <button
          onClick={riktigLoggaUt}
          className="rounded-md border border-gold/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-gold/60 hover:text-foreground max-md:min-h-[52px]"
        >
          {t("auth.loggaUt")}
        </button>
      </span>
    );
  }

  if (!hydrerad || !namn) {
    return (
      <Link
        href="/logga-in"
        className={
          stor
            ? "block w-full rounded-xl bg-gold px-4 py-3.5 text-center text-base font-bold text-primary-foreground shadow-xl hover:opacity-90"
            : "rounded-md bg-gold px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 max-md:min-h-[52px]"
        }
      >
        {t("auth.loggaIn")}
      </Link>
    );
  }

  if (stor) {
    return (
      <span className="flex w-full flex-col gap-2">
        <Link
          href="/min-sida"
          className="rounded-xl border border-gold/40 bg-gold/5 px-4 py-3 text-center text-base font-bold text-gold hover:bg-gold/10"
        >
          {t("auth.namnMinSida", { namn: namn ?? "" })}
        </Link>
        <button
          onClick={() => {
            loggaUt();
            setNamn(null);
          }}
          className="rounded-xl border border-gold/30 px-4 py-3 text-center text-sm font-semibold text-muted-foreground hover:border-gold/60 hover:text-foreground"
        >
          {t("auth.loggaUt")}
        </button>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <Link
        href="/min-sida"
        className="hidden rounded-full border border-gold/40 bg-gold/5 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/10 sm:inline-block"
      >
        {t("auth.namnMinSida", { namn: namn ?? "" })}
      </Link>
      <button
        onClick={() => {
          loggaUt();
          setNamn(null);
        }}
        className="rounded-md border border-gold/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-gold/60 hover:text-foreground"
      >
        {t("auth.loggaUt")}
      </button>
    </span>
  );
}
