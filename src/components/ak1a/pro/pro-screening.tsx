"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { Bransch, KorstabbellRad } from "@/lib/portfolj-forskning/typer";
import { BRANSCHER } from "@/lib/portfolj-forskning/typer";
import { peerDragText, peerRankText } from "@/lib/portfolj-forskning/peer";
import {
  Akm1Chip,
  Akm2Cell,
  BRANSCH_NAMN,
  StatusChip,
  TackningChip,
  datumText,
  poangText,
  procentText,
} from "@/components/ak1a/portfolj-forskning/vag-stil";
import { PRO_SCREENINGAR_NYCKEL } from "@/components/ak1a/pro/morgonrond";

// ═══════════════════════════════════════════════════════════
// PRO-SCREENINGEN — B2B-varianten av korstabellmönstret
// (B2B-BESLUT §4b + §7 steg 3, våg 61 bygg-3).
//
// Korstabellen (portfolj-forskning/korstabell.tsx) är PRIVAT — denna variant
// ÅTERANVÄNDER dess visuella språk (vag-stil-chips: Akm1Chip, Akm2Cell,
// TackningChip, StatusChip + färgkoden) på rådgivarens egna villkor:
//   - FILTER på befintliga fält: status, bransch, AKM2-min, täckning-min,
//     peer-min (+ fritextsökning enligt korstabellens mönster)
//   - SORTERING på AKM1/AKM2/peer/täckning/golv (▾/▴ — korstabellens knappmönster)
//   - NAMNGIVNA SCREENINGAR: fyra fördefinierade + egna som sparas/laddas i
//     localStorage (pro-screeningar-v1) — G1-demo: ingen serverpersistens,
//     inga personuppgifter (dataminimeringen är teknisk spärr, inte policy)
//   - CSV-EXPORT: klient-side blob med svenska decimaler (komma) och
//     semikolon — rådgivarens eget urval, aldrig vidaredistribuerad rådata
//
// Data: lasKorstabellGrund-läsning (peer-berikad) passerad server-side —
// klienten får aldrig hämta 100 rader på egen hand (M3-principen).
//
// Hög poäng betyder bred underkänning av branschkolleget — ALDRIG köpläge.
// Pedagogisk forskning — inte investeringsrådgivning (2007:528).
// ═══════════════════════════════════════════════════════════

// ── Filter- och sorteringskontrakt (åäö-fria nycklar i localStorage) ────────

type StatusFilter = "alla" | KorstabbellRad["status"];

type FilterState = {
  status: StatusFilter;
  bransch: "alla" | Bransch;
  /** Sträng-input (svenskt decimalKomma tolereras) — tolkas vid användning. */
  akm2Min: string;
  tackningMin: string;
  peerMin: string;
  sok: string;
};

type SortNyckel = "akm1" | "akm2" | "peer" | "tackning" | "golv";
type SortRiktning = "desc" | "asc";

/** En sparad screening i localStorage — hela läget, inget mer. */
type SparadScreening = {
  id: string;
  namn: string;
  filter: FilterState;
  sortNyckel: SortNyckel;
  sortRiktning: SortRiktning;
};

const GRUNDFILTER: FilterState = {
  status: "alla",
  bransch: "alla",
  akm2Min: "",
  tackningMin: "",
  peerMin: "",
  sok: "",
};

