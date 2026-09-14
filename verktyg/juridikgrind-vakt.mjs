#!/usr/bin/env node
/**
 * JURIDIKGRIND-VAKTEN (mega g2, styrelsens beslut punkt 2, 2026-09-15)
 * =====================================================================
 * Mekanisk rådsförbudsscanner FÖRE FLYTTKLAR. Lagen (2007:528) om
 * värdepappersrörelser: utbildning är tillåtet (2 kap 5 §), rådgivning
 * kräver tillstånd — vakten söker MEKANISKT efter rådgivnings- och
 * prediktionsformuleringar i ALLT som väntar på flytt till data/blogg/.
 *
 * Källor för rådsförbudslistan (sanningshierarkin):
 *   · AGENTS.md — juriddelen ("ALDRIG investeringsråd … ALDRIG 'köp denna
 *     aktie'"; lagrummen 2007:528 / 2022:260 / 2022:261 / 1985:716 /
 *     2005:59 / GDPR art 13 / LEK 2022:482)
 *   · data/forskning/STYRELSE-REGELVERK.md § 9 (juridikgrinds-check)
 *   · .zcode/skills/juridikgrind/SKILL.md (rätt vs fel formuleringar)
 *   · data/varumarke.json forbjudnaFraser (P2/2007:528-delen)
 *
 * Tre kontroller per dokument:
 *   1. RÅDSFÖRBUD  — kända kalla formuleringar (FEL) + värdeökning­
 *                    prediktioner (VARNING), med negeringsvakt ("inte
 *                    investeringsråd" är SIGNATUR-disclaimern, aldrig fynd).
 *   2. GRUND       — varje FLYTTKLAR-utdrag SKA bära utbildnings-grunden
 *                    (pedagogisk-disclaimer / negerat investeringsråd).
 *                    FLYTTKLAR utan grund = FEL-larm.
 *   3. TVÄRFALL    — nämns ångerrätt/konsumentköp/digitalt innehåll/
 *                    personuppgifter/kakor ⇒ rätt lagrum måste finnas i
 *                    samma dokument; fel parning = misstänkt lagrums­
 *                    blandning (AGENTS.md: "blanda ALDRIM lagrummen").
 *
 * Ytor: data/blogg-utkast/*.json + m9-ko/*-v*.json + *.md (utkast, full
 * allvar) samt data/blogg-utkast/granskning/*.md + SAMMANSTALLNING*
 * (interna granskningsposter — citatyta, allvar nedgraderat ett steg).
 * Larm: data/vakten/juridik-larm.json (dedup: förstaGången bevaras).
 * ALDRIG något skrivet i data/blogg/ — publicering förblir kundens (R2).
 *
 * Körning: node verktyg/juridikgrind-vakt.mjs [--json]
 * Pumpor: min==37 (före styrelserondens :43) — se pumpor-daemon.mjs.
 * Exit-kod: 1 om något FEL (flytt bör spärras), annars 0.
 */
import crypto from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const UTKAST_DIR = path.join(ROT, "data", "blogg-utkast");
const LARM_FIL = path.join(ROT, "data", "vakten", "juridik-larm.json");
const TIMBANG = 80; // tecken kontext före/när en träff visas i utdraget

/* ------------------------------------------------------------------ *
 * 1. RÅDSFÖRBUDSLISTAN — kända kalla formuleringar (2007:528)
 *    Gränsmarkörerna (?<![\p{L}])/(?![\p{L}]) ger åäö-säkra ordkanter.
 * ------------------------------------------------------------------ */
