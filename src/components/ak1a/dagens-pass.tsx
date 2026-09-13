"use client";

import { useEffect, useState } from "react";
import { addXP, lasStreak, type Streak } from "@/lib/member-local";
import { BADGE_MAP, geBadge } from "@/lib/badges";
import { srStatistik, type SRStatistik } from "@/lib/spaced-repetition";
import { useSprak } from "@/components/ak1a/sprak-leverantor";
import { oversatt, type SprakId } from "@/lib/sprak";
import type { OrdlistaNyckel } from "@/lib/ordlista";

/**
 * DAGENS PASS — den dagliga 5-minutersritualen på RIKTIG marknadsdata.
 *
 * 4 steg: (1) Veckans aktie — gissa vågklass, jämför motorn. (2) Dagens fråga —
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

// VÅG 113 — trespråkighet: etiketter/notar bor i ordlistan (pass.klass*),
// id + ikon är språkneutralt. Typad lookup tvingar fram giltiga nycklar.
const KLASSER: Array<{ id: VagKlass; ikon: string }> = [
  { id: "impulsvåg", ikon: "▲" },
  { id: "korrigering", ikon: "▼" },
  { id: "basbygge", ikon: "◼" },
];

const KLASS_TEXT: Record<VagKlass, { etikett: OrdlistaNyckel; not: OrdlistaNyckel }> = {
  impulsvåg: { etikett: "pass.klassImpulsEtikett", not: "pass.klassImpulsNot" },
  korrigering: { etikett: "pass.klassKorrigeringEtikett", not: "pass.klassKorrigeringNot" },
  basbygge: { etikett: "pass.klassBasEtikett", not: "pass.klassBasNot" },
};

// VÅG 113 — horisontetiketterna hämtas ur ordlistan (pass.h*) per språk.
const HORIZONTER: Array<{ key: string; etikett: OrdlistaNyckel }> = [
  { key: "mikro", etikett: "pass.hMikro" },
  { key: "kort", etikett: "pass.hKort" },
  { key: "medellang", etikett: "pass.hMedellang" },
  { key: "lang", etikett: "pass.hLang" },
  { key: "mega", etikett: "pass.hMega" },
];

// VÅG 113 — månadsnamnen bor i ordlistan (pass.manad1–12), typat via array.
const MANAD_NYCKLAR: OrdlistaNyckel[] = [
  "pass.manad1", "pass.manad2", "pass.manad3", "pass.manad4", "pass.manad5", "pass.manad6",
  "pass.manad7", "pass.manad8", "pass.manad9", "pass.manad10", "pass.manad11", "pass.manad12",
];

/** Månadsnamn (0-indexat) på aktuellt språk. */
function manadNamn(sprak: SprakId, index: number): string {
  return oversatt(MANAD_NYCKLAR[index], sprak);
}

/** Deterministisk datumtext per språk (inga tidszons-race mellan server och klient).
 *  EXAKT samma datumlogik som originalet: y/m/d-split, ingen Date-konstruktion. */
function dagText(datum: string, sprak: SprakId): string {
  const [y, m, d] = datum.split("-").map(Number);
  if (!y || !m || !d) return datum;
  return `${d} ${manadNamn(sprak, m - 1)} ${y}`;
}

/** Talformat per språk (VÅG 113, mönster från fortsatt-panel) — sv-SE = originalet. */
function talLocale(sprak: SprakId): string {
  if (sprak === "en") return "en-GB";
  if (sprak === "ar") return "ar-EG";
  return "sv-SE";
}

function tal(n: number | null | undefined, decimaler = 2, locale = "sv-SE"): string {
  if (n == null || Number.isNaN(n)) return "–";
  return n.toLocaleString(locale, { minimumFractionDigits: decimaler, maximumFractionDigits: decimaler });
}

