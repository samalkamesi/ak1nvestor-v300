"use client";

import * as React from "react";

/**
 * VÅGFUNDAMENT — fundamentalvågornas 20×5-matris (VAGFUNDAMENT-SPEC P4/P7).
 * Rader = AKM1:s variabler V01–V20, kolumner = Mikro/Kort/Medellång/Lång/Mega.
 * Varje cell = variabelns EGEN våg: ▲ impulsvåg · ▼ korrigering · ◼ basbygge ·
 * · osatt (hederlig utdata när historik saknas). Nivå-badge (0–5) visar
 * AKM1-poängen; "osatt" när nivån inte kan beräknas Deterministiskt.
 * prisVager (AK1TS-klasser per horisont) är valfri — styrs då kors-läsningen
 * (divergens: fundamentalvåg + prisvåg) visas enligt P4.5.
 */

const HORIZONTER: Array<{ id: string; namn: string; hjalp: string }> = [
  { id: "mikro", namn: "Mikro", hjalp: "Senaste kvartalet mot föregående" },
  { id: "kort", namn: "Kort", hjalp: "Senaste kvartalet mot samma kvartal i fjol" },
  { id: "medellang", namn: "Medellång", hjalp: "Årstakt över tre år" },
  { id: "lang", namn: "Lång", hjalp: "Fem år" },
  { id: "mega", namn: "Mega", hjalp: "Hela tillgängliga historiken" },
];

const RADER: Array<{ id: string; namn: string; kategori: string }> = [
  { id: "V01", namn: "Försäljningstillväxt", kategori: "tillvaxt" },
  { id: "V02", namn: "ARR-tillväxt", kategori: "tillvaxt" },
  { id: "V03", namn: "Intäktsdiversifiering", kategori: "tillvaxt" },
  { id: "V04", namn: "P/S", kategori: "vardering" },
  { id: "V05", namn: "P/B", kategori: "vardering" },
  { id: "V06", namn: "EV/EBITDA", kategori: "vardering" },
  { id: "V07", namn: "Bruttomarginal", kategori: "lonsamhet" },
  { id: "V08", namn: "EBITDA-marginal", kategori: "lonsamhet" },
  { id: "V09", namn: "ROE", kategori: "lonsamhet" },
  { id: "V10", namn: "Skuldsättningsgrad", kategori: "stabilitet" },
  { id: "V11", namn: "Likviditet", kategori: "stabilitet" },
  { id: "V12", namn: "Intäktsstabilitet", kategori: "stabilitet" },
  { id: "V13", namn: "Patent & IP", kategori: "moat" },
  { id: "V14", namn: "Varumärke & Kundlojalitet", kategori: "moat" },
  { id: "V15", namn: "Nätverkseffekter", kategori: "moat" },
  { id: "V16", namn: "Produktlanseringar", kategori: "katalysator" },
  { id: "V17", namn: "Avtal & Partnerskap", kategori: "katalysator" },
  { id: "V18", namn: "Regulatoriska katalysatorer", kategori: "katalysator" },
  { id: "V19", namn: "Kassatäckning — nyemissionsrisk", kategori: "risk" },
  { id: "V20", namn: "Återköp av egna aktier", kategori: "risk" },
];

const KATEGORI_NAMN: Record<string, string> = {
  tillvaxt: "Tillväxt",
  vardering: "Värdering",
  lonsamhet: "Lönsamhet",
  stabilitet: "Stabilitet",
  moat: "Moat",
  katalysator: "Katalysator",
  risk: "Risk",
};

const HZ_NAMN: Record<string, string> = {
  mikro: "mikro",
  kort: "kort",
  medellang: "medellång",
  lang: "lång",
  mega: "mega",
};

type Indikator = {
  namn: string;
  niva: number | null;
  nivaKalla: "beraknad" | "osatt";
  nuvarde: number | null;
  enhet?: string | null;
  vager: Record<string, string>;
  momentum: Record<string, number | null>;
  medelBekraftad: Record<string, boolean | null>;
};

