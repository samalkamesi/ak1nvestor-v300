#!/usr/bin/env node
// KONTRAKTSSVIT — ORGAN-BUS (våg 213b / u4): motor src/lib/autonom/organ-bus.ts
//
// Kontrakt som testas (lästa ur motorfilen — aldrig påhittade):
//   · mikroRapporter(): REN deterministisk kärna — exakt fem organ i fast
//     ordning (Kurs, Blogg, Analys, Marknad, Retention), trösklarna
//     kurser 226 / bloggDagarSedan >3 / analyser <5 / besokare7d <10 /
//     konvertering <8, retention alltid "varning", matt+vokabulär-formen
//   · skicka()/lasSenaste(): nätverksfria fail-safe-kontrakt UTAN
//     Supabase-konfig (false / []), och TRANSPORTKONTRAKTEN under
//     kontrollerad fetch-stub + ogiltig fake-env: POST mot
//     /rest/v1/system_events med type "organ_msg", severity "info",
//     source "organ-bus", message-prefix "[från→till:typ]" och
//     JSON-trunkering vid 300 tecken; GET med type=eq.organ_msg +
//     limit + vaktfiltrering (details ?? fran/till måste finnas)
//   · korRunda(): deterministisk koordineringsrond — levererar HELT
//     RondResultat även utan konfig, prioritering atgardar(3) >
//     varning(2) > ok(1) med stabil sortering, max 3 beslut,
//     score = poang × 10, delegationsKo = beslutens titlar, och
//     exakt 7 transportanrop per rond (1 fråga + 5 rapporter + 1
//     delegation — rubrikens bounded-löfte)
//
// Miljöklass: DETERMINISTISK — Supabase-env stryks FÖRE import (inga skarpa
// anrop kan ske: getSupabaseRest ⇒ null); transporttesterna kör en
// lokal fetch-stub mot fake-ref.supabase.co (ogiltig projektref +
// uppdiktad nyckel — nåbar endast av stubben, aldrig av riktigt nätverk).
// Ingen server, inga timers som överlever process.exit, inga externa
// processer. Kör: node verktyg/testa-motor-organ-bus.mjs
// (Node ≥ 22.18: type stripping; tsx-återfall fungerar också)
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

// Nätverksfri miljö (signal-bus-precedensen): Supabase-env stryks FÖRE import —
// skicka-/läsgrenarna ska visa sina graceful-fall, aldrig göra skarpa anrop.
// getSupabaseRest läser process.env vid ANROPSTID men strykningen står kvar
// tills transportsektionen medvetet installerar sin ogiltiga fake-konfig.
const ENV_NYCKLAR = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
const SPARAD_ENV = Object.fromEntries(ENV_NYCKLAR.map((k) => [k, process.env[k]]));
for (const k of ENV_NYCKLAR) delete process.env[k];

const { skicka, lasSenaste, mikroRapporter, korRunda } =
  await import(pathToFileURL(join(ROT, "src/lib/autonom/organ-bus.ts")).href);

let pass = 0, fail = 0;
const kontroll = (namn, villkor) => {
  if (villkor) { pass++; console.log("  PASS " + namn); }
  else { fail++; console.log("  FAIL " + namn); }
};

// Signalerna (mätta IO-värden — motorfilens egen indataform)
const HELT_OK = { kurser: 226, bloggAntal: 40, bloggDagarSedan: 1, analyser: 6, besokare7d: 50, konvertering: 9, medlemmar: 25 };
const NOLL = { kurser: 0, bloggAntal: 0, bloggDagarSedan: 0, analyser: 0, besokare7d: 0, konvertering: 0, medlemmar: 0 };
const KASSTRÖFEL = { kurser: 200, bloggAntal: 10, bloggDagarSedan: 5, analyser: 2, besokare7d: 3, konvertering: 2, medlemmar: 0 };
const STATUSVOKAB = ["ok", "varning", "atgardar"];

console.log("A — modulkontraktet: exporterna finns");
kontroll("A1 samtliga tre exporterade funktioner är funktioner",
  [skicka, lasSenaste, mikroRapporter, korRunda].every((f) => typeof f === "function"));

console.log("B — mikroRapporter: den rena deterministiska kärnan");
const b1 = mikroRapporter(HELT_OK);
kontroll("B1 exakt fem rapporter (ett per mikro-organ)", b1.length === 5);
kontroll('B2 organnamn i fast ordning ["Kurs-organet","Blogg-organet","Analys-organet","Marknad-organet","Retention-organet"]',
  JSON.stringify(b1.map((r) => r.organ)) === JSON.stringify(["Kurs-organet", "Blogg-organet", "Analys-organet", "Marknad-organet", "Retention-organet"]));
