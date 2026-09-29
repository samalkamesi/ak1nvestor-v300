#!/usr/bin/env node
// KONTRAKTSSVIT — AKM3-REGIM (v213b-mönstret, spår 7-fortsättning):
// motor src/lib/akm3/regim.ts (AKM3-BESLUT §8 + r2-regimer §2 — steg 5).
//
// Kontrakt som testas (lästa ur motorfilen — aldrig påhittade):
//   · konstanter REGIM_MODELL_VERSION / REGIME_TROSKLAR / REGIMELOGG_GENESIS;
//     G/R-trösklarna ÅTERANVÄNDER forskningslaget.ts:s kanoniska tal
//     (0,10/0,08/0,35/0,30 — en källa till sanning, inga nya magiska tal)
//   · raknaRegime — DESKRIPTIV, aldrig profilstyrande (FORBUD §10.8):
//     genesis (ingen historia ⇒ inträdesbedömning direkt, byte=true),
//     dokumenterat exempel BESLUT §8: G=0,07 R=0,17 ⇒ "magert"
//   · N-vakten: netto-vågbredden gäller först vid ≥ 30 mätta vågbolag —
//     annars N=osatt med ärlig orsaksträng (12 bolag är 2026.09:s verklighet)
//   · fryst tillstånd: samma/äldre senastKontrollerad ⇒ sittande regimen
//     behålls (kvartalskadens — dagar räknas ALDRIG som observationer)
//   · hysteressen: åtskiljda in-/utträdeströsklar + 2 konsekutiva snapshots
//     (3 vid års-Σu > 25 %) innan det reglerade bytet; målet tillbaka ⇒
//     kandidaten dör; magert-bandet G 0,08–0,10 är regimens hemvist
//   · loggrad + hash-kedja: kanonisk JSON utan hash-fältet,
//     sha256(prev + "\n" + kanonisk), stämpling lämnar indata orörd,
//     verifieraRegimekedjan (tom = giltig; tampering = ogiltig)
//   · determinism (P1): samma indata + samma förra rad ⇒ bitidentiskt svar
//
// Miljöklass: DETERMINISTISK — ren funktion, inget fs, inget nät, inga
// klockor; sha256 INJICERAS (node:crypto här i sviten). Kör:
// node verktyg/testa-motor-akm3-regim.mjs
// (Node ≥ 22.18: type stripping via verktyg/ts-import.mjs)
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");
const [major, minor] = process.versions.node.split(".").map(Number);
if (!(major > 22 || (major === 22 && minor >= 18))) {
  console.error("FEL: Node " + process.versions.node + " saknar type stripping (behöver ≥ 22.18).");
  process.exit(1);
}

const { aktiveraTsImport } = await import(pathToFileURL(join(HÄR, "ts-import.mjs")).href);
aktiveraTsImport();

const {
  REGIM_MODELL_VERSION,
  REGIME_TROSKLAR,
  REGIMELOGG_GENESIS,
  raknaRegime,
  byggRegimeLoggrad,
  kanoniskRegimeJSON,
  raknaRegimehash,
  stemplaRegimeRad,
  verifieraRegimekedja,
} = await import(pathToFileURL(join(ROT, "src/lib/akm3/regim.ts")).href);

let pass = 0, fail = 0;
const kontroll = (namn, villkor) => {
  if (villkor) { pass++; console.log("  PASS " + namn); }
  else { fail++; console.log("  FAIL " + namn); }
};
const sha256 = (text) => createHash("sha256").update(text).digest("hex");

console.log("A — modulkontraktet: exporterna finns");
kontroll("A1 tre konstanter + sex funktioner",
  typeof REGIM_MODELL_VERSION === "string" && typeof REGIME_TROSKLAR === "object"
  && typeof REGIMELOGG_GENESIS === "string"
  && [raknaRegime, byggRegimeLoggrad, kanoniskRegimeJSON, raknaRegimehash, stemplaRegimeRad, verifieraRegimekedja]
    .every((f) => typeof f === "function"));

console.log("B — konstanterna (r2 §2.2 — öppna tal, aldrig dolda)");
kontroll('B1 REGIM_MODELL_VERSION = "AKM3.2026.09"', REGIM_MODELL_VERSION === "AKM3.2026.09");
kontroll("B2 G/R-trösklarna speglar forskningslaget.ts: 0,10/0,08/0,35/0,30",
  REGIME_TROSKLAR.gronIntrade === 0.10 && REGIME_TROSKLAR.gronUttrade === 0.08
  && REGIME_TROSKLAR.rodIntrade === 0.35 && REGIME_TROSKLAR.rodUttrade === 0.30);
