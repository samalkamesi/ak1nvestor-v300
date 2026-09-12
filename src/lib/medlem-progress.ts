/**
 * MEDLEM-PROGRESS — serverstyrd XP/progress-sync (FAS L2, STYRELSE-
 * INLOGGNING-ADMIN.md våg 87 — kontraktet i data/forskning/STYRELSE/
 * STYRELSE-V86-L2-GATING.md §B, som är det BINDANDE underlaget).
 *
 * ── KONTRAKTET ──────────────────────────────────────────────────────────────
 * Progress bor i system_events (INGEN DDL — kund-SQL krävs aldrig, MÖS-
 * lärdomen) som rader type="medlem_progress", skrivna exakt enligt
 * organ-event.ts-mönstret (getSupabaseRest, Prefer: return=minimal,
 * AbortSignal.timeout(8000), fail-safe). Members-profilen läses SENASTE-
 * VINNER per nyckel — men REQUESTSCOPAD: ALDRIG modul-cache (kurs-metadata-
 * lives 5-min-cache är global per instans = läcker mellan medlemmar —
 * förbjudet enligt §B.4).
 *
 * ── NYCKELFORMULEN (deterministiska — ALDRIG klientskickad sträng, §B.3) ────
 *   quiz     → quiz:<slug>:<kap>:<i>      varde 10  (XP-ekonomin: 10/fråga)
 *   kursklar → kursklar:<slug>            varde 50  (+ stjarna:<slug> varde 1
 *                                                   — kursklar = 50 XP + ★,
 *                                                   samma dubbelrad-post som
 *                                                   v79-dual-write)
 *   stjarna  → stjarna:<slug>             varde 1
 *   import   → import:<authId>:<datum>    varde {xp, stjarnor, klaraKurser}
 * VÄRDET FASTSTÄLLS AV SERVERN — klienten kan aldrig förhandla belopp.
 * Nyckelformatet dubbleras mot klientens ak1a-quiz-<slug>-<kap>-<i> (skulda_
 * notera, §D): dokumenterat här som den kanoniska kartan.
 *
 * ── ANTI-FUSK (ärliga gränser, nivå 1 — §B) ─────────────────────────────────
 * GRÄNS 1: inloggad kan POSTa quiz/kursklar han inte gjort — saboterad EGEN
 * statistik = acceptabelt (samma klass som att redigera localStorage).
 * GRÄNS 2: kursinnehållet är tekniskt publikt (public/deep-courses.json +
 * öppna /api/kurs/*). Gating = pedagogik + betalmoral, ej DRM.
 * GRÄNS 3: streak förblir endast lokal (integritetsval, v1-scope).
 * Importen: takad mot teoretiskt max ur kursdata + ENGÅNGS-markerad per
 * authId (import-*:s blotta förekomst = flaggan; idempotent).
 *
 * ── GDPR ─────────────────────────────────────────────────────────────────────
 * Importen sänder ENDAST aggregat (xp, stjärnor, klara slug:ar) — ingen
 * e-post (authId identifierar), ingen tredje part, knapptryck = samtycke
 * (§A.3). Läsningen filtrerar details->>authId — en medlem ser aldrig en
 * annan medlems nycklar.
 *
 * ── VÅG 79-HERMETIK ──────────────────────────────────────────────────────────
 * NEXT_PHASE==="phase-production-build" ⇒ lasMedlemProgress svarar tomt
 * UTAN nät och skrivningen NEKAS — modulen FÅR ALDRIG fetcha under next
 * build. All miljöläsning och allt nät bor I funktionskropparna.
 *
 * ── MIMOSA-RECEPTET (våg 81) ─────────────────────────────────────────────────
 * Origin hämtas ENBART via getSupabaseRest() (supabase-rest.ts —
 * https *.supabase.co-vakten). Fetch-URL:er byggs med "+"-konkat och
 * %-kodade filtervärden — ALDRIG mallsträng med variabel i sökvägen.
 *
 * Läsbar av L3-admin senare. Pedagogisk plattform — inte investeringsråd.
 */

