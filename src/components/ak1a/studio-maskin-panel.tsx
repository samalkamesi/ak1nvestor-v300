"use client";
/**
 * MASKINENS PULS — synlighetspanelen (våg 164)
 * =====================================================================
 * Kundfrågan 2026-09-15: "Jobbar loopen i bakgrunden? För jag ser ej
 * sådant." Sanningen: alltid — men allt levde i loggfiler. Denna panel
 * visar organismen i realtid: mål/order + iteration, fabriksomgångar,
 * hjärtats slag, auditens senaste autonoma handlingar, vaktdomar.
 * Pollar /api/studio/maskin var 20:e s (synlig flik) — filbaserad källa,
 * mikrosekunder, pumpvänlig.
 */
import React from "react";
import { Activity, Cog, FileCheck2, HeartPulse, ScrollText } from "lucide-react";

import { adminHeaders } from "@/lib/admin-klient";

interface MaskinData {
  ts: number;
  mal: {
    mal: string | null;
    aktiv: boolean;
    pausad: boolean;
    iteration: number;
    pagaendeTurn: boolean;
    arKunduppdrag: boolean;
  };
  malFranDisk: string | null;
  fabrik: {
    manifestationer: { id: string; status: string; klara: number; totalt: number }[];
    ko: string[];
  };
  hjarta: string[];
  audit: { ts: string; aktor: string; atgard: string; artefakt?: string }[];
  uppdrag: { ts: string; händelse?: string; handelse?: string }[];
  vakter: {
    juridik: { ts?: string; status?: string; sammanfattning?: string } | null;
    scenario: string | null;
  };
  synk: string[];
}

export function StudioMaskinPanel() {
  const [data, setData] = React.useState<MaskinData | null>(null);
  const [fel, setFel] = React.useState("");

  const hamta = React.useCallback(async () => {
    try {
      const r = await fetch("/api/studio/maskin", { headers: adminHeaders() });
      if (r.ok) {
        setData((await r.json()) as MaskinData);
        setFel("");
      } else {
        setFel(`Maskinpulsen svarade ${r.status}`);
      }
    } catch {
      setFel("Maskinpulsen kunde ej nås");
    }
  }, []);

  React.useEffect(() => {
    void hamta();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void hamta();
    }, 20_000);
    return () => clearInterval(id);
  }, [hamta]);

  const m = data?.mal;
  const pasket = m && (m.aktiv || m.pagaendeTurn);
  const statusFärg = pasket ? "text-[#3FB950]" : m?.pausad ? "text-[#D29922]" : "text-[#8B949E]";

  return (
    <section aria-label="Maskinens puls" className="border-b border-[#30363D]">
      <p className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B949E]">
        <HeartPulse className="h-3.5 w-3.5 shrink-0" />
        Maskinen
        <span className={`ml-auto font-mono text-[9px] ${statusFärg}`}>
          {pasket ? "ARBETAR" : m?.pausad ? "PAUSAD" : "VILAR/VAKTAR"}
        </span>
      </p>
      <div className="px-3 pb-3 space-y-2 font-mono text-[10px] leading-relaxed">
        {fel && <p className="text-[#F85149]">{fel}</p>}
        {!data && !fel && <p className="text-[#484F58]">Läser maskinens puls…</p>}
        {data && (
          <>
            {/* Mål / order */}
            <p className="text-[#E6EDF3]">
              <Activity className="mr-1 inline h-3 w-3" aria-hidden />
              {m?.arKunduppdrag ? "📋 DIN ORDER" : "Mål"}:{" "}
              {m?.mal ? m.mal.slice(0, 90) : data.malFranDisk ? `${data.malFranDisk.slice(0, 80)}… (disk)` : "—"}
            </p>
            {m?.pagaendeTurn && (
              <p className="text-[#3FB950]">→ agenten arbetar JUST NU (pågående tur)</p>
            )}
            {typeof m?.iteration === "number" && m.iteration > 0 && (
              <p className="text-[#8B949E]">iteration {m.iteration}</p>
            )}

            {/* Fabriken */}
            <p className="text-[#E6EDF3] pt-1">
              <Cog className="mr-1 inline h-3 w-3" aria-hidden />
              Fabriken:{" "}
              {data.fabrik.manifestationer.length === 0
                ? " kön tom (evighetsmotorn fyller)"
                : data.fabrik.manifestationer
                    .slice(0, 3)
                    .map((x) => `${x.id} ${x.klara}/${x.totalt} ${x.status}`)
                    .join(" · ")}
            </p>
            {data.fabrik.ko.length > 0 && (
              <p className="text-[#8B949E]">kö: {data.fabrik.ko.join(", ").slice(0, 80)}</p>
            )}

            {/* Hjärtat */}
            {data.hjarta.length > 0 && (
              <p className="text-[#8B949E] pt-1" title={data.hjarta.join("\n")}>
                <HeartPulse className="mr-1 inline h-3 w-3" aria-hidden />
                senaste slag: {data.hjarta[data.hjarta.length - 1].slice(0, 70)}
              </p>
            )}

            {/* Audit — de autonoma handlingarna */}
            {data.audit.length > 0 && (
              <div className="pt-1">
                <p className="text-[#E6EDF3]">
                  <ScrollText className="mr-1 inline h-3 w-3" aria-hidden />
                  Senaste autonoma handlingar:
                </p>
                <ul className="mt-0.5 space-y-0.5 text-[#8B949E]">
                  {data.audit
                    .slice(-4)
                    .reverse()
                    .map((a, i) => (
                      <li key={i} className="truncate">
                        · {(a.ts || "").slice(11, 19)} {a.aktor}: {a.atgard}
                        {a.artefakt ? ` (${String(a.artefakt).slice(0, 26)})` : ""}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Vakter */}
            <p className="text-[#8B949E] pt-1">
              <FileCheck2 className="mr-1 inline h-3 w-3" aria-hidden />
              juridik {data.vakter.juridik?.status ?? "—"} · scenario{" "}
              {data.vakter.scenario?.includes("GRÖNT") ? "GRÖNT" : data.vakter.scenario ? "se logg" : "—"}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