kontroll("B3 N-trösklar ±0,20/±0,10 · minVagbolagForN 30 · Σu-gate 0,25 · snapshots 2/3",
  REGIME_TROSKLAR.expansivNIntrade === 0.2 && REGIME_TROSKLAR.expansivNUttrade === 0.1
  && REGIME_TROSKLAR.korrigeringIntrade === -0.2 && REGIME_TROSKLAR.korrigeringUttrade === -0.1
  && REGIME_TROSKLAR.minVagbolagForN === 30 && REGIME_TROSKLAR.sigmaArsGate === 0.25
  && REGIME_TROSKLAR.snapshotsNormal === 2 && REGIME_TROSKLAR.snapshotsHogVol === 3);
kontroll("B4 genesis-strängen är dokumenterad och icke-tom", REGIMELOGG_GENESIS === "akm3-regime-logg-genesis-v1");

console.log("C — genesis: första mätningen sätter regimen direkt");
const g1 = raknaRegime({ gronAndel: 0.12, rodAndel: 0.10, senastKontrollerad: "2026-06-30" });
kontroll("C1 G=0,12 R=0,10 ⇒ balanserad, byte=true, nySnapshot=true, kandidat=null",
  g1.regime === "balanserad" && g1.byte === true && g1.nySnapshot === true && g1.kandidat === null);
kontroll("C2 BESLUT §8:s dokumenterade fall: G=0,07 R=0,17 ⇒ magert",
  raknaRegime({ gronAndel: 0.07, rodAndel: 0.17, senastKontrollerad: "2026-09-30" }).regime === "magert");
kontroll("C3 G under utträdeströskeln (0,05) ⇒ magert",
  raknaRegime({ gronAndel: 0.05, rodAndel: 0.10, senastKontrollerad: "2026-09-30" }).regime === "magert");
kontroll("C4 R över inträdeströskeln (0,40) ⇒ magert",
  raknaRegime({ gronAndel: 0.12, rodAndel: 0.40, senastKontrollerad: "2026-09-30" }).regime === "magert");
kontroll("C5 G=null ⇒ osatt (modellen tiger hellre än gissar)",
  raknaRegime({ gronAndel: null, rodAndel: 0.10, senastKontrollerad: "2026-09-30" }).regime === "osatt"
  && raknaRegime({ gronAndel: 0.12, rodAndel: null, senastKontrollerad: "2026-09-30" }).regime === "osatt");
kontroll("C6 trosklar-fältet ekar de öppna talen i svaret (r2 §3.3.5)",
  g1.trosklar.gronIntrade === REGIME_TROSKLAR.gronIntrade && g1.trosklar.minVagbolagForN === 30);

console.log("D — N-indikatorn: vågbreddens vakt");
const d1 = raknaRegime({ gronAndel: 0.12, rodAndel: 0.10, nettoVagbredd: -0.30, antalVagbolag: 35, senastKontrollerad: "2026-09-30" });
kontroll("D1 N=−0,30 med 35 bolag ⇒ korrigering (N ≤ −0,20 kollas först)",
  d1.regime === "korrigering" && d1.nOsattOrsak === "");
kontroll("D2 N=+0,25 med G=0,12 och 35 bolag ⇒ expansiv",
  raknaRegime({ gronAndel: 0.12, rodAndel: 0.10, nettoVagbredd: 0.25, antalVagbolag: 35, senastKontrollerad: "2026-09-30" }).regime === "expansiv");
const d3 = raknaRegime({ gronAndel: 0.12, rodAndel: 0.10, nettoVagbredd: -0.30, antalVagbolag: 12, senastKontrollerad: "2026-09-30" });
kontroll("D3 N-VAKTEN: 12 mätta bolag < 30 ⇒ N osatt, regimen degraderar till G/R (balanserad)",
  d3.regime === "balanserad" && d3.indikatorer.nettoVagbredd === null && d3.nOsattOrsak.includes("n-vakten") && d3.nOsattOrsak.includes("12"));
