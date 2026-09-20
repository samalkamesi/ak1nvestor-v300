"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NetnetRad } from "@/lib/netnet-motor";

// ═══════════════════════════════════════════════════════════
// MEGA PLAN A5: NET-NET-SKANNERN — Grahams cigar-butts på 25
// nordiska bolag. NCAV = omsättningstillgångar − totala skulder
// (Grahams offentliga formel från The Intelligent Investor):
// handlar bolaget under 2/3 × NCAV per aktie är det ett net-net —
// marknaden betalar mindre än rörelsekapitalet och resten är gratis.
// Datamotorn (server action → src/lib/netnet-motor.ts) hämtar
// balansräkning via Yahoos cookie+crumb-flöde, 15 tickers per
// anrop i 4 parallella strömmar. Cacha senaste skanning 30 min.
// Persistens: localStorage "ak1a-netnet-v1".
// ═══════════════════════════════════════════════════════════

/** Server action-prop: skickar en batch (max 15) till motorn på servern. */
type SkannaFn = (tickers: string[]) => Promise<NetnetRad[]>;

/** Fast universum — 25 välkända svenska/nordiska Large- och Mid Cap-tickers. */
const UNIVERSUM: readonly string[] = [
  "VOLV-B.ST",
  "SAAB-B.ST",
  "ATCO-A.ST",
  "SAND.ST",
  "ESSITY-B.ST",
  "ERIC-B.ST",
  "AZN.ST",
  "NDA-SE.ST",
  "SKF-B.ST",
  "ALFA.ST",
  "NCC-B.ST",
  "BALD-B.ST",
  "INDU-C.ST",
  "KINV-B.ST",
  "LATO-B.ST",
  "EVO.ST",
  "SINCH.ST",
  "SBB-B.ST",
  "CATE.ST",
  "NYF-B.ST",
  "FABG.ST",
  "BEIA-B.ST",
  "SHB-B.ST",
  "SWED-A.ST",
  "HM-B.ST",
];

/** Batchstorlek — samma tak som motorn (25 tickers → 15 + 10). */
const BATCH = 15;

/** Cache 30 minuter — balansräkningar förändras inte i realtid. */
const NYCKEL = "ak1a-netnet-v1";
const CACHE_MS = 30 * 60 * 1000;

/** Grahams offentliga köptröskel (2/3 av NCAV) — syns i UI, ingen hemlighet. */
const GRAHAM_TROSKEL = 0.667;

type KlassStil = { etikett: string; bg: string; text: string };

const KLASS_STIL: Record<"net-net" | "nära" | "ej", KlassStil> = {
  "net-net": { etikett: "NET-NET", bg: "rgba(4,120,87,0.12)", text: "#047857" },
  "nära": { etikett: "NÄRA", bg: "rgba(168,134,42,0.14)", text: "#a8862a" },
  "ej": { etikett: "EJ", bg: "rgba(90,80,69,0.12)", text: "#5a5045" },
};

/** Formatera tal svenskt (klient-renderat efter skanning — inga SSR-problem). */
const talX = (x: number | null | undefined, suffix = ""): string =>
  x !== null && x !== undefined && Number.isFinite(x)
    ? x.toLocaleString("sv-SE", { maximumFractionDigits: 2 }) + suffix
    : "—";

const klockslag = (epok: number): string =>
  new Date(epok).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });

/** Läs cache-rad (hydreringssäker: körs bara i useEffect). */
function lasCache(): { sparad: number; rader: NetnetRad[] } | null {
  try {
    const raw = window.localStorage.getItem(NYCKEL);
    if (!raw) return null;
    const parse: unknown = JSON.parse(raw);
    if (typeof parse !== "object" || parse === null) return null;
    const p = parse as { sparad?: unknown; rader?: unknown };
    if (typeof p.sparad !== "number" || !Array.isArray(p.rader)) return null;
    if (Date.now() - p.sparad > CACHE_MS) return null;
    const rader = p.rader.filter(
      (r): r is NetnetRad =>
        typeof r === "object" && r !== null && typeof (r as NetnetRad).ticker === "string",
    );
    return rader.length > 0 ? { sparad: p.sparad, rader } : null;
  } catch {
    return null;
  }
}

