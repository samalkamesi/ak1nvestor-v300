"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Forskningslage, ForskningslageBolag } from "@/lib/forskningslaget";

/**
 * FORSKNINGSLÄGE-KORTET (M3 — STYRELSE-mega-integration).
 *
 * Korstabellens 100-bolagsforskning når eleven som ett marin-panel-kort:
 * andel-grön-donut (grön/gul/röd ur statusreglerna), topp-3 gröna med länk
 * in i forskningsbiblioteket, deterministisk marknadsläge-text (fasta
 * trösklar i src/lib/forskningslaget.ts) och P6:s datering — "uppdateras
 * med forskningsronderna", aldrig "just nu på börsen" (ärlighetsprincipen).
 *
 * Hämtar GET /api/forskningslage (server-side sammanfattning, cache 1 h —
 * klienten får aldrig de 100 råa raderna). Monteras på Min Sida (efter
 * morgon-briefingen) och i toppen av /portfolj-forskning.
 *
 * REGIM-CHIPPET (våg 60 bygg-A, AKM3-BESLUT §8 steg 5): AKM3:s determinis-
 * tiska regimebeskrivning ur API:ts additiva `regim`-fält (senaste raden i
 * den hash-kedjade regime-loggen — hysteres + 2-snapshots-bekräftelse).
 * Chipet BESKRIVER underlaget per dess eget datum — det väljer aldrig
 * profil, ändrar aldrig poäng och innehåller aldrig signalverb (2007:528).
 * Saknas fältet vilar chippet osynligt (P3 — inget påhittat läge).
 *
 * Beskriver, dömer aldrig — pedagogisk forskning, inte investeringsråd
 * (lagen 2007:528). Hydration-säkert: första passt är ett skelett, nätet
 * körs ENDAST i useEffect.
 */

/** Svar från GET /api/forskningslage — städas defensivt innan visning. */
type ApiSvar = { finns: boolean; lage: Forskningslage | null; regim?: RegimeChip | null };

/** AKM3-regimens utsnitt ur API-svaret (åäö-fria nycklar — loggradens form). */
type RegimeChip = {
  regime: string;
  datum: string;
  beskrivning: string;
  modellVersion: string;
};

/** Regimetiketterna i kanonisk ordning — övriga/ogiltiga värden visas inte. */
const REGIM_ETIKETTER = ["balanserad", "expansiv", "magert", "korrigering", "osatt"] as const;