type Analys = {
  ticker: string;
  fel?: string;
  valuta?: string | null;
  dataPer?: string | null;
  indikatorer?: Record<string, Indikator>;
  kategorier?: Record<string, Record<string, number | null>>;
  total?: Record<string, number | null>;
  sammanfattning?: { impulsvag: number; korrigering: number; basbygge: number; osatt: number };
  notering?: string;
  disclaimer?: string;
};

function cellStil(klass: string): string {
  if (klass === "impulsvåg") return "border-bull/30 bg-bull/20 text-bull";
  if (klass === "korrigering") return "border-bear/30 bg-bear/20 text-bear";
  if (klass === "basbygge") return "border-gold/40 bg-gold/20 text-gold";
  return "border-border bg-muted/30 text-muted-foreground";
}

function cellIkon(klass: string): string {
  if (klass === "impulsvåg") return "▲";
  if (klass === "korrigering") return "▼";
  if (klass === "basbygge") return "◼";
  return "·";
}

function cellTitle(rad: { id: string; namn: string }, hz: string, ind: Indikator): string {
  const klass = ind.vager[hz];
  if (klass === "osatt") {
    return `${rad.id} ${rad.namn} · ${HZ_NAMN[hz]}: osatt — för lite historik för deterministisk klassning`;
  }
  const mom = ind.momentum[hz];
  const momText = mom == null ? "" : `momentum ${String(mom).replace(".", ",")}%`;
  const bek = ind.medelBekraftad[hz];
  const bekText = bek == null ? "" : bek ? " · medel-bekräftad" : " · ej medel-bekräftad";
  return `${rad.id} ${rad.namn} · ${HZ_NAMN[hz]}: ${klass} (${momText}${bekText})`;
}

function talFarg(tal: number | null | undefined): string {
  if (tal == null) return "text-muted-foreground";
  if (tal >= 0.5) return "text-bull";
  if (tal <= -0.5) return "text-bear";
  return "text-gold";
}

function talKlass(tal: number | null | undefined): string {
  if (tal == null) return "osatt";
  if (tal >= 0.5) return "impulsvåg";
  if (tal <= -0.5) return "korrigering";
  return "basbygge";
}

function formateraTal(tal: number | null | undefined): string {
  if (tal == null) return "·";
  return tal.toFixed(2).replace(".", ",");
}