const RADS_FORBUD = [
  // — FEL: direkt rådgivning —
  { id: "r1-rekommendera-kop", re: /(?<![\p{L}])rekommender\w*\s+(?:dig\s+)?(?:att\s+)?(?:köp(?:a)?|sälj(?:a)?|teckning|teckna|investering|investera)/giu, allvar: "FEL", lagrum: "2007:528", motiv: "rekommendera köp/sälj = rådgivning" },
  { id: "r2-min-rekommendation", re: /(?<![\p{L}])(?:min|vår|vårt|våra|er|ert|era)\s+rekommendation/giu, allvar: "FEL", lagrum: "2007:528", motiv: "\"min rekommendation är X\" (skillets ❌-exempel)" },
  { id: "r3-du-bor", re: /(?<![\p{L}])(?:du|ni)\s+bör\s+(?:köpa|sälja|investera)/giu, allvar: "FEL", lagrum: "2007:528", motiv: "bör-köp/sälj = personligt råd" },
  { id: "r4-kop-denna-aktie", re: /(?:köp|sälj)\s+(?:denna|den\s+ här|detta)\s+(?:aktie\w*|bolag\w*|emission\w*)/giu, allvar: "FEL", lagrum: "2007:528", motiv: "AGENTS.md: ALDRIG \"köp denna aktie\"" },
  { id: "r5-salj-nu", re: /sälj\s+(?:nu\b|dina\s+aktier|ditt\s+innehav)/giu, allvar: "FEL", lagrum: "2007:528", motiv: "direkt sälj-påbud (skillets ❌-exempel)" },
  { id: "r6-bra-affar", re: /bra\s+affär\s+för\s+dig/giu, allvar: "FEL", lagrum: "2007:528", motiv: "skillets ❌-exempel \"detta är en bra affär för dig\"" },
  { id: "r7-aktietips", re: /(?<![\p{L}])aktietips\w*/giu, allvar: "FEL", lagrum: "2007:528/MAR", motiv: "tips på enskild aktie är rådgivning (varumärket)" },
  { id: "r8-koprekommendation", re: /(?<![\p{L}])(?:köp|sälj)[\s\-–]*(?:rekommendation|signal|råd)/giu, allvar: "FEL", lagrum: "2007:528", motiv: "köp/sälj-rekommendation är rådgivning (varumärket)" },
  { id: "r9-garanterad-avkastning", re: /garanterad[\s\-–]*avkastning/giu, allvar: "FEL", lagrum: "2007:528", motiv: "löfte om avkastning är rådgivning (varumärket)" },
  { id: "r10-riskfri", re: /(?<![\p{L}])riskfri\w*/giu, allvar: "FEL", lagrum: "2007:528", motiv: "ingen strategi är riskfri (varumärket)" },
  { id: "r11-saker-vinst", re: /(?<![\p{L}])säker\w*\s+vinst/giu, allvar: "FEL", lagrum: "2007:528", motiv: "säker vinst är rådgivning (varumärket)" },
  { id: "r12-obegransad", re: /obegränsad\s+avkastning/giu, allvar: "FEL", lagrum: "2007:528", motiv: "obegränsad avkastning finns inte (varumärket)" },
  { id: "r13-passiv-inkomst", re: /passiv\s+inkomst\s+utan\s+risk/giu, allvar: "FEL", lagrum: "2007:528", motiv: "dubbellöfte passivt+riskfritt (varumärket)" },
  { id: "r14-sla-index", re: /slå[\s\-–]*index[\s\-–]*varje[\s\-–]*år/giu, allvar: "FEL", lagrum: "2007:528", motiv: "löfte om systematiskt indexöverträff (varumärket)" },
  { id: "r15-investeringsrad", re: /(?<![\p{L}])investeringsråd\w*/giu, allvar: "FEL", lagrum: "2007:528", motiv: "endast NEGERAT är tillåtet (varumärket); negeringsvakten avgör" },
  // — VARNING: värdeökning-prediktion / gråzon —
  { id: "p1-kommer-stiga", re: /(?<![\p{L}])kommer\s+(?:att\s+)?(?:stiga|dubbla\w*|stiga\s+kraftigt)/giu, allvar: "VARNING", lagrum: "2007:528", motiv: "deterministisk värdeökning-prediktion" },
  { id: "p2-forvantas-stiga", re: /(?<![\p{L}])(?:förväntas|väntas)\s+(?:att\s+)?(?:stiga|öka|dubblas)/giu, allvar: "VARNING", lagrum: "2007:528", motiv: "utfallsprognos om värdeökning" },
  { id: "p3-kursmal", re: /(?<![\p{L}])(?:kursmål|målkurs|target[\s\-]?price)/giu, allvar: "VARNING", lagrum: "2007:528", motiv: "kursmål är analysrådgivningens språk" },
  { id: "p4-vardebedomning", re: /(?<![\p{L}])(?:under|över)värderad\w*/giu, allvar: "VARNING", lagrum: "2007:528", motiv: "värderingsdom utan metoddemo = gråzon" },
  { id: "p5-chans-dubbla", re: /chansen\s+att\s+(?:dubbla|tiodubbla)/giu, allvar: "VARNING", lagrum: "2007:528", motiv: "utfallslockande värdeprediktion" },
  { id: "p6-aktien-ar-kop", re: /(?<![\p{L}])(?:aktien|bolaget|pappret)\s+är\s+(?:ett\s+)?(?:köp|sälj|fall|case)/giu, allvar: "VARNING", lagrum: "2007:528", motiv: "mäklarformulerad slutsats" },
  { id: "p7-rating-kolon", re: /(?<![\p{L}])(?:köp|sälj|behåll|avvakta|hold|buy|sell)\s*[:!]\s/giu, allvar: "VARNING", lagrum: "2007:528", motiv: "ratingstil — kan vara pedagogiskt exempel, verifiera kontexten" },
];