/** De namngivna screeningarna — samma id:n som morgonrondens snabbfilter. */
const FORDEFINIERADE: Array<{
  id: string;
  namn: string;
  beskrivning: string;
  filter: FilterState;
  sortNyckel: SortNyckel;
  sortRiktning: SortRiktning;
}> = [
  {
    id: "grona",
    namn: "Gröna bolag",
    beskrivning: "Status grön — de strikta kraven uppfyllda i korstabellens mätningar.",
    filter: { ...GRUNDFILTER, status: "gron" },
    sortNyckel: "akm1",
    sortRiktning: "desc",
  },
  {
    id: "akm2topp",
    namn: "AKM2-topp",
    beskrivning: "AKM2-kompositen minst 70 av 100 — modulberikad poäng, högst först.",
    filter: { ...GRUNDFILTER, akm2Min: "70" },
    sortNyckel: "akm2",
    sortRiktning: "desc",
  },
  {
    id: "peertopp",
    namn: "Peer-topp",
    beskrivning: "Peer-percentil minst 75 inom branschen — bredast över kollegerna.",
    filter: { ...GRUNDFILTER, peerMin: "75" },
    sortNyckel: "peer",
    sortRiktning: "desc",
  },
  {
    id: "bredast",
    namn: "Bredast underlag",
    beskrivning: "Datatäckning minst 80 % — mätningarna som vilar på bredast data.",
    filter: { ...GRUNDFILTER, tackningMin: "80" },
    sortNyckel: "tackning",
    sortRiktning: "desc",
  },
];

// ── Hjälpare ────────────────────────────────────────────────────────────────

/** "70" / "72,5" → 70 / 72.5; tom eller ogiltig → null (filtret vilar). Exporterad för verktyg/testa-pro-screening.mjs. */
export function lasTalInput(s: string): number | null {
  const stadad = s.trim().replace(/\s/g, "").replace(",", ".");
  if (stadad === "" || !/^-?\d*\.?\d+$/.test(stadad)) return null;
  const n = Number(stadad);
  return Number.isFinite(n) ? n : null;
}

/** Svensk decimalform med fast antal decimaler: 28.05 → "28,1" (d=1). */
function komma(x: number, decimaler = 1): string {
  return x.toFixed(decimaler).replace(".", ",");
}

/** Sorteringsvärdet per nyckel — null/osatt sorterar alltid sist. Exporterad för verktyg/testa-pro-screening.mjs. */
export function sortVarde(r: KorstabbellRad, nyckel: SortNyckel): number {
  switch (nyckel) {
    case "akm2":
      return typeof r.akm2 === "number" && Number.isFinite(r.akm2) ? r.akm2 : -Infinity;
    case "peer": {
      const p = r.peer?.peerPercentil;
      return typeof p === "number" && Number.isFinite(p) && !r.peer?.osatt ? p : -Infinity;
    }
    case "tackning":
      return typeof r.datatackning === "number" && Number.isFinite(r.datatackning)
        ? r.datatackning * 100
        : -Infinity;
    case "golv":
      return typeof r.golvMarginal === "number" && Number.isFinite(r.golvMarginal)
        ? r.golvMarginal * 100
        : -Infinity;
    default:
      return Number.isFinite(r.akm1Totalt) ? r.akm1Totalt : -Infinity;
  }
}

/** CSV-fält: citattecken-dubblering gör namn med ; och " ofarliga. */
function csvFalt(v: string): string {
  return `"${v.replace(/"/g, '""')}"`;
}

/** Bygg CSV-dokumentet ur det filtrerade+sorterade urvalet — svenska decimaler. Exporterad för verktyg/testa-pro-screening.mjs. */
export function byggCsv(rader: KorstabbellRad[]): string {
  const rubriker = [
    "Ticker", "Namn", "Bransch", "Status", "AKM1", "AKM1-max", "AKM2", "AKM2-diff",
    "Peer-percentil", "Peer-rank", "Datatäckning %", "Golv-%", "Senast kontrollerad",
  ];
  const raderText = rader.map((r) => {
    const peer = r.peer && !r.peer.osatt ? r.peer : null;
    return [
      csvFalt(r.ticker),
      csvFalt(r.namn),
      csvFalt(BRANSCH_NAMN[r.bransch] ?? r.bransch),
      csvFalt(r.status),
      komma(r.akm1Totalt, 1),
      typeof r.akm1MaxMojligt === "number" ? komma(r.akm1MaxMojligt, 1) : "",
      typeof r.akm2 === "number" ? komma(r.akm2, 1) : "",
      typeof r.akm2Skillnad === "number" ? komma(r.akm2Skillnad, 1) : "",
      peer && peer.peerPercentil !== null ? komma(peer.peerPercentil, 0) : "",
      peer && peer.rank !== null && peer.antalIGruppen
        ? csvFalt(peerRankText(peer))
        : "",
      typeof r.datatackning === "number" ? komma(r.datatackning * 100, 1) : "",
      typeof r.golvMarginal === "number" ? komma(r.golvMarginal * 100, 1) : "",
      csvFalt(r.senastKontrollerad),
    ].join(";");
  });
  return [rubriker.map(csvFalt).join(";"), ...raderText].join("\r\n");
}

