"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw } from "lucide-react";
import { adminHeaders } from "@/lib/admin-klient";

type Medlem = {
  id: string;
  email: string;
  name: string | null;
  member_type: string;
  created_at: string;
  last_login_at: string | null;
  portfolioCount: number;
};

type Kundbild = {
  medlem: { id: string; email: string; namn: string | null; niva: string; medlemSedan: string; senasteInloggning: string | null };
  engagemang: { aktiviteter90d: number; senasteAktivitet: string | null };
  intressen: { namn: string; antal }[];
  onskemolen: string[];
  portfoljer: { id: string; name: string; analysis_status: string; total_value: number }[];
};

/** Admin-flik: Kundekosystem A-Ö — välj medlem, se hela kundbilden. */
export function CustomerEcosystem() {
  const [medlemmar, setMedlemmar] = useState<Medlem[]>([]);
  const [vald, setVald] = useState<string>("");
  const [bild, setBild] = useState<Kundbild | null>(null);
  const [sok, setSok] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/members", { headers: adminHeaders() });
        const data = await res.json();
        if (!cancelled) setMedlemmar(data.members || []);
      } catch {
        if (!cancelled) setError("Kunde inte hämta medlemmar");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const oppna = async (id: string) => {
    setVald(id);
    setBild(null);
    setError("");
    try {
      const res = await fetch(`/api/admin/kundbild?memberId=${id}`);
      const data = await res.json();
      if (res.ok) setBild(data);
      else setError(data.error || `HTTP ${res.status}`);
    } catch {
      setError("Nätverksfel");
    }
  };

  const filtrerade = medlemmar.filter((m) => {
    const q = sok.toLowerCase().trim();
    return !q || m.email.toLowerCase().includes(q) || (m.name || "").toLowerCase().includes(q);
  });

  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      {/* A-Ö-lista */}
      <div>
        <div className="flex items-center gap-2">
          <Input value={sok} onChange={(e) => setSok(e.target.value)} placeholder="Sök medlem…" className="h-8 text-xs" />
          <Button variant="ghost" size="sm" onClick={() => medlemmar.length && oppna(medlemmar[0].id)}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
        <ScrollArea className="mt-3 h-[460px]">
          <div className="space-y-1 pr-3">
            {filtrerade
              .sort((a, b) => a.email.locale(b.email, "sv"))
              .map((m) => (
                <button
                  key={m.id}
                  onClick={() => oppna(m.id)}
                  className={`w-full rounded-md px-3 py-2 text-left text-xs transition-colors ${
                    vald === m.id ? "bg-gold/20 font-semibold" : "hover:bg-gold/10"
                  }`}
                >
                  <span className="block truncate">{m.name || m.email}</span>
                  <span className="block truncate text-[10px] text-muted-foreground">{m.email}</span>
                </button>
              ))}
            {filtrerade.length === 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground">Inga medlemmar ännu.</p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Kundbilden */}
      <div>
        {!vald && <p className="py-12 text-center text-sm text-muted-foreground">Välj en medlem i listan för hela kundbilden.</p>}
        {vald && error && <p className="text-sm text-red-600">{error}</p>}
        {vald && !bild && !error && <p className="py-12 text-center text-sm text-muted-foreground">Hämtar kundbild…</p>}
        {bild && (
          <div className="space-y-4">
            <div className="rounded-xl border border-gold/20 bg-card p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Kundbild A-Ö</p>
              <h3 className="mt-1 font-serif text-xl font-bold">{bild.medlem.namn || bild.medlem.email}</h3>
              <div className="mt-2 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                <span>📧 {bild.medlem.email}</span>
                <span>🏅 Nivå: {bild.medlem.niva}</span>
                <span>📅 Medlem sedan {new Date(bild.medlem.medlemSedan).toLocaleDateString("sv-SE")}</span>
                <span>🕒 Senaste inloggning {bild.medlem.senasteInloggning ? new Date(bild.medlem.senasteInloggning).toLocaleDateString("sv-SE") : "—"}</span>
                <span>⚡ {bild.engagemang.aktiviteter90d} aktiviteter (90d)</span>
                <span>💼 {bild.portfoljer.length} portföljer</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gold/20 bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Intressen (baserat på beteende)</p>
                <div className="mt-2 space-y-1.5">
                  {bild.intressen.length === 0 && <p className="text-xs text-muted-foreground">Ingen spårad aktivitet ännu.</p>}
                  {bild.intressen.map((i) => (
                    <div key={i.namn} className="flex items-center gap-2 text-xs">
                      <span className="flex-1 truncate font-mono">{i.namn}</span>
                      <span className="text-muted-foreground">{i.antal}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-gold/20 bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Härledda önskemål</p>
                <ul className="mt-2 space-y-1.5">
                  {bild.onskemolen.map((o) => (
                    <li key={o} className="flex gap-2 text-xs">
                      <span className="text-gold">◆</span>
                      <span className="text-muted-foreground">{o}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[10px] italic text-muted-foreground">
                  Härlett från sidvisningar — inte gissningar. Uppdateras löpande.
                </p>
              </div>
            </div>

            {bild.portfoljer.length > 0 && (
              <div className="rounded-xl border border-gold/20 bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Portföljer</p>
                <div className="mt-2 space-y-1">
                  {bild.portfoljer.map((p) => (
                    <div key={p.id} className="flex justify-between text-xs">
                      <span>{p.name}</span>
                      <span className="text-muted-foreground">
                        {p.total_value.toLocaleString("sv-SE")} · {p.analysis_status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