function arFin(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

/** Okänd JSON → rent regime-utsnitt (eller null — tyst, graceful). */
function renRegim(rå: unknown): RegimeChip | null {
  if (!rå || typeof rå !== "object") return null;
  const r = rå as Record<string, unknown>;
  if (typeof r.regime !== "string" || !(REGIM_ETIKETTER as readonly string[]).includes(r.regime)) return null;
  return {
    regime: r.regime,
    datum: typeof r.datum === "string" ? r.datum : "",
    beskrivning: typeof r.beskrivning === "string" ? r.beskrivning : "",
    modellVersion: typeof r.modellVersion === "string" ? r.modellVersion : "",
  };
}

/** Okänd JSON → ren ForskningslageBolag (eller null — tyst, graceful). */
function renBolag(rå: unknown): ForskningslageBolag | null {
  if (!rå || typeof rå !== "object") return null;
  const b = rå as Record<string, unknown>;
  if (typeof b.ticker !== "string" || !b.ticker.trim()) return null;
  return {
    ticker: b.ticker.trim(),
    namn: typeof b.namn === "string" && b.namn.trim() ? b.namn.trim() : b.ticker.trim(),
    bransch: typeof b.bransch === "string" ? b.bransch : "",
    akm1Totalt: arFin(b.akm1Totalt) ? b.akm1Totalt : 0,
    akm1MaxMojligt: arFin(b.akm1MaxMojligt) && b.akm1MaxMojligt > 0 ? b.akm1MaxMojligt : null,
    andelAvMax: arFin(b.andelAvMax) ? b.andelAvMax : null,
  };
}

/** Okänd JSON → ren Forskningslage (eller null när struktur saknas). */
function renLage(rå: unknown): Forskningslage | null {
  if (!rå || typeof rå !== "object") return null;
  const l = rå as Record<string, unknown>;
  if (!arFin(l.antal) || !arFin(l.grona) || !arFin(l.gula) || !arFin(l.roda)) return null;
  const vBolagRå = l.veckansBolag as Record<string, unknown> | undefined;
  return {
    antal: l.antal,
    grona: l.grona,
    gula: l.gula,
    roda: l.roda,
    osatta: arFin(l.osatta) ? l.osatta : 0,
    andelGrona: arFin(l.andelGrona) ? l.andelGrona : 0,
    andelGronaProcent: arFin(l.andelGronaProcent) ? l.andelGronaProcent : 0,
    typ:
      l.typ === "rikt" || l.typ === "balanserat" || l.typ === "magert" || l.typ === "osatt"
        ? l.typ
        : "osatt",
    marknadslage: typeof l.marknadslage === "string" ? l.marknadslage : "",
    topp: Array.isArray(l.topp) ? l.topp.map(renBolag).filter((b): b is ForskningslageBolag => b !== null) : [],
    veckansBolag: {
      veckonr: vBolagRå && arFin(vBolagRå.veckonr) ? vBolagRå.veckonr : 0,
      bolag: vBolagRå ? renBolag(vBolagRå.bolag) : null,
      text: vBolagRå && typeof vBolagRå.text === "string" ? vBolagRå.text : "",
    },
    senastKontrollerad: typeof l.senastKontrollerad === "string" ? l.senastKontrollerad : "",
  };
}

/** Ett anrop till /api/forskningslage. Null vid motstånd — kortet vilar. */
async function hamtaForskningslage(): Promise<{
  lage: Forskningslage | null;
  regim: RegimeChip | null;
} | null> {
  try {
    const kontroll = new AbortController();
    const tidtagning = setTimeout(() => kontroll.abort(), 8000);
    const res = await fetch("/api/forskningslage", {
      signal: kontroll.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(tidtagning);
    if (!res.ok) return null;
    const data = (await res.json()) as ApiSvar;
    if (!data) return null;
    return {
      lage: data.finns === true ? renLage(data.lage) : null,
      regim: renRegim(data.regim),
    };
  } catch {
    return null;
  }
}

/** "2026-09-03" → "3 sep. 2026" (svenska). Ogiltigt datum → strängen syns som den är. */
function datumText(datum: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) return datum;
  const d = new Date(`${datum}T12:00:00`); // middag = tidszons-säkert datum
  if (Number.isNaN(d.getTime())) return datum;
  return new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

/** "58,1" — svenska decimaler för AKM1-poängen. */
function talText(n: number): string {
  return n.toLocaleString("sv-SE", { maximumFractionDigits: 1 });
}

// ── Donut: grön/gul/röd andel av korstabellen (deterministisk SVG) ───────────

const DONUT_FARGER = { gron: "#34D399", gul: "#E8C766", rod: "#F87171" } as const;
const DONUT_R = 30;
const DONUT_C = 2 * Math.PI * DONUT_R;

function Donut({ lage }: { lage: Forskningslage }) {
  const total = Math.max(1, lage.antal);
  const andel = (n: number) => (n / total) * DONUT_C;
  // Tre segment från 12-timet (behållaren roteras -90°): grön → gul → röd.
  const segGron = andel(lage.grona);
  const segGul = andel(lage.gula);
  const segRod = andel(lage.roda);
  const offsetGul = -segGron;
  const offsetRod = -(segGron + segGul);

  return (
    <div className="relative shrink-0">
      <svg
        viewBox="0 0 72 72"
        className="h-28 w-28 -rotate-90"
        role="img"
        aria-label={`Forskningslägets fördelning: ${lage.grona} gröna, ${lage.gula} gula, ${lage.roda} röda av ${lage.antal} bolag`}
      >
        <circle cx="36" cy="36" r={DONUT_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
        {segGron > 0 && (
          <circle
            cx="36" cy="36" r={DONUT_R} fill="none"
            stroke={DONUT_FARGER.gron} strokeWidth="7" strokeLinecap="butt"
            strokeDasharray={`${segGron} ${DONUT_C - segGron}`} strokeDashoffset={0}
          />
        )}
        {segGul > 0 && (
          <circle
            cx="36" cy="36" r={DONUT_R} fill="none"
            stroke={DONUT_FARGER.gul} strokeWidth="7" strokeLinecap="butt"
            strokeDasharray={`${segGul} ${DONUT_C - segGul}`} strokeDashoffset={offsetGul}
          />
        )}
        {segRod > 0 && (
          <circle
            cx="36" cy="36" r={DONUT_R} fill="none"
            stroke={DONUT_FARGER.rod} strokeWidth="7" strokeLinecap="butt"
            strokeDasharray={`${segRod} ${DONUT_C - segRod}`} strokeDashoffset={offsetRod}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-lg font-black leading-none" style={{ color: DONUT_FARGER.gron }}>
          {lage.andelGronaProcent}&nbsp;%
        </span>
        <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-[#EDE6D6]/60">gröna</span>
      </div>
    </div>
  );
}

// ── Regim-chippet (våg 60 bygg-A): AKM3:s deskriptiva lägesbeskrivning ───────

/**
 * Chippet är en ren BESKRIVNING av underlaget per dess eget datum — inga
 * signalverb, inga färgkoder som låter som råd; betydelsen bärs av ordet
 * + dateringen + tooltipen med den kännetecknande texten (2007:528).
 */
function RegimChip({ regim }: { regim: RegimeChip }) {
  const daterad = regim.datum ? ` per ${datumText(regim.datum)}` : "";
  const tooltip =
    (regim.beskrivning ? regim.beskrivning + " " : "") +
    "Deskriptiv lägesbeskrivning av forskningsunderlaget" + daterad +
    " — indikatorer och trösklar redovisas öppet på /transparens. Inte investeringsråd.";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-gold/35 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gold-soft"
      title={tooltip}
      role="status"
      aria-label={`AKM3-regim: ${regim.regime}${daterad}. ${regim.beskrivning}`}
    >
      AKM3-regim · {regim.regime}
      {regim.datum ? <span className="font-semibold normal-case tracking-normal text-[#EDE6D6]/55">{daterad.trim()}</span> : null}
    </span>
  );
}

// ── Kortet ───────────────────────────────────────────────────────────────────

export function ForskningslageKort() {
  const [lage, setLage] = useState<Forskningslage | null>(null);
  const [regim, setRegim] = useState<RegimeChip | null>(null);
  const [hamtat, setHamtat] = useState(false);

  // Nät ENDAST i useEffect — första passt är ett deterministiskt skelett.
  useEffect(() => {
    let aktiv = true;
    (async () => {
      const svar = await hamtaForskningslage();
      if (!aktiv) return;
      setLage(svar ? svar.lage : null);
      setRegim(svar ? svar.regim : null);
      setHamtat(true);
    })();
    return () => {
      aktiv = false;
    };
  }, []);

  // Skelett under första passt (server + klient ger samma markup).
  if (!hamtat) {
    return (
      <section
        className="marin-panel relative overflow-hidden rounded-2xl border border-gold/40 p-6 sm:p-8"
        aria-hidden="true"
      >
        <div className="h-3 w-28 animate-pulse rounded bg-gold/10" />
        <div className="mt-3 h-7 w-56 animate-pulse rounded bg-gold/10" />
        <div className="mt-5 flex items-center gap-5">
          <div className="h-28 w-28 animate-pulse rounded-full bg-gold/10" />
          <div className="flex-1 space-y-2.5">
            <div className="h-4 w-full animate-pulse rounded bg-gold/10" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-gold/10" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gold/10" />
          </div>
        </div>
      </section>
    );
  }

  // Vila-läge: underlaget ej levererat — ärlighet, aldrig påhittade siffror.
  if (!lage) {
    return (
      <section className="marin-panel relative overflow-hidden rounded-2xl border border-gold/40 p-6 sm:p-8">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold-soft">Forskningsläget</p>
        <h2 className="mt-2 font-serif text-xl font-bold tracking-tight text-gold-soft sm:text-2xl">
          Grundunderlaget mäts upp
        </h2>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#EDE6D6]/70">
          Korstabellens 100-bolagsmätningar har inte levererats ännu — läget
          redovisas först när forskningsronderna finns på plats. Vi hittar aldrig
          på siffror.
        </p>
      </section>
    );
  }

  return (
    <section
      className="marin-panel relative overflow-hidden rounded-2xl border border-gold/40 p-6 sm:p-8"
      aria-labelledby="forskningslage-rubrik"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold-soft">Forskningsläget</p>
            <h2
              id="forskningslage-rubrik"
              className="mt-2 font-serif text-xl font-bold tracking-tight text-gold-soft sm:text-2xl"
            >
              {lage.grona} gröna av {lage.antal} bolag
            </h2>
            {regim && (
              <div className="mt-2.5">
                <RegimChip regim={regim} />
              </div>
            )}
          </div>
          <Link
            href="/portfolj-forskning"
            className="rounded-lg border border-gold/40 px-4 py-2 text-xs font-semibold text-gold-soft transition-colors hover:bg-gold/10"
          >
            Till korstabellen →
          </Link>
        </div>

        <div className="mt-5 grid items-center gap-6 md:grid-cols-[auto_1fr]">
          {/* Donut + legend */}
          <div className="flex items-center gap-4">
            <Donut lage={lage} />
            <ul className="space-y-1.5 text-[11px]">
              {[
                { farg: DONUT_FARGER.gron, etikett: "Gröna — klarar de strikta kraven", tal: lage.grona },
                { farg: DONUT_FARGER.gul, etikett: "Gula — på väg", tal: lage.gula },
                { farg: DONUT_FARGER.rod, etikett: "Röda — under tröskeln", tal: lage.roda },
              ].map((l) => (
                <li key={l.etikett} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: l.farg }} />
                  <span className="font-bold text-[#EDE6D6]">{l.tal}</span>
                  <span className="text-[#EDE6D6]/60">{l.etikett}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Marknadsläge-text + topp-3 */}
          <div className="min-w-0">
            <p className="rounded-xl border border-gold/25 bg-white/5 p-3.5 text-xs leading-relaxed text-[#EDE6D6]">
              {lage.marknadslage}
            </p>

            {lage.topp.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#EDE6D6]/50">
                  Topp-3 i forskningsurvalet
                </p>
                <ol className="mt-2 divide-y divide-gold/10">
                  {lage.topp.map((b, i) => (
                    <li key={b.ticker} className="py-2">
                      <Link
                        href={`/forskningsbiblioteket/${encodeURIComponent(b.ticker)}`}
                        className="group flex items-baseline gap-2.5"
                      >
                        <span className="font-serif text-sm font-black text-gold">{i + 1}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-[#EDE6D6] group-hover:text-gold-soft group-hover:underline">
                            {b.namn}
                          </span>
                          <span className="text-[11px] text-[#EDE6D6]/55">
                            {b.ticker}
                            {b.bransch ? ` · ${b.bransch}` : ""} · AKM1 {talText(b.akm1Totalt)}
                            {b.akm1MaxMojligt !== null ? ` av max ${talText(b.akm1MaxMojligt)}` : ""}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Footer: datering + aktualitet + juridisk fotnot */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-gold/10 pt-4">
          <span className="text-[11px] text-[#EDE6D6]/55">
            {lage.senastKontrollerad
              ? `Senast kontrollerad ${datumText(lage.senastKontrollerad)} · uppdateras med forskningsronderna`
              : "Uppdateras med forskningsronderna"}
          </span>
          <span className="ml-auto text-[11px] text-[#EDE6D6]/45">
            Pedagogisk forskning — inte investeringsråd.
          </span>
        </div>
      </div>
    </section>
  );
}
