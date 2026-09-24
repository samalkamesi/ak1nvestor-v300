#!/usr/bin/env node
/**
 * Sond _s1u3-ar10-bil-verify.mjs — OBEROENDE granskning av AR10
 * (bilaktier-sa-analyserar-du-biltillverkare-ar.json) mot B10-sv.
 * Klass: AR6-familjen (rond 99/AR6-formatet) + B10:s granskningsliggare
 * (KONTROLL-2026-09-19 + u1-diff + u2-KOMPLEMENT) som ärvtestgrund.
 *
 * Sänder: PASS/NOT/FEL per kontroll + JSON-sammanfattning sist.
 * Skriver ALDRIG till utkastfilerna (read-only). data/-läsning endast.
 */
import { readFileSync } from "node:fs";

const AR_STI = "data/blogg-utkast/bilaktier-sa-analyserar-du-biltillverkare-ar.json";
const SV_STI = "data/blogg-utkast/bilaktier-sa-analyserar-du-biltillverkare.json";
const UNI_STI = "data/portfolj-system/bolagsunivers.json";
const VM_STI = "data/varumarke.json";

const ar = JSON.parse(readFileSync(AR_STI, "utf8"));
const sv = JSON.parse(readFileSync(SV_STI, "utf8"));
const uni = JSON.parse(readFileSync(UNI_STI, "utf8"));
const vm = JSON.parse(readFileSync(VM_STI, "utf8"));

const r = [];
let pass = 0, not = 0, fel = 0;
function P(id, ok, msg) { r.push({ id, dom: ok === true ? "PASS" : ok === "NOT" ? "NOT" : "FEL", msg }); ok === true ? pass++ : ok === "NOT" ? not++ : fel++; }

// ---------- 1. Struktur ----------
const falt = Object.keys(ar);
P("S1-slug", ar.slug === sv.slug + "-ar", `slug "${ar.slug}" == originalet + "-ar"`);
P("S2-form", falt.length === 9 && ["slug","title","description","pillar","author","publishedAt","readingMinutes","tags","body"].every(k => typeof ar[k] !== "undefined"), `9 fält exakt: ${falt.join(",")}`);
P("S3-pillar", ar.pillar === "Institutionell metodik" && ar.author === "AK1A Research Lab", `pillar/author = ${ar.pillar} / ${ar.author}`);
P("S4-title-len", ar.title.length <= 60, `title ${ar.title.length}/60 tkn`);
P("S5-desc-len", ar.description.length <= 155, `description ${ar.description.length}/155 tkn`);
P("S6-tags", Array.isArray(ar.tags) && ar.tags.length === sv.tags.length && ar.tags.length === 5, `tags ${ar.tags.length} = originalets ${sv.tags.length}`);

const arOrd = (ar.title + " " + ar.description + " " + ar.body).split(/\s+/).filter(Boolean).length;
const svOrd = (sv.title + " " + sv.description + " " + sv.body).split(/\s+/).filter(Boolean).length;
const arBody = ar.body.split(/\s+/).filter(Boolean).length;
const svBody = sv.body.split(/\s+/).filter(Boolean).length;
P("S7-ord", arBody >= 800 && arBody <= 1400, `body-ord AR ${arBody}/1400 (mallspannet 800–1400 enligt B10-KONTROLL-19; originalet ${svBody}; total title+desc+body ${arOrd} — AR6:s jämförelseräknesätt)`);
P("S8-rm-600", ar.readingMinutes === Math.round(arOrd / 600), `readingMinutes ${ar.readingMinutes} = round(${arOrd}/600) = ${Math.round(arOrd / 600)} (ar-fabrikens konvention)`);
P("S8b-rm-200-not", "NOT", `KONTRAKTSSPÄNNING: B-guidernas granskningskontrakt ~ord/200 (substansrabatt-domen; B10-sv dömd 2→7 av s1-u1/u2 09-19) ger round(${arOrd}/200) = ${Math.round(arOrd / 200)} — AR bär fortfarande 2. Originalets B2-rättning är EJ verkställd i någon fil; ar-familjen AR1–AR6 godtagna med ord/600. Koordinationspost, ej ensam rättning här.`);

