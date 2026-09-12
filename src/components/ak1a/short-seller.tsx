"use client";

/**
 * Agent 3: The Short-Seller — v2 (10x-uppgradering).
 *
 * Full 10x-kalkyl redovisas i filtoppen på src/lib/shortseller-bank.ts.
 * Kortversion här:
 *   FÖRR: 15 statiska frågor, 5 ämnen, ingen kontext, ingen progression.
 *   NU:   (1) Kontextuella attacker ur member-local + usePathname,
 *         (2) 30 frågor / 10 ämnen / svårighet 1–3 (shortseller-bank.ts),
 *         (3) 8 beräknings-attacker — rätt svar + förklaring FÖRST efter
 *             elevens val (enda undantaget från sokratiska regeln),
 *         (4) progression nivå 1–3 i localStorage "ak1a-shortseller-v1"
 *             (3 korrekta försvar → nästa nivå) + streak av hållna försvar,
 *         (5) sekventiellt tes-försvar: nyckelordsanalys → 1–5 attacker →
 *             slutbetyg med pedagogik.ts-ton (ALDRIG dömande),
 *         (6) AI-READY: /api/shortseller försöker Z.ai GLM först, med
 *             deterministisk lokal bank-fallback (offline fungerar alltid),
 *         (7) CHAT-INTEGRATION: useShortsellerKompakt() exporteras hit + vi
 *             lyssnar på window-event "ak1a:shortseller-attacka".
 *
 * P8: inga interna trösklar — nivån styr bara svårighetsurvalet; alla ämnen
 * och all innehåll är alltid öppna för eleven.
 */

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { uppmuntran, varforText } from "@/lib/pedagogik";
import { lasKlaraKurser, lasStreak, lasXP } from "@/lib/member-local";
import {
  AMNEN,
  KURS_TITLAR,
  forsvarsFragor,
  historisktFallFor,
  kontextuellInledning,
  valAttack,
  valBerakningsAttack,
  type AmneVal,
  type AttackFraga,
  type HistorisktFall,
  type Niva,
} from "@/lib/shortseller-bank";

// ── Progression (localStorage ak1a-shortseller-v1) ─────────────────────────

const PROGRESS_KEY = "ak1a-shortseller-v1";
const KORREKTA_FOR_NASTA_NIVA = 3;
const MIN_FORSVAR_TECKEN = 20;

type Progress = {
  niva: Niva; // 1–3
  korrekta: number; // korrekta försvar på aktuell nivå (3 → nästa nivå)
  streak: number; // hållna försvar i rad
  bastaStreak: number;
  totaltForsvar: number;
  totaltKorrekt: number;
  seddaId: string[]; // senaste fråge-id:n — undviker upprepning
};

const STANDARD_PROGRESS: Progress = {
  niva: 1,
  korrekta: 0,
  streak: 0,
  bastaStreak: 0,
  totaltForsvar: 0,
  totaltKorrekt: 0,
  seddaId: [],
};

function lasProgress(): Progress {
  try {
    const rå = localStorage.getItem(PROGRESS_KEY);
    if (!rå) return STANDARD_PROGRESS;
    const p = JSON.parse(rå) as Partial<Progress>;
    return {
      ...STANDARD_PROGRESS,
      ...p,
      niva: p.niva === 2 || p.niva === 3 ? p.niva : 1,
    };
  } catch {
    return STANDARD_PROGRESS;
  }
}

function sparaProgress(p: Progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {}
}

// ── Typer för komponentens lägen ───────────────────────────────────────────

type AttackLage = {
  fraga: AttackFraga;
  inledning: string | null;
  kalla: "bank" | "llm" | "lokal";
  historisktFall: HistorisktFall | null;
};

type Slutbetyg = {
  hallna: number;
  antal: number;
  text: string;
  kursTips?: { slug: string; titel: string; varfor: string };
};

