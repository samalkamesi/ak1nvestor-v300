/**
 * KURS-METADATA LIVE — panelredigerbar kurscopy (title/summary/learn/why) med
 * filen som sanning och Supabase som live-lager (VÅG 82, ADMIN-MEGA steg 4 —
 * STYRELSE-VAG82-BYGG.md §A1 är det BINDANDE kontraktet för denna fil;
 * förstudien STYRELSE-VAG82-KURSCMS.md §2+§5 är underlaget).
 *
 * ── KONTRAKTET (§A1) ────────────────────────────────────────────────────────
 * public/deep-courses.json är SANNING; live-ändringar bor i system_events
 * (INGEN DDL — kund-SQL krävs aldrig, MÖS-lärdomen) och läses SENASTE-VINNER
 * per nyckel "{slug}.{falt}" (variabler-lagringens våg 79-mönster). Vitlistan
 * är EXAKT title/summary/learn/why — ren prosa, kontrolleraText-bar, inga
 * strukturella konsumenter (sitemap/kurs-access/XP/kategoriräknare orörda).
 *
 * VITLÅSET (ALDRIG-nivå): slug, category, weight, xp, minutes, chapters (med
 * strukturella syskon — totalMinutes, chapterCount, blocks, quiz, history,
 * perspektiv, level) avvisas HÅRT med ok:false + tydlig feltext. Slug är URL:
 * er, sitemap 1 684, kurs-access-Sets och MÖS-nycklar — heligt. XP är beräknat
 * (våg 78 B4a), minutes är derivat av chapters, category/weight är räkne-
 * dimensioner och AKM1-modellcopy.
 *
 * Event-radernas kontrakt (dual-write i EN begäran — v79-mönstret):
 *   Värde-rad:   type="kurs_metadata"        severity="info" source="kurser"
 *                message="[kurs] <slug>.<falt> = <värde>"
 *                details={slug, falt, varde, gammalt, av, kalla:"panel"}
 *   Ändringslogg: type="kurs_metadata-andring" severity="info" source="kurser"
 *                message="[kurs-andring] <slug>.<falt>: <gammalt> → <nytt>"
 *                details={slug, falt, gammalt, nytt, av, kalla:"panel"}
 *                (revisionsrad — raderas ALDRIG av skrivvägen; värde-radernas
 *                föregångare raderas däremot best-effort så lagret sväller
 *                inte, exakt sparaVariabel-mönstret)
 *
 * TOMBSTONE: varde=null = rollback — nyckeln filtreras BORT vid läsningen ⇒
 * FILVÄRDET gäller igen. Prioritet vid merge: senaste override-radens värde
 * > äldre värde-rader > tombstone (⇒ filvärde).
 *
 * ── GRINDEN (våg 66) ────────────────────────────────────────────────────────
 * kontrolleraText (varumarke.ts — SYNKRON ren funktion) körs på varje icke-
 * null-varde: 0 FEL krävs (publicerad copy). VARNINGAR släpps igenom — det är
 * FEL-klassen som stoppar, samma som blogg-exportgrinden.
 *
 * ── LÄS-REGLER (variabler-lagring.ts våg 79, ordagrant mönster) ─────────────
 * order=created_at.desc,id.desc (id.desc = total ordning bland ties), RÅA
 * filtervärden %-kodade (citerade värden är verifierat icke-träffande för
 * details->>-filter, lager.ts våg 55), Range-paginering 1 000 rader/sida,
 * tak 10 sidor, modul-cache 5 min. GRACEFUL NEDBRYTNING: Supabase ej
 * konfigurerat, svarar fel eller tomt ⇒ TOM karta ⇒ filvärdena gäller —
 * läsvägen KASTAR ALDRIG.
 *
 * ── VÅG 79-HERMETIK ─────────────────────────────────────────────────────────
 * NEXT_PHASE==="phase-production-build" ⇒ lasKursOverrides svarar tom karta
 * UTAN nät och skrivKursMetadata NEKAS (ok:false) — modulen FÅR ALDRIG fetcha
 * under next build. All miljöläsning och allt nät bor I funktionskropparna.
 *
 * ── MIMOSA-RECEPTET (våg 81:s hårdlärda mönster) ────────────────────────────
 * Origin hämtas ENBART via getSupabaseRest() (supabase-rest.ts — den
 * vedertagna host-vakten; origin-tainten bryts på modulgränsen). Fetch-URL:er
 * byggs med "+"-konkat och variablerna intygas av regex FÖRE de når URL:en —
 * ALDRIG mallsträng med variabel i sökvägen. Import-ytan: ./supabase-rest,
 * ./varumarke, @/lib/content — ALDRIG deprecated db.ts.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

import { getSupabaseRest } from "./supabase-rest";
import { kontrolleraText } from "./varumarke";
import { getCourses, type Course } from "@/lib/content";

// ── Event-typer & konstanter (exporteras för admin-rutten/panelen) ──────────

/** Värde-raden (senaste-vinner per "{slug}.{falt}"; varde=null = tombstone). */
export const KURS_METADATA_EVENT_TYP = "kurs_metadata";
/** Revisionsraden (dual-write — raderas aldrig, panelens spårhistorik). */
export const KURS_METADATA_ANDRING_EVENT_TYP = "kurs_metadata-andring";
const KURS_KALLA = "kurser";