const h2 = (t) => (t.body.match(/^## .+$/gm) || []).length;
P("S9-h2", h2(ar) === h2(sv), `H2-paritet AR ${h2(ar)} = SV ${h2(sv)}`);
const arRader = ar.body.trim().split(/\n+/);
const sista = arRader[arRader.length - 1].trim();
P("S10-disclaimer", sista === "_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._", `disclaimer negerad arabisk form exakt sista rad: "${sista.slice(0, 50)}…"`);
P("S11-publishedAt", ar.publishedAt === "2026-09-20", `publishedAt ${ar.publishedAt} = ar-familjens byggdagskonvention (AR byggd 09-20 01:03; AR6 09-19→09-19; AR1–AR5 09-17/09-19)`);

// ---------- 2. Sifferparitet (normaliserad multiset) ----------
function tokens(text) {
  return (text.match(/\d+(?:\.\d+)?/g) || []);
}
function normSv(text) {
  let t = text.replace(/(\d)\s(\d{3})/g, "$1$2"); // 300 000 → 300000 (upprepas ej behövs för 6-siffrigt i detta material)
  t = t.replace(/(\d),(\d)/g, "$1.$2");            // 96,4 → 96.4
  return t;
}
function normAr(text) {
  return text.replace(/(\d),(\d{3})/g, "$1$2");    // 300,000 → 300000 (tusentelskomma)
}
const svTok = tokens(normSv(sv.title + " " + sv.description + " " + sv.body)).sort();
const arTok = tokens(normAr(ar.title + " " + ar.description + " " + ar.body)).sort();
const svCnt = new Map(), arCnt = new Map();
for (const t of svTok) svCnt.set(t, (svCnt.get(t) || 0) + 1);
for (const t of arTok) arCnt.set(t, (arCnt.get(t) || 0) + 1);
const baraSv = [...svCnt.entries()].filter(([t, n]) => (arCnt.get(t) || 0) !== n);
const baraAr = [...arCnt.entries()].filter(([t, n]) => (svCnt.get(t) || 0) !== n);
P("T1-paritet", baraSv.length === 0 && baraAr.length === 0,
  `siffertoken SV ${svTok.length} · AR ${arTok.length} · multiset-diff: ${baraSv.length + baraAr.length === 0 ? "INGEN" : JSON.stringify({ sv: baraSv, ar: baraAr })}`);

// ---------- 3. Länkar ----------
function interna(text) { return (text.match(/\]\((\/[^)\s]+)\)/g) || []).map(s => s.slice(2, -1)); }
const svL = interna(sv.body), arL = interna(ar.body);
const ms = (a) => { const m = new Map(); for (const x of a) m.set(x, (m.get(x) || 0) + 1); return m; };
const svLm = ms(svL), arLm = ms(arL);
const lDiff = [...svLm.keys()].filter(k => svLm.get(k) !== arLm.get(k));
P("L1-interna", svL.length === arL.length && lDiff.length === 0,
  `interna markdown-länkar SV ${svL.length} · AR ${arL.length} · multiset ${lDiff.length === 0 ? "IDENTISKA" : "diff: " + JSON.stringify(lDiff)}`);
const ext = (t) => (t.match(/https?:\/\/[^\s)]+/g) || []);
P("L2-externa", ext(sv.body + sv.description).length === ext(ar.body + ar.description).length && ext(sv.body).join() === ext(ar.body).join(), `externa URL:er SV ${ext(sv.body).length} = AR ${ext(ar.body).length} (${ext(ar.body).join(" ") || "inga"})`);
const tillUtkast = arL.filter(l => /utkast/.test(l));
P("L3-utkast", tillUtkast.length === 0, `0 länkar till utkast (${tillUtkast.length} träff)`);

