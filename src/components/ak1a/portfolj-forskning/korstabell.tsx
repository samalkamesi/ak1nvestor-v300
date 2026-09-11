"use client";

import { Fragment, useMemo, useState } from "react";
import type { Bransch, KorstabbellRad, VagKlass } from "@/lib/portfolj-forskning/typer";
import { raknaIntervall, spannText } from "@/lib/akm3/osakerhet";
import { peerDragText, peerRankText } from "@/lib/portfolj-forskning/peer";
import { HonestyTag } from "@/components/ak1a/primitives";
import { lasKorstabellRader } from "./korstabell-leverantor";
import {
  Akm1Chip,
  Akm2Cell,
  BRANSCH_NAMN,
  DYNAMIK_TEXT,
  DynamikPil,
  HZ_VISNING,
  KATEGORIER,
  STATUS_TEXT,
  StatusChip,
  TackningChip,
  VAG_TEXT,
  VagCell,
  datumText,
  grupperaBranscher,
  kategoriPoang,
  poangText,
  procentText,
  type KorstabellSortNyckel,
} from "./vag-stil";

// ═══════════════════════════════════════════════════════════
// KORSTABELLEN — 10 bästa bolag per bransch, allt på ett bräde.
// Rader = bolag grupperade per bransch (10 sektioner), kolumner:
//   AKM1-total + AKM2-komposit med differens-chip (våg 57 D2) +
//   peer-percentil inom branschen (VÅG 59, AKM3 steg 4) +
//   7 kategoripoäng + fundamental vågklass på 5 horisonter (+
//   sammanvägd dynamik) + teknisk vågklass på 5 horisonter +
//   golvmarginal + kravstatus.
// Poäng-chipsen bär osäkerhetsintervallets ensidiga felstreck
// (VÅG 59, AKM3 steg 3): spann [K–övre] i tooltip/aria — nedre
// gräns är alltid poängen själv, modellen gissar aldrig.
// Vågcellerna bär kunddirektivets färgspråk: impulsvåg ↗
// grönmörk, korrigering ↘ koppar, basbygge → gråblå, osatt · grå.
// Allt är pedagogisk forskning — aldrig investeringsråd.
// ═══════════════════════════════════════════════════════════

/** Total antal kolumner i tabellen (för colSpan i grupperubriker). */
const ANTAL_KOLUMNER = 1 + 1 + 1 + 1 + 1 + KATEGORIER.length + (HZ_VISNING.length + 1) + HZ_VISNING.length + 1 + 1;

/** Säker vågklass-läsning — saknad nyckel redovisas alltid som osatt. */
function vag(record: Record<string, VagKlass> | undefined, horisont: string): VagKlass {
  const v = record?.[horisont];
  return v === "impulsvag" || v === "korrigering" || v === "basbygge" ? v : "osatt";
}

/** Status-räkning för sammanställningen överst. */
function raknaStatus(rader: KorstabbellRad[]): Record<KorstabbellRad["status"], number> {
  const n = { gron: 0, gul: 0, rod: 0, osatt: 0 } as Record<KorstabbellRad["status"], number>;
  for (const r of rader) n[r.status] = (n[r.status] ?? 0) + 1;
  return n;
}

// ── Peer (VÅG 59, AKM3 steg 4 — r3 §4.1) ────────────────────────────────────

