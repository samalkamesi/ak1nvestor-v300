"use client";

import { useCallback, useEffect, useState } from "react";

// VÄXTHUSET Fas 1 (r287) — ändringsloggpanelen (klient). Sama authmönster
// som chattpanelen: admin-lösenord i minne (aldrig localStorage), x-admin-
// password-header; med studions cookie räcker tomt fält.

interface Andring {
  hash: string;
  datum: string;
  meddelande: string;
}

function datumKort(iso: string): string {
  try {
    return new Date(iso).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default function AndringarPanel({ slug }: { slug: string }) {
  const [andringar, setAndringar] = useState<Andring[]>([]);
  const [losenord, setLosenord] = useState("");
  const [behoverLosenord, setBehoverLosenord] = useState(false);
  const [laddad, setLaddad] = useState(false);

  const hamta = useCallback(async () => {
    try {
      const svar = await fetch(`/api/vaxthus/${slug}/andringar`, {
        headers: losenord ? { "x-admin-password": losenord } : undefined,
        cache: "no-store",
      });
      if (svar.status === 401) {
        setBehoverLosenord(true);
        setLaddad(true);
        return;
      }
      const data = (await svar.json()) as { andringar?: Andring[] };
      setAndringar(data.andringar ?? []);
      setBehoverLosenord(false);
      setLaddad(true);
    } catch {
      /* nästa försök */
    }
  }, [slug, losenord]);

  useEffect(() => {
    hamta();
  }, [hamta]);

  return (
    <div>
      {behoverLosenord ? (
        <div className="mb-4 rounded-lg border border-neutral-800 p-3">
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
      {!laddad ? (
        <p className="text-sm text-neutral-500">Läser loggen…</p>
      ) : andringar.length === 0 ? (
        <p className="rounded-lg border border-neutral-800 p-4 text-sm text-neutral-500">
          Inga ändringar loggade ännu — agentens första ändring hamnar här automatiskt.
        </p>
      ) : (
        <ol className="space-y-2">
          {andringar.map((a) => (
            <li key={a.hash} className="rounded-lg border border-neutral-800 p-3 text-sm">
              <span className="mr-2 font-mono text-xs text-neutral-500">{a.hash}</span>
              <span className="mr-2 text-xs text-neutral-500">{datumKort(a.datum)}</span>
              <span className="text-neutral-200">{a.meddelande}</span>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-6 text-xs text-neutral-600">
        Varje rad är en sparad version av innehållet (agenten committar varje godkänd ändring) —
        full återblick finns i ytans git-historik.
      </p>
    </div>
  );
}