kontroll("D4 N=+0,25 men bara 12 bolag ⇒ INTE expansiv (onåbart utan mätt N)",
  raknaRegime({ gronAndel: 0.12, rodAndel: 0.10, nettoVagbredd: 0.25, antalVagbolag: 12, senastKontrollerad: "2026-09-30" }).regime === "balanserad");
kontroll("D5 N utanför [−1,1] saneras ⇒ osatt med läsorsak",
  (() => { const r = raknaRegime({ gronAndel: 0.12, rodAndel: 0.10, nettoVagbredd: 2.0, antalVagbolag: 35, senastKontrollerad: "2026-09-30" }); return r.indikatorer.nettoVagbredd === null && r.nOsattOrsak.includes("ej läsbart"); })());
kontroll("D6 antalVagbolag okänt ⇒ N osatt trots mätt bredd",
  raknaRegime({ gronAndel: 0.12, rodAndel: 0.10, nettoVagbredd: 0.25, senastKontrollerad: "2026-09-30" }).indikatorer.nettoVagbredd === null);
kontroll("D7 beskrivningen tillägger N-osattheten öppet när den gäller",
  d3.beskrivning.includes("Netto-vågbredden är osatt") && d1.beskrivning.indexOf("Netto-vågbredden är osatt") === -1);

console.log("E — fryst tillstånd: kvartalskadens idempotens");
const forra = { datum: "2026-09-30", spar: "akm3-regim", modellVersion: "AKM3.2026.09", indikatorer: { gronAndel: 0.07, rodAndel: 0.17, nettoVagbredd: null, sigmaArs: null, antalVagbolag: 12 }, regime: "magert", byte: true, kandidat: { regime: "korrigering", snapshots: 1 }, kravdaSnapshots: 2, beskrivning: "x", nOsattOrsak: "" };
const f1 = raknaRegime({ gronAndel: 0.40, rodAndel: 0.02, senastKontrollerad: "2026-09-30" }, forra);
kontroll("E1 SAMMA datum ⇒ sittande regimen sitter (data ändrad — regimen frysen ändå)",
  f1.regime === "magert" && f1.byte === false && f1.nySnapshot === false);
kontroll("E2 kandidaten ärvs orörd i fruset tillstånd (minnet dör inte av en omräkning)",
  JSON.stringify(f1.kandidat) === JSON.stringify({ regime: "korrigering", snapshots: 1 }));
kontroll("E3 ÄLDRE datum ⇒ också fruset (samma snapshot-identitet)",
  raknaRegime({ gronAndel: 0.40, rodAndel: 0.02, senastKontrollerad: "2026-06-30" }, forra).nySnapshot === false);

console.log("F — hysteressen: 2 konsekutiva snapshots innan bytet");
const genesis = raknaRegime({ gronAndel: 0.12, rodAndel: 0.10, senastKontrollerad: "2026-03-31" });
const logg1 = byggRegimeLoggrad(genesis);
const st1 = logg1 !== null ? stemplaRegimeRad(logg1, REGIMELOGG_GENESIS, sha256) : null;
const s2 = raknaRegime({ gronAndel: 0.05, rodAndel: 0.10, senastKontrollerad: "2026-06-30" }, st1);
kontroll("F1 snapshot 1 mot magert ⇒ KANDIDAT {magert, 1}, inget byte",
  s2.regime === "balanserad" && s2.byte === false && JSON.stringify(s2.kandidat) === JSON.stringify({ regime: "magert", snapshots: 1 }));
const l2 = byggRegimeLoggrad(s2);
const st2 = l2 !== null ? stemplaRegimeRad(l2, st1.hash, sha256) : null;
const s3 = raknaRegime({ gronAndel: 0.05, rodAndel: 0.10, senastKontrollerad: "2026-09-30" }, st2);
kontroll("F2 snapshot 2 med samma mål ⇒ REGLERAT BYTE till magert, kandidaten nollställd",
  s3.regime === "magert" && s3.byte === true && s3.kandidat === null);
const s4 = raknaRegime({ gronAndel: 0.05, rodAndel: 0.10, senastKontrollerad: "2026-06-30" }, st1);
const l4 = byggRegimeLoggrad(s4);
const st4 = l4 !== null ? stemplaRegimeRad(l4, st1.hash, sha256) : null;
const s5 = raknaRegime({ gronAndel: 0.12, rodAndel: 0.10, senastKontrollerad: "2026-09-30" }, st4);
kontroll("F3 målet tillbaka på sittande ⇒ kandidaten DÖR (vippningsspärren)",
  s5.regime === "balanserad" && s5.byte === false && s5.kandidat === null);

