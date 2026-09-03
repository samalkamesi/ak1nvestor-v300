"use client";

import { useMemo } from "react";
import { raknaVagkon, VAGKON_HORIZONTER, type VagkonHorisont } from "@/lib/vagkon";

// ═════════════════════════════════════════════════════════════════════════════
// VÅGKON — den första "framtidsgrafen" (forskning-visualisering № 1, MEGA_PLAN_V3 Fas C)
//
// Historik som heldragen linje; från senaste noteringen en KON av deterministiska
// P10–P90-band som breddas ∝ √t (fyllt marint område med guldkant, medianen som
// streckad guldbana). Fem AK1TS-horisonter = fem konformar i samma kon — kortare
// horisont är smalare av matematik, inte av åsikt.
//
// Ren SVG, ingen slump, inga tooltips: hela grafen är statisk och läsbar via
// aria-label. P8-ärligheten står fast under grafen — band, aldrig pil.
// ═════════════════════════════════════════════════════════════════════════════

/** P8-ärlighetstext — exakt formulering, exporterad för återanvändning och tester. */
export const VAGKON_P8_TEXT =
  "Scenarion ur historisk volatilitet — inte förutsägelser. Banden visar spridningen OM framtiden liknar det förflutna.";

/** Talet på svenska — kompakt notation för stora värden (t.ex. omsättning i kr). */
function formaTal(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 10000) {
    return new Intl.NumberFormat("sv-SE", { notation: "compact", maximumFractionDigits: 1 }).format(v);
  }
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: abs >= 100 ? 0 : abs >= 10 ? 1 : 2 }).format(v);
}

export interface VagkonGrafProps {
  /** Värdehistorik i kronologisk ordning (äldst först) — t.ex. månadsslutkurser. */
  historik: number[];
  /** Valfri rubrik över grafen. */
  titel?: string;
  /** Valfri enhetsetikett (t.ex. "SEK", "MSEK", "%"). */
  enhet?: string;
}

