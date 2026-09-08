#!/usr/bin/env node
/**
 * AK1A — Testsvit för KURS-METADATA-LIVE (src/lib/kurs-metadata-live.ts,
 * VÅG 82 / ADMIN-MEGA steg 4 — STYRELSE-VAG82-BYGG.md §A1).
 *
 * REN LOGIK UTAN NÄTVERK: modulen importerar ./supabase-rest (ren host-vakt),
 * ./varumarke (ren funktion + JSON-import) och @/lib/content (fs-läsning av
 * public/deep-courses.json — INGET nät). Importen sker via en importbro
 * (mönstret från verktyg/testa-mediabibliotek.mjs): källan läses, importer
 * skrivs om till absoluta file://-URL:er — varumarke.ts behöver dessutom en
 * EGEN bro eftersom dess JSON-import kräver "with { type: "json" }"-attribut
 * i node. Hjälpfilerna läggs i tool-results/ (gitignorat) och tas bort i
 * finally. Nätverksvägarna täcks genom stubbad fetch (räknas — ETT oväntat
 * anrop = FAIL) och NEXT_PHASE-hermetiken.
 *
 * Kontroller (≥ 10 enligt kontraktet §A1):
 *   (1)     Vitlistan: exakt title/summary/learn/why — arKursMetadataFalt.
 *   (2)     VITLÅSET: slug/category/weight/xp/minutes/chapters (+ strukturella
 *           syskon) avvisas med ok:false + tydlig VITLÅST-feltext.
 *   (3)     Slug-universum: okänd slug avvisas; känd slug (ur deep-courses)
 *           godtas med giltigt title-värde.
 *   (4)     Längdtakens gränsfall: title 120/121 · summary 300/301 · learn
 *           300/301 · why 900/901 — exakt tak godtas, +1 tecken avvisas.
 *   (5)     Tombstone-kontraktet: varde=null = ok (rollback); tomt värde
 *           avvisas med pek på null-vägen.
 *   (6)     kontrolleraText-grinden (våg 66): FEL-fras ("garanterad
 *           avkastning") avvisas med ersättning i feltexten; negerad
 *           disclaimer ("inte investeringsråd") passerar; VARNING-fras
 *           ("sista chansen") passerar — endast FEL-klassen stoppar.
 *   (7)     Nyckelformatet "{slug}.{falt}": byggNyckel exakt; arGiltigNyckel
 *           (Mimosa-intyget) släpper kurs-slug+vitlistat fält, dödar
 *           path-traversal/versaler/främmande fält.
 *   (8)     senasteVinnerKursMetadata: första (nyaste) raden vinner; nyaste
 *           tombstone filtrerar nyckeln UR kartan; ogiltiga rader (falt
 *           utanför vitlistan, saknad slug) kan aldrig vinna.
 *   (9)     Merge: override slår in per fält, främmana nycklar ignoreras,
 *           frånvarande nyckel (tombstone) lämnar filvärdet orört.
 *   (10)    Prioritetskedjan override > äldre värde > tombstone > fil:
 *           [C, tombstone, B] ⇒ C; [tombstone, B] ⇒ filvärdet.
 *   (11)    NEXT_PHASE-hermetiken: phase-production-build ⇒ tom karta +
 *           nekad skrivning med fetch ALDRIG anropad.
 *   (12)    Ej konfigurerat: utan miljövariabler ⇒ ok:false + ärligt fel,
 *           fortfarande 0 fetch-anrop.
 *   (13)    Graceful nedbrytning: HTTP 500 resp. kastande fetch ⇒ tom karta
 *           — läsvägen kastar ALDRIG.
 *   (14)    Dual-write (v79-mönstret): läs (Range 0-999) → best-effort
 *           DELETE av nyckelns värde-rader → EN POST med båda raderna;
 *           kurs_metadata-details exakt {slug, falt, varde, gammalt, av,
 *           kalla:"panel"}; revisionsrad kurs_metadata-andring bär
 *           nytt+gammalt; gammalt = befintlig override när sådan finns;
 *           cachen rensas (fjärde anropet = ny läsning).
 *   (15)    Tombstone-skrivning: varde=null postas med details.varde===null.
 *   (16)    Import-ytan: endast ./supabase-rest, ./varumarke, @/lib/content
 *           — aldrig deprecated db.ts, aldrig tunga deps.
 *
 * Användning:  node verktyg/testa-kurs-metadata.mjs   (node ≥ 22.18)
 * Avslutskod:  0 om inga FAIL, 1 annars.
 */
