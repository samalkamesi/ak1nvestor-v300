"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { lasKlientkontext } from "@/lib/klientkontext";
import { lasLarvagSvar, type LarvagRekKlient, type LarvagSvar } from "@/lib/larvag-klient";
import { harLokalProgress } from "@/lib/medlem-progress-klient";

/**
 * DIN NÄSTA KURS — lärvägsmotorn synliggjord (våg 88, B1-LARVAG).
 *
 * Kärnan bor på SERVERN (raknaLarvag via GET /api/larvag): kortet skickar
 * ENDAST en sammanfattad kontext (fas + lästillstånd + streak — eko-
 * mönstret, inga personuppgifter) och renderar topp-tipsen med varför-rader.
 * Hydration-säkert: tomt första passt (ISR-orört), hämtning i useEffect —
 * fel/tömhet ⇒ kortet vilar tyst. Aldrig ett tvång — alltid en inbjudan.
 *
 * Ytor: Min Sida ("Din nästa kurs"), kurssidan ("Fortsätt här" — aktuell
 * kurs exkluderas via exkluderaSlug).
 */
export function LarvagKort({
  antal = 1,
  rubrik = "Din nästa kurs",
  exkluderaSlug,
}: {
  antal?: number;
  rubrik?: string;
  /** Kursen eleven står på (kurssidans "Fortsätt här" — aldrig aktuell kurs). */
  exkluderaSlug?: string;
}) {
  const [rek, setRek] = useState<LarvagRekKlient[]>([]);

  useEffect(() => {
    let aktiv = true;
    // Kontexten läses ENDAST här (localStorage — aldrig under render).
    const k = lasKlientkontext();
    void lasLarvagSvar(k, antal, exkluderaSlug).then((s) => {
      if (aktiv) setRek(s.rek);
    });
    return () => {
      aktiv = false;
    };
  }, [antal, exkluderaSlug]);

  if (rek.length === 0) return null;

  return (
    <section className="rounded-xl border border-gold/30 bg-card p-4">
      <h2 className="font-serif text-sm font-bold tracking-wide text-gold">{rubrik}</h2>
      <ul className="mt-2 space-y-1.5">
        {rek.map((r) => (
          <li key={r.slug}>
            <Link
              href={`/kurser/${r.slug}`}
              className="flex items-center gap-3 rounded-lg border border-gold/10 px-3 py-2.5 hover:bg-gold/10 max-md:min-h-[52px]"
            >
              <span className="text-xl" aria-hidden>
                {r.ikon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-foreground">{r.titel}</span>
                {r.varför && <span className="block text-xs text-muted-foreground">{r.varför}</span>}
              </span>
              <span className="shrink-0 text-xs font-semibold text-gold">Öppna →</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
