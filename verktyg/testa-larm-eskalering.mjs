#!/usr/bin/env node
/**
 * Testsvit för verktyg/larm-eskalering.mjs — beslutstabellen mappad mot
 * VERKLIGA journalfall (kulturen från testa-kraschvakt.mjs):
 *   fall 1–4  = o22-natten 2026-09-15→16 (30 identiska SAKNAD-larm,
 *               22:49→03:49 Z, grön kur 03:54 Z — nivåerna bevisade mot
 *               dokumenterade tidpunkter i o22-vaktnat-halsa-s8.md)
 *   fall 5–12 = strukturgarantier (grön-avslut, återkomst, ackumulering,
 *               tysthet, skräprader, tröskel-override, grön-koppling)
 *   fall 13–20 = v2 (o26 §5:3): kraschvakt-loggmappning (o24:s radtyper,
 *               ARTEFAKT RÖD = 10:02-klassen, avstannad episod, tystnad-
 *               skillnaden mellan källorna) + kvalitetsrapportålder (o22:s
 *               mätblindhet) + per-käll-episodisolation.
 * Noll nätverk, noll child-processer; EN tmp-fil för lasRader-testet.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  byggEpisoder,
  bedomEpisod,
  bedomTysthet,
  lasRader,
  kopplaGronTillEpisoder,
  oversattKraschvaktRader,
  lasKvalitetsrapportTs,
  bedomKvalitetsrapport,
  markeraAvstannade,
} from "./larm-eskalering.mjs";

let pass = 0;
const misslyckade = [];
function koll(nr, vad, fn) {
  try {
    fn();
    pass += 1;
    console.log(`PASS ${nr}: ${vad}`);
  } catch (e) {
    misslyckade.push(nr);
    console.error(`FAIL ${nr}: ${vad} — ${String(e?.message ?? e).slice(0, 200)}`);
  }
}

// Fixturbyggare: konfig-vaktens journalschema.
const larm = (ts, medd = "SAKNAD crontab-rad: 30 2 * * * PGPASSFILE=... kolla-dump-markorer --natt") => ({ ts, niva: "larm", typ: "konfig-drift", omrade: "crontab", medd });
const gron = (ts) => ({ ts, niva: "gron", typ: "konfig-gron", medd: "GRÖN — crontab 2/2 · pm2 4/4 online" });
const Z = (iso) => Date.parse(iso);

// ═══ FALL 1–4: o22-natten (30 larm var 10:e min 22:49→03:49 Z, grön 03:54) ═══
const nattRader = [];
for (let i = 0; i < 30; i += 1) {
  const ts = new Date(Z("2026-09-15T22:49:00Z") + i * 10 * 60000).toISOString();
  nattRader.push(larm(ts));
}
nattRader.push(gron("2026-09-16T03:54:13Z"));

const nattEpisoder = byggEpisoder(nattRader);
koll(1, "o22-natten ⇒ EN episod med 30 upprepningar (journalens bevisvärde bevaras)", () => {
  assert.equal(nattEpisoder.aktiva.length, 0);
  assert.equal(nattEpisoder.klara.length, 1);
  assert.equal(nattEpisoder.klara[0].upprepningar, 30);
});

koll(2, "o22-natten vid 01:30 Z (2 h 41 m aktiv) ⇒ nivå 2 ESKALERING — verktyget hade ropat medan natten pågick", () => {
  const e = bedomEpisod({ ...nattEpisoder.klara[0], gronTs: null }, Z("2026-09-16T01:30:00Z"));
  assert.equal(e.status, "aktiv");
  assert.equal(e.niva, 2);
  assert.equal(e.etikett, "ESKALERING");
});

koll(3, "o22-natten vid 03:00 Z (4 h 11 m aktiv) ⇒ nivå 3 KRITISK — en timme före den manuella kuren 03:54 Z", () => {
  const e = bedomEpisod({ ...nattEpisoder.klara[0], gronTs: null }, Z("2026-09-16T03:00:00Z"));
  assert.equal(e.niva, 3);
  assert.equal(e.etikett, "KRITISK");
});

koll(4, "o22-natten uppklarad av grön 03:54 Z ⇒ HISTORIK-läxa (varade ≥ 60 min), inte aktivt larm", () => {
  const e = bedomEpisod({ ...nattEpisoder.klara[0], gronTs: "2026-09-16T03:54:13Z" });
  assert.equal(e.status, "uppklarad");
  assert.equal(e.niva, 0);
  assert.equal(e.etikett, "HISTORIK");
  assert.equal(e.historik, true);
  assert.equal(e.varaktighetMin, 305); // 22:49→03:54 = 5 h 05
});

// ═══ FALL 5–12: strukturgarantier ═══

koll(5, "enkel avvikelse + grön 10 min senare ⇒ uppklarad utan historik (normalfallet)", () => {
  const ep = byggEpisoder([larm("2026-09-16T05:00:00Z"), gron("2026-09-16T05:10:00Z")]);
  const e = bedomEpisod({ ...ep.klara[0], gronTs: "2026-09-16T05:10:00Z" });
  assert.equal(e.status, "uppklarad");
  assert.equal(e.historik, false);
  assert.equal(e.varaktighetMin, 10);
});

koll(6, "aktiv episod 35 min ⇒ nivå 1 VARNING (vakten slagit larm utan kur)", () => {
  const ep = byggEpisoder([larm("2026-09-16T05:00:00Z"), larm("2026-09-16T05:20:00Z")]);
  const e = bedomEpisod(ep.aktiva[0], Z("2026-09-16T05:35:00Z"));
  assert.equal(e.niva, 1);
  assert.equal(e.etikett, "VARNING");
});

koll(7, "två nycklar alternerar utan grön ⇒ varsin episod ackumulerar (samma ouppklarade fönster)", () => {
  const rader = [larm("2026-09-16T05:00:00Z", "A"), larm("2026-09-16T05:10:00Z", "B"), larm("2026-09-16T05:20:00Z", "A")];
  const ep = byggEpisoder(rader);
  assert.equal(ep.aktiva.length, 2);
  const a = ep.aktiva.find((x) => x.nyckel.includes("|A"));
  assert.equal(a.upprepningar, 2);
  assert.equal(ep.aktiva.find((x) => x.nyckel.includes("|B")).upprepningar, 1);
});

koll(8, "nyckel återkommer EFTER grön ⇒ ny episod (räknaren nollställs)", () => {
  const rader = [larm("2026-09-16T05:00:00Z"), gron("2026-09-16T05:10:00Z"), larm("2026-09-16T07:00:00Z")];
  const ep = byggEpisoder(rader);
  assert.equal(ep.klara.length, 1);
  assert.equal(ep.aktiva.length, 1);
  assert.equal(ep.aktiva[0].upprepningar, 1);
  assert.equal(ep.aktiva[0].forstaTs, "2026-09-16T07:00:00Z"); // in-strängen bevaras ordagrant
});

koll(9, "vakt-tysthet 40 min (tröskel 25) ⇒ nivå 1; 90 min ⇒ nivå 2 — mätblindhet syns", () => {
  const nyligen = bedomTysthet("2026-09-16T05:30:00Z", Z("2026-09-16T06:10:00Z"));
  assert.equal(nyligen.tyst, true);
  assert.equal(nyligen.niva, 1);
  const lange = bedomTysthet("2026-09-16T04:40:00Z", Z("2026-09-16T06:10:00Z"));
  assert.equal(lange.niva, 2);
  const frisk = bedomTysthet("2026-09-16T06:05:00Z", Z("2026-09-16T06:10:00Z"));
  assert.equal(frisk.tyst, false);
  assert.equal(bedomTysthet(null, Z("2026-09-16T06:10:00Z")).niva, 3);
});

koll(10, "lasRader tåler skräprader och rader utan ts (journalens ärr hoppar)", () => {
  const tmp = path.join(os.tmpdir(), `larm-esk-test-${process.pid}.jsonl`);
  fs.writeFileSync(tmp, ['{"ts":"2026-09-16T05:00:00Z","niva":"larm","typ":"t","medd":"m"}', "inte json alls", '{"niva":"larm"}', "", '{"ts":"2026-09-16T05:10:00Z","niva":"gron","typ":"t","medd":"g"}'].join("\n"));
  const rader = lasRader(tmp);
  fs.rmSync(tmp, { force: true });
  assert.equal(rader.length, 2);
  assert.equal(lasRader("/finns/ej/fil.jsonl").length, 0);
});

koll(11, "kopplaGronTillEpisoder: episoden får FÖRSTA grön-rad efter sitt sista larm", () => {
  const rader = [larm("2026-09-16T05:00:00Z"), gron("2026-09-16T05:10:00Z"), larm("2026-09-16T07:00:00Z"), gron("2026-09-16T07:10:00Z")];
  const ep = byggEpisoder(rader);
  kopplaGronTillEpisoder(ep, rader);
  assert.equal(ep.klara.length, 2);
  const gronTsSet = new Set(ep.klara.map((e) => e.gronTs));
  assert.equal(gronTsSet.has("2026-09-16T05:10:00Z"), true); // in-strängen bevaras ordagrant
  const allaGröna = ep.klara.filter((e) => e.gronTs !== null).length;
  assert.equal(allaGröna, 2);
});

koll(12, "tröskel-override fungerar (kortare gränser för snabba cyklar)", () => {
  const granser = { varningMin: 5, eskaleringMin: 10, kritiskMin: 20, maxTystMin: 5 };
  const ep = byggEpisoder([larm("2026-09-16T05:00:00Z")]);
  const e = bedomEpisod(ep.aktiva[0], Z("2026-09-16T05:22:00Z"), granser);
  assert.equal(e.niva, 3);
  assert.equal(bedomEpisod(ep.aktiva[0], Z("2026-09-16T05:07:00Z"), granser).niva, 1);
});

// ═══ FALL 13–20: v2 — kraschvakt-källan + kvalitetsrapportålder (o26 §5:3) ═══

// Fixturer ur VERKLIGA kraschvakt.log-rader (2026-09-16-fönstret, o24-format).
const KRASCH_LOGG = [
  "2026-09-16T04:14:21.100Z kooldown 90 min (av 120) — svarar=true status=online omstarter+0", // neutral
  "2026-09-16T04:24:21.211Z KRASCHLOOP-MISSTANKE: svarar=false status=online omstarter +0 ⇒ RÄDDNINGSBYGG", // larm
  "2026-09-16T04:26:10.000Z RÄDDNINGSBYGG MISSLYCKADES: EACCES — next run försöker igen", // larm (förlänger)
  "2026-09-16T04:27:55.063Z RÄDDNING KLAR: appen svarar=true (mål: kunden märker max ~10-15 min)", // GRÖN
  "2026-09-16T05:00:00.000Z TRANSIENT LAST: svarar=false vid 1:a koll, grön vid 2:a — ingen åtgärd", // neutral
  "2026-09-16T05:05:00.000Z SVARAR INTE 2 GÅNGER men status=online omstarter +1 ⇒ PM2-RESTART (bygge ej motiverat ännu)", // larm
  "2026-09-16T05:06:00.000Z PM2-RESTART LÄKTE appen — räddningsbygge onödigt (våg 137-bygget sparat)", // GRÖN
  "2026-09-16T05:10:00.000Z PM2-RESTART RÄCKTE INTE ⇒ räddningsbygg", // larm
  "2026-09-16T05:12:00.000Z ARTEFAKT RÖD efter räddningsbygget — statisk sond FEL 12/25 · appen startas men läget är INTE läkt", // larm (10:02-klassen)
  "2026-09-16T05:13:00.000Z DEPLOY PÅGÅR (låset upptaget): svarar=false — räddning avvaktar, appen startas av deployn", // neutral
  "2026-09-16T05:14:00.000Z ARTEFAKT GRÖN efter räddningsbygget — statisk sond 25/25", // neutral (GRÖN-artefakt = frisk info)
  "inte en loggrad alls",
  "",
].join("\n");

koll(13, "översättning: klass + nivå per radtyp ur verkliga loggrader, neutrala hoppas men räknas", () => {
  const o = oversattKraschvaktRader(KRASCH_LOGG);
  assert.equal(o.raderTotalt, 11); // 11 tidsstämplade rader (skräp+tom hoppas)
  const klasser = o.rader.map((r) => `${r.omrade}:${r.niva}`);
  assert.deepEqual(klasser, [
    "kraschloop-misstanke:larm",
    "raddningsbygg-misslyckades:larm",
    "raddning-klar:gron",
    "svarar-inte-2-ganger:larm",
    "pm2-restart-lakte:gron",
    "pm2-restart-rackte-inte:larm",
    "artefakt-rod:larm",
  ]);
  assert.equal(o.senasteRadTs, "2026-09-16T05:14:00.000Z"); // neutral rad ÄR pulsen
});

koll(14, "kraschvakt-episoder: varje händelseklass = egen episod; RÄDDNING KLAR/LÄKTE avslutar med ärlig varaktighet", () => {
  const o = oversattKraschvaktRader(KRASCH_LOGG);
  const ep = byggEpisoder(o.rader);
  // Klara (3): kraschloop-misstanke (04:24→04:27) · raddningsbygg-misslyckades
  // (04:26→04:27) · svarar-inte-2-ganger (05:05→05:06). Aktiva (2):
  // pm2-restart-rackte-inte + artefakt-rod — ingen grön efter 05:12.
  assert.equal(ep.aktiva.length, 2);
  assert.equal(ep.klara.length, 3);
  const misslyckades = ep.klara.find((e) => e.nyckel.includes("raddningsbygg-misslyckades"));
  kopplaGronTillEpisoder(ep, o.rader);
  const e = bedomEpisod(misslyckades, Z("2026-09-16T12:00:00Z"));
  assert.equal(e.status, "uppklarad");
  assert.equal(e.varaktighetMin, 2); // 04:26:10→04:27:55 = 1 m 45 s ⇒ 2 (avrundat) — ärlig kort kur
});

koll(15, "ARTEFAKT RÖD som pågående läge eskalerar över tid (10:02-klassen hade ropat inom en timme)", () => {
  const o = oversattKraschvaktRader("2026-09-16T10:04:00.000Z ARTEFAKT RÖD efter räddningsbygget — statisk sond FEL 12/25");
  const ep = byggEpisoder(o.rader);
  assert.equal(ep.aktiva.length, 1);
  const efter62min = bedomEpisod(ep.aktiva[0], Z("2026-09-16T11:06:00Z"));
  assert.equal(efter62min.niva, 2); // ESKALERING — 10:02-incidenten varade ~2 h kundsynligt
  assert.equal(efter62min.status, "aktiv");
});

koll(16, "avstannad episod: aktiv räddning + loggen tyst > maxTystMin ⇒ nivå minst 2 + AVSTANNAD-etikett", () => {
  const ep = byggEpisoder([{ ts: "2026-09-16T04:24:00Z", niva: "larm", typ: "kraschvakt", omrade: "x", medd: "x" }]);
  const bedomd = [bedomEpisod(ep.aktiva[0], Z("2026-09-16T04:30:00Z"))]; // 6 min aktiv = nivå 0
  const m = markeraAvstannade(bedomd, "2026-09-16T04:24:00Z", Z("2026-09-16T04:55:00Z")); // loggen tyst i 31 min
  assert.equal(m[0].avstannad, true);
  assert.equal(m[0].niva, 2); // höjd från 0 — avstannad är ALDRIG bara nivå 0
  assert.match(m[0].etikett, /AVSTANNAD/);
  // Frisk puls (5 min sedan senaste rad) ⇒ ingen markering
  const frisk = markeraAvstannade(bedomd, "2026-09-16T04:50:00Z", Z("2026-09-16T04:55:00Z"));
  assert.equal(frisk[0].avstannad, undefined);
});

koll(17, "kraschvakt-tystnad UTAN aktiv episod är NORMALT (pass-läge loggar tyst) — skillnaden mot konfig-källan", () => {
  const o = oversattKraschvaktRader("2026-09-16T10:14:13.683Z kooldown 113 min (av 120) — svarar=true status=online omstarter+0");
  const ep = byggEpisoder(o.rader);
  assert.equal(ep.aktiva.length, 0); // inga episoder ⇒ inga avstannade, hur gammal loggen än är
  const m = markeraAvstannade([], "2026-09-16T10:14:13.683Z", Z("2026-09-16T23:00:00Z"));
  assert.equal(m.length, 0);
});

koll(18, "lasKvalitetsrapportTs läser Genererad-radens ts; saknad fil/ogiltig ts ⇒ null", () => {
  const tmp = path.join(os.tmpdir(), `larm-esk-kval-${process.pid}.md`);
  fs.writeFileSync(tmp, "# KVALITETSVAKTEN — 2026-09-16\n\n- **Genererad:** 2026-09-16T03:53:40.312Z (node v22.23.2 på linux)\n");
  assert.equal(lasKvalitetsrapportTs(tmp), "2026-09-16T03:53:40.312Z");
  fs.writeFileSync(tmp, "# ingen ts-rad alls");
  assert.equal(lasKvalitetsrapportTs(tmp), null);
  fs.rmSync(tmp, { force: true });
  assert.equal(lasKvalitetsrapportTs("/finns/ej/rapport.md"), null);
});

koll(19, "kvalitetsrapportålder: färsk OK · 27 h VARNING · 55 h ESKALERING · 180 h KRITISK · null = KRITISK (kan inte mäta ≠ frisk)", () => {
  const nu = Z("2026-09-17T07:00:00Z");
  assert.equal(bedomKvalitetsrapport("2026-09-17T05:00:00Z", nu).niva, 0); // 2 h färsk
  assert.equal(bedomKvalitetsrapport("2026-09-16T03:53:40Z", nu).niva, 1); // 27,1 h
  assert.equal(bedomKvalitetsrapport("2026-09-14T23:00:00Z", nu).niva, 2); // 56 h
  assert.equal(bedomKvalitetsrapport("2026-09-09T19:00:00Z", nu).niva, 3); // 180 h = o22-veckan
  const blind = bedomKvalitetsrapport(null, nu);
  assert.equal(blind.niva, 3);
  assert.match(blind.orsak, /aldrig frisk/);
});

koll(20, "per-käll-episodisolation: konfig-källans GRÖN stänger INTE kraschvakt-episoder (olika byggEpisoder-anrop)", () => {
  const konfig = byggEpisoder([
    { ts: "2026-09-16T05:00:00Z", niva: "larm", typ: "k", omrade: "c", medd: "A" },
    { ts: "2026-09-16T05:10:00Z", niva: "gron", typ: "k", omrade: "g", medd: "G" },
  ]);
  const krasch = byggEpisoder([{ ts: "2026-09-16T05:05:00Z", niva: "larm", typ: "kraschvakt", omrade: "artefakt-rod", medd: "artefakt-rod" }]);
  assert.equal(konfig.klara.length, 1); // konfigens larm stängdes av sin egen grön
  assert.equal(krasch.aktiva.length, 1); // kraschvaktens episod lever oberörd
});

// ═══ SAMMANFATTNING ═══
console.log(`\n${pass}/20 PASS${misslyckade.length ? ` · MISSLYCKADE: ${misslyckade.join(", ")}` : " (ALLA PASS)"}`);
process.exit(misslyckade.length === 0 ? 0 : 1);