import { getSupabaseRest } from "./supabase-rest";
import { getCourses, type Course } from "@/lib/content";

// ── Event-typ + XP-ekonomi (exporteras för rutten/testerna) ─────────────────

/** Event-typen för medlemprogress (system_events.type; INGEN ny tabell/DDL). */
export const MEDLEM_PROGRESS_EVENT_TYP = "medlem_progress";
const MEDLEM_PROGRESS_KALLA = "medlem";

/** XP-ekonomin (våg 78 B4a — samma belopp som member-local.ts betalar ut). */
export const XP_PER_QUIZ = 10;
export const XP_KURSKLAR = 50;
export const VARDE_STJARNA = 1;

/** Skriv-typerna i vitlistan (§B — import hanteras av sin egen validator). */
export type ProgressTyp = "quiz" | "kursklar" | "stjarna";

// ── Kursdata-vyer (quiz är inte i Course-typen — tolerant nedtypning) ───────

type KapitelMedQuiz = { num?: unknown; quiz?: unknown };

function hittaKapitel(kurs: Course, kap: number): KapitelMedQuiz | null {
  const k = (kurs.chapters as unknown as KapitelMedQuiz[]).find((ch) => ch?.num === kap);
  return k ?? null;
}

function antalQuizFragor(kurs: Course): number {
  return (kurs.chapters as unknown as KapitelMedQuiz[]).reduce(
    (s, ch) => s + (Array.isArray(ch?.quiz) ? (ch.quiz as unknown[]).length : 0),
    0,
  );
}

// ── Teoretiskt max (importtaket — §B.4 "≤ teoretiskt max ur kursdata") ──────

/** Max intjänbar XP ur ett kursuniversum: quiz×10 + klar-bonus 50 per kurs. */
export function teoretisktMaxXp(kurser: Record<string, Course>): number {
  return Object.values(kurser).reduce((s, k) => s + antalQuizFragor(k) * XP_PER_QUIZ + XP_KURSKLAR, 0);
}

/** Max stjärnor: en per kurs (kursklar = 50 XP + exakt 1 ★). */
export function teoretisktMaxStjarnor(kurser: Record<string, Course>): number {
  return Object.keys(kurser).length;
}

// ── Validering + deterministiska nycklar (ren logik — testernas kärna) ──────

/** Import-raders värde — ett aggregat, aldrig ett förhandlat belopp. */
export type ImportVarde = { xp: number; stjarnor: number; klaraKurser: string[] };

/** En skriven rad: deterministisk nyckel + server-fastställt värde
 *  (tal för quiz/kursklar/stjarna — aggregatobjekt för import). */
export type ProgressRad = { nyckel: string; varde: number | ImportVarde };

/** Skrivvägens inparametrar — exakt §B:ens body (typ, slug, kap?, i?). */
export type ProgressSkrivning = {
  typ: unknown;
  slug: unknown;
  kap?: unknown;
  i?: unknown;
};

/** Valideringsresultatet — ok med server-fastställda rader, eller ärligt fel. */
export type ProgressValidering =
  | { ok: true; slug: string; rader: ProgressRad[] }
  | { ok: false; fel: string };

function arHeltal(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v);
}

/**
 * valideraProgressSkrivning — GRINDEN, ren från nät och fs (kursuniversumet
 * passeras in — rutten ger getCourses()). Ordning:
 *   typ i vitlistan → slug finns i kursdata → quiz: kap+i inom gränserna
 *     (kapitlet med num===kap måste FINNAS och bära quiz; 0 ≤ i < längd).
 * NYCKELN OCH VÄRDET BYGGS HÄR, AV SERVERN — klientförhandlade fält
 * (nyckel/varde/xp i bodyn) läses ALDRIG och kan aldrig påverka utfallet.
 * kursklar ⇒ DUBBELRAD (kursklar:<slug>=50 + stjarna:<slug>=1) i EN POST —
 * samma belöning som NivaBar/kurssteg betalar ut lokalt (våg 78 B4b).
 */
