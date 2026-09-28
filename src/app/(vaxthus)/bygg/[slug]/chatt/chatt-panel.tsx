"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// VÄXTHUSET Fas 1 (r285) — chattpanelen (klient).
// Autentisering: admin-lösenordet (Fas 1 = stängd registrering). Lösenordet
// lever ENDAST i komponentens minne (P6: aldrig localStorage/logg) och skickas
// som x-admin-header per anrop; med studions sessions-cookie räcker tomt fält.
// Pollning: 3 s medan agenten arbetar, annars vid aktivitet.

interface ChattRad {
  ts: string;
  roll: string;
  text: string;
}

export default function ChattPanel({ slug }: { slug: string }) {
  const [meddelanden, setMeddelanden] = useState<ChattRad[]>([]);
  const [status, setStatus] = useState<"ledig" | "pagaar">("ledig");
  const [inmatning, setInmatning] = useState("");
  const [losenord, setLosenord] = useState("");
  const [behoverLosenord, setBehoverLosenord] = useState(false);
  const [fel, setFel] = useState("");
  const listaRef = useRef<HTMLDivElement>(null);

  const hamta = useCallback(async () => {
    try {
      const svar = await fetch(`/api/vaxthus/${slug}/chatt`, {
        headers: losenord ? { "x-admin-password": losenord } : undefined,
        cache: "no-store",
      });
      if (svar.status === 401) {
        setBehoverLosenord(true);
        return;
      }
      const data = (await svar.json()) as { status?: string; meddelanden?: ChattRad[] };
      setMeddelanden(data.meddelanden ?? []);
      setStatus(data.status === "pagaar" ? "pagaar" : "ledig");
      setBehoverLosenord(false);
    } catch {
      /* nästa poll försöker igen */
    }
  }, [slug, losenord]);

  useEffect(() => {
    hamta();
  }, [hamta]);

  useEffect(() => {
    const intervall = setInterval(hamta, 3000);
    return () => clearInterval(intervall);
  }, [hamta]);

  useEffect(() => {
    listaRef.current?.scrollTo({ top: listaRef.current.scrollHeight });
  }, [meddelanden]);

  const skicka = async () => {
    const text = inmatning.trim();
    if (!text || status === "pagaar") return;
    setFel("");
    setInmatning("");
    try {
      const svar = await fetch(`/api/vaxthus/${slug}/chatt`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(losenord ? { "x-admin-password": losenord } : {}),
        },
        body: JSON.stringify({ meddelande: text, adminPassword: losenord || undefined }),
      });
      if (svar.status === 401) {
        setBehoverLosenord(true);
        setFel("Fel lösenord — försök igen.");
        setInmatning(text);
        return;
      }
      const data = (await svar.json()) as { status?: string; fel?: string };
      if (data.fel) {
        setFel(data.fel);
        setInmatning(text);
        return;
      }
      setStatus("pagaar");
      hamta();
    } catch {
      setFel("Nätverksfel — försök igen.");
      setInmatning(text);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-neutral-800">
      {behoverLosenord ? (
        <div className="border-b border-neutral-800 p-3">
          <label className="flex items-center gap-2 text-xs text-neutral-400">
            Admin-lösenord:
            <input
              type="password"
              value={losenord}
              onChange={(e) => setLosenord(e.target.value)}
              className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100"
              placeholder="lösenord"
            />
            <button onClick={hamta} className="rounded border border-neutral-700 px-2 py-1 hover:border-neutral-400">
              Lås upp
            </button>
          </label>
        </div>
      ) : null}
      <div ref={listaRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {meddelanden.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Skriv ditt första meddelande — t.ex. &quot;Vi heter X och säljer Y. Gör startsidan klar
            och lägg till en kontaktsida.&quot;
          </p>
        ) : (
          meddelanden.map((m, i) => (
            <div
              key={i}
              className={
                m.roll === "kund"
                  ? "ml-auto max-w-[85%] rounded-lg bg-blue-900/50 px-3 py-2 text-sm"
                  : "mr-auto max-w-[85%] whitespace-pre-wrap rounded-lg bg-neutral-800 px-3 py-2 text-sm"
              }
            >
              {m.text}
            </div>
          ))
        )}
        {status === "pagaar" ? (
          <div className="mr-auto max-w-[85%] rounded-lg bg-neutral-800/50 px-3 py-2 text-sm text-neutral-400">
            Agenten arbetar… (kan ta någon minut — svaret landar här)
          </div>
        ) : null}
      </div>
      {fel ? <p className="px-4 pb-1 text-xs text-red-400">{fel}</p> : null}
      <div className="flex gap-2 border-t border-neutral-800 p-3">
        <textarea
          value={inmatning}
          onChange={(e) => setInmatning(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              skicka();
            }
          }}
          rows={2}
          disabled={status === "pagaar"}
          placeholder={status === "pagaar" ? "Agenten arbetar…" : "Skriv till agenten… (Enter = skicka)"}
          className="min-h-0 flex-1 resize-none rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600"
        />
        <button
          onClick={skicka}
          disabled={status === "pagaar" || inmatning.trim().length < 2}
          className="rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-40"
        >
          Skicka
        </button>
      </div>
    </div>
  );
}
