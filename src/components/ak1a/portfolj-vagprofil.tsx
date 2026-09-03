"use client";

import * as React from "react";
import Link from "next/link";
import { fas2Upplast, lasMedlem } from "@/lib/member-local";
import type { PortfoljVagSvar, VagKlassAndel, VagProfil } from "@/lib/portfolj-vagor";

/**
 * PORTFÖLJENS VÅGOR — hela portföljens samlade vågprofil på fem
 * tidshorisonter (mikro/kort/medellång/lång/mega). Användarens
 * kärn-vision: "portföljens rörelse i vågor på mikro, kort, medellång,
 * lång och mega" — en bild, fem tidsfönster.
 *
 * FAS 2-MÄRKT: panelen VISAS för alla, innehållet låses bakom Fas 2
 * (lokal harFas2Access — kurs-access.ts finns inte ännu). Utan Fas 2:
 * preview med fem låsta horisont-ikoner + CTA. Med Fas 2: vågchips,
 * per-aktie-tabell och portföljens vågbild i text.
 *
 * DATAVÄGAR (analys-motorn är server-only — Node-dns — så klienten kör
 * den aldrig själv; netnet-skannerns mönster):
 *  1. raknaVagor-prop (server action): en serverkomponent skickar med
 *     raknaPortfoljVagor från src/lib/portfolj-vagor.ts tillsammans med
 *     tickers/vikter — komponenten "kör" motorn via servern.
 *  2. portfolioId-prop: fetch av BEFINTLIG portfölj-aggregering från
 *     /api/member/portfolio/djupanalys och mappning till samma form.
 *
 * Hydration-säker: ingen localStorage/Date i render — Fas 2-kollen och
 * all hämtning sker i effekter efter montering; server och första
 * klientrendering visar identisk låst preview.
 */

// ── Horisonter och vågklasser (spegling av lib/portfolj-vagor.ts) ────────────

const HORIZONTER: Array<{ id: string; namn: string; hjalp: string }> = [
  { id: "mikro", namn: "Mikro", hjalp: "senaste dagarnas rytm" },
  { id: "kort", namn: "Kort", hjalp: "kvartalets rytm" },
  { id: "medellang", namn: "Medellång", hjalp: "tolvmånadersrytmen" },
  { id: "lang", namn: "Lång", hjalp: "konjunkturvågan" },
  { id: "mega", namn: "Mega", hjalp: "sekulärvågan genom hela historiken" },
];

const HZ_IDS = HORIZONTER.map((h) => h.id);

const KLASSER: Array<keyof VagKlassAndel> = ["impulsvag", "korrigering", "basbygge", "osatt"];

const KLASS_TEXT: Record<keyof VagKlassAndel, string> = {
  impulsvag: "impulsvåg",
  korrigering: "korrigering",
  basbygge: "basbygge",
  osatt: "osatt",
};

const KLASS_IKON: Record<keyof VagKlassAndel, string> = {
  impulsvag: "▲",
  korrigering: "▼",
  basbygge: "◼",
  osatt: "·",
};

/** impulsvåg = grön (bull), korrigering = röd (bear), basbygge = guld. */
const KLASS_STIL: Record<keyof VagKlassAndel, string> = {
  impulsvag: "border-bull/30 bg-bull/15 text-bull",
  korrigering: "border-bear/30 bg-bear/15 text-bear",
  basbygge: "border-gold/40 bg-gold/15 text-gold",
  osatt: "border-border bg-muted/30 text-muted-foreground",
};

/** Analys-motorns vågklass (med å) -> profilnyckel (utan å). */
const KLASS_NYCKEL: Record<string, keyof VagKlassAndel | undefined> = {
  "impulsvåg": "impulsvag",
  korrigering: "korrigering",
  basbygge: "basbygge",
  osatt: "osatt",
};

// ── Lokala hjälpmedel ────────────────────────────────────────────────────────

/** Lokal Fas 2-koll: inloggad medlem som låst upp Fas 2-porten genom
 *  Fas 1 (nivå >= 25, member-local.fas2Upplast). Läses endast i effekt. */