export function valideraProgressSkrivning(
  p: ProgressSkrivning,
  kurser: Record<string, Course>,
): ProgressValidering {
  const typ = p?.typ;
  if (typ !== "quiz" && typ !== "kursklar" && typ !== "stjarna") {
    return { ok: false, fel: "Okänd typ — vitlistan är quiz, kursklar, stjarna, import." };
  }
  const slug = typeof p?.slug === "string" ? p.slug.trim() : "";
  const kurs = kurser[slug];
  if (!slug || !kurs) {
    return { ok: false, fel: "Okänd kurs — slug finns inte i kursdata." };
  }

  if (typ === "quiz") {
    if (!arHeltal(p?.kap) || !arHeltal(p?.i) || (p?.kap as number) < 1 || (p?.i as number) < 0) {
      return { ok: false, fel: "Kapitel och frågeindex måste vara heltal (kap ≥ 1, i ≥ 0)." };
    }
    const kap = hittaKapitel(kurs, p.kap as number);
    if (!kap || !Array.isArray(kap.quiz)) {
      return { ok: false, fel: "Kapitlet finns inte eller har inget quiz." };
    }
    if ((p.i as number) >= (kap.quiz as unknown[]).length) {
      return { ok: false, fel: "Frågeindex utanför quizets längd." };
    }
    return {
      ok: true,
      slug,
      rader: [{ nyckel: `quiz:${slug}:${String(p.kap)}:${String(p.i)}`, varde: XP_PER_QUIZ }],
    };
  }

  if (typ === "kursklar") {
    return {
      ok: true,
      slug,
      rader: [
        { nyckel: `kursklar:${slug}`, varde: XP_KURSKLAR },
        { nyckel: `stjarna:${slug}`, varde: VARDE_STJARNA },
      ],
    };
  }

  return { ok: true, slug, rader: [{ nyckel: `stjarna:${slug}`, varde: VARDE_STJARNA }] };
}

// ── Import-validatorn (engångs + takad — §A.3/§B) ───────────────────────────

/** Import-ruttens body: ENDAST aggregat (GDPR-minimering §A.3). */
export type ImportSkrivning = {
  authId: string;
  xp: unknown;
  stjarnor: unknown;
  klaraKurser: unknown;
  /** YYYY-MM-DD (rutten sätter dagens datum — testbar utan klocka). */
  datum: string;
};

/** Import-resultatet — ok med sanerat aggregat, eller fel + HTTP-status. */
export type ImportValidering =
  | { ok: true; nyckel: string; varde: { xp: number; stjarnor: number; klaraKurser: string[] } }
  | { ok: false; fel: string; status: 400 | 409 };

function somHeltalTakat(v: unknown, tak: number): number | null {
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0) return null;
  return Math.min(Math.floor(v), tak);
}

/**
 * valideraImport — EN gång per authId (importGjord i redan-läget ⇒ 409),
 * XP takat mot teoretiskt max OCH avdraget för vad servern redan registrerat
 * (dubbelräkning om medlemen gjort samma quiz lokalt + i molnet omöjliggörs),
 * stjärnor takat mot kursantalet, klara slug:ar filtrerade mot kursdata och
 * redan-registrerade. Nyckeln import:<authId>:<datum> är deterministisk.
 */
