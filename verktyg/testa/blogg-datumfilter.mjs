/**
 * S2-test — bloggens publiceringsdatumfilter (SÄLJ-KARTA A2, data/forskning/
 * SALJ-U6-S2-DATUMFILTER.md). Kör den RIKTIGA modulen src/lib/content.ts
 * (ingen logikkopia) mot riktiga data/blogg/*.json + kartans kända exempel.
 *
 * Körning (från reporoten): node --experimental-strip-types verktyg/testa/blogg-datumfilter.mjs
 * Kräver Node ≥ 22.6 (type stripping); röra INGET i node_modules.
 */
import {
  getBlogPosts,
  getBlogPost,
  bloggArPublicerad,
  bloggDagensDatum,
} from "../../src/lib/content.ts";

// Kartans bevisade framtidsexempel (data/blogg, läst 2026-09-29).
const KARTA_FRAMTIDA = {
  slug: "sa-laser-du-holm-q3-2026",
  publishedAt: "2026-10-21",
};

let misslyckade = 0;
const koll = (namn, sant) => {
  if (sant) {
    console.log(`PASS  ${namn}`);
  } else {
    misslyckade += 1;
    console.error(`FAIL  ${namn}`);
  }
};

// 1. Dagens datum: ISO-form + svensk tidszon (sv-SE kortform = YYYY-MM-DD).
const idag = bloggDagensDatum();
koll(`dagens datum är ISO YYYY-MM-DD ("${idag}")`, /^\d{4}-\d{2}-\d{2}$/.test(idag));

// 2. Kartans framtids-exempel, riktigt inlägg ur data/blogg.
const holm = getBlogPosts({ inkluderaFramtida: true }).find(
  (p) => p.slug === KARTA_FRAMTIDA.slug,
);
koll(`kartans ex finns på disken (${KARTA_FRAMTIDA.slug} ${holm?.publishedAt})`, holm?.publishedAt === KARTA_FRAMTIDA.publishedAt);
koll("framtids-exempel är INTE publicerat idag", !bloggArPublicerad(holm));
koll(`framtids-exempel dolt även exakt dagen innan (${KARTA_FRAMTIDA.publishedAt} > "2026-10-20")`, !bloggArPublicerad(holm, "2026-10-20"));
koll(`framtids-exempel live på sin publiceringsdag ("${KARTA_FRAMTIDA.publishedAt}" <= samma dag)`, bloggArPublicerad(holm, KARTA_FRAMTIDA.publishedAt));

// 3. Dag-granularitet: dagens datum är inclusive ("publicerad idag" syns).
koll(`dagens datum (${idag}) räknas som publicerat samma dag`, bloggArPublicerad({ ...holm, publishedAt: idag }, idag));

// 4. Fail-closed: ogiltigt datumformat döljs (med larm), kastar aldrig.
koll("ogiltigt datum (\"13/10-2026\") döljs utan kast", bloggArPublicerad({ ...holm, publishedAt: "13/10-2026" }, idag) === false);
koll("ogiltigt datum (\"\") döljs utan kast", bloggArPublicerad({ ...holm, publishedAt: "" }, idag) === false);

// 5. Publikt lager: framtidsdiskade borta; inkluderaFramtida behåller dem.
const publika = getBlogPosts();
const alla = getBlogPosts({ inkluderaFramtida: true });
const framtidaSlugs = alla.filter((p) => !bloggArPublicerad(p)).map((p) => p.slug);
koll(
  `publika listan (${publika.length}) = alla (${alla.length}) − framtida (${framtidaSlugs.length})`,
  publika.length === alla.length - framtidaSlugs.length,
);
koll(
  `inget framtidsdiskat slug läcker i publika listan [${framtidaSlugs.join(", ")}]`,
  framtidaSlugs.every((s) => !publika.some((p) => p.slug === s)),
);
koll("alla datum i publika listan ≤ idag", publika.every((p) => p.publishedAt.slice(0, 10) <= idag));

// 6. Detaljsidans källa: framtidsdiskat ⇒ null (⇒ notFound() på rutten).
koll(`getBlogPost(framtidsexempel) ⇒ null`, getBlogPost(KARTA_FRAMTIDA.slug) === null);
const publiceradSlug = publika[0]?.slug;
koll(`getBlogPost(publicerat "${publiceradSlug}") ⇒ inlägg`, typeof getBlogPost(publiceradSlug) === "object" && getBlogPost(publiceradSlug) !== null);

console.log(`\nFramtidsdiskade (bortfiltrerade idag ${idag}): ${framtidaSlugs.join(", ")}`);
if (misslyckade > 0) {
  console.error(`\n${misslyckade} MISSLYCKADE kontroller — S2-filtret är INTE grönt.`);
  process.exit(1);
}
console.log("\nALLA PASS — S2-datumfiltret grönt.");
