"use client";

import { useEffect, useState } from "react";

/**
 * DAGENS VÅGKARTA — autonom mätning (AKM1 × körVagfundament × MarketStack).
 * Marin panel som läser /api/vagscan/senaste vid mount: universum-summering
 * som fyra chips (▲ ▼ ◼ ·), stigande/fallande fundament som två listor samt
 * tidsstämpel och disclaimer. Pedagogiskt verktyg — inte investeringsråd.
 * Hydration-säkert: tomt första passt, hämtning enbart i useEffect.
 */

type Sammanfattning = { impulsvag: number; korrigering: number; basbygge: number; osatt: number };

type Rorelse = { variabel: string; namn: string; antalBolag: number; text: string };

type VagkartaData = {
  genererad?: string;
  universumSammanfattning?: Sammanfattning;
  topRorelse?: Rorelse[];
  botRorelse?: Rorelse[];
  /** VÅG 56: universumets medel-enighetsscore 0–100 per horisont + totalt
   * (beräknas server-side i /api/vagscan/senaste — rådets formel 40/30/30). */
  enighet?: { total: number | null; perHorisont?: Record<string, number | null> };
};

type Tillstand =
  | { lagge: "laddar" }
  | { lagge: "klar"; data: VagkartaData }
  | { lagge: "saknas" };

function formatTid(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Enighetstitel: per-horisonts medelscore i kanonisk ordning (hover-tips). */
function enighetTitel(perHorisont?: Record<string, number | null>): string {
  const delar: string[] = [];
  for (const [hz, namn] of [
    ["mikro", "mikro"],
    ["kort", "kort"],
    ["medellang", "medellång"],
    ["lang", "lång"],
    ["mega", "mega"],
  ] as const) {
    const v = perHorisont?.[hz];
    delar.push(namn + " " + (typeof v === "number" ? v : "—"));
  }
  return "Universumets medel-enighet per horisont: " + delar.join(" · ");
}

export function VagkartaKort() {
  const [tillstand, setTillstand] = useState<Tillstand>({ lagge: "laddar" });

  useEffect(() => {
    let aktiv = true;
    (async () => {
      try {
        const res = await fetch("/api/vagscan/senaste");
        const json = (await res.json()) as VagkartaData & { saknas?: boolean };
        if (!aktiv) return;
        if (json && json.saknas !== true && (json.universumSammanfattning || json.topRorelse)) {
          setTillstand({ lagge: "klar", data: json });
        } else {
          setTillstand({ lagge: "saknas" });
        }
      } catch {
        if (aktiv) setTillstand({ lagge: "saknas" });
      }
    })();
    return () => {
      aktiv = false;
    };
  }, []);

  return (
    <section className="rounded-xl border border-gold/30 bg-card p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-sm font-bold tracking-wide text-gold">
          Dagens vågkarta — autonom mätning
        </h2>
        {tillstand.lagge === "klar" && tillstand.data.genererad ? (
          <span className="shrink-0 text-[11px] text-muted-foreground">{formatTid(tillstand.data.genererad)}</span>
        ) : null}
      </div>

      {tillstand.lagge === "laddar" ? (
        <p className="mt-3 animate-pulse text-xs text-muted-foreground">
          Mäter vågor i fundamentaldata (V01–V20 × 5 horisonter)…
        </p>
      ) : null}

      {tillstand.lagge === "saknas" ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Ingen vågkarta sparad ännu — den autonoma mätningen körs enligt schema och
          hamnar här efter första genomloppet.
        </p>
      ) : null}

      {tillstand.lagge === "klar" ? (
        <>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-md border border-bull/30 bg-bull/20 px-2 py-1 text-xs font-semibold text-bull">
              ▲ {tillstand.data.universumSammanfattning?.impulsvag ?? 0} impulsvågor
            </span>
            <span className="rounded-md border border-bear/30 bg-bear/20 px-2 py-1 text-xs font-semibold text-bear">
              ▼ {tillstand.data.universumSammanfattning?.korrigering ?? 0} korrigeringar
            </span>
            <span className="rounded-md border border-gold/40 bg-gold/20 px-2 py-1 text-xs font-semibold text-gold">
              ◼ {tillstand.data.universumSammanfattning?.basbygge ?? 0} basbyggen
            </span>
            <span className="rounded-md border border-border bg-muted/30 px-2 py-1 text-xs font-semibold text-muted-foreground">
              · {tillstand.data.universumSammanfattning?.osatt ?? 0} osatta
            </span>
            {/* VÅG 56 — enighetsscore 0–100 (universumssnitt): en tunn mätning
                ska se tunn ut. Null när inget underlag finns (ärlig tystnad). */}
            <span
              className="rounded-md border border-gold/30 bg-gold/10 px-2 py-1 text-xs font-semibold text-gold"
              title={enighetTitel(tillstand.data.enighet?.perHorisont)}
            >
              ◈ enighet{" "}
              {typeof tillstand.data.enighet?.total === "number"
                ? `${tillstand.data.enighet.total}/100`
                : "—"}
            </span>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-bull">Stigande fundament</h3>
              <ul className="mt-1.5 space-y-1">
                {(tillstand.data.topRorelse ?? []).length > 0 ? (
                  (tillstand.data.topRorelse ?? []).map((r) => (
                    <li key={r.variabel} className="text-xs text-foreground">
                      ▲ {r.text}
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-muted-foreground">Inga dominerande stigande fundament just nu</li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-bear">Fallande fundament</h3>
              <ul className="mt-1.5 space-y-1">
                {(tillstand.data.botRorelse ?? []).length > 0 ? (
                  (tillstand.data.botRorelse ?? []).map((r) => (
                    <li key={r.variabel} className="text-xs text-foreground">
                      ▼ {r.text}
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-muted-foreground">Inga dominerande fallande fundament just nu</li>
                )}
              </ul>
            </div>
          </div>
        </>
      ) : null}

      <p className="mt-3 border-t border-border pt-2 text-[11px] text-muted-foreground">
        Pedagogisk analys — inte investeringsråd. Deterministisk vågmätning på
        fundamentaldata (Yahoo Finance) med kursstöd (MarketStack). Enighet
        0–100 = 40 % medel-bekräftelse + 30 % tröskelmarginal + 30 %
        celltäckning (universumssnitt).
      </p>
    </section>
  );
}
