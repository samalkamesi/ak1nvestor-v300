#!/usr/bin/env node
/**
 * KVD — s5-u2 omgång 15 (manifest auto-s5-1789722300593):
 * ib-02-substansens-kvalitet + pe-04-den-privata-agarsidan.
 *
 * Faser:
 *   fore  — kursfilerna mot gällande register (struktur, aritmetik med
 *           oberoende omräkning, korslänkar registeräkta, juridikgrind,
 *           språkgrind, R2-läge i proveniens). KÖRS FÖRE INSERT.
 *   efter — registerparitet (round-trip register↔kursfil), insertläge
 *           (serieordning), kart rader (niva-mappning, kraverFas 0),
 *           llms-tal, larvag-synk-läge. KÖRS EFTER SYNKKEDJAN.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
import { readFileSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const kurs = (slug) => JSON.parse(readFileSync(`${ROT}/data/kurser-tillagg/${slug}.json`, "utf8"));
const register = JSON.parse(readFileSync(`${ROT}/public/deep-courses.json`, "utf8"));
const regSlugs = Object.keys(register);
const NYA = ["ib-02-substansens-kvalitet", "pe-04-den-privata-agarsidan"];
const fas = process.argv[2] ?? "fore";
const pass = [];
const fail = [];
const testa = (namn, villkor, detalj) => (villkor ? pass : fail).push(`${villkor ? "PASS" : "FAIL"} ${namn}${detalj ? " — " + detalj : ""}`);

// ═══════════════════════════ FAS: FÖRE ═══════════════════════════
if (fas === "fore") {
  const SCHEMA = ["slug","category","weight","chapterCount","totalMinutes","title","summary","minutes","xp","level","learn","why","history","chapters_list","chapters","lynchSection","grahamSection","ak1Section"];
  const BLOCKTYP = new Set(["text","definition","insight","tabell","utmaning"]);

  for (const slug of NYA) {
    const j = kurs(slug);
    const t = JSON.stringify(j);

    // A. Struktur
    testa(`${slug} A1 schemafält (17 st)`, SCHEMA.every((k) => k in j), SCHEMA.filter((k) => !(k in j)).join(","));
    testa(`${slug} A2 slug ren ASCII`, /^[a-z0-9][a-z0-9-]*$/.test(j.slug));
    testa(`${slug} A3 kategori PE&IB`, j.category === "PRIVATE EQUITY & INVESTMENTBOLAG");
    testa(`${slug} A4 nivå i trappan`, ["Nybörjare","Intermediär","Avancerad"].includes(j.level), j.level);
    testa(`${slug} A5 kapitelantal 6 = chapters = chapters_list`, j.chapterCount === 6 && j.chapters.length === 6 && j.chapters_list.length === 6);
    testa(`${slug} A6 minuter 6×4 = totalMinutes = minutes = 24`, j.chapters.every((c) => c.minutes === 4) && j.totalMinutes === 24 && j.minutes === 24);
    testa(`${slug} A7 xp 50, weight—`, j.xp === 50 && j.weight === "—");
    testa(`${slug} A8 chapters_list↔chapters paritet (num+titel+minuter)`, j.chapters_list.every((c, i) => c.num === j.chapters[i].num && c.title === j.chapters[i].title && c.minutes === j.chapters[i].minutes));
    testa(`${slug} A9 blocktyper giltiga + ≥2 per kapitel + intro närvarande`, j.chapters.every((c) => c.intro && c.blocks.length >= 2 && c.blocks.every((b) => BLOCKTYP.has(b.type) && typeof b.content === "string" && b.content.length > 20)));
    testa(`${slug} A10 history origin/evolution/modern ≥200 tkn vardera`, ["origin","evolution","modern"].every((k) => typeof j.history[k] === "string" && j.history[k].length >= 200));
    testa(`${slug} A11 sektioner lynch/graham/ak1 ≥300 tkn`, ["lynchSection","grahamSection","ak1Section"].every((k) => typeof j[k] === "string" && j[k].length >= 300));

    // B. Språkgrind (maskinell)
    const CJK = t.match(/[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/g);
    const mjukbin = t.match(/\u00AD/g);
    const typograv = t.match(/[\u201C\u201D\u2018\u2019]/g);
    const tabbar = t.match(/\t/g);
    const kyrill = t.match(/[\u0400-\u04FF]/g);
    const dubbel = t.match(/[a-zåäö]  +[a-zåäö]/gi);
    testa(`${slug} B1 språkgrind: 0 CJK/0 mjuka bindestreck/0 typografiska citattecken/0 tabbar/0 kyrilliska/0 dubbla mellanslag`, !CJK && !mjukbin && !typograv && !tabbar && !kyrill && !dubbel, [CJK && "CJK:" + CJK.join(""), mjukbin && "mjukbin", typograv && "citat", tabbar && "tabbar", kyrill && "kyrill", dubbel && "dubbelmellanslag"].filter(Boolean).join(" "));
    const engelska = t.match(/\b(the|with|own hand|regardless|possible|because|triggered|both feet|margin of safety|structure|Exit)\b/g);
    testa(`${slug} B2 engelskaläckor 0`, !engelska, engelska ? [...new Set(engelska)].join(",") : "");
  }

  // C. Aritmetik — oberoende omräkning + räkneledsnärvaro i text
  const ib = kurs("ib-02-substansens-kvalitet");
  const pe = kurs("pe-04-den-privata-agarsidan");
  const ibText = JSON.stringify(ib);
  const peText = JSON.stringify(pe);
  const arit = (namn, uttryck, vantat, narvaro) => {
    const f = Function('"use strict";return (' + uttryck + ")")();
    testa(`C ${namn} = ${vantat}`, Math.abs(f - vantat) < 1e-9, `beräknat ${f}`);
    if (narvaro) testa(`C ${namn} närvaro i text`, ibText.includes(narvaro) || peText.includes(narvaro), narvaro.slice(0, 40));
  };
  // ib-02: systrarna, noterat, åldrandet, bråket, skatten
  arit("ib-02 Svea 70+25+15-10", "70+25+15-10", 100, "70 + 25 + 15 − 10 = 100");
  arit("ib-02 Norr 20+75+15-10", "20+75+15-10", 100, "20 + 75 + 15 − 10 = 100");
  arit("ib-02 Svea förvaltarvärdet 25/100", "25/100*100", 25, "25 (25 procent)");
  arit("ib-02 Norr förvaltarvärdet 75/100", "75/100*100", 75, "75 (75 procent)");
  arit("ib-02 noterat post 0.30*40", "0.30*40", 12, "30 procent av 40 = 12");
  arit("ib-02 noterat stigen 44*0.30", "44*0.30", 13.2, "44 gånger 0,30 = 13,2");
  arit("ib-02 substanssteg +1,2", "44*0.30-0.30*40", 1.2, "1,2");
  arit("ib-02 stale 20*9", "20*9", 180, "20 gånger 9 = 180");
  arit("ib-02 stale ny 18*6", "18*6", 108, "18 gånger 6 = 108");
  arit("ib-02 stale gap 180-108", "180-108", 72, "180 − 108 = 72");
  arit("ib-02 stale andel 72/180", "72/180*100", 40.0, "40,0 procent");
  arit("ib-02 bråk 0.40*187.5", "0.40*187.5", 75, "0,40 gånger 187,5 = 75");
  arit("ib-02 bråk spegel 0.20*187.5", "0.20*187.5", 37.5, "187,5 gånger 0,20 = 37,5");
  arit("ib-02 vinst 75-15", "75-15", 60, "75 − 15 = 60");
  arit("ib-02 skatt 60*0.25", "60*0.25", 15, "60 gånger 0,25 = 15");
  arit("ib-02 netto 100-15", "100-15", 85, "100 − 15 = 85");
  arit("ib-02 nettokontant 15-10", "15-10", 5, "15 − 10 = 5");
  // pe-04: ön, trappan, resorna, budet
  arit("pe-04 ö 12/1000", "12/1000*100", 1.2, "1,2 procent");
  arit("pe-04 grundare efter emission 100*(1-0.20)", "100*(1-0.20)", 80, "80 procent");
  arit("pe-04 grundare efter köp 80*0.40", "80*0.40", 32, "80 gånger 40 procent = 32");
  arit("pe-04 tillväxtägare efter köp 20*0.40", "20*0.40", 8, "20 gånger 40 procent = 8");
  arit("pe-04 summa efter köp 32+8+60", "32+8+60", 100, null);
  const r12 = [100, 112, 125.4, 140.5, 157.4, 176.2];
  const r2 = [100, 102, 104.0, 106.1, 108.2, 110.4];
  let r12ok = true;
  for (let i = 1; i <= 5; i++) { const s = 100 * Math.pow(1.12, i); if (Math.round(s * 10) / 10 !== r12[i]) r12ok = false; }
  let r2ok = true;
  for (let i = 1; i <= 5; i++) { const s = 100 * Math.pow(1.02, i); if (Math.round(s * 10) / 10 !== r2[i]) r2ok = false; }
  testa("C pe-04 tolvprocenttrappan 5 år (avrundad till tiondel)", r12ok, r12.join("/"));
  testa("C pe-04 tvåprocenttrappan 5 år (avrundad till tiondel)", r2ok, r2.join("/"));
  testa("C pe-04 trappsteg närvaro i tabell", peText.includes("176,2") && peText.includes("110,4") && peText.includes("125,4") && peText.includes("106,1"));
  arit("pe-04 bud 10*1.20", "10*1.20", 12, "12 miljarder");

  // D. Korslänkar registeräkta: varje prefix-referens i texten ska finnas i registret
  // (NYA-paret får referera varandra — samma atomiska kedja för in båda)
  for (const [slug, text] of [["ib-02", ibText], ["pe-04", peText]]) {
    const referenser = [...new Set([...text.matchAll(/[^a-z0-9]([a-z]{1,7}-\d{1,3})[^0-9]/g)].map((m) => m[1]))].filter((r) => !r.startsWith(slug));
    const brute = referenser.filter((r) => !NYA.some((n) => n === r || n.startsWith(r + "-")) && !regSlugs.some((s) => s === r || s.startsWith(r + "-")));
    testa(`${slug} D1 korslänkar registeräkta (${referenser.length} unika prefix, NYA-paret undantaget)`, brute.length === 0, brute.join(","));
  }

  // E. Juridikgrind: 0 rådsfraser, utbildningsframing
  for (const [slug, text] of [["ib-02", ibText], ["pe-04", peText]]) {
    const radfras = text.match(/(du (bor|ska|måste) (köpa|sälja|teckna)|rekommenderar (att du )?(köper|säljer)|köp (denna|aktien|nu)|sälj (dina|aktien|nu)|bäst i (dag|nu))/gi);
    testa(`${slug} E1 juridikgrind 0 rådsfraser`, !radfras, radfras ? radfras.join(";") : "");
    const imperativ = text.match(/^(Köp|Sälj|Teckna|Satsa) /m);
    testa(`${slug} E2 inga imperativ`, !imperativ);
    const framing = /utbildning|studie|övning|exempel|räkneexempel|påhittade/i.test(text);
    testa(`${slug} E3 utbildningsframing närvarande (exempel/övning/påhittade)`, framing);
    const lagrum = text.match(/2007:528|2005:59|2022:260|2022:261|1985:716|2 kap \d+ §/g);
    testa(`${slug} E4 0 lagrum i kurstext (mentorgrindens yta)`, !lagrum, lagrum ? lagrum.join(",") : "");
  }

  // F. R2-läge i proveniens: inga kundpris-/tier-/publiceringsytor
  // (aktiepris/budpris/prissatt är legitim finansvokabulär — mönstren nedan
  // träffar enbart produktpris, tier och publicering)
  for (const slug of NYA) {
    const j = kurs(slug);
    const r2 = JSON.stringify(j).match(/\b\d{1,3}( \d{3})+ (kr|kronor)\b|\b\d{3,} kr\b|fas ?[23]|premium|prenumer|publicer/i);
    testa(`${slug} F1 R2 orörd (0 kundpris-/tier-/publiceringsytor)`, !r2, r2 ? r2[0] : "");
  }
}

// ═══════════════════════════ FAS: EFTER ═══════════════════════════
if (fas === "efter") {
  for (const slug of NYA) {
    // G. Registerparitet round-trip: registerposten DJUPT identisk med kursfilen
    const fil = kurs(slug);
    const post = register[slug];
    testa(`${slug} G1 i registret`, !!post);
    if (post) {
      testa(`${slug} G2 register↔kursfil djupt identiska`, JSON.stringify(post) === JSON.stringify(fil));
      const idx = regSlugs.indexOf(slug);
      // H. Insertläge: serieordning (ib-02 direkt efter ib-01; pe-04 direkt efter pe-03)
      if (slug === "ib-02-substansens-kvalitet") testa(`${slug} H1 insertläge direkt efter ib-01`, regSlugs[idx - 1] === "ib-01-vad-ar-ett-investmentbolag", regSlugs[idx - 1]);
      if (slug === "pe-04-den-privata-agarsidan") testa(`${slug} H1 insertläge direkt efter pe-03`, regSlugs[idx - 1] === "pe-03-forvarvsmaskinen", regSlugs[idx - 1]);
    }
  }
  // I. Kart rader: niva-mappning + kraverFas 0 (R2) + vIndex
  const KARTA_TEXT = readFileSync(`${ROT}/src/lib/larvag-karta.ts`, "utf8");
  const NIVAMAP = { Nybörjare: 1, Intermediär: 2, Avancerad: 3 };
  for (const slug of NYA) {
    const fil = kurs(slug);
    const rad = [...KARTA_TEXT.matchAll(new RegExp('\\{ slug: "' + slug + '", titel: "[^"]+", kategori: "[^"]+", niva: (\\d+), kraverFas: (\\d+), vIndex: (-?\\d+), minuter: (\\d+) \\}', "g"))];
    testa(`${slug} I1 kart rad närvarande exakt en gång`, rad.length === 1, String(rad.length));
    if (rad.length === 1) {
      testa(`${slug} I2 niva ${NIVAMAP[fil.level]} korrekt mappad (${fil.level})`, Number(rad[0][1]) === NIVAMAP[fil.level]);
      testa(`${slug} I3 kraverFas 0 (gratis — R2 orörd)`, Number(rad[0][2]) === 0);
    }
  }
  // J. llms-tal + konstant
  const llms = readFileSync(`${ROT}/public/llms.txt`, "utf8");
  const llmsFull = readFileSync(`${ROT}/public/llms-full.txt`, "utf8");
  const antal = regSlugs.length;
  testa(`J1 llms.txt bär ${antal} kurser ×6`, (llms.split(antal + " kurser").length - 1) === 6);
  testa(`J2 llms-full.txt bär ${antal} kurser ×4`, (llmsFull.split(antal + " kurser").length - 1) === 4);
  const konstant = KARTA_TEXT.match(/LARVAG_ANTAL_KURSER = (\d+)/);
  testa(`J3 kartkonstanten = registret`, Number(konstant?.[1]) === antal, konstant?.[1] + " mot " + antal);
  // K. siffror.json
  const siffror = JSON.parse(readFileSync(`${ROT}/data/siffror.json`, "utf8"));
  testa(`K1 siffror.json kurser = ${antal}`, siffror.kurser === antal, String(siffror.kurser));
  testa(`K2 siffror.json quiz oförändrad 8 223 (kurserna bär inga quiz)`, siffror.quiz === 8223, String(siffror.quiz));
  // L. ai-mentor-register
  const mentor = readFileSync(`${ROT}/src/lib/ai-mentor-register.ts`, "utf8");
  testa(`L1 ai-mentor-register bär båda slugs`, mentor.includes("ib-02-substansens-kvalitet") && mentor.includes("pe-04-den-privata-agarsidan"));
}

// ── Rapport ──────────────────────────────────────────────────────────────────
console.log(pass.join("\n"));
if (fail.length) { console.log("\n" + fail.join("\n")); console.error(`\nKVD RÖD (${fas}) — ${pass.length} PASS, ${fail.length} FAIL`); process.exit(1); }
console.log(`\nKVD GRÖN (${fas}) — ${pass.length} PASS 0 FEL 0 VARNING`);
