"use client";

import { useEffect, useState } from "react";

/**
 * VÅG-SJÄLVSKATTNING (portfölj v2, styrelsens beslut #3)
 *
. * Eleven skattar vågklass per innehav INNAN motorn visar sitt svar —
 * pedagogiken: konfrontera egen läsning mot 5×5×4-motorns klassificering.
 * Persistens: localStorage (ingen server behövs).
 */

const NYCKEL = "ak1a-vagskattning-v1";

export type VagKlass = "impulsvåg" | "korrigering" | "basbygge";

const KLASSER: Array<{ id: VagKlass; ikon: string; etikett: string; farg: string }> = [
  { id: "impulsvåg", ikon: "▲", etikett: "Impulsvåg", farg: "border-bull/50 bg-bull/10 text-bull" },
  { id: "korrigering", ikon: "▼", etikett: "Korrigering", farg: "border-bear/50 bg-bear/10 text-bear" },
  { id: "basbygge", ikon: "◼", etikett: "Basbygge", farg: "border-gold/50 bg-gold/10 text-gold" },
];

function las(): Record<string, { klass: VagKlass; datum: string }> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(NYCKEL) || "{}");
  } catch {
    return {};
  }
}

export function VagSkattning({ ticker, motorSvar }: { ticker: string; motorSvar?: string }) {
  const [vald, setVald] = useState<VagKlass | null>(null);
  const [hydrerad, setHydrerad] = useState(false);

  useEffect(() => {
    const s = las()[ticker];
    setVald(s?.klass || null);
    setHydrerad(true);
  }, [ticker]);

  const spara = (k: VagKlass) => {
    const s = las();
    s[ticker] = { klass: k, datum: new Date().toISOString().slice(0, 10) };
    try {
      localStorage.setItem(NYCKEL, JSON.stringify(s));
    } catch {
      /* ignoreras */
    }
    setVald(k);
  };

  if (!hydrerad) return null;

  const oversens = vald && motorSvar ? (vald === motorSvar ? "match" : "avvik") : null;

  return (
    <div className="mt-2 rounded-lg border border-gold/20 bg-paper/60 p-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Din vågläsning (AK1TS · jämör motorn)
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {KLASSER.map((k) => (
          <button
            key={k.id}
            onClick={() => spara(k.id)}
            className={`rounded border px-2 py-1 text-[10px] font-bold transition-colors ${
              vald === k.id ? k.farg : "border-border bg-card text-muted-foreground hover:border-gold/40"
            }`}
          >
            {k.ikon} {k.etikett}
          </button>
        ))}
      </div>
      {vald && motorSvar && (
        <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">
          {oversens === "match" ? (
            <>✓ Din skattning <strong>{vald}</strong> matchar motorns klassificering — din läsning är i linje med momentum/volymdata.</>
          ) : (
            <>⚠ Du säger <strong>{vald}</strong>, motorn säger <strong>{motorSvar}</strong> (kort sikt). Diskutera med Short-Sellern: vilka data stödjer DIN läsning?</>
          )}
        </p>
      )}
      {vald && !motorSvar && (
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Skattning sparad ({vald}) — kör djupanalysen för att jämföra mot motorn.
        </p>
      )}
    </div>
  );
}
