"use client";

import { useMemo, useState } from "react";
import type { Horisont, RiskNiva, RiskProfil, TillvaxtTakt } from "@/lib/portfolj-forskning/typer";
import { HZ_VISNING, RISKNIVA_TEXT, TAKT_TEXT, talText } from "./vag-stil";

// ═══════════════════════════════════════════════════════════
// RISKVAL — steg 1: risknivå (konservativ/balanserad/tillväxt),
// steg 2: tillväxttakt (lugn/stadig/aggressiv). Valet bygger en
// hel RiskProfil enligt typkontraktet: horisontvikter (mikro
// förblir minst viktig enligt kunddirektivet), spridningsregler
// och minimikrav för poolen. "Forska fram portfölj" låses tills
// båda stegen är valda. Forskningsregler — aldrig råd.
// ═══════════════════════════════════════════════════════════

// ── Grundvikter per risknivå (summerar till 1) ──────────────────────────────

type NivaBas = {
  vikter: Record<Horisont, number>;
  maxPerAktie: number;
  maxPerBransch: number;
  minAKM1: number;
  minGolvMarginal: number | null;
  exVikter: string;
};

const NIVA_BAS: Record<RiskNiva, NivaBas> = {
  konservativ: {
    vikter: { mikro: 0.05, kort: 0.1, medellang: 0.15, lang: 0.4, mega: 0.3 },
    maxPerAktie: 0.12,
    maxPerBransch: 0.3,
    minAKM1: 75,
    minGolvMarginal: 0.15,
    exVikter: "Exempel: Lång 40 % · Mega 30 % · Medellång 15 % · Kort 10 % · Mikro 5 %",
  },
  balanserad: {
    vikter: { mikro: 0.05, kort: 0.2, medellang: 0.25, lang: 0.3, mega: 0.2 },
    maxPerAktie: 0.2,
    maxPerBransch: 0.4,
    minAKM1: 65,
    minGolvMarginal: 0,
    exVikter: "Exempel: Lång 30 % · Medellång 25 % · Kort 20 % · Mega 20 % · Mikro 5 %",
  },
  tillvaxt: {
    vikter: { mikro: 0.05, kort: 0.25, medellang: 0.3, lang: 0.3, mega: 0.1 },
    maxPerAktie: 0.25,
    maxPerBransch: 0.5,
    minAKM1: 55,
    minGolvMarginal: null,
    exVikter: "Exempel: Medellång 30 % · Lång 30 % · Kort 25 % · Mega 10 % · Mikro 5 %",
  },
};

/** Takten lutar viktarna: lugn → mot Lång/Mega, aggressiv → mot Kort/Medellång. */
const TAKT_LUTNING: Record<TillvaxtTakt, Partial<Record<Horisont, number>>> = {
  lugn: { kort: -0.05, medellang: -0.05, lang: 0.05, mega: 0.05 },
  stadig: {},
  aggressiv: { kort: 0.05, medellang: 0.05, lang: -0.05, mega: -0.05 },
};

/** Bygg en fullständig RiskProfil ur nivå + takt (exporteras för fas 2-integratören). */
export function byggRiskProfil(niva: RiskNiva, takt: TillvaxtTakt): RiskProfil {
  const bas = NIVA_BAS[niva];
  const lutning = taktLutningSakerad(takt);
  const vikter = { ...bas.vikter } as Record<Horisont, number>;
  for (const nyckel of Object.keys(lutning) as Horisont[]) {
    if (nyckel === "mikro") continue; // mikro förblir minst viktig — kunddirektiv
    vikter[nyckel] = Math.max(0.05, (vikter[nyckel] ?? 0) + (lutning[nyckel] ?? 0));
  }
  return {
    niva,
    takt,
    horisontVikter: vikter,
    maxPerAktie: bas.maxPerAktie,
    maxPerBransch: bas.maxPerBransch,
    minAKM1: bas.minAKM1,
    minGolvMarginal: bas.minGolvMarginal,
  };
}

/** Försiktig läsning av lutnings-tabellen (runtime-skydd mot felaktig data). */
function taktLutningSakerad(takt: TillvaxtTakt): Partial<Record<Horisont, number>> {
  return TAKT_LUTNING[takt] ?? {};
}