// ── Vitlistan, vitlåset, längdtaken (§A1 + förstudien §2) ────────────────────

/** De redigerbara metadatafälten — KONTRAKTETS VITLISTA (endast dessa fyra). */
export type KursMetadataFalt = "title" | "summary" | "learn" | "why";

/** Vitlistan i kontraktets ordning (POST-ruttens och läsningens grind). */
export const KURS_FALT_VITLISTA: readonly KursMetadataFalt[] = ["title", "summary", "learn", "why"];

/** Längdtaken per fält (§A1: title ≤ 120 / summary/learn ≤ 300 / why ≤ 900). */
export const LANGD_TAK: Readonly<Record<KursMetadataFalt, number>> = {
  title: 120,
  summary: 300,
  learn: 300,
  why: 900,
};

/** VITLÅSET (ALDRIG-nivå): strukturella/räknedimensionella fält som aldrig får
 *  skrivas live — avvisas med ok:false + tydlig feltext (krita-regel 2). */
export const VITLAS_FALT: readonly string[] = [
  "slug",
  "category",
  "weight",
  "xp",
  "minutes",
  "totalMinutes",
  "chapterCount",
  "chapters",
  "blocks",
  "quiz",
  "history",
  "perspektiv",
  "level",
];

/** Sant exakt för vitlistade fält (vitliste-vakten — ren funktion). */
export function arKursMetadataFalt(v: unknown): v is KursMetadataFalt {
  return v === "title" || v === "summary" || v === "learn" || v === "why";
}

// ── Nyckelformatet "{slug}.{falt}" + Mimosa-intyget ──────────────────────────

/** Nyckeln är "{slug}.{falt}" — SENASTE-VINNER-enheten i lagret. */
export function byggNyckel(slug: string, falt: KursMetadataFalt): string {
  return slug + "." + falt;
}

/** Regex-INTYG (Mimosa-receptet våg 81): nyckeln får endast bära kurs-slug
 *  (^[a-z0-9][a-z0-9-]*$ — verifierat format på alla 333 deep-courses-slugar)
 *  + vitlistat fält. Endast intygade nycklar får vidare in i en URL. */
const NYCKEL_INTYG_RE = /^[a-z0-9][a-z0-9-]*\.(title|summary|learn|why)$/;

/** Sant exakt för intygade nycklar — skrivvägens djupa försvarslinje. */
export function arGiltigNyckel(nyckel: string): boolean {
  return typeof nyckel === "string" && NYCKEL_INTYG_RE.test(nyckel);
}

// ── Ren valideringslogik (exporterad för verktyg/testa-kurs-metadata.mjs) ────

