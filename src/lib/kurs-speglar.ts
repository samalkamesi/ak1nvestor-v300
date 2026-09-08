/**
 * KURSSPEGLAR — server-side översättningslager för de generiska dynamiska
 * kursspegel-rutterna /en/kurser/[slug] och /ar/kurser/[slug] (våg 52, agent B).
 *
 * KUNDENS DIREKTIV: "skapa ett system som översätter alla delar live... allt
 * sker dynamiskt speciellt när vi har nytt innehåll" — kursspegel-sidorna
 * bygger INGET i förväg (generateStaticParams ⇒ [] + dynamicParams): varje
 * sida genereras on-demand och plockar översättningar ur Supabase-tabellen
 * `oversattningar` i realtid vid render (ISR, revalidate 1 h + taggar).
 *
 * ── KONTRAKT MOT ÖVERSÄTTNINGSLAGRET (src/lib/oversattning/, våg 52 agent A) ──
 *
 * Agent A:s källregister (src/lib/oversattning/kalla.ts, inläst 2026-09-01)
 * definierar källuniversumet — detta lager följer det EXAKT:
 *
 *   scope_typ  = "kursblock"
 *   scope_nyckel = "{slug}:kap{kapitelnummer}:block{blockindex, 1-BASERAT}"
 *                  t.ex. "the-intelligent-investor:kap5:block3"
 *   Enhet      = VARJE block i public/deep-courses.json vars `content` är en
 *                icke-tom sträng (oavsett blocktyp — samma filter som kalla.ts).
 *
 * PROGRESSANDelen (notisen "X % klart" + SEO-tröskeln) räknas ÖVER DET
 * universumet — identiskt med kalla.ts:s enumerate ⇒ andelen speglar
 * pipeline:ens verkliga framsteg och kan nå 100 %.
 *
 * UTÖKADE NYCKLAR (våg 52B, opportunistic): titlar/intros/quiz-frågor omfattas
 * ännu inte av kalla.ts (där är "kurs"-scope reserverat för framtiden). Detta
 * lager hämtar dem ändå OM de finns publicerade under följande nycklar (samma
 * scope_typ "kursblock") — annars svensk originaltext. De räknas INTE i
 * progressandelen. När agent A utökar kalla.ts hit är detta de överenskomna
 * nycklarna (justera i EN punkt: nyckel-funktionerna nedan):
 *
 *   {slug}:titel / {slug}:learn / {slug}:varfor
 *   {slug}:perspektiv:lynch|graham|ak1
 *   {slug}:kap{n}:titel / {slug}:kap{n}:intro
 *   {slug}:kap{n}:quiz{q}              (frågan, 0-baserat)
 *   {slug}:kap{n}:quiz{q}:alt{j}       (alternativ j)
 *   {slug}:kap{n}:quiz{q}:tips
 *
 * VÅG 80b DEL A: kursens EGEN titel — "{slug}:titel" — är nu en FULLVÄRDIG
 * källa i kalla.ts (333 källor, importpaket v80titel{1,2}.json). Spegel-
 * sidans H1 läser den via byggKursSpegel och spegel-LISTSIDORNA via
 * hamtaKursTitelLager (sammalager för alla slugs i en läsning) — båda med
 * fallback till svensk kurs.title. Övriga utökade nycklar (learn/varfor/
 * perspektiv) är fortfarande opportunistiska.
 *
 * FAKTISKT SCHEMA (agent A:s data/sql/oversattningar.sql, inläst 2026-09-01 —
 * källtabellen är skapad av agent A och detta lader läser den):
 *
 *   oversattningar(scope_typ, scope_nyckel, sprak, kallhash, text, status,
 *                  kvalitet, kontrollrapport, uppdaterad)
 *   UNIQUE (scope_typ, scope_nyckel, sprak); status 'publicerad' = 100 poäng,
 *   alla 4 kontroller gröna. RLS: endast publicerade rader är anon-läsbara.
 *
 * Kolumnmatchning: detta lagers PRIMÄRA kolumnalias är exakt agent A:s —
 * sprak / scope_nyckel / text / status — så primary-frågan
 * (`scope_nyckel=like.{slug}:*&status=eq.publicerad&select=*`) träffar rakt.
 *
 * TOLERANT AVLÄSNING: raderna tolkas liberalt (kolumnaliasen sprak/mal_sprak/
 * lang/locale samt text/innehall/oversattning/oversatt_text/varde/content
 * accepteras), så framtida justeringar i agent A:s schema bryter inte
 * speglarna — justera i EN punkt: lasKolumn/arPublicerad nedan.
 *
 * FALLBACK-ORDNING (per block): publicerad översättning → svensk originaltext.
 * Ingen block-nivå-markering; i stället EN notis överst på sidan med
 * översättningsandel. Quiz-rätt-index och all logik är oöversatt struktur —
 * ENDAST strängar byts.
 *
 * SEO-BESLUT: spegeln robots-noindex:ad + canonical mot svenska originalet
 * tills publicerad-andelen ≥ 80 % (INDEX_TRASKEL) — halvfärdiga sidor ska inte
 * skada SEO:n. Vid ≥ 80 %: egen canonical + fullt hreflang-kluster.
 */

