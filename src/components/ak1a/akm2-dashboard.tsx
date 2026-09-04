"use client";

/**
 * AKM2-DASHBOARD — visuella komponenter för AKM2 (våg 57, agent D3).
 *
 * KUNDENS ORD: "dashboarden med visuella grafer och bilder som ska hjälpa
 * klienter att ta bästa beslut".
 *
 * Komponenter (exporteras hitifrån så att D1:s kalkylator-läge, D2:s
 * detaljsidor och demon på /kalkylator kan importera samma grund):
 *   Akm2Radar          — spindelnät V01–V20 + modulring V21–V29 + total i mitten
 *   ModulPåslagStapel  — horisontell stapel per aktiv modul + dynamikrader
 *   ProfilJamforelse   — AKM1 vs AKM2 (+differenschip, topp-2 orsaker)
 *   Akm2Dashboard      — sammansatt vy; äger highlight-state (parent)
 *   Akm2DemoStrip      — story-lik demo med syntetiska fixturer (/kalkylator)
 *
 * STIL: utökad ur VIL (src/components/ak1a/visuellt-bibliotek.tsx, Akm1Radar)
 * — ren SVG utan bibliotek, marin+guld-DNA, kort inramning
 * "rounded-xl border border-gold/20 bg-card". Färgblint-vänligt: FÄRG BÄR
 * ALDRIG INFORMATION ALLENA — varje punkt/rad har etikett + textvärde
 * (variabelnamn, poäng, ±tecken, riktningpil), radar-polygonen är den enda
 * fyllda ytan och modulprickarna den enda punktformen.
 *
 * Interaktivitet: hover-tooltip per radarpunkt (variabelnamn + poäng) och
 * klick på stapel/radarpunkt → highlight av motsvarande punkt (state i
 * parent-komponenten Akm2Dashboard, vidare via props).
 *
 * Data: AKM2Resultat (src/lib/akm2/typer.ts) — ren TS, klientsäker;
 * effektiva poäng (efter dynamik) via kärnans effektivaPoang.
 *
 * Pedagogisk forskning — ALDRIG investeringsråd (lagen 2007:528).
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AKM2Resultat, DynamikJustering, DynamikLagerSvar } from "@/lib/akm2/typer";
import type { RaknaAKM2Opts } from "@/lib/akm2/typer";
import type { AKM3Ensemble, EnsembleEnighet } from "@/lib/akm3/typer";
import {
  BAND_TEXT,
  DYNAMIKTAK,
  KARNVARIABLER,
  VARIABEL_META,
  effektivaPoang,
  raknaAKM2,
} from "@/lib/akm2/karna";
import type { BolagsNyckeltal, Dynamik, Horisont, VagKlass } from "@/lib/portfolj-forskning/typer";
import { byggModulAktiveringar, modulKortNamn, svTal } from "@/lib/akm2-visningsdata";

// ── Palett (SVG-attribut; temebeständiga via CSS-variabler med VIL-fallback) ─

const F_GULD = "var(--gold, #a8862a)";        // huvudlinjer/data (VIL:s ton)
const F_GULD_MORK = "var(--gold-soft, #c9a84c)"; // ringar/dekor
const F_MARIN = "var(--djup-marin, #0e1b2e)"; // center + AKM1-stapel

/** Modulvariablarna som modulringen visar (V21–V29; V29 villkorad/inaktiv). */
const MODULVARIABLER: string[] = Array.from({ length: 9 }, (_, i) => `V${21 + i}`);

const RIKNING_TEXT: Record<Dynamik, string> = {
  forbattras: "↑ förbättras",
  stabilt: "→ stabilt",
  forsvamras: "↓ försvagas",
  osatt: "· osatt",
};

// ── Gemensam vylogik ─────────────────────────────────────────────────────────

/** Rå poäng per variabel: kärna (V01–V20) eller modul (V21+). */
function raPoang(resultat: AKM2Resultat, v: string): number {
  if (v in resultat.lager2.poang) return resultat.lager2.poang[v];
  return resultat.lager1.poang[v] ?? 0;
}

/** Kärnvariabeln osatt? (kärnan markerar med motivering som börjar "Osatt") */
function arOsattKarna(resultat: AKM2Resultat, v: string): boolean {
  return Boolean(resultat.lager1.motivering?.[v]?.startsWith("Osatt"));
}

/** Info om en variabel för tooltip/markering. */
type VariabelInfo = {
  variabel: string;
  namn: string;
  poang: number;          // effektiv poäng (efter dynamik) där den finns
  ra: number;             // rå poäng
  osatt: boolean;
  kalla: "kärna" | "modul" | "osatt modul";
  modul?: string;
};

function variabelInfo(resultat: AKM2Resultat, phatt: Record<string, number>, v: string): VariabelInfo {
  const meta = VARIABEL_META[v];
  if (KARNVARIABLER.includes(v)) {
    return {
      variabel: v,
      namn: meta?.namn ?? v,
      poang: phatt[v] ?? 0,
      ra: resultat.lager1.poang[v] ?? 0,
      osatt: arOsattKarna(resultat, v),
      kalla: "kärna",
    };
  }
  if (v in resultat.lager2.poang) {
    const m = resultat.lager2.aktiveradeModuler.find((mm) => mm.poang && v in mm.poang);
    return {
      variabel: v,
      namn: meta?.namn ?? v,
      poang: resultat.lager2.poang[v],
      ra: resultat.lager2.poang[v],
      osatt: false,
      kalla: "modul",
      modul: m ? modulKortNamn(m.modulId) : undefined,
    };
  }
  return {
    variabel: v,
    namn: meta?.namn ?? v,
    poang: 0,
    ra: 0,
    osatt: true,
    kalla: "osatt modul",
  };
}

