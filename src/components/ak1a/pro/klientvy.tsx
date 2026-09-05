"use client";

/**
 * KLIENTVYN — /pro/klienter: DEMOKLIENTEN (VÅG 61 bygg-4, B2B-BESLUT §4c).
 *
 * "MÖTESPAKETET är klientvys-knappen" — vyn samlar bara färdiga motorer:
 *   - korthuvud (alias + nästa uppföljning — deterministiskt härledd)
 *   - portföljöversikt: innehav × vikt + VagCell-rader per horisont +
 *     differens-chip "ändrat sedan sist" (då-vs-nu ur jamforDåNu)
 *   - AKM2-radar + profiljämförelse på tunga innehav — PROP-DRIVNA ur
 *     akm2-dashboard.tsx (importeras, ändras ALDRIG)
 *   - vågprofil-kort: VagkurvaGraf (vagkurva-graf.tsx — live ur vågmotorn)
 *   - peer-rad per innehav (peer.ts:s formaterare, VÅG 59-läslaget)
 *   - MÖTESPAKET-A4-KNAPP → /pro/rapporter?mall=motespaket
 *
 * ICKE-PERSON (P3/FORBUD 1): demoklienten är en medföljande forsknings-
 * portfölj — inget namn, ingen depå, inga personuppgifter; aliaset säger
 * vad det är. Låsraden bär 2007:528-formuleringen (BESLUT §4).
 *
 * Alla texter beskriver — dömer aldrig. Pedagogisk forskning — ALDRIG
 * investeringsrådgivning (lagen 2007:528).
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Akm2Radar, ProfilJamforelse } from "@/components/ak1a/akm2-dashboard";
import { VagkurvaGraf } from "@/components/ak1a/vagkurva-graf";
import {
  BRANSCH_NAMN,
  HZ_VISNING,
  StatusChip,
  VAG_TEXT,
  VagCell,
  datumText,
  poangText,
} from "@/components/ak1a/portfolj-forskning/vag-stil";
import { peerDragText, peerRankText } from "@/lib/portfolj-forskning/peer";
import type { Demoklient, DemoklientInnehav } from "@/components/ak1a/pro/demoklient-data";

/** Låsraden — BESLUT §4: "låsrad på varje vy". */
const LASRAD = "Pedagogisk forskning — inte investeringsrådgivning (2007:528).";

/** Differens-chip "ändrat sedan sist" (BESLUT §7 steg 4(i)). */
function DifferensChip({ ticker, jamforelser }: { ticker: string; jamforelser: Demoklient["jamforelser"] }) {
  const j = jamforelser.find((x) => x.ticker === ticker);
  if (!j || j.akm1Delta === null) {
    return (
      <span
        title="Första mätningen — ingen tidigare snapshot att jämföra med. Differens-chippet fylls vid nästa uppföljningsrond (jamforDåNu, uppfoljning.ts)."
        className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2 py-0.5 font-mono text-[9px] font-bold text-muted-foreground"
      >
        = första mätningen
      </span>
    );
  }
  const d = j.akm1Delta;
  const klass =
    d > 0
      ? "border-bull/30 bg-bull/10 text-bull"
      : d < 0
        ? "border-bear/30 bg-bear/10 text-bear"
        : "border-gold/30 bg-gold/10 text-foreground";
  return (
    <span
      title={`AKM1 då ${j.akm1Da} → nu ${j.akm1Nu} (${d >= 0 ? "+" : "−"}${Math.abs(Math.round(d * 10) / 10)} poäng) — jamforDåNu, uppfoljning.ts`}
      className={`tabular inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold ${klass}`}
    >
      {d > 0 ? "↑" : d < 0 ? "↓" : "="} {d >= 0 ? "+" : "−"}
      {String(Math.abs(Math.round(d * 10) / 10)).replace(".", ",")} sedan sist
    </span>
  );
}