import { cache } from "react";
import type { Metadata } from "next";
import type { Course, CourseChapter } from "@/lib/content";
import { ORDLISTA, type OrdlistaNyckel, type SprakRad } from "@/lib/ordlista";
import { getSupabaseRest } from "@/lib/supabase-rest";
import { lasPubliceradeForSpegel, lasPubliceradeKursTitlar } from "@/lib/oversattning/lager";
import { SPEGEL_SITE_URL, SPEGEL_SITE_NAME } from "@/lib/spegel-metadata";

// ── Konvention: nyckelbyggare ────────────────────────────────────────────────

export type KursSpegelSprak = "en" | "ar";

export function nyckelKurs(
  del: "titel" | "learn" | "varfor" | "perspektiv:lynch" | "perspektiv:graham" | "perspektiv:ak1",
  slug: string
): string {
  return `${slug}:${del}`;
}
export function nyckelKapitel(slug: string, kapitelNum: number, del: "titel" | "intro"): string {
  return `${slug}:kap${kapitelNum}:${del}`;
}
/** Blocknyckel — blockIndex är arrayindex (0-baserat); lagret är 1-baserat
 *  exakt som kalla.ts ("...:block<blockindex, 1-baserat>"). */
export function nyckelBlock(slug: string, kapitelNum: number, blockIndex: number): string {
  return `${slug}:kap${kapitelNum}:block${blockIndex + 1}`;
}
export function nyckelQuiz(slug: string, kapitelNum: number, quizIndex: number, del: "" | `alt${number}` | "tips"): string {
  return `${slug}:kap${kapitelNum}:quiz${quizIndex}${del ? `:${del}` : ""}`;
}

// ── Hämtning: Supabase PostgREST → Map<nyckel, text> per språk ───────────────

/** Tolerant kolumnavläsning — se kontraktet i filhuvudet. */
function lasKolumn(rad: Record<string, unknown>, kandidater: string[]): string | null {
  for (const k of kandidater) {
    const v = rad[k];
    if (typeof v === "string" && v.trim().length > 0) return v;
  }
  return null;
}

function arPublicerad(rad: Record<string, unknown>): boolean {
  // status saknas helt ⇒ antag publicerad (pipeline utan statuskolumn);
  // finns status ⇒ kräv "publicerad".
  const status = lasKolumn(rad, ["status", "status_varde", "publicerad_status"]);
  if (status === null) return true;
  return status.trim().toLowerCase() === "publicerad";
}