kontroll("B3 status ∈ vokabulären (samtliga rapporter)",
  b1.every((r) => STATUSVOKAB.includes(r.status)));
kontroll("B4 matt är icke-tomma objekt med number|string-värden",
  b1.every((r) => r.matt instanceof Object && !Array.isArray(r.matt) && Object.keys(r.matt).length > 0
    && Object.values(r.matt).every((v) => typeof v === "number" || typeof v === "string")));
kontroll("B5 forslag är arrayer med icke-tomma strängar",
  b1.every((r) => Array.isArray(r.forslag) && r.forslag.length > 0 && r.forslag.every((f) => typeof f === "string" && f.length > 0)));

const b6 = mikroRapporter(HELT_OK).find((r) => r.organ === "Kurs-organet");
kontroll("B6 Kurs: status alltid ok + matt mal 226 även vid fullt mål",
  b6.status === "ok" && b6.matt.kurser === 226 && b6.matt.mal === 226);
kontroll('B7 Kurs vid mål: förslag "Kursbiblioteket komplett — nästa: övningsuppgifter per kurs"',
  b6.forslag[0] === "Kursbiblioteket komplett — nästa: övningsuppgifter per kurs");
kontroll("B8 Kurs under mål (200): fortfarande ok + räkningen 'Fyll på: 26 kurser kvar'",
  (() => { const r = mikroRapporter(KASSTRÖFEL).find((x) => x.organ === "Kurs-organet"); return r.status === "ok" && r.forslag[0] === "Fyll på: 26 kurser kvar"; })());
kontroll("B9 Kurs vid noll: 'Fyll på: 226 kurser kvar'",
  mikroRapporter(NOLL)[0].forslag[0] === "Fyll på: 226 kurser kvar");

const grans3 = mikroRapporter({ ...KASSTRÖFEL, bloggDagarSedan: 3 }).find((r) => r.organ === "Blogg-organet");
const grans4 = mikroRapporter({ ...KASSTRÖFEL, bloggDagarSedan: 4 }).find((r) => r.organ === "Blogg-organet");
kontroll("B10 Blogg tröskel: 3 dagar ⇒ ok (gränsen är > 3)", grans3.status === "ok");
kontroll('B11 Blogg tröskel: 4 dagar ⇒ atgardar + förslag "Publicera idag…" med färskhetstalen',
  grans4.status === "atgardar" && grans4.forslag[0].startsWith("Publicera idag:") && grans4.forslag[0].includes("4 dagar"));
kontroll('B12 Blogg matt: malCadence "3-4/vecka" + dagarSedanSenaste speglar indatan',
  grans4.matt.malCadence === "3-4/vecka" && grans4.matt.dagarSedanSenaste === 4 && grans4.matt.inlagg === 10);
kontroll('B13 Blogg frisk cadance: "Cadence hållen — planera nästa 2 ämnen"',
  grans3.forslag[0] === "Cadence hållen — planera nästa 2 ämnen");

const an5 = mikroRapporter({ ...KASSTRÖFEL, analyser: 5 }).find((r) => r.organ === "Analys-organet");
const an4 = mikroRapporter({ ...KASSTRÖFEL, analyser: 4 }).find((r) => r.organ === "Analys-organet");
kontroll("B14 Analys tröskel: 5 ⇒ ok (gränsen är < 5) + underhållsförslag",
  an5.status === "ok" && an5.forslag[0] === "Underhåll: uppdatera befintliga vid kvartalsrapporter");
kontroll("B15 Analys tröskel: 4 ⇒ atgardar + räkningen '1 nya bolag till mål'",
  an4.status === "atgardar" && an4.forslag[0] === "1 nya bolag till mål — motor redo (E2E-verifierad)");
kontroll("B16 Analys matt: malMinst 5 + analyser speglar indatan",
  an4.matt.analyser === 4 && an4.matt.malMinst === 5);

