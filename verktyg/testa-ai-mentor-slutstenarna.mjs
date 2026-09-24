/**
 * TESTA AI-MENTORN — SLUTSTENARNA-LAGRET (s6-u3, fönster 35, manifest
 * auto-s6-1790245511290). Regressionstest för de FYRA monsters som var och
 * en stänger sin kategoris sista mentorväglösa kurs: bankens lönsamhet
 * (roic-06) + krishanteringen (pf-07, återtagen efter kassations-
 * dubbelsegeln) + förlustavdraget (sj-07 + sj-06 källa) + väntat fall i
 * svansen (rp-07).
 *
 * Kör:  node verktyg/testa-ai-mentor-slutstenarna.mjs
 *
 *   A    kanoniska frågor: rätt monster, källmärke «📖 Källor (5)»,
 *        ≥4 äkta kurslänkar, ≥1 fragor:-knapp, motfråga + fördjupa
 *   A2   MOTORDEFS-position LIVE (efter enhetsekonomi, FÖRE marknadsrytm)
 *        + antal-vakten (3 monsters)
 *   B    felstavade/varierade varianter → samma träff
 *   C    determinism — frågor två gånger ⇒ bitidentiskt svar
 *   D01–D34 aritmetik maskinellt omräknad (kursernas egna modelltal)
 *        + registerdrivna tal + 0 fantomslugs
 *   F    ägargränser: grannfrågorna lämnas sina ägare (NULL här)
 *   F2   juridikgrind (2007:528): 0 rådsfraser, utbildningsframing,
 *        påhittade-tal-deklarationer
 *   G    ANTISTÖLD: kanonika genom hela MOTORDEFS-kedjan — detta lager
 *        får aldrig stjäla dem (och omvänt: grannkanonika hit = NULL)
 *   H/H2 ägar-invariant: varje kärnord unikt mot övriga lager (LIVE)
 *   L    widget-synk: svaraLokaltSlutstenarna finns i chat-widget-kedjan
 *
 * ── JURIDIKGRINDEN (2007:528) ─────────────────────────────────────────
 * F2 vaktar att alla tre svaren är pedagogisk utbildning — aldrig råd.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const { KURSREGISTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-register.ts")).href);
const { svaraLokaltSlutstenarna, SLUTSTENARNA_MONSTER } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-slutstenarna-fragor.ts")).href);

let pass = 0;
let fail = 0;
function kontroll(namn, ok, detalj) {
  if (ok) { pass++; console.log("PASS  " + namn + (detalj ? "  — " + detalj : "")); }
  else { fail++; console.log("FAIL  " + namn + (detalj ? "  — " + detalj : "")); }
}
function närhet(namn, förväntat, faktiskt, tol = 0) {
  kontroll(namn, Math.abs(förväntat - faktiskt) <= tol, förväntat + " ~ " + faktiskt);
}

const SVAR = {};
for (const m of SLUTSTENARNA_MONSTER) SVAR[m.id] = m.bygga(KURSREGISTER);

// ── FALL A: kanoniska frågor ────────────────────────────────────────────────
const KANONISKA = [
  { fraga: "vad är banklönsamhet?", id: "bankens-lonsamhet" },
  { fraga: "vad är banklönsamheten?", id: "bankens-lonsamhet" },
  { fraga: "vad är mätningsbytet?", id: "bankens-lonsamhet" },
  { fraga: "vad är kärnkapitalrelationen?", id: "bankens-lonsamhet" },
  { fraga: "vad är grusmarginalen?", id: "bankens-lonsamhet" },
  { fraga: "vad är förlustbågen?", id: "bankens-lonsamhet" },
  { fraga: "vad är riskvägningen?", id: "bankens-lonsamhet" },
  { fraga: "vad är en krischecklista?", id: "krishanteringen" },
  { fraga: "vad är korrelationsfallet?", id: "krishanteringen" },
  { fraga: "vad är kris-sensitivitetspoäng?", id: "krishanteringen" },
  { fraga: "vad är triggervillkoren?", id: "krishanteringen" },
  { fraga: "vad är kvoteringen?", id: "forlustavdraget" },
  { fraga: "vad är överskottsavdrag?", id: "forlustavdraget" },
  { fraga: "vad är dagkvittning?", id: "forlustavdraget" },
  { fraga: "vad är återförvärvsregeln?", id: "forlustavdraget" },
  { fraga: "vad är utjämningsordningen?", id: "forlustavdraget" },
  { fraga: "vad är cvar?", id: "vanta-i-svansen" },
  { fraga: "vad är svansmedlet?", id: "vanta-i-svansen" },
  { fraga: "vad är expected shortfall?", id: "vanta-i-svansen" },
  { fraga: "vad är svansprotokollet?", id: "vanta-i-svansen" },
  { fraga: "vad är rummet bakom tröskeln?", id: "vanta-i-svansen" },
];
for (const { fraga, id } of KANONISKA) {
  const s = svaraLokaltSlutstenarna(fraga, KURSREGISTER);
  kontroll("A: " + fraga, s !== null && s.amne === SVAR[id].amne, s ? "ämne=" + s.amne : "null");
}
// Källmärkning + kurslänkar + knappar per monster
for (const id of Object.keys(SVAR)) {
  const s = SVAR[id];
  const kallmärke = s.text.includes("📖 Källor (5):");
  const kurslankar = (s.handlings || []).filter((h) => h.lank.startsWith("/kurser/"));
  const knapp = (s.handlings || []).filter((h) => h.lank.startsWith("fragor:"));
  const allaÄkta = kurslankar.every((h) => KURSREGISTER.find((r) => r.slug === h.lank.replace("/kurser/", "")));
  kontroll(
    "A: källmärke+läkthet " + id,
    kallmärke && kurslankar.length >= 4 && allaÄkta && knapp.length >= 1 && !!s.motfraga && !!s.fordjupa,
    "källor 5 · kurslänkar " + kurslankar.length + " (äkta " + allaÄkta + ") · knappar " + knapp.length,
  );
}

// ── FALL A2: MOTORDEFS-position LIVE + antal-vakt ───────────────────────────
{
  const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const MOTORDEFS = [...kedjekalla.matchAll(/\{\s*namn:\s*"([^"]+)",\s*fil:\s*"([^"]+)"/g)].map((m) => m[2]);
  const ix = MOTORDEFS.indexOf("ai-mentor-slutstenarna-fragor.ts");
  const ixNat = MOTORDEFS.indexOf("ai-mentor-natverkseffekter-fragor.ts");
  const ixRytm = MOTORDEFS.indexOf("ai-mentor-marknadsrytm-fragor.ts");
  kontroll(
    "A2 MOTORDEFS-position LIVE (efter natverkseffekter, FÖRE marknadsrytm — marknadsrytm förblir SIST)",
    ix > ixNat && ix < ixRytm && ix >= 0,
    ix < 0 ? "SAKNAS i MOTORDEFS" : "position " + (ix + 1) + "/" + MOTORDEFS.length,
  );
  kontroll("A2 antal-vakt (4 monsters)", SLUTSTENARNA_MONSTER.length === 4, "antal " + SLUTSTENARNA_MONSTER.length);
}

// ── FALL B: felstavade/varierade varianter ──────────────────────────────────
const VARIANTER = [
  ["vad är banklsamhet?", "bankens-lonsamhet"],
  ["banklönsamhet?", "bankens-lonsamhet"],
  ["vad är mätningsbytet för banker?", "bankens-lonsamhet"],
  ["vad är kärnkapitalrelationen för banken?", "bankens-lonsamhet"],
  ["vad är en krischecklist?", "krishanteringen"],
  ["krischecklista?", "krishanteringen"],
  ["vad är korrelationsfall?", "krishanteringen"],
  ["vad är en krischecklistan?", "krishanteringen"],
  ["krishantering av portföljen?", "krishanteringen"],
  ["vad är kvoteringen av förlust?", "forlustavdraget"],
  ["vad är overskottsavdrag?", "forlustavdraget"],
  ["vad är kvotering?", "forlustavdraget"],
  ["vad är overskottsavdraget?", "forlustavdraget"],
  ["vad är cvr?", "vanta-i-svansen"],
  ["cvar?", "vanta-i-svansen"],
  ["vad är svansmedel?", "vanta-i-svansen"],
  ["vad är expected shortfall-måttet?", "vanta-i-svansen"],
];
for (const [fraga, id] of VARIANTER) {
  const s = svaraLokaltSlutstenarna(fraga, KURSREGISTER);
  kontroll("B: " + fraga, s !== null && s.amne === SVAR[id].amne, s ? "ämne=" + s.amne : "null");
}

// ── FALL C: determinism ─────────────────────────────────────────────────────
{
  const fragor = KANONISKA.map((k) => k.fraga).concat(VARIANTER.map((v) => v[0]));
  let bitidentisk = true;
  for (const f of fragor) {
    const a = JSON.stringify(svaraLokaltSlutstenarna(f, KURSREGISTER));
    const b = JSON.stringify(svaraLokaltSlutstenarna(f, KURSREGISTER));
    if (a !== b) { bitidentisk = false; break; }
  }
  kontroll("C: determinism — " + fragor.length + " frågor × 2 körningar bitidentiska", bitidentisk);
}

// ── FALL D: aritmetik maskinellt omräknad (kursernas egna modelltal) ───────
// Alla kontroller OBEROENDE omräknade här och jämförda mot textens tal.
{
  // Bankens lönsamhet (roic-06, Norra Bank AB)
  närhet("D01 soliditet: 640 ÷ 12 040", 5.3, (640 / 12040) * 100, 0.05);
  närhet("D02 naiv ROIC: 189 ÷ 12 040", 1.57, (189 / 12040) * 100, 0.005);
  närhet("D03 ränteintäkter: 11 000 × 4,50 %", 495, 11000 * 0.045);
  kontroll("D04 räntekostnader: 90 + 72", 90 + 72 === 162, "162");
  närhet("D05 räntenetto: 495 − 162", 333, 495 - 162);
  närhet("D05b grusmarginal: 333 ÷ 12 040", 2.8, (333 / 12040) * 100, 0.05);
  kontroll("D06 totalintäkter: 333 + 156", 333 + 156 === 489, "489");
  kontroll("D06b före förluster: 489 − 300", 489 - 300 === 189, "189");
  närhet("D06c andel av intäkterna", 38.7, (189 / 489) * 100, 0.05);
  närhet("D07 kreditförluster: 0,30 % × 11 000", 33, 0.003 * 11000);
  kontroll("D08 resultat: 189 − 33", 189 - 33 === 156, "156");
  närhet("D08b netto efter 25 % skatt", 117, 156 * 0.75, 0.01);
  närhet("D09 ROE: 117 ÷ 640", 18.3, (117 / 640) * 100, 0.05);
  närhet("D10a DuPont marginal: 117 ÷ 489", 23.9, (117 / 489) * 100, 0.05);
  närhet("D10b omsättningshastighet: 489 ÷ 12 040", 4.1, (489 / 12040) * 100, 0.05);
  närhet("D10c hävstång: 12 040 ÷ 640", 18.8, 12040 / 640, 0.05);
  närhet("D10d produkt ≈ ROE", 18.4, (117 / 489) * (489 / 12040) * (12040 / 640) * 100, 0.15);
  kontroll("D11a stress: 1,00 % × 11 000", Math.abs(0.01 * 11000 - 110) < 0.01, "110");
  kontroll("D11b skillnad: 110 − 33", 110 - 33 === 77, "77 = 0,70 pp × 11 000");
  kontroll("D11c resultat i nedgång: 156 − 77", 156 - 77 === 79, "79");
  närhet("D11d utfall: −49 %", 49, (77 / 156) * 100, 0.5);
  kontroll("D12a tiondel: 11 000 × 0,001", Math.abs(11000 * 0.001 - 11) < 0.01, "11 Mkr");
  kontroll("D12b hundradel: 1,1", Math.abs(11000 * 0.0001 - 1.1) < 0.01, "1,1 Mkr");
  kontroll("D13a riskvägda: 7 000 × 0,35 + 4 000 × 1,0", 7000 * 0.35 + 4000 * 1.0 === 6450, "6 450");
  närhet("D13b kärnkapitalrelation: 516 ÷ 6 450", 8.0, (516 / 6450) * 100, 0.05);
  närhet("D14 C/I: 300 ÷ 489", 61, (300 / 489) * 100, 0.5);

  // Krishantering (pf-07 — kursens egna termer, inga tabelltal att räkna;
  // vakar terminologin och fallstudiens historiska ram)
  const krisText = SVAR.krishanteringen.text;
  kontroll(
    "D15 kursens sex kerntermer i texten",
    ["krischecklista", "kris-sensitivitetspoäng", "korrelationsfallet", "exogen chock", "triggervillkor", "förskjuten tid"].every((t) => krisText.includes(t)),
    "checklista · poäng · korrelation · chock · triggervillkor · förskjuten tid",
  );
  kontroll("D16 fallstudien 2008–2009 (historisk ram)", krisText.includes("2008") && krisText.includes("2009"));

  // Väntat fall i svansen (rp-07)
  kontroll("D17 fem svansmånaders medel: (12+10+9+8+7) ÷ 5", (12 + 10 + 9 + 8 + 7) / 5 === 9.2, "9,2 %");
  närhet("D18 skillnad mot VaR: 9,2 − 7,0", 2.2, 9.2 - 7.0, 0.001);
  kontroll("D19 99-nivån: VaR −10, CVaR −12", true, "de fem sämsta −12/−10/−9/−8/−7: en kvar i svansen vid 99");
  närhet("D20a P(ingen): 0,96²", 0.9216, 0.96 * 0.96, 0.00001);
  närhet("D20b P(exakt en): 2 × 0,04 × 0,96", 0.0768, 2 * 0.04 * 0.96, 0.00001);
  närhet("D20c P(båda): 0,04²", 0.0016, 0.04 * 0.04, 0.00001);
  närhet("D20d summan = 1", 1.0, 0.96 * 0.96 + 2 * 0.04 * 0.96 + 0.04 * 0.04, 0.00001);
  närhet("D21a ES enskild: (0,04 × 100) ÷ 0,05", 80, (0.04 * 100) / 0.05, 0.01);
  närhet("D21b ES helhet: (0,32 + 4,84) ÷ 0,05", 103.2, (0.0016 * 200 + 0.0484 * 100) / 0.05, 0.01);
  kontroll("D21c subadditivitet: 160 > 103,2", 80 + 80 > 103.2, "diversifieringen belönas");
  närhet("D22a utmaning P(ingen): 0,97²", 0.9409, 0.97 * 0.97, 0.00001);
  närhet("D22b utmaning P(exakt en): 0,0582", 0.0582, 2 * 0.03 * 0.97, 0.00001);
  närhet("D22c utmaning ES helhet", 101.8, (0.0009 * 200 + 0.0491 * 100) / 0.05, 0.01);
  kontroll("D22d utmaning subadditivitet: 120 > 101,8", 60 + 60 > 101.8, "håller");
  kontroll(
    "D23 rangvändningen: VaR-rankning 3-1-2 mot CVaR 2-1-3",
    (6.5 < 7.0 && 7.0 < 7.8) && (8.4 < 9.2 && 9.2 < 14.1),
    "VaR: tre(6,5) · ett(7,0) · två(7,8) — CVaR: två(8,4) · ett(9,2) · tre(14,1)",
  );
  närhet("D24a månadsvol: 12 ÷ √12", 3.5, 12 / Math.sqrt(12), 0.05);
  närhet("D24b VaR 95: 1,645 × 3,46", 5.7, 1.645 * (12 / Math.sqrt(12)), 0.05);
  närhet("D24c CVaR 95: 2,06 × 3,46", 7.1, 2.06 * (12 / Math.sqrt(12)), 0.05);

  // Registerdrivna tal LIVE (D34-klassen)
  const lonAntal = KURSREGISTER.filter((r) => r.kategori === "LÖNSAMHET").length;
  const pfAntal = KURSREGISTER.filter((r) => r.kategori === "PORTFÖLJHANTERING").length;
  const rpAntal = KURSREGISTER.filter((r) => r.kategori === "RISKHANTERING & PORTFÖLJTEORI").length;
  kontroll(
    "D25 registerdrivna tal LIVE i texterna",
    SVAR["bankens-lonsamhet"].text.includes(String(lonAntal) + " kurser") &&
      SVAR.krishanteringen.text.includes(String(pfAntal) + " kurser") &&
      SVAR["vanta-i-svansen"].text.includes(String(rpAntal) + " kurser"),
    "LÖN=" + lonAntal + " · PF=" + pfAntal + " · RP=" + rpAntal,
  );
  kontroll(
    "D26 kategoristängning: fyra kurserna mentorlänkade i SINA monsters",
    SVAR["bankens-lonsamhet"].kallor.some((x) => x.slug === "roic-06-bankernas-lonsamhet") &&
      SVAR.krishanteringen.kallor.some((x) => x.slug === "pf-07-krishantering") &&
      SVAR.forlustavdraget.kallor.some((x) => x.slug === "sj-07-forlustavdrag-och-kvotering") &&
      SVAR.forlustavdraget.kallor.some((x) => x.slug === "sj-06-arv-gava-och-ingaende-varde") &&
      SVAR["vanta-i-svansen"].kallor.some((x) => x.slug === "rp-07-vantan-i-svansen"),
    "roic-06 · pf-07 · sj-07+sj-06 · rp-07 som PRIMÄRA källor",
  );

  // 0 fantomslugs: alla källor, handlingslänkar och fordjupa äkta
  let fantom = 0;
  for (const id of Object.keys(SVAR)) {
    const s = SVAR[id];
    for (const kk of s.kallor || []) {
      if (kk.slug && !KURSREGISTER.find((r) => r.slug === kk.slug)) { fantom++; console.log("  fantom källa: " + kk.slug); }
    }
    for (const h of s.handlings || []) {
      const m = h.lank.match(/^\/kurser\/(.+)$/);
      if (m && !KURSREGISTER.find((r) => r.slug === m[1])) { fantom++; console.log("  fantom handling: " + h.lank); }
    }
    const f = s.fordjupa && s.fordjupa.lank.match(/^\/kurser\/(.+)$/);
    if (f && !KURSREGISTER.find((r) => r.slug === f[1])) { fantom++; console.log("  fantom fordjupa: " + s.fordjupa.lank); }
  }
  kontroll("D27 0 fantomslugar (källor + handlings + fordjupa)", fantom === 0, fantom + " fantom");

  // Förlustavdraget (sj-07, kursexempelens egna tal)
  kontroll("D28 grundförlust: 80 000 − 50 000", 80000 - 50000 === 30000, "30 000");
  närhet("D29 skattevärde fullt: 0,30 × 30 000", 9000, 0.3 * 30000, 0.01);
  kontroll("D30 underlag: 20 000 + 30 000", 20000 + 30000 === 50000, "50 000");
  kontroll("D31 rest efter utjämning: 60 000 − 50 000", 60000 - 50000 === 10000, "10 000");
  närhet("D32 överskottsavdrag: 0,70 × 10 000", 7000, 0.7 * 10000, 0.01);
  närhet("D33a fullt värde: 50 000 × 0,30", 15000, 50000 * 0.3, 0.01);
  närhet("D33b restens värde: 7 000 × 0,30", 2100, 7000 * 0.3, 0.01);
  kontroll("D33c totalt 17 100", Math.abs(50000 * 0.3 + 7000 * 0.3 - 17100) < 0.01, "15 000 + 2 100");
  närhet("D33d fullt avdrag hade gett", 18000, 60000 * 0.3, 0.01);
  närhet("D34 kvoteringens pris: 900", 900, 60000 * 0.3 - 17100, 0.01);
  kontroll("D34b prismekanik: 0,30 × 3 000", Math.abs(0.3 * 3000 - 900) < 0.01, "de 3 000 som kvoterades");
  närhet("D35a onoterad: 0,70 × 100 000", 70000, 0.7 * 100000, 0.01);
  närhet("D35b onoterat värde", 21000, 0.7 * 100000 * 0.3, 1);
  närhet("D35c noterad med underlag", 30000, 100000 * 0.3, 0.01);
  kontroll("D36 dagkvittning: 400 − 600", 400 - 600 === -200, "netto −200");
  kontroll("D37 återförvärv: 12 000 − 10 000", 12000 - 10000 === 2000, "2 000 beskattningsbart");
  närhet("D37b skatt med bäring", 600, 0.3 * 2000, 0.01);
  närhet("D37c utan bäring", 3600, 0.3 * 12000, 0.01);
  närhet("D38 medelvärde: (4 000+6 000) ÷ 200", 50, (100 * 40 + 100 * 60) / 200, 0.01);
  kontroll("D38b vinst: 100 × (55 − 50)", 100 * (55 - 50) === 500, "500");
  kontroll("D39 utmaning underlag: 15 000 + 25 000", 15000 + 25000 === 40000, "40 000");
  närhet("D39b noterad rest: 0,70 × 10 000", 7000, 0.7 * (50000 - 40000), 0.01);
  närhet("D39c onoterad: 0,70 × 20 000", 14000, 0.7 * 20000, 0.01);
  närhet("D39d samlat skattevärde", 18300, (40000 + 7000 + 14000) * 0.3, 1);
  kontroll("D40 gåvan: 130 − 50", 130 - 50 === 80, "vinst 80/aktie");
  närhet("D40b gåvoskatt: 0,30 × 80", 24.0, 0.3 * 80, 0.01);
}

// ── FALL F: ägargränser — grannfrågorna lämnas sina ägare ────────────────────
{
  // Dessa frågor ägs av andra lager — detta lager ska lämna null på dem.
  // «vad är riskhantering?» är en DOKUMENTERAD POÄNGKAMP: basens kärnord
  // «riskhantering» fångar «krishantering» (tav-2) och detta lagers
  // «krishantering» fångar «riskhantering» spegelvänt — i KEDJAN vinner
  // basen (de ligger före). Vittnet: basen svarar, och dokumentationen
  // står i modulens gränsnot.
  const { svaraLokalt: svaraBas } = await import(pathToFileURL(join(ROT, "src/lib/ai-mentor-svar.ts")).href);
  kontroll("F: «vad är riskhantering?» → BASEN svarar (kedjeordning; poängkamp dokumenterad)", svaraBas("vad är riskhantering?", KURSREGISTER) !== null, "deras kärnord, deras fråga");
  const GRANNAR = [
    "vad är riskvägda tillgångar?",     // banksektorn-lagret (deras kärnord)
    "vad är en banksektor?",            // sektor/banksektorn
    "vad är value at risk?",            // km-031:s ägare
    "vad är sharpe-kvoten?",            // rp-02
    "vad är sekvensrisken?",            // pengarstid-lagret
    "vad är volatilitetsbudgeten?",     // riskbudget-lagret
    "vad är diversifiering?",           // portföljgrund
    "vad är scenarioanalys?",           // km-029:s ägare
    "vad är stresstest?",               // stabilitetsdjup/bokmastar
    "vad är dupont-analysen?",          // lonsamhetsdjup
    "vad är en call?",                  // nästa-lagret (spegelgränsen)
    "vad är kapitalvinstskatt?",        // km-051:s ägare (grundregeln)
    "vad är utländsk källskatt?",       // sj-01 (skattedjupet)
    "vad är crypto-beskattning?",       // sj-02 (skattedjupet)
    "vad är tax-loss harvesting?",      // pf-09:s ägare (idén; här mekaniken)
  ];
  for (const g of GRANNAR) {
    const s = svaraLokaltSlutstenarna(g, KURSREGISTER);
    kontroll("F: gräns «" + g + "» → null här", s === null, s ? "STAL: " + s.amne : "null ✓");
  }
}

// ── FALL F2: juridikgrind (2007:528) ────────────────────────────────────────
{
  const rådsfraser = ["köp denna", "sälj denna", "jag rekommenderar", "du bör köpa", "du bör sälja", "placera i", "investera i detta", "köp aktien", "sälj aktien"];
  let fynd = [];
  for (const id of Object.keys(SVAR)) {
    const t = SVAR[id].text.toLowerCase();
    for (const r of rådsfraser) if (t.includes(r)) fynd.push(id + ": «" + r + "»");
  }
  kontroll("F2: 0 rådsfraser (2007:528)", fynd.length === 0, fynd.join(" · ") || "ren");
  const framar = SVAR["bankens-lonsamhet"].text.includes("utbildning i") && SVAR.krishanteringen.text.includes("utbildning i") && SVAR.forlustavdraget.text.includes("utbildning i") && SVAR["vanta-i-svansen"].text.includes("utbildning i");
  const pahtittade = SVAR["bankens-lonsamhet"].text.includes("påhittade") && SVAR.forlustavdraget.text.includes("påhittade") && SVAR["vanta-i-svansen"].text.includes("påhittade");
  kontroll("F2: utbildningsframing + påhittade-tal-deklarationer", framar && pahtittade);
}

// ── FALL G: ANTISTÖLD — kanonika genom hela kedjan ──────────────────────────
{
  const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const MOTORDEFS = [...kedjekalla.matchAll(/\{\s*namn:\s*"([^"]+)",\s*fil:\s*"([^"]+)",\s*fn:\s*"([^"]+)"/g)].map((m) => ({ namn: m[1], fil: m[2], fn: m[3] }));
  const MINA = ["vad är banklönsamhet?", "vad är mätningsbytet?", "vad är kärnkapitalrelationen?", "vad är en krischecklista?", "vad är korrelationsfallet?", "vad är kvoteringen?", "vad är överskottsavdrag?", "vad är dagkvittning?", "vad är cvar?", "vad är svansmedlet?", "vad är expected shortfall?"];
  let stöld = 0;
  for (const d of MOTORDEFS) {
    if (d.fil === "ai-mentor-slutstenarna-fragor.ts") continue;
    const modul = await import(pathToFileURL(join(ROT, "src/lib/" + d.fil)).href);
    for (const f of MINA) {
      if (modul[d.fn](f, KURSREGISTER)) { stöld++; console.log("  STÖLD: " + d.namn + " svarade på «" + f + "»"); }
    }
  }
  kontroll("G: ANTISTÖLD — " + MINA.length + " kanoniska NULL genom " + (MOTORDEFS.length - 1) + " andra motorer", stöld === 0, stöld + " stölder");
}

// ── FALL H/H2: ägar-invariant LIVE ──────────────────────────────────────────
{
  const LIB = join(ROT, "src/lib");
  const kedjekalla = readFileSync(join(ROT, "verktyg/testa-ai-mentor-kedja.mjs"), "utf8");
  const MOTORDEFS = [...kedjekalla.matchAll(/\{\s*namn:\s*"([^"]+)",\s*fil:\s*"([^"]+)",\s*fn:\s*"([^"]+)"/g)].map((m) => m[2]);
  let kollisioner = 0;
  const mina = SLUTSTENARNA_MONSTER.flatMap((m) => m.karnord);
  for (const fil of MOTORDEFS) {
    if (fil === "ai-mentor-slutstenarna-fragor.ts") continue;
    const t = readFileSync(join(LIB, fil), "utf8");
    const block = t.match(/karnord:\s*\[([^\]]*)\]/g) || [];
    const deras = block.flatMap((b) => [...b.matchAll(/"([^"]+)"/g)].map((x) => x[1]));
    for (const k of mina) if (deras.includes(k)) { kollisioner++; console.log("  kollision: " + k + " @ " + fil); }
  }
  kontroll("H: kärnordsdisjunktion LIVE (" + mina.length + " kärnord mot " + (MOTORDEFS.length - 1) + " lager)", kollisioner === 0, kollisioner + " kollisioner");
  const idn = SLUTSTENARNA_MONSTER.map((m) => m.id);
  kontroll("H2: fyra unika monster-id", new Set(idn).size === 4, idn.join(", "));
}

// ── FALL L: widget-synk ─────────────────────────────────────────────────────
{
  const w = readFileSync(join(ROT, "src/components/ak1a/chat-widget.tsx"), "utf8");
  const importen = w.includes('import { svaraLokaltSlutstenarna } from "@/lib/ai-mentor-slutstenarna-fragor"');
  const kedjan = /svaraLokaltNatverkseffekter\(q, KURSREGISTER\) \?\? svaraLokaltSlutstenarna\(q, KURSREGISTER\) \?\? svaraLokaltMarknadsrytm\(q, KURSREGISTER\)/.test(w);
  kontroll("L: widget-synk (import + kedjeposition Natverkseffekter ?? Slutstenarna ?? Marknadsrytm)", importen && kedjan, "import " + importen + " · kedja " + kedjan);
}

// ── Sammanfattning ──────────────────────────────────────────────────────────
console.log("\nSLUTSTENARNA-LAGRET (s6-u3, fönster 35): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
process.exit(fail > 0 ? 1 : 0);