/** Alla publicerade kursöversättningar för en slug: Map<nyckel, Map<sprak, text>>. */
export const hamtaKursOversattningar = cache(
  async (slug: string): Promise<Map<string, Map<string, string>>> => {
    const tomt = new Map<string, Map<string, string>>();
    const rest = getSupabaseRest();
    if (!rest) return tomt; // ingen env ⇒ svensk fallback, 0 %

    const franRader = (rader: unknown): Map<string, Map<string, string>> => {
      const lager = new Map<string, Map<string, string>>();
      if (!Array.isArray(rader)) return lager;
      for (const r of rader) {
        if (!r || typeof r !== "object") continue;
        const rad = r as Record<string, unknown>;
        if (!arPublicerad(rad)) continue;
        const sprak = lasKolumn(rad, ["sprak", "mal_sprak", "lang", "locale", "target_lang", "sprak_kod"]);
        const nyckel = lasKolumn(rad, ["scope_nyckel", "nyckel"]);
        const text = lasKolumn(rad, ["text", "innehall", "oversattning", "oversatt_text", "varde", "content"]);
        if (!sprak || !nyckel || !text) continue;
        if (!nyckel.startsWith(`${slug}:`)) continue; // säkerhetsnät mot like-falska träffar
        const perSprak = lager.get(nyckel) ?? new Map<string, string>();
        perSprak.set(sprak, text);
        lager.set(nyckel, perSprak);
      }
      return lager;
    };

    // Försök 1: serverfiltrerad på status; Försök 2: utan statusfilter (tolerant
    // mot annan kolumnnamngivning) med lokal filtrering. Fel ⇒ tomt ⇒ fallback.
    for (const sokvag of [
      `/rest/v1/oversattningar?scope_nyckel=like.${encodeURIComponent(`${slug}:*`)}&status=eq.publicerad&select=*&limit=10000`,
      `/rest/v1/oversattningar?scope_nyckel=like.${encodeURIComponent(`${slug}:*`)}&select=*&limit=10000`,
    ]) {
      try {
        const svar = await fetch(`${rest.origin}${sokvag}`, {
          headers: { apikey: rest.headers.apikey, Authorization: rest.headers.Authorization },
          signal: AbortSignal.timeout(6000),
          // ISR-vänligt: byggs/on-demand-genereras med cache; publischar kan
          // revalidateTag("oversattningar") / revalidateTag(`oversattningar:${slug}`).
          next: { revalidate: 3600, tags: ["oversattningar", `oversattningar:${slug}`] },
        });
        if (!svar.ok) continue; // troligen tabellen/kolumnen ej skapad ännu
        const lager = franRader(await svar.json());
        if (lager.size > 0) return lager;
      } catch {
        /* nästa försök / tomt */
      }
    }

    // Försök 3 (våg 55 agent L1): MÖS-lagrets system_events-backend. Tabellen
    // oversattningar finns inte ännu (kunden har inte kört SQL:en) — lagret
    // sparar översättningar som type=oversattning-event i BEFINTLIGA
    // system_events och läser dem med senaste-vinner-dedupe (en äldre
    // publicerad rad servas aldrig när den senaste för nyckeln har annan
    // status). Detta lagers API mot spegelsidorna är oförändrat — bara
    // backend-internt har en tredje läsning lagts till.
    try {
      const urEvents = await lasPubliceradeForSpegel(slug);
      if (urEvents.size > 0) return urEvents;
    } catch {
      /* tomt ⇒ svensk fallback, 0 % */
    }
    return tomt;
  }
);

/** Lager för EN kurs + EN språk: nyckel → publicerad text. */
export async function hamtaKursLager(slug: string, sprak: KursSpegelSprak): Promise<Map<string, string>> {
  const alla = await hamtaKursOversattningar(slug);
  const lager = new Map<string, string>();
  for (const [nyckel, perSprak] of alla) {
    const text = perSprak.get(sprak);
    if (text) lager.set(nyckel, text);
  }
  return lager;
}

// ── VÅG 80b DEL A: kurstitlar till spegel-LISTSIDORNA — sammalager ──────────

