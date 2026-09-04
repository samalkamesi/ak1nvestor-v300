"use client";

import { useMemo, useState } from "react";
import type {
  Horisont,
  InnehavForslag,
  KorstabbellRad,
  KravKontroll,
  PortfoljForslag,
  PortfoljUppfoljning,
  RiskProfil,
  UppfoljningSnapshot,
  VagKlass,
} from "@/lib/portfolj-forskning/typer";
import { VagkurvaGraf } from "../vagkurva-graf";
import {
  Akm1Chip,
  BRANSCH_NAMN,
  HZ_VISNING,
  RISKNIVA_TEXT,
  StatusChip,
  TAKT_TEXT,
  VAG_TEXT,
  VagCell,
  datumText,
  kvartalEtikett,
  manadText,
  procentText,
  talText,
  vagYtStil,
} from "./vag-stil";

// ═══════════════════════════════════════════════════════════
// PORTFÖLJENS DJUPVY — kundens "då vs nu". För varje innehav
// ställs förra snapshot mot aktuell: AKM1, vågklass per
// horisont (fundamental och teknisk), pris och förändring i
// procent-badges. Plus portföljens vågprofil på fem horisonter,
// AK1A-noten, ersättnings-panelen och en tidsaxel med månad-
// och kvartalsmarkörer för alla snapshots.
// Forskningsredovisning — aldrig investeringsrådgivning.
// ═══════════════════════════════════════════════════════════

/** Säker vågklass-läsning — saknad nyckel redovisas som osatt. */
function vag(record: Record<string, VagKlass> | undefined, horisont: string): VagKlass {
  const v = record?.[horisont];
  return v === "impulsvag" || v === "korrigering" || v === "basbygge" ? v : "osatt";
}

// ── Förändring-badges ───────────────────────────────────────────────────────

/** Procent-badge med riktning: +9,4 % grönmörk / −5,8 % röd. */
function ProcentBadge({ varde }: { varde: number | null | undefined }) {
  if (varde === null || varde === undefined || !Number.isFinite(varde) || varde === 0) return null;
  const upp = varde > 0;
  return (
    <span
      className={`tabular inline-block rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
        upp ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear"
      }`}
      title={`Förändring sedan föregående snapshot: ${procentText(varde)}`}
    >
      {procentText(varde)}
    </span>
  );
}

/** Poäng-badge för AKM1-förändring: +1,0 poäng / −2,5 poäng. */
function PoangBadge({ varde }: { varde: number | null | undefined }) {
  if (varde === null || varde === undefined || !Number.isFinite(varde) || varde === 0) return null;
  const upp = varde > 0;
  const t = Math.abs(varde).toFixed(1).replace(".", ",");
  return (
    <span
      className={`tabular inline-block rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
        upp ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear"
      }`}
      title={`AKM1-förändring sedan föregående snapshot: ${upp ? "+" : "−"}${t} poäng`}
    >
      {upp ? "+" : "−"}
      {t} p
    </span>
  );
}

// ── Då/Nu-snapshotkolumn ────────────────────────────────────────────────────

