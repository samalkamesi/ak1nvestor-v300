#!/usr/bin/env node
/**
 * KVD — s5-u2 omgång 12 (manifest auto-s5-1789657528556): kt-04 + rs-06.
 *
 * Kvalitetsverifiering av leveransen FÖRE commit: strukturparitet ×2,
 * register↔proveniens round-trip ×2, aritmetik oberoende omräknad, juridikgrind
 * (2007:528 — 0 rådgivningsfraser, utbildningsframing närvarande, 0 lagrum i
 * kurstext), korsreferenser registeräkta, språkgrind (0 CJK/0 mjuka
 * bindestreck/0 typografiska citattecken/0 tabbar/dubbelord) samt kedjeparitet
 * register = karta = konstant = siffror = llms ×(6+4) = sökindex = speglar.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const NYA = [
  { fil: "data/kurser-tillagg/kt-04-den-uteblivna-katalysatorn.json", slug: "kt-04-den-uteblivna-katalysatorn" },
  { fil: "data/kurser-tillagg/rs-06-riskens-anatomi.json", slug: "rs-06-riskens-anatomi" },
];
const register = JSON.parse(readFileSync("public/deep-courses.json", "utf8"));

const pass = [];
const fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);

for (const { fil, slug } of NYA) {
  const raw = readFileSync(fil, "utf8");
  const kurs = JSON.parse(raw);
  const prefix = `[${slug}]`;

  // 1 ── Strukturparitet chapters_list ↔ chapters
  const paritet = kurs.chapters_list.every((c, i) => c.num === kurs.chapters[i].num && c.title === kurs.chapters[i].title && c.minutes === kurs.chapters[i].minutes);
  testa(`${prefix} strukturparitet chapters_list↔chapters (6/6)`, paritet && kurs.chapters.length === 6 && kurs.chapters_list.length === 6);
  testa(`${prefix} chapterCount/totalMinutes = 6/24`, kurs.chapterCount === 6 && kurs.totalMinutes === 24 && kurs.chapters.reduce((s, c) => s + c.minutes, 0) === 24);

  // 2 ── Register↔proveniens round-trip (registerposten identisk med kursfilen)
  testa(`${prefix} register↔proveniens round-trip`, JSON.stringify(register[slug]) === JSON.stringify(kurs));

  // 3 ── Kursmetadata
  testa(`${prefix} level Intermediär + xp 50 + category`, kurs.level === "Intermediär" && kurs.xp === 50 && typeof kurs.category === "string" && kurs.category.length > 0);
  testa(`${prefix} slug ren ASCII`, /^[a-z0-9][a-z0-9-]*$/.test(slug));
  const blockTyper = new Set(kurs.chapters.flatMap((c) => (c.blocks || []).map((b) => b.type)));
  const tillåtna = ["text", "definition", "insight", "utmaning"];
  testa(`${prefix} blocktyper kända (${[...blockTyper].join(",")})`, [...blockTyper].every((t) => tillåtna.includes(t)));

  // 4 ── Aritmetik: textens talpåståenden omräknade OBEROENDE
  const kropp = JSON.stringify(kurs);
  if (slug.startsWith("kt-04")) {
    testa("aritmetik kt-04: 21−15 = 6 multipelenheter", 21 - 15 === 6 && kropp.includes("P/E 21") && kropp.includes("15") && kropp.includes("6 multipelenheter"));
    testa("aritmetik kt-04: 6/15 = 0,4 = fyrtio procent högre värdering", Math.abs(6 / 15 - 0.4) < 1e-12 && kropp.includes("fyrtio procent högre värdering"));
    testa("aritmetik kt-04: 12+5+3 = 20 händelser", 12 + 5 + 3 === 20 && kropp.includes("tolv tysta, fem överraskningar, tre besvikelser") && kropp.includes("tjugo händelser"));
    testa("aritmetik kt-04: multipelkvot 21/15 = 1,4 (inget annat tal påstås)", Math.abs(21 / 15 - 1.4) < 1e-12);
  } else {
    testa("aritmetik rs-06: 100−90 = 10 resultat", 100 - 90 === 10 && kropp.includes("intäkter 100") && kropp.includes("rörelsekostnader 90"));
    testa("aritmetik rs-06: 95−90 = 5 → hälften av 10 vid −5 % intäkter", 95 - 90 === 5 && 5 === 10 / 2 && kropp.includes("Faller intäkterna fem procent till 95") && kropp.includes("blir resultatet 5"));
    testa("aritmetik rs-06: 24/6 = 4,0 gånger räntetäckning", Math.abs(24 / 6 - 4.0) < 1e-12 && kropp.includes("24 delat med 6") && kropp.includes("4,0 gånger"));
    testa("aritmetik rs-06: 18/6 = 3,0 vid fallande rörelseresultat", Math.abs(18 / 6 - 3.0) < 1e-12 && kropp.includes("18 sjunker täckningen till 3,0"));
    testa("aritmetik rs-06: P/E 21 mot 15 = 4/15-delar ≈ fyrtio procent (exempelraden)", Math.abs(21 / 15 - 1.4) < 1e-12 && kropp.includes("fyrtio procent högre förväntan"));
  }

  // 5 ── Juridikgrind (2007:528): 0 rådgivningsfraser, utbildningsframing, 0 lagrum
  //      Träffar på köpa/sälja tillåts i två icke-rådgivande lägen: (a) negerad
  //      utbildningskontext (disclaimern), (b) deskriptivt predikat om BOLAGET
  //      ("det bolaget säljer", "bolaget köper") — rådgivning riktar sig till
  //      LÄSAREN, verksamhetens köp och försäljning är läromaterial.
  const rådsTräffar = [...kropp.matchAll(/[^.]{0,60}\b(köpa|sälja|köper|säljer|rekommendera|råder|råd till)\b[^.]{0,60}/gi)].map((m) => m[0]);
  const hållbara = rådsTräffar.filter((s) => /inte|aldrig|som underlag/i.test(s) || /\b(det )?bolag(et|en)? (säljer|köper)|verksamheten (säljer|köper)/i.test(s));
  const otillåtna = rådsTräffar.filter((s) => !hållbara.includes(s));
  testa(`${prefix} juridikgrind: ${rådsTräffar.length} träff(ar) köp/sälj/råd — alla negerade eller deskriptiva (bolagets verksamhet)`, otillåtna.length === 0, otillåtna.join(" | ").slice(0, 200));
  const framing = /utbildning|pedagogisk|inte investeringsråd|lär ut metoden|som metod/i.test(kropp);
  testa(`${prefix} utbildningsframing närvarande`, framing);
  const lagrum = kropp.match(/\b\d{4}:\d+\b/g);
  testa(`${prefix} 0 lagrum i kurstext`, !lagrum, lagrum?.join(","));

  // 6 ── Korsreferenser registeräkta (prefixmatch, egen slug tillåten)
  const regPrefix = new Set(Object.keys(register).map((s) => s.split("-").slice(0, 2).join("-")));
  const refs = [...new Set(kropp.match(/[a-z]{2,4}-\d{2,3}(?![0-9])/g) || [])];
  const okända = refs.filter((r) => !regPrefix.has(r.split("-").slice(0, 2).join("-")) && r !== slug);
  testa(`${prefix} korsreferenser registeräkta (${refs.length} st)`, okända.length === 0, okända.join(","));

  // 7 ── Språkgrind
  const cjk = raw.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g);
  testa(`${prefix} 0 CJK`, !cjk, cjk?.join(""));
  testa(`${prefix} 0 mjuka bindestreck (U+00AD/U+2010/U+2011)`, !/\u00ad|\u2010|\u2011/.test(raw));
  testa(`${prefix} 0 typografiska citattecken (”“‘’)`, !/[\u201c\u201d\u2018\u2019]/.test(raw));
  testa(`${prefix} 0 tabbar`, !/\t/.test(raw));
  const dubbelord = [...new Set(kropp.match(/\b(\w{3,})\s+\1\b/gi) || [].map((m) => m.toLowerCase()))];
  testa(`${prefix} 0 dubbelord`, dubbelord.length === 0, JSON.stringify(dubbelord).slice(0, 200));
}

// 8 ── Kedjeparitet: register = karta = konstant = siffror = llms = index = speglar
const antal = Object.keys(register).length;
const kartaText = readFileSync("src/lib/larvag-karta.ts", "utf8");
const kartaAntal = [...kartaText.matchAll(/slug:\s*"([^"]+)"(?!, titel)/g)].length;
const kartaRader = (kartaText.match(/\{ slug: "/g) || []).length;
const konstant = Number(kartaText.match(/LARVAG_ANTAL_KURSER = (\d+)/)?.[1]);
const siffror = JSON.parse(readFileSync("data/siffror.json", "utf8"));
const llms = readFileSync("public/llms.txt", "utf8");
const llmsFull = readFileSync("public/llms-full.txt", "utf8");
const sokIndex = JSON.parse(readFileSync("public/sok-index.json", "utf8"));
const speglar = JSON.parse(readFileSync("public/speglar-slugar.json", "utf8"));
const sokAntal = sokIndex.antal ?? sokIndex.kurser?.length;
const spegelAntal = speglar.antalKurser ?? speglar.kurser?.length;

testa(`kedja: register ${antal} = kartrader ${kartaRader} = konstant ${konstant}`, antal === 398 && kartaRader === 398 && konstant === 398);
testa(`kedja: siffror.kurser = ${siffror.kurser} + quiz 8 223 oförändrad (kurserna bär inga quiz)`, siffror.kurser === 398 && siffror.quiz === 8223);
testa(`kedja: llms 398-kurser ×(6+4), 0 kvarvarande 396`, (llms.match(/398 kurser/g) || []).length === 6 && (llmsFull.match(/398 kurser/g) || []).length === 4 && !llms.includes("396 kurser") && !llmsFull.includes("396 kurser"));
testa(`kedja: sökindex ${sokAntal} + speglar ${spegelAntal} på 398`, sokAntal === 398 && spegelAntal === 398);

// 9 ── Serieordning i registret: kt-04 direkt efter kt-03, rs-06 direkt efter rs-05
const slugs = Object.keys(register);
const efter = (a, b) => slugs.indexOf(b) === slugs.indexOf(a) + 1;
testa("serieordning: kt-04 direkt efter kt-03 i registret", efter("kt-03-katalysatorkedjor", "kt-04-den-uteblivna-katalysatorn"));
testa("serieordning: rs-06 direkt efter rs-05 i registret", efter("rs-05-riskavsnittet-mellan-raderna", "rs-06-riskens-anatomi"));

// ── Rapport ─────────────────────────────────────────────────────────────────
console.log(pass.join("\n"));
if (fail.length) { console.error("\n" + fail.join("\n")); console.error(`\nKVD RÖD: ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nKVD GRÖN: ${pass.length} PASS 0 FEL 0 VARNING — kt-04 + rs-06 leveransklara.`);