export function VagkonGraf({ historik, titel, enhet }: VagkonGrafProps) {
  const vagkon = useMemo(() => raknaVagkon(historik), [historik]);

  const renHistorik = useMemo(
    () => historik.filter((x) => typeof x === "number" && Number.isFinite(x)),
    [historik]
  );

  // Konens fulla bana ritas mot Mega-horisonten (den vidaste); de övriga
  // horisonterna blir etiketterade snitt inuti samma kon.
  const mega = vagkon.horisonter.mega ?? null;

  // ── Geometri (deterministisk, ren SVG) ─────────────────────────────────────
  const W = 760;
  const H = 360;
  const PV = 58; // vänster marginal för värdeetiketter
  const PH = 16; // höger marginal
  const PT = 14; // toppmarginal
  const PB = 46; // bottmarginal för horisontetiketter (två rader)
  const plotW = W - PV - PH;
  const plotH = H - PT - PB;

  const xTotal = renHistorik.length + (mega ? mega.steg : 0);
  const histEnd = renHistorik.length - 1;
  const x = (i: number) => PV + (xTotal > 1 ? i / (xTotal - 1) : 0) * plotW;

  const yMinRå = Math.min(...renHistorik, mega ? mega.p10Slut : Infinity);
  const yMaxRå = Math.max(...renHistorik, mega ? mega.p90Slut : -Infinity);
  const ySpan = Math.max(1e-9, yMaxRå - yMinRå);
  const yMin = yMinRå - ySpan * 0.06;
  const yMax = yMaxRå + ySpan * 0.06;
  const y = (v: number) => PT + (1 - (v - yMin) / (yMax - yMin)) * plotH;

  // Historiklinje (heldragen).
  const histPath = renHistorik.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");

  // Konen: marin yta uppåt längs P90, tillbaka längs P10.
  const konStartX = x(histEnd);
  const konStartY = y(vagkon.senaste);
  const konPunkter = (arr: number[]) => arr.map((v, i) => ({ xv: x(histEnd + 1 + i), yv: y(v) }));
  const linje = (pts: { xv: number; yv: number }[]) => pts.map((p) => `L${p.xv},${p.yv}`).join(" ");

  const megaP90 = mega ? konPunkter(mega.p90) : [];
  const megaP10 = mega ? konPunkter(mega.p10) : [];
  const konPath =
    mega && megaP90.length > 0
      ? `M${konStartX},${konStartY} ${linje(megaP90)} ${linje(megaP10.slice().reverse())} Z`
      : "";

  // Medianbanan (streckad guldbana) — platt på senaste värdet (μ = 0).
  const konSlutX = mega ? x(histEnd + mega.steg) : konStartX;

  // Horisontmarkörer: prickad vertikal + guldkanter + gul prick vid bandändarna.
  const markorer = mega
    ? VAGKON_HORIZONTER.map((hz: VagkonHorisont, idx: number) => {
        const d = vagkon.horisonter[hz];
        if (!d) return null;
        const mx = x(histEnd + d.steg);
        const rad = idx % 2 === 0 ? H - PB + 24 : H - PB + 40; // rader 1/2 — kollisionfria etiketter
        return { hz, d, mx, rad, yTop: y(d.p90Slut), yBot: y(d.p10Slut) };
      }).filter((m): m is NonNullable<typeof m> => m !== null)
    : [];

  const sigmaPct = vagkon.sigma !== null ? vagkon.sigma * 100 : null;
  const eSuffix = enhet ? ` ${enhet}` : "";

  const ariaLabel = mega
    ? `Vågkon${titel ? ` för ${titel}` : ""}: ${vagkon.n} historikpunkter, senaste ${formaTal(
        vagkon.senaste
      )}${eSuffix}. Sigma ${sigmaPct !== null ? sigmaPct.toFixed(1) : "?"} procent per steg ur historisk volatilitet. P10 till P90-bandet vid Mega-horisonten (${
        mega.steg
      } steg): ${formaTal(mega.p10Slut)} till ${formaTal(mega.p90Slut)}${eSuffix}. ${VAGKON_P8_TEXT}`
    : `Vågkon${titel ? ` för ${titel}` : ""}: för kort historik (${vagkon.n} punkter) för att beräkna percentilband.`;

  return (
    <figure className="w-full rounded-xl border border-gold/20 bg-card p-4">
      <figcaption className="mb-2 text-xs font-bold uppercase tracking-widest text-gold">
        ∿ Vågkon{titel ? ` — ${titel}` : ""}
      </figcaption>

      {vagkon.otillracklig || !mega ? (
        <div className="flex min-h-32 items-center justify-center rounded-lg border border-border p-6 text-center text-sm text-muted-foreground">
          För kort historik ({vagkon.n} punkter) — vågkonen kräver minst 3 punkter för att skatta
          volatiliteten. Utan underlag ritas ingen kon.
        </div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={ariaLabel}>
          {/* Vågräta hjälplinjer + värdeetiketter */}
          {[0, 0.25, 0.5, 0.75, 1].map((f) => {
            const v = yMax - (yMax - yMin) * f;
            return (
              <g key={f}>
                <line
                  x1={PV}
                  x2={W - PH}
                  y1={y(v)}
                  y2={y(v)}
                  stroke="var(--gold)"
                  strokeWidth="0.5"
                  opacity="0.15"
                />
                <text x={PV - 6} y={y(v) + 3} textAnchor="end" fontSize="10" fill="var(--muted-foreground)">
                  {formaTal(v)}
                </text>
              </g>
            );
          })}

          {/* KONEN — fyllt marint område med √t-breddning */}
          <path d={konPath} fill="var(--djup-marin)" fillOpacity="0.55" />
          {/* Guldkanten: P90 (över) och P10 (under) */}
          <path
            d={`M${konStartX},${konStartY} ${linje(megaP90)}`}
            stroke="var(--gold)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d={`M${konStartX},${konStartY} ${linje(megaP10)}`}
            stroke="var(--gold)"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Medianen — streckad guldbana (μ = 0 ⇒ platt på senaste värdet) */}
          <line
            x1={konStartX}
            x2={konSlutX}
            y1={konStartY}
            y2={konStartY}
            stroke="var(--gold)"
            strokeWidth="2"
            strokeDasharray="7 5"
          />

          {/* Horisontmarkörer: fem snitt i konen (mikro smal → mega vid) */}
          {markorer.map((m) => (
            <g key={m.hz}>
              <line
                x1={m.mx}
                x2={m.mx}
                y1={m.yTop}
                y2={m.yBot}
                stroke="var(--gold)"
                strokeWidth="0.75"
                strokeDasharray="2 3"
                opacity="0.8"
              />
              <circle cx={m.mx} cy={m.yTop} r="2.5" fill="var(--gold)" />
              <circle cx={m.mx} cy={m.yBot} r="2.5" fill="var(--gold)" />
              <line
                x1={m.mx}
                x2={m.mx}
                y1={PT}
                y2={H - PB}
                stroke="var(--muted-foreground)"
                strokeWidth="0.4"
                opacity="0.18"
              />
              <text x={m.mx} y={m.rad} textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">
                {m.d.namn} · {m.d.steg} st
              </text>
            </g>
          ))}

          {/* Slutvärden vid Mega (statisk text — inga tooltips) */}
          <text x={konSlutX - 6} y={y(mega.p90Slut) - 5} textAnchor="end" fontSize="10" fill="var(--gold)">
            P90 {formaTal(mega.p90Slut)}
          </text>
          <text x={konSlutX - 6} y={konStartY + 4} textAnchor="end" fontSize="10" fill="var(--gold)">
            Median {formaTal(vagkon.senaste)}
          </text>
          <text x={konSlutX - 6} y={y(mega.p10Slut) + 12} textAnchor="end" fontSize="10" fill="var(--gold)">
            P10 {formaTal(mega.p10Slut)}
          </text>

          {/* HISTORIKEN — heldragen linje, konen växer ur sista noteringen */}
          <path d={histPath} stroke="var(--foreground)" strokeWidth="2" fill="none" strokeLinejoin="round" />
          <circle cx={konStartX} cy={konStartY} r="3.5" fill="var(--foreground)" />
        </svg>
      )}

      {/* Statisk legend + nyckeltal (tooltip-fri läsning) */}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <svg width="26" height="10" aria-hidden="true">
            <line x1="0" y1="5" x2="26" y2="5" stroke="var(--foreground)" strokeWidth="2" />
          </svg>
          Historik ({vagkon.n} punkter)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="26" height="10" aria-hidden="true">
            <rect x="0.5" y="0.5" width="25" height="9" fill="var(--djup-marin)" fillOpacity="0.55" stroke="var(--gold)" />
          </svg>
          Kon P10–P90 (marin med guldkant)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="26" height="10" aria-hidden="true">
            <line x1="0" y1="5" x2="26" y2="5" stroke="var(--gold)" strokeWidth="2" strokeDasharray="6 4" />
          </svg>
          Median (streckad guldbana)
        </span>
        {!vagkon.otillracklig && mega && (
          <span>
            σ/steg: {sigmaPct !== null ? `${sigmaPct.toFixed(1)} %` : "?"} · Mega P10–P90:{" "}
            {formaTal(mega.p10Slut)}–{formaTal(mega.p90Slut)}
            {eSuffix}
          </span>
        )}
      </div>

      {/* P8-ÄRLIGHET — fast text-block, exakt formulering, alltid synlig */}
      <p className="mt-2 border-t border-border pt-2 text-xs leading-relaxed text-muted-foreground">
        {VAGKON_P8_TEXT}
      </p>
    </figure>
  );
}