export function VagfundamentMatris({
  ticker,
  prisVager,
}: {
  ticker: string;
  prisVager?: Record<string, string>;
}) {
  const [data, setData] = React.useState<Analys | null>(null);
  const [fel, setFel] = React.useState<string | null>(null);
  const [laddar, setLaddar] = React.useState(true);

  React.useEffect(() => {
    let aktiv = true;
    setLaddar(true);
    setFel(null);
    setData(null);
    fetch("/api/vagfundament", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tickers: [ticker] }),
    })
      .then((r) => r.json())
      .then((j: { tickers?: Analys[]; error?: string }) => {
        if (!aktiv) return;
        const a = j?.tickers?.[0];
        if (!a || a.fel) {
          setFel(a?.fel || j?.error || "Ingen fundamentaldata kunde hämtas");
        } else {
          setData(a);
        }
      })
      .catch(() => {
        if (aktiv) setFel("Kunde inte hämta fundamentalvågor — försök igen");
      })
      .finally(() => {
        if (aktiv) setLaddar(false);
      });
    return () => {
      aktiv = false;
    };
  }, [ticker]);

  // P4.5 — divergens: fundamental impulsvåg + pris korrigering (värde-signal att studera)
  const divergenser = React.useMemo(() => {
    if (!prisVager || !data?.total) return [];
    const ut: Array<{ hz: string; text: string }> = [];
    for (const h of HORIZONTER) {
      const pris = prisVager[h.id];
      const fund = data.total[h.id];
      if (pris == null || fund == null) continue;
      if (fund >= 0.5 && pris === "korrigering") {
        ut.push({
          hz: HZ_NAMN[h.id],
          text: `Fundamental impulsvåg + pris korrigering på ${HZ_NAMN[h.id]} — värde-signal att studera`,
        });
      } else if (fund <= -0.5 && pris === "impulsvåg") {
        ut.push({
          hz: HZ_NAMN[h.id],
          text: `Fundamental korrigering + pris impulsvåg på ${HZ_NAMN[h.id]} — priset springer ifrån fundamentet`,
        });
      }
    }
    return ut;
  }, [prisVager, data]);

  if (laddar) {
    return (
      <div className="rounded-lg border border-border bg-card p-6" aria-busy="true">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 animate-pulse rounded-full bg-gold" />
          <p className="text-sm text-muted-foreground">
            Hämtar fundamentalvågor för {ticker} …
          </p>
        </div>
        <div className="mt-4 space-y-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="h-7 flex-1 animate-pulse rounded bg-muted/50" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (fel || !data) {
    return (
      <div className="rounded-lg border border-bear/30 bg-bear/5 p-6">
        <p className="font-serif text-sm font-bold text-bear">Fundamentalvågor kunde inte beräknas</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {fel || "Okänt fel"} — kontrollera tickern och försök igen. Motorn gissar aldrig:
          utan data finns ingen våg att läsa.
        </p>
      </div>
    );
  }

  const s = data.sammanfattning;

  return (
    <div className="space-y-4">
      {/* Rubrikrad */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
            Fundamentalvågorna · 20 variabler × 5 horisonter
          </p>
          <h3 className="mt-1 font-serif text-2xl font-bold">
            {data.ticker}
            {data.valuta ? <span className="ml-2 text-sm font-normal text-muted-foreground">({data.valuta})</span> : null}
          </h3>
          {data.dataPer ? (
            <p className="text-xs text-muted-foreground">Senaste rapport i underlaget: {data.dataPer}</p>
          ) : null}
        </div>
        {s ? (
          <div className="rounded-md border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
            {s.impulsvag} impulsvåg · {s.korrigering} korrigering · {s.basbygge} basbygge · {s.osatt} osatt
          </div>
        ) : null}
      </div>

      {/* Värmematrisen — mobil: svep sidled i scroll-wrappern; nivå- och V-kolumnen fryser vid vänsterkanten */}
      <p className="text-[11px] italic text-muted-foreground sm:hidden">
        Svep matrisen sidled — V-kolumnen följer med →
      </p>
      <div className="overflow-x-auto scrollbar-ak1a">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[52px_190px_repeat(5,1fr)] gap-1">
            {/* Mobilsäker matris: fryst hörn över nivå-kolumnen */}
            <div className="sticky left-0 z-20 bg-card" />
            <div className="sticky left-[52px] z-10 -ml-1 border-r border-border/60 bg-card" />
            {HORIZONTER.map((h) => (
              <div key={h.id} className="pb-1 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {h.namn}
              </div>
            ))}
            {RADER.map((rad) => {
              const ind = data.indikatorer?.[rad.id];
              return (
                <React.Fragment key={rad.id}>
                  <div
                    className="sticky left-0 z-20 flex items-center justify-center bg-card"
                    title={
                      ind?.nivaKalla === "beraknad"
                        ? `AKM1-nivå ${ind?.niva} av 5 (beräknad)`
                        : "AKM1-nivå: osatt — kan inte beräknas deterministiskt ur dataunderlaget"
                    }
                  >
                    <span
                      className={
                        "flex h-6 min-w-6 items-center justify-center rounded border px-1 text-[10px] font-bold " +
                        (ind?.niva == null
                          ? "border-border bg-muted/30 text-muted-foreground"
                          : "border-gold/40 bg-gold/10 text-gold")
                      }
                    >
                      {ind?.niva == null ? "–" : ind.niva}
                    </span>
                  </div>
                  {/* Sticky V-kolumn: -ml-1 + pl-1 täcker grid-gapen så inget läcker igenom vid scroll */}
                  <div className="sticky left-[52px] z-10 -ml-1 flex items-center truncate border-r border-border/60 bg-card pl-1 pr-2 text-right text-xs" title={`${rad.id} ${rad.namn} · kategori ${KATEGORI_NAMN[rad.kategori]}`}>
                    <span className="truncate">
                      <span className="font-bold">{rad.id}</span>{" "}
                      <span className="text-muted-foreground">{rad.namn}</span>
                    </span>
                  </div>
                  {HORIZONTER.map((h) => {
                    const klass = ind?.vager?.[h.id] || "osatt";
                    return (
                      <div
                        key={h.id}
                        title={ind ? cellTitle(rad, h.id, ind) : `${rad.id} · ${h.namn}: osatt`}
                        className={
                          "flex h-8 cursor-default items-center justify-center rounded border text-sm font-bold leading-none transition-opacity hover:opacity-80 " +
                          cellStil(klass)
                        }
                      >
                        {cellIkon(klass)}
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
        <span className="flex items-center gap-1.5"><span className="text-bull">▲</span> impulsvåg</span>
        <span className="flex items-center gap-1.5"><span className="text-bear">▼</span> korrigering</span>
        <span className="flex items-center gap-1.5"><span className="text-gold">◼</span> basbygge</span>
        <span className="flex items-center gap-1.5"><span className="text-muted-foreground">·</span> osatt</span>
        {/* Hover-tips är pekaren-oberoende: döljs på mobil, svep-hint står vid matrisen */}
        <span className="hidden text-muted-foreground sm:inline">Hovra över en cell för momentum och medel-bekräftelse</span>
      </div>

      {/* Kategorisammanfattning + totalrad (P4 hierarkin steg 3–4) */}
      {data.kategorier ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Kategorisammanfattning · 7 kategorier
          </p>
          <div className="mt-2 overflow-x-auto scrollbar-ak1a">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {/* Fryst kategorikolumn (mobil) — opak bg-card krävs för sticky */}
                  <th className="sticky left-0 bg-card pb-1 text-left font-semibold">Kategori</th>
                  {HORIZONTER.map((h) => (
                    <th key={h.id} className="pb-1 text-center font-semibold">{h.namn}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(KATEGORI_NAMN).map(([kid, namn]) => (
                  <tr key={kid} className="border-t border-border/60">
                    <td className="sticky left-0 bg-card py-1.5 pr-2 font-serif text-xs font-bold">{namn}</td>
                    {HORIZONTER.map((h) => {
                      const tal = data.kategorier?.[kid]?.[h.id];
                      return (
                        <td key={h.id} className="py-1.5 text-center" title={`${namn} · ${HZ_NAMN[h.id]}: ${talKlass(tal)} (${formateraTal(tal)})`}>
                          <span className={"text-xs font-bold " + talFarg(tal)}>{formateraTal(tal)}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {data.total ? (
                  <tr className="border-t-2 border-gold/40 bg-gold/5">
                    <td className="sticky left-0 bg-card py-2 pr-2 font-serif text-sm font-bold">AKM1-helhet</td>
                    {HORIZONTER.map((h) => {
                      const tal = data.total?.[h.id];
                      return (
                        <td key={h.id} className="py-2 text-center" title={`Total fundamentalvågsbild · ${HZ_NAMN[h.id]}: ${talKlass(tal)}`}>
                          <span className={"text-sm font-bold " + talFarg(tal)}>{formateraTal(tal)}</span>
                        </td>
                      );
                    })}
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Kategorivärden är medelvärden per horisont; helhetsraden viktas med AKM1:s
            kategorivikter. Skala −1,00 till +1,00 — ju närmare ±1,00, desto bredare
            samstämmighet bland variablerna.
          </p>
        </div>
      ) : null}

      {/* Divergensnot — kors-läsning mot AK1TS prisvågor (P4.5), endast vid prisVager */}
      {prisVager && divergenser.length > 0 ? (
        <div className="rounded-lg border border-gold/40 bg-gold/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
            Kors-läsning fundamental × pris
          </p>
          <ul className="mt-2 space-y-1">
            {divergenser.map((d) => (
              <li key={d.hz} className="text-sm leading-snug">
                <span className="mr-1.5 text-gold">◆</span>
                {d.text}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Divergens är en inbjudan att studera — aldrig köp- eller säljsignal.
          </p>
        </div>
      ) : null}

      {/* Notering + disclaimer (P8) */}
      <div className="space-y-1">
        {data.notering ? (
          <p className="text-[11px] leading-relaxed text-muted-foreground">{data.notering}</p>
        ) : null}
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {data.disclaimer || "Pedagogiskt verktyg — inte investeringsråd."}
        </p>
      </div>
    </div>
  );
}