const ma10 = mikroRapporter({ ...KASSTRÖFEL, besokare7d: 10, konvertering: 8 }).find((r) => r.organ === "Marknad-organet");
const ma9 = mikroRapporter({ ...KASSTRÖFEL, besokare7d: 9, konvertering: 7.9 }).find((r) => r.organ === "Marknad-organet");
kontroll("B17 Marknad tröskel: 10 besökare ⇒ ok (gränsen är < 10)", ma10.status === "ok");
kontroll("B18 Marknad tröskel: 9 besökare ⇒ atgardar", ma9.status === "atgardar");
kontroll("B19 Marknad konvertering 8 ⇒ INGET 'Stärk CTA'-förslag (gränsen är < 8)",
  !ma10.forslag.some((f) => f.startsWith("Stärk CTA")));
kontroll("B20 Marknad konvertering 7.9 ⇒ 'Stärk CTA'-förslag finns",
  ma9.forslag.some((f) => f.startsWith("Stärk CTA")));
kontroll('B21 Marknad: "Registrera sitemap i Search Console (grundare)" finns ALLTID (båda grenarna)',
  ma10.forslag.includes("Registrera sitemap i Search Console (grundare)")
  && ma9.forslag.includes("Registrera sitemap i Search Console (grundare)"));
kontroll("B22 Marknad matt: besokare7d/konverteringProcent/malKonvertering 8",
  ma9.matt.besokare7d === 9 && ma9.matt.konverteringProcent === 7.9 && ma9.matt.malKonvertering === 8);

const ret = mikroRapporter(HELT_OK).find((r) => r.organ === "Retention-organet");
kontroll("B23 Retention: status alltid varning (kvarhållning omätbar)",
  mikroRapporter(HELT_OK)[4].status === "varning" && mikroRapporter(NOLL)[4].status === "varning");
kontroll("B24 Retention matt: medlemmar speglar indatan + notering om mätstart >10",
  ret.matt.medlemmar === 25 && typeof ret.matt.notering === "string" && ret.matt.notering.includes(">10 medlemmar"));
kontroll("B25 Retention förslag: fortsättnings-listan (F2) är förslag[0]",
  ret.forslag[0].includes("F2"));

const b26 = mikroRapporter(KASSTRÖFEL);
kontroll("B26 KASSTRÖFEL-signal: statusar [ok,atgardar,atgardar,atgardar,varning]",
  JSON.stringify(b26.map((r) => r.status)) === JSON.stringify(["ok", "atgardar", "atgardar", "atgardar", "varning"]));
kontroll("B27 nollsignal: fortfarande fem välformade rapporter",
  mikroRapporter(NOLL).length === 5 && mikroRapporter(NOLL).every((r) => STATUSVOKAB.includes(r.status) && r.forslag.length > 0));
kontroll("B28 determinism (samma indata två anrop ⇒ byte-identiskt svar)",
  JSON.stringify(mikroRapporter(KASSTRÖFEL)) === JSON.stringify(b26));

console.log("C — skicka/lasSenaste/korRunda UTAN konfig: fail-safe-kontrakten");
kontroll("C1 skicka ⇒ false (getSupabaseRest null — bussen tystar, kastar aldrig)",
  (await skicka({ fran: "Organ-A", till: "Organ-B", typ: "rapport", innehall: { status: "ok" } })) === false);
kontroll("C2 lasSenaste() ⇒ [] (fail-safe, aldrig null)", (await lasSenaste()) instanceof Array && (await lasSenaste()).length === 0);
kontroll("C3 lasSenaste(5) ⇒ [] (limit spelar ingen roll utan konfig)", (await lasSenaste(5)).length === 0);
const c4 = korRunda(HELT_OK);
kontroll("C4 korRunda ⇒ Promise (asynkron rond)", c4 instanceof Promise);
const rond = await c4;
kontroll("C5 rond levererar HELT RondResultat även utan konfig (skick-andet no-op)",
  typeof rond.timestamp === "string" && typeof rond.makroFråga === "string" && rond.rapporter.length === 5 && Array.isArray(rond.beslut) && Array.isArray(rond.delegationsKo));
kontroll("C6 timestamp är parsbar ISO-tid", !isNaN(Date.parse(rond.timestamp)));
kontroll('C7 makroFråga exakt "Rapportera mätt status + ett förslag för 10x-optimering"',
  rond.makroFråga === "Rapportera mätt status + ett förslag för 10x-optimering");
kontroll("C8 rapporter = mikroRapporter(samma signal), byte-identiskt",
  JSON.stringify(rond.rapporter) === JSON.stringify(mikroRapporter(HELT_OK)));

