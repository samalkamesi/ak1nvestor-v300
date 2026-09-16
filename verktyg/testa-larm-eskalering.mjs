#!/usr/bin/env node
/**
 * Testsvit för verktyg/larm-eskalering.mjs — beslutstabellen mappad mot
 * VERKLIGA journalfall (kulturen från testa-kraschvakt.mjs):
 *   fall 1–4  = o22-natten 2026-09-15→16 (30 identiska SAKNAD-larm,
 *               22:49→03:49 Z, grön kur 03:54 Z — nivåerna bevisade mot
 *               dokumenterade tidpunkter i o22-vaktnat-halsa-s8.md)
 *   fall 5–12 = strukturgarantier (grön-avslut, återkomst, ackumulering,
 *               tysthet, skräprader, tröskel-override, grön-koppling)
 * Noll nätverk, noll child-processer; EN tmp-fil för lasRader-testet.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { byggEpisoder, bedomEpisod, bedomTysthet, lasRader, kopplaGronTillEpisoder } from "./larm-eskalering.mjs";

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

// ═══ SAMMANFATTNING ═══
console.log(`\n${pass}/12 PASS${misslyckade.length ? ` · MISSLYCKADE: ${misslyckade.join(", ")}` : " (ALLA PASS)"}`);
process.exit(misslyckade.length === 0 ? 0 : 1);
