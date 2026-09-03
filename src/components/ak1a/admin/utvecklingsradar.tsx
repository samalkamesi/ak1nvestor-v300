"use client";

/**
 * ADMIN UTVECKLINGSRADARN — allt kundägaren behöver för att följa
 * utvecklingen i ett enda slag: portföljforskning (P1–P9), AKM2-forskning,
 * kvalitetsvakten, språkrapporter, kurshälsa, fasplanen.
 *
 * Autentisering: egen lås-rad (samma mönster som beteende-panelen) —
 * servern kräver ADMIN_PASSWORD i x-admin-password.
 */

import React from "react";

type FilInfo = { namn: string; dag: string; kb: number };

type RadarData = {
  hamtat: string;
  portfoljSystemet: {
    universAntal: number | null;
    branscher: number;
    fundamentalaFiler: number;
    priser: Array<{ id: string; namn?: string; prisManad?: number }>;
    manifestDag: string | null;
  };
  forskning: FilInfo[];
  kvalitet: { dag: string; sektioner: Array<{ namn: string; status: string }> } | null;
  rapporter: FilInfo[];
  kurser: { antal: number; quiz: number } | null;
  faser: Array<{ fas: string; status: string }>;
};

const STATUS_FARG: Record<string, string> = {
  PASS: "text-emerald-700 bg-emerald-50 border-emerald-200",
  FAIL: "text-red-700 bg-red-50 border-red-200",
  MANUELL: "text-amber-700 bg-amber-50 border-amber-200",
  SKIP: "text-muted-foreground bg-muted/50 border-border",
};

export function Utvecklingsradar() {
  const [pwd, setPwd] = React.useState("");
  const [data, setData] = React.useState<RadarData | null>(null);
  const [fel, setFel] = React.useState<string | null>(null);
  const [laddar, setLaddar] = React.useState(false);

  const hamta = React.useCallback(async () => {
    if (!pwd) return;
    setLaddar(true);
    setFel(null);
    try {
      const res = await fetch("/api/admin/utveckling", {
        headers: { "x-admin-password": pwd },
        cache: "no-store",
      });
      if (!res.ok) {
        setFel(res.status === 401 ? "Fel lösenord." : `Servern svarade ${res.status}.`);
        setData(null);
        return;
      }
      setData((await res.json()) as RadarData);
    } catch {
      setFel("Kunde inte nå servern.");
    } finally {
      setLaddar(false);
    }
  }, [pwd]);

  return (
    <div className="space-y-4">
      {/* Lås-rad */}
      {!data && (
        <div className="rounded-lg border border-gold/30 bg-card p-4">
          <h3 className="font-serif text-lg font-bold">Utvecklingsradarn 🔭</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Hela utvecklingen i ett slag — portföljforskning, AKM2, kvalitetsvakten, kurshälsa.
            Ange admin-lösenordet för att läsa in.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && hamta()}
              placeholder="Admin-lösenord"
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={hamta}
              disabled={laddar || !pwd}
              className="rounded-md bg-[#0E1B2E] px-4 py-2 text-sm font-medium text-[#E8C766] disabled:opacity-50"
            >
              {laddar ? "Läser…" : "Läs in"}
            </button>
          </div>
          {fel && <p className="mt-2 text-sm text-red-600">{fel}</p>}
        </div>
      )}

      {data && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold">Utvecklingsradarn 🔭</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Uppdaterad {new Date(data.hamtat).toLocaleTimeString("sv-SE")}
              </span>
              <button onClick={hamta} disabled={laddar} className="text-xs underline disabled:opacity-50">
                Uppdatera
              </button>
            </div>
          </div>

          {/* Portföljforskning */}
          <div className="rounded-lg border border-gold/30 bg-card p-4">
            <h4 className="font-serif font-bold">Portföljforskningssystemet (P1–P9)</h4>
            <div className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <div className="text-2xl font-bold text-foreground">{data.portfoljSystemet.universAntal ?? "—"}</div>
                <div className="text-xs text-muted-foreground">bolag i universet (mål 100)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{data.portfoljSystemet.branscher}</div>
                <div className="text-xs text-muted-foreground">branscher (mål 10)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{data.portfoljSystemet.fundamentalaFiler}</div>
                <div className="text-xs text-muted-foreground">fundamentala cachefiler</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{data.kurser?.antal ?? "—"}</div>
                <div className="text-xs text-muted-foreground">
                  kurser · {data.kurser?.quiz?.toLocaleString("sv-SE") ?? "—"} quiz
                </div>
              </div>
            </div>
            {data.portfoljSystemet.priser.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                Prenumerationsnivåer konfigurerade:{" "}
                {data.portfoljSystemet.priser
                  .map((p) => `${p.namn ?? p.id} ${p.prisManad ?? "—"} kr/mån`)
                  .join(" · ")}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Manifest: {data.portfoljSystemet.manifestDag ?? "väntar på P1"}
            </p>
          </div>

          {/* Fasplanen */}
          {data.faser.length > 0 && (
            <div className="rounded-lg border border-gold/30 bg-card p-4">
              <h4 className="font-serif font-bold">Fasplanen (MEGA-projektet)</h4>
              <div className="mt-2 space-y-1">
                {data.faser.map((f) => (
                  <div key={f.fas} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{f.fas}</span>
                    <span className="text-xs text-muted-foreground">{f.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AKM2-forskning */}
          <div className="rounded-lg border border-gold/30 bg-card p-4">
            <h4 className="font-serif font-bold">AKM2-forskningen</h4>
            {data.forskning.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">Inga forskningsdokument landade än.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm">
                {data.forskning.map((f) => (
                  <li key={f.namn} className="flex items-center justify-between">
                    <span className="text-foreground">{f.namn}</span>
                    <span className="text-xs text-muted-foreground">
                      {f.dag} · {f.kb} kB
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Kvalitetsvakten */}
          <div className="rounded-lg border border-gold/30 bg-card p-4">
            <h4 className="font-serif font-bold">
              Kvalitetsvakten {data.kvalitet ? `· ${data.kvalitet.dag}` : ""}
            </h4>
            {!data.kvalitet ? (
              <p className="mt-1 text-sm text-muted-foreground">Ingen rapport hittad — kör verktyg/kvalitetsvakt.mjs.</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {data.kvalitet.sektioner.map((s) => (
                  <span
                    key={s.namn}
                    className={`rounded-full border px-2.5 py-0.5 text-xs ${
                      STATUS_FARG[s.status] ?? STATUS_FARG.SKIP
                    }`}
                    title={s.namn}
                  >
                    {s.status} · {s.namn}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Senaste rapporter */}
          <div className="rounded-lg border border-gold/30 bg-card p-4">
            <h4 className="font-serif font-bold">Senaste rapporter</h4>
            <ul className="mt-2 space-y-1 text-sm">
              {data.rapporter.map((r) => (
                <li key={r.namn} className="flex items-center justify-between">
                  <span className="truncate text-foreground">{r.namn}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{r.dag}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