console.log("D — transportkontrakten under kontrollerad fetch-stub (fake-ref, ogiltig nyckel)");
// Miljön installeras MEDVETET här: projektref 'fake-ref' existerar inte och
// nyckeln är uppdiktad — dessutom ersätts global fetch av en stub som Registrar
// anropen och svarar deterministiskt. Riktigt nätverk kan INTE nås.
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://fake-ref.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "uppdiktad-testnyckel";
const RIKTIG_FETCH = globalThis.fetch;
let stubAnrop = [];
let stubSvar = () => ({ ok: true });
globalThis.fetch = async (url, init) => {
  stubAnrop.push({ url: String(url), init });
  return stubSvar();
};

const MEDD = { fran: "Organ-A", till: "Organ-B", typ: "fragor", innehall: { fraga: "Läge?" } };
stubAnrop = [];
const d1 = await skicka(MEDD);
kontroll("D1 skicka med konfig + ok-svar ⇒ true", d1 === true && stubAnrop.length === 1);
const a0 = stubAnrop[0];
kontroll("D2 URL exakt https://fake-ref.supabase.co/rest/v1/system_events",
  a0.url === "https://fake-ref.supabase.co/rest/v1/system_events");
kontroll("D3 method POST", a0.init.method === "POST");
kontroll("D4 headers: Content-Type json + Prefer return=minimal + apikey/Authorization från konfigen",
  a0.init.headers["Content-Type"] === "application/json" && a0.init.headers["Prefer"] === "return=minimal"
  && a0.init.headers["apikey"] === "uppdiktad-testnyckel" && a0.init.headers["Authorization"] === "Bearer uppdiktad-testnyckel");
const kropp = JSON.parse(a0.init.body);
kontroll('D5 kroppform: type "organ_msg", severity "info", source "organ-bus"',
  kropp.type === "organ_msg" && kropp.severity === "info" && kropp.source === "organ-bus");
kontroll("D6 details = HELA meddelandet (fran/till/typ/innehall intakta)",
  JSON.stringify(kropp.details) === JSON.stringify(MEDD));
kontroll('D7 message-prefix "[Organ-A→Organ-B:fragor] "',
  kropp.message.startsWith("[Organ-A→Organ-B:fragor] "));
kontroll("D8 kort innehåll ⇒ message = prefix + full JSON-serialisering",
  kropp.message === "[Organ-A→Organ-B:fragor] " + JSON.stringify(MEDD.innehall));
const LANGT = { text: "x".repeat(1000) };
stubAnrop = [];
await skicka({ fran: "Kurs-organet", till: "MAKRO-styrelsen", typ: "rapport", innehall: LANGT });
const langMsg = JSON.parse(stubAnrop[0].init.body).message;
kontroll("D9 långt innehåll ⇒ JSON-delen trunkerad vid exakt 300 tecken (bounded-meddelandet)",
  langMsg === "[Kurs-organet→MAKRO-styrelsen:rapport] " + JSON.stringify(LANGT).slice(0, 300));
stubSvar = () => ({ ok: false });
kontroll("D10 skicka med !ok-svar ⇒ false", (await skicka(MEDD)) === false);
stubSvar = () => { throw new Error("nätverket borta"); };
kontroll("D11 skicka när fetch kastar ⇒ false (try/catch-kontraktet — kastar ALDRIG)",
  (await skicka(MEDD)) === false);

stubSvar = () => ({ ok: true, json: async () => [
  { details: { fran: "A", till: "B", typ: "rapport", innehall: {} }, created_at: "2026-09-20T10:00:00Z" },
  { details: null, created_at: "2026-09-20T09:00:00Z" },
  { details: { till: "B" }, created_at: "2026-09-20T08:00:00Z" },
  { details: { fran: "C", till: "D", typ: "beslut", innehall: { ko: [] } }, created_at: "2026-09-20T07:00:00Z" },
] });
stubAnrop = [];
const d12 = await lasSenaste(7);
kontroll("D12 lasSenaste(7): GET-URL med type=eq.organ_msg + select + order + limit 7",
  stubAnrop[0].url === "https://fake-ref.supabase.co/rest/v1/system_events?type=eq.organ_msg&select=details,created_at&order=created_at.desc&limit=7"
  && stubAnrop[0].init.method === undefined);
kontroll("D13 vaktfilter: 2 av 4 rader överlever (details null + utan fran avvisas)",
  d12.length === 2 && d12[0].fran === "A" && d12[1].fran === "C");