/**
 * Sammalager för kurs-TITLAR (våg 80b del A): alla publicerade översättningar
 * av kursens egen titel (nyckel "{slug}:titel" — källa i kalla.ts sedan våg
 * 80b, konsumerad av kurs-spegel-sidans H1 sedan våg 52 via nyckelKurs) för
 * ALLA kurser i EN läsning. /en/kurser + /ar/kurser renderar 333 kort och
 * kan inte läsa per slug (hamtaKursOversattningar × 333 = hundratals
 * rundor). Map<"{slug}:titel", Map<sprak, text>>.
 *
 * Samma fallback-kedja som spegelläsningen: tabell-backend först (like-
 * mönstret "*:titel" träffar även kapiteltitlar — de filtreras bort här i
 * koden mot EXAKT "{slug}:titel"), därefter MÖS-lagrets system_events-
 * backend (lasPubliceradeKursTitlar — senaste-vinner-dedupe). Fel/inget
 * lagrat ⇒ tomt ⇒ svensk fallback i listvyn (titelUrLager).
 */
export const hamtaKursTitelLager = cache(
  async (): Promise<Map<string, Map<string, string>>> => {
    const tomt = new Map<string, Map<string, string>>();
    const rest = getSupabaseRest();
    if (!rest) return tomt; // ingen env ⇒ svensk fallback

    const franRader = (rader: unknown): Map<string, Map<string, string>> => {
      const lager = new Map<string, Map<string, string>>();
      if (!Array.isArray(rader)) return lager;
      for (const r of rader) {
        if (!r || typeof r !== "object") continue;
        const rad = r as Record<string, unknown>;
        if (!arPublicerad(rad)) continue;
        const sprak = lasKolumn(rad, ["sprak", "mal_sprak", "lang", "locale", "target_lang", "sprak_kod"]);
        const nyckel = lasKolumn(rad, ["scope_nyckel", "nyckel"]);
        const text = lasKolumn(rad, ["text", "innehall", "oversattning", "oversatt_text", "varde", "content"]);
        if (!sprak || !nyckel || !text) continue;
        if (!/^[^:]+:titel$/.test(nyckel)) continue; // ENDAST kursens egen titel — kapiteltitlar sorteras bort
        const perSprak = lager.get(nyckel) ?? new Map<string, string>();
        perSprak.set(sprak, text);
        lager.set(nyckel, perSprak);
      }
      return lager;
    };

    for (const sokvag of [
      `/rest/v1/oversattningar?scope_nyckel=like.${encodeURIComponent("*:titel")}&status=eq.publicerad&select=*&limit=10000`,
      `/rest/v1/oversattningar?scope_nyckel=like.${encodeURIComponent("*:titel")}&select=*&limit=10000`,
    ]) {
      try {
        const svar = await fetch(`${rest.origin}${sokvag}`, {
          headers: { apikey: rest.headers.apikey, Authorization: rest.headers.Authorization },
          signal: AbortSignal.timeout(6000),
          next: { revalidate: 3600, tags: ["oversattningar"] },
        });
        if (!svar.ok) continue; // troligen tabellen/kolumnen ej skapad ännu
        const lager = franRader(await svar.json());
        if (lager.size > 0) return lager;
      } catch {
        /* nästa försök / tomt */
      }
    }

    // Försök 3: MÖS-lagrets system_events-backend (samma som speglarna).
    try {
      const urEvents = await lasPubliceradeKursTitlar();
      if (urEvents.size > 0) return urEvents;
    } catch {
      /* tomt ⇒ svensk fallback */
    }
    return tomt;
  }
);

/** Korttiteln ur titel-sammalagret med fallback till svensk kurs.title. */
export function titelUrLager(
  lager: Map<string, Map<string, string>>,
  slug: string,
  svensk: string,
  sprak: KursSpegelSprak,
): string {
  const text = lager.get(nyckelKurs("titel", slug))?.get(sprak);
  return typeof text === "string" && text.trim().length > 0 ? text : svensk;
}