/** Peer-raden — korstabellens VÅG 59-formatterare, oförändrad ton. */
function PeerRad({ innehav }: { innehav: DemoklientInnehav }) {
  const p = innehav.peer;
  const branschNamn = BRANSCH_NAMN[innehav.bransch] ?? innehav.bransch;
  if (!p || p.osatt || p.peerPercentil === null || p.rank === null) {
    return (
      <p className="text-[10px] italic text-muted-foreground">
        Peer ej beräknat för denna rad ({p?.osattOrsak ?? "läslager saknas"}) — branschgruppen
        {p ? ` ${p.antalIGruppen} bolag` : ""} i {branschNamn.toLowerCase()}.
      </p>
    );
  }
  return (
    <p
      className="text-[10px] leading-relaxed text-muted-foreground"
      title={`AKM2 ${poangText(innehav.akm2)} mot branschmedian ${poangText(p.branschMedian)} (drag ${peerDragText(p.peerDrag)}) · referens ${p.referens} · peer är ett läslager som aldrig påverkar poängen`}
    >
      Peer <span className="font-mono font-bold text-foreground">{p.peerPercentil}</span> · rank{" "}
      <span className="font-mono font-bold text-foreground">{peerRankText(p)}</span> i{" "}
      {branschNamn.toLowerCase()} · drag {peerDragText(p.peerDrag)} mot medianen
    </p>
  );
}

