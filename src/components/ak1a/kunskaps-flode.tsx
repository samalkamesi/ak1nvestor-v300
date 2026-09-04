"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import flodeJson from "../../../data/kunskapsflode.json";

/**
 * KUNSKAPSFLÖDET — "Senaste nytt & nya kunskaper"-panelen.
 *
 * Kundägarens problem: Nyhetscentralen fanns men var osynlig i kundflödet —
 * och det fanns inget system för NYA KUNSKAPER (nya kurser, forsknings-
 * uppdateringar, nya verktyg). Denna panel gör båda omöjliga att missa:
 *
 *   Flik 1 · Nyheter      — topp-3 ur /api/nyheter (samma hämtning som
 *                           aktie-nyheter.tsx: sanitizing, timeout, graceful)
 *   Flik 2 · Nya kurser   — teamets kursnyheter ur data/kunskapsflode.json
 *                           (kategori "kurs") + länk till hela biblioteket.
 *                           Kurslistor hämtas annars SERVER-side via
 *                           lib/content (fs-läsning) och passar som props —
 *                           17 MB-katalogen hämtas aldrig av klienten, och
 *                           kurser saknar datum: kunskapsflödet ÄR den
 *                           enklaste och ärligaste källan för "nytt".
 *   Flik 3 · Vad är nytt  — hela flödet ur data/kunskapsflode.json
 *                           (system | forskning | kurs | verktyg), senaste
 *                           först, scrollbart.
 *
 * Design: marin kortstil med guld-accenter (samma DNA som morgon-briefing/
 * aktie-nyheter). Hydration-säkert: nät + datum logik sker ENDAST i
 * useEffect — första passt är deterministiskt. Alltid graceful: utan
 * nyheter visas viloläget, aldrig ett felmeddelande i ansiktet på eleven.
 *
 * Exporterar även NyhetsChips — kompakt rubrik-chipsvariant för besökare
 * (startsidan), som länkar vidare till /nyheter.
 *
 * Filen data/kunskapsflode.json uppdateras av teamet vid varje större
 * release (kommentarfältet "_kommentar" i filen).
 */

// ── Kunskapsflödet (statisk JSON — importeras direkt, resolveJsonModule) ────

type Kategori = "system" | "forskning" | "kurs" | "verktyg";

type FlodePost = {
  datum: string; // YYYY-MM-DD
  rubrik: string;
  text: string;
  lank: string; // intern sökväg, börjar med "/"
  kategori: Kategori;
};

const KATEGORIER: readonly Kategori[] = ["system", "forskning", "kurs", "verktyg"];

const KATEGORI_IKON: Record<Kategori, string> = {
  system: "🛠️",
  forskning: "🔬",
  kurs: "📚",
  verktyg: "🧰",
};

const KATEGORI_NAMN: Record<Kategori, string> = {
  system: "System",
  forskning: "Forskning",
  kurs: "Kurs",
  verktyg: "Verktyg",
};

/** Sanitiza en post ur JSON:en — ogiltiga rader sorteras bort (tyst). */
function rensaPost(rå: unknown): FlodePost | null {
  if (typeof rå !== "object" || rå === null) return null;
  const p = rå as Record<string, unknown>;
  if (typeof p.rubrik !== "string" || !p.rubrik.trim()) return null;
  if (typeof p.datum !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(p.datum)) return null;
  return {
    datum: p.datum,
    rubrik: p.rubrik.trim(),
    text: typeof p.text === "string" ? p.text.trim() : "",
    lank: typeof p.lank === "string" && p.lank.startsWith("/") && p.lank.length > 1 ? p.lank : "/nyheter",
    kategori: KATEGORIER.includes(p.kategori as Kategori) ? (p.kategori as Kategori) : "system",
  };
}

const flode = flodeJson as { uppdaterad?: unknown; poster?: unknown };