// ── VÅG 82 D: kategorietiketter på speglarna ────────────────────────────────
//
// Kategorin är en fri sträng ur public/deep-courses.json (27 unika, versala).
// Översättningarna bor som kategori.*-rader i ordlistan; nyckeln härleds ur
// datavärdet med en deterministisk normalisering (nedan). ENDAST speglarna
// konsumerar detta: svenska /kurser visar kategorin rå (datavärdet) som förr.

/**
 * Normalisera en rå kategoristräng till ordlistans nyckelstämma: versalisera →
 * Å/Ä→A, Ö→O, É→E → övriga tecken utanför A–Z/0–9 stryks → gemener.
 * Exempel: "BOKFÖRING & ÅRSREDOVISNING" → "bokforingarsredovisning".
 * Medvetet tecken-för-tecken: ALDRIG \w i regex mot svensk text (åäö faller
 * utanför \w och skulle strykas osanerat).
 */
export function kategoriNyckel(kategori: string): string {
  let ut = "";
  for (const tecken of kategori.toUpperCase()) {
    if (tecken === "Å" || tecken === "Ä") ut += "A";
    else if (tecken === "Ö") ut += "O";
    else if (tecken === "É") ut += "E";
    else if ((tecken >= "A" && tecken <= "Z") || (tecken >= "0" && tecken <= "9")) ut += tecken;
  }
  return ut.toLowerCase();
}

/**
 * Kategorietikett på spegelspråket: rått datavärde → ordlistans
 * kategori.<nyckel>-rad om den finns, annars originalet oförändrat (okända
 * framtida kategorier läcker aldrig — samma fallback-form som titelUrLager;
 * sv-raden i ordlistan ÄR datavärdet ordagrant). Varumärkeskategorier
 * (BOKMASTER) är identiska på alla tre språken — se ordlistans VÅG 82 D-not.
 */
export function kategoriEtikett(kategori: string, sprak: KursSpegelSprak): string {
  const nyckel = ("kategori." + kategoriNyckel(kategori)) as OrdlistaNyckel;
  const rad: SprakRad | undefined = ORDLISTA[nyckel];
  return rad ? rad[sprak] || rad.sv : kategori;
}

// ── Tillämpning: svensk kurs + lager → speglad kurs + andel ──────────────────

export type KursSpegel = {
  /** Kurskopia där alla översättningsbara strängar bytts mot publicerade
   *  översättningar — svensk originaltext där sådan saknas. */
  kurs: Course;
  /** Publicerad andel av källuniversumet (blockinnehåll, kalla.ts-paritet),
   *  0–100. Titel/intro/quiz-rader räknas inte — de är utökade nycklar. */
  procent: number;
  publicerade: number;
  totala: number;
  /** true när ALLA blockinnehåll är publicerade (notis döljs). */
  komplett: boolean;
  /** true när andelen nått SEO-tröskeln (indexerbar). */
  indexerbar: boolean;
};

/** Metadata-SEO-tröskel: spegeln indexeras först vid ≥ 80 % publicerat. */
export const INDEX_TRASKEL = 80;

/**
 * Bygg kursspegeln: räkna blockenheter ur kursstrukturen (samma filter som
 * kalla.ts: content är icke-tom sträng), plocka publicerade översättningar ur
 * lagret, fallback till svensk originaltext. Titlar/intros/quiz/perspektiv
 * tillämpas opportunistiskt via de utökade nycklarna. ratt-index i quiz är
 * struktur och rörs ALDRIG.
 */