/**
 * Peer-cell: percentil inom branschen + rank-chip ("4/10"). Tooltippet bär
 * branschdrag, per-variabel-sammanfattning, referensdatum OCH de aktiva
 * branschmodulerna (medianerna speglar modulviktningar — konfund-en deklareras
 * i visningen, BESLUT §6). Osatt vid grupp < 5 eller saknad akm2 — aldrig
 * gissning. LÄSLAGER: påverkar aldrig poäng eller sortering av portföljbygget.
 */
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
        title={`Peer osatt — ${orsak}; motorn gissar aldrig (grupp < 5 eller saknad komposit)`}
      >
        <span className="sr-only">Peer: osatt — </span>—
      </span>
    );
  }
  const branschNamn = BRANSCH_NAMN[p.bransch] ?? p.bransch;
  const modulText =
    rad.akm2Moduler && rad.akm2Moduler.length > 0
      ? ` Aktiva moduler: ${rad.akm2Moduler.join(" · ")}.`
      : "";
  const titel =
    `Peer ${p.peerPercentil} · rank ${peerRankText(p)} i ${branschNamn} · ` +
    `AKM2 ${rad.akm2 ?? "—"} mot branschmedian ${poangText(p.branschMedian)} (drag ${peerDragText(p.peerDrag)}) · ` +
    `variabler: ${p.overMedian} över · ${p.iNiva} i nivå · ${p.underMedian} under · ` +
    `referens ${p.referens}.${modulText} Branschmedianer speglar modulviktningarna — ` +
    "peer är ett läslager som aldrig påverkar poängen.";
  return (
    <span className="tabular inline-flex items-baseline justify-end gap-1.5 leading-none" title={titel}>
      <span className="font-mono text-sm font-bold">{p.peerPercentil}</span>
      <span className="rounded-full border border-gold/30 bg-gold/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-gold">
        {peerRankText(p)}
      </span>
      <span className="sr-only">{` — peer-percentil ${p.peerPercentil} av 100, rank ${peerRankText(p)} i ${branschNamn}`}</span>
    </span>
  );
}

// ── Mobil: bolagskort ───────────────────────────────────────────────────────