function harFas2Access(): boolean {
  return Boolean(lasMedlem()) && fas2Upplast();
}

function nollRad(): VagKlassAndel {
  return { impulsvag: 0, korrigering: 0, basbygge: 0, osatt: 0 };
}

function nollProfil(): VagProfil {
  const p: VagProfil = {};
  for (const id of HZ_IDS) p[id] = nollRad();
  return p;
}

/** Dominerande klass i en andelsrad (fast ordning => deterministiskt).
 *  Rad utan täckning (alla värden 0) => osatt — aldrig impulsvåg på bara 0. */
function dominerande(rad: VagKlassAndel | undefined): keyof VagKlassAndel {
  if (!rad) return "osatt";
  let basta: keyof VagKlassAndel = "osatt";
  let belopp = -1;
  for (const k of KLASSER) {
    if (rad[k] > belopp) {
      belopp = rad[k];
      basta = k;
    }
  }
  return belopp <= 0 ? "osatt" : basta;
}

/** Indikatorprofil per horisont ur motorns vager (en klass = 1 per horisont). */
function profilFranVager(vager?: Record<string, string>): VagProfil {
  const p = nollProfil();
  for (const id of HZ_IDS) {
    const nyckel = vager ? KLASS_NYCKEL[vager[id]] : undefined;
    p[id][nyckel ?? "osatt"] = 1;
  }
  return p;
}

/** Andel 0–1 ur djupanalysens procenttal (0–100, ihopklampt 0–1). */
function procentTillAndel(v: number | undefined): number {
  const andel = Math.max(0, Math.min(1, (v ?? 0) / 100));
  return Math.round(andel * 1000) / 1000;
}

/** Svenskt tal: 3 -> "3", 2.5 -> "2,5". */
function talText(x: number): string {
  const v = Math.round(x * 10) / 10;
  return String(v === 0 ? 0 : v).replace(".", ",");
}

/** Samma deterministiska format som lib-motorns totalText (speglad för
 *  djupanalys-vägen — lib-filen får inte värde-importeras i klienten). */
function totalTextFranProfil(portfolj: VagProfil, harData: boolean): string {
  if (!harData) {
    return (
      "Portföljens vågbild är än så länge osatt — motorn fick ingen data att läsa. " +
      "Motorn gissar aldrig; välkommen tillbaka när underlaget finns."
    );
  }
  const segment = HZ_IDS.map((id) => {
    const k = dominerande(portfolj[id]);
    return `${KLASS_TEXT[k]} på ${HORIZONTER.find((h) => h.id === id)?.namn.toLowerCase() ?? id}`;
  });
  const forsta = dominerande(portfolj[HZ_IDS[0]]);
  const sista = dominerande(portfolj[HZ_IDS[HZ_IDS.length - 1]]);
  const fog = sista !== forsta ? " men " : " och ";
  const huvudtext = segment.slice(0, -1).join(", ") + fog + segment[segment.length - 1];
  const rakning: Record<keyof VagKlassAndel, number> = nollRad();
  for (const id of HZ_IDS) rakning[dominerande(portfolj[id])] += 1;
  const delar = KLASSER.filter((k) => rakning[k] > 0)
    .sort((a, b) => rakning[b] - rakning[a])
    .map((k) => `${talText(rakning[k])} ${KLASS_TEXT[k]}`);
  return (
    `Portföljen är i genomsnitt i ${huvudtext}. ` +
    `Räknat över alla fem horisonter: ${delar.join(", ")}. ` +
    "Vågorna beskriver portföljens rytm just nu — en bild att studera och lära av, inte en uppmaning att agera."
  );
}

// ── Djupanalys-vägen: befintlig portfölj-aggregering -> samma form ───────────

type DjupanalysSvar = {
  error?: string;
  analysTackning?: number;
  innehav?: Array<{
    ticker: string;
    viktProcent?: number;
    analys?: { fel?: string; vager?: Record<string, string> } | null;
  }>;
  portfolj?: { vagProfil?: Record<string, Record<string, number>> } | null;
};