/** Alla poster, senaste datum först (ISO-datum → enkel strängsortering). */
export const KUNSKAPSPOSTER: FlodePost[] = (Array.isArray(flode.poster) ? flode.poster : [])
  .map(rensaPost)
  .filter((p): p is FlodePost => p !== null)
  .sort((a, b) => (a.datum < b.datum ? 1 : a.datum > b.datum ? -1 : 0))
  .slice(0, 15);

/** Teamets kursnyheter — flik 2. */
const KURSPOSTER = KUNSKAPSPOSTER.filter((p) => p.kategori === "kurs");

/** Flödets senaste uppdateringsdatum (visas i flik 3). */
const UPPDATERAD = typeof flode.uppdaterad === "string" ? flode.uppdaterad : "";

// ── Nyheter ur /api/nyheter (samma mönster som aktie-nyheter.tsx) ───────────

const TIMEOUT_MS = 8000;
const MAX_NYHETER = 3;
const HOG_PAVERKAN = 70;

/**
 * Ämneskanaler till /api/nyheter — id:n ur motorns STANDARD_AMNESKANALER
 * (verifierade RSS-källor). Ger allmänna marknadsnyheter utan krav på
 * inloggad portfölj — perfekt för besökare och medlemmar oavsett.
 */
const AMNEN = ["svt-ekonomi", "di", "privata-affarer", "yahoo-varlden"];

/** Rå nyhet från /api/nyheter — allt unknown, städas i renNyhet(). */
type ApiNyhet = {
  id?: unknown;
  rubrik?: unknown;
  kalla?: unknown;
  lank?: unknown;
  tid?: unknown;
  tickers?: unknown;
  paverkan?: unknown;
};

/** Rensad nyhet för visning. */
type RenNyhet = {
  id: string;
  rubrik: string;
  kalla: string | null;
  lank: string | null;
  tidMs: number | null;
  paverkan: number;
};

