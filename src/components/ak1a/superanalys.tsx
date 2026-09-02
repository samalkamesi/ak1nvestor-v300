"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addXP } from "@/lib/member-local";
import {
  AKM1_VARIABLER,
  HORIZONTER,
  KATEGORIER,
  VAGKLASSER,
  ak1tsTolkning,
  arAk1tsKomplett,
  arKomplett,
  bedomning,
  byggDelText,
  lasSparade,
  lasUtkast,
  nyAnalys,
  raderaAnalys,
  raderaUtkast,
  raknaKategorier,
  raknaTotal,
  sparaAnalys,
  sparaUtkast,
  type HorisontId,
  type KategoriId,
  type SuperanalysData,
  type VagKlass,
} from "@/lib/superanalys";

/**
 * SUPERANALYSEN — flaggskeppswizard: 24 guidade steg som slutar i ett
 * delbart analys-kort med betyg (kategori-radial, staplar, band + XP).
 *
 * Steg 1 bolaget · steg 2–21 AKM1 V01–V20 · steg 22 AK1TS-vågklasser ·
 * steg 23 granskning · steg 24 resultat. Utkast autosparas i localStorage.
 */

const TOTAL_STEG = 24;
const STEG_V_FORSTA = 1; // index i state (0-baserat): V01
const STEG_AK1TS = 21;
const STEG_GRANSKA = 22;
const STEG_RESULTAT = 23;

const sv = (n: number) => n.toFixed(1).replace(".", ",");
const pr = (n: number) => String(n).replace(".", ",");

function stapelFarg(p: number): string {
  return p >= 4 ? "bg-bull" : p === 3 ? "bg-gold" : "bg-bear";
}
function textFarg(p: number): string {
  return p >= 4 ? "text-bull" : p === 3 ? "text-gold" : "text-bear";
}

// ── Kategori-radial (ren SVG — spindelnät i guld) ────────────────────────────