import { readFileSync, writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODUL_SOKVAG = path.join(REPO, "src", "lib", "kurs-metadata-live.ts");

// getCourses() läser public/deep-courses.json via process.cwd() — chdir
// gör testet oberoende av varifrån node startas (INGET nät).
process.chdir(REPO);

// ── Testram (mönstret från verktyg/testa-mediabibliotek.mjs) ────────────────
const RADER = [];
function kolla(namn, ok, detalj = "") {
  RADER.push({ namn, ok: !!ok, detalj });
}

// ── Miljöhantering (testerna styr process.env — modulen läser den LAZY) ─────
const ENV_NYCKLAR = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PHASE"];
const SPARAD_ENV = Object.fromEntries(ENV_NYCKLAR.map((k) => [k, process.env[k]]));
function rensaEnv() {
  for (const k of ENV_NYCKLAR) delete process.env[k];
}
function aterstallEnv() {
  for (const [k, v] of Object.entries(SPARAD_ENV)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

// ── Importbron (testa-mediabibliotek-mönstret; varumarke får egen bro) ──────
async function importeraModul() {
  const broSokvag = path.join(REPO, "tool-results", "v82-kurs-metadata-importbro.ts");
  const varumarkeBroSokvag = path.join(REPO, "tool-results", "v82-varumarke-importbro.ts");
  try {
    mkdirSync(path.dirname(broSokvag), { recursive: true });
    // varumarke.ts: JSON-importen kräver attribut i node — egen bro med
    // absolut file://-URL + "with { type: "json" }".
    const varumarkeKalla = readFileSync(path.join(REPO, "src", "lib", "varumarke.ts"), "utf8");
    const jsonUrl = pathToFileURL(path.join(REPO, "data", "varumarke.json")).href;
    const varumarkeBro = varumarkeKalla.replace(
      'from "../../data/varumarke.json"',
      `from "${jsonUrl}" with { type: "json" }`,
    );
    writeFileSync(varumarkeBroSokvag, varumarkeBro);
    // kurs-metadata-live.ts: alla tre importer → absoluta file://-URL:er.
    const kalla = readFileSync(MODUL_SOKVAG, "utf8");
    const transformerad = kalla
      .replace('from "./supabase-rest"', `from "${pathToFileURL(path.join(REPO, "src", "lib", "supabase-rest.ts")).href}"`)
      .replace('from "./varumarke"', `from "${pathToFileURL(varumarkeBroSokvag).href}"`)
      .replace('from "@/lib/content"', `from "${pathToFileURL(path.join(REPO, "src", "lib", "content.ts")).href}"`);
    writeFileSync(broSokvag, transformerad);
    return await import(pathToFileURL(broSokvag).href);
  } finally {
    for (const f of [broSokvag, varumarkeBroSokvag]) {
      try { unlinkSync(f); } catch { /* redan borta */ }
    }
  }
}

// ── Fetch-stub (nätverk ersätts — anropen registreras och räknas) ───────────
function installeraFetchStub(svarFabrik) {
  const riktigFetch = globalThis.fetch;
  const anrop = [];
  globalThis.fetch = async function (url, init = {}) {
    const metod = String(init.method ?? "GET").toUpperCase();
    anrop.push({ url: String(url), metod, init });
    return svarFabrik(metod, String(url), init);
  };
  return { anrop, aterstall: () => { globalThis.fetch = riktigFetch; } };
}
const OK_SVAR = { ok: true, status: 200, json: async () => [] };

async function main() {
  let m;
  try {
    m = await importeraModul();
  } catch (e) {
    console.error("[testa-kurs-metadata] KUNDE INTE IMPORTERA MODULFILEN: " + (e && e.message ? e.message : String(e)));
    process.exitCode = 1;
    return;
  }
  const {
    arKursMetadataFalt, KURS_FALT_VITLISTA, LANGD_TAK, byggNyckel, arGiltigNyckel,
    valideraKursSkrivning, senasteVinnerKursMetadata, tillampaKursOverrides,
    lasKursOverrides, medKursOverrides, skrivKursMetadata, glomKursMetadataCache,
  } = m;

  // Riktig slug + filtitel ur deep-courses (333 kurser — samma källa som
  // skrivvägens slug-universum; INGET nät).
  const kurser = JSON.parse(readFileSync(path.join(REPO, "public", "deep-courses.json"), "utf8"));
  const slugar = Object.keys(kurser);
  const riktigSlug = slugar[0];
  const filTitel = kurser[riktigSlug].title;

  rensaEnv(); // deterministisk start: inga miljövariabler påverkar testen

  // ── (1) Vitlistan ──────────────────────────────────────────────────────────
  const vitlistaOK =
    KURS_FALT_VITLISTA.length === 4 &&
    ["title", "summary", "learn", "why"].every((f) => arKursMetadataFalt(f)) &&
    !arKursMetadataFalt("slug") && !arKursMetadataFalt("category") && !arKursMetadataFalt("xp") && !arKursMetadataFalt("niva");
  kolla(
    "Vitlistan: exakt title/summary/learn/why igenkänns — strukturella fält gör inte",
    vitlistaOK,
    KURS_FALT_VITLISTA.join("/") + " — tak " + JSON.stringify(LANGD_TAK),
  );

  // ── (2) VITLÅSET (§A1: ALDRIG-nivå) ────────────────────────────────────────
  const vitlas = ["slug", "category", "weight", "xp", "minutes", "chapters", "totalMinutes", "chapterCount", "blocks", "quiz", "history", "perspektiv", "level"];
  const vitlasSvar = vitlas.map((f) => valideraKursSkrivning({ slug: riktigSlug, falt: f, varde: "X", av: "test" }, slugar));
  kolla(
    "VITLÅSET: slug/category/weight/xp/minutes/chapters (+ strukturella syskon) avvisas med tydlig feltext",
    vitlasSvar.every((s) => s.ok === false && /VITLÅST/i.test(s.fel)),
    vitlas.length + " fält avvisade; feltext: " + (vitlasSvar[0].ok ? "" : vitlasSvar[0].fel.slice(0, 90) + "…"),
  );

  // ── (3) Slug-universum (getCourses/deep-courses) ───────────────────────────
  const okandSlug = valideraKursSkrivning({ slug: "finns-inte-i-djupkurser", falt: "title", varde: "Ny titel", av: "test" }, slugar);
  const kandSlug = valideraKursSkrivning({ slug: riktigSlug, falt: "title", varde: "Ny titel", av: "test" }, slugar);
  kolla(
    "Slug-universum: okänd slug avvisas, känd slug (deep-courses) godtas",
    okandSlug.ok === false && /Okänd kurs/.test(okandSlug.fel) && kandSlug.ok === true && kandSlug.varde === "Ny titel",
    'okänd → "' + (okandSlug.ok ? "" : okandSlug.fel.slice(0, 60)) + '"; känd ' + riktigSlug + " → ok",
  );

  // ── (4) Längdtakens gränsfall (120/300/300/900 — inkluderande) ─────────────
  const gransfall = [
    ["title", 120], ["title", 121],
    ["summary", 300], ["summary", 301],
    ["learn", 300], ["learn", 301],
    ["why", 900], ["why", 901],
  ];
  let takOK = true;
  const takDetaljer = [];
  for (const [falt, langd] of gransfall) {
    const tak = LANGD_TAK[falt];
    const varde = "p".repeat(langd);
    const svar = valideraKursSkrivning({ slug: riktigSlug, falt, varde, av: "test" }, slugar);
    const vantaOK = langd === tak; // exakt tak godtas, +1 avvisas
    if (svar.ok !== vantaOK) takOK = false;
    if (!svar.ok && !new RegExp("taket är " + tak + " tecken").test(svar.fel)) takOK = false;
    takDetaljer.push(falt + ":" + langd + "→" + (svar.ok ? "ok" : "AV"));
  }
  kolla(
    "Längdtak gränsfall: title 120/121 · summary 300/301 · learn 300/301 · why 900/901 — exakt tak godtas, +1 avvisas med taket i feltexten",
    takOK,
    takDetaljer.join(" · "),
  );

  // ── (5) Tombstone-kontraktet (varde=null = rollback) ───────────────────────
  const tombstone = valideraKursSkrivning({ slug: riktigSlug, falt: "why", varde: null, av: "test" }, slugar);
  const tomt = valideraKursSkrivning({ slug: riktigSlug, falt: "why", varde: "   ", av: "test" }, slugar);
  kolla(
    "Tombstone: varde=null godtas (rollback); tomt strängvärde avvisas med pek på null-vägen",
    tombstone.ok === true && tombstone.varde === null && tomt.ok === false && /null/i.test(tomt.fel),
    "null → ok; \"   \" → " + (tomt.ok ? "FEL: godkäntes" : tomt.fel.slice(0, 70)),
  );

  // ── (6) kontrolleraText-grinden (våg 66 — FEL-klassen stoppar) ─────────────
  const gradFEL = valideraKursSkrivning({ slug: riktigSlug, falt: "summary", varde: "Detta ger garanterad avkastning för alla.", av: "test" }, slugar);
  const gradNegerad = valideraKursSkrivning({ slug: riktigSlug, falt: "summary", varde: "Pedagogisk analys — inte investeringsråd.", av: "test" }, slugar);
  const gradVarning = valideraKursSkrivning({ slug: riktigSlug, falt: "summary", varde: "Sista chansen att gå med i höst!", av: "test" }, slugar);
  kolla(
    "kontrolleraText-grinden: FEL-fras avvisas (ersättning i texten); negerad disclaimer + VARNING-fras passerar",
    gradFEL.ok === false && /KontrolleraText/.test(gradFEL.fel) && /forskningsunderlag/.test(gradFEL.fel) && gradNegerad.ok === true && gradVarning.ok === true,
    'FEL: "garanterad avkastning" → ' + (gradFEL.ok ? "PASSERADE (FEL!)" : gradFEL.fel.slice(0, 90) + "…"),
  );

  // ── (7) Nyckelformatet + Mimosa-intyget ────────────────────────────────────
  const nyckelRatt = byggNyckel(riktigSlug, "title") === riktigSlug + ".title";
  const intygOK =
    ["title", "summary", "learn", "why"].every((f) => arGiltigNyckel(riktigSlug + "." + f)) &&
    !arGiltigNyckel("../../hack.title") &&
    !arGiltigNyckel(riktigSlug + ".TITLE") &&
    !arGiltigNyckel(riktigSlug + ".slug") &&
    !arGiltigNyckel(riktigSlug.replace("-", ".") + ".title") &&
    !arGiltigNyckel("") &&
    !arGiltigNyckel(riktigSlug + ".title extra");
  kolla(
    'Nyckelformat "{slug}.{falt}": byggNyckel exakt; intyget släpper kurs-slug+vitlistat fält, dödar traversal/versaler/främmande fält',
    nyckelRatt && intygOK,
    "kanon: " + riktigSlug + ".title",
  );

  // ── (8) senasteVinner + tombstone-filter + ogiltiga rader ──────────────────
  const rader = [
    { created_at: "2026-03-01", slug: "kursa", falt: "title", varde: "Nyaste vinner" },
    { created_at: "2026-02-01", slug: "kursa", falt: "title", varde: "Äldre förlorar" },
    { created_at: "2026-04-01", slug: "kursb", falt: "title", varde: null }, // nyaste = tombstone
    { created_at: "2026-03-15", slug: "kursb", falt: "title", varde: "Död genom tombstone" },
    { created_at: "2026-05-01", slug: "kursc", falt: "category", varde: "ogiltigt fält" },
    { created_at: "2026-05-02", falt: "title", varde: "saknad slug" },
  ];
  const karta = senasteVinnerKursMetadata(rader);
  kolla(
    "senasteVinner: nyaste raden vinner; tombstone filtrerar nyckeln UR kartan; ogiltiga rader vinner aldrig",
    karta.get("kursa.title") === "Nyaste vinner" && !karta.has("kursb.title") && karta.size === 1,
    [...karta.entries()].map(([k, v]) => k + "→" + v.slice(0, 20)).join(" · ") || "tom karta",
  );

  // ── (9) Merge — override per fält, främmana nycklar ignorerade ─────────────
  const filKurs = {
    slug: "kursa", title: "Fil-titel", summary: "Fil-summary", learn: "Fil-learn", why: "Fil-why",
    category: "KATEGORI", xp: 100, minutes: 42, chapters: [], chapterCount: 0, totalMinutes: 42, level: "Nybörjare",
  };
  const merge = tillampaKursOverrides(filKurs, new Map([
    ["kursa.title", "Live-titel"],
    ["kursa.learn", "Live-learn"],
    ["kursa.category", "HACKAD"], // främmande fält — ignoreras per konstruktion
    ["annan-kurs.title", "Främmande slug"], // främmande kurs — ignoreras
  ]));
  kolla(
    "Merge: override slår in per vitlistefält; främmana nycklar (fel fält/främmande slug) ignoreras; filvärdet består annars",
    merge.title === "Live-titel" && merge.learn === "Live-learn" && merge.summary === "Fil-summary" && merge.why === "Fil-why" && merge.category === "KATEGORI" && merge.xp === 100 && filKurs.title === "Fil-titel",
    "title/learn live; summary/why/strukturella orörda; originalet omuterat",
  );

  // ── (10) Prioritetskedjan override > äldre värde > tombstone > fil ─────────
  const kedja1 = senasteVinnerKursMetadata([
    { created_at: "2026-06-03", slug: "kursa", falt: "title", varde: "C" },
    { created_at: "2026-06-02", slug: "kursa", falt: "title", varde: null }, // tombstone i mitten
    { created_at: "2026-06-01", slug: "kursa", falt: "title", varde: "B" },
  ]);
  const kedja2 = senasteVinnerKursMetadata([
    { created_at: "2026-06-02", slug: "kursa", falt: "title", varde: null }, // nyaste tombstone
    { created_at: "2026-06-01", slug: "kursa", falt: "title", varde: "B" },
  ]);
  const efterTombstone = tillampaKursOverrides(filKurs, kedja2);
  kolla(
    "Prioritetskedja: [C, tombstone, B] ⇒ C vinner; [tombstone, B] ⇒ FILVÄRDET gäller (rollback)",
    kedja1.get("kursa.title") === "C" && !kedja2.has("kursa.title") && efterTombstone.title === "Fil-titel",
    "radhistorik ⇒ gällande: C; tombstone-sista ⇒ fil (Fil-titel)",
  );

  // ── (11) NEXT_PHASE-hermetik (våg 79 — ALDRIG nät under next build) ───────
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://ak1a-testproj.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-nyckel-inte-echt";
  process.env.NEXT_PHASE = "phase-production-build";
  glomKursMetadataCache();
  let hermFetch = 0;
  let hermOK = true;
  const hermDetaljer = [];
  {
    const stub = installeraFetchStub(() => { hermFetch += 1; throw new Error("NÄTVERK ANROPAT UNDER HERMETISK BYGGFAS"); });
    try {
      const tom = await lasKursOverrides();
      if (!(tom instanceof Map && tom.size === 0)) hermOK = false;
      hermDetaljer.push("lasKursOverrides→" + String(tom.size) + " poster");
      const nekad = await skrivKursMetadata({ slug: riktigSlug, falt: "title", varde: "Bygg-titel", av: "test" });
      if (!(nekad.ok === false && typeof nekad.fel === "string" && /next build/i.test(nekad.fel))) hermOK = false;
      hermDetaljer.push("skriv→" + (nekad.ok ? "OK (FEL!)" : "nekad"));
      const med = await medKursOverrides(filKurs);
      if (med.title !== "Fil-titel") hermOK = false; // tom karta ⇒ filen gäller
    } finally {
      stub.aterstall();
    }
  }
  kolla(
    "NEXT_PHASE-hermetik: phase-production-build ⇒ tom karta/nekad skrivning/fil-värden med fetch ALDRIG anropad",
    hermOK && hermFetch === 0,
    hermFetch + " fetch-anrop (krav: 0); " + hermDetaljer.join(" | "),
  );

  // ── (12) Ej konfigurerat (MÖS: ärligt fel, aldrig krasch) ──────────────────
  rensaEnv();
  glomKursMetadataCache();
  let oconfFetch = 0;
  let oconfSvar;
  {
    const stub = installeraFetchStub(() => { oconfFetch += 1; throw new Error("NÄTVERK UTAN KONFIG"); });
    try {
      oconfSvar = await skrivKursMetadata({ slug: riktigSlug, falt: "title", varde: "Titel utan lagring", av: "test" });
    } finally {
      stub.aterstall();
    }
  }
  kolla(
    'Ej konfigurerat: utan env ⇒ ok:false + ärligt fel ("konfigurer"), 0 fetch-anrop',
    oconfSvar.ok === false && /konfigurer/i.test(oconfSvar.fel) && oconfFetch === 0,
    oconfSvar.ok ? "FEL: godkäntes" : oconfSvar.fel,
  );

  // ── (13) Graceful nedbrytning: Supabase-fel ⇒ tom karta (kastar ALDRIG) ────
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://ak1a-testproj.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-nyckel-inte-echt";
  let gracOK = true;
  const gracDetaljer = [];
  {
    const stub500 = installeraFetchStub(() => ({ ok: false, status: 500, json: async () => [] }));
    try {
      glomKursMetadataCache();
      const tom = await lasKursOverrides();
      if (!(tom instanceof Map && tom.size === 0)) gracOK = false;
      gracDetaljer.push("HTTP 500→" + String(tom.size) + " poster");
    } catch (e) {
      gracOK = false;
      gracDetaljer.push("HTTP 500 KASTADE: " + String(e && e.message));
    } finally { stub500.aterstall(); }
    const stubKast = installeraFetchStub(() => { throw new Error("nätverk borta"); });
    try {
      glomKursMetadataCache();
      const tom = await lasKursOverrides();
      if (!(tom instanceof Map && tom.size === 0)) gracOK = false;
      gracDetaljer.push("kastande fetch→" + String(tom.size) + " poster");
    } catch (e) {
      gracOK = false;
      gracDetaljer.push("kastande fetch KASTADE: " + String(e && e.message));
    } finally { stubKast.aterstall(); }
  }
  kolla(
    "Graceful: HTTP 500 resp. kastande fetch ⇒ tom karta — läsvägen kastar ALDRIG",
    gracOK,
    gracDetaljer.join(" | "),
  );

  // ── (14) Dual-write (v79): läs → DELETE → EN POST med två rader ────────────
  const ORIGIN = "https://ak1a-testproj.supabase.co";
  const overrideRad = [{ created_at: "2026-08-01T00:00:00Z", slug: riktigSlug, falt: "title", varde: "Gammal override" }];
  glomKursMetadataCache();
  let dualRes;
  let postKropp;
  const { anrop, aterstall } = installeraFetchStub((metod) =>
    metod === "POST" ? { ok: true, status: 201, json: async () => [] } :
    metod === "DELETE" ? { ok: true, status: 204, json: async () => [] } :
    { ok: true, status: 200, json: async () => overrideRad },
  );
  try {
    dualRes = await skrivKursMetadata({ slug: riktigSlug, falt: "title", varde: "Ny kurstitel live", av: "test-admin" });
    postKropp = anrop.filter((a) => a.metod === "POST").map((a) => JSON.parse(a.init.body))[0] ?? null;
    // Cachen rensades av skrivningen — nästa läsning hämtar OM (4:e anropet).
    const efter = await lasKursOverrides();
    if (!(efter instanceof Map)) throw new Error("lasKursOverrides returnerade inte en karta");
  } finally {
    aterstall();
  }
  const las1 = anrop[0];
  const lasEfter = anrop[anrop.length - 1];
  const post = anrop.find((a) => a.metod === "POST");
  const deleteAnrop = anrop.find((a) => a.metod === "DELETE");
  const rad0 = postKropp?.[0];
  const rad1 = postKropp?.[1];
  const dualOK =
    dualRes.ok === true &&
    anrop.length === 4 &&
    anrop.map((a) => a.metod).join(",") === "GET,DELETE,POST,GET" &&
    las1.init.headers.Range === "0-999" && // Range-pagineringen (sida 1)
    las1.url.startsWith(ORIGIN + "/rest/v1/system_events?type=eq.kurs_metadata&select=created_at,details->>slug,details->>falt,details->>varde&order=created_at.desc,id.desc") &&
    deleteAnrop.url.includes("details->>slug=eq." + riktigSlug) && deleteAnrop.url.includes("details->>falt=eq.title") && deleteAnrop.url.includes("type=eq.kurs_metadata") &&
    post.url === ORIGIN + "/rest/v1/system_events" &&
    Array.isArray(postKropp) && postKropp.length === 2 &&
    rad0.type === "kurs_metadata" && rad0.severity === "info" && rad0.source === "kurser" &&
    rad0.details.slug === riktigSlug && rad0.details.falt === "title" && rad0.details.varde === "Ny kurstitel live" &&
    rad0.details.gammalt === "Gammal override" && rad0.details.av === "test-admin" && rad0.details.kalla === "panel" &&
    rad1.type === "kurs_metadata-andring" && rad1.details.nytt === "Ny kurstitel live" && rad1.details.gammalt === "Gammal override" && rad1.details.kalla === "panel" &&
    lasEfter !== las1; // cache-rensningen ⇒ ny nätläsning
  kolla(
    "Dual-write (v79): Range-läs → DELETE värde-rader → EN POST: kurs_metadata {slug,falt,varde,gammalt,av,kalla:panel} + kurs_metadata-andring {nytt,gammalt}; cache rensas",
    dualOK,
    anrop.length + " anrop (" + anrop.map((a) => a.metod).join(",") + "); gammalt=override; Range=" + String(las1.init.headers.Range),
  );

  // ── (15) Tombstone-skrivning (rollback-paketet) ────────────────────────────
  glomKursMetadataCache();
  let tombSvar;
  let tombDetails;
  {
    const { anrop: tAnrop, aterstall: tAterstall } = installeraFetchStub((metod) =>
      metod === "POST" ? { ok: true, status: 201, json: async () => [] } :
      metod === "DELETE" ? { ok: true, status: 204, json: async () => [] } :
      { ok: true, status: 200, json: async () => overrideRad },
    );
    try {
      tombSvar = await skrivKursMetadata({ slug: riktigSlug, falt: "title", varde: null, av: "test-admin" });
      const tPost = tAnrop.find((a) => a.metod === "POST");
      tombDetails = tPost ? JSON.parse(tPost.init.body) : null;
    } finally {
      tAterstall();
    }
  }
  kolla(
    "Tombstone-skrivning: varde=null postas med details.varde===null på värde-raden (rollback ⇒ filvärdet gäller)",
    tombSvar.ok === true && Array.isArray(tombDetails) && tombDetails[0].details.varde === null && tombDetails[0].details.gammalt === "Gammal override" && tombDetails[1].details.nytt === null,
    "rollback-rad postad; revisionsrad bär nytt:null",
  );

  // ── (16) Import-ytan: endast vedertagen trio — aldrig db.ts ────────────────
  const kalltext = readFileSync(MODUL_SOKVAG, "utf8");
  const importRader = kalltext.match(/^\s*import[\s{"'].*$/gm) ?? [];
  const otillatna = importRader.filter((r) => !/from\s+["'](\.\/supabase-rest|\.\/varumarke|@\/lib\/content)["']/.test(r));
  kolla(
    "Import-ytan = endast ./supabase-rest + ./varumarke + @/lib/content (aldrig deprecated db.ts, aldrig tunga deps)",
    importRader.length === 3 && otillatna.length === 0,
    importRader.join(" · ") || "0 import-rader",
  );

  aterstallEnv();

  // ── Sammanställning (akm2-mönstret) ────────────────────────────────────────
  let fail = 0;
  let nr = 0;
  for (const r of RADER) {
    nr += 1;
    const status = r.ok ? "PASS" : "FAIL";
    if (!r.ok) fail += 1;
    console.log(`${status}  ${String(nr).padStart(2)} · ${r.namn}${r.detalj ? " — " + r.detalj : ""}`);
  }
  console.log("");
  const grona = RADER.length - fail;
  console.log(`[testa-kurs-metadata] ${grona}/${RADER.length} kontroller gröna${fail ? ", " + fail + " FAIL" : ""}.`);
  if (!fail) {
    console.log("[testa-kurs-metadata] Kontrakt §A1: valideringen REN — vitlista, vitlås, längdtak, tombstone, dual-write, hermetik.");
  }
  process.exitCode = fail ? 1 : 0;
}

main().catch((e) => {
  aterstallEnv();
  console.error("[testa-kurs-metadata] FEL: " + (e && e.message ? e.message : String(e)));
  process.exitCode = 1;
});