/** Båda vågraderna (fundamental + teknisk) för en snapshot — 5+5 kompaktceller. */
function Vagrader({ snapshot }: { snapshot: UppfoljningSnapshot }) {
  return (
    <div className="mt-2 space-y-1.5">
      {(
        [
          { etikett: "Fundamental", record: snapshot.fvagPerHorisont },
          { etikett: "Teknisk", record: snapshot.tvagPerHorisont },
        ] as const
      ).map(({ etikett, record }) => (
        <div key={etikett}>
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{etikett}</p>
          <div className="mt-0.5 flex items-center gap-1">
            {HZ_VISNING.map((h) => {
              const klass = vag(record, h.id);
              return (
                <VagCell
                  key={h.id}
                  storlek="xs"
                  klass={klass}
                  titel={`${etikett} ${h.namn.toLowerCase()} (${h.hjalp}): ${VAG_TEXT[klass]}`}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/** En sida i då-vs-nu-jämförelsen. */
function SnapshotSida({
  etikett,
  arNu,
  snapshot,
  max,
}: {
  etikett: string;
  arNu: boolean;
  snapshot: UppfoljningSnapshot | null;
  /** Teoretiskt poängtak (D1) ur korstabellraden — "poäng/max", aldrig dolt. */
  max?: number | null;
}) {
  if (!snapshot) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{etikett}</p>
        <p className="mt-2 text-xs italic text-muted-foreground">
          Ingen snapshot ännu — första mätningen blir utgångspunkten.
        </p>
      </div>
    );
  }
  return (
    <div
      className={
        arNu
          ? "rounded-lg border border-gold/40 bg-gold/5 p-3"
          : "rounded-lg border border-border bg-paper p-3"
      }
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${arNu ? "text-gold" : "text-muted-foreground"}`}
        >
          {etikett}
        </span>
        <span className="text-[10px] text-muted-foreground">{datumText(snapshot.datum)}</span>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">AKM1</p>
          <div className="mt-1 flex items-center gap-1.5">
            <Akm1Chip
              varde={Number.isFinite(snapshot.akm1Totalt) ? snapshot.akm1Totalt : null}
              max={max}
            />
            {arNu && <PoangBadge varde={snapshot.forandringAkm1} />}
          </div>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Pris</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="tabular font-mono text-base font-bold">
              {snapshot.pris !== null && snapshot.pris !== undefined && Number.isFinite(snapshot.pris)
                ? `${talText(snapshot.pris, 2)} kr`
                : "—"}
            </span>
            {arNu && <ProcentBadge varde={snapshot.forandringPris} />}
          </div>
        </div>
      </div>

      <Vagrader snapshot={snapshot} />

      {arNu && snapshot.notisText && (
        <p className="mt-2 border-t border-gold/20 pt-2 text-[11px] italic leading-snug text-gold">
          {snapshot.notisText}
        </p>
      )}
    </div>
  );
}

// ── Kravkontroll-chips ──────────────────────────────────────────────────────

const KRAV_STIL: Record<KravKontroll["status"], { punkt: string; text: string }> = {
  OK: { punkt: "bg-bull", text: "text-bull" },
  VARNING: { punkt: "bg-gold", text: "text-gold" },
  BROTT: { punkt: "bg-bear", text: "text-bear" },
};

function KravChips({ krav }: { krav: KravKontroll[] }) {
  if (!krav || krav.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {krav.map((k, i) => {
        const stil = KRAV_STIL[k.status] ?? KRAV_STIL.OK;
        return (
          <span
            key={`${k.namn}-${i}`}
            title={k.detalj}
            className={`inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-semibold ${stil.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${stil.punkt}`} aria-hidden />
            {k.namn} · {k.status}
          </span>
        );
      })}
    </div>
  );
}

// ── Innehavskort: då vs nu ─────────────────────────────────────────────────

function InnehavKort({
  innehav,
  da,
  nu,
  rad,
}: {
  innehav: InnehavForslag;
  da: UppfoljningSnapshot | null;
  nu: UppfoljningSnapshot | null;
  rad: KorstabbellRad | undefined;
}) {
  return (
    <div className="rounded-xl border border-gold/30 bg-card p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="font-serif text-base font-bold">{innehav.ticker}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {rad ? `${rad.namn} · ${BRANSCH_NAMN[rad.bransch] ?? rad.bransch}` : "Utanför korstabellen"}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold">
            Vikt {talText(innehav.vikt * 100, 0)} %
          </span>
          {rad && <StatusChip status={rad.status} />}
        </span>
      </div>

      {rad && rad.golvMarginal !== null && Number.isFinite(rad.golvMarginal) && (
        <p className="mt-1 text-[10px] text-muted-foreground">
          Golvmarginal just nu:{" "}
          <span className={rad.golvMarginal >= 0 ? "font-bold text-bull" : "font-bold text-bear"}>
            {procentText(rad.golvMarginal)}
          </span>
        </p>
      )}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <SnapshotSida
          etikett="Då — förra snapshot"
          arNu={false}
          snapshot={da}
          max={rad?.akm1MaxMojligt ?? null}
        />
        <SnapshotSida
          etikett="Nu — aktuell"
          arNu={true}
          snapshot={nu}
          max={rad?.akm1MaxMojligt ?? null}
        />
      </div>

      <div className="mt-3 border-t border-gold/15 pt-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Motiv</p>
        <p className="mt-1 text-xs leading-relaxed">{innehav.motiv}</p>
        <KravChips krav={innehav.krav} />
      </div>
    </div>
  );
}

// ── Vågkurvor per horisont (VÅG 48) — expanderbar Elliott-sektion ────────────

/**
 * Expanderbar sektion: Elliott-vågläget per horisont för portföljförslagets
 * fem första innehav. VagkurvaGraf hämtar själv /api/vagfundament per ticker
 * (lazy — inget anrop förrän sektionen vecklats ut), och dess interna
 * ticker-väljare vandrar mellan innehaven. Max fem kurvor så sidan förblir
 * lätt; pedagogisk visualisering — aldrig investeringsråd.
 */
function VagkurvorSektion({ innehav }: { innehav: InnehavForslag[] }) {
  const [oppnad, setOppnad] = useState(false);
  const tickers = useMemo(
    () => (innehav ?? []).map((i) => i?.ticker).filter((t): t is string => typeof t === "string" && t.trim() !== "").slice(0, 5),
    [innehav]
  );

  if (tickers.length === 0) return null;

  return (
    <div className="rounded-xl border border-gold/30 bg-paper p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
            Vågkurvor per horisont
          </p>
          <p className="mt-1 max-w-xl text-[11px] italic leading-relaxed text-muted-foreground">
            Elliott-vågläget för de {tickers.length} största innehaven — fundamentala
            vågklasser från vågmotorn, ritade som pedagogiska Elliott-strukturer på
            fem tidshorisonter.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOppnad((o) => !o)}
          aria-expanded={oppnad}
          className="btn-marin min-h-[44px] shrink-0 px-4 py-2 text-xs"
        >
          {oppnad ? "Dölj vågkurvor" : `Visa vågkurvor (${tickers.length})`}
        </button>
      </div>

      {oppnad ? (
        <div className="mt-4">
          <VagkurvaGraf ticker={tickers[0]} alternativ={tickers} />
        </div>
      ) : null}
    </div>
  );
}

// ── Portföljens vågprofil (5 horisonter) ────────────────────────────────────

function vagprofilMening(profil: Record<Horisont, VagKlass>): string {
  const ordning: VagKlass[] = ["impulsvag", "korrigering", "basbygge", "osatt"];
  const grupper = new Map<VagKlass, string[]>();
  for (const h of HZ_VISNING) {
    const k = vag(profil, h.id);
    grupper.set(k, [...(grupper.get(k) ?? []), h.namn.toLowerCase()]);
  }
  const delar = ordning
    .filter((k) => (grupper.get(k) ?? []).length > 0)
    .map((k) => `${VAG_TEXT[k].toLowerCase()} på ${(grupper.get(k) ?? []).join(", ")}`);
  if (delar.length === 0) return "Portföljens vågbild är än så länge osatt — underlaget räcker inte.";
  if (delar.length === 1) return `Portföljen bär ${delar[0]} — samtliga fem horisonter i samma rytm.`;
  const fog = delar.length === 2 ? " samt " : " samt slutligen ";
  return `Portföljen bär ${delar.slice(0, -1).join(", ")}${fog}${delar[delar.length - 1]}.`;
}

function VagprofilRad({ profil }: { profil: Record<Horisont, VagKlass> }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
        Portföljens vågprofil — fem tidshorisonter
      </p>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {HZ_VISNING.map((h) => {
          const k = vag(profil, h.id);
          const yt = vagYtStil(k);
          return (
            <div
              key={h.id}
              title={`${h.namn} (${h.hjalp}): ${VAG_TEXT[k]}`}
              className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-lg border px-1 py-2 text-center ${yt.klass}`}
              style={yt.style}
            >
              <span className="text-base font-bold leading-none" aria-hidden>
                {k === "impulsvag" ? "↗" : k === "korrigering" ? "↘" : k === "basbygge" ? "→" : "·"}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider">{h.namn}</span>
              <span className="text-[10px] leading-tight">{VAG_TEXT[k]}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-sm leading-relaxed">{vagprofilMening(profil)}</p>
      <p className="mt-1.5 text-[11px] italic text-muted-foreground">
        Vågbilden beskriver portföljens samlade rytm — en bild att studera, inte en uppmaning att agera.
      </p>
    </div>
  );
}

// ── Tidsaxel ────────────────────────────────────────────────────────────────

function Tidsaxel({ datumLista, historik }: { datumLista: string[]; historik: Array<{ datum: string; text: string }> }) {
  if (datumLista.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gold">Uppföljningens tidsaxel</p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Varje punkt är ett snapshot-tillfälle — månads-etikett under, kvartalsmarkör ovan.
      </p>
      <div className="relative mt-5">
        <span className="absolute inset-x-3 top-[9px] h-px bg-gold/30" aria-hidden />
        <ol className="relative flex items-start justify-between">
          {datumLista.map((d, i) => {
            const senast = i === datumLista.length - 1;
            const q = kvartalEtikett(d);
            return (
              <li key={d} className="flex w-16 flex-col items-center gap-1">
                {q ? (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gold">{q}</span>
                ) : (
                  <span className="text-[9px]">&nbsp;</span>
                )}
                <span
                  title={datumText(d)}
                  className={`h-3 w-3 rounded-full border-2 ${
                    senast ? "border-gold bg-gold" : "border-gold/50 bg-card"
                  }`}
                />
                <span className="text-[10px] text-muted-foreground">{manadText(d)}</span>
              </li>
            );
          })}
        </ol>
      </div>
      {historik.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t border-border/60 pt-3">
          {historik.map((h, i) => (
            <li key={`${h.datum}-${i}`} className="text-xs leading-relaxed">
              <span className="mr-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {manadText(h.datum)}
              </span>
              {h.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Komponenten ─────────────────────────────────────────────────────────────

export function PortfoljDjupvy({
  forslag,
  uppfoljning,
  rader,
}: {
  forslag: PortfoljForslag;
  uppfoljning: PortfoljUppfoljning;
  rader: KorstabbellRad[];
}) {
  // Snapshots per ticker, sorterade på datum (stigande) — "då" = näst sista, "nu" = sista.
  const perTicker = useMemo(() => {
    const m = new Map<string, UppfoljningSnapshot[]>();
    for (const s of uppfoljning?.snapshots ?? []) {
      if (!s?.ticker) continue;
      m.set(s.ticker, [...(m.get(s.ticker) ?? []), s]);
    }
    for (const arr of m.values()) {
      arr.sort((a, b) => String(a.datum ?? "").localeCompare(String(b.datum ?? "")));
    }
    return m;
  }, [uppfoljning]);

  // Tidsaxelns datumlista — unika snapshot-datum, sorterade.
  const datumLista = useMemo(() => {
    const set = new Set<string>();
    for (const s of uppfoljning?.snapshots ?? []) {
      if (s?.datum) set.add(s.datum);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [uppfoljning]);

  const radFor = useMemo(() => new Map((rader ?? []).map((r) => [r.ticker, r])), [rader]);

  const profil: RiskProfil = forslag.riskProfil;

  return (
    <section className="marin-panel overflow-hidden rounded-2xl border border-gold/40">
      <header className="border-b border-gold/30 px-4 py-3 sm:px-6 sm:py-4">
        <h3 className="font-serif text-sm font-bold uppercase tracking-[0.18em] text-[#E8C766] sm:text-base">
          PORTFÖLJENS UPPFÖLJNING
          <span className="ml-2 font-normal normal-case italic tracking-normal text-[#EDE6D6]/85">
            — hur analysen var då och hur den är nu
          </span>
        </h3>
      </header>
      <div className="hjarlinje" aria-hidden />

      <div className="bg-card p-4 sm:p-6">
        {/* Riskprofil-sammanfattning */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
            Nivå: {RISKNIVA_TEXT[profil.niva] ?? profil.niva}
          </span>
          <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
            Takt: {TAKT_TEXT[profil.takt] ?? profil.takt}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Förslag {datumText(forslag.skapad)} · max {talText(profil.maxPerAktie * 100, 0)} % per aktie · min AKM1{" "}
            {profil.minAKM1}
            {profil.minGolvMarginal !== null && profil.minGolvMarginal !== undefined
              ? ` · min golvmarginal ${procentText(profil.minGolvMarginal)}`
              : " · inget golvkrav"}
          </span>
        </div>

        <div className="mt-4 space-y-4">
          <Tidsaxel datumLista={datumLista} historik={uppfoljning?.historik ?? []} />

          {forslag.vagprofilSammanfattning && <VagprofilRad profil={forslag.vagprofilSammanfattning} />}

          {/* AK1A-not — forskningens eget ord, aldrig råd */}
          <div className="rounded-xl border border-gold/50 bg-gold/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gold">AK1A-not</p>
            <p className="mt-1.5 text-sm leading-relaxed">{forslag.ak1aNot}</p>
          </div>

          {/* Innehav — då vs nu, kort för kort */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Innehav · då mot nu ({(forslag.innehav ?? []).length} positioner)
            </p>
            <div className="mt-2 grid gap-4 xl:grid-cols-2">
              {(forslag.innehav ?? []).map((inh) => {
                const lista = perTicker.get(inh.ticker) ?? [];
                const nu = lista.length > 0 ? lista[lista.length - 1] : null;
                const da = lista.length > 1 ? lista[lista.length - 2] : null;
                return (
                  <InnehavKort key={inh.ticker} innehav={inh} da={da} nu={nu} rad={radFor.get(inh.ticker)} />
                );
              })}
            </div>
          </div>

          {/* Vågkurvor per horisont — expanderbar Elliott-vy (VÅG 48) */}
          <VagkurvorSektion innehav={forslag.innehav ?? []} />

          {/* Ersättnings-panelen — ersatta aktier och kandidater med motiv */}
          {(forslag.ersattningar ?? []).length > 0 && (
            <div className="rounded-xl border border-gold/30 bg-paper p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
                Ersättningar i forskningen
              </p>
              <p className="mt-1 text-[11px] italic text-muted-foreground">
                Bolag som brutit de strikta kraven — med kandidater att studera. Pedagogisk
                omläggning, aldrig en säljorder.
              </p>
              <div className="mt-3 space-y-3">
                {forslag.ersattningar.map((e) => (
                  <div key={e.ersattTicker} className="rounded-lg border border-border bg-card p-3">
                    <p className="flex items-center gap-2">
                      <span
                        className="font-serif text-sm font-bold"
                        style={{ color: "var(--koppar-lys, #8C5A2B)" }}
                      >
                        ↘ {e.ersattTicker}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">ersatt</span>
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{e.orsak}</p>
                    {e.kandidater.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-border/60 pt-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Kandidater
                        </p>
                        {e.kandidater.map((k) => (
                          <div key={k.ticker} className="rounded-lg border border-gold/25 bg-paper p-2.5">
                            <p className="text-xs font-bold text-bull">↗ {k.ticker}</p>
                            <p className="mt-0.5 text-xs leading-relaxed">{k.motiv}</p>
                            <p className="mt-1 text-[11px] italic leading-snug text-muted-foreground">
                              Skillnad mot ersatt: {k.skillnadMotErsatt}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pedagogisk fotnot */}
          <p className="rounded-xl border border-gold/30 bg-gold/10 p-3 text-center text-xs italic text-gold">
            Forskningsbaserad analys — inte investeringsrådgivning.
          </p>
        </div>
      </div>
    </section>
  );
}