function KategoriRadial({ kat }: { kat: Record<KategoriId, number> }) {
  const C = 180;
  const CY = 162;
  const R = 102;
  const n = KATEGORIER.length;

  const vinkel = (i: number) => ((-90 + (360 / n) * i) * Math.PI) / 180;
  const punkt = (i: number, r: number): [number, number] => [
    C + r * Math.cos(vinkel(i)),
    CY + r * Math.sin(vinkel(i)),
  ];
  const polygon = (r: number) =>
    KATEGORIER.map((_, i) => punkt(i, r).map((v) => v.toFixed(1)).join(",")).join(" ");

  const vardePolygon = KATEGORIER.map((k, i) =>
    punkt(i, (Math.max(0, Math.min(5, kat[k.id])) / 5) * R)
      .map((v) => v.toFixed(1))
      .join(",")
  ).join(" ");

  return (
    <svg
      viewBox="0 0 360 324"
      className="mx-auto w-full max-w-sm"
      role="img"
      aria-label="Radiadiagram över kategoripoäng 0–5"
    >
      {/* koncentriska ringar (20/40/60/80/100 %) */}
      {[1, 2, 3, 4, 5].map((k) => (
        <polygon key={k} points={polygon((R * k) / 5)} className="fill-none stroke-gold/20" strokeWidth={1} />
      ))}
      {/* axlar */}
      {KATEGORIER.map((_, i) => {
        const [x, y] = punkt(i, R);
        return <line key={i} x1={C} y1={CY} x2={x} y2={y} className="stroke-gold/25" strokeWidth={1} />;
      })}
      {/* värdepolygon */}
      <polygon points={vardePolygon} className="fill-gold/20 stroke-gold" strokeWidth={2} strokeLinejoin="round" />
      {KATEGORIER.map((k, i) => {
        const [x, y] = punkt(i, (Math.max(0, Math.min(5, kat[k.id])) / 5) * R);
        return <circle key={k.id} cx={x} cy={y} r={3} className="fill-gold" />;
      })}
      {/* etiketter */}
      {KATEGORIER.map((k, i) => {
        const [x, y] = punkt(i, R + 20);
        const cos = Math.cos(vinkel(i));
        const anchor = Math.abs(cos) < 0.35 ? "middle" : cos > 0 ? "start" : "end";
        return (
          <g key={k.id}>
            <text x={x} y={y} textAnchor={anchor} fontSize={10.5} className="fill-muted-foreground font-semibold">
              {k.namn}
            </text>
            <text x={x} y={y + 12} textAnchor={anchor} fontSize={10.5} className="fill-gold font-bold">
              {sv(kat[k.id])}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Huvudkomponenten ─────────────────────────────────────────────────────────

export function Superanalys() {
  const [steg, setSteg] = useState(0);
  const [data, setData] = useState<SuperanalysData>(() => nyAnalys());
  const [hydrerad, setHydrerad] = useState(false);
  const [atervinitUtkast, setAtervinitUtkast] = useState(false);
  const [sparade, setSparade] = useState<SuperanalysData[]>([]);
  const [xpVisa, setXpVisa] = useState(false);
  const [meddelande, setMeddelande] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hämta utkast + sparade analyser vid montering (SSR-säkert).
  useEffect(() => {
    const utkast = lasUtkast();
    setSparade(lasSparade());
    if (utkast && (utkast.bolag.trim() !== "" || Object.keys(utkast.poang).length > 0)) {
      setData(utkast);
      setAtervinitUtkast(true);
      const saknad = AKM1_VARIABLER.findIndex((v) => typeof utkast.poang[v.id] !== "number");
      setSteg(saknad === -1 ? STEG_GRANSKA : STEG_V_FORSTA + saknad);
    }
    setHydrerad(true);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // Autospara utkast vid varje ändring.
  useEffect(() => {
    if (hydrerad) sparaUtkast(data);
  }, [data, hydrerad]);

  const total = useMemo(() => raknaTotal(data.poang), [data.poang]);
  const kat = useMemo(() => raknaKategorier(data.poang), [data.poang]);
  const band = useMemo(() => bedomning(total), [total]);
  const tolkning = useMemo(() => ak1tsTolkning(total, data.vagor), [total, data.vagor]);

  const sattPoang = (varId: string, p: number) => {
    setData((d) => ({ ...d, poang: { ...d.poang, [varId]: p } }));
    setXpVisa(false);
    setMeddelande(null);
    // auto-advance: ett valt steg i taget
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSteg((s) => Math.min(s + 1, STEG_GRANSKA)), 220);
  };

  const sattVag = (h: HorisontId, k: VagKlass) => {
    setData((d) => ({ ...d, vagor: { ...d.vagor, [h]: k } }));
  };

  const borjaOm = () => {
    if (timer.current) clearTimeout(timer.current);
    raderaUtkast();
    setData(nyAnalys());
    setSteg(0);
    setAtervinitUtkast(false);
    setXpVisa(false);
    setMeddelande(null);
  };

  const spara = () => {
    const varNy = sparaAnalys({ ...data, datum: new Date().toISOString().slice(0, 10) });
    setSparade(lasSparade());
    if (varNy) {
      addXP(100); // belöning: hel analys = +100 XP (endast första sparandet)
      setXpVisa(true);
      setMeddelande(null);
    } else {
      setMeddelande("Analysen uppdaterades (XP delas ut bara en gång per analys).");
    }
  };

  const dela = async () => {
    const text = byggDelText({ ...data, datum: new Date().toISOString().slice(0, 10) });
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title: `Superanalysen — ${data.bolag}`, text });
        setMeddelande("Analysen delad.");
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setMeddelande("Text-sammanfattningen kopierad till urklipp.");
      } else {
        setMeddelande("Dela stöds inte här — markera sammanfattningen manuellt.");
      }
    } catch {
      /* avbröts av användaren */
    }
  };

  const oppnaSparad = (d: SuperanalysData) => {
    if (timer.current) clearTimeout(timer.current);
    setData(d);
    setSteg(STEG_RESULTAT);
    setXpVisa(false);
    setMeddelande(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const tabortSparad = (id: string) => {
    raderaAnalys(id);
    setSparade(lasSparade());
  };

  // navigeringsmöjligheter per steg
  const varIndex = steg - STEG_V_FORSTA;
  const aktivVar = varIndex >= 0 && varIndex < AKM1_VARIABLER.length ? AKM1_VARIABLER[varIndex] : null;
  const kanFramat =
    steg === 0
      ? data.bolag.trim() !== ""
      : aktivVar
        ? typeof data.poang[aktivVar.id] === "number"
        : steg === STEG_AK1TS
          ? arAk1tsKomplett(data)
          : true;
  const sektion =
    steg === 0
      ? "Bolaget"
      : aktivVar
        ? KATEGORIER.find((k) => k.id === aktivVar.kategori)?.namn ?? ""
        : steg === STEG_AK1TS
          ? "AK1TS"
          : steg === STEG_GRANSKA
            ? "Granskning"
            : "Resultat";
  const procent = ((steg + 1) / TOTAL_STEG) * 100;

  return (
    <div className="space-y-6">
      {/* Progress-bar i guld — stegindikatorn med marin topp-rad (DNA) */}
      <div>
        {/* Stegraden får wrappa på smala skärmar så sektionsnamnet aldrig klipps */}
        <div className="marin-panel flex flex-wrap items-baseline justify-between gap-x-2 rounded-lg px-4 py-2.5 text-xs">
          <span className="font-bold uppercase tracking-widest text-gold">
            Steg {steg + 1} av {TOTAL_STEG} · {sektion}
          </span>
          <span className="opacity-75">{Math.round(procent)} %</span>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-gold/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold transition-all duration-300"
            style={{ width: `${procent}%` }}
          />
        </div>
      </div>

      {/* ── STEG 1: Bolaget ── */}
      {steg === 0 && (
        <section className="rounded-xl border border-gold/30 bg-card p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-bold">Vilket bolag ska få genomgången?</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Superanalysen tar dig genom AKM1:s <strong>20 fundamentalvariabler</strong> — en i taget,
            med formel och trösklar — och avslutar med en <strong>AK1TS-korsläsning</strong> där du
            gissar vågklass per tidshorizont. 24 steg senare har du ett delbart analys-kort.
            Utkastet sparas automatiskt i din webbläsare.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Bolagsnamn *
              <input
                value={data.bolag}
                onChange={(e) => setData((d) => ({ ...d, bolag: e.target.value }))}
                placeholder="t.ex. Precise Biometrics"
                className="mt-1.5 h-11 w-full rounded-lg border border-gold/30 bg-paper px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ticker (frivilligt)
              <input
                value={data.ticker}
                onChange={(e) => setData((d) => ({ ...d, ticker: e.target.value }))}
                placeholder="t.ex. PREC"
                className="mt-1.5 h-11 w-full rounded-lg border border-gold/30 bg-paper px-3 text-sm uppercase text-foreground placeholder:normal-case placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none"
              />
            </label>
          </div>
          {atervinitUtkast && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gold/20 bg-paper px-3 py-2 text-xs text-muted-foreground">
              <span>✓ Pågående utkast återställt och fortsatt — det sparas automatiskt.</span>
              <button onClick={borjaOm} className="font-bold text-gold hover:underline">
                Börja om från början
              </button>
            </div>
          )}
          <p className="mt-6 border-t border-gold/20 pt-4 text-xs leading-relaxed text-muted-foreground">
            Pedagogisk analys — inte investeringsråd. Du är analysten; verktyget håller strukturen.
          </p>

          {sparade.length > 0 && (
            <div className="mt-6">
              <h3 className="font-serif text-lg font-bold">Senaste analyser</h3>
              <div className="mt-3 space-y-2">
                {sparade.map((d) => {
                  const t = raknaTotal(d.poang);
                  const b = bedomning(t);
                  return (
                    <div
                      key={d.id}
                      className="flex flex-wrap items-center gap-3 rounded-lg border border-gold/20 bg-paper px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground">
                          {d.bolag}
                          {d.ticker && <span className="ml-1.5 text-xs font-normal text-muted-foreground">({d.ticker.toUpperCase()})</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {d.datum} · <span className="font-bold text-gold">{pr(t)}/100</span> · {b.etikett}
                        </p>
                      </div>
                      {/* DNA: primär "Visa"-knapp i marin med guldtext */}
                      <button
                        onClick={() => oppnaSparad(d)}
                        className="btn-marin min-h-[44px] px-3 py-1.5 text-xs"
                      >
                        Visa
                      </button>
                      <button
                        onClick={() => tabortSparad(d.id)}
                        className="min-h-[44px] rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-bear"
                        aria-label={`Radera analysen för ${d.bolag}`}
                      >
                        Radera
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── STEG 2–21: AKM1-variablerna ── */}
      {aktivVar && (
        <section className="rounded-xl border border-gold/30 bg-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gold/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold">
              {KATEGORIER.find((k) => k.id === aktivVar.kategori)?.namn} · vikt{" "}
              {Math.round((KATEGORIER.find((k) => k.id === aktivVar.kategori)?.vikt ?? 0) * 100)} %
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              AKM1 · variabel {varIndex + 1} av 20
            </span>
          </div>
          <h2 className="mt-4 font-serif text-3xl font-bold">
            <span className="text-gold">{aktivVar.id}</span> · {aktivVar.namn}
          </h2>
          <p className="mt-2 font-mono text-xs text-muted-foreground">{aktivVar.formel}</p>
          <p className="mt-4 text-sm leading-relaxed text-foreground/90">{aktivVar.hjalp}</p>

          <p className="mt-6 text-sm font-bold text-foreground">Din poängsättning — 0–5 poäng?</p>
          <div className="mt-3 grid grid-cols-6 gap-2">
            {[0, 1, 2, 3, 4, 5].map((p) => {
              const vald = data.poang[aktivVar.id] === p;
              const tooltip =
                p === 0
                  ? aktivVar.trosklar.t0
                  : p === 3
                    ? aktivVar.trosklar.t3
                    : p === 5
                      ? aktivVar.trosklar.t5
                      : p === 1
                        ? "1 = klart under tröskeln"
                        : p === 2
                          ? "2 = under tröskeln"
                          : "4 = nära bästa nivån";
              return (
                <button
                  key={p}
                  onClick={() => sattPoang(aktivVar.id, p)}
                  title={tooltip}
                  aria-label={`${p} poäng — ${tooltip}`}
                  className={`h-12 rounded-lg border text-base font-bold transition-colors ${
                    vald
                      ? "border-gold bg-gold text-primary-foreground shadow-sm"
                      : "border-gold/30 bg-paper text-muted-foreground hover:border-gold hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
          <div className="mt-3 space-y-0.5 text-xs text-muted-foreground">
            <p>🎯 {aktivVar.trosklar.t5}</p>
            <p>🔸 {aktivVar.trosklar.t3}</p>
            <p>⚠ {aktivVar.trosklar.t0}</p>
          </div>
          {aktivVar.obs && (
            <p className="mt-4 rounded-lg border border-bear/30 bg-bear/5 px-3 py-2 text-xs leading-relaxed text-bear">
              OBS: {aktivVar.obs}
            </p>
          )}
        </section>
      )}

      {/* ── STEG 22: AK1TS-korsläsningen ── */}
      {steg === STEG_AK1TS && (
        <section className="rounded-xl border border-gold/30 bg-card p-6 sm:p-8">
          <span className="rounded-full bg-gold/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold">
            AK1TS · korsläsning
          </span>
          <h2 className="mt-4 font-serif text-2xl font-bold">Din vågklass-gissning per horisont</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Fundamentalpoängen säger något om <em>vad</em> bolaget är värt — kursens vågstruktur om
            <em> när</em> marknaden tror på det. Gissa vågklassen på varje tidshorizont innan du ser
            ditt sammanlagda resultat. Det är din läsning mot modellens.
          </p>
          <div className="mt-6 space-y-4">
            {HORIZONTER.map((h) => (
              <div key={h.id} className="rounded-lg border border-gold/20 bg-paper p-4">
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="font-serif text-base font-bold">{h.namn}</p>
                  <span className="text-xs text-muted-foreground">({h.spans})</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{h.hjalp}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {VAGKLASSER.map((k) => {
                    const vald = data.vagor[h.id] === k.id;
                    return (
                      <button
                        key={k.id}
                        onClick={() => sattVag(h.id, k.id)}
                        title={k.hjalp}
                        className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                          vald
                            ? "border-gold bg-gold/15 text-foreground"
                            : "border-gold/25 bg-card text-muted-foreground hover:border-gold/50"
                        }`}
                      >
                        <span className={`block text-sm font-bold ${vald ? "text-gold" : ""}`}>
                          {k.ikon} {k.etikett}
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-snug opacity-80">{k.hjalp}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── STEG 23: Granskning ── */}
      {steg === STEG_GRANSKA && (
        <section className="space-y-5">
          {/* DNA: gravör-ram runt sammanfattningen av poängen */}
          <div className="gravor-ram rounded-xl border border-gold/30 bg-card p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-bold">Granska dina {pr(total)} poäng</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Sista chansen att justera innan resultatet. Deklarerad viktning: Tillväxt 15 % ·
              Värdering 20 % · Lönsamhet 20 % · Stabilitet 15 % · Moat 15 % · Katalysator 5 % · Risk 10 %.
            </p>
          </div>
          {KATEGORIER.map((katDef) => {
            const vars = AKM1_VARIABLER.filter((v) => v.kategori === katDef.id);
            return (
              <div key={katDef.id} className="rounded-xl border border-gold/30 bg-card p-5">
                <h3 className="flex items-baseline gap-2 border-b border-gold/20 pb-2 font-serif text-lg font-bold">
                  {katDef.namn}
                  <span className="text-xs font-normal text-muted-foreground">
                    vikt {Math.round(katDef.vikt * 100)} % · snitt {sv(kat[katDef.id])} / 5
                  </span>
                </h3>
                <div className="mt-3 space-y-3">
                  {vars.map((v) => (
                    <div key={v.id} className="flex flex-wrap items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium" title={`${v.formel} — ${v.hjalp}`}>
                          <span className="font-bold text-gold">{v.id}</span> · {v.namn}
                        </p>
                      </div>
                      {/* Justeringsknappar: 44 px tryckyta på mobil, kompaktare (28 px) från sm och upp */}
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4, 5].map((p) => (
                          <button
                            key={p}
                            onClick={() => setData((d) => ({ ...d, poang: { ...d.poang, [v.id]: p } }))}
                            aria-label={`${v.id} ${p} poäng`}
                            className={`h-11 w-11 rounded border text-sm font-bold transition-colors sm:h-7 sm:w-7 sm:text-xs ${
                              data.poang[v.id] === p
                                ? "border-gold bg-gold text-primary-foreground"
                                : "border-gold/25 bg-paper text-muted-foreground hover:border-gold"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="rounded-xl border border-gold/30 bg-card p-5">
            <h3 className="font-serif text-lg font-bold">Din AK1TS-läsning</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {HORIZONTER.filter((h) => data.vagor[h.id] !== "").map((h) => (
                <span key={h.id} className="rounded-full border border-gold/30 bg-paper px-3 py-1 text-xs">
                  <strong>{h.namn}</strong>
                  {" — "}
                  {data.vagor[h.id]}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── STEG 24: Resultatet ── */}
      {steg === STEG_RESULTAT && arKomplett(data) && (
        <section className="space-y-6">
          {/* Analys-kortet */}
          <div className="rounded-xl border-2 border-gold/40 bg-card p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Superanalysen · {data.datum}
                </p>
                <h2 className="mt-1 font-serif text-3xl font-bold">
                  {data.bolag}
                  {data.ticker && (
                    <span className="ml-2 text-lg text-muted-foreground">{data.ticker.toUpperCase()}</span>
                  )}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Poäng</p>
                <p className="font-serif text-5xl font-bold leading-none text-gold">
                  {pr(total)}
                  <span className="text-lg text-muted-foreground"> /100</span>
                </p>
              </div>
            </div>
            <div className="mt-6 rounded-lg border border-gold/30 bg-paper p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Rekommendationsband
              </p>
              <p className={`mt-1 font-serif text-2xl font-bold ${band.farg}`}>{band.etikett}</p>
              <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">
                {band.beskrivning}
              </p>
            </div>
            <p className="mt-3 text-center text-[11px] italic text-muted-foreground">
              Pedagogisk analys — inte investeringsråd. Bandet styr studieinsats, aldrig portföljvikt.
            </p>
          </div>

          {/* Belöning */}
          {xpVisa && (
            <div className="rounded-xl border-2 border-gold bg-gold/10 p-6 text-center">
              <p className="font-serif text-3xl font-bold tracking-wide text-gold">+100 XP FÖRTJÄNAT</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Poängen tas inte — poängen förtjänas. Analysen sparad i din labb.
              </p>
            </div>
          )}

          {/* Kategori-radial */}
          <div className="rounded-xl border border-gold/30 bg-card p-6">
            <h3 className="font-serif text-xl font-bold">Kategori-profil</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Spindelnätet visar kategorisnitt 0–5 — formen avslöjar precis som summan.
            </p>
            <div className="mt-4">
              <KategoriRadial kat={kat} />
            </div>
          </div>

          {/* Variabel-staplar */}
          <div className="rounded-xl border border-gold/30 bg-card p-6">
            <h3 className="font-serif text-xl font-bold">Alla 20 variabler</h3>
            <div className="mt-4 space-y-5">
              {KATEGORIER.map((katDef) => (
                <div key={katDef.id}>
                  <p className="flex items-baseline gap-2 border-b border-gold/20 pb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {katDef.namn}
                    <span className="font-normal normal-case tracking-normal">snitt {sv(kat[katDef.id])}/5</span>
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {AKM1_VARIABLER.filter((v) => v.kategori === katDef.id).map((v) => {
                      const p = data.poang[v.id] ?? 0;
                      return (
                        <div key={v.id} className="flex items-center gap-3">
                          {/* Mobil: smalare etikett så stapeln får plats på 412 px */}
                          <span className="w-32 shrink-0 truncate text-xs text-foreground sm:w-44" title={v.namn}>
                            <span className="font-bold">{v.id}</span> {v.namn}
                          </span>
                          <span className="h-2 flex-1 overflow-hidden rounded-full bg-gold/10">
                            <span
                              className={`block h-full rounded-full ${stapelFarg(p)}`}
                              style={{ width: `${(p / 5) * 100}%` }}
                            />
                          </span>
                          <span className={`w-6 shrink-0 text-right font-mono text-xs font-bold ${textFarg(p)}`}>
                            {p}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AK1TS-korsläsning */}
          {arAk1tsKomplett(data) && (
            <div className="rounded-xl border border-gold/30 bg-card p-6">
              <h3 className="font-serif text-xl font-bold">AK1TS-korsläsning</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {HORIZONTER.map((h) => (
                  <span
                    key={h.id}
                    className="rounded-full border border-gold/30 bg-paper px-3 py-1 text-xs"
                    title={h.hjalp}
                  >
                    <strong className="text-gold">{h.namn}</strong> — {data.vagor[h.id]}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tolkning}</p>
            </div>
          )}

          {/* Åtgärder */}
          <div className="rounded-xl border border-gold/30 bg-card p-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={spara}
                className="btn-guld-signatur min-h-[44px] px-5 py-2.5 text-sm"
              >
                💾 Spara analysen
              </button>
              <button
                onClick={dela}
                className="min-h-[44px] rounded-lg border border-gold/40 px-5 py-2.5 text-sm font-bold text-gold hover:bg-gold/10"
              >
                📤 Dela
              </button>
              <button
                onClick={() => setSteg(STEG_GRANSKA)}
                className="min-h-[44px] rounded-lg border border-gold/20 px-5 py-2.5 text-sm text-muted-foreground hover:border-gold/50 hover:text-foreground"
              >
                Justera poängen
              </button>
              <button
                onClick={borjaOm}
                className="min-h-[44px] rounded-lg px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground"
              >
                Ny analys
              </button>
            </div>
            {meddelande && (
              <p className="mt-3 rounded-lg border border-gold/20 bg-paper px-3 py-2 text-xs text-muted-foreground">
                {meddelande}
              </p>
            )}
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-lg border border-gold/20 bg-paper p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
              {byggDelText(data)}
            </pre>
          </div>
        </section>
      )}

      {/* ── Navigation ── */}
      {steg < STEG_RESULTAT && (
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setSteg((s) => Math.max(0, s - 1))}
            disabled={steg === 0}
            className="min-h-[44px] rounded-lg border border-gold/30 px-4 py-2 text-sm font-semibold text-muted-foreground hover:border-gold/60 hover:text-foreground disabled:opacity-30"
          >
            ← Föregående
          </button>
          {/* DNA: primär stegknapp i marin — sista "Kör analysen" blir guld-signatur-CTA */}
          <button
            onClick={() => {
              if (timer.current) clearTimeout(timer.current);
              setSteg((s) => Math.min(TOTAL_STEG - 1, s + 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={!kanFramat}
            className={`${steg === STEG_GRANSKA ? "btn-guld-signatur" : "btn-marin"} min-h-[44px] px-5 py-2 text-sm disabled:opacity-40`}
          >
            {steg === STEG_GRANSKA ? "Kör analysen →" : "Nästa →"}
          </button>
        </div>
      )}
    </div>
  );
}
