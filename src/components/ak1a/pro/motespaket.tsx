"use client";

/**
 * MÖTESPAKETET — ETT utskriftbart A4 (VÅG 61 bygg-4, B2B-BESLUT §4c + b5 §2d).
 *
 * "Samlar åtta FÄRDIGA motorer till ett A4 — billigast kundnytta per timme;
 * det bor i klientvyn och gör den exceptionell." Detta är vyn som samlar:
 *
 *   1. REGIM         — AKM3-regim-chippet ur GET /api/forskningslage (senaste
 *                      raden i den hash-kedjade regime-loggen; hysteres +
 *                      2-snapshots-bekräftelse — chippet beskriver, väljer aldrig).
 *   2. FORSKNINGSLÄGE — samma API:s läge (rikt/balanserat/magert ur korstabellen).
 *   3. VÅGPROFIL     — klientens (demoklientens) aggregerade vågprofil +
 *                      per-innehav VagCell-rader (korstabellens fundamentala
 *                      vågstatus per horisont).
 *   4. DÅ-VS-NU      — jamforDåNu-raderna (uppfoljning.ts); första mätningen
 *                      märks ÄRLIGT som platshållare tills cronen mätt två gånger.
 *   5. TOPP-3 NYHETER — nyhetsmotorn (GET /api/nyheter?tickers=…) rankad på
 *                      påverkanspoäng, med AK1A-notens reflekterande fråga.
 *   6. PEER          — sammanfattning för de tre största innehaven (VÅG 59-
 *                      läslaget: percentil, rank, drag mot branschmedian).
 *   + MAL-LÅST METOD-/RISK-SIDA (MalLastSida — tre lager, BESLUT §3 K5).
 *
 * Allt window.print-vägen (PRO_PRINT_CSS + ProVerktygsrad — pro-utskrift.tsx).
 * Nätverkshämtningar (regim/läge/nyheter) sker i useEffect: dokumentet renderar
 * alltid direkt med underlaget från servern, live-blocken fylls i när de svarar
 * (eller märks ärligt tysta — P3: inget påhittat läge).
 *
 * Pedagogisk forskning — ALDRIG investeringsrådgivning (2007:528).
 */

import { useEffect, useMemo, useState } from "react";
import {
  PRO_PRINT_CSS,
  ProRapportDok,
  ProVerktygsrad,
} from "@/components/ak1a/pro/pro-utskrift";
import { MalLastSida } from "@/components/ak1a/pro/mal-last-sida";
import { TenantHeader, useTenant } from "@/components/ak1a/pro/tenant-header";
import {
  BRANSCH_NAMN,
  HZ_VISNING,
  VAG_TEXT,
  VagCell,
  datumText,
  poangText,
} from "@/components/ak1a/portfolj-forskning/vag-stil";
import { peerDragText, peerRankText } from "@/lib/portfolj-forskning/peer";
import type { Demoklient } from "@/components/ak1a/pro/demoklient-data";

// ── API-typer (minimerade utsnitt — städas defensivt) ────────────────────────

type RegimeUtsnitt = {
  regime: string;
  datum: string;
  beskrivning: string;
  modellVersion: string;
};

type ForskningslageUtsnitt = {
  typ: string;
  text: string;
  gronAndel: number | null;
  rodAndel: number | null;
  topp: Array<{ ticker: string; namn: string; akm1Totalt: number }>;
};

type NyhetUtsnitt = {
  id: string;
  rubrik: string;
  kalla: string;
  lank: string | null;
  paverkan: number;
  ak1aNot: { vVariables: string[]; tanke: string } | null;
};

/** Regimetiketter — stil per läge; texten (beskrivningen) bär betydelsen. */
const REGIM_ETIKETT: Record<string, string> = {
  balanserad: "Balanserad",
  expansiv: "Expansiv",
  magert: "Magert",
  korrigering: "Korrigering",
  osatt: "Osatt",
};

function renRegim(rå: unknown): RegimeUtsnitt | null {
  if (!rå || typeof rå !== "object") return null;
  const r = rå as Record<string, unknown>;
  if (typeof r.regime !== "string") return null;
  return {
    regime: r.regime,
    datum: typeof r.datum === "string" ? r.datum : "",
    beskrivning: typeof r.beskrivning === "string" ? r.beskrivning : "",
    modellVersion: typeof r.modellVersion === "string" ? r.modellVersion : "",
  };
}