/**
 * Slutbetyg på tes-försvaret — pedagogik.ts-ton: hjälper, dömer aldrig.
 * Hålen presenteras som en kurs som väntar, aldrig som brister hos eleven.
 */
function byggSlutbetyg(hallna: boolean[], faser: AttackFraga[]): Slutbetyg {
  const antal = hallna.length || 1;
  const räknade = hallna.filter(Boolean).length;
  const procent = räknade / antal;

  let text: string;
  if (procent === 1) {
    text = `Samtliga ${räknade} försvar höll — ${uppmuntran("framsteg")} Nästa omgång bjuder på skarpare attacker, i din takt.`;
  } else if (procent >= 0.6) {
    text = `${räknade} av ${antal} försvar höll. ${uppmuntran("framsteg")} Hålen är inte misslyckanden — de är en karta över var nästa kurs gör störst nytta just för dig.`;
  } else {
    text = `${räknade} av ${antal} försvar höll — och det är precis så varje resa börjar. ${uppmuntran("start")} Varje hål ovan är en plats där kunskap väntar, inte en dom.`;
  }

  // Tipsa (tvinga aldrig) om kursen där första hålet sitter
  const forstaHalIndex = hallna.findIndex((h) => !h);
  let kursTips: Slutbetyg["kursTips"];
  if (forstaHalIndex >= 0) {
    const ref = faser[forstaHalIndex]?.kursRef;
    const titel = ref ? KURS_TITLAR[ref] : undefined;
    if (ref && titel) {
      kursTips = {
        slug: ref,
        titel,
        varfor: varforText("försvarat din tes attack för attack", `kursen ${titel}, där det första hålet satt`),
      };
    }
  }
  return { hallna: räknade, antal, text, kursTips };
}

// ── Chat-integration (10x punkt 7) ────────────────────────────────────────

export type ShortsellerStatus = {
  niva: Niva;
  korrekta: number;
  streak: number;
  bastaStreak: number;
  totaltForsvar: number;
  totaltKorrekt: number;
};

/**
 * Kompakt hook som chatboten (chat-widget.tsx) kan använda senare:
 *
 *   const { niva, streak, attacka } = useShortsellerKompakt();
 *   attacka("roe"); // öppnar Short-Sellern och triggar en ROE-attack
 *
 * Lyssnar på "ak1a:shortseller-uppdaterad" som ShortSeller dispatchar vid
 * varje registrerat försvar — ingen prop-drilling, ingen koppling i state.
 */
export function useShortsellerKompakt() {
  const [status, setStatus] = useState<ShortsellerStatus>({
    niva: 1,
    korrekta: 0,
    streak: 0,
    bastaStreak: 0,
    totaltForsvar: 0,
    totaltKorrekt: 0,
  });

  useEffect(() => {
    const läs = () => {
      const p = lasProgress();
      setStatus({
        niva: p.niva,
        korrekta: p.korrekta,
        streak: p.streak,
        bastaStreak: p.bastaStreak,
        totaltForsvar: p.totaltForsvar,
        totaltKorrekt: p.totaltKorrekt,
      });
    };
    läs();
    window.addEventListener("ak1a:shortseller-uppdaterad", läs);
    return () => window.removeEventListener("ak1a:shortseller-uppdaterad", läs);
  }, []);

  const attacka = useCallback((amne?: AmneVal) => {
    window.dispatchEvent(
      new CustomEvent("ak1a:shortseller-attacka", { detail: { amne: amne ?? "overraska" } })
    );
  }, []);

  return { ...status, attacka };
}

// ── Komponenten ────────────────────────────────────────────────────────────

