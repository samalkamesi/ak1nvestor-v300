"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { kraverFas, harFas2Access, harFas3Access, arAdmin } from "@/lib/kurs-access";
import { useSprak } from "@/components/ak1a/sprak-leverantor";

/**
 * KURSSÖ — Bibliotekshallens hjärta (våg 58).
 *
 * Forskningsbakgrund (NN/g + branschbest practice, se worklog VÅG 58):
 *  1. Curated-först (progressive disclosure): det som syns först signalerar
 *     viktigt — därför bor sök+fält och utvalda sektioner OVFAN registret.
 *  2. Numrerad paginering (ej infinite scroll) för målinriktad katalogsökning:
 *     förutsägbar position, bakåtknapp och fotnötten når fram.
 *  3. "Visar 1–24 av N" — läsaren ser alltid var i registret hen står.
 *  4. Kompakta rader på md+ (kort vid liten uppsättning, radlista vid 300+).
 *  5. Filter/sortering byter → sida 1 återställs (positionen får aldrig bli en
 *     tom sida).
 *
 * Struktur: (1) hero-sök stort + centralt med kategorichips som snabbfilter,
 * (2) {children} = server-renderade utvalda sektioner (endast svenska /kurser —
 * speglarna skickar inga children), (3) registret: 24 kurser/sida + sidväljare
 * + sortering + kompakta rader, (4) kategoriväggen: alla kategorier med
 * räknare som klick sätter filtret och scrollar till registret.
 *
 * INGEN databorttagning: samtliga kurser lever kvar i komponentens minne och
 * filterlogik — pagineringen är enbart en visningsfråga. Sedan o1 #4 skickas
 * learn-text/quiz-antal inte i props utan hämtas lazigt per synligt kort via
 * /api/kurs/[slug] (modul-cache: en hämtning per kurs) — beteendet i kortet
 * är oförändrat, bara transporten. Fas-kurser (kraverFas:
 * 2 = fundamental vägen, 3 = dynamiska ekosystemet) visas alltid men låsas med
 * 🔒 → /fas2-ansok resp. /fas3 (en inbjudan, aldrig ett stopp).
 *
 * SEO (våg 58): SSR renderar sida 1 + de utvalda sektionernas interna länkar;
 * samtliga 333 kurssidor nås av crawlers via sitemap.xml (sedan tidigare) —
 * klientsidig paginering ger inga dubblett-URL:er att kanonisera.
 */

const PER_SIDA = 24;

type Sortering = "rekommenderad" | "ao" | "kapitel";

export type KursKort = {
  slug: string;
  title: string;
  category: string;
  kapitel: number;
  minuter: number;
  xp: number;
};

// ── LAZY KURSDETALJER (o1-prestanda #4) ─────────────────────────────────────
// learn-texten och quiz-antalet skickas INTE längre i props (flight ~348 kB →
// ~90 kB för 333 kurser): de hämtas per kurs från befintliga /api/kurs/[slug]
// när kortet närmar sig viewport och cacheas på modulnivå — varje kurs hämtas
// högst en gång per sidladdning, oavsett sidbläddring i pagineringen. md+
// visar aldrig learn/quiz (ren CSS-döljning) och triggar därför ingen hämtning.

type KursDetalj = { learn: string; quiz: number };

const kursDetaljCache = new Map<string, Promise<KursDetalj | null>>();

function hamtaKursDetalj(slug: string): Promise<KursDetalj | null> {
  const befintlig = kursDetaljCache.get(slug);
  if (befintlig) return befintlig;
  const lovat = fetch(`/api/kurs/${encodeURIComponent(slug)}`)
    .then((r) => (r.ok ? r.json() : null))
    .then((kurs: { learn?: unknown; chapters?: unknown } | null) => {
      if (!kurs || typeof kurs.learn !== "string") return null;
      let quiz = 0;
      if (Array.isArray(kurs.chapters)) {
        for (const ch of kurs.chapters as Array<{ quiz?: unknown }>) {
          const q = ch?.quiz;
          if (Array.isArray(q)) quiz += q.length;
        }
      }
      return { learn: kurs.learn, quiz };
    })
    .catch(() => {
      kursDetaljCache.delete(slug); // misslyckad hämtning får göras om senare
      return null;
    });
  kursDetaljCache.set(slug, lovat);
  return lovat;
}