/* Negeringsvakt: "inte investeringsråd", "aldrig rådgivning", "kan stiga
 * eller falla" är utbildning/osäkerhet — ALDRIG fynd. Negering/osäkerhetsord
 * direkt före, med upp till fyra ord emellan ("inte en rekommendation att"). */
const NEGERAT_RE = /(?:inte|ej|aldrig|ingen|inga|inget|icke|varken|kanske|möjligen)\s+(?:[\p{L}\dåäöÅÄÖ]+[\s:;,.—–\-/]{0,2}){0,4}$/iu;
const OSAKERHET_RE = /(?:kan|kunde|skulle\s+kunna)\s+(?:[\p{L}\dåäöÅÄÖ]+[\s:;,.—–\-/]{0,2}){0,2}$/iu;
function arNegerad(text, index) {
  const fore = text.slice(Math.max(0, index - 70), index);
  return NEGERAT_RE.test(fore) || OSAKERHET_RE.test(fore);
}

/* 2. GRUNDEN — utbildnings-disclaimern varje FLYTTKLAR-utdrag måste bära. */
const GRUND_RE = [
  /(?:inte|ej|aldrig|ingen|inget)\s+investeringsråd\w*/iu,
  /pedagogisk\s+(?:finansanalys|forskning|analys|utbildning|material|syfte|genomgång|exempel)/iu,
  /aldrig\s+(?:investerings)?rådgivning/iu,
];
function harGrund(text) {
  if (GRUND_RE.some((re) => re.test(text))) return true;
  return /2007:528/u.test(text) && /(?:pedagogisk|utbildning)/iu.test(text);
}

