"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

type Medd = { fran: "du" | "ai"; text: string };

/** Flytande chat-widget — kunskaps-AI:n (kurser + varumärke) på alla sidor. */
export function ChatWidget() {
  const [oppnad, setOppnad] = useState(false);
  const [medd, setMedd] = useState<Medd[]>([
    {
      fran: "ai",
      text: "Hej! 👋 Jag är AK1A:s kunskaps-AI. Fråga mig vad som helst om våra 226 kurser, AKM1:s variabler, Fas 1/2/3 — eller vem Sam Alkamesi är!",
    },
  ]);
  const [fragor, setFraga] = useState("");
  const [busy, setBusy] = useState(false);
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const skicka = async () => {
    const q = fragor.trim();
    if (!q || busy) return;
    setFraga("");
    setMedd((p) => [...p, { fran: "du", text: q }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fraga: q }),
      });
      const data = await res.json();
      setMedd((p) => [...p, { fran: "ai", text: data.svar || "…" }]);
    } catch {
      setMedd((p) => [...p, { fran: "ai", text: "Nätverksfel — försök igen." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {oppnad && (
        <div className="fixed bottom-20 right-4 z-50 flex h-[440px] w-[340px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border-2 border-gold bg-paper shadow-2xl">
          <div className="flex items-center justify-between bg-gold px-4 py-3 text-primary-foreground">
            <span className="font-serif font-bold">AK1A Kunskaps-AI</span>
            <button onClick={() => setOppnad(false)} aria-label="Stäng" className="text-lg leading-none">×</button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {medd.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] whitespace-pre-line rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  m.fran === "du"
                    ? "ml-auto bg-gold text-primary-foreground"
                    : "bg-card text-foreground/90 border border-gold/20"
                }`}
              >
                {m.text}
              </div>
            ))}
            {busy && <div className="rounded-xl bg-card px-3 py-2 text-xs text-muted-foreground">tänker…</div>}
          </div>
          <div className="flex gap-2 border-t border-gold/20 p-2">
            <input
              value={fragor}
              onChange={(e) => setFraga(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && skicka()}
              placeholder="t.ex. vad är ROE?"
              className="flex-1 rounded-lg border border-gold/30 bg-card px-3 py-2 text-xs outline-none focus:border-gold"
            />
            <button
              onClick={skicka}
              disabled={busy}
              className="rounded-lg bg-gold px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"
            >
              Skicka
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOppnad((o) => !o)}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold bg-paper text-2xl shadow-xl transition-transform hover:scale-105"
        aria-label="Öppna AK1A kunskaps-AI"
        title="Fråga AK1A:s AI"
      >
        {oppnad ? "×" : "💬"}
      </button>
    </>
  );
}
