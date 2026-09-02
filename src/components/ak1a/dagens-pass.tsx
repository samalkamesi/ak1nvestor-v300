"use client";

import { useEffect, useState } from "react";
import { addXP, lasStreak, type Streak } from "@/lib/member-local";
import { BADGE_MAP, geBadge } from "@/lib/badges";
import { srStatistik, type SRStatistik } from "@/lib/spaced-repetition";

/**
 * DAGENS PASS — den dagliga 5-minutersritualen på RIKTIG marknadsdata.
 *
 * 4 steg: (1) Veckans aktie — gissa vågklass, jämör motorn. (2) Dagens fråga —
 * våg-quiz + AKM1-fråga med XP. (3) Repetera — SR-statistik + AI-Mentorn.
 * (4) Streak — 🔥 och en uppmaning att komma tillbaka imorgon.
 *
 * All data hämtas från /api/dagens-pass (python-motor på live-data).
 * Premium-känsla: serif-rubrik, guldränder, paper-DNA.
 */

// ── Typer (spegla API-svaret) ────────────────────────────────────────────────

type Fundament = {
  pe?: number | null;
  peFwd?: number | null;
  pb?: number | null;
  utdelning?: number | null;
  vinstmarginal?: number | null;
  roe?: number | null;
  tillvaxt?: number | null;
  skuldEk?: number | null;
} | null;

type PassData = {
  datum: string;
  ticker: string;
  namn: string;
  bors?: string | null;
  valuta?: string | null;
  data?: { pris: number; hojd52: number; lag52: number; pos52: number; sigma_ar?: number | null; atr14?: number | null; voltrend?: number | null; ma50?: number | null; ma200?: number | null } | null;
  vager?: Record<string, string> | null;
  matris25?: Record<string, number> | null;
  sammanfattning?: { bull: number; bear: number; neutral: number } | null;
  fundament?: Fundament;
  senaste?: { pris: number; tidpunkt: string } | null;
  kallor?: number | null;
  dagensFraga: { fraga: string; alternativ: string[]; rattIndex: number };
  akm1Fraga: { fraga: string; alternativ: string[]; ratt: number; tips: string };
  notering?: string;
};

type VagKlass = "impulsvåg" | "korrigering" | "basbygge";

const KLASSER: Array<{ id: VagKlass; ikon: string; etikett: string; not: string }> = [
  {
    id: "impulsvåg",
    ikon: "▲",
    etikett: "Impulsvåg",
    not: "Motorn ser momentum över +6% på horisonten och pris ovanför glidande medelvärde — köparna är i kontroll.",
  },
  {
    id: "korrigering",
    ikon: "▼",
    etikett: "Korrigering",
    not: "Motorn ser momentum under −6% och pris under medelvärdet — en motvåg där säljarna trycker tillbaka.",
  },
  {
    id: "basbygge",
    ikon: "◼",
    etikett: "Basbygge",
    not: "Motorn ser momentum inom ±6% — en sidledes bas där köpare och säljare är i balans.",
  },
];

const HORIZONTER: Array<{ key: string; etikett: string }> = [
  { key: "mikro", etikett: "Mikro" },
  { key: "kort", etikett: "Kort" },
  { key: "medellang", etikett: "Medellång" },
  { key: "lang", etikett: "Lång" },
  { key: "mega", etikett: "Mega" },
];

const MANADER = [
  "januari", "februari", "mars", "april", "maj", "juni",
  "juli", "augusti", "september", "oktober", "november", "december",
];

/** Deterministisk svensk datumtext (inga tidszons-race mellan server och klient). */
function dagText(datum: string): string {
  const [y, m, d] = datum.split("-").map(Number);
  if (!y || !m || !d) return datum;
  return `${d} ${MANADER[m - 1]} ${y}`;
}

function tal(n: number | null | undefined, decimaler = 2): string {
  if (n == null || Number.isNaN(n)) return "–";
  return n.toLocaleString("sv-SE", { minimumFractionDigits: decimaler, maximumFractionDigits: decimaler });
}