/**
 * Registerrad/kort — identisk markup som före o1 #4, men learn-texten och
 * quiz-antalet hämtas lazigt (se kursDetaljCache ovan) när kortet är på väg
 * in i viewport (400 px marginal, så texten oftast är på plats före exponeringen).
 * Skeleton reserverar cirka learn-radens höjd medan texten är på väg.
 * V86: all kort-krom (Fas-märken, metadata-rader, låsnotis) via useSprak().t
 * — svenska originalet oförändrat (sv-raden är den tidigare texten ordagrant),
 * speglarna får spegelns språk via SpegelSprakLeverantor (våg 81).
 */
function RegisterKort({
  c,
  lankPrefix,
  fas,
  last,
}: {
  c: KursKort;
  lankPrefix: string;
  fas: number;
  last: boolean;
}) {
  const { t } = useSprak();
  const [detalj, setDetalj] = useState<KursDetalj | null>(null);
  const [misslyckades, setMisslyckades] = useState(false);
  // o19 (prestanda spår 7): skellettet pulserar ENDAST medan hämtningen pågår.
  // Tidigare pulserade det oändligt från hydratiseringen tills kortet scrollades
  // in i viewport (IntersectionObserver:n avfyras först då) — på /kurser är
  // registret långt under vecket, så 24 kort blinkade i bakgrunden för varje
  // besökare som aldrig scrollade: CSS-animationsframes ≈ style-recalc/
  // batterikostnad i minuter för innehåll ingen ser. Statiskt skellett
  // reserverar samma höjd; pulsen är synbar feedback precis när den betyder något.
  const [laddar, setLaddar] = useState(false);
  const textRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    let aktiv = true;
    const starta = () => {
      setLaddar(true);
      hamtaKursDetalj(c.slug).then((d) => {
        if (!aktiv) return;
        if (d) setDetalj(d);
        else setMisslyckades(true);
      });
    };
    if (typeof IntersectionObserver === "undefined") {
      starta(); // äldre webbläsare: hämta direkt — texten ska alltid nå fram
      return () => {
        aktiv = false;
      };
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          obs.disconnect();
          starta();
        }
      },
      { rootMargin: "400px" }
    );
    obs.observe(el);
    return () => {
      aktiv = false;
      obs.disconnect();
    };
  }, [c.slug]);

  return (
    <li className="cv-registerkort">
      <Link
        href={last ? `${lankPrefix}${fas === 3 ? "/fas3" : "/fas2-ansok"}` : `${lankPrefix}/kurser/${c.slug}`}
        title={last ? t("ksok.fasKursTitel", { fas }) : undefined}
        className={`block rounded-lg border p-4 transition-all md:flex md:items-center md:gap-3 md:px-3 md:py-2.5 ${
          last
            ? "border-gold/40 bg-gold/[0.04] hover:border-gold/60 hover:shadow-lg"
            : "border-gold/20 bg-card hover:border-gold/50 hover:shadow-lg"
        }`}
      >
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="font-serif font-semibold md:truncate md:text-sm md:font-semibold">{c.title}</span>
            {fas !== 0 && (
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  fas === 3
                    ? last
                      ? "bg-[#8C5A2B] text-[#F8EFE3] dark:bg-[#B07A3C] dark:text-[#081120]"
                      : "bg-[#B07A3C]/15 koppar-text"
                    : last
                      ? "bg-[#0E1B2E] text-[#E8C766] dark:bg-[#16263D]"
                      : "bg-gold/15 text-gold"
                }`}
              >
                {last ? t("ksok.fasLas", { fas }) : t("ksok.fasKort", { fas })}
              </span>
            )}
          </span>
          {/* Metadata med tabular-nums — siffrorna står still i bankmatrisen (mobil) */}
          <span className="mt-1 block text-xs tabular-nums text-muted-foreground md:hidden">
            {t("ksok.kortMeta", { kapitel: c.kapitel, minuter: c.minuter })}
            {detalj ? t("ksok.kortQuiz", { quiz: detalj.quiz }) : ""}
            {t("ksok.kortXp", { xp: c.xp })}
          </span>
          <span
            ref={textRef}
            className="mt-2 block min-h-[3.5rem] text-xs leading-relaxed text-muted-foreground md:hidden"
          >
            {detalj?.learn ??
              (misslyckades ? null : (
                <span
                  className={`block h-[3.25rem] max-w-[38ch] rounded-md bg-gold/[0.07] ${laddar ? "animate-pulse" : ""}`}
                  aria-hidden="true"
                />
              ))}
          </span>
          {last && (
            <span
              className={`mt-2 block text-[10px] font-semibold md:hidden ${
                fas === 3 ? "koppar-text" : "text-gold"
              }`}
            >
              {t("ksok.lasNotice", { fas })}
            </span>
          )}
        </span>
        {/* md+: kompaktraden — kategori-chip + kapitel/min/xp i en rad */}
        <span className="hidden shrink-0 items-center gap-2 md:flex">
          <span className="hidden rounded-full border border-gold/25 px-2 py-0.5 text-[10px] font-bold text-muted-foreground lg:inline-flex">
            {c.category}
          </span>
          <span className="whitespace-nowrap text-[11px] tabular-nums text-muted-foreground">
            {t("ksok.radMeta", { kapitel: c.kapitel, minuter: c.minuter, xp: c.xp })}
          </span>
        </span>
      </Link>
    </li>
  );
}

export function KursSok({
  kurser,
  lankPrefix = "",
  children,
  sidopanel,
}: {
  kurser: KursKort[];
  /**
   * Språk-prefix för kortens länkar (våg 52): "" ⇒ /kurser/{slug} (svenska
   * originalet, oförändrat beteende), "/en" ⇒ /en/kurser/{slug} (den
   * dynamiska kursspegeln) osv. Låsta Fas-länkar följer samma prefix.
   */
  lankPrefix?: string;
  /**
   * Utvalda sektioner (Flaggskeppen, Nya i biblioteket, Börja här) —
   * server-renderade barn som visas mellan hero-söket och registret.
   * Bara svenska /kurser skickar children; speglarna kör utan (våg 58).
   */
  children?: React.ReactNode;
  /** Sidopanel (FortsattPanel) bredvid registret på lg+ — endast /kurser. */
  sidopanel?: React.ReactNode;
}) {
  const { t } = useSprak();
  const [sok, setSok] = useState("");
  const [kat, setKat] = useState("alla");
  const [sida, setSida] = useState(1);
  const [sortering, setSortering] = useState<Sortering>("rekommenderad");
  const [fas2Access, setFas2Access] = useState(false);
  const [fas3Access, setFas3Access] = useState(false);
  const registerRef = useRef<HTMLElement | null>(null);
  const monterad = useRef(false);

  // Fas-åtkomst avgörs lokalt efter montering (SSR renderar låst — säkrast default)
  useEffect(() => {
    setFas2Access(harFas2Access() || arAdmin());
    setFas3Access(harFas3Access() || arAdmin());
  }, []);

  // Sidbyte → mjuk scroll till registrets topp (ALDRIG vid första render)
  useEffect(() => {
    if (!monterad.current) {
      monterad.current = true;
      return;
    }
    const el = registerRef.current;
    if (el) {
      const topp = el.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top: Math.max(0, topp), behavior: "smooth" });
    }
  }, [sida]);

  const kategorier = useMemo(() => {
    const m = new Map<string, number>();
    kurser.forEach((k) => m.set(k.category, (m.get(k.category) || 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [kurser]);

  const filtrerade = useMemo(() => {
    const q = sok.toLowerCase().trim();
    return kurser.filter((k) => {
      if (kat !== "alla" && k.category !== kat) return false;
      // o1 #4: learn-texten ligger inte längre i minnet — sökningen täcker
      // titel + kategori (kategorinamnen är ämnena: VÄRDERING, RISKHANTERING …).
      if (q && !`${k.title} ${k.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [kurser, sok, kat]);

  // Sortering: Rekommenderad = underliggande ordning (vårt pedagogiska urval),
  // A–Ö = localeCompare på titel, Fler kapitel först = djupaste kurserna först.
  const sorterade = useMemo(() => {
    if (sortering === "ao") {
      return [...filtrerade].sort((a, b) => a.title.localeCompare(b.title, "sv"));
    }
    if (sortering === "kapitel") {
      return [...filtrerade].sort(
        (a, b) => b.kapitel - a.kapitel || a.title.localeCompare(b.title, "sv"),
      );
    }
    return filtrerade;
  }, [filtrerade, sortering]);

  const antalSidor = Math.max(1, Math.ceil(sorterade.length / PER_SIDA));
  // Skydd: filter som krymper registret kan lämna sida > antalSidor → clampa.
  const aktuellSida = Math.min(sida, antalSidor);
  const startIx = (aktuellSida - 1) * PER_SIDA;
  const visade = sorterade.slice(startIx, startIx + PER_SIDA);
  const fran = sorterade.length === 0 ? 0 : startIx + 1;
  const till = startIx + visade.length;

  // Sidlista med ellipser: 1 … (aktuell-1) aktuell (aktuell+1) … sista
  const sidLista = useMemo(() => {
    const n = antalSidor;
    if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1) as Array<number | "…">;
    const ta = new Set<number>([1, 2, n - 1, n, aktuellSida - 1, aktuellSida, aktuellSida + 1]);
    const tal = [...ta].filter((p) => p >= 1 && p <= n).sort((a, b) => a - b);
    const ut: Array<number | "…"> = [];
    tal.forEach((p, i) => {
      if (i > 0 && p - tal[i - 1] > 1) ut.push("…");
      ut.push(p);
    });
    return ut;
  }, [antalSidor, aktuellSida]);

  const scrollTillRegister = () => {
    const el = registerRef.current;
    if (el) {
      const topp = el.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top: Math.max(0, topp), behavior: "smooth" });
    }
  };

  const valjKategori = (k: string) => {
    setKat(k);
    setSida(1);
    scrollTillRegister();
  };

  // Visas info-raden? — bara när minst en Fas-kurs (2 eller 3) finns i vyn
  const fasSynliga = useMemo(() => visade.some((c) => kraverFas(c.slug) !== 0), [visade]);

  const filterAktivt = kat !== "alla" || sok.trim() !== "";

  const register = (
    <section ref={registerRef} id="registret" aria-label={t("ksok.ariaRegister")} className="scroll-mt-24">
      {/* Registerverktyg — sticky medan registret bläddras */}
      <div className="sticky top-14 z-20 -mx-1 mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-gold/20 bg-background/95 px-1 py-3 backdrop-blur-md">
        <h2 className="font-serif text-2xl font-bold">
          {t("ksok.register")}
          <span className="ml-2 align-middle text-sm font-normal tabular-nums text-muted-foreground">
            {filterAktivt ? t("ksok.traffar", { antal: sorterade.length }) : t("ksok.helaBiblioteket")}
          </span>
        </h2>
        {filterAktivt && (
          <button
            onClick={() => {
              setSok("");
              setKat("alla");
              setSida(1);
            }}
            className="rounded-full border border-gold/30 px-2.5 py-1 text-[11px] font-bold text-muted-foreground transition-colors hover:bg-gold/10 max-md:min-h-[52px]!"
          >
            {kat !== "alla" ? `${kat} · ` : ""}
            {sok.trim() ? `"${sok.trim()}" · ` : ""}
            {t("ksok.rensaFilter")}
          </button>
        )}
        <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          {t("ksok.sortera")}
          <select
            value={sortering}
            onChange={(e) => {
              setSortering(e.target.value as Sortering);
              setSida(1);
            }}
            className="rounded-lg border border-gold/30 bg-card px-2 py-1.5 text-xs font-semibold text-foreground outline-none transition-colors focus:border-[#0E1B2E] focus:ring-1 focus:ring-[#0E1B2E]/30 dark:focus:border-gold-soft dark:focus:ring-gold-soft/30 max-md:min-h-[52px]! max-md:text-base"
            aria-label={t("ksok.sorteraAria")}
          >
            <option value="rekommenderad">{t("ksok.sortRekommenderad")}</option>
            <option value="ao">{t("ksok.sortAo")}</option>
            <option value="kapitel">{t("ksok.sortKapitel")}</option>
          </select>
        </label>
      </div>

      {/* Lägesrad — läsaren ser alltid var i registret hen står (NN/g regel 3) */}
      <p className="mb-4 text-xs tabular-nums text-muted-foreground" aria-live="polite">
        {sorterade.length > 0
          ? t("ksok.visarAv", { fran, till, total: sorterade.length })
          : t("ksok.ingaAttVisa")}
        {antalSidor > 1 && ` · ${t("ksok.sidaAv", { sida: aktuellSida, sidor: antalSidor })}`}
      </p>

      {/* Vad är Fas 2 och Fas 3? — info-rad som förklarar lås-markeringen (inbjudan, aldrig stopp) */}
      {fasSynliga && (
        <p className="mb-6 flex flex-wrap items-center gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <span aria-hidden>🔒</span>
          <span className="font-bold text-gold">{t("ksok.fasFraga")}</span>
          <span>{t("ksok.fasInfo")}</span>
          <Link href={`${lankPrefix}/fas2-ansok`} className="underline decoration-gold/50 underline-offset-2 hover:text-foreground max-md:min-h-[52px]">
            {t("ksok.fas2Lank")}
          </Link>
          <Link href={`${lankPrefix}/fas3`} className="underline decoration-gold/50 underline-offset-2 hover:text-foreground max-md:min-h-[52px]">
            {t("ksok.fas3Lank")}
          </Link>
        </p>
      )}

      {/* Registret — mobil: bevarad kortstil; md+: två kolumner kompakta rader
          (titel + kategori-chip + kapitel/min/xp i en rad). Allt kvar i DOM —
          kompakteringen är ren CSS. learn/quiz kommer lazigt (RegisterKort). */}
      <ul className="grid gap-3 md:grid-cols-2">
        {visade.map((c) => {
          // Fas-kurs utan åtkomst: kortet visas (titel + beskrivning) men
          // klick leder till ansökan — inbjudan vidare, aldrig ett stopp.
          const fas = kraverFas(c.slug);
          const last = fas !== 0 && (fas === 3 ? !fas3Access : !fas2Access);
          return (
            <RegisterKort key={c.slug} c={c} lankPrefix={lankPrefix} fas={fas} last={last} />
          );
        })}
      </ul>
      {sorterade.length === 0 && (
        <p className="rounded-xl border border-gold/20 bg-card p-8 text-center text-sm text-muted-foreground">
          {t("ksok.ingaMatchade")}
        </p>
      )}

      {/* Sidväljare — numrerad paginering (NN/g: förutsägbar position för
          katalogsökning; back-knappen och fotnoten når alltid fram) */}
      {antalSidor > 1 && (
        <nav aria-label={t("ksok.sidnavigering")} className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
          <button
            onClick={() => setSida(Math.max(1, aktuellSida - 1))}
            disabled={aktuellSida === 1}
            className="rounded-lg border border-gold/30 px-3 py-1.5 text-[11px] font-bold text-muted-foreground transition-colors hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40 max-md:min-h-[52px]!"
          >
            {t("ksok.foregaendeKnapp")}
          </button>
          {sidLista.map((p, i) =>
            p === "…" ? (
              <span key={`ellips-${i}`} className="px-1 text-xs text-muted-foreground" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setSida(p)}
                aria-current={p === aktuellSida ? "page" : undefined}
                className={`min-w-9 rounded-lg px-2.5 py-1.5 text-[11px] font-bold tabular-nums transition-colors max-md:min-h-[52px]! max-md:min-w-[52px]! ${
                  p === aktuellSida
                    ? "bg-[#0E1B2E] text-[#E8C766] dark:bg-[#16263D]"
                    : "border border-gold/30 text-muted-foreground hover:bg-gold/10"
                }`}
              >
                {p}
              </button>
            ),
          )}
          <button
            onClick={() => setSida(Math.min(antalSidor, aktuellSida + 1))}
            disabled={aktuellSida === antalSidor}
            className="rounded-lg border border-gold/30 px-3 py-1.5 text-[11px] font-bold text-muted-foreground transition-colors hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40 max-md:min-h-[52px]!"
          >
            {t("ksok.nastaKnapp")}
          </button>
        </nav>
      )}
    </section>
  );

  return (
    <div>
      {/* (1) HERO-SÖK — stort och centralt: bibliotekshallens entré (våg 58) */}
      <section aria-label={t("ksok.heroAria")} className="mt-8">
        <div className="mx-auto max-w-2xl">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gold/70" aria-hidden>
              ⌕
            </span>
            <input
              value={sok}
              onChange={(e) => {
                setSok(e.target.value);
                setSida(1);
              }}
              placeholder={t("ksok.sokPlats", { antal: kurser.length })}
              className="w-full rounded-2xl border border-gold/40 bg-card py-4 pl-12 pr-4 text-base outline-none transition-colors focus:border-[#0E1B2E] focus:ring-2 focus:ring-[#0E1B2E]/20 dark:focus:border-gold-soft dark:focus:ring-gold-soft/20"
              aria-label={t("ksok.sokAria")}
            />
          </div>
          <p className="mt-2 text-center text-[11px] tabular-nums text-muted-foreground">
            {t("ksok.sokStat", { kurser: kurser.length, kategorier: kategorier.length })}
          </p>
          {/* Kategorichips — snabbfilter direkt i heron */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => valjKategori("alla")}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors max-md:min-h-[52px]! ${
                kat === "alla"
                  ? "bg-[#0E1B2E] text-[#E8C766] dark:bg-[#16263D]"
                  : "border border-gold/30 text-muted-foreground hover:bg-gold/10"
              }`}
            >
              {t("ksok.alla", { antal: kurser.length })}
            </button>
            {kategorier.slice(0, 8).map(([k, n]) => (
              <button
                key={k}
                onClick={() => valjKategori(kat === k ? "alla" : k)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors max-md:min-h-[52px]! ${
                  kat === k
                    ? "bg-[#0E1B2E] text-[#E8C766] dark:bg-[#16263D]"
                    : "border border-gold/30 text-muted-foreground hover:bg-gold/10"
                }`}
              >
                {k} ({n})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* (2) Utvalda sektioner — server-renderade barn (endast svenska /kurser) */}
      {children}

      {/* (3+4) Registret (+ sidopanel på /kurser) och kategoriväggen */}
      {sidopanel ? (
        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_260px]">
          <div>{register}</div>
          <aside className="h-fit">{sidopanel}</aside>
        </div>
      ) : (
        <div className="mt-12">{register}</div>
      )}

      {/* KATEGORIVÄGGEN — hela biblioteket i glimten: varje kategori med
          räknare; klick sätter filtret och scrollar till registret.
          cv-kategorivagg (o78): väggen ligger långt under vecket på mobil —
          content-visibility hoppar style/layout tills den närmas. */}
      <section aria-label={t("ksok.allaKategorierAria")} className="mt-12 cv-kategorivagg rounded-2xl border border-gold/20 bg-card p-5 sm:p-6">
        <h2 className="font-serif text-2xl font-bold">
          {t("ksok.kategorivagg")}
          <span className="ml-2 text-sm font-normal tabular-nums text-muted-foreground">
            {t("ksok.kategorivaggStat", { kategorier: kategorier.length, kurser: kurser.length })}
          </span>
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {t("ksok.kategorivaggText")}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {kategorier.map(([k, n]) => (
            <button
              key={k}
              onClick={() => valjKategori(k)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold tabular-nums transition-colors max-md:min-h-[52px]! ${
                kat === k
                  ? "bg-[#0E1B2E] text-[#E8C766] dark:bg-[#16263D]"
                  : "border border-gold/30 text-muted-foreground hover:bg-gold/10"
              }`}
            >
              {k} <span className="opacity-60">{n}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
