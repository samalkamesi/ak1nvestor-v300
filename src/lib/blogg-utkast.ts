/**
 * BLOGG-UTKAST — WordPress-kärnan i admin-mega steg 2 (VÅG 80b del B,
 * STYRELSE-ADMIN-MEGA.md "BYGGKONTRAKT VÅG 80b" §Del B).
 *
 * ── LÄGE A: PAKETEXPORT (produktbeslut, avvaktar Läge B-benchmark) ─────────
 * Utkast lever i Supabase (system_events type="blogg_utkast", SENASTE-VINNER
 * per slug — variabel-mönstret våg 79, ingen DDL). "Publicerad" sätts ENBART
 * via exportvägen: knappen "Exportera klar post" levererar JSON-paketet som
 * main/agent droppar i data/blogg/<slug>.json + commit → bloggroutern
 * (src/app/blogg/[slug]/page.tsx, force-static) renderar den automatiskt med
 * metadata/OG (src/lib/seo.ts blogMetadata) vid nästa main-push. Den
 * exporterade postens form = BlogPost (src/lib/content.ts) — exakt som de 55
 * befintliga data/blogg/*.json.
 *
 * Läge B (hot-path: /blogg läser Supabase-live) väntar på benchmark —
 * prestandarisken på 51+ inlägg kräver mätning först.
 *
 * ── EVENT-RADENS KONTRAKT ──────────────────────────────────────────────────
 *   type="blogg_utkast" severity="info" source="blogg"
 *   message="[blogg] <slug> v<version> <status>"
 *   details={slug, titel, ingress, bodyMarkdown, status, av, version,
 *            omslagUrl}        // våg 81 A5: giltig URL | null (inget omslag)
 * SENASTE-VINNER per slug: order=created_at.desc,id.desc, paginerat 1 000
 * rader/sida, tak 10 sidor (läs-reglerna från variabler-lagring.ts våg 79).
 * Modul-cache 60 s (panelens lista ska kännas live men inte DDoSa lagret).
 *
 * ── GRINDEN (våg 66-mönstret) ──────────────────────────────────────────────
 * kontrolleratextRad(titel, ingress, body) kör kontrolleraText (varumarke.ts)
 * på titel+ingress+body + strukturella krav: bodyMarkdown ≥ 800 tecken, minst
 * 2 "## "-rubriker, disclaimer-sista-rad (saknas ⇒ VARNING "kompletteras vid
 * export" — exportvägen lägger till negrerad disclaimer automatiskt).
 * Statusbyte utkast→granskad kräver 0 FEL. "publicerad" sätts ENBART av
 * exportvägen (exporteraKlarPost) — aldrig av sparaUtkast direkt.
 *
 * GRACEFUL NEDBRYTNING: lasUtkast kastar ALDRIG — Supabase-fel/tomt ⇒ tom
 * lista (panelen visar ett tomt-läge, aldrig krasch). Skrivvägen däremot är
 * ärlig: misslyckad persistens kastar BloggSparningsFel.
 *
 * Supabase-nycklar läses ENBART via supabase-rest.ts och hamnar ALDRIG i
 * kod, loggar eller felmeddelanden.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

import { getSupabaseRest } from "./supabase-rest";
import { kontrolleraText, SIGNATUR, type Traff } from "./varumarke";

// ── Konstanter ───────────────────────────────────────────────────────────────

export const BLOGG_EVENT_TYP = "blogg_utkast";
const BLOGG_KALLA = "blogg";

export type BloggStatus = "utkast" | "granskad" | "publicerad";

/** Ett gällande utkast (senaste-vinner-radens utsnitt per slug). */
export type BloggUtkastPost = {
  slug: string;
  titel: string;
  ingress: string;
  bodyMarkdown: string;
  status: BloggStatus;
  av: string;
  version: number;
  /** Radens created_at (ISO) — när utkastet senast skrevs. */
  uppdaterad: string;
  /** Valfri omslagsbild (VÅG 81 A5): ENDAST giltig https-URL till projektets
   *  Supabase-medialager bärs — ogiltiga värden klassas bort vid tolkningen. */
  omslagUrl?: string;
};

/** Slug-formatet — kontraktet: ^[a-z0-9-]+$ (URL-säkert, filnamnssäkert). */
const SLUG_RE = /^[a-z0-9-]+$/;