// ── Kortdata ────────────────────────────────────────────────────────────────

const NIVA_KORT: Array<{
  id: RiskNiva;
  ikon: string;
  beskrivning: string;
}> = [
  {
    id: "konservativ",
    ikon: "🛡",
    beskrivning: "Kapitalet först — golv, stabilitet och moat krävs innan någon våg får tala.",
  },
  {
    id: "balanserad",
    ikon: "⚖",
    beskrivning: "Jämvikt mellan värdegolv och tillväxtvågor — grundprofilen i Mega-projektet.",
  },
  {
    id: "tillvaxt",
    ikon: "🌱",
    beskrivning: "Tillväxten får leda — tål svängningar och accepterar högre värdering.",
  },
];

const TAKT_VAL: Array<{
  id: TillvaxtTakt;
  ikon: string;
  beskrivning: string;
}> = [
  {
    id: "lugn",
    ikon: "🐢",
    beskrivning: "Långa vågor styr — omläggning sällan; viktarna glider mot Lång och Mega.",
  },
  {
    id: "stadig",
    ikon: "🚶",
    beskrivning: "Stadig takt — kvartalsvis avläsning; viktarna följer grundprofilen rakt.",
  },
  {
    id: "aggressiv",
    ikon: "🦅",
    beskrivning: "Snabb takt — korta vågor följs tätare; viktarna glider mot Kort och Medellång.",
  },
];

// ── Komponenten ─────────────────────────────────────────────────────────────