// ---------- 4. Juridik 2007:528 ----------
// 4a. Varumärkesgrind: exakt kontrolleraText-replik (26 regexer × 3 ytor)
const ytor = [ar.title, ar.description, ar.body];
let vmFel = 0, vmVarn = 0; const vmTraff = [];
for (const { fran, istallet, allvar } of vm.forbjudnaFraser) {
  const re = new RegExp(fran, "gi");
  for (const y of ytor) {
    re.lastIndex = 0; let m;
    while ((m = re.exec(y)) !== null) {
      vmTraff.push({ fras: m[0].slice(0, 40), allvar });
      allvar === "FEL" ? vmFel++ : vmVarn++;
    }
  }
}
P("J1-varumarke", vmFel === 0 && vmVarn === 0, `varumärkesgrind ${vm.forbjudnaFraser.length} regexer × 3 ytor = ${vmFel} FEL / ${vmVarn} VARNING ${vmTraff.length ? JSON.stringify(vmTraff) : ""}`);

// 4b. Arabiska rådgivningsmönster (AR6:s åtta) — på body UTAN disclaimer
const kropp = ar.body.replace(/_هذا تحليل مالي تعليمي[^_]*_/g, "");
const radMonster = ["اشترِ", "بِعْ", "أنصحك", "نوصي بشراء", "استثمر في هذا", "توصية بالشراء", "توصية بالبيع", "ننصحك"];
const radTraff = radMonster.flatMap(mo => [...kropp.matchAll(new RegExp(mo, "g"))].map(() => mo));
P("J2-radverb", radTraff.length === 0, `arabiska rådgivningsmönster 0 på 8 (${radMonster.join("/")}) — träffar: ${radTraff.join(",") || "0"}`);

// 4c. Bärande utbildningsformel + negerad disclaimer + lagrum
P("J3-formel", /تعليم في المنهجية، لا إرشاداً/.test(ar.body), `bärande formel i ingressen: "تعليم في المنهجية، لا إرشاداً بشأن أسهم بعينها" (= utbildning i metodik, inte vägledning om enskilda aktier)`);
const lagrum = ["2007:528", "2022:260", "2022:261", "1985:716", "2005:59", "LEK 2022", "GDPR"].filter(l => (ar.title + ar.description + ar.body).includes(l));
P("J4-lagrum", lagrum.length === 0, `lagrum i texten: ${lagrum.join(",") || "0"} ⇒ ingen lagrumsblandning möjlig (AR6-klassen)`);