export function byggKursSpegel(kurs: Course, lager: Map<string, string>): KursSpegel {
  let publicerade = 0;
  let totala = 0;
  // Blockenheter: räknas (källa.ts-paritet — progressandelen).
  const taBlock = (nyckel: string, svensk: string): string => {
    totala += 1;
    const text = lager.get(nyckel);
    if (typeof text === "string" && text.trim().length > 0) {
      publicerade += 1;
      return text;
    }
    return svensk;
  };
  // Utökade enheter: tillämpas om de finns, räknas EJ.
  const taUtokad = (nyckel: string, svensk: string): string => {
    const text = lager.get(nyckel);
    if (typeof text === "string" && text.trim().length > 0) return text;
    return svensk;
  };

  const speglad: Course = {
    ...kurs,
    title: taUtokad(nyckelKurs("titel", kurs.slug), kurs.title),
    learn: taUtokad(nyckelKurs("learn", kurs.slug), kurs.learn ?? ""),
    why: kurs.why ? taUtokad(nyckelKurs("varfor", kurs.slug), kurs.why) : kurs.why,
    lynchSection: kurs.lynchSection ? taUtokad(nyckelKurs("perspektiv:lynch", kurs.slug), kurs.lynchSection) : kurs.lynchSection,
    grahamSection: kurs.grahamSection ? taUtokad(nyckelKurs("perspektiv:graham", kurs.slug), kurs.grahamSection) : kurs.grahamSection,
    ak1Section: kurs.ak1Section ? taUtokad(nyckelKurs("perspektiv:ak1", kurs.slug), kurs.ak1Section) : kurs.ak1Section,
    chapters: kurs.chapters.map((ch) => speglaKapitel(kurs.slug, ch, taBlock, taUtokad)),
  };

  const procent = totala === 0 ? 100 : Math.round((publicerade / totala) * 100);
  return {
    kurs: speglad,
    procent,
    publicerade,
    totala,
    komplett: publicerade >= totala,
    indexerbar: procent >= INDEX_TRASKEL,
  };
}

function speglaKapitel(
  slug: string,
  ch: CourseChapter,
  taBlock: (nyckel: string, svensk: string) => string,
  taUtokad: (nyckel: string, svensk: string) => string
): CourseChapter {
  // Samma universum som kalla.ts: varje block med icke-tom string-content är
  // en enhet (även tabell/tidslinje-JSON och visuell-id — de renderas ej av
  // KursSteg idag, men andelen ska matcha pipeline:ens källa exakt).
  //
  // VÅG 62 (kvalitetsgranskningens fynd): visuell-blockets content är en
  // DIAGRAMTYP SNYCKEL ("skala"|"cykel"|"donut"|"bro"|"radar"|…), inte prosa —
  // KursSteg renderar <VisuellBlock typ={content}/> och en översatt nyckel
  // ("الرادار", "الحلقة") faller i "saknar renderer"-fallet och diagrammet
  // försvinner tyst ur spegeln. Därför: enheten RÄKNAS i progressandelen
  // (kalla.ts-paritet — taBlock anropas), men nyckeln ÖVERSÄTTS ALDRIG.
  const blocks = (ch.blocks ?? []).map((b, i) => {
    if (typeof b.content !== "string" || b.content.length === 0) return b;
    const oversatt = taBlock(nyckelBlock(slug, ch.num, i), b.content);
    if (b.type === "visuell") return { ...b };
    return { ...b, content: oversatt };
  });
  const quiz = Array.isArray((ch as { quiz?: unknown }).quiz)
    ? (ch as unknown as { quiz: Array<{ q: string; alternativ: string[]; ratt: number; tips?: string }> }).quiz.map(
        (f, qi) => {
          const q = taUtokad(nyckelQuiz(slug, ch.num, qi, ""), f.q);
          const alternativ = f.alternativ.map((alt, j) =>
            taUtokad(nyckelQuiz(slug, ch.num, qi, `alt${j}` as `alt${number}`), alt)
          );
          const tips = f.tips ? taUtokad(nyckelQuiz(slug, ch.num, qi, "tips"), f.tips) : undefined;
          return { q, alternativ, ratt: f.ratt, ...(tips ? { tips } : {}) };
        }
      )
    : undefined;
  return {
    ...ch,
    title: taUtokad(nyckelKapitel(slug, ch.num, "titel"), ch.title),
    intro: ch.intro ? taUtokad(nyckelKapitel(slug, ch.num, "intro"), ch.intro) : ch.intro,
    blocks,
    ...(quiz ? { quiz } : {}),
  };
}