/** Portchip-färg per band — texten (BAND_TEXT) bär alltid betydelsen. */
function bandKlass(band: AKM2Resultat["band"]): string {
  switch (band) {
    case "aktor":
      return "border-emerald-700/40 bg-emerald-700/10 text-emerald-800 dark:text-emerald-300";
    case "studera":
      return "border-gold/40 bg-gold/10 text-foreground";
    case "skjut":
      return "border-red-800/30 bg-red-800/10 text-red-800 dark:text-red-300";
    default:
      return "border-muted-foreground/30 bg-muted text-muted-foreground";
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. AKM2-RADAR — spindelnät V01–V20 + modulring V21–V29 + total i mitten
// ═════════════════════════════════════════════════════════════════════════════

export function Akm2Radar({
  resultat,
  aktivVariabel = null,
  onVariabelKlick,
  rubrik = "🎯 AKM2-profil",
}: {
  resultat: AKM2Resultat;
  /** Markerad variabel (från parent-state — stapelklick lyfter hit). */
  aktivVariabel?: string | null;
  /** Klick på en punkt → parent beslutar (toggle: samma variabel → null). */
  onVariabelKlick?: (v: string | null) => void;
  rubrik?: string;
}) {
  const [hoverad, setHoverad] = useState<string | null>(null);
  const phatt = useMemo(() => effektivaPoang(resultat), [resultat]);

  const n = KARNVARIABLER.length; // 20 kärnvariabler
  const W = 340, H = 340, cx = 170, cy = 170, R = 94;
  const RING = 128; // modulringens radie (V21–V29-prickar)

  const vinkel = (i: number, total: number) => (Math.PI * 2 * i) / total - Math.PI / 2;
  const punkt = (i: number, val: number) => ({
    x: cx + Math.cos(vinkel(i, n)) * ((R * val) / 5),
    y: cy + Math.sin(vinkel(i, n)) * ((R * val) / 5),
  });

  const path =
    KARNVARIABLER.map((v, i) => {
      const p = punkt(i, phatt[v] ?? 0);
      return `${i === 0 ? "M" : "L"}${p.x},${p.y}`;
    }).join(" ") + " Z";

  const visa = hoverad ?? aktivVariabel;
  const info = visa ? variabelInfo(resultat, phatt, visa) : null;

  const hanteraKlick = (v: string) => {
    if (!onVariabelKlick) return;
    onVariabelKlick(aktivVariabel === v ? null : v);
  };

  return (
    <div className="rounded-xl border border-gold/20 bg-card p-3">
      <p className="text-center text-xs font-bold uppercase tracking-widest text-gold">{rubrik}</p>

      {/* Tooltip-slot (fast höjd — ingen layout-shift vid hover; texten bär
          informationen, färgen är bara stöd) */}
      <div className="mx-auto mt-1 min-h-[18px] max-w-[320px] text-center text-[11px] leading-tight">
        {info ? (
          <span className={info.osatt ? "text-muted-foreground italic" : "text-foreground"}>
            <strong className="font-mono">{info.variabel}</strong> · {info.namn} —{" "}
            {info.osatt ? (
              "osatt (0/5 p)"
            ) : (
              <>
                {info.poang}/5 p
                {info.poang !== info.ra && (
                  <span className="text-muted-foreground"> (rå {info.ra})</span>
                )}
              </>
            )}
            <span className="text-muted-foreground">
              {" "}
              · {info.kalla === "kärna" ? "kärnan" : info.modul ? `modul ${info.modul}` : "modul"}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">
            Hovra över en punkt för namn och poäng — klicka för att fästa markeringen.
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto mt-1 w-full max-w-[340px]"
        role="img"
        aria-label={`AKM2-radar för ${resultat.namn}: komposit ${resultat.komposit} av 100, ${BAND_TEXT[resultat.band]}`}
      >
        {/* Grid-cirklar 1–5 (VIL-geometri) */}
        {[1, 2, 3, 4, 5].map((niv) => (
          <circle key={niv} cx={cx} cy={cy} r={(R * niv) / 5} fill="none" stroke={F_GULD} strokeWidth="0.4" opacity="0.3" />
        ))}
        {/* Axlar V01–V20 */}
        {KARNVARIABLER.map((v, i) => {
          const p = punkt(i, 5);
          return <line key={v} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={F_GULD} strokeWidth="0.4" opacity="0.3" />;
        })}

        {/* Modulring V21–V29 — streckad, aktiva moduler prickade guld */}
        <circle cx={cx} cy={cy} r={RING} fill="none" stroke={F_GULD_MORK} strokeWidth="0.7" strokeDasharray="3 4" opacity="0.55" />
        <text x={cx} y={cy - RING - 4} textAnchor="middle" fontSize="6" fill={F_GULD_MORK} fontWeight="700">
          MODULER V21–V29
        </text>
        {MODULVARIABLER.map((v, i) => {
          const a = vinkel(i, MODULVARIABLER.length);
          const x = cx + Math.cos(a) * RING;
          const y = cy + Math.sin(a) * RING;
          const aktivModul = v in resultat.lager2.poang;
          const vald = aktivVariabel === v;
          const lx = cx + Math.cos(a) * (RING + 13);
          const ly = cy + Math.sin(a) * (RING + 13);
          return (
            <g key={v}>
              <circle
                cx={x}
                cy={y}
                r={aktivModul ? 4.5 : 2.5}
                fill={aktivModul ? F_GULD : "none"}
                stroke={aktivModul ? F_GULD : "currentColor"}
                strokeWidth={aktivModul ? 0.8 : 0.7}
                className={aktivModul ? "" : "text-muted-foreground"}
                opacity={aktivModul ? 1 : 0.55}
              />
              {vald && (
                <circle cx={x} cy={y} r="8" fill="none" stroke={F_GULD_MORK} strokeWidth="1.5" />
              )}
              {/* Etikett: variabel + poäng (texten bär informationen) */}
              <text
                x={lx}
                y={ly + 2}
                textAnchor="middle"
                fontSize="6.5"
                fontWeight={vald || hoverad === v ? "700" : "500"}
                fill={aktivModul ? F_GULD : "currentColor"}
                className={aktivModul ? "" : "text-muted-foreground"}
              >
                {v}
                {aktivModul ? ` ${resultat.lager2.poang[v]}` : " ·"}
              </text>
              {/* Träffyta för hover/klick */}
              <circle
                cx={x}
                cy={y}
                r="11"
                fill="transparent"
                style={{ cursor: onVariabelKlick ? "pointer" : "default" }}
                onMouseEnter={() => setHoverad(v)}
                onMouseLeave={() => setHoverad((h) => (h === v ? null : h))}
                onClick={() => hanteraKlick(v)}
              >
                <title>{`${v} ${VARIABEL_META[v]?.namn ?? ""} — ${aktivModul ? `${resultat.lager2.poang[v]}/5 p (modul)` : "osatt/inaktiv"}`}</title>
              </circle>
            </g>
          );
        })}

        {/* Datayta V01–V20 (effektiva poäng — efter dynamik) */}
        <path d={path} fill={F_GULD} fillOpacity="0.25" stroke={F_GULD} strokeWidth="2" />

        {/* Kärnpunkter + etiketter + träffytor */}
        {KARNVARIABLER.map((v, i) => {
          const val = phatt[v] ?? 0;
          const p = punkt(i, val);
          const lp = punkt(i, 5.85);
          const vald = aktivVariabel === v;
          return (
            <g key={v}>
              <circle cx={p.x} cy={p.y} r="3" fill={F_GULD} stroke="var(--paper, #f5f1e8)" strokeWidth="0.7" />
              {vald && <circle cx={p.x} cy={p.y} r="6.5" fill="none" stroke={F_GULD_MORK} strokeWidth="1.5" />}
              <text
                x={lp.x}
                y={lp.y + 2}
                textAnchor="middle"
                fontSize="6"
                fontWeight={vald || hoverad === v ? "700" : "600"}
                fill={vald || hoverad === v ? F_GULD : "currentColor"}
                className={vald || hoverad === v ? "" : "text-muted-foreground"}
              >
                {v}
              </text>
              <circle
                cx={p.x}
                cy={p.y}
                r="9"
                fill="transparent"
                style={{ cursor: onVariabelKlick ? "pointer" : "default" }}
                onMouseEnter={() => setHoverad(v)}
                onMouseLeave={() => setHoverad((h) => (h === v ? null : h))}
                onClick={() => hanteraKlick(v)}
              >
                <title>{`${v} ${VARIABEL_META[v]?.namn ?? ""} — ${val}/5 p${arOsattKarna(resultat, v) ? " (osatt)" : ""}`}</title>
              </circle>
            </g>
          );
        })}

        {/* Totalen i mitten — marin skiva med guldtext */}
        <circle cx={cx} cy={cy} r="30" fill={F_MARIN} stroke={F_GULD} strokeWidth="1.5" />
        <text x={cx} y={cy + 1} textAnchor="middle" fontSize="16" fontWeight="bold" fill={F_GULD_MORK}>
          {resultat.komposit}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="7" fill={F_GULD_MORK}>
          /100 komposit
        </text>
      </svg>

      <p className="mt-1 text-center text-[10px] leading-tight text-muted-foreground">
        Spindelnät: kärnans V01–V20 (efter dynamik). Ring: aktiva modulvariabler
        prickade guld — tomma cirklar är osatta/inaktiva. Klicka på en punkt för
        att koppla markeringen till modulstaplarna.
      </p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. MODULPÅSLAG-STAPEL — per aktiv modul + dynamikjusteringar per par
// ═════════════════════════════════════════════════════════════════════════════

export function ModulPåslagStapel({
  resultat,
  aktivVariabel = null,
  onVariabelKlick,
}: {
  resultat: AKM2Resultat;
  aktivVariabel?: string | null;
  onVariabelKlick?: (v: string | null) => void;
}) {
  const phatt = useMemo(() => effektivaPoang(resultat), [resultat]);
  const vikt = resultat.lager4.viktPerVariabel ?? {};

  const modulRader = resultat.lager2.aktiveradeModuler.map((m) => {
    const vs = Object.keys(m.poang ?? {}).sort();
    const bidrag = vs.reduce((s, v) => s + (vikt[v] ?? 0) * (m.poang?.[v] ?? 0) * 20, 0);
    return { m, vs, bidrag };
  });
  const maxBidrag = Math.max(0.0001, ...modulRader.map((r) => r.bidrag));

  // Dynamik: kärnans gate + faktiska effekt per justering (efter vikt + avrundning).
  const neutralText = resultat.lager3.konfluens.text.startsWith("Dynamiklagret ej anropat");
  const portOppen =
    !neutralText && resultat.lager3.konfluens.port === "oppen";
  const justeringar: Array<DynamikJustering & { effekt: number }> = Object.values(
    resultat.lager3.perVariabel ?? {},
  )
    .filter((j) => Math.abs(j.justering) > 0.0001)
    .map((j) => {
      const effekt = ((phatt[j.variabel] ?? 0) - raPoang(resultat, j.variabel)) * (vikt[j.variabel] ?? 0) * 20;
      return { ...j, effekt };
    })
    .sort((a, b) => Math.abs(b.justering) - Math.abs(a.justering));

  // Sammanlagd modulering (kompositpoäng) — taket ±10 syns i notisen.
  const modulering = [...KARNVARIABLER, ...Object.keys(resultat.lager2.poang)].reduce(
    (s, v) => s + ((phatt[v] ?? 0) - raPoang(resultat, v)) * (vikt[v] ?? 0) * 20,
    0,
  );
  const takNudd = Math.abs(modulering) >= DYNAMIKTAK - 0.05;

  const chip = (v: string, aktiv: boolean) =>
    `rounded-full border px-2 py-0.5 font-mono text-[10px] transition-colors ${
      aktiv
        ? "border-gold/60 bg-gold/15 text-foreground"
        : "border-gold/15 bg-transparent text-muted-foreground hover:border-gold/40 hover:text-foreground"
    }`;

  return (
    <div className="rounded-xl border border-gold/20 bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gold">
        🧩 Modulpåslag &amp; dynamik (V21–V29)
      </p>

      {modulRader.length === 0 ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Inga moduler aktiva — kärnans V01–V20 bär hela profilen. Moduler
          aktiveras per bransch (BESLUT §1) i AKM2-läget.
        </p>
      ) : (
        <div className="mt-3 space-y-2.5">
          {modulRader.map(({ m, vs, bidrag }) => (
            <div key={m.modulId} className="rounded-lg border border-gold/15 bg-paper p-2.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="text-sm font-semibold">
                  {modulKortNamn(m.modulId)}
                  <span className="ml-2 rounded-full bg-gold/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                    {m.automatisk ? "branschmatchad" : "manuell"}
                  </span>
                </span>
                {/* ±poäng: tecknet står i texten — färgen är bara stöd */}
                <span className="font-mono text-xs font-bold text-gold">+{svTal(bidrag)} p</span>
              </div>
              <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded bg-muted" role="img" aria-label={`Modulen ${modulKortNamn(m.modulId)} bidrar ${svTal(bidrag)} kompositpoäng`}>
                <div
                  className="h-full rounded bg-gold"
                  style={{ width: `${Math.max(2, (bidrag / maxBidrag) * 100)}%` }}
                />
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {vs.length === 0 && (
                  <span className="text-[10px] italic text-muted-foreground">
                    Modulen levererade inga poäng — allt underlag osatt.
                  </span>
                )}
                {vs.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={chip(v, aktivVariabel === v)}
                    onClick={() => onVariabelKlick?.(aktivVariabel === v ? null : v)}
                    title={`${v} ${VARIABEL_META[v]?.namn ?? ""} — ${m.poang?.[v] ?? 0}/5 p → lyfter radarpunkten`}
                  >
                    {v} {VARIABEL_META[v]?.namn?.split(" ")[0] ?? ""} {m.poang?.[v] ?? 0}/5
                  </button>
                ))}
              </div>
              {m.orsak && (
                <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{m.orsak}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Dynamikjusteringar per par (riktning + belopp + tak-notis) ── */}
      <div className="mt-4 border-t border-gold/15 pt-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          Vågdynamik — justeringar per par
        </p>
        {neutralText ? (
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Dynamiklagret ej aktiverat i den här beräkningen — varje poäng är ren
            fundamental analys (neutral degradering, R4 §4).
          </p>
        ) : (
          <>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Konfluensport:{" "}
              <strong className={portOppen ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}>
                {resultat.lager3.konfluens.port === "oppen" ? "öppen" : resultat.lager3.konfluens.port}
              </strong>{" "}
              — {resultat.lager3.konfluens.text}
            </p>
            {justeringar.length === 0 ? (
              <p className="mt-1.5 text-xs italic text-muted-foreground">
                Inga justeringar levererade (osatt är osatt — modulen gissar aldrig).
              </p>
            ) : (
              <ul className="mt-2 space-y-1">
                {justeringar.map((j) => {
                  const namn = VARIABEL_META[j.variabel]?.namn ?? j.variabel;
                  const positiv = j.justering > 0;
                  const verkar = portOppen && Math.abs(j.effekt) > 0.005;
                  return (
                    <li key={j.variabel}>
                      <button
                        type="button"
                        onClick={() => onVariabelKlick?.(aktivVariabel === j.variabel ? null : j.variabel)}
                        className={`flex w-full flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded px-1.5 py-1 text-left text-xs transition-colors hover:bg-gold/10 ${
                          aktivVariabel === j.variabel ? "bg-gold/15" : ""
                        }`}
                        title={`${j.motivering} — klicka för att lyfta radarpunkten`}
                      >
                        <span className="font-mono font-semibold">{j.variabel}</span>
                        <span className="min-w-0 flex-1 truncate text-muted-foreground">{namn}</span>
                        {/* Riktningpil + tecken i text — färgblint-säkert */}
                        <span
                          className={`font-mono font-bold ${
                            positiv ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
                          }`}
                        >
                          {RIKNING_TEXT[j.riktning]} {positiv ? "+" : "−"}
                          {svTal(Math.abs(j.justering), 2)}
                        </span>
                        <span className={`font-mono ${verkar ? "text-foreground" : "text-muted-foreground line-through"}`}>
                          {verkar ? `${j.effekt >= 0 ? "+" : "−"}${svTal(Math.abs(j.effekt))} p` : "0,0 p"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {/* Tak-notis vid ±10 */}
            <p className={`mt-2 text-[11px] leading-snug ${takNudd ? "font-semibold text-amber-700 dark:text-amber-400" : "text-muted-foreground"}`}>
              Sammanlagd modulering {modulering >= 0 ? "+" : "−"}
              {svTal(Math.abs(modulering))} p — tak ±{DYNAMIKTAK} p
              {takNudd
                ? " — TAK NÅTT: vågläsningen kan aldrig flytta kompositen mer än ±10 p (R4 §3)."
                : " (vågor väger aldrig om grundbilden)."}
              {!portOppen && " Porten ej öppen: justeringarna är nollställda."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. PROFILJÄMFÖRELSE — AKM1 vs AKM2 + differens + varför-skillnaden
// ═════════════════════════════════════════════════════════════════════════════

export function ProfilJamforelse({
  resultat,
  akm1Totalt,
  kompakt = false,
}: {
  resultat: AKM2Resultat;
  /** Egen AKM1-referens (t.ex. sidans P1-summa) — default kärnans skugga. */
  akm1Totalt?: number;
  kompakt?: boolean;
}) {
  const a1 = akm1Totalt ?? resultat.lager1.totalt;
  const k2 = resultat.komposit;
  const diff = k2 - a1;

  // Topp-2 orsaker ur moduler/dynamik (styrka = kompositpoäng; port väger tyngst).
  const orsaker: Array<{ text: string; styrka: number }> = [];
  if (resultat.lager2.notering?.includes("HÅRD PORT")) {
    orsaker.push({
      text: "Hård port (BESLUT §5): kassatäckningen understiger 12 månader — kompositen takad till max 45/100.",
      styrka: 1000,
    });
  }
  for (const v of Object.keys(resultat.lager2.poang)) {
    const b = (resultat.lager4.viktPerVariabel?.[v] ?? 0) * resultat.lager2.poang[v] * 20;
    if (b > 0.05) {
      const m = resultat.lager2.aktiveradeModuler.find((mm) => mm.poang && v in mm.poang);
      orsaker.push({
        text: `Modulen ${m ? modulKortNamn(m.modulId) : "?"}: ${v} ${VARIABEL_META[v]?.namn ?? ""} bidrar +${svTal(b)} p.`,
        styrka: b,
      });
    }
  }
  const neutralText = resultat.lager3.konfluens.text.startsWith("Dynamiklagret ej anropat");
  if (!neutralText && resultat.lager3.konfluens.port === "oppen") {
    const phatt = effektivaPoang(resultat);
    for (const j of Object.values(resultat.lager3.perVariabel ?? {})) {
      const eff =
        ((phatt[j.variabel] ?? 0) - raPoang(resultat, j.variabel)) *
        (resultat.lager4.viktPerVariabel?.[j.variabel] ?? 0) * 20;
      if (Math.abs(eff) > 0.05) {
        orsaker.push({
          text: `Vågdynamiken ${j.variabel} ${VARIABEL_META[j.variabel]?.namn ?? ""}: poängen ${raPoang(resultat, j.variabel)} → ${phatt[j.variabel] ?? 0} (${eff >= 0 ? "+" : "−"}${svTal(Math.abs(eff))} p).`,
          styrka: Math.abs(eff),
        });
      }
    }
  }
  orsaker.sort((a, b) => b.styrka - a.styrka);
  const topp2 = orsaker.slice(0, 2);

  return (
    <div className="rounded-xl border border-gold/20 bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gold">⚖️ AKM1 → AKM2</p>

      <div className="mt-3 space-y-2">
        {/* AKM1 — marin stapel */}
        <div>
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-muted-foreground">AKM1 · klassisk summa (V01–V20)</span>
            <span className="font-mono font-bold">{svTal(a1)} p</span>
          </div>
          <div className="mt-1 h-4 w-full overflow-hidden rounded bg-muted" role="img" aria-label={`AKM1 ${svTal(a1)} av 100`}>
            <div
              className="h-full rounded border border-gold/40"
              style={{ width: `${Math.min(100, Math.max(0.5, a1))}%`, background: F_MARIN }}
            />
          </div>
        </div>
        {/* AKM2 — guld stapel */}
        <div>
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-muted-foreground">AKM2 · komposit (moduler + vikter + dynamik)</span>
            <span className="font-mono font-bold">{svTal(k2)} p</span>
          </div>
          <div className="mt-1 h-4 w-full overflow-hidden rounded bg-muted" role="img" aria-label={`AKM2-komposit ${svTal(k2)} av 100, band ${BAND_TEXT[resultat.band]}`}>
            <div className="h-full rounded bg-gold" style={{ width: `${Math.min(100, Math.max(0.5, k2))}%` }} />
          </div>
        </div>
      </div>

      {/* Differenschip — tecken + pil i text */}
      <p className="mt-3 text-sm">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-xs font-bold ${
            diff > 0
              ? "border-emerald-700/40 bg-emerald-700/10 text-emerald-800 dark:text-emerald-300"
              : diff < 0
                ? "border-red-800/30 bg-red-800/10 text-red-800 dark:text-red-300"
                : "border-gold/30 bg-gold/10 text-foreground"
          }`}
        >
          {diff > 0 ? "↑" : diff < 0 ? "↓" : "="} {diff >= 0 ? "+" : "−"}
          {svTal(Math.abs(diff))} p
        </span>
        <span className="ml-2 text-xs text-muted-foreground">AKM2 mot AKM1</span>
      </p>

      {/* Mini-förklaring: varför skillnaden — topp-2 orsaker */}
      {!kompakt && (
        <div className="mt-3 border-t border-gold/15 pt-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Varför skillnaden</p>
          {topp2.length > 0 ? (
            <ul className="mt-1 space-y-1 text-xs leading-snug">
              {topp2.map((o, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="font-mono text-[10px] font-bold text-gold">{i + 1}.</span>
                  <span className="text-muted-foreground">{o.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-xs leading-snug text-muted-foreground">
              {Math.abs(diff) < 0.5
                ? "Identiskt — AKM2 med neutrala inställningar är exakt AKM1 (projektionsinvarianten)."
                : `Skillnaden bär av viktfördelningen: ${resultat.lager4.omfordelning?.exkluderade.length ?? 0} variabler saknar underlag och deras vikt har omfördelats till de satta (BESLUT §2).`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 3.5 PROFIL-ENSEMBLE-VY — AKM3 (våg 59 bygg-1, AKM3-BESLUT §4, r5 Design A)
//     Tre staplar (profilkompositer) + band [min–median–max] + ensemble-medel
//     + spridningschip med enighetstrappan. Läser, ändrar aldrig poäng —
//     visas ALLTID sida vid sida med AKM2/AKM1, ersätter ALDRIG (P4).
// ═════════════════════════════════════════════════════════════════════════════

/** Profilnamn i visningsordning (kanonisk medlemsordning ur akm3/typer). */
const ENSEMBLE_PROFIL_ETIKETT: Record<string, string> = {
  "akm1-klassisk": "AKM1-klassisk (lås)",
  "akm2-2026": "AKM2-2026",
  "superanalys-2026": "Superanalys-2026",
};

const ENIGHET_ETIKETT: Record<EnsembleEnighet, { text: string; klass: string }> = {
  enig: {
    text: "ENIG — alla tre profilvärldarna ser samma bolag",
    klass: "border-emerald-700/40 bg-emerald-700/10 text-emerald-800 dark:text-emerald-300",
  },
  delad: {
    text: "DELAD — profilernas faktorsyn skiljer, läs differenserna",
    klass: "border-gold/40 bg-gold/10 text-foreground",
  },
  profilspanning: {
    text: "PROFILSPÄNNING — poängen styrs av profilval, inte bolaget",
    klass: "border-red-800/30 bg-red-800/10 text-red-800 dark:text-red-300",
  },
};

export function ProfilEnsembleVy({
  ensemble,
  kalla,
}: {
  ensemble: AKM3Ensemble;
  /** Varifrån ensemblen kom (cache/on-demand) — transparens i visningen. */
  kalla?: string;
}) {
  const e = ensemble;
  const grader = ENIGHET_ETIKETT[e.enighet] ?? ENIGHET_ETIKETT.delad;
  const bandVanster = Math.min(100, Math.max(0, e.band.min));
  const bandBredd = Math.min(100, Math.max(0, e.band.max)) - bandVanster;
  const medelVanster = Math.min(100, Math.max(0, e.total));

  return (
    <div className="rounded-xl border border-gold/20 bg-card p-4" data-akm3-ensemble="">
      <p className="text-xs font-bold uppercase tracking-widest text-gold">
        🧭 Profil-ensemble · AKM3
      </p>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
        Likaviktat medel (α = 1/3, låst i 2026.09) av de tre viktprofilernas
        AKM2-kompositer — ett presentationsaggregat ÖVER AKM2 som aldrig
        ersätter kompositen eller AKM1-projektionen (BESLUT §4).
      </p>

      {/* Tre staplar — en per profilkomposit K_p (texten bär informationen) */}
      <div className="mt-3 space-y-2">
        {e.perProfil.map((p) => (
          <div key={p.profil}>
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="min-w-0 truncate text-muted-foreground">
                {ENSEMBLE_PROFIL_ETIKETT[p.profil] ?? p.profil}
                <span className="ml-1.5 font-mono text-[10px] opacity-80">
                  osatta {svTal(p.andelOsatta * 100, 0)} %{p.portAktiv ? " · hård port" : ""}
                </span>
              </span>
              <span className="shrink-0 font-mono font-bold">{svTal(p.komposit, 0)} p</span>
            </div>
            <div
              className="mt-1 h-3.5 w-full overflow-hidden rounded bg-muted"
              role="img"
              aria-label={`${ENSEMBLE_PROFIL_ETIKETT[p.profil] ?? p.profil}: komposit ${p.komposit} av 100, band ${BAND_TEXT[p.band]}, ${Math.round(p.andelOsatta * 100)} procent osatta${p.portAktiv ? ", hård port aktiv" : ""}`}
            >
              <div
                className={p.portAktiv ? "h-full rounded bg-gold/50" : "h-full rounded bg-gold"}
                style={{ width: `${Math.min(100, Math.max(0.5, p.komposit))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Band [min–median–max] + ensemble-medel-markören */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between text-xs">
          <span className="text-muted-foreground">Band min–median–max</span>
          <span className="font-mono">
            {svTal(e.band.min, 0)} – {svTal(e.band.median, 0)} – {svTal(e.band.max, 0)}
          </span>
        </div>
        <div
          className="relative mt-1 h-4 w-full rounded border border-gold/25 bg-muted"
          role="img"
          aria-label={`Ensemble-band ${e.band.min} till ${e.band.max}, median ${e.band.median}, likaviktat medel ${e.total} av 100, spridning ${e.spridning} poäng`}
        >
          {/* Bandet [min, max] — guldtonad remsa */}
          <div
            className="absolute inset-y-0 rounded bg-gold/25"
            style={{ left: `${bandVanster}%`, width: `${Math.max(bandBredd, 0.75)}%` }}
          />
          {/* Median-streck (mittenvärdet) */}
          <div
            className="absolute inset-y-0 w-0.5 bg-gold/70"
            style={{ left: `${Math.min(100, Math.max(0, e.band.median))}%` }}
            title={`Median ${e.band.median} (mittenvärdet av de tre profilkompositerna)`}
          />
          {/* Ensemble-medel — marin markör med tal-etikett */}
          <div
            className="absolute -top-1 h-6 w-[3px] rounded"
            style={{ left: `${medelVanster}%`, background: F_MARIN }}
            title={`Ensemble-medel ${e.total} = round(1/3 · (${e.perProfil.map((p) => p.komposit).join(" + ")}))`}
          />
        </div>
        <p className="mt-1.5 text-sm">
          <span className="font-mono font-bold">{svTal(e.total, 0)}/100</span>
          <span className="ml-1.5 text-xs text-muted-foreground">
            ensemble-medel (α = 1/3 vardera, låst)
          </span>
        </p>
      </div>

      {/* Spridningschip + enighetstrappan (texten bär betydelsen) */}
      <p className="mt-3">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-xs font-bold ${grader.klass}`}>
          spridning {svTal(e.spridning, 0)} p · {grader.text.split(" — ")[0]}
        </span>
        <span className="ml-2 align-middle text-xs text-muted-foreground">{grader.text.split(" — ")[1] ?? ""}</span>
      </p>

      {/* Diagnostik: de två tolkningsnycklarna (BESLUT §4) */}
      <div className="mt-3 border-t border-gold/15 pt-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Diagnostik</p>
        <ul className="mt-1 space-y-0.5 text-xs leading-snug text-muted-foreground">
          <li>
            Omfördelningseffekten (AKM2-2026 − AKM1-klassisk):{" "}
            <span className="font-mono font-semibold">
              {e.diagnostik.omfordelningseffekt > 0 ? "+" : e.diagnostik.omfordelningseffekt < 0 ? "−" : "±"}
              {svTal(Math.abs(e.diagnostik.omfordelningseffekt), 0)} p
            </span>{" "}
            — osattas vikt + moduler.
          </li>
          <li>
            Kategorivikt vs variabelvikt (Superanalys-2026 − AKM2-2026):{" "}
            <span className="font-mono font-semibold">
              {e.diagnostik.kategoriMotVariabel > 0 ? "+" : e.diagnostik.kategoriMotVariabel < 0 ? "−" : "±"}
              {svTal(Math.abs(e.diagnostik.kategoriMotVariabel), 0)} p
            </span>
            .
          </li>
          <li>
            Jämförelsespår sida vid sida: AKM2-komposit{" "}
            <span className="font-mono font-semibold">{svTal(e.akm2Komposit, 0)}</span> · AKM1-projektion{" "}
            <span className="font-mono font-semibold">{svTal(e.akm1Totalt, 0)}</span>.
          </li>
        </ul>
      </div>

      <p className="mt-3 border-t border-gold/15 pt-2 text-[10px] leading-relaxed text-muted-foreground">
        Modellversion {e.modellVersion} · datum {e.datum}.
        {kalla ? ` Källa: ${kalla}.` : ""} Enighetstrappan: 0–3 p enig · 4–7 p
        delad · ≥ 8 p profilspänning. Ensemblen mäts öppet i
        prediktionsloggen — ”öppet kvitto om det förflutna, aldrig garanti
        om framtiden”. Pedagogisk forskning — aldrig investeringsråd (lagen
        2007:528).
      </p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. AKM2-DASHBOARD — sammansatt vy (äger highlight-state i parent)
// ═════════════════════════════════════════════════════════════════════════════

export function Akm2Dashboard({
  resultat,
  prenumerationsEtikett,
  notis,
  ensemble,
  ensembleKalla,
}: {
  resultat: AKM2Resultat;
  /** Prenumerations-etikett där relevant (chips i sidhuvudet). */
  prenumerationsEtikett?: string;
  /** Fri notisrad under dashboarden (t.ex. källhänvisning). */
  notis?: string;
  /** AKM3-ensemble (våg 59) — visas SIDAN VID SIDAN under jämförelsen,
   *  ersätter ALDRIG AKM2/AKM1 (BESLUT §4). */
  ensemble?: AKM3Ensemble;
  /** Var ensemblen kom ifrån (cache/on-demand) — transparens i visningen. */
  ensembleKalla?: string;
}) {
  const [aktivVariabel, setAktivVariabel] = useState<string | null>(null);

  return (
    <div data-akm2-dashboard="">
      {/* Huvudrad: bolag, band, etiketter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-serif text-lg font-bold">
          {resultat.namn}
          <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">{resultat.ticker}</span>
        </span>
        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${bandKlass(resultat.band)}`}>
          {BAND_TEXT[resultat.band]} · {resultat.komposit}/100
        </span>
        <span className="rounded-full border border-gold/25 bg-paper px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          viktprofil: {resultat.lager4.viktprofil}
        </span>
        {prenumerationsEtikett && (
          <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground">
            {prenumerationsEtikett}
          </span>
        )}
      </div>

      <div className="mt-3 grid items-start gap-4 lg:grid-cols-[360px_1fr]">
        <Akm2Radar resultat={resultat} aktivVariabel={aktivVariabel} onVariabelKlick={setAktivVariabel} />
        <div className="space-y-4">
          <ProfilJamforelse resultat={resultat} />
          {ensemble && <ProfilEnsembleVy ensemble={ensemble} kalla={ensembleKalla} />}
          <ModulPåslagStapel resultat={resultat} aktivVariabel={aktivVariabel} onVariabelKlick={setAktivVariabel} />
        </div>
      </div>

      <p className="mt-3 border-t border-gold/15 pt-2 text-[11px] leading-relaxed text-muted-foreground">
        {notis && <span className="mr-1">{notis}</span>}
        Moduler aktiveras per bransch, modulpoängen väger enligt profilen, och
        vågdynamiken får som mest flytta kompositen ±{DYNAMIKTAK} p. Osatta
        variabler gissas aldrig. Pedagogisk forskning — aldrig investeringsråd
        (lagen 2007:528).
      </p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 5. DEMO-STRIP — /kalkylator:s topp (när AKM2-läget ej låst/upplåst)
//    Fixturer syntetiska (samma värden som verktyg/testa-akm2-moduler.mjs:s
//    FIXTUR_A/FIXTUR_B-mönster) — ingen verklig kursdata.
// ═════════════════════════════════════════════════════════════════════════════

const DEMO_IND: BolagsNyckeltal = {
  ticker: "DEMO-IND.ST",
  namn: "Demo Industri AB (syntetisk fixtur)",
  bransch: "industri",
  land: "Sverige",
  valuta: "SEK",
  kallor: [
    { namn: "Årsredovisning 2026 (demo-fixtur)", hamtat: "2026-09-01" },
    { namn: "Analysdatabas (demo-fixtur)", hamtat: "2026-09-01" },
  ],
  hamtat: "2026-09-01",
  pris: 100,
  marknadsKapitalMdr: 40,
  tillvaxt: { omsattningCAGR5ar: 0.05, resultatCAGR5ar: 0.06, omsattningTillvaxtTTM: 0.04, prognosTillvaxt: 0.04 },
  lonksamhet: { roe: 0.16, roic: 0.185, bruttoMarginal: 0.32, ebitMarginal: 0.12, nettoMarginal: 0.12, fcfMarginal: 0.14 },
  stabilitet: { skuldEgenkapital: 0.8, rantaTackning: 7.5, fcfPositivaSenaste5: 5, kassaManaderBurnRate: null, nyemissionerSenaste5ar: 0 },
  aterkop: { senasteArMdr: 0.6, andelUtestande: 1.5, insiderkopSenaste6man: 3 },
  moat: { bruttoMarginalMedel5ar: 0.31, bruttoMarginalSpread5ar: 0.02, roeMedel5ar: 0.15 },
  vardering: { pe: 16.7, pb: 3.3, evEbit: 8.0, peg: 2.8, fcfYield: 0.085, egenKapitalMultipl: 3.3 },
  golv: { typ: "reim", vardePerAktie: 62, marginal: 0.38 },
  serier: {
    ar: ["2022", "2023", "2024", "2025", "2026"],
    omsattning: [3.8, 3.9, 3.95, 4.0, 4.0],
    resultat: [0.4, 0.42, 0.44, 0.46, 0.48],
    egetKapital: [1.1, 1.12, 1.15, 1.18, 1.2],
    fcf: [0.5, 0.55, 0.6, 0.62, 0.64],
  },
  notering: "Syntetisk demo-fixtur för pedagogisk visning — ingen verklig kursdata.",
};

const DEMO_SAAS: BolagsNyckeltal = {
  ticker: "DEMO-SAAS.ST",
  namn: "Demo SaaS AB (syntetisk fixtur, hål i underlaget)",
  bransch: "teknik",
  land: "Sverige",
  valuta: "SEK",
  kallor: [
    { namn: "Årsredovisning 2026 (demo-fixtur)", hamtat: "2026-09-01" },
    { namn: "IR-presentation (demo-fixtur)", hamtat: "2026-09-01" },
  ],
  hamtat: "2026-09-01",
  pris: 50,
  marknadsKapitalMdr: 12,
  tillvaxt: { omsattningCAGR5ar: 0.28, resultatCAGR5ar: null, omsattningTillvaxtTTM: 0.24, prognosTillvaxt: 0.2 },
  lonksamhet: { roe: null, roic: null, bruttoMarginal: 0.78, ebitMarginal: null, nettoMarginal: null, fcfMarginal: null },
  stabilitet: { skuldEgenkapital: null, rantaTackning: null, fcfPositivaSenaste5: 0, kassaManaderBurnRate: 19, nyemissionerSenaste5ar: 2 },
  aterkop: { senasteArMdr: null, andelUtestande: null, insiderkopSenaste6man: null },
  moat: { bruttoMarginalMedel5ar: 0.8, bruttoMarginalSpread5ar: 0.03, roeMedel5ar: null },
  vardering: { pe: null, pb: 8.0, evEbit: 14.0, peg: null, fcfYield: null, egenKapitalMultipl: 8.0 },
  golv: { typ: "osatt", vardePerAktie: null, marginal: null },
  serier: {
    ar: ["2022", "2023", "2024", "2025", "2026"],
    omsattning: [0.5, 0.62, 0.78, 0.97, 1.2],
    resultat: [-0.12, -0.1, -0.08, -0.06, -0.05],
    egetKapital: [0.8, 0.75, 0.7, 0.66, 0.6],
    fcf: [-0.05, -0.04, -0.03, -0.02, -0.01],
  },
  notering: "Syntetisk demo-fixtur för pedagogisk visning — ingen verklig kursdata.",
};

/**
 * Demons vågdynamik — syntetiskt lager 3-svar i kärnans kontrakt (typer.ts).
 * Justeringar ±1 (intervalltypens [−1,+1]; R1:s tabell ger idag ±0,2) så att
 * moduleringen syns i demon; etiketteras "demo" i motiveringarna.
 */
function demoDynamik(ticker: string, datum: string): NonNullable<RaknaAKM2Opts["dynamik"]> {
  const perHorisont: Record<Horisont, VagKlass> = {
    mikro: "basbygge",
    kort: "impulsvag",
    medellang: "impulsvag",
    lang: "impulsvag",
    mega: "osatt",
  };
  const svar: DynamikLagerSvar = {
    ticker,
    perVariabel: {
      V01: { variabel: "V01", riktning: "forbattras", justering: 1, port: "oppen", motivering: "Demo: stigande omsättningsserie i fixturen." },
      V07: { variabel: "V07", riktning: "forbattras", justering: 1, port: "oppen", motivering: "Demo: bruttomarginalen håller med marginal." },
      V09: { variabel: "V09", riktning: "forbattras", justering: 1, port: "oppen", motivering: "Demo: ROE-serien stiger i fixturen." },
      V05: { variabel: "V05", riktning: "forsvamras", justering: -1, port: "oppen", motivering: "Demo: multipeln expanderar (riktighetsinverterad variabel)." },
    },
    perHorisont,
    tekniskPerHorisont: undefined,
    konfluens: {
      raknadeTeorier: 5,
      sammaRiktning: 4,
      port: "oppen",
      text: "4 av 5 teorier pekar uppåt (demo-svar)",
    },
    horisontVikter: { mikro: 0.05, kort: 0.2, medellang: 0.25, lang: 0.3, mega: 0.2 },
    datum,
  };
  return () => svar;
}

/** Kör demon genom DEN ÄKTA kärnan — ingen lokal poänglogik i visningen. */
function raknaDemo(k: BolagsNyckeltal, medDynamik: boolean): AKM2Resultat {
  const opts: RaknaAKM2Opts = {
    moduler: byggModulAktiveringar(k),
    viktprofil: "akm2-2026",
  };
  if (medDynamik) opts.dynamik = demoDynamik(k.ticker, k.hamtat);
  return raknaAKM2(k, opts);
}

export function Akm2DemoStrip() {
  const [fixtur, setFixtur] = useState<"ind" | "saas">("ind");
  const [medDynamik, setMedDynamik] = useState(true);

  const resultat = useMemo(
    () => raknaDemo(fixtur === "ind" ? DEMO_IND : DEMO_SAAS, fixtur === "ind" && medDynamik),
    [fixtur, medDynamik],
  );

  const knapp = (aktiv: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
      aktiv ? "border-gold/60 bg-gold/15 text-foreground" : "border-gold/20 text-muted-foreground hover:border-gold/40 hover:text-foreground"
    }`;

  return (
    <section className="mt-6 rounded-xl border border-gold/30 bg-card p-4 sm:p-5" aria-label="AKM2-demo med syntetiska fixturer">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-gold">
            🧭 AKM2 — nästa generation (förhandsvisning)
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Kärnans 20 variabler + branschmoduler (V21–V29) + vågdynamik bakom
            konfluensporten — allt räknat live av den äkta kärnan{" "}
            <span className="font-mono text-xs">raknaAKM2</span>, men på syntetiska
            fixturer (ingen verklig data).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={knapp(fixtur === "ind")} onClick={() => setFixtur("ind")}>
            Fixtur: moget industriföretag
          </button>
          <button type="button" className={knapp(fixtur === "saas")} onClick={() => setFixtur("saas")}>
            Fixtur: SaaS med hål i data
          </button>
          <button
            type="button"
            className={knapp(fixtur === "ind" && medDynamik)}
            onClick={() => setMedDynamik((x) => !x)}
            title="Dynamik injiceras bara på industrifixturen — SaaS-fixturen visar den neutrala degraderingen"
          >
            Vågdynamik: {fixtur === "ind" && medDynamik ? "på" : "av"}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <Akm2Dashboard
          resultat={resultat}
          prenumerationsEtikett="Demo — ej låst"
          notis="Demo med syntetisk fixtur (DEMO-IND/DEMO-SAAS)."
        />
      </div>

      <p className="mt-3 border-t border-gold/15 pt-2 text-[11px] leading-relaxed text-muted-foreground">
        Det fullständiga AKM2-läget aktiveras i kalkylatorn nedan. Fullföljda
        AKM2-analyser publiceras i{" "}
        <Link href="/forskningsbiblioteket" className="underline hover:text-foreground">
          Forskningsbiblioteket
        </Link>{" "}
        och ingår i{" "}
        <Link href="/prenumeration" className="underline hover:text-foreground">
          Portföljforskning-nivåerna
        </Link>
        . Pedagogisk forskning — aldrig investeringsråd (lagen 2007:528).
      </p>
    </section>
  );
}