console.log("G — Σu-gaten: hög volatilitet kräver 3 snapshots");
const g2 = raknaRegime({ gronAndel: 0.05, rodAndel: 0.10, sigmaArs: 0.30, senastKontrollerad: "2026-06-30" }, st1);
kontroll("G1 års-Σu 30 % > 25 % ⇒ kravdaSnapshots = 3 och snapshot 1 ger endast kandidat",
  g2.kravdaSnapshots === 3 && g2.byte === false && g2.kandidat !== null && g2.kandidat.snapshots === 1);
const lg2 = byggRegimeLoggrad(g2);
const stg2 = lg2 !== null ? stemplaRegimeRad(lg2, st1.hash, sha256) : null;
const g3 = raknaRegime({ gronAndel: 0.05, rodAndel: 0.10, sigmaArs: 0.30, senastKontrollerad: "2026-09-30" }, stg2);
kontroll("G2 snapshot 2 ⇒ kandidat på 2 — fortfarande inget byte",
  g3.byte === false && g3.kandidat !== null && g3.kandidat.snapshots === 2 && g3.regime === "balanserad");
const lg3 = byggRegimeLoggrad(g3);
const stg3 = lg3 !== null ? stemplaRegimeRad(lg3, stg2.hash, sha256) : null;
const g4 = raknaRegime({ gronAndel: 0.05, rodAndel: 0.10, sigmaArs: 0.30, senastKontrollerad: "2026-12-31" }, stg3);
kontroll("G3 snapshot 3 ⇒ REGLERAT BYTE (3-snapshots-bekräftelsen)",
  g4.regime === "magert" && g4.byte === true && g4.kandidat === null);
kontroll("G4 Σu ≤ 25 % ⇒ normala 2 snapshots",
  raknaRegime({ gronAndel: 0.05, rodAndel: 0.10, sigmaArs: 0.25, senastKontrollerad: "2026-06-30" }, st1).kravdaSnapshots === 2);

console.log("H — magert-bandet: regimens hemvist mellan trösklarna");
const mSittande = { ...forra, regime: "magert", kandidat: null, datum: "2026-06-30" };
const m1 = raknaRegime({ gronAndel: 0.09, rodAndel: 0.10, senastKontrollerad: "2026-09-30" }, mSittande);
kontroll("H1 sittande magert + G=0,09 (bandet 0,08–0,10) ⇒ STÅ KVAR — ingen vippning",
  m1.regime === "magert" && m1.byte === false && m1.kandidat === null);
kontroll("H2 samma G=0,09 UTAN historia ⇒ balanserad (bandet är just hysteressen)",
  raknaRegime({ gronAndel: 0.09, rodAndel: 0.10, senastKontrollerad: "2026-09-30" }).regime === "balanserad");
const m2 = raknaRegime({ gronAndel: 0.12, rodAndel: 0.10, senastKontrollerad: "2026-09-30" }, mSittande);
kontroll("H3 utträde: G ≥ 0,10 OCH R ≤ 0,30 ⇒ målet räknas med friska ögon (kandidat balanserad)",
  m2.regime === "magert" && m2.kandidat !== null && m2.kandidat.regime === "balanserad" && m2.byte === false);

console.log("I — saneringen (null är standardutdata, aldrig gissning)");
kontroll("I1 G utanför [0,1] (1,5) ⇒ null ⇒ osatt",
  raknaRegime({ gronAndel: 1.5, rodAndel: 0.10, senastKontrollerad: "2026-09-30" }).regime === "osatt");
kontroll("I2 R negativ (−0,1) ⇒ null ⇒ osatt",
  raknaRegime({ gronAndel: 0.12, rodAndel: -0.1, senastKontrollerad: "2026-09-30" }).regime === "osatt");
kontroll("I3 ogiltig datering (\"31/12\") ⇒ senastKontrollerad = \"\" i svaret",
  raknaRegime({ gronAndel: 0.12, rodAndel: 0.10, senastKontrollerad: "31/12" }).senastKontrollerad === "");