export function valideraImport(
  p: ImportSkrivning,
  kurser: Record<string, Course>,
  redan: MedlemProgress,
): ImportValidering {
  if (redan.importGjord) {
    return { ok: false, fel: "Importen är redan gjord för detta konto.", status: 409 };
  }
  const maxXP = teoretisktMaxXp(kurser);
  const maxStjarnor = teoretisktMaxStjarnor(kurser);
  const xpKlient = somHeltalTakat(p?.xp, maxXP);
  const stjarnorKlient = somHeltalTakat(p?.stjarnor, maxStjarnor);
  if (xpKlient === null || stjarnorKlient === null) {
    return { ok: false, fel: "Importen innehåller ogiltiga värden.", status: 400 };
  }
  if (!Array.isArray(p?.klaraKurser)) {
    return { ok: false, fel: "Importen innehåller ogiltiga värden.", status: 400 };
  }
  const redanKlara = new Set(redan.klaraKurser);
  const klara: string[] = [];
  const sett = new Set<string>();
  for (const s of p.klaraKurser) {
    if (typeof s !== "string") continue;
    const slug = s.trim();
    if (!kurser[slug] || sett.has(slug) || redanKlara.has(slug)) continue;
    sett.add(slug);
    klara.push(slug);
  }
  const xp = Math.max(0, Math.min(xpKlient - redan.xp, maxXP));
  const stjarnor = Math.max(0, Math.min(stjarnorKlient - redan.stjarnor, maxStjarnor));
  return {
    ok: true,
    nyckel: `import:${p.authId}:${p.datum}`,
    varde: { xp, stjarnor, klaraKurser: klara },
  };
}

// ── Läsning: senaste-vinner + aggregat (ren logik) ───────────────────────────

/** En värde-rad såsom PostgREST returnerar den (arrow-select ur details). */
export type ProgressLasRad = {
  nyckel?: string | null;
  /** jsonb->> ger text: "10" eller '{"xp":…}' för import-raden. */
  varde?: string | null;
};

/** Membersprofilen — det lasMedlemProgress returnerar (aggregatet, §B.4). */
export type MedlemProgress = {
  xp: number;
  stjarnor: number;
  klaraKurser: string[];
  /** Kurs-slugs med quiz-rader men ej kursklar, sorterad ("Mina kurser",
   *  portal-våg 103 — härlett ur samma karta, ingen ny läsning). */
  paborjadeKurser: string[];
  /** Antal klarade quiz per slug (progress-mätaren på påbörjade kort). */
  quizRatta: Record<string, number>;
  /** import:<authId>:<datum> finns redan ⇒ engångs-importen är förbrukad. */
  importGjord: boolean;
};

/** Tomma profilvärdet (gäst, fel, byggfas — aldrig null i kontraktet). */
export const TOM_MEDLEM_PROGRESS: MedlemProgress = {
  xp: 0,
  stjarnor: 0,
  klaraKurser: [],
  paborjadeKurser: [],
  quizRatta: {},
  importGjord: false,
};

/**
 * rader (nyest först) → karta nyckel → gällande värde (FÖREKOMST vinner —
 * indata är sorterad nyest-först, exakt variabler/kurs-metadata-mönstret).
 * Ogiltiga rader (saknad nyckel) kan aldrig vinna — tolerant läsning.
 */
export function senasteVinnerProgress(rader: readonly ProgressLasRad[]): Map<string, string> {
  const karta = new Map<string, string>();
  for (const r of rader) {
    if (typeof r?.nyckel !== "string" || r.nyckel === "") continue;
    if (karta.has(r.nyckel)) continue; // senaste raden har redan vunnit
    karta.set(r.nyckel, typeof r.varde === "string" ? r.varde : "");
  }
  return karta;
}

/**
 * aggredereaProgress — karta nyckel → värde ⇒ membersprofilen (REN):
 *   quiz:<slug>:<kap>:<i>   → +10 XP
 *   kursklar:<slug>         → +50 XP + slug i klaraKurser
 *   stjarna:<slug>          → +1 stjärna
 *   import:<authId>:<datum> → värdeobjektets {xp, stjarnor, klaraKurser}
 *     (union med per-nyckel-raderna; importGjord = true)
 * Härlett (våg 103, "Mina kurser"): quiz-räknare per slug → quizRatta;
 * slug med quiz men utan kursklar → paborjadeKurser (importen bär bara
 * klara kurser — den kan aldrig markera en påbörjad kurs, korrekt ärligt).
 * Främmande/okända nycklar ignoreras — de kan aldrig påverka aggregatet.
 */
