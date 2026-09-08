/**
 * SIFFROR LIVE — lasSiffror() räknar kurs-/bok-/quiz-talen ur verkligheten
 * vid render-tid (VÅG 82 DEL B — STYRELSE-VAG82-BYGG.md; design + mätning
 * i STYRELSE-VAG82-KURSCMS.md §3: ~1 ms varm via getCourses()-memot).
 *
 * Räknelogiken SPEGLAR verktyg/rakna-siffror.mjs EXAKT (guldkällan):
 *   kurser     = antal objekt i public/deep-courses.json (getCourses-memot)
 *   bokmaster  = kurser med category === "BOKMASTER"
 *   quiz       = summan av (Array.isArray(ch.quiz) ? ch.quiz.length : 0)
 *                över alla kapitel — kapitel utan array-quiz räknas som 0
 *   quizXp     = quiz × 10 (XP-ekonomin våg 78: 10 XP per quizfråga)
 *   kanonBocker / kanonSomKurs = getBokkanon() (data/bokkanon.json) —
 *                totalen samt böcker med status === "kurs"
 *   fas2Kurser / fas3Kurser   = FAS2_KURSER.size / FAS3_KURSER.size
 *                (importerade Sets — src/lib/kurs-access.ts RÖRS ALDRIG)
 *
 * ALLA åtta fält i Siffror-typen kan räknas live; inget fält levereras
 * partiellt. Källorna sväljer dock sina egna läsfel till tomt
 * (getCourses() ⇒ {}, getBokkanon() ⇒ []) — och "0 kurser"/"0 böcker"
 * är aldrig en sanning på denna sajt, bara ett misslyckat läs. Därför
 * gäller per-fält: källa TOM = fältet tas ur den statiska fallbacken
 * (SIFFROR ur data/siffror.json — rakna-siffror-seed). lasSiffror()
 * KASTAR ALDRIG: oväntat fel i räknesteget ⇒ hela SIFFROR-objektet.
 *
 * NEXT_PHASE-hermetik (variabler-lagring-mönstret, våg 79): under
 * `next build` returneras statiska SIFFROR — byggets prerender blir
 * deterministiskt (identiska tal som i dag, oberoende av fil-timing);
 * ISR-revalidationen (revalidate 3600 på kurssidorna) räknar live i
 * runtime. Ingen nätverksläsning sker här någonsin — endast fs via
 * content.ts-memona, som kurssidorna redan betalar per instans.
 *
 * Server-only till sin natur (16 MB fs-läsning): importeras ALDRIG från
 * klientkomponenter — de behåller statiska SIFFROR + tal() (orörda,
 * 33 konsumerande filer, tsc-baslinjen).
 */
import { getCourses, getBokkanon } from "@/lib/content";
import { FAS2_KURSER, FAS3_KURSER } from "@/lib/kurs-access";
import { SIFFROR, type Siffror } from "@/lib/siffror";

/** Modul-cache 60 s (våg 82-kontraktet) — räkneloop ≈ 1 ms varm, cachen
 *  skyddar mot meningslös omräkning per request i samma instans. */
const CACHE_MS = 60 * 1000;

let memo: { vid: number; vardet: Siffror } | null = null;

/** Räkna alla åtta fält — speglar verktyg/rakna-siffror.mjs rad för rad.
 *  Per-fält-fallback: tom källa ⇒ SIFFROR-fältet (seed), aldrig 0-lögn. */
function raknaSiffror(): Siffror {
  // KÄLLA 1 — kurser: public/deep-courses.json via getCourses()-memot.
  const lista = Object.values(getCourses());
  const kurserLasta = lista.length > 0;

  let quiz = 0;
  let bokmaster = 0;
  if (kurserLasta) {
    for (const k of lista) {
      if (k.category === "BOKMASTER") bokmaster++;
      for (const ch of k.chapters ?? []) {
        const q = (ch as { quiz?: unknown }).quiz;
        if (Array.isArray(q)) quiz += q.length;
      }
    }
  }

  // KÄLLA 2 — bokkanon: data/bokkanon.json via getBokkanon().
  const kanon = getBokkanon();
  const kanonLast = kanon.length > 0;

  // KÄLLA 3 — fas-mängderna: importerade Sets (kurs-access.ts orörd),
  // kompileringskonstanter — .size kan aldrig misslyckas, ingen fallback
  // behövs (och finns inte i seed heller: Sets är sanningen).
  return {
    kurser: kurserLasta ? lista.length : SIFFROR.kurser,
    bokmaster: kurserLasta ? bokmaster : SIFFROR.bokmaster,
    quiz: kurserLasta ? quiz : SIFFROR.quiz,
    // quizXp hålls alltid konsistent med quiz (seed: quizXp = quiz × 10).
    quizXp: kurserLasta ? quiz * 10 : SIFFROR.quizXp,
    kanonBocker: kanonLast ? kanon.length : SIFFROR.kanonBocker,
    kanonSomKurs: kanonLast
      ? kanon.filter((b) => b.status === "kurs").length
      : SIFFROR.kanonSomKurs,
    fas2Kurser: FAS2_KURSER.size,
    fas3Kurser: FAS3_KURSER.size,
  };
}

/**
 * Siffror live — kastar ALDRIG.
 * Kall kostnad: räkneloop ≈ 1 ms ur getCourses()-memot (disk + parse
 * betalas redan av kurssidorna per instans — STYRELSE-VAG82-KURSCMS §3).
 * Fel cachelagras INTE: nästa anrop försöker igen när källan återhämtat
 * sig; först vid nästa lyckad läsning refreshas modul-cachen.
 */
export async function lasSiffror(): Promise<Siffror> {
  // Bygg-hermetik: statiska SIFFROR i prerendern — live räknas först av
  // ISR-revalidationen i runtime.
  if (process.env.NEXT_PHASE === "phase-production-build") return SIFFROR;

  const nu = Date.now();
  if (memo && nu - memo.vid < CACHE_MS) return memo.vardet;

  try {
    const vardet = raknaSiffror();
    memo = { vid: nu, vardet };
    return vardet;
  } catch {
    // ALDRIG kasta: hela statiska SIFFROR (data/siffror.json-seed) gäller.
    return SIFFROR;
  }
}