export function RiskvalPanel({
  vald,
  onVald,
  profilByggare,
}: {
  vald?: RiskProfil;
  onVald: (profil: RiskProfil) => void;
  /**
   * Valfri profilbyggare — P7-integratören skickar riskportfolj.ts hamtaRiskProfil
   * (ren modul, klient-säker) så sammanfattningen EXAKT speglar motorns RISKNIVAER.
   * Utan denna används panelens egna illustrativa grundvikter (demo-läge).
   */
  profilByggare?: (niva: RiskNiva, takt: TillvaxtTakt) => RiskProfil;
}) {
  const [niva, setNiva] = useState<RiskNiva | null>(vald?.niva ?? null);
  const [takt, setTakt] = useState<TillvaxtTakt | null>(vald?.takt ?? null);

  // Synkronisera om en ny profil skickas in uppströms (t.ex. återbesök med
  // sparad profil) — Reacts mönster "justera state under render", inte i effekt.
  const [senasteVald, setSenasteVald] = useState<RiskProfil | undefined>(vald);
  if (vald !== senasteVald) {
    setSenasteVald(vald);
    setNiva(vald?.niva ?? null);
    setTakt(vald?.takt ?? null);
  }

  const profil = useMemo(
    () => (niva && takt ? (profilByggare ?? byggRiskProfil)(niva, takt) : null),
    [niva, takt, profilByggare],
  );
  const klart = profil !== null;

  return (
    <section className="marin-panel overflow-hidden rounded-2xl border border-gold/40">
      <header className="border-b border-gold/30 px-4 py-3 sm:px-6 sm:py-4">
        <h3 className="font-serif text-sm font-bold uppercase tracking-[0.18em] text-[#E8C766] sm:text-base">
          RISKVALET
          <span className="ml-2 font-normal normal-case italic tracking-normal text-[#EDE6D6]/85">
            — två steg innan portföljen forskas fram
          </span>
        </h3>
      </header>
      <div className="hjarlinje" aria-hidden />

      <div className="bg-card p-4 sm:p-6">
        {/* ── Steg 1: Risknivå ── */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">Steg 1 — Risknivå</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {NIVA_KORT.map((k) => {
              const arVald = niva === k.id;
              const bas = NIVA_BAS[k.id];
              return (
                <button
                  key={k.id}
                  type="button"
                  aria-pressed={arVald}
                  onClick={() => setNiva(k.id)}
                  className={`min-h-[44px] rounded-xl border p-3 text-left transition-colors ${
                    arVald
                      ? "border-gold bg-gold/10"
                      : "border-border bg-paper hover:border-gold/50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xl leading-none" aria-hidden>
                      {k.ikon}
                    </span>
                    <span className="font-serif text-sm font-bold">
                      {RISKNIVA_TEXT[k.id]}
                      {arVald && <span className="ml-1.5 text-gold" aria-hidden>✓</span>}
                    </span>
                  </span>
                  <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">
                    {k.beskrivning}
                  </span>
                  <span className="mt-1.5 block font-mono text-[10px] text-muted-foreground">
                    {bas.exVikter}
                  </span>
                  <span className="mt-1 block text-[10px] text-muted-foreground">
                    Min AKM1 {bas.minAKM1} ·{" "}
                    {bas.minGolvMarginal !== null
                      ? `golvkrav ${talText(bas.minGolvMarginal * 100, 0)} %`
                      : "inget golvkrav"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Steg 2: Tillväxttakt ── */}
        <div className="mt-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">Steg 2 — Tillväxttakt</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {TAKT_VAL.map((t) => {
              const arVald = takt === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={arVald}
                  onClick={() => setTakt(t.id)}
                  className={`min-h-[44px] rounded-xl border p-3 text-left transition-colors ${
                    arVald
                      ? "border-gold bg-gold/10"
                      : "border-border bg-paper hover:border-gold/50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xl leading-none" aria-hidden>
                      {t.ikon}
                    </span>
                    <span className="font-serif text-sm font-bold">
                      {TAKT_TEXT[t.id]}
                      {arVald && <span className="ml-1.5 text-gold" aria-hidden>✓</span>}
                    </span>
                  </span>
                  <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">
                    {t.beskrivning}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Sammanfattning av vald profil ── */}
        {profil && (
          <div className="mt-5 rounded-xl border border-gold/30 bg-paper p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
              Vald profil: {RISKNIVA_TEXT[profil.niva]} · {TAKT_TEXT[profil.takt]}
            </p>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {HZ_VISNING.map((h) => {
                const v = profil.horisontVikter?.[h.id] ?? 0;
                return (
                  <div key={h.id} title={`${h.namn} (${h.hjalp}): ${talText(v * 100, 0)} % av viktningen`}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {h.namn}
                    </p>
                    <p className="tabular font-mono text-xs font-bold text-gold">{talText(v * 100, 0)} %</p>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gold/15">
                      <div className="h-full rounded-full bg-gold" style={{ width: `${Math.min(100, v * 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-muted-foreground sm:grid-cols-4">
              <span>
                Max/aktie: <strong className="text-foreground">{talText(profil.maxPerAktie * 100, 0)} %</strong>
              </span>
              <span>
                Max/bransch: <strong className="text-foreground">{talText(profil.maxPerBransch * 100, 0)} %</strong>
              </span>
              <span>
                Min AKM1: <strong className="text-foreground">{profil.minAKM1}</strong>
              </span>
              <span>
                Min golv:{" "}
                <strong className="text-foreground">
                  {profil.minGolvMarginal !== null ? `${talText(profil.minGolvMarginal * 100, 0)} %` : "inget krav"}
                </strong>
              </span>
            </div>
          </div>
        )}

        {/* ── Forska-knapp ── */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!klart}
            onClick={() => {
              if (profil) onVald(profil);
            }}
            className="btn-marin min-h-[44px] px-5 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            Forska fram portfölj →
          </button>
          <p className="text-[11px] italic text-muted-foreground">
            {!niva && !takt
              ? "Välj risknivå och tillväxttakt först — knappen vaknar när båda stegen är klara."
              : !niva
                ? "Steg 1 saknas: välj risknivå."
                : !takt
                  ? "Steg 2 saknas: välj tillväxttakt."
                  : "Klart — portföljen byggs enligt forskningsreglerna ovan."}
          </p>
        </div>

        {/* Disclaimer */}
        <p className="mt-4 text-[11px] italic leading-relaxed text-muted-foreground">
          Valet styr forskningsreglerna — horisontviktning, spridning och minimikrav i poolen.
          Mikro förblir minst viktigt enligt kunddirektivet. Pedagogiskt verktyg — inte
          investeringsrådgivning.
        </p>
      </div>
    </section>
  );
}