/**
 * Omslags-URL-kontraktet (VÅG 81 A5): ENDAST https till Supabase-storage —
 * exakt host-vitlista <projektref>.supabase.co/storage/v1/object/public/
 * media/<nyckel> (publika media-bucketens objekt-URL:er). Inga query- eller
 * hash-delar, inga andra hosts. Icke-tomt men ogiltigt värde AVVISAS i
 * skrivvägen (400) och klassas ogiltigt (null) vid tolkning/export.
 */
const OMSLAG_URL_RE =
  /^https:\/\/[a-z0-9][a-z0-9-]*\.supabase\.co\/storage\/v1\/object\/public\/media\/[A-Za-z0-9._~/-]+$/;

/** Normaliserad giltig omslags-URL, eller null (ogiltig/tom/fel typ). */
export function valideraOmslagUrl(u: unknown): string | null {
  if (typeof u !== "string") return null;
  const t = u.trim();
  return t !== "" && OMSLAG_URL_RE.test(t) ? t : null;
}

/** Den exporterade klara posten — exakt BlogPost-formen (content.ts) som
 *  data/blogg/*.json redan bär; main/agent droppar filen + committar. */
export type BloggExportPost = {
  slug: string;
  title: string;
  description: string;
  pillar: string;
  author: string;
  publishedAt: string; // ISO-dag (YYYY-MM-DD)
  readingMinutes: number; // estimat: ordantal / 600, avrundat
  tags: string[];
  body: string;
  /** Extern OG-bild-override (VÅG 81 A5): medföljer ENDAST när utkastets
   *  omslagUrl var giltig (https + Supabase-media-vitlistan). Utan detta
   *  fält gäller render-tidens genererade /og/blogg/<slug>.png (ogBildForPath
   *  i seo.tsx) — media är override, ALDRIG ersättning av build-genereringen
   *  (kontrakt AC4). */
  ogBild?: string;
};

// ── Strukturella krav (kontraktet) ──────────────────────────────────────────

export const BODY_MIN_TECKEN = 800;
export const BODY_MIN_RUBRIKER = 2;
/** Läshastighet för readingMinutes-estimatet (ord/min, avrundat). */
export const ORD_PER_MINUT = 600;

/** En kontrollträff i rapporten — varumärkes-träffar bärs rakt av Traff. */
export type StrukturAnmarkning = {
  typ: "struktur";
  meddelande: string;
  allvar: "FEL" | "VARNING";
};

export type Kontrollrapport = {
  fel: Traff[];
  varningar: Traff[];
  strukturFel: StrukturAnmarkning[];
  strukturVarningar: StrukturAnmarkning[];
  /** Sant exakt när 0 FEL (både varumärke och struktur) — granskad-grinden. */
  godkand: boolean;
  /** Antal ord i titel+ingress+body (readingMinutes-basen). */
  ord: number;
  /** Estimerat läsantal minuter (avrundat, minst 1). */
  readingMinutes: number;
};

/**
 * kontrolleratextRad — GRINDEN. Kör kontrolleraText (varumarke.ts) på
 * titel+ingress+body SAMT de strukturella kraven: bodyMarkdown ≥ 800 tecken,
 * minst 2 "## "-rubriker, disclaimer-sista-rad. Saknad disclaimer ⇒ VARNING
 * "kompletteras vid export" (exportvägen lägger till den — aldrig ett FEL,
 * aldrig ett stopp). Struktur-FELEN (kort body, för få rubriker) stoppar
 * granskad-grinden men stoppar INTE sparande av utkast.
 */