function procent(n: number | null | undefined, decimaler = 1): string {
  if (n == null || Number.isNaN(n)) return "–";
  return `${(n * 100).toLocaleString("sv-SE", { minimumFractionDigits: decimaler, maximumFractionDigits: decimaler })} %`;
}

/** Lås-nyckel enligt quiz-konventionen (räknas även i badge-statistiken). */
function lasLock(nyckel: string): boolean {
  try {
    return localStorage.getItem(nyckel) === "1";
  } catch {
    return false;
  }
}

function skrivLock(nyckel: string) {
  try {
    localStorage.setItem(nyckel, "1");
  } catch {
    /* privat läge — ignoreras */
  }
}

/** Öppnar den globala chat-widgeten (AI-Mentorn) om den finns på sidan. */
function oppnaMentorn() {
  try {
    const knapp = document.querySelector<HTMLButtonElement>('button[aria-label="AI-Mentor"]');
    if (knapp) knapp.click();
  } catch {
    /* ignoreras */
  }
}

// ── Ritual-sektion (nummerad guldrand) ───────────────────────────────────────

function Sektion({ nr, titel, undertext, children }: { nr: number; titel: string; undertext?: string; children: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-gold/25 bg-card p-5 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-gold/0 via-gold/60 to-gold/0" />
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-gold/10 font-serif text-sm font-bold text-gold">
          {nr}
        </span>
        <div>
          <h2 className="font-serif text-xl font-bold leading-tight">{titel}</h2>
          {undertext && <p className="text-xs text-muted-foreground">{undertext}</p>}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

// ── Huvudkomponent ───────────────────────────────────────────────────────────

export function DagensPass() {
  const [laddar, setLaddar] = useState(true);
  const [fel, setFel] = useState<string | null>(null);
  const [pass, setPass] = useState<PassData | null>(null);
  const [hydrerad, setHydrerad] = useState(false);
  const [streak, setStreak] = useState<Streak>({ antal: 0, basta: 0, senast: "" });
  const [sr, setSr] = useState<SRStatistik | null>(null);

  // Steg 1 — elevens våg-gissning (eget lokalt state, VagSkattning-mönstret)
  const [gissning, setGissning] = useState<VagKlass | null>(null);
  const [avslujad, setAvslujad] = useState(false);

  // Steg 2 — quiz-svar (+ XP-kick för konfetti-känslan)
  const [vagVal, setVagVal] = useState<number | null>(null);
  const [vagKlar, setVagKlar] = useState(false);
  const [akm1Val, setAkm1Val] = useState<number | null>(null);
  const [akm1Klar, setAkm1Klar] = useState(false);
  const [xpKick, setXpKick] = useState(0);

  useEffect(() => {
    let aktiv = true;
    fetch("/api/dagens-pass")
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
        return j as PassData;
      })
      .then((j) => {
        if (aktiv) setPass(j);
      })
      .catch((e: Error) => {
        if (aktiv) setFel(e.message || "Kunde inte hämta dagens pass.");
      })
      .finally(() => {
        if (aktiv) setLaddar(false);
      });

    // SSR-säker hydrering av lokal statistik
    setStreak(lasStreak());
    setSr(srStatistik());
    setHydrerad(true);
    return () => {
      aktiv = false;
    };
  }, []);

  // ── Steg 1: gissa vågklass ──
  const gissa = (k: VagKlass) => {
    if (avslujad) return;
    setGissning(k);
    setAvslujad(true);
  };

  // ── Steg 2: svara våg-frågan ──
  const svaraVag = (i: number) => {
    if (!pass || vagKlar) return;
    setVagVal(i);
    if (i === pass.dagensFraga.rattIndex) {
      setVagKlar(true);
      const nyckel = `ak1a-quiz-dagens-pass-${pass.datum}`;
      if (!lasLock(nyckel)) {
        skrivLock(nyckel);
        addXP(10);
        setXpKick((x) => x + 10);
      }
      if ("dagens-pass" in BADGE_MAP) geBadge("dagens-pass");
    }
  };

  // ── Steg 2: svara AKM1-frågan ──
  const svaraAkm1 = (i: number) => {
    if (!pass || akm1Klar) return;
    setAkm1Val(i);
    if (i === pass.akm1Fraga.ratt) {
      setAkm1Klar(true);
      const nyckel = `ak1a-quiz-dagens-pass-akm1-${pass.datum}`;
      if (!lasLock(nyckel)) {
        skrivLock(nyckel);
        addXP(10);
        setXpKick((x) => x + 10);
      }
      if ("dagens-pass" in BADGE_MAP) geBadge("dagens-pass");
    }
  };

  const kortVag: VagKlass | null = pass?.vager?.kort
    ? ((["impulsvåg", "korrigering", "basbygge"] as const).includes(pass.vager.kort as VagKlass)
        ? (pass.vager.kort as VagKlass)
        : null)
    : null;

  // ── Rendera ──────────────────────────────────────────────────────────────

  const hero = (
    <div className="relative overflow-hidden rounded-2xl border border-gold/40 bg-card p-6 text-center sm:p-8">
      {/* DNA: marin topp-rad som panel-aksent — guldbandet nedtill får sällskap */}
      <div className="marin-panel absolute inset-x-0 top-0 h-1" />
      <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-gold">
        Daglig ritual · 5 minuter · Riktig marknadsdata
      </p>
      <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">Dagens Pass</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {pass ? dagText(pass.datum) : laddar ? "…" : "—"}
      </p>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-gold/0 via-gold to-gold/0" />
    </div>
  );

  if (laddar && !pass) {
    return (
      <div className="space-y-6">
        {hero}
        <div className="animate-pulse space-y-4 rounded-2xl border border-gold/20 bg-card p-6">
          <div className="h-4 w-1/3 rounded bg-gold/20" />
          <div className="h-10 w-2/3 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
          <p className="pt-2 text-center text-xs text-muted-foreground">
            Analysmotorn hämtar live-data för dagens aktie…
          </p>
        </div>
      </div>
    );
  }

  if (fel || !pass) {
    return (
      <div className="space-y-6">
        {hero}
        <div className="rounded-2xl border border-bear/30 bg-bear/5 p-6 text-center">
          <p className="font-serif text-lg font-bold text-bear">Passet kunde inte laddas</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {fel || "Okänt fel."} Analysmotorn kan vara upptagen — ladda om sidan om en stund.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg border border-gold/50 bg-gold/10 px-4 py-2 text-xs font-bold text-gold hover:bg-gold/20"
          >
            Försök igen
          </button>
        </div>
      </div>
    );
  }

  const d = pass.data;
  const pos52Procent = d ? Math.max(0, Math.min(100, Math.round(d.pos52 * 100))) : 50;
  const f = pass.fundament;
  const samman = pass.sammanfattning;

  return (
    <div className="space-y-6">
      {hero}
      {xpKick > 0 && (
        <div className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-2 text-center text-xs font-bold text-gold">
          +{xpKick} XP förtjänade — bra jobbat!
        </div>
      )}

      {/* 1 · VECKANS AKTIE */}
      <Sektion nr={1} titel="Veckans aktie" undertext="Läs marknaden först — motorn avslöjar sitt svar efteråt">
        <div className="rounded-xl border border-gold/20 bg-paper/60 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="font-serif text-2xl font-bold leading-tight">{pass.namn}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {pass.ticker}
                {pass.bors ? ` · ${pass.bors}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="font-serif text-2xl font-bold text-gold">
                {tal(d?.pris)} {pass.valuta || "SEK"}
              </p>
              {pass.senaste && (
                <p className="text-[10px] text-muted-foreground">
                  Senaste (Yahoo): {tal(pass.senaste.pris)}
                </p>
              )}
            </div>
          </div>

          {/* 52-veckors spannet */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>52v-låg {tal(d?.lag52)}</span>
              <span className="font-bold text-foreground">52v-position: {pos52Procent}% av spannet</span>
              <span>52v-hög {tal(d?.hojd52)}</span>
            </div>
            <div className="relative mt-1 h-2.5 rounded-full bg-gradient-to-r from-bear/40 via-gold/40 to-bull/40">
              <div
                className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded bg-gold shadow"
                style={{ left: `calc(${pos52Procent}% - 2px)` }}
              />
            </div>
          </div>

          {/* Gissning */}
          {!avslujad ? (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Din gissning — vilken vågklass är aktien i just nu?
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {KLASSER.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => gissa(k.id)}
                    className="rounded-lg border border-border bg-card px-3 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 hover:border-gold/60 hover:bg-gold/5"
                  >
                    <span className="mr-1.5 text-base">{k.ikon}</span> {k.etikett}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              <div className="rounded-lg border border-gold/40 bg-gold/5 p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gold">Motorns svar (KORT horisont)</p>
                <p className="mt-1 font-serif text-xl font-bold">
                  {kortVag
                    ? `${KLASSER.find((k) => k.id === kortVag)?.ikon} ${KLASSER.find((k) => k.id === kortVag)?.etikett}`
                    : "Osatt — insufficient data"}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {kortVag ? KLASSER.find((k) => k.id === kortVag)?.not : "Motorn kunde inte klassificera vågen säkert på kort horisont."}
                </p>
                {gissning && kortVag && (
                  <p className={`mt-2 rounded border px-2.5 py-1.5 text-xs leading-snug ${gissning === kortVag ? "border-bull/40 bg-bull/10 text-bull" : "border-gold/40 bg-paper text-foreground"}`}>
                    {gissning === kortVag
                      ? "✓ Din läsning matchar motorn — du läser momentum och trend rätt."
                      : `⚠ Du gissade ${KLASSER.find((k) => k.id === gissning)?.etikett.toLowerCase()}, motorn säger ${KLASSER.find((k) => k.id === kortVag)?.etikett.toLowerCase()}. Fråga dig: vilka data stödjer DIN läsning — och vad ser motorn som du missar?`}
                  </p>
                )}
              </div>

              {/* Vågprofil alla horisonter + 25-cellers-sammanfattning */}
              {pass.vager && (
                <div className="grid gap-2 sm:grid-cols-5">
                  {HORIZONTER.map((h) => {
                    const v = pass.vager?.[h.key];
                    const styl =
                      v === "impulsvåg"
                        ? "border-bull/40 bg-bull/10 text-bull"
                        : v === "korrigering"
                          ? "border-bear/40 bg-bear/10 text-bear"
                          : v === "basbygge"
                            ? "border-gold/40 bg-gold/10 text-gold"
                            : "border-border bg-muted text-muted-foreground";
                    return (
                      <div key={h.key} className={`rounded border px-2 py-1.5 text-center ${styl}`}>
                        <div className="text-[9px] font-bold uppercase tracking-wider opacity-80">{h.etikett}</div>
                        <div className="text-[11px] font-bold capitalize">{v || "osatt"}</div>
                      </div>
                    );
                  })}
                </div>
              )}
              {samman && (
                <div>
                  <div className="flex h-2 w-full overflow-hidden rounded-full">
                    <div className="bg-bull" style={{ width: `${(samman.bull / 25) * 100}%` }} title={`${samman.bull} bull-celler`} />
                    <div className="bg-neutral-signal/40" style={{ width: `${(samman.neutral / 25) * 100}%` }} title={`${samman.neutral} neutrala`} />
                    <div className="bg-bear" style={{ width: `${(samman.bear / 25) * 100}%` }} title={`${samman.bear} bear-celler`} />
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    25-cellers-matrisen: {samman.bull} bull · {samman.neutral} neutrala · {samman.bear} bear
                    {pass.kallor ? ` · ${pass.kallor} källor` : ""}
                  </p>
                </div>
              )}
              {f && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="rounded border border-border bg-card p-2 text-center">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">P/E</div>
                    <div className="text-sm font-bold">{tal(f.pe)}</div>
                  </div>
                  <div className="rounded border border-border bg-card p-2 text-center">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Utdelning</div>
                    <div className="text-sm font-bold">{procent(f.utdelning)}</div>
                  </div>
                  <div className="rounded border border-border bg-card p-2 text-center">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">ROE</div>
                    <div className="text-sm font-bold">{procent(f.roe)}</div>
                  </div>
                  <div className="rounded border border-border bg-card p-2 text-center">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Vinstmarginal</div>
                    <div className="text-sm font-bold">{procent(f.vinstmarginal)}</div>
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  setGissning(null);
                  setAvslujad(false);
                }}
                className="text-[11px] text-muted-foreground underline hover:text-foreground"
              >
                Gissa igen
              </button>
            </div>
          )}
        </div>
      </Sektion>

      {/* 2 · DAGENS FRÅGA */}
      <Sektion nr={2} titel="Dagens fråga" undertext="+10 XP per rätt svar (en gång per dag och fråga)">
        {/* Vågklass-frågan */}
        <div className="rounded-xl border border-gold/20 bg-paper/60 p-4">
          <p className="text-sm font-medium leading-snug">{pass.dagensFraga.fraga}</p>
          <div className="mt-3 space-y-1.5">
            {pass.dagensFraga.alternativ.map((alt, j) => {
              const vald = vagVal === j;
              const arRatt = j === pass.dagensFraga.rattIndex;
              // DNA: aktivt val = marin signaturknapp; rätt svar avslöjas i grönt
              const styl = vagKlar && arRatt
                ? "border-bull bg-bull/10 font-bold text-bull"
                : vald && !arRatt
                  ? "btn-marin"
                  : "border-gold/20 bg-card hover:border-gold/50";
              return (
                <button
                  key={j}
                  onClick={() => svaraVag(j)}
                  disabled={vagKlar}
                  className={`w-full rounded-md border px-3 py-2 text-left text-xs transition-colors ${styl} ${vagKlar ? "cursor-default" : "cursor-pointer"}`}
                >
                  {String.fromCharCode(65 + j)}) {alt}
                </button>
              );
            })}
          </div>
          {vagVal !== null && !vagKlar && (
            <p className="mt-2 rounded border border-gold/40 bg-gold/5 px-2.5 py-1.5 text-[11px] leading-snug text-muted-foreground">
              Inte riktigt — titta på vågprofilen i steg 1 igen: går marknaden trendmässigt upp, ned eller sidledes på kort
              horisont? Försök igen.
            </p>
          )}
          {vagKlar && (
            <p className="mt-2 text-[11px] font-bold text-bull">
              ✓ Rätt — motorns klassificering på KORT horisont är {pass.dagensFraga.alternativ[pass.dagensFraga.rattIndex]}.
            </p>
          )}
        </div>

        {/* AKM1-frågan */}
        <div className="mt-4 rounded-xl border border-gold/20 bg-paper/60 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gold">AKM1 · grundmur-variabeln</p>
          <p className="mt-1 text-sm font-medium leading-snug">{pass.akm1Fraga.fraga}</p>
          <div className="mt-3 space-y-1.5">
            {pass.akm1Fraga.alternativ.map((alt, j) => {
              const vald = akm1Val === j;
              const arRatt = j === pass.akm1Fraga.ratt;
              // DNA: aktivt val = marin signaturknapp; rätt svar avslöjas i grönt
              const styl = akm1Klar && arRatt
                ? "border-bull bg-bull/10 font-bold text-bull"
                : vald && !arRatt
                  ? "btn-marin"
                  : "border-gold/20 bg-card hover:border-gold/50";
              return (
                <button
                  key={j}
                  onClick={() => svaraAkm1(j)}
                  disabled={akm1Klar}
                  className={`w-full rounded-md border px-3 py-2 text-left text-xs transition-colors ${styl} ${akm1Klar ? "cursor-default" : "cursor-pointer"}`}
                >
                  {String.fromCharCode(65 + j)}) {alt}
                </button>
              );
            })}
          </div>
          {akm1Val !== null && !akm1Klar && (
            <p className="mt-2 rounded border border-gold/40 bg-gold/5 px-2.5 py-1.5 text-[11px] leading-snug text-muted-foreground">
              Coachning: {pass.akm1Fraga.tips} — följ spåret och försök igen.
            </p>
          )}
          {akm1Klar && (
            <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
              <span className="font-bold text-bull">✓ Rätt.</span> {pass.akm1Fraga.tips}
            </p>
          )}
        </div>
      </Sektion>

      {/* 3 · REPETERA */}
      <Sektion nr={3} titel="Repetera" undertext="Glömskekurvan bestämmer — korten bor i AI-Mentorn">
        <div className="rounded-xl border border-gold/20 bg-paper/60 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dagens repetitionsstatistik</p>
          {hydrerad && sr ? (
            <>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded border border-border bg-card p-2.5 text-center">
                  <div className="font-serif text-2xl font-bold text-gold">{sr.forfallna}</div>
                  <div className="text-[10px] text-muted-foreground">förfallna idag</div>
                </div>
                <div className="rounded border border-border bg-card p-2.5 text-center">
                  <div className="font-serif text-2xl font-bold">{sr.beharskade}</div>
                  <div className="text-[10px] text-muted-foreground">i långt minne</div>
                </div>
                <div className="rounded border border-border bg-card p-2.5 text-center">
                  <div className="font-serif text-2xl font-bold">{sr.sedda}</div>
                  <div className="text-[10px] text-muted-foreground">av {sr.totalt} sedda</div>
                </div>
                <div className="rounded border border-border bg-card p-2.5 text-center">
                  <div className="font-serif text-2xl font-bold">{sr.repetitionerTotalt}</div>
                  <div className="text-[10px] text-muted-foreground">repetitioner totalt</div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {sr.forfallna > 0
                  ? `${sr.forfallna} kort väntar på dig idag — varje "Bra"-svar förtjänar +5 XP.`
                  : "Inga kort förfallna idag — perfekt discipl. Nästa kort förfaller " + (sr.nastaNasta || "snart") + "."}
              </p>
              {/* DNA: primär knapp i marin med guldtext */}
              <button
                onClick={oppnaMentorn}
                className="btn-marin mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs"
              >
                Fortsätt i AI-Mentorn <span aria-hidden>→</span>
              </button>
              <p className="mt-1.5 text-[10px] text-muted-foreground">
                AI-Mentorn finns i chat-bubblan nere till höger — där bor flashcardsen.
              </p>
            </>
          ) : (
            <div className="mt-3 h-16 animate-pulse rounded bg-muted" />
          )}
        </div>
      </Sektion>

      {/* 4 · STREAK */}
      <Sektion nr={4} titel="Streak" undertext="Kunskap älskar närvaro">
        <div className="rounded-xl border border-gold/20 bg-paper/60 p-6 text-center">
          {hydrerad ? (
            <>
              <div className="text-6xl leading-none" aria-hidden>🔥</div>
              {/* DNA: streak-chip — guldsiffror på marin */}
              <div className="marin-panel mx-auto mt-3 w-fit rounded-full px-6 py-1">
                <p className="font-serif text-5xl font-bold text-gold">{streak.antal}</p>
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">dagar i rad</p>
              <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-muted-foreground">
                Bästa streak: {streak.basta} dagar. Gör dagens pass imorgon också — streaken lever så länge du gör.
                <span className="mt-1 block font-bold text-foreground">Kom tillbaka imorgon.</span>
              </p>
            </>
          ) : (
            <div className="mx-auto h-20 w-40 animate-pulse rounded bg-muted" />
          )}
        </div>
      </Sektion>

      <p className="pb-2 text-center text-[10px] leading-relaxed text-muted-foreground">
        Dagens Pass är pedagogisk träning på riktig marknadsdata — inte råd. Signaler:{" "}
        {pass.notering || "heuristiska proxy-mätare — pedagogiskt verktyg, inte investeringsråd."}
      </p>
    </div>
  );
}