/** Skrivvägens inparametar — exakt §A1-signaturen. */
export type KursSkrivning = {
  slug: string;
  falt: KursMetadataFalt;
  varde: string | null;
  av: string;
};

/** Valideringsresultatet — ok med sanerat värde/av, eller ärligt svenskt fel. */
export type KursSkrivValidering =
  | { ok: true; varde: string | null; av: string }
  | { ok: false; fel: string };

/** Sanera av-fältet (visning i loggen) — trimma, kapa, default "admin". */
function rensaAv(av: unknown): string {
  return typeof av === "string" && av.trim() !== "" ? av.trim().slice(0, 100) : "admin";
}

/**
 * valideraKursSkrivning — GRINDEN, ren från nät och fs (slugar-universumet
 * passeras in — skrivKursMetadata ger Object.keys(getCourses())). Hård
 * validering i §A1:ens ordning: slug måste finnas bland kurserna, falt i
 * vitlistan (vitlås FALLER HÅRST med egen feltext), varde=null = tombstone
 * OK, tomt värde avvisas (null är rollback-vägen), längdtak per fält på det
 * trimmade värdet, kontrolleraText 0 FEL (VARNINGAR släpps igenom).
 */
export function valideraKursSkrivning(p: KursSkrivning, giltigaSlugar: readonly string[]): KursSkrivValidering {
  const slug = typeof p?.slug === "string" ? p.slug.trim() : "";
  if (!slug) {
    return { ok: false, fel: "Slug krävs — skrivningen avbröts." };
  }
  if (!(giltigaSlugar as readonly string[]).includes(slug)) {
    return {
      ok: false,
      fel: `Okänd kurs "${slug.slice(0, 80)}" — slugar utanför deep-courses kan aldrig redigeras live.`,
    };
  }
  // Typviddat till string: runtime-anropare (API-ruttens JSON-body, tester)
  // kan passera vad som helst — vaktarna nedan smalnar av i rätt ordning.
  const falt: string = p?.falt;
  if (typeof falt !== "string" || !falt) {
    return { ok: false, fel: "Fält krävs — skrivningen avbröts." };
  }
  if ((VITLAS_FALT as readonly string[]).includes(falt)) {
    return {
      ok: false,
      fel: `Fältet "${falt}" är VITLÅST — slug, category, weight, xp, minutes och chapters (med strukturella syskon) är aldrig skrivbara från panelen (våg 82).`,
    };
  }
  if (!arKursMetadataFalt(falt)) {
    return { ok: false, fel: `Okänt fält "${falt.slice(0, 40)}" — vitlistan är title/summary/learn/why.` };
  }
  if (p.varde === null) {
    return { ok: true, varde: null, av: rensaAv(p.av) }; // tombstone = rollback
  }
  if (typeof p.varde !== "string") {
    return { ok: false, fel: "Värdet måste vara en sträng eller null (null = återställ filvärdet)." };
  }
  const rensat = p.varde.trim();
  if (!rensat) {
    return {
      ok: false,
      fel: "Värdet får inte vara tomt — skicka varde:null för rollback (tombstone) i stället.",
    };
  }
  const tak = LANGD_TAK[falt];
  if (rensat.length > tak) {
    return {
      ok: false,
      fel: `Fältet "${falt}" är ${String(rensat.length)} tecken — taket är ${String(tak)} tecken.`,
    };
  }
  // Våg 66-grinden: kontrolleraText är SYNKRON (varumarke.ts) och returnerar
  // {fel, varningar} — ENDAST FEL-klassen stoppar skrivningen.
  const { fel } = kontrolleraText(rensat);
  if (fel.length > 0) {
    const lista = fel.map((f) => `"${f.fras}" → ${f.ersattning}`).join("; ");
    return { ok: false, fel: `KontrolleraText-grinden nekar (0 FEL krävs, våg 66): ${lista}` };
  }
  return { ok: true, varde: rensat, av: rensaAv(p.av) };
}