export function kontrolleratextRad(titel: string, ingress: string, body: string): Kontrollrapport {
  const helaTexten = `${titel}\n${ingress}\n${body}`;
  const { fel, varningar } = kontrolleraText(helaTexten);

  const strukturFel: StrukturAnmarkning[] = [];
  const strukturVarningar: StrukturAnmarkning[] = [];

  if (body.trim().length < BODY_MIN_TECKEN) {
    strukturFel.push({
      typ: "struktur",
      allvar: "FEL",
      meddelande: `Bodyn är ${String(body.trim().length)} tecken — kravet är minst ${String(BODY_MIN_TECKEN)} (WordPress-kärnans längdkrav).`,
    });
  }

  const rubriker = (body.match(/^## /gm) ?? []).length;
  if (rubriker < BODY_MIN_RUBRIKER) {
    strukturFel.push({
      typ: "struktur",
      allvar: "FEL",
      meddelande: `Bodyn har ${String(rubriker)} "## "-rubriker — kravet är minst ${String(BODY_MIN_RUBRIKER)}.`,
    });
  }

  // Disclaimer-sista-rad: den negerade formen ("inte investeringsråd") ska
  // återfinnas i bodyns sista icke-tomma rad (existerande data/blogg/*.json
  // bär "_Detta är pedagogisk finansanalys, inte investeringsråd._").
  const rader = body.trimEnd().split("\n");
  const sistaRad = rader[rader.length - 1]?.trim() ?? "";
  const harDisclaimerSist = /investeringsråd/i.test(sistaRad);
  if (!harDisclaimerSist) {
    strukturVarningar.push({
      typ: "struktur",
      allvar: "VARNING",
      meddelande: `Sista raden är inte en disclaimer — kompletteras vid export ("${SIGNATUR.disclaimer}" läggs till automatiskt om den saknas).`,
    });
  }

  const ord = helaTexten
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(ord / ORD_PER_MINUT));

  return {
    fel,
    varningar,
    strukturFel,
    strukturVarningar,
    godkand: fel.length === 0 && strukturFel.length === 0,
    ord,
    readingMinutes,
  };
}

// ── PostgREST-plumbing (variabler-lagring.ts-mönstret) ──────────────────────

/** URL-kodat PostgREST-filtervärde — RÅTT, aldrig citerat (lager.ts våg 55). */
function fv(v: string): string {
  return encodeURIComponent(v);
}

/** Senaste-vinner-ordningen — id.desc som tiebreaker (lager.ts våg 67). */
const SENASTE = "order=created_at.desc,id.desc";

/** PostgREST default-sida är 1 000 rader. */
const SIDSTORLEK = 1000;
/** Tak: 10 sidor = 10 000 utkast-rader (kontraktets paginerings-tak). */
const MAX_Sidor = 10;

/** En utkast-rad såsom PostgREST returnerar den (arrow-select ur details). */
type BloggLasRad = {
  created_at?: string | null;
  slug?: string | null;
  titel?: string | null;
  ingress?: string | null;
  bodyMarkdown?: string | null;
  status?: string | null;
  av?: string | null;
  version?: string | number | null; // jsonb->> ger text — tolka båda
  omslagUrl?: string | null; // VÅG 81 A5 — vitlistas av valideraOmslagUrl
};

/** Tolka status — ogiltig rad kan inte vinna (tolerant läsning). */
function tolkaStatus(v: unknown): BloggStatus | null {
  return v === "utkast" || v === "granskad" || v === "publicerad" ? v : null;
}

/** Tolka version — heltal ≥ 1 accepteras, annat ⇒ null. */
function tolkaVersion(v: BloggLasRad["version"]): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v.trim()) : NaN;
  return Number.isInteger(n) && n >= 1 ? n : null;
}

/** Normalisera en rårad till ett utkast — null när raden är för knackig. */
function tolkaRad(r: BloggLasRad): BloggUtkastPost | null {
  if (typeof r.slug !== "string" || !SLUG_RE.test(r.slug)) return null;
  if (typeof r.titel !== "string" || !r.titel.trim()) return null;
  const status = tolkaStatus(r.status);
  if (!status) return null;
  // Omslags-URLn vitlistas hårt — ogiltigt värde klassas bort (fältet
  // sätts aldrig), raden själv påverkas inte (tolerant läsning).
  const omslagUrl = valideraOmslagUrl(r.omslagUrl);
  return {
    slug: r.slug,
    titel: r.titel,
    ingress: typeof r.ingress === "string" ? r.ingress : "",
    bodyMarkdown: typeof r.bodyMarkdown === "string" ? r.bodyMarkdown : "",
    status,
    av: typeof r.av === "string" && r.av ? r.av : "admin",
    version: tolkaVersion(r.version) ?? 1,
    uppdaterad: typeof r.created_at === "string" ? r.created_at : "",
    ...(omslagUrl ? { omslagUrl } : {}),
  };
}

