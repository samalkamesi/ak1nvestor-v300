"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { datumText } from "@/components/ak1a/portfolj-forskning/vag-stil";
import type { TraffUtsnitt } from "@/components/ak1a/pro/morgonrond-data";

/**
 * MORNONRONDEN — /pro-översiktens fyra kort (B2B-BESLUT §4a + §7 steg 3).
 *
 * Rådgivarens arbetsordning börjar här: marknadens läge FÖRE klienternas.
 * Kort-grid-DNA:t ärvs från trafik-sakerhet-panelen (grid → 2 → 4 kort,
 * label + stor tabular siffra); väggarna är PRO-skalets marin + guld.
 *
 * KORT 1 · TRÄFF-% — vågvalideringens rullande träff redovisas som den är:
 *   ett öppet kvitto om det förflutna, aldrig garanti om framtiden (§10).
 *   Data server-side ur data/rapporter/vagvalidering-SENASTE.md (ingen
 *   läs-API finns — morgonrond-data.ts äger tolkningen).
 * KORT 2 · REGIM — /api/forskningslage:s toppnivåfält `regim`: AKM3:s
 *   deterministiska beskrivning ur den hash-kedjade regime-loggen
 *   (hysteres + 2-snapshots-bekräftelse) + N-vakt-status.
 * KORT 3 · VECKANS RESEARCH — forskningslage.veckansBolag (deterministisk
 *   hash ur ISO-veckonumret — samma vecka ⇒ samma bolag).
 * KORT 4 · SCREENING — vägen in i /pro/analys med tre namngivna
 *   snabbfilter (gröna · AKM2-topp · peer-topp) + räknare av rådgivarens
 *   sparade screeningar (localStorage pro-screeningar-v1 — G1, ingen
 *   serverpersistens i MVP).
 *
 * Hydration-säkert (forskningslage-kortets mönster): kort 2–3 börjar som
 * skelett och fylls i useEffect; kort 1 har sin data från servern vid
 * första passt. ALLT är pedagogisk forskning — inte investeringsrådgivning
 * (2007:528); korten BESKRIVER underlaget per dess eget datum, de dömer
 * aldrig och innehåller aldrig signalverb.
 */

/** localStorage-nyckel för rådgivarens sparade screeningar (pro-screening.tsx äger formatet). */
export const PRO_SCREENINGAR_NYCKEL = "pro-screeningar-v1";

// ── Svartyper (defensiva speglingar — aldrig import-typ från API-routen) ─────

/** /api/forskningslage `regim` — åäö-fria nycklar, loggradens form. */
type RegimUtsnitt = {
  regime: string;
  datum: string;
  beskrivning: string;
  modellVersion: string;
  indikatorer?: {
    gronAndel?: number | null;
    rodAndel?: number | null;
    nettoVagbredd?: number | null;
    sigmaArs?: number | null;
    antalVagbolag?: number | null;
  } | null;
};

/** /api/forskningslage `lage` — morgonronden behöver bara veckans bolag + datering. */
type LageUtsnitt = {
  antal: number;
  grona: number;
  roda: number;
  veckansBolag: {
    veckonr: number;
    text: string;
    bolag: {
      ticker: string;
      namn: string;
      bransch: string;
      akm1Totalt: number;
      akm1MaxMojligt: number | null;
    } | null;
  };
  senastKontrollerad: string;
};