// ── PostgREST-plumbing (variabler-lagring.ts våg 79, ordagrant mönster) ──────

/** URL-kodat PostgREST-filtervärde — RÅTT, aldrig citerat (lager.ts våg 55). */
function fv(v: string): string {
  return encodeURIComponent(v);
}

/** Senaste-vinner-ordningen — id.desc som tiebreaker (lager.ts våg 67). */
const SENASTE = "order=created_at.desc,id.desc";

/** Max rader per sid-begäran — PostgREST default-sida är 1 000 rader. */
const SIDSTORLEK = 1000;
/** Tak: 10 sidor = 10 000 värde-rader (kontraktets paginerings-tak, v79). */
const MAX_Sidor = 10;

/** En värde-rad såsom PostgREST returnerar den (arrow-select ur details). */
export type KursMetadataLasRad = {
  created_at?: string | null;
  slug?: string | null;
  falt?: string | null;
  /** jsonb->> ger text; null = tombstone (rollback ⇒ filvärdet gäller). */
  varde?: string | null;
};

/** Nätverksfel-namn utan hemligheter ("TimeoutError", "TypeError" …). */
function felnamn(e: unknown): string {
  return e instanceof Error ? e.name : "okänt nätverksfel";
}

/** Läs ALLA värde-rader (nyast först, paginerat) — kastar ALDRIG; fel/tomt
 *  ⇒ tom array (filvärdena gäller). URL enligt Mimosa-receptet: "+"-konkat,
 *  inga variabler i sökvägen (sökvägen är konstant, filtrena %-kodade). */
async function lasRader(): Promise<KursMetadataLasRad[]> {
  // Våg 79-hermetiken: under next build ALDRIG nät — isr-ytorna prerenderas
  // med filvärdena; revalidation (runtime) läser live.
  if (process.env.NEXT_PHASE === "phase-production-build") return [];
  const rest = getSupabaseRest();
  if (!rest) return [];
  const rader: KursMetadataLasRad[] = [];
  for (let sida = 0; sida < MAX_Sidor; sida++) {
    const fran = sida * SIDSTORLEK;
    try {
      const url =
        rest.origin +
        "/rest/v1/system_events?type=eq." +
        fv(KURS_METADATA_EVENT_TYP) +
        "&select=created_at,details->>slug,details->>falt,details->>varde&" +
        SENASTE;
      const res = await fetch(url, {
        headers: { ...rest.headers, Range: `${fran}-${String(fran + SIDSTORLEK - 1)}` },
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      });
      if (!res.ok) return []; // tyst fall-back — filvärdena gäller
      const sidRader = (await res.json()) as KursMetadataLasRad[];
      if (!Array.isArray(sidRader)) return [];
      rader.push(...sidRader);
      if (sidRader.length < SIDSTORLEK) break; // sista sidan — allt är läst
    } catch {
      return []; // nätverksfel/timeout — tyst fall-back
    }
  }
  return rader;
}

// ── Senaste-vinner + tombstone (ren funktion — testernas kärna) ──────────────

/**
 * rader (nyast först) → karta nyckel → gällande värde. FÖREKOMST först vinner
 * eftersom indata är sorterad nyast-först; en TOMBSTONE (varde null/ogiltigt)
 * markerar nyckeln som sedd UTAN att sättas ⇒ nyckeln bor kvar ur kartan ⇒
 * FILVÄRDET gäller (rollback). Ogiltiga rader (falt utanför vitlistan, saknad
 * slug) kan aldrig vinna — tolerant läsning, exakt variabler-mönstret.
 */
export function senasteVinnerKursMetadata(rader: readonly KursMetadataLasRad[]): Map<string, string> {
  const karta = new Map<string, string>();
  const sett = new Set<string>();
  for (const r of rader) {
    if (typeof r?.slug !== "string" || !r.slug) continue;
    if (!arKursMetadataFalt(r.falt)) continue;
    const nyckel = byggNyckel(r.slug, r.falt);
    if (sett.has(nyckel)) continue; // senaste raden har redan vunnit
    sett.add(nyckel);
    if (typeof r.varde === "string" && r.varde.trim() !== "") {
      karta.set(nyckel, r.varde);
    }
    // varde null/ej sträng = tombstone ⇒ nyckeln filtreras bort (filen gäller)
  }
  return karta;
}

