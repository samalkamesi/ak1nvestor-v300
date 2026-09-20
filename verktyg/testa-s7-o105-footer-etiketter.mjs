#!/usr/bin/env node
/**
 * TEST: o105 KONTRAKT — footer-/brodkrumma-etiketter vid serverbindning
 * (spår 7, o101 §4 Kur A+B; skrivet VID kuren som anvisningen kräver).
 * ====================================================================
 * Enhet:
 *   A  registertäckning — varje sektion/punkt-nyckel i
 *      registerFor(GAST_KONTEXT,"footer") har icke-tom rad i ORDLISTA
 *      för sv/en/ar, och skapaT(lang)(nyckel) === ORDLISTA[nyckel][lang]
 *      (serverbindningen ger EXAKT det useSprak().t/oversatt gett — samma
 *      källa, dokumenterat kontrakt, ingen etikett kan tappa språk).
 *   B  bottenradsnycklar — footer.disclaimer · footer.integritetspolicy ·
 *      footer.villkor · footer.finansiellPolicy · footer.byggtMed ·
 *      ui.brodsmulor: definierade + icke-tomma på alla tre språken.
 *   C  tText-kontrakt — oversattText slår ordlistans SV-VÄRDEN:
 *      "Kurser"→Courses/الدورات, "Blogg"→Blog/المدونة; ingen träff ⇒ sv.
 *   D  wiring — seo-page-shell.tsx importerar OCH väljer serverbindning
 *      enbart för en/ar (spegel-villkoret); blogg-listorna (en/ar) och
 *      spegelbyggarna (blogg/kurs [slug]) lämnar lang till shellen.
 *   E  sv-default — utan lang renderas klientbindningarna (MGTM kvar):
 *      villkorsuttrycket börjar på lang === "en" || (default falsy).
 *
 * Körs: node verktyg/testa-s7-o105-footer-etiketter.mjs (offline).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { register } from "node:module";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

// "@/…"-alias → <rot>/src/ (sprak.ts importerar "@/lib/ordlista")
register(pathToFileURL(join(HÄR, "_s7o105-alias-hook.mjs")).href);

const { skapaT, oversattText } = await import(
  pathToFileURL(join(ROT, "src/lib/sprak.ts")).href
);
const { ORDLISTA } = await import(
  pathToFileURL(join(ROT, "src/lib/ordlista.ts")).href
);

let pass = 0;
let fail = 0;
const fel = [];
function kolla(villkor, namn) {
  if (villkor) pass++;
  else {
    fail++;
    fel.push(namn);
  }
}

const SPRAK = ["sv", "en", "ar"];

// Registernycklarna läses ur meny-register.ts-källan (textuellt): modulen
// importerar member-/kurs-access (browser-nära) och behöver inte importeras
// i node — nyckelSTRÄNGARNA är själva kontraktet mot ordlistan.
const registerkalla = readFileSync(join(ROT, "src/lib/meny-register.ts"), "utf8");
const nycklar = new Set(
  (registerkalla.match(/"(?:nav|footer|ui|om)\.[a-zA-Z0-9]+"/g) ?? []).map((s) => s.slice(1, -1)),
);

// ── A: registertäckning + ekvivalens ────────────────────────────────────────
kolla(nycklar.size >= 30, `A0 footer-registret bär nycklar (fick ${nycklar.size}, krav ≥30)`);

for (const lang of SPRAK) {
  const t = skapaT(lang);
  let tomma = 0;
  let avvikande = 0;
  for (const nyckel of nycklar) {
    const rad = ORDLISTA[nyckel];
    if (!rad || !rad[lang] || !rad[lang].trim()) tomma++;
    else if (t(nyckel) !== rad[lang]) avvikande++;
  }
  kolla(tomma === 0, `A1 ${lang}: 0 nycklar saknar översättning (fick ${tomma})`);
  kolla(avvikande === 0, `A2 ${lang}: skapaT === ORDLISTA-rad (fick ${avvikande} avvikande)`);
}

// ── B: bottenradsnycklar + smulnav ──────────────────────────────────────────
const botten = [
  "footer.disclaimer",
  "footer.integritetspolicy",
  "footer.villkor",
  "footer.finansiellPolicy",
  "footer.byggtMed",
  "ui.brodsmulor",
];
for (const lang of SPRAK) {
  const t = skapaT(lang);
  for (const n of botten) {
    kolla(
      Boolean(ORDLISTA[n]?.[lang]?.trim()) && t(n) === ORDLISTA[n][lang],
      `B ${lang}:${n} definierad + ekvivalent`,
    );
  }
}

// ── C: tText-kontrakt (sv-värde ⇒ valt språk; okänt ⇒ oförändrat) ──────────
kolla(oversattText("Kurser", "en") === "Courses", `C1 Kurser→en=${JSON.stringify(oversattText("Kurser", "en"))}`);
kolla(oversattText("Kurser", "ar") === "الدورات", `C2 Kurser→ar=${JSON.stringify(oversattText("Kurser", "ar"))}`);
kolla(oversattText("Blogg", "en") === "Blog", `C3 Blogg→en=${JSON.stringify(oversattText("Blogg", "en"))}`);
kolla(oversattText("EjIOrdlistan XYZ", "en") === "EjIOrdlistan XYZ", "C4 okänd text ⇒ oförändrad (sv-fallback)");

// ── D: wiring — serverbindningen sitter där den ska ────────────────────────
const las = (p) => readFileSync(join(ROT, p), "utf8");
const shell = las("src/components/ak1a/seo-page-shell.tsx");
kolla(shell.includes("SidfooterServer"), "D1 shell importerar SidfooterServer");
kolla(shell.includes("BrodkrummaServer"), "D2 shell importerar BrodkrummaServer");
kolla(
  shell.includes('lang === "en" || lang === "ar"'),
  "D3 spegelvillkor: enbart en/ar binder server-side",
);
kolla(shell.includes("<Sidfooter />"), "D4 default (sv) renderar klient-Sidfooter (MGTM kvar)");
for (const [sokvag, namn] of [
  ["src/app/(en)/en/blogg/page.tsx", "D5 /en/blogg lämnar lang"],
  ["src/app/(ar)/ar/blogg/page.tsx", "D6 /ar/blogg lämnar lang"],
  ["src/components/ak1a/blogg-spegel-sida.tsx", "D7 blogg-[slug]-byggare lämnar lang"],
  ["src/components/ak1a/kurs-spegel-sida.tsx", "D8 kurs-[slug]-byggare lämnar lang"],
]) {
  kolla(las(sokvag).includes("lang="), `${namn} (${sokvag})`);
}

// ── E: vy-modulerna är hook-fria (bindbar i serverträd) ────────────────────
for (const [sokvag, namn] of [
  ["src/components/ak1a/sidfooter-vy.tsx", "E1 sidfooter-vy"],
  ["src/components/ak1a/brodkrumma-vy.tsx", "E2 brodkrumma-vy"],
]) {
  // Kommentarer rensas först — "useSprak().t" i dokumentations-text är
  // inte ett hook-anrop; kod-rader är det.
  const kalla = las(sokvag).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  kolla(!kalla.startsWith('"use client"') && !kalla.includes("'use client'"), `${namn} saknar use client (server-konsumerbar)`);
  kolla(!/use(Sprak|State|Effect|Context|Memo|Callback|Pathname)\s*\(/.test(kalla), `${namn} hook-fri`);
}

// ── F: o110 våg 2 — FULL lang-täckning i speglarnas shell-anrop ────────────
// Mekaniskt: VARJE .tsx under src/app/(en|ar) som anropar <SeoPageShell ska
// bära lang (o105 §6 våg 2; en rad per fil). dataset-listsidorna nås via
// dataset-sidor.tsx (lang={lang} — sv faller tillbaka på klientbindningen).
function tsxFiler(dir) {
  const ut = [];
  for (const namn of readdirSync(join(ROT, dir))) {
    const sokvag = `${dir}/${namn}`;
    if (statSync(join(ROT, sokvag)).isDirectory()) ut.push(...tsxFiler(sokvag));
    else if (namn.endsWith(".tsx")) ut.push(sokvag);
  }
  return ut;
}
for (const [grupp, langStr, etikett] of [
  ["src/app/(en)", 'lang="en"', "en"],
  ["src/app/(ar)", 'lang="ar"', "ar"],
]) {
  const anropare = tsxFiler(grupp).filter((p) => las(p).includes("<SeoPageShell"));
  // 14 = 13 list-sidor (o110 våg 2) + blogg-listan (o105). [slug]-speglarna
  // (blogg/kurs) och dataset-sidorna når shellen via byggarkomponenter som
  // bär lang={lang} — de träffas av D7/D8/F2, inte av denna gångare.
  kolla(anropare.length === 14, `F0 ${etikett}: exakt 14 shell-anropande spegelfiler (fick ${anropare.length})`);
  const saknar = anropare.filter((p) => !las(p).includes(langStr));
  kolla(saknar.length === 0, `F1 ${etikett}: alla ${anropare.length} shell-anrop bär ${langStr} (saknar: ${saknar.join(", ") || "inga"})`);
}
kolla(
  las("src/components/ak1a/dataset-sidor.tsx").includes("<SeoPageShell lang={lang}"),
  "F2 dataset-sidor: båda shell-anropen bär lang={lang} (sv ⇒ klientbindning)",
);

console.log(`\no105+o110 kontraktstest: ${pass} PASS, ${fail} FAIL`);
if (fail > 0) {
  console.log("FALKADE KONTROLLER:");
  for (const f of fel) console.log(`  ✗ ${f}`);
  process.exit(1);
}
console.log("GRÖNT — footer/brodkrumna-etiketterna är kontraktssäkra i båda bindningarna.");