/** Läs ALLA utkast-rader (nyast först, paginerat) — kastar ALDRIG. */
async function lasRader(): Promise<BloggLasRad[]> {
  // Bygget är nätverks-hermetiskt (våg 79): ingen live-läsning under
  // phase-production-build — panelen ändå dynamisk (force-dynamic).
  if (process.env.NEXT_PHASE === "phase-production-build") return [];
  const rest = getSupabaseRest();
  if (!rest) return [];
  const rader: BloggLasRad[] = [];
  for (let sida = 0; sida < MAX_Sidor; sida++) {
    const fran = sida * SIDSTORLEK;
    try {
      const res = await fetch(
        `${rest.origin}/rest/v1/system_events?type=eq.${fv(BLOGG_EVENT_TYP)}` +
          `&select=created_at,details->>slug,details->>titel,details->>ingress,details->>bodyMarkdown,details->>status,details->>av,details->>version,details->>omslagUrl&${SENASTE}`,
        {
          headers: { ...rest.headers, Range: `${fran}-${String(fran + SIDSTORLEK - 1)}` },
          signal: AbortSignal.timeout(10_000),
          cache: "no-store",
        },
      );
      if (!res.ok) return [];
      const sidRader = (await res.json()) as BloggLasRad[];
      if (!Array.isArray(sidRader)) return [];
      rader.push(...sidRader);
      if (sidRader.length < SIDSTORLEK) break; // sista sidan — allt är läst
    } catch {
      return [];
    }
  }
  return rader;
}

// ── Modul-cache 60 s (panel-listan — live-känsla utan DDoS) ─────────────────

const CACHE_MS = 60 * 1000;

let memo: { vid: number; poster: Map<string, BloggUtkastPost> } | null = null;

/** Rensa modul-cachen (efter skrivning — nästa läsning ser nya läget direkt). */
export function glomBloggCache(): void {
  memo = null;
}

/** Rader (nyast först) → karta slug → senaste-vinner-utkast. Ren funktion. */
export function senasteVinnerBlogg(rader: readonly BloggLasRad[]): Map<string, BloggUtkastPost> {
  const karta = new Map<string, BloggUtkastPost>();
  for (const r of rader) {
    const post = tolkaRad(r);
    if (!post) continue;
    if (karta.has(post.slug)) continue; // senaste raden har redan vunnit
    karta.set(post.slug, post);
  }
  return karta;
}

/**
 * lasUtkast — karta slug → gällande utkast (senaste-vinner per slug).
 * Modul-cache 60 s. Kastar ALDRIG — Supabase-fel/tomt ⇒ tom karta.
 */
export async function lasUtkast(): Promise<Map<string, BloggUtkastPost>> {
  if (memo !== null && Date.now() - memo.vid < CACHE_MS) return memo.poster;
  const poster = senasteVinnerBlogg(await lasRader());
  memo = { vid: Date.now(), poster };
  return poster;
}

// ── Skrivväg ────────────────────────────────────────────────────────────────

/** Tydligt fel när raden inte kunde persistas (ärligt — aldrig tyst ok). */
export class BloggSparningsFel extends Error {
  constructor(orsak: string) {
    super("Bloggutkastet kunde inte sparas (" + orsak + ").");
    this.name = "BloggSparningsFel";
  }
}

/** Valideringsfel — rutten mappar till 400 (aldrig 500). */
export class BloggValideringsFel extends Error {
  constructor(meddelande: string) {
    super(meddelande);
    this.name = "BloggValideringsFel";
  }
}

export type NyttUtkast = {
  slug: string;
  titel: string;
  ingress: string;
  bodyMarkdown: string;
  status?: BloggStatus;
  av?: string;
  /** Valfri omslagsbild (VÅG 81 A5) — icke-tomt värde MÅSTE klara
   *  valideraOmslagUrl (https + Supabase-media-vitlista), annars 400.
   *  Tom sträng/undefined = inget omslag (rensning). */
  omslagUrl?: string;
};

/**
 * sparaUtkast — validerar, räknar version (förra + 1, nytt utkast ⇒ 1) och
 * skriver en ny blogg_utkast-rad. Tidigare rader för slugen RÖRS inte —
 * senaste-vinner-läsningen gör hela historiken revisbar (ingen DELETE här:
 * till skillnad från variablerna är utkastens historik själva gransknings-
 * spåret; lagret hålls inom paginerings-taket av main-flödet).
 *
 * Slug krävs i formatet ^[a-z0-9-]+$ och är UNIK-TVINGAD VID NY: med
 * ny=true avvisas slug som redan gäller (400 — öppna utkastet i stället).
 * Status valideras mot registret; "publicerad" avvisas HÄR — den sätts
 * ENBART via exportvägen (markeraPublicerad, anropad av export-rutten).
 */