/** Agent 3: The Short-Seller — sokratisk grillningskomponent (v2). */
export function ShortSeller() {
  const pathname = usePathname();

  const [visar, setVisar] = useState(false);
  const [flik, setFlik] = useState<"attack" | "forsvar">("attack");
  const [amne, setAmne] = useState<AmneVal>("overraska");
  const [progress, setProgress] = useState<Progress>(STANDARD_PROGRESS);
  const [busy, setBusy] = useState(false);

  // Attack-läge
  const [attack, setAttack] = useState<AttackLage | null>(null);
  const [berakningSvar, setBerakningSvar] = useState<number | null>(null);
  const [sokratiskSvar, setSokratiskSvar] = useState("");
  const [sokratiskDomd, setSokratiskDomd] = useState(false);
  const [nivaNotis, setNivaNotis] = useState<Niva | null>(null);

  // Tes-försvar (sekventiellt)
  const [tes, setTes] = useState("");
  const [forsvar, setForsvar] = useState<{
    faser: AttackFraga[];
    index: number;
    hallna: boolean[];
    oppningsAttack: string | null;
    svar: string;
    betyg: Slutbetyg | null;
  } | null>(null);

  // Chat-triggad attack som väntar tills panelen öppnats
  const [pendingAttack, setPendingAttack] = useState<{ amne: AmneVal; typ: "sokratisk" | "berakning" } | null>(null);

  // ── Elev-kontext (10x punkt 1): member-local + pågående kurs via pathname ──
  const [ctx, setCtx] = useState<{
    klaraKurser: string[];
    xp: number;
    streakDagar: number;
    sokvag: string;
    paagaaendeKurs: string | null;
  }>({ klaraKurser: [], xp: 0, streakDagar: 0, sokvag: "/", paagaaendeKurs: null });

  useEffect(() => {
    const paagaaende =
      pathname && pathname.startsWith("/kurser/") ? pathname.split("/")[2] || null : null;
    setCtx({
      klaraKurser: lasKlaraKurser(),
      xp: lasXP(),
      streakDagar: lasStreak().antal,
      sokvag: pathname || "/",
      paagaaendeKurs: paagaaende,
    });
  }, [pathname]);

  // Progression finns bara i localStorage — läs på klienten efter hydration
  useEffect(() => {
    setProgress(lasProgress());
  }, []);

  // ── Progression: registrera ett försvar (rätt räknat / hållbart) ─────────
  const registreraForsvar = (korrekt: boolean, fragaId?: string) => {
    const p = progress;
    const gamlaNiva = p.niva;
    let korrekta = korrekt ? p.korrekta + 1 : p.korrekta; // fel avbryter inte jakten — eleven väljer takten
    let niva: Niva = p.niva;
    if (korrekta >= KORREKTA_FOR_NASTA_NIVA && niva < 3) {
      niva = (niva + 1) as Niva;
      korrekta = 0;
    }
    const ny: Progress = {
      niva,
      korrekta,
      streak: korrekt ? p.streak + 1 : 0,
      bastaStreak: korrekt ? Math.max(p.bastaStreak, p.streak + 1) : p.bastaStreak,
      totaltForsvar: p.totaltForsvar + 1,
      totaltKorrekt: p.totaltKorrekt + (korrekt ? 1 : 0),
      seddaId: fragaId ? [...p.seddaId.filter((id) => id !== fragaId), fragaId].slice(-40) : p.seddaId,
    };
    sparaProgress(ny);
    setProgress(ny);
    window.dispatchEvent(new Event("ak1a:shortseller-uppdaterad"));
    if (niva > gamlaNiva) setNivaNotis(niva);
  };

  // ── Attack (10x punkt 2, 3, 6): API med GLM först → lokal bank-fallback ──
  const utmana = async (typ: "sokratisk" | "berakning", amneOverride?: AmneVal) => {
    const aktivtAmne = amneOverride ?? amne;
    setBusy(true);
    setBerakningSvar(null);
    setSokratiskSvar("");
    setSokratiskDomd(false);
    setNivaNotis(null);
    try {
      const res = await fetch("/api/shortseller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "utmana",
          amne: aktivtAmne,
          niva: progress.niva,
          typ,
          exkludera: progress.seddaId,
          elevCtx: {
            klaraKurser: ctx.klaraKurser,
            xp: ctx.xp,
            sokvag: ctx.sokvag,
            paagaaendeKurs: ctx.paagaaendeKurs,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data?.attack) {
        setAttack({
          fraga: data.attack as AttackFraga,
          inledning: typeof data.kontextuellInledning === "string" ? data.kontextuellInledning : null,
          kalla: data.kalla === "llm" ? "llm" : "bank",
          historisktFall: data.historisktFall ?? null,
        });
      } else {
        throw new Error("api-svar");
      }
    } catch {
      // Deterministisk offline-fallback — samma bank, samma kontext-regler
      const fraga =
        typ === "berakning"
          ? valBerakningsAttack(progress.niva, progress.seddaId)
          : valAttack({ amne: aktivtAmne, niva: progress.niva, exkludera: progress.seddaId });
      setAttack({
        fraga,
        inledning: kontextuellInledning(fraga, ctx),
        kalla: "lokal",
        historisktFall: historisktFallFor(fraga.amne),
      });
    } finally {
      setBusy(false);
    }
  };

  // ── Beräknings-attack: eleven väljer → ratt + forklaring EFTER val ───────
  const svaraBerakning = (index: number) => {
    if (!attack?.fraga.berakning || berakningSvar !== null) return;
    setBerakningSvar(index);
    const ratt = attack.fraga.berakning.alternativ[index]?.ratt === true;
    registreraForsvar(ratt, attack.fraga.id);
  };

  // ── Sokratisk attack: eleven dömer sitt eget försvar (vi ger ALDRIG svar) ─
  const domSokratisk = (hallbart: boolean) => {
    if (!attack || attack.fraga.berakning || sokratiskDomd) return;
    if (hallbart && sokratiskSvar.trim().length < MIN_FORSVAR_TECKEN) return;
    registreraForsvar(hallbart, attack.fraga.id);
    setSokratiskSvar("");
    setSokratiskDomd(true);
  };

  // ── Tes-försvar (10x punkt 5): 1–5 sekventiella attacker + slutbetyg ────
  const startaForsvar = async () => {
    if (!tes.trim() || busy) return;
    setBusy(true);
    let faser: AttackFraga[] = [];
    let oppningsAttack: string | null = null;
    try {
      const res = await fetch("/api/shortseller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "forsvar", tes: tes.trim(), niva: progress.niva }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.attacker) && data.attacker.length > 0) {
        faser = data.attacker as AttackFraga[];
        oppningsAttack = typeof data.oppningsAttack === "string" ? data.oppningsAttack : null;
      } else {
        throw new Error("api-svar");
      }
    } catch {
      // Offline: samma nyckelordsanalys, lokalt ur banken
      faser = forsvarsFragor(tes.trim(), progress.niva, 5);
    }
    setForsvar({ faser, index: 0, hallna: [], oppningsAttack, svar: "", betyg: null });
    setBusy(false);
  };

  const domForsvar = (hallbart: boolean) => {
    if (!forsvar || forsvar.betyg) return;
    if (hallbart && forsvar.svar.trim().length < MIN_FORSVAR_TECKEN) return;
    const fas = forsvar.faser[forsvar.index];
    if (fas) registreraForsvar(hallbart, fas.id);
    const hallna = [...forsvar.hallna, hallbart];
    if (forsvar.index + 1 >= forsvar.faser.length) {
      setForsvar({ ...forsvar, hallna, svar: "", betyg: byggSlutbetyg(hallna, forsvar.faser) });
    } else {
      setForsvar({ ...forsvar, index: forsvar.index + 1, hallna, svar: "" });
    }
  };

  const nollstallForsvar = () => {
    setForsvar(null);
    setTes("");
  };

  // ── Chat-integration: chatten kan skicka eleven hit (10x punkt 7) ────────
  useEffect(() => {
    const lyssna = (e: Event) => {
      const detail = (e as CustomEvent).detail as { amne?: AmneVal } | undefined;
      setVisar(true);
      setFlik("attack");
      const a = detail?.amne;
      if (a) setAmne(a);
      setPendingAttack({ amne: a ?? "overraska", typ: "sokratisk" });
    };
    window.addEventListener("ak1a:shortseller-attacka", lyssna);
    return () => window.removeEventListener("ak1a:shortseller-attacka", lyssna);
  }, []);

  // Auto-trigga attacken när panelen öppnats av chatten
  useEffect(() => {
    if (visar && pendingAttack) {
      const { amne: a, typ } = pendingAttack;
      setPendingAttack(null);
      utmana(typ, a);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visar, pendingAttack]);

  // ── Render ────────────────────────────────────────────────────────────────

  // VÅG 108 (kundens "bubblor stör mig"): 🎯-bubblan döljs HELT på /studio
  // (chatt-ytan ska vara fri) och kan stängas med × i 24 h på övriga sidor.
  // (pathname deklarerad vid komponentens topp — rad ~203.)
  const arStudioSida = pathname.startsWith("/studio");
  const [doldStempel, setDoldStempel] = useState<number | null>(null);
  useEffect(() => {
    try {
      const v = Number(localStorage.getItem("ak1a-shortseller-dold") || 0);
      setDoldStempel(v > 0 ? v : null);
    } catch {}
  }, []);
  const dold24h = doldStempel !== null && Date.now() - doldStempel < 24 * 60 * 60 * 1000;

  if (!visar) {
    if (arStudioSida || dold24h) return null;
    return (
      <span className="fixed bottom-[calc(5.25rem_+_env(safe-area-inset-bottom))] right-4 z-40">
        {/* Trigger-knapp — vertikalt staplad ovanför AI-mentorn (gap-3) med safe-area undertill, djupare röd identitet */}
        <button
          onClick={() => setVisar(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-800 bg-[#7A1F1F] text-2xl text-white shadow-xl transition-transform hover:scale-105"
          aria-label="Utmana mig — Short-Seller"
          title="Short-Seller: Sokratisk grillning"
        >
          🎯
        </button>
        <button
          onClick={() => {
            const nu = Date.now();
            setDoldStempel(nu);
            try { localStorage.setItem("ak1a-shortseller-dold", String(nu)); } catch {}
          }}
          aria-label="Dölj Short-Seller-bubblan i 24 timmar"
          title="Dölj i 24 h"
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-[#30363D] bg-[#0D1117] text-xs font-bold leading-none text-[#8B949E] transition-colors hover:border-[#58A6FF] hover:text-[#E6EDF3]"
        >
          ×
        </button>
      </span>
    );
  }

  const amneNamn = (id: string) => AMNEN.find((a) => a.id === id)?.namn ?? id;
  const aktuellFas = forsvar ? forsvar.faser[forsvar.index] : undefined;

  return (
    // Mobil: fullbredd bottom-sheet över safe-area; desktop: oförändrad hög låda
    <div className="fixed inset-x-2 bottom-[calc(0.5rem_+_env(safe-area-inset-bottom))] z-50 flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border-2 border-[#7A1F1F] bg-paper shadow-2xl sm:bottom-20 sm:left-auto sm:right-4 sm:h-[540px] sm:max-h-none sm:w-[380px] sm:max-w-[calc(100vw-2rem)]">
      {/* Paneltopp — djup röd identitet (avsiktligt varumärke) med progression */}
      <div className="bg-[#7A1F1F] px-4 py-3 text-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="font-serif font-bold">🎯 The Short-Seller</span>
            <span className="whitespace-nowrap rounded-full border border-white/30 bg-white/10 px-2 py-0.5 text-[10px] font-bold">
              Nivå {progress.niva}/3
            </span>
            {progress.streak > 0 && (
              <span
                className="whitespace-nowrap rounded-full border border-white/30 bg-white/10 px-2 py-0.5 text-[10px] font-bold"
                title={`Hållna försvar i rad (bästa: ${progress.bastaStreak})`}
              >
                🔥 {progress.streak}
              </span>
            )}
          </div>
          <button
            onClick={() => setVisar(false)}
            aria-label="Stäng Short-Sellern"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-lg font-bold leading-none text-white transition-colors hover:bg-white/20"
          >
            ×
          </button>
        </div>
      </div>

      {/* Flikar */}
      <div className="flex gap-1 border-b border-gold/15 px-3 pt-2">
        {(
          [
            { id: "attack", label: "🎯 Attack" },
            { id: "forsvar", label: "🛡️ Försvara tes" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setFlik(t.id)}
            className={`rounded-t-lg px-3 py-2 text-xs font-semibold transition-colors ${
              flik === t.id
                ? "border border-b-0 border-red-600 bg-red-50 text-red-700"
                : "text-muted-foreground hover:text-red-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Progressionsrad — P8: nivån styr skärpan, inget låses */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>
            {progress.niva < 3
              ? `${progress.korrekta}/${KORREKTA_FOR_NASTA_NIVA} korrekta försvar till nivå ${progress.niva + 1}`
              : "Högsta nivån — attackerna är som skarpast"}
          </span>
          <span>
            {progress.totaltKorrekt}/{progress.totaltForsvar} hållna totalt
          </span>
        </div>

        {nivaNotis && (
          <div className="mt-2 rounded-xl border border-bull/40 bg-bull/5 p-3 text-xs text-foreground/90">
            🎓 Nivå {nivaNotis} upplåst — attackerna blir skarpare. Takten är fortfarande din.
          </div>
        )}

        {/* ══════════ FLIK: ATTACK ══════════ */}
        {flik === "attack" && (
          <>
            <p className="mt-3 text-xs italic text-muted-foreground">
              Sokratisk grillning — jag ger aldrig svar, bara frågor som tvingar dig att tänka djupare.
              Räknefallen är undantaget: svar och förklaring kommer först efter ditt val. Alla ämnen är
              alltid öppna — nivån styr bara hur skarp frågan är.
            </p>

            {/* Ämnesval — 10 ämnen + överraska (P8: inga lås) */}
            <div className="mt-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-600">
                Välj ämne att bli grillad på
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {AMNEN.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAmne(a.id)}
                    className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                      amne === a.id
                        ? "border-red-600 bg-red-50 text-red-700"
                        : "border-gold/20 hover:border-gold/50"
                    }`}
                  >
                    {a.ikon} {a.namn}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Button
                  onClick={() => utmana("sokratisk")}
                  disabled={busy}
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                  size="sm"
                >
                  {busy ? "Förbereder attack..." : "🎯 Utmana mig!"}
                </Button>
                <Button
                  onClick={() => utmana("berakning")}
                  disabled={busy}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                  size="sm"
                >
                  🧮 Räkneattack
                </Button>
              </div>
            </div>

            {/* Aktuell attack */}
            {attack && (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">
                      {amneNamn(attack.fraga.amne)} · svårighet {attack.fraga.svarighet}/3
                    </span>
                    <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-500">
                      {attack.kalla === "llm" ? "GLM" : attack.kalla === "lokal" ? "offline" : "bank"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-red-800">
                    {attack.inledning}
                    {attack.fraga.fraga}
                  </p>
                  {attack.fraga.kontext && (
                    <p className="mt-2 text-xs italic text-red-600">{attack.fraga.kontext}</p>
                  )}
                </div>

                {/* Beräknings-attack: räkna → välj → ratt + forklaring efter val */}
                {attack.fraga.berakning && (
                  <div className="rounded-xl border border-gold/30 bg-card p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
                      🧮 Räknefall — räkna först, välj sen
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{attack.fraga.berakning.raknefall}</p>
                    <div className="mt-2 space-y-1.5">
                      {attack.fraga.berakning.alternativ.map((alt, i) => {
                        const valt = berakningSvar === i;
                        const visa = berakningSvar !== null;
                        const klass = visa
                          ? alt.ratt
                            ? "border-bull bg-bull/10 text-foreground"
                            : valt
                              ? "border-bear bg-bear/10 text-foreground"
                              : "border-gold/20 text-muted-foreground"
                          : "border-gold/30 hover:border-gold/60";
                        return (
                          <button
                            key={i}
                            onClick={() => svaraBerakning(i)}
                            disabled={berakningSvar !== null}
                            className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors ${klass}`}
                          >
                            <strong>{String.fromCharCode(65 + i)})</strong> {alt.text}
                            {visa && alt.ratt && <span className="ml-1 font-bold text-bull"> ✓</span>}
                          </button>
                        );
                      })}
                    </div>
                    {berakningSvar !== null && (
                      <div
                        className={`mt-2 rounded-lg border p-3 text-xs ${
                          attack.fraga.berakning.alternativ[berakningSvar]?.ratt
                            ? "border-bull/40 bg-bull/5"
                            : "border-gold/40 bg-gold/5"
                        }`}
                      >
                        <p className="font-semibold">
                          {attack.fraga.berakning.alternativ[berakningSvar]?.ratt
                            ? "✅ Rätt räknat — försvaret håller."
                            : "🔄 Inte den här gången — och det är en del av hantverket."}
                        </p>
                        <p className="mt-1 leading-relaxed text-foreground/90">
                          {attack.fraga.berakning.forklaring}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Sokratisk attack: eleven skriver försvar och dömer det själv */}
                {!attack.fraga.berakning && (
                  <div className="rounded-xl border border-gold/30 bg-card p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
                      🛡️ Ditt försvar
                    </p>
                    <textarea
                      value={sokratiskSvar}
                      onChange={(e) => setSokratiskSvar(e.target.value)}
                      disabled={sokratiskDomd}
                      placeholder={`Skriv ditt försvar (minst ${MIN_FORSVAR_TECKEN} tecken)...`}
                      rows={2}
                      className="mt-2 w-full rounded-lg border border-gold/30 bg-paper px-3 py-2 text-xs outline-none focus:border-red-600 disabled:opacity-60"
                    />
                    {sokratiskDomd ? (
                      <p className="mt-2 text-center text-[11px] italic text-muted-foreground">
                        Försvar registrerat — tryck "Utmana mig" för nästa attack.
                      </p>
                    ) : (
                      <div className="mt-2 grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => domSokratisk(true)}
                          disabled={sokratiskSvar.trim().length < MIN_FORSVAR_TECKEN}
                          className="rounded-lg border border-bull/40 bg-bull/5 px-2 py-2 text-[11px] font-semibold text-bull transition-colors hover:bg-bull/15 disabled:opacity-40"
                        >
                          🛡️ Hållbart
                        </button>
                        <button
                          onClick={() => domSokratisk(false)}
                          className="rounded-lg border border-bear/40 bg-bear/5 px-2 py-2 text-[11px] font-semibold text-bear transition-colors hover:bg-bear/15"
                        >
                          🏳️ Höll inte
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {attack.historisktFall && (
                  <div className="rounded-xl border border-gold/30 bg-card p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
                      📚 Historiskt fall: {attack.historisktFall.bolag}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <strong>Fel:</strong> {attack.historisktFall.fel}
                      <br />
                      <strong>Lärdom:</strong> {attack.historisktFall.lardom}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ══════════ FLIK: FÖRSVARA TES ══════════ */}
        {flik === "forsvar" && !forsvar && (
          <div className="mt-3">
            <p className="text-xs italic text-muted-foreground">
              Lämna in din tes. Nyckelordsanalysen väljer {1}–5 attacker som kommer en i taget — du
              försvarar, du dömer själv om försvaret höll, och på slutet får du ett betyg med nästa
              steg. Hederligt försvar är hela poängen.
            </p>
            <textarea
              value={tes}
              onChange={(e) => setTes(e.target.value)}
              placeholder="Jag tror att [bolag] är ett köp eftersom..."
              className="mt-2 w-full rounded-lg border border-gold/30 bg-card px-3 py-2 text-xs outline-none focus:border-red-600"
              rows={3}
            />
            <Button
              onClick={startaForsvar}
              disabled={busy || !tes.trim()}
              variant="outline"
              className="mt-2 w-full border-red-600 text-red-600 hover:bg-red-50"
              size="sm"
            >
              {busy ? "Läser din tes..." : "🔴 Attackera min tes"}
            </Button>
          </div>
        )}

        {flik === "forsvar" && forsvar && aktuellFas && (
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>
                Attack {forsvar.index + 1}/{forsvar.faser.length} ·{" "}
                {forsvar.hallna.filter(Boolean).length} hållna
              </span>
              <span className="text-red-600">{amneNamn(aktuellFas.amne)}</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-red-100">
              <div
                className="h-full bg-red-500 transition-all"
                style={{ width: `${(forsvar.index / forsvar.faser.length) * 100}%` }}
              />
            </div>

            {forsvar.index === 0 && forsvar.oppningsAttack && (
              <div className="rounded-xl border-2 border-red-300 bg-red-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-600">
                  Öppningsattack · GLM
                </p>
                <p className="mt-1 text-sm font-semibold text-red-800">{forsvar.oppningsAttack}</p>
              </div>
            )}

            <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">{aktuellFas.fraga}</p>
              {aktuellFas.kontext && <p className="mt-2 text-xs italic text-red-600">{aktuellFas.kontext}</p>}
            </div>

            <textarea
              value={forsvar.svar}
              onChange={(e) => setForsvar({ ...forsvar, svar: e.target.value })}
              placeholder={`Ditt försvar mot denna attack (minst ${MIN_FORSVAR_TECKEN} tecken)...`}
              rows={2}
              className="w-full rounded-lg border border-gold/30 bg-card px-3 py-2 text-xs outline-none focus:border-red-600"
            />
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => domForsvar(true)}
                disabled={forsvar.svar.trim().length < MIN_FORSVAR_TECKEN}
                className="rounded-lg border border-bull/40 bg-bull/5 px-2 py-2.5 text-[11px] font-semibold text-bull transition-colors hover:bg-bull/15 disabled:opacity-40"
              >
                🛡️ Hållbart
              </button>
              <button
                onClick={() => domForsvar(false)}
                className="rounded-lg border border-bear/40 bg-bear/5 px-2 py-2.5 text-[11px] font-semibold text-bear transition-colors hover:bg-bear/15"
              >
                🏳️ Försvaret håller inte — ny attack
              </button>
            </div>
          </div>
        )}

        {/* Slutbetyg — pedagogisk uppmaning, aldrig dömande (pedagogik.ts) */}
        {flik === "forsvar" && forsvar?.betyg && (
          <div className="mt-3 rounded-xl border-2 border-gold/50 bg-card p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gold">Slutbetyg</p>
            <p className="mt-1 font-serif text-lg font-bold text-foreground">
              {forsvar.betyg.hallna}/{forsvar.betyg.antal} försvar höll
            </p>
            <p className="mt-1 text-xs leading-relaxed text-foreground/90">{forsvar.betyg.text}</p>
            {forsvar.betyg.kursTips && (
              <a
                href={`/kurser/${forsvar.betyg.kursTips.slug}`}
                className="mt-3 block rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold transition-colors hover:bg-gold/20"
              >
                📚 {forsvar.betyg.kursTips.titel}
                <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                  {forsvar.betyg.kursTips.varfor}
                </span>
              </a>
            )}
            <Button
              onClick={nollstallForsvar}
              size="sm"
              className="mt-3 w-full bg-red-600 text-white hover:bg-red-700"
            >
              Ny tes att försvara
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