export function aggredereaProgress(karta: ReadonlyMap<string, string>): MedlemProgress {
  const ut: MedlemProgress = {
    xp: 0,
    stjarnor: 0,
    klaraKurser: [],
    paborjadeKurser: [],
    quizRatta: {},
    importGjord: false,
  };
  const klara = new Set<string>();
  const quizRatta: Record<string, number> = {};
  for (const [nyckel, vardeText] of karta) {
    if (nyckel.startsWith("quiz:")) {
      ut.xp += XP_PER_QUIZ;
      // quiz:<slug>:<kap>:<i> — slug fram till nästa kolon (inga kolon i slug:ar)
      const slug = nyckel.slice("quiz:".length).split(":")[0];
      if (slug !== "") quizRatta[slug] = (quizRatta[slug] ?? 0) + 1;
      continue;
    }
    if (nyckel.startsWith("kursklar:")) {
      ut.xp += XP_KURSKLAR;
      klara.add(nyckel.slice("kursklar:".length));
      continue;
    }
    if (nyckel.startsWith("stjarna:")) {
      ut.stjarnor += VARDE_STJARNA;
      continue;
    }
    if (nyckel.startsWith("import:")) {
      ut.importGjord = true;
      try {
        const v = JSON.parse(vardeText) as { xp?: unknown; stjarnor?: unknown; klaraKurser?: unknown };
        if (typeof v?.xp === "number" && Number.isFinite(v.xp) && v.xp > 0) ut.xp += Math.floor(v.xp);
        if (typeof v?.stjarnor === "number" && Number.isFinite(v.stjarnor) && v.stjarnor > 0) {
          ut.stjarnor += Math.floor(v.stjarnor);
        }
        if (Array.isArray(v?.klaraKurser)) {
          for (const s of v.klaraKurser) if (typeof s === "string" && s !== "") klara.add(s);
        }
      } catch {
        /* ogiltig import-rad ⇒ nyckeln räknas ändå som importGjord-flagga */
      }
    }
  }
  ut.klaraKurser = [...klara].sort();
  ut.quizRatta = quizRatta;
  ut.paborjadeKurser = Object.keys(quizRatta)
    .filter((slug) => !klara.has(slug))
    .sort();
  return ut;
}

// ── PostgREST-plumbing (kurs-metadata-lives mönster — men REQUESTSCOPAT) ────

/** URL-kodat PostgREST-filtervärde — RÅTT, aldrig citerat (lager.ts våg 55). */
function fv(v: string): string {
  return encodeURIComponent(v);
}

/** Senaste-vinner-ordningen — id.desc som tiebreaker (lager.ts våg 67). */
const SENASTE = "order=created_at.desc,id.desc";
const SIDSTORLEK = 1000;
const MAX_Sidor = 10;

/**
 * lasRaderFor — läs EN medlems alla värde-rader (nyest först, Range-paginerat
 * som lasKursOverrides). Kastar ALDRIG; fel/tomt/byggfas ⇒ tom array. Filter
 * details->>authId=eq.<authId> gör läsningen requestskopad per medlem —
 * en annan medlems nycklar kan per konstruktion aldrig läsas in.
 */
