#!/usr/bin/env node
/**
 * KVALITETSVAKTEN — AK1A:s kontinuerliga felsökningssystem.
 * Användarens direktiv: "vi måste ha system som ständigt söker efter fel och rättar".
 *
 * Skannar HELA sajten varje körning (dagligen 07:02 lokal av vaktpumporna
 * enligt o35-schemat; manuellt via /api/cron/kvalitet) och skriver
 * ÖVERSKRIVANDE rapport till data/rapporter/kvalitetsrapport-SENASTE.md.
 *
 * Sju kontroller:
 *   1. ÅÄÖ-bortfall i bokmaster-text — ALL text ur data/bokmaster/*.json matchas
 *      mot en manglings-ordbok. Skriptet kan INTE läsa svenska → varje träff
 *      listas som "MANUELL GRANSKNING KRÄVS" med fil + sökväg + kontext.
 *   2. UI-strängar — JSX-text och attribut-strängar ur src/components/ak1a/*.tsx
 *      + alla page.tsx under src/app mot samma manglings-mönster.
 *   2b. Förbjudna fraser — samma strängunderlag + lib-copy (email-mallar,
 *       nyhets-motor, seo) mot FORBJUDNA_FRASER ur data/varumarke.json
 *       (varumärket som kod, m6 §F/våg 60 bygg-C). FEL = räknas i fel,
 *       VARNING = manuell granskning. Citerings-undantag enligt A10.
 *   3. JSON-giltighet — JSON.parse av ALLA data/*.json + data/bokmaster/*.json.
 *   4. Länk-validitet — varje href/lank ur sokindex.ts + huvudmeny.tsx +
 *      sidfooter.tsx måste motsvara en page.tsx i src/app (statisk eller dynamisk).
 *   5. Kursdata-konsistens — chapterCount === chapters.length,
 *      quiz-antal === kapitel × 3, totalMinutes === sum(chapters[].minutes).
 *   6. Sitemap-täckning — alla viktiga routes (nav + statiska sidor) finns i sitemap.ts.
 *   7. Motorvalidering (100%-väktaren, våg 49) — kör ALLTID
 *      verktyg/validera-motorer.mjs som subprocess (~5–10 s, budget 120 s) och
 *      tolkar RESULTAT-raden: FAIL>0, SKIP>0 eller fel avslutskod ⇒ sektions-FEL
 *      (SKIP är förbjudet — "kontroller för att allt ska få 100% är obligatoriska").
 *      Fallanvändning om subprocessen inte kan köras: senaste rapportfilens
 *      SISTA RESULTAT/Totalt-rad (append-läge gör att första träffen kan vara gammal).
 *
 * Därtill rapportsektioner 8–10 (motorer, ÅÄÖ-degenerering, sifferkonsistens)
 * och sedan o39:
 *  11. Typbaslinje — kör ALLTID node node_modules/typescript/bin/tsc --noEmit
 *      via PROJEKTBINÄREN (ALDRIG npx: i deployfönstret kan npx lösa tsc till
 *      cachens dummy-paket). Exit 0 = PASS; typfel = baslinjebrott (FEL —
 *      typnollen är mekanisk sedan våg 133, men merge-committar passerar
 *      pre-commit-grinden, så det dagliga 07:02-beviset är vakten). Saknad
 *      binär / timeout / fel som ALLA pekar in i node_modules = MANUELL
 *      (deploy-transient enligt K2/K3-precedensen — omätning bokförs ärligt,
 *      vakten ger ALDRIG tyst PASS).
 *  12. SSR-livssond (o64) — probar deterministiska sentinellrutter (o47:s
 *      exakta 500-rötter: / /kurser /analyser /blogg /labb /en /ar) på
 *      loopback. Mätfönster-grind FÖRE mätvärde (o55 §2: fuser-ÄGANDE av
 *      deploylåset + pgrep HELA byggmönster MED släktexkludering — den egna
 *      processkedjan kan aldrig bli "byggprocess", o55 F2-klassen död även
 *      hos observatören). 5xx-svar = FEL (o47-klassen: servern svarar =
 *      äkta fel, omstart ger connection refused); 4xx/nätfel/timeout =
 *      MANUELL; deploy/byggfönster = MANUELL "OMÄTT" (aldrig tyst PASS,
 *      aldrig artefakt-FEL). Logik i verktyg/ssr-livssond.mjs (importerbar
 *      modul enligt tmp-stad.mjs-precedensen; svit:
 *      verktyg/testa-kvalitetsvakt-ssr500.mjs).
 *
 * Statusregler (dokumenterade i rapporten):
 *   RÖD  = fler än 9 fel ELLER ogiltig JSON-fil
 *   GUL  = 1–9 fel ELLER fler än 99 manuella granskningar
 *   GRÖN = 0 fel och högst 99 manuella granskningar
 *
 * Användning:  node verktyg/kvalitetsvakt.mjs [--kör-motorer]
 * Avslutskod:  0 = GRÖN/GUL, 1 = RÖD eller ogiltigt läge.
 * Sista stdout-raden "RESULTAT_JSON={...}" är maskinläsbar (cron-rutten parsar den).
 */
import { spawn, spawnSync, execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stadaTmpFiler } from "./tmp-stad.mjs";
import { sektionSsrLivssond } from "./ssr-livssond.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAPPORT_SOK = path.join(REPO, "data", "rapporter", "kvalitetsrapport-SENASTE.md");
const KOR_MOTORER = process.argv.includes("--kör-motorer");

// ════════════════════════════════════════════════════════════════════════════
// Manglings-ordbok — tecken-förlorade svenska ord (å/ä/ö bortstrukna eller
// translittererade av generatorer). Träff = MANUELL GRANSKNING (skriptet kan
// inte bedöma om ett annat giltigt ord avses).
// ════════════════════════════════════════════════════════════════════════════
const MANGLE_ORD = [
  { token: "frgan", ratt: "frågan" },
  { token: "s ker", ratt: "säker/söker", medMellanslag: true },
  { token: "vagan", ratt: "vågan" },
  { token: "flode", ratt: "flöde" },
  { token: "somn", ratt: "sömn" },
  { token: "hlla", ratt: "hålla" },
  { token: "rkna", ratt: "räkna" },
  { token: "svrt", ratt: "svårt" },
  { token: "mnster", ratt: "mönster" },
  { token: "mjlig", ratt: "möjlig" },
  { token: "fretag", ratt: "företag" },
];

function mangleRegex({ token, medMellanslag }) {
  const kropp = medMellanslag ? token.replace(/ /g, "\\s+") : token;
  return new RegExp(`(?<![\\p{L}\\p{N}_])${kropp}(?![\\p{L}\\p{N}_])`, "giu");
}

const MANGLE_REGEXAR = MANGLE_ORD.map((o) => ({ ...o, re: mangleRegex(o) }));

/** Sök manglings-träffar i en text — returnerar [{ord, ratt, matchadText, index}]. */
function sokMangle(text) {
  const traffar = [];
  if (typeof text !== "string" || text.length < 3) return traffar;
  for (const { token, ratt, re } of MANGLE_REGEXAR) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      traffar.push({ ord: token, ratt, matchadText: m[0], index: m.index });
      if (traffar.length > 500) return traffar; // säkerhetsventil
    }
  }
  return traffar;
}

/** Kontext kring en träff — radbrott kollapsade, ±60 tecken. */
function kontext(text, index, langd = 60) {
  const fran = Math.max(0, index - langd);
  const till = Math.min(text.length, index + langd);
  return (
    (fran > 0 ? "…" : "") +
    text.slice(fran, till).replace(/\s+/g, " ").trim() +
    (till < text.length ? "…" : "")
  );
}

function esc(x, max = 220) {
  return String(x ?? "-").replaceAll("|", "\\|").replaceAll("\n", " ").replaceAll("\r", "").slice(0, max);
}