/** Sanera /api/forskningslage-svaret — null när strukturen saknas (P3: vila, aldrig gissa). */
function rensaSvar(rå: unknown): { lage: LageUtsnitt | null; regim: RegimUtsnitt | null } {
  if (!rå || typeof rå !== "object") return { lage: null, regim: null };
  const s = rå as Record<string, unknown>;
  const fin = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);

  let lage: LageUtsnitt | null = null;
  if (s.finns === true && s.lage && typeof s.lage === "object") {
    const l = s.lage as Record<string, unknown>;
    const v = (l.veckansBolag ?? {}) as Record<string, unknown>;
    const b = (v.bolag ?? null) as Record<string, unknown> | null;
    lage = {
      antal: fin(l.antal) ? l.antal : 0,
      grona: fin(l.grona) ? l.grona : 0,
      roda: fin(l.roda) ? l.roda : 0,
      veckansBolag: {
        veckonr: fin(v.veckonr) ? v.veckonr : 0,
        text: typeof v.text === "string" ? v.text : "",
        bolag:
          b && typeof b.ticker === "string" && b.ticker.trim() !== ""
            ? {
                ticker: b.ticker,
                namn: typeof b.namn === "string" && b.namn.trim() !== "" ? b.namn : b.ticker,
                bransch: typeof b.bransch === "string" ? b.bransch : "",
                akm1Totalt: fin(b.akm1Totalt) ? b.akm1Totalt : 0,
                akm1MaxMojligt: fin(b.akm1MaxMojligt) && b.akm1MaxMojligt > 0 ? b.akm1MaxMojligt : null,
              }
            : null,
      },
      senastKontrollerad: typeof l.senastKontrollerad === "string" ? l.senastKontrollerad : "",
    };
  }

  let regim: RegimUtsnitt | null = null;
  if (s.regim && typeof s.regim === "object") {
    const r = s.regim as Record<string, unknown>;
    if (typeof r.regime === "string" && r.regime.trim() !== "") {
      const i = (r.indikatorer ?? null) as Record<string, unknown> | null;
      const tal = (x: unknown): number | null | undefined =>
        x === null || x === undefined ? (x === null ? null : undefined) : fin(x) ? x : null;
      regim = {
        regime: r.regime,
        datum: typeof r.datum === "string" ? r.datum : "",
        beskrivning: typeof r.beskrivning === "string" ? r.beskrivning : "",
        modellVersion: typeof r.modellVersion === "string" ? r.modellVersion : "",
        indikatorer: i
          ? {
              gronAndel: tal(i.gronAndel),
              rodAndel: tal(i.rodAndel),
              nettoVagbredd: tal(i.nettoVagbredd),
              sigmaArs: tal(i.sigmaArs),
              antalVagbolag: tal(i.antalVagbolag),
            }
          : null,
      };
    }
  }
  return { lage, regim };
}

// ── Kortens gemensamma skal (trafik-panelens kort-DNA, PRO-väggar) ───────────

function Kort({
  etikett,
  ikon,
  children,
}: {
  etikett: string;
  ikon: string;
  children: React.ReactNode;
}) {
  return (
    <article className="flex flex-col rounded-xl border border-gold/30 bg-card p-4">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-guld-djup">
        <span className="text-sm" aria-hidden>{ikon}</span>
        {etikett}
      </p>
      <div className="mt-2.5 flex-1">{children}</div>
    </article>
  );
}

/** Skelett-rad för laddningsläget (hydration-säkert första passt). */
function Skelett({ rader = 3 }: { rader?: number }) {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: rader }, (_, i) => (
        <div key={i} className="h-3.5 animate-pulse rounded bg-gold/10" style={{ width: `${88 - i * 18}%` }} />
      ))}
    </div>
  );
}

// ── Kort 1: Träff-% ──────────────────────────────────────────────────────────

/** Horisont-raden i tooltippet: "mikro: impulsvåg 75 % (n=4) · basbygge 63 % (n=8)". */
function horisontTooltip(perHorisont: TraffUtsnitt["perHorisont"]): string {
  if (perHorisont.length === 0) return "";
  const rader = perHorisont.map((h) => {
    const cell = (c: { procent: number; n: number } | null, namn: string) =>
      c ? `${namn} ${c.procent} % (n=${c.n})` : null;
    return `${h.horisont}: ` + [cell(h.impulsvag, "impulsvåg"), cell(h.korrigering, "korrigering"), cell(h.basbygge, "basbygge")].filter(Boolean).join(" · ");
  });
  return ` Träff-% per horisont och klass — ${rader.join(" | ")}.`;
}

function TraffKort({ traff }: { traff: TraffUtsnitt | null }) {
  if (!traff) {
    return (
      <Kort etikett="Vågvalidering · träff-%" ikon="🎯">
        <p className="text-xs italic leading-relaxed text-muted-foreground">
          Ingen valideringsrapport levererad ännu — träff-% redovisas när
          vågmotorn hunnit dömas mot verkligheten. Motorn gissar aldrig.
        </p>
      </Kort>
    );
  }
  const tooltip =
    `Vågvalideringens rullande träff: ${traff.totaltProcent} % av ${traff.domda} dömda mätningar ` +
    `(osatta ${traff.osattaProcent} % av alla mätningar räknas aldrig som fel)` +
    horisontTooltip(traff.perHorisont) +
    ". Öppet kvitto om det förflutna — aldrig garanti om framtiden.";
  return (
    <Kort etikett="Vågvalidering · träff-%" ikon="🎯">
      <p className="flex items-baseline gap-2" title={tooltip}>
        <span className="tabular font-serif text-4xl font-black text-foreground">{traff.totaltProcent}&nbsp;%</span>
        <span className="text-[11px] text-muted-foreground">träff</span>
      </p>
      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
        n={traff.domda} dömda · osatta {traff.osattaProcent}&nbsp;%
        {traff.raknareSedan ? ` · sedan ${datumText(traff.raknareSedan)}` : ""}
      </p>
      <p className="mt-2 border-t border-gold/15 pt-1.5 font-mono text-[9px] uppercase tracking-wider text-guld-djup">
        Öppet kvitto — ej garanti
      </p>
    </Kort>
  );
}