async function lasRaderFor(authId: string): Promise<ProgressLasRad[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") return [];
  const rest = getSupabaseRest();
  if (!rest) return [];
  const rader: ProgressLasRad[] = [];
  for (let sida = 0; sida < MAX_Sidor; sida++) {
    const fran = sida * SIDSTORLEK;
    try {
      const url =
        rest.origin +
        "/rest/v1/system_events?type=eq." +
        fv(MEDLEM_PROGRESS_EVENT_TYP) +
        "&details->>authId=eq." +
        fv(authId) +
        "&select=details->>nyckel,details->>varde&" +
        SENASTE;
      const res = await fetch(url, {
        headers: { ...rest.headers, Range: `${fran}-${String(fran + SIDSTORLEK - 1)}` },
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      });
      if (!res.ok) return []; // tyst fall-back — tom profil
      const sidRader = (await res.json()) as ProgressLasRad[];
      if (!Array.isArray(sidRader)) return [];
      rader.push(...sidRader);
      if (sidRader.length < SIDSTORLEK) break;
    } catch {
      return []; // nätverksfel/timeout — tyst fall-back
    }
  }
  return rader;
}

/**
 * lasMedlemProgress — membersprofilen (REQUESTSCOPAD: ingen modul-cache —
 * §B.4 förbjuder global memo mellan medlemmar). Supabase-fel/ej konfigurerat
 * /byggfas ⇒ TOM profil (xp 0, inga klara) — kastar ALDRIG. Server-komponenter
 * och GET /api/medlem/progress läser ENDAST via denna funktion.
 */
export async function lasMedlemProgress(authId: string): Promise<MedlemProgress> {
  if (typeof authId !== "string" || authId === "") return TOM_MEDLEM_PROGRESS;
  return aggredereaProgress(senasteVinnerProgress(await lasRaderFor(authId)));
}

// ── Skrivvägen (organ-event.ts-mönstret — exakt §B.4) ────────────────────────

/** Nätverksfel-namn utan hemligheter ("TimeoutError", "TypeError" …). */
function felnamn(e: unknown): string {
  return e instanceof Error ? e.name : "okänt nätverksfel";
}

/**
 * skrivMedlemProgressEvent — POST {origin}/rest/v1/system_events med rader
 * (type=medlem_progress, severity=info, details={authId, slug, nyckel, varde},
 * source=medlem) i EN begäran (v79-dual-write-mönstret). Byggfas ⇒ false utan
 * nät. Returnerar ALLTID {ok, fel?} — kastar aldrig; rutten mappar direkt
 * till 200/502. P6: inga tokens/lösenord finns i denna väg — raderna bär
 * endast nyckel/värde/aggregat.
 */
export async function skrivMedlemProgressEvent(
  authId: string,
  slug: string | null,
  rader: readonly ProgressRad[],
): Promise<{ ok: boolean; fel?: string }> {
  if (rader.length === 0) return { ok: false, fel: "Inga rader att skriva." };
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return { ok: false, fel: "Skrivning nekas under next build (bygget är nätverks-hermetiskt)." };
  }
  const rest = getSupabaseRest();
  if (!rest) {
    return { ok: false, fel: "Supabase ej konfigurerat (NEXT_PUBLIC_SUPABASE_URL/nyckel saknas i miljön)." };
  }
  try {
    const res = await fetch(rest.origin + "/rest/v1/system_events", {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(
        rader.map((r) => ({
          type: MEDLEM_PROGRESS_EVENT_TYP,
          severity: "info",
          message: "[medlem] " + r.nyckel + " = " + (typeof r.varde === "number" ? String(r.varde) : JSON.stringify(r.varde)),
          details: { authId, slug, nyckel: r.nyckel, varde: r.varde },
          source: MEDLEM_PROGRESS_KALLA,
        })),
      ),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false, fel: "Progressen kunde inte sparas (lagret svarade HTTP " + String(res.status) + ")." };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, fel: "Progressen kunde inte sparas (" + felnamn(e) + ")." };
  }
}

/** Dagens datum som YYYY-MM-DD — import-nyckelns dagdelen (testbar bryta). */
export function datumIdag(): string {
  return new Date().toISOString().slice(0, 10);
}
