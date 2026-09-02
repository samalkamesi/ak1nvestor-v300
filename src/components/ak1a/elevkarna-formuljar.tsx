"use client";

import { useEffect, useState } from "react";
import {
  ElevKarna,
  INTRESSEN_ALTERNATIV,
  MAL_ALTERNATIV,
  MAX_INTRESSEN,
  MAX_VALFARD,
  VALFARD_ALTERNATIV,
  lasElevKarna,
  sparaElevKarna,
  valfardsGrad,
} from "@/lib/elevkarna";

/**
 * ELEVKÄRNAN — frivillig 30-sekunders-introduktion. Kognitiv profil visar
 * hur eleven TÄNKER; kärnan visar vad eleven VILL. Välfärdssteget först,
 * ton alltid välkomnande ("ditt val", "vi hjälper") — aldrig krav.
 */

const STEG = 4;

const HORISONTER = [
  { ar: 2, etikett: "1–2 år" },
  { ar: 4, etikett: "3–5 år" },
  { ar: 8, etikett: "5–10 år" },
  { ar: 10, etikett: "10 år +" },
];

const TIDER = [
  { min: 15, etikett: "ca 15 min" },
  { min: 30, etikett: "ca 30 min" },
  { min: 60, etikett: "ca 1 timme" },
  { min: 150, etikett: "2 timmar +" },
];

const EMOJI: Record<string, string> = {
  "Bli oberoende analytiker": "🦉",
  "Förstå mina aktier djupare": "🔍",
  "Bygga långsiktig förmögenhet": "🌳",
  "Byta karriär till finans": "🧭",
  "Hantera mina pengar klokare": "🧠",
  "Svenska bolag": "🇸🇪",
  "Värdeinvestering": "💎",
  "Vågor & timing": "🌊",
  "Kvantitativ analys": "📐",
  "Beteende & psykologi": "🧠",
  "Risk & kriser": "🛡️",
  "Sömn utan ekonomisk oro": "🌙",
  "Frihet att välja liv": "🕊️",
  "Trygghet för familjen": "🏡",
  "Stolthet i hantverket": "🌟",
  "Lugn i beslut": "🧘",
};

const FRAGOR = [
  { emoji: "🌙", titel: "Vad kunskapen ska ge ditt liv" },
  { emoji: "🧭", titel: "Ditt huvudmål" },
  { emoji: "⏳", titel: "Din horisont & din tid" },
  { emoji: "💎", titel: "Dina intressen" },
];

/** Deterministiska konfetti-partiklar (inga slumptal → inga hydreringsproblem). */
const KONFETTI = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 53 + 7) % 100,
  delay: ((i % 6) * 0.09).toFixed(2),
  duration: (1.15 + ((i * 37) % 10) / 16).toFixed(2),
  storlek: 6 + ((i * 29) % 7),
  farg: ["var(--gold)", "var(--gold-soft)", "#e8c766", "#f5e3b3"][i % 4],
  rund: i % 3 === 0,
}));

function emoji(namn: string): string {
  return EMOJI[namn] ?? "✦";
}

function vaxla(
  lista: string[],
  val: string,
  max: number,
  maxText: string
): { lista: string[]; hint: string } {
  if (lista.includes(val)) return { lista: lista.filter((x) => x !== val), hint: "" };
  if (lista.length >= max) return { lista, hint: maxText };
  return { lista: [...lista, val], hint: "" };
}

function horisontEtikett(ar: number): string {
  return ar >= 10 ? "10 år +" : `${ar} år`;
}

function tidEtikett(min: number): string {
  if (min <= 0) return "—";
  if (min < 60) return `ca ${min} min per vecka`;
  const t = min / 60;
  const tText = Number.isInteger(t) ? String(t) : t.toFixed(1).replace(".", ",");
  return `ca ${tText} ${t <= 1 ? "timme" : "timmar"} per vecka`;
}