function BolagsKort({ rad }: { rad: KorstabbellRad }) {
  // VÅG 59 (AKM3 steg 3): spannet utskrivet på mobilkortet — r4 §3.1.
  const intervall = raknaIntervall(rad.akm1Totalt, rad.datatackning, rad.portV19);
  return (
    <div className="rounded-xl border border-gold/30 bg-paper p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold">{rad.ticker}</span>
            <span title={`Senast kontrollerad ${datumText(rad.senastKontrollerad)}`}>
              <HonestyTag kind="matt" />
            </span>
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {rad.namn} · {BRANSCH_NAMN[rad.bransch] ?? rad.bransch}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <Akm1Chip
            varde={rad.akm1Totalt}
            max={rad.akm1MaxMojligt}
            intervall={raknaIntervall(rad.akm1Totalt, rad.datatackning, rad.portV19)}
          />
          <Akm2Cell
            varde={rad.akm2}
            skillnad={rad.akm2Skillnad}
            moduler={rad.akm2Moduler}
            intervall={raknaIntervall(rad.akm2 ?? null, rad.datatackning, rad.portV19)}
          />
          <StatusChip status={rad.status} />
        </span>
      </div>

      {intervall && (
        <p
          className="mt-2 text-[10px] leading-relaxed text-muted-foreground"
          title={intervall.note}
        >
          Spann {spannText(intervall)} · täckning {Math.round(intervall.tackning * 100)} %
          {intervall.portTakad ? " · hård port: övre gräns 45" : ""}
        </p>
      )}

      {rad.peer && !rad.peer.osatt && rad.peer.peerPercentil !== null && (
        <p
          className="mt-1 text-[10px] leading-relaxed text-muted-foreground"
          title={`AKM2 ${rad.akm2 ?? "—"} mot branschmedian ${poangText(rad.peer.branschMedian)} (drag ${peerDragText(rad.peer.peerDrag)}) · referens ${rad.peer.referens}`}
        >
          Peer {rad.peer.peerPercentil} · rank {peerRankText(rad.peer)} i{" "}
          {BRANSCH_NAMN[rad.bransch] ?? rad.bransch}
        </p>
      )}

      {(rad.akm2Moduler?.length ?? 0) > 0 && (
        <p
          className="mt-2 truncate text-[10px] leading-relaxed text-muted-foreground"
          title={`AKM2-moduler aktiverade för branschen ${BRANSCH_NAMN[rad.bransch] ?? rad.bransch}: ${(rad.akm2Moduler ?? []).join(" · ")}`}
        >
          AKM2-moduler: {(rad.akm2Moduler ?? []).length} aktiva för branschen
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-gold/15 pt-2">
        {KATEGORIER.map((k) => (
          <div key={k.nyckel} className="flex items-baseline justify-between gap-2 border-b border-gold/10 pb-0.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.namn}</span>
            <span className="tabular font-mono text-xs font-bold">{poangText(kategoriPoang(rad, k))}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-2 border-t border-gold/15 pt-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Fundamental · dynamik {DYNAMIK_TEXT[rad.fvagDynamik].toLowerCase()}
          </p>
          <div className="mt-1 flex items-center gap-1">
            {HZ_VISNING.map((h) => (
              <VagCell
                key={h.id}
                klass={vag(rad.fvagPerHorisont, h.id)}
                titel={`${rad.ticker} · fundamental ${h.namn.toLowerCase()} (${h.hjalp}): ${VAG_TEXT[vag(rad.fvagPerHorisont, h.id)]}`}
              />
            ))}
            <DynamikPil dynamik={rad.fvagDynamik} />
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Teknisk</p>
          <div className="mt-1 flex items-center gap-1">
            {HZ_VISNING.map((h) => (
              <VagCell
                key={h.id}
                klass={vag(rad.tvagPerHorisont, h.id)}
                titel={`${rad.ticker} · teknisk ${h.namn.toLowerCase()}: ${VAG_TEXT[vag(rad.tvagPerHorisont, h.id)]}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-gold/15 pt-2 text-xs">
        <span
          className="text-[10px] uppercase tracking-wider text-muted-foreground"
          title="Datatäckning — andel av modellens vikt med dataunderlag"
        >
          Täckning
        </span>
        <TackningChip tat={rad.datatackning} />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Golvmarginal</span>
        <span
          className={`tabular font-mono font-bold ${
            rad.golvMarginal === null
              ? "text-muted-foreground"
              : rad.golvMarginal >= 0
                ? "text-bull"
                : "text-bear"
          }`}
        >
          {procentText(rad.golvMarginal)}
        </span>
      </div>
      <p className="mt-1.5 text-[10px] italic text-muted-foreground">
        Kontrollerad {datumText(rad.senastKontrollerad)} · {STATUS_TEXT[rad.status].lang.toLowerCase()}
      </p>
    </div>
  );
}

// ── Komponenten ─────────────────────────────────────────────────────────────

export function Korstabell({ rader }: { rader?: KorstabbellRad[] }) {
  // VÅG 63 bygg-2 (optimering #1): rader kan komma via prop (demo-
  // wrapper) ELLER via KorstabellLeverantorns kontext (sidan — rader-
  // kedjan serialiseras en gång i flighten i stället för en per mottagare).
  const raderFranKontext = lasKorstabellRader();
  const allaRader = rader ?? raderFranKontext ?? [];
  const [sok, setSok] = useState("");
  const [sort, setSort] = useState<"desc" | "asc" | null>(null);
  const [sortNyckel, setSortNyckel] = useState<KorstabellSortNyckel>("akm1");
  // Kollapsade branscher (VÅG 63 bygg-2, optimering #1): SSR levererar
  // som standard 10 gruppade rader i stället för 100 bolagsrader ×2
  // vyer (mobilkort + tabell) — bolagen renderas först när besökaren
  // vecklar ut branschen. Aktiv sökning vecklar upp automatiskt (en
  // sökträff måste synas utan extra klick).
  const [oppnaBranscher, setOppnaBranscher] = useState<ReadonlySet<Bransch>>(() => new Set());
  const sokAktiv = sok.trim().length > 0;
  const arOppen = (b: Bransch) => sokAktiv || oppnaBranscher.has(b);
  const vaxlaBransch = (b: Bransch) =>
    setOppnaBranscher((forr) => {
      const nu = new Set(forr);
      if (nu.has(b)) nu.delete(b);
      else nu.add(b);
      return nu;
    });

  /** Växla sortering inom vald kolumn (AKM1, AKM2 eller Peer — VÅG 59). */
  function valjSort(nyckel: KorstabellSortNyckel) {
    setSortNyckel(nyckel);
    setSort((s) => (s === null || sortNyckel !== nyckel ? "desc" : s === "desc" ? "asc" : "desc"));
  }

  const filtrerade = useMemo(() => {
    const q = sok.trim().toLowerCase();
    if (!q) return allaRader;
    return allaRader.filter(
      (r) =>
        r.ticker.toLowerCase().includes(q) ||
        r.namn.toLowerCase().includes(q) ||
        (BRANSCH_NAMN[r.bransch] ?? r.bransch).toLowerCase().includes(q),
    );
  }, [allaRader, sok]);

  const grupper = useMemo(
    () => grupperaBranscher(filtrerade, sort, sortNyckel),
    [filtrerade, sort, sortNyckel],
  );
  const statusRakning = useMemo(() => raknaStatus(filtrerade), [filtrerade]);
  const harData = allaRader.length > 0;
  const traffar = filtrerade.length;
  const oppnaGrupper = grupper.filter((g) => arOppen(g.bransch)).length;

  return (
    <section className="marin-panel overflow-hidden rounded-2xl border border-gold/40">
      <header className="border-b border-gold/30 px-4 py-3 sm:px-6 sm:py-4">
        <h3 className="font-serif text-sm font-bold uppercase tracking-[0.18em] text-[#E8C766] sm:text-base">
          KORSTABELLEN
          <span className="ml-2 font-normal normal-case italic tracking-normal text-[#EDE6D6]/85">
            — tio bolag per bransch, AKM1 och vågor sida vid sida
          </span>
        </h3>
      </header>
      <div className="hjarlinje" aria-hidden />

      <div className="bg-card p-4 sm:p-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Här redovisas hur AKM1-siffrorna ser ut för varje bolag: totalpoäng, sju kategoripoäng,
          den fundamentala vågklassen på fem tidshorisonter med riktning (dynamik-pilen — var vi är
          på väg), den tekniska vågklassen på samma horisonter samt golvmarginal och kravstatus.
          AKM2-kolumnen (våg 57 D2) visar kompositen ur raknaAKM2 — kärnans V01–V20 med
          automatiskt aktiverade branschmoduler (V21+) och viktprofilen akm2-2026 — och chippet
          under varje total är differensen mot AKM1-radens publicerade total. Peer-kolumnen
          (VÅG 59) rankar kompositen inom branschgruppen: 60 i teknik är inte 60 i finans.
          Poäng-chipsen bär ett ensidigt felstreck — osäkerhetsintervallet [poäng–övre] som
          växer med saknad datatäckning (AKM3 steg 3): spannet står i tooltippet, modellen
          gissar aldrig. Hög poäng betyder bred underkänning av branschkolleget — aldrig köpläge.
          Branscherna är ihopfällda som standard (snabbare sida — bolagsraderna
          är tunga); klicka på en branschrubrik för att veckla ut dess bolag,
          eller sök direkt på bolag/ticker/bransch — sökträffar fälls upp av
          sig själva.
        </p>

        {harData && (
          <>
            {/* Sökfält + statussammanställning */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="min-w-[200px] flex-1">
                <span className="sr-only">Sök bolag, ticker eller bransch</span>
                <input
                  type="search"
                  value={sok}
                  onChange={(e) => setSok(e.target.value)}
                  placeholder="Sök bolag, ticker eller bransch …"
                  className="min-h-[44px] w-full rounded-lg border border-gold/30 bg-paper px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
              </label>
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
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
              </div>
            </div>
            <p className="mt-1.5 text-[11px] italic text-muted-foreground">
              {traffar} av {allaRader.length} bolag i {grupper.length}{" "}
              {grupper.length === 1 ? "branschsektion" : "branschsektioner"} ·{" "}
              {oppnaGrupper} utfällda · klicka på en branschrubrik för att veckla ut dess bolag ·
              klicka på AKM1-, AKM2- eller Peer-kolumnen för att sortera inom varje bransch.
            </p>
          </>
        )}

        {/* Mobil (412px): kort-lista — ingen sidled scroll. Kollapsad per
            bransch som standard (VÅG 63 bygg-2): korten renderas först när
            gruppen fälls ut — mobilkort-läget är kvar, bara gömt bakom
            rubriken tills besökaren ber om bolagen. */}
        {harData && (
          <div className="mt-4 space-y-2 sm:hidden">
            {grupper.map((grupp) => {
              const oppet = arOppen(grupp.bransch);
              return (
                <div key={grupp.bransch}>
                  <BranschRubrikMob
                    bransch={grupp.bransch}
                    rader={grupp.rader}
                    oppen={oppet}
                    onVaxla={() => vaxlaBransch(grupp.bransch)}
                  />
                  {oppet && (
                    <div className="mt-2 space-y-2">
                      {grupp.rader.map((rad) => (
                        <BolagsKort key={rad.ticker} rad={rad} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {traffar === 0 && <TomSok sok={sok} />}
          </div>
        )}

        {/* ≥sm: full korstabell med fryst bolagskolumn */}
        {harData && (
          <div className="mt-4 hidden overflow-x-auto scrollbar-ak1a rounded-xl border border-gold/30 bg-paper sm:block">
            <table className="w-full min-w-[1740px] text-left text-sm">
              <thead>
                <tr className="border-b border-gold/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th rowSpan={2} className="sticky left-0 z-10 border-r border-gold/15 bg-paper px-3 py-2 font-semibold">
                    Bolag
                  </th>
                  {/* VÅG 78 B2: första datakolumnen = AKM1-totalen (Akm1Chip i
                      tbody) — rubriken var felmärkt "AKM2" med dito
                      sorteringsnyckel, vilket gjorde AKM1-sorteringen
                      onåbar trots hjälptexten. */}
                  <th
                    rowSpan={2}
                    aria-sort={sortNyckel === "akm1" && sort === "desc" ? "descending" : sortNyckel === "akm1" && sort === "asc" ? "ascending" : "none"}
                    className="border-b border-gold/30 px-2 py-2 text-right font-semibold"
                    title="AKM1-totalen — din klassiska 20-variabelsumma (V01–V20); chippet under visar osäkerhetsintervallet (våg 59, AKM3 steg 3)"
                  >
                    <button
                      type="button"
                      onClick={() => valjSort("akm1")}
                      className="inline-flex items-center gap-1 font-semibold hover:text-gold"
                      title="Sortera bolagen på AKM1-total inom varje bransch"
                    >
                      AKM1 {sortNyckel === "akm1" && sort === "desc" ? "▾" : sortNyckel === "akm1" && sort === "asc" ? "▴" : "↕"}
                    </button>
                  </th>
                  <th
                    rowSpan={2}
                    aria-sort={sortNyckel === "peer" && sort === "desc" ? "descending" : sortNyckel === "peer" && sort === "asc" ? "ascending" : "none"}
                    className="border-b border-gold/30 px-2 py-2 text-right font-semibold"
                    title="Peer (VÅG 59, AKM3 steg 4) — bolagets AKM2-komposit rankat inom sin branschgrupp: midrank-percentil 0–100 och rank (delade värden delar rank). Grupp < 5 bolag ⇒ osatt. Läslager — påverkar ALDRIG poängen; branschmedianerna speglar modulviktningarna (se Aktiva moduler i tooltippet)."
                  >
                    <button
                      type="button"
                      onClick={() => valjSort("peer")}
                      className="inline-flex items-center gap-1 font-semibold hover:text-gold"
                      title="Sortera bolagen på peer-percentil inom varje bransch (osatt sorterar sist)"
                    >
                      Peer {sortNyckel === "peer" && sort === "desc" ? "▾" : sortNyckel === "peer" && sort === "asc" ? "▴" : "↕"}
                    </button>
                  </th>
                  <th
                    rowSpan={2}
                    aria-sort={sortNyckel === "akm2" && sort === "desc" ? "descending" : sortNyckel === "akm2" && sort === "asc" ? "ascending" : "none"}
                    className="border-b border-gold/30 px-2 py-2 text-right font-semibold"
                    title="AKM2-kompositen — raknaAKM2 med automatiska moduler (V21+) ur modulregistret och viktprofilen akm2-2026; chippet under visar differensen mot AKM1-totalen (våg 57 D2)"
                  >
                    <button
                      type="button"
                      onClick={() => valjSort("akm2")}
                      className="inline-flex items-center gap-1 font-semibold hover:text-gold"
                      title="Sortera bolagen på AKM2-komposit inom varje bransch"
                    >
                      AKM2 {sortNyckel === "akm2" && sort === "desc" ? "▾" : sortNyckel === "akm2" && sort === "asc" ? "▴" : "↕"}
                    </button>
                  </th>
                  <th
                    rowSpan={2}
                    className="border-b border-gold/30 px-2 py-2 text-center font-semibold"
                    title="Datatäckning — andel av modellens vikt med dataunderlag (D1): ≥80 % grön, 50–79 % gul, <50 % grå (låg)"
                  >
                    Täckning
                  </th>
                  <th colSpan={KATEGORIER.length} className="border-b border-gold/30 px-2 py-2 text-center font-semibold">
                    Kategoripoäng
                  </th>
                  <th colSpan={HZ_VISNING.length + 1} className="border-b border-gold/30 px-2 py-2 text-center font-semibold">
                    Fundamental vågklass · fem horisonter
                  </th>
                  <th colSpan={HZ_VISNING.length} className="border-b border-gold/30 px-2 py-2 text-center font-semibold">
                    Teknisk vågklass · fem horisonter
                  </th>
                  <th rowSpan={2} className="border-b border-gold/30 px-2 py-2 text-right font-semibold">
                    Golv-%
                  </th>
                  <th rowSpan={2} className="border-b border-gold/30 px-2 py-2 text-center font-semibold">
                    Status
                  </th>
                </tr>
                <tr className="border-b border-gold/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {KATEGORIER.map((k) => (
                    <th key={k.nyckel} className="px-2 py-1.5 text-center font-semibold" title={`AKM1-kategorin ${k.namn}`}>
                      {k.namn}
                    </th>
                  ))}
                  {HZ_VISNING.map((h) => (
                    <th key={`f-${h.id}`} className="px-1.5 py-1.5 text-center font-semibold" title={`Fundamental våg · ${h.namn} (${h.hjalp})`}>
                      F·{h.namn}
                    </th>
                  ))}
                  <th className="px-1.5 py-1.5 text-center font-semibold" title="Sammanvägd fundamental dynamik — förbättras, stabilt eller försvagas">
                    Dyn.
                  </th>
                  {HZ_VISNING.map((h) => (
                    <th key={`t-${h.id}`} className="px-1.5 py-1.5 text-center font-semibold" title={`Teknisk våg · ${h.namn}`}>
                      T·{h.namn}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grupper.map((grupp) => {
                  const snitt =
                    grupp.rader.reduce((sum, r) => sum + (Number.isFinite(r.akm1Totalt) ? r.akm1Totalt : 0), 0) /
                    grupp.rader.length;
                  // VÅG 59: branschmedianen i grupp-rubriken — "60 i teknik ≠ 60
                  // i finans" (r3 §4.1); osatt grupp visar den inte.
                  const gruppMedian = grupp.rader.find((r) => r.peer && !r.peer.osatt)?.peer
                    ?.branschMedian;
                  const oppet = arOppen(grupp.bransch);
                  return (
                    <Fragment key={grupp.bransch}>
                      <tr className="border-b border-gold/20 bg-paper">
                        <td colSpan={ANTAL_KOLUMNER} className="px-3 py-2">
                          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            {/* Kollapsad bransch (VÅG 63 bygg-2): rubriken är
                                expanderaren — 10 gruppade rader som standard,
                                bolagsraderna renderas på begäran. */}
                            <button
                              type="button"
                              onClick={() => vaxlaBransch(grupp.bransch)}
                              aria-expanded={oppet}
                              title={oppet ? "Fäll ihop branschens bolagsrader" : "Veckla ut branschens bolagsrader"}
                              className="inline-flex cursor-pointer items-baseline gap-1.5 font-serif text-xs font-bold uppercase tracking-[0.14em] text-gold hover:underline"
                            >
                              <span aria-hidden className="text-[10px] not-italic">{oppet ? "▾" : "▸"}</span>
                              {BRANSCH_NAMN[grupp.bransch] ?? grupp.bransch}
                              <span className="font-sans text-[10px] font-semibold normal-case tracking-wider text-muted-foreground">
                                {oppet ? "dölj" : `visa ${grupp.rader.length}`}
                              </span>
                            </button>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              {grupp.rader.length} bolag
                            </span>
                            <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold">
                              Snitt AKM1 {poangText(Math.round(snitt * 10) / 10)}
                            </span>
                            {typeof gruppMedian === "number" && (
                              <span
                                className="rounded-full border border-gold/20 bg-gold/5 px-2 py-0.5 text-[10px] font-bold text-muted-foreground"
                                title="Median av gruppens AKM2-kompositer — peer-kolumnens referens. Medianen speglar branschmodulernas viktningar (Bank stänger t.ex. av V21/V28 i finans); den är ett läslager, aldrig ett betyg."
                              >
                                Median AKM2 {poangText(gruppMedian)}
                              </span>
                            )}
                          </span>
                        </td>
                      </tr>
                      {oppet && grupp.rader.map((rad) => (
                        <tr key={rad.ticker} className="border-b border-gold/15 transition-colors hover:bg-gold/5">
                          <td className="sticky left-0 z-10 border-r border-gold/15 bg-paper px-3 py-2.5">
                            <span className="flex items-center gap-1.5">
                              <span className="font-semibold">{rad.ticker}</span>
                              <span title={`Senast kontrollerad ${datumText(rad.senastKontrollerad)}`}>
                                <HonestyTag kind="matt" />
                              </span>
                            </span>
                            <span className="block max-w-[170px] truncate text-xs text-muted-foreground" title={rad.namn}>
                              {rad.namn}
                            </span>
                          </td>
                          <td className="px-2 py-2.5 text-right">
                            <Akm1Chip
                              varde={Number.isFinite(rad.akm1Totalt) ? rad.akm1Totalt : null}
                              max={rad.akm1MaxMojligt}
                              intervall={raknaIntervall(
                                Number.isFinite(rad.akm1Totalt) ? rad.akm1Totalt : null,
                                rad.datatackning,
                                rad.portV19,
                              )}
                            />
                          </td>
                          <td className="px-2 py-2.5 text-right">
                            <Akm2Cell
                              varde={rad.akm2 ?? null}
                              skillnad={rad.akm2Skillnad ?? null}
                              moduler={rad.akm2Moduler}
                              intervall={raknaIntervall(rad.akm2 ?? null, rad.datatackning, rad.portV19)}
                            />
                          </td>
                          <td className="px-2 py-2.5 text-right">
                            <PeerCell rad={rad} />
                          </td>
                          <td className="px-2 py-2.5 text-center">
                            <TackningChip tat={rad.datatackning} />
                          </td>
                          {KATEGORIER.map((k) => (
                            <td
                              key={k.nyckel}
                              className="tabular px-2 py-2.5 text-center font-mono text-xs font-semibold"
                              title={`${rad.ticker} · ${k.namn}: ${poangText(kategoriPoang(rad, k))} poäng`}
                            >
                              {poangText(kategoriPoang(rad, k))}
                            </td>
                          ))}
                          {HZ_VISNING.map((h) => {
                            const klass = vag(rad.fvagPerHorisont, h.id);
                            return (
                              <td key={`f-${h.id}`} className="px-1.5 py-2.5 text-center">
                                <VagCell
                                  klass={klass}
                                  titel={`${rad.ticker} · fundamental ${h.namn.toLowerCase()} (${h.hjalp}): ${VAG_TEXT[klass]}`}
                                />
                              </td>
                            );
                          })}
                          <td className="px-1.5 py-2.5 text-center">
                            <DynamikPil dynamik={rad.fvagDynamik} />
                          </td>
                          {HZ_VISNING.map((h) => {
                            const klass = vag(rad.tvagPerHorisont, h.id);
                            return (
                              <td key={`t-${h.id}`} className="px-1.5 py-2.5 text-center">
                                <VagCell
                                  klass={klass}
                                  titel={`${rad.ticker} · teknisk ${h.namn.toLowerCase()}: ${VAG_TEXT[klass]}`}
                                />
                              </td>
                            );
                          })}
                          <td
                            className={`tabular px-2 py-2.5 text-right font-mono text-xs font-bold ${
                              rad.golvMarginal === null
                                ? "text-muted-foreground"
                                : rad.golvMarginal >= 0
                                  ? "text-bull"
                                  : "text-bear"
                            }`}
                            title={`Golvmarginal — (värde − pris) / värde. Negativ marginal betyder att priset ligger över beräknat golv.`}
                          >
                            {procentText(rad.golvMarginal)}
                          </td>
                          <td className="px-2 py-2.5 text-center">
                            <StatusChip status={rad.status} />
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  );
                })}
                {traffar === 0 && (
                  <tr>
                    <td colSpan={ANTAL_KOLUMNER}>
                      <TomSok sok={sok} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!harData && (
          <p className="mt-4 rounded-xl border border-dashed border-gold/30 bg-paper p-4 text-center text-xs italic text-muted-foreground">
            Tabellen är tom — inga korstabellrader har lämnats in ännu. Motorn gissar aldrig: utan
            underlag finns inga siffror att redovisa.
          </p>
        )}

        <div className="hjarlinje mt-4" />

        {/* Legend — kunddirektivets färgspråk, utskrivet i klartext */}
        {harData && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
            <span className="flex items-center gap-1.5"><span className="font-bold text-bull">↗</span> impulsvåg</span>
            <span className="flex items-center gap-1.5"><span className="font-bold" style={{ color: "var(--koppar-lys, #8C5A2B)" }}>↘</span> korrigering</span>
            <span className="flex items-center gap-1.5"><span className="font-bold text-neutral-signal">→</span> basbygge</span>
            <span className="flex items-center gap-1.5"><span className="font-bold text-muted-foreground">·</span> osatt</span>
            <span className="flex items-center gap-1.5 text-muted-foreground">|</span>
            <span className="flex items-center gap-1.5"><span className="font-bold text-bull">↑</span> förbättras</span>
            <span className="flex items-center gap-1.5"><span className="font-bold text-gold">→</span> stabilt</span>
            <span className="flex items-center gap-1.5"><span className="font-bold text-bear">↓</span> försvagas</span>
            <span className="flex items-center gap-1.5 text-muted-foreground">|</span>
            <span className="flex items-center gap-1.5 text-[11px] italic text-muted-foreground">
              AKM2-chippet: <span className="font-bold text-bull">+N</span> = kompositen över AKM1-radens total ·
              <span className="font-bold text-bear"> −N</span> = under · osatta modulvariabler omfördelar sin vikt (aldrig straffas)
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">|</span>
            <span className="text-[11px] italic text-muted-foreground">
              Grön=gul tröskel skalad efter datatäckning — modellen straffar aldrig saknad data
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">|</span>
            <span className="text-[11px] italic text-muted-foreground">
              Felstrecket: osäkerhetsintervall [poäng–övre] — nedre gräns är poängen, övre vid
              5 p på osatt vikt (hård port: tak 45, snedstrecksmärke)
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">|</span>
            <span className="text-[11px] italic text-muted-foreground">
              Peer: midrank-percentil + rank i branschen (delade värden delar rank, grupp &lt; 5
              ⇒ osatt) — läslager som aldrig påverkar poängen
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">|</span>
            <span className="text-[11px] italic text-muted-foreground">
              F = fundamental, T = teknisk · etiketten &quot;Mätt&quot; markerar senast kontrollerad verklig data
            </span>
          </div>
        )}

        {/* Disclaimer */}
        <p className="marin-unscope mt-6 rounded-xl border border-gold/30 bg-gold/10 p-3 text-center text-xs italic gold-text">
          Pedagogisk forskning — inte investeringsrådgivning. Tabellen är ett studieunderlag, aldrig
          en köp- eller säljsignal.
        </p>
      </div>
    </section>
  );
}

// ── Småhjälpare ─────────────────────────────────────────────────────────────

/** Branschrubrik för mobilvyn — namn + snitt AKM1; kollapsad bransch ⇒
 *  rubriken är expanderaren (VÅG 63 bygg-2), korten kommer under den. */
function BranschRubrikMob({
  bransch,
  rader,
  oppen,
  onVaxla,
}: {
  bransch: KorstabbellRad["bransch"];
  rader: KorstabbellRad[];
  oppen: boolean;
  onVaxla: () => void;
}) {
  const snitt = rader.reduce((s, r) => s + (Number.isFinite(r.akm1Totalt) ? r.akm1Totalt : 0), 0) / rader.length;
  return (
    <button
      type="button"
      onClick={onVaxla}
      aria-expanded={oppen}
      title={oppen ? "Fäll ihop branschens bolagskort" : "Veckla ut branschens bolagskort"}
      className="flex w-full flex-wrap items-baseline gap-x-2 border-b border-gold/20 pb-1 pt-2 text-left"
    >
      <span aria-hidden className="text-[10px] font-bold text-gold">
        {oppen ? "▾" : "▸"}
      </span>
      <span className="font-serif text-xs font-bold uppercase tracking-[0.14em] text-gold">
        {BRANSCH_NAMN[bransch] ?? bransch}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {rader.length} bolag · snitt AKM1 {poangText(Math.round(snitt * 10) / 10)} ·{" "}
        <span className="font-semibold lowercase">{oppen ? "dölj" : "visa"}</span>
      </span>
    </button>
  );
}

function TomSok({ sok }: { sok: string }) {
  return (
    <div className="p-4 text-center">
      <p className="text-xs italic text-muted-foreground">
        Inga bolag matchar &quot;{sok}&quot; — prova en annan ticker, ett bolagsnamn eller en bransch.
      </p>
    </div>
  );
}