function procent(n: number | null | undefined, decimaler = 1, locale = "sv-SE"): string {
  if (n == null || Number.isNaN(n)) return "–";
  return `${(n * 100).toLocaleString(locale, { minimumFractionDigits: decimaler, maximumFractionDigits: decimaler })} %`;
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
  // VÅG 113 — trespråkighet: alla statiska UI-strängar via t() (pass.*-nycklarna).
  const { t, sprak } = useSprak();
  const locale = talLocale(sprak);
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
        // VÅG 113: endast teknikfelmeddelandet (e.message) sparas i state —
        // den läsbara fallback-texten översätts vid RENDER via t() så att den
        // alltid följer aktuellt språk (pass.okantFel/pass.motorUpptagen).
        if (aktiv) setFel(e.message || "");
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
        {t("pass.heroEtikett")}
      </p>
      <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">{t("nav.dagensPassMeny")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {pass ? dagText(pass.datum, sprak) : laddar ? "…" : "—"}
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
            {t("pass.hamtarLive")}
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
          <p className="font-serif text-lg font-bold text-bear">{t("pass.kundeInteLadda")}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {t("pass.motorUpptagen", { fel: fel || t("pass.okantFel") })}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg border border-gold/50 bg-gold/10 px-4 py-2 text-xs font-bold text-gold hover:bg-gold/20"
          >
            {t("pass.forsokIgen")}
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
          {t("pass.xpFortjanade", { xp: xpKick })}
        </div>
      )}

      {/* 1 · VECKANS AKTIE */}
      <Sektion nr={1} titel={t("pass.veckansAktie")} undertext={t("pass.veckansAktieUnder")}>
        <div className="rounded-xl border border-gold/20 bg-paper/60 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              {/* API-texter (pass.namn, ticker, bors, valuta) kommer från
                  /api/dagens-pass och förblir svenska denna våg — motor-
                  pipelinen översätts i en senare våg, samma princip som
                  UI:t före språkleverantören. */}
              <p className="font-serif text-2xl font-bold leading-tight">{pass.namn}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {pass.ticker}
                {pass.bors ? ` · ${pass.bors}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="font-serif text-2xl font-bold text-gold">
                {tal(d?.pris, 2, locale)} {pass.valuta || "SEK"}
              </p>
              {pass.senaste && (
                <p className="text-[10px] text-muted-foreground">
                  {t("pass.senasteYahoo", { pris: tal(pass.senaste.pris, 2, locale) })}
                </p>
              )}
            </div>
          </div>

          {/* 52-veckors spannet */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{t("pass.52vLag", { pris: tal(d?.lag52, 2, locale) })}</span>
              <span className="font-bold text-foreground">{t("pass.52vPosition", { procent: pos52Procent })}</span>
              <span>{t("pass.52vHog", { pris: tal(d?.hojd52, 2, locale) })}</span>
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
                {t("pass.dinGissning")}
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {KLASSER.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => gissa(k.id)}
                    className="rounded-lg border border-border bg-card px-3 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 hover:border-gold/60 hover:bg-gold/5"
                  >
                    <span className="mr-1.5 text-base">{k.ikon}</span> {t(KLASS_TEXT[k.id].etikett)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              <div className="rounded-lg border border-gold/40 bg-gold/5 p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gold">{t("pass.motornsSvar")}</p>
                <p className="mt-1 font-serif text-xl font-bold">
                  {kortVag
                    ? `${KLASSER.find((k) => k.id === kortVag)?.ikon} ${t(KLASS_TEXT[kortVag].etikett)}`
                    : t("pass.osattData")}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {kortVag ? t(KLASS_TEXT[kortVag].not) : t("pass.motorKundeInte")}
                </p>
                {gissning && kortVag && (
                  <p className={`mt-2 rounded border px-2.5 py-1.5 text-xs leading-snug ${gissning === kortVag ? "border-bull/40 bg-bull/10 text-bull" : "border-gold/40 bg-paper text-foreground"}`}>
                    {gissning === kortVag
                      ? t("pass.matchar")
                      : // lowercase-matchar originalmallen; no-op på arabiska (ofarligt).
                        t("pass.matcharInte", {
                          gissning: t(KLASS_TEXT[gissning].etikett).toLowerCase(),
                          svar: t(KLASS_TEXT[kortVag].etikett).toLowerCase(),
                        })}
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
                        <div className="text-[9px] font-bold uppercase tracking-wider opacity-80">{t(h.etikett)}</div>
                        <div className="text-[11px] font-bold capitalize">{v || t("pass.osatt")}</div>
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
                    {t("pass.matris25", { bull: samman.bull, neutrala: samman.neutral, bear: samman.bear })}
                    {pass.kallor ? t("pass.kallor", { kallor: pass.kallor }) : ""}
                  </p>
                </div>
              )}
              {f && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="rounded border border-border bg-card p-2 text-center">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">P/E</div>
                    <div className="text-sm font-bold">{tal(f.pe, 2, locale)}</div>
                  </div>
                  <div className="rounded border border-border bg-card p-2 text-center">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{t("pass.utdelning")}</div>
                    <div className="text-sm font-bold">{procent(f.utdelning, 1, locale)}</div>
                  </div>
                  <div className="rounded border border-border bg-card p-2 text-center">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">ROE</div>
                    <div className="text-sm font-bold">{procent(f.roe, 1, locale)}</div>
                  </div>
                  <div className="rounded border border-border bg-card p-2 text-center">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{t("pass.vinstmarginal")}</div>
                    <div className="text-sm font-bold">{procent(f.vinstmarginal, 1, locale)}</div>
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
                {t("pass.gissaIgen")}
              </button>
            </div>
          )}
        </div>
      </Sektion>

      {/* 2 · DAGENS FRÅGA */}
      <Sektion nr={2} titel={t("pass.dagensFraga")} undertext={t("pass.dagensFragaUnder")}>
        {/* Vågklass-frågan — fraga/alternativ är API-texter (svenska denna våg). */}
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
              {t("pass.inteRiktigt")}
            </p>
          )}
          {vagKlar && (
            <p className="mt-2 text-[11px] font-bold text-bull">
              {t("pass.rattVag", { svar: pass.dagensFraga.alternativ[pass.dagensFraga.rattIndex] })}
            </p>
          )}
        </div>

        {/* AKM1-frågan — fraga/alternativ/tips är API-texter (svenska denna våg). */}
        <div className="mt-4 rounded-xl border border-gold/20 bg-paper/60 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gold">{t("pass.akm1Etikett")}</p>
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
              {t("pass.coachning", { tips: pass.akm1Fraga.tips })}
            </p>
          )}
          {akm1Klar && (
            <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
              <span className="font-bold text-bull">{t("pass.ratt")}</span> {pass.akm1Fraga.tips}
            </p>
          )}
        </div>
      </Sektion>

      {/* 3 · REPETERA */}
      <Sektion nr={3} titel={t("pass.repetera")} undertext={t("pass.repeteraUnder")}>
        <div className="rounded-xl border border-gold/20 bg-paper/60 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("pass.repStatistik")}</p>
          {hydrerad && sr ? (
            <>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded border border-border bg-card p-2.5 text-center">
                  <div className="font-serif text-2xl font-bold text-gold">{sr.forfallna}</div>
                  <div className="text-[10px] text-muted-foreground">{t("pass.forfallnaIdag")}</div>
                </div>
                <div className="rounded border border-border bg-card p-2.5 text-center">
                  <div className="font-serif text-2xl font-bold">{sr.beharskade}</div>
                  <div className="text-[10px] text-muted-foreground">{t("pass.langtMinne")}</div>
                </div>
                <div className="rounded border border-border bg-card p-2.5 text-center">
                  <div className="font-serif text-2xl font-bold">{sr.sedda}</div>
                  <div className="text-[10px] text-muted-foreground">{t("pass.avSedda", { totalt: sr.totalt })}</div>
                </div>
                <div className="rounded border border-border bg-card p-2.5 text-center">
                  <div className="font-serif text-2xl font-bold">{sr.repetitionerTotalt}</div>
                  <div className="text-[10px] text-muted-foreground">{t("pass.repetitionerTotalt")}</div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {/* nastaNasta är en svensk datumsträng från repetitions-libben (API-nivå,
                    svenska denna våg); "snart"-fallback saknar ordlistenyckel. */}
                {sr.forfallna > 0
                  ? t("pass.kortVantar", { antal: sr.forfallna })
                  : t("pass.ingaForfallna", { nar: sr.nastaNasta || "snart" })}
              </p>
              {/* DNA: primär knapp i marin med guldtext */}
              <button
                onClick={oppnaMentorn}
                className="btn-marin mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs"
              >
                {t("pass.fortsattMentorn")} <span aria-hidden>→</span>
              </button>
              <p className="mt-1.5 text-[10px] text-muted-foreground">
                {t("pass.mentorPlats")}
              </p>
            </>
          ) : (
            <div className="mt-3 h-16 animate-pulse rounded bg-muted" />
          )}
        </div>
      </Sektion>

      {/* 4 · STREAK */}
      <Sektion nr={4} titel={t("pass.streak")} undertext={t("pass.streakUnder")}>
        <div className="rounded-xl border border-gold/20 bg-paper/60 p-6 text-center">
          {hydrerad ? (
            <>
              <div className="text-6xl leading-none" aria-hidden>🔥</div>
              {/* DNA: streak-chip — guldsiffror på marin */}
              <div className="marin-panel mx-auto mt-3 w-fit rounded-full px-6 py-1">
                <p className="font-serif text-5xl font-bold text-gold">{streak.antal}</p>
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{t("pass.dagarIRad")}</p>
              <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-muted-foreground">
                {t("pass.streakText", { basta: streak.basta })}{" "}
                <span className="mt-1 block font-bold text-foreground">{t("pass.komImorgon")}</span>
              </p>
            </>
          ) : (
            <div className="mx-auto h-20 w-40 animate-pulse rounded bg-muted" />
          )}
        </div>
      </Sektion>

      {/* Fotnot — pass.notering är API-text (svensk denna våg), fallback översätts. */}
      <p className="pb-2 text-center text-[10px] leading-relaxed text-muted-foreground">
        {t("pass.fotnot", { notering: pass.notering || t("pass.standardNotering") })}
      </p>
    </div>
  );
}