export async function sparaUtkast(post: NyttUtkast, ny = false): Promise<BloggUtkastPost> {
  const slug = post.slug.trim();
  if (!SLUG_RE.test(slug)) {
    throw new BloggValideringsFel("Slug måste matcha ^[a-z0-9-]+$ (små bokstäver, siffror, bindestreck).");
  }
  if (!post.titel.trim()) throw new BloggValideringsFel("Titel krävs.");
  const status = post.status ?? "utkast";
  if (status === "publicerad") {
    throw new BloggValideringsFel(
      'Status "publicerad" kan inte sparas direkt — den sätts enbart via exportvägen (Läge A: paketexport).',
    );
  }
  if (status !== "utkast" && status !== "granskad") {
    throw new BloggValideringsFel('Status måste vara "utkast" eller "granskad".');
  }
  if (post.bodyMarkdown.trim().length === 0 && status === "granskad") {
    throw new BloggValideringsFel("Body får inte vara tom vid granskad-status.");
  }
  // VÅG 81 A5: omslags-URL — valfri, men icke-tomt värde avvisas hårt om det
  // inte klara vitlistan (https + <ref>.supabase.co/storage/.../media/...).
  // Ogiltigt värde ska aldrig kunna persistas — aldrig tyst sanitering här.
  const omslagUrl = valideraOmslagUrl(post.omslagUrl);
  if (post.omslagUrl != null && post.omslagUrl.trim() !== "" && !omslagUrl) {
    throw new BloggValideringsFel(
      "Omslagsbilds-URL ogiltig — endast https till <projektref>.supabase.co/storage/v1/object/public/media/... accepteras (våg 81 A5).",
    );
  }
  // STATUSREGEL (kontraktet): utkast→granskad kräver 0 FEL i kontrolleraText
  // — grunden bor i lib:en (rutten är tunn; våg 66-mönstret).
  if (status === "granskad") {
    const rapport = kontrolleratextRad(post.titel, post.ingress, post.bodyMarkdown);
    if (!rapport.godkand) {
      const alla = [
        ...rapport.fel.map((f) => `"${f.fras}" → ${f.ersattning}`),
        ...rapport.strukturFel.map((s) => s.meddelande),
      ];
      throw new BloggValideringsFel(
        `Statusbyte till granskad nekas — 0 FEL krävs: ${alla.join("; ")}`,
      );
    }
  }

  const rest = getSupabaseRest();
  if (!rest) {
    throw new BloggSparningsFel("Supabase ej konfigurerat (NEXT_PUBLIC_SUPABASE_URL/nyckel saknas i miljön)");
  }

  const befintliga = await lasUtkast();
  const befintlig = befintliga.get(slug);
  if (ny && befintlig) {
    throw new BloggValideringsFel(
      `Slug "${slug}" används redan av ett utkast (v${String(befintlig.version)}, status ${befintlig.status}) — slug är unik-tvingad vid nytt utkast. Öppna befintligt utkast i stället.`,
    );
  }
  const version = befintlig ? befintlig.version + 1 : 1;
  const av = post.av?.trim() || "admin";

  try {
    const res = await fetch(`${rest.origin}/rest/v1/system_events`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        type: BLOGG_EVENT_TYP,
        severity: "info",
        message: `[blogg] ${slug} v${String(version)} ${status}`,
        details: {
          slug,
          titel: post.titel.trim(),
          ingress: post.ingress.trim(),
          bodyMarkdown: post.bodyMarkdown,
          status,
          av,
          version,
          omslagUrl, // giltig URL eller null (null = inget omslag — rensning)
        },
        source: BLOGG_KALLA,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      throw new BloggSparningsFel("lagret svarade HTTP " + String(res.status));
    }
  } catch (e) {
    if (e instanceof BloggSparningsFel) throw e;
    throw new BloggSparningsFel(e instanceof Error ? e.name : "okänt fel");
  }

  glomBloggCache();
  return {
    slug,
    titel: post.titel.trim(),
    ingress: post.ingress.trim(),
    bodyMarkdown: post.bodyMarkdown,
    status,
    av,
    version,
    uppdaterad: new Date().toISOString(),
    ...(omslagUrl ? { omslagUrl } : {}),
  };
}

// ── Exportvägen (Läge A: paketexport) ───────────────────────────────────────

/** Kontraktets fasta fält för exporterade poster (80b §Del B). */
export const EXPORT_PILLAR = "Institutionell metodik";
export const EXPORT_AUTHOR = "AK1A Research Lab";

/** Säkerställ negerad disclaimer som SISTA rad — läggs till om den saknas
 *  (kontraktet: "negerad disclaimer tillsätts automatiskt om den saknas"). */
export function sakerstallDisclaimer(body: string): string {
  const rader = body.trimEnd().split("\n");
  const sistaRad = rader[rader.length - 1]?.trim() ?? "";
  if (/investeringsråd/i.test(sistaRad)) return body.trimEnd();
  return `${body.trimEnd()}\n\n_${SIGNATUR.disclaimer}_`;
}