function renLage(rå: unknown): ForskningslageUtsnitt | null {
  if (!rå || typeof rå !== "object") return null;
  const l = rå as Record<string, unknown>;
  if (typeof l.typ !== "string") return null;
  const topp = Array.isArray(l.topp)
    ? (l.topp as Array<Record<string, unknown>>)
        .filter((b) => typeof b?.ticker === "string")
        .slice(0, 3)
        .map((b) => ({
          ticker: String(b.ticker),
          namn: typeof b.namn === "string" ? b.namn : String(b.ticker),
          akm1Totalt: typeof b.akm1Totalt === "number" ? b.akm1Totalt : 0,
        }))
    : [];
  return {
    typ: l.typ,
    text: typeof l.text === "string" ? l.text : "",
    gronAndel: typeof l.gronAndel === "number" ? l.gronAndel : null,
    rodAndel: typeof l.rodAndel === "number" ? l.rodAndel : null,
    topp,
  };
}

function renNyheter(rå: unknown): NyhetUtsnitt[] {
  if (!Array.isArray(rå)) return [];
  const ut: NyhetUtsnitt[] = [];
  for (const n of rå) {
    if (!n || typeof n !== "object") continue;
    const o = n as Record<string, unknown>;
    if (typeof o.rubrik !== "string" || o.rubrik.trim() === "") continue;
    const not =
      o.ak1aNot && typeof o.ak1aNot === "object"
        ? {
            vVariables: Array.isArray((o.ak1aNot as Record<string, unknown>).vVariables)
              ? ((o.ak1aNot as Record<string, unknown>).vVariables as unknown[]).filter(
                  (v): v is string => typeof v === "string",
                )
              : [],
            tanke:
              typeof (o.ak1aNot as Record<string, unknown>).tanke === "string"
                ? ((o.ak1aNot as Record<string, unknown>).tanke as string)
                : "",
          }
        : null;
    ut.push({
      id: typeof o.id === "string" ? o.id : `${ut.length}`,
      rubrik: o.rubrik,
      kalla: typeof o.kalla === "string" ? o.kalla : "",
      lank: typeof o.lank === "string" ? o.lank : null,
      paverkan: typeof o.paverkan === "number" ? o.paverkan : 0,
      ak1aNot: not && (not.vVariables.length > 0 || not.tanke !== "") ? not : null,
    });
  }
  return ut.sort(
    (a, b) =>
      b.paverkan - a.paverkan ||
      (a.rubrik < b.rubrik ? -1 : a.rubrik > b.rubrik ? 1 : 0),
  );
}

// ── Komponenten ──────────────────────────────────────────────────────────────