function franDjupanalys(j: DjupanalysSvar): { svar: PortfoljVagSvar; tackning: number | null } {
  const perAktie: Record<string, VagProfil> = {};
  for (const h of j.innehav ?? []) {
    if (!h?.ticker) continue;
    const ok = Boolean(h.analys && !h.analys.fel && h.analys.vager);
    perAktie[h.ticker] = ok ? profilFranVager(h.analys?.vager) : profilFranVager(undefined);
  }

  const portfolj: VagProfil = nollProfil();
  let harData = false;
  for (const id of HZ_IDS) {
    const rad = j.portfolj?.vagProfil?.[id];
    portfolj[id] = {
      impulsvag: procentTillAndel(rad?.["impulsvåg"]),
      korrigering: procentTillAndel(rad?.korrigering),
      basbygge: procentTillAndel(rad?.basbygge),
      osatt: procentTillAndel(rad?.osatt),
    };
    // täckning endast om någon vågklass faktiskt fått vikt (inte bara nollrader)
    if (portfolj[id].impulsvag > 0 || portfolj[id].korrigering > 0 || portfolj[id].basbygge > 0) {
      harData = true;
    }
  }

  const sammanfattning: VagKlassAndel = nollRad();
  for (const id of HZ_IDS) {
    sammanfattning.impulsvag += portfolj[id].impulsvag;
    sammanfattning.korrigering += portfolj[id].korrigering;
    sammanfattning.basbygge += portfolj[id].basbygge;
    sammanfattning.osatt += portfolj[id].osatt;
  }

  return {
    svar: {
      perAktie,
      portfolj,
      totalText: totalTextFranProfil(portfolj, harData),
      sammanfattning: {
        impulsvag: Math.round(sammanfattning.impulsvag * 10) / 10,
        korrigering: Math.round(sammanfattning.korrigering * 10) / 10,
        basbygge: Math.round(sammanfattning.basbygge * 10) / 10,
        osatt: Math.round(sammanfattning.osatt * 10) / 10,
      },
    },
    tackning: typeof j.analysTackning === "number" ? j.analysTackning : null,
  };
}

// ── Komponenten ──────────────────────────────────────────────────────────────

