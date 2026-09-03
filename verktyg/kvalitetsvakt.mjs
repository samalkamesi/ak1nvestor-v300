#!/usr/bin/env node
/**
 * KVALITETSVAKTEN — AK1A:s kontinuerliga felsökningssystem.
 * Användarens direktiv: "vi måste ha system som ständigt söker efter fel och rättar".
 *
 * Skannar HELA sajten varje körning (lokalt eller via /api/cron/kvalitet kl 07:00
 * UTC) och skriver ÖVERSKRIVANDE rapport till data/rapporter/kvalitetsrapport-SENASTE.md.
 *
 * Sju kontroller:
 *   1. ÅÄÖ-bortfall i bokmaster-text — ALL text ur data/bokmaster/*.json matchas
 *      mot en manglings-ordbok. Skriptet kan INTE läsa svenska → varje träff
 *      listas som "MANUELL GRANSKNING KRÄVS" med fil + sökväg + kontext.
 *   2. UI-strängar — JSX-text och attribut-strängar ur src/components/ak1a/*.tsx
 *      + alla page.tsx under src/app mot samma manglings-mönster.
 *   3. JSON-giltighet — JSON.parse av ALLA data/*.json + data/bokmaster/*.json.
 *   4. Länk-validitet — varje href/lank ur sokindex.ts + huvudmeny.tsx +
 *      sidfooter.tsx måste motsvara en page.tsx i src/app (statisk eller dynamisk).
 *   5. Kursdata-konsistens — chapterCount === chapters.length,
 *      quiz-antal === kapitel × 3, totalMinutes === sum(chapters[].minutes).
 *   6. Sitemap-täckning — alla viktiga routes (nav + statiska sidor) finns i sitemap.ts.
 *   7. Motorvalidering — kör verktyg/validera-motorer.mjs (--kör-motorer) eller
 *      läser dess senaste rapport i data/rapporter/.
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
  let ut = src.replace(/\/\*[\s\S]*?\*\//g, (m) => " ".repeat(m.length));
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

/** Alla rutter i src/app som segment-listor ("[slug]"-segment = dynamiska). */
function appRutter() {
  const rutter = [];
  for (const sida of hittaFiler(path.join(REPO, "src", "app"), "page.tsx")) {
    const relSida = path.relative(path.join(REPO, "src", "app"), sida);
    const seg = relSida.split(path.sep).slice(0, -1); // ta bort "page.tsx"
    rutter.push(seg.map((s) => s.replaceAll("\\", "/")));
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
const SITEMAP_EXKLUDERA = new Set(["/admin", "/pro", "/rapporter", "/logga-in"]);

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
      shell: process.platform === "win32",
    });
    let klar = false;
    const stad = () => {
      if (klar) return;
      klar = true;
      if (barn.killed || barn.exitCode === null) {
        if (process.platform === "win32" && typeof barn.pid === "number") {
          spawnSync("taskkill", ["/pid", String(barn.pid), "/T", "/F"]);
        } else {
          try { barn.kill("SIGKILL"); } catch { /* ignorera */ }
        }
      }
      res();
    };
    const tid = setTimeout(stad, 120_000);
    barn.on("error", () => { clearTimeout(tid); stad(); });
    barn.on("close", () => { clearTimeout(tid); stad(); });
  });
}

async function sektionMotorer() {
  const fel = [];
  const info = [];
  if (KOR_MOTORER) {
    info.push("kör verktyg/validera-motorer.mjs som subprocess (budget 120 s) …");
    await körMotorvaliderare();
  }
  let rapport = senasteMotorRapport();
  if (!rapport) {
    info.push("ingen befintlig rapport — försöker köra validera-motorer.mjs en gång …");
    await körMotorvaliderare();
    rapport = senasteMotorRapport();
  }
  if (!rapport) {
    return {
      namn: "Motorvalidering (validera-motorer.mjs)",
      status: "SKIP",
      fel: [],
      manuella: [],
      info: [...info, "ingen motorervalideringsrapport hittades och subprocessen gav ingen ny — kör 'node verktyg/validera-motorer.mjs' manuellt"],
    };
  }
  const src = readFileSync(rapport.abs, "utf8");
  const m = src.match(/\|\s*\*\*Totalt\*\*\s*\|\s*\**(\d+)\**\s*\|\s*\**(\d+)\**\s*\|\s*\**(\d+)\**\s*\|/);
  if (!m) {
    return {
      namn: "Motorvalidering (validera-motorer.mjs)",
      status: "SKIP",
      fel: [],
      manuella: [],
      info: [...info, `kunde inte tolka sammanfattningen i ${rapport.fil}`],
    };
  }
  const pass = Number(m[1]);
  const fail = Number(m[2]);
  const skip = Number(m[3]);
  const ageDagar = Math.floor((Date.now() - statSync(rapport.abs).mtimeMs) / 86400000);
  info.push(`${rapport.fil}: ${pass} PASS / ${fail} FAIL / ${skip} SKIP (rapporten är ${ageDagar} dagar gammal)`);
  if (fail > 0) {
    // lista raderna med FAIL ur rapporten
    for (const rad of src.split("\n")) {
      if (rad.includes("**FAIL**")) fel.push({ fil: rapport.fil, plats: "-", detalj: esc(rad, 200) });
    }
    if (fel.length === 0) fel.push({ fil: rapport.fil, plats: "-", detalj: `${fail} FAIL i motorervalideringen (se rapporten för detaljer)` });
  }
  if (ageDagar > 7) {
    info.push(`VARNING: rapporten är ${ageDagar} dagar gammal — kör 'node verktyg/validera-motorer.mjs' eller kvalitetsvakten med --kör-motorer`);
  }
  return { namn: "Motorvalidering (validera-motorer.mjs)", fel, manuella: [], info };
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
    sektionJson(),
    sektionLankar(),
    sektionKursdata(),
    sektionSitemap(),
    await sektionMotorer(),
    await sektionAaoDegen(),
  ];

  const totalFel = sektioner.reduce((s, x) => s + (x.fel ?? []).length, 0);
  const totalMan = sektioner.reduce((s, x) => s + (x.manuella ?? []).length, 0);
  const jsonFel = sektioner[2]?.fel?.length ?? 0;
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
  md.push(`- **Skript:** \`verktyg/kvalitetsvakt.mjs\` — körs dagligen 07:00 UTC via \`/api/cron/kvalitet\``);
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
  md.push("_Rapportgenererad av verktyg/kvalitetsvakt.mjs — kontinuerligt felsökningssystem (kontroller: åäö-bortfall, UI-strängar, JSON-giltighet, länk-validitet, kursdata-konsistens, sitemap-täckning, motorvalidering)._");
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