// ── lasKursOverrides — modul-cache 5 min (§A1-signaturen) ────────────────────

const CACHE_MS = 5 * 60 * 1000;

let memo: { vid: number; karta: Map<string, string> } | null = null;

/** Rensa modul-cachen (efter lyckad skrivning — nästa läsning ser nya läget
 *  direkt istället för att vänta ut cachen). */
export function glomKursMetadataCache(): void {
  memo = null;
}

/**
 * lasKursOverrides — karta nyckel "{slug}.{falt}" → gällande live-värde
 * (SENASTE-VINNER, Range-paginerat). Modul-cache 5 min. Supabase-fel/tom
 * databas/byggfas ⇒ TOM karta ⇒ filvärdena gäller (kastar ALDRIG).
 */
export async function lasKursOverrides(): Promise<Map<string, string>> {
  if (memo !== null && Date.now() - memo.vid < CACHE_MS) return memo.karta;
  const karta = senasteVinnerKursMetadata(await lasRader());
  memo = { vid: Date.now(), karta };
  return karta;
}

// ── Merge — override > äldre värde > tombstone > fil (§A1) ───────────────────

/**
 * tillampaKursOverrides — REN merge av vitliste-fälten ur en override-karta
 * (testbar kärna): override-värde slår in per fält, frånvarande nyckel
 * (tombstone/aldrig skriven) lämnar filvärdet orört. Främmana nycklar (fel
 * fält-namn, främmande slug) kan per konstruktion aldrig påverka kursen.
 */
export function tillampaKursOverrides(kurs: Course, overrides: ReadonlyMap<string, string>): Course {
  const ut: Course = { ...kurs };
  for (const falt of KURS_FALT_VITLISTA) {
    const varde = overrides.get(byggNyckel(kurs.slug, falt));
    if (varde !== undefined) ut[falt] = varde;
  }
  return ut;
}

/**
 * medKursOverrides — lasKursOverrides + tillampa: kursens title/summary/learn/
 * why med gällande live-värden, resten av Course orört (kapitel, quiz, XP,
 * kategori — vitlåset garanterat i merge: endast de fyra fälten läsens in).
 * Typen åter-returneras (Course in, Course ut). Kastar ALDRIG.
 */
export async function medKursOverrides(kurs: Course): Promise<Course> {
  return tillampaKursOverrides(kurs, await lasKursOverrides());
}

// ── skrivKursMetadata — skrivvägen (§A1-signaturen) ──────────────────────────

/** Kort visningsform för meddelanden (details bär fulltexten). */
function visa(t: string | null): string {
  if (t === null) return "null";
  return t.length > 80 ? t.slice(0, 80) + "…" : t;
}

/**
 * skrivKursMetadata — validerar HÅRT och skriver värde-raden + revisionsraden
 * (dual-write i EN POST, v79-mönstret). Returnerar ALLTID {ok, fel?} — kastar
 * aldrig (rutten mappar direkt till 200/400).
 *
 * (a) NEXT_PHASE-hermetik: skrivning NEKAS under next build.
 * (b) valideraKursSkrivning med slug-universum ur getCourses() (deep-courses).
 * (c) Nyckel-intyget (Mimosa): "{slug}.{falt}" måste passera NYCKEL_INTYG_RE
 *     innan den får närma sig en URL — "+"-konkat, aldrig mallsträng.
 * (d) gammalt = gällande före skrivningen (override om finnes, annars
 *     filvärdet) — bärs av BÅDA radernas details.
 * (e) best-effort DELETE av nyckelns tidigare VÄRDE-rader (revisionsraderna
 *     rör aldrig — lagret sväller inte; nekas DELETE vinner ändå senaste
 *     raden vid läsning).
 * (f) POST av de två raderna i EN begäran; misslyckande ⇒ ärligt ok:false.
 * (g) glomKursMetadataCache — cachen speglar nya läget omedelbart.
 */