export function Motespaket({
  demoklient,
  onTillbaka,
}: {
  demoklient: Demoklient;
  /** Valfri — utan den äger mallväljaren navigationen (Rapportverkstan). */
  onTillbaka?: () => void;
}) {
  const { tenant } = useTenant();

  // Live-block: regim + forskningsläge ur /api/forskningslage (samma källa som
  // morgonrondens kort) — tyst+ärlig när API:t inte svarar (P3).
  const [regim, setRegim] = useState<RegimeUtsnitt | null>(null);
  const [lage, setLage] = useState<ForskningslageUtsnitt | null>(null);
  const [lageFel, setLageFel] = useState(false);

  // Topp-3 nyheter ur /api/nyheter — portföljens tickers som kontext ger
  // påverkansbonussarna (raknaPaverkan: +20 om nyckel-tickern står i portföljen).
  const [nyheter, setNyheter] = useState<NyhetUtsnitt[] | null>(null);
  const [nyhetFel, setNyhetFel] = useState(false);

  useEffect(() => {
    let aktiv = true;
    const abort = new AbortController();
    const stoppa = setTimeout(() => abort.abort(), 10_000);
    fetch("/api/forskningslage", { signal: abort.signal })
      .then((r) => r.json())
      .then((j: { lage?: unknown; regim?: unknown }) => {
        if (!aktiv) return;
        setRegim(renRegim(j?.regim));
        setLage(renLage(j?.lage));
        if (!renLage(j?.lage)) setLageFel(true);
      })
      .catch(() => {
        if (aktiv) setLageFel(true);
      })
      .finally(() => clearTimeout(stoppa));
    return () => {
      aktiv = false;
      clearTimeout(stoppa);
      abort.abort();
    };
  }, []);

  useEffect(() => {
    let aktiv = true;
    const abort = new AbortController();
    const stoppa = setTimeout(() => abort.abort(), 12_000);
    const tickers = demoklient.innehav.map((i) => i.ticker).join(",");
    fetch(`/api/nyheter?tickers=${encodeURIComponent(tickers)}`, { signal: abort.signal })
      .then((r) => r.json())
      .then((j: { nyheter?: unknown; ok?: boolean }) => {
        if (!aktiv) return;
        const lista = renNyheter(j?.nyheter);
        setNyheter(lista);
        if (lista.length === 0) setNyhetFel(true);
      })
      .catch(() => {
        if (aktiv) setNyhetFel(true);
      })
      .finally(() => clearTimeout(stoppa));
    return () => {
      aktiv = false;
      clearTimeout(stoppa);
      abort.abort();
    };
  }, [demoklient.innehav]);

  const toppNyheter = useMemo(() => (nyheter ?? []).slice(0, 3), [nyheter]);

  /** Peer-sammanfattning: de tre största innehaven med peer underlag. */
  const peerTopp = useMemo(
    () =>
      demoklient.innehav
        .filter((i) => i.peer && !i.peer.osatt && i.peer.peerPercentil !== null)
        .slice(0, 3),
    [demoklient.innehav],
  );

  /** De tre vågklassbytena / största differenserna — för "då vs nu"-raden. */
  const daNuTopp = useMemo(
    () => [...demoklient.jamforelser].slice(0, 3),
    [demoklient.jamforelser],
  );

  const datumLang = demoklient.underlagsdatum
    ? `Underlag t.o.m. ${datumText(demoklient.underlagsdatum)}`
    : "Underlaget saknar datering";

  const osattText = useMemo(() => {
    const osatt = demoklient.vagsammansattning
      .map((v) => `${v.horisont}: ${Math.round(v.osattAndel * 100)} %`)
      .join(", ");
    return `Osatt-andel i den aggregerade vågprofilen per horisont — ${osatt}. Osatta värden ger noll poäng och gissas aldrig.`;
  }, [demoklient.vagsammansattning]);

  const forskningsText = regim
    ? `Regimen redovisas som ${REGIM_ETIKETT[regim.regime] ?? regim.regime} per ${regim.datum} (${regim.modellVersion || "AKM3"}): ${regim.beskrivning}`
    : "Regimen kunde inte läsas vid framställningen — regimen påhittas aldrig.";

  return (
    <section aria-label="Mötespaket — utskriftbart A4">
      <style dangerouslySetInnerHTML={{ __html: PRO_PRINT_CSS }} />
      <ProVerktygsrad
        onTillbaka={onTillbaka}
        datumForKvot={demoklient.underlagsdatum ?? "1970-01-01"}
        notis={`${demoklient.alias} · ${demoklient.innehav.length} innehav`}
      />

      <ProRapportDok>
        {/* White-label-avsändarbandet (bygg-2:s tenant-lager) — I dokumentet
            så utskriften tar med det; renderas endast när en tenant lösts. */}
        {tenant && <TenantHeader tenant={tenant} />}

        <header className="marin-panel relative overflow-hidden rounded-sm px-6 py-8 text-center print:px-8 sm:px-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#E8C766]">AK1A PRO</p>
          <h2 className="mt-4 font-serif text-2xl font-bold text-[#EDE6D6] sm:text-3xl">Mötespaket</h2>
          <div className="hjarlinje mx-auto mt-4 w-44" />
          <p className="mt-4 text-sm text-[#E8C766]">
            {demoklient.alias} — pedagogiskt underlag inför rådgivarsamtalet
          </p>
          <p className="mt-1 text-xs text-[#EDE6D6]/70">{datumLang}</p>
          <p className="mt-2 text-[10px] italic text-[#EDE6D6]/50">
            White-label ändrar avsändaren — aldrig innehållet. Metod- och risk-sidan är mal-låst.
          </p>
        </header>

        {/* ── 1+2. Regimen + forskningsläget — marknadens läge FÖRE klientens ── */}
        <section className="mt-6 break-inside-avoid">
          <h3 className="font-serif text-lg font-bold">Marknadens läge — regim och forskningsläge</h3>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div className="rounded-sm border border-gold/30 bg-gold/5 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-guld-djup">AKM3-regimen</p>
              {regim ? (
                <>
                  <p className="mt-1 font-mono text-lg font-bold">{REGIM_ETIKETT[regim.regime] ?? regim.regime}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{regim.beskrivning}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Läge i underlaget per {datumText(regim.datum)}
                    {regim.modellVersion ? ` · ${regim.modellVersion}` : ""} — hash-kedjad regime-
                    logg med hysteres och 2-snapshots-bekräftelse.
                  </p>
                </>
              ) : (
                <p className="mt-1 text-xs italic text-muted-foreground">
                  {lageFel
                    ? "Regimen kunde inte läsas just nu (API:t svarade inte) — regimen påhittas aldrig."
                    : "Läser regimen…"}
                </p>
              )}
            </div>
            <div className="rounded-sm border border-gold/20 bg-paper p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Forskningsläget</p>
              {lage ? (
                <>
                  <p className="mt-1 font-mono text-lg font-bold">{lage.typ}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{lage.text}</p>
                  {lage.topp.length > 0 && (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Topp i korstabellen: {lage.topp.map((t) => `${t.ticker} (${poangText(t.akm1Totalt)})`).join(" · ")}
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-xs italic text-muted-foreground">
                  {lageFel ? "Forskningsläget kunde inte läsas just nu." : "Läser forskningsläget…"}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── 3. Klientens vågprofil ── */}
        <section className="mt-6 break-inside-avoid">
          <h3 className="font-serif text-lg font-bold">Portföljens vågprofil</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Aggregerad fundamental vågstatus per horisont (vikttungaste klass) med
            per-innehavs-celler — {demoklient.innehav.length} likaviktade innehav ur
            forskningsbibliotekets topp.
          </p>
          <div className="mt-2 flex items-center gap-1">
            {demoklient.vagsammansattning.map((v) => (
              <span key={v.horisont} className="flex flex-col items-center gap-0.5">
                <VagCell
                  klass={v.klass}
                  titel={`Portföljens fundamental dominanta klass på ${v.horisont}: ${VAG_TEXT[v.klass]}`}
                />
                <span className="text-[9px] text-muted-foreground">{v.horisont.slice(0, 4)}</span>
              </span>
            ))}
          </div>
          <table className="mt-3 w-full text-xs">
            <thead>
              <tr className="border-b border-border/70 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="py-1.5 pr-2">Innehav</th>
                <th scope="col" className="py-1.5 pr-2">Vikt</th>
                <th scope="col" className="py-1.5 pr-2">AKM2</th>
                <th scope="col" className="py-1.5">Fundamental våg (mikro → mega)</th>
              </tr>
            </thead>
            <tbody>
              {demoklient.innehav.map((i) => (
                <tr key={i.ticker} className="border-b border-border/40">
                  <td className="py-1.5 pr-2 font-mono font-semibold">{i.ticker}</td>
                  <td className="tabular py-1.5 pr-2 text-muted-foreground">{Math.round(i.vikt * 1000) / 10} %</td>
                  <td className="tabular py-1.5 pr-2 text-muted-foreground">{poangText(i.akm2)}</td>
                  <td className="py-1.5">
                    <span className="flex items-center gap-1">
                      {HZ_VISNING.map((h) => (
                        <VagCell
                          key={h.id}
                          klass={i.fvagPerHorisont?.[h.id] ?? "osatt"}
                          storlek="xs"
                          titel={`${i.ticker} · fundamental ${h.namn.toLowerCase()}: ${VAG_TEXT[i.fvagPerHorisont?.[h.id] ?? "osatt"]}`}
                        />
                      ))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── 4. Då vs nu ── */}
        <section className="mt-6 break-inside-avoid">
          <h3 className="font-serif text-lg font-bold">Då vs nu — senaste uppföljningen</h3>
          {!demoklient.daFinns ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Platshållare, ärligt märkt:</strong> detta är
              portföljens första mätning — uppföljningsmotorn (jamforDåNu) är kopplad men har
              ingen tidigare snapshot att jämföra mot ännu. Nästa månadsrond fyller raderna
              med äkta delta (AKM1-poäng, vågklassbyten, prisrörelse).
            </p>
          ) : (
            <ul className="mt-1 space-y-1 text-xs leading-relaxed text-muted-foreground">
              {daNuTopp.map((j) => (
                <li key={j.ticker}>{j.text}</li>
              ))}
            </ul>
          )}
        </section>

        {/* ── 5. Topp-3 nyheter med påverkanspoäng ── */}
        <section className="mt-6 break-inside-avoid">
          <h3 className="font-serif text-lg font-bold">Topp-3 nyheter — portföljens universum</h3>
          {toppNyheter.length === 0 ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {nyhetFel
                ? "Nyhetsmotorn svarade inte vid framställningen (källorna kan vara otillgängliga) — inga nyheter påhittas."
                : "Hämtar nyhetsflödet…"}
            </p>
          ) : (
            <ol className="mt-2 space-y-2">
              {toppNyheter.map((n, idx) => (
                <li key={n.id} className="rounded-sm border border-border/60 p-2.5">
                  <div className="flex items-baseline justify-between gap-x-3">
                    <p className="text-xs font-semibold leading-snug">
                      <span className="font-mono text-[10px] font-bold text-gold">{idx + 1}.</span>{" "}
                      {n.rubrik}
                    </p>
                    <span
                      title="Påverkanspoäng 0–100 ur nyhetsmotorn (raknaPaverkan): bas + nyckelordsvikter + portföljbonus"
                      className="tabular shrink-0 rounded-full border border-gold/30 bg-gold/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-guld-djup"
                    >
                      {n.paverkan} p
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{n.kalla}</p>
                  {n.ak1aNot && (
                    <p className="mt-1 text-[10px] italic leading-snug text-muted-foreground">
                      AK1A-koppling {n.ak1aNot.vVariables.join(", ")}: {n.ak1aNot.tanke}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* ── 6. Peer-sammanfattning ── */}
        <section className="mt-6 break-inside-avoid">
          <h3 className="font-serif text-lg font-bold">Peer-sammanfattning — de tre största innehaven</h3>
          {peerTopp.length === 0 ? (
            <p className="mt-1 text-xs italic text-muted-foreground">
              Peer-läslaget saknar underlag för dessa innehav — peer påhittas aldrig.
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {peerTopp.map((i) => {
                const p = i.peer!;
                return (
                  <li key={i.ticker} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs">
                    <span className="font-mono font-semibold">{i.ticker}</span>
                    <span className="text-muted-foreground">
                      i {(BRANSCH_NAMN[i.bransch] ?? i.bransch).toLowerCase()}:
                    </span>
                    <span className="text-muted-foreground">
                      peer-percentil <span className="font-mono font-bold text-foreground">{p.peerPercentil}</span> ·
                      rank <span className="font-mono font-bold text-foreground">{peerRankText(p)}</span> · AKM2{" "}
                      {poangText(i.akm2)} mot branschmedian {poangText(p.branschMedian)} (drag{" "}
                      {peerDragText(p.peerDrag)})
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
            Peer är ett läslager — aldrig poängkomponent, aldrig underlag i portföljbygget
            (VÅG 59, r3). Referens: {peerTopp[0]?.peer?.referens ?? demoklient.kalla}.
          </p>
        </section>

        {/* ── Mal-låst metod-/risk-sida (BESLUT §3 K5 — tre lager ur tenant-lagret) ── */}
        <MalLastSida
          tenant={tenant}
          underlagsdatum={demoklient.underlagsdatum}
          osattText={osattText}
          forskningsText={forskningsText}
        />

        <footer className="mt-6 border-t border-gold/25 pt-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-gold">
            AK1A PRO · Rapportverkstan · mötespaket-mall
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
            Framtaget med AK1A-metodiken ur {demoklient.kalla}. Underlaget är pedagogisk
            forskning som beskriver lägen — rådgivaren svarar för sin rådgivning och sin
            lämplighetsprövning (2007:528).
          </p>
        </footer>
      </ProRapportDok>
    </section>
  );
}
