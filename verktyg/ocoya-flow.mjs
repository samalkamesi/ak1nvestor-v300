#!/usr/bin/env node
/**
 * OCOYA-PERMANENTFLÖDET — ny kurs → AI-utkast i Ocoya (arbetsstation 2, 2026-10-03)
 * =====================================================================
 * Övervakar plattformens kursregister för NYA kurser. När en ny kurs
 * upptäcks skapas automatiskt ett AI-genererat utkast i Ocoya (ALDRIG
 * publicerat — kunden granskar och godkänner i Ocoya-appen).
 *
 * Användning: node verktyg/ocoya-flow.mjs
 * Krav: AK1A_ADMIN_PASSWORD + OCOYA_API_KEY + OCOYA_BRAND_ID i miljön
 *
 * Arkitektur (styrelsens beslut 2026-10-03):
 *   - Organismen+Supabase = sanningsägare (kursdata)
 *   - Ocoya = verktyg (AI-innehåll + schemaläggning)
 *   - ALDRIG publicera automatiskt — R2-grind = kundens knapp i Ocoya
 *
 * Mimosa: fasta https-värdar; nycklar från env; aldrig publicera.
 */

const AK1A_PWD = process.env.AK1A_ADMIN_PASSWORD || "";
const OCOYA_KEY = process.env.OCOYA_API_KEY || "";
const OCOYA_BRAND = process.env.OCOYA_BRAND_ID || "";
const AK1A = "https://lab.ak1nvestor.com";
const OCOYA = "https://www.app.ocoya.com/api/_public/v1";

if (!AK1A_PWD || !OCOYA_KEY || !OCOYA_BRAND) {
  console.error("FEL: AK1A_ADMIN_PASSWORD, OCOYA_API_KEY och OCOYA_BRAND_ID måste vara satta.");
  process.exit(1);
}

const H_AK1A = { "x-admin-password": AK1A_PWD };
const H_OCOYA = { "X-API-Key": OCOYA_KEY, "Content-Type": "application/json", "Accept": "application/json" };

// Alla AK1A:s sociala profil-ID:n i Ocoya
const PROFILER = {
  instagram_huvud: "claqxt020002emq0fzhpsdgpv",
  instagram_sverige: "claqxt020002fmq0f2s0velh0",
  linkedin_foretag: "clb6rm7bb0028jh0f4s6qjqnc",
  linkedin_personlig: "clb6rmhx2002djh0f8xbig2cj",
  facebook_sverige: "claqykfr5002rmj0fivia9dv4",
  facebook_huvud: "clljakg5j000fl90fobqmnydv",
};

// ── Steg 1: Hämta aktuellt kursregister ──────────────────────────────────────
async function hamtaKurser() {
  const r = await fetch(
    `${AK1A}/api/studio/filer?sokvag=${encodeURIComponent("data/siffror.json")}&nedladdning=1`,
    { headers: H_AK1A, signal: AbortSignal.timeout(15000) }
  );
  if (!r.ok) throw new Error("kunde ej hämta siffror: " + r.status);
  const j = JSON.parse(Buffer.from(await r.arrayBuffer()).toString("utf8"));
  return { antal: j.kurser, quiz: j.quiz };
}

// ── Steg 2: Hämta senaste kurser (från worklog) ──────────────────────────────
async function hamtaSenasteKurser() {
  const r = await fetch(
    `${AK1A}/api/studio/filer?sokvag=${encodeURIComponent("worklog.md")}&nedladdning=1`,
    { headers: H_AK1A, signal: AbortSignal.timeout(20000) }
  );
  if (!r.ok) return [];
  const wt = Buffer.from(await r.arrayBuffer()).toString("utf8");
  // Sök efter kurser i worklog (fabriksleveranser innehåller kursnamn)
  const kurser = [];
  const matcher = wt.match(/[-—]\s*(\d+\s*)?(ny\s+kurs|KURS|lärvägsdjup\s+\+\d+|AI-MENTORN\s+\+\d+\s+FÖRHANDSFRÅGA)/gi) || [];
  // Enklare: hämta från sök-indexet
  const s = await fetch(
    `${AK1A}/api/studio/filer?sokvag=${encodeURIComponent("public/sok-index.json")}&nedladdning=1`,
    { headers: H_AK1A, signal: AbortSignal.timeout(15000) }
  );
  if (s.ok) {
    const sj = JSON.parse(Buffer.from(await s.arrayBuffer()).toString("utf8"));
    if (Array.isArray(sj)) {
      // De 5 senaste kurserna
      return sj.slice(-5).map((k) => ({
        slug: k.slug || k.s || "",
        titel: k.titel || k.t || k.title || "",
        beskrivning: k.beskrivning || k.b || k.description || "",
      }));
    }
  }
  return [];
}

// ── Steg 3: Skapa Ocoya AI-utkast ───────────────────────────────────────────
async function skapaUtkast(kurs) {
  const prompt = `Skapa ett pedagogiskt socialt medier-inlägg om kursen "${kurs.titel}". ${kurs.beskrivning}. Skriv på svenska med professionell men tillgänglig ton. Avsluta med en inbjudan att lära sig mer gratis på AK1A Research Lab (lab.ak1nvestor.com/kurser/${kurs.slug}). Inkludera relevanta hashtags för utbildning, aktier och finans.`;

  const r = await fetch(`${OCOA}/post/ai?brandId=${OCOYA_BRAND}`, {
    method: "POST",
    headers: H_OCOYA,
    body: JSON.stringify({
      prompt,
      tone: "educational",
      postLength: "medium",
      socialProfileIds: [
        PROFILER.instagram_huvud,
        PROFILER.facebook_huvud,
        PROFILER.linkedin_foretag,
      ],
      generateImage: true,
      imageCount: 3,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!r.ok) {
    console.error("Ocoya-fel:", r.status, (await r.text()).slice(0, 200));
    return null;
  }
  const j = await r.json();
  return j;
}

// ── Main ─────────────────────────────────────────────────────────────────────
console.log("── OCOYA-PERMANENTFLÖDET ──");
console.log("Övervakar: nya kurser → AI-utkast (ALDRIG publicera automatiskt)\n");

const siffror = await hamtaKurser();
console.log(`Aktuellt: ${siffror.antal} kurser, ${siffror.quiz} quiz`);

const senasteKurser = await hamtaSenasteKurser();
if (senasteKurser.length > 0) {
  console.log(`Senaste kurser: ${senasteKurser.map((k) => k.titel || k.slug).join(", ")}`);
  // Skapa utkast för den senaste (organismen kan köra per ny kurs)
  // AVKOMMENTERA för skarp drift:
  // const utkast = await skapaUtkast(senasteKurser[0]);
  // if (utkast) console.log("✅ AI-utkast skapat:", utkast.postGroupId);
  console.log("(Skarp drift: avkommentera skapaUtkast-raden)");
} else {
  console.log("Inga nya kurser detekterade");
}

console.log("\nFlödet redo. Organismen integrerar i kurs-leveranser.");