export async function skrivKursMetadata(p: {
  slug: string;
  falt: KursMetadataFalt;
  varde: string | null;
  av: string;
}): Promise<{ ok: boolean; fel?: string }> {
  // (a) byggfasen är nätverks-hermetisk — skrivning nekas alltid.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return { ok: false, fel: "Skrivning nekas under next build (bygget är nätverks-hermetiskt)." };
  }

  // (b) den hårda valideringen — ren, nät-fri, testad i testa-kurs-metadata.
  const validering = valideraKursSkrivning(p, Object.keys(getCourses()));
  if (!validering.ok) return { ok: false, fel: validering.fel };
  const slug = p.slug.trim();
  const falt = p.falt;
  const varde = validering.varde; // sanerat (trimmat) eller null (tombstone)
  const av = validering.av;

  const rest = getSupabaseRest();
  if (!rest) {
    return {
      ok: false,
      fel: "Supabase ej konfigurerat (NEXT_PUBLIC_SUPABASE_URL/nyckel saknas i miljön).",
    };
  }

  // (c) Mimosa-intyget — djup försvarslinje; slug+falt är redan hårda av (b).
  const nyckel = byggNyckel(slug, falt);
  if (!NYCKEL_INTYG_RE.test(nyckel)) {
    return { ok: false, fel: "Intern nyckelvalidering misslyckades — skrivningen avbröts." };
  }

  // (d) förra gällande värdet — override om finnes, annars filvärdet.
  const overrides = await lasKursOverrides();
  const kurs = getCourses()[slug];
  const filVarde = kurs && typeof kurs[falt] === "string" ? kurs[falt] : null;
  const gammalt = overrides.has(nyckel) ? overrides.get(nyckel)! : filVarde;

  // (e) best-effort radering av föregående VÄRDE-rader (ENDAST type=
  //     kurs_metadata med exakt denna slug+falt — revisionsraderna rör aldrig).
  try {
    const url =
      rest.origin +
      "/rest/v1/system_events?type=eq." +
      fv(KURS_METADATA_EVENT_TYP) +
      "&details->>slug=eq." +
      fv(slug) +
      "&details->>falt=eq." +
      fv(falt) +
      "&select=id";
    await fetch(url, {
      method: "DELETE",
      headers: rest.headers,
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
  } catch {
    /* best effort — senaste-vinner-läsningen täcker kvarvarande rader */
  }

  // (f) dual-write: värde-rad + revisionsrad i EN begäran (v79-mönstret).
  const nyText = varde === null ? "(tombstone — filvärdet gäller)" : visa(varde);
  try {
    const res = await fetch(rest.origin + "/rest/v1/system_events", {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify([
        {
          type: KURS_METADATA_EVENT_TYP,
          severity: "info",
          message: "[kurs] " + nyckel + " = " + nyText,
          details: { slug, falt, varde, gammalt, av, kalla: "panel" },
          source: KURS_KALLA,
        },
        {
          type: KURS_METADATA_ANDRING_EVENT_TYP,
          severity: "info",
          message: "[kurs-andring] " + nyckel + ": " + visa(gammalt) + " → " + nyText,
          details: { slug, falt, gammalt, nytt: varde, av, kalla: "panel" },
          source: KURS_KALLA,
        },
      ]),
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        ok: false,
        fel: "Kursmetadatan kunde inte sparas (lagret svarade HTTP " + String(res.status) + ").",
      };
    }
  } catch (e) {
    return { ok: false, fel: "Kursmetadatan kunde inte sparas (" + felnamn(e) + ")." };
  }

  // (g) cachen måste spegla det nya läget omedelbart.
  glomKursMetadataCache();
  return { ok: true };
}