/** Läs localStorage-förrådet — tyst tom lista vid motstånd (aldrig krasch). */
function lasSparade(): SparadScreening[] {
  try {
    const rå = window.localStorage.getItem(PRO_SCREENINGAR_NYCKEL);
    if (!rå) return [];
    const lista = JSON.parse(rå) as unknown;
    if (!Array.isArray(lista)) return [];
    return lista.filter(
      (s): s is SparadScreening =>
        !!s && typeof s === "object" && typeof (s as SparadScreening).id === "string" &&
        typeof (s as SparadScreening).namn === "string" && !!(s as SparadScreening).filter,
    );
  } catch {
    return [];
  }
}

/** Skriv förrådet — skrivfel (privat läge m.m.) sugs tyst upp. */
function skrivSparade(lista: SparadScreening[]): void {
  try {
    window.localStorage.setItem(PRO_SCREENINGAR_NYCKEL, JSON.stringify(lista));
  } catch {
    // rådgivarens filtrering lever vidare i sessionen även utan persistens
  }
}

// ── Peer-cell (korstabellens mönster — percentil + rank-chip) ───────────────

function PeerCell({ rad }: { rad: KorstabbellRad }) {
  const p = rad.peer;
  if (!p || p.osatt || p.peerPercentil === null || p.rank === null) {
    const orsak = !p
      ? "peer ej beräknat för denna rad"
      : p.osattOrsak === "liten-grupp"
        ? `branschgruppen har ${p.antalIGruppen} bolag — under gränsen 5`
        : "bolagets AKM2-komposit saknas";
    return (
      <span
        className="font-mono text-sm font-bold text-muted-foreground"
        title={`Peer osatt — ${orsak}; motorn gissar aldrig`}
      >
        —
      </span>
    );
  }
  const branschNamn = BRANSCH_NAMN[p.bransch] ?? p.bransch;
  const titel =
    `Peer ${p.peerPercentil} · rank ${peerRankText(p)} i ${branschNamn} · ` +
    `AKM2 ${rad.akm2 ?? "—"} mot branschmedian ${poangText(p.branschMedian)} ` +
    `(drag ${peerDragText(p.peerDrag)}) · referens ${p.referens}. Läslager — påverkar aldrig poängen.`;
  return (
    <span className="tabular inline-flex items-baseline justify-end gap-1.5 leading-none" title={titel}>
      <span className="font-mono text-sm font-bold">{p.peerPercentil}</span>
      <span className="rounded-full border border-gold/30 bg-gold/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-gold">
        {peerRankText(p)}
      </span>
    </span>
  );
}

// ── Sorterbar kolumnrubrik (korstabellens knappmönster) ─────────────────────

function SortKnapp({
  etikett,
  nyckel,
  aktivNyckel,
  riktning,
  onClick,
  title,
}: {
  etikett: string;
  nyckel: SortNyckel;
  aktivNyckel: SortNyckel;
  riktning: SortRiktning;
  onClick: (n: SortNyckel) => void;
  title: string;
}) {
  const pil = aktivNyckel === nyckel ? (riktning === "desc" ? "▾" : "▴") : "↕";
  return (
    <button
      type="button"
      onClick={() => onClick(nyckel)}
      className="inline-flex items-center gap-1 font-semibold hover:text-gold"
      title={title}
    >
      {etikett} {pil}
    </button>
  );
}

// ── Komponenten ─────────────────────────────────────────────────────────────

