#!/usr/bin/env node
/**
 * AK1A — Test av demoklientens datakontrakt
 * (src/components/ak1a/pro/demoklient-data.ts — B2B-BESLUT §4c/§7 steg 4,
 * våg 61 bygg-4). Mönster som verktyg/testa-morgonrond-data.mjs:
 *   1. Genererar .tmp/tmp_demoklient_koll.ts (o43: engångsyta — gitignorerad
 *      + tsconfig-exkluderad; ALDRIG i rot, där en SIGKILL-läcka låser
 *      typgrinden för hela trädet) — importerar modulen.
 *   2. Kör den med: npx --yes tsx .tmp/tmp_demoklient_koll.ts
 *   3. Skriver ut en svensk rapport på stdout och städar tmp-filen.
 *
 * Kontroller (BESLUT §7 steg 4(i) — "UTAN någon personuppgift (test på
 * datakontraktet)"):
 *   A. ICKE-PERSON: demoklientens JSON innehåller inga personfält
 *      (personnummer, klientnamn, e-post, adress, depå-id) — aliaset är
 *      "Demoklient ..." och portföljen är forskningsinnehav.
 *   B. TOPP-6 UR BIBLIOTEKET: exakt 6 innehav, alla ur korstabellens rader,
 *      sortering AKM2 fallande (ticker som tie-breaker), vikter lika och
 *      summerar till 1 (±0,002 för avrundningen).
 *   C. DETERMINISM (P1): två anrop ⇒ JSON-identisk demoklient.
 *   D. DÅ-VS-NU: jamforDåNu är kopplad — en jämförelse per innehav; utan
 *      då-serie är akm1Delta null (första mätningen, aldrig påhittat delta).
 *   E. VÅGSAMMANSÄTTNING: 5 horisonter, osattAndel ∈ [0,1], klass ur
 *      typkontraktets fyra vågklasser.
 *   F. NÄSTA UPPFÖLJNING: senaste senastKontrollerad + 30 dagar (ren
 *      datumaritmetik — ingen väggklocka i utdata).
 *   G. AKM2-RESULTAT: formguardat fullständigt AKM2Resultat (komposit,
 *      lager1.poang, lager4.viktPerVariabel) för innehav med cache.
 *
 * Användning:  node verktyg/testa-demoklient-data.mjs
 * Avslutskod:  0 om inga FAIL, 1 annars.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP_KAT = path.join(REPO, ".tmp");
const TMP_TS = path.join(TMP_KAT, "tmp_demoklient_koll.ts");
const TIMEOUT_MS = 240_000; // tsx kan behöva laddas ner första gången

// ── 1) Genererad tmp-testfil (TS — körs via npx tsx, raderas efteråt) ───────
// Obs: ingen backticks/${} inuti denna String.raw-literal.
const TS_KOD = String.raw`// tmp_demoklient_koll.ts — GENERERAD av verktyg/testa-demoklient-data.mjs. Raderas efter körning.
import { lasDemoklient, DEMOKLIENT_ALIAS } from "../src/components/ak1a/pro/demoklient-data";
import { lasKorstabellGrund } from "../src/lib/portfolj-forskning/korstabell-data";

let ok = 0;
let fail = 0;
function kolla(namn, villkor, detalj) {
  if (villkor) {
    ok += 1;
    console.log("PASS " + namn + (detalj ? " — " + detalj : ""));
  } else {
    fail += 1;
    console.log("FAIL " + namn + (detalj ? " — " + detalj : ""));
  }
}

const d = lasDemoklient();
kolla("lasDemoklient levererar underlag", d !== null, d ? d.alias : "null");

if (d) {
  // A. ICKE-PERSON (BESLUT §7 steg 4(i) + FORBUD 1)
  const json = JSON.stringify(d);
  const forbjudna = ["personnummer", "personnr", "fodelsedatum", "epost", "e-post", "adress", "kundnummer", "klientnamn", "depaid", "klient_id"];
  const träff = forbjudna.filter((f) => json.toLowerCase().includes(f));
  kolla("A1 inga personfält i kontraktet", träff.length === 0, träff.length === 0 ? "0 träffar på " + forbjudna.length + " förbjudna nycklar" : "träff: " + träff.join(","));
  kolla("A2 aliaset märker demoklienten", d.alias === DEMOKLIENT_ALIAS && d.alias.startsWith("Demoklient"), d.alias);
  const nycklar = Object.keys(d);
  kolla("A3 kontraktets nycklar är strukturella (icke-person)", nycklar.every((k) => ["alias", "portfoljId", "beskrivning", "innehav", "vagsammansattning", "akm2Resultat", "jamforelser", "daFinns", "nastaUppfoljning", "underlagsdatum", "kalla"].includes(k)), nycklar.join(","));

  // B. TOPP-6 UR FORSKNINGSBIBLIOTEKET
  const grund = lasKorstabellGrund();
  const iKorstabellen = d.innehav.every((i) => grund.rader.some((r) => r.ticker === i.ticker));
  kolla("B1 alla innehav ur korstabellen", iKorstabellen, d.innehav.map((i) => i.ticker).join(","));
  kolla("B2 exakt 6 innehav", d.innehav.length === 6, String(d.innehav.length));
  const akm2Lista = d.innehav.map((i) => i.akm2);
  const sorteradFallande = akm2Lista.every((v, idx) => idx === 0 || (akm2Lista[idx - 1] ?? -Infinity) >= (v ?? -Infinity));
  kolla("B3 sortering AKM2 fallande", sorteradFallande, akm2Lista.join(","));
  const maxIKorstabell = Math.max(...grund.rader.map((r) => (typeof r.akm2 === "number" ? r.akm2 : -1)));
  kolla("B4 toppen av biblioteket", (d.innehav[0].akm2 ?? -1) === maxIKorstabell, "första " + d.innehav[0].akm2 + " mot max " + maxIKorstabell);
  const viktSumma = d.innehav.reduce((s, i) => s + i.vikt, 0);
  kolla("B5 likavikt summerar till 1", Math.abs(viktSumma - 1) < 0.002, viktSumma.toFixed(4));

  // C. DETERMINISM (P1)
  const d2 = lasDemoklient();
  kolla("C1 två anrop ger JSON-identisk demoklient", JSON.stringify(d) === JSON.stringify(d2), "");

  // D. DÅ-VS-NU (jamforDåNu kopplad; första mätningen är ett ärligt svar)
  kolla("D1 en jämförelse per innehav", d.jamforelser.length === d.innehav.length, d.jamforelser.length + " jämförelser");
  if (!d.daFinns) {
    const allaForsta = d.jamforelser.every((j) => j.akm1Delta === null && j.akm1Da === null);
    kolla("D2 utan då-serie är delta null (första mätningen)", allaForsta, "aldrig påhittade delta");
  } else {
    kolla("D2 då-serie finns — jämförelser bär delta eller null", d.jamforelser.every((j) => j.akm1Delta === null || typeof j.akm1Delta === "number"), "");
  }

  // E. VÅGSAMMANSÄTTNING
  const KLASSER = ["impulsvag", "korrigering", "basbygge", "osatt"];
  const hz = d.vagsammansattning.map((v) => v.horisont);
  kolla("E1 fem horisonter", hz.join(",") === "mikro,kort,medellang,lang,mega", hz.join(","));
  kolla("E2 klasser ur kontraktet + osattAndel i [0,1]", d.vagsammansattning.every((v) => KLASSER.includes(v.klass) && v.osattAndel >= 0 && v.osattAndel <= 1), "");

  // F. NÄSTA UPPFÖLJNING (ren datumaritmetik: senast + 30 dagar)
  const senast = d.innehav.map((i) => i.senastKontrollerad).sort().pop();
  const expect = new Date(Date.parse(senast) + 30 * 86400000).toISOString().slice(0, 10);
  kolla("F1 nästa uppföljning = senast + 30 dagar", d.nastaUppfoljning === expect, senast + " → " + d.nastaUppfoljning);

  // G. AKM2-RESULTAT (formguardade fullständiga resultat för radarn)
  const resultat = Object.values(d.akm2Resultat);
  kolla("G1 minst ett fullständigt AKM2Resultat", resultat.length > 0, resultat.length + " st");
  kolla("G2 formen: komposit + lager1.poang + lager4.viktPerVariabel", resultat.every((r) => typeof r.komposit === "number" && !!r.lager1?.poang && !!r.lager4?.viktPerVariabel && r.ticker.length > 0), "");
}

console.log("");
console.log("SUMMA: " + ok + " PASS, " + fail + " FAIL");
process.exit(fail > 0 ? 1 : 0);
`;

// OBS (o43): process.exit inuti try MOSSAR finally i Node — exit sker
// EFTER städningen nedan, annars läcker tmp-filen vid VARJE fail.
let slutkod = 0;
try {
  // .tmp/ = våg 150:s gitignorerade engångsyta, tsconfig-exkluderad (o43) —
  // en SIGKILL-ad körning kan lämna filen kvar utan att tsc/grind någonsin
  // ser den; nästa körning skriver över (idempotent) och stada-tmp-ts.mjs
  // sopar gamla läckor.
  mkdirSync(TMP_KAT, { recursive: true });
  writeFileSync(TMP_TS, TS_KOD, "utf8");
  const r = spawnSync("npx", ["--yes", "tsx", ".tmp/tmp_demoklient_koll.ts"], {
    cwd: REPO,
    stdio: "inherit",
    timeout: TIMEOUT_MS,
    shell: process.platform === "win32",
  });
  if (r.error || r.status !== 0) {
    console.error("Körningen misslyckades: " + (r.error ? r.error.message : "avslutskod " + r.status));
    slutkod = 1;
  }
} finally {
  try {
    unlinkSync(TMP_TS);
  } catch {
    // tmp-filen fanns ej — inget att städa
  }
}
process.exit(slutkod);