// ── Metadata: per språk, hreflang mot originalet, noindex under tröskeln ─────

/**
 * Metadata för kursspegeln. Under INDEX_TRASKEL % publicerat:
 *   robots noindex,follow + canonical → SVENSKA originalet (duktig duplikat-
 *   signal: halvfärdiga speglar konkurrerar aldrig med originalet i söket).
 * Vid ≥ tröskeln: egen canonical + fullt hreflang-kluster (sv-SE/en/ar/
 * x-default→sv) — samma mönster som spegelMetadata() för nyckelsidorna.
 */
export function kursSpegelMetadata(opts: {
  lang: KursSpegelSprak;
  spegel: KursSpegel;
}): Metadata {
  const { lang, spegel } = opts;
  const kurs = spegel.kurs;
  const slug = kurs.slug;
  const svUrl = `${SPEGEL_SITE_URL}/kurser/${slug}`;
  const egenUrl = `${SPEGEL_SITE_URL}/${lang}/kurser/${slug}`;
  const index = spegel.indexerbar;

  const titel =
    lang === "en"
      ? `${kurs.title} — AKM1 course | ${SPEGEL_SITE_NAME}`
      : `${kurs.title} — دورة AKM1 | ${SPEGEL_SITE_NAME}`;
  const beskrivning =
    lang === "en"
      ? clamp(
          `${kurs.learn} Course ${slug.toUpperCase()} in AKM1: ${kurs.chapters.length} chapters, ${kurs.level.toLowerCase()} level. Free educational stock-analysis course by AK1A Research Lab.`,
          300
        )
      : clamp(
          `${kurs.learn} دورة ${slug.toUpperCase()} في منهجية AKM1: ${kurs.chapters.length} فصول، مستوى ${kurs.level}. دورة تعليمية مجانية في تحليل الأسهم من AK1A Research Lab.`,
          300
        );

  return {
    title: titel,
    description: beskrivning,
    keywords: ["AKM1", kurs.title, lang === "en" ? "stock analysis course" : "دورة تحليل الأسهم", kurs.category],
    alternates: index
      ? {
          canonical: egenUrl,
          languages: {
            "sv-SE": svUrl,
            en: `${SPEGEL_SITE_URL}/en/kurser/${slug}`,
            ar: `${SPEGEL_SITE_URL}/ar/kurser/${slug}`,
            "x-default": svUrl,
          },
        }
      : {
          // Under tröskeln: canonical MOT ORIGINALET — hreflang-klustret är
          // avsiktligt ute (vi annonserar inte halvfärdiga speglar till robotar).
          canonical: svUrl,
        },
    robots: {
      index,
      follow: true,
      googleBot: {
        index,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: titel,
      description: beskrivning,
      url: egenUrl,
      siteName: SPEGEL_SITE_NAME,
      type: "website",
      locale: lang === "ar" ? "ar_AR" : "en_US",
      alternateLocale: ["sv_SE"],
    },
    twitter: { card: "summary_large_image", title: titel, description: beskrivning },
  };
}

function clamp(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** Kurs-JSON-LD på målspråk (spegel till courseJsonLd i seo.tsx). */
export function kursSpegelJsonLd(spegel: KursSpegel, lang: KursSpegelSprak) {
  const kurs = spegel.kurs;
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${kurs.title} — AKM1 ${kurs.slug.toUpperCase()}`,
    description: kurs.learn || kurs.summary,
    inLanguage: lang === "ar" ? "ar" : "en",
    timeRequired: `PT${kurs.totalMinutes || kurs.minutes || 30}M`,
    provider: {
      "@type": "EducationalOrganization",
      name: SPEGEL_SITE_NAME,
      url: SPEGEL_SITE_URL,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `PT${kurs.totalMinutes || 30}M`,
    },
  };
}
