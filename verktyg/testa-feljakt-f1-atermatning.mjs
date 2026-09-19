#!/usr/bin/env node
/**
 * TEST: F1-syntaxens återmätningsgren (o80 — aktivt-skrivfönster-klassen)
 * =====================================================================
 * Verifierar jagaVerktygSyntax i feljagaren.mjs med injicerade beroenden
 * (inga riktiga filer rörs, journalen orörd):
 *   A återhämtad   — kontroll faller en gång, passar vid återmätning ⇒
 *                    INGEN syntaxfels-bokföring, grön skrivfönster-not,
 *                    sov kallad exakt en gång, retur 0
 *   B bestående    — kontroll faller båda gångerna ⇒ syntaxfel bokförs med
 *                    "återmätning" i beviset, retur 1
 *   C ren          — kontroll passerar direkt ⇒ ingen bokföring, ingen sov,
 *                    total grön rad, retur 0
 *   D timeout      — fel med killed=true ⇒ "okontrollerad (timeout)" utan
 *                    återmätning (sov ej kallad), räknas ej som trasig
 *   E blandat      — ren + återhämtad + bestående i samma sväng ⇒ exakt ett
 *                    syntaxfel, totalrad uteblir (trasiga > 0), retur 1
 * Körs: node verktyg/testa-feljakt-f1-atermatning.mjs — "N/N PASS" = grönt.
 */
import { jagaVerktygSyntax } from "./feljagaren.mjs";

let pass = 0;
let fail = 0;

function kontrollMed(uppforande) {
  // uppforande: karta filsökväg → array av { ok } (sista gäller för extra anrop)
  const visade = {};
  return async (fil) => {
    const seq = uppforande[fil] || [{ ok: true }];
    const i = visade[fil] || 0;
    visade[fil] = i + 1;
    const steg = seq[Math.min(i, seq.length - 1)];
    if (!steg.ok) {
      const e = new Error("node --check misslyckades (test)");
      if (steg.timeout) { e.killed = true; e.signal = "SIGTERM"; }
      throw e;
    }
  };
}

function spion() {
  const bokforda = [];
  const grona = [];
  return {
    bokforda,
    grona,
    bokfor: (spar, allvar, fynd, bevis) => bokforda.push({ spar, allvar, fynd, bevis }),
    gron: (spar, not) => grona.push({ spar, not }),
  };
}

async function fall(namn, kor) {
  try {
    await kor();
    pass++;
    console.log(`  PASS ${namn}`);
  } catch (e) {
    fail++;
    console.error(`  FALLERAT ${namn}: ${e.message}`);
  }
}

function assert(villkor, meddelande) { if (!villkor) throw new Error(meddelande); }

console.log("TEST F1-ÅTERMÄTNING (o80) — jagaVerktygSyntax med injicerade beroenden");

await fall("A: återhämtad vid återmätning ⇒ inget fynd (aktivt skrivfönster)", async () => {
  let sovade = 0;
  const s = spion();
  const n = await jagaVerktygSyntax(["verktyg/x.mjs"], {
    kontroll: kontrollMed({ "verktyg/x.mjs": [{ ok: false }, { ok: true }] }),
    sov: async () => { sovade++; },
    bokfor: s.bokfor,
    gron: s.gron,
  });
  assert(n === 0, `retur ${n} ≠ 0`);
  assert(s.bokforda.length === 0, `bokförde ${s.bokforda.length} rader, väntade 0`);
  assert(s.grona.some((g) => g.not.includes("återhämtad vid återmätning")), "grön skrivfönster-not saknas");
  assert(sovade === 1, `sov ${sovade} ggr, väntade 1`);
});

await fall("B: bestående fel ⇒ syntaxfel bokförs med återmätningsbevis", async () => {
  const s = spion();
  const n = await jagaVerktygSyntax(["verktyg/y.mjs"], {
    kontroll: kontrollMed({ "verktyg/y.mjs": [{ ok: false }, { ok: false }] }),
    sov: async () => {},
    bokfor: s.bokfor,
    gron: s.gron,
  });
  assert(n === 1, `retur ${n} ≠ 1`);
  assert(s.bokforda.length === 1, `bokförde ${s.bokforda.length} rader, väntade 1`);
  const rad = s.bokforda[0];
  assert(rad.spar === "F1-kod" && rad.allvar === "MEDEL", `fel spår/allvar: ${rad.spar}/${rad.allvar}`);
  assert(rad.fynd === "syntaxfel: verktyg/y.mjs", `fel fyndtext: ${rad.fynd}`);
  assert(rad.bevis.includes("återmätning"), `bevis nämner ej återmätning: ${rad.bevis}`);
});

await fall("C: ren fil ⇒ ingen bokföring, ingen väntan, total grön rad", async () => {
  let sovade = 0;
  const s = spion();
  const n = await jagaVerktygSyntax(["verktyg/z.mjs"], {
    kontroll: kontrollMed({}),
    sov: async () => { sovade++; },
    bokfor: s.bokfor,
    gron: s.gron,
  });
  assert(n === 0, `retur ${n} ≠ 0`);
  assert(s.bokforda.length === 0 && sovade === 0, "bokförde/väntade trots ren fil");
  assert(s.grona.some((g) => g.not === "1 verktyg syntax-OK"), "total grön rad saknas");
});

await fall("D: timeout-fel ⇒ okontrollerad-rad UTAN återmätning, ej trasig", async () => {
  let sovade = 0;
  const s = spion();
  const n = await jagaVerktygSyntax(["verktyg/t.mjs"], {
    kontroll: kontrollMed({ "verktyg/t.mjs": [{ ok: false, timeout: true }] }),
    sov: async () => { sovade++; },
    bokfor: s.bokfor,
    gron: s.gron,
  });
  assert(n === 0, `retur ${n} ≠ 0 (timeout räknas ej som trasig)`);
  assert(sovade === 0, "timeout skall inte trigga återmätning");
  assert(s.bokforda.length === 1 && s.bokforda[0].fynd.includes("okontrollerad (timeout)"), "timeout-rad saknas/fel");
  assert(s.grona.some((g) => g.not === "1 verktyg syntax-OK"), "total grön rad saknas trots 0 trasiga");
});

await fall("E: blandad sväng ⇒ exakt ett syntaxfel, totalrad uteblir", async () => {
  const s = spion();
  const n = await jagaVerktygSyntax(["verktyg/a.mjs", "verktyg/b.mjs", "verktyg/c.mjs"], {
    kontroll: kontrollMed({
      "verktyg/a.mjs": [{ ok: true }],
      "verktyg/b.mjs": [{ ok: false }, { ok: true }],
      "verktyg/c.mjs": [{ ok: false }, { ok: false }],
    }),
    sov: async () => {},
    bokfor: s.bokfor,
    gron: s.gron,
  });
  assert(n === 1, `retur ${n} ≠ 1`);
  assert(s.bokforda.length === 1 && s.bokforda[0].fynd === "syntaxfel: verktyg/c.mjs", "endast c.mjs skall bokföras som syntaxfel");
  assert(!s.grona.some((g) => g.not === "3 verktyg syntax-OK"), "total grön rad skall utebli vid trasig fil");
  assert(s.grona.some((g) => g.not.includes("verktyg/b.mjs")), "b.mjs skrivfönster-not saknas");
});

console.log(`\n${pass}/${pass + fail} PASS ${fail === 0 ? "— GRÖN" : "— RÖD"}`);
process.exitCode = fail === 0 ? 0 : 1;