// ── Kort 2: Regim ────────────────────────────────────────────────────────────

/** "0,07" → "7 %" (andelar ur indikatorerna — deterministiskt format). */
function andelText(v: number | null | undefined): string {
  if (typeof v !== "number" || !Number.isFinite(v)) return "—";
  return `${Math.round(v * 100)} %`;
}

function RegimKort({ regim }: { regim: RegimUtsnitt | null }) {
  if (!regim) {
    return (
      <Kort etikett="AKM3-regim" ikon="🧭">
        <p className="text-xs italic leading-relaxed text-muted-foreground">
          Regimen vilar — ingen bekräftad regimbeskrivning finnes i loggen.
          Hon tiger hellre än gissar.
        </p>
      </Kort>
    );
  }
  const i = regim.indikatorer ?? null;
  const nVakt =
    i && typeof i.nettoVagbredd === "number"
      ? `N ${i.nettoVagbredd >= 0 ? "+" : "−"}${String(Math.abs(i.nettoVagbredd)).replace(".", ",")}`
      : "N osatt";
  const tooltip =
    `${regim.beskrivning} Deskriptiv lägesbeskrivning av forskningsunderlaget` +
    (regim.datum ? ` per ${datumText(regim.datum)}` : "") +
    " — indikatorer och trösklar redovisas öppet på /transparens. Inte investeringsråd.";
  return (
    <Kort etikett="AKM3-regim" ikon="🧭">
      <p className="flex flex-wrap items-baseline gap-x-2" title={tooltip}>
        <span className="font-serif text-2xl font-black capitalize tracking-tight text-foreground">
          {regim.regime}
        </span>
        {regim.datum && (
          <span className="text-[11px] text-muted-foreground">per {datumText(regim.datum)}</span>
        )}
      </p>
      <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground" title={regim.beskrivning}>
        {regim.beskrivning || "Kännetecknande beskrivning ur regime-loggen (hash-kedjad, hysteres-bekräftad)."}
      </p>
      {i && (
        <p className="mt-2 flex flex-wrap gap-x-3 border-t border-gold/15 pt-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span title="Grönandel — andel bolag som klarar de strikta kraven">
            Gröna <span className="tabular font-mono font-bold text-foreground">{andelText(i.gronAndel)}</span>
          </span>
          <span title="Rödandel — andel bolag med brutna strikta krav">
            Röda <span className="tabular font-mono font-bold text-foreground">{andelText(i.rodAndel)}</span>
          </span>
          <span title="Netto-vågbredden (N-vakten) — osatt under 30 mätta vågbolag">
            {nVakt}
          </span>
        </p>
      )}
    </Kort>
  );
}

// ── Kort 3: Veckans research ────────────────────────────────────────────────

function VeckansKort({ lage }: { lage: LageUtsnitt | null }) {
  if (!lage) {
    return (
      <Kort etikett="Veckans research" ikon="🔬">
        <Skelett rader={2} />
      </Kort>
    );
  }
  const v = lage.veckansBolag;
  return (
    <Kort etikett="Veckans research" ikon="🔬">
      {v.bolag ? (
        <>
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-serif text-xl font-black leading-tight text-foreground">{v.bolag.namn}</span>
            <span className="font-mono text-[11px] font-bold text-muted-foreground">{v.bolag.ticker}</span>
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Vecka {v.veckonr} · {v.bolag.bransch ? `${v.bolag.bransch} · ` : ""}AKM1{" "}
            <span className="tabular font-mono font-bold text-foreground">
              {String(v.bolag.akm1Totalt).replace(".", ",")}
              {v.bolag.akm1MaxMojligt ? ` av max ${String(v.bolag.akm1MaxMojligt).replace(".", ",")}` : ""}
            </span>
          </p>
          <p className="mt-2 border-t border-gold/15 pt-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            {lage.grona} gröna av {lage.antal} · samma vecka ⇒ samma bolag
          </p>
        </>
      ) : (
        <p className="text-xs italic leading-relaxed text-muted-foreground">{v.text || "Inget bolag klarar de strikta kraven ännu."}</p>
      )}
    </Kort>
  );
}

// ── Kort 4: Screening ───────────────────────────────────────────────────────

/** Tre namngivna snabbfilter — samma id:n som pro-screening.tsx:s fördefinierade. */
const SNABBFILTER = [
  { id: "grona", namn: "Gröna" },
  { id: "akm2topp", namn: "AKM2-topp" },
  { id: "peertopp", namn: "Peer-topp" },
] as const;