/* 3. TVÄRFALLEN — nämns ett rättssystem måste dess lagrum finnas i dokumentet. */
const TVARFALL = [
  { id: "angerratt", trigga: /\b(?:ångerrätt|ångertid|ångerrättsinfo|distansavtal|öppet\s+köp)\b/iu, krav: /2005:59/u, lagrum: "2005:59", omrade: "ångerrätt/distansavtal" },
  { id: "konsumentkop", trigga: /\b(?:konsumentköp|reklamation\w*)\b/iu, krav: /2022:260/u, lagrum: "2022:260", omrade: "konsumentköp" },
  { id: "digitalt-innehall", trigga: /\b(?:digitalt\s+innehåll|digitala?\s+tjänst\w*)\b/iu, krav: /2022:261/u, lagrum: "2022:261", omrade: "digitalt innehåll/digitala tjänster" },
  { id: "konsumenttjanst", trigga: /\b(?:konsumenttjänst\w*)\b/iu, krav: /1985:716/u, lagrum: "1985:716", omrade: "konsumenttjänster" },
  { id: "gdpr-insamling", trigga: (t) => /\b(?:personuppgift\w*|GDPR)\b/iu.test(t) && /\b(?:insamling\w*|insamlas|samlar\s+in|insamla)\b/iu.test(t), krav: /(?:artikel\s+13|art\.?\s*13)/iu, lagrum: "GDPR art 13", omrade: "personuppgiftsinsamling" },
  { id: "kakor", trigga: /\b(?:kakor|webbkakor|cookies)\b/iu, krav: /(?:2022:482|\bLEK\b)/iu, lagrum: "LEK 2022:482", omrade: "kakor" },
];
/* Lagrumsblandning: 2022:260 åberopas i ett dokument vars enda konsumtion­
 * spår är digitalt innehåll (och vice versa) — AGENTS.md "blanda ALDRIM". */
function tvarfallBlandning(text) {
  const har260 = /2022:260/u.test(text);
  const har261 = /2022:261/u.test(text);
  const digitalt = /\b(?:digitalt\s+innehåll|digitala?\s+tjänst\w*)\b/iu.test(text);
  const kop = /\b(?:konsumentköp|reklamation\w*)\b/iu.test(text);
  const fynd = [];
  if (har260 && digitalt && !har261) fynd.push("2022:260 åberopas i digitalt innehåll-sammanhang utan 2022:261 — rätt lagrum för digitala tjänster är 2022:261");
  if (har261 && kop && !har260) fynd.push("2022:261 åberopas i konsumentköp-sammanhang utan 2022:260 — rätt lagrum för konsumentköp är 2022:260");
  return fynd;
}

/* ------------------------------------------------------------------ *
 * Källinsamlare
 * ------------------------------------------------------------------ */
function lasUtkastJson(fil) {
  const j = JSON.parse(readFileSync(fil, "utf8"));
  const delar = [j.titel ?? j.title ?? "", j.ingress ?? j.description ?? "", j.bodyMarkdown ?? j.body ?? "", Array.isArray(j.tags) ? j.tags.join(" ") : ""];
  return { text: delar.join("\n\n"), slug: j.slug ?? path.basename(fil, ".json") };
}
function lasUtkastMd(fil) {
  const rå = readFileSync(fil, "utf8");
  const m = rå.match(/^---\n([\s\S]*?)\n---/);
  let slug = path.basename(fil, ".md");
  let front = "";
  if (m) {
    front = m[1];
    const s = front.match(/^slug:\s*(\S+)/m);
    if (s) slug = s[1];
  }
  return { text: `${front}\n\n${rå}`, slug };
}
function hoistaM9Version() {
  // m9-filarna versionsuffixas (-v1, -v2 …) — högst per slug granskas.
  const dir = path.join(UTKAST_DIR, "m9-ko");
  const ut = new Map();
  if (!existsSync(dir)) return ut;
  for (const f of readdirSync(dir)) {
    const m = f.match(/^(.+)-v(\d+)\.json$/);
    if (!m) continue;
    const v = Number(m[2]);
    if (!ut.has(m[1]) || v > ut.get(m[1]).v) ut.set(m[1], { v, fil: path.join(dir, f) });
  }
  return ut;
}
function lasKallor() {
  const utkast = [];
  const granskning = [];
  for (const f of readdirSync(UTKAST_DIR)) {
    const p = path.join(UTKAST_DIR, f);
    if (f.endsWith(".json") && !f.startsWith("GRANSKNINGSKO")) utkast.push({ ...lasUtkastJson(p), fil: `data/blogg-utkast/${f}`, typ: "seo-json" });
    else if (f.endsWith(".md") && !f.startsWith("GRANSKNINGSKO")) utkast.push({ ...lasUtkastMd(p), fil: `data/blogg-utkast/${f}`, typ: "md" });
    else if (f.startsWith("GRANSKNINGSKO")) granskning.push({ text: readFileSync(p, "utf8"), fil: `data/blogg-utkast/${f}`, slug: "sammanstallning", typ: "sammanstallning" });
  }
  for (const [slug, e] of hoistaM9Version()) utkast.push({ ...lasUtkastJson(e.fil), fil: `data/blogg-utkast/m9-ko/${path.basename(e.fil)}`, typ: "m9-json", slug });
  const gdir = path.join(UTKAST_DIR, "granskning");
  if (existsSync(gdir)) {
    for (const f of readdirSync(gdir)) {
      if (!f.endsWith(".md")) continue;
      granskning.push({ text: readFileSync(path.join(gdir, f), "utf8"), fil: `data/blogg-utkast/granskning/${f}`, slug: f.replace(/\.md$/, ""), typ: "granskningspost" });
    }
  }
  return { utkast, granskning };
}