stubAnrop = [];
await lasSenaste();
kontroll("D14 default-limit är 40 (URL:en bär limit=40)", stubAnrop[0].url.endsWith("limit=40"));
stubSvar = () => ({ ok: true, json: async () => null });
kontroll("D15 json ⇒ null ⇒ [] (|| []-vakten)", (await lasSenaste()).length === 0);
stubSvar = () => ({ ok: false, json: async () => [{ details: { fran: "A", till: "B" } }] });
kontroll("D16 !ok-svar ⇒ [] (aldrig delvis data)", (await lasSenaste()).length === 0);
stubSvar = () => { throw new Error("nätverket borta"); };
kontroll("D17 lasSenaste när fetch kastar ⇒ [] (try/catch-kontraktet)",
  (await lasSenaste()).length === 0);

console.log("E — korRunda under stub: ronden som protokoll (bounded + deterministisk)");
stubSvar = () => ({ ok: true });
stubAnrop = [];
const rondStor = await korRunda(KASSTRÖFEL);
kontroll("E1 exakt 7 transportanrop per rond (1 fråga + 5 rapporter + 1 delegation — bounded)",
  stubAnrop.length === 7);
const fraga = JSON.parse(stubAnrop[0].init.body);
kontroll('E2 anrop 1: frågan MAKRO-styrelsen→ALLA, typ "fragor"',
  stubAnrop[0].init.method === "POST" && fraga.details.fran === "MAKRO-styrelsen" && fraga.details.till === "ALLA" && fraga.details.typ === "fragor");
const rapportSender = stubAnrop.slice(1, 6).map((a) => JSON.parse(a.init.body).details.fran);
kontroll("E3 anrop 2-6: rapporter från vart och ett av de fem organen (i kärnans ordning)",
  JSON.stringify(rapportSender) === JSON.stringify(["Kurs-organet", "Blogg-organet", "Analys-organet", "Marknad-organet", "Retention-organet"]));
const delegation = JSON.parse(stubAnrop[6].init.body);
kontroll('E4 sista anropet: delegation MAKRO-styrelsen→BYGGAGENT med kön = beslutens titlar',
  delegation.details.till === "BYGGAGENT" && delegation.details.typ === "delegation"
  && JSON.stringify(delegation.details.innehall.ko) === JSON.stringify(rondStor.delegationsKo));
kontroll("E5 KASSTRÖFEL: beslut = de tre atgardar-organen (stabil ordning), score 30",
  rondStor.beslut.length === 3
  && JSON.stringify(rondStor.beslut.map((b) => b.alignatMed)) === JSON.stringify(["Blogg-organet", "Analys-organet", "Marknad-organet"])
  && rondStor.beslut.every((b) => b.score === 30));
kontroll("E6 KASSTRÖFEL: titlarna är förslag[0] från respektive organ",
  rondStor.beslut.every((b) => typeof b.titel === "string" && b.titel.length > 0));
const rondOk = await korRunda(HELT_OK);
kontroll("E7 HELT_OK: varning (retention, 20) prioriteras före ok-organen (10) — stabilt [Kurs, Blogg]",
  JSON.stringify(rondOk.beslut.map((b) => b.alignatMed)) === JSON.stringify(["Retention-organet", "Kurs-organet", "Blogg-organet"])
  && rondOk.beslut[0].score === 20 && rondOk.beslut[1].score === 10 && rondOk.beslut[2].score === 10);
kontroll("E8 delegationsKo = beslutens titlar i samma ordning",
  JSON.stringify(rondOk.delegationsKo) === JSON.stringify(rondOk.beslut.map((b) => b.titel)));
kontroll("E9 ronden är deterministisk i struktur: beslut/ko/rapporter överensstämmer med kärnan",
  JSON.stringify(rondStor.rapporter) === JSON.stringify(mikroRapporter(KASSTRÖFEL))
  && rondStor.beslut.length === rondStor.delegationsKo.length);

// ── kvitto ───────────────────────────────────────────────────────────────────
globalThis.fetch = RIKTIG_FETCH;
for (const [k, v] of Object.entries(SPARAD_ENV)) { if (v !== undefined) process.env[k] = v; }
for (const k of ENV_NYCKLAR) { if (SPARAD_ENV[k] === undefined) delete process.env[k]; }
const totalt = pass + fail;
console.log(`\nSVIT MOTOR ORGAN-BUS: ${pass} PASS / ${fail} FAIL av ${totalt} kontroller`);
console.log("RESULTAT: " + pass + "/" + totalt + " PASS");
process.exit(fail === 0 ? 0 : 1);