/** Enkelt ämnesords-estimat: taggar skickas med från panelen (eller tom
 *  lista) — exportvägen tvingar aldrig på påhittade ämnesord. */
function normaliseraTaggar(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .filter((t): t is string => typeof t === "string" && t.trim() !== "")
    .map((t) => t.trim())
    .slice(0, 12);
}

/**
 * exporteraKlarPost — Läge A-paketet. GRIND: kontrolleraText 0 FEL krävs
 * (annars BloggValideringsFel — rutten mappar till 400). Bygger den klara
 * JSON-posten i exakt BlogPost-formen (content.ts): pillar
 * "Institutionell metodik", author "AK1A Research Lab", publishedAt = dagens
 * ISO-dag, readingMinutes = ordantal/600 avrundat, disclaimer-tillagd body.
 * Paketet droppas av main/agent i data/blogg/<slug>.json + commit → live.
 *
 * VÅG 81 A5: utkastets omslagUrl (valfritt) medföljer som paketfältet
 * ogBild ENDAST när det klara valideraOmslagUrl-vitlistan — annars bär
 * paketet inget og-fält och render-tidens genererade /og-bloggbild gäller
 * (media = override, ALDRIG ersättning av npm run og-genereringen, AC4).
 */
export function exporteraKlarPost(
  post: Pick<BloggUtkastPost, "slug" | "titel" | "ingress" | "bodyMarkdown" | "omslagUrl">,
  tags: unknown = [],
): { paket: BloggExportPost; rapport: Kontrollrapport } {
  const rapport = kontrolleratextRad(post.titel, post.ingress, post.bodyMarkdown);
  if (rapport.fel.length > 0 || rapport.strukturFel.length > 0) {
    const alla = [
      ...rapport.fel.map((f) => `"${f.fras}" → ${f.ersattning}`),
      ...rapport.strukturFel.map((s) => s.meddelande),
    ];
    throw new BloggValideringsFel(
      `Export nekas — 0 FEL krävs (våg 66-grinden): ${alla.join("; ")}`,
    );
  }

  const body = sakerstallDisclaimer(post.bodyMarkdown);
  const dag = new Date().toISOString().slice(0, 10);
  const ogBild = valideraOmslagUrl(post.omslagUrl);
  return {
    paket: {
      slug: post.slug,
      title: post.titel,
      description: post.ingress,
      pillar: EXPORT_PILLAR,
      author: EXPORT_AUTHOR,
      publishedAt: dag,
      readingMinutes: rapport.readingMinutes,
      tags: normaliseraTaggar(tags),
      body,
      ...(ogBild ? { ogBild } : {}),
    },
    rapport,
  };
}

/**
 * markeraPublicerad — skriver raden med status="publicerad". ANROPAS ENBART
 * av export-rutten EFTER att exporteraKlarPost passerat 0-FEL-grinden: det
 * är så "publicerad sätts enbart via exportvägen (Läge A)" hålls i lagret
 * (sparaUtkast avvisar statusen — detta är den enda insläppet). Versionen
 * räknas vidare; innehållet bärs rakt av från det sparade utkastet.
 */
export async function markeraPublicerad(post: BloggUtkastPost): Promise<void> {
  const rest = getSupabaseRest();
  if (!rest) {
    throw new BloggSparningsFel("Supabase ej konfigurerat (NEXT_PUBLIC_SUPABASE_URL/nyckel saknas i miljön)");
  }
  const version = post.version + 1;
  try {
    const res = await fetch(`${rest.origin}/rest/v1/system_events`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        type: BLOGG_EVENT_TYP,
        severity: "info",
        message: `[blogg] ${post.slug} v${String(version)} publicerad`,
        details: {
          slug: post.slug,
          titel: post.titel,
          ingress: post.ingress,
          bodyMarkdown: post.bodyMarkdown,
          status: "publicerad" as BloggStatus,
          av: post.av,
          version,
          omslagUrl: post.omslagUrl ?? null, // bärs med i revisionshistoriken
        },
        source: BLOGG_KALLA,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      throw new BloggSparningsFel("lagret svarade HTTP " + String(res.status));
    }
  } catch (e) {
    if (e instanceof BloggSparningsFel) throw e;
    throw new BloggSparningsFel(e instanceof Error ? e.name : "okänt fel");
  }
  glomBloggCache();
}