/** Skanna en batch via /api/netnet (route — inte server action). */
async function skannaBatch(tickers: string[]): Promise<NetnetRad[]> {
  const r = await fetch(`/api/netnet?tickers=${encodeURIComponent(tickers.join(","))}`, {
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`Skanningen misslyckades (${r.status})`);
  const d = (await r.json()) as { rader?: NetnetRad[] };
  return d.rader ?? [];
}

export function NetnetSkanner() {
  const [rader, setRader] = useState<NetnetRad[]>([]);
  const [kör, setKör] = useState(false);
  const [klara, setKlara] = useState(0);
  const [cachad, setCachad] = useState<number | null>(null);
  const [fel, setFel] = useState<string | null>(null);
  const igångRef = useRef(false);

  // Läs in cachad skanning vid montering (SSR-säkert).
  useEffect(() => {
    const c = lasCache();
    if (c) {
      setRader(c.rader);
      setCachad(c.sparad);
    }
  }, []);

  // ── Kör skanningen: universum i batchar om 15, progress per batch ────────
  const korSkanning = useCallback(async () => {
    if (igångRef.current) return;
    igångRef.current = true;
    setKör(true);
    setFel(null);
    setCachad(null);
    setKlara(0);
    setRader([]);
    try {
      const alla: NetnetRad[] = [];
      for (let start = 0; start < UNIVERSUM.length; start += BATCH) {
        const batch = UNIVERSUM.slice(start, start + BATCH);
        const svar = await skannaBatch(batch);
        alla.push(...svar);
        setKlara(Math.min(alla.length, UNIVERSUM.length));
      }
      setRader(alla);
      try {
        window.localStorage.setItem(NYCKEL, JSON.stringify({ sparad: Date.now(), rader: alla }));
      } catch {
        /* full disk eller privat läge — verktyget fungerar ändå */
      }
    } catch {
      setFel("Skanningen misslyckades (nätverk eller datakälla) — försök igen om en stund.");
    } finally {
      setKör(false);
      igångRef.current = false;
    }
  }, []);

  // ── Sortering: lägst förhållande först; utan data sist ───────────────────
  const sorterade = useMemo(() => {
    return [...rader].sort((a, b) => {
      const aFel = a.fel ? 1 : 0;
      const bFel = b.fel ? 1 : 0;
      if (aFel !== bFel) return aFel - bFel;
      const aTal = a.forhallande !== null && a.forhallande !== undefined ? 0 : 1;
      const bTal = b.forhallande !== null && b.forhallande !== undefined ? 0 : 1;
      if (aTal !== bTal) return aTal - bTal;
      if (aTal === 0 && bTal === 0) return (a.forhallande as number) - (b.forhallande as number);
      return a.ticker.localeCompare(b.ticker);
    });
  }, [rader]);

  const rakna = useMemo(() => {
    let netnet = 0;
    let nara = 0;
    let ej = 0;
    let felrader = 0;
    for (const r of rader) {
      if (r.fel) felrader++;
      else if (r.klass === "net-net") netnet++;
      else if (r.klass === "nära") nara++;
      else ej++;
    }
    return { netnet, nara, ej, felrader };
  }, [rader]);

  const harResultat = rader.length > 0;
  const procent = harResultat && !kör ? 100 : Math.round((klara / UNIVERSUM.length) * 100);

  // ── Rendera ──────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border-2 border-gold/40 bg-card p-4 sm:p-6">
      <p className="text-sm font-bold uppercase tracking-widest text-gold">
        🚬 Net-net-skannern — leta Grahams cigar-butts
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        25 välkända svenska och nordiska tickers skannas mot senaste balansräkning via Yahoo
        Finance. Två batchar (15 + 10), fyra parallella hämtningar — resultattabellen sorteras
        på kurs/NCAV-förhållandet så de billigaste cigar-butt-stubben hamnar överst.
      </p>

      {/* Pedagogisk ingress: formeln + varför net-net är sällsynta */}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-gold/30 bg-paper p-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gold">Formeln (Graham 1949)</p>
          <p className="mt-2 font-mono text-sm leading-relaxed text-foreground">
            NCAV = omsättningstillgångar − totala skulder
            <br />
            NCAV/aktie = NCAV ÷ antal aktier
            <br />
            Köp när: kurs &lt; 2/3 × NCAV/aktie
          </p>
          <p className="mt-2 text-xs italic text-muted-foreground">
            Benjamin Graham kallade dem &quot;cigar butts&quot;: slängda cigarett-stubbar som
            ändå har en sista, gratis bloss kvar. Köp en korg av dem — enskilda stubbar är
            rena lotter, statistiken sitter i spridningen.
          </p>
        </div>
        <div className="rounded-xl border border-gold/30 bg-paper p-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gold">Varför är de så sällsynta idag?</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Graham hittade sina net-net under 1930-talets depression, när hela marknader
            prissattes under rörelsekapitalet. Sedan dess har (1) snabbare information,
            (2) sekventiella värdeinvesterare som sveper sådana kurser på minuter och
            (3) lägre räntor gjort dem till museiföremål på stora börsen. De som dyker upp
            är ofta värdefällor: bolag som bränner kapital, får sin NCAV från gammal
            balansräkning eller skriver ned den i nästa rapport. Därför: en träff i
            skannern är början på granskning — aldrig ett köp.
          </p>
        </div>
      </div>

      {/* Kör-knapp + progress */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={korSkanning}
          disabled={kör}
          className="min-h-[44px] max-md:min-h-[52px] rounded-lg bg-gold px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {kör
            ? `Skannar… ${klara}/${UNIVERSUM.length}`
            : harResultat
              ? "Skanna universum igen"
              : "Skanna universum →"}
        </button>
        {harResultat && !kör && (
          <span className="text-[11px] italic text-muted-foreground">
            {cachad !== null
              ? `Cachad skanning från ${klockslag(cachad)} — balansräkningar förändras inte i realtid, så 30 minuters cache räcker gott.`
              : "Färsk skanning — sparas i webbläsaren i 30 minuter."}
          </span>
        )}
      </div>

      {/* Progress-bar */}
      {kör && (
        <div className="mt-3">
          <div className="h-3 w-full overflow-hidden rounded-full bg-gold/15">
            <div
              className="h-full rounded-full bg-gold transition-all duration-500"
              style={{ width: `${Math.max(4, procent)}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] italic text-muted-foreground">
            Hämtar balansräkningar via cookie+crumb-flödet — {klara} av {UNIVERSUM.length} klara.
          </p>
        </div>
      )}

      {fel && (
        <p className="mt-3 rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-700">
          ⚠ {fel}
        </p>
      )}

      {/* Sammanställnings-chips */}
      {harResultat && !kör && (
        <div className="mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          <div className="rounded-lg p-2" style={{ background: KLASS_STIL["net-net"].bg }}>
            <p className="font-mono text-lg font-bold" style={{ color: KLASS_STIL["net-net"].text }}>
              {rakna.netnet}
            </p>
            <p className="text-[10px] text-muted-foreground">net-net (&lt; 0,67× NCAV)</p>
          </div>
          <div className="rounded-lg p-2" style={{ background: KLASS_STIL["nära"].bg }}>
            <p className="font-mono text-lg font-bold" style={{ color: KLASS_STIL["nära"].text }}>
              {rakna.nara}
            </p>
            <p className="text-[10px] text-muted-foreground">nära (0,67–1,0× NCAV)</p>
          </div>
          <div className="rounded-lg p-2" style={{ background: KLASS_STIL["ej"].bg }}>
            <p className="font-mono text-lg font-bold" style={{ color: KLASS_STIL["ej"].text }}>
              {rakna.ej}
            </p>
            <p className="text-[10px] text-muted-foreground">ej net-net</p>
          </div>
          <div className="rounded-lg bg-gold/10 p-2">
            <p className="font-mono text-lg font-bold text-gold">{rakna.felrader}</p>
            <p className="text-[10px] text-muted-foreground">ingen data</p>
          </div>
        </div>
      )}

      {/* Resultat — mobil: kort-lista (ingen sidled scroll behövs); ≥sm: full tabell */}
      {harResultat ? (
        <>
          {/* Mobil (412px): varje bolag som kort med samma siffror som tabellen */}
          <div className="mt-4 space-y-2 sm:hidden">
            {sorterade.map((r) => {
              const stil = r.klass ? KLASS_STIL[r.klass] : null;
              return (
                <div
                  key={r.ticker}
                  className={`rounded-xl border border-gold/30 bg-paper p-3 ${r.fel ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-sm font-semibold">
                      {r.ticker}
                      {r.namn ? (
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">{r.namn}</span>
                      ) : null}
                    </span>
                    {r.fel ? (
                      <span className="shrink-0 text-xs italic text-muted-foreground">ingen data</span>
                    ) : stil ? (
                      <span
                        className="inline-block shrink-0 rounded px-2 py-0.5 text-[10px] font-bold tracking-wider"
                        style={{ background: stil.bg, color: stil.text }}
                      >
                        {stil.etikett}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 border-t border-gold/15 pt-2 text-center">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Kurs</p>
                      <p className="font-mono text-sm font-bold">{r.fel ? "—" : talX(r.kurs)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">NCAV/aktie</p>
                      <p className="font-mono text-sm font-bold">{r.fel ? "—" : talX(r.ncavPerAktie)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Förhållande</p>
                      <p className="font-mono text-sm font-bold">
                        {r.fel ? "—" : r.forhallande !== null ? talX(r.forhallande, "×") : "neg. NCAV"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                    <p className="text-[11px] text-muted-foreground">
                      P/E <span className="font-mono font-bold text-foreground">{talX(r.pe)}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      P/B <span className="font-mono font-bold text-foreground">{talX(r.pb)}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ≥sm: resultattabell med horisontell scroll-wrapper */}
          <div className="mt-4 hidden overflow-x-auto rounded-xl border border-gold/30 bg-paper sm:block">
            <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gold/30 text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 font-semibold">Bolag</th>
                <th className="px-3 py-2 text-right font-semibold">Kurs</th>
                <th className="px-3 py-2 text-right font-semibold">NCAV/aktie</th>
                <th className="px-3 py-2 text-right font-semibold">Förhållande</th>
                <th className="px-3 py-2 text-right font-semibold">P/E</th>
                <th className="px-3 py-2 text-right font-semibold">P/B</th>
                <th className="px-3 py-2 text-right font-semibold">Klass</th>
              </tr>
            </thead>
            <tbody>
              {sorterade.map((r) => {
                const stil = r.klass ? KLASS_STIL[r.klass] : null;
                return (
                  <tr
                    key={r.ticker}
                    className={`border-b border-gold/15 last:border-0 ${r.fel ? "text-muted-foreground opacity-60" : ""}`}
                  >
                    <td className="px-3 py-2">
                      <span className="font-semibold">{r.ticker}</span>
                      {r.namn && (
                        <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">
                          {r.namn}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{r.fel ? "—" : talX(r.kurs)}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {r.fel ? "—" : talX(r.ncavPerAktie)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {r.fel ? "—" : r.forhallande !== null ? talX(r.forhallande, "×") : "neg. NCAV"}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{talX(r.pe)}</td>
                    <td className="px-3 py-2 text-right font-mono">{talX(r.pb)}</td>
                    <td className="px-3 py-2 text-right">
                      {r.fel ? (
                        <span className="text-xs italic text-muted-foreground">ingen data</span>
                      ) : stil ? (
                        <span
                          className="inline-block rounded px-2 py-0.5 text-[10px] font-bold tracking-wider"
                          style={{ background: stil.bg, color: stil.text }}
                        >
                          {stil.etikett}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          {/* Gemensam förklaring — syns oavsett om kort-listan eller tabellen visas */}
          <p className="mt-2 text-[11px] italic leading-relaxed text-muted-foreground">
            Förhållande = kurs ÷ NCAV per aktie. Grönt NET-NET = kurs under{" "}
            {GRAHAM_TROSKEL.toString().replace(".", ",")}× NCAV (Grahams 2/3-regel); guld NÄRA =
            under 1,0× NCAV; &quot;neg. NCAV&quot; = skulderna äter upp omsättningstillgångarna —
            det motsatta av ett net-net. P/E och P/B är bonuskolumner, inte krav i kriteriet.
          </p>
        </>
      ) : (
        !kör && (
          <p className="mt-4 rounded-xl border border-dashed border-gold/30 bg-paper p-4 text-center text-xs italic text-muted-foreground">
            Ingen skanning ännu. Tryck på knappen ovan — 25 tickers hämtas i två batchar och
            sorteras på hur nära Grahams 2/3-tröskel de handlas.
          </p>
        )
      )}

      {/* Disclaimer */}
      <p className="mt-6 rounded-xl border border-gold/30 bg-gold/10 p-3 text-center text-xs italic text-gold">
        Pedagogiskt screeningverktyg — inte investeringsråd. NCAV-formeln är Grahams offentliga
        ur 1949, men en träff är en fråga, inte ett svar: kontrollera alltid färsk rapport,
        kassaflöde och varför marknaden prissätter bolaget under rörelsekapitalet.
      </p>

      {/* Fördjupa dig — från träff till förståelse */}
      <div className="mt-6 rounded-xl border border-gold/30 bg-card p-5">
        <h3 className="font-serif text-lg font-bold">Fördjupa dig</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          En net-net-träff är början på läxan, inte slutet:
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Link
            href="/kurser/the-intelligent-investor"
            className="rounded-xl border border-gold/30 bg-paper p-4 transition-colors hover:border-gold/60"
          >
            <p className="font-serif text-base font-bold text-gold">Grahams original →</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Kursen The Intelligent Investor — kapitlen bakom cigar-butts, NCAV och
              marginal of safety, från källan själv.
            </p>
          </Link>
          <Link
            href="/konfluens"
            className="rounded-xl border border-gold/30 bg-paper p-4 transition-colors hover:border-gold/60"
          >
            <p className="font-serif text-base font-bold text-gold">Konfluensradarn →</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Ett billigt bolag är inte nog — korsläs mot radarns fem källor: värdegolvet
              möter vändande vågor?
            </p>
          </Link>
          <Link
            href="/superanalys"
            className="rounded-xl border border-gold/30 bg-paper p-4 transition-colors hover:border-gold/60"
          >
            <p className="font-serif text-base font-bold text-gold">Superanalysen →</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Kör hela 24-stegsanalysen på träffen: V01–V20 med formel och trösklar —
              är det en värdefälla eller ett fynd?
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