// ---------- 5. 911-referenser ----------
const m911 = ["911", "9/11", "11 سبتمبر", "سبتمبر 2001", "إرهاب", "2001"];
const t911 = m911.flatMap(mo => [...(ar.title + " " + ar.description + " " + ar.body).matchAll(new RegExp(mo.replace(/\//g, "\\/"), "g"))].map(() => mo));
P("N1-911", t911.length === 0, `911-mönster 0 träffar på 6 (arabiska + västerländska) — dimensionen tom, redovisad`);

// ---------- 6. Svenska läckor (å/ä/ö) ----------
let rent = (ar.title + " " + ar.description + " " + ar.body)
  .replace(/\([^)]*\)/g, " ")       // parenteser (URL-slugar, förkortningar)
  .replace(/\[[^\]]*\]\([^)]*\)/g, " "); // markdown-länkar
const leak = [...rent.matchAll(/[åäö]/gi)].map(m => rent.slice(Math.max(0, m.index - 25), m.index + 25));
P("N2-lackor", leak.length === 0, `å/ä/ö efter URL/parentes-strip: ${leak.length} träffar ${leak.length ? JSON.stringify(leak) : ""} (AR6-konventionen: latinska egennamn — Volvo Cars/Tesla/Polestar/PowerCell/LVMH/OICA/IEA/AK1A/Volvo Group/Scania — bär inga diakriter)`);

// ---------- 7. Aritmetik (motorräknad) ----------
const A = [];
A.push(["300000×400000=120 mdr", 300000 * 400000 === 1.2e11]);
A.push(["300000×60000=18 mdr", 300000 * 60000 === 1.8e10]);
A.push(["18−12=6 mdr; 6/120=5 %", 18 - 12 === 6 && Math.round((6 / 120) * 1000) / 10 === 5]);
A.push(["volym −15 %: 255000×60000=15,3; 15,3−12=3,3", 255000 * 60000 === 1.53e10 && Math.abs((15.3 - 12) - 3.3) < 1e-9]);
A.push(["resultatfall (6−3,3)/6=45 %; hävstång 45/15=3×", Math.round(((6 - 3.3) / 6) * 1000) / 10 === 45 && 45 / 15 === 3]);
A.push(["pris −5 %: 380000; (380000−340000)×300000=12 mdr; 12−12=0", 400000 * 0.95 === 380000 && (380000 - 340000) * 300000 === 1.2e10 && 12 - 12 === 0]);
A.push(["Tesla −53/−46: (15−7,1)/15=−52,7≈−53; (7,1−3,8)/7,1=−46,5≈−46", Math.round(-((15 - 7.1) / 15) * 100) === -53 && Math.round(-((7.1 - 3.8) / 7.1) * 100) === -46]);
A.push(["Polestar 2,4 mdr/12 ≈ 200 M/mån", Math.round((2.4e9 / 12) / 1e6) === 200]);
A.push(["LVMH 66/15,6=4,2× och 66/18,9=3,5× > 3 ('mer än tre gånger')", 66 / 15.6 > 4 && 66 / 18.9 > 3]);
P("A1-aritmetik", A.every(([, ok]) => ok), A.map(([n, ok]) => `${ok ? "✓" : "✗"} ${n}`).join(" · "));

// ---------- 8. Universum + B1-rankkontroll (dagens fil) ----------
const brutto = uni.map(p => ({ t: p.ticker, n: p.namn, b: p.lonksamhet?.bruttoMarginal })).filter(x => typeof x.b === "number" && x.b !== null);
const lv = brutto.find(x => x.t === "MC.PA");
const over = brutto.filter(x => x.b > lv.b);
P("U1-rank", "NOT", `B1-ÄRVTARGET rankkontroll i DAGENS universum (231 poster, hamtat 09-20): LVMH bruttoMarginal ${(lv.b * 100).toFixed(2)} % har ${over.length} bolag över (rank ${over.length + 1} av ${brutto.length} värderade) — topp: ${over.slice(0, 4).map(x => x.t + " " + (x.b * 100).toFixed(1) + "%").join(", ")}… — superlativet "أعلى هامش إجمالي" (universums högsta bruttomarginal) är MOTBEVISAT även i dagens fil (09-19-vintagen: rank 52/189, 51 över). B1 kvarstår på AR.`);
const vc = uni.find(p => p.ticker === "VOLCAR-B.ST"), ts = uni.find(p => p.ticker === "TSLA"), ps = uni.find(p => p.ticker === "PSNY"), pc = uni.find(p => p.ticker === "PCELL.ST");
const uCheck = [];
if (vc) uCheck.push(`VolvoCars pe=${vc.vardering?.pe?.toFixed(2)} pb=${vc.vardering?.pb?.toFixed(3)} evEbit=${vc.vardering?.evEbit?.toFixed(1)} ebitMarg=${(vc.lonksamhet?.ebitMarginal * 100).toFixed(2)}% brutto=${(vc.lonksamhet?.bruttoMarginal * 100).toFixed(1)}%`);
if (ts) uCheck.push(`Tesla pe=${ts.vardering?.pe?.toFixed(0)} peg=${ts.vardering?.peg?.toFixed(2)} brutto=${(ts.lonksamhet?.bruttoMarginal * 100).toFixed(1)}%`);
if (ps) uCheck.push(`Polestar pe=${ps.vardering?.pe} kassaManader=${ps.notering?.kassaManaderBurnRate ?? "?"}`);
if (pc) uCheck.push(`PowerCell brutto=${(pc.lonksamhet?.bruttoMarginal * 100).toFixed(1)}% fcfMarg=${(pc.lonksamhet?.fcfMarginal * 100).toFixed(1)}%`);
P("U2-universum", "NOT", `dagens fältvärden (ärvtestets referens; granskning 09-19 grundade 25/25 mot 09-03-vintagen, AR bär desamma tal): ${uCheck.join(" · ")}`);

// ---------- 9. Ärvtest mot B10:s granskningsliggare ----------
// B10-sv KONTROLL 2026-09-19 (s1-u1 huvudpaket + s1-u2 KOMPLEMENT):
// B1 LVMH-superlativ · B2 rm 2→7 · A1 "multipelar" · C1 "det dubbla" ·
// C2 PowerCell förlusttrend · C3 kongruens · C4 "över 20 procent" · D1 publishedAt.
const arv = [];
arv.push(["B1 superlativ", /أعلى هامش إجمالي في عالم التحليل/.test(ar.body), "أعلى هامش إجمالي في عالم التحليل، هامش LVMH عند 66"]);
arv.push(["C1 'det dubbla'", /الضعف مقارنة بمصنّعي السيارات/.test(ar.body), "هامش إجمالي 30.6 بالمئة (الضعف مقارنة بمصنّعي السيارات)"]);
arv.push(["C2 förlusttrend", /مع خسارة متراجعة/.test(ar.body), "مع خسارة متراجعة"]);
arv.push(["C4 'över 20 %'", /نمو يفوق 20 بالمئة/.test(ar.body), "نمو يفوق 20 بالمئة في عام واحد"]);
arv.push(["A1 felstavning (skall SAKNAS i AR)", !/multipelar/.test(ar.description), "arabisk description fri från SV-felstavningen"]);
arv.push(["C3 kongruens (SV-specifik)", true, "arabiskan kongruent — gäller ej AR"]);
P("E1-arvtest", "NOT", `AV 6 ursprungliga poster: ÄRVDA i AR = ${arv.filter(([n, b]) => b && n !== "A1 felstavning (skall SAKNAS i AR)" && n !== "C3 kongruens (SV-specifik)").map(([n]) => n).join(", ")} — AR10 byggdes 09-20 01:03, ~22 h EFTER B10-granskningens diff-filer (09-19 03:28 lokal) — ar-mallen speglade ORIGINALET, inte granskningsdiffen (AR6:s Sandvik-mönster i ny tappning; systemfynd till byggarspåret)`);

// ---------- 10. Interna länkar HTTP (mot localhost) ----------
const unika = [...new Set(arL)];
const httpR = [];
for (const path of unika) {
  try {
    const res = await fetch("http://localhost:3000" + path, { redirect: "follow" });
    httpR.push([path, res.status]);
  } catch (e) {
    httpR.push([path, "FEL:" + e.message]);
  }
}
const doda = httpR.filter(([, s]) => s !== 200);
P("L4-http", doda.length === 0, `interna länkar ${httpR.length - doda.length}/${httpR.length} HTTP 200 mot localhost:3000 ${doda.length ? "DÖDA: " + JSON.stringify(doda) : ""}`);

// ---------- Sammanfattning ----------
console.log(r.map(x => `${x.dom === "PASS" ? "✓" : x.dom === "NOT" ? "○" : "✗"} ${x.id}: ${x.msg}`).join("\n"));
console.log(`\nSUMMA: ${pass} PASS · ${not} NOT · ${fel} FEL`);
console.log("JSON-SAMMANDRAG:");
console.log(JSON.stringify({ objekt: AR_STI, pass, not, fel, kontroller: r, ordAr: arOrd, ordSv: svOrd, http: httpR, rank: { over: over.length, av: brutto.length, lvmh: +(lv.b * 100).toFixed(2) } }, null, 1));
process.exit(fel > 0 ? 1 : 0);