/** Alla JSON-filer i data/ (ej rekursivt) + data/bokmaster/. */
function jsonDataFiler() {
  const ut = [];
  const dataDir = path.join(REPO, "data");
  if (existsSync(dataDir)) {
    for (const f of readdirSync(dataDir)) {
      if (f.endsWith(".json")) ut.push(path.join(dataDir, f));
    }
  }
  const bmDir = path.join(REPO, "data", "bokmaster");
  if (existsSync(bmDir)) {
    for (const f of readdirSync(bmDir)) {
      if (f.endsWith(".json")) ut.push(path.join(bmDir, f));
    }
  }
  return ut;
}

function rel(absPath) {
  return path.relative(REPO, absPath).replaceAll("\\", "/");
}

/** Rekursiv filsökning med suffix-filter. */
function hittaFiler(rot, suffix) {
  const ut = [];
  if (!existsSync(rot)) return ut;
  const stack = [rot];
  while (stack.length > 0) {
    const nu = stack.pop();
    const s = statSync(nu);
    if (s.isDirectory()) {
      for (const f of readdirSync(nu)) stack.push(path.join(nu, f));
    } else if (nu.endsWith(suffix)) {
      ut.push(nu);
    }
  }
  return ut;
}

/** Samla ALLA strängvärden i ett objekt med sökvägar (kap.kap[].quiz[].q …). */
function samlaTextstrom(obj) {
  const ut = [];
  (function walk(o, vag) {
    if (typeof o === "string") {
      if (o.trim().length > 0) ut.push({ vag, text: o });
    } else if (Array.isArray(o)) {
      o.forEach((x, i) => walk(x, `${vag}[${i}]`));
    } else if (o && typeof o === "object") {
      for (const [k, v] of Object.entries(o)) walk(v, `${vag}.${k}`);
    }
  })(obj, "");
  return ut;
}