/** En innehavsrad i portföljöversikten — vikt, poäng, vågrader, peer. */
function InnehavRad({
  innehav,
  jamforelser,
  valbar,
  vald,
  onValj,
}: {
  innehav: DemoklientInnehav;
  jamforelser: Demoklient["jamforelser"];
  valbar: boolean;
  vald: boolean;
  onValj: () => void;
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        vald ? "border-gold/60 bg-gold/5" : "border-gold/20 bg-card hover:border-gold/40"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          {valbar ? (
            <button
              type="button"
              onClick={onValj}
              className="text-left font-serif text-base font-bold hover:text-gold"
              title="Visa AKM2-radar + profiljämförelse för detta innehav"
            >
              {innehav.ticker}
            </button>
          ) : (
            <span className="font-serif text-base font-bold">{innehav.ticker}</span>
          )}
          <span className="ml-2 text-xs text-muted-foreground">{innehav.namn}</span>
          <span className="ml-2 rounded-full border border-gold/25 bg-paper px-2 py-0.5 text-[10px] text-muted-foreground">
            {BRANSCH_NAMN[innehav.bransch] ?? innehav.bransch}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusChip status={innehav.status} />
          <DifferensChip ticker={innehav.ticker} jamforelser={jamforelser} />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-1 text-xs">
        <span className="text-muted-foreground">
          Vikt <span className="font-mono font-bold text-foreground">{Math.round(innehav.vikt * 1000) / 10} %</span>
        </span>
        <span className="text-muted-foreground">
          AKM1 <span className="font-mono font-bold text-foreground">{poangText(innehav.akm1Totalt)}</span>
          {innehav.akm1MaxMojligt !== null && (
            <span className="font-mono text-[10px] text-muted-foreground">/{Math.round(innehav.akm1MaxMojligt)}</span>
          )}
        </span>
        <span className="text-muted-foreground">
          AKM2{" "}
          <span className="font-mono font-bold text-foreground">{poangText(innehav.akm2)}</span>
          {innehav.akm2Skillnad !== null && (
            <span
              className={`ml-1 font-mono text-[10px] font-bold ${
                innehav.akm2Skillnad > 0 ? "text-bull" : innehav.akm2Skillnad < 0 ? "text-bear" : "text-muted-foreground"
              }`}
              title="AKM2 − AKM1: hur moduler (V21+), omfördelning vid osatt data och viktprofilen flyttar totalen"
            >
              {innehav.akm2Skillnad > 0 ? "+" : innehav.akm2Skillnad < 0 ? "−" : "±"}
              {String(Math.abs(Math.round(innehav.akm2Skillnad * 10) / 10)).replace(".", ",")}
            </span>
          )}
        </span>
        <span className="text-muted-foreground">
          Kontrollerad <span className="font-mono text-foreground">{datumText(innehav.senastKontrollerad)}</span>
        </span>
      </div>

      {/* VagCell-rader per horisont — fundamental + teknisk (BESLUT §4c). */}
      <div className="mt-3 grid gap-2 border-t border-gold/15 pt-2 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Fundamental våg</p>
          <div className="mt-1 flex items-center gap-1">
            {HZ_VISNING.map((h) => (
              <VagCell
                key={h.id}
                klass={innehav.fvagPerHorisont?.[h.id] ?? "osatt"}
                titel={`${innehav.ticker} · fundamental ${h.namn.toLowerCase()} (${h.hjalp}): ${VAG_TEXT[innehav.fvagPerHorisont?.[h.id] ?? "osatt"]}`}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Teknisk våg</p>
          <div className="mt-1 flex items-center gap-1">
            {HZ_VISNING.map((h) => (
              <VagCell
                key={h.id}
                klass={innehav.tvagPerHorisont?.[h.id] ?? "osatt"}
                titel={`${innehav.ticker} · teknisk ${h.namn.toLowerCase()}: ${VAG_TEXT[innehav.tvagPerHorisont?.[h.id] ?? "osatt"]}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <PeerRad innehav={innehav} />
      </div>
    </div>
  );
}

// ── Komponenten ──────────────────────────────────────────────────────────────

export function Klientvy({ demoklient }: { demoklient: Demoklient }) {
  const { innehav, akm2Resultat } = demoklient;

  /** Tunga innehav = de med fullt AKM2-resultat (radarns underlag). */
  const tunga = useMemo(
    () => innehav.filter((i) => akm2Resultat[i.ticker] !== undefined),
    [innehav, akm2Resultat],
  );
  const [aktivTicker, setAktivTicker] = useState<string>(tunga[0]?.ticker ?? "");

  const aktivt = aktivTicker && akm2Resultat[aktivTicker] ? akm2Resultat[aktivTicker] : null;
  const aktivtInnehav = innehav.find((i) => i.ticker === aktivTicker) ?? null;

  return (
    <div className="space-y-8" data-demoklient="">
      {/* ── Korthuvud — alias + nästa uppföljning ── */}
      <section className="gravor-ram rounded-xl bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-guld-djup">
              Klientvy · MVP på demoklient
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold">{demoklient.alias}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {demoklient.beskrivning}
            </p>
          </div>
          <div className="shrink-0 space-y-1.5 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nästa uppföljning</p>
            <p className="font-mono text-sm font-bold">
              {demoklient.nastaUppfoljning ? datumText(demoklient.nastaUppfoljning) : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              månadsintervall ur senaste kontroll
              {demoklient.underlagsdatum ? ` · underlag ${datumText(demoklient.underlagsdatum)}` : ""}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-gold/15 pt-4">
          <Link
            href="/pro/rapporter?mall=motespaket"
            className="btn-guld-signatur inline-flex min-h-[44px] items-center gap-2 px-5 text-sm"
            title="Samla regim + forskningsläge + vågprofil + då-vs-nu + topp-3 nyheter + peer till ett utskriftbart A4"
          >
            Mötespaket-A4 →
          </Link>
          <Link
            href="/pro/rapporter"
            className="btn-marin inline-flex min-h-[44px] items-center px-5 text-sm"
            style={{ background: "transparent" }}
          >
            Rapportverkstan
          </Link>
          <p className="text-xs italic text-muted-foreground">
            {innehav.length} innehav · likaviktade · {demoklient.kalla}
          </p>
        </div>
      </section>

      {/* ── Portföljöversikt: innehav × vikt + aggregerad vågprofil ── */}
      <section aria-label="Portföljöversikt">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl font-bold">Portföljöversikt</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Innehav × vikt med VagCell-rader per horisont och differens-chip "ändrat sedan sist".
            </p>
          </div>
          <div className="rounded-xl border border-gold/30 bg-gold/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-guld-djup">
              Aggregerad vågprofil (vikttungaste klass)
            </p>
            <div className="mt-2 flex items-center gap-1">
              {demoklient.vagsammansattning.map((v) => (
                <span key={v.horisont} className="flex flex-col items-center gap-1">
                  <VagCell
                    klass={v.klass}
                    titel={`Portföljens fundamental dominanta klass på ${v.horisont}: ${VAG_TEXT[v.klass]} — ${Math.round(v.osattAndel * 100)} % av vikten osatt`}
                  />
                  <span className="text-[9px] text-muted-foreground">{v.horisont.slice(0, 4)}</span>
                </span>
              ))}
            </div>
            <p className="mt-1.5 text-[9px] leading-snug text-muted-foreground">
              Osatt-andel per horisont:{" "}
              {demoklient.vagsammansattning
                .map((v) => `${v.horisont.slice(0, 4)} ${Math.round(v.osattAndel * 100)} %`)
                .join(" · ")}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {innehav.map((i) => (
            <InnehavRad
              key={i.ticker}
              innehav={i}
              jamforelser={demoklient.jamforelser}
              valbar={akm2Resultat[i.ticker] !== undefined}
              vald={aktivTicker === i.ticker}
              onValj={() => setAktivTicker(i.ticker)}
            />
          ))}
        </div>

        {/* Då-vs-nu-raden — jamforDåNu kör; första mätningen är ett ärligt svar. */}
        <div className="mt-4 rounded-xl border border-gold/20 bg-paper p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Då vs nu — uppföljningsmotorn (jamforDåNu)
          </p>
          {!demoklient.daFinns ? (
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Platshållare, ärligt märkt:</strong> ingen tidigare
              snapshotserie finns ännu för portfölj-id {demoklient.portfoljId} — detta är den första
              mätningen, så varje differens-chip ovan visar "första mätningen" i stället för ett
              påhittat delta. Uppföljningscronen fyller då-sidan vid nästa månadsrond; jamforDåNu är
              redan kopplad och kör på riktiga snapshots då.
            </p>
          ) : (
            <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-muted-foreground">
              {demoklient.jamforelser.map((j) => (
                <li key={j.ticker}>{j.text}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── AKM2-radar + profiljämförelse på tunga innehav ── */}
      <section aria-label="AKM2-radar och profiljamforelse">
        <h3 className="font-serif text-xl font-bold">AKM2-radar + profiljämförelse</h3>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Prop-drivna komponenter ur AKM2-dashboards underlag — samma kärna som
          kalkylatorn och forskningsbiblioteket. Klicka på ett innehavsnamn i
          översikten ovan för att byta radarns bolag.
        </p>

        {tunga.length === 0 ? (
          <p className="mt-4 rounded-xl border border-gold/20 bg-card p-4 text-sm text-muted-foreground">
            Radarunderlag saknas (AKM2-cachen tom för samtliga innehav) — vyn gissar aldrig.
          </p>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              {tunga.map((i) => (
                <button
                  key={i.ticker}
                  type="button"
                  onClick={() => setAktivTicker(i.ticker)}
                  className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
                    aktivTicker === i.ticker
                      ? "border-gold/60 bg-gold/15 text-foreground"
                      : "border-gold/20 text-muted-foreground hover:border-gold/40 hover:text-foreground"
                  }`}
                >
                  {i.ticker}
                </button>
              ))}
            </div>

            {aktivt && (
              <div className="mt-4 grid items-start gap-4 lg:grid-cols-[360px_1fr]">
                <Akm2Radar resultat={aktivt} rubrik={`🎯 ${aktivt.ticker} — AKM2-profil`} />
                <div className="space-y-4">
                  <ProfilJamforelse resultat={aktivt} />
                  {aktivtInnehav && <PeerRad innehav={aktivtInnehav} />}
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Komposit {aktivt.komposit}/100 · viktprofil {aktivt.lager4.viktprofil} ·
                    modellversion {aktivt.modellVersion}. Ur AKM2-cachen (våg 57 D2) — samma
                    beräkningskonfiguration som korstabellens berikning.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Vågprofil-kort — VagkurvaGraf (live ur vågmotorn) ── */}
      <section aria-label="Vågprofil per horisont">
        <h3 className="font-serif text-xl font-bold">Vågprofil — Elliott-läget per horisont</h3>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Vågkurvan läser vågmotorn (/api/vagfundament) per innehav — fem horisonter,
          pedagogisk Elliott-form, enighetsscore syns som den är.
        </p>
        <div className="mt-4">
          <VagkurvaGraf
            ticker={tunga[0]?.ticker ?? innehav[0]?.ticker ?? "VOLV-B.ST"}
            alternativ={innehav.map((i) => i.ticker)}
          />
        </div>
      </section>

      {/* ── Låsraden (BESLUT §4) ── */}
      <p className="border-t border-gold/20 pt-3 text-center text-[11px] italic text-muted-foreground">
        {LASRAD} Demoklienten bär inga personuppgifter — klientregistret öppnas
        först bakom DPA-grinden (G3, B2B-BESLUT §5).
      </p>
    </div>
  );
}

/** Tom-läge — ärligt, inget påhittat underlag. */
export function KlientvyTom() {
  return (
    <div className="gravor-ram rounded-xl bg-card p-8 text-center">
      <p className="font-serif text-2xl font-bold">Korstabellen har inte landat ännu</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Demoklienten byggs ur forskningsbibliotekets topp (korstabell-grund.json) — utan
        det underlaget finns inget att visa, och vyn gissar aldrig. Kom tillbaka när
        nästa forskningsrond levererat.
      </p>
      <p className="mt-6 text-[11px] italic text-muted-foreground">{LASRAD}</p>
    </div>
  );
}