kontroll("I4 ogiltig tidigare rad (datum ej dag-form) ⇒ genesis-väg",
  raknaRegime({ gronAndel: 0.07, rodAndel: 0.17 }, { ...forra, datum: "not-a-date" }).byte === true);

console.log("J — loggrad + hash-kedjan (append-only, prediktionsmönstret)");
const jRad = byggRegimeLoggrad(s3);
kontroll("J1 byggRegimeLoggrad: rad med spar \"akm3-regim\", rätt version, datering och kandidatläge",
  jRad !== null && jRad.spar === "akm3-regim" && jRad.modellVersion === "AKM3.2026.09"
  && jRad.datum === "2026-09-30" && jRad.regime === "magert" && jRad.byte === true);
kontroll("J2 ogiltig datering ⇒ null (loggen tiger tills en mätning finns)",
  byggRegimeLoggrad({ ...s3, senastKontrollerad: "fundag" }) === null);
kontroll("J3 G/R osatta ⇒ null",
  byggRegimeLoggrad({ ...s3, indikatorer: { ...s3.indikatorer, gronAndel: null } }) === null);
const kanon = kanoniskRegimeJSON(jRad);
kontroll("J4 kanonisk JSON är en sträng UTAN hash-fältet och deterministisk 2×",
  typeof kanon === "string" && !kanon.includes("\"hash\"") && kanon === kanoniskRegimeJSON(jRad));
kontroll("J5 raknaRegimehash = sha256(prev + \"\\n\" + kanonisk) — kedjeregeln exakt",
  raknaRegimehash(jRad, REGIMELOGG_GENESIS, sha256) === sha256(REGIMELOGG_GENESIS + "\n" + kanoniskRegimeJSON(jRad)));
const jFöre = JSON.stringify(jRad);
const jStemplad = stemplaRegimeRad(jRad, REGIMELOGG_GENESIS, sha256);
kontroll("J6 stämplingen lämnar indata orörd och ger NY rad med hash",
  JSON.stringify(jRad) === jFöre && jStemplad !== jRad && typeof jStemplad.hash === "string" && jStemplad.hash.length === 64);
kontroll("J7 tom kedja är giltig, null/ickerad ogiltig",
  verifieraRegimekedja([], sha256) === true && verifieraRegimekedja(null, sha256) === false);
const kedja = [st1, st2];
kontroll("J8 äkta tvåradskedja verifierar (append-only intakt)",
  verifieraRegimekedja(kedja, sha256) === true);
const tamper = [{ ...st1, regime: "expansiv" }, st2];
kontroll("J9 TAMPERAT rad 1 (regime bytt utan omhash) ⇒ ogiltig",
  verifieraRegimekedja(tamper, sha256) === false);
const bruten = [{ ...st1, hash: undefined }, st2];
kontroll("J10 rad utan hash ⇒ ogiltig", verifieraRegimekedja(bruten, sha256) === false);
kontroll("J11 kedjan hänger ihop: rad 2:s hash beror på rad 1:s (korrelationsbevis)",
  (() => {
    const alternativ = stemplaRegimeRad(byggRegimeLoggrad(s2), "annan-prev", sha256);
    return verifieraRegimekedja([st1, alternativ], sha256) === false;
  })());

console.log("K — determinism (P1: ren funktion)");
kontroll("K1 samma nu + samma förra rad ⇒ JSON-identiskt svar",
  JSON.stringify(raknaRegime({ gronAndel: 0.05, rodAndel: 0.10, sigmaArs: 0.30, senastKontrollerad: "2026-09-30" }, stg2))
  === JSON.stringify(raknaRegime({ gronAndel: 0.05, rodAndel: 0.10, sigmaArs: 0.30, senastKontrollerad: "2026-09-30" }, stg2)));
kontroll("K2 beskrivningen beskriver UNDERLAGET per datum — aldrig \"marknaden just nu\"",
  !/marknaden just nu/i.test(s3.beskrivning) && s3.beskrivning.length > 0);

// ── kvitto ───────────────────────────────────────────────────────────────────
const totalt = pass + fail;
console.log(`\nSVIT MOTOR AKM3-REGIM: ${pass} PASS / ${fail} FAIL av ${totalt} kontroller`);
console.log("RESULTAT: " + pass + "/" + totalt + " PASS");
process.exit(fail === 0 ? 0 : 1);