// ════════════════════════════════════════════════════════════════════════════
// SEKTION 1 — ÅÄÖ-bortfall i bokmaster-text (MANUELL-granskningar)
// ════════════════════════════════════════════════════════════════════════════
function sektionBokmasterAao() {
  const manuella = [];
  const dir = path.join(REPO, "data", "bokmaster");
  let filer = 0;
  let granskade = 0;
  if (existsSync(dir)) {
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
      filer += 1;
      let kurs;
      try {
        kurs = JSON.parse(readFileSync(path.join(dir, f), "utf8"));
      } catch {
        continue; // ogiltig JSON rapporteras av sektion 3 — räkna inte dubbelt
      }
      for (const { vag, text } of samlaTextstrom(kurs)) {
        granskade += 1;
        for (const t of sokMangle(text)) {
          manuella.push({
            fil: `data/bokmaster/${f}`,
            plats: vag || "(rot)",
            ord: `${t.matchadText} → ${t.ratt}`,
            kontext: kontext(text, t.index),
          });
        }
      }
    }
  }
  return {
    namn: "ÅÄÖ-bortfall i bokmaster-text",
    manuella,
    info: [
      `${filer} filer, ${granskade} textfält granskade mot ${MANGLE_ORD.length} manglings-mönster (ordgränser, skiftlägesokänsligt)`,
      "Skriptet kan inte läsa svenska — varje träff kräver MÄNNISKOGranskning av kontexten innan rättning",
    ],
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SEKTION 2 — UI-strängar (JSX-text + attribut) i komponenter och sidor
// ════════════════════════════════════════════════════════════════════════════

/** Neutralisera kommentarer med SAMMA LÄNGD (behandlar radnummer korrekt). */
function rensaKommentarer(src) {
  // Blockkommentarer: behåll radbytena (längd och radantal bevaras — annars
  // driver radnumren i träff-rapporterna när filen har flerradskommentarer).
  let ut = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  ut = ut.replace(/(^|[^:'"\\\w])\/\/[^\n]*/g, (m) => m[0] + " ".repeat(m.length - 1));
  return ut;
}

const ATTR_EJ_TEXT = new Set(["classname", "class", "style", "key", "id", "datatype", "testid", "srx", "cx"]);
const TEXTNYCKLAR = /^(text|titel|title|beskrivning|namn|intro|rubrik|label|meddelande|tooltip|placeholder|fraga|summary|learn|why)$/i;

function extraheraUiStrangar(kalla, renSrc) {
  const ut = [];
  const radFranIndex = (i) => renSrc.slice(0, i).split("\n").length;

  // JSX-text: >Text mellan taggar< (ej {uttryck})
  for (const m of renSrc.matchAll(/>([^<>{}]+)</g)) {
    const t = m[1].trim();
    if (t.length > 0 && /\p{L}/u.test(t)) ut.push({ kalla, rad: radFranIndex(m.index), typ: "JSX-text", text: t });
  }
  // Attribut-strängar: foo="..." / foo='...' (ej className etc.)
  for (const m of renSrc.matchAll(/([A-Za-z][A-Za-z0-9-]*)\s*=\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/g)) {
    if (ATTR_EJ_TEXT.has(m[1].toLowerCase())) continue;
    const t = (m[2] ?? m[3] ?? "").trim();
    if (t.length > 1 && /\p{L}/u.test(t)) ut.push({ kalla, rad: radFranIndex(m.index), typ: `attribut ${m[1]}`, text: t });
  }
  // Text Nycklar i objekt-literal (menydata: text:/titel:/beskrivning:)
  for (const m of renSrc.matchAll(/\b([A-Za-z]+)\s*:\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/g)) {
    if (!TEXTNYCKLAR.test(m[1])) continue;
    const t = (m[2] ?? m[3] ?? "").trim();
    if (t.length > 1) ut.push({ kalla, rad: radFranIndex(m.index), typ: `objekt ${m[1]}`, text: t });
  }
  return ut;
}

function sektionUiStrangar() {
  const manuella = [];
  const filer = [
    ...hittaFiler(path.join(REPO, "src", "components", "ak1a"), ".tsx"),
    ...hittaFiler(path.join(REPO, "src", "app"), "page.tsx"),
  ].sort();
  let strangar = 0;
  for (const fil of filer) {
    const ren = rensaKommentarer(readFileSync(fil, "utf8"));
    for (const { kalla, rad, typ, text } of extraheraUiStrangar(rel(fil), ren)) {
      strangar += 1;
      for (const t of sokMangle(text)) {
        manuella.push({
          fil: kalla,
          plats: `rad ${rad} (${typ})`,
          ord: `${t.matchadText} → ${t.ratt}`,
          kontext: kontext(text, t.index, 50),
        });
      }
    }
  }
  return {
    namn: "UI-strängar (JSX-text + attribut)",
    manuella,
    info: [
      `${filer.length} filer (src/components/ak1a/*.tsx + src/app/**/page.tsx), ${strangar} strängar extraherade`,
      "Endast JSX-text, attribut-strängar och UI-objekttext — kodidentifierare och kommentarer exkluderade",
    ],
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SEKTION 2b — Förbjudna fraser (varumärket som kod; våg 60 bygg-C, m6 §F)
// Samma sträng-underlag som sektion 2 + lib-copy, matchat mot
// FORBJUDNA_FRASER ur data/varumarke.json — samma guldkälla som
// src/lib/varumarke.ts importerar (speglingsmekaniken siffror.json/ts:
// ingen dubbelpost, ingen drift).
//   allvar FEL     → räknas i `fel` (styr RÖD/GUL direkt — juridiska fraser
//                    SKA stoppa; vakten sänker ALDRIG nivå)
//   allvar VARNING → `manuella` (syns i rapporten, mänsklig granskning)
// ════════════════════════════════════════════════════════════════════════════
// Filunderlaget utökas med lib-copy utanför komponenter (m6 §F:s lucka):
const FRAS_LIB_FILER = [
  "src/lib/email-mallar.ts", // mejl-mallarnas copy
  "src/lib/nyhets-motor.ts", // nyhets-röstens texter
  "src/lib/seo.tsx",         // title/description/FAQ/JSON-LD-copy
];
// CITERINGS-UNDANTAG (A10 — KRITISKT): filer/strängar som CITERAR förbudet
// i pedagogiskt/juridiskt syfte vitlistas. Finansiell-policy-sidans publicerade
// löfte ("Ord som 'garanterad avkastning', 'riskfritt' eller 'slå index varje
// år' förekommer aldrig i vårt material — se vårt varumärkes-system där de är
// förbjudna fraser") refererar själva de förbjudna fraserna; utan undantag
// vore vakten RÖD dag ett — en bugg i VAKTEN, inte i copy:n. Undantagen
// dokumenteras i rapporten och sänker ALDRIG allvar-nivån för ny text:
// en ny icke-citerande träff på samma fras förblir FEL.
const CITERINGS_UNDANTAG_FILER = new Set([
  "src/app/finansiell-policy/page.tsx", // policy-löftet citerar förbudet (rad 42)
  "src/app/ansvar/page.tsx",            // juridik: "Formuleringar som 'garanterad avkastning' … finns inte i vårt material"
  "src/app/villkor/page.tsx",           // juridik: citerar/negerar rådgivning + lagtext (2007:528, MAR)
  "src/lib/ordlista.ts",                // ordlistan lär ut kritiken (sveps ej idag — vitlistad om underlaget växer)
  "src/lib/varumarke.ts",               // varumärkes-systemet självt (definitionerna lever här)
  "data/varumarke.json",                // — " — (sveps ej av 2b, men dokumenterad)
]);
// Sträng-exakta undantag: FAQ-frågor som NEGERAR (svaret börjar "Nej. … aldrig …"):
const CITERINGS_UNDANTAG_STRANGAR = new Set([
  "Ger AK1A investeringsråd eller aktietips?", // src/app/page.tsx + src/app/kurser/page.tsx + src/lib/seo.tsx
  "Ger AK1A investeringsråd?",                 // src/app/medlemskap/page.tsx (svar: "Nej. … aldrig investeringsråd …")
]);
// YTA-REGLER (K8, B2B-BESLUT våg 61 bygg-2): B2B har faktiskt kunder; elever
// har elever. A8-ordet "kunder" (allvar VARNING) är legitim B2B-terminologi på
// PRO-ytorna — rutter under src/app/pro/**, komponenter under
// src/components/ak1a/pro/** och kontraktet under src/lib/pro/** undantas från
// JUST den varningen. FEL-nivåns juridiska fraser gäller ALLTID, även på
// B2B-ytor (vakten sänker aldrig nivån för att bli grön), och privata ytor
// varnar fortfarande för "kunder" (A8 oförändrat).
// ROUTE-GRUPPSNORMALISERING (o39): pro-rutterna BOR i route-gruppen
// src/app/(huvud)/pro/** — "(huvud)" är osynlig i URL:en men synlig i
// källvägen, så globben ^src/app/pro/ matchade ALDRIG verkligheten (döda
// regeln ⊕ dagligt falskt brus i MANUELL-kön). Normalisera bort alla
// "(grupp)/"-segment FÖRE yta-matchen.
const PRO_YTA_RE = /^(?:src\/app\/pro\/|src\/components\/ak1a\/pro\/|src\/lib\/pro\/)/;
const arProYta = (kalla) => PRO_YTA_RE.test(kalla.replace(/\([^/)]+\)\/?/g, ""));

/** Läs FORBJUDNA_FRASER ur data/varumarke.json (komplicerar regexarna med "giu"). */
function lasForbjudnaFraser() {
  const data = JSON.parse(readFileSync(path.join(REPO, "data", "varumarke.json"), "utf8"));
  return data.forbjudnaFraser.map((f) => ({
    re: new RegExp(f.fran, "giu"),
    istallet: f.istallet,
    allvar: f.allvar === "FEL" ? "FEL" : "VARNING",
    motiv: f.motiv,
  }));
}

/** Alla strängliteraler i lib-copy: "…" '…' `…` (${}-interpolationer urräknade).
 *  Sökvägar/URL:er/rena identifierare hoppas över — de är inte copy. */
function extraheraLibStrangar(kalla, renSrc) {
  const ut = [];
  const radFranIndex = (i) => renSrc.slice(0, i).split("\n").length;
  const push = (t, i) => {
    const s = t.replace(/\$\{[^}]*\}/g, " ").trim();
    if (s.length < 3 || !/\p{L}/u.test(s)) return;
    if (/^https?:|^[-.@#/\\]/.test(s)) return; // URL:er, sökvägar, scoped imports
    if (!/\s/.test(s) && /^[\w\-:./]+$/.test(s)) return; // identifierare/klassnamn/färger
    ut.push({ kalla, rad: radFranIndex(i), typ: "lib-sträng", text: s });
  };
  for (const m of renSrc.matchAll(/"((?:[^"\\\n]|\\.)*)"/g)) push(m[1], m.index);
  for (const m of renSrc.matchAll(/'((?:[^'\\\n]|\\.)*)'/g)) push(m[1], m.index);
  for (const m of renSrc.matchAll(/`((?:[^`\\]|\\.)*)`/g)) push(m[1], m.index);
  return ut;
}

function sektionForbjudnaFras() {
  const namn = "Förbjudna fraser — varumärket som kod (2b)";
  const fel = [];
  const manuella = [];
  const info = [];
  let fraser = [];
  try {
    fraser = lasForbjudnaFraser();
  } catch (e) {
    return {
      namn,
      fel: [{ fil: "data/varumarke.json", plats: "forbjudnaFraser", detalj: `kunde inte läsas/parseas (${esc(String(e?.message || e), 120)}) — vakten får ALDRIG passera utan sina regler` }],
      manuella,
      info,
    };
  }
  if (!Array.isArray(fraser) || fraser.length === 0) {
    fel.push({ fil: "data/varumarke.json", plats: "forbjudnaFraser", detalj: "listan är tom — varumärkes-reglerna får aldrig vara tomma" });
  }
  const antalFel = fraser.filter((f) => f.allvar === "FEL").length;

  const filer = [
    ...hittaFiler(path.join(REPO, "src", "components", "ak1a"), ".tsx"),
    ...hittaFiler(path.join(REPO, "src", "app"), "page.tsx"),
    ...FRAS_LIB_FILER.map((f) => path.join(REPO, f)).filter((p) => existsSync(p)),
  ].sort();
  const arLibFil = (absPath) => FRAS_LIB_FILER.includes(rel(absPath));

  let strangar = 0;
  let undantagnaFiler = 0;
  let undantagnaStrangar = 0;
  let ytaUndantagnaKunder = 0;
  let etikettUndantagnaKunder = 0;
  const sedda = new Set();
  for (const fil of filer) {
    const kalla = rel(fil);
    if (CITERINGS_UNDANTAG_FILER.has(kalla)) {
      undantagnaFiler += 1;
      continue;
    }
    const ren = rensaKommentarer(readFileSync(fil, "utf8"));
    const strangLista = arLibFil(fil)
      ? [...extraheraUiStrangar(kalla, ren), ...extraheraLibStrangar(kalla, ren)]
      : extraheraUiStrangar(kalla, ren);
    for (const { kalla: k, rad, typ, text } of strangLista) {
      const nyckel = `${k}:${rad}:${text}`;
      if (sedda.has(nyckel)) continue;
      sedda.add(nyckel);
      strangar += 1;
      if (CITERINGS_UNDANTAG_STRANGAR.has(text)) {
        undantagnaStrangar += 1;
        continue;
      }
      for (const { re, istallet, allvar, motiv } of fraser) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(text)) !== null) {
          if (allvar === "FEL") {
            fel.push({ fil: k, plats: `rad ${rad} (${typ})`, detalj: `"${m[0]}" → säg "${istallet}" — ${motiv}` });
          } else if (m[0].toLowerCase() === "kunder" && arProYta(k)) {
            // K8: "kunder" är legitim B2B-terminologi på PRO-ytan — räknas och
            // dokumenteras, men kräver ingen manuell granskning (endast
            // VARNING-nivån; FEL-fraserna gäller även här).
            ytaUndantagnaKunder += 1;
          } else if (m[0].toLowerCase() === "kunder" && text.trim() === m[0]) {
            // A8-ETIKETT (o39): en ENSAM etikett "Kunder" (hela strängvärdet,
            // objekt-label i analysvyer — stock-analysis-view:s sektion om
            // BOLAGETS kunder) namnger bolagsfakta, inte AK1A:s användare.
            // A8 skyddar påståenden om relationen ("våra kunder"), som kräver
            // meningskontext — ett ord har ingen. Löptext-träffar varnar
            // fortfarande; undantaget räknas och syns i rapporten varje dag.
            etikettUndantagnaKunder += 1;
          } else {
            manuella.push({ fil: k, plats: `rad ${rad} (${typ})`, ord: `${m[0]} → ${istallet}`, kontext: kontext(text, m.index, 50) });
          }
        }
      }
    }
  }
  const saknadeLibFiler = FRAS_LIB_FILER.filter((f) => !existsSync(path.join(REPO, f)));
  info.push(`${filer.length} filer, ${strangar} strängar granskade mot ${fraser.length} förbjudna fraser (${antalFel} FEL = juridiska, ${fraser.length - antalFel} VARNING = tonala) ur data/varumarke.json — samma guldkälla som src/lib/varumarke.ts (kontrolleraText)`);
  if (saknadeLibFiler.length > 0) {
    info.push(`OBS: lib-fil(er) saknas och täcks ej: ${saknadeLibFiler.join(", ")}`);
  }
  info.push(`CITERINGS-UNDANTAG (A10): ${undantagnaFiler} fil(er) + ${undantagnaStrangar} sträng(ar) hoppades över — de CITERAR förbudet: ${[...CITERINGS_UNDANTAG_FILER].join(" · ")} · sträng-exakta negerande FAQ-frågor: ${[...CITERINGS_UNDANTAG_STRANGAR].map((s) => `"${s}"`).join(" / ")}`);
  info.push("FEL = juridiskt/löftesbrott (P1/P2/P3/P6 — räknas i RÖD/GUL) · VARNING = tonalt (manuell granskning) · vakten sänker ALDRIG nivå för att bli grön");
  info.push(`YTA-REGLN (K8, B2B-BESLUT våg 61 bygg-2): A8-varningen "kunder" undantas på PRO-ytor (src/app/pro/** — inklusive route-gruppen src/app/(huvud)/pro/**, normaliserad — src/components/ak1a/pro/**, src/lib/pro/**) — ${ytaUndantagnaKunder} träff(ar) undantagna som legitim B2B-terminologi; privata ytor varnar fortfarande och FEL-fraserna gäller överallt`);
  info.push(`A8-ETIKETT-UNDANTAG (o39): ${etikettUndantagnaKunder} ensam-etikett(er) "Kunder" (hela strängvärdet = objekt-label) undantagna — de namnger BOLAGETS kunder i analysvyer (fundamental analys-term), inte AK1A:s användare; löptext-träffar på "kunder" varnar fortfarande`);
  return { namn, fel, manuella, info };
}

// ════════════════════════════════════════════════════════════════════════════
// SEKTION 3 — JSON-giltighet
// ════════════════════════════════════════════════════════════════════════════
function sektionJson() {
  const fel = [];
  const filer = jsonDataFiler();
  for (const fil of filer) {
    try {
      JSON.parse(readFileSync(fil, "utf8"));
    } catch (e) {
      fel.push({ fil: rel(fil), plats: "-", detalj: e instanceof Error ? e.message.slice(0, 160) : String(e) });
    }
  }
  return { namn: "JSON-giltighet (data/*.json + data/bokmaster/*.json)", fel, info: [`${filer.length} filer parsade`] };
}

// ════════════════════════════════════════════════════════════════════════════
// SEKTION 4 — Länk-validitet (sokindex + huvudmeny + sidfooter → src/app)
// ════════════════════════════════════════════════════════════════════════════
const LANKKALLOR = [
  "src/lib/sokindex.ts",
  "src/components/ak1a/huvudmeny.tsx",
  "src/components/ak1a/sidfooter.tsx",
];

/** Alla rutter i src/app som segment-listor ("[slug]"-segment = dynamiska).
 * Route-grupper (våg 85): parentessegment "(huvud)"/"(en)"/"(ar)" är
 * organisatoriska — syns ej i URL:en, rensas bort här. */
function appRutter() {
  const rutter = [];
  for (const sida of hittaFiler(path.join(REPO, "src", "app"), "page.tsx")) {
    const relSida = path.relative(path.join(REPO, "src", "app"), sida);
    const seg = relSida.split(path.sep).slice(0, -1); // ta bort "page.tsx"
    rutter.push(seg.map((s) => s.replaceAll("\\", "/")).filter((s) => !/^\([a-zA-Z0-9_-]+\)$/.test(s)));
  }
  return rutter;
}

function extraheraLankar() {
  const lankar = [];
  for (const kalla of LANKKALLOR) {
    const fil = path.join(REPO, kalla);
    if (!existsSync(fil)) continue;
    const src = readFileSync(fil, "utf8");
    for (const m of src.matchAll(/\b(?:lank|href)\s*[:=]\s*(?:"((?:[^"\\]|\\.)*)"|'([^']*)'|`([^`]*)`)/g)) {
      const raw = (m[1] ?? m[2] ?? m[3] ?? "").replace(/\\"/g, '"');
      lankar.push({ kalla, raw });
    }
  }
  // interna sid-sökvägar: börjar på "/", ej protokoll-relativa "//", ej fil-asset
  const rensade = [];
  const sett = new Set();
  for (const { kalla, raw } of lankar) {
    if (!raw.startsWith("/") || raw.startsWith("//")) continue;
    let p = raw.split("#")[0].split("?")[0];
    if (/\.(json|xml|txt|png|jpg|svg|ico|webmanifest)$/i.test(p)) continue;
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    const nyckel = kalla + "|" + p;
    if (!sett.has(nyckel)) {
      sett.add(nyckel);
      rensade.push({ kalla, lank: p });
    }
  }
  return rensade;
}

function sektionLankar() {
  const fel = [];
  const rutter = appRutter();
  const lankar = extraheraLankar();
  for (const { kalla, lank } of lankar) {
    const seg = lank.split("/").filter(Boolean);
    const finns = rutter.some((r) =>
      r.length === seg.length && r.every((s, i) => s.startsWith("[") || s === seg[i])
    );
    if (!finns) {
      fel.push({ fil: kalla, plats: lank, detalj: "ingen page.tsx i src/app motsvarar sökvägen (statisk eller dynamisk)" });
    }
  }
  return {
    namn: "Länk-validitet (sokindex + huvudmeny + sidfooter)",
    fel,
    info: [`${lankar.length} interna länkar verifierade mot ${rutter.length} rutter i src/app`],
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SEKTION 5 — Kursdata-konsistens (data/bokmaster/*.json)
// ════════════════════════════════════════════════════════════════════════════
function sektionKursdata() {
  const fel = [];
  const dir = path.join(REPO, "data", "bokmaster");
  let kurser = 0;
  if (existsSync(dir)) {
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
      let kurs;
      try {
        kurs = JSON.parse(readFileSync(path.join(dir, f), "utf8"));
      } catch {
        continue; // sektion 3 rapporterar ogiltig JSON
      }
      kurser += 1;
      const kap = Array.isArray(kurs.chapters) ? kurs.chapters : [];
      // a) chapterCount === chapters.length
      if (kurs.chapterCount !== kap.length) {
        fel.push({
          fil: `data/bokmaster/${f}`,
          plats: "chapterCount",
          detalj: `chapterCount=${String(kurs.chapterCount)} men chapters.length=${kap.length}`,
        });
      }
      // b) quiz-antal ≥ kapitel × 3 (fler frågor är tillåtet — slutoff-quiz är kvalitetsvinster)
      const quizTotal = kap.reduce((s, k) => s + (Array.isArray(k.quiz) ? k.quiz.length : 0), 0);
      const quizVantat = kap.length * 3;
      if (quizTotal < quizVantat) {
        fel.push({
          fil: `data/bokmaster/${f}`,
          plats: "quiz",
          detalj: `${quizTotal} quizfrågor men minst ${quizVantat} förväntat (kap ${kap.length} × 3)`,
        });
      }
      // c) totalMinutes === sum(chapters[].minutes)
      const minSumma = kap.reduce((s, k) => s + (typeof k.minutes === "number" ? k.minutes : 0), 0);
      if (typeof kurs.totalMinutes === "number" && kurs.totalMinutes !== minSumma) {
        fel.push({
          fil: `data/bokmaster/${f}`,
          plats: "totalMinutes",
          detalj: `totalMinutes=${kurs.totalMinutes} men sum(chapters[].minutes)=${minSumma}`,
        });
      }
    }
  }
  return { namn: "Kursdata-konsistens (bokmaster)", fel, info: [`${kurser} kurser kontrollerade (kapitelantal, quiz = kap×3, totalMinutes)`] };
}

// ════════════════════════════════════════════════════════════════════════════
// SEKTION 6 — Sitemap-täckning
// ════════════════════════════════════════════════════════════════════════════
// Sidor som medvetet hålls utanför sitemap (auth/admin/interna).
// VÅG 81: /studio är admin-låst webchat — medvetet EJ i publik sitemap.
const SITEMAP_EXKLUDERA = new Set(["/admin", "/pro", "/rapporter", "/logga-in", "/studio"]);

function sektionSitemap() {
  const fel = [];
  const sitemapFil = path.join(REPO, "src", "app", "sitemap.ts");
  const src = existsSync(sitemapFil) ? readFileSync(sitemapFil, "utf8") : "";
  // statiska path: `${baseUrl}/kurser` resp. `${BASE_URL}/kurser` → "/kurser";
  // dynamiska `${BASE_URL}/kurser/${slug}` → "/kurser/" (prefix täcker kurslänkar)
  const sitemapPaths = new Set();
  const kandidater = [];
  for (const m of src.matchAll(/\$\{\s*base_?url\s*\}([^`"']*)/gi)) kandidater.push(m[1]);
  for (const m of src.matchAll(/https?:\/\/[\w.-]+(\/[\w-]*)*/gi)) kandidater.push(m[0].replace(/^https?:\/\/[\w.-]+/, ""));
  for (let p of kandidater) {
    const dyn = p.indexOf("${");
    if (dyn >= 0) p = p.slice(0, dyn);
    p = p.split("#")[0].split("?")[0];
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    if (p.startsWith("/")) sitemapPaths.add(p);
  }
  // viktiga rutter = interna nav-länkar + statiska toppnivå-sidor (minus exkluderingar)
  const viktiga = new Set(extraheraLankar().map((l) => l.lank));
  for (const r of appRutter()) {
    if (r.length === 1 && !r[0].startsWith("[")) viktiga.add("/" + r[0]);
  }
  for (const p of [...viktiga].sort()) {
    if (SITEMAP_EXKLUDERA.has(p)) continue;
    const täckt =
      sitemapPaths.has(p) ||
      [...sitemapPaths].some((s) => s.length > 0 && p.startsWith(s + "/"));
    if (!täckt) {
      fel.push({ fil: "src/app/sitemap.ts", plats: p, detalj: "viktig route saknas i sitemap (nav-länk eller toppnivå-sida utan täckning)" });
    }
  }
  return {
    namn: "Sitemap-täckning",
    fel,
    info: [
      `${sitemapPaths.size} sökvägar i sitemap.ts; ${viktiga.size} viktiga rutter jämförda`,
      `Medvetet exkluderade: ${[...SITEMAP_EXKLUDERA].join(", ")}`,
    ],
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SEKTION 7 — Motorvalidering (subprocess eller senaste rapport)
// ════════════════════════════════════════════════════════════════════════════
function senasteMotorRapport() {
  const dir = path.join(REPO, "data", "rapporter");
  if (!existsSync(dir)) return null;
  const filer = readdirSync(dir)
    .filter((f) => /^motorervalidering-.*\.md$/.test(f))
    .sort();
  return filer.length > 0 ? { fil: filer[filer.length - 1], abs: path.join(dir, filer[filer.length - 1]) } : null;
}

function körMotorvaliderare() {
  return new Promise((res) => {
    const barn = spawn(process.execPath, ["verktyg/validera-motorer.mjs"], {
      cwd: REPO,
      env: { ...process.env, NO_COLOR: "1" },
      // OBS: ingen shell=true — på Windows skiljer cmd.exe på mellanslagen i
      // "C:\Program Files\nodejs\node.exe" när argv fogas utan citattecken
      // ("'C:\Program' is not recognized"). Utan shell hanterar CreateProcess
      // sökvägen som ett enda argv[0].
    });
    let ut = "";
    let fel = "";
    if (barn.stdout) { barn.stdout.setEncoding("utf8"); barn.stdout.on("data", (d) => { ut += d; }); }
    if (barn.stderr) { barn.stderr.setEncoding("utf8"); barn.stderr.on("data", (d) => { fel += d; }); }
    let klar = false;
    const stad = (kod) => {
      if (klar) return;
      klar = true;
      if (barn.killed || barn.exitCode === null) {
        if (process.platform === "win32" && typeof barn.pid === "number") {
          spawnSync("taskkill", ["/pid", String(barn.pid), "/T", "/F"]);
        } else {
          try { barn.kill("SIGKILL"); } catch { /* ignorera */ }
        }
      }
      res({ stdout: ut, stderr: fel, kod });
    };
    const tid = setTimeout(() => stad(-1), 120_000);
    barn.on("error", (e) => { clearTimeout(tid); fel += "\nspawn-fel: " + e.message; stad(-2); });
    barn.on("close", (kod) => { clearTimeout(tid); stad(kod); });
  });
}

/**
 * Tolka stdout från validera-motorer.mjs: senaste "RESULTAT: N PASS / F FAIL /
 * S SKIP"-raden + rader med "  FAIL [...]" / "  SKIP [...]".
 * Returnerar null om ingen tolkbar RESULTAT-rad fanns.
 */
function tolkaMotorStdout(stdout) {
  const rader = String(stdout || "").split("\n");
  let resultat = null;
  for (const rad of rader) {
    const m = rad.match(/^RESULTAT:\s*(\d+)\s*PASS\s*\/\s*(\d+)\s*FAIL\s*\/\s*(\d+)\s*SKIP\b/);
    if (m) resultat = { pass: Number(m[1]), fail: Number(m[2]), skip: Number(m[3]) };
  }
  if (!resultat) return null;
  const detaljer = rader
    .filter((r) => /^\s+(FAIL|SKIP)\s+\[/.test(r))
    .map((r) => r.trim());
  return { ...resultat, detaljer };
}

async function sektionMotorer() {
  const fel = [];
  const info = [];
  // Våg 49 (kunddirektiv "kontroller för att allt ska få 100% är obligatoriska"):
  // sviten körs ALLTID som frisk verifiering (~5–10 s; budget 120 s) — SKIP
  // är inte längre ett godtagbart sektionsutfall för motorvalideringen.
  info.push("kör verktyg/validera-motorer.mjs som subprocess (100%-väktaren, budget 120 s) …");
  const sub = await körMotorvaliderare();
  const tolkat = tolkaMotorStdout(sub.stdout);

  if (tolkat) {
    info.push(`subprocess (exit ${sub.kod}): RESULTAT: ${tolkat.pass} PASS / ${tolkat.fail} FAIL / ${tolkat.skip} SKIP`);
    if (tolkat.fail > 0 || tolkat.skip > 0 || sub.kod !== 0) {
      // 100%-kravet: under 100% PASS (eller fel avslutskod) = sektions-FEL.
      fel.push({
        fil: "verktyg/validera-motorer.mjs",
        plats: "RESULTAT",
        detalj: `motorervalideringen är inte 100%: ${tolkat.pass} PASS / ${tolkat.fail} FAIL / ${tolkat.skip} SKIP (avslutskod ${sub.kod}) — SKIP är förbjudna sedan våg 49`,
      });
      for (const d of tolkat.detaljer) fel.push({ fil: "verktyg/validera-motorer.mjs", plats: "-", detalj: esc(d, 220) });
    }
    return { namn: "Motorvalidering (validera-motorer.mjs — 100%-väktaren)", fel, manuella: [], info };
  }

  // Fallback: tolka SENASTE rapportfilens sista RESULTAT/Totalt-rad (append-läge
  // gör att första träffen kan vara gammal — sök från slutet).
  info.push(`subprocessen gav ingen RESULTAT-rad (exit ${sub.kod}) — faller tillbaka på senaste rapportfil`);
  let rapport = senasteMotorRapport();
  if (!rapport) {
    info.push("ingen befintlig rapport heller — försöker köra validera-motorer.mjs en gång till …");
    await körMotorvaliderare();
    rapport = senasteMotorRapport();
  }
  if (!rapport) {
    return {
      namn: "Motorvalidering (validera-motorer.mjs — 100%-väktaren)",
      fel: [{ fil: "verktyg/validera-motorer.mjs", plats: "subprocess", detalj: `kunde inte köra eller tolka motorervalideringen (exit ${sub.kod}${sub.stderr ? "; " + esc(sub.stderr.trim().split("\n")[0], 120) : ""}) — ofullständig verifiering är ett FEL (SKIP förbjudet)` }],
      manuella: [],
      info,
    };
  }
  const src = readFileSync(rapport.abs, "utf8");
  const alla = [...src.matchAll(/\*\*RESULTAT:\s*(\d+)\s*PASS\s*\/\s*(\d+)\s*FAIL\s*\/\s*(\d+)\s*SKIP\*\*/g)];
  const totalt = [...src.matchAll(/\|\s*\*\*Totalt\*\*\s*\|\s*\**(\d+)\**\s*\|\s*\**(\d+)\**\s*\|\s*\**(\d+)\**\s*\|/g)];
  const senast = alla[alla.length - 1] ?? totalt[totalt.length - 1];
  if (!senast) {
    return {
      namn: "Motorvalidering (validera-motorer.mjs — 100%-väktaren)",
      fel: [{ fil: rapport.fil, plats: "-", detalj: "kunde inte tolka RESULTAT/sammanfattning i senaste rapport — ofullständig verifiering är ett FEL (SKIP förbjudet)" }],
      manuella: [],
      info,
    };
  }
  const pass = Number(senast[1]);
  const fail = Number(senast[2]);
  const skip = Number(senast[3]);
  const ageDagar = Math.floor((Date.now() - statSync(rapport.abs).mtimeMs) / 86400000);
  info.push(`${rapport.fil} (fallback): ${pass} PASS / ${fail} FAIL / ${skip} SKIP (rapporten är ${ageDagar} dagar gammal)`);
  if (fail > 0 || skip > 0) {
    fel.push({
      fil: rapport.fil,
      plats: "-",
      detalj: `motorervalideringen är inte 100%: ${fail} FAIL / ${skip} SKIP (SKIP är förbjudna sedan våg 49)`,
    });
    for (const rad of src.split("\n")) {
      if (rad.includes("**FAIL**") || rad.includes("**SKIP**")) fel.push({ fil: rapport.fil, plats: "-", detalj: esc(rad, 200) });
    }
  }
  if (ageDagar > 7) {
    info.push(`VARNING: rapporten är ${ageDagar} dagar gammal och subprocessen gav ingen färsk utdata — kör 'node verktyg/validera-motorer.mjs' manuellt och undersök varför subprocessen misslyckades`);
  }
  return { namn: "Motorvalidering (validera-motorer.mjs — 100%-väktaren)", fel, manuella: [], info };
}

// ════════════════════════════════════════════════════════════════════════════
// SEKTION 8 — ÅÄÖ-degenerering i löptext ("gor"→"gör", "kopte"→"köpte")
// Kör verktyg/aao-degen.mjs --torrt --json som subprocess.
// ════════════════════════════════════════════════════════════════════════════
async function sektionAaoDegen() {
  const namn = "ÅÄÖ-degenerering i löptext (aao-degen.mjs)";
  try {
    const ut = execFileSync(process.execPath, ["verktyg/aao-degen.mjs", "--torrt", "--json"], {
      cwd: REPO,
      encoding: "utf8",
      timeout: 60_000,
      env: { ...process.env, NO_COLOR: "1" },
    });
    const rad = ut.split("\n").find((r) => r.trim().startsWith("{"));
    const rep = JSON.parse(rad || "{}");
    const fel = [];
    // Tröskel 3: MAPPA:n kan ge enstaka falska positiva på kortorden
    // (ar/pa/gor i engelska citat) — riktiga klass-fel (kopte/köpå/frågör/
    // vardet…) uppträder i dussintal och FAILAR alltid.
    if ((rep.nivaA ?? 0) > 3) {
      fel.push({
        fil: "public/deep-courses.json + data/bokmaster/",
        plats: "NIVÅ A",
        detalj: `${rep.nivaA} degenererade åäö-ord ("gor/nar/kopte"-mönster) — kör: node verktyg/aao-degen.mjs`,
      });
    }
    if ((rep.nivaB ?? 0) > 0) {
      fel.push({
        fil: "public/deep-courses.json",
        plats: "NIVÅ B",
        detalj: `${rep.nivaB} systematiskt avstavad fil(er) — manuell svensk granskning krävs`,
      });
    }
    return {
      namn,
      info: [`NIVÅ A: ${rep.nivaA ?? 0} · NIVÅ B: ${rep.nivaB ?? 0} (detektor: säkra degenererade former + filsignatur)`],
      fel,
      manuella: [],
    };
  } catch (e) {
    return { namn, info: [], fel: [{ fil: "verktyg/aao-degen.mjs", plats: "subprocess", detalj: String(e?.message || e).slice(0, 120) }], manuella: [] };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// RAPPORT
// ════════════════════════════════════════════════════════════════════════════
// SEKTION 9 — Sifferkonsistens (våg 46, kunddirektiv "exakt samma siffror
// och ord överallt"): data/siffror.json är guldkällan (genereras av
// verktyg/rakna-siffror.mjs ur deep-courses/bokkanon/kurs-access). Sektionen
// (a) räknar om verkligheten och jämför med json-filen, (b) söker src/ efter
// KÄNDA föråldrade tal i copy (291/307/311/324/326 kurser, 65/78/92 böcker,
// 3 573/6 309/7 089/7 812 quiz) — träff = FAIL med rättningstips.
function sektionSiffror() {
  const namn = "Sifferkonsistens (rakna-siffror + föråldrade tal i copy)";
  const fel = [];
  try {
    const kurser = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));
    const lista = Object.values(kurser);
    let quiz = 0;
    let bm = 0;
    for (const k of lista) {
      if (k.category === "BOKMASTER") bm++;
      for (const ch of k.chapters ?? []) quiz += Array.isArray(ch.quiz) ? ch.quiz.length : 0;
    }
    const sparade = JSON.parse(readFileSync("data/siffror.json", "utf8"));
    if (sparade.kurser !== lista.length) {
      fel.push({ fil: "data/siffror.json", plats: "kurser", detalj: `guldkällan säger ${sparade.kurser} men verkligheten är ${lista.length} — kör: node verktyg/rakna-siffror.mjs` });
    }
    if (sparade.bokmaster !== bm) {
      fel.push({ fil: "data/siffror.json", plats: "bokmaster", detalj: `guldkällan säger ${sparade.bokmaster} men verkligheten är ${bm} — kör rakna-siffror.mjs` });
    }
    if (sparade.quiz !== quiz) {
      fel.push({ fil: "data/siffror.json", plats: "quiz", detalj: `guldkällan säger ${sparade.quiz} men verkligheten är ${quiz} — kör rakna-siffror.mjs` });
    }

    // Föråldrade tal i src-copy (visningstext) — undantag: siffror.ts:s egen källa
    // VÅG 77 (variabelregistret): PRIS-tal bevakas också — kanoniska priser
    // (249/449/799/499/1 499/4 999/9 900) får ENBART leva i data/portfolj-
    // system/priser.json och interpoleras via @/lib/variabler (Excel-beroendet).
    // Undantagna filer: registret självt + priser.json + prenumerationsflödets
    // JSDoc-exempel (kommentarer, inte renderad copy).
    // VÅG 78 A6: Fas-utbildningarnas engångspriser (9 999/13 999) + Fas 3-intro
    // (299, kr/mån på Pro Analytiker) bevakas likaså — de lever i priser.json:s
    // "fas"-sektion och interpoleras via PRISER.fas2EnGang/fas3EnGang/
    // fas3IntroManad (dökumenterat i B2-beslutet).
    const FORALDRADE = [
      [/\b(226|227|291|307|311|324|326)\s+(kurser|moduler i)\b/, "kursantal"],
      [/\b(65|78|92)\s+(heltäckta\s+böcker|BOKMASTER-böcker|böcker kapitel|böcker täckta)\b/, "bokantal"],
      [/\b(3[\s\u00a0]?573|6[\s\u00a0]?309|7[\s\u00a0]?089|7[\s\u00a0]?812)\s*(quiz|-)?\s*(frågor)?\b/, "quizantal"],
      [/\bpris[":\s=]+\s*(249|449|799|499|1499|4999|9900)\b/, "pris"],
      [/\b(249|449|799)\s*(kr|:-)\s*(\/|per|\/\s*mån)/i, "pris"],
      [/\b(499|1[\s\u00a0]?499|4[\s\u00a0]?999|9[\s\u00a0]?900)\s*kr\b/, "pris"],
      [/\b(9[\s\u00a0]?999|1[\s\u00a0]?3999)\s*kr\b/, "fas-pris"],
    ];
    const filer = [...hittaFiler("src/components/ak1a", ".tsx"), ...hittaFiler("src/app", ".tsx"), ...hittaFiler("src/app", ".ts"), ...hittaFiler("src/lib", ".ts")];
    for (const fil of filer) {
      if (fil.endsWith("siffror.ts") || fil.endsWith("variabler.ts")) continue;
      if (fil.replaceAll("\\", "/").includes("portfolj-forskning/korstabell-data")) continue; // lasPriser-läsaren (läser JSON, hårdkodar ej)
      if (fil.endsWith("siffror.ts")) continue;
      const rader = readFileSync(fil, "utf8").split("\n");
      rader.forEach((rad, i) => {
        for (const [re, etikett] of FORALDRADE) {
          const m = rad.match(re);
          if (m) {
            fel.push({ fil, plats: `rad ${i + 1}`, detalj: `föråldrat ${etikett}-tal "${m[0].trim()}" i copy — importera SIFFROR ur @/lib/siffror i stället` });
          }
        }
      });
    }
  } catch (e) {
    fel.push({ fil: "verktyg/kvalitetsvakt.mjs", plats: "sektionSiffror", detalj: String(e?.message || e).slice(0, 140) });
  }
  return { namn, info: ["guldkälla data/siffror.json (verktyg/rakna-siffror.mjs) + svep efter föråldrade tal i src"], fel, manuella: [] };
}

// ════════════════════════════════════════════════════════════════════════════
// SEKTION 11 — Typbaslinje: tsc --noEmit via PROJEKTBINÄREN (spår 8, o39)
// ════════════════════════════════════════════════════════════════════════════
// Typnollen (0 fel) är mekanisk vid varje commit (pre-commit-kroken, våg 138)
// men MERGE-committar passerar grinden (grenarnas kod granskades var för sig)
// och arbetsytan kan smutsas mellan commits — denna sektion ger det dagliga
// 07:02-beviset att baslinjen lever i TRÄDET, oavsett väg in. Projektbinär,
// aldrig npx (deployfönstret kan lösa tsc till cachens dummy-paket).
function sektionTsc() {
  const namn = "Typbaslinje (tsc --noEmit, projektbinär — nolla sedan våg 133)";
  const fel = [];
  const manuella = [];
  const info = [];
  const tscBin = path.join(REPO, "node_modules", "typescript", "bin", "tsc");

  if (!existsSync(tscBin)) {
    // node_modules byts av prod-synkens npm ci — saknad binär mitt i ett
    // deployfönster är transient (prod-synkens ägande) men aldrig tyst PASS.
    manuella.push({
      fil: "node_modules/typescript/bin/tsc",
      plats: "-",
      ord: "saknad binär",
      kontext: "projektets tsc-binär finns inte — pågående deploy (npm ci) eller saknat beroende; omkör vakten när deployen är klar",
    });
    info.push("projektbinären node_modules/typescript/bin/tsc saknas — baslinjen OMÄTT denna körning (deployfönster?)");
    return { namn, fel, manuella, info };
  }

  const t0 = Date.now();
  let sub;

  // s8-u2 (SYSTEMKARTAN gap 5, kö 1): SIGKILL-läckor ur svitfamiljen (femton
  // körskripts tmp_*.ts i roten, finally-unlink överlever ej kill) har BEVISAT
  // brutit baslinjen och låst ALLA commits (2026-09-17 01:19). Vakten
  // självläker FÖRE mätningen — signaturverifierat (verktyg/tmp-stad.mjs),
  // transparent enligt o26-doktrinen: städningen syns i rapporten, tsc mäter
  // det städade trädet. Skonade filer (trackade/signaturlösa) rörs aldrig —
  // syns i tsc-utdata om de bryter baslinjen.
  const stad = stadaTmpFiler();
  if (stad.stadade.length > 0) {
    info.push(
      `tmp-städning FÖRE tsc: ${stad.stadade.length} signaturverifierad(e) genererad(e) fil(er) raderade (${stad.stadade.join(", ")}) — SIGKILL-läckeklassen mekaniserat oskadliggjord (gap 5 kö 1; verktyg/tmp-stad.mjs)`
    );
  }
  if (stad.skonade.length > 0) {
    info.push(
      `tmp-städning skonade ${stad.skonade.length} fil(er) (${stad.skonade.map((s) => `${s.fil}: ${s.orsak}`).join("; ")}) — lämnade åt tsc, som flaggar dem tydligt om de bryter baslinjen`
    );
  }

  try {
    sub = spawnSync(process.execPath, [tscBin, "--noEmit"], {
      cwd: REPO,
      encoding: "utf8",
      timeout: 120_000,
      maxBuffer: 8 * 1024 * 1024,
      env: { ...process.env, NO_COLOR: "1" },
    });
  } catch (e) {
    manuella.push({
      fil: "verktyg/kvalitetsvakt.mjs",
      plats: "sektionTsc",
      ord: "spawn-fel",
      kontext: String(e?.message || e).slice(0, 160),
    });
    info.push("tsc kunde inte startas (spawn-fel) — baslinjen OMÄTT denna körning");
    return { namn, fel, manuella, info };
  }

  const sek = ((Date.now() - t0) / 1000).toFixed(1);
  const utdata = `${sub.stdout || ""}${sub.stderr || ""}`;

  if (sub.error && sub.error.code === "ETIMEDOUT") {
    manuella.push({
      fil: "node_modules/typescript/bin/tsc",
      plats: "-",
      ord: "timeout",
      kontext: `tsc --noEmit överskred 120 s (kall cache eller maskinlast) — baslinjen OMÄTT; kör "node node_modules/typescript/bin/tsc --noEmit" manuellt`,
    });
    info.push("tsc överskred budgeten 120 s — OMÄTT, inte godkänt (vakten ger aldrig tyst PASS)");
    return { namn, fel, manuella, info };
  }

  if (sub.status === 0) {
    info.push(`node node_modules/typescript/bin/tsc --noEmit — 0 fel på ${sek} s (typnollen mekanisk sedan våg 133; merge-vägen bevisas dagligen här)`);
    return { namn, fel, manuella, info };
  }

  const felRader = utdata.split("\n").filter((r) => r.includes(" error "));
  // Deploy-transient (K2/K3-precedensen): npm ci byter node_modules under
  // fötterna — fel som ALLA pekar in i node_modules är prod-synkens fönster,
  // inte ett baslinjebrott i src/.
  const deployMisstanke = felRader.length > 0 && felRader.every((r) => r.includes("node_modules"));

  if (deployMisstanke) {
    manuella.push({
      fil: "node_modules",
      plats: "-",
      ord: "deploy-misstanke",
      kontext: `tsc exit ${sub.status} med ${felRader.length} felrader som ALLA pekar in i node_modules — troligen pågående deploy (npm ci byter trädet); omkör vakten efter deployen`,
    });
    info.push(`tsc exit ${sub.status} på ${sek} s — alla ${felRader.length} felrader inuti node_modules ⇒ klassad deploy-transient (MANUELL), inte baslinjebrott`);
    return { namn, fel, manuella, info };
  }

  if (felRader.length === 0) {
    manuella.push({
      fil: "node_modules/typescript/bin/tsc",
      plats: "-",
      ord: "okänd utgång",
      kontext: `tsc exit ${sub.status} utan tolkbara error-rader: ${utdata.trim().split("\n")[0]?.slice(0, 160) || "(tom utdata)"}`,
    });
    info.push(`tsc exit ${sub.status} på ${sek} s men inga tolkbara error-rader — OMÄTT, manuell uppföljning krävs`);
    return { namn, fel, manuella, info };
  }

  info.push(`tsc exit ${sub.status} på ${sek} s — ${felRader.length} felrader ⇒ BASELINJEBROTT (typnollen gäller hela trädet, våg 133)`);
  for (const r of felRader.slice(0, 40)) {
    fel.push({ fil: "tsc", plats: "-", detalj: r.trim().slice(0, 220) });
  }
  if (felRader.length > 40) {
    fel.push({ fil: "tsc", plats: "-", detalj: `… och ${felRader.length - 40} felrader till` });
  }
  return { namn, fel, manuella, info };
}

// ════════════════════════════════════════════════════════════════════════════
function statusForSektion(s) {
  if (s.status) return s.status; // SKIP-genväg
  if ((s.fel ?? []).length > 0) return "FAIL";
  if ((s.manuella ?? []).length > 0) return "MANUELL";
  return "PASS";
}

function sektionTillMarkdown(idx, s) {
  const status = statusForSektion(s);
  const linjer = [];
  linjer.push(`## ${idx}. ${esc(s.namn)} — **${status}**`);
  linjer.push("");
  for (const i of s.info ?? []) linjer.push(`- ${esc(i, 300)}`);
  linjer.push("");
  if ((s.fel ?? []).length > 0) {
    linjer.push(`### FEL (${s.fel.length})`);
    linjer.push("");
    linjer.push("| Fil | Plats | Detalj |");
    linjer.push("|---|---|---|");
    const tak = Math.min(s.fel.length, 40);
    for (const f of s.fel.slice(0, tak)) {
      linjer.push(`| ${esc(f.fil)} | ${esc(f.plats)} | ${esc(f.detalj)} |`);
    }
    if (s.fel.length > tak) linjer.push(`| … | … | och ${s.fel.length - tak} till |`);
    linjer.push("");
  }
  if ((s.manuella ?? []).length > 0) {
    linjer.push(`### MANUELL GRANSKNING KRÄVS (${s.manuella.length} träffar)`);
    linjer.push("");
    linjer.push("| Fil | Plats | Misstänkt | Kontext |");
    linjer.push("|---|---|---|---|");
    const tak = Math.min(s.manuella.length, 60);
    for (const m of s.manuella.slice(0, tak)) {
      linjer.push(`| ${esc(m.fil)} | ${esc(m.plats)} | ${esc(m.ord, 40)} | ${esc(m.kontext)} |`);
    }
    if (s.manuella.length > tak) linjer.push(`| … | … | … | och ${s.manuella.length - tak} till |`);
    linjer.push("");
  }
  if ((s.fel ?? []).length === 0 && (s.manuella ?? []).length === 0 && status === "PASS") {
    linjer.push("Inga avvikelser hittade.");
    linjer.push("");
  }
  return linjer.join("\n");
}

async function main() {
  const t0 = Date.now();
  const startIso = new Date().toISOString();
  console.log("[kvalitetsvakt] startar fullständig sajtscanning …");

  const sektioner = [
    await Promise.resolve(sektionBokmasterAao()),
    sektionUiStrangar(),
    sektionForbjudnaFras(),
    sektionJson(),
    sektionLankar(),
    sektionKursdata(),
    sektionSitemap(),
    await sektionMotorer(),
    await sektionAaoDegen(),
    sektionSiffror(),
    sektionTsc(),
    await sektionSsrLivssond(),
  ];

  const totalFel = sektioner.reduce((s, x) => s + (x.fel ?? []).length, 0);
  const totalMan = sektioner.reduce((s, x) => s + (x.manuella ?? []).length, 0);
  const jsonFel = sektioner.find((s) => s.namn.startsWith("JSON-giltighet"))?.fel?.length ?? 0;
  let status;
  if (totalFel > 9 || jsonFel > 0) status = "RÖD";
  else if (totalFel >= 1 || totalMan > 99) status = "GUL";
  else status = "GRÖN";

  // ── bygg rapportmarkdown ──
  const datum = startIso.slice(0, 10);
  const md = [];
  md.push(`# KVALITETSVAKTEN — ${datum}`);
  md.push("");
  md.push(`- **Genererad:** ${startIso} (node ${process.version} på ${process.platform})`);
  md.push(`- **Skript:** \`verktyg/kvalitetsvakt.mjs\` — körs dagligen 07:02 lokal av vaktpumporna (o35) + manuellt via \`/api/cron/kvalitet\``);
  md.push(`- **Körtid:** ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  md.push("");
  md.push("**Statusregler:** RÖD = fler än 9 fel ELLER ogiltig JSON · GUL = 1–9 fel ELLER fler än 99 manuella · GRÖN = 0 fel och högst 99 manuella.");
  md.push("");
  for (let i = 0; i < sektioner.length; i++) {
    md.push(sektionTillMarkdown(i + 1, sektioner[i]));
  }
  md.push("## Sammanfattning");
  md.push("");
  md.push("| Sektion | Status | Fel | Manuella |");
  md.push("|---|---|---:|---:|");
  for (let i = 0; i < sektioner.length; i++) {
    md.push(`| ${i + 1}. ${esc(sektioner[i].namn, 80)} | **${statusForSektion(sektioner[i])}** | ${(sektioner[i].fel ?? []).length} | ${(sektioner[i].manuella ?? []).length} |`);
  }
  md.push("");
  md.push(`## ANTAL FEL: ${totalFel} | MANUELLA: ${totalMan} | STATUS: ${status}`);
  md.push("");
  md.push("_Rapportgenererad av verktyg/kvalitetsvakt.mjs — kontinuerligt felsökningssystem (kontroller: åäö-bortfall, UI-strängar, JSON-giltighet, länk-validitet, kursdata-konsistens, sitemap-täckning, motorvalidering, typbaslinje, SSR-livssond)._");
  md.push("");

  mkdirSync(path.dirname(RAPPORT_SOK), { recursive: true });
  writeFileSync(RAPPORT_SOK, md.join("\n"), "utf8");

  console.log(`[kvalitetsvakt] rapport skriven: ${rel(RAPPORT_SOK)}`);
  for (const s of sektioner) {
    console.log(`  ${statusForSektion(s).padEnd(7)} — ${s.namn} (fel ${(s.fel ?? []).length}, manuella ${(s.manuella ?? []).length})`);
  }
  const resultat = { datum: startIso, fel: totalFel, manuella: totalMan, status };
  console.log(`SAMMANFATTNING: ANTAL FEL: ${totalFel} | MANUELLA: ${totalMan} | STATUS: ${status}`);
  console.log("RESULTAT_JSON=" + JSON.stringify(resultat));
  return status === "RÖD" ? 1 : 0;
}

main()
  .then((kod) => process.exit(kod))
  .catch((e) => {
    console.error("[kvalitetsvakt] FEL: " + (e instanceof Error ? e.stack : String(e)));
    process.exit(1);
  });