function ScreeningKort({ antalSparade }: { antalSparade: number | null }) {
  return (
    <Kort etikett="Dina screeningar" ikon="🔍">
      <p className="text-xs leading-relaxed text-muted-foreground">
        {antalSparade === null ? (
          "Läser dina sparade screeningar …"
        ) : antalSparade === 0 ? (
          <>Ingen sparad screening ännu — bygg ett filter i Analys och spara det.</>
        ) : (
          <>
            <span className="tabular font-mono text-lg font-black text-foreground">{antalSparade}</span>{" "}
            sparad{antalSparade === 1 ? "" : "e"} screening{antalSparade === 1 ? "" : "ar"} i denna webbläsare.
          </>
        )}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {SNABBFILTER.map((f) => (
          <Link
            key={f.id}
            href={`/pro/analys?screening=${f.id}`}
            className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-[10px] font-bold text-gold transition-colors hover:bg-gold/20"
            title={`Öppna den namngivna screeningens ${f.namn.toLowerCase()} i Analys-vyn`}
          >
            {f.namn}
          </Link>
        ))}
      </div>
      <Link
        href="/pro/analys"
        className="mt-2.5 inline-block border-t border-gold/15 pt-1.5 text-[11px] font-semibold text-gold hover:underline"
      >
        Öppna screeningen →
      </Link>
    </Kort>
  );
}

// ── Morgonronden ─────────────────────────────────────────────────────────────

export function Morgonrond({ traff }: { traff: TraffUtsnitt | null }) {
  const [lage, setLage] = useState<LageUtsnitt | null>(null);
  const [regim, setRegim] = useState<RegimUtsnitt | null>(null);
  const [hamtat, setHamtat] = useState(false);
  const [antalSparade, setAntalSparade] = useState<number | null>(null);

  // Nät + localStorage ENDAST i useEffect — första passt är deterministiskt.
  useEffect(() => {
    let aktiv = true;
    (async () => {
      try {
        const kontroll = new AbortController();
        const tidtagning = setTimeout(() => kontroll.abort(), 8000);
        const res = await fetch("/api/forskningslage", {
          signal: kontroll.signal,
          headers: { Accept: "application/json" },
        });
        clearTimeout(tidtagning);
        if (!aktiv) return;
        if (res.ok) {
          const rensat = rensaSvar(await res.json());
          setLage(rensat.lage);
          setRegim(rensat.regim);
        }
      } catch {
        // korten vilar i sina saknas-tillstånd — inget påhittas
      } finally {
        if (aktiv) setHamtat(true);
      }
    })();
    return () => {
      aktiv = false;
    };
  }, []);

  // Räkna sparade screeningar (G1: localStorage, ingen serverpersistens).
  useEffect(() => {
    try {
      const rå = window.localStorage.getItem(PRO_SCREENINGAR_NYCKEL);
      const lista = rå ? (JSON.parse(rå) as unknown) : [];
      setAntalSparade(Array.isArray(lista) ? lista.length : 0);
    } catch {
      setAntalSparade(0);
    }
  }, []);

  return (
    <section className="marin-panel overflow-hidden rounded-2xl border border-gold/40" aria-labelledby="morgonrond-rubrik">
      <header className="border-b border-gold/30 px-4 py-3 sm:px-6 sm:py-4">
        <h2
          id="morgonrond-rubrik"
          className="font-serif text-sm font-bold uppercase tracking-[0.18em] text-[#E8C766] sm:text-base"
        >
          MORNONRONDEN
          <span className="ml-2 font-normal normal-case italic tracking-normal text-[#EDE6D6]/85">
            — marknadens läge före klienternas, på fem sekunder
          </span>
        </h2>
      </header>
      <div className="hjarlinje" aria-hidden />

      <div className="bg-card p-4 sm:p-6">
        {/* Kort-grid: 1 → 2 → 4 (trafik-panelens DNA) */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TraffKort traff={traff} />
          {hamtat ? <RegimKort regim={regim} /> : (
            <Kort etikett="AKM3-regim" ikon="🧭"><Skelett rader={3} /></Kort>
          )}
          {hamtat ? <VeckansKort lage={lage} /> : (
            <Kort etikett="Veckans research" ikon="🔬"><Skelett rader={3} /></Kort>
          )}
          <ScreeningKort antalSparade={antalSparade} />
        </div>

        <p className="marin-unscope mt-4 rounded-xl border border-gold/30 bg-gold/10 p-3 text-center text-xs italic gold-text">
          Pedagogisk forskning — inte investeringsrådgivning (2007:528). Korten beskriver
          daterade underlag; regimen och träff-% är kvitto, aldrig signal.
        </p>
      </div>
    </section>
  );
}