export function PortfoljVagProfil({
  portfolioId,
  tickers,
  vikter,
  raknaVagor,
}: {
  /** Hämta portföljens innehav via /api/member/portfolio/djupanalys. */
  portfolioId?: string;
  /** Tickers (max 10) — körs via raknaVagor-server-action om den ges. */
  tickers?: string[];
  /** Valfri viktning per ticker (andelar eller värden). */
  vikter?: Record<string, number>;
  /** Server action-prop: skicka med raknaPortfoljVagor från en
   *  serverkomponent så körs vågmotorn på servern (netnet-skannerns mönster). */
  raknaVagor?: (tickers: string[], vikter?: Record<string, number>) => Promise<PortfoljVagSvar>;
}) {
  const [fas2, setFas2] = React.useState(false);
  const [data, setData] = React.useState<PortfoljVagSvar | null>(null);
  const [tackning, setTackning] = React.useState<number | null>(null);
  const [laddar, setLaddar] = React.useState(false);
  const [fel, setFel] = React.useState<string | null>(null);
  const [korning, setKorning] = React.useState(0);

  // Stabila effektnycklar: innehållsstyra strängar i stället för array-/objektidentitet
  const tickerNyckel = React.useMemo(
    () => (Array.isArray(tickers) ? tickers.filter((t) => typeof t === "string" && t.trim() !== "").slice(0, 10).join(",") : ""),
    [tickers]
  );
  const viktNyckel = React.useMemo(() => (vikter ? JSON.stringify(vikter) : ""), [vikter]);

  React.useEffect(() => {
    setFas2(harFas2Access());
  }, []);

  React.useEffect(() => {
    if (!fas2) return;
    const lista = tickerNyckel ? tickerNyckel.split(",") : [];
    const viaMotor = Boolean(raknaVagor && lista.length > 0);
    if (!viaMotor && !portfolioId) return;

    let aktiv = true;
    setLaddar(true);
    setFel(null);

    (async () => {
      try {
        if (viaMotor && raknaVagor) {
          const v = viktNyckel ? (JSON.parse(viktNyckel) as Record<string, number>) : undefined;
          const svar = await raknaVagor(lista, v);
          if (!aktiv) return;
          setData(svar);
          setTackning(null);
        } else {
          const r = await fetch(
            `/api/member/portfolio/djupanalys?portfolioId=${encodeURIComponent(portfolioId ?? "")}`
          );
          const j = (await r.json()) as DjupanalysSvar;
          if (!r.ok || j?.error) throw new Error(j?.error || `portfölj-API:t svarade ${r.status}`);
          const { svar, tackning: t } = franDjupanalys(j);
          if (!aktiv) return;
          setData(svar);
          setTackning(t);
        }
      } catch (e) {
        if (!aktiv) return;
        setFel(e instanceof Error ? e.message : "kunde inte hämta vågprofilen");
      } finally {
        if (aktiv) setLaddar(false);
      }
    })();

    return () => {
      aktiv = false;
    };
  }, [fas2, portfolioId, raknaVagor, tickerNyckel, viktNyckel, korning]);

  const aktieRader = React.useMemo(
    () => (data ? Object.entries(data.perAktie) : []),
    [data]
  );

  return (
    <section className="marin-panel overflow-hidden rounded-2xl border border-gold/40">
      {/* Rubrikrad — marin signatur, tryckyta >= 44 px */}
      <header className="flex min-h-[44px] items-center border-b border-gold/30 px-4 py-3 sm:px-6 sm:py-4">
        <h3 className="font-serif text-sm font-bold uppercase tracking-[0.18em] text-[#E8C766] sm:text-base">
          PORTFÖLJENS VÅGOR
          <span className="ml-2 font-normal normal-case italic tracking-normal text-[#EDE6D6]/85">
            — på fem tidshorisonter
          </span>
        </h3>
      </header>
      <div className="hjarlinje" aria-hidden />

      <div className="bg-card p-4 sm:p-6">
        {!fas2 ? (
          /* ── Preview utan Fas 2: fem låsta horisonter + CTA ── */
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {HORIZONTER.map((h) => (
                <div
                  key={h.id}
                  title={`${h.namn} (${h.hjalp}) — låses upp i Fas 2`}
                  className="flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-lg border border-border bg-muted/30 px-1 py-2 text-center"
                >
                  <span className="text-sm leading-none" aria-hidden>🔒</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {h.namn}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm leading-relaxed">
              Portföljens vågor på fem horisonter — öppnas i Fas 2. Här ser du hela
              portföljens samlade vågprofil: mikrorytmen i veckan, konjunkturvågan på
              flera år och sekulärvågan genom hela historiken — en bild, fem tidsfönster.
            </p>
            <Link
              href="/fas2-ansok"
              className="btn-marin inline-flex min-h-[44px] items-center justify-center px-5 py-2.5 text-xs"
            >
              Öppna Fas 2 →
            </Link>
            <p className="text-[11px] text-muted-foreground">
              Fas 1 är hela biblioteket, kostnadsfritt för alltid — Fas 2 öppnas genom
              din egen resa, aldrig genom press.
            </p>
          </div>
        ) : !raknaVagor && !tickerNyckel && !portfolioId ? (
          /* ── Fas 2 öppen men ingen portfölj ansluten ── */
          <p className="text-sm leading-relaxed text-muted-foreground">
            Anslut en portfölj för att läsa dess vågor: skicka med <code>tickers</code>{" "}
            och <code>raknaVagor</code>-serveractionen, eller ett <code>portfolioId</code>{" "}
            — då hämtas din befintliga portfölj-aggregering.
          </p>
        ) : laddar ? (
          /* ── Motorn arbetar ── */
          <div className="space-y-4" aria-busy="true">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {HORIZONTER.map((h) => (
                <div key={h.id} className="h-[64px] animate-pulse rounded-lg bg-muted/50" />
              ))}
            </div>
            <p className="text-sm italic text-muted-foreground">
              Läser portföljens vågor på fem tidshorisonter …
            </p>
          </div>
        ) : fel ? (
          /* ── Ärlig felruta — aldrig dömande ── */
          <div className="rounded-lg border border-bear/30 bg-bear/5 p-4">
            <p className="font-serif text-sm font-bold text-bear">
              Vågprofilen kunde inte hämtas
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {fel} — motorn gissar aldrig: utan data finns ingen våg att läsa. Försök
              igen om en stund.
            </p>
            <button
              onClick={() => setKorning((n) => n + 1)}
              className="btn-marin mt-3 min-h-[44px] px-5 py-2.5 text-xs"
            >
              Försök igen
            </button>
          </div>
        ) : data ? (
          /* ── Full vågmatris-vy ── */
          <div className="space-y-5">
            {/* 1. Fem horisont-chips med dominerande vågklass */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {HORIZONTER.map((h) => {
                const dom = dominerande(data.portfolj[h.id]);
                const procent = Math.round((data.portfolj[h.id]?.[dom] ?? 0) * 100);
                return (
                  <div
                    key={h.id}
                    title={`${h.namn} — ${h.hjalp}: ${KLASS_TEXT[dom]} dominerar (${procent} % av portföljvikten)`}
                    className={"flex min-h-[44px] flex-col items-center justify-center rounded-lg border px-1 py-2 text-center " + KLASS_STIL[dom]}
                  >
                    <span className="text-base leading-none" aria-hidden>{KLASS_IKON[dom]}</span>
                    <span className="mt-1 text-[10px] font-bold uppercase tracking-wider">{h.namn}</span>
                    <span className="text-[10px] leading-tight">{KLASS_TEXT[dom]}</span>
                  </div>
                );
              })}
            </div>

            {/* 2. Per-aktie-tabell: ticker × fem horisonter */}
            {aktieRader.length > 0 ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Per aktie · vågklass på varje horisont
                </p>
                <p className="mt-1 text-[11px] italic text-muted-foreground sm:hidden">
                  Svep tabellen sidled — tickern följer med →
                </p>
                <div className="mt-2 overflow-x-auto scrollbar-ak1a">
                  <table className="w-full min-w-[380px] text-sm">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        <th className="sticky left-0 z-10 bg-card pb-1 pr-3 text-left font-semibold">Aktie</th>
                        {HORIZONTER.map((h) => (
                          <th key={h.id} className="pb-1 text-center font-semibold">{h.namn}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {aktieRader.map(([ticker, profil]) => (
                        <tr key={ticker} className="border-t border-border/60">
                          <td className="sticky left-0 z-10 bg-card py-1.5 pr-3 font-serif text-xs font-bold">
                            {ticker}
                          </td>
                          {HORIZONTER.map((h) => {
                            const klass = dominerande(profil?.[h.id]);
                            return (
                              <td key={h.id} className="py-1.5 text-center">
                                <span
                                  title={`${ticker} · ${h.namn}: ${KLASS_TEXT[klass]}`}
                                  className={"inline-flex h-8 w-8 items-center justify-center rounded border text-sm font-bold leading-none " + KLASS_STIL[klass]}
                                >
                                  {KLASS_IKON[klass]}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {/* 3. Portföljens sammanfattande vågbild i text */}
            <div className="rounded-lg border border-gold/40 bg-gold/5 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
                Portföljens vågbild
              </p>
              <p className="mt-1.5 text-sm leading-relaxed">{data.totalText}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {talText(data.sammanfattning.impulsvag)} impulsvåg ·{" "}
                {talText(data.sammanfattning.korrigering)} korrigering ·{" "}
                {talText(data.sammanfattning.basbygge)} basbygge ·{" "}
                {talText(data.sammanfattning.osatt)} osatt — räknat över fem horisonter
                {tackning !== null ? ` · ${tackning} % av portföljvikten analyserad` : ""}
              </p>
            </div>

            {/* 4. Disclaimer */}
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Pedagogisk analys — inte investeringsråd. Viktat genomsnitt per horisont av
              analys-motorns deterministiska vågklasser (max 10 innehav per beräkning);
              saknas data redovisas osatt — motorn gissar aldrig.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
