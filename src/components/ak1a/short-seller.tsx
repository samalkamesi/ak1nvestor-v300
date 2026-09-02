"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Attack = {
  kategori: string;
  fraga: string;
  kontext: string;
};

type Svar = {
  meddelande: string;
  kontext?: string;
  historisktFall?: { bolag: string; fel: string; lardom: string } | null;
  tips?: string;
  nastaSteg?: string;
};

const AMNEN = [
  { id: "roe", namn: "ROE & Lönsamhet" },
  { id: "tillväxt", namn: "Tillväxt" },
  { id: "varde", namn: "Värdering & DCF" },
  { id: "risk", namn: "Risk & Portfölj" },
  { id: "default", namn: "🎯 Överraska mig" },
];

/** Agent 3: The Short-Seller — sokratisk grillningskomponent */
export function ShortSeller() {
  const [visar, setVisar] = useState(false);
  const [amne, setAmne] = useState("default");
  const [tes, setTes] = useState("");
  const [svar, setSvar] = useState<Svar | null>(null);
  const [busy, setBusy] = useState(false);

  const utmana = async () => {
    setBusy(true);
    setSvar(null);
    try {
      const res = await fetch("/api/shortseller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "utmana", amne }),
      });
      const data = await res.json();
      if (res.ok) setSvar(data);
    } catch {
      setSvar({ meddelande: "Nätverksfel" });
    } finally {
      setBusy(false);
    }
  };

  const forsvar = async () => {
    if (!tes.trim()) return;
    setBusy(true);
    setSvar(null);
    try {
      const res = await fetch("/api/shortseller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "forsvar", tes: tes.trim() }),
      });
      const data = await res.json();
      if (res.ok) setSvar(data);
    } catch {
      setSvar({ meddelande: "Nätverksfel" });
    } finally {
      setBusy(false);
    }
  };

  if (!visar) {
    return (
      // Trigger-knapp — vertikalt staplad ovanför AI-mentorn (gap-3) med safe-area undertill, djupare röd identitet
      <button
        onClick={() => setVisar(true)}
        className="fixed bottom-[calc(5.25rem_+_env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-800 bg-[#7A1F1F] text-2xl text-white shadow-xl transition-transform hover:scale-105"
        aria-label="Utmana mig — Short-Seller"
        title="Short-Seller: Sokratisk grillning"
      >
        🎯
      </button>
    );
  }

  return (
    // Mobil: fullbredd bottom-sheet över safe-area; desktop: oförändrad hög låda
    <div className="fixed inset-x-2 bottom-[calc(0.5rem_+_env(safe-area-inset-bottom))] z-50 flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border-2 border-[#7A1F1F] bg-paper shadow-2xl sm:bottom-20 sm:left-auto sm:right-4 sm:h-[480px] sm:max-h-none sm:w-[360px] sm:max-w-[calc(100vw-2rem)]">
      {/* Paneltopp — djup röd identitet (avsiktligt varumärke) med tydlig stängningsknapp */}
      <div className="flex items-center justify-between bg-[#7A1F1F] px-4 py-3 text-white">
        <span className="font-serif font-bold">🎯 The Short-Seller</span>
        <button
          onClick={() => setVisar(false)}
          aria-label="Stäng Short-Sellern"
          className="flex h-6 w-6 items-center justify-center rounded-full text-lg font-bold leading-none text-white transition-colors hover:bg-white/20"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs italic text-muted-foreground">
          Sokratisk grillning — jag ger aldrig svar, bara frågor som tvingar dig att tänka djupare.
        </p>

        {/* Ämnesval */}
        <div className="mt-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-600">Välj ämne att bli grillad på</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {AMNEN.map((a) => (
              <button
                key={a.id}
                onClick={() => setAmne(a.id)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  amne === a.id ? "border-red-600 bg-red-50 text-red-700" : "border-gold/20 hover:border-gold/50"
                }`}
              >
                {a.namn}
              </button>
            ))}
          </div>
          <Button
            onClick={utmana}
            disabled={busy}
            className="mt-3 w-full bg-red-600 text-white hover:bg-red-700"
            size="sm"
          >
            {busy ? "Förbereder attack..." : "🎯 Utmana mig!"}
          </Button>
        </div>

        {/* Tes-inlämning */}
        <div className="mt-4 border-t border-gold/15 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-600">
            Eller lämna in din tes för attack
          </p>
          <textarea
            value={tes}
            onChange={(e) => setTes(e.target.value)}
            placeholder="Jag tror att [bolag] är ett köp eftersom..."
            className="mt-2 w-full rounded-lg border border-gold/30 bg-card px-3 py-2 text-xs outline-none focus:border-red-600"
            rows={3}
          />
          <Button
            onClick={forsvar}
            disabled={busy || !tes.trim()}
            variant="outline"
            className="mt-2 w-full border-red-600 text-red-600 hover:bg-red-50"
            size="sm"
          >
            🔴 Försvara min tes
          </Button>
        </div>

        {/* Svar/attack */}
        {svar && (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">{svar.meddelande}</p>
              {svar.kontext && (
                <p className="mt-2 text-xs italic text-red-600">{svar.kontext}</p>
              )}
            </div>

            {svar.historisktFall && (
              <div className="rounded-xl border border-gold/30 bg-card p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
                  📚 Historiskt fall: {svar.historisktFall.bolag}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <strong>Fel:</strong> {svar.historisktFall.fel}
                  <br />
                  <strong>Lärdom:</strong> {svar.historisktFall.lardom}
                </p>
              </div>
            )}

            {svar.tips && (
              <p className="text-center text-[11px] italic text-muted-foreground">{svar.tips}</p>
            )}

            {svar.nastaSteg && (
              <p className="text-center text-xs font-semibold text-gold">{svar.nastaSteg}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