export function ProScreening({ rader, skapad }: { rader: KorstabbellRad[]; skapad: string | null }) {
  const [filter, setFilter] = useState<FilterState>(GRUNDFILTER);
  const [sortNyckel, setSortNyckel] = useState<SortNyckel>("akm1");
  const [sortRiktning, setSortRiktning] = useState<SortRiktning>("desc");
  const [aktivScreening, setAktivScreening] = useState<string | null>(null);
  const [sparade, setSparade] = useState<SparadScreening[]>([]);
  const [sparaNamn, setSparaNamn] = useState("");
  const [sparaFel, setSparaFel] = useState<string | null>(null);

  // Init: localStorage + ev. ?screening=-länk (morgonrondens snabbfilter).
  // Körs ENDAST i useEffect — första passt är deterministiskt (hydration).
  useEffect(() => {
    const lista = lasSparade();
    setSparade(lista);
    try {
      const id = new URLSearchParams(window.location.search).get("screening");
      if (!id) return;
      const fordef = FORDEFINIERADE.find((f) => f.id === id);
      if (fordef) {
        setFilter(fordef.filter);
        setSortNyckel(fordef.sortNyckel);
        setSortRiktning(fordef.sortRiktning);
        setAktivScreening(fordef.id);
        return;
      }
      const egen = lista.find((s) => s.id === id);
      if (egen) {
        setFilter(egen.filter);
        setSortNyckel(egen.sortNyckel);
        setSortRiktning(egen.sortRiktning);
        setAktivScreening(egen.id);
      }
    } catch {
      // ogiltig query — grundläget gäller
    }
  }, []);

  /** Växla sortering inom kolumn (korstabellens mönster). */
  const valjSort = useCallback(
    (nyckel: SortNyckel) => {
      setSortRiktning((r) => (sortNyckel !== nyckel ? "desc" : r === "desc" ? "asc" : "desc"));
      setSortNyckel(nyckel);
    },
    [sortNyckel],
  );

  const filtrerade = useMemo(() => {
    const q = filter.sok.trim().toLowerCase();
    const akm2Min = lasTalInput(filter.akm2Min);
    const tackningMin = lasTalInput(filter.tackningMin);
    const peerMin = lasTalInput(filter.peerMin);
    return rader.filter((r) => {
      if (filter.status !== "alla" && r.status !== filter.status) return false;
      if (filter.bransch !== "alla" && r.bransch !== filter.bransch) return false;
      if (akm2Min !== null && !(typeof r.akm2 === "number" && r.akm2 >= akm2Min)) return false;
      if (
        tackningMin !== null &&
        !(typeof r.datatackning === "number" && r.datatackning * 100 >= tackningMin)
      )
        return false;
      if (peerMin !== null) {
        const p = r.peer;
        if (!p || p.osatt || p.peerPercentil === null || p.peerPercentil < peerMin) return false;
      }
      if (q) {
        const branschText = (BRANSCH_NAMN[r.bransch] ?? r.bransch).toLowerCase();
        if (
          !r.ticker.toLowerCase().includes(q) &&
          !r.namn.toLowerCase().includes(q) &&
          !branschText.includes(q)
        )
          return false;
      }
      return true;
    });
  }, [rader, filter]);

  const sorterade = useMemo(() => {
    const kopia = [...filtrerade];
    kopia.sort((a, b) =>
      sortRiktning === "desc"
        ? sortVarde(b, sortNyckel) - sortVarde(a, sortNyckel)
        : sortVarde(a, sortNyckel) - sortVarde(b, sortNyckel),
    );
    return kopia;
  }, [filtrerade, sortNyckel, sortRiktning]);

  const statusRakning = useMemo(() => {
    const n = { gron: 0, gul: 0, rod: 0, osatt: 0 } as Record<KorstabbellRad["status"], number>;
    for (const r of filtrerade) n[r.status] = (n[r.status] ?? 0) + 1;
    return n;
  }, [filtrerade]);

  const uppdateraFilter = useCallback((andel: Partial<FilterState>) => {
    setFilter((f) => ({ ...f, ...andel }));
    setAktivScreening(null); // manuellt filterläge — ingen namngiven screening är aktiv
  }, []);

  const rensa = useCallback(() => {
    setFilter(GRUNDFILTER);
    setAktivScreening(null);
  }, []);

  /** Applicera en namngiven screening (fördefinierad eller egen). */
  const applicera = useCallback((f: FilterState, nyckel: SortNyckel, riktning: SortRiktning, id: string) => {
    setFilter(f);
    setSortNyckel(nyckel);
    setSortRiktning(riktning);
    setAktivScreening(id);
  }, []);

  const spara = useCallback(() => {
    const namn = sparaNamn.trim();
    if (namn === "") {
      setSparaFel("Ge screeningen ett namn först.");
      return;
    }
    if (sparade.some((s) => s.namn.toLowerCase() === namn.toLowerCase())) {
      setSparaFel("En screening med det namnet finns redan i denna webbläsare.");
      return;
    }
    setSparaFel(null);
    const ny: SparadScreening = {
      id: `egen-${Date.now().toString(36)}`,
      namn: namn.slice(0, 40),
      filter,
      sortNyckel,
      sortRiktning,
    };
    const lista = [...sparade, ny];
    setSparade(lista);
    skrivSparade(lista);
    setSparaNamn("");
    setAktivScreening(ny.id);
  }, [sparaNamn, sparade, filter, sortNyckel, sortRiktning]);

  const radera = useCallback(
    (id: string) => {
      const lista = sparade.filter((s) => s.id !== id);
      setSparade(lista);
      skrivSparade(lista);
      if (aktivScreening === id) setAktivScreening(null);
    },
    [sparade, aktivScreening],
  );

  /** CSV-export — klient-side blob, svenska decimaler, semikolon. */
  const exporteraCsv = useCallback(() => {
    if (sorterade.length === 0) return;
    try {
      const csv = "\ufeff" + byggCsv(sorterade); // BOM — Excel läser åäö rätt
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const ankare = document.createElement("a");
      ankare.href = url;
      ankare.download = "ak1a-pro-screening.csv";
      document.body.appendChild(ankare);
      ankare.click();
      ankare.remove();
      URL.revokeObjectURL(url);
    } catch {
      setSparaFel("CSV-exporten misslyckades i webbläsaren — försök igen.");
    }
  }, [sorterade]);

  const harData = rader.length > 0;

  return (
    <section className="marin-panel overflow-hidden rounded-2xl border border-gold/40" aria-labelledby="pro-screening-rubrik">
      <header className="border-b border-gold/30 px-4 py-3 sm:px-6 sm:py-4">
        <h2
          id="pro-screening-rubrik"
          className="font-serif text-sm font-bold uppercase tracking-[0.18em] text-[#E8C766] sm:text-base"
        >
          SCREENINGEN
          <span className="ml-2 font-normal normal-case italic tracking-normal text-[#EDE6D6]/85">
            — {rader.length} bolag, dina filter, ditt urval
          </span>
        </h2>
      </header>
      <div className="hjarlinje" aria-hidden />

      <div className="bg-card p-4 sm:p-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Korstabellens {rader.length} mätta bolag — samma AKM1-total, AKM2-komposit,
          peer-percentil, täckning och golvmarginal som i forskningsläget, men på dina
          villkor: filtrera på status, bransch och minimivärden, sortera per kolumn och
          spara urvalet som en namngiven screening (webbläsarens egna minne — inget
          lämnar datorn). Exporten bär metodikens utdata med svenska decimaler — aldrig
          vidaredistribuerad rådata. Hög poäng betyder bred underkänning av
          branschkolleget — aldrig köpläge.
        </p>

        {harData ? (
          <>
            {/* ── Namngivna screeningar ── */}
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Namngivna screeningar
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {FORDEFINIERADE.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    title={f.beskrivning}
                    aria-pressed={aktivScreening === f.id}
                    onClick={() => applicera(f.filter, f.sortNyckel, f.sortRiktning, f.id)}
                    className={`min-h-[36px] rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                      aktivScreening === f.id
                        ? "border-gold bg-gold/25 text-gold"
                        : "border-gold/30 bg-gold/5 text-foreground hover:border-gold/60 hover:bg-gold/10"
                    }`}
                  >
                    {f.namn}
                  </button>
                ))}
                {sparade.map((s) => (
                  <span
                    key={s.id}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                      aktivScreening === s.id
                        ? "border-gold bg-gold/25 text-gold"
                        : "border-gold/30 bg-gold/5 text-foreground"
                    }`}
                    title="Egen sparad screening — filter + sortering återskapas bitidentiskt"
                  >
                    <button
                      type="button"
                      aria-pressed={aktivScreening === s.id}
                      onClick={() => applicera(s.filter, s.sortNyckel, s.sortRiktning, s.id)}
                      className="font-bold"
                    >
                      {s.namn}
                    </button>
                    <button
                      type="button"
                      onClick={() => radera(s.id)}
                      title={`Radera screeningen "${s.namn}" ur webbläsarens minne`}
                      aria-label={`Radera screeningen ${s.namn}`}
                      className="ml-0.5 text-muted-foreground hover:text-bear"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* ── Filterraden ── */}
            <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
              <label className="md:col-span-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Sök bolag, ticker eller bransch
                </span>
                <input
                  type="search"
                  value={filter.sok}
                  onChange={(e) => uppdateraFilter({ sok: e.target.value })}
                  placeholder="t.ex. Volvo, VOLV-B eller finans …"
                  className="mt-1 min-h-[44px] w-full rounded-lg border border-gold/30 bg-paper px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
              </label>
              <label>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
                <select
                  value={filter.status}
                  onChange={(e) => uppdateraFilter({ status: e.target.value as StatusFilter })}
                  className="mt-1 min-h-[44px] w-full rounded-lg border border-gold/30 bg-paper px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                >
                  <option value="alla">Alla</option>
                  <option value="gron">Gröna</option>
                  <option value="gul">Gula</option>
                  <option value="rod">Röda</option>
                  <option value="osatt">Osatta</option>
                </select>
              </label>
              <label>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Bransch</span>
                <select
                  value={filter.bransch}
                  onChange={(e) => uppdateraFilter({ bransch: e.target.value as FilterState["bransch"] })}
                  className="mt-1 min-h-[44px] w-full rounded-lg border border-gold/30 bg-paper px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                >
                  <option value="alla">Alla</option>
                  {BRANSCHER.map((b) => (
                    <option key={b} value={b}>{BRANSCH_NAMN[b]}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" title="AKM2-kompositen minst — modulberikad poäng 0–100">
                  AKM2 min
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={filter.akm2Min}
                  onChange={(e) => uppdateraFilter({ akm2Min: e.target.value })}
                  placeholder="t.ex. 70"
                  className="tabular mt-1 min-h-[44px] w-full rounded-lg border border-gold/30 bg-paper px-3 py-2 font-mono text-sm outline-none placeholder:font-sans placeholder:text-muted-foreground/70 focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" title="Datatäckning minst — andel av modellens vikt med dataunderlag">
                    Täckn. min %
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={filter.tackningMin}
                    onChange={(e) => uppdateraFilter({ tackningMin: e.target.value })}
                    placeholder="80"
                    className="tabular mt-1 min-h-[44px] w-full rounded-lg border border-gold/30 bg-paper px-3 py-2 font-mono text-sm outline-none placeholder:font-sans placeholder:text-muted-foreground/70 focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                </label>
                <label>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" title="Peer-percentil minst — rank inom branschen (grupp < 5 ⇒ osatt)">
                    Peer min
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={filter.peerMin}
                    onChange={(e) => uppdateraFilter({ peerMin: e.target.value })}
                    placeholder="75"
                    className="tabular mt-1 min-h-[44px] w-full rounded-lg border border-gold/30 bg-paper px-3 py-2 font-mono text-sm outline-none placeholder:font-sans placeholder:text-muted-foreground/70 focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                </label>
              </div>
            </div>

            {/* ── Sammanställning + spara + export ── */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-bold">
              <span className="rounded-full border border-bull/30 bg-bull/10 px-2 py-0.5 text-bull">
                {statusRakning.gron} gröna
              </span>
              <span className="rounded-full border border-gold/40 bg-gold/15 px-2 py-0.5 text-gold">
                {statusRakning.gul} gula
              </span>
              <span className="rounded-full border border-bear/30 bg-bear/10 px-2 py-0.5 text-bear">
                {statusRakning.rod} röda
              </span>
              <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-muted-foreground">
                {statusRakning.osatt} osatta
              </span>
              <span className="ml-auto text-[11px] font-normal italic text-muted-foreground">
                {sorterade.length} av {rader.length} bolag visas
                {skapad ? ` · underlag daterat ${datumText(skapad)}` : ""}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-end gap-2">
              <label className="min-w-[200px] flex-1 sm:max-w-xs">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Spara aktuellt urval som …
                </span>
                <input
                  type="text"
                  value={sparaNamn}
                  onChange={(e) => setSparaNamn(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && spara()}
                  placeholder="t.ex. Inför månadsmötet"
                  maxLength={40}
                  className="mt-1 min-h-[44px] w-full rounded-lg border border-gold/30 bg-paper px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
              </label>
              <button
                type="button"
                onClick={spara}
                className="btn-marin min-h-[44px] px-4 py-2.5 text-xs"
                title="Spara filter + sortering i webbläsarens localStorage (pro-screeningar-v1) — inget lämnar datorn"
              >
                Spara screening
              </button>
              <button
                type="button"
                onClick={rensa}
                className="min-h-[44px] rounded-md border border-gold/40 px-4 py-2.5 text-xs font-semibold hover:bg-gold/10"
              >
                Rensa filter
              </button>
              <button
                type="button"
                onClick={exporteraCsv}
                disabled={sorterade.length === 0}
                className="min-h-[44px] rounded-md bg-gold px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                title="Exportera det synliga urvalet som CSV — semikolon, svenska decimaler, BOM för Excel"
              >
                Exportera CSV ({sorterade.length})
              </button>
            </div>
            {sparaFel && <p className="mt-1.5 text-[11px] italic text-bear">{sparaFel}</p>}

            {/* ── Tabellen ── */}
            <div className="mt-4 overflow-x-auto scrollbar-ak1a rounded-xl border border-gold/30 bg-paper">
              <table className="w-full min-w-[1120px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gold/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="sticky left-0 z-10 border-r border-gold/15 bg-paper px-3 py-2 font-semibold">
                      Bolag
                    </th>
                    <th className="border-b border-gold/30 px-2 py-2 font-semibold">Bransch</th>
                    <th
                      className="border-b border-gold/30 px-2 py-2 text-right font-semibold"
                      aria-sort={sortNyckel === "akm1" ? (sortRiktning === "desc" ? "descending" : "ascending") : "none"}
                    >
                      <SortKnapp
                        etikett="AKM1"
                        nyckel="akm1"
                        aktivNyckel={sortNyckel}
                        riktning={sortRiktning}
                        onClick={valjSort}
                        title="Sortera på AKM1-totalen (0–100)"
                      />
                    </th>
                    <th className="border-b border-gold/30 px-2 py-2 text-right font-semibold">
                      <SortKnapp
                        etikett="AKM2"
                        nyckel="akm2"
                        aktivNyckel={sortNyckel}
                        riktning={sortRiktning}
                        onClick={valjSort}
                        title="Sortera på AKM2-kompositen — raknaAKM2 med automatiska branschmoduler (osatt sorterar sist)"
                      />
                    </th>
                    <th className="border-b border-gold/30 px-2 py-2 text-right font-semibold">
                      <SortKnapp
                        etikett="Peer"
                        nyckel="peer"
                        aktivNyckel={sortNyckel}
                        riktning={sortRiktning}
                        onClick={valjSort}
                        title="Sortera på peer-percentil inom branschen (osatt sorterar sist)"
                      />
                    </th>
                    <th className="border-b border-gold/30 px-2 py-2 text-center font-semibold">
                      <SortKnapp
                        etikett="Täckning"
                        nyckel="tackning"
                        aktivNyckel={sortNyckel}
                        riktning={sortRiktning}
                        onClick={valjSort}
                        title="Sortera på datatäckning — andel av modellens vikt med dataunderlag"
                      />
                    </th>
                    <th className="border-b border-gold/30 px-2 py-2 text-right font-semibold">
                      <SortKnapp
                        etikett="Golv-%"
                        nyckel="golv"
                        aktivNyckel={sortNyckel}
                        riktning={sortRiktning}
                        onClick={valjSort}
                        title="Sortera på golvmarginal — (värde − pris) / värde"
                      />
                    </th>
                    <th className="border-b border-gold/30 px-2 py-2 text-center font-semibold">Status</th>
                    <th className="border-b border-gold/30 px-2 py-2 font-semibold">Kontroll</th>
                  </tr>
                </thead>
                <tbody>
                  {sorterade.map((rad) => (
                    <tr key={rad.ticker} className="border-b border-gold/15 transition-colors hover:bg-gold/5">
                      <td className="sticky left-0 z-10 border-r border-gold/15 bg-paper px-3 py-2.5">
                        <span className="font-semibold">{rad.ticker}</span>
                        <span className="block max-w-[190px] truncate text-xs text-muted-foreground" title={rad.namn}>
                          {rad.namn}
                        </span>
                      </td>
                      <td className="px-2 py-2.5">
                        <span
                          className="rounded-full border border-gold/25 bg-gold/5 px-2 py-0.5 text-[10px] font-bold text-muted-foreground"
                          title={`Branschgruppen i korstabellens 10 × 10-struktur`}
                        >
                          {BRANSCH_NAMN[rad.bransch] ?? rad.bransch}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <Akm1Chip varde={rad.akm1Totalt} max={rad.akm1MaxMojligt} />
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <Akm2Cell varde={rad.akm2} skillnad={rad.akm2Skillnad} moduler={rad.akm2Moduler} />
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <PeerCell rad={rad} />
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <TackningChip tat={rad.datatackning} />
                      </td>
                      <td
                        className={`tabular px-2 py-2.5 text-right font-mono text-xs font-bold ${
                          rad.golvMarginal === null
                            ? "text-muted-foreground"
                            : rad.golvMarginal >= 0
                              ? "text-bull"
                              : "text-bear"
                        }`}
                        title="Golvmarginal — (värde − pris) / värde. Negativ marginal betyder att priset ligger över beräknat golv."
                      >
                        {procentText(rad.golvMarginal)}
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <StatusChip status={rad.status} />
                      </td>
                      <td className="px-2 py-2.5 text-xs text-muted-foreground" title={`Senast kontrollerad ${datumText(rad.senastKontrollerad)}`}>
                        {datumText(rad.senastKontrollerad)}
                      </td>
                    </tr>
                  ))}
                  {sorterade.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-4 text-center">
                        <p className="text-xs italic text-muted-foreground">
                          Inga bolag matchar filtren — lossa på minimivärdena (AKM2, täckning,
                          peer), välj Alla på status/bransch eller sök bredare.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-[11px] italic leading-relaxed text-muted-foreground">
              Kolumnerna bär samma färgspråk som korstabellen: AKM1/AKM2-band (grå → guld →
              marin), peer-rank i branschen (grupp &lt; 5 ⇒ osatt — läslager som aldrig
              påverkar poängen), täckningsband enligt D1 och status ur de strikta kraven.
              Sorteringen flyttar aldrig en poäng — bara din utsikt.
            </p>
          </>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-gold/30 bg-paper p-4 text-center text-xs italic text-muted-foreground">
            Underlaget saknas ännu — korstabellens mätningar har inte levererats. Motorn
            gissar aldrig: utan underlag finns inga bolag att screena.
          </p>
        )}

        {/* Disclaimer — 2007:528-låsraden (BESLUT §4) */}
        <p className="marin-unscope mt-4 rounded-xl border border-gold/30 bg-gold/10 p-3 text-center text-xs italic gold-text">
          Pedagogisk forskning — inte investeringsrådgivning (2007:528). Screening är ett
          studieunderlag, aldrig en köp- eller säljsignal; rådgivaren svarar för sin egen
          analys och lämplighetsprövning.
        </p>
      </div>
    </section>
  );
}