export function ElevkarnaFormuljar() {
  const [lastad, setLastad] = useState(false);
  const [karna, setKarna] = useState<ElevKarna | null>(null);
  const [avvisad, setAvvisad] = useState(false);
  const [redigerar, setRedigerar] = useState(false);
  const [steg, setSteg] = useState(0);
  const [valfard, setValfard] = useState<string[]>([]);
  const [mal, setMal] = useState("");
  const [horisontAr, setHorisontAr] = useState(0);
  const [tidPerVecka, setTidPerVecka] = useState(0);
  const [intressen, setIntressen] = useState<string[]>([]);
  const [hint, setHint] = useState("");
  const [firar, setFirar] = useState(false);

  useEffect(() => {
    setKarna(lasElevKarna());
    setLastad(true);
  }, []);

  useEffect(() => {
    if (!firar) return;
    const t = setTimeout(() => setFirar(false), 2100);
    return () => clearTimeout(t);
  }, [firar]);

  const oppna = () => {
    const k = lasElevKarna();
    setValfard(k?.valfard ?? []);
    setMal(k?.mal ?? "");
    setHorisontAr(k?.horisontAr ?? 0);
    setTidPerVecka(k?.tidPerVecka ?? 0);
    setIntressen(k?.intressen ?? []);
    setSteg(0);
    setHint("");
    setRedigerar(true);
  };

  const stang = () => {
    setRedigerar(false);
    setHint("");
  };

  const spara = () => {
    const ny: ElevKarna = { mal, horisontAr: horisontAr || 1, intressen, tidPerVecka, valfard, sparad: Date.now() };
    sparaElevKarna(ny);
    setKarna(ny);
    setRedigerar(false);
    setFirar(true);
  };

  const valjMal = (m: string) => {
    setMal(m);
    setSteg(2);
  };

  // Hydration-säkert skelett innan localStorage lästs (identiskt på server/klient).
  if (!lastad) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="h-56 animate-pulse rounded-2xl border-2 border-gold/15 bg-card" />
      </div>
    );
  }

  // ── Läge: kärnan satt → kompakt visning ───────────────────────────────────
  if (karna && !redigerar) {
    const grad = valfardsGrad(karna);
    return (
      <div className="mx-auto max-w-2xl">
        <div className="relative overflow-hidden rounded-2xl border-2 border-gold/40 bg-card p-6">
          {firar && (
            <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
              {KONFETTI.map((p, i) => (
                <span
                  key={i}
                  className="absolute top-0 block"
                  style={{
                    left: `${p.left}%`,
                    width: p.storlek,
                    height: p.storlek * (p.rund ? 1 : 0.55),
                    background: p.farg,
                    borderRadius: p.rund ? "50%" : "2px",
                    animation: `karnaKonfetti ${p.duration}s ease-in ${p.delay}s forwards`,
                  }}
                />
              ))}
            </div>
          )}

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                Din elevkärna
                <span className="flex gap-1" title="Välfärdsgrad">
                  {[1, 2, 3].map((n) => (
                    <span key={n} className={`h-1.5 w-3 rounded-full ${grad.grad >= n ? "bg-gold" : "bg-gold/20"}`} />
                  ))}
                </span>
              </p>
              <h2 className="mt-1 font-serif text-2xl font-bold text-gold">✦ Det du vill uppnå</h2>
            </div>
            <button
              onClick={oppna}
              className="shrink-0 rounded-lg border border-gold/30 px-3 py-1.5 text-xs font-semibold text-gold transition-colors hover:bg-gold/10"
            >
              Ändra
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-gold/25 bg-gold/5 px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Välfärd — ditt varför</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-foreground">
              {karna.valfard.length > 0 ? karna.valfard.map((v) => `${emoji(v)} ${v}`).join("  ·  ") : "Välkommen att välja när du vill"}
            </p>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-paper p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Huvudmål</p>
              <p className="mt-1 text-xs font-medium leading-snug text-foreground">{karna.mal || "Ditt val väntar"}</p>
            </div>
            <div className="rounded-xl bg-paper p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Horisont</p>
              <p className="mt-1 text-xs font-medium text-foreground">{horisontEtikett(karna.horisontAr)}</p>
            </div>
            <div className="rounded-xl bg-paper p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Tid per vecka</p>
              <p className="mt-1 text-xs font-medium text-foreground">{tidEtikett(karna.tidPerVecka)}</p>
            </div>
            <div className="rounded-xl bg-paper p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Intressen</p>
              <p className="mt-1 text-xs font-medium leading-snug text-foreground">
                {karna.intressen.length > 0 ? karna.intressen.join(" · ") : "Välkommen att utforska"}
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs italic leading-relaxed text-muted-foreground">{grad.text}</p>
        </div>
        <style>{KARNACSS}</style>
      </div>
    );
  }

  // ── Läge: tom → varm inbjudan med de fyra frågorna ────────────────────────
  if (!redigerar) {
    if (avvisad) return null;
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border-2 border-gold/40 bg-card p-8 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Elevkärnan — frivillig, 30 sekunder</p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-gold">Berätta vem du är</h2>
          <p className="mt-1 text-sm text-muted-foreground">— 30 sekunder, bara för dig själv</p>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Din profil visar hur du <span className="font-semibold text-foreground">tänker</span>. Kärnan visar vad du{" "}
            <span className="font-semibold text-foreground">vill</span> — och vi bygger allt med välfärd som mål.
          </p>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {FRAGOR.map((f) => (
              <div key={f.titel} className="flex items-center gap-3 rounded-xl border border-gold/25 bg-paper px-4 py-3 text-left">
                <span className="text-xl">{f.emoji}</span>
                <span className="text-xs font-semibold text-foreground">{f.titel}</span>
              </div>
            ))}
          </div>

          <button
            onClick={oppna}
            className="mt-6 rounded-xl bg-gold px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            Sätt min kärna — 30 sekunder →
          </button>
          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            Inga namn, ingen e-post — bara dina val, sparade lokalt hos dig.
          </p>
          <button onClick={() => setAvvisad(true)} className="mt-2 text-[11px] underline hover:text-gold">
            Inte just nu
          </button>
        </div>
      </div>
    );
  }

  // ── Wizard, steg 1–4 (välfärden först) ────────────────────────────────────
  const kanFortsatt0 = valfard.length >= 1;
  const kanFortsatt2 = horisontAr > 0 && tidPerVecka > 0;
  const kanSpara = intressen.length >= 1;

  const chip = (vald: boolean) =>
    `rounded-full border px-4 py-2 text-xs font-medium transition-all ${
      vald ? "border-gold bg-gold/15 text-foreground shadow-sm" : "border-gold/25 bg-card text-foreground/80 hover:border-gold/60 hover:bg-gold/5"
    }`;

  const kort = (vald: boolean) =>
    `flex w-full items-center gap-3 rounded-xl border px-5 py-4 text-left text-sm font-medium transition-all ${
      vald ? "border-gold bg-gold/10 shadow-sm" : "border-gold/25 bg-card hover:border-gold/60 hover:bg-gold/5"
    }`;

  const fortsatt =
    "rounded-xl bg-gold px-6 py-2.5 text-sm font-bold text-primary-foreground transition-transform enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">
          Steg {steg + 1} av {STEG}
        </p>
        <div className="flex gap-1">
          {Array.from({ length: STEG }, (_, i) => (
            <span key={i} className={`h-1.5 w-8 rounded-full ${i < steg ? "bg-gold" : i === steg ? "bg-gold/60" : "bg-gold/15"}`} />
          ))}
        </div>
      </div>

      <div key={steg} className="mt-6 animate-[karnaFadeIn_0.45s_ease-out]">
        {steg === 0 && (
          <>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Din välfärd — vi börjar här</p>
            <h2 className="mt-2 font-serif text-2xl font-bold">Vad vill du att kunskapen ska ge ditt liv?</h2>
            <p className="mt-1 text-sm italic text-muted-foreground">(Vi bygger allt för att hjälpa dig dit.)</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {VALFARD_ALTERNATIV.map((v) => (
                <button key={v} onClick={() => setValfard(vaxla(valfard, v, MAX_VALFARD, "").lista)} className={chip(valfard.includes(v))}>
                  {emoji(v)} {v}
                  {valfard.includes(v) && <span className="ml-1 text-gold">✦</span>}
                </button>
              ))}
            </div>
            <p className="mt-2 min-h-5 text-[11px] text-muted-foreground">
              {valfard.length >= MAX_VALFARD
                ? "Två val räcker långt — avvälj ett om du vill byta."
                : "Välj ett eller två — ditt val, alltid ändringsbart."}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span />
              <button disabled={!kanFortsatt0} onClick={() => setSteg(1)} className={fortsatt}>
                Fortsätt →
              </button>
            </div>
          </>
        )}

        {steg === 1 && (
          <>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Din riktning</p>
            <h2 className="mt-2 font-serif text-2xl font-bold">Vad är ditt huvudmål just nu?</h2>
            <p className="mt-1 text-sm italic text-muted-foreground">Ditt val — det får ändras när du vill.</p>
            <div className="mt-5 space-y-3">
              {MAL_ALTERNATIV.map((m) => (
                <button key={m} onClick={() => valjMal(m)} className={kort(mal === m)}>
                  <span className="text-xl">{emoji(m)}</span> {m}
                </button>
              ))}
            </div>
          </>
        )}

        {steg === 2 && (
          <>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Din resa</p>
            <h2 className="mt-2 font-serif text-2xl font-bold">Hur ser din horisont ut?</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {HORISONTER.map((h) => (
                <button key={h.ar} onClick={() => setHorisontAr(h.ar)} className={chip(horisontAr === h.ar)}>
                  ⏳ {h.etikett}
                </button>
              ))}
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Tid du väljer att lägja per vecka</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TIDER.map((t) => (
                <button key={t.min} onClick={() => setTidPerVecka(t.min)} className={chip(tidPerVecka === t.min)}>
                  🕯️ {t.etikett}
                </button>
              ))}
            </div>
            <p className="mt-2 min-h-5 text-[11px] text-muted-foreground">Din tid är din — vi anpassar oss efter den.</p>
            <div className="mt-4 flex items-center justify-between">
              <button onClick={() => setSteg(1)} className="text-xs underline hover:text-gold">
                ← Tillbaka
              </button>
              <button disabled={!kanFortsatt2} onClick={() => setSteg(3)} className={fortsatt}>
                Fortsätt →
              </button>
            </div>
          </>
        )}

        {steg === 3 && (
          <>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Din nyfikenhet</p>
            <h2 className="mt-2 font-serif text-2xl font-bold">Vad lockar dig mest?</h2>
            <p className="mt-1 text-sm italic text-muted-foreground">Välj upp till tre — vi hjälper dig vidare därifrån.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {INTRESSEN_ALTERNATIV.map((i) => (
                <button
                  key={i}
                  onClick={() => {
                    const r = vaxla(intressen, i, MAX_INTRESSEN, "Tre intressen räcker långt — avvälj ett om du vill byta.");
                    setIntressen(r.lista);
                    setHint(r.hint);
                  }}
                  className={chip(intressen.includes(i))}
                >
                  {emoji(i)} {i}
                  {intressen.includes(i) && <span className="ml-1 text-gold">✦</span>}
                </button>
              ))}
            </div>
            <p className="mt-2 min-h-5 text-[11px] text-muted-foreground">
              {hint || "Dina val formar vad vi visar dig först."}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <button onClick={() => setSteg(2)} className="text-xs underline hover:text-gold">
                ← Tillbaka
              </button>
              <button disabled={!kanSpara} onClick={spara} className={fortsatt}>
                Sätt min kärna ✦
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 text-center">
        <button onClick={stang} className="text-[11px] underline hover:text-gold">
          Avbryt — välkommen tillbaka när du vill
        </button>
      </div>

      <style>{KARNACSS}</style>
    </div>
  );
}

const KARNACSS = `
@keyframes karnaFadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes karnaKonfetti {
  0% { transform: translateY(-16px) rotate(0deg) scale(1); opacity: 1; }
  100% { transform: translateY(360px) rotate(560deg) scale(0.7); opacity: 0; }
}
`;