function arTal(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/** Tid från API:et → epoch ms (sekunder, millis eller ISO-sträng). */
function tidTillMs(t: unknown): number | null {
  if (arTal(t)) return t > 1e12 ? t : t * 1000;
  if (typeof t === "string" && t) {
    const ms = Date.parse(t);
    return Number.isNaN(ms) ? null : ms;
  }
  return null;
}

/** Okänd JSON → RenNyhet (eller null när rubriken saknas — tyst, graceful). */
function renNyhet(rå: unknown): RenNyhet | null {
  if (!rå || typeof rå !== "object") return null;
  const n = rå as ApiNyhet;
  if (typeof n.rubrik !== "string" || !n.rubrik.trim()) return null;
  return {
    id: typeof n.id === "string" && n.id ? n.id : n.rubrik,
    rubrik: n.rubrik.trim(),
    kalla: typeof n.kalla === "string" && n.kalla ? n.kalla : null,
    lank: typeof n.lank === "string" && /^https:\/\//.test(n.lank) ? n.lank : null,
    tidMs: tidTillMs(n.tid),
    paverkan: arTal(n.paverkan) ? Math.min(100, Math.max(0, Math.round(n.paverkan))) : 0,
  };
}

/** ETT anrop till /api/nyheter med ämneskanaler. Tyst vid motstånd. */
async function hamtaNyheter(): Promise<RenNyhet[]> {
  try {
    const kontroll = new AbortController();
    const tidtagning = setTimeout(() => kontroll.abort(), TIMEOUT_MS);
    const res = await fetch(`/api/nyheter?amnen=${AMNEN.map(encodeURIComponent).join(",")}`, {
      signal: kontroll.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(tidtagning);
    if (!res.ok) return [];
    const data = (await res.json()) as { nyheter?: unknown };
    if (!Array.isArray(data?.nyheter)) return [];
    const ut: RenNyhet[] = [];
    for (const rå of data.nyheter) {
      const n = renNyhet(rå);
      if (n) ut.push(n);
    }
    return ut;
  } catch {
    return []; // API:bort/timeout — viloläget får tala
  }
}

// ── Veckans research-bolag (M3) ur /api/forskningslage ───────────────────────

/**
 * VECKANS RESEARCH-BOLAG — korstabellens deterministiska veckourval (hash ur
 * ISO-veckonumret mot grönapoolen, räknas i src/lib/forskningslaget.ts: samma
 * vecka ger alltid samma bolag — inga prognospilar). Hämtas ur samma API som
 * Forskningslage-kortet (server-side sammanfattning, cache 1 h).
 */
type VeckoBolag = { text: string; ticker: string; namn: string };

async function hamtaVeckansBolag(): Promise<VeckoBolag | null> {
  try {
    const kontroll = new AbortController();
    const tidtagning = setTimeout(() => kontroll.abort(), TIMEOUT_MS);
    const res = await fetch("/api/forskningslage", {
      signal: kontroll.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(tidtagning);
    if (!res.ok) return null;
    const data = (await res.json()) as { finns?: unknown; lage?: Record<string, unknown> | null };
    if (!data || data.finns !== true || !data.lage) return null;
    const vb = data.lage.veckansBolag as Record<string, unknown> | undefined;
    const bolag = vb ? (vb.bolag as Record<string, unknown> | null) : null;
    if (!bolag || typeof bolag.ticker !== "string" || !bolag.ticker.trim()) return null;
    const namn = typeof bolag.namn === "string" && bolag.namn.trim() ? bolag.namn.trim() : bolag.ticker.trim();
    return {
      text:
        typeof vb?.text === "string" && vb.text.trim()
          ? vb.text.trim()
          : `Vecka ${String(vb?.veckonr ?? "?")}: ${namn} leder forskningsurvalet`,
      ticker: bolag.ticker.trim(),
      namn,
    };
  } catch {
    return null; // tyst — raden visas helt enkelt inte
  }
}

/** Kort, vänlig svensk tidsangivelse — körs klient-side efter hydrering. */
function tidText(tidMs: number | null): string {
  if (tidMs === null) return "";
  const deltaMin = Math.round((Date.now() - tidMs) / 60000);
  if (deltaMin < 1) return "just nu";
  if (deltaMin < 60) return `för ${deltaMin} min sedan`;
  const deltaTim = Math.round(deltaMin / 60);
  if (deltaTim < 24) return `för ${deltaTim} tim sedan`;
  return new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short" }).format(new Date(tidMs));
}

/** "2026-09-03" → "3 sep." (svenska, korrekt åäö). Ogiltigt datum → strängen visas som den är. */
function datumText(datum: string): string {
  const d = new Date(`${datum}T12:00:00`); // middag = tidszons-säkert datum
  if (Number.isNaN(d.getTime())) return datum;
  return new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short" }).format(d);
}

// ── Panelen (tre flikar) — för Min Sida m.fl. inloggade ytor ────────────────

type Flik = "nyheter" | "kurser" | "nytt";

const FLIKAR: { id: Flik; text: string; ikon: string }[] = [
  { id: "nyheter", text: "Nyheter", ikon: "📰" },
  { id: "kurser", text: "Nya kurser", ikon: "📚" },
  { id: "nytt", text: "Vad är nytt", ikon: "✨" },
];

export function KunskapsFlode() {
  const [flik, setFlik] = useState<Flik>("nyheter");
  const [nyheter, setNyheter] = useState<RenNyhet[]>([]);
  const [hamtar, setHamtar] = useState(true);
  /** Veckans research-bolag (M3) — visas överst i "Vad är nytt" när det finns. */
  const [veckoBolag, setVeckoBolag] = useState<VeckoBolag | null>(null);

  // Nät ENDAST i useEffect — första passt är deterministiskt (hydration-säkert).
  useEffect(() => {
    let aktiv = true;
    (async () => {
      const [flode, vBolag] = await Promise.all([hamtaNyheter(), hamtaVeckansBolag()]);
      if (!aktiv) return;
      setNyheter(flode.slice(0, MAX_NYHETER));
      setVeckoBolag(vBolag);
      setHamtar(false);
    })();
    return () => {
      aktiv = false;
    };
  }, []);

  return (
    <section
      className="marin-panel relative overflow-hidden rounded-2xl border border-gold/40 p-6 sm:p-8"
      aria-labelledby="kunskapsflode-rubrik"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
      <div className="relative">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold-soft">Kunskapsflödet</p>
        <h2
          id="kunskapsflode-rubrik"
          className="mt-2 font-serif text-xl font-bold tracking-tight text-gold-soft sm:text-2xl"
        >
          Senaste nytt &amp; nya kunskaper
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-[#EDE6D6]/70">
          Marknadens nyheter, labbets nya kurser och forskningens framsteg — samlade
          på ett ställe, alltid uppdaterade.
        </p>

        {/* ── Flikrad ── */}
        <div
          role="tablist"
          aria-label="Välj flöde"
          className="mt-5 flex flex-wrap gap-1.5 border-b border-gold/15 pb-3"
        >
          {FLIKAR.map((f) => {
            const vald = flik === f.id;
            const antal =
              f.id === "nyheter" ? nyheter.length : f.id === "kurser" ? KURSPOSTER.length : KUNSKAPSPOSTER.length;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={vald}
                onClick={() => setFlik(f.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  vald
                    ? "border-gold/60 bg-gold/20 text-gold"
                    : "border-gold/20 bg-white/5 text-[#EDE6D6]/65 hover:border-gold/40 hover:text-[#EDE6D6]"
                }`}
              >
                <span aria-hidden="true">{f.ikon}</span>
                {f.text}
                {antal > 0 && (
                  <span
                    className={`ml-0.5 rounded-full px-1.5 text-[10px] font-black ${
                      vald ? "bg-gold text-[#0E1B2E]" : "bg-white/10 text-[#EDE6D6]/70"
                    }`}
                  >
                    {f.id === "nyheter" && hamtar ? "…" : antal}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Flikinnehåll — max höjd med scroll ── */}
        <div className="mt-4 max-h-[420px] overflow-y-auto pr-1">
          {/* Flik 1 · Nyheter — topp-3 ur /api/nyheter */}
          {flik === "nyheter" &&
            (hamtar ? (
              <div className="space-y-2" aria-busy="true" aria-live="polite">
                <p className="text-xs text-[#EDE6D6]/70">Lyssnar efter nyhetsflödet…</p>
                <div className="h-12 animate-pulse rounded-lg border border-gold/20 bg-white/5" />
                <div className="h-12 animate-pulse rounded-lg border border-gold/20 bg-white/5" />
                <div className="h-12 animate-pulse rounded-lg border border-gold/20 bg-white/5" />
              </div>
            ) : nyheter.length === 0 ? (
              <div className="rounded-xl border border-gold/25 bg-card/60 p-6 text-center">
                <p className="text-2xl" aria-hidden="true">
                  🌊
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  Inga aktuella nyheter — marknaden andas.
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Flödet vilar ett ögonblick. Din{" "}
                  <Link href="/min-sida" className="font-semibold text-gold hover:underline">
                    portföljhämtning
                  </Link>{" "}
                  i Senaste nytt hittar dina egna bolags nyheter.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gold/10">
                {nyheter.map((n) => (
                  <li key={n.id} className="py-3">
                    <a
                      href={n.lank ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                      {...(n.lank ? {} : { "aria-disabled": "true" })}
                    >
                      <span className="block text-sm font-semibold leading-snug text-[#EDE6D6] group-hover:text-gold-soft group-hover:underline">
                        {n.rubrik}
                      </span>
                    </a>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[11px] text-[#EDE6D6]/60">
                        {[n.kalla, tidText(n.tidMs)].filter(Boolean).join(" · ") || "Nyhetscentralen"}
                      </span>
                      {n.paverkan >= HOG_PAVERKAN ? (
                        <span className="inline-flex items-center rounded-full border border-gold/60 bg-gold/20 px-2 py-0.5 text-[10px] font-bold tracking-wide text-gold">
                          Hög påverkan
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-gold/20 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-[#EDE6D6]/60">
                          Påverkan {n.paverkan}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ))}

          {/* Flik 2 · Nya kurser — teamets kursnyheter ur kunskapsflödet */}
          {flik === "kurser" &&
            (KURSPOSTER.length === 0 ? (
              <div className="rounded-xl border border-gold/25 bg-card/60 p-6 text-center">
                <p className="text-sm font-semibold text-foreground">Inga kursnyheter just nu</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Biblioteket vilar — 333 kurser väntar redan i hyllan.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gold/10">
                {KURSPOSTER.map((p) => (
                  <li key={p.rubrik} className="py-3">
                    <Link href={p.lank} className="group block">
                      <span className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold leading-snug text-[#EDE6D6] group-hover:text-gold-soft group-hover:underline">
                          {p.rubrik}
                        </span>
                        <span className="shrink-0 text-[11px] text-[#EDE6D6]/50">{datumText(p.datum)}</span>
                      </span>
                      {p.text && (
                        <span className="mt-0.5 block text-xs leading-relaxed text-[#EDE6D6]/70">{p.text}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}

          {/* Flik 3 · Vad är nytt — veckans research-bolag + hela kunskapsflödet */}
          {flik === "nytt" && (
            <>
              {/* Veckans research-bolag (M3) — en rad längst upp: korstabellens
                  deterministiska veckourval, länkar in i forskningsbiblioteket. */}
              {veckoBolag && (
                <div className="mb-2 rounded-xl border border-gold/40 bg-gold/10 p-3.5">
                  <Link
                    href={`/forskningsbiblioteket/${encodeURIComponent(veckoBolag.ticker)}`}
                    className="group flex items-start gap-3"
                  >
                    <span className="mt-0.5 shrink-0 text-lg" aria-hidden="true">
                      🔬
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-snug text-gold group-hover:underline">
                        {veckoBolag.text}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-[#EDE6D6]/70">
                        Deterministiskt veckourval ur korstabellens gröna bolag — samma
                        vecka ger alltid samma bolag. Pedagogisk forskning, inte
                        investeringsråd.
                      </span>
                    </span>
                  </Link>
                </div>
              )}
              <ul className="divide-y divide-gold/10">
                {KUNSKAPSPOSTER.map((p) => (
                  <li key={`${p.datum}-${p.rubrik}`} className="py-3">
                    <Link href={p.lank} className="group flex items-start gap-3">
                      <span className="mt-0.5 shrink-0 text-lg" aria-hidden="true" title={KATEGORI_NAMN[p.kategori]}>
                        {KATEGORI_IKON[p.kategori]}
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-baseline gap-x-2">
                          <span className="text-sm font-semibold leading-snug text-[#EDE6D6] group-hover:text-gold-soft group-hover:underline">
                            {p.rubrik}
                          </span>
                          <span className="rounded-full border border-gold/25 bg-white/5 px-2 py-0.5 text-[10px] font-bold tracking-wide text-gold-soft/80">
                            {KATEGORI_NAMN[p.kategori]}
                          </span>
                          <span className="text-[11px] text-[#EDE6D6]/50">{datumText(p.datum)}</span>
                        </span>
                        {p.text && (
                          <span className="mt-0.5 block text-xs leading-relaxed text-[#EDE6D6]/70">{p.text}</span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* ── Footer: Visa alla-länkar (Nyheter/Vad är nytt → /nyheter, Nya kurser → /kurser) ── */}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gold/10 pt-4">
          {flik === "kurser" ? (
            <Link href="/kurser" className="text-xs font-semibold text-gold-soft hover:underline">
              Visa alla kurser →
            </Link>
          ) : (
            <Link href="/nyheter" className="text-xs font-semibold text-gold-soft hover:underline">
              Visa alla i Nyhetscentralen →
            </Link>
          )}
          <span className="ml-auto text-[11px] text-[#EDE6D6]/45">
            {flik === "nytt" && UPPDATERAD
              ? `Teamet uppdaterar flödet vid varje större release · senast ${datumText(UPPDATERAD)}`
              : "Information — inte investeringsråd."}
          </span>
        </div>
      </div>
    </section>
  );
}

// ── NyhetsChips — kompakt rubrik-chips för startsidans besökare ─────────────

/**
 * NYHETSchips — "endast rubriker för besökare" (kunddirektiv): hämtar
 * topp-3 rubriker ur /api/nyheter (ämneskanaler — kräver ej inloggning)
 * och visar dem som klickbara chips → /nyheter. Medan flödet hämtas visas
 * senaste rubrikerna ur kunskapsflödet (statiskt, deterministiskt) — sektionen
 * är aldrig tom. Papper-stil som matchar startsidans övriga sektioner.
 */
export function NyhetsChips() {
  const [nyheter, setNyheter] = useState<RenNyhet[]>([]);
  const [hamtat, setHamtat] = useState(false);

  useEffect(() => {
    let aktiv = true;
    (async () => {
      const flode = await hamtaNyheter();
      if (!aktiv) return;
      setNyheter(flode.slice(0, 3));
      setHamtat(true);
    })();
    return () => {
      aktiv = false;
    };
  }, []);

  // Före hämtning (SSR + första passt): senaste ur kunskapsflödet — aldrig tomt.
  const chips = hamtat
    ? nyheter.map((n) => n.rubrik)
    : KUNSKAPSPOSTER.slice(0, 3).map((p) => p.rubrik);

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <EyebrowLokal>Senaste nytt &amp; nya kunskaper</EyebrowLokal>
            <h2 className="mt-2 font-serif text-2xl font-bold text-balance sm:text-3xl">
              Labbet lever — nyheterna och kunskaperna växer varje vecka.
            </h2>
          </div>
          <Link
            href="/nyheter"
            className="inline-flex items-center gap-2 rounded-lg border border-gold/40 px-5 py-2.5 text-sm font-semibold text-gold transition-colors hover:bg-gold/10"
          >
            Alla nyheter →
          </Link>
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Nyhetscentralen rankar marknadens nyheter efter påverkan — och varje
          större release läggs nya kurser, forskningsfynd och verktyg till i
          labbet. Senaste rubrikerna just nu:
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {!hamtat && (
            <span className="sr-only" aria-live="polite">
              Hämtar senaste nyheterna…
            </span>
          )}
          {chips.length === 0 ? (
            <span className="rounded-full border border-gold/30 bg-gold/5 px-3.5 py-1.5 text-xs font-semibold text-gold">
              Nyhetscentralen — öppna ditt nyhetsrum
            </span>
          ) : (
            chips.map((rubrik, i) => (
              <Link
                key={`${i}-${rubrik.slice(0, 40)}`}
                href="/nyheter"
                title={rubrik}
                className="max-w-full truncate rounded-full border border-gold/30 bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-gold/60 hover:bg-gold/5 hover:text-gold"
              >
                {rubrik.length > 90 ? `${rubrik.slice(0, 90)}…` : rubrik}
              </Link>
            ))
          )}
          <Link
            href="/kurser"
            className="rounded-full border border-gold/30 bg-gold/5 px-3.5 py-1.5 text-xs font-semibold text-gold transition-colors hover:bg-gold/15"
          >
            + nya kurser i biblioteket
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Eyebrow i samma stil som primitives.tsx — lokal kopia för att hålla filen självbärande. */
function EyebrowLokal({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">{children}</p>
  );
}