/* FLYTTKLAR-status ur granskningspostens bedömningsrad. */
const FLYTTKLAR_RE = /bedömning[^*\n]{0,24}FLYTTKLAR/iu;

/* ------------------------------------------------------------------ *
 * Själva granskningen
 * ------------------------------------------------------------------ */
function utdrag(text, index, langd) {
  const a = Math.max(0, index - TIMBANG);
  const b = Math.min(text.length, index + langd + TIMBANG);
  return `${a > 0 ? "…" : ""}${text.slice(a, b).replace(/\s+/g, " ").trim()}${b < text.length ? "…" : ""}`;
}
function enLinje(s, n = 160) {
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
}

function skannaText(text, { fil, slug, citatyta }) {
  const fynd = [];
  for (const regel of RADS_FORBUD) {
    regel.re.lastIndex = 0;
    for (const m of text.matchAll(regel.re)) {
      if (arNegerad(text, m.index)) continue; // "inte investeringsråd" m.m. = utbildning
      // Intern granskningspost = citatyta: ordet direkt efter citationstecken/
      // regex-literal är en CITERAD TERM ("…endast onegerat "investeringsråd"…"),
      // inte använd rådgivning — hoppas över (gäller endast interna dokument).
      if (citatyta && /["'`«»/]/.test(text.slice(m.index - 1, m.index))) continue;
      // Intern granskningspost = citatyta (exempel på felFormuleringar): nedgradera ett steg.
      const allvar = citatyta && regel.allvar === "FEL" ? "VARNING" : regel.allvar;
      fynd.push({
        kategori: "RÅDSFÖRBUD",
        allvar,
        fil,
        slug,
        regel: regel.id,
        lagrum: regel.lagrum,
        motiv: regel.motiv,
        utdrag: utdrag(text, m.index, m[0].length),
        matchning: m[0],
      });
    }
  }
  return fynd;
}

function skanna() {
  const { utkast, granskning } = lasKallor();
  const flyttklaraSlugs = new Set(granskning.filter((g) => FLYTTKLAR_RE.test(g.text)).map((g) => g.slug));
  const fynd = [];
  const dokument = [];

  for (const u of utkast) {
    const df = skannaText(u.text, { fil: u.fil, slug: u.slug, citatyta: false });
    const flyttklar = flyttklaraSlugs.has(u.slug);
    const grund = harGrund(u.text);
    if (flyttklar && !grund) {
      df.push({ kategori: "GRUND", allvar: "FEL", fil: u.fil, slug: u.slug, regel: "flyttklar-utan-grund", lagrum: "2007:528", motiv: "FLYTTKLAR-utdrag utan utbildnings-grund (pedagogisk disclaimer / negerat investeringsråd)", utdrag: enLinje(u.text.slice(0, 200)), matchning: "(dokumentnivå)" });
    }
    for (const t of TVARFALL) {
      const triggad = typeof t.trigga === "function" ? t.trigga(u.text) : t.trigga.test(u.text);
      if (triggad && !t.krav.test(u.text)) {
        df.push({ kategori: "TVÄRFALL", allvar: "VARNING", fil: u.fil, slug: u.slug, regel: `tvärfall-${t.id}-utan-lagrum`, lagrum: t.lagrum, motiv: `${t.omrade} nämns utan laggrundsgrund ${t.lagrum}`, utdrag: enLinje(u.text.slice(0, 200)), matchning: "(dokumentnivå)" });
      }
    }
    for (const b of tvarfallBlandning(u.text)) {
      df.push({ kategori: "LAGRUMSBLANDNING", allvar: "VARNING", fil: u.fil, slug: u.slug, regel: "lagrumsblandning", lagrum: "2022:260/2022:261", motiv: b, utdrag: enLinje(u.text.slice(0, 200)), matchning: "(dokumentnivå)" });
    }
    fynd.push(...df);
    dokument.push({ fil: u.fil, slug: u.slug, typ: u.typ, flyttklar, grund, fynd: df.length });
  }

  for (const g of granskning) {
    const dg = skannaText(g.text, { fil: g.fil, slug: g.slug, citatyta: true });
    fynd.push(...dg);
    dokument.push({ fil: g.fil, slug: g.slug, typ: g.typ, flyttklar: g.typ === "granskningspost" ? FLYTTKLAR_RE.test(g.text) : null, grund: null, fynd: dg.length });
  }

  return { dokument, fynd, flyttklaraSlugs };
}

/* ------------------------------------------------------------------ *
 * Larmfilen — dedup via sha1(fil+regel+utdrag); förstaGången bevaras.
 * ------------------------------------------------------------------ */
function id(f) {
  return crypto.createHash("sha1").update(`${f.fil}|${f.regel}|${f.utdrag}`).digest("hex").slice(0, 16);
}
function skrivLarm(fynd) {
  const nu = new Date().toISOString();
  const forra = existsSync(LARM_FIL) ? JSON.parse(readFileSync(LARM_FIL, "utf8")) : null;
  const forstaGang = new Map((forra?.fynd ?? []).map((f) => [id(f), f.förstaGången]));
  const f = fynd
    .map((x) => ({ ...x, id: id(x), förstaGången: forstaGang.get(id(x)) ?? nu, senastSedd: nu }))
    .sort((a, b) => (a.allvar === b.allvar ? a.fil.localeCompare(b.fil) : a.allvar === "FEL" ? -1 : 1));
  const fel = f.filter((x) => x.allvar === "FEL").length;
  const varning = f.length - fel;
  const status = fel > 0 ? "RÖD" : varning > 0 ? "GUL" : "GRÖN";
  const larm = {
    typ: "juridikgrind",
    senasteKorning: { ts: nu, status, fyndFEL: fel, fyndVARNING: varning, sammanfattning: status === "RÖD" ? `${fel} FEL-fynd — spärra flytt tills rättrade` : status === "GUL" ? `${varning} VARNING-fynd — verifiera vid nästa rond` : "Rena: 0 rådgivningsformuleringar, alla grunder på plats" },
    fynd: f,
  };
  writeFileSync(LARM_FIL, `${JSON.stringify(larm, null, 2)}\n`);
  return larm;
}

/* ------------------------------------------------------------------ *
 * Självtest (--sjalvtest) — bevisar att scanern fångar det den ska:
 * kalla formuleringar = fynd, negerade/oscillande = rent, grund-detektering.
 * ------------------------------------------------------------------ */
function sjalvtest() {
  const fall = [
    { namn: "köp denna aktie", text: "Vi säger det rakt: köp denna aktie innan det är försent.", vanta: ["r4-kop-denna-aktie"] },
    { namn: "rekommenderar köp", text: "Vår analys rekommenderar köp av bolaget.", vanta: ["r1-rekommendera-kop"] },
    { namn: "sälj nu", text: "Min rekommendation är sälj nu.", vanta: ["r5-salj-nu", "r2-min-rekommendation"] },
    { namn: "värdeökning-prediktion", text: "Aktien kommer att stiga kraftigt nästa år.", vanta: ["p1-kommer-stiga"] },
    { namn: "garanterad avkastning", text: "Metoden ger garanterad avkastning.", vanta: ["r9-garanterad-avkastning"] },
    { namn: "negerad disclaimer = rent", text: "Detta är pedagogisk finansanalys, inte investeringsråd.", vanta: [] },
    { namn: "osäkerhet = rent", text: "Kursen kan komma att stiga eller falla — mekaniken är samma.", vanta: [] },
    { namn: "pedagogiskt exempel = rent", text: "Så räknar man ut om ett bolag är undervärderat — ett räkneexempel.", vanta: [] },
  ];
  let ok = 0;
  for (const f of fall) {
    const fyr = skannaText(f.text, { fil: "(självtest)", slug: "(självtest)", citatyta: false });
    const idn = fyr.map((x) => x.regel);
    const saknas = f.vanta.filter((v) => !idn.includes(v));
    const extra = idn.filter((x) => !f.vanta.includes(x));
    if (saknas.length === 0 && extra.length === 0) {
      ok += 1;
      console.log(`  ✓ ${f.namn}`);
    } else {
      console.log(`  ✗ ${f.namn} — saknas: ${saknas.join(", ") || "–"} · extra: ${extra.join(", ") || "–"}`);
    }
  }
  const grundOk = harGrund("Pedagogisk forskning — aldrig investeringsrådgivning (lagen 2007:528).") && harGrund("_Detta är pedagogisk finansanalys, inte investeringsråd._") && !harGrund("Aktier är kul.");
  console.log(`  ${grundOk ? "✓" : "✗"} grund-detektering (båda verkliga disclaimrarna + negativkontroll)`);
  const total = fall.length + 1;
  console.log(`SJÄLVTEST ${ok + (grundOk ? 1 : 0)}/${total}`);
  return ok + (grundOk ? 1 : 0) === total;
}

if (process.argv.includes("--sjalvtest")) {
  process.exit(sjalvtest() ? 0 : 1);
}

/* ------------------------------------------------------------------ *
 * Huvudspår
 * ------------------------------------------------------------------ */
const JSON_LAGE = process.argv.includes("--json");
const { dokument, fynd, flyttklaraSlugs } = skanna();
const larm = skrivLarm(fynd);
const fel = larm.fynd.filter((f) => f.allvar === "FEL");

if (JSON_LAGE) {
  console.log(JSON.stringify({ ...larm.senasteKorning, flyttklara: [...flyttklaraSlugs].sort(), dokument, fynd: larm.fynd }, null, 2));
} else {
  console.log(`JURIDIKGRIND-VAKTEN ${larm.senasteKorning.ts} — status ${larm.senasteKorning.status}`);
  console.log(`Utkast: ${dokument.filter((d) => d.typ !== "granskningspost" && d.typ !== "sammanstallning").length} · granskningsposter: ${dokument.filter((d) => d.typ === "granskningspost" || d.typ === "sammanstallning").length} · FLYTTKLARA: ${flyttklaraSlugs.size} · fynd: ${larm.senasteKorning.fyndFEL} FEL + ${larm.senasteKorning.fyndVARNING} VARNING`);
  for (const f of larm.fynd) console.log(`  [${f.allvar}] ${f.kategori} ${f.fil} (${f.regel}): ${enLinje(f.utdrag, 110)}`);
  console.log(`Larm: ${path.relative(ROT, LARM_FIL)}`);
}
process.exit(fel.length > 0 ? 1 : 0);
